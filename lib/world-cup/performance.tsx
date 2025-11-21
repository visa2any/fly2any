/**
 * WORLD CUP PERFORMANCE MONITORING
 *
 * Real-time performance tracking for:
 * - Core Web Vitals (LCP, FID, CLS)
 * - Custom metrics
 * - Component render times
 * - Bundle size tracking
 * - API response times
 */

/**
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Custom Metrics
  componentRenderTime?: number;
  apiResponseTime?: number;
  imageLoadTime?: number;
  interactionDelay?: number;

  // Context
  page: string;
  userAgent: string;
  timestamp: number;
}

/**
 * Performance Observer Singleton
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor() {
    if (typeof window === 'undefined') return;
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.recordMetric('lcp', lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // FID Observer
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('cls', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Navigation Timing
      const navigationObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('fcp', entry.firstContentfulPaint);
          this.recordMetric('ttfb', entry.responseStart);
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  private recordMetric(name: keyof PerformanceMetrics, value: number) {
    const metric: Partial<PerformanceMetrics> = {
      [name]: value,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    this.metrics.push(metric as PerformanceMetrics);

    // Send to analytics
    this.sendToAnalytics(name, value);
  }

  private sendToAnalytics(name: string, value: number) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'World Cup Performance',
        event_label: name.toUpperCase(),
        value: Math.round(value),
        metric_value: value,
        page_path: window.location.pathname,
      });
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get average metrics
   */
  getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const sum = this.metrics.reduce((acc, metric) => {
      Object.keys(metric).forEach((key) => {
        const typedKey = key as keyof PerformanceMetrics;
        if (typeof metric[typedKey] === 'number') {
          acc[typedKey] = (acc[typedKey] || 0) + (metric[typedKey] as number);
        }
      });
      return acc;
    }, {} as any);

    Object.keys(sum).forEach((key) => {
      sum[key] = sum[key] / this.metrics.length;
    });

    return sum;
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Initialize performance monitoring
 */
export function initWorldCupPerformanceMonitoring() {
  return PerformanceMonitor.getInstance();
}

/**
 * Component Performance Tracker HOC
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const [renderTime, setRenderTime] = React.useState<number>(0);

    React.useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        setRenderTime(duration);

        // Send to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'component_render', {
            event_category: 'World Cup Performance',
            event_label: componentName,
            value: Math.round(duration),
            component_name: componentName,
          });
        }
      };
    }, []);

    return <Component {...props} />;
  };
}

/**
 * API Performance Tracker
 */
export async function trackAPIPerformance<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_performance', {
        event_category: 'World Cup API',
        event_label: apiName,
        value: Math.round(duration),
        api_name: apiName,
        status: 'success',
      });
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Send error to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_performance', {
        event_category: 'World Cup API',
        event_label: apiName,
        value: Math.round(duration),
        api_name: apiName,
        status: 'error',
      });
    }

    throw error;
  }
}

/**
 * Performance Budget Checker
 */
export const performanceBudget = {
  // Core Web Vitals thresholds (Good)
  lcp: 2500, // 2.5s
  fid: 100, // 100ms
  cls: 0.1, // 0.1
  fcp: 1800, // 1.8s
  ttfb: 800, // 800ms

  // Custom thresholds
  componentRenderTime: 16, // 16ms (60fps)
  apiResponseTime: 1000, // 1s
  imageLoadTime: 2000, // 2s
};

/**
 * Check if metric passes budget
 */
export function isWithinBudget(
  metric: keyof typeof performanceBudget,
  value: number
): boolean {
  return value <= performanceBudget[metric];
}

/**
 * Get performance grade
 */
export function getPerformanceGrade(metrics: Partial<PerformanceMetrics>): 'A' | 'B' | 'C' | 'D' | 'F' {
  let score = 0;
  let count = 0;

  Object.entries(metrics).forEach(([key, value]) => {
    if (typeof value === 'number' && key in performanceBudget) {
      const metricKey = key as keyof typeof performanceBudget;
      const budget = performanceBudget[metricKey];
      const percentage = (value / budget) * 100;

      if (percentage <= 100) score += 100;
      else if (percentage <= 150) score += 75;
      else if (percentage <= 200) score += 50;
      else if (percentage <= 300) score += 25;
      else score += 0;

      count++;
    }
  });

  if (count === 0) return 'F';

  const average = score / count;

  if (average >= 90) return 'A';
  if (average >= 75) return 'B';
  if (average >= 60) return 'C';
  if (average >= 50) return 'D';
  return 'F';
}

/**
 * Performance Report Generator
 */
export function generatePerformanceReport(): string {
  const monitor = PerformanceMonitor.getInstance();
  const averages = monitor.getAverageMetrics();
  const grade = getPerformanceGrade(averages);

  let report = '=== WORLD CUP PERFORMANCE REPORT ===\n\n';
  report += `Overall Grade: ${grade}\n\n`;

  report += 'Core Web Vitals:\n';
  if (averages.lcp) {
    report += `  LCP: ${averages.lcp.toFixed(2)}ms ${isWithinBudget('lcp', averages.lcp) ? '✅' : '❌'}\n`;
  }
  if (averages.fid) {
    report += `  FID: ${averages.fid.toFixed(2)}ms ${isWithinBudget('fid', averages.fid) ? '✅' : '❌'}\n`;
  }
  if (averages.cls) {
    report += `  CLS: ${averages.cls.toFixed(3)} ${isWithinBudget('cls', averages.cls) ? '✅' : '❌'}\n`;
  }
  if (averages.fcp) {
    report += `  FCP: ${averages.fcp.toFixed(2)}ms ${isWithinBudget('fcp', averages.fcp) ? '✅' : '❌'}\n`;
  }
  if (averages.ttfb) {
    report += `  TTFB: ${averages.ttfb.toFixed(2)}ms ${isWithinBudget('ttfb', averages.ttfb) ? '✅' : '❌'}\n`;
  }

  report += '\nBudgets:\n';
  Object.entries(performanceBudget).forEach(([key, value]) => {
    report += `  ${key}: ${value}ms\n`;
  });

  return report;
}

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitoring(componentName: string) {
  const [metrics, setMetrics] = React.useState<Partial<PerformanceMetrics>>({});

  React.useEffect(() => {
    const startTime = performance.now();

    // Track component mount
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'component_mount', {
        event_category: 'World Cup Performance',
        event_label: componentName,
        component_name: componentName,
      });
    }

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setMetrics({
        componentRenderTime: renderTime,
        timestamp: Date.now(),
      });

      // Track component unmount
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'component_unmount', {
          event_category: 'World Cup Performance',
          event_label: componentName,
          value: Math.round(renderTime),
          component_name: componentName,
          render_time: renderTime,
        });
      }
    };
  }, [componentName]);

  return metrics;
}

/**
 * Image loading performance tracker
 */
export function trackImageLoad(imageName: string, imageUrl: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();
  const img = new Image();

  img.onload = () => {
    const loadTime = performance.now() - startTime;

    if ((window as any).gtag) {
      (window as any).gtag('event', 'image_load', {
        event_category: 'World Cup Performance',
        event_label: imageName,
        value: Math.round(loadTime),
        image_name: imageName,
        image_url: imageUrl,
        load_time: loadTime,
      });
    }
  };

  img.onerror = () => {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'image_error', {
        event_category: 'World Cup Performance',
        event_label: imageName,
        image_name: imageName,
        image_url: imageUrl,
      });
    }
  };

  img.src = imageUrl;
}

/**
 * Bundle size warning
 */
export function checkBundleSize(componentName: string, maxSizeKB: number) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const componentScripts = resources.filter(
    r => r.name.includes(componentName) && r.name.endsWith('.js')
  );

  componentScripts.forEach(script => {
    const sizeKB = (script.transferSize || 0) / 1024;
    if (sizeKB > maxSizeKB) {
      console.warn(
        `⚠️ Bundle size warning: ${componentName} (${sizeKB.toFixed(2)}KB) exceeds budget (${maxSizeKB}KB)`
      );
    }
  });
}

// Import React for hooks
import React from 'react';
