// CloneX Universal Login Modal - Complete Auth & Profile Modal
// Version: 1.1.0 - Dropdown positioning anchored below trigger button
// Contains: Connect Wallet, Sign In, Authenticated Profile with NFT Summary & Full Navigation

import React, { useMemo, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCloneXAuth } from '../../hooks/useCloneXAuth';
import { useAuthStore } from '../../stores/authStore';
import { DEFAULT_AVATAR_SIMPLE } from '../../constants/defaultAvatar';

export interface UniversalLoginRoutes {
  profile?: string;
  collections?: string;
  home?: string;
}

interface UniversalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes?: UniversalLoginRoutes;
  onNavigate?: (route: string) => void;
  /** Anchor position for dropdown-style positioning */
  anchorPosition?: { top: number; right: number } | null;
}

type ModalView = 'connect' | 'sign-in' | 'profile';

export const UniversalLoginModal: React.FC<UniversalLoginModalProps> = ({
  isOpen,
  onClose,
  routes = {},
  onNavigate,
  anchorPosition
}) => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    user,
    login,
    logout,
    clearError,
    nftData,
    authStatus
  } = useCloneXAuth();

  const { error } = useAuthStore();

  // Track authentication flow for auto-close
  const wasAuthenticating = useRef(false);

  useEffect(() => {
    if (authStatus === 'authenticating' || authStatus === 'loading_nfts') {
      wasAuthenticating.current = true;
    }
  }, [authStatus]);

  // Auto-close modal when authentication completes
  useEffect(() => {
    if (isOpen && wasAuthenticating.current && authStatus === 'ready') {
      console.log('✅ [UniversalLoginModal] Auth complete, auto-closing');
      wasAuthenticating.current = false;
      onClose();
    }
  }, [authStatus, isOpen, onClose]);

  // Derive view from auth state
  const view = useMemo<ModalView>(() => {
    switch (authStatus) {
      case 'ready':
      case 'loading_nfts':
        return 'profile';
      case 'wallet_connected':
      case 'authenticating':
        return 'sign-in';
      case 'booting':
      case 'idle':
      case 'error':
      default:
        return isConnected ? 'sign-in' : 'connect';
    }
  }, [authStatus, isConnected]);

  // Get avatar URL
  const avatarUrl = useMemo(() => {
    if (user?.avatar?.url) return user.avatar.url;
    return DEFAULT_AVATAR_SIMPLE;
  }, [user?.avatar?.url]);

  // Get display name
  const displayName = useMemo(() => {
    if (user?.displayName) return user.displayName;
    if (user?.walletAddress) {
      return `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`;
    }
    return 'Anonymous';
  }, [user?.displayName, user?.walletAddress]);

  // Calculate NFT stats with owned/delegated breakdown
  const nftStats = useMemo(() => {
    const breakdown = nftData?.breakdown;
    const collections = nftData?.collections;

    // Get totals from collections or breakdown
    const clonex = collections?.clonex || 0;
    const animus = collections?.animus || 0;
    const total = nftData?.totalNFTs || (clonex + animus);

    // Get owned/delegated breakdown if available
    const clonexOwned = breakdown?.direct?.collections?.clonex || 0;
    const clonexDelegated = breakdown?.delegated?.collections?.clonex || 0;
    const animusOwned = breakdown?.direct?.collections?.animus || 0;
    const animusDelegated = breakdown?.delegated?.collections?.animus || 0;

    return {
      clonex,
      animus,
      total,
      clonexOwned,
      clonexDelegated,
      animusOwned,
      animusDelegated,
      hasBreakdown: !!(breakdown?.direct || breakdown?.delegated)
    };
  }, [nftData]);

  // Handlers
  const handleSignIn = async () => {
    clearError();
    await login();
  };

  const handleDisconnectWallet = () => {
    disconnect();
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleNavigation = (route: string | undefined) => {
    if (!route) return;
    onClose();
    if (onNavigate) {
      onNavigate(route);
    } else {
      window.location.href = route;
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
    }
  };

  if (!isOpen) return null;

  // Determine if we should use dropdown positioning or fallback to centered
  const useDropdown = anchorPosition && anchorPosition.top > 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - Dropdown style when anchored, centered fallback for mobile */}
      <div
        className={`
          absolute bg-white rounded-2xl shadow-2xl border-2 border-[#1C1C1C] overflow-hidden
          w-[360px] max-w-[calc(100vw-32px)] flex flex-col
          ${useDropdown ? '' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh]'}
        `}
        style={useDropdown ? {
          top: `${anchorPosition.top}px`,
          right: `${Math.max(16, anchorPosition.right)}px`,
          maxHeight: `calc(100vh - ${anchorPosition.top + 16}px)`,
        } : undefined}
      >
        {/* Header */}
        <div
          className="px-6 py-4"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #9333ea 100%)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase text-white tracking-wide">
              {view === 'connect' && 'Connect Wallet'}
              {view === 'sign-in' && 'Sign In'}
              {view === 'profile' && 'Account'}
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - scrollable when needed */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ============ CONNECT WALLET VIEW ============ */}
          {view === 'connect' && (
            <div className="text-center space-y-4">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent) 20%, #9333ea 100%)' }}
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-black text-black mb-2">Welcome to CloneX</h4>
                <p className="text-gray-600 font-medium text-sm">
                  Connect your wallet to access your CloneX DNA profile and verify your NFT holdings.
                </p>
              </div>
              <div className="flex justify-center pt-2">
                <ConnectButton />
              </div>
            </div>
          )}

          {/* ============ SIGN IN VIEW ============ */}
          {view === 'sign-in' && (
            <div className="space-y-4">
              {/* Wallet Connected Badge */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-700 uppercase">Wallet Connected</p>
                  <p className="text-sm font-mono text-green-800">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>

              {/* Sign In Prompt */}
              <div className="text-center py-2">
                <p className="text-gray-600 font-medium mb-4 text-sm">
                  Sign a message to verify ownership and access your profile.
                </p>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4 text-left">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSignIn}
                  disabled={authStatus === 'authenticating'}
                  className="w-full px-6 py-3 rounded-xl font-bold uppercase text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #9333ea 100%)' }}
                >
                  {authStatus === 'authenticating' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>

              {/* Disconnect Option */}
              <div className="pt-2 border-t-2 border-gray-100">
                <button
                  onClick={handleDisconnectWallet}
                  className="w-full px-4 py-2 text-gray-500 hover:text-red-500 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}

          {/* ============ AUTHENTICATED PROFILE VIEW ============ */}
          {view === 'profile' && user && (
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b-2 border-gray-100">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#1C1C1C]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-black text-black truncate">{displayName}</h4>
                  <p className="text-xs font-mono text-gray-500">
                    {user.walletAddress?.slice(0, 8)}...{user.walletAddress?.slice(-6)}
                  </p>
                </div>
              </div>

              {/* Verified NFT Holdings - with owned/delegated breakdown */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100">
                <p className="text-xs font-bold text-purple-600 uppercase mb-3">Verified NFT Holdings</p>

                {nftStats.total > 0 ? (
                  <div className="space-y-3">
                    {/* CloneX Section */}
                    {nftStats.clonex > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-purple-700 uppercase text-sm">CloneX</span>
                          <span className="text-lg font-black text-purple-600">{nftStats.clonex} <span className="text-xs font-bold text-green-600">VERIFIED</span></span>
                        </div>
                        {nftStats.hasBreakdown && (
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span><span className="font-bold text-gray-700">{nftStats.clonexOwned}</span> Owned</span>
                            <span><span className="font-bold text-gray-700">{nftStats.clonexDelegated}</span> Delegated</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Animus Section */}
                    {nftStats.animus > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-pink-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-pink-700 uppercase text-sm">Animus</span>
                          <span className="text-lg font-black text-pink-500">{nftStats.animus} <span className="text-xs font-bold text-green-600">VERIFIED</span></span>
                        </div>
                        {nftStats.hasBreakdown && (
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span><span className="font-bold text-gray-700">{nftStats.animusOwned}</span> Owned</span>
                            <span><span className="font-bold text-gray-700">{nftStats.animusDelegated}</span> Delegated</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-2xl font-black text-gray-300">0</p>
                    <p className="text-xs text-gray-400">No verified NFTs</p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {routes.profile && (
                  <button
                    onClick={() => handleNavigation(routes.profile)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-black font-bold text-sm transition-all border-2 border-transparent hover:border-[#1C1C1C]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                )}
                {routes.collections && (
                  <button
                    onClick={() => handleNavigation(routes.collections)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-black font-bold text-sm transition-all border-2 border-transparent hover:border-[#1C1C1C]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Collections
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t-2 border-gray-100">
                <button
                  onClick={copyAddress}
                  className="w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Address
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Disconnect & Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t-2 border-gray-100">
          <p className="text-[10px] text-gray-400 text-center font-medium">
            Secure authentication via Ethereum signature
          </p>
        </div>
      </div>
    </div>
  );
};

export default UniversalLoginModal;
