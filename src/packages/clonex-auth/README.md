# @clonex/auth

Universal authentication SDK for the CloneX ecosystem.

## Features

- 🔐 **Cookie-based SSO** across all *.clonex.wtf subdomains
- 🖼️ **NFT Verification** with delegation support (delegate.xyz, warm.xyz)
- 🎨 **Portable UI Components** - Single deployable login button & modal
- 🔑 **OAuth Integration** - Read-only access for third-party apps
- 🎮 **Cross-Platform** - Web, iOS (WebView), UE5 Phoenix Frontend

## Quick Start

### Installation

```bash
npm install @clonex/auth
# or
yarn add @clonex/auth
```

### Basic Usage

```tsx
import { CloneXAuthProvider, UniversalLoginButton, useCloneXAuth } from '@clonex/auth';

function App() {
  return (
    <CloneXAuthProvider
      config={{
        walletConnectProjectId: 'YOUR_WALLETCONNECT_PROJECT_ID'
      }}
      appName="My CloneX App"
    >
      <MyApp />
    </CloneXAuthProvider>
  );
}

function MyApp() {
  const { user, isAuthenticated, authStatus } = useCloneXAuth();

  return (
    <div>
      <nav>
        <UniversalLoginButton
          routes={{
            profile: '/profile',
            collections: '/collections'
          }}
        />
      </nav>

      {isAuthenticated && (
        <p>Welcome, {user?.displayName}!</p>
      )}
    </div>
  );
}
```

## API Reference

### Hooks

#### `useCloneXAuth()`

Main authentication hook.

```tsx
const {
  user,           // CloneXUser | null
  isAuthenticated, // boolean
  authStatus,     // 'booting' | 'idle' | 'wallet_connected' | 'authenticating' | 'loading_nfts' | 'ready' | 'error'
  nftData,        // NFTVerificationData | null
  isLoading,      // boolean
  error,          // string | null
  login,          // () => Promise<void>
  logout,         // () => void
  refreshNFTs,    // () => Promise<void>
  clearError,     // () => void
} = useCloneXAuth();
```

### Components

#### `<CloneXAuthProvider>`

Wraps your app with all necessary providers.

```tsx
<CloneXAuthProvider
  config={{
    walletConnectProjectId: 'YOUR_ID',
    apiBaseUrl: 'https://api.clonex.wtf',
    debug: false
  }}
  appName="My App"
>
  {children}
</CloneXAuthProvider>
```

#### `<UniversalLoginButton>`

Self-contained login/profile button.

```tsx
<UniversalLoginButton
  variant="default"  // 'default' | 'compact' | 'minimal'
  routes={{
    profile: '/profile',
    collections: '/collections'
  }}
  onNavigate={(route) => router.push(route)}
/>
```

### OAuth (Third-Party Apps)

For read-only access to user data:

```typescript
import { CloneXOAuthClient, useCloneXOAuth } from '@clonex/auth';

// Option 1: Full OAuth flow
const client = new CloneXOAuthClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://yourapp.com/callback',
  scopes: ['profile:read', 'nfts:read']
});

// Redirect to auth
window.location.href = client.getAuthorizationUrl();

// After callback, exchange code
const token = await client.exchangeCode(code);
const userInfo = await client.getUserInfo();

// Option 2: React hook
const { isAuthenticated, userInfo, login, logout } = useCloneXOAuth({
  clientId: 'your-id',
  clientSecret: 'your-secret',
  redirectUri: 'https://yourapp.com/callback'
});
```

### Read-Only API Access

For simple API key access:

```typescript
import { CloneXReadOnlyAccess } from '@clonex/auth';

const access = new CloneXReadOnlyAccess('your-api-key');

// Get user info
const user = await access.getUserByWallet('0x...');

// Verify NFT holdings
const nfts = await access.verifyNFTs('0x...');

// Check access level
const level = await access.getAccessLevel('0x...');

// Check tier access
const hasAccess = await access.hasAccessLevel('0x...', 'DNA_DISCIPLE');
```

## Access Levels

| Level | Requirements |
|-------|-------------|
| `COSMIC_CHAMPION` | 25+ CloneX, 10+ Animus |
| `CLONE_VANGUARD` | 15+ CloneX, 5+ Animus |
| `DNA_DISCIPLE` | 5+ CloneX, 1+ Animus |
| `ANIMUS_PRIME` | 5+ Animus |
| `ANIMUS_HATCHLING` | 1+ CloneX OR 1+ Animus |
| `LOST_CODE` | No qualifying NFTs |

## OAuth Scopes

| Scope | Description |
|-------|-------------|
| `profile:read` | Read wallet address and display name |
| `nfts:read` | View NFT holdings |
| `collections:read` | View collection counts |
| `access_level:read` | View access tier |
| `delegation:read` | View delegation info |

## Configuration Options

```typescript
interface CloneXAuthConfig {
  apiBaseUrl?: string;          // Default: 'https://api.clonex.wtf'
  apiTimeout?: number;          // Default: 15000
  walletConnectProjectId?: string;
  enableCoinbaseWallet?: boolean;
  debug?: boolean;
  cookieDomain?: string;        // Default: '.clonex.wtf'
  oauthMode?: boolean;
  oauthScopes?: OAuthScope[];
  oauthCallbackUrl?: string;
}
```

## Event System

Subscribe to auth events for cross-platform communication:

```typescript
import { subscribeToAuthEvents } from '@clonex/auth';

const unsubscribe = subscribeToAuthEvents((event) => {
  switch (event.type) {
    case 'auth:authenticated':
      console.log('User logged in:', event.payload?.user);
      break;
    case 'auth:logout':
      console.log('User logged out');
      break;
    case 'auth:nfts_loaded':
      console.log('NFTs verified:', event.payload?.nftData);
      break;
  }
});

// Cleanup
unsubscribe();
```

## License

MIT
