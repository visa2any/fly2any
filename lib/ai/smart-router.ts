/**
 * Smart Router — Fly2Any AI Orchestration Layer
 *
 * Invisible intelligence that routes user requests to specialist agents
 * based on intent, emotion, and urgency classification.
 *
 * Architecture:
 * 1. Fast keyword classifier (0ms, no API)
 * 2. NLP entity extraction (0ms, no API)
 * 3. AI classification fallback (only for ambiguous queries)
 */

import { callGroq, generateTravelResponse, isGroqAvailable, type GroqMessage } from './groq-client';
import { getConsultantInfo, type TeamType } from './consultant-handoff';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type PrimaryIntent =
  | 'FLIGHT_SEARCH' | 'FLIGHT_CHANGE' | 'FLIGHT_CANCEL'
  | 'HOTEL_SEARCH' | 'HOTEL_MODIFICATION'
  | 'PAYMENT_ISSUE' | 'REFUND'
  | 'LEGAL_RIGHTS' | 'VISA_DOCUMENTATION'
  | 'CAR_RENTAL' | 'INSURANCE' | 'LOYALTY_POINTS'
  | 'CUSTOMER_SUPPORT' | 'TECHNICAL_ISSUE'
  | 'ACCESSIBILITY' | 'EMERGENCY' | 'GENERAL_TRAVEL_INFO';

export type EmotionalState = 'CALM' | 'CONFUSED' | 'FRUSTRATED' | 'ANXIOUS' | 'URGENT' | 'PANICKED';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RoutingContext {
  primary_intent: PrimaryIntent;
  secondary_intents: PrimaryIntent[];
  emotional_state: EmotionalState;
  urgency_level: UrgencyLevel;
  user_goal: string;
  known_constraints: string[];
  risk_flags: string[];
  recommended_tone: string;
  target_agent: TeamType;
  agent_name: string;
}

export interface QueryAnalysis {
  intent: string;
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
  routing?: RoutingContext;
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
  routing: RoutingContext;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT ROUTING MAP
// ═══════════════════════════════════════════════════════════════════════════
const INTENT_TO_AGENT: Record<PrimaryIntent, { team: TeamType; name: string }> = {
  'FLIGHT_SEARCH': { team: 'flight-operations', name: 'Sarah Chen' },
  'FLIGHT_CHANGE': { team: 'flight-operations', name: 'Sarah Chen' },
  'FLIGHT_CANCEL': { team: 'flight-operations', name: 'Sarah Chen' },
  'HOTEL_SEARCH': { team: 'hotel-accommodations', name: 'Marcus Rodriguez' },
  'HOTEL_MODIFICATION': { team: 'hotel-accommodations', name: 'Marcus Rodriguez' },
  'PAYMENT_ISSUE': { team: 'payment-billing', name: 'David Park' },
  'REFUND': { team: 'payment-billing', name: 'David Park' },
  'LEGAL_RIGHTS': { team: 'legal-compliance', name: 'Dr. Emily Watson' },
  'VISA_DOCUMENTATION': { team: 'visa-documentation', name: 'Sophia Nguyen' },
  'CAR_RENTAL': { team: 'car-rental', name: 'James Anderson' },
  'INSURANCE': { team: 'travel-insurance', name: 'Robert Martinez' },
  'LOYALTY_POINTS': { team: 'loyalty-rewards', name: 'Amanda Foster' },
  'CUSTOMER_SUPPORT': { team: 'customer-service', name: 'Lisa Thompson' },
  'TECHNICAL_ISSUE': { team: 'technical-support', name: 'Alex Kumar' },
  'ACCESSIBILITY': { team: 'special-services', name: 'Nina Davis' },
  'EMERGENCY': { team: 'crisis-management', name: 'Captain Mike Johnson' },
  'GENERAL_TRAVEL_INFO': { team: 'customer-service', name: 'Lisa Thompson' },
};

// Legacy intent mapping for backward compatibility
const LEGACY_INTENT_MAP: Record<string, PrimaryIntent> = {
  'flight_search': 'FLIGHT_SEARCH',
  'hotel_search': 'HOTEL_SEARCH',
  'car_rental': 'CAR_RENTAL',
  'payment': 'PAYMENT_ISSUE',
  'booking_status': 'CUSTOMER_SUPPORT',
  'complaint': 'CUSTOMER_SUPPORT',
  'greeting': 'GENERAL_TRAVEL_INFO',
  'general_inquiry': 'GENERAL_TRAVEL_INFO',
  'unknown': 'GENERAL_TRAVEL_INFO',
};

// ═══════════════════════════════════════════════════════════════════════════
// FAST INTENT CLASSIFIER (No AI needed)
// ═══════════════════════════════════════════════════════════════════════════
function fastClassifyIntent(message: string): { intent: PrimaryIntent; urgency: UrgencyLevel } | null {
  const lower = message.toLowerCase();

  // CRITICAL: Emergency patterns
  if (/\b(emergency|stranded|missed flight|help me now|panicking|stuck at airport)\b/.test(lower)) {
    return { intent: 'EMERGENCY', urgency: 'CRITICAL' };
  }

  // HIGH: Payment failures
  if (/\b(card declined|payment failed|can't pay|won't charge|transaction failed)\b/.test(lower)) {
    return { intent: 'PAYMENT_ISSUE', urgency: 'HIGH' };
  }

  // HIGH: Refunds
  if (/\b(refund|money back|get my money|cancel.*booking)\b/.test(lower)) {
    return { intent: 'REFUND', urgency: 'HIGH' };
  }

  // MEDIUM: Flight search
  if (/\b(find.*flight|search.*flight|book.*flight|fly to|flights? from|looking for.*flight)\b/.test(lower)) {
    return { intent: 'FLIGHT_SEARCH', urgency: 'MEDIUM' };
  }

  // Flight changes
  if (/\b(change.*flight|modify.*flight|reschedule.*flight|different date)\b/.test(lower)) {
    return { intent: 'FLIGHT_CHANGE', urgency: 'MEDIUM' };
  }

  // Flight cancel
  if (/\b(cancel.*flight|cancel my booking)\b/.test(lower)) {
    return { intent: 'FLIGHT_CANCEL', urgency: 'MEDIUM' };
  }

  // Hotel search
  if (/\b(find.*hotel|search.*hotel|book.*hotel|stay in|accommodation|looking for.*hotel)\b/.test(lower)) {
    return { intent: 'HOTEL_SEARCH', urgency: 'MEDIUM' };
  }

  // Visa/documentation
  if (/\b(visa|passport|document|entry requirement|travel document|do i need a visa)\b/.test(lower)) {
    return { intent: 'VISA_DOCUMENTATION', urgency: 'MEDIUM' };
  }

  // Accessibility
  if (/\b(wheelchair|disabled|accessibility|special needs|service animal|mobility)\b/.test(lower)) {
    return { intent: 'ACCESSIBILITY', urgency: 'MEDIUM' };
  }

  // Technical issues
  if (/\b(app.*not working|website.*error|can't login|account.*problem|bug|glitch)\b/.test(lower)) {
    return { intent: 'TECHNICAL_ISSUE', urgency: 'MEDIUM' };
  }

  // Insurance
  if (/\b(insurance|travel protection|coverage|medical emergency cover)\b/.test(lower)) {
    return { intent: 'INSURANCE', urgency: 'LOW' };
  }

  // Car rental
  if (/\b(rent.*car|car rental|hire.*car|vehicle rental)\b/.test(lower)) {
    return { intent: 'CAR_RENTAL', urgency: 'LOW' };
  }

  // Loyalty/points
  if (/\b(points|miles|loyalty|rewards|status|frequent flyer)\b/.test(lower)) {
    return { intent: 'LOYALTY_POINTS', urgency: 'LOW' };
  }

  // Legal rights
  if (/\b(compensation|my rights|eu261|delayed.*compensation|legal)\b/.test(lower)) {
    return { intent: 'LEGAL_RIGHTS', urgency: 'MEDIUM' };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMOTION DETECTION
// ═══════════════════════════════════════════════════════════════════════════
function detectEmotion(message: string): EmotionalState {
  const lower = message.toLowerCase();

  if (/\b(angry|furious|unacceptable|worst|terrible|hate|ridiculous)\b/.test(lower) || /!{2,}/.test(message)) {
    return 'FRUSTRATED';
  }
  if (/\b(panicking|emergency|help|stranded|desperate|please help)\b/.test(lower)) {
    return 'PANICKED';
  }
  if (/\b(worried|nervous|scared|concerned|afraid)\b/.test(lower)) {
    return 'ANXIOUS';
  }
  if (/\b(urgent|asap|immediately|now|quickly|hurry)\b/.test(lower)) {
    return 'URGENT';
  }
  if (/\b(confused|don't understand|what does|how do|not sure|unclear)\b/.test(lower) || /\?{2,}/.test(message)) {
    return 'CONFUSED';
  }
  return 'CALM';
}

// ═══════════════════════════════════════════════════════════════════════════
// TONE RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════
function recommendTone(emotion: EmotionalState, urgency: UrgencyLevel): string {
  if (emotion === 'PANICKED' || urgency === 'CRITICAL') return 'Calm, decisive, action-oriented';
  if (emotion === 'FRUSTRATED') return 'Empathetic, solution-focused, acknowledging';
  if (emotion === 'ANXIOUS') return 'Reassuring, patient, thorough';
  if (emotion === 'CONFUSED') return 'Clear, step-by-step, educational';
  if (emotion === 'URGENT') return 'Efficient, direct, prioritized';
  return 'Professional, warm, helpful';
}

// ═══════════════════════════════════════════════════════════════════════════
// NLP ENTITY EXTRACTION (Kept from original)
// ═══════════════════════════════════════════════════════════════════════════
const MONTHS: Record<string, number> = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
  april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
  august: 7, aug: 7, september: 8, sep: 8, sept: 8,
  october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
};

function extractDates(message: string): { departure?: string; return?: string } {
  const lower = message.toLowerCase();
  const now = new Date();
  const currentYear = now.getFullYear();
  const result: { departure?: string; return?: string } = {};

  // Range: "dec 20 to jan 5"
  const rangePattern = /(?:from\s+)?(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:until|to|-|through)\s*(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?/i;
  const rangeMatch = lower.match(rangePattern);

  if (rangeMatch) {
    const [, startMonth, startDay, endMonth, endDay] = rangeMatch;
    const startMonthNum = MONTHS[startMonth.toLowerCase()];
    const endMonthNum = MONTHS[endMonth.toLowerCase()];

    if (startMonthNum !== undefined && endMonthNum !== undefined) {
      let startYear = currentYear;
      const testStartDate = new Date(startYear, startMonthNum, parseInt(startDay));
      if (testStartDate < now) startYear++;

      let endYear = startYear;
      if (endMonthNum < startMonthNum) endYear++;

      result.departure = `${startYear}-${String(startMonthNum + 1).padStart(2, '0')}-${String(parseInt(startDay)).padStart(2, '0')}`;
      result.return = `${endYear}-${String(endMonthNum + 1).padStart(2, '0')}-${String(parseInt(endDay)).padStart(2, '0')}`;
      return result;
    }
  }

  // Single date: "dec 20"
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

  // Relative dates
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.departure = tomorrow.toISOString().split('T')[0];
  }

  return result;
}

function extractLocations(message: string): { origin?: string; destination?: string; city?: string } {
  const result: { origin?: string; destination?: string; city?: string } = {};

  // Airport codes (3 letters)
  const airportCodes = message.match(/\b[A-Z]{3}\b/g);
  if (airportCodes && airportCodes.length >= 2) {
    result.origin = airportCodes[0];
    result.destination = airportCodes[1];
    return result;
  }

  // "from X to Y" pattern
  const fromToPattern = /from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\s+on|\s+for|\s+in|,|$)/i;
  const fromToMatch = message.match(fromToPattern);
  if (fromToMatch) {
    result.origin = fromToMatch[1].trim();
    result.destination = fromToMatch[2].trim();
  }

  return result;
}

function extractPassengers(message: string): number | undefined {
  const match = message.match(/(\d+)\s*(?:passengers?|people|persons?|adults?|travelers?)/i);
  return match ? parseInt(match[1]) : undefined;
}

function extractCabinClass(message: string): string | undefined {
  const lower = message.toLowerCase();
  if (lower.includes('first class')) return 'first';
  if (lower.includes('business')) return 'business';
  if (lower.includes('premium economy')) return 'premium_economy';
  if (lower.includes('economy')) return 'economy';
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ROUTER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
export async function routeUserMessage(message: string): Promise<RoutingContext> {
  const emotion = detectEmotion(message);
  const fastResult = fastClassifyIntent(message);

  if (fastResult) {
    const mapping = INTENT_TO_AGENT[fastResult.intent];
    return {
      primary_intent: fastResult.intent,
      secondary_intents: [],
      emotional_state: emotion,
      urgency_level: fastResult.urgency,
      user_goal: '',
      known_constraints: [],
      risk_flags: emotion === 'PANICKED' ? ['high_stress_customer'] : [],
      recommended_tone: recommendTone(emotion, fastResult.urgency),
      target_agent: mapping.team,
      agent_name: mapping.name,
    };
  }

  // Fallback to Lisa Thompson
  return {
    primary_intent: 'GENERAL_TRAVEL_INFO',
    secondary_intents: [],
    emotional_state: emotion,
    urgency_level: 'MEDIUM',
    user_goal: '',
    known_constraints: [],
    risk_flags: [],
    recommended_tone: recommendTone(emotion, 'MEDIUM'),
    target_agent: 'customer-service',
    agent_name: 'Lisa Thompson',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL QUERY ROUTER (Backward compatible)
// ═══════════════════════════════════════════════════════════════════════════
export async function routeQuery(
  message: string,
  options: {
    previousTeam?: TeamType | null;
    conversationHistory?: GroqMessage[];
    customerName?: string;
    useAI?: boolean;
  } = {}
): Promise<RouterResponse> {
  const { conversationHistory = [], customerName, useAI = true } = options;

  // Get routing context
  const routing = await routeUserMessage(message);

  // Extract entities
  const locations = extractLocations(message);
  const dates = extractDates(message);
  const passengers = extractPassengers(message);
  const cabinClass = extractCabinClass(message);

  // Build legacy analysis object
  const legacyIntent = routing.primary_intent.toLowerCase().replace('_', '-');
  const analysis: QueryAnalysis = {
    intent: legacyIntent,
    confidence: 0.8,
    team: routing.target_agent,
    entities: {
      origin: locations.origin,
      destination: locations.destination,
      city: locations.city,
      departureDate: dates.departure,
      returnDate: dates.return,
      passengers,
      cabinClass,
    },
    requiresAI: false,
    rawMessage: message,
    routing,
  };

  // Generate AI response for conversational queries
  let aiResponse: string | undefined;
  if (useAI && isGroqAvailable() && ['GENERAL_TRAVEL_INFO', 'CUSTOMER_SUPPORT'].includes(routing.primary_intent)) {
    const response = await generateTravelResponse(message, {
      agentType: routing.target_agent,
      conversationHistory,
      customerName,
    });
    if (response.success) aiResponse = response.message;
  }

  const consultantInfo = getConsultantInfo(routing.target_agent);

  return {
    analysis,
    aiResponse,
    consultantInfo: {
      name: consultantInfo.name,
      title: consultantInfo.title,
      team: consultantInfo.team,
      emoji: consultantInfo.emoji,
    },
    routing,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT RESPONSE WITH CONTEXT
// ═══════════════════════════════════════════════════════════════════════════
export async function getAgentResponse(
  message: string,
  conversationHistory: GroqMessage[] = []
): Promise<{ response: string; context: RoutingContext; provider?: string }> {
  const context = await routeUserMessage(message);

  const contextPrefix = context.urgency_level === 'CRITICAL'
    ? '[CRITICAL] '
    : context.emotional_state === 'FRUSTRATED'
    ? '[User frustrated] '
    : '';

  const response = await generateTravelResponse(contextPrefix + message, {
    agentType: context.target_agent,
    conversationHistory: conversationHistory.slice(-6),
  });

  return {
    response: response.message || "I'm connecting you with a specialist who can help.",
    context,
    provider: response.provider,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK INTENT CHECK (UI hints)
// ═══════════════════════════════════════════════════════════════════════════
export function quickIntentCheck(message: string): { intent: string; team: TeamType } {
  const fast = fastClassifyIntent(message);
  if (fast) {
    const mapping = INTENT_TO_AGENT[fast.intent];
    return { intent: fast.intent, team: mapping.team };
  }
  return { intent: 'GENERAL_TRAVEL_INFO', team: 'customer-service' };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
export { INTENT_TO_AGENT, detectEmotion, recommendTone };
