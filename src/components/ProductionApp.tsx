// CloneX Universal Login - Production App (Full UI) with Error Boundaries
// Complete application structure with navigation, routing, and all features
import React, { lazy, Suspense, useState, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useCloneXAuth } from '../hooks/useCloneXAuth';
import { ENV_CONFIG } from '../config/environment';
import { wagmiConfig } from '../config/wagmiConfig';

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
              ⚠️ Application Error
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

// Simple navigation bar
interface NavigationBarProps {
  onNavigate: (view: 'home' | 'profile' | 'collections') => void;
  currentView: 'home' | 'profile' | 'collections';
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onNavigate, currentView }) => {
  const { isAuthenticated, logout, user, login } = useCloneXAuth();
  const { isConnected } = useAccount();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b-2 border-pink-300 sticky top-0 z-50">
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

          {/* Wallet/User Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-gray-600 uppercase">Connected</p>
                  <p className="text-sm font-mono text-gray-900">
                    {user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold uppercase text-sm hover:bg-red-600 transition-all"
                >
                  Disconnect
                </button>
              </>
            ) : isConnected ? (
              // Wallet connected but not authenticated - show Sign In button
              <button
                onClick={login}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold uppercase text-sm hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg"
              >
                Sign In
              </button>
            ) : (
              // Not connected at all - show RainbowKit Connect Button
              <ConnectButton />
            )}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100">
      {/* ALWAYS render navbar - it handles connect/disconnect logic internally */}
      <NavigationBar onNavigate={setCurrentView} currentView={currentView} />
      
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
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg p-4 font-bold">
              Use the Connect button in the navbar above to get started
            </div>
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
