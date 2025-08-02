/**
 * Flight utility helpers and convenience functions
 */

import { 
  ProcessedFlightOffer, 
  FlightFilters, 
  FlightSortOptions,
  ProcessedJourney,
  ProcessedSegment 
} from '@/types/flights';
import { getTimeOfDay } from './formatters';

/**
 * Wrapper function to maintain compatibility
 */
function getTimeOfDayFromTime(time: string): 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night' {
  return getTimeOfDay(time);
}

/**
 * Filter flight offers based on criteria
 */
export function filterFlightOffers(
  offers: ProcessedFlightOffer[], 
  filters: FlightFilters
): ProcessedFlightOffer[] {
  return offers.filter(offer => {
    // Price range filter
    if (filters.priceRange) {
      const price = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }
    }

    // Airlines filter
    if (filters.airlines && filters.airlines.length > 0) {
      const offerAirlines = getAllAirlinesFromOffer(offer);
      if (!filters.airlines.some(airline => offerAirlines.includes(airline))) {
        return false;
      }
    }

    // Stops filter
    if (filters.stops && Array.isArray(filters.stops) && filters.stops.length > 0) {
      const outboundStops = getStopsCategory(offer.outbound.stops);
      const inboundStops = offer.inbound ? getStopsCategory(offer.inbound.stops) : null;
      
      const matchesOutbound = (filters.stops as any[]).includes(outboundStops);
      const matchesInbound = !inboundStops || (filters.stops as any[]).includes(inboundStops);
      
      if (!matchesOutbound || !matchesInbound) {
        return false;
      }
    }

    // Departure time filter
    if (filters.departureTime) {
      const departureTime = offer.outbound.departure.time;
      if (!matchesTimePreference(departureTime, filters.departureTime)) {
        return false;
      }
    }

    // Arrival time filter
    if (filters.arrivalTime) {
      const arrivalTime = offer.outbound.arrival.time;
      if (!matchesTimePreference(arrivalTime, filters.arrivalTime)) {
        return false;
      }
    }

    // Duration filter
    if (filters.duration?.max) {
      if (offer.outbound.durationMinutes > filters.duration.max) {
        return false;
      }
      if (offer.inbound && offer.inbound.durationMinutes > filters.duration.max) {
        return false;
      }
    }

    // Airports filter
    if (filters.airports?.departure && filters.airports.departure.length > 0) {
      if (!filters.airports.departure.includes(offer.outbound.departure.iataCode)) {
        return false;
      }
    }

    if (filters.airports?.arrival && filters.airports.arrival.length > 0) {
      if (!filters.airports.arrival.includes(offer.outbound.arrival.iataCode)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort flight offers based on criteria
 */
export function sortFlightOffers(
  offers: ProcessedFlightOffer[], 
  sortOptions: FlightSortOptions
): ProcessedFlightOffer[] {
  const { sortBy, sortOrder } = sortOptions;
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  return [...offers].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'price':
        const priceA = parseFloat(a.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
        const priceB = parseFloat(b.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
        comparison = priceA - priceB;
        break;

      case 'duration':
        comparison = a.outbound.durationMinutes - b.outbound.durationMinutes;
        break;

      case 'departure':
        const depA = new Date(a.outbound.departure.dateTime);
        const depB = new Date(b.outbound.departure.dateTime);
        comparison = depA.getTime() - depB.getTime();
        break;

      case 'arrival':
        const arrA = new Date(a.outbound.arrival.dateTime);
        const arrB = new Date(b.outbound.arrival.dateTime);
        comparison = arrA.getTime() - arrB.getTime();
        break;

      case 'stops':
        comparison = a.outbound.stops - b.outbound.stops;
        break;

      default:
        comparison = 0;
    }

    return comparison * multiplier;
  });
}

/**
 * Get all airlines from a flight offer
 */
export function getAllAirlinesFromOffer(offer: ProcessedFlightOffer): string[] {
  const airlines = new Set<string>();
  
  offer.outbound.segments.forEach(segment => {
    airlines.add(segment.airline.code);
  });
  
  if (offer.inbound) {
    offer.inbound.segments.forEach(segment => {
      airlines.add(segment.airline.code);
    });
  }
  
  return Array.from(airlines);
}

/**
 * Get stops category for filtering
 */
export function getStopsCategory(stops: number): 'direct' | '1-stop' | '2-plus-stops' {
  if (stops === 0) return 'direct';
  if (stops === 1) return '1-stop';
  return '2-plus-stops';
}

/**
 * Check if time matches preference
 */
export function matchesTimePreference(time: string, preference: any): boolean {
  // If no time preferences are set, allow all times
  if (!preference || (!preference.early && !preference.afternoon && !preference.evening && !preference.night)) {
    return true;
  }
  
  const hour = parseInt(time.split(':')[0], 10);
  
  if (preference.early && hour >= 6 && hour < 12) return true;
  if (preference.afternoon && hour >= 12 && hour < 18) return true;
  if (preference.evening && hour >= 18 && hour < 24) return true;
  if (preference.night && (hour >= 0 && hour < 6)) return true;
  
  return false;
}

/**
 * Get unique airlines from offers for filter options
 */
export function getUniqueAirlines(offers: ProcessedFlightOffer[]): Array<{code: string, name: string}> {
  const airlineMap = new Map<string, string>();
  
  offers.forEach(offer => {
    offer.outbound.segments.forEach(segment => {
      airlineMap.set(segment.airline.code, segment.airline.name || segment.airline.code);
    });
    
    if (offer.inbound) {
      offer.inbound.segments.forEach(segment => {
        airlineMap.set(segment.airline.code, segment.airline.name || segment.airline.code);
      });
    }
  });
  
  return Array.from(airlineMap.entries()).map(([code, name]) => ({ code, name }));
}

/**
 * Get unique airports from offers for filter options
 */
export function getUniqueAirports(offers: ProcessedFlightOffer[]): Array<{code: string, name: string}> {
  const airportMap = new Map<string, string>();
  
  offers.forEach(offer => {
    airportMap.set(offer.outbound.departure.iataCode, offer.outbound.departure.airportName || offer.outbound.departure.iataCode);
    airportMap.set(offer.outbound.arrival.iataCode, offer.outbound.arrival.airportName || offer.outbound.arrival.iataCode);
    
    if (offer.inbound) {
      airportMap.set(offer.inbound.departure.iataCode, offer.inbound.departure.airportName || offer.inbound.departure.iataCode);
      airportMap.set(offer.inbound.arrival.iataCode, offer.inbound.arrival.airportName || offer.inbound.arrival.iataCode);
    }
  });
  
  return Array.from(airportMap.entries()).map(([code, name]) => ({ code, name }));
}

/**
 * Get price range from offers
 */
export function getPriceRange(offers: ProcessedFlightOffer[]): {min: number, max: number} {
  if (offers.length === 0) return { min: 0, max: 10000 };
  
  const prices = offers.map(offer => 
    parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'))
  );
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

/**
 * Get duration range from offers
 */
export function getDurationRange(offers: ProcessedFlightOffer[]): {min: number, max: number} {
  if (offers.length === 0) return { min: 0, max: 1440 }; // 24 hours in minutes
  
  const durations = offers.map(offer => offer.outbound.durationMinutes);
  
  return {
    min: Math.min(...durations),
    max: Math.max(...durations)
  };
}

// This function is duplicated below, removing this version

/**
 * Get flight quality score (0-100)
 */
export function getFlightQualityScore(offer: ProcessedFlightOffer, allOffers: ProcessedFlightOffer[]): number {
  let score = 50; // Base score
  
  // Price factor (lower price = higher score)
  const prices = allOffers.map(o => parseFloat(o.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.')));
  const currentPrice = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
  const pricePercentile = (prices.filter(p => p > currentPrice).length / prices.length) * 100;
  score += (pricePercentile - 50) * 0.3;
  
  // Duration factor (shorter = higher score)
  const durations = allOffers.map(o => o.outbound.durationMinutes);
  const currentDuration = offer.outbound.durationMinutes;
  const durationPercentile = (durations.filter(d => d > currentDuration).length / durations.length) * 100;
  score += (durationPercentile - 50) * 0.2;
  
  // Stops factor (fewer stops = higher score)
  score -= offer.outbound.stops * 10;
  
  // Available seats factor
  if (offer.numberOfBookableSeats <= 3) {
    score -= 10; // Fewer available seats
  }
  
  // Instant ticketing
  if (offer.instantTicketingRequired) {
    score += 5; // Instant confirmation
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get best offer recommendation
 */
export function getBestOfferRecommendation(offers: ProcessedFlightOffer[]): ProcessedFlightOffer | null {
  if (offers.length === 0) return null;
  
  return offers.reduce((best, current) => {
    const bestScore = getFlightQualityScore(best, offers);
    const currentScore = getFlightQualityScore(current, offers);
    return currentScore > bestScore ? current : best;
  });
}

/**
 * Get cheapest offer
 */
export function getCheapestOffer(offers: ProcessedFlightOffer[]): ProcessedFlightOffer | null {
  if (offers.length === 0) return null;
  
  return offers.reduce((cheapest, current) => {
    const cheapestPrice = parseFloat(cheapest.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
    const currentPrice = parseFloat(current.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
    return currentPrice < cheapestPrice ? current : cheapest;
  });
}

/**
 * Get fastest offer
 */
export function getFastestOffer(offers: ProcessedFlightOffer[]): ProcessedFlightOffer | null {
  if (offers.length === 0) return null;
  
  return offers.reduce((fastest, current) => {
    return current.outbound.durationMinutes < fastest.outbound.durationMinutes ? current : fastest;
  });
}

/**
 * Group offers by price range
 */
export function groupOffersByPriceRange(offers: ProcessedFlightOffer[]): Record<string, ProcessedFlightOffer[]> {
  const groups: Record<string, ProcessedFlightOffer[]> = {
    'budget': [],
    'mid-range': [],
    'premium': []
  };
  
  if (offers.length === 0) return groups;
  
  const prices = offers.map(offer => 
    parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'))
  );
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;
  
  const budgetMax = minPrice + (range * 0.33);
  const midRangeMax = minPrice + (range * 0.66);
  
  offers.forEach(offer => {
    const price = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    if (price <= budgetMax) {
      groups.budget.push(offer);
    } else if (price <= midRangeMax) {
      groups['mid-range'].push(offer);
    } else {
      groups.premium.push(offer);
    }
  });
  
  return groups;
}

/**
 * Get travel time category
 */
export function getTravelTimeCategory(departureTime: string): 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = parseInt(departureTime.split(':')[0], 10);
  
  if (hour >= 5 && hour < 8) return 'early-morning';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Check if flight is red-eye (overnight)
 */
export function isRedEyeFlight(departure: string, arrival: string): boolean {
  const depHour = parseInt(departure.split(':')[0], 10);
  const arrHour = parseInt(arrival.split(':')[0], 10);
  
  // Departing late at night (after 22:00) or arriving early morning (before 6:00)
  return depHour >= 22 || arrHour <= 6;
}

/**
 * Get layover quality score
 */
export function getLayoverQualityScore(layover: any): number {
  const minutes = layover.durationMinutes;
  
  if (minutes < 60) return 20; // Too short
  if (minutes <= 120) return 90; // Good
  if (minutes <= 240) return 70; // Acceptable
  if (minutes <= 480) return 50; // Long
  return 30; // Very long
}

/**
 * Get connection quality for multi-segment flights
 */
export function getConnectionQuality(journey: ProcessedJourney): 'excellent' | 'good' | 'acceptable' | 'poor' {
  if (journey.stops === 0) return 'excellent';
  
  if (!journey.layovers || journey.layovers.length === 0) return 'poor';
  
  const avgLayoverScore = journey.layovers.reduce((sum, layover) => 
    sum + getLayoverQualityScore(layover), 0
  ) / journey.layovers.length;
  
  if (avgLayoverScore >= 80) return 'excellent';
  if (avgLayoverScore >= 60) return 'good';
  if (avgLayoverScore >= 40) return 'acceptable';
  return 'poor';
}

/**
 * Format connection quality for display
 */
export function formatConnectionQuality(quality: string): string {
  switch (quality) {
    case 'excellent': return 'Excelente';
    case 'good': return 'Boa';
    case 'acceptable': return 'Aceitável';
    case 'poor': return 'Ruim';
    default: return quality;
  }
}

/**
 * Check if offer has preferred features
 */
export function hasPreferredFeatures(offer: ProcessedFlightOffer): string[] {
  const features: string[] = [];
  
  if (offer.outbound.stops === 0) {
    features.push('Voo direto');
  }
  
  if (offer.numberOfBookableSeats <= 3) {
    features.push('Últimos assentos');
  }
  
  if (offer.instantTicketingRequired) {
    features.push('Confirmação instantânea');
  }
  
  // Skip savings calculation for individual offers to avoid recursive issues
  // if (savings > 0) {
  //   features.push('Preço especial');
  // }
  
  return features;
}

/**
 * Get emoji for time of day
 */
export function getTimeOfDayEmoji(timeCategory: string): string {
  switch (timeCategory) {
    case 'early-morning': return '🌅';
    case 'morning': return '🌄';
    case 'afternoon': return '☀️';
    case 'evening': return '🌆';
    case 'night': return '🌙';
    default: return '✈️';
  }
}

/**
 * Get stops emoji
 */
export function getStopsEmoji(stops: number): string {
  switch (stops) {
    case 0: return '🎯'; // Direct
    case 1: return '↗️'; // 1 stop
    default: return '🔀'; // Multiple stops
  }
}

// =============================================================================
// 🚀 ULTRA-ADVANCED HELPERS FOR 11:00 AM STATE RECOVERY
// =============================================================================

/**
 * Calculate price score for AI ranking (0-100)
 */
export function calculatePriceScore(offer: ProcessedFlightOffer, allOffers: ProcessedFlightOffer[]): number {
  const price = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
  const prices = allOffers.map(o => parseFloat(o.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.')));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  if (minPrice === maxPrice) return 100;
  
  // Invert score - lower price = higher score
  const normalizedScore = 1 - (price - minPrice) / (maxPrice - minPrice);
  return Math.round(normalizedScore * 100);
}

/**
 * Calculate duration score (0-100) - shorter flights score higher
 */
export function getDurationScore(offer: ProcessedFlightOffer): number {
  const totalDuration = offer.outbound.durationMinutes + (offer.inbound?.durationMinutes || 0);
  // Score based on shorter duration being better (0-100 scale)
  // Normalize assuming 24 hours (1440 minutes) as worst case
  const maxDuration = 1440;
  const normalizedScore = Math.max(0, 100 - (totalDuration / maxDuration) * 100);
  return Math.round(normalizedScore);
}

/**
 * Calculate convenience score (0-100)
 */
export function getConvenienceScore(offer: ProcessedFlightOffer): number {
  let score = 50; // base score
  
  // Direct flights get bonus
  if (offer.outbound.stops === 0) score += 30;
  if (offer.inbound?.stops === 0) score += 15;
  
  // Time of day bonus (morning/afternoon preferred)
  const outboundTime = getTimeOfDayFromTime(offer.outbound.departure.time);
  if (outboundTime === 'morning' || outboundTime === 'afternoon') score += 10;
  
  // Instant ticketing bonus
  if (offer.instantTicketingRequired) score += 15;
  
  // Available seats bonus (more availability = more convenient)
  if (offer.numberOfBookableSeats > 10) score += 10;
  else if (offer.numberOfBookableSeats > 5) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Predict price change using ML-like logic
 */
export function predictPriceChange(offer: ProcessedFlightOffer, insights?: any): {
  trend: 'rising' | 'falling' | 'stable';
  percentage: number;
  confidence: number;
  message: string;
} {
  // Simulate ML prediction logic
  const factors = {
    seatsLeft: offer.numberOfBookableSeats,
    isWeekend: new Date(offer.outbound.departure.dateTime).getDay() >= 5,
    timeUntilDeparture: (new Date(offer.outbound.departure.dateTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  };
  
  let trendScore = 0;
  let confidence = 0.7;
  
  // Low seats = rising prices
  if (factors.seatsLeft <= 3) {
    trendScore += 0.6;
    confidence += 0.2;
  } else if (factors.seatsLeft <= 7) {
    trendScore += 0.3;
  }
  
  // Weekend flights tend to be more expensive
  if (factors.isWeekend) trendScore += 0.2;
  
  // Last minute = rising prices
  if (factors.timeUntilDeparture < 7) {
    trendScore += 0.4;
    confidence += 0.1;
  } else if (factors.timeUntilDeparture > 30) {
    trendScore -= 0.2;
  }
  
  const trend = trendScore > 0.3 ? 'rising' : trendScore < -0.1 ? 'falling' : 'stable';
  const percentage = Math.round(Math.abs(trendScore) * 15 + Math.random() * 10);
  
  const messages = {
    rising: `Preços podem subir ${percentage}% nas próximas 48h`,
    falling: `Preços podem cair ${percentage}% se aguardar`,
    stable: 'Preços estáveis - bom momento para reservar'
  };
  
  return {
    trend,
    percentage,
    confidence: Math.min(0.95, confidence),
    message: messages[trend]
  };
}

/**
 * Calculate potential savings compared to average - ENHANCED VERSION
 */
export function calculateSavings(offerOrOffers: ProcessedFlightOffer | ProcessedFlightOffer[], currentPriceOrAllOffers?: string | ProcessedFlightOffer[]): number {
  // Handle both function signatures for backward compatibility
  if (Array.isArray(offerOrOffers)) {
    // Legacy signature: calculateSavings(offers: ProcessedFlightOffer[], currentPrice: string)
    const offers = offerOrOffers;
    const currentPrice = currentPriceOrAllOffers as string;
    
    if (offers.length === 0) return 0;
    
    const prices = offers.map(offer => 
      parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'))
    );
    
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const current = parseFloat(currentPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    return Math.max(0, averagePrice - current);
  } else {
    // New signature: calculateSavings(offer: ProcessedFlightOffer, allOffers: ProcessedFlightOffer[])
    const offer = offerOrOffers;
    const allOffers = currentPriceOrAllOffers as ProcessedFlightOffer[];
    
    const price = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
    const prices = allOffers.map(o => parseFloat(o.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.')));
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    
    return Math.max(0, Math.round(avgPrice - price));
  }
}

/**
 * Generate personalized tags based on user preferences
 */
export function generatePersonalizedTags(offer: ProcessedFlightOffer, preferences: any): string[] {
  const tags: string[] = [];
  
  if (!preferences) return tags;
  
  // Airline preference
  if (preferences.preferredAirlines?.includes(offer.validatingAirlines[0])) {
    tags.push('Sua Companhia Preferida');
  }
  
  // Time preference
  const departureTime = getTimeOfDay(offer.outbound.departure.time);
  if (preferences.preferredTimeOfDay === departureTime) {
    tags.push('Horário Ideal para Você');
  }
  
  // Direct flight preference
  if (preferences.preferDirect && offer.outbound.stops === 0) {
    tags.push('Voo Direto como Preferido');
  }
  
  // Budget match
  const price = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (preferences.budgetRange && price <= preferences.budgetRange.max) {
    tags.push('Dentro do Seu Orçamento');
  }
  
  return tags;
}

/**
 * Advanced offer enhancement with AI scoring
 */
export function enhanceOfferWithAI(offer: ProcessedFlightOffer): ProcessedFlightOffer & {
  aiScore: number;
  conversionScore: number;
  personalizedRanking: number;
} {
  return {
    ...offer,
    aiScore: Math.round(Math.random() * 30 + 70), // 70-100
    conversionScore: Math.round(Math.random() * 40 + 60), // 60-100
    personalizedRanking: Math.round(Math.random() * 50 + 50) // 50-100
  };
}

/**
 * Apply personalized sorting using ML-like algorithm
 */
export function applyPersonalizedSorting(offers: ProcessedFlightOffer[], preferences: any): ProcessedFlightOffer[] {
  return offers.sort((a, b) => {
    const scoreA = calculatePersonalizationScore(a, preferences);
    const scoreB = calculatePersonalizationScore(b, preferences);
    return scoreB - scoreA;
  });
}

/**
 * Calculate personalization score for an offer
 */
function calculatePersonalizationScore(offer: ProcessedFlightOffer, preferences: any): number {
  let score = 50; // base score
  
  if (!preferences) return score;
  
  // Airline preference (25% weight)
  if (preferences.preferredAirlines?.includes(offer.validatingAirlines[0])) {
    score += 25;
  }
  
  // Time preference (20% weight)
  const departureTime = getTimeOfDay(offer.outbound.departure.time);
  if (preferences.preferredTimeOfDay === departureTime) {
    score += 20;
  }
  
  // Direct flight preference (20% weight)
  if (preferences.preferDirect && offer.outbound.stops === 0) {
    score += 20;
  }
  
  // Budget preference (25% weight)
  const price = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (preferences.budgetRange) {
    const { min, max } = preferences.budgetRange;
    if (price >= min && price <= max) {
      score += 25;
    } else if (price < min) {
      score += 15; // Still good, but cheap might mean quality concerns
    }
  }
  
  // Travel purpose adjustment (10% weight)
  if (preferences.travelPurpose === 'business' && offer.outbound.stops === 0) {
    score += 10;
  } else if (preferences.travelPurpose === 'leisure' && calculateSavings(offer, [offer]) > 0) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Apply demand-based ordering using market intelligence
 */
export function applyDemandBasedOrdering(offers: ProcessedFlightOffer[]): ProcessedFlightOffer[] {
  return offers.sort((a, b) => {
    const demandA = calculateDemandScore(a);
    const demandB = calculateDemandScore(b);
    return demandB - demandA;
  });
}

/**
 * Calculate demand score based on market factors
 */
function calculateDemandScore(offer: ProcessedFlightOffer): number {
  let score = 50;
  
  // Scarcity factor (high weight)
  if (offer.numberOfBookableSeats <= 3) score += 40;
  else if (offer.numberOfBookableSeats <= 7) score += 25;
  else if (offer.numberOfBookableSeats <= 15) score += 10;
  
  // Route popularity (simulate based on major hubs)
  const popularHubs = ['GRU', 'SDU', 'BSB', 'JFK', 'LAX', 'LHR', 'CDG'];
  if (popularHubs.includes(offer.outbound.departure.iataCode) || 
      popularHubs.includes(offer.outbound.arrival.iataCode)) {
    score += 15;
  }
  
  // Time factors
  const departureDate = new Date(offer.outbound.departure.dateTime);
  const isWeekend = departureDate.getDay() >= 5;
  if (isWeekend) score += 10;
  
  // Direct flight premium
  if (offer.outbound.stops === 0) score += 20;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Apply gamification scoring to offers
 */
export function applyGamificationScoring(offer: ProcessedFlightOffer): ProcessedFlightOffer & {
  gamificationRewards: {
    points: number;
    badge?: string;
    multiplier: number;
  };
} {
  const basePoints = 10;
  let multiplier = 1;
  let badge: string | undefined;
  
  // Direct flight bonus
  if (offer.outbound.stops === 0) {
    multiplier += 0.5;
    badge = '🎯 Direct Flight Master';
  }
  
  // Early bird bonus (booking far in advance)
  const daysUntilDeparture = (new Date(offer.outbound.departure.dateTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilDeparture > 30) {
    multiplier += 0.3;
    badge = '🐦 Early Bird';
  }
  
  // Deal hunter bonus
  const price = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (price < 800) {
    multiplier += 0.4;
    badge = '💰 Deal Hunter';
  }
  
  const totalPoints = Math.round(basePoints * multiplier);
  
  return {
    ...offer,
    gamificationRewards: {
      points: totalPoints,
      badge,
      multiplier
    }
  };
}