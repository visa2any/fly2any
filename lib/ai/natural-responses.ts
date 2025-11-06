/**
 * Natural Response Generation
 * Generates human-like responses based on consultant personality and context
 */

import { ConversationContext, IntentType } from './conversation-context';

export interface ConsultantPersonality {
  name: string;
  personality: string;
  emoji: string;
  traits: {
    warmth: number; // 1-10
    formality: number; // 1-10
    enthusiasm: number; // 1-10
    verbosity: number; // 1-10
  };
}

// Define consultant personalities
export const CONSULTANTS: Record<string, ConsultantPersonality> = {
  lisa: {
    name: 'Lisa Thompson',
    personality: 'friendly',
    emoji: '😊',
    traits: {
      warmth: 10,
      formality: 3,
      enthusiasm: 9,
      verbosity: 7
    }
  },
  sarah: {
    name: 'Sarah Chen',
    personality: 'professional',
    emoji: '✨',
    traits: {
      warmth: 7,
      formality: 7,
      enthusiasm: 6,
      verbosity: 5
    }
  },
  marcus: {
    name: 'Marcus Rodriguez',
    personality: 'warm',
    emoji: '🌟',
    traits: {
      warmth: 9,
      formality: 4,
      enthusiasm: 8,
      verbosity: 6
    }
  },
  mike: {
    name: 'Captain Mike',
    personality: 'calm',
    emoji: '✈️',
    traits: {
      warmth: 6,
      formality: 8,
      enthusiasm: 5,
      verbosity: 4
    }
  }
};

/**
 * Generate natural response based on intent, consultant, and context
 */
export function generateNaturalResponse(
  intent: IntentType,
  consultant: { name: string; personality: string; emoji: string },
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious' = 'neutral'
): string {
  // Get consultant personality or use default
  const consultantKey = consultant.name.toLowerCase().split(' ')[0];
  const personality = CONSULTANTS[consultantKey] || CONSULTANTS.lisa;

  switch (intent) {
    case 'greeting':
      return generateGreetingResponse(personality, context, sentiment);
    case 'how-are-you':
      return generateHowAreYouResponse(personality, context);
    case 'small-talk':
      return generateSmallTalkResponse(personality, context, sentiment);
    case 'personal-question':
      return generatePersonalQuestionResponse(personality, context);
    case 'gratitude':
      return generateGratitudeResponse(personality, context);
    case 'destination-recommendation':
      return generateDestinationRecommendationResponse(personality, context, sentiment);
    case 'casual':
      return generateCasualResponse(personality, context, sentiment);
    case 'farewell':
      return generateFarewellResponse(personality, context);
    default:
      return generateDefaultResponse(personality, context);
  }
}

/**
 * Generate greeting response
 */
function generateGreetingResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious'
): string {
  // First time greeting
  if (context.isNewConversation()) {
    const responses = getGreetingResponses(personality);
    return selectUniqueResponse(responses, context);
  }

  // Returning greeting (if user says hi again)
  const returningGreetings = getReturningGreetings(personality);
  return selectUniqueResponse(returningGreetings, context);
}

/**
 * Get initial greeting responses
 */
function getGreetingResponses(personality: ConsultantPersonality): string[] {
  if (personality.traits.warmth >= 9) {
    // Very warm (Lisa, Marcus)
    return [
      `Hi there! ${personality.emoji} How are you doing today?`,
      `Hello! It's so lovely to hear from you! ${personality.emoji} How's your day going?`,
      `Hey! ${personality.emoji} How are you? Hope you're having a wonderful day!`,
      `Hi! ${personality.emoji} So glad you're here! How are you doing?`,
      `Hello there! ${personality.emoji} How's everything with you today?`
    ];
  }

  if (personality.traits.formality >= 7) {
    // More formal (Sarah, Captain Mike)
    return [
      `Hello! ${personality.emoji} How are you today?`,
      `Good day! ${personality.emoji} How may I assist you?`,
      `Hello there! ${personality.emoji} How are you doing today?`,
      `Hi! ${personality.emoji} How are things with you?`,
      `Greetings! ${personality.emoji} How are you today?`
    ];
  }

  // Balanced
  return [
    `Hi! ${personality.emoji} How are you today?`,
    `Hello! ${personality.emoji} How's it going?`,
    `Hey there! ${personality.emoji} How are you doing?`,
    `Hi! ${personality.emoji} How are things?`,
    `Hello! ${personality.emoji} How's your day?`
  ];
}

/**
 * Get returning greeting responses
 */
function getReturningGreetings(personality: ConsultantPersonality): string[] {
  if (personality.traits.warmth >= 9) {
    return [
      `Hey again! ${personality.emoji} What can I help you with?`,
      `Hi! ${personality.emoji} Good to hear from you again!`,
      `Hello! ${personality.emoji} What's on your mind?`,
      `Hey! ${personality.emoji} How can I help you?`
    ];
  }

  return [
    `Hello again! ${personality.emoji} How can I assist?`,
    `Hi! ${personality.emoji} What can I do for you?`,
    `Hello! ${personality.emoji} What do you need?`,
    `Hi there! ${personality.emoji} How can I help?`
  ];
}

/**
 * Generate "how are you" response
 */
function generateHowAreYouResponse(
  personality: ConsultantPersonality,
  context: ConversationContext
): string {
  // Don't repeat if we already answered
  if (context.hasInteracted('how-are-you')) {
    return generateFollowUpResponse(personality, context);
  }

  if (personality.traits.warmth >= 9) {
    // Very warm - Responses for reciprocal greetings ("Fine, and you?")
    // These acknowledge the user said they're well AND answer their question
    const responses = [
      `I'm doing great, thanks for asking! ${personality.emoji} Glad to hear you're doing well! What brings you here today?`,
      `Aw, I'm wonderful, thank you! ${personality.emoji} So happy to hear you're doing fine! How can I help you?`,
      `I'm doing fantastic, thank you! ${personality.emoji} That's lovely that you're doing well! What can I do for you today?`,
      `I'm having a lovely day, thanks! ${personality.emoji} Great to hear you're doing good! What are you looking for today?`,
      `I'm doing really well, thanks for asking! ${personality.emoji} Glad you're doing fine! What can I help you with?`
    ];
    return selectUniqueResponse(responses, context);
  }

  if (personality.traits.formality >= 7) {
    // More formal
    const responses = [
      `I'm doing well, thank you for asking. ${personality.emoji} How are you today?`,
      `Quite well, thank you. ${personality.emoji} How about yourself?`,
      `I'm doing very well, thank you. ${personality.emoji} And how are you?`,
      `I'm well, thank you for asking. ${personality.emoji} How are things with you?`
    ];
    return selectUniqueResponse(responses, context);
  }

  // Balanced
  const responses = [
    `I'm doing great, thanks for asking! ${personality.emoji} How about you?`,
    `I'm good, thank you! ${personality.emoji} How are you doing?`,
    `I'm doing well, thanks! ${personality.emoji} How's your day going?`,
    `I'm great, thanks! ${personality.emoji} How are things with you?`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate small talk response
 */
function generateSmallTalkResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious'
): string {
  if (sentiment === 'positive') {
    // User said something positive (I'm good, I'm great, etc.)
    if (personality.traits.warmth >= 9) {
      const responses = [
        `That's wonderful to hear! ${personality.emoji} I'm so glad! What brings you here today?`,
        `Yay! That's great! ${personality.emoji} So, what can I help you with?`,
        `Awesome! ${personality.emoji} I love hearing that! What are you looking for today?`,
        `That's fantastic! ${personality.emoji} Makes me happy! Now, what can I do for you?`,
        `So good to hear! ${personality.emoji} What can I help you with today?`
      ];
      return selectUniqueResponse(responses, context);
    }

    const responses = [
      `Great to hear! ${personality.emoji} What can I help you with today?`,
      `Glad to hear it! ${personality.emoji} What brings you here?`,
      `Wonderful! ${personality.emoji} How can I assist you today?`,
      `That's good! ${personality.emoji} What are you looking for?`
    ];
    return selectUniqueResponse(responses, context);
  }

  // Neutral/curious small talk
  if (personality.traits.warmth >= 9) {
    const responses = [
      `${personality.emoji} It's lovely chatting with you! What can I help you with today?`,
      `${personality.emoji} You're so sweet! So, what brings you here?`,
      `${personality.emoji} I appreciate you! What are you looking for today?`,
      `${personality.emoji} You're wonderful! Now, how can I help you?`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `${personality.emoji} Thank you! What can I help you with today?`,
    `${personality.emoji} Appreciated! What brings you here?`,
    `${personality.emoji} Thanks! How can I assist you today?`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate personal question response
 */
function generatePersonalQuestionResponse(
  personality: ConsultantPersonality,
  context: ConversationContext
): string {
  if (personality.traits.warmth >= 9) {
    const responses = [
      `I'm ${personality.name}, your travel consultant! ${personality.emoji} I'm here to help make your travel dreams come true! What adventure are you planning?`,
      `I'm ${personality.name}! ${personality.emoji} I absolutely love helping people find amazing travel deals and experiences! What can I help you with today?`,
      `I'm ${personality.name}, and I'm passionate about travel! ${personality.emoji} I'm here to help you find the perfect trip. What are you looking for?`,
      `Great question! I'm ${personality.name}, your friendly travel expert! ${personality.emoji} I'm here to make your travel planning easy and fun! What's on your mind?`
    ];
    return selectUniqueResponse(responses, context);
  }

  if (personality.traits.formality >= 7) {
    const responses = [
      `I'm ${personality.name}, your travel consultant. ${personality.emoji} I'm here to assist with all your travel needs. How may I help you today?`,
      `I'm ${personality.name}. ${personality.emoji} I specialize in helping travelers find the best options for their journeys. What are you looking for?`,
      `My name is ${personality.name}. ${personality.emoji} I'm here to provide expert travel assistance. How can I help you today?`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `I'm ${personality.name}! ${personality.emoji} I'm here to help with all your travel plans. What can I do for you today?`,
    `I'm ${personality.name}, your travel consultant! ${personality.emoji} I help people find great travel options. What brings you here?`,
    `I'm ${personality.name}! ${personality.emoji} I'm passionate about helping travelers like you. What are you looking for?`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate gratitude response
 */
function generateGratitudeResponse(
  personality: ConsultantPersonality,
  context: ConversationContext
): string {
  if (personality.traits.warmth >= 9) {
    const responses = [
      `You're so welcome! ${personality.emoji} It's my absolute pleasure to help!`,
      `Aw, of course! ${personality.emoji} Anytime! I'm always here for you!`,
      `My pleasure! ${personality.emoji} That's what I'm here for! Happy to help!`,
      `You're very welcome! ${personality.emoji} I love being able to help!`,
      `Anytime! ${personality.emoji} I'm so glad I could help you!`
    ];
    return selectUniqueResponse(responses, context);
  }

  if (personality.traits.formality >= 7) {
    const responses = [
      `You're welcome. ${personality.emoji} Happy to assist.`,
      `My pleasure. ${personality.emoji} Glad I could help.`,
      `You're quite welcome. ${personality.emoji} Please let me know if you need anything else.`,
      `Happy to help. ${personality.emoji} Don't hesitate to reach out if you need more assistance.`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `You're welcome! ${personality.emoji} Happy to help!`,
    `No problem! ${personality.emoji} Glad I could assist!`,
    `My pleasure! ${personality.emoji} Anytime!`,
    `You're welcome! ${personality.emoji} That's what I'm here for!`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate destination recommendation response
 */
function generateDestinationRecommendationResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious'
): string {
  if (personality.traits.warmth >= 9) {
    const responses = [
      `Oh, I'd LOVE to help you with that, sweetie! ${personality.emoji} Let me suggest some fantastic destinations for you! Based on your dates and budget, I'm thinking...\n\n✨ **Lisbon, Portugal** - New Year's fireworks over the Tagus River, amazing food, and very affordable! Whole packages start around $800-1200.\n\n🎉 **Cartagena, Colombia** - Warm weather, Caribbean vibes, incredible parties, and super budget-friendly! Around $700-1000 total.\n\n🎆 **Prague, Czech Republic** - Magical Christmas markets still up, beautiful architecture, great parties, $900-1400 package.\n\n🌴 **Cancun, Mexico** - Beach paradise, all-inclusive resorts, perfect weather! $1100-1600 for 5 days all-in.\n\nWhich style appeals to you most, hon? Beach party, European charm, or cultural adventure? 💕`,
      `Wonderful question! ${personality.emoji} I have some AMAZING ideas for New Year's Eve trips, sweetie! Let me share my top picks for December with great value...\n\n🌟 **Barcelona, Spain** - Incredible NYE on the beach at Barceloneta, tapas, Gaudí architecture! Packages $1000-1500.\n\n🎊 **Buenos Aires, Argentina** - Summer there, tango, steaks, vibrant nightlife! Very affordable at $900-1300.\n\n❄️ **Reykjavik, Iceland** - Northern Lights, hot springs, unique celebration! $1200-1800 (worth it!).\n\n🏝️ **Phuket, Thailand** - Beach parties, amazing food, beautiful beaches! Super budget-friendly $700-1100.\n\nWhat catches your eye, dear? I can put together a complete package with flights, hotels, and even some activities! 🎧`,
      `Oh how exciting! ${personality.emoji} New Year's Eve travel - I LOVE planning these! Let me give you some incredible options that won't break the bank, sweetie...\n\n🇵🇹 **Porto, Portugal** - Wine, riverside celebrations, charming old town. $850-1200 package.\n\n🇲🇽 **Playa del Carmen, Mexico** - Beach clubs, Mayan ruins, perfect weather! $1000-1500 all-inclusive.\n\n🇬🇷 **Athens, Greece** - Ancient sites, Acropolis fireworks, Mediterranean food! $1100-1600.\n\n🇻🇳 **Ho Chi Minh City, Vietnam** - Amazing street food, vibrant celebrations, incredible value! $800-1200.\n\nTell me what vibe you're going for and I'll narrow it down perfectly for you, hon! Party mode? Romantic? Cultural? 💕`
    ];
    return selectUniqueResponse(responses, context);
  }

  if (personality.traits.formality >= 7) {
    const responses = [
      `${personality.emoji} Excellent question. For a 5-day New Year's Eve trip with reasonable pricing, I'd recommend:\n\n• **Lisbon, Portugal** - €800-1200 package, vibrant celebrations\n• **Prague, Czech Republic** - €900-1400, stunning architecture and parties\n• **Mexico City, Mexico** - $700-1100, rich culture and festivities\n• **Bangkok, Thailand** - $800-1300, exceptional value with world-class celebrations\n\nWhich destination type interests you most? I can provide detailed package options.`,
      `${personality.emoji} I can certainly help with that. For December 28-January 2 with budget-conscious options, consider:\n\n• **Barcelona, Spain** - Complete packages $1000-1500\n• **Buenos Aires, Argentina** - Summer season, $900-1300\n• **Dubai, UAE** - Spectacular NYE, $1200-1800\n• **Phuket, Thailand** - Beach paradise, $700-1100\n\nShall I provide more details on any of these destinations?`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `Great question! ${personality.emoji} For New Year's Eve on a reasonable budget, I'd suggest:\n\n🎉 **Lisbon** - Amazing food, great parties, $800-1200\n🌴 **Cancun** - Beach + celebrations, $1100-1600\n🎆 **Prague** - Beautiful + festive, $900-1400\n🏖️ **Phuket** - Tropical paradise, $700-1100\n\nWhich vibe sounds best? I can build a complete package for you!`,
    `${personality.emoji} I have some great ideas! For a 5-day New Year's trip with good value:\n\n• Lisbon, Portugal - $800-1200\n• Cartagena, Colombia - $700-1000  \n• Barcelona, Spain - $1000-1500\n• Bangkok, Thailand - $800-1300\n\nWhat type of experience are you looking for?`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate casual response
 */
function generateCasualResponse(
  personality: ConsultantPersonality,
  context: ConversationContext,
  sentiment: 'positive' | 'neutral' | 'negative' | 'curious'
): string {
  if (context.shouldTransitionToService()) {
    return generateServiceTransition(personality, context);
  }

  if (personality.traits.warmth >= 9) {
    const responses = [
      `${personality.emoji} I'm here whenever you need me! What would you like to do today?`,
      `${personality.emoji} So, what can I help you with? I'm all ears!`,
      `${personality.emoji} I'm ready to help! What's on your mind?`,
      `${personality.emoji} What can I do for you today? I'm here to help!`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `${personality.emoji} How can I assist you today?`,
    `${personality.emoji} What can I help you with?`,
    `${personality.emoji} What brings you here today?`,
    `${personality.emoji} How may I help you?`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate service transition
 */
function generateServiceTransition(
  personality: ConsultantPersonality,
  context: ConversationContext
): string {
  if (personality.traits.warmth >= 9) {
    const responses = [
      `So, what adventure are we planning today? ${personality.emoji} I can help you with flights, hotels, car rentals, or complete packages!`,
      `Now, let's get to the fun part! ${personality.emoji} What kind of trip are you thinking about? Flights? Hotels? A full package?`,
      `Alright! ${personality.emoji} What can I help you with today? I do flights, hotels, cars, and I can even put together custom packages!`,
      `So! ${personality.emoji} What brings you here today? Looking for flights, a hotel, or maybe planning a complete getaway?`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `What can I help you with today? ${personality.emoji} I can assist with flights, hotels, cars, or complete travel packages.`,
    `How may I assist you? ${personality.emoji} I can help you book flights, find hotels, rent cars, or plan complete trips.`,
    `What are you looking for today? ${personality.emoji} I specialize in flights, accommodations, car rentals, and packages.`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate farewell response
 */
function generateFarewellResponse(
  personality: ConsultantPersonality,
  context: ConversationContext
): string {
  if (personality.traits.warmth >= 9) {
    const responses = [
      `Take care! ${personality.emoji} It was wonderful chatting with you! Come back anytime!`,
      `Bye! ${personality.emoji} So lovely talking to you! Safe travels!`,
      `Goodbye! ${personality.emoji} Have an amazing day! I'm here whenever you need me!`,
      `See you later! ${personality.emoji} Don't be a stranger! Happy travels!`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `Goodbye! ${personality.emoji} Have a great day!`,
    `Take care! ${personality.emoji} Feel free to return anytime.`,
    `Farewell! ${personality.emoji} Safe travels!`,
    `Bye! ${personality.emoji} Have a wonderful day!`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate follow-up response
 */
function generateFollowUpResponse(
  personality: ConsultantPersonality,
  context: ConversationContext
): string {
  if (personality.traits.warmth >= 9) {
    const responses = [
      `${personality.emoji} Still doing great! Now, what can I help you with?`,
      `${personality.emoji} Wonderful as always! What brings you back?`,
      `${personality.emoji} Still fantastic! What do you need help with?`
    ];
    return selectUniqueResponse(responses, context);
  }

  const responses = [
    `${personality.emoji} Still well, thank you. How can I assist?`,
    `${personality.emoji} Doing fine. What can I help you with?`,
    `${personality.emoji} All good. What do you need?`
  ];
  return selectUniqueResponse(responses, context);
}

/**
 * Generate default response
 */
function generateDefaultResponse(
  personality: ConsultantPersonality,
  context: ConversationContext
): string {
  if (personality.traits.warmth >= 9) {
    return `${personality.emoji} I'm here to help! What can I do for you today?`;
  }

  return `${personality.emoji} How may I assist you?`;
}

/**
 * Select unique response that hasn't been used recently
 */
function selectUniqueResponse(responses: string[], context: ConversationContext): string {
  // Filter out recently used responses
  const recentResponses = context.getRecentInteractions(3);
  const availableResponses = responses.filter(
    response =>
      !recentResponses.some(interaction =>
        interaction.assistantResponse.includes(response) || response.includes(interaction.assistantResponse)
      )
  );

  // If all responses were recently used, use any
  if (availableResponses.length === 0) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return availableResponses[Math.floor(Math.random() * availableResponses.length)];
}
