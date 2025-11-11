/**
 * API Monitoring Middleware
 *
 * Tracks API request/response metrics including:
 * - Request count by endpoint
 * - Response times
 * - Error rates
 * - Status code distribution
 */

import { NextRequest, NextResponse } from 'next/server';
import { captureMessage } from './sentry';
import { perfMonitor } from './performance';

/**
 * In-memory metrics storage
 * In production, consider using Redis or a time-series database
 */
class MetricsStore {
  private requestCounts = new Map<string, number>();
  private errorCounts = new Map<string, number>();
  private statusCodes = new Map<string, Map<number, number>>();
  private responseTimes = new Map<string, number[]>();
  private lastReset = Date.now();
  private resetInterval = 3600000; // Reset every hour

  trackRequest(path: string): void {
    this.checkReset();
    this.requestCounts.set(path, (this.requestCounts.get(path) || 0) + 1);
  }

  trackError(path: string, statusCode: number): void {
    this.errorCounts.set(path, (this.errorCounts.get(path) || 0) + 1);
    this.trackStatusCode(path, statusCode);
  }

  trackStatusCode(path: string, statusCode: number): void {
    if (!this.statusCodes.has(path)) {
      this.statusCodes.set(path, new Map());
    }
    const pathCodes = this.statusCodes.get(path)!;
    pathCodes.set(statusCode, (pathCodes.get(statusCode) || 0) + 1);
  }

  trackResponseTime(path: string, duration: number): void {
    if (!this.responseTimes.has(path)) {
      this.responseTimes.set(path, []);
    }
    const times = this.responseTimes.get(path)!;
    times.push(duration);

    // Keep only last 1000 measurements
    if (times.length > 1000) {
      times.shift();
    }
  }

  getErrorRate(path: string): number {
    const requests = this.requestCounts.get(path) || 0;
    const errors = this.errorCounts.get(path) || 0;
    return requests > 0 ? errors / requests : 0;
  }

  getAvgResponseTime(path: string): number {
    const times = this.responseTimes.get(path) || [];
    if (times.length === 0) return 0;
    return times.reduce((sum, t) => sum + t, 0) / times.length;
  }

  getMetrics(path?: string): any {
    if (path) {
      return {
        requests: this.requestCounts.get(path) || 0,
        errors: this.errorCounts.get(path) || 0,
        errorRate: this.getErrorRate(path),
        avgResponseTime: this.getAvgResponseTime(path),
        statusCodes: Object.fromEntries(this.statusCodes.get(path) || new Map()),
      };
    }

    // Return all metrics
    const paths = Array.from(new Set([
      ...this.requestCounts.keys(),
      ...this.errorCounts.keys(),
    ]));

    return paths.map(p => ({
      path: p,
      ...this.getMetrics(p),
    }));
  }

  private checkReset(): void {
    const now = Date.now();
    if (now - this.lastReset > this.resetInterval) {
      this.reset();
    }
  }

  reset(): void {
    this.requestCounts.clear();
    this.errorCounts.clear();
    this.statusCodes.clear();
    this.responseTimes.clear();
    this.lastReset = Date.now();
  }

  exportMetrics() {
    return {
      timestamp: Date.now(),
      resetInterval: this.resetInterval,
      lastReset: this.lastReset,
      totalRequests: Array.from(this.requestCounts.values()).reduce((sum, c) => sum + c, 0),
      totalErrors: Array.from(this.errorCounts.values()).reduce((sum, c) => sum + c, 0),
      endpoints: this.getMetrics(),
    };
  }
}

export const metricsStore = new MetricsStore();

/**
 * Monitoring middleware for API routes
 */
export async function monitoringMiddleware(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Track request
  metricsStore.trackRequest(path);

  // Start performance tracking
  perfMonitor.startMeasure(`api-${method}-${path}`, { method, path });

  // Continue with request
  const response = NextResponse.next();

  // Track response time
  const duration = performance.now() - startTime;
  perfMonitor.endMeasure(`api-${method}-${path}`, { method, path });
  metricsStore.trackResponseTime(path, duration);

  // Add response time header
  response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  response.headers.set('X-Request-ID', crypto.randomUUID());

  // Track status code
  metricsStore.trackStatusCode(path, response.status);

  // Track errors
  if (response.status >= 400) {
    metricsStore.trackError(path, response.status);

    // Alert on high error rate
    const errorRate = metricsStore.getErrorRate(path);
    if (errorRate > 0.05) { // 5% error rate threshold
      captureMessage(
        `High error rate on ${path}`,
        'error',
        {
          path,
          errorRate: (errorRate * 100).toFixed(1) + '%',
          statusCode: response.status,
        }
      );
    }
  }

  // Alert on slow responses
  if (duration > 5000) {
    captureMessage(
      `Slow API response: ${method} ${path}`,
      'warning',
      { duration, method, path }
    );
  }

  return response;
}

/**
 * Rate limiting tracker
 */
class RateLimiter {
  private requests = new Map<string, number[]>();
  private limits = {
    perMinute: 60,
    perHour: 1000,
    perDay: 10000,
  };

  isRateLimited(identifier: string): {
    limited: boolean;
    limit?: string;
    retryAfter?: number;
  } {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Clean old requests
    const recentRequests = requests.filter(time => now - time < 86400000); // Last 24 hours
    this.requests.set(identifier, recentRequests);

    // Check limits
    const lastMinute = recentRequests.filter(time => now - time < 60000).length;
    const lastHour = recentRequests.filter(time => now - time < 3600000).length;
    const lastDay = recentRequests.length;

    if (lastMinute >= this.limits.perMinute) {
      return { limited: true, limit: 'per-minute', retryAfter: 60 };
    }

    if (lastHour >= this.limits.perHour) {
      return { limited: true, limit: 'per-hour', retryAfter: 3600 };
    }

    if (lastDay >= this.limits.perDay) {
      return { limited: true, limit: 'per-day', retryAfter: 86400 };
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return { limited: false };
  }

  getRequestCount(identifier: string, window: 'minute' | 'hour' | 'day'): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    const windowMs = {
      minute: 60000,
      hour: 3600000,
      day: 86400000,
    }[window];

    return requests.filter(time => now - time < windowMs).length;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Alert manager for monitoring events
 */
export class AlertManager {
  private alerts: Array<{
    id: string;
    timestamp: number;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    data?: any;
  }> = [];

  private maxAlerts = 1000;

  addAlert(
    level: 'info' | 'warning' | 'error' | 'critical',
    message: string,
    data?: any
  ): void {
    const alert = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.shift();
    }

    // Log based on severity
    const logFn = {
      info: console.log,
      warning: console.warn,
      error: console.error,
      critical: console.error,
    }[level];

    logFn(`[Alert ${level.toUpperCase()}]`, message, data || '');

    // Send critical alerts to monitoring
    if (level === 'critical' || level === 'error') {
      captureMessage(message, level === 'critical' ? 'error' : 'warning', data);
    }
  }

  getAlerts(level?: string, since?: number) {
    let filtered = this.alerts;

    if (level) {
      filtered = filtered.filter(a => a.level === level);
    }

    if (since) {
      filtered = filtered.filter(a => a.timestamp >= since);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}

export const alertManager = new AlertManager();

/**
 * Health check status tracker
 */
export class HealthChecker {
  private services = new Map<string, {
    healthy: boolean;
    lastCheck: number;
    lastError?: string;
    responseTime?: number;
  }>();

  updateServiceHealth(
    service: string,
    healthy: boolean,
    responseTime?: number,
    error?: string
  ): void {
    this.services.set(service, {
      healthy,
      lastCheck: Date.now(),
      lastError: error,
      responseTime,
    });

    if (!healthy) {
      alertManager.addAlert(
        'error',
        `Service unhealthy: ${service}`,
        { service, error }
      );
    }
  }

  getServiceHealth(service: string) {
    return this.services.get(service);
  }

  getAllHealth() {
    const services = Object.fromEntries(this.services);
    const healthy = Array.from(this.services.values()).every(s => s.healthy);

    return {
      status: healthy ? 'healthy' : 'degraded',
      services,
      timestamp: Date.now(),
    };
  }

  isHealthy(): boolean {
    return Array.from(this.services.values()).every(s => s.healthy);
  }
}

export const healthChecker = new HealthChecker();
