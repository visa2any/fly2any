// app/api/agents/bookings/[id]/payment/route.ts
// Record payment for a booking
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { PaymentStatus, CommissionStatus } from "@prisma/client";

const PaymentSchema = z.object({
  amount: z.number().min(0.01),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "PAYPAL", "STRIPE", "CASH", "CHECK", "OTHER"]),
  paymentType: z.enum(["DEPOSIT", "PARTIAL", "FULL", "REFUND"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().datetime().optional(),
});

// POST /api/agents/bookings/[id]/payment - Record a payment
export async function POST(
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

    // Cannot add payments to cancelled bookings
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot add payment to a cancelled booking" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const paymentData = PaymentSchema.parse(body);

    // Calculate current balance paid (tracking via balanceDue)
    const currentTotalPaid = booking.total - booking.balanceDue;
    const newTotalPaid = currentTotalPaid + paymentData.amount;

    // Validate payment amount doesn't exceed total
    if (newTotalPaid > booking.total) {
      return NextResponse.json(
        { error: `Payment exceeds booking total. Remaining: $${(booking.total - currentTotalPaid).toFixed(2)}` },
        { status: 400 }
      );
    }

    // Determine new payment status
    let newPaymentStatus: PaymentStatus = booking.paymentStatus;
    if (newTotalPaid >= booking.total) {
      newPaymentStatus = PaymentStatus.FULLY_PAID;
    } else if (newTotalPaid >= booking.depositAmount && booking.paymentStatus === PaymentStatus.PENDING) {
      newPaymentStatus = PaymentStatus.DEPOSIT_PAID;
    } else if (newTotalPaid > 0 && newTotalPaid < booking.total) {
      newPaymentStatus = PaymentStatus.DEPOSIT_PAID;
    }

    // Update booking payment status
    const updatedBooking = await prisma!.agentBooking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: newPaymentStatus,
        balanceDue: booking.total - newTotalPaid,
      },
      include: {
        client: true,
      },
    });

    // If booking is fully paid, update status to CONFIRMED (if still PENDING)
    if (newPaymentStatus === PaymentStatus.FULLY_PAID && booking.status === "PENDING") {
      await prisma!.agentBooking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      });
    }

    // Update commission lifecycle if deposit paid
    if (newPaymentStatus === PaymentStatus.DEPOSIT_PAID && booking.commissions[0]?.status === CommissionStatus.PENDING) {
      await prisma!.agentCommission.update({
        where: { id: booking.commissions[0].id },
        data: {
          status: CommissionStatus.TRIP_IN_PROGRESS,
        },
      });
    }

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "payment_received",
        description: `Payment of $${paymentData.amount} received for ${booking.confirmationNumber}`,
        entityType: "booking",
        entityId: booking.id,
        metadata: {
          confirmationNumber: booking.confirmationNumber,
          paymentAmount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          totalPaid: newTotalPaid,
          remainingBalance: booking.total - newTotalPaid,
        },
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      summary: {
        totalPaid: newTotalPaid,
        remainingBalance: booking.total - newTotalPaid,
        paymentStatus: newPaymentStatus,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[PAYMENT_CREATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}

// GET /api/agents/bookings/[id]/payment - List all payments for a booking
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
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Since there's no AgentPayment model, calculate from balanceDue
    const totalPaid = booking.total - booking.balanceDue;

    return NextResponse.json({
      summary: {
        totalPaid,
        bookingTotal: booking.total,
        remainingBalance: booking.balanceDue,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error("[PAYMENTS_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
