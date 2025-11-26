/**
 * Hybrid Routing Decision Engine
 *
 * Determines optimal booking channel for each flight offer:
 * - CONSOLIDATOR: Downtown Travel (2-12% commission, no CC fees)
 * - DUFFEL: Direct API (2.9% processing fees, LCC access)
 *
 * Decision Rule: If commission > $5 → Consolidator; else → Duffel
 */

import {
  calculateCommission,
  calculateCommissionBatch,
  logRoutingDecision,
  type CommissionInput,
  type CommissionResult,
  type FlightSegment,
} from './commission-calculator';
import type { CabinClass, RoutingChannel } from '@prisma/client';

export interface EnrichedFlightOffer {
  // Original offer data
  offerId: string;
  source: 'duffel' | 'amadeus' | 'consolidator';
  rawOffer: any;

  // Flight details
  segments: FlightSegment[];
  baseFare: number;
  totalFare: number;
  currency: string;

  // Routing enrichment
  routing: {
    channel: RoutingChannel;
    estimatedProfit: number;
    commissionPct: number;
    commissionAmount: number;
    isExcluded: boolean;
    exclusionReason?: string;
    decisionReason: string;
    tourCode?: string;
    ticketDesignator?: string;
  };

  // Comparison data
  profitComparison: {
    duffel: number;
    consolidator: number;
  };
}

export interface RoutingEngineConfig {
  // Minimum commission threshold to prefer consolidator
  minCommissionThreshold?: number; // Default: $5

  // Default markup percentage for Duffel profit calculation
  defaultMarkupPct?: number; // Default: 3%

  // Enable logging of routing decisions
  logDecisions?: boolean; // Default: true

  // Search session ID for tracking
  searchId?: string;
}

const DEFAULT_CONFIG: Required<RoutingEngineConfig> = {
  minCommissionThreshold: 5.0,
  defaultMarkupPct: 3.0,
  logDecisions: true,
  searchId: '',
};

/**
 * Main class for routing decisions
 */
export class RoutingEngine {
  private config: Required<RoutingEngineConfig>;

  constructor(config?: RoutingEngineConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Enrich a single flight offer with routing information
   */
  async enrichOffer(
    offerId: string,
    source: 'duffel' | 'amadeus' | 'consolidator',
    rawOffer: any,
    segments: FlightSegment[],
    baseFare: number,
    totalFare: number,
    currency: string = 'USD',
    options?: {
      passengerType?: 'ADT' | 'CHD' | 'INF';
      passengerCount?: number;
      isGroupBooking?: boolean;
      bookingChannel?: 'GDS' | 'NDC' | 'NDC_DIRECT';
    }
  ): Promise<EnrichedFlightOffer> {
    const input: CommissionInput = {
      segments,
      baseFare,
      totalFare,
      currency,
      ...options,
    };

    const result = await calculateCommission(input);

    // Log decision if enabled
    if (this.config.logDecisions) {
      await logRoutingDecision(input, result, this.config.searchId, offerId).catch(err => {
        console.error('[RoutingEngine] Failed to log decision:', err);
      });
    }

    return {
      offerId,
      source,
      rawOffer,
      segments,
      baseFare,
      totalFare,
      currency,
      routing: {
        channel: result.routingChannel,
        estimatedProfit: result.estimatedProfit,
        commissionPct: result.commissionPct,
        commissionAmount: result.commissionAmount,
        isExcluded: result.isExcluded,
        exclusionReason: result.exclusionReason,
        decisionReason: result.decisionReason,
        tourCode: result.tourCode,
        ticketDesignator: result.ticketDesignator,
      },
      profitComparison: {
        duffel: result.duffelProfit,
        consolidator: result.consolidatorProfit,
      },
    };
  }

  /**
   * Enrich multiple flight offers in batch
   */
  async enrichOffers(
    offers: Array<{
      offerId: string;
      source: 'duffel' | 'amadeus' | 'consolidator';
      rawOffer: any;
      segments: FlightSegment[];
      baseFare: number;
      totalFare: number;
      currency?: string;
      options?: {
        passengerType?: 'ADT' | 'CHD' | 'INF';
        passengerCount?: number;
        isGroupBooking?: boolean;
        bookingChannel?: 'GDS' | 'NDC' | 'NDC_DIRECT';
      };
    }>
  ): Promise<EnrichedFlightOffer[]> {
    return Promise.all(
      offers.map(offer =>
        this.enrichOffer(
          offer.offerId,
          offer.source,
          offer.rawOffer,
          offer.segments,
          offer.baseFare,
          offer.totalFare,
          offer.currency || 'USD',
          offer.options
        )
      )
    );
  }

  /**
   * Get routing recommendation without enriching the full offer
   */
  async getRoutingRecommendation(
    airlineCode: string,
    origin: string,
    destination: string,
    departureDate: Date,
    cabinClass: CabinClass,
    baseFare: number,
    fareClass?: string,
    fareBasisCode?: string
  ): Promise<CommissionResult> {
    const segment: FlightSegment = {
      airlineCode,
      origin,
      destination,
      departureDate,
      cabinClass,
      fareClass,
      fareBasisCode,
    };

    return calculateCommission({
      segments: [segment],
      baseFare,
      totalFare: baseFare, // Simplified
    });
  }

  /**
   * Check if an airline is consolidator-eligible (not LCC)
   */
  async isConsolidatorEligible(airlineCode: string): Promise<boolean> {
    const result = await this.getRoutingRecommendation(
      airlineCode,
      'XXX', // Dummy
      'YYY', // Dummy
      new Date(),
      'ECONOMY',
      100 // Dummy fare
    );

    return result.decisionReason !== 'lcc_airline';
  }

  /**
   * Calculate break-even fare for consolidator routing
   * (Fare at which commission equals $5 threshold)
   */
  calculateBreakEvenFare(commissionPct: number): number {
    if (commissionPct <= 0) return Infinity;
    return (this.config.minCommissionThreshold / commissionPct) * 100;
  }

  /**
   * Get summary statistics for a batch of offers
   */
  getRoutingSummary(offers: EnrichedFlightOffer[]): {
    total: number;
    consolidatorCount: number;
    duffelCount: number;
    consolidatorPct: number;
    duffelPct: number;
    totalEstimatedProfit: number;
    avgProfit: number;
    excludedCount: number;
  } {
    const consolidatorOffers = offers.filter(o => o.routing.channel === 'CONSOLIDATOR');
    const duffelOffers = offers.filter(o => o.routing.channel === 'DUFFEL');
    const excludedOffers = offers.filter(o => o.routing.isExcluded);
    const totalProfit = offers.reduce((sum, o) => sum + o.routing.estimatedProfit, 0);

    return {
      total: offers.length,
      consolidatorCount: consolidatorOffers.length,
      duffelCount: duffelOffers.length,
      consolidatorPct: offers.length ? (consolidatorOffers.length / offers.length) * 100 : 0,
      duffelPct: offers.length ? (duffelOffers.length / offers.length) * 100 : 0,
      totalEstimatedProfit: totalProfit,
      avgProfit: offers.length ? totalProfit / offers.length : 0,
      excludedCount: excludedOffers.length,
    };
  }
}

/**
 * Convert Duffel offer to routing engine format
 */
export function duffelOfferToSegments(duffelOffer: any): FlightSegment[] {
  const segments: FlightSegment[] = [];

  for (const slice of duffelOffer.slices || []) {
    for (const segment of slice.segments || []) {
      segments.push({
        airlineCode: segment.marketing_carrier?.iata_code || segment.operating_carrier?.iata_code || '',
        origin: segment.origin?.iata_code || '',
        destination: segment.destination?.iata_code || '',
        departureDate: new Date(segment.departing_at),
        cabinClass: mapDuffelCabinClass(segment.passengers?.[0]?.cabin_class),
        fareClass: segment.passengers?.[0]?.cabin_class_marketing_name,
        fareBasisCode: segment.passengers?.[0]?.fare_basis_code,
        operatingCarrier: segment.operating_carrier?.iata_code,
        marketingCarrier: segment.marketing_carrier?.iata_code,
      });
    }
  }

  return segments;
}

/**
 * Map Duffel cabin class to our enum
 */
function mapDuffelCabinClass(duffelClass?: string): CabinClass {
  switch (duffelClass?.toLowerCase()) {
    case 'first':
      return 'FIRST';
    case 'business':
      return 'BUSINESS';
    case 'premium_economy':
      return 'PREMIUM_ECONOMY';
    case 'economy':
    default:
      return 'ECONOMY';
  }
}

/**
 * Extract base fare from Duffel offer
 */
export function extractDuffelBaseFare(duffelOffer: any): number {
  // Base fare is total minus tax
  const total = parseFloat(duffelOffer.total_amount || '0');
  const tax = parseFloat(duffelOffer.tax_amount || '0');
  return total - tax;
}

/**
 * Create singleton instance for use across the app
 */
let routingEngineInstance: RoutingEngine | null = null;

export function getRoutingEngine(config?: RoutingEngineConfig): RoutingEngine {
  if (!routingEngineInstance || config) {
    routingEngineInstance = new RoutingEngine(config);
  }
  return routingEngineInstance;
}

/**
 * Quick helper for single offer routing
 */
export async function getQuickRouting(
  airlineCode: string,
  baseFare: number,
  cabinClass: CabinClass = 'ECONOMY'
): Promise<RoutingChannel> {
  const engine = getRoutingEngine();
  const result = await engine.getRoutingRecommendation(
    airlineCode,
    'XXX',
    'YYY',
    new Date(),
    cabinClass,
    baseFare
  );
  return result.routingChannel;
}
