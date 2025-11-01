/**
 * Season & Peak Travel Detector
 * Analyzes departure dates to determine high/low season and adjust cache TTL
 */

export interface SeasonAnalysis {
  season: 'high' | 'shoulder' | 'low';
  isPeakWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  cacheMultiplier: number; // Multiplier for base cache TTL
  reason: string;
}

export class SeasonDetector {
  /**
   * Analyze a departure date and determine season
   */
  analyzeDate(departureDate: string): SeasonAnalysis {
    const date = new Date(departureDate);
    const month = date.getMonth(); // 0-11
    const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
    const dayOfMonth = date.getDate();

    // Check for specific holidays
    const holiday = this.checkHoliday(date);
    if (holiday) {
      return {
        season: 'high',
        isPeakWeekend: true,
        isHoliday: true,
        holidayName: holiday,
        cacheMultiplier: 0.5, // 30 min cache in high season
        reason: `${holiday} - peak travel period`,
      };
    }

    // Check if it's a peak weekend (Friday-Sunday)
    const isPeakWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;

    // Determine season by month
    let season: 'high' | 'shoulder' | 'low';
    let baseMultiplier: number;
    let seasonReason: string;

    // High Season Months
    if (
      month >= 5 && month <= 7 || // June-August (summer)
      month === 11 // December (holidays)
    ) {
      season = 'high';
      baseMultiplier = isPeakWeekend ? 0.5 : 0.75; // 30-45 min
      seasonReason = month === 11 ? 'holiday season' : 'summer peak season';
    }
    // Shoulder Season
    else if (
      month === 3 || month === 4 || // April-May (spring)
      month === 8 || month === 9 // September-October (fall)
    ) {
      season = 'shoulder';
      baseMultiplier = isPeakWeekend ? 2.0 : 4.0; // 2-4 hours
      seasonReason = 'shoulder season';
    }
    // Low Season
    else {
      season = 'low';
      baseMultiplier = isPeakWeekend ? 6.0 : 12.0; // 6-12 hours
      seasonReason = 'low season';
    }

    // Mid-week discount in low/shoulder season
    const isMidWeek = dayOfWeek >= 1 && dayOfWeek <= 4; // Mon-Thu
    if (isMidWeek && season !== 'high') {
      baseMultiplier *= 1.5; // 50% longer cache for mid-week
      seasonReason += ', mid-week';
    }

    return {
      season,
      isPeakWeekend,
      isHoliday: false,
      cacheMultiplier: baseMultiplier,
      reason: seasonReason,
    };
  }

  /**
   * Check if date is a major holiday or peak travel period
   */
  private checkHoliday(date: Date): string | null {
    const year = date.getFullYear();
    const month = date.getMonth();
    const dayOfMonth = date.getDate();

    // New Year's (Dec 28 - Jan 5)
    if (
      (month === 11 && dayOfMonth >= 28) ||
      (month === 0 && dayOfMonth <= 5)
    ) {
      return 'New Year';
    }

    // Christmas (Dec 20-26)
    if (month === 11 && dayOfMonth >= 20 && dayOfMonth <= 26) {
      return 'Christmas';
    }

    // Thanksgiving week (US - 3rd week of November)
    if (month === 10 && dayOfMonth >= 20 && dayOfMonth <= 27) {
      return 'Thanksgiving';
    }

    // Easter period (approximate - first 2 weeks of April)
    if (month === 3 && dayOfMonth <= 14) {
      return 'Easter';
    }

    // Spring Break (mid-March)
    if (month === 2 && dayOfMonth >= 10 && dayOfMonth <= 24) {
      return 'Spring Break';
    }

    // Independence Day (US - July 4 ± 3 days)
    if (month === 6 && dayOfMonth >= 1 && dayOfMonth <= 7) {
      return 'Independence Day';
    }

    // Memorial Day weekend (Last Monday of May - approximate)
    if (month === 4 && dayOfMonth >= 24) {
      return 'Memorial Day';
    }

    // Labor Day weekend (First Monday of September)
    if (month === 8 && dayOfMonth <= 7) {
      return 'Labor Day';
    }

    return null;
  }

  /**
   * Get human-readable season description
   */
  getSeasonDescription(season: 'high' | 'shoulder' | 'low'): string {
    switch (season) {
      case 'high':
        return 'High Season (Peak Travel)';
      case 'shoulder':
        return 'Shoulder Season (Moderate Travel)';
      case 'low':
        return 'Low Season (Off-Peak)';
    }
  }

  /**
   * Calculate optimal cache TTL for calendar prices
   * Returns TTL in seconds
   */
  calculateCalendarCacheTTL(departureDate: string, daysUntilDeparture: number): {
    ttl: number;
    reason: string;
  } {
    const analysis = this.analyzeDate(departureDate);

    // Base TTL: 60 minutes (1 hour)
    let baseTTL = 60;

    // Apply season multiplier
    let ttl = baseTTL * analysis.cacheMultiplier;

    // Adjust based on days until departure
    if (daysUntilDeparture < 3) {
      ttl *= 0.5; // Very soon - fresher data needed (15-30 min)
    } else if (daysUntilDeparture < 7) {
      ttl *= 0.7; // Within a week - moderately fresh
    } else if (daysUntilDeparture > 90) {
      ttl *= 2.0; // Far future - can cache longer
    } else if (daysUntilDeparture > 60) {
      ttl *= 1.5; // Future - longer cache ok
    }

    // Convert minutes to seconds and cap
    const ttlSeconds = Math.round(ttl * 60);
    const cappedTTL = Math.max(
      1800, // Min: 30 minutes
      Math.min(86400, ttlSeconds) // Max: 24 hours
    );

    const reason = `${analysis.reason}, ${daysUntilDeparture}d out: ${Math.round(cappedTTL / 60)}min cache`;

    return {
      ttl: cappedTTL,
      reason,
    };
  }
}

// Export singleton instance
export const seasonDetector = new SeasonDetector();
