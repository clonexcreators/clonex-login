// CloneX Universal Login - Full Profile Page (v3.6.3 - Phase 2.3 Social OAuth)
import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useCloneXAuth } from '../hooks/useCloneXAuth'
import { useDNAThemes } from '../hooks/useDNAThemes'
import { DNA_THEMES } from '../theme/dna'
import DNASelector from './profile/DNASelector'
import { DnaBadge } from './profile/DnaBadge'
import AvatarPicker from './profile/AvatarPicker'
import AvatarUploader from './profile/AvatarUploader'
import { SocialConnections } from './profile/SocialConnections'
import { ProfileResetModal } from './profile/ProfileResetModal'
import { avatarService, NFTAvatar } from '../services/avatarService'
import { profileService } from '../services/profileService'

interface ProfilePageProps {
  onNavigateBack?: () => void
}

interface UserProfile {
  walletAddress: string
  displayName: string | null
  bio: string | null
  avatar: {
    url: string | null
    type: 'nft' | 'uploaded' | 'default'
    nftDetails?: {
      contract: string
      tokenId: string
      collection: string
    }
  }
  access: {
    hasAccess: boolean
    eligibleNFTs: number
    accessReason: string
  }
  nfts: {
    collections: Record<string, number>
    totalNFTs: number
    totalDelegatedNFTs: number
  }
  social: {
    discord?: {
      verified: boolean
      username: string | null
      verifiedAt: string | null
    }
    x?: {
      verified: boolean
      username: string | null
      verifiedAt: string | null
    }
  }
  privacy: {
    profilePublic: boolean
    showNfts: boolean
    showWallet: boolean
  }
  gmPoints: {
    total: number
    lastClaimed: string | null
    totalClaims: number
    canClaim: boolean
  }
  createdAt: string
  updatedAt: string
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateBack }) => {
  const { address } = useAccount()
  const { isAuthenticated, nftData } = useCloneXAuth()
  
  // DNA Theme system
  const {
    activeDNA,
    availableDNA,
    hasMurakamiDrip,
    setActiveDNA,
    refreshOwnedDNA
  } = useDNAThemes()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showNfts: true,
    showWallet: false
  })

  // Avatar modals state
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'avatar' | 'social' | 'dna'>('profile')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showAvatarUploader, setShowAvatarUploader] = useState(false)
  
  // Phase 2.4 - Profile Reset & Public Pages
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Fetch profile on mount
  useEffect(() => {
    if (!isAuthenticated || !address) {
      setError('Please authenticate to view your profile')
      setLoading(false)
      return
    }

    fetchProfile()
  }, [isAuthenticated, address])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('clonex_auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('https://api.clonex.wtf/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.profile) {
        setProfile(data.profile)
        setDisplayName(data.profile.displayName || '')
        setBio(data.profile.bio || '')
        setPrivacy(data.profile.privacy)
        
        // Refresh DNA themes from NFT data
        if (nftData?.breakdown) {
          const allNFTs = [
            ...(nftData.breakdown.direct?.nfts || []),
            ...(nftData.breakdown['delegate.xyz']?.nfts || []),
            ...(nftData.breakdown['warm.xyz']?.nfts || [])
          ]
          refreshOwnedDNA(allNFTs)
        }
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      const token = localStorage.getItem('clonex_auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('https://api.clonex.wtf/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          bio: bio.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update profile: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.profile) {
        setProfile(data.profile)
        setSuccessMessage('Profile updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Profile save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const savePrivacy = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      const token = localStorage.getItem('clonex_auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('https://api.clonex.wtf/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ privacy })
      })

      if (!response.ok) {
        throw new Error(`Failed to update privacy: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.profile) {
        setProfile(data.profile)
        setSuccessMessage('Privacy settings updated!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Privacy save error:', err)
    } finally {
      setSaving(false)
    }
  }

  // Avatar selection handlers
  const handleNFTAvatarSelect = async (nft: NFTAvatar) => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      console.log('Setting NFT avatar:', nft)
      
      const response = await avatarService.setNFTAvatar(nft)
      
      if (response.success && response.profile) {
        setProfile(prev => prev ? { ...prev, avatar: response.profile.avatar } : null)
        setSuccessMessage('Avatar updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update avatar')
      console.error('Avatar update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCustomAvatarUpload = async (avatarUrl: string) => {
    try {
      // Refresh profile to get updated avatar
      await fetchProfile()
      setSuccessMessage('Custom avatar uploaded successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile after upload')
      console.error('Profile refresh error:', err)
    }
  }

  // Get current avatar ID for picker
  const getCurrentAvatarId = (): string | undefined => {
    if (profile?.avatar.type === 'nft' && profile.avatar.nftDetails) {
      return `${profile.avatar.nftDetails.contract}-${profile.avatar.nftDetails.tokenId}`
    }
    return undefined
  }

  // Handler for social connection changes
  const handleSocialConnectionChange = () => {
    // Refresh profile to get updated social connections
    fetchProfile()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-4">Please connect your wallet to view your profile</p>
          <button
            onClick={onNavigateBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
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

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Profile</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            {onNavigateBack && (
              <button
                onClick={onNavigateBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
          </div>
          
          {/* Profile Summary Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={profile.avatar.url || '/default-avatar.png'}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                />
                {profile.access.hasAccess && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    ✓ Access
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.displayName || 'Anonymous'}
                </h2>
                <p className="text-sm text-gray-500 mb-2">
                  {`${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`}
                </p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    {profile.access.eligibleNFTs} Eligible NFTs
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {profile.nfts.totalNFTs} Total NFTs
                  </span>
                </div>

                {/* DNA Badge */}
                {availableDNA && availableDNA.length > 0 && activeDNA && (
                  <div className="mt-3">
                    <DnaBadge type={activeDNA} size="md" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { id: 'dna', label: 'DNA Theme', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
                { id: 'privacy', label: 'Privacy', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { id: 'avatar', label: 'Avatar', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { id: 'social', label: 'Social', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">{displayName.length}/50 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">{bio.length}/500 characters</p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* DNA Theme Tab */}
            {activeTab === 'dna' && (
              <div className="space-y-6">
                {/* Current theme display */}
                {activeDNA && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Current Theme: {DNA_THEMES[activeDNA]?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Accent Color: {DNA_THEMES[activeDNA]?.accent}
                        </p>
                      </div>
                      <img 
                        src={DNA_THEMES[activeDNA]?.icon}
                        alt={DNA_THEMES[activeDNA]?.name}
                        className="w-16 h-16"
                      />
                    </div>
                    {hasMurakamiDrip && (
                      <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-sm font-semibold text-purple-700 flex items-center gap-2">
                        ✨ Murakami Drip Active
                      </div>
                    )}
                  </div>
                )}

                {/* DNA Selector */}
                <DNASelector userDNA={availableDNA} />

                {/* Theme preview */}
                {activeDNA && (
                  <div className="p-6 bg-white rounded-lg border-2 border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Theme Preview</h4>
                    <div className="space-y-3">
                      <div className="flex gap-2 items-center">
                        <div 
                          className="w-16 h-16 rounded-lg border-2 border-white shadow-lg"
                          style={{ backgroundColor: DNA_THEMES[activeDNA].accent }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Accent Color</p>
                          <p className="text-xs text-gray-500">{DNA_THEMES[activeDNA].accent}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Public Profile</h3>
                      <p className="text-sm text-gray-600">Allow others to view your profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.profilePublic}
                        onChange={(e) => setPrivacy({ ...privacy, profilePublic: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Show NFTs</h3>
                      <p className="text-sm text-gray-600">Display your NFT collection on your profile</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.showNfts}
                        onChange={(e) => setPrivacy({ ...privacy, showNfts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Show Wallet Address</h3>
                      <p className="text-sm text-gray-600">Display your full wallet address</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacy.showWallet}
                        onChange={(e) => setPrivacy({ ...privacy, showWallet: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={savePrivacy}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Privacy Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Avatar Tab */}
            {activeTab === 'avatar' && (
              <div className="space-y-6">
                <div className="text-center">
                  <img
                    src={profile.avatar.url || '/default-avatar.png'}
                    alt="Current Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 mx-auto mb-4"
                  />
                  <p className="text-sm text-gray-600 mb-4">
                    Current avatar type: <span className="font-semibold capitalize">{profile.avatar.type}</span>
                  </p>
                  {profile.avatar.type === 'nft' && profile.avatar.nftDetails && (
                    <p className="text-xs text-gray-500">
                      {profile.avatar.nftDetails.collection} #{profile.avatar.nftDetails.tokenId}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose from your NFTs
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAvatarUploader(true)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Custom Avatar
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Custom avatars must be under 5MB and in JPG, PNG, or WebP format
                </p>
              </div>
            )}

            {/* Social Tab - PHASE 2.3 INTEGRATION */}
            {activeTab === 'social' && (
              <SocialConnections
                connections={profile.social}
                onConnectionChange={handleSocialConnectionChange}
              />
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-left">
              <div className="flex items-center justify-between">
                <span>View Public Profile</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </button>
            
            <button className="w-full px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors text-left">
              <div className="flex items-center justify-between">
                <span>Reset Profile</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AvatarPicker
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onSelect={handleNFTAvatarSelect}
        walletAddress={address || ''}
        currentAvatarId={getCurrentAvatarId()}
      />

      {/* Avatar Uploader Modal */}
      <AvatarUploader
        isOpen={showAvatarUploader}
        onClose={() => setShowAvatarUploader(false)}
        onUploadSuccess={handleCustomAvatarUpload}
      />
    </div>
  )
}
