/**
 * Smart Query Router
 * NLP-first approach: Free local processing handles 90%+ of queries
 * Groq AI fallback: Only for complex queries that need understanding
 */

import { callGroq, generateTravelResponse, enhanceWithAI, isGroqAvailable, type GroqMessage } from './groq-client';
import {
  generateHandoffMessage,
  getConsultantInfo,
  needsHandoff,
  type TeamType
} from './consultant-handoff';

export interface QueryAnalysis {
  intent: 'flight_search' | 'hotel_search' | 'car_rental' | 'general_inquiry' | 'booking_status' | 'payment' | 'complaint' | 'greeting' | 'unknown';
  confidence: number;
  team: TeamType;
  entities: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    cabinClass?: string;
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    hotelName?: string;
    budget?: { min?: number; max?: number };
    preferences?: string[];
  };
  requiresAI: boolean;
  rawMessage: string;
}

export interface RouterResponse {
  analysis: QueryAnalysis;
  aiResponse?: string;
  handoff?: {
    fromConsultant: string;
    toConsultant: string;
    transferAnnouncement: string;
    introduction: string;
    context?: string;
  };
  consultantInfo: {
    name: string;
    title: string;
    team: TeamType;
    emoji: string;
  };
}

// Intent patterns with keywords and confidence scores
const INTENT_PATTERNS: Record<string, { keywords: string[]; team: TeamType; weight: number }> = {
  flight_search: {
    keywords: ['flight', 'fly', 'flying', 'plane', 'airline', 'airport', 'depart', 'arrive', 'ticket', 'booking', 'book a flight', 'round trip', 'one way', 'nonstop', 'direct flight', 'layover', 'connection'],
    team: 'flight-operations',
    weight: 1.0
  },
  hotel_search: {
    keywords: ['hotel', 'accommodation', 'stay', 'room', 'suite', 'resort', 'motel', 'inn', 'lodge', 'hostel', 'airbnb', 'check in', 'check out', 'night stay', 'bed and breakfast', 'b&b'],
    team: 'hotel-accommodations',
    weight: 1.0
  },
  car_rental: {
    keywords: ['car', 'rental', 'rent a car', 'vehicle', 'drive', 'driving', 'pickup', 'drop off', 'suv', 'sedan', 'convertible'],
    team: 'car-rental',
    weight: 1.0
  },
  payment: {
    keywords: ['pay', 'payment', 'price', 'cost', 'charge', 'bill', 'invoice', 'refund', 'money', 'credit card', 'debit', 'transaction', 'receipt', 'cancel', 'cancellation fee'],
    team: 'payment-billing',
    weight: 0.9
  },
  booking_status: {
    keywords: ['booking', 'reservation', 'confirmation', 'status', 'itinerary', 'scheduled', 'upcoming trip', 'my trip', 'my booking'],
    team: 'customer-service',
    weight: 0.8
  },
  complaint: {
    keywords: ['complaint', 'problem', 'issue', 'wrong', 'bad', 'terrible', 'awful', 'disappointed', 'angry', 'upset', 'refund', 'compensation', 'manager', 'supervisor'],
    team: 'customer-service',
    weight: 0.9
  },
  greeting: {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'help', 'assist'],
    team: 'customer-service',
    weight: 0.5
  }
};

// Location extraction patterns
const LOCATION_PATTERNS = {
  from: /(?:from|leaving|departing|out of)\s+([A-Za-z\s]+?)(?:\s+to|\s+on|\s+in|\s+for|,|$)/i,
  to: /(?:to|going to|heading to|destination|arrive at|arriving|into)\s+([A-Za-z\s]+?)(?:\s+from|\s+on|\s+in|\s+for|,|$)/i,
  city: /(?:in|at|near|around)\s+([A-Za-z\s]+?)(?:\s+from|\s+on|\s+for|,|$)/i,
  airport: /\b([A-Z]{3})\b/g
};

// Date extraction (comprehensive patterns)
const MONTHS: Record<string, number> = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
  april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
  august: 7, aug: 7, september: 8, sep: 8, sept: 8,
  october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
};

/**
 * Extract dates from natural language
 */
function extractDates(message: string): { departure?: string; return?: string } {
  const lower = message.toLowerCase();
  const now = new Date();
  const currentYear = now.getFullYear();

  const result: { departure?: string; return?: string } = {};

  // Pattern: "from dec 20th until jan 5th" or "dec 20 to jan 5"
  const rangePattern = /(?:from\s+)?(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:until|to|-|through)\s*(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?/i;
  const rangeMatch = lower.match(rangePattern);

  if (rangeMatch) {
    const [, startMonth, startDay, endMonth, endDay] = rangeMatch;
    const startMonthNum = MONTHS[startMonth.toLowerCase()];
    const endMonthNum = MONTHS[endMonth.toLowerCase()];

    if (startMonthNum !== undefined && endMonthNum !== undefined) {
      let startYear = currentYear;
      let endYear = currentYear;

      // Handle year rollover
      const testStartDate = new Date(startYear, startMonthNum, parseInt(startDay));
      if (testStartDate < now) startYear++;

      endYear = startYear;
      if (endMonthNum < startMonthNum) endYear++;

      result.departure = `${startYear}-${String(startMonthNum + 1).padStart(2, '0')}-${String(parseInt(startDay)).padStart(2, '0')}`;
      result.return = `${endYear}-${String(endMonthNum + 1).padStart(2, '0')}-${String(parseInt(endDay)).padStart(2, '0')}`;
      return result;
    }
  }

  // Pattern: "on dec 20th" or "december 20"
  const singleDatePattern = /(?:on\s+)?(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?/gi;
  const dates: string[] = [];
  let match;

  while ((match = singleDatePattern.exec(lower)) !== null) {
    const [, month, day, year] = match;
    const monthNum = MONTHS[month.toLowerCase()];

    if (monthNum !== undefined) {
      let dateYear = year ? parseInt(year) : currentYear;
      const testDate = new Date(dateYear, monthNum, parseInt(day));
      if (!year && testDate < now) dateYear++;

      dates.push(`${dateYear}-${String(monthNum + 1).padStart(2, '0')}-${String(parseInt(day)).padStart(2, '0')}`);
    }
  }

  if (dates.length >= 1) result.departure = dates[0];
  if (dates.length >= 2) result.return = dates[1];

  // Pattern: MM/DD or MM/DD/YYYY
  const numericPattern = /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/g;
  while ((match = numericPattern.exec(message)) !== null) {
    const [, month, day, year] = match;
    const monthNum = parseInt(month) - 1;
    let dateYear = year ? (year.length === 2 ? 2000 + parseInt(year) : parseInt(year)) : currentYear;

    if (monthNum >= 0 && monthNum <= 11) {
      const testDate = new Date(dateYear, monthNum, parseInt(day));
      if (!year && testDate < now) dateYear++;

      const dateStr = `${dateYear}-${String(monthNum + 1).padStart(2, '0')}-${String(parseInt(day)).padStart(2, '0')}`;
      if (!result.departure) result.departure = dateStr;
      else if (!result.return) result.return = dateStr;
    }
  }

  // Relative dates
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.departure = tomorrow.toISOString().split('T')[0];
  } else if (lower.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    result.departure = nextWeek.toISOString().split('T')[0];
  } else if (lower.includes('next month')) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    result.departure = nextMonth.toISOString().split('T')[0];
  }

  return result;
}

/**
 * Extract passenger count
 */
function extractPassengers(message: string): number | undefined {
  const patterns = [
    /(\d+)\s*(?:passengers?|people|persons?|adults?|travelers?)/i,
    /(?:for|with)\s*(\d+)\s*(?:of us|people|persons?)?/i,
    /(?:party of|group of)\s*(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return parseInt(match[1]);
  }

  return undefined;
}

/**
 * Extract cabin class
 */
function extractCabinClass(message: string): string | undefined {
  const lower = message.toLowerCase();

  if (lower.includes('first class') || lower.includes('first-class')) return 'first';
  if (lower.includes('business class') || lower.includes('business-class')) return 'business';
  if (lower.includes('premium economy') || lower.includes('premium-economy')) return 'premium_economy';
  if (lower.includes('economy') || lower.includes('coach')) return 'economy';

  return undefined;
}

/**
 * Extract locations from message
 */
function extractLocations(message: string): { origin?: string; destination?: string; city?: string } {
  const result: { origin?: string; destination?: string; city?: string } = {};

  // Try to extract airport codes first (3 letter codes)
  const airportCodes = message.match(/\b[A-Z]{3}\b/g);
  if (airportCodes && airportCodes.length >= 2) {
    result.origin = airportCodes[0];
    result.destination = airportCodes[1];
    return result;
  } else if (airportCodes && airportCodes.length === 1) {
    // Single airport code - try to determine if origin or destination
    if (message.toLowerCase().includes('from')) {
      result.origin = airportCodes[0];
    } else {
      result.destination = airportCodes[0];
    }
  }

  // Extract "from X to Y" pattern
  const fromToPattern = /from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\s+on|\s+for|\s+in|,|$)/i;
  const fromToMatch = message.match(fromToPattern);
  if (fromToMatch) {
    result.origin = fromToMatch[1].trim();
    result.destination = fromToMatch[2].trim();
    return result;
  }

  // Try individual patterns
  const fromMatch = message.match(LOCATION_PATTERNS.from);
  const toMatch = message.match(LOCATION_PATTERNS.to);

  if (fromMatch) result.origin = fromMatch[1].trim();
  if (toMatch) result.destination = toMatch[1].trim();

  // For hotels - extract city
  const cityMatch = message.match(LOCATION_PATTERNS.city);
  if (cityMatch) result.city = cityMatch[1].trim();

  // Common city names extraction
  const commonCities = ['new york', 'los angeles', 'chicago', 'miami', 'london', 'paris', 'tokyo', 'sydney', 'dubai', 'singapore', 'hong kong', 'san francisco', 'seattle', 'boston', 'washington', 'atlanta', 'denver', 'las vegas', 'orlando', 'dallas', 'houston'];

  const lower = message.toLowerCase();
  for (const city of commonCities) {
    if (lower.includes(city)) {
      if (!result.destination && !result.city) {
        result.city = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
  }

  return result;
}

/**
 * Extract hotel-specific details
 */
function extractHotelDetails(message: string): { guests?: number; rooms?: number } {
  const result: { guests?: number; rooms?: number } = {};

  const guestMatch = message.match(/(\d+)\s*(?:guests?|people|persons?|adults?)/i);
  if (guestMatch) result.guests = parseInt(guestMatch[1]);

  const roomMatch = message.match(/(\d+)\s*(?:rooms?)/i);
  if (roomMatch) result.rooms = parseInt(roomMatch[1]);

  return result;
}

/**
 * Extract preferences
 */
function extractPreferences(message: string): string[] {
  const lower = message.toLowerCase();
  const preferences: string[] = [];

  // Flight preferences
  if (lower.includes('nonstop') || lower.includes('non-stop') || lower.includes('direct')) {
    preferences.push('nonstop');
  }
  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('lowest price')) {
    preferences.push('cheapest');
  }
  if (lower.includes('fastest') || lower.includes('quickest') || lower.includes('shortest')) {
    preferences.push('fastest');
  }
  if (lower.includes('morning')) preferences.push('morning_departure');
  if (lower.includes('evening') || lower.includes('night')) preferences.push('evening_departure');
  if (lower.includes('window')) preferences.push('window_seat');
  if (lower.includes('aisle')) preferences.push('aisle_seat');

  // Hotel preferences
  if (lower.includes('pool') || lower.includes('swimming')) preferences.push('pool');
  if (lower.includes('gym') || lower.includes('fitness')) preferences.push('fitness');
  if (lower.includes('wifi') || lower.includes('internet')) preferences.push('wifi');
  if (lower.includes('breakfast')) preferences.push('breakfast_included');
  if (lower.includes('parking')) preferences.push('parking');
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) preferences.push('pet_friendly');
  if (lower.includes('spa')) preferences.push('spa');
  if (lower.includes('ocean') || lower.includes('beach') || lower.includes('sea view')) preferences.push('ocean_view');

  return preferences;
}

/**
 * Analyze query intent using NLP patterns
 */
function analyzeIntent(message: string): { intent: QueryAnalysis['intent']; confidence: number; team: TeamType } {
  const lower = message.toLowerCase();
  let bestMatch = { intent: 'unknown' as QueryAnalysis['intent'], confidence: 0, team: 'customer-service' as TeamType };

  for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
    let matchCount = 0;
    let totalWeight = 0;

    for (const keyword of config.keywords) {
      if (lower.includes(keyword)) {
        matchCount++;
        // Longer keywords are more significant
        totalWeight += keyword.split(' ').length;
      }
    }

    if (matchCount > 0) {
      // Calculate confidence based on matches and keyword weight
      const confidence = Math.min((matchCount / 3 + totalWeight / 5) * config.weight, 1);

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          intent: intent as QueryAnalysis['intent'],
          confidence,
          team: config.team
        };
      }
    }
  }

  // If no intent found but has travel-related words, default to general inquiry
  if (bestMatch.intent === 'unknown') {
    const travelWords = ['travel', 'trip', 'vacation', 'holiday', 'journey', 'visit', 'tour'];
    if (travelWords.some(w => lower.includes(w))) {
      return { intent: 'general_inquiry', confidence: 0.4, team: 'customer-service' };
    }
  }

  return bestMatch;
}

/**
 * Main query router - NLP first, AI fallback
 */
export async function routeQuery(
  message: string,
  options: {
    previousTeam?: TeamType | null;
    conversationHistory?: GroqMessage[];
    customerName?: string;
    useAI?: boolean;
  } = {}
): Promise<RouterResponse> {
  const { previousTeam = null, conversationHistory = [], customerName, useAI = true } = options;

  // Step 1: NLP Analysis (always free)
  const intentAnalysis = analyzeIntent(message);
  const locations = extractLocations(message);
  const dates = extractDates(message);
  const passengers = extractPassengers(message);
  const cabinClass = extractCabinClass(message);
  const hotelDetails = extractHotelDetails(message);
  const preferences = extractPreferences(message);

  // Build query analysis
  const analysis: QueryAnalysis = {
    intent: intentAnalysis.intent,
    confidence: intentAnalysis.confidence,
    team: intentAnalysis.team,
    entities: {
      origin: locations.origin,
      destination: locations.destination,
      city: locations.city,
      departureDate: dates.departure,
      returnDate: dates.return,
      passengers,
      cabinClass,
      guests: hotelDetails.guests,
      rooms: hotelDetails.rooms,
      preferences
    },
    requiresAI: intentAnalysis.confidence < 0.5,
    rawMessage: message
  };

  // Step 2: AI Enhancement (only if needed and available)
  let aiResponse: string | undefined;

  if (analysis.requiresAI && useAI && isGroqAvailable()) {
    // Try to enhance understanding with AI
    const enhanceResult = await enhanceWithAI(message, {
      intent: analysis.intent,
      confidence: analysis.confidence,
      entities: analysis.entities
    });

    if (enhanceResult.enhanced && enhanceResult.data) {
      // Merge AI-extracted data
      const aiData = enhanceResult.data;
      if (aiData.origin && !analysis.entities.origin) analysis.entities.origin = aiData.origin;
      if (aiData.destination && !analysis.entities.destination) analysis.entities.destination = aiData.destination;
      if (aiData.departureDate && !analysis.entities.departureDate) analysis.entities.departureDate = aiData.departureDate;
      if (aiData.returnDate && !analysis.entities.returnDate) analysis.entities.returnDate = aiData.returnDate;
      if (aiData.passengers && !analysis.entities.passengers) analysis.entities.passengers = aiData.passengers;
      if (aiData.cabinClass && !analysis.entities.cabinClass) analysis.entities.cabinClass = aiData.cabinClass;

      // Update confidence after AI enhancement
      analysis.confidence = Math.min(analysis.confidence + 0.3, 0.95);
    }
  }

  // Step 3: Generate AI Response if greeting or general inquiry
  if (['greeting', 'general_inquiry', 'complaint'].includes(analysis.intent) && useAI && isGroqAvailable()) {
    const groqResponse = await generateTravelResponse(message, {
      agentType: analysis.team,
      conversationHistory,
      customerName
    });

    if (groqResponse.success && groqResponse.message) {
      aiResponse = groqResponse.message;
    }
  }

  // Step 4: Handle consultant handoff
  let handoff;
  if (previousTeam && needsHandoff(previousTeam, analysis.team)) {
    handoff = generateHandoffMessage(previousTeam, analysis.team, message, analysis.entities);
  }

  // Get consultant info
  const consultantInfo = getConsultantInfo(analysis.team);

  return {
    analysis,
    aiResponse,
    handoff,
    consultantInfo: {
      name: consultantInfo.name,
      title: consultantInfo.title,
      team: consultantInfo.team,
      emoji: consultantInfo.emoji
    }
  };
}

/**
 * Generate conversational response using AI
 */
export async function generateConversationalResponse(
  message: string,
  context: {
    team: TeamType;
    conversationHistory?: GroqMessage[];
    searchResults?: any;
    customerName?: string;
  }
): Promise<string | null> {
  if (!isGroqAvailable()) return null;

  const response = await generateTravelResponse(message, {
    agentType: context.team,
    conversationHistory: context.conversationHistory,
    searchResults: context.searchResults,
    customerName: context.customerName
  });

  return response.success ? response.message || null : null;
}

/**
 * Quick intent check without full analysis
 * Useful for UI hints and suggestions
 */
export function quickIntentCheck(message: string): { intent: string; team: TeamType } {
  const analysis = analyzeIntent(message);
  return { intent: analysis.intent, team: analysis.team };
}
