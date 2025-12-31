export const dynamic = 'force-dynamic';

// app/api/pay/[linkId]/route.ts
// Public API for payment link - no auth required
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/pay/[linkId] - Get payment details (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const quote = await prisma!.agentQuote.findFirst({
      where: {
        paymentLinkId: params.linkId,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        agent: {
          select: {
            agencyName: true,
            businessName: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            logo: true,
            brandColor: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Payment link not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This quote has expired", expired: true },
        { status: 410 }
      );
    }

    // Check payment status
    if (quote.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          error: "This quote has already been paid",
          paid: true,
          paidAt: quote.paidAt,
        },
        { status: 400 }
      );
    }

    // Build trip summary
    const tripItems = [];

    if (quote.flights && Array.isArray(quote.flights) && quote.flights.length > 0) {
      tripItems.push({
        type: 'flights',
        count: quote.flights.length,
        cost: quote.flightsCost,
        items: quote.flights.map((f: any) => ({
          origin: f.origin,
          destination: f.destination,
          airline: f.airline,
          departureDate: f.departureDate,
          arrivalDate: f.arrivalDate,
        })),
      });
    }

    if (quote.hotels && Array.isArray(quote.hotels) && quote.hotels.length > 0) {
      tripItems.push({
        type: 'hotels',
        count: quote.hotels.length,
        cost: quote.hotelsCost,
        items: quote.hotels.map((h: any) => ({
          name: h.name,
          location: h.location,
          checkIn: h.checkIn,
          checkOut: h.checkOut,
          nights: h.nights,
        })),
      });
    }

    if (quote.activities && Array.isArray(quote.activities) && quote.activities.length > 0) {
      tripItems.push({
        type: 'activities',
        count: quote.activities.length,
        cost: quote.activitiesCost,
      });
    }

    if (quote.transfers && Array.isArray(quote.transfers) && quote.transfers.length > 0) {
      tripItems.push({
        type: 'transfers',
        count: quote.transfers.length,
        cost: quote.transfersCost,
      });
    }

    // Track view
    await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
        viewedAt: quote.viewedAt || new Date(),
        status: quote.status === "SENT" ? "VIEWED" : quote.status,
      },
    });

    return NextResponse.json({
      quoteNumber: quote.quoteNumber,
      tripName: quote.tripName,
      destination: quote.destination,
      startDate: quote.startDate,
      endDate: quote.endDate,
      duration: quote.duration,
      travelers: quote.travelers,
      adults: quote.adults,
      children: quote.children,
      infants: quote.infants,
      tripItems,
      pricing: {
        subtotal: quote.subtotal,
        taxes: quote.taxes,
        fees: quote.fees,
        discount: quote.discount,
        total: quote.total,
        currency: quote.currency,
        depositRequired: quote.depositRequired,
        depositAmount: quote.depositAmount,
      },
      client: quote.client,
      agent: quote.agent,
      expiresAt: quote.expiresAt,
      notes: quote.notes,
      inclusions: quote.inclusions,
      exclusions: quote.exclusions,
      termsAndConditions: quote.termsAndConditions,
    });
  } catch (error) {
    console.error("[PAY_LINK_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load payment details" },
      { status: 500 }
    );
  }
}
