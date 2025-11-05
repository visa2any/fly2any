/**
 * Agent Information Extraction
 * Extracts structured information from natural language user input
 */

import { CollectedInfo, TripType, BudgetLevel, ServiceType } from './agent-conversation-flow';

// Common airport codes and city mappings
const AIRPORT_MAPPINGS: Record<string, string> = {
  'new york': 'JFK',
  'nyc': 'JFK',
  'los angeles': 'LAX',
  'la': 'LAX',
  'chicago': 'ORD',
  'miami': 'MIA',
  'london': 'LHR',
  'paris': 'CDG',
  'tokyo': 'NRT',
  'dubai': 'DXB',
  'singapore': 'SIN',
  'hong kong': 'HKG',
  'sydney': 'SYD',
  'san francisco': 'SFO',
  'seattle': 'SEA',
  'boston': 'BOS',
  'atlanta': 'ATL',
  'dallas': 'DFW',
  'houston': 'IAH',
  'orlando': 'MCO',
  'las vegas': 'LAS',
  'phoenix': 'PHX',
  'denver': 'DEN',
  'washington': 'IAD',
  'dc': 'IAD',
};

/**
 * Extract service type from user message
 */
export function extractServiceType(message: string): ServiceType | null {
  const lowerMessage = message.toLowerCase();

  // Flight indicators
  const flightKeywords = [
    'flight', 'fly', 'plane', 'ticket', 'airline', 'departure', 'arrival',
    'take off', 'landing', 'airfare'
  ];

  // Hotel indicators
  const hotelKeywords = [
    'hotel', 'accommodation', 'stay', 'room', 'resort', 'lodge',
    'check in', 'check out', 'booking', 'reservation'
  ];

  // Package indicators
  const packageKeywords = [
    'package', 'bundle', 'all inclusive', 'vacation package',
    'flight and hotel', 'complete trip', 'everything'
  ];

  // Check for package first (most specific)
  if (packageKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'package';
  }

  // Check for hotel
  if (hotelKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'hotel';
  }

  // Check for flight
  if (flightKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'flight';
  }

  return null;
}

/**
 * Extract trip type from user message
 */
export function extractTripType(message: string): TripType | null {
  const lowerMessage = message.toLowerCase();

  const tripTypePatterns: { type: TripType; keywords: string[] }[] = [
    {
      type: 'business',
      keywords: ['business', 'work', 'conference', 'meeting', 'corporate', 'office'],
    },
    {
      type: 'vacation',
      keywords: ['vacation', 'holiday', 'leisure', 'relax', 'getaway', 'fun', 'pleasure'],
    },
    {
      type: 'family',
      keywords: ['family', 'kids', 'children', 'parents', 'relatives', 'visiting family'],
    },
    {
      type: 'romantic',
      keywords: ['romantic', 'honeymoon', 'anniversary', 'couple', 'partner', 'spouse'],
    },
    {
      type: 'adventure',
      keywords: ['adventure', 'hiking', 'trekking', 'backpacking', 'exploring', 'safari'],
    },
    {
      type: 'solo',
      keywords: ['solo', 'alone', 'myself', 'just me', 'by myself', 'single traveler'],
    },
  ];

  for (const pattern of tripTypePatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return pattern.type;
    }
  }

  return null;
}

/**
 * Extract destination from user message
 */
export function extractDestination(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Common phrases that indicate destination
  const destinationPhrases = [
    /(?:going to|fly to|flying to|travel to|visit|headed to|destination is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:^|\s)to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:would be|sounds|looks)/i,
  ];

  for (const pattern of destinationPhrases) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const destination = match[1].trim();
      // Check if it's a valid city name (not a common word)
      if (destination.length > 2 && !isCommonWord(destination)) {
        return destination;
      }
    }
  }

  // Look for capitalized location names (cities/countries)
  const locationPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  const matches = [...message.matchAll(locationPattern)];

  for (const match of matches) {
    const location = match[1];
    if (!isCommonWord(location) && location.length > 2) {
      // Check if it's in our airport mappings or looks like a destination
      if (AIRPORT_MAPPINGS[location.toLowerCase()] || isLikelyDestination(location)) {
        return location;
      }
    }
  }

  return null;
}

/**
 * Extract origin from user message
 */
export function extractOrigin(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Common phrases that indicate origin
  const originPhrases = [
    /(?:from|leaving|departing from|flying from|starting from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:^|\s)from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+to\s+/i,
  ];

  for (const pattern of originPhrases) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const origin = match[1].trim();
      if (origin.length > 2 && !isCommonWord(origin)) {
        return origin;
      }
    }
  }

  return null;
}

/**
 * Extract dates from user message
 */
export function extractDates(message: string): { departure: string; return?: string; flexible?: boolean } | null {
  const lowerMessage = message.toLowerCase();

  // Check for flexibility
  const flexible = /flexible|any(?:time)?|whenever|doesn'?t matter/i.test(message);

  // Date patterns
  const datePatterns = [
    // Month day format: November 15, Nov 15, 11/15
    /(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?/gi,
    // Numeric format: 11/15, 11-15, 11.15
    /\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?/g,
    // Relative dates: next week, this weekend
    /(?:next|this|coming)\s+(?:week|weekend|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
  ];

  const foundDates: string[] = [];

  for (const pattern of datePatterns) {
    const matches = message.match(pattern);
    if (matches) {
      foundDates.push(...matches);
    }
  }

  if (foundDates.length === 0) {
    return flexible ? { departure: '', flexible: true } : null;
  }

  // Parse the first date as departure
  const departure = parseDateString(foundDates[0]);

  if (!departure) {
    return null;
  }

  // Check for return date
  let returnDate: string | undefined;

  if (foundDates.length > 1) {
    returnDate = parseDateString(foundDates[1]) || undefined;
  } else {
    // Look for duration indicators
    const durationMatch = message.match(/(\d+)\s+(?:days?|nights?|weeks?)/i);
    if (durationMatch) {
      const days = parseInt(durationMatch[1]);
      const departureDate = new Date(departure);
      departureDate.setDate(departureDate.getDate() + days);
      returnDate = departureDate.toISOString().split('T')[0];
    }
  }

  return {
    departure,
    return: returnDate,
    flexible,
  };
}

/**
 * Extract number of travelers from user message
 */
export function extractTravelers(message: string): { adults: number; children?: number; infants?: number } | null {
  const lowerMessage = message.toLowerCase();

  // Solo indicators
  if (/\b(?:just me|myself|solo|alone|one person|1 person)\b/i.test(message)) {
    return { adults: 1 };
  }

  // Specific patterns
  const patterns = [
    // "2 adults and 1 child"
    /(\d+)\s+adults?\s+(?:and\s+)?(\d+)\s+(?:children|child|kids?)/i,
    // "family of 4"
    /family of (\d+)/i,
    // "2 people"
    /(\d+)\s+(?:people|persons?|passengers?|travelers?)/i,
    // Just a number
    /\b(\d+)\b/,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      const adults = parseInt(match[1]);

      // Check for children
      const childrenMatch = message.match(/(\d+)\s+(?:children|child|kids?)/i);
      const children = childrenMatch ? parseInt(childrenMatch[1]) : undefined;

      // Check for infants
      const infantsMatch = message.match(/(\d+)\s+(?:infants?|babies)/i);
      const infants = infantsMatch ? parseInt(infantsMatch[1]) : undefined;

      if (adults > 0 && adults <= 10) {
        return { adults, children, infants };
      }
    }
  }

  return null;
}

/**
 * Extract budget level from user message
 */
export function extractBudget(message: string): BudgetLevel | null {
  const lowerMessage = message.toLowerCase();

  const budgetPatterns: { level: BudgetLevel; keywords: string[] }[] = [
    {
      level: 'economy',
      keywords: ['economy', 'budget', 'cheap', 'affordable', 'low cost', 'save money', 'cheapest'],
    },
    {
      level: 'premium',
      keywords: ['premium', 'business class', 'comfort', 'upgrade', 'better', 'extra space'],
    },
    {
      level: 'luxury',
      keywords: ['luxury', 'first class', 'best', 'top', 'finest', 'deluxe', 'five star', '5 star'],
    },
    {
      level: 'flexible',
      keywords: ['flexible', 'any', 'doesn\'t matter', 'open', 'whatever', 'anything'],
    },
  ];

  for (const pattern of budgetPatterns) {
    if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return pattern.level;
    }
  }

  return null;
}

/**
 * Extract preferences from user message
 */
export function extractPreferences(message: string): CollectedInfo['preferences'] {
  const lowerMessage = message.toLowerCase();
  const preferences: CollectedInfo['preferences'] = {};

  // Direct flight preference
  if (/\b(?:direct|non-?stop|no layover)\b/i.test(message)) {
    preferences.directFlights = true;
  }

  // Airline preference
  const airlineMatch = message.match(/\b(?:prefer|like)\s+(\w+(?:\s+\w+)?)\s+(?:airline|airways)/i);
  if (airlineMatch) {
    preferences.airlinePreference = [airlineMatch[1]];
  }

  // Hotel stars
  const starsMatch = message.match(/(\d)\s*star/i);
  if (starsMatch) {
    preferences.hotelStars = parseInt(starsMatch[1]);
  }

  // Special requirements
  const specialReqs: string[] = [];

  if (/\b(?:wheelchair|mobility|accessible)\b/i.test(message)) {
    specialReqs.push('wheelchair_accessible');
  }

  if (/\b(?:dietary|food allergy|vegetarian|vegan|halal|kosher)\b/i.test(message)) {
    specialReqs.push('dietary_requirements');
  }

  if (/\b(?:pet|dog|cat|animal)\b/i.test(message)) {
    specialReqs.push('traveling_with_pet');
  }

  if (specialReqs.length > 0) {
    preferences.specialRequirements = specialReqs;
  }

  return Object.keys(preferences).length > 0 ? preferences : undefined;
}

/**
 * Main extraction function - extracts all possible info from user message
 */
export function extractAllInformation(message: string): Partial<CollectedInfo> {
  const extracted: Partial<CollectedInfo> = {};

  // Extract each piece of information
  const serviceType = extractServiceType(message);
  if (serviceType) extracted.serviceType = serviceType;

  const tripType = extractTripType(message);
  if (tripType) extracted.tripType = tripType;

  const destination = extractDestination(message);
  if (destination) extracted.destination = destination;

  const origin = extractOrigin(message);
  if (origin) extracted.origin = origin;

  const dates = extractDates(message);
  if (dates) extracted.dates = dates;

  const travelers = extractTravelers(message);
  if (travelers) extracted.travelers = travelers;

  const budget = extractBudget(message);
  if (budget) extracted.budget = budget;

  const preferences = extractPreferences(message);
  if (preferences) extracted.preferences = preferences;

  return extracted;
}

/**
 * Helper: Check if a word is a common English word (not a location)
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'The', 'And', 'But', 'For', 'Not', 'Are', 'Was', 'Were', 'Been', 'Have',
    'Has', 'Had', 'Do', 'Does', 'Did', 'Will', 'Would', 'Could', 'Should',
    'May', 'Might', 'Must', 'Can', 'Going', 'Want', 'Need', 'Like', 'Love',
    'Think', 'Know', 'See', 'Look', 'Make', 'Take', 'Get', 'Give', 'Come',
    'Go', 'Say', 'Tell', 'Ask', 'Use', 'Find', 'Feel', 'Try', 'Leave',
    'Call', 'Put', 'Let', 'Keep', 'Begin', 'Start', 'Show', 'Hear', 'Play',
    'Run', 'Move', 'Live', 'Believe', 'Bring', 'Happen', 'Write', 'Sit',
    'Stand', 'Lose', 'Pay', 'Meet', 'Include', 'Continue', 'Set', 'Learn',
    'Change', 'Lead', 'Understand', 'Watch', 'Follow', 'Stop', 'Create',
    'Speak', 'Read', 'Allow', 'Add', 'Spend', 'Grow', 'Open', 'Walk', 'Win',
    'Offer', 'Remember', 'Consider', 'Appear', 'Buy', 'Wait', 'Serve', 'Die',
    'Send', 'Expect', 'Build', 'Stay', 'Fall', 'Cut', 'Reach', 'Kill', 'Remain'
  ];

  return commonWords.includes(word);
}

/**
 * Helper: Check if a word is likely a destination
 */
function isLikelyDestination(word: string): boolean {
  // Check if it's in our airport mappings
  if (AIRPORT_MAPPINGS[word.toLowerCase()]) {
    return true;
  }

  // Common destination patterns
  const destinationSuffixes = ['city', 'town', 'island', 'beach', 'land', 'port', 'ville'];
  const lowerWord = word.toLowerCase();

  return destinationSuffixes.some(suffix => lowerWord.endsWith(suffix));
}

/**
 * Helper: Parse date string into ISO format
 */
function parseDateString(dateStr: string): string | null {
  try {
    // Handle relative dates
    const lowerDate = dateStr.toLowerCase();
    const now = new Date();

    if (lowerDate.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }

    if (lowerDate.includes('this weekend')) {
      const weekend = new Date(now);
      const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
      weekend.setDate(now.getDate() + daysUntilSaturday);
      return weekend.toISOString().split('T')[0];
    }

    // Try to parse as date
    const date = new Date(dateStr);

    if (!isNaN(date.getTime())) {
      // If year is not specified, assume current year
      if (dateStr.match(/^\d{1,2}[\/\-\.]\d{1,2}$/) || !dateStr.match(/\d{4}/)) {
        date.setFullYear(now.getFullYear());

        // If date is in the past, assume next year
        if (date < now) {
          date.setFullYear(now.getFullYear() + 1);
        }
      }

      return date.toISOString().split('T')[0];
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Confidence score for extracted information (0-1)
 */
export function getExtractionConfidence(
  message: string,
  extracted: Partial<CollectedInfo>
): number {
  let confidence = 0;
  let factors = 0;

  // Check each field
  if (extracted.serviceType) {
    confidence += 0.9; // High confidence for service type
    factors++;
  }

  if (extracted.destination) {
    // Higher confidence if destination is in airport mappings
    const inMappings = AIRPORT_MAPPINGS[extracted.destination.toLowerCase()];
    confidence += inMappings ? 0.95 : 0.7;
    factors++;
  }

  if (extracted.origin) {
    const inMappings = AIRPORT_MAPPINGS[extracted.origin.toLowerCase()];
    confidence += inMappings ? 0.95 : 0.7;
    factors++;
  }

  if (extracted.dates) {
    confidence += extracted.dates.flexible ? 0.6 : 0.85;
    factors++;
  }

  if (extracted.travelers) {
    confidence += 0.9;
    factors++;
  }

  if (extracted.budget) {
    confidence += 0.8;
    factors++;
  }

  return factors > 0 ? confidence / factors : 0;
}
