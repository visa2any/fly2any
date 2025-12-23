/**
 * AI Booking Lookup API
 *
 * Allows customers to check their booking status through the AI chat.
 * David Park (Payment Specialist) handles these queries.
 *
 * SECURITY HARDENED:
 * - Rate limited (10 req/min to prevent brute force)
 * - Requires booking reference + email + lastName
 * - Failed attempts logged for security monitoring
 *
 * POST /api/ai/booking-lookup
 *
 * Request:
 * - bookingReference: string (e.g., "FLY2A-ABC123") - REQUIRED
 * - email: string - REQUIRED
 * - lastName: string - REQUIRED
 *
 * Response:
 * - booking details with status, e-tickets, PNR if available
 */

import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import { auth } from '@/lib/auth';
import { checkRateLimit, addRateLimitHeaders, getClientIP } from '@/lib/security/rate-limiter';

// Strict rate limit to prevent brute force attacks
const LOOKUP_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'booking-lookup',
};

// Track failed attempts for security logging
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

function logFailedAttempt(ip: string, reference: string, reason: string) {
  const key = `${ip}:${reference}`;
  const now = Date.now();
  const existing = failedAttempts.get(key) || { count: 0, lastAttempt: 0 };

  // Reset if last attempt was more than 1 hour ago
  if (now - existing.lastAttempt > 60 * 60 * 1000) {
    existing.count = 0;
  }

  existing.count++;
  existing.lastAttempt = now;
  failedAttempts.set(key, existing);

  // Log suspicious activity (3+ failures)
  if (existing.count >= 3) {
    console.warn(`[SECURITY] Suspicious booking lookup from ${ip}: ref=${reference}, reason=${reason}, attempts=${existing.count}`);
  }
}

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
  const ip = getClientIP(request);

  // === RATE LIMITING ===
  const rateLimitResult = await checkRateLimit(request, LOOKUP_RATE_LIMIT);
  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      {
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many lookup attempts. Please wait a moment and try again.',
        retryAfter: rateLimitResult.retryAfter,
      },
      { status: 429 }
    );
    addRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  try {
    const body = await request.json();
    const { bookingReference, email, lastName } = body;

    // === REQUIRED FIELDS VALIDATION ===
    // Booking reference is required
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

    // Email is REQUIRED (security hardening)
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'EMAIL_REQUIRED',
          message: 'Please provide the email address used for the booking.',
        },
        { status: 400 }
      );
    }

    // Last name is REQUIRED (security hardening)
    if (!lastName || typeof lastName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'LASTNAME_REQUIRED',
          message: 'Please provide the last name of the primary passenger.',
        },
        { status: 400 }
      );
    }

    // Normalize booking reference (uppercase, trim)
    const normalizedRef = bookingReference.trim().toUpperCase();

    // Lookup booking
    const booking = await bookingStorage.findByReferenceAsync(normalizedRef);

    if (!booking) {
      logFailedAttempt(ip, normalizedRef, 'NOT_FOUND');
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: 'No booking found. Please verify your booking reference, email, and last name.',
          suggestions: [
            'Make sure the reference is correct (format: FLY2A-XXXXXX)',
            'Check your confirmation email for the exact reference',
            'Contact our support team if you need assistance',
          ],
        },
        { status: 404 }
      );
    }

    // === VERIFY EMAIL MATCHES (REQUIRED) ===
    const bookingEmail = booking.contactInfo?.email?.toLowerCase();
    if (!bookingEmail || email.toLowerCase().trim() !== bookingEmail) {
      logFailedAttempt(ip, normalizedRef, 'EMAIL_MISMATCH');
      return NextResponse.json(
        {
          success: false,
          error: 'VERIFICATION_FAILED',
          message: 'The details provided do not match the booking. Please verify your information.',
        },
        { status: 403 }
      );
    }

    // === VERIFY LAST NAME MATCHES (REQUIRED) ===
    const primaryPassenger = booking.passengers?.[0];
    const bookingLastName = primaryPassenger?.lastName?.toLowerCase();
    if (!bookingLastName || lastName.toLowerCase().trim() !== bookingLastName) {
      logFailedAttempt(ip, normalizedRef, 'LASTNAME_MISMATCH');
      return NextResponse.json(
        {
          success: false,
          error: 'VERIFICATION_FAILED',
          message: 'The details provided do not match the booking. Please verify your information.',
        },
        { status: 403 }
      );
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
 * GET - Lookup via query params (requires all verification fields)
 * GET /api/ai/booking-lookup?ref=FLY2A-ABC123&email=test@example.com&lastName=Smith
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref');
  const email = request.nextUrl.searchParams.get('email');
  const lastName = request.nextUrl.searchParams.get('lastName');

  if (!ref || !email || !lastName) {
    return NextResponse.json(
      {
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Please provide ref, email, and lastName query parameters.',
      },
      { status: 400 }
    );
  }

  // Forward to POST handler with all required fields
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ bookingReference: ref, email, lastName }),
  });

  return POST(postRequest);
}
