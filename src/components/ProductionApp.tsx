// CloneX Universal Login - Production App (Full UI) with Error Boundaries
// v2.0.0: Uses self-contained UniversalLoginButton for portable auth UI

import React, { lazy, Suspense, useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useCloneXAuth } from '../hooks/useCloneXAuth';
import { useAuthStore } from '../stores/authStore';
import { useDNAThemes } from '../hooks/useDNAThemes';
import { ENV_CONFIG } from '../config/environment';
import { wagmiConfig } from '../config/wagmiConfig';
import { UniversalLoginButton } from './UniversalLogin';

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
        <div className="min-h-screen flex items-center justify-center p-4">
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

// Loading component — background comes from body via DNA theme
const LoadingScreen = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}></div>
      <p className="font-black text-lg dna-accent-text">
        LOADING CLONEX DNA...
      </p>
    </div>
  </div>
);

// Navigation Bar - Clean design with UniversalLoginButton
interface NavigationBarProps {
  onNavigate: (view: 'home' | 'profile' | 'collections') => void;
  currentView: 'home' | 'profile' | 'collections';
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onNavigate, currentView }) => {
  return (
    <nav className="dna-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — uses theme accent */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-black uppercase tracking-wider dna-accent-text">
              CLONEX DNA
            </h1>
          </div>

          {/* Universal Login Button - Self-contained auth UI with navigation */}
          <div className="flex items-center">
            <UniversalLoginButton
              routes={{
                profile: '#profile',
                collections: '#collections'
              }}
              onNavigate={(route) => {
                // Handle internal navigation from modal
                if (route === '#profile') onNavigate('profile');
                else if (route === '#collections') onNavigate('collections');
              }}
              variant="default"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Content
// DNA Theme Integration: useDNAThemes at app level drives the entire page theme
const AppContent: React.FC = () => {
  const { authStatus, nftData } = useCloneXAuth();
  const { activeDNA, refreshOwnedDNA } = useDNAThemes();
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'collections'>('home');

  // Wire NFT data → DNA theme extraction on auth state changes
  useEffect(() => {
    if (nftData?.nfts && nftData.nfts.length > 0) {
      refreshOwnedDNA(nftData.nfts);
    }
  }, [nftData?.nfts, refreshOwnedDNA]);

  // Dev-only DNA theme diagnostics (behind env flag)
  useEffect(() => {
    if (import.meta.env.DEV || import.meta.env.VITE_DNA_DEBUG === 'true') {
      const root = document.documentElement;
      console.log('🧬 [DNA Theme Diagnostic]', {
        activeDNA,
        authStatus,
        'data-dna-theme': root.getAttribute('data-dna-theme'),
        '--accent': root.style.getPropertyValue('--accent') || getComputedStyle(root).getPropertyValue('--accent'),
        '--dna-background': root.style.getPropertyValue('--dna-background') || 'from CSS',
        'data-finish': root.getAttribute('data-finish'),
        nftCount: nftData?.nfts?.length || 0,
      });
    }
  }, [activeDNA, authStatus, nftData]);

  // Determine if we should show authenticated content
  const showAuthenticatedContent = authStatus === 'ready' || authStatus === 'loading_nfts';

  return (
    <div className="min-h-screen">
      {/* Background comes from body via var(--dna-background) in dna.css */}

      {/* Navigation Bar with UniversalLoginButton */}
      <NavigationBar
        onNavigate={setCurrentView}
        currentView={currentView}
      />

      {!showAuthenticatedContent ? (
        // Unauthenticated welcome screen
        <div className="flex items-center justify-center p-4 mt-8">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl border-2 p-8 text-center accent-border">
            <h2 className="text-3xl font-black uppercase mb-4 dna-accent-text">
              Welcome to CloneX
            </h2>
            <p className="text-gray-700 font-bold mb-6">
              Connect your wallet and sign in to access your CloneX DNA profile
            </p>
            {/* Use UniversalLoginButton for welcome screen too */}
            <div className="flex justify-center">
              <UniversalLoginButton variant="default" />
            </div>
          </div>
        </div>
      ) : (
        // Authenticated content with full UI
        <main className="py-8">
          <Suspense fallback={<LoadingScreen />}>
            {currentView === 'home' && (
              <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border-2 accent-border p-8 mb-6">
                  <h2 className="text-3xl font-black uppercase mb-4 dna-accent-text">
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
