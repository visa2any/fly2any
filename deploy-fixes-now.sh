#!/bin/bash

# Script to merge emergency fixes to production
# This will deploy all React hydration fixes and Stripe fixes to www.fly2any.com

set -e  # Exit on any error

echo "=========================================="
echo "🚀 DEPLOYING EMERGENCY FIXES TO PRODUCTION"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Ensure we're in the right directory
echo -e "${BLUE}Step 1: Checking directory...${NC}"
cd /home/user/fly2any
pwd
echo ""

# Step 2: Fetch latest changes
echo -e "${BLUE}Step 2: Fetching latest changes from GitHub...${NC}"
git fetch --all
echo -e "${GREEN}✓ Fetched latest changes${NC}"
echo ""

# Step 3: Update feature branch
echo -e "${BLUE}Step 3: Updating feature branch...${NC}"
git checkout claude/check-last-git-011CUsN6S19DuosnAQfZnY4P
git pull origin claude/check-last-git-011CUsN6S19DuosnAQfZnY4P
echo -e "${GREEN}✓ Feature branch updated${NC}"
echo ""

# Step 4: Switch to main and update
echo -e "${BLUE}Step 4: Switching to main branch...${NC}"
git checkout main
git pull origin main
echo -e "${GREEN}✓ Main branch updated${NC}"
echo ""

# Step 5: Attempt merge
echo -e "${BLUE}Step 5: Merging feature branch into main...${NC}"
if git merge claude/check-last-git-011CUsN6S19DuosnAQfZnY4P --no-edit; then
    echo -e "${GREEN}✓ Merge completed successfully (no conflicts)${NC}"
else
    echo -e "${YELLOW}⚠ Merge conflict detected - resolving automatically...${NC}"

    # Check if app/account/page.tsx has conflict
    if git diff --name-only --diff-filter=U | grep -q "app/account/page.tsx"; then
        echo -e "${YELLOW}  Resolving conflict in app/account/page.tsx...${NC}"

        # Read the file and resolve the conflict by keeping the correct version
        cat > /tmp/account-page-fix.txt << 'ENDFIX'
        (prisma as any).aIConversation?.count({
          where: { userId: session.user.id },
        }) ?? Promise.resolve(0)
ENDFIX

        # Use sed to replace the conflict section
        # This finds the conflict markers and replaces with the correct code
        awk '
        /^<<<<<<< HEAD/ { skip=1; next }
        /^=======/ { if (skip) { getline; while (!/^>>>>>>>/) getline; skip=0;
            print "        (prisma as any).aIConversation?.count({";
            print "          where: { userId: session.user.id },";
            print "        }) ?? Promise.resolve(0)";
            next
        }}
        /^>>>>>>>/ { next }
        !skip { print }
        ' app/account/page.tsx > /tmp/account-page-resolved.tsx

        mv /tmp/account-page-resolved.tsx app/account/page.tsx

        # Stage the resolved file
        git add app/account/page.tsx

        # Complete the merge
        git commit -m "Merge emergency fixes to production

- Fix all React hydration errors (#425, #418, #423)
- Fix Stripe integration empty string error
- Fix logo display configuration
- Complete Phase 5 E2E booking flow
- Resolve merge conflict by accepting type-safe Prisma fix"

        echo -e "${GREEN}✓ Conflict resolved and committed${NC}"
    else
        echo -e "${RED}✗ Unexpected conflict - manual intervention needed${NC}"
        exit 1
    fi
fi
echo ""

# Step 6: Show what will be pushed
echo -e "${BLUE}Step 6: Commits ready to push:${NC}"
git log origin/main..HEAD --oneline | head -5
echo ""

# Step 7: Push to main
echo -e "${YELLOW}⏳ Pushing to main branch (this will trigger Vercel deployment)...${NC}"
echo ""
if git push origin main; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "✓ SUCCESS! DEPLOYED TO PRODUCTION"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${GREEN}Your fixes are now deploying to production!${NC}"
    echo ""
    echo -e "Vercel is building now. Check deployment status:"
    echo -e "${BLUE}https://vercel.com/visa2any/fly2any/deployments${NC}"
    echo ""
    echo -e "In 2-3 minutes, check your site:"
    echo -e "${BLUE}https://www.fly2any.com/home-new${NC}"
    echo ""
    echo -e "${GREEN}Expected fixes:${NC}"
    echo "  ✓ Logo displays properly"
    echo "  ✓ No React hydration errors in console"
    echo "  ✓ Stripe integration works"
    echo "  ✓ All components render correctly"
    echo ""
else
    echo ""
    echo -e "${RED}=========================================="
    echo -e "✗ PUSH FAILED"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${YELLOW}The merge is complete locally, but push to GitHub failed.${NC}"
    echo ""
    echo "Possible causes:"
    echo "  1. Network connection issue"
    echo "  2. GitHub permissions issue"
    echo "  3. Branch protection rules"
    echo ""
    echo "To retry manually:"
    echo -e "${BLUE}  git push origin main${NC}"
    echo ""
    exit 1
fi

# Step 8: Switch back to feature branch
echo -e "${BLUE}Switching back to feature branch...${NC}"
git checkout claude/check-last-git-011CUsN6S19DuosnAQfZnY4P
echo ""

echo -e "${GREEN}🎉 DEPLOYMENT SCRIPT COMPLETE!${NC}"
echo ""
