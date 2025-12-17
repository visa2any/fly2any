/**
 * API Coverage Data - Fly2Any
 *
 * Based on official provider documentation:
 * - Amadeus Transfers: 90+ providers, 43,500 locations, 190 countries
 * - LiteAPI Hotels: 2+ million hotels worldwide
 * - Amadeus Hotels: 150,000+ hotels, 195 countries
 * - Duffel Flights: 300+ airlines (NDC + GDS)
 */

// Major airports with confirmed Amadeus Transfer coverage
// These are verified high-traffic airports with multiple providers
export const TRANSFER_COVERAGE_AIRPORTS = [
  // North America - USA (Top 30)
  'JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'LAS', 'MCO', 'EWR',
  'MIA', 'ATL', 'BOS', 'PHX', 'IAH', 'MSP', 'DTW', 'PHL', 'LGA', 'FLL',
  'BWI', 'SAN', 'DCA', 'IAD', 'TPA', 'PDX', 'SLC', 'STL', 'HNL', 'AUS',

  // Canada
  'YYZ', 'YVR', 'YUL', 'YYC', 'YOW',

  // Mexico & Caribbean
  'MEX', 'CUN', 'GDL', 'SJD', 'PVR', 'MBJ', 'NAS', 'SJU', 'PUJ',

  // Europe - UK & Ireland
  'LHR', 'LGW', 'STN', 'MAN', 'EDI', 'BHX', 'DUB',

  // Europe - France
  'CDG', 'ORY', 'NCE', 'LYS', 'MRS',

  // Europe - Germany
  'FRA', 'MUC', 'DUS', 'TXL', 'HAM', 'CGN',

  // Europe - Spain
  'MAD', 'BCN', 'PMI', 'AGP', 'ALC', 'IBZ',

  // Europe - Italy
  'FCO', 'MXP', 'VCE', 'NAP', 'FLR', 'BGY',

  // Europe - Other
  'AMS', 'ZRH', 'VIE', 'PRG', 'CPH', 'OSL', 'ARN', 'HEL',
  'LIS', 'BRU', 'WAW', 'BUD', 'ATH', 'IST', 'SAW',

  // Middle East
  'DXB', 'AUH', 'DOH', 'RUH', 'JED', 'TLV', 'AMM',

  // Asia - East
  'NRT', 'HND', 'KIX', 'ICN', 'PVG', 'PEK', 'HKG', 'TPE',

  // Asia - Southeast
  'SIN', 'BKK', 'KUL', 'CGK', 'DPS', 'MNL', 'SGN', 'HAN',

  // Asia - South
  'DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'CMB',

  // Oceania
  'SYD', 'MEL', 'BNE', 'PER', 'AKL', 'CHC',

  // South America
  'GRU', 'GIG', 'EZE', 'SCL', 'BOG', 'LIM', 'PTY',

  // Africa
  'JNB', 'CPT', 'CAI', 'CMN', 'RAK', 'NBO', 'ADD',
];

// Countries with confirmed hotel coverage (LiteAPI + Amadeus)
export const HOTEL_COVERAGE_COUNTRIES = [
  'US', 'CA', 'MX', 'GB', 'FR', 'DE', 'ES', 'IT', 'PT', 'NL',
  'BE', 'CH', 'AT', 'GR', 'TR', 'AE', 'SA', 'QA', 'IL', 'EG',
  'MA', 'ZA', 'JP', 'KR', 'CN', 'HK', 'TW', 'SG', 'TH', 'MY',
  'ID', 'PH', 'VN', 'IN', 'AU', 'NZ', 'BR', 'AR', 'CL', 'CO',
  'PE', 'CR', 'PA', 'JM', 'DO', 'BS', 'PR', 'CU', 'SE', 'NO',
  'DK', 'FI', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'RS', 'UA',
  'RU', 'KZ', 'PK', 'BD', 'LK', 'NP', 'MM', 'KH', 'LA', 'MV',
  'MU', 'SC', 'KE', 'TZ', 'NG', 'GH', 'SN', 'TN', 'JO', 'LB',
  'OM', 'BH', 'KW', 'AZ', 'GE', 'AM', 'CY', 'MT', 'LU', 'MC',
  'IS', 'IE', 'SK', 'SI', 'EE', 'LV', 'LT', 'MK', 'AL', 'BA',
];

// Coverage statistics for display
export const COVERAGE_STATS = {
  transfers: {
    providers: 90,
    locations: 43500,
    countries: 190,
    source: 'Amadeus',
  },
  hotels: {
    properties: 2000000,
    countries: 195,
    cities: 200000,
    sources: ['LiteAPI', 'Amadeus', 'Hotelbeds'],
  },
  flights: {
    airlines: 300,
    routes: 'Global',
    source: 'Duffel + Amadeus',
  },
};

/**
 * Check if airport has transfer coverage
 */
export function hasTransferCoverage(airportCode: string): boolean {
  return TRANSFER_COVERAGE_AIRPORTS.includes(airportCode.toUpperCase());
}

/**
 * Check if country has hotel coverage
 */
export function hasHotelCoverage(countryCode: string): boolean {
  return HOTEL_COVERAGE_COUNTRIES.includes(countryCode.toUpperCase());
}

/**
 * Get coverage level for a location
 * Returns: 'high' | 'medium' | 'low' | 'unknown'
 */
export function getCoverageLevel(airportCode: string): 'high' | 'medium' | 'low' | 'unknown' {
  const code = airportCode.toUpperCase();

  // Top 50 busiest airports - high coverage
  const highCoverage = [
    'JFK', 'LAX', 'LHR', 'CDG', 'DXB', 'HKG', 'SIN', 'AMS', 'FRA', 'ICN',
    'NRT', 'ORD', 'DFW', 'ATL', 'PEK', 'PVG', 'BKK', 'MIA', 'SFO', 'BCN',
    'MAD', 'FCO', 'LGW', 'MUC', 'IST', 'YYZ', 'SYD', 'MEL', 'GRU', 'EZE',
  ];

  if (highCoverage.includes(code)) return 'high';
  if (TRANSFER_COVERAGE_AIRPORTS.includes(code)) return 'medium';

  return 'unknown';
}

/**
 * Format coverage stats for display
 */
export function formatCoverageStats() {
  return {
    transfers: `${COVERAGE_STATS.transfers.providers}+ providers in ${COVERAGE_STATS.transfers.locations.toLocaleString()}+ locations`,
    hotels: `${(COVERAGE_STATS.hotels.properties / 1000000).toFixed(0)}M+ properties in ${COVERAGE_STATS.hotels.countries}+ countries`,
    flights: `${COVERAGE_STATS.flights.airlines}+ airlines worldwide`,
  };
}
