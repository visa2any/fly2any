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
    let scoredFlights: ScoredFlight[] = markedUpFlights.map(flight =>
      calculateFlightScore(flight, markedUpFlights)
    );

    // 3. Add badges
    scoredFlights = scoredFlights.map(flight => ({
      ...flight,
      badges: getFlightBadges(flight, scoredFlights)
    }));

    // 4. Hybrid Routing Enrichment
    const routedFlights = await enrichFlightsWithRouting(scoredFlights, searchSessionId);
    const routingSummary = getRoutingSummary(routedFlights);

    // 5. Store routing data
    const internalRoutingData = {
      sessionId: searchSessionId,
      summary: routingSummary,
      flightRouting: Object.fromEntries(
        routedFlights
          .filter(f => f.routing)
          .map(f => [f.id, f.routing])
      ),
    };
    const routingCacheKey = `routing:${searchSessionId}`;
    await setCache(routingCacheKey, internalRoutingData, 3600);

    // 6. Sort
    const sortedFlights = sortFlights(routedFlights as ScoredFlight[], sortBy || 'best');

    // 7. Strip internal routing for response
    const customerFlights = sortedFlights.map(flight => {
      const { routing, ...customerFlight } = flight as ScoredFlightWithRouting;
      return customerFlight;
    });

    return { 
      flights: customerFlights, 
      routingSummary,
      searchSessionId
    };
  }
}

export const searchEnricher = new SearchEnricher();
