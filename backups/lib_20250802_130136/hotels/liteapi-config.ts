/**
 * Configuração LiteAPI para integração com sistema de hotéis
 * Inclui chaves sandbox e produção com fallback automático
 */

export const LITEAPI_CONFIG = {
  // URLs base da API
  SANDBOX_URL: 'https://api.liteapi.travel/v3.0',
  PRODUCTION_URL: 'https://api.liteapi.travel/v3.0',
  
  // Chaves de API
  KEYS: {
    SANDBOX: {
      PUBLIC: '21945f22-d6e3-459a-abd8-a7aaa4d043b0',
      PRIVATE: 'sand_eea53275-64a5-4601-a13a-1fd74aef6515'
    },
    PRODUCTION: {
      PUBLIC: 'prod_public_0179ca02-4925-491d-b8dc-b28a172b423c', 
      PRIVATE: 'prod_2055a56a-7549-41b9-ab05-7e33c68ecfcc'
    }
  },
  
  // Configurações de request
  REQUEST_CONFIG: {
    timeout: 30000, // 30 segundos
    retries: 3,
    retryDelay: 1000, // 1 segundo
    rateLimit: {
      requests: 100,
      window: 60000 // 1 minuto
    }
  },
  
  // Configurações de cache
  CACHE_CONFIG: {
    defaultTTL: 300, // 5 minutos
    searchResultsTTL: 600, // 10 minutos
    hotelDetailsTTL: 3600, // 1 hora
    staticDataTTL: 86400 // 24 horas
  }
} as const;

/**
 * Determina se deve usar ambiente sandbox ou produção
 */
export function getEnvironment(): 'sandbox' | 'production' {
  const env = process.env.NODE_ENV;
  const forceProduction = process.env.LITEAPI_FORCE_PRODUCTION === 'true';
  
  if (forceProduction && env === 'production') {
    return 'production';
  }
  
  return 'sandbox';
}

/**
 * Obtém a configuração atual baseada no ambiente
 */
export function getCurrentConfig() {
  const env = getEnvironment();
  const config = LITEAPI_CONFIG;
  
  return {
    baseURL: env === 'sandbox' ? config.SANDBOX_URL : config.PRODUCTION_URL,
    publicKey: config.KEYS[env.toUpperCase() as keyof typeof config.KEYS].PUBLIC,
    privateKey: config.KEYS[env.toUpperCase() as keyof typeof config.KEYS].PRIVATE,
    environment: env,
    ...config.REQUEST_CONFIG
  };
}

/**
 * Headers padrão para requests LiteAPI
 */
export function getDefaultHeaders(usePrivateKey = false) {
  const config = getCurrentConfig();
  const apiKey = usePrivateKey ? config.privateKey : config.publicKey;
  
  return {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey,
    'User-Agent': 'Fly2Any-Hotels/1.0',
    'Accept': 'application/json'
  };
}

/**
 * Endpoints disponíveis da LiteAPI
 */
export const LITEAPI_ENDPOINTS = {
  // Busca de hotéis
  SEARCH: '/hotels/search',
  RATES: '/hotels/rates',
  
  // Detalhes de hotéis
  HOTEL_DETAILS: '/hotels/details',
  HOTEL_REVIEWS: '/hotels/reviews',
  HOTEL_FACILITIES: '/hotels/facilities',
  
  // Reservas
  BOOK: '/hotels/book',
  CANCEL: '/hotels/cancel',
  BOOKING_DETAILS: '/hotels/booking',
  
  // Dados estáticos
  CITIES: '/data/cities',
  COUNTRIES: '/data/countries',
  CURRENCIES: '/data/currencies',
  ROOM_TYPES: '/data/room-types',
  
  // Utilitários
  HEALTH: '/health',
  GEOCODE: '/data/geocode'
} as const;

/**
 * Status codes específicos da LiteAPI
 */
export const LITEAPI_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;