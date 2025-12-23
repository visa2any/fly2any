/**
 * CONVERSION FLYWHEEL HOOK
 * Sprint 4 - User Intent & Conversion State Management
 *
 * Tracks user journey state for personalized UX:
 * - First visit → Educate (build trust)
 * - Returning visit → Compare (show value)
 * - High-intent visit → Book (reduce friction)
 *
 * No aggressive popups. No dark patterns. Privacy-first.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserIntent, PageType, detectUserIntent, getIntentConfig, type IntentConfig } from '@/lib/seo/intent-segmentation';

// ============================================================================
// TYPES
// ============================================================================

export type JourneyState = 'first-visit' | 'returning' | 'high-intent';

export interface UserJourney {
  state: JourneyState;
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  pagesViewed: string[];
  searchesPerformed: number;
  routesCompared: string[];
  priceAlertsSet: number;
}

export interface UseUserIntentReturn {
  journeyState: JourneyState;
  intent: UserIntent;
  config: IntentConfig;
  visitCount: number;
  isFirstVisit: boolean;
  isHighIntent: boolean;
  trackPageView: (path: string) => void;
  trackSearch: () => void;
  trackRouteCompare: (route: string) => void;
  trackPriceAlert: () => void;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEY = 'fly2any_journey';
const SESSION_KEY = 'fly2any_session';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStoredJourney(): UserJourney | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveJourney(journey: UserJourney): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
  } catch {
    // Storage full or disabled - gracefully ignore
  }
}

function createInitialJourney(): UserJourney {
  const now = new Date().toISOString();
  return {
    state: 'first-visit',
    visitCount: 1,
    firstVisit: now,
    lastVisit: now,
    pagesViewed: [],
    searchesPerformed: 0,
    routesCompared: [],
    priceAlertsSet: 0,
  };
}

function determineJourneyState(journey: UserJourney): JourneyState {
  // High intent signals
  const hasMultipleSearches = journey.searchesPerformed >= 2;
  const hasComparedRoutes = journey.routesCompared.length >= 2;
  const hasPriceAlerts = journey.priceAlertsSet >= 1;
  const isFrequentVisitor = journey.visitCount >= 3;

  if (hasMultipleSearches || hasComparedRoutes || hasPriceAlerts) {
    return 'high-intent';
  }

  if (journey.visitCount > 1 || journey.pagesViewed.length > 3) {
    return 'returning';
  }

  return 'first-visit';
}

// ============================================================================
// HOOK
// ============================================================================

export function useUserIntent(pageType: PageType): UseUserIntentReturn {
  const [journey, setJourney] = useState<UserJourney>(createInitialJourney);
  const [isClient, setIsClient] = useState(false);

  // Initialize on client
  useEffect(() => {
    setIsClient(true);
    const stored = getStoredJourney();
    const now = new Date().toISOString();

    if (stored) {
      // Check if this is a new session (> 30 min since last visit)
      const lastVisit = new Date(stored.lastVisit);
      const minutesSinceLastVisit = (Date.now() - lastVisit.getTime()) / (1000 * 60);
      const isNewSession = minutesSinceLastVisit > 30;

      const updated: UserJourney = {
        ...stored,
        visitCount: isNewSession ? stored.visitCount + 1 : stored.visitCount,
        lastVisit: now,
        state: determineJourneyState(stored),
      };
      setJourney(updated);
      saveJourney(updated);
    } else {
      const initial = createInitialJourney();
      setJourney(initial);
      saveJourney(initial);
    }
  }, []);

  // Track page view
  const trackPageView = useCallback((path: string) => {
    setJourney(prev => {
      if (prev.pagesViewed.includes(path)) return prev;

      const updated: UserJourney = {
        ...prev,
        pagesViewed: [...prev.pagesViewed.slice(-19), path], // Keep last 20
        state: determineJourneyState(prev),
      };
      saveJourney(updated);
      return updated;
    });
  }, []);

  // Track search performed
  const trackSearch = useCallback(() => {
    setJourney(prev => {
      const updated: UserJourney = {
        ...prev,
        searchesPerformed: prev.searchesPerformed + 1,
        state: determineJourneyState({ ...prev, searchesPerformed: prev.searchesPerformed + 1 }),
      };
      saveJourney(updated);
      return updated;
    });
  }, []);

  // Track route comparison
  const trackRouteCompare = useCallback((route: string) => {
    setJourney(prev => {
      if (prev.routesCompared.includes(route)) return prev;

      const updated: UserJourney = {
        ...prev,
        routesCompared: [...prev.routesCompared.slice(-9), route], // Keep last 10
        state: determineJourneyState(prev),
      };
      saveJourney(updated);
      return updated;
    });
  }, []);

  // Track price alert
  const trackPriceAlert = useCallback(() => {
    setJourney(prev => {
      const updated: UserJourney = {
        ...prev,
        priceAlertsSet: prev.priceAlertsSet + 1,
        state: 'high-intent',
      };
      saveJourney(updated);
      return updated;
    });
  }, []);

  // Derive intent from journey state and page type
  const intent = detectUserIntent(pageType, {
    visitCount: journey.visitCount,
    pagesViewed: journey.pagesViewed,
  });

  const config = getIntentConfig(pageType, {
    visitCount: journey.visitCount,
    pagesViewed: journey.pagesViewed,
  });

  return {
    journeyState: journey.state,
    intent,
    config,
    visitCount: journey.visitCount,
    isFirstVisit: journey.state === 'first-visit',
    isHighIntent: journey.state === 'high-intent',
    trackPageView,
    trackSearch,
    trackRouteCompare,
    trackPriceAlert,
  };
}

export default useUserIntent;
