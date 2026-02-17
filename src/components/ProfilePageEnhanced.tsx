// CloneX Universal Login - Enhanced Profile Page (v3.7.0 - Single Page Consolidated)
// Refactored: Removed tabbed interface, consolidated ALL profile features into single cohesive page
import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { useCloneXAuth } from '../hooks/useCloneXAuth'
import { useDNAThemes } from '../hooks/useDNAThemes'
import { DNA_THEMES } from '../theme/dna'
import { DEFAULT_AVATAR_SIMPLE } from '../constants/defaultAvatar'

// Phase 2.5 Enhanced Components
import AvatarPicker from './profile/AvatarPicker'
import AvatarUploader from './profile/AvatarUploader'
import { SocialConnections } from './profile/SocialConnections'
import { ProfileResetModal } from './profile/ProfileResetModal'
import { WarmDelegation } from './profile/WarmDelegation'

// Responsive & Accessibility Components
import {
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveStack
} from './ResponsiveLayout'
import {
  SkipToContent,
  AccessibleButton,
  LiveRegion,
  ProgressBar
} from './AccessibilityUtils'

import { avatarService, NFTAvatar } from '../services/avatarService'
import { useAuthStore } from '../stores/authStore'

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

// Section Header Component
const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-[#1C1C1C] flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-black">{title}</h3>
  </div>
)

// Section Divider
const SectionDivider: React.FC = () => (
  <div className="border-t-2 border-[#1C1C1C] my-8" />
)

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
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showAvatarUploader, setShowAvatarUploader] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('clonex-dark-mode') === 'true'
  })
  const [murakamiEnabled, setMurakamiEnabled] = useState(hasMurakamiDrip)

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('clonex-dark-mode', 'true')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('clonex-dark-mode', 'false')
    }
  }, [darkMode])

  // Apply Murakami finish
  useEffect(() => {
    if (murakamiEnabled && hasMurakamiDrip) {
      document.documentElement.setAttribute('data-finish', 'murakami')
    } else {
      document.documentElement.removeAttribute('data-finish')
    }
  }, [murakamiEnabled, hasMurakamiDrip])

  // Sync murakami state when NFT data loads
  useEffect(() => {
    setMurakamiEnabled(hasMurakamiDrip)
  }, [hasMurakamiDrip])

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

      const response = await fetch('https://api.clonex.wtf/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to load profile: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && data.profile) {
        const normalizedProfile: UserProfile = {
          ...data.profile,
          access: data.profile.access || {
            hasAccess: false,
            eligibleNFTs: 0,
            accessReason: 'Unknown'
          },
          nfts: data.profile.nfts || {
            collections: {},
            totalNFTs: 0,
            totalDelegatedNFTs: 0
          },
          social: data.profile.social || {},
          privacy: data.profile.privacy || {
            profilePublic: true,
            showNfts: true,
            showWallet: false
          },
          gmPoints: data.profile.gmPoints || {
            total: 0,
            lastClaimed: null,
            totalClaims: 0,
            canClaim: false
          },
          avatar: data.profile.avatar || {
            url: null,
            type: 'default'
          }
        }
        setProfile(normalizedProfile)
        setDisplayName(normalizedProfile.displayName || '')
        setBio(normalizedProfile.bio || '')
        setPrivacy(data.profile.privacy)

        // Sync profile avatar and displayName to global auth store
        // This ensures WalletButton shows correct avatar on page load
        useAuthStore.getState().updateUserProfile({
          displayName: normalizedProfile.displayName,
          bio: normalizedProfile.bio,
          avatar: normalizedProfile.avatar
        })

        // Refresh DNA themes from NFT data
        if (nftData) {
          let allNFTs: any[] = []

          if (nftData.nfts && Array.isArray(nftData.nfts)) {
            allNFTs = nftData.nfts
          } else if (nftData.breakdown) {
            allNFTs = [
              ...(nftData.breakdown.direct?.nfts || []),
              ...(nftData.breakdown.delegated?.nfts || [])
            ]
          } else if (nftData.nftCollections) {
            allNFTs = [
              ...(nftData.nftCollections.clonex?.tokens || []),
              ...(nftData.nftCollections.animus?.tokens || []),
              ...(nftData.nftCollections.animus_eggs?.tokens || []),
              ...(nftData.nftCollections.clonex_vials?.tokens || [])
            ]
          }

          if (allNFTs.length > 0) {
            refreshOwnedDNA(allNFTs)
          }
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

      const response = await fetch('https://api.clonex.wtf/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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

        // Also update global auth store so WalletButton reflects name change immediately
        useAuthStore.getState().updateUserProfile({
          displayName: data.profile.displayName,
          bio: data.profile.bio
        })

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

      const response = await fetch('https://api.clonex.wtf/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
        // Update local profile state
        setProfile(prev => prev ? { ...prev, avatar: response.profile.avatar } : null)

        // Also update global auth store so WalletButton reflects change immediately
        useAuthStore.getState().updateUserProfile({
          avatar: response.profile.avatar
        })

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

      // Also update global auth store with the new uploaded avatar
      useAuthStore.getState().updateUserProfile({
        avatar: {
          url: avatarUrl,
          type: 'uploaded'
        }
      })

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

  // Calculate NFT counts from live nftData (same logic as ProductionNFTDashboard)
  const getNFTStats = () => {
    if (!nftData) {
      return {
        totalNFTs: 0,
        eligibleNFTs: 0,
        delegatedNFTs: 0,
        ownedNFTs: 0,
        clonex: 0,
        animus: 0,
        clonexOwned: 0,
        clonexDelegated: 0,
        animusOwned: 0,
        animusDelegated: 0,
        hasBreakdown: false
      }
    }

    // Get collections from nftData - check both collections and nftCollections
    let clonexCount = nftData.collections?.clonex || nftData.nftCollections?.clonex?.count || 0
    let animusCount = nftData.collections?.animus || nftData.nftCollections?.animus?.count || 0
    let animusEggsCount = nftData.collections?.animus_eggs || nftData.nftCollections?.animus_eggs?.count || 0
    let clonexVialsCount = nftData.collections?.clonex_vials || nftData.nftCollections?.clonex_vials?.count || 0

    // Get owned/delegated breakdown
    const breakdown = nftData.breakdown
    const clonexOwned = breakdown?.direct?.collections?.clonex || 0
    const clonexDelegated = breakdown?.delegated?.collections?.clonex || 0
    const animusOwned = breakdown?.direct?.collections?.animus || 0
    const animusDelegated = breakdown?.delegated?.collections?.animus || 0

    // Calculate total delegated and owned
    const delegatedCount = (breakdown?.delegated?.total) ||
      (clonexDelegated + animusDelegated +
        (breakdown?.delegated?.collections?.animus_eggs || 0) +
        (breakdown?.delegated?.collections?.clonex_vials || 0))
    const ownedCount = (breakdown?.direct?.total) ||
      (clonexOwned + animusOwned +
        (breakdown?.direct?.collections?.animus_eggs || 0) +
        (breakdown?.direct?.collections?.clonex_vials || 0))

    // Calculate from NFT array if collections are empty
    if (clonexCount === 0 && animusCount === 0 && nftData.nfts && nftData.nfts.length > 0) {
      nftData.nfts.forEach((nft: any) => {
        const collection = (nft.collection || nft.collectionName || '').toLowerCase()
        if (collection.includes('clonex') && !collection.includes('vial')) clonexCount++
        else if (collection.includes('animus') && !collection.includes('egg')) animusCount++
        else if (collection.includes('egg')) animusEggsCount++
        else if (collection.includes('vial')) clonexVialsCount++
      })
    }

    const totalNFTs = nftData.totalNFTs || (clonexCount + animusCount + animusEggsCount + clonexVialsCount)
    // Eligible NFTs are CloneX + Animus (main collections that grant access)
    const eligibleNFTs = clonexCount + animusCount

    return {
      totalNFTs,
      eligibleNFTs,
      delegatedNFTs: delegatedCount,
      ownedNFTs: ownedCount,
      clonex: clonexCount,
      animus: animusCount,
      clonexOwned,
      clonexDelegated,
      animusOwned,
      animusDelegated,
      hasBreakdown: !!(breakdown?.direct || breakdown?.delegated)
    }
  }

  const nftStats = getNFTStats()

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
              className="w-16 h-16 border-4 border-[#1C1C1C] border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-black font-medium">Loading profile...</p>
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
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#1C1C1C]">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Error Loading Profile</h3>
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

  return (
    <div className="min-h-screen py-8">
      <SkipToContent />

      <ResponsiveContainer size="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* ================================================
              PAGE HEADER - Title + Back Button
              ================================================ */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-black tracking-tight">Profile Settings</h1>
              <p className="text-[#4A4A4A] font-medium mt-1">Manage your CloneX identity</p>
            </div>
            {onNavigateBack && (
              <AccessibleButton
                onClick={onNavigateBack}
                variant="outline"
                ariaLabel="Go back to previous page"
                className="border-2 border-[#1C1C1C]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </AccessibleButton>
            )}
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LiveRegion politeness="polite">
                  <div className="bg-[#6EFFC7] border-2 border-[#1C1C1C] rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-black font-medium">{successMessage}</p>
                  </div>
                </LiveRegion>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LiveRegion politeness="assertive">
                  <div className="bg-red-100 border-2 border-[#1C1C1C] rounded-xl p-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </LiveRegion>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================================================
              IDENTITY CARD - Avatar + Name + Address + Stats
              ================================================ */}
          <div className="lab-surface p-6">
            <ResponsiveStack direction="responsive" gap={6} align="start">
              {/* Avatar Display (Read-Only Here) */}
              <div className="relative flex-shrink-0">
                <motion.img
                  src={profile.avatar.url || DEFAULT_AVATAR_SIMPLE}
                  alt="Profile Avatar"
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#1C1C1C]"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
                {(profile.access.hasAccess || nftStats.eligibleNFTs > 0) && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-[#00D26A] text-black text-xs px-2 py-1 rounded-full font-bold border-2 border-[#1C1C1C]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                  >
                    ✓ Access
                  </motion.div>
                )}
              </div>

              {/* Identity Info */}
              <div className="flex-1 min-w-0">
                <motion.h2
                  className="text-2xl font-black text-black mb-1 truncate"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {profile.displayName || 'Anonymous Clone'}
                </motion.h2>

                <p className="text-[#4A4A4A] font-medium mb-3 font-mono text-sm">
                  {`${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`}
                </p>

                {/* Stats Row - Uses live nftData from auth hook */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="lab-badge">
                    {nftStats.eligibleNFTs} Eligible NFTs
                  </span>
                  <span className="lab-badge-accent">
                    {nftStats.totalNFTs} Total NFTs
                  </span>
                  {nftStats.delegatedNFTs > 0 && (
                    <span className="lab-badge-primary">
                      {nftStats.delegatedNFTs} Delegated
                    </span>
                  )}
                </div>

                {/* Verified Holdings Breakdown - Per Collection */}
                {(nftStats.clonex > 0 || nftStats.animus > 0) && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wide mb-2">Verified Holdings</p>
                    <div className="flex flex-wrap gap-3">
                      {nftStats.clonex > 0 && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-3 py-2">
                          <span className="text-sm font-bold text-purple-900">CLONEX</span>
                          <span className="bg-[#00D26A] text-black text-xs font-bold px-2 py-0.5 rounded-full">{nftStats.clonex} VERIFIED</span>
                          {nftStats.hasBreakdown && (
                            <span className="text-xs text-purple-700">
                              {nftStats.clonexOwned} Owned · {nftStats.clonexDelegated} Delegated
                            </span>
                          )}
                        </div>
                      )}
                      {nftStats.animus > 0 && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg px-3 py-2">
                          <span className="text-sm font-bold text-blue-900">ANIMUS</span>
                          <span className="bg-[#00D26A] text-black text-xs font-bold px-2 py-0.5 rounded-full">{nftStats.animus} VERIFIED</span>
                          {nftStats.hasBreakdown && (
                            <span className="text-xs text-blue-700">
                              {nftStats.animusOwned} Owned · {nftStats.animusDelegated} Delegated
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ResponsiveStack>

            {/* Profile Completion */}
            <div className="mt-6 pt-4 border-t-2 border-[#1C1C1C]">
              <ProgressBar
                value={profileCompletion}
                label="Profile Completion"
                showPercentage
                color={activeDNA ? DNA_THEMES[activeDNA]?.accent : '#00C2FF'}
              />
            </div>
          </div>

          {/* ================================================
              DNA THEME - Compact Inline Section
              ================================================ */}
          <div className={`lab-surface p-4 ${murakamiEnabled && hasMurakamiDrip ? 'murakami-shimmer' : ''}`}>
            <div className="flex flex-wrap items-center gap-4">
              {/* DNA Label & Active Indicator */}
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="text-sm font-bold text-black">DNA Theme</span>
                {activeDNA && (
                  <div
                    className="w-4 h-4 rounded-full border-2 border-[#1C1C1C]"
                    style={{ backgroundColor: DNA_THEMES[activeDNA]?.accent }}
                    title={DNA_THEMES[activeDNA]?.name}
                  />
                )}
              </div>

              {/* DNA Type Selector - Inline Buttons */}
              {availableDNA && availableDNA.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {availableDNA.map((dnaType) => {
                    const theme = DNA_THEMES[dnaType]
                    const isActive = activeDNA === dnaType
                    return (
                      <button
                        key={dnaType}
                        onClick={() => setActiveDNA(dnaType)}
                        className={`
                          w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all
                          ${isActive
                            ? 'border-[#1C1C1C] scale-110 shadow-md'
                            : 'border-gray-200 opacity-60 hover:opacity-100 hover:scale-105'
                          }
                        `}
                        style={{ backgroundColor: isActive ? theme?.accent + '20' : 'transparent' }}
                        title={theme?.name}
                        aria-label={`${theme?.name} DNA theme`}
                      >
                        <img
                          src={theme?.icon || `/assets/dna-icons/${dnaType}.svg`}
                          alt={theme?.name}
                          className="w-6 h-6"
                          style={{ filter: isActive ? 'none' : 'grayscale(50%)' }}
                        />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <span className="text-sm text-[#4A4A4A]">No DNA themes available</span>
              )}

              {/* Divider */}
              <div className="h-6 w-px bg-gray-300 hidden sm:block" />

              {/* Murakami Drip Toggle - Only show if eligible */}
              {hasMurakamiDrip && (
                <button
                  onClick={() => setMurakamiEnabled(!murakamiEnabled)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2
                    ${murakamiEnabled
                      ? 'bg-gradient-to-r from-[#FF6BDA] via-[#00FFA3] to-[#5DA3FF] text-white border-[#1C1C1C] shadow-md'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-[#FF6BDA]'
                    }
                  `}
                  title={murakamiEnabled ? 'Disable Murakami Drip effect' : 'Enable Murakami Drip effect'}
                >
                  <span className="text-base">✨</span>
                  <span>Drip</span>
                </button>
              )}

              {/* Divider */}
              <div className="h-6 w-px bg-gray-300 hidden sm:block" />

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2
                  ${darkMode
                    ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-[#1C1C1C]'
                  }
                `}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ================================================
              AVATAR SECTION
              ================================================ */}
          <div className="lab-surface p-6" id="main-content">
            <SectionHeader
              title="Avatar"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={profile.avatar.url || DEFAULT_AVATAR_SIMPLE}
                alt="Current Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#1C1C1C]"
              />
              <div className="flex-1">
                <p className="text-sm text-[#4A4A4A] mb-1">
                  Type: <span className="font-bold text-black capitalize">{profile.avatar.type}</span>
                </p>
                {profile.avatar.type === 'nft' && profile.avatar.nftDetails && (
                  <p className="text-xs text-[#4A4A4A]">
                    {profile.avatar.nftDetails.collection} #{profile.avatar.nftDetails.tokenId}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <AccessibleButton
                  onClick={() => setShowAvatarPicker(true)}
                  variant="primary"
                  className="lab-button-primary px-4 py-2 text-sm"
                  ariaLabel="Choose avatar from your NFT collection"
                >
                  Choose NFT
                </AccessibleButton>
                <AccessibleButton
                  onClick={() => setShowAvatarUploader(true)}
                  variant="secondary"
                  className="lab-button-outline px-4 py-2 text-sm"
                  ariaLabel="Upload a custom avatar image"
                >
                  Upload Custom
                </AccessibleButton>
              </div>
            </div>
          </div>

          {/* ================================================
              DISPLAY NAME & BIO SECTION
              ================================================ */}
          <div className="lab-surface p-6">
            <SectionHeader
              title="Identity"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2" htmlFor="displayName">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  placeholder="Enter your display name"
                  className="lab-input w-full px-4 py-3"
                  aria-describedby="displayName-help"
                />
                <p id="displayName-help" className="mt-1 text-xs text-[#4A4A4A]">
                  {displayName.length}/50 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2" htmlFor="bio">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="lab-input w-full px-4 py-3 resize-none"
                  aria-describedby="bio-help"
                />
                <p id="bio-help" className="mt-1 text-xs text-[#4A4A4A]">
                  {bio.length}/500 characters
                </p>
              </div>

              <div className="flex justify-end">
                <AccessibleButton
                  onClick={saveProfile}
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                  className="lab-button-primary px-6 py-2"
                >
                  Save Identity
                </AccessibleButton>
              </div>
            </div>
          </div>

          {/* ================================================
              SOCIAL CONNECTIONS SECTION
              ================================================ */}
          <div className="lab-surface p-6">
            <SectionHeader
              title="Social Connections"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />

            <SocialConnections
              connections={profile.social}
              onConnectionChange={handleSocialConnectionChange}
            />
          </div>

          {/* ================================================
              WALLET DELEGATION SECTION (Warm.xyz)
              ================================================ */}
          <div className="lab-surface p-6">
            <SectionHeader
              title="Wallet Delegation"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <WarmDelegation onDelegationChange={fetchProfile} />
          </div>

          {/* ================================================
              PRIVACY SETTINGS SECTION
              ================================================ */}
          <div className="lab-surface p-6">
            <SectionHeader
              title="Privacy"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="space-y-3">
              {[
                {
                  key: 'profilePublic',
                  label: 'Public Profile',
                  description: 'Allow others to view your profile'
                },
                {
                  key: 'showNfts',
                  label: 'Show NFTs',
                  description: 'Display your NFT collection publicly'
                },
                {
                  key: 'showWallet',
                  label: 'Show Wallet Address',
                  description: 'Display your full wallet address'
                }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-[#F5F5F5] border-2 border-[#1C1C1C] rounded-xl">
                  <div>
                    <h4 className="font-bold text-black">{setting.label}</h4>
                    <p className="text-sm text-[#4A4A4A]">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy[setting.key as keyof typeof privacy]}
                      onChange={(e) => setPrivacy({ ...privacy, [setting.key]: e.target.checked })}
                      className="sr-only peer"
                      aria-label={setting.label}
                    />
                    <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00C2FF] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#1C1C1C] after:border-2 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C2FF]"></div>
                  </label>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <AccessibleButton
                  onClick={savePrivacy}
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                  className="lab-button-primary px-6 py-2"
                >
                  Save Privacy
                </AccessibleButton>
              </div>
            </div>
          </div>

          {/* ================================================
              ACCOUNT ACTIONS SECTION
              ================================================ */}
          <div className="lab-surface p-6">
            <SectionHeader
              title="Account Actions"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <AccessibleButton
                onClick={() => window.open(`/profile/${profile.walletAddress}`, '_blank')}
                variant="outline"
                className="lab-button-outline px-4 py-3 justify-between"
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
                className="lab-button-outline px-4 py-3 justify-between text-[#FFB800] border-[#FFB800] hover:bg-[#FFB800] hover:text-black"
                ariaLabel="Reset your profile to default settings"
              >
                <span>Reset Profile</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </AccessibleButton>
            </div>
          </div>

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
          setShowResetModal(false)
          setSuccessMessage('Profile reset successfully!')
        }}
      />
    </div>
  )
}
