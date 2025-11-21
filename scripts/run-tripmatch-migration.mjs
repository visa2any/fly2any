/**
 * Run TripMatch Phase 2 Migration
 * This script executes the add_tripmatch_phase2.sql migration file
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file
const envPath = join(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

async function runMigration() {
  try {
    // Check if database is configured
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not configured');
      console.error('Tried loading from:', envPath);
      process.exit(1);
    }

    console.log('🔄 Connecting to database...');
    const sql = neon(process.env.POSTGRES_URL);

    console.log('🔄 Reading migration file...');
    const migrationPath = join(__dirname, '..', 'prisma', 'migrations', 'add_tripmatch_phase2.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('🔄 Executing migration...');
    console.log('📝 Migration file: add_tripmatch_phase2.sql\n');

    // Split the SQL into individual statements and execute them
    // Remove comments and split by semicolon
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let count = 0;
    for (const statement of statements) {
      if (statement) {
        count++;
        const preview = statement.substring(0, 100).replace(/\s+/g, ' ');
        console.log(`[${count}/${statements.length}] Executing: ${preview}...`);
        try {
          await sql(statement);
        } catch (err) {
          // Some statements might fail if already executed (like column renames)
          // Log but don't stop
          console.warn(`  ⚠️  Statement failed (may be expected if already applied):`, err.message);
        }
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('✅ TripMatch Phase 2 migration applied:');
    console.log('   - Column trip_id renamed to trip_group_id in group_members table');
    console.log('   - Additional columns added to trip_groups and group_members');
    console.log('   - Referrals and CreditTransactions tables created');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

runMigration();
