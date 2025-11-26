/**
 * Booking Router - Routes bookings to the correct channel
 *
 * When a customer selects a flight, this module looks up the
 * cached routing decision and routes to CONSOLIDATOR or DUFFEL.
 */

import { getCached } from '@/lib/cache/helpers';
import type { RoutingChannel } from '@prisma/client';

export interface CachedRoutingInfo {
  channel: RoutingChannel;
  estimatedProfit: number;
  commissionPct: number;
  commissionAmount: number;
  isExcluded: boolean;
  exclusionReason?: string;
  decisionReason: string;
  tourCode?: string;
  ticketDesignator?: string;
}

export interface CachedRoutingData {
  sessionId: string;
  summary: {
    total: number;
    consolidator: number;
    duffel: number;
    totalEstimatedProfit: number;
    avgProfit: number;
  };
  flightRouting: Record<string, CachedRoutingInfo>;
}

export interface BookingRouteResult {
  channel: RoutingChannel;
  routing: CachedRoutingInfo | null;
  reason: string;
}

/**
 * Look up the routing decision for a specific flight
 *
 * @param routingSessionId - Session ID from search response (_routingSessionId)
 * @param flightId - The flight offer ID to look up
 * @returns Routing decision for the flight
 */
export async function getFlightRoutingDecision(
  routingSessionId: string,
  flightId: string
): Promise<BookingRouteResult> {
  // Default to Duffel if anything fails
  const defaultResult: BookingRouteResult = {
    channel: 'DUFFEL',
    routing: null,
    reason: 'fallback_no_routing_data'
  };

  if (!routingSessionId || !flightId) {
    console.warn('[BookingRouter] Missing sessionId or flightId');
    return defaultResult;
  }

  try {
    // Look up cached routing data
    const cacheKey = `routing:${routingSessionId}`;
    const cachedData = await getCached<CachedRoutingData>(cacheKey);

    if (!cachedData) {
      console.warn(`[BookingRouter] No cached routing data for session: ${routingSessionId}`);
      return {
        ...defaultResult,
        reason: 'routing_session_expired'
      };
    }

    // Look up specific flight routing
    const flightRouting = cachedData.flightRouting[flightId];

    if (!flightRouting) {
      console.warn(`[BookingRouter] No routing for flight: ${flightId} in session: ${routingSessionId}`);
      return {
        ...defaultResult,
        reason: 'flight_not_in_session'
      };
    }

    return {
      channel: flightRouting.channel,
      routing: flightRouting,
      reason: flightRouting.decisionReason
    };
  } catch (err) {
    console.error('[BookingRouter] Error looking up routing:', err);
    return {
      ...defaultResult,
      reason: 'routing_lookup_error'
    };
  }
}

/**
 * Check if a flight should be booked via Consolidator
 */
export async function shouldUseConsolidator(
  routingSessionId: string,
  flightId: string
): Promise<boolean> {
  const result = await getFlightRoutingDecision(routingSessionId, flightId);
  return result.channel === 'CONSOLIDATOR';
}

/**
 * Get routing summary for a search session (for admin/analytics)
 */
export async function getSessionRoutingSummary(
  routingSessionId: string
): Promise<CachedRoutingData['summary'] | null> {
  try {
    const cacheKey = `routing:${routingSessionId}`;
    const cachedData = await getCached<CachedRoutingData>(cacheKey);
    return cachedData?.summary || null;
  } catch {
    return null;
  }
}

/**
 * Get all routing decisions for a session (for debugging/admin)
 */
export async function getSessionRoutingData(
  routingSessionId: string
): Promise<CachedRoutingData | null> {
  try {
    const cacheKey = `routing:${routingSessionId}`;
    return await getCached<CachedRoutingData>(cacheKey);
  } catch {
    return null;
  }
}
