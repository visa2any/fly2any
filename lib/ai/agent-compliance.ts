/**
 * Agent Compliance Layer
 *
 * CRITICAL: Enforces non-negotiable rules for specialist agents.
 * Ensures reasoning layer output is ALWAYS respected.
 */

import type { ReasoningOutput } from './reasoning-layer';

// ============================================================================
// FORBIDDEN PATTERNS (System Error if Used)
// ============================================================================

const FORBIDDEN_OPENERS = [
  /how can i help/i,
  /what can i assist/i,
  /how may i assist/i,
  /what can i help/i,
  /how can i assist/i,
];

const FORBIDDEN_CONTENT = [
  /\$\d+.*margin/i,
  /\d+%.*margin/i,
  /commission.*\d+%/i,
  /\d+%.*commission/i,
  /internal.*logic/i,
  /admin.*data/i,
  /backend.*system/i,
];

// ============================================================================
// COMPLIANCE VALIDATION
// ============================================================================

export interface ComplianceResult {
  compliant: boolean;
  violations: string[];
  corrections: string[];
}

/**
 * Validate agent response against compliance rules
 */
export function validateAgentResponse(
  response: string,
  reasoning: ReasoningOutput | undefined,
  responseLanguage: string
): ComplianceResult {
  const violations: string[] = [];
  const corrections: string[] = [];

  // Rule 1: Must follow reasoning layer if present
  if (reasoning && reasoning.confidence_level !== 'high') {
    // Check if response asks clarifying questions when required
    if (reasoning.clarifying_questions.length > 0) {
      const hasQuestion = /\?/.test(response);
      if (!hasQuestion) {
        violations.push('MISSING_CLARIFYING_QUESTION');
        corrections.push(`Include clarifying question: "${reasoning.clarifying_questions[0]}"`);
      }
    }
  }

  // Rule 2: Language lock enforcement
  if (reasoning?.recommended_primary_agent) {
    // Language validation would be done at response generation
  }

  // Rule 4: Forbidden generic openers (check entire response)
  for (const pattern of FORBIDDEN_OPENERS) {
    if (pattern.test(response)) {
      violations.push('GENERIC_OPENER_USED');
      corrections.push('Replace generic opener with context-aware greeting');
      break;
    }
  }

  // Rule 7: Forbidden content
  for (const pattern of FORBIDDEN_CONTENT) {
    if (pattern.test(response)) {
      violations.push('INTERNAL_DATA_EXPOSED');
      corrections.push('Remove internal/admin/margin data from response');
      break;
    }
  }

  // Check for invented prices (numbers without context)
  if (/\$\d{2,4}(?!\s*(USD|per|fee|charge))/i.test(response) && !reasoning) {
    violations.push('POTENTIAL_INVENTED_PRICE');
    corrections.push('Verify price comes from valid API source');
  }

  return {
    compliant: violations.length === 0,
    violations,
    corrections,
  };
}

// ============================================================================
// RESPONSE ENHANCEMENT
// ============================================================================

/**
 * Enhance response based on reasoning layer guidance
 */
export function enhanceResponseWithReasoning(
  baseResponse: string,
  reasoning: ReasoningOutput
): string {
  let enhanced = baseResponse;

  // Rule 6: Emotion-first responses
  if (reasoning.risk_flags.includes('HIGH_CHURN_RISK')) {
    if (!/sorry|understand|apologize/i.test(enhanced)) {
      enhanced = getEmpathyPrefix(reasoning.tone_guidance) + ' ' + enhanced;
    }
  }

  // Rule 3: Low/medium confidence = consultative tone
  if (reasoning.confidence_level !== 'high' && reasoning.clarifying_questions.length > 0) {
    const hasQuestion = /\?$/.test(enhanced.trim());
    if (!hasQuestion) {
      enhanced += '\n\n' + reasoning.clarifying_questions[0];
    }
  }

  // Rule 5: Missing context guidance
  if (reasoning.missing_context.length > 0 && reasoning.clarifying_questions.length > 0) {
    // Ensure we're guiding, not blocking
    if (/i cannot|i can't|unable to/i.test(enhanced)) {
      enhanced = enhanced.replace(
        /i cannot|i can't|unable to/gi,
        "To help you better, I'd like to know"
      );
    }
  }

  return enhanced;
}

/**
 * Get empathy prefix based on tone guidance
 */
function getEmpathyPrefix(toneGuidance: string): string {
  if (/frustrat/i.test(toneGuidance)) {
    return "I completely understand your frustration, and I'm here to help resolve this.";
  }
  if (/urgent/i.test(toneGuidance)) {
    return "I can see this is urgent - let me help you right away.";
  }
  if (/confus/i.test(toneGuidance)) {
    return "No worries, let me help clarify things for you.";
  }
  return "I understand, and I'm here to help.";
}

// ============================================================================
// LANGUAGE-LOCKED RESPONSES
// ============================================================================

const LANGUAGE_TEMPLATES: Record<string, Record<string, string>> = {
  empathy_frustration: {
    en: "I completely understand your frustration, and I'm here to help resolve this.",
    pt: "Entendo completamente sua frustração e estou aqui para ajudar a resolver isso.",
    es: "Entiendo completamente su frustración y estoy aquí para ayudar a resolverlo.",
  },
  empathy_urgency: {
    en: "I can see this is urgent - let me help you right away.",
    pt: "Vejo que isso é urgente - deixe-me ajudá-lo imediatamente.",
    es: "Veo que esto es urgente - permítame ayudarlo de inmediato.",
  },
  no_dead_end: {
    en: "Let me help you explore some options.",
    pt: "Deixe-me ajudá-lo a explorar algumas opções.",
    es: "Permítame ayudarle a explorar algunas opciones.",
  },
  consultative: {
    en: "To find the best option for you, could you tell me more?",
    pt: "Para encontrar a melhor opção para você, poderia me dizer mais?",
    es: "Para encontrar la mejor opción para usted, ¿podría decirme más?",
  },
};

/**
 * Get language-locked template
 */
export function getLocalizedTemplate(
  key: keyof typeof LANGUAGE_TEMPLATES,
  language: string
): string {
  const templates = LANGUAGE_TEMPLATES[key];
  return templates[language] || templates.en;
}

// ============================================================================
// RESPONSE BLOCKERS (Prevent Dead Ends) - CHAOS RESILIENT
// ============================================================================

// Extended dead-end patterns (EN/PT/ES) - NEVER allowed
const DEAD_END_PATTERNS = [
  // English
  /i don'?t know/i,
  /i cannot help/i,
  /i'?m not able/i,
  /sorry,?\s*i can'?t/i,
  /that'?s not possible/i,
  /we don'?t offer/i,
  /unable to assist/i,
  /can'?t do that/i,
  /not supported/i,
  /impossible to/i,
  // Portuguese
  /não consigo/i,
  /não posso ajudar/i,
  /não é possível/i,
  /impossível/i,
  /desculpe,?\s*não/i,
  /infelizmente não/i,
  // Spanish
  /no puedo ayudar/i,
  /no es posible/i,
  /imposible/i,
  /lo siento,?\s*no/i,
  /lamentablemente no/i,
];

// Patterns that indicate prices in suggestions (FORBIDDEN)
const PRICE_IN_SUGGESTION = /\b(from|starting|as low as|apenas|desde|a partir de)\s*[\$€R\$]?\s*\d+/i;

/**
 * Check if response is a dead end and provide fallback
 * CHAOS-RESILIENT: Always guides forward
 */
export function preventDeadEnd(
  response: string,
  reasoning: ReasoningOutput,
  language: string
): string {
  // Check for any dead-end pattern
  for (const pattern of DEAD_END_PATTERNS) {
    if (pattern.test(response)) {
      // Convert dead end to forward-moving response
      return generateChaosRecoveryResponse(reasoning, language);
    }
  }

  // Check for price exposure in suggestions (chaos mode)
  if (reasoning.chaos_classification !== 'CLEAR_INTENT' && PRICE_IN_SUGGESTION.test(response)) {
    // Strip prices and regenerate
    return generateChaosRecoveryResponse(reasoning, language);
  }

  return response;
}

/**
 * Generate chaos-appropriate recovery response
 */
function generateChaosRecoveryResponse(reasoning: ReasoningOutput, language: string): string {
  const parts: string[] = [];

  // Opener based on chaos type
  const openers: Record<string, Record<string, string>> = {
    CHAOTIC_INTENT: {
      en: "Let's figure this out together!",
      pt: 'Vamos descobrir juntos!',
      es: '¡Vamos a descubrirlo juntos!',
    },
    LOW_INFORMATION: {
      en: "I'd love to help you explore options.",
      pt: 'Adoraria ajudá-lo a explorar opções.',
      es: 'Me encantaría ayudarte a explorar opciones.',
    },
    EXPLORATORY_TRAVEL: {
      en: "Great choice to explore possibilities!",
      pt: 'Ótima escolha explorar possibilidades!',
      es: '¡Excelente idea explorar posibilidades!',
    },
    FAMILY_TRAVEL: {
      en: "Traveling with family is wonderful!",
      pt: 'Viajar em família é maravilhoso!',
      es: '¡Viajar en familia es maravilloso!',
    },
    BUDGET_SENSITIVE: {
      en: "Let's find the best value for you.",
      pt: 'Vamos encontrar o melhor custo-benefício para você.',
      es: 'Vamos a encontrar la mejor relación calidad-precio para ti.',
    },
    CLEAR_INTENT: {
      en: "Let me help you with that.",
      pt: 'Deixe-me ajudá-lo com isso.',
      es: 'Déjame ayudarte con eso.',
    },
  };

  const chaosType = reasoning.chaos_classification || 'CLEAR_INTENT';
  parts.push(openers[chaosType]?.[language] || openers[chaosType]?.en || openers.CLEAR_INTENT.en);

  // Add destination suggestions if available (NO PRICES)
  if (reasoning.suggested_destinations?.length) {
    const suggestionIntro: Record<string, string> = {
      en: 'Some destinations to consider:',
      pt: 'Alguns destinos para considerar:',
      es: 'Algunos destinos para considerar:',
    };
    parts.push(`${suggestionIntro[language] || suggestionIntro.en} ${reasoning.suggested_destinations.slice(0, 3).join(', ')}.`);
  }

  // Add first clarifying question
  if (reasoning.clarifying_questions?.[0]) {
    parts.push(reasoning.clarifying_questions[0]);
  }

  return parts.join(' ');
}

// ============================================================================
// FINAL COMPLIANCE CHECK (Called Before Sending)
// ============================================================================

/**
 * Final check before response is sent to user
 * Returns corrected response or throws if uncorrectable
 */
export function finalComplianceCheck(
  response: string,
  reasoning: ReasoningOutput | undefined,
  language: string
): { response: string; wasModified: boolean } {
  let finalResponse = response;
  let wasModified = false;

  // Validate
  const validation = validateAgentResponse(response, reasoning, language);

  if (!validation.compliant) {
    console.warn('[Compliance] Violations detected:', validation.violations);

    // Auto-correct if reasoning available
    if (reasoning) {
      finalResponse = enhanceResponseWithReasoning(response, reasoning);
      finalResponse = preventDeadEnd(finalResponse, reasoning, language);
      wasModified = true;
    }

    // Re-validate after corrections
    const revalidation = validateAgentResponse(finalResponse, reasoning, language);
    if (!revalidation.compliant) {
      console.error('[Compliance] Could not auto-correct:', revalidation.violations);
      // HARD GUARD: Generate reasoning-compliant fallback
      if (reasoning) {
        finalResponse = generateReasoningCompliantResponse(reasoning, language);
        wasModified = true;
      }
    }
  }

  // Ensure no dead ends
  if (reasoning) {
    finalResponse = preventDeadEnd(finalResponse, reasoning, language);
  }

  return { response: finalResponse, wasModified };
}

/**
 * Generate a response that fully complies with reasoning output
 * Used as fallback when original response is non-compliant
 */
function generateReasoningCompliantResponse(
  reasoning: ReasoningOutput,
  language: string
): string {
  const parts: string[] = [];

  // Empathy first if needed
  if (reasoning.risk_flags.includes('HIGH_CHURN_RISK')) {
    parts.push(getLocalizedTemplate('empathy_frustration', language));
  }

  // Consultative opener based on intent
  if (reasoning.confidence_level !== 'high') {
    parts.push(getLocalizedTemplate('consultative', language));
  }

  // Add clarifying question
  if (reasoning.clarifying_questions.length > 0) {
    parts.push(reasoning.clarifying_questions[0]);
  } else if (reasoning.missing_context.length > 0) {
    // Generate question from missing context
    const context = reasoning.missing_context[0];
    const questions: Record<string, Record<string, string>> = {
      origin_city: { en: 'Where would you like to fly from?', pt: 'De onde você gostaria de voar?', es: '¿Desde dónde le gustaría volar?' },
      destination_city: { en: 'Where are you heading to?', pt: 'Para onde você vai?', es: '¿A dónde va?' },
      travel_dates: { en: 'When are you planning to travel?', pt: 'Quando você planeja viajar?', es: '¿Cuándo planea viajar?' },
    };
    const q = questions[context]?.[language] || questions[context]?.en;
    if (q) parts.push(q);
  }

  return parts.join(' ');
}
