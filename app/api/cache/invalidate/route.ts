import { NextRequest, NextResponse } from 'next/server';
import { deleteCache, deleteCachePattern } from '@/lib/cache/helpers';
import { getFlightSearchPattern, getRoutePattern } from '@/lib/cache/keys';

/**
 * POST /api/cache/invalidate
 * Invalidate cache by key or pattern
 *
 * Body options:
 * - key: Specific cache key to delete
 * - pattern: Redis pattern to match (e.g., "flight:search:*")
 * - route: Clear specific route (e.g., { origin: "JFK", destination: "LAX" })
 * - all: Clear all flight searches (boolean)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Option 1: Delete specific key
    if (body.key) {
      await deleteCache(body.key);
      return NextResponse.json({
        success: true,
        message: `Cache key "${body.key}" invalidated`,
      });
    }

    // Option 2: Delete by pattern
    if (body.pattern) {
      const deleted = await deleteCachePattern(body.pattern);
      return NextResponse.json({
        success: true,
        message: `${deleted} cache keys invalidated`,
        pattern: body.pattern,
        deleted,
      });
    }

    // Option 3: Clear specific route
    if (body.route && body.route.origin && body.route.destination) {
      const pattern = getRoutePattern(body.route.origin, body.route.destination);
      const deleted = await deleteCachePattern(pattern);
      return NextResponse.json({
        success: true,
        message: `Route ${body.route.origin} → ${body.route.destination} cache invalidated`,
        deleted,
      });
    }

    // Option 4: Clear all flight searches
    if (body.all === true) {
      const pattern = getFlightSearchPattern();
      const deleted = await deleteCachePattern(pattern);
      return NextResponse.json({
        success: true,
        message: 'All flight search cache invalidated',
        deleted,
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid request. Provide one of: key, pattern, route, or all',
        examples: {
          specific_key: { key: 'flight:search:JFK:LAX:2025-10-15:oneway:1:0:0:ECONOMY:any:USD' },
          pattern: { pattern: 'flight:search:JFK:*' },
          route: { route: { origin: 'JFK', destination: 'LAX' } },
          all: { all: true }
        }
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
