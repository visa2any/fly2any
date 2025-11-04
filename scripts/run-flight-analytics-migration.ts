#!/usr/bin/env ts-node
/**
 * Database Migration Runner - Flight Search Analytics
 *
 * This script creates the zero-cost calendar system tables in Neon PostgreSQL:
 * - flight_search_logs: Every flight search for analytics
 * - route_statistics: Aggregated route popularity metrics
 * - calendar_cache_coverage: Track which dates have cached prices
 *
 * Run with: npx tsx scripts/run-flight-analytics-migration.ts
 */

import { sql } from '../lib/db/connection';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  console.log('🚀 Starting flight search analytics migration...\n');

  if (!sql) {
    console.error('❌ Database not configured. Please check your DATABASE_URL environment variable.');
    process.exit(1);
  }

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../lib/db/migrations/001_flight_search_analytics.sql');
    console.log('📄 Reading migration file:', migrationPath);

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Remove comments but keep the SQL
    let cleanSQL = migrationSQL
      // Remove single-line comments (-- to end of line)
      .replace(/^--.*$/gm, '')
      // Remove multi-line comments (/* ... */)
      .replace(/\/\*[\s\S]*?\*\//g, '');

    // Split by semicolons (but handle functions with $$ properly)
    // First, protect function bodies that use $$
    const functionBlocks: string[] = [];
    cleanSQL = cleanSQL.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
      const placeholder = `__FUNCTION_BLOCK_${functionBlocks.length}__`;
      functionBlocks.push(match);
      return placeholder;
    });

    // Now split by semicolons
    let statements = cleanSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Restore function blocks
    statements = statements.map(stmt => {
      functionBlocks.forEach((block, i) => {
        stmt = stmt.replace(`__FUNCTION_BLOCK_${i}__`, block);
      });
      return stmt;
    });

    console.log(`\n📊 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Extract the first line for logging (table/function name)
      const firstLine = statement.split('\n')[0].substring(0, 80);
      console.log(`[${i + 1}/${statements.length}] Executing: ${firstLine}...`);

      try {
        // Execute statement using Neon's tagged template literal
        // Note: We use unsafe raw query here for DDL statements
        await sql.unsafe(statement);
        successCount++;
        console.log(`  ✅ Success\n`);
      } catch (error: any) {
        // Check if error is "already exists" - that's okay, skip it
        if (
          error.message?.includes('already exists') ||
          error.message?.includes('duplicate key')
        ) {
          skipCount++;
          console.log(`  ⏭️  Already exists, skipping\n`);
        } else {
          console.error(`  ❌ Error:`, error.message);
          console.error(`  Statement:`, statement.substring(0, 200));
          throw error;
        }
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Migration completed successfully!`);
    console.log(`   - ${successCount} statements executed`);
    console.log(`   - ${skipCount} statements skipped (already exist)`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Test the tables by running a simple query
    console.log('🧪 Testing tables...\n');

    const tables = ['flight_search_logs', 'route_statistics', 'calendar_cache_coverage'];
    for (const table of tables) {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_name = ${table}
      `;
      const exists = parseInt(result[0].count) > 0;
      console.log(`  ${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    }

    // Test the views
    console.log('\n🧪 Testing views...\n');
    const views = ['v_popular_routes_cache_coverage', 'v_cache_gaps'];
    for (const view of views) {
      const result = await sql`
        SELECT COUNT(*) as count
        FROM information_schema.views
        WHERE table_name = ${view}
      `;
      const exists = parseInt(result[0].count) > 0;
      console.log(`  ${exists ? '✅' : '❌'} ${view}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    }

    // Test the trigger function
    console.log('\n🧪 Testing trigger function...\n');
    const functionResult = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.routines
      WHERE routine_name = 'update_route_statistics'
    `;
    const functionExists = parseInt(functionResult[0].count) > 0;
    console.log(`  ${functionExists ? '✅' : '❌'} update_route_statistics(): ${functionExists ? 'EXISTS' : 'NOT FOUND'}`);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 Zero-cost calendar system is ready!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📌 Next steps:');
    console.log('   1. Deploy your application to start collecting search data');
    console.log('   2. Monitor route_statistics to see popular routes');
    console.log('   3. Check calendar_cache_coverage to track calendar completeness');
    console.log('   4. Use v_cache_gaps view to identify routes needing more searches\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Check database connection before running
if (!sql) {
  console.error('❌ Database not configured. Please check your DATABASE_URL environment variable.');
  process.exit(1);
}

// Run the migration
runMigration()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
