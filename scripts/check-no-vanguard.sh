#!/bin/bash
# Regression guard: Ensure tier/rank language is not DISPLAYED in dashboard
# The accessLevels.ts config is still used for subdomain access checks,
# but the dashboard should never render these tier titles/descriptions.
#
# Run this in CI or as a pre-commit hook

set -e

DASHBOARD_FILE="src/components/ProductionNFTDashboard.tsx"

echo "🔍 Checking for tier/rank language regression in dashboard..."

# Check that dashboard does NOT reference accessConfig.title or accessConfig.description
if grep -E "accessConfig\.title|accessConfig\.description" "$DASHBOARD_FILE" 2>/dev/null; then
    echo "❌ REGRESSION DETECTED: Dashboard still references accessConfig.title or accessConfig.description"
    exit 1
fi

# Check for hardcoded tier names that would be displayed
if grep -iE "Clone Vanguard|Cosmic Champion|DNA Disciple|Animus Prime|High-ranking" "$DASHBOARD_FILE" 2>/dev/null; then
    echo "❌ REGRESSION DETECTED: Hardcoded tier names found in dashboard"
    exit 1
fi

# Check for placeholder feature labels
if grep -E "CATALOGUED|BREEDING|ENHANCEMENT|AVAILABLE RESEARCH AREAS" "$DASHBOARD_FILE" 2>/dev/null; then
    echo "❌ REGRESSION DETECTED: Placeholder feature labels found in dashboard"
    exit 1
fi

# Verify canonical strings are present
if ! grep -q "CloneX Connect" "$DASHBOARD_FILE" 2>/dev/null; then
    echo "❌ REGRESSION: 'CloneX Connect' title not found in dashboard"
    exit 1
fi

if ! grep -q "YOUR VERIFIED NFT HOLDINGS" "$DASHBOARD_FILE" 2>/dev/null; then
    echo "❌ REGRESSION: 'YOUR VERIFIED NFT HOLDINGS' subtitle not found in dashboard"
    exit 1
fi

if ! grep -q "ECOSYSTEM APPS" "$DASHBOARD_FILE" 2>/dev/null; then
    echo "❌ REGRESSION: 'ECOSYSTEM APPS' header not found in dashboard"
    exit 1
fi

echo "✅ Dashboard uses canonical neutral copy"
echo "✅ No tier/rank language displayed"
echo "✅ Regression check passed"
