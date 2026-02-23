import { FlightOffer, ScoredFlight } from './scoring';
import { normalizePrice, type FlightOffer as TypedFlightOffer } from './types';
import { getRoutingEngine, type FlightSegment as RoutingFlightSegment } from '@/lib/routing';
import { CabinClass, RoutingChannel } from '@prisma/client';

/**
 * Generate date range for flexible dates
 */
export function generateFlexibleDateRange(baseDate: string, flexDays: number): string[] {
  const dates: string[] = [];
  const base = new Date(baseDate);

  for (let i = -flexDays; i <= flexDays; i++) {
    const date = new Date(base);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Calculate return date from departure + duration
 */
export function calculateReturnDate(departureDate: string, nights: number): string {
  const dep = new Date(departureDate);
  dep.setDate(dep.getDate() + nights);
  return dep.toISOString().split('T')[0];
}

/**
 * Deduplicate flight offers by flight segments
 */
export function deduplicateFlights(flights: FlightOffer[]): FlightOffer[] {
  const flightMap = new Map<string, FlightOffer>();
  const DUFFEL_PRIORITY_THRESHOLD = 500;

  for (const flight of flights) {
    const itineraries = flight.itineraries || [];
    const key = itineraries.flatMap(itin =>
      (itin.segments || []).map(seg =>
        `${seg.carrierCode}${seg.number}-${seg.departure?.at || ''}`
      )
    ).join('|');

    const existingFlight = flightMap.get(key);

    if (!existingFlight) {
      flightMap.set(key, flight);
    } else {
      const existingPrice = parseFloat(String(existingFlight.price?.total || '999999'));
      const newPrice = parseFloat(String(flight.price?.total || '999999'));
      const cheaperPrice = Math.min(existingPrice, newPrice);

      if (cheaperPrice < DUFFEL_PRIORITY_THRESHOLD) {
        const existingIsDuffel = existingFlight.source === 'Duffel';
        const newIsDuffel = flight.source === 'Duffel';

        if (newIsDuffel && !existingIsDuffel) {
          flightMap.set(key, flight);
        } else if (!newIsDuffel && existingIsDuffel) {
          // Keep existing Duffel
        } else if (newPrice < existingPrice) {
          flightMap.set(key, flight);
        }
      } else {
        if (newPrice < existingPrice) {
          flightMap.set(key, flight);
        }
      }
    }
  }

  return Array.from(flightMap.values());
}

/**
 * Convert FlightOffer segments to routing engine format
 */
export function flightOfferToRoutingSegments(flight: FlightOffer | ScoredFlight): RoutingFlightSegment[] {
  const segments: RoutingFlightSegment[] = [];

  for (const itinerary of flight.itineraries || []) {
      (itinerary.segments || []).forEach(seg => {
        let cabinClass: CabinClass = 'ECONOMY';
        let fareClass: string | undefined;
        let fareBasisCode: string | undefined;

        const travelerPricing = flight.travelerPricings?.[0];
        if (travelerPricing?.fareDetailsBySegment) {
          const fareDetails = travelerPricing.fareDetailsBySegment.find(
            (fd: any) => fd.segmentId === seg.number || fd.segmentId === `${seg.carrierCode}${seg.number}`
          ) || travelerPricing.fareDetailsBySegment[0];

          if (fareDetails) {
            cabinClass = (fareDetails.cabin as CabinClass) || 'ECONOMY';
            fareClass = fareDetails.class;
            fareBasisCode = fareDetails.fareBasis;
          }
        }

        segments.push({
          airlineCode: seg.carrierCode,
          origin: seg.departure?.iataCode || '',
          destination: seg.arrival?.iataCode || '',
          departureDate: seg.departure?.at ? new Date(seg.departure.at) : new Date(),
          cabinClass,
          fareClass,
          fareBasisCode,
          operatingCarrier: seg.operating?.carrierCode,
          marketingCarrier: seg.carrierCode,
        });
      });
  }

  return segments;
}

/**
 * Extract base fare from flight offer
 */
export function extractBaseFare(flight: FlightOffer | ScoredFlight): number {
  const amadeusBase = flight.price?.base;
  if (amadeusBase) return parseFloat(String(amadeusBase));

  const duffelBase = (flight as any).price?.base_amount;
  if (duffelBase) return parseFloat(String(duffelBase));

  return parseFloat(String(flight.price?.total || '0')) * 0.85;
}

/**
 * Extract NET total fare (before markup)
 */
export function extractNetFare(flight: FlightOffer | ScoredFlight): number {
  if (flight.price?._netPrice) return parseFloat(flight.price._netPrice);
  return parseFloat(String(flight.price?.total || '0'));
}

/**
 * Apply markup to flights based on routing information.
 */
/**
 * Apply flight markup to a list of flights
 * Handles per-person price calculation and fare variants markup
 */
export function applyMarkupToFlights(
  flights: FlightOffer[],
  applyFlightMarkup: (price: number) => any
): FlightOffer[] {
  return flights.map((flight: FlightOffer) => {
    const netPrice = parseFloat(String(flight.price?.total || '0'));
    const source = flight.source?.toLowerCase() || 'unknown';

    // Apply markup using the provided function
    const markupResult = applyFlightMarkup(netPrice);

    // CRITICAL: Preserve original base price, adjust for markup
    const originalBase = parseFloat(String(flight.price?.base || '0'));
    const newBase = originalBase > 0 ? originalBase + markupResult.markupAmount : 0;

    // Update flight price with customer-facing price (including markup)
    const markedUpFlight: FlightOffer = {
      ...flight,
      price: {
        ...flight.price,
        total: markupResult.customerPrice.toString(),
        base: newBase > 0 ? newBase.toString() : flight.price?.base?.toString(),
        fees: flight.price?.fees,
        grandTotal: markupResult.customerPrice.toString(),
        _netPrice: netPrice.toString(),
        _markupAmount: markupResult.markupAmount.toString(),
        _markupPercentage: markupResult.markupPercentage,
      },
      // Apply markup to fareVariants too
      fareVariants: flight.fareVariants?.map((variant: any) => {
        const variantNetPrice = parseFloat(String(variant.price || '0'));
        const variantMarkupResult = applyFlightMarkup(variantNetPrice);
        const variantOriginalBase = parseFloat(String(variant.priceDetails?.base || '0'));
        const variantNewBase = variantOriginalBase > 0 ? variantOriginalBase + variantMarkupResult.markupAmount : 0;

        return {
          ...variant,
          price: variantMarkupResult.customerPrice,
          priceDetails: {
            total: variantMarkupResult.customerPrice.toString(),
            base: variantNewBase > 0 ? variantNewBase.toString() : variant.priceDetails?.base || '0',
            fees: variant.priceDetails?.fees,
            grandTotal: variantMarkupResult.customerPrice.toString(),
            _netPrice: variantNetPrice.toString(),
            _markupAmount: variantMarkupResult.markupAmount.toString(),
          },
        };
      }),
      // Update traveler pricing
      travelerPricings: flight.travelerPricings?.map((tp: any) => {
        const travelerCount = flight.travelerPricings?.length || 1;
        const perPersonPrice = (markupResult.customerPrice / travelerCount).toFixed(2);
        return {
          ...tp,
          price: {
            ...tp.price,
            total: perPersonPrice,
          },
        };
      }),
    };

    return markedUpFlight;
  });
}

// Extended scored flight with routing
export interface FlightRoutingInfo {
  channel: RoutingChannel;
  estimatedProfit: number;
  commissionPct: number;
  commissionAmount: number;
  isExcluded: boolean;
  exclusionReason?: string;
  decisionReason: string;
}

export interface ScoredFlightWithRouting extends ScoredFlight {
  routing?: FlightRoutingInfo;
}

/**
 * Enrich flights with routing channel information
 */
export async function enrichFlightsWithRouting(
  flights: ScoredFlight[],
  searchId?: string
): Promise<ScoredFlightWithRouting[]> {
  if (!flights.length) return flights;

  const engine = getRoutingEngine({ searchId, logDecisions: true });

  return Promise.all(
    flights.map(async (flight) => {
      try {
        const segments = flightOfferToRoutingSegments(flight);
        const baseFare = extractBaseFare(flight);
        const totalFare = extractNetFare(flight);

        if (!segments.length || totalFare <= 0) {
          return { ...flight, routing: undefined };
        }

        const enriched = await engine.enrichOffer(
          flight.id,
          (flight.source?.toLowerCase() as 'duffel' | 'amadeus' | 'consolidator') || 'amadeus',
          flight,
          segments,
          baseFare,
          totalFare,
          flight.price?.currency || 'USD'
        );

        return {
          ...flight,
          routing: {
            channel: enriched.routing.channel,
            estimatedProfit: enriched.routing.estimatedProfit,
            commissionPct: enriched.routing.commissionPct,
            commissionAmount: enriched.routing.commissionAmount,
            isExcluded: enriched.routing.isExcluded,
            exclusionReason: enriched.routing.exclusionReason,
            decisionReason: enriched.routing.decisionReason,
          } as FlightRoutingInfo,
        };
      } catch (error) {

        console.error(`[RoutingEnrichment] Error enriching flight ${flight.id}:`, error);
        return flight as ScoredFlightWithRouting;
      }
    })
  );
}

/**
 * Get routing summary statistics
 */
export function getRoutingSummary(flights: ScoredFlightWithRouting[]): {
  total: number;
  consolidator: number;
  duffel: number;
  totalEstimatedProfit: number;
  avgProfit: number;
} {
  const stats = {
    total: flights.length,
    consolidator: 0,
    duffel: 0,
    totalEstimatedProfit: 0,
    avgProfit: 0,
  };

  flights.forEach((f) => {
    if (f.routing?.channel === 'CONSOLIDATOR') stats.consolidator++;
    else stats.duffel++;

    stats.totalEstimatedProfit += f.routing?.estimatedProfit || 0;
  });

  if (stats.total > 0) {
    stats.avgProfit = stats.totalEstimatedProfit / stats.total;
  }

  return stats;
}

/**
 * Create unique flight signature
 */
export function getFlightSignature(offer: FlightOffer): string {
  const itineraries = offer.itineraries || [];
  const segments = itineraries.flatMap(itin => itin.segments || []);
  if (segments.length === 0) return offer.id || Math.random().toString(36).substr(2, 9);

  const sigParts = segments.map(seg =>
    `${seg.carrierCode || 'XX'}${seg.number || '000'}_${seg.departure?.at?.slice(0, 16) || ''}_${seg.arrival?.at?.slice(0, 16) || ''}`
  );
  return sigParts.join('|');
}

/**
 * Get cabin class priority (lower = show first)
 */
export function getCabinPriority(cabin: string): number {
  switch (cabin) {
    case 'FIRST': return 4;
    case 'BUSINESS': return 3;
    case 'PREMIUM_ECONOMY': return 2;
    default: return 1; // ECONOMY
  }
}

/**
 * Detect fare tier from branded fare name
 */
export function detectFareTier(brandedFare: string): 'basic' | 'standard' | 'plus' | 'flex' {
  const fare = brandedFare.toUpperCase();
  if (fare.includes('BASIC') || fare.includes('LIGHT') || fare.includes('SAVER') ||
    fare.includes('ECONOMY LIGHT') || fare.includes('ECONOMY SAVER')) {
    return 'basic';
  }
  if (fare.includes('FLEX') || fare.includes('FLEXI') || fare.includes('FULL') ||
    fare.includes('MAX') || fare.includes('FREEDOM') || fare.includes('PLUS FLEX')) {
    return 'flex';
  }
  if (fare.includes('PLUS') || fare.includes('COMFORT') || fare.includes('CLASSIC') ||
    fare.includes('MAIN') || fare.includes('CHOICE')) {
    return 'plus';
  }
  return 'standard';
}

/**
 * Get fare tier priority for sorting within same cabin
 */
export function getFareTierPriority(tier: 'basic' | 'standard' | 'plus' | 'flex'): number {
  switch (tier) {
    case 'basic': return 1;
    case 'standard': return 2;
    case 'plus': return 3;
    case 'flex': return 4;
  }
}

/**
 * Extract fare features from Duffel offer
 */
export function extractFareFeatures(offer: FlightOffer, fareDetails: any): string[] {
  const features: string[] = [];
  const cabin = fareDetails?.cabin || 'ECONOMY';

  if (cabin === 'BUSINESS') {
    features.push('Business class seat');
    features.push('Priority boarding');
    features.push('Lounge access');
  } else if (cabin === 'FIRST') {
    features.push('First class suite');
    features.push('Priority boarding');
    features.push('Premium lounge');
  } else if (cabin === 'PREMIUM_ECONOMY') {
    features.push('Premium economy seat');
    features.push('Extra legroom');
  } else {
    features.push('Economy seat');
  }

  const checkedBags = fareDetails?.includedCheckedBags?.quantity || 0;
  if (checkedBags === 0) {
    features.push('Carry-on only');
  } else if (checkedBags === 1) {
    features.push('Carry-on + 1 checked bag');
  } else if (checkedBags >= 2) {
    features.push(`Carry-on + ${checkedBags} checked bags`);
  }

  return features.slice(0, 4);
}

/**
 * Group Duffel fare variants
 */
export function groupDuffelFareVariants(duffelOffers: FlightOffer[]): FlightOffer[] {
  if (duffelOffers.length === 0) return [];

  const fareGroups = new Map<string, FlightOffer[]>();

  for (const offer of duffelOffers) {
    const sig = getFlightSignature(offer);
    if (!fareGroups.has(sig)) {
      fareGroups.set(sig, []);
    }
    fareGroups.get(sig)!.push(offer);
  }

  const groupedFlights: FlightOffer[] = [];

  for (const [signature, variants] of fareGroups.entries()) {
    variants.sort((a, b) => {
      const fareDetailsA = a.travelerPricings?.[0]?.fareDetailsBySegment?.[0] as any;
      const fareDetailsB = b.travelerPricings?.[0]?.fareDetailsBySegment?.[0] as any;

      const cabinA = fareDetailsA?.cabin || 'ECONOMY';
      const cabinB = fareDetailsB?.cabin || 'ECONOMY';
      const brandedFareA = (fareDetailsA?.brandedFareLabel || fareDetailsA?.brandedFare || '').toUpperCase();
      const brandedFareB = (fareDetailsB?.brandedFareLabel || fareDetailsB?.brandedFare || '').toUpperCase();

      const cabinPriorityA = getCabinPriority(cabinA);
      const cabinPriorityB = getCabinPriority(cabinB);
      if (cabinPriorityA !== cabinPriorityB) return cabinPriorityA - cabinPriorityB;

      const tierA = detectFareTier(brandedFareA);
      const tierB = detectFareTier(brandedFareB);
      const tierPriorityA = getFareTierPriority(tierA);
      const tierPriorityB = getFareTierPriority(tierB);
      if (tierPriorityA !== tierPriorityB) return tierPriorityA - tierPriorityB;

      const priceA = parseFloat(String(a.price?.total || '999999'));
      const priceB = parseFloat(String(b.price?.total || '999999'));
      return priceA - priceB;
    });

    const cheapest = variants[0];
    const economyVariants = variants.filter(v => {
      const cabin = (v.travelerPricings?.[0]?.fareDetailsBySegment?.[0] as any)?.cabin || 'ECONOMY';
      return cabin === 'ECONOMY';
    });

    const flightWithVariants = {
      ...cheapest,
      fareVariants: variants.map((v) => {
        const price = parseFloat(String(v.price?.total || '0'));
        const fareDetails = v.travelerPricings?.[0]?.fareDetailsBySegment?.[0] as any;
        const brandedFare = (fareDetails?.brandedFareLabel || fareDetails?.brandedFare || '').toUpperCase();
        const cabin = fareDetails?.cabin || 'ECONOMY';

        const cabinDisplayName: Record<string, string> = {
          'ECONOMY': 'Economy',
          'PREMIUM_ECONOMY': 'Premium Economy',
          'BUSINESS': 'Business',
          'FIRST': 'First Class',
        };
        const cabinPrefix = cabinDisplayName[cabin] || 'Economy';

        const serviceFeeByClass: Record<string, number> = {
          'ECONOMY': 50,
          'PREMIUM_ECONOMY': 70,
          'BUSINESS': 100,
          'FIRST': 200,
        };
        const serviceFee = serviceFeeByClass[cabin] || 50;
        const detectedTier = detectFareTier(brandedFare);

        let displayName: string;
        const rawBrandedLabel = fareDetails?.brandedFareLabel || fareDetails?.brandedFare || '';

        if (rawBrandedLabel && rawBrandedLabel.trim().length > 0) {
          const titleCased = rawBrandedLabel
            .toLowerCase()
            .split(/[\s_]+/)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          const prefixLower = cabinPrefix.toLowerCase();
          if (titleCased.toLowerCase().includes(prefixLower) || cabin === 'FIRST') {
            displayName = titleCased;
          } else {
            displayName = `${cabinPrefix} ${titleCased}`;
          }
        } else {
          const tierDisplayNames: Record<string, string> = {
            'basic': 'Basic',
            'standard': 'Standard',
            'plus': 'Plus',
            'flex': 'Flex',
          };
          displayName = cabin === 'FIRST' ? 'First Class' : `${cabinPrefix} ${tierDisplayNames[detectedTier]}`;
        }

        const conditions = (v as any).conditions;
        const restrictions: string[] = [];
        const positives: string[] = [];
        const hasConditionsData = conditions && (
          typeof conditions.changeable === 'boolean' ||
          typeof conditions.refundable === 'boolean'
        );

        if (hasConditionsData) {
          if (!conditions.changeable) {
            restrictions.push('No changes allowed');
          } else {
            const airlineChangeFee = conditions.changePenalty
              ? parseFloat(conditions.changePenalty.replace(/[^0-9.]/g, '') || '0')
              : 0;
            positives.push(`Changes ($${airlineChangeFee + serviceFee} fee)`);
          }

          if (!conditions.refundable) {
            restrictions.push('Non-refundable');
          } else {
            const airlineRefundFee = conditions.refundPenalty
              ? parseFloat(conditions.refundPenalty.replace(/[^0-9.]/g, '') || '0')
              : 0;
            positives.push(`Refundable ($${airlineRefundFee + serviceFee} fee)`);
          }
        } else {
          positives.push(`Changes ($${serviceFee} fee)`);
          positives.push('Contact us for refund policy');
        }

        const economyIdx = economyVariants.indexOf(v);
        const isRecommended = economyIdx === 1 && economyVariants.length > 1;

        let popularityLabel: string | undefined;
        if (variants.length === 1) {
          popularityLabel = undefined;
        } else if (isRecommended) {
          popularityLabel = 'Best Value';
        } else if (detectedTier === 'flex') {
          popularityLabel = 'Most Flexible';
        } else if (detectedTier === 'basic') {
          popularityLabel = 'Lowest Price';
        } else if (cabin === 'BUSINESS' || cabin === 'FIRST') {
          popularityLabel = 'Premium';
        } else if (detectedTier === 'plus') {
          popularityLabel = 'Popular Upgrade';
        }

        return {
          id: v.id,
          name: displayName,
          price: price,
          currency: v.price?.currency || 'USD',
          priceDetails: {
            total: v.price?.total,
            base: v.price?.base,
            fees: v.price?.fees,
            grandTotal: v.price?.grandTotal,
          },
          originalOffer: v, // Store full offer for booking
          expires_at: (v as any).expires_at || (v as any).lastTicketingDateTime,
          lastTicketingDateTime: (v as any).lastTicketingDateTime || (v as any).expires_at,
          created_at: (v as any).created_at,
          features: extractFareFeatures(v, fareDetails),
          restrictions: restrictions.length > 0 ? restrictions : undefined,
          positives: positives.length > 0 ? positives : undefined,
          recommended: isRecommended,
          popularityLabel,
          cabinClass: cabin,
          fareTier: detectedTier,
        };
      }),
      fareVariantCount: variants.length,
    };

    groupedFlights.push(flightWithVariants as any);
  }

  return groupedFlights;
}

