/**
 * Airports Database API
 * GET /api/aviation/airports - List all airports
 * GET /api/aviation/airports?code=JFK - Get specific airport
 * GET /api/aviation/airports?city=New York - Search by city
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
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single airport lookup
    if (code) {
      const airport = await prisma.airport.findUnique({
        where: { iataCode: code.toUpperCase() },
      });

      if (!airport) {
        return NextResponse.json({ error: 'Airport not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, airport });
    }

    // List/search with filters
    const where: any = {};
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (country) where.country = country.toUpperCase();
    if (query) {
      where.OR = [
        { iataCode: { contains: query.toUpperCase() } },
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [airports, total] = await Promise.all([
      prisma.airport.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { iataCode: 'asc' },
      }),
      prisma.airport.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      airports,
      pagination: { limit, offset, total },
    });
  } catch (error: any) {
    console.error('Airports API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
