/**
 * AI Booking Lookup API
 *
 * Allows customers to check their booking status through the AI chat.
 * David Park (Payment Specialist) handles these queries.
 *
 * POST /api/ai/booking-lookup
 *
 * Request:
 * - bookingReference: string (e.g., "FLY2A-ABC123")
 * - email?: string (optional, for verification)
 *
 * Response:
 * - booking details with status, e-tickets, PNR if available
 */

import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Status display mapping
const STATUS_DISPLAY = {
  pending_ticketing: {
    emoji: '⏳',
    label: 'Processing',
    description: 'Your booking is being processed. You will receive your e-ticket within 1-2 hours.',
    color: 'orange',
  },
  ticketed: {
    emoji: '✅',
    label: 'Ticketed',
    description: 'Your ticket has been issued! Check your email for the e-ticket.',
    color: 'green',
  },
  confirmed: {
    emoji: '✈️',
    label: 'Confirmed',
    description: 'Your flight is confirmed and ready for travel.',
    color: 'blue',
  },
  cancelled: {
    emoji: '❌',
    label: 'Cancelled',
    description: 'This booking has been cancelled.',
    color: 'red',
  },
  completed: {
    emoji: '🎉',
    label: 'Completed',
    description: 'Your trip has been completed. Thank you for flying with us!',
    color: 'gray',
  },
  pending: {
    emoji: '🕐',
    label: 'Pending',
    description: 'Awaiting confirmation.',
    color: 'yellow',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingReference, email } = body;

    // Validate booking reference
    if (!bookingReference || typeof bookingReference !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_REFERENCE',
          message: 'Please provide a valid booking reference (e.g., FLY2A-ABC123)',
        },
        { status: 400 }
      );
    }

    // Normalize booking reference (uppercase, trim)
    const normalizedRef = bookingReference.trim().toUpperCase();

    // Lookup booking
    const booking = await bookingStorage.findByReferenceAsync(normalizedRef);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: `No booking found with reference ${normalizedRef}. Please check the reference and try again.`,
          suggestions: [
            'Make sure the reference is correct (format: FLY2A-XXXXXX)',
            'Check your confirmation email for the exact reference',
            'Contact our support team if you need assistance',
          ],
        },
        { status: 404 }
      );
    }

    // Optional: Verify email matches (security)
    if (email) {
      const bookingEmail = booking.contactInfo?.email?.toLowerCase();
      if (bookingEmail && email.toLowerCase() !== bookingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'EMAIL_MISMATCH',
            message: 'The email provided does not match the booking. Please verify your email address.',
          },
          { status: 403 }
        );
      }
    }

    // Get status display info
    const statusInfo = STATUS_DISPLAY[booking.status as keyof typeof STATUS_DISPLAY] || {
      emoji: '📋',
      label: booking.status,
      description: 'Status unknown',
      color: 'gray',
    };

    // Build flight summary
    const flight = booking.flight;
    const firstSegment = flight.segments[0];
    const lastSegment = flight.segments[flight.segments.length - 1];
    const route = `${firstSegment.departure.iataCode} → ${lastSegment.arrival.iataCode}`;
    const departureDate = new Date(firstSegment.departure.at).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const departureTime = new Date(firstSegment.departure.at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Build passenger summary
    const passengerNames = booking.passengers
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join(', ');

    // Build response
    const response = {
      success: true,
      booking: {
        reference: booking.bookingReference,
        status: {
          code: booking.status,
          ...statusInfo,
        },
        flight: {
          route,
          departureDate,
          departureTime,
          flightNumber: `${firstSegment.carrierCode}${firstSegment.flightNumber}`,
          cabinClass: firstSegment.class,
          segments: flight.segments.length,
        },
        passengers: {
          count: booking.passengers.length,
          names: passengerNames,
        },
        price: {
          total: booking.payment.amount,
          currency: booking.payment.currency,
        },
        // Include ticketing info if available
        ticketing: booking.status === 'ticketed' || (booking as any).ticketingStatus === 'ticketed'
          ? {
              pnr: (booking as any).airlineRecordLocator || null,
              etickets: (booking as any).eticketNumbers || [],
              ticketedAt: (booking as any).ticketedAt || null,
            }
          : null,
        // Include estimated time for pending bookings
        estimated:
          booking.status === 'pending_ticketing'
            ? {
                ticketingTime: '1-2 hours',
                message: 'Our team is processing your booking. You will receive your e-ticket via email.',
              }
            : null,
        createdAt: booking.createdAt,
      },
      // AI-friendly summary for chat response
      summary: {
        headline: `${statusInfo.emoji} Booking ${normalizedRef}: ${statusInfo.label}`,
        details: [
          `✈️ Flight: ${route} on ${departureDate}`,
          `🕐 Departure: ${departureTime}`,
          `👥 Passengers: ${booking.passengers.length}`,
          `💰 Total: ${booking.payment.currency} ${booking.payment.amount.toLocaleString()}`,
        ],
        ticketing:
          booking.status === 'ticketed'
            ? {
                pnr: (booking as any).airlineRecordLocator,
                etickets: (booking as any).eticketNumbers,
              }
            : null,
        nextSteps:
          booking.status === 'pending_ticketing'
            ? [
                'Your ticket is being processed',
                'You will receive an email with your e-ticket within 1-2 hours',
                'No action needed from you at this time',
              ]
            : booking.status === 'ticketed'
            ? [
                'Your ticket has been issued!',
                `Your airline PNR is: ${(booking as any).airlineRecordLocator || 'Check email'}`,
                'Check your email for the complete e-ticket',
                'Arrive at the airport 2-3 hours before departure',
              ]
            : [],
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error in booking lookup:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'LOOKUP_FAILED',
        message: 'Sorry, I encountered an error looking up your booking. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Allow simple lookup via query params
 * GET /api/ai/booking-lookup?ref=FLY2A-ABC123
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref');

  if (!ref) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_REFERENCE',
        message: 'Please provide a booking reference using ?ref=FLY2A-XXXXXX',
      },
      { status: 400 }
    );
  }

  // Forward to POST handler
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ bookingReference: ref }),
  });

  return POST(postRequest);
}
