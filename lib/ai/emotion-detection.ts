/**
 * Emotion Detection System for AI Travel Assistant
 *
 * This module detects emotional states from user messages and provides
 * appropriate response strategies to make the AI more empathetic and responsive.
 */

import type { TeamType } from './consultant-profiles';

export type EmotionalState =
  | 'frustrated'
  | 'confused'
  | 'excited'
  | 'worried'
  | 'satisfied'
  | 'urgent'
  | 'casual'
  | 'neutral';

export interface EmotionAnalysis {
  emotion: EmotionalState;
  confidence: number; // 0-1
  urgency: 'low' | 'medium' | 'high';
  keywords: string[];
  responseStrategy: 'reassuring' | 'enthusiastic' | 'professional' | 'empathetic';
  typingSpeedMultiplier: number; // e.g., 1.5 for 50% faster, 0.8 for 20% slower
  priority: 'low' | 'medium' | 'high';
}

interface EmotionPattern {
  keywords: RegExp[];
  emotion: EmotionalState;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  responseStrategy: 'reassuring' | 'enthusiastic' | 'professional' | 'empathetic';
  typingSpeedMultiplier: number;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Emotion detection patterns
 * Patterns are checked in order of priority (urgent/frustrated first)
 */
const EMOTION_PATTERNS: EmotionPattern[] = [
  // URGENT/EMERGENCY - Highest priority
  {
    keywords: [
      /\b(urgent|emergency|asap|immediately|right now|hurry|quick)\b/i,
      /\b(help|lost|cancelled|stranded|stuck|trapped)\b/i,
      /\b(flight.{0,20}(cancel|delay)|delay.{0,20}flight)\b/i,
      /\b(need.{0,10}now|happening now)\b/i,
    ],
    emotion: 'urgent',
    confidence: 0.9,
    urgency: 'high',
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.5,
    priority: 'high',
  },

  // FRUSTRATED/ANGRY - High priority
  {
    keywords: [
      /\b(frustrated|angry|upset|mad|furious|annoyed)\b/i,
      /\b(terrible|worst|horrible|awful|pathetic|ridiculous)\b/i,
      /\b(hate|can't stand|fed up|sick of|tired of)\b/i,
      /\b(unacceptable|disappointing|disaster|nightmare)\b/i,
      /\b(what the (hell|heck|fuck)|wtf|seriously\?!)\b/i,
      /\b(this is (crazy|insane|stupid|wrong))\b/i,
    ],
    emotion: 'frustrated',
    confidence: 0.85,
    urgency: 'high',
    responseStrategy: 'empathetic',
    typingSpeedMultiplier: 1.3,
    priority: 'high',
  },

  // WORRIED/ANXIOUS - Medium-high priority
  {
    keywords: [
      /\b(worried|concerned|anxious|nervous|scared|afraid)\b/i,
      /\b(what if|concerned about|worry about)\b/i,
      /\b(safe|safety|secure|security|risk)\b/i,
      /\b(problem|issue|trouble|complication)\b/i,
      /\b(hope (everything|it)|please (help|confirm))\b/i,
    ],
    emotion: 'worried',
    confidence: 0.75,
    urgency: 'medium',
    responseStrategy: 'reassuring',
    typingSpeedMultiplier: 1.0,
    priority: 'medium',
  },

  // CONFUSED - Medium priority
  {
    keywords: [
      /\b(confused|don't understand|unclear|lost|not sure)\b/i,
      /\b(what (does|is|do|are)|how (do|does|can|to))\b/i,
      /\b(explain|clarify|mean|help me understand)\b/i,
      /\b(\?\?|what\?|huh\?|confused about)\b/i,
      /\b(can you (explain|clarify|help))\b/i,
    ],
    emotion: 'confused',
    confidence: 0.75,
    urgency: 'medium',
    responseStrategy: 'reassuring',
    typingSpeedMultiplier: 0.9,
    priority: 'medium',
  },

  // EXCITED/HAPPY - Low-medium priority
  {
    keywords: [
      /\b(excited|thrilled|amazing|perfect|awesome|wonderful)\b/i,
      /\b(great|fantastic|excellent|brilliant|fabulous)\b/i,
      /\b(love|loving|can't wait|looking forward)\b/i,
      /\b(yay|yes!|woohoo|!!!)\b/i,
      /\b(dream (trip|vacation)|bucket list)\b/i,
    ],
    emotion: 'excited',
    confidence: 0.8,
    urgency: 'low',
    responseStrategy: 'enthusiastic',
    typingSpeedMultiplier: 1.1,
    priority: 'low',
  },

  // SATISFIED - Low priority
  {
    keywords: [
      /\b(thank you|thanks|appreciate|helpful|great service)\b/i,
      /\b(perfect|exactly|that's great|wonderful)\b/i,
      /\b(satisfied|happy with|pleased with)\b/i,
      /\b(good|nice|ok|okay|fine)\b/i,
    ],
    emotion: 'satisfied',
    confidence: 0.7,
    urgency: 'low',
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.0,
    priority: 'low',
  },

  // CASUAL - Low priority
  {
    keywords: [
      /\b(hey|hi|hello|sup|what's up)\b/i,
      /\b(just (wondering|curious|looking|checking))\b/i,
      /\b(maybe|might|possibly|considering)\b/i,
      /\b(lol|haha|btw|tbh)\b/i,
    ],
    emotion: 'casual',
    confidence: 0.6,
    urgency: 'low',
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.0,
    priority: 'low',
  },
];

/**
 * Detect emotion from user message
 *
 * @param message - The user's message text
 * @returns EmotionAnalysis object with detected emotion and metadata
 */
export function detectEmotion(message: string): EmotionAnalysis {
  const msg = message.toLowerCase();
  const detectedKeywords: string[] = [];

  // Check each pattern in priority order
  for (const pattern of EMOTION_PATTERNS) {
    let matchCount = 0;

    for (const keyword of pattern.keywords) {
      const match = msg.match(keyword);
      if (match) {
        matchCount++;
        detectedKeywords.push(match[0]);
      }
    }

    // If we found matches, calculate confidence based on match count
    if (matchCount > 0) {
      const adjustedConfidence = Math.min(
        pattern.confidence + (matchCount - 1) * 0.05,
        0.95
      );

      return {
        emotion: pattern.emotion,
        confidence: adjustedConfidence,
        urgency: pattern.urgency,
        keywords: detectedKeywords,
        responseStrategy: pattern.responseStrategy,
        typingSpeedMultiplier: pattern.typingSpeedMultiplier,
        priority: pattern.priority,
      };
    }
  }

  // Default to neutral if no patterns matched
  return {
    emotion: 'neutral',
    confidence: 0.5,
    urgency: 'low',
    keywords: [],
    responseStrategy: 'professional',
    typingSpeedMultiplier: 1.0,
    priority: 'low',
  };
}

/**
 * Get empathy marker based on emotional state
 * These are conversational phrases that acknowledge the user's emotional state
 */
export function getEmpathyMarker(
  emotion: EmotionalState,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  const markers: Record<EmotionalState, Record<'en' | 'pt' | 'es', string[]>> = {
    frustrated: {
      en: [
        "I'm really sorry you're experiencing this frustration.",
        "I understand how frustrating this must be.",
        "I apologize for the inconvenience.",
        "I can see why you'd be upset about this.",
      ],
      pt: [
        "Lamento muito que você esteja passando por essa frustração.",
        "Entendo o quanto isso deve ser frustrante.",
        "Peço desculpas pelo inconveniente.",
        "Posso ver por que você estaria chateado com isso.",
      ],
      es: [
        "Lamento mucho que estés experimentando esta frustración.",
        "Entiendo lo frustrante que debe ser esto.",
        "Me disculpo por el inconveniente.",
        "Puedo ver por qué estarías molesto por esto.",
      ],
    },
    urgent: {
      en: [
        "I understand the urgency.",
        "I'm on it right now.",
        "Let me handle this immediately.",
        "I see this requires immediate attention.",
      ],
      pt: [
        "Entendo a urgência.",
        "Estou cuidando disso agora mesmo.",
        "Deixe-me tratar disso imediatamente.",
        "Vejo que isso requer atenção imediata.",
      ],
      es: [
        "Entiendo la urgencia.",
        "Estoy en ello ahora mismo.",
        "Permíteme manejar esto inmediatamente.",
        "Veo que esto requiere atención inmediata.",
      ],
    },
    worried: {
      en: [
        "I understand your concerns.",
        "That's a valid concern.",
        "Don't worry, we can address this.",
        "Let me help ease your worries.",
      ],
      pt: [
        "Entendo suas preocupações.",
        "Essa é uma preocupação válida.",
        "Não se preocupe, podemos resolver isso.",
        "Deixe-me ajudar a aliviar suas preocupações.",
      ],
      es: [
        "Entiendo tus preocupaciones.",
        "Esa es una preocupación válida.",
        "No te preocupes, podemos abordar esto.",
        "Déjame ayudar a aliviar tus preocupaciones.",
      ],
    },
    confused: {
      en: [
        "No worries, let me explain this clearly.",
        "I understand this can be confusing.",
        "Great question!",
        "Let me break this down for you.",
      ],
      pt: [
        "Sem problemas, deixe-me explicar isso claramente.",
        "Entendo que isso pode ser confuso.",
        "Ótima pergunta!",
        "Deixe-me explicar isso para você.",
      ],
      es: [
        "No te preocupes, déjame explicar esto claramente.",
        "Entiendo que esto puede ser confuso.",
        "¡Excelente pregunta!",
        "Déjame desglosar esto para ti.",
      ],
    },
    excited: {
      en: [
        "That's wonderful!",
        "I'm excited to help you with this!",
        "Great!",
        "I love your enthusiasm!",
      ],
      pt: [
        "Isso é maravilhoso!",
        "Estou animado para ajudá-lo com isso!",
        "Ótimo!",
        "Adoro seu entusiasmo!",
      ],
      es: [
        "¡Eso es maravilloso!",
        "¡Estoy emocionado de ayudarte con esto!",
        "¡Genial!",
        "¡Me encanta tu entusiasmo!",
      ],
    },
    satisfied: {
      en: [
        "I'm glad I could help!",
        "Great to hear that!",
        "Happy to assist!",
        "Wonderful!",
      ],
      pt: [
        "Fico feliz em poder ajudar!",
        "Ótimo ouvir isso!",
        "Feliz em ajudar!",
        "Maravilhoso!",
      ],
      es: [
        "¡Me alegra poder ayudar!",
        "¡Genial escuchar eso!",
        "¡Feliz de asistir!",
        "¡Maravilloso!",
      ],
    },
    casual: {
      en: [
        "Sure thing!",
        "Happy to help!",
        "Of course!",
        "Absolutely!",
      ],
      pt: [
        "Claro!",
        "Feliz em ajudar!",
        "Com certeza!",
        "Absolutamente!",
      ],
      es: [
        "¡Claro!",
        "¡Feliz de ayudar!",
        "¡Por supuesto!",
        "¡Absolutamente!",
      ],
    },
    neutral: {
      en: [
        "I'd be happy to help.",
        "Let me assist you with that.",
        "I'm here to help.",
        "Certainly.",
      ],
      pt: [
        "Terei prazer em ajudar.",
        "Deixe-me ajudá-lo com isso.",
        "Estou aqui para ajudar.",
        "Certamente.",
      ],
      es: [
        "Estaré encantado de ayudar.",
        "Déjame ayudarte con eso.",
        "Estoy aquí para ayudar.",
        "Ciertamente.",
      ],
    },
  };

  const emotionMarkers = markers[emotion]?.[language] || markers.neutral[language];
  return emotionMarkers[Math.floor(Math.random() * emotionMarkers.length)];
}

/**
 * Get appropriate consultant for emotional state
 * Some emotions (like urgent/frustrated) should route to crisis management
 */
export function getConsultantForEmotion(
  emotion: EmotionalState,
  defaultConsultantTeam: TeamType
): TeamType {
  switch (emotion) {
    case 'urgent':
    case 'frustrated':
      // Route to crisis management for urgent/frustrated cases
      return 'crisis-management';

    case 'worried':
      // Worried customers might benefit from customer service
      return 'customer-service';

    default:
      // For other emotions, keep the default consultant
      return defaultConsultantTeam;
  }
}

/**
 * Calculate typing delay based on emotion
 *
 * @param baseDelay - Base delay in milliseconds (e.g., 1500)
 * @param emotion - Detected emotional state
 * @returns Adjusted delay in milliseconds
 */
export function getTypingDelay(
  baseDelay: number,
  emotionAnalysis: EmotionAnalysis
): number {
  return Math.round(baseDelay / emotionAnalysis.typingSpeedMultiplier);
}

/**
 * Get visual indicator for emotion
 * Returns CSS classes and color schemes for UI adjustments
 */
export function getEmotionVisualIndicator(emotion: EmotionalState): {
  color: string;
  bgColor: string;
  borderColor: string;
  pulseAnimation: boolean;
  iconColor: string;
} {
  const indicators: Record<EmotionalState, {
    color: string;
    bgColor: string;
    borderColor: string;
    pulseAnimation: boolean;
    iconColor: string;
  }> = {
    urgent: {
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      pulseAnimation: true,
      iconColor: 'text-red-600',
    },
    frustrated: {
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      pulseAnimation: false,
      iconColor: 'text-orange-600',
    },
    worried: {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      pulseAnimation: false,
      iconColor: 'text-yellow-600',
    },
    confused: {
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      pulseAnimation: false,
      iconColor: 'text-blue-600',
    },
    excited: {
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      pulseAnimation: false,
      iconColor: 'text-green-600',
    },
    satisfied: {
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-300',
      pulseAnimation: false,
      iconColor: 'text-teal-600',
    },
    casual: {
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      pulseAnimation: false,
      iconColor: 'text-gray-600',
    },
    neutral: {
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      pulseAnimation: false,
      iconColor: 'text-gray-600',
    },
  };

  return indicators[emotion];
}
