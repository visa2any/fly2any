import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';

/**
 * Hotel Booking Details API Route
 *
 * GET /api/hotels/booking/[id]
 *
 * Retrieve detailed information about a hotel booking.
 * Includes reservation details, guest info, and current status.
 *
 * Response is cached for 5 minutes to reduce API calls.
 * Cache is invalidated when booking is updated/cancelled.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing booking ID' },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:duffel:booking', { id: bookingId });

    // Try to get from cache (5 minutes TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached booking details for ${bookingId}`);
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'private, max-age=300', // 5 minutes
        }
      });
    }

    // Fetch booking details from Duffel Stays API
    console.log(`🔍 Fetching booking details for ${bookingId}...`);
    const booking = await duffelStaysAPI.getBooking(bookingId);

    const response = {
      data: booking.data,
      meta: {
        retrievedAt: new Date().toISOString(),
      },
    };

    // Store in cache (5 minutes TTL)
    await setCache(cacheKey, response, 300);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'private, max-age=300',
      }
    });
  } catch (error: any) {
    console.error('❌ Booking details error:', error);

    // Handle specific errors
    if (error.message.includes('not found') || error.message.includes('NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch booking details',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Note: Using Node.js runtime (not edge) because Duffel SDK requires Node.js APIs
// export const runtime = 'edge';
