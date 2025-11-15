import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { mockDuffelStaysAPI } from '@/lib/api/mock-duffel-stays';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { isDemoHotelId, generateDemoHotelDetails } from '@/lib/utils/demo-hotels';

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

    // ✅ EMERGENCY FIX: Handle demo hotel IDs
    // Demo hotels are generated as fallback data when real API fails
    // Format: demo-hotel-{city}-{index}
    if (isDemoHotelId(accommodationId)) {
      console.log(`🏨 [DEMO] Generating demo hotel details for ${accommodationId}`);

      try {
        const demoHotel = generateDemoHotelDetails(accommodationId);

        return NextResponse.json({
          data: demoHotel,
          meta: {
            lastUpdated: new Date().toISOString(),
            source: 'Demo Data',
            isDemoData: true,
            message: 'This is demo data. Configure real APIs for production use.',
          },
        }, {
          headers: {
            'X-Data-Source': 'DEMO',
            'Cache-Control': 'public, max-age=3600', // Cache demo data for 1 hour
          }
        });
      } catch (error: any) {
        console.error(`❌ [DEMO] Failed to generate demo hotel:`, error);
        return NextResponse.json(
          { error: 'Invalid demo hotel ID format' },
          { status: 400 }
        );
      }
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

    // Choose API based on USE_MOCK_HOTELS environment variable
    const USE_MOCK_HOTELS = process.env.USE_MOCK_HOTELS === 'true';
    const hotelAPI = USE_MOCK_HOTELS ? mockDuffelStaysAPI : duffelStaysAPI;

    // Fetch accommodation details from selected API
    console.log(`🏨 Fetching hotel details for ${accommodationId}... (${USE_MOCK_HOTELS ? 'MOCK' : 'Duffel Stays'} API)`);
    const accommodation = await hotelAPI.getAccommodation(accommodationId);

    const response = {
      data: accommodation.data,
      meta: {
        lastUpdated: new Date().toISOString(),
        source: USE_MOCK_HOTELS ? 'Mock Data' : 'Duffel Stays',
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

// Note: Using Node.js runtime (not edge) because Duffel SDK requires Node.js APIs
// export const runtime = 'edge';
