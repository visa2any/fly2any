/**
 * Metrics Dashboard API
 *
 * Provides comprehensive metrics data for the monitoring dashboard.
 * Includes performance metrics, error rates, health status, and alerts.
 */

import { NextResponse } from 'next/server';
import { metricsStore, healthChecker, alertManager as middlewareAlertManager } from '@/lib/monitoring/middleware';
import { perfMonitor, getPerformanceSummary } from '@/lib/monitoring/performance';
import { alertManager } from '@/lib/monitoring/alerts';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/metrics
 *
 * Returns comprehensive metrics for monitoring dashboard
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'summary', 'detailed', 'performance', 'alerts'

    // Return specific metric type if requested
    if (type === 'performance') {
      return NextResponse.json(getPerformanceMetrics());
    }

    if (type === 'alerts') {
      return NextResponse.json(getAlertMetrics());
    }

    if (type === 'health') {
      return NextResponse.json(healthChecker.getAllHealth());
    }

    // Return summary or detailed metrics
    const detailed = type === 'detailed';
    const metrics = await getAllMetrics(detailed);

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[Metrics API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/metrics/reset
 *
 * Reset metrics (development only)
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Metrics reset only available in development' },
      { status: 403 }
    );
  }

  try {
    const { action } = await request.json();

    if (action === 'reset') {
      metricsStore.reset();
      perfMonitor.clearMetrics();

      return NextResponse.json({
        success: true,
        message: 'Metrics reset successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to reset metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get all metrics
 */
async function getAllMetrics(detailed: boolean = false) {
  const now = Date.now();
  const apiMetrics = metricsStore.exportMetrics();
  const perfMetrics = perfMonitor.exportMetrics();
  const performanceSummary = getPerformanceSummary();
  const health = healthChecker.getAllHealth();

  return {
    timestamp: now,
    uptime: process.uptime ? process.uptime() : 0,
    environment: process.env.NODE_ENV || 'unknown',

    // Request metrics
    requests: {
      total: apiMetrics.totalRequests,
      totalErrors: apiMetrics.totalErrors,
      errorRate: apiMetrics.totalRequests > 0
        ? ((apiMetrics.totalErrors / apiMetrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      byEndpoint: detailed ? getRequestsByEndpoint() : undefined,
    },

    // Performance metrics
    performance: {
      totalOperations: performanceSummary.totalOperations,
      avgResponseTime: Math.round(performanceSummary.avgResponseTime),
      slowOperations: performanceSummary.slowOperations.slice(0, 10),
      metrics: detailed ? perfMetrics.metrics : undefined,
    },

    // Error tracking
    errors: {
      total: apiMetrics.totalErrors,
      rate: apiMetrics.totalRequests > 0
        ? ((apiMetrics.totalErrors / apiMetrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      byEndpoint: getErrorsByEndpoint(),
    },

    // Health status
    health: {
      status: health.status,
      services: health.services,
      lastCheck: health.timestamp,
    },

    // External APIs
    external: getExternalAPIMetrics(),

    // System resources
    system: getSystemMetrics(),

    // Recent alerts
    alerts: {
      recent: alertManager.getAlertHistory({ limit: 10 }),
      critical: alertManager.getAlertHistory({ severity: 'critical', limit: 5 }),
      summary: getAlertSummary(),
    },
  };
}

/**
 * Get performance-specific metrics
 */
function getPerformanceMetrics() {
  const perfMetrics = perfMonitor.exportMetrics();
  const summary = getPerformanceSummary();

  return {
    timestamp: perfMetrics.timestamp,
    summary: {
      totalOperations: summary.totalOperations,
      avgResponseTime: Math.round(summary.avgResponseTime),
      slowestOperations: summary.slowOperations.slice(0, 20),
    },
    metrics: perfMetrics.metrics,
    byCategory: categorizePerformanceMetrics(perfMetrics.metrics),
  };
}

/**
 * Categorize performance metrics by type
 */
function categorizePerformanceMetrics(metrics: Record<string, any>) {
  const categories = {
    api: {} as Record<string, any>,
    database: {} as Record<string, any>,
    cache: {} as Record<string, any>,
    external: {} as Record<string, any>,
    other: {} as Record<string, any>,
  };

  for (const [name, stats] of Object.entries(metrics)) {
    if (name.includes('api-call')) {
      categories.api[name] = stats;
    } else if (name.includes('db-')) {
      categories.database[name] = stats;
    } else if (name.includes('cache-')) {
      categories.cache[name] = stats;
    } else if (name.includes('external')) {
      categories.external[name] = stats;
    } else {
      categories.other[name] = stats;
    }
  }

  return categories;
}

/**
 * Get alert-specific metrics
 */
function getAlertMetrics() {
  return {
    timestamp: Date.now(),
    history: alertManager.getAlertHistory({ limit: 100 }),
    bySeverity: {
      critical: alertManager.getAlertHistory({ severity: 'critical' }).length,
      high: alertManager.getAlertHistory({ severity: 'high' }).length,
      medium: alertManager.getAlertHistory({ severity: 'medium' }).length,
      low: alertManager.getAlertHistory({ severity: 'low' }).length,
    },
    rules: alertManager.getRules().map(rule => ({
      id: rule.id,
      name: rule.name,
      severity: rule.severity,
      enabled: rule.enabled,
      status: alertManager.getRuleStatus(rule.id),
    })),
    recent: alertManager.getAlertHistory({ limit: 20 }),
  };
}

/**
 * Get requests by endpoint
 */
function getRequestsByEndpoint() {
  const apiMetrics = metricsStore.exportMetrics();
  const endpoints = apiMetrics.endpoints as any[];

  return endpoints
    .map(e => ({
      path: e.path,
      requests: e.requests,
      errors: e.errors,
      errorRate: ((e.errors / (e.requests || 1)) * 100).toFixed(1) + '%',
      avgResponseTime: Math.round(e.avgResponseTime || 0),
    }))
    .sort((a, b) => b.requests - a.requests);
}

/**
 * Get errors by endpoint
 */
function getErrorsByEndpoint() {
  const apiMetrics = metricsStore.exportMetrics();
  const endpoints = apiMetrics.endpoints as any[];

  return endpoints
    .filter(e => e.errors > 0)
    .map(e => ({
      path: e.path,
      errors: e.errors,
      errorRate: ((e.errors / (e.requests || 1)) * 100).toFixed(1) + '%',
      statusCodes: e.statusCodes,
    }))
    .sort((a, b) => b.errors - a.errors);
}

/**
 * Get external API metrics
 */
function getExternalAPIMetrics() {
  const health = healthChecker.getAllHealth();
  const services = health.services as Record<string, any>;

  return {
    duffel: {
      healthy: services.duffel?.healthy ?? null,
      responseTime: services.duffel?.responseTime ?? null,
      lastCheck: services.duffel?.lastCheck ?? null,
      lastError: services.duffel?.lastError,
    },
    amadeus: {
      healthy: services.amadeus?.healthy ?? null,
      responseTime: services.amadeus?.responseTime ?? null,
      lastCheck: services.amadeus?.lastCheck ?? null,
      lastError: services.amadeus?.lastError,
    },
    stripe: {
      healthy: services.stripe?.healthy ?? null,
      responseTime: services.stripe?.responseTime ?? null,
      lastCheck: services.stripe?.lastCheck ?? null,
      lastError: services.stripe?.lastError,
    },
  };
}

/**
 * Get system resource metrics
 */
function getSystemMetrics() {
  const memory = process.memoryUsage();

  return {
    memory: {
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      external: `${Math.round(memory.external / 1024 / 1024)} MB`,
      percentage: `${((memory.heapUsed / memory.heapTotal) * 100).toFixed(1)}%`,
    },
    nodejs: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    uptime: {
      seconds: process.uptime ? process.uptime() : 0,
      formatted: formatUptime(process.uptime ? process.uptime() : 0),
    },
  };
}

/**
 * Get alert summary
 */
function getAlertSummary() {
  const last24h = Date.now() - 86400000;
  const recent = alertManager.getAlertHistory({ since: last24h });

  return {
    last24h: recent.length,
    bySeverity: {
      critical: recent.filter(a => a.severity === 'critical').length,
      high: recent.filter(a => a.severity === 'high').length,
      medium: recent.filter(a => a.severity === 'medium').length,
      low: recent.filter(a => a.severity === 'low').length,
    },
    topAlerts: getTopAlerts(recent),
  };
}

/**
 * Get top firing alerts
 */
function getTopAlerts(alerts: any[]) {
  const alertCounts = new Map<string, number>();

  for (const alert of alerts) {
    alertCounts.set(alert.ruleName, (alertCounts.get(alert.ruleName) || 0) + 1);
  }

  return Array.from(alertCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}
