/**
 * AI Agent Deal Detection System
 * Detects deals, price drops, and opportunities in search results
 */

import type { Suggestion } from './agent-suggestions';

export interface DealDetectionResult {
  hasDeal: boolean;
  dealType?: 'price-drop' | 'flash-sale' | 'better-option' | 'package-deal';
  savings?: number;
  savingsPercentage?: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Detect if there's a price drop compared to historical data
 */
export function detectPriceDrop(
  currentPrice: number,
  historicalPrice: number,
  threshold: number = 0.85
): Suggestion | null {
  if (historicalPrice === 0) return null;

  const ratio = currentPrice / historicalPrice;

  if (ratio < threshold) {
    const savings = historicalPrice - currentPrice;
    const savingsPercent = Math.round(((historicalPrice - currentPrice) / historicalPrice) * 100);

    return {
      id: 'price-drop-detected',
      type: 'deal-alert',
      priority: 'high',
      message: `Great news! Prices just dropped ${savingsPercent}% from $${historicalPrice} to $${currentPrice}!`,
      savingsAmount: savings,
      savingsPercentage: savingsPercent,
      action: {
        type: 'book-now',
        label: 'Lock In This Price',
        params: { price: currentPrice }
      }
    };
  }

  return null;
}

/**
 * Detect flash sales in search results
 */
export function detectFlashSale(results: any[]): Suggestion | null {
  if (!results || results.length === 0) return null;

  const flashSaleResults = results.filter(r =>
    r.isFlashSale ||
    r.limitedTimeOffer ||
    (r.expiresAt && new Date(r.expiresAt) > new Date())
  );

  if (flashSaleResults.length === 0) return null;

  // Find the best flash sale
  const bestDeal = flashSaleResults.reduce((best, current) => {
    const bestSavings = best.discountPercentage || 0;
    const currentSavings = current.discountPercentage || 0;
    return currentSavings > bestSavings ? current : best;
  });

  const timeRemaining = calculateTimeRemaining(bestDeal.expiresAt);

  return {
    id: `flash-sale-${bestDeal.id}`,
    type: 'deal-alert',
    priority: 'high',
    message: `⚡ Flash Sale! Save ${bestDeal.discountPercentage || 20}% on ${bestDeal.airline || 'this flight'} - expires in ${timeRemaining}!`,
    savingsPercentage: bestDeal.discountPercentage || 20,
    expiresAt: new Date(bestDeal.expiresAt),
    action: {
      type: 'show-details',
      label: 'Grab This Deal',
      params: { id: bestDeal.id }
    },
    metadata: {
      airline: bestDeal.airline,
      originalPrice: bestDeal.originalPrice,
      salePrice: bestDeal.price
    }
  };
}

/**
 * Detect better alternatives in results
 */
export function detectBetterOptions(
  results: any[],
  userPreferences?: {
    prefersDirect?: boolean;
    maxLayoverTime?: number;
    preferredAirlines?: string[];
    maxPrice?: number;
  }
): Suggestion[] {
  if (!results || results.length < 2) return [];

  const suggestions: Suggestion[] = [];

  // Sort by price
  const sortedByPrice = [...results].sort((a, b) => a.price - b.price);
  const cheapest = sortedByPrice[0];

  // 1. Direct flight for small premium
  const directFlightSuggestion = detectDirectFlightUpgrade(results, cheapest);
  if (directFlightSuggestion) {
    suggestions.push(directFlightSuggestion);
  }

  // 2. Better airline for similar price
  const betterAirlineSuggestion = detectBetterAirline(results, cheapest, userPreferences);
  if (betterAirlineSuggestion) {
    suggestions.push(betterAirlineSuggestion);
  }

  // 3. Shorter trip time for reasonable premium
  const shorterTripSuggestion = detectShorterTrip(results, cheapest);
  if (shorterTripSuggestion) {
    suggestions.push(shorterTripSuggestion);
  }

  // 4. Better departure time for same price
  const betterTimeSuggestion = detectBetterDepartureTime(results, cheapest);
  if (betterTimeSuggestion) {
    suggestions.push(betterTimeSuggestion);
  }

  // 5. Premium class for small upgrade
  const premiumClassSuggestion = detectPremiumClassUpgrade(results, cheapest);
  if (premiumClassSuggestion) {
    suggestions.push(premiumClassSuggestion);
  }

  return suggestions;
}

/**
 * Detect direct flight upgrade opportunity
 */
function detectDirectFlightUpgrade(results: any[], cheapest: any): Suggestion | null {
  if (cheapest.stops === 0) return null; // Already direct

  const directFlights = results.filter(r => r.stops === 0);
  if (directFlights.length === 0) return null;

  const cheapestDirect = directFlights.reduce((min, r) =>
    r.price < min.price ? r : min
  );

  const priceDiff = cheapestDirect.price - cheapest.price;
  const percentDiff = Math.round((priceDiff / cheapest.price) * 100);

  // Only suggest if less than 30% more expensive
  if (percentDiff > 30) return null;

  const timeSaved = calculateTimeSaved(cheapest.totalDuration, cheapestDirect.totalDuration);

  return {
    id: 'direct-flight-upgrade',
    type: 'better-option',
    priority: percentDiff < 15 ? 'high' : 'medium',
    message: `For just $${priceDiff} more (${percentDiff}% increase), you could fly direct and save ${timeSaved} hours of travel time!`,
    action: {
      type: 'compare-options',
      label: 'Compare Direct vs. Connecting',
      params: {
        option1: cheapest.id,
        option2: cheapestDirect.id
      }
    },
    metadata: {
      priceDifference: priceDiff,
      timeSaved,
      stops: cheapest.stops
    }
  };
}

/**
 * Detect better airline opportunity
 */
function detectBetterAirline(
  results: any[],
  cheapest: any,
  userPreferences?: any
): Suggestion | null {
  // Airline ratings (simplified - can be pulled from actual data)
  const airlineRatings: Record<string, number> = {
    'Emirates': 5,
    'Singapore Airlines': 5,
    'Qatar Airways': 5,
    'ANA': 4.5,
    'Lufthansa': 4,
    'British Airways': 4,
    'Delta': 3.5,
    'United': 3,
    'American Airlines': 3,
  };

  const cheapestRating = airlineRatings[cheapest.airline] || 3;

  // Find better-rated airlines within 20% price range
  const betterOptions = results.filter(r => {
    const rating = airlineRatings[r.airline] || 3;
    const priceDiff = r.price - cheapest.price;
    const percentDiff = (priceDiff / cheapest.price) * 100;

    return rating > cheapestRating && percentDiff < 20;
  });

  if (betterOptions.length === 0) return null;

  const bestOption = betterOptions.reduce((best, current) => {
    const bestRating = airlineRatings[best.airline] || 3;
    const currentRating = airlineRatings[current.airline] || 3;
    return currentRating > bestRating ? current : best;
  });

  const priceDiff = bestOption.price - cheapest.price;
  const percentDiff = Math.round((priceDiff / cheapest.price) * 100);
  const ratingDiff = (airlineRatings[bestOption.airline] || 3) - cheapestRating;

  return {
    id: 'better-airline-option',
    type: 'better-option',
    priority: 'medium',
    message: `For $${priceDiff} more, you could fly with ${bestOption.airline} (rated ${ratingDiff} stars higher) - better service, comfort, and amenities!`,
    action: {
      type: 'compare-options',
      label: 'Compare Airlines',
      params: {
        option1: cheapest.id,
        option2: bestOption.id
      }
    },
    metadata: {
      airline: bestOption.airline,
      rating: airlineRatings[bestOption.airline],
      priceDifference: priceDiff
    }
  };
}

/**
 * Detect shorter trip time opportunity
 */
function detectShorterTrip(results: any[], cheapest: any): Suggestion | null {
  const shorterOptions = results.filter(r => {
    const timeDiff = cheapest.totalDuration - r.totalDuration;
    const priceDiff = r.price - cheapest.price;
    const percentDiff = (priceDiff / cheapest.price) * 100;

    // At least 2 hours shorter and less than 25% more expensive
    return timeDiff >= 120 && percentDiff < 25;
  });

  if (shorterOptions.length === 0) return null;

  const bestOption = shorterOptions.reduce((best, current) => {
    const bestTime = cheapest.totalDuration - best.totalDuration;
    const currentTime = cheapest.totalDuration - current.totalDuration;
    return currentTime > bestTime ? current : best;
  });

  const priceDiff = bestOption.price - cheapest.price;
  const timeSaved = Math.round((cheapest.totalDuration - bestOption.totalDuration) / 60);

  return {
    id: 'shorter-trip-option',
    type: 'time-saving',
    priority: 'medium',
    message: `Save ${timeSaved} hours of travel time for just $${priceDiff} more - arrive ${timeSaved} hours earlier!`,
    action: {
      type: 'show-details',
      label: 'View Faster Option',
      params: { id: bestOption.id }
    },
    metadata: {
      timeSaved,
      priceDifference: priceDiff
    }
  };
}

/**
 * Detect better departure time opportunity
 */
function detectBetterDepartureTime(results: any[], cheapest: any): Suggestion | null {
  // Define ideal departure windows
  const idealMorning = { start: 7, end: 10 };
  const idealAfternoon = { start: 13, end: 16 };

  const cheapestTime = new Date(cheapest.departureTime);
  const cheapestHour = cheapestTime.getHours();

  // Check if cheapest is at a bad time (red-eye or very early)
  const isBadTime = cheapestHour < 6 || cheapestHour > 22;

  if (!isBadTime) return null;

  // Find options at better times for similar price
  const betterTimeOptions = results.filter(r => {
    const time = new Date(r.departureTime);
    const hour = time.getHours();
    const priceDiff = Math.abs(r.price - cheapest.price);
    const percentDiff = (priceDiff / cheapest.price) * 100;

    const isIdealTime =
      (hour >= idealMorning.start && hour <= idealMorning.end) ||
      (hour >= idealAfternoon.start && hour <= idealAfternoon.end);

    return isIdealTime && percentDiff < 10;
  });

  if (betterTimeOptions.length === 0) return null;

  const bestOption = betterTimeOptions[0];
  const priceDiff = Math.abs(bestOption.price - cheapest.price);
  const departureTime = new Date(bestOption.departureTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    id: 'better-time-option',
    type: 'better-option',
    priority: 'low',
    message: `There's a ${departureTime} departure for about the same price - much more convenient than the ${cheapestTime.getHours()}:00 option!`,
    action: {
      type: 'show-details',
      label: 'View Better Time',
      params: { id: bestOption.id }
    },
    metadata: {
      departureTime,
      priceDifference: priceDiff
    }
  };
}

/**
 * Detect premium class upgrade opportunity
 */
function detectPremiumClassUpgrade(results: any[], cheapest: any): Suggestion | null {
  if (cheapest.class !== 'economy') return null;

  const premiumOptions = results.filter(r =>
    r.class === 'premium-economy' || r.class === 'business'
  );

  if (premiumOptions.length === 0) return null;

  const affordablePremium = premiumOptions.filter(r => {
    const priceDiff = r.price - cheapest.price;
    const percentDiff = (priceDiff / cheapest.price) * 100;
    return percentDiff < 40;
  });

  if (affordablePremium.length === 0) return null;

  const bestOption = affordablePremium.reduce((min, r) =>
    r.price < min.price ? r : min
  );

  const priceDiff = bestOption.price - cheapest.price;
  const percentDiff = Math.round((priceDiff / cheapest.price) * 100);

  const benefits = bestOption.class === 'business'
    ? 'lie-flat seats, premium meals, lounge access'
    : 'extra legroom, priority boarding, better meals';

  return {
    id: 'premium-class-upgrade',
    type: 'upsell',
    priority: 'low',
    message: `${bestOption.class === 'business' ? 'Business' : 'Premium Economy'} class is only ${percentDiff}% more - get ${benefits}!`,
    action: {
      type: 'compare-options',
      label: 'Compare Classes',
      params: {
        option1: cheapest.id,
        option2: bestOption.id
      }
    },
    metadata: {
      class: bestOption.class,
      priceDifference: priceDiff,
      benefits
    }
  };
}

/**
 * Detect package deal opportunities
 */
export function detectPackageDeal(
  flightPrice: number,
  hotelPrice?: number,
  destination?: string
): Suggestion | null {
  // Typical package savings: 15-20%
  const packageDiscount = 0.18;

  if (hotelPrice) {
    const totalSeparate = flightPrice + hotelPrice;
    const packagePrice = totalSeparate * (1 - packageDiscount);
    const savings = totalSeparate - packagePrice;

    return {
      id: 'package-deal-opportunity',
      type: 'package-deal',
      priority: 'medium',
      message: `Book flight + hotel together and save $${Math.round(savings)} (${Math.round(packageDiscount * 100)}% off)!`,
      savingsAmount: savings,
      savingsPercentage: Math.round(packageDiscount * 100),
      action: {
        type: 'show-alternatives',
        label: 'View Package Deals',
        params: { type: 'package', destination }
      }
    };
  }

  // Generic package suggestion
  return {
    id: 'package-deal-suggestion',
    type: 'package-deal',
    priority: 'medium',
    message: `💡 Pro tip: Booking flight + hotel together typically saves 15-20%!`,
    action: {
      type: 'show-alternatives',
      label: 'Explore Packages',
      params: { type: 'package', destination }
    }
  };
}

/**
 * Detect urgency signals (limited seats, price increases)
 */
export function detectUrgencySignals(
  results: any[],
  historicalData?: any
): Suggestion | null {
  // Check for low seat availability
  const lowAvailability = results.filter(r =>
    r.seatsRemaining && r.seatsRemaining <= 5
  );

  if (lowAvailability.length > 0) {
    const lowestSeats = Math.min(...lowAvailability.map(r => r.seatsRemaining));

    return {
      id: 'low-availability-alert',
      type: 'urgency',
      priority: 'high',
      message: `⚠️ Only ${lowestSeats} seats left at this price! Prices typically increase when availability drops below 5 seats.`,
      action: {
        type: 'book-now',
        label: 'Book Now'
      }
    };
  }

  // Check for upward price trend
  if (historicalData && historicalData.priceHistory) {
    const recentPrices = historicalData.priceHistory.slice(-7); // Last 7 days
    const isIncreasing = recentPrices.every((price: number, i: number) =>
      i === 0 || price >= recentPrices[i - 1]
    );

    if (isIncreasing) {
      const increase = recentPrices[recentPrices.length - 1] - recentPrices[0];
      const percentIncrease = Math.round((increase / recentPrices[0]) * 100);

      return {
        id: 'price-trend-alert',
        type: 'urgency',
        priority: 'high',
        message: `📈 Prices have increased ${percentIncrease}% in the last week and are trending upward. Book soon to avoid further increases!`,
        action: {
          type: 'book-now',
          label: 'Lock In Current Price'
        }
      };
    }
  }

  return null;
}

/**
 * Analyze all results for deal opportunities
 */
export function analyzeDeals(
  results: any[],
  context?: {
    historicalData?: any;
    userPreferences?: any;
    destination?: string;
  }
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Flash sales
  const flashSale = detectFlashSale(results);
  if (flashSale) suggestions.push(flashSale);

  // Better options
  const betterOptions = detectBetterOptions(results, context?.userPreferences);
  suggestions.push(...betterOptions);

  // Package deals
  const packageDeal = detectPackageDeal(
    results[0]?.price || 0,
    undefined,
    context?.destination
  );
  if (packageDeal) suggestions.push(packageDeal);

  // Urgency signals
  const urgency = detectUrgencySignals(results, context?.historicalData);
  if (urgency) suggestions.push(urgency);

  return suggestions;
}

// Helper functions

function calculateTimeRemaining(expiresAt: Date | string | undefined): string {
  if (!expiresAt) return 'soon';

  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff < 0) return 'expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    return `${Math.floor(hours / 24)} days`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else {
    return `${minutes} minutes`;
  }
}

function calculateTimeSaved(totalMinutes1: number, totalMinutes2: number): number {
  return Math.round(Math.abs(totalMinutes1 - totalMinutes2) / 60);
}
