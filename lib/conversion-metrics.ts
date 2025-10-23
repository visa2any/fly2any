/**
 * Conversion Metrics Tracking Utilities
 * Track user interactions with conversion optimization features
 */

export type ConversionEvent =
  | 'fomo_timer_viewed'
  | 'fomo_timer_expired'
  | 'activity_feed_viewed'
  | 'price_protection_clicked'
  | 'flight_saved'
  | 'flight_compared'
  | 'flight_booked'
  | 'exit_intent_shown'
  | 'exit_intent_dismissed'
  | 'exit_intent_email_submitted'
  | 'social_validation_hovered'
  | 'progress_step_viewed';

export interface ConversionMetric {
  event: ConversionEvent;
  timestamp: Date;
  flightId?: string;
  metadata?: Record<string, any>;
  sessionId: string;
  userId?: string;
}

class ConversionMetricsTracker {
  private sessionId: string;
  private metrics: ConversionMetric[] = [];
  private listeners: Array<(metric: ConversionMetric) => void> = [];

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem('conversion_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('conversion_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Track a conversion event
   */
  track(
    event: ConversionEvent,
    metadata?: {
      flightId?: string;
      userId?: string;
      [key: string]: any;
    }
  ): void {
    const metric: ConversionMetric = {
      event,
      timestamp: new Date(),
      flightId: metadata?.flightId,
      metadata,
      sessionId: this.sessionId,
      userId: metadata?.userId
    };

    this.metrics.push(metric);

    // Store in local storage for persistence
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('conversion_metrics') || '[]';
        const allMetrics = JSON.parse(stored);
        allMetrics.push(metric);

        // Keep only last 100 metrics
        const recentMetrics = allMetrics.slice(-100);
        localStorage.setItem('conversion_metrics', JSON.stringify(recentMetrics));
      } catch (error) {
        console.error('Failed to store conversion metric:', error);
      }
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(metric));

    // In production, send to analytics service
    this.sendToAnalytics(metric);
  }

  /**
   * Send metric to analytics service
   */
  private sendToAnalytics(metric: ConversionMetric): void {
    // TODO: Integrate with your analytics service (Google Analytics, Mixpanel, etc.)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Conversion Metric]', metric);
    }

    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.event, {
        flight_id: metric.flightId,
        session_id: metric.sessionId,
        ...metric.metadata
      });
    }
  }

  /**
   * Subscribe to metric events
   */
  subscribe(listener: (metric: ConversionMetric) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get metrics for current session
   */
  getSessionMetrics(): ConversionMetric[] {
    return this.metrics.filter((m) => m.sessionId === this.sessionId);
  }

  /**
   * Get conversion funnel statistics
   */
  getFunnelStats(): {
    viewed: number;
    saved: number;
    compared: number;
    booked: number;
    conversionRate: number;
  } {
    const sessionMetrics = this.getSessionMetrics();

    const viewed = new Set(
      sessionMetrics
        .filter((m) => m.flightId)
        .map((m) => m.flightId)
    ).size;

    const saved = sessionMetrics.filter((m) => m.event === 'flight_saved').length;
    const compared = sessionMetrics.filter((m) => m.event === 'flight_compared').length;
    const booked = sessionMetrics.filter((m) => m.event === 'flight_booked').length;

    const conversionRate = viewed > 0 ? (booked / viewed) * 100 : 0;

    return {
      viewed,
      saved,
      compared,
      booked,
      conversionRate
    };
  }

  /**
   * Get exit intent performance
   */
  getExitIntentStats(): {
    shown: number;
    dismissed: number;
    submitted: number;
    conversionRate: number;
  } {
    const sessionMetrics = this.getSessionMetrics();

    const shown = sessionMetrics.filter((m) => m.event === 'exit_intent_shown').length;
    const dismissed = sessionMetrics.filter((m) => m.event === 'exit_intent_dismissed').length;
    const submitted = sessionMetrics.filter((m) => m.event === 'exit_intent_email_submitted').length;

    const conversionRate = shown > 0 ? (submitted / shown) * 100 : 0;

    return {
      shown,
      dismissed,
      submitted,
      conversionRate
    };
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.metrics = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('conversion_metrics');
    }
  }
}

// Singleton instance
export const conversionTracker = new ConversionMetricsTracker();

// Convenience functions
export const trackConversion = (
  event: ConversionEvent,
  metadata?: Record<string, any>
) => {
  conversionTracker.track(event, metadata);
};

export const getConversionStats = () => {
  return {
    funnel: conversionTracker.getFunnelStats(),
    exitIntent: conversionTracker.getExitIntentStats()
  };
};
