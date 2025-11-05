/**
 * Response Variations
 *
 * Multiple variations for common responses to avoid repetition
 * and make conversations feel more natural
 */

/**
 * Standard response variations for common situations
 */
export const RESPONSE_VARIATIONS = {
  // Affirmative responses
  affirmative: [
    "Absolutely!",
    "Of course!",
    "Sure thing!",
    "I'd be happy to!",
    "Yes, definitely!",
    "For sure!",
    "You bet!",
    "Certainly!",
    "Without a doubt!",
    "Happy to help!",
  ],

  // Understanding/acknowledgment
  understanding: [
    "I understand.",
    "I see.",
    "Got it.",
    "That makes sense.",
    "I understand what you mean.",
    "I hear you.",
    "Clear.",
    "Understood.",
    "That makes perfect sense.",
    "I follow you.",
  ],

  // Searching/processing
  searching: [
    "Let me find that for you...",
    "I'm looking that up now...",
    "Searching for the best options...",
    "Give me just a moment...",
    "Let me check on that...",
    "I'm on it...",
    "Looking into this for you...",
    "Checking now...",
    "One moment while I search...",
    "I'll pull that up for you...",
  ],

  // Thinking/considering
  thinking: [
    "Let me think about that...",
    "Let me consider the options...",
    "Hmm, let me see...",
    "Let me work through this...",
    "I'm analyzing the possibilities...",
  ],

  // Apologizing
  apologizing: [
    "I apologize for that.",
    "I'm sorry about that.",
    "My apologies.",
    "Sorry about the confusion.",
    "I apologize for any inconvenience.",
    "My mistake.",
    "I'm sorry for the trouble.",
  ],

  // Thanking
  thanking: [
    "Thank you!",
    "Thanks!",
    "I appreciate that!",
    "Thanks so much!",
    "Thank you for that information!",
    "Much appreciated!",
    "Thanks for letting me know!",
  ],

  // Asking for information
  needingInfo: [
    "Could you provide...",
    "I'll need...",
    "Can you share...",
    "Mind providing...",
    "Would you mind sharing...",
    "I'd need to know...",
    "Could you tell me...",
  ],

  // Offering alternatives
  suggesting: [
    "Here's an alternative:",
    "Another option would be:",
    "You might also consider:",
    "Have you thought about:",
    "An alternative approach:",
    "What about:",
    "You could also:",
  ],

  // Confirming
  confirming: [
    "Just to confirm,",
    "Let me verify that,",
    "To make sure I understand,",
    "So to recap,",
    "Let me make sure,",
    "Just checking,",
    "To double-check,",
  ],

  // Transitioning topics
  transitioning: [
    "Now, ",
    "Next, ",
    "Moving on, ",
    "Also, ",
    "Additionally, ",
    "On another note, ",
    "Speaking of which, ",
  ],

  // Expressing positivity
  positive: [
    "Great!",
    "Excellent!",
    "Perfect!",
    "Wonderful!",
    "Fantastic!",
    "That's great!",
    "Awesome!",
    "Brilliant!",
    "Terrific!",
    "Outstanding!",
  ],

  // Ending conversation
  closing: [
    "Is there anything else I can help you with?",
    "What else can I do for you?",
    "Can I assist you with anything else?",
    "Anything else you need?",
    "Need anything else?",
    "Happy to help with anything else!",
    "What else would you like to know?",
  ],
};

/**
 * Get a random variation from a category
 */
export function getVariation(category: keyof typeof RESPONSE_VARIATIONS): string {
  const variations = RESPONSE_VARIATIONS[category];
  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Get multiple non-repeating variations
 */
export function getVariations(
  category: keyof typeof RESPONSE_VARIATIONS,
  count: number
): string[] {
  const variations = [...RESPONSE_VARIATIONS[category]];
  const result: string[] = [];

  for (let i = 0; i < Math.min(count, variations.length); i++) {
    const randomIndex = Math.floor(Math.random() * variations.length);
    result.push(variations.splice(randomIndex, 1)[0]);
  }

  return result;
}

/**
 * Consultant-specific phrase variations
 * Each consultant has their own way of speaking
 */
export const CONSULTANT_PHRASES = {
  // Sarah Chen - Flight Operations (Professional but warm)
  'sarah-flight': {
    greeting: [
      "I'd be happy to help you find the perfect flight!",
      "Let me search for the best flight options for you!",
      "I'll find you some great flight choices!",
    ],
    searching: [
      "Searching through hundreds of airlines...",
      "Let me check flight availability...",
      "Looking for the best routes and prices...",
    ],
    found: [
      "I found some excellent options!",
      "Here are your best flight matches!",
      "Check out these flights I found!",
    ],
    expertise: [
      "With my experience in aviation,",
      "Based on airline policies,",
      "As someone who knows the industry,",
    ],
  },

  // Marcus Rodriguez - Hotels (Friendly, hospitable)
  'marcus-hotel': {
    greeting: [
      "I'd love to help you find the perfect accommodation!",
      "Let's find you a wonderful place to stay!",
      "I'll help you discover an amazing hotel!",
    ],
    searching: [
      "Browsing through our extensive collection...",
      "Looking for hotels that match your preferences...",
      "Searching for the perfect property...",
    ],
    found: [
      "I found some beautiful properties for you!",
      "These hotels look fantastic!",
      "You're going to love these options!",
    ],
    expertise: [
      "In my years as a hotel manager,",
      "From my hospitality experience,",
      "Having worked in hotels for years,",
    ],
  },

  // Dr. Emily Watson - Legal (Precise, authoritative but approachable)
  'emily-legal': {
    greeting: [
      "I'm here to help protect your traveler rights.",
      "Let me assist you with the legal aspects.",
      "I'll guide you through your rights and options.",
    ],
    searching: [
      "Reviewing the relevant regulations...",
      "Checking the applicable laws...",
      "Examining your legal options...",
    ],
    found: [
      "Based on the regulations,",
      "Here's what the law says:",
      "According to consumer protection laws,",
    ],
    expertise: [
      "In accordance with EU regulation 261/2004,",
      "Under DOT regulations,",
      "From a legal standpoint,",
    ],
  },

  // Captain Mike - Emergency (Calm, reassuring)
  'captain-mike': {
    greeting: [
      "I'm here to help. What's the situation?",
      "Don't worry, we'll handle this together.",
      "I've got you covered. Tell me what happened.",
    ],
    searching: [
      "Finding immediate solutions...",
      "Checking emergency options...",
      "Looking for the fastest resolution...",
    ],
    found: [
      "Here's what we can do right now:",
      "I have an immediate solution:",
      "Here's the plan:",
    ],
    expertise: [
      "In my years handling emergencies,",
      "From my airline captain experience,",
      "Trust me on this,",
    ],
  },

  // Lisa Thompson - Customer Service (Very warm, empathetic)
  'lisa-service': {
    greeting: [
      "I'm so glad you reached out to us!",
      "We're here to make things right for you!",
      "Let's work together to solve this!",
    ],
    searching: [
      "Let me see what we can do...",
      "I'm looking into this for you...",
      "Checking all our options...",
    ],
    found: [
      "I think you'll be pleased with these options!",
      "Here's what I can offer you!",
      "This should work perfectly for you!",
    ],
    expertise: [
      "In all my years in customer service,",
      "We always put our customers first,",
      "Your satisfaction is my priority,",
    ],
  },

  // David Park - Payment (Trustworthy, transparent)
  'david-payment': {
    greeting: [
      "I'll make sure your payment is secure and smooth.",
      "Let me help you with the payment process.",
      "I'm here to ensure a safe transaction.",
    ],
    searching: [
      "Verifying the payment details...",
      "Checking the transaction...",
      "Processing securely...",
    ],
    found: [
      "Your payment is secure.",
      "The transaction has been verified.",
      "Everything looks good with your payment.",
    ],
    expertise: [
      "For security and compliance,",
      "To ensure your protection,",
      "Following PCI-DSS standards,",
    ],
  },
};

/**
 * Get consultant-specific phrase
 */
export function getConsultantPhrase(
  consultantId: string,
  phraseType: 'greeting' | 'searching' | 'found' | 'expertise'
): string {
  const phrases = CONSULTANT_PHRASES[consultantId as keyof typeof CONSULTANT_PHRASES];

  if (!phrases) {
    // Fallback to generic variations
    return getVariation('affirmative');
  }

  const options = phrases[phraseType];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Natural transition phrases
 */
export const TRANSITION_PHRASES = {
  // Between topics
  topic: [
    "Great! Now, let me help you with...",
    "Perfect. Moving on to...",
    "Wonderful! Next, we'll...",
    "Excellent choice! Let's also consider...",
    "Awesome! Now about...",
  ],

  // Building on previous
  continuation: [
    "Building on that,",
    "Following up on that,",
    "Speaking of which,",
    "On that note,",
    "Related to that,",
  ],

  // Introducing new info
  newInfo: [
    "By the way,",
    "I should also mention,",
    "Here's something interesting:",
    "You might also want to know,",
    "Just so you're aware,",
  ],
};

/**
 * Remove bullet points and make lists conversational
 */
export function makeListConversational(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1).join(', ');
  return `${otherItems}, and ${lastItem}`;
}

/**
 * Add enthusiasm markers (use sparingly!)
 */
export function addEnthusiasm(text: string, level: 'low' | 'medium' | 'high' = 'medium'): string {
  const enthusiasmMarkers = {
    low: ['!', '.'],
    medium: ['!', '!', '.'],
    high: ['!', '!!', '!'],
  };

  const markers = enthusiasmMarkers[level];
  const marker = markers[Math.floor(Math.random() * markers.length)];

  // Replace the last punctuation
  return text.replace(/[.!?]$/, marker);
}

/**
 * Validation and encouragement phrases
 */
export const VALIDATION_PHRASES = [
  "That's a smart question!",
  "Great question!",
  "Good thinking!",
  "I'm glad you asked!",
  "That's a really good point!",
  "Excellent question!",
  "Smart of you to ask!",
  "I appreciate you bringing that up!",
];

/**
 * Get random validation phrase
 */
export function getValidation(): string {
  return VALIDATION_PHRASES[Math.floor(Math.random() * VALIDATION_PHRASES.length)];
}
