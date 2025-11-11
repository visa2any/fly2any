/**
 * Engagement Analytics Tracker
 *
 * Tracks user engagement metrics for Fly2Any platform
 * Currently uses localStorage - ready for backend integration
 */

// Event types
export type EngagementEventType =
  | 'page_view'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'deal_click'
  | 'deal_view'
  | 'destination_explore'
  | 'faq_view'
  | 'faq_helpful'
  | 'faq_not_helpful'
  | 'guide_view'
  | 'search'
  | 'flight_view'
  | 'booking_start'
  | 'booking_complete'
  | 'time_on_site'
  | 'return_visit';

export interface EngagementEvent {
  type: EngagementEventType;
  timestamp: number;
  data?: Record<string, any>;
  sessionId: string;
  userId?: string;
}

export interface EngagementMetrics {
  totalEvents: number;
  uniqueSessions: number;
  wishlistAdds: number;
  dealClicks: number;
  faqViews: number;
  searchCount: number;
  avgTimeOnSite: number;
  returnVisits: number;
  lastUpdated: number;
}

class EngagementTracker {
  private storageKey = 'fly2any_engagement_events';
  private metricsKey = 'fly2any_engagement_metrics';
  private sessionKey = 'fly2any_session_id';
  private sessionStartKey = 'fly2any_session_start';
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initSession();
  }

  /**
   * Get or create a session ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem(this.sessionKey);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(this.sessionKey, sessionId);
    }
    return sessionId;
  }

  /**
   * Initialize session tracking
   */
  private initSession(): void {
    if (typeof window === 'undefined') return;

    const sessionStart = sessionStorage.getItem(this.sessionStartKey);
    if (!sessionStart) {
      sessionStorage.setItem(this.sessionStartKey, Date.now().toString());
      this.trackEvent('page_view', { page: window.location.pathname });
    }

    // Check for return visits
    const lastVisit = localStorage.getItem('fly2any_last_visit');
    if (lastVisit) {
      const daysSinceLastVisit = (Date.now() - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastVisit >= 1) {
        this.trackEvent('return_visit', { daysSince: Math.floor(daysSinceLastVisit) });
      }
    }
    localStorage.setItem('fly2any_last_visit', Date.now().toString());
  }

  /**
   * Track an engagement event
   */
  trackEvent(type: EngagementEventType, data?: Record<string, any>): void {
    if (typeof window === 'undefined') return;

    const event: EngagementEvent = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
      userId: this.getUserId(),
    };

    // Store event
    this.storeEvent(event);

    // Update metrics
    this.updateMetrics(event);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Engagement]', type, data);
    }
  }

  /**
   * Store event in localStorage
   */
  private storeEvent(event: EngagementEvent): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const events: EngagementEvent[] = stored ? JSON.parse(stored) : [];

      events.push(event);

      // Keep only last 1000 events to prevent storage overflow
      const recentEvents = events.slice(-1000);
      localStorage.setItem(this.storageKey, JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Error storing engagement event:', error);
    }
  }

  /**
   * Update aggregated metrics
   */
  private updateMetrics(event: EngagementEvent): void {
    try {
      const stored = localStorage.getItem(this.metricsKey);
      const metrics: EngagementMetrics = stored
        ? JSON.parse(stored)
        : {
            totalEvents: 0,
            uniqueSessions: 0,
            wishlistAdds: 0,
            dealClicks: 0,
            faqViews: 0,
            searchCount: 0,
            avgTimeOnSite: 0,
            returnVisits: 0,
            lastUpdated: Date.now(),
          };

      metrics.totalEvents++;

      // Track unique sessions
      const sessions = new Set(this.getAllEvents().map(e => e.sessionId));
      metrics.uniqueSessions = sessions.size;

      // Track specific events
      switch (event.type) {
        case 'wishlist_add':
          metrics.wishlistAdds++;
          break;
        case 'deal_click':
          metrics.dealClicks++;
          break;
        case 'faq_view':
          metrics.faqViews++;
          break;
        case 'search':
          metrics.searchCount++;
          break;
        case 'return_visit':
          metrics.returnVisits++;
          break;
      }

      // Calculate average time on site
      const sessionStart = sessionStorage.getItem(this.sessionStartKey);
      if (sessionStart) {
        const timeOnSite = (Date.now() - parseInt(sessionStart)) / 1000 / 60; // minutes
        metrics.avgTimeOnSite = Math.round(
          (metrics.avgTimeOnSite * (metrics.totalEvents - 1) + timeOnSite) / metrics.totalEvents
        );
      }

      metrics.lastUpdated = Date.now();
      localStorage.setItem(this.metricsKey, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  /**
   * Get user ID from session if available
   */
  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    // Try to get from session storage (set by auth)
    const userSession = sessionStorage.getItem('user_id');
    return userSession || undefined;
  }

  /**
   * Get all stored events
   */
  getAllEvents(): EngagementEvent[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): EngagementMetrics {
    if (typeof window === 'undefined') {
      return {
        totalEvents: 0,
        uniqueSessions: 0,
        wishlistAdds: 0,
        dealClicks: 0,
        faqViews: 0,
        searchCount: 0,
        avgTimeOnSite: 0,
        returnVisits: 0,
        lastUpdated: Date.now(),
      };
    }

    try {
      const stored = localStorage.getItem(this.metricsKey);
      return stored
        ? JSON.parse(stored)
        : {
            totalEvents: 0,
            uniqueSessions: 0,
            wishlistAdds: 0,
            dealClicks: 0,
            faqViews: 0,
            searchCount: 0,
            avgTimeOnSite: 0,
            returnVisits: 0,
            lastUpdated: Date.now(),
          };
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        totalEvents: 0,
        uniqueSessions: 0,
        wishlistAdds: 0,
        dealClicks: 0,
        faqViews: 0,
        searchCount: 0,
        avgTimeOnSite: 0,
        returnVisits: 0,
        lastUpdated: Date.now(),
      };
    }
  }

  /**
   * Get events by type
   */
  getEventsByType(type: EngagementEventType): EngagementEvent[] {
    return this.getAllEvents().filter(e => e.type === type);
  }

  /**
   * Get events for current session
   */
  getSessionEvents(): EngagementEvent[] {
    return this.getAllEvents().filter(e => e.sessionId === this.sessionId);
  }

  /**
   * Clear all stored data (for testing/privacy)
   */
  clearAllData(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.metricsKey);
    sessionStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.sessionStartKey);
  }

  /**
   * Export data for backend sync
   */
  exportData(): {
    events: EngagementEvent[];
    metrics: EngagementMetrics;
    sessionId: string;
  } {
    return {
      events: this.getAllEvents(),
      metrics: this.getMetrics(),
      sessionId: this.sessionId,
    };
  }

  /**
   * Track time on site before user leaves
   */
  trackTimeOnSite(): void {
    const sessionStart = sessionStorage.getItem(this.sessionStartKey);
    if (sessionStart) {
      const timeOnSite = Math.round((Date.now() - parseInt(sessionStart)) / 1000); // seconds
      this.trackEvent('time_on_site', { duration: timeOnSite });
    }
  }
}

// Create singleton instance
const engagementTracker = new EngagementTracker();

// Track time on site when user leaves
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    engagementTracker.trackTimeOnSite();
  });

  // Track visibility changes (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      engagementTracker.trackTimeOnSite();
    }
  });
}

export default engagementTracker;

// Convenience functions
export const trackPageView = (page: string) =>
  engagementTracker.trackEvent('page_view', { page });

export const trackWishlistAdd = (flightId: string, destination: string) =>
  engagementTracker.trackEvent('wishlist_add', { flightId, destination });

export const trackWishlistRemove = (flightId: string) =>
  engagementTracker.trackEvent('wishlist_remove', { flightId });

export const trackDealClick = (dealId: string, destination: string, price: number) =>
  engagementTracker.trackEvent('deal_click', { dealId, destination, price });

export const trackDealView = (dealId: string) =>
  engagementTracker.trackEvent('deal_view', { dealId });

export const trackDestinationExplore = (destination: string) =>
  engagementTracker.trackEvent('destination_explore', { destination });

export const trackFaqView = (faqId: string, question: string) =>
  engagementTracker.trackEvent('faq_view', { faqId, question });

export const trackFaqHelpful = (faqId: string, helpful: boolean) =>
  engagementTracker.trackEvent(helpful ? 'faq_helpful' : 'faq_not_helpful', { faqId });

export const trackGuideView = (destination: string, category: string) =>
  engagementTracker.trackEvent('guide_view', { destination, category });

export const trackSearch = (origin: string, destination: string, dates: any) =>
  engagementTracker.trackEvent('search', { origin, destination, ...dates });

export const trackFlightView = (flightId: string, route: string) =>
  engagementTracker.trackEvent('flight_view', { flightId, route });

export const trackBookingStart = (flightId: string, price: number) =>
  engagementTracker.trackEvent('booking_start', { flightId, price });

export const trackBookingComplete = (bookingId: string, price: number) =>
  engagementTracker.trackEvent('booking_complete', { bookingId, price });
