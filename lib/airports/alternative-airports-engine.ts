/**
 * ALTERNATIVE AIRPORTS ENGINE
 *
 * Intelligent engine for finding and recommending alternative airports
 * with real price comparisons, total travel cost analysis, and smart suggestions.
 *
 * Features:
 * - Find nearby airports within radius
 * - Estimate price differences from historical data
 * - Calculate total journey cost (flight + ground transport)
 * - Provide actionable recommendations
 * - Support multi-airport search expansion
 *
 * @module alternative-airports-engine
 */

import { findAlternativeAirports, calculateDistance, findAirportByCode } from '../data/airport-helpers';
import type { Airport } from '../data/airports-complete';
import { getPrismaClient } from '../prisma';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AlternativeAirportOption {
  airport: Airport;
  distance: {
    km: number;
    miles: number;
    travelTimeMinutes: number;
  };
  pricing: {
    estimatedSavings: number; // USD
    savingsPercent: number;
    confidence: 'low' | 'medium' | 'high';
    basedOnHistoricalData: boolean;
  };
  groundTransport: {
    estimatedCostUSD: number;
    methods: string[]; // ['train', 'bus', 'taxi']
    notes: string;
  };
  totalCostComparison: {
    mainAirportTotal: number;
    alternativeTotal: number;
    netSavings: number;
    worthIt: boolean;
  };
  recommendation: {
    score: number; // 0-100
    verdict: 'highly-recommended' | 'recommended' | 'consider' | 'not-recommended';
    reason: string;
  };
}

export interface AlternativeAirportsAnalysis {
  mainAirport: Airport;
  alternatives: AlternativeAirportOption[];
  bestAlternative: AlternativeAirportOption | null;
  summary: {
    totalAlternativesFound: number;
    maxPotentialSavings: number;
    recommendedCount: number;
  };
}

export interface PriceComparisonOptions {
  originCode: string;
  destinationCode: string;
  departureDate?: string;
  radiusKm?: number;
  includeGroundTransport?: boolean;
}

// ============================================================================
// PRICE ESTIMATION
// ============================================================================

/**
 * Estimate price difference based on historical data
 * Falls back to heuristics if no data available
 */
async function estimatePriceDifference(
  mainAirport: Airport,
  alternativeAirport: Airport,
  destinationCode: string
): Promise<{ savingsUSD: number; confidence: 'low' | 'medium' | 'high'; historical: boolean }> {
  try {
    const prisma = getPrismaClient();

    // Query price history for both routes
    const mainPrices = await prisma!.priceHistory.findMany({
      where: {
        origin: mainAirport.code,
        destination: destinationCode,
        timestamp: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      select: { price: true },
      take: 50,
    });

    const altPrices = await prisma!.priceHistory.findMany({
      where: {
        origin: alternativeAirport.code,
        destination: destinationCode,
        timestamp: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      select: { price: true },
      take: 50,
    });

    // If we have data for both, calculate average difference
    if (mainPrices.length >= 5 && altPrices.length >= 5) {
      const mainAvg = mainPrices.reduce((sum, p) => sum + p.price, 0) / mainPrices.length;
      const altAvg = altPrices.reduce((sum, p) => sum + p.price, 0) / altPrices.length;
      const difference = mainAvg - altAvg;

      const confidence = mainPrices.length >= 20 && altPrices.length >= 20 ? 'high' : 'medium';

      return {
        savingsUSD: Math.round(difference),
        confidence,
        historical: true,
      };
    }
  } catch (error) {
    console.warn('Could not fetch price history:', error);
  }

  // Fallback to heuristic estimation
  return estimatePriceHeuristic(mainAirport, alternativeAirport);
}

/**
 * Heuristic price estimation when no historical data available
 */
function estimatePriceHeuristic(
  mainAirport: Airport,
  alternativeAirport: Airport
): { savingsUSD: number; confidence: 'low' | 'medium' | 'high'; historical: false } {
  let savings = 0;

  // Major hub vs regional airport
  if (mainAirport.popular && !alternativeAirport.popular) {
    savings += 80; // Regional airports often $50-100 cheaper
  } else if (!mainAirport.popular && alternativeAirport.popular) {
    savings -= 50; // Major hubs may be more expensive
  }

  // Secondary airports in same metro
  if (mainAirport.metro && alternativeAirport.metro === mainAirport.metro) {
    savings += 40; // Secondary airports typically cheaper
  }

  // Low-cost carrier airports
  const lowCostAirports = ['BVA', 'HHN', 'STN', 'CIA', 'WMI', 'EIN', 'CRL'];
  if (lowCostAirports.includes(alternativeAirport.code)) {
    savings += 60; // Budget airline hubs
  }

  return {
    savingsUSD: Math.max(20, savings), // Minimum $20 estimated savings
    confidence: 'low',
    historical: false,
  };
}

// ============================================================================
// GROUND TRANSPORT ESTIMATION
// ============================================================================

/**
 * Estimate ground transport cost and options
 */
function estimateGroundTransport(distanceKm: number, airport: Airport): {
  estimatedCostUSD: number;
  methods: string[];
  notes: string;
} {
  const methods: string[] = [];
  let estimatedCostUSD = 0;
  let notes = '';

  if (distanceKm < 15) {
    // Very close - metro/taxi
    methods.push('Metro', 'Taxi', 'Rideshare');
    estimatedCostUSD = 15;
    notes = 'Short distance - easily accessible by public transport or taxi';
  } else if (distanceKm < 40) {
    // Close - train/bus/taxi
    methods.push('Train', 'Bus', 'Taxi');
    estimatedCostUSD = 25;
    notes = 'Moderate distance - direct train or bus service typically available';
  } else if (distanceKm < 80) {
    // Medium - train/bus required
    methods.push('Train', 'Bus', 'Shuttle');
    estimatedCostUSD = 35;
    notes = 'Regional transport needed - plan 60-90 minutes for ground travel';
  } else if (distanceKm < 150) {
    // Far - dedicated transport
    methods.push('Shuttle', 'Train', 'Rental Car');
    estimatedCostUSD = 50;
    notes = 'Significant distance - factor in 90-120 minutes and transport costs';
  } else {
    // Very far - may not be practical
    methods.push('Rental Car', 'Shuttle');
    estimatedCostUSD = 75;
    notes = 'Long distance - consider if savings justify extra travel time';
  }

  return { estimatedCostUSD, methods, notes };
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

/**
 * Calculate recommendation score (0-100)
 */
function calculateRecommendationScore(
  savings: number,
  groundTransportCost: number,
  distanceKm: number,
  confidence: 'low' | 'medium' | 'high'
): {
  score: number;
  verdict: 'highly-recommended' | 'recommended' | 'consider' | 'not-recommended';
  reason: string;
} {
  let score = 50; // Base score
  const netSavings = savings - groundTransportCost;

  // Factor 1: Net savings (most important)
  if (netSavings > 100) score += 40;
  else if (netSavings > 50) score += 30;
  else if (netSavings > 25) score += 15;
  else if (netSavings > 0) score += 5;
  else score -= 30; // Negative savings

  // Factor 2: Distance (convenience)
  if (distanceKm < 30) score += 15;
  else if (distanceKm < 60) score += 5;
  else if (distanceKm > 100) score -= 20;

  // Factor 3: Confidence in savings
  if (confidence === 'high') score += 10;
  else if (confidence === 'medium') score += 5;
  else score -= 5;

  // Determine verdict
  let verdict: 'highly-recommended' | 'recommended' | 'consider' | 'not-recommended';
  let reason: string;

  if (score >= 85) {
    verdict = 'highly-recommended';
    reason = `Save $${netSavings}+ with minimal inconvenience`;
  } else if (score >= 70) {
    verdict = 'recommended';
    reason = `Good savings of $${netSavings} worth the extra travel`;
  } else if (score >= 50) {
    verdict = 'consider';
    reason = `Potential savings of $${netSavings} but weigh travel time`;
  } else {
    verdict = 'not-recommended';
    reason = netSavings < 0
      ? 'Ground transport costs exceed flight savings'
      : 'Savings too minimal to justify inconvenience';
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    verdict,
    reason,
  };
}

// ============================================================================
// MAIN ENGINE
// ============================================================================

/**
 * Analyze alternative airports with comprehensive comparison
 */
export async function analyzeAlternativeAirports(
  options: PriceComparisonOptions
): Promise<AlternativeAirportsAnalysis | null> {
  const {
    originCode,
    destinationCode,
    radiusKm = 150,
    includeGroundTransport = true,
  } = options;

  // Find main airport
  const mainAirport = findAirportByCode(originCode);
  if (!mainAirport) return null;

  // Find alternative airports
  const result = findAlternativeAirports(originCode, radiusKm);
  if (!result || result.alternatives.length === 0) return null;

  // Analyze each alternative
  const analysisPromises = result.alternatives.map(async (alt) => {
    // Estimate price difference
    const priceEstimate = await estimatePriceDifference(
      mainAirport,
      alt.airport,
      destinationCode
    );

    // Calculate ground transport
    const groundTransport = includeGroundTransport
      ? estimateGroundTransport(alt.distanceKm, alt.airport)
      : { estimatedCostUSD: 0, methods: [], notes: '' };

    // Calculate total cost comparison
    const baseFlightPrice = 300; // Placeholder - would come from actual search
    const mainTotal = baseFlightPrice;
    const altTotal = baseFlightPrice - priceEstimate.savingsUSD + groundTransport.estimatedCostUSD;
    const netSavings = mainTotal - altTotal;

    // Calculate recommendation
    const recommendation = calculateRecommendationScore(
      priceEstimate.savingsUSD,
      groundTransport.estimatedCostUSD,
      alt.distanceKm,
      priceEstimate.confidence
    );

    const option: AlternativeAirportOption = {
      airport: alt.airport,
      distance: {
        km: alt.distanceKm,
        miles: alt.distanceMiles,
        travelTimeMinutes: alt.travelTimeMinutes || 0,
      },
      pricing: {
        estimatedSavings: priceEstimate.savingsUSD,
        savingsPercent: Math.round((priceEstimate.savingsUSD / baseFlightPrice) * 100),
        confidence: priceEstimate.confidence,
        basedOnHistoricalData: priceEstimate.historical,
      },
      groundTransport,
      totalCostComparison: {
        mainAirportTotal: mainTotal,
        alternativeTotal: altTotal,
        netSavings,
        worthIt: netSavings > 20, // Worth it if saving $20+
      },
      recommendation,
    };

    return option;
  });

  const alternatives = await Promise.all(analysisPromises);

  // Sort by recommendation score
  alternatives.sort((a, b) => b.recommendation.score - a.recommendation.score);

  // Find best alternative
  const bestAlternative = alternatives.find(
    (a) =>
      a.recommendation.verdict === 'highly-recommended' ||
      a.recommendation.verdict === 'recommended'
  ) || null;

  // Calculate summary
  const recommendedCount = alternatives.filter(
    (a) =>
      a.recommendation.verdict === 'highly-recommended' ||
      a.recommendation.verdict === 'recommended'
  ).length;

  const maxPotentialSavings = Math.max(
    ...alternatives.map((a) => a.totalCostComparison.netSavings),
    0
  );

  return {
    mainAirport,
    alternatives: alternatives.slice(0, 5), // Top 5
    bestAlternative,
    summary: {
      totalAlternativesFound: alternatives.length,
      maxPotentialSavings,
      recommendedCount,
    },
  };
}

/**
 * Quick check if alternatives are available (for UI hints)
 */
export function hasAlternativeAirports(airportCode: string, radiusKm: number = 100): boolean {
  const result = findAlternativeAirports(airportCode, radiusKm);
  return result !== null && result.alternatives.length > 0;
}

/**
 * Get simple alternative suggestions (without price analysis)
 */
export function getQuickAlternatives(airportCode: string, maxResults: number = 3): Airport[] {
  const result = findAlternativeAirports(airportCode, 100);
  if (!result) return [];

  return result.alternatives
    .slice(0, maxResults)
    .map((a) => a.airport);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const alternativeAirportsEngine = {
  analyzeAlternativeAirports,
  hasAlternativeAirports,
  getQuickAlternatives,
};

export default alternativeAirportsEngine;
