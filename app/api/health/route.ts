/**
 * Health Check Endpoint
 *
 * Provides system health status for monitoring and load balancers.
 * Checks all critical services and dependencies.
 */

import { NextResponse } from 'next/server';
import { checkRedisHealth } from '@/lib/cache/redis';
import { prisma, isPrismaAvailable } from '@/lib/prisma';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: ServiceHealth;
    redis: ServiceHealth;
    externalAPIs: {
      duffel: ServiceHealth;
      amadeus: ServiceHealth;
      stripe: ServiceHealth;
    };
    system: {
      memory: MemoryHealth;
      nodejs: string;
      environment: string;
    };
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

interface MemoryHealth {
  used: string;
  total: string;
  percentage: string;
}

/**
 * Check database connection
 */
async function checkDatabaseConnection(): Promise<ServiceHealth> {
  const startTime = performance.now();

  try {
    if (!isPrismaAvailable() || !prisma) {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: 'Database not configured',
      };
    }

    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = performance.now() - startTime;

    return {
      status: 'healthy',
      responseTime: Math.round(responseTime),
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Redis connection
 */
async function checkRedisConnection(): Promise<ServiceHealth> {
  const startTime = performance.now();

  try {
    const isHealthy = await checkRedisHealth();
    const responseTime = performance.now() - startTime;

    if (isHealthy) {
      return {
        status: 'healthy',
        responseTime: Math.round(responseTime),
        lastCheck: new Date().toISOString(),
      };
    } else {
      return {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: 'Redis ping failed',
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check external API availability (lightweight ping)
 */
async function checkExternalAPI(
  name: string,
  url: string,
  timeout: number = 5000
): Promise<ServiceHealth> {
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = performance.now() - startTime;

    if (response.ok || response.status === 401 || response.status === 403) {
      // 401/403 means the API is reachable but requires auth (which is fine)
      return {
        status: 'healthy',
        responseTime: Math.round(responseTime),
        lastCheck: new Date().toISOString(),
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime: Math.round(responseTime),
        lastCheck: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get system memory information
 */
function getMemoryHealth(): MemoryHealth {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const percentage = ((usage.heapUsed / usage.heapTotal) * 100).toFixed(1);

    return {
      used: `${usedMB} MB`,
      total: `${totalMB} MB`,
      percentage: `${percentage}%`,
    };
  }

  return {
    used: 'N/A',
    total: 'N/A',
    percentage: 'N/A',
  };
}

/**
 * GET /api/health
 *
 * Returns comprehensive health status
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Run health checks in parallel
    const [database, redis, duffel, amadeus, stripe] = await Promise.all([
      checkDatabaseConnection(),
      checkRedisConnection(),
      checkExternalAPI('Duffel', 'https://api.duffel.com'),
      checkExternalAPI('Amadeus', 'https://api.amadeus.com'),
      checkExternalAPI('Stripe', 'https://api.stripe.com'),
    ]);

    // Determine overall health status
    const criticalServices = [database, redis];
    const allServices = [database, redis, duffel, amadeus, stripe];

    const criticalUnhealthy = criticalServices.some(s => s.status === 'unhealthy');
    const anyUnhealthy = allServices.some(s => s.status === 'unhealthy');

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (criticalUnhealthy) {
      status = 'unhealthy';
    } else if (anyUnhealthy) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    // Build health check result
    const result: HealthCheckResult = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? process.uptime() : 0,
      checks: {
        database,
        redis,
        externalAPIs: {
          duffel,
          amadeus,
          stripe,
        },
        system: {
          memory: getMemoryHealth(),
          nodejs: process.version || 'unknown',
          environment: process.env.NODE_ENV || 'unknown',
        },
      },
    };

    // Return appropriate status code
    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 207 : 503;

    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });
  } catch (error) {
    console.error('[Health Check] Error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

/**
 * HEAD /api/health
 *
 * Lightweight health check for load balancers
 */
export async function HEAD() {
  try {
    if (isPrismaAvailable() && prisma) {
      // Quick check - just verify database is accessible
      await prisma.$queryRaw`SELECT 1`;
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
