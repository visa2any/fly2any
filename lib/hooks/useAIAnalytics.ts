import { useCallback, useRef, useEffect } from 'react';
import type { AIAnalyticsEvent } from '@/app/api/ai/analytics/route';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface UseAIAnalyticsReturn {
  trackChatOpen: () => void;
  trackChatClose: () => void;
  trackMessage: (role: 'user' | 'assistant', consultant?: {
    team: string;
    name: string;
  }) => void;
  trackConsultantRouted: (consultant: {
    team: string;
    name: string;
  }) => void;
  trackFlightSearch: (query: {
    searchQuery: string;
    origin?: string;
    destination?: string;
    resultsCount?: number;
    searchDuration?: number;
  }) => void;
  trackAuthPromptShown: (stage: 'first_interaction' | 'search_performed' | 'results_viewed' | 'pre_booking') => void;
  trackAuthPromptClicked: (action: 'signup' | 'login' | 'dismiss') => void;
  trackConversion: (type: 'signup' | 'login' | 'booking', value?: number) => void;
  trackFlightSelected: (flightId: string, flightPrice?: number) => void;
  trackSessionEngagement: (engagement: {
    duration: number;
    messageCount: number;
    score: number;
  }) => void;
}

interface AnalyticsOptions {
  sessionId: string;
  userId?: string;
  isAuthenticated: boolean;
  batchSize?: number;
  flushInterval?: number;
  enabled?: boolean;
}

// ===========================
// HOOK IMPLEMENTATION
// ===========================

/**
 * AI Analytics Tracking Hook
 *
 * Provides methods to track AI assistant interactions and conversions.
 * Features:
 * - Automatic event batching for performance
 * - Privacy-compliant (no PII tracked)
 * - Configurable batch size and flush interval
 * - Easy opt-out
 *
 * @example
 * ```tsx
 * const analytics = useAIAnalytics({
 *   sessionId: 'session_123',
 *   userId: user?.id,
 *   isAuthenticated: !!user,
 * });
 *
 * // Track chat opened
 * analytics.trackChatOpen();
 *
 * // Track user message
 * analytics.trackMessage('user');
 *
 * // Track flight search
 * analytics.trackFlightSearch({
 *   searchQuery: 'NYC to LAX',
 *   origin: 'JFK',
 *   destination: 'LAX',
 *   resultsCount: 10,
 * });
 * ```
 */
export function useAIAnalytics(options: AnalyticsOptions): UseAIAnalyticsReturn {
  const {
    sessionId,
    userId,
    isAuthenticated,
    batchSize = 10,
    flushInterval = 5000, // 5 seconds
    enabled = true,
  } = options;

  // Event queue for batching
  const eventQueue = useRef<AIAnalyticsEvent[]>([]);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const messageCountRef = useRef<number>(0);

  /**
   * Flush events to API
   */
  const flushEvents = useCallback(async () => {
    if (!enabled || eventQueue.current.length === 0) return;

    const eventsToSend = [...eventQueue.current];
    eventQueue.current = [];

    try {
      const response = await fetch('/api/ai/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      });

      if (!response.ok) {
        console.error('Failed to send analytics events:', response.statusText);
        // Re-queue events on failure (with limit to prevent memory issues)
        if (eventQueue.current.length < 100) {
          eventQueue.current = [...eventsToSend, ...eventQueue.current];
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Sent ${eventsToSend.length} AI analytics events`);
      }
    } catch (error) {
      console.error('Error sending analytics events:', error);
      // Re-queue events on error (with limit)
      if (eventQueue.current.length < 100) {
        eventQueue.current = [...eventsToSend, ...eventQueue.current];
      }
    }
  }, [enabled]);

  /**
   * Add event to queue and flush if needed
   */
  const queueEvent = useCallback((event: Omit<AIAnalyticsEvent, 'sessionId' | 'timestamp' | 'isAuthenticated' | 'userId'>) => {
    if (!enabled) return;

    const fullEvent: AIAnalyticsEvent = {
      ...event,
      sessionId,
      timestamp: new Date().toISOString(),
      isAuthenticated,
      userId,
    };

    eventQueue.current.push(fullEvent);

    // Flush immediately if batch size reached
    if (eventQueue.current.length >= batchSize) {
      flushEvents();
    } else {
      // Reset flush timer
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
      flushTimerRef.current = setTimeout(flushEvents, flushInterval);
    }
  }, [sessionId, isAuthenticated, userId, enabled, batchSize, flushInterval, flushEvents]);

  /**
   * Flush on unmount
   */
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
      flushEvents();
    };
  }, [flushEvents]);

  /**
   * Track chat opened
   */
  const trackChatOpen = useCallback(() => {
    queueEvent({
      eventType: 'chat_opened',
    });
  }, [queueEvent]);

  /**
   * Track chat closed
   */
  const trackChatClose = useCallback(() => {
    const sessionDuration = Math.floor((Date.now() - sessionStartRef.current) / 1000);

    queueEvent({
      eventType: 'chat_closed',
      metadata: {
        sessionDuration,
        messageCount: messageCountRef.current,
      },
    });

    // Also track session engagement
    trackSessionEngagement({
      duration: sessionDuration,
      messageCount: messageCountRef.current,
      score: calculateEngagementScore(messageCountRef.current, sessionDuration),
    });
  }, [queueEvent]);

  /**
   * Track message sent
   */
  const trackMessage = useCallback((
    role: 'user' | 'assistant',
    consultant?: { team: string; name: string }
  ) => {
    messageCountRef.current += 1;

    queueEvent({
      eventType: 'message_sent',
      metadata: {
        messageRole: role,
        consultantTeam: consultant?.team,
        consultantName: consultant?.name,
      },
    });
  }, [queueEvent]);

  /**
   * Track consultant routed
   */
  const trackConsultantRouted = useCallback((consultant: {
    team: string;
    name: string;
  }) => {
    queueEvent({
      eventType: 'consultant_routed',
      metadata: {
        consultantTeam: consultant.team,
        consultantName: consultant.name,
      },
    });
  }, [queueEvent]);

  /**
   * Track flight search performed
   */
  const trackFlightSearch = useCallback((query: {
    searchQuery: string;
    origin?: string;
    destination?: string;
    resultsCount?: number;
    searchDuration?: number;
  }) => {
    queueEvent({
      eventType: 'flight_search_performed',
      metadata: {
        flightSearchQuery: query.searchQuery,
        origin: query.origin,
        destination: query.destination,
        resultsCount: query.resultsCount,
        searchDuration: query.searchDuration,
      },
    });
  }, [queueEvent]);

  /**
   * Track auth prompt shown
   */
  const trackAuthPromptShown = useCallback((
    stage: 'first_interaction' | 'search_performed' | 'results_viewed' | 'pre_booking'
  ) => {
    queueEvent({
      eventType: 'auth_prompt_shown',
      metadata: {
        authPromptStage: stage,
      },
    });
  }, [queueEvent]);

  /**
   * Track auth prompt clicked
   */
  const trackAuthPromptClicked = useCallback((
    action: 'signup' | 'login' | 'dismiss'
  ) => {
    queueEvent({
      eventType: 'auth_prompt_clicked',
      metadata: {
        authPromptAction: action,
      },
    });
  }, [queueEvent]);

  /**
   * Track conversion
   */
  const trackConversion = useCallback((
    type: 'signup' | 'login' | 'booking',
    value?: number
  ) => {
    const eventType = type === 'signup'
      ? 'conversion_signup'
      : type === 'login'
      ? 'conversion_login'
      : 'conversion_booking';

    queueEvent({
      eventType,
      metadata: {
        conversionType: type,
        conversionValue: value,
      },
    });
  }, [queueEvent]);

  /**
   * Track flight selected
   */
  const trackFlightSelected = useCallback((
    flightId: string,
    flightPrice?: number
  ) => {
    queueEvent({
      eventType: 'flight_selected',
      metadata: {
        flightId,
        flightPrice,
      },
    });
  }, [queueEvent]);

  /**
   * Track session engagement
   */
  const trackSessionEngagement = useCallback((engagement: {
    duration: number;
    messageCount: number;
    score: number;
  }) => {
    queueEvent({
      eventType: 'session_engaged',
      metadata: {
        sessionDuration: engagement.duration,
        messageCount: engagement.messageCount,
        engagementScore: engagement.score,
      },
    });
  }, [queueEvent]);

  return {
    trackChatOpen,
    trackChatClose,
    trackMessage,
    trackConsultantRouted,
    trackFlightSearch,
    trackAuthPromptShown,
    trackAuthPromptClicked,
    trackConversion,
    trackFlightSelected,
    trackSessionEngagement,
  };
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Calculate engagement score based on messages and duration
 * Score ranges from 0-10
 */
function calculateEngagementScore(messageCount: number, sessionDuration: number): number {
  // Base score from message count (0-5 points)
  const messageScore = Math.min(messageCount / 2, 5);

  // Duration score (0-3 points)
  // Optimal session: 2-5 minutes
  const durationMinutes = sessionDuration / 60;
  let durationScore = 0;
  if (durationMinutes >= 2 && durationMinutes <= 5) {
    durationScore = 3;
  } else if (durationMinutes > 5 && durationMinutes <= 10) {
    durationScore = 2;
  } else if (durationMinutes > 1 && durationMinutes < 2) {
    durationScore = 1;
  }

  // Engagement intensity (0-2 points)
  // Messages per minute
  const intensity = durationMinutes > 0 ? messageCount / durationMinutes : 0;
  let intensityScore = 0;
  if (intensity >= 1 && intensity <= 3) {
    intensityScore = 2;
  } else if (intensity > 0.5 && intensity < 1) {
    intensityScore = 1;
  }

  return Math.min(messageScore + durationScore + intensityScore, 10);
}
