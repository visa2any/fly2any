/**
 * Web Vitals Performance Monitoring
 *
 * Tracks Core Web Vitals and sends metrics to analytics endpoints.
 * Integrates with Google Analytics, Sentry, and custom analytics.
 *
 * Core Web Vitals tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - INP (Interaction to Next Paint): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response time
 *
 * Note: FID (First Input Delay) has been deprecated in favor of INP
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

/**
 * Web Vitals thresholds based on Google's recommendations
 */
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

/**
 * Get rating for a metric based on thresholds
 */
export function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Format metric value for display
 */
export function formatMetricValue(metric: Metric): string {
  const { name, value } = metric;

  // CLS is a unitless score
  if (name === 'CLS') {
    return value.toFixed(3);
  }

  // Time-based metrics in milliseconds
  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }

  // Convert to seconds for large values
  return `${(value / 1000).toFixed(2)}s`;
}

/**
 * Store metrics in localStorage for historical tracking
 */
function storeMetricLocally(metric: Metric) {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const key = `vitals_${metric.name}`;
    const stored = localStorage.getItem(key);
    const history = stored ? JSON.parse(stored) : [];

    // Store last 100 measurements
    history.push({
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
      id: metric.id,
      navigationType: metric.navigationType,
    });

    if (history.length > 100) {
      history.shift();
    }

    localStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to store metric locally:', error);
  }
}

/**
 * Send metric to analytics endpoint
 */
async function sendToAnalytics(metric: Metric) {
  // Prepare metric data for transmission
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  try {
    // Use sendBeacon for reliability (doesn't get cancelled on page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/vitals', blob);
    } else {
      // Fallback to fetch
      await fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('Failed to send metric to analytics:', error);
  }
}

/**
 * Send metric to Google Analytics (if available)
 */
function sendToGoogleAnalytics(metric: Metric) {
  if (typeof window === 'undefined') return;

  // Check for gtag (Google Analytics 4)
  if ('gtag' in window && typeof window.gtag === 'function') {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Check for ga (Universal Analytics - legacy)
  if ('ga' in window && typeof window.ga === 'function') {
    window.ga('send', 'event', {
      eventCategory: 'Web Vitals',
      eventAction: metric.name,
      eventValue: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      eventLabel: metric.id,
      nonInteraction: true,
      transport: 'beacon',
    });
  }
}

/**
 * Send metric to Sentry for performance monitoring
 */
function sendToSentry(metric: Metric) {
  if (typeof window === 'undefined') return;

  // Check if Sentry is available
  if ('Sentry' in window && window.Sentry) {
    window.Sentry.captureMessage(`Web Vital: ${metric.name}`, {
      level: metric.rating === 'poor' ? 'warning' : 'info',
      tags: {
        web_vital: metric.name,
        rating: metric.rating,
      },
      extra: {
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      },
    });
  }
}

/**
 * Log metric to console in development
 */
function logMetricToConsole(metric: Metric) {
  if (process.env.NODE_ENV !== 'development') return;

  const rating = getMetricRating(metric.name, metric.value);
  const color = rating === 'good' ? '#0CCE6B' : rating === 'needs-improvement' ? '#FFA400' : '#FF4E42';

  console.log(
    `%c${metric.name}%c ${formatMetricValue(metric)} (${rating})`,
    `background: ${color}; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;`,
    'color: inherit;',
    {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    }
  );
}

/**
 * Main handler for Web Vitals metrics
 */
function handleMetric(metric: Metric) {
  // Always log to console in development
  logMetricToConsole(metric);

  // Store locally for dashboard
  storeMetricLocally(metric);

  // Only send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(metric);
    sendToGoogleAnalytics(metric);
    sendToSentry(metric);
  }

  // Emit custom event for real-time dashboard updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('web-vital', {
        detail: metric,
      })
    );
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this once when the app loads
 */
export function initWebVitals() {
  try {
    // Track Core Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);

    console.log('[Web Vitals] Tracking initialized');
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

/**
 * Get all stored metrics from localStorage
 */
export function getStoredMetrics() {
  if (typeof window === 'undefined' || !window.localStorage) return {};

  const metrics: Record<string, any[]> = {};
  const metricNames = ['CLS', 'FCP', 'LCP', 'TTFB', 'INP'];

  for (const name of metricNames) {
    try {
      const stored = localStorage.getItem(`vitals_${name}`);
      metrics[name] = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Failed to retrieve ${name} metrics:`, error);
      metrics[name] = [];
    }
  }

  return metrics;
}

/**
 * Get latest metric value for each vital
 */
export function getLatestMetrics() {
  const stored = getStoredMetrics();
  const latest: Record<string, any> = {};

  for (const [name, history] of Object.entries(stored)) {
    if (Array.isArray(history) && history.length > 0) {
      latest[name] = history[history.length - 1];
    }
  }

  return latest;
}

/**
 * Calculate average for a metric
 */
export function getMetricAverage(metricName: string): number | null {
  const stored = getStoredMetrics();
  const history = stored[metricName] || [];

  if (history.length === 0) return null;

  const sum = history.reduce((acc: number, item: any) => acc + item.value, 0);
  return sum / history.length;
}

/**
 * Clear all stored metrics
 */
export function clearStoredMetrics() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const metricNames = ['CLS', 'FCP', 'LCP', 'TTFB', 'INP'];
  for (const name of metricNames) {
    localStorage.removeItem(`vitals_${name}`);
  }
}

// Type declarations for external integrations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ga?: (...args: any[]) => void;
    Sentry?: {
      captureMessage: (message: string, options?: any) => void;
    };
  }
}
