// ============================================================================
// CloneX Auth SDK - Configuration
// Version: 1.0.0
// Centralized configuration for the CloneX authentication system
// ============================================================================

import { CloneXAuthConfig, OAuthScope } from './types';

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG: Required<CloneXAuthConfig> = {
  apiBaseUrl: 'https://api.clonex.wtf',
  apiTimeout: 15000,
  walletConnectProjectId: '',
  enableCoinbaseWallet: false,
  debug: false,
  cookieDomain: '.clonex.wtf',
  sessionCookieName: 'clonex_session',
  accessTokenCookieName: 'clonex_access_token',
  oauthMode: false,
  oauthScopes: ['profile:read', 'nfts:read', 'access_level:read'],
  oauthCallbackUrl: ''
};

// ============================================================================
// Configuration Store (Singleton)
// ============================================================================

let currentConfig: Required<CloneXAuthConfig> = { ...DEFAULT_CONFIG };

/**
 * Initialize the CloneX Auth SDK with custom configuration
 */
export function initCloneXAuth(config: CloneXAuthConfig): Required<CloneXAuthConfig> {
  currentConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    // Ensure scopes is always an array
    oauthScopes: config.oauthScopes || DEFAULT_CONFIG.oauthScopes
  };

  if (currentConfig.debug) {
    console.log('🔧 [CloneX Auth] Initialized with config:', {
      apiBaseUrl: currentConfig.apiBaseUrl,
      oauthMode: currentConfig.oauthMode,
      cookieDomain: currentConfig.cookieDomain
    });
  }

  return currentConfig;
}

/**
 * Get the current configuration
 */
export function getConfig(): Required<CloneXAuthConfig> {
  return currentConfig;
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  currentConfig = { ...DEFAULT_CONFIG };
}

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Detect if running on a CloneX domain
 */
export function isCloneXDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.endsWith('.clonex.wtf') || hostname === 'clonex.wtf';
}

/**
 * Get current subdomain
 */
export function getCurrentSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname;

  if (hostname.endsWith('.clonex.wtf')) {
    return hostname.replace('.clonex.wtf', '') || 'www';
  }
  if (hostname === 'clonex.wtf') {
    return 'www';
  }
  return hostname;
}

/**
 * Detect if running in development mode
 */
export function isDevelopment(): boolean {
  return typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;
}

/**
 * Get API URL based on environment
 */
export function getApiUrl(): string {
  if (isDevelopment()) {
    return 'http://localhost:3000';
  }
  return currentConfig.apiBaseUrl;
}

// ============================================================================
// API Headers
// ============================================================================

export function getApiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Client-Platform': 'clonex-auth-sdk'
  };
}

// ============================================================================
// OAuth Scope Helpers
// ============================================================================

/**
 * Check if a scope is included in the current config
 */
export function hasScope(scope: OAuthScope): boolean {
  return currentConfig.oauthScopes.includes(scope);
}

/**
 * Get scope descriptions for display
 */
export function getScopeDescriptions(scopes: OAuthScope[]): string[] {
  const descriptions: Record<OAuthScope, string> = {
    'profile:read': 'Read your wallet address and display name',
    'nfts:read': 'View your NFT holdings',
    'collections:read': 'View your collection counts',
    'access_level:read': 'View your access tier',
    'delegation:read': 'View your delegation setup'
  };
  return scopes.map(scope => descriptions[scope]);
}

// ============================================================================
// Cookie Configuration
// ============================================================================

export interface CookieOptions {
  domain?: string;
  path?: string;
  expires?: Date | number;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export function getCookieOptions(): CookieOptions {
  return {
    domain: isCloneXDomain() ? currentConfig.cookieDomain : undefined,
    path: '/',
    secure: !isDevelopment(),
    sameSite: 'Lax'
  };
}
