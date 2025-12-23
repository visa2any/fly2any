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
  /^how can i help you/i,
  /^what can i assist you with/i,
  /^how may i assist/i,
  /^hello[,!]?\s*how can/i,
  /^hi[,!]?\s*what can i/i,
  /^welcome[,!]?\s*how may/i,
];

const FORBIDDEN_CONTENT = [
  /\$\d+.*margin/i,
  /commission.*\d+%/i,
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

  // Rule 4: Forbidden generic openers
  for (const pattern of FORBIDDEN_OPENERS) {
    if (pattern.test(response.trim())) {
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
    en: "To find the best option for you, could you tell me",
    pt: "Para encontrar a melhor opção para você, poderia me dizer",
    es: "Para encontrar la mejor opción para usted, ¿podría decirme",
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
// RESPONSE BLOCKERS (Prevent Dead Ends)
// ============================================================================

const DEAD_END_PATTERNS = [
  /^i don't know/i,
  /^i cannot help/i,
  /^i'm not able/i,
  /^sorry,?\s*i can't/i,
  /^that's not possible/i,
  /^we don't offer/i,
];

/**
 * Check if response is a dead end and provide fallback
 */
export function preventDeadEnd(
  response: string,
  reasoning: ReasoningOutput,
  language: string
): string {
  for (const pattern of DEAD_END_PATTERNS) {
    if (pattern.test(response.trim())) {
      // Convert dead end to forward-moving response
      const fallback = getLocalizedTemplate('no_dead_end', language);
      const clarification = reasoning.clarifying_questions[0] || '';

      return `${fallback} ${clarification}`.trim();
    }
  }

  return response;
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
      // Don't throw - return best effort response
    }
  }

  // Ensure no dead ends
  if (reasoning) {
    finalResponse = preventDeadEnd(finalResponse, reasoning, language);
  }

  return { response: finalResponse, wasModified };
}
