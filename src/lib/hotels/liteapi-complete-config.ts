/**
 * LiteAPI Complete Configuration
 * 
 * Configuração completa e profissional do sistema LiteAPI
 * Baseado na documentação oficial v3.0.0
 */

// Environment configuration
export const LITEAPI_CONFIG = {
  VERSION: 'v3.0.0',
  
  // Base URLs
  URLS: {
    DATA_API: 'https://api.liteapi.travel/v3.0',
    BOOKING_API: 'https://book.liteapi.travel/v3.0',
    SANDBOX_DATA: 'https://api.liteapi.travel/v3.0',
    SANDBOX_BOOKING: 'https://book.liteapi.travel/v3.0'
  },
  
  // Authentication
  AUTH: {
    HEADER_NAME: 'X-API-Key',
    SANDBOX_KEY: process.env.LITEAPI_SANDBOX_PUBLIC_KEY || 'sand_c0155ab8-c683-4f26-8f94-b5e92c5797b9',
    PRODUCTION_KEY: process.env.LITEAPI_PRODUCTION_PUBLIC_KEY,
    PRIVATE_SANDBOX: process.env.LITEAPI_SANDBOX_PRIVATE_KEY || 'sand_eea53275-64a5-4601-a13a-1fd74aef6515',
    PRIVATE_PRODUCTION: process.env.LITEAPI_PRODUCTION_PRIVATE_KEY
  },
  
  // Request configuration
  REQUEST: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    CACHE_TTL: 300000, // 5 minutes
    USER_AGENT: 'Fly2Any-LiteAPI-Client/1.0.0'
  },
  
  // Rate limiting
  RATE_LIMITS: {
    SEARCH_PER_MINUTE: 100,
    BOOKING_PER_MINUTE: 20,
    DATA_PER_MINUTE: 200
  },
  
  // Supported currencies
  CURRENCIES: [
    'BRL', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'MXN', 'ARS', 'CLP'
  ],
  
  // Default currency
  DEFAULT_CURRENCY: 'BRL',
  
  // Supported countries
  COUNTRIES: [
    'BR', 'US', 'FR', 'IT', 'ES', 'GB', 'DE', 'JP', 'CN', 'AU', 'CA', 'MX', 'AR', 'CL'
  ],
  
  // Board types
  BOARD_TYPES: {
    'RO': 'Room Only',
    'BB': 'Bed & Breakfast',
    'HB': 'Half Board',
    'FB': 'Full Board',
    'AI': 'All Inclusive'
  },
  
  // Refundable tags
  REFUNDABLE_TAGS: {
    'RFN': 'Refundable',
    'NRFN': 'Non-Refundable'
  },
  
  // Hotel amenities
  AMENITIES: {
    CONNECTIVITY: ['wifi', 'internet', 'business_center'],
    RECREATION: ['pool', 'gym', 'spa', 'beach_access'],
    SERVICES: ['room_service', 'concierge', 'laundry', 'valet_parking'],
    DINING: ['restaurant', 'bar', 'breakfast', 'minibar'],
    TRANSPORT: ['parking', 'airport_shuttle', 'car_rental'],
    FAMILY: ['kids_club', 'babysitting', 'playground'],
    BUSINESS: ['meeting_rooms', 'conference_center', 'business_services'],
    ACCESSIBILITY: ['wheelchair_accessible', 'braille', 'hearing_impaired']
  },
  
  // Loyalty tiers
  LOYALTY_TIERS: {
    BRONZE: {
      name: 'Bronze',
      pointsRequired: 0,
      pointsMultiplier: 1.0,
      benefits: ['freeWifi']
    },
    SILVER: {
      name: 'Silver',
      pointsRequired: 5000,
      pointsMultiplier: 1.2,
      benefits: ['freeWifi', 'earlyCheckIn', 'breakfastDiscount10']
    },
    GOLD: {
      name: 'Gold',
      pointsRequired: 15000,
      pointsMultiplier: 1.5,
      benefits: ['freeWifi', 'earlyCheckIn', 'lateCheckOut', 'roomUpgrade', 'concierge', 'breakfastDiscount20']
    },
    PLATINUM: {
      name: 'Platinum',
      pointsRequired: 50000,
      pointsMultiplier: 2.0,
      benefits: ['freeWifi', 'earlyCheckIn', 'lateCheckOut', 'roomUpgrade', 'concierge', 'breakfastDiscount50', 'loungeAccess']
    }
  },
  
  // Voucher types
  VOUCHER_TYPES: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    NIGHTS: 'nights'
  },
  
  // Hotel categories
  HOTEL_CATEGORIES: {
    LUXURY: 'luxury',
    BUSINESS: 'business',
    BOUTIQUE: 'boutique',
    RESORT: 'resort',
    BUDGET: 'budget',
    FAMILY: 'family',
    ECO: 'eco'
  },
  
  // Search filters
  SEARCH_FILTERS: {
    STAR_RATINGS: [1, 2, 3, 4, 5],
    GUEST_RATINGS: [6, 7, 8, 9],
    PRICE_RANGES: [
      { min: 0, max: 200, label: 'Até R$ 200' },
      { min: 201, max: 500, label: 'R$ 201 - R$ 500' },
      { min: 501, max: 1000, label: 'R$ 501 - R$ 1.000' },
      { min: 1001, max: 2000, label: 'R$ 1.001 - R$ 2.000' },
      { min: 2001, max: null, label: 'Acima de R$ 2.000' }
    ]
  },
  
  // Analytics configuration
  ANALYTICS: {
    RETENTION_DAYS: 365,
    AGGREGATION_INTERVALS: ['hourly', 'daily', 'weekly', 'monthly'],
    KPI_METRICS: [
      'total_bookings',
      'total_revenue',
      'conversion_rate',
      'average_booking_value',
      'guest_satisfaction',
      'cancellation_rate'
    ]
  },
  
  // Error codes
  ERROR_CODES: {
    INVALID_API_KEY: 'INVALID_API_KEY',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    HOTEL_NOT_FOUND: 'HOTEL_NOT_FOUND',
    RATE_UNAVAILABLE: 'RATE_UNAVAILABLE',
    BOOKING_FAILED: 'BOOKING_FAILED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
  },
  
  // Cache keys
  CACHE_KEYS: {
    HOTEL_SEARCH: 'hotel_search',
    HOTEL_DETAILS: 'hotel_details',
    HOTEL_RATES: 'hotel_rates',
    COUNTRIES: 'countries',
    CURRENCIES: 'currencies',
    FACILITIES: 'facilities',
    PLACES: 'places'
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_OFFSET: 0
  },
  
  // Image configuration
  IMAGES: {
    DEFAULT_HOTEL_IMAGE: '/images/hotel-placeholder.jpg',
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    SIZES: {
      THUMBNAIL: '150x100',
      SMALL: '300x200',
      MEDIUM: '600x400',
      LARGE: '1200x800'
    }
  },
  
  // Validation rules
  VALIDATION: {
    MAX_ADULTS: 8,
    MAX_CHILDREN: 8,
    MAX_ROOMS: 5,
    MAX_BOOKING_DAYS_ADVANCE: 365,
    MIN_STAY_NIGHTS: 1,
    MAX_STAY_NIGHTS: 30
  },
  
  // Feature flags
  FEATURES: {
    LOYALTY_PROGRAM: true,
    VOUCHER_SYSTEM: true,
    ANALYTICS: true,
    MULTI_CURRENCY: true,
    PRICE_ALERTS: false,
    SOCIAL_LOGIN: false,
    MOBILE_APP: false
  }
} as const;

// Type definitions for configuration
export type LiteAPIConfig = typeof LITEAPI_CONFIG;
export type BoardType = keyof typeof LITEAPI_CONFIG.BOARD_TYPES;
export type RefundableTag = keyof typeof LITEAPI_CONFIG.REFUNDABLE_TAGS;
export type LoyaltyTier = keyof typeof LITEAPI_CONFIG.LOYALTY_TIERS;
export type VoucherType = typeof LITEAPI_CONFIG.VOUCHER_TYPES[keyof typeof LITEAPI_CONFIG.VOUCHER_TYPES];
export type HotelCategory = typeof LITEAPI_CONFIG.HOTEL_CATEGORIES[keyof typeof LITEAPI_CONFIG.HOTEL_CATEGORIES];

// Helper functions
export const LiteAPIHelpers = {
  /**
   * Get current environment
   */
  getEnvironment(): 'sandbox' | 'production' {
    return process.env.LITEAPI_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  },
  
  /**
   * Get API base URL
   */
  getBaseUrl(type: 'data' | 'booking' = 'data'): string {
    const env = this.getEnvironment();
    if (env === 'production') {
      return type === 'booking' ? LITEAPI_CONFIG.URLS.BOOKING_API : LITEAPI_CONFIG.URLS.DATA_API;
    }
    return type === 'booking' ? LITEAPI_CONFIG.URLS.SANDBOX_BOOKING : LITEAPI_CONFIG.URLS.SANDBOX_DATA;
  },
  
  /**
   * Get API key for current environment
   */
  getApiKey(type: 'public' | 'private' = 'public'): string {
    const env = this.getEnvironment();
    if (env === 'production') {
      return type === 'private' ? 
        LITEAPI_CONFIG.AUTH.PRIVATE_PRODUCTION || '' : 
        LITEAPI_CONFIG.AUTH.PRODUCTION_KEY || '';
    }
    return type === 'private' ? 
      LITEAPI_CONFIG.AUTH.PRIVATE_SANDBOX : 
      LITEAPI_CONFIG.AUTH.SANDBOX_KEY;
  },
  
  /**
   * Format board type for display
   */
  formatBoardType(boardType: string): string {
    return LITEAPI_CONFIG.BOARD_TYPES[boardType as BoardType] || boardType;
  },
  
  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof typeof LITEAPI_CONFIG.FEATURES): boolean {
    return LITEAPI_CONFIG.FEATURES[feature];
  },
  
  /**
   * Get loyalty tier by points
   */
  getLoyaltyTier(points: number): LoyaltyTier {
    if (points >= LITEAPI_CONFIG.LOYALTY_TIERS.PLATINUM.pointsRequired) return 'PLATINUM';
    if (points >= LITEAPI_CONFIG.LOYALTY_TIERS.GOLD.pointsRequired) return 'GOLD';
    if (points >= LITEAPI_CONFIG.LOYALTY_TIERS.SILVER.pointsRequired) return 'SILVER';
    return 'BRONZE';
  },
  
  /**
   * Generate cache key
   */
  getCacheKey(type: keyof typeof LITEAPI_CONFIG.CACHE_KEYS, ...params: string[]): string {
    return `${LITEAPI_CONFIG.CACHE_KEYS[type]}:${params.join(':')}`;
  },
  
  /**
   * Validate booking parameters
   */
  validateBookingParams(params: {
    adults: number;
    children: number;
    rooms: number;
    checkIn: Date;
    checkOut: Date;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (params.adults < 1 || params.adults > LITEAPI_CONFIG.VALIDATION.MAX_ADULTS) {
      errors.push(`Adultos deve estar entre 1 e ${LITEAPI_CONFIG.VALIDATION.MAX_ADULTS}`);
    }
    
    if (params.children < 0 || params.children > LITEAPI_CONFIG.VALIDATION.MAX_CHILDREN) {
      errors.push(`Crianças deve estar entre 0 e ${LITEAPI_CONFIG.VALIDATION.MAX_CHILDREN}`);
    }
    
    if (params.rooms < 1 || params.rooms > LITEAPI_CONFIG.VALIDATION.MAX_ROOMS) {
      errors.push(`Quartos deve estar entre 1 e ${LITEAPI_CONFIG.VALIDATION.MAX_ROOMS}`);
    }
    
    const nights = Math.ceil((params.checkOut.getTime() - params.checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights < LITEAPI_CONFIG.VALIDATION.MIN_STAY_NIGHTS) {
      errors.push(`Estadia mínima: ${LITEAPI_CONFIG.VALIDATION.MIN_STAY_NIGHTS} noite(s)`);
    }
    
    if (nights > LITEAPI_CONFIG.VALIDATION.MAX_STAY_NIGHTS) {
      errors.push(`Estadia máxima: ${LITEAPI_CONFIG.VALIDATION.MAX_STAY_NIGHTS} noites`);
    }
    
    return { valid: errors.length === 0, errors };
  }
};

// Export default configuration
export default LITEAPI_CONFIG;