import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock user profile data
 */
export const mockUserProfile = {
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  displayName: 'Test User',
  bio: 'Test bio',
  avatar: {
    url: 'https://test.com/avatar.png',
    type: 'uploaded' as const,
  },
  access: {
    hasAccess: true,
    eligibleNFTs: 15,
    accessReason: 'User has 15 qualifying NFTs',
  },
  nfts: {
    collections: {
      clonex: 10,
      animus: 5,
    },
    totalNFTs: 15,
    totalDelegatedNFTs: 5,
  },
  social: {
    discord: {
      verified: true,
      username: 'testuser#1234',
      verifiedAt: '2025-01-01T00:00:00Z',
    },
    x: {
      verified: false,
      username: null,
      verifiedAt: null,
    },
  },
  privacy: {
    profilePublic: true,
    showNfts: true,
    showWallet: false,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

/**
 * Mock auth response
 */
export const mockAuthResponse = {
  success: true,
  token: 'mock-jwt-token',
  user: {
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    hasAccess: true,
    eligibleNFTs: 15,
    accessReason: 'User has 15 qualifying NFTs',
  },
};

/**
 * Mock NFT verification response
 */
export const mockNFTVerification = {
  success: true,
  hasAccess: true,
  eligibleNFTs: 15,
  collections: {
    clonex: 10,
    animus: 5,
  },
  totalNFTs: 15,
  breakdown: {
    direct: {
      total: 10,
      collections: { clonex: 8, animus: 2 },
      nfts: [],
    },
    'delegate.xyz': {
      total: 3,
      collections: { clonex: 2, animus: 1 },
      nfts: [],
    },
    'warm.xyz': {
      total: 2,
      collections: { clonex: 0, animus: 2 },
      nfts: [],
    },
  },
  apiVersion: '3.5.1',
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock file for upload testing
 */
export const createMockFile = (
  name: string = 'test.png',
  size: number = 1024,
  type: string = 'image/png'
): File => {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
