/**
 * Travel Knowledge Base - Stub Module
 * Provides travel-related knowledge queries
 */

// Types
export interface QueryResult {
  answer: string;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  relatedTopics?: string[];
}

export interface BaggagePolicy {
  airline: string;
  cabinBaggage: string;
  checkedBaggage: string;
  fees: string;
}

export interface FareClass {
  code: string;
  name: string;
  cabin: string;
  features: string[];
}

export interface HotelChain {
  name: string;
  loyaltyProgram: string;
  brands: string[];
}

type KnowledgeCategory = 'flights' | 'hotels' | 'legal' | 'visa' | 'tips' | 'general';

// Baggage policies database
const BAGGAGE_POLICIES: Record<string, BaggagePolicy> = {
  'united airlines': {
    airline: 'United Airlines',
    cabinBaggage: '1 carry-on bag + 1 personal item',
    checkedBaggage: 'First bag $35, Second bag $45',
    fees: 'Basic Economy: $35 first bag'
  },
  'delta': {
    airline: 'Delta Air Lines',
    cabinBaggage: '1 carry-on bag + 1 personal item',
    checkedBaggage: 'First bag $35, Second bag $45',
    fees: 'Main Cabin and above: First bag free for SkyMiles members'
  },
  'american airlines': {
    airline: 'American Airlines',
    cabinBaggage: '1 carry-on bag + 1 personal item',
    checkedBaggage: 'First bag $35, Second bag $45',
    fees: 'Basic Economy: No carry-on allowed (personal item only)'
  }
};

// Fare classes database
const FARE_CLASSES: Record<string, FareClass> = {
  'f': { code: 'F', name: 'First Class', cabin: 'First', features: ['Premium meals', 'Lie-flat seats'] },
  'j': { code: 'J', name: 'Business Class', cabin: 'Business', features: ['Priority boarding', 'Lounge access'] },
  'y': { code: 'Y', name: 'Economy Class', cabin: 'Economy', features: ['Standard seat', 'Basic meals'] },
  'w': { code: 'W', name: 'Premium Economy', cabin: 'Premium Economy', features: ['Extra legroom', 'Enhanced meals'] }
};

// Airline alliances
const AIRLINE_ALLIANCES: Record<string, string> = {
  'united airlines': 'Star Alliance',
  'lufthansa': 'Star Alliance',
  'ana': 'Star Alliance',
  'american airlines': 'OneWorld',
  'british airways': 'OneWorld',
  'qantas': 'OneWorld',
  'delta': 'SkyTeam',
  'air france': 'SkyTeam',
  'klm': 'SkyTeam'
};

// Hotel chains
const HOTEL_CHAINS: Record<string, HotelChain> = {
  'marriott': { name: 'Marriott International', loyaltyProgram: 'Marriott Bonvoy', brands: ['Courtyard', 'Fairfield', 'Ritz-Carlton'] },
  'hilton': { name: 'Hilton Worldwide', loyaltyProgram: 'Hilton Honors', brands: ['Hampton Inn', 'DoubleTree', 'Conrad'] },
  'ihg': { name: 'IHG Hotels', loyaltyProgram: 'IHG One Rewards', brands: ['Holiday Inn', 'Crowne Plaza', 'InterContinental'] }
};

// EU countries for EU261
const EU_COUNTRIES = ['france', 'germany', 'spain', 'italy', 'netherlands', 'belgium', 'austria', 'portugal', 'greece', 'sweden', 'poland', 'ireland'];

// Passport validity requirements
const PASSPORT_VALIDITY: Record<string, string> = {
  'thailand': 'Passport must be valid for at least 6 months beyond entry date',
  'france': 'Passport must be valid for at least 3 months beyond departure from Schengen area',
  'germany': 'Passport must be valid for at least 3 months beyond departure from Schengen area',
  'united states': 'Valid for duration of stay',
  'japan': 'Passport must be valid for duration of stay',
  'australia': 'Passport must be valid for at least 6 months'
};

/**
 * Query the knowledge base
 */
export function queryKnowledge(
  category: KnowledgeCategory,
  query: string,
  context?: { airline?: string; destination?: string }
): QueryResult | null {
  if (!query || query.trim().length === 0) return null;

  const q = query.toLowerCase();

  // Baggage queries
  if (q.includes('baggage') || q.includes('luggage') || q.includes('bag')) {
    const airline = context?.airline || extractAirline(q);
    if (airline) {
      const policy = getBaggagePolicy(airline);
      if (policy) {
        return {
          answer: `${policy.airline} baggage policy: ${policy.cabinBaggage}. Checked baggage: ${policy.checkedBaggage}`,
          sources: ['Airline Policy Database'],
          confidence: 'high'
        };
      }
    }
    return {
      answer: 'Most airlines allow 1 carry-on bag and 1 personal item. Checked baggage fees vary by airline.',
      sources: ['General Aviation Guidelines'],
      confidence: 'high',
      relatedTopics: ['Checked baggage fees', 'Carry-on restrictions']
    };
  }

  // EU261 queries
  if (q.includes('eu261') || (q.includes('compensation') && q.includes('eu'))) {
    return {
      answer: 'EU261 compensation: €250 (under 1500km), €400 (1500-3500km), €600 (over 3500km) for delays 3+ hours',
      sources: ['EU Regulation 261/2004'],
      confidence: 'high'
    };
  }

  // DOT queries
  if (q.includes('dot') || (q.includes('compensation') && q.includes('us'))) {
    return {
      answer: 'DOT compensation for denied boarding: 200% fare (1-2hr delay, max $775), 400% fare (2+hr delay, max $1,550)',
      sources: ['US DOT Regulations'],
      confidence: 'high'
    };
  }

  // Compensation general
  if (q.includes('compensation') || q.includes('delay')) {
    return {
      answer: 'Flight delay compensation depends on region. EU flights: EU261 (€250-600). US flights: DOT rules for denied boarding.',
      sources: ['Aviation Regulations'],
      confidence: 'medium'
    };
  }

  // Visa queries
  if (q.includes('visa') || q.includes('passport')) {
    return {
      answer: 'visa requirements vary by destination. Most countries require passport valid for 6 months beyond travel dates.',
      sources: ['Travel Advisory Database'],
      confidence: 'medium'
    };
  }

  // Cancellation queries
  if (q.includes('cancel')) {
    if (category === 'hotels') {
      return {
        answer: 'Hotel cancellation policies vary. Most allow free cancellation 24-48 hours before check-in.',
        sources: ['Hotel Policy Guidelines'],
        confidence: 'medium'
      };
    }
    return {
      answer: 'Flight cancellation policies depend on fare type. Refundable fares allow full refund. Non-refundable may get credit minus fees.',
      sources: ['Airline Policy Guidelines'],
      confidence: 'medium'
    };
  }

  // Fare class queries
  if (q.includes('business') || q.includes('class') || q.includes('fare')) {
    const code = extractFareCode(q);
    if (code) {
      const fc = getFareClass(code);
      if (fc) {
        return {
          answer: `${fc.code} class is ${fc.name} (${fc.cabin}). Features: ${fc.features.join(', ')}`,
          sources: ['Fare Class Reference'],
          confidence: 'high'
        };
      }
    }
    return {
      answer: 'Business class offers premium service with lie-flat seats, priority boarding, and lounge access.',
      sources: ['Airline Service Standards'],
      confidence: 'medium'
    };
  }

  // Check-in queries
  if (q.includes('check-in') || q.includes('checkin')) {
    return {
      answer: 'Standard hotel check-in time is 3:00 PM. Check-out is typically 11:00 AM. Early check-in may be available upon request.',
      sources: ['Hotel Standards'],
      confidence: 'medium'
    };
  }

  // Amenities
  if (q.includes('amenities') || q.includes('facilities')) {
    return {
      answer: 'Common hotel amenities include WiFi, fitness center, pool, breakfast, parking. Varies by property.',
      sources: ['Hotel Standards'],
      confidence: 'medium'
    };
  }

  // Booking timing
  if ((q.includes('when') && q.includes('book')) || (q.includes('best') && q.includes('time') && q.includes('book'))) {
    return {
      answer: 'Best time to book flights: domestic 1-3 months ahead, international 2-8 months ahead. Tuesday often has lowest prices.',
      sources: ['Travel Pricing Analysis'],
      confidence: 'medium'
    };
  }

  // Packing
  if (q.includes('pack')) {
    return {
      answer: 'Essential packing tips: Check airline baggage limits, roll clothes to save space, bring essentials in carry-on.',
      sources: ['Travel Tips Database'],
      confidence: 'medium'
    };
  }

  // Jet lag
  if (q.includes('jet lag')) {
    return {
      answer: 'To reduce jet lag: adjust sleep schedule before travel, stay hydrated, get sunlight at destination, avoid alcohol.',
      sources: ['Health Travel Guidelines'],
      confidence: 'medium'
    };
  }

  // Security
  if (q.includes('security')) {
    return {
      answer: 'Airport security tips: Arrive 2-3 hours early, liquids in 3.4oz containers, remove laptops from bags, wear slip-on shoes.',
      sources: ['TSA Guidelines'],
      confidence: 'high'
    };
  }

  // Insurance
  if (q.includes('insurance')) {
    return {
      answer: 'Travel insurance recommended for international trips. Covers trip cancellation, medical emergencies, lost baggage.',
      sources: ['Travel Insurance Guidelines'],
      confidence: 'high'
    };
  }

  // Gibberish detection
  if (!/[aeiou]/i.test(q) || q.split(' ').every(w => w.length < 2)) {
    return null;
  }

  return null;
}

/**
 * Get baggage policy for airline
 */
export function getBaggagePolicy(airline: string): BaggagePolicy | null {
  const key = airline.toLowerCase();
  return BAGGAGE_POLICIES[key] || null;
}

/**
 * Get fare class info
 */
export function getFareClass(code: string): FareClass | null {
  return FARE_CLASSES[code.toLowerCase()] || null;
}

/**
 * Get compensation amount
 */
export function getCompensationAmount(regulation: 'EU261' | 'DOT', distanceKm: number, delayHours: number): string {
  if (regulation === 'EU261') {
    if (delayHours < 3) return 'Not eligible for compensation';
    if (distanceKm <= 1500) return '€250';
    if (distanceKm <= 3500) return '€400';
    return '€600';
  }
  if (regulation === 'DOT') {
    if (delayHours < 1) return 'Not eligible';
    if (delayHours < 2) return '200% of one-way fare (max $775)';
    return '400% of one-way fare (max $1,550)';
  }
  return 'Unknown regulation';
}

/**
 * Check EU261 eligibility
 */
export function isEligibleEU261(departureCountry: string, arrivalCountry: string, airlineCountry: string, delayHours: number): boolean {
  if (delayHours < 3) return false;
  const depEU = EU_COUNTRIES.includes(departureCountry.toLowerCase());
  const arrEU = EU_COUNTRIES.includes(arrivalCountry.toLowerCase());
  const airlineEU = EU_COUNTRIES.includes(airlineCountry.toLowerCase());
  return depEU || (arrEU && airlineEU);
}

/**
 * Get passport validity requirement
 */
export function getPassportValidityRequirement(country: string): string {
  return PASSPORT_VALIDITY[country.toLowerCase()] || 'Passport must be valid for at least 6 months beyond travel dates';
}

/**
 * Get hotel chain info
 */
export function getHotelChain(hotelName: string): HotelChain | null {
  const name = hotelName.toLowerCase();
  for (const [key, chain] of Object.entries(HOTEL_CHAINS)) {
    if (name.includes(key) || chain.brands.some(b => name.includes(b.toLowerCase()))) {
      return chain;
    }
  }
  return null;
}

/**
 * Get airline alliance
 */
export function getAirlineAlliance(airline: string): string | null {
  return AIRLINE_ALLIANCES[airline.toLowerCase()] || null;
}

// Helper functions
function extractAirline(query: string): string | null {
  const airlines = Object.keys(BAGGAGE_POLICIES);
  for (const airline of airlines) {
    if (query.includes(airline)) return airline;
  }
  return null;
}

function extractFareCode(query: string): string | null {
  const match = query.match(/\b([fjywc])\s*class\b/i);
  return match ? match[1] : null;
}
