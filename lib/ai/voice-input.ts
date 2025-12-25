/**
 * Voice Input Layer
 *
 * GOVERNANCE:
 * - Voice behaves IDENTICALLY to text after normalization
 * - NO stage skipping
 * - NO direct action execution
 * - ALL voice sessions marked with origin = "voice"
 */

import type { ReasoningInput } from './reasoning-layer';

// ============================================================================
// TYPES
// ============================================================================

export type VoiceEmotion = 'neutral' | 'urgent' | 'frustrated' | 'confused' | 'happy';
export type VoiceQuality = 'clear' | 'noisy' | 'partial' | 'interrupted';

export interface VoiceMetadata {
  origin: 'voice';
  language: string;
  confidence: number;         // 0-1 transcription confidence
  emotion: VoiceEmotion;
  quality: VoiceQuality;
  isPartial: boolean;         // Incomplete sentence
  duration: number;           // Seconds
  wordCount: number;
}

export interface VoiceTranscription {
  rawText: string;            // Original STT output
  normalizedText: string;     // Cleaned for reasoning
  metadata: VoiceMetadata;
  warnings: string[];
}

export interface VoiceInputResult {
  input: ReasoningInput;
  voiceMetadata: VoiceMetadata;
}

// ============================================================================
// DETECTION PATTERNS
// ============================================================================

const EMOTION_PATTERNS = {
  urgent: /\b(urgent|urgently|hurry|quick|fast|asap|emergency|now|immediately|rapido|urgente|agora)\b/i,
  frustrated: /\b(frustrated|angry|annoyed|upset|terrible|worst|hate|damn|stupid|raiva|irritado)\b/i,
  confused: /\b(confused|don't understand|unclear|what|huh|sorry|perdido|não entendi)\b/i,
  happy: /\b(great|awesome|perfect|thanks|wonderful|love|amazing|obrigado|perfeito)\b/i,
};

// Filler words to remove (multi-language)
const FILLER_PATTERNS = [
  /\b(um+|uh+|er+|ah+|hmm+|like|you know|basically|actually|so|well)\b/gi,
  /\b(então|tipo|né|assim|sabe|bom)\b/gi,
  /\b(pues|este|bueno|osea)\b/gi,
];

// Partial/interrupted patterns
const PARTIAL_PATTERNS = [
  /\.{3,}$/,                    // Trailing dots
  /—$|–$/,                      // Trailing dashes
  /\b(and|but|so|or|because|e|mas|então|porque)$/i,  // Ends with conjunction
  /^[a-z]/,                     // Starts lowercase (mid-sentence)
];

// Language detection patterns
const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  pt: /\b(quero|preciso|viagem|voo|passagem|para|cidade|aeroporto|quando|quanto|obrigado)\b/i,
  es: /\b(quiero|necesito|viaje|vuelo|pasaje|ciudad|aeropuerto|cuando|cuanto|gracias)\b/i,
  en: /\b(want|need|flight|trip|travel|city|airport|when|how much|thanks|book)\b/i,
};

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Remove filler words and speech artifacts
 */
function removeFiller(text: string): string {
  let result = text;
  for (const pattern of FILLER_PATTERNS) {
    result = result.replace(pattern, ' ');
  }
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Fix common STT errors
 */
function fixTranscriptionErrors(text: string): string {
  const fixes: [RegExp, string][] = [
    // Numbers
    [/\bone\s+way\b/gi, 'one-way'],
    [/\bround\s+trip\b/gi, 'round-trip'],
    // Dates
    [/\bthe\s+(\d+)(st|nd|rd|th)\b/gi, '$1'],
    // Common mishearings
    [/\bfly\s+to\s+any\b/gi, 'Fly2Any'],
    [/\bbook\s+a\s+flight\b/gi, 'book flight'],
    // Trailing punctuation cleanup
    [/[.,!?]+$/g, ''],
  ];

  let result = text;
  for (const [pattern, replacement] of fixes) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Detect primary language
 */
export function detectLanguage(text: string): string {
  const scores: Record<string, number> = { en: 0, pt: 0, es: 0 };

  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches) scores[lang] += matches.length;
  }

  const topLang = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return topLang[1] > 0 ? topLang[0] : 'en';
}

/**
 * Detect emotion from text
 */
export function detectEmotion(text: string): VoiceEmotion {
  // Priority order: frustrated > urgent > confused > happy > neutral
  if (EMOTION_PATTERNS.frustrated.test(text)) return 'frustrated';
  if (EMOTION_PATTERNS.urgent.test(text)) return 'urgent';
  if (EMOTION_PATTERNS.confused.test(text)) return 'confused';
  if (EMOTION_PATTERNS.happy.test(text)) return 'happy';
  return 'neutral';
}

/**
 * Detect if input is partial/interrupted
 */
export function isPartialSentence(text: string): boolean {
  return PARTIAL_PATTERNS.some(p => p.test(text));
}

/**
 * Assess voice quality based on characteristics
 */
function assessQuality(text: string, confidence: number): VoiceQuality {
  if (confidence < 0.5) return 'noisy';
  if (isPartialSentence(text)) return 'partial';
  if (text.includes('[inaudible]') || text.includes('[unclear]')) return 'interrupted';
  return 'clear';
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

/**
 * Normalize voice transcription for reasoning layer
 *
 * CRITICAL: Output behaves identically to text input
 */
export function normalizeVoiceInput(
  rawText: string,
  transcriptionConfidence: number = 0.9,
  durationSeconds: number = 0
): VoiceTranscription {
  const warnings: string[] = [];

  // Step 1: Basic cleanup
  let normalized = rawText.trim();

  // Step 2: Remove filler words
  normalized = removeFiller(normalized);

  // Step 3: Fix common STT errors
  normalized = fixTranscriptionErrors(normalized);

  // Step 4: Detect metadata
  const language = detectLanguage(normalized);
  const emotion = detectEmotion(rawText); // Use raw for emotion detection
  const quality = assessQuality(rawText, transcriptionConfidence);
  const partial = isPartialSentence(normalized);

  // Step 5: Generate warnings
  if (quality === 'noisy') warnings.push('Low transcription confidence');
  if (partial) warnings.push('Incomplete sentence detected');
  if (emotion === 'frustrated') warnings.push('User may be frustrated');
  if (emotion === 'urgent') warnings.push('User indicates urgency');

  // Step 6: Final normalization
  normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return {
    rawText,
    normalizedText: normalized,
    metadata: {
      origin: 'voice',
      language,
      confidence: transcriptionConfidence,
      emotion,
      quality,
      isPartial: partial,
      duration: durationSeconds,
      wordCount: normalized.split(/\s+/).filter(Boolean).length,
    },
    warnings,
  };
}

/**
 * Convert voice input to ReasoningInput
 *
 * CRITICAL: Same structure as text input, plus voice metadata
 */
export function voiceToReasoningInput(
  transcription: VoiceTranscription,
  sessionState?: ReasoningInput['sessionState'],
  pageContext?: string
): VoiceInputResult {
  return {
    input: {
      message: transcription.normalizedText,
      language: transcription.metadata.language,
      pageContext,
      sessionState,
    },
    voiceMetadata: transcription.metadata,
  };
}

/**
 * Process raw voice audio result (from STT service)
 *
 * Entry point for voice integration
 */
export function processVoiceInput(params: {
  rawTranscript: string;
  confidence?: number;
  duration?: number;
  sessionState?: ReasoningInput['sessionState'];
  pageContext?: string;
}): VoiceInputResult {
  const transcription = normalizeVoiceInput(
    params.rawTranscript,
    params.confidence ?? 0.9,
    params.duration ?? 0
  );

  return voiceToReasoningInput(
    transcription,
    params.sessionState,
    params.pageContext
  );
}

/**
 * Check if voice input needs clarification before processing
 */
export function needsClarification(transcription: VoiceTranscription): boolean {
  return (
    transcription.metadata.isPartial ||
    transcription.metadata.quality === 'noisy' ||
    transcription.metadata.confidence < 0.6 ||
    transcription.normalizedText.length < 3
  );
}

/**
 * Alias for detectLanguage (for voice-specific naming)
 */
export const detectLanguageFromVoice = detectLanguage;

/**
 * Alias for detectEmotion (for voice-specific naming)
 */
export const detectEmotionFromVoice = detectEmotion;

/**
 * Get clarification prompt based on voice issues
 */
export function getClarificationPrompt(
  transcription: VoiceTranscription,
  language: string = 'en'
): string {
  const prompts: Record<string, Record<string, string>> = {
    en: {
      partial: "I didn't catch the end of that. Could you please repeat?",
      noisy: "I had trouble hearing that clearly. Could you try again?",
      short: "Could you tell me more about what you're looking for?",
    },
    pt: {
      partial: 'Não consegui ouvir o final. Pode repetir, por favor?',
      noisy: 'Tive dificuldade em ouvir. Pode tentar novamente?',
      short: 'Pode me contar mais sobre o que está procurando?',
    },
    es: {
      partial: 'No escuché el final. ¿Podría repetir?',
      noisy: 'Tuve problemas para escuchar. ¿Puede intentar de nuevo?',
      short: '¿Puede contarme más sobre lo que busca?',
    },
  };

  const lang = prompts[language] ? language : 'en';

  if (transcription.metadata.isPartial) return prompts[lang].partial;
  if (transcription.metadata.quality === 'noisy') return prompts[lang].noisy;
  return prompts[lang].short;
}
