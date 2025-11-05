/**
 * Conversation Enhancement System
 *
 * Makes AI responses more natural, conversational, and human-like
 */

export type EmotionalState =
  | 'neutral'
  | 'excited'
  | 'confused'
  | 'frustrated'
  | 'satisfied'
  | 'urgent'
  | 'relaxed';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ConversationContext {
  isFirstMessage: boolean;
  previousTopic?: string;
  userEmotion: EmotionalState;
  timeOfDay: TimeOfDay;
  consultantTeam?: string;
  userName?: string;
  conversationLength: number; // Number of messages in conversation
  lastResponseTime?: Date;
}

/**
 * Main function to enhance response to sound more conversational
 */
export function enhanceConversation(
  response: string,
  context: ConversationContext
): string {
  let enhanced = response;

  // Add natural greeting for first messages
  if (context.isFirstMessage) {
    const greeting = getGreetingByTime(context.timeOfDay, context.userName);
    enhanced = `${greeting} ${enhanced}`;
  }

  // Add conversational markers (but not too many!)
  enhanced = addConversationalMarkers(enhanced, context);

  // Add personal touches based on context
  enhanced = addPersonalization(enhanced, context);

  // Ensure natural transitions
  enhanced = improveTransitions(enhanced, context);

  // Replace robotic phrases with natural ones
  enhanced = replaceRoboticPhrases(enhanced);

  // Add appropriate contractions
  enhanced = addContractions(enhanced);

  return enhanced;
}

/**
 * Get time-appropriate greeting
 */
function getGreetingByTime(timeOfDay: TimeOfDay, userName?: string): string {
  const namePrefix = userName ? `${userName}, ` : '';

  const greetings = {
    morning: [
      `Good morning${namePrefix ? ', ' + namePrefix : ''}!`,
      `Morning${namePrefix ? ', ' + namePrefix : ''}!`,
      `Hey${namePrefix ? ', ' + namePrefix : ''} - hope you're having a great morning!`,
    ],
    afternoon: [
      `Good afternoon${namePrefix ? ', ' + namePrefix : ''}!`,
      `Afternoon${namePrefix ? ', ' + namePrefix : ''}!`,
      `Hey${namePrefix ? ', ' + namePrefix : ''} - hope your day's going well!`,
    ],
    evening: [
      `Good evening${namePrefix ? ', ' + namePrefix : ''}!`,
      `Evening${namePrefix ? ', ' + namePrefix : ''}!`,
      `Hey${namePrefix ? ', ' + namePrefix : ''} - how's your evening?`,
    ],
    night: [
      `Hello${namePrefix ? ', ' + namePrefix : ''}!`,
      `Hey${namePrefix ? ', ' + namePrefix : ''}!`,
      `Hi there${namePrefix ? ', ' + namePrefix : ''}!`,
    ],
  };

  const options = greetings[timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Add conversational markers to make responses feel more natural
 */
function addConversationalMarkers(
  text: string,
  context: ConversationContext
): string {
  // Don't add markers too frequently - keep it professional
  const shouldAddMarker = Math.random() < 0.35;

  if (!shouldAddMarker) return text;

  // Choose markers based on emotional context
  const markers = getMarkersForEmotion(context.userEmotion);
  const marker = markers[Math.floor(Math.random() * markers.length)];

  // Insert marker at the beginning or naturally in the text
  if (text.startsWith('I ') || text.startsWith('Let ')) {
    return `${marker} ${text}`;
  }

  return text;
}

/**
 * Get appropriate conversational markers based on user's emotional state
 */
function getMarkersForEmotion(emotion: EmotionalState): string[] {
  const markers = {
    neutral: [
      "I'd be happy to help.",
      "Absolutely.",
      "Sure thing!",
      "Of course!",
      "I can definitely help with that.",
    ],
    excited: [
      "Fantastic!",
      "Wonderful!",
      "That's great!",
      "Excellent!",
      "Perfect!",
    ],
    confused: [
      "Let me clarify that for you.",
      "I understand - let me explain.",
      "Great question!",
      "I'm here to help you understand.",
      "Let me break that down for you.",
    ],
    frustrated: [
      "I completely understand your frustration.",
      "I'm sorry for the inconvenience.",
      "Let me help sort this out for you.",
      "I hear you, and I'm here to help.",
      "I appreciate your patience.",
    ],
    satisfied: [
      "I'm glad I could help!",
      "Wonderful!",
      "That's great to hear!",
      "Perfect!",
      "Excellent!",
    ],
    urgent: [
      "I'm on it right away.",
      "Let me prioritize this for you.",
      "I understand the urgency.",
      "I'll help you immediately.",
      "Let me handle this quickly.",
    ],
    relaxed: [
      "No rush at all!",
      "Take your time.",
      "We'll get this sorted out.",
      "Happy to help!",
      "Let's find the perfect option for you.",
    ],
  };

  return markers[emotion] || markers.neutral;
}

/**
 * Add personalization based on context
 */
function addPersonalization(
  text: string,
  context: ConversationContext
): string {
  let personalized = text;

  // Reference previous topics naturally
  if (context.previousTopic && context.conversationLength > 2) {
    const transitions = [
      `Building on what we discussed about ${context.previousTopic}, `,
      `Following up on ${context.previousTopic}, `,
      `As we talked about with ${context.previousTopic}, `,
    ];

    // Only add if it makes sense contextually (5% chance to keep it natural)
    if (Math.random() < 0.05) {
      const transition = transitions[Math.floor(Math.random() * transitions.length)];
      personalized = transition + personalized.charAt(0).toLowerCase() + personalized.slice(1);
    }
  }

  return personalized;
}

/**
 * Improve transitions between topics
 */
function improveTransitions(
  text: string,
  context: ConversationContext
): string {
  // Add natural transitions for longer conversations
  if (context.conversationLength > 3) {
    const transitionPhrases = [
      'Great! ',
      'Perfect! ',
      'Wonderful! ',
      'Excellent! ',
      'Fantastic! ',
    ];

    // Add transition occasionally (20% chance)
    if (Math.random() < 0.2 && !text.match(/^(Great|Perfect|Wonderful|Excellent|Fantastic)/)) {
      const transition = transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];
      return transition + text;
    }
  }

  return text;
}

/**
 * Replace robotic phrases with natural alternatives
 */
function replaceRoboticPhrases(text: string): string {
  const replacements: Record<string, string[]> = {
    'I will search for': [
      "I'll find",
      "Let me look for",
      "I'll search for",
      "Let me find",
    ],
    'I will help you': [
      "I'll help you",
      "I'd be happy to help you",
      "Let me help you",
    ],
    'Here are the': [
      "Here are your",
      "I found these",
      "Check out these",
      "Here's what I found:",
    ],
    'Do you need assistance': [
      "Is there anything else I can help you with",
      "Can I help you with anything else",
      "What else can I help you with",
      "Need anything else",
    ],
    'I have found': [
      "I found",
      "I've found",
      "I discovered",
    ],
    'I recommend': [
      "I'd suggest",
      "I think you'll like",
      "You might want to consider",
      "I'd recommend",
    ],
    'Please provide': [
      "Could you provide",
      "I'll need",
      "Can you share",
      "Mind sharing",
    ],
    'Thank you for': [
      "Thanks for",
      "I appreciate",
      "Thank you for",
    ],
  };

  let enhanced = text;

  for (const [robotic, natural] of Object.entries(replacements)) {
    const regex = new RegExp(robotic, 'gi');
    if (regex.test(enhanced)) {
      const replacement = natural[Math.floor(Math.random() * natural.length)];
      enhanced = enhanced.replace(regex, replacement);
    }
  }

  return enhanced;
}

/**
 * Add appropriate contractions to make text more conversational
 */
function addContractions(text: string): string {
  const contractions: Record<string, string> = {
    'I will': "I'll",
    'I would': "I'd",
    'I have': "I've",
    'you will': "you'll",
    'you would': "you'd",
    'you have': "you've",
    'we will': "we'll",
    'we would': "we'd",
    'we have': "we've",
    'that is': "that's",
    'it is': "it's",
    'there is': "there's",
    'what is': "what's",
    'who is': "who's",
    'cannot': "can't",
    'do not': "don't",
    'does not': "doesn't",
    'did not': "didn't",
    'will not': "won't",
    'would not': "wouldn't",
    'should not': "shouldn't",
    'could not': "couldn't",
  };

  let contracted = text;

  for (const [full, contraction] of Object.entries(contractions)) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    contracted = contracted.replace(regex, (match) => {
      // Preserve the case of the first letter
      if (match[0] === match[0].toUpperCase()) {
        return contraction.charAt(0).toUpperCase() + contraction.slice(1);
      }
      return contraction;
    });
  }

  return contracted;
}

/**
 * Get current time of day
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Detect user emotion from their message
 */
export function detectUserEmotion(message: string): EmotionalState {
  const lowerMessage = message.toLowerCase();

  // Check for urgent keywords
  if (
    lowerMessage.includes('urgent') ||
    lowerMessage.includes('asap') ||
    lowerMessage.includes('immediately') ||
    lowerMessage.includes('emergency')
  ) {
    return 'urgent';
  }

  // Check for frustration
  if (
    lowerMessage.includes('frustrated') ||
    lowerMessage.includes('annoying') ||
    lowerMessage.includes('problem') ||
    lowerMessage.includes('issue') ||
    lowerMessage.includes('not working')
  ) {
    return 'frustrated';
  }

  // Check for confusion
  if (
    lowerMessage.includes('confused') ||
    lowerMessage.includes('don\'t understand') ||
    lowerMessage.includes('not sure') ||
    lowerMessage.includes('help me understand') ||
    lowerMessage.includes('?') && message.split('?').length > 2
  ) {
    return 'confused';
  }

  // Check for excitement
  if (
    lowerMessage.includes('excited') ||
    lowerMessage.includes('amazing') ||
    lowerMessage.includes('great!') ||
    lowerMessage.includes('perfect!') ||
    lowerMessage.includes('wonderful')
  ) {
    return 'excited';
  }

  // Check for satisfaction
  if (
    lowerMessage.includes('thank') ||
    lowerMessage.includes('appreciate') ||
    lowerMessage.includes('helpful') ||
    lowerMessage.includes('exactly what i needed')
  ) {
    return 'satisfied';
  }

  // Check for relaxed state
  if (
    lowerMessage.includes('no rush') ||
    lowerMessage.includes('whenever') ||
    lowerMessage.includes('flexible') ||
    lowerMessage.includes('browsing')
  ) {
    return 'relaxed';
  }

  return 'neutral';
}

/**
 * Add empathy to responses when appropriate
 */
export function addEmpathy(text: string, emotion: EmotionalState): string {
  if (emotion === 'frustrated') {
    const empathyPhrases = [
      "I understand that can be frustrating. ",
      "I can see why that would be frustrating. ",
      "I'm sorry you're experiencing this. ",
      "I completely understand your frustration. ",
    ];
    const phrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    return phrase + text;
  }

  if (emotion === 'urgent') {
    const urgencyPhrases = [
      "I understand this is time-sensitive. ",
      "I'll prioritize this for you right away. ",
      "I know time is of the essence here. ",
    ];
    const phrase = urgencyPhrases[Math.floor(Math.random() * urgencyPhrases.length)];
    return phrase + text;
  }

  return text;
}

/**
 * Vary sentence structure to avoid repetition
 */
export function varyStructure(text: string): string {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  if (sentences.length < 2) return text;

  // Check if sentences start too similarly
  const starts = sentences.map(s => s.trim().split(' ')[0]);
  const repetition = starts.filter((s, i) => i > 0 && s === starts[i - 1]).length;

  // If too much repetition, we should vary
  if (repetition > 1) {
    // This would need more sophisticated logic in a real implementation
    // For now, just a basic check
  }

  return text;
}
