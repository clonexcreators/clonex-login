// ============================================================================
// CloneX Auth SDK - OAuth Adapter
// Version: 1.0.0
// Read-only OAuth integration for third-party apps
// ============================================================================

import {
  OAuthScope,
  OAuthToken,
  OAuthUserInfo,
  CloneXUser,
  NFTVerificationData,
  AccessLevel
} from './types';
import { authService } from './authService';
import { getConfig } from './config';

// ============================================================================
// OAuth Client Class
// ============================================================================

/**
 * CloneXOAuthClient - For third-party apps to authenticate users
 *
 * Usage:
 * ```typescript
 * import { CloneXOAuthClient } from '@clonex/auth';
 *
 * const client = new CloneXOAuthClient({
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 *   redirectUri: 'https://yourapp.com/callback',
 *   scopes: ['profile:read', 'nfts:read']
 * });
 *
 * // Get authorization URL
 * const authUrl = client.getAuthorizationUrl();
 * window.location.href = authUrl;
 *
 * // After redirect back, exchange code for token
 * const token = await client.exchangeCode(code);
 *
 * // Get user info
 * const userInfo = await client.getUserInfo(token.accessToken);
 * ```
 */
export class CloneXOAuthClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scopes: OAuthScope[];
  private token: OAuthToken | null = null;

  constructor(options: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes?: OAuthScope[];
  }) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.redirectUri = options.redirectUri;
    this.scopes = options.scopes || ['profile:read'];
  }

  // ==========================================================================
  // Authorization Flow
  // ==========================================================================

  /**
   * Get the authorization URL to redirect users to
   */
  getAuthorizationUrl(state?: string): string {
    return authService.getOAuthAuthorizationUrl(
      this.clientId,
      this.redirectUri,
      this.scopes,
      state
    );
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string): Promise<OAuthToken> {
    this.token = await authService.exchangeOAuthCode(
      code,
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
    return this.token;
  }

  /**
   * Set token from storage
   */
  setToken(token: OAuthToken): void {
    this.token = token;
  }

  /**
   * Get current token
   */
  getToken(): OAuthToken | null {
    return this.token;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (!this.token) return true;
    const expiresAt = this.token.issuedAt + (this.token.expiresIn * 1000);
    return Date.now() > expiresAt;
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<OAuthToken> {
    if (!this.token?.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.token = await authService.refreshOAuthToken(
      this.token.refreshToken,
      this.clientId
    );

    return this.token;
  }

  // ==========================================================================
  // Read-Only API Methods
  // ==========================================================================

  /**
   * Get user profile information
   */
  async getUserInfo(accessToken?: string): Promise<OAuthUserInfo> {
    const token = accessToken || this.token?.accessToken;
    if (!token) {
      throw new Error('No access token available');
    }

    return authService.getOAuthUserInfo(token);
  }

  /**
   * Check if scope is granted
   */
  hasScope(scope: OAuthScope): boolean {
    return this.token?.scopes.includes(scope) || false;
  }

  // ==========================================================================
  // Logout
  // ==========================================================================

  /**
   * Revoke token and clear state
   */
  async logout(): Promise<void> {
    if (this.token?.accessToken) {
      await authService.revokeOAuthToken(this.token.accessToken);
    }
    this.token = null;
  }

  /**
   * Clear local token state (without revoking)
   */
  clear(): void {
    this.token = null;
  }
}

// ============================================================================
// Read-Only Access Helper
// ============================================================================

/**
 * CloneXReadOnlyAccess - Simplified read-only access for third-party apps
 *
 * Usage:
 * ```typescript
 * import { CloneXReadOnlyAccess } from '@clonex/auth';
 *
 * const access = new CloneXReadOnlyAccess('your-api-key');
 *
 * // Get user info by wallet address
 * const user = await access.getUserByWallet('0x...');
 *
 * // Verify NFT holdings
 * const nfts = await access.verifyNFTs('0x...');
 *
 * // Check access level
 * const level = await access.getAccessLevel('0x...');
 * ```
 */
export class CloneXReadOnlyAccess {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || getConfig().apiBaseUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get public user info by wallet address
   */
  async getUserByWallet(walletAddress: string): Promise<{
    walletAddress: string;
    displayName?: string;
    avatar?: string;
    accessLevel?: AccessLevel;
    isVerified: boolean;
  }> {
    return this.fetch(`/api/public/user/${walletAddress}`);
  }

  /**
   * Verify NFT holdings for a wallet
   */
  async verifyNFTs(walletAddress: string): Promise<{
    hasAccess: boolean;
    accessLevel: AccessLevel;
    collections: {
      clonex: number;
      animus: number;
    };
    totalNFTs: number;
  }> {
    return this.fetch(`/api/public/nft/verify/${walletAddress}`);
  }

  /**
   * Get access level for a wallet
   */
  async getAccessLevel(walletAddress: string): Promise<AccessLevel> {
    const result = await this.verifyNFTs(walletAddress);
    return result.accessLevel;
  }

  /**
   * Check if wallet has access to a specific tier
   */
  async hasAccessLevel(
    walletAddress: string,
    requiredLevel: AccessLevel
  ): Promise<boolean> {
    const tierRanking: AccessLevel[] = [
      'COSMIC_CHAMPION',
      'CLONE_VANGUARD',
      'DNA_DISCIPLE',
      'ANIMUS_PRIME',
      'ANIMUS_HATCHLING',
      'LOST_CODE'
    ];

    const userLevel = await this.getAccessLevel(walletAddress);
    const userRank = tierRanking.indexOf(userLevel);
    const requiredRank = tierRanking.indexOf(requiredLevel);

    return userRank <= requiredRank;
  }
}

// ============================================================================
// Token Storage Helpers
// ============================================================================

const OAUTH_TOKEN_KEY = 'clonex_oauth_token';

/**
 * Save OAuth token to localStorage
 */
export function saveOAuthToken(token: OAuthToken): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(OAUTH_TOKEN_KEY, JSON.stringify(token));
  }
}

/**
 * Load OAuth token from localStorage
 */
export function loadOAuthToken(): OAuthToken | null {
  if (typeof localStorage === 'undefined') return null;

  const stored = localStorage.getItem(OAUTH_TOKEN_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear OAuth token from localStorage
 */
export function clearOAuthToken(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(OAUTH_TOKEN_KEY);
  }
}

// ============================================================================
// React Hook for OAuth
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

interface UseCloneXOAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: OAuthUserInfo | null;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  client: CloneXOAuthClient;
}

/**
 * React hook for OAuth authentication
 *
 * Usage:
 * ```tsx
 * const { isAuthenticated, userInfo, login, logout } = useCloneXOAuth({
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 *   redirectUri: 'https://yourapp.com/callback'
 * });
 *
 * if (!isAuthenticated) {
 *   return <button onClick={login}>Login with CloneX</button>;
 * }
 *
 * return <p>Welcome, {userInfo?.displayName}</p>;
 * ```
 */
export function useCloneXOAuth(options: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: OAuthScope[];
}): UseCloneXOAuthReturn {
  const [client] = useState(() => new CloneXOAuthClient(options));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<OAuthUserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = loadOAuthToken();
    if (storedToken && !isTokenExpired(storedToken)) {
      client.setToken(storedToken);
      fetchUserInfo();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Check URL for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      handleCallback(code);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleCallback = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await client.exchangeCode(code);
      saveOAuthToken(token);
      await fetchUserInfo();
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const info = await client.getUserInfo();
      setUserInfo(info);
      setIsAuthenticated(true);
    } catch (err) {
      setError((err as Error).message);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(() => {
    window.location.href = client.getAuthorizationUrl();
  }, [client]);

  const logout = useCallback(async () => {
    await client.logout();
    clearOAuthToken();
    setIsAuthenticated(false);
    setUserInfo(null);
  }, [client]);

  return {
    isAuthenticated,
    isLoading,
    userInfo,
    error,
    login,
    logout,
    client
  };
}

function isTokenExpired(token: OAuthToken): boolean {
  const expiresAt = token.issuedAt + (token.expiresIn * 1000);
  return Date.now() > expiresAt;
}
