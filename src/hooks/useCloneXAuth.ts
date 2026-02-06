// CloneX Authentication Hook - Fixed State Machine
// Properly separates wallet connection from session authentication

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { authService } from '../services/authService';
import { AuthUser, AccessLevel, NFTVerificationResponse } from '../config/api';

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
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    nftData: null
  });

  const { address, isConnected, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Track if we've already checked session on mount
  const hasCheckedSession = useRef(false);
  const lastCheckedAddress = useRef<string | null>(null);

  // Helper to update state
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Check if user is authenticated (validates existing token)
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    const token = authService.getToken();

    // No token = not authenticated
    if (!token) {
      updateState({
        user: null,
        isAuthenticated: false,
        nftData: null
      });
      return false;
    }

    // Token expired = not authenticated
    if (authService.isTokenExpired(token)) {
      console.log('🔐 Token expired, clearing session');
      authService.clearToken();
      updateState({
        user: null,
        isAuthenticated: false,
        nftData: null
      });
      return false;
    }

    try {
      console.log('🔍 Validating existing session...');
      const sessionResponse = await authService.validateSession();

      if (sessionResponse.success && sessionResponse.sessionValid) {
        console.log('✅ Session valid, user authenticated');
        updateState({
          user: sessionResponse.user,
          isAuthenticated: true
        });
        return true;
      } else {
        console.log('❌ Session invalid');
        authService.clearToken();
        updateState({
          user: null,
          isAuthenticated: false,
          nftData: null
        });
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Session validation failed:', error);
      authService.clearToken();
      updateState({
        user: null,
        isAuthenticated: false,
        error: null, // Don't show error for session check failures
        nftData: null
      });
      return false;
    }
  }, [updateState]);

  // Refresh NFT data
  const refreshNFTs = useCallback(async () => {
    if (!address || !state.isAuthenticated) {
      console.warn('Cannot refresh NFTs: no address or not authenticated');
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      const nftResponse = await authService.verifyNFTs(address);

      if (nftResponse.success) {
        updateState({
          nftData: nftResponse,
          user: state.user ? {
            ...state.user,
            accessLevel: nftResponse.accessLevel
          } : null,
          isLoading: false
        });

        console.log('✅ NFT verification completed:', {
          accessLevel: nftResponse.accessLevel,
          collections: nftResponse.nftCollections,
          delegated: nftResponse.delegatedAccess.enabled
        });
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('❌ NFT verification failed:', errorMessage);
      updateState({
        error: `NFT verification failed: ${errorMessage}`,
        isLoading: false
      });
    }
  }, [address, state.isAuthenticated, state.user, updateState]);

  // Main login function - handles full nonce -> sign -> verify flow
  const login = useCallback(async () => {
    if (!address || !isConnected) {
      updateState({ error: 'Wallet not connected' });
      return;
    }

    updateState({ isLoading: true, error: null });

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

        // Store token
        authService.setToken(authResponse.token);

        // Update state IMMEDIATELY after successful auth
        setState(prev => ({
          ...prev,
          user: authResponse.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        }));

        // Step 4: Verify NFTs for access level (non-blocking)
        try {
          const nftResponse = await authService.verifyNFTs(address);

          if (nftResponse.success) {
            setState(prev => ({
              ...prev,
              nftData: nftResponse,
              user: prev.user ? {
                ...prev.user,
                accessLevel: nftResponse.accessLevel
              } : authResponse.user
            }));

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
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('❌ Authentication failed:', errorMessage);

      // Handle user rejection gracefully
      if (errorMessage.includes('rejected') || errorMessage.includes('denied') || errorMessage.includes('User rejected')) {
        updateState({
          error: 'Signature rejected - authentication cancelled',
          isLoading: false
        });
      } else {
        updateState({
          error: `Authentication failed: ${errorMessage}`,
          isLoading: false
        });
      }
    }
  }, [address, isConnected, signMessageAsync, updateState]);

  // Logout function - clears session AND disconnects wallet
  const logout = useCallback(() => {
    console.log('🚪 Logging out (full logout)...');

    // Clear token first
    authService.clearToken();

    // Reset state
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      nftData: null
    });

    // Disconnect wallet
    disconnect();

    // Reset session check refs
    hasCheckedSession.current = false;
    lastCheckedAddress.current = null;

    console.log('✅ Logout complete');
  }, [disconnect]);

  // Disconnect wallet only - does NOT clear session
  // User can reconnect same wallet and maintain session
  const disconnectWallet = useCallback(() => {
    console.log('🔌 Disconnecting wallet only (keeping session if valid)...');

    // Just disconnect wallet, don't clear token
    disconnect();

    // Note: We keep the token so if user reconnects same wallet,
    // they can resume their session

    console.log('✅ Wallet disconnected');
  }, [disconnect]);

  // Check session on mount and when address changes
  useEffect(() => {
    // Skip if connecting or no address
    if (isConnecting) return;

    // If not connected, check if we have a valid token anyway
    // (user might have refreshed page)
    if (!isConnected) {
      const token = authService.getToken();
      if (token && !authService.isTokenExpired(token)) {
        // We have a valid token but wallet disconnected
        // Keep the authenticated state but mark as needing wallet reconnect
        console.log('🔐 Valid token exists, but wallet not connected');
      } else {
        // No valid token and no wallet = clear everything
        setState(prev => {
          if (prev.isAuthenticated || prev.user) {
            return {
              ...prev,
              user: null,
              isAuthenticated: false,
              nftData: null
            };
          }
          return prev;
        });
      }
      return;
    }

    // Wallet connected - check session
    if (address && address !== lastCheckedAddress.current) {
      console.log('🔍 Checking session for address:', address);
      lastCheckedAddress.current = address;
      checkSessionStatus();
    }
  }, [address, isConnected, isConnecting, checkSessionStatus]);

  // Auto-clear errors after 10 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [state.error, clearError]);

  return {
    // State
    user: state.user,
    isLoading: state.isLoading || isConnecting,
    error: state.error,
    isAuthenticated: state.isAuthenticated && !!state.user,
    nftData: state.nftData,

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
