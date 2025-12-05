/**
 * Sales Conversion Engine - State of the Art
 *
 * Transforms AI agents into highly effective sales consultants that:
 * - Detect customer behavior patterns
 * - Respond with maximum humanization
 * - Drive conversions through psychology-based techniques
 * - Upsell and cross-sell intelligently
 *
 * Goal: Maximize booking conversions while maintaining authenticity
 */

// Customer behavior indicators
export interface CustomerBehaviorProfile {
  urgency: 'immediate' | 'researching' | 'comparison_shopping' | 'undecided';
  budget: 'price_sensitive' | 'value_focused' | 'premium' | 'luxury' | 'unknown';
  travelPurpose: 'business' | 'leisure' | 'family' | 'romantic' | 'adventure' | 'unknown';
  decisionMaker: 'sole' | 'shared' | 'unknown';
  experience: 'first_time' | 'occasional' | 'frequent' | 'expert';
  emotionalState: 'excited' | 'stressed' | 'neutral' | 'frustrated' | 'overwhelmed';
  engagementLevel: 'high' | 'medium' | 'low';
}

// Conversion stage tracking
export type ConversionStage =
  | 'awareness'      // Just browsing, asking questions
  | 'interest'       // Showing interest in specific options
  | 'consideration'  // Comparing options, asking for details
  | 'intent'         // Ready to book, asking about payment/booking
  | 'evaluation'     // Final checks before booking
  | 'purchase'       // Completing the booking
  | 'retention';     // Post-purchase upsell opportunity

// Upsell/Cross-sell opportunities
export interface UpsellOpportunity {
  type: 'cabin_upgrade' | 'baggage' | 'seat_selection' | 'insurance' | 'hotel_bundle' | 'car_rental' | 'lounge_access' | 'priority_boarding';
  relevance: number; // 0-1 score
  message: string;
  priceImpact: string;
}

/**
 * Analyze customer behavior from conversation
 */
export function analyzeCustomerBehavior(
  messages: { role: string; content: string }[],
  currentMessage: string
): CustomerBehaviorProfile {
  const allText = [...messages.map(m => m.content), currentMessage].join(' ').toLowerCase();

  // Urgency detection
  let urgency: CustomerBehaviorProfile['urgency'] = 'researching';
  if (/\b(asap|urgent|emergency|today|tonight|tomorrow|need to fly|need to book now|last minute)\b/i.test(allText)) {
    urgency = 'immediate';
  } else if (/\b(compare|comparing|which is better|options|alternatives|looking around)\b/i.test(allText)) {
    urgency = 'comparison_shopping';
  } else if (/\b(not sure|undecided|thinking|maybe|might|could|considering)\b/i.test(allText)) {
    urgency = 'undecided';
  }

  // Budget detection
  let budget: CustomerBehaviorProfile['budget'] = 'unknown';
  if (/\b(cheapest|cheap|budget|affordable|lowest|save money|economical|discount)\b/i.test(allText)) {
    budget = 'price_sensitive';
  } else if (/\b(best value|good deal|reasonable|fair price|worth it)\b/i.test(allText)) {
    budget = 'value_focused';
  } else if (/\b(business class|premium|comfort|upgrade|better seats|extra legroom)\b/i.test(allText)) {
    budget = 'premium';
  } else if (/\b(first class|luxury|5 star|five star|suite|vip|exclusive)\b/i.test(allText)) {
    budget = 'luxury';
  }

  // Travel purpose detection
  let travelPurpose: CustomerBehaviorProfile['travelPurpose'] = 'unknown';
  if (/\b(business|meeting|conference|work|corporate|client)\b/i.test(allText)) {
    travelPurpose = 'business';
  } else if (/\b(honeymoon|anniversary|romantic|couple|wedding)\b/i.test(allText)) {
    travelPurpose = 'romantic';
  } else if (/\b(family|kids|children|parents|relatives)\b/i.test(allText)) {
    travelPurpose = 'family';
  } else if (/\b(adventure|hiking|trekking|exploring|safari|backpacking)\b/i.test(allText)) {
    travelPurpose = 'adventure';
  } else if (/\b(vacation|holiday|relax|getaway|break|fun)\b/i.test(allText)) {
    travelPurpose = 'leisure';
  }

  // Decision maker detection
  let decisionMaker: CustomerBehaviorProfile['decisionMaker'] = 'unknown';
  if (/\b(just me|myself|solo|alone|i'm)\b/i.test(allText)) {
    decisionMaker = 'sole';
  } else if (/\b(we|us|our|partner|spouse|wife|husband|they)\b/i.test(allText)) {
    decisionMaker = 'shared';
  }

  // Experience level detection
  let experience: CustomerBehaviorProfile['experience'] = 'occasional';
  if (/\b(first time|never been|new to|don't know how)\b/i.test(allText)) {
    experience = 'first_time';
  } else if (/\b(frequent flyer|always fly|travel a lot|expert|know the route)\b/i.test(allText)) {
    experience = 'expert';
  }

  // Emotional state detection
  let emotionalState: CustomerBehaviorProfile['emotionalState'] = 'neutral';
  if (/\b(excited|can't wait|looking forward|amazing|wonderful|so excited)\b/i.test(allText)) {
    emotionalState = 'excited';
  } else if (/\b(stressed|worried|anxious|concerned|urgent|problem)\b/i.test(allText)) {
    emotionalState = 'stressed';
  } else if (/\b(frustrated|annoyed|angry|terrible|awful|disappointed)\b/i.test(allText)) {
    emotionalState = 'frustrated';
  } else if (/\b(confused|overwhelmed|too many options|don't know what)\b/i.test(allText)) {
    emotionalState = 'overwhelmed';
  }

  // Engagement level - based on message length and specificity
  const avgMessageLength = messages.reduce((sum, m) => sum + m.content.length, 0) / Math.max(messages.length, 1);
  let engagementLevel: CustomerBehaviorProfile['engagementLevel'] = 'medium';
  if (avgMessageLength > 100 || messages.length > 5) {
    engagementLevel = 'high';
  } else if (avgMessageLength < 30 && messages.length < 3) {
    engagementLevel = 'low';
  }

  return {
    urgency,
    budget,
    travelPurpose,
    decisionMaker,
    experience,
    emotionalState,
    engagementLevel
  };
}

/**
 * Determine current conversion stage
 */
export function determineConversionStage(
  messages: { role: string; content: string }[],
  hasSearchResults: boolean,
  hasSelectedOption: boolean
): ConversionStage {
  const lastUserMessages = messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Check for purchase intent indicators
  if (/\b(book it|book this|book now|confirm|proceed|pay|payment|checkout|complete)\b/.test(lastUserMessages)) {
    return 'purchase';
  }

  // Check for evaluation stage
  if (/\b(refund|cancellation policy|what if|cancel|change|modify|insurance)\b/.test(lastUserMessages)) {
    return 'evaluation';
  }

  // Check for intent stage
  if (/\b(this one|i'll take|i want|let's go with|select|choose this|sounds good|perfect)\b/.test(lastUserMessages)) {
    return 'intent';
  }

  // Check for consideration stage
  if (/\b(compare|difference|which|better|versus|vs|or|options|alternatives)\b/.test(lastUserMessages) || hasSearchResults) {
    return 'consideration';
  }

  // Check for interest stage
  if (/\b(how much|price|cost|available|when|where|details|tell me more)\b/.test(lastUserMessages)) {
    return 'interest';
  }

  return 'awareness';
}

/**
 * Generate human-like, conversion-optimized response
 */
export function generateConversionResponse(
  stage: ConversionStage,
  behavior: CustomerBehaviorProfile,
  context: {
    agentName: string;
    serviceName: string;
    price?: string;
    destination?: string;
  }
): string {
  const { agentName, serviceName, price, destination } = context;

  // Emotional mirroring phrases
  const excitedMirroring = ["How exciting!", "That sounds wonderful!", "Oh, what a great choice!"];
  const stressedComfort = ["Don't worry, I've got you covered.", "I understand, let me help make this easy.", "No pressure at all - we'll figure this out together."];
  const neutralWarm = ["Great!", "Perfect!", "Sounds good!"];

  // Select appropriate phrase based on emotional state
  let emotionalResponse = '';
  if (behavior.emotionalState === 'excited') {
    emotionalResponse = excitedMirroring[Math.floor(Math.random() * excitedMirroring.length)];
  } else if (behavior.emotionalState === 'stressed' || behavior.emotionalState === 'overwhelmed') {
    emotionalResponse = stressedComfort[Math.floor(Math.random() * stressedComfort.length)];
  }

  // Stage-specific conversion tactics
  switch (stage) {
    case 'awareness':
      return generateAwarenessResponse(behavior, context);
    case 'interest':
      return generateInterestResponse(behavior, context);
    case 'consideration':
      return generateConsiderationResponse(behavior, context);
    case 'intent':
      return generateIntentResponse(behavior, context);
    case 'evaluation':
      return generateEvaluationResponse(behavior, context);
    case 'purchase':
      return generatePurchaseResponse(behavior, context);
    default:
      return '';
  }
}

function generateAwarenessResponse(
  behavior: CustomerBehaviorProfile,
  context: { agentName: string; serviceName: string }
): string {
  const responses = {
    business: "I specialize in business travel - I know time is money. Let me find you efficient options with flexible policies.",
    leisure: "Vacation planning is my favorite! Tell me about your dream trip and I'll make it happen.",
    family: "Family trips are so special! I'll find options that work for everyone - including kid-friendly amenities.",
    romantic: "A romantic getaway! Let me find something magical for you two.",
    adventure: "Adventure awaits! I love finding unique experiences off the beaten path.",
    unknown: "I'd love to help you plan the perfect trip! What kind of experience are you looking for?"
  };

  return responses[behavior.travelPurpose];
}

function generateInterestResponse(
  behavior: CustomerBehaviorProfile,
  context: { agentName: string; serviceName: string; price?: string; destination?: string }
): string {
  if (behavior.budget === 'price_sensitive') {
    return `Great news! I've found some excellent deals that won't break the bank. The best part? These prices include everything you need.`;
  } else if (behavior.budget === 'luxury') {
    return `I've curated some exceptional options for you - only the finest ${context.serviceName} with premium amenities and exclusive perks.`;
  }

  return `I have some fantastic ${context.serviceName} options to show you! Each one has been selected based on what you're looking for.`;
}

function generateConsiderationResponse(
  behavior: CustomerBehaviorProfile,
  context: { agentName: string; serviceName: string }
): string {
  // Social proof + scarcity
  const scarcityPhrases = [
    "These prices won't last long - I'm seeing availability dropping quickly.",
    "Just so you know, this particular option is quite popular right now.",
    "I should mention - at this price point, these tend to sell fast."
  ];

  const socialProof = [
    "This is actually one of our most-booked options - customers love it!",
    "I've had several travelers book this exact same itinerary this week.",
    "This has excellent reviews from travelers just like you."
  ];

  const phrase = behavior.urgency === 'comparison_shopping'
    ? socialProof[Math.floor(Math.random() * socialProof.length)]
    : scarcityPhrases[Math.floor(Math.random() * scarcityPhrases.length)];

  return phrase;
}

function generateIntentResponse(
  behavior: CustomerBehaviorProfile,
  context: { agentName: string; serviceName: string; price?: string }
): string {
  // Reinforce the decision + ease concerns
  const reinforcement = [
    "Excellent choice! You're going to have an amazing experience.",
    "Perfect! This is honestly one of the best options available right now.",
    "Great decision! I'm genuinely excited for you."
  ];

  const base = reinforcement[Math.floor(Math.random() * reinforcement.length)];

  if (behavior.decisionMaker === 'shared') {
    return `${base} And don't worry - if plans change, we have flexible options available.`;
  }

  return `${base} Let me get this secured for you right away!`;
}

function generateEvaluationResponse(
  behavior: CustomerBehaviorProfile,
  context: { agentName: string; serviceName: string }
): string {
  // Address concerns proactively
  return "Great question! I want you to feel 100% confident. Here's what you should know: we offer flexible booking options, and I'm here to help if anything changes. Your peace of mind is my priority.";
}

function generatePurchaseResponse(
  behavior: CustomerBehaviorProfile,
  context: { agentName: string; serviceName: string }
): string {
  // Celebrate + set expectations
  const celebrations = [
    "Congratulations! Your trip is coming together beautifully!",
    "Wonderful! I'm so happy to be part of your journey!",
    "Fantastic! This is going to be such a memorable experience!"
  ];

  return celebrations[Math.floor(Math.random() * celebrations.length)];
}

/**
 * Identify upsell opportunities based on context
 */
export function identifyUpsellOpportunities(
  behavior: CustomerBehaviorProfile,
  serviceType: 'flight' | 'hotel',
  searchParams: any
): UpsellOpportunity[] {
  const opportunities: UpsellOpportunity[] = [];

  if (serviceType === 'flight') {
    // Cabin upgrade for business travelers or luxury budget
    if (behavior.travelPurpose === 'business' || behavior.budget === 'premium' || behavior.budget === 'luxury') {
      opportunities.push({
        type: 'cabin_upgrade',
        relevance: 0.9,
        message: "Upgrade to Business Class for a more comfortable, productive flight - extra legroom, lie-flat seats, and premium service.",
        priceImpact: "+$500-2000"
      });
    }

    // Baggage for families
    if (behavior.travelPurpose === 'family') {
      opportunities.push({
        type: 'baggage',
        relevance: 0.95,
        message: "With the family traveling, you might want to add checked bags - I can bundle them at a discount!",
        priceImpact: "+$35-60 per bag"
      });
    }

    // Seat selection for everyone
    opportunities.push({
      type: 'seat_selection',
      relevance: 0.7,
      message: "Want to choose your seats now? I can help you get the best available!",
      priceImpact: "+$15-50 per seat"
    });

    // Insurance for first-timers and families
    if (behavior.experience === 'first_time' || behavior.travelPurpose === 'family') {
      opportunities.push({
        type: 'insurance',
        relevance: 0.85,
        message: "Travel insurance gives you peace of mind - coverage for delays, cancellations, and medical emergencies.",
        priceImpact: "+$30-100"
      });
    }

    // Lounge access for business
    if (behavior.travelPurpose === 'business') {
      opportunities.push({
        type: 'lounge_access',
        relevance: 0.8,
        message: "Skip the crowded terminal! Airport lounge access includes WiFi, refreshments, and a quiet workspace.",
        priceImpact: "+$50-75"
      });
    }
  }

  if (serviceType === 'hotel') {
    // Car rental bundle
    opportunities.push({
      type: 'car_rental',
      relevance: 0.7,
      message: "Need a car at your destination? I can bundle a rental with your hotel for extra savings!",
      priceImpact: "+$40-100/day"
    });
  }

  // Sort by relevance
  return opportunities.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Generate natural, human-like filler phrases
 */
export function getHumanFiller(type: 'thinking' | 'searching' | 'calculating' | 'confirming'): string {
  const fillers = {
    thinking: [
      "Let me see...",
      "Hmm, one moment...",
      "Let me check that for you...",
      "Good question! Let me look into that...",
      "Okay, let me pull that up..."
    ],
    searching: [
      "Searching now... this'll just take a second!",
      "Let me find the best options for you...",
      "Running my search across all our partners...",
      "Looking for the perfect match..."
    ],
    calculating: [
      "Let me crunch those numbers...",
      "Working out the best deal for you...",
      "Just calculating the total..."
    ],
    confirming: [
      "Perfect, let me confirm that...",
      "Great choice! Just double-checking availability...",
      "Excellent! Let me lock that in for you..."
    ]
  };

  const options = fillers[type];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate urgency messages (ethical scarcity)
 */
export function generateUrgencyMessage(
  seatsAvailable?: number,
  roomsAvailable?: number,
  priceIncreasing?: boolean
): string | null {
  if (seatsAvailable !== undefined && seatsAvailable <= 4) {
    return `Only ${seatsAvailable} seats left at this price!`;
  }

  if (roomsAvailable !== undefined && roomsAvailable <= 3) {
    return `Just ${roomsAvailable} rooms remaining at this rate!`;
  }

  if (priceIncreasing) {
    return "Prices for this route typically increase as the departure date approaches.";
  }

  return null;
}

/**
 * Generate personalized call-to-action
 */
export function generateCTA(
  stage: ConversionStage,
  behavior: CustomerBehaviorProfile
): string {
  if (stage === 'awareness' || stage === 'interest') {
    if (behavior.urgency === 'immediate') {
      return "Ready to book? I can have this confirmed in under 2 minutes!";
    }
    return "Would you like me to search for options, or do you have more questions?";
  }

  if (stage === 'consideration') {
    if (behavior.budget === 'price_sensitive') {
      return "Want me to hold this price for you while you decide?";
    }
    return "Which of these catches your eye? I can give you more details on any of them!";
  }

  if (stage === 'intent') {
    return "Ready to book this? I just need a few details to secure your reservation!";
  }

  if (stage === 'evaluation') {
    return "Any other questions before we finalize? I want you to feel completely confident!";
  }

  return "How can I help you today?";
}

/**
 * Match communication style to customer
 */
export function getAdaptedTone(behavior: CustomerBehaviorProfile): {
  formality: 'casual' | 'professional' | 'warm';
  pace: 'quick' | 'detailed';
  emotionalExpression: 'high' | 'moderate' | 'reserved';
} {
  // Business travelers prefer professional, quick responses
  if (behavior.travelPurpose === 'business') {
    return {
      formality: 'professional',
      pace: 'quick',
      emotionalExpression: 'reserved'
    };
  }

  // Family/romantic travelers appreciate warmth
  if (behavior.travelPurpose === 'family' || behavior.travelPurpose === 'romantic') {
    return {
      formality: 'warm',
      pace: 'detailed',
      emotionalExpression: 'high'
    };
  }

  // First-time travelers need more detail
  if (behavior.experience === 'first_time') {
    return {
      formality: 'warm',
      pace: 'detailed',
      emotionalExpression: 'moderate'
    };
  }

  // Default casual, friendly approach
  return {
    formality: 'casual',
    pace: 'detailed',
    emotionalExpression: 'moderate'
  };
}

// Export context class for tracking
export { ConversationContext } from './conversation-context';
