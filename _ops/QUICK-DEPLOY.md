# 🚀 CloneX GM Login — Quick Deployment Reference

**Last Updated:** November 11, 2025  
**Version:** 3.5.1

---

## 📍 Repository & Directory Map

| Component | GitHub Repo | Local Path | VPS Path |
|-----------|-------------|------------|----------|
| **SDK Package** | `clonexcreators/universal-login-pkg` | `D:\...\CloneX GM Universal Login pkg` | `/home/clonex/gm-login/universal-login-pkg` |
| **Frontend** | `clonexcreators/clonex-login-frontend` | `D:\...\CloneX GM Login Frontend` | `/home/clonex/gm-login/login-frontend` |

---

## ⚡ Quick Deploy (5 Commands)

### Windows (Local Build)
```powershell
cd "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend"
npm run build
# Upload dist/* via FileZilla to /home/clonex/gm-login/login-frontend/dist/
```

### VPS (Post-Upload)
```bash
cd /home/clonex/gm-login/login-frontend
sudo chown -R clonex:clonex dist/
sudo chmod -R 755 dist/
sudo nginx -t && sudo systemctl reload nginx
curl -I https://gm.clonex.wtf  # Verify
```

---

## 🔐 SSH Access

```bash
ssh root@srv890712.hstgr.cloud
# Password: darin1983
```

---

## 📂 Critical Paths

### VPS
```
/home/clonex/gm-login/
├── login-frontend/
│   └── dist/                    ← Deploy here
├── universal-login-pkg/         ← SDK (development only)
└── scripts/
    └── verify-gm-deployment.sh  ← Run after deploy
```

### NGINX
```
/etc/nginx/sites-available/gm.clonex.wtf  ← Config file
/var/log/nginx/gm-login/                  ← Logs
```

---

## 🔄 PM2 Status

**Frontend:** Static files (no PM2)  
**Backend:** PM2 process on port 3001

```bash
pm2 list
# Expected: Only "clonex-api" running
```

---

## ✅ Verification Script

```bash
/home/clonex/scripts/verify-gm-deployment.sh
```

---

## 🆘 Emergency Rollback

```bash
cd /home/clonex/gm-login
mv login-frontend login-frontend-failed
mv login-frontend-backup login-frontend
sudo systemctl reload nginx
```

---

## 📊 Quick Checks

| Check | Command | Expected |
|-------|---------|----------|
| **NGINX syntax** | `sudo nginx -t` | `syntax is ok` |
| **NGINX running** | `sudo systemctl status nginx` | `active (running)` |
| **Backend API** | `pm2 list` | `clonex-api: online` |
| **Frontend loads** | `curl -I https://gm.clonex.wtf` | `200 OK` |
| **API proxy** | `curl -I https://gm.clonex.wtf/api/health` | `200 OK` |

---

## 🔧 Common Fixes

### 502 Bad Gateway
```bash
pm2 restart clonex-api
```

### Assets not loading
```bash
sudo chown -R clonex:clonex /home/clonex/gm-login/login-frontend
sudo chmod -R 755 /home/clonex/gm-login/login-frontend/dist
```

### 404 on routes
Check NGINX has: `try_files $uri $uri/ /index.html;`

---

## 📞 Production URLs

- **Frontend:** https://gm.clonex.wtf
- **Backend API:** https://api.clonex.wtf
- **Health Check:** https://gm.clonex.wtf/health

---

## 📋 Pre-Deploy Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] Backup created on VPS
- [ ] Team notified

## 📋 Post-Deploy Checklist

- [ ] Site loads
- [ ] No console errors
- [ ] Connect wallet works
- [ ] API calls succeed
- [ ] Verification script passes

---

**Full Guide:** [DEPLOYMENT-GUIDE-V3.5.1.md](./DEPLOYMENT-GUIDE-V3.5.1.md)
