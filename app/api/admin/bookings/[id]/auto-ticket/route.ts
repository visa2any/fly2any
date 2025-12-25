/**
 * Auto-Ticket API - Triggers consolidator booking automation
 *
 * POST /api/admin/bookings/[id]/auto-ticket
 *
 * Automates manual ticketing via Playwright browser automation.
 * Ensures EXACT match with customer's original booking.
 *
 * Body params:
 * - dryRun: boolean (default: true) - If true, records booking but does NOT issue ticket
 * - issue: boolean (default: false) - If true, actually issues the ticket (alias for dryRun=false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import {
  ConsolidatorBookingAutomation,
  convertBookingToAutomationFormat,
} from '@/lib/automation/consolidator-booking';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiError(request, async () => {
    const bookingId = params.id;

    // Parse request body for options
    let dryRun = true; // DEFAULT: dry run (safe mode)
    try {
      const body = await request.json();
      // dryRun=true means record only, issue=true means actually book
      if (body.dryRun === false || body.issue === true) {
        dryRun = false;
      }
    } catch {
      // No body or invalid JSON - use defaults (dry run)
    }

    console.log('═══════════════════════════════════════════════════');
    console.log(`🤖 AUTO-TICKET REQUEST: ${bookingId}`);
    console.log(`   Mode: ${dryRun ? '📝 DRY RUN (record only)' : '🚀 LIVE (issue ticket)'}`);
    console.log('═══════════════════════════════════════════════════');

    // 1. Fetch booking from database
    const booking = await bookingStorage.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // 2. Verify booking requires manual ticketing
    const validStatuses = ['pending', 'pending_ticketing', 'confirmed'];
    if (!validStatuses.includes(booking.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking status is '${booking.status}', expected one of: ${validStatuses.join(', ')}`,
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

    const result = await automation.bookFlight(automationData, headless, dryRun);

    // 7. Handle results
    if (result.success) {
      // DRY RUN: Booking recorded but not issued
      if (dryRun) {
        console.log('📝 Dry run complete - booking recorded, not issued');

        // Update booking with consolidator details (preserving customer price)
        const profit = automationData.pricing.customerPaid - (result.consolidatorPrice || 0);

        await bookingStorage.update(bookingId, {
          status: 'pending_ticketing', // Still pending until manually issued
          consolidatorPrice: result.consolidatorPrice,
          consolidatorName: 'TheBestAgent.PRO',
          customerPrice: automationData.pricing.customerPaid, // PRESERVE original customer price
          markup: profit, // Track our profit
          ticketingNotes: `Recorded in consolidator on ${new Date().toISOString()}. Ready to issue. Expected profit: $${profit.toFixed(2)}`,
        });

        // Notify admin about dry run
        try {
          const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
          await notifyTelegramAdmins(`
📝 *AUTO-TICKET DRY RUN*

📋 *Booking:* \`${booking.bookingReference}\`
✈️ *Flight:* ${automationData.flights.segments[0]?.airline} ${automationData.flights.segments[0]?.flightNumber}
📍 *Route:* ${automationData.flights.segments[0]?.origin} → ${automationData.flights.segments[0]?.destination}
💰 *Consolidator Price:* $${result.consolidatorPrice}
💵 *Customer Paid:* $${automationData.pricing.customerPaid}
📈 *Expected Profit:* $${profit.toFixed(2)}

⚠️ Booking recorded but NOT issued. Review in consolidator portal.
          `.trim());
        } catch {}

        return NextResponse.json({
          success: true,
          dryRun: true,
          consolidatorPrice: result.consolidatorPrice,
          expectedProfit: profit,
          message: 'Booking recorded in consolidator (NOT issued). Review and issue manually.',
        });
      }

      // LIVE: Ticket issued - update booking with PNR
      if (result.pnr) {
        const profit = automationData.pricing.customerPaid - (result.consolidatorPrice || 0);

        await bookingStorage.update(bookingId, {
          status: 'confirmed',
          ticketingStatus: 'ticketed',
          airlineRecordLocator: result.pnr,
          consolidatorPrice: result.consolidatorPrice,
          consolidatorName: 'TheBestAgent.PRO',
          customerPrice: automationData.pricing.customerPaid, // PRESERVE original customer price
          markup: profit, // Track our profit
          netProfit: profit, // Final profit
          ticketedAt: new Date().toISOString(),
          ticketingNotes: `Auto-ticketed via automation on ${new Date().toISOString()}`,
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
          dryRun: false,
          pnr: result.pnr,
          consolidatorPrice: result.consolidatorPrice,
          message: 'Flight booked and ticketed successfully via consolidator',
        });
      }
    }

    // Failure case
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

  }, {
    category: ErrorCategory.BOOKING,
    severity: ErrorSeverity.CRITICAL
  });
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
