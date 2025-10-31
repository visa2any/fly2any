/**
 * Route Profiler
 * Tracks price volatility and route popularity for intelligent caching
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';
import type {
  RouteCacheProfile,
  PriceSample,
  RouteSearchLog,
  APIPerformanceProfile,
} from './types';

export class RouteProfiler {
  private readonly PROFILE_KEY_PREFIX = 'route:profile:';
  private readonly SEARCH_LOG_KEY_PREFIX = 'route:searches:';
  private readonly API_PERF_KEY_PREFIX = 'route:api:perf:';
  private readonly PRICE_HISTORY_KEY_PREFIX = 'route:prices:';

  /**
   * Get route cache profile with volatility and popularity metrics
   */
  async getRouteProfile(route: string): Promise<RouteCacheProfile | null> {
    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const key = `${this.PROFILE_KEY_PREFIX}${route}`;
      const cached = await redis.get(key);

      if (cached) {
        // Handle both string and object responses from Redis
        return typeof cached === 'string' ? JSON.parse(cached) : cached as RouteCacheProfile;
      }

      // Profile doesn't exist - create initial one
      return await this.createInitialProfile(route);
    } catch (error) {
      console.error('Error getting route profile:', error);
      return null;
    }
  }

  /**
   * Create initial profile for new route
   */
  private async createInitialProfile(route: string): Promise<RouteCacheProfile> {
    const [origin, destination] = route.split('-');

    const profile: RouteCacheProfile = {
      route,
      origin,
      destination,
      volatility: 0.5, // Default medium volatility
      popularity: 0,
      optimalTTL: 15, // Default 15 minutes
      avgPrice: 0,
      priceStdDev: 0,
      searchesLast7Days: 0,
      searchesLast30Days: 0,
      seasonalTrend: 1.0,
      lastUpdated: new Date(),
      priceSamples: [],
    };

    await this.saveRouteProfile(profile);
    return profile;
  }

  /**
   * Save route profile to cache
   */
  private async saveRouteProfile(profile: RouteCacheProfile): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    const key = `${this.PROFILE_KEY_PREFIX}${profile.route}`;
    // Store profile for 7 days
    await redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(profile));
  }

  /**
   * Log a search for route profiling
   */
  async logSearch(log: RouteSearchLog): Promise<void> {
    try {
      const redis = getRedisClient();
      if (!redis) return;

      const route = log.route;
      const key = `${this.SEARCH_LOG_KEY_PREFIX}${route}`;

      // Add to search log list (keep last 1000 searches)
      await redis.lpush(key, JSON.stringify(log));
      await redis.ltrim(key, 0, 999);
      await redis.expire(key, 30 * 24 * 60 * 60); // 30 days

      // Update price history
      await this.logPrice({
        price: log.lowestPrice,
        currency: log.currency,
        timestamp: log.timestamp,
        cabinClass: log.params.cabinClass,
        source: 'search',
      }, route);

      // Update profile asynchronously (don't block search)
      this.updateProfileAsync(route).catch(console.error);
    } catch (error) {
      console.error('Error logging search:', error);
    }
  }

  /**
   * Log price sample for route
   */
  async logPrice(sample: PriceSample, route: string): Promise<void> {
    try {
      const redis = getRedisClient();
      if (!redis) return;

      const key = `${this.PRICE_HISTORY_KEY_PREFIX}${route}`;

      // Store price with timestamp as score (for time-based queries)
      const score = sample.timestamp.getTime();
      await redis.zadd(key, { score, member: JSON.stringify(sample) });

      // Keep only last 30 days of prices
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      await redis.zremrangebyscore(key, 0, thirtyDaysAgo);

      await redis.expire(key, 30 * 24 * 60 * 60);
    } catch (error) {
      console.error('Error logging price:', error);
    }
  }

  /**
   * Update route profile with latest data
   */
  private async updateProfileAsync(route: string): Promise<void> {
    try {
      // Get recent searches (last 30 days)
      const searches = await this.getRecentSearches(route, 30);
      const prices = await this.getRecentPrices(route, 30);

      if (searches.length === 0 && prices.length === 0) {
        return; // No data to update
      }

      const profile = await this.getRouteProfile(route);
      if (!profile) return;

      // Calculate volatility from price changes
      const volatility = this.calculateVolatility(prices);

      // Calculate popularity from search volume
      const searchesLast7Days = searches.filter(
        s => new Date(s.timestamp).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
      ).length;

      const searchesLast30Days = searches.length;

      const popularity = this.calculatePopularity(searchesLast7Days, searchesLast30Days);

      // Calculate price statistics
      const priceValues = prices.map(p => p.price);
      const avgPrice = priceValues.length > 0
        ? priceValues.reduce((a, b) => a + b, 0) / priceValues.length
        : 0;

      const priceStdDev = priceValues.length > 0
        ? Math.sqrt(
            priceValues.reduce((sq, n) => sq + Math.pow(n - avgPrice, 2), 0) / priceValues.length
          )
        : 0;

      // Calculate optimal TTL based on volatility and popularity
      const optimalTTL = this.calculateOptimalTTL(volatility, popularity);

      // Update profile
      const updatedProfile: RouteCacheProfile = {
        ...profile,
        volatility,
        popularity,
        optimalTTL,
        avgPrice,
        priceStdDev,
        searchesLast7Days,
        searchesLast30Days,
        lastUpdated: new Date(),
        priceSamples: prices.slice(0, 100), // Keep last 100 samples
      };

      await this.saveRouteProfile(updatedProfile);

      console.log(`📊 Updated profile for ${route}:`, {
        volatility: volatility.toFixed(3),
        popularity: popularity.toFixed(0),
        optimalTTL: `${optimalTTL}min`,
        avgPrice: `$${avgPrice.toFixed(2)}`,
        searches7d: searchesLast7Days,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  /**
   * Calculate price volatility (0-1 scale)
   * Higher = more volatile = shorter cache
   */
  private calculateVolatility(prices: PriceSample[]): number {
    if (prices.length < 2) return 0.5; // Default medium volatility

    const priceValues = prices.map(p => p.price);
    const avgPrice = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;

    if (avgPrice === 0) return 0.5;

    // Calculate coefficient of variation (normalized std dev)
    const stdDev = Math.sqrt(
      priceValues.reduce((sq, n) => sq + Math.pow(n - avgPrice, 2), 0) / priceValues.length
    );

    const coefficientOfVariation = stdDev / avgPrice;

    // Normalize to 0-1 scale (cap at 0.5 CoV = 1.0 volatility)
    const volatility = Math.min(coefficientOfVariation * 2, 1.0);

    return volatility;
  }

  /**
   * Calculate route popularity score
   */
  private calculatePopularity(searches7d: number, searches30d: number): number {
    // Weighted formula: recent searches count more
    const score = (searches7d * 0.7) + (searches30d * 0.3);
    return score;
  }

  /**
   * Calculate optimal cache TTL based on volatility and popularity
   */
  private calculateOptimalTTL(volatility: number, popularity: number): number {
    // High popularity + low volatility = longer cache
    // Low popularity + high volatility = shorter cache

    // Popular routes (>100 searches/week) with low volatility
    if (popularity > 100 && volatility < 0.3) {
      return 60; // 1 hour
    }

    // Medium popularity with moderate volatility
    if (popularity > 50 && volatility < 0.5) {
      return 30; // 30 minutes
    }

    // High volatility routes
    if (volatility > 0.7) {
      return 10; // 10 minutes
    }

    // Low popularity routes
    if (popularity < 10) {
      return 20; // 20 minutes
    }

    return 15; // Default 15 minutes
  }

  /**
   * Get recent searches for route
   */
  async getRecentSearches(route: string, days: number): Promise<RouteSearchLog[]> {
    try {
      const redis = getRedisClient();
      if (!redis) return [];

      const key = `${this.SEARCH_LOG_KEY_PREFIX}${route}`;
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

      const logs = await redis.lrange(key, 0, -1);
      const parsed = logs.map(log => typeof log === 'string' ? JSON.parse(log) : log) as RouteSearchLog[];

      return parsed.filter(log => new Date(log.timestamp).getTime() > cutoff);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  /**
   * Get recent prices for route
   */
  async getRecentPrices(route: string, days: number): Promise<PriceSample[]> {
    try {
      const redis = getRedisClient();
      if (!redis) return [];

      const key = `${this.PRICE_HISTORY_KEY_PREFIX}${route}`;
      const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

      const samples = await redis.zrange(key, cutoff, '+inf', { byScore: true });
      return samples.map(s => typeof s === 'string' ? JSON.parse(s) : s) as PriceSample[];
    } catch (error) {
      console.error('Error getting recent prices:', error);
      return [];
    }
  }

  /**
   * Log API performance comparison
   */
  async logAPIPerformance(
    route: string,
    amadeusPrice: number | null,
    duffelPrice: number | null,
    amadeusTime: number,
    duffelTime: number
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      if (!redis) return;

      const key = `${this.API_PERF_KEY_PREFIX}${route}`;

      const existing = await redis.get(key);
      const profile: APIPerformanceProfile = existing
        ? (typeof existing === 'string' ? JSON.parse(existing) : existing)
        : {
            route,
            amadeusWinRate: 0.5,
            duffelWinRate: 0.5,
            avgPriceDifference: 0,
            duffelCoverageRate: 0.5,
            amadeusAvgResponseTime: 0,
            duffelAvgResponseTime: 0,
            lastUpdated: new Date(),
          };

      // Update win rates with exponential moving average (alpha = 0.1)
      const alpha = 0.1;

      if (amadeusPrice !== null && duffelPrice !== null) {
        const amadeusWins = amadeusPrice < duffelPrice ? 1 : 0;
        profile.amadeusWinRate = profile.amadeusWinRate * (1 - alpha) + amadeusWins * alpha;
        profile.duffelWinRate = 1 - profile.amadeusWinRate;

        const priceDiff = amadeusPrice - duffelPrice;
        profile.avgPriceDifference = profile.avgPriceDifference * (1 - alpha) + priceDiff * alpha;
      }

      // Update coverage rate
      const duffelHasInventory = duffelPrice !== null ? 1 : 0;
      profile.duffelCoverageRate = profile.duffelCoverageRate * (1 - alpha) + duffelHasInventory * alpha;

      // Update response times
      profile.amadeusAvgResponseTime = profile.amadeusAvgResponseTime * (1 - alpha) + amadeusTime * alpha;
      profile.duffelAvgResponseTime = profile.duffelAvgResponseTime * (1 - alpha) + duffelTime * alpha;

      profile.lastUpdated = new Date();

      await redis.setex(key, 7 * 24 * 60 * 60, JSON.stringify(profile));
    } catch (error) {
      console.error('Error logging API performance:', error);
    }
  }

  /**
   * Get API performance profile for route
   */
  async getAPIPerformance(route: string): Promise<APIPerformanceProfile | null> {
    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const key = `${this.API_PERF_KEY_PREFIX}${route}`;
      const cached = await redis.get(key);

      if (cached) {
        // Handle both string and object responses from Redis
        return typeof cached === 'string' ? JSON.parse(cached) : cached as APIPerformanceProfile;
      }

      return null;
    } catch (error) {
      console.error('Error getting API performance:', error);
      return null;
    }
  }
}

// Singleton instance
export const routeProfiler = new RouteProfiler();
