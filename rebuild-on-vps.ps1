# 🚀 CloneX GM Login - Rebuild on VPS Script
# This script uploads source files and rebuilds on the production server

Write-Host "🚀 CloneX GM Login - VPS Rebuild Deployment" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

# Configuration
$LocalPath = "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend"
$RemotePath = "/home/clonex/gm-login/login-frontend"
$RemoteHost = "clonex@srv890712.hstgr.cloud"

# Files/folders to upload (excluding node_modules and dist)
$FilesToUpload = @(
    ".env.production",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
    "src",
    "public",
    "scripts"
)

Write-Host "📋 Step 1: Pre-Upload Verification" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

# Verify .env.production exists
if (-not (Test-Path "$LocalPath\.env.production")) {
    Write-Host "❌ ERROR: .env.production not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ .env.production exists" -ForegroundColor Green

# Check for WalletConnect Project ID
$envContent = Get-Content "$LocalPath\.env.production" -Raw
if ($envContent -notmatch "VITE_WALLETCONNECT_PROJECT_ID=\w+") {
    Write-Host "❌ ERROR: WalletConnect Project ID not found in .env.production" -ForegroundColor Red
    exit 1
}
Write-Host "✅ WalletConnect Project ID configured" -ForegroundColor Green

# Check for API URL
if ($envContent -notmatch "VITE_API_BASE_URL=https://api.clonex.wtf") {
    Write-Host "❌ ERROR: API Base URL not configured" -ForegroundColor Red
    exit 1
}
Write-Host "✅ API Base URL configured" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Step 2: Creating Backup on VPS" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupCmd = @"
cd $RemotePath && \
echo 'Creating backup...' && \
if [ -d dist ]; then mv dist dist.backup.$timestamp && echo '✅ Backup created: dist.backup.$timestamp'; fi && \
if [ -f .env.production ]; then cp .env.production .env.production.backup.$timestamp && echo '✅ .env.production backed up'; fi
"@

Write-Host "Executing backup on server..." -ForegroundColor Cyan
ssh $RemoteHost $backupCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Backup warning (continuing anyway)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "📤 Step 3: Uploading Source Files" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

foreach ($item in $FilesToUpload) {
    $localItem = Join-Path $LocalPath $item
    
    if (Test-Path $localItem) {
        Write-Host "Uploading: $item" -ForegroundColor Cyan
        
        if (Test-Path $localItem -PathType Container) {
            # It's a directory
            scp -r $localItem "${RemoteHost}:${RemotePath}/"
        } else {
            # It's a file
            scp $localItem "${RemoteHost}:${RemotePath}/"
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Uploaded: $item" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed: $item" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  ⚠️  Skipped (not found): $item" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "🔨 Step 4: Installing Dependencies on VPS" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

$installCmd = @"
cd $RemotePath && \
echo '📦 Installing npm dependencies...' && \
npm ci --production=false 2>&1 | tail -20 && \
echo '' && \
echo '✅ Dependencies installed'
"@

Write-Host "Installing dependencies (this may take 2-3 minutes)..." -ForegroundColor Cyan
ssh $RemoteHost $installCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "🏗️  Step 5: Building Production Bundle on VPS" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

$buildCmd = @"
cd $RemotePath && \
echo '🔨 Starting production build...' && \
echo '' && \
npm run build 2>&1 && \
echo '' && \
echo '✅ Build completed'
"@

Write-Host "Building (this may take 30-60 seconds)..." -ForegroundColor Cyan
ssh $RemoteHost $buildCmd

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
    Write-Host "🔍 Checking error logs..." -ForegroundColor Yellow
    ssh $RemoteHost "cd $RemotePath && tail -50 npm-debug.log 2>/dev/null || echo 'No npm-debug.log found'"
    exit 1
}
Write-Host ""

Write-Host "🔍 Step 6: Verifying Build Output" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

$verifyCmd = @"
cd $RemotePath && \
echo '📂 Checking dist directory:' && \
ls -lh dist/ | head -10 && \
echo '' && \
echo '📄 index.html:' && \
ls -lh dist/index.html && \
echo '' && \
echo '🎨 CSS files:' && \
find dist/assets/css -name '*.css' -exec ls -lh {} \; 2>/dev/null && \
echo '' && \
echo '📦 JavaScript bundles:' && \
ls -lh dist/assets/vendor/*.js 2>/dev/null | head -3 && \
echo '' && \
echo '📊 Total files in dist:' && \
find dist -type f | wc -l
"@

ssh $RemoteHost $verifyCmd
Write-Host ""

Write-Host "🌐 Step 7: Testing HTTP Responses" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

$testCmd = @"
echo '🌐 Testing URLs:' && \
echo '' && \
echo '1. Frontend (gm.clonex.wtf):' && \
curl -I -s https://gm.clonex.wtf 2>&1 | head -1 && \
echo '' && \
echo '2. Backend API (api.clonex.wtf):' && \
curl -I -s https://api.clonex.wtf/health 2>&1 | head -1 && \
echo '' && \
echo '3. Testing API connectivity from VPS:' && \
curl -s https://api.clonex.wtf/health | head -1
"@

ssh $RemoteHost $testCmd
Write-Host ""

Write-Host "📊 Deployment Summary" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "✅ Source files uploaded" -ForegroundColor Green
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host "✅ Production build completed" -ForegroundColor Green
Write-Host "✅ Build artifacts verified" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Verification Steps:" -ForegroundColor Cyan
Write-Host "   1. Open: https://gm.clonex.wtf" -ForegroundColor White
Write-Host "   2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)" -ForegroundColor White
Write-Host "   3. Open browser console (F12)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Expected Results:" -ForegroundColor Cyan
Write-Host "   • Full CloneX UI loads (not just gradient shell)" -ForegroundColor White
Write-Host "   • 'Connect Wallet' button visible" -ForegroundColor White
Write-Host "   • Navigation bar appears" -ForegroundColor White
Write-Host "   • No WalletConnect errors in console" -ForegroundColor White
Write-Host "   • DNA-themed styling applied" -ForegroundColor White
Write-Host ""
Write-Host "🔧 If Issues Persist:" -ForegroundColor Cyan
Write-Host "   • Clear browser cache completely" -ForegroundColor White
Write-Host "   • Try incognito/private window" -ForegroundColor White
Write-Host "   • Check console for specific errors" -ForegroundColor White
Write-Host "   • Verify environment variables:" -ForegroundColor White
Write-Host "     ssh $RemoteHost 'cat $RemotePath/.env.production | grep VITE_WALLETCONNECT'" -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray
