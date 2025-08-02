/**
 * Amadeus API Configuration
 * Centralized configuration for all Amadeus API settings
 */

export const AMADEUS_CONFIG = {
  // Environment settings
  ENVIRONMENTS: {
    TEST: 'test' as const,
    PRODUCTION: 'production' as const
  },

  // API Base URLs
  BASE_URLS: {
    test: 'https://test.api.amadeus.com',
    production: 'https://api.amadeus.com'
  },

  // Token endpoints
  TOKEN_URLS: {
    test: 'https://test.api.amadeus.com/v1/security/oauth2/token',
    production: 'https://api.amadeus.com/v1/security/oauth2/token'
  },

  // Rate limits (requests per second)
  RATE_LIMITS: {
    test: 10, // 10 TPS in test environment
    production: 20 // 20 TPS in production environment
  },

  // API Endpoints
  ENDPOINTS: {
    // Authentication
    OAUTH_TOKEN: '/v1/security/oauth2/token',
    
    // Flight Search
    FLIGHT_OFFERS_SEARCH: '/v2/shopping/flight-offers',
    FLIGHT_OFFERS_PRICING: '/v1/shopping/flight-offers/pricing',
    
    // Booking
    FLIGHT_CREATE_ORDER: '/v1/booking/flight-orders',
    FLIGHT_ORDER_MANAGEMENT: '/v1/booking/flight-orders',
    
    // Reference Data
    AIRPORT_CITY_SEARCH: '/v1/reference-data/locations',
    AIRLINE_CODES: '/v1/reference-data/airlines',
    AIRCRAFT_CODES: '/v1/reference-data/aircraft',
    
    // Miscellaneous
    CHECKIN_LINKS: '/v2/reference-data/urls/checkin-links',
    FLIGHT_MOST_TRAVELED: '/v1/travel/analytics/flight-dates/most-traveled-destinations',
    FLIGHT_BUSIEST_PERIOD: '/v1/travel/analytics/flight-dates/most-booked-destinations'
  },

  // Request timeouts (milliseconds)
  TIMEOUTS: {
    TOKEN_REQUEST: 10000,
    SEARCH_REQUEST: 30000,
    BOOKING_REQUEST: 45000,
    DEFAULT_REQUEST: 15000
  },

  // Token settings
  TOKEN: {
    EXPIRY_BUFFER_SECONDS: 300, // Refresh token 5 minutes before expiry
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000
  },

  // Search limits
  SEARCH_LIMITS: {
    MAX_PASSENGERS: 9,
    MAX_ADULTS: 9,
    MAX_CHILDREN: 8,
    MAX_INFANTS: 9, // But cannot exceed adults
    MAX_RESULTS: 250,
    MAX_PRICE: 100000,
    MAX_FUTURE_DAYS: 360
  },

  // Supported travel classes
  TRAVEL_CLASSES: {
    ECONOMY: 'ECONOMY' as const,
    PREMIUM_ECONOMY: 'PREMIUM_ECONOMY' as const,
    BUSINESS: 'BUSINESS' as const,
    FIRST: 'FIRST' as const
  },

  // Supported passenger types
  PASSENGER_TYPES: {
    ADULT: 'ADULT' as const,
    CHILD: 'CHILD' as const,
    INFANT: 'INFANT' as const
  },

  // Age ranges for passenger types
  AGE_RANGES: {
    INFANT_MAX: 2,
    CHILD_MIN: 2,
    CHILD_MAX: 12,
    ADULT_MIN: 12
  },

  // Supported currencies
  CURRENCIES: {
    BRL: 'BRL',
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP'
  },

  // Default values
  DEFAULTS: {
    CURRENCY: 'USD',
    MAX_RESULTS: 100,
    TRAVEL_CLASS: 'ECONOMY' as const,
    ADULTS: 1,
    CHILDREN: 0,
    INFANTS: 0
  },

  // Error codes and messages
  ERROR_CODES: {
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INVALID_REQUEST: 'INVALID_REQUEST',
    NO_RESULTS_FOUND: 'NO_RESULTS_FOUND',
    BOOKING_FAILED: 'BOOKING_FAILED',
    PRICING_EXPIRED: 'PRICING_EXPIRED',
    NETWORK_ERROR: 'NETWORK_ERROR'
  },

  // HTTP Status codes
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Cache settings
  CACHE: {
    TOKEN_CACHE_KEY: 'amadeus_access_token',
    AIRPORT_CACHE_KEY: 'amadeus_airports',
    AIRLINE_CACHE_KEY: 'amadeus_airlines',
    CACHE_DURATION_MINUTES: 60,
    TOKEN_CACHE_DURATION_MINUTES: 25 // Less than 30min token expiry
  },

  // Feature flags
  FEATURES: {
    ENABLE_CACHING: true,
    ENABLE_RETRY_LOGIC: true,
    ENABLE_RATE_LIMITING: true,
    ENABLE_DETAILED_LOGGING: true,
    ENABLE_FALLBACK_DATA: true
  },

  // Brazilian specific settings
  BRAZIL: {
    MAIN_AIRPORTS: [
      'GRU', 'CGH', 'VCP', // São Paulo
      'GIG', 'SDU',        // Rio de Janeiro
      'BSB',               // Brasília
      'SSA',               // Salvador
      'REC',               // Recife
      'FOR',               // Fortaleza
      'BEL',               // Belém
      'MAO',               // Manaus
      'CWB',               // Curitiba
      'POA',               // Porto Alegre
      'FLN',               // Florianópolis
      'VIX',               // Vitória
      'CNF'                // Belo Horizonte
    ],
    TIMEZONE: 'America/Sao_Paulo',
    CURRENCY: 'USD',
    COUNTRY_CODE: 'BR'
  },

  // Popular international destinations from Brazil
  POPULAR_DESTINATIONS: {
    USA: ['MIA', 'LAX', 'JFK', 'ORD', 'ATL'],
    EUROPE: ['LHR', 'CDG', 'FRA', 'MAD', 'LIS'],
    SOUTH_AMERICA: ['SCL', 'LIM', 'BOG', 'CCS', 'MVD'],
    ASIA: ['NRT', 'ICN', 'SIN', 'HKG', 'DXB']
  },

  // Airline alliance information
  AIRLINE_ALLIANCES: {
    STAR_ALLIANCE: ['UA', 'LH', 'AC', 'SQ', 'TK', 'OS', 'LX'],
    ONEWORLD: ['AA', 'BA', 'QF', 'JL', 'QR', 'IB', 'AY'],
    SKYTEAM: ['AF', 'DL', 'KL', 'AZ', 'AM', 'KE', 'SU']
  },

  // Low-cost carriers
  LOW_COST_CARRIERS: [
    'G3', // GOL
    'AD', // Azul
    'NK', // Spirit
    'F9', // Frontier
    'WN', // Southwest
    'FR', // Ryanair
    'U2', // easyJet
    'VY', // Vueling
    'W6'  // Wizz Air
  ],

  // Quality indicators
  QUALITY_METRICS: {
    EXCELLENT_SCORE_MIN: 80,
    GOOD_SCORE_MIN: 60,
    ACCEPTABLE_SCORE_MIN: 40,
    POOR_SCORE_MAX: 39
  },

  // Layover time recommendations (minutes)
  LAYOVER_TIMES: {
    DOMESTIC_MIN: 60,
    DOMESTIC_RECOMMENDED: 90,
    INTERNATIONAL_MIN: 120,
    INTERNATIONAL_RECOMMENDED: 180,
    TOO_SHORT: 60,
    TOO_LONG: 480 // 8 hours
  },

  // Flight duration categories (minutes)
  DURATION_CATEGORIES: {
    SHORT_HAUL_MAX: 180,     // Up to 3 hours
    MEDIUM_HAUL_MAX: 360,    // 3-6 hours
    LONG_HAUL_MAX: 720,      // 6-12 hours
    ULTRA_LONG_HAUL_MIN: 720 // 12+ hours
  },

  // Time of day categories (hours in 24h format)
  TIME_CATEGORIES: {
    EARLY_MORNING: { start: 5, end: 8 },
    MORNING: { start: 8, end: 12 },
    AFTERNOON: { start: 12, end: 18 },
    EVENING: { start: 18, end: 22 },
    NIGHT: { start: 22, end: 5 } // Wraps around midnight
  },

  // Booking window recommendations
  BOOKING_WINDOWS: {
    DOMESTIC: {
      BEST_TIME_DAYS: 42,        // 6 weeks in advance
      EARLIEST_DAYS: 90,         // 3 months
      LATEST_DAYS: 1             // 1 day
    },
    INTERNATIONAL: {
      BEST_TIME_DAYS: 70,        // 10 weeks in advance
      EARLIEST_DAYS: 180,        // 6 months
      LATEST_DAYS: 7             // 1 week
    }
  }
} as const;

/**
 * Get current environment configuration
 */
export function getCurrentEnvironment() {
  return process.env.AMADEUS_ENVIRONMENT === 'production' 
    ? AMADEUS_CONFIG.ENVIRONMENTS.PRODUCTION 
    : AMADEUS_CONFIG.ENVIRONMENTS.TEST;
}

/**
 * Get base URL for current environment
 */
export function getBaseUrl() {
  const env = getCurrentEnvironment();
  return AMADEUS_CONFIG.BASE_URLS[env];
}

/**
 * Get token URL for current environment
 */
export function getTokenUrl() {
  const env = getCurrentEnvironment();
  return AMADEUS_CONFIG.TOKEN_URLS[env];
}

/**
 * Get rate limit for current environment
 */
export function getRateLimit() {
  const env = getCurrentEnvironment();
  return AMADEUS_CONFIG.RATE_LIMITS[env];
}

/**
 * Check if code is a Brazilian airport
 */
export function isBrazilianAirport(iataCode: string): boolean {
  return AMADEUS_CONFIG.BRAZIL.MAIN_AIRPORTS.includes(iataCode.toUpperCase() as any);
}

/**
 * Check if airline is low-cost carrier
 */
export function isLowCostCarrier(airlineCode: string): boolean {
  return AMADEUS_CONFIG.LOW_COST_CARRIERS.includes(airlineCode.toUpperCase() as any);
}

/**
 * Get airline alliance
 */
export function getAirlineAlliance(airlineCode: string): string | null {
  const code = airlineCode.toUpperCase();
  
  if (AMADEUS_CONFIG.AIRLINE_ALLIANCES.STAR_ALLIANCE.includes(code as any)) {
    return 'Star Alliance';
  }
  if (AMADEUS_CONFIG.AIRLINE_ALLIANCES.ONEWORLD.includes(code as any)) {
    return 'oneworld';
  }
  if (AMADEUS_CONFIG.AIRLINE_ALLIANCES.SKYTEAM.includes(code as any)) {
    return 'SkyTeam';
  }
  
  return null;
}

/**
 * Validate passenger counts
 */
export function validatePassengerCounts(adults: number, children: number, infants: number): string[] {
  const errors: string[] = [];
  
  if (adults < 1 || adults > AMADEUS_CONFIG.SEARCH_LIMITS.MAX_ADULTS) {
    errors.push(`Número de adultos deve ser entre 1 e ${AMADEUS_CONFIG.SEARCH_LIMITS.MAX_ADULTS}`);
  }
  
  if (children < 0 || children > AMADEUS_CONFIG.SEARCH_LIMITS.MAX_CHILDREN) {
    errors.push(`Número de crianças deve ser entre 0 e ${AMADEUS_CONFIG.SEARCH_LIMITS.MAX_CHILDREN}`);
  }
  
  if (infants < 0 || infants > adults) {
    errors.push('Número de bebês não pode ser maior que o número de adultos');
  }
  
  const total = adults + children + infants;
  if (total > AMADEUS_CONFIG.SEARCH_LIMITS.MAX_PASSENGERS) {
    errors.push(`Número total de passageiros não pode exceder ${AMADEUS_CONFIG.SEARCH_LIMITS.MAX_PASSENGERS}`);
  }
  
  return errors;
}

/**
 * Get passenger type by age
 */
export function getPassengerTypeByAge(age: number): string {
  if (age < AMADEUS_CONFIG.AGE_RANGES.INFANT_MAX) {
    return AMADEUS_CONFIG.PASSENGER_TYPES.INFANT;
  }
  if (age < AMADEUS_CONFIG.AGE_RANGES.ADULT_MIN) {
    return AMADEUS_CONFIG.PASSENGER_TYPES.CHILD;
  }
  return AMADEUS_CONFIG.PASSENGER_TYPES.ADULT;
}

export default AMADEUS_CONFIG;