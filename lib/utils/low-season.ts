/**
 * Low Season Date Utilities
 *
 * Determines the best low season travel dates for each destination
 * to find the lowest possible flight prices.
 *
 * Low season typically means:
 * - January 7 - February 28 (post-holiday lull)
 * - September 1 - October 31 (after summer, before holidays)
 * - April 15 - May 15 (shoulder season for most destinations)
 *
 * Exceptions:
 * - Caribbean/Beach: September-November (hurricane season = cheapest)
 * - Asia (monsoon regions): June-September
 * - Southern Hemisphere: June-August (their winter)
 */

// Destination categories for low season determination
const CARIBBEAN_BEACH_CODES = new Set([
  'CUN', 'PUJ', 'MBJ', 'NAS', 'AUA', 'BGI', 'SXM', 'GCM', 'BZE',
  'CZM', 'SJD', 'HNL', 'OGG', 'MLE', 'PVR',
]);

const SOUTHERN_HEMISPHERE_CODES = new Set([
  'SYD', 'MEL', 'GRU', 'EZE', 'SCL', 'LIM', 'BOG', 'PTY',
]);

const ASIA_MONSOON_CODES = new Set([
  'BKK', 'HKG', 'SIN', 'KUL', 'MNL', 'DEL', 'DPS',
]);

interface LowSeasonPeriod {
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number; // 1-12
  endDay: number;
  label: string;
}

/**
 * Get low season periods for a destination
 * Returns multiple periods, sorted by how far in the future they are
 */
function getLowSeasonPeriods(destinationCode: string): LowSeasonPeriod[] {
  if (CARIBBEAN_BEACH_CODES.has(destinationCode)) {
    // Caribbean/Beach: Hurricane season = cheapest (Sept-Nov)
    return [
      { startMonth: 9, startDay: 1, endMonth: 11, endDay: 15, label: 'Hurricane Season' },
      { startMonth: 4, startDay: 15, endMonth: 5, endDay: 31, label: 'Late Spring' },
      { startMonth: 1, startDay: 7, endMonth: 2, endDay: 28, label: 'Post-Holiday' },
    ];
  }

  if (SOUTHERN_HEMISPHERE_CODES.has(destinationCode)) {
    // Southern Hemisphere: Their winter (June-August) is low season
    return [
      { startMonth: 6, startDay: 1, endMonth: 8, endDay: 31, label: 'Winter Season' },
      { startMonth: 3, startDay: 1, endMonth: 4, endDay: 15, label: 'Early Fall' },
      { startMonth: 11, startDay: 1, endMonth: 11, endDay: 30, label: 'Late Spring' },
    ];
  }

  if (ASIA_MONSOON_CODES.has(destinationCode)) {
    // Asia monsoon regions: Monsoon season is cheapest
    return [
      { startMonth: 6, startDay: 1, endMonth: 9, endDay: 30, label: 'Monsoon Season' },
      { startMonth: 1, startDay: 7, endMonth: 2, endDay: 28, label: 'Post-Holiday' },
      { startMonth: 11, startDay: 15, endMonth: 12, endDay: 10, label: 'Pre-Holiday' },
    ];
  }

  // Default: Most destinations (Europe, North America, Japan, etc.)
  return [
    { startMonth: 1, startDay: 7, endMonth: 2, endDay: 28, label: 'Post-Holiday Lull' },
    { startMonth: 9, startDay: 5, endMonth: 10, endDay: 31, label: 'Fall Shoulder' },
    { startMonth: 4, startDay: 15, endMonth: 5, endDay: 15, label: 'Spring Shoulder' },
  ];
}

/**
 * Find the next low season departure date for a destination
 * Returns a date at least minDaysFromNow days in the future
 *
 * @param destinationCode - IATA airport code
 * @param minDaysFromNow - Minimum days from today (default 7)
 * @param preferredPeriodIndex - Which low season period to prefer (0 = first/best)
 */
export function getNextLowSeasonDate(
  destinationCode: string,
  minDaysFromNow: number = 7,
  preferredPeriodIndex: number = 0
): Date {
  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() + minDaysFromNow);

  const periods = getLowSeasonPeriods(destinationCode);

  // Use the preferred period index (with fallback)
  const periodIndex = Math.min(preferredPeriodIndex, periods.length - 1);

  // Check each period starting from preferred
  for (let i = 0; i < periods.length; i++) {
    const idx = (periodIndex + i) % periods.length;
    const period = periods[idx];

    // Try current year first, then next year
    for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
      const periodStart = new Date(year, period.startMonth - 1, period.startDay);
      const periodEnd = new Date(year, period.endMonth - 1, period.endDay);

      // If period end is before start, it spans year boundary
      if (periodEnd < periodStart) {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Check if this period is valid
      if (periodEnd >= minDate) {
        // Return the later of periodStart or minDate
        const departureDate = periodStart >= minDate ? periodStart : minDate;

        // Make sure we're still within the period
        if (departureDate <= periodEnd) {
          return departureDate;
        }
      }
    }
  }

  // Fallback: return minDate if no low season found (shouldn't happen)
  return minDate;
}

/**
 * Calculate return date for a low season trip
 * @param departureDate - Departure date
 * @param tripDays - Trip duration in days (default 7)
 */
export function getLowSeasonReturnDate(departureDate: Date, tripDays: number = 7): Date {
  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + tripDays);
  return returnDate;
}

/**
 * Format date as ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get multiple low season date options for a route
 * Useful for finding the absolute cheapest date
 */
export function getLowSeasonDateOptions(
  destinationCode: string,
  count: number = 3,
  minDaysFromNow: number = 7
): Array<{ departure: Date; return: Date; periodLabel: string }> {
  const periods = getLowSeasonPeriods(destinationCode);
  const options: Array<{ departure: Date; return: Date; periodLabel: string }> = [];
  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(minDate.getDate() + minDaysFromNow);

  for (let i = 0; i < Math.min(count, periods.length); i++) {
    const departure = getNextLowSeasonDate(destinationCode, minDaysFromNow, i);
    const returnDate = getLowSeasonReturnDate(departure);
    options.push({
      departure,
      return: returnDate,
      periodLabel: periods[i].label,
    });
  }

  return options;
}

/**
 * Check if a date falls within low season for a destination
 */
export function isLowSeason(destinationCode: string, date: Date): boolean {
  const periods = getLowSeasonPeriods(destinationCode);
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  for (const period of periods) {
    const inStartRange = month > period.startMonth ||
      (month === period.startMonth && day >= period.startDay);
    const inEndRange = month < period.endMonth ||
      (month === period.endMonth && day <= period.endDay);

    // Handle year-spanning periods
    if (period.endMonth < period.startMonth) {
      if (inStartRange || inEndRange) return true;
    } else {
      if (inStartRange && inEndRange) return true;
    }
  }

  return false;
}
