/**
 * Voice Output Layer (Text-to-Speech)
 *
 * GOVERNANCE:
 * - Only speaks COMPLIANT final responses (no new content)
 * - Respects language lock, tone, emotion
 * - NEVER speaks prices unless stage-allowed
 * - NEVER speaks legal disclaimers unless escalated
 * - Fallback to text on TTS failure
 */

import type { ConversationStage, ReasoningOutput } from './reasoning-layer';
import type { VoiceEmotion } from './voice-input';

// ============================================================================
// TYPES
// ============================================================================

export type VoiceTone = 'warm' | 'professional' | 'empathetic' | 'urgent' | 'calm';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';
export type TTSProvider = 'browser' | 'elevenlabs' | 'google' | 'azure';

export interface VoiceConfig {
  language: string;
  tone: VoiceTone;
  speed: VoiceSpeed;
  emotion?: VoiceEmotion;
  volume: number;  // 0-1
}

export interface VoiceOutputResult {
  success: boolean;
  spokenText: string;       // What was/will be spoken
  originalText: string;     // Full response (for fallback)
  config: VoiceConfig;
  duration?: number;        // Estimated seconds
  fallbackReason?: string;  // If success=false
}

export interface SpeakableResponse {
  text: string;
  ssml?: string;            // For advanced TTS
  config: VoiceConfig;
  canSpeak: boolean;
  blockReason?: string;
}

// ============================================================================
// STAGE-BASED SPEAKING RULES
// ============================================================================

const STAGE_VOICE_RULES: Record<ConversationStage, {
  canSpeakPrices: boolean;
  canSpeakLegal: boolean;
  maxLength: number;
  preferredTone: VoiceTone;
}> = {
  DISCOVERY: {
    canSpeakPrices: false,
    canSpeakLegal: false,
    maxLength: 150,
    preferredTone: 'warm',
  },
  NARROWING: {
    canSpeakPrices: false,
    canSpeakLegal: false,
    maxLength: 180,
    preferredTone: 'professional',
  },
  READY_TO_SEARCH: {
    canSpeakPrices: true,  // Can mention ranges
    canSpeakLegal: false,
    maxLength: 200,
    preferredTone: 'professional',
  },
  READY_TO_BOOK: {
    canSpeakPrices: true,
    canSpeakLegal: false,  // Only text
    maxLength: 150,
    preferredTone: 'calm',
  },
  POST_BOOKING: {
    canSpeakPrices: true,
    canSpeakLegal: true,   // Escalation allowed
    maxLength: 200,
    preferredTone: 'empathetic',
  },
};

// ============================================================================
// CONTENT FILTERS
// ============================================================================

const PRICE_PATTERNS = /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|BRL|dollars?|euros?|reais)/gi;
const LEGAL_PATTERNS = /\b(terms|conditions|policy|disclaimer|liability|legal|refund policy|cancellation policy)\b/gi;
const URL_PATTERNS = /https?:\/\/[^\s]+/gi;
const MARKDOWN_PATTERNS = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\([^)]+\)/g;

/**
 * Remove prices from text
 */
function removePrices(text: string): string {
  return text.replace(PRICE_PATTERNS, '[price available on screen]');
}

/**
 * Remove legal content from text
 */
function removeLegal(text: string): string {
  return text.replace(LEGAL_PATTERNS, '');
}

/**
 * Remove URLs and markdown
 */
function cleanForVoice(text: string): string {
  return text
    .replace(URL_PATTERNS, '')
    .replace(MARKDOWN_PATTERNS, '$1$2$3$4')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Shorten text for voice (more concise)
 */
function shortenForVoice(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let result = '';

  for (const sentence of sentences) {
    if ((result + sentence).length <= maxLength) {
      result += sentence;
    } else {
      break;
    }
  }

  return result.trim() || text.slice(0, maxLength - 3) + '...';
}

// ============================================================================
// TONE & EMOTION MAPPING
// ============================================================================

/**
 * Map emotion to voice tone
 */
function emotionToTone(emotion?: VoiceEmotion): VoiceTone {
  switch (emotion) {
    case 'frustrated': return 'empathetic';
    case 'urgent': return 'urgent';
    case 'confused': return 'calm';
    case 'happy': return 'warm';
    default: return 'professional';
  }
}

/**
 * Map emotion to voice speed
 */
function emotionToSpeed(emotion?: VoiceEmotion): VoiceSpeed {
  switch (emotion) {
    case 'frustrated': return 'slow';     // Calm them
    case 'urgent': return 'fast';         // Match urgency
    case 'confused': return 'slow';       // Clearer
    default: return 'normal';
  }
}

/**
 * Get SSML prosody for emotion
 */
function getEmotionSSML(text: string, emotion?: VoiceEmotion): string {
  const rate = emotion === 'urgent' ? '110%' : emotion === 'confused' ? '90%' : '100%';
  const pitch = emotion === 'happy' ? '+5%' : emotion === 'frustrated' ? '-5%' : '0%';

  return `<prosody rate="${rate}" pitch="${pitch}">${text}</prosody>`;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Format response for voice output
 *
 * CRITICAL: Only transforms, never generates new content
 */
export function formatForVoice(
  response: string,
  stage: ConversationStage,
  options: {
    language?: string;
    emotion?: VoiceEmotion;
    toneGuidance?: string;
  } = {}
): SpeakableResponse {
  const rules = STAGE_VOICE_RULES[stage];
  let text = response;

  // Step 1: Clean markdown and URLs
  text = cleanForVoice(text);

  // Step 2: Filter prices if not allowed
  if (!rules.canSpeakPrices) {
    text = removePrices(text);
  }

  // Step 3: Filter legal if not allowed
  if (!rules.canSpeakLegal) {
    text = removeLegal(text);
  }

  // Step 4: Shorten for voice
  text = shortenForVoice(text, rules.maxLength);

  // Step 5: Determine voice config
  const tone = options.toneGuidance?.includes('empathy')
    ? 'empathetic'
    : emotionToTone(options.emotion) || rules.preferredTone;

  const config: VoiceConfig = {
    language: options.language || 'en',
    tone,
    speed: emotionToSpeed(options.emotion),
    emotion: options.emotion,
    volume: 0.9,
  };

  // Step 6: Check if speakable
  const canSpeak = text.length >= 10;

  return {
    text,
    ssml: `<speak>${getEmotionSSML(text, options.emotion)}</speak>`,
    config,
    canSpeak,
    blockReason: canSpeak ? undefined : 'Response too short for voice',
  };
}

/**
 * Prepare voice output from reasoning context
 */
export function prepareVoiceOutput(
  response: string,
  reasoning: ReasoningOutput,
  userEmotion?: VoiceEmotion
): VoiceOutputResult {
  const speakable = formatForVoice(response, reasoning.conversation_stage, {
    emotion: userEmotion,
    toneGuidance: reasoning.tone_guidance,
  });

  if (!speakable.canSpeak) {
    return {
      success: false,
      spokenText: '',
      originalText: response,
      config: speakable.config,
      fallbackReason: speakable.blockReason,
    };
  }

  // Estimate duration (avg 150 words/min for speech)
  const wordCount = speakable.text.split(/\s+/).length;
  const duration = Math.ceil((wordCount / 150) * 60);

  return {
    success: true,
    spokenText: speakable.text,
    originalText: response,
    config: speakable.config,
    duration,
  };
}

/**
 * Execute TTS with fallback
 */
export async function speakWithFallback(
  result: VoiceOutputResult,
  provider: TTSProvider = 'browser',
  onFallback?: (text: string) => void
): Promise<boolean> {
  if (!result.success) {
    onFallback?.(result.originalText);
    return false;
  }

  try {
    // Browser Speech Synthesis (universal fallback)
    if (provider === 'browser' && typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(result.spokenText);
      utterance.lang = result.config.language;
      utterance.rate = result.config.speed === 'fast' ? 1.2 : result.config.speed === 'slow' ? 0.8 : 1;
      utterance.volume = result.config.volume;

      return new Promise((resolve) => {
        utterance.onend = () => resolve(true);
        utterance.onerror = () => {
          onFallback?.(result.originalText);
          resolve(false);
        };
        window.speechSynthesis.speak(utterance);
      });
    }

    // Other providers would integrate here
    // For now, fallback to text
    onFallback?.(result.originalText);
    return false;
  } catch {
    onFallback?.(result.originalText);
    return false;
  }
}

/**
 * Check if voice output is appropriate for context
 */
export function shouldUseVoice(
  stage: ConversationStage,
  hasComplexContent: boolean,
  responseLength: number
): boolean {
  // Don't voice very long responses
  if (responseLength > 500) return false;

  // Don't voice complex booking confirmations
  if (stage === 'READY_TO_BOOK' && hasComplexContent) return false;

  return true;
}

/**
 * Get voice language code from user language
 */
export function getVoiceLanguageCode(language: string): string {
  const langMap: Record<string, string> = {
    en: 'en-US',
    pt: 'pt-BR',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
  };
  return langMap[language.slice(0, 2).toLowerCase()] || 'en-US';
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if TTS is available
 */
export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
