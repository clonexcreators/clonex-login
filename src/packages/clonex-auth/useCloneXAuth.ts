// ============================================================================
// CloneX Auth SDK - Main Auth Hook
// Version: 1.0.0
// Primary React hook for CloneX authentication
// ============================================================================

import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { useAuthStore } from './authStore';
import { authService } from './authService';
import { UseCloneXAuthReturn, AuthStatus, CloneXUser } from './types';
import { getConfig } from './config';

// Module-level guards to survive React Strict Mode remounts
let globalBootstrapComplete = false;
let globalSessionCheckInProgress = false;

/**
 * Main authentication hook for CloneX
 *
 * Usage:
 * ```tsx
 * const { user, login, logout, authStatus } = useCloneXAuth();
 *
 * if (authStatus === 'ready') {
 *   return <Dashboard user={user} />;
 * }
 * ```
 */
export const useCloneXAuth = (): UseCloneXAuthReturn => {
  const config = getConfig();

  // Global Zustand store state
  const {
    user,
    nftData,
    isAuthenticated,
    isLoading,
    error,
    authStatus,
    setUser,
    setNFTData,
    setAuthenticated,
    setError,
    setConnected,
    transitionTo,
    logout: storeLogout
  } = useAuthStore();

  // Wagmi hooks
  const { address, isConnected, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Re-entry guards
  const loginInProgress = useRef<boolean>(false);

  // ==========================================================================
  // Clear Error
  // ==========================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // ==========================================================================
  // Check Session Status
  // ==========================================================================

  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    if (globalSessionCheckInProgress) {
      return false;
    }

    globalSessionCheckInProgress = true;

    try {
      if (config.debug) {
        console.log('🍪 [useCloneXAuth] Checking session...');
      }

      const sessionResponse = await authService.validateSession();

      if (sessionResponse.authenticated && sessionResponse.user) {
        setUser(sessionResponse.user);
        setAuthenticated(true);
        setConnected(true, sessionResponse.user.walletAddress);
        transitionTo('ready');
        return true;
      } else {
        setUser(null);
        setAuthenticated(false);
        transitionTo('idle');
        return false;
      }
    } catch (err) {
      console.error('⚠️ [useCloneXAuth] Session check failed:', err);
      setUser(null);
      setAuthenticated(false);
      transitionTo('idle');
      return false;
    } finally {
      globalSessionCheckInProgress = false;
    }
  }, [setUser, setAuthenticated, setConnected, transitionTo, config.debug]);

  // ==========================================================================
  // Refresh NFTs
  // ==========================================================================

  const refreshNFTs = useCallback(async () => {
    if (!address || !isAuthenticated) {
      console.warn('[useCloneXAuth] Cannot refresh NFTs: not authenticated');
      return;
    }

    transitionTo('loading_nfts');
    setError(null);

    try {
      const nftResponse = await authService.verifyNFTs(address);

      if (nftResponse.success) {
        setNFTData(nftResponse);

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
          });
        }

        transitionTo('ready');

        if (config.debug) {
          console.log('✅ [useCloneXAuth] NFT verification completed:', {
            accessLevel: nftResponse.accessLevel,
            totalNFTs: nftResponse.totalNFTs
          });
        }
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ [useCloneXAuth] NFT verification failed:', errorMessage);
      transitionTo('ready', { error: `NFT verification failed: ${errorMessage}` });
    }
  }, [address, isAuthenticated, user, setUser, setNFTData, setError, transitionTo, config.debug]);

  // ==========================================================================
  // Login
  // ==========================================================================

  const login = useCallback(async () => {
    if (loginInProgress.current) {
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
      if (config.debug) {
        console.log('🔐 [useCloneXAuth] Starting authentication for:', address);
      }

      // Step 1: Generate nonce
      const nonceResponse = await authService.generateNonce(address);

      // Step 2: Sign challenge
      const signature = await signMessageAsync({
        message: nonceResponse.message
      });

      // Step 3: Verify signature
      const authResponse = await authService.verifySignature(
        address,
        signature,
        nonceResponse.nonce
      );

      if (!authResponse.success) {
        throw new Error('Authentication failed');
      }

      // Update auth state
      setUser(authResponse.user);
      setAuthenticated(true, authResponse.token);
      setConnected(true, address);

      // Step 4: Load NFT data
      transitionTo('loading_nfts');

      try {
        const nftResponse = await authService.verifyNFTs(address);

        if (nftResponse.success) {
          setNFTData(nftResponse);
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
        }
      } catch (nftError) {
        console.warn('⚠️ [useCloneXAuth] NFT verification failed (continuing):', nftError);
      }

      // Final state: ready
      useAuthStore.getState().transitionTo('ready');

      if (config.debug) {
        console.log('✅ [useCloneXAuth] Authentication complete');
      }

    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ [useCloneXAuth] Authentication failed:', errorMessage);

      if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        transitionTo('wallet_connected', { error: 'Signature rejected' });
      } else {
        transitionTo('wallet_connected', { error: `Authentication failed: ${errorMessage}` });
      }
    } finally {
      loginInProgress.current = false;
    }
  }, [
    address,
    isConnected,
    signMessageAsync,
    setUser,
    setAuthenticated,
    setConnected,
    setNFTData,
    setError,
    transitionTo,
    config.debug
  ]);

  // ==========================================================================
  // Logout
  // ==========================================================================

  const logout = useCallback(async () => {
    if (config.debug) {
      console.log('🚪 [useCloneXAuth] Logging out...');
    }

    try {
      await authService.logout();
    } catch (err) {
      console.warn('⚠️ [useCloneXAuth] API logout failed (continuing):', err);
    }

    storeLogout();
    disconnect();

    // Reset guards
    globalBootstrapComplete = false;
    globalSessionCheckInProgress = false;
    loginInProgress.current = false;
  }, [storeLogout, disconnect, config.debug]);

  // ==========================================================================
  // Disconnect Wallet (without logout)
  // ==========================================================================

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Sync wallet connection state
  const prevIsConnected = useRef<boolean | null>(null);
  useEffect(() => {
    setConnected(isConnected, address || undefined);

    const connectionChanged = prevIsConnected.current !== null && prevIsConnected.current !== isConnected;
    prevIsConnected.current = isConnected;

    if (!connectionChanged) return;

    const currentAuthStatus = useAuthStore.getState().authStatus;
    if (currentAuthStatus === 'idle' && isConnected) {
      transitionTo('wallet_connected');
    } else if (currentAuthStatus === 'wallet_connected' && !isConnected) {
      transitionTo('idle');
    }
  }, [isConnected, address, setConnected, transitionTo]);

  // Safety timeout for loading states
  useEffect(() => {
    const loadingStatuses: AuthStatus[] = ['booting', 'authenticating', 'loading_nfts'];
    if (!loadingStatuses.includes(authStatus)) return;

    const safetyTimeout = setTimeout(() => {
      if (globalSessionCheckInProgress) return;

      const currentStatus = useAuthStore.getState().authStatus;
      const currentConnected = useAuthStore.getState().isConnected;

      if (loadingStatuses.includes(currentStatus)) {
        console.warn('⚠️ [useCloneXAuth] Safety timeout triggered');
        useAuthStore.getState().transitionTo(currentConnected ? 'wallet_connected' : 'idle');
      }
    }, 10000);

    return () => clearTimeout(safetyTimeout);
  }, [authStatus]);

  // Bootstrap: Check session on mount
  useEffect(() => {
    if (globalBootstrapComplete) return;

    globalBootstrapComplete = true;

    const doBootstrap = async () => {
      if (globalSessionCheckInProgress) return;

      globalSessionCheckInProgress = true;

      try {
        const sessionResponse = await authService.validateSession();
        const store = useAuthStore.getState();

        if (sessionResponse.authenticated && sessionResponse.user) {
          store.setUser(sessionResponse.user);
          store.setAuthenticated(true);
          store.setConnected(true, sessionResponse.user.walletAddress);
          store.transitionTo('ready');

          // Load NFT data in background
          const walletAddress = sessionResponse.user.walletAddress;
          authService.verifyNFTs(walletAddress).then(nftResponse => {
            if (nftResponse.success) {
              store.setNFTData(nftResponse);
            }
          }).catch(err => {
            console.warn('⚠️ [useCloneXAuth] NFT load failed:', err);
          });
        } else {
          store.setUser(null);
          store.setAuthenticated(false);
          store.transitionTo('idle');
        }
      } catch (err) {
        console.error('⚠️ [useCloneXAuth] Bootstrap failed:', err);
        const store = useAuthStore.getState();
        store.setUser(null);
        store.setAuthenticated(false);
        store.transitionTo('idle');
      } finally {
        globalSessionCheckInProgress = false;
      }
    };

    doBootstrap();
  }, []);

  // Auto-clear errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 10000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    user: user as CloneXUser | null,
    isLoading,
    error,
    isAuthenticated: isAuthenticated && !!user,
    nftData,
    authStatus,
    login,
    logout,
    disconnectWallet,
    refreshNFTs,
    clearError,
    checkSessionStatus
  };
};

/**
 * Reset bootstrap guards (useful for testing or after logout)
 */
export const resetAuthBootstrap = (): void => {
  globalBootstrapComplete = false;
  globalSessionCheckInProgress = false;
};
