/**
 * INTERNAL LINKING ENGINE
 *
 * Deterministic internal linking system for programmatic SEO pages.
 * Generates contextual links between related entities:
 * - Route ↔ Route (alternatives)
 * - Route ↔ City
 * - City ↔ Destination
 * - Blog ↔ Routes / Cities
 *
 * @version 1.0.0 - Sprint 3
 */

import { TOP_US_CITIES, TOP_INTERNATIONAL_CITIES } from './sitemap-helpers';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

// ============================================================================
// TYPES
// ============================================================================

export interface RouteLink {
  origin: string;
  destination: string;
  label: string;
  href: string;
  type: 'alternative' | 'return' | 'popular' | 'nearby';
}

export interface CityLink {
  city: string;
  slug: string;
  label: string;
  href: string;
  country?: string;
}

export interface InternalLinks {
  alternativeRoutes: RouteLink[];
  relatedCities: CityLink[];
  returnRoute: RouteLink | null;
  nearbyAirports: RouteLink[];
  popularFromOrigin: RouteLink[];
  popularToDestination: RouteLink[];
}

// ============================================================================
// AIRPORT PROXIMITY DATA
// ============================================================================

const AIRPORT_GROUPS: Record<string, string[]> = {
  // New York Area
  nyc: ['JFK', 'LGA', 'EWR'],
  // Los Angeles Area
  la: ['LAX', 'BUR', 'LGB', 'SNA', 'ONT'],
  // San Francisco Bay Area
  sf: ['SFO', 'OAK', 'SJC'],
  // Chicago Area
  chi: ['ORD', 'MDW'],
  // Washington DC Area
  dc: ['DCA', 'IAD', 'BWI'],
  // Miami Area
  mia: ['MIA', 'FLL', 'PBI'],
  // Dallas Area
  dfw: ['DFW', 'DAL', 'AUS'],
  // Houston Area
  hou: ['IAH', 'HOU'],
  // London
  lon: ['LHR', 'LGW', 'STN', 'LTN', 'LCY'],
  // Paris
  par: ['CDG', 'ORY'],
  // Tokyo
  tyo: ['NRT', 'HND'],
};

// ============================================================================
// POPULAR ROUTES DATA
// ============================================================================

const POPULAR_DOMESTIC_ROUTES = [
  { origin: 'JFK', destination: 'LAX' },
  { origin: 'LAX', destination: 'JFK' },
  { origin: 'ORD', destination: 'LAX' },
  { origin: 'ATL', destination: 'LAX' },
  { origin: 'JFK', destination: 'MIA' },
  { origin: 'LAX', destination: 'SFO' },
  { origin: 'DFW', destination: 'LAX' },
  { origin: 'JFK', destination: 'SFO' },
  { origin: 'ORD', destination: 'MIA' },
  { origin: 'BOS', destination: 'LAX' },
];

const POPULAR_INTERNATIONAL_ROUTES = [
  { origin: 'JFK', destination: 'LHR' },
  { origin: 'LAX', destination: 'NRT' },
  { origin: 'JFK', destination: 'CDG' },
  { origin: 'SFO', destination: 'HKG' },
  { origin: 'MIA', destination: 'BCN' },
  { origin: 'ORD', destination: 'LHR' },
  { origin: 'JFK', destination: 'FCO' },
  { origin: 'LAX', destination: 'SYD' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getAirportGroup(code: string): string | null {
  for (const [group, airports] of Object.entries(AIRPORT_GROUPS)) {
    if (airports.includes(code.toUpperCase())) {
      return group;
    }
  }
  return null;
}

function getGroupAirports(code: string): string[] {
  const group = getAirportGroup(code);
  if (!group) return [];
  return AIRPORT_GROUPS[group].filter(a => a !== code.toUpperCase());
}

function getAirportName(code: string): string {
  // Check US cities
  const usCity = TOP_US_CITIES.find(c => c.airports.includes(code.toUpperCase()));
  if (usCity) return `${usCity.city}, ${usCity.state}`;

  // Check international cities
  const intlCity = TOP_INTERNATIONAL_CITIES.find(c => c.airports.includes(code.toUpperCase()));
  if (intlCity) return `${intlCity.city}, ${intlCity.country}`;

  return code.toUpperCase();
}

function createRouteHref(origin: string, destination: string): string {
  return `${SITE_URL}/flights/${origin.toLowerCase()}-to-${destination.toLowerCase()}`;
}

function createCityHref(cityName: string): string {
  const slug = cityName.toLowerCase().replace(/\s+/g, '-');
  return `${SITE_URL}/destinations/${slug}`;
}

function createCitySlug(cityName: string): string {
  return cityName.toLowerCase().replace(/\s+/g, '-');
}

// ============================================================================
// ROUTE LINKING FUNCTIONS
// ============================================================================

/**
 * Get nearby airport alternative routes
 */
export function getNearbyAirportRoutes(
  origin: string,
  destination: string
): RouteLink[] {
  const routes: RouteLink[] = [];

  // Nearby origin airports
  const nearbyOrigins = getGroupAirports(origin);
  for (const alt of nearbyOrigins.slice(0, 2)) {
    routes.push({
      origin: alt,
      destination: destination.toUpperCase(),
      label: `${alt} to ${destination.toUpperCase()}`,
      href: createRouteHref(alt, destination),
      type: 'nearby',
    });
  }

  // Nearby destination airports
  const nearbyDests = getGroupAirports(destination);
  for (const alt of nearbyDests.slice(0, 2)) {
    routes.push({
      origin: origin.toUpperCase(),
      destination: alt,
      label: `${origin.toUpperCase()} to ${alt}`,
      href: createRouteHref(origin, alt),
      type: 'nearby',
    });
  }

  return routes;
}

/**
 * Get return route
 */
export function getReturnRoute(origin: string, destination: string): RouteLink {
  return {
    origin: destination.toUpperCase(),
    destination: origin.toUpperCase(),
    label: `Return: ${destination.toUpperCase()} to ${origin.toUpperCase()}`,
    href: createRouteHref(destination, origin),
    type: 'return',
  };
}

/**
 * Get popular routes from same origin
 */
export function getPopularFromOrigin(origin: string, currentDest: string): RouteLink[] {
  const routes = [...POPULAR_DOMESTIC_ROUTES, ...POPULAR_INTERNATIONAL_ROUTES];

  return routes
    .filter(r => r.origin === origin.toUpperCase() && r.destination !== currentDest.toUpperCase())
    .slice(0, 4)
    .map(r => ({
      origin: r.origin,
      destination: r.destination,
      label: `${r.origin} to ${r.destination}`,
      href: createRouteHref(r.origin, r.destination),
      type: 'popular' as const,
    }));
}

/**
 * Get popular routes to same destination
 */
export function getPopularToDestination(destination: string, currentOrigin: string): RouteLink[] {
  const routes = [...POPULAR_DOMESTIC_ROUTES, ...POPULAR_INTERNATIONAL_ROUTES];

  return routes
    .filter(r => r.destination === destination.toUpperCase() && r.origin !== currentOrigin.toUpperCase())
    .slice(0, 4)
    .map(r => ({
      origin: r.origin,
      destination: r.destination,
      label: `${r.origin} to ${r.destination}`,
      href: createRouteHref(r.origin, r.destination),
      type: 'popular' as const,
    }));
}

/**
 * Get all internal links for a route page
 */
export function getRouteInternalLinks(
  origin: string,
  destination: string
): InternalLinks {
  return {
    alternativeRoutes: getNearbyAirportRoutes(origin, destination),
    relatedCities: getRelatedCitiesForRoute(destination),
    returnRoute: getReturnRoute(origin, destination),
    nearbyAirports: getNearbyAirportRoutes(origin, destination),
    popularFromOrigin: getPopularFromOrigin(origin, destination),
    popularToDestination: getPopularToDestination(destination, origin),
  };
}

// ============================================================================
// CITY LINKING FUNCTIONS
// ============================================================================

/**
 * Get related cities for route destination
 */
export function getRelatedCitiesForRoute(airportCode: string): CityLink[] {
  const cities: CityLink[] = [];

  // Find the city for this airport
  const usCity = TOP_US_CITIES.find(c => c.airports.includes(airportCode.toUpperCase()));
  if (usCity) {
    const usSlug = createCitySlug(usCity.city);
    cities.push({
      city: usCity.city,
      slug: usSlug,
      label: `${usCity.city} Travel Guide`,
      href: createCityHref(usCity.city),
      country: 'USA',
    });

    // Add related US cities (same region if possible)
    const relatedUS = TOP_US_CITIES.filter(c => c.city !== usCity.city).slice(0, 3);
    for (const city of relatedUS) {
      const relatedSlug = createCitySlug(city.city);
      cities.push({
        city: city.city,
        slug: relatedSlug,
        label: `Flights to ${city.city}`,
        href: createCityHref(city.city),
        country: 'USA',
      });
    }
  }

  const intlCity = TOP_INTERNATIONAL_CITIES.find(c => c.airports.includes(airportCode.toUpperCase()));
  if (intlCity) {
    const intlSlug = createCitySlug(intlCity.city);
    cities.push({
      city: intlCity.city,
      slug: intlSlug,
      label: `${intlCity.city} Travel Guide`,
      href: createCityHref(intlCity.city),
      country: intlCity.country,
    });
  }

  return cities.slice(0, 5);
}

/**
 * Get top routes to a city (for destination hub pages)
 */
export function getTopRoutesToCity(
  airports: string[],
  limit: number = 10
): RouteLink[] {
  const routes: RouteLink[] = [];
  const allRoutes = [...POPULAR_DOMESTIC_ROUTES, ...POPULAR_INTERNATIONAL_ROUTES];

  for (const airport of airports) {
    const toAirport = allRoutes.filter(r => r.destination === airport.toUpperCase());
    for (const r of toAirport) {
      routes.push({
        origin: r.origin,
        destination: r.destination,
        label: `${getAirportName(r.origin)} to ${getAirportName(r.destination)}`,
        href: createRouteHref(r.origin, r.destination),
        type: 'popular',
      });
    }
  }

  return routes.slice(0, limit);
}

/**
 * Get destination hub internal links
 */
export function getDestinationHubLinks(citySlug: string): {
  topRoutes: RouteLink[];
  relatedCities: CityLink[];
} {
  // Find city data by matching generated slug
  const usCity = TOP_US_CITIES.find(c => createCitySlug(c.city) === citySlug);
  const intlCity = TOP_INTERNATIONAL_CITIES.find(c => createCitySlug(c.city) === citySlug);
  const city = usCity || intlCity;

  if (!city) {
    return { topRoutes: [], relatedCities: [] };
  }

  return {
    topRoutes: getTopRoutesToCity(city.airports),
    relatedCities: getRelatedCitiesForRoute(city.airports[0]),
  };
}

// ============================================================================
// ANCHOR TEXT GENERATOR
// ============================================================================

const ANCHOR_PATTERNS = {
  route: [
    '{origin} to {dest} flights',
    'flights from {origin} to {dest}',
    'cheap flights {origin} to {dest}',
  ],
  city: [
    'flights to {city}',
    '{city} travel guide',
    'cheap flights to {city}',
  ],
  return: [
    'return flight {dest} to {origin}',
    '{dest} to {origin} flights',
  ],
};

/**
 * Generate varied anchor text for a route link
 */
export function generateRouteAnchor(
  origin: string,
  destination: string,
  variation: number = 0
): string {
  const patterns = ANCHOR_PATTERNS.route;
  const pattern = patterns[variation % patterns.length];

  return pattern
    .replace('{origin}', origin.toUpperCase())
    .replace('{dest}', destination.toUpperCase());
}

/**
 * Generate varied anchor text for a city link
 */
export function generateCityAnchor(city: string, variation: number = 0): string {
  const patterns = ANCHOR_PATTERNS.city;
  const pattern = patterns[variation % patterns.length];

  return pattern.replace('{city}', city);
}

// ============================================================================
// LINK VALIDATION
// ============================================================================

/**
 * Validate internal links meet SEO requirements
 */
export function validateInternalLinks(links: InternalLinks): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check minimum links
  const totalLinks =
    links.alternativeRoutes.length +
    links.relatedCities.length +
    (links.returnRoute ? 1 : 0) +
    links.popularFromOrigin.length;

  if (totalLinks < 5) {
    issues.push(`Too few internal links: ${totalLinks} (min: 5)`);
  }

  // Check maximum links
  if (totalLinks > 15) {
    issues.push(`Too many internal links: ${totalLinks} (max: 15)`);
  }

  // Check for duplicate hrefs
  const hrefs = [
    ...links.alternativeRoutes.map(l => l.href),
    ...links.relatedCities.map(l => l.href),
    links.returnRoute?.href,
  ].filter(Boolean);

  const uniqueHrefs = new Set(hrefs);
  if (uniqueHrefs.size !== hrefs.length) {
    issues.push('Duplicate link hrefs detected');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const InternalLinking = {
  // Route functions
  getRouteInternalLinks,
  getNearbyAirportRoutes,
  getReturnRoute,
  getPopularFromOrigin,
  getPopularToDestination,

  // City functions
  getRelatedCitiesForRoute,
  getTopRoutesToCity,
  getDestinationHubLinks,

  // Anchor text
  generateRouteAnchor,
  generateCityAnchor,

  // Validation
  validateInternalLinks,
};

export default InternalLinking;
