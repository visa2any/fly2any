/**
 * LOCAL ML LANGUAGE DETECTOR
 * ==========================
 * Statistical language detection using n-gram analysis and character frequency
 * NO external APIs - runs entirely on server
 *
 * Detects: English, Portuguese, Spanish
 * Method: Bayesian classification with character/word patterns
 */

export type SupportedLanguage = 'en' | 'pt' | 'es';

interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number; // 0-1
  scores: {
    en: number;
    pt: number;
    es: number;
  };
  method: 'pattern' | 'statistical' | 'hybrid';
  indicators: string[]; // Matched keywords/patterns
}

interface LanguageProfile {
  // Character frequency (most distinctive characters)
  charFrequencies: Map<string, number>;

  // Common words (top 100 most frequent)
  commonWords: Set<string>;

  // Distinctive n-grams (2-3 character sequences)
  distinctiveNgrams: Set<string>;

  // Grammar patterns (regex)
  grammarPatterns: RegExp[];
}

/**
 * Language profiles based on statistical analysis
 */
const LANGUAGE_PROFILES: Record<SupportedLanguage, LanguageProfile> = {
  en: {
    charFrequencies: new Map([
      ['e', 0.127], ['t', 0.091], ['a', 0.082], ['o', 0.075], ['i', 0.070],
      ['n', 0.067], ['s', 0.063], ['h', 0.061], ['r', 0.060],
    ]),
    commonWords: new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
      'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
      'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
      'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
      'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
      'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
      'need', 'flight', 'travel', 'want', 'book', 'ticket', 'price', 'help', 'hello',
    ]),
    distinctiveNgrams: new Set([
      'th', 'he', 'in', 'er', 'an', 'ed', 'nd', 'to', 'en', 'or',
      'ing', 'the', 'and', 'ion', 'tion',
    ]),
    grammarPatterns: [
      /\b(i|you|we|they|he|she|it)\s+(am|is|are|was|were|will|would|can|could)\b/i,
      /\b(the|a|an)\s+\w+/i,
      /\b\w+ing\b/i, // -ing endings
      /\b\w+ed\b/i,  // -ed endings
    ],
  },

  pt: {
    charFrequencies: new Map([
      ['a', 0.146], ['e', 0.126], ['o', 0.107], ['s', 0.078], ['r', 0.065],
      ['i', 0.062], ['m', 0.047], ['d', 0.050], ['ã', 0.015], ['ç', 0.004],
    ]),
    commonWords: new Set([
      'o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para',
      'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais',
      'as', 'dos', 'como', 'mas', 'ao', 'ele', 'das', 'à', 'seu', 'sua',
      'ou', 'quando', 'muito', 'nos', 'já', 'eu', 'também', 'só', 'pelo', 'pela',
      'até', 'isso', 'ela', 'entre', 'depois', 'sem', 'mesmo', 'aos', 'seus', 'quem',
      'nas', 'me', 'esse', 'eles', 'você', 'essa', 'num', 'nem', 'suas', 'meu',
      'às', 'minha', 'numa', 'pelos', 'elas', 'qual', 'nós', 'lhe', 'deles', 'essas',
      'esses', 'pelas', 'este', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus',
      'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas',
      // Travel-specific Portuguese
      'voo', 'viagem', 'quero', 'preciso', 'gostaria', 'pode', 'fazer', 'reserva',
      'passagem', 'hotel', 'destino', 'olá', 'oi', 'bom', 'dia', 'obrigado', 'obrigada',
    ]),
    distinctiveNgrams: new Set([
      'de', 'qu', 'ão', 'nh', 'lh', 'ça', 'çã', 'õe', 'gu', 'em',
      'que', 'nha', 'lho', 'ção', 'ões',
    ]),
    grammarPatterns: [
      /\b(o|a|os|as)\s+\w+/i, // Articles
      /\b(é|são|está|estão|foi|eram)\b/i, // Ser/Estar
      /\b\w+(ção|são|ões|mente)\b/i, // Common endings
      /\b(você|vocês|senhor|senhora)\b/i, // Pronouns
      /[ãõáéíóúâêôàç]/i, // Portuguese diacritics
    ],
  },

  es: {
    charFrequencies: new Map([
      ['e', 0.137], ['a', 0.125], ['o', 0.086], ['s', 0.072], ['n', 0.067],
      ['r', 0.068], ['i', 0.063], ['l', 0.050], ['d', 0.058], ['ñ', 0.003],
    ]),
    commonWords: new Set([
      'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se',
      'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le',
      'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir',
      'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando',
      'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno',
      'mismo', 'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero',
      'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella', 'si',
      'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto', 'hombre',
      'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida', 'quedar', 'siempre',
      // Travel-specific Spanish
      'vuelo', 'viaje', 'quiero', 'necesito', 'quisiera', 'puede', 'hacer', 'reserva',
      'billete', 'pasaje', 'hotel', 'destino', 'hola', 'buenos', 'días', 'gracias',
    ]),
    distinctiveNgrams: new Set([
      'es', 'en', 'el', 'la', 'de', 'qu', 'ci', 'ón', 'ñ', 'ue',
      'que', 'ión', 'aci', 'ción', 'mente',
    ]),
    grammarPatterns: [
      /\b(el|la|los|las)\s+\w+/i, // Articles
      /\b(es|son|está|están|fue|eran)\b/i, // Ser/Estar
      /\b\w+(ción|sión|mente|dad)\b/i, // Common endings
      /\b(usted|ustedes|señor|señora)\b/i, // Pronouns
      /[ñáéíóúü]/i, // Spanish diacritics
    ],
  },
};

/**
 * Explicit language request patterns
 * High confidence indicators of language switching intent
 */
const LANGUAGE_REQUEST_PATTERNS: Record<SupportedLanguage, RegExp[]> = {
  pt: [
    /\b(português|portugues|portuguese)\b/i,
    /\b(fala|falar)\s+(português|portugues|portuguese)\b/i,
    /\b(preciso|quero|gostaria)\s+(de\s+)?(atendimento|ajuda|falar)\s+(em\s+)?(português|portugues|pt)\b/i,
    /\b(speak|need|want)\s+(portuguese|pt)\b/i,
    /\bportuguese\s+(speaker|language|please)\b/i,
  ],
  es: [
    /\b(español|espanol|spanish)\b/i,
    /\b(habla|hablar)\s+(español|espanol|spanish)\b/i,
    /\b(necesito|quiero|quisiera)\s+(atención|ayuda|hablar)\s+(en\s+)?(español|espanol|es)\b/i,
    /\b(speak|need|want)\s+(spanish|es)\b/i,
    /\bspanish\s+(speaker|language|please)\b/i,
  ],
  en: [
    /\b(english|inglês|inglés|ingles)\b/i,
    /\b(speak|need|want)\s+english\b/i,
    /\benglish\s+(speaker|language|please)\b/i,
  ],
};

export class LanguageDetector {
  private cache: Map<string, LanguageDetectionResult> = new Map();
  private readonly CACHE_SIZE = 1000;
  private readonly MIN_TEXT_LENGTH = 3;

  /**
   * Detect language from text using hybrid approach
   */
  async detect(text: string): Promise<LanguageDetectionResult> {
    const normalized = text.trim().toLowerCase();

    // Check cache first
    const cached = this.cache.get(normalized);
    if (cached) {
      return cached;
    }

    // Too short to analyze
    if (normalized.length < this.MIN_TEXT_LENGTH) {
      return this.defaultResult('en', 0.5, [], 'pattern');
    }

    // Step 1: Check for explicit language requests (highest priority)
    const requestResult = this.detectLanguageRequest(text);
    if (requestResult.confidence > 0.9) {
      this.cacheResult(normalized, requestResult);
      return requestResult;
    }

    // Step 2: Statistical analysis
    const statisticalResult = this.statisticalDetection(normalized);

    // Step 3: Pattern matching (fallback/validation)
    const patternResult = this.patternDetection(normalized);

    // Combine results (weighted average)
    const combinedResult = this.combineResults(statisticalResult, patternResult);

    // Cache result
    this.cacheResult(normalized, combinedResult);

    return combinedResult;
  }

  /**
   * Detect explicit language switch requests
   */
  private detectLanguageRequest(text: string): LanguageDetectionResult {
    const indicators: string[] = [];
    const scores = { en: 0, pt: 0, es: 0 };

    for (const [lang, patterns] of Object.entries(LANGUAGE_REQUEST_PATTERNS)) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          scores[lang as SupportedLanguage] += 0.4;
          indicators.push(match[0]);
        }
      }
    }

    // Get highest score
    const entries = Object.entries(scores) as [SupportedLanguage, number][];
    const [language, score] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));

    return {
      language,
      confidence: Math.min(score, 1.0),
      scores: scores as any,
      method: 'pattern',
      indicators,
    };
  }

  /**
   * Statistical language detection using character frequencies and n-grams
   */
  private statisticalDetection(text: string): LanguageDetectionResult {
    const scores = { en: 0, pt: 0, es: 0 };
    const indicators: string[] = [];

    // Analyze each language
    for (const lang of ['en', 'pt', 'es'] as SupportedLanguage[]) {
      const profile = LANGUAGE_PROFILES[lang];
      let score = 0;

      // 1. Character frequency analysis (30% weight)
      score += this.analyzeCharacterFrequency(text, profile) * 0.3;

      // 2. Common words (40% weight)
      const wordMatches = this.analyzeCommonWords(text, profile);
      score += wordMatches.score * 0.4;
      indicators.push(...wordMatches.matches);

      // 3. N-gram analysis (20% weight)
      score += this.analyzeNgrams(text, profile) * 0.2;

      // 4. Grammar patterns (10% weight)
      score += this.analyzeGrammarPatterns(text, profile) * 0.1;

      scores[lang] = score;
    }

    // Normalize scores to 0-1
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      for (const lang in scores) {
        scores[lang as SupportedLanguage] /= maxScore;
      }
    }

    // Get highest scoring language
    const entries = Object.entries(scores) as [SupportedLanguage, number][];
    const [language, confidence] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));

    return {
      language,
      confidence,
      scores: scores as any,
      method: 'statistical',
      indicators,
    };
  }

  /**
   * Pattern-based detection (fast fallback)
   */
  private patternDetection(text: string): LanguageDetectionResult {
    const scores = { en: 0, pt: 0, es: 0 };
    const indicators: string[] = [];

    // Portuguese patterns
    const ptPatterns = [
      /\b(olá|oi|bom dia|boa tarde|boa noite)\b/i,
      /\b(você|senhor|senhora|vocês)\b/i,
      /\b(quero|preciso|gostaria|poderia)\b/i,
      /\b(obrigad[oa]|por favor|desculpe)\b/i,
      /\b(fazer|ter|ser|estar|ir|vir)\b/i,
      /[ãõçáéíóúâêô]/i,
    ];

    // Spanish patterns
    const esPatterns = [
      /\b(hola|buenos días|buenas tardes|buenas noches)\b/i,
      /\b(usted|señor|señora|ustedes)\b/i,
      /\b(quiero|necesito|quisiera|podría)\b/i,
      /\b(gracias|por favor|disculpe|perdón)\b/i,
      /\b(hacer|tener|ser|estar|ir|venir)\b/i,
      /[ñáéíóúü]/i,
    ];

    // English patterns
    const enPatterns = [
      /\b(hello|hi|hey|good morning|good afternoon|good evening)\b/i,
      /\b(you|sir|madam|please)\b/i,
      /\b(want|need|would like|could you)\b/i,
      /\b(thank you|thanks|sorry|excuse me)\b/i,
      /\b(make|have|do|be|go|come)\b/i,
    ];

    // Count matches
    for (const pattern of ptPatterns) {
      if (pattern.test(text)) {
        scores.pt += 0.15;
        const match = text.match(pattern);
        if (match) indicators.push(match[0]);
      }
    }

    for (const pattern of esPatterns) {
      if (pattern.test(text)) {
        scores.es += 0.15;
        const match = text.match(pattern);
        if (match) indicators.push(match[0]);
      }
    }

    for (const pattern of enPatterns) {
      if (pattern.test(text)) {
        scores.en += 0.15;
        const match = text.match(pattern);
        if (match) indicators.push(match[0]);
      }
    }

    // Get highest score
    const entries = Object.entries(scores) as [SupportedLanguage, number][];
    const [language, confidence] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));

    return {
      language: confidence > 0 ? language : 'en',
      confidence: Math.min(confidence, 1.0),
      scores: scores as any,
      method: 'pattern',
      indicators,
    };
  }

  /**
   * Analyze character frequency distribution
   */
  private analyzeCharacterFrequency(text: string, profile: LanguageProfile): number {
    const charCounts = new Map<string, number>();
    let total = 0;

    // Count characters
    for (const char of text.toLowerCase()) {
      if (/[a-zàáâãäåèéêëìíîïòóôõöùúûüýÿçñ]/.test(char)) {
        charCounts.set(char, (charCounts.get(char) || 0) + 1);
        total++;
      }
    }

    if (total === 0) return 0;

    // Calculate similarity to language profile
    let similarity = 0;
    for (const [char, expectedFreq] of Array.from(profile.charFrequencies)) {
      const actualFreq = (charCounts.get(char) || 0) / total;
      const diff = Math.abs(expectedFreq - actualFreq);
      similarity += 1 - diff; // Inverse of difference
    }

    return similarity / profile.charFrequencies.size;
  }

  /**
   * Analyze common words
   */
  private analyzeCommonWords(text: string, profile: LanguageProfile): { score: number; matches: string[] } {
    const words = text.toLowerCase().split(/\s+/);
    let matches = 0;
    const matchedWords: string[] = [];

    for (const word of words) {
      if (profile.commonWords.has(word)) {
        matches++;
        matchedWords.push(word);
      }
    }

    return {
      score: words.length > 0 ? matches / words.length : 0,
      matches: matchedWords.slice(0, 5), // Top 5 matches
    };
  }

  /**
   * Analyze n-grams
   */
  private analyzeNgrams(text: string, profile: LanguageProfile): number {
    let matches = 0;
    let total = 0;

    // Extract 2-grams and 3-grams
    for (let i = 0; i < text.length - 1; i++) {
      const bigram = text.substring(i, i + 2).toLowerCase();
      if (profile.distinctiveNgrams.has(bigram)) {
        matches++;
      }
      total++;

      if (i < text.length - 2) {
        const trigram = text.substring(i, i + 3).toLowerCase();
        if (profile.distinctiveNgrams.has(trigram)) {
          matches++;
        }
        total++;
      }
    }

    return total > 0 ? matches / total : 0;
  }

  /**
   * Analyze grammar patterns
   */
  private analyzeGrammarPatterns(text: string, profile: LanguageProfile): number {
    let matches = 0;

    for (const pattern of profile.grammarPatterns) {
      if (pattern.test(text)) {
        matches++;
      }
    }

    return profile.grammarPatterns.length > 0 ? matches / profile.grammarPatterns.length : 0;
  }

  /**
   * Combine statistical and pattern results
   */
  private combineResults(
    statistical: LanguageDetectionResult,
    pattern: LanguageDetectionResult
  ): LanguageDetectionResult {
    // Weight: 70% statistical, 30% pattern
    const scores = {
      en: statistical.scores.en * 0.7 + pattern.scores.en * 0.3,
      pt: statistical.scores.pt * 0.7 + pattern.scores.pt * 0.3,
      es: statistical.scores.es * 0.7 + pattern.scores.es * 0.3,
    };

    const entries = Object.entries(scores) as [SupportedLanguage, number][];
    const [language, confidence] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));

    return {
      language,
      confidence,
      scores: scores as any,
      method: 'hybrid',
      indicators: Array.from(new Set([...statistical.indicators, ...pattern.indicators])),
    };
  }

  /**
   * Create default result
   */
  private defaultResult(
    language: SupportedLanguage,
    confidence: number,
    indicators: string[],
    method: 'pattern' | 'statistical' | 'hybrid'
  ): LanguageDetectionResult {
    return {
      language,
      confidence,
      scores: { en: 0, pt: 0, es: 0, [language]: confidence } as any,
      method,
      indicators,
    };
  }

  /**
   * Cache result with LRU eviction
   */
  private cacheResult(text: string, result: LanguageDetectionResult): void {
    // LRU cache - remove oldest if full
    if (this.cache.size >= this.CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(text, result);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.CACHE_SIZE,
      hitRate: 0, // TODO: Track hit/miss ratio
    };
  }
}

// Singleton instance
export const languageDetector = new LanguageDetector();

/**
 * Quick language detection helper
 */
export async function detectLanguage(text: string): Promise<SupportedLanguage> {
  const result = await languageDetector.detect(text);
  return result.language;
}

/**
 * Detect with full details
 */
export async function detectLanguageDetailed(text: string): Promise<LanguageDetectionResult> {
  return await languageDetector.detect(text);
}
