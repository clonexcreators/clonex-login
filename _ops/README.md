# 🧬 CloneX Universal Login — Frontend Application

**Version:** 3.5.1  
**Architecture:** Vite + React Static Site  
**Backend API:** https://api.clonex.wtf (v3.5.1)  
**Production:** https://gm.clonex.wtf  
**Status:** ✅ LIVE IN PRODUCTION

---

## 📋 Overview

CloneX Universal Login is the **primary authentication gateway** for the CloneX.wtf ecosystem. This repository contains the **frontend static application** built with Vite and React, consuming the `@clonex/universal-login` SDK package.

### What This Repository Contains

- ✅ **Static frontend application** served via NGINX
- ✅ **Consumer of SDK** (imports from `@clonex/universal-login`)
- ✅ **Production deployment** at gm.clonex.wtf
- ✅ **Vite + React** build system with optimized output
- ✅ **Web3 wallet integration** via RainbowKit + Wagmi
- ✅ **DNA-based theming** (8 CloneX DNA themes)
- ✅ **Profile management** with avatar upload & social connections
- ✅ **GM Points** daily claim system
- ✅ **NFT galleries** with metadata display

### What This Repository Does NOT Contain

- ❌ Authentication logic (in SDK package)
- ❌ Web3 hooks (in SDK package)
- ❌ Reusable components (in SDK package)
- ❌ Backend API code (separate clonex-api repository)

---

## 🏗️ Architecture

### Repository Split (October 2025)

This project was **split from a monorepo** into two independent repositories:

1. **SDK Package** ([universal-login-pkg](https://github.com/clonexcreators/universal-login-pkg))
   - Auth logic, hooks, UI components
   - Theme system (8 DNA themes)
   - Reusable across multiple consumers
   - Published as NPM package (private)

2. **Frontend App** (This Repository)
   - Static site built with Vite
   - Imports SDK as dependency (future)
   - Deployed as static files via NGINX
   - No Node.js server process required

### Data Flow

```
User Browser
    ↓
NGINX (static files from /dist)
    ↓
React App (client-side)
    ↓
SDK Logic (@clonex/universal-login)
    ↓
Backend API (https://api.clonex.wtf)
    ↓
Database + Blockchain (NFT verification)
```

---

## 🔐 Access Control System

### Simplified Binary Access (v3.5.1)

The system uses **simplified access control** implemented in September 2025:

| User Status | Requirements | Access Level | API Response |
|-------------|-------------|--------------|--------------|
| ✅ **HAS ACCESS** | 1+ CloneX OR Animus NFT | Full Premium Features | `hasAccess: true` |
| ❌ **NO ACCESS** | No qualifying NFTs | Public Features Only | `hasAccess: false` |

**Eligible Collections:**
- CloneX NFTs (contract: `0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b`)
- Animus NFTs (contract: `0x6e5a65b5f9dd7b1e8cae3a8b9f5c6d7e8f9a0b1c`)

**Multi-Delegation Support:**
- ✅ Direct ownership (Alchemy)
- ✅ Delegate.xyz delegation
- ✅ Warm.xyz hot wallet

### Legacy Badge System (Deprecated)

The previous complex badge/tier system was **removed in September 2025**:

❌ ~~COSMIC_CHAMPION~~ (15+ CloneX, 10+ Animus)  
❌ ~~CLONE_VANGUARD~~ (5+ CloneX, 5+ Animus)  
❌ ~~CLONE_DISCIPLE~~ (1+ CloneX)  
❌ ~~ANIMUS_PRIME~~ (5+ Animus)  
❌ ~~ANIMUS_HATCHLING~~ (1+ Animus or CloneX)  
❌ ~~LOST_CODE~~ (No NFTs)

**Why simplified?**
- 50% faster API responses
- Clearer UX (boolean access)
- Easier integration for developers
- More inclusive for NFT holders

---

## ⚙️ Tech Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Vite | 5.4.21 | Build tool & dev server |
| **UI Library** | React | 18.3.1 | Component framework |
| **Language** | TypeScript | 5.5.3 | Type safety |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS |
| **Web3** | RainbowKit | 2.0+ | Wallet connection UI |
| **Web3** | Wagmi | 2.0+ | React hooks for Ethereum |
| **Web3** | Viem | 2.0+ | TypeScript Ethereum library |
| **State** | Zustand | 4.4.0 | Global state management |
| **Router** | React Router | 6.20.0 | Client-side routing |
| **HTTP** | Axios | 1.6.0 | API requests |
| **Animation** | Framer Motion | 12.23.24 | UI animations |

### Development Tools

- **Testing:** Vitest + Testing Library
- **Linting:** ESLint 9.9+
- **Type Checking:** TypeScript strict mode
- **Build Optimization:** Terser, code splitting
- **Package Manager:** NPM 9+

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **NPM** 9.0.0 or higher
- **Git** for version control

### Installation

```bash
# Clone repository
git clone git@github.com:clonexcreators/clonex-login.git
cd clonex-login

# Install dependencies
npm install

# Validate shims (prebuild step)
npm run shims:validate
```

### Environment Configuration

Create `.env.development` for local development:

```env
# API Configuration
VITE_API_BASE_URL=https://api.clonex.wtf
VITE_API_VERSION=3.5.1

# Wallet Configuration
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
VITE_APP_NAME=CloneX Universal Login
VITE_APP_DESCRIPTION=Access the CloneX.wtf ecosystem

# Feature Flags
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_GM_POINTS=true
VITE_ENABLE_PROFILE_PAGES=true

# Development
VITE_BUILD_MODE=development
VITE_SOURCE_MAP=true
```

Create `.env.production` for production builds:

```env
# API Configuration (Production)
VITE_API_BASE_URL=https://api.clonex.wtf
VITE_API_VERSION=3.5.1

# Wallet Configuration
VITE_WALLET_CONNECT_PROJECT_ID=your_production_project_id
VITE_APP_NAME=CloneX Universal Login
VITE_APP_DESCRIPTION=Access the CloneX.wtf ecosystem

# Feature Flags (Production)
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_GM_POINTS=true
VITE_ENABLE_PROFILE_PAGES=true

# Build Configuration
VITE_BUILD_MODE=production
VITE_SOURCE_MAP=false
```

### Development Server

```bash
# Start development server (http://localhost:3000)
npm run dev

# Server will start with:
# - Hot Module Replacement (HMR)
# - API proxy to https://api.clonex.wtf
# - Source maps enabled
```

### Build for Production

```bash
# Type check
npm run type-check

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

**Build Output:**
```
dist/
├── index.html                    # Entry point
├── assets/
│   ├── css/
│   │   └── style-[hash].css     # Compiled CSS
│   ├── vendor/
│   │   ├── vendor-react-[hash].js
│   │   ├── vendor-web3-[hash].js
│   │   └── vendor-ui-[hash].js
│   ├── app/
│   │   └── app-auth-[hash].js
│   └── images/
│       └── [optimized images]
├── favicon.ico
└── robots.txt
```

---

## 📁 Project Structure

```
clonex-login/
├── public/                      # Static assets
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/              # React components
│   │   ├── auth/               # Authentication UI
│   │   ├── profile/            # Profile management
│   │   ├── nft/                # NFT galleries
│   │   └── ui/                 # Shared UI components
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useCloneXAuth.ts    # Authentication
│   │   ├── useWalletConnection.ts
│   │   ├── useAccessGating.ts
│   │   └── useTheme.ts
│   │
│   ├── stores/                  # Zustand state stores
│   │   ├── authStore.ts        # Auth state
│   │   ├── themeStore.ts       # Theme state
│   │   └── nftStore.ts         # NFT data
│   │
│   ├── services/                # API services
│   │   ├── authService.ts      # Auth API calls
│   │   ├── nftService.ts       # NFT verification
│   │   └── profileService.ts   # Profile management
│   │
│   ├── pages/                   # Route pages
│   │   ├── Home.tsx
│   │   ├── Profile.tsx
│   │   ├── NFTGallery.tsx
│   │   └── Settings.tsx
│   │
│   ├── styles/                  # Global styles
│   │   ├── globals.css
│   │   └── themes/             # DNA theme CSS
│   │
│   ├── utils/                   # Utilities
│   │   ├── constants.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   │
│   ├── shims/                   # ESM compatibility
│   │   └── [auto-generated]
│   │
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
│
├── scripts/                     # Build scripts
│   └── prebuild-shim-validator.js
│
├── index.html                   # HTML template
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🎨 Features

### Authentication & Access Control

- ✅ **Wallet Connection** — MetaMask, WalletConnect, Coinbase Wallet
- ✅ **NFT Verification** — Multi-source (Direct + Delegate.xyz + Warm.xyz)
- ✅ **Simplified Access** — Binary hasAccess check (1+ NFT = full access)
- ✅ **JWT Sessions** — 24-hour secure sessions
- ✅ **Session Persistence** — Automatic session refresh

### Profile Management

- ✅ **Display Name** — Custom username
- ✅ **Bio** — Personal description
- ✅ **Avatar Upload** — Custom profile pictures with crop/resize
- ✅ **Social Connections** — Discord & X/Twitter OAuth
- ✅ **Public Profiles** — Shareable profile pages
- ✅ **Privacy Settings** — Control profile visibility

### NFT Features

- ✅ **NFT Gallery** — Display owned CloneX & Animus NFTs
- ✅ **Metadata Enrichment** — Full NFT data (name, traits, images)
- ✅ **Ownership Indicators** — Direct vs delegated NFTs
- ✅ **Progressive Image Loading** — Thumbnails → full resolution
- ✅ **Trait Display** — Show all NFT attributes

### GM Points System

- ✅ **Daily Claims** — Earn points every 24 hours
- ✅ **NFT Multipliers** — Bonus points based on NFT holdings
- ✅ **Points Tracking** — Total points & claim history
- ✅ **Leaderboard** — Compare with other users (future)

### DNA Theme System

- ✅ **8 Unique Themes** — Based on CloneX DNA types
  - Human
  - Robot
  - Demon
  - Angel
  - Reptilian
  - Undead
  - Alien
  - Murakami Drip
- ✅ **Dark/Light Modes** — Each theme supports both modes
- ✅ **Theme Persistence** — Saved to user preferences
- ✅ **Smooth Transitions** — Animated theme changes

### UI/UX

- ✅ **Responsive Design** — Mobile, tablet, desktop
- ✅ **Accessibility** — WCAG 2.1 AA compliant
- ✅ **Loading States** — Skeleton screens & spinners
- ✅ **Error Handling** — User-friendly error messages
- ✅ **Animations** — Smooth Framer Motion transitions
- ✅ **Toast Notifications** — Real-time user feedback

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (interactive)
npm run test:ui
```

### Test Structure

```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
```

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConnectButton from '@/components/auth/ConnectButton';

describe('ConnectButton', () => {
  it('renders connect button', () => {
    render(<ConnectButton />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
});
```

---

## 🚢 Deployment

### Production Build

```bash
# 1. Clean previous builds
npm run clean

# 2. Run type checking
npm run type-check

# 3. Build for production
npm run build

# 4. Verify build output
ls -lah dist/
```

### Deployment to VPS

**Via FileZilla (Recommended):**

1. Connect to VPS via SFTP
2. Navigate to `/home/clonex/gm-login/login-frontend/`
3. Upload `dist/*` contents
4. Set permissions: `chmod -R 755 dist/`

**Via SSH + Git:**

```bash
# SSH into VPS
ssh root@srv890712.hstgr.cloud

# Navigate to project
cd /home/clonex/gm-login/login-frontend

# Pull latest code
git pull origin main

# Install dependencies (if needed)
npm install

# Build
npm run build

# Reload NGINX
sudo systemctl reload nginx
```

### NGINX Configuration

The frontend is served as **static files via NGINX** (no Node.js process):

```nginx
server {
    listen 443 ssl http2;
    server_name gm.clonex.wtf;
    
    root /home/clonex/gm-login/login-frontend/dist;
    index index.html;
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
    }
}
```

**See:** [DEPLOYMENT-GUIDE-V3.5.1.md](./DEPLOYMENT-GUIDE-V3.5.1.md) for complete configuration

---

## 🔧 Configuration

### Vite Configuration

Key settings in `vite.config.ts`:

- **Dev Server:** Port 3000 with API proxy
- **Build:** Terser minification, code splitting
- **Chunks:** Vendor chunks for React, Web3, UI libs
- **Shims:** ESM compatibility patches
- **CSP:** Content Security Policy headers for Web3

### TypeScript Configuration

- **Strict Mode:** Enabled
- **Path Aliases:** `@/*` → `src/*`
- **Target:** ES2020
- **Lib:** DOM, ES2020

### Tailwind Configuration

- **Purge:** All `src/**/*.{ts,tsx}` files
- **Theme:** Custom CloneX DNA themes
- **Plugins:** Typography, forms
- **Dark Mode:** Class-based

---

## 🐛 Troubleshooting

### Common Issues

#### Build Fails with ESM Errors

**Solution:**
```bash
npm run shims:validate
npm run clean
npm install
npm run build
```

#### WalletConnect Not Opening

**Solution:**
Check CSP headers in `vite.config.ts` include WalletConnect domains

#### API Calls Failing (CORS)

**Solution:**
Verify API proxy in `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'https://api.clonex.wtf',
    changeOrigin: true
  }
}
```

#### CSS Not Loading

**Solution:**
```bash
# Regenerate CSS
npm run clean
npm run build
```

### Debug Mode

```bash
# Enable verbose logging
VITE_DEBUG=true npm run dev
```

---

## 📚 API Integration

### Backend API (v3.5.1)

**Base URL:** https://api.clonex.wtf

**Key Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/wallet/nonce` | POST | Get signing nonce |
| `/api/auth/wallet/verify` | POST | Verify wallet signature |
| `/api/auth/status` | GET | Check session status |
| `/api/nft/verify-multi/:wallet` | GET | NFT verification with metadata |
| `/api/user/profile` | GET | Get user profile |
| `/api/user/gm-clone` | POST | Claim GM Points |

**See:** [clonex-backend-bible-v351.md](./clonex-backend-bible-v351.md) for complete API docs

---

## 🤝 Contributing

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Follow TypeScript strict mode
   - Write tests for new features
   - Update documentation

3. **Test Locally**
   ```bash
   npm run type-check
   npm test
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push & Create PR**
   ```bash
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

### Code Style

- **TypeScript:** Strict mode, explicit types
- **React:** Functional components, hooks
- **Formatting:** ESLint + Prettier
- **Naming:** PascalCase for components, camelCase for functions
- **Comments:** JSDoc for public APIs

---

## 🔗 Related Repositories

| Repository | Purpose | Link |
|------------|---------|------|
| **universal-login-pkg** | SDK package (auth logic, hooks, components) | [GitHub](https://github.com/clonexcreators/universal-login-pkg) |
| **clonex-api** | Backend API (Node.js + Express) | Private |
| **clonex-login** | Frontend app (this repo) | [GitHub](https://github.com/clonexcreators/clonex-login) |

---

## 📄 License

MIT © CloneX Creators

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/clonexcreators/clonex-login/issues)
- **Documentation:** [DEPLOYMENT-GUIDE-V3.5.1.md](./DEPLOYMENT-GUIDE-V3.5.1.md)
- **API Docs:** [clonex-backend-bible-v351.md](./clonex-backend-bible-v351.md)

---

**Built with ❤️ for the CloneX ecosystem**

**Version:** 3.5.1  
**Last Updated:** November 11, 2025  
**Status:** ✅ Production Ready
