export const dynamic = 'force-dynamic';

/**
 * Admin API — Agent Booking Detail + Actions
 * GET /api/admin/agent-bookings/[id]   — Get booking detail
 * PATCH /api/admin/agent-bookings/[id] — Update booking (confirm, add confirmations, notes)
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/middleware";
import { resendClient } from "@/lib/email/resend-client";

// GET — Full booking detail for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const booking = await prisma!.agentBooking.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        agent: {
          include: { user: { select: { email: true, name: true } } },
        },
        quote: {
          select: {
            id: true, quoteNumber: true, shareableLink: true,
            createdAt: true, sentAt: true, acceptedAt: true, convertedAt: true,
            agentMarkupPercent: true, inclusions: true, exclusions: true,
            termsAndConditions: true,
          },
        },
        commissions: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Parse passenger data
    let passengerData = null;
    try {
      if (booking.notes) {
        const parsed = JSON.parse(booking.notes);
        if (parsed.passengers) passengerData = parsed;
      }
    } catch { /* plain text */ }

    return NextResponse.json({
      booking,
      passengerData,
    });
  } catch (error) {
    console.error("[ADMIN_AGENT_BOOKING_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

// PATCH — Admin updates booking (confirm, add supplier confirmations, notes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const adminCtx = authResult as { userId: string; userEmail: string };

  try {
    const booking = await prisma!.agentBooking.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        agent: { include: { user: { select: { email: true } } } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      status,
      flightConfirmations,
      hotelConfirmations,
      activityConfirmations,
      transferConfirmations,
      carRentalConfirmations,
      adminNotes,
      sendConfirmationEmail,
    } = body;

    // Build update data
    const updateData: any = {};

    if (status) updateData.status = status;
    if (flightConfirmations !== undefined) updateData.flightConfirmations = flightConfirmations;
    if (hotelConfirmations !== undefined) updateData.hotelConfirmations = hotelConfirmations;
    if (activityConfirmations !== undefined) updateData.activityConfirmations = activityConfirmations;
    if (transferConfirmations !== undefined) updateData.transferConfirmations = transferConfirmations;
    if (carRentalConfirmations !== undefined) updateData.carRentalConfirmations = carRentalConfirmations;

    // Append admin notes to existing notes
    if (adminNotes) {
      let existingNotes: any = {};
      try {
        if (booking.notes) existingNotes = JSON.parse(booking.notes);
      } catch { existingNotes = { plainNotes: booking.notes }; }
      existingNotes.adminNotes = adminNotes;
      existingNotes.confirmedBy = adminCtx.userEmail;
      existingNotes.confirmedAt = new Date().toISOString();
      updateData.notes = JSON.stringify(existingNotes);
    }

    // If status is CONFIRMED and email requested, mark it
    if (status === "CONFIRMED") {
      updateData.confirmationEmailSent = true;
    }

    const updated = await prisma!.agentBooking.update({
      where: { id: params.id },
      data: updateData,
      include: { client: true, agent: true },
    });

    // Send confirmation email to client if requested
    if (sendConfirmationEmail && booking.client?.email) {
      const agentName = booking.agent.agencyName || booking.agent.businessName ||
        `${booking.agent.firstName || ''} ${booking.agent.lastName || ''}`.trim() || 'Fly2Any';

      sendBookingConfirmedEmail(
        booking.client.email,
        booking.confirmationNumber,
        booking.tripName,
        booking.destination,
        booking.startDate,
        booking.endDate,
        booking.travelers,
        Number(booking.total),
        agentName,
        flightConfirmations,
        hotelConfirmations
      ).catch(err => console.error("[ADMIN_CONFIRM_EMAIL_ERROR]", err));

      // Also notify agent
      if (booking.agent?.user?.email) {
        resendClient.send({
          to: booking.agent.user.email,
          subject: `✅ Booking Confirmed by Fly2Any — ${booking.confirmationNumber}`,
          html: `
            <h2>Booking Confirmed!</h2>
            <p>Fly2Any has confirmed booking <strong>${booking.confirmationNumber}</strong> for <strong>${booking.client.firstName} ${booking.client.lastName}</strong>.</p>
            <p>Trip: ${booking.tripName} — ${booking.destination}</p>
            <p>Total: $${Number(booking.total).toLocaleString()}</p>
            ${flightConfirmations ? `<p>Flight PNR: ${JSON.stringify(flightConfirmations)}</p>` : ''}
            ${hotelConfirmations ? `<p>Hotel Conf: ${JSON.stringify(hotelConfirmations)}</p>` : ''}
            <p><a href="${process.env.NEXTAUTH_URL}/agent/bookings/${booking.id}" style="background:#E74035;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;display:inline-block;margin-top:10px">View Booking</a></p>
          `,
          tags: ['admin-booking-confirmed'],
        }).catch(err => console.error("[ADMIN_AGENT_NOTIFY_ERROR]", err));
      }
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("[ADMIN_AGENT_BOOKING_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

// ── Email helper ────────────────────────────────────────────

async function sendBookingConfirmedEmail(
  clientEmail: string,
  confirmationNumber: string,
  tripName: string,
  destination: string,
  startDate: Date,
  endDate: Date,
  travelers: number,
  total: number,
  agentName: string,
  flightConfirmations?: any,
  hotelConfirmations?: any,
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.fly2any.com';

  let confirmationDetails = '';
  if (flightConfirmations) {
    const confs = Array.isArray(flightConfirmations) ? flightConfirmations : [flightConfirmations];
    confirmationDetails += confs.map((c: any) =>
      `<tr><td style="padding:8px;color:#6B7280">Flight PNR</td><td style="text-align:right;font-weight:600;font-family:monospace">${c.pnr || c.recordLocator || c}</td></tr>`
    ).join('');
  }
  if (hotelConfirmations) {
    const confs = Array.isArray(hotelConfirmations) ? hotelConfirmations : [hotelConfirmations];
    confirmationDetails += confs.map((c: any) =>
      `<tr><td style="padding:8px;color:#6B7280">Hotel Confirmation</td><td style="text-align:right;font-weight:600;font-family:monospace">${c.confirmationNumber || c}</td></tr>`
    ).join('');
  }

  await resendClient.send({
    to: clientEmail,
    subject: `🎫 Your Reservations Are Confirmed — ${confirmationNumber}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#059669,#047857);padding:32px;text-align:center;border-radius:16px 16px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">Reservations Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Your trip is ready</p>
        </div>
        <div style="background:#1a1a1a;padding:20px;text-align:center">
          <p style="color:#9CA3AF;margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px">Confirmation Number</p>
          <p style="color:#F7C928;margin:0;font-size:28px;font-weight:bold;letter-spacing:2px;font-family:monospace">${confirmationNumber}</p>
        </div>
        <div style="background:white;padding:24px;border:1px solid #E5E7EB">
          <h2 style="margin:0 0 16px;font-size:18px;color:#111">${tripName}</h2>
          <table style="width:100%;font-size:14px;color:#374151">
            <tr><td style="padding:8px 0;color:#6B7280">Destination</td><td style="text-align:right;font-weight:600">${destination}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Dates</td><td style="text-align:right;font-weight:600">${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Travelers</td><td style="text-align:right;font-weight:600">${travelers} guests</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280">Total</td><td style="text-align:right;font-weight:700;color:#059669;font-size:18px">$${total.toLocaleString()}</td></tr>
            ${confirmationDetails}
          </table>
        </div>
        <div style="background:#ECFDF5;padding:16px;border:1px solid #A7F3D0;border-top:none">
          <p style="margin:0;font-size:13px;color:#065F46"><strong>All set!</strong> Your reservations have been confirmed. E-tickets and vouchers are attached or will follow shortly.</p>
        </div>
        <div style="background:#F9FAFB;padding:16px;text-align:center;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 16px 16px">
          <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF">Your Travel Agent</p>
          <p style="margin:0;font-size:14px;font-weight:600;color:#111">${agentName}</p>
        </div>
        <div style="text-align:center;padding:16px">
          <p style="color:#9CA3AF;font-size:12px;margin:0">Powered by <a href="${baseUrl}" style="color:#E74035;text-decoration:none">Fly2Any</a></p>
        </div>
      </div>
    `,
    tags: ['booking-confirmed', 'admin-processed'],
  });
}
