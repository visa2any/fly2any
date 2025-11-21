// app/api/agents/bookings/[id]/route.ts
// Get, Update, and Cancel Booking
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

const UpdateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  tripName: z.string().min(1).optional(),
  destination: z.string().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  travelers: z.number().min(1).optional(),
  adults: z.number().min(0).optional(),
  children: z.number().min(0).optional(),
  infants: z.number().min(0).optional(),
  flights: z.any().optional(),
  hotels: z.any().optional(),
  activities: z.any().optional(),
  transfers: z.any().optional(),
  carRentals: z.any().optional(),
  insurance: z.any().optional(),
  customItems: z.any().optional(),
  agentNotes: z.string().optional(),
  depositDueDate: z.string().datetime().optional(),
  finalPaymentDue: z.string().datetime().optional(),
});

const CancelBookingSchema = z.object({
  reason: z.string().min(1),
  refundAmount: z.number().min(0).optional(),
  refundProcessed: z.boolean().default(false),
});

// GET /api/agents/bookings/[id] - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const booking = await prisma!.agentBooking.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        client: true,
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            createdAt: true,
            sentAt: true,
            acceptedAt: true,
          },
        },
        commissions: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Calculate payment summary (using balanceDue since no payments table)
    const totalPaid = booking.total - booking.balanceDue;
    const remainingBalance = booking.balanceDue;

    return NextResponse.json({
      booking,
      paymentSummary: {
        total: booking.total,
        depositAmount: booking.depositAmount,
        depositDueDate: booking.depositDueDate,
        balanceDue: booking.balanceDue,
        finalPaymentDue: booking.finalPaymentDue,
        totalPaid,
        remainingBalance,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error("[BOOKING_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/bookings/[id] - Update booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const booking = await prisma!.agentBooking.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Cannot update cancelled bookings
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot update a cancelled booking" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates = UpdateBookingSchema.parse(body);

    // If dates are updated, recalculate duration
    let duration = booking.duration;
    if (updates.startDate && updates.endDate) {
      const start = new Date(updates.startDate);
      const end = new Date(updates.endDate);
      duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    const updatedBooking = await prisma!.agentBooking.update({
      where: { id: booking.id },
      data: {
        ...updates,
        duration,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined,
        depositDueDate: updates.depositDueDate ? new Date(updates.depositDueDate) : undefined,
        finalPaymentDue: updates.finalPaymentDue ? new Date(updates.finalPaymentDue) : undefined,
      },
      include: {
        client: true,
        commissions: true,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "booking_updated",
        description: `Booking ${booking.confirmationNumber} updated`,
        entityType: "booking",
        entityId: booking.id,
        metadata: {
          updates: Object.keys(updates),
        },
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("[BOOKING_UPDATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const booking = await prisma!.agentBooking.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        commissions: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason, refundAmount, refundProcessed } = CancelBookingSchema.parse(body);

    // Calculate total paid (using balanceDue)
    const totalPaid = booking.total - booking.balanceDue;

    // Update booking status
    const cancelledBooking = await prisma!.agentBooking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        paymentStatus: refundProcessed && refundAmount === totalPaid ? "REFUNDED" : booking.paymentStatus,
        tripCancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Update commission status to CANCELLED if exists
    if (booking.commissions && booking.commissions.length > 0) {
      await prisma!.agentCommission.update({
        where: { id: booking.commissions[0].id },
        data: {
          status: "CANCELLED",
        },
      });

      // Reverse agent stats
      await prisma!.travelAgent.update({
        where: { id: agent.id },
        data: {
          totalSales: { decrement: booking.total },
          totalCommissions: { decrement: booking.commissions[0].agentEarnings },
          pendingBalance: { decrement: booking.commissions[0].agentEarnings },
        },
      });
    }

    // Update client stats
    await prisma!.agentClient.update({
      where: { id: booking.clientId },
      data: {
        totalBookings: { decrement: 1 },
        totalSpent: { decrement: booking.total },
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "booking_cancelled",
        description: `Booking ${booking.confirmationNumber} cancelled`,
        entityType: "booking",
        entityId: booking.id,
        metadata: {
          reason,
          refundAmount,
          totalPaid,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error("[BOOKING_CANCEL_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
