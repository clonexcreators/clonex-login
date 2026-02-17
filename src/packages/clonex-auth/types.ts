// ============================================================================
// CloneX Auth SDK - Core Types & Interfaces
// Version: 1.0.0
// Universal type definitions for CloneX authentication across all platforms
// ============================================================================

// ============================================================================
// Access Levels - NFT-based tier system
// ============================================================================

export type AccessLevel =
  | 'COSMIC_CHAMPION'    // 25+ CloneX, 10+ Animus
  | 'CLONE_VANGUARD'     // 15+ CloneX, 5+ Animus
  | 'DNA_DISCIPLE'       // 5+ CloneX, 1+ Animus
  | 'ANIMUS_PRIME'       // 5+ Animus
  | 'ANIMUS_HATCHLING'   // 1+ CloneX OR 1+ Animus
  | 'LOST_CODE';         // No qualifying NFTs

// ============================================================================
// Auth State Machine
// ============================================================================

export type AuthStatus =
  | 'booting'           // Initial state, checking for existing session
  | 'idle'              // No wallet connected, ready to connect
  | 'wallet_connected'  // Wallet connected, ready to sign in
  | 'authenticating'    // Sign-in in progress
  | 'loading_nfts'      // Authenticated, loading NFT data
  | 'ready'             // Fully authenticated with NFT data
  | 'error';            // Error state

// ============================================================================
// User & Profile Types
// ============================================================================

export interface CloneXUser {
  walletAddress: string;
  accessLevel?: AccessLevel;
  isAuthenticated?: boolean;
  displayName?: string;
  hasAccess?: boolean;
  eligibleNFTs?: number;
  nftCount?: number;
  collections?: {
    clonex: number;
    animus: number;
    animus_eggs: number;
    clonex_vials: number;
  };
  hasDelegation?: boolean;
  sessionId?: string;
  universalSession?: boolean;
  avatar?: {
    url: string | null;
    type: 'nft' | 'uploaded' | 'default';
    nftDetails?: {
      contract: string;
      tokenId: string;
      collection: string;
    };
  };
  bio?: string;
}

// ============================================================================
// NFT Types
// ============================================================================

export interface NFTToken {
  contractAddress?: string;
  contract?: string;
  tokenId: string;
  metadata?: {
    name?: string;
    image?: string;
    [key: string]: any;
  };
  image?: string;
  imageUrl?: string;
  name?: string;
  displayName?: string;
  collection?: string;
  ownershipType?: 'direct' | 'delegated';
  isDelegated?: boolean;
  vaultWallet?: string;
}

export interface NFTCollection {
  count: number;
  tokens: NFTToken[];
}

export interface NFTCollections {
  clonex?: NFTCollection;
  animus?: NFTCollection;
  animus_eggs?: NFTCollection;
  clonex_vials?: NFTCollection;
}

export interface NFTVerificationData {
  success: boolean;
  walletAddress: string;
  accessLevel: AccessLevel;
  nfts?: NFTToken[];
  totalNFTs?: number;
  collections?: {
    clonex: number;
    animus: number;
    animus_eggs: number;
    clonex_vials: number;
  };
  nftCollections?: NFTCollections;
  delegationInfo?: {
    hasDelegatedNFTs: boolean;
    vaultAddresses: string[];
    totalVaults: number;
    actuallyDelegatedNFTs: number;
  };
  breakdown?: {
    direct: { total: number; collections: any; nfts: NFTToken[] };
    delegated: { total: number; collections: any; nfts: NFTToken[] };
  };
  cached?: boolean;
  hasAccess?: boolean;
  eligibleNFTs?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface NonceResponse {
  success: boolean;
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user: CloneXUser;
  expiresIn?: string;
  tokenType?: string;
  cookieMode?: boolean;
  sessionCreated?: boolean;
  universalSession?: boolean;
  apiVersion?: string;
}

export interface SessionResponse {
  success: boolean;
  authenticated: boolean;
  session?: {
    sessionId: string;
    userId: string;
    isActive: boolean;
    createdAt: string;
    expiresAt: string;
    lastActivity: string;
  };
  user: CloneXUser | null;
  sessionValid?: boolean;
  cookieMode?: boolean;
  apiVersion?: string;
  message?: string;
  reason?: string;
}

// ============================================================================
// Auth SDK Configuration
// ============================================================================

export interface CloneXAuthConfig {
  /** API base URL - defaults to https://api.clonex.wtf */
  apiBaseUrl?: string;
  /** API request timeout in ms */
  apiTimeout?: number;
  /** WalletConnect project ID (required for production) */
  walletConnectProjectId?: string;
  /** Enable Coinbase Wallet integration */
  enableCoinbaseWallet?: boolean;
  /** Enable debug logging */
  debug?: boolean;
  /** Cookie domain for cross-subdomain SSO */
  cookieDomain?: string;
  /** Session cookie name */
  sessionCookieName?: string;
  /** Access token cookie name */
  accessTokenCookieName?: string;
  /** OAuth mode - enables read-only access for third-party apps */
  oauthMode?: boolean;
  /** OAuth scopes when in OAuth mode */
  oauthScopes?: OAuthScope[];
  /** Callback URL for OAuth flow */
  oauthCallbackUrl?: string;
}

// ============================================================================
// OAuth Types (for third-party app integration)
// ============================================================================

export type OAuthScope =
  | 'profile:read'      // Read user profile (wallet, display name, avatar)
  | 'nfts:read'         // Read NFT holdings
  | 'collections:read'  // Read collection counts
  | 'access_level:read' // Read access level tier
  | 'delegation:read';  // Read delegation info

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
  scopes: OAuthScope[];
  issuedAt: number;
}

export interface OAuthUserInfo {
  walletAddress: string;
  displayName?: string;
  avatar?: string;
  accessLevel?: AccessLevel;
  nftCount?: number;
  collections?: {
    clonex: number;
    animus: number;
  };
  scopes: OAuthScope[];
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface UniversalLoginRoutes {
  profile?: string;
  collections?: string;
  home?: string;
}

export interface UniversalLoginButtonProps {
  routes?: UniversalLoginRoutes;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  onNavigate?: (route: string) => void;
}

export interface UniversalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes?: UniversalLoginRoutes;
  onNavigate?: (route: string) => void;
}

// ============================================================================
// Auth Hook Return Type
// ============================================================================

export interface UseCloneXAuthReturn {
  // State
  user: CloneXUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  nftData: NFTVerificationData | null;
  authStatus: AuthStatus;

  // Actions
  login: () => Promise<void>;
  logout: () => void;
  disconnectWallet: () => void;
  refreshNFTs: () => Promise<void>;
  clearError: () => void;
  checkSessionStatus: () => Promise<boolean>;
}

// ============================================================================
// Event Types (for cross-platform communication)
// ============================================================================

export type AuthEventType =
  | 'auth:connected'
  | 'auth:disconnected'
  | 'auth:authenticated'
  | 'auth:logout'
  | 'auth:error'
  | 'auth:nfts_loaded'
  | 'auth:status_change';

export interface AuthEvent {
  type: AuthEventType;
  payload?: {
    user?: CloneXUser;
    nftData?: NFTVerificationData;
    error?: string;
    status?: AuthStatus;
  };
  timestamp: number;
}

export type AuthEventHandler = (event: AuthEvent) => void;
