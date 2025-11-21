/**
 * Price History Service
 * Tracks flight price changes over time for analysis and trending
 */

import { getPrismaClient } from '@/lib/prisma';

export interface PriceHistoryRecord {
  id: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string | null;
  price: number;
  currency: string;
  provider: string;
  timestamp: Date;
}

export interface PriceHistoryParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  price: number;
  currency: string;
  provider: string;
}

export interface PriceTrendData {
  route: string;
  prices: Array<{
    price: number;
    timestamp: Date;
  }>;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Record a price snapshot in history
 */
export async function recordPriceHistory(params: PriceHistoryParams): Promise<PriceHistoryRecord> {
  try {
    const prisma = getPrismaClient();
    const record = await prisma!.priceHistory.create({
      data: {
        origin: params.origin,
        destination: params.destination,
        departDate: params.departDate,
        returnDate: params.returnDate || null,
        price: params.price,
        currency: params.currency,
        provider: params.provider,
        timestamp: new Date(),
      },
    });

    console.log(
      `[Price History] Recorded: ${params.origin} → ${params.destination} at ${params.currency} ${params.price}`
    );

    return record;
  } catch (error) {
    console.error('[Price History] Error recording price:', error);
    throw error;
  }
}

/**
 * Get price history for a specific route
 */
export async function getPriceHistory(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  limit?: number;
  daysBack?: number;
}): Promise<PriceHistoryRecord[]> {
  const limit = params.limit || 100;
  const daysBack = params.daysBack || 30;
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  try {
    const prisma = getPrismaClient();
    const history = await prisma!.priceHistory.findMany({
      where: {
        origin: params.origin,
        destination: params.destination,
        departDate: params.departDate,
        returnDate: params.returnDate || null,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return history;
  } catch (error) {
    console.error('[Price History] Error fetching history:', error);
    throw error;
  }
}

/**
 * Get price trend analysis for a route
 */
export async function getPriceTrend(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  daysBack?: number;
}): Promise<PriceTrendData | null> {
  try {
    const history = await getPriceHistory(params);

    if (history.length === 0) {
      return null;
    }

    // Calculate statistics
    const prices = history.map(h => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Determine trend (compare first half vs second half)
    const midPoint = Math.floor(history.length / 2);
    const recentPrices = history.slice(0, midPoint).map(h => h.price);
    const olderPrices = history.slice(midPoint).map(h => h.price);

    const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((sum, p) => sum + p, 0) / olderPrices.length;

    let trend: 'increasing' | 'decreasing' | 'stable';
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (changePercent > 5) {
      trend = 'increasing';
    } else if (changePercent < -5) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      route: `${params.origin} → ${params.destination}`,
      prices: history.map(h => ({
        price: h.price,
        timestamp: h.timestamp,
      })),
      minPrice: Math.round(minPrice * 100) / 100,
      maxPrice: Math.round(maxPrice * 100) / 100,
      avgPrice: Math.round(avgPrice * 100) / 100,
      trend,
    };
  } catch (error) {
    console.error('[Price History] Error calculating trend:', error);
    throw error;
  }
}

/**
 * Get price statistics for multiple routes
 */
export async function getRouteStatistics(params: {
  routes: Array<{
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
  }>;
  daysBack?: number;
}): Promise<
  Array<{
    route: string;
    origin: string;
    destination: string;
    currentPrice: number | null;
    minPrice: number | null;
    maxPrice: number | null;
    avgPrice: number | null;
    dataPoints: number;
  }>
> {
  const daysBack = params.daysBack || 30;
  const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  try {
    const prisma = getPrismaClient();
    const results = await Promise.all(
      params.routes.map(async route => {
        const history = await prisma!.priceHistory.findMany({
          where: {
            origin: route.origin,
            destination: route.destination,
            departDate: route.departDate,
            returnDate: route.returnDate || null,
            timestamp: { gte: startDate },
          },
          orderBy: { timestamp: 'desc' },
        });

        if (history.length === 0) {
          return {
            route: `${route.origin} → ${route.destination}`,
            origin: route.origin,
            destination: route.destination,
            currentPrice: null,
            minPrice: null,
            maxPrice: null,
            avgPrice: null,
            dataPoints: 0,
          };
        }

        const prices = history.map(h => h.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

        return {
          route: `${route.origin} → ${route.destination}`,
          origin: route.origin,
          destination: route.destination,
          currentPrice: history[0].price,
          minPrice: Math.round(minPrice * 100) / 100,
          maxPrice: Math.round(maxPrice * 100) / 100,
          avgPrice: Math.round(avgPrice * 100) / 100,
          dataPoints: history.length,
        };
      })
    );

    return results;
  } catch (error) {
    console.error('[Price History] Error getting route statistics:', error);
    throw error;
  }
}

/**
 * Clean up old price history records (keep only last N days)
 */
export async function cleanupOldHistory(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  try {
    const prisma = getPrismaClient();
    const result = await prisma!.priceHistory.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });

    console.log(`[Price History] Cleaned up ${result.count} old records`);
    return result.count;
  } catch (error) {
    console.error('[Price History] Error cleaning up history:', error);
    throw error;
  }
}

/**
 * Get price history summary statistics
 */
export async function getHistorySummary(): Promise<{
  totalRecords: number;
  uniqueRoutes: number;
  oldestRecord: Date | null;
  newestRecord: Date | null;
  averageChecksPerDay: number;
}> {
  try {
    const prisma = getPrismaClient();
    const [totalRecords, oldestRecord, newestRecord] = await Promise.all([
      prisma.priceHistory.count(),
      prisma.priceHistory.findFirst({
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true },
      }),
      prisma.priceHistory.findFirst({
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      }),
    ]);

    // Get unique routes
    const uniqueRoutes = await prisma!.priceHistory.groupBy({
      by: ['origin', 'destination', 'departDate'],
    });

    // Calculate average checks per day
    let averageChecksPerDay = 0;
    if (oldestRecord && newestRecord) {
      const daysDiff =
        (newestRecord.timestamp.getTime() - oldestRecord.timestamp.getTime()) /
        (1000 * 60 * 60 * 24);
      averageChecksPerDay = daysDiff > 0 ? totalRecords / daysDiff : 0;
    }

    return {
      totalRecords,
      uniqueRoutes: uniqueRoutes.length,
      oldestRecord: oldestRecord?.timestamp || null,
      newestRecord: newestRecord?.timestamp || null,
      averageChecksPerDay: Math.round(averageChecksPerDay * 100) / 100,
    };
  } catch (error) {
    console.error('[Price History] Error getting summary:', error);
    throw error;
  }
}

/**
 * Export price history to CSV format
 */
export function exportToCsv(history: PriceHistoryRecord[]): string {
  if (history.length === 0) {
    return 'No data available';
  }

  const headers = ['Timestamp', 'Origin', 'Destination', 'Depart Date', 'Return Date', 'Price', 'Currency', 'Provider'];
  const rows = history.map(record => [
    record.timestamp.toISOString(),
    record.origin,
    record.destination,
    record.departDate,
    record.returnDate || '',
    record.price.toString(),
    record.currency,
    record.provider,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}
