/**
 * AIRPORT HELPER FUNCTIONS & UTILITIES
 *
 * Comprehensive utilities for airport search, filtering, distance calculations,
 * and intelligent suggestions powered by our 6,054 airport database.
 *
 * Features:
 * - Distance calculations (Haversine formula)
 * - Alternative airport suggestions
 * - Advanced filtering (continent, popularity, keywords)
 * - Metro area expansion
 * - Natural language search
 * - Nearby airport detection
 *
 * @module airport-helpers
 */

import { AIRPORTS, Airport, Continent } from './airports-all';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AirportSearchOptions {
  query: string;
  maxResults?: number;
  continents?: Continent[];
  popularOnly?: boolean;
  includeKeywords?: boolean;
}

export interface AlternativeAirport {
  airport: Airport;
  distanceKm: number;
  distanceMiles: number;
  estimatedSavings?: number; // USD
  travelTimeMinutes?: number; // Ground transport time
  notes?: string;
}

export interface AlternativeAirportsResult {
  main: Airport;
  alternatives: AlternativeAirport[];
  totalAlternatives: number;
}

export interface NearbyAirportsOptions {
  code: string;
  radiusKm?: number;
  maxResults?: number;
  popularOnly?: boolean;
}

export interface DistanceResult {
  distanceKm: number;
  distanceMiles: number;
  bearingDegrees: number;
  bearingCompass: string; // "N", "NE", "E", etc.
}

// ============================================================================
// CORE UTILITIES
// ============================================================================

/**
 * Haversine formula - Calculate great-circle distance between two points
 * Most accurate for Earth's surface distances
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): DistanceResult {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distanceMiles = distanceKm * 0.621371;

  // Calculate bearing (direction)
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  const bearingRad = Math.atan2(y, x);
  const bearingDegrees = (toDegrees(bearingRad) + 360) % 360;

  // Convert bearing to compass direction
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearingDegrees / 45) % 8;
  const bearingCompass = directions[index];

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    bearingDegrees: Math.round(bearingDegrees * 10) / 10,
    bearingCompass,
  };
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate distance between two airports
 */
export function getAirportDistance(code1: string, code2: string): DistanceResult | null {
  const airport1 = findAirportByCode(code1);
  const airport2 = findAirportByCode(code2);

  if (!airport1 || !airport2) return null;

  return calculateDistance(
    airport1.coordinates.lat,
    airport1.coordinates.lon,
    airport2.coordinates.lat,
    airport2.coordinates.lon
  );
}

// ============================================================================
// AIRPORT LOOKUP
// ============================================================================

/**
 * Find airport by IATA code (case-insensitive)
 */
export function findAirportByCode(code: string): Airport | undefined {
  const upperCode = code.toUpperCase();
  return AIRPORTS.find((a) => a.code === upperCode);
}

/**
 * Find airports by city name
 */
export function findAirportsByCity(cityName: string): Airport[] {
  const lowerCity = cityName.toLowerCase();
  return AIRPORTS.filter((a) => a.city.toLowerCase().includes(lowerCity));
}

/**
 * Find airports by country
 */
export function findAirportsByCountry(countryName: string): Airport[] {
  const lowerCountry = countryName.toLowerCase();
  return AIRPORTS.filter((a) => a.country.toLowerCase().includes(lowerCountry));
}

/**
 * Get all airports in a metro area
 */
export function getMetroAirports(metroCode: string): Airport[] {
  const upperMetro = metroCode.toUpperCase();
  return AIRPORTS.filter((a) => a.metro === upperMetro);
}

/**
 * Get all available metro area codes
 */
export function getAllMetroAreas(): string[] {
  const metros = new Set<string>();
  AIRPORTS.forEach((airport) => {
    if (airport.metro) metros.add(airport.metro);
  });
  return Array.from(metros).sort();
}

// ============================================================================
// ADVANCED SEARCH
// ============================================================================

/**
 * Intelligent airport search with fuzzy matching
 * Searches across: code, name, city, country, keywords
 */
export function searchAirports(options: AirportSearchOptions): Airport[] {
  const { query, maxResults = 10, continents, popularOnly = false, includeKeywords = true } = options;

  if (!query || query.length < 2) {
    // Return popular airports if no query
    return AIRPORTS.filter((a) => a.popular).slice(0, maxResults);
  }

  const lowerQuery = query.toLowerCase();
  const results: Array<{ airport: Airport; score: number }> = [];

  for (const airport of AIRPORTS) {
    // Apply filters
    if (popularOnly && !airport.popular) continue;
    if (continents && !continents.includes(airport.continent)) continue;

    let score = 0;

    // Exact code match (highest priority)
    if (airport.code.toLowerCase() === lowerQuery) {
      score += 1000;
    }
    // Code starts with query
    else if (airport.code.toLowerCase().startsWith(lowerQuery)) {
      score += 500;
    }
    // Code contains query
    else if (airport.code.toLowerCase().includes(lowerQuery)) {
      score += 100;
    }

    // City name matches
    const cityLower = airport.city.toLowerCase();
    if (cityLower === lowerQuery) {
      score += 800;
    } else if (cityLower.startsWith(lowerQuery)) {
      score += 400;
    } else if (cityLower.includes(lowerQuery)) {
      score += 80;
    }

    // Airport name matches
    const nameLower = airport.name.toLowerCase();
    if (nameLower.includes(lowerQuery)) {
      score += 60;
    }

    // Country matches
    const countryLower = airport.country.toLowerCase();
    if (countryLower.includes(lowerQuery)) {
      score += 40;
    }

    // Search keywords (if enabled)
    if (includeKeywords && airport.searchKeywords) {
      for (const keyword of airport.searchKeywords) {
        if (keyword.toLowerCase().includes(lowerQuery)) {
          score += 50;
          break;
        }
      }
    }

    // Boost popular airports
    if (airport.popular) {
      score += 20;
    }

    if (score > 0) {
      results.push({ airport, score });
    }
  }

  // Sort by score (descending) and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((r) => r.airport);
}

// ============================================================================
// ALTERNATIVE AIRPORTS
// ============================================================================

/**
 * Find alternative airports near a given airport
 * Useful for showing cheaper nearby options
 */
export function findAlternativeAirports(
  targetCode: string,
  maxRadiusKm: number = 150
): AlternativeAirportsResult | null {
  const mainAirport = findAirportByCode(targetCode);
  if (!mainAirport) return null;

  const alternatives: AlternativeAirport[] = [];

  for (const airport of AIRPORTS) {
    // Skip the main airport itself
    if (airport.code === mainAirport.code) continue;

    // Skip if same metro area (they're already grouped)
    if (mainAirport.metro && airport.metro === mainAirport.metro) continue;

    const distance = calculateDistance(
      mainAirport.coordinates.lat,
      mainAirport.coordinates.lon,
      airport.coordinates.lat,
      airport.coordinates.lon
    );

    if (distance.distanceKm <= maxRadiusKm) {
      // Estimate ground transport time (rough approximation)
      // Average speed: 60 km/h for city travel
      const travelTimeMinutes = Math.round((distance.distanceKm / 60) * 60);

      // Estimate savings based on airport type and distance
      // Smaller/regional airports typically 15-30% cheaper
      const estimatedSavings = airport.popular ? 30 : 80;

      alternatives.push({
        airport,
        distanceKm: distance.distanceKm,
        distanceMiles: distance.distanceMiles,
        estimatedSavings,
        travelTimeMinutes,
        notes: generateAlternativeNote(distance.distanceKm, airport.popular),
      });
    }
  }

  // Sort by distance (closest first)
  alternatives.sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    main: mainAirport,
    alternatives: alternatives.slice(0, 5), // Return top 5
    totalAlternatives: alternatives.length,
  };
}

function generateAlternativeNote(distanceKm: number, isPopular: boolean): string {
  if (distanceKm < 30) {
    return 'Very close - easy access by taxi or metro';
  } else if (distanceKm < 60) {
    return 'Close - about 1 hour by car or train';
  } else if (distanceKm < 100) {
    return 'Moderate distance - consider ground transport costs';
  } else {
    return isPopular
      ? 'Major hub - may have better flight options despite distance'
      : 'Budget option - factor in extra travel time and costs';
  }
}

/**
 * Find nearby airports within radius
 */
export function findNearbyAirports(options: NearbyAirportsOptions): Airport[] {
  const { code, radiusKm = 100, maxResults = 10, popularOnly = false } = options;

  const centerAirport = findAirportByCode(code);
  if (!centerAirport) return [];

  const nearby: Array<{ airport: Airport; distance: number }> = [];

  for (const airport of AIRPORTS) {
    if (airport.code === code) continue; // Skip center airport
    if (popularOnly && !airport.popular) continue;

    const distance = calculateDistance(
      centerAirport.coordinates.lat,
      centerAirport.coordinates.lon,
      airport.coordinates.lat,
      airport.coordinates.lon
    );

    if (distance.distanceKm <= radiusKm) {
      nearby.push({ airport, distance: distance.distanceKm });
    }
  }

  // Sort by distance and return top results
  return nearby
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
    .map((n) => n.airport);
}

// ============================================================================
// FILTERING & GROUPING
// ============================================================================

/**
 * Get airports by continent
 */
export function getAirportsByContinent(continent: Continent): Airport[] {
  return AIRPORTS.filter((a) => a.continent === continent);
}

/**
 * Get only popular/major hub airports
 */
export function getPopularAirports(): Airport[] {
  return AIRPORTS.filter((a) => a.popular);
}

/**
 * Filter airports by multiple criteria
 */
export interface FilterOptions {
  continents?: Continent[];
  countries?: string[];
  popular?: boolean;
  hasMetro?: boolean;
  keywords?: string[];
}

export function filterAirports(options: FilterOptions): Airport[] {
  let filtered = AIRPORTS;

  if (options.continents && options.continents.length > 0) {
    filtered = filtered.filter((a) => options.continents!.includes(a.continent));
  }

  if (options.countries && options.countries.length > 0) {
    const lowerCountries = options.countries.map((c) => c.toLowerCase());
    filtered = filtered.filter((a) => lowerCountries.includes(a.country.toLowerCase()));
  }

  if (options.popular !== undefined) {
    filtered = filtered.filter((a) => a.popular === options.popular);
  }

  if (options.hasMetro !== undefined) {
    filtered = filtered.filter((a) => (a.metro !== undefined) === options.hasMetro);
  }

  if (options.keywords && options.keywords.length > 0) {
    filtered = filtered.filter((a) => {
      if (!a.searchKeywords) return false;
      return options.keywords!.some((kw) =>
        a.searchKeywords!.some((ak) => ak.toLowerCase().includes(kw.toLowerCase()))
      );
    });
  }

  return filtered;
}

// ============================================================================
// NATURAL LANGUAGE SEARCH
// ============================================================================

/**
 * Parse natural language queries and suggest airports
 * Examples:
 * - "beaches in Asia" → Beach destinations in Asia
 * - "ski resorts in Europe" → Ski destinations in Europe
 * - "cheap cities from New York" → Popular destinations
 */
export function parseNaturalLanguageQuery(query: string): Airport[] {
  const lowerQuery = query.toLowerCase();

  // Define keyword mappings
  const continentKeywords: Record<string, Continent> = {
    'asia': 'AS',
    'asian': 'AS',
    'europe': 'EU',
    'european': 'EU',
    'africa': 'AF',
    'african': 'AF',
    'america': 'NA',
    'americas': 'NA',
    'north america': 'NA',
    'south america': 'SA',
    'oceania': 'OC',
    'australia': 'OC',
    'middle east': 'ME',
  };

  const typeKeywords: Record<string, string[]> = {
    'beach': ['beach', 'coastal', 'island', 'tropical', 'resort'],
    'ski': ['ski', 'snow', 'winter', 'mountain', 'alpine'],
    'city': ['city', 'urban', 'metro', 'downtown'],
    'culture': ['culture', 'heritage', 'historic', 'museum'],
    'nature': ['nature', 'park', 'wildlife', 'safari'],
  };

  // Extract continent
  let continents: Continent[] | undefined;
  for (const [keyword, continent] of Object.entries(continentKeywords)) {
    if (lowerQuery.includes(keyword)) {
      continents = [continent];
      break;
    }
  }

  // Extract type keywords
  let keywords: string[] | undefined;
  for (const [type, kws] of Object.entries(typeKeywords)) {
    if (kws.some((kw) => lowerQuery.includes(kw))) {
      keywords = kws;
      break;
    }
  }

  // Filter airports based on extracted criteria
  const filtered = filterAirports({
    continents,
    keywords,
    popular: true, // Prefer popular destinations for general queries
  });

  // If no matches, fall back to regular search
  if (filtered.length === 0) {
    return searchAirports({ query, maxResults: 20 });
  }

  return filtered.slice(0, 20);
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get airport database statistics
 */
export function getAirportStats() {
  const stats = {
    total: AIRPORTS.length,
    byContinent: {} as Record<Continent, number>,
    popularCount: 0,
    withMetro: 0,
    withKeywords: 0,
    countries: new Set<string>(),
    metroAreas: new Set<string>(),
  };

  for (const airport of AIRPORTS) {
    // Count by continent
    stats.byContinent[airport.continent] = (stats.byContinent[airport.continent] || 0) + 1;

    // Count features
    if (airport.popular) stats.popularCount++;
    if (airport.metro) {
      stats.withMetro++;
      stats.metroAreas.add(airport.metro);
    }
    if (airport.searchKeywords) stats.withKeywords++;

    // Collect countries
    stats.countries.add(airport.country);
  }

  return {
    ...stats,
    countriesCount: stats.countries.size,
    metroAreasCount: stats.metroAreas.size,
    countries: Array.from(stats.countries).sort(),
    metroAreas: Array.from(stats.metroAreas).sort(),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const airportHelpers = {
  // Lookup
  findAirportByCode,
  findAirportsByCity,
  findAirportsByCountry,
  getMetroAirports,
  getAllMetroAreas,

  // Search
  searchAirports,
  parseNaturalLanguageQuery,

  // Distance
  calculateDistance,
  getAirportDistance,

  // Alternatives
  findAlternativeAirports,
  findNearbyAirports,

  // Filtering
  getAirportsByContinent,
  getPopularAirports,
  filterAirports,

  // Stats
  getAirportStats,
};

export default airportHelpers;
