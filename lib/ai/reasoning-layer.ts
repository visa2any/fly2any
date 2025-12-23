/**
 * AI Reasoning & Conversational Mediation Layer
 *
 * CRITICAL: This is NOT customer-facing. It THINKS, STRUCTURES, and GUIDES
 * specialist agents to produce human, helpful, context-aware responses.
 *
 * NEVER: expose prices, margins, PII, or execute actions directly
 */

import type { TeamType } from './consultant-handoff';
import type { GroqMessage } from './groq-client';

// ============================================================================
// TYPES
// ============================================================================

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface ReasoningOutput {
  interpreted_intent: string;
  confidence_level: ConfidenceLevel;
  missing_context: string[];
  recommended_primary_agent: TeamType | null;
  recommended_secondary_agent: TeamType | null;
  response_strategy: string;
  clarifying_questions: string[];
  tone_guidance: string;
  allowed_actions: string[];
  forbidden_actions: string[];
  conversion_hint: string | null;
  risk_flags: string[];
}

export interface ReasoningInput {
  message: string;
  language: string;
  pageContext?: string;
  sessionState?: {
    hasSearched?: boolean;
    hasSelectedFlight?: boolean;
    hasBookingInProgress?: boolean;
    previousIntents?: string[];
  };
  conversationHistory?: GroqMessage[];
}

// ============================================================================
// INTENT PATTERNS
// ============================================================================

const INTENT_PATTERNS = {
  flight_search: /\b(fly|flight|ticket|book|travel|trip)\s*(to|from)?\s*\w+/i,
  hotel_search: /\b(hotel|stay|accommodation|lodge|resort|airbnb)\b/i,
  booking_status: /\b(booking|reservation|status|confirmation|pnr|reference)\b/i,
  payment_issue: /\b(pay|payment|card|charge|refund|money)\b/i,
  cancellation: /\b(cancel|refund|change|modify)\b/i,
  complaint: /\b(problem|issue|wrong|bad|terrible|angry|frustrated)\b/i,
  pricing: /\b(price|cost|how much|cheap|expensive|deal|discount)\b/i,
  visa_passport: /\b(visa|passport|travel document|entry requirement)\b/i,
  baggage: /\b(bag|baggage|luggage|carry-on|check-in)\b/i,
  general_inquiry: /\b(what|how|when|where|why|can you|do you)\b/i,
};

const EMOTIONAL_INDICATORS = {
  frustration: /\b(frustrated|angry|annoyed|terrible|worst|hate|awful)\b/i,
  urgency: /\b(urgent|asap|emergency|immediately|now|quick)\b/i,
  confusion: /\b(confused|don't understand|unclear|lost|help)\b/i,
  appreciation: /\b(thank|thanks|appreciate|great|awesome|perfect)\b/i,
};

// ============================================================================
// AGENT MAPPING
// ============================================================================

const INTENT_TO_AGENT: Record<string, TeamType> = {
  flight_search: 'flights',
  hotel_search: 'hotels',
  booking_status: 'payments',
  payment_issue: 'payments',
  cancellation: 'support',
  complaint: 'support',
  pricing: 'flights',
  visa_passport: 'support',
  baggage: 'support',
  general_inquiry: 'general',
};

// ============================================================================
// CORE REASONING FUNCTIONS
// ============================================================================

/**
 * Detect primary intent from user message
 */
function detectIntent(message: string): { intent: string; confidence: ConfidenceLevel } {
  const lowerMessage = message.toLowerCase();

  // Check each pattern
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(lowerMessage)) {
      // Higher confidence if message is focused
      const wordCount = message.split(/\s+/).length;
      const confidence: ConfidenceLevel = wordCount < 5 ? 'medium' :
                                          wordCount < 15 ? 'high' : 'medium';
      return { intent, confidence };
    }
  }

  return { intent: 'general_inquiry', confidence: 'low' };
}

/**
 * Detect emotional state
 */
function detectEmotion(message: string): string {
  for (const [emotion, pattern] of Object.entries(EMOTIONAL_INDICATORS)) {
    if (pattern.test(message)) {
      return emotion;
    }
  }
  return 'neutral';
}

/**
 * Identify missing context
 */
function identifyMissingContext(
  message: string,
  intent: string,
  sessionState?: ReasoningInput['sessionState']
): string[] {
  const missing: string[] = [];

  if (intent === 'flight_search') {
    if (!/\b(from|departing|leaving)\s+\w+/i.test(message)) missing.push('origin_city');
    if (!/\b(to|arriving|going)\s+\w+/i.test(message)) missing.push('destination_city');
    if (!/\b\d{1,2}[\/\-]\d{1,2}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(message)) {
      missing.push('travel_dates');
    }
  }

  if (intent === 'hotel_search') {
    if (!/\b(in|at|near)\s+\w+/i.test(message)) missing.push('destination');
    if (!/\b\d{1,2}[\/\-]\d{1,2}/i.test(message)) missing.push('check_in_date');
  }

  if (intent === 'booking_status') {
    if (!/\b[A-Z0-9]{6,}/i.test(message)) missing.push('booking_reference');
  }

  return missing;
}

/**
 * Generate clarifying questions based on missing context
 */
function generateClarifyingQuestions(missing: string[], language: string): string[] {
  const questions: Record<string, Record<string, string>> = {
    en: {
      origin_city: 'Where would you like to fly from?',
      destination_city: 'Where are you heading to?',
      travel_dates: 'When are you planning to travel?',
      destination: 'Which city are you looking to stay in?',
      check_in_date: 'What are your check-in and check-out dates?',
      booking_reference: 'Could you share your booking reference? (e.g., FLY2A-XXXXXX)',
    },
    pt: {
      origin_city: 'De onde você gostaria de voar?',
      destination_city: 'Para onde você vai?',
      travel_dates: 'Quando você planeja viajar?',
      destination: 'Em qual cidade você procura hospedagem?',
      check_in_date: 'Quais são suas datas de check-in e check-out?',
      booking_reference: 'Poderia compartilhar sua referência de reserva?',
    },
    es: {
      origin_city: '¿Desde dónde te gustaría volar?',
      destination_city: '¿A dónde vas?',
      travel_dates: '¿Cuándo planeas viajar?',
      destination: '¿En qué ciudad buscas alojamiento?',
      check_in_date: '¿Cuáles son tus fechas de check-in y check-out?',
      booking_reference: '¿Podrías compartir tu referencia de reserva?',
    },
  };

  const langQuestions = questions[language] || questions.en;
  return missing.slice(0, 2).map(m => langQuestions[m] || '').filter(Boolean);
}

/**
 * Determine tone guidance based on context
 */
function determineToneGuidance(emotion: string, intent: string): string {
  if (emotion === 'frustration') {
    return 'Empathetic and calm. Acknowledge frustration first. Use ownership language. Avoid policy dumping.';
  }
  if (emotion === 'urgency') {
    return 'Responsive and efficient. Prioritize action. Minimize explanations. Show urgency awareness.';
  }
  if (emotion === 'confusion') {
    return 'Patient and clear. Use simple language. Provide step-by-step guidance. Reassure.';
  }
  if (emotion === 'appreciation') {
    return 'Warm and helpful. Maintain positive momentum. Encourage next steps naturally.';
  }

  // Default based on intent
  if (intent === 'complaint' || intent === 'cancellation') {
    return 'Professional and solution-oriented. Show understanding. Focus on resolution.';
  }

  return 'Friendly, professional, and helpful. Be conversational but efficient.';
}

/**
 * Generate response strategy
 */
function generateResponseStrategy(
  intent: string,
  missing: string[],
  emotion: string,
  sessionState?: ReasoningInput['sessionState']
): string {
  if (emotion === 'frustration') {
    return 'Lead with empathy. Acknowledge the issue. Then address the core need. Offer concrete next step.';
  }

  if (missing.length > 0) {
    return `Clarify missing context (${missing.join(', ')}) using conversational questions. Keep flow natural.`;
  }

  if (sessionState?.hasSelectedFlight) {
    return 'User has selection. Guide toward completion. Minimize friction. Offer payment options.';
  }

  if (intent === 'flight_search' || intent === 'hotel_search') {
    return 'Provide search assistance. Be consultative. Help refine requirements if needed.';
  }

  if (intent === 'booking_status') {
    return 'Lookup booking and provide clear status. Include relevant details. Suggest next steps.';
  }

  return 'Engage conversationally. Understand need. Guide toward appropriate action or information.';
}

/**
 * Identify conversion opportunities (safe)
 */
function identifyConversionHint(
  intent: string,
  sessionState?: ReasoningInput['sessionState']
): string | null {
  if (sessionState?.hasSelectedFlight && !sessionState?.hasBookingInProgress) {
    return 'User has flight selection. Gently encourage booking completion without pressure.';
  }

  if (intent === 'pricing') {
    return 'User price-sensitive. Highlight value, deals, or flexible dates option.';
  }

  if (intent === 'flight_search') {
    return 'User in discovery phase. Offer helpful search assistance to move toward selection.';
  }

  return null;
}

/**
 * Identify risk flags
 */
function identifyRiskFlags(message: string, intent: string): string[] {
  const flags: string[] = [];

  if (/\b(lawyer|legal|sue|court)\b/i.test(message)) {
    flags.push('LEGAL_THREAT');
  }
  if (/\b(hack|steal|fraud|scam)\b/i.test(message)) {
    flags.push('SECURITY_CONCERN');
  }
  if (/\b(api|admin|internal|backend|database)\b/i.test(message)) {
    flags.push('INTERNAL_QUERY');
  }
  if (intent === 'complaint' && /\b(worst|terrible|hate|never again)\b/i.test(message)) {
    flags.push('HIGH_CHURN_RISK');
  }

  return flags;
}

// ============================================================================
// MAIN REASONING FUNCTION
// ============================================================================

/**
 * Process user input and produce structured reasoning output
 * This guides downstream agents without exposing internal logic to users
 */
export function processUserIntent(input: ReasoningInput): ReasoningOutput {
  const { message, language, sessionState } = input;

  // Core analysis
  const { intent, confidence } = detectIntent(message);
  const emotion = detectEmotion(message);
  const missingContext = identifyMissingContext(message, intent, sessionState);

  // Agent routing
  const primaryAgent = INTENT_TO_AGENT[intent] || 'general';
  let secondaryAgent: TeamType | null = null;

  // Multi-topic detection
  if (intent === 'flight_search' && INTENT_PATTERNS.hotel_search.test(message)) {
    secondaryAgent = 'hotels';
  }
  if (intent === 'booking_status' && INTENT_PATTERNS.complaint.test(message)) {
    secondaryAgent = 'support';
  }

  // Generate guidance
  const clarifyingQuestions = generateClarifyingQuestions(missingContext, language);
  const toneGuidance = determineToneGuidance(emotion, intent);
  const responseStrategy = generateResponseStrategy(intent, missingContext, emotion, sessionState);
  const conversionHint = identifyConversionHint(intent, sessionState);
  const riskFlags = identifyRiskFlags(message, intent);

  // Governance: Define allowed/forbidden actions
  const allowedActions = [
    'search_flights',
    'search_hotels',
    'lookup_booking',
    'provide_information',
    'clarify_intent',
    'escalate_to_human',
  ];

  const forbiddenActions = [
    'expose_pricing_internals',
    'share_margins_or_commissions',
    'access_admin_data',
    'confirm_booking_without_payment',
    'share_pii',
    'make_legal_claims',
    'fabricate_urgency',
    'invent_discounts',
  ];

  return {
    interpreted_intent: intent,
    confidence_level: confidence,
    missing_context: missingContext,
    recommended_primary_agent: primaryAgent as TeamType,
    recommended_secondary_agent: secondaryAgent,
    response_strategy: responseStrategy,
    clarifying_questions: clarifyingQuestions,
    tone_guidance: toneGuidance,
    allowed_actions: allowedActions,
    forbidden_actions: forbiddenActions,
    conversion_hint: conversionHint,
    risk_flags: riskFlags,
  };
}

/**
 * Validate that an agent response complies with governance rules
 */
export function validateAgentResponse(
  response: string,
  reasoning: ReasoningOutput
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // Check for forbidden content patterns
  if (/\$\d+.*margin|commission.*\d+%/i.test(response)) {
    violations.push('EXPOSED_MARGIN_DATA');
  }
  if (/internal|admin|backend|api key/i.test(response)) {
    violations.push('INTERNAL_REFERENCE');
  }
  if (/confirmed.*booking.*without/i.test(response)) {
    violations.push('PREMATURE_CONFIRMATION');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Generate fail-safe response when systems are unavailable
 */
export function generateFailSafeGuidance(language: string): ReasoningOutput {
  return {
    interpreted_intent: 'system_unavailable',
    confidence_level: 'low',
    missing_context: [],
    recommended_primary_agent: 'general',
    recommended_secondary_agent: null,
    response_strategy: 'Apologize briefly. Reassure user. Suggest retry or alternative contact method.',
    clarifying_questions: [],
    tone_guidance: 'Calm and reassuring. Take ownership. Do not blame systems.',
    allowed_actions: ['provide_information', 'escalate_to_human'],
    forbidden_actions: ['expose_pricing_internals', 'share_margins_or_commissions'],
    conversion_hint: null,
    risk_flags: ['SYSTEM_DEGRADED'],
  };
}
