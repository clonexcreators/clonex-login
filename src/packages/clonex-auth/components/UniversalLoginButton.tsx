// ============================================================================
// CloneX Auth SDK - Universal Login Button
// Version: 1.0.0
// Deployable single-component login trigger
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useCloneXAuth } from '../useCloneXAuth';
import { useAuthStore } from '../authStore';
import { UniversalLoginModal } from './UniversalLoginModal';
import { UniversalLoginButtonProps } from '../types';

// Default avatar SVG as data URI
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iI2VjNDg5OSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNDAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0yNSA4NSBRMjUgNjAgNTAgNjAgUTc1IDYwIDc1IDg1IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';

/**
 * UniversalLoginButton - Single deployable component for CloneX authentication
 *
 * Features:
 * - Displays appropriate state: Connect / Sign In / Avatar+Name
 * - Opens UniversalLoginModal with full functionality
 * - Completely self-contained - no external dependencies
 * - Portable across CloneX ecosystem (web, iOS, UE5)
 */
export const UniversalLoginButton: React.FC<UniversalLoginButtonProps> = ({
  routes = {},
  variant = 'default',
  className = '',
  onNavigate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, isConnecting } = useAccount();
  const { authStatus, user, nftData } = useAuthStore();

  // Get avatar URL
  const avatarUrl = useMemo(() => {
    if (user?.avatar?.url) return user.avatar.url;
    return DEFAULT_AVATAR;
  }, [user?.avatar?.url]);

  // Get display name
  const displayName = useMemo(() => {
    if (user?.displayName) return user.displayName;
    if (user?.walletAddress) {
      return `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`;
    }
    return 'Connect';
  }, [user?.displayName, user?.walletAddress]);

  // Calculate NFT count
  const nftCount = useMemo(() => {
    if (!nftData?.nftCollections) return 0;
    const clonex = nftData.nftCollections.clonex?.count || 0;
    const animus = nftData.nftCollections.animus?.count || 0;
    return clonex + animus;
  }, [nftData]);

  // Handle navigation
  const handleNavigate = (route: string) => {
    setIsModalOpen(false);
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.location.href = route;
    }
  };

  // Render button based on auth state
  const renderButton = () => {
    // Loading states
    if (authStatus === 'booting' || authStatus === 'authenticating' || authStatus === 'loading_nfts' || isConnecting) {
      const loadingLabels: Record<string, string> = {
        booting: 'Loading...',
        authenticating: 'Signing...',
        loading_nfts: 'Verifying...'
      };
      const label = loadingLabels[authStatus] || 'Connecting...';

      return (
        <button
          disabled
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-300 text-gray-600 cursor-not-allowed border-2 border-gray-400 ${className}`}
        >
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {variant !== 'minimal' && <span>{label}</span>}
        </button>
      );
    }

    // Authenticated state
    if (authStatus === 'ready' && user) {
      if (variant === 'minimal') {
        return (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#1C1C1C] hover:border-pink-500 transition-all hover:scale-105 shadow-md ${className}`}
            aria-label="Open account menu"
          >
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            {nftCount > 0 && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">✓</span>
              </div>
            )}
          </button>
        );
      }

      if (variant === 'compact') {
        return (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-[#1C1C1C] hover:border-pink-500 hover:shadow-lg transition-all ${className}`}
            aria-label="Open account menu"
          >
            <img src={avatarUrl} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
            <span className="font-bold text-sm text-black truncate max-w-[100px]">{displayName}</span>
          </button>
        );
      }

      // Default variant
      return (
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-white border-2 border-[#1C1C1C] hover:border-pink-500 hover:shadow-lg transition-all group ${className}`}
          aria-label="Open account menu"
        >
          <div className="relative">
            <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 group-hover:border-pink-500 transition-colors" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-bold text-sm text-black leading-tight truncate max-w-[120px]">{displayName}</span>
            {user.walletAddress && user.displayName && (
              <span className="text-[10px] text-gray-500 font-mono leading-tight">
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </span>
            )}
          </div>
          <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      );
    }

    // Wallet connected but not signed in
    if (authStatus === 'wallet_connected' || (isConnected && authStatus !== 'ready')) {
      return (
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white border-2 border-pink-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all ${className}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          {variant !== 'minimal' && <span>Sign In</span>}
        </button>
      );
    }

    // Not connected
    return (
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white border-2 border-pink-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all ${className}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {variant !== 'minimal' && <span>Connect</span>}
      </button>
    );
  };

  return (
    <>
      {renderButton()}
      <UniversalLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        routes={routes}
        onNavigate={handleNavigate}
      />
    </>
  );
};

export default UniversalLoginButton;
