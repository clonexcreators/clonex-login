# 🧪 Phase 2.2 - Testing Guide

**Quick Start for Testing Avatar Picker & Uploader**

---

## 🚀 Development Server

### Start the App:
```powershell
cd "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Nextjs.app"
npm run dev
```

---

## 🔍 Testing Workflow

### 1. Authentication:
- Connect wallet via WalletConnect
- Sign authentication message
- Verify you're logged in

### 2. Navigate to Profile:
- Click Profile/Settings button
- Should see ProfilePage with tabs

### 3. Test Avatar Tab:
- Click "Avatar" tab
- Should see current avatar display
- See two buttons:
  - "Choose from your NFTs"
  - "Upload Custom Avatar"

### 4. Test NFT Avatar Picker:

**Happy Path**:
```
1. Click "Choose from your NFTs"
2. Modal opens with loading spinner
3. Grid displays your CloneX/Animus NFTs
4. Click an NFT → Blue ring appears
5. Preview panel shows NFT details at bottom
6. Click "Select Avatar"
7. Avatar updates in profile
8. Success message appears
9. Modal closes
```

**Edge Cases to Test**:
- No NFTs: Should show empty state
- API error: Should show error with retry
- Network failure: Should handle gracefully
- Cancel button: Should close without changes

### 5. Test Custom Avatar Upload:

**Happy Path**:
```
1. Click "Upload Custom Avatar"
2. Modal opens with drag & drop zone
3. Drop an image OR click "Browse Files"
4. Preview appears with image
5. File details shown (name, size, type)
6. Click "Upload Avatar"
7. Spinner shows during upload
8. Avatar updates in profile
9. Success message appears
10. Modal closes
```

**Validation Tests**:
- Upload >5MB file → Should reject with error
- Upload PDF/ZIP → Should reject with error
- Upload PNG/JPEG/WebP ≤5MB → Should accept
- Drag & drop → Should work same as browse
- Remove file button → Should clear preview

---

## 🎯 What to Look For

### Visual Checks:
- [ ] Modals centered on screen
- [ ] Backdrop blurs background
- [ ] Grid responsive (resize window)
- [ ] Images load smoothly
- [ ] Selection ring visible (blue)
- [ ] Badges visible (Current=green, Delegated=purple)
- [ ] Hover effects work
- [ ] Loading spinners show appropriately
- [ ] Success/error messages appear
- [ ] Modal close buttons work

### Functional Checks:
- [ ] Only CloneX + Animus NFTs shown
- [ ] Delegated NFTs marked correctly
- [ ] Current avatar highlighted
- [ ] Selection updates preview
- [ ] Avatar updates persist after refresh
- [ ] File validation catches bad files
- [ ] Upload progress visible
- [ ] Errors display user-friendly messages
- [ ] Profile refreshes after changes

---

## 🐛 Known Limitations

1. **Backend API Endpoints**:
   - `/api/user/profile/avatar-upload` must exist
   - `/api/user/profile/avatar` must exist
   - If endpoints return 404, components will show errors

2. **NFT Data**:
   - Requires active authentication
   - Requires NFT metadata enrichment (v3.5.1+)
   - Empty if user has no CloneX/Animus NFTs

3. **File Upload**:
   - Server-side validation may differ from client
   - Upload speed depends on network
   - Large files may take time

---

## 🔧 Troubleshooting

### Modal Won't Open:
- Check browser console for errors
- Verify state management working
- Check button onClick handlers

### NFTs Not Loading:
- Verify `/api/nft/verify-multi/:wallet` returns data
- Check auth token in localStorage
- Verify network connectivity
- Check browser console for API errors

### Upload Fails:
- Check file size (must be ≤5MB)
- Check file type (PNG/JPEG/WebP only)
- Verify endpoint exists
- Check auth token valid
- Look for CORS errors

### Preview Not Showing:
- Check FileReader API support
- Verify file is valid image
- Check browser console for errors

---

## 📝 Manual Test Scenarios

### Scenario 1: First Time Avatar Selection
```
Given: User has never set an avatar
When: User opens avatar picker
Then: Should see all their NFTs
And: No "Current" badge should appear
When: User selects an NFT and confirms
Then: Avatar should update
And: On reopen, that NFT should show "Current" badge
```

### Scenario 2: Change From NFT to Custom
```
Given: User has an NFT avatar set
When: User uploads custom avatar
Then: Avatar type should change from 'nft' to 'uploaded'
And: New avatar URL should display
And: Original NFT should no longer show "Current" badge
```

### Scenario 3: Error Recovery
```
Given: User attempts invalid upload
When: Upload fails with validation error
Then: Error message should display
And: User should be able to select different file
And: Modal should remain open
```

### Scenario 4: Responsive Design
```
Given: User opens modals on different screen sizes
When: Window width is mobile (< 640px)
Then: Grid should show 2 columns
When: Window width is tablet (640-1024px)
Then: Grid should show 3 columns
When: Window width is desktop (> 1024px)
Then: Grid should show 4 columns
```

---

## ✅ Success Checklist

After testing, verify:

- [ ] Can open both modals
- [ ] Can close modals (X button + backdrop)
- [ ] NFTs load and display correctly
- [ ] Can select and set NFT avatar
- [ ] Can upload custom avatar
- [ ] File validation works
- [ ] Preview displays correctly
- [ ] Upload progress shows
- [ ] Success messages appear
- [ ] Error handling works
- [ ] Profile updates persist
- [ ] Responsive on all screen sizes
- [ ] No console errors
- [ ] No memory leaks (check dev tools)

---

## 🔥 Quick Debug Commands

### Check Auth Status:
```javascript
// In browser console:
localStorage.getItem('clonex_auth_token')
```

### Check Profile State:
```javascript
// In React DevTools:
// Find ProfilePage component
// Check state: profile, showAvatarPicker, showAvatarUploader
```

### Manually Test Avatar Service:
```javascript
// In browser console:
import { avatarService } from './src/services/avatarService'
await avatarService.getAvatarOptions('0x...')
```

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Verify API endpoints are responding
3. Check network tab in DevTools
4. Review PHASE2-2-REPORT.md for details
5. Check backend bible (clonex-backend-bible-v351.md)

---

**Happy Testing!** 🎉

Report any bugs or issues for Phase 2.3 planning.
