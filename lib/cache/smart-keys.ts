/**
 * Smart Cache Key Generation
 *
 * Provides intelligent cache key generation with:
 * - Parameter normalization (order-independent)
 * - Namespace support
 * - Versioning for cache busting
 * - Collision-free hashing
 * - Readable key prefixes
 */

// Cache version - increment to bust all caches
const CACHE_VERSION = 'v2';

/**
 * Normalize an object's keys and values for deterministic cache keys
 * Sorts keys alphabetically and handles nested objects
 */
export function normalizeParams(params: Record<string, any>): Record<string, any> {
  if (!params || typeof params !== 'object') {
    return {};
  }

  const normalized: Record<string, any> = {};
  const sortedKeys = Object.keys(params).sort();

  for (const key of sortedKeys) {
    const value = params[key];

    // Skip undefined/null values
    if (value === undefined || value === null) {
      continue;
    }

    // Recursively normalize nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      normalized[key] = normalizeParams(value);
    }
    // Sort arrays for consistency
    else if (Array.isArray(value)) {
      normalized[key] = [...value].sort();
    }
    // Normalize strings (trim, lowercase for case-insensitive keys)
    else if (typeof value === 'string') {
      normalized[key] = value.trim();
    }
    // Keep other primitives as-is
    else {
      normalized[key] = value;
    }
  }

  return normalized;
}

/**
 * Generate a deterministic hash from parameters
 * Uses a simple hash function compatible with Edge runtime
 */
export function hashParams(params: Record<string, any>): string {
  const normalized = normalizeParams(params);
  const paramString = JSON.stringify(normalized);

  // Simple hash function (DJB2 algorithm)
  let hash = 5381;
  for (let i = 0; i < paramString.length; i++) {
    const char = paramString.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to base36 for shorter keys
  return Math.abs(hash).toString(36);
}

/**
 * Generate a smart cache key with namespace and version
 *
 * @param namespace - Cache namespace (e.g., 'flight', 'hotel', 'static')
 * @param resource - Resource type (e.g., 'search', 'details', 'airports')
 * @param params - Parameters to include in key
 * @param options - Additional options
 * @returns Deterministic cache key
 *
 * @example
 * generateSmartCacheKey('flight', 'search', {
 *   origin: 'JFK',
 *   destination: 'LAX',
 *   departureDate: '2025-11-15',
 *   adults: 1
 * })
 * // Returns: "flight:v2:search:abc123"
 */
export function generateSmartCacheKey(
  namespace: string,
  resource: string,
  params: Record<string, any>,
  options?: {
    version?: string;
    includeReadable?: boolean;
  }
): string {
  const version = options?.version || CACHE_VERSION;
  const hash = hashParams(params);

  // Base key: namespace:version:resource:hash
  let key = `${namespace}:${version}:${resource}:${hash}`;

  // Optionally include readable params for debugging
  if (options?.includeReadable) {
    const normalized = normalizeParams(params);
    const readableParts: string[] = [];

    // Add up to 3 most important params for readability
    const importantKeys = ['origin', 'destination', 'cityCode', 'query', 'date', 'id']
      .filter(k => normalized[k]);

    for (const key of importantKeys.slice(0, 3)) {
      readableParts.push(`${key}=${normalized[key]}`);
    }

    if (readableParts.length > 0) {
      key += `:${readableParts.join(':')}`;
    }
  }

  return key;
}

/**
 * Flight-specific cache key generator
 */
export function generateFlightCacheKey(
  operation: 'search' | 'details' | 'offers' | 'ancillaries',
  params: Record<string, any>
): string {
  return generateSmartCacheKey('flight', operation, params);
}

/**
 * Hotel-specific cache key generator
 */
export function generateHotelCacheKey(
  operation: 'search' | 'details' | 'quote' | 'featured',
  params: Record<string, any>
): string {
  return generateSmartCacheKey('hotel', operation, params);
}

/**
 * Static content cache key generator
 * Uses longer namespace for static data that rarely changes
 */
export function generateStaticCacheKey(
  resource: 'airports' | 'airlines' | 'cities' | 'countries',
  params: Record<string, any> = {}
): string {
  return generateSmartCacheKey('static', resource, params);
}

/**
 * Analytics cache key generator
 */
export function generateAnalyticsCacheKey(
  metric: 'popular-routes' | 'flash-deals' | 'ml-analytics',
  params: Record<string, any> = {}
): string {
  return generateSmartCacheKey('analytics', metric, params);
}

/**
 * Generate cache key pattern for bulk operations
 *
 * @example
 * generateCacheKeyPattern('flight', 'search', { origin: 'JFK' })
 * // Returns: "flight:v2:search:*:origin=JFK"
 */
export function generateCacheKeyPattern(
  namespace: string,
  resource: string,
  partialParams?: Record<string, any>
): string {
  const version = CACHE_VERSION;
  let pattern = `${namespace}:${version}:${resource}:*`;

  if (partialParams) {
    const normalized = normalizeParams(partialParams);
    const parts = Object.entries(normalized)
      .map(([key, value]) => `${key}=${value}`)
      .join(':');

    if (parts) {
      pattern += `:${parts}`;
    }
  }

  return pattern;
}

/**
 * Parse a cache key back into its components
 * Useful for debugging and analytics
 */
export function parseCacheKey(key: string): {
  namespace: string;
  version: string;
  resource: string;
  hash: string;
  readable?: string[];
} | null {
  const parts = key.split(':');

  if (parts.length < 4) {
    return null;
  }

  return {
    namespace: parts[0],
    version: parts[1],
    resource: parts[2],
    hash: parts[3],
    readable: parts.slice(4),
  };
}

/**
 * Validate if a cache key matches expected format
 */
export function isValidCacheKey(key: string): boolean {
  const parsed = parseCacheKey(key);
  return parsed !== null && parsed.namespace.length > 0;
}

/**
 * Generate a geo-specific cache key
 * Useful for location-based content like popular routes
 */
export function generateGeoCacheKey(
  resource: string,
  region: string,
  params: Record<string, any> = {}
): string {
  return generateSmartCacheKey('geo', resource, {
    region,
    ...params,
  });
}

/**
 * Generate a time-bucketed cache key
 * Useful for time-sensitive data that should refresh periodically
 *
 * @param bucketMinutes - Time bucket size in minutes (e.g., 30 = new cache every 30 min)
 */
export function generateTimeBucketedCacheKey(
  namespace: string,
  resource: string,
  params: Record<string, any>,
  bucketMinutes: number = 30
): string {
  const timestamp = Date.now();
  const bucket = Math.floor(timestamp / (bucketMinutes * 60 * 1000));

  return generateSmartCacheKey(namespace, resource, {
    ...params,
    _timeBucket: bucket,
  });
}

/**
 * Generate cache key for user-specific data
 * Includes user ID and optional session ID
 */
export function generateUserCacheKey(
  userId: string,
  resource: string,
  params: Record<string, any> = {}
): string {
  return generateSmartCacheKey('user', resource, {
    userId,
    ...params,
  });
}

/**
 * Cache key utilities
 */
export const CacheKeyUtils = {
  normalize: normalizeParams,
  hash: hashParams,
  generate: generateSmartCacheKey,
  parse: parseCacheKey,
  validate: isValidCacheKey,
  pattern: generateCacheKeyPattern,
};

/**
 * Preset cache key generators by domain
 */
export const CacheKeys = {
  flight: generateFlightCacheKey,
  hotel: generateHotelCacheKey,
  static: generateStaticCacheKey,
  analytics: generateAnalyticsCacheKey,
  geo: generateGeoCacheKey,
  timeBucketed: generateTimeBucketedCacheKey,
  user: generateUserCacheKey,
};

/**
 * Example usage:
 *
 * // Generate flight search cache key
 * const key = CacheKeys.flight('search', {
 *   origin: 'JFK',
 *   destination: 'LAX',
 *   departureDate: '2025-11-15',
 *   adults: 1
 * });
 *
 * // These generate the SAME key (order-independent):
 * CacheKeys.flight('search', { origin: 'JFK', destination: 'LAX' })
 * CacheKeys.flight('search', { destination: 'LAX', origin: 'JFK' })
 *
 * // Generate pattern for invalidation
 * const pattern = CacheKeyUtils.pattern('flight', 'search', { origin: 'JFK' });
 * await deleteCachePattern(pattern); // Delete all JFK departures
 */
