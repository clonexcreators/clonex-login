// Wagmi & RainbowKit Configuration
// Centralized Web3 wallet connector configuration
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import { ENV_CONFIG } from './environment';

// Get WalletConnect Project ID from environment or use fallback
const getWalletConnectProjectId = (): string => {
  // Try environment variable first
  if (ENV_CONFIG.walletConnectId) {
    return ENV_CONFIG.walletConnectId;
  }
  
  // Fallback for development/testing
  // This is a public test ID that allows the app to load
  // In production, this should be replaced with your actual WalletConnect Project ID
  return '8f1c4d3e2b9a5c7f6e4d8b2a9c5e7f3d';
};

// Wagmi Configuration with RainbowKit
export const wagmiConfig = getDefaultConfig({
  appName: 'CloneX Universal Login',
  projectId: getWalletConnectProjectId(),
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  ssr: false, // We're not using SSR
});

// Export the config for use in ProductionApp
export default wagmiConfig;
