import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing or invalid status' }, { status: 400 });
    }

    // Find the booking and verify ownership
    const booking = await prisma.propertyBooking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Verify the authenticated user is the property owner
    if (booking.property.owner.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Not authorized to update this booking' }, { status: 403 });
    }

    // Validate status transition
    const allowedTransitions = VALID_TRANSITIONS[booking.status] || [];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot transition from '${booking.status}' to '${status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
        },
        { status: 400 }
      );
    }

    // Update the booking status
    const updated = await prisma.propertyBooking.update({
      where: { id },
      data: { status },
      include: {
        property: { select: { id: true, name: true, coverImageUrl: true } },
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Booking update error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
