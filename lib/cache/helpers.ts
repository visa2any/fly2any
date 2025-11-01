/**
 * Cache Helper Utilities
 *
 * Provides high-level caching functions with error handling and fallbacks.
 * Gracefully degrades when Redis is unavailable.
 */

import { getRedisClient, isRedisEnabled } from './redis';

// Default TTL: 15 minutes (900 seconds)
const DEFAULT_TTL = 900;

/**
 * Cache Statistics (in-memory tracking)
 */
export const cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
  sets: 0,
};

/**
 * Get cached value by key
 *
 * @param key Cache key
 * @returns Cached value or null if not found/expired/error
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!isRedisEnabled()) {
    return null;
  }

  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  try {
    const value = await redis.get<T>(key);

    if (value !== null) {
      cacheStats.hits++;
      console.log(`🎯 Cache HIT: ${key}`);
      return value;
    } else {
      cacheStats.misses++;
      // Only log calendar-price misses in summary (not individually)
      if (!key.startsWith('calendar-price:')) {
        console.log(`❌ Cache MISS: ${key}`);
      }
      return null;
    }
  } catch (error) {
    cacheStats.errors++;
    console.error(`Cache read error for key "${key}":`, error);
    return null;
  }
}

/**
 * Set cached value with optional TTL
 *
 * @param key Cache key
 * @param value Value to cache (will be JSON serialized)
 * @param ttl Time to live in seconds (default: 900 = 15 minutes)
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  if (!isRedisEnabled()) {
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    return;
  }

  try {
    await redis.set(key, value, { ex: ttl });
    cacheStats.sets++;
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    cacheStats.errors++;
    console.error(`Cache write error for key "${key}":`, error);
    // Don't throw - gracefully degrade
  }
}

/**
 * Delete cached value by key
 *
 * @param key Cache key to delete
 */
export async function deleteCache(key: string): Promise<void> {
  if (!isRedisEnabled()) {
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    return;
  }

  try {
    await redis.del(key);
    console.log(`🗑️  Cache DELETE: ${key}`);
  } catch (error) {
    cacheStats.errors++;
    console.error(`Cache delete error for key "${key}":`, error);
    // Don't throw - gracefully degrade
  }
}

/**
 * Delete multiple cache keys matching a pattern
 *
 * @param pattern Redis key pattern (e.g., "flights:*")
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  if (!isRedisEnabled()) {
    return 0;
  }

  const redis = getRedisClient();
  if (!redis) {
    return 0;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await redis.del(...keys);
    console.log(`🗑️  Cache DELETE pattern: ${pattern} (${deleted} keys)`);
    return deleted;
  } catch (error) {
    cacheStats.errors++;
    console.error(`Cache pattern delete error for pattern "${pattern}":`, error);
    return 0;
  }
}

/**
 * Generate a consistent cache key from prefix and parameters
 *
 * @param prefix Cache key prefix (e.g., "flights", "hotels")
 * @param params Object containing search parameters
 * @returns Deterministic cache key
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  // Sort keys to ensure consistent ordering
  const sortedKeys = Object.keys(params).sort();

  // Build deterministic string from sorted params
  const paramString = sortedKeys
    .map(key => {
      const value = params[key];
      // Handle undefined/null
      if (value === undefined || value === null) {
        return '';
      }
      // Convert to string
      return `${key}=${JSON.stringify(value)}`;
    })
    .filter(Boolean)
    .join('&');

  // Simple hash function for Edge runtime compatibility
  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 16);
  };

  const hash = simpleHash(paramString);

  return `${prefix}:${hash}`;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate = total > 0 ? (cacheStats.hits / total * 100).toFixed(2) : '0.00';

  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    enabled: isRedisEnabled(),
  };
}

/**
 * Reset cache statistics (useful for testing)
 */
export function resetCacheStats() {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.errors = 0;
  cacheStats.sets = 0;
}

/**
 * Wrapper for cache-aside pattern
 *
 * Tries to get from cache first, if miss, executes fetcher and caches result.
 *
 * @param key Cache key
 * @param fetcher Function to fetch data if cache miss
 * @param ttl Time to live in seconds
 * @returns Data from cache or fetcher
 */
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Try cache first
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch data
  const data = await fetcher();

  // Cache the result (fire and forget)
  setCache(key, data, ttl).catch(err => {
    console.error('Failed to cache data:', err);
  });

  return data;
}
