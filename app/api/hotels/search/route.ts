import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mapPropertyToHotel } from '@/lib/mappers/property-mapper';
import { liteAPI } from '@/lib/api/liteapi'; // ✅ Updated with amenities support
import { searchHotels as searchHotelbeds, normalizeHotelbedsHotel } from '@/lib/api/hotelbeds';
import { amadeus } from '@/lib/api/amadeus'; // ✅ Amadeus fallback
import { mapAmadeusHotelToHotel, extractCityCode } from '@/lib/mappers/amadeus-hotel-mapper';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import type { HotelSearchParams, Hotel } from '@/lib/hotels/types';

// Cost protection - blocks bots and suspicious requests BEFORE expensive API calls
import { checkCostGuard, COST_GUARDS } from '@/lib/security/cost-protection';

// Error monitoring - sends alerts for all errors
import { handleApiError } from '@/lib/monitoring/global-error-handler';

// Global cities database - 500+ worldwide destinations with coordinates (SINGLE SOURCE OF TRUTH)
import { GLOBAL_CITIES } from '@/lib/data/global-cities-database';

// ✅ Region service for ISO-based global coverage
import { getHotelRegionData, getRegionFromCountryCode } from '@/lib/location/region-service';

// Build a fast lookup map from GLOBAL_CITIES for O(1) access
const CITY_LOOKUP = new Map<string, { lat: number; lng: number; country: string }>();

// Normalize string for matching (remove accents, lowercase)
function normalizeForLookup(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Initialize lookup map from global database
for (const city of GLOBAL_CITIES) {
  const coords = { lat: city.location.lat, lng: city.location.lng, country: city.countryCode };

  // Add main name
  CITY_LOOKUP.set(normalizeForLookup(city.name), coords);
  CITY_LOOKUP.set(normalizeForLookup(city.city), coords);
  CITY_LOOKUP.set(normalizeForLookup(city.id), coords);

  // Add aliases
  if (city.aliases) {
    for (const alias of city.aliases) {
      CITY_LOOKUP.set(normalizeForLookup(alias), coords);
    }
  }

  // Add common variations: "city, country" and "city, state"
  CITY_LOOKUP.set(normalizeForLookup(`${city.city}, ${city.country}`), coords);
  if (city.state) {
    CITY_LOOKUP.set(normalizeForLookup(`${city.city}, ${city.state}`), coords);
  }
}

// Add common abbreviations/nicknames not in aliases
const ABBREVIATIONS: Record<string, string> = {
  'nyc': 'new york', 'la': 'los angeles', 'sf': 'san francisco', 'dc': 'washington',
  'vegas': 'las vegas', 'rio': 'rio de janeiro', 'sp': 'sao paulo', 'bh': 'belo horizonte',
  'poa': 'porto alegre', 'floripa': 'florianopolis', 'sampa': 'sao paulo',
};

for (const [abbr, fullName] of Object.entries(ABBREVIATIONS)) {
  const coords = CITY_LOOKUP.get(normalizeForLookup(fullName));
  if (coords) CITY_LOOKUP.set(abbr, coords);
}

/**
 * Get coordinates from city query - uses GLOBAL_CITIES as single source of truth
 */
function getCityCoordinates(query: string): { lat: number; lng: number; country: string } | null {
  const normalized = normalizeForLookup(query);

  // 1. Direct match in lookup map (O(1) - fastest)
  if (CITY_LOOKUP.has(normalized)) {
    return CITY_LOOKUP.get(normalized)!;
  }

  // 2. Fuzzy search in GLOBAL_CITIES for partial matches
  const globalMatch = GLOBAL_CITIES.find(city => {
    const cityName = normalizeForLookup(city.name);
    const cityCity = normalizeForLookup(city.city);

    // Partial match for multi-word cities
    if (normalized.length >= 4) {
      if (cityName.includes(normalized) || normalized.includes(cityName) ||
          cityCity.includes(normalized) || normalized.includes(cityCity)) {
        return true;
      }
    }

    return false;
  });

  if (globalMatch) {
    console.log(`✅ Found "${query}" in GLOBAL_CITIES: ${globalMatch.name}, ${globalMatch.country}`);
    return {
      lat: globalMatch.location.lat,
      lng: globalMatch.location.lng,
      country: globalMatch.countryCode,
    };
  }

  return null;
}

/**
 * Geocode unknown cities using OpenStreetMap Nominatim API (free)
 * Fallback for cities not in our database
 */
async function geocodeCity(query: string): Promise<{ lat: number; lng: number; country: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Fly2Any Travel Platform (contact@fly2any.com)' },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    const result = data[0];
    const countryCode = result.address?.country_code?.toUpperCase() || 'XX';

    console.log(`🌍 Geocoded "${query}" via Nominatim: ${result.display_name} (${result.lat}, ${result.lon})`);

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      country: countryCode,
    };
  } catch (error: any) {
    console.warn(`⚠️ Nominatim geocoding failed for "${query}":`, error.message);
    return null;
  }
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
  return handleApiError(request, async () => {
    // 🛡️ COST PROTECTION: Block bots and suspicious requests BEFORE expensive API calls
    const costGuard = await checkCostGuard(request, COST_GUARDS.HOTEL_SEARCH);
    if (!costGuard.allowed && costGuard.response) {
      return costGuard.response;
    }

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

    // ✅ CRITICAL: Past date validation - APIs return 0 results for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const checkInDate = new Date(body.checkIn);
    const checkOutDate = new Date(body.checkOut);

    if (checkInDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in date cannot be in the past',
          hint: `Check-in date ${body.checkIn} is before today (${today.toISOString().split('T')[0]}). Please select a future date.`,
          code: 'INVALID_CHECKIN_DATE',
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-out date must be after check-in date',
          hint: `Check-out ${body.checkOut} must be at least 1 day after check-in ${body.checkIn}.`,
          code: 'INVALID_CHECKOUT_DATE',
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
      radius: body.radius || 15, // 15km default - smaller radius for accurate city results
      limit: body.limit || 100, // 100 hotels for more options
      currency: body.currency || 'USD',
    };

    // Add optional filters
    if (body.minRating !== undefined) searchParams.minRating = body.minRating;
    if (body.maxRating !== undefined) searchParams.maxRating = body.maxRating;
    if (body.minPrice !== undefined) searchParams.minPrice = body.minPrice;
    if (body.maxPrice !== undefined) searchParams.maxPrice = body.maxPrice;

    // Generate cache key (v2: fixed coordinate validation)
    const cacheKey = generateCacheKey('hotels:liteapi:search:v2', searchParams);

    // Try to get from cache (15 minutes TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached hotel search results (Multi-API)');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'X-API-Sources': 'LITEAPI,HOTELBEDS',
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
      // Try to determine country from query if available, even when coordinates are provided
      if (location.query) {
        const cityInfo = getCityCoordinates(location.query);
        if (cityInfo) {
          countryCode = cityInfo.country;
        }
      }
    } else if (location.query) {
      // 1. Try local database first (fast)
      const cityCoords = getCityCoordinates(location.query);
      if (cityCoords) {
        latitude = cityCoords.lat;
        longitude = cityCoords.lng;
        countryCode = cityCoords.country;
      } else {
        // 2. Fallback to Nominatim geocoding for unknown cities (worldwide coverage)
        const geocoded = await geocodeCity(location.query);
        if (geocoded) {
          latitude = geocoded.lat;
          longitude = geocoded.lng;
          countryCode = geocoded.country;
        }
      }
    }

    if (!latitude || !longitude) {
      // CRITICAL: Do NOT default to any location - return error instead
      // This prevents showing wrong city's hotels (e.g., NYC hotels in Brasilia search)
      const locationQuery = (searchParams.location as any)?.query || (searchParams.location as any)?.name || 'unknown';
      console.error(`❌ Could not determine coordinates for location: "${locationQuery}"`);
      return NextResponse.json({
        success: false,
        error: 'LOCATION_NOT_FOUND',
        message: `Could not find coordinates for "${locationQuery}". Please try a different city name.`,
        hint: 'Try using a major city name like "Rio de Janeiro" or "São Paulo"',
      }, { status: 400 });
    }

    console.log('🔍 Searching hotels (FAST mode)...', { latitude, longitude, countryCode });

    // PERFORMANCE OPTIMIZED: Single API search in production
    const roomCount = body.rooms || 1;
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

    console.log(`🏨 [SEARCH] ${searchParams.guests?.adults || 2} adults, ${Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0} children, ${roomCount} rooms`);

    // LiteAPI Search (Primary - FAST with parallel batching)
    const liteAPIResults = await liteAPI.searchHotelsWithMinRates({
      latitude,
      longitude,
      checkinDate: searchParams.checkIn!,
      checkoutDate: searchParams.checkOut!,
      adults: searchParams.guests?.adults || 2,
      children: Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0,
      rooms: roomCount,
      currency: searchParams.currency || 'USD',
      guestNationality: countryCode || 'US',
      radius: searchParams.radius || 15, // 15km default for accurate city results
      limit: searchParams.limit || 100, // Increased for better coverage
    }).catch(err => {
      console.error('⚠️ LiteAPI search failed:', err.message);
      return { hotels: [], meta: { usedMinRates: true, error: err.message } };
    });

    // Amadeus - ALWAYS search to provide more hotel options (not just fallback)
    let amadeusResults = { hotels: [] as any[] };
    // Try multiple location fields: query, name, city
    const locationQuery = (searchParams.location as any)?.query
      || (searchParams.location as any)?.name
      || (searchParams.location as any)?.city
      || '';

    console.log(`🔍 Location data for Amadeus:`, { locationQuery, location: searchParams.location });

    if (locationQuery) {
      try {
        const cityCode = extractCityCode(locationQuery);
        // Skip Amadeus if no valid city code (prevents wrong city hotels)
        if (!cityCode) {
          console.log(`⚠️ Amadeus search skipped: no city code for "${locationQuery}"`);
        } else {
          console.log(`🔍 Amadeus search: "${locationQuery}" → city code: ${cityCode}`);

          const amadeusData = await amadeus.searchHotels({
            cityCode,
            checkInDate: searchParams.checkIn!,
            checkOutDate: searchParams.checkOut!,
            adults: searchParams.guests?.adults || 2,
            roomQuantity: roomCount,
          });

          if (amadeusData?.data?.length > 0) {
          amadeusResults.hotels = amadeusData.data.map((offer: any) => {
            const mapped = mapAmadeusHotelToHotel(offer);
            // Convert to normalized format matching other sources
            return {
              id: `amadeus_${mapped.id}`,
              name: mapped.name,
              description: mapped.description || '',
              latitude: mapped.location?.lat || latitude,
              longitude: mapped.location?.lng || longitude,
              address: mapped.address?.street || '',
              city: mapped.address?.city || '',
              country: mapped.address?.country || '',
              stars: mapped.starRating || 4,
              rating: mapped.starRating || 4,
              reviewCount: 0,
              images: mapped.images?.map(img => ({ url: img.url, alt: mapped.name })) || [],
              image: mapped.images?.[0]?.url || null,
              thumbnail: mapped.images?.[0]?.url || null,
              amenities: mapped.amenities || [],
              lowestPrice: mapped.rates?.[0] ? parseFloat(mapped.rates[0].totalPrice.amount) : 0,
              lowestPricePerNight: mapped.rates?.[0] ? parseFloat(mapped.rates[0].totalPrice.amount) / Math.max(1, Math.ceil((new Date(searchParams.checkOut!).getTime() - new Date(searchParams.checkIn!).getTime()) / (1000*60*60*24))) : 0,
              currency: mapped.rates?.[0]?.totalPrice.currency || 'USD',
              rooms: mapped.rates?.map(rate => ({
                rateId: rate.id,
                name: rate.roomType,
                price: parseFloat(rate.totalPrice.amount),
                currency: rate.totalPrice.currency,
                refundable: rate.refundable,
                boardName: rate.mealsIncluded || 'Room Only',
              })) || [],
              source: 'Amadeus',
              refundable: mapped.rates?.some(r => r.refundable) || false,
            };
          });
          console.log(`✅ Amadeus returned ${amadeusResults.hotels.length} additional hotels`);
          }
        } // end else (valid cityCode)
      } catch (amErr: any) {
        console.log(`⚠️ Amadeus hotel search failed: ${amErr.message}`);
        // Log detailed error for debugging
        if (amErr.response?.data?.errors) {
          console.log(`   Amadeus API errors:`, JSON.stringify(amErr.response.data.errors, null, 2));
        }
      }
    } else {
      console.log(`⚠️ Amadeus search skipped - no location query provided`);
    }

    // Hotelbeds only in development (skip entirely in production for speed)
    let hotelbedsResults = { hotels: [] as any[], processTime: 0 };

    if (!isProduction && process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_SECRET) {
      try {
        const paxes = [];
        const adults = searchParams.guests?.adults || 2;
        for (let i = 0; i < adults; i++) {
          paxes.push({ type: 'AD' as const, age: 30 });
        }
        const childrenCount = Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0;
        for (let i = 0; i < childrenCount; i++) {
          paxes.push({ type: 'CH' as const, age: 10 });
        }

        const hotelbedsData = await searchHotelbeds({
          stay: { checkIn: searchParams.checkIn!, checkOut: searchParams.checkOut! },
          occupancies: [{ rooms: 1, adults, children: childrenCount, paxes }],
          geolocation: { latitude, longitude, radius: searchParams.radius || 20, unit: 'km' },
          language: 'ENG',
        });

        hotelbedsResults = {
          hotels: (hotelbedsData.hotels?.hotels || []).map(hotel =>
            normalizeHotelbedsHotel(hotel, searchParams.checkIn!, searchParams.checkOut!)
          ),
          processTime: hotelbedsData.auditData?.processTime || 0,
        };
      } catch (err: any) {
        console.error('⚠️ Hotelbeds search failed:', err.message);
      }
    }

    // Native Fly2Any Properties Search
    let nativeProperties: any[] = [];
    try {
      const lat = latitude;
      const lng = longitude;
      const radius = searchParams.radius || 15;
      
      // Simple bounding box for properties
      const latDelta = radius / 111;
      const lngDelta = radius / (111 * Math.cos(lat * (Math.PI / 180)));

      const nativeResults = await prisma.property.findMany({
        where: {
          status: 'active',
          latitude: { gte: lat - latDelta, lte: lat + latDelta },
          longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
          maxGuests: { gte: searchParams.guests?.adults || 1 },
        },
        include: {
          rooms: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      });

      const checkInObj = new Date(searchParams.checkIn!);
      const checkOutObj = new Date(searchParams.checkOut!);
      const nights = Math.max(1, Math.ceil((checkOutObj.getTime() - checkInObj.getTime()) / (1000 * 60 * 60 * 24)));

      nativeProperties = nativeResults.map(p => 
        mapPropertyToHotel(p as any, searchParams.checkIn!, searchParams.checkOut!, nights)
      );
      
      if (nativeProperties.length > 0) {
        console.log(`✅ Included ${nativeProperties.length} native Fly2Any properties`);
      }
    } catch (err: any) {
      console.error('⚠️ Native property search failed:', err.message);
    }

    // Combine results from all APIs (LiteAPI + Amadeus + Hotelbeds + Fly2Any)
    const allHotels = [
      ...(liteAPIResults.hotels || []), 
      ...(amadeusResults.hotels || []), 
      ...(hotelbedsResults.hotels || []),
      ...nativeProperties
    ];

    console.log(`✅ Multi-API Results: LiteAPI (${liteAPIResults.hotels?.length || 0}) + Amadeus (${amadeusResults.hotels?.length || 0}) + Fly2Any (${nativeProperties.length}) = ${allHotels.length} total`);

    // Deduplicate hotels by name + approximate location (within 100m radius)
    const deduplicatedHotels: Hotel[] = [];
    const seenHotels = new Map<string, Hotel>();

    for (const hotel of allHotels) {
      const key = `${hotel.name.toLowerCase().trim()}:${Math.floor(hotel.latitude * 1000)}:${Math.floor(hotel.longitude * 1000)}`;

      if (!seenHotels.has(key)) {
        seenHotels.set(key, hotel);
        deduplicatedHotels.push(hotel);
      } else {
        // If duplicate, keep the one with better price
        const existing = seenHotels.get(key);
        if (existing) {
          const existingPrice = existing.lowestPricePerNight || existing.lowestPrice || Infinity;
          const newPrice = hotel.lowestPricePerNight || hotel.lowestPrice || Infinity;

          if (newPrice < existingPrice) {
            const index = deduplicatedHotels.indexOf(existing);
            if (index > -1) {
              deduplicatedHotels[index] = hotel;
              seenHotels.set(key, hotel);
            }
          }
        }
      }
    }

    console.log(`🔄 Deduplication: ${allHotels.length} → ${deduplicatedHotels.length} unique hotels`);

    // 🚨 ALERT: Zero results monitoring
    if (deduplicatedHotels.length === 0) {
      const alertData = {
        timestamp: new Date().toISOString(),
        location: searchParams.location,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        latitude,
        longitude,
        liteAPICount: liteAPIResults.hotels?.length || 0,
        amadeusCount: amadeusResults.hotels?.length || 0,
        hotelbedsCount: hotelbedsResults.hotels?.length || 0,
        liteAPIError: (liteAPIResults as any).meta?.error || null,
      };
      console.error('🚨 [HOTEL_SEARCH_ZERO_RESULTS]', JSON.stringify(alertData));

      // Non-blocking alert
      import('@/lib/monitoring/customer-error-alerts').then(({ alertCustomerError }) => {
        alertCustomerError({
          errorMessage: `Hotel search returned 0 results for ${JSON.stringify(searchParams.location)}`,
          errorCode: 'HOTEL_SEARCH_ZERO_RESULTS',
          category: 'external_api',
          severity: 'high',
          url: `/api/hotels/search`,
          additionalData: alertData,
        }, { sendTelegram: true, sendEmail: true }).catch(console.error);
      }).catch(console.error);
    }

    // Sort by best price
    const results = {
      hotels: deduplicatedHotels.sort((a, b) => {
        const priceA = a.lowestPricePerNight || a.lowestPrice || Infinity;
        const priceB = b.lowestPricePerNight || b.lowestPrice || Infinity;
        return priceA - priceB;
      }),
      meta: {
        usedMinRates: 'meta' in liteAPIResults ? liteAPIResults.meta?.usedMinRates : undefined,
        liteAPICount: liteAPIResults.hotels?.length || 0,
        amadeusCount: amadeusResults.hotels?.length || 0,
        hotelbedsCount: hotelbedsResults.hotels?.length || 0,
        totalBeforeDedup: allHotels.length,
        totalAfterDedup: deduplicatedHotels.length,
        hotelbedsTime: 'processTime' in hotelbedsResults ? hotelbedsResults.processTime : undefined,
      }
    };

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
      filteredHotels = filteredHotels.filter((hotel) => (hotel.starRating || 0) >= (searchParams.minRating || 0));
    }

    // Map to expected format (handles both LiteAPI and Hotelbeds structures)
    const mappedHotels = filteredHotels.map(hotel => {
      // Determine source (LiteAPI or Hotelbeds)
      const source = hotel.source || 'LiteAPI';
      const isHotelbeds = source === 'Hotelbeds';

      // Get location data
      const location = hotel.location || {};

      // Map rates from either structure
      const rates = hotel.rooms?.map((room: any) => ({
        id: room.id || room.rateId,
        roomType: room.name,
        boardType: room.boardName || room.boardType,
        totalPrice: {
          amount: (room.price || room.totalPrice || 0).toString(),
          currency: room.currency || hotel.currency || 'USD',
        },
        refundable: room.refundable,
        maxOccupancy: room.maxOccupancy,
        offerId: room.offerId,
      })) || [];

      // Get the lowest price (different field names for different APIs)
      const lowestPriceValue = hotel.lowestPricePerNight || hotel.lowestPrice || 0;

      return {
        id: hotel.id,
        name: hotel.name,
        description: hotel.description || '',
        location: {
          address: location.address || hotel.address,
          city: location.city || hotel.city,
          country: location.country || hotel.country,
          latitude: location.latitude || hotel.latitude,
          longitude: location.longitude || hotel.longitude,
        },
        rating: hotel.rating || hotel.stars || 0,
        reviewScore: hotel.reviewScore || 0,
        reviewCount: hotel.reviewCount || 0,
        images: hotel.images || (hotel.image ? [{ url: hotel.image, alt: hotel.name }] : []),
        thumbnail: hotel.thumbnail,
        amenities: hotel.amenities || [],
        rates,
        lowestPrice: lowestPriceValue > 0 ? {
          amount: lowestPriceValue.toString(),
          currency: hotel.currency || 'USD',
        } : undefined,
        lowestPricePerNight: hotel.lowestPricePerNight,
        // ✅ CRITICAL: Pass cancellation policy data from LiteAPI
        refundable: (hotel as any).refundable || false,
        hasRefundableRate: (hotel as any).hasRefundableRate || false,
        lowestRefundablePrice: (hotel as any).lowestRefundablePrice || null,
        refundableCancellationDeadline: (hotel as any).refundableCancellationDeadline || null,
        cancellationDeadline: (hotel as any).cancellationDeadline || null,
        boardType: (hotel as any).boardType || 'RO',
        source,
      };
    });

    // ✅ Get region-specific data using ISO country code
    const regionData = countryCode ? getHotelRegionData(countryCode) : null;
    const region = countryCode ? getRegionFromCountryCode(countryCode) : 'global';

    const response = {
      success: true,
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        sources: ['LiteAPI', 'Amadeus', 'Hotelbeds', 'Fly2Any'],
        apiResults: {
          liteAPI: results.meta.liteAPICount,
          amadeus: results.meta.amadeusCount,
          hotelbeds: results.meta.hotelbedsCount,
          fly2any: nativeProperties.length,
          totalBeforeDedup: results.meta.totalBeforeDedup,
          totalAfterDedup: results.meta.totalAfterDedup,
        },
        usedMinRates: results.meta.usedMinRates,
        performance: 'Multi-API aggregation with price deduplication (LiteAPI + Amadeus + Hotelbeds)',
        hotelbedsProcessTime: results.meta.hotelbedsTime,
        // ✅ ISO-based region data for 100% global coverage
        region: {
          code: region,
          countryCode: countryCode || 'XX',
          currency: regionData?.currency || 'USD',
          currencySymbol: regionData?.currencySymbol || '$',
          localChains: regionData?.localChains || [],
          priorityAmenities: regionData?.popularAmenities || [],
          checkInTime: regionData?.checkInTime || '14:00',
          checkOutTime: regionData?.checkOutTime || '11:00',
          tipping: regionData?.tipping || { percentage: 10, customary: false },
          taxIncluded: regionData?.taxIncluded ?? false,
          language: regionData?.languagePrimary || 'en',
        },
      },
    };

    // Store in cache (15 minutes TTL)
    await setCache(cacheKey, response, 900);

    console.log(`✅ Multi-API Aggregation: ${mappedHotels.length} hotels (LiteAPI: ${results.meta.liteAPICount}, Amadeus: ${results.meta.amadeusCount}, Hotelbeds: ${results.meta.hotelbedsCount})`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Sources': 'LITEAPI,AMADEUS,HOTELBEDS,FLY2ANY',
        'X-Performance-Mode': 'MULTI-API-AGGREGATION',
        'X-Hotel-Count-LiteAPI': results.meta.liteAPICount.toString(),
        'X-Hotel-Count-Amadeus': results.meta.amadeusCount.toString(),
        'X-Hotel-Count-Hotelbeds': results.meta.hotelbedsCount.toString(),
        'Cache-Control': 'public, max-age=900',
      }
    });
  });
}

/**
 * GET endpoint for URL-based searches
 * Supports both new (query/checkIn/checkOut) and legacy (cityCode/checkInDate/checkOutDate) parameters
 */
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const searchParams = request.nextUrl.searchParams;

    // Support both new and legacy parameter names
    const query = searchParams.get('query') || searchParams.get('cityCode');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const checkIn = searchParams.get('checkIn') || searchParams.get('checkInDate');
    const checkOut = searchParams.get('checkOut') || searchParams.get('checkOutDate');
    const adults = searchParams.get('adults');

    console.log('🔍 Hotel search GET request:', { query, lat, lng, checkIn, checkOut, adults });

    if (!(query || (lat && lng)) || !checkIn || !checkOut || !adults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          hint: 'Provide query/cityCode or lat/lng, checkIn/checkInDate, checkOut/checkOutDate, and adults'
        },
        { status: 400 }
      );
    }

    // ✅ CRITICAL: Past date validation - APIs return 0 results for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in date cannot be in the past',
          hint: `Check-in date ${checkIn} is before today (${today.toISOString().split('T')[0]}). Please select a future date.`,
          code: 'INVALID_CHECKIN_DATE',
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-out date must be after check-in date',
          hint: `Check-out ${checkOut} must be at least 1 day after check-in ${checkIn}.`,
          code: 'INVALID_CHECKOUT_DATE',
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
      // 1. Try local database first (fast)
      const cityCoords = getCityCoordinates(query);
      if (cityCoords) {
        latitude = cityCoords.lat;
        longitude = cityCoords.lng;
        console.log(`✅ Resolved "${query}" to coordinates:`, { latitude, longitude });
      } else {
        // 2. Fallback to Nominatim geocoding for unknown cities (worldwide coverage)
        const geocoded = await geocodeCity(query);
        if (geocoded) {
          latitude = geocoded.lat;
          longitude = geocoded.lng;
          console.log(`🌍 Geocoded "${query}" via Nominatim:`, { latitude, longitude });
        }
      }
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not determine location',
          hint: `Provide valid coordinates or a recognized city name. Searched for: "${query}"`,
          details: process.env.NODE_ENV === 'development' ? 'City not found in coordinate database' : undefined,
        },
        { status: 400 }
      );
    }

    // Parse room count and children
    const rooms = searchParams.get('rooms') ? parseInt(searchParams.get('rooms')!) : 1;
    const children = searchParams.get('children') ? parseInt(searchParams.get('children')!) : 0;

    // Parse child ages from comma-separated string (e.g., "2,5,8" for actual infant/child ages)
    // CRITICAL: Infants (age 0-2) often stay FREE at hotels!
    const childAgesParam = searchParams.get('childAges');
    const childAges: number[] = childAgesParam
      ? childAgesParam.split(',').map(age => parseInt(age.trim())).filter(age => !isNaN(age) && age >= 0 && age <= 17)
      : [];

    console.log('👶 Child ages for search:', { childAgesParam, childAges, children });

    // Generate cache key (v2: fixed coordinate validation, include ALL params for accurate pricing)
    const cacheKey = generateCacheKey('hotels:liteapi:search:get:v2', {
      latitude,
      longitude,
      checkIn,
      checkOut,
      adults,
      children,
      childAges: childAges.join(',') || 'default', // Include actual ages in cache key
      rooms,
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

    console.log('🔍 Searching hotels with Multi-API (GET - LiteAPI + Amadeus)...', { latitude, longitude, query });

    // Search hotels using MINIMUM rates (5x faster and more reliable!)
    // CRITICAL: Pass rooms param AND childAges for accurate multi-room pricing
    console.log(`🏨 [SEARCH] Searching with: ${adults} adults, ${children} children (ages: ${childAges.length > 0 ? childAges.join(',') : 'default'}), ${rooms} rooms`);

    // 1. LiteAPI Search (Primary)
    const liteAPIResults = await liteAPI.searchHotelsWithMinRates({
      latitude,
      longitude,
      checkIn,
      checkOut,
      adults: parseInt(adults),
      children,
      childAges: childAges.length > 0 ? childAges : undefined, // Pass actual ages for accurate pricing (infants 0-2 often FREE!)
      rooms,
      currency: searchParams.get('currency') || 'USD',
      guestNationality: 'US',
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 15, // 15km default for accurate city results
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
    }).catch(err => {
      console.error('⚠️ LiteAPI search failed:', err.message);
      return { hotels: [], meta: { usedMinRates: true, error: err.message } };
    });

    // 2. Amadeus Search (Additional inventory)
    let amadeusHotels: any[] = [];
    if (query) {
      try {
        const cityCode = extractCityCode(query);
        // Skip Amadeus if no valid city code found (prevents wrong city hotels)
        if (!cityCode) {
          console.log(`⚠️ Amadeus GET search skipped: no city code for "${query}"`);
        } else {
        console.log(`🔍 Amadeus GET search: "${query}" → city code: ${cityCode}`);

        const amadeusData = await amadeus.searchHotels({
          cityCode,
          checkInDate: checkIn!,
          checkOutDate: checkOut!,
          adults: parseInt(adults),
          roomQuantity: rooms,
        });

        if (amadeusData?.data?.length > 0) {
          // Calculate nights for per-night price
          const nights = Math.max(1, Math.ceil((new Date(checkOut!).getTime() - new Date(checkIn!).getTime()) / (1000*60*60*24)));

          amadeusHotels = amadeusData.data.map((offer: any) => {
            const mapped = mapAmadeusHotelToHotel(offer);
            const totalPrice = mapped.rates?.[0] ? parseFloat(mapped.rates[0].totalPrice.amount) : 0;

            return {
              id: `amadeus_${mapped.id}`,
              name: mapped.name,
              description: mapped.description || '',
              latitude: mapped.location?.lat || latitude,
              longitude: mapped.location?.lng || longitude,
              address: mapped.address?.street || '',
              city: mapped.address?.city || '',
              country: mapped.address?.country || '',
              stars: mapped.starRating || 4,
              rating: mapped.starRating || 4,
              reviewCount: 0,
              images: mapped.images?.map(img => ({ url: img.url, alt: mapped.name })) || [],
              image: mapped.images?.[0]?.url || null,
              thumbnail: mapped.images?.[0]?.url || null,
              amenities: mapped.amenities || [],
              lowestPrice: totalPrice,
              lowestPricePerNight: totalPrice / nights,
              currency: mapped.rates?.[0]?.totalPrice.currency || 'USD',
              rooms: mapped.rates?.map(rate => ({
                rateId: rate.id,
                name: rate.roomType,
                price: parseFloat(rate.totalPrice.amount),
                currency: rate.totalPrice.currency,
                refundable: rate.refundable,
                boardName: rate.mealsIncluded || 'Room Only',
              })) || [],
              source: 'Amadeus',
              refundable: mapped.rates?.some(r => r.refundable) || false,
            };
          });
          console.log(`✅ Amadeus GET returned ${amadeusHotels.length} additional hotels`);
        }
        } // end else (valid cityCode)
      } catch (amErr: any) {
        console.log(`⚠️ Amadeus hotel search (GET) failed: ${amErr.message}`);
      }
    }

    // 3. Combine and deduplicate results
    const allHotels = [...(liteAPIResults.hotels || []), ...amadeusHotels];
    console.log(`✅ Multi-API GET Results: LiteAPI (${liteAPIResults.hotels?.length || 0}) + Amadeus (${amadeusHotels.length}) = ${allHotels.length} total`);

    // Deduplicate hotels by name + approximate location
    const deduplicatedHotels: any[] = [];
    const seenHotels = new Map<string, any>();

    for (const hotel of allHotels) {
      const key = `${hotel.name.toLowerCase().trim()}:${Math.floor(hotel.latitude * 1000)}:${Math.floor(hotel.longitude * 1000)}`;

      if (!seenHotels.has(key)) {
        seenHotels.set(key, hotel);
        deduplicatedHotels.push(hotel);
      } else {
        // If duplicate, keep the one with better price
        const existing = seenHotels.get(key);
        if (existing) {
          const existingPrice = existing.lowestPricePerNight || existing.lowestPrice || Infinity;
          const newPrice = hotel.lowestPricePerNight || hotel.lowestPrice || Infinity;

          if (newPrice < existingPrice) {
            const index = deduplicatedHotels.indexOf(existing);
            if (index > -1) {
              deduplicatedHotels[index] = hotel;
              seenHotels.set(key, hotel);
            }
          }
        }
      }
    }

    // Sort by best price
    const sortedHotels = deduplicatedHotels.sort((a, b) => {
      const priceA = a.lowestPricePerNight || a.lowestPrice || Infinity;
      const priceB = b.lowestPricePerNight || b.lowestPrice || Infinity;
      return priceA - priceB;
    });

    console.log(`🔄 GET Deduplication: ${allHotels.length} → ${sortedHotels.length} unique hotels`);

    // 🚨 ALERT: Zero results monitoring (GET handler)
    if (sortedHotels.length === 0) {
      const alertData = {
        timestamp: new Date().toISOString(),
        query,
        checkIn,
        checkOut,
        latitude,
        longitude,
        liteAPICount: liteAPIResults.hotels?.length || 0,
        amadeusCount: amadeusHotels.length,
        liteAPIError: (liteAPIResults as any).meta?.error || null,
      };
      console.error('🚨 [HOTEL_SEARCH_ZERO_RESULTS_GET]', JSON.stringify(alertData));

      // Non-blocking alert
      import('@/lib/monitoring/customer-error-alerts').then(({ alertCustomerError }) => {
        alertCustomerError({
          errorMessage: `Hotel search (GET) returned 0 results for query: ${query}`,
          errorCode: 'HOTEL_SEARCH_ZERO_RESULTS',
          category: 'external_api',
          severity: 'high',
          url: `/api/hotels/search?query=${query}`,
          additionalData: alertData,
        }, { sendTelegram: true, sendEmail: true }).catch(console.error);
      }).catch(console.error);
    }

    // Map to expected format
    const mappedHotels = sortedHotels.map(hotel => ({
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
      images: hotel.images || (hotel.image ? [{ url: hotel.image, alt: hotel.name }] : []),
      thumbnail: hotel.thumbnail,
      amenities: hotel.amenities || [],
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
      lowestPricePerNight: hotel.lowestPricePerNight, // CRITICAL: Include per-night price
      // ✅ CRITICAL: Pass cancellation policy data from LiteAPI
      refundable: (hotel as any).refundable || false,
      hasRefundableRate: (hotel as any).hasRefundableRate || false,
      lowestRefundablePrice: (hotel as any).lowestRefundablePrice || null,
      refundableCancellationDeadline: (hotel as any).refundableCancellationDeadline || null,
      cancellationDeadline: (hotel as any).cancellationDeadline || null,
      boardType: (hotel as any).boardType || 'RO',
      source: hotel.source || 'LiteAPI', // Preserve source from original hotel
    }));

    const liteAPICount = liteAPIResults.hotels?.length || 0;
    const amadeusCount = amadeusHotels.length;

    const response = {
      success: true,
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        sources: ['LiteAPI', 'Amadeus'],
        apiResults: {
          liteAPI: liteAPICount,
          amadeus: amadeusCount,
          totalBeforeDedup: allHotels.length,
          totalAfterDedup: sortedHotels.length,
        },
        usedMinRates: liteAPIResults.meta?.usedMinRates,
        performance: 'Multi-API aggregation (LiteAPI + Amadeus)',
      },
    };

    // Cache for 15 minutes
    await setCache(cacheKey, response, 900);

    console.log(`✅ Multi-API GET: ${mappedHotels.length} hotels (LiteAPI: ${liteAPICount}, Amadeus: ${amadeusCount})`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Sources': 'LITEAPI,AMADEUS',
        'X-Performance-Mode': 'MULTI-API',
        'X-Hotel-Count-LiteAPI': liteAPICount.toString(),
        'X-Hotel-Count-Amadeus': amadeusCount.toString(),
        'Cache-Control': 'public, max-age=900',
      }
    });
  });
}
