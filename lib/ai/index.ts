/**
 * AI Conversation Enhancement System
 *
 * Main entry point for making AI responses more natural, conversational, and human-like
 */

// Core exports
export * from './consultant-profiles';
export * from './conversation-enhancer';
export * from './response-variations';
export * from './personality-traits';
export {
  makeNatural,
  addPersonalPronouns,
  simplifyJargon,
  // addEmpathy is exported from conversation-enhancer instead to avoid duplicate
} from './natural-language';

// NEW: Personality System Exports
// Note: consultant-personalities exports CONSULTANT_PERSONALITIES which conflicts with personality-traits
// Only export the types and functions, not the constant
export type { ConsultantPersonality } from './consultant-personalities';
export {
  getConsultantPersonality,
  consultantUsesEmojis,
  getExclamationFrequency,
  getSignatureWord,
  getCatchphrase,
  getTermOfEndearment,
  shouldUseTermOfEndearment,
} from './consultant-personalities';
export * from './dialogue-templates';
// Export specific items from response-generator to avoid ConversationContext conflict
export type { ConversationIntent } from './response-generator';
export {
  generateCompleteResponse as generateCompleteResponseV2,
  generateDialogueResponse,
  detectIntent,
  detectUserEmotion as detectUserEmotionV2,
  createConversationContext as createConversationContextV2,
  generatePersonalizedResponse,
} from './response-generator';
export * from './consultant-personality-examples';

import type { TeamType } from './consultant-profiles';
import { getConsultant } from './consultant-profiles';
import {
  enhanceConversation,
  getCurrentTimeOfDay,
  detectUserEmotion,
  addEmpathy,
  type ConversationContext,
  type EmotionalState,
} from './conversation-enhancer';
import {
  getVariation,
  getConsultantPhrase,
  makeListConversational,
  RESPONSE_VARIATIONS,
} from './response-variations';
import {
  getPersonalityTraits,
  applyPersonality,
} from './personality-traits';
import {
  makeNatural,
  addPersonalPronouns,
  simplifyJargon,
} from './natural-language';

/**
 * Main interface for processing AI responses
 */
export interface ResponseProcessorOptions {
  consultantTeam: TeamType;
  userName?: string;
  userMessage?: string;
  isFirstMessage?: boolean;
  previousTopic?: string;
  conversationLength?: number;
  targetAudience?: 'beginner' | 'intermediate' | 'expert';
}

/**
 * Process and enhance an AI response to be more natural and conversational
 *
 * This is the main function you should use to transform AI responses
 *
 * @example
 * ```typescript
 * const enhanced = processAIResponse(
 *   "I will search for flights from New York to Dubai.",
 *   {
 *     consultantTeam: 'flight-operations',
 *     userName: 'John',
 *     userMessage: 'Find me flights to Dubai',
 *     isFirstMessage: true,
 *   }
 * );
 * // Result: "Good morning, John! I'll find some great flight options from New York to Dubai for you!"
 * ```
 */
export function processAIResponse(
  response: string,
  options: ResponseProcessorOptions
): string {
  const {
    consultantTeam,
    userName,
    userMessage,
    isFirstMessage = false,
    previousTopic,
    conversationLength = 1,
    targetAudience = 'intermediate',
  } = options;

  // Step 1: Detect user emotion if we have their message
  const userEmotion: EmotionalState = userMessage
    ? detectUserEmotion(userMessage)
    : 'neutral';

  // Step 2: Get current time of day
  const timeOfDay = getCurrentTimeOfDay();

  // Step 3: Build conversation context
  const context: ConversationContext = {
    isFirstMessage,
    previousTopic,
    userEmotion,
    timeOfDay,
    consultantTeam,
    userName,
    conversationLength,
  };

  // Step 4: Apply natural language transformations
  let enhanced = makeNatural(response, {
    useContractions: true,
    addFillers: false, // Keep it professional
    varyStructure: true,
    conversationalTone: true,
  });

  // Step 5: Add personal pronouns
  enhanced = addPersonalPronouns(enhanced);

  // Step 6: Simplify jargon based on audience
  enhanced = simplifyJargon(enhanced, targetAudience);

  // Step 7: Apply consultant personality
  enhanced = applyPersonality(enhanced, consultantTeam);

  // Step 8: Enhance with conversation markers and greetings
  enhanced = enhanceConversation(enhanced, context);

  // Step 9: Add empathy if needed
  if (userEmotion !== 'neutral' && userEmotion !== 'satisfied') {
    enhanced = addEmpathy(enhanced, userEmotion);
  }

  return enhanced;
}

/**
 * Generate a consultant greeting
 *
 * @example
 * ```typescript
 * const greeting = generateGreeting('flight-operations', 'en', 'John');
 * // "Good morning, John! I'm Sarah, your Flight Operations Specialist..."
 * ```
 */
export function generateGreeting(
  consultantTeam: TeamType,
  language: 'en' | 'pt' | 'es' = 'en',
  userName?: string
): string {
  const consultant = getConsultant(consultantTeam);
  let greeting = consultant.greeting[language];

  // Personalize with user name
  if (userName) {
    const timeOfDay = getCurrentTimeOfDay();
    const timeGreeting = {
      morning: `Good morning, ${userName}! `,
      afternoon: `Good afternoon, ${userName}! `,
      evening: `Good evening, ${userName}! `,
      night: `Hello, ${userName}! `,
    }[timeOfDay];

    greeting = timeGreeting + greeting;
  }

  return greeting;
}

/**
 * Generate a natural search message
 *
 * @example
 * ```typescript
 * const msg = generateSearchMessage('flight-operations', 'New York', 'Dubai');
 * // "Let me find the best flights from New York to Dubai for you!"
 * ```
 */
export function generateSearchMessage(
  consultantTeam: TeamType,
  origin: string,
  destination: string
): string {
  const templates = [
    `Let me find the best options from ${origin} to ${destination} for you!`,
    `I'll search for great choices from ${origin} to ${destination}!`,
    `Looking for the perfect options from ${origin} to ${destination}...`,
    `I'm on it! Searching ${origin} to ${destination} now...`,
  ];

  // Get consultant-specific phrase
  const consultantPhrase = getConsultantPhrase(consultantTeam, 'searching');

  // 50% chance to use template or consultant phrase
  if (Math.random() < 0.5) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  return `${consultantPhrase} from ${origin} to ${destination}...`;
}

/**
 * Generate a results presentation message
 *
 * @example
 * ```typescript
 * const msg = generateResultsMessage('flight-operations', 15);
 * // "Great! I found 15 excellent flight options for you!"
 * ```
 */
export function generateResultsMessage(
  consultantTeam: TeamType,
  resultCount: number
): string {
  const enthusiasm = resultCount > 10 ? 'high' : resultCount > 5 ? 'medium' : 'low';

  const templates = {
    high: [
      `Wonderful! I found ${resultCount} excellent options for you!`,
      `Great news! There are ${resultCount} fantastic choices!`,
      `Perfect! I discovered ${resultCount} great options!`,
    ],
    medium: [
      `I found ${resultCount} good options for you!`,
      `Here are ${resultCount} solid choices!`,
      `I've got ${resultCount} options for you!`,
    ],
    low: [
      `I found ${resultCount} options for you.`,
      `Here are ${resultCount} choices.`,
      `I've got ${resultCount} available options.`,
    ],
  };

  const options = templates[enthusiasm];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate a closing message
 *
 * @example
 * ```typescript
 * const msg = generateClosingMessage('customer-service');
 * // "Is there anything else I can help you with today?"
 * ```
 */
export function generateClosingMessage(consultantTeam: TeamType): string {
  const personality = getPersonalityTraits(consultantTeam);

  if (personality.warmthLevel === 'very-warm') {
    const warmClosings = [
      "Is there anything else I can help you with today?",
      "What else can I do to help you?",
      "I'm here if you need anything else!",
      "Happy to help with anything else you need!",
    ];
    return warmClosings[Math.floor(Math.random() * warmClosings.length)];
  }

  if (personality.formalityLevel === 'formal') {
    return "May I assist you with anything else?";
  }

  return getVariation('closing');
}

/**
 * Create a natural list from items
 *
 * @example
 * ```typescript
 * const list = createNaturalList(['WiFi', 'breakfast', 'parking']);
 * // "WiFi, breakfast, and parking"
 * ```
 */
export function createNaturalList(items: string[]): string {
  return makeListConversational(items);
}

/**
 * Add a transition between topics
 *
 * @example
 * ```typescript
 * const msg = addTopicTransition("Let's look at hotels", 'flight-operations');
 * // "Great! Now, let's look at hotels"
 * ```
 */
export function addTopicTransition(
  nextTopic: string,
  consultantTeam: TeamType
): string {
  const personality = getPersonalityTraits(consultantTeam);

  const transitions = {
    calm: ['Now, ', 'Next, ', 'Also, '],
    moderate: ['Great! ', 'Perfect! ', 'Excellent! '],
    energetic: ['Wonderful! ', 'Fantastic! ', 'Awesome! '],
  };

  const options = transitions[personality.enthusaismLevel];
  const transition = options[Math.floor(Math.random() * options.length)];

  return transition + nextTopic;
}

/**
 * Express empathy for a user's situation
 *
 * @example
 * ```typescript
 * const msg = expressEmpathy('frustrated', 'I understand that must be frustrating.');
 * // "I can see why that would be frustrating. I understand that must be frustrating."
 * ```
 */
export function expressEmpathy(
  emotion: EmotionalState,
  followUp: string
): string {
  return addEmpathy(followUp, emotion);
}

/**
 * Validate user's question or concern
 *
 * @example
 * ```typescript
 * const msg = validateUserInput("Here's how it works");
 * // "That's a great question! Here's how it works"
 * ```
 */
export function validateUserInput(response: string): string {
  const validations = [
    "That's a great question! ",
    "Good question! ",
    "I'm glad you asked! ",
    "Smart question! ",
  ];

  const validation = validations[Math.floor(Math.random() * validations.length)];
  return validation + response;
}

/**
 * Quick utilities for common use cases
 */
export const QuickResponses = {
  /**
   * "Sure thing!" or similar affirmative
   */
  affirmative: () => getVariation('affirmative'),

  /**
   * "I understand" or similar acknowledgment
   */
  acknowledge: () => getVariation('understanding'),

  /**
   * "Let me find that for you..." or similar searching
   */
  searching: () => getVariation('searching'),

  /**
   * "Thank you!" or similar thanks
   */
  thanks: () => getVariation('thanking'),

  /**
   * "I apologize" or similar apology
   */
  apologize: () => getVariation('apologizing'),

  /**
   * "Great!" or similar positive
   */
  positive: () => getVariation('positive'),
};

/**
 * Helper to get all available consultants
 */
export { getAllConsultants, getConsultantById } from './consultant-profiles';
