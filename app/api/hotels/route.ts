import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
import { getCached, setCache, generateCacheKey } from '@/lib/cache/helpers';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

// City code to coordinates mapping
const CITY_CODE_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  // US Cities
  'NYC': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'LAX': { lat: 34.0522, lng: -118.2437, country: 'US' },
  'CHI': { lat: 41.8781, lng: -87.6298, country: 'US' },
  'MIA': { lat: 25.7617, lng: -80.1918, country: 'US' },
  'SFO': { lat: 37.7749, lng: -122.4194, country: 'US' },
  'LAS': { lat: 36.1699, lng: -115.1398, country: 'US' },
  'SEA': { lat: 47.6062, lng: -122.3321, country: 'US' },
  'BOS': { lat: 42.3601, lng: -71.0589, country: 'US' },
  'DEN': { lat: 39.7392, lng: -104.9903, country: 'US' },
  'ATL': { lat: 33.7490, lng: -84.3880, country: 'US' },
  'MCO': { lat: 28.5383, lng: -81.3792, country: 'US' },
  'IAH': { lat: 29.7604, lng: -95.3698, country: 'US' },
  'DFW': { lat: 32.7767, lng: -96.7970, country: 'US' },
  'PHX': { lat: 33.4484, lng: -112.0740, country: 'US' },
  'SAN': { lat: 32.7157, lng: -117.1611, country: 'US' },
  'DCA': { lat: 38.9072, lng: -77.0369, country: 'US' },
  'JFK': { lat: 40.6413, lng: -73.7781, country: 'US' },
  'EWR': { lat: 40.6895, lng: -74.1745, country: 'US' },
  // International
  'LON': { lat: 51.5074, lng: -0.1278, country: 'GB' },
  'LHR': { lat: 51.4700, lng: -0.4543, country: 'GB' },
  'PAR': { lat: 48.8566, lng: 2.3522, country: 'FR' },
  'CDG': { lat: 49.0097, lng: 2.5479, country: 'FR' },
  'ROM': { lat: 41.9028, lng: 12.4964, country: 'IT' },
  'FCO': { lat: 41.8003, lng: 12.2389, country: 'IT' },
  'BCN': { lat: 41.3851, lng: 2.1734, country: 'ES' },
  'TYO': { lat: 35.6762, lng: 139.6503, country: 'JP' },
  'NRT': { lat: 35.7720, lng: 140.3929, country: 'JP' },
  'DXB': { lat: 25.2048, lng: 55.2708, country: 'AE' },
  'SIN': { lat: 1.3521, lng: 103.8198, country: 'SG' },
  'HKG': { lat: 22.3193, lng: 114.1694, country: 'HK' },
  'SYD': { lat: -33.8688, lng: 151.2093, country: 'AU' },
  'CUN': { lat: 21.1619, lng: -86.8515, country: 'MX' },
  'YYZ': { lat: 43.6532, lng: -79.3832, country: 'CA' },
  'AMS': { lat: 52.3676, lng: 4.9041, country: 'NL' },
  'BER': { lat: 52.5200, lng: 13.4050, country: 'DE' },
  'MAD': { lat: 40.4168, lng: -3.7038, country: 'ES' },
  'LIS': { lat: 38.7223, lng: -9.1393, country: 'PT' },
  'BKK': { lat: 13.7563, lng: 100.5018, country: 'TH' },
  'DPS': { lat: -8.3405, lng: 115.0920, country: 'ID' },
};

function extractCityCode(value: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();

  if (trimmed.includes(',')) {
    const firstCode = trimmed.split(',')[0].trim();
    return extractCityCode(firstCode);
  }

  if (/^[A-Z]{3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const codeMatch = trimmed.match(/\(([A-Z]{3})\)|^([A-Z]{3})\s*-/i);
  if (codeMatch) {
    return (codeMatch[1] || codeMatch[2]).toUpperCase();
  }

  return trimmed.toUpperCase();
}

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    let cityCode: string | null = null;
    let checkInDate: string | null = null;
    let checkOutDate: string | null = null;
    let cacheKey: string = '';
    console.log('🏨 Hotels API - Request received');

    const { searchParams } = new URL(request.url);

    const cityCodeParam = searchParams.get('cityCode');
    cityCode = extractCityCode(cityCodeParam);

    console.log('🏨 Hotels API - City code extraction:', {
      cityCodeParam,
      extractedCityCode: cityCode
    });

    checkInDate = searchParams.get('checkInDate');
    checkOutDate = searchParams.get('checkOutDate');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children') || '0';
    const rooms = searchParams.get('rooms') || '1';

    // Parse child ages from comma-separated string (e.g., "2,5,8")
    const childAgesParam = searchParams.get('childAges');
    const childAges: number[] = childAgesParam
      ? childAgesParam.split(',').map(age => parseInt(age.trim())).filter(age => !isNaN(age) && age >= 0 && age <= 17)
      : [];

    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return NextResponse.json(
        { error: 'cityCode, checkInDate, checkOutDate, and adults are required' },
        { status: 400 }
      );
    }

    if (cityCode.length !== 3) {
      return NextResponse.json(
        {
          error: 'Invalid city code format',
          details: `City code "${cityCode}" must be exactly 3 letters. Examples: LON, NYC, PAR`
        },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkInDate)) {
      return NextResponse.json(
        { error: 'Invalid checkInDate format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (!dateRegex.test(checkOutDate)) {
      return NextResponse.json(
        { error: 'Invalid checkOutDate format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    const checkOut = new Date(checkOutDate);
    checkOut.setHours(0, 0, 0, 0);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        {
          error: 'Check-out date must be after check-in date',
          details: { checkInDate, checkOutDate }
        },
        { status: 400 }
      );
    }

    cacheKey = generateCacheKey('hotels:liteapi', {
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      children,
      childAges: childAges.join(',') || 'default',
      rooms,
    });

    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached hotel results (LiteAPI)');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'X-API-Source': 'LITEAPI',
        }
      });
    }

    // Get coordinates from city code
    const coords = CITY_CODE_COORDINATES[cityCode];
    if (!coords) {
      return NextResponse.json(
        {
          error: 'Unknown city code',
          details: `City code "${cityCode}" not found. Supported codes: ${Object.keys(CITY_CODE_COORDINATES).join(', ')}`
        },
        { status: 400 }
      );
    }

    console.log('🔍 Searching hotels with LiteAPI...', { cityCode, coords });

    // Check if LiteAPI is configured
    if (!liteAPI.isConfigured()) {
      console.error('❌ LiteAPI not configured - missing API key');
      return NextResponse.json({
        data: [],
        meta: {
          count: 0,
          message: 'Hotel search service not configured. Please contact support.',
        }
      }, { status: 200 });
    }

    // Search hotels using LiteAPI
    // If childAges provided, use them; otherwise let LiteAPI use defaults
    const results = await liteAPI.searchHotelsWithRates({
      latitude: coords.lat,
      longitude: coords.lng,
      checkinDate: checkInDate,
      checkoutDate: checkOutDate,
      adults: parseInt(adults),
      children: parseInt(children),
      childAges: childAges.length > 0 ? childAges : undefined, // Pass actual ages if provided
      rooms: parseInt(rooms),
      currency: 'USD',
      guestNationality: 'US',
      limit: 30,
    });

    // Map to expected format
    const mappedHotels = results.hotels.map(hotel => ({
      hotelId: hotel.id,
      name: hotel.name,
      description: hotel.description,
      address: {
        lines: [hotel.address],
        cityName: hotel.city,
        countryCode: hotel.country,
      },
      geoCode: {
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      },
      rating: hotel.stars?.toString() || '0',
      reviewScore: hotel.rating,
      reviewCount: hotel.reviewCount,
      media: hotel.image ? [{ uri: hotel.image }] : [],
      offers: hotel.rooms?.map(room => ({
        id: room.offerId,
        room: {
          type: room.name,
          description: { text: room.boardName },
        },
        price: {
          total: room.price.toString(),
          currency: room.currency,
        },
        policies: {
          cancellation: { description: { text: room.refundable ? 'Free cancellation' : 'Non-refundable' } },
        },
      })) || [],
      lowestPrice: hotel.lowestPrice,
      currency: hotel.currency,
      source: 'liteapi',
    }));

    const response = {
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        source: 'LiteAPI',
        message: mappedHotels.length === 0
          ? `No hotels found in ${cityCode} for ${checkInDate} to ${checkOutDate}. Try different dates.`
          : undefined,
      }
    };

    // Cache for 30 minutes
    await setCache(cacheKey, response, 1800);

    console.log(`✅ Found ${mappedHotels.length} hotels with LiteAPI`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Source': 'LITEAPI',
      }
    });
  }, { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.HIGH });
}
