/**
 * Small Talk Database
 * Casual conversation patterns and responses for natural interactions
 */

import { ConversationContext } from './conversation-context';

export interface SmallTalkPattern {
  patterns: RegExp[];
  responses: string[];
  category: 'weather' | 'time' | 'emotion' | 'casual' | 'affirmation' | 'concern';
}

/**
 * Database of small talk patterns and appropriate responses
 */
export const SMALL_TALK_PATTERNS: SmallTalkPattern[] = [
  // Weather
  {
    category: 'weather',
    patterns: [
      /nice (day|weather)/i,
      /beautiful (day|weather)/i,
      /lovely (day|weather)/i,
      /(cold|hot|warm|sunny|rainy) (today|out)/i
    ],
    responses: [
      "I hope you're enjoying it! 😊 What can I help you with today?",
      "Perfect day for planning a trip! ☀️ Where would you like to go?",
      "Indeed! 🌤️ Speaking of which, any travel plans in mind?",
      "Hope you're making the most of it! 😊 Now, what can I do for you?"
    ]
  },

  // Time-based
  {
    category: 'time',
    patterns: [
      /good (morning|afternoon|evening|night)/i,
      /it's (late|early)/i,
      /long day/i
    ],
    responses: [
      "I'm here whenever you need me! 😊 What brings you here?",
      "Perfect timing! What can I help you with?",
      "I'm always ready to help! What are you looking for?",
      "Glad you're here! How can I assist you today?"
    ]
  },

  // Emotions (positive)
  {
    category: 'emotion',
    patterns: [
      /i('m| am) (excited|happy|thrilled)/i,
      /can't wait/i,
      /looking forward/i,
      /so excited/i
    ],
    responses: [
      "That's amazing! 🎉 I love your energy! What are you excited about?",
      "Your enthusiasm is contagious! 😊 Tell me more!",
      "Wonderful! ✨ What are we planning?",
      "I can feel your excitement! 🌟 Let's make it happen! What do you need?"
    ]
  },

  // Emotions (tired/stressed)
  {
    category: 'emotion',
    patterns: [
      /i('m| am) (tired|exhausted|stressed|overwhelmed)/i,
      /need a (break|vacation)/i,
      /so tired/i,
      /long week/i
    ],
    responses: [
      "Sounds like you could use a getaway! 🌴 Let me help you escape!",
      "You deserve a break! ✈️ Where would you like to unwind?",
      "A vacation might be just what you need! 😊 Where should we send you?",
      "Let's get you somewhere relaxing! 🏖️ What sounds good to you?"
    ]
  },

  // Casual affirmations
  {
    category: 'affirmation',
    patterns: [
      /^(ok|okay|sure|yeah|yes|yep|yup|sounds good|alright)$/i,
      /that works/i,
      /perfect/i
    ],
    responses: [
      "Great! 😊 What's next?",
      "Awesome! What can I do for you?",
      "Perfect! How can I help?",
      "Wonderful! What do you need?"
    ]
  },

  // Concern/questions
  {
    category: 'concern',
    patterns: [
      /is (this|it) (safe|secure)/i,
      /can i trust/i,
      /worried about/i,
      /concerned/i
    ],
    responses: [
      "Absolutely! We prioritize your safety and security. 🔒 What are you concerned about?",
      "Great question! Your security is our top priority. What would you like to know?",
      "I understand your concern. We take security very seriously. How can I help ease your mind?",
      "Your safety matters to us! 🛡️ What questions do you have?"
    ]
  },

  // Casual pleasantries
  {
    category: 'casual',
    patterns: [
      /have a (good|great|nice) (day|evening|weekend)/i,
      /(you too|same to you)/i,
      /take care/i,
      /stay safe/i
    ],
    responses: [
      "Thank you so much! 😊 You too! Anything else I can help with?",
      "That's so kind! 🌟 Same to you! Need anything else?",
      "Thanks! You're wonderful! 😊 Anything else?",
      "Appreciate it! You too! 🌟 Need any help?"
    ]
  }
];

/**
 * Get appropriate small talk response
 */
export function getSmallTalkResponse(
  message: string,
  consultant: { name: string; personality: string; emoji: string },
  context: ConversationContext
): string | null {
  // Try to match against patterns
  for (const pattern of SMALL_TALK_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(message)) {
        const response = selectResponse(pattern.responses, context);
        return response;
      }
    }
  }

  return null;
}

/**
 * Select a response that hasn't been used recently
 */
function selectResponse(responses: string[], context: ConversationContext): string {
  const recentResponses = context.getRecentInteractions(5);
  const availableResponses = responses.filter(
    response =>
      !recentResponses.some(interaction =>
        interaction.assistantResponse.toLowerCase().includes(response.toLowerCase())
      )
  );

  if (availableResponses.length === 0) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return availableResponses[Math.floor(Math.random() * availableResponses.length)];
}

/**
 * Check if message is likely small talk
 */
export function isSmallTalk(message: string): boolean {
  return SMALL_TALK_PATTERNS.some(pattern =>
    pattern.patterns.some(regex => regex.test(message))
  );
}

/**
 * Get conversation starters
 */
export function getConversationStarters(): string[] {
  return [
    "So, what adventure are we planning today?",
    "What brings you here? Looking for flights, hotels, or something else?",
    "Ready to explore? What can I help you with?",
    "Planning something exciting? Tell me more!",
    "What's on your travel wishlist?",
    "Where would you like to go?",
    "Need help with your travel plans?",
    "What kind of trip are you thinking about?"
  ];
}

/**
 * Get empathetic responses for different scenarios
 */
export const EMPATHETIC_RESPONSES = {
  frustration: [
    "I completely understand your frustration. Let me help make this easier for you.",
    "I hear you, and I'm so sorry about that. Let's fix this together.",
    "That must be really frustrating. I'm here to help sort it out.",
    "I get it, that's annoying! Let me see what I can do to help."
  ],
  urgency: [
    "I understand this is urgent. Let me help you right away!",
    "Got it, time is of the essence! I'm on it!",
    "I'll make this quick for you! What do you need?",
    "Absolutely, let's get this done fast! Tell me what you need."
  ],
  confusion: [
    "No worries at all! Let me explain that better.",
    "I can see how that might be confusing. Let me clarify!",
    "Great question! Let me break that down for you.",
    "I'm happy to explain! Here's what you need to know..."
  ],
  excitement: [
    "I love your excitement! Let's make this amazing!",
    "Your enthusiasm is fantastic! Let's do this!",
    "This is going to be great! I can feel your energy!",
    "I'm so excited for you! Let's make it perfect!"
  ],
  hesitation: [
    "Take your time! I'm here whenever you're ready.",
    "No rush at all! What questions can I answer?",
    "I'm here to help you feel confident. What are your concerns?",
    "It's totally okay to be unsure! What would help you decide?"
  ]
};

/**
 * Get empathetic response based on user emotion
 */
export function getEmpatheticResponse(
  emotion: keyof typeof EMPATHETIC_RESPONSES,
  consultant: { name: string; personality: string; emoji: string }
): string {
  const responses = EMPATHETIC_RESPONSES[emotion];
  return responses[Math.floor(Math.random() * responses.length)] + ' ' + consultant.emoji;
}

/**
 * Detect user emotion from message
 */
export function detectEmotion(message: string): keyof typeof EMPATHETIC_RESPONSES | null {
  const lowerMessage = message.toLowerCase();

  // Frustration
  if (
    /frustrated|annoyed|angry|terrible|awful|worst|hate|stupid|useless|not working|doesn't work|broken/i.test(
      lowerMessage
    )
  ) {
    return 'frustration';
  }

  // Urgency
  if (/asap|urgent|emergency|immediately|right now|today|hurry|quick/i.test(lowerMessage)) {
    return 'urgency';
  }

  // Confusion
  if (
    /confused|don't understand|not sure|unclear|what does|what is|how does|explain/i.test(
      lowerMessage
    )
  ) {
    return 'confusion';
  }

  // Excitement
  if (/excited|thrilled|can't wait|amazing|awesome|fantastic|perfect|love it/i.test(lowerMessage)) {
    return 'excitement';
  }

  // Hesitation
  if (/not sure|maybe|thinking|considering|hesitant|uncertain|doubt/i.test(lowerMessage)) {
    return 'hesitation';
  }

  return null;
}

/**
 * Get conversation enders
 */
export function getConversationEnders(): string[] {
  return [
    "Thanks for chatting! Safe travels! ✈️",
    "Have a wonderful day! Happy travels! 🌟",
    "Take care! Come back anytime! 😊",
    "Goodbye! Wishing you amazing adventures! 🎉",
    "Farewell! May your journeys be wonderful! ✨",
    "See you next time! Happy exploring! 🌍"
  ];
}
