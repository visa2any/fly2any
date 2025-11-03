/**
 * Cache Helper Utilities - MIGRATED TO USE LOGGER
 *
 * This file demonstrates the migration from console.log to the logger utility.
 * Compare with lib/cache/helpers.ts to see the differences.
 *
 * Key changes:
 * - Imported logger from '@/lib/logger'
 * - Replaced all console.log with logger.debug
 * - Replaced all console.error with logger.error
 * - Added context objects to all log statements
 * - Used performance timers for cache operations
 */

import { getRedisClient, isRedisEnabled } from './redis';
import { logger } from '@/lib/logger';

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
    logger.debug('Cache disabled, skipping read', { key: key.substring(0, 50) });
    return null;
  }

  const redis = getRedisClient();
  if (!redis) {
    logger.warn('Redis client unavailable', { key: key.substring(0, 50) });
    return null;
  }

  try {
    const timer = logger.startTimer('Cache read');
    const value = await redis.get<T>(key);

    if (value !== null) {
      cacheStats.hits++;
      timer.end({ result: 'hit', key: key.substring(0, 50) });

      // Log cache hit with context
      logger.debug('Cache hit', {
        key: key.substring(0, 50),
        hitRate: `${((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1)}%`
      });

      return value;
    } else {
      cacheStats.misses++;
      timer.end({ result: 'miss', key: key.substring(0, 50) });

      // Only log non-calendar-price misses in detail
      if (!key.startsWith('calendar-price:')) {
        logger.debug('Cache miss', {
          key: key.substring(0, 50),
          missRate: `${((cacheStats.misses / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1)}%`
        });
      }

      return null;
    }
  } catch (error) {
    cacheStats.errors++;

    // Use logger.error with context instead of console.error
    logger.error('Cache read failed', error, {
      key: key.substring(0, 50),
      errorCount: cacheStats.errors,
      operation: 'get'
    });

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
    logger.debug('Cache disabled, skipping write', {
      key: key.substring(0, 50),
      ttl
    });
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    logger.warn('Redis client unavailable for write', {
      key: key.substring(0, 50)
    });
    return;
  }

  try {
    const timer = logger.startTimer('Cache write');

    await redis.set(key, value, { ex: ttl });

    cacheStats.sets++;
    timer.end({ success: true });

    // Log cache set with structured context
    logger.debug('Cache set', {
      key: key.substring(0, 50),
      ttl: `${ttl}s`,
      ttlMinutes: `${(ttl / 60).toFixed(1)}m`,
      totalSets: cacheStats.sets,
      size: JSON.stringify(value).length
    });
  } catch (error) {
    cacheStats.errors++;

    // Use logger.error with context
    logger.error('Cache write failed', error, {
      key: key.substring(0, 50),
      ttl,
      errorCount: cacheStats.errors,
      operation: 'set'
    });

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
    logger.debug('Cache disabled, skipping delete', {
      key: key.substring(0, 50)
    });
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    logger.warn('Redis client unavailable for delete', {
      key: key.substring(0, 50)
    });
    return;
  }

  try {
    await redis.del(key);

    // Use logger with context
    logger.debug('Cache entry deleted', {
      key: key.substring(0, 50),
      operation: 'delete'
    });
  } catch (error) {
    cacheStats.errors++;

    // Use logger.error with context
    logger.error('Cache delete failed', error, {
      key: key.substring(0, 50),
      errorCount: cacheStats.errors,
      operation: 'delete'
    });

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
    logger.debug('Cache disabled, skipping pattern delete', { pattern });
    return 0;
  }

  const redis = getRedisClient();
  if (!redis) {
    logger.warn('Redis client unavailable for pattern delete', { pattern });
    return 0;
  }

  try {
    const timer = logger.startTimer('Cache pattern delete');

    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      logger.debug('No keys match pattern', { pattern });
      timer.end({ keysDeleted: 0 });
      return 0;
    }

    const deleted = await redis.del(...keys);

    timer.end({ keysDeleted: deleted });

    // Use logger with detailed context
    logger.debug('Cache pattern deleted', {
      pattern,
      keysDeleted: deleted,
      keysFound: keys.length,
      operation: 'pattern-delete'
    });

    return deleted;
  } catch (error) {
    cacheStats.errors++;

    // Use logger.error with context
    logger.error('Cache pattern delete failed', error, {
      pattern,
      errorCount: cacheStats.errors,
      operation: 'pattern-delete'
    });

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
  const cacheKey = `${prefix}:${hash}`;

  // Log key generation in development for debugging
  logger.debug('Cache key generated', {
    prefix,
    hash,
    paramCount: sortedKeys.length,
    key: cacheKey
  });

  return cacheKey;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate = total > 0 ? (cacheStats.hits / total * 100).toFixed(2) : '0.00';

  const stats = {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    enabled: isRedisEnabled(),
  };

  // Log stats when requested
  logger.debug('Cache statistics requested', stats);

  return stats;
}

/**
 * Reset cache statistics (useful for testing)
 */
export function resetCacheStats() {
  logger.debug('Cache statistics reset', {
    previousHits: cacheStats.hits,
    previousMisses: cacheStats.misses,
    previousErrors: cacheStats.errors,
    previousSets: cacheStats.sets
  });

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
  const timer = logger.startTimer('Cache-aside operation');

  logger.group('Cache-aside pattern');

  try {
    // Try cache first
    logger.debug('Checking cache', { key: key.substring(0, 50) });
    const cached = await getCached<T>(key);

    if (cached !== null) {
      logger.debug('Cache-aside: using cached value');
      logger.groupEnd();
      timer.end({ source: 'cache' });
      return cached;
    }

    // Cache miss - fetch data
    logger.debug('Cache-aside: fetching fresh data');
    const fetchTimer = logger.startTimer('Data fetch');
    const data = await fetcher();
    fetchTimer.end({ success: true });

    logger.debug('Cache-aside: data fetched, caching result', {
      key: key.substring(0, 50),
      ttl: `${ttl}s`
    });

    // Cache the result (fire and forget)
    setCache(key, data, ttl).catch(err => {
      logger.error('Failed to cache fetched data', err, {
        key: key.substring(0, 50),
        ttl
      });
    });

    logger.groupEnd();
    timer.end({ source: 'fetch' });

    return data;
  } catch (error) {
    logger.error('Cache-aside operation failed', error, {
      key: key.substring(0, 50)
    });
    logger.groupEnd();
    timer.end({ status: 'failed' });
    throw error;
  }
}
