/**
 * TripMatch Database Migration Script
 *
 * Applies the TripMatch schema to the production database.
 * Run with: npx tsx scripts/apply-tripmatch-migration.ts
 */

import { sql } from '../lib/db/connection';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  console.log('🚀 Starting TripMatch database migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../lib/db/migrations/001_tripmatch_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Read migration file: 001_tripmatch_schema.sql');
    console.log(`   Size: ${migrationSQL.length} characters\n`);

    // Split into individual statements (separated by semicolons)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add semicolon back

      // Extract statement type for logging
      const statementType = statement.split(/\s+/)[0].toUpperCase();
      const tableName = extractTableName(statement);

      try {
        await sql.unsafe(statement);
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] ${statementType} ${tableName || ''}`);
      } catch (error: any) {
        // If table/function already exists, skip
        if (error.message.includes('already exists')) {
          skipCount++;
          console.log(`⏭️  [${i + 1}/${statements.length}] ${statementType} ${tableName || ''} (already exists)`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Failed: ${statementType} ${tableName || ''}`);
          console.error(`   Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log(`   Executed: ${successCount} statements`);
    console.log(`   Skipped:  ${skipCount} statements (already exist)`);
    console.log(`   Total:    ${statements.length} statements`);
    console.log('='.repeat(60) + '\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');

    const tables = [
      'user_credits',
      'credit_transactions',
      'trip_groups',
      'trip_components',
      'group_members',
      'member_customizations',
      'group_bookings',
      'trip_posts',
      'post_reactions',
      'post_comments',
      'trip_messages',
      'tripmatch_user_profiles',
      'trip_reviews',
    ];

    for (const table of tables) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = ${table}
        )
      `;

      if (result[0].exists) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' NOT FOUND`);
      }
    }

    console.log('\n🎉 TripMatch database schema is ready!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

function extractTableName(statement: string): string {
  // Extract table name from CREATE TABLE, CREATE INDEX, etc.
  const match = statement.match(/(?:TABLE|INDEX|FUNCTION|TRIGGER)\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_]+)/i);
  return match ? match[1] : '';
}

// Run migration
applyMigration()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
