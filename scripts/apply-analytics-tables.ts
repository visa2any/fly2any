/**
 * Apply Analytics Tables Migration
 *
 * This script creates the missing analytics tables:
 * - flight_search_logs
 * - route_statistics
 * - calendar_cache_coverage
 *
 * Run with: npx tsx scripts/apply-analytics-tables.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function applyMigration() {
  console.log('🚀 Applying analytics tables migration...\n');

  try {
    // 1. Create flight_search_logs table
    console.log('📊 Creating flight_search_logs table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS flight_search_logs (
        id SERIAL PRIMARY KEY,
        origin VARCHAR(3) NOT NULL,
        destination VARCHAR(3) NOT NULL,
        departure_date DATE NOT NULL,
        return_date DATE,
        is_round_trip BOOLEAN DEFAULT false,
        adults INT DEFAULT 1,
        children INT DEFAULT 0,
        infants INT DEFAULT 0,
        cabin_class VARCHAR(20),
        non_stop BOOLEAN DEFAULT false,
        results_count INT DEFAULT 0,
        lowest_price INT,
        highest_price INT,
        avg_price INT,
        currency VARCHAR(3) DEFAULT 'USD',
        amadeus_results INT DEFAULT 0,
        duffel_results INT DEFAULT 0,
        api_response_time_ms INT,
        cache_hit BOOLEAN DEFAULT false,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        ip_hash VARCHAR(64),
        browser_fingerprint VARCHAR(32),
        user_agent TEXT,
        referer TEXT,
        country_code VARCHAR(2),
        region VARCHAR(100),
        timezone VARCHAR(50),
        converted BOOLEAN DEFAULT false,
        booked_flight_id VARCHAR(255),
        booking_id VARCHAR(255),
        time_to_book_seconds INT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ flight_search_logs table created\n');

    // Create indexes for flight_search_logs
    console.log('📊 Creating indexes for flight_search_logs...');
    const flightSearchIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_flight_search_logs_route ON flight_search_logs(origin, destination)',
      'CREATE INDEX IF NOT EXISTS idx_flight_search_logs_departure ON flight_search_logs(departure_date)',
      'CREATE INDEX IF NOT EXISTS idx_flight_search_logs_user ON flight_search_logs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_flight_search_logs_session ON flight_search_logs(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_flight_search_logs_created ON flight_search_logs(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_flight_search_logs_converted ON flight_search_logs(converted)',
    ];
    for (const sql of flightSearchIndexes) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✅ flight_search_logs indexes created\n');

    // 2. Create route_statistics table
    console.log('📊 Creating route_statistics table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS route_statistics (
        id SERIAL PRIMARY KEY,
        route VARCHAR(10) UNIQUE NOT NULL,
        origin VARCHAR(3) NOT NULL,
        destination VARCHAR(3) NOT NULL,
        searches_30d INT DEFAULT 0,
        searches_7d INT DEFAULT 0,
        searches_24h INT DEFAULT 0,
        avg_price INT DEFAULT 0,
        min_price INT,
        max_price INT,
        currency VARCHAR(3) DEFAULT 'USD',
        conversions_30d INT DEFAULT 0,
        conversion_rate DECIMAL(5,4) DEFAULT 0.0000,
        cache_priority INT DEFAULT 0,
        recommended_ttl_seconds INT DEFAULT 900,
        volatility_score DECIMAL(3,2) DEFAULT 1.00,
        last_searched_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ route_statistics table created\n');

    // Create indexes for route_statistics
    console.log('📊 Creating indexes for route_statistics...');
    const routeStatsIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_route_statistics_route ON route_statistics(route)',
      'CREATE INDEX IF NOT EXISTS idx_route_statistics_origin ON route_statistics(origin)',
      'CREATE INDEX IF NOT EXISTS idx_route_statistics_destination ON route_statistics(destination)',
      'CREATE INDEX IF NOT EXISTS idx_route_statistics_searches_7d ON route_statistics(searches_7d DESC)',
      'CREATE INDEX IF NOT EXISTS idx_route_statistics_priority ON route_statistics(cache_priority DESC)',
    ];
    for (const sql of routeStatsIndexes) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✅ route_statistics indexes created\n');

    // 3. Create calendar_cache_coverage table
    console.log('📊 Creating calendar_cache_coverage table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS calendar_cache_coverage (
        id SERIAL PRIMARY KEY,
        route VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        has_cache BOOLEAN DEFAULT false,
        cache_source VARCHAR(20) DEFAULT 'user-search',
        cached_price INT,
        cached_at TIMESTAMP,
        expires_at TIMESTAMP,
        ttl_seconds INT,
        searches_count INT DEFAULT 0,
        last_accessed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(route, date)
      )
    `);
    console.log('✅ calendar_cache_coverage table created\n');

    // Create indexes for calendar_cache_coverage
    console.log('📊 Creating indexes for calendar_cache_coverage...');
    const calendarCacheIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_calendar_cache_route ON calendar_cache_coverage(route)',
      'CREATE INDEX IF NOT EXISTS idx_calendar_cache_date ON calendar_cache_coverage(date)',
      'CREATE INDEX IF NOT EXISTS idx_calendar_cache_route_date ON calendar_cache_coverage(route, date)',
      'CREATE INDEX IF NOT EXISTS idx_calendar_cache_has_cache ON calendar_cache_coverage(has_cache)',
      'CREATE INDEX IF NOT EXISTS idx_calendar_cache_expires ON calendar_cache_coverage(expires_at)',
    ];
    for (const sql of calendarCacheIndexes) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('✅ calendar_cache_coverage indexes created\n');

    // Add table comments
    console.log('📊 Adding table comments...');
    await prisma.$executeRawUnsafe(`COMMENT ON TABLE flight_search_logs IS 'Logs every flight search for analytics, ML, and cache optimization'`);
    await prisma.$executeRawUnsafe(`COMMENT ON TABLE route_statistics IS 'Aggregated statistics per route for cache priority and optimization'`);
    await prisma.$executeRawUnsafe(`COMMENT ON TABLE calendar_cache_coverage IS 'Tracks which dates have cached prices for calendar view'`);
    console.log('✅ Table comments added\n');

    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('flight_search_logs', 'route_statistics', 'calendar_cache_coverage')
    `;

    console.log(`✅ Found ${tables.length} tables:`, tables.map(t => t.table_name).join(', '));

    console.log('\n🎉 Migration completed successfully!');
    console.log('   All analytics tables are now available.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
applyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
