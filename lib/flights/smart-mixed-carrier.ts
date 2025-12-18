/**
 * Smart Mixed-Carrier Search Optimization
 *
 * Advanced algorithm to find cheaper round-trip combinations using different airlines
 * for outbound and return flights, while minimizing API costs.
 *
 * Key Innovations:
 * 1. ZERO-COST HEURISTIC: Analyze existing round-trip data to predict mixed-carrier savings
 * 2. SMART TRIGGERING: Only run extra searches when likely to find savings
 * 3. PARALLEL EXECUTION: Run one-way searches alongside (not after) round-trip
 * 4. UNIFIED SORTING: Cheapest first regardless of ticket type
 * 5. CACHED REUSE: Cache one-way prices for future searches
 *
 * @author Fly2Any Travel Innovation Team
 */

import { FlightOffer, normalizePrice } from './types';
import {
  MixedCarrierFare,
  combineMixedCarrierFares,
  mixedFareToFlightOffer,
  rankMixedFares
} from './mixed-carrier-combiner';
import { getCached, setCache, generateCacheKey } from '../cache/helpers';

// ============================================================================
// TYPES
// ============================================================================

export interface MixedCarrierAnalysis {
  /** Whether mixed-carrier search is recommended */
  shouldSearch: boolean;

  /** Confidence level (0-1) */
  confidence: number;

  /** Reason for recommendation */
  reason: string;

  /** Estimated potential savings */
  estimatedSavings?: {
    amount: number;
    percentage: number;
  };

  /** Analysis data */
  analysis: {
    cheapestRoundTrip: number;
    cheapestOutboundEstimate: number;
    cheapestReturnEstimate: number;
    combinedEstimate: number;
    airlinePriceSpread: number;
    topAirlinesByLeg: {
      outbound: Array<{ airline: string; avgPrice: number }>;
      return: Array<{ airline: string; avgPrice: number }>;
    };
  };
}

export interface SmartMixedCarrierConfig {
  /** Minimum estimated savings to trigger search (percentage) */
  minEstimatedSavingsPercent: number;

  /** Minimum estimated savings to trigger search (amount) */
  minEstimatedSavingsAmount: number;

  /** Maximum API calls budget for mixed search */
  maxApiCalls: number;

  /** Enable auto-search (bypass includeSeparateTickets flag) */
  autoEnable: boolean;

  /** Cabin classes where auto-enable applies */
  autoEnableCabinClasses: string[];

  /** Cache one-way results (seconds) */
  oneWayCacheTTL: number;
}

const DEFAULT_CONFIG: SmartMixedCarrierConfig = {
  minEstimatedSavingsPercent: 5,      // 5% minimum savings
  minEstimatedSavingsAmount: 20,      // $20 minimum savings
  maxApiCalls: 2,                     // Max 2 additional API calls (1 per direction)
  autoEnable: true,                   // Auto-enable for eligible searches
  autoEnableCabinClasses: ['ECONOMY', 'PREMIUM_ECONOMY'], // Not for business/first
  oneWayCacheTTL: 1800,              // 30 minutes cache for one-way prices
};

// ============================================================================
// ZERO-COST HEURISTIC ANALYSIS
// ============================================================================

/**
 * Analyze round-trip search results to estimate mixed-carrier potential
 * WITHOUT making any additional API calls.
 *
 * Algorithm:
 * 1. Group round-trip prices by validating airline
 * 2. Find airlines that are cheapest for outbound vs return
 * 3. Estimate potential savings from mixing
 * 4. Decision threshold based on confidence
 */
export function analyzeRoundTripPricing(
  roundTripFlights: FlightOffer[]
): MixedCarrierAnalysis {
  if (!roundTripFlights || roundTripFlights.length === 0) {
    return {
      shouldSearch: false,
      confidence: 0,
      reason: 'No round-trip flights to analyze',
      analysis: {
        cheapestRoundTrip: 0,
        cheapestOutboundEstimate: 0,
        cheapestReturnEstimate: 0,
        combinedEstimate: 0,
        airlinePriceSpread: 0,
        topAirlinesByLeg: { outbound: [], return: [] },
      },
    };
  }

  // Get cheapest round-trip price
  const cheapestRoundTrip = Math.min(
    ...roundTripFlights.map(f => normalizePrice(f.price.total))
  );

  // Group by airline and analyze per-leg pricing
  const airlinePricing: Map<string, {
    outboundPrices: number[];
    returnPrices: number[];
    totalPrices: number[];
  }> = new Map();

  for (const flight of roundTripFlights) {
    const airline = flight.validatingAirlineCodes?.[0] ||
                    flight.itineraries[0]?.segments[0]?.carrierCode ||
                    'XX';

    const totalPrice = normalizePrice(flight.price.total);

    if (!airlinePricing.has(airline)) {
      airlinePricing.set(airline, {
        outboundPrices: [],
        returnPrices: [],
        totalPrices: [],
      });
    }

    const data = airlinePricing.get(airline)!;
    data.totalPrices.push(totalPrice);

    // Estimate per-leg price (simplified: assume symmetric for round-trip)
    // Real one-way prices may vary, but this gives us a heuristic
    if (flight.itineraries.length >= 2) {
      // For round-trips, we can estimate outbound/return split
      // Heuristic: Each leg is roughly 45-55% of total based on route characteristics
      const outboundDuration = parseDurationSafe(flight.itineraries[0]?.duration);
      const returnDuration = parseDurationSafe(flight.itineraries[1]?.duration);
      const totalDuration = outboundDuration + returnDuration;

      // Weight by duration (longer leg usually costs more)
      const outboundRatio = totalDuration > 0
        ? (outboundDuration / totalDuration) * 0.9 + 0.05 // Normalize to 0.45-0.55 range
        : 0.5;

      data.outboundPrices.push(totalPrice * outboundRatio);
      data.returnPrices.push(totalPrice * (1 - outboundRatio));
    }
  }

  // Find best airlines for each leg
  const airlineOutboundAvg: Array<{ airline: string; avgPrice: number }> = [];
  const airlineReturnAvg: Array<{ airline: string; avgPrice: number }> = [];

  airlinePricing.forEach((data, airline) => {
    if (data.outboundPrices.length > 0) {
      const outboundAvg = average(data.outboundPrices);
      const returnAvg = average(data.returnPrices);

      airlineOutboundAvg.push({ airline, avgPrice: outboundAvg });
      airlineReturnAvg.push({ airline, avgPrice: returnAvg });
    }
  });

  // Sort by price
  airlineOutboundAvg.sort((a, b) => a.avgPrice - b.avgPrice);
  airlineReturnAvg.sort((a, b) => a.avgPrice - b.avgPrice);

  // Calculate mixed-carrier estimate
  const cheapestOutboundEstimate = airlineOutboundAvg[0]?.avgPrice || 0;
  const cheapestReturnEstimate = airlineReturnAvg[0]?.avgPrice || 0;
  const combinedEstimate = cheapestOutboundEstimate + cheapestReturnEstimate;

  // Calculate price spread (indicator of market diversity)
  const allPrices = roundTripFlights.map(f => normalizePrice(f.price.total));
  const priceSpread = Math.max(...allPrices) - Math.min(...allPrices);
  const priceSpreadPercent = (priceSpread / cheapestRoundTrip) * 100;

  // Calculate estimated savings
  const estimatedSavingsAmount = cheapestRoundTrip - combinedEstimate;
  const estimatedSavingsPercent = (estimatedSavingsAmount / cheapestRoundTrip) * 100;

  // Decision logic
  let shouldSearch = false;
  let confidence = 0;
  let reason = '';

  // Case 1: Clear savings potential
  if (estimatedSavingsPercent >= 8 && estimatedSavingsAmount >= 30) {
    shouldSearch = true;
    confidence = 0.85;
    reason = `Strong savings potential: ~$${estimatedSavingsAmount.toFixed(0)} (${estimatedSavingsPercent.toFixed(0)}%)`;
  }
  // Case 2: Moderate savings with high price spread
  else if (estimatedSavingsPercent >= 5 && priceSpreadPercent >= 30) {
    shouldSearch = true;
    confidence = 0.7;
    reason = `Moderate savings with diverse pricing: ~$${estimatedSavingsAmount.toFixed(0)} (${estimatedSavingsPercent.toFixed(0)}%)`;
  }
  // Case 3: Different airlines are cheapest for different legs
  else if (
    airlineOutboundAvg.length >= 2 &&
    airlineReturnAvg.length >= 2 &&
    airlineOutboundAvg[0]?.airline !== airlineReturnAvg[0]?.airline
  ) {
    shouldSearch = true;
    confidence = 0.6;
    reason = `Different airlines optimal for each leg: ${airlineOutboundAvg[0]?.airline} out, ${airlineReturnAvg[0]?.airline} return`;
  }
  // Case 4: High price diversity suggests opportunity
  else if (priceSpreadPercent >= 50 && roundTripFlights.length >= 5) {
    shouldSearch = true;
    confidence = 0.5;
    reason = `High price diversity (${priceSpreadPercent.toFixed(0)}% spread) suggests opportunity`;
  }
  // No search needed
  else {
    shouldSearch = false;
    confidence = 0.8;
    reason = estimatedSavingsPercent < 3
      ? 'Minimal savings potential (prices already competitive)'
      : 'Same airline likely optimal for both legs';
  }

  return {
    shouldSearch,
    confidence,
    reason,
    estimatedSavings: shouldSearch ? {
      amount: Math.max(0, estimatedSavingsAmount),
      percentage: Math.max(0, estimatedSavingsPercent),
    } : undefined,
    analysis: {
      cheapestRoundTrip,
      cheapestOutboundEstimate,
      cheapestReturnEstimate,
      combinedEstimate,
      airlinePriceSpread: priceSpreadPercent,
      topAirlinesByLeg: {
        outbound: airlineOutboundAvg.slice(0, 3),
        return: airlineReturnAvg.slice(0, 3),
      },
    },
  };
}

// ============================================================================
// SMART SEARCH DECISION
// ============================================================================

/**
 * Decide whether to perform mixed-carrier search based on:
 * - Heuristic analysis (zero-cost)
 * - Search parameters (cabin class, etc.)
 * - Cached one-way data
 * - Configuration
 */
export async function shouldSearchMixedCarriers(
  roundTripFlights: FlightOffer[],
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    cabinClass?: string;
    includeSeparateTickets?: boolean;
  },
  config: Partial<SmartMixedCarrierConfig> = {}
): Promise<{
  should: boolean;
  reason: string;
  analysis?: MixedCarrierAnalysis;
  cachedOneWayData?: {
    outbound: FlightOffer[];
    return: FlightOffer[];
  };
}> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // User explicitly disabled
  if (searchParams.includeSeparateTickets === false) {
    return {
      should: false,
      reason: 'User explicitly disabled separate tickets',
    };
  }

  // User explicitly enabled - always search
  if (searchParams.includeSeparateTickets === true) {
    return {
      should: true,
      reason: 'User explicitly enabled separate tickets',
    };
  }

  // Auto-enable logic
  if (!cfg.autoEnable) {
    return {
      should: false,
      reason: 'Auto-enable disabled in configuration',
    };
  }

  // Check cabin class eligibility
  const cabinClass = searchParams.cabinClass?.toUpperCase() || 'ECONOMY';
  if (!cfg.autoEnableCabinClasses.includes(cabinClass)) {
    return {
      should: false,
      reason: `Auto-enable not active for ${cabinClass} cabin (loyalty programs more valuable)`,
    };
  }

  // Check for cached one-way data
  const outboundCacheKey = generateCacheKey('one-way-flights', {
    origin: searchParams.origin,
    destination: searchParams.destination,
    date: searchParams.departureDate,
  });
  const returnCacheKey = generateCacheKey('one-way-flights', {
    origin: searchParams.destination,
    destination: searchParams.origin,
    date: searchParams.returnDate,
  });

  const [cachedOutbound, cachedReturn] = await Promise.all([
    getCached<FlightOffer[]>(outboundCacheKey),
    getCached<FlightOffer[]>(returnCacheKey),
  ]);

  // If we have cached one-way data, always worth searching
  if (cachedOutbound && cachedReturn) {
    return {
      should: true,
      reason: 'Cached one-way data available',
      cachedOneWayData: {
        outbound: cachedOutbound,
        return: cachedReturn,
      },
    };
  }

  // Run heuristic analysis on round-trip data
  const analysis = analyzeRoundTripPricing(roundTripFlights);

  // Apply threshold checks
  if (!analysis.shouldSearch) {
    return {
      should: false,
      reason: analysis.reason,
      analysis,
    };
  }

  // Check minimum savings thresholds
  if (analysis.estimatedSavings) {
    if (analysis.estimatedSavings.percentage < cfg.minEstimatedSavingsPercent) {
      return {
        should: false,
        reason: `Estimated savings (${analysis.estimatedSavings.percentage.toFixed(1)}%) below threshold (${cfg.minEstimatedSavingsPercent}%)`,
        analysis,
      };
    }

    if (analysis.estimatedSavings.amount < cfg.minEstimatedSavingsAmount) {
      return {
        should: false,
        reason: `Estimated savings ($${analysis.estimatedSavings.amount.toFixed(0)}) below threshold ($${cfg.minEstimatedSavingsAmount})`,
        analysis,
      };
    }
  }

  return {
    should: true,
    reason: analysis.reason,
    analysis,
  };
}

// ============================================================================
// API-EFFICIENT SEARCH EXECUTION
// ============================================================================

export interface OneWaySearchFunction {
  (params: {
    origin: string;
    destination: string;
    date: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: string;
    nonStop?: boolean;
    maxResults?: number;
  }): Promise<FlightOffer[]>;
}

/**
 * Execute API-efficient one-way searches with caching
 */
export async function executeSmartOneWaySearches(
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: string;
    nonStop?: boolean;
  },
  searchFunction: OneWaySearchFunction,
  cachedData?: {
    outbound?: FlightOffer[];
    return?: FlightOffer[];
  },
  config: Partial<SmartMixedCarrierConfig> = {}
): Promise<{
  outboundFlights: FlightOffer[];
  returnFlights: FlightOffer[];
  fromCache: { outbound: boolean; return: boolean };
}> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Use cached data if available
  let outboundFlights = cachedData?.outbound || [];
  let returnFlights = cachedData?.return || [];
  let outboundFromCache = !!cachedData?.outbound;
  let returnFromCache = !!cachedData?.return;

  // Search for missing data in parallel
  const searches: Promise<void>[] = [];

  if (outboundFlights.length === 0) {
    searches.push(
      searchFunction({
        origin: searchParams.origin,
        destination: searchParams.destination,
        date: searchParams.departureDate,
        adults: searchParams.adults,
        children: searchParams.children,
        infants: searchParams.infants,
        cabinClass: searchParams.cabinClass,
        nonStop: searchParams.nonStop,
        maxResults: 30,
      }).then(async (flights) => {
        outboundFlights = flights;
        // Cache for future use
        const cacheKey = generateCacheKey('one-way-flights', {
          origin: searchParams.origin,
          destination: searchParams.destination,
          date: searchParams.departureDate,
        });
        await setCache(cacheKey, flights, cfg.oneWayCacheTTL).catch(() => {});
      })
    );
  }

  if (returnFlights.length === 0) {
    searches.push(
      searchFunction({
        origin: searchParams.destination,
        destination: searchParams.origin,
        date: searchParams.returnDate,
        adults: searchParams.adults,
        children: searchParams.children,
        infants: searchParams.infants,
        cabinClass: searchParams.cabinClass,
        nonStop: searchParams.nonStop,
        maxResults: 30,
      }).then(async (flights) => {
        returnFlights = flights;
        // Cache for future use
        const cacheKey = generateCacheKey('one-way-flights', {
          origin: searchParams.destination,
          destination: searchParams.origin,
          date: searchParams.returnDate,
        });
        await setCache(cacheKey, flights, cfg.oneWayCacheTTL).catch(() => {});
      })
    );
  }

  await Promise.allSettled(searches);

  return {
    outboundFlights,
    returnFlights,
    fromCache: {
      outbound: outboundFromCache,
      return: returnFromCache,
    },
  };
}

// ============================================================================
// UNIFIED PRICE-FIRST SORTING
// ============================================================================

/**
 * Merge traditional round-trips with mixed-carrier fares and sort by price
 * Mixed carriers appear FIRST if they're the cheapest option
 */
export function mergeAndSortByPrice(
  roundTripFlights: FlightOffer[],
  mixedCarrierFares: MixedCarrierFare[]
): FlightOffer[] {
  // Convert mixed fares to FlightOffer format
  const mixedFlightOffers = mixedCarrierFares.map(mixedFare => {
    const offer = mixedFareToFlightOffer(mixedFare);
    // Add sorting hint
    (offer as any)._mixedCarrierSortPriority = mixedFare.savings?.percentage || 0;
    return offer;
  });

  // Combine all flights
  const allFlights = [...roundTripFlights, ...mixedFlightOffers];

  // Sort by price (cheapest first)
  allFlights.sort((a, b) => {
    const priceA = normalizePrice(a.price.total);
    const priceB = normalizePrice(b.price.total);

    // Primary sort: by price
    if (priceA !== priceB) {
      return priceA - priceB;
    }

    // Secondary sort: traditional round-trips before mixed (safer option)
    const aIsMixed = 'isSeparateTickets' in a && (a as any).isSeparateTickets;
    const bIsMixed = 'isSeparateTickets' in b && (b as any).isSeparateTickets;

    if (aIsMixed !== bIsMixed) {
      return aIsMixed ? 1 : -1;
    }

    return 0;
  });

  return allFlights;
}

/**
 * Add "Absolute Cheapest" badge to the cheapest flight(s)
 */
export function addCheapestBadges(flights: FlightOffer[]): FlightOffer[] {
  if (flights.length === 0) return flights;

  const cheapestPrice = Math.min(...flights.map(f => normalizePrice(f.price.total)));

  return flights.map((flight, index) => {
    const price = normalizePrice(flight.price.total);
    const badges = [...(flight.badges || [])];

    // First flight gets "Cheapest" if it's the absolute cheapest
    if (index === 0 && price === cheapestPrice) {
      if (!badges.some(b =>
        typeof b === 'string' ? b === 'Lowest Price' : b.text === 'Lowest Price'
      )) {
        badges.unshift({
          type: 'cheapest-overall',
          text: 'Cheapest',
          color: 'green',
          icon: 'dollar-sign',
        } as any);
      }
    }

    // Mixed carrier savings badge
    if ('isSeparateTickets' in flight && (flight as any).isSeparateTickets) {
      const details = (flight as any).separateTicketDetails as MixedCarrierFare;
      if (details?.savings && details.savings.percentage >= 5) {
        badges.push({
          type: 'mixed-savings',
          text: `Save ${details.savings.percentage.toFixed(0)}% with Separate Tickets`,
          color: 'orange',
          icon: 'scissors',
        } as any);
      }
    }

    return { ...flight, badges };
  });
}

// ============================================================================
// COMPLETE OPTIMIZED WORKFLOW
// ============================================================================

export interface SmartMixedCarrierResult {
  /** All flights merged and sorted */
  flights: FlightOffer[];

  /** Mixed carrier fares found */
  mixedFares: MixedCarrierFare[];

  /** Whether mixed search was performed */
  mixedSearchPerformed: boolean;

  /** Reason for mixed search decision */
  mixedSearchReason: string;

  /** Analysis results */
  analysis?: MixedCarrierAnalysis;

  /** Statistics */
  stats: {
    totalRoundTrips: number;
    totalMixedFares: number;
    cheapestRoundTrip: number | null;
    cheapestMixed: number | null;
    bestSavings: { amount: number; percentage: number } | null;
    apiCallsSaved: number;
  };
}

/**
 * Complete optimized mixed-carrier search workflow
 *
 * Flow:
 * 1. Analyze round-trip results (zero cost)
 * 2. Decide if mixed search is worth it
 * 3. Execute API-efficient search if needed
 * 4. Combine and rank results
 * 5. Sort with cheapest first
 */
export async function smartMixedCarrierSearch(
  roundTripFlights: FlightOffer[],
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: string;
    nonStop?: boolean;
    includeSeparateTickets?: boolean;
  },
  searchFunction: OneWaySearchFunction,
  config: Partial<SmartMixedCarrierConfig> = {}
): Promise<SmartMixedCarrierResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const inputFlightCount = roundTripFlights.length; // 🛡️ Track input count

  console.log(`   🔬 smartMixedCarrierSearch: Received ${inputFlightCount} round-trip flights`);

  // Step 1: Determine if we should search
  const decision = await shouldSearchMixedCarriers(
    roundTripFlights,
    searchParams,
    cfg
  );

  console.log(`🔍 Smart Mixed-Carrier Decision: ${decision.should ? 'SEARCH' : 'SKIP'} - ${decision.reason}`);
  if (decision.analysis) {
    console.log(`   📊 Analysis: ${decision.analysis.analysis.topAirlinesByLeg.outbound.slice(0, 2).map(a => `${a.airline}: $${a.avgPrice.toFixed(0)}`).join(', ')} (outbound)`);
    console.log(`   📊 Analysis: ${decision.analysis.analysis.topAirlinesByLeg.return.slice(0, 2).map(a => `${a.airline}: $${a.avgPrice.toFixed(0)}`).join(', ')} (return)`);
  }

  // Calculate cheapest round-trip
  const cheapestRoundTrip = roundTripFlights.length > 0
    ? Math.min(...roundTripFlights.map(f => normalizePrice(f.price.total)))
    : null;

  // If no search needed, return round-trips only
  if (!decision.should) {
    console.log(`   🔬 SKIP path: Returning original ${inputFlightCount} round-trip flights unchanged`);
    return {
      flights: roundTripFlights,
      mixedFares: [],
      mixedSearchPerformed: false,
      mixedSearchReason: decision.reason,
      analysis: decision.analysis,
      stats: {
        totalRoundTrips: inputFlightCount,
        totalMixedFares: 0,
        cheapestRoundTrip,
        cheapestMixed: null,
        bestSavings: null,
        apiCallsSaved: 4, // Would have made 4 API calls
      },
    };
  }

  // Step 2: Execute one-way searches
  console.log(`🎫 Executing smart one-way searches...`);

  const { outboundFlights, returnFlights, fromCache } = await executeSmartOneWaySearches(
    searchParams,
    searchFunction,
    decision.cachedOneWayData,
    cfg
  );

  console.log(`   📤 Outbound: ${outboundFlights.length} flights ${fromCache.outbound ? '(cached)' : '(fresh)'}`);
  console.log(`   📥 Return: ${returnFlights.length} flights ${fromCache.return ? '(cached)' : '(fresh)'}`);

  // Log source breakdown for debugging
  const countBySource = (flights: FlightOffer[]) => {
    const duffel = flights.filter(f => (f as any).source === 'Duffel' || f.id?.startsWith('off_')).length;
    const amadeus = flights.length - duffel;
    return { duffel, amadeus };
  };
  const outSrc = countBySource(outboundFlights);
  const retSrc = countBySource(returnFlights);
  console.log(`   🔎 Sources: Outbound(Duffel:${outSrc.duffel}, Amadeus:${outSrc.amadeus}) Return(Duffel:${retSrc.duffel}, Amadeus:${retSrc.amadeus})`);

  // Step 3: Combine fares (cross-provider supported)
  let mixedFares: MixedCarrierFare[] = [];

  if (outboundFlights.length > 0 && returnFlights.length > 0) {
    mixedFares = combineMixedCarrierFares(
      outboundFlights,
      returnFlights,
      cheapestRoundTrip || undefined,
      {
        maxCombinations: 15,
        minSavingsPercent: 0, // Show all, let sorting handle it
        includeSameAirline: true,
      }
    );

    // Rank mixed fares vs traditional
    if (roundTripFlights.length > 0) {
      mixedFares = rankMixedFares(mixedFares, roundTripFlights);
    }
  }

  console.log(`   ✨ Combined ${mixedFares.length} mixed-carrier fares`);

  // Step 4: Merge and sort
  console.log(`   🔬 MERGE: ${inputFlightCount} round-trips + ${mixedFares.length} mixed fares`);
  const mergedFlights = mergeAndSortByPrice(roundTripFlights, mixedFares);
  console.log(`   🔬 After merge: ${mergedFlights.length} total flights`);

  const badgedFlights = addCheapestBadges(mergedFlights);
  console.log(`   🔬 After badges: ${badgedFlights.length} total flights`);

  // 🛡️ SAFETY CHECK: Verify we haven't lost any flights
  if (badgedFlights.length < inputFlightCount) {
    console.error(`   🚨 INTERNAL ERROR: Merge produced ${badgedFlights.length} flights but received ${inputFlightCount} round-trips!`);
    console.error(`   🚨 This indicates a bug in mergeAndSortByPrice or addCheapestBadges`);
    // Return original flights + any valid mixed fares to prevent data loss
    console.log(`   🛡️ RECOVERY: Returning original ${inputFlightCount} round-trips`);
    return {
      flights: roundTripFlights,
      mixedFares: [],
      mixedSearchPerformed: true,
      mixedSearchReason: `${decision.reason} (RECOVERY: merge error)`,
      analysis: decision.analysis,
      stats: {
        totalRoundTrips: inputFlightCount,
        totalMixedFares: 0,
        cheapestRoundTrip,
        cheapestMixed: null,
        bestSavings: null,
        apiCallsSaved: 0,
      },
    };
  }

  // Calculate stats
  const cheapestMixed = mixedFares.length > 0
    ? Math.min(...mixedFares.map(f => f.combinedPrice.total))
    : null;

  const bestSavings = mixedFares.length > 0 && mixedFares[0].savings
    ? { amount: mixedFares[0].savings.amount, percentage: mixedFares[0].savings.percentage }
    : null;

  const apiCallsSaved = (fromCache.outbound ? 2 : 0) + (fromCache.return ? 2 : 0);

  if (bestSavings && bestSavings.amount > 0) {
    console.log(`   💸 Best savings: $${bestSavings.amount.toFixed(0)} (${bestSavings.percentage.toFixed(0)}%)`);
  }

  console.log(`   🔬 SEARCH path: Returning ${badgedFlights.length} flights (${inputFlightCount} round-trips + ${mixedFares.length} mixed)`);

  return {
    flights: badgedFlights,
    mixedFares,
    mixedSearchPerformed: true,
    mixedSearchReason: decision.reason,
    analysis: decision.analysis,
    stats: {
      totalRoundTrips: inputFlightCount,
      totalMixedFares: mixedFares.length,
      cheapestRoundTrip,
      cheapestMixed,
      bestSavings,
      apiCallsSaved,
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function parseDurationSafe(duration?: string): number {
  if (!duration) return 0;
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = duration.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');
  return hours * 60 + minutes;
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}
