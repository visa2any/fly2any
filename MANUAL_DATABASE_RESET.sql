-- =============================================
-- COMPLETE DATABASE RESET SCRIPT
-- =============================================
-- WARNING: This will delete ALL data in your database!
-- Only run this on development/testing databases!
--
-- How to execute:
-- 1. Go to https://console.neon.tech
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Copy/paste this entire script
-- 5. Click "Run"
-- 6. Then run: npx prisma db push
-- =============================================

-- Drop all existing tables (cascade will drop dependent objects)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Now run: npx prisma db push
-- This will create all tables from your Prisma schema
