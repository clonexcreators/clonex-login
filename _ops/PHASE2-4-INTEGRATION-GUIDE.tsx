// Phase 2.4 Integration Code - Add to ProfilePage.tsx
// These code snippets need to be integrated into the existing ProfilePage.tsx

// ========================================
// 1. ADD TO STATE SECTION (after line 93)
// ========================================

  // Phase 2.4 - Profile Reset & Public Pages
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)

// ========================================
// 2. ADD NEW HANDLERS (after handleSocialConnectionChange)
// ========================================

  // Phase 2.4 - Profile Reset handler
  const handleProfileReset = async () => {
    try {
      setResetting(true)
      setError(null)
      
      await profileService.deleteProfile()
      
      // Refresh profile to see reset state
      await fetchProfile()
      
      setSuccessMessage('Profile reset successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to reset profile')
      console.error('Profile reset error:', err)
    } finally {
      setResetting(false)
    }
  }

  // Phase 2.4 - View Public Profile handler
  const handleViewPublicProfile = () => {
    if (profile?.walletAddress) {
      const publicUrl = profileService.getShareableProfileURL(profile.walletAddress)
      window.open(publicUrl, '_blank')
    }
  }

// ========================================
// 3. REPLACE ACCOUNT ACTIONS SECTION (around line 640)
// ========================================

        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={handleViewPublicProfile}
              disabled={!profile?.privacy.profilePublic}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="block">View Public Profile</span>
                  {!profile?.privacy.profilePublic && (
                    <span className="text-xs text-gray-500">Enable public profile in Privacy settings</span>
                  )}
                </div>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </button>
            
            <button 
              onClick={() => setShowResetModal(true)}
              className="w-full px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="block">Reset Profile</span>
                  <span className="text-xs text-yellow-600">Clear all profile data</span>
                </div>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </button>
          </div>
        </div>

// ========================================
// 4. ADD AT END OF COMPONENT (before closing div)
// ========================================

      {/* Profile Reset Modal - Phase 2.4 */}
      <ProfileResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleProfileReset}
        isLoading={resetting}
      />

// ========================================
// COMPLETE INTEGRATION INSTRUCTIONS
// ========================================

/*
 * To integrate Phase 2.4 into ProfilePage.tsx:
 * 
 * 1. The imports are already updated (ProfileResetModal + profileService)
 * 
 * 2. Add the state variables after line 93:
 *    - showResetModal
 *    - resetting
 * 
 * 3. Add the two new handler functions after handleSocialConnectionChange:
 *    - handleProfileReset
 *    - handleViewPublicProfile
 * 
 * 4. Replace the "Account Actions" section with the new version that:
 *    - Implements handleViewPublicProfile onClick
 *    - Shows disabled state when profile not public
 *    - Opens reset modal with setShowResetModal(true)
 * 
 * 5. Add ProfileResetModal component at the end (before final closing </div>)
 * 
 * These changes enable:
 *    ✅ Profile reset with confirmation modal
 *    ✅ View public profile in new tab
 *    ✅ Privacy-aware UI (disabled when profile not public)
 */
