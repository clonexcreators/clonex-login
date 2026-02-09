/**
 * NFT Utility Functions
 * Provides robust helpers for extracting data from NFT objects
 * regardless of the API response format
 */

/**
 * Extract image URL from an NFT object
 * Handles multiple possible field locations from different API responses:
 * - nft.image (direct field)
 * - nft.imageUrl (legacy field)
 * - nft.imageFull (full resolution)
 * - nft.metadata?.image (nested in metadata)
 * - nft.metadata?.imageUrl (nested legacy)
 * - nft.media?.[0]?.gateway (Alchemy media array)
 * - nft.media?.[0]?.raw (Alchemy raw URL)
 */
export function getNFTImageUrl(nft: any): string | null {
  if (!nft) return null;

  // Try all possible image field locations
  const imageUrl =
    nft.image ||
    nft.imageUrl ||
    nft.imageFull ||
    nft.metadata?.image ||
    nft.metadata?.imageUrl ||
    nft.metadata?.imageFull ||
    nft.media?.[0]?.gateway ||
    nft.media?.[0]?.raw ||
    nft.media?.[0]?.thumbnail;

  // Convert IPFS URLs to gateway URLs if needed
  if (imageUrl && typeof imageUrl === 'string') {
    return normalizeImageUrl(imageUrl);
  }

  return null;
}

/**
 * Normalize image URLs (convert IPFS to gateway, etc.)
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return '';

  // Handle IPFS URLs
  if (url.startsWith('ipfs://')) {
    const hash = url.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }

  // Handle Arweave URLs
  if (url.startsWith('ar://')) {
    const hash = url.replace('ar://', '');
    return `https://arweave.net/${hash}`;
  }

  return url;
}

/**
 * Get NFT display name with fallback
 */
export function getNFTDisplayName(nft: any): string {
  if (!nft) return 'Unknown NFT';

  return (
    nft.displayName ||
    nft.name ||
    nft.metadata?.name ||
    nft.metadata?.displayName ||
    `Token #${nft.tokenId || '???'}`
  );
}

/**
 * Check if NFT is delegated
 */
export function isNFTDelegated(nft: any): boolean {
  if (!nft) return false;

  return (
    nft.ownershipType === 'delegated' ||
    nft.isDelegated === true ||
    nft.ownershipContext === 'DELEGATED' ||
    nft.source === 'delegate.xyz' ||
    nft.source === 'warm.xyz'
  );
}

/**
 * Get NFT collection name normalized
 */
export function getNFTCollection(nft: any): string {
  if (!nft) return 'unknown';

  const collection = nft.collection || nft.collectionName || '';
  return collection.toLowerCase();
}

/**
 * Calculate collection counts from an array of NFTs
 * Counts NFTs by their collection field
 */
export function calculateCollectionCounts(nfts: any[]): {
  clonex: number;
  animus: number;
  animus_eggs: number;
  clonex_vials: number;
} {
  if (!nfts || !Array.isArray(nfts)) {
    return { clonex: 0, animus: 0, animus_eggs: 0, clonex_vials: 0 };
  }

  const counts = { clonex: 0, animus: 0, animus_eggs: 0, clonex_vials: 0 };

  for (const nft of nfts) {
    const collection = getNFTCollection(nft);

    if (collection === 'clonex' || collection === 'clone x') {
      counts.clonex++;
    } else if (collection === 'animus' || collection.includes('animus')) {
      // Check for eggs specifically
      if (collection.includes('egg')) {
        counts.animus_eggs++;
      } else {
        counts.animus++;
      }
    } else if (collection.includes('vial')) {
      counts.clonex_vials++;
    }
  }

  return counts;
}
