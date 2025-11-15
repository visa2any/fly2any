import { NextRequest, NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { mockDuffelStaysAPI } from '@/lib/api/mock-duffel-stays';
import { liteAPI } from '@/lib/api/liteapi';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import type { HotelSearchParams } from '@/lib/hotels/types';
import { mapAmadeusHotelsToHotels, extractCityCode } from '@/lib/mappers/amadeus-hotel-mapper';

// Feature flag: Use mock data, Duffel, or Amadeus
const USE_MOCK_HOTELS = process.env.USE_MOCK_HOTELS === 'true';
const USE_AMADEUS_HOTELS = process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET;

/**
 * Hotel Search API Route
 *
 * POST /api/hotels/search
 *
 * Search for hotels using Duffel Stays API (1.5M+ properties worldwide).
 * Supports both coordinate-based and query-based location search.
 *
 * Features:
 * - Location search (coordinates or city name)
 * - Date range filtering
 * - Guest count (adults + children with ages)
 * - Radius filtering
 * - Price range filtering
 * - Star rating filtering
 * - Amenity filtering
 * - Property type filtering
 * - Pagination support
 * - Response caching (15 minutes)
 *
 * Revenue: Commission-based (~$150 per booking)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    if (!body.location) {
      return NextResponse.json(
        { error: 'Missing required parameter: location (lat/lng or query)' },
        { status: 400 }
      );
    }

    if (!body.checkIn || !body.checkOut) {
      return NextResponse.json(
        { error: 'Missing required parameters: checkIn, checkOut' },
        { status: 400 }
      );
    }

    if (!body.guests?.adults) {
      return NextResponse.json(
        { error: 'Missing required parameter: guests.adults' },
        { status: 400 }
      );
    }

    // Build search parameters
    const searchParams: HotelSearchParams = {
      location: body.location,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: {
        adults: body.guests.adults,
        children: body.guests.children || [],
      },
      radius: body.radius || 5, // Default 5km
      limit: body.limit || 20, // Default 20 results
      currency: body.currency || 'USD',
    };

    // Add optional filters
    if (body.minRating !== undefined) searchParams.minRating = body.minRating;
    if (body.maxRating !== undefined) searchParams.maxRating = body.maxRating;
    if (body.minPrice !== undefined) searchParams.minPrice = body.minPrice;
    if (body.maxPrice !== undefined) searchParams.maxPrice = body.maxPrice;
    if (body.amenities) searchParams.amenities = body.amenities;
    if (body.propertyTypes) searchParams.propertyTypes = body.propertyTypes;

    // Generate cache key based on API being used
    const apiSource = USE_AMADEUS_HOTELS ? 'amadeus' : (USE_MOCK_HOTELS ? 'mock' : 'duffel');
    const cacheKey = generateCacheKey(`hotels:${apiSource}:search`, searchParams);

    // Try to get from cache (15 minutes TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached hotel search results (${apiSource})`);
      // Ensure cached response has success field (for backwards compatibility)
      const cachedWithSuccess = cached.success !== undefined ? cached : { success: true, ...cached };
      return NextResponse.json(cachedWithSuccess, {
        headers: {
          'X-Cache-Status': 'HIT',
          'X-API-Source': apiSource.toUpperCase(),
          'Cache-Control': 'public, max-age=900', // 15 minutes
        }
      });
    }

    // ✅ AMADEUS HOTELS API (Production-ready)
    if (USE_AMADEUS_HOTELS) {
      console.log('🔍 Searching hotels with Amadeus API...');

      // Extract city code from location query
      const cityCode = 'query' in searchParams.location
        ? extractCityCode(searchParams.location.query)
        : 'NYC'; // Default if using coordinates (Amadeus requires city code)

      // Search hotels with Amadeus
      const amadeusResults = await amadeusAPI.searchHotels({
        cityCode,
        checkInDate: searchParams.checkIn,
        checkOutDate: searchParams.checkOut,
        adults: searchParams.guests.adults,
        roomQuantity: searchParams.rooms || 1,
        radius: searchParams.radius || 5,
        radiusUnit: 'KM',
        ratings: searchParams.minRating ? [searchParams.minRating, 5] : undefined,
      });

      // Map Amadeus response to our Hotel interface
      const hotels = mapAmadeusHotelsToHotels(amadeusResults.data || []);

      // Apply additional filters (price, amenities, etc.)
      let filteredHotels = hotels;

      // Filter by price
      if (searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) {
        filteredHotels = filteredHotels.filter((hotel) => {
          const lowestRate = hotel.rates[0]; // Already sorted by price
          if (!lowestRate) return false;

          const price = parseFloat(lowestRate.totalPrice.amount);
          const meetsMin = searchParams.minPrice === undefined || price >= searchParams.minPrice;
          const meetsMax = searchParams.maxPrice === undefined || price <= searchParams.maxPrice;
          return meetsMin && meetsMax;
        });
      }

      // Limit results
      filteredHotels = filteredHotels.slice(0, searchParams.limit || 20);

      const response = {
        success: true,
        data: filteredHotels,
        meta: {
          count: filteredHotels.length,
          source: 'Amadeus Hotels API',
        },
      };

      // Store in cache (15 minutes TTL)
      await setCache(cacheKey, response, 900);

      console.log(`✅ Found ${filteredHotels.length} hotels with Amadeus`);

      return NextResponse.json(response, {
        headers: {
          'X-Cache-Status': 'MISS',
          'X-API-Source': 'AMADEUS',
          'Cache-Control': 'public, max-age=900',
        }
      });
    }

    // Fallback to Duffel Stays API (or mock)
    const hotelAPI = USE_MOCK_HOTELS ? mockDuffelStaysAPI : duffelStaysAPI;
    console.log(`🔍 Searching hotels with ${USE_MOCK_HOTELS ? 'MOCK' : 'Duffel Stays'} API...`);
    const results = await hotelAPI.searchAccommodations(searchParams);

    // Format response with success field for client compatibility
    const response = {
      success: true,
      ...results,
    };

    // Store in cache (15 minutes TTL)
    await setCache(cacheKey, response, 900);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Source': USE_MOCK_HOTELS ? 'MOCK' : 'DUFFEL',
        'Cache-Control': 'public, max-age=900',
      }
    });
  } catch (error: any) {
    console.error('❌ Hotel search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search hotels',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for backward compatibility and URL-based searches
 * Query parameters:
 * - Duffel format: query, lat, lng, checkIn, checkOut, adults, children
 * - Legacy format: cityCode, checkinDate, checkoutDate, adults, children
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check if this is a Duffel-style request (query parameter)
    const query = searchParams.get('query');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = searchParams.get('adults');

    // If we have Duffel-style parameters, use Duffel API
    if ((query || (lat && lng)) && checkIn && checkOut && adults) {
      // Build location object
      const location: any = lat && lng
        ? { latitude: parseFloat(lat), longitude: parseFloat(lng) }
        : { query };

      // Build search parameters for Duffel
      const duffelSearchParams: HotelSearchParams = {
        location,
        checkIn,
        checkOut,
        guests: {
          adults: parseInt(adults),
          children: searchParams.get('children') ? Array(parseInt(searchParams.get('children')!)).fill(10) : [],
        },
        radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 10,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
        currency: searchParams.get('currency') || 'USD',
      };

      // Generate cache key
      const cacheKey = generateCacheKey('hotels:duffel:search', duffelSearchParams);

      // Try to get from cache (15 minutes TTL)
      const cached = await getCached<any>(cacheKey);
      if (cached) {
        console.log('✅ Returning cached hotel search results (Duffel)');
        // Ensure cached response has success field (for backwards compatibility)
        const cachedWithSuccess = cached.success !== undefined ? cached : { success: true, ...cached };
        return NextResponse.json(cachedWithSuccess, {
          headers: {
            'X-Cache-Status': 'HIT',
            'Cache-Control': 'public, max-age=900',
          }
        });
      }

      // Search hotels using Duffel Stays API (or mock)
      const hotelAPI = USE_MOCK_HOTELS ? mockDuffelStaysAPI : duffelStaysAPI;
      console.log(`🔍 Searching hotels with ${USE_MOCK_HOTELS ? 'MOCK' : 'Duffel Stays'} API (GET)...`, duffelSearchParams);
      const results = await hotelAPI.searchAccommodations(duffelSearchParams);

      // Format response with success field for client compatibility
      const response = {
        success: true,
        ...results,
      };

      // Store in cache (15 minutes TTL)
      await setCache(cacheKey, response, 900);

      return NextResponse.json(response, {
        headers: {
          'X-Cache-Status': 'MISS',
          'Cache-Control': 'public, max-age=900',
        }
      });
    }

    // Legacy LiteAPI format
    const cityCode = searchParams.get('cityCode');
    const checkinDate = searchParams.get('checkinDate');
    const checkoutDate = searchParams.get('checkoutDate');

    if (!cityCode || !checkinDate || !checkoutDate || !adults) {
      return NextResponse.json(
        { error: 'Missing required parameters: query/cityCode, checkIn/checkinDate, checkOut/checkoutDate, adults' },
        { status: 400 }
      );
    }

    // Build search parameters for LiteAPI (legacy)
    const hotelSearchParams = {
      cityCode,
      checkinDate,
      checkoutDate,
      adults: parseInt(adults),
      children: searchParams.get('children') ? parseInt(searchParams.get('children')!) : undefined,
      currency: searchParams.get('currency') || 'USD',
      guestNationality: searchParams.get('guestNationality') || 'US',
    };

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:liteapi:search', hotelSearchParams);

    // Try to get from cache
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=900',
        }
      });
    }

    // Search hotels using LiteAPI (legacy)
    const results = await liteAPI.searchHotels(hotelSearchParams);

    // Store in cache (15 minutes TTL)
    await setCache(cacheKey, results, 900);

    return NextResponse.json(results, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=900',
      }
    });
  } catch (error: any) {
    console.error('Hotel search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search hotels'
      },
      { status: 500 }
    );
  }
}

// Note: Using Node.js runtime (not edge) because Duffel SDK requires Node.js APIs (URL constructor, etc.)
// export const runtime = 'edge';
