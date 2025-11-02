/**
 * Seasonal Cache TTL Optimizer
 *
 * Smart cache expiration based on:
 * - Route popularity
 * - Seasonality (holidays, summer, etc.)
 * - Day of week (business vs leisure)
 * - Time to departure
 * - Price volatility
 *
 * Goal: Keep popular/stable prices longer, expire volatile prices faster
 */

interface SeasonalTTLConfig {
  baseMultiplier: number; // 1.0 = normal, 2.0 = double TTL
  reason: string;
}

/**
 * Get seasonal multiplier for a given date
 */
function getSeasonalMultiplier(date: Date): SeasonalTTLConfig {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // 🎄 Holiday Season (Nov 15 - Jan 10) - Prices volatile
  if (
    (month === 10 && day >= 15) || // Nov 15-30
    month === 11 || // December
    (month === 0 && day <= 10) // Jan 1-10
  ) {
    return {
      baseMultiplier: 0.5, // HALF TTL - prices change rapidly
      reason: 'Holiday season - high volatility'
    };
  }

  // ☀️ Summer Peak (Jun - Aug) - Prices relatively stable
  if (month >= 5 && month <= 7) {
    return {
      baseMultiplier: 1.5, // +50% TTL - prices more stable
      reason: 'Summer season - moderate stability'
    };
  }

  // 🌸 Spring Break (Mar 15 - Apr 15) - Moderate volatility
  if ((month === 2 && day >= 15) || (month === 3 && day <= 15)) {
    return {
      baseMultiplier: 0.75, // -25% TTL
      reason: 'Spring break - moderate volatility'
    };
  }

  // 📅 Regular season
  return {
    baseMultiplier: 1.0,
    reason: 'Regular season - normal TTL'
  };
}

/**
 * Get day-of-week multiplier
 */
function getDayOfWeekMultiplier(date: Date): SeasonalTTLConfig {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Weekend flights - leisure travel, more volatile
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      baseMultiplier: 0.8, // -20% TTL
      reason: 'Weekend flight - leisure volatility'
    };
  }

  // Monday/Thursday - business travel, more stable
  if (dayOfWeek === 1 || dayOfWeek === 4) {
    return {
      baseMultiplier: 1.2, // +20% TTL
      reason: 'Business travel day - more stable'
    };
  }

  // Other weekdays
  return {
    baseMultiplier: 1.0,
    reason: 'Weekday flight - normal TTL'
  };
}

/**
 * Get time-to-departure multiplier
 */
function getTimeToDepartureMultiplier(departureDate: string): SeasonalTTLConfig {
  const now = new Date();
  const departure = new Date(departureDate);
  const daysUntil = Math.ceil((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Last minute (< 7 days) - prices extremely volatile
  if (daysUntil < 7) {
    return {
      baseMultiplier: 0.25, // 75% reduction - expire fast!
      reason: 'Last minute booking - extreme volatility'
    };
  }

  // Near term (7-30 days) - moderate volatility
  if (daysUntil < 30) {
    return {
      baseMultiplier: 0.5,
      reason: 'Near term - moderate volatility'
    };
  }

  // Sweet spot (30-90 days) - most stable
  if (daysUntil >= 30 && daysUntil <= 90) {
    return {
      baseMultiplier: 1.5, // +50% TTL - stable window
      reason: 'Sweet spot booking window - most stable'
    };
  }

  // Far future (90-180 days) - moderate stability
  if (daysUntil > 90 && daysUntil <= 180) {
    return {
      baseMultiplier: 1.2,
      reason: 'Advance booking - moderate stability'
    };
  }

  // Very far future (> 180 days) - limited inventory, less reliable
  return {
    baseMultiplier: 0.75,
    reason: 'Far future - limited airline inventory'
  };
}

/**
 * Get route popularity multiplier
 */
function getPopularityMultiplier(searches30d: number): SeasonalTTLConfig {
  // Top routes (> 500 searches/month) - keep cache longer
  if (searches30d > 500) {
    return {
      baseMultiplier: 2.0, // DOUBLE TTL
      reason: 'Very popular route - high demand'
    };
  }

  // Popular routes (100-500 searches)
  if (searches30d > 100) {
    return {
      baseMultiplier: 1.5,
      reason: 'Popular route - frequent searches'
    };
  }

  // Moderate routes (20-100 searches)
  if (searches30d > 20) {
    return {
      baseMultiplier: 1.0,
      reason: 'Moderate traffic - normal TTL'
    };
  }

  // Low traffic (< 20 searches) - don't waste cache space
  return {
    baseMultiplier: 0.5,
    reason: 'Low traffic route - conserve cache'
  };
}

/**
 * Calculate optimal TTL for calendar price cache
 *
 * Base TTL: 1 hour (3600 seconds) - Extended for better calendar UX
 * Adjusted by multiple factors to optimize cache hit rate vs freshness
 */
export function calculateOptimalTTL(
  departureDate: string,
  routePopularity: number = 0 // searches in last 30 days
): {
  ttlSeconds: number;
  ttlMinutes: number;
  factors: string[];
  finalMultiplier: number;
} {
  const BASE_TTL_SECONDS = 3600; // 1 hour (increased from 15min for calendar UX)
  const departure = new Date(departureDate);

  // Get all multipliers
  const seasonal = getSeasonalMultiplier(departure);
  const dayOfWeek = getDayOfWeekMultiplier(departure);
  const timeToDeparture = getTimeToDepartureMultiplier(departureDate);
  const popularity = getPopularityMultiplier(routePopularity);

  // Combine multipliers (multiplicative)
  const finalMultiplier =
    seasonal.baseMultiplier *
    dayOfWeek.baseMultiplier *
    timeToDeparture.baseMultiplier *
    popularity.baseMultiplier;

  // Calculate final TTL
  const ttlSeconds = Math.round(BASE_TTL_SECONDS * finalMultiplier);

  // Min TTL: 5 minutes (don't refresh too often - wastes resources)
  // Max TTL: 2 hours (don't keep stale prices too long)
  const clampedTTL = Math.max(300, Math.min(ttlSeconds, 7200));

  return {
    ttlSeconds: clampedTTL,
    ttlMinutes: Math.round(clampedTTL / 60),
    factors: [
      seasonal.reason,
      dayOfWeek.reason,
      timeToDeparture.reason,
      popularity.reason
    ],
    finalMultiplier: parseFloat(finalMultiplier.toFixed(2))
  };
}

/**
 * Get human-readable TTL explanation
 */
export function explainTTL(
  departureDate: string,
  routePopularity: number = 0
): string {
  const result = calculateOptimalTTL(departureDate, routePopularity);

  return `Cache TTL: ${result.ttlMinutes} minutes (${result.finalMultiplier}x multiplier)\n` +
    `Factors:\n` +
    result.factors.map(f => `  • ${f}`).join('\n');
}

/**
 * Batch calculate TTLs for multiple dates
 * Useful for caching entire calendar month
 */
export function calculateBatchTTL(
  departureDates: string[],
  routePopularity: number = 0
): Map<string, number> {
  const ttlMap = new Map<string, number>();

  for (const date of departureDates) {
    const { ttlSeconds } = calculateOptimalTTL(date, routePopularity);
    ttlMap.set(date, ttlSeconds);
  }

  return ttlMap;
}

/**
 * Example usage:
 *
 * // Popular route (JFK-MIA: 500 searches/month), summer booking
 * const summer = calculateOptimalTTL('2025-07-15', 500);
 * // Result: ~45 minutes (1.5x season * 1.0x weekday * 1.5x sweet spot * 2.0x popular)
 *
 * // Same route, holiday season
 * const holiday = calculateOptimalTTL('2025-12-25', 500);
 * // Result: ~15 minutes (0.5x volatile * 1.0x weekday * 1.5x sweet spot * 2.0x popular)
 *
 * // Low traffic route, last minute
 * const lastMinute = calculateOptimalTTL('2025-11-05', 10);
 * // Result: ~5 minutes (MIN - 1.0x * 1.0x * 0.25x last minute * 0.5x unpopular)
 */
