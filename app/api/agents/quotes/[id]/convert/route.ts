export const dynamic = 'force-dynamic';

// app/api/agents/quotes/[id]/convert/route.ts
// Convert Accepted Quote to Booking
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

// Generate booking confirmation number
function generateConfirmationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `BK-${year}-${random}`;
}

const ConvertQuoteSchema = z.object({
  depositAmount: z.number().min(0).optional(),
  depositDueDate: z.string().datetime().optional(),
  finalPaymentDueDate: z.string().datetime().optional(),
});

// POST /api/agents/quotes/[id]/convert - Convert quote to booking
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

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        client: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Quote must be ACCEPTED to convert
    if (quote.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Only accepted quotes can be converted to bookings" },
        { status: 400 }
      );
    }

    // Check if already converted
    if (quote.convertedToBooking) {
      return NextResponse.json(
        { error: "Quote has already been converted to a booking" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { depositAmount, depositDueDate, finalPaymentDueDate } = ConvertQuoteSchema.parse(body);

    // Calculate default deposit (25% if not specified)
    const deposit = depositAmount || quote.total * 0.25;
    const balance = quote.total - deposit;

    // Default payment dates
    const defaultDepositDue = new Date();
    defaultDepositDue.setDate(defaultDepositDue.getDate() + 7); // 7 days from now

    const defaultFinalDue = new Date(quote.startDate);
    defaultFinalDue.setDate(defaultFinalDue.getDate() - 30); // 30 days before trip

    // Create booking
    const booking = await prisma!.agentBooking.create({
      data: {
        confirmationNumber: generateConfirmationNumber(),
        agentId: agent.id,
        clientId: quote.clientId,
        quoteId: quote.id,
        // Trip details
        tripName: quote.tripName,
        destination: quote.destination,
        startDate: quote.startDate,
        endDate: quote.endDate,
        duration: quote.duration,
        travelers: quote.travelers,
        adults: quote.adults,
        children: quote.children,
        infants: quote.infants,
        // Components
        flights: quote.flights as any,
        hotels: quote.hotels as any,
        activities: quote.activities as any,
        transfers: quote.transfers as any,
        carRentals: quote.carRentals as any,
        insurance: quote.insurance as any,
        customItems: quote.customItems as any,
        // Pricing
        subtotal: quote.subtotal,
        agentMarkup: quote.agentMarkup,
        taxes: quote.taxes,
        fees: quote.fees,
        discount: quote.discount,
        total: quote.total,
        currency: quote.currency,
        // Payment
        depositAmount: deposit,
        depositDueDate: depositDueDate ? new Date(depositDueDate) : defaultDepositDue,
        balanceDue: balance,
        finalPaymentDue: finalPaymentDueDate ? new Date(finalPaymentDueDate) : defaultFinalDue,
        paymentStatus: "PENDING",
        status: "PENDING",
      },
    });

    // Update quote status
    await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        status: "CONVERTED",
        convertedToBooking: true,
        bookingId: booking.id,
        convertedAt: new Date(),
      },
    });

    // Calculate commission breakdown
    const platformFeePercent = agent.defaultCommission; // e.g., 0.05 = 5%
    const platformFee = quote.agentMarkup * platformFeePercent;
    const agentEarnings = quote.agentMarkup - platformFee;

    // Calculate hold period end date (30 days after trip completion by default)
    const holdUntil = new Date(quote.endDate);
    holdUntil.setDate(holdUntil.getDate() + 30);

    // Create commission record
    const commission = await prisma!.agentCommission.create({
      data: {
        agentId: agent.id,
        bookingId: booking.id,
        // Revenue breakdown
        bookingTotal: quote.total,
        supplierCost: quote.subtotal, // Cost before markup
        grossProfit: quote.agentMarkup,
        platformFee,
        platformFeePercent,
        agentEarnings,
        // Commission calculation
        commissionRate: quote.agentMarkupPercent ? quote.agentMarkupPercent / 100 : 0.15,
        commissionAmount: quote.agentMarkup,
        totalEarnings: agentEarnings,
        // Breakdown by product
        flightCommission: quote.flightsCost > 0 ? (quote.flightsCost * (quote.agentMarkupPercent || 15) / 100) : 0,
        hotelCommission: quote.hotelsCost > 0 ? (quote.hotelsCost * (quote.agentMarkupPercent || 15) / 100) : 0,
        activityCommission: quote.activitiesCost > 0 ? (quote.activitiesCost * (quote.agentMarkupPercent || 15) / 100) : 0,
        transferCommission: quote.transfersCost > 0 ? (quote.transfersCost * (quote.agentMarkupPercent || 15) / 100) : 0,
        otherCommission: (quote.insuranceCost + quote.customItemsCost) > 0 ? ((quote.insuranceCost + quote.customItemsCost) * (quote.agentMarkupPercent || 15) / 100) : 0,
        // Lifecycle
        status: "PENDING",
        bookingDate: new Date(),
        tripStartDate: quote.startDate,
        tripEndDate: quote.endDate,
        holdUntil,
      },
    });

    // Update agent stats
    await prisma!.travelAgent.update({
      where: { id: agent.id },
      data: {
        totalSales: { increment: quote.total },
        totalCommissions: { increment: agentEarnings },
        bookingsThisMonth: { increment: 1 },
        revenueThisMonth: { increment: quote.total },
        pendingBalance: { increment: agentEarnings },
      },
    });

    // Update client stats
    await prisma!.agentClient.update({
      where: { id: quote.clientId },
      data: {
        totalBookings: { increment: 1 },
        totalSpent: { increment: quote.total },
        lastBookingDate: new Date(),
        nextBookingDate: quote.startDate,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "booking_created",
        description: `Quote ${quote.quoteNumber} converted to booking ${booking.confirmationNumber}`,
        entityType: "booking",
        entityId: booking.id,
        metadata: {
          quoteNumber: quote.quoteNumber,
          confirmationNumber: booking.confirmationNumber,
          total: booking.total,
          commission: agentEarnings,
        },
      },
    });

    return NextResponse.json({
      success: true,
      booking,
      commission: {
        id: commission.id,
        agentEarnings,
        platformFee,
        status: commission.status,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("[QUOTE_CONVERT_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to convert quote to booking" },
      { status: 500 }
    );
  }
}
