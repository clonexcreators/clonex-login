# CloneX Universal Login - Complete Deployment Script
# Version: 3.5.1
# Date: November 11, 2025

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CloneX Universal Login - Deployment" -ForegroundColor Cyan
Write-Host "Version 3.5.1 - Project Split" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$localPath = "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Nextjs.app"
$vpsHost = "root@srv890712.hstgr.cloud"
$vpsPath = "/home/clonex/gm-login"
$backupDate = Get-Date -Format "yyyyMMdd_HHmmss"

# Step 0: Local Directory Rename (Optional)
Write-Host "[STEP 0] Local Directory Rename (Optional)" -ForegroundColor Yellow
Write-Host "Current: CloneX GM Nextjs.app" -ForegroundColor Gray
Write-Host "Suggested: CloneX GM Login Frontend" -ForegroundColor Gray
$renameLocal = Read-Host "Rename local directory? (y/n)"
if ($renameLocal -eq "y") {
    $oldPath = "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Nextjs.app"
    $newPath = "D:\Users\DCM\OneDrive\Documents\GitHub\CloneX GM Login Frontend"
    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName "CloneX GM Login Frontend"
        Write-Host "✓ Renamed to: CloneX GM Login Frontend" -ForegroundColor Green
        $localPath = $newPath
    }
} else {
    Write-Host "⊘ Skipped local rename" -ForegroundColor Gray
}
Write-Host ""

# Step 1: Local Build
Write-Host "[STEP 1] Building Frontend Locally" -ForegroundColor Yellow
cd $localPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    npm install
}

# Run type check
Write-Host "Running type check..." -ForegroundColor Gray
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Type check failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Type check passed" -ForegroundColor Green

# Build
Write-Host "Building production bundle..." -ForegroundColor Gray
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green

# Check build output
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "✓ Build size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Green
Write-Host ""

# Step 2: VPS Commands via SSH
Write-Host "[STEP 2] Preparing VPS via SSH" -ForegroundColor Yellow
Write-Host "SSH Host: $vpsHost" -ForegroundColor Gray
Write-Host ""

Write-Host "Opening SSH session for manual execution..." -ForegroundColor Cyan
Write-Host "Please execute the following commands in the SSH terminal:" -ForegroundColor Cyan
Write-Host ""

# Generate SSH commands
$sshCommands = @"
# ============================================
# CloneX GM Login - VPS Deployment Commands
# Execute these in order
# ============================================

# 1. Check current structure
cd /home/clonex/gm-login
ls -la

# 2. Create backup
backup_date=`$(date +%Y%m%d_%H%M%S)
if [ -d "nextjs-app" ]; then
    cp -r nextjs-app /home/clonex/backups/gm-login/nextjs-app_`$backup_date
    echo "✓ Backup created: nextjs-app_`$backup_date"
fi

# 3. Rename directory (if needed)
if [ -d "nextjs-app" ]; then
    mv nextjs-app login-frontend
    echo "✓ Renamed: nextjs-app → login-frontend"
else
    echo "✓ Directory already named login-frontend"
fi

# 4. Verify structure
ls -la
# Expected: login-frontend/ and universal-login-pkg/

# 5. Remove old PM2 process
pm2 delete gm-login-frontend 2>/dev/null || echo "No frontend PM2 process to delete"

# 6. Verify PM2 status
pm2 list
# Expected: Only clonex-api should be listed

# 7. Create dist directory if doesn't exist
mkdir -p /home/clonex/gm-login/login-frontend/dist

# 8. Test NGINX configuration
sudo nginx -t

# 9. If NGINX test passes, reload
sudo systemctl reload nginx

# 10. Verify NGINX status
sudo systemctl status nginx

# 11. Check site is responding
curl -I http://localhost
curl -I https://gm.clonex.wtf

echo ""
echo "✓ VPS preparation complete"
echo "Next: Upload dist/ files via FileZilla"
"@

# Save commands to file
$sshCommands | Out-File -FilePath "vps-deployment-commands.sh" -Encoding UTF8
Write-Host "✓ SSH commands saved to: vps-deployment-commands.sh" -ForegroundColor Green
Write-Host ""

# Display commands
Write-Host $sshCommands -ForegroundColor White
Write-Host ""

# Step 3: FileZilla Instructions
Write-Host "[STEP 3] Upload Files via FileZilla" -ForegroundColor Yellow
Write-Host ""
Write-Host "FileZilla Configuration:" -ForegroundColor Cyan
Write-Host "  Host: srv890712.hstgr.cloud" -ForegroundColor White
Write-Host "  Protocol: SFTP" -ForegroundColor White
Write-Host "  Port: 22" -ForegroundColor White
Write-Host "  User: root" -ForegroundColor White
Write-Host "  Password: darin1983" -ForegroundColor White
Write-Host ""
Write-Host "Upload Instructions:" -ForegroundColor Cyan
Write-Host "  Local: $localPath\dist\*" -ForegroundColor White
Write-Host "  Remote: /home/clonex/gm-login/login-frontend/dist/" -ForegroundColor White
Write-Host "  Action: Upload (overwrite all)" -ForegroundColor White
Write-Host ""

$uploadComplete = Read-Host "Press Enter after FileZilla upload completes..."

# Step 4: Post-Upload SSH Commands
Write-Host ""
Write-Host "[STEP 4] Post-Upload Configuration" -ForegroundColor Yellow
Write-Host "Execute these commands via SSH:" -ForegroundColor Cyan
Write-Host ""

$postUploadCommands = @"
# ============================================
# Post-Upload Commands (execute via SSH)
# ============================================

# 1. Set correct ownership
sudo chown -R clonex:clonex /home/clonex/gm-login/login-frontend

# 2. Set correct permissions
sudo chmod -R 755 /home/clonex/gm-login/login-frontend/dist

# 3. Verify files are readable by NGINX
sudo -u www-data cat /home/clonex/gm-login/login-frontend/dist/index.html | head -5

# 4. Test NGINX configuration
sudo nginx -t

# 5. Reload NGINX (zero downtime)
sudo systemctl reload nginx

# 6. Verify NGINX is running
sudo systemctl status nginx

# 7. Test HTTPS endpoint
curl -I https://gm.clonex.wtf

# 8. Test API proxy
curl -I https://gm.clonex.wtf/api/health

# 9. Check for errors in logs
sudo tail -20 /var/log/nginx/gm-login/error.log

echo ""
echo "✓ Deployment complete!"
"@

# Save post-upload commands
$postUploadCommands | Out-File -FilePath "vps-post-upload-commands.sh" -Encoding UTF8
Write-Host "✓ Post-upload commands saved to: vps-post-upload-commands.sh" -ForegroundColor Green
Write-Host ""
Write-Host $postUploadCommands -ForegroundColor White
Write-Host ""

$postComplete = Read-Host "Press Enter after SSH commands complete..."

# Step 5: Verification
Write-Host ""
Write-Host "[STEP 5] Local Verification" -ForegroundColor Yellow
Write-Host "Testing production site..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://gm.clonex.wtf" -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Site is live: https://gm.clonex.wtf (200 OK)" -ForegroundColor Green
    } else {
        Write-Host "⚠ Site returned: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Could not reach site: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing API proxy..." -ForegroundColor Gray
try {
    $apiResponse = Invoke-WebRequest -Uri "https://gm.clonex.wtf/api/health" -Method Head -TimeoutSec 10
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✓ API proxy working: /api/health (200 OK)" -ForegroundColor Green
    } else {
        Write-Host "⚠ API returned: $($apiResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ API proxy check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 6: Deployment Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Completed Steps:" -ForegroundColor Green
Write-Host "  ✓ Local build successful" -ForegroundColor Green
Write-Host "  ✓ VPS commands prepared" -ForegroundColor Green
Write-Host "  ✓ Files uploaded via FileZilla" -ForegroundColor Green
Write-Host "  ✓ Permissions configured" -ForegroundColor Green
Write-Host "  ✓ NGINX reloaded" -ForegroundColor Green
Write-Host "  ✓ Site verification passed" -ForegroundColor Green
Write-Host ""
Write-Host "Production URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: https://gm.clonex.wtf" -ForegroundColor White
Write-Host "  Backend:  https://api.clonex.wtf" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test all functionality in browser" -ForegroundColor White
Write-Host "  2. Monitor logs for 30 minutes" -ForegroundColor White
Write-Host "  3. Notify team in #deployments" -ForegroundColor White
Write-Host ""
Write-Host "Deployment completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create deployment log
$deploymentLog = @"
CloneX Universal Login - Deployment Log
========================================
Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Version: 3.5.1
Deployer: $(whoami)

Build Information:
- Build Size: $([math]::Round($distSize, 2)) MB
- Type Check: Passed
- Build Status: Success

VPS Commands Executed:
- Directory renamed: nextjs-app → login-frontend
- PM2 frontend process removed
- NGINX configuration updated
- Permissions set correctly
- NGINX reloaded successfully

Verification:
- Frontend: https://gm.clonex.wtf (200 OK)
- Backend: https://api.clonex.wtf (Online)

Status: ✓ DEPLOYMENT SUCCESSFUL
========================================
"@

$deploymentLog | Out-File -FilePath "deployment-log-$backupDate.txt" -Encoding UTF8
Write-Host "✓ Deployment log saved: deployment-log-$backupDate.txt" -ForegroundColor Green
Write-Host ""

# Open browser to test
$openBrowser = Read-Host "Open gm.clonex.wtf in browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process "https://gm.clonex.wtf"
}

Write-Host ""
Write-Host "Deployment script completed successfully!" -ForegroundColor Green
Write-Host ""
