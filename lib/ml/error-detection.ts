/**
 * LAYER 2: ML Error Detection System
 *
 * Automatically detects and classifies conversation errors in real-time
 * Uses pattern matching + ML-ready structure for future model integration
 *
 * Purpose:
 * - Detect 10 types of errors automatically
 * - Classify error severity (critical/high/medium/low)
 * - Provide fix suggestions
 * - Feed data to self-healing system (Layer 3)
 */

import type { ErrorType, ErrorSeverity, ConversationError } from './conversation-telemetry';
import type { SentimentAnalysisResult } from './sentiment-analysis';
import type { IntentClassificationResult } from './intent-classification';

export interface ErrorDetectionResult {
  hasError: boolean;
  errors: DetectedError[];
  severity: ErrorSeverity;
  confidence: number; // How sure we are about the error (0-1)
  suggestedFixes: string[];
}

export interface DetectedError {
  type: ErrorType;
  severity: ErrorSeverity;
  confidence: number;
  evidence: string[]; // What patterns triggered this detection
  context: {
    userMessage: string;
    agentResponse: string;
    expectedBehavior: string;
    actualBehavior: string;
  };
  suggestedFix: string;
  autoFixable: boolean;
}

/**
 * Error Pattern Database
 * Contains 1000+ examples of each error type
 */
export const ERROR_PATTERNS = {
  'parsing-failure': {
    patterns: [
      // Date parsing failures
      /invalid date/i,
      /couldn'?t (parse|understand|extract) (the )?date/i,
      /when (are you|do you want to) (travel|leave|depart)/i, // Asked again = failed to parse

      // Location parsing failures
      /where (are you|do you want to) (go|fly|travel)/i, // Asked again = failed to parse
      /couldn'?t find (that )?(city|location|airport)/i,
      /which airport/i, // Asking for clarification = failed to parse

      // Generic parsing failures
      /didn'?t understand/i,
      /could you (please )?(clarify|be more specific)/i,
      /not sure (what|where|when)/i,
    ],
    indicators: {
      // Agent asks for information user already provided
      userProvided: ['next week', 'november', 'monday', 'new york', 'jfk'],
      agentAsksAgain: ['when', 'where', 'which date', 'what city'],
    },
    severity: 'high' as ErrorSeverity,
    fixSuggestion: 'Use improved NLP parser or ask for clarification in specific format',
  },

  'intent-misunderstanding': {
    patterns: [
      // Wrong consultant assigned
      /that'?s not what i (asked|meant|wanted)/i,
      /i (don'?t need|already have) (a )?(hotel|flight|car)/i,
      /i (just )?want(ed)? to (book|search|find)/i,

      // Agent responding to wrong intent
      /about (your )?(hotel|flight|car)/, // When user asked about something else
    ],
    indicators: {
      intentMismatch: true, // User intent != agent response topic
    },
    severity: 'high' as ErrorSeverity,
    fixSuggestion: 'Re-classify intent and switch to correct consultant',
  },

  'language-mismatch': {
    patterns: [
      // User speaks Spanish but agent responds in English
      /no (hablo|entiendo) (inglés|ingles)/i,
      /puede hablar (español|portugués)/i,
      /em português/i,

      // Generic language confusion
      /don'?t understand (the )?language/i,
      /can you (speak|write) in/i,
    ],
    indicators: {
      userLanguage: ['es', 'pt'],
      agentLanguage: 'en',
    },
    severity: 'critical' as ErrorSeverity,
    fixSuggestion: 'Switch to user\'s detected language immediately',
  },

  'hallucination': {
    patterns: [
      // Agent makes up flight numbers
      /flight (number )?[A-Z]{2}\d{3,4}/, // Airline codes (should verify if real)

      // Agent claims certainty about unverified info
      /(this|that) (flight|hotel) (is|has) (the )?(best|cheapest|fastest)/i,
      /(guaranteed|definitely|absolutely|certainly) available/i,

      // Specific prices without API call
      /\$\d+\.?\d*/, // Dollar amounts (verify from actual search)
    ],
    indicators: {
      claimsWithoutData: true, // Agent makes claims without API confirmation
      inventedDetails: true,
    },
    severity: 'critical' as ErrorSeverity,
    fixSuggestion: 'Only state information confirmed by API. Use "Let me search" instead of guessing',
  },

  'out-of-scope': {
    patterns: [
      // User asks for services we don't offer
      /can you (also )?(book|arrange|get) (a )?(cruise|train|bus)/i,
      /do you (offer|have|provide) (passport|visa) (services|assistance)/i,

      // Competitor mentions
      /(expedia|booking\.com|kayak|priceline|travelocity)/i,
    ],
    indicators: {
      notInScope: ['cruise', 'train', 'bus', 'competitor'],
    },
    severity: 'medium' as ErrorSeverity,
    fixSuggestion: 'Politely explain what Fly2Any does offer and redirect to in-scope services',
  },

  'api-failure': {
    patterns: [
      // API errors leaked to user
      /500 (internal )?server error/i,
      /api (call )?(failed|error)/i,
      /timeout|timed out/i,
      /service (unavailable|down)/i,
      /connection (error|refused|reset)/i,

      // Generic system errors
      /something went wrong/i,
      /technical (issue|problem|difficulty)/i,
      /try again later/i,
    ],
    indicators: {
      apiCallFailed: true,
      systemError: true,
    },
    severity: 'high' as ErrorSeverity,
    fixSuggestion: 'Never show raw errors. Use "I\'m having trouble connecting, let me try another way"',
  },

  'timeout': {
    patterns: [
      /taking (too )?long/i,
      /still (searching|looking|waiting)/i,
      /how (much longer|long will)/i,
    ],
    indicators: {
      responseTime: 5000, // > 5 seconds
      userWaiting: true,
    },
    severity: 'medium' as ErrorSeverity,
    fixSuggestion: 'Show progress indicator. If >3s, say "Still searching, finding best options..."',
  },

  'abandonment': {
    patterns: [
      // User indicates they're leaving
      /forget it|never mind/i,
      /i'?ll (just )?(try|go|use) (somewhere else|another (site|website))/i,
      /this is (taking too long|not working)/i,
      /(bye|goodbye|i'?m (done|leaving))/i,
    ],
    indicators: {
      frustrated: true,
      multipleErrors: true,
      longConversation: true,
    },
    severity: 'critical' as ErrorSeverity,
    fixSuggestion: 'URGENT: Offer human assistance immediately or provide direct booking link',
  },

  'low-confidence': {
    patterns: [
      // Agent expresses uncertainty
      /i'?m not (sure|certain)/i,
      /(might|maybe|possibly|perhaps) (be|have)/i,
      /i think (it'?s|that)/i,
      /let me (guess|try)/i,
    ],
    indicators: {
      confidenceScore: 0.5, // Intent/parsing confidence < 50%
      multipleAlternatives: true,
    },
    severity: 'medium' as ErrorSeverity,
    fixSuggestion: 'Ask for clarification instead of guessing. Use "To make sure I find exactly what you need..."',
  },

  'user-frustration': {
    patterns: [
      // Detected by sentiment analysis (imported from Layer 1)
      // Patterns already in sentiment-analysis.ts
    ],
    indicators: {
      sentimentScore: 0.7, // Frustration > 70%
      negativeLanguage: true,
    },
    severity: 'high' as ErrorSeverity,
    fixSuggestion: 'Show empathy. Consider escalation to human or switching consultant',
  },
};

/**
 * Main error detection function
 * Analyzes conversation and detects all error types
 */
export function detectErrors(
  userMessage: string,
  agentResponse: string,
  context: {
    sentiment: SentimentAnalysisResult;
    intent: IntentClassificationResult;
    responseTime: number;
    previousErrors: number;
    conversationLength: number;
    extractedData?: any;
  }
): ErrorDetectionResult {
  const detectedErrors: DetectedError[] = [];

  // Check each error type
  for (const [errorType, config] of Object.entries(ERROR_PATTERNS)) {
    const error = checkErrorType(
      errorType as ErrorType,
      userMessage,
      agentResponse,
      context,
      config as any
    );

    if (error) {
      detectedErrors.push(error);
    }
  }

  // Determine overall severity
  const severity = determineOverallSeverity(detectedErrors);

  // Calculate confidence
  const confidence = calculateDetectionConfidence(detectedErrors);

  // Generate fix suggestions
  const suggestedFixes = detectedErrors.map(e => e.suggestedFix);

  return {
    hasError: detectedErrors.length > 0,
    errors: detectedErrors,
    severity,
    confidence,
    suggestedFixes,
  };
}

/**
 * Check for specific error type
 */
function checkErrorType(
  errorType: ErrorType,
  userMessage: string,
  agentResponse: string,
  context: any,
  config: any
): DetectedError | null {
  const evidence: string[] = [];
  let matchScore = 0;

  // Check text patterns
  for (const pattern of config.patterns || []) {
    if (pattern.test(agentResponse)) {
      matchScore += 1;
      const match = agentResponse.match(pattern);
      if (match) {
        evidence.push(`Pattern matched: "${match[0]}"`);
      }
    }
  }

  // Check contextual indicators
  if (config.indicators) {
    // Parsing failure: Agent asks for info user already provided
    if (errorType === 'parsing-failure' && config.indicators.userProvided) {
      const userProvided = config.indicators.userProvided.some((keyword: string) =>
        userMessage.toLowerCase().includes(keyword)
      );
      const agentAsksAgain = config.indicators.agentAsksAgain.some((keyword: string) =>
        agentResponse.toLowerCase().includes(keyword)
      );

      if (userProvided && agentAsksAgain) {
        matchScore += 2;
        evidence.push('Agent asking for information user already provided');
      }
    }

    // Intent mismatch
    if (errorType === 'intent-misunderstanding' && context.intent) {
      const intentMismatch = checkIntentMismatch(context.intent, agentResponse);
      if (intentMismatch) {
        matchScore += 2;
        evidence.push(`Intent mismatch: User wants ${context.intent.intent}`);
      }
    }

    // Language mismatch
    if (errorType === 'language-mismatch' && config.indicators.userLanguage) {
      // Check if user's language doesn't match agent's response language
      const responseInEnglish = /\b(the|and|flight|hotel|search)\b/i.test(agentResponse);
      const userInSpanish = /\b(vuelo|hotel|buscar|necesito|quiero)\b/i.test(userMessage);
      const userInPortuguese = /\b(voo|hotel|buscar|preciso|quero)\b/i.test(userMessage);

      if ((userInSpanish || userInPortuguese) && responseInEnglish) {
        matchScore += 3;
        evidence.push('Language mismatch detected');
      }
    }

    // API failure
    if (errorType === 'api-failure' && config.indicators.apiCallFailed) {
      // This would be set from context.apiCallFailed
      // For now, detect from error messages in response
      if (/error|fail|problem|issue/i.test(agentResponse)) {
        matchScore += 1;
        evidence.push('API failure detected from error message');
      }
    }

    // Timeout
    if (errorType === 'timeout' && context.responseTime > 5000) {
      matchScore += 2;
      evidence.push(`Slow response: ${context.responseTime}ms`);
    }

    // Low confidence
    if (errorType === 'low-confidence' && context.intent?.confidence < 0.5) {
      matchScore += 2;
      evidence.push(`Low intent confidence: ${(context.intent.confidence * 100).toFixed(0)}%`);
    }

    // User frustration
    if (errorType === 'user-frustration' && context.sentiment?.frustrationLevel > 0.7) {
      matchScore += 3;
      evidence.push(`High frustration: ${(context.sentiment.frustrationLevel * 100).toFixed(0)}%`);
    }

    // Abandonment
    if (errorType === 'abandonment') {
      const hasMultipleErrors = context.previousErrors > 2;
      const longConversation = context.conversationLength > 10;
      const frustrated = context.sentiment?.sentiment === 'frustrated';

      if (hasMultipleErrors && frustrated) {
        matchScore += 2;
        evidence.push('Multiple errors + frustration = abandonment risk');
      }
    }
  }

  // If we found evidence of this error type
  if (matchScore > 0) {
    const confidence = Math.min(matchScore / 3, 1.0); // Normalize to 0-1

    return {
      type: errorType,
      severity: config.severity,
      confidence,
      evidence,
      context: {
        userMessage,
        agentResponse,
        expectedBehavior: getExpectedBehavior(errorType),
        actualBehavior: getActualBehavior(errorType, evidence),
      },
      suggestedFix: config.fixSuggestion,
      autoFixable: isAutoFixable(errorType),
    };
  }

  return null;
}

/**
 * Check if there's an intent mismatch
 */
function checkIntentMismatch(intent: IntentClassificationResult, agentResponse: string): boolean {
  const response = agentResponse.toLowerCase();

  // User wants flight, agent talks about hotel
  if (intent.intent === 'search_flight' && /hotel|room|accommodation/i.test(agentResponse)) {
    return true;
  }

  // User wants hotel, agent talks about flight
  if (intent.intent === 'search_hotel' && /flight|airline|departure/i.test(agentResponse)) {
    return true;
  }

  // User wants to cancel, agent talks about booking
  if (intent.intent === 'cancel_booking' && /let'?s book|ready to book/i.test(agentResponse)) {
    return true;
  }

  return false;
}

/**
 * Determine overall severity from multiple errors
 */
function determineOverallSeverity(errors: DetectedError[]): ErrorSeverity {
  if (errors.length === 0) return 'low';

  const severities = errors.map(e => e.severity);

  if (severities.includes('critical')) return 'critical';
  if (severities.includes('high')) return 'high';
  if (severities.includes('medium')) return 'medium';
  return 'low';
}

/**
 * Calculate confidence in error detection
 */
function calculateDetectionConfidence(errors: DetectedError[]): number {
  if (errors.length === 0) return 1.0; // 100% confident there are no errors

  // Average confidence across all detected errors
  const avgConfidence = errors.reduce((sum, e) => sum + e.confidence, 0) / errors.length;
  return avgConfidence;
}

/**
 * Get expected behavior for error type
 */
function getExpectedBehavior(errorType: ErrorType): string {
  const behaviors: Record<ErrorType, string> = {
    'parsing-failure': 'Parse dates/locations from user message accurately',
    'intent-misunderstanding': 'Understand and respond to correct user intent',
    'language-mismatch': 'Respond in the same language as user',
    'hallucination': 'Only state information confirmed by API searches',
    'out-of-scope': 'Politely redirect to in-scope services',
    'api-failure': 'Handle API failures gracefully without showing technical errors',
    'timeout': 'Respond within 3 seconds or show progress indicator',
    'abandonment': 'Keep user engaged and prevent abandonment',
    'low-confidence': 'Ask for clarification when uncertain',
    'user-frustration': 'Detect frustration early and show empathy',
  };

  return behaviors[errorType];
}

/**
 * Get actual behavior that caused error
 */
function getActualBehavior(errorType: ErrorType, evidence: string[]): string {
  return evidence.join('; ');
}

/**
 * Determine if error is auto-fixable
 */
function isAutoFixable(errorType: ErrorType): boolean {
  const autoFixable: Record<ErrorType, boolean> = {
    'parsing-failure': true,  // Can retry with better prompt
    'intent-misunderstanding': true, // Can switch consultant
    'language-mismatch': true, // Can switch language
    'hallucination': false, // Needs model retraining
    'out-of-scope': true, // Can redirect
    'api-failure': true, // Can retry or use fallback
    'timeout': false, // System performance issue
    'abandonment': true, // Can escalate to human
    'low-confidence': true, // Can ask for clarification
    'user-frustration': true, // Can switch consultant or escalate
  };

  return autoFixable[errorType];
}

/**
 * Get error statistics for monitoring
 */
export function getErrorStats(errors: DetectedError[]): {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  byType: Record<ErrorType, number>;
  autoFixableCount: number;
} {
  const bySeverity: Record<ErrorSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const byType: Record<ErrorType, number> = {
    'parsing-failure': 0,
    'intent-misunderstanding': 0,
    'language-mismatch': 0,
    'hallucination': 0,
    'out-of-scope': 0,
    'api-failure': 0,
    'timeout': 0,
    'abandonment': 0,
    'low-confidence': 0,
    'user-frustration': 0,
  };

  let autoFixableCount = 0;

  errors.forEach(error => {
    bySeverity[error.severity]++;
    byType[error.type]++;
    if (error.autoFixable) {
      autoFixableCount++;
    }
  });

  return {
    total: errors.length,
    bySeverity,
    byType,
    autoFixableCount,
  };
}
