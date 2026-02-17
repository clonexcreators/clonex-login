// ============================================================================
// CloneX Auth SDK - Provider Component
// Version: 1.0.0
// Wraps the app with all necessary auth providers
// ============================================================================

import React, { useEffect, ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { CloneXAuthConfig } from './types';
import { initCloneXAuth, getConfig } from './config';

// ============================================================================
// Default Query Client
// ============================================================================

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

// ============================================================================
// Provider Props
// ============================================================================

export interface CloneXAuthProviderProps {
  children: ReactNode;
  /** CloneX Auth configuration */
  config?: CloneXAuthConfig;
  /** Custom wagmi config (optional - will create default if not provided) */
  wagmiConfig?: any;
  /** Custom query client (optional) */
  queryClient?: QueryClient;
  /** RainbowKit theme (optional) */
  theme?: any;
  /** App name for WalletConnect */
  appName?: string;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * CloneXAuthProvider - Wraps your app with all necessary auth providers
 *
 * Usage:
 * ```tsx
 * import { CloneXAuthProvider } from '@clonex/auth';
 *
 * function App() {
 *   return (
 *     <CloneXAuthProvider
 *       config={{ walletConnectProjectId: 'YOUR_PROJECT_ID' }}
 *       appName="My CloneX App"
 *     >
 *       <YourApp />
 *     </CloneXAuthProvider>
 *   );
 * }
 * ```
 */
export const CloneXAuthProvider: React.FC<CloneXAuthProviderProps> = ({
  children,
  config: userConfig,
  wagmiConfig: customWagmiConfig,
  queryClient = defaultQueryClient,
  theme,
  appName = 'CloneX App'
}) => {
  // Initialize CloneX Auth config
  useEffect(() => {
    if (userConfig) {
      initCloneXAuth(userConfig);
    }
  }, [userConfig]);

  // Create default wagmi config if not provided
  const wagmiConfig = customWagmiConfig || createDefaultWagmiConfig(
    userConfig?.walletConnectProjectId || '',
    appName
  );

  // Default theme
  const rainbowTheme = theme || darkTheme({
    accentColor: '#ec4899', // pink-500
    accentColorForeground: 'white',
    borderRadius: 'large'
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// ============================================================================
// Helper: Create Default Wagmi Config
// ============================================================================

function createDefaultWagmiConfig(projectId: string, appName: string) {
  return getDefaultConfig({
    appName,
    projectId: projectId || 'clonex-auth-sdk',
    chains: [mainnet],
    transports: {
      [mainnet.id]: http()
    }
  });
}

// ============================================================================
// Headless Provider (no RainbowKit UI)
// ============================================================================

/**
 * CloneXAuthProviderHeadless - For apps that want to use their own wallet UI
 *
 * Usage:
 * ```tsx
 * import { CloneXAuthProviderHeadless } from '@clonex/auth';
 *
 * function App() {
 *   return (
 *     <CloneXAuthProviderHeadless config={{ ... }}>
 *       <YourApp />
 *     </CloneXAuthProviderHeadless>
 *   );
 * }
 * ```
 */
export const CloneXAuthProviderHeadless: React.FC<{
  children: ReactNode;
  config?: CloneXAuthConfig;
  wagmiConfig?: any;
  queryClient?: QueryClient;
}> = ({
  children,
  config: userConfig,
  wagmiConfig: customWagmiConfig,
  queryClient = defaultQueryClient
}) => {
  // Initialize CloneX Auth config
  useEffect(() => {
    if (userConfig) {
      initCloneXAuth(userConfig);
    }
  }, [userConfig]);

  // Create default wagmi config if not provided
  const wagmiConfig = customWagmiConfig || createDefaultWagmiConfig(
    userConfig?.walletConnectProjectId || '',
    'CloneX App'
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default CloneXAuthProvider;
