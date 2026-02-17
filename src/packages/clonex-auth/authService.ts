// ============================================================================
// CloneX Auth SDK - Auth Service
// Version: 1.0.0
// Core authentication service for API communication
// ============================================================================

import {
  NonceResponse,
  AuthResponse,
  SessionResponse,
  NFTVerificationData,
  CloneXUser,
  OAuthToken,
  OAuthUserInfo,
  OAuthScope
} from './types';
import { getConfig, getApiUrl, getApiHeaders, isCloneXDomain } from './config';

// ============================================================================
// Auth Service Class
// ============================================================================

class CloneXAuthService {
  private getHeaders(): Record<string, string> {
    return {
      ...getApiHeaders(),
      'Origin': typeof window !== 'undefined' ? window.location.origin : ''
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
        message: response.statusText
      }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private log(message: string, ...args: any[]): void {
    if (getConfig().debug) {
      console.log(`🔐 [CloneX Auth] ${message}`, ...args);
    }
  }

  // ==========================================================================
  // Core Authentication Methods
  // ==========================================================================

  /**
   * Generate a nonce for wallet signature
   */
  async generateNonce(walletAddress: string): Promise<NonceResponse> {
    this.log('Generating nonce for:', walletAddress);
    const response = await fetch(`${getApiUrl()}/api/auth/wallet/nonce`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ walletAddress })
    });
    return this.handleResponse<NonceResponse>(response);
  }

  /**
   * Verify wallet signature - Sets httpOnly cookie
   */
  async verifySignature(
    walletAddress: string,
    signature: string,
    nonce: string
  ): Promise<AuthResponse> {
    this.log('Verifying signature for:', walletAddress);
    const response = await fetch(`${getApiUrl()}/api/auth/wallet/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ walletAddress, signature, nonce })
    });
    return this.handleResponse<AuthResponse>(response);
  }

  /**
   * Validate session using cookie
   */
  async validateSession(): Promise<SessionResponse> {
    this.log('Validating session via cookie...');
    const response = await fetch(`${getApiUrl()}/api/auth/session`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include'
    });

    if (response.status === 401) {
      return {
        success: true,
        authenticated: false,
        user: null,
        sessionValid: false
      };
    }

    return this.handleResponse<SessionResponse>(response);
  }

  /**
   * Verify NFTs for a wallet address
   */
  async verifyNFTs(walletAddress: string): Promise<NFTVerificationData> {
    this.log('Verifying NFTs for:', walletAddress);
    const response = await fetch(`${getApiUrl()}/api/nft/verify/${walletAddress}`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse<NFTVerificationData>(response);
  }

  /**
   * Logout - Clears httpOnly cookie
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    this.log('Logging out...');
    const response = await fetch(`${getApiUrl()}/api/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${getApiUrl()}/api/health`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response);
  }

  // ==========================================================================
  // OAuth Methods (for third-party app integration)
  // ==========================================================================

  /**
   * Initialize OAuth flow for third-party apps
   * Generates an authorization URL that the user should be redirected to
   */
  getOAuthAuthorizationUrl(
    clientId: string,
    redirectUri: string,
    scopes: OAuthScope[],
    state?: string
  ): string {
    const config = getConfig();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      response_type: 'code',
      state: state || crypto.randomUUID()
    });
    return `${config.apiBaseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange OAuth authorization code for tokens
   */
  async exchangeOAuthCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<OAuthToken> {
    this.log('Exchanging OAuth code...');
    const response = await fetch(`${getApiUrl()}/oauth/token`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });
    return this.handleResponse<OAuthToken>(response);
  }

  /**
   * Get user info using OAuth access token (read-only)
   */
  async getOAuthUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    this.log('Fetching OAuth user info...');
    const response = await fetch(`${getApiUrl()}/oauth/userinfo`, {
      headers: {
        ...this.getHeaders(),
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return this.handleResponse<OAuthUserInfo>(response);
  }

  /**
   * Refresh OAuth access token
   */
  async refreshOAuthToken(refreshToken: string, clientId: string): Promise<OAuthToken> {
    this.log('Refreshing OAuth token...');
    const response = await fetch(`${getApiUrl()}/oauth/token`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      })
    });
    return this.handleResponse<OAuthToken>(response);
  }

  /**
   * Revoke OAuth token
   */
  async revokeOAuthToken(token: string): Promise<void> {
    this.log('Revoking OAuth token...');
    await fetch(`${getApiUrl()}/oauth/revoke`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ token })
    });
  }

  // ==========================================================================
  // Token Utilities (for backward compatibility)
  // ==========================================================================

  /**
   * Decode JWT token payload
   * @deprecated Cookie-based auth handles tokens automatically
   */
  decodeToken(token?: string): any {
    try {
      const authToken = token || this.getToken();
      if (!authToken) return null;
      return JSON.parse(atob(authToken.split('.')[1]));
    } catch (error) {
      console.warn('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * @deprecated Cookie-based auth handles tokens automatically
   */
  isTokenExpired(token?: string): boolean {
    const authToken = token || this.getToken();
    if (!authToken) return true;

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token from localStorage
   * @deprecated Cookie-based auth handles tokens automatically
   */
  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('clonex_auth_token');
  }
}

// Export singleton instance
export const authService = new CloneXAuthService();

// Export class for testing
export { CloneXAuthService };
