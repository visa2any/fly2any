/**
 * Aircraft Database API
 * GET /api/aviation/aircraft - List all aircraft
 * GET /api/aviation/aircraft?code=738 - Get specific aircraft
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const prisma = getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const manufacturer = searchParams.get('manufacturer');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single aircraft lookup
    if (code) {
      const aircraft = await prisma.aircraft.findUnique({
        where: { iataCode: code.toUpperCase() },
        include: { seatMaps: true },
      });

      if (!aircraft) {
        return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, aircraft });
    }

    // List with filters
    const where: any = {};
    if (manufacturer) where.manufacturer = { contains: manufacturer, mode: 'insensitive' };
    if (category) where.category = category;

    const [aircraft, total] = await Promise.all([
      prisma.aircraft.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { manufacturer: 'asc' },
      }),
      prisma.aircraft.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      aircraft,
      pagination: { limit, offset, total },
    });
  } catch (error: any) {
    console.error('Aircraft API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
