'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

export interface WebVitalsMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  ttfb?: number;
}

export interface PerformanceConfig {
  enabled?: boolean;
  sampleRate?: number;
  reportToAnalytics?: boolean;
  thresholds?: {
    lcp?: number;
    fid?: number;
    cls?: number;
    inp?: number;
  };
}

export function usePerformanceMonitoring(config: PerformanceConfig = {}) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isSupported, setIsSupported] = useState(false);
  const metricsRef = useRef<PerformanceMetric[]>([]);
  const observersRef = useRef<PerformanceObserver[]>([]);

  const defaultConfig: Required<PerformanceConfig> = {
    enabled: true,
    sampleRate: 1,
    reportToAnalytics: false,
    thresholds: {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      inp: 200,
    },
    ...config,
  };

  // Initialize performance monitoring
  useEffect(() => {
    if (!defaultConfig.enabled || Math.random() > defaultConfig.sampleRate) {
      return;
    }

    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    setIsSupported(true);
    initializeWebVitals();

    return () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
    };
  }, []);

  const initializeWebVitals = useCallback(() => {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          if (lastEntry) {
            const lcp = lastEntry.startTime;
            recordMetric('LCP', lcp);
            setMetrics((prev: any) => ({ ...prev, lcp }));
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observersRef.current.push(lcpObserver);
      } catch (e) {
        console.debug('LCP observer failed:', e);
      }
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'first-input') {
              const fid = entry.processingStart - entry.startTime;
              recordMetric('FID', fid);
              setMetrics((prev: any) => ({ ...prev, fid }));
            }
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        observersRef.current.push(fidObserver);
      } catch (e) {
        console.debug('FID observer failed:', e);
      }
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          recordMetric('CLS', clsValue);
          setMetrics((prev: any) => ({ ...prev, cls: clsValue }));
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observersRef.current.push(clsObserver);
      } catch (e) {
        console.debug('CLS observer failed:', e);
      }
    }

    // First Contentful Paint (FCP)
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          
          if (fcpEntry) {
            const fcp = fcpEntry.startTime;
            recordMetric('FCP', fcp);
            setMetrics((prev: any) => ({ ...prev, fcp }));
          }
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
        observersRef.current.push(fcpObserver);
      } catch (e) {
        console.debug('FCP observer failed:', e);
      }
    }

    // Time to First Byte (TTFB)
    if ('performance' in window && 'getEntriesByType' in performance) {
      try {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0];
          const ttfb = navEntry.responseStart - navEntry.requestStart;
          recordMetric('TTFB', ttfb);
          setMetrics((prev: any) => ({ ...prev, ttfb }));
        }
      } catch (e) {
        console.debug('TTFB measurement failed:', e);
      }
    }

    // Interaction to Next Paint (INP) - experimental
    if ('PerformanceObserver' in window) {
      try {
        const inpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.entryType === 'event' && entry.duration) {
              const inp = entry.duration;
              recordMetric('INP', inp);
              setMetrics((prev: any) => ({ ...prev, inp: Math.max(prev.inp || 0, inp) }));
            }
          });
        });
        
        inpObserver.observe({ entryTypes: ['event'] });
        observersRef.current.push(inpObserver);
      } catch (e) {
        console.debug('INP observer failed:', e);
      }
    }
  }, []);

  const recordMetric = useCallback((name: string, value: number) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
    };

    metricsRef.current.push(metric);

    // Check thresholds and warn if exceeded
    const threshold = defaultConfig.thresholds[name.toLowerCase() as keyof typeof defaultConfig.thresholds];
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded for ${name}: ${value} > ${threshold}`);
    }

    // Report to analytics if enabled
    if (defaultConfig.reportToAnalytics) {
      reportToAnalytics(metric);
    }
  }, [defaultConfig.reportToAnalytics, defaultConfig.thresholds]);

  const reportToAnalytics = useCallback((metric: PerformanceMetric) => {
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        ...metric,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType,
      });
      
      navigator.sendBeacon('/api/analytics/performance', data);
    }
  }, []);

  // Manual performance measurement
  const measurePerformance = useCallback((name: string, fn: () => void | Promise<void>) => {
    const start = performance.now();
    
    const measure = () => {
      const duration = performance.now() - start;
      recordMetric(name, duration);
      return duration;
    };

    const result = fn();
    
    if (result instanceof Promise) {
      return result.then(() => measure());
    } else {
      return measure();
    }
  }, [recordMetric]);

  // Get performance insights
  const getInsights = useCallback(() => {
    const insights = {
      isGood: true,
      warnings: [] as string[],
      recommendations: [] as string[],
    };

    // LCP insights
    if (metrics.lcp && metrics.lcp > 4000) {
      insights.isGood = false;
      insights.warnings.push('Largest Contentful Paint is poor (>4s)');
      insights.recommendations.push('Optimize images and lazy load non-critical resources');
    } else if (metrics.lcp && metrics.lcp > 2500) {
      insights.warnings.push('Largest Contentful Paint needs improvement (>2.5s)');
    }

    // FID insights
    if (metrics.fid && metrics.fid > 300) {
      insights.isGood = false;
      insights.warnings.push('First Input Delay is poor (>300ms)');
      insights.recommendations.push('Reduce JavaScript execution time and optimize main thread work');
    } else if (metrics.fid && metrics.fid > 100) {
      insights.warnings.push('First Input Delay needs improvement (>100ms)');
    }

    // CLS insights
    if (metrics.cls && metrics.cls > 0.25) {
      insights.isGood = false;
      insights.warnings.push('Cumulative Layout Shift is poor (>0.25)');
      insights.recommendations.push('Reserve space for images and ads, avoid inserting content above existing content');
    } else if (metrics.cls && metrics.cls > 0.1) {
      insights.warnings.push('Cumulative Layout Shift needs improvement (>0.1)');
    }

    return insights;
  }, [metrics]);

  return {
    metrics,
    isSupported,
    measurePerformance,
    getInsights,
    rawMetrics: metricsRef.current,
  };
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const currentTime = Date.now();
    const renderTime = currentTime - lastRenderTime.current;
    renderTimesRef.current.push(renderTime);
    lastRenderTime.current = currentTime;

    // Keep only recent render times
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current = renderTimesRef.current.slice(-50);
    }

    // Log slow renders
    if (renderTime > 16) { // 60fps threshold
      console.debug(`Slow render detected in ${componentName}: ${renderTime}ms`);
    }
  });

  const getStats = useCallback(() => {
    const times = renderTimesRef.current;
    if (times.length === 0) return null;

    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    return {
      renderCount: renderCountRef.current,
      averageRenderTime: avg,
      maxRenderTime: max,
      minRenderTime: min,
      slowRenders: times.filter(time => time > 16).length,
    };
  }, []);

  return {
    renderCount: renderCountRef.current,
    getStats,
  };
}

// Hook for memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

export default usePerformanceMonitoring;