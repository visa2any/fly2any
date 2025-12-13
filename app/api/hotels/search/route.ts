import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi'; // ✅ Updated with amenities support
import { searchHotels as searchHotelbeds, normalizeHotelbedsHotel } from '@/lib/api/hotelbeds';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import type { HotelSearchParams, Hotel } from '@/lib/hotels/types';

// Cost protection - blocks bots and suspicious requests BEFORE expensive API calls
import { checkCostGuard, COST_GUARDS } from '@/lib/security/cost-protection';

// Error monitoring - sends alerts for all errors
import { handleApiError } from '@/lib/monitoring/global-error-handler';

// Comprehensive city name to coordinates mapping
// Matches the suggestions API database for consistent location lookups
const CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  // United States - Major Cities
  'new york': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'new york city': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'nyc': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'manhattan': { lat: 40.7831, lng: -73.9712, country: 'US' },
  'brooklyn': { lat: 40.6782, lng: -73.9442, country: 'US' },
  'times square': { lat: 40.7580, lng: -73.9855, country: 'US' },
  'los angeles': { lat: 34.0522, lng: -118.2437, country: 'US' },
  'la': { lat: 34.0522, lng: -118.2437, country: 'US' },
  'hollywood': { lat: 34.0928, lng: -118.3287, country: 'US' },
  'santa monica': { lat: 34.0195, lng: -118.4912, country: 'US' },
  'beverly hills': { lat: 34.0736, lng: -118.4004, country: 'US' },
  'miami': { lat: 25.7617, lng: -80.1918, country: 'US' },
  'south beach': { lat: 25.7907, lng: -80.1300, country: 'US' },
  'chicago': { lat: 41.8781, lng: -87.6298, country: 'US' },
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
  'washington dc': { lat: 38.9072, lng: -77.0369, country: 'US' },
  'dc': { lat: 38.9072, lng: -77.0369, country: 'US' },
  'nashville': { lat: 36.1627, lng: -86.7816, country: 'US' },
  'austin': { lat: 30.2672, lng: -97.7431, country: 'US' },
  'new orleans': { lat: 29.9511, lng: -90.0715, country: 'US' },
  'nola': { lat: 29.9511, lng: -90.0715, country: 'US' },
  'minneapolis': { lat: 44.9778, lng: -93.2650, country: 'US' },
  'portland': { lat: 45.5152, lng: -122.6784, country: 'US' },
  'philadelphia': { lat: 39.9526, lng: -75.1652, country: 'US' },
  'philly': { lat: 39.9526, lng: -75.1652, country: 'US' },
  'salt lake city': { lat: 40.7608, lng: -111.8910, country: 'US' },
  'honolulu': { lat: 21.3069, lng: -157.8583, country: 'US' },
  'hawaii': { lat: 21.3069, lng: -157.8583, country: 'US' },
  'waikiki': { lat: 21.2793, lng: -157.8292, country: 'US' },

  // Europe
  'london': { lat: 51.5074, lng: -0.1278, country: 'GB' },
  'westminster': { lat: 51.4975, lng: -0.1357, country: 'GB' },
  'paris': { lat: 48.8566, lng: 2.3522, country: 'FR' },
  'rome': { lat: 41.9028, lng: 12.4964, country: 'IT' },
  'roma': { lat: 41.9028, lng: 12.4964, country: 'IT' },
  'barcelona': { lat: 41.3851, lng: 2.1734, country: 'ES' },
  'madrid': { lat: 40.4168, lng: -3.7038, country: 'ES' },
  'amsterdam': { lat: 52.3676, lng: 4.9041, country: 'NL' },
  'berlin': { lat: 52.5200, lng: 13.4050, country: 'DE' },
  'munich': { lat: 48.1351, lng: 11.5820, country: 'DE' },
  'münchen': { lat: 48.1351, lng: 11.5820, country: 'DE' },
  'vienna': { lat: 48.2082, lng: 16.3738, country: 'AT' },
  'wien': { lat: 48.2082, lng: 16.3738, country: 'AT' },
  'prague': { lat: 50.0755, lng: 14.4378, country: 'CZ' },
  'praha': { lat: 50.0755, lng: 14.4378, country: 'CZ' },
  'lisbon': { lat: 38.7223, lng: -9.1393, country: 'PT' },
  'lisboa': { lat: 38.7223, lng: -9.1393, country: 'PT' },
  'dublin': { lat: 53.3498, lng: -6.2603, country: 'IE' },
  'edinburgh': { lat: 55.9533, lng: -3.1883, country: 'GB' },
  'milan': { lat: 45.4642, lng: 9.1900, country: 'IT' },
  'milano': { lat: 45.4642, lng: 9.1900, country: 'IT' },
  'florence': { lat: 43.7696, lng: 11.2558, country: 'IT' },
  'firenze': { lat: 43.7696, lng: 11.2558, country: 'IT' },
  'venice': { lat: 45.4408, lng: 12.3155, country: 'IT' },
  'venezia': { lat: 45.4408, lng: 12.3155, country: 'IT' },
  'athens': { lat: 37.9838, lng: 23.7275, country: 'GR' },
  'santorini': { lat: 36.3932, lng: 25.4615, country: 'GR' },
  'brussels': { lat: 50.8503, lng: 4.3517, country: 'BE' },
  'zurich': { lat: 47.3769, lng: 8.5417, country: 'CH' },
  'zürich': { lat: 47.3769, lng: 8.5417, country: 'CH' },
  'geneva': { lat: 46.2044, lng: 6.1432, country: 'CH' },
  'copenhagen': { lat: 55.6761, lng: 12.5683, country: 'DK' },
  'stockholm': { lat: 59.3293, lng: 18.0686, country: 'SE' },
  'oslo': { lat: 59.9139, lng: 10.7522, country: 'NO' },
  'helsinki': { lat: 60.1699, lng: 24.9384, country: 'FI' },
  'istanbul': { lat: 41.0082, lng: 28.9784, country: 'TR' },
  'budapest': { lat: 47.4979, lng: 19.0402, country: 'HU' },
  'warsaw': { lat: 52.2297, lng: 21.0122, country: 'PL' },
  'warszawa': { lat: 52.2297, lng: 21.0122, country: 'PL' },
  'krakow': { lat: 50.0647, lng: 19.9450, country: 'PL' },
  'kraków': { lat: 50.0647, lng: 19.9450, country: 'PL' },
  'moscow': { lat: 55.7558, lng: 37.6173, country: 'RU' },

  // Asia
  'tokyo': { lat: 35.6762, lng: 139.6503, country: 'JP' },
  'shibuya': { lat: 35.6580, lng: 139.7016, country: 'JP' },
  'shinjuku': { lat: 35.6938, lng: 139.7034, country: 'JP' },
  'osaka': { lat: 34.6937, lng: 135.5023, country: 'JP' },
  'kyoto': { lat: 35.0116, lng: 135.7681, country: 'JP' },
  'singapore': { lat: 1.3521, lng: 103.8198, country: 'SG' },
  'marina bay': { lat: 1.2834, lng: 103.8607, country: 'SG' },
  'hong kong': { lat: 22.3193, lng: 114.1694, country: 'HK' },
  'hk': { lat: 22.3193, lng: 114.1694, country: 'HK' },
  'bangkok': { lat: 13.7563, lng: 100.5018, country: 'TH' },
  'phuket': { lat: 7.9519, lng: 98.3381, country: 'TH' },
  'bali': { lat: -8.3405, lng: 115.0920, country: 'ID' },
  'denpasar': { lat: -8.3405, lng: 115.0920, country: 'ID' },
  'ubud': { lat: -8.5069, lng: 115.2625, country: 'ID' },
  'seminyak': { lat: -8.6913, lng: 115.1681, country: 'ID' },
  'kuala lumpur': { lat: 3.1390, lng: 101.6869, country: 'MY' },
  'kl': { lat: 3.1390, lng: 101.6869, country: 'MY' },
  'manila': { lat: 14.5995, lng: 120.9842, country: 'PH' },
  'ho chi minh city': { lat: 10.8231, lng: 106.6297, country: 'VN' },
  'ho chi minh': { lat: 10.8231, lng: 106.6297, country: 'VN' },
  'saigon': { lat: 10.8231, lng: 106.6297, country: 'VN' },
  'hanoi': { lat: 21.0285, lng: 105.8542, country: 'VN' },
  'seoul': { lat: 37.5665, lng: 126.9780, country: 'KR' },
  'beijing': { lat: 39.9042, lng: 116.4074, country: 'CN' },
  'peking': { lat: 39.9042, lng: 116.4074, country: 'CN' },
  'shanghai': { lat: 31.2304, lng: 121.4737, country: 'CN' },
  'new delhi': { lat: 28.6139, lng: 77.2090, country: 'IN' },
  'delhi': { lat: 28.6139, lng: 77.2090, country: 'IN' },
  'mumbai': { lat: 19.0760, lng: 72.8777, country: 'IN' },
  'bombay': { lat: 19.0760, lng: 72.8777, country: 'IN' },
  'goa': { lat: 15.2993, lng: 74.1240, country: 'IN' },

  // Middle East
  'dubai': { lat: 25.2048, lng: 55.2708, country: 'AE' },
  'abu dhabi': { lat: 24.4539, lng: 54.3773, country: 'AE' },
  'doha': { lat: 25.2854, lng: 51.5310, country: 'QA' },
  'tel aviv': { lat: 32.0853, lng: 34.7818, country: 'IL' },

  // Oceania
  'sydney': { lat: -33.8688, lng: 151.2093, country: 'AU' },
  'bondi beach': { lat: -33.8914, lng: 151.2767, country: 'AU' },
  'melbourne': { lat: -37.8136, lng: 144.9631, country: 'AU' },
  'brisbane': { lat: -27.4698, lng: 153.0251, country: 'AU' },
  'perth': { lat: -31.9505, lng: 115.8605, country: 'AU' },
  'gold coast': { lat: -28.0167, lng: 153.4000, country: 'AU' },
  'auckland': { lat: -36.8509, lng: 174.7645, country: 'NZ' },
  'queenstown': { lat: -45.0312, lng: 168.6626, country: 'NZ' },

  // Americas (Canada, Mexico, South America)
  'toronto': { lat: 43.6532, lng: -79.3832, country: 'CA' },
  'vancouver': { lat: 49.2827, lng: -123.1207, country: 'CA' },
  'montreal': { lat: 45.5017, lng: -73.5673, country: 'CA' },
  'cancun': { lat: 21.1619, lng: -86.8515, country: 'MX' },
  'cancún': { lat: 21.1619, lng: -86.8515, country: 'MX' },
  'mexico city': { lat: 19.4326, lng: -99.1332, country: 'MX' },
  'cdmx': { lat: 19.4326, lng: -99.1332, country: 'MX' },
  'puerto vallarta': { lat: 20.6534, lng: -105.2253, country: 'MX' },
  'los cabos': { lat: 22.8905, lng: -109.9167, country: 'MX' },
  'cabo': { lat: 22.8905, lng: -109.9167, country: 'MX' },
  'cabo san lucas': { lat: 22.8905, lng: -109.9167, country: 'MX' },
  // South America
  'são paulo': { lat: -23.5505, lng: -46.6333, country: 'BR' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, country: 'BR' },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729, country: 'BR' },
  'rio': { lat: -22.9068, lng: -43.1729, country: 'BR' },
  'copacabana': { lat: -22.9711, lng: -43.1822, country: 'BR' },
  'bogotá': { lat: 4.7110, lng: -74.0721, country: 'CO' },
  'bogota': { lat: 4.7110, lng: -74.0721, country: 'CO' },
  'cartagena': { lat: 10.3910, lng: -75.4794, country: 'CO' },
  'lima': { lat: -12.0464, lng: -77.0428, country: 'PE' },
  'cusco': { lat: -13.5320, lng: -71.9675, country: 'PE' },
  'cuzco': { lat: -13.5320, lng: -71.9675, country: 'PE' },
  'machu picchu': { lat: -13.5320, lng: -71.9675, country: 'PE' },
  'santiago': { lat: -33.4489, lng: -70.6693, country: 'CL' },
  'buenos aires': { lat: -34.6037, lng: -58.3816, country: 'AR' },

  // Africa
  'johannesburg': { lat: -26.2041, lng: 28.0473, country: 'ZA' },
  'joburg': { lat: -26.2041, lng: 28.0473, country: 'ZA' },
  'cape town': { lat: -33.9249, lng: 18.4241, country: 'ZA' },
  'cairo': { lat: 30.0444, lng: 31.2357, country: 'EG' },
  'casablanca': { lat: 33.5731, lng: -7.5898, country: 'MA' },
  'marrakech': { lat: 31.6295, lng: -7.9811, country: 'MA' },
  'marrakesh': { lat: 31.6295, lng: -7.9811, country: 'MA' },
  'nairobi': { lat: -1.2921, lng: 36.8219, country: 'KE' },
  'mauritius': { lat: -20.1609, lng: 57.5012, country: 'MU' },
  'seychelles': { lat: -4.6191, lng: 55.4513, country: 'SC' },
  'maldives': { lat: 4.1755, lng: 73.5093, country: 'MV' },

  // Caribbean
  'nassau': { lat: 25.0443, lng: -77.3504, country: 'BS' },
  'bahamas': { lat: 25.0443, lng: -77.3504, country: 'BS' },
  'montego bay': { lat: 18.4762, lng: -77.8939, country: 'JM' },
  'jamaica': { lat: 18.4762, lng: -77.8939, country: 'JM' },
  'punta cana': { lat: 18.5601, lng: -68.3725, country: 'DO' },
  'san juan': { lat: 18.4655, lng: -66.1057, country: 'PR' },
  'puerto rico': { lat: 18.4655, lng: -66.1057, country: 'PR' },
  'aruba': { lat: 12.5092, lng: -70.0086, country: 'AW' },
  'curaçao': { lat: 12.1696, lng: -68.9900, country: 'CW' },
  'curacao': { lat: 12.1696, lng: -68.9900, country: 'CW' },
  'st maarten': { lat: 18.0237, lng: -63.0458, country: 'SX' },
  'saint martin': { lat: 18.0237, lng: -63.0458, country: 'SX' },
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

    console.log('🔍 Searching hotels with MULTI-API AGGREGATION (LiteAPI + Hotelbeds)...', { latitude, longitude, countryCode });

    // PARALLEL MULTI-API SEARCH STRATEGY
    // Search both LiteAPI AND Hotelbeds simultaneously for maximum inventory
    const searchPromises = [];

    // 1. LiteAPI Search (Primary - Fast with minimum rates)
    // CRITICAL: Include rooms param for accurate multi-room pricing
    const roomCount = body.rooms || 1;
    console.log(`🏨 [POST SEARCH] ${searchParams.guests?.adults || 2} adults, ${Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0} children, ${roomCount} rooms`);
    const liteAPIPromise = liteAPI.searchHotelsWithMinRates({
      latitude,
      longitude,
      checkinDate: searchParams.checkIn!,
      checkoutDate: searchParams.checkOut!,
      adults: searchParams.guests?.adults || 2,
      children: Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0,
      rooms: roomCount,
      currency: searchParams.currency || 'USD',
      guestNationality: 'US',
      limit: searchParams.limit || 30,
    }).catch(err => {
      console.error('⚠️ LiteAPI search failed:', err.message);
      return { hotels: [], meta: { usedMinRates: true, error: err.message } };
    });

    searchPromises.push(liteAPIPromise);

    // 2. Hotelbeds Search (Secondary - Wholesale rates)
    const hotelbedsPromise = (async () => {
      try {
        // DISABLED IN PRODUCTION - Hotelbeds is for testing only
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
          console.log('🚫 Hotelbeds disabled in production environment');
          return { hotels: [], processTime: 0 };
        }

        // Check if Hotelbeds is configured
        if (!process.env.HOTELBEDS_API_KEY || !process.env.HOTELBEDS_SECRET) {
          console.log('ℹ️ Hotelbeds not configured, skipping');
          return { hotels: [], processTime: 0 };
        }

        // Build paxes array for Hotelbeds
        const paxes = [];
        const adults = searchParams.guests?.adults || 2;
        for (let i = 0; i < adults; i++) {
          paxes.push({ type: 'AD' as const, age: 30 });
        }
        const childrenCount = Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0;
        for (let i = 0; i < childrenCount; i++) {
          paxes.push({ type: 'CH' as const, age: 10 });
        }

        const hotelbedsResults = await searchHotelbeds({
          stay: {
            checkIn: searchParams.checkIn!,
            checkOut: searchParams.checkOut!,
          },
          occupancies: [{
            rooms: 1,
            adults: adults,
            children: childrenCount,
            paxes,
          }],
          geolocation: {
            latitude,
            longitude,
            radius: searchParams.radius || 20,
            unit: 'km',
          },
          language: 'ENG',
        });

        const hotelbedsHotels = (hotelbedsResults.hotels?.hotels || []).map(hotel =>
          normalizeHotelbedsHotel(hotel, searchParams.checkIn!, searchParams.checkOut!)
        );

        return {
          hotels: hotelbedsHotels,
          processTime: hotelbedsResults.auditData?.processTime,
        };
      } catch (err: any) {
        console.error('⚠️ Hotelbeds search failed:', err.message);
        return { hotels: [], processTime: 0, error: err.message };
      }
    })();

    searchPromises.push(hotelbedsPromise);

    // Execute searches in parallel
    const [liteAPIResults, hotelbedsResults] = await Promise.all(searchPromises);

    // Combine results from both APIs
    const allHotels = [...(liteAPIResults.hotels || []), ...(hotelbedsResults.hotels || [])];

    console.log(`✅ Multi-API Results: LiteAPI (${liteAPIResults.hotels?.length || 0}) + Hotelbeds (${hotelbedsResults.hotels?.length || 0}) = ${allHotels.length} total`);

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

    const response = {
      success: true,
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        sources: ['LiteAPI', 'Hotelbeds'],
        apiResults: {
          liteAPI: results.meta.liteAPICount,
          hotelbeds: results.meta.hotelbedsCount,
          totalBeforeDedup: results.meta.totalBeforeDedup,
          totalAfterDedup: results.meta.totalAfterDedup,
        },
        usedMinRates: results.meta.usedMinRates,
        performance: 'Multi-API aggregation with price deduplication',
        hotelbedsProcessTime: results.meta.hotelbedsTime,
      },
    };

    // Store in cache (15 minutes TTL)
    await setCache(cacheKey, response, 900);

    console.log(`✅ Multi-API Aggregation: ${mappedHotels.length} hotels (LiteAPI: ${results.meta.liteAPICount}, Hotelbeds: ${results.meta.hotelbedsCount})`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Sources': 'LITEAPI,HOTELBEDS',
        'X-Performance-Mode': 'MULTI-API-AGGREGATION',
        'X-Hotel-Count-LiteAPI': results.meta.liteAPICount.toString(),
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
        console.log(`✅ Resolved "${query}" to coordinates:`, { latitude, longitude });
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

    // Generate cache key (include ALL params for accurate pricing)
    const cacheKey = generateCacheKey('hotels:liteapi:search:get', {
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

    console.log('🔍 Searching hotels with LiteAPI (GET - FAST MODE)...', { latitude, longitude });

    // Search hotels using MINIMUM rates (5x faster and more reliable!)
    // CRITICAL: Pass rooms param AND childAges for accurate multi-room pricing
    console.log(`🏨 [SEARCH] Searching with: ${adults} adults, ${children} children (ages: ${childAges.length > 0 ? childAges.join(',') : 'default'}), ${rooms} rooms`);
    const results = await liteAPI.searchHotelsWithMinRates({
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
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
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
      source: 'liteapi',
    }));

    const response = {
      success: true,
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        source: 'LiteAPI',
        usedMinRates: results.meta.usedMinRates,
        performance: 'Optimized with minimum rates endpoint (5x faster)',
      },
    };

    // Cache for 15 minutes
    await setCache(cacheKey, response, 900);

    console.log(`✅ Found ${mappedHotels.length} hotels with LiteAPI (GET - fast mode)`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Source': 'LITEAPI',
        'X-Performance-Mode': 'FAST',
        'Cache-Control': 'public, max-age=900',
      }
    });
  });
}
