// CloneX Universal Login - Warm Delegation Section
// File: components/profile/WarmDelegation.tsx
// Version: 1.0.0
// Purpose: Allow users to link vault wallets via Warm.xyz protocol

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { AccessibleButton } from '../AccessibilityUtils'

interface VaultWallet {
  address: string
  linkedAt: string
  nftCounts: {
    clonex: number
    animus: number
    total: number
  }
  status: 'active' | 'pending' | 'expired'
}

interface WarmDelegationProps {
  onDelegationChange?: () => void
}

// Warm.xyz contract address
const WARM_CONTRACT = '0xC3AA9bc72Bd623168860a1e5c6a4530d3D80456c'

// Format address for display
const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export const WarmDelegation: React.FC<WarmDelegationProps> = ({ onDelegationChange }) => {
  const { address } = useAccount()
  const [vaultWallets, setVaultWallets] = useState<VaultWallet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastVerified, setLastVerified] = useState<string | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch delegation data from API
  const fetchDelegations = useCallback(async (forceRefresh = false) => {
    if (!address) return

    try {
      setRefreshing(forceRefresh)
      if (!forceRefresh) setLoading(true)
      setError(null)

      const apiBase = import.meta.env.VITE_API_URL || 'https://api.clonex.wtf:3443'
      const endpoint = forceRefresh
        ? `${apiBase}/api/nft/validate/${address}`
        : `${apiBase}/api/nft/effective/${address}?validate=true`

      const response = await fetch(endpoint, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch delegation data')
      }

      const data = await response.json()

      // Extract vault wallets from delegation info
      const vaults: VaultWallet[] = []

      // Check Warm.xyz vaults
      if (data.breakdown?.['warm.xyz']?.vaults) {
        data.breakdown['warm.xyz'].vaults.forEach((vaultAddr: string) => {
          vaults.push({
            address: vaultAddr,
            linkedAt: data.verifiedAt || new Date().toISOString(),
            nftCounts: {
              clonex: data.breakdown['warm.xyz'].counts?.clonex || 0,
              animus: data.breakdown['warm.xyz'].counts?.animus || 0,
              total: Object.values(data.breakdown['warm.xyz'].counts || {}).reduce((a: number, b: number) => a + b, 0) as number
            },
            status: 'active'
          })
        })
      }

      // Check Delegate.xyz vaults
      if (data.breakdown?.['delegate.xyz']?.vaults) {
        data.breakdown['delegate.xyz'].vaults.forEach((vaultAddr: string) => {
          // Don't add duplicates
          if (!vaults.find(v => v.address.toLowerCase() === vaultAddr.toLowerCase())) {
            vaults.push({
              address: vaultAddr,
              linkedAt: data.verifiedAt || new Date().toISOString(),
              nftCounts: {
                clonex: data.breakdown['delegate.xyz'].counts?.clonex || 0,
                animus: data.breakdown['delegate.xyz'].counts?.animus || 0,
                total: Object.values(data.breakdown['delegate.xyz'].counts || {}).reduce((a: number, b: number) => a + b, 0) as number
              },
              status: 'active'
            })
          }
        })
      }

      setVaultWallets(vaults)
      setLastVerified(data.verifiedAt || new Date().toISOString())

    } catch (err) {
      console.error('Failed to fetch delegations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load delegation data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [address])

  useEffect(() => {
    fetchDelegations()
  }, [fetchDelegations])

  const handleRefresh = async () => {
    await fetchDelegations(true)
    onDelegationChange?.()
  }

  const handleLinkVault = () => {
    // Open Warm.xyz in a new tab to set up delegation
    window.open('https://warm.xyz', '_blank', 'noopener,noreferrer')
    setShowLinkModal(false)
  }

  const handleLinkDelegateXyz = () => {
    // Open Delegate.xyz in a new tab
    window.open('https://delegate.xyz', '_blank', 'noopener,noreferrer')
    setShowLinkModal(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#4A4A4A]">
            Link a vault wallet to access your NFTs safely without exposing your main holdings.
          </p>
        </div>
        <AccessibleButton
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
          ariaLabel="Refresh delegation status"
          className="border-2 border-[#1C1C1C] flex-shrink-0"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </AccessibleButton>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Linked Vaults */}
      {vaultWallets.length > 0 ? (
        <div className="space-y-3">
          {vaultWallets.map((vault, index) => (
            <motion.div
              key={vault.address}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 border-2 border-[#1C1C1C] rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Vault Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-black">{formatAddress(vault.address)}</p>
                    <p className="text-xs text-[#4A4A4A]">
                      Linked {formatRelativeTime(vault.linkedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* NFT Counts */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-black">
                      {vault.nftCounts.total} NFTs
                    </p>
                    <p className="text-xs text-[#4A4A4A]">
                      {vault.nftCounts.clonex} CloneX, {vault.nftCounts.animus} Animus
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-semibold
                    ${vault.status === 'active'
                      ? 'bg-[#6EFFC7] text-black'
                      : vault.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {vault.status === 'active' ? '● Active' : vault.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-[#1C1C1C] rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-white border-2 border-[#1C1C1C] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#4A4A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-black mb-2">No Vault Wallets Linked</h4>
          <p className="text-sm text-[#4A4A4A] mb-4 max-w-sm mx-auto">
            Keep your valuable NFTs safe in a hardware wallet while using a hot wallet for daily interactions.
          </p>
        </div>
      )}

      {/* Link Vault CTA */}
      <div className="flex gap-3">
        <AccessibleButton
          onClick={() => setShowLinkModal(true)}
          variant="primary"
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-2 border-[#1C1C1C]"
          ariaLabel="Link a vault wallet"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Link Vault Wallet
        </AccessibleButton>
      </div>

      {/* Last Verified Timestamp */}
      {lastVerified && (
        <p className="text-xs text-center text-[#4A4A4A]">
          Last verified: {formatRelativeTime(lastVerified)}
        </p>
      )}

      {/* Link Vault Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLinkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border-2 border-[#1C1C1C] max-w-md w-full p-6 shadow-xl"
            >
              <h3 className="text-xl font-black text-black mb-4">Link a Vault Wallet</h3>

              <p className="text-sm text-[#4A4A4A] mb-6">
                Choose how you want to link your vault wallet. Both methods allow your hot wallet
                to access your vault's NFTs without exposing your main holdings.
              </p>

              <div className="space-y-3">
                {/* Warm.xyz Option - Recommended */}
                <button
                  onClick={handleLinkVault}
                  className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl border-2 border-[#1C1C1C] hover:shadow-lg transition-shadow text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">🔥 Warm.xyz</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-white/80">
                        Simple vault → hot wallet linking
                      </p>
                    </div>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </button>

                {/* Delegate.xyz Option */}
                <button
                  onClick={handleLinkDelegateXyz}
                  className="w-full p-4 bg-gray-100 text-black rounded-xl border-2 border-[#1C1C1C] hover:bg-gray-200 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold">🔗 Delegate.xyz</span>
                      <p className="text-sm text-[#4A4A4A]">
                        Advanced delegation options
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[#4A4A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>How it works:</strong> After linking on Warm.xyz or Delegate.xyz,
                  return here and click "Refresh" to verify your delegation. Your hot wallet
                  will then have access to your vault's NFTs.
                </p>
              </div>

              <button
                onClick={() => setShowLinkModal(false)}
                className="w-full mt-4 py-2 text-[#4A4A4A] hover:text-black font-medium transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WarmDelegation
