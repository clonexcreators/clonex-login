// CloneX Authentication Hook - Cookie-Based SSO (Backend Bible v3.5.2)
//
// Uses global Zustand store for shared auth state across all components.
// Per Backend Bible v3.5.2, authentication uses httpOnly cookies:
// - No localStorage token storage needed (backend handles cookies)
// - Session validation via GET /api/auth/session (cookie sent automatically)
// - Login via POST /api/auth/wallet/verify (sets cookie)
// - Logout via POST /api/auth/logout (clears cookie)

import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { AuthUser, NFTVerificationResponse } from '../config/api';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  nftData: NFTVerificationResponse | null;
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
    isAuthenticated,
    authToken,
    isLoading,
    error,
    setUser,
    setAuthenticated,
    setLoading,
    setError,
    setConnected,
    logout: storeLogout,
    isTokenValid
  } = useAuthStore();

  const { address, isConnected, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Track NFT data locally (not critical for UI state)
  const nftDataRef = useRef<NFTVerificationResponse | null>(null);
  const lastCheckedAddress = useRef<string | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Check if user is authenticated (cookie-based session validation)
  // Per Backend Bible v3.5.2, uses GET /api/auth/session with httpOnly cookie
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🍪 [checkSessionStatus] Starting cookie validation...');
      setLoading(true);

      // Cookie is sent automatically with credentials: 'include'
      const sessionResponse = await authService.validateSession();
      console.log('🍪 [checkSessionStatus] API response:', JSON.stringify(sessionResponse, null, 2));

      if (sessionResponse.authenticated && sessionResponse.user) {
        console.log('✅ [checkSessionStatus] Session valid! Setting user:', sessionResponse.user.walletAddress);
        setUser(sessionResponse.user);
        console.log('✅ [checkSessionStatus] setUser called');
        setAuthenticated(true);
        console.log('✅ [checkSessionStatus] setAuthenticated(true) called');
        setConnected(true, sessionResponse.user.walletAddress);
        console.log('✅ [checkSessionStatus] setConnected called');
        setLoading(false);
        console.log('✅ [checkSessionStatus] setLoading(false) called - DONE');
        return true;
      } else {
        console.log('❌ [checkSessionStatus] No valid session. authenticated:', sessionResponse.authenticated, 'user:', !!sessionResponse.user);
        setUser(null);
        setAuthenticated(false);
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('⚠️ [checkSessionStatus] Exception:', err);
      setUser(null);
      setAuthenticated(false);
      setLoading(false);
      return false;
    }
  }, [setUser, setAuthenticated, setConnected, setLoading]);

  // Refresh NFT data
  const refreshNFTs = useCallback(async () => {
    if (!address || !isAuthenticated) {
      console.warn('Cannot refresh NFTs: no address or not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nftResponse = await authService.verifyNFTs(address);

      if (nftResponse.success) {
        nftDataRef.current = nftResponse;

        // Update user with access level from NFT verification
        if (user) {
          setUser({
            ...user,
            accessLevel: nftResponse.accessLevel
          } as AuthUser);
        }

        setLoading(false);

        console.log('✅ NFT verification completed:', {
          accessLevel: nftResponse.accessLevel,
          collections: nftResponse.nftCollections,
          delegated: nftResponse.delegatedAccess.enabled
        });
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ NFT verification failed:', errorMessage);
      setError(`NFT verification failed: ${errorMessage}`);
      setLoading(false);
    }
  }, [address, isAuthenticated, user, setUser, setLoading, setError]);

  // Main login function - Cookie-based authentication (Backend Bible v3.5.2)
  // Flow: nonce -> sign -> verify (backend sets httpOnly cookie)
  const login = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Starting cookie-based authentication for:', address);

      // Step 1: Generate nonce
      const nonceResponse = await authService.generateNonce(address);
      console.log('📝 Nonce generated:', nonceResponse.nonce);

      // Step 2: Sign challenge message
      console.log('✍️ Requesting signature for message...');
      const signature = await signMessageAsync({
        message: nonceResponse.message
      });
      console.log('✅ Message signed successfully');

      // Step 3: Verify signature - backend sets httpOnly cookie automatically
      // No token in response body when cookieMode: true
      const authResponse = await authService.verifySignature(
        address,
        signature,
        nonceResponse.nonce
      );

      if (authResponse.success) {
        console.log('🍪 Authentication successful! Cookie set by backend.');
        console.log('   cookieMode:', authResponse.cookieMode);
        console.log('   tokenType:', authResponse.tokenType);

        // *** CRITICAL: Update global Zustand store ***
        // No need to store token in localStorage - cookie handles it!
        setUser(authResponse.user);
        setAuthenticated(true);
        setConnected(true, address);
        setLoading(false);

        console.log('🔄 Global auth state updated - UI should re-render now');

        // Step 4: Verify NFTs for access level (non-blocking)
        try {
          const nftResponse = await authService.verifyNFTs(address);

          if (nftResponse.success) {
            nftDataRef.current = nftResponse;

            // Update user with access level
            setUser({
              ...authResponse.user,
              accessLevel: nftResponse.accessLevel
            });

            console.log('🔬 NFT verification completed:', {
              accessLevel: nftResponse.accessLevel,
              totalCollections: Object.keys(nftResponse.nftCollections).length,
              delegated: nftResponse.delegatedAccess.enabled
            });
          }
        } catch (nftError) {
          console.warn('⚠️ NFT verification failed (using basic access):', nftError);
          // Continue with basic authentication even if NFT verification fails
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ Authentication failed:', errorMessage);

      // Handle user rejection gracefully
      if (errorMessage.includes('rejected') || errorMessage.includes('denied') || errorMessage.includes('User rejected')) {
        setError('Signature rejected - authentication cancelled');
      } else {
        setError(`Authentication failed: ${errorMessage}`);
      }
      setLoading(false);
    }
  }, [address, isConnected, signMessageAsync, setUser, setAuthenticated, setConnected, setLoading, setError]);

  // Logout function - clears cookie session AND disconnects wallet
  const logout = useCallback(async () => {
    console.log('🚪 Logging out (cookie-based)...');

    try {
      // Call logout endpoint - this clears the httpOnly cookie
      await authService.logout();
      console.log('🍪 Cookie cleared by backend');
    } catch (err) {
      console.warn('⚠️ Logout API call failed (continuing with local cleanup):', err);
    }

    // Reset global Zustand store - this triggers re-render in all subscribed components
    storeLogout();

    // Disconnect wallet
    disconnect();

    // Reset local refs
    nftDataRef.current = null;
    lastCheckedAddress.current = null;

    console.log('✅ Logout complete');
  }, [storeLogout, disconnect]);

  // Disconnect wallet only - does NOT clear session
  const disconnectWallet = useCallback(() => {
    console.log('🔌 Disconnecting wallet only (keeping session if valid)...');
    disconnect();
    console.log('✅ Wallet disconnected');
  }, [disconnect]);

  // Sync wallet connection state to store
  useEffect(() => {
    setConnected(isConnected, address || undefined);
  }, [isConnected, address, setConnected]);

  // Check cookie session on mount and when address changes
  // Per Backend Bible v3.5.2, session is validated via cookie (not localStorage)
  useEffect(() => {
    if (isConnecting) return;

    // Always check cookie session on mount (cookie persists across page loads)
    // This enables cross-subdomain SSO - user authenticated on gm.clonex.wtf
    // will also be authenticated on gro.clonex.wtf, etc.
    if (address && address !== lastCheckedAddress.current) {
      console.log('🍪 Checking cookie session for address:', address);
      lastCheckedAddress.current = address;
      checkSessionStatus();
    } else if (!isConnected && !lastCheckedAddress.current) {
      // No wallet connected but page just loaded - still check for cookie session
      // This handles the case where user has a valid cookie from another subdomain
      console.log('🍪 Checking for existing cookie session (no wallet connected)...');
      checkSessionStatus();
      lastCheckedAddress.current = 'checked-no-wallet';
    }
  }, [address, isConnected, isConnecting, checkSessionStatus]);

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
    isLoading: isLoading || isConnecting,
    error,
    isAuthenticated: isAuthenticated && !!user,
    nftData: nftDataRef.current,

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
