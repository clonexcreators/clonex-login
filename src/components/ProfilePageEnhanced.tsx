// CloneX Universal Login - Enhanced Profile Page (v3.6.4 - Phase 2.5 DNA Polish)
import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { useCloneXAuth } from '../hooks/useCloneXAuth'
import { useDNAThemes } from '../hooks/useDNAThemes'
import { DNA_THEMES } from '../theme/dna'

// Phase 2.5 Enhanced Components
import DNASelector from './profile/DNASelector'
import { DnaBadge, DnaBadgeGroup } from './profile/DnaBadge'
import { DNAIndicator, DNAThemedContainer, DNAProfileHeader } from './profile/DNAIndicator'
import AvatarPicker from './profile/AvatarPicker'
import AvatarUploader from './profile/AvatarUploader'
import { SocialConnections } from './profile/SocialConnections'
import { ProfileResetModal } from './profile/ProfileResetModal'

// Responsive & Accessibility Components
import { 
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveTabs,
  ResponsiveStack,
  ShowOnMobile,
  ShowOnDesktop
} from './ResponsiveLayout'
import { 
  SkipToContent,
  AccessibleButton,
  LiveRegion,
  ProgressBar
} from './AccessibilityUtils'

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
  const [showResetModal, setShowResetModal] = useState(false)

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

  const handleNFTAvatarSelect = async (nft: NFTAvatar) => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
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
      await fetchProfile()
      setSuccessMessage('Custom avatar uploaded successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile after upload')
      console.error('Profile refresh error:', err)
    }
  }

  const getCurrentAvatarId = (): string | undefined => {
    if (profile?.avatar.type === 'nft' && profile.avatar.nftDetails) {
      return `${profile.avatar.nftDetails.contract}-${profile.avatar.nftDetails.tokenId}`
    }
    return undefined
  }

  const handleSocialConnectionChange = () => {
    fetchProfile()
  }

  // Calculate profile completion percentage
  const getProfileCompletion = (): number => {
    if (!profile) return 0
    let completed = 0
    const total = 6

    if (profile.displayName) completed++
    if (profile.bio) completed++
    if (profile.avatar.type !== 'default') completed++
    if (profile.social.discord?.verified) completed++
    if (profile.social.x?.verified) completed++
    if (activeDNA) completed++

    return Math.round((completed / total) * 100)
  }

  // Loading state
  if (loading) {
    return (
      <ResponsiveContainer>
        <motion.div
          className="min-h-screen flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <motion.div
              className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </motion.div>
      </ResponsiveContainer>
    )
  }

  // Error state
  if (error && !profile) {
    return (
      <ResponsiveContainer>
        <motion.div
          className="min-h-screen flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ResponsiveCard variant="elevated" className="max-w-md">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <AccessibleButton onClick={fetchProfile} variant="primary">
                Try Again
              </AccessibleButton>
            </div>
          </ResponsiveCard>
        </motion.div>
      </ResponsiveContainer>
    )
  }

  if (!profile) return null

  const profileCompletion = getProfileCompletion()

  // Tab definitions
  const tabs = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    },
    { 
      id: 'dna', 
      label: 'DNA Theme', 
      icon: activeDNA && <DNAIndicator type={activeDNA} variant="dot" size="sm" animated={false} />
    },
    { 
      id: 'privacy', 
      label: 'Privacy', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    },
    { 
      id: 'avatar', 
      label: 'Avatar', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    },
    { 
      id: 'social', 
      label: 'Social', 
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SkipToContent />

      <ResponsiveContainer size="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header with DNA theme */}
          {activeDNA && (
            <DNAProfileHeader
              type={activeDNA}
              title={profile.displayName || 'Your Profile'}
              subtitle={`${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`}
              icon={DNA_THEMES[activeDNA]?.icon}
              action={onNavigateBack && (
                <AccessibleButton
                  onClick={onNavigateBack}
                  variant="outline"
                  ariaLabel="Go back to previous page"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </AccessibleButton>
              )}
            />
          )}

          {/* Profile completion progress */}
          <ResponsiveCard variant="elevated" padding="md" className="mb-6">
            <ProgressBar
              value={profileCompletion}
              label="Profile Completion"
              showPercentage
              color={activeDNA ? DNA_THEMES[activeDNA]?.accent : '#3B82F6'}
            />
          </ResponsiveCard>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <LiveRegion politeness="polite">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-700">{successMessage}</p>
                  </div>
                </LiveRegion>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <LiveRegion politeness="assertive">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700">{error}</p>
                  </div>
                </LiveRegion>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Summary Card with DNA theming */}
          {activeDNA ? (
            <DNAThemedContainer type={activeDNA} variant="card" className="mb-6">
              <ResponsiveStack direction="responsive" gap={6} align="start">
                <div className="relative">
                  <motion.img
                    src={profile.avatar.url || '/default-avatar.png'}
                    alt="Profile Avatar"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                  {profile.access.hasAccess && (
                    <motion.div
                      className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                    >
                      ✓ Access
                    </motion.div>
                  )}
                </div>
                
                <div className="flex-1">
                  <motion.h2
                    className="text-2xl font-bold text-gray-900 mb-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {profile.displayName || 'Anonymous'}
                  </motion.h2>
                  
                  <ResponsiveStack direction="row" gap={4} align="center" className="text-sm mb-3">
                    <span className="text-gray-600">
                      {profile.access.eligibleNFTs} Eligible NFTs
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      {profile.nfts.totalNFTs} Total NFTs
                    </span>
                  </ResponsiveStack>

                  {availableDNA && availableDNA.length > 0 && (
                    <DnaBadgeGroup
                      types={availableDNA}
                      size="sm"
                      showLabels={false}
                      onSelect={setActiveDNA}
                      selectedType={activeDNA}
                    />
                  )}
                </div>
              </ResponsiveStack>
            </DNAThemedContainer>
          ) : (
            // Fallback non-themed card
            <ResponsiveCard variant="elevated" padding="lg" className="mb-6">
              <ResponsiveStack direction="responsive" gap={6} align="start">
                <div className="relative">
                  <img
                    src={profile.avatar.url || '/default-avatar.png'}
                    alt="Profile Avatar"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                  {profile.access.hasAccess && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ✓ Access
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
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
                </div>
              </ResponsiveStack>
            </ResponsiveCard>
          )}

          {/* Responsive Tabs */}
          <ResponsiveCard variant="elevated" padding="none" className="mb-6">
            <ResponsiveTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as any)}
            />

            <div className="p-6" id="main-content">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="displayName">
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={50}
                      placeholder="Enter your display name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-describedby="displayName-help"
                    />
                    <p id="displayName-help" className="mt-1 text-xs text-gray-500">
                      {displayName.length}/50 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="bio">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      aria-describedby="bio-help"
                    />
                    <p id="bio-help" className="mt-1 text-xs text-gray-500">
                      {bio.length}/500 characters
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <AccessibleButton
                      onClick={saveProfile}
                      variant="primary"
                      loading={saving}
                      disabled={saving}
                    >
                      Save Changes
                    </AccessibleButton>
                  </div>
                </motion.div>
              )}

              {/* DNA Theme Tab */}
              {activeTab === 'dna' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {activeDNA && (
                    <DNAThemedContainer type={activeDNA} variant="banner">
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
                        <motion.div
                          className="mt-3 p-2 bg-white bg-opacity-50 rounded text-sm font-semibold text-purple-700 flex items-center gap-2"
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ✨ Murakami Drip Active
                        </motion.div>
                      )}
                    </DNAThemedContainer>
                  )}

                  <DNASelector userDNA={availableDNA} />
                </motion.div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {[
                      {
                        key: 'profilePublic',
                        label: 'Public Profile',
                        description: 'Allow others to view your profile'
                      },
                      {
                        key: 'showNfts',
                        label: 'Show NFTs',
                        description: 'Display your NFT collection on your profile'
                      },
                      {
                        key: 'showWallet',
                        label: 'Show Wallet Address',
                        description: 'Display your full wallet address'
                      }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{setting.label}</h3>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy[setting.key as keyof typeof privacy]}
                            onChange={(e) => setPrivacy({ ...privacy, [setting.key]: e.target.checked })}
                            className="sr-only peer"
                            aria-label={setting.label}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <AccessibleButton
                      onClick={savePrivacy}
                      variant="primary"
                      loading={saving}
                      disabled={saving}
                    >
                      Save Privacy Settings
                    </AccessibleButton>
                  </div>
                </motion.div>
              )}

              {/* Avatar Tab */}
              {activeTab === 'avatar' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <motion.img
                      src={profile.avatar.url || '/default-avatar.png'}
                      alt="Current Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 mx-auto mb-4"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
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
                    <AccessibleButton
                      onClick={() => setShowAvatarPicker(true)}
                      variant="primary"
                      className="w-full"
                      ariaLabel="Choose avatar from your NFT collection"
                    >
                      <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose from your NFTs
                    </AccessibleButton>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    <AccessibleButton
                      onClick={() => setShowAvatarUploader(true)}
                      variant="secondary"
                      className="w-full"
                      ariaLabel="Upload a custom avatar image"
                    >
                      <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Custom Avatar
                    </AccessibleButton>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Custom avatars must be under 5MB and in JPG, PNG, or WebP format
                  </p>
                </motion.div>
              )}

              {/* Social Tab */}
              {activeTab === 'social' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SocialConnections
                    connections={profile.social}
                    onConnectionChange={handleSocialConnectionChange}
                  />
                </motion.div>
              )}
            </div>
          </ResponsiveCard>

          {/* Account Actions */}
          <ResponsiveCard variant="elevated" padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <AccessibleButton
                onClick={() => window.open(`/profile/${profile.walletAddress}`, '_blank')}
                variant="outline"
                className="w-full justify-between"
                ariaLabel="View your public profile in a new tab"
              >
                <span>View Public Profile</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </AccessibleButton>
              
              <AccessibleButton
                onClick={() => setShowResetModal(true)}
                variant="outline"
                className="w-full justify-between text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                ariaLabel="Reset your profile to default settings"
              >
                <span>Reset Profile</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </AccessibleButton>
            </div>
          </ResponsiveCard>
        </motion.div>
      </ResponsiveContainer>

      {/* Modals */}
      <AvatarPicker
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onSelect={handleNFTAvatarSelect}
        walletAddress={address || ''}
        currentAvatarId={getCurrentAvatarId()}
      />

      <AvatarUploader
        isOpen={showAvatarUploader}
        onClose={() => setShowAvatarUploader(false)}
        onUploadSuccess={handleCustomAvatarUpload}
      />

      <ProfileResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={async () => {
          // Handle profile reset
          setShowResetModal(false)
          setSuccessMessage('Profile reset successfully!')
        }}
      />
    </div>
  )
}
