import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/properties/bookings — List bookings for the authenticated host
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Find the owner
    const owner = await prisma.propertyOwner.findUnique({
      where: { userId: session.user.id },
    });
    if (!owner) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch bookings for all properties owned by this user
    const bookings = await prisma.propertyBooking.findMany({
      where: {
        property: { ownerId: owner.id },
      },
      include: {
        property: { select: { id: true, name: true, coverImageUrl: true } },
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { checkIn: 'desc' },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('Bookings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
