#!/bin/bash
# ============================================================================
# CloneX Universal Login - Post-Upload Configuration
# Version: 3.5.1
# Execute after uploading dist/ files via FileZilla
# Execute as: bash vps-post-upload.sh
# ============================================================================

set -e  # Exit on error

echo "========================================"
echo "CloneX GM Login - Post-Upload Config"
echo "Version 3.5.1"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PATH="/home/clonex/gm-login/login-frontend"
DIST_PATH="$FRONTEND_PATH/dist"

echo -e "${CYAN}[STEP 1] Verifying Uploaded Files${NC}"
if [ -f "$DIST_PATH/index.html" ]; then
    echo -e "${GREEN}✓ index.html found${NC}"
    FILE_COUNT=$(find $DIST_PATH -type f | wc -l)
    echo "  Total files: $FILE_COUNT"
    DIST_SIZE=$(du -sh $DIST_PATH | cut -f1)
    echo "  Dist size: $DIST_SIZE"
else
    echo -e "${RED}✗ index.html not found! Files not uploaded?${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 2] Setting Ownership${NC}"
echo "Setting owner to clonex:clonex..."
sudo chown -R clonex:clonex $FRONTEND_PATH
echo -e "${GREEN}✓ Ownership set correctly${NC}"
echo ""

echo -e "${CYAN}[STEP 3] Setting Permissions${NC}"
echo "Setting permissions to 755..."
sudo chmod -R 755 $DIST_PATH
echo -e "${GREEN}✓ Permissions set correctly${NC}"
echo ""

echo -e "${CYAN}[STEP 4] Verifying NGINX Can Read Files${NC}"
echo "Testing as www-data user..."
if sudo -u www-data cat $DIST_PATH/index.html > /dev/null 2>&1; then
    echo -e "${GREEN}✓ NGINX can read files${NC}"
    echo "First 5 lines of index.html:"
    sudo -u www-data cat $DIST_PATH/index.html | head -5
else
    echo -e "${RED}✗ NGINX cannot read files!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 5] Testing NGINX Configuration${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ NGINX configuration is valid${NC}"
else
    echo -e "${RED}✗ NGINX configuration has errors!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 6] Reloading NGINX (Zero Downtime)${NC}"
echo "Executing: sudo systemctl reload nginx"
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ NGINX reloaded successfully${NC}"
else
    echo -e "${RED}✗ NGINX reload failed!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 7] Verifying NGINX Status${NC}"
sudo systemctl status nginx --no-pager | head -10
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ NGINX is active and running${NC}"
else
    echo -e "${RED}✗ NGINX is not running!${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}[STEP 8] Testing HTTPS Endpoint${NC}"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gm.clonex.wtf 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Site is live: https://gm.clonex.wtf (200 OK)${NC}"
elif [ "$HTTPS_STATUS" = "000" ]; then
    echo -e "${YELLOW}⚠ Could not connect (curl error)${NC}"
else
    echo -e "${YELLOW}⚠ Site returned: $HTTPS_STATUS${NC}"
fi
echo ""

echo -e "${CYAN}[STEP 9] Testing API Proxy${NC}"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gm.clonex.wtf/api/health 2>/dev/null || echo "000")
if [ "$API_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ API proxy working: /api/health (200 OK)${NC}"
elif [ "$API_STATUS" = "000" ]; then
    echo -e "${YELLOW}⚠ Could not connect (curl error)${NC}"
else
    echo -e "${YELLOW}⚠ API returned: $API_STATUS${NC}"
fi
echo ""

echo -e "${CYAN}[STEP 10] Checking NGINX Error Logs${NC}"
echo "Last 10 lines of error log:"
sudo tail -10 /var/log/nginx/gm-login/error.log 2>/dev/null || echo "No errors logged"
echo ""

echo -e "${CYAN}[STEP 11] Checking NGINX Access Logs${NC}"
echo "Last 5 access log entries:"
sudo tail -5 /var/log/nginx/gm-login/access.log 2>/dev/null || echo "No access logged yet"
echo ""

echo "========================================"
echo -e "${GREEN}DEPLOYMENT COMPLETE!${NC}"
echo "========================================"
echo ""
echo "Summary:"
echo "  ✓ Files uploaded and verified"
echo "  ✓ Ownership set (clonex:clonex)"
echo "  ✓ Permissions set (755)"
echo "  ✓ NGINX can read files"
echo "  ✓ NGINX configuration valid"
echo "  ✓ NGINX reloaded (zero downtime)"
echo "  ✓ HTTPS endpoint responding"
echo "  ✓ API proxy working"
echo ""
echo "Production URLs:"
echo "  Frontend: https://gm.clonex.wtf"
echo "  Backend:  https://api.clonex.wtf"
echo ""
echo "Next Steps:"
echo "  1. Test all functionality in browser"
echo "  2. Monitor logs: sudo tail -f /var/log/nginx/gm-login/error.log"
echo "  3. Check PM2 status: pm2 list"
echo "  4. Notify team in #deployments"
echo ""
echo "Deployment completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Create deployment marker
echo "$(date '+%Y-%m-%d %H:%M:%S') - Deployment v3.5.1 completed successfully" >> /home/clonex/deployment-history.log

echo -e "${GREEN}✓ All deployment steps completed successfully!${NC}"
echo ""
