#!/bin/bash
# ============================================================================
# CloneX Universal Login - VPS Deployment Script
# Version: 3.5.1
# Execute as: bash vps-deploy.sh
# ============================================================================

set -e  # Exit on error

echo "========================================"
echo "CloneX GM Login - VPS Deployment"
echo "Version 3.5.1 - Project Split"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_PATH="/home/clonex/gm-login"
BACKUP_PATH="/home/clonex/backups/gm-login"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)

echo -e "${CYAN}[STEP 1] Checking Current Structure${NC}"
cd $BASE_PATH
echo "Current directory: $(pwd)"
ls -la
echo ""

echo -e "${CYAN}[STEP 2] Creating Backup${NC}"
mkdir -p $BACKUP_PATH
if [ -d "nextjs-app" ]; then
    echo "Backing up nextjs-app..."
    cp -r nextjs-app $BACKUP_PATH/nextjs-app_$BACKUP_DATE
    echo -e "${GREEN}✓ Backup created: $BACKUP_PATH/nextjs-app_$BACKUP_DATE${NC}"
elif [ -d "login-frontend" ]; then
    echo "Backing up login-frontend..."
    cp -r login-frontend $BACKUP_PATH/login-frontend_$BACKUP_DATE
    echo -e "${GREEN}✓ Backup created: $BACKUP_PATH/login-frontend_$BACKUP_DATE${NC}"
else
    echo -e "${RED}✗ No frontend directory found!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 3] Renaming Directory${NC}"
if [ -d "nextjs-app" ]; then
    echo "Renaming nextjs-app → login-frontend..."
    mv nextjs-app login-frontend
    echo -e "${GREEN}✓ Renamed: nextjs-app → login-frontend${NC}"
elif [ -d "login-frontend" ]; then
    echo -e "${GREEN}✓ Directory already named login-frontend${NC}"
else
    echo -e "${RED}✗ Frontend directory not found!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 4] Verifying Directory Structure${NC}"
ls -la
echo ""
if [ -d "login-frontend" ] && [ -d "universal-login-pkg" ]; then
    echo -e "${GREEN}✓ Directory structure correct${NC}"
else
    echo -e "${RED}✗ Directory structure incorrect!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 5] Checking PM2 Processes${NC}"
pm2 list
echo ""

echo -e "${CYAN}[STEP 6] Removing Old PM2 Frontend Process${NC}"
pm2 delete gm-login-frontend 2>/dev/null && echo -e "${GREEN}✓ Removed gm-login-frontend PM2 process${NC}" || echo -e "${YELLOW}⊘ No gm-login-frontend process found${NC}"
echo ""

echo -e "${CYAN}[STEP 7] Verifying PM2 Status${NC}"
pm2 list
echo ""
echo "Expected: Only clonex-api should be running"
if pm2 list | grep -q "clonex-api"; then
    echo -e "${GREEN}✓ Backend API (clonex-api) is running${NC}"
else
    echo -e "${RED}✗ Backend API not running!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 8] Creating dist Directory${NC}"
mkdir -p $BASE_PATH/login-frontend/dist
echo -e "${GREEN}✓ Directory ensured: $BASE_PATH/login-frontend/dist${NC}"
echo ""

echo -e "${CYAN}[STEP 9] Testing NGINX Configuration${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ NGINX configuration is valid${NC}"
else
    echo -e "${RED}✗ NGINX configuration has errors!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 10] Checking NGINX Service${NC}"
sudo systemctl status nginx --no-pager | head -10
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ NGINX is running${NC}"
else
    echo -e "${RED}✗ NGINX is not running!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 11] Testing Local HTTP${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Local HTTP responding: $HTTP_STATUS${NC}"
else
    echo -e "${YELLOW}⚠ Local HTTP returned: $HTTP_STATUS${NC}"
fi
echo ""

echo "========================================"
echo -e "${GREEN}VPS PREPARATION COMPLETE${NC}"
echo "========================================"
echo ""
echo "Summary:"
echo "  ✓ Backup created"
echo "  ✓ Directory renamed (nextjs-app → login-frontend)"
echo "  ✓ PM2 frontend process removed"
echo "  ✓ NGINX configuration validated"
echo "  ✓ NGINX service running"
echo ""
echo "Next Steps:"
echo "  1. Upload dist/ files from Windows via FileZilla"
echo "  2. Execute post-upload commands (see vps-post-upload.sh)"
echo ""
echo "FileZilla Settings:"
echo "  Host: srv890712.hstgr.cloud"
echo "  Protocol: SFTP, Port: 22"
echo "  Local: [Your Windows dist folder]"
echo "  Remote: /home/clonex/gm-login/login-frontend/dist/"
echo ""
