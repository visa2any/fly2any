import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';
import { createBooking } from '@/lib/services/booking-flow-service';
import { processBookingForReferralPoints, calculateDefaultCommission } from '@/lib/services/referralNetworkService';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { bookingStorage } from '@/lib/bookings/storage';
import { notifyNewBooking, notifyTelegramAdmins, sendAdminAlert } from '@/lib/notifications/notification-service';
import { triggerEmailEvent } from '@/lib/email/event-triggers';
import { campaignEngine } from '@/lib/email/campaign-flows';
import type { Booking, FlightSegment, Passenger, PaymentInfo, ContactInfo } from '@/lib/bookings/types';
import type { BookingNotificationPayload } from '@/lib/notifications/types';

/**
 * Confirm Booking - Final Step in E2E Booking Flow
 *
 * NEW FLOW (Manual Ticketing Model):
 * 1. Saves booking to OUR database with status "pending_ticketing"
 * 2. DOES NOT create Duffel order (saves API fees)
 * 3. DOES NOT charge payment (admin will charge via consolidator)
 * 4. Returns our booking reference for customer tracking
 *
 * Admin will:
 * - See booking in dashboard
 * - Book manually via consolidator
 * - Enter e-ticket and PNR
 * - Mark as ticketed
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

    console.log('🎫 [Booking Flow] Processing booking request...');
    console.log(`   Payment Intent ID: ${paymentIntentId}`);
    console.log(`   Passengers: ${passengers?.length || 0}`);

    // Validation
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

    // CRITICAL FIX: Get contact info from ANY passenger, not just first
    // Try primary passenger first, then fall back to any passenger with contact info
    const primaryPassenger = passengers[0];
    let contactEmail = primaryPassenger.email || '';
    let contactPhone = primaryPassenger.phone || '';

    // If primary passenger is missing contact info, search other passengers
    if (!contactEmail || !contactPhone) {
      for (const passenger of passengers) {
        if (!contactEmail && passenger.email) {
          contactEmail = passenger.email;
        }
        if (!contactPhone && passenger.phone) {
          contactPhone = passenger.phone;
        }
        if (contactEmail && contactPhone) break;
      }
    }

    const contactInfo: ContactInfo = {
      email: contactEmail,
      phone: contactPhone,
    };

    // Warn if contact info is still incomplete
    if (!contactInfo.email) {
      console.warn('⚠️ No email found in any passenger record');
    }

    // Transform booking state flight to our FlightData format
    const selectedFlight = bookingState.selectedFlight;
    const flightType: 'one-way' | 'round-trip' = bookingState.returnFlight ? 'round-trip' : 'one-way';
    const flightData = {
      id: selectedFlight.offerId || selectedFlight.id || `flight_${Date.now()}`,
      type: flightType,
      segments: [{
        id: `seg_${Date.now()}`,
        departure: {
          iataCode: selectedFlight.departure?.airportCode || '',
          terminal: selectedFlight.departure?.terminal,
          at: selectedFlight.departure?.time || new Date().toISOString(),
        },
        arrival: {
          iataCode: selectedFlight.arrival?.airportCode || '',
          terminal: selectedFlight.arrival?.terminal,
          at: selectedFlight.arrival?.time || new Date().toISOString(),
        },
        carrierCode: selectedFlight.flightNumber?.split(' ')[0] || selectedFlight.airline?.substring(0, 2) || 'XX',
        flightNumber: selectedFlight.flightNumber?.split(' ')[1] || selectedFlight.flightNumber || '000',
        aircraft: selectedFlight.aircraft,
        duration: selectedFlight.duration || 'PT0H0M',
        class: (selectedFlight.cabinClass || 'economy') as 'economy' | 'premium_economy' | 'business' | 'first',
      }] as FlightSegment[],
      price: {
        total: bookingState.pricing?.total || selectedFlight.price || 0,
        base: bookingState.pricing?.base || selectedFlight.price || 0,
        taxes: bookingState.pricing?.taxes || 0,
        fees: bookingState.pricing?.fees || 0,
        currency: bookingState.pricing?.currency || selectedFlight.currency || 'USD',
      },
      validatingAirlineCodes: [selectedFlight.flightNumber?.split(' ')[0] || 'XX'],
    };

    // Transform passengers to our format
    const transformedPassengers: Passenger[] = passengers.map((p: any, index: number) => ({
      id: p.id || `pax_${index + 1}`,
      type: (p.type || 'adult') as 'adult' | 'child' | 'infant',
      title: (p.title || 'Mr') as 'Mr' | 'Ms' | 'Mrs' | 'Dr',
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      dateOfBirth: p.dateOfBirth || '',
      nationality: p.nationality || 'US',
      passportNumber: p.passportNumber,
      passportExpiry: p.passportExpiryDate,
      email: p.email,
      phone: p.phone,
      frequentFlyerAirline: p.frequentFlyerAirline,
      frequentFlyerNumber: p.frequentFlyerNumber,
    }));

    // Payment info - SAVED but NOT CHARGED (admin will charge via consolidator)
    const paymentInfo: PaymentInfo = {
      method: 'credit_card',
      status: 'pending', // NOT charged yet
      paymentIntentId: paymentIntentId || undefined,
      amount: bookingState.pricing?.total || selectedFlight.price || 0,
      currency: bookingState.pricing?.currency || selectedFlight.currency || 'USD',
      // Card details will be retrieved from Stripe if needed
    };

    // Note: Card details will be displayed from Stripe dashboard if needed
    // We save the paymentIntentId for reference

    // Create booking in OUR database with status "pending_ticketing"
    console.log('💾 Saving booking to database (pending_ticketing)...');

    try {
      const booking = await bookingStorage.create({
        status: 'pending_ticketing', // NEW: Waiting for manual ticketing
        userId: undefined, // Will be set if user is logged in
        contactInfo,
        flight: flightData,
        passengers: transformedPassengers,
        seats: bookingState.selectedSeats || [],
        payment: paymentInfo,
        specialRequests: bookingState.specialRequests,
        notes: `Duffel Offer ID: ${selectedFlight.offerId || 'N/A'}`,
        refundPolicy: {
          refundable: true,
          cancellationFee: 150,
        },
        // Manual ticketing fields - to be filled by admin
        ticketingStatus: 'pending_ticketing',
        customerPrice: bookingState.pricing?.total || selectedFlight.price || 0,
        // These will be filled by admin after manual booking:
        // eticketNumbers: [],
        // airlineRecordLocator: '',
        // consolidatorReference: '',
        // consolidatorName: '',
        // consolidatorPrice: 0,
        // markup: 0,
      });

      console.log('✅ Booking saved successfully');
      console.log(`   Booking Reference: ${booking.bookingReference}`);
      console.log(`   Status: pending_ticketing (awaiting manual booking)`);

      // TRANSACTION-LIKE PATTERN: Process referral points with proper tracking
      // Since bookingStorage uses raw SQL and referrals use Prisma, we implement
      // idempotency + error logging for manual review on failure
      let referralProcessingStatus = 'not_applicable';
      let referralError: string | null = null;

      try {
        const session = await auth();
        const prisma = getPrismaClient();

        if (session?.user?.email) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, referredBy: true },
          });

          if (user) {
            // STEP 1: Update booking with user ID (links user to booking)
            await bookingStorage.update(booking.id, { userId: user.id });
            console.log(`   User linked: ${user.id}`);

            // STEP 2: Process referral points (only if user was referred by someone)
            if (user.referredBy) {
              referralProcessingStatus = 'processing';

              const departureDate = new Date(flightData.segments[0].departure.at);
              const arrivalDate = new Date(flightData.segments[flightData.segments.length - 1].arrival.at);

              // Determine product type based on price threshold
              const bookingTotal = bookingState.pricing?.total || 0;
              const productType = bookingTotal > 1000 ? 'flight_international' : 'flight';

              // Calculate commission from booking (rewards are based on commission, not booking amount!)
              const commissionAmount = calculateDefaultCommission(bookingTotal, productType);

              console.log(`💰 Referral rewards: Booking $${bookingTotal}, Commission $${commissionAmount} (${((commissionAmount/bookingTotal)*100).toFixed(1)}%)`);

              // Process referral points with idempotency (service checks for duplicates)
              const result = await processBookingForReferralPoints({
                bookingId: booking.bookingReference,
                userId: user.id,
                bookingAmount: bookingTotal,
                commissionAmount: commissionAmount,
                currency: bookingState.pricing?.currency || 'USD',
                productType: productType,
                tripStartDate: departureDate,
                tripEndDate: arrivalDate,
                productData: {
                  flightNumber: selectedFlight.flightNumber,
                  airline: selectedFlight.airline,
                  route: `${selectedFlight.departure?.airportCode} → ${selectedFlight.arrival?.airportCode}`,
                },
              });

              referralProcessingStatus = result.success ? 'completed' : 'failed';
              console.log(`✅ Referral processing: ${referralProcessingStatus}`);
            } else {
              referralProcessingStatus = 'no_referrer';
            }
          }
        }
      } catch (refError: any) {
        // Log error but don't fail the booking - referral points can be processed later
        referralProcessingStatus = 'failed';
        referralError = refError.message || 'Unknown error';
        console.error('⚠️ Referral processing failed (booking still valid):', refError);

        // Log to database for admin review/manual retry
        try {
          const prisma = getPrismaClient();
          await prisma.webhookEvent.create({
            data: {
              id: `referral_error_${Date.now()}`,
              eventType: 'referral_processing_failed',
              eventData: {
                bookingReference: booking.bookingReference,
                error: referralError,
                timestamp: new Date().toISOString(),
              },
              status: 'failed',
              errorMessage: referralError,
              receivedAt: new Date(),
            },
          }).catch(() => null);
        } catch {
          // Ignore logging errors
        }
      }

      // Send notifications to admin (Telegram + SSE + Email + Database)
      const route = `${selectedFlight.departure?.airportCode || ''} → ${selectedFlight.arrival?.airportCode || ''}`;
      const departureDate = selectedFlight.departure?.time
        ? new Date(selectedFlight.departure.time).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
        : 'N/A';

      const notificationPayload: BookingNotificationPayload = {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        status: 'pending_ticketing',
        customerName: `${primaryPassenger.firstName || ''} ${primaryPassenger.lastName || ''}`.trim() || 'Customer',
        customerEmail: contactInfo.email,
        customerPhone: contactInfo.phone,
        route,
        departureDate,
        totalAmount: paymentInfo.amount,
        currency: paymentInfo.currency,
        passengerCount: transformedPassengers.length,
      };

      // Fire and forget - don't block response
      notifyNewBooking(notificationPayload).catch((err) => {
        console.error('⚠️ Failed to send booking notifications:', err);
      });

      console.log('📤 New booking notification dispatched');

      // Trigger booking confirmation email + stop recovery campaigns
      if (contactInfo.email) {
        triggerEmailEvent('booking_confirmed', contactInfo.email, {
          bookingReference: booking.bookingReference,
          customerName: notificationPayload.customerName,
          route,
          departureDate,
          totalAmount: paymentInfo.amount,
          currency: paymentInfo.currency,
          passengerCount: transformedPassengers.length,
        }).catch(() => null);

        // Stop booking recovery campaigns (user converted)
        try {
          const session = await auth();
          if (session?.user?.id) {
            campaignEngine.markConverted(session.user.id).catch(() => null);
          }
        } catch { /* ignore */ }
      }

      // Return success response
      return NextResponse.json(
        {
          success: true,
          booking: {
            bookingReference: booking.bookingReference,
            pnr: 'Processing...', // Will be added after manual ticketing
            confirmationEmail: contactInfo.email,
            status: 'pending_ticketing',
          },
          message: 'Your booking request has been received! You will receive your e-ticket confirmation shortly.',
          // Internal tracking (not shown to customer but logged for admin)
          _internal: {
            referralProcessing: referralProcessingStatus,
            referralError: referralError,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 201 }
      );

    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json(
        {
          error: 'BOOKING_SAVE_FAILED',
          message: 'Failed to save booking. Please try again.',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ [Booking Flow] Confirm booking error:', error);

    // Get context for alert
    let alertContext = { customer: 'Unknown', email: 'Unknown', phone: 'Unknown', amount: 'Unknown', flight: 'Unknown', paymentId: 'Unknown' };
    try {
      const body = await request.clone().json().catch(() => ({}));
      const passenger = body.passengers?.[0];
      alertContext = {
        customer: passenger ? `${passenger.firstName} ${passenger.lastName}` : 'Unknown',
        email: passenger?.email || 'Unknown',
        phone: passenger?.phone || 'Unknown',
        amount: `${body.bookingState?.pricing?.total || '?'} ${body.bookingState?.pricing?.currency || 'USD'}`,
        flight: `${body.bookingState?.selectedFlight?.airline || ''} ${body.bookingState?.selectedFlight?.flightNumber || ''}`,
        paymentId: body.paymentIntentId || 'Unknown',
      };
    } catch {}

    // Send CRITICAL Telegram alert
    notifyTelegramAdmins(`
🚨🚨 <b>BOOKING CONFIRMATION FAILED</b> 🚨🚨

👤 <b>Customer:</b> ${alertContext.customer}
📧 <b>Email:</b> ${alertContext.email}
📞 <b>Phone:</b> ${alertContext.phone}
✈️ <b>Flight:</b> ${alertContext.flight}
💰 <b>Amount:</b> ${alertContext.amount}
🔐 <b>Payment ID:</b> <code>${alertContext.paymentId}</code>

❌ <b>Error:</b> ${error.message || 'Unknown error'}

⚠️ <b>ACTION REQUIRED:</b> Customer payment may have been charged but booking failed!
<i>Please investigate immediately and contact customer.</i>
    `.trim()).catch(console.error);

    sendAdminAlert({
      type: 'booking_confirmation_failed',
      customer: alertContext.customer,
      customerEmail: alertContext.email,
      customerPhone: alertContext.phone,
      amount: alertContext.amount,
      flight: alertContext.flight,
      paymentIntentId: alertContext.paymentId,
      error: error.message,
      priority: 'critical',
    }).catch(console.error);

    return NextResponse.json(
      {
        error: 'BOOKING_CONFIRMATION_FAILED',
        message: error.message || 'Failed to process booking',
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
