// ============================================================================
// CloneX Auth SDK - Auth Store (Zustand)
// Version: 1.0.0
// Centralized state management for authentication
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AuthStatus,
  CloneXUser,
  NFTVerificationData,
  AuthEvent,
  AuthEventHandler,
  AuthEventType
} from './types';
import { authService } from './authService';
import { getConfig, isCloneXDomain, getCookieOptions } from './config';

// ============================================================================
// Store State Interface
// ============================================================================

interface AuthStoreState {
  // Core state machine
  authStatus: AuthStatus;
  _hasHydrated: boolean;

  // User & data
  user: CloneXUser | null;
  nftData: NFTVerificationData | null;

  // Connection state
  isConnected: boolean;
  isAuthenticated: boolean;
  walletAddress: string | null;
  authToken: string | null;

  // UI state
  isLoading: boolean;
  isSigningChallenge: boolean;
  error: string | null;

  // Session
  lastAuthTime: number | null;
}

interface AuthStoreActions {
  // Hydration
  setHasHydrated: (hydrated: boolean) => void;

  // State machine
  setAuthStatus: (status: AuthStatus) => void;
  transitionTo: (status: AuthStatus, options?: { error?: string }) => void;

  // User management
  setUser: (user: CloneXUser | null) => void;
  updateUserProfile: (profile: Partial<CloneXUser>) => void;

  // NFT data
  setNFTData: (data: NFTVerificationData | null) => void;

  // Connection
  setConnected: (connected: boolean, address?: string) => void;

  // Auth flow
  setAuthenticated: (authenticated: boolean, token?: string) => void;
  setSigningChallenge: (signing: boolean) => void;

  // Loading & errors
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Session
  updateLastAuthTime: () => void;
  clearSession: () => void;

  // Complete logout
  logout: () => void;

  // Event system
  subscribe: (handler: AuthEventHandler) => () => void;
  emit: (type: AuthEventType, payload?: AuthEvent['payload']) => void;
}

type AuthStore = AuthStoreState & AuthStoreActions;

// ============================================================================
// Event Emitter
// ============================================================================

const eventHandlers = new Set<AuthEventHandler>();

// ============================================================================
// Store Implementation
// ============================================================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      authStatus: 'booting' as AuthStatus,
      _hasHydrated: false,
      user: null,
      nftData: null,
      isConnected: false,
      isAuthenticated: false,
      walletAddress: null,
      authToken: null,
      isLoading: true,
      isSigningChallenge: false,
      error: null,
      lastAuthTime: null,

      // Hydration
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),

      // State machine
      setAuthStatus: (authStatus) => {
        const isLoading = ['booting', 'authenticating', 'loading_nfts'].includes(authStatus);
        set({ authStatus, isLoading });
      },

      transitionTo: (authStatus, options) => {
        const isLoading = ['booting', 'authenticating', 'loading_nfts'].includes(authStatus);
        const updates: Partial<AuthStoreState> = { authStatus, isLoading };

        if (options?.error !== undefined) {
          updates.error = options.error;
        }

        if (getConfig().debug) {
          console.log(`🔄 [AuthStore] Transition to: ${authStatus}`, options?.error ? `(error: ${options.error})` : '');
        }

        set(updates);

        // Emit status change event
        get().emit('auth:status_change', { status: authStatus });
      },

      // User management
      setUser: (user) => set({ user }),

      updateUserProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...profile } });
        }
      },

      // NFT data
      setNFTData: (nftData) => {
        set({ nftData });
        if (nftData) {
          get().emit('auth:nfts_loaded', { nftData });
        }
      },

      // Connection
      setConnected: (isConnected, walletAddress) => {
        set({ isConnected, walletAddress: walletAddress || null });
        if (isConnected) {
          get().emit('auth:connected', { user: get().user ?? undefined });
        } else {
          get().emit('auth:disconnected');
        }
      },

      // Auth flow
      setAuthenticated: (isAuthenticated, authToken) => {
        if (isAuthenticated) {
          // Store token in localStorage for backward compatibility
          if (authToken && typeof localStorage !== 'undefined') {
            localStorage.setItem('clonex_auth_token', authToken);
          }

          set({
            isAuthenticated: true,
            authToken: authToken || null,
            lastAuthTime: Date.now(),
            error: null
          });

          get().emit('auth:authenticated', { user: get().user ?? undefined });
        } else {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('clonex_auth_token');
          }

          set({
            isAuthenticated: false,
            authToken: null,
            lastAuthTime: null
          });
        }
      },

      setSigningChallenge: (isSigningChallenge) => set({ isSigningChallenge }),

      // Loading & errors
      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => {
        set({ error });
        if (error) {
          get().emit('auth:error', { error });
        }
      },

      // Session
      updateLastAuthTime: () => set({ lastAuthTime: Date.now() }),

      clearSession: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('clonex_auth_token');
        }

        set({
          authToken: null,
          isAuthenticated: false,
          lastAuthTime: null
        });
      },

      // Complete logout
      logout: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('clonex_auth_token');
        }

        if (getConfig().debug) {
          console.log('👋 [AuthStore] User logged out');
        }

        set({
          authStatus: 'idle' as AuthStatus,
          user: null,
          nftData: null,
          isConnected: false,
          isAuthenticated: false,
          walletAddress: null,
          authToken: null,
          isLoading: false,
          isSigningChallenge: false,
          error: null,
          lastAuthTime: null
        });

        get().emit('auth:logout');
      },

      // Event system
      subscribe: (handler: AuthEventHandler) => {
        eventHandlers.add(handler);
        return () => {
          eventHandlers.delete(handler);
        };
      },

      emit: (type: AuthEventType, payload?: AuthEvent['payload']) => {
        const event: AuthEvent = {
          type,
          payload,
          timestamp: Date.now()
        };

        eventHandlers.forEach(handler => {
          try {
            handler(event);
          } catch (error) {
            console.error('[AuthStore] Event handler error:', error);
          }
        });
      }
    }),
    {
      name: 'clonex-auth-storage',
      partialize: (state) => ({
        authToken: state.authToken,
        lastAuthTime: state.lastAuthTime,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        // Mark hydration complete
        setTimeout(() => {
          useAuthStore.getState().setHasHydrated(true);
        }, 0);

        if (state?.authToken) {
          const isValid = !authService.isTokenExpired(state.authToken);
          if (!isValid) {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('clonex_auth_token');
            }
            state.authToken = null;
            state.isAuthenticated = false;
            state.lastAuthTime = null;
          }
        }
      }
    }
  )
);

// ============================================================================
// Helper Exports
// ============================================================================

export const isSessionValid = () => {
  const { authToken, isAuthenticated } = useAuthStore.getState();
  if (!authToken) return false;
  return isAuthenticated && !authService.isTokenExpired(authToken);
};

export const getCurrentUser = (): CloneXUser | null => {
  return useAuthStore.getState().user;
};

export const getNFTData = (): NFTVerificationData | null => {
  return useAuthStore.getState().nftData;
};

export const getAuthStatus = (): AuthStatus => {
  return useAuthStore.getState().authStatus;
};

export const subscribeToAuthEvents = (handler: AuthEventHandler): (() => void) => {
  return useAuthStore.getState().subscribe(handler);
};
