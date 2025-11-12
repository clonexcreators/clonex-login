// CloneX Universal Login - Public Profile Page (Phase 2.4)
import React, { useState, useEffect } from 'react'
import { DnaBadge } from './DnaBadge'
import { EnhancedNFTCard } from '../EnhancedNFTCard'

interface PublicUserProfile {
  walletAddress: string
  displayName: string | null
  bio: string | null
  avatar: {
    url: string | null
    type: 'nft' | 'uploaded' | 'default'
  }
  access: {
    hasAccess: boolean
    eligibleNFTs: number
  }
  nfts: {
    collections: Record<string, number>
    totalNFTs: number
    items?: Array<{
      contract: string
      tokenId: string
      collection: string
      name?: string
      image?: string
      metadata?: Record<string, any>
    }>
  }
  social: {
    discord?: {
      verified: boolean
      username: string | null
    }
    x?: {
      verified: boolean
      username: string | null
    }
  }
  privacy: {
    showNfts: boolean
    showWallet: boolean
  }
  createdAt: string
}

interface PublicProfilePageProps {
  walletAddress: string
  onNavigateBack?: () => void
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  walletAddress,
  onNavigateBack
}) => {
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPublicProfile()
  }, [walletAddress])

  const fetchPublicProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `https://api.clonex.wtf/api/user/${walletAddress}/public`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Profile not found or not public')
        }
        throw new Error(`Failed to load profile: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.profile) {
        setProfile(data.profile)
      } else {
        throw new Error('Invalid profile data received')
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Public profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${walletAddress}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName || 'CloneX'} Profile`,
          text: 'Check out this CloneX profile!',
          url
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(url)
        alert('Profile URL copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy URL:', err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Profile Not Available</h3>
            <p className="text-red-700 mb-4">
              {error || 'This profile is not public or does not exist'}
            </p>
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Back Button */}
        {onNavigateBack && (
          <div className="mb-6">
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar.url || '/default-avatar.png'}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
              />
              {profile.access.hasAccess && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  ✓ Verified
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.displayName || 'Anonymous CloneX Holder'}
              </h1>
              
              {/* Wallet Address */}
              {profile.privacy.showWallet ? (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <p className="text-sm font-mono text-gray-500">{walletAddress}</p>
                  <button
                    onClick={handleCopyAddress}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-3">
                  {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                </p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm mb-4">
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{profile.access.eligibleNFTs}</span> Eligible NFTs
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">{profile.nfts.totalNFTs}</span> Total NFTs
                </span>
              </div>

              {/* Social Connections */}
              {(profile.social.discord?.verified || profile.social.x?.verified) && (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  {profile.social.discord?.verified && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
                      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      <span className="text-sm font-medium text-indigo-900">
                        {profile.social.discord.username}
                      </span>
                    </div>
                  )}
                  
                  {profile.social.x?.verified && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-sm font-medium text-white">
                        @{profile.social.x.username}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center md:justify-start">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NFT Collections (if showNfts is true) */}
        {profile.privacy.showNfts && profile.nfts.totalNFTs > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">NFT Collection</h2>
            
            {/* Collection Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(profile.nfts.collections).map(([collection, count]) => (
                count > 0 && (
                  <div key={collection} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 capitalize">{collection}</p>
                  </div>
                )
              ))}
            </div>

            {/* NFT Grid */}
            {profile.nfts.items && profile.nfts.items.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profile.nfts.items.map((nft, index) => (
                  <EnhancedNFTCard
                    key={`${nft.contract}-${nft.tokenId}`}
                    nft={nft}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Member Since */}
        <div className="text-center text-sm text-gray-500">
          Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  )
}
