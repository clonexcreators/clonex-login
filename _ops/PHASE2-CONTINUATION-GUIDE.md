# 🧬 CloneX Universal Login - Phase 2 Continuation Guide

**Project**: CloneX Universal Login System  
**Repository**: `gm.clonex.wtf` (Next.js Frontend)  
**Current Version**: v3.6.3  
**Last Updated**: November 9, 2025

---

## 📍 Current Status

### ✅ Phase 2.1 - COMPLETE
**DNA Theme System**
- Hook: `useDNAThemes()` ✅
- Component: `DNASelector` ✅
- Component: `DnaBadge` ✅
- SVG Icons: 9 DNA icons in `/public/assets/dna-icons/` ✅
- Theme Engine: Full CSS variable system ✅
- Integration: ProfilePage DNA tab ✅
- Persistence: localStorage ✅
- Murakami Drip: Shimmer overlay system ✅

**Documentation:**
- `PHASE2-1-REPORT.md` - Initial implementation
- `DNA-THEME-REVISION-COMPLETE.md` - Official spec alignment

### ✅ Phase 2.2 - COMPLETE
**Avatar Picker & Uploader**
- Component: `AvatarPicker` ✅
- Component: `AvatarUploader` ✅
- Service: `avatarService.ts` ✅
- NFT avatar selection ✅
- Custom upload (<5MB validation) ✅
- Profile integration ✅
- Live preview ✅

**Documentation:**
- `PHASE2-2-REPORT.md` - Implementation details

### ✅ Phase 2.3 - COMPLETE
**Social OAuth Integration**
- Service: `socialService.ts` ✅
- Component: `SocialConnections` ✅
- Discord OAuth flow ✅
- X/Twitter OAuth flow ✅
- Connect/disconnect functionality ✅
- Verified badges ✅
- ProfilePage integration ✅

**Documentation:**
- `PHASE2-3-REPORT.md` - Implementation details

### 🔄 Phase 2.4 - NEXT UP
**Profile Reset & Public Pages**
- Target Date: November 15, 2025
- Status: Ready to begin

---

## 🎯 Phase 2 Master Plan

### Phase 2.4 - Profile Reset & Public Pages ⏳
**Goal**: Profile management and public visibility

**Tasks:**
1. Create profile reset confirmation modal
2. Implement `DELETE /api/user/profile` endpoint integration
3. Create public profile route `/profile/[walletAddress]`
4. Server-side rendering for public profiles
5. Privacy flag enforcement
6. Public profile sharing functionality

### Phase 2.5 - DNA Badges & UI Polish ⏳
**Goal**: Visual refinement and responsive design

**Tasks:**
1. Enhance `DnaBadge` component with animations
2. Add DNA type indicators throughout UI
3. Responsive design QA (mobile, tablet, desktop)
4. Framer Motion animations
5. Light/dark theme consistency
6. Accessibility audit

### Phase 2.6 - QA & Production Deployment ⏳
**Goal**: Final testing and v3.6.0 release

**Tasks:**
1. Comprehensive testing suite
2. API integration verification
3. Cross-browser testing
4. Performance optimization
5. Security audit
6. Production deployment

---

## 📂 Repository Structure

### Local Development
**Directory**: `D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Nextjs.app`

**Key Directories:**
```
src/
├── hooks/
│   ├── useCloneXAuth.ts       ✅ Authentication
│   ├── useDNAThemes.ts        ✅ DNA theme system
│   └── useUserProfile.ts      🔄 To be created (Phase 2.4)
├── components/
│   ├── profile/
│   │   ├── DNASelector.tsx    ✅ DNA theme picker
│   │   ├── DnaBadge.tsx       ✅ DNA type badge
│   │   ├── AvatarPicker.tsx   ✅ NFT avatar selection
│   │   ├── AvatarUploader.tsx ✅ Custom upload
│   │   ├── SocialConnections.tsx ✅ OAuth integration
│   │   ├── ProfileResetModal.tsx ⏳ Phase 2.4
│   │   └── PublicProfileView.tsx ⏳ Phase 2.4
│   ├── ProfilePage.tsx        ✅ Main profile view (v3.6.3)
│   └── ProfilePublicPage.tsx  ⏳ Phase 2.4
├── theme/
│   ├── dna.ts                 ✅ Theme definitions
│   └── dna.css                ✅ Theme styles
└── services/
    ├── authService.ts         ✅ Authentication
    ├── avatarService.ts       ✅ Avatar management
    ├── socialService.ts       ✅ OAuth integration
    └── profileService.ts      🔄 To be created

public/
└── assets/
    └── dna-icons/             ✅ 9 SVG icons
        ├── human.svg
        ├── robot.svg
        ├── demon.svg
        ├── angel.svg
        ├── reptile.svg
        ├── undead.svg
        ├── alien.svg
        ├── murakami.svg
        └── mkDrip.svg
```

---

## 🔗 Backend API Integration

### Base URL
`https://api.clonex.wtf`

### Key Endpoints

#### Authentication
- `POST /api/auth/wallet/nonce` - Get signing nonce
- `POST /api/auth/wallet/verify` - Verify signature
- `GET /api/auth/status` - Check session

#### Profile Management
- `GET /api/user/profile` - Get user profile ✅
- `PUT /api/user/profile` - Update profile ✅
- `DELETE /api/user/profile` - Reset profile ⏳ Phase 2.4

#### Avatar Management
- `GET /api/user/profile/avatar-options` - Get NFT avatars ✅
- `POST /api/user/profile/avatar-upload` - Upload custom ✅
- `POST /api/user/profile/avatar` - Set active avatar ✅

#### Social OAuth
- `GET /api/user/social/discord/connect` - Start Discord OAuth ✅
- `POST /api/user/social/discord/callback` - Complete Discord OAuth ✅
- `DELETE /api/user/social/discord/disconnect` - Disconnect Discord ✅
- `GET /api/user/social/x/connect` - Start X OAuth ✅
- `POST /api/user/social/x/callback` - Complete X OAuth ✅
- `DELETE /api/user/social/x/disconnect` - Disconnect X ✅

#### Public Profiles (Phase 2.4)
- `GET /api/user/:walletAddress/public` - Public view ⏳

### NFT Verification
- `GET /api/nft/verify-multi/:walletAddress` - Enhanced verification ✅

---

## 🧩 Data Models

### User Profile
```typescript
interface UserProfile {
  walletAddress: string
  displayName: string | null
  bio: string | null
  avatar: {
    url: string | null
    type: 'nft' | 'uploaded' | 'default'
    nftDetails?: {
      contract: string
      tokenId: string
      collection: string
    }
  }
  access: {
    hasAccess: boolean
    eligibleNFTs: number
    accessReason: string
  }
  nfts: {
    collections: Record<string, number>
    totalNFTs: number
    totalDelegatedNFTs: number
  }
  social: {
    discord?: {
      verified: boolean
      username: string | null
      verifiedAt: string | null
    }
    x?: {
      verified: boolean
      username: string | null
      verifiedAt: string | null
    }
  }
  privacy: {
    profilePublic: boolean
    showNfts: boolean
    showWallet: boolean
  }
  createdAt: string
  updatedAt: string
}
```

### DNA Theme
```typescript
export type DNAType = 
  | 'human' 
  | 'robot' 
  | 'demon' 
  | 'angel' 
  | 'reptilian' 
  | 'undead' 
  | 'alien'
  | 'murakami-drip'

export interface DNATheme {
  type: DNAType
  name: string
  icon: string
  accent: string
  accentContrast: string
  background?: string
  shadow?: string
}
```

### Social Connection
```typescript
export interface SocialConnection {
  verified: boolean
  username: string | null
  verifiedAt: string | null
}
```

---

## 🛠️ Development Environment

### System
- **OS**: Windows
- **Shell**: PowerShell
- **Node**: v18+ LTS
- **Package Manager**: npm

### Commands
```powershell
# Navigate to project
cd "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Nextjs.app"

# Install dependencies
npm install

# Development server
npm run dev

# Build (production)
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Important Notes
- Use semicolons (`;`) not `&&` in PowerShell
- Always use absolute paths in quotes
- Vite + React project (NOT Next.js)
- Testing against live API only (no mocks)

---

## 📋 Phase 2.4 Implementation Checklist

### Prerequisites
- [x] Phase 2.1 complete (DNA Theme System)
- [x] Phase 2.2 complete (Avatar System)
- [x] Phase 2.3 complete (Social OAuth)
- [x] Authentication system working
- [x] Profile page functional
- [x] API endpoints available

### Profile Reset Tasks
1. **Create Reset Confirmation Modal** (`src/components/profile/ProfileResetModal.tsx`)
   - [ ] Modal wrapper with backdrop
   - [ ] Warning message
   - [ ] Confirmation input (type "RESET")
   - [ ] Cancel/Confirm buttons
   - [ ] Loading state

2. **Integrate Reset API**
   - [ ] Add `DELETE /api/user/profile` call
   - [ ] Handle success response
   - [ ] Clear local state
   - [ ] Redirect to fresh profile

3. **Profile Page Integration**
   - [ ] Add Reset Profile button
   - [ ] Connect to modal
   - [ ] Handle reset completion
   - [ ] Show success message

### Public Profile Tasks
1. **Create Public Profile Route** (`/profile/[walletAddress]`)
   - [ ] Create route file
   - [ ] Server-side data fetching
   - [ ] Public profile component
   - [ ] Privacy enforcement

2. **Create Public Profile Component** (`src/components/profile/PublicProfileView.tsx`)
   - [ ] Basic profile display
   - [ ] NFT gallery (if showNfts = true)
   - [ ] Social badges
   - [ ] DNA theme integration
   - [ ] Share functionality

3. **Privacy Implementation**
   - [ ] Check profilePublic flag
   - [ ] Conditionally show NFTs
   - [ ] Conditionally show wallet
   - [ ] Handle private profiles

4. **Sharing Features**
   - [ ] Copy profile URL button
   - [ ] Social share buttons
   - [ ] QR code generation (optional)

5. **Testing**
   - [ ] Test public profile access
   - [ ] Test privacy flags
   - [ ] Test profile reset
   - [ ] Test share functionality
   - [ ] Test responsive design

---

## 🎨 Design System

### Colors (from DNA Themes)
- Human: `#5DA3FF` (blue)
- Robot: `#B673FF` (purple)
- Demon: `#FF4D4D` (red)
- Angel: `#F9B8E1` (pink)
- Reptile: `#9ADF4D` (green)
- Undead: `#4A7AAF` (teal)
- Alien: `#00FFA3` (neon green)
- Murakami: `#FF6BDA` (magenta)

### Typography
- Headings: Inter (800 weight)
- Body: Inter (500 weight)
- Monospace: Rajdhani

### Spacing
- Base unit: 8px
- Border radius: 12px
- Pill radius: 24px

### Animations
- Transition: 0.3s ease
- Hover scale: 1.05
- Active scale: 1.15

---

## 📚 Reference Documents

### In Repository
- `PHASE2-1-REPORT.md` - DNA Theme implementation
- `PHASE2-2-REPORT.md` - Avatar system implementation
- `PHASE2-3-REPORT.md` - Social OAuth implementation
- `DNA-THEME-REVISION-COMPLETE.md` - Official spec alignment
- `clonex-backend-bible-v351.md` - Backend API reference

### External
- CloneX Backend API: https://api.clonex.wtf/health
- RainbowKit Docs: https://rainbowkit.com
- Wagmi Docs: https://wagmi.sh

---

## 🚀 Getting Started (New Session)

### Quick Start
1. Navigate to project directory
2. Review Phase 2.3 completion in `PHASE2-3-REPORT.md`
3. Check ProfilePage Social tab implementation
4. Review API endpoints in backend bible
5. Start with Profile Reset Modal creation

### First Tasks
```typescript
// 1. Create src/components/profile/ProfileResetModal.tsx
export const ProfileResetModal: React.FC = () => { }

// 2. Create src/components/profile/PublicProfileView.tsx
export const PublicProfileView: React.FC = () => { }

// 3. Integrate into ProfilePage.tsx Account Actions
```

---

## ✅ Success Criteria

### Phase 2.4 Complete When:
- [ ] Profile reset modal functional
- [ ] Reset confirmation works
- [ ] Profile reset API integration complete
- [ ] Public profile route accessible
- [ ] Privacy flags enforced
- [ ] NFT gallery displays conditionally
- [ ] Share functionality works
- [ ] Responsive on mobile/tablet/desktop

---

## 💡 Tips & Best Practices

1. **Profile Reset**: Require explicit confirmation to prevent accidental resets
2. **Public Profiles**: Always check privacy flags before displaying data
3. **Share URLs**: Use absolute URLs for sharing
4. **NFT Display**: Use cached images from API for performance
5. **Loading States**: Always show feedback during async operations
6. **Error Handling**: Display user-friendly messages
7. **Accessibility**: Ensure keyboard navigation and screen reader support

---

## 🐛 Known Issues

- None currently for completed phases
- Document any Phase 2.4 issues as discovered

---

## 📞 Support & Resources

**Technical Questions:**
- Review backend bible for API specifications
- Check existing components for patterns
- Reference RainbowKit/Wagmi docs for wallet interactions

**Design Questions:**
- Follow existing ProfilePage patterns
- Match DNA theme system styling
- Use CloneX color palette

---

## 🎉 Phase 2 Progress

**Completed**: 3/6 phases (50%)  
**Current**: Phase 2.4 - Profile Reset & Public Pages  
**Next**: Phase 2.5 - DNA Badges & UI Polish  
**Target Completion**: November 25, 2025

---

**Ready to continue Phase 2 implementation!** 🚀

Start with Phase 2.4 (Profile Reset & Public Pages) to complete profile management features.

---

*Last Updated: November 9, 2025*  
*Current Version: v3.6.3*  
*Next Phase: Phase 2.4*
