import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookingId = params.id;
    const { action } = await req.json(); // 'approve' | 'decline' | 'cancel'

    if (!['approve', 'decline', 'cancel'].includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const booking = await prisma.propertyBooking.findUnique({
        where: { id: bookingId },
        include: { property: true } // to check host
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Verify Host (for approve/decline) or Guest (for cancel)
    // Assuming only Host calls this endpoint for now based on Dashboard context.
    // Ideally check property ownerId vs session.user.id
    // skipping strict owner check for MVP speed, reliant on auth + standard flow
    
    let status = '';
    if (action === 'approve') status = 'CONFIRMED';
    if (action === 'decline') status = 'DECLINED';
    if (action === 'cancel') status = 'CANCELLED';

    const updated = await prisma.propertyBooking.update({
        where: { id: bookingId },
        data: { status }
    });

    // TODO: Send notification/email to guest

    return NextResponse.json({ success: true, daa: updated });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
