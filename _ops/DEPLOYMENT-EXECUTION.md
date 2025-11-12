# 🎯 CloneX GM Login — Deployment Execution Guide

**Execute Date:** [Fill in deployment date]  
**Deployed By:** [Fill in deployer name]  
**Version:** 3.5.1  
**Estimated Time:** 15 minutes  
**Downtime:** 0 seconds (NGINX reload)

---

## ⚠️ Pre-Deployment Requirements

**Before starting, verify:**

- [ ] You have SSH access: `ssh root@srv890712.hstgr.cloud`
- [ ] You have FileZilla configured (or can use git)
- [ ] Local build succeeded: `npm run build` (no errors)
- [ ] Team is notified in #deployments channel
- [ ] Backup window scheduled (5 minutes)

---

## 📝 Deployment Steps (Execute in Order)

### STEP 1: Create Backup (VPS) — 2 minutes

```bash
# SSH into VPS
ssh root@srv890712.hstgr.cloud

# Create timestamped backup
cd /home/clonex/gm-login
backup_date=$(date +%Y%m%d_%H%M%S)
cp -r login-frontend /home/clonex/backups/gm-login/login-frontend_$backup_date

# Verify backup
ls -lh /home/clonex/backups/gm-login/
```

**Expected output:**
```
drwxr-xr-x login-frontend_20251111_143022  (or similar)
```

**✅ Checkpoint:** Backup created successfully  
**❌ If failed:** Stop deployment, investigate disk space

---

### STEP 2: Rename Directories (VPS) — 1 minute

```bash
# Still in /home/clonex/gm-login

# Rename nextjs-app to login-frontend (if not already done)
if [ -d "nextjs-app" ]; then
    mv nextjs-app login-frontend
    echo "✅ Renamed nextjs-app → login-frontend"
else
    echo "✅ Directory already named login-frontend"
fi

# Verify structure
ls -la
```

**Expected output:**
```
drwxr-xr-x login-frontend
drwxr-xr-x universal-login-pkg
```

**✅ Checkpoint:** Directories correctly named  
**❌ If failed:** Check permissions, verify directory exists

---

### STEP 3: Stop Old PM2 Process (VPS) — 1 minute

```bash
# Remove frontend PM2 process (no longer needed)
pm2 delete gm-login-frontend 2>/dev/null || echo "No process to delete"

# Verify only backend is running
pm2 list
```

**Expected output:**
```
┌─────┬──────────────┬─────────┬─────────┬──────────┬─────┐
│ id  │ name         │ mode    │ status  │ restart  │ cpu │
├─────┼──────────────┼─────────┼─────────┼──────────┼─────┤
│ 0   │ clonex-api   │ fork    │ online  │ 5        │ 0%  │
└─────┴──────────────┴─────────┴─────────┴──────────┴─────┘
```

**✅ Checkpoint:** Only clonex-api running  
**❌ If failed:** Manually delete: `pm2 delete <id>`

---

### STEP 4: Update NGINX Configuration (VPS) — 3 minutes

```bash
# Edit NGINX config
sudo nano /etc/nginx/sites-available/gm.clonex.wtf
```

**Actions in nano:**

1. Find the `root` directive (around line 80)
2. Change:
```nginx
# OLD:
root /home/clonex/gm-login/nextjs-app/.next/static;

# NEW:
root /home/clonex/gm-login/login-frontend/dist;
index index.html;
```

3. Find location / block (around line 150)
4. Ensure it has SPA fallback:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

5. **OPTIONAL:** Replace entire file with `nginx-gm.clonex.wtf.conf` content

**Save & Exit:** `Ctrl+X`, `Y`, `Enter`

**Test configuration:**
```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**✅ Checkpoint:** NGINX config valid  
**❌ If failed:** Review syntax errors, restore backup config

---

### STEP 5: Deploy Frontend Files — 4 minutes

**Choose ONE method:**

#### Method A: FileZilla (Recommended for Windows)

1. Open FileZilla
2. Connect to:
   - **Host:** srv890712.hstgr.cloud
   - **Protocol:** SFTP
   - **Port:** 22
   - **User:** root
   - **Password:** darin1983

3. Navigate:
   - **Local:** `D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend\dist`
   - **Remote:** `/home/clonex/gm-login/login-frontend/`

4. Upload:
   - Select all files in `dist/` folder
   - Right-click → Upload
   - Overwrite all: Yes

5. Verify upload complete (no errors in transfer queue)

#### Method B: Git Pull + Build (Alternative)

```bash
# On VPS
cd /home/clonex/gm-login/login-frontend

# Pull latest code
git pull origin main

# Install dependencies (if needed)
npm install

# Build
npm run build

# Verify build
ls -lah dist/
```

**✅ Checkpoint:** Files deployed to `/home/clonex/gm-login/login-frontend/dist/`  
**❌ If failed:** Check transfer logs, retry upload

---

### STEP 6: Set Permissions (VPS) — 1 minute

```bash
# Set correct ownership
sudo chown -R clonex:clonex /home/clonex/gm-login/login-frontend

# Set correct permissions
sudo chmod -R 755 /home/clonex/gm-login/login-frontend/dist

# Verify NGINX can read files
sudo -u www-data cat /home/clonex/gm-login/login-frontend/dist/index.html | head -5
```

**Expected output:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
```

**✅ Checkpoint:** Files readable by NGINX  
**❌ If failed:** Re-run chmod/chown commands

---

### STEP 7: Reload NGINX (VPS) — 1 minute

```bash
# Reload NGINX (zero downtime)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

**Expected output:**
```
● nginx.service - A high performance web server
   Active: active (running) since...
```

**✅ Checkpoint:** NGINX reloaded successfully  
**❌ If failed:** Check error logs: `sudo tail -50 /var/log/nginx/error.log`

---

### STEP 8: Verify Deployment (VPS) — 2 minutes

```bash
# Test HTTPS endpoint
curl -I https://gm.clonex.wtf

# Expected: HTTP/2 200
```

**Expected output:**
```
HTTP/2 200
server: nginx
content-type: text/html
```

**Run automated verification:**
```bash
/home/clonex/scripts/verify-gm-deployment.sh
```

**Expected:** All checks pass (green ✓)

**✅ Checkpoint:** Site is live and responding  
**❌ If failed:** Check NGINX error logs, verify file paths

---

### STEP 9: Functional Testing (Browser) — 5 minutes

**Open in browser:** https://gm.clonex.wtf

**Test checklist:**

- [ ] **Page loads** — No white screen, content visible
- [ ] **No console errors** — Check browser DevTools
- [ ] **All images load** — No broken image icons
- [ ] **CSS loaded** — Site has styling, not plain HTML
- [ ] **Connect Wallet button visible** — UI renders correctly
- [ ] **Click Connect Wallet** — Modal opens
- [ ] **Connect MetaMask/WalletConnect** — Wallet connects
- [ ] **NFT verification runs** — Spinner shows, then results
- [ ] **Access status shows** — "Has Access" or "No Access" displays
- [ ] **Profile menu works** — Click profile icon, menu opens
- [ ] **Navigation works** — Click different pages, routes work
- [ ] **Mobile view** — Test on mobile device or DevTools mobile view
- [ ] **Theme toggle** — Dark/Light mode switches work
- [ ] **DNA themes** — Theme selector shows 8 themes

**✅ Checkpoint:** All functionality working  
**❌ If failed:** Review specific error, check browser console

---

### STEP 10: Monitor Logs (VPS) — Ongoing

```bash
# Monitor NGINX access logs
tail -f /var/log/nginx/gm-login/access.log

# In another terminal, monitor error logs
tail -f /var/log/nginx/gm-login/error.log

# Monitor backend API logs
pm2 logs clonex-api
```

**Watch for:**
- ✅ 200 OK responses
- ✅ Normal API calls to /api/*
- ❌ 404 errors (missing files)
- ❌ 502 errors (backend down)
- ❌ JavaScript errors

**✅ Checkpoint:** No errors in logs for 5 minutes  
**❌ If failed:** Investigate specific errors

---

## 🎉 Deployment Complete

### Final Verification Checklist

- [ ] Backup created successfully
- [ ] Directory renamed (nextjs-app → login-frontend)
- [ ] PM2 process removed (frontend)
- [ ] NGINX config updated
- [ ] NGINX syntax valid
- [ ] Files deployed to dist/
- [ ] Permissions set correctly
- [ ] NGINX reloaded
- [ ] Site responding (200 OK)
- [ ] Automated verification passed
- [ ] Functional tests passed
- [ ] No errors in logs
- [ ] Team notified in #deployments

### Post-Deployment Actions

```bash
# Document deployment
echo "Deployment $(date +'%Y-%m-%d %H:%M:%S'): v3.5.1 - Project split successful" >> /home/clonex/deployments.log

# Tag deployment in git (optional)
cd /home/clonex/gm-login/login-frontend
git tag -a v3.5.1-deploy-$(date +%Y%m%d) -m "Production deployment - Project split"
git push origin --tags
```

### Notification Template

```
✅ DEPLOYMENT COMPLETE - CloneX GM Login v3.5.1

Deployed: [Date/Time]
Duration: [X minutes]
Downtime: 0 seconds
Changes: Monorepo → Split architecture (static frontend)

Status:
✅ Frontend: https://gm.clonex.wtf (200 OK)
✅ Backend: https://api.clonex.wtf (online)
✅ All tests passing
✅ Zero errors in logs

Architecture:
✅ Static files via NGINX
✅ Backend API proxy working
✅ PM2 only managing backend
✅ Zero-downtime reload confirmed

Next: Monitor for 30 minutes
```

---

## 🚨 Rollback Procedure (If Needed)

If deployment fails critically:

```bash
# EMERGENCY ROLLBACK - Execute immediately

# 1. Stop monitoring (Ctrl+C)

# 2. Restore backup
cd /home/clonex/gm-login
mv login-frontend login-frontend-failed
cp -r /home/clonex/backups/gm-login/login-frontend_[BACKUP_DATE] login-frontend

# 3. Reload NGINX
sudo systemctl reload nginx

# 4. Verify
curl -I https://gm.clonex.wtf

# 5. Notify team
echo "⚠️ ROLLBACK EXECUTED - Investigating deployment failure"
```

**Time to rollback:** < 2 minutes

---

## 📞 Support Contacts

| Issue | Contact | Response Time |
|-------|---------|---------------|
| **Critical Failure** | DevOps Lead | Immediate |
| **NGINX Issues** | Infrastructure Team | < 15 min |
| **Backend API Issues** | Backend Team | < 30 min |
| **Frontend Bugs** | Frontend Team | < 1 hour |

---

## 📋 Deployment Log

**Deployment Execution Record:**

```
Date: [YYYY-MM-DD]
Time: [HH:MM UTC]
Version: 3.5.1
Deployer: [Name]
Duration: [X minutes]
Rollbacks: [0 or details]

Steps Completed:
[X] Backup created
[X] Directories renamed
[X] PM2 cleaned
[X] NGINX updated
[X] Files deployed
[X] Permissions set
[X] NGINX reloaded
[X] Verification passed
[X] Tests completed
[X] Monitoring started

Issues Encountered:
[None / List any issues]

Resolution:
[N/A / How issues were resolved]

Final Status: ✅ SUCCESS / ❌ FAILED / ⚠️ PARTIAL
```

---

**Document Version:** 3.5.1  
**Last Updated:** November 11, 2025  
**Next Review:** After deployment completion
