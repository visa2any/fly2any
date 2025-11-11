/**
 * Performance Monitoring System
 *
 * Tracks application performance metrics including:
 * - Operation duration
 * - API response times
 * - Database query performance
 * - Cache hit/miss rates
 * - Resource utilization
 */

import { captureMessage } from './sentry';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface MetricStats {
  count: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

/**
 * Performance Monitor class for tracking operation metrics
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private activeOperations: Map<string, number> = new Map();
  private maxStoredMetrics = 1000; // Store last 1000 measurements per metric

  /**
   * Start measuring an operation
   */
  startMeasure(name: string, metadata?: Record<string, any>): void {
    const key = this.generateKey(name, metadata);
    this.activeOperations.set(key, performance.now());

    // Also use Performance API for browser compatibility
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${key}-start`);
    }
  }

  /**
   * End measurement and return duration
   */
  endMeasure(name: string, metadata?: Record<string, any>): number {
    const key = this.generateKey(name, metadata);
    const startTime = this.activeOperations.get(key);

    if (!startTime) {
      console.warn(`[Performance] No start time found for: ${name}`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Clean up
    this.activeOperations.delete(key);

    // Store metric
    this.storeMetric(name, duration);

    // Log slow operations
    const threshold = this.getThreshold(name);
    if (duration > threshold) {
      console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);

      // Only alert on significantly slow operations in production
      if (process.env.NODE_ENV === 'production' && duration > threshold * 2) {
        captureMessage(
          `Slow operation: ${name}`,
          'warning',
          { duration, threshold, metadata }
        );
      }
    }

    // Use Performance API measurement
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      try {
        performance.mark(`${key}-end`);
        performance.measure(key, `${key}-start`, `${key}-end`);
      } catch (error) {
        // Ignore measurement errors
      }
    }

    return duration;
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startMeasure(name, metadata);

    try {
      const result = await operation();
      this.endMeasure(name, metadata);
      return result;
    } catch (error) {
      this.endMeasure(name, metadata);
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   */
  measure<T>(
    name: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startMeasure(name, metadata);

    try {
      const result = operation();
      this.endMeasure(name, metadata);
      return result;
    } catch (error) {
      this.endMeasure(name, metadata);
      throw error;
    }
  }

  /**
   * Store metric value
   */
  public storeMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const measurements = this.metrics.get(name)!;
    measurements.push(duration);

    // Keep only last N measurements to prevent memory issues
    if (measurements.length > this.maxStoredMetrics) {
      measurements.shift();
    }
  }

  /**
   * Get statistics for a metric
   */
  getMetrics(name: string): MetricStats | null {
    const measurements = this.metrics.get(name);

    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      count: sorted.length,
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    };
  }

  /**
   * Get all tracked metrics
   */
  getAllMetrics(): Record<string, MetricStats | null> {
    const allMetrics: Record<string, MetricStats | null> = {};

    for (const name of this.metrics.keys()) {
      allMetrics[name] = this.getMetrics(name);
    }

    return allMetrics;
  }

  /**
   * Get metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.activeOperations.clear();
  }

  /**
   * Clear specific metric
   */
  clearMetric(name: string): void {
    this.metrics.delete(name);
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedArr: number[], p: number): number {
    if (sortedArr.length === 0) return 0;

    const index = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, index)];
  }

  /**
   * Generate unique key for operation
   */
  private generateKey(name: string, metadata?: Record<string, any>): string {
    if (!metadata) return name;
    return `${name}_${JSON.stringify(metadata)}`;
  }

  /**
   * Get performance threshold for operation type
   */
  private getThreshold(name: string): number {
    const thresholds: Record<string, number> = {
      // API calls
      'api-call': 3000,
      'external-api': 5000,
      'flight-search': 5000,
      'hotel-search': 4000,

      // Database operations
      'db-query': 1000,
      'db-insert': 500,
      'db-update': 500,
      'db-delete': 500,

      // Cache operations
      'cache-get': 100,
      'cache-set': 100,

      // Page loads
      'page-load': 2000,
      'component-render': 100,

      // Default
      'default': 3000,
    };

    // Find matching threshold
    for (const [key, threshold] of Object.entries(thresholds)) {
      if (name.toLowerCase().includes(key)) {
        return threshold;
      }
    }

    return thresholds.default;
  }

  /**
   * Export metrics for monitoring dashboard
   */
  exportMetrics(): {
    timestamp: number;
    metrics: Record<string, MetricStats | null>;
  } {
    return {
      timestamp: Date.now(),
      metrics: this.getAllMetrics(),
    };
  }
}

/**
 * Singleton instance
 */
export const perfMonitor = new PerformanceMonitor();

/**
 * Utility function to track API call performance
 */
export async function trackAPIPerformance<T>(
  endpoint: string,
  method: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const metricName = `api-call-${method}-${endpoint}`;
  return perfMonitor.measureAsync(metricName, apiCall, { endpoint, method });
}

/**
 * Utility function to track database query performance
 */
export async function trackDatabaseQuery<T>(
  operation: string,
  query: () => Promise<T>
): Promise<T> {
  const metricName = `db-query-${operation}`;
  return perfMonitor.measureAsync(metricName, query, { operation });
}

/**
 * Utility function to track cache operations
 */
export async function trackCacheOperation<T>(
  operation: 'get' | 'set' | 'delete',
  key: string,
  cacheOp: () => Promise<T>
): Promise<T> {
  const metricName = `cache-${operation}`;
  return perfMonitor.measureAsync(metricName, cacheOp, { key });
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  totalOperations: number;
  slowOperations: Array<{ name: string; p95: number }>;
  avgResponseTime: number;
} {
  const allMetrics = perfMonitor.getAllMetrics();
  let totalOperations = 0;
  let totalAvg = 0;
  const slowOperations: Array<{ name: string; p95: number }> = [];

  for (const [name, stats] of Object.entries(allMetrics)) {
    if (stats) {
      totalOperations += stats.count;
      totalAvg += stats.avg;

      // Flag operations with high p95
      if (stats.p95 > 3000) {
        slowOperations.push({ name, p95: stats.p95 });
      }
    }
  }

  return {
    totalOperations,
    slowOperations: slowOperations.sort((a, b) => b.p95 - a.p95),
    avgResponseTime: totalOperations > 0 ? totalAvg / Object.keys(allMetrics).length : 0,
  };
}

/**
 * Timer utility for manual measurement
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;
  private metadata?: Record<string, any>;

  constructor(name: string, metadata?: Record<string, any>) {
    this.name = name;
    this.metadata = metadata;
    this.startTime = performance.now();
  }

  /**
   * End timer and return duration
   */
  end(): number {
    const duration = performance.now() - this.startTime;
    perfMonitor.storeMetric(this.name, duration);

    if (duration > perfMonitor['getThreshold'](this.name)) {
      console.warn(`[Performance] ${this.name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Get elapsed time without ending timer
   */
  getElapsed(): number {
    return performance.now() - this.startTime;
  }
}

/**
 * Create a performance timer
 */
export function createTimer(name: string, metadata?: Record<string, any>): PerformanceTimer {
  return new PerformanceTimer(name, metadata);
}
