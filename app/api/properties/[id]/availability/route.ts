import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const propertyId = params.id;
    const body = await req.json();
    const { startDate, endDate, available, price } = body;

    const entry = await prisma.propertyAvailability.create({
        data: {
            propertyId,
            startDate,
            endDate,
            available,
            customPrice: price,
            currency: 'USD',
            source: 'manual'
        }
    });

    return NextResponse.json({ success: true, data: entry });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const availability = await prisma.propertyAvailability.findMany({
        where: { propertyId: params.id },
        orderBy: { startDate: 'asc' }
    });
    return NextResponse.json({ data: availability });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
