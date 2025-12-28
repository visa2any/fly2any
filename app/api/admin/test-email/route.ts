export const dynamic = 'force-dynamic';

/**
 * Admin Test Email API
 *
 * Send test emails to verify Mailgun integration and email templates
 * POST /api/admin/test-email
 *
 * Body: { type: string, email: string }
 * Types: flight_booking, hotel_booking, price_alert, welcome, password_reset, newsletter, credits
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EmailService } from '@/lib/services/email-service';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Auth check - require admin
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin via AdminUser table
    const adminUser = await prisma?.adminUser.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { email: true } } },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const userEmail = adminUser.user.email;

    const body = await request.json();
    const { type, email: targetEmail } = body;

    // Use provided email or admin's email
    const testEmail = targetEmail || userEmail;

    if (!testEmail) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 });
    }

    let success = false;
    let emailType = type;

    switch (type) {
      case 'flight_booking':
        success = await EmailService.sendFlightBookingConfirmation(testEmail, {
          userName: 'Test User',
          bookingReference: 'FLY2ANY-TEST-123',
          flightNumber: 'AA1234',
          airline: 'American Airlines',
          origin: 'JFK',
          originCity: 'New York',
          destination: 'LAX',
          destinationCity: 'Los Angeles',
          departureDate: 'January 15, 2025',
          departureTime: '08:30 AM',
          arrivalTime: '11:45 AM',
          passengers: 2,
          cabinClass: 'Business',
          totalPrice: 1250.00,
          currency: 'USD',
          bookingUrl: 'https://www.fly2any.com/bookings/test',
        });
        break;

      case 'hotel_booking':
        success = await EmailService.sendHotelBookingConfirmation(testEmail, {
          userName: 'Test User',
          bookingReference: 'HTL-TEST-456',
          hotelName: 'Grand Hyatt Miami Beach',
          location: 'Miami Beach, FL, USA',
          checkIn: 'January 20, 2025',
          checkOut: 'January 23, 2025',
          nights: 3,
          roomType: 'Deluxe Ocean View Suite',
          guests: 2,
          totalPrice: 899.00,
          currency: 'USD',
          bookingUrl: 'https://www.fly2any.com/hotels/booking/test',
        });
        break;

      case 'price_alert':
        success = await EmailService.sendPriceAlert(testEmail, {
          userName: 'Test User',
          origin: 'New York (JFK)',
          destination: 'Paris (CDG)',
          oldPrice: 850,
          newPrice: 599,
          currency: 'USD',
          savings: 251,
          savingsPercent: 30,
          searchUrl: 'https://www.fly2any.com/flights?origin=JFK&destination=CDG',
          expiresAt: 'January 10, 2025',
        });
        break;

      case 'welcome':
        success = await EmailService.sendWelcomeEmail(testEmail, {
          userName: 'Test User',
          welcomeCredits: 50,
          browseUrl: 'https://www.fly2any.com/deals',
          createUrl: 'https://www.fly2any.com/trips/create',
        });
        break;

      case 'password_reset':
        success = await EmailService.sendPasswordReset(testEmail, {
          userName: 'Test User',
          resetUrl: 'https://www.fly2any.com/auth/reset-password?token=test-token',
          expiresIn: '1 hour',
        });
        break;

      case 'newsletter':
        success = await EmailService.sendNewsletterConfirmation(testEmail, {
          email: testEmail,
          firstName: 'Test',
        });
        break;

      case 'credits':
        success = await EmailService.sendCreditsEarned(testEmail, {
          userName: 'Test User',
          creditsEarned: 250,
          usdValue: 25.00,
          tripTitle: 'Weekend in Paris',
          dashboardUrl: 'https://www.fly2any.com/dashboard/credits',
        });
        break;

      case 'trip_booking':
        success = await EmailService.sendTripBookingConfirmation(testEmail, {
          userName: 'Test User',
          tripTitle: 'Romantic Paris Getaway',
          tripDestination: 'Paris, France',
          tripDate: 'February 14, 2025',
          amount: 2500.00,
          tripUrl: 'https://www.fly2any.com/trips/test',
        });
        break;

      default:
        return NextResponse.json(
          {
            error: 'Invalid email type',
            validTypes: [
              'flight_booking',
              'hotel_booking',
              'price_alert',
              'welcome',
              'password_reset',
              'newsletter',
              'credits',
              'trip_booking'
            ]
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success,
      message: success
        ? `Test ${emailType} email sent to ${testEmail}`
        : `Failed to send ${emailType} email`,
      email: testEmail,
      type: emailType,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[TEST_EMAIL_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    );
  }
}

// GET - Return available email types
export async function GET() {
  return NextResponse.json({
    availableTypes: [
      { type: 'flight_booking', description: 'Flight booking confirmation email' },
      { type: 'hotel_booking', description: 'Hotel booking confirmation email' },
      { type: 'price_alert', description: 'Price drop alert email' },
      { type: 'welcome', description: 'Welcome email for new users' },
      { type: 'password_reset', description: 'Password reset email' },
      { type: 'newsletter', description: 'Newsletter subscription confirmation' },
      { type: 'credits', description: 'Credits earned notification' },
      { type: 'trip_booking', description: 'Trip booking confirmation' },
    ],
    usage: {
      method: 'POST',
      body: '{ "type": "flight_booking", "email": "optional@email.com" }',
      note: 'If email not provided, sends to admin email',
    },
  });
}
