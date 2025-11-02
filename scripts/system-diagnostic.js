const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function diagnostic() {
  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();

  console.log('\n🔍 ZERO-COST CALENDAR SYSTEM - DIAGNOSTIC REPORT\n');
  console.log('='.repeat(70));

  // Check recent searches
  const searches = await client.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
      MAX(created_at) as latest
    FROM flight_search_logs
  `);

  console.log('\n📊 FLIGHT SEARCH LOGS:');
  console.log(`   Total searches logged: ${searches.rows[0].total}`);
  console.log(`   Last 24 hours: ${searches.rows[0].last_24h}`);
  console.log(`   Latest search: ${searches.rows[0].latest || 'None'}`);

  // Check cache coverage
  const cache = await client.query(`
    SELECT
      COUNT(*) as total_entries,
      COUNT(*) FILTER (WHERE expires_at > NOW()) as active_entries,
      COUNT(DISTINCT route) as routes_covered,
      MIN(date) as earliest_date,
      MAX(date) as latest_date
    FROM calendar_cache_coverage
  `);

  console.log('\n📅 CALENDAR CACHE COVERAGE:');
  console.log(`   Total cache entries: ${cache.rows[0].total_entries}`);
  console.log(`   Active (not expired): ${cache.rows[0].active_entries}`);
  console.log(`   Routes with data: ${cache.rows[0].routes_covered}`);
  console.log(`   Date range: ${cache.rows[0].earliest_date} to ${cache.rows[0].latest_date}`);

  // Top routes
  const routes = await client.query(`
    SELECT
      route,
      searches_30d,
      searches_7d,
      avg_price / 100.0 as avg_price_dollars,
      last_searched_at
    FROM route_statistics
    ORDER BY searches_30d DESC
    LIMIT 5
  `);

  console.log('\n🔥 TOP 5 ROUTES (Last 30 Days):');
  if (routes.rows.length === 0) {
    console.log('   (No routes yet - system needs more searches)');
  } else {
    routes.rows.forEach((r, i) => {
      const price = r.avg_price_dollars ? `$${r.avg_price_dollars.toFixed(2)}` : 'N/A';
      console.log(`   ${i+1}. ${r.route}: ${r.searches_30d} searches (${r.searches_7d} last week), Avg ${price}`);
    });
  }

  // Sample of recent cached prices
  const recentPrices = await client.query(`
    SELECT
      route,
      date,
      cached_price / 100.0 as price_dollars,
      cache_source,
      cached_at,
      expires_at
    FROM calendar_cache_coverage
    WHERE cached_price IS NOT NULL
    ORDER BY cached_at DESC
    LIMIT 5
  `);

  console.log('\n💰 RECENT CACHED PRICES:');
  if (recentPrices.rows.length === 0) {
    console.log('   (No prices cached yet)');
  } else {
    recentPrices.rows.forEach((p, i) => {
      const expires = new Date(p.expires_at) > new Date() ? '✅ Valid' : '❌ Expired';
      const price = p.price_dollars ? `$${Number(p.price_dollars).toFixed(2)}` : 'N/A';
      console.log(`   ${i+1}. ${p.route} on ${p.date}: ${price} [${expires}]`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ SYSTEM STATUS: All tables exist and operational!');
  console.log('💡 TIP: System needs user searches to populate calendar data\n');

  await client.end();
}

diagnostic().catch(console.error);
