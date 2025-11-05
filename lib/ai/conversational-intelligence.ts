/**
 * Conversational Intelligence System
 * Makes AI travel consultants respond naturally to all types of interactions
 */

import { ConversationContext, ConversationIntent, IntentType } from './conversation-context';
import { generateNaturalResponse } from './natural-responses';
import { getSmallTalkResponse } from './small-talk';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConversationAnalysis {
  intent: IntentType;
  confidence: number;
  isServiceRequest: boolean;
  requiresPersonalResponse: boolean;
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious';
  topics: string[];
}

/**
 * Analyze user message to determine conversation intent
 */
export function analyzeConversationIntent(
  userMessage: string,
  conversationHistory: Message[]
): ConversationAnalysis {
  const message = userMessage.toLowerCase().trim();

  // Remove punctuation for pattern matching
  const cleanMessage = message.replace(/[.,!?;:]/g, '').trim();

  // Greeting patterns
  const greetingPatterns = [
    /^(hi|hello|hey|hiya|howdy|greetings|good morning|good afternoon|good evening)$/,
    /^(hi|hello|hey) there$/,
    /^what's up$/,
    /^sup$/,
    /^yo$/
  ];

  // How are you patterns
  const howAreYouPatterns = [
    /how are you/,
    /how're you/,
    /how are you doing/,
    /how's it going/,
    /how are things/,
    /what's up with you/,
    /how have you been/,
    /you doing (ok|okay|well|good|alright)/
  ];

  // Small talk patterns
  const smallTalkPatterns = [
    /nice to meet you/,
    /pleased to meet you/,
    /good to (see|hear from|talk to) you/,
    /thanks for (asking|your help|being here)/,
    /i'm (good|great|fine|well|okay|alright)/,
    /i'm doing (good|great|fine|well|okay|alright)/,
    /not bad/,
    /pretty good/,
    /can't complain/,
    /same here/,
    /you too/
  ];

  // Personal question patterns
  const personalQuestionPatterns = [
    /what's your name/,
    /who are you/,
    /tell me about yourself/,
    /what do you do/,
    /are you (a )?real (person|human)/,
    /are you (a )?bot/,
    /are you (an )?ai/
  ];

  // Gratitude patterns
  const gratitudePatterns = [
    /^thanks?$/,
    /^thank you$/,
    /^ty$/,
    /^thx$/,
    /appreciate it/,
    /thanks (so|very) much/,
    /thank you (so|very) much/,
    /that's helpful/,
    /that helps/
  ];

  // Destination recommendation patterns (user asking for IDEAS)
  const destinationRecommendationPatterns = [
    /any (idea|ideas|suggestion|suggestions|recommendation)/,
    /where (should|can|could) (i|we) (go|travel|visit)/,
    /what('s| is) a good (destination|place|city|country)/,
    /recommend (a )?(destination|place|city|country)/,
    /suggest (a )?(destination|place|city|country)/,
    /give me (some )?(idea|ideas|suggestion|recommendations)/,
    /don't know where to go/,
    /help me (choose|decide|pick) (a )?(destination|place)/,
    /looking for (destination|place) (idea|recommendation)/,
    /best (place|destination|city|country) (to|for)/,
    /new year('s)?( eve)? (destination|trip|travel)/,
    /december (trip|travel|vacation|holiday)/,
    /where to (celebrate|spend)/
  ];

  // Service request patterns (flights, hotels, bookings)
  const servicePatterns = [
    /book (a )?(flight|hotel|room|trip|ticket)/,
    /find (a )?(flight|hotel|room|deal)/,
    /search for/,
    /looking for (a )?(flight|hotel)/,
    /need (a )?(flight|hotel|room)/,
    /want to (travel|fly|book|go to)/,
    /trip to/,
    /vacation/,
    /holiday/,
    /travel plans/,
    /(cheap|cheapest|best) (flights|hotels|deals)/,
    /how much (is|does|would)/,
    /price/,
    /cost/,
    /help me (find|book|with)/,
    /whole package/,
    /including (everything|all)/
  ];

  // Question patterns (general inquiry)
  const questionPatterns = [
    /^(what|where|when|why|how|who|which|can|could|would|should|do|does|is|are)/,
    /\?$/
  ];

  // Check patterns in order of priority
  if (greetingPatterns.some(pattern => pattern.test(cleanMessage))) {
    return {
      intent: 'greeting',
      confidence: 0.95,
      isServiceRequest: false,
      requiresPersonalResponse: true,
      sentiment: 'positive',
      topics: ['greeting']
    };
  }

  if (howAreYouPatterns.some(pattern => pattern.test(message))) {
    return {
      intent: 'how-are-you',
      confidence: 0.95,
      isServiceRequest: false,
      requiresPersonalResponse: true,
      sentiment: 'curious',
      topics: ['wellbeing', 'personal']
    };
  }

  if (personalQuestionPatterns.some(pattern => pattern.test(message))) {
    return {
      intent: 'personal-question',
      confidence: 0.9,
      isServiceRequest: false,
      requiresPersonalResponse: true,
      sentiment: 'curious',
      topics: ['identity', 'personal']
    };
  }

  if (gratitudePatterns.some(pattern => pattern.test(message))) {
    return {
      intent: 'gratitude',
      confidence: 0.95,
      isServiceRequest: false,
      requiresPersonalResponse: true,
      sentiment: 'positive',
      topics: ['gratitude']
    };
  }

  if (smallTalkPatterns.some(pattern => pattern.test(message))) {
    return {
      intent: 'small-talk',
      confidence: 0.85,
      isServiceRequest: false,
      requiresPersonalResponse: true,
      sentiment: 'positive',
      topics: ['casual', 'social']
    };
  }

  // Check for destination recommendation requests BEFORE general service patterns
  if (destinationRecommendationPatterns.some(pattern => pattern.test(message))) {
    return {
      intent: 'destination-recommendation',
      confidence: 0.95,
      isServiceRequest: true, // It IS a service - just needs recommendations first
      requiresPersonalResponse: true, // But needs personal touch
      sentiment: 'curious',
      topics: extractRecommendationTopics(message)
    };
  }

  if (servicePatterns.some(pattern => pattern.test(message))) {
    return {
      intent: 'service-request',
      confidence: 0.9,
      isServiceRequest: true,
      requiresPersonalResponse: false,
      sentiment: 'neutral',
      topics: extractServiceTopics(message)
    };
  }

  if (questionPatterns.some(pattern => pattern.test(message))) {
    return {
      intent: 'question',
      confidence: 0.7,
      isServiceRequest: message.length > 20, // Longer questions likely about services
      requiresPersonalResponse: message.length <= 20,
      sentiment: 'curious',
      topics: ['inquiry']
    };
  }

  // Default to casual conversation
  return {
    intent: 'casual',
    confidence: 0.6,
    isServiceRequest: false,
    requiresPersonalResponse: true,
    sentiment: 'neutral',
    topics: ['general']
  };
}

/**
 * Extract recommendation-related topics from message
 */
function extractRecommendationTopics(message: string): string[] {
  const topics: string[] = ['recommendation', 'destination'];

  // Detect travel style preferences
  if (/(beach|coast|ocean|sea|tropical)/i.test(message)) topics.push('beach');
  if (/(city|urban|metropolitan)/i.test(message)) topics.push('city');
  if (/(mountain|ski|snow|alps)/i.test(message)) topics.push('mountain');
  if (/(adventure|hiking|outdoor)/i.test(message)) topics.push('adventure');
  if (/(cultural|history|museum)/i.test(message)) topics.push('cultural');
  if (/(party|nightlife|club)/i.test(message)) topics.push('party');
  if (/(romantic|honeymoon|couple)/i.test(message)) topics.push('romantic');
  if (/(family|kids|children)/i.test(message)) topics.push('family');
  if (/(budget|cheap|affordable|reasonable)/i.test(message)) topics.push('budget');
  if (/(luxury|premium|high.end)/i.test(message)) topics.push('luxury');

  // Detect time/season preferences
  if (/(new year|nye|december|jan)/i.test(message)) topics.push('new-years');
  if (/(christmas|holiday)/i.test(message)) topics.push('christmas');
  if (/(summer|warm|hot)/i.test(message)) topics.push('summer');
  if (/(winter|cold|snow)/i.test(message)) topics.push('winter');

  // Detect package interest
  if (/(package|all.inclusive|everything|whole package)/i.test(message)) topics.push('package');

  return topics;
}

/**
 * Extract service-related topics from message
 */
function extractServiceTopics(message: string): string[] {
  const topics: string[] = [];

  if (/(flight|fly|airline|plane)/i.test(message)) topics.push('flights');
  if (/(hotel|room|accommodation|stay)/i.test(message)) topics.push('hotels');
  if (/(car|rental|drive)/i.test(message)) topics.push('cars');
  if (/(package|bundle|deal)/i.test(message)) topics.push('packages');
  if (/(trip|vacation|holiday|travel)/i.test(message)) topics.push('travel');
  if (/(book|booking|reservation)/i.test(message)) topics.push('booking');
  if (/(price|cost|cheap|expensive|budget)/i.test(message)) topics.push('pricing');

  return topics.length > 0 ? topics : ['general-service'];
}

/**
 * Get appropriate response based on intent and context
 */
export function getConversationalResponse(
  analysis: ConversationAnalysis,
  consultant: {
    name: string;
    personality: string;
    emoji: string;
  },
  context: ConversationContext
): string {
  // For personal/casual interactions, use natural responses
  if (analysis.requiresPersonalResponse) {
    const response = generateNaturalResponse(
      analysis.intent,
      consultant,
      context,
      analysis.sentiment
    );

    // Update context
    context.addInteraction(analysis.intent, response);

    return response;
  }

  // For service requests, still be personable but transition to business
  if (analysis.isServiceRequest) {
    const greeting = getPersonableServiceGreeting(consultant, context);
    const serviceResponse = getServiceResponse(analysis.topics, consultant);

    context.addInteraction(analysis.intent, greeting + ' ' + serviceResponse);

    return greeting + '\n\n' + serviceResponse;
  }

  // Default casual response
  const response = generateNaturalResponse(
    'casual',
    consultant,
    context,
    analysis.sentiment
  );

  context.addInteraction('casual', response);

  return response;
}

/**
 * Get personable service greeting based on consultant personality
 */
function getPersonableServiceGreeting(
  consultant: { name: string; personality: string; emoji: string },
  context: ConversationContext
): string {
  const { name } = consultant;

  // Don't repeat greetings if already greeted
  if (context.hasInteracted('greeting') || context.hasInteracted('service-request')) {
    return getDirectServiceTransition(consultant);
  }

  const greetings = [
    `Wonderful! I'd love to help you with that. ${consultant.emoji}`,
    `Great! Let me assist you with that right away.`,
    `Perfect! I can definitely help you with that.`,
    `Excellent! I'm here to make this easy for you.`,
    `Fantastic! Let's get you sorted.`
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Get direct service transition for returning conversation
 */
function getDirectServiceTransition(consultant: { name: string; personality: string }): string {
  const transitions = [
    `Of course!`,
    `Absolutely!`,
    `Sure thing!`,
    `I can help with that!`,
    `Let me help you with that!`
  ];

  return transitions[Math.floor(Math.random() * transitions.length)];
}

/**
 * Get service-specific response based on topics
 */
function getServiceResponse(topics: string[], consultant: { name: string; personality: string }): string {
  if (topics.includes('flights')) {
    return `I can help you find the perfect flight. Where would you like to go? I'll search for the best deals and options for you.`;
  }

  if (topics.includes('hotels')) {
    return `I can help you find great accommodation. What city are you looking to stay in? I'll find the best options within your budget.`;
  }

  if (topics.includes('cars')) {
    return `I can help you arrange a rental car. Where and when do you need it? I'll find competitive rates for you.`;
  }

  if (topics.includes('packages')) {
    return `I can help you create a complete travel package. Tell me your destination and I'll put together flights, hotels, and more!`;
  }

  if (topics.includes('pricing')) {
    return `I'd be happy to help you find the best prices! Tell me where you want to go and when, and I'll search for the most budget-friendly options.`;
  }

  // Generic service response
  return `I'm here to help with all your travel needs. What would you like to do today?\n\n` +
    `I can help you:\n` +
    `✈️ Book flights\n` +
    `🏨 Find hotels\n` +
    `🚗 Rent cars\n` +
    `🎫 Create travel packages`;
}

/**
 * Check if user message contains urgency signals
 */
export function detectUrgency(message: string): boolean {
  const urgencyPatterns = [
    /asap/i,
    /urgent/i,
    /emergency/i,
    /immediately/i,
    /right now/i,
    /today/i,
    /this (morning|afternoon|evening)/i,
    /need (it|to) (now|today|asap)/i
  ];

  return urgencyPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if message indicates frustration
 */
export function detectFrustration(message: string): boolean {
  const frustrationPatterns = [
    /frustrated/i,
    /annoyed/i,
    /angry/i,
    /terrible/i,
    /awful/i,
    /worst/i,
    /hate/i,
    /stupid/i,
    /useless/i,
    /not working/i,
    /doesn't work/i,
    /broken/i
  ];

  return frustrationPatterns.some(pattern => pattern.test(message));
}

export { ConversationContext } from './conversation-context';
export type { IntentType } from './conversation-context';
