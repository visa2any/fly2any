import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { GLOBAL_CITIES, POPULAR_DESTINATIONS as POPULAR_CITIES, type CityDestination } from '@/lib/data/global-cities-database';
import { cityLocations, getCityData } from '@/lib/data/city-locations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Type alias for compatibility with existing code
type CitySuggestion = CityDestination;

/**
 * Normalize string for accent-insensitive matching
 * Converts "São Paulo" → "sao paulo" and "Bogotá" → "bogota"
 * Uses NFD (Canonical Decomposition) to separate base characters from diacritical marks
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .trim();
}

// Use the comprehensive global cities database (522+ destinations)
const CITY_DATABASE: CitySuggestion[] = GLOBAL_CITIES;

/**
 * Add latitude/longitude at root level for EnhancedSearchBar compatibility
 */
function normalizeForFrontend(item: any): CitySuggestion {
  return {
    ...item,
    latitude: item.location?.lat || item.latitude || 0,
    longitude: item.location?.lng || item.longitude || 0,
  };
}

/**
 * Search cities with fuzzy matching and accent-insensitive search
 * Now supports "Sao Paulo" matching "São Paulo", "Bogota" matching "Bogotá", etc.
 */
function searchCities(query: string): CitySuggestion[] {
  const normalizedQuery = normalizeString(query);

  if (normalizedQuery.length < 2) return [];

  const results: Array<{ city: CitySuggestion; score: number }> = [];

  for (const city of CITY_DATABASE) {
    let score = 0;

    // Normalize all fields for accent-insensitive matching
    const normalizedName = normalizeString(city.name);
    const normalizedCity = normalizeString(city.city);
    const normalizedCountry = normalizeString(city.country);
    const normalizedId = normalizeString(city.id);
    const normalizedAliases = city.aliases?.map(normalizeString) || [];

    // Exact name match (highest priority)
    if (normalizedName === normalizedQuery) {
      score = 100;
    }
    // City name starts with query
    else if (normalizedName.startsWith(normalizedQuery)) {
      score = 80;
    }
    // City field starts with query
    else if (normalizedCity.startsWith(normalizedQuery)) {
      score = 75;
    }
    // Alias match (important for "sao paulo" → "são paulo")
    else if (normalizedAliases.some(alias => alias.includes(normalizedQuery) || normalizedQuery.includes(alias))) {
      score = 70;
    }
    // Name contains query
    else if (normalizedName.includes(normalizedQuery)) {
      score = 60;
    }
    // City contains query
    else if (normalizedCity.includes(normalizedQuery)) {
      score = 55;
    }
    // ID match (airport/city codes)
    else if (normalizedId === normalizedQuery) {
      score = 90;
    }
    // Country contains query
    else if (normalizedCountry.includes(normalizedQuery)) {
      score = 30;
    }

    if (score > 0) {
      // Boost cities over neighborhoods/landmarks/POIs
      if (city.type === 'city') score += 5;

      // Boost popular destinations (popularity 8-10 get extra points)
      const popularityBoost = (city.popularity || 0) * 2;
      score += popularityBoost;

      results.push({ city, score });
    }
  }

  // Sort by score descending, then by popularity, then alphabetically
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if ((b.city.popularity || 0) !== (a.city.popularity || 0)) {
      return (b.city.popularity || 0) - (a.city.popularity || 0);
    }
    return a.city.name.localeCompare(b.city.name);
  });

  return results.slice(0, 10).map(r => r.city);
}

// Popular/trending destinations (top 25 cities with popularity >= 9)
const POPULAR_DESTINATIONS: CitySuggestion[] = POPULAR_CITIES;

/**
 * Search through popular districts from our city locations database
 * Returns matching districts with their parent city coordinates
 */
function searchPopularDistricts(query: string): CitySuggestion[] {
  const normalizedQuery = normalizeString(query);
  if (normalizedQuery.length < 2) return [];

  const results: CitySuggestion[] = [];

  for (const [cityKey, cityData] of Object.entries(cityLocations)) {
    const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);

    for (const district of cityData.popularDistricts) {
      const normalizedDistrict = normalizeString(district);
      const normalizedCityName = normalizeString(cityName);

      // Check if query matches district or "district, city" format
      const fullName = `${district}, ${cityName}`;
      const normalizedFullName = normalizeString(fullName);

      let score = 0;

      // Exact district match
      if (normalizedDistrict === normalizedQuery) {
        score = 90;
      }
      // District starts with query
      else if (normalizedDistrict.startsWith(normalizedQuery)) {
        score = 80;
      }
      // District contains query
      else if (normalizedDistrict.includes(normalizedQuery)) {
        score = 70;
      }
      // Full name contains query (e.g., "itaim sao" matches "Itaim Bibi, São Paulo")
      else if (normalizedFullName.includes(normalizedQuery)) {
        score = 65;
      }
      // Query contains city name and district is in that city
      else if (normalizedQuery.includes(normalizedCityName) && normalizedDistrict.includes(normalizedQuery.replace(normalizedCityName, '').trim())) {
        score = 60;
      }

      if (score > 0) {
        results.push({
          id: `district-${cityKey}-${normalizeString(district).replace(/\s+/g, '-')}`,
          name: district,
          city: cityName,
          country: getCountryFromCity(cityKey),
          countryCode: getCountryCodeFromCity(cityKey),
          continent: getContinentFromCity(cityKey),
          location: {
            lat: cityData.center.lat,
            lng: cityData.center.lng,
          },
          type: 'neighborhood',
          emoji: '🏘️',
          flag: getFlagFromCity(cityKey),
          popularity: 7,
        } as CitySuggestion);
      }
    }
  }

  // Sort by relevance and limit
  return results.slice(0, 8);
}

// Helper functions for district search
function getCountryFromCity(cityKey: string): string {
  const countryMap: Record<string, string> = {
    'dubai': 'United Arab Emirates',
    'abu dhabi': 'United Arab Emirates',
    'sao paulo': 'Brazil',
    'rio de janeiro': 'Brazil',
    'paris': 'France',
    'london': 'United Kingdom',
    'barcelona': 'Spain',
    'rome': 'Italy',
    'madrid': 'Spain',
    'amsterdam': 'Netherlands',
    'lisbon': 'Portugal',
    'berlin': 'Germany',
    'new york': 'United States',
    'los angeles': 'United States',
    'miami': 'United States',
    'cancun': 'Mexico',
    'mexico city': 'Mexico',
    'buenos aires': 'Argentina',
    'tokyo': 'Japan',
    'singapore': 'Singapore',
    'bangkok': 'Thailand',
    'hong kong': 'China',
    'bali': 'Indonesia',
    'sydney': 'Australia',
    'cape town': 'South Africa',
    'marrakech': 'Morocco',
  };
  return countryMap[cityKey] || '';
}

function getCountryCodeFromCity(cityKey: string): string {
  const codeMap: Record<string, string> = {
    'dubai': 'AE', 'abu dhabi': 'AE',
    'sao paulo': 'BR', 'rio de janeiro': 'BR',
    'paris': 'FR', 'london': 'GB', 'barcelona': 'ES', 'rome': 'IT',
    'madrid': 'ES', 'amsterdam': 'NL', 'lisbon': 'PT', 'berlin': 'DE',
    'new york': 'US', 'los angeles': 'US', 'miami': 'US',
    'cancun': 'MX', 'mexico city': 'MX', 'buenos aires': 'AR',
    'tokyo': 'JP', 'singapore': 'SG', 'bangkok': 'TH', 'hong kong': 'HK',
    'bali': 'ID', 'sydney': 'AU', 'cape town': 'ZA', 'marrakech': 'MA',
  };
  return codeMap[cityKey] || 'XX';
}

function getContinentFromCity(cityKey: string): 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Middle East' | 'Caribbean' {
  const continentMap: Record<string, any> = {
    'dubai': 'Middle East', 'abu dhabi': 'Middle East',
    'sao paulo': 'South America', 'rio de janeiro': 'South America', 'buenos aires': 'South America',
    'paris': 'Europe', 'london': 'Europe', 'barcelona': 'Europe', 'rome': 'Europe',
    'madrid': 'Europe', 'amsterdam': 'Europe', 'lisbon': 'Europe', 'berlin': 'Europe',
    'new york': 'North America', 'los angeles': 'North America', 'miami': 'North America',
    'cancun': 'North America', 'mexico city': 'North America',
    'tokyo': 'Asia', 'singapore': 'Asia', 'bangkok': 'Asia', 'hong kong': 'Asia', 'bali': 'Asia',
    'sydney': 'Oceania', 'cape town': 'Africa', 'marrakech': 'Africa',
  };
  return continentMap[cityKey] || 'North America';
}

function getFlagFromCity(cityKey: string): string {
  const code = getCountryCodeFromCity(cityKey);
  if (code === 'XX') return '🌍';
  const codePoints = code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Hotel Location Suggestions API Route
 *
 * GET /api/hotels/suggestions?query=Paris
 * GET /api/hotels/suggestions?popular=true (returns trending destinations)
 *
 * Uses a hybrid approach:
 * 1. LiteAPI Places search for global coverage (200K+ locations)
 * 2. Local database fallback for instant results
 * 3. Smart merging and deduplication
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const popular = searchParams.get('popular');

    // Return popular destinations when no query
    if (popular === 'true' || (!query && !popular)) {
      const normalizedPopular = POPULAR_DESTINATIONS.map(normalizeForFrontend);
      return NextResponse.json({
        success: true,
        data: normalizedPopular,
        meta: {
          count: normalizedPopular.length,
          source: 'popular',
        },
      }, {
        headers: {
          'Cache-Control': 'public, max-age=86400', // 24 hours for popular
        }
      });
    }

    if (!query || query.length < 2) {
      const normalizedPopular = POPULAR_DESTINATIONS.map(normalizeForFrontend);
      return NextResponse.json({
        success: true,
        data: normalizedPopular,
        meta: {
          count: normalizedPopular.length,
          source: 'popular',
        },
      });
    }

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:suggestions:v2', { query: query.toLowerCase() });

    // Try to get from cache (30 min TTL for dynamic results)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached suggestions for "${query}"`);
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=1800',
        }
      });
    }

    console.log(`🔍 Searching suggestions for "${query}"...`);

    // Parallel search: LiteAPI + local database + popular districts
    const [liteApiResponse, localResults, districtResults] = await Promise.all([
      searchLiteApiPlaces(query),
      Promise.resolve(searchCities(query)),
      Promise.resolve(searchPopularDistricts(query)),
    ]);

    // Combine local results with district results
    const combinedLocalResults = [...localResults, ...districtResults];

    // Merge results with intelligent prioritization based on search intent
    const merged = mergeResults(liteApiResponse.results, combinedLocalResults, liteApiResponse.intent);

    // Normalize all results for frontend compatibility
    const normalizedMerged = merged.map(normalizeForFrontend);

    const response = {
      success: true,
      data: normalizedMerged,
      meta: {
        count: normalizedMerged.length,
        query,
        intent: liteApiResponse.intent,
        sources: {
          liteapi: liteApiResponse.results.length,
          local: localResults.length,
        },
      },
    };

    // Store in cache (30 min TTL)
    await setCache(cacheKey, response, 1800);

    console.log(`✅ Found ${merged.length} suggestions for "${query}" (LiteAPI: ${liteApiResponse.results.length}, Local: ${localResults.length})`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=1800',
      }
    });
  } catch (error: any) {
    console.error('❌ Hotel suggestions error:', error);

    // Fallback to local search on any error
    const query = request.nextUrl.searchParams.get('query');
    if (query && query.length >= 2) {
      const fallback = searchCities(query).map(normalizeForFrontend);
      return NextResponse.json({
        success: true,
        data: fallback,
        meta: {
          count: fallback.length,
          query,
          source: 'fallback',
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch suggestions',
      },
      { status: 500 }
    );
  }
}

/**
 * Smart Search Intent Detection
 * Analyzes user query to determine search type for optimal results
 *
 * Examples:
 * - "hotels near Eiffel Tower" → { cleanQuery: "Eiffel Tower", types: ['landmark', 'poi'] }
 * - "hotels in Manhattan" → { cleanQuery: "Manhattan", types: ['neighborhood'] }
 * - "Eiffel Tower" → { cleanQuery: "Eiffel Tower", types: ['landmark', 'poi'] }
 * - "Paris" → { cleanQuery: "Paris", types: ['city'] }
 */
interface SearchIntent {
  cleanQuery: string;
  types?: Array<'city' | 'landmark' | 'poi' | 'neighborhood' | 'country'>;
  isProximitySearch: boolean; // "near X" queries
}

function detectSearchIntent(query: string): SearchIntent {
  const normalized = query.toLowerCase().trim();

  // Pattern: "hotels near X", "near X", "close to X"
  const proximityPatterns = /(?:hotels?\s+)?(?:near|close\s+to|around|by)\s+(.+)/i;
  const proximityMatch = query.match(proximityPatterns);
  if (proximityMatch) {
    return {
      cleanQuery: proximityMatch[1].trim(),
      types: ['landmark', 'poi', 'neighborhood'],
      isProximitySearch: true,
    };
  }

  // Pattern: "hotels in X", "in X"
  const locationPatterns = /(?:hotels?\s+)?in\s+(.+)/i;
  const locationMatch = query.match(locationPatterns);
  if (locationMatch) {
    return {
      cleanQuery: locationMatch[1].trim(),
      types: ['neighborhood', 'city'],
      isProximitySearch: false,
    };
  }

  // Known landmark keywords (highly specific POIs)
  const landmarkKeywords = ['tower', 'statue', 'palace', 'cathedral', 'temple', 'monument', 'museum', 'park', 'garden', 'bridge', 'gate', 'square', 'plaza'];
  const hasLandmarkKeyword = landmarkKeywords.some(keyword => normalized.includes(keyword));
  if (hasLandmarkKeyword) {
    return {
      cleanQuery: query,
      types: ['landmark', 'poi'],
      isProximitySearch: false,
    };
  }

  // Known neighborhood indicators
  const neighborhoodKeywords = ['district', 'quarter', 'area', 'downtown', 'uptown', 'beach', 'bay', 'hills'];
  const hasNeighborhoodKeyword = neighborhoodKeywords.some(keyword => normalized.includes(keyword));
  if (hasNeighborhoodKeyword) {
    return {
      cleanQuery: query,
      types: ['neighborhood', 'city'],
      isProximitySearch: false,
    };
  }

  // Default: general search (prioritize cities but include all types)
  return {
    cleanQuery: query,
    types: undefined, // No filter - search everything
    isProximitySearch: false,
  };
}

/**
 * Search LiteAPI Places endpoint for global coverage with smart type filtering
 * Returns both results and detected search intent for intelligent ranking
 */
async function searchLiteApiPlaces(query: string): Promise<{ results: CitySuggestion[]; intent: SearchIntent }> {
  try {
    // Detect search intent for smart filtering
    const intent = detectSearchIntent(query);

    console.log(`🧠 Search Intent: "${query}" → Clean: "${intent.cleanQuery}", Types: ${intent.types?.join(', ') || 'all'}, Proximity: ${intent.isProximitySearch}`);

    // Dynamic import to avoid circular dependency
    const { liteAPI } = await import('@/lib/api/liteapi');
    const { data } = await liteAPI.searchPlaces(intent.cleanQuery, {
      types: intent.types,
      limit: 25, // Increased for better coverage from actual LiteAPI inventory
    });

    if (!data || data.length === 0) return { results: [], intent };

    // Log what we're receiving from LiteAPI
    console.log('📍 LiteAPI places response sample:', JSON.stringify(data.slice(0, 2)));

    // LiteAPI returns: { placeId, displayName, formattedAddress, types: [] }
    // Convert to our format - map displayName to name, extract country from formattedAddress
    const results = data.map((place: any, index: number) => {
      const name = place.displayName || place.textForSearch || place.cityName || '';
      const addressParts = (place.formattedAddress || '').split(',').map((s: string) => s.trim());
      const country = addressParts[addressParts.length - 1] || place.countryName || '';
      const city = addressParts[0] || name;
      const type = mapPlaceType(place.types?.[0] || place.type || 'city');

      // Intelligently assign emoji based on context
      const emoji = assignEmojiByContext({ name, city, country, type });

      // Derive countryCode and flag from country name (basic mapping)
      const countryCode = deriveCountryCode(country);
      const flag = countryCode ? countryCodeToFlag(countryCode) : '🌍';
      const continent = deriveContinent(country);

      return {
        id: `liteapi-${place.placeId || index}`,
        name,
        city,
        country,
        countryCode,
        continent,
        location: {
          lat: place.latitude || 0,
          lng: place.longitude || 0,
        },
        type,
        emoji,
        flag,
      } as CitySuggestion;
    }).filter((p: any) => p.name);

    return { results, intent };
  } catch (error) {
    console.error('LiteAPI places search failed:', error);
    return { results: [], intent: { cleanQuery: query, isProximitySearch: false } };
  }
}

/**
 * Map LiteAPI place types to our types
 */
function mapPlaceType(type: string): 'city' | 'landmark' | 'airport' | 'neighborhood' | 'poi' {
  const lowerType = (type || '').toLowerCase();
  if (lowerType.includes('city') || lowerType.includes('town')) return 'city';
  if (lowerType.includes('airport')) return 'airport';
  if (lowerType.includes('neighborhood') || lowerType.includes('district')) return 'neighborhood';
  if (lowerType.includes('poi') || lowerType.includes('point_of_interest')) return 'poi';
  if (lowerType.includes('landmark') || lowerType.includes('monument')) return 'landmark';
  return 'city';
}

/**
 * Intelligently assign emoji to places based on type, location, and keywords
 * Enhances UX by providing visual context for LiteAPI results
 */
function assignEmojiByContext(place: { name: string; city?: string; country?: string; type: string }): string | undefined {
  const name = place.name.toLowerCase();
  const city = (place.city || '').toLowerCase();
  const country = (place.country || '').toLowerCase();
  const type = place.type;

  // Landmark/POI-specific emojis (highest priority)
  if (type === 'landmark' || type === 'poi') {
    // Famous landmarks by keyword
    if (name.includes('tower')) return '🗼';
    if (name.includes('statue')) return '🗽';
    if (name.includes('palace') || name.includes('castle')) return '🏰';
    if (name.includes('cathedral') || name.includes('church') || name.includes('basilica')) return '⛪';
    if (name.includes('temple') || name.includes('shrine')) return '🛕';
    if (name.includes('museum')) return '🏛️';
    if (name.includes('beach')) return '🏖️';
    if (name.includes('park') || name.includes('garden')) return '🌳';
    if (name.includes('bridge')) return '🌉';
    if (name.includes('gate')) return '🚪';
    if (name.includes('square') || name.includes('plaza')) return '🏛️';
    if (name.includes('monument')) return '🗿';
    if (name.includes('stadium') || name.includes('arena')) return '🏟️';
    if (name.includes('market') || name.includes('bazaar')) return '🏪';
    if (name.includes('port') || name.includes('harbor')) return '⚓';
    if (name.includes('casino')) return '🎰';
    if (name.includes('opera')) return '🎭';
    return '⭐'; // Generic landmark
  }

  // Airport-specific
  if (type === 'airport') return '✈️';

  // Neighborhood-specific
  if (type === 'neighborhood') {
    if (name.includes('downtown') || name.includes('center')) return '🏙️';
    if (name.includes('old town') || name.includes('historic')) return '🏛️';
    if (name.includes('beach')) return '🏖️';
    if (name.includes('bay')) return '🌊';
    if (name.includes('hills')) return '⛰️';
    if (name.includes('district')) return '🏘️';
    return '📍'; // Generic neighborhood
  }

  // City/Country-specific emojis by region
  if (type === 'city') {
    // Europe
    if (country.includes('france')) return '🥐';
    if (country.includes('italy')) return '🍕';
    if (country.includes('spain')) return '🇪🇸';
    if (country.includes('germany')) return '🇩🇪';
    if (country.includes('united kingdom') || country.includes('england') || country.includes('uk')) return '🇬🇧';
    if (country.includes('netherlands') || country.includes('holland')) return '🇳🇱';
    if (country.includes('switzerland')) return '🇨🇭';
    if (country.includes('austria')) return '🇦🇹';
    if (country.includes('greece')) return '🇬🇷';
    if (country.includes('portugal')) return '🇵🇹';

    // Americas
    if (country.includes('united states') || country.includes('usa') || country.includes('us')) {
      if (city.includes('new york') || name.includes('new york')) return '🗽';
      if (city.includes('los angeles') || city.includes('la') || name.includes('los angeles')) return '🌴';
      if (city.includes('miami') || name.includes('miami')) return '🏝️';
      if (city.includes('las vegas') || name.includes('vegas')) return '🎰';
      if (city.includes('san francisco') || name.includes('san francisco')) return '🌉';
      if (city.includes('chicago') || name.includes('chicago')) return '🏙️';
      if (city.includes('orlando') || name.includes('orlando')) return '🎢';
      if (city.includes('hawaii') || name.includes('hawaii') || name.includes('honolulu')) return '🌺';
      return '🇺🇸';
    }
    if (country.includes('canada')) return '🇨🇦';
    if (country.includes('mexico')) return '🇲🇽';
    if (country.includes('brazil')) return '🇧🇷';
    if (country.includes('argentina')) return '🇦🇷';
    if (country.includes('colombia')) return '🇨🇴';
    if (country.includes('peru')) return '🇵🇪';
    if (country.includes('chile')) return '🇨🇱';

    // Asia
    if (country.includes('japan')) return '🗾';
    if (country.includes('china')) return '🇨🇳';
    if (country.includes('korea')) return '🇰🇷';
    if (country.includes('thailand')) return '🇹🇭';
    if (country.includes('vietnam')) return '🇻🇳';
    if (country.includes('singapore')) return '🦁';
    if (country.includes('malaysia')) return '🇲🇾';
    if (country.includes('indonesia')) return '🇮🇩';
    if (country.includes('philippines')) return '🇵🇭';
    if (country.includes('india')) return '🇮🇳';
    if (country.includes('dubai') || country.includes('uae') || country.includes('emirates')) return '🏜️';
    if (country.includes('turkey')) return '🇹🇷';

    // Oceania
    if (country.includes('australia')) return '🇦🇺';
    if (country.includes('new zealand')) return '🇳🇿';

    // Africa
    if (country.includes('egypt')) return '🇪🇬';
    if (country.includes('south africa')) return '🇿🇦';
    if (country.includes('morocco')) return '🇲🇦';
    if (country.includes('kenya')) return '🇰🇪';

    // Middle East
    if (country.includes('israel')) return '🇮🇱';
    if (country.includes('jordan')) return '🇯🇴';
    if (country.includes('saudi')) return '🇸🇦';

    return '🌆'; // Generic city
  }

  return undefined; // No emoji assigned
}

/**
 * Derive ISO country code from country name
 * Basic mapping for common countries
 */
function deriveCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'united states': 'US',
    'usa': 'US',
    'us': 'US',
    'canada': 'CA',
    'mexico': 'MX',
    'france': 'FR',
    'italy': 'IT',
    'spain': 'ES',
    'germany': 'DE',
    'united kingdom': 'GB',
    'uk': 'GB',
    'england': 'GB',
    'netherlands': 'NL',
    'switzerland': 'CH',
    'austria': 'AT',
    'greece': 'GR',
    'portugal': 'PT',
    'brazil': 'BR',
    'argentina': 'AR',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'australia': 'AU',
    'new zealand': 'NZ',
    'thailand': 'TH',
    'singapore': 'SG',
    'uae': 'AE',
    'dubai': 'AE',
    'israel': 'IL',
    'egypt': 'EG',
    'morocco': 'MA',
    'south africa': 'ZA',
  };

  const normalized = country.toLowerCase().trim();
  return countryMap[normalized] || 'XX'; // XX for unknown
}

/**
 * Convert country code to flag emoji
 */
function countryCodeToFlag(countryCode: string): string {
  if (countryCode === 'XX') return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Derive continent from country name
 */
function deriveContinent(country: string): 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Middle East' | 'Caribbean' {
  const normalized = country.toLowerCase().trim();

  // North America
  if (['united states', 'usa', 'us', 'canada', 'mexico'].includes(normalized)) return 'North America';

  // South America
  if (['brazil', 'argentina', 'chile', 'colombia', 'peru', 'venezuela'].includes(normalized)) return 'South America';

  // Europe
  if (['france', 'italy', 'spain', 'germany', 'united kingdom', 'uk', 'england', 'netherlands',
       'switzerland', 'austria', 'greece', 'portugal', 'poland', 'sweden', 'norway'].includes(normalized)) return 'Europe';

  // Asia
  if (['japan', 'china', 'india', 'thailand', 'singapore', 'south korea', 'vietnam', 'indonesia',
       'malaysia', 'philippines'].includes(normalized)) return 'Asia';

  // Middle East
  if (['uae', 'dubai', 'israel', 'jordan', 'saudi arabia', 'qatar', 'bahrain', 'kuwait'].includes(normalized)) return 'Middle East';

  // Africa
  if (['egypt', 'morocco', 'south africa', 'kenya', 'tanzania', 'tunisia'].includes(normalized)) return 'Africa';

  // Oceania
  if (['australia', 'new zealand', 'fiji'].includes(normalized)) return 'Oceania';

  // Caribbean
  if (['jamaica', 'bahamas', 'barbados', 'trinidad'].includes(normalized)) return 'Caribbean';

  return 'North America'; // Default fallback
}

/**
 * Merge results from multiple sources with intelligent prioritization
 * Uses search intent to rank results optimally for user's query
 */
function mergeResults(
  liteApiResults: CitySuggestion[],
  localResults: CitySuggestion[],
  intent?: SearchIntent
): CitySuggestion[] {
  const seen = new Set<string>();
  const merged: CitySuggestion[] = [];

  // Helper to create a unique key for deduplication
  const getKey = (item: CitySuggestion) => {
    return `${item.name.toLowerCase()}-${item.city.toLowerCase()}-${item.country.toLowerCase()}`.replace(/\s+/g, '');
  };

  // Add local results first (they have verified coordinates and emojis)
  for (const item of localResults) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  // Add LiteAPI results that aren't duplicates
  // Note: LiteAPI places may not have coordinates - they can still be used via placeId
  for (const item of liteApiResults) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  /**
   * Smart prioritization based on search intent
   *
   * Priority Rules:
   * 1. Proximity Search ("near X"):
   *    POI/Landmark > Neighborhood > City
   *
   * 2. Location Search ("in X"):
   *    Neighborhood > City > Landmark
   *
   * 3. General Search (default):
   *    City > Landmark > Neighborhood > POI
   */
  merged.sort((a, b) => {
    // Calculate priority scores based on intent
    const getTypePriority = (type: string): number => {
      if (!intent) {
        // Default: prioritize cities for general searches
        if (type === 'city') return 100;
        if (type === 'landmark') return 80;
        if (type === 'neighborhood') return 70;
        if (type === 'poi') return 60;
        if (type === 'airport') return 50;
        return 0;
      }

      if (intent.isProximitySearch || intent.types?.includes('poi') || intent.types?.includes('landmark')) {
        // Proximity/POI searches: prioritize points of interest
        if (type === 'poi') return 100;
        if (type === 'landmark') return 95;
        if (type === 'neighborhood') return 80;
        if (type === 'city') return 70;
        if (type === 'airport') return 50;
        return 60;
      }

      if (intent.types?.includes('neighborhood')) {
        // Neighborhood searches: prioritize neighborhoods
        if (type === 'neighborhood') return 100;
        if (type === 'city') return 90;
        if (type === 'landmark') return 70;
        if (type === 'poi') return 65;
        if (type === 'airport') return 50;
        return 60;
      }

      // Default: cities first
      if (type === 'city') return 100;
      if (type === 'landmark') return 80;
      if (type === 'neighborhood') return 70;
      if (type === 'poi') return 60;
      if (type === 'airport') return 50;
      return 0;
    };

    const priorityA = getTypePriority(a.type);
    const priorityB = getTypePriority(b.type);

    // Sort by priority (higher first)
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    // Same priority: prefer items with emojis (local database = curated)
    const hasEmojiA = !!a.emoji;
    const hasEmojiB = !!b.emoji;
    if (hasEmojiA && !hasEmojiB) return -1;
    if (!hasEmojiA && hasEmojiB) return 1;

    // Then sort by name length (shorter names usually more recognizable)
    return a.name.length - b.name.length;
  });

  return merged.slice(0, 15);
}
