# 🚀 CloneX Universal Login — Complete Deployment Guide v3.5.1

**Last Updated:** November 11, 2025  
**Architecture:** Monorepo Split → SDK Package + Static Frontend  
**Production API:** https://api.clonex.wtf (v3.5.1 LIVE)  
**Frontend Domain:** https://gm.clonex.wtf  

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Environment Setup](#local-environment-setup)
3. [VPS Preparation](#vps-preparation)
4. [NGINX Configuration](#nginx-configuration)
5. [PM2 Configuration (Backend Only)](#pm2-configuration)
6. [Build & Deployment Process](#build-deployment-process)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview {#architecture-overview}

### Repository Structure

```
📦 CloneX Login Ecosystem
├── 📦 universal-login-pkg (SDK Layer)
│   ├── GitHub: clonexcreators/universal-login-pkg
│   ├── Local: D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Universal Login pkg
│   ├── VPS: /home/clonex/gm-login/universal-login-pkg
│   ├── Package: @clonex/universal-login
│   ├── Purpose: Auth logic, hooks, UI components, theme system
│   └── Output: NPM package (private)
│
└── 🌐 clonex-login-frontend (Static Site)
    ├── GitHub: clonexcreators/clonex-login-frontend (formerly clonex-login)
    ├── Local: D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend
    ├── VPS: /home/clonex/gm-login/login-frontend
    ├── Domain: gm.clonex.wtf
    ├── Purpose: Vite + React static consumer app
    └── Output: Static HTML/CSS/JS served via NGINX
```

### Data Flow

```
User Browser
    ↓
NGINX (443) → Static Files (/home/clonex/gm-login/login-frontend/dist)
    ↓
Frontend App (React + Vite)
    ↓
API Calls → https://api.clonex.wtf (PM2 managed, port 3001)
    ↓
Backend Services (Node.js + Express)
    ↓
Database (MySQL) + Cache (Redis)
```

### Key Changes from Previous Architecture

| Aspect | OLD (Monorepo) | NEW (Split Repos) |
|--------|----------------|-------------------|
| **Repository** | Single Next.js app | Two separate repos |
| **Frontend Deployment** | Node.js on port 3000 | Static files via NGINX |
| **PM2 Management** | Frontend + Backend | Backend only |
| **Build Output** | `.next/` directory | `dist/` directory |
| **Deployment Complexity** | High (coordinated) | Low (independent) |
| **Version Control** | Coupled versions | Independent versioning |

---

## 💻 Local Environment Setup {#local-environment-setup}

### Prerequisites

- **Node.js**: >= 18.0.0
- **NPM**: >= 9.0.0
- **Git**: Latest version
- **PowerShell**: For Windows builds
- **SSH Access**: To srv890712.hstgr.cloud

### Step 1: Verify Local Repository Names

```powershell
# Navigate to GitHub directory
cd "D:\Users\DCM\OneDrive\Documents\GitHub"

# Expected structure:
# ✅ CloneX GM Universal Login pkg
# ✅ CloneX GM Login Frontend (needs rename if still "CloneX GM Nextjs.app")
```

**ACTION REQUIRED:** If frontend is still named "CloneX GM Nextjs.app":

```powershell
# Rename directory
Rename-Item -Path "CloneX GM Nextjs.app" -NewName "CloneX GM Login Frontend"
```

### Step 2: Verify Git Remotes

```powershell
# Check SDK package remote
cd "CloneX GM Universal Login pkg"
git remote -v
# Expected: git@github.com:clonexcreators/universal-login-pkg.git

# Check frontend remote
cd "..\CloneX GM Login Frontend"
git remote -v
# Expected: git@github.com:clonexcreators/clonex-login-frontend.git
```

**ACTION REQUIRED:** If frontend remote is still `clonex-login`:

```powershell
git remote set-url origin git@github.com:clonexcreators/clonex-login-frontend.git
```

### Step 3: Install Dependencies

```powershell
# SDK Package
cd "CloneX GM Universal Login pkg"
npm install

# Frontend
cd "..\CloneX GM Login Frontend"
npm install
```

### Step 4: Environment Configuration

**Frontend `.env.production`:**

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

# Build Configuration
VITE_BUILD_MODE=production
VITE_SOURCE_MAP=false
```

---

## 🖥️ VPS Preparation {#vps-preparation}

### SSH Connection

```bash
ssh root@srv890712.hstgr.cloud
# Password: darin1983
```

### Step 1: Directory Restructuring

```bash
# Navigate to gm-login directory
cd /home/clonex/gm-login

# Current structure check
ls -la
# Expected:
# - universal-login-pkg/ (SDK)
# - nextjs-app/ or login-frontend/ (Frontend)

# If directory is still named nextjs-app, rename it
if [ -d "nextjs-app" ]; then
    mv nextjs-app login-frontend
    echo "✅ Renamed nextjs-app → login-frontend"
fi

# Verify new structure
ls -la
# Expected output:
# drwxr-xr-x login-frontend
# drwxr-xr-x universal-login-pkg
```

### Step 2: Clean Previous Node.js Process

```bash
# Stop any running PM2 process for frontend (no longer needed)
pm2 list
pm2 delete gm-login-frontend 2>/dev/null || echo "No frontend process to delete"

# Verify only backend is running
pm2 list
# Expected: Only clonex-api should be listed
```

### Step 3: Create Required Directories

```bash
# Ensure proper directory structure
mkdir -p /home/clonex/gm-login/login-frontend/dist
mkdir -p /home/clonex/backups/gm-login
mkdir -p /var/log/nginx/gm-login

# Set ownership
chown -R clonex:clonex /home/clonex/gm-login
chown -R www-data:www-data /var/log/nginx/gm-login
```

---

## 🔧 NGINX Configuration {#nginx-configuration}

### Configuration File Location

```bash
/etc/nginx/sites-available/gm.clonex.wtf
/etc/nginx/sites-enabled/gm.clonex.wtf → symlink
```

### Complete NGINX Configuration

```nginx
# ============================================================================
# CloneX Universal Login - gm.clonex.wtf
# Static Frontend with API Proxy
# Last Updated: November 11, 2025
# Version: 3.5.1
# ============================================================================

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=gm_general:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=gm_api:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=gm_auth:10m rate=10r/m;

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name gm.clonex.wtf;
    
    # Security headers even on redirect
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server - Static Frontend
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name gm.clonex.wtf;
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/gm.clonex.wtf/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gm.clonex.wtf/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/gm.clonex.wtf/chain.pem;
    
    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "0" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Content Security Policy for Web3
    add_header Content-Security-Policy "default-src 'self'; \
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://vercel.live; \
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; \
        font-src 'self' https://fonts.gstatic.com data:; \
        img-src 'self' data: https: blob:; \
        connect-src 'self' https://api.clonex.wtf https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org https://*.infura.io https://*.alchemy.com https://*.etherscan.io https://eth-mainnet.g.alchemy.com wss://eth-mainnet.g.alchemy.com https://cloudflare-eth.com; \
        frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org; \
        worker-src 'self' blob:; \
        child-src 'self' blob:; \
        object-src 'none'; \
        base-uri 'self'; \
        form-action 'self'; \
        frame-ancestors 'self'; \
        upgrade-insecure-requests;" always;
    
    # CORS Headers (handled by API, but set for assets)
    add_header Access-Control-Allow-Origin "https://gm.clonex.wtf" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
    add_header Access-Control-Allow-Credentials "true" always;
    
    # Static file root
    root /home/clonex/gm-login/login-frontend/dist;
    index index.html;
    
    # Logging
    access_log /var/log/nginx/gm-login/access.log combined;
    error_log /var/log/nginx/gm-login/error.log warn;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;
    
    # API Proxy (Backend running on port 3001)
    location /api/ {
        # Rate limiting
        limit_req zone=gm_api burst=20 nodelay;
        limit_req_status 429;
        
        # Proxy settings
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # Static assets with aggressive caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # Security headers for assets
        add_header X-Content-Type-Options "nosniff" always;
        add_header Cross-Origin-Resource-Policy "cross-origin" always;
    }
    
    # Fonts specific caching
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
    }
    
    # JSON files (no caching for manifest)
    location ~* \.json$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # HTML files (no caching)
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }
    
    # Favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Robots.txt
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
    
    # Health check endpoint (for monitoring)
    location = /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
    
    # SPA fallback - ALL routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
        
        # Rate limiting for general access
        limit_req zone=gm_general burst=50 nodelay;
        
        # Security headers for SPA
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Deny access to sensitive files
    location ~* (\.env|\.git|\.gitignore|package\.json|package-lock\.json)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### NGINX Setup Commands

```bash
# 1. Create/Update configuration
sudo nano /etc/nginx/sites-available/gm.clonex.wtf
# Paste the configuration above

# 2. Test configuration
sudo nginx -t

# 3. Create symlink if not exists
sudo ln -sf /etc/nginx/sites-available/gm.clonex.wtf /etc/nginx/sites-enabled/

# 4. Reload NGINX
sudo systemctl reload nginx

# 5. Verify status
sudo systemctl status nginx
```

---

## 🔄 PM2 Configuration {#pm2-configuration}

### Important Note

**Frontend no longer uses PM2** — it's served as static files via NGINX.  
**Only the backend API** uses PM2 (already configured on port 3001).

### Verify Backend PM2 Status

```bash
# Check running processes
pm2 list

# Expected output (backend only):
┌─────┬──────────────┬─────────┬─────────┬──────────┬─────┐
│ id  │ name         │ mode    │ status  │ restart  │ cpu │
├─────┼──────────────┼─────────┼─────────┼──────────┼─────┤
│ 0   │ clonex-api   │ fork    │ online  │ 5        │ 0%  │
└─────┴──────────────┴─────────┴─────────┴──────────┴─────┘

# No gm-login-frontend process should be listed!
```

### Backend PM2 Configuration (Reference)

Located at: `/home/clonex/clonex-api/ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'clonex-api',
    script: './server.js',
    cwd: '/home/clonex/clonex-api',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      API_VERSION: '3.5.1'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M'
  }]
};
```

---

## 🚢 Build & Deployment Process {#build-deployment-process}

### Local Build (Windows)

```powershell
# Navigate to frontend directory
cd "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend"

# Ensure dependencies are installed
npm install

# Run validation
npm run shims:validate

# Type check
npm run type-check
# Expected: No TypeScript errors

# Production build
npm run build
# Expected: Build completes successfully, creates /dist directory

# Verify build output
Get-ChildItem .\dist -Recurse | Measure-Object -Property Length -Sum
# Expected: ~2-5MB total size
```

### Build Output Verification

```powershell
# Check dist structure
tree /F .\dist

# Expected structure:
# dist/
# ├── index.html (entry point)
# ├── assets/
# │   ├── css/
# │   │   └── style-[hash].css
# │   ├── vendor/
# │   │   ├── vendor-react-[hash].js
# │   │   ├── vendor-web3-[hash].js
# │   │   └── vendor-ui-[hash].js
# │   ├── app/
# │   │   └── app-auth-[hash].js
# │   └── images/
# │       └── [image files]
# ├── favicon.ico
# └── robots.txt
```

### Deploy to VPS

**Option 1: FileZilla (Recommended for Windows)**

```
Host: srv890712.hstgr.cloud
Protocol: SFTP
Port: 22
User: root
Password: darin1983

Local Path:
D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend\dist\*

Remote Path:
/home/clonex/gm-login/login-frontend/dist/

Action: Upload (overwrite all files)
```

**Option 2: SSH + Git (Alternative)**

```bash
# On VPS
cd /home/clonex/gm-login/login-frontend

# Pull latest code
git pull origin main

# Install dependencies (if package.json changed)
npm install

# Build on server
npm run build

# Verify build
ls -lah dist/
```

### Post-Deployment Steps

```bash
# 1. Set correct ownership
sudo chown -R clonex:clonex /home/clonex/gm-login/login-frontend

# 2. Set correct permissions
sudo chmod -R 755 /home/clonex/gm-login/login-frontend/dist

# 3. Verify NGINX can read files
sudo -u www-data cat /home/clonex/gm-login/login-frontend/dist/index.html
# Should output the HTML content

# 4. Test NGINX configuration
sudo nginx -t

# 5. Reload NGINX (zero downtime)
sudo systemctl reload nginx

# 6. Clear CloudFlare cache (if using CDN)
# Via CloudFlare dashboard or API
```

---

## ✅ Post-Deployment Verification {#post-deployment-verification}

### Automated Verification Script

Save as `/home/clonex/scripts/verify-gm-deployment.sh`:

```bash
#!/bin/bash

echo "🔍 CloneX GM Login - Deployment Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check directory structure
echo "📁 Checking directory structure..."
if [ -d "/home/clonex/gm-login/login-frontend/dist" ]; then
    echo -e "${GREEN}✓${NC} Frontend dist directory exists"
else
    echo -e "${RED}✗${NC} Frontend dist directory missing!"
    exit 1
fi

if [ -d "/home/clonex/gm-login/universal-login-pkg" ]; then
    echo -e "${GREEN}✓${NC} SDK package directory exists"
else
    echo -e "${YELLOW}⚠${NC} SDK package directory not found (optional)"
fi

# 2. Check index.html exists
echo ""
echo "📄 Checking main files..."
if [ -f "/home/clonex/gm-login/login-frontend/dist/index.html" ]; then
    echo -e "${GREEN}✓${NC} index.html exists"
    file_size=$(du -h /home/clonex/gm-login/login-frontend/dist/index.html | cut -f1)
    echo "   Size: $file_size"
else
    echo -e "${RED}✗${NC} index.html missing!"
    exit 1
fi

# 3. Check assets directory
if [ -d "/home/clonex/gm-login/login-frontend/dist/assets" ]; then
    echo -e "${GREEN}✓${NC} Assets directory exists"
    asset_count=$(find /home/clonex/gm-login/login-frontend/dist/assets -type f | wc -l)
    echo "   Files: $asset_count"
else
    echo -e "${RED}✗${NC} Assets directory missing!"
    exit 1
fi

# 4. Check file permissions
echo ""
echo "🔐 Checking permissions..."
if [ "$(stat -c '%U' /home/clonex/gm-login/login-frontend/dist)" = "clonex" ]; then
    echo -e "${GREEN}✓${NC} Correct ownership (clonex)"
else
    echo -e "${RED}✗${NC} Incorrect ownership!"
fi

if [ "$(stat -c '%a' /home/clonex/gm-login/login-frontend/dist)" = "755" ]; then
    echo -e "${GREEN}✓${NC} Correct permissions (755)"
else
    echo -e "${YELLOW}⚠${NC} Permissions not 755"
fi

# 5. Check NGINX configuration
echo ""
echo "🔧 Checking NGINX..."
if nginx -t 2>&1 | grep -q "syntax is ok"; then
    echo -e "${GREEN}✓${NC} NGINX configuration valid"
else
    echo -e "${RED}✗${NC} NGINX configuration invalid!"
    nginx -t
    exit 1
fi

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} NGINX is running"
else
    echo -e "${RED}✗${NC} NGINX is not running!"
    exit 1
fi

# 6. Check backend PM2
echo ""
echo "⚙️  Checking Backend PM2..."
if pm2 list | grep -q "clonex-api"; then
    echo -e "${GREEN}✓${NC} Backend API is running"
    pm2 info clonex-api | grep -E "status|uptime|restarts"
else
    echo -e "${RED}✗${NC} Backend API not running!"
    exit 1
fi

# 7. Test HTTP to HTTPS redirect
echo ""
echo "🔒 Testing HTTP → HTTPS redirect..."
redirect_test=$(curl -s -o /dev/null -w "%{http_code}" -L http://gm.clonex.wtf)
if [ "$redirect_test" = "200" ]; then
    echo -e "${GREEN}✓${NC} HTTP redirects to HTTPS correctly"
else
    echo -e "${RED}✗${NC} HTTP redirect failed (got $redirect_test)"
fi

# 8. Test HTTPS endpoint
echo ""
echo "🌐 Testing HTTPS endpoint..."
https_test=$(curl -s -o /dev/null -w "%{http_code}" https://gm.clonex.wtf)
if [ "$https_test" = "200" ]; then
    echo -e "${GREEN}✓${NC} HTTPS endpoint responding (200 OK)"
else
    echo -e "${RED}✗${NC} HTTPS endpoint failed (got $https_test)"
fi

# 9. Test API proxy
echo ""
echo "🔌 Testing API proxy..."
api_test=$(curl -s -o /dev/null -w "%{http_code}" https://gm.clonex.wtf/api/health)
if [ "$api_test" = "200" ]; then
    echo -e "${GREEN}✓${NC} API proxy working"
else
    echo -e "${YELLOW}⚠${NC} API proxy returned $api_test"
fi

# 10. Check SSL certificate
echo ""
echo "📜 Checking SSL certificate..."
ssl_expiry=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/gm.clonex.wtf/cert.pem | cut -d= -f2)
echo -e "${GREEN}✓${NC} SSL certificate expires: $ssl_expiry"

# 11. Check logs for errors
echo ""
echo "📋 Checking recent logs..."
error_count=$(tail -100 /var/log/nginx/gm-login/error.log 2>/dev/null | grep -c "error")
if [ "$error_count" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No recent NGINX errors"
else
    echo -e "${YELLOW}⚠${NC} Found $error_count errors in last 100 lines"
fi

# Summary
echo ""
echo "=============================================="
echo "✅ Deployment verification complete!"
echo "=============================================="
echo ""
echo "🔗 Production URLs:"
echo "   Frontend: https://gm.clonex.wtf"
echo "   Backend:  https://api.clonex.wtf"
echo ""
echo "📊 Next steps:"
echo "   1. Clear CloudFlare cache (if using CDN)"
echo "   2. Test all critical user flows"
echo "   3. Monitor error logs for 30 minutes"
echo "   4. Update team on #deployments"
```

Make it executable:

```bash
chmod +x /home/clonex/scripts/verify-gm-deployment.sh
```

Run verification:

```bash
/home/clonex/scripts/verify-gm-deployment.sh
```

### Manual Testing Checklist

```markdown
## Functional Testing

- [ ] Site loads at https://gm.clonex.wtf
- [ ] HTTP redirects to HTTPS
- [ ] All static assets load (check browser console)
- [ ] No CSP violations in browser console
- [ ] Connect Wallet button works
- [ ] WalletConnect modal opens
- [ ] MetaMask connection works
- [ ] Wallet disconnection works
- [ ] NFT verification runs after connection
- [ ] hasAccess shows correct status
- [ ] Profile data loads correctly
- [ ] GM Points claim works
- [ ] Social OAuth (Discord/X) works
- [ ] Avatar upload works
- [ ] Public profile pages load
- [ ] Dark/Light theme toggle works
- [ ] DNA theme selector works (8 themes)
- [ ] Mobile responsive layout
- [ ] Navigation between pages works

## Performance Testing

- [ ] Page load < 3 seconds (first visit)
- [ ] Page load < 1 second (cached)
- [ ] Time to Interactive < 5 seconds
- [ ] No memory leaks (check DevTools)
- [ ] API responses < 500ms average
- [ ] Images load progressively
- [ ] No layout shift (CLS score)

## Security Testing

- [ ] HTTPS enforced (no HTTP access)
- [ ] SSL certificate valid
- [ ] Security headers present (check with securityheaders.com)
- [ ] CSP policy blocks inline scripts
- [ ] CORS headers correct
- [ ] No sensitive data in console
- [ ] JWT tokens stored securely
- [ ] Session expires after 24 hours
- [ ] Logout clears all data

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## API Integration

- [ ] All API calls use https://api.clonex.wtf
- [ ] Authentication flow completes
- [ ] NFT verification returns correct data
- [ ] Metadata enrichment working
- [ ] Multi-delegation detected
- [ ] Error handling works
- [ ] Rate limiting respected
```

---

## 🔄 Rollback Procedures {#rollback-procedures}

### Emergency Rollback (< 5 minutes)

If deployment fails critically:

```bash
# 1. Switch to backup
cd /home/clonex/gm-login
mv login-frontend login-frontend-failed
mv login-frontend-backup login-frontend

# 2. Reload NGINX
sudo systemctl reload nginx

# 3. Verify
curl -I https://gm.clonex.wtf
```

### Backup Creation (Before Deployment)

```bash
# Create timestamped backup
cd /home/clonex/gm-login
backup_date=$(date +%Y%m%d_%H%M%S)
cp -r login-frontend /home/clonex/backups/gm-login/login-frontend_$backup_date

# Keep only last 5 backups
cd /home/clonex/backups/gm-login
ls -t | tail -n +6 | xargs rm -rf
```

### Git-based Rollback

```bash
# Check last 5 commits
cd /home/clonex/gm-login/login-frontend
git log --oneline -5

# Rollback to specific commit
git reset --hard <commit-hash>

# Rebuild
npm run build

# Reload NGINX
sudo systemctl reload nginx
```

---

## 🔧 Troubleshooting {#troubleshooting}

### Common Issues

#### Issue 1: "502 Bad Gateway" on API calls

**Symptoms:** Frontend loads but API calls fail

**Solution:**
```bash
# Check if backend is running
pm2 list

# If not running, restart
pm2 restart clonex-api

# Check backend logs
pm2 logs clonex-api --lines 50
```

#### Issue 2: "404 Not Found" on page refresh

**Symptoms:** Direct URLs fail, only root loads

**Solution:**
```nginx
# Ensure SPA fallback is configured
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Issue 3: Static assets not loading

**Symptoms:** Blank page, CSS/JS not found

**Solution:**
```bash
# Check file permissions
ls -la /home/clonex/gm-login/login-frontend/dist

# Fix permissions
sudo chown -R clonex:clonex /home/clonex/gm-login/login-frontend
sudo chmod -R 755 /home/clonex/gm-login/login-frontend/dist
```

#### Issue 4: CSP violations

**Symptoms:** Browser console shows CSP errors

**Solution:**
```nginx
# Update CSP in NGINX config
# Add missing domains to connect-src directive
# Reload NGINX
sudo systemctl reload nginx
```

#### Issue 5: Build fails locally

**Symptoms:** `npm run build` errors

**Solution:**
```powershell
# Clear cache and rebuild
npm run clean
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
```

### Log Locations

```bash
# NGINX Access Log
tail -f /var/log/nginx/gm-login/access.log

# NGINX Error Log
tail -f /var/log/nginx/gm-login/error.log

# Backend PM2 Logs
pm2 logs clonex-api

# System Logs
sudo journalctl -u nginx -f
```

### Monitoring Commands

```bash
# Check NGINX status
sudo systemctl status nginx

# Check PM2 processes
pm2 list
pm2 monit

# Check disk space
df -h /home/clonex

# Check memory usage
free -h

# Check network connections
sudo netstat -tulpn | grep nginx
sudo netstat -tulpn | grep node
```

---

## 📊 Deployment Checklist

### Pre-Deployment

- [ ] Code reviewed and approved
- [ ] All tests passing locally
- [ ] TypeScript compilation successful
- [ ] Build completes without errors
- [ ] Environment variables configured
- [ ] Backup created on VPS
- [ ] Team notified of deployment window

### Deployment

- [ ] Files uploaded to VPS
- [ ] Permissions set correctly
- [ ] NGINX configuration updated
- [ ] NGINX syntax validated
- [ ] NGINX reloaded
- [ ] PM2 status verified (backend only)
- [ ] No PM2 process for frontend

### Post-Deployment

- [ ] Site loads successfully
- [ ] All assets loading
- [ ] API calls working
- [ ] Authentication flows tested
- [ ] No console errors
- [ ] Security headers present
- [ ] SSL certificate valid
- [ ] Monitoring alerts configured
- [ ] Team notified of completion

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Deployment Time** | < 10 minutes | Start to verification complete |
| **Downtime** | 0 seconds | Using NGINX reload |
| **Page Load (First Visit)** | < 3 seconds | Lighthouse / WebPageTest |
| **Page Load (Cached)** | < 1 second | Lighthouse / WebPageTest |
| **Time to Interactive** | < 5 seconds | Lighthouse |
| **API Response Time** | < 500ms average | New Relic / DataDog |
| **Error Rate** | < 0.1% | NGINX logs |
| **SSL Grade** | A+ | SSL Labs |
| **Security Headers** | A+ | securityheaders.com |

---

## 📞 Support Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| **DevOps Lead** | [Contact Info] | 24/7 |
| **Backend Team** | [Contact Info] | Business Hours |
| **Frontend Team** | [Contact Info] | Business Hours |
| **Infrastructure** | Hostinger Support | 24/7 |

---

## 📚 Additional Resources

- **API Documentation:** [Backend Bible v3.5.1](./clonex-backend-bible-v351.md)
- **Frontend Architecture:** [COMPONENT-ARCHITECTURE.md](./COMPONENT-ARCHITECTURE.md)
- **Testing Guide:** [TESTING-GUIDE.md](./TESTING-GUIDE-PHASE2-2.md)
- **Integration Guide:** [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)

---

**Document Version:** 3.5.1  
**Last Updated:** November 11, 2025  
**Maintained By:** CloneX DevOps Team  
**Status:** ✅ Production Ready
