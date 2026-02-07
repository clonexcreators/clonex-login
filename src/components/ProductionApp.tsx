// CloneX Universal Login - Production App (Full UI) with Error Boundaries
// Fixed: Proper auth state machine with compact modal for sign-in/profile

import React, { lazy, Suspense, useState, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useCloneXAuth } from '../hooks/useCloneXAuth';
import { ENV_CONFIG } from '../config/environment';
import { wagmiConfig } from '../config/wagmiConfig';
import { CompactAuthModal } from './CompactAuthModal';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ProductionApp Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100 p-4">
          <div className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-2xl border-2 border-red-300 shadow-lg p-8">
            <h2 className="text-2xl font-black uppercase mb-4 text-red-600">
              Application Error
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="font-mono text-sm text-red-800 break-words">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg font-bold uppercase hover:bg-pink-600 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load major components
const ProfilePageEnhanced = lazy(() =>
  import('./ProfilePageEnhanced').then(module => ({
    default: module.ProfilePage || module.ProfilePageEnhanced || module.default
  }))
);

const ProductionNFTDashboard = lazy(() =>
  import('./ProductionNFTDashboard').then(module => ({
    default: module.ProductionNFTDashboard || module.default
  }))
);

// Loading component with DNA theme
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
        LOADING CLONEX DNA...
      </p>
    </div>
  </div>
);

// Simple navigation bar with modal integration
interface NavigationBarProps {
  onNavigate: (view: 'home' | 'profile' | 'collections') => void;
  currentView: 'home' | 'profile' | 'collections';
  onOpenAuthModal: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onNavigate, currentView, onOpenAuthModal }) => {
  const { isAuthenticated, user, isLoading } = useCloneXAuth();
  const { isConnected, isConnecting } = useAccount();

  // Debug logging
  console.log('🎯 [NavigationBar] State:', { isLoading, isConnecting, isConnected, isAuthenticated, hasUser: !!user });

  // Determine button state
  const getButtonContent = () => {
    // Only show loading if we're actually doing auth work, not just wallet connecting
    if (isLoading) {
      return (
        <button
          disabled
          className="px-6 py-2 bg-gray-400 text-white rounded-lg font-bold uppercase text-sm cursor-not-allowed flex items-center gap-2"
        >
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </button>
      );
    }

    // Wallet is connecting (auto-reconnect on page load)
    if (isConnecting) {
      return (
        <button
          disabled
          className="px-6 py-2 bg-gray-400 text-white rounded-lg font-bold uppercase text-sm cursor-not-allowed flex items-center gap-2"
        >
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Connecting...
        </button>
      );
    }

    if (isAuthenticated && user) {
      // Authenticated - show profile button
      return (
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold uppercase text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="hidden md:inline">
            {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
          </span>
          <span className="md:hidden">Profile</span>
        </button>
      );
    }

    if (isConnected) {
      // Connected but not authenticated - show Sign In
      return (
        <button
          onClick={onOpenAuthModal}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold uppercase text-sm hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Sign In
        </button>
      );
    }

    // Not connected - show Connect button
    return (
      <button
        onClick={onOpenAuthModal}
        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold uppercase text-sm hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Connect
      </button>
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b-2 border-pink-300 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              CLONEX DNA
            </h1>
          </div>

          {/* Navigation Links - Only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => onNavigate('home')}
                className={`px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${
                  currentView === 'home'
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-pink-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className={`px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${
                  currentView === 'profile'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-purple-100'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => onNavigate('collections')}
                className={`px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${
                  currentView === 'collections'
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-cyan-100'
                }`}
              >
                Collections
              </button>
            </div>
          )}

          {/* Auth Button */}
          <div className="flex items-center">
            {getButtonContent()}
          </div>
        </div>

        {/* Mobile Navigation - Only show when authenticated */}
        {isAuthenticated && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-pink-200">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1 rounded font-bold text-xs ${
                currentView === 'home' ? 'bg-pink-500 text-white' : 'text-gray-700'
              }`}
            >
              HOME
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className={`px-3 py-1 rounded font-bold text-xs ${
                currentView === 'profile' ? 'bg-purple-500 text-white' : 'text-gray-700'
              }`}
            >
              PROFILE
            </button>
            <button
              onClick={() => onNavigate('collections')}
              className={`px-3 py-1 rounded font-bold text-xs ${
                currentView === 'collections' ? 'bg-cyan-500 text-white' : 'text-gray-700'
              }`}
            >
              COLLECTIONS
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Main App Content
const AppContent: React.FC = () => {
  const { isAuthenticated } = useCloneXAuth();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'collections'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100">
      {/* Navigation Bar */}
      <NavigationBar
        onNavigate={setCurrentView}
        currentView={currentView}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <CompactAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {!isAuthenticated ? (
        // Unauthenticated welcome screen
        <div className="flex items-center justify-center p-4 mt-8">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl border-2 border-pink-300 shadow-lg p-8 text-center">
            <h2 className="text-3xl font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              Welcome to CloneX
            </h2>
            <p className="text-gray-700 font-bold mb-6">
              Connect your wallet and sign in to access your CloneX DNA profile
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold uppercase hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started
            </button>
          </div>
        </div>
      ) : (
        // Authenticated content with full UI
        <main className="py-8">
          <Suspense fallback={<LoadingScreen />}>
            {currentView === 'home' && (
              <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border-2 border-pink-300 shadow-lg p-8 mb-6">
                  <h2 className="text-3xl font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    Dashboard
                  </h2>
                  <p className="text-gray-700 font-bold mb-4">
                    Welcome to your CloneX DNA Sequencer
                  </p>
                </div>
                <ProductionNFTDashboard />
              </div>
            )}

            {currentView === 'profile' && (
              <ProfilePageEnhanced onNavigateBack={() => setCurrentView('home')} />
            )}

            {currentView === 'collections' && (
              <div className="max-w-7xl mx-auto px-4">
                <ProductionNFTDashboard />
              </div>
            )}
          </Suspense>
        </main>
      )}
    </div>
  );
};

// QueryClient for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ENV_CONFIG.cacheTimeout,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Main Production App Export
export const ProductionApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#ec4899', // pink-500
              accentColorForeground: 'white',
              borderRadius: 'large',
            })}
          >
            <Router>
              <Routes>
                <Route path="/" element={<AppContent />} />
                <Route path="/profile" element={<AppContent />} />
                <Route path="/collections" element={<AppContent />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
};

export default ProductionApp;
