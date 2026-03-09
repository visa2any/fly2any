import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const availability = await prisma.propertyAvailability.findMany({
      where: { propertyId: params.id },
      orderBy: { startDate: 'asc' }
    });
    return NextResponse.json({ data: availability });
  } catch (error) {
    console.error('Availability GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const propertyId = params.id;
    const body = await req.json();
    const { startDate, endDate, available, price, customPrice, notes, minStay } = body;

    const finalPrice = price ?? customPrice ?? null;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Delete any overlapping entries to prevent conflicts
    await prisma.propertyAvailability.deleteMany({
      where: {
        propertyId,
        OR: [
          { startDate: { gte: start, lte: end } },
          { endDate: { gte: start, lte: end } },
          { AND: [{ startDate: { lte: start } }, { endDate: { gte: end } }] },
        ],
      },
    });

    const entry = await prisma.propertyAvailability.create({
      data: {
        propertyId,
        startDate: start,
        endDate: end,
        available,
        customPrice: finalPrice,
        currency: 'USD',
        source: 'manual',
        ...(notes ? { notes } : {}),
        ...(minStay ? { minStay } : {}),
      }
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error('Availability POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
