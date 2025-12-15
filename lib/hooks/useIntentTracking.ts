'use client';

import { useEffect, useRef, useCallback } from 'react';
import { IntentTracker, type IntentScore } from '@/lib/ai/intent-scorer';

/**
 * React hook for real-time intent tracking
 * Level-6: Automatic signal capture with manual overrides
 */
export function useIntentTracking(
  options: {
    isReturning?: boolean;
    hasAccount?: boolean;
    onScoreChange?: (score: IntentScore) => void;
    trackingInterval?: number; // ms between score updates
  } = {}
) {
  const {
    isReturning = false,
    hasAccount = false,
    onScoreChange,
    trackingInterval = 10000, // 10 seconds
  } = options;

  const trackerRef = useRef<IntentTracker | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize tracker
  useEffect(() => {
    trackerRef.current = new IntentTracker(isReturning, hasAccount);

    // Set up periodic score updates
    if (onScoreChange) {
      intervalRef.current = setInterval(() => {
        if (trackerRef.current) {
          const score = trackerRef.current.getScore();
          onScoreChange(score);
        }
      }, trackingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isReturning, hasAccount, onScoreChange, trackingInterval]);

  // Track search
  const trackSearch = useCallback(() => {
    trackerRef.current?.trackSearch();
  }, []);

  // Track flight click
  const trackFlightClick = useCallback(() => {
    trackerRef.current?.trackFlightClick();
  }, []);

  // Track price alert creation
  const trackPriceAlert = useCallback(() => {
    trackerRef.current?.trackPriceAlert();
  }, []);

  // Track save
  const trackSave = useCallback(() => {
    trackerRef.current?.trackSave();
  }, []);

  // Track comparison
  const trackCompare = useCallback(() => {
    trackerRef.current?.trackCompare();
  }, []);

  // Track page view
  const trackPageView = useCallback(() => {
    trackerRef.current?.trackPageView();
  }, []);

  // Set departure date
  const setDepartureDate = useCallback((date: Date) => {
    trackerRef.current?.setDepartureDate(date);
  }, []);

  // Get current score
  const getScore = useCallback((): IntentScore | null => {
    return trackerRef.current?.getScore() || null;
  }, []);

  // Get raw signals
  const getSignals = useCallback(() => {
    return trackerRef.current?.getSignals() || {};
  }, []);

  return {
    trackSearch,
    trackFlightClick,
    trackPriceAlert,
    trackSave,
    trackCompare,
    trackPageView,
    setDepartureDate,
    getScore,
    getSignals,
  };
}

/**
 * Get intent-based recommendations for UI
 */
export function getIntentRecommendations(score: IntentScore | null): {
  showUrgency: boolean;
  showSocialProof: boolean;
  showPriceAlert: boolean;
  showDiscountOffer: boolean;
  ctaVariant: 'primary' | 'secondary' | 'soft';
} {
  if (!score) {
    return {
      showUrgency: false,
      showSocialProof: false,
      showPriceAlert: true,
      showDiscountOffer: false,
      ctaVariant: 'soft',
    };
  }

  return {
    showUrgency: score.level === 'ready' || score.level === 'hot',
    showSocialProof: score.level !== 'cold',
    showPriceAlert: !score.topFactors.includes('Price alert created'),
    showDiscountOffer: score.level === 'cold',
    ctaVariant: score.level === 'ready' ? 'primary' :
                score.level === 'hot' ? 'primary' :
                score.level === 'warm' ? 'secondary' : 'soft',
  };
}
