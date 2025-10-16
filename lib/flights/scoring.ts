/**
 * AI-Powered Flight Scoring System
 * Scores flights based on multiple factors to help users find the best deals
 */

import { FlightOffer, normalizePrice } from './types';

// Re-export FlightOffer for backward compatibility
export type { FlightOffer } from './types';

export interface ScoredFlight extends Omit<FlightOffer, 'badges' | 'score'> {
  score: {
    best: number;
    cheapest: number;
    fastest: number;
    overall: number;
  };
  badges: string[];
  metadata: {
    totalDuration: number;
    pricePerHour: number;
    stopCount: number;
    departureTimeScore: number;
  };
}

/**
 * Parse ISO 8601 duration to minutes
 */
function parseDuration(duration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');

  return hours * 60 + minutes;
}

/**
 * Calculate departure time score (0-100)
 * Prefers convenient departure times (7am-9am, 5pm-7pm)
 */
function calculateDepartureTimeScore(departureTime: string): number {
  const date = new Date(departureTime);
  const hour = date.getHours();

  // Morning peak: 7-9am (90-100 score)
  if (hour >= 7 && hour < 9) {
    return 90 + ((hour - 7) / 2) * 10;
  }

  // Evening peak: 5-7pm (85-95 score)
  if (hour >= 17 && hour < 19) {
    return 85 + ((hour - 17) / 2) * 10;
  }

  // Mid-morning: 9am-12pm (70-85 score)
  if (hour >= 9 && hour < 12) {
    return 70 + ((hour - 9) / 3) * 15;
  }

  // Afternoon: 12pm-5pm (65-75 score)
  if (hour >= 12 && hour < 17) {
    return 65 + ((hour - 12) / 5) * 10;
  }

  // Early morning: 5-7am (50-60 score)
  if (hour >= 5 && hour < 7) {
    return 50 + ((hour - 5) / 2) * 10;
  }

  // Late evening: 7pm-10pm (40-55 score)
  if (hour >= 19 && hour < 22) {
    return 40 + ((hour - 19) / 3) * 15;
  }

  // Night/very early: 10pm-5am (20-40 score)
  if (hour >= 22 || hour < 5) {
    return 20 + (hour >= 22 ? (hour - 22) : (hour + 2)) * 5;
  }

  return 50; // Default
}

/**
 * Calculate comprehensive flight score
 */
export function calculateFlightScore(
  flight: FlightOffer,
  allFlights: FlightOffer[]
): ScoredFlight {
  // Calculate metadata
  const totalDuration = flight.itineraries.reduce(
    (sum, itinerary) => sum + parseDuration(itinerary.duration),
    0
  );

  const stopCount = flight.itineraries.reduce(
    (sum, itinerary) => sum + (itinerary.segments.length - 1),
    0
  );

  const pricePerHour = normalizePrice(flight.price.total) / (totalDuration / 60);

  const departureTime = flight.itineraries[0].segments[0].departure.at;
  const departureTimeScore = calculateDepartureTimeScore(departureTime);

  // Get min/max values for normalization
  const prices = allFlights.map(f => normalizePrice(f.price.total));
  const durations = allFlights.map(f =>
    f.itineraries.reduce((sum, it) => sum + parseDuration(it.duration), 0)
  );
  const stops = allFlights.map(f =>
    f.itineraries.reduce((sum, it) => sum + (it.segments.length - 1), 0)
  );

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const minStops = Math.min(...stops);
  const maxStops = Math.max(...stops);

  // Calculate normalized scores (0-100)
  const priceScore = maxPrice === minPrice
    ? 100
    : ((maxPrice - normalizePrice(flight.price.total)) / (maxPrice - minPrice)) * 100;

  const durationScore = maxDuration === minDuration
    ? 100
    : ((maxDuration - totalDuration) / (maxDuration - minDuration)) * 100;

  const stopsScore = maxStops === minStops
    ? 100
    : ((maxStops - stopCount) / (maxStops - minStops)) * 100;

  const seatsScore = flight.numberOfBookableSeats
    ? Math.min((flight.numberOfBookableSeats / 9) * 100, 100)
    : 50;

  // Calculate composite scores
  const cheapestScore = priceScore;
  const fastestScore = durationScore * 0.7 + stopsScore * 0.3;

  // Best score considers all factors with optimized weights
  const bestScore = (
    priceScore * 0.35 +           // 35% price weight
    durationScore * 0.25 +        // 25% duration weight
    stopsScore * 0.20 +           // 20% stops weight
    departureTimeScore * 0.15 +   // 15% departure time weight
    seatsScore * 0.05             // 5% availability weight
  );

  // Overall balanced score
  const overallScore = (
    priceScore * 0.4 +
    durationScore * 0.3 +
    stopsScore * 0.2 +
    departureTimeScore * 0.1
  );

  return {
    ...flight,
    score: {
      best: Math.round(bestScore),
      cheapest: Math.round(cheapestScore),
      fastest: Math.round(fastestScore),
      overall: Math.round(overallScore)
    },
    badges: [],
    metadata: {
      totalDuration,
      pricePerHour: Math.round(pricePerHour * 100) / 100,
      stopCount,
      departureTimeScore: Math.round(departureTimeScore)
    }
  };
}

/**
 * Generate persuasive badges for flights
 */
export function getFlightBadges(flight: ScoredFlight, allFlights: ScoredFlight[]): string[] {
  const badges: string[] = [];

  // Best overall value
  const bestScoreFlight = allFlights.reduce((best, f) =>
    f.score.best > best.score.best ? f : best
  );
  if (flight.id === bestScoreFlight.id) {
    badges.push('Best Value');
  }

  // Cheapest flight
  const cheapestFlight = allFlights.reduce((cheap, f) =>
    normalizePrice(f.price.total) < normalizePrice(cheap.price.total) ? f : cheap
  );
  if (flight.id === cheapestFlight.id) {
    badges.push('Lowest Price');
  }

  // Fastest flight
  const fastestFlight = allFlights.reduce((fast, f) =>
    f.metadata.totalDuration < fast.metadata.totalDuration ? f : fast
  );
  if (flight.id === fastestFlight.id) {
    badges.push('Fastest Flight');
  }

  // Direct flight (no stops)
  if (flight.metadata.stopCount === 0) {
    badges.push('Direct Flight');
  }

  // Great departure time
  if (flight.metadata.departureTimeScore >= 85) {
    badges.push('Convenient Time');
  }

  // High availability
  if (flight.numberOfBookableSeats && flight.numberOfBookableSeats >= 7) {
    badges.push('High Availability');
  }

  // Low availability warning
  if (flight.numberOfBookableSeats && flight.numberOfBookableSeats <= 3) {
    badges.push('Only ' + flight.numberOfBookableSeats + ' Seats Left');
  }

  // Top 10% best value
  const top10Threshold = allFlights
    .map(f => f.score.best)
    .sort((a, b) => b - a)[Math.floor(allFlights.length * 0.1)];
  if (flight.score.best >= top10Threshold) {
    badges.push('Top Pick');
  }

  // Good price per hour
  const avgPricePerHour = allFlights.reduce((sum, f) => sum + f.metadata.pricePerHour, 0) / allFlights.length;
  if (flight.metadata.pricePerHour < avgPricePerHour * 0.85) {
    badges.push('Great Value/Hour');
  }

  // Premium airline (major carriers)
  const premiumCarriers = ['DL', 'AA', 'UA', 'BA', 'LH', 'AF', 'EK', 'QR', 'SQ', 'NH'];
  const carrier = flight.validatingAirlineCodes?.[0];
  if (carrier && premiumCarriers.includes(carrier)) {
    badges.push('Premium Airline');
  }

  // Early bird (morning flights)
  const departureHour = new Date(flight.itineraries[0].segments[0].departure.at).getHours();
  if (departureHour >= 6 && departureHour < 9) {
    badges.push('Early Departure');
  }

  // Red-eye flight
  if (departureHour >= 22 || departureHour < 5) {
    badges.push('Red-Eye Flight');
  }

  return badges;
}

/**
 * Sort flights by specified criteria
 */
export function sortFlights(
  flights: ScoredFlight[],
  sortBy: 'best' | 'cheapest' | 'fastest' | 'overall' = 'best'
): ScoredFlight[] {
  return [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'best':
        return b.score.best - a.score.best;
      case 'cheapest':
        return normalizePrice(a.price.total) - normalizePrice(b.price.total);
      case 'fastest':
        return a.metadata.totalDuration - b.metadata.totalDuration;
      case 'overall':
        return b.score.overall - a.score.overall;
      default:
        return b.score.best - a.score.best;
    }
  });
}
