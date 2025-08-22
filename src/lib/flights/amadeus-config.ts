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

  // 🇺🇸 US MARKET OPTIMIZED DEFAULTS
  DEFAULTS: {
    CURRENCY: 'USD',
    MAX_RESULTS: 250, // Increased for better price comparison vs competitors
    TRAVEL_CLASS: 'ECONOMY' as const,
    ADULTS: 1,
    CHILDREN: 0,
    INFANTS: 0,
    COUNTRY: 'US',
    MARKET_REGION: 'US'
  },

  // 🎯 US MARKET PSYCHOLOGY & COMPETITIVE POSITIONING
  US_MARKET_CONFIG: {
    // Primary target demographics
    PRIMARY_REGIONS: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West', 'Northwest', 'Alaska', 'Hawaii'],
    
    // Currency display preferences (US market psychology)
    CURRENCY_DISPLAY: {
      SYMBOL: '$',
      POSITION: 'before', // $299 vs 299$
      SHOW_CENTS: true,   // $299.00 vs $299
      THOUSAND_SEPARATOR: ',', // $1,299.00
      DECIMAL_SEPARATOR: '.'
    },
    
    // Competitive positioning vs Kayak/Expedia/Priceline
    COMPETITIVE_ADVANTAGES: {
      SPEED_ADVANTAGE: 'Sub-1 second search vs 3-5s competitors',
      TRANSPARENCY: 'All fees included upfront - no surprises at checkout',
      AI_POWERED: 'GPT-4 intelligence vs basic algorithms',
      MOBILE_FIRST: 'Native mobile experience vs desktop ports',
      PERSONALIZATION: 'True AI learning vs basic preferences'
    },
    
    // US travel patterns and peak times
    TRAVEL_SEASONS: {
      SUMMER_PEAK: { start: '2024-06-01', end: '2024-08-31', multiplier: 1.3 },
      WINTER_HOLIDAYS: { start: '2024-12-20', end: '2025-01-05', multiplier: 1.5 },
      SPRING_BREAK: { start: '2024-03-10', end: '2024-04-15', multiplier: 1.2 },
      THANKSGIVING: { start: '2024-11-24', end: '2024-12-02', multiplier: 1.4 },
      MEMORIAL_DAY: { start: '2024-05-25', end: '2024-05-28', multiplier: 1.2 },
      LABOR_DAY: { start: '2024-08-31', end: '2024-09-03', multiplier: 1.2 }
    },
    
    // US business travel corridors (premium pricing acceptable)
    BUSINESS_CORRIDORS: [
      { route: 'JFK-LAX', frequency: 'high', premium: true },
      { route: 'LAX-JFK', frequency: 'high', premium: true },
      { route: 'ORD-JFK', frequency: 'high', premium: true },
      { route: 'JFK-ORD', frequency: 'high', premium: true },
      { route: 'BOS-DCA', frequency: 'high', premium: true },
      { route: 'LAX-SFO', frequency: 'high', premium: false },
      { route: 'SFO-LAX', frequency: 'high', premium: false },
      { route: 'DFW-LAX', frequency: 'medium', premium: false },
      { route: 'ATL-MIA', frequency: 'medium', premium: false }
    ],
    
    // Price psychology optimizations
    PRICING_PSYCHOLOGY: {
      CHARM_PRICING: true,        // $299 instead of $300
      BUNDLE_HIGHLIGHTING: true,  // Show savings vs individual purchases  
      SOCIAL_PROOF_THRESHOLDS: {
        HIGH_DEMAND: 85,          // "85% of seats taken" 
        BOOKING_VELOCITY: 10,     // "10 people booked this in the last hour"
        PRICE_ALERT: 72           // "Prices expected to rise in 72 hours"
      },
      URGENCY_TRIGGERS: {
        SEAT_COUNT_LOW: 5,        // "Only 5 seats left at this price"
        PRICE_INCREASE_WINDOW: 24, // "Price may increase in 24 hours"
        LIMITED_TIME: 6           // "Deal expires in 6 hours"
      }
    },
    
    // US consumer trust signals
    TRUST_SIGNALS: [
      'A+ BBB Rating',
      '2M+ Happy Travelers', 
      'IATA Certified',
      '24/7 US Support',
      'Price Match Guarantee',
      'Free Cancellation Options',
      'Secure Payment Processing',
      'No Hidden Fees Policy'
    ],
    
    // US mobile-first optimizations
    MOBILE_OPTIMIZATIONS: {
      TOUCH_FRIENDLY_SIZING: true,
      ONE_HANDED_NAVIGATION: true,
      OFFLINE_SEARCH_CACHE: true,
      NATIVE_APP_FEATURES: true,
      BIOMETRIC_PAYMENTS: true
    }
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

  // 🇺🇸 TOP US AIRPORT HUBS (Priority ranking for search optimization)
  US_MAJOR_HUBS: {
    // Tier 1: Super Hub Airports (highest search priority)
    TIER_1: [
      'ATL', // Atlanta - Busiest in the world
      'LAX', // Los Angeles - West Coast gateway  
      'ORD', // Chicago O'Hare - Central hub
      'DFW', // Dallas/Fort Worth - American Airlines hub
      'JFK', // New York JFK - International gateway
      'DEN', // Denver - United hub
      'SFO', // San Francisco - Tech corridor
      'LAS', // Las Vegas - Leisure travel hub
      'MIA', // Miami - Latin America gateway
      'MCO'  // Orlando - Tourism hub
    ],
    
    // Tier 2: Major Hub Airports  
    TIER_2: [
      'SEA', // Seattle - Alaska/Delta hub
      'PHX', // Phoenix - American hub
      'IAH', // Houston Intercontinental
      'BOS', // Boston - Northeast gateway
      'MSP', // Minneapolis - Delta hub
      'DTW', // Detroit - Delta hub
      'PHL', // Philadelphia - American hub
      'LGA', // New York LaGuardia
      'BWI', // Baltimore/Washington
      'DCA'  // Washington Reagan
    ],
    
    // Tier 3: Regional Hubs
    TIER_3: [
      'CLT', // Charlotte - American hub
      'SLC', // Salt Lake City - Delta hub
      'PDX', // Portland
      'SAN', // San Diego
      'TPA', // Tampa
      'AUS', // Austin
      'RDU', // Raleigh-Durham
      'MCI', // Kansas City
      'CLE', // Cleveland
      'PIT'  // Pittsburgh
    ]
  },

  // Popular international destinations from US
  POPULAR_DESTINATIONS: {
    // From USA to international
    USA_TO_EUROPE: ['LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO', 'MUC'],
    USA_TO_ASIA: ['NRT', 'ICN', 'PVG', 'HKG', 'SIN', 'DEL', 'BKK'],
    USA_TO_LATIN_AMERICA: ['MEX', 'CUN', 'GRU', 'SCL', 'LIM', 'BOG', 'GIG'],
    USA_TO_OCEANIA: ['SYD', 'MEL', 'AKL'],
    USA_TO_MIDDLE_EAST: ['DXB', 'DOH', 'DWC'],
    
    // Legacy: Popular destinations from Brazil
    BRAZIL_TO_USA: ['MIA', 'LAX', 'JFK', 'ORD', 'ATL'],
    BRAZIL_TO_EUROPE: ['LHR', 'CDG', 'FRA', 'MAD', 'LIS'],
    BRAZIL_TO_SOUTH_AMERICA: ['SCL', 'LIM', 'BOG', 'CCS', 'MVD'],
    BRAZIL_TO_ASIA: ['NRT', 'ICN', 'SIN', 'HKG', 'DXB']
  },

  // 📊 US DOMESTIC ROUTE POPULARITY (for search prioritization)
  US_DOMESTIC_ROUTES: {
    // Top 10 busiest US domestic routes (by passenger volume)
    TOP_10: [
      { origin: 'LAX', destination: 'JFK', rank: 1, annual_passengers: '2.4M' },
      { origin: 'JFK', destination: 'LAX', rank: 2, annual_passengers: '2.3M' },
      { origin: 'JFK', destination: 'MIA', rank: 3, annual_passengers: '2.1M' },
      { origin: 'MIA', destination: 'JFK', rank: 4, annual_passengers: '2.0M' },
      { origin: 'ORD', destination: 'LAX', rank: 5, annual_passengers: '1.9M' },
      { origin: 'LAX', destination: 'ORD', rank: 6, annual_passengers: '1.8M' },
      { origin: 'ATL', destination: 'LAX', rank: 7, annual_passengers: '1.7M' },
      { origin: 'LAX', destination: 'ATL', rank: 8, annual_passengers: '1.6M' },
      { origin: 'DFW', destination: 'LAX', rank: 9, annual_passengers: '1.5M' },
      { origin: 'LAX', destination: 'DFW', rank: 10, annual_passengers: '1.4M' }
    ],
    
    // High-frequency business routes (daily flights > 20)
    BUSINESS_ROUTES: [
      'JFK-LAX', 'LAX-JFK', 'ORD-JFK', 'JFK-ORD',
      'BOS-DCA', 'DCA-BOS', 'LAX-SFO', 'SFO-LAX'
    ],
    
    // Leisure/vacation routes (seasonal high demand)
    LEISURE_ROUTES: [
      'JFK-MIA', 'LAX-LAS', 'ORD-MCO', 'DFW-LAS',
      'ATL-MCO', 'BOS-MIA', 'SFO-LAS', 'SEA-LAX'
    ]
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

// 🇺🇸 US MARKET SPECIFIC HELPER FUNCTIONS

/**
 * Check if airport is a major US hub and return its tier
 */
export function getUSAirportTier(iataCode: string): 1 | 2 | 3 | null {
  const code = iataCode.toUpperCase();
  
  if (AMADEUS_CONFIG.US_MAJOR_HUBS.TIER_1.includes(code as any)) {
    return 1;
  }
  if (AMADEUS_CONFIG.US_MAJOR_HUBS.TIER_2.includes(code as any)) {
    return 2;
  }
  if (AMADEUS_CONFIG.US_MAJOR_HUBS.TIER_3.includes(code as any)) {
    return 3;
  }
  
  return null;
}

/**
 * Format price according to US market psychology
 */
export function formatUSPrice(amount: number): string {
  const config = AMADEUS_CONFIG.US_MARKET_CONFIG.CURRENCY_DISPLAY;
  
  // Apply charm pricing if enabled
  if (AMADEUS_CONFIG.US_MARKET_CONFIG.PRICING_PSYCHOLOGY.CHARM_PRICING) {
    // Round to nearest 9 (e.g., $299, $399, $499)
    const roundedAmount = Math.floor(amount / 10) * 10 - 1;
    if (roundedAmount > 0 && roundedAmount < amount) {
      amount = roundedAmount;
    }
  }
  
  const formattedNumber = amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: config.SHOW_CENTS ? 2 : 0,
    maximumFractionDigits: config.SHOW_CENTS ? 2 : 0
  });
  
  return formattedNumber;
}

/**
 * Check if route is a popular US domestic route
 */
export function isPopularUSRoute(origin: string, destination: string): boolean {
  const route = `${origin}-${destination}`;
  
  // Check in top 10 routes
  const isTop10 = AMADEUS_CONFIG.US_DOMESTIC_ROUTES.TOP_10.some(
    r => `${r.origin}-${r.destination}` === route
  );
  
  // Check in business routes
  const isBusiness = AMADEUS_CONFIG.US_DOMESTIC_ROUTES.BUSINESS_ROUTES.includes(route as any);
  
  // Check in leisure routes  
  const isLeisure = AMADEUS_CONFIG.US_DOMESTIC_ROUTES.LEISURE_ROUTES.includes(route as any);
  
  return isTop10 || isBusiness || isLeisure;
}

/**
 * Get search priority score for route (higher = more priority)
 */
export function getRouteSearchPriority(origin: string, destination: string): number {
  let score = 0;
  
  // Add points for hub tier (higher tier = more priority)
  const originTier = getUSAirportTier(origin);
  const destTier = getUSAirportTier(destination);
  
  if (originTier === 1) score += 30;
  else if (originTier === 2) score += 20; 
  else if (originTier === 3) score += 10;
  
  if (destTier === 1) score += 30;
  else if (destTier === 2) score += 20;
  else if (destTier === 3) score += 10;
  
  // Bonus for popular routes
  if (isPopularUSRoute(origin, destination)) {
    score += 25;
  }
  
  // Check if it's a top 10 route for extra bonus
  const route = `${origin}-${destination}`;
  const top10Route = AMADEUS_CONFIG.US_DOMESTIC_ROUTES.TOP_10.find(
    r => `${r.origin}-${r.destination}` === route
  );
  
  if (top10Route) {
    // Higher rank = more priority (rank 1 gets 10 points, rank 10 gets 1 point)
    score += (11 - top10Route.rank);
  }
  
  return score;
}

/**
 * Check if current date is in a US peak travel season
 */
export function isUSPeakTravelSeason(date: Date = new Date()): { isPeak: boolean; season?: string; multiplier?: number } {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  for (const [seasonName, seasonData] of Object.entries(AMADEUS_CONFIG.US_MARKET_CONFIG.TRAVEL_SEASONS)) {
    if (dateStr >= seasonData.start && dateStr <= seasonData.end) {
      return {
        isPeak: true,
        season: seasonName,
        multiplier: seasonData.multiplier
      };
    }
  }
  
  return { isPeak: false };
}

/**
 * Generate US market-specific urgency message
 */
export function generateUSUrgencyMessage(seatsLeft?: number, priceIncreaseRisk?: 'LOW' | 'MEDIUM' | 'HIGH'): string | null {
  const triggers = AMADEUS_CONFIG.US_MARKET_CONFIG.PRICING_PSYCHOLOGY.URGENCY_TRIGGERS;
  
  if (seatsLeft !== undefined && seatsLeft <= triggers.SEAT_COUNT_LOW) {
    return `Only ${seatsLeft} seats left at this price!`;
  }
  
  if (priceIncreaseRisk === 'HIGH') {
    return `Price may increase within ${triggers.PRICE_INCREASE_WINDOW} hours`;
  }
  
  if (priceIncreaseRisk === 'MEDIUM') {
    return `Book soon - prices expected to rise`;
  }
  
  // Check if it's peak season for additional urgency
  const seasonInfo = isUSPeakTravelSeason();
  if (seasonInfo.isPeak) {
    return `Peak ${seasonInfo.season?.toLowerCase()} season - book now to secure your seat`;
  }
  
  return null;
}

/**
 * Get competitive advantage message for US market
 */
export function getCompetitiveAdvantage(): string[] {
  return Object.values(AMADEUS_CONFIG.US_MARKET_CONFIG.COMPETITIVE_ADVANTAGES);
}

/**
 * Get US trust signals for display
 */
export function getUSTrustSignals(): string[] {
  return [...AMADEUS_CONFIG.US_MARKET_CONFIG.TRUST_SIGNALS];
}

export default AMADEUS_CONFIG;