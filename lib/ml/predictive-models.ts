/**
 * Predictive ML Models
 *
 * Predicts user behavior to enable proactive interventions:
 * - Will user abandon conversation?
 * - Will user make a booking?
 * - Does user need escalation to human?
 */

import type { ConversationTelemetry } from './conversation-telemetry';
import type { SentimentAnalysisResult } from './sentiment-analysis';
import type { IntentClassificationResult } from './intent-classification';

export interface PredictionResult {
  willAbandon: number; // 0-1 probability
  willBook: number; // 0-1 probability
  needsEscalation: number; // 0-1 probability
  confidence: number; // How confident in predictions
  factors: {
    name: string;
    impact: number; // -1 to +1 (negative = bad sign, positive = good sign)
    description: string;
  }[];
}

/**
 * Predict user behavior based on conversation signals
 */
export function predictUserBehavior(
  telemetry: ConversationTelemetry,
  sentiment: SentimentAnalysisResult,
  intent: IntentClassificationResult
): PredictionResult {
  const factors: PredictionResult['factors'] = [];

  let abandonmentScore = 0;
  let bookingScore = 0;
  let escalationScore = 0;

  // FACTOR 1: Sentiment
  if (sentiment.sentiment === 'frustrated') {
    abandonmentScore += 0.4;
    escalationScore += 0.3;
    factors.push({
      name: 'User Frustration',
      impact: -0.8,
      description: `User is frustrated (${Math.round(sentiment.frustrationLevel * 100)}% level)`,
    });
  } else if (sentiment.sentiment === 'positive') {
    bookingScore += 0.3;
    abandonmentScore -= 0.2;
    factors.push({
      name: 'Positive Sentiment',
      impact: 0.6,
      description: 'User seems satisfied and engaged',
    });
  }

  // FACTOR 2: Error count
  if (telemetry.errorCount > 2) {
    abandonmentScore += 0.3;
    escalationScore += 0.2;
    factors.push({
      name: 'Multiple Errors',
      impact: -0.6,
      description: `${telemetry.errorCount} errors occurred in conversation`,
    });
  }

  // FACTOR 3: Response time
  if (telemetry.responseTime > 3000) {
    abandonmentScore += 0.2;
    factors.push({
      name: 'Slow Response',
      impact: -0.4,
      description: `Response took ${(telemetry.responseTime / 1000).toFixed(1)}s`,
    });
  } else if (telemetry.responseTime < 1000) {
    bookingScore += 0.1;
    factors.push({
      name: 'Fast Response',
      impact: 0.3,
      description: 'Quick response time',
    });
  }

  // FACTOR 4: Intent confidence
  if (intent.confidence < 0.5) {
    abandonmentScore += 0.2;
    escalationScore += 0.1;
    factors.push({
      name: 'Unclear Intent',
      impact: -0.5,
      description: `Low intent detection confidence (${Math.round(intent.confidence * 100)}%)`,
    });
  }

  // FACTOR 5: Conversation stage
  if (telemetry.conversationStage === 'presenting' || telemetry.conversationStage === 'booking') {
    bookingScore += 0.4;
    abandonmentScore -= 0.1;
    factors.push({
      name: 'Advanced Stage',
      impact: 0.7,
      description: `User reached ${telemetry.conversationStage} stage`,
    });
  } else if (telemetry.conversationStage === 'discovery' && telemetry.messageIndex > 5) {
    abandonmentScore += 0.2;
    factors.push({
      name: 'Stuck in Discovery',
      impact: -0.4,
      description: `${telemetry.messageIndex} messages without progressing`,
    });
  }

  // FACTOR 6: Parsing confidence
  if (telemetry.parsingConfidence < 0.6) {
    abandonmentScore += 0.15;
    factors.push({
      name: 'Poor Data Extraction',
      impact: -0.3,
      description: 'Struggling to extract trip details',
    });
  }

  // FACTOR 7: Message count
  if (telemetry.messageIndex > 10) {
    if (telemetry.conversationStage !== 'presenting' && telemetry.conversationStage !== 'booking') {
      abandonmentScore += 0.25;
      escalationScore += 0.2;
      factors.push({
        name: 'Long Conversation',
        impact: -0.5,
        description: `${telemetry.messageIndex} messages without progress`,
      });
    }
  }

  // FACTOR 8: Booking intent
  if (intent.intent === 'book_flight' || intent.intent === 'book_hotel') {
    bookingScore += 0.3;
    factors.push({
      name: 'Clear Booking Intent',
      impact: 0.8,
      description: 'User explicitly wants to book',
    });
  }

  // FACTOR 9: Critical errors
  const hasCriticalError = telemetry.errors.some(e => e.severity === 'critical');
  if (hasCriticalError) {
    abandonmentScore += 0.5;
    escalationScore += 0.4;
    factors.push({
      name: 'Critical Error',
      impact: -0.9,
      description: 'System error that blocks progress',
    });
  }

  // FACTOR 10: API failures
  const apiFailures = telemetry.apiCalls?.filter(api => !api.success).length || 0;
  if (apiFailures > 0) {
    abandonmentScore += apiFailures * 0.15;
    factors.push({
      name: 'API Failures',
      impact: -0.6,
      description: `${apiFailures} API calls failed`,
    });
  }

  // Normalize scores to 0-1 range
  const willAbandon = Math.min(Math.max(abandonmentScore, 0), 1);
  const willBook = Math.min(Math.max(bookingScore, 0), 1);
  const needsEscalation = Math.min(Math.max(escalationScore, 0), 1);

  // Calculate overall confidence
  const confidence = calculatePredictionConfidence(telemetry);

  return {
    willAbandon,
    willBook,
    needsEscalation,
    confidence,
    factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)),
  };
}

/**
 * Calculate confidence in predictions
 * More data = higher confidence
 */
function calculatePredictionConfidence(telemetry: ConversationTelemetry): number {
  let confidence = 0.3; // Base confidence

  // More messages = more data = higher confidence
  confidence += Math.min(telemetry.messageIndex / 20, 0.3);

  // High quality detections = higher confidence
  if (telemetry.intentDetectionConfidence > 0.7) {
    confidence += 0.2;
  }

  if (telemetry.languageDetectionConfidence > 0.8) {
    confidence += 0.1;
  }

  if (telemetry.parsingConfidence > 0.7) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Get recommendation for what to do based on predictions
 */
export function getActionRecommendation(prediction: PredictionResult): {
  action: 'continue' | 'offer_help' | 'escalate_human' | 'send_incentive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
} {
  // Critical: High abandonment risk
  if (prediction.willAbandon > 0.7) {
    return {
      action: 'escalate_human',
      priority: 'critical',
      message: 'User likely to abandon. Offer human assistance immediately.',
    };
  }

  // High: Needs escalation
  if (prediction.needsEscalation > 0.6) {
    return {
      action: 'offer_help',
      priority: 'high',
      message: 'User may need additional help. Offer to connect with specialist.',
    };
  }

  // Medium: At risk but recoverable
  if (prediction.willAbandon > 0.4 && prediction.willBook < 0.3) {
    return {
      action: 'send_incentive',
      priority: 'medium',
      message: 'User engagement declining. Consider offering discount or priority support.',
    };
  }

  // Low: On track to book
  if (prediction.willBook > 0.6) {
    return {
      action: 'continue',
      priority: 'low',
      message: 'User likely to book. Continue current approach.',
    };
  }

  // Default: Continue monitoring
  return {
    action: 'continue',
    priority: 'low',
    message: 'Conversation progressing normally. Continue monitoring.',
  };
}

/**
 * ML-Ready: Train custom model on historical data
 * This would use actual conversation outcomes to learn patterns
 */
export async function trainPredictionModel(
  historicalConversations: {
    telemetry: ConversationTelemetry;
    actualOutcome: {
      abandoned: boolean;
      booked: boolean;
      escalated: boolean;
    };
  }[]
): Promise<void> {
  // TODO: Implement actual ML training
  // This would:
  // 1. Extract features from telemetry
  // 2. Train classification model (e.g., Random Forest, XGBoost)
  // 3. Validate on held-out test set
  // 4. Deploy model to production
  //
  // For now, we use rule-based heuristics above

  console.log(`Training model on ${historicalConversations.length} conversations...`);

  // Calculate baseline accuracy of current heuristics
  let correct = 0;
  historicalConversations.forEach(conv => {
    const prediction = predictUserBehavior(
      conv.telemetry,
      { sentiment: conv.telemetry.userSentiment } as any,
      { intent: 'unknown' } as any
    );

    const predictedAbandon = prediction.willAbandon > 0.5;
    if (predictedAbandon === conv.actualOutcome.abandoned) {
      correct++;
    }
  });

  const accuracy = correct / historicalConversations.length;
  console.log(`Current heuristic accuracy: ${(accuracy * 100).toFixed(1)}%`);

  // In production: Use this data to train better models
}

/**
 * Detect conversation anomalies
 * Flags unusual patterns that might indicate problems
 */
export function detectAnomalies(
  telemetry: ConversationTelemetry,
  recentConversations: ConversationTelemetry[]
): {
  isAnomalous: boolean;
  anomalies: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const anomalies: string[] = [];

  // Calculate normal ranges from recent conversations
  const avgResponseTime = average(recentConversations.map(c => c.responseTime));
  const avgErrorCount = average(recentConversations.map(c => c.errorCount));
  const avgMessageCount = average(recentConversations.map(c => c.messageIndex));

  // Check for anomalies
  if (telemetry.responseTime > avgResponseTime * 2) {
    anomalies.push(`Response time ${(telemetry.responseTime / avgResponseTime).toFixed(1)}x slower than normal`);
  }

  if (telemetry.errorCount > avgErrorCount * 2) {
    anomalies.push(`Error count ${(telemetry.errorCount / avgErrorCount).toFixed(1)}x higher than normal`);
  }

  if (telemetry.messageIndex > avgMessageCount * 2 && telemetry.conversationStage === 'discovery') {
    anomalies.push(`Conversation ${(telemetry.messageIndex / avgMessageCount).toFixed(1)}x longer than normal without progress`);
  }

  // Unusual error combinations
  const hasParsingAndLanguageError = telemetry.errors.some(e => e.type === 'parsing-failure') &&
    telemetry.errors.some(e => e.type === 'language-mismatch');
  if (hasParsingAndLanguageError) {
    anomalies.push('Both parsing and language errors - possible system issue');
  }

  // Determine severity
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (anomalies.length >= 3) {
    severity = 'high';
  } else if (anomalies.length >= 2) {
    severity = 'medium';
  }

  return {
    isAnomalous: anomalies.length > 0,
    anomalies,
    severity,
  };
}

/**
 * Helper: Calculate average
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}
