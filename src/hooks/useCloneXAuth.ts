// CloneX Authentication Hook - Uses Global Zustand Store
// All components share the same auth state via useAuthStore
// After login success, setUser() and setAuthenticated() update the global store,
// which triggers re-renders in ALL components subscribed to useAuthStore

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

  // Check if user is authenticated (validates existing token)
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    const token = authService.getToken();

    // No token = not authenticated
    if (!token) {
      setUser(null);
      setAuthenticated(false);
      return false;
    }

    // Token expired = not authenticated
    if (authService.isTokenExpired(token)) {
      console.log('🔐 Token expired, clearing session');
      authService.clearToken();
      setUser(null);
      setAuthenticated(false);
      return false;
    }

    try {
      console.log('🔍 Validating existing session...');
      setLoading(true);
      const sessionResponse = await authService.validateSession();

      if (sessionResponse.success && sessionResponse.sessionValid) {
        console.log('✅ Session valid, user authenticated');
        setUser(sessionResponse.user);
        setAuthenticated(true, token);
        setLoading(false);
        return true;
      } else {
        console.log('❌ Session invalid');
        authService.clearToken();
        setUser(null);
        setAuthenticated(false);
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.warn('⚠️ Session validation failed:', err);
      authService.clearToken();
      setUser(null);
      setAuthenticated(false);
      setLoading(false);
      return false;
    }
  }, [setUser, setAuthenticated, setLoading]);

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

  // Main login function - handles full nonce -> sign -> verify flow
  const login = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Starting authentication for:', address);

      // Step 1: Generate nonce
      const nonceResponse = await authService.generateNonce(address);
      console.log('📝 Nonce generated:', nonceResponse.nonce);

      // Step 2: Sign challenge message
      console.log('✍️ Requesting signature for message...');
      const signature = await signMessageAsync({
        message: nonceResponse.message
      });
      console.log('✅ Message signed successfully');

      // Step 3: Verify signature and get JWT
      const authResponse = await authService.verifySignature(
        address,
        signature,
        nonceResponse.nonce
      );

      if (authResponse.success) {
        console.log('🎉 Authentication successful!');

        // Store token in localStorage
        authService.setToken(authResponse.token);

        // *** CRITICAL: Update global Zustand store ***
        // After login success, these lines cause the main view to rerender because:
        // 1. setUser() updates the global 'user' state in Zustand
        // 2. setAuthenticated() updates 'isAuthenticated' and 'authToken' in Zustand
        // 3. setConnected() updates 'isConnected' and 'walletAddress' in Zustand
        // 4. All components using useAuthStore() or useCloneXAuth() will re-render
        //    because Zustand triggers subscriptions when state changes
        setUser(authResponse.user);
        setAuthenticated(true, authResponse.token);
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

  // Logout function - clears session AND disconnects wallet
  const logout = useCallback(() => {
    console.log('🚪 Logging out (full logout)...');

    // Clear token from localStorage
    authService.clearToken();

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

  // Check session on mount and when address changes
  useEffect(() => {
    if (isConnecting) return;

    if (!isConnected) {
      // Wallet disconnected - check if we still have valid token
      const token = authService.getToken();
      if (!token || authService.isTokenExpired(token)) {
        // No valid token = clear auth state in global store
        if (isAuthenticated) {
          setUser(null);
          setAuthenticated(false);
        }
      }
      return;
    }

    // Wallet connected - check session if address changed
    if (address && address !== lastCheckedAddress.current) {
      console.log('🔍 Checking session for address:', address);
      lastCheckedAddress.current = address;
      checkSessionStatus();
    }
  }, [address, isConnected, isConnecting, isAuthenticated, checkSessionStatus, setUser, setAuthenticated]);

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
