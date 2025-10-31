/**
 * A/B TEST ANALYTICS TRACKER
 * ===========================
 * Tracks user interactions and conversions for A/B test analysis
 * Enables measurement of ML feature impact on conversion rates
 */

export type EventType = 'view' | 'click' | 'add_to_cart' | 'start_booking' | 'payment_page' | 'purchase';

export interface ConversionEvent {
  userId: string;
  testId: string;
  variant: string;
  eventType: EventType;
  eventValue?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface ConversionFunnel {
  testId: string;
  variant: string;
  views: number;
  clicks: number;
  startedBooking: number;
  reachedPayment: number;
  completed: number;
  revenue: number;
}

export class AnalyticsTracker {
  private events: ConversionEvent[] = [];
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Auto-flush events periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.flush(), this.FLUSH_INTERVAL);
    }
  }

  /**
   * Track conversion event
   */
  async trackEvent(event: ConversionEvent): Promise<void> {
    // Add to local queue
    this.events.push(event);

    // Flush if batch size reached
    if (this.events.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  /**
   * Flush events to server
   */
  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const batch = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
      });

      console.log(`📊 Flushed ${batch.length} analytics events`);
    } catch (error) {
      console.error('❌ Failed to flush analytics events:', error);
      // Put events back in queue for retry
      this.events.push(...batch);
    }
  }

  /**
   * Track page view
   */
  trackView(testId: string, variant: string, userId: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      userId,
      testId,
      variant,
      eventType: 'view',
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Track feature click
   */
  trackClick(testId: string, variant: string, userId: string, feature: string): void {
    this.trackEvent({
      userId,
      testId,
      variant,
      eventType: 'click',
      metadata: { feature },
      timestamp: new Date(),
    });
  }

  /**
   * Track start of booking flow
   */
  trackStartBooking(testId: string, variant: string, userId: string, flightPrice: number): void {
    this.trackEvent({
      userId,
      testId,
      variant,
      eventType: 'start_booking',
      eventValue: flightPrice,
      timestamp: new Date(),
    });
  }

  /**
   * Track payment page reached
   */
  trackPaymentPage(testId: string, variant: string, userId: string, totalPrice: number): void {
    this.trackEvent({
      userId,
      testId,
      variant,
      eventType: 'payment_page',
      eventValue: totalPrice,
      timestamp: new Date(),
    });
  }

  /**
   * Track booking conversion (purchase)
   */
  trackPurchase(
    testId: string,
    variant: string,
    userId: string,
    totalValue: number,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent({
      userId,
      testId,
      variant,
      eventType: 'purchase',
      eventValue: totalValue,
      metadata,
      timestamp: new Date(),
    });

    console.log(`🎉 Conversion tracked: ${testId} (${variant}) = $${totalValue}`);
  }

  /**
   * Track bundle selection (for smart bundles test)
   */
  trackBundleSelection(userId: string, bundleId: string, bundlePrice: number): void {
    this.trackEvent({
      userId,
      testId: 'smart-bundles-v1',
      variant: 'variant_a', // Only variant A shows bundles
      eventType: 'click',
      eventValue: bundlePrice,
      metadata: { bundleId, feature: 'smart_bundle' },
      timestamp: new Date(),
    });
  }

  /**
   * Track urgency signal click
   */
  trackUrgencyClick(userId: string, signalType: string): void {
    this.trackEvent({
      userId,
      testId: 'urgency-signals-v1',
      variant: 'variant_a', // Only variant A shows urgency
      eventType: 'click',
      metadata: { signalType, feature: 'urgency_signal' },
      timestamp: new Date(),
    });
  }

  /**
   * Get pending events count
   */
  getPendingCount(): number {
    return this.events.length;
  }

  /**
   * Force flush (e.g., before page unload)
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }
}

// Singleton instance
export const analyticsTracker = new AnalyticsTracker();

// Flush before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analyticsTracker.forceFlush();
  });
}
