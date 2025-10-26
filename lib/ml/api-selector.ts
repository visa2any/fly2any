/**
 * Smart API Selector
 * Intelligently selects which APIs to query based on historical performance
 * Reduces API costs by avoiding unnecessary dual-API calls
 */

import { routeProfiler } from './route-profiler';
import type { APIPerformanceProfile } from './types';

export type APISelectionStrategy = 'amadeus' | 'duffel' | 'both';

export interface APISelectionResult {
  /** Which API(s) to query */
  strategy: APISelectionStrategy;

  /** Confidence in this decision (0-1) */
  confidence: number;

  /** Reason for selection */
  reason: string;

  /** Estimated cost savings vs always querying both */
  estimatedSavings: number;
}

export class SmartAPISelector {
  private readonly AB_TEST_PERCENTAGE = 0.10; // 10% of requests use both APIs for validation

  /**
   * Select which API(s) to query for a given route
   */
  async selectAPIs(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    cabinClass: string;
  }): Promise<APISelectionResult> {
    const route = `${params.origin}-${params.destination}`;

    try {
      // A/B testing: Always use both APIs for 10% of requests to maintain data quality
      if (Math.random() < this.AB_TEST_PERCENTAGE) {
        return {
          strategy: 'both',
          confidence: 1.0,
          reason: 'A/B testing validation - querying both APIs',
          estimatedSavings: 0,
        };
      }

      // Get API performance profile for this route
      const perfProfile = await routeProfiler.getAPIPerformance(route);

      if (!perfProfile) {
        // No historical data - query both APIs to start building profile
        return {
          strategy: 'both',
          confidence: 0.3,
          reason: 'No historical data - querying both APIs to build profile',
          estimatedSavings: 0,
        };
      }

      // Analyze performance profile to make decision
      return this.analyzePerformance(perfProfile, params);
    } catch (error) {
      console.error('Error selecting APIs:', error);

      // Fallback to both APIs on error
      return {
        strategy: 'both',
        confidence: 0.3,
        reason: 'Error in selection - defaulting to both APIs',
        estimatedSavings: 0,
      };
    }
  }

  /**
   * Analyze API performance and decide which to query
   */
  private analyzePerformance(
    profile: APIPerformanceProfile,
    params: { origin: string; destination: string; cabinClass: string }
  ): APISelectionResult {
    const {
      amadeusWinRate,
      duffelWinRate,
      avgPriceDifference,
      duffelCoverageRate,
    } = profile;

    // Strategy 1: Amadeus dominates (wins 80%+ of time, small price diff)
    if (amadeusWinRate > 0.80 && Math.abs(avgPriceDifference) < 10) {
      return {
        strategy: 'amadeus',
        confidence: 0.85,
        reason: `Amadeus wins ${(amadeusWinRate * 100).toFixed(0)}% of time with avg $${Math.abs(avgPriceDifference).toFixed(0)} difference`,
        estimatedSavings: 0.04, // Save one API call
      };
    }

    // Strategy 2: Duffel has poor coverage on this route
    if (duffelCoverageRate < 0.30) {
      return {
        strategy: 'amadeus',
        confidence: 0.80,
        reason: `Duffel has inventory only ${(duffelCoverageRate * 100).toFixed(0)}% of time`,
        estimatedSavings: 0.00, // Duffel is free, but saves time
      };
    }

    // Strategy 3: Duffel consistently cheaper
    if (duffelWinRate > 0.75 && avgPriceDifference > 15) {
      return {
        strategy: 'duffel',
        confidence: 0.75,
        reason: `Duffel wins ${(duffelWinRate * 100).toFixed(0)}% of time, avg $${Math.abs(avgPriceDifference).toFixed(0)} cheaper`,
        estimatedSavings: 0.04, // Save Amadeus API call
      };
    }

    // Strategy 4: International routes - always check both
    if (this.isInternational(params.origin, params.destination)) {
      return {
        strategy: 'both',
        confidence: 0.90,
        reason: 'International route - comprehensive price comparison needed',
        estimatedSavings: 0,
      };
    }

    // Strategy 5: Premium cabins - always check both
    if (params.cabinClass === 'business' || params.cabinClass === 'first') {
      return {
        strategy: 'both',
        confidence: 0.85,
        reason: 'Premium cabin - comprehensive availability check needed',
        estimatedSavings: 0,
      };
    }

    // Strategy 6: Competitive routes - check both
    if (Math.abs(amadeusWinRate - duffelWinRate) < 0.20) {
      return {
        strategy: 'both',
        confidence: 0.70,
        reason: 'Competitive pricing - both APIs needed for best price',
        estimatedSavings: 0,
      };
    }

    // Default: Query both APIs
    return {
      strategy: 'both',
      confidence: 0.60,
      reason: 'Default strategy - querying both for comprehensive results',
      estimatedSavings: 0,
    };
  }

  /**
   * Check if route is international
   */
  private isInternational(origin: string, destination: string): boolean {
    // US domestic airports (simplified - in production, use comprehensive airport database)
    const usAirports = [
      'JFK', 'LAX', 'ORD', 'DFW', 'DEN', 'SFO', 'SEA', 'LAS', 'MCO', 'EWR',
      'CLT', 'PHX', 'IAH', 'MIA', 'BOS', 'MSP', 'FLL', 'DTW', 'PHL', 'LGA',
      'BWI', 'SLC', 'SAN', 'DCA', 'MDW', 'TPA', 'PDX', 'HNL', 'STL', 'AUS'
    ];

    const originIsUS = usAirports.includes(origin);
    const destIsUS = usAirports.includes(destination);

    // International if one is US and one is not
    return originIsUS !== destIsUS;
  }

  /**
   * Calculate potential monthly savings from smart API selection
   */
  async calculateMonthlySavings(totalSearches: number): Promise<{
    baselineCost: number;
    optimizedCost: number;
    savings: number;
    savingsPercentage: number;
  }> {
    const AMADEUS_COST_PER_CALL = 0.04;
    const AMADEUS_FREE_TIER = 10000;

    // Baseline: Always query both APIs
    const amadeusCallsBaseline = totalSearches;
    const baselineCost = Math.max(0, (amadeusCallsBaseline - AMADEUS_FREE_TIER) * AMADEUS_COST_PER_CALL);

    // Optimized: Estimated 40% of searches use single API
    const singleAPIPercentage = 0.40;
    const dualAPIPercentage = 0.60;

    const amadeusCallsOptimized = (totalSearches * singleAPIPercentage * 0.8) + // 80% use Amadeus only
                                    (totalSearches * dualAPIPercentage); // Rest use both

    const optimizedCost = Math.max(0, (amadeusCallsOptimized - AMADEUS_FREE_TIER) * AMADEUS_COST_PER_CALL);

    const savings = baselineCost - optimizedCost;
    const savingsPercentage = baselineCost > 0 ? (savings / baselineCost) * 100 : 0;

    return {
      baselineCost,
      optimizedCost,
      savings,
      savingsPercentage,
    };
  }

  /**
   * Get stats on API selection decisions
   */
  getSelectionStats(): {
    totalDecisions: number;
    amadeusOnly: number;
    duffelOnly: number;
    both: number;
  } {
    // In production, track these in Redis
    return {
      totalDecisions: 0,
      amadeusOnly: 0,
      duffelOnly: 0,
      both: 0,
    };
  }
}

// Singleton instance
export const smartAPISelector = new SmartAPISelector();
