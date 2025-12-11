/**
 * Fare Classes Database API
 * GET /api/aviation/fares - List fare classes
 * GET /api/aviation/fares?airline=AA - Get airline-specific fares
 * GET /api/aviation/fares?cabin=BUSINESS - Get by cabin class
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
    const airline = searchParams.get('airline');
    const cabin = searchParams.get('cabin');
    const code = searchParams.get('code');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (airline) where.airlineCode = airline.toUpperCase();
    if (cabin) where.cabinClass = cabin.toUpperCase();
    if (code) where.code = code.toUpperCase();

    const [fares, total] = await Promise.all([
      prisma.fareClass.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ cabinClass: 'asc' }, { code: 'asc' }],
      }),
      prisma.fareClass.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      fareClasses: fares,
      pagination: { limit, offset, total },
    });
  } catch (error: any) {
    console.error('Fares API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
