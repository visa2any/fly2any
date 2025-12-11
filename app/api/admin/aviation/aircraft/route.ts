/**
 * Admin Aircraft CRUD API
 * GET /api/admin/aviation/aircraft - List with pagination
 * POST /api/admin/aviation/aircraft - Create
 * PUT /api/admin/aviation/aircraft - Update
 * DELETE /api/admin/aviation/aircraft - Delete
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
    const manufacturer = searchParams.get('manufacturer');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (search) {
      where.OR = [
        { iataCode: { contains: search.toUpperCase() } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (manufacturer) where.manufacturer = { contains: manufacturer, mode: 'insensitive' };
    if (category) where.category = category;

    const [aircraft, total] = await Promise.all([
      prisma.aircraft.findMany({ where, take: limit, skip: offset, orderBy: { manufacturer: 'asc' }, include: { seatMaps: true } }),
      prisma.aircraft.count({ where }),
    ]);

    return NextResponse.json({ success: true, aircraft, pagination: { limit, offset, total } });
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
    const aircraft = await prisma.aircraft.create({
      data: {
        iataCode: data.iataCode.toUpperCase(),
        icaoCode: data.icaoCode?.toUpperCase(),
        manufacturer: data.manufacturer,
        model: data.model,
        fullName: data.fullName || `${data.manufacturer} ${data.model}`,
        family: data.family,
        category: data.category || 'NARROWBODY',
        hasWideBody: data.hasWideBody || false,
        aisleCount: data.aisleCount || 1,
        typicalSeats: data.typicalSeats,
        rangeKm: data.rangeKm,
        dataSource: 'admin',
        operators: data.operators || [],
      },
    });
    return NextResponse.json({ success: true, aircraft });
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

    const aircraft = await prisma.aircraft.update({
      where: { id },
      data: { ...updateData, lastUpdated: new Date() },
    });
    return NextResponse.json({ success: true, aircraft });
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

    await prisma.aircraft.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
