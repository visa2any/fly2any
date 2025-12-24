/**
 * Conversation Stage Engine
 *
 * Manages conversation stages for conversion optimization.
 * STRICT RULES: No stage skipping, no premature actions.
 */

import type { ConversationStage, ChaosClassification } from '../reasoning-layer';

// ============================================================================
// TYPES
// ============================================================================

export interface StageContext {
  sessionId: string;
  currentStage: ConversationStage;
  previousStage: ConversationStage | null;
  stageHistory: StageTransition[];
  collectedData: CollectedData;
  stageStartTime: number;
  userConsents: UserConsents;
}

export interface StageTransition {
  from: ConversationStage;
  to: ConversationStage;
  timestamp: number;
  trigger: string;
}

export interface CollectedData {
  origin?: string;
  destination?: string;
  dates?: string;
  dateRange?: { start?: string; end?: string };
  passengers?: number;
  cabinClass?: string;
  travelType?: 'leisure' | 'business' | 'family';
  budgetStyle?: 'budget' | 'mid' | 'premium';
  preferences?: string[];
}

export interface UserConsents {
  searchPermission: boolean;
  bookingPermission: boolean;
  searchPermissionTime?: number;
  bookingPermissionTime?: number;
}

// ============================================================================
// STAGE RULES - IMMUTABLE
// ============================================================================

export const STAGE_RULES: Record<ConversationStage, {
  allowedActions: string[];
  forbiddenActions: string[];
  maxQuestions: number;
  canShowPrices: boolean;
  requiresConsent: string[];
  nextStages: ConversationStage[];
}> = {
  DISCOVERY: {
    allowedActions: ['inspire', 'ask_questions', 'suggest_regions', 'normalize_indecision'],
    forbiddenActions: ['execute_search', 'show_prices', 'initiate_booking', 'collect_payment'],
    maxQuestions: 2,
    canShowPrices: false,
    requiresConsent: [],
    nextStages: ['NARROWING'],
  },
  NARROWING: {
    allowedActions: ['suggest_destinations', 'share_tips', 'ask_dates', 'ask_travelers', 'prepare_mentally'],
    forbiddenActions: ['execute_search', 'show_prices', 'initiate_booking', 'collect_payment'],
    maxQuestions: 2,
    canShowPrices: false,
    requiresConsent: [],
    nextStages: ['READY_TO_SEARCH'],
  },
  READY_TO_SEARCH: {
    allowedActions: ['confirm_details', 'ask_search_permission', 'execute_search', 'show_results'],
    forbiddenActions: ['initiate_booking', 'collect_payment', 'auto_book'],
    maxQuestions: 1,
    canShowPrices: true,
    requiresConsent: ['search'],
    nextStages: ['READY_TO_BOOK', 'NARROWING'],
  },
  READY_TO_BOOK: {
    allowedActions: ['show_summary', 'collect_passenger_details', 'ask_booking_permission', 'process_booking'],
    forbiddenActions: ['auto_execute_payment', 'skip_confirmation'],
    maxQuestions: 1,
    canShowPrices: true,
    requiresConsent: ['booking'],
    nextStages: ['POST_BOOKING'],
  },
  POST_BOOKING: {
    allowedActions: ['show_confirmation', 'handle_changes', 'provide_support', 'offer_addons'],
    forbiddenActions: ['pressure_upsell'],
    maxQuestions: 2,
    canShowPrices: true,
    requiresConsent: [],
    nextStages: [],
  },
};

// ============================================================================
// STAGE STORE (Production: Redis/DB)
// ============================================================================

const stageStore = new Map<string, StageContext>();

export function getStageContext(sessionId: string): StageContext | null {
  return stageStore.get(sessionId) || null;
}

export function initStageContext(sessionId: string): StageContext {
  const context: StageContext = {
    sessionId,
    currentStage: 'DISCOVERY',
    previousStage: null,
    stageHistory: [],
    collectedData: {},
    stageStartTime: Date.now(),
    userConsents: {
      searchPermission: false,
      bookingPermission: false,
    },
  };
  stageStore.set(sessionId, context);
  return context;
}

export function getOrCreateStageContext(sessionId: string): StageContext {
  return getStageContext(sessionId) || initStageContext(sessionId);
}

// ============================================================================
// STAGE DETECTION
// ============================================================================

const DATE_PATTERNS = /\b(\d{1,2}[\/\-]\d{1,2}|\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|next week|next month|próxima semana|próximo mês)\b/i;
const ORIGIN_PATTERNS = /\b(from|de |saindo de|departing)\s+([A-Z][a-z]+|[A-Z]{3})\b/i;
const DESTINATION_PATTERNS = /\b(to|para|em|a )\s*(paris|london|rome|roma|tokyo|barcelona|new york|los angeles|miami|cancun|orlando|lisbon|lisboa|amsterdam|bali|bangkok|dubai|singapore|europe|europa|asia)\b/i;
const PASSENGER_PATTERNS = /\b(\d+)\s*(adult|passenger|person|people|traveler|adulto|passageiro|pessoa|viajante|adults|pessoas)s?\b/i;
const SEARCH_CONSENT = /\b(yes|sim|sí|ok|sure|pode|buscar|search|find|go ahead|pode buscar|claro|vamos)\b/i;
const BOOKING_CONSENT = /\b(book|reservar|confirmar|proceed|continue|finalizar|i want to book|quero reservar)\b/i;

/**
 * Extract collected data from message
 */
export function extractDataFromMessage(message: string, existing: CollectedData): CollectedData {
  const updated = { ...existing };

  // Extract origin
  const originMatch = message.match(ORIGIN_PATTERNS);
  if (originMatch) updated.origin = originMatch[2];

  // Extract destination
  const destMatch = message.match(DESTINATION_PATTERNS);
  if (destMatch) updated.destination = destMatch[2];

  // Extract dates
  if (DATE_PATTERNS.test(message)) {
    updated.dates = message.match(DATE_PATTERNS)?.[0];
  }

  // Extract passengers
  const passMatch = message.match(PASSENGER_PATTERNS);
  if (passMatch) updated.passengers = parseInt(passMatch[1]);

  // Detect travel type
  if (/\b(kids?|children|family|família|crianças|niños)\b/i.test(message)) {
    updated.travelType = 'family';
  } else if (/\b(business|trabalho|negócios|work)\b/i.test(message)) {
    updated.travelType = 'business';
  }

  // Detect budget style
  if (/\b(cheap|budget|barato|económico|low cost)\b/i.test(message)) {
    updated.budgetStyle = 'budget';
  } else if (/\b(luxury|premium|first class|business class|luxo)\b/i.test(message)) {
    updated.budgetStyle = 'premium';
  }

  return updated;
}

/**
 * Determine next stage based on collected data and current context
 */
export function determineNextStage(
  currentStage: ConversationStage,
  message: string,
  collectedData: CollectedData,
  consents: UserConsents
): ConversationStage {
  // POST_BOOKING is terminal
  if (currentStage === 'POST_BOOKING') return 'POST_BOOKING';

  // Check for booking consent → READY_TO_BOOK
  if (currentStage === 'READY_TO_SEARCH' && consents.bookingPermission) {
    return 'READY_TO_BOOK';
  }

  // READY_TO_BOOK transitions
  if (currentStage === 'READY_TO_BOOK') {
    if (/\b(confirmed|booked|success|reservado|confirmado)\b/i.test(message)) {
      return 'POST_BOOKING';
    }
    return 'READY_TO_BOOK';
  }

  // Check if ready to search (has core data + consent)
  const hasOrigin = !!collectedData.origin;
  const hasDestination = !!collectedData.destination;
  const hasDates = !!collectedData.dates;

  if (hasDates && (hasDestination || hasOrigin)) {
    if (consents.searchPermission) {
      return 'READY_TO_SEARCH';
    }
    // Has data but no consent - stay in position to ask
    if (currentStage === 'NARROWING') {
      return 'READY_TO_SEARCH'; // Will ask for consent
    }
  }

  // Check for narrowing signals
  if (hasDestination || hasOrigin || hasDates ||
      collectedData.travelType || collectedData.budgetStyle) {
    if (currentStage === 'DISCOVERY') {
      return 'NARROWING';
    }
  }

  return currentStage;
}

// ============================================================================
// STAGE TRANSITIONS
// ============================================================================

export interface TransitionResult {
  allowed: boolean;
  newStage: ConversationStage;
  reason: string;
  consentRequired?: 'search' | 'booking';
}

/**
 * Attempt stage transition with validation
 */
export function attemptTransition(
  sessionId: string,
  message: string,
  chaosClass: ChaosClassification
): TransitionResult {
  const context = getOrCreateStageContext(sessionId);
  const rules = STAGE_RULES[context.currentStage];

  // Update collected data
  context.collectedData = extractDataFromMessage(message, context.collectedData);

  // Check for consent grants
  if (SEARCH_CONSENT.test(message) && !context.userConsents.searchPermission) {
    context.userConsents.searchPermission = true;
    context.userConsents.searchPermissionTime = Date.now();
  }
  if (BOOKING_CONSENT.test(message) && !context.userConsents.bookingPermission) {
    context.userConsents.bookingPermission = true;
    context.userConsents.bookingPermissionTime = Date.now();
  }

  // Determine target stage
  const targetStage = determineNextStage(
    context.currentStage,
    message,
    context.collectedData,
    context.userConsents
  );

  // Validate transition
  if (targetStage !== context.currentStage) {
    // Check if transition is allowed
    if (!rules.nextStages.includes(targetStage)) {
      // User trying to skip stages
      return {
        allowed: false,
        newStage: context.currentStage,
        reason: `Cannot skip from ${context.currentStage} to ${targetStage}. Must follow stage order.`,
      };
    }

    // Check consent requirements
    const targetRules = STAGE_RULES[targetStage];
    if (targetRules.requiresConsent.includes('search') && !context.userConsents.searchPermission) {
      return {
        allowed: false,
        newStage: context.currentStage,
        reason: 'Search permission required before proceeding.',
        consentRequired: 'search',
      };
    }
    if (targetRules.requiresConsent.includes('booking') && !context.userConsents.bookingPermission) {
      return {
        allowed: false,
        newStage: context.currentStage,
        reason: 'Booking permission required before proceeding.',
        consentRequired: 'booking',
      };
    }

    // Execute transition
    const transition: StageTransition = {
      from: context.currentStage,
      to: targetStage,
      timestamp: Date.now(),
      trigger: message.substring(0, 50),
    };
    context.stageHistory.push(transition);
    context.previousStage = context.currentStage;
    context.currentStage = targetStage;
    context.stageStartTime = Date.now();

    stageStore.set(sessionId, context);

    return {
      allowed: true,
      newStage: targetStage,
      reason: `Transitioned from ${context.previousStage} to ${targetStage}`,
    };
  }

  return {
    allowed: true,
    newStage: context.currentStage,
    reason: 'Staying in current stage',
  };
}

/**
 * Check if action is allowed in current stage
 */
export function isActionAllowed(sessionId: string, action: string): boolean {
  const context = getStageContext(sessionId);
  if (!context) return false;

  const rules = STAGE_RULES[context.currentStage];
  return rules.allowedActions.includes(action) && !rules.forbiddenActions.includes(action);
}

/**
 * Check if action is forbidden in current stage
 */
export function isActionForbidden(sessionId: string, action: string): boolean {
  const context = getStageContext(sessionId);
  if (!context) return true;

  const rules = STAGE_RULES[context.currentStage];
  return rules.forbiddenActions.includes(action);
}

/**
 * Get stage guidance for agents
 */
export function getStageGuidance(sessionId: string, language: string): string {
  const context = getStageContext(sessionId);
  if (!context) return '';

  const stage = context.currentStage;
  const rules = STAGE_RULES[stage];

  const guidance: Record<ConversationStage, Record<string, string>> = {
    DISCOVERY: {
      en: `[DISCOVERY] Inspire and explore. Ask max ${rules.maxQuestions} questions. NO search, NO prices. Normalize indecision.`,
      pt: `[DESCOBERTA] Inspire e explore. Máx ${rules.maxQuestions} perguntas. SEM busca, SEM preços. Normalize a indecisão.`,
      es: `[DESCUBRIMIENTO] Inspira y explora. Máx ${rules.maxQuestions} preguntas. SIN búsqueda, SIN precios. Normaliza la indecisión.`,
    },
    NARROWING: {
      en: `[NARROWING] Suggest destinations, seasons, tips. Ask for dates/travelers. Still NO prices. Prepare mentally for search.`,
      pt: `[REFINANDO] Sugira destinos, épocas, dicas. Pergunte datas/viajantes. Ainda SEM preços. Prepare mentalmente para busca.`,
      es: `[REFINANDO] Sugiere destinos, temporadas, consejos. Pregunta fechas/viajeros. Aún SIN precios. Prepara mentalmente para búsqueda.`,
    },
    READY_TO_SEARCH: {
      en: `[READY TO SEARCH] Confirm details. Ask: "Can I search the best options now?" Execute only after consent.`,
      pt: `[PRONTO PARA BUSCAR] Confirme detalhes. Pergunte: "Posso buscar as melhores opções agora?" Execute só após consentimento.`,
      es: `[LISTO PARA BUSCAR] Confirma detalles. Pregunta: "¿Puedo buscar las mejores opciones ahora?" Ejecuta solo tras consentimiento.`,
    },
    READY_TO_BOOK: {
      en: `[READY TO BOOK] ONLY proceed with explicit consent. Show summary. NEVER auto-execute payment.`,
      pt: `[PRONTO PARA RESERVAR] SÓ prossiga com consentimento explícito. Mostre resumo. NUNCA auto-execute pagamento.`,
      es: `[LISTO PARA RESERVAR] SOLO procede con consentimiento explícito. Muestra resumen. NUNCA auto-ejecutes pago.`,
    },
    POST_BOOKING: {
      en: `[POST BOOKING] Handle status, changes, support. Gentle add-ons only.`,
      pt: `[PÓS-RESERVA] Status, alterações, suporte. Apenas extras gentis.`,
      es: `[POST-RESERVA] Estado, cambios, soporte. Solo extras gentiles.`,
    },
  };

  return guidance[stage][language] || guidance[stage].en;
}

/**
 * Get consent prompt for stage
 */
export function getConsentPrompt(stage: ConversationStage, language: string): string | null {
  const prompts: Record<string, Record<string, string>> = {
    search: {
      en: 'Can I search the best options for you now?',
      pt: 'Posso buscar as melhores opções para você agora?',
      es: '¿Puedo buscar las mejores opciones para ti ahora?',
    },
    booking: {
      en: 'Would you like to proceed with the booking?',
      pt: 'Gostaria de prosseguir com a reserva?',
      es: '¿Te gustaría proceder con la reserva?',
    },
  };

  if (stage === 'READY_TO_SEARCH') return prompts.search[language] || prompts.search.en;
  if (stage === 'READY_TO_BOOK') return prompts.booking[language] || prompts.booking.en;
  return null;
}

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

/**
 * Grant search consent for session
 */
export function grantSearchConsent(sessionId: string): void {
  const context = getOrCreateStageContext(sessionId);
  context.userConsents.searchPermission = true;
  context.userConsents.searchPermissionTime = Date.now();
  stageStore.set(sessionId, context);
}

/**
 * Grant booking consent for session
 */
export function grantBookingConsent(sessionId: string): void {
  const context = getOrCreateStageContext(sessionId);
  context.userConsents.bookingPermission = true;
  context.userConsents.bookingPermissionTime = Date.now();
  stageStore.set(sessionId, context);
}

/**
 * Process stage transition (wrapper for attemptTransition with default chaos)
 */
export function processStageTransition(
  sessionId: string,
  message: string,
  chaosClass: ChaosClassification = 'CLEAR_INTENT'
): TransitionResult {
  return attemptTransition(sessionId, message, chaosClass);
}

/**
 * Reset stage context (for testing)
 */
export function resetStageContext(sessionId: string): void {
  stageStore.delete(sessionId);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { stageStore };
