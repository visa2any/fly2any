import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';

// Force dynamic rendering for nextUrl.searchParams usage
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Hotel Location Suggestions API Route
 *
 * GET /api/hotels/suggestions?query=Paris&radius=10
 *
 * Search for location suggestions for hotel search autocomplete.
 * Returns cities, hotels, landmarks, airports, and neighborhoods.
 *
 * Used for:
 * - Search autocomplete
 * - Location picker
 * - Destination suggestions
 *
 * Response is cached for 1 hour (locations don't change frequently).
 *
 * Query Parameters:
 * - query: Search query (e.g., "Paris", "Hilton London", "CDG Airport")
 * - radius: Search radius in km (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate required parameters
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Missing required parameter: query' },
        { status: 400 }
      );
    }

    // Minimum 2 characters for search
    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Optional radius parameter
    const radius = searchParams.get('radius');
    const radiusKm = radius ? parseInt(radius) : undefined;

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:duffel:suggestions', {
      query,
      radius: radiusKm,
    });

    // Try to get from cache (1 hour TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached suggestions for "${query}"`);
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=3600', // 1 hour
        }
      });
    }

    // Fetch suggestions from Duffel Stays API
    console.log(`🔍 Fetching location suggestions for "${query}"...`);
    const suggestions = await duffelStaysAPI.getAccommodationSuggestions(query, radiusKm);

    // Store in cache (1 hour TTL)
    await setCache(cacheKey, suggestions, 3600);

    return NextResponse.json(suggestions, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error: any) {
    console.error('❌ Hotel suggestions error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch suggestions',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Note: Using Node.js runtime (not edge) because Duffel SDK requires Node.js APIs
// export const runtime = 'edge';
