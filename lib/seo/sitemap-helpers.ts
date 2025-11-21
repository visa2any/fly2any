/**
 * SITEMAP GENERATION HELPERS
 *
 * Utilities for generating comprehensive sitemaps with:
 * - 10,000+ flight route combinations
 * - Dynamic destination pages
 * - Hotel and travel content
 * - Blog and content pages
 *
 * @version 1.0.0
 * @last-updated 2025-01-19
 */

// Top 100 US airports by traffic
export const TOP_US_AIRPORTS = [
  'ATL', 'LAX', 'ORD', 'DFW', 'DEN', 'JFK', 'SFO', 'SEA', 'LAS', 'MCO',
  'EWR', 'CLT', 'PHX', 'IAH', 'MIA', 'BOS', 'FLL', 'MSP', 'LGA', 'DTW',
  'PHL', 'SLC', 'DCA', 'SAN', 'BWI', 'TPA', 'AUS', 'MDW', 'BNA', 'IAD',
  'DAL', 'HOU', 'PDX', 'STL', 'RDU', 'SJC', 'OAK', 'SAT', 'MCI', 'SNA',
  'CMH', 'CVG', 'PIT', 'IND', 'SMF', 'MKE', 'OMA', 'RNO', 'ABQ', 'BUR',
];

// Top 50 international airports
export const TOP_INTERNATIONAL_AIRPORTS = [
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'MUC', 'IST', 'ZRH',
  'DXB', 'SIN', 'HKG', 'NRT', 'ICN', 'PVG', 'PEK', 'BKK', 'KUL', 'DEL',
  'SYD', 'MEL', 'YYZ', 'YVR', 'GRU', 'GIG', 'MEX', 'CUN', 'PTY', 'BOG',
  'LIM', 'SCL', 'EZE', 'JNB', 'CPT', 'CAI', 'TLV', 'DOH', 'AUH', 'BOM',
  'MNL', 'CGK', 'HAN', 'SGN', 'KIX', 'TPE', 'HND', 'CAN', 'CTU', 'PUS',
];

// Popular US cities for destination pages
export const TOP_US_CITIES = [
  { city: 'New York', state: 'NY', airports: ['JFK', 'LGA', 'EWR'] },
  { city: 'Los Angeles', state: 'CA', airports: ['LAX', 'BUR', 'SNA'] },
  { city: 'Chicago', state: 'IL', airports: ['ORD', 'MDW'] },
  { city: 'San Francisco', state: 'CA', airports: ['SFO', 'OAK', 'SJC'] },
  { city: 'Miami', state: 'FL', airports: ['MIA', 'FLL'] },
  { city: 'Las Vegas', state: 'NV', airports: ['LAS'] },
  { city: 'Seattle', state: 'WA', airports: ['SEA'] },
  { city: 'Orlando', state: 'FL', airports: ['MCO'] },
  { city: 'Boston', state: 'MA', airports: ['BOS'] },
  { city: 'Washington', state: 'DC', airports: ['IAD', 'DCA', 'BWI'] },
  { city: 'Denver', state: 'CO', airports: ['DEN'] },
  { city: 'Dallas', state: 'TX', airports: ['DFW', 'DAL'] },
  { city: 'Houston', state: 'TX', airports: ['IAH', 'HOU'] },
  { city: 'Phoenix', state: 'AZ', airports: ['PHX'] },
  { city: 'Atlanta', state: 'GA', airports: ['ATL'] },
];

// Popular international destinations
export const TOP_INTERNATIONAL_CITIES = [
  { city: 'London', country: 'United Kingdom', airports: ['LHR', 'LGW', 'STN'] },
  { city: 'Paris', country: 'France', airports: ['CDG', 'ORY'] },
  { city: 'Tokyo', country: 'Japan', airports: ['NRT', 'HND'] },
  { city: 'Dubai', country: 'UAE', airports: ['DXB'] },
  { city: 'Singapore', country: 'Singapore', airports: ['SIN'] },
  { city: 'Hong Kong', country: 'Hong Kong', airports: ['HKG'] },
  { city: 'Barcelona', country: 'Spain', airports: ['BCN'] },
  { city: 'Rome', country: 'Italy', airports: ['FCO'] },
  { city: 'Amsterdam', country: 'Netherlands', airports: ['AMS'] },
  { city: 'Frankfurt', country: 'Germany', airports: ['FRA'] },
  { city: 'Istanbul', country: 'Turkey', airports: ['IST'] },
  { city: 'Bangkok', country: 'Thailand', airports: ['BKK'] },
  { city: 'Sydney', country: 'Australia', airports: ['SYD'] },
  { city: 'Toronto', country: 'Canada', airports: ['YYZ'] },
  { city: 'Mexico City', country: 'Mexico', airports: ['MEX'] },
];

// Major airlines for airline pages
export const MAJOR_AIRLINES = [
  { name: 'American Airlines', code: 'AA' },
  { name: 'Delta Air Lines', code: 'DL' },
  { name: 'United Airlines', code: 'UA' },
  { name: 'Southwest Airlines', code: 'WN' },
  { name: 'JetBlue Airways', code: 'B6' },
  { name: 'Alaska Airlines', code: 'AS' },
  { name: 'Spirit Airlines', code: 'NK' },
  { name: 'Frontier Airlines', code: 'F9' },
  { name: 'Hawaiian Airlines', code: 'HA' },
  { name: 'Allegiant Air', code: 'G4' },
  { name: 'British Airways', code: 'BA' },
  { name: 'Lufthansa', code: 'LH' },
  { name: 'Air France', code: 'AF' },
  { name: 'KLM', code: 'KL' },
  { name: 'Emirates', code: 'EK' },
  { name: 'Qatar Airways', code: 'QR' },
  { name: 'Singapore Airlines', code: 'SQ' },
  { name: 'Cathay Pacific', code: 'CX' },
  { name: 'ANA', code: 'NH' },
  { name: 'Japan Airlines', code: 'JL' },
];

/**
 * Generate popular flight route combinations
 * Creates up to 10,000+ route pairs for sitemap
 */
export function generatePopularRoutes(limit: number = 10000): Array<{ origin: string; destination: string }> {
  const routes: Array<{ origin: string; destination: string }> = [];
  const allAirports = [...TOP_US_AIRPORTS, ...TOP_INTERNATIONAL_AIRPORTS];

  // Domestic US routes (highest priority)
  for (let i = 0; i < TOP_US_AIRPORTS.length && routes.length < limit; i++) {
    for (let j = 0; j < TOP_US_AIRPORTS.length && routes.length < limit; j++) {
      if (i !== j) {
        routes.push({
          origin: TOP_US_AIRPORTS[i],
          destination: TOP_US_AIRPORTS[j],
        });
      }
    }
  }

  // International routes from US hubs
  for (let i = 0; i < TOP_US_AIRPORTS.length && routes.length < limit; i++) {
    for (let j = 0; j < TOP_INTERNATIONAL_AIRPORTS.length && routes.length < limit; j++) {
      routes.push({
        origin: TOP_US_AIRPORTS[i],
        destination: TOP_INTERNATIONAL_AIRPORTS[j],
      });
      // Reverse direction
      if (routes.length < limit) {
        routes.push({
          origin: TOP_INTERNATIONAL_AIRPORTS[j],
          destination: TOP_US_AIRPORTS[i],
        });
      }
    }
  }

  return routes.slice(0, limit);
}

/**
 * Calculate priority based on route popularity
 * High-traffic routes get higher priority (0.8-1.0)
 * Medium routes get 0.6-0.7
 * Low routes get 0.4-0.5
 */
export function calculateRoutePriority(origin: string, destination: string): number {
  const highPriorityAirports = TOP_US_AIRPORTS.slice(0, 20);
  const bothHighPriority = highPriorityAirports.includes(origin) && highPriorityAirports.includes(destination);
  const oneHighPriority = highPriorityAirports.includes(origin) || highPriorityAirports.includes(destination);

  if (bothHighPriority) return 0.9;
  if (oneHighPriority) return 0.7;
  return 0.5;
}

/**
 * Format route for URL slug
 */
export function formatRouteSlug(origin: string, destination: string): string {
  return `${origin.toLowerCase()}-to-${destination.toLowerCase()}`;
}

/**
 * Generate alternative route name variations for SEO
 */
export function generateRouteVariations(origin: string, destination: string): string[] {
  return [
    `${origin}-${destination}`,
    `${origin}-to-${destination}`,
    `flights-${origin}-${destination}`,
    `cheap-flights-${origin}-${destination}`,
  ];
}
