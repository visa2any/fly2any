/**
 * Mixed-Carrier Fare Combiner (Hacker Fares / Virtual Interlining)
 *
 * Combines one-way flights from different airlines to find the cheapest
 * round-trip combinations. Similar to Google Flights "Separate Tickets"
 * and Kiwi.com "Virtual Interlining".
 *
 * Consumer Protection Compliance:
 * - DOT requires clear disclosure of separate tickets
 * - Airlines are NOT responsible for missed connections on separate tickets
 * - Must show clear warnings to users
 */

import { FlightOffer, FlightItinerary, normalizePrice } from './types';

/**
 * Represents a combined fare from two separate one-way tickets
 */
export interface MixedCarrierFare {
  /** Unique ID for this combination */
  id: string;

  /** Indicates this is a mixed-carrier fare (separate tickets) */
  isSeparateTickets: true;

  /** The outbound one-way flight */
  outboundFlight: FlightOffer;

  /** The return one-way flight */
  returnFlight: FlightOffer;

  /** Combined price (sum of both tickets) */
  combinedPrice: {
    total: number;
    currency: string;
    outboundPrice: number;
    returnPrice: number;
  };

  /** Savings compared to cheapest traditional round-trip */
  savings?: {
    amount: number;
    percentage: number;
    vsRoundTripPrice: number;
  };

  /** Airlines involved */
  airlines: {
    outbound: string[];
    return: string[];
    isMixedCarrier: boolean;
  };

  /** Warning flags for user */
  warnings: MixedFareWarning[];

  /** Minimum self-transfer time (if applicable) */
  selfTransferInfo?: {
    required: boolean;
    minimumConnectionTime: number; // minutes
    airportChange: boolean;
  };
}

export type MixedFareWarning =
  | 'SEPARATE_TICKETS'
  | 'DIFFERENT_AIRLINES'
  | 'REBOOKING_NOT_GUARANTEED'
  | 'BAGGAGE_RECHECK_REQUIRED'
  | 'NO_PROTECTION_MISSED_CONNECTION';

/**
 * Configuration for fare combination
 */
export interface FareCombinerConfig {
  /** Maximum number of combinations to return */
  maxCombinations?: number;

  /** Minimum savings percentage to show mixed fare */
  minSavingsPercent?: number;

  /** Minimum savings amount to show mixed fare */
  minSavingsAmount?: number;

  /** Whether to include same-airline combinations */
  includeSameAirline?: boolean;

  /** Currency for price comparison */
  currency?: string;
}

const DEFAULT_CONFIG: FareCombinerConfig = {
  maxCombinations: 20,
  minSavingsPercent: 0, // Show all, let UI decide
  minSavingsAmount: 0,
  includeSameAirline: true,
  currency: 'USD',
};

/**
 * Get the primary airline code from a flight offer
 */
function getPrimaryAirline(flight: FlightOffer): string {
  return flight.validatingAirlineCodes?.[0] ||
         flight.itineraries[0]?.segments[0]?.carrierCode ||
         'XX';
}

/**
 * Get all airline codes involved in a flight
 */
function getAllAirlines(flight: FlightOffer): string[] {
  const airlines = new Set<string>();

  // Add validating airline
  if (flight.validatingAirlineCodes) {
    flight.validatingAirlineCodes.forEach(code => airlines.add(code));
  }

  // Add operating airlines from segments
  flight.itineraries.forEach(itinerary => {
    itinerary.segments.forEach(segment => {
      airlines.add(segment.carrierCode);
      if (segment.operating?.carrierCode) {
        airlines.add(segment.operating.carrierCode);
      }
    });
  });

  return Array.from(airlines);
}

/**
 * Generate warnings for a mixed-carrier fare
 */
function generateWarnings(
  outbound: FlightOffer,
  returnFlight: FlightOffer
): MixedFareWarning[] {
  const warnings: MixedFareWarning[] = ['SEPARATE_TICKETS'];

  const outboundAirlines = getAllAirlines(outbound);
  const returnAirlines = getAllAirlines(returnFlight);

  // Check if different airlines
  const hasDifferentAirlines = !outboundAirlines.some(a => returnAirlines.includes(a));
  if (hasDifferentAirlines) {
    warnings.push('DIFFERENT_AIRLINES');
  }

  // Always add these warnings for separate tickets
  warnings.push('REBOOKING_NOT_GUARANTEED');
  warnings.push('NO_PROTECTION_MISSED_CONNECTION');
  warnings.push('BAGGAGE_RECHECK_REQUIRED');

  return warnings;
}

/**
 * Create a unique ID for a fare combination
 */
function createCombinationId(outbound: FlightOffer, returnFlight: FlightOffer): string {
  return `mixed_${outbound.id}_${returnFlight.id}`;
}

/**
 * Convert a MixedCarrierFare to a FlightOffer-compatible format for UI
 */
export function mixedFareToFlightOffer(mixedFare: MixedCarrierFare): FlightOffer & {
  isSeparateTickets: true;
  separateTicketDetails: MixedCarrierFare;
} {
  const outbound = mixedFare.outboundFlight;
  const returnFlight = mixedFare.returnFlight;

  // Combine itineraries
  const combinedItineraries: FlightItinerary[] = [
    ...outbound.itineraries,
    ...returnFlight.itineraries,
  ];

  // Combine validating airlines
  const validatingAirlines = [
    ...new Set([
      ...(outbound.validatingAirlineCodes || []),
      ...(returnFlight.validatingAirlineCodes || []),
    ])
  ];

  return {
    id: mixedFare.id,
    type: 'flight-offer',
    source: 'MIXED_CARRIER',
    instantTicketingRequired: false,
    nonHomogeneous: true,
    oneWay: false,
    lastTicketingDate: outbound.lastTicketingDate || returnFlight.lastTicketingDate,
    numberOfBookableSeats: Math.min(
      outbound.numberOfBookableSeats || 9,
      returnFlight.numberOfBookableSeats || 9
    ),
    itineraries: combinedItineraries,
    price: {
      currency: mixedFare.combinedPrice.currency,
      total: mixedFare.combinedPrice.total,
      base: mixedFare.combinedPrice.total * 0.85, // Estimate
      grandTotal: mixedFare.combinedPrice.total,
    },
    validatingAirlineCodes: validatingAirlines,
    badges: [
      {
        type: 'separate-tickets',
        text: 'Separate Tickets',
        color: 'orange',
        icon: 'ticket',
      },
      ...(mixedFare.savings && mixedFare.savings.percentage >= 10 ? [{
        type: 'savings',
        text: `Save ${mixedFare.savings.percentage.toFixed(0)}%`,
        color: 'green',
        icon: 'piggy-bank',
      }] : []),
    ],
    isSeparateTickets: true,
    separateTicketDetails: mixedFare,
  };
}

/**
 * Main function: Combine one-way flights to find the best mixed-carrier fares
 */
export function combineMixedCarrierFares(
  outboundFlights: FlightOffer[],
  returnFlights: FlightOffer[],
  cheapestRoundTripPrice?: number,
  config: FareCombinerConfig = {}
): MixedCarrierFare[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const combinations: MixedCarrierFare[] = [];

  // Sort flights by price for optimization
  const sortedOutbound = [...outboundFlights].sort(
    (a, b) => normalizePrice(a.price.total) - normalizePrice(b.price.total)
  );
  const sortedReturn = [...returnFlights].sort(
    (a, b) => normalizePrice(a.price.total) - normalizePrice(b.price.total)
  );

  // Early exit if no flights
  if (sortedOutbound.length === 0 || sortedReturn.length === 0) {
    return [];
  }

  // Get reference price (cheapest round-trip or estimate)
  const referencePrice = cheapestRoundTripPrice || (
    normalizePrice(sortedOutbound[0].price.total) +
    normalizePrice(sortedReturn[0].price.total)
  ) * 1.1; // Add 10% buffer

  // Generate combinations (prioritize cheapest)
  for (const outbound of sortedOutbound.slice(0, 15)) { // Limit to top 15 outbound
    for (const returnFlight of sortedReturn.slice(0, 15)) { // Limit to top 15 return
      const outboundPrice = normalizePrice(outbound.price.total);
      const returnPrice = normalizePrice(returnFlight.price.total);
      const combinedTotal = outboundPrice + returnPrice;

      // Skip if not cheaper than reference (with minimum savings threshold)
      if (cheapestRoundTripPrice) {
        const savings = cheapestRoundTripPrice - combinedTotal;
        const savingsPercent = (savings / cheapestRoundTripPrice) * 100;

        if (savings < cfg.minSavingsAmount! || savingsPercent < cfg.minSavingsPercent!) {
          continue;
        }
      }

      // Check if same airline (skip if configured)
      const outboundAirline = getPrimaryAirline(outbound);
      const returnAirline = getPrimaryAirline(returnFlight);
      const isMixedCarrier = outboundAirline !== returnAirline;

      if (!cfg.includeSameAirline && !isMixedCarrier) {
        continue;
      }

      // Calculate savings
      const savings = cheapestRoundTripPrice ? {
        amount: cheapestRoundTripPrice - combinedTotal,
        percentage: ((cheapestRoundTripPrice - combinedTotal) / cheapestRoundTripPrice) * 100,
        vsRoundTripPrice: cheapestRoundTripPrice,
      } : undefined;

      // Create combination
      const combination: MixedCarrierFare = {
        id: createCombinationId(outbound, returnFlight),
        isSeparateTickets: true,
        outboundFlight: outbound,
        returnFlight: returnFlight,
        combinedPrice: {
          total: combinedTotal,
          currency: outbound.price.currency || 'USD',
          outboundPrice,
          returnPrice,
        },
        savings,
        airlines: {
          outbound: getAllAirlines(outbound),
          return: getAllAirlines(returnFlight),
          isMixedCarrier,
        },
        warnings: generateWarnings(outbound, returnFlight),
      };

      combinations.push(combination);

      // Stop if we have enough combinations
      if (combinations.length >= cfg.maxCombinations!) {
        break;
      }
    }

    if (combinations.length >= cfg.maxCombinations!) {
      break;
    }
  }

  // Sort by total price
  combinations.sort((a, b) => a.combinedPrice.total - b.combinedPrice.total);

  return combinations.slice(0, cfg.maxCombinations);
}

/**
 * Filter and rank mixed fares based on value proposition
 */
export function rankMixedFares(
  mixedFares: MixedCarrierFare[],
  traditionalFlights: FlightOffer[]
): MixedCarrierFare[] {
  // Get cheapest traditional price
  const cheapestTraditional = traditionalFlights.length > 0
    ? Math.min(...traditionalFlights.map(f => normalizePrice(f.price.total)))
    : Infinity;

  // Filter to only show fares cheaper than traditional
  const cheaperFares = mixedFares.filter(
    fare => fare.combinedPrice.total < cheapestTraditional
  );

  // Update savings info
  return cheaperFares.map(fare => ({
    ...fare,
    savings: {
      amount: cheapestTraditional - fare.combinedPrice.total,
      percentage: ((cheapestTraditional - fare.combinedPrice.total) / cheapestTraditional) * 100,
      vsRoundTripPrice: cheapestTraditional,
    },
  }));
}

/**
 * Get user-friendly warning messages
 */
export function getWarningMessages(warnings: MixedFareWarning[], lang: 'en' | 'pt' | 'es' = 'en'): string[] {
  const messages: Record<MixedFareWarning, Record<string, string>> = {
    SEPARATE_TICKETS: {
      en: 'This itinerary requires booking 2 separate tickets',
      pt: 'Este itinerário requer a reserva de 2 bilhetes separados',
      es: 'Este itinerario requiere reservar 2 boletos separados',
    },
    DIFFERENT_AIRLINES: {
      en: 'Different airlines for outbound and return flights',
      pt: 'Companhias aéreas diferentes para ida e volta',
      es: 'Diferentes aerolíneas para vuelos de ida y vuelta',
    },
    REBOOKING_NOT_GUARANTEED: {
      en: 'If you miss a flight, the airline is not obligated to rebook you for free',
      pt: 'Se você perder um voo, a companhia aérea não é obrigada a remarcar gratuitamente',
      es: 'Si pierde un vuelo, la aerolínea no está obligada a reprogramarlo gratis',
    },
    BAGGAGE_RECHECK_REQUIRED: {
      en: 'You must collect and re-check baggage between tickets',
      pt: 'Você deve retirar e despachar novamente a bagagem entre os bilhetes',
      es: 'Debe recoger y volver a facturar el equipaje entre boletos',
    },
    NO_PROTECTION_MISSED_CONNECTION: {
      en: 'No protection for missed connections - book with buffer time',
      pt: 'Sem proteção para conexões perdidas - reserve com tempo de margem',
      es: 'Sin protección para conexiones perdidas - reserve con tiempo de margen',
    },
  };

  return warnings.map(warning => messages[warning][lang] || messages[warning]['en']);
}

/**
 * Check if a flight offer is a mixed-carrier fare
 */
export function isMixedCarrierFare(
  flight: FlightOffer | (FlightOffer & { isSeparateTickets?: boolean })
): flight is FlightOffer & { isSeparateTickets: true; separateTicketDetails: MixedCarrierFare } {
  return 'isSeparateTickets' in flight && flight.isSeparateTickets === true;
}
