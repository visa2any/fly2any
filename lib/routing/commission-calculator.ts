/**
 * Airline Commission Calculator
 *
 * Calculates commission for consolidator bookings and determines
 * optimal routing channel (Consolidator vs Duffel).
 *
 * Decision Rule: If commission > $5 → Consolidator; else → Duffel
 */

import { getPrismaClient } from '@/lib/prisma';
import type { CabinClass, RoutingChannel } from '@prisma/client';

// LCC airlines that are Duffel-only (no consolidator support)
const LCC_AIRLINES = new Set([
  'NK', // Spirit
  'F9', // Frontier
  'G4', // Allegiant
  'WN', // Southwest
  'B6', // JetBlue (some routes)
  'VY', // Vueling
  'FR', // Ryanair
  'U2', // easyJet
  'W6', // Wizz Air
]);

// ============================================================
// PERFORMANCE CACHES (In-memory, short TTL)
// ============================================================

// Cache for LCC status (airlineCode -> { isLCC: boolean, timestamp: number })
const lccAirlineCache = new Map<string, { isLCC: boolean, timestamp: number }>();

// Cache for exclusion checks (hash(params) -> { result: string | null, timestamp: number })
const exclusionResultCache = new Map<string, { result: string | null, timestamp: number }>();

// Cache for raw DB exclusions (airlineCode -> { exclusions: any[], timestamp: number })
const exclusionDbCache = new Map<string, { exclusions: any[], timestamp: number }>();

// Coalescing map for concurrent exclusion DB lookups (airlineCode -> Promise)
const pendingExclusionLookups = new Map<string, Promise<any[]>>();

// Coalescing map for concurrent lookups (airlineCode -> Promise)
const pendingCommissionLookups = new Map<string, Promise<CommissionLookupResult | null>>();

const CACHE_TTL = 30000; // 30 seconds

// ============================================================
// ROUTING THRESHOLDS & COST CONFIGURATION
// ============================================================

// Price threshold: Flights under this amount → Duffel (ancillary opportunity)
// Flights at or above this amount → Consolidator (if commission available)
const DUFFEL_PRICE_THRESHOLD = 500.0; // $500

// Minimum commission threshold (legacy - kept for backwards compatibility)
const MIN_COMMISSION_THRESHOLD = 5.0; // $5

// ============================================================
// DUFFEL COST STRUCTURE (Per Duffel Pricing)
// ============================================================
const DUFFEL_PER_ORDER_FEE = 3.0;           // $3 per booking
const DUFFEL_MANAGED_CONTENT_PCT = 1.0;      // 1% of order value
const DUFFEL_PAYMENT_PROCESSING_PCT = 2.9;   // 2.9% card processing (international)
const DUFFEL_TOTAL_VARIABLE_PCT = 3.9;       // 1% + 2.9% = 3.9%

// Legacy alias
const DUFFEL_PROCESSING_FEE_PCT = DUFFEL_TOTAL_VARIABLE_PCT;

// ============================================================
// CONSOLIDATOR COST STRUCTURE
// ============================================================
const CONSOLIDATOR_FLAT_FEE = 5.0; // $5 flat fee per booking (regardless of price)

// Default markup percentage for profit calculation
const DEFAULT_MARKUP_PCT = 7.0; // 7% (increased from 3% to cover Duffel costs)

export interface CommissionResult {
  hasCommission: boolean;
  commissionPct: number;
  commissionAmount: number;
  isExcluded: boolean;
  exclusionReason?: string;
  routingChannel: RoutingChannel;
  estimatedProfit: number;
  duffelProfit: number;
  consolidatorProfit: number;
  decisionReason: string;
  tourCode?: string;
  ticketDesignator?: string;
}

export interface FlightSegment {
  airlineCode: string;
  origin: string;
  destination: string;
  departureDate: Date;
  cabinClass: CabinClass;
  fareClass?: string;
  fareBasisCode?: string;
  operatingCarrier?: string;
  marketingCarrier?: string;
}

export interface CommissionInput {
  segments: FlightSegment[];
  baseFare: number;
  totalFare: number;
  currency?: string;
  passengerType?: 'ADT' | 'CHD' | 'INF';
  passengerCount?: number;
  isGroupBooking?: boolean;
  bookingChannel?: 'GDS' | 'NDC' | 'NDC_DIRECT';
}

/**
 * Calculate commission and determine routing channel for a flight offer
 */
export async function calculateCommission(input: CommissionInput): Promise<CommissionResult> {
  const { segments, baseFare, totalFare, currency = 'USD' } = input;

  // Get the primary (marketing) airline from the first segment
  const primaryAirline = segments[0]?.marketingCarrier || segments[0]?.airlineCode;
  const origin = segments[0]?.origin;
  const destination = segments[segments.length - 1]?.destination;
  const departureDate = segments[0]?.departureDate;
  const cabinClass = segments[0]?.cabinClass;
  const fareClass = segments[0]?.fareClass;
  const fareBasisCode = segments[0]?.fareBasisCode;

  // 1. Check if LCC (Duffel-only)
  if (await isLCCAirline(primaryAirline)) {
    const duffelProfit = calculateDuffelProfit(baseFare);
    return {
      hasCommission: false,
      commissionPct: 0,
      commissionAmount: 0,
      isExcluded: false,
      routingChannel: 'DUFFEL',
      estimatedProfit: duffelProfit,
      duffelProfit,
      consolidatorProfit: -5, // Flat fee with no commission
      decisionReason: 'lcc_airline',
    };
  }

  // 2. Check universal exclusions
  const exclusion = await checkExclusions(primaryAirline, fareBasisCode, fareClass, input);
  if (exclusion) {
    const duffelProfit = calculateDuffelProfit(baseFare);
    return {
      hasCommission: false,
      commissionPct: 0,
      commissionAmount: 0,
      isExcluded: true,
      exclusionReason: exclusion,
      routingChannel: 'DUFFEL',
      estimatedProfit: duffelProfit,
      duffelProfit,
      consolidatorProfit: -5,
      decisionReason: 'fare_excluded',
    };
  }

  // 3. Look up commission from database
  const commission = await lookupCommission(
    primaryAirline,
    origin,
    destination,
    fareClass,
    fareBasisCode,
    departureDate,
    cabinClass,
    input.bookingChannel
  );

  // 4. Calculate profits for both channels
  const duffelProfit = calculateDuffelProfit(baseFare);

  if (!commission) {
    // No commission contract → Consolidator has no benefit (just $5 cost, 0 revenue)
    const consolidatorProfit = -CONSOLIDATOR_FLAT_FEE; // -$5

    // Without commission, ALWAYS route to Duffel (ancillary opportunity)
    return {
      hasCommission: false,
      commissionPct: 0,
      commissionAmount: 0,
      isExcluded: false,
      routingChannel: 'DUFFEL',
      estimatedProfit: duffelProfit,
      duffelProfit,
      consolidatorProfit,
      decisionReason: 'no_commission_always_duffel',
    };
  }

  // 5. Calculate commission amount
  const commissionAmount = baseFare * (commission.commissionPct / 100);
  const consolidatorProfit = commissionAmount - CONSOLIDATOR_FLAT_FEE; // Minus $5 flat fee

  // ============================================================
  // 6. NEW ROUTING DECISION LOGIC ($500 THRESHOLD)
  // ============================================================
  //
  // RULE 1: Flights < $500 → DUFFEL (ancillary profit opportunity)
  // RULE 2: Flights >= $500 WITH commission → CONSOLIDATOR (flat $5 fee)
  // RULE 3: Flights >= $500 WITHOUT commission → DUFFEL (no benefit from consolidator)
  //
  let routingChannel: RoutingChannel;
  let decisionReason: string;
  let estimatedProfit: number;

  if (totalFare < DUFFEL_PRICE_THRESHOLD) {
    // RULE 1: Under $500 → Always Duffel (ancillary opportunity)
    routingChannel = 'DUFFEL';
    estimatedProfit = duffelProfit;
    decisionReason = 'under_500_duffel_ancillary_opportunity';
  } else if (commission.commissionPct > 0) {
    // RULE 2: $500+ with commission → Consolidator (flat $5 beats Duffel's 3.9%)
    routingChannel = 'CONSOLIDATOR';
    estimatedProfit = consolidatorProfit;
    decisionReason = 'over_500_has_commission';
  } else {
    // RULE 3: $500+ without commission → Duffel (no consolidator benefit)
    routingChannel = 'DUFFEL';
    estimatedProfit = duffelProfit;
    decisionReason = 'over_500_no_commission';
  }

  return {
    hasCommission: true,
    commissionPct: commission.commissionPct,
    commissionAmount,
    isExcluded: false,
    routingChannel,
    estimatedProfit,
    duffelProfit,
    consolidatorProfit,
    decisionReason,
    tourCode: commission.tourCode,
    ticketDesignator: commission.ticketDesignator,
  };
}

/**
 * Check if airline is LCC (Duffel-only)
 */
async function isLCCAirline(airlineCode: string): Promise<boolean> {
  // 1. First check in-memory set for common LCCs
  if (LCC_AIRLINES.has(airlineCode)) {
    return true;
  }

  // 2. Check local in-memory cache
  const now = Date.now();
  const cached = lccAirlineCache.get(airlineCode);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.isLCC;
  }

  // 3. Fallback to database
  try {
    const prisma = getPrismaClient();
    const lcc = await prisma.lCCAirline.findUnique({
      where: { airlineCode },
    });

    const isLCC = lcc?.isActive ?? false;

    // Store in cache
    lccAirlineCache.set(airlineCode, { isLCC, timestamp: now });

    return isLCC;
  } catch (err) {
    console.error(`[Routing] Failed to check LCC status for ${airlineCode}:`, err);
    return false; // Default to non-LCC on error to allow consolidator attempt
  }
}

/**
 * Check fare exclusions (Basic Economy, groups, net fares, etc.)
 */
async function checkExclusions(
  airlineCode: string,
  fareBasisCode?: string,
  fareClass?: string,
  input?: CommissionInput
): Promise<string | null> {
  // Construct a cache key based on params that affect exclusions
  const cacheKey = `${airlineCode}:${fareBasisCode || ''}:${fareClass || ''}:${input?.isGroupBooking}:${input?.passengerCount}:${input?.passengerType}`;

  const now = Date.now();
  const cached = exclusionResultCache.get(cacheKey);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.result;
  }

  // Helper to store and return result
  const setAndReturn = (result: string | null) => {
    exclusionResultCache.set(cacheKey, { result, timestamp: now });
    return result;
  };

  // 1. Check Basic Economy (7th character = B)
  if (fareBasisCode && fareBasisCode.length >= 7 && fareBasisCode[6] === 'B') {
    return setAndReturn('Basic Economy fare (7th char B)');
  }

  // 2. Check group booking
  if (input?.isGroupBooking || (input?.passengerCount && input.passengerCount >= 10)) {
    return setAndReturn('Group booking (10+ passengers)');
  }

  // 3. Check infant fare
  if (input?.passengerType === 'INF') {
    return setAndReturn('Infant fare');
  }

  // 4. Check database exclusions
  try {
    let exclusions: any[] = [];
    const pendingDb = pendingExclusionLookups.get(airlineCode);

    if (pendingDb) {
      exclusions = await pendingDb;
    } else {
      const dbCached = exclusionDbCache.get(airlineCode);
      if (dbCached && (now - dbCached.timestamp < CACHE_TTL)) {
        exclusions = dbCached.exclusions;
      } else {
        const lookupPromise = (async () => {
          const prisma = getPrismaClient();
          const dbExclusions = await prisma.airlineCommissionExclusion.findMany({
            where: {
              isActive: true,
              OR: [
                { airlineCode: null }, // Universal exclusions
                { airlineCode }, // Airline-specific exclusions
              ],
            },
          });
          exclusionDbCache.set(airlineCode, { exclusions: dbExclusions, timestamp: Date.now() });
          return dbExclusions;
        })();
        
        pendingExclusionLookups.set(airlineCode, lookupPromise);
        exclusions = await lookupPromise;
        pendingExclusionLookups.delete(airlineCode);
      }
    }

    for (const exclusion of exclusions) {
      // Check fare basis pattern
      if (exclusion.fareBasisPattern && fareBasisCode) {
        const regex = new RegExp(exclusion.fareBasisPattern);
        if (regex.test(fareBasisCode)) {
          return setAndReturn(exclusion.description);
        }
      }

      // Check fare basis rule (e.g., "7th_char_B")
      if (exclusion.fareBasisRule && fareBasisCode) {
        if (exclusion.fareBasisRule === '7th_char_B' && fareBasisCode.length >= 7 && fareBasisCode[6] === 'B') {
          return setAndReturn(exclusion.description);
        }
      }

      // Check excluded booking codes
      if (exclusion.excludedBookingCodes.length > 0 && fareClass) {
        if (exclusion.excludedBookingCodes.includes(fareClass)) {
          return setAndReturn(exclusion.description);
        }
      }

      // Check excluded fare families
      if (exclusion.excludedFareFamilies.length > 0 && fareBasisCode) {
        for (const family of exclusion.excludedFareFamilies) {
          if (fareBasisCode.toUpperCase().includes(family.toUpperCase())) {
            return setAndReturn(exclusion.description);
          }
        }
      }
    }
  } catch (err) {
    console.error(`[Routing] Failed to check database exclusions for ${airlineCode}:`, err);
    // On error, we continue without database exclusions to avoid blocking search
  }

  return setAndReturn(null);
}

interface CommissionLookupResult {
  commissionPct: number;
  tourCode?: string;
  ticketDesignator?: string;
}

/**
 * In-memory cache for airline contracts to avoid redundant DB hits during a single search
 */
const contractCache = new Map<string, { data: any; timestamp: number }>();
const CONTRACT_CACHE_TTL = 30000; // 30 seconds (short enough for search consistency)

/**
 * Look up commission rate from database with caching
 */
async function lookupCommission(
  airlineCode: string,
  origin: string,
  destination: string,
  fareClass?: string,
  fareBasisCode?: string,
  travelDate?: Date,
  cabinClass?: CabinClass,
  bookingChannel?: 'GDS' | 'NDC' | 'NDC_DIRECT'
): Promise<CommissionLookupResult | null> {
  // 1. Check if there's already a pending lookup for this airline to coalesce requests
  const pending = pendingCommissionLookups.get(airlineCode);
  if (pending) {
    return pending.then(contract => {
      if (!contract) return null;
      return processContract(contract, airlineCode, origin, destination, fareClass, cabinClass, travelDate, bookingChannel);
    });
  }

  // 2. Perform or wait for the lookup
  const lookupPromise = (async () => {
    try {
      const now = new Date();
      const prisma = getPrismaClient();

      // Check Cache
      const cached = contractCache.get(airlineCode);
      if (cached && (now.getTime() - cached.timestamp < CONTRACT_CACHE_TTL)) {
        return cached.data;
      }

      // Database lookup
      const contract = await prisma.airlineContract.findFirst({
        where: {
          airlineCode,
          isActive: true,
          validFrom: { lte: now },
          validTo: { gte: now },
          // Note: channel restrictions are handled in processContract
        },
        include: {
          routes: {
            include: {
              fareClasses: true,
            },
            orderBy: {
              priority: 'desc',
            },
          },
        },
      });

      // Update cache
      contractCache.set(airlineCode, { data: contract, timestamp: now.getTime() });
      return contract;
    } finally {
      // Remove from pending map once complete
      pendingCommissionLookups.delete(airlineCode);
    }
  })();

  // Store in pending map
  pendingCommissionLookups.set(airlineCode, lookupPromise);

  const contract = await lookupPromise;
  if (!contract) return null;

  return processContract(contract, airlineCode, origin, destination, fareClass, cabinClass, travelDate, bookingChannel);
}

/**
 * Helper to process a contract and find matching commission
 * Extracted from lookupCommission to support coalescing
 */
function processContract(
  contract: any,
  airlineCode: string,
  origin: string,
  destination: string,
  fareClass?: string,
  cabinClass?: CabinClass,
  travelDate?: Date,
  bookingChannel?: 'GDS' | 'NDC' | 'NDC_DIRECT'
): CommissionLookupResult | null {
  // Validate channel restrictions
  if (bookingChannel === 'GDS' && !contract.gdsAllowed) return null;
  if (bookingChannel === 'NDC' && !contract.ndcAllowed) return null;
  if (bookingChannel === 'NDC_DIRECT' && !contract.ndcDirectAllowed) return null;

  // Find matching route
  const matchingRoute = findMatchingRoute(contract.routes, origin, destination, travelDate);

  if (!matchingRoute) {
    return {
      commissionPct: 5.0,
      tourCode: contract.tourCode || undefined,
      ticketDesignator: contract.ticketDesignator || undefined,
    };
  }

  // Find matching fare class within the route
  const matchingFareClass = findMatchingFareClass(
    matchingRoute.fareClasses,
    fareClass,
    cabinClass,
    travelDate
  );

  if (!matchingFareClass) {
    return {
      commissionPct: 5.0,
      tourCode: matchingRoute.tourCodeOverride || contract.tourCode || undefined,
      ticketDesignator: contract.ticketDesignator || undefined,
    };
  }

  // Determine season and get appropriate rate
  const commissionPct = getSeasonalRate(matchingFareClass, travelDate);

  return {
    commissionPct,
    tourCode: matchingRoute.tourCodeOverride || contract.tourCode || undefined,
    ticketDesignator: contract.ticketDesignator || undefined,
  };
}

/**
 * Find matching route based on origin/destination
 */
function findMatchingRoute(
  routes: any[],
  origin: string,
  destination: string,
  travelDate?: Date
): any | null {
  for (const route of routes) {
    // Check validity period
    if (route.validFrom && travelDate && travelDate < route.validFrom) continue;
    if (route.validTo && travelDate && travelDate > route.validTo) continue;

    // Check origin match
    const originMatch = matchLocation(
      route.originType,
      route.originCodes,
      route.originExclusions,
      origin
    );

    // Check destination match
    const destMatch = matchLocation(
      route.destinationType,
      route.destinationCodes,
      route.destinationExclusions,
      destination
    );

    if (originMatch && destMatch) {
      return route;
    }

    // Check bidirectional (reverse direction)
    if (route.bidirectional) {
      const reverseOriginMatch = matchLocation(
        route.destinationType,
        route.destinationCodes,
        route.destinationExclusions,
        origin
      );
      const reverseDestMatch = matchLocation(
        route.originType,
        route.originCodes,
        route.originExclusions,
        destination
      );

      if (reverseOriginMatch && reverseDestMatch) {
        return route;
      }
    }
  }

  return null;
}

/**
 * Match location against route patterns
 */
function matchLocation(
  locationType: string,
  codes: string[],
  exclusions: string[],
  location: string
): boolean {
  // Check exclusions first
  if (exclusions.includes(location)) {
    return false;
  }

  // ANY type matches everything
  if (locationType === 'ANY') {
    return true;
  }

  // AIRPORT type - exact match
  if (locationType === 'AIRPORT') {
    return codes.includes(location);
  }

  // COUNTRY type - match country code (first 2 chars or lookup)
  if (locationType === 'COUNTRY') {
    // For now, simple check. In production, use airport-to-country lookup
    return codes.some(code => location.startsWith(code) || code === getCountryForAirport(location));
  }

  // REGION type - check if airport is in region
  if (locationType === 'REGION') {
    const region = getRegionForAirport(location);
    return codes.includes(region);
  }

  // MARKET type - check custom market definition
  if (locationType === 'MARKET') {
    // Would need to query GeographicMarket table
    return codes.some(code => isAirportInMarket(location, code));
  }

  return false;
}

/**
 * Find matching fare class configuration
 */
function findMatchingFareClass(
  fareClasses: any[],
  fareClass?: string,
  cabinClass?: CabinClass,
  travelDate?: Date
): any | null {
  if (!fareClasses.length) return null;

  // Try to find exact fare class match
  if (fareClass) {
    const exactMatch = fareClasses.find(fc => fc.bookingCodes.includes(fareClass));
    if (exactMatch) {
      // Check blackout dates
      if (!isBlackoutDate(exactMatch.blackoutDates, travelDate)) {
        return exactMatch;
      }
    }
  }

  // Fall back to cabin class match
  if (cabinClass) {
    const cabinMatch = fareClasses.find(fc => fc.cabinClass === cabinClass);
    if (cabinMatch && !isBlackoutDate(cabinMatch.blackoutDates, travelDate)) {
      return cabinMatch;
    }
  }

  // Return first non-blackout fare class
  return fareClasses.find(fc => !isBlackoutDate(fc.blackoutDates, travelDate)) || null;
}

/**
 * Check if date falls within blackout period
 */
function isBlackoutDate(blackoutDates: any, travelDate?: Date): boolean {
  if (!blackoutDates || !travelDate) return false;

  const dates = blackoutDates as Array<{ start: string; end: string }>;
  const travel = travelDate.getTime();

  for (const period of dates) {
    const start = new Date(period.start).getTime();
    const end = new Date(period.end).getTime();
    if (travel >= start && travel <= end) {
      return true;
    }
  }

  return false;
}

/**
 * Get commission rate based on travel season
 */
function getSeasonalRate(fareClass: any, travelDate?: Date): number {
  if (!travelDate) {
    return fareClass.defaultPct;
  }

  const month = travelDate.getMonth() + 1; // 1-12
  const day = travelDate.getDate();
  const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // Check each season
  if (isInSeasonRange(fareClass.peakSeasonDates, mmdd) && fareClass.peakSeasonPct !== null) {
    return fareClass.peakSeasonPct;
  }
  if (isInSeasonRange(fareClass.highSeasonDates, mmdd) && fareClass.highSeasonPct !== null) {
    return fareClass.highSeasonPct;
  }
  if (isInSeasonRange(fareClass.shoulderSeasonDates, mmdd) && fareClass.shoulderSeasonPct !== null) {
    return fareClass.shoulderSeasonPct;
  }
  if (isInSeasonRange(fareClass.lowSeasonDates, mmdd) && fareClass.lowSeasonPct !== null) {
    return fareClass.lowSeasonPct;
  }

  return fareClass.defaultPct;
}

/**
 * Check if MM-DD falls within season date ranges
 */
function isInSeasonRange(seasonDates: any, mmdd: string): boolean {
  if (!seasonDates) return false;

  const ranges = seasonDates as Array<{ start: string; end: string }>;

  for (const range of ranges) {
    if (mmdd >= range.start && mmdd <= range.end) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate profit if booking via Duffel
 *
 * Duffel Cost Structure:
 * - $3 per order fee
 * - 1% managed content fee
 * - 2.9% payment processing (international cards)
 * = Total: $3 + 3.9% of fare
 *
 * Our Profit = Markup - Duffel Costs
 *
 * Example: $300 flight with 7% markup
 * - Markup revenue: $300 × 7% = $21
 * - Duffel costs: $3 + ($300 × 3.9%) = $3 + $11.70 = $14.70
 * - Profit: $21 - $14.70 = $6.30
 *
 * PLUS: Ancillary profit opportunity (bags, seats, CFAR = 25-29% markup)
 */
function calculateDuffelProfit(totalFare: number, markupPct: number = DEFAULT_MARKUP_PCT): number {
  // Our markup revenue
  const markupRevenue = totalFare * (markupPct / 100);

  // Duffel costs: $3 flat + 3.9% variable
  const duffelCosts = DUFFEL_PER_ORDER_FEE + (totalFare * (DUFFEL_TOTAL_VARIABLE_PCT / 100));

  // Net profit (before ancillaries)
  return markupRevenue - duffelCosts;
}

/**
 * Calculate total Duffel costs for a given fare
 */
export function calculateDuffelCosts(totalFare: number): {
  perOrderFee: number;
  managedContentFee: number;
  paymentProcessingFee: number;
  totalCost: number;
} {
  const managedContentFee = totalFare * (DUFFEL_MANAGED_CONTENT_PCT / 100);
  const paymentProcessingFee = totalFare * (DUFFEL_PAYMENT_PROCESSING_PCT / 100);

  return {
    perOrderFee: DUFFEL_PER_ORDER_FEE,
    managedContentFee,
    paymentProcessingFee,
    totalCost: DUFFEL_PER_ORDER_FEE + managedContentFee + paymentProcessingFee,
  };
}

// Helper functions (simplified - would need proper data in production)
function getCountryForAirport(airportCode: string): string {
  // Simplified mapping - in production, use proper airport database
  const usAirports = ['JFK', 'LAX', 'ORD', 'DFW', 'ATL', 'SFO', 'MIA', 'BOS', 'SEA', 'EWR', 'IAD', 'IAH'];
  if (usAirports.includes(airportCode)) return 'US';

  const caAirports = ['YYZ', 'YVR', 'YUL', 'YYC'];
  if (caAirports.includes(airportCode)) return 'CA';

  return '';
}

function getRegionForAirport(airportCode: string): string {
  // Simplified - would use proper geographic data
  const usAirports = ['JFK', 'LAX', 'ORD', 'DFW', 'ATL', 'SFO', 'MIA', 'BOS', 'SEA', 'EWR', 'IAD', 'IAH'];
  if (usAirports.includes(airportCode)) return 'NORTH_AMERICA';

  return '';
}

function isAirportInMarket(airportCode: string, marketCode: string): boolean {
  // Would query GeographicMarket table
  return false;
}

/**
 * Batch calculate commissions for multiple offers
 */
export async function calculateCommissionBatch(
  offers: CommissionInput[]
): Promise<CommissionResult[]> {
  return Promise.all(offers.map(offer => calculateCommission(offer)));
}

/**
 * Log routing decision for analytics
 */
export async function logRoutingDecision(
  input: CommissionInput,
  result: CommissionResult,
  searchId?: string,
  offerId?: string
): Promise<void> {
  const segment = input.segments[0];
  const prisma = getPrismaClient();

  await prisma.routingDecision.create({
    data: {
      searchId,
      offerId: offerId || 'unknown',
      airlineCode: segment?.airlineCode || 'XX',
      origin: segment?.origin || '',
      destination: input.segments[input.segments.length - 1]?.destination || '',
      departureDate: segment?.departureDate || new Date(),
      cabinClass: segment?.cabinClass || 'ECONOMY',
      fareClass: segment?.fareClass,
      fareBasisCode: segment?.fareBasisCode,
      baseFare: input.baseFare,
      totalFare: input.totalFare,
      currency: input.currency || 'USD',
      commissionPct: result.commissionPct,
      commissionAmount: result.commissionAmount,
      isExcluded: result.isExcluded,
      exclusionReason: result.exclusionReason,
      routingChannel: result.routingChannel,
      estimatedProfit: result.estimatedProfit,
      decisionReason: result.decisionReason,
      duffelProfit: result.duffelProfit,
      consolidatorProfit: result.consolidatorProfit,
    },
  });
}
