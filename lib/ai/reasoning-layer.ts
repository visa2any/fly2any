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

// Conversation Stage Tracking - CRITICAL for conversion intelligence
export type ConversationStage =
  | 'DISCOVERY'         // User exploring, no specifics → inspire, guide, ask
  | 'NARROWING'         // Some context → suggest destinations, seasons, tips
  | 'READY_TO_SEARCH'   // Has dates/city → ask for remaining details
  | 'READY_TO_BOOK'     // All details, flight selected → explicit permission only
  | 'POST_BOOKING';     // Booking complete → support, upsell

// Chaos Intent Classifications
export type ChaosClassification =
  | 'CHAOTIC_INTENT'      // Vague, contradictory, mixed signals
  | 'LOW_INFORMATION'     // Minimal input, needs context
  | 'EXPLORATORY_TRAVEL'  // Dreaming/planning, no specifics
  | 'FAMILY_TRAVEL'       // Kids, family mentioned
  | 'BUDGET_SENSITIVE'    // Cheap/barato without numbers
  | 'CLEAR_INTENT';       // Standard clear request

export interface ReasoningOutput {
  interpreted_intent: string;
  confidence_level: ConfidenceLevel;
  chaos_classification: ChaosClassification;
  conversation_stage: ConversationStage;
  stage_actions: string[];              // What agent CAN do at this stage
  stage_forbidden: string[];            // What agent MUST NOT do at this stage
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
  suggested_destinations?: string[];  // For exploratory - NO PRICES
}

export interface ReasoningInput {
  message: string;
  language: string;
  pageContext?: string;
  sessionState?: {
    hasSearched?: boolean;
    hasSelectedFlight?: boolean;
    hasBookingInProgress?: boolean;
    hasBookingComplete?: boolean;
    previousIntents?: string[];
    // Conversation stage tracking
    currentStage?: ConversationStage;
    collectedContext?: {
      origin?: string;
      destination?: string;
      dates?: string;
      passengers?: number;
      travelType?: string;  // leisure, business, family
    };
  };
  conversationHistory?: GroqMessage[];
}

// ============================================================================
// INTENT PATTERNS
// ============================================================================

const INTENT_PATTERNS = {
  flight_search: /\b(fly|flight|ticket|book|travel|trip|voo|viagem|passagem|quero ir|viajar)\b/i,
  hotel_search: /\b(hotel|stay|accommodation|lodge|resort|airbnb|hospedagem|pousada)\b/i,
  booking_status: /\b(booking|reservation|status|confirmation|pnr|reference|reserva|confirmação)\b/i,
  payment_issue: /\b(pay|payment|card|charge|refund|money|pagamento|cartão|reembolso)\b/i,
  cancellation: /\b(cancel|refund|change|modify|cancelar|alterar|mudar)\b/i,
  complaint: /\b(problem|issue|wrong|bad|terrible|angry|frustrated|problema|ruim|péssimo)\b/i,
  pricing: /\b(price|cost|how much|cheap|expensive|deal|discount|preço|barato|caro|promoção)\b/i,
  visa_passport: /\b(visa|passport|travel document|entry requirement|visto|passaporte)\b/i,
  baggage: /\b(bag|baggage|luggage|carry-on|check-in|mala|bagagem)\b/i,
  general_inquiry: /\b(what|how|when|where|why|can you|do you|o que|como|quando|onde)\b/i,
};

const EMOTIONAL_INDICATORS = {
  frustration: /\b(frustrated|angry|annoyed|terrible|worst|hate|awful)\b/i,
  urgency: /\b(urgent|asap|emergency|immediately|now|quick)\b/i,
  confusion: /\b(confused|don't understand|unclear|lost|help)\b/i,
  appreciation: /\b(thank|thanks|appreciate|great|awesome|perfect)\b/i,
};

// ============================================================================
// CHAOS DETECTION PATTERNS
// ============================================================================

const CHAOS_PATTERNS = {
  // Vague/incomplete (EN/PT/ES)
  vague: /\b(something|anything|somewhere|algo|qualquer|algum lugar|alguna parte)\b/i,
  // Contradictory timing
  contradictory_time: /\b(tomorrow|next month|maybe|or|talvez|amanhã|mês que vem|quizás|mañana)\b.*\b(tomorrow|next month|maybe|or|talvez|amanhã|mês que vem|quizás|mañana)\b/i,
  // Pure uncertainty
  uncertainty: /\b(don'?t know|no idea|not sure|não sei|sei lá|no sé|ni idea)\b/i,
  // Just want to travel (no specifics)
  just_travel: /\b(just want|only want|só quero|solo quiero)\s*(to )?(travel|go|fly|viajar|ir)\b/i,
  // Mixed language indicators
  mixed_lang: /[a-z]+\s+(quero|para|vou|tengo|quiero)\b|\b(quero|para|vou|tengo|quiero)\s+[a-z]+/i,
  // Very short input (under 4 words)
  minimal: /^(\S+\s*){1,3}$/,
};

const FAMILY_PATTERNS = /\b(kid|kids|child|children|baby|infant|family|criança|crianças|bebê|família|niño|niños|bebé|familia)\b/i;
const BUDGET_PATTERNS = /\b(cheap|cheapest|budget|affordable|barato|econômico|económico|low cost|promocao|promoção|oferta)\b/i;
const EXPLORATORY_PATTERNS = /\b(dream|dreaming|planning|thinking|want to go|would like|someday|one day|sonho|sonhando|planejando|pensando|quero conhecer|gostaria|sueño|soñando|planificando|quiero viajar|quiero ir)\b/i;

// Destination suggestions by region (NO PRICES - NEVER)
const DESTINATION_SUGGESTIONS: Record<string, string[]> = {
  europe: ['Paris', 'Barcelona', 'Rome', 'Amsterdam', 'Lisbon'],
  asia: ['Tokyo', 'Bangkok', 'Bali', 'Singapore', 'Seoul'],
  americas: ['New York', 'Cancun', 'Buenos Aires', 'Miami', 'Toronto'],
  beach: ['Maldives', 'Punta Cana', 'Cancun', 'Bali', 'Phuket'],
  adventure: ['Patagonia', 'Iceland', 'New Zealand', 'Costa Rica', 'Peru'],
  family: ['Orlando', 'Cancun', 'Lisbon', 'Barcelona', 'Tokyo'],
};

// ============================================================================
// CONVERSATION STAGE RULES - CONVERSION INTELLIGENCE
// ============================================================================

// Stage detection patterns - robust date/destination detection
const DATE_PATTERNS = /\b(\d{1,2}[\/\-]\d{1,2}|\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|next week|next month|próxima semana|próximo mês)\b/i;
const DESTINATION_DETECTION = /\b(to|in|for|para|em|a )\s*(paris|london|rome|roma|tokyo|barcelona|new york|los angeles|miami|cancun|orlando|lisbon|lisboa|amsterdam|bali|bangkok|dubai|singapore|europe|europa|asia|ásia)/i;
const PASSENGER_PATTERNS = /\b(\d+)\s*(adult|passenger|person|people|traveler|adulto|passageiro|pessoa|viajante)s?\b/i;

// Stage-specific allowed/forbidden actions
const STAGE_RULES: Record<ConversationStage, { allowed: string[]; forbidden: string[] }> = {
  DISCOVERY: {
    allowed: ['inspire', 'ask_open_questions', 'suggest_regions', 'share_tips', 'explore_preferences'],
    forbidden: ['show_prices', 'initiate_search', 'show_booking_form', 'collect_payment_info', 'rush_to_book'],
  },
  NARROWING: {
    allowed: ['suggest_destinations', 'share_seasonal_tips', 'ask_dates', 'ask_travelers', 'compare_options'],
    forbidden: ['show_prices', 'show_booking_form', 'collect_payment_info', 'skip_to_booking'],
  },
  READY_TO_SEARCH: {
    allowed: ['confirm_details', 'initiate_search', 'show_flight_results', 'compare_flights'],
    forbidden: ['collect_payment_info', 'auto_book', 'skip_confirmation'],
  },
  READY_TO_BOOK: {
    allowed: ['show_booking_summary', 'collect_passenger_details', 'process_payment', 'confirm_booking'],
    forbidden: ['auto_book_without_permission', 'skip_review'],
  },
  POST_BOOKING: {
    allowed: ['show_confirmation', 'offer_add_ons', 'provide_support', 'send_itinerary'],
    forbidden: ['pressure_upsell', 'hide_cancellation_policy'],
  },
};

/**
 * Determine conversation stage based on context
 * CRITICAL: Agents MUST NOT skip stages
 */
function determineConversationStage(
  message: string,
  chaosClass: ChaosClassification,
  sessionState?: ReasoningInput['sessionState']
): ConversationStage {
  // POST_BOOKING: Already completed
  if (sessionState?.hasBookingComplete) {
    return 'POST_BOOKING';
  }

  // READY_TO_BOOK: Flight selected, booking in progress
  if (sessionState?.hasSelectedFlight || sessionState?.hasBookingInProgress) {
    return 'READY_TO_BOOK';
  }

  // Check collected context
  const ctx = sessionState?.collectedContext;
  const hasDates = ctx?.dates || DATE_PATTERNS.test(message);
  const hasDestination = ctx?.destination || DESTINATION_DETECTION.test(message);
  const hasOrigin = ctx?.origin || /\b(from|de |saindo de)\s+[A-Z][a-z]+/i.test(message);

  // READY_TO_SEARCH: Has core details (dates + destination or origin)
  if (hasDates && (hasDestination || hasOrigin)) {
    return 'READY_TO_SEARCH';
  }

  // NARROWING: Has some specifics but not complete
  if (hasDestination || hasOrigin || hasDates ||
      chaosClass === 'FAMILY_TRAVEL' ||
      chaosClass === 'BUDGET_SENSITIVE') {
    return 'NARROWING';
  }

  // DISCOVERY: Vague, exploratory, or new conversation
  if (chaosClass === 'CHAOTIC_INTENT' ||
      chaosClass === 'LOW_INFORMATION' ||
      chaosClass === 'EXPLORATORY_TRAVEL' ||
      !sessionState?.previousIntents?.length) {
    return 'DISCOVERY';
  }

  // Default to current stage or DISCOVERY
  return sessionState?.currentStage || 'DISCOVERY';
}

/**
 * Get stage-specific guidance for agents (Lisa Thompson, Sarah Chen, etc.)
 */
function getStageGuidance(stage: ConversationStage, language: string): string {
  const guidance: Record<ConversationStage, Record<string, string>> = {
    DISCOVERY: {
      en: 'DISCOVERY STAGE: Inspire and explore. Ask open questions. Suggest dream destinations. Do NOT show prices or initiate searches yet.',
      pt: 'FASE DESCOBERTA: Inspire e explore. Faça perguntas abertas. Sugira destinos dos sonhos. NÃO mostre preços ainda.',
      es: 'FASE DESCUBRIMIENTO: Inspira y explora. Haz preguntas abiertas. Sugiere destinos soñados. NO muestres precios aún.',
    },
    NARROWING: {
      en: 'NARROWING STAGE: Help refine choices. Suggest seasons, destinations. Ask for dates and travelers. Do NOT show prices yet.',
      pt: 'FASE REFINAMENTO: Ajude a refinar escolhas. Sugira épocas, destinos. Pergunte datas e viajantes. NÃO mostre preços ainda.',
      es: 'FASE REFINAMIENTO: Ayuda a refinar opciones. Sugiere temporadas, destinos. Pregunta fechas y viajeros. NO muestres precios aún.',
    },
    READY_TO_SEARCH: {
      en: 'READY TO SEARCH: Confirm final details. Initiate search. Show flight options. Guide toward selection.',
      pt: 'PRONTO PARA BUSCAR: Confirme detalhes finais. Inicie a busca. Mostre opções de voo. Guie para seleção.',
      es: 'LISTO PARA BUSCAR: Confirma detalles finales. Inicia la búsqueda. Muestra opciones de vuelo. Guía hacia la selección.',
    },
    READY_TO_BOOK: {
      en: 'READY TO BOOK: ONLY proceed with explicit user permission. Show clear summary. Collect details step by step.',
      pt: 'PRONTO PARA RESERVAR: SÓ prossiga com permissão explícita. Mostre resumo claro. Colete dados passo a passo.',
      es: 'LISTO PARA RESERVAR: SOLO procede con permiso explícito. Muestra resumen claro. Recoge datos paso a paso.',
    },
    POST_BOOKING: {
      en: 'POST BOOKING: Celebrate! Provide confirmation details. Offer helpful add-ons. Be ready for support questions.',
      pt: 'PÓS-RESERVA: Celebre! Forneça detalhes de confirmação. Ofereça extras úteis. Esteja pronto para suporte.',
      es: 'POST-RESERVA: ¡Celebra! Proporciona detalles de confirmación. Ofrece extras útiles. Prepárate para soporte.',
    },
  };
  return guidance[stage][language] || guidance[stage].en;
}

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

// Uncertainty markers that indicate exploratory queries (EN/PT/ES)
const UNCERTAINTY_MARKERS = /\b(don'?t know|not sure|maybe|perhaps|possibly|might|could be|não sei|talvez|quem sabe|pode ser|no sé|quizás|tal vez|puede ser)\b/i;

/**
 * Classify chaos level - determines how to handle vague/incomplete inputs
 */
function classifyChaos(message: string): { classification: ChaosClassification; suggestions?: string[] } {
  const wordCount = message.trim().split(/\s+/).length;

  // Priority 1: Family travel (clear sub-classification)
  if (FAMILY_PATTERNS.test(message)) {
    return {
      classification: 'FAMILY_TRAVEL',
      suggestions: DESTINATION_SUGGESTIONS.family
    };
  }

  // Priority 2: Budget-sensitive (WITHOUT exposing prices)
  if (BUDGET_PATTERNS.test(message) && !/\$|\d+\s*(usd|eur|brl|dollars?|reais)/i.test(message)) {
    return { classification: 'BUDGET_SENSITIVE' };
  }

  // Priority 3: Exploratory/dreaming
  if (EXPLORATORY_PATTERNS.test(message) || CHAOS_PATTERNS.just_travel.test(message)) {
    // Detect region hints for suggestions
    let suggestions: string[] = [];
    if (/europ|paris|london|lisbon|roma|barcelona/i.test(message)) suggestions = DESTINATION_SUGGESTIONS.europe;
    else if (/asia|japan|thai|bali|tokyo/i.test(message)) suggestions = DESTINATION_SUGGESTIONS.asia;
    else if (/beach|praia|playa|mar|ocean/i.test(message)) suggestions = DESTINATION_SUGGESTIONS.beach;
    else if (/adventure|aventura|hiking|nature/i.test(message)) suggestions = DESTINATION_SUGGESTIONS.adventure;
    else suggestions = [...DESTINATION_SUGGESTIONS.europe.slice(0, 2), ...DESTINATION_SUGGESTIONS.beach.slice(0, 2)];

    return { classification: 'EXPLORATORY_TRAVEL', suggestions };
  }

  // Priority 4: Low information (very short, minimal context)
  if (wordCount <= 4 || CHAOS_PATTERNS.minimal.test(message)) {
    return { classification: 'LOW_INFORMATION' };
  }

  // Priority 5: Chaotic intent (contradictory, vague, mixed)
  const chaosSignals = [
    CHAOS_PATTERNS.vague.test(message),
    CHAOS_PATTERNS.contradictory_time.test(message),
    CHAOS_PATTERNS.uncertainty.test(message),
    CHAOS_PATTERNS.mixed_lang.test(message),
  ].filter(Boolean).length;

  if (chaosSignals >= 2) {
    return { classification: 'CHAOTIC_INTENT' };
  }

  // Default: Clear intent
  return { classification: 'CLEAR_INTENT' };
}

/**
 * Generate chaos-appropriate clarifying questions (max 2)
 */
function getChaosQuestions(classification: ChaosClassification, language: string): string[] {
  const questions: Record<ChaosClassification, Record<string, string[]>> = {
    CHAOTIC_INTENT: {
      en: ['Where would you like to explore?', 'Do you have flexible travel dates?'],
      pt: ['Qual região você gostaria de conhecer?', 'Suas datas são flexíveis?'],
      es: ['¿Qué región te gustaría conocer?', '¿Tus fechas son flexibles?'],
    },
    LOW_INFORMATION: {
      en: ['Where are you dreaming of going?', 'When would you like to travel?'],
      pt: ['Para onde você sonha em viajar?', 'Quando gostaria de ir?'],
      es: ['¿A dónde sueñas con viajar?', '¿Cuándo te gustaría ir?'],
    },
    EXPLORATORY_TRAVEL: {
      en: ['What type of experience are you looking for?', 'Are you traveling solo or with others?'],
      pt: ['Que tipo de experiência você busca?', 'Vai viajar sozinho ou acompanhado?'],
      es: ['¿Qué tipo de experiencia buscas?', '¿Viajas solo o acompañado?'],
    },
    FAMILY_TRAVEL: {
      en: ['How many travelers including kids?', 'Any age restrictions to consider?'],
      pt: ['Quantos viajantes, incluindo crianças?', 'Alguma restrição de idade?'],
      es: ['¿Cuántos viajeros incluyendo niños?', '¿Alguna restricción de edad?'],
    },
    BUDGET_SENSITIVE: {
      en: ['What\'s most important: dates, destination, or flexibility?', 'Would you consider nearby airports?'],
      pt: ['O que é mais importante: datas, destino ou flexibilidade?', 'Consideraria aeroportos próximos?'],
      es: ['¿Qué es más importante: fechas, destino o flexibilidad?', '¿Considerarías aeropuertos cercanos?'],
    },
    CLEAR_INTENT: {
      en: [], pt: [], es: [],
    },
  };

  return questions[classification][language] || questions[classification].en || [];
}

/**
 * Detect primary intent from user message
 */
function detectIntent(message: string): { intent: string; confidence: ConfidenceLevel } {
  const lowerMessage = message.toLowerCase();

  // Check for uncertainty markers - these indicate exploratory queries
  const hasUncertainty = UNCERTAINTY_MARKERS.test(message);

  // Check each pattern
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(lowerMessage)) {
      // If uncertainty markers present, always use low/medium confidence
      if (hasUncertainty) {
        return { intent, confidence: 'low' };
      }

      // Otherwise, higher confidence if message is focused
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
    // Origin: from/de/saindo de
    if (!/\b(from|departing|leaving|de |saindo)\s+\w+/i.test(message)) missing.push('origin_city');
    // Destination check - but "Europa" is a destination, so we check for specifics
    // if user says "para Europa" that's a destination but vague
    // Dates: check for dates or month names (EN/PT)
    if (!/\b\d{1,2}[\/\-]\d{1,2}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i.test(message)) {
      missing.push('travel_dates');
    }
  }

  if (intent === 'hotel_search') {
    if (!/\b(in|at|near|em|no|na)\s+\w+/i.test(message)) missing.push('destination');
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

  // CHAOS CLASSIFICATION - handle vague/incomplete inputs
  const { classification: chaosClass, suggestions } = classifyChaos(message);

  // CONVERSATION STAGE TRACKING - conversion intelligence
  const conversationStage = determineConversationStage(message, chaosClass, sessionState);
  const stageRules = STAGE_RULES[conversationStage];
  const stageGuidance = getStageGuidance(conversationStage, language);

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

  // Generate guidance - use chaos questions for chaotic inputs
  let clarifyingQuestions: string[];
  if (chaosClass !== 'CLEAR_INTENT') {
    // Use chaos-specific questions (max 2)
    clarifyingQuestions = getChaosQuestions(chaosClass, language);
  } else {
    clarifyingQuestions = generateClarifyingQuestions(missingContext, language);
  }

  // Adapt tone for chaos
  let toneGuidance = determineToneGuidance(emotion, intent);
  if (chaosClass === 'CHAOTIC_INTENT' || chaosClass === 'LOW_INFORMATION') {
    toneGuidance = 'Extra patient and encouraging. Guide gently. NEVER say "I can\'t help". Always offer forward path.';
  }

  // Adapt response strategy for chaos AND stage
  let responseStrategy = generateResponseStrategy(intent, missingContext, emotion, sessionState);
  if (chaosClass !== 'CLEAR_INTENT') {
    responseStrategy = `CHAOS HANDLING (${chaosClass}): Ask max 2 questions. Suggest destinations WITHOUT prices. Never block conversation. ${responseStrategy}`;
  }
  // Add stage guidance to strategy
  responseStrategy = `[${conversationStage}] ${stageGuidance} | ${responseStrategy}`;

  const conversionHint = identifyConversionHint(intent, sessionState);
  const riskFlags = identifyRiskFlags(message, intent);

  // Governance: Combine base actions with stage-specific rules
  const allowedActions = [
    ...stageRules.allowed,
    'clarify_intent',
    'escalate_to_human',
  ];

  const forbiddenActions = [
    ...stageRules.forbidden,
    'expose_pricing_internals',
    'share_margins_or_commissions',
    'access_admin_data',
    'share_pii',
    'make_legal_claims',
    'say_cannot_help',
    'skip_stages',  // CRITICAL: Never jump stages
  ];

  return {
    interpreted_intent: intent,
    confidence_level: confidence,
    chaos_classification: chaosClass,
    conversation_stage: conversationStage,
    stage_actions: stageRules.allowed,
    stage_forbidden: stageRules.forbidden,
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
    suggested_destinations: suggestions,
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
