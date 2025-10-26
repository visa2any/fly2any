/**
 * Smart Cache Predictor
 * ML-powered cache TTL optimization based on route characteristics
 */

import { routeProfiler } from './route-profiler';
import type { PredictionResult, RouteCacheProfile } from './types';

export class SmartCachePredictor {
  /**
   * Predict optimal cache TTL for a route
   */
  async predictOptimalTTL(
    origin: string,
    destination: string,
    cabinClass: string,
    departureDate: string
  ): Promise<PredictionResult> {
    const route = `${origin}-${destination}`;

    try {
      // Get route profile
      const profile = await routeProfiler.getRouteProfile(route);

      if (!profile) {
        // No profile data - return conservative default
        return {
          recommendedTTL: 15,
          confidence: 0.3,
          reason: 'No historical data - using default cache duration',
          metadata: {
            volatility: 0.5,
            popularity: 0,
            priceStability: 0.5,
          },
        };
      }

      // Calculate price stability (inverse of volatility)
      const priceStability = 1 - profile.volatility;

      // Analyze temporal factors
      const daysUntilDeparture = this.calculateDaysUntilDeparture(departureDate);
      const temporalMultiplier = this.getTemporalMultiplier(daysUntilDeparture);

      // Calculate base TTL from profile
      let ttl = profile.optimalTTL;

      // Adjust TTL based on temporal factors
      ttl = Math.round(ttl * temporalMultiplier);

      // Business/First class tend to be more stable
      if (cabinClass === 'business' || cabinClass === 'first') {
        ttl = Math.round(ttl * 1.2); // 20% longer cache
      }

      // Cap TTL between 5 and 120 minutes
      ttl = Math.max(5, Math.min(120, ttl));

      // Calculate confidence based on data quality
      const confidence = this.calculateConfidence(profile);

      // Generate human-readable reason
      const reason = this.generateReason(profile, ttl, temporalMultiplier);

      return {
        recommendedTTL: ttl,
        confidence,
        reason,
        metadata: {
          volatility: profile.volatility,
          popularity: profile.popularity,
          priceStability,
        },
      };
    } catch (error) {
      console.error('Error predicting cache TTL:', error);

      // Fallback to safe default
      return {
        recommendedTTL: 15,
        confidence: 0.3,
        reason: 'Error in prediction - using default',
        metadata: {
          volatility: 0.5,
          popularity: 0,
          priceStability: 0.5,
        },
      };
    }
  }

  /**
   * Calculate days until departure
   */
  private calculateDaysUntilDeparture(departureDate: string): number {
    const departure = new Date(departureDate);
    const now = new Date();
    const diffTime = departure.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Get temporal multiplier for TTL
   * Flights far in the future can be cached longer
   * Flights departing soon need fresher prices
   */
  private getTemporalMultiplier(daysUntilDeparture: number): number {
    if (daysUntilDeparture < 3) {
      return 0.5; // Very soon - shorter cache
    }
    if (daysUntilDeparture < 7) {
      return 0.7; // Within a week - moderately shorter cache
    }
    if (daysUntilDeparture < 14) {
      return 1.0; // Normal cache
    }
    if (daysUntilDeparture < 30) {
      return 1.3; // Future travel - longer cache
    }
    if (daysUntilDeparture < 60) {
      return 1.5; // Far future - even longer cache
    }
    return 2.0; // Very far future - maximum cache
  }

  /**
   * Calculate confidence score for prediction
   */
  private calculateConfidence(profile: RouteCacheProfile): number {
    let confidence = 0.5; // Base confidence

    // More searches = higher confidence
    if (profile.searchesLast7Days > 50) {
      confidence += 0.2;
    } else if (profile.searchesLast7Days > 10) {
      confidence += 0.1;
    }

    // More price samples = higher confidence
    if (profile.priceSamples.length > 50) {
      confidence += 0.2;
    } else if (profile.priceSamples.length > 20) {
      confidence += 0.1;
    }

    // Recent update = higher confidence
    const daysSinceUpdate = (Date.now() - new Date(profile.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 1) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Generate human-readable reason for TTL recommendation
   */
  private generateReason(
    profile: RouteCacheProfile,
    ttl: number,
    temporalMultiplier: number
  ): string {
    const parts: string[] = [];

    // Volatility reason
    if (profile.volatility < 0.3) {
      parts.push('prices are stable');
    } else if (profile.volatility > 0.7) {
      parts.push('prices are highly volatile');
    } else {
      parts.push('moderate price fluctuations');
    }

    // Popularity reason
    if (profile.popularity > 100) {
      parts.push('popular route');
    } else if (profile.popularity > 50) {
      parts.push('moderately popular route');
    } else if (profile.popularity < 10) {
      parts.push('low search volume');
    }

    // Temporal reason
    if (temporalMultiplier > 1.3) {
      parts.push('far future departure');
    } else if (temporalMultiplier < 0.7) {
      parts.push('departure soon');
    }

    // TTL summary
    let summary = '';
    if (ttl >= 60) {
      summary = `Extended ${ttl}min cache`;
    } else if (ttl >= 30) {
      summary = `${ttl}min cache`;
    } else if (ttl >= 15) {
      summary = `Standard ${ttl}min cache`;
    } else {
      summary = `Short ${ttl}min cache`;
    }

    return `${summary}: ${parts.join(', ')}`;
  }

  /**
   * Get cache key with smart TTL
   */
  getCacheKey(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    cabinClass: string;
  }): string {
    const parts = [
      `flight:search`,
      params.origin,
      params.destination,
      params.departureDate,
      params.returnDate || 'oneway',
      `${params.adults}a${params.children}c${params.infants}i`,
      params.cabinClass,
    ];

    return parts.join(':');
  }

  /**
   * Should we use smart caching for this route?
   */
  async shouldUseSmartCaching(origin: string, destination: string): Promise<boolean> {
    try {
      const route = `${origin}-${destination}`;
      const profile = await routeProfiler.getRouteProfile(route);

      if (!profile) {
        return false; // No data yet
      }

      // Use smart caching if we have enough data
      return profile.searchesLast30Days >= 5 || profile.priceSamples.length >= 10;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const smartCachePredictor = new SmartCachePredictor();
