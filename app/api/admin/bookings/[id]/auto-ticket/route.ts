/**
 * Auto-Ticket API - Triggers consolidator booking automation
 *
 * POST /api/admin/bookings/[id]/auto-ticket
 *
 * Automates manual ticketing via Playwright browser automation.
 * Ensures EXACT match with customer's original booking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { bookingStorage } from '@/lib/bookings/storage';
import {
  ConsolidatorBookingAutomation,
  convertBookingToAutomationFormat,
} from '@/lib/automation/consolidator-booking';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    console.log('═══════════════════════════════════════════════════');
    console.log(`🤖 AUTO-TICKET REQUEST: ${bookingId}`);
    console.log('═══════════════════════════════════════════════════');

    // 1. Fetch booking from database
    const booking = await bookingStorage.getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 2. Verify booking requires manual ticketing
    if (booking.status !== 'pending_ticketing' && booking.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: `Booking status is '${booking.status}', expected 'pending_ticketing'`,
        },
        { status: 400 }
      );
    }

    // 3. Verify source is Amadeus/GDS (manual ticketing)
    const source = booking.sourceApi || booking.provider;
    if (source === 'Duffel') {
      return NextResponse.json(
        {
          success: false,
          error: 'Duffel bookings are auto-ticketed, no manual action needed',
        },
        { status: 400 }
      );
    }

    // 4. Convert to automation format
    const automationData = convertBookingToAutomationFormat(booking);

    console.log('📋 Automation Data:');
    console.log(`   Booking: ${automationData.bookingReference}`);
    console.log(`   Flight: ${automationData.flights.segments[0]?.airline} ${automationData.flights.segments[0]?.flightNumber}`);
    console.log(`   Route: ${automationData.flights.segments[0]?.origin} → ${automationData.flights.segments[0]?.destination}`);
    console.log(`   Date: ${automationData.flights.segments[0]?.departureDate}`);
    console.log(`   Passengers: ${automationData.passengers.length}`);
    console.log(`   Customer Paid: $${automationData.pricing.customerPaid}`);

    // 5. Check if consolidator credentials are configured
    if (!process.env.CONSOLIDATOR_EMAIL || !process.env.CONSOLIDATOR_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: 'Consolidator credentials not configured. Set CONSOLIDATOR_EMAIL and CONSOLIDATOR_PASSWORD in environment.',
        },
        { status: 500 }
      );
    }

    // 6. Run automation
    const automation = new ConsolidatorBookingAutomation();
    const headless = process.env.NODE_ENV === 'production'; // Visible in dev for debugging

    const result = await automation.bookFlight(automationData, headless);

    // 7. Update booking with results
    if (result.success && result.pnr) {
      const prisma = await getPrismaClient();

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'confirmed',
          airlineRecordLocator: result.pnr,
          consolidatorPrice: result.consolidatorPrice,
          consolidatorName: 'TheBestAgent.PRO',
          ticketingNotes: `Auto-ticketed via automation on ${new Date().toISOString()}`,
          updatedAt: new Date(),
        },
      });

      // Notify admin
      try {
        const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
        await notifyTelegramAdmins(`
✅ *AUTO-TICKET SUCCESS*

📋 *Booking:* \`${booking.bookingReference}\`
🎫 *PNR:* \`${result.pnr}\`
✈️ *Flight:* ${automationData.flights.segments[0]?.airline} ${automationData.flights.segments[0]?.flightNumber}
📍 *Route:* ${automationData.flights.segments[0]?.origin} → ${automationData.flights.segments[0]?.destination}
💰 *Consolidator:* $${result.consolidatorPrice}
💵 *Customer Paid:* $${automationData.pricing.customerPaid}
📈 *Profit:* $${(automationData.pricing.customerPaid - (result.consolidatorPrice || 0)).toFixed(2)}
        `.trim());
      } catch {}

      console.log('✅ Booking updated with PNR:', result.pnr);

      return NextResponse.json({
        success: true,
        pnr: result.pnr,
        consolidatorPrice: result.consolidatorPrice,
        message: 'Flight booked successfully via consolidator',
      });

    } else {
      // Notify admin of failure
      try {
        const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
        await notifyTelegramAdmins(`
❌ *AUTO-TICKET FAILED*

📋 *Booking:* \`${booking.bookingReference}\`
✈️ *Flight:* ${automationData.flights.segments[0]?.airline} ${automationData.flights.segments[0]?.flightNumber}
📍 *Route:* ${automationData.flights.segments[0]?.origin} → ${automationData.flights.segments[0]?.destination}
⚠️ *Error:* ${result.error}

Please ticket manually.
        `.trim());
      } catch {}

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Automation failed',
          screenshots: result.screenshots,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Auto-ticket error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check automation status/availability
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const hasCredentials = !!(process.env.CONSOLIDATOR_EMAIL && process.env.CONSOLIDATOR_PASSWORD);

  return NextResponse.json({
    available: hasCredentials,
    consolidator: 'TheBestAgent.PRO',
    message: hasCredentials
      ? 'Auto-ticketing is available'
      : 'Configure CONSOLIDATOR_EMAIL and CONSOLIDATOR_PASSWORD to enable',
  });
}
