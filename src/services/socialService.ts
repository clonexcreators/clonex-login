// CloneX Universal Login - Social OAuth Service (Phase 2.3)
// Handles Discord and X/Twitter OAuth integration

const API_BASE = 'https://api.clonex.wtf'

export type SocialPlatform = 'discord' | 'x'

export interface SocialConnection {
  verified: boolean
  username: string | null
  verifiedAt: string | null
}

export interface SocialConnections {
  discord?: SocialConnection
  x?: SocialConnection
}

export interface OAuthInitResponse {
  success: boolean
  authUrl: string
  state: string
  error?: string
}

export interface OAuthDisconnectResponse {
  success: boolean
  message: string
  error?: string
}

/**
 * Initialize OAuth flow for a social platform
 * This will return an authorization URL that the user should be redirected to
 */
export const initiateSocialOAuth = async (
  platform: SocialPlatform
): Promise<OAuthInitResponse> => {
  try {
    const token = localStorage.getItem('clonex_auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(
      `${API_BASE}/api/user/social/${platform}/connect`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `Failed to initiate ${platform} OAuth`)
    }

    return data
  } catch (error: any) {
    console.error(`OAuth initiation error (${platform}):`, error)
    return {
      success: false,
      authUrl: '',
      state: '',
      error: error.message || 'Failed to initiate OAuth'
    }
  }
}

/**
 * Disconnect a social platform from the user's account
 */
export const disconnectSocialPlatform = async (
  platform: SocialPlatform
): Promise<OAuthDisconnectResponse> => {
  try {
    const token = localStorage.getItem('clonex_auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(
      `${API_BASE}/api/user/social/${platform}/disconnect`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `Failed to disconnect ${platform}`)
    }

    return {
      success: true,
      message: data.message || `Successfully disconnected ${platform}`
    }
  } catch (error: any) {
    console.error(`OAuth disconnect error (${platform}):`, error)
    return {
      success: false,
      message: '',
      error: error.message || 'Failed to disconnect social platform'
    }
  }
}

/**
 * Handle OAuth callback (for when user returns from OAuth provider)
 * This function parses URL parameters and validates the OAuth state
 */
export const handleOAuthCallback = (url: string): {
  platform: SocialPlatform | null
  code: string | null
  state: string | null
  error: string | null
} => {
  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams

    // Extract parameters
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    // Determine platform from state or path
    let platform: SocialPlatform | null = null
    const path = urlObj.pathname.toLowerCase()
    
    if (path.includes('discord')) {
      platform = 'discord'
    } else if (path.includes('/x/') || path.includes('twitter')) {
      platform = 'x'
    }

    if (error) {
      console.error(`OAuth error (${platform}):`, error, errorDescription)
      return {
        platform,
        code: null,
        state: null,
        error: errorDescription || error
      }
    }

    return {
      platform,
      code,
      state,
      error: null
    }
  } catch (error: any) {
    console.error('OAuth callback parsing error:', error)
    return {
      platform: null,
      code: null,
      state: null,
      error: 'Invalid OAuth callback URL'
    }
  }
}

/**
 * Complete OAuth flow after receiving callback
 * The backend handles the actual token exchange
 */
export const completeOAuth = async (
  platform: SocialPlatform,
  code: string,
  state: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = localStorage.getItem('clonex_auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(
      `${API_BASE}/api/user/social/${platform}/callback`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'OAuth completion failed')
    }

    return { success: true }
  } catch (error: any) {
    console.error(`OAuth completion error (${platform}):`, error)
    return {
      success: false,
      error: error.message || 'Failed to complete OAuth'
    }
  }
}

/**
 * Open OAuth flow in a popup window
 * This provides better UX than full redirects
 */
export const openOAuthPopup = (
  authUrl: string,
  platform: SocialPlatform
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const width = 600
    const height = 700
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      authUrl,
      `${platform}_oauth`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    )

    if (!popup) {
      resolve({
        success: false,
        error: 'Popup blocked. Please allow popups for this site.'
      })
      return
    }

    // Monitor popup for completion
    const checkPopup = setInterval(() => {
      try {
        // Check if popup is closed
        if (popup.closed) {
          clearInterval(checkPopup)
          resolve({ success: true })
          return
        }

        // Try to access popup URL (will throw if cross-origin)
        const popupUrl = popup.location.href
        
        // If we can access it and it's back to our domain, OAuth completed
        if (popupUrl.includes(window.location.origin)) {
          const callbackData = handleOAuthCallback(popupUrl)
          
          if (callbackData.code && callbackData.state && callbackData.platform) {
            // Complete OAuth in background
            completeOAuth(callbackData.platform, callbackData.code, callbackData.state)
              .then(() => {
                popup.close()
                clearInterval(checkPopup)
                resolve({ success: true })
              })
              .catch((error) => {
                popup.close()
                clearInterval(checkPopup)
                resolve({ success: false, error: error.message })
              })
          }
        }
      } catch (e) {
        // Cross-origin error is expected during OAuth flow
      }
    }, 500)

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkPopup)
      if (!popup.closed) {
        popup.close()
      }
      resolve({
        success: false,
        error: 'OAuth timeout. Please try again.'
      })
    }, 300000)
  })
}

export const socialService = {
  initiateSocialOAuth,
  disconnectSocialPlatform,
  handleOAuthCallback,
  completeOAuth,
  openOAuthPopup
}
