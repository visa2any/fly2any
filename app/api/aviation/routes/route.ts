/**
 * Route Statistics API
 * GET /api/aviation/routes - List route statistics
 * GET /api/aviation/routes?origin=JFK&destination=LHR - Get specific route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getRouteStats, getPriceTrends } from '@/lib/aviation/aviation-intelligence-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const includePrices = searchParams.get('prices') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Specific route lookup
    if (origin && destination) {
      const [route, prices] = await Promise.all([
        getRouteStats(origin, destination),
        includePrices ? getPriceTrends(origin, destination, 30) : Promise.resolve([]),
      ]);

      if (!route) {
        return NextResponse.json({
          success: false,
          error: 'Route not found',
          message: 'No data yet for this route. Search for flights to start building intelligence.',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        route,
        priceTrends: prices || [],
      });
    }

    // List popular routes
    const routes = await prisma.routeStatistics.findMany({
      take: limit,
      skip: offset,
      orderBy: { dataPoints: 'desc' },
    });

    const total = await prisma.routeStatistics.count();

    return NextResponse.json({
      success: true,
      routes,
      pagination: { limit, offset, total },
    });
  } catch (error: any) {
    console.error('Routes API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
