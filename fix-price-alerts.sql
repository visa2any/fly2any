-- Fix price_alerts table to match Prisma schema
ALTER TABLE price_alerts
  ADD COLUMN IF NOT EXISTS "departDate" TEXT,
  ADD COLUMN IF NOT EXISTS "returnDate" TEXT,
  ADD COLUMN IF NOT EXISTS "currentPrice" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "targetPrice" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "triggered" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lastChecked" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "triggeredAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "triggeredPrice" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "lastNotifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "notificationCount" INTEGER DEFAULT 0;

-- Update any NULL values to defaults
UPDATE price_alerts SET "departDate" = '2025-01-01' WHERE "departDate" IS NULL;
UPDATE price_alerts SET "currentPrice" = 0 WHERE "currentPrice" IS NULL;
UPDATE price_alerts SET "targetPrice" = 0 WHERE "targetPrice" IS NULL;
