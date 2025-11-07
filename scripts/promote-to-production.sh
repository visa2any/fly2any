#!/bin/bash

# Fly2Any - Promote Deployment to Production
# This script promotes the preview deployment to production

set -e

echo "🚀 Fly2Any Production Deployment Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="fly2any"
TEAM="visa2any"
PREVIEW_DEPLOYMENT="DQ65LxYk2"
CURRENT_PRODUCTION="Df73GmSgp"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Project: $PROJECT_NAME"
echo "  Team: $TEAM"
echo "  Preview Deployment: $PREVIEW_DEPLOYMENT"
echo "  Current Production: $CURRENT_PRODUCTION"
echo ""

# Step 1: Check if Vercel CLI is installed
echo -e "${BLUE}1️⃣  Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found!${NC}"
    echo "Install it with: npm i -g vercel"
    exit 1
fi
echo -e "${GREEN}✅ Vercel CLI installed: $(vercel --version | head -1)${NC}"
echo ""

# Step 2: Check authentication
echo -e "${BLUE}2️⃣  Checking authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated${NC}"
    echo ""
    echo "Please authenticate with Vercel:"
    echo ""
    echo -e "${YELLOW}Run: vercel login${NC}"
    echo ""
    echo "Choose your authentication method:"
    echo "  1. GitHub (recommended)"
    echo "  2. GitLab"
    echo "  3. Bitbucket"
    echo "  4. Email"
    echo ""
    echo "After authentication, run this script again."
    exit 1
else
    VERCEL_USER=$(vercel whoami)
    echo -e "${GREEN}✅ Authenticated as: $VERCEL_USER${NC}"
fi
echo ""

# Step 3: Link project (if not already linked)
echo -e "${BLUE}3️⃣  Checking project link...${NC}"
if [ ! -d ".vercel" ]; then
    echo -e "${YELLOW}⚠️  Project not linked. Linking now...${NC}"
    vercel link --yes --scope="$TEAM"
else
    echo -e "${GREEN}✅ Project already linked${NC}"
fi
echo ""

# Step 4: List recent deployments
echo -e "${BLUE}4️⃣  Listing recent deployments...${NC}"
echo ""
vercel ls --scope="$TEAM" | head -20
echo ""

# Step 5: Confirm promotion
echo -e "${YELLOW}⚠️  PRODUCTION DEPLOYMENT CONFIRMATION${NC}"
echo ""
echo "You are about to promote:"
echo -e "  ${GREEN}Preview: $PREVIEW_DEPLOYMENT${NC}"
echo "To production, replacing:"
echo -e "  ${RED}Current: $CURRENT_PRODUCTION${NC}"
echo ""
read -p "Continue with promotion? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi
echo ""

# Step 6: Promote to production
echo -e "${BLUE}5️⃣  Promoting to production...${NC}"
echo ""
if vercel promote "$PREVIEW_DEPLOYMENT" --scope="$TEAM" --yes; then
    echo ""
    echo -e "${GREEN}✅ Deployment promoted successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Promotion failed!${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check deployment ID: $PREVIEW_DEPLOYMENT"
    echo "  2. Verify team scope: $TEAM"
    echo "  3. Check permissions in Vercel dashboard"
    echo ""
    exit 1
fi
echo ""

# Step 7: Verify production deployment
echo -e "${BLUE}6️⃣  Verifying production deployment...${NC}"
echo "Waiting 10 seconds for DNS propagation..."
sleep 10
echo ""

# Check production URL
PRODUCTION_URL="https://www.fly2any.com"
echo "Testing: $PRODUCTION_URL"
if curl -sS -I "$PRODUCTION_URL" | head -1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Production URL is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Production URL check inconclusive${NC}"
fi
echo ""

# Step 8: Display next steps
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🌐 Visit production site:"
echo "   $PRODUCTION_URL"
echo ""
echo "2. ✅ Run quick tests:"
echo "   - Homepage loads"
echo "   - AI assistant works"
echo "   - Flight search functions"
echo "   - Complete booking flow"
echo ""
echo "3. 📊 Monitor Vercel dashboard:"
echo "   https://vercel.com/$TEAM/$PROJECT_NAME"
echo ""
echo "4. 🔄 Rollback if needed:"
echo "   vercel rollback $CURRENT_PRODUCTION --scope=$TEAM"
echo ""
echo -e "${BLUE}📝 Full test checklist: PRODUCTION_TEST_CHECKLIST.md${NC}"
echo ""
