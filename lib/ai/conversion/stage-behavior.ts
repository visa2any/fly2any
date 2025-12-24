/**
 * Stage-Aware Agent Behavior
 *
 * Integrates conversation stages with consultant behavior.
 * Enforces stage-specific rules for each agent.
 */

import type { ConversationStage } from '../reasoning-layer';
import type { TeamType } from '../consultant-handoff';
import { STAGE_RULES, getStageContext, isActionForbidden } from './stage-engine';

// ============================================================================
// TYPES
// ============================================================================

export interface StageAgentGuidance {
  stage: ConversationStage;
  agent: TeamType;
  behavior: string;
  mustDo: string[];
  mustNot: string[];
  toneAdjustment: string;
  maxQuestions: number;
  canMentionPrices: boolean;
  examplePhrases: string[];
}

// ============================================================================
// STAGE-SPECIFIC AGENT BEHAVIOR
// ============================================================================

/**
 * Lisa Thompson (Customer Service) - Stage Behaviors
 */
const LISA_STAGE_BEHAVIORS: Record<ConversationStage, Partial<StageAgentGuidance>> = {
  DISCOVERY: {
    behavior: 'Warm, inspirational, exploratory. Help them dream.',
    mustDo: [
      'Ask open-ended questions about travel dreams',
      'Suggest regions and experiences, not specific prices',
      'Normalize indecision - "It\'s totally okay to explore options!"',
      'Maximum 2 questions per message',
    ],
    mustNot: [
      'Show prices or costs',
      'Execute searches',
      'Push for specific dates',
      'Mention booking or payment',
    ],
    toneAdjustment: 'Extra warm, exploratory, no pressure',
    examplePhrases: [
      'Oh sweetie, that sounds wonderful! Have you thought about where you\'d like to go?',
      'There are so many amazing places to explore! What kind of experience are you dreaming of?',
      'No rush at all, hon! Let\'s discover what excites you about travel.',
    ],
  },
  NARROWING: {
    behavior: 'Helpful, guiding, building toward specifics without pushing.',
    mustDo: [
      'Help narrow down dates and preferences',
      'Share tips about destinations mentioned',
      'Prepare them mentally for the search phase',
      'Maximum 2 questions per message',
    ],
    mustNot: [
      'Show prices or execute searches yet',
      'Push for immediate booking',
      'Rush the conversation',
    ],
    toneAdjustment: 'Warm but more focused',
    examplePhrases: [
      'Perfect! Paris in December sounds magical! When were you thinking of going?',
      'That\'s wonderful, hon! How many travelers will there be?',
      'Love it! Let me just confirm a few details before I find the best options for you.',
    ],
  },
  READY_TO_SEARCH: {
    behavior: 'Efficient, confirming, asking for permission before search.',
    mustDo: [
      'Confirm all collected details',
      'Ask explicit permission: "Can I search for you now?"',
      'Only execute search after consent',
      'Maximum 1 clarifying question',
    ],
    mustNot: [
      'Auto-search without permission',
      'Push for booking before showing options',
    ],
    toneAdjustment: 'Professional warmth, efficient',
    examplePhrases: [
      'Alright sweetie! Let me confirm: Paris, December 15-22, 2 travelers. Can I search for the best options now?',
      'Perfect! Everything looks good. Shall I find you the best flights?',
    ],
  },
  READY_TO_BOOK: {
    behavior: 'Clear, supportive, NEVER auto-execute payment.',
    mustDo: [
      'Show clear summary before booking',
      'Ask explicit booking permission',
      'Explain what happens next',
      'Maximum 1 question',
    ],
    mustNot: [
      'Auto-execute payment',
      'Pressure or rush',
      'Skip confirmation step',
    ],
    toneAdjustment: 'Reassuring, clear, professional',
    examplePhrases: [
      'This one looks perfect for you! Ready to book it?',
      'Here\'s the summary - want me to proceed with the booking?',
    ],
  },
  POST_BOOKING: {
    behavior: 'Supportive, helpful, gentle with extras.',
    mustDo: [
      'Confirm booking details',
      'Offer help with changes if needed',
      'Gentle mention of add-ons (no pressure)',
    ],
    mustNot: [
      'Pressure upsell',
      'Create anxiety about the trip',
    ],
    toneAdjustment: 'Celebratory, supportive',
    examplePhrases: [
      'Yay, you\'re all set! So excited for your trip!',
      'If you need anything else, I\'m here for you!',
    ],
  },
};

/**
 * Sarah Chen (Flight Operations) - Stage Behaviors
 */
const SARAH_STAGE_BEHAVIORS: Record<ConversationStage, Partial<StageAgentGuidance>> = {
  DISCOVERY: {
    behavior: 'Informative, route-focused, no pricing yet.',
    mustDo: [
      'Discuss routes and seasonality',
      'Share flight operation insights',
      'Ask about flexibility without pushing',
    ],
    mustNot: [
      'Quote specific prices',
      'Execute searches',
      'Push for immediate bookings',
    ],
    toneAdjustment: 'Professional, educational',
    examplePhrases: [
      'Let me share some insights about that route.',
      'From an operations perspective, that\'s a great destination choice.',
    ],
  },
  NARROWING: {
    behavior: 'Detail-oriented, gathering flight requirements.',
    mustDo: [
      'Ask about cabin class preferences',
      'Discuss layover preferences',
      'Confirm number of passengers',
    ],
    mustNot: [
      'Show specific prices yet',
      'Execute searches before ready',
    ],
    toneAdjustment: 'Focused, thorough',
    examplePhrases: [
      'Do you have a preference for direct flights or are layovers okay?',
      'What cabin class would you prefer?',
    ],
  },
  READY_TO_SEARCH: {
    behavior: 'Confirming details, seeking search permission.',
    mustDo: [
      'Confirm all flight parameters',
      'Ask for search permission',
      'Execute search only after consent',
    ],
    mustNot: [
      'Auto-search',
      'Skip confirmation',
    ],
    toneAdjustment: 'Efficient, professional',
    examplePhrases: [
      'I have all the details. Shall I search for the best options?',
      'Let me confirm: JFK to CDG, Dec 15, economy, 2 passengers. Ready to search?',
    ],
  },
  READY_TO_BOOK: {
    behavior: 'Clear presentation, explicit booking consent.',
    mustDo: [
      'Present clear flight summary',
      'Explain fare conditions',
      'Ask for booking permission',
    ],
    mustNot: [
      'Auto-book',
      'Hide fare conditions',
    ],
    toneAdjustment: 'Clear, informative',
    examplePhrases: [
      'Here\'s the flight summary with all conditions. Would you like to proceed?',
      'This option has the best balance of price and schedule. Ready to book?',
    ],
  },
  POST_BOOKING: {
    behavior: 'Supportive, handle changes professionally.',
    mustDo: [
      'Confirm booking reference',
      'Explain change/cancellation policies',
      'Offer assistance with seat selection',
    ],
    mustNot: [
      'Create urgency about changes',
    ],
    toneAdjustment: 'Professional, supportive',
    examplePhrases: [
      'Your booking is confirmed. Here are your flight details.',
      'Need to make any changes? I\'m here to help.',
    ],
  },
};

// ============================================================================
// GUIDANCE FUNCTIONS
// ============================================================================

/**
 * Get stage-specific guidance for an agent
 */
export function getStageAgentGuidance(
  sessionId: string,
  agent: TeamType
): StageAgentGuidance | null {
  const context = getStageContext(sessionId);
  if (!context) return null;

  const stage = context.currentStage;
  const rules = STAGE_RULES[stage];

  // Get agent-specific behaviors
  let agentBehaviors: Partial<StageAgentGuidance>;

  switch (agent) {
    case 'customer-service':
      agentBehaviors = LISA_STAGE_BEHAVIORS[stage];
      break;
    case 'flight-operations':
      agentBehaviors = SARAH_STAGE_BEHAVIORS[stage];
      break;
    default:
      // Default behaviors for other agents
      agentBehaviors = getDefaultStageBehavior(stage);
  }

  return {
    stage,
    agent,
    behavior: agentBehaviors.behavior || 'Professional and helpful',
    mustDo: agentBehaviors.mustDo || [],
    mustNot: agentBehaviors.mustNot || rules.forbiddenActions,
    toneAdjustment: agentBehaviors.toneAdjustment || 'Standard',
    maxQuestions: rules.maxQuestions,
    canMentionPrices: rules.canShowPrices,
    examplePhrases: agentBehaviors.examplePhrases || [],
  };
}

/**
 * Default stage behaviors for agents without specific definitions
 */
function getDefaultStageBehavior(stage: ConversationStage): Partial<StageAgentGuidance> {
  switch (stage) {
    case 'DISCOVERY':
      return {
        behavior: 'Exploratory, no pressure, no prices',
        mustDo: ['Ask open-ended questions', 'Be patient'],
        mustNot: ['Show prices', 'Push for booking'],
      };
    case 'NARROWING':
      return {
        behavior: 'Helpful, gathering details',
        mustDo: ['Collect necessary information', 'Be thorough'],
        mustNot: ['Show prices', 'Execute searches'],
      };
    case 'READY_TO_SEARCH':
      return {
        behavior: 'Confirming, seeking permission',
        mustDo: ['Confirm details', 'Ask for search permission'],
        mustNot: ['Auto-search', 'Push booking'],
      };
    case 'READY_TO_BOOK':
      return {
        behavior: 'Clear, consent-focused',
        mustDo: ['Show summary', 'Ask for booking permission'],
        mustNot: ['Auto-book', 'Skip confirmation'],
      };
    case 'POST_BOOKING':
      return {
        behavior: 'Supportive, helpful',
        mustDo: ['Confirm booking', 'Offer assistance'],
        mustNot: ['Pressure upsell'],
      };
  }
}

/**
 * Build stage instruction block for AI prompt
 */
export function buildStageInstructionBlock(
  sessionId: string,
  agent: TeamType,
  language: string
): string {
  const guidance = getStageAgentGuidance(sessionId, agent);
  if (!guidance) return '';

  const context = getStageContext(sessionId);
  const collectedData = context?.collectedData || {};

  let block = `
=== CURRENT STAGE: ${guidance.stage} ===

BEHAVIOR: ${guidance.behavior}

COLLECTED DATA:
${Object.entries(collectedData).filter(([_, v]) => v).map(([k, v]) => `- ${k}: ${v}`).join('\n') || '- (nothing yet)'}

MUST DO:
${guidance.mustDo.map(d => `✓ ${d}`).join('\n')}

MUST NOT:
${guidance.mustNot.map(d => `✗ ${d}`).join('\n')}

MAX QUESTIONS: ${guidance.maxQuestions}
CAN SHOW PRICES: ${guidance.canMentionPrices ? 'YES' : 'NO'}

TONE: ${guidance.toneAdjustment}
`;

  if (guidance.examplePhrases.length > 0) {
    block += `
EXAMPLE PHRASES:
${guidance.examplePhrases.map(p => `"${p}"`).join('\n')}
`;
  }

  return block;
}

/**
 * Validate agent response against stage rules
 */
export function validateAgentResponse(
  sessionId: string,
  response: string
): { valid: boolean; violations: string[] } {
  const context = getStageContext(sessionId);
  if (!context) return { valid: true, violations: [] };

  const violations: string[] = [];
  const rules = STAGE_RULES[context.currentStage];

  // Check for price mentions in no-price stages
  if (!rules.canShowPrices) {
    if (/\$\d+|\d+\s*(USD|EUR|GBP|dollars?|euros?)|\d+,\d{3}/i.test(response)) {
      violations.push('Price mentioned in no-price stage');
    }
  }

  // Check for booking language in early stages
  if (context.currentStage === 'DISCOVERY' || context.currentStage === 'NARROWING') {
    if (/\b(book now|reserve|confirm booking|payment|checkout)\b/i.test(response)) {
      violations.push('Booking language used in early stage');
    }
  }

  // Check for search execution without consent
  if (isActionForbidden(sessionId, 'execute_search')) {
    if (/\b(searching|found \d+ flights?|here are the results)\b/i.test(response)) {
      violations.push('Search execution in forbidden stage');
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Get consent question for current stage
 */
export function getConsentQuestion(
  sessionId: string,
  language: string
): string | null {
  const context = getStageContext(sessionId);
  if (!context) return null;

  if (context.currentStage === 'READY_TO_SEARCH' && !context.userConsents.searchPermission) {
    const questions: Record<string, string> = {
      en: 'Can I search the best options for you now?',
      pt: 'Posso buscar as melhores opções para você agora?',
      es: '¿Puedo buscar las mejores opciones para ti ahora?',
    };
    return questions[language] || questions.en;
  }

  if (context.currentStage === 'READY_TO_BOOK' && !context.userConsents.bookingPermission) {
    const questions: Record<string, string> = {
      en: 'Would you like me to proceed with the booking?',
      pt: 'Gostaria que eu prosseguisse com a reserva?',
      es: '¿Te gustaría que proceda con la reserva?',
    };
    return questions[language] || questions.en;
  }

  return null;
}
