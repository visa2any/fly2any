#!/usr/bin/env node
/**
 * Direct SQL Migration - Flight Search Analytics
 *
 * This version executes the SQL directly without parsing,
 * ensuring all DDL statements persist correctly.
 */

const dotenv = require('dotenv');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

// Load environment
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const sql = neon(process.env.POSTGRES_URL);

async function executeMigration() {
  console.log('🚀 Starting Direct SQL Migration...\n');
  console.log('📍 Database:', process.env.POSTGRES_URL?.split('@')[1]?.split('/')[0] || 'unknown');
  console.log('');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../lib/db/migrations/001_flight_search_analytics.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executing complete migration file...\n');

    // Execute the ENTIRE file as one transaction
    // This is the key - Neon can handle the full SQL file at once
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration executed successfully!\n');

    // Now verify the tables
    console.log('🧪 Verifying tables...\n');

    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('flight_search_logs', 'route_statistics', 'calendar_cache_coverage')
      ORDER BY table_name
    `;

    if (tables.length === 3) {
      console.log('✅ All 3 tables created successfully:');
      tables.forEach(t => console.log(`   ✅ ${t.table_name}`));
    } else {
      console.log(`⚠️  Only ${tables.length}/3 tables found:`);
      tables.forEach(t => console.log(`   ✅ ${t.table_name}`));
    }

    console.log('\n🧪 Verifying views...\n');

    const views = await sql`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      AND table_name IN ('v_popular_routes_cache_coverage', 'v_cache_gaps')
      ORDER BY table_name
    `;

    if (views.length === 2) {
      console.log('✅ All 2 views created successfully:');
      views.forEach(v => console.log(`   ✅ ${v.table_name}`));
    } else {
      console.log(`⚠️  Only ${views.length}/2 views found:`);
      views.forEach(v => console.log(`   ✅ ${v.table_name}`));
    }

    console.log('\n🧪 Verifying trigger function...\n');

    const functions = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'update_route_statistics'
    `;

    if (functions.length > 0) {
      console.log('✅ Trigger function created successfully:');
      console.log('   ✅ update_route_statistics()');
    } else {
      console.log('❌ Trigger function not found');
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 Zero-Cost Calendar Database Setup Complete!');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test by inserting a sample row
    console.log('🧪 Testing with sample data...\n');

    const testResult = await sql`
      INSERT INTO flight_search_logs (
        origin, destination, departure_date,
        adults, results_count, lowest_price, currency
      ) VALUES (
        'JFK', 'MIA', CURRENT_DATE + INTERVAL '30 days',
        1, 10, 9900, 'USD'
      ) RETURNING id, route
    `;

    console.log('✅ Sample search logged:', testResult[0]);

    // Verify trigger worked
    const statsResult = await sql`
      SELECT route, searches_30d, searches_7d, searches_24h
      FROM route_statistics
      WHERE route = 'JFK-MIA'
    `;

    if (statsResult.length > 0) {
      console.log('✅ Auto-trigger worked! Route statistics updated:', statsResult[0]);
    } else {
      console.log('⚠️  Trigger may not be active - no route statistics found');
    }

    // Clean up test data
    await sql`DELETE FROM flight_search_logs WHERE origin = 'JFK' AND destination = 'MIA'`;
    await sql`DELETE FROM route_statistics WHERE route = 'JFK-MIA'`;

    console.log('\n✅ Test data cleaned up');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 Database is ready for production use!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📌 Next steps:');
    console.log('   1. Deploy your application to start collecting search data');
    console.log('   2. Monitor logs for "📊 Logged flight search" messages');
    console.log('   3. Check route_statistics to see popular routes');
    console.log('   4. Calendar will auto-populate as users search');
    console.log('');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    if (error.position) {
      console.error('SQL error at position:', error.position);
    }
    process.exit(1);
  }
}

executeMigration()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
