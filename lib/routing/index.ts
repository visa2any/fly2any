/**
 * Hybrid Routing Engine Module
 *
 * Determines optimal booking channel for flight offers:
 *
 * ROUTING RULES ($500 THRESHOLD):
 * 1. Flights < $500 → DUFFEL (ancillary profit opportunity)
 * 2. Flights >= $500 WITH commission → CONSOLIDATOR (flat $5 fee)
 * 3. Flights >= $500 WITHOUT commission → DUFFEL
 * 4. LCC Airlines → DUFFEL (no consolidator support)
 *
 * See: lib/config/flight-markup.ts for markup configuration
 */

export {
  calculateCommission,
  calculateCommissionBatch,
  calculateDuffelCosts,
  logRoutingDecision,
  type CommissionResult,
  type CommissionInput,
  type FlightSegment,
} from './commission-calculator';

export {
  RoutingEngine,
  getRoutingEngine,
  getQuickRouting,
  duffelOfferToSegments,
  extractDuffelBaseFare,
  type EnrichedFlightOffer,
  type RoutingEngineConfig,
} from './routing-engine';

export {
  getFlightRoutingDecision,
  shouldUseConsolidator,
  getSessionRoutingSummary,
  getSessionRoutingData,
  type CachedRoutingInfo,
  type CachedRoutingData,
  type BookingRouteResult,
} from './booking-router';
