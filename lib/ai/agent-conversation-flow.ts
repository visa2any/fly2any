/**
 * Agent Conversation Flow Manager
 * Manages the state machine for guiding travel booking conversations
 */

export type ConversationStage =
  | 'greeting'              // Just said hi
  | 'discovery'             // Finding out what they want
  | 'gathering-details'     // Collecting trip info
  | 'searching'             // Actively searching
  | 'presenting-options'    // Showing results
  | 'guiding-decision'      // Helping them choose
  | 'confirming'            // Ready to book
  | 'booking'               // In booking process
  | 'completed'             // Done!
  | 'assistance-needed';    // User has a problem

export type TripType = 'vacation' | 'business' | 'family' | 'solo' | 'romantic' | 'adventure';
export type BudgetLevel = 'economy' | 'premium' | 'luxury' | 'flexible';
export type ServiceType = 'flight' | 'hotel' | 'package' | 'undecided';

export interface CollectedInfo {
  serviceType?: ServiceType;
  tripType?: TripType;
  destination?: string;
  origin?: string;
  dates?: {
    departure: string;
    return?: string;
    flexible?: boolean;
  };
  travelers?: {
    adults: number;
    children?: number;
    infants?: number;
  };
  budget?: BudgetLevel;
  preferences?: {
    directFlights?: boolean;
    airlinePreference?: string[];
    hotelStars?: number;
    mealPlan?: string;
    carRental?: boolean;
    specialRequirements?: string[];
  };
  constraints?: {
    maxLayovers?: number;
    preferredDepartureTime?: 'morning' | 'afternoon' | 'evening' | 'flexible';
    maxBudget?: number;
  };
}

export interface ConversationFlow {
  currentStage: ConversationStage;
  nextQuestion: string | null;
  missingInfo: string[];
  collectedInfo: CollectedInfo;
  suggestedAction: 'ask-question' | 'search' | 'present' | 'guide' | 'book' | 'clarify';
  conversationHistory: {
    userMessage: string;
    agentResponse: string;
    timestamp: Date;
  }[];
  context: {
    lastTopicDiscussed?: string;
    userSeemsUnsure?: boolean;
    needsClarification?: boolean;
    searchAttempted?: boolean;
    optionsPresented?: boolean;
    selectedOption?: any;
  };
}

/**
 * Initialize a new conversation flow
 */
export function initializeConversationFlow(): ConversationFlow {
  return {
    currentStage: 'greeting',
    nextQuestion: null,
    missingInfo: ['serviceType', 'destination', 'dates', 'travelers'],
    collectedInfo: {},
    suggestedAction: 'ask-question',
    conversationHistory: [],
    context: {},
  };
}

/**
 * Determines what information is still missing
 */
export function getMissingInfo(flow: ConversationFlow): string[] {
  const missing: string[] = [];

  if (!flow.collectedInfo.serviceType) {
    missing.push('serviceType');
  }

  if (!flow.collectedInfo.tripType) {
    missing.push('tripType');
  }

  if (!flow.collectedInfo.destination) {
    missing.push('destination');
  }

  if (!flow.collectedInfo.origin) {
    missing.push('origin');
  }

  if (!flow.collectedInfo.dates?.departure) {
    missing.push('dates');
  }

  if (!flow.collectedInfo.travelers?.adults) {
    missing.push('travelers');
  }

  return missing;
}

/**
 * Determines if we have minimum info needed to search
 */
export function canProceedToSearch(flow: ConversationFlow): boolean {
  const { collectedInfo } = flow;

  // For flights
  if (collectedInfo.serviceType === 'flight') {
    return !!(
      collectedInfo.destination &&
      collectedInfo.origin &&
      collectedInfo.dates?.departure &&
      collectedInfo.travelers?.adults
    );
  }

  // For hotels
  if (collectedInfo.serviceType === 'hotel') {
    return !!(
      collectedInfo.destination &&
      collectedInfo.dates?.departure &&
      collectedInfo.dates?.return &&
      collectedInfo.travelers?.adults
    );
  }

  // For packages
  if (collectedInfo.serviceType === 'package') {
    return !!(
      collectedInfo.destination &&
      collectedInfo.origin &&
      collectedInfo.dates?.departure &&
      collectedInfo.dates?.return &&
      collectedInfo.travelers?.adults
    );
  }

  return false;
}

/**
 * Determines if we have complete information
 */
export function hasCompleteInfo(flow: ConversationFlow): boolean {
  return getMissingInfo(flow).length === 0;
}

/**
 * Gets the next logical question to ask based on what's missing
 */
export function getNextQuestion(flow: ConversationFlow): string | null {
  const missing = getMissingInfo(flow);

  // Priority order for questions
  const questionPriority = [
    'serviceType',
    'tripType',
    'destination',
    'origin',
    'dates',
    'travelers',
    'budget',
    'preferences'
  ];

  for (const priority of questionPriority) {
    if (missing.includes(priority)) {
      return priority;
    }
  }

  return null;
}

/**
 * Updates the conversation stage based on collected info
 */
export function updateConversationStage(flow: ConversationFlow): ConversationStage {
  const { collectedInfo, context } = flow;

  // If just started
  if (Object.keys(collectedInfo).length === 0) {
    return 'greeting';
  }

  // If in booking process
  if (context.selectedOption) {
    return 'booking';
  }

  // If options were presented
  if (context.optionsPresented) {
    return 'guiding-decision';
  }

  // If can search
  if (canProceedToSearch(flow)) {
    if (context.searchAttempted) {
      return 'presenting-options';
    }
    return 'searching';
  }

  // If gathering basic info
  if (collectedInfo.serviceType && collectedInfo.destination) {
    return 'gathering-details';
  }

  // Still discovering
  return 'discovery';
}

/**
 * Determines the suggested action based on current state
 */
export function getSuggestedAction(
  flow: ConversationFlow
): 'ask-question' | 'search' | 'present' | 'guide' | 'book' | 'clarify' {
  const { currentStage, context, collectedInfo } = flow;

  // If user seems unsure, clarify
  if (context.needsClarification || context.userSeemsUnsure) {
    return 'clarify';
  }

  // If ready to book
  if (currentStage === 'booking' || currentStage === 'confirming') {
    return 'book';
  }

  // If presenting options
  if (currentStage === 'presenting-options' || currentStage === 'guiding-decision') {
    return 'guide';
  }

  // If ready to search
  if (canProceedToSearch(flow) && !context.searchAttempted) {
    return 'search';
  }

  // If search was done but no options presented yet
  if (context.searchAttempted && !context.optionsPresented) {
    return 'present';
  }

  // Default: ask questions to gather info
  return 'ask-question';
}

/**
 * Generates a natural follow-up based on what was just collected
 */
export function generateFollowUp(
  lastCollected: string,
  collectedInfo: CollectedInfo
): string | null {
  switch (lastCollected) {
    case 'serviceType':
      if (collectedInfo.serviceType === 'flight') {
        return "Perfect! Let's find you a great flight. Where would you like to go?";
      } else if (collectedInfo.serviceType === 'hotel') {
        return "Wonderful! I'll help you find the perfect hotel. What's your destination?";
      } else if (collectedInfo.serviceType === 'package') {
        return "Great choice! A package deal can save you money. Where are you thinking of going?";
      }
      break;

    case 'tripType':
      return `${getTripTypeAffirmation(collectedInfo.tripType)} Where would you like to go?`;

    case 'destination':
      if (collectedInfo.serviceType === 'hotel') {
        return `${collectedInfo.destination} is beautiful! When are you planning to check in?`;
      }
      return `${collectedInfo.destination} is an amazing choice! Where will you be flying from?`;

    case 'origin':
      return `Great! When would you like to depart from ${collectedInfo.origin}?`;

    case 'dates':
      return "Perfect! How many people will be traveling?";

    case 'travelers':
      return "Got it! What's your preferred budget range - economy, premium, or luxury?";

    case 'budget':
      return "Excellent! Let me search for the best options for you.";
  }

  return null;
}

/**
 * Gets an affirmation based on trip type
 */
function getTripTypeAffirmation(tripType?: TripType): string {
  switch (tripType) {
    case 'vacation':
      return 'Exciting! A vacation sounds wonderful.';
    case 'business':
      return 'I understand. Let me find you the most convenient options.';
    case 'family':
      return 'How lovely! Family time is precious.';
    case 'romantic':
      return 'How romantic! I\'ll help you plan something special.';
    case 'adventure':
      return 'Amazing! An adventure awaits!';
    case 'solo':
      return 'Great! Solo travel can be so enriching.';
    default:
      return 'Wonderful!';
  }
}

/**
 * Tracks the conversation in history
 */
export function addToConversationHistory(
  flow: ConversationFlow,
  userMessage: string,
  agentResponse: string
): ConversationFlow {
  return {
    ...flow,
    conversationHistory: [
      ...flow.conversationHistory,
      {
        userMessage,
        agentResponse,
        timestamp: new Date(),
      },
    ],
  };
}

/**
 * Analyzes if user seems confused or unsure
 */
export function detectUserUncertainty(message: string): boolean {
  const uncertaintyPhrases = [
    'not sure',
    'don\'t know',
    'maybe',
    'i guess',
    'whatever',
    'anything',
    'doesn\'t matter',
    'up to you',
    'help me decide',
    'what do you think',
    'what would you suggest',
    'i\'m flexible',
  ];

  const lowerMessage = message.toLowerCase();
  return uncertaintyPhrases.some(phrase => lowerMessage.includes(phrase));
}

/**
 * Detects if user needs clarification
 */
export function needsClarification(message: string): boolean {
  // Very short or vague responses
  if (message.trim().length < 10 && !hasSpecificInfo(message)) {
    return true;
  }

  // Question words indicating confusion
  const confusionIndicators = [
    'what do you mean',
    'i don\'t understand',
    'can you explain',
    'huh?',
    'what?',
    'confused',
  ];

  const lowerMessage = message.toLowerCase();
  return confusionIndicators.some(phrase => lowerMessage.includes(phrase));
}

/**
 * Checks if message contains specific information
 */
function hasSpecificInfo(message: string): boolean {
  // Check for dates, numbers, locations, etc.
  const hasDate = /\b\d{1,2}\/\d{1,2}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(message);
  const hasNumber = /\b\d+\b/.test(message);
  const hasLocation = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/.test(message);

  return hasDate || hasNumber || hasLocation;
}

/**
 * Gets a progress percentage for UI display
 */
export function getProgressPercentage(flow: ConversationFlow): number {
  const totalFields = 6; // serviceType, destination, origin, dates, travelers, budget
  const collectedFields = Object.keys(flow.collectedInfo).length;

  return Math.min(100, Math.round((collectedFields / totalFields) * 100));
}

/**
 * Generates a summary of collected information
 */
export function generateCollectedInfoSummary(collectedInfo: CollectedInfo): string {
  const parts: string[] = [];

  if (collectedInfo.serviceType) {
    parts.push(`Service: ${collectedInfo.serviceType}`);
  }

  if (collectedInfo.tripType) {
    parts.push(`Trip type: ${collectedInfo.tripType}`);
  }

  if (collectedInfo.origin && collectedInfo.destination) {
    parts.push(`Route: ${collectedInfo.origin} → ${collectedInfo.destination}`);
  } else if (collectedInfo.destination) {
    parts.push(`Destination: ${collectedInfo.destination}`);
  }

  if (collectedInfo.dates?.departure) {
    if (collectedInfo.dates.return) {
      parts.push(`Dates: ${collectedInfo.dates.departure} to ${collectedInfo.dates.return}`);
    } else {
      parts.push(`Departure: ${collectedInfo.dates.departure}`);
    }
  }

  if (collectedInfo.travelers?.adults) {
    const total = collectedInfo.travelers.adults +
                  (collectedInfo.travelers.children || 0) +
                  (collectedInfo.travelers.infants || 0);
    parts.push(`Travelers: ${total}`);
  }

  if (collectedInfo.budget) {
    parts.push(`Budget: ${collectedInfo.budget}`);
  }

  return parts.join(' | ');
}

/**
 * Main function to update conversation flow based on user input
 */
export function updateConversationFlow(
  currentFlow: ConversationFlow,
  userMessage: string,
  extractedInfo: Partial<CollectedInfo>
): ConversationFlow {
  // Merge extracted info
  const updatedInfo = {
    ...currentFlow.collectedInfo,
    ...extractedInfo,
  };

  // Update context
  const updatedContext = {
    ...currentFlow.context,
    userSeemsUnsure: detectUserUncertainty(userMessage),
    needsClarification: needsClarification(userMessage),
  };

  // Create updated flow
  const updatedFlow: ConversationFlow = {
    ...currentFlow,
    collectedInfo: updatedInfo,
    context: updatedContext,
    missingInfo: getMissingInfo({ ...currentFlow, collectedInfo: updatedInfo }),
  };

  // Update stage
  updatedFlow.currentStage = updateConversationStage(updatedFlow);

  // Update suggested action
  updatedFlow.suggestedAction = getSuggestedAction(updatedFlow);

  // Get next question
  updatedFlow.nextQuestion = getNextQuestion(updatedFlow);

  return updatedFlow;
}
