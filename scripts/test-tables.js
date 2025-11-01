#!/usr/bin/env node
const dotenv = require('dotenv');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const sql = neon(process.env.POSTGRES_URL);

async function testTables() {
  console.log('🧪 Testing if tables were created...\n');

  try {
    // Test by trying to count rows in each table
    const tables = ['flight_search_logs', 'route_statistics', 'calendar_cache_coverage'];

    // Test flight_search_logs
    try {
      const result1 = await sql`SELECT COUNT(*) as count FROM flight_search_logs`;
      console.log(`✅ flight_search_logs: EXISTS (${result1[0].count} rows)`);
    } catch (error) {
      console.log(`❌ flight_search_logs: NOT FOUND - ${error.message}`);
    }

    // Test route_statistics
    try {
      const result2 = await sql`SELECT COUNT(*) as count FROM route_statistics`;
      console.log(`✅ route_statistics: EXISTS (${result2[0].count} rows)`);
    } catch (error) {
      console.log(`❌ route_statistics: NOT FOUND - ${error.message}`);
    }

    // Test calendar_cache_coverage
    try {
      const result3 = await sql`SELECT COUNT(*) as count FROM calendar_cache_coverage`;
      console.log(`✅ calendar_cache_coverage: EXISTS (${result3[0].count} rows)`);
    } catch (error) {
      console.log(`❌ calendar_cache_coverage: NOT FOUND - ${error.message}`);
    }

    console.log('\n🧪 Testing views...\n');

    // Test v_popular_routes_cache_coverage
    try {
      const result4 = await sql`SELECT COUNT(*) as count FROM v_popular_routes_cache_coverage`;
      console.log(`✅ v_popular_routes_cache_coverage: EXISTS (${result4[0].count} rows)`);
    } catch (error) {
      console.log(`❌ v_popular_routes_cache_coverage: NOT FOUND - ${error.message}`);
    }

    // Test v_cache_gaps
    try {
      const result5 = await sql`SELECT COUNT(*) as count FROM v_cache_gaps`;
      console.log(`✅ v_cache_gaps: EXISTS (${result5[0].count} rows)`);
    } catch (error) {
      console.log(`❌ v_cache_gaps: NOT FOUND - ${error.message}`);
    }

    console.log('\n✅ Table verification complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testTables();
