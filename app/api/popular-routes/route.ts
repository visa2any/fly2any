import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Mark as dynamic (uses request headers for geo-detection)
export const dynamic = 'force-dynamic';

/**
 * 🌟 POPULAR ROUTES API
 *
 * Returns trending routes based on user location and search patterns.
 * Zero API cost - uses existing route_statistics table.
 *
 * Strategy: Show routes relevant to user's region with recent search activity
 */

// Map IP regions to major airports (simplified version)
const REGION_AIRPORTS: { [key: string]: string[] } = {
  'US-East': ['JFK', 'EWR', 'BOS', 'MIA', 'ATL', 'PHL', 'BWI', 'DCA'],
  'US-West': ['LAX', 'SFO', 'SEA', 'LAS', 'SAN', 'PDX', 'SJC'],
  'US-Central': ['ORD', 'DFW', 'DEN', 'IAH', 'MSP', 'DTW', 'STL'],
  'US-South': ['MIA', 'ATL', 'IAH', 'DFW', 'MCO', 'FLL', 'TPA'],
  'Europe': ['LHR', 'CDG', 'AMS', 'FRA', 'MAD', 'FCO', 'BCN'],
  'Asia': ['HKG', 'SIN', 'NRT', 'ICN', 'BKK', 'DXB', 'PVG'],
  'Global': [], // Will show overall top routes
};

function getUserRegion(request: NextRequest): string {
  // Get Vercel geolocation headers
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const city = request.headers.get('x-vercel-ip-city') || '';
  const latitude = parseFloat(request.headers.get('x-vercel-ip-latitude') || '0');
  const longitude = parseFloat(request.headers.get('x-vercel-ip-longitude') || '0');

  // US region detection
  if (country === 'US') {
    // West Coast
    if (longitude < -115) return 'US-West';
    // East Coast
    if (longitude > -85) return 'US-East';
    // South (latitude < 35)
    if (latitude < 35) return 'US-South';
    // Central
    return 'US-Central';
  }

  // European countries
  if (['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'PT'].includes(country)) {
    return 'Europe';
  }

  // Asian countries
  if (['CN', 'JP', 'KR', 'SG', 'HK', 'TH', 'MY', 'PH', 'VN', 'ID'].includes(country)) {
    return 'Asia';
  }

  return 'Global';
}

export async function GET(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 8;

    // Detect user region
    const userRegion = getUserRegion(request);
    const relevantAirports = REGION_AIRPORTS[userRegion] || [];

    console.log('🌟 Popular Routes API - User Region:', {
      region: userRegion,
      airports: relevantAirports.slice(0, 3),
      country: request.headers.get('x-vercel-ip-country'),
    });

    let routes;

    if (relevantAirports.length > 0) {
      // Query routes originating from user's region
      routes = await client.query(
        `SELECT
          route,
          origin,
          destination,
          searches_30d,
          searches_7d,
          searches_24h,
          avg_price,
          min_price,
          max_price,
          conversion_rate,
          last_searched_at
        FROM route_statistics
        WHERE
          origin = ANY($1::text[])
          AND searches_7d > 0
        ORDER BY
          searches_7d DESC,
          searches_30d DESC
        LIMIT $2`,
        [relevantAirports, limit]
      );
    } else {
      // Global top routes
      routes = await client.query(
        `SELECT
          route,
          origin,
          destination,
          searches_30d,
          searches_7d,
          searches_24h,
          avg_price,
          min_price,
          max_price,
          conversion_rate,
          last_searched_at
        FROM route_statistics
        WHERE searches_7d > 0
        ORDER BY
          searches_30d DESC,
          searches_7d DESC
        LIMIT $1`,
        [limit]
      );
    }

    // If no regional routes found, fall back to global
    if (routes.rows.length === 0 && relevantAirports.length > 0) {
      console.log('⚠️  No regional routes found, falling back to global top routes');
      routes = await client.query(
        `SELECT
          route,
          origin,
          destination,
          searches_30d,
          searches_7d,
          searches_24h,
          avg_price,
          min_price,
          max_price,
          conversion_rate,
          last_searched_at
        FROM route_statistics
        WHERE searches_7d > 0
        ORDER BY
          searches_30d DESC,
          searches_7d DESC
        LIMIT $1`,
        [limit]
      );
    }

    // Calculate trending score (higher weight for recent searches)
    const routesWithTrending = routes.rows.map(route => {
      const searches_24h = route.searches_24h || 0;
      const searches_7d = route.searches_7d || 0;
      const searches_30d = route.searches_30d || 0;

      const trendingScore = (searches_24h * 10) + (searches_7d * 2) + searches_30d;

      // Determine if route is "hot" (rising searches)
      const isHot = searches_24h > 0 && searches_7d > searches_30d / 4;

      return {
        ...route,
        trendingScore,
        isHot,
        // Format prices for display
        displayPrice: route.min_price || route.avg_price || null,
        priceRange: route.min_price && route.max_price
          ? `$${route.min_price} - $${route.max_price}`
          : null,
      };
    });

    // Sort by trending score
    routesWithTrending.sort((a, b) => b.trendingScore - a.trendingScore);

    console.log(`✅ Found ${routesWithTrending.length} popular routes for region: ${userRegion}`);
    console.log(`   Top route: ${routesWithTrending[0]?.route || 'none'} (${routesWithTrending[0]?.searches_7d || 0} searches/week)`);

    await client.end();

    return NextResponse.json({
      data: routesWithTrending,
      meta: {
        count: routesWithTrending.length,
        region: userRegion,
        source: 'route-statistics',
        note: 'Routes based on real user search patterns',
      },
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5min cache
      },
    });

  } catch (error: any) {
    console.error('❌ Error fetching popular routes:', error);

    // Make sure to close connection on error
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }

    return NextResponse.json({
      data: [],
      meta: {
        count: 0,
        error: error.message,
        note: 'Failed to fetch popular routes',
      },
    }, { status: 500 });
  }
}
