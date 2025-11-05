/**
 * Agent Proactive Behavior Engine
 * Makes the AI take initiative and guide conversations like a real travel agent
 */

import {
  ConversationFlow,
  ConversationStage,
  canProceedToSearch,
  getNextQuestion,
  generateFollowUp,
} from './agent-conversation-flow';

import {
  getRandomQuestion,
  discoveryQuestions,
  getFollowUpFor,
  getClarifyingQuestion,
  getProactiveSuggestion,
  guidingQuestions,
  reassuranceStatements,
  urgencyStatements,
  valueStatements,
} from './agent-question-bank';

export type ProactiveAction =
  | 'ask-next-question'
  | 'clarify-vague-input'
  | 'suggest-options'
  | 'recommend-choice'
  | 'initiate-search'
  | 'present-results'
  | 'confirm-booking'
  | 'provide-reassurance'
  | 'create-urgency'
  | 'highlight-value';

export interface ProactiveMessage {
  action: ProactiveAction;
  message: string;
  context?: any;
  shouldExecuteSearch?: boolean;
  shouldPresentOptions?: boolean;
}

/**
 * Should the agent ask a question now?
 */
export function shouldAskQuestion(flow: ConversationFlow): boolean {
  // Always ask if in discovery or gathering stages
  if (flow.currentStage === 'discovery' || flow.currentStage === 'gathering-details') {
    return true;
  }

  // Ask if there's missing critical info
  if (flow.missingInfo.length > 0 && !canProceedToSearch(flow)) {
    return true;
  }

  // Ask if user seems unsure
  if (flow.context.userSeemsUnsure) {
    return true;
  }

  return false;
}

/**
 * Should the agent suggest something?
 */
export function shouldSuggest(flow: ConversationFlow): boolean {
  // Suggest if user is stuck or unsure
  if (flow.context.userSeemsUnsure) {
    return true;
  }

  // Suggest if search returned too many results
  if (flow.context.optionsPresented && flow.context.lastTopicDiscussed === 'too_many_options') {
    return true;
  }

  // Suggest alternatives if no results found
  if (flow.context.searchAttempted && flow.context.lastTopicDiscussed === 'no_results') {
    return true;
  }

  return false;
}

/**
 * Should the agent take action (search, book, etc)?
 */
export function shouldTakeAction(flow: ConversationFlow): boolean {
  // Take action if enough info to search and hasn't searched yet
  if (canProceedToSearch(flow) && !flow.context.searchAttempted) {
    return true;
  }

  // Take action if user chose an option and ready to book
  if (flow.context.selectedOption && flow.currentStage === 'confirming') {
    return true;
  }

  return false;
}

/**
 * Should clarify user input?
 */
export function shouldClarify(flow: ConversationFlow): boolean {
  return !!(flow.context.needsClarification || flow.context.userSeemsUnsure);
}

/**
 * Determines what the agent should do next
 */
export function determineNextAction(flow: ConversationFlow): ProactiveAction {
  // Priority 1: Clarify if needed
  if (shouldClarify(flow)) {
    return 'clarify-vague-input';
  }

  // Priority 2: Take action if ready
  if (shouldTakeAction(flow)) {
    if (flow.currentStage === 'confirming' || flow.currentStage === 'booking') {
      return 'confirm-booking';
    }
    return 'initiate-search';
  }

  // Priority 3: Present or guide if results available
  if (flow.context.searchAttempted && !flow.context.optionsPresented) {
    return 'present-results';
  }

  if (flow.currentStage === 'presenting-options' || flow.currentStage === 'guiding-decision') {
    return 'recommend-choice';
  }

  // Priority 4: Suggest if user is stuck
  if (shouldSuggest(flow)) {
    return 'suggest-options';
  }

  // Priority 5: Ask next question to gather info
  if (shouldAskQuestion(flow)) {
    return 'ask-next-question';
  }

  // Default: provide reassurance
  return 'provide-reassurance';
}

/**
 * Generates the proactive message based on action
 */
export function generateProactiveMessage(
  flow: ConversationFlow,
  lastUserMessage?: string
): ProactiveMessage {
  const action = determineNextAction(flow);

  switch (action) {
    case 'ask-next-question':
      return generateNextQuestionMessage(flow);

    case 'clarify-vague-input':
      return generateClarificationMessage(flow, lastUserMessage);

    case 'suggest-options':
      return generateSuggestionMessage(flow);

    case 'recommend-choice':
      return generateRecommendationMessage(flow);

    case 'initiate-search':
      return generateSearchInitiationMessage(flow);

    case 'present-results':
      return generatePresentResultsMessage(flow);

    case 'confirm-booking':
      return generateConfirmBookingMessage(flow);

    case 'provide-reassurance':
      return generateReassuranceMessage(flow);

    case 'create-urgency':
      return generateUrgencyMessage(flow);

    case 'highlight-value':
      return generateValueMessage(flow);

    default:
      return {
        action: 'ask-next-question',
        message: "How can I help you today?",
      };
  }
}

/**
 * Generate message for asking next question
 */
function generateNextQuestionMessage(flow: ConversationFlow): ProactiveMessage {
  const nextField = getNextQuestion(flow);

  if (!nextField) {
    return {
      action: 'ask-next-question',
      message: "Is there anything else I should know about your trip?",
    };
  }

  let message = '';

  switch (nextField) {
    case 'serviceType':
      message = getRandomQuestion([
        "What can I help you with today - looking for flights, hotels, or a complete package?",
        "Are you searching for flights, hotel accommodations, or both?",
        "Would you like to book a flight, find a hotel, or get a package deal?",
      ]);
      break;

    case 'tripType':
      message = getRandomQuestion(discoveryQuestions.tripType);
      break;

    case 'destination':
      message = getFollowUpFor('destination', flow.collectedInfo) ||
                getRandomQuestion(discoveryQuestions.destination);
      break;

    case 'origin':
      message = getFollowUpFor('origin', flow.collectedInfo) ||
                getRandomQuestion(discoveryQuestions.origin);
      break;

    case 'dates':
      message = getFollowUpFor('dates', flow.collectedInfo) ||
                getRandomQuestion(discoveryQuestions.dates);
      break;

    case 'travelers':
      message = getFollowUpFor('travelers', flow.collectedInfo) ||
                getRandomQuestion(discoveryQuestions.travelers);
      break;

    case 'budget':
      message = getRandomQuestion(discoveryQuestions.budget);
      break;

    default:
      message = "What else can you tell me about your trip?";
  }

  return {
    action: 'ask-next-question',
    message,
  };
}

/**
 * Generate clarification message
 */
function generateClarificationMessage(
  flow: ConversationFlow,
  lastUserMessage?: string
): ProactiveMessage {
  const nextField = getNextQuestion(flow);

  let message = '';

  // Context-specific clarification
  if (nextField === 'destination' || flow.context.lastTopicDiscussed === 'destination') {
    message = getClarifyingQuestion('destination');
  } else if (nextField === 'dates' || flow.context.lastTopicDiscussed === 'dates') {
    message = getClarifyingQuestion('dates');
  } else if (nextField === 'budget' || flow.context.lastTopicDiscussed === 'budget') {
    message = getClarifyingQuestion('budget');
  } else {
    message = getRandomQuestion([
      "I want to make sure I find you the perfect options. Can you tell me a bit more?",
      "Let me understand better. Could you provide a bit more detail?",
      "To help you better, could you be more specific about what you're looking for?",
    ]);
  }

  return {
    action: 'clarify-vague-input',
    message,
  };
}

/**
 * Generate suggestion message
 */
function generateSuggestionMessage(flow: ConversationFlow): ProactiveMessage {
  let context = 'stuck';

  if (flow.context.lastTopicDiscussed === 'budget') {
    context = 'budget_concerns';
  } else if (flow.context.lastTopicDiscussed === 'too_many_options') {
    context = 'too_many_options';
  } else if (flow.context.lastTopicDiscussed === 'no_results') {
    context = 'no_results';
  }

  const message = getProactiveSuggestion(context);

  return {
    action: 'suggest-options',
    message,
  };
}

/**
 * Generate recommendation message
 */
function generateRecommendationMessage(flow: ConversationFlow): ProactiveMessage {
  // This would be called after search results are available
  // For now, generic recommendation message

  const message = getRandomQuestion([
    "Based on what you told me, I have some excellent recommendations. Let me show you the top 3 options!",
    "I found some great choices for you! Here are my top picks based on your preferences.",
    "Perfect! I've narrowed it down to the best options. Let me walk you through them.",
  ]);

  return {
    action: 'recommend-choice',
    message,
    shouldPresentOptions: true,
  };
}

/**
 * Generate search initiation message
 */
function generateSearchInitiationMessage(flow: ConversationFlow): ProactiveMessage {
  const { collectedInfo } = flow;

  let message = '';

  if (collectedInfo.serviceType === 'flight') {
    message = getRandomQuestion([
      `Perfect! Let me search for flights from ${collectedInfo.origin} to ${collectedInfo.destination}. One moment...`,
      `Great! Searching for the best flights on ${collectedInfo.dates?.departure}. This will just take a second...`,
      `Got it! Finding you the best flight options now. Hold tight!`,
    ]);
  } else if (collectedInfo.serviceType === 'hotel') {
    message = getRandomQuestion([
      `Excellent! Searching for hotels in ${collectedInfo.destination}. Just a moment...`,
      `Perfect! Looking for the best accommodations for your dates. One second...`,
      `Great! Finding you amazing hotels in ${collectedInfo.destination}...`,
    ]);
  } else {
    message = "Perfect! Let me search for the best options for you. One moment...";
  }

  return {
    action: 'initiate-search',
    message,
    shouldExecuteSearch: true,
  };
}

/**
 * Generate present results message
 */
function generatePresentResultsMessage(flow: ConversationFlow): ProactiveMessage {
  const message = getRandomQuestion([
    "Great news! I found several excellent options for you. Let me show you the top choices.",
    "Perfect! Here are the best options I found based on your preferences.",
    "Excellent! I've got some great results. Let me highlight the best ones for you.",
  ]);

  return {
    action: 'present-results',
    message,
    shouldPresentOptions: true,
  };
}

/**
 * Generate confirm booking message
 */
function generateConfirmBookingMessage(flow: ConversationFlow): ProactiveMessage {
  const message = getRandomQuestion([
    "Excellent choice! Shall I proceed with booking this option for you?",
    "Perfect! Would you like to continue with the booking?",
    "Great decision! Ready to secure this booking?",
    "That's a solid choice! Let's move forward with the booking. Sound good?",
  ]);

  return {
    action: 'confirm-booking',
    message,
  };
}

/**
 * Generate reassurance message
 */
function generateReassuranceMessage(flow: ConversationFlow): ProactiveMessage {
  const message = getRandomQuestion(reassuranceStatements);

  return {
    action: 'provide-reassurance',
    message,
  };
}

/**
 * Generate urgency message (for conversion optimization)
 */
function generateUrgencyMessage(flow: ConversationFlow): ProactiveMessage {
  const { collectedInfo } = flow;

  let message = '';

  if (collectedInfo.destination) {
    message = urgencyStatements[0]
      .replace('{trend}', 'trending upward')
      .replace('{destination}', collectedInfo.destination)
      .replace('{count}', '12');
  } else {
    message = getRandomQuestion([
      "Just so you know, prices tend to go up as we get closer to travel dates. Booking soon is usually best!",
      "I'm seeing good availability right now, but these deals can change quickly!",
    ]);
  }

  return {
    action: 'create-urgency',
    message,
  };
}

/**
 * Generate value highlighting message
 */
function generateValueMessage(flow: ConversationFlow): ProactiveMessage {
  const message = getRandomQuestion(valueStatements);

  return {
    action: 'highlight-value',
    message,
  };
}

/**
 * Determines if agent should proactively reach out (for silent users)
 */
export function shouldProactivelyEngage(
  flow: ConversationFlow,
  timeSinceLastMessage: number
): boolean {
  // If user hasn't responded in 30 seconds and we're in early stages
  if (timeSinceLastMessage > 30000 && flow.currentStage === 'discovery') {
    return true;
  }

  // If user seems stuck (multiple short responses)
  const recentMessages = flow.conversationHistory.slice(-3);
  const shortResponses = recentMessages.filter(
    msg => msg.userMessage.length < 20
  );

  if (shortResponses.length >= 2) {
    return true;
  }

  return false;
}

/**
 * Generate proactive engagement message (for silent/stuck users)
 */
export function generateProactiveEngagement(flow: ConversationFlow): string {
  return getRandomQuestion([
    "No worries, take your time! If you're not sure where to start, I can suggest some popular destinations.",
    "I'm here to help! Would you like me to show you some trending travel deals?",
    "Stuck deciding? I can recommend some amazing destinations based on your interests!",
    "Need inspiration? Let me show you what's popular this season!",
  ]);
}

/**
 * Context-aware response enhancement
 * Adds personality and context to responses
 */
export function enhanceResponse(
  baseMessage: string,
  flow: ConversationFlow,
  addEmoji: boolean = true
): string {
  const { collectedInfo, currentStage } = flow;

  let enhanced = baseMessage;

  // Add contextual emoji
  if (addEmoji) {
    if (currentStage === 'greeting' || currentStage === 'discovery') {
      enhanced = enhanced.replace(/^/, '👋 ');
    } else if (currentStage === 'searching') {
      enhanced = enhanced.replace(/^/, '🔍 ');
    } else if (currentStage === 'presenting-options') {
      enhanced = enhanced.replace(/^/, '✈️ ');
    } else if (currentStage === 'booking') {
      enhanced = enhanced.replace(/^/, '🎫 ');
    }
  }

  // Add enthusiasm for vacation trips
  if (collectedInfo.tripType === 'vacation') {
    const excitementPhrases = ['Exciting!', 'How wonderful!', 'That sounds amazing!'];
    if (Math.random() > 0.7) {
      enhanced = getRandomQuestion(excitementPhrases) + ' ' + enhanced;
    }
  }

  // Add efficiency focus for business trips
  if (collectedInfo.tripType === 'business') {
    if (enhanced.includes('flight') && Math.random() > 0.7) {
      enhanced += ' I\'ll focus on convenient times and direct routes.';
    }
  }

  return enhanced;
}

/**
 * Generate a natural conversation starter based on stage
 */
export function generateConversationStarter(stage: ConversationStage): string {
  switch (stage) {
    case 'greeting':
      return getRandomQuestion([
        "Hi there! 👋 I'm your personal travel agent. Ready to plan an amazing trip?",
        "Hello! 😊 I'm here to help you find the perfect flight or hotel. What can I do for you today?",
        "Hey! Welcome to Fly2Any! Let's find you an incredible travel deal!",
      ]);

    case 'discovery':
      return getRandomQuestion([
        "Great! Tell me, are you looking for flights, hotels, or a complete package?",
        "Perfect! What brings you here today - planning a vacation or booking business travel?",
        "Wonderful! Where are you thinking of going?",
      ]);

    default:
      return "How can I help you today?";
  }
}

/**
 * Inject personality into responses
 */
export function addPersonality(
  message: string,
  personalityLevel: 'professional' | 'friendly' | 'enthusiastic' = 'friendly'
): string {
  if (personalityLevel === 'professional') {
    return message;
  }

  if (personalityLevel === 'enthusiastic') {
    // Add more exclamation marks
    message = message.replace(/\./g, (match, offset) => {
      return Math.random() > 0.6 && offset === message.length - 1 ? '!' : match;
    });
  }

  return message;
}
