/**
 * Deal Score Algorithm for Flight Comparison
 *
 * Calculates a comprehensive 0-100 score for flights based on multiple factors:
 * - Price competitiveness (40 points)
 * - Flight duration (15 points)
 * - Number of stops (15 points)
 * - Departure/arrival times (10 points)
 * - On-time reliability (10 points)
 * - Comfort factors (5 points)
 * - Seat availability (5 points)
 *
 * @module lib/flights/dealScore
 */

export interface DealScoreFactors {
  /** Price difference from market average in dollars (negative = cheaper than market) */
  priceVsMarket: number; // -50 to +50 (below/above market average)
  /** Flight duration in minutes */
  duration: number;
  /** Number of stops/layovers */
  stops: number;
  /** Departure time in ISO 8601 format */
  departureTime: string;
  /** Arrival time in ISO 8601 format */
  arrivalTime: string;
  /** On-time performance percentage (0-100) */
  onTimePerformance?: number;
  /** Aircraft age in years */
  aircraftAge?: number;
  /** Number of seats remaining */
  seatAvailability: number;
  /** Airline rating (1-5 scale) */
  airlineRating?: number;
  /** Layover airport quality rating (1-5 scale) */
  layoverQuality?: number;
}

export interface DealScoreBreakdown {
  /** Total score (0-100) */
  total: number;
  /** Individual component scores */
  components: {
    price: number;
    duration: number;
    stops: number;
    timeOfDay: number;
    reliability: number;
    comfort: number;
    availability: number;
  };
  /** Score tier classification */
  tier: 'excellent' | 'great' | 'good' | 'fair';
  /** Human-readable label */
  label: string;
  /** Detailed explanations for each component */
  explanations: {
    price: string;
    duration: string;
    stops: string;
    timeOfDay: string;
    reliability: string;
    comfort: string;
    availability: string;
  };
}

/**
 * Calculates price score (0-40 points)
 *
 * @param priceVsMarket - Price difference from market average (negative = cheaper)
 * @returns Score between 0-40
 */
function calculatePriceScore(priceVsMarket: number): number {
  const MAX_PRICE_SCORE = 40;

  // At market average (priceVsMarket = 0) = 20 points
  // 20% below market (priceVsMarket = -20) = 40 points
  // 20% above market (priceVsMarket = +20) = 0 points

  if (priceVsMarket <= -20) {
    // 20% or more below market = maximum points
    return MAX_PRICE_SCORE;
  } else if (priceVsMarket >= 20) {
    // 20% or more above market = minimum points
    return 0;
  } else {
    // Linear interpolation between -20 and +20
    // Formula: 40 - ((priceVsMarket + 20) * 1)
    return MAX_PRICE_SCORE - ((priceVsMarket + 20) * (MAX_PRICE_SCORE / 40));
  }
}

/**
 * Calculates duration score (0-15 points)
 * Requires context of shortest possible duration for this route
 *
 * @param duration - Flight duration in minutes
 * @param shortestDuration - Shortest available duration for this route
 * @returns Score between 0-15
 */
function calculateDurationScore(duration: number, shortestDuration: number): number {
  const MAX_DURATION_SCORE = 15;

  if (duration <= shortestDuration) {
    return MAX_DURATION_SCORE;
  }

  // Calculate how much longer this flight is compared to shortest
  const durationRatio = duration / shortestDuration;

  // If flight is 2x or more the shortest duration, give minimal points
  if (durationRatio >= 2.0) {
    return 3;
  }

  // Linear decay from 15 points (at shortest) to 3 points (at 2x shortest)
  // Formula: 15 - ((ratio - 1) * 12)
  return MAX_DURATION_SCORE - ((durationRatio - 1) * 12);
}

/**
 * Calculates stops score (0-15 points)
 *
 * @param stops - Number of stops/layovers
 * @returns Score between 0-15
 */
function calculateStopsScore(stops: number): number {
  if (stops === 0) return 15;
  if (stops === 1) return 8;
  if (stops === 2) return 3;
  return 1; // 3+ stops
}

/**
 * Calculates time of day score (0-10 points)
 * Considers both departure and arrival times
 *
 * @param departureTime - ISO 8601 departure time
 * @param arrivalTime - ISO 8601 arrival time
 * @returns Score between 0-10
 */
function calculateTimeOfDayScore(departureTime: string, arrivalTime: string): number {
  const depTime = new Date(departureTime);
  const arrTime = new Date(arrivalTime);

  const depHour = depTime.getHours();
  const arrHour = arrTime.getHours();

  let score = 0;

  // Departure time scoring (0-6 points)
  if (depHour >= 6 && depHour < 9) {
    // Early morning (6am-9am) - Very convenient
    score += 6;
  } else if (depHour >= 9 && depHour < 12) {
    // Late morning (9am-12pm) - Ideal
    score += 6;
  } else if (depHour >= 12 && depHour < 17) {
    // Afternoon (12pm-5pm) - Good
    score += 5;
  } else if (depHour >= 17 && depHour < 21) {
    // Evening (5pm-9pm) - Acceptable
    score += 4;
  } else if (depHour >= 21 || depHour < 1) {
    // Night (9pm-1am) - Red-eye
    score += 2;
  } else {
    // Very late night/early morning (1am-6am) - Inconvenient
    score += 1;
  }

  // Arrival time scoring (0-4 points)
  if (arrHour >= 8 && arrHour < 22) {
    // Arriving during reasonable hours (8am-10pm)
    score += 4;
  } else if (arrHour >= 6 && arrHour < 8) {
    // Early morning arrival
    score += 3;
  } else if (arrHour >= 22 || arrHour < 2) {
    // Late night arrival
    score += 2;
  } else {
    // Very late night arrival (2am-6am)
    score += 1;
  }

  return Math.min(score, 10);
}

/**
 * Calculates reliability score (0-10 points)
 * Based on on-time performance data
 *
 * @param onTimePerformance - On-time percentage (0-100)
 * @returns Score between 0-10
 */
function calculateReliabilityScore(onTimePerformance?: number): number {
  if (!onTimePerformance) {
    // No data available - give average score
    return 5;
  }

  // 90%+ on-time = 10 points
  // Scale linearly down to 50% on-time = 0 points
  if (onTimePerformance >= 90) return 10;
  if (onTimePerformance <= 50) return 0;

  // Linear interpolation: (performance - 50) / 4
  return (onTimePerformance - 50) / 4;
}

/**
 * Calculates comfort score (0-5 points)
 * Based on aircraft age and airline rating
 *
 * @param aircraftAge - Age of aircraft in years
 * @param airlineRating - Airline rating (1-5 scale)
 * @param layoverQuality - Layover airport quality (1-5 scale)
 * @returns Score between 0-5
 */
function calculateComfortScore(
  aircraftAge?: number,
  airlineRating?: number,
  layoverQuality?: number
): number {
  let score = 0;

  // Aircraft age component (0-2 points)
  if (aircraftAge !== undefined) {
    if (aircraftAge <= 5) {
      score += 2; // Brand new aircraft
    } else if (aircraftAge <= 10) {
      score += 1.5; // Modern aircraft
    } else if (aircraftAge <= 15) {
      score += 1; // Average age
    } else {
      score += 0.5; // Older aircraft
    }
  } else {
    score += 1; // No data - average
  }

  // Airline rating component (0-2 points)
  if (airlineRating !== undefined) {
    // Convert 1-5 scale to 0-2 points
    score += ((airlineRating - 1) / 4) * 2;
  } else {
    score += 1; // No data - average
  }

  // Layover quality component (0-1 point)
  if (layoverQuality !== undefined) {
    // Convert 1-5 scale to 0-1 points
    score += ((layoverQuality - 1) / 4);
  } else {
    score += 0.5; // No data - average
  }

  return Math.min(score, 5);
}

/**
 * Calculates availability score (0-5 points)
 * More available seats = higher confidence = higher score
 *
 * @param seatAvailability - Number of seats remaining
 * @returns Score between 0-5
 */
function calculateAvailabilityScore(seatAvailability: number): number {
  if (seatAvailability >= 20) return 5; // Plenty of seats
  if (seatAvailability >= 10) return 4; // Good availability
  if (seatAvailability >= 5) return 3; // Limited seats
  if (seatAvailability >= 2) return 2; // Very few seats
  if (seatAvailability >= 1) return 1; // Last seat(s)
  return 0; // Sold out (shouldn't happen)
}

/**
 * Determines score tier and label
 *
 * @param score - Total score (0-100)
 * @returns Tier classification and label
 */
function getScoreTier(score: number): { tier: DealScoreBreakdown['tier']; label: string } {
  if (score >= 90) return { tier: 'excellent', label: 'Excellent Deal' };
  if (score >= 75) return { tier: 'great', label: 'Great Deal' };
  if (score >= 60) return { tier: 'good', label: 'Good Deal' };
  return { tier: 'fair', label: 'Fair Deal' };
}

/**
 * Generates human-readable explanations for each score component
 *
 * @param factors - Deal score factors
 * @param components - Calculated component scores
 * @returns Explanation strings for each component
 */
function generateExplanations(
  factors: DealScoreFactors,
  components: DealScoreBreakdown['components']
): DealScoreBreakdown['explanations'] {
  const pricePercentage = Math.abs(factors.priceVsMarket);
  const priceDirection = factors.priceVsMarket < 0 ? 'below' : 'above';

  return {
    price: factors.priceVsMarket < -10
      ? `Excellent price - ${pricePercentage.toFixed(0)}% below market average`
      : factors.priceVsMarket < 0
      ? `Good price - ${pricePercentage.toFixed(0)}% below market average`
      : factors.priceVsMarket === 0
      ? 'At market average price'
      : `${pricePercentage.toFixed(0)}% above market average`,

    duration: factors.stops === 0
      ? `Direct flight - ${Math.floor(factors.duration / 60)}h ${factors.duration % 60}m`
      : `${Math.floor(factors.duration / 60)}h ${factors.duration % 60}m total travel time`,

    stops: factors.stops === 0
      ? 'Non-stop flight'
      : factors.stops === 1
      ? '1 stop'
      : `${factors.stops} stops`,

    timeOfDay: (() => {
      const depHour = new Date(factors.departureTime).getHours();
      const arrHour = new Date(factors.arrivalTime).getHours();
      const depLabel = depHour >= 6 && depHour < 18 ? 'daytime' : 'evening/night';
      const arrLabel = arrHour >= 6 && arrHour < 22 ? 'reasonable' : 'late';
      return `${depLabel} departure, ${arrLabel} arrival`;
    })(),

    reliability: factors.onTimePerformance
      ? `${factors.onTimePerformance.toFixed(0)}% on-time performance`
      : 'On-time data not available',

    comfort: (() => {
      const parts: string[] = [];
      if (factors.aircraftAge !== undefined) {
        parts.push(`${factors.aircraftAge}yr old aircraft`);
      }
      if (factors.airlineRating !== undefined) {
        parts.push(`${factors.airlineRating.toFixed(1)}/5 airline rating`);
      }
      if (factors.layoverQuality !== undefined) {
        parts.push(`${factors.layoverQuality.toFixed(1)}/5 layover quality`);
      }
      return parts.length > 0 ? parts.join(', ') : 'Comfort data not available';
    })(),

    availability: factors.seatAvailability >= 20
      ? `${factors.seatAvailability}+ seats available`
      : factors.seatAvailability >= 5
      ? `${factors.seatAvailability} seats remaining`
      : `Only ${factors.seatAvailability} seat(s) left`,
  };
}

/**
 * Main function to calculate comprehensive deal score
 *
 * @param factors - All factors affecting the deal score
 * @param shortestDuration - Shortest duration available for this route (for context)
 * @returns Complete score breakdown with explanations
 *
 * @example
 * ```typescript
 * const score = calculateDealScore({
 *   priceVsMarket: -15, // 15% below market
 *   duration: 480, // 8 hours
 *   stops: 1,
 *   departureTime: '2025-06-15T09:00:00Z',
 *   arrivalTime: '2025-06-15T17:00:00Z',
 *   onTimePerformance: 85,
 *   aircraftAge: 7,
 *   seatAvailability: 12,
 *   airlineRating: 4.2,
 *   layoverQuality: 3.5
 * }, 420); // shortest duration is 7 hours
 *
 * console.log(score.total); // 82
 * console.log(score.label); // "Great Deal"
 * ```
 */
export function calculateDealScore(
  factors: DealScoreFactors,
  shortestDuration?: number
): DealScoreBreakdown {
  // Calculate individual component scores
  const priceScore = calculatePriceScore(factors.priceVsMarket);
  const durationScore = calculateDurationScore(
    factors.duration,
    shortestDuration || factors.duration
  );
  const stopsScore = calculateStopsScore(factors.stops);
  const timeOfDayScore = calculateTimeOfDayScore(factors.departureTime, factors.arrivalTime);
  const reliabilityScore = calculateReliabilityScore(factors.onTimePerformance);
  const comfortScore = calculateComfortScore(
    factors.aircraftAge,
    factors.airlineRating,
    factors.layoverQuality
  );
  const availabilityScore = calculateAvailabilityScore(factors.seatAvailability);

  // Calculate total score
  const total = Math.round(
    priceScore +
    durationScore +
    stopsScore +
    timeOfDayScore +
    reliabilityScore +
    comfortScore +
    availabilityScore
  );

  // Ensure score is within 0-100 range
  const clampedTotal = Math.max(0, Math.min(100, total));

  // Get tier and label
  const { tier, label } = getScoreTier(clampedTotal);

  // Prepare components object
  const components = {
    price: Math.round(priceScore),
    duration: Math.round(durationScore),
    stops: Math.round(stopsScore),
    timeOfDay: Math.round(timeOfDayScore),
    reliability: Math.round(reliabilityScore),
    comfort: Math.round(comfortScore),
    availability: Math.round(availabilityScore),
  };

  // Generate explanations
  const explanations = generateExplanations(factors, components);

  return {
    total: clampedTotal,
    components,
    tier,
    label,
    explanations,
  };
}

/**
 * Helper function to calculate market average from flight list
 * Used to compute priceVsMarket values
 *
 * @param prices - Array of flight prices
 * @returns Market average price
 */
export function calculateMarketAverage(prices: number[]): number {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((acc, price) => acc + price, 0);
  return sum / prices.length;
}

/**
 * Helper function to find shortest duration in flight list
 * Used as context for duration scoring
 *
 * @param durations - Array of flight durations in minutes
 * @returns Shortest duration
 */
export function findShortestDuration(durations: number[]): number {
  if (durations.length === 0) return 0;
  return Math.min(...durations);
}

/**
 * Batch calculate deal scores for multiple flights
 * Automatically calculates market context (average price, shortest duration)
 *
 * @param flights - Array of flight data with prices and durations
 * @returns Array of deal scores with the same order as input
 *
 * @example
 * ```typescript
 * const scores = batchCalculateDealScores([
 *   { price: 450, factors: { ... } },
 *   { price: 520, factors: { ... } },
 *   { price: 380, factors: { ... } }
 * ]);
 * ```
 */
export function batchCalculateDealScores(
  flights: Array<{ price: number; factors: Omit<DealScoreFactors, 'priceVsMarket'> }>
): DealScoreBreakdown[] {
  // Calculate market context
  const prices = flights.map(f => f.price);
  const durations = flights.map(f => f.factors.duration);

  const marketAverage = calculateMarketAverage(prices);
  const shortestDuration = findShortestDuration(durations);

  // Calculate scores for each flight
  return flights.map(flight => {
    const priceVsMarket = ((flight.price - marketAverage) / marketAverage) * 100;

    return calculateDealScore(
      {
        ...flight.factors,
        priceVsMarket,
      },
      shortestDuration
    );
  });
}

/**
 * Type guard to validate DealScoreFactors
 *
 * @param factors - Object to validate
 * @returns True if object is valid DealScoreFactors
 */
export function isValidDealScoreFactors(factors: unknown): factors is DealScoreFactors {
  if (typeof factors !== 'object' || factors === null) return false;

  const f = factors as Record<string, unknown>;

  return (
    typeof f.priceVsMarket === 'number' &&
    typeof f.duration === 'number' &&
    typeof f.stops === 'number' &&
    typeof f.departureTime === 'string' &&
    typeof f.arrivalTime === 'string' &&
    typeof f.seatAvailability === 'number' &&
    (f.onTimePerformance === undefined || typeof f.onTimePerformance === 'number') &&
    (f.aircraftAge === undefined || typeof f.aircraftAge === 'number') &&
    (f.airlineRating === undefined || typeof f.airlineRating === 'number') &&
    (f.layoverQuality === undefined || typeof f.layoverQuality === 'number')
  );
}
