// Production API configuration for CloneX Universal Login
// Backend: https://api.clonex.wtf

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  baseURL: 'https://api.clonex.wtf',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Environment-aware API URL
export const getApiUrl = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:3000';  // Local development
  }
  return 'https://api.clonex.wtf';  // Production - cross-subdomain with cookie
};

export const API_URL = getApiUrl();

// ============================================================================
// Access Level Type
// ============================================================================

export type AccessLevel =
  | 'COSMIC_CHAMPION'    // 25+ CloneX, 10+ Animus
  | 'CLONE_VANGUARD'     // 15+ CloneX, 5+ Animus
  | 'DNA_DISCIPLE'       // 5+ CloneX, 1+ Animus
  | 'ANIMUS_PRIME'       // 5+ Animus
  | 'ANIMUS_HATCHLING'   // 1+ CloneX OR 1+ Animus
  | 'LOST_CODE';         // No qualifying NFTs

// ============================================================================
// Core Interfaces
// ============================================================================

// Core user interface - Per Backend Bible v3.5.2
export interface AuthUser {
  walletAddress: string;
  accessLevel?: AccessLevel;
  isAuthenticated?: boolean;
  displayName?: string;
  hasAccess?: boolean;
  eligibleNFTs?: number;
  accessReason?: string;
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
  gmPoints?: {
    total: number;
    canClaim: boolean;
    lastClaimed: string;
  };
  // Profile data for unified identity
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

// Authentication responses
export interface NonceResponse {
  success: boolean;
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;  // Optional when cookieMode: true
  user: AuthUser;
  expiresIn?: string;
  tokenType?: string;  // "Cookie" when cookie-based
  cookieMode?: boolean;  // true for cookie-based auth
  sessionCreated?: boolean;
  universalSession?: boolean;
  apiVersion?: string;
}

// Per Backend Bible v3.5.2, GET /api/auth/session response
export interface SessionStatusResponse {
  success: boolean;
  authenticated: boolean;  // Primary auth check field
  session?: {
    sessionId: string;
    userId: string;
    isActive: boolean;
    createdAt: string;
    expiresAt: string;
    lastActivity: string;
  };
  user: AuthUser | null;
  sessionValid?: boolean;  // Legacy field for backward compat
  cookieMode?: boolean;
  apiVersion?: string;
  message?: string;  // e.g., "No session cookie present"
  reason?: string;   // e.g., "Session expired"
}

// ============================================================================
// NFT Verification Types
// ============================================================================

export interface NFTToken {
  contractAddress?: string;
  contract?: string;  // API may return 'contract' instead of 'contractAddress'
  tokenId: string;
  metadata?: {
    name?: string;
    image?: string;
    [key: string]: any;
  };
  // API returns 'image' directly on some responses
  image?: string;
  imageUrl?: string;  // Legacy field
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

export interface NFTVerificationResponse {
  success: boolean;
  walletAddress: string;
  accessLevel: AccessLevel;
  // Top-level NFT array (actual API response format)
  nfts?: NFTToken[];
  totalNFTs?: number;
  // Collection counts (actual API response format)
  collections?: {
    clonex: number;
    animus: number;
    animus_eggs: number;
    clonex_vials: number;
  };
  // Detailed collection data with tokens
  nftCollections?: {
    clonex?: NFTCollection;
    animus?: NFTCollection;
    animus_eggs?: NFTCollection;
    clonex_vials?: NFTCollection;
  };
  // Delegation info
  delegatedAccess?: {
    enabled: boolean;
    vaultWallets?: string[];
    delegatedNFTs?: NFTToken[];
  };
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
  verificationMethod?: 'ALCHEMY' | 'MORALIS' | 'ETHERSCAN' | 'alchemy' | 'moralis' | 'etherscan';
  lastVerified?: string;
  lastUpdated?: string;
  cached?: boolean;
  hasAccess?: boolean;
  eligibleNFTs?: number;
  accessReason?: string;
}

// ============================================================================
// Error Handling
// ============================================================================

export interface APIError {
  success: false;
  error: string;
  message: string;
  code?: number;
}

export type APIResponse<T> = T | APIError;
