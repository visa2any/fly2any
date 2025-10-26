/**
 * Predictive Pre-Fetching System
 * Pre-fetches popular routes during off-peak hours to maximize cache hits
 */

import { routeProfiler } from './route-profiler';
import type { PreFetchCandidate, RouteCacheProfile } from './types';

export class PredictivePreFetcher {
  private readonly TOP_ROUTES_LIMIT = 50;
  private readonly OFF_PEAK_HOURS = [2, 3, 4, 5, 6]; // 2 AM - 6 AM EST

  /**
   * Get top routes that should be pre-fetched
   */
  async getPreFetchCandidates(limit: number = this.TOP_ROUTES_LIMIT): Promise<PreFetchCandidate[]> {
    try {
      // Get all route profiles from Redis
      const profiles = await this.getAllRouteProfiles();

      if (profiles.length === 0) {
        console.log('📋 No route profiles found for pre-fetching');
        return [];
      }

      // Score and rank routes
      const candidates = await Promise.all(
        profiles.map(profile => this.createPreFetchCandidate(profile))
      );

      // Sort by priority (higher first)
      candidates.sort((a, b) => b.priority - a.priority);

      // Return top N candidates
      return candidates.slice(0, limit);
    } catch (error) {
      console.error('Error getting pre-fetch candidates:', error);
      return [];
    }
  }

  /**
   * Create pre-fetch candidate from route profile
   */
  private async createPreFetchCandidate(profile: RouteCacheProfile): Promise<PreFetchCandidate> {
    const [origin, destination] = profile.route.split('-');

    // Calculate priority score
    const priority = this.calculatePriority(profile);

    // Estimate expected searches in next 24h
    const expectedSearches = this.estimateExpectedSearches(profile);

    // Estimate cost savings from pre-fetching
    const estimatedSavings = this.estimateSavings(expectedSearches, profile.optimalTTL);

    // Get optimal departure dates to pre-fetch (next 7 days, focusing on popular days)
    const departureDates = this.getOptimalDepartureDates();

    // Create candidate for the most popular departure date
    return {
      route: profile.route,
      origin,
      destination,
      departureDate: departureDates[0],
      returnDate: this.getOptimalReturnDate(departureDates[0]),
      cabinClass: 'economy', // Start with economy, most popular
      priority,
      expectedSearches,
      estimatedSavings,
    };
  }

  /**
   * Calculate priority score for pre-fetching
   * Higher score = higher priority
   */
  private calculatePriority(profile: RouteCacheProfile): number {
    let score = 0;

    // Popularity contributes most to priority
    score += profile.popularity * 10;

    // Recent searches boost priority
    score += profile.searchesLast7Days * 5;

    // Stable prices (low volatility) are good candidates
    const priceStability = 1 - profile.volatility;
    score += priceStability * 50;

    // Longer optimal TTL means more value from pre-fetching
    score += (profile.optimalTTL / 60) * 20; // Normalize to hours

    return Math.round(score);
  }

  /**
   * Estimate expected searches in next 24 hours
   */
  private estimateExpectedSearches(profile: RouteCacheProfile): number {
    // Simple model: (searches last 7 days / 7) * 1.2 (with 20% safety margin)
    const dailyAverage = profile.searchesLast7Days / 7;
    return Math.round(dailyAverage * 1.2);
  }

  /**
   * Estimate cost savings from pre-fetching
   */
  private estimateSavings(expectedSearches: number, cacheTTL: number): number {
    const AMADEUS_COST_PER_CALL = 0.04;

    // Assume cache hit rate based on TTL
    const cacheHitRate = Math.min(0.90, cacheTTL / 60); // Up to 90% hit rate

    // API calls saved = expected searches * cache hit rate
    const apiCallsSaved = expectedSearches * cacheHitRate;

    // Cost savings (only Amadeus has cost)
    const savings = apiCallsSaved * AMADEUS_COST_PER_CALL;

    return savings;
  }

  /**
   * Get optimal departure dates for pre-fetching
   * Focus on popular booking patterns (7-14 days out, weekends, etc.)
   */
  private getOptimalDepartureDates(): string[] {
    const dates: string[] = [];
    const now = new Date();

    // Popular booking windows: 7, 10, 14, 21, 30 days out
    const daysOut = [7, 10, 14, 21, 30];

    for (const days of daysOut) {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  /**
   * Get optimal return date (7 days after departure by default)
   */
  private getOptimalReturnDate(departureDate: string): string {
    const departure = new Date(departureDate);
    const returnDate = new Date(departure);
    returnDate.setDate(returnDate.getDate() + 7); // 7-day trip
    return returnDate.toISOString().split('T')[0];
  }

  /**
   * Check if current time is during off-peak hours
   */
  isOffPeakHour(): boolean {
    const now = new Date();
    const hour = now.getHours();

    return this.OFF_PEAK_HOURS.includes(hour);
  }

  /**
   * Execute pre-fetching for top routes
   * This should be called by a background job
   */
  async executePrefetch(
    limit: number = this.TOP_ROUTES_LIMIT,
    onProgress?: (route: string, progress: number, total: number) => void
  ): Promise<{
    fetched: number;
    skipped: number;
    errors: number;
    totalSavings: number;
  }> {
    console.log('🚀 Starting predictive pre-fetch...');

    // Only run during off-peak hours
    if (!this.isOffPeakHour()) {
      console.log('⏰ Not off-peak hour - skipping pre-fetch');
      return {
        fetched: 0,
        skipped: 0,
        errors: 0,
        totalSavings: 0,
      };
    }

    const candidates = await this.getPreFetchCandidates(limit);

    if (candidates.length === 0) {
      console.log('📋 No candidates found for pre-fetching');
      return {
        fetched: 0,
        skipped: 0,
        errors: 0,
        totalSavings: 0,
      };
    }

    let fetched = 0;
    let skipped = 0;
    let errors = 0;
    let totalSavings = 0;

    console.log(`📊 Found ${candidates.length} routes to pre-fetch`);

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];

      try {
        // Report progress
        if (onProgress) {
          onProgress(candidate.route, i + 1, candidates.length);
        }

        // Check if already cached
        const isCached = await this.isCached(candidate);
        if (isCached) {
          skipped++;
          continue;
        }

        // Execute pre-fetch (make actual API call)
        await this.fetchRoute(candidate);

        fetched++;
        totalSavings += candidate.estimatedSavings;

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error pre-fetching ${candidate.route}:`, error);
        errors++;
      }
    }

    console.log(`✅ Pre-fetch complete: ${fetched} fetched, ${skipped} cached, ${errors} errors`);
    console.log(`💰 Estimated savings: $${totalSavings.toFixed(2)}`);

    return {
      fetched,
      skipped,
      errors,
      totalSavings,
    };
  }

  /**
   * Check if route is already cached
   */
  private async isCached(candidate: PreFetchCandidate): Promise<boolean> {
    // Import here to avoid circular dependency
    const { getCached } = await import('@/lib/cache/helpers');

    const cacheKey = this.getCacheKey(candidate);
    const cached = await getCached(cacheKey);

    return cached !== null;
  }

  /**
   * Fetch route and cache results
   */
  private async fetchRoute(candidate: PreFetchCandidate): Promise<void> {
    // This will be implemented to call the actual flight search API
    // For now, we'll just log it
    console.log(`🔄 Pre-fetching ${candidate.route} for ${candidate.departureDate}`);

    // In production, this would:
    // 1. Call flight search API
    // 2. Cache results with appropriate TTL
    // 3. Log to route profiler
  }

  /**
   * Get cache key for candidate
   */
  private getCacheKey(candidate: PreFetchCandidate): string {
    return `flight:search:${candidate.origin}:${candidate.destination}:${candidate.departureDate}:${candidate.returnDate}:1a0c0i:${candidate.cabinClass}`;
  }

  /**
   * Get all route profiles from Redis
   */
  private async getAllRouteProfiles(): Promise<RouteCacheProfile[]> {
    try {
      const { getRedisClient } = await import('@/lib/cache/redis');
      const redis = getRedisClient();
      if (!redis) return [];

      // Get all route profile keys
      const keys = await redis.keys('route:profile:*');

      if (keys.length === 0) {
        return [];
      }

      // Get all profiles
      const profiles = await Promise.all(
        keys.map(async (key) => {
          const data = await redis.get(key);
          return data ? JSON.parse(data as string) as RouteCacheProfile : null;
        })
      );

      // Filter out nulls
      return profiles.filter((p): p is RouteCacheProfile => p !== null);
    } catch (error) {
      console.error('Error getting all route profiles:', error);
      return [];
    }
  }

  /**
   * Schedule pre-fetching (to be called by cron job or background worker)
   */
  async schedulePreFetch(): Promise<void> {
    const now = new Date();
    const hour = now.getHours();

    // Run at 3 AM daily
    if (hour === 3) {
      console.log('⏰ Starting scheduled pre-fetch at 3 AM');
      await this.executePrefetch();
    }
  }
}

// Singleton instance
export const predictivePreFetcher = new PredictivePreFetcher();
