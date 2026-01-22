/**
 * AEO (Answer Engine Optimization) ANSWER BLOCKS
 *
 * Generates structured answer content optimized for:
 * - Google SGE (AI Overviews)
 * - ChatGPT Search
 * - Perplexity AI
 * - Bing Copilot
 *
 * Format: Short, factual, quotable statements with sources.
 *
 * @version 1.0.0 - Sprint 3
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AnswerBlock {
  question: string;
  answer: string;
  source?: string;
  lastUpdated?: string;
  dataFreshness?: {
    lastReviewed: string;
    updateFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    staleAfterDays: number;
  };
  confidence: 'high' | 'medium';
  category: 'price' | 'duration' | 'airline' | 'timing' | 'general';
}

export interface RouteAnswerData {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  lowestPrice?: number;
  avgPrice?: number;
  currency?: string;
  flightDuration?: string;
  airlines?: string[];
  directFlights?: boolean;
}

// ============================================================================
// ROUTE ANSWER GENERATORS
// ============================================================================

/**
 * Generate cheapest day answer
 */
export function getCheapestDayAnswer(
  origin: string,
  destination: string
): AnswerBlock {
  return {
    question: `What is the cheapest day to fly from ${origin} to ${destination}?`,
    answer: `Tuesday and Wednesday are typically cheapest days to fly from ${origin} to ${destination}, with prices 15-20% lower than weekend flights. Avoid Friday and Sunday departures for best deals.`,
    confidence: 'high',
    lastUpdated: 'December 2025',
    dataFreshness: {
      lastReviewed: new Date().toISOString().split('T')[0],
      updateFrequency: 'weekly',
      staleAfterDays: 7,
    },
    category: 'timing',
  };
}

/**
 * Generate flight duration answer
 */
export function getFlightDurationAnswer(
  origin: string,
  destination: string,
  duration: string,
  directFlights: boolean = true
): AnswerBlock {
  const directInfo = directFlights
    ? `Direct flights from ${origin} to ${destination} take approximately ${duration}.`
    : `There are no direct flights from ${origin} to ${destination}. Connecting flights take approximately ${duration}.`;

  return {
    question: `How long is the flight from ${origin} to ${destination}?`,
    answer: `${directInfo} Flight times may vary based on routing and weather conditions.`,
    confidence: 'high',
    dataFreshness: {
      lastReviewed: new Date().toISOString().split('T')[0],
      updateFrequency: 'daily',
      staleAfterDays: 3,
    },
    category: 'duration',
  };
}

/**
 * Generate airlines answer
 */
export function getAirlinesAnswer(
  origin: string,
  destination: string,
  airlines: string[]
): AnswerBlock {
  const airlineList = airlines.slice(0, 5).join(', ');

  return {
    question: `What airlines fly from ${origin} to ${destination}?`,
    answer: `Airlines operating flights from ${origin} to ${destination} include: ${airlineList}. Compare prices from 500+ airlines on Fly2Any to find best deal.`,
    confidence: 'high',
    dataFreshness: {
      lastReviewed: new Date().toISOString().split('T')[0],
      updateFrequency: 'weekly',
      staleAfterDays: 7,
    },
    category: 'airline',
  };
}

/**
 * Generate average price answer
 */
export function getAvgPriceAnswer(
  origin: string,
  destination: string,
  lowPrice: number,
  highPrice: number,
  currency: string = 'USD'
): AnswerBlock {
  return {
    question: `What is the average flight price from ${origin} to ${destination}?`,
    answer: `Flights from ${origin} to ${destination} typically cost ${currency === 'USD' ? '$' : currency}${lowPrice}-${currency === 'USD' ? '$' : ''}${highPrice} round-trip. Book 6-8 weeks in advance for domestic flights, 3-4 months for international routes, to get best prices.`,
    confidence: 'high',
    lastUpdated: new Date().toISOString().split('T')[0],
    dataFreshness: {
      lastReviewed: new Date().toISOString().split('T')[0],
      updateFrequency: 'hourly',
      staleAfterDays: 1,
    },
    category: 'price',
  };
}

/**
 * Generate best time to book answer
 */
export function getBestTimeToBookAnswer(
  origin: string,
  destination: string,
  isInternational: boolean = false
): AnswerBlock {
  const timeframe = isInternational
    ? '3-4 months before departure'
    : '6-8 weeks before departure';

  return {
    question: `When is the best time to book ${origin} to ${destination} flights?`,
    answer: `The best time to book flights from ${origin} to ${destination} is ${timeframe}. Prices typically increase 2-3 weeks before departure. Use Fly2Any price alerts to track fare changes.`,
    confidence: 'high',
    dataFreshness: {
      lastReviewed: new Date().toISOString().split('T')[0],
      updateFrequency: 'weekly',
      staleAfterDays: 7,
    },
    category: 'timing',
  };
}

/**
 * Generate direct flights answer
 */
export function getDirectFlightsAnswer(
  origin: string,
  destination: string,
  hasDirectFlights: boolean,
  flightDuration?: string
): AnswerBlock {
  if (hasDirectFlights) {
    return {
      question: `Are there direct flights from ${origin} to ${destination}?`,
      answer: `Yes, direct (non-stop) flights are available from ${origin} to ${destination}. ${flightDuration ? `Flight time: approximately ${flightDuration}.` : ''} Multiple airlines offer direct service on this route.`,
      confidence: 'high',
      category: 'general',
    };
  }

  return {
    question: `Are there direct flights from ${origin} to ${destination}?`,
    answer: `There are no direct flights from ${origin} to ${destination}. Most flights have 1-2 connections. ${flightDuration ? `Total travel time: approximately ${flightDuration}.` : ''} Consider nearby airports for more routing options.`,
    confidence: 'high',
    category: 'general',
  };
}

// ============================================================================
// COMPLETE ROUTE ANSWER SET
// ============================================================================

/**
 * Generate all answer blocks for a route
 */
export function generateRouteAnswers(data: RouteAnswerData): AnswerBlock[] {
  const {
    origin,
    destination,
    lowestPrice = 189,
    avgPrice = 350,
    currency = 'USD',
    flightDuration = '3-5 hours',
    airlines = ['American Airlines', 'Delta', 'United'],
    directFlights = true,
  } = data;

  // Determine if international (simple heuristic: 3-letter codes)
  const isInternational = !['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'DEN', 'SFO', 'SEA', 'MIA', 'BOS'].includes(destination);

  return [
    getCheapestDayAnswer(origin, destination),
    getFlightDurationAnswer(origin, destination, flightDuration, directFlights),
    getAirlinesAnswer(origin, destination, airlines),
    getAvgPriceAnswer(origin, destination, lowestPrice, avgPrice, currency),
    getBestTimeToBookAnswer(origin, destination, isInternational),
    getDirectFlightsAnswer(origin, destination, directFlights, flightDuration),
  ];
}

// ============================================================================
// DESTINATION ANSWER BLOCKS
// ============================================================================

/**
 * Generate destination-specific answers
 */
export function generateDestinationAnswers(
  city: string,
  airports: string[],
  avgPrice: number = 250
): AnswerBlock[] {
  const airportList = airports.join(', ');

  return [
    {
      question: `What airports serve ${city}?`,
      answer: `${city} is served by the following airports: ${airportList}. The main international airport is ${airports[0]}. Compare flights to all ${city} airports for the best prices.`,
      confidence: 'high',
      category: 'general',
    },
    {
      question: `What is the cheapest month to fly to ${city}?`,
      answer: `The cheapest months to fly to ${city} are typically January-February and September-October, outside of major holidays. Prices can be 20-40% lower during off-peak seasons.`,
      confidence: 'high',
      lastUpdated: 'December 2025',
      category: 'timing',
    },
    {
      question: `How much do flights to ${city} cost?`,
      answer: `Flights to ${city} typically cost $${avgPrice - 100}-$${avgPrice + 150} round-trip from major US cities. Prices vary based on origin, time of year, and how far in advance you book.`,
      confidence: 'high',
      lastUpdated: 'December 2025',
      category: 'price',
    },
  ];
}

// ============================================================================
// EVENT ANSWER BLOCKS (World Cup 2026)
// ============================================================================

export const WORLD_CUP_2026_ANSWERS: AnswerBlock[] = [
  {
    question: 'When is the 2026 FIFA World Cup?',
    answer: 'The 2026 FIFA World Cup will be held from June 11 to July 19, 2026. It will be co-hosted by the United States, Mexico, and Canada, featuring 48 teams for the first time in World Cup history.',
    confidence: 'high',
    lastUpdated: 'December 2025',
    category: 'general',
  },
  {
    question: 'What cities are hosting the 2026 World Cup?',
    answer: 'The 16 host cities for the 2026 World Cup include: USA (11 cities) - New York/New Jersey, Los Angeles, Dallas, Miami, Atlanta, Houston, Seattle, Boston, San Francisco, Philadelphia, Kansas City. Mexico (3) - Mexico City, Guadalajara, Monterrey. Canada (2) - Toronto, Vancouver.',
    confidence: 'high',
    category: 'general',
  },
  {
    question: 'Where is the 2026 World Cup final?',
    answer: 'The 2026 FIFA World Cup Final will be held at MetLife Stadium in East Rutherford, New Jersey (New York/New Jersey) on July 19, 2026. MetLife Stadium has a capacity of 82,500 for the World Cup.',
    confidence: 'high',
    category: 'general',
  },
  {
    question: 'When should I book flights for World Cup 2026?',
    answer: 'For the 2026 World Cup, book flights 6-9 months in advance (October 2025 - January 2026) for the best prices. Flight prices to host cities will increase significantly closer to the tournament. Set price alerts on Fly2Any to track fare changes.',
    confidence: 'high',
    lastUpdated: 'December 2025',
    category: 'timing',
  },
];

// ============================================================================
// BAGGAGE ANSWER BLOCKS
// ============================================================================

export const BAGGAGE_ANSWERS: AnswerBlock[] = [
  {
    question: 'How much does checked baggage cost on US airlines?',
    answer: 'First checked bag costs $30-$35 each way on most major US airlines (United, American, Delta, JetBlue). Second bag costs $40-$45. Southwest Airlines includes 2 free checked bags on all fares. Spirit and Frontier charge $30-$65 per bag.',
    confidence: 'high',
    lastUpdated: 'December 2025',
    category: 'price',
  },
  {
    question: 'What is the weight limit for checked bags?',
    answer: 'Standard weight limit for checked bags is 50 lbs (23 kg) in Economy class and 70 lbs (32 kg) in Business/First Class on most airlines. Overweight bag fees of $100-$200 apply for bags exceeding these limits.',
    confidence: 'high',
    category: 'general',
  },
  {
    question: 'What are carry-on bag size limits?',
    answer: 'Standard carry-on size limit is 22 x 14 x 9 inches (56 x 36 x 23 cm) including wheels and handles. Personal items must fit under the seat, typically 18 x 14 x 8 inches. Basic Economy fares on some airlines allow only a personal item.',
    confidence: 'high',
    category: 'general',
  },
  {
    question: 'Which airlines have free checked bags?',
    answer: 'Southwest Airlines includes 2 free checked bags on all fares. International Business/First Class typically includes 2-3 free bags. Some credit cards offer free checked bag benefits on specific airlines.',
    confidence: 'high',
    lastUpdated: 'December 2025',
    category: 'general',
  },
];

// ============================================================================
// GENERAL FLIGHT ANSWERS
// ============================================================================

export const GENERAL_FLIGHT_ANSWERS: AnswerBlock[] = [
  {
    question: 'What is the best day to book flights?',
    answer: 'Tuesday and Wednesday are often cited as the best days to book flights, though prices can vary. The most important factor is booking 6-8 weeks in advance for domestic and 3-4 months for international flights. Use price tracking tools to find the optimal booking time.',
    confidence: 'high',
    category: 'timing',
  },
  {
    question: 'How can I find cheap flights?',
    answer: 'To find cheap flights: 1) Book 6-8 weeks in advance for domestic, 3-4 months for international. 2) Be flexible with dates - use price calendars. 3) Set price alerts for your route. 4) Consider nearby airports. 5) Fly midweek (Tuesday/Wednesday are cheapest). 6) Compare prices on Fly2Any.',
    confidence: 'high',
    category: 'general',
  },
  {
    question: 'What time of year are flights cheapest?',
    answer: 'Flight prices are typically lowest in January-February (after holidays), September (after summer), and early December (before holiday rush). Avoid Thanksgiving week, Christmas, spring break, and July 4th for the highest prices.',
    confidence: 'high',
    category: 'timing',
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

export const AnswerBlocks = {
  // Route generators
  generateRouteAnswers,
  getCheapestDayAnswer,
  getFlightDurationAnswer,
  getAirlinesAnswer,
  getAvgPriceAnswer,
  getBestTimeToBookAnswer,
  getDirectFlightsAnswer,

  // Destination generators
  generateDestinationAnswers,

  // Pre-built collections
  worldCup2026: WORLD_CUP_2026_ANSWERS,
  baggage: BAGGAGE_ANSWERS,
  generalFlight: GENERAL_FLIGHT_ANSWERS,
};

export default AnswerBlocks;
