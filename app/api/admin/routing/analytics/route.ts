export const dynamic = 'force-dynamic';

/**
 * Admin Routing Analytics API
 *
 * GET /api/admin/routing/analytics
 * Returns routing statistics and profit analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { headers } from 'next/headers';

// Simple admin auth check
async function isAdmin(): Promise<boolean> {
  const headersList = headers();
  const adminKey = headersList.get('x-admin-key');
  return adminKey === process.env.ADMIN_API_KEY || process.env.NODE_ENV === 'development';
}

export async function GET(request: NextRequest) {
  // Check admin auth
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);

    // Parse date filters
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date();

    // Get routing decisions from database
    const routingDecisions = await prisma.routingDecision.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limit for performance
    });

    // Calculate statistics
    const totalDecisions = routingDecisions.length;
    const consolidatorDecisions = routingDecisions.filter(d => d.routingChannel === 'CONSOLIDATOR');
    const duffelDecisions = routingDecisions.filter(d => d.routingChannel === 'DUFFEL');

    const totalEstimatedProfit = routingDecisions.reduce((sum, d) => sum + (d.estimatedProfit || 0), 0);
    const consolidatorProfit = consolidatorDecisions.reduce((sum, d) => sum + (d.consolidatorProfit || 0), 0);
    const duffelProfit = duffelDecisions.reduce((sum, d) => sum + (d.duffelProfit || 0), 0);
    const totalCommission = consolidatorDecisions.reduce((sum, d) => sum + (d.commissionAmount || 0), 0);

    // Group by airline
    const airlineStats: Record<string, {
      count: number;
      consolidator: number;
      duffel: number;
      totalProfit: number;
      avgCommission: number;
    }> = {};

    for (const decision of routingDecisions) {
      const code = decision.airlineCode;
      if (!airlineStats[code]) {
        airlineStats[code] = { count: 0, consolidator: 0, duffel: 0, totalProfit: 0, avgCommission: 0 };
      }
      airlineStats[code].count++;
      if (decision.routingChannel === 'CONSOLIDATOR') {
        airlineStats[code].consolidator++;
        airlineStats[code].avgCommission += decision.commissionPct || 0;
      } else {
        airlineStats[code].duffel++;
      }
      airlineStats[code].totalProfit += decision.estimatedProfit || 0;
    }

    // Calculate averages
    for (const code in airlineStats) {
      if (airlineStats[code].consolidator > 0) {
        airlineStats[code].avgCommission /= airlineStats[code].consolidator;
      }
    }

    // Group by decision reason
    const reasonStats: Record<string, number> = {};
    for (const decision of routingDecisions) {
      const reason = decision.decisionReason || 'unknown';
      reasonStats[reason] = (reasonStats[reason] || 0) + 1;
    }

    // Daily profit trend
    const dailyStats: Record<string, { profit: number; count: number }> = {};
    for (const decision of routingDecisions) {
      const day = decision.createdAt.toISOString().split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { profit: 0, count: 0 };
      }
      dailyStats[day].profit += decision.estimatedProfit || 0;
      dailyStats[day].count++;
    }

    // Top routes by profit
    const routeStats: Record<string, { profit: number; count: number }> = {};
    for (const decision of routingDecisions) {
      const route = `${decision.origin}-${decision.destination}`;
      if (!routeStats[route]) {
        routeStats[route] = { profit: 0, count: 0 };
      }
      routeStats[route].profit += decision.estimatedProfit || 0;
      routeStats[route].count++;
    }

    const topRoutes = Object.entries(routeStats)
      .sort((a, b) => b[1].profit - a[1].profit)
      .slice(0, 20)
      .map(([route, stats]) => ({ route, ...stats }));

    // Top airlines by profit
    const topAirlines = Object.entries(airlineStats)
      .sort((a, b) => b[1].totalProfit - a[1].totalProfit)
      .slice(0, 20)
      .map(([code, stats]) => ({ airlineCode: code, ...stats }));

    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        summary: {
          totalDecisions,
          consolidatorDecisions: consolidatorDecisions.length,
          duffelDecisions: duffelDecisions.length,
          consolidatorPct: totalDecisions > 0 ? (consolidatorDecisions.length / totalDecisions) * 100 : 0,
          totalEstimatedProfit: Math.round(totalEstimatedProfit * 100) / 100,
          consolidatorProfit: Math.round(consolidatorProfit * 100) / 100,
          duffelProfit: Math.round(duffelProfit * 100) / 100,
          totalCommission: Math.round(totalCommission * 100) / 100,
          avgProfitPerDecision: totalDecisions > 0
            ? Math.round((totalEstimatedProfit / totalDecisions) * 100) / 100
            : 0,
        },
        byReason: reasonStats,
        dailyTrend: Object.entries(dailyStats)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, stats]) => ({ date, ...stats })),
        topRoutes,
        topAirlines,
      },
    });
  } catch (error) {
    console.error('[Admin Routing Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routing analytics' },
      { status: 500 }
    );
  }
}
