-- Manual Migration: Add TripMatch Credit Fields to User Table
-- Run this SQL directly against your PostgreSQL database

-- Add TripMatch credit tracking columns
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "tripMatchCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tripMatchLifetimeEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tripMatchLifetimeSpent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tripMatchPendingCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "tripMatchTier" TEXT,
ADD COLUMN IF NOT EXISTS "tripMatchBonusMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "users_tripMatchTier_idx" ON "users"("tripMatchTier");
CREATE INDEX IF NOT EXISTS "users_tripMatchCredits_idx" ON "users"("tripMatchCredits");

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name LIKE 'tripMatch%'
ORDER BY column_name;
