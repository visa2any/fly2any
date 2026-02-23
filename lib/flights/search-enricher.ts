import {
  calculateFlightScore,
  getFlightBadges,
  sortFlights,
  type FlightOffer,
  type ScoredFlight
} from '@/lib/flights/scoring';
import { applyFlightMarkup } from '@/lib/config/flight-markup';
import {
  applyMarkupToFlights,
  enrichFlightsWithRouting,
  getRoutingSummary,
  type ScoredFlightWithRouting
} from '@/lib/flights/search-logic';
import { setCache } from '@/lib/cache/helpers';

/**
 * Enriches and scores flight search results
 */
export class SearchEnricher {
  async enrich(flights: FlightOffer[], sortBy: any, searchSessionId: string) {
    // 1. Apply markup
    const markedUpFlights = applyMarkupToFlights(flights, applyFlightMarkup);

    // 2. Score flights
    const flightsToScore = Array.isArray(markedUpFlights) ? markedUpFlights : [];
    let scoredFlights: ScoredFlight[] = flightsToScore.map(flight =>
      calculateFlightScore(flight, flightsToScore)
    );

    // 3. Add badges
    const flightsForBadges = Array.isArray(scoredFlights) ? scoredFlights : [];
    scoredFlights = flightsForBadges.map(flight => ({
      ...flight,
      badges: getFlightBadges(flight, flightsForBadges)
    }));

    // 4. Start Hybrid Routing Enrichment in the background (NON-BLOCKING)
    const routingCacheKey = `routing:${searchSessionId}`;
    Promise.resolve().then(async () => {
      try {
        const routedFlights = await enrichFlightsWithRouting(scoredFlights, searchSessionId);
        const routingSummary = getRoutingSummary(routedFlights);
        
        const internalRoutingData = {
          sessionId: searchSessionId,
          summary: routingSummary,
          flightRouting: Object.fromEntries(
            routedFlights
              .filter(f => f.routing)
              .map(f => [f.id, f.routing])
          ),
        };
        await setCache(routingCacheKey, internalRoutingData, 3600);
      } catch (err) {
        console.error('Background routing enrichment failed:', err);
      }
    });

    // 5. Store initial empty routing data so it doesn't 404 if requested immediately
    const initialRoutingSummary = { total: scoredFlights.length, consolidator: 0, duffel: 0, totalEstimatedProfit: 0, avgProfit: 0 };
    await setCache(routingCacheKey, {
      sessionId: searchSessionId,
      summary: initialRoutingSummary,
      flightRouting: {}
    }, 3600);

    // 6. Sort flights directly (basic sorting like price/duration doesn't need routing info)
    const sortedFlights = sortFlights(scoredFlights, sortBy || 'best');

    // 7. Strip internal routing for response (it's already stripped since we didn't add it to sortedFlights yet)
    // We just typecast here for consistency with the rest of the app's expectations
    const flightsToStrip = Array.isArray(sortedFlights) ? sortedFlights : [];
    const customerFlights = flightsToStrip.map(flight => {
      // In case any lingering routing data exists, though there shouldn't be
      const { routing, ...customerFlight } = flight as any;
      return customerFlight as FlightOffer;
    });

    return { 
      flights: customerFlights, 
      routingSummary: initialRoutingSummary,
      searchSessionId
    };
  }
}

export const searchEnricher = new SearchEnricher();
