/**
 * Language Detection Utility
 * Automatically detects the language from user messages
 * Supports: English (en), Portuguese (pt), Spanish (es)
 */

/**
 * Common Portuguese words and patterns
 */
const PORTUGUESE_INDICATORS = [
  // Common Portuguese words
  /\b(você|voce|vc|tudo|bem|obrigad[oa]|olá|oi|tchau|sim|não|nao|por favor|preciso|quero|gostaria|pode|fazer|cotação|cotacao|passagens|passagem|voo|voos|hotel|hoteis|hotéis|viagem|destino)\b/i,
  // Portuguese-specific patterns
  /ção\b/i,
  /ões\b/i,
  /ã[eo]s?\b/i,
  // Common phrases
  /\bpode\s+(ser|fazer|ajudar)/i,
  /\bquero\s+(fazer|ir|viajar)/i,
  /\b(preciso|gostaria)\s+de\b/i,
];

/**
 * Common Spanish words and patterns
 */
const SPANISH_INDICATORS = [
  // Common Spanish words
  /\b(hola|buenos|buenas|días|dia|tardes|noches|gracias|por\s+favor|sí|si|no|quiero|necesito|puedo|puede|ayuda|ayudar|vuelo|vuelos|hotel|hoteles|viaje|destino)\b/i,
  // Spanish-specific patterns
  /ción\b/i,
  /\b¿/,
  /¡/,
  // Common phrases
  /\bpuede[s]?\s+(ser|hacer|ayudar)/i,
  /\bquiero\s+(hacer|ir|viajar)/i,
  /\b(necesito|quisiera)\s+(un|una)\b/i,
  /\b¿(cómo|como|qué|que|cuánto|cuando)\b/i,
];

/**
 * Common English words (less specific, used as fallback)
 */
const ENGLISH_INDICATORS = [
  /\b(hello|hi|hey|thanks|thank\s+you|please|yes|no|want|need|can|help|flight|flights|hotel|hotels|trip|destination)\b/i,
  /\bcan\s+you\b/i,
  /\bi\s+(want|need|would\s+like)\b/i,
];

/**
 * Detect the language from a message
 * Returns 'pt' for Portuguese, 'es' for Spanish, 'en' for English
 */
export function detectLanguageFromMessage(message: string): 'en' | 'pt' | 'es' {
  if (!message || message.trim().length === 0) {
    return 'en'; // Default to English for empty messages
  }

  const cleanMessage = message.toLowerCase().trim();

  // Count matches for each language
  let portugueseScore = 0;
  let spanishScore = 0;
  let englishScore = 0;

  // Check Portuguese indicators
  for (const pattern of PORTUGUESE_INDICATORS) {
    if (pattern.test(cleanMessage)) {
      portugueseScore++;
    }
  }

  // Check Spanish indicators
  for (const pattern of SPANISH_INDICATORS) {
    if (pattern.test(cleanMessage)) {
      spanishScore++;
    }
  }

  // Check English indicators
  for (const pattern of ENGLISH_INDICATORS) {
    if (pattern.test(cleanMessage)) {
      englishScore++;
    }
  }

  // Determine language based on highest score
  // Portuguese and Spanish share some patterns (like "ción"), so we need to be careful
  if (portugueseScore > 0 && portugueseScore >= spanishScore) {
    return 'pt';
  } else if (spanishScore > 0 && spanishScore > portugueseScore) {
    return 'es';
  } else if (englishScore > 0) {
    return 'en';
  }

  // Default to English if no clear indicators
  return 'en';
}

/**
 * Check if message contains language switching intent
 * Examples: "can we speak in Portuguese?", "pode ser em português?"
 */
export function detectLanguageSwitchIntent(message: string): 'en' | 'pt' | 'es' | null {
  const cleanMessage = message.toLowerCase().trim();

  // Portuguese language switch
  if (
    /\b(pode|poderia|pode\s+ser|vamos|falar)\s+(em\s+)?portugu[eê]s/i.test(cleanMessage) ||
    /\bportugu[eê]s\s+(por\s+favor|please)/i.test(cleanMessage)
  ) {
    return 'pt';
  }

  // Spanish language switch
  if (
    /\b(puede|podría|puede\s+ser|podemos|hablar)\s+(en\s+)?espa[ñn]ol/i.test(cleanMessage) ||
    /\bespa[ñn]ol\s+(por\s+favor|please)/i.test(cleanMessage)
  ) {
    return 'es';
  }

  // English language switch
  if (
    /\b(can|could|can\s+we|speak|talk)\s+(in\s+)?english/i.test(cleanMessage) ||
    /\benglish\s+please/i.test(cleanMessage)
  ) {
    return 'en';
  }

  return null;
}

/**
 * Generate language switch confirmation message
 */
export function getLanguageSwitchMessage(targetLanguage: 'en' | 'pt' | 'es'): string {
  switch (targetLanguage) {
    case 'pt':
      return 'Detectei que você está escrevendo em português! 😊 Vou continuar nossa conversa em português.';
    case 'es':
      return '¡Detecté que estás escribiendo en español! 😊 Continuaré nuestra conversación en español.';
    case 'en':
      return 'I detected you\'re writing in English! 😊 I\'ll continue our conversation in English.';
  }
}
