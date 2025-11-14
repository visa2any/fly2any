-- Manual Migration: Fix existing data conflicts
-- BACKUP YOUR DATABASE BEFORE RUNNING THIS!
-- This migration adds required columns with minimal defaults

-- =============================================
-- FIX: email_templates table (9 rows)
-- =============================================

ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS "key" TEXT;

ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS "body" TEXT;

ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS "variables" JSONB;

ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Update with simple defaults
UPDATE email_templates SET
  "key" = 'template_' || id
WHERE "key" IS NULL;

UPDATE email_templates SET
  "body" = 'Legacy template'
WHERE "body" IS NULL;

UPDATE email_templates SET
  "variables" = '{}'::jsonb
WHERE "variables" IS NULL;

UPDATE email_templates SET
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "updatedAt" IS NULL;

-- Make required
ALTER TABLE email_templates ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE email_templates ALTER COLUMN "body" SET NOT NULL;
ALTER TABLE email_templates ALTER COLUMN "variables" SET NOT NULL;
ALTER TABLE email_templates ALTER COLUMN "updatedAt" SET NOT NULL;

-- =============================================
-- FIX: trip_groups table (20 rows)
-- =============================================

ALTER TABLE trip_groups ADD COLUMN IF NOT EXISTS "creatorId" TEXT;
ALTER TABLE trip_groups ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE trip_groups ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3);
ALTER TABLE trip_groups ADD COLUMN IF NOT EXISTS "estimatedPricePerPerson" INTEGER;
ALTER TABLE trip_groups ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- Update with defaults (get first user ID first)
DO $$
DECLARE first_user_id TEXT;
BEGIN
  SELECT id INTO first_user_id FROM users LIMIT 1;

  UPDATE trip_groups SET "creatorId" = first_user_id WHERE "creatorId" IS NULL;
  UPDATE trip_groups SET "startDate" = CURRENT_TIMESTAMP WHERE "startDate" IS NULL;
  UPDATE trip_groups SET "endDate" = CURRENT_TIMESTAMP + INTERVAL '7 days' WHERE "endDate" IS NULL;
  UPDATE trip_groups SET "estimatedPricePerPerson" = 500 WHERE "estimatedPricePerPerson" IS NULL;
  UPDATE trip_groups SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
  UPDATE trip_groups SET "duration" = 7 WHERE "duration" IS NULL;
END $$;

-- Make required
ALTER TABLE trip_groups ALTER COLUMN "creatorId" SET NOT NULL;
ALTER TABLE trip_groups ALTER COLUMN "startDate" SET NOT NULL;
ALTER TABLE trip_groups ALTER COLUMN "endDate" SET NOT NULL;
ALTER TABLE trip_groups ALTER COLUMN "estimatedPricePerPerson" SET NOT NULL;
ALTER TABLE trip_groups ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE trip_groups ALTER COLUMN "duration" SET NOT NULL;

-- =============================================
-- FIX: group_members table (20 rows)
-- =============================================

ALTER TABLE group_members ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS "tripGroupId" TEXT;

-- Update with defaults
DO $$
DECLARE first_user_id TEXT;
DECLARE first_trip_id TEXT;
BEGIN
  SELECT id INTO first_user_id FROM users LIMIT 1;
  SELECT id INTO first_trip_id FROM trip_groups LIMIT 1;

  UPDATE group_members SET "userId" = first_user_id WHERE "userId" IS NULL;
  UPDATE group_members SET "tripGroupId" = first_trip_id WHERE "tripGroupId" IS NULL;
END $$;

-- Make required
ALTER TABLE group_members ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE group_members ALTER COLUMN "tripGroupId" SET NOT NULL;
