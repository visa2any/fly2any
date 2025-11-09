-- AlterTable: Add role column to users table
-- This migration adds a role field to support admin access control

-- Add role column with default value 'user'
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

-- Create index on role for faster queries
CREATE INDEX "users_role_idx" ON "users"("role");

-- Add comment for documentation
COMMENT ON COLUMN "users"."role" IS 'User role: user or admin';
