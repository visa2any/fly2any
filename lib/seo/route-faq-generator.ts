/**
 * Dynamic Route FAQ Generator
 *
 * Generates unique, route-specific FAQs for flight pages
 * Optimized for LLM extraction and AEO (Answer Engine Optimization)
 *
 * Features:
 * - Route distance-based flight duration estimates
 * - Seasonal pricing insights
 * - Airport-specific tips
 * - Time zone information
 * - Connection hub alternatives
 */

export interface RouteContext {
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  flightDuration?: string;
  distance?: number;
  isInternational?: boolean;
  isDomestic?: boolean;
  timezone?: {
    origin: string;
    destination: string;
    difference: number;
  };
}

export interface GeneratedFAQ {
  question: string;
  answer: string;
}

// US airport hub data for more specific answers
const HUB_AIRPORTS: Record<string, { airlines: string[]; tips: string }> = {
  JFK: {
    airlines: ['JetBlue', 'Delta', 'American Airlines'],
    tips: 'JFK has 6 terminals - arrive 3 hours early for international flights. The AirTrain connects all terminals.',
  },
  LAX: {
    airlines: ['American Airlines', 'Delta', 'United', 'Southwest'],
    tips: 'LAX is notoriously busy. Allow extra time for traffic and use the FlyAway bus from Union Station to avoid congestion.',
  },
  ORD: {
    airlines: ['American Airlines', 'United'],
    tips: "O'Hare is a major hub for both American and United. Check for connecting flight deals through Chicago.",
  },
  ATL: {
    airlines: ['Delta', 'Southwest'],
    tips: 'Atlanta is the world busiest airport. Delta operates most flights here with excellent domestic connections.',
  },
  DFW: {
    airlines: ['American Airlines', 'Southwest'],
    tips: 'DFW is massive - use the Skylink train between terminals. American Airlines has its largest hub here.',
  },
  MIA: {
    airlines: ['American Airlines', 'LATAM', 'Avianca'],
    tips: 'Miami is the gateway to Latin America. Many carriers offer competitive prices to South American destinations.',
  },
  SFO: {
    airlines: ['United', 'Alaska Airlines'],
    tips: 'SFO offers excellent connections to Asia-Pacific. Fog can cause delays, especially in summer mornings.',
  },
  SEA: {
    airlines: ['Alaska Airlines', 'Delta'],
    tips: 'Seattle-Tacoma is Alaska Airlines main hub with strong connections to West Coast and Asian destinations.',
  },
  BOS: {
    airlines: ['JetBlue', 'Delta'],
    tips: 'Boston Logan has great public transit access via the Blue Line. JetBlue offers many affordable routes.',
  },
  DEN: {
    airlines: ['United', 'Southwest', 'Frontier'],
    tips: 'Denver is a major connecting hub. The train to downtown takes 37 minutes for just $10.50.',
  },
};

// Seasonal price patterns
const SEASONAL_INSIGHTS: Record<string, { peak: string[]; cheap: string[]; note: string }> = {
  domestic: {
    peak: ['July', 'August', 'December', 'Thanksgiving week'],
    cheap: ['January', 'February', 'September', 'October'],
    note: 'Domestic flights are typically 20-40% cheaper in off-peak months.',
  },
  europe: {
    peak: ['June', 'July', 'August', 'December'],
    cheap: ['January', 'February', 'November'],
    note: 'Shoulder seasons (April-May, September-October) offer good weather and moderate prices.',
  },
  caribbean: {
    peak: ['December', 'January', 'February', 'March'],
    cheap: ['September', 'October', 'November'],
    note: 'Hurricane season (June-November) brings lower prices but check weather forecasts.',
  },
  asia: {
    peak: ['Chinese New Year', 'July', 'August', 'December'],
    cheap: ['February', 'May', 'September', 'October'],
    note: 'Avoid major Asian holidays for best prices. Shoulder seasons offer pleasant weather.',
  },
  default: {
    peak: ['Summer months', 'Winter holidays'],
    cheap: ['Spring and fall'],
    note: 'Booking 6-8 weeks in advance typically yields the best prices.',
  },
};

/**
 * Estimate flight duration based on common routes
 */
function estimateFlightDuration(origin: string, destination: string): string {
  const durations: Record<string, string> = {
    // Transcontinental US
    'JFK-LAX': '5h 30m', 'LAX-JFK': '5h 00m',
    'JFK-SFO': '6h 00m', 'SFO-JFK': '5h 15m',
    'BOS-LAX': '6h 15m', 'LAX-BOS': '5h 30m',
    // East Coast hubs
    'JFK-ATL': '2h 15m', 'JFK-MIA': '3h 00m',
    'JFK-ORD': '2h 30m', 'BOS-MIA': '3h 15m',
    // West Coast
    'LAX-SEA': '2h 30m', 'LAX-SFO': '1h 20m',
    'SFO-SEA': '2h 00m', 'LAX-LAS': '1h 10m',
    // International - Europe
    'JFK-LHR': '7h 00m', 'JFK-CDG': '7h 30m',
    'LAX-LHR': '10h 30m', 'ORD-LHR': '8h 00m',
    // International - Asia
    'LAX-NRT': '11h 30m', 'SFO-NRT': '11h 00m',
    'JFK-HND': '14h 00m', 'LAX-ICN': '13h 00m',
    // International - Latin America
    'MIA-GRU': '8h 30m', 'JFK-MEX': '4h 30m',
    'LAX-CUN': '4h 00m', 'DFW-MEX': '2h 30m',
  };

  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;

  return durations[key] || durations[reverseKey] || '3-5 hours';
}

/**
 * Get region for a destination
 */
function getRegion(code: string): string {
  const regions: Record<string, string> = {
    // Europe
    LHR: 'europe', CDG: 'europe', FRA: 'europe', AMS: 'europe',
    FCO: 'europe', MAD: 'europe', BCN: 'europe', MUC: 'europe',
    // Asia
    NRT: 'asia', HND: 'asia', ICN: 'asia', PEK: 'asia',
    HKG: 'asia', SIN: 'asia', BKK: 'asia', KIX: 'asia',
    // Caribbean
    SJU: 'caribbean', CUN: 'caribbean', PUJ: 'caribbean', NAS: 'caribbean',
    // Default is domestic
  };

  return regions[code] || 'domestic';
}

/**
 * Generate unique, dynamic FAQs for a flight route
 */
export function generateRouteFAQs(context: RouteContext): GeneratedFAQ[] {
  const {
    origin,
    originName,
    destination,
    destinationName,
    flightDuration = estimateFlightDuration(origin, destination),
  } = context;

  const region = getRegion(destination);
  const seasonal = SEASONAL_INSIGHTS[region] || SEASONAL_INSIGHTS.default;
  const originHub = HUB_AIRPORTS[origin];
  const destHub = HUB_AIRPORTS[destination];

  const faqs: GeneratedFAQ[] = [];

  // 1. Flight Duration FAQ - Always include
  faqs.push({
    question: `How long is the flight from ${originName} to ${destinationName}?`,
    answer: `Direct flights from ${originName} (${origin}) to ${destinationName} (${destination}) take approximately ${flightDuration}. ${
      flightDuration.includes('h')
        ? `Connecting flights may add 2-4 hours depending on layover location. For the fastest journey, look for nonstop flights which are typically available on this popular route.`
        : 'Flight times may vary based on weather conditions and air traffic.'
    }`,
  });

  // 2. Best Booking Time FAQ
  faqs.push({
    question: `When is the best time to book ${origin} to ${destination} flights?`,
    answer: `For the best prices on ${origin} to ${destination} flights, book 6-8 weeks in advance for domestic routes or 2-4 months ahead for international travel. ${seasonal.note} Peak season months (${seasonal.peak.slice(0, 2).join(', ')}) have higher prices, while ${seasonal.cheap.slice(0, 2).join(' and ')} typically offer the best deals.`,
  });

  // 3. Cheapest Days FAQ
  faqs.push({
    question: `What are the cheapest days to fly from ${originName} to ${destinationName}?`,
    answer: `Tuesday and Wednesday departures are typically 15-25% cheaper than weekend flights on the ${origin} to ${destination} route. Saturday is usually the most expensive day to fly. For additional savings, consider red-eye flights or early morning departures, which often have lower fares and less crowded airports.`,
  });

  // 4. Airlines FAQ with specific data if available
  const airlinesAnswer = originHub
    ? `Major carriers on this route include ${originHub.airlines.join(', ')}, and other domestic and international airlines. ${originHub.tips}`
    : `Multiple airlines serve the ${origin} to ${destination} route. Compare prices across all carriers using Fly2Any to find the best combination of price, timing, and amenities.`;

  faqs.push({
    question: `Which airlines fly from ${origin} to ${destination}?`,
    answer: airlinesAnswer,
  });

  // 5. Airport-specific tip if departing from a hub
  if (originHub) {
    faqs.push({
      question: `What should I know about flying from ${originName} airport?`,
      answer: originHub.tips + ` Book flights that depart mid-morning or early afternoon for the smoothest experience - these times typically have shorter security lines and fewer delays.`,
    });
  }

  // 6. Seasonal pricing insight
  faqs.push({
    question: `What is the cheapest month to fly from ${originName} to ${destinationName}?`,
    answer: `The cheapest months to fly from ${origin} to ${destination} are typically ${seasonal.cheap.slice(0, 3).join(', ')}. ${seasonal.note} Avoid peak travel periods like ${seasonal.peak.slice(0, 2).join(' and ')} when prices can be 30-50% higher. Use Fly2Any's price alerts to get notified when fares drop.`,
  });

  // 7. Baggage FAQ
  faqs.push({
    question: `What is the baggage allowance for ${origin} to ${destination} flights?`,
    answer: `Baggage allowances vary by airline and fare class. Most full-service carriers include one checked bag (up to 50 lbs) on this route. Budget carriers may charge $25-$60 for checked bags. All airlines allow one personal item free. Compare total costs including baggage fees when booking to get the best deal.`,
  });

  // 8. Direct vs connecting flights
  faqs.push({
    question: `Are there direct flights from ${originName} to ${destinationName}?`,
    answer: `Yes, several airlines offer nonstop flights from ${origin} to ${destination}. Direct flights take approximately ${flightDuration}. If you're flexible with your schedule, connecting flights through major hubs like ${['ATL', 'ORD', 'DFW', 'DEN'].filter(h => h !== origin && h !== destination).slice(0, 2).join(' or ')} may offer lower prices.`,
  });

  // 9. Price range FAQ
  faqs.push({
    question: `How much do flights from ${originName} to ${destinationName} cost?`,
    answer: `Prices for ${origin} to ${destination} flights typically range from $150-$500 roundtrip for economy class, depending on when you book and travel dates. ${region !== 'domestic' ? 'International routes may range from $400-$1,200.' : ''} Use Fly2Any to compare all airlines and find current deals. Setting a price alert ensures you never miss a fare drop.`,
  });

  // 10. Destination-specific tip if arriving at a hub
  if (destHub) {
    faqs.push({
      question: `What should I know about arriving at ${destinationName} airport?`,
      answer: destHub.tips + ` Many travelers recommend downloading the airline's app before arrival for real-time gate updates and mobile boarding passes.`,
    });
  }

  return faqs;
}

/**
 * Generate FAQ schema for structured data
 */
export function generateFAQSchema(faqs: GeneratedFAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default generateRouteFAQs;
