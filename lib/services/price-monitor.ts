/**
 * Price Monitor Service
 * Automated background job system for monitoring flight prices and triggering alerts
 */

import { getPrismaClient } from '@/lib/prisma';
import { emailService } from '@/lib/email/service';
import { PriceAlert } from '@/lib/types/price-alerts';
import { recordPriceHistory } from './price-history';

// Types
export interface MonitoringSummary {
  totalChecked: number;
  totalTriggered: number;
  totalFailed: number;
  errors: Array<{
    alertId: string;
    error: string;
  }>;
  duration: number;
}

export interface PriceCheckResult {
  success: boolean;
  currentPrice?: number;
  currency?: string;
  error?: string;
}

// Configuration
const MAX_CONCURRENT_CHECKS = 5;
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRY_ATTEMPTS = 3;
const PRICE_CACHE_TTL = 3600000; // 1 hour in milliseconds

// In-memory cache for price checks (to avoid redundant API calls)
const priceCache = new Map<string, { price: number; currency: string; timestamp: number }>();

/**
 * Main function: Monitor all active price alerts
 * Called by cron job or manual trigger
 */
export async function monitorAllActiveAlerts(triggeredBy: 'cron' | 'manual' = 'cron'): Promise<MonitoringSummary> {
  const startTime = Date.now();
  const summary: MonitoringSummary = {
    totalChecked: 0,
    totalTriggered: 0,
    totalFailed: 0,
    errors: [],
    duration: 0,
  };

  console.log(`[Price Monitor] Starting monitoring (triggered by: ${triggeredBy})`);

  try {
    const prisma = getPrismaClient();
    // Fetch all active alerts that haven't been triggered
    const activeAlerts = await prisma.priceAlert.findMany({
      where: {
        active: true,
        triggered: false,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            preferences: {
              select: {
                priceAlertEmails: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastChecked: 'asc', // Check least recently checked first
      },
    });

    console.log(`[Price Monitor] Found ${activeAlerts.length} active alerts to check`);

    if (activeAlerts.length === 0) {
      console.log('[Price Monitor] No active alerts to check');
      const endTime = Date.now();
      summary.duration = endTime - startTime;

      // Log execution to database
      await logExecution(summary, triggeredBy);

      return summary;
    }

    // Process alerts in batches to respect rate limits
    const batches = chunkArray(activeAlerts, MAX_CONCURRENT_CHECKS);

    for (const batch of batches) {
      const results = await Promise.allSettled(
        batch.map(alert => checkSingleAlert(alert.id))
      );

      results.forEach((result, index) => {
        const alert = batch[index];
        summary.totalChecked++;

        if (result.status === 'fulfilled') {
          if (result.value.triggered) {
            summary.totalTriggered++;
          }
        } else {
          summary.totalFailed++;
          summary.errors.push({
            alertId: alert.id,
            error: result.reason?.message || 'Unknown error',
          });
          console.error(`[Price Monitor] Failed to check alert ${alert.id}:`, result.reason);
        }
      });

      // Add small delay between batches to respect rate limits
      if (batches.length > 1) {
        await sleep(1000);
      }
    }

    const endTime = Date.now();
    summary.duration = endTime - startTime;

    console.log(`[Price Monitor] Completed in ${summary.duration}ms`);
    console.log(`[Price Monitor] Checked: ${summary.totalChecked}, Triggered: ${summary.totalTriggered}, Failed: ${summary.totalFailed}`);

    // Log execution to database
    await logExecution(summary, triggeredBy);

    return summary;
  } catch (error) {
    console.error('[Price Monitor] Fatal error:', error);
    const endTime = Date.now();
    summary.duration = endTime - startTime;
    summary.errors.push({
      alertId: 'system',
      error: error instanceof Error ? error.message : 'Unknown system error',
    });

    // Try to log the failed execution
    try {
      await logExecution(summary, triggeredBy);
    } catch (logError) {
      console.error('[Price Monitor] Failed to log execution:', logError);
    }

    throw error;
  }
}

/**
 * Check a single price alert
 */
export async function checkSingleAlert(alertId: string): Promise<{
  success: boolean;
  triggered: boolean;
  currentPrice?: number;
  error?: string;
}> {
  try {
    const prisma = getPrismaClient();
    // Fetch alert with user info
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            preferences: {
              select: {
                priceAlertEmails: true,
              },
            },
          },
        },
      },
    });

    if (!alert) {
      return { success: false, triggered: false, error: 'Alert not found' };
    }

    if (!alert.active || alert.triggered) {
      return { success: false, triggered: false, error: 'Alert not active or already triggered' };
    }

    // Check if user has price alert emails enabled
    const emailsEnabled = alert.user.preferences?.priceAlertEmails !== false;

    // Get current price for the route
    const priceResult = await getPriceForRoute({
      origin: alert.origin,
      destination: alert.destination,
      departDate: alert.departDate,
      returnDate: alert.returnDate || undefined,
      currency: alert.currency,
    });

    if (!priceResult.success || !priceResult.currentPrice) {
      // Update lastChecked even on failure
      await prisma.priceAlert.update({
        where: { id: alertId },
        data: { lastChecked: new Date() },
      });

      return {
        success: false,
        triggered: false,
        error: priceResult.error || 'Failed to fetch price',
      };
    }

    const currentPrice = priceResult.currentPrice;

    // Record price in history
    await recordPriceHistory({
      origin: alert.origin,
      destination: alert.destination,
      departDate: alert.departDate,
      returnDate: alert.returnDate || undefined,
      price: currentPrice,
      currency: alert.currency,
      provider: 'mock', // Update when real API is integrated
    });

    // Check if price has reached target
    const priceReachedTarget = currentPrice <= alert.targetPrice;

    if (priceReachedTarget) {
      console.log(`[Price Monitor] Price alert triggered! ${alert.origin} → ${alert.destination}: ${alert.currency} ${currentPrice} (target: ${alert.targetPrice})`);

      // Update alert as triggered
      await prisma.priceAlert.update({
        where: { id: alertId },
        data: {
          triggered: true,
          triggeredAt: new Date(),
          currentPrice: currentPrice,
          lastChecked: new Date(),
          lastNotifiedAt: new Date(),
          notificationCount: { increment: 1 },
        },
      });

      // Send email notification if enabled
      if (emailsEnabled) {
        try {
          await notifyUserPriceAlert(alert, currentPrice);
          console.log(`[Price Monitor] Email notification sent to ${alert.user.email}`);
        } catch (emailError) {
          console.error('[Price Monitor] Failed to send email notification:', emailError);
          // Don't fail the entire check if email fails
        }
      } else {
        console.log(`[Price Monitor] Email notifications disabled for user ${alert.user.email}`);
      }

      return { success: true, triggered: true, currentPrice };
    } else {
      // Price hasn't reached target, just update the current price
      await prisma.priceAlert.update({
        where: { id: alertId },
        data: {
          currentPrice: currentPrice,
          lastChecked: new Date(),
        },
      });

      console.log(`[Price Monitor] Price not reached: ${alert.origin} → ${alert.destination}: ${alert.currency} ${currentPrice} (target: ${alert.targetPrice})`);

      return { success: true, triggered: false, currentPrice };
    }
  } catch (error) {
    console.error(`[Price Monitor] Error checking alert ${alertId}:`, error);
    return {
      success: false,
      triggered: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get current price for a route
 * Implements caching and mock data fallback
 */
export async function getPriceForRoute(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  currency?: string;
}): Promise<PriceCheckResult> {
  const cacheKey = `${params.origin}-${params.destination}-${params.departDate}-${params.returnDate || 'oneway'}`;

  // Check cache first
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL) {
    console.log(`[Price Monitor] Using cached price for ${cacheKey}`);
    return {
      success: true,
      currentPrice: cached.price,
      currency: cached.currency,
    };
  }

  try {
    // TODO: Integrate with real Duffel/Amadeus APIs
    // For now, return mock data with some price variation
    const mockPrice = await getMockPrice(params);

    // Cache the result
    priceCache.set(cacheKey, {
      price: mockPrice,
      currency: params.currency || 'USD',
      timestamp: Date.now(),
    });

    return {
      success: true,
      currentPrice: mockPrice,
      currency: params.currency || 'USD',
    };
  } catch (error) {
    console.error('[Price Monitor] Error fetching price:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch price',
    };
  }
}

/**
 * Mock price generator (simulates price fluctuations)
 * Replace this with real API integration
 */
async function getMockPrice(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
}): Promise<number> {
  // Simulate API delay
  await sleep(200 + Math.random() * 300);

  // Generate deterministic but variable price based on route
  const routeHash = hashString(`${params.origin}${params.destination}${params.departDate}`);
  const basePrice = 300 + (routeHash % 700); // Base price between 300-1000

  // Add some random variation (±10%)
  const variation = basePrice * 0.1 * (Math.random() - 0.5) * 2;
  const finalPrice = Math.round((basePrice + variation) * 100) / 100;

  return finalPrice;
}

/**
 * Send price alert notification email
 */
export async function notifyUserPriceAlert(
  alert: PriceAlert & { user: { email: string; name: string | null } },
  newPrice: number
): Promise<void> {
  try {
    await emailService.sendPriceAlert(alert.user.email, {
      origin: alert.origin,
      destination: alert.destination,
      departDate: alert.departDate,
      returnDate: alert.returnDate,
      currentPrice: newPrice,
      targetPrice: alert.targetPrice,
      currency: alert.currency,
    });
  } catch (error) {
    console.error('[Price Monitor] Error sending price alert email:', error);
    throw error;
  }
}

/**
 * Log execution to database
 */
async function logExecution(summary: MonitoringSummary, triggeredBy: 'cron' | 'manual'): Promise<void> {
  try {
    const prisma = getPrismaClient();
    await prisma.priceMonitorLog.create({
      data: {
        executionTime: new Date(),
        alertsChecked: summary.totalChecked,
        alertsTriggered: summary.totalTriggered,
        alertsFailed: summary.totalFailed,
        errors: (summary.errors.length > 0 ? summary.errors : null) as any,
        duration: summary.duration,
        triggeredBy,
      },
    });
  } catch (error) {
    console.error('[Price Monitor] Failed to log execution:', error);
    // Don't throw - logging failure shouldn't break the monitoring
  }
}

/**
 * Get monitoring statistics
 */
export async function getMonitoringStats(): Promise<{
  totalActiveAlerts: number;
  lastRun: Date | null;
  lastRunStats: {
    alertsChecked: number;
    alertsTriggered: number;
    alertsFailed: number;
    duration: number;
  } | null;
  successRate: number;
  recentErrors: number;
}> {
  try {
    const prisma = getPrismaClient();
    // Get total active alerts
    const totalActiveAlerts = await prisma.priceAlert.count({
      where: {
        active: true,
        triggered: false,
      },
    });

    // Get last execution log
    const lastLog = await prisma.priceMonitorLog.findFirst({
      orderBy: { executionTime: 'desc' },
    });

    // Calculate success rate from last 10 runs
    const recentLogs = await prisma.priceMonitorLog.findMany({
      take: 10,
      orderBy: { executionTime: 'desc' },
    });

    const totalChecked = recentLogs.reduce((sum, log) => sum + log.alertsChecked, 0);
    const totalFailed = recentLogs.reduce((sum, log) => sum + log.alertsFailed, 0);
    const successRate = totalChecked > 0 ? ((totalChecked - totalFailed) / totalChecked) * 100 : 100;

    // Count recent errors (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentErrorLogs = await prisma.priceMonitorLog.findMany({
      where: {
        executionTime: { gte: oneDayAgo },
        alertsFailed: { gt: 0 },
      },
    });
    const recentErrors = recentErrorLogs.reduce((sum, log) => sum + log.alertsFailed, 0);

    return {
      totalActiveAlerts,
      lastRun: lastLog?.executionTime || null,
      lastRunStats: lastLog
        ? {
            alertsChecked: lastLog.alertsChecked,
            alertsTriggered: lastLog.alertsTriggered,
            alertsFailed: lastLog.alertsFailed,
            duration: lastLog.duration,
          }
        : null,
      successRate: Math.round(successRate * 100) / 100,
      recentErrors,
    };
  } catch (error) {
    console.error('[Price Monitor] Error getting stats:', error);
    throw error;
  }
}

/**
 * Get execution logs with pagination
 */
export async function getExecutionLogs(params: {
  limit?: number;
  offset?: number;
}): Promise<{
  logs: Array<{
    id: string;
    executionTime: Date;
    alertsChecked: number;
    alertsTriggered: number;
    alertsFailed: number;
    duration: number;
    triggeredBy: string;
    errors: any;
  }>;
  total: number;
}> {
  const limit = params.limit || 20;
  const offset = params.offset || 0;

  try {
    const prisma = getPrismaClient();
    const [logs, total] = await Promise.all([
      prisma.priceMonitorLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { executionTime: 'desc' },
      }),
      prisma.priceMonitorLog.count(),
    ]);

    return { logs, total };
  } catch (error) {
    console.error('[Price Monitor] Error getting logs:', error);
    throw error;
  }
}

// Utility functions
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
