/**
 * Journey Analytics Hook
 * Event tracking for Journey System KPIs
 */

import { useCallback } from 'react';
import { Journey, JourneyExperience } from '../types';

// ============================================================================
// EVENT TYPES
// ============================================================================

type JourneyEvent =
  | 'journey_search_started'
  | 'journey_build_initiated'
  | 'journey_build_completed'
  | 'journey_day_expanded'
  | 'journey_experience_added'
  | 'journey_experience_removed'
  | 'journey_suggestion_accepted'
  | 'journey_suggestion_dismissed'
  | 'journey_checkout_started'
  | 'journey_booking_completed'
  | 'journey_abandoned';

interface EventProperties {
  journey_id?: string;
  destination?: string;
  duration?: number;
  travelers?: number;
  pace?: string;
  day_number?: number;
  experience_id?: string;
  experience_type?: string;
  experience_source?: string;
  total_price?: number;
  currency?: string;
  step?: string;
  [key: string]: any;
}

// ============================================================================
// ANALYTICS HOOK
// ============================================================================

export function useJourneyAnalytics() {
  /**
   * Track a journey event
   */
  const trackEvent = useCallback((event: JourneyEvent, properties?: EventProperties) => {
    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Journey Analytics] ${event}`, properties);
    }

    // Send to analytics service
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event, properties);
      }

      // Mixpanel
      if (typeof window !== 'undefined' && (window as any).mixpanel) {
        (window as any).mixpanel.track(event, properties);
      }

      // Custom analytics endpoint
      // fetch('/api/analytics/journey', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
      // });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }, []);

  /**
   * Track journey search started
   */
  const trackSearchStarted = useCallback(
    (params: { origin: string; destination: string; travelers: number }) => {
      trackEvent('journey_search_started', params);
    },
    [trackEvent]
  );

  /**
   * Track journey build initiated
   */
  const trackBuildInitiated = useCallback(
    (journey: Journey) => {
      trackEvent('journey_build_initiated', {
        journey_id: journey.id,
        destination: journey.destination.code,
        duration: journey.duration,
        travelers: journey.travelers.adults + journey.travelers.children,
        pace: journey.preferences.pace,
      });
    },
    [trackEvent]
  );

  /**
   * Track journey build completed
   */
  const trackBuildCompleted = useCallback(
    (journey: Journey, buildTimeMs: number) => {
      trackEvent('journey_build_completed', {
        journey_id: journey.id,
        destination: journey.destination.code,
        duration: journey.duration,
        travelers: journey.travelers.adults + journey.travelers.children,
        total_suggestions: journey.days.reduce((sum, day) => sum + day.experiences.length, 0),
        build_time_ms: buildTimeMs,
      });
    },
    [trackEvent]
  );

  /**
   * Track day expanded
   */
  const trackDayExpanded = useCallback(
    (journeyId: string, dayNumber: number) => {
      trackEvent('journey_day_expanded', {
        journey_id: journeyId,
        day_number: dayNumber,
      });
    },
    [trackEvent]
  );

  /**
   * Track experience added
   */
  const trackExperienceAdded = useCallback(
    (journeyId: string, dayNumber: number, experience: JourneyExperience) => {
      trackEvent('journey_experience_added', {
        journey_id: journeyId,
        day_number: dayNumber,
        experience_id: experience.id,
        experience_type: experience.type,
        experience_source: experience.source,
        price: experience.price.amount,
        currency: experience.price.currency,
      });
    },
    [trackEvent]
  );

  /**
   * Track experience removed
   */
  const trackExperienceRemoved = useCallback(
    (journeyId: string, dayNumber: number, experienceId: string) => {
      trackEvent('journey_experience_removed', {
        journey_id: journeyId,
        day_number: dayNumber,
        experience_id: experienceId,
      });
    },
    [trackEvent]
  );

  /**
   * Track suggestion accepted
   */
  const trackSuggestionAccepted = useCallback(
    (journeyId: string, dayNumber: number, experience: JourneyExperience) => {
      trackEvent('journey_suggestion_accepted', {
        journey_id: journeyId,
        day_number: dayNumber,
        experience_id: experience.id,
        experience_type: experience.type,
        ai_confidence: experience.aiConfidence,
      });
    },
    [trackEvent]
  );

  /**
   * Track suggestion dismissed
   */
  const trackSuggestionDismissed = useCallback(
    (journeyId: string, dayNumber: number, experienceId: string) => {
      trackEvent('journey_suggestion_dismissed', {
        journey_id: journeyId,
        day_number: dayNumber,
        experience_id: experienceId,
      });
    },
    [trackEvent]
  );

  /**
   * Track checkout started
   */
  const trackCheckoutStarted = useCallback(
    (journey: Journey) => {
      trackEvent('journey_checkout_started', {
        journey_id: journey.id,
        destination: journey.destination.code,
        duration: journey.duration,
        total_price: journey.pricing.total,
        currency: journey.pricing.currency,
        flights_count: journey.pricing.flights.items.length,
        hotels_count: journey.pricing.hotels.items.length,
        experiences_count: journey.pricing.experiences.items.length,
      });
    },
    [trackEvent]
  );

  /**
   * Track booking completed
   */
  const trackBookingCompleted = useCallback(
    (journey: Journey, bookingId: string) => {
      trackEvent('journey_booking_completed', {
        journey_id: journey.id,
        booking_id: bookingId,
        destination: journey.destination.code,
        duration: journey.duration,
        total_price: journey.pricing.total,
        currency: journey.pricing.currency,
        travelers: journey.travelers.adults + journey.travelers.children,
      });
    },
    [trackEvent]
  );

  /**
   * Track journey abandoned
   */
  const trackAbandoned = useCallback(
    (journey: Journey | null, step: string) => {
      trackEvent('journey_abandoned', {
        journey_id: journey?.id,
        destination: journey?.destination.code,
        step,
        had_suggestions: journey ? journey.days.some((d) => d.experiences.length > 0) : false,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackSearchStarted,
    trackBuildInitiated,
    trackBuildCompleted,
    trackDayExpanded,
    trackExperienceAdded,
    trackExperienceRemoved,
    trackSuggestionAccepted,
    trackSuggestionDismissed,
    trackCheckoutStarted,
    trackBookingCompleted,
    trackAbandoned,
  };
}

export default useJourneyAnalytics;
