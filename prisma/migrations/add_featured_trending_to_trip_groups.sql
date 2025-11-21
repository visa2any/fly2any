-- Migration: Add featured and trending columns to trip_groups table
-- Date: 2025-11-19
-- Purpose: Fix TripMatch API error "column tg.trending does not exist"

-- Add featured column
ALTER TABLE trip_groups
ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

-- Add trending column
ALTER TABLE trip_groups
ADD COLUMN IF NOT EXISTS trending BOOLEAN NOT NULL DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS trip_groups_featured_trending_idx ON trip_groups(featured, trending);

-- Comment for documentation
COMMENT ON COLUMN trip_groups.featured IS 'Featured trips highlighted on homepage';
COMMENT ON COLUMN trip_groups.trending IS 'Trending trips with high demand/popularity';

-- Optional: Set some existing trips as featured/trending for testing
-- UPDATE trip_groups SET featured = true WHERE views > 100;
-- UPDATE trip_groups SET trending = true WHERE applications > 5;
