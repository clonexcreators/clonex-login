#!/bin/bash
# =====================================================================
# CloneX GM Login - Deployment Verification + Diagnostics
# =====================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

FRONT_URL="https://gm.clonex.wtf"
BACK_URL="https://api.clonex.wtf/health"
CERT_PATH="/etc/letsencrypt/live/gm.clonex.wtf/fullchain.pem"
NGINX_LOG="/var/log/nginx/gm-login/error.log"

echo -e "${CYAN}🔍 CloneX GM Login - Deployment Verification${NC}"
echo "=============================================="
echo

# --- Frontend checks ---
if [ -d "/home/clonex/gm-login/login-frontend/dist" ]; then
  echo -e "📁 Checking directory structure..."
  echo -e "${GREEN}✓ Frontend dist directory exists${NC}"
else
  echo -e "${RED}❌ Frontend dist directory missing${NC}"
fi
echo

# --- File checks ---
if [ -f "/home/clonex/gm-login/login-frontend/dist/index.html" ]; then
  echo -e "📄 Checking main files..."
  SIZE=$(du -h /home/clonex/gm-login/login-frontend/dist/index.html | cut -f1)
  echo -e "${GREEN}✓ index.html exists${NC}"
  echo "   Size: $SIZE"
  FILES=$(find /home/clonex/gm-login/login-frontend/dist/assets -type f | wc -l)
  echo -e "${GREEN}✓ Assets directory exists${NC}"
  echo "   Files: $FILES"
else
  echo -e "${RED}❌ index.html missing${NC}"
fi
echo

# --- Permissions ---
OWNER=$(stat -c "%U" /home/clonex/gm-login/login-frontend/dist 2>/dev/null)
PERMS=$(stat -c "%a" /home/clonex/gm-login/login-frontend/dist 2>/dev/null)
if [ "$OWNER" = "clonex" ]; then
  echo -e "🔐 Checking permissions..."
  echo -e "${GREEN}✓ Correct ownership ($OWNER)${NC}"
  echo -e "${GREEN}✓ Permissions: $PERMS${NC}"
else
  echo -e "${RED}❌ Permissions or ownership incorrect${NC}"
fi
echo

# --- NGINX ---
echo -e "🔧 Checking NGINX..."
[ -f /etc/nginx/sites-available/gm.clonex.wtf ] && echo -e "${GREEN}✓ NGINX config exists${NC}"
[ -L /etc/nginx/sites-enabled/gm.clonex.wtf ] && echo -e "${GREEN}✓ NGINX symlink exists${NC}"
sudo systemctl is-active nginx >/dev/null && echo -e "${GREEN}✓ nginx active${NC}" || echo -e "${RED}❌ nginx inactive${NC}"
echo

# --- PM2 ---
echo -e "⚙️  Checking PM2..."
pm2 describe clonex-api &>/dev/null && echo -e "${GREEN}✓ Backend API is running${NC}" || echo -e "${RED}❌ Backend API stopped${NC}"
echo

# --- Endpoint Tests ---
echo -e "🌐 Testing endpoints..."
front_status=$(curl -Is --max-time 10 $FRONT_URL | head -n1)
back_status=$(curl -Is --max-time 10 $BACK_URL | head -n1)
[[ "$front_status" == *"200"* ]] && echo -e "${GREEN}✓ HTTPS working (200)${NC}" || echo -e "${RED}❌ Frontend unreachable${NC}"
[[ "$back_status" == *"200"* ]] && echo -e "${GREEN}✓ API proxy working (200)${NC}" || echo -e "${RED}❌ Backend API error${NC}"
echo

# --- SSL Expiry ---
echo -e "🔐 SSL Certificate Expiry:"
if [ -f "$CERT_PATH" ]; then
  EXPIRY_DATE=$(sudo openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
  EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
  echo -e "${GREEN}✓ Certificate valid until:$NC $EXPIRY_DATE"
  if [ $DAYS_LEFT -le 14 ]; then
    echo -e "${YELLOW}⚠ Only $DAYS_LEFT days remaining — renewal soon${NC}"
  else
    echo -e "🗓 $DAYS_LEFT days remaining"
  fi
else
  echo -e "${RED}❌ Certificate file not found${NC}"
fi
echo

# --- NGINX Errors (last 3 lines) ---
echo -e "🧾 Recent NGINX errors (last 3 lines):"
if [ -f "$NGINX_LOG" ]; then
  sudo tail -n 3 "$NGINX_LOG"
else
  echo -e "${GREEN}✓ No error log found (clean)${NC}"
fi
echo

echo -e "${GREEN}✅ Verification complete!${NC}"
echo "Frontend: $FRONT_URL"
echo "Backend:  $BACK_URL"