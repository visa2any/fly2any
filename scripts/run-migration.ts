/**
 * TripMatch Database Migration Runner
 *
 * Runs the TripMatch schema migration to create all necessary tables
 *
 * Usage: npx tsx scripts/run-migration.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Create SQL connection directly
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set!');
  console.error('Please make sure .env.local file exists with DATABASE_URL');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('🚀 Starting TripMatch database migration...\n');
  console.log(`📡 Connected to database: ${DATABASE_URL!.substring(0, 50)}...\n`);

  try {
    // Read the schema file
    const schemaPath = join(process.cwd(), 'lib', 'db', 'migrations', '001_tripmatch_schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('📖 Read schema file successfully');
    console.log(`📝 Schema size: ${schema.length} characters\n`);

    // Split by semicolons to execute statements individually
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`🔧 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Extract table name from CREATE TABLE statements for logging
      const tableMatch = statement.match(/CREATE TABLE.*IF NOT EXISTS\s+(\w+)/i);
      const indexMatch = statement.match(/CREATE INDEX.*\s+ON\s+(\w+)/i);

      let logMessage = `[${i + 1}/${statements.length}]`;
      if (tableMatch) {
        logMessage += ` Creating table: ${tableMatch[1]}`;
      } else if (indexMatch) {
        logMessage += ` Creating index on: ${indexMatch[1]}`;
      } else {
        logMessage += ` Executing statement`;
      }

      console.log(logMessage);

      try {
        // Create tagged template literal for Neon serverless
        const sqlTemplate: any = [statement + ';'];
        sqlTemplate.raw = sqlTemplate;
        await sql(sqlTemplate);
      } catch (error: any) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('🎉 All TripMatch tables and indexes have been created.\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
runMigration();
