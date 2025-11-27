import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import type { HotelSearchParams } from '@/lib/hotels/types';

// City name to coordinates mapping for popular destinations
const CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  'new york': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'nyc': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'los angeles': { lat: 34.0522, lng: -118.2437, country: 'US' },
  'la': { lat: 34.0522, lng: -118.2437, country: 'US' },
  'chicago': { lat: 41.8781, lng: -87.6298, country: 'US' },
  'miami': { lat: 25.7617, lng: -80.1918, country: 'US' },
  'san francisco': { lat: 37.7749, lng: -122.4194, country: 'US' },
  'sf': { lat: 37.7749, lng: -122.4194, country: 'US' },
  'las vegas': { lat: 36.1699, lng: -115.1398, country: 'US' },
  'vegas': { lat: 36.1699, lng: -115.1398, country: 'US' },
  'seattle': { lat: 47.6062, lng: -122.3321, country: 'US' },
  'boston': { lat: 42.3601, lng: -71.0589, country: 'US' },
  'denver': { lat: 39.7392, lng: -104.9903, country: 'US' },
  'atlanta': { lat: 33.7490, lng: -84.3880, country: 'US' },
  'orlando': { lat: 28.5383, lng: -81.3792, country: 'US' },
  'houston': { lat: 29.7604, lng: -95.3698, country: 'US' },
  'dallas': { lat: 32.7767, lng: -96.7970, country: 'US' },
  'phoenix': { lat: 33.4484, lng: -112.0740, country: 'US' },
  'san diego': { lat: 32.7157, lng: -117.1611, country: 'US' },
  'washington': { lat: 38.9072, lng: -77.0369, country: 'US' },
  'dc': { lat: 38.9072, lng: -77.0369, country: 'US' },
  // International
  'london': { lat: 51.5074, lng: -0.1278, country: 'GB' },
  'paris': { lat: 48.8566, lng: 2.3522, country: 'FR' },
  'rome': { lat: 41.9028, lng: 12.4964, country: 'IT' },
  'barcelona': { lat: 41.3851, lng: 2.1734, country: 'ES' },
  'tokyo': { lat: 35.6762, lng: 139.6503, country: 'JP' },
  'dubai': { lat: 25.2048, lng: 55.2708, country: 'AE' },
  'singapore': { lat: 1.3521, lng: 103.8198, country: 'SG' },
  'hong kong': { lat: 22.3193, lng: 114.1694, country: 'HK' },
  'sydney': { lat: -33.8688, lng: 151.2093, country: 'AU' },
  'cancun': { lat: 21.1619, lng: -86.8515, country: 'MX' },
  'toronto': { lat: 43.6532, lng: -79.3832, country: 'CA' },
  'amsterdam': { lat: 52.3676, lng: 4.9041, country: 'NL' },
  'berlin': { lat: 52.5200, lng: 13.4050, country: 'DE' },
  'madrid': { lat: 40.4168, lng: -3.7038, country: 'ES' },
  'lisbon': { lat: 38.7223, lng: -9.1393, country: 'PT' },
  'bangkok': { lat: 13.7563, lng: 100.5018, country: 'TH' },
  'bali': { lat: -8.3405, lng: 115.0920, country: 'ID' },
};

/**
 * Get coordinates from city query
 */
function getCityCoordinates(query: string): { lat: number; lng: number; country: string } | null {
  const normalized = query.toLowerCase().trim();

  // Direct match
  if (CITY_COORDINATES[normalized]) {
    return CITY_COORDINATES[normalized];
  }

  // Partial match
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }

  return null;
}

/**
 * Hotel Search API Route
 *
 * POST /api/hotels/search
 *
 * Search for hotels using LiteAPI (primary).
 * Supports both coordinate-based and query-based location search.
 *
 * Features:
 * - Location search (coordinates or city name)
 * - Date range filtering
 * - Guest count (adults + children)
 * - Price range filtering
 * - Response caching (15 minutes)
 *
 * Revenue: Commission-based (~$30-50 per booking)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Validate required parameters
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body is empty',
          hint: 'Please provide location, checkIn, checkOut, and guests parameters'
        },
        { status: 400 }
      );
    }

    if (!body.location) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: location',
          hint: 'Provide either { lat, lng } coordinates or { query: "city name" }'
        },
        { status: 400 }
      );
    }

    if (!body.checkIn || !body.checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: checkIn and/or checkOut',
          hint: 'Provide dates in YYYY-MM-DD format'
        },
        { status: 400 }
      );
    }

    if (!body.guests?.adults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: guests.adults',
          hint: 'Provide { guests: { adults: number } }'
        },
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
      radius: body.radius || 5,
      limit: body.limit || 30,
      currency: body.currency || 'USD',
    };

    // Add optional filters
    if (body.minRating !== undefined) searchParams.minRating = body.minRating;
    if (body.maxRating !== undefined) searchParams.maxRating = body.maxRating;
    if (body.minPrice !== undefined) searchParams.minPrice = body.minPrice;
    if (body.maxPrice !== undefined) searchParams.maxPrice = body.maxPrice;

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:liteapi:search', searchParams);

    // Try to get from cache (15 minutes TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached hotel search results (LiteAPI)');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'X-API-Source': 'LITEAPI',
          'Cache-Control': 'public, max-age=900',
        }
      });
    }

    // Determine location coordinates
    let latitude: number | undefined;
    let longitude: number | undefined;
    let countryCode: string | undefined;

    const location = searchParams.location as { lat?: number; lng?: number; query?: string };
    if (location.lat !== undefined && location.lng !== undefined) {
      latitude = location.lat;
      longitude = location.lng;
    } else if (location.query) {
      const cityCoords = getCityCoordinates(location.query);
      if (cityCoords) {
        latitude = cityCoords.lat;
        longitude = cityCoords.lng;
        countryCode = cityCoords.country;
      }
    }

    if (!latitude || !longitude) {
      // Default to New York if we can't determine location
      latitude = 40.7128;
      longitude = -74.0060;
      console.log('⚠️ Could not determine location, defaulting to New York');
    }

    console.log('🔍 Searching hotels with LiteAPI...', { latitude, longitude, countryCode });

    // Search hotels using LiteAPI
    const results = await liteAPI.searchHotelsWithRates({
      latitude,
      longitude,
      checkinDate: searchParams.checkIn,
      checkoutDate: searchParams.checkOut,
      adults: searchParams.guests.adults,
      children: Array.isArray(searchParams.guests.children) ? searchParams.guests.children.length : 0,
      currency: searchParams.currency || 'USD',
      guestNationality: 'US',
      limit: searchParams.limit,
    });

    // Apply additional filters
    let filteredHotels = results.hotels;

    // Filter by price
    if (searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) {
      filteredHotels = filteredHotels.filter((hotel) => {
        const price = hotel.lowestPrice;
        if (!price) return false;
        const meetsMin = searchParams.minPrice === undefined || price >= searchParams.minPrice;
        const meetsMax = searchParams.maxPrice === undefined || price <= searchParams.maxPrice;
        return meetsMin && meetsMax;
      });
    }

    // Filter by rating
    if (searchParams.minRating !== undefined) {
      filteredHotels = filteredHotels.filter((hotel) => hotel.stars >= (searchParams.minRating || 0));
    }

    // Map to expected format
    const mappedHotels = filteredHotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      location: {
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      },
      rating: hotel.stars,
      reviewScore: hotel.rating,
      reviewCount: hotel.reviewCount,
      images: hotel.image ? [{ url: hotel.image, alt: hotel.name }] : [],
      thumbnail: hotel.thumbnail,
      amenities: [],
      rates: hotel.rooms?.map(room => ({
        id: room.rateId,
        roomType: room.name,
        boardType: room.boardName,
        totalPrice: {
          amount: room.price.toString(),
          currency: room.currency,
        },
        refundable: room.refundable,
        maxOccupancy: room.maxOccupancy,
        offerId: room.offerId,
      })) || [],
      lowestPrice: hotel.lowestPrice ? {
        amount: hotel.lowestPrice.toString(),
        currency: hotel.currency,
      } : undefined,
      source: 'liteapi',
    }));

    const response = {
      success: true,
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        source: 'LiteAPI',
      },
    };

    // Store in cache (15 minutes TTL)
    await setCache(cacheKey, response, 900);

    console.log(`✅ Found ${mappedHotels.length} hotels with LiteAPI`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Source': 'LITEAPI',
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
 * GET endpoint for URL-based searches
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get('query');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = searchParams.get('adults');

    if (!(query || (lat && lng)) || !checkIn || !checkOut || !adults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          hint: 'Provide query or lat/lng, checkIn, checkOut, and adults'
        },
        { status: 400 }
      );
    }

    // Determine coordinates
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (lat && lng) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);
    } else if (query) {
      const cityCoords = getCityCoordinates(query);
      if (cityCoords) {
        latitude = cityCoords.lat;
        longitude = cityCoords.lng;
      }
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not determine location',
          hint: 'Provide valid coordinates or a recognized city name'
        },
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:liteapi:search:get', {
      latitude,
      longitude,
      checkIn,
      checkOut,
      adults,
    });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached hotel search results (GET)');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'X-API-Source': 'LITEAPI',
          'Cache-Control': 'public, max-age=900',
        }
      });
    }

    console.log('🔍 Searching hotels with LiteAPI (GET)...', { latitude, longitude });

    // Search hotels
    const results = await liteAPI.searchHotelsWithRates({
      latitude,
      longitude,
      checkinDate: checkIn,
      checkoutDate: checkOut,
      adults: parseInt(adults),
      children: searchParams.get('children') ? parseInt(searchParams.get('children')!) : 0,
      currency: searchParams.get('currency') || 'USD',
      guestNationality: 'US',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 30,
    });

    // Map to expected format
    const mappedHotels = results.hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      location: {
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      },
      rating: hotel.stars,
      reviewScore: hotel.rating,
      reviewCount: hotel.reviewCount,
      images: hotel.image ? [{ url: hotel.image, alt: hotel.name }] : [],
      thumbnail: hotel.thumbnail,
      amenities: [],
      rates: hotel.rooms?.map(room => ({
        id: room.rateId,
        roomType: room.name,
        boardType: room.boardName,
        totalPrice: {
          amount: room.price.toString(),
          currency: room.currency,
        },
        refundable: room.refundable,
        maxOccupancy: room.maxOccupancy,
        offerId: room.offerId,
      })) || [],
      lowestPrice: hotel.lowestPrice ? {
        amount: hotel.lowestPrice.toString(),
        currency: hotel.currency,
      } : undefined,
      source: 'liteapi',
    }));

    const response = {
      success: true,
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        source: 'LiteAPI',
      },
    };

    // Cache for 15 minutes
    await setCache(cacheKey, response, 900);

    console.log(`✅ Found ${mappedHotels.length} hotels with LiteAPI (GET)`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Source': 'LITEAPI',
        'Cache-Control': 'public, max-age=900',
      }
    });
  } catch (error: any) {
    console.error('❌ Hotel search error (GET):', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search hotels',
      },
      { status: 500 }
    );
  }
}
