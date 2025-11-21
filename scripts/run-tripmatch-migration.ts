/**
 * Run TripMatch Phase 2 Migration
 * This script executes the add_tripmatch_phase2.sql migration file
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local file
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function runMigration() {
  try {
    // Check if database is configured
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not configured');
      process.exit(1);
    }

    console.log('🔄 Connecting to database...');
    const sql = neon(process.env.POSTGRES_URL);

    console.log('🔄 Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'prisma', 'migrations', 'add_tripmatch_phase2.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🔄 Executing migration...');
    console.log('📝 Migration file: add_tripmatch_phase2.sql\n');

    // Split the SQL into individual statements and execute them
    // Neon's tagged template literals don't support multi-statement execution
    // So we need to execute raw SQL using the unsafe query method
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 80)}...`);
        await sql(statement);
      }
    }

    console.log('\n✅ Migration executed successfully!');
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
