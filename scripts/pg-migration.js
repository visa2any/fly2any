#!/usr/bin/env node
/**
 * PostgreSQL Migration - Flight Search Analytics
 *
 * Uses traditional pg client for reliable DDL execution
 */

const dotenv = require('dotenv');
const path = require('path');
const { Client } = require('pg');
const fs = require('fs');

// Load environment
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  console.log('🚀 Starting PostgreSQL Migration...\n');

  // Create client
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    // Connect
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../lib/db/migrations/001_flight_search_analytics.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executing migration SQL...\n');

    // Execute the migration
    await client.query(migrationSQL);

    console.log('✅ Migration SQL executed!\n');

    // Verify tables
    console.log('🧪 Verifying tables...\n');

    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('flight_search_logs', 'route_statistics', 'calendar_cache_coverage')
      ORDER BY table_name
    `);

    const tables = tablesResult.rows;

    if (tables.length === 3) {
      console.log('✅ All 3 tables created successfully:');
      tables.forEach(t => console.log(`   ✅ ${t.table_name}`));
    } else {
      console.log(`⚠️  Only ${tables.length}/3 tables found:`);
      tables.forEach(t => console.log(`   ✅ ${t.table_name}`));
    }

    // Verify views
    console.log('\n🧪 Verifying views...\n');

    const viewsResult = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name IN ('v_popular_routes_cache_coverage', 'v_cache_gaps')
      ORDER BY table_name
    `);

    const views = viewsResult.rows;

    if (views.length === 2) {
      console.log('✅ All 2 views created successfully:');
      views.forEach(v => console.log(`   ✅ ${v.table_name}`));
    } else {
      console.log(`⚠️  Only ${views.length}/2 views found:`);
      views.forEach(v => console.log(`   ✅ ${v.table_name}`));
    }

    // Verify trigger function
    console.log('\n🧪 Verifying trigger function...\n');

    const functionsResult = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'update_route_statistics'
    `);

    const functions = functionsResult.rows;

    if (functions.length > 0) {
      console.log('✅ Trigger function created successfully:');
      console.log('   ✅ update_route_statistics()');
    } else {
      console.log('❌ Trigger function not found');
    }

    // Test with sample data
    console.log('\n🧪 Testing with sample data...\n');

    const insertResult = await client.query(`
      INSERT INTO flight_search_logs (
        origin, destination, departure_date,
        adults, results_count, lowest_price, currency
      ) VALUES (
        'JFK', 'MIA', CURRENT_DATE + INTERVAL '30 days',
        1, 10, 9900, 'USD'
      ) RETURNING id, route
    `);

    console.log('✅ Sample search logged:', insertResult.rows[0]);

    // Verify trigger worked
    const statsResult = await client.query(`
      SELECT route, searches_30d, searches_7d, searches_24h
      FROM route_statistics
      WHERE route = 'JFK-MIA'
    `);

    if (statsResult.rows.length > 0) {
      console.log('✅ Auto-trigger worked! Route statistics updated:', statsResult.rows[0]);
    } else {
      console.log('⚠️  Trigger may not be active - no route statistics found');
    }

    // Clean up test data
    await client.query(`DELETE FROM flight_search_logs WHERE origin = 'JFK' AND destination = 'MIA'`);
    await client.query(`DELETE FROM route_statistics WHERE route = 'JFK-MIA'`);

    console.log('✅ Test data cleaned up\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Zero-Cost Calendar Database Setup Complete!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 Database Statistics:');
    console.log(`   Tables: ${tables.length}/3`);
    console.log(`   Views: ${views.length}/2`);
    console.log(`   Functions: ${functions.length}/1`);
    console.log('');

    console.log('📌 Next steps:');
    console.log('   1. Deploy your application');
    console.log('   2. Flight searches will automatically populate the calendar');
    console.log('   3. Monitor route_statistics for popular routes');
    console.log('   4. Check calendar_cache_coverage for data coverage');
    console.log('');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    // Always disconnect
    await client.end();
    console.log('👋 Disconnected from database');
  }
}

runMigration()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
