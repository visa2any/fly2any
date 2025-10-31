/**
 * ML/AI Value Score Calculator
 * Server-side utility for calculating value scores across all service types
 * Used in API routes - NO 'use client' directive
 */

export interface ValueScoreParams {
  price: number;
  marketAvgPrice: number;
  rating?: number; // 0-5 scale
  reviewCount?: number;
  demandLevel?: number; // 0-100 scale
  availabilityLevel?: number; // 0-100 scale
}

/**
 * Calculate value score based on multiple factors
 * Returns a score from 0-100 where higher = better value
 *
 * Weighting:
 * - Price (40%): Lower price relative to market = higher score
 * - Quality (30%): Based on ratings (0-5 scale)
 * - Demand (15%): Higher demand = better deal
 * - Availability (15%): Lower availability = more valuable
 */
export function calculateValueScore(params: ValueScoreParams): number {
  const {
    price,
    marketAvgPrice,
    rating = 4,
    reviewCount = 100,
    demandLevel = 50,
    availabilityLevel = 70
  } = params;

  // Price factor (40% weight) - Lower price relative to market = higher score
  const priceRatio = price / marketAvgPrice;
  const priceFactor = Math.max(0, Math.min(100, (2 - priceRatio) * 50));

  // Quality factor (30% weight) - Based on ratings
  const qualityFactor = (rating / 5) * 100;

  // Demand factor (15% weight) - Higher demand = better deal
  const demandFactor = demandLevel;

  // Availability factor (15% weight) - Lower availability = more valuable
  const availabilityFactor = 100 - availabilityLevel;

  // Weighted average
  const score = (
    priceFactor * 0.40 +
    qualityFactor * 0.30 +
    demandFactor * 0.15 +
    availabilityFactor * 0.15
  );

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Get value level label and emoji based on score
 */
export function getValueLevel(score: number): {
  label: string;
  emoji: string;
} {
  if (score >= 85) return { label: 'Excellent Value', emoji: '💎' };
  if (score >= 70) return { label: 'Great Value', emoji: '🌟' };
  if (score >= 50) return { label: 'Good Value', emoji: '👍' };
  return { label: 'Fair Value', emoji: '✓' };
}
