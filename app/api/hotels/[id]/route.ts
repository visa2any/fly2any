import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';

/**
 * Hotel Details API Route
 *
 * GET /api/hotels/[id]
 *
 * Fetch detailed information about a specific hotel including:
 * - Complete property details
 * - All available rooms and rates
 * - Photos and images
 * - Amenities and facilities
 * - Reviews and ratings
 * - Location and map data
 * - Cancellation policies
 *
 * Response is cached for 30 minutes to reduce API calls.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accommodationId = params.id;

    if (!accommodationId) {
      return NextResponse.json(
        { error: 'Missing accommodation ID' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:duffel:details', { id: accommodationId });

    // Try to get from cache (30 minutes TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached hotel details for ${accommodationId}`);
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=1800', // 30 minutes
        }
      });
    }

    // Fetch accommodation details from Duffel Stays API
    console.log(`🏨 Fetching hotel details for ${accommodationId}...`);
    const accommodation = await duffelStaysAPI.getAccommodation(accommodationId);

    const response = {
      data: accommodation.data,
      meta: {
        lastUpdated: new Date().toISOString(),
        source: 'Duffel Stays',
      },
    };

    // Store in cache (30 minutes TTL)
    await setCache(cacheKey, response, 1800);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=1800',
      }
    });
  } catch (error: any) {
    console.error('❌ Hotel details error:', error);

    // Handle specific errors
    if (error.message.includes('not found') || error.message.includes('NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch hotel details',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
