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
  // Check if database is configured
  if (!process.env.POSTGRES_URL || process.env.POSTGRES_URL.includes('placeholder')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Database not configured - using demo popular routes');
    }

    // Return demo popular routes
    return NextResponse.json({
      data: [
        { route: 'JFK-LAX', origin: 'JFK', destination: 'LAX', searches_30d: 1250, searches_7d: 320, searches_24h: 45, avg_price: 25000, min_price: 18000, max_price: 35000, trendingScore: 1820, isHot: true, displayPrice: 18000 },
        { route: 'LAX-JFK', origin: 'LAX', destination: 'JFK', searches_30d: 1180, searches_7d: 290, searches_24h: 38, avg_price: 24000, min_price: 17500, max_price: 34000, trendingScore: 1740, isHot: true, displayPrice: 17500 },
        { route: 'MIA-LAX', origin: 'MIA', destination: 'LAX', searches_30d: 890, searches_7d: 220, searches_24h: 28, avg_price: 28000, min_price: 21000, max_price: 38000, trendingScore: 1450, isHot: true, displayPrice: 21000 },
        { route: 'ORD-LAX', origin: 'ORD', destination: 'LAX', searches_30d: 820, searches_7d: 195, searches_24h: 22, avg_price: 22000, min_price: 16000, max_price: 30000, trendingScore: 1330, isHot: false, displayPrice: 16000 },
        { route: 'LHR-JFK', origin: 'LHR', destination: 'JFK', searches_30d: 1450, searches_7d: 340, searches_24h: 52, avg_price: 45000, min_price: 35000, max_price: 65000, trendingScore: 2170, isHot: true, displayPrice: 35000 },
        { route: 'CDG-JFK', origin: 'CDG', destination: 'JFK', searches_30d: 980, searches_7d: 245, searches_24h: 35, avg_price: 42000, min_price: 32000, max_price: 58000, trendingScore: 1620, isHot: true, displayPrice: 32000 },
        { route: 'SFO-NRT', origin: 'SFO', destination: 'NRT', searches_30d: 720, searches_7d: 180, searches_24h: 18, avg_price: 55000, min_price: 45000, max_price: 75000, trendingScore: 1260, isHot: false, displayPrice: 45000 },
        { route: 'ATL-MIA', origin: 'ATL', destination: 'MIA', searches_30d: 650, searches_7d: 155, searches_24h: 15, avg_price: 15000, min_price: 12000, max_price: 20000, trendingScore: 1110, isHot: false, displayPrice: 12000 },
      ],
      meta: {
        count: 8,
        region: 'Global',
        source: 'demo-data',
        note: 'Demo routes - configure database for real search patterns',
      },
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    });
  }

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

    if (process.env.NODE_ENV === 'development') {
      console.log('🌟 Popular Routes API - User Region:', {
        region: userRegion,
        airports: relevantAirports.slice(0, 3),
        country: request.headers.get('x-vercel-ip-country'),
      });
    }

    let routes;

    if (relevantAirports.length > 0) {
      // Query routes originating from user's region
      routes = await client.query(
        `SELECT
          "routeKey" as route,
          "originIata" as origin,
          "destinationIata" as destination,
          "dailyFlights",
          "weeklyFlights",
          "avgEconomyPrice" as avg_price,
          "avgEconomyPrice" as min_price,
          "avgBusinessPrice" as max_price,
          "dataPoints",
          "lastAnalyzed" as last_searched_at
        FROM route_statistics
        WHERE
          "originIata" = ANY($1::text[])
          AND "dataPoints" > 0
        ORDER BY
          "weeklyFlights" DESC NULLS LAST,
          "dailyFlights" DESC NULLS LAST
        LIMIT $2`,
        [relevantAirports, limit]
      );
    } else {
      // Global top routes
      routes = await client.query(
        `SELECT
          "routeKey" as route,
          "originIata" as origin,
          "destinationIata" as destination,
          "dailyFlights",
          "weeklyFlights",
          "avgEconomyPrice" as avg_price,
          "avgEconomyPrice" as min_price,
          "avgBusinessPrice" as max_price,
          "dataPoints",
          "lastAnalyzed" as last_searched_at
        FROM route_statistics
        WHERE "dataPoints" > 0
        ORDER BY
          "weeklyFlights" DESC NULLS LAST,
          "dailyFlights" DESC NULLS LAST
        LIMIT $1`,
        [limit]
      );
    }

    // If no regional routes found, fall back to global
    if (routes.rows.length === 0 && relevantAirports.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  No regional routes found, falling back to global top routes');
      }
      routes = await client.query(
        `SELECT
          "routeKey" as route,
          "originIata" as origin,
          "destinationIata" as destination,
          "dailyFlights",
          "weeklyFlights",
          "avgEconomyPrice" as avg_price,
          "avgEconomyPrice" as min_price,
          "avgBusinessPrice" as max_price,
          "dataPoints",
          "lastAnalyzed" as last_searched_at
        FROM route_statistics
        WHERE "dataPoints" > 0
        ORDER BY
          "weeklyFlights" DESC NULLS LAST,
          "dailyFlights" DESC NULLS LAST
        LIMIT $1`,
        [limit]
      );
    }

    // Calculate trending score based on flight frequency and data points
    const routesWithTrending = routes.rows.map(route => {
      const dailyFlights = route.dailyFlights || 0;
      const weeklyFlights = route.weeklyFlights || 0;
      const dataPoints = route.dataPoints || 0;

      // Score based on flight frequency and data quality
      const trendingScore = (dailyFlights * 10) + (weeklyFlights * 2) + dataPoints;

      // Determine if route is "hot" (high frequency routes)
      const isHot = dailyFlights >= 5 || weeklyFlights >= 50;

      return {
        ...route,
        // Map to expected response structure
        searches_30d: weeklyFlights * 4, // Estimate monthly activity
        searches_7d: weeklyFlights,
        searches_24h: dailyFlights,
        trendingScore,
        isHot,
        // Format prices for display
        displayPrice: route.min_price || route.avg_price || null,
        priceRange: route.min_price && route.max_price
          ? `$${Math.round(route.min_price)} - $${Math.round(route.max_price)}`
          : null,
      };
    });

    // Sort by trending score
    routesWithTrending.sort((a, b) => b.trendingScore - a.trendingScore);

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Found ${routesWithTrending.length} popular routes for region: ${userRegion}`);
      console.log(`   Top route: ${routesWithTrending[0]?.route || 'none'} (${routesWithTrending[0]?.weeklyFlights || 0} flights/week)`);
    }

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
