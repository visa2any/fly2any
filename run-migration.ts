import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Running TripMatch Phase 2 migration...\n');

    const execSQL = async (name: string, sql: string) => {
      try {
        await prisma.$executeRawUnsafe(sql);
        console.log(`✅ ${name}`);
        return true;
      } catch (error: any) {
        if (error.message.includes('already exists') || error.message.includes('duplicate') || error.message.includes('does not exist')) {
          console.log(`⏭️  ${name} - Already exists or not needed, skipping`);
          return false;
        }
        console.error(`❌ ${name} - Error:`, error.message);
        throw error;
      }
    };

    // Execute migrations in order
    console.log('📝 Step 1: Creating tables...');
    await execSQL('Create referrals table', `
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
    `);

    await execSQL('Create credit_transactions table', `
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
    `);

    console.log('\n📝 Step 2: Adding columns to trip_groups...');
    await execSQL('Add slug column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "slug" TEXT;`);
    await execSQL('Add duration column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "duration" INTEGER;`);
    await execSQL('Add highlights column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "highlights" TEXT[];`);
    await execSQL('Add included column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "included" TEXT[];`);
    await execSQL('Add booking_deadline column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "booking_deadline" TIMESTAMP(3);`);
    await execSQL('Add cancellation_policy column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "cancellation_policy" TEXT;`);
    await execSQL('Add difficulty column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "difficulty" TEXT;`);
    await execSQL('Add views column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "views" INTEGER DEFAULT 0;`);
    await execSQL('Add applications column', `ALTER TABLE "trip_groups" ADD COLUMN IF NOT EXISTS "applications" INTEGER DEFAULT 0;`);

    console.log('\n📝 Step 3: Adding columns to group_members...');
    await execSQL('Add payment_status column', `ALTER TABLE "group_members" ADD COLUMN IF NOT EXISTS "payment_status" TEXT DEFAULT 'pending';`);
    await execSQL('Add payment_intent_id column', `ALTER TABLE "group_members" ADD COLUMN IF NOT EXISTS "payment_intent_id" TEXT;`);
    await execSQL('Add amount_paid column', `ALTER TABLE "group_members" ADD COLUMN IF NOT EXISTS "amount_paid" DOUBLE PRECISION;`);
    await execSQL('Add paid_at column', `ALTER TABLE "group_members" ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3);`);
    await execSQL('Add customizations column', `ALTER TABLE "group_members" ADD COLUMN IF NOT EXISTS "customizations" JSONB;`);

    console.log('\n📝 Step 4: Updating data...');
    await execSQL('Generate slugs', `
      UPDATE "trip_groups"
      SET "slug" = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 8)
      WHERE "slug" IS NULL;
    `);
    await execSQL('Calculate duration', `
      UPDATE "trip_groups"
      SET "duration" = EXTRACT(DAY FROM (end_date - start_date))::INTEGER + 1
      WHERE "duration" IS NULL;
    `);
    await execSQL('Set default highlights', `UPDATE "trip_groups" SET "highlights" = ARRAY[]::TEXT[] WHERE "highlights" IS NULL;`);
    await execSQL('Set default included', `UPDATE "trip_groups" SET "included" = ARRAY[]::TEXT[] WHERE "included" IS NULL;`);

    console.log('\n📝 Step 5: Adding constraints and indexes...');
    await execSQL('Make slug NOT NULL', `ALTER TABLE "trip_groups" ALTER COLUMN "slug" SET NOT NULL;`);
    await execSQL('Create slug unique index', `CREATE UNIQUE INDEX IF NOT EXISTS "trip_groups_slug_key" ON "trip_groups"("slug");`);
    await execSQL('Create referrals code unique index', `CREATE UNIQUE INDEX IF NOT EXISTS "referrals_code_key" ON "referrals"("code");`);
    await execSQL('Create referrals referrer_id index', `CREATE INDEX IF NOT EXISTS "referrals_referrer_id_idx" ON "referrals"("referrer_id");`);
    await execSQL('Create referrals referee_id index', `CREATE INDEX IF NOT EXISTS "referrals_referee_id_idx" ON "referrals"("referee_id");`);
    await execSQL('Create referrals code index', `CREATE INDEX IF NOT EXISTS "referrals_code_idx" ON "referrals"("code");`);
    await execSQL('Create referrals status index', `CREATE INDEX IF NOT EXISTS "referrals_status_idx" ON "referrals"("status");`);
    await execSQL('Create credit_transactions user_id index', `CREATE INDEX IF NOT EXISTS "credit_transactions_user_id_created_at_idx" ON "credit_transactions"("user_id", "created_at");`);
    await execSQL('Create credit_transactions type index', `CREATE INDEX IF NOT EXISTS "credit_transactions_type_created_at_idx" ON "credit_transactions"("type", "created_at");`);
    await execSQL('Create credit_transactions status index', `CREATE INDEX IF NOT EXISTS "credit_transactions_status_idx" ON "credit_transactions"("status");`);

    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
