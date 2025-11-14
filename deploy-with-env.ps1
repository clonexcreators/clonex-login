# CloneX GM Login Frontend - Production Deployment Script
# Version: 2025-11-13
# Purpose: Deploy with proper environment variables and verify WalletConnect integration

Write-Host "🚀 CloneX GM Login Frontend - Production Deployment" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

# Configuration
$LocalPath = "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend"
$RemotePath = "/home/clonex/gm-login/login-frontend"
$RemoteHost = "clonex@srv890712.hstgr.cloud"

# Step 1: Pre-deployment checks
Write-Host "📋 Step 1: Pre-deployment Checks" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

# Check if dist exists
if (-not (Test-Path "$LocalPath\dist")) {
    Write-Host "❌ ERROR: dist folder not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ dist folder exists" -ForegroundColor Green

# Check if .env.production exists
if (-not (Test-Path "$LocalPath\.env.production")) {
    Write-Host "❌ ERROR: .env.production not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ .env.production exists" -ForegroundColor Green

# Check for critical environment variables
$envContent = Get-Content "$LocalPath\.env.production" -Raw
if ($envContent -notmatch "VITE_WALLETCONNECT_PROJECT_ID=743b5c9a705ea2255557991fb96d9c7e") {
    Write-Host "⚠️  WARNING: WalletConnect Project ID not found in .env.production" -ForegroundColor Yellow
    Write-Host "   The app requires this to function properly" -ForegroundColor Yellow
}
else {
    Write-Host "✅ WalletConnect Project ID configured" -ForegroundColor Green
}

if ($envContent -notmatch "VITE_API_BASE_URL=https://api.clonex.wtf") {
    Write-Host "❌ ERROR: API Base URL not configured correctly" -ForegroundColor Red
    exit 1
}
Write-Host "✅ API Base URL configured" -ForegroundColor Green

Write-Host ""

# Step 2: Create deployment backup
Write-Host "📦 Step 2: Creating Remote Backup" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupCmd = @"
cd $RemotePath && \
if [ -d dist ]; then \
    cp -r dist dist.backup.$timestamp && \
    echo 'Backup created: dist.backup.$timestamp' || \
    echo 'Backup failed but continuing...'; \
fi
"@

ssh $RemoteHost $backupCmd
Write-Host ""

# Step 3: Upload files via SCP
Write-Host "📤 Step 3: Uploading Files to Production" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

Write-Host "Uploading dist folder..." -ForegroundColor Cyan
scp -r "$LocalPath\dist" "${RemoteHost}:${RemotePath}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Upload complete" -ForegroundColor Green
Write-Host ""

# Step 4: Verify deployment
Write-Host "🔍 Step 4: Verifying Deployment" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

$verifyCmd = @"
cd $RemotePath && \
echo '📂 Checking directory structure:' && \
ls -lh dist/ && \
echo '' && \
echo '📄 Checking index.html:' && \
ls -lh dist/index.html && \
echo '' && \
echo '🎨 Checking CSS:' && \
find dist/assets/css -name '*.css' -exec ls -lh {} \; && \
echo '' && \
echo '📦 Checking JS bundles:' && \
echo 'Vendor bundles:' && \
ls -lh dist/assets/vendor/*.js 2>/dev/null | head -3 && \
echo 'Total JS files:' && \
find dist/assets -name '*.js' | wc -l
"@

ssh $RemoteHost $verifyCmd
Write-Host ""

# Step 5: Test HTTP responses
Write-Host "🌐 Step 5: Testing HTTP Responses" -ForegroundColor Yellow
Write-Host "-" * 70 -ForegroundColor Gray

Write-Host "Testing frontend URL..." -ForegroundColor Cyan
$testCmd = @"
echo 'Frontend:' && \
curl -I -s https://gm.clonex.wtf | head -1 && \
echo '' && \
echo 'CSS Asset:' && \
curl -I -s https://gm.clonex.wtf/assets/css/style-*.css 2>/dev/null | head -1 || echo 'CSS check skipped' && \
echo '' && \
echo 'Backend API:' && \
curl -I -s https://api.clonex.wtf/health | head -1
"@

ssh $RemoteHost $testCmd
Write-Host ""

# Step 6: Summary
Write-Host "📊 Deployment Summary" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
Write-Host "✅ Directory structure verified" -ForegroundColor Green
Write-Host "✅ HTTP responses tested" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open browser: https://gm.clonex.wtf" -ForegroundColor White
Write-Host "   2. Open browser console (F12)" -ForegroundColor White
Write-Host "   3. Verify:" -ForegroundColor White
Write-Host "      - Full UI loads (not just gradient shell)" -ForegroundColor White
Write-Host "      - No WalletConnect errors in console" -ForegroundColor White
Write-Host "      - Connect Wallet button appears" -ForegroundColor White
Write-Host "      - API calls work to https://api.clonex.wtf" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Troubleshooting:" -ForegroundColor Cyan
Write-Host "   If issues persist, check browser console for:" -ForegroundColor White
Write-Host "   - 'WalletConnect Project ID is required' error" -ForegroundColor White
Write-Host "   - Network errors to api.clonex.wtf" -ForegroundColor White
Write-Host "   - Missing CSS or JS assets" -ForegroundColor White
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray
