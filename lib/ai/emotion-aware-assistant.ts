/**
 * Emotion-Aware AI Assistant Helper
 *
 * Provides high-level functions to easily integrate emotion detection
 * into the AI Travel Assistant
 */

import {
  detectEmotion,
  getEmpathyMarker,
  getConsultantForEmotion,
  type EmotionAnalysis,
  type EmotionalState
} from './emotion-detection';

import {
  formatEmotionalResponse,
  getOpeningPhrase,
  getClosingPhrase,
  getResponseTemplate
} from './response-templates';

import {
  calculateTypingDelay,
  calculateThinkingDelay,
  detectMessageType
} from '@/lib/utils/typing-simulation';

import { getConsultant, type TeamType } from './consultant-profiles';

export interface EmotionalResponse {
  content: string;
  consultant: {
    name: string;
    title: string;
    avatar: string;
    team: TeamType;
  };
  emotionAnalysis: EmotionAnalysis;
  typingDelay: number;
  thinkingDelay: number;
}

export interface EmotionalMessageOptions {
  userMessage: string;
  baseConsultantTeam?: TeamType;
  language?: 'en' | 'pt' | 'es';
  mainContent: string;
  includeOpening?: boolean;
  includeClosing?: boolean;
}

/**
 * Process a user message and generate an emotion-aware response
 *
 * This is the main function to use for emotion-aware responses.
 * It handles all the complexity of emotion detection, consultant selection,
 * response formatting, and timing calculations.
 *
 * @example
 * ```typescript
 * const result = processEmotionalMessage({
 *   userMessage: "I'm so frustrated! My flight was cancelled!",
 *   baseConsultantTeam: 'flight-operations',
 *   language: 'en',
 *   mainContent: "Let me help you rebook immediately. Here are your options..."
 * });
 *
 * // Use the result
 * console.log(result.emotionAnalysis.emotion); // 'frustrated'
 * console.log(result.consultant.name); // 'Captain Mike Johnson'
 * console.log(result.content); // Formatted response with empathy
 * console.log(result.typingDelay); // 1200 (faster for frustrated users)
 * ```
 */
export function processEmotionalMessage(
  options: EmotionalMessageOptions
): EmotionalResponse {
  const {
    userMessage,
    baseConsultantTeam = 'customer-service',
    language = 'en',
    mainContent,
    includeOpening = true,
    includeClosing = true
  } = options;

  // 1. Detect emotion from user message
  const emotionAnalysis = detectEmotion(userMessage);

  // 2. Determine appropriate consultant based on emotion
  const consultantTeam = getConsultantForEmotion(
    emotionAnalysis.emotion,
    baseConsultantTeam
  );
  const consultant = getConsultant(consultantTeam);

  // 3. Format response with emotional awareness
  const content = formatEmotionalResponse(
    emotionAnalysis.emotion,
    language,
    mainContent,
    includeOpening,
    includeClosing
  );

  // 4. Calculate timing delays
  // Convert emotion to message type for typing calculation
  const messageType = detectMessageType(content);
  const typingDelay = calculateTypingDelay(content, messageType);
  const thinkingDelay = calculateThinkingDelay(userMessage, messageType);

  return {
    content,
    consultant: {
      name: consultant.name,
      title: consultant.title,
      avatar: consultant.avatar,
      team: consultant.team
    },
    emotionAnalysis,
    typingDelay,
    thinkingDelay
  };
}

/**
 * Analyze emotion without generating a full response
 * Useful for logging or conditional logic
 */
export function analyzeUserEmotion(userMessage: string): EmotionAnalysis {
  return detectEmotion(userMessage);
}

/**
 * Get empathy acknowledgment for a detected emotion
 */
export function getEmotionAcknowledgment(
  emotion: EmotionalState,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  return getEmpathyMarker(emotion, language);
}

/**
 * Determine if message should be escalated to crisis management
 */
export function shouldEscalateToCrisis(emotionAnalysis: EmotionAnalysis): boolean {
  return (
    emotionAnalysis.urgency === 'high' &&
    (emotionAnalysis.emotion === 'urgent' || emotionAnalysis.emotion === 'frustrated') &&
    emotionAnalysis.confidence >= 0.7
  );
}

/**
 * Get recommended consultant for emotional state
 */
export function getRecommendedConsultant(
  emotionAnalysis: EmotionAnalysis,
  baseTeam: TeamType
): {
  team: TeamType;
  reason: string;
} {
  const recommendedTeam = getConsultantForEmotion(
    emotionAnalysis.emotion,
    baseTeam
  ) as TeamType;

  let reason = 'Standard routing based on query content';

  if (recommendedTeam === 'crisis-management') {
    if (emotionAnalysis.emotion === 'urgent') {
      reason = 'Escalated to crisis management due to urgent situation';
    } else if (emotionAnalysis.emotion === 'frustrated') {
      reason = 'Escalated to crisis management due to customer frustration';
    }
  } else if (recommendedTeam === 'customer-service' && emotionAnalysis.emotion === 'worried') {
    reason = 'Routed to customer service for reassurance';
  }

  return {
    team: recommendedTeam,
    reason
  };
}

/**
 * Format a simple emotional greeting
 */
export function formatEmotionalGreeting(
  emotion: EmotionalState,
  consultantName: string,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  const empathy = getEmpathyMarker(emotion, language);
  const template = getResponseTemplate(emotion, language);

  const greeting = template.opening[0]; // Use first opening

  return `${greeting}\n\n${empathy}`;
}

/**
 * Get visual style for emotion (for UI rendering)
 */
export function getEmotionVisualStyle(emotion: EmotionalState): {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
  shouldPulse: boolean;
} {
  const styles: Record<EmotionalState, {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    icon: string;
    shouldPulse: boolean;
  }> = {
    urgent: {
      backgroundColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
      icon: '🚨',
      shouldPulse: true
    },
    frustrated: {
      backgroundColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-300',
      icon: '😤',
      shouldPulse: false
    },
    worried: {
      backgroundColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300',
      icon: '😰',
      shouldPulse: false
    },
    confused: {
      backgroundColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      icon: '❓',
      shouldPulse: false
    },
    excited: {
      backgroundColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
      icon: '🎉',
      shouldPulse: false
    },
    satisfied: {
      backgroundColor: 'bg-teal-50',
      textColor: 'text-teal-700',
      borderColor: 'border-teal-300',
      icon: '✅',
      shouldPulse: false
    },
    casual: {
      backgroundColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      icon: '💬',
      shouldPulse: false
    },
    neutral: {
      backgroundColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: '😐',
      shouldPulse: false
    }
  };

  return styles[emotion];
}

/**
 * Get emotion-specific AI behavior flags
 */
export function getEmotionBehaviorFlags(emotionAnalysis: EmotionAnalysis): {
  useBulletPoints: boolean;
  useExclamation: boolean;
  provideDetailedExplanation: boolean;
  focusOnImmediateAction: boolean;
  offerReassurance: boolean;
  matchEnthusiasm: boolean;
} {
  const template = getResponseTemplate(emotionAnalysis.emotion, 'en');

  return {
    useBulletPoints: template.useBulletPoints,
    useExclamation: template.useExclamation,
    provideDetailedExplanation: template.explainMode,
    focusOnImmediateAction: template.actionOriented,
    offerReassurance: emotionAnalysis.emotion === 'worried' || emotionAnalysis.emotion === 'frustrated',
    matchEnthusiasm: emotionAnalysis.emotion === 'excited'
  };
}

/**
 * Get emotion-aware typing indicator text
 */
export function getEmotionalTypingText(
  consultantName: string,
  emotion: EmotionalState,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  const baseText = {
    en: `${consultantName} is typing`,
    pt: `${consultantName} está digitando`,
    es: `${consultantName} está escribiendo`
  }[language];

  // Add emotion-specific indicator
  if (emotion === 'urgent' || emotion === 'frustrated') {
    const urgentText = {
      en: ' urgently',
      pt: ' urgentemente',
      es: ' urgentemente'
    }[language];
    return baseText + urgentText + '...';
  }

  return baseText + '...';
}

/**
 * Create a complete emotional message object for the chat
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  consultant?: {
    name: string;
    title: string;
    avatar: string;
    team: TeamType;
  };
  emotionDetected?: EmotionAnalysis;
}

export function createEmotionalChatMessage(
  emotionalResponse: EmotionalResponse
): ChatMessage {
  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: emotionalResponse.content,
    timestamp: new Date(),
    consultant: emotionalResponse.consultant,
    emotionDetected: emotionalResponse.emotionAnalysis
  };
}

/**
 * Analytics helper: Extract emotion metrics for tracking
 */
export function extractEmotionMetrics(emotionAnalysis: EmotionAnalysis) {
  return {
    emotion: emotionAnalysis.emotion,
    confidence: emotionAnalysis.confidence,
    urgency: emotionAnalysis.urgency,
    priority: emotionAnalysis.priority,
    responseStrategy: emotionAnalysis.responseStrategy,
    keywords: emotionAnalysis.keywords.join(', '),
    shouldEscalate: shouldEscalateToCrisis(emotionAnalysis)
  };
}
