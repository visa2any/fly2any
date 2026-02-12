import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/properties/[id]/availability — Get property availability (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: any = { propertyId: params.id };
    if (from) where.endDate = { gte: new Date(from) };
    if (to) where.startDate = { lte: new Date(to) };

    const availability = await prisma.propertyAvailability.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
    return NextResponse.json({ success: true, data: availability });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/properties/[id]/availability — Set availability (auth + ownership required)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { owner: { select: { userId: true } } },
    });
    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }
    if (property.owner.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const availability = await prisma.propertyAvailability.create({
      data: {
        propertyId: params.id,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        available: body.available ?? true,
        customPrice: body.customPrice || null,
        currency: body.currency || 'USD',
        minStay: body.minStay || null,
        maxStay: body.maxStay || null,
        notes: body.notes || null,
        source: body.source || 'manual',
      },
    });
    return NextResponse.json({ success: true, data: availability }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
