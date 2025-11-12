// CloneX Universal Login - Social Connections Component (Phase 2.3)
import React, { useState } from 'react'
import {
  socialService,
  SocialPlatform,
  SocialConnections as SocialConnectionsData
} from '../../services/socialService'

interface SocialConnectionsProps {
  connections: SocialConnectionsData
  onConnectionChange: () => void
}

export const SocialConnections: React.FC<SocialConnectionsProps> = ({
  connections,
  onConnectionChange
}) => {
  const [connecting, setConnecting] = useState<SocialPlatform | null>(null)
  const [disconnecting, setDisconnecting] = useState<SocialPlatform | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  /**
   * Handle connecting a social platform
   */
  const handleConnect = async (platform: SocialPlatform) => {
    try {
      setConnecting(platform)
      setError(null)
      setSuccessMessage(null)

      // Initiate OAuth flow
      const result = await socialService.initiateSocialOAuth(platform)

      if (!result.success || !result.authUrl) {
        throw new Error(result.error || 'Failed to initiate OAuth')
      }

      // Open OAuth in popup
      const popupResult = await socialService.openOAuthPopup(
        result.authUrl,
        platform
      )

      if (!popupResult.success) {
        throw new Error(popupResult.error || 'OAuth flow failed')
      }

      // Success - refresh profile
      setSuccessMessage(`Successfully connected ${platform === 'discord' ? 'Discord' : 'X (Twitter)'}!`)
      setTimeout(() => setSuccessMessage(null), 3000)
      onConnectionChange()
    } catch (err: any) {
      console.error(`${platform} connect error:`, err)
      setError(err.message || `Failed to connect ${platform}`)
    } finally {
      setConnecting(null)
    }
  }

  /**
   * Handle disconnecting a social platform
   */
  const handleDisconnect = async (platform: SocialPlatform) => {
    if (!window.confirm(
      `Are you sure you want to disconnect ${platform === 'discord' ? 'Discord' : 'X (Twitter)'}?`
    )) {
      return
    }

    try {
      setDisconnecting(platform)
      setError(null)
      setSuccessMessage(null)

      const result = await socialService.disconnectSocialPlatform(platform)

      if (!result.success) {
        throw new Error(result.error || 'Failed to disconnect')
      }

      setSuccessMessage(result.message)
      setTimeout(() => setSuccessMessage(null), 3000)
      onConnectionChange()
    } catch (err: any) {
      console.error(`${platform} disconnect error:`, err)
      setError(err.message || `Failed to disconnect ${platform}`)
    } finally {
      setDisconnecting(null)
    }
  }

  const isLoading = (platform: SocialPlatform) => {
    return connecting === platform || disconnecting === platform
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Discord Connection */}
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-200 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Discord Icon */}
            <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>

            {/* Discord Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Discord</h3>
              {connections.discord?.verified ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <p className="text-sm text-gray-700 font-medium">
                    {connections.discord.username}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Not connected</p>
              )}
              {connections.discord?.verifiedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Connected {new Date(connections.discord.verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Connect/Disconnect Button */}
          <button
            onClick={() =>
              connections.discord?.verified
                ? handleDisconnect('discord')
                : handleConnect('discord')
            }
            disabled={isLoading('discord')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              connections.discord?.verified
                ? 'bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading('discord') ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {connecting === 'discord' ? 'Connecting...' : 'Disconnecting...'}
              </>
            ) : (
              <>
                {connections.discord?.verified ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disconnect
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect
                  </>
                )}
              </>
            )}
          </button>
        </div>

        {/* Discord Benefits */}
        {!connections.discord?.verified && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600 mb-2 font-medium">Benefits of connecting:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verify your identity across CloneX ecosystem
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Access exclusive Discord channels
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Display verified badge on your profile
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* X/Twitter Connection */}
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* X/Twitter Icon */}
            <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>

            {/* X/Twitter Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">X (Twitter)</h3>
              {connections.x?.verified ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <p className="text-sm text-gray-700 font-medium">
                    @{connections.x.username}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Not connected</p>
              )}
              {connections.x?.verifiedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Connected {new Date(connections.x.verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Connect/Disconnect Button */}
          <button
            onClick={() =>
              connections.x?.verified
                ? handleDisconnect('x')
                : handleConnect('x')
            }
            disabled={isLoading('x')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              connections.x?.verified
                ? 'bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300'
                : 'bg-black hover:bg-gray-800 text-white shadow-md hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading('x') ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {connecting === 'x' ? 'Connecting...' : 'Disconnecting...'}
              </>
            ) : (
              <>
                {connections.x?.verified ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disconnect
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect
                  </>
                )}
              </>
            )}
          </button>
        </div>

        {/* X/Twitter Benefits */}
        {!connections.x?.verified && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600 mb-2 font-medium">Benefits of connecting:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Link your social identity to your profile
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Share your CloneX profile on X
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Display verified badge on your profile
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Why connect social accounts?</h4>
            <p className="text-xs text-blue-800">
              Connecting your social accounts helps verify your identity across the CloneX ecosystem, 
              enables exclusive features, and allows you to share your profile with your community. 
              Your credentials are never stored - we only save your username and verification status.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
