#!/bin/bash

# Fly2Any - Interactive Production Deployment
# Handles authentication and deployment automatically

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DEPLOYMENT_ID="DQ65LxYk2"
TEAM="visa2any"
PROJECT="fly2any"

clear
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Fly2Any Production Deployment     ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Deployment ID: $DEPLOYMENT_ID${NC}"
echo -e "${CYAN}Team: $TEAM${NC}"
echo -e "${CYAN}Project: $PROJECT${NC}"
echo ""

# Step 1: Check Vercel CLI
echo -e "${BLUE}[1/6]${NC} Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not installed${NC}"
    echo ""
    echo "Install with: npm i -g vercel"
    exit 1
fi
echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Step 2: Authentication
echo -e "${BLUE}[2/6]${NC} Checking authentication..."
if vercel whoami &> /dev/null; then
    USER=$(vercel whoami)
    echo -e "${GREEN}✅ Already authenticated as: $USER${NC}"
else
    echo -e "${YELLOW}⚠️  Not authenticated${NC}"
    echo ""
    echo "Choose authentication method:"
    echo ""
    echo "  1. Browser login (GitHub/GitLab/Bitbucket)"
    echo "  2. Token login (if you have a Vercel token)"
    echo "  3. Skip (use Vercel Dashboard instead)"
    echo ""
    read -p "Enter choice (1-3): " AUTH_CHOICE
    echo ""

    case $AUTH_CHOICE in
        1)
            echo -e "${CYAN}Opening browser for authentication...${NC}"
            vercel login
            echo ""
            if vercel whoami &> /dev/null; then
                echo -e "${GREEN}✅ Authentication successful${NC}"
            else
                echo -e "${RED}❌ Authentication failed${NC}"
                exit 1
            fi
            ;;
        2)
            echo ""
            read -p "Enter your Vercel token: " VERCEL_TOKEN
            export VERCEL_TOKEN
            if vercel whoami --token="$VERCEL_TOKEN" &> /dev/null; then
                echo -e "${GREEN}✅ Token authentication successful${NC}"
            else
                echo -e "${RED}❌ Invalid token${NC}"
                exit 1
            fi
            ;;
        3)
            echo ""
            echo -e "${YELLOW}═══════════════════════════════════════${NC}"
            echo -e "${YELLOW}  ALTERNATIVE: Use Vercel Dashboard${NC}"
            echo -e "${YELLOW}═══════════════════════════════════════${NC}"
            echo ""
            echo "1. Visit: ${CYAN}https://vercel.com/$TEAM/$PROJECT${NC}"
            echo "2. Find deployment: ${CYAN}$DEPLOYMENT_ID${NC}"
            echo "3. Click: ${GREEN}Promote to Production${NC}"
            echo ""
            echo "This is the fastest way without CLI setup!"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
fi
echo ""

# Step 3: Link project
echo -e "${BLUE}[3/6]${NC} Linking project..."
cd /home/user/fly2any
if [ ! -d ".vercel" ]; then
    vercel link --yes --scope="$TEAM"
fi
echo -e "${GREEN}✅ Project linked${NC}"
echo ""

# Step 4: List deployments
echo -e "${BLUE}[4/6]${NC} Verifying deployment exists..."
echo ""
vercel ls --scope="$TEAM" | head -15
echo ""

if ! vercel ls --scope="$TEAM" | grep -q "$DEPLOYMENT_ID"; then
    echo -e "${RED}❌ Deployment $DEPLOYMENT_ID not found${NC}"
    echo ""
    echo "Available deployments shown above."
    echo "Check the deployment ID and try again."
    exit 1
fi
echo -e "${GREEN}✅ Deployment $DEPLOYMENT_ID found${NC}"
echo ""

# Step 5: Promote to production
echo -e "${BLUE}[5/6]${NC} Promoting to production..."
echo ""
echo -e "${YELLOW}⚠️  CONFIRMATION REQUIRED${NC}"
echo ""
echo "This will make $DEPLOYMENT_ID the live production deployment."
echo ""
read -p "Proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}Promoting...${NC}"
echo ""

if [ -n "$VERCEL_TOKEN" ]; then
    vercel promote "$DEPLOYMENT_ID" --scope="$TEAM" --token="$VERCEL_TOKEN" --yes
else
    vercel promote "$DEPLOYMENT_ID" --scope="$TEAM" --yes
fi

echo ""
echo -e "${GREEN}✅ Deployment promoted!${NC}"
echo ""

# Step 6: Verify
echo -e "${BLUE}[6/6]${NC} Verifying production..."
echo ""
echo "Waiting 15 seconds for DNS propagation..."
sleep 15

PROD_URL="https://www.fly2any.com"
echo ""
echo "Testing: $PROD_URL"
echo ""

if curl -sS -I "$PROD_URL" -m 10 | head -1 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Production is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify (may still be propagating)${NC}"
fi
echo ""

# Success summary
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ✅ DEPLOYMENT SUCCESSFUL         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📋 Next Steps:${NC}"
echo ""
echo "1. 🌐 Visit: $PROD_URL"
echo "2. ✅ Test critical features (see PRODUCTION_TEST_CHECKLIST.md)"
echo "3. 📊 Monitor: https://vercel.com/$TEAM/$PROJECT"
echo ""
echo -e "${YELLOW}🔄 Rollback if needed:${NC}"
echo "   vercel rollback --scope=$TEAM"
echo ""
echo -e "${GREEN}All done! 🎉${NC}"
echo ""
