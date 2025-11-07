/**
 * LAYER 1: Intelligent Monitoring System
 *
 * Captures and analyzes every conversation in real-time
 * This is the foundation for ML-powered error detection and self-healing
 *
 * Purpose:
 * - Track every user message and agent response
 * - Detect errors and anomalies in real-time
 * - Measure conversation quality and user satisfaction
 * - Feed data to ML models for continuous learning
 */

export type ErrorType =
  | 'parsing-failure'        // Couldn't extract dates/locations
  | 'intent-misunderstanding' // Wrong consultant assigned
  | 'language-mismatch'      // Responded in wrong language
  | 'hallucination'          // Made up flight/hotel info
  | 'out-of-scope'           // Tried to handle impossible request
  | 'api-failure'            // Search API failed
  | 'timeout'                // Took too long to respond
  | 'abandonment'            // User left mid-conversation
  | 'low-confidence'         // Agent wasn't sure
  | 'user-frustration';      // User expressed anger/confusion

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

export type UserSentiment = 'positive' | 'neutral' | 'negative' | 'frustrated';

export interface ConversationError {
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: Date;
  confidence: number; // How sure we are this is an error (0-1)
  context: {
    userMessage: string;
    agentResponse: string;
    expectedBehavior: string;
    actualBehavior: string;
  };
  suggestedFix?: string;
  autoFixable: boolean;
  fixed: boolean;
  fixMethod?: string;
}

export interface ConversationWarning {
  type: string;
  message: string;
  timestamp: Date;
  actionNeeded?: string;
}

export interface ConversationTelemetry {
  // Identity
  conversationId: string;
  sessionId: string;
  userId?: string; // If authenticated
  timestamp: Date;

  // User data
  userMessage: string;
  userLanguage: 'en' | 'es' | 'pt';
  userIntent: string; // Detected intent (e.g., "book_flight", "search_hotel")
  userSentiment: UserSentiment;

  // Agent data
  agentResponse: string;
  agentConsultant: string; // Which consultant responded
  agentTeam: string; // Which team (flight-operations, hotel, etc)
  responseTime: number; // milliseconds

  // Quality metrics
  intentDetectionConfidence: number; // 0-1
  languageDetectionConfidence: number; // 0-1
  parsingConfidence: number; // 0-1 (how confident in extracted data)
  responseQuality: number; // 0-1 (ML-scored quality of response)
  userSatisfactionPrediction: number; // 0-1 (predicted satisfaction)

  // Extracted data quality
  extractedData?: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    confidence: number; // Overall extraction confidence
  };

  // Error tracking
  errors: ConversationError[];
  warnings: ConversationWarning[];
  errorCount: number;

  // Conversation state
  messageIndex: number; // Which message # in the conversation
  conversationStage: 'greeting' | 'discovery' | 'searching' | 'presenting' | 'booking' | 'completed' | 'abandoned';

  // Outcome tracking
  conversationCompleted: boolean;
  userAbandoned: boolean;
  bookingMade: boolean;
  bookingValue?: number; // Revenue if booking made

  // Performance
  apiCalls: {
    endpoint: string;
    duration: number;
    success: boolean;
    cached: boolean;
  }[];

  // ML predictions
  predictions?: {
    willAbandon: number; // 0-1 probability user will abandon
    willBook: number; // 0-1 probability user will book
    needsEscalation: number; // 0-1 probability needs human
  };
}

export interface ConversationMetrics {
  // Aggregated metrics
  totalConversations: number;
  completionRate: number; // % that didn't abandon
  bookingRate: number; // % that led to booking
  averageSatisfaction: number;
  averageResponseTime: number;

  // Error metrics
  errorRate: number; // Errors per conversation
  topErrors: { type: ErrorType; count: number }[];
  autoFixRate: number; // % of errors auto-fixed

  // Quality metrics
  averageIntentAccuracy: number;
  averageLanguageAccuracy: number;
  averageParsingAccuracy: number;

  // Time-based
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
}

/**
 * Telemetry Service - Singleton for tracking conversations
 */
export class ConversationTelemetryService {
  private static instance: ConversationTelemetryService;
  private telemetryData: ConversationTelemetry[] = [];
  private realTimeListeners: ((data: ConversationTelemetry) => void)[] = [];

  private constructor() {
    // Initialize telemetry service
    console.log('🔍 Conversation Telemetry Service initialized');
  }

  static getInstance(): ConversationTelemetryService {
    if (!ConversationTelemetryService.instance) {
      ConversationTelemetryService.instance = new ConversationTelemetryService();
    }
    return ConversationTelemetryService.instance;
  }

  /**
   * Track a conversation message
   */
  async track(data: ConversationTelemetry): Promise<void> {
    // Store locally (in production, this would go to database)
    this.telemetryData.push(data);

    // Notify real-time listeners
    this.realTimeListeners.forEach(listener => listener(data));

    // In production: Send to analytics platform
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_TELEMETRY === 'true') {
      await this.sendToAnalytics(data);
    }

    // Check for critical errors
    if (data.errors.some(e => e.severity === 'critical')) {
      await this.alertCriticalError(data);
    }

    // Check for abandonment risk
    if (data.predictions?.willAbandon && data.predictions.willAbandon > 0.7) {
      await this.preventAbandonment(data);
    }
  }

  /**
   * Track an error
   */
  async trackError(
    conversationId: string,
    error: Omit<ConversationError, 'timestamp' | 'fixed' | 'fixMethod'>
  ): Promise<void> {
    const fullError: ConversationError = {
      ...error,
      timestamp: new Date(),
      fixed: false,
    };

    // In production: Store in database
    console.error('❌ Conversation Error:', {
      conversationId,
      type: error.type,
      severity: error.severity,
      autoFixable: error.autoFixable,
    });

    // Attempt auto-fix if applicable
    if (fullError.autoFixable) {
      await this.attemptAutoFix(conversationId, fullError);
    }
  }

  /**
   * Subscribe to real-time telemetry
   */
  subscribe(callback: (data: ConversationTelemetry) => void): () => void {
    this.realTimeListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.realTimeListeners = this.realTimeListeners.filter(l => l !== callback);
    };
  }

  /**
   * Get conversation metrics
   */
  async getMetrics(period: 'hour' | 'day' | 'week' | 'month'): Promise<ConversationMetrics> {
    // Calculate time range
    const now = new Date();
    const startDate = this.getStartDate(now, period);

    // Filter data to time range
    const periodData = this.telemetryData.filter(d =>
      d.timestamp >= startDate && d.timestamp <= now
    );

    if (periodData.length === 0) {
      return this.getEmptyMetrics(period, startDate, now);
    }

    // Calculate metrics
    const totalConversations = periodData.length;
    const completedConversations = periodData.filter(d => d.conversationCompleted).length;
    const bookingConversations = periodData.filter(d => d.bookingMade).length;
    const abandonedConversations = periodData.filter(d => d.userAbandoned).length;

    const totalErrors = periodData.reduce((sum, d) => sum + d.errorCount, 0);
    const fixedErrors = periodData.reduce((sum, d) =>
      sum + d.errors.filter(e => e.fixed).length, 0
    );

    // Count error types
    const errorCounts = new Map<ErrorType, number>();
    periodData.forEach(d => {
      d.errors.forEach(e => {
        errorCounts.set(e.type, (errorCounts.get(e.type) || 0) + 1);
      });
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalConversations,
      completionRate: completedConversations / totalConversations,
      bookingRate: bookingConversations / totalConversations,
      averageSatisfaction: this.average(periodData.map(d => d.userSatisfactionPrediction)),
      averageResponseTime: this.average(periodData.map(d => d.responseTime)),

      errorRate: totalErrors / totalConversations,
      topErrors,
      autoFixRate: totalErrors > 0 ? fixedErrors / totalErrors : 0,

      averageIntentAccuracy: this.average(periodData.map(d => d.intentDetectionConfidence)),
      averageLanguageAccuracy: this.average(periodData.map(d => d.languageDetectionConfidence)),
      averageParsingAccuracy: this.average(periodData.map(d => d.parsingConfidence)),

      period,
      startDate,
      endDate: now,
    };
  }

  /**
   * Private: Send to analytics platform (Helicone, Mixpanel, etc)
   */
  private async sendToAnalytics(data: ConversationTelemetry): Promise<void> {
    try {
      // In production: Send to Helicone or similar
      await fetch('/api/analytics/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send telemetry:', error);
    }
  }

  /**
   * Private: Alert on critical errors
   */
  private async alertCriticalError(data: ConversationTelemetry): Promise<void> {
    const criticalErrors = data.errors.filter(e => e.severity === 'critical');

    console.error('🚨 CRITICAL ERROR DETECTED:', {
      conversationId: data.conversationId,
      errors: criticalErrors.map(e => e.type),
      userMessage: data.userMessage,
    });

    // In production: Send alert to monitoring system (PagerDuty, Slack, etc)
    if (process.env.NEXT_PUBLIC_ENABLE_ALERTS === 'true') {
      await fetch('/api/alerts/critical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: data.conversationId,
          errors: criticalErrors,
          timestamp: new Date(),
        }),
      });
    }
  }

  /**
   * Private: Prevent abandonment
   */
  private async preventAbandonment(data: ConversationTelemetry): Promise<void> {
    console.warn('⚠️ HIGH ABANDONMENT RISK:', {
      conversationId: data.conversationId,
      probability: data.predictions?.willAbandon,
      sentiment: data.userSentiment,
    });

    // In production: Trigger intervention (e.g., offer human assistance)
  }

  /**
   * Private: Attempt to auto-fix error
   */
  private async attemptAutoFix(
    conversationId: string,
    error: ConversationError
  ): Promise<void> {
    console.log('🔧 Attempting auto-fix:', {
      conversationId,
      errorType: error.type,
    });

    // Auto-fix logic will be implemented in Layer 3 (Self-Healing)
    // For now, just log
  }

  /**
   * Helper: Get start date for period
   */
  private getStartDate(now: Date, period: 'hour' | 'day' | 'week' | 'month'): Date {
    const date = new Date(now);
    switch (period) {
      case 'hour':
        date.setHours(date.getHours() - 1);
        break;
      case 'day':
        date.setDate(date.getDate() - 1);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
    }
    return date;
  }

  /**
   * Helper: Calculate average
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  /**
   * Helper: Get empty metrics
   */
  private getEmptyMetrics(
    period: 'hour' | 'day' | 'week' | 'month',
    startDate: Date,
    endDate: Date
  ): ConversationMetrics {
    return {
      totalConversations: 0,
      completionRate: 0,
      bookingRate: 0,
      averageSatisfaction: 0,
      averageResponseTime: 0,
      errorRate: 0,
      topErrors: [],
      autoFixRate: 0,
      averageIntentAccuracy: 0,
      averageLanguageAccuracy: 0,
      averageParsingAccuracy: 0,
      period,
      startDate,
      endDate,
    };
  }
}

/**
 * Convenience function to get telemetry service
 */
export function getTelemetry(): ConversationTelemetryService {
  return ConversationTelemetryService.getInstance();
}

/**
 * Initialize telemetry service
 * Call this once at app startup to ensure telemetry is ready
 */
export function initializeTelemetry(): void {
  const service = getTelemetry();
  console.log('[Telemetry] Service initialized and ready');
}

/**
 * Hook for tracking conversation in React components
 */
export function useConversationTelemetry() {
  const telemetry = getTelemetry();

  return {
    track: telemetry.track.bind(telemetry),
    trackError: telemetry.trackError.bind(telemetry),
    subscribe: telemetry.subscribe.bind(telemetry),
    getMetrics: telemetry.getMetrics.bind(telemetry),
  };
}
