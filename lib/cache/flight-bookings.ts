/**
 * Flight Bookings Cache Layer
 * Redis caching for flight booking counts with smart invalidation
 */

import { getCached, setCache, deleteCache, deleteCachePattern } from './helpers';
import {
  getFlightBookingStats,
  getBatchBookingStats,
  getRouteBookingStats,
  estimateBookingCount,
  FlightBookingCount,
  RouteBookingStats,
  createRouteKey,
  getDaysUntilDeparture,
} from '../db/flight-bookings';
import { isRedisEnabled } from './redis';

// ============================================
// CACHE CONFIGURATION
// ============================================

const CACHE_TTL = {
  BOOKING_COUNTS: 300, // 5 minutes (frequent updates for real-time feel)
  ROUTE_STATS: 600, // 10 minutes (route stats change slower)
  BATCH_STATS: 300, // 5 minutes
};

const CACHE_KEYS = {
  FLIGHT_BOOKING: (flightId: string) => `flight_booking:${flightId}`,
  ROUTE_BOOKING: (routeKey: string) => `route_booking:${routeKey}`,
  BATCH_BOOKING: (flightIds: string[]) => `batch_booking:${flightIds.sort().join(',')}`,
};

// ============================================
// CACHED BOOKING COUNT QUERIES
// ============================================

/**
 * Get booking count for a flight with caching
 * Cache-aside pattern with 5-minute TTL
 *
 * @param flightId - Unique flight identifier
 * @returns Booking statistics with trend
 */
export async function getCachedFlightBookingStats(
  flightId: string
): Promise<FlightBookingCount> {
  const cacheKey = CACHE_KEYS.FLIGHT_BOOKING(flightId);

  try {
    // Try cache first
    if (isRedisEnabled()) {
      const cached = await getCached<FlightBookingCount>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Cache miss - fetch from database
    const stats = await getFlightBookingStats(flightId);

    // Cache the result
    if (isRedisEnabled()) {
      await setCache(cacheKey, stats, CACHE_TTL.BOOKING_COUNTS);
    }

    return stats;
  } catch (error) {
    console.error('Error in getCachedFlightBookingStats:', error);
    // Return default stats on error
    return {
      flightId,
      bookingsToday: 0,
      bookingsYesterday: 0,
      trend: 'steady',
      totalPassengers: 0,
      avgPrice: 0,
    };
  }
}

/**
 * Get booking counts for multiple flights with caching
 * Optimized batch query with Redis caching
 *
 * @param flightIds - Array of flight identifiers
 * @returns Map of flightId to FlightBookingCount
 */
export async function getCachedBatchBookingStats(
  flightIds: string[]
): Promise<Map<string, FlightBookingCount>> {
  if (flightIds.length === 0) return new Map();

  try {
    // For batch queries, we query individual cache keys
    const statsMap = new Map<string, FlightBookingCount>();
    const uncachedIds: string[] = [];

    // Check cache for each flight
    if (isRedisEnabled()) {
      for (const flightId of flightIds) {
        const cacheKey = CACHE_KEYS.FLIGHT_BOOKING(flightId);
        const cached = await getCached<FlightBookingCount>(cacheKey);

        if (cached) {
          statsMap.set(flightId, cached);
        } else {
          uncachedIds.push(flightId);
        }
      }
    } else {
      uncachedIds.push(...flightIds);
    }

    // Fetch uncached from database in batch
    if (uncachedIds.length > 0) {
      const dbStats = await getBatchBookingStats(uncachedIds);

      // Cache each result individually
      if (isRedisEnabled()) {
        // Convert entries to array to avoid iterator issues
        const entries = Array.from(dbStats.entries());
        for (const [flightId, stats] of entries) {
          const cacheKey = CACHE_KEYS.FLIGHT_BOOKING(flightId);
          await setCache(cacheKey, stats, CACHE_TTL.BATCH_STATS);
          statsMap.set(flightId, stats);
        }
      } else {
        // Convert entries to array to avoid iterator issues
        const entries = Array.from(dbStats.entries());
        for (const [flightId, stats] of entries) {
          statsMap.set(flightId, stats);
        }
      }
    }

    return statsMap;
  } catch (error) {
    console.error('Error in getCachedBatchBookingStats:', error);
    return new Map();
  }
}

/**
 * Get route booking statistics with caching
 *
 * @param routeKey - Route identifier (e.g., "JFK-LAX")
 * @returns Route booking statistics
 */
export async function getCachedRouteBookingStats(
  routeKey: string
): Promise<RouteBookingStats> {
  const cacheKey = CACHE_KEYS.ROUTE_BOOKING(routeKey);

  try {
    // Try cache first
    if (isRedisEnabled()) {
      const cached = await getCached<RouteBookingStats>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Cache miss - fetch from database
    const stats = await getRouteBookingStats(routeKey);

    // Cache the result
    if (isRedisEnabled()) {
      await setCache(cacheKey, stats, CACHE_TTL.ROUTE_STATS);
    }

    return stats;
  } catch (error) {
    console.error('Error in getCachedRouteBookingStats:', error);
    return {
      routeKey,
      bookingsToday: 0,
      trend: 'steady',
    };
  }
}

// ============================================
// SMART FALLBACK WITH ESTIMATION
// ============================================

/**
 * Get booking count with intelligent fallback
 * First tries cache, then database, then estimation
 *
 * @param flightId - Flight identifier
 * @param fallbackParams - Parameters for estimation if DB fails
 * @returns Booking count (real or estimated)
 */
export async function getBookingCountWithFallback(
  flightId: string,
  fallbackParams?: {
    origin: string;
    destination: string;
    seatsLeft: number;
    departureDate: string;
    isDirect: boolean;
    price: number;
  }
): Promise<number> {
  try {
    // Try to get real data from cache/database
    const stats = await getCachedFlightBookingStats(flightId);

    // If we have real data, return it
    if (stats.bookingsToday > 0) {
      return stats.bookingsToday;
    }

    // If no bookings recorded but DB is available, might be a new flight
    // Try route-based estimation
    if (fallbackParams) {
      const routeKey = createRouteKey(fallbackParams.origin, fallbackParams.destination);
      const routeStats = await getCachedRouteBookingStats(routeKey);

      // If route has bookings, use route average with some variation
      if (routeStats.bookingsToday > 0) {
        // Add random variation ±20%
        const variation = 0.8 + Math.random() * 0.4;
        return Math.round(routeStats.bookingsToday * variation);
      }
    }

    // If no real data available, use estimation algorithm
    if (fallbackParams) {
      const routeKey = createRouteKey(fallbackParams.origin, fallbackParams.destination);
      const daysUntilDeparture = getDaysUntilDeparture(fallbackParams.departureDate);

      return estimateBookingCount({
        routeKey,
        seatsLeft: fallbackParams.seatsLeft,
        daysUntilDeparture,
        isDirect: fallbackParams.isDirect,
        price: fallbackParams.price,
      });
    }

    // Last resort: return a reasonable default
    return Math.floor(Math.random() * 80) + 70; // 70-150 range
  } catch (error) {
    console.error('Error in getBookingCountWithFallback:', error);

    // Use estimation if provided
    if (fallbackParams) {
      const routeKey = createRouteKey(fallbackParams.origin, fallbackParams.destination);
      const daysUntilDeparture = getDaysUntilDeparture(fallbackParams.departureDate);

      return estimateBookingCount({
        routeKey,
        seatsLeft: fallbackParams.seatsLeft,
        daysUntilDeparture,
        isDirect: fallbackParams.isDirect,
        price: fallbackParams.price,
      });
    }

    // Final fallback
    return Math.floor(Math.random() * 80) + 70;
  }
}

// ============================================
// CACHE INVALIDATION
// ============================================

/**
 * Invalidate booking count cache for a specific flight
 * Call this when a new booking is created
 *
 * @param flightId - Flight identifier
 */
export async function invalidateFlightBookingCache(flightId: string): Promise<void> {
  try {
    const cacheKey = CACHE_KEYS.FLIGHT_BOOKING(flightId);
    await deleteCache(cacheKey);
    console.log(`✅ Invalidated booking cache for flight: ${flightId}`);
  } catch (error) {
    console.error('Error invalidating flight booking cache:', error);
  }
}

/**
 * Invalidate route booking cache
 * Call this when bookings are created for a route
 *
 * @param routeKey - Route identifier (e.g., "JFK-LAX")
 */
export async function invalidateRouteBookingCache(routeKey: string): Promise<void> {
  try {
    const cacheKey = CACHE_KEYS.ROUTE_BOOKING(routeKey);
    await deleteCache(cacheKey);
    console.log(`✅ Invalidated booking cache for route: ${routeKey}`);
  } catch (error) {
    console.error('Error invalidating route booking cache:', error);
  }
}

/**
 * Invalidate all flight booking caches
 * Use sparingly - only for bulk operations or maintenance
 */
export async function invalidateAllBookingCaches(): Promise<void> {
  try {
    const flightPattern = 'flight_booking:*';
    const routePattern = 'route_booking:*';
    const batchPattern = 'batch_booking:*';

    await deleteCachePattern(flightPattern);
    await deleteCachePattern(routePattern);
    await deleteCachePattern(batchPattern);

    console.log('✅ Invalidated all booking caches');
  } catch (error) {
    console.error('Error invalidating all booking caches:', error);
  }
}

/**
 * Warm up cache for popular flights
 * Pre-load cache with booking counts for frequently viewed flights
 *
 * @param flightIds - Array of flight identifiers to warm up
 */
export async function warmupBookingCache(flightIds: string[]): Promise<void> {
  try {
    console.log(`🔥 Warming up booking cache for ${flightIds.length} flights...`);

    // Batch fetch from database
    const statsMap = await getBatchBookingStats(flightIds);

    // Cache each result
    if (isRedisEnabled()) {
      // Convert entries to array to avoid iterator issues
      const entries = Array.from(statsMap.entries());
      for (const [flightId, stats] of entries) {
        const cacheKey = CACHE_KEYS.FLIGHT_BOOKING(flightId);
        await setCache(cacheKey, stats, CACHE_TTL.BOOKING_COUNTS);
      }
    }

    console.log(`✅ Warmed up cache for ${statsMap.size} flights`);
  } catch (error) {
    console.error('Error warming up booking cache:', error);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get cache status for monitoring
 */
export async function getBookingCacheStats(): Promise<{
  enabled: boolean;
  ttl: number;
  keyCount: number;
}> {
  return {
    enabled: isRedisEnabled(),
    ttl: CACHE_TTL.BOOKING_COUNTS,
    keyCount: 0, // TODO: Implement key counting if needed
  };
}
