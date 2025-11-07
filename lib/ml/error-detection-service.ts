/**
 * Real-Time Error Detection Service
 *
 * Automatically monitors all conversations and detects errors in real-time
 * Integrates with Layer 1 telemetry to provide comprehensive error tracking
 */

import { getTelemetry, type ConversationTelemetry } from './conversation-telemetry';
import { detectErrors, type ErrorDetectionResult, type DetectedError } from './error-detection';
import { analyzeSentiment } from './sentiment-analysis';
import { classifyIntent } from './intent-classification';

export interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  autoFixableCount: number;
  averageConfidence: number;
  mostCommonError: {
    type: string;
    count: number;
  } | null;
  errorRate: number; // Errors per conversation
  recentErrors: DetectedErrorWithContext[];
}

export interface DetectedErrorWithContext extends DetectedError {
  conversationId: string;
  sessionId: string;
  timestamp: Date;
  userMessage: string;
  agentResponse: string;
  agentConsultant: string;
}

/**
 * Real-time error detection service
 * Singleton that monitors all conversations automatically
 */
class ErrorDetectionService {
  private static instance: ErrorDetectionService;
  private errors: DetectedErrorWithContext[] = [];
  private maxStoredErrors = 1000; // Keep last 1000 errors
  private subscribers: ((error: DetectedErrorWithContext) => void)[] = [];

  private constructor() {
    this.initialize();
  }

  static getInstance(): ErrorDetectionService {
    if (!ErrorDetectionService.instance) {
      ErrorDetectionService.instance = new ErrorDetectionService();
    }
    return ErrorDetectionService.instance;
  }

  /**
   * Initialize by subscribing to telemetry stream
   */
  private initialize() {
    const telemetry = getTelemetry();

    // Subscribe to all conversation telemetry
    telemetry.subscribe((data: ConversationTelemetry) => {
      this.processConversation(data);
    });

    console.log('[ErrorDetectionService] Initialized - monitoring all conversations');
  }

  /**
   * Process a conversation and detect errors
   */
  private async processConversation(data: ConversationTelemetry) {
    try {
      // Run error detection
      const sentiment = analyzeSentiment(data.userMessage);
      const intent = classifyIntent(data.userMessage);

      const errorResult = detectErrors(
        data.userMessage,
        data.agentResponse,
        {
          sentiment,
          intent,
          responseTime: data.responseTime,
          previousErrors: data.errorCount,
          conversationLength: data.messageIndex,
        }
      );

      // If errors detected, track them
      if (errorResult.hasError) {
        for (const error of errorResult.errors) {
          const errorWithContext: DetectedErrorWithContext = {
            ...error,
            conversationId: data.conversationId,
            sessionId: data.sessionId,
            timestamp: data.timestamp,
            userMessage: data.userMessage,
            agentResponse: data.agentResponse,
            agentConsultant: data.agentConsultant,
          };

          // Store error
          this.errors.push(errorWithContext);

          // Trim if too many stored
          if (this.errors.length > this.maxStoredErrors) {
            this.errors.shift();
          }

          // Track in telemetry
          const telemetry = getTelemetry();
          await telemetry.trackError(data.conversationId, {
            type: error.type,
            severity: error.severity,
            message: this.formatErrorMessage(error),
            timestamp: new Date(),
            context: error.context,
          });

          // Notify subscribers
          this.notifySubscribers(errorWithContext);

          // Log for debugging
          console.log(`[ErrorDetection] ${error.severity.toUpperCase()}: ${error.type}`, {
            conversationId: data.conversationId,
            confidence: error.confidence,
            evidence: error.evidence,
          });
        }
      }
    } catch (err) {
      console.error('[ErrorDetectionService] Error processing conversation:', err);
    }
  }

  /**
   * Format error message for display
   */
  private formatErrorMessage(error: DetectedError): string {
    return `${error.type}: ${error.context.expectedBehavior} (got: ${error.context.actualBehavior})`;
  }

  /**
   * Notify all subscribers of new error
   */
  private notifySubscribers(error: DetectedErrorWithContext) {
    this.subscribers.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('[ErrorDetectionService] Subscriber error:', err);
      }
    });
  }

  /**
   * Subscribe to error events
   */
  subscribe(callback: (error: DetectedErrorWithContext) => void): () => void {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get all errors for a specific conversation
   */
  getErrorsByConversation(conversationId: string): DetectedErrorWithContext[] {
    return this.errors.filter(e => e.conversationId === conversationId);
  }

  /**
   * Get all errors for a specific session
   */
  getErrorsBySession(sessionId: string): DetectedErrorWithContext[] {
    return this.errors.filter(e => e.sessionId === sessionId);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: string): DetectedErrorWithContext[] {
    return this.errors.filter(e => e.type === type);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): DetectedErrorWithContext[] {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Get auto-fixable errors
   */
  getAutoFixableErrors(): DetectedErrorWithContext[] {
    return this.errors.filter(e => e.autoFixable);
  }

  /**
   * Get recent errors (last N)
   */
  getRecentErrors(limit: number = 50): DetectedErrorWithContext[] {
    return this.errors.slice(-limit).reverse();
  }

  /**
   * Get error statistics
   */
  async getStatistics(period: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<ErrorStatistics> {
    const now = Date.now();
    const periodMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }[period];

    // Filter errors by period
    const periodErrors = this.errors.filter(
      e => now - e.timestamp.getTime() < periodMs
    );

    // Count by type
    const errorsByType: Record<string, number> = {};
    periodErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    });

    // Count by severity
    const errorsBySeverity = {
      low: periodErrors.filter(e => e.severity === 'low').length,
      medium: periodErrors.filter(e => e.severity === 'medium').length,
      high: periodErrors.filter(e => e.severity === 'high').length,
      critical: periodErrors.filter(e => e.severity === 'critical').length,
    };

    // Auto-fixable count
    const autoFixableCount = periodErrors.filter(e => e.autoFixable).length;

    // Average confidence
    const averageConfidence = periodErrors.length > 0
      ? periodErrors.reduce((sum, e) => sum + e.confidence, 0) / periodErrors.length
      : 0;

    // Most common error
    let mostCommonError: { type: string; count: number } | null = null;
    if (Object.keys(errorsByType).length > 0) {
      const sorted = Object.entries(errorsByType).sort((a, b) => b[1] - a[1]);
      mostCommonError = {
        type: sorted[0][0],
        count: sorted[0][1],
      };
    }

    // Error rate (errors per conversation)
    const telemetry = getTelemetry();
    const metrics = await telemetry.getMetrics(period);
    const errorRate = metrics.totalConversations > 0
      ? periodErrors.length / metrics.totalConversations
      : 0;

    return {
      totalErrors: periodErrors.length,
      errorsByType,
      errorsBySeverity,
      autoFixableCount,
      averageConfidence,
      mostCommonError,
      errorRate,
      recentErrors: periodErrors.slice(-10).reverse(),
    };
  }

  /**
   * Clear all stored errors (for testing)
   */
  clearErrors() {
    this.errors = [];
    console.log('[ErrorDetectionService] Cleared all errors');
  }

  /**
   * Get error trends over time
   */
  getErrorTrends(hours: number = 24): {
    hourly: { hour: string; count: number; autoFixable: number }[];
    trending: 'up' | 'down' | 'stable';
  } {
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    // Group errors by hour
    const hourlyData: Record<string, { count: number; autoFixable: number }> = {};

    for (let i = 0; i < hours; i++) {
      const hourStart = now - (i * hourMs);
      const hourEnd = hourStart + hourMs;
      const hourLabel = new Date(hourStart).toISOString().slice(0, 13) + ':00';

      const hourErrors = this.errors.filter(
        e => e.timestamp.getTime() >= hourStart && e.timestamp.getTime() < hourEnd
      );

      hourlyData[hourLabel] = {
        count: hourErrors.length,
        autoFixable: hourErrors.filter(e => e.autoFixable).length,
      };
    }

    // Convert to array
    const hourly = Object.entries(hourlyData)
      .map(([hour, data]) => ({ hour, ...data }))
      .reverse();

    // Determine trend
    const firstHalf = hourly.slice(0, Math.floor(hours / 2));
    const secondHalf = hourly.slice(Math.floor(hours / 2));

    const firstHalfAvg = firstHalf.reduce((sum, h) => sum + h.count, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, h) => sum + h.count, 0) / secondHalf.length;

    let trending: 'up' | 'down' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg * 1.2) {
      trending = 'up';
    } else if (secondHalfAvg < firstHalfAvg * 0.8) {
      trending = 'down';
    }

    return { hourly, trending };
  }

  /**
   * Get error patterns (common combinations)
   */
  getErrorPatterns(): {
    pattern: string[];
    count: number;
    exampleConversation: string;
  }[] {
    // Group errors by conversation
    const conversationErrors: Record<string, DetectedErrorWithContext[]> = {};

    this.errors.forEach(error => {
      if (!conversationErrors[error.conversationId]) {
        conversationErrors[error.conversationId] = [];
      }
      conversationErrors[error.conversationId].push(error);
    });

    // Find patterns (sequences of error types)
    const patternCounts: Record<string, { count: number; example: string }> = {};

    Object.entries(conversationErrors).forEach(([conversationId, errors]) => {
      if (errors.length >= 2) {
        const pattern = errors.map(e => e.type).sort();
        const patternKey = pattern.join(' -> ');

        if (!patternCounts[patternKey]) {
          patternCounts[patternKey] = { count: 0, example: conversationId };
        }
        patternCounts[patternKey].count++;
      }
    });

    // Convert to array and sort by count
    return Object.entries(patternCounts)
      .map(([pattern, data]) => ({
        pattern: pattern.split(' -> '),
        count: data.count,
        exampleConversation: data.example,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 patterns
  }

  /**
   * Analyze error impact on conversions
   */
  async analyzeErrorImpact(): Promise<{
    errorType: string;
    occurrences: number;
    averageAbandonmentIncrease: number;
    averageBookingDecrease: number;
    estimatedRevenueLoss: number;
  }[]> {
    const telemetry = getTelemetry();
    const conversationErrors: Record<string, DetectedErrorWithContext[]> = {};

    // Group errors by conversation
    this.errors.forEach(error => {
      if (!conversationErrors[error.conversationId]) {
        conversationErrors[error.conversationId] = [];
      }
      conversationErrors[error.conversationId].push(error);
    });

    // Count impact by error type
    const errorTypes = [...new Set(this.errors.map(e => e.type))];
    const impact = [];

    for (const errorType of errorTypes) {
      const conversationsWithError = Object.entries(conversationErrors)
        .filter(([_, errors]) => errors.some(e => e.type === errorType));

      // Simple heuristic for impact (would be replaced by actual ML in production)
      const occurrences = this.errors.filter(e => e.type === errorType).length;

      // Estimate impact based on error severity
      const avgSeverity = this.errors
        .filter(e => e.type === errorType)
        .reduce((sum, e) => {
          const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[e.severity];
          return sum + severityScore;
        }, 0) / occurrences;

      const averageAbandonmentIncrease = avgSeverity * 0.1; // 10% per severity level
      const averageBookingDecrease = avgSeverity * 0.05; // 5% per severity level

      // Estimate revenue loss
      // Assume $150 average booking value, 3.2% baseline conversion
      const estimatedRevenueLoss = occurrences * 0.032 * averageBookingDecrease * 150;

      impact.push({
        errorType,
        occurrences,
        averageAbandonmentIncrease,
        averageBookingDecrease,
        estimatedRevenueLoss,
      });
    }

    return impact.sort((a, b) => b.estimatedRevenueLoss - a.estimatedRevenueLoss);
  }
}

/**
 * Get error detection service singleton
 */
export function getErrorDetectionService(): ErrorDetectionService {
  return ErrorDetectionService.getInstance();
}

/**
 * Initialize error detection (call once at app startup)
 */
export function initializeErrorDetection(): void {
  const service = getErrorDetectionService();
  console.log('[ErrorDetection] Service initialized and monitoring');
}
