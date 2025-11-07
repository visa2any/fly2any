/**
 * Comprehensive Error Handling & Edge Case System
 *
 * Ensures Fly2Any agents can handle ANY situation gracefully:
 * - API failures
 * - Invalid inputs
 * - Ambiguous requests
 * - Out-of-scope requests
 * - System errors
 * - Edge cases
 */

import type { TeamType } from './consultant-profiles';
import { FLY2ANY_BRAND, getOutOfScopeResponse } from './fly2any-brand-identity';

export type ErrorType =
  | 'api-failure'
  | 'invalid-input'
  | 'ambiguous-request'
  | 'out-of-scope'
  | 'no-results'
  | 'system-error'
  | 'rate-limit'
  | 'timeout'
  | 'authentication'
  | 'permission-denied';

export interface ErrorContext {
  type: ErrorType;
  originalRequest: string;
  consultant: TeamType;
  specificError?: string;
  suggestedAction?: string;
}

export interface ErrorResponse {
  message: string;
  suggestedActions: string[];
  canRetry: boolean;
  escalateToHuman?: boolean;
  alternativeOptions?: string[];
}

/**
 * Main error handling function
 * Routes to appropriate handler based on error type
 */
export function handleError(context: ErrorContext): ErrorResponse {
  switch (context.type) {
    case 'api-failure':
      return handleAPIFailure(context);
    case 'invalid-input':
      return handleInvalidInput(context);
    case 'ambiguous-request':
      return handleAmbiguousRequest(context);
    case 'out-of-scope':
      return handleOutOfScope(context);
    case 'no-results':
      return handleNoResults(context);
    case 'system-error':
      return handleSystemError(context);
    case 'rate-limit':
      return handleRateLimit(context);
    case 'timeout':
      return handleTimeout(context);
    case 'authentication':
      return handleAuthentication(context);
    case 'permission-denied':
      return handlePermissionDenied(context);
    default:
      return handleUnknownError(context);
  }
}

/**
 * API Failure Handler
 * When external flight/hotel APIs fail
 */
function handleAPIFailure(context: ErrorContext): ErrorResponse {
  const messages = {
    'flight-operations': [
      "I'm having trouble connecting to our flight search system right now. Let me try an alternative approach.",
      "Our primary flight search is temporarily unavailable. I can still help you - let me check our backup systems.",
      "The airline systems are responding slowly. This happens sometimes during peak booking hours. Give me a moment to find another way.",
    ],
    'hotel-accommodations': [
      "I'm experiencing a connection issue with our hotel inventory system. Don't worry - I have alternative ways to search.",
      "The hotel database is taking longer than usual to respond. Let me try our secondary search system.",
      "Our main hotel partner is having technical difficulties. I'll check our other 500+ hotel sources for you.",
    ],
    'default': [
      "I'm experiencing a technical issue with that service. Let me try a different approach.",
      "That system is temporarily unavailable, but I have backup options to help you.",
      "I encountered a connection problem. Give me just a moment to find an alternative solution.",
    ],
  };

  const consultantMessages = messages[context.consultant] || messages['default'];
  const message = consultantMessages[Math.floor(Math.random() * consultantMessages.length)];

  return {
    message,
    suggestedActions: [
      "Try the search again (sometimes it works on the second attempt)",
      "Search with slightly different criteria",
      "Contact our 24/7 support team at support@fly2any.com",
      "Try again in a few minutes",
    ],
    canRetry: true,
    escalateToHuman: false,
  };
}

/**
 * Invalid Input Handler
 * When user provides malformed data
 */
function handleInvalidInput(context: ErrorContext): ErrorResponse {
  // Detect what kind of invalid input
  const input = context.originalRequest.toLowerCase();

  // Invalid date
  if (/date|when|time|day/.test(input)) {
    return {
      message: "I didn't quite catch that date format. Could you try one of these?\n\n" +
               "• 'November 15' or 'Nov 15'\n" +
               "• '11/15/2025' or '11/15'\n" +
               "• 'Tomorrow' or 'Next Friday'\n" +
               "• 'In 2 weeks'",
      suggestedActions: [
        "Use format: 'November 15'",
        "Use format: '11/15/2025'",
        "Use relative dates: 'tomorrow', 'next week'",
      ],
      canRetry: true,
    };
  }

  // Invalid location
  if (/from|to|airport|city/.test(input)) {
    return {
      message: "I couldn't find that location in our system. Could you:\n\n" +
               "• Try the full city name (e.g., 'New York' instead of 'NY')\n" +
               "• Use the airport code (e.g., 'JFK', 'GRU', 'LHR')\n" +
               "• Check the spelling\n\n" +
               "Which city or airport are you looking for?",
      suggestedActions: [
        "Provide city name: 'New York', 'São Paulo'",
        "Provide airport code: 'JFK', 'GRU', 'LAX'",
        "Check spelling",
      ],
      canRetry: true,
    };
  }

  // Invalid passenger count
  if (/passenger|people|traveler/.test(input)) {
    return {
      message: "I need a valid passenger count. For example:\n\n" +
               "• '2 passengers' or '2 adults'\n" +
               "• '1 adult 2 children'\n" +
               "• 'Family of 4'\n\n" +
               "How many people will be traveling?",
      suggestedActions: [
        "Specify number: '2 passengers'",
        "Break down by age: '2 adults, 1 child'",
      ],
      canRetry: true,
    };
  }

  // Generic invalid input
  return {
    message: "I'm not sure I understood that correctly. Could you rephrase it?\n\n" +
             "I work best with:\n" +
             "• Clear dates: 'November 15 to November 20'\n" +
             "• Locations: 'from New York to São Paulo'\n" +
             "• Passenger counts: '2 adults'",
    suggestedActions: [
      "Rephrase your request",
      "Provide more details",
      "Break it into smaller parts",
    ],
    canRetry: true,
  };
}

/**
 * Ambiguous Request Handler
 * When user request is too vague
 */
function handleAmbiguousRequest(context: ErrorContext): ErrorResponse {
  const input = context.originalRequest.toLowerCase();

  // No destination specified
  if (!/(to|fly|going|visit|travel to)\s+[a-z]/i.test(input)) {
    return {
      message: "I'd love to help you travel! But I need a bit more information.\n\n" +
               "Where would you like to go? For example:\n" +
               "• 'I want to fly to Paris'\n" +
               "• 'Looking for hotels in Miami'\n" +
               "• 'Need a car rental in Los Angeles'\n\n" +
               "Or if you're not sure yet, I can help you explore options! What kind of trip are you planning?",
      suggestedActions: [
        "Tell me your destination",
        "Describe the type of trip (vacation, business, etc.)",
        "Share what you're looking for",
        "Ask me to help you choose a destination",
      ],
      canRetry: true,
    };
  }

  // No dates specified
  if (!/(on|date|when|tomorrow|next|nov|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|dec)/i.test(input)) {
    return {
      message: "Great! I can help with that. When are you planning to travel?\n\n" +
               "You can say:\n" +
               "• 'November 15' or 'Nov 15'\n" +
               "• 'Tomorrow' or 'Next Friday'\n" +
               "• 'In 2 weeks'\n" +
               "• 'I'm flexible'\n\n" +
               "What dates work for you?",
      suggestedActions: [
        "Provide specific dates",
        "Give a date range",
        "Say 'flexible' if you have flexibility",
      ],
      canRetry: true,
    };
  }

  // Generic ambiguity
  return {
    message: "I want to make sure I understand your needs correctly. Could you tell me:\n\n" +
             "1. **Where** do you want to go?\n" +
             "2. **When** do you want to travel?\n" +
             "3. **What** are you looking for? (flight, hotel, car, etc.)\n\n" +
             "Don't worry - you don't need to answer all at once! Let's start with what you know.",
    suggestedActions: [
      "Tell me your destination",
      "Share your travel dates",
      "Describe what you need",
    ],
    canRetry: true,
  };
}

/**
 * Out of Scope Handler
 * When user asks for services Fly2Any doesn't offer
 */
function handleOutOfScope(context: ErrorContext): ErrorResponse {
  const input = context.originalRequest.toLowerCase();

  // Detect what they're asking for
  let outOfScopeService = 'that service';

  if (/cruise|ship|boat/.test(input)) outOfScopeService = 'cruise bookings';
  if (/private jet|charter/.test(input)) outOfScopeService = 'private jet charters';
  if (/train|rail|amtrak/.test(input)) outOfScopeService = 'train bookings';
  if (/restaurant|dinner|table/.test(input)) outOfScopeService = 'restaurant reservations';
  if (/event|ticket|concert|show/.test(input)) outOfScopeService = 'event tickets';
  if (/tour|guide|excursion/.test(input)) outOfScopeService = 'tour packages';

  const message = `I appreciate your interest! However, ${outOfScopeService} isn't something we currently offer at Fly2Any.\n\n` +
                  `**What Fly2Any DOES offer:**\n` +
                  `✈️ Flights (300+ airlines)\n` +
                  `🏨 Hotels (1M+ properties)\n` +
                  `🚗 Car Rentals\n` +
                  `🛡️ Travel Insurance\n` +
                  `📄 Visa & Documentation\n` +
                  `🎁 Loyalty Rewards\n` +
                  `♿ Special Services\n` +
                  `🚨 24/7 Emergency Support\n\n` +
                  `Would any of these services help with your travel plans?`;

  return {
    message,
    suggestedActions: [
      "Explore our flight options",
      "Search for hotels",
      "Get help with visa requirements",
      "Learn about travel insurance",
    ],
    canRetry: false,
    alternativeOptions: [
      'flight booking',
      'hotel search',
      'car rental',
      'travel insurance',
    ],
  };
}

/**
 * No Results Handler
 * When search returns zero results
 */
function handleNoResults(context: ErrorContext): ErrorResponse {
  const consultant = context.consultant;

  if (consultant === 'flight-operations') {
    return {
      message: "I couldn't find any flights matching your exact criteria, but don't worry! Here are some options:\n\n" +
               "1. **Try nearby dates** - Sometimes flying one day earlier or later opens up great options\n" +
               "2. **Consider layovers** - If you searched for direct flights, flights with one short layover are often cheaper and still convenient\n" +
               "3. **Nearby airports** - Check airports within 50 miles of your destination\n" +
               "4. **Different cabin class** - Sometimes flexibility on class gives more options\n\n" +
               "Would you like me to search with any of these alternatives?",
      suggestedActions: [
        "Try different dates (±3 days)",
        "Include flights with layovers",
        "Check nearby airports",
        "Adjust cabin class",
      ],
      canRetry: true,
      alternativeOptions: [
        'flexible dates',
        'flights with layovers',
        'nearby airports',
      ],
    };
  }

  if (consultant === 'hotel-accommodations') {
    return {
      message: "I couldn't find available hotels matching your exact criteria in that area. Let's try:\n\n" +
               "1. **Expand the area** - Look in nearby neighborhoods\n" +
               "2. **Adjust your dates** - Sometimes one day shift makes a big difference\n" +
               "3. **Change filters** - Try different star ratings or amenities\n" +
               "4. **Alternative accommodations** - Consider vacation rentals or boutique hotels\n\n" +
               "What would you like me to try?",
      suggestedActions: [
        "Search nearby areas",
        "Try different dates",
        "Adjust filters (price, stars, amenities)",
        "See alternative options",
      ],
      canRetry: true,
      alternativeOptions: [
        'expand search area',
        'flexible dates',
        'different hotel types',
      ],
    };
  }

  return {
    message: "I couldn't find results for that exact search, but I have some ideas to help:\n\n" +
             "• Try broader search criteria\n" +
             "• Adjust your dates or location slightly\n" +
             "• Let me suggest popular alternatives\n\n" +
             "What would work best for you?",
    suggestedActions: [
      "Broaden search criteria",
      "Try different dates/locations",
      "Get recommendations",
    ],
    canRetry: true,
  };
}

/**
 * System Error Handler
 * When something goes wrong internally
 */
function handleSystemError(context: ErrorContext): ErrorResponse {
  return {
    message: "I apologize - I encountered an unexpected technical issue. This is on our end, not yours!\n\n" +
             "**What you can do:**\n" +
             "1. Try your request again in a moment\n" +
             "2. Rephrase your request\n" +
             "3. Contact our 24/7 support: support@fly2any.com\n\n" +
             "Our technical team has been automatically notified and is looking into it.",
    suggestedActions: [
      "Try again in a moment",
      "Rephrase your request",
      "Contact support@fly2any.com",
      "Try a different consultant",
    ],
    canRetry: true,
    escalateToHuman: true,
  };
}

/**
 * Rate Limit Handler
 * When user is making too many requests
 */
function handleRateLimit(context: ErrorContext): ErrorResponse {
  return {
    message: "Whoa there! 🚀 You're searching faster than our systems can keep up!\n\n" +
             "To ensure quality results for everyone, I need to ask you to **wait just 30 seconds** before your next search.\n\n" +
             "In the meantime:\n" +
             "• Review the results I've already shown you\n" +
             "• Refine your search criteria\n" +
             "• Take a quick break ☕\n\n" +
             "I'll be ready to help you again in a moment!",
    suggestedActions: [
      "Wait 30 seconds",
      "Review current results",
      "Refine your criteria",
    ],
    canRetry: true,
  };
}

/**
 * Timeout Handler
 * When request takes too long
 */
function handleTimeout(context: ErrorContext): ErrorResponse {
  return {
    message: "Your search is taking longer than expected. This sometimes happens when:\n\n" +
             "• Searching across many airlines/hotels simultaneously\n" +
             "• Peak booking times (lots of people searching)\n" +
             "• Complex multi-city routes\n\n" +
             "**Options:**\n" +
             "1. Keep waiting - I'm still searching in the background\n" +
             "2. Simplify your search (fewer filters, shorter date range)\n" +
             "3. Try again in a minute\n\n" +
             "What would you prefer?",
    suggestedActions: [
      "Wait a bit longer",
      "Simplify search criteria",
      "Try again shortly",
    ],
    canRetry: true,
  };
}

/**
 * Authentication Handler
 * When user needs to log in
 */
function handleAuthentication(context: ErrorContext): ErrorResponse {
  return {
    message: "To proceed with this action, you'll need to log in to your Fly2Any account.\n\n" +
             "**Why?**\n" +
             "We need to protect your personal information and booking details.\n\n" +
             "**What you can do:**\n" +
             "• Log in to your existing account\n" +
             "• Create a free Fly2Any account (takes 30 seconds)\n" +
             "• Continue browsing without logging in (booking requires login)\n\n" +
             "Would you like to log in or create an account?",
    suggestedActions: [
      "Log in to existing account",
      "Create new account",
      "Continue browsing (no booking)",
    ],
    canRetry: false,
  };
}

/**
 * Permission Denied Handler
 * When user doesn't have access to something
 */
function handlePermissionDenied(context: ErrorContext): ErrorResponse {
  return {
    message: "I don't have permission to access that information or perform that action.\n\n" +
             "This might be because:\n" +
             "• You need to be logged in\n" +
             "• This booking belongs to someone else\n" +
             "• Additional verification is required\n\n" +
             "**Next steps:**\n" +
             "1. Contact our support team: support@fly2any.com\n" +
             "2. They can verify your identity and grant access\n" +
             "3. Usually resolved within minutes!\n\n" +
             "Is there anything else I can help you with?",
    suggestedActions: [
      "Contact support for verification",
      "Log in to your account",
      "Try a different action",
    ],
    canRetry: false,
    escalateToHuman: true,
  };
}

/**
 * Unknown Error Handler
 * Fallback for unexpected errors
 */
function handleUnknownError(context: ErrorContext): ErrorResponse {
  return {
    message: "I encountered something unexpected! 🤔\n\n" +
             "I'm not quite sure what happened, but here's what we can do:\n\n" +
             "1. **Try again** - Sometimes it works on the second attempt\n" +
             "2. **Rephrase** - Say it a different way\n" +
             "3. **Contact support** - support@fly2any.com (24/7)\n\n" +
             "I've logged this issue so our team can investigate. Sorry for the inconvenience!",
    suggestedActions: [
      "Try again",
      "Rephrase your request",
      "Contact support@fly2any.com",
    ],
    canRetry: true,
    escalateToHuman: true,
  };
}

/**
 * Validate user input before processing
 * Returns error context if invalid, null if valid
 */
export function validateUserInput(input: string): ErrorContext | null {
  if (!input || input.trim().length === 0) {
    return {
      type: 'invalid-input',
      originalRequest: input,
      consultant: 'customer-service',
      specificError: 'Empty input',
      suggestedAction: 'Please provide your travel request',
    };
  }

  // Check for extremely long input (possible spam/attack)
  if (input.length > 5000) {
    return {
      type: 'invalid-input',
      originalRequest: input.substring(0, 100) + '...',
      consultant: 'customer-service',
      specificError: 'Input too long',
      suggestedAction: 'Please keep your message under 5000 characters',
    };
  }

  // Check for suspicious patterns (XSS, injection attempts)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /DROP TABLE/i,
    /SELECT \* FROM/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return {
        type: 'invalid-input',
        originalRequest: '[potentially malicious input]',
        consultant: 'customer-service',
        specificError: 'Invalid characters detected',
        suggestedAction: 'Please avoid special characters and scripts',
      };
    }
  }

  // Valid input
  return null;
}

/**
 * Check if request is ambiguous and needs clarification
 */
export function detectAmbiguousRequest(input: string): boolean {
  const lowerInput = input.toLowerCase().trim();

  // Too short
  if (lowerInput.length < 10) {
    return true;
  }

  // Generic/vague phrases
  const vaguePatterns = [
    /^help$/,
    /^hi$/,
    /^hello$/,
    /^i need help$/,
    /^i want to travel$/,
    /^i need a flight$/,
    /^i need a hotel$/,
    /^book/,
    /^search/,
  ];

  for (const pattern of vaguePatterns) {
    if (pattern.test(lowerInput)) {
      return true;
    }
  }

  // Missing critical information (destination AND dates)
  const hasDestination = /\b(to|in|at|visit)\s+[a-z]{3,}/i.test(input);
  const hasDates = /(on|date|when|tomorrow|next|today|\d{1,2}\/\d{1,2}|nov|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|dec)/i.test(input);

  if (!hasDestination && !hasDates) {
    return true;
  }

  return false;
}

/**
 * Check if request is out of scope
 */
export function detectOutOfScope(input: string): string | null {
  const outOfScopeKeywords = {
    cruise: ['cruise', 'ship', 'boat', 'sailing', 'carnival', 'royal caribbean'],
    'private jet': ['private jet', 'charter', 'netjets', 'private plane'],
    train: ['train', 'rail', 'amtrak', 'railway'],
    restaurant: ['restaurant reservation', 'dinner reservation', 'book a table'],
    event: ['event ticket', 'concert ticket', 'show ticket', 'tickets to'],
    tour: ['tour package', 'guided tour', 'tour operator', 'excursion'],
  };

  const lowerInput = input.toLowerCase();

  for (const [service, keywords] of Object.entries(outOfScopeKeywords)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        return service;
      }
    }
  }

  return null;
}

/**
 * Generate helpful suggestion when user seems stuck
 */
export function generateHelpfulSuggestion(conversationHistory: string[]): string {
  const suggestions = [
    "Not sure where to start? Try: 'I need a flight from NYC to Miami next week'",
    "You can ask me things like: 'Show me hotels in Paris for November 15-20'",
    "Need help planning? Tell me: 'I want to take a vacation but I'm not sure where'",
    "Looking for the best deal? Ask: 'What are the cheapest flights to Europe in December?'",
    "Have specific needs? Let me know: 'I need wheelchair assistance and special meals'",
  ];

  return suggestions[Math.floor(Math.random() * suggestions.length)];
}
