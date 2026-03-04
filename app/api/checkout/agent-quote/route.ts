export const dynamic = 'force-dynamic';

/**
 * POST /api/checkout/agent-quote
 * Process agent quote checkout — manual ticketing flow
 *
 * 1. Validates quote & payment link
 * 2. Stores passenger/contact info on quote
 * 3. Auto-accepts quote if not yet accepted
 * 4. Converts quote → AgentBooking (PENDING_TICKETING)
 * 5. Creates commission record
 * 6. Marks quote as PAID
 * 7. Sends confirmation emails to client + agent
 * 8. Returns confirmation number
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { resendClient } from "@/lib/email/resend-client";

// ── Validation ──────────────────────────────────────────────

const PassengerSchema = z.object({
  type: z.enum(["adult", "child", "infant"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  nationality: z.string().optional(),
});

const ContactSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  specialRequests: z.string().optional(),
});

const CheckoutSchema = z.object({
  linkId: z.string().min(1),
  passengers: z.array(PassengerSchema).min(1),
  contact: ContactSchema,
});

// ── Helpers ─────────────────────────────────────────────────

function generateConfirmationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `BK-${year}-${random}`;
}

// ── Route Handler ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, passengers, contact } = CheckoutSchema.parse(body);

    // 1. Load quote by payment link
    const quote = await prisma!.agentQuote.findFirst({
      where: {
        paymentLinkId: linkId,
        deletedAt: null,
      },
      include: {
        client: true,
        agent: {
          include: { user: true },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // 2. Validate quote state
    if (new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This quote has expired" }, { status: 410 });
    }

    if (quote.paymentStatus === "PAID") {
      return NextResponse.json({ error: "This quote has already been paid" }, { status: 400 });
    }

    if (!quote.clientId) {
      return NextResponse.json({ error: "Quote has no client assigned" }, { status: 400 });
    }

    if (quote.convertedToBooking && quote.bookingId) {
      // Already converted — look up existing booking
      const existingBooking = await prisma!.agentBooking.findUnique({
        where: { id: quote.bookingId },
      });
      if (existingBooking) {
        return NextResponse.json({
          success: true,
          confirmationNumber: existingBooking.confirmationNumber,
          bookingId: existingBooking.id,
          message: "Booking already exists",
        });
      }
    }

    // 3. If quote not yet ACCEPTED, auto-accept it (client is paying = acceptance)
    if (!["ACCEPTED", "CONVERTED"].includes(quote.status)) {
      let timeToAccept = null;
      if (quote.sentAt) {
        timeToAccept = Math.floor(
          (Date.now() - quote.sentAt.getTime()) / (1000 * 60)
        );
      }

      await prisma!.agentQuote.update({
        where: { id: quote.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          timeToAccept,
        },
      });

      await prisma!.travelAgent.update({
        where: { id: quote.agentId },
        data: { quotesAccepted: { increment: 1 } },
      });
    }

    // 4. Calculate deposit & payment terms
    const deposit = quote.depositAmount
      ? Number(quote.depositAmount)
      : Number(quote.total) * 0.25;
    const balance = Number(quote.total) - Number(quote.total); // Fully paid at checkout
    const now = new Date();

    const defaultDepositDue = new Date(now);
    defaultDepositDue.setDate(defaultDepositDue.getDate() + 7);

    const defaultFinalDue = new Date(quote.startDate);
    defaultFinalDue.setDate(defaultFinalDue.getDate() - 30);

    // 5. Create AgentBooking (PENDING — manual ticketing)
    const confirmationNumber = generateConfirmationNumber();

    const booking = await prisma!.agentBooking.create({
      data: {
        confirmationNumber,
        agentId: quote.agentId,
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
        // Products
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
        // Payment — fully paid at checkout
        depositAmount: Number(quote.total),
        depositDueDate: defaultDepositDue,
        balanceDue: 0,
        finalPaymentDue: defaultFinalDue,
        paymentStatus: "FULLY_PAID",
        totalPaid: Number(quote.total),
        status: "PENDING", // Manual ticketing — Fly2Any admin processes
        source: "client_checkout",
        // Store passenger + contact info in notes as structured JSON
        notes: JSON.stringify({
          passengers,
          contact: {
            email: contact.email,
            phone: contact.phone || "",
            specialRequests: contact.specialRequests || "",
          },
        }),
      },
    });

    // 6. Update quote to CONVERTED + PAID
    await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        status: "CONVERTED",
        convertedToBooking: true,
        bookingId: booking.id,
        convertedAt: now,
        paymentStatus: "PAID",
        paidAt: now,
        paidAmount: quote.total,
      },
    });

    // 7. Create commission record
    const platformFeePercent = quote.agent.defaultCommission || 0.05;
    const agentMarkup = Number(quote.agentMarkup) || 0;
    const platformFee = agentMarkup * platformFeePercent;
    const agentEarnings = agentMarkup - platformFee;

    const holdUntil = new Date(quote.endDate);
    holdUntil.setDate(holdUntil.getDate() + 30);

    const markupPercent = quote.agentMarkupPercent || 15;

    await prisma!.agentCommission.create({
      data: {
        agentId: quote.agentId,
        bookingId: booking.id,
        bookingTotal: quote.total,
        supplierCost: quote.subtotal,
        grossProfit: agentMarkup,
        platformFee,
        platformFeePercent,
        agentEarnings,
        commissionRate: markupPercent / 100,
        commissionAmount: agentMarkup,
        totalEarnings: agentEarnings,
        flightCommission: Number(quote.flightsCost) > 0 ? Number(quote.flightsCost) * markupPercent / 100 : 0,
        hotelCommission: Number(quote.hotelsCost) > 0 ? Number(quote.hotelsCost) * markupPercent / 100 : 0,
        activityCommission: Number(quote.activitiesCost) > 0 ? Number(quote.activitiesCost) * markupPercent / 100 : 0,
        transferCommission: Number(quote.transfersCost) > 0 ? Number(quote.transfersCost) * markupPercent / 100 : 0,
        otherCommission: (Number(quote.insuranceCost) + Number(quote.customItemsCost)) > 0
          ? (Number(quote.insuranceCost) + Number(quote.customItemsCost)) * markupPercent / 100
          : 0,
        status: "PENDING",
        bookingDate: now,
        tripStartDate: quote.startDate,
        tripEndDate: quote.endDate,
        holdUntil,
      },
    });

    // 8. Update agent stats
    await prisma!.travelAgent.update({
      where: { id: quote.agentId },
      data: {
        totalSales: { increment: Number(quote.total) },
        totalCommissions: { increment: agentEarnings },
        bookingsThisMonth: { increment: 1 },
        revenueThisMonth: { increment: Number(quote.total) },
        pendingBalance: { increment: agentEarnings },
      },
    });

    // 9. Update client stats
    if (quote.clientId) {
      await prisma!.agentClient.update({
        where: { id: quote.clientId },
        data: {
          totalBookings: { increment: 1 },
          totalSpent: { increment: Number(quote.total) },
          lastBookingDate: now,
          nextBookingDate: quote.startDate,
        },
      });
    }

    // 10. Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: quote.agentId,
        activityType: "booking_created",
        description: `Client checkout: Quote ${quote.quoteNumber} → Booking ${confirmationNumber}`,
        entityType: "booking",
        entityId: booking.id,
        metadata: {
          quoteNumber: quote.quoteNumber,
          confirmationNumber,
          total: Number(quote.total),
          paidVia: "client_checkout",
          passengers: passengers.length,
        },
      },
    });

    // 11. Send confirmation emails (fire-and-forget)
    sendClientConfirmationEmail(quote, booking, contact, passengers).catch(err =>
      console.error("[CHECKOUT_CLIENT_EMAIL_ERROR]", err)
    );
    sendAgentNotificationEmail(quote, booking, confirmationNumber).catch(err =>
      console.error("[CHECKOUT_AGENT_EMAIL_ERROR]", err)
    );

    return NextResponse.json({
      success: true,
      confirmationNumber,
      bookingId: booking.id,
    }, { status: 201 });

  } catch (error) {
    console.error("[AGENT_QUOTE_CHECKOUT_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}

// ── Email: Client Confirmation ──────────────────────────────

async function sendClientConfirmationEmail(
  quote: any,
  booking: any,
  contact: z.infer<typeof ContactSchema>,
  passengers: z.infer<typeof PassengerSchema>[]
) {
  const agentName = quote.agent.agencyName || quote.agent.businessName ||
    `${quote.agent.firstName || ''} ${quote.agent.lastName || ''}`.trim() || 'Your Travel Agent';

  const passengerList = passengers
    .map((p, i) => `<li>${p.firstName} ${p.lastName} <span style="color:#6B7280">(${p.type})</span></li>`)
    .join('');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.fly2any.com';

  await resendClient.send({
    to: contact.email,
    subject: `✅ Booking Confirmed — ${booking.confirmationNumber}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#E74035,#D63930);padding:32px;text-align:center;border-radius:16px 16px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">Booking Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Your trip is being prepared</p>
        </div>

        <!-- Confirmation # -->
        <div style="background:#1a1a1a;padding:20px;text-align:center">
          <p style="color:#9CA3AF;margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px">Confirmation Number</p>
          <p style="color:#F7C928;margin:0;font-size:28px;font-weight:bold;letter-spacing:2px;font-family:monospace">${booking.confirmationNumber}</p>
        </div>

        <!-- Trip Details -->
        <div style="background:white;padding:24px;border:1px solid #E5E7EB">
          <h2 style="margin:0 0 16px;font-size:18px;color:#111">${quote.tripName}</h2>
          <table style="width:100%;font-size:14px;color:#374151">
            <tr><td style="padding:6px 0;color:#6B7280">Destination</td><td style="text-align:right;font-weight:600">${quote.destination}</td></tr>
            <tr><td style="padding:6px 0;color:#6B7280">Dates</td><td style="text-align:right;font-weight:600">${new Date(quote.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(quote.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td></tr>
            <tr><td style="padding:6px 0;color:#6B7280">Duration</td><td style="text-align:right;font-weight:600">${quote.duration} days</td></tr>
            <tr><td style="padding:6px 0;color:#6B7280">Travelers</td><td style="text-align:right;font-weight:600">${quote.travelers} guests</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0" />

          <h3 style="margin:0 0 8px;font-size:14px;color:#111">Travelers</h3>
          <ul style="margin:0;padding-left:18px;font-size:14px;color:#374151">${passengerList}</ul>

          <hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0" />

          <table style="width:100%;font-size:14px">
            <tr style="font-size:18px;font-weight:bold"><td style="padding:8px 0;color:#111">Total Paid</td><td style="text-align:right;color:#059669">$${Number(quote.total).toLocaleString()}</td></tr>
          </table>
        </div>

        <!-- Next Steps -->
        <div style="background:#EFF6FF;padding:20px;border:1px solid #BFDBFE;border-top:none">
          <h3 style="margin:0 0 8px;font-size:14px;color:#1E40AF">⏳ What happens next?</h3>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#1E40AF;line-height:1.8">
            <li>Fly2Any is confirming your reservations</li>
            <li>E-tickets and vouchers will be sent within 24-48 hours</li>
            <li>Contact ${agentName} for any questions about your trip</li>
          </ul>
        </div>

        <!-- Agent Contact -->
        <div style="background:#F9FAFB;padding:20px;text-align:center;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 16px 16px">
          <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF">Your Travel Agent</p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#111">${agentName}</p>
          ${quote.agent.email ? `<p style="margin:4px 0 0;font-size:13px"><a href="mailto:${quote.agent.email}" style="color:#E74035">${quote.agent.email}</a></p>` : ''}
          ${quote.agent.phone ? `<p style="margin:4px 0 0;font-size:13px;color:#6B7280">${quote.agent.phone}</p>` : ''}
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding:20px">
          <p style="color:#9CA3AF;font-size:12px;margin:0">Powered by <a href="${baseUrl}" style="color:#E74035;text-decoration:none">Fly2Any</a></p>
        </div>
      </div>
    `,
    tags: ['agent-quote-checkout', 'booking-confirmation'],
  });
}

// ── Email: Agent Notification ───────────────────────────────

async function sendAgentNotificationEmail(
  quote: any,
  booking: any,
  confirmationNumber: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.fly2any.com';

  await resendClient.send({
    to: quote.agent.user.email,
    subject: `💰 New Booking! ${confirmationNumber} — $${Number(quote.total).toLocaleString()}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#059669,#047857);padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:white;margin:0;font-size:22px">New Booking Received!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Client completed checkout</p>
        </div>
        <div style="background:white;padding:24px;border:1px solid #E5E7EB">
          <table style="width:100%;font-size:14px;color:#374151">
            <tr><td style="padding:6px 0;color:#6B7280">Confirmation #</td><td style="text-align:right;font-weight:700;font-family:monospace">${confirmationNumber}</td></tr>
            <tr><td style="padding:6px 0;color:#6B7280">Quote #</td><td style="text-align:right">${quote.quoteNumber}</td></tr>
            <tr><td style="padding:6px 0;color:#6B7280">Client</td><td style="text-align:right;font-weight:600">${quote.client.firstName} ${quote.client.lastName}</td></tr>
            <tr><td style="padding:6px 0;color:#6B7280">Trip</td><td style="text-align:right">${quote.tripName}</td></tr>
            <tr><td style="padding:6px 0;color:#6B7280">Total</td><td style="text-align:right;font-weight:700;color:#059669">$${Number(quote.total).toLocaleString()}</td></tr>
            <tr><td style="padding:6px 0;color:#6B7280">Commission</td><td style="text-align:right;font-weight:600;color:#7C3AED">$${(Number(quote.agentMarkup) - Number(quote.agentMarkup) * (quote.agent.defaultCommission || 0.05)).toFixed(2)}</td></tr>
          </table>

          <div style="margin-top:20px;text-align:center">
            <a href="${baseUrl}/agent/bookings/${booking.id}" style="background:#E74035;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;font-size:14px">View Booking</a>
          </div>

          <div style="background:#ECFDF5;padding:12px;border-radius:8px;margin-top:16px">
            <p style="margin:0;font-size:13px;color:#065F46"><strong>No action needed:</strong> Fly2Any will process the reservations and issue e-tickets to your client.</p>
          </div>
        </div>
        <div style="text-align:center;padding:16px">
          <p style="color:#9CA3AF;font-size:12px;margin:0">Powered by <a href="${baseUrl}" style="color:#E74035;text-decoration:none">Fly2Any</a></p>
        </div>
      </div>
    `,
    tags: ['agent-quote-checkout', 'agent-notification'],
  });
}
