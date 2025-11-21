/**
 * Verify Migration Status
 * Check if the trip_group_id column exists in group_members table
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file
const envPath = join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

async function verifyMigration() {
  try {
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL not configured');
      process.exit(1);
    }

    console.log('🔍 Connecting to database...\n');
    const sql = neon(process.env.POSTGRES_URL);

    // Check columns in group_members table
    console.log('📊 Checking group_members table columns:\n');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'group_members'
      ORDER BY ordinal_position
    `;

    console.log('Columns found:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Check if trip_group_id exists
    const hasTripGroupId = columns.some(col => col.column_name === 'trip_group_id');
    const hasTripId = columns.some(col => col.column_name === 'trip_id');

    console.log('\n📋 Migration Status:');
    console.log(`  trip_id column: ${hasTripId ? '❌ STILL EXISTS (needs rename)' : '✅ Removed'}`);
    console.log(`  trip_group_id column: ${hasTripGroupId ? '✅ EXISTS' : '❌ MISSING (migration failed)'}`);

    if (!hasTripGroupId) {
      console.log('\n⚠️  MIGRATION FAILED - trip_group_id column does not exist');
      console.log('Need to execute migration properly.');
    } else {
      console.log('\n✅ Migration successful!');
    }

    process.exit(hasTripGroupId ? 0 : 1);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyMigration();
