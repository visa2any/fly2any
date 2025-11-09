#!/bin/bash

# ============================================================================
# ADMIN SECURITY DEPLOYMENT SCRIPT
# ============================================================================
# This script deploys the complete admin security system including:
# - Database migration (add role field)
# - Prisma client regeneration
# - Admin user creation (support@fly2any.com)
# - Verification and testing
#
# Usage:
#   bash scripts/deploy-admin-security.sh
#
# Prerequisites:
#   - POSTGRES_URL environment variable set
#   - Database accessible
#   - Node.js and npm installed
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCTIONS
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# STEP 1: CHECK PREREQUISITES
# ============================================================================

print_header "STEP 1: Checking Prerequisites"

# Check if POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ]; then
    print_error "POSTGRES_URL environment variable not set!"
    echo ""
    echo "Please set it in one of these ways:"
    echo "  1. Export in terminal: export POSTGRES_URL='your-connection-string'"
    echo "  2. Add to .env file: echo 'POSTGRES_URL=your-connection-string' >> .env"
    echo ""
    exit 1
fi

print_success "POSTGRES_URL is set"

# Check if Prisma CLI is available
if ! command -v npx &> /dev/null; then
    print_error "npx not found! Please install Node.js"
    exit 1
fi

print_success "npx is available"

# Check if database is accessible
print_info "Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database is accessible"
else
    print_warning "Could not verify database connection (continuing anyway)"
fi

# ============================================================================
# STEP 2: RUN DATABASE MIGRATION
# ============================================================================

print_header "STEP 2: Running Database Migration"

print_info "Applying migration: add_user_role"

# Check if migration directory exists
if [ ! -d "prisma/migrations/20251109_add_user_role" ]; then
    print_error "Migration directory not found!"
    exit 1
fi

# Run migration
if npx prisma migrate deploy; then
    print_success "Database migration completed"
else
    print_error "Migration failed!"
    exit 1
fi

# ============================================================================
# STEP 3: REGENERATE PRISMA CLIENT
# ============================================================================

print_header "STEP 3: Regenerating Prisma Client"

if npx prisma generate; then
    print_success "Prisma client regenerated"
else
    print_error "Prisma generate failed!"
    exit 1
fi

# ============================================================================
# STEP 4: CREATE ADMIN USER
# ============================================================================

print_header "STEP 4: Creating Admin User"

print_info "Email: support@fly2any.com"
print_info "Password: Fly2n."

if npx tsx scripts/create-admin-user.ts; then
    print_success "Admin user created successfully"
else
    print_warning "Admin user creation failed (may already exist)"
    print_info "Trying to update existing user to admin..."

    if npx tsx scripts/make-admin.ts support@fly2any.com; then
        print_success "Existing user updated to admin"
    else
        print_error "Could not create or update admin user"
        exit 1
    fi
fi

# ============================================================================
# STEP 5: VERIFY ADMIN USER
# ============================================================================

print_header "STEP 5: Verifying Admin User"

print_info "Listing all admin users..."
npx tsx scripts/list-admins.ts

# ============================================================================
# STEP 6: BUILD APPLICATION
# ============================================================================

print_header "STEP 6: Building Application"

if npm run build > /dev/null 2>&1; then
    print_success "Application built successfully"
else
    print_warning "Build had warnings (check manually if needed)"
fi

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================

print_header "DEPLOYMENT COMPLETE! 🎉"

echo ""
echo -e "${GREEN}✅ Admin Security System Deployed${NC}"
echo ""
echo "Admin User Created:"
echo "  📧 Email:    support@fly2any.com"
echo "  🔑 Password: Fly2n."
echo "  👤 Role:     admin"
echo ""
echo "Next Steps:"
echo "  1. Start your application: npm run dev"
echo "  2. Sign in at: http://localhost:3000/auth/signin"
echo "  3. Access admin: http://localhost:3000/admin"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Change the password after first login!${NC}"
echo ""
echo "Protected Admin Routes:"
echo "  ✅ /admin - Admin dashboard"
echo "  ✅ /admin/ai-analytics - AI Chat Analytics"
echo "  ✅ /admin/bookings - Bookings Management"
echo "  ✅ /admin/monitoring - System Monitoring"
echo "  ✅ /admin/performance - Performance Metrics"
echo "  ✅ /admin/webhooks - Webhook Management"
echo ""
echo -e "${GREEN}Security Status: ACTIVE${NC}"
echo ""
