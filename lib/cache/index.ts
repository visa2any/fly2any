/**
 * Cache Module - Main Entry Point
 *
 * Export all cache-related utilities for easy importing.
 */

// Redis client
export { default as redis, getRedisClient, isRedisEnabled, checkRedisHealth } from './redis';

// Cache helpers
export {
  getCached,
  setCache,
  deleteCache,
  deleteCachePattern,
  generateCacheKey,
  getCacheStats,
  resetCacheStats,
  cacheAside,
  cacheStats,
} from './helpers';

// Cache keys (legacy)
export {
  generateFlightSearchKey,
  generateHotelSearchKey,
  getFlightSearchPattern,
  getRoutePattern,
  type FlightSearchParams,
} from './keys';

// Smart cache keys (new)
export {
  generateSmartCacheKey,
  generateFlightCacheKey,
  generateHotelCacheKey,
  generateStaticCacheKey,
  generateAnalyticsCacheKey,
  generateGeoCacheKey,
  generateTimeBucketedCacheKey,
  generateUserCacheKey,
  generateCacheKeyPattern,
  parseCacheKey,
  isValidCacheKey,
  normalizeParams,
  hashParams,
  CacheKeys,
  CacheKeyUtils,
} from './smart-keys';

// Cache middleware
export {
  withCache,
  withQueryCache,
  withBodyCache,
  withTimeBucketedCache,
  withConditionalCache,
  withGeoCache,
  CachePresets,
  DEFAULT_TTLS,
  DEFAULT_SWR,
  type CacheMiddlewareOptions,
} from './middleware';

// Cache analytics
export {
  trackCacheHit,
  trackCacheMiss,
  trackCacheError,
  getCacheStatistics,
  getEndpointStatistics,
  getHistoricalStatistics,
  calculateCostSavings,
  getTopPerformingEndpoints,
  getWorstPerformingEndpoints,
  getCacheEffectivenessScore,
  generateCacheReport,
  getRecentCacheEvents,
  resetCacheStatistics,
  CacheAnalytics,
} from './analytics';
