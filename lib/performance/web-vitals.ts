/**
 * Core Web Vitals Monitoring
 *
 * Track and report LCP, INP, CLS metrics
 * Targets: LCP ≤1.3s, INP ≤100ms, CLS ≤0.05
 */

type MetricName = 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Thresholds based on Google's recommendations
const THRESHOLDS: Record<MetricName, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report metric to analytics endpoint
 */
export function reportMetric(metric: WebVitalMetric): void {
  // Send to your analytics service
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const body = JSON.stringify({
      ...metric,
      url: window.location.href,
      timestamp: Date.now(),
    });

    // Replace with your actual endpoint
    // navigator.sendBeacon('/api/analytics/web-vitals', body);
    console.debug(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }
}

/**
 * Track Largest Contentful Paint
 */
export function trackLCP(callback?: (metric: WebVitalMetric) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };

    const metric: WebVitalMetric = {
      name: 'LCP',
      value: lastEntry.startTime,
      rating: getRating('LCP', lastEntry.startTime),
      delta: lastEntry.startTime,
      id: `lcp-${Date.now()}`,
    };

    callback?.(metric);
    reportMetric(metric);
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });
}

/**
 * Track Cumulative Layout Shift
 */
export function trackCLS(callback?: (metric: WebVitalMetric) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries() as any[]) {
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0] as any;
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1] as any;

        if (
          sessionValue &&
          entry.startTime - lastSessionEntry?.startTime < 1000 &&
          entry.startTime - firstSessionEntry?.startTime < 5000
        ) {
          sessionValue += entry.value;
          sessionEntries.push(entry);
        } else {
          sessionValue = entry.value;
          sessionEntries = [entry];
        }

        if (sessionValue > clsValue) {
          clsValue = sessionValue;

          const metric: WebVitalMetric = {
            name: 'CLS',
            value: clsValue,
            rating: getRating('CLS', clsValue),
            delta: entry.value,
            id: `cls-${Date.now()}`,
          };

          callback?.(metric);
          reportMetric(metric);
        }
      }
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });
}

/**
 * Track First Contentful Paint
 */
export function trackFCP(callback?: (metric: WebVitalMetric) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
      const metric: WebVitalMetric = {
        name: 'FCP',
        value: entry.startTime,
        rating: getRating('FCP', entry.startTime),
        delta: entry.startTime,
        id: `fcp-${Date.now()}`,
      };

      callback?.(metric);
      reportMetric(metric);
      observer.disconnect();
    }
  });

  observer.observe({ type: 'paint', buffered: true });
}

/**
 * Initialize all Web Vitals tracking
 */
export function initWebVitals(
  callback?: (metric: WebVitalMetric) => void
): void {
  if (typeof window === 'undefined') return;

  // Start tracking after load
  if (document.readyState === 'complete') {
    trackLCP(callback);
    trackCLS(callback);
    trackFCP(callback);
  } else {
    window.addEventListener('load', () => {
      trackLCP(callback);
      trackCLS(callback);
      trackFCP(callback);
    });
  }
}

export default { initWebVitals, trackLCP, trackCLS, trackFCP, reportMetric };
