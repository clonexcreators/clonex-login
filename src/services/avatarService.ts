/**
 * CloneX Avatar Service
 * Handles avatar selection from NFTs and custom uploads
 * Version: 1.0.0
 * Phase: 2.2 - Avatar Picker & Uploader
 */

import { getNFTImageUrl, getNFTDisplayName, isNFTDelegated, getNFTCollection } from '../utils/nftUtils';

const API_BASE_URL = 'https://api.clonex.wtf';

export interface NFTAvatar {
  contract: string;
  tokenId: string;
  collection: string;
  name: string | null;
  displayName: string | null;
  image: string | null;
  imageFull: string | null;
  metadata?: Record<string, any>;
  ownershipType: 'direct' | 'delegated';
  source: 'direct' | 'delegate.xyz' | 'warm.xyz';
}

export interface AvatarOption {
  id: string;
  url: string;
  thumbnailUrl: string;
  type: 'nft';
  nft: NFTAvatar;
}

export interface CustomAvatarUploadResponse {
  success: boolean;
  avatar: {
    url: string;
    type: 'uploaded';
  };
  message?: string;
  error?: string;
}

export interface SetAvatarResponse {
  success: boolean;
  profile: {
    avatar: {
      url: string;
      type: 'nft' | 'uploaded' | 'default';
      nftDetails?: {
        contract: string;
        tokenId: string;
        collection: string;
      };
    };
  };
  message?: string;
  error?: string;
}

class AvatarService {
  // Cookie-based auth (Backend Bible v3.5.2) - no localStorage token needed
  // Session cookie is sent automatically with credentials: 'include'
  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch available NFT avatars for the authenticated user
   * Uses the enhanced NFT verification endpoint with metadata enrichment
   */
  async getAvatarOptions(walletAddress: string): Promise<AvatarOption[]> {
    try {
      // Use the enhanced multi-delegation NFT endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/nft/verify-multi/${walletAddress}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
          credentials: 'include'  // CRITICAL: Send session cookie
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch NFT avatars: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch NFT avatars');
      }

      // Extract all NFTs from the breakdown (direct, delegate.xyz, warm.xyz)
      const allNFTs: NFTAvatar[] = [];

      if (data.breakdown) {
        // Collect NFTs from all sources
        const sources = ['direct', 'delegate.xyz', 'warm.xyz'] as const;
        
        for (const source of sources) {
          const sourceData = data.breakdown[source];
          if (sourceData?.nfts && Array.isArray(sourceData.nfts)) {
            allNFTs.push(...sourceData.nfts);
          }
        }
      }

      // Filter to only CloneX and Animus (eligible collections)
      const eligibleNFTs = allNFTs.filter(nft => {
        const collection = getNFTCollection(nft);
        return collection === 'clonex' || collection === 'animus';
      });

      // Convert to avatar options using robust image extraction
      const avatarOptions: AvatarOption[] = eligibleNFTs
        .map(nft => {
          const imageUrl = getNFTImageUrl(nft);
          if (!imageUrl) return null; // Skip NFTs without images

          return {
            id: `${nft.contract}-${nft.tokenId}`,
            url: nft.imageFull || imageUrl,
            thumbnailUrl: imageUrl,
            type: 'nft' as const,
            nft: {
              ...nft,
              image: imageUrl, // Ensure image field is populated
              displayName: getNFTDisplayName(nft),
              ownershipType: isNFTDelegated(nft) ? 'delegated' : 'direct'
            }
          };
        })
        .filter((option): option is AvatarOption => option !== null);

      console.log(`✅ Fetched ${avatarOptions.length} NFT avatar options`);
      return avatarOptions;

    } catch (error) {
      console.error('❌ Failed to fetch avatar options:', error);
      throw error;
    }
  }

  /**
   * Upload a custom avatar image
   * Max size: 5MB
   * Supported formats: PNG, JPEG, WebP
   */
  async uploadCustomAvatar(file: File): Promise<CustomAvatarUploadResponse> {
    try {
      // Validate file
      this.validateAvatarFile(file);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Cookie-based auth - no Authorization header needed
      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/avatar-upload`,
        {
          method: 'POST',
          // Don't set Content-Type - browser will set it with boundary for multipart
          credentials: 'include',  // CRITICAL: Send session cookie
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Upload failed: ${response.statusText}`
        );
      }

      const data: CustomAvatarUploadResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log('✅ Avatar uploaded successfully');
      return data;

    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      throw error;
    }
  }

  /**
   * Set active avatar (either NFT or uploaded)
   */
  async setAvatar(avatarData: {
    type: 'nft' | 'uploaded' | 'default';
    nftDetails?: {
      contract: string;
      tokenId: string;
      collection: string;
    };
    url?: string;
  }): Promise<SetAvatarResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/avatar`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          credentials: 'include',  // CRITICAL: Send session cookie
          body: JSON.stringify(avatarData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to set avatar: ${response.statusText}`
        );
      }

      const data: SetAvatarResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to set avatar');
      }

      console.log('✅ Avatar set successfully');
      return data;

    } catch (error) {
      console.error('❌ Failed to set avatar:', error);
      throw error;
    }
  }

  /**
   * Set NFT avatar (convenience method)
   * Backend expects collectionId (1=CloneX, 2=Animus) and tokenId
   */
  async setNFTAvatar(nft: NFTAvatar): Promise<SetAvatarResponse> {
    // Map contract/collection to collectionId for backend
    const collectionId = this.getCollectionId(nft.contract, nft.collection);

    if (!collectionId) {
      throw new Error(`Unsupported collection: ${nft.collection}`);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/avatar`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            collectionId,
            tokenId: nft.tokenId
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to set avatar: ${response.statusText}`
        );
      }

      const data: SetAvatarResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to set avatar');
      }

      console.log('✅ NFT Avatar set successfully');
      return data;

    } catch (error) {
      console.error('❌ Failed to set NFT avatar:', error);
      throw error;
    }
  }

  /**
   * Map contract address or collection name to backend collectionId
   * Backend uses: 1 = CloneX, 2 = Animus
   */
  private getCollectionId(contract: string, collection: string): number | null {
    const contractLower = contract.toLowerCase();
    const collectionLower = collection.toLowerCase();

    // CloneX contract
    if (contractLower === '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b' ||
        collectionLower === 'clonex' || collectionLower === 'clone x') {
      return 1;
    }

    // Animus contract
    if (contractLower === '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f' ||
        collectionLower === 'animus') {
      return 2;
    }

    return null;
  }

  /**
   * Reset to default avatar
   */
  async resetAvatar(): Promise<SetAvatarResponse> {
    return this.setAvatar({ type: 'default' });
  }

  /**
   * Validate avatar file before upload
   */
  private validateAvatarFile(file: File): void {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Please use JPG, PNG, or WebP');
    }

    console.log('✅ File validation passed:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });
  }

  /**
   * Create preview URL from File object
   */
  createPreviewURL(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  revokePreviewURL(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export const avatarService = new AvatarService();
