-- Migration: Fix all TypeScript type errors
-- This migration adds all missing fields identified in the type checking process

-- ============================================
-- AgentBooking: Add missing fields
-- ============================================
ALTER TABLE "agent_bookings" ADD COLUMN IF NOT EXISTS "bookingNumber" TEXT;
ALTER TABLE "agent_bookings" ADD COLUMN IF NOT EXISTS "bookingReference" TEXT;
ALTER TABLE "agent_bookings" ADD COLUMN IF NOT EXISTS "commission" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "agent_bookings" ADD COLUMN IF NOT EXISTS "totalPrice" DOUBLE PRECISION;

-- Update totalPrice to match total for existing records
UPDATE "agent_bookings" SET "totalPrice" = "total" WHERE "totalPrice" IS NULL;
UPDATE "agent_bookings" SET "bookingNumber" = "confirmationNumber" WHERE "bookingNumber" IS NULL;
UPDATE "agent_bookings" SET "bookingReference" = "confirmationNumber" WHERE "bookingReference" IS NULL;

-- ============================================
-- AgentPayout: Add missing payoutNumber
-- ============================================
ALTER TABLE "agent_payouts" ADD COLUMN IF NOT EXISTS "payoutNumber" TEXT UNIQUE;

-- Generate payout numbers for existing records
UPDATE "agent_payouts"
SET "payoutNumber" = 'PO-' || TO_CHAR(created_at, 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE "payoutNumber" IS NULL;

-- ============================================
-- AgentQuote: Add notes field (alias for agentNotes)
-- ============================================
ALTER TABLE "agent_quotes" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Copy agentNotes to notes for existing records
UPDATE "agent_quotes" SET "notes" = "agentNotes" WHERE "notes" IS NULL;

-- ============================================
-- AgentCommission: Add releasedAt field
-- ============================================
ALTER TABLE "agent_commissions" ADD COLUMN IF NOT EXISTS "releasedAt" TIMESTAMP(3);

-- ============================================
-- TravelAgent: Add missing fields
-- ============================================
ALTER TABLE "travel_agents" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "travel_agents" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "travel_agents" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "travel_agents" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "travel_agents" ADD COLUMN IF NOT EXISTS "company" TEXT;
ALTER TABLE "travel_agents" ADD COLUMN IF NOT EXISTS "businessName" TEXT;
ALTER TABLE "travel_agents" ADD COLUMN IF NOT EXISTS "availableBalance" DOUBLE PRECISION DEFAULT 0;

-- Copy from related user and existing fields
UPDATE "travel_agents" ta
SET "email" = u.email,
    "firstName" = COALESCE(u."firstName", SPLIT_PART(u.name, ' ', 1)),
    "lastName" = COALESCE(u."lastName", SPLIT_PART(u.name, ' ', 2)),
    "phone" = COALESCE(ta."phoneNumber", u.phone),
    "company" = COALESCE(ta."agencyName"),
    "businessName" = COALESCE(ta."agencyName"),
    "availableBalance" = COALESCE(ta."currentBalance", 0)
FROM users u
WHERE ta."userId" = u.id AND ta.email IS NULL;

-- ============================================
-- AffiliateReferral: Add completedAt field
-- ============================================
ALTER TABLE "affiliate_referrals" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- Set completedAt for completed referrals
UPDATE "affiliate_referrals"
SET "completedAt" = "convertedAt"
WHERE status = 'completed' AND "completedAt" IS NULL;

-- ============================================
-- RecentSearch: Add createdAt field
-- ============================================
ALTER TABLE "recent_searches" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Set createdAt to viewedAt for existing records
UPDATE "recent_searches" SET "createdAt" = "viewedAt" WHERE "createdAt" IS NULL;

-- ============================================
-- TripGroup: Add isActive and name fields
-- ============================================
ALTER TABLE "TripGroup" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "TripGroup" ADD COLUMN IF NOT EXISTS "name" TEXT;

-- Copy title to name for existing records
UPDATE "TripGroup" SET "name" = "title" WHERE "name" IS NULL;

-- Set isActive based on status
UPDATE "TripGroup"
SET "isActive" = CASE
  WHEN status IN ('published', 'full') THEN true
  ELSE false
END
WHERE "isActive" IS NULL;

-- ============================================
-- Create AgentProduct and AgentSupplier tables
-- ============================================
CREATE TABLE IF NOT EXISTS "agent_products" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "agentId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "type" TEXT NOT NULL DEFAULT 'service',
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sellPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "stock" INTEGER,
    "minOrder" INTEGER DEFAULT 1,
    "maxOrder" INTEGER,
    "imageUrl" TEXT,
    "externalId" TEXT,
    "sku" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_products_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE,
    CONSTRAINT "agent_products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "agent_suppliers"("id") ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS "agent_suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "paymentTerms" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_suppliers_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "travel_agents"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "agent_products_agentId_idx" ON "agent_products"("agentId");
CREATE INDEX IF NOT EXISTS "agent_products_supplierId_idx" ON "agent_products"("supplierId");
CREATE INDEX IF NOT EXISTS "agent_products_isActive_idx" ON "agent_products"("isActive");
CREATE INDEX IF NOT EXISTS "agent_suppliers_agentId_idx" ON "agent_suppliers"("agentId");

-- ============================================
-- Add Commission fields (for referral system)
-- ============================================
ALTER TABLE "commissions" ADD COLUMN IF NOT EXISTS "releasedAt" TIMESTAMP(3);

-- ============================================
-- UserPreferences: Add notifications field
-- ============================================
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "notifications" JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb;
