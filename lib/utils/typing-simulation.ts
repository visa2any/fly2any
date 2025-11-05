/**
 * Typing Simulation Utilities
 * Provides realistic human-like typing behavior for AI assistant responses
 */

export type MessageType = 'greeting' | 'question' | 'answer' | 'emergency' | 'urgent' | 'complex' | 'simple' | 'long';
export type EmotionalPacing = 'urgent' | 'normal' | 'complex';

/**
 * Calculate realistic typing time based on message length and complexity
 *
 * Base typing speed: 40-60 words per minute (professional)
 * That's about 200-300 characters per minute or ~3-5 characters per second
 *
 * @param message - The message to be typed
 * @param messageType - Type of message for contextual pacing
 * @returns Delay in milliseconds
 */
export function calculateTypingDelay(
  message: string,
  messageType: MessageType = 'answer'
): number {
  const baseCharsPerSecond = 4; // 240 chars/min, 48 wpm
  const minDelay = 800; // minimum 0.8 seconds
  const maxDelay = 8000; // maximum 8 seconds

  // Calculate base delay
  let delay = (message.length / baseCharsPerSecond) * 1000;

  // Add complexity factors
  // Technical terms slow down typing
  const technicalTerms = /\b(regulation|compensation|policy|flight|booking|accommodation|insurance|visa|passport|documentation|refund|cancellation|payment|transaction)\b/gi;
  const technicalCount = (message.match(technicalTerms) || []).length;
  delay += technicalCount * 200; // +200ms per technical term

  // Punctuation adds natural pauses
  const punctuation = message.match(/[.,!?;:]/g) || [];
  delay += punctuation.length * 150; // +150ms per punctuation

  // Numbers slow down typing (careful typing)
  const numbers = message.match(/\d+/g) || [];
  delay += numbers.length * 100; // +100ms per number

  // URLs or emails slow down typing
  const urlsOrEmails = message.match(/https?:\/\/[^\s]+|[\w\.-]+@[\w\.-]+\.\w+/g) || [];
  delay += urlsOrEmails.length * 400; // +400ms per URL/email

  // Apply message type pacing
  delay *= getMessageTypePacingMultiplier(messageType);

  // Add human variability (±20%)
  const variability = 0.2;
  const randomFactor = 1 + (Math.random() * variability * 2 - variability);
  delay *= randomFactor;

  // Clamp to min/max
  return Math.max(minDelay, Math.min(maxDelay, delay));
}

/**
 * Get pacing multiplier based on message type
 */
function getMessageTypePacingMultiplier(messageType: MessageType): number {
  switch (messageType) {
    case 'emergency':
      return 0.65; // 150% faster (less time)
    case 'urgent':
      return 0.75; // 133% faster
    case 'simple':
    case 'greeting':
      return 1.0; // Normal speed
    case 'question':
      return 1.1; // Slightly slower
    case 'complex':
      return 1.25; // 80% speed (more time)
    case 'long':
      return 1.15; // Slightly slower for long messages
    default:
      return 1.0;
  }
}

/**
 * Calculate "thinking" delay before typing starts
 * Simulates the consultant reading and processing the user's message
 *
 * @param userMessage - The user's message that was sent
 * @param messageType - Type of response being prepared
 * @returns Delay in milliseconds
 */
export function calculateThinkingDelay(
  userMessage: string,
  messageType: MessageType = 'answer'
): number {
  const baseThinkingTime = 500; // Base 0.5 seconds
  const minThinking = 300;
  const maxThinking = 2000;

  // Longer user messages = more thinking time (reading time)
  const readingTime = Math.min(userMessage.length * 5, 800); // Max 800ms for reading

  // Complex questions need more thinking
  const questionMarkers = userMessage.match(/\?|how|why|what|when|where|which|who/gi) || [];
  const complexityBonus = questionMarkers.length * 150;

  // Emergency messages get fast response
  const isEmergent = /urgent|emergency|help|asap|immediately/i.test(userMessage);
  const emergencyMultiplier = isEmergent ? 0.5 : 1.0;

  let thinkingTime = (baseThinkingTime + readingTime + complexityBonus) * emergencyMultiplier;

  // Add slight randomness (±15%)
  const variability = 0.15;
  const randomFactor = 1 + (Math.random() * variability * 2 - variability);
  thinkingTime *= randomFactor;

  return Math.max(minThinking, Math.min(maxThinking, thinkingTime));
}

/**
 * Calculate delay between multiple messages in a sequence
 * Simulates natural pauses when sending multiple messages
 *
 * @param messageIndex - Index of the message in the sequence (0-based)
 * @param totalMessages - Total number of messages in the sequence
 * @returns Delay in milliseconds
 */
export function calculateMultiMessageDelay(
  messageIndex: number,
  totalMessages: number
): number {
  const baseDelay = 500; // Base 0.5 seconds between messages
  const minDelay = 400;
  const maxDelay = 1200;

  // First message has no delay (it follows the typing delay)
  if (messageIndex === 0) return 0;

  // Longer pauses for the last message (wrap up thinking)
  const isLastMessage = messageIndex === totalMessages - 1;
  const positionMultiplier = isLastMessage ? 1.3 : 1.0;

  let delay = baseDelay * positionMultiplier;

  // Add variability (±20%)
  const variability = 0.2;
  const randomFactor = 1 + (Math.random() * variability * 2 - variability);
  delay *= randomFactor;

  return Math.max(minDelay, Math.min(maxDelay, delay));
}

/**
 * Detect message type from content
 * Helps determine appropriate pacing
 */
export function detectMessageType(message: string): MessageType {
  const msg = message.toLowerCase();

  // Emergency/urgent detection
  if (/urgent|emergency|asap|immediately|help|crisis|lost|stolen/i.test(message)) {
    return 'emergency';
  }

  // Simple greetings
  if (/^(hi|hello|hey|hola|olá|good morning|good evening)/i.test(message) && message.length < 100) {
    return 'greeting';
  }

  // Questions
  if (message.includes('?') || /^(how|why|what|when|where|which|who|can|could|would)\b/i.test(message)) {
    return 'question';
  }

  // Long messages (explanations)
  if (message.length > 500) {
    return 'long';
  }

  // Complex messages (multiple topics, technical terms)
  const technicalTermCount = (message.match(/\b(regulation|compensation|policy|insurance|documentation|refund|cancellation)\b/gi) || []).length;
  if (technicalTermCount > 3 || message.split('\n').length > 5) {
    return 'complex';
  }

  // Simple short answers
  if (message.length < 150) {
    return 'simple';
  }

  // Default to normal answer
  return 'answer';
}

/**
 * Get emotional pacing based on message urgency
 */
export function getEmotionalPacing(message: string): EmotionalPacing {
  const messageType = detectMessageType(message);

  if (messageType === 'emergency') return 'urgent';
  if (messageType === 'complex' || messageType === 'long') return 'complex';

  return 'normal';
}

/**
 * Simulate character-by-character typing effect
 * Optional: for more realistic streaming effect
 *
 * @param message - Message to type
 * @param onProgress - Callback with partial message
 * @param onComplete - Callback when complete
 * @param speed - Characters per second (default: 15)
 */
export function simulateTypingEffect(
  message: string,
  onProgress: (partial: string) => void,
  onComplete: () => void,
  speed: number = 15 // chars per second
) {
  let currentIndex = 0;
  const delayPerChar = 1000 / speed;

  const typeNextChar = () => {
    if (currentIndex < message.length) {
      currentIndex++;
      onProgress(message.substring(0, currentIndex));

      // Add slight randomness to each character
      const randomDelay = delayPerChar * (0.8 + Math.random() * 0.4);
      setTimeout(typeNextChar, randomDelay);
    } else {
      onComplete();
    }
  };

  typeNextChar();
}

/**
 * Split long message into sentences for progressive display
 * Useful for multi-part responses
 */
export function splitIntoSentences(message: string): string[] {
  // Split on sentence boundaries while preserving the delimiter
  const sentences = message.split(/([.!?]+\s+)/).filter(s => s.trim());

  // Recombine sentences with their punctuation
  const result: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i] + (sentences[i + 1] || '');
    if (sentence.trim()) {
      result.push(sentence.trim());
    }
  }

  return result.length > 0 ? result : [message];
}

/**
 * Calculate pause between sentences for long messages
 */
export function calculateSentencePause(
  sentenceIndex: number,
  totalSentences: number
): number {
  const basePause = 200; // 200ms between sentences
  const minPause = 150;
  const maxPause = 400;

  // Longer pause after question marks or exclamations
  let pause = basePause;

  // Add variability
  const variability = 0.15;
  const randomFactor = 1 + (Math.random() * variability * 2 - variability);
  pause *= randomFactor;

  return Math.max(minPause, Math.min(maxPause, pause));
}

/**
 * Generate typing state metadata for UI display
 */
export interface TypingState {
  phase: 'thinking' | 'typing' | 'paused' | 'complete';
  consultantName: string;
  message?: string;
}

/**
 * Create a typing state object for UI updates
 */
export function createTypingState(
  phase: TypingState['phase'],
  consultantName: string,
  message?: string
): TypingState {
  return {
    phase,
    consultantName,
    message
  };
}

/**
 * Get localized typing indicator text
 */
export function getTypingIndicatorText(
  phase: 'thinking' | 'typing',
  consultantName: string,
  language: 'en' | 'pt' | 'es' = 'en'
): string {
  if (phase === 'thinking') {
    return {
      en: `${consultantName} is reading your message...`,
      pt: `${consultantName} está lendo sua mensagem...`,
      es: `${consultantName} está leyendo tu mensaje...`
    }[language];
  } else {
    return {
      en: `${consultantName} is typing...`,
      pt: `${consultantName} está digitando...`,
      es: `${consultantName} está escribiendo...`
    }[language];
  }
}

// Note: Emotion-aware typing functions are planned for future implementation
// They will integrate with the emotion detection system when available
// For now, use detectMessageType() which provides similar functionality
