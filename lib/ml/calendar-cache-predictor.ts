/**
 * Calendar Price Cache Predictor
 * Specialized ML predictor for cheapest-dates calendar pricing
 * Combines seasonal analysis, route profiling, and volatility tracking
 */

import { seasonDetector } from './season-detector';
import { routeProfiler } from './route-profiler';

export interface CalendarCachePrediction {
  ttl: number; // Cache TTL in seconds
  confidence: number; // 0-1 confidence score
  reason: string;
  metadata: {
    season: 'high' | 'shoulder' | 'low';
    isHoliday: boolean;
    holidayName?: string;
    volatility: number;
    popularity: number;
    daysUntilDeparture: number;
  };
}

export class CalendarCachePredictor {
  /**
   * Predict optimal cache TTL for calendar prices
   */
  async predictCalendarCacheTTL(
    origin: string,
    destination: string,
    departureDate?: string
  ): Promise<CalendarCachePrediction> {
    try {
      const route = `${origin}-${destination}`;

      // Get route profile for volatility and popularity data
      const profile = await routeProfiler.getRouteProfile(route);

      // Use current date + 30 days if no specific departure date provided
      const targetDate = departureDate || this.getDefaultTargetDate();
      const daysUntilDeparture = this.calculateDaysUntilDeparture(targetDate);

      // Get seasonal analysis
      const seasonalCache = seasonDetector.calculateCalendarCacheTTL(
        targetDate,
        daysUntilDeparture
      );

      let ttl = seasonalCache.ttl;
      let reason = seasonalCache.reason;

      // Adjust based on route volatility (if we have profile data)
      if (profile) {
        const volatilityMultiplier = this.getVolatilityMultiplier(profile.volatility);
        ttl = Math.round(ttl * volatilityMultiplier);

        // Add volatility context to reason
        if (profile.volatility > 0.7) {
          reason += ', high price volatility';
        } else if (profile.volatility < 0.3) {
          reason += ', stable prices';
        }

        // Adjust based on route popularity
        if (profile.popularity > 100) {
          ttl = Math.round(ttl * 0.9); // Popular routes: fresher data
          reason += ', popular route';
        } else if (profile.popularity < 10) {
          ttl = Math.round(ttl * 1.2); // Low-traffic routes: longer cache
          reason += ', low traffic';
        }
      }

      // Ensure TTL is within bounds
      const finalTTL = Math.max(
        1800, // Min: 30 minutes
        Math.min(86400, ttl) // Max: 24 hours
      );

      // Calculate confidence
      const confidence = this.calculateConfidence(profile, daysUntilDeparture);

      // Get season analysis for metadata
      const seasonAnalysis = seasonDetector.analyzeDate(targetDate);

      return {
        ttl: finalTTL,
        confidence,
        reason,
        metadata: {
          season: seasonAnalysis.season,
          isHoliday: seasonAnalysis.isHoliday,
          holidayName: seasonAnalysis.holidayName,
          volatility: profile?.volatility ?? 0.5,
          popularity: profile?.popularity ?? 0,
          daysUntilDeparture,
        },
      };
    } catch (error) {
      console.error('Error predicting calendar cache TTL:', error);

      // Fallback to safe default (2 hours)
      return {
        ttl: 7200,
        confidence: 0.3,
        reason: 'Using default cache duration due to prediction error',
        metadata: {
          season: 'shoulder',
          isHoliday: false,
          volatility: 0.5,
          popularity: 0,
          daysUntilDeparture: 30,
        },
      };
    }
  }

  /**
   * Get default target date (30 days from now)
   */
  private getDefaultTargetDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
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
   * Get volatility multiplier for cache TTL
   * High volatility = shorter cache, stable prices = longer cache
   */
  private getVolatilityMultiplier(volatility: number): number {
    if (volatility > 0.8) {
      return 0.6; // Very volatile - 40% shorter cache
    }
    if (volatility > 0.6) {
      return 0.8; // Volatile - 20% shorter cache
    }
    if (volatility < 0.2) {
      return 1.4; // Very stable - 40% longer cache
    }
    if (volatility < 0.4) {
      return 1.2; // Stable - 20% longer cache
    }
    return 1.0; // Normal
  }

  /**
   * Calculate confidence in the prediction
   */
  private calculateConfidence(
    profile: any,
    daysUntilDeparture: number
  ): number {
    let confidence = 0.5; // Base confidence

    // More confidence if we have route data
    if (profile) {
      if (profile.searchesLast7Days > 50) {
        confidence += 0.2;
      } else if (profile.searchesLast7Days > 10) {
        confidence += 0.1;
      }

      if (profile.priceSamples.length > 50) {
        confidence += 0.15;
      } else if (profile.priceSamples.length > 20) {
        confidence += 0.1;
      }

      // Recent data = higher confidence
      const daysSinceUpdate =
        (Date.now() - new Date(profile.lastUpdated).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 1) {
        confidence += 0.1;
      } else if (daysSinceUpdate > 7) {
        confidence -= 0.1;
      }
    }

    // Far future dates are less predictable
    if (daysUntilDeparture > 180) {
      confidence -= 0.2;
    } else if (daysUntilDeparture < 7) {
      confidence += 0.1; // Near-term is more predictable
    }

    return Math.max(0.2, Math.min(1.0, confidence));
  }

  /**
   * Get human-readable cache duration
   */
  formatCacheDuration(ttlSeconds: number): string {
    if (ttlSeconds >= 3600) {
      const hours = Math.round(ttlSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    const minutes = Math.round(ttlSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}

// Export singleton instance
export const calendarCachePredictor = new CalendarCachePredictor();
