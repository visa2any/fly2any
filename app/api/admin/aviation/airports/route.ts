/**
 * Admin Airports CRUD API
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
    const country = searchParams.get('country');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (search) {
      where.OR = [
        { iataCode: { contains: search.toUpperCase() } },
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (country) where.country = country.toUpperCase();
    if (type) where.airportType = type;

    const [airports, total] = await Promise.all([
      prisma.airport.findMany({ where, take: limit, skip: offset, orderBy: { iataCode: 'asc' } }),
      prisma.airport.count({ where }),
    ]);

    return NextResponse.json({ success: true, airports, pagination: { limit, offset, total } });
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
    const airport = await prisma.airport.create({
      data: {
        iataCode: data.iataCode.toUpperCase(),
        icaoCode: data.icaoCode?.toUpperCase(),
        name: data.name,
        city: data.city,
        country: data.country.toUpperCase(),
        countryName: data.countryName,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        airportType: data.airportType || 'LARGE',
        isHub: data.isHub || false,
        isInternational: data.isInternational ?? true,
        hubFor: data.hubFor || [],
        dataSource: 'admin',
      },
    });
    return NextResponse.json({ success: true, airport });
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

    const airport = await prisma.airport.update({
      where: { id },
      data: { ...updateData, lastUpdated: new Date() },
    });
    return NextResponse.json({ success: true, airport });
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

    await prisma.airport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
