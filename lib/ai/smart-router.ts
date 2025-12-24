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
import { executePipeline, StateNotInjectedError, PipelineNotExecutedError, type PipelineInput } from './execution-pipeline';
import { type AgentState } from './agent-state-injector';
import { getConsultantInfo, type TeamType } from './consultant-handoff';
import { processUserIntent, type ReasoningOutput } from './reasoning-layer';
import { finalComplianceCheck } from './agent-compliance';
import { orchestrateExecution, type OrchestrationResult } from './runtime-orchestrator';
import {
  enforceActionExecution,
  assertMandatoryActionExecuted,
  generateActionBasedResponse,
  MandatoryActionViolation,
  type ActionExecutionStatus,
} from './conversion/stage-engine';
import {
  extractEntitiesWithConfidence,
  toHandoffSlots,
  getSlotsNeedingConfirmation,
  shouldTrustSlot,
  validateNoResetViolation,
  type ExtractedEntities,
  type HandoffSlots,
} from './entity-extractor';

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE DETECTION & LOCKING
// ═══════════════════════════════════════════════════════════════════════════
type SupportedLanguage = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko' | 'ar';

const LANGUAGE_PATTERNS: Record<SupportedLanguage, RegExp[]> = {
  pt: [/\b(olá|oi|bom dia|boa tarde|obrigado|voo|hotel|preciso|quero|para|viagem|passagem)\b/i],
  es: [/\b(hola|buenos|gracias|vuelo|necesito|quiero|viaje|pasaje|buscar|reservar)\b/i],
  fr: [/\b(bonjour|merci|vol|hôtel|besoin|veux|voyage|billet|chercher|réserver)\b/i],
  de: [/\b(hallo|guten|danke|flug|hotel|brauche|möchte|reise|buchen|suchen)\b/i],
  it: [/\b(ciao|buongiorno|grazie|volo|albergo|bisogno|voglio|viaggio|prenotare)\b/i],
  zh: [/[\u4e00-\u9fa5]/],
  ja: [/[\u3040-\u309f\u30a0-\u30ff]/],
  ko: [/[\uac00-\ud7af]/],
  ar: [/[\u0600-\u06ff]/],
  en: [], // Default fallback
};

function detectLanguage(message: string): SupportedLanguage {
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    if (lang === 'en') continue;
    for (const pattern of patterns) {
      if (pattern.test(message)) return lang as SupportedLanguage;
    }
  }
  return 'en';
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION CONTEXT (Language Lock + Trip Details)
// ═══════════════════════════════════════════════════════════════════════════
export interface SessionContext {
  sessionId?: string;
  languageLocked?: SupportedLanguage;
  tripContext?: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    cabinClass?: string;
    tripType?: 'one-way' | 'round-trip' | 'multi-city';
  };
  // NEW: Structured slots with confidence scores for handoff
  structuredSlots?: HandoffSlots;
  extractedEntities?: ExtractedEntities;
  slotsNeedingConfirmation?: { slot: string; value: string; prompt: string }[];
  lastIntent?: PrimaryIntent;
  intentHistory?: PrimaryIntent[];
  handoffContext?: string;
  // Reasoning layer output (internal guidance)
  reasoning?: ReasoningOutput;
  // Orchestration result (action execution status)
  orchestration?: OrchestrationResult;
}

// Merge slots (preserves higher confidence values)
function mergeSlots(existing: HandoffSlots | undefined, newSlots: HandoffSlots): HandoffSlots {
  if (!existing) return newSlots;

  const merged: HandoffSlots = { language: newSlots.language };

  // For each slot, keep the one with higher confidence
  const slotNames: (keyof HandoffSlots)[] = ['origin', 'destination', 'departureDate', 'returnDate', 'passengers', 'cabinClass', 'tripType'];

  for (const slot of slotNames) {
    const existingSlot = existing[slot] as { value: unknown; confidence: number } | undefined;
    const newSlot = newSlots[slot] as { value: unknown; confidence: number } | undefined;

    if (newSlot && (!existingSlot || newSlot.confidence >= existingSlot.confidence)) {
      (merged as Record<string, unknown>)[slot] = newSlot;
    } else if (existingSlot) {
      (merged as Record<string, unknown>)[slot] = existingSlot;
    }
  }

  return merged;
}

// Merge session context (preserves trip details across handoffs)
function mergeSessionContext(
  existing: SessionContext | undefined,
  newEntities: QueryAnalysis['entities'],
  newIntent: PrimaryIntent
): SessionContext {
  const merged: SessionContext = { ...existing };

  // Lock language on first message
  if (!merged.languageLocked && newEntities) {
    // Language is set externally
  }

  // Merge trip context (never overwrite with undefined)
  merged.tripContext = {
    origin: newEntities?.origin || merged.tripContext?.origin,
    destination: newEntities?.destination || merged.tripContext?.destination,
    departureDate: newEntities?.departureDate || merged.tripContext?.departureDate,
    returnDate: newEntities?.returnDate || merged.tripContext?.returnDate,
    passengers: newEntities?.passengers || merged.tripContext?.passengers,
    cabinClass: newEntities?.cabinClass || merged.tripContext?.cabinClass,
  };

  // Track intent history
  merged.intentHistory = [...(merged.intentHistory || []), newIntent].slice(-5);
  merged.lastIntent = newIntent;

  return merged;
}

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
    sessionContext?: SessionContext;
  } = {}
): Promise<RouterResponse & { sessionContext: SessionContext }> {
  const { conversationHistory = [], customerName, useAI = true, sessionContext: existingContext } = options;

  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGE LOCK: Detect and lock on first message
  // ═══════════════════════════════════════════════════════════════════════════
  const detectedLanguage = detectLanguage(message);
  const lockedLanguage = existingContext?.languageLocked || detectedLanguage;

  // Get routing context
  const routing = await routeUserMessage(message);

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTITY EXTRACTION WITH CONFIDENCE SCORES (handles typos, multi-language)
  // ═══════════════════════════════════════════════════════════════════════════
  const extractedEntities = extractEntitiesWithConfidence(message, lockedLanguage as 'en' | 'pt' | 'es');
  const structuredSlots = toHandoffSlots(extractedEntities);
  const confirmationsNeeded = getSlotsNeedingConfirmation(extractedEntities);

  console.log('[SMART-ROUTER] Entity extraction:', {
    origin: extractedEntities.origin ? `${extractedEntities.origin.value} (${extractedEntities.origin.confidence.toFixed(2)})` : 'none',
    destination: extractedEntities.destination ? `${extractedEntities.destination.value} (${extractedEntities.destination.confidence.toFixed(2)})` : 'none',
    departureDate: extractedEntities.departureDate ? `${extractedEntities.departureDate.value} (${extractedEntities.departureDate.confidence.toFixed(2)})` : 'none',
    confirmationsNeeded: confirmationsNeeded.length,
  });

  // Also run legacy extraction for backward compatibility
  const locations = extractLocations(message);
  const dates = extractDates(message);
  const passengers = extractPassengers(message);
  const cabinClass = extractCabinClass(message);

  // Build analysis with confidence-enhanced entities
  const legacyIntent = routing.primary_intent.toLowerCase().replace('_', '-');
  const analysis: QueryAnalysis = {
    intent: legacyIntent,
    confidence: 0.8,
    team: routing.target_agent,
    entities: {
      // Prefer confidence-based extraction
      origin: shouldTrustSlot(extractedEntities.origin) ? extractedEntities.origin?.value : locations.origin,
      destination: shouldTrustSlot(extractedEntities.destination) ? extractedEntities.destination?.value : locations.destination,
      city: locations.city,
      departureDate: shouldTrustSlot(extractedEntities.departureDate) ? extractedEntities.departureDate?.value : dates.departure,
      returnDate: shouldTrustSlot(extractedEntities.returnDate) ? extractedEntities.returnDate?.value : dates.return,
      passengers: shouldTrustSlot(extractedEntities.passengers) ? extractedEntities.passengers?.value : passengers,
      cabinClass: shouldTrustSlot(extractedEntities.cabinClass) ? extractedEntities.cabinClass?.value : cabinClass,
    },
    requiresAI: false,
    rawMessage: message,
    routing,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT PERSISTENCE: Merge trip details from previous turns
  // ═══════════════════════════════════════════════════════════════════════════
  const updatedContext = mergeSessionContext(existingContext, analysis.entities, routing.primary_intent);
  updatedContext.languageLocked = lockedLanguage;

  // Store structured slots with confidence for handoff
  updatedContext.extractedEntities = extractedEntities;
  updatedContext.structuredSlots = mergeSlots(existingContext?.structuredSlots, structuredSlots);
  if (confirmationsNeeded.length > 0) {
    updatedContext.slotsNeedingConfirmation = confirmationsNeeded.map(c => ({
      slot: c.slot as string,
      value: c.value,
      prompt: c.confirmationPrompt[lockedLanguage] || c.confirmationPrompt.en,
    }));
  }

  // Enrich entities with persisted context (if missing from current message)
  if (updatedContext.tripContext) {
    analysis.entities = {
      ...analysis.entities,
      origin: analysis.entities.origin || updatedContext.tripContext.origin,
      destination: analysis.entities.destination || updatedContext.tripContext.destination,
      departureDate: analysis.entities.departureDate || updatedContext.tripContext.departureDate,
      returnDate: analysis.entities.returnDate || updatedContext.tripContext.returnDate,
      passengers: analysis.entities.passengers || updatedContext.tripContext.passengers,
      cabinClass: analysis.entities.cabinClass || updatedContext.tripContext.cabinClass,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REASONING LAYER: Process intent for agent guidance (internal only)
  // ═══════════════════════════════════════════════════════════════════════════
  const reasoning = processUserIntent({
    message,
    language: lockedLanguage,
    sessionState: {
      hasSearched: !!updatedContext.tripContext?.destination,
      previousIntents: updatedContext.intentHistory?.map(i => i.toString()),
    },
    conversationHistory,
  });
  updatedContext.reasoning = reasoning;

  // ═══════════════════════════════════════════════════════════════════════════
  // RUNTIME ORCHESTRATION: Execute actions based on reasoning + stage rules
  // ═══════════════════════════════════════════════════════════════════════════
  const sessionId = updatedContext.sessionId || `session_${Date.now()}`;
  updatedContext.sessionId = sessionId;

  try {
    const orchestrationResult = await orchestrateExecution({
      sessionId,
      message,
      reasoning,
      language: lockedLanguage,
    });
    updatedContext.orchestration = orchestrationResult;

    // Log orchestration for observability
    if (orchestrationResult.actionExecuted) {
      console.log(`[SMART-ROUTER] Action executed successfully`);
    } else if (orchestrationResult.blockedReason) {
      console.log(`[SMART-ROUTER] Action blocked: ${orchestrationResult.blockedReason}`);
    }
  } catch (orchError) {
    console.error('[SMART-ROUTER] Orchestration error:', orchError);
    // Continue without orchestration - don't break the main flow
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MANDATORY ACTION ENFORCEMENT: Block fallback when action is required
  // ═══════════════════════════════════════════════════════════════════════════
  const isSearchIntent = ['FLIGHT_SEARCH', 'HOTEL_SEARCH'].includes(routing.primary_intent);
  const orchestration = updatedContext.orchestration;

  // Build action status from orchestration result
  const actionStatus: ActionExecutionStatus = {
    actionExecuted: orchestration?.actionExecuted || false,
    actionType: orchestration?.actionResult ? 'execute_search' : (orchestration?.nextAction === 'ask_consent' ? 'ask_consent' : null),
    results: orchestration?.actionResult?.data ? {
      count: orchestration.actionResult.data.count || 0,
      data: orchestration.actionResult.data.offers || orchestration.actionResult.data.results,
    } : undefined,
    error: orchestration?.actionResult?.error,
  };

  let aiResponse: string | undefined;
  let enforcementHandled = false;

  // If search intent + action was executed → use action-based response (NOT AI fallback)
  if (isSearchIntent && actionStatus.actionExecuted) {
    const actionResponse = generateActionBasedResponse(actionStatus, lockedLanguage);
    aiResponse = actionResponse.response;
    enforcementHandled = true;
    console.log(`[SMART-ROUTER] ACTION_BASED_RESPONSE: type=${actionResponse.type}`);
  }

  // If search intent + needs consent → use consent prompt (NOT AI fallback)
  if (isSearchIntent && orchestration?.nextAction === 'ask_consent') {
    const consentResponse = generateActionBasedResponse(
      { actionExecuted: false, actionType: 'ask_consent' },
      lockedLanguage
    );
    aiResponse = consentResponse.response;
    enforcementHandled = true;
    console.log(`[SMART-ROUTER] CONSENT_PROMPT_RESPONSE`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UNIFIED PIPELINE: ALL AI responses go through mandatory state injection
  // ═══════════════════════════════════════════════════════════════════════════
  const isSpecificIntent = !['GENERAL_TRAVEL_INFO', 'CUSTOMER_SUPPORT'].includes(routing.primary_intent);
  const shouldGenerateAI = useAI && isGroqAvailable() && !enforcementHandled;

  if (shouldGenerateAI) {
    try {
      // Determine stage from reasoning
      const stage = reasoning.stage || 'GATHERING_DETAILS';

      // Build pipeline input with MANDATORY state
      const pipelineInput: PipelineInput = {
        message,
        language: (lockedLanguage === 'pt' || lockedLanguage === 'es' ? lockedLanguage : 'en') as 'en' | 'pt' | 'es',
        intent: routing.primary_intent,
        stage: stage,
        agentType: routing.target_agent,
        slots: updatedContext.structuredSlots || { language: lockedLanguage as 'en' | 'pt' | 'es' },
        conversationHistory,
        customerName,
        reasoning,
        handoffFrom: options.previousTeam ? `Agent (${options.previousTeam})` : undefined,
        searchResults: orchestration?.actionResult?.data,
      };

      // Execute unified pipeline (throws if state not injected)
      const pipelineResult = await executePipeline(pipelineInput);
      aiResponse = pipelineResult.response;

      // Log successful pipeline execution
      console.log('[SMART-ROUTER] PIPELINE_SUCCESS:', {
        intent: pipelineResult.debugLog.intent,
        stage: pipelineResult.debugLog.stage,
        language: pipelineResult.debugLog.language,
        slotsCount: pipelineResult.debugLog.slotsCount,
      });

    } catch (error) {
      if (error instanceof StateNotInjectedError || error instanceof PipelineNotExecutedError) {
        console.error('[SMART-ROUTER] AI_PIPELINE_NOT_EXECUTED:', error.message);
        // Block response - cannot generate without proper pipeline execution
        aiResponse = undefined;
      } else {
        console.error('[SMART-ROUTER] Pipeline error:', error);
        throw error;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RUNTIME ASSERTION: Throw if mandatory action was NOT executed
  // ═══════════════════════════════════════════════════════════════════════════
  if (isSearchIntent && !enforcementHandled) {
    try {
      assertMandatoryActionExecuted(
        sessionId,
        routing.primary_intent,
        routing.urgency_level === 'HIGH' || routing.urgency_level === 'CRITICAL' ? 'HIGH' : 'LOW',
        actionStatus
      );
    } catch (err) {
      if (err instanceof MandatoryActionViolation) {
        // Log violation but don't crash - generate consent prompt instead
        console.error(`[SMART-ROUTER] MANDATORY_ACTION_VIOLATION: ${err.message}`);
        aiResponse = generateActionBasedResponse(
          { actionExecuted: false, actionType: 'ask_consent' },
          lockedLanguage
        ).response;
      } else {
        throw err;
      }
    }
  }

  const consultantInfo = getConsultantInfo(routing.target_agent);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDOFF CONTEXT: Preserve details when switching agents
  // ═══════════════════════════════════════════════════════════════════════════
  if (options.previousTeam && options.previousTeam !== routing.target_agent) {
    updatedContext.handoffContext = `Previous: ${options.previousTeam}. Trip: ${JSON.stringify(updatedContext.tripContext)}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLIANCE CHECK: Enforce agent rules before response
  // ═══════════════════════════════════════════════════════════════════════════
  let finalResponse = aiResponse;
  if (aiResponse && reasoning) {
    const compliance = finalComplianceCheck(aiResponse, reasoning, lockedLanguage);
    finalResponse = compliance.response;
    if (compliance.wasModified) {
      console.log('[Compliance] Response was auto-corrected');
    }
  }

  return {
    analysis,
    aiResponse: finalResponse,
    consultantInfo: {
      name: consultantInfo.name,
      title: consultantInfo.title,
      team: consultantInfo.team,
      emoji: consultantInfo.emoji,
    },
    routing,
    sessionContext: updatedContext,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT RESPONSE WITH CONTEXT (Uses unified pipeline)
// ═══════════════════════════════════════════════════════════════════════════
export async function getAgentResponse(
  message: string,
  conversationHistory: GroqMessage[] = []
): Promise<{ response: string; context: RoutingContext; provider?: string }> {
  const context = await routeUserMessage(message);
  const detectedLang = detectLanguage(message);

  try {
    // Use unified pipeline with mandatory state injection
    const pipelineResult = await executePipeline({
      message,
      language: (detectedLang === 'pt' || detectedLang === 'es' ? detectedLang : 'en') as 'en' | 'pt' | 'es',
      intent: context.primary_intent,
      stage: 'GATHERING_DETAILS',
      agentType: context.target_agent,
      slots: { language: (detectedLang === 'pt' || detectedLang === 'es' ? detectedLang : 'en') as 'en' | 'pt' | 'es' },
      conversationHistory: conversationHistory.slice(-6),
    });

    return {
      response: pipelineResult.response,
      context,
      provider: 'groq',
    };
  } catch (error) {
    console.error('[getAgentResponse] Pipeline failed:', error);
    return {
      response: "I'm connecting you with a specialist who can help.",
      context,
    };
  }
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
export {
  INTENT_TO_AGENT,
  detectEmotion,
  recommendTone,
  detectLanguage,
  mergeSessionContext,
  // SessionContext already exported via interface declaration
  type SupportedLanguage,
};
