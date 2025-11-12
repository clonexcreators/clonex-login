/**
 * CloneX Profile Service
 * Handles profile management, reset, and public profiles
 * Version: 1.0.0
 * Phase: 2.4 - Profile Reset & Public Pages
 */

const API_BASE_URL = 'https://api.clonex.wtf';

export interface UserProfile {
  walletAddress: string;
  displayName: string | null;
  bio: string | null;
  avatar: {
    url: string | null;
    type: 'nft' | 'uploaded' | 'default';
    nftDetails?: {
      contract: string;
      tokenId: string;
      collection: string;
    };
  };
  access: {
    hasAccess: boolean;
    eligibleNFTs: number;
    accessReason: string;
  };
  nfts: {
    collections: Record<string, number>;
    totalNFTs: number;
    totalDelegatedNFTs: number;
  };
  social: {
    discord?: {
      verified: boolean;
      username: string | null;
      verifiedAt: string | null;
    };
    x?: {
      verified: boolean;
      username: string | null;
      verifiedAt: string | null;
    };
  };
  privacy: {
    profilePublic: boolean;
    showNfts: boolean;
    showWallet: boolean;
  };
  gmPoints: {
    total: number;
    lastClaimed: string | null;
    totalClaims: number;
    canClaim: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserProfile {
  walletAddress: string;
  displayName: string | null;
  bio: string | null;
  avatar: {
    url: string | null;
    type: 'nft' | 'uploaded' | 'default';
  };
  access: {
    hasAccess: boolean;
    eligibleNFTs: number;
  };
  nfts: {
    collections: Record<string, number>;
    totalNFTs: number;
    items?: Array<{
      contract: string;
      tokenId: string;
      collection: string;
      name?: string;
      image?: string;
      metadata?: Record<string, any>;
    }>;
  };
  social: {
    discord?: {
      verified: boolean;
      username: string | null;
    };
    x?: {
      verified: boolean;
      username: string | null;
    };
  };
  privacy: {
    showNfts: boolean;
    showWallet: boolean;
  };
  createdAt: string;
}

export interface ProfileUpdateData {
  displayName?: string | null;
  bio?: string | null;
  privacy?: {
    profilePublic?: boolean;
    showNfts?: boolean;
    showWallet?: boolean;
  };
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  message?: string;
  error?: string;
}

export interface DeleteProfileResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface PublicProfileResponse {
  success: boolean;
  profile?: PublicUserProfile;
  message?: string;
  error?: string;
}

class ProfileService {
  private getAuthToken(): string | null {
    return localStorage.getItem('clonex_auth_token');
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get authenticated user's profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/profile`,
        {
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch profile: ${response.statusText}`
        );
      }

      const data: ProfileResponse = await response.json();

      if (!data.success || !data.profile) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      console.log('✅ Profile fetched successfully');
      return data.profile;

    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/profile`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to update profile: ${response.statusText}`
        );
      }

      const data: ProfileResponse = await response.json();

      if (!data.success || !data.profile) {
        throw new Error(data.error || 'Failed to update profile');
      }

      console.log('✅ Profile updated successfully');
      return data.profile;

    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Delete/reset user profile
   * This removes all profile data but preserves wallet address and NFT holdings
   */
  async deleteProfile(): Promise<DeleteProfileResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/profile`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to reset profile: ${response.statusText}`
        );
      }

      const data: DeleteProfileResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to reset profile');
      }

      console.log('✅ Profile reset successfully');
      return data;

    } catch (error) {
      console.error('❌ Failed to reset profile:', error);
      throw error;
    }
  }

  /**
   * Get public profile by wallet address
   * Only returns data if profile is set to public
   */
  async getPublicProfile(walletAddress: string): Promise<PublicUserProfile> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/${walletAddress}/public`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 404) {
        throw new Error('Profile not found or not public');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch public profile: ${response.statusText}`
        );
      }

      const data: PublicProfileResponse = await response.json();

      if (!data.success || !data.profile) {
        throw new Error(data.error || 'Failed to fetch public profile');
      }

      console.log('✅ Public profile fetched successfully');
      return data.profile;

    } catch (error) {
      console.error('❌ Failed to fetch public profile:', error);
      throw error;
    }
  }

  /**
   * Generate shareable profile URL
   */
  getShareableProfileURL(walletAddress: string): string {
    return `${window.location.origin}/profile/${walletAddress}`;
  }

  /**
   * Check if profile is viewable publicly
   */
  async isProfilePublic(walletAddress: string): Promise<boolean> {
    try {
      await this.getPublicProfile(walletAddress);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Share profile (uses Web Share API if available, otherwise copies URL)
   */
  async shareProfile(profile: PublicUserProfile): Promise<void> {
    const url = this.getShareableProfileURL(profile.walletAddress);
    const title = `${profile.displayName || 'CloneX'} Profile`;
    const text = 'Check out this CloneX profile!';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        console.log('✅ Profile shared successfully');
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', error);
        throw error;
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        console.log('✅ Profile URL copied to clipboard');
      } catch (error) {
        console.error('❌ Failed to copy URL:', error);
        throw new Error('Failed to copy profile URL');
      }
    }
  }
}

export const profileService = new ProfileService();
