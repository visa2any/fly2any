/**
 * Admin Fare Classes CRUD API
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
    const airline = searchParams.get('airline');
    const cabin = searchParams.get('cabin');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (airline) where.airlineCode = airline.toUpperCase();
    if (cabin) where.cabinClass = cabin;

    const [fares, total] = await Promise.all([
      prisma.fareClass.findMany({ where, take: limit, skip: offset, orderBy: [{ cabinClass: 'asc' }, { code: 'asc' }] }),
      prisma.fareClass.count({ where }),
    ]);

    return NextResponse.json({ success: true, fares, pagination: { limit, offset, total } });
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
    const fare = await prisma.fareClass.create({
      data: {
        code: data.code.toUpperCase(),
        airlineCode: data.airlineCode?.toUpperCase(),
        name: data.name,
        brandName: data.brandName,
        cabinClass: data.cabinClass || 'ECONOMY',
        bookingClasses: data.bookingClasses || [data.code.toUpperCase()],
        carryOnIncluded: data.carryOnIncluded ?? true,
        checkedBags: data.checkedBags || 0,
        changeAllowed: data.changeAllowed || false,
        changeFee: data.changeFee,
        refundable: data.refundable || false,
        dataSource: 'admin',
      },
    });
    return NextResponse.json({ success: true, fare });
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

    const fare = await prisma.fareClass.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ success: true, fare });
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

    await prisma.fareClass.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
