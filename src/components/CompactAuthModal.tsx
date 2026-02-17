// CloneX Compact Auth Modal - Unified Sign-In and Profile Modal
// Handles: Connect Wallet -> Sign Message -> Authenticated Profile View
// PHASE-0 FIX: Uses authStatus state machine for reliable view switching

import React, { useMemo, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCloneXAuth } from '../hooks/useCloneXAuth';

interface CompactAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = 'connect' | 'sign-in' | 'profile';

export const CompactAuthModal: React.FC<CompactAuthModalProps> = ({ isOpen, onClose }) => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
    clearError,
    nftData,
    authStatus
  } = useCloneXAuth();

  // Track previous authStatus to detect transition to 'ready'
  const prevAuthStatus = useRef(authStatus);
  const wasAuthenticating = useRef(false);

  // Track when we enter authenticating state
  useEffect(() => {
    if (authStatus === 'authenticating' || authStatus === 'loading_nfts') {
      wasAuthenticating.current = true;
    }
  }, [authStatus]);

  // PHASE-0 FIX: Auto-close modal when authentication completes successfully
  useEffect(() => {
    // If modal is open and we were authenticating and now we're ready, close the modal
    if (isOpen && wasAuthenticating.current && authStatus === 'ready') {
      console.log('✅ [CompactAuthModal] Auth complete, auto-closing modal');
      wasAuthenticating.current = false;
      onClose();
    }
    prevAuthStatus.current = authStatus;
  }, [authStatus, isOpen, onClose]);

  // PHASE-0 FIX: Derive view from authStatus (single source of truth)
  // This prevents flickering and race conditions
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
        // During booting, show connect view but with loading indicator handled by button
        return isConnected ? 'sign-in' : 'connect';
    }
  }, [authStatus, isConnected]);

  // Handle sign-in
  const handleSignIn = async () => {
    clearError();
    await login();
  };

  // Handle disconnect wallet only (keeps session if exists)
  const handleDisconnectWallet = () => {
    disconnect();
    onClose();
  };

  // Handle full logout (clear session + disconnect)
  const handleLogout = () => {
    logout();
    onClose();
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full border-2 border-pink-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase text-white tracking-wide">
              {view === 'connect' && 'Connect Wallet'}
              {view === 'sign-in' && 'Sign In'}
              {view === 'profile' && 'Your Profile'}
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Connect Wallet View */}
          {view === 'connect' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">
                Connect your wallet to access CloneX DNA features
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          )}

          {/* Sign In View */}
          {view === 'sign-in' && (
            <div className="space-y-4">
              {/* Wallet Connected Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
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
                <p className="text-gray-600 font-medium mb-4">
                  Sign a message to authenticate and access your CloneX profile
                </p>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-left">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSignIn}
                  disabled={authStatus === 'authenticating'}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold uppercase text-sm hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <div className="pt-2 border-t border-gray-100">
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

          {/* Profile View */}
          {view === 'profile' && user && (
            <div className="space-y-4">
              {/* Authenticated Badge */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-green-700 uppercase">Authenticated</p>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm font-mono text-gray-700">
                      {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* NFT Holdings Summary - Neutral, no tier language */}
              {nftData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Verified Holdings</p>
                  <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    {(() => {
                      const clonex = nftData.nftCollections?.clonex?.count || 0;
                      const animus = nftData.nftCollections?.animus?.count || 0;
                      const total = clonex + animus;
                      return `${total} NFT${total !== 1 ? 's' : ''} Verified`;
                    })()}
                  </p>
                </div>
              )}

              {/* NFT Summary */}
              {nftData && nftData.nftCollections && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs font-bold text-purple-600 uppercase mb-2">Your Collections</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {nftData.nftCollections.clonex?.count > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-purple-700 font-medium">CloneX:</span>
                        <span className="font-bold">{nftData.nftCollections.clonex.count}</span>
                      </div>
                    )}
                    {nftData.nftCollections.animus?.count > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-purple-700 font-medium">Animus:</span>
                        <span className="font-bold">{nftData.nftCollections.animus.count}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={copyAddress}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Address
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Secure authentication powered by Ethereum signatures
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompactAuthModal;
