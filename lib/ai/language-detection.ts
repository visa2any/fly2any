/**
 * Automatic Language Detection System
 *
 * Detects user's language in real-time for:
 * - English (en)
 * - Spanish (es)
 * - Brazilian Portuguese (pt-BR)
 *
 * Used to automatically respond in the user's preferred language
 */

export type SupportedLanguage = 'en' | 'es' | 'pt';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number; // 0-1
  alternateLanguages: { language: SupportedLanguage; confidence: number }[];
}

/**
 * Language-specific keywords and patterns
 */
const LANGUAGE_PATTERNS = {
  en: {
    // Common English words
    keywords: [
      'the', 'a', 'an', 'is', 'are', 'am', 'was', 'were', 'been', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'can', 'could', 'may', 'might', 'must', 'shall',
      'hello', 'hi', 'hey', 'thank', 'thanks', 'please', 'sorry',
      'flight', 'hotel', 'travel', 'book', 'need', 'want', 'looking',
      'from', 'to', 'when', 'where', 'how', 'what', 'which', 'who',
    ],
    // English-specific question patterns
    questions: /\b(what|where|when|how|why|who|which|whose|whom)\b/i,
    // English verb forms
    verbForms: /\b(am|is|are|was|were|been|have|has|had|do|does|did)\b/i,
  },

  es: {
    // Common Spanish words
    keywords: [
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para', 'sin',
      'es', 'son', 'está', 'están', 'era', 'eran', 'fue', 'fueron',
      'hola', 'gracias', 'por favor', 'perdón', 'disculpe',
      'vuelo', 'hotel', 'viajar', 'necesito', 'quiero', 'busco',
      'desde', 'hasta', 'cuando', 'donde', 'como', 'que', 'cual',
      'tengo', 'tiene', 'hay', 'hacer', 'ir', 'venir', 'ver',
      'cuesta', 'puedo', 'puede', 'ayudar', 'buscar', 'reservar',
    ],
    // Spanish-specific question patterns (added cuánto, cuánta, cuántos, cuántas)
    questions: /\b(qué|cuál|cuáles|cuándo|cuánto|cuánta|cuántos|cuántas|dónde|cómo|por qué|quién|quiénes)\b/i,
    // Spanish verb forms
    verbForms: /\b(soy|eres|es|somos|son|estoy|estás|está|estamos|están|tengo|tienes|tiene|tenemos|tienen|cuesta|cuestan|puedo|puede|pueden)\b/i,
    // Spanish accents and punctuation
    accents: /[áéíóúñ¿¡]/i,
  },

  pt: {
    // Common Brazilian Portuguese words
    keywords: [
      'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
      'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
      'com', 'por', 'para', 'sem', 'sobre', 'até', 'entre',
      'é', 'são', 'está', 'estão', 'era', 'eram', 'foi', 'foram',
      'oi', 'olá', 'obrigado', 'obrigada', 'por favor', 'desculpe',
      'voo', 'hotel', 'viajar', 'preciso', 'quero', 'procuro',
      'de', 'para', 'quando', 'onde', 'como', 'que', 'qual',
      'tenho', 'tem', 'há', 'fazer', 'ir', 'vir', 'ver',
    ],
    // Portuguese-specific question patterns
    questions: /\b(o que|qual|quais|quando|onde|como|por que|quem)\b/i,
    // Portuguese verb forms
    verbForms: /\b(sou|és|é|somos|são|estou|está|estamos|estão|tenho|tens|tem|temos|têm)\b/i,
    // Portuguese-specific words
    distinctWords: /\b(você|não|também|muito|aqui|agora|sempre|nunca|tudo|nada)\b/i,
    // Portuguese accents
    accents: /[áéíóúâêôãõç]/i,
  },
};

/**
 * Main language detection function
 * Analyzes text and returns detected language with confidence
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    // Default to English if empty
    return {
      language: 'en',
      confidence: 1.0,
      alternateLanguages: [],
    };
  }

  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);

  // Score each language
  const scores = {
    en: scoreLanguage(normalizedText, words, LANGUAGE_PATTERNS.en, 'en'),
    es: scoreLanguage(normalizedText, words, LANGUAGE_PATTERNS.es, 'es'),
    pt: scoreLanguage(normalizedText, words, LANGUAGE_PATTERNS.pt, 'pt'),
  };

  // Find highest score
  const sortedLanguages = (Object.entries(scores) as [SupportedLanguage, number][])
    .sort((a, b) => b[1] - a[1]);

  const detectedLanguage = sortedLanguages[0][0];
  const confidence = sortedLanguages[0][1];

  // Build alternate languages list
  const alternateLanguages = sortedLanguages.slice(1).map(([lang, score]) => ({
    language: lang,
    confidence: score,
  }));

  return {
    language: detectedLanguage,
    confidence,
    alternateLanguages,
  };
}

/**
 * Score a text against a language's patterns
 */
function scoreLanguage(
  text: string,
  words: string[],
  patterns: any,
  lang: SupportedLanguage
): number {
  let score = 0;
  const totalWords = words.length;

  // Score based on keyword matches (using word boundaries to avoid substring false positives)
  let keywordMatches = 0;
  for (const keyword of patterns.keywords) {
    // Escape special regex characters and use word boundaries
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    if (regex.test(text)) {
      keywordMatches++;
    }
  }
  score += (keywordMatches / patterns.keywords.length) * 40; // Max 40 points

  // Score based on question pattern matches
  if (patterns.questions && patterns.questions.test(text)) {
    score += 20;
  }

  // Score based on verb form matches
  if (patterns.verbForms && patterns.verbForms.test(text)) {
    score += 20;
  }

  // Score based on accent marks and special characters
  if (lang === 'es' && patterns.accents && patterns.accents.test(text)) {
    score += 15;
    // Extra boost for Spanish-exclusive punctuation ¿ and ¡
    if (/[¿¡]/.test(text)) {
      score += 10; // These are ONLY used in Spanish
    }
  }
  if (lang === 'pt' && patterns.accents && patterns.accents.test(text)) {
    score += 15;
    // Extra boost for Portuguese-exclusive characters ç, ã, õ
    if (/[çãõ]/.test(text)) {
      score += 10; // These are very common in Portuguese
    }
  }

  // Score based on distinct words (for Portuguese)
  if (lang === 'pt' && patterns.distinctWords && patterns.distinctWords.test(text)) {
    score += 10;
  }

  // Normalize score to 0-1 range
  // Max possible: 115 for PT (40+20+20+15+10+10), 105 for ES (40+20+20+15+10), 80 for EN (40+20+20)
  const maxScore = lang === 'pt' ? 115 : lang === 'es' ? 105 : 80;
  return Math.min(score / maxScore, 1.0);
}

/**
 * Quick language detection for short inputs
 * Uses more aggressive patterns for very short text
 */
export function detectLanguageQuick(text: string): SupportedLanguage {
  if (!text) return 'en';

  const lowerText = text.toLowerCase();

  // Strong Spanish indicators
  if (
    /\b(hola|gracias|vuelo|necesito|quiero|dónde|cómo|cuándo)\b/.test(lowerText) ||
    /[¿¡]/.test(text) ||
    /\b(señor|señora)\b/.test(lowerText)
  ) {
    return 'es';
  }

  // Strong Portuguese indicators
  if (
    /\b(olá|obrigad[oa]|voo|preciso|quero|onde|como|quando)\b/.test(lowerText) ||
    /[ãõç]/.test(text) ||
    /\b(você|não)\b/.test(lowerText)
  ) {
    return 'pt';
  }

  // Default to English
  return 'en';
}

/**
 * Detect if text is mixed language
 * Returns true if multiple languages detected with similar confidence
 */
export function isMixedLanguage(text: string): boolean {
  const result = detectLanguage(text);

  // If there's an alternate language with >40% confidence, it's mixed
  for (const alt of result.alternateLanguages) {
    if (alt.confidence > 0.4) {
      return true;
    }
  }

  return false;
}

/**
 * Get appropriate greeting based on detected language
 */
export function getGreetingForLanguage(
  language: SupportedLanguage,
  consultantName: string,
  consultantTitle: string
): string {
  const greetings = {
    en: `Hi! I'm ${consultantName}, your ${consultantTitle} at Fly2Any. How can I help you today?`,
    es: `¡Hola! Soy ${consultantName}, tu ${consultantTitle} en Fly2Any. ¿Cómo puedo ayudarte hoy?`,
    pt: `Olá! Sou ${consultantName}, seu ${consultantTitle} na Fly2Any. Como posso ajudá-lo hoje?`,
  };

  return greetings[language];
}

/**
 * Translate common travel terms to detected language
 */
export function getTranslation(
  key: string,
  language: SupportedLanguage
): string {
  const translations: Record<string, Record<SupportedLanguage, string>> = {
    // Common actions
    search: {
      en: 'Search',
      es: 'Buscar',
      pt: 'Buscar',
    },
    book: {
      en: 'Book',
      es: 'Reservar',
      pt: 'Reservar',
    },
    cancel: {
      en: 'Cancel',
      es: 'Cancelar',
      pt: 'Cancelar',
    },

    // Travel terms
    flight: {
      en: 'Flight',
      es: 'Vuelo',
      pt: 'Voo',
    },
    hotel: {
      en: 'Hotel',
      es: 'Hotel',
      pt: 'Hotel',
    },
    'car-rental': {
      en: 'Car Rental',
      es: 'Alquiler de Coches',
      pt: 'Aluguel de Carros',
    },

    // Dates
    departure: {
      en: 'Departure',
      es: 'Salida',
      pt: 'Partida',
    },
    return: {
      en: 'Return',
      es: 'Regreso',
      pt: 'Retorno',
    },

    // Passenger types
    adult: {
      en: 'Adult',
      es: 'Adulto',
      pt: 'Adulto',
    },
    child: {
      en: 'Child',
      es: 'Niño',
      pt: 'Criança',
    },
    infant: {
      en: 'Infant',
      es: 'Bebé',
      pt: 'Bebê',
    },

    // Common phrases
    'thank-you': {
      en: 'Thank you',
      es: 'Gracias',
      pt: 'Obrigado',
    },
    'youre-welcome': {
      en: "You're welcome",
      es: 'De nada',
      pt: 'De nada',
    },
    'how-can-i-help': {
      en: 'How can I help you?',
      es: '¿Cómo puedo ayudarte?',
      pt: 'Como posso ajudá-lo?',
    },
  };

  return translations[key]?.[language] || key;
}

/**
 * Format a consultant greeting in the detected language
 * Natural and humanized, not corporate
 */
export function formatConsultantGreeting(
  consultantName: string,
  consultantTitle: string,
  language: SupportedLanguage
): string {
  // Map of natural greetings by consultant type and language
  const greetings: Record<string, Record<SupportedLanguage, string>> = {
    'Flight': {
      en: `Hey! I'm ${consultantName} 👋 I love helping people find great flights! Where are you looking to go?`,
      es: `¡Hola! Soy ${consultantName} 👋 ¡Me encanta ayudar a encontrar vuelos perfectos! ¿A dónde quieres ir?`,
      pt: `Oi! Sou ${consultantName} 👋 Adoro ajudar pessoas a encontrar voos perfeitos! Para onde você quer ir?`,
    },
    'Hotel': {
      en: `Welcome! 🏨 I'm ${consultantName} and I'd love to help you find the perfect place to stay. Where are you headed?`,
      es: `¡Bienvenido! 🏨 Soy ${consultantName} y me encantaría ayudarte a encontrar el lugar perfecto. ¿A dónde vas?`,
      pt: `Bem-vindo! 🏨 Sou ${consultantName} e adoraria te ajudar a encontrar o lugar perfeito. Pra onde você vai?`,
    },
    'Customer Service': {
      en: `Hi! 💕 I'm ${consultantName} - I'm here to help you plan something amazing. What kind of trip are you dreaming about?`,
      es: `¡Hola! 💕 Soy ${consultantName} - estoy aquí para ayudarte a planear algo increíble. ¿Qué tipo de viaje estás soñando?`,
      pt: `Oi! 💕 Sou ${consultantName} - estou aqui pra te ajudar a planejar algo incrível. Que tipo de viagem você está sonhando?`,
    },
  };

  // Try to match consultant title to greeting type
  for (const [type, languageGreetings] of Object.entries(greetings)) {
    if (consultantTitle.toLowerCase().includes(type.toLowerCase())) {
      return languageGreetings[language];
    }
  }

  // Default natural greeting
  if (language === 'en') {
    return `Hey! I'm ${consultantName} 👋 I'm here to help. What do you need?`;
  }
  if (language === 'es') {
    return `¡Hola! Soy ${consultantName} 👋 Estoy aquí para ayudar. ¿Qué necesitas?`;
  }
  if (language === 'pt') {
    return `Oi! Sou ${consultantName} 👋 Estou aqui pra ajudar. O que você precisa?`;
  }

  return `Hey! I'm ${consultantName} 👋`;
}

/**
 * Auto-detect and respond in user's language
 * Example usage in conversation flow
 */
export function autoDetectAndRespond(
  userMessage: string,
  responseTemplate: Record<SupportedLanguage, string>
): { language: SupportedLanguage; response: string; confidence: number } {
  const detection = detectLanguage(userMessage);
  const response = responseTemplate[detection.language] || responseTemplate.en;

  return {
    language: detection.language,
    response,
    confidence: detection.confidence,
  };
}

/**
 * Get language preference from conversation history
 * Looks at recent messages to determine consistent language
 */
export function getLanguageFromHistory(
  messages: string[],
  defaultLanguage: SupportedLanguage = 'en'
): SupportedLanguage {
  if (!messages || messages.length === 0) {
    return defaultLanguage;
  }

  // Analyze last 5 messages
  const recentMessages = messages.slice(-5);
  const languageCounts: Record<SupportedLanguage, number> = { en: 0, es: 0, pt: 0 };

  for (const message of recentMessages) {
    const detected = detectLanguageQuick(message);
    languageCounts[detected]++;
  }

  // Return most common language
  const sortedCounts = (Object.entries(languageCounts) as [SupportedLanguage, number][])
    .sort((a, b) => b[1] - a[1]);

  return sortedCounts[0][0];
}

/**
 * Export language names for UI display
 */
export const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

/**
 * Export language flags/emojis
 */
export const LANGUAGE_FLAGS = {
  en: '🇺🇸',
  es: '🇪🇸',
  pt: '🇧🇷',
};
