// CloneX Authentication Hook - Cookie-Based SSO (Backend Bible v3.5.2)
//
// Uses global Zustand store for shared auth state across all components.
// Per Backend Bible v3.5.2, authentication uses httpOnly cookies:
// - No localStorage token storage needed (backend handles cookies)
// - Session validation via GET /api/auth/session (cookie sent automatically)
// - Login via POST /api/auth/wallet/verify (sets cookie)
// - Logout via POST /api/auth/logout (clears cookie)
//
// PHASE-0 FIX: Uses canonical authStatus state machine to prevent race conditions
// State flow: booting -> idle/wallet_connected -> authenticating -> loading_nfts -> ready

import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useAuthStore, AuthStatus } from '../stores/authStore';
import { authService } from '../services/authService';
import { AuthUser, NFTVerificationResponse } from '../config/api';

// Module-level guards to survive React Strict Mode remounts
let globalBootstrapComplete = false;
let globalSessionCheckInProgress = false;

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  nftData: NFTVerificationResponse | null;
  // Phase-0 Fix: Canonical auth status
  authStatus: AuthStatus;
}

interface AuthActions {
  login: () => Promise<void>;
  logout: () => void;
  disconnectWallet: () => void;
  refreshNFTs: () => Promise<void>;
  clearError: () => void;
  checkSessionStatus: () => Promise<boolean>;
}

export const useCloneXAuth = (): AuthState & AuthActions => {
  // *** CRITICAL: Use global Zustand store for shared state ***
  // This ensures ALL components (NavigationBar, AppContent, Modal) see the same state
  const {
    user,
    nftData,
    isAuthenticated,
    authToken,
    isLoading,
    error,
    authStatus,
    setUser,
    setNFTData,
    setAuthenticated,
    setLoading,
    setError,
    setConnected,
    transitionTo,
    logout: storeLogout,
    isTokenValid
  } = useAuthStore();

  const { address, isConnected, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Phase-0 Fix: Re-entry guards to prevent duplicate operations
  // Note: Bootstrap guards are now module-level to survive React Strict Mode remounts
  const loginInProgress = useRef<boolean>(false);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Check if user is authenticated (cookie-based session validation)
  // Per Backend Bible v3.5.2, uses GET /api/auth/session with httpOnly cookie
  // PHASE-0 FIX: Uses re-entry guard and state machine transitions
  // NOTE: This function does NOT depend on isConnected to avoid stale closures
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    // Re-entry guard: prevent concurrent session checks
    if (sessionCheckInProgress.current) {
      console.log('🔒 [checkSessionStatus] Already in progress, skipping');
      return false;
    }

    sessionCheckInProgress.current = true;

    try {
      console.log('🍪 [checkSessionStatus] Starting cookie validation...');

      // Cookie is sent automatically with credentials: 'include'
      const sessionResponse = await authService.validateSession();
      console.log('🍪 [checkSessionStatus] API response:', JSON.stringify(sessionResponse, null, 2));

      if (sessionResponse.authenticated && sessionResponse.user) {
        console.log('✅ [checkSessionStatus] Session valid! Setting user:', sessionResponse.user.walletAddress);
        setUser(sessionResponse.user);
        setAuthenticated(true);
        setConnected(true, sessionResponse.user.walletAddress);
        // Transition to ready (session exists, no need to load NFTs separately on restore)
        transitionTo('ready');
        console.log('✅ [checkSessionStatus] Transitioned to ready');
        return true;
      } else {
        console.log('❌ [checkSessionStatus] No valid session, transitioning to idle');
        setUser(null);
        setAuthenticated(false);
        // Always transition to 'idle' here - the wallet sync effect will
        // transition to 'wallet_connected' if a wallet is connected
        transitionTo('idle');
        return false;
      }
    } catch (err) {
      console.error('⚠️ [checkSessionStatus] Exception:', err);
      setUser(null);
      setAuthenticated(false);
      transitionTo('idle');
      return false;
    } finally {
      sessionCheckInProgress.current = false;
    }
  }, [setUser, setAuthenticated, setConnected, transitionTo]);

  // Refresh NFT data - stores in global Zustand store for all components
  // PHASE-0 FIX: Uses state machine transitions
  const refreshNFTs = useCallback(async () => {
    if (!address || !isAuthenticated) {
      console.warn('Cannot refresh NFTs: no address or not authenticated');
      return;
    }

    const previousStatus = authStatus;
    transitionTo('loading_nfts');
    setError(null);

    try {
      const nftResponse = await authService.verifyNFTs(address);

      if (nftResponse.success) {
        setNFTData(nftResponse);

        // Update user with collections and access level from NFT verification
        if (user) {
          setUser({
            ...user,
            accessLevel: nftResponse.accessLevel,
            collections: {
              clonex: nftResponse.nftCollections?.clonex?.count || 0,
              animus: nftResponse.nftCollections?.animus?.count || 0,
              animus_eggs: nftResponse.nftCollections?.animus_eggs?.count || 0,
              clonex_vials: nftResponse.nftCollections?.clonex_vials?.count || 0
            }
          } as AuthUser);
        }

        transitionTo('ready');

        console.log('✅ NFT verification completed and stored globally:', {
          accessLevel: nftResponse.accessLevel,
          collections: nftResponse.nftCollections
        });
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ NFT verification failed:', errorMessage);
      // Return to previous ready state with error
      transitionTo('ready', { error: `NFT verification failed: ${errorMessage}` });
    }
  }, [address, isAuthenticated, authStatus, user, setUser, setNFTData, setError, transitionTo]);

  // Main login function - Cookie-based authentication (Backend Bible v3.5.2)
  // Flow: nonce -> sign -> verify (backend sets httpOnly cookie) -> fetch NFTs -> ready
  // PHASE-0 FIX: Strict pipeline with try/catch/finally and re-entry guard
  const login = useCallback(async () => {
    // Re-entry guard: prevent concurrent login attempts
    if (loginInProgress.current) {
      console.log('🔒 [login] Already in progress, skipping');
      return;
    }

    if (!address || !isConnected) {
      setError('Wallet not connected');
      return;
    }

    loginInProgress.current = true;
    transitionTo('authenticating');
    setError(null);

    try {
      console.log('🔐 [login] Starting cookie-based authentication for:', address);

      // Step 1: Generate nonce
      const nonceResponse = await authService.generateNonce(address);
      console.log('📝 [login] Nonce generated:', nonceResponse.nonce);

      // Step 2: Sign challenge message
      console.log('✍️ [login] Requesting signature for message...');
      const signature = await signMessageAsync({
        message: nonceResponse.message
      });
      console.log('✅ [login] Message signed successfully');

      // Step 3: Verify signature - backend sets httpOnly cookie automatically
      console.log('🔐 [login] Sending signature to backend for verification...');
      const authResponse = await authService.verifySignature(
        address,
        signature,
        nonceResponse.nonce
      );

      if (!authResponse.success) {
        throw new Error('Authentication failed');
      }

      console.log('🍪 [login] Authentication successful! Cookie set by backend.');

      // Update auth state
      setUser(authResponse.user);
      setAuthenticated(true);
      setConnected(true, address);

      // Step 4: Load NFT data
      transitionTo('loading_nfts');
      console.log('🔬 [login] Loading NFT data...');

      try {
        const nftResponse = await authService.verifyNFTs(address);

        if (nftResponse.success) {
          setNFTData(nftResponse);

          // Update user with access level and collection counts
          setUser({
            ...authResponse.user,
            accessLevel: nftResponse.accessLevel,
            collections: {
              clonex: nftResponse.nftCollections?.clonex?.count || 0,
              animus: nftResponse.nftCollections?.animus?.count || 0,
              animus_eggs: nftResponse.nftCollections?.animus_eggs?.count || 0,
              clonex_vials: nftResponse.nftCollections?.clonex_vials?.count || 0
            }
          });

          console.log('✅ [login] NFT verification completed:', {
            totalNFTs: nftResponse.totalNFTs || nftResponse.nfts?.length || 0,
            collections: nftResponse.collections
          });
        }
      } catch (nftError) {
        console.warn('⚠️ [login] NFT verification failed (continuing with basic access):', nftError);
        // Don't fail login if NFT verification fails - still transition to ready
      }

      // Final state: ready - use direct store access to ensure it happens
      console.log('🏁 [login] About to transition to ready...');
      useAuthStore.getState().transitionTo('ready');
      console.log('✅ [login] Complete - transitioned to ready, authStatus is now:', useAuthStore.getState().authStatus);

    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ [login] Authentication failed:', errorMessage);

      // Handle user rejection gracefully
      if (errorMessage.includes('rejected') || errorMessage.includes('denied') || errorMessage.includes('User rejected')) {
        transitionTo('wallet_connected', { error: 'Signature rejected - authentication cancelled' });
      } else {
        transitionTo('wallet_connected', { error: `Authentication failed: ${errorMessage}` });
      }
    } finally {
      loginInProgress.current = false;
    }
  }, [address, isConnected, signMessageAsync, setUser, setAuthenticated, setConnected, setNFTData, setError, transitionTo]);

  // Logout function - clears cookie session AND disconnects wallet
  // PHASE-0 FIX: Resets all guards
  const logout = useCallback(async () => {
    console.log('🚪 [logout] Logging out (cookie-based)...');

    try {
      // Call logout endpoint - this clears the httpOnly cookie
      await authService.logout();
      console.log('🍪 [logout] Cookie cleared by backend');
    } catch (err) {
      console.warn('⚠️ [logout] API call failed (continuing with local cleanup):', err);
    }

    // Reset global Zustand store - this triggers re-render in all subscribed components
    // Note: storeLogout already sets authStatus to 'idle'
    storeLogout();

    // Disconnect wallet
    disconnect();

    // Reset all guards (including module-level ones for fresh login after logout)
    globalBootstrapComplete = false;
    globalSessionCheckInProgress = false;
    loginInProgress.current = false;

    console.log('✅ [logout] Complete');
  }, [storeLogout, disconnect]);

  // Disconnect wallet only - does NOT clear session
  const disconnectWallet = useCallback(() => {
    console.log('🔌 Disconnecting wallet only (keeping session if valid)...');
    disconnect();
    console.log('✅ Wallet disconnected');
  }, [disconnect]);

  // Sync wallet connection state to store and update authStatus
  // PHASE-0 FIX: Only sync, don't trigger side effects
  // PHASE-0 FIX #2: Use refs to avoid dependency loop causing duplicate transitions
  const prevIsConnected = useRef<boolean | null>(null);
  useEffect(() => {
    setConnected(isConnected, address || undefined);

    // Only transition if isConnected actually changed (not just on authStatus changes)
    const connectionChanged = prevIsConnected.current !== null && prevIsConnected.current !== isConnected;
    prevIsConnected.current = isConnected;

    if (!connectionChanged) return;

    // Update authStatus when wallet connection changes (but not during auth flow)
    const currentAuthStatus = useAuthStore.getState().authStatus;
    if (currentAuthStatus === 'idle' && isConnected) {
      transitionTo('wallet_connected');
    } else if (currentAuthStatus === 'wallet_connected' && !isConnected) {
      transitionTo('idle');
    }
  }, [isConnected, address, setConnected, transitionTo]);

  // Safety timeout: Ensure loading state clears after max 10 seconds
  // This prevents permanent loading state if something goes wrong
  // PHASE-0 FIX: Uses authStatus instead of isLoading
  // IMPORTANT: Check current store state inside timeout to avoid stale closure
  // Also skip if bootstrap is still in progress (API call may be slow)
  useEffect(() => {
    const loadingStatuses: AuthStatus[] = ['booting', 'authenticating', 'loading_nfts'];
    if (!loadingStatuses.includes(authStatus)) {
      return; // Not in a loading state, no timeout needed
    }

    const safetyTimeout = setTimeout(() => {
      // Skip if bootstrap is still in progress
      if (globalSessionCheckInProgress) {
        console.log('⏳ [Safety] Timeout skipped - bootstrap API call still in progress');
        return;
      }

      // Check CURRENT state - not the captured authStatus from when timeout was set
      const currentStatus = useAuthStore.getState().authStatus;
      const currentConnected = useAuthStore.getState().isConnected;

      // Only force transition if still in a loading state
      if (loadingStatuses.includes(currentStatus)) {
        console.warn('⚠️ [Safety] Timeout: Forcing transition from', currentStatus, 'to idle after 10s');
        useAuthStore.getState().transitionTo(currentConnected ? 'wallet_connected' : 'idle');
      } else {
        console.log('✅ [Safety] Timeout cancelled - already transitioned to:', currentStatus);
      }
    }, 10000); // Increased to 10 seconds to allow for slow API responses

    return () => clearTimeout(safetyTimeout);
  }, [authStatus]);

  // Bootstrap: Check cookie session ONCE on mount
  // PHASE-0 FIX: Uses module-level guards to survive React Strict Mode remounts
  // The Zustand persist middleware restores token, but we validate with server
  useEffect(() => {
    // Re-entry guard: only bootstrap once (module-level to survive Strict Mode)
    if (globalBootstrapComplete) {
      console.log('🔒 [Bootstrap] Already completed, skipping');
      return;
    }

    // Mark as bootstrapped BEFORE async operation to prevent re-entry
    globalBootstrapComplete = true;
    console.log('🚀 [Bootstrap] Starting session check on mount...');

    // Inline async using direct store access to avoid stale closures
    const doBootstrap = async () => {
      // Re-entry guard for the async operation itself
      if (globalSessionCheckInProgress) {
        console.log('🔒 [Bootstrap] Session check already in progress, skipping');
        return;
      }

      globalSessionCheckInProgress = true;

      try {
        console.log('🍪 [Bootstrap] Calling session API...');
        const sessionResponse = await authService.validateSession();
        console.log('🍪 [Bootstrap] API response:', JSON.stringify(sessionResponse, null, 2));

        // Get fresh store methods
        const store = useAuthStore.getState();

        if (sessionResponse.authenticated && sessionResponse.user) {
          console.log('✅ [Bootstrap] Session valid! Setting user:', sessionResponse.user.walletAddress);
          store.setUser(sessionResponse.user);
          store.setAuthenticated(true);
          store.setConnected(true, sessionResponse.user.walletAddress);
          store.transitionTo('ready');
          console.log('✅ [Bootstrap] Transitioned to ready');

          // Load NFT data in background after session restore
          // This populates the NFT gallery with images
          const walletAddress = sessionResponse.user.walletAddress;
          authService.verifyNFTs(walletAddress).then(nftResponse => {
            if (nftResponse.success) {
              store.setNFTData(nftResponse);
              console.log('✅ [Bootstrap] NFT data loaded:', {
                totalNFTs: nftResponse.totalNFTs || nftResponse.nfts?.length || 0
              });
            }
          }).catch(err => {
            console.warn('⚠️ [Bootstrap] Failed to load NFT data:', err);
          });
        } else {
          console.log('❌ [Bootstrap] No valid session, transitioning to idle');
          store.setUser(null);
          store.setAuthenticated(false);
          store.transitionTo('idle');
        }
      } catch (err) {
        console.error('⚠️ [Bootstrap] Exception:', err);
        const store = useAuthStore.getState();
        store.setUser(null);
        store.setAuthenticated(false);
        store.transitionTo('idle');
      } finally {
        globalSessionCheckInProgress = false;
      }
    };

    doBootstrap();
  }, []); // Empty deps - run once on mount

  // Auto-clear errors after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return {
    // State - from global Zustand store (shared across all components)
    user: user as AuthUser | null,
    // PHASE-0 FIX: isLoading derived from authStatus
    isLoading,
    error,
    isAuthenticated: isAuthenticated && !!user,
    // NFT data now comes from global Zustand store (not local ref)
    nftData,
    // PHASE-0 FIX: Expose canonical auth status
    authStatus,

    // Actions
    login,
    logout,
    disconnectWallet,
    refreshNFTs,
    clearError,
    checkSessionStatus
  };
};

// Export types for external use
export type { AuthState, AuthActions };
