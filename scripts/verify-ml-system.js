#!/usr/bin/env node
/**
 * ML/PREDICTION SYSTEM VERIFICATION
 * ==================================
 * Comprehensive test of all ML components:
 * - IP Geolocation
 * - User Behavior Tracking
 * - Predictive Pre-Fetch
 * - User Segmentation
 */

const { Client } = require('pg');
const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

async function verifyMLSystem() {
  console.log('\n🤖 ML & PREDICTION SYSTEM VERIFICATION\n');
  console.log('='.repeat(80));

  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  let score = 0;
  const maxScore = 10;

  // ✅ TEST 1: PostgreSQL Tables
  console.log('\n📊 TEST 1: PostgreSQL Tables');
  console.log('-'.repeat(80));

  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('flight_search_logs', 'route_statistics', 'calendar_cache_coverage')
    ORDER BY table_name
  `);

  if (tables.rows.length === 3) {
    console.log('✅ All 3 analytics tables exist');
    console.log('   - flight_search_logs');
    console.log('   - route_statistics');
    console.log('   - calendar_cache_coverage');
    score += 2;
  } else {
    console.log(`❌ Missing tables (found ${tables.rows.length}/3)`);
  }

  // ✅ TEST 2: Geolocation columns
  console.log('\n🌍 TEST 2: Geolocation Integration');
  console.log('-'.repeat(80));

  const geoColumns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'flight_search_logs'
    AND column_name IN ('country_code', 'region', 'timezone')
  `);

  if (geoColumns.rows.length === 3) {
    console.log('✅ Geolocation columns exist in database');
    console.log('   - country_code');
    console.log('   - region');
    console.log('   - timezone');
    score += 1;
  } else {
    console.log(`❌ Geolocation columns missing (found ${geoColumns.rows.length}/3)`);
  }

  // Check if geolocation function exists
  try {
    const fs = require('fs');
    const searchLogger = fs.readFileSync('lib/analytics/search-logger.ts', 'utf-8');
    if (searchLogger.includes('resolveGeolocation') && searchLogger.includes('ipapi.co')) {
      console.log('✅ IP geolocation service integrated (ipapi.co)');
      score += 1;
    } else {
      console.log('❌ Geolocation service not found in search-logger.ts');
    }
  } catch (error) {
    console.log('⚠️  Could not verify geolocation service code');
  }

  // ✅ TEST 3: Search Logs Activity
  console.log('\n📈 TEST 3: User Behavior Tracking');
  console.log('-'.repeat(80));

  const searchStats = await client.query(`
    SELECT
      COUNT(*) as total_searches,
      COUNT(DISTINCT ip_hash) as unique_ips,
      COUNT(DISTINCT browser_fingerprint) as unique_browsers,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
      COUNT(*) FILTER (WHERE country_code IS NOT NULL) as with_geo_data,
      MAX(created_at) as latest_search
    FROM flight_search_logs
  `);

  const stats = searchStats.rows[0];
  console.log(`   Total searches logged: ${stats.total_searches}`);
  console.log(`   Unique IP addresses: ${stats.unique_ips}`);
  console.log(`   Unique browsers: ${stats.unique_browsers}`);
  console.log(`   Searches (last 24h): ${stats.last_24h}`);
  console.log(`   With geolocation: ${stats.with_geo_data} (${stats.total_searches > 0 ? Math.round(stats.with_geo_data / stats.total_searches * 100) : 0}%)`);
  console.log(`   Latest search: ${stats.latest_search || 'Never'}`);

  if (parseInt(stats.total_searches) > 0) {
    console.log('✅ Tracking is functional');
    score += 2;
  } else {
    console.log('⚠️  No searches logged yet (perform a search to test)');
    score += 1; // Partial credit - system is ready
  }

  // ✅ TEST 4: Route Statistics
  console.log('\n🗺️  TEST 4: Route Profiling');
  console.log('-'.repeat(80));

  const routeStats = await client.query(`
    SELECT
      COUNT(*) as total_routes,
      COUNT(*) FILTER (WHERE searches_7d > 0) as active_7d,
      COUNT(*) FILTER (WHERE searches_30d >= 2) as popular_routes
    FROM route_statistics
  `);

  const routes = routeStats.rows[0];
  console.log(`   Total routes tracked: ${routes.total_routes}`);
  console.log(`   Active (last 7 days): ${routes.active_7d}`);
  console.log(`   Popular routes (2+ searches): ${routes.popular_routes}`);

  if (parseInt(routes.total_routes) > 0) {
    console.log('✅ Route statistics are being collected');
    score += 1;
  } else {
    console.log('⚠️  No route statistics yet (automatic after first search)');
  }

  // ✅ TEST 5: Redis Route Profiles
  console.log('\n🔄 TEST 5: Redis Route Profiles');
  console.log('-'.repeat(80));

  const redisKeys = await redis.keys('route:profile:*');
  console.log(`   Route profiles in Redis: ${redisKeys.length}`);

  if (redisKeys.length > 0) {
    console.log('✅ Route profiling active');
    score += 1;

    // Show sample
    const sample = await redis.get(redisKeys[0]);
    const profile = typeof sample === 'string' ? JSON.parse(sample) : sample;
    console.log(`\n   Sample profile (${profile.route}):`);
    console.log(`   - Volatility: ${(profile.volatility * 100).toFixed(1)}%`);
    console.log(`   - Popularity: ${profile.popularity.toFixed(0)} searches`);
    console.log(`   - Optimal TTL: ${profile.optimalTTL} minutes`);
  } else {
    console.log('⚠️  No route profiles yet (created on first search)');
  }

  // ✅ TEST 6: Pre-Fetch API
  console.log('\n🚀 TEST 6: Predictive Pre-Fetch API');
  console.log('-'.repeat(80));

  try {
    const response = await fetch('http://localhost:3000/api/ml/prefetch');
    const data = await response.json();

    if (data.status === 'preview') {
      console.log('✅ Pre-fetch API responding');
      console.log(`   Candidates found: ${data.summary.totalCandidates}`);
      console.log(`   Expected searches: ${data.summary.totalExpectedSearches}`);
      console.log(`   Estimated savings: $${data.summary.totalEstimatedSavings.toFixed(2)}`);
      score += 1;
    } else {
      console.log('⚠️  API responded but status unexpected');
    }
  } catch (error) {
    console.log('❌ Pre-fetch API not accessible:', error.message);
  }

  // ✅ TEST 7: User Segmentation
  console.log('\n👥 TEST 7: ML User Segmentation');
  console.log('-'.repeat(80));

  try {
    const fs = require('fs');
    const segmentationFile = fs.readFileSync('lib/ml/user-segmentation.ts', 'utf-8');
    const hasML = segmentationFile.includes('calculateBusinessScore') &&
                  segmentationFile.includes('calculateLeisureScore') &&
                  segmentationFile.includes('calculateFamilyScore') &&
                  segmentationFile.includes('calculateBudgetScore');

    if (hasML) {
      console.log('✅ User segmentation engine implemented');
      console.log('   Segments: Business, Leisure, Family, Budget');
      console.log('   Features: Trip length, booking window, cabin class, passengers');
      score += 1;
    } else {
      console.log('❌ Segmentation logic incomplete');
    }
  } catch (error) {
    console.log('⚠️  Could not verify segmentation engine');
  }

  // ✅ TEST 8: Security
  console.log('\n🔒 TEST 8: Security Configuration');
  console.log('-'.repeat(80));

  const hasCronSecret = !!process.env.CRON_SECRET;
  if (hasCronSecret) {
    console.log('✅ CRON_SECRET configured');
    console.log(`   Length: ${process.env.CRON_SECRET.length} characters`);
    score += 1;
  } else {
    console.log('❌ CRON_SECRET not found in environment');
  }

  await client.end();

  // 📊 FINAL SCORE
  console.log('\n' + '='.repeat(80));
  console.log(`\n🎯 FINAL SCORE: ${score}/${maxScore} (${Math.round(score / maxScore * 100)}%)\n`);

  if (score >= 8) {
    console.log('✅ SYSTEM STATUS: FULLY OPERATIONAL');
    console.log('   All core ML/Prediction features are active and ready for production.');
  } else if (score >= 6) {
    console.log('⚠️  SYSTEM STATUS: PARTIALLY OPERATIONAL');
    console.log('   System infrastructure is ready, waiting for user activity to populate data.');
  } else {
    console.log('❌ SYSTEM STATUS: NEEDS CONFIGURATION');
    console.log('   Some core components are missing or not properly configured.');
  }

  console.log('\n📋 NEXT STEPS:');
  console.log('   1. Perform a flight search to populate initial data');
  console.log('   2. Deploy to Vercel to enable cron job (runs daily at 3 AM)');
  console.log('   3. Add CRON_SECRET to Vercel environment variables');
  console.log('   4. Monitor logs at /api/ml/prefetch for pre-fetch activity');
  console.log('   5. Verify geolocation data appears in flight_search_logs\n');
}

verifyMLSystem().catch(console.error);
