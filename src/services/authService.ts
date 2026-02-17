import {
  API_CONFIG,
  API_URL,
  NonceResponse,
  AuthResponse,
  SessionStatusResponse,
  NFTVerificationResponse,
  APIError
} from '../config/api';

/**
 * AuthService - Cookie-Based SSO Authentication
 *
 * Per Backend Bible v3.5.2, this service uses httpOnly cookie-based authentication.
 * The backend sets/clears cookies automatically - no localStorage token management needed.
 *
 * Key endpoints:
 * - POST /api/auth/wallet/nonce - Get signing nonce
 * - POST /api/auth/wallet/verify - Verify signature (sets cookie)
 * - GET /api/auth/session - Validate session via cookie (NEW - Phase 1 SSO)
 * - POST /api/auth/logout - Logout (clears cookie)
 */
class AuthService {
  private getHeaders(): Record<string, string> {
    return {
      ...API_CONFIG.headers,
      'Origin': window.location.origin
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

  /**
   * Generate a nonce for wallet signature
   */
  async generateNonce(walletAddress: string): Promise<NonceResponse> {
    const response = await fetch(`${API_URL}/api/auth/wallet/nonce`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ walletAddress })
    });

    return this.handleResponse<NonceResponse>(response);
  }

  /**
   * Verify wallet signature - Backend sets httpOnly cookie automatically
   * No token returned in body when cookieMode: true
   */
  async verifySignature(
    walletAddress: string,
    signature: string,
    nonce: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/wallet/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',  // CRITICAL: Required for cookie to be set
      body: JSON.stringify({ walletAddress, signature, nonce })
    });

    const result = await this.handleResponse<AuthResponse>(response);
    return result;
  }

  /**
   * Validate session using cookie (Phase 1 SSO)
   * Uses GET /api/auth/session - no Authorization header needed
   * Cookie is sent automatically with credentials: 'include'
   */
  async validateSession(): Promise<SessionStatusResponse> {
    const response = await fetch(`${API_URL}/api/auth/session`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include'  // Cookie sent automatically
    });

    // Don't throw on 401 - it just means no valid session
    if (response.status === 401) {
      return {
        success: true,
        authenticated: false,
        user: null,
        sessionValid: false
      } as SessionStatusResponse;
    }

    return this.handleResponse<SessionStatusResponse>(response);
  }

  /**
   * Verify NFTs for a wallet address
   */
  async verifyNFTs(walletAddress: string): Promise<NFTVerificationResponse> {
    const response = await fetch(`${API_URL}/api/nft/verify/${walletAddress}`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });

    return this.handleResponse<NFTVerificationResponse>(response);
  }

  /**
   * Fetch user profile data (displayName, avatar, bio, etc.)
   * Requires authenticated session (cookie-based)
   */
  async fetchProfile(): Promise<{
    success: boolean;
    profile?: {
      walletAddress: string;
      displayName: string | null;
      bio: string | null;
      avatar: {
        type: string | null;
        url: string | null;
        collectionId: string | null;
        tokenId: string | null;
        updatedAt: string | null;
      };
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        headers: this.getHeaders(),
        credentials: 'include'
      });

      // Handle 401 gracefully - profile may not exist yet
      if (response.status === 401) {
        return {
          success: false,
          error: 'Not authenticated'
        };
      }

      const data = await this.handleResponse<any>(response);

      return {
        success: true,
        profile: {
          walletAddress: data.walletAddress,
          displayName: data.displayName,
          bio: data.bio,
          avatar: data.avatar
        }
      };
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
      return {
        success: false,
        error: (err as Error).message
      };
    }
  }

  /**
   * Logout - Backend clears the httpOnly cookie
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include'  // Required to clear the cookie
    });

    return this.handleResponse(response);
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_URL}/api/health`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });

    return this.handleResponse(response);
  }

  // =========================================================================
  // LEGACY TOKEN MANAGEMENT - DEPRECATED
  // Kept for backward compatibility during migration, but not used in
  // cookie-based auth flow. Will be removed in a future version.
  // =========================================================================

  /** @deprecated Cookie-based auth handles tokens automatically */
  getToken(): string | null {
    return localStorage.getItem('clonex_auth_token');
  }

  /** @deprecated Cookie-based auth handles tokens automatically */
  setToken(token: string): void {
    localStorage.setItem('clonex_auth_token', token);
    console.log('⚠️ [DEPRECATED] Token stored in localStorage');
  }

  /** @deprecated Cookie-based auth handles tokens automatically */
  clearToken(): void {
    localStorage.removeItem('clonex_auth_token');
    console.log('🗑️ Cleared legacy localStorage token');
  }

  /** @deprecated Cookie-based auth handles token expiry automatically */
  isTokenExpired(token?: string): boolean {
    const authToken = token || this.getToken();
    if (!authToken) return true;

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.warn('Invalid token format:', error);
      return true;
    }
  }

  /**
   * Decode JWT token payload
   * @deprecated Cookie-based auth handles tokens automatically, but kept for backward compatibility
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
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };