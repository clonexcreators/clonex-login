# 🚀 QUICK DEPLOYMENT REFERENCE

## ⚡ TL;DR
**Problem**: Missing WalletConnect Project ID → App crashes → Only gradient shell displays  
**Solution**: Added `.env.production` → Rebuilt → Ready to deploy  
**Status**: ✅ FIXED LOCALLY - Just need to upload `dist` folder

---

## 📦 UPLOAD THESE FILES

**Source**: `D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend\dist`  
**Destination**: `srv890712.hstgr.cloud:/home/clonex/gm-login/login-frontend/dist`

---

## 🔌 FileZilla Connection

```
Host: srv890712.hstgr.cloud
Protocol: SFTP
Username: clonex
Port: 22
```

---

## ✅ After Upload, Verify

1. Open: https://gm.clonex.wtf
2. Hard refresh: `Ctrl + Shift + R`
3. Should see:
   - ✅ Full CloneX UI (not just gradient)
   - ✅ "Connect Wallet" button
   - ✅ Navigation bar
   - ✅ No console errors

---

## 🎯 Environment Variables Fixed

```env
VITE_WALLETCONNECT_PROJECT_ID=743b5c9a705ea2255557991fb96d9c7e ✅
VITE_API_BASE_URL=https://api.clonex.wtf ✅
```

---

## 📊 Build Stats

- **Size**: 1.4 MB (minified)
- **Files**: 187
- **Build Time**: 9.17s
- **Status**: ✅ SUCCESS

---

## 🔧 If Still Broken After Upload

1. Clear browser cache completely
2. Try incognito/private window
3. Check browser console (F12) for errors
4. Verify files uploaded:
   ```bash
   ssh clonex@srv890712.hstgr.cloud
   ls -lh /home/clonex/gm-login/login-frontend/dist/
   ```

---

**Read full details in**: `DEPLOYMENT-GUIDE-WITH-ENV.md`
