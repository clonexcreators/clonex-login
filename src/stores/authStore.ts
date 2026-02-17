import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthChallenge, AuthError } from '../types';
import { AuthUser, NFTVerificationResponse } from '../config/api';
import { authService } from '../services/authService';
import { cookieService } from '../services/cookieService';
import { ENV_CONFIG } from '../config/environment';

interface JWTClaims {
  walletAddress: string;
  accessLevel: string;
  collections: string[];
  subdomainAccess: string[];
  iat: number;
  exp: number;
  nonce?: string;
}

// Canonical Auth Status State Machine (Phase-0 Fix)
// Single source of truth for auth lifecycle - prevents race conditions
export type AuthStatus =
  | 'booting'           // Initial state, checking for existing session
  | 'idle'              // No wallet connected, ready to connect
  | 'wallet_connected'  // Wallet connected, ready to sign in
  | 'authenticating'    // Sign-in in progress (nonce -> sign -> verify)
  | 'loading_nfts'      // Authenticated, loading NFT data
  | 'ready'             // Fully authenticated with NFT data loaded
  | 'error';            // Error state (temporary, transitions back)

interface AuthStoreState {
  // Canonical state machine status
  authStatus: AuthStatus;
  // Hydration tracking for persist middleware
  _hasHydrated: boolean;

  user: AuthUser | null;
  nftData: NFTVerificationResponse | null;  // NFT verification data stored globally
  isConnected: boolean;
  isAuthenticated: boolean;
  walletAddress: string | null;
  authToken: string | null;
  challenge: AuthChallenge | null;
  // DEPRECATED: isLoading is derived from authStatus now
  // Kept for backward compatibility with components that haven't migrated
  isLoading: boolean;
  isSigningChallenge: boolean;
  error: string | null;
  lastAuthTime: number | null;
}

interface AuthStore extends AuthStoreState {
  // Hydration tracking
  setHasHydrated: (hydrated: boolean) => void;

  // State Machine Control (Phase-0 Fix)
  setAuthStatus: (status: AuthStatus) => void;
  transitionTo: (status: AuthStatus, options?: { error?: string }) => void;

  // User Management
  setUser: (user: AuthUser | null) => void;
  updateUserProfile: (profile: Partial<AuthUser>) => void;

  // NFT Data Management
  setNFTData: (data: NFTVerificationResponse | null) => void;

  // Connection Management
  setConnected: (connected: boolean, address?: string) => void;

  // Authentication Flow
  setChallenge: (challenge: AuthChallenge | null) => void;
  setSigningChallenge: (signing: boolean) => void;
  setAuthenticated: (authenticated: boolean, token?: string) => void;

  // Loading States (DEPRECATED - use transitionTo instead)
  setLoading: (loading: boolean) => void;

  // Error Handling
  setError: (error: string | null) => void;
  setAuthError: (error: AuthError | null) => void;
  
  // Session Management
  updateLastAuthTime: () => void;
  clearSession: () => void;
  
  // Cross-Domain Session Management
  syncCrossDomainSession: () => void;
  checkCrossDomainSession: () => boolean;
  clearCrossDomainSession: () => void;
  validateSubdomainAccess: (subdomain?: string) => boolean;
  
  // JWT Token Management
  getTokenClaims: () => JWTClaims | null;
  getAccessLevel: () => string | null;
  getCollections: () => string[];
  getSubdomainAccess: () => string[];
  isTokenValid: () => boolean;
  
  // Complete logout
  logout: () => void;
}

const AUTH_TOKEN_KEY = 'clonex_auth_token';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours (fallback)

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State - Canonical State Machine (Phase-0 Fix)
      authStatus: 'booting' as AuthStatus,
      _hasHydrated: false,

      user: null,
      nftData: null,
      isConnected: false,
      isAuthenticated: false,
      walletAddress: null,
      authToken: null,
      challenge: null,
      // DEPRECATED: isLoading derived from authStatus
      // Kept for backward compatibility
      isLoading: true,
      isSigningChallenge: false,
      error: null,
      lastAuthTime: null,

      // Hydration tracking
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),

      // State Machine Control (Phase-0 Fix)
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
        // Always log transitions for debugging
        console.log(`🔄 [AuthStore] Transition to: ${authStatus}`, options?.error ? `(error: ${options.error})` : '');
        set(updates);
        // Log the new state to confirm update
        console.log(`🔄 [AuthStore] New state after set:`, { authStatus: get().authStatus, isLoading: get().isLoading });
      },

      // User Management
      setUser: (user) => set({ user }),

      // Update partial profile data (for avatar/displayName updates without full re-auth)
      updateUserProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...profile } });
          console.log('🔄 [AuthStore] User profile updated:', Object.keys(profile));
        }
      },

      // NFT Data Management
      setNFTData: (nftData) => set({ nftData }),

      // Connection Management
      setConnected: (isConnected, walletAddress) => 
        set({ isConnected, walletAddress: walletAddress || null }),

      // Authentication Flow
      setChallenge: (challenge) => set({ challenge }),
      
      setSigningChallenge: (isSigningChallenge) => set({ isSigningChallenge }),
      
      // setAuthenticated - Cookie-Based SSO (Backend Bible v3.5.2)
      // Token parameter is now optional - backend handles httpOnly cookies
      setAuthenticated: (isAuthenticated, authToken) => {
        if (isAuthenticated) {
          // Cookie-based auth: backend sets httpOnly cookie automatically
          // We only need to track local state for UI rendering
          if (ENV_CONFIG.showApiDebug) {
            console.log('🍪 Setting authenticated state (cookie-based SSO)');
            console.log('🔐 authToken provided:', !!authToken);
          }

          // For backward compatibility, also store token in localStorage if provided
          // This will be deprecated once all frontends migrate to cookie-based auth
          if (authToken) {
            localStorage.setItem(AUTH_TOKEN_KEY, authToken);

            // Legacy: Set custom cookies (will be removed when migration complete)
            if (ENV_CONFIG.isCloneXDomain) {
              const claims = authService.decodeToken(authToken);
              const expiryTime = claims?.exp ? claims.exp * 1000 : Date.now() + SESSION_TIMEOUT;
              cookieService.setAuthSession(authToken, expiryTime);
            }
          }

          set({
            isAuthenticated: true,
            authToken: authToken || null,
            lastAuthTime: Date.now(),
            error: null,
            challenge: null
          });
        } else {
          // Logging out - clear local state
          // Note: httpOnly cookie is cleared by backend via POST /api/auth/logout
          localStorage.removeItem(AUTH_TOKEN_KEY);

          // Clear legacy custom cookies
          if (ENV_CONFIG.isCloneXDomain) {
            cookieService.clearAuthSession();
          }

          set({
            isAuthenticated: false,
            authToken: null,
            lastAuthTime: null
          });
        }
      },

      // Loading States (DEPRECATED - use transitionTo instead)
      // Kept for backward compatibility
      setLoading: (isLoading) => set({ isLoading }),

      // Error Handling
      setError: (error) => set({ error }),
      
      setAuthError: (authError) => {
        if (authError) {
          set({ error: authError.message });
        } else {
          set({ error: null });
        }
      },

      // Session Management
      updateLastAuthTime: () => set({ lastAuthTime: Date.now() }),
      
      clearSession: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        
        // Clear cross-domain cookies
        if (ENV_CONFIG.isCloneXDomain) {
          cookieService.clearAuthSession();
        }
        
        set({ 
          authToken: null, 
          isAuthenticated: false, 
          lastAuthTime: null,
          challenge: null 
        });
      },

      // Cross-Domain Session Management
      syncCrossDomainSession: () => {
        if (!ENV_CONFIG.isCloneXDomain) return;
        
        const { token, sessionInfo } = cookieService.getAuthSession();
        const currentToken = get().authToken;
        
        // If we have a cookie token but no local token, sync it
        if (token && !currentToken && cookieService.isSessionValid()) {
          if (ENV_CONFIG.showCrossDomainDebug) {
            console.log('🔄 Syncing cross-domain session to local state');
          }
          
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          set({
            authToken: token,
            isAuthenticated: true,
            lastAuthTime: sessionInfo?.setAt || Date.now()
          });
        }
        
        // Sync localStorage with cookies for compatibility
        cookieService.syncWithLocalStorage();
      },

      checkCrossDomainSession: (): boolean => {
        if (!ENV_CONFIG.isCloneXDomain) {
          return false;
        }
        
        return cookieService.isSessionValid();
      },

      clearCrossDomainSession: () => {
        if (ENV_CONFIG.isCloneXDomain) {
          cookieService.clearAuthSession();
          
          if (ENV_CONFIG.showCrossDomainDebug) {
            console.log('🧹 Cleared cross-domain session');
          }
        }
      },

      validateSubdomainAccess: (subdomain?: string): boolean => {
        const targetSubdomain = subdomain || ENV_CONFIG.currentSubdomain;
        if (!targetSubdomain) return true; // Allow access if subdomain can't be determined
        
        const subdomainAccess = get().getSubdomainAccess();
        
        // Allow access to 'www' and 'research' by default for authenticated users
        const defaultAccess = ['www', 'research', 'lab'];
        const allowedSubdomains = [...subdomainAccess, ...defaultAccess];
        
        const hasAccess = allowedSubdomains.includes(targetSubdomain);
        
        if (ENV_CONFIG.showCrossDomainDebug) {
          console.log(`🏠 Subdomain access check for '${targetSubdomain}':`, hasAccess);
          console.log('🗝️ Allowed subdomains:', allowedSubdomains);
        }
        
        return hasAccess;
      },

      // JWT Token Management
      getTokenClaims: (): JWTClaims | null => {
        const { authToken } = get();
        if (!authToken) return null;
        
        return authService.decodeToken(authToken);
      },

      getAccessLevel: (): string | null => {
        const claims = get().getTokenClaims();
        return claims?.accessLevel || null;
      },

      getCollections: (): string[] => {
        const claims = get().getTokenClaims();
        return claims?.collections || [];
      },

      getSubdomainAccess: (): string[] => {
        const claims = get().getTokenClaims();
        return claims?.subdomainAccess || [];
      },

      isTokenValid: (): boolean => {
        const { authToken } = get();
        if (!authToken) return false;
        
        return !authService.isTokenExpired(authToken);
      },

      // Complete logout
      logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);

        // Clear cross-domain session
        if (ENV_CONFIG.isCloneXDomain) {
          cookieService.clearAuthSession();
        }

        if (ENV_CONFIG.showApiDebug) {
          console.log('👋 User logged out from all subdomains');
        }

        set({
          authStatus: 'idle' as AuthStatus,
          user: null,
          nftData: null,
          isConnected: false,
          isAuthenticated: false,
          walletAddress: null,
          authToken: null,
          challenge: null,
          isLoading: false,
          isSigningChallenge: false,
          error: null,
          lastAuthTime: null
        });
      },
    }),
    {
      name: 'clonex-auth-storage',
      partialize: (state) => ({
        authToken: state.authToken,
        lastAuthTime: state.lastAuthTime,
        isAuthenticated: state.isAuthenticated,
        // Don't persist authStatus - always start fresh with 'booting'
      }),
      // Rehydrate auth state on app load
      onRehydrateStorage: () => (state) => {
        // Mark hydration complete - this triggers the bootstrap effect
        // Note: We call setHasHydrated after a microtask to ensure store is ready
        console.log('🔄 [AuthStore] onRehydrateStorage called, scheduling hydration flag...');
        setTimeout(() => {
          useAuthStore.getState().setHasHydrated(true);
          console.log('🔄 [AuthStore] Hydration complete, _hasHydrated = true');
        }, 0);

        if (state?.authToken) {
          // Validate token on rehydration
          const isValid = !authService.isTokenExpired(state.authToken);
          
          if (!isValid) {
            if (ENV_CONFIG.showApiDebug) {
              console.log('🕐 Stored token expired, clearing session');
            }
            localStorage.removeItem(AUTH_TOKEN_KEY);
            if (ENV_CONFIG.isCloneXDomain) {
              cookieService.clearAuthSession();
            }
            state.authToken = null;
            state.isAuthenticated = false;
            state.lastAuthTime = null;
          } else {
            if (ENV_CONFIG.showApiDebug) {
              console.log('✅ Stored token is valid');
            }
            
            // Sync with cross-domain cookies if on CloneX domain
            if (ENV_CONFIG.isCloneXDomain && state.authToken) {
              const claims = authService.decodeToken(state.authToken);
              const expiryTime = claims?.exp ? claims.exp * 1000 : Date.now() + SESSION_TIMEOUT;
              cookieService.setAuthSession(state.authToken, expiryTime);
            }
          }
        }
        
        // Always check for cross-domain session on rehydration
        if (ENV_CONFIG.isCloneXDomain) {
          const store = useAuthStore.getState();
          store.syncCrossDomainSession();
        }
      }
    }
  )
);

// Session validation helper with cross-domain support
export const isSessionValid = () => {
  const { authToken, isTokenValid, checkCrossDomainSession } = useAuthStore.getState();
  
  // Check local token first
  if (authToken && isTokenValid()) {
    return true;
  }
  
  // Check cross-domain session if on CloneX domain
  if (ENV_CONFIG.isCloneXDomain) {
    return checkCrossDomainSession();
  }
  
  return false;
};

// Get current user's access level
export const getCurrentAccessLevel = (): string | null => {
  const { getAccessLevel } = useAuthStore.getState();
  return getAccessLevel();
};

// Get current user's collections
export const getCurrentCollections = (): string[] => {
  const { getCollections } = useAuthStore.getState();
  return getCollections();
};

// Get current user's subdomain access
export const getCurrentSubdomainAccess = (): string[] => {
  const { getSubdomainAccess } = useAuthStore.getState();
  return getSubdomainAccess();
};

// Validate access to specific subdomain
export const validateSubdomainAccess = (subdomain?: string): boolean => {
  const { validateSubdomainAccess } = useAuthStore.getState();
  return validateSubdomainAccess(subdomain);
};

// Cross-domain session utilities
export const syncCrossDomainSession = (): void => {
  const { syncCrossDomainSession } = useAuthStore.getState();
  syncCrossDomainSession();
};

export const checkCrossDomainSession = (): boolean => {
  const { checkCrossDomainSession } = useAuthStore.getState();
  return checkCrossDomainSession();
};