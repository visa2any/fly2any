-- TripMatch Phase 2: Add missing columns and Referrals table
-- This migration adds the missing columns to existing tables and creates the Referrals table

-- 1. Add missing columns to trip_groups table
ALTER TABLE "trip_groups"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "duration" INTEGER,
  ADD COLUMN IF NOT EXISTS "highlights" TEXT[],
  ADD COLUMN IF NOT EXISTS "included" TEXT[],
  ADD COLUMN IF NOT EXISTS "booking_deadline" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancellation_policy" TEXT,
  ADD COLUMN IF NOT EXISTS "difficulty" TEXT,
  ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "applications" INTEGER DEFAULT 0;

-- 2. Add missing columns to group_members table
ALTER TABLE "group_members"
  ADD COLUMN IF NOT EXISTS "payment_status" TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "payment_intent_id" TEXT,
  ADD COLUMN IF NOT EXISTS "amount_paid" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "customizations" JSONB;

-- 3. Create Referrals table
CREATE TABLE IF NOT EXISTS "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referee_id" TEXT,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reward_paid" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- 4. Create CreditTransactions table (uses snake_case to match existing pattern)
CREATE TABLE IF NOT EXISTS "credit_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- 5. Create unique indexes for referrals
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_code_key" ON "referrals"("code");

-- 6. Create indexes for referrals
CREATE INDEX IF NOT EXISTS "referrals_referrer_id_idx" ON "referrals"("referrer_id");
CREATE INDEX IF NOT EXISTS "referrals_referee_id_idx" ON "referrals"("referee_id");
CREATE INDEX IF NOT EXISTS "referrals_code_idx" ON "referrals"("code");
CREATE INDEX IF NOT EXISTS "referrals_status_idx" ON "referrals"("status");

-- 7. Create indexes for credit_transactions
CREATE INDEX IF NOT EXISTS "credit_transactions_user_id_created_at_idx" ON "credit_transactions"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "credit_transactions_type_created_at_idx" ON "credit_transactions"("type", "created_at");
CREATE INDEX IF NOT EXISTS "credit_transactions_status_idx" ON "credit_transactions"("status");

-- 8. Update trip_groups with default values for new required columns
UPDATE "trip_groups"
SET
  "slug" = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE "slug" IS NULL;

UPDATE "trip_groups"
SET "duration" = EXTRACT(DAY FROM (end_date - start_date))::INTEGER + 1
WHERE "duration" IS NULL;

UPDATE "trip_groups"
SET "highlights" = ARRAY[]::TEXT[]
WHERE "highlights" IS NULL;

UPDATE "trip_groups"
SET "included" = ARRAY[]::TEXT[]
WHERE "included" IS NULL;

-- 9. Make slug column NOT NULL after populating
ALTER TABLE "trip_groups"
  ALTER COLUMN "slug" SET NOT NULL;

-- 10. Create unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS "trip_groups_slug_key" ON "trip_groups"("slug");

-- 11. Update group_members foreign key name
ALTER TABLE "group_members"
  RENAME COLUMN "trip_id" TO "trip_group_id";

-- 12. Create unique constraint for trip membership
CREATE UNIQUE INDEX IF NOT EXISTS "group_members_trip_group_id_user_id_key" ON "group_members"("trip_group_id", "user_id");
