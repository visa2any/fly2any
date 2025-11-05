/**
 * AI Conversation Enhancement - Usage Examples
 *
 * Real-world examples of how to use the conversation enhancement system
 */

import {
  processAIResponse,
  generateGreeting,
  generateSearchMessage,
  generateResultsMessage,
  generateClosingMessage,
  QuickResponses,
  createNaturalList,
  addTopicTransition,
  validateUserInput,
  detectUserEmotion,
} from './index';

// ============================================================================
// Example 1: Basic Flight Search Conversation
// ============================================================================

export function exampleFlightSearch() {
  console.log('\n=== Flight Search Example ===\n');

  // User: "Find me flights to Dubai"
  const greeting = generateGreeting('flight-operations', 'en', 'John');
  console.log('AI:', greeting);
  // "Good morning, John! I'm Sarah, your Flight Operations Specialist. I'll help you find and book the perfect flight."

  const searchMsg = generateSearchMessage('flight-operations', 'New York', 'Dubai');
  console.log('AI:', searchMsg);
  // "Let me find the best flights from New York to Dubai for you!"

  // After search completes
  const resultsMsg = generateResultsMessage('flight-operations', 12);
  console.log('AI:', resultsMsg);
  // "Wonderful! I found 12 excellent options for you!"

  // Presenting options
  const options = processAIResponse(
    "Here are the flight options. The cheapest is $450 with one stop. The fastest is $680 direct.",
    {
      consultantTeam: 'flight-operations',
      conversationLength: 3,
    }
  );
  console.log('AI:', options);
  // "Here's what I found: The cheapest option is $450 with one stop, and the fastest is a $680 direct flight."

  const closing = generateClosingMessage('flight-operations');
  console.log('AI:', closing);
  // "Is there anything else I can help you with?"
}

// ============================================================================
// Example 2: Handling Frustrated Customer
// ============================================================================

export function exampleFrustratedCustomer() {
  console.log('\n=== Frustrated Customer Example ===\n');

  const userMessage = "This is so frustrating! My flight was cancelled and I have a meeting tomorrow!";

  // Detect emotion
  const emotion = detectUserEmotion(userMessage);
  console.log('Detected emotion:', emotion); // 'frustrated' or 'urgent'

  // Respond with empathy
  const response = processAIResponse(
    "I will help you find an alternative flight immediately.",
    {
      consultantTeam: 'crisis-management',
      userMessage: userMessage,
      userName: 'Sarah',
    }
  );
  console.log('AI:', response);
  // "I understand this is time-sensitive. Don't worry, Sarah, we've got this. I'll help you find an alternative flight immediately."
}

// ============================================================================
// Example 3: Hotel Search with Personality
// ============================================================================

export function exampleHotelSearch() {
  console.log('\n=== Hotel Search Example ===\n');

  // Marcus (Hotel specialist) is warm and hospitable
  const greeting = generateGreeting('hotel-accommodations', 'en', 'Maria');
  console.log('AI:', greeting);

  const response = processAIResponse(
    "I found a 5-star hotel with spa, pool, and ocean view. The price is $200 per night.",
    {
      consultantTeam: 'hotel-accommodations',
      userName: 'Maria',
      conversationLength: 2,
    }
  );
  console.log('AI:', response);
  // "You're going to love this! I found a beautiful 5-star property with spa, pool, and ocean view. The rate is $200 per night."
}

// ============================================================================
// Example 4: Legal/Compliance Question
// ============================================================================

export function exampleLegalQuestion() {
  console.log('\n=== Legal Question Example ===\n');

  const userMessage = "Can I get compensation for my delayed flight?";

  const response = processAIResponse(
    "Under EU Regulation 261/2004, you are entitled to compensation if your flight is delayed more than 3 hours.",
    {
      consultantTeam: 'legal-compliance',
      userMessage: userMessage,
    }
  );
  console.log('AI:', response);
  // "According to EU Regulation 261/2004, you're entitled to compensation if your flight's delayed more than 3 hours."
}

// ============================================================================
// Example 5: Multi-Turn Conversation
// ============================================================================

export function exampleMultiTurnConversation() {
  console.log('\n=== Multi-Turn Conversation Example ===\n');

  let conversationState = {
    length: 0,
    lastTopic: null as string | null,
  };

  // Turn 1
  conversationState.length++;
  const turn1 = processAIResponse(
    "I can help you find flights. Where would you like to go?",
    {
      consultantTeam: 'flight-operations',
      isFirstMessage: true,
      conversationLength: conversationState.length,
    }
  );
  console.log('Turn 1:', turn1);
  conversationState.lastTopic = 'destination';

  // Turn 2
  conversationState.length++;
  const turn2 = processAIResponse(
    "Great choice! When would you like to travel?",
    {
      consultantTeam: 'flight-operations',
      previousTopic: conversationState.lastTopic,
      conversationLength: conversationState.length,
    }
  );
  console.log('Turn 2:', turn2);
  conversationState.lastTopic = 'dates';

  // Turn 3
  conversationState.length++;
  const turn3 = processAIResponse(
    "I found 10 flights for your dates. Would you prefer morning or evening departure?",
    {
      consultantTeam: 'flight-operations',
      previousTopic: conversationState.lastTopic,
      conversationLength: conversationState.length,
    }
  );
  console.log('Turn 3:', turn3);
}

// ============================================================================
// Example 6: Using Quick Responses
// ============================================================================

export function exampleQuickResponses() {
  console.log('\n=== Quick Responses Example ===\n');

  // User: "Can you help me?"
  console.log('AI:', QuickResponses.affirmative());
  // Random: "Absolutely!" | "Of course!" | "Sure thing!"

  // User: "Let me think about it"
  console.log('AI:', QuickResponses.acknowledge());
  // Random: "I understand." | "Got it." | "That makes sense."

  // Processing request
  console.log('AI:', QuickResponses.searching());
  // Random: "Let me find that for you..." | "I'm looking that up now..."

  // User provides information
  console.log('AI:', QuickResponses.thanks());
  // Random: "Thank you!" | "Thanks!" | "I appreciate that!"
}

// ============================================================================
// Example 7: Creating Natural Lists
// ============================================================================

export function exampleNaturalLists() {
  console.log('\n=== Natural Lists Example ===\n');

  const amenities = ['WiFi', 'breakfast', 'parking', 'pool', 'gym'];
  const naturalList = createNaturalList(amenities);

  const response = `This hotel includes ${naturalList}.`;
  console.log('AI:', response);
  // "This hotel includes WiFi, breakfast, parking, pool, and gym."

  // With enhancement
  const enhanced = processAIResponse(
    `This hotel includes ${naturalList}.`,
    { consultantTeam: 'hotel-accommodations' }
  );
  console.log('AI Enhanced:', enhanced);
}

// ============================================================================
// Example 8: Topic Transitions
// ============================================================================

export function exampleTopicTransitions() {
  console.log('\n=== Topic Transitions Example ===\n');

  // After booking flight, transition to hotel
  const transition1 = addTopicTransition(
    "let's find you a hotel",
    'flight-operations'
  );
  console.log('AI:', transition1);
  // "Perfect! Let's find you a hotel"

  // After hotel, transition to car rental
  const transition2 = addTopicTransition(
    "you might need a rental car",
    'hotel-accommodations'
  );
  console.log('AI:', transition2);
  // "Wonderful! You might need a rental car"
}

// ============================================================================
// Example 9: Validating User Input
// ============================================================================

export function exampleValidation() {
  console.log('\n=== Validation Example ===\n');

  const userQuestion = "What's the difference between economy and premium economy?";

  const answer = "Economy has standard seats while premium economy offers more legroom and better meals.";
  const validated = validateUserInput(answer);

  console.log('AI:', validated);
  // "That's a great question! Economy has standard seats while premium economy offers more legroom and better meals."
}

// ============================================================================
// Example 10: Payment Processing
// ============================================================================

export function examplePaymentProcessing() {
  console.log('\n=== Payment Processing Example ===\n');

  const response = processAIResponse(
    "Your payment of $450 has been processed. The transaction is secure and encrypted. Confirmation number is XYZ789.",
    {
      consultantTeam: 'payment-billing',
      userName: 'Alex',
    }
  );

  console.log('AI:', response);
  // "Your payment of $450 has been processed securely. The transaction's encrypted and protected. Your confirmation number is XYZ789."
}

// ============================================================================
// Example 11: Emergency Situation
// ============================================================================

export function exampleEmergency() {
  console.log('\n=== Emergency Situation Example ===\n');

  const userMessage = "HELP! My passport was stolen and my flight leaves in 3 hours!";

  const response = processAIResponse(
    "Contact the embassy immediately. I will hold your seat and help you rebook after you get emergency documents.",
    {
      consultantTeam: 'crisis-management',
      userMessage: userMessage,
    }
  );

  console.log('AI:', response);
  // "I understand this is urgent. Stay calm, we've got this. Contact the embassy immediately. I'll hold your seat and help you rebook after you get emergency documents."
}

// ============================================================================
// Example 12: Beginner vs Expert Audience
// ============================================================================

export function exampleAudienceLevel() {
  console.log('\n=== Audience Level Example ===\n');

  const technicalExplanation = "You need to utilize the GDS system to leverage dynamic pricing algorithms.";

  // For beginners
  const forBeginner = processAIResponse(technicalExplanation, {
    consultantTeam: 'technical-support',
    targetAudience: 'beginner',
  });
  console.log('For Beginner:', forBeginner);
  // "You need to use the booking system to use pricing tools."

  // For experts
  const forExpert = processAIResponse(technicalExplanation, {
    consultantTeam: 'technical-support',
    targetAudience: 'expert',
  });
  console.log('For Expert:', forExpert);
  // Keeps technical language intact
}

// ============================================================================
// Example 13: Loyalty Program Assistance
// ============================================================================

export function exampleLoyaltyProgram() {
  console.log('\n=== Loyalty Program Example ===\n');

  const response = processAIResponse(
    "You can maximize your points by booking this flight. You will earn 5,000 bonus points plus 2x miles.",
    {
      consultantTeam: 'loyalty-rewards',
      userName: 'Jennifer',
    }
  );

  console.log('AI:', response);
  // "You can maximize your value by booking this flight! You'll earn 5,000 bonus points plus 2x miles."
}

// ============================================================================
// Example 14: Special Services Request
// ============================================================================

export function exampleSpecialServices() {
  console.log('\n=== Special Services Example ===\n');

  const response = processAIResponse(
    "I will arrange wheelchair assistance for your flight and ensure accessible seating.",
    {
      consultantTeam: 'special-services',
      userName: 'Robert',
    }
  );

  console.log('AI:', response);
  // "I'll arrange wheelchair assistance for your flight and make sure you have accessible seating, Robert."
}

// ============================================================================
// Run All Examples
// ============================================================================

export function runAllExamples() {
  exampleFlightSearch();
  exampleFrustratedCustomer();
  exampleHotelSearch();
  exampleLegalQuestion();
  exampleMultiTurnConversation();
  exampleQuickResponses();
  exampleNaturalLists();
  exampleTopicTransitions();
  exampleValidation();
  examplePaymentProcessing();
  exampleEmergency();
  exampleAudienceLevel();
  exampleLoyaltyProgram();
  exampleSpecialServices();
}

// Uncomment to run examples:
// runAllExamples();
