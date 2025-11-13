# CloneX GM Login - Automated Fix Deployment Script
# This script uses PSCP (PuTTY's SCP) if available, otherwise provides FileZilla instructions

Write-Host "🧬 CloneX GM Login - Production Fix Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$LocalFile = "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend\src\components\ProductionApp.tsx"
$RemoteHost = "clonex@srv890712.hstgr.cloud"
$RemotePath = "/home/clonex/gm-login/login-frontend/src/components/ProductionApp.tsx"

# Check if file exists
if (-Not (Test-Path $LocalFile)) {
    Write-Host "❌ ERROR: Local file not found!" -ForegroundColor Red
    Write-Host "Expected: $LocalFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Local file found: $LocalFile" -ForegroundColor Green

# Check if PSCP is available
$PscpPath = Get-Command pscp.exe -ErrorAction SilentlyContinue

if ($PscpPath) {
    Write-Host ""
    Write-Host "🚀 PSCP found! Attempting automated transfer..." -ForegroundColor Green
    Write-Host ""
    
    # Backup remote file first
    Write-Host "📦 Step 1: Creating backup on VPS..."
    ssh $RemoteHost "cd /home/clonex/gm-login/login-frontend/src/components && cp ProductionApp.tsx ProductionApp.tsx.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    # Transfer file
    Write-Host "📤 Step 2: Uploading new ProductionApp.tsx..."
    pscp.exe -scp "$LocalFile" "${RemoteHost}:${RemotePath}"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ File transferred successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔄 Step 3: Rebuilding on VPS..."
        Write-Host ""
        
        # SSH commands for rebuild
        $RebuildCommands = @"
cd /home/clonex/gm-login/login-frontend
echo '🧹 Cleaning old build...'
rm -rf dist node_modules/.vite
echo '📦 Installing dependencies...'
npm ci
echo '🏗️  Building production bundle...'
npm run build
echo '🔐 Fixing permissions...'
sudo chown -R clonex:clonex dist
sudo chmod -R 775 dist
echo '🔄 Restarting nginx...'
sudo systemctl restart nginx
echo '✅ Deployment complete!'
"@
        
        Write-Host "Executing rebuild commands on VPS..." -ForegroundColor Yellow
        ssh $RemoteHost $RebuildCommands
        
        Write-Host ""
        Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Verification Steps:" -ForegroundColor Cyan
        Write-Host "1. Visit https://gm.clonex.wtf" -ForegroundColor White
        Write-Host "2. Hard refresh (Ctrl+Shift+R)" -ForegroundColor White
        Write-Host "3. Verify navbar, profile, and collections features" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Host "❌ File transfer failed!" -ForegroundColor Red
        Write-Host "Please use FileZilla method instead (see DEPLOYMENT-FIX-GUIDE.md)" -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "ℹ️  PSCP not found - Manual deployment required" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📁 FileZilla Deployment Instructions:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Open FileZilla and connect to:" -ForegroundColor White
    Write-Host "   Host: srv890712.hstgr.cloud" -ForegroundColor Gray
    Write-Host "   Protocol: SFTP" -ForegroundColor Gray
    Write-Host "   User: clonex" -ForegroundColor Gray
    Write-Host "   Port: 22" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Navigate to remote directory:" -ForegroundColor White
    Write-Host "   /home/clonex/gm-login/login-frontend/src/components" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Backup the existing file:" -ForegroundColor White
    Write-Host "   Right-click ProductionApp.tsx → Rename" -ForegroundColor Gray
    Write-Host "   New name: ProductionApp.tsx.backup-before-fix" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Upload the new file:" -ForegroundColor White
    Write-Host "   Local:  $LocalFile" -ForegroundColor Gray
    Write-Host "   Remote: $RemotePath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. After upload, SSH into VPS and run:" -ForegroundColor White
    Write-Host ""
    Write-Host "   cd /home/clonex/gm-login/login-frontend" -ForegroundColor DarkGray
    Write-Host "   rm -rf dist node_modules/.vite" -ForegroundColor DarkGray
    Write-Host "   npm ci && npm run build" -ForegroundColor DarkGray
    Write-Host "   sudo chown -R clonex:clonex dist" -ForegroundColor DarkGray
    Write-Host "   sudo chmod -R 775 dist" -ForegroundColor DarkGray
    Write-Host "   sudo systemctl restart nginx" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "📄 Full guide available in: DEPLOYMENT-FIX-GUIDE.md" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "🔍 Quick Verification Command:" -ForegroundColor Cyan
Write-Host "ssh $RemoteHost 'grep -c NavigationBar /home/clonex/gm-login/login-frontend/src/components/ProductionApp.tsx'" -ForegroundColor Gray
Write-Host "(Should return: 6 or more)" -ForegroundColor DarkGray
Write-Host ""
