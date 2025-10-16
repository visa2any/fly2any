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

// Cache keys
export {
  generateFlightSearchKey,
  generateHotelSearchKey,
  getFlightSearchPattern,
  getRoutePattern,
  type FlightSearchParams,
} from './keys';
