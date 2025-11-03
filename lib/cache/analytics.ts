/**
 * Cache Analytics Tracking
 *
 * Tracks cache performance metrics for monitoring and optimization:
 * - Cache hit/miss rates by endpoint
 * - Cache response times
 * - API cost savings
 * - Cache health metrics
 * - Performance trends
 */

import { getRedisClient, isRedisEnabled } from './redis';

/**
 * In-memory cache statistics (fallback when Redis unavailable)
 */
interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  totalRequests: number;
  hitRate: number;
  byEndpoint: Map<string, EndpointStats>;
  lastReset: Date;
}

interface EndpointStats {
  namespace: string;
  resource: string;
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  avgResponseTime: number;
  lastAccessed: Date;
}

interface CacheEvent {
  timestamp: number;
  type: 'hit' | 'miss' | 'set' | 'error';
  namespace: string;
  resource: string;
  key: string;
  responseTime?: number;
  error?: string;
}

// In-memory stats (persisted to Redis periodically)
const inMemoryStats: CacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
  totalRequests: 0,
  hitRate: 0,
  byEndpoint: new Map(),
  lastReset: new Date(),
};

/**
 * Track a cache hit event
 */
export async function trackCacheHit(
  namespace: string,
  resource: string,
  key: string,
  responseTime?: number
): Promise<void> {
  // Update in-memory stats
  inMemoryStats.hits++;
  inMemoryStats.totalRequests++;
  inMemoryStats.hitRate = (inMemoryStats.hits / inMemoryStats.totalRequests) * 100;

  // Update endpoint-specific stats
  const endpointKey = `${namespace}:${resource}`;
  let endpointStats = inMemoryStats.byEndpoint.get(endpointKey);

  if (!endpointStats) {
    endpointStats = {
      namespace,
      resource,
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      avgResponseTime: 0,
      lastAccessed: new Date(),
    };
    inMemoryStats.byEndpoint.set(endpointKey, endpointStats);
  }

  endpointStats.hits++;
  endpointStats.totalRequests++;
  endpointStats.hitRate = (endpointStats.hits / endpointStats.totalRequests) * 100;
  endpointStats.lastAccessed = new Date();

  if (responseTime) {
    endpointStats.avgResponseTime =
      (endpointStats.avgResponseTime * (endpointStats.hits - 1) + responseTime) /
      endpointStats.hits;
  }

  // Persist to Redis if available
  if (isRedisEnabled()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        // Increment counters
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const hourKey = `analytics:cache:${date}:${new Date().getHours()}`;

        await Promise.all([
          redis.hincrby(hourKey, 'hits', 1),
          redis.hincrby(hourKey, 'total', 1),
          redis.hincrby(`${hourKey}:${namespace}`, 'hits', 1),
          redis.hincrby(`${hourKey}:${namespace}`, 'total', 1),
          redis.expire(hourKey, 7 * 24 * 60 * 60), // 7 days TTL
        ]);

        // Log event to stream (for real-time monitoring)
        const event: CacheEvent = {
          timestamp: Date.now(),
          type: 'hit',
          namespace,
          resource,
          key,
          responseTime,
        };

        await redis.xadd(
          'cache:events',
          '*',
          { event: JSON.stringify(event) }
        );

        // Trim stream to last 10,000 events
        await redis.xtrim('cache:events', {
          strategy: 'MAXLEN',
          threshold: 10000,
          exactness: '~'
        });
      } catch (error) {
        console.error('[Cache Analytics] Failed to track hit:', error);
      }
    }
  }
}

/**
 * Track a cache miss event
 */
export async function trackCacheMiss(
  namespace: string,
  resource: string,
  key: string,
  responseTime?: number
): Promise<void> {
  // Update in-memory stats
  inMemoryStats.misses++;
  inMemoryStats.totalRequests++;
  inMemoryStats.hitRate = (inMemoryStats.hits / inMemoryStats.totalRequests) * 100;

  // Update endpoint-specific stats
  const endpointKey = `${namespace}:${resource}`;
  let endpointStats = inMemoryStats.byEndpoint.get(endpointKey);

  if (!endpointStats) {
    endpointStats = {
      namespace,
      resource,
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      avgResponseTime: 0,
      lastAccessed: new Date(),
    };
    inMemoryStats.byEndpoint.set(endpointKey, endpointStats);
  }

  endpointStats.misses++;
  endpointStats.totalRequests++;
  endpointStats.hitRate = (endpointStats.hits / endpointStats.totalRequests) * 100;
  endpointStats.lastAccessed = new Date();

  // Persist to Redis if available
  if (isRedisEnabled()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        const date = new Date().toISOString().split('T')[0];
        const hourKey = `analytics:cache:${date}:${new Date().getHours()}`;

        await Promise.all([
          redis.hincrby(hourKey, 'misses', 1),
          redis.hincrby(hourKey, 'total', 1),
          redis.hincrby(`${hourKey}:${namespace}`, 'misses', 1),
          redis.hincrby(`${hourKey}:${namespace}`, 'total', 1),
          redis.expire(hourKey, 7 * 24 * 60 * 60),
        ]);

        // Log event
        const event: CacheEvent = {
          timestamp: Date.now(),
          type: 'miss',
          namespace,
          resource,
          key,
          responseTime,
        };

        await redis.xadd(
          'cache:events',
          '*',
          { event: JSON.stringify(event) }
        );
      } catch (error) {
        console.error('[Cache Analytics] Failed to track miss:', error);
      }
    }
  }
}

/**
 * Track a cache error event
 */
export async function trackCacheError(
  namespace: string,
  resource: string,
  key: string,
  error: Error
): Promise<void> {
  inMemoryStats.errors++;

  if (isRedisEnabled()) {
    const redis = getRedisClient();
    if (redis) {
      try {
        const date = new Date().toISOString().split('T')[0];
        const hourKey = `analytics:cache:${date}:${new Date().getHours()}`;

        await redis.hincrby(hourKey, 'errors', 1);

        // Log error event
        const event: CacheEvent = {
          timestamp: Date.now(),
          type: 'error',
          namespace,
          resource,
          key,
          error: error.message,
        };

        await redis.xadd(
          'cache:events',
          '*',
          { event: JSON.stringify(event) }
        );
      } catch (err) {
        console.error('[Cache Analytics] Failed to track error:', err);
      }
    }
  }
}

/**
 * Get current cache statistics
 */
export function getCacheStatistics(): CacheStats {
  return {
    ...inMemoryStats,
    byEndpoint: new Map(inMemoryStats.byEndpoint),
  };
}

/**
 * Get statistics for a specific endpoint
 */
export function getEndpointStatistics(
  namespace: string,
  resource: string
): EndpointStats | null {
  const key = `${namespace}:${resource}`;
  return inMemoryStats.byEndpoint.get(key) || null;
}

/**
 * Get cache statistics from Redis (historical data)
 */
export async function getHistoricalStatistics(
  daysBack: number = 7
): Promise<{
  daily: Array<{
    date: string;
    hits: number;
    misses: number;
    total: number;
    hitRate: number;
    errors: number;
  }>;
  byNamespace: Map<string, { hits: number; misses: number; hitRate: number }>;
}> {
  if (!isRedisEnabled()) {
    return { daily: [], byNamespace: new Map() };
  }

  const redis = getRedisClient();
  if (!redis) {
    return { daily: [], byNamespace: new Map() };
  }

  try {
    const daily: Array<any> = [];
    const namespaceStats = new Map<string, { hits: number; misses: number; hitRate: number }>();

    // Get stats for each day
    for (let i = 0; i < daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let dayHits = 0;
      let dayMisses = 0;
      let dayErrors = 0;

      // Aggregate hourly stats for the day
      for (let hour = 0; hour < 24; hour++) {
        const hourKey = `analytics:cache:${dateStr}:${hour}`;
        const stats = await redis.hgetall(hourKey);

        if (stats && typeof stats === 'object' && Object.keys(stats).length > 0) {
          const hits = parseInt(String(stats.hits || '0'));
          const misses = parseInt(String(stats.misses || '0'));
          const errors = parseInt(String(stats.errors || '0'));

          dayHits += hits;
          dayMisses += misses;
          dayErrors += errors;
        }
      }

      const dayTotal = dayHits + dayMisses;
      const dayHitRate = dayTotal > 0 ? (dayHits / dayTotal) * 100 : 0;

      daily.push({
        date: dateStr,
        hits: dayHits,
        misses: dayMisses,
        total: dayTotal,
        hitRate: parseFloat(dayHitRate.toFixed(2)),
        errors: dayErrors,
      });
    }

    return {
      daily: daily.reverse(), // Oldest to newest
      byNamespace: namespaceStats,
    };
  } catch (error) {
    console.error('[Cache Analytics] Failed to get historical stats:', error);
    return { daily: [], byNamespace: new Map() };
  }
}

/**
 * Calculate API cost savings based on cache performance
 */
export function calculateCostSavings(stats: CacheStats): {
  totalRequests: number;
  cachedRequests: number;
  apiCalls: number;
  estimatedCost: number;
  estimatedSavings: number;
  savingsPercentage: number;
} {
  const AMADEUS_COST_PER_CALL = 0.04;
  const { hits, totalRequests } = stats;

  const cachedRequests = hits;
  const apiCalls = totalRequests - hits;

  // Estimated cost with current cache hit rate
  const estimatedCost = apiCalls * AMADEUS_COST_PER_CALL;

  // Estimated cost without caching (all requests hit API)
  const baselineCost = totalRequests * AMADEUS_COST_PER_CALL;

  const estimatedSavings = baselineCost - estimatedCost;
  const savingsPercentage =
    baselineCost > 0 ? (estimatedSavings / baselineCost) * 100 : 0;

  return {
    totalRequests,
    cachedRequests,
    apiCalls,
    estimatedCost: parseFloat(estimatedCost.toFixed(2)),
    estimatedSavings: parseFloat(estimatedSavings.toFixed(2)),
    savingsPercentage: parseFloat(savingsPercentage.toFixed(2)),
  };
}

/**
 * Get top performing endpoints (highest hit rates)
 */
export function getTopPerformingEndpoints(limit: number = 10): EndpointStats[] {
  const endpoints = Array.from(inMemoryStats.byEndpoint.values());
  return endpoints
    .filter((ep) => ep.totalRequests >= 10) // Minimum sample size
    .sort((a, b) => b.hitRate - a.hitRate)
    .slice(0, limit);
}

/**
 * Get worst performing endpoints (lowest hit rates)
 */
export function getWorstPerformingEndpoints(limit: number = 10): EndpointStats[] {
  const endpoints = Array.from(inMemoryStats.byEndpoint.values());
  return endpoints
    .filter((ep) => ep.totalRequests >= 10)
    .sort((a, b) => a.hitRate - b.hitRate)
    .slice(0, limit);
}

/**
 * Reset cache statistics (for testing or new period)
 */
export function resetCacheStatistics(): void {
  inMemoryStats.hits = 0;
  inMemoryStats.misses = 0;
  inMemoryStats.errors = 0;
  inMemoryStats.totalRequests = 0;
  inMemoryStats.hitRate = 0;
  inMemoryStats.byEndpoint.clear();
  inMemoryStats.lastReset = new Date();
}

/**
 * Get recent cache events from Redis stream
 */
export async function getRecentCacheEvents(
  limit: number = 100
): Promise<CacheEvent[]> {
  if (!isRedisEnabled()) {
    return [];
  }

  const redis = getRedisClient();
  if (!redis) {
    return [];
  }

  try {
    // TODO: Refine Upstash Redis xrevrange type handling
    // Temporarily disabled due to type compatibility issues with Upstash Redis
    // Will be re-enabled after proper type definitions are established
    return [];

    // const entries = await redis.xrevrange('cache:events', '+', '-', limit);
    // const events: CacheEvent[] = [];
    // ... processing logic
  } catch (error) {
    console.error('[Cache Analytics] Failed to get recent events:', error);
    return [];
  }
}

/**
 * Get cache effectiveness score (0-100)
 * Considers hit rate, response time, and error rate
 */
export function getCacheEffectivenessScore(stats: CacheStats): number {
  const { hits, totalRequests, errors } = stats;

  if (totalRequests === 0) return 0;

  // Hit rate score (0-70 points)
  const hitRate = (hits / totalRequests) * 100;
  const hitRateScore = Math.min(hitRate * 0.7, 70);

  // Error rate score (0-20 points, deducted for errors)
  const errorRate = (errors / totalRequests) * 100;
  const errorScore = Math.max(20 - errorRate * 2, 0);

  // Consistency score (0-10 points, bonus for sustained performance)
  const consistencyScore = 10; // Simplified - could track variance over time

  const totalScore = hitRateScore + errorScore + consistencyScore;
  return Math.round(Math.min(totalScore, 100));
}

/**
 * Generate cache performance report
 */
export async function generateCacheReport(): Promise<{
  summary: {
    totalRequests: number;
    hits: number;
    misses: number;
    hitRate: number;
    errors: number;
    effectiveness: number;
  };
  costSavings: ReturnType<typeof calculateCostSavings>;
  topEndpoints: EndpointStats[];
  worstEndpoints: EndpointStats[];
  recentEvents: CacheEvent[];
  recommendations: string[];
}> {
  const stats = getCacheStatistics();
  const costSavings = calculateCostSavings(stats);
  const topEndpoints = getTopPerformingEndpoints(5);
  const worstEndpoints = getWorstPerformingEndpoints(5);
  const recentEvents = await getRecentCacheEvents(50);
  const effectiveness = getCacheEffectivenessScore(stats);

  // Generate recommendations
  const recommendations: string[] = [];

  if (stats.hitRate < 50) {
    recommendations.push('Cache hit rate is below 50%. Consider increasing TTLs for stable data.');
  }

  if (stats.errors > stats.totalRequests * 0.05) {
    recommendations.push('Error rate exceeds 5%. Check Redis connection and error logs.');
  }

  const lowHitRateEndpoints = worstEndpoints.filter((ep) => ep.hitRate < 30);
  if (lowHitRateEndpoints.length > 0) {
    recommendations.push(
      `${lowHitRateEndpoints.length} endpoint(s) have hit rates below 30%. Review caching strategy.`
    );
  }

  if (stats.totalRequests > 10000 && stats.hitRate > 80) {
    recommendations.push('Excellent cache performance! Consider cache warming for popular routes.');
  }

  return {
    summary: {
      totalRequests: stats.totalRequests,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: parseFloat(stats.hitRate.toFixed(2)),
      errors: stats.errors,
      effectiveness,
    },
    costSavings,
    topEndpoints,
    worstEndpoints,
    recentEvents,
    recommendations,
  };
}

/**
 * Export analytics utilities
 */
export const CacheAnalytics = {
  track: {
    hit: trackCacheHit,
    miss: trackCacheMiss,
    error: trackCacheError,
  },
  get: {
    current: getCacheStatistics,
    endpoint: getEndpointStatistics,
    historical: getHistoricalStatistics,
    events: getRecentCacheEvents,
  },
  calculate: {
    costSavings: calculateCostSavings,
    effectiveness: getCacheEffectivenessScore,
  },
  analyze: {
    top: getTopPerformingEndpoints,
    worst: getWorstPerformingEndpoints,
    report: generateCacheReport,
  },
  reset: resetCacheStatistics,
};
