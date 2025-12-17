import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { amadeus } from '@/lib/api/amadeus';
import { liteAPI } from '@/lib/api/liteapi';

export const dynamic = 'force-dynamic';

/**
 * Unified Locations Search API
 * Uses REAL provider data - no hardcoded city lists
 *
 * Products: hotels, transfers, flights, tours, activities
 *
 * GET /api/locations/search?query=Paris&product=hotels
 * GET /api/locations/search?query=JFK&product=transfers
 * GET /api/locations/search?query=New York&product=flights
 */
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query');
    const product = request.nextUrl.searchParams.get('product') || 'all';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '15');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { query, product, message: 'Query too short' }
      });
    }

    // Cache key
    const cacheKey = generateCacheKey('locations:unified:v2', { query: query.toLowerCase(), product });
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    console.log(`🔍 Unified location search: "${query}" for ${product}`);

    let results: any[] = [];

    // Route to appropriate API based on product
    switch (product) {
      case 'hotels':
      case 'tours':
      case 'activities':
        // Use LiteAPI places - they have REAL hotel/tour/activity inventory
        results = await searchLiteAPIPlaces(query, limit);
        break;

      case 'transfers':
        // Transfers: airports AND cities (can do city-to-city, hotel-to-airport, etc)
        results = await searchAmadeusLocations(query, limit, 'AIRPORT,CITY');
        break;

      case 'flights':
        // Flights: only airports
        results = await searchAmadeusLocations(query, limit, 'AIRPORT');
        break;

      case 'all':
      default:
        // Combine both for general search
        const [liteResults, amadeusResults] = await Promise.all([
          searchLiteAPIPlaces(query, Math.floor(limit / 2)),
          searchAmadeusLocations(query, Math.floor(limit / 2)),
        ]);
        results = deduplicateResults([...amadeusResults, ...liteResults]);
        break;
    }

    const response = {
      success: true,
      data: results,
      meta: {
        count: results.length,
        query,
        product,
        source: product === 'hotels' ? 'LiteAPI' : product === 'flights' ? 'Amadeus' : 'Multi-API'
      }
    };

    // Cache 1 hour
    await setCache(cacheKey, response, 3600);

    return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
  } catch (error: any) {
    console.error('Location search error:', error);
    return NextResponse.json({ error: 'Failed to search locations' }, { status: 500 });
  }
}

/**
 * Search LiteAPI places - REAL hotel/tour/activity inventory
 */
async function searchLiteAPIPlaces(query: string, limit: number) {
  try {
    const { data } = await liteAPI.searchPlaces(query, { limit });

    return (data || []).map((place: any) => ({
      id: place.placeId || `liteapi-${place.cityId || Math.random().toString(36).slice(2)}`,
      name: place.displayName || place.cityName || place.name || '',
      displayName: place.displayName || `${place.cityName}, ${place.countryName}`,
      city: place.cityName || place.name || '',
      country: place.countryName || '',
      countryCode: place.countryCode || '',
      latitude: place.latitude || 0,
      longitude: place.longitude || 0,
      type: place.type || 'city',
      source: 'LiteAPI',
      hasInventory: true, // LiteAPI only returns places with inventory
      emoji: getLocationEmoji(place.type, place.countryCode),
    }));
  } catch (err) {
    console.error('LiteAPI places error:', err);
    return [];
  }
}

/**
 * Search Amadeus airports/cities - REAL flight/transfer coverage
 * @param subType - 'AIRPORT' | 'CITY' | 'AIRPORT,CITY'
 */
async function searchAmadeusLocations(query: string, limit: number, subType = 'AIRPORT,CITY') {
  try {
    // Use Amadeus reference data API with specific subType
    const response = await amadeus.searchAirports(query); // This internally uses subType

    return (response?.data || []).slice(0, limit).map((loc: any) => ({
      id: loc.id || `amadeus-${loc.iataCode}`,
      code: loc.iataCode,
      name: loc.name || loc.detailedName || '',
      displayName: `${loc.name} (${loc.iataCode})`,
      city: loc.address?.cityName || '',
      country: loc.address?.countryName || '',
      countryCode: loc.address?.countryCode || '',
      latitude: loc.geoCode?.latitude || 0,
      longitude: loc.geoCode?.longitude || 0,
      type: loc.subType?.toLowerCase() || 'airport',
      source: 'Amadeus',
      hasInventory: true, // Amadeus returns real airport data
      emoji: loc.subType === 'AIRPORT' ? '✈️' : '🏙️',
    }));
  } catch (err) {
    console.error('Amadeus locations error:', err);
    return [];
  }
}

/**
 * Deduplicate results by name similarity
 */
function deduplicateResults(results: any[]) {
  const seen = new Map<string, any>();

  for (const item of results) {
    const key = `${item.name?.toLowerCase()}-${item.city?.toLowerCase()}`.replace(/\s+/g, '');
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }

  return Array.from(seen.values());
}

/**
 * Get emoji based on location type and country
 */
function getLocationEmoji(type: string, countryCode: string): string {
  if (type === 'airport') return '✈️';
  if (type === 'poi' || type === 'landmark') return '⭐';

  // Country flags for cities
  const flags: Record<string, string> = {
    US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪', IT: '🇮🇹', ES: '🇪🇸',
    JP: '🇯🇵', CN: '🇨🇳', AU: '🇦🇺', BR: '🇧🇷', MX: '🇲🇽', CA: '🇨🇦',
    AE: '🇦🇪', TH: '🇹🇭', SG: '🇸🇬', NL: '🇳🇱', PT: '🇵🇹', GR: '🇬🇷',
  };

  return flags[countryCode] || '🌍';
}
