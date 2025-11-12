/**
 * Add TripMatch Credits Columns to Users Table
 *
 * This script adds the TripMatch credit fields to the existing users table
 * Run with: npx tsx scripts/add-user-credits-columns.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCreditsColumns() {
  console.log('🚀 Adding TripMatch Credits columns to users table...\n');

  try {
    console.log('📝 Step 1: Adding columns...');

    // Use raw SQL to add columns with IF NOT EXISTS to avoid errors if columns exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "tripMatchCredits" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "tripMatchLifetimeEarned" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "tripMatchLifetimeSpent" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "tripMatchPendingCredits" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "tripMatchTier" TEXT,
      ADD COLUMN IF NOT EXISTS "tripMatchBonusMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
    `);

    console.log('✅ Columns added successfully!\n');

    console.log('📝 Step 2: Creating indexes...');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "users_tripMatchTier_idx" ON "users"("tripMatchTier");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "users_tripMatchCredits_idx" ON "users"("tripMatchCredits");
    `);

    console.log('✅ Indexes created successfully!\n');

    console.log('📝 Step 3: Verifying columns...');

    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name LIKE 'tripMatch%'
      ORDER BY column_name;
    `) as any[];

    console.log('\n📊 TripMatch Columns in users table:');
    console.log('─'.repeat(80));
    result.forEach((col: any) => {
      console.log(`✓ ${col.column_name}`);
      console.log(`  Type: ${col.data_type}`);
      console.log(`  Default: ${col.column_default || 'NULL'}`);
      console.log(`  Nullable: ${col.is_nullable}`);
      console.log('');
    });

    if (result.length === 6) {
      console.log('🎉 Migration Complete! All 6 TripMatch columns added successfully.\n');
      console.log('Next steps:');
      console.log('1. Run: npx prisma generate');
      console.log('2. Restart your development server');
      console.log('3. Visit /tripmatch to test the implementation\n');
    } else {
      console.log(`⚠️  Warning: Expected 6 columns but found ${result.length}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error instanceof Error) {
      console.error('\nError details:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addCreditsColumns();
