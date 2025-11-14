import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';
import { createBooking } from '@/lib/services/booking-flow-service';
import { processBookingForReferralPoints } from '@/lib/services/referralNetworkService';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

/**
 * Confirm Booking - Final Step in E2E Booking Flow
 *
 * 1. Confirms payment with Stripe
 * 2. Creates actual booking with Duffel
 * 3. Returns booking reference and confirmation details
 *
 * POST /api/booking-flow/confirm-booking
 *
 * Request Body:
 * {
 *   paymentIntentId: string,
 *   bookingState: BookingState,
 *   passengers: PassengerInfo[]
 * }
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, bookingState, passengers } = body;

    console.log('🎫 [Booking Flow] Confirming booking...');
    console.log(`   Payment Intent ID: ${paymentIntentId}`);
    console.log(`   Passengers: ${passengers?.length || 0}`);

    // Validation
    if (!paymentIntentId) {
      return NextResponse.json(
        {
          error: 'INVALID_PAYMENT_INTENT',
          message: 'Payment intent ID is required',
        },
        { status: 400 }
      );
    }

    if (!bookingState || !bookingState.selectedFlight) {
      return NextResponse.json(
        {
          error: 'INVALID_BOOKING_STATE',
          message: 'Booking state with selected flight is required',
        },
        { status: 400 }
      );
    }

    if (!passengers || passengers.length === 0) {
      return NextResponse.json(
        {
          error: 'INVALID_PASSENGERS',
          message: 'Passenger information is required',
        },
        { status: 400 }
      );
    }

    // STEP 1: Confirm payment with Stripe (if not mock)
    let paymentConfirmed = false;
    let paymentDetails = null;

    if (!paymentIntentId.startsWith('pi_mock_')) {
      if (!paymentService.isStripeAvailable()) {
        return NextResponse.json(
          {
            error: 'SERVICE_UNAVAILABLE',
            message: 'Payment service is currently unavailable',
          },
          { status: 503 }
        );
      }

      console.log('💳 Confirming payment with Stripe...');

      try {
        const payment = await paymentService.confirmPayment(paymentIntentId);

        console.log(`   Payment Status: ${payment.status}`);

        if (payment.status !== 'succeeded') {
          console.warn(`⚠️  Payment not successful: ${payment.status}`);

          return NextResponse.json(
            {
              success: false,
              paymentStatus: payment.status,
              message:
                payment.status === 'requires_action'
                  ? 'Payment requires additional authentication'
                  : payment.status === 'processing'
                  ? 'Payment is still being processed'
                  : 'Payment was not successful',
            },
            { status: 200 }
          );
        }

        paymentConfirmed = true;
        paymentDetails = payment;
        console.log('✅ Payment confirmed successfully');
      } catch (paymentError: any) {
        console.error('❌ Payment confirmation error:', paymentError);
        return NextResponse.json(
          {
            error: 'PAYMENT_CONFIRMATION_FAILED',
            message: 'Failed to confirm payment',
            details: paymentError.message,
          },
          { status: 500 }
        );
      }
    } else {
      console.log('🧪 Mock payment - skipping Stripe confirmation');
      paymentConfirmed = true;
    }

    // STEP 2: Create booking with Duffel
    console.log('🎫 Creating booking with Duffel...');

    try {
      // Transform passengers to Duffel format
      const duffelPassengers = passengers.map((p: any, index: number) => ({
        id: p.id || `passenger_${index}`,
        type: 'passenger',
        given_name: p.firstName?.toUpperCase() || '',
        family_name: p.lastName?.toUpperCase() || '',
        born_on: p.dateOfBirth || '1990-01-01',
        email: p.email || '',
        phone_number: p.phone || '',
        gender: p.gender === 'male' ? 'm' : 'f',
        title: p.title || 'mr',
        ...(p.passportNumber && {
          identity_documents: [
            {
              type: 'passport',
              unique_identifier: p.passportNumber,
              expires_on: p.passportExpiryDate || '',
              issuing_country_code: p.nationality || 'US',
            },
          ],
        }),
      }));

      // Payment method for Duffel (using balance for now since payment already confirmed)
      const paymentMethod = {
        type: 'balance',
        currency: bookingState.pricing?.currency || 'USD',
        amount: bookingState.pricing?.total?.toString() || '0',
      };

      const booking = await createBooking(
        bookingState,
        duffelPassengers,
        paymentMethod
      );

      console.log('✅ Booking created successfully');
      console.log(`   Booking Reference: ${booking.bookingReference}`);

      // STEP 3: Save booking to database & process referral points
      try {
        const session = await auth();
        const prisma = getPrismaClient();

        if (session?.user?.email) {
          // Get user
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
          });

          if (user) {
            // Extract trip dates from bookingState
            const flight = bookingState.selectedFlight;
            const departureDate = flight?.departure?.time
              ? new Date(flight.departure.time)
              : new Date();
            const arrivalDate = flight?.arrival?.time
              ? new Date(flight.arrival.time)
              : new Date(departureDate.getTime() + 24 * 60 * 60 * 1000); // +1 day default

            // Determine product type
            let productType = 'flight';
            if (bookingState.pricing?.total && bookingState.pricing.total > 1000) {
              productType = 'flight_international'; // Assume international if > $1000
            }

            // Process referral points (async, don't block response)
            processBookingForReferralPoints({
              bookingId: booking.bookingReference,
              userId: user.id,
              amount: bookingState.pricing?.total || 0,
              currency: bookingState.pricing?.currency || 'USD',
              productType,
              tripStartDate: departureDate,
              tripEndDate: arrivalDate,
              productData: {
                flightNumber: flight?.flightNumber,
                airline: flight?.airline,
                route: `${flight?.departure?.airportCode} → ${flight?.arrival?.airportCode}`,
              },
            }).catch((err) => {
              console.error('⚠️ Failed to process referral points:', err);
              // Don't fail booking if referral points fail
            });

            console.log('✅ Referral points processing initiated');
          }
        }
      } catch (referralError) {
        console.error('⚠️ Error processing referral points:', referralError);
        // Don't fail booking if referral points fail
      }

      // STEP 4: Return success response
      return NextResponse.json(
        {
          success: true,
          booking: {
            bookingReference: booking.bookingReference,
            pnr: booking.bookingReference, // PNR is same as booking reference
            confirmationEmail: booking.confirmationEmail,
          },
          payment: paymentDetails
            ? {
                paymentIntentId: paymentDetails.paymentIntentId,
                status: paymentDetails.status,
                amount: paymentDetails.amount,
                currency: paymentDetails.currency,
                cardLast4: paymentDetails.last4,
                cardBrand: paymentDetails.brand,
              }
            : undefined,
          message: 'Booking confirmed successfully!',
        },
        { status: 201 }
      );

    } catch (bookingError: any) {
      console.error('❌ Booking creation error:', bookingError);

      // Payment succeeded but booking failed - critical situation
      if (paymentConfirmed) {
        console.error('🚨 CRITICAL: Payment confirmed but booking failed!');
        console.error('   Payment Intent ID:', paymentIntentId);
        console.error('   Action Required: Manual booking creation or refund');

        return NextResponse.json(
          {
            error: 'BOOKING_CREATION_FAILED',
            message:
              'Payment was processed but booking creation failed. Our team will contact you shortly.',
            criticalError: true,
            paymentIntentId,
            details: bookingError.message,
          },
          { status: 500 }
        );
      }

      // Payment not confirmed, booking failed - safe to return error
      return NextResponse.json(
        {
          error: 'BOOKING_CREATION_FAILED',
          message: 'Failed to create booking',
          details: bookingError.message,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ [Booking Flow] Confirm booking error:', error);

    return NextResponse.json(
      {
        error: 'BOOKING_CONFIRMATION_FAILED',
        message: error.message || 'Failed to confirm booking',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
