/**
 * Production NFT Dashboard Component
 * Updated to use useCloneXAuth (unified auth hook) - Backend Bible v3.5.2
 *
 * CANONICAL DASHBOARD: Removed tier/rank language. Shows factual NFT holdings only.
 */

import React, { useState, useMemo } from 'react';
import { useCloneXAuth } from '../hooks/useCloneXAuth';
import { calculateAccessLevel, hasSubdomainAccess, AccessLevel } from '../constants/accessLevels';
import { StickerCard } from './StickerCard';
import { StickerButton } from './StickerButton';
import { StatusBadge } from './StatusBadge';
import {
  Shield, Users, Zap, ExternalLink,
  RefreshCw, Activity, Database, CheckCircle
} from 'lucide-react';
import { getNFTImageUrl, getNFTDisplayName, isNFTDelegated, calculateCollectionCounts } from '../utils/nftUtils';

// Canonical ecosystem apps - only real, accessible subdomains
const ECOSYSTEM_APPS = ['gm', 'gro', 'lore'] as const;

export const ProductionNFTDashboard: React.FC = () => {
  const {
    user: authUser,
    nftData,
    refreshNFTs,
    isLoading
  } = useCloneXAuth();

  const [expandedNFT, setExpandedNFT] = useState<string | null>(null);

  // Map AuthUser + nftData to the expected user structure for this component
  const user = useMemo(() => {
    if (!authUser) return null;

    // Extract NFTs array from nftData (includes both direct and delegated)
    const nfts = nftData?.nfts || [];

    // *** CRITICAL: Use nftData from global store for accurate collection counts ***
    // Handle BOTH API response formats + fallback to counting from NFT array:
    // 1. nftData.collections (simple counts: { clonex: 8, animus: 5, ... })
    // 2. nftData.nftCollections (detailed: { clonex: { count: 8, tokens: [...] }, ... })
    // 3. authUser.collections (from session response)
    // 4. FALLBACK: Calculate counts from nfts array using utility function
    let collections = authUser.collections ||
      (nftData?.collections) ||
      (nftData?.nftCollections ? {
        clonex: nftData.nftCollections.clonex?.count || 0,
        animus: nftData.nftCollections.animus?.count || 0,
        animus_eggs: nftData.nftCollections.animus_eggs?.count || 0,
        clonex_vials: nftData.nftCollections.clonex_vials?.count || 0
      } : null);

    // If collections is still null/empty, calculate from NFT array
    if (!collections || (collections.clonex === 0 && collections.animus === 0 && nfts.length > 0)) {
      collections = calculateCollectionCounts(nfts);
    }

    // Calculate access level from collections (used for subdomain access checks only)
    const accessLevel: AccessLevel = authUser.accessLevel || calculateAccessLevel(collections);

    return {
      walletAddress: authUser.walletAddress,
      accessLevel,
      collections,
      nfts,
      lastVerified: nftData?.lastVerified || new Date().toISOString(),
      verificationMethod: (nftData?.verificationMethod?.toLowerCase() || 'alchemy') as 'alchemy' | 'moralis' | 'etherscan',
      cached: nftData?.cached || false
    };
  }, [authUser, nftData]);

  if (!user) return null;

  const totalNFTs = (user.collections?.clonex || 0) + (user.collections?.animus || 0) +
                   (user.collections?.animus_eggs || 0) + (user.collections?.clonex_vials || 0);

  // Check subdomain access using the access level
  const checkSubdomainAccess = (subdomain: string): boolean => {
    return hasSubdomainAccess(user.accessLevel, subdomain);
  };

  // Refresh NFT data
  const refreshNFTData = async () => {
    await refreshNFTs();
  };

  // Handle subdomain navigation with cookie-based SSO
  const handleSubdomainNavigation = async (subdomain: string) => {
    const hasAccess = checkSubdomainAccess(subdomain);
    if (hasAccess) {
      // Cookie-based SSO (Backend Bible v3.5.2) - cookie works across *.clonex.wtf
      window.location.href = `https://${subdomain}.clonex.wtf`;
    } else {
      console.log('Access denied for subdomain:', subdomain);
    }
  };

  // Filter accessible ecosystem apps
  const accessibleApps = ECOSYSTEM_APPS.filter(app => checkSubdomainAccess(app));

  return (
    <div className="py-12 space-y-10">
      {/* Header - Neutral branding, no tier language */}
      <div className="text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            {/* Neutral icon - checkmark for verified status */}
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF5AF7] to-[#00C2FF] border-2 border-[#1C1C1C] rounded-[12px] mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>

            <h2 className="lab-heading-xl mb-4">
              CloneX Connect
            </h2>

            <div className="lab-surface inline-block px-6 py-3 mb-6">
              <p className="lab-heading-md text-[#FF5AF7]">
                YOUR VERIFIED NFT HOLDINGS
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <StatusBadge
                status="verified"
                text={`${totalNFTs} NFTs Verified`}
                size="md"
              />
              <StatusBadge
                status={user.cached ? "active" : "verified"}
                text={user.cached ? "Cached Data" : "Live Data"}
                size="md"
              />
              <StatusBadge
                status="active"
                text={user.verificationMethod.toUpperCase()}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Collection Stats - Only show collections with counts > 0 for secondary items */}
      <div className="max-w-6xl mx-auto">
        <h3 className="lab-heading-md mb-6 text-center">YOUR COLLECTIONS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* CloneX Collection - Always show */}
          <StickerCard variant="research-panel" className="text-center bg-[#FF5AF7]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
              <Shield className="w-8 h-8 text-[#6EFFC7]" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4 text-black">CLONEX</h3>
            <p className="text-4xl font-black text-black mb-2">{user.collections.clonex}</p>
            <StatusBadge status="verified" text="VERIFIED" />
          </StickerCard>

          {/* Animus Collection - Always show */}
          <StickerCard variant="research-panel" className="text-center bg-[#00C2FF]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
              <Users className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4 text-black">ANIMUS</h3>
            <p className="text-4xl font-black text-black mb-2">{user.collections.animus}</p>
            <StatusBadge status="verified" text="VERIFIED" />
          </StickerCard>

          {/* Animus Eggs - Only show if count > 0 */}
          {user.collections.animus_eggs > 0 && (
            <StickerCard variant="research-panel" className="text-center bg-[#6EFFC7]">
              <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
                <Zap className="w-8 h-8 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="lab-heading-md mb-4 text-black">ANIMUS EGGS</h3>
              <p className="text-4xl font-black text-black mb-2">{user.collections.animus_eggs}</p>
              <StatusBadge status="verified" text="VERIFIED" />
            </StickerCard>
          )}

          {/* CloneX Vials - Only show if count > 0 */}
          {user.collections.clonex_vials > 0 && (
            <StickerCard variant="research-panel" className="text-center bg-[#FFB800]">
              <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
                <Database className="w-8 h-8 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="lab-heading-md mb-4 text-black">CLONEX VIALS</h3>
              <p className="text-4xl font-black text-black mb-2">{user.collections.clonex_vials}</p>
              <StatusBadge status="verified" text="VERIFIED" />
            </StickerCard>
          )}
        </div>
      </div>

      {/* Ecosystem Apps - Only accessible ones */}
      {accessibleApps.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <StickerCard variant="research-panel" className="bg-[#F5F5F5]">
            <h3 className="lab-heading-md mb-6">ECOSYSTEM APPS</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {accessibleApps.map(subdomain => (
                <button
                  key={subdomain}
                  onClick={() => handleSubdomainNavigation(subdomain)}
                  className="p-4 border-2 border-[#1C1C1C] rounded-[12px] transition-all duration-150 bg-[#6EFFC7] hover:scale-105 cursor-pointer"
                >
                  <div className="text-sm font-bold text-black uppercase">
                    {subdomain}.clonex.wtf
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <ExternalLink className="w-4 h-4 text-black" strokeWidth={2.5} />
                  </div>
                </button>
              ))}
            </div>
          </StickerCard>
        </div>
      )}

      {/* NFT Gallery */}
      {user.nfts.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="lab-heading-md">YOUR NFTS ({user.nfts.length} total)</h3>
            <StickerButton
              variant="secondary"
              size="md"
              onClick={refreshNFTData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Activity className="w-4 h-4 animate-spin" strokeWidth={2.5} />
              ) : (
                <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
              )}
              Refresh
            </StickerButton>
          </div>

          <div className="data-grid">
            {user.nfts.slice(0, 12).map((nft: any) => {
              // Use robust utility functions for image extraction
              const nftImage = getNFTImageUrl(nft);
              const nftName = getNFTDisplayName(nft);
              const nftAttributes = nft.metadata || {};
              const isDelegated = isNFTDelegated(nft);

              // Get collection name for badge styling
              const collectionName = (nft.collection || 'unknown').toLowerCase();
              const isCloneX = collectionName === 'clonex' || collectionName === 'clone x';

              return (
                <StickerCard
                  key={`${nft.contract || nft.contractAddress}-${nft.tokenId}`}
                  variant="research-panel"
                  className="cursor-pointer hover:scale-[1.02] transition-transform duration-200 group"
                  onClick={() => setExpandedNFT(expandedNFT === nft.tokenId ? null : nft.tokenId)}
                >
                  {/* Image container - no overlays */}
                  <div className="aspect-square bg-[#F5F5F5] border-2 border-[#1C1C1C] rounded-[12px] mb-4 overflow-hidden relative group-hover:border-[#FF5AF7] transition-colors">
                    {nftImage ? (
                      <img
                        src={nftImage}
                        alt={nftName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x400/FF5AF7/FFFFFF?text=NFT%20%23${nft.tokenId}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FF5AF7] flex items-center justify-center">
                        <Shield className="w-16 h-16 text-black" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Title row: NFT name (left) + Token ID (right) */}
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-black truncate group-hover:text-[#FF5AF7] transition-colors">
                        {nftName}
                      </h4>
                      <span className="px-2 py-1 rounded text-xs font-mono font-semibold bg-black/70 text-gray-300 backdrop-blur-sm shrink-0">
                        #{nft.tokenId}
                      </span>
                    </div>

                    {/* Bottom badges row: Collection (left) + Ownership (right) */}
                    <div className="pt-2 border-t border-gray-300">
                      <div className="flex items-center justify-between gap-2">
                        {/* Collection badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow ${
                          isCloneX
                            ? 'bg-[#FF5AF7] text-white'
                            : 'bg-[#8B5CF6] text-white'
                        }`}>
                          {isCloneX ? 'CloneX' : 'Animus'}
                        </span>
                        {/* Ownership badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow ${
                          isDelegated
                            ? 'bg-blue-500 text-white'
                            : 'bg-[#6EFFC7] text-black'
                        }`}>
                          {isDelegated ? 'Delegated' : 'Owned'}
                        </span>
                      </div>
                    </div>

                    {expandedNFT === nft.tokenId && nftAttributes && (
                      <div className="mt-3 space-y-1">
                        {Object.entries(nftAttributes).slice(0, 4).map(([key, value], i) => (
                          <div key={i} className="text-xs text-[#4A4A4A]">
                            <span className="font-bold">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </StickerCard>
              );
            })}
          </div>

          {user.nfts.length > 12 && (
            <div className="text-center mt-8">
              <StatusBadge
                status="active"
                text={`${user.nfts.length - 12} MORE NFTS AVAILABLE`}
                size="md"
              />
            </div>
          )}
        </div>
      )}

      {/* Session Info */}
      <div className="max-w-4xl mx-auto">
        <StickerCard variant="research-panel" className="bg-[#F5F5F5]">
          <h3 className="lab-heading-md mb-4 text-black">SESSION INFO</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-[#4A4A4A] mb-1">WALLET ADDRESS</div>
              <div className="font-mono text-sm break-all text-black">{user.walletAddress}</div>
            </div>

            <div>
              <div className="text-sm text-[#4A4A4A] mb-1">LAST VERIFIED</div>
              <div className="text-sm text-black">{new Date(user.lastVerified).toLocaleString()}</div>
            </div>

            <div>
              <div className="text-sm text-[#4A4A4A] mb-1">VERIFICATION METHOD</div>
              <div className="text-sm uppercase text-black">{user.verificationMethod}</div>
            </div>

            <div>
              <div className="text-sm text-[#4A4A4A] mb-1">SESSION STATUS</div>
              <div className="text-sm text-black">AUTHENTICATED • SECURE</div>
            </div>
          </div>
        </StickerCard>
      </div>
    </div>
  );
};
