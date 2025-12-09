/**
 * User Behavior Tracker for PWA
 * Tracks user interactions for smart install timing and predictive prefetching
 */

import { trackPageVisit, getPredictedRoutes } from './indexed-db';

interface UserEngagement {
  searchCount: number;
  pageViews: number;
  timeOnSite: number;
  hasCompletedSearch: boolean;
  hasViewedResults: boolean;
  sessionStart: number;
}

const STORAGE_KEY = 'fly2any-engagement';
const INSTALL_THRESHOLD = {
  minSearches: 1,
  minPageViews: 3,
  minTimeOnSite: 30000, // 30 seconds
};

let engagement: UserEngagement = {
  searchCount: 0,
  pageViews: 0,
  timeOnSite: 0,
  hasCompletedSearch: false,
  hasViewedResults: false,
  sessionStart: Date.now(),
};

let pageStartTime = Date.now();
let prefetchedRoutes = new Set<string>();

// Initialize from storage
export function initBehaviorTracker(): void {
  if (typeof window === 'undefined') return;

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    engagement = { ...engagement, ...JSON.parse(stored) };
  }

  engagement.sessionStart = engagement.sessionStart || Date.now();
  engagement.pageViews++;
  saveEngagement();

  // Track page time on unload
  window.addEventListener('beforeunload', handlePageUnload);
  window.addEventListener('visibilitychange', handleVisibilityChange);
}

function saveEngagement(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(engagement));
}

function handlePageUnload(): void {
  const timeSpent = Date.now() - pageStartTime;
  engagement.timeOnSite += timeSpent;
  saveEngagement();

  // Track in IndexedDB for ML predictions
  if (typeof window !== 'undefined') {
    const route = window.location.pathname;
    trackPageVisit(route, timeSpent).catch(console.error);
  }
}

function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    handlePageUnload();
  } else {
    pageStartTime = Date.now();
  }
}

// Track search completion
export function trackSearch(): void {
  engagement.searchCount++;
  engagement.hasCompletedSearch = true;
  saveEngagement();
}

// Track results view
export function trackResultsView(): void {
  engagement.hasViewedResults = true;
  saveEngagement();
}

// Check if user is engaged enough to show install prompt
export function shouldShowInstallPrompt(): boolean {
  const currentTimeOnSite = engagement.timeOnSite + (Date.now() - pageStartTime);

  // High-intent signals
  if (engagement.hasCompletedSearch && engagement.hasViewedResults) {
    return true;
  }

  // Engagement threshold met
  if (
    engagement.searchCount >= INSTALL_THRESHOLD.minSearches ||
    (engagement.pageViews >= INSTALL_THRESHOLD.minPageViews &&
      currentTimeOnSite >= INSTALL_THRESHOLD.minTimeOnSite)
  ) {
    return true;
  }

  return false;
}

// Get engagement score for analytics
export function getEngagementScore(): number {
  const currentTimeOnSite = engagement.timeOnSite + (Date.now() - pageStartTime);

  let score = 0;
  score += Math.min(engagement.searchCount * 20, 40);
  score += Math.min(engagement.pageViews * 5, 20);
  score += Math.min(currentTimeOnSite / 1000, 20);
  score += engagement.hasCompletedSearch ? 10 : 0;
  score += engagement.hasViewedResults ? 10 : 0;

  return Math.min(score, 100);
}

// Prefetch predicted routes based on user behavior
export async function prefetchPredictedRoutes(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const routes = await getPredictedRoutes(3);

    for (const route of routes) {
      if (prefetchedRoutes.has(route)) continue;

      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: 'PREFETCH_ROUTE',
        payload: { route },
      });

      prefetchedRoutes.add(route);
    }
  } catch (error) {
    console.error('Failed to prefetch routes:', error);
  }
}

// Prefetch specific route
export async function prefetchRoute(route: string): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (prefetchedRoutes.has(route)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'PREFETCH_ROUTE',
      payload: { route },
    });
    prefetchedRoutes.add(route);
  } catch (error) {
    console.error('Failed to prefetch route:', error);
  }
}

// Get current engagement data
export function getEngagement(): UserEngagement {
  return { ...engagement };
}

// Reset engagement (e.g., after install)
export function resetEngagement(): void {
  engagement = {
    searchCount: 0,
    pageViews: 1,
    timeOnSite: 0,
    hasCompletedSearch: false,
    hasViewedResults: false,
    sessionStart: Date.now(),
  };
  saveEngagement();
}
