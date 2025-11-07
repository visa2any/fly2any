/**
 * Comprehensive Travel Request Parser
 *
 * Understands ALL ways users might phrase travel requests:
 * - Multiple date formats
 * - Airport codes and city names
 * - Direct flight preferences
 * - Baggage requirements
 * - Round-trip vs one-way
 * - Passenger counts
 */

export interface ParsedTravelRequest {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: {
    adults: number;
    children?: number;
    infants?: number;
  };
  tripType?: 'one-way' | 'round-trip';
  preferences?: {
    directFlights?: boolean;
    includeBags?: boolean;
    cabinClass?: 'economy' | 'premium' | 'business' | 'first';
  };
  confidence: {
    origin: number;
    destination: number;
    dates: number;
  };
}

// Comprehensive list of major airports and cities
const LOCATION_DATABASE = {
  // North America - USA
  'nyc': { city: 'New York', airports: ['JFK', 'LGA', 'EWR'], country: 'USA' },
  'new york': { city: 'New York', airports: ['JFK', 'LGA', 'EWR'], country: 'USA' },
  'jfk': { city: 'New York', airport: 'JFK', country: 'USA' },
  'lga': { city: 'New York', airport: 'LGA', country: 'USA' },
  'ewr': { city: 'Newark', airport: 'EWR', country: 'USA' },
  'lax': { city: 'Los Angeles', airport: 'LAX', country: 'USA' },
  'los angeles': { city: 'Los Angeles', airports: ['LAX'], country: 'USA' },
  'sfo': { city: 'San Francisco', airport: 'SFO', country: 'USA' },
  'san francisco': { city: 'San Francisco', airports: ['SFO'], country: 'USA' },
  'mia': { city: 'Miami', airport: 'MIA', country: 'USA' },
  'miami': { city: 'Miami', airports: ['MIA'], country: 'USA' },
  'ord': { city: 'Chicago', airport: 'ORD', country: 'USA' },
  'chicago': { city: 'Chicago', airports: ['ORD', 'MDW'], country: 'USA' },

  // South America - Brazil
  'gru': { city: 'São Paulo', airport: 'GRU', country: 'Brazil' },
  'sao paulo': { city: 'São Paulo', airports: ['GRU', 'CGH'], country: 'Brazil' },
  'são paulo': { city: 'São Paulo', airports: ['GRU', 'CGH'], country: 'Brazil' },
  'sp': { city: 'São Paulo', airports: ['GRU', 'CGH'], country: 'Brazil' },
  'gig': { city: 'Rio de Janeiro', airport: 'GIG', country: 'Brazil' },
  'rio': { city: 'Rio de Janeiro', airports: ['GIG', 'SDU'], country: 'Brazil' },
  'rio de janeiro': { city: 'Rio de Janeiro', airports: ['GIG', 'SDU'], country: 'Brazil' },

  // Europe
  'lhr': { city: 'London', airport: 'LHR', country: 'UK' },
  'london': { city: 'London', airports: ['LHR', 'LGW', 'STN'], country: 'UK' },
  'cdg': { city: 'Paris', airport: 'CDG', country: 'France' },
  'paris': { city: 'Paris', airports: ['CDG', 'ORY'], country: 'France' },
  'mad': { city: 'Madrid', airport: 'MAD', country: 'Spain' },
  'madrid': { city: 'Madrid', airports: ['MAD'], country: 'Spain' },
  'bcn': { city: 'Barcelona', airport: 'BCN', country: 'Spain' },
  'barcelona': { city: 'Barcelona', airports: ['BCN'], country: 'Spain' },
  'rome': { city: 'Rome', airports: ['FCO'], country: 'Italy' },
  'fco': { city: 'Rome', airport: 'FCO', country: 'Italy' },

  // Asia
  'nrt': { city: 'Tokyo', airport: 'NRT', country: 'Japan' },
  'tokyo': { city: 'Tokyo', airports: ['NRT', 'HND'], country: 'Japan' },
  'sin': { city: 'Singapore', airport: 'SIN', country: 'Singapore' },
  'singapore': { city: 'Singapore', airports: ['SIN'], country: 'Singapore' },
  'dubai': { city: 'Dubai', airports: ['DXB'], country: 'UAE' },
  'dxb': { city: 'Dubai', airport: 'DXB', country: 'UAE' },
};

// Month names and variations
const MONTH_PATTERNS = {
  'january': 1, 'jan': 1,
  'february': 2, 'feb': 2,
  'march': 3, 'mar': 3,
  'april': 4, 'apr': 4,
  'may': 5,
  'june': 6, 'jun': 6,
  'july': 7, 'jul': 7,
  'august': 8, 'aug': 8,
  'september': 9, 'sep': 9, 'sept': 9,
  'october': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'december': 12, 'dec': 12,
};

/**
 * Parse dates from natural language text
 * Handles: "November 15", "nov 15", "11/15", "2024-11-15", etc.
 */
export function extractDates(message: string): { departure?: string; return?: string } {
  const lowerMsg = message.toLowerCase();
  const currentYear = new Date().getFullYear();
  const dates: string[] = [];

  // Pattern 1: Month name + day (e.g., "November 15", "nov 15")
  const monthDayPattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi;
  let match;
  while ((match = monthDayPattern.exec(message)) !== null) {
    const monthName = match[1].toLowerCase();
    const day = parseInt(match[2]);
    const month = MONTH_PATTERNS[monthName];

    if (month && day >= 1 && day <= 31) {
      // Format as YYYY-MM-DD
      const dateStr = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(dateStr);
    }
  }

  // Pattern 2: MM/DD or M/D format
  const slashPattern = /\b(\d{1,2})\/(\d{1,2})\b/g;
  while ((match = slashPattern.exec(message)) !== null) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const dateStr = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(dateStr);
    }
  }

  // Pattern 3: ISO format YYYY-MM-DD
  const isoPattern = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g;
  while ((match = isoPattern.exec(message)) !== null) {
    dates.push(match[0]);
  }

  // Pattern 4: "day month" format (e.g., "15 November")
  const dayMonthPattern = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/gi;
  while ((match = dayMonthPattern.exec(message)) !== null) {
    const day = parseInt(match[1]);
    const monthName = match[2].toLowerCase();
    const month = MONTH_PATTERNS[monthName];

    if (month && day >= 1 && day <= 31) {
      const dateStr = `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(dateStr);
    }
  }

  // Detect keywords that indicate return date
  const hasReturnKeywords = /\breturn(?:ing)?\b|\bback\b|\bcome\s+back\b|\bround.?trip\b/i.test(lowerMsg);

  // Extract departure and return
  const result: { departure?: string; return?: string } = {};

  if (dates.length > 0) {
    result.departure = dates[0];

    // If we have 2 dates OR user mentioned returning/round-trip
    if (dates.length > 1) {
      result.return = dates[1];
    } else if (hasReturnKeywords && dates.length === 1) {
      // User wants round-trip but only mentioned one date
      // We'll note this but not guess a return date
      result.return = undefined;
    }
  }

  return result;
}

/**
 * Extract origin and destination from message
 * Handles airport codes, city names, and various phrasings
 */
export function extractLocations(message: string): { origin?: string; destination?: string; confidence: { origin: number; destination: number } } {
  const lowerMsg = message.toLowerCase();

  // Common patterns for origin/destination
  const fromToPatterns = [
    /\bfrom\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$|\.|,)/i,
    /\b([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s|$|\.|,)/i,
    /\bleaving\s+(?:from\s+)?([a-z\s]+?)(?:\s+to|\s+for)\s+([a-z\s]+?)(?:\s|$|\.|,)/i,
    /\bflying\s+(?:from\s+)?([a-z\s]+?)(?:\s+to|\s+for)\s+([a-z\s]+?)(?:\s|$|\.|,)/i,
    /\b([a-z]{3})\s*(?:to|-|→)\s*([a-z]{3})\b/i, // NYC-GRU or NYC to GRU
  ];

  let origin: string | undefined;
  let destination: string | undefined;
  let originConfidence = 0;
  let destConfidence = 0;

  // Try pattern matching first
  for (const pattern of fromToPatterns) {
    const match = message.match(pattern);
    if (match) {
      const potentialOrigin = match[1].trim().toLowerCase();
      const potentialDest = match[2].trim().toLowerCase();

      // Look up in database
      const originData = findLocation(potentialOrigin);
      const destData = findLocation(potentialDest);

      if (originData) {
        origin = originData.display;
        originConfidence = 0.9;
      }

      if (destData) {
        destination = destData.display;
        destConfidence = 0.9;
      }

      if (origin && destination) break;
    }
  }

  // Fallback: Search for any known locations
  if (!origin || !destination) {
    const foundLocations: Array<{ location: string; position: number; type: 'origin' | 'destination' }> = [];

    for (const [key, data] of Object.entries(LOCATION_DATABASE)) {
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      const match = message.match(regex);
      if (match && match.index !== undefined) {
        const display = 'city' in data ? data.city : key.toUpperCase();
        foundLocations.push({
          location: display,
          position: match.index,
          type: 'origin' // Will determine type by position later
        });
      }
    }

    // Sort by position in text
    foundLocations.sort((a, b) => a.position - b.position);

    // First location is likely origin, second is destination
    if (foundLocations.length >= 2) {
      origin = origin || foundLocations[0].location;
      destination = destination || foundLocations[1].location;
      originConfidence = Math.max(originConfidence, 0.7);
      destConfidence = Math.max(destConfidence, 0.7);
    } else if (foundLocations.length === 1) {
      // Only one location found - likely destination
      destination = destination || foundLocations[0].location;
      destConfidence = Math.max(destConfidence, 0.6);
    }
  }

  return {
    origin,
    destination,
    confidence: {
      origin: originConfidence,
      destination: destConfidence,
    },
  };
}

/**
 * Helper to find location in database
 */
function findLocation(searchTerm: string): { display: string; code?: string } | null {
  const normalized = searchTerm.toLowerCase().trim();

  if (LOCATION_DATABASE[normalized]) {
    const data = LOCATION_DATABASE[normalized];
    if ('city' in data) {
      return { display: data.city, code: 'airports' in data ? data.airports[0] : undefined };
    } else if ('airport' in data) {
      return { display: data.city, code: data.airport };
    }
  }

  return null;
}

/**
 * Extract passenger count
 */
export function extractPassengers(message: string): { adults: number; children?: number; infants?: number } | undefined {
  const lowerMsg = message.toLowerCase();

  // Pattern: "2 passengers", "3 people", "1 adult 2 children"
  const adultPattern = /(\d+)\s*(?:adult|passenger|person|people|traveler)/i;
  const childPattern = /(\d+)\s*(?:child|children|kid)/i;
  const infantPattern = /(\d+)\s*(?:infant|baby|babies)/i;

  let adults = 1; // Default
  let children: number | undefined;
  let infants: number | undefined;

  const adultMatch = message.match(adultPattern);
  if (adultMatch) {
    adults = parseInt(adultMatch[1]);
  }

  const childMatch = message.match(childPattern);
  if (childMatch) {
    children = parseInt(childMatch[1]);
  }

  const infantMatch = message.match(infantPattern);
  if (infantMatch) {
    infants = parseInt(infantMatch[1]);
  }

  // If no explicit passenger mention, return undefined (use default of 1)
  if (!adultMatch && !childMatch && !infantMatch) {
    return undefined;
  }

  return { adults, children, infants };
}

/**
 * Extract preferences (direct flights, bags, class, etc.)
 */
export function extractPreferences(message: string) {
  const lowerMsg = message.toLowerCase();

  return {
    directFlights: /\b(direct|non.?stop|no.?stop|non.?stop)\s*(flight)?/i.test(message),
    includeBags: /\b(with|including?|include)\s*(bag|baggage|luggage|checked.?bag)/i.test(message),
    cabinClass: extractCabinClass(lowerMsg),
  };
}

/**
 * Extract cabin class preference
 */
function extractCabinClass(lowerMsg: string): 'economy' | 'premium' | 'business' | 'first' | undefined {
  if (/\b(first.?class|first)\b/.test(lowerMsg)) return 'first';
  if (/\b(business.?class|business)\b/.test(lowerMsg)) return 'business';
  if (/\b(premium.?economy|premium)\b/.test(lowerMsg)) return 'premium';
  if (/\b(economy|coach|basic)\b/.test(lowerMsg)) return 'economy';
  return undefined;
}

/**
 * Main comprehensive parser
 */
export function parseTravelRequest(message: string): ParsedTravelRequest {
  const dates = extractDates(message);
  const locations = extractLocations(message);
  const passengers = extractPassengers(message);
  const preferences = extractPreferences(message);

  // Determine trip type
  const lowerMsg = message.toLowerCase();
  const isOneWay = /\bone.?way\b/i.test(message) || (!dates.return && !/\breturn|\bback|\bround.?trip/i.test(lowerMsg));

  return {
    origin: locations.origin,
    destination: locations.destination,
    departureDate: dates.departure,
    returnDate: dates.return,
    passengers: passengers || { adults: 1 },
    tripType: isOneWay ? 'one-way' : 'round-trip',
    preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
    confidence: {
      origin: locations.confidence.origin,
      destination: locations.confidence.destination,
      dates: (dates.departure ? 0.9 : 0) * (dates.return ? 1 : 0.7),
    },
  };
}
