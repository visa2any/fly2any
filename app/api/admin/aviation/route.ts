/**
 * Admin Aviation Intelligence API
 * GET /api/admin/aviation - Dashboard stats & overview
 * POST /api/admin/aviation - Bulk operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const prisma = getPrismaClient();
  if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'overview';

    // Overview stats
    const [airlines, aircraft, airports, routes, flights, fares, prices, syncLogs] = await Promise.all([
      prisma.airlineProfile.count(),
      prisma.aircraft.count(),
      prisma.airport.count(),
      prisma.routeStatistics.count(),
      prisma.flightRecord.count(),
      prisma.fareClass.count(),
      prisma.priceTrend.count(),
      prisma.aviationDataSyncLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Recent activity
    const [recentAircraft, recentAirports, recentRoutes] = await Promise.all([
      prisma.aircraft.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.airport.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.routeStatistics.findMany({ take: 5, orderBy: { lastAnalyzed: 'desc' } }),
    ]);

    // Top routes by data points
    const topRoutes = await prisma.routeStatistics.findMany({
      take: 10,
      orderBy: { dataPoints: 'desc' },
    });

    return NextResponse.json({
      success: true,
      stats: { airlines, aircraft, airports, routes, flights, fares, prices },
      syncLogs,
      recent: { aircraft: recentAircraft, airports: recentAirports, routes: recentRoutes },
      topRoutes,
    });
  } catch (error: any) {
    console.error('Admin aviation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const prisma = getPrismaClient();
  if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  try {
    const body = await request.json();
    const { action, entityType, data } = body;

    switch (action) {
      case 'purge':
        // Purge old data
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - (body.days || 30));

        const deleted = await prisma.flightRecord.deleteMany({
          where: { observedAt: { lt: cutoff } },
        });
        return NextResponse.json({ success: true, deleted: deleted.count });

      case 'sync':
        // Trigger manual sync (placeholder)
        return NextResponse.json({ success: true, message: 'Sync triggered' });

      case 'export':
        // Export data
        let exportData: any;
        if (entityType === 'aircraft') {
          exportData = await prisma.aircraft.findMany();
        } else if (entityType === 'airports') {
          exportData = await prisma.airport.findMany();
        } else if (entityType === 'routes') {
          exportData = await prisma.routeStatistics.findMany();
        }
        return NextResponse.json({ success: true, data: exportData });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
