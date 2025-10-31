/**
 * Run Webhook Events Migration
 * Creates the webhook_events table in the database
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

const sql = neon(process.env.POSTGRES_URL!);

async function runMigration() {
  try {
    console.log('🚀 Starting webhook events migration...\n');

    // Read migration file
    const migrationPath = join(__dirname, '..', 'lib', 'db', 'migrations', '002_webhook_events.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Executing migration SQL...');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('CREATE TABLE') ||
          statement.includes('CREATE INDEX') ||
          statement.includes('CREATE TRIGGER') ||
          statement.includes('CREATE OR REPLACE FUNCTION') ||
          statement.includes('COMMENT ON')) {
        await sql([statement] as any);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      }
    }

    console.log('\n✨ Migration completed successfully!\n');
    console.log('📊 Webhook events table is ready to use.');
    console.log('🔗 You can now configure your Duffel webhook endpoint.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
