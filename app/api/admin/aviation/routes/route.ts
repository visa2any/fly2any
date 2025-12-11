/**
 * Admin Routes Statistics CRUD API
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
    const search = searchParams.get('search');
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (search) {
      where.OR = [
        { routeKey: { contains: search.toUpperCase() } },
        { originIata: { contains: search.toUpperCase() } },
        { destinationIata: { contains: search.toUpperCase() } },
      ];
    }
    if (origin) where.originIata = origin.toUpperCase();
    if (destination) where.destinationIata = destination.toUpperCase();

    const [routes, total] = await Promise.all([
      prisma.routeStatistics.findMany({ where, take: limit, skip: offset, orderBy: { dataPoints: 'desc' } }),
      prisma.routeStatistics.count({ where }),
    ]);

    return NextResponse.json({ success: true, routes, pagination: { limit, offset, total } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const prisma = getPrismaClient();
  if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  try {
    const data = await request.json();
    const routeKey = `${data.originIata.toUpperCase()}-${data.destinationIata.toUpperCase()}`;

    const route = await prisma.routeStatistics.create({
      data: {
        routeKey,
        originIata: data.originIata.toUpperCase(),
        destinationIata: data.destinationIata.toUpperCase(),
        distanceKm: data.distanceKm,
        flightTimeMin: data.flightTimeMin,
        operatingAirlines: data.operatingAirlines || [],
        carrierCount: data.operatingAirlines?.length || 0,
        dailyFlights: data.dailyFlights,
        avgEconomyPrice: data.avgEconomyPrice,
        peakMonths: data.peakMonths || [],
      },
    });
    return NextResponse.json({ success: true, route });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const prisma = getPrismaClient();
  if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const route = await prisma.routeStatistics.update({
      where: { id },
      data: { ...updateData, updatedAt: new Date() },
    });
    return NextResponse.json({ success: true, route });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const prisma = getPrismaClient();
  if (!prisma) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.routeStatistics.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
