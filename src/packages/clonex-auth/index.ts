// ============================================================================
// CloneX Auth SDK
// Version: 1.0.0
//
// Universal authentication package for the CloneX ecosystem.
// Supports: Web apps, iOS (WebView), UE5 Phoenix Frontend
//
// Features:
// - Cookie-based SSO across *.clonex.wtf
// - NFT verification with delegation support
// - OAuth adapter for third-party read-only access
// - Portable UI components
//
// Quick Start:
// ```tsx
// import { CloneXAuthProvider, UniversalLoginButton, useCloneXAuth } from '@clonex/auth';
//
// function App() {
//   return (
//     <CloneXAuthProvider config={{ walletConnectProjectId: 'YOUR_ID' }}>
//       <UniversalLoginButton
//         routes={{ profile: '/profile', collections: '/collections' }}
//       />
//     </CloneXAuthProvider>
//   );
// }
// ```
//
// For OAuth (third-party apps):
// ```typescript
// import { CloneXOAuthClient, CloneXReadOnlyAccess } from '@clonex/auth';
//
// // Full OAuth flow
// const client = new CloneXOAuthClient({
//   clientId: 'your-id',
//   clientSecret: 'your-secret',
//   redirectUri: 'https://yourapp.com/callback'
// });
//
// // Or simpler API key access
// const access = new CloneXReadOnlyAccess('your-api-key');
// const user = await access.getUserByWallet('0x...');
// ```
// ============================================================================

// Types
export type {
  // Auth types
  AccessLevel,
  AuthStatus,
  CloneXUser,
  CloneXAuthConfig,
  UseCloneXAuthReturn,

  // NFT types
  NFTToken,
  NFTCollection,
  NFTCollections,
  NFTVerificationData,

  // API types
  NonceResponse,
  AuthResponse,
  SessionResponse,

  // OAuth types
  OAuthScope,
  OAuthToken,
  OAuthUserInfo,

  // UI types
  UniversalLoginRoutes,
  UniversalLoginButtonProps,
  UniversalLoginModalProps,

  // Event types
  AuthEvent,
  AuthEventType,
  AuthEventHandler
} from './types';

// Configuration
export {
  initCloneXAuth,
  getConfig,
  resetConfig,
  isCloneXDomain,
  getCurrentSubdomain,
  isDevelopment,
  getApiUrl,
  getApiHeaders,
  hasScope,
  getScopeDescriptions,
  getCookieOptions
} from './config';

export type { CookieOptions } from './config';

// Auth Service
export { authService, CloneXAuthService } from './authService';

// Auth Store (Zustand)
export {
  useAuthStore,
  isSessionValid,
  getCurrentUser,
  getNFTData,
  getAuthStatus,
  subscribeToAuthEvents
} from './authStore';

// Main Auth Hook
export { useCloneXAuth, resetAuthBootstrap } from './useCloneXAuth';

// Provider Components
export {
  CloneXAuthProvider,
  CloneXAuthProviderHeadless
} from './CloneXAuthProvider';

export type { CloneXAuthProviderProps } from './CloneXAuthProvider';

// UI Components
export {
  UniversalLoginButton,
  UniversalLoginModal
} from './components';

// OAuth (Third-party integration)
export {
  CloneXOAuthClient,
  CloneXReadOnlyAccess,
  useCloneXOAuth,
  saveOAuthToken,
  loadOAuthToken,
  clearOAuthToken
} from './oauth';

// ============================================================================
// Convenience re-exports from external packages (for apps that don't want
// to install wagmi/rainbowkit separately)
// ============================================================================

// Note: These are re-exported so apps can import everything from @clonex/auth
// without needing to install wagmi/rainbowkit directly
export {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage
} from 'wagmi';

export { ConnectButton } from '@rainbow-me/rainbowkit';
