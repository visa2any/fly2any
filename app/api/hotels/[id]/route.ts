import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { mockDuffelStaysAPI } from '@/lib/api/mock-duffel-stays';
import { liteAPI } from '@/lib/api/liteapi';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { isDemoHotelId, generateDemoHotelDetails } from '@/lib/utils/demo-hotels';

/**
 * Check if hotel ID is from LiteAPI (starts with 'lp' prefix)
 */
function isLiteAPIHotelId(hotelId: string): boolean {
  return hotelId.startsWith('lp') || hotelId.length <= 10;
}

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

    // Check if this is a LiteAPI hotel
    if (isLiteAPIHotelId(accommodationId)) {
      console.log(`🏨 [LITEAPI] Fetching hotel details for ${accommodationId}`);

      // Get query params for rates (optional)
      const searchParams = request.nextUrl.searchParams;
      const checkIn = searchParams.get('checkIn');
      const checkOut = searchParams.get('checkOut');
      const adults = parseInt(searchParams.get('adults') || '2', 10);

      // Generate cache key for LiteAPI (include dates if provided)
      const cacheKey = generateCacheKey('hotels:liteapi:details', {
        id: accommodationId,
        checkIn: checkIn || 'none',
        checkOut: checkOut || 'none',
      });

      // Try to get from cache (30 minutes TTL)
      const cached = await getCached<any>(cacheKey);
      if (cached) {
        console.log(`✅ Returning cached LiteAPI hotel details for ${accommodationId}`);
        return NextResponse.json(cached, {
          headers: {
            'X-Cache-Status': 'HIT',
            'X-API-Source': 'LITEAPI',
            'Cache-Control': 'public, max-age=1800',
          }
        });
      }

      try {
        const hotelDetails = await liteAPI.getHotelDetails({ hotelId: accommodationId });

        if (!hotelDetails) {
          return NextResponse.json(
            { error: 'Hotel not found' },
            { status: 404 }
          );
        }

        // Build images array from LiteAPI response
        const images: Array<{ url: string; caption?: string }> = [];
        if (hotelDetails.main_photo) {
          images.push({ url: hotelDetails.main_photo, caption: hotelDetails.name });
        }
        if (hotelDetails.thumbnail && hotelDetails.thumbnail !== hotelDetails.main_photo) {
          images.push({ url: hotelDetails.thumbnail, caption: `${hotelDetails.name} thumbnail` });
        }

        // Map facility IDs to amenity names (common facility mappings)
        const facilityMap: Record<number, string> = {
          1: 'wifi', 2: 'parking', 3: 'pool', 4: 'gym', 5: 'restaurant',
          6: 'bar', 7: 'spa', 8: 'room_service', 9: 'air_conditioning',
          10: 'laundry', 11: 'concierge', 12: 'business_center',
        };
        const amenities = (hotelDetails.facilityIds || [])
          .map((id: number) => facilityMap[id])
          .filter(Boolean);

        // Strip HTML tags from description
        const stripHtml = (html: string): string => {
          return html
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };

        // Format response to match expected structure for ClientPage
        const formattedResponse = {
          data: {
            id: hotelDetails.id || accommodationId,
            name: hotelDetails.name,
            description: stripHtml(hotelDetails.hotelDescription || ''),
            address: {
              street: hotelDetails.address || '',
              city: hotelDetails.city || '',
              country: hotelDetails.country || '',
              lat: hotelDetails.latitude,
              lng: hotelDetails.longitude,
            },
            location: {
              lat: hotelDetails.latitude,
              lng: hotelDetails.longitude,
            },
            starRating: hotelDetails.stars || 0,
            star_rating: hotelDetails.stars || 0, // Alternate format
            reviewRating: hotelDetails.rating || 0,
            reviewCount: hotelDetails.reviewCount || 0,
            images: images,
            photos: images.map(img => img.url), // Alternate format
            amenities: amenities,
            facilities: hotelDetails.facilityIds || [],
            checkInTime: hotelDetails.checkInTime || '15:00',
            checkOutTime: hotelDetails.checkOutTime || '11:00',
            chain: hotelDetails.chain,
            source: 'LiteAPI',
            // Room rates - fetch if dates provided
            rates: [] as any[],
          },
          meta: {
            lastUpdated: new Date().toISOString(),
            source: 'LiteAPI',
          },
        };

        // Fetch rates if check-in/check-out dates provided
        if (checkIn && checkOut) {
          try {
            console.log(`🏨 [LITEAPI] Fetching rates for ${accommodationId} (${checkIn} - ${checkOut})`);
            const ratesData = await liteAPI.getHotelRates({
              hotelIds: [accommodationId],
              checkin: checkIn,
              checkout: checkOut,
              occupancies: [{ adults }],
              currency: 'USD',
              guestNationality: 'US',
            });

            // Transform rates to match expected format
            if (ratesData && ratesData.length > 0) {
              const hotelRates = ratesData[0];
              const rates: any[] = [];

              for (const roomType of hotelRates.roomTypes || []) {
                for (const rate of roomType.rates || []) {
                  const price = rate.retailRate?.total?.[0]?.amount || 0;
                  const currency = rate.retailRate?.total?.[0]?.currency || 'USD';

                  rates.push({
                    id: rate.rateId,
                    offerId: roomType.offerId,
                    roomName: rate.name,
                    name: rate.name,
                    bedType: rate.boardName || 'Standard Bed',
                    maxGuests: rate.maxOccupancy || 2,
                    totalPrice: {
                      amount: String(price),
                      currency: currency,
                    },
                    refundable: rate.cancellationPolicies?.refundableTag === 'RFN',
                    breakfastIncluded: rate.boardType === 'BB' || rate.boardName?.toLowerCase().includes('breakfast'),
                    amenities: [],
                  });
                }
              }

              formattedResponse.data.rates = rates;
              console.log(`✅ [LITEAPI] Found ${rates.length} room rates`);
            }
          } catch (ratesError) {
            console.error('⚠️ [LITEAPI] Failed to fetch rates:', ratesError);
            // Continue without rates - basic info is still useful
          }
        }

        // Store in cache (30 minutes TTL)
        await setCache(cacheKey, formattedResponse, 1800);

        return NextResponse.json(formattedResponse, {
          headers: {
            'X-Cache-Status': 'MISS',
            'X-API-Source': 'LITEAPI',
            'Cache-Control': 'public, max-age=1800',
          }
        });
      } catch (error: any) {
        console.error('❌ LiteAPI hotel details error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to fetch hotel details from LiteAPI' },
          { status: 500 }
        );
      }
    }

    // Fallback to Duffel Stays API for non-LiteAPI hotels
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
