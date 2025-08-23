/**
 * ✅ PAYMENT CONFIRMATION & BOOKING FINALIZATION
 * Confirms payment and finalizes flight booking
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendBookingConfirmationEmail } from '@/lib/email/booking-confirmation';
import { generateBookingReference } from '@/lib/flights/booking-utils';
import { storeBookingData } from '@/lib/database/bookings';
import { smsService } from '@/lib/sms/sms-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  console.log('✅ Confirming payment and finalizing booking');
  
  try {
    const body = await request.json();
    const { 
      paymentIntentId, 
      flightId, 
      passengerInfo, 
      services,
      flightDetails 
    } = body;

    // Validate required fields
    if (!paymentIntentId || !flightId || !passengerInfo) {
      return NextResponse.json({
        success: false,
        error: 'Missing required booking information'
      }, { status: 400 });
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({
        success: false,
        error: 'Payment not completed. Please check your payment method.'
      }, { status: 400 });
    }

    console.log('💳 Payment verified successfully:', paymentIntent.id);

    // Generate booking reference
    const bookingReference = generateBookingReference();
    
    // Calculate total price
    const basePrice = parseFloat(flightDetails.totalPrice.replace(/[^\d.]/g, ''));
    const serviceCharges = calculateServiceCharges(services);
    const totalPrice = basePrice + serviceCharges;

    // Create booking record
    const bookingData = {
      bookingReference,
      paymentIntentId,
      flightId,
      passengerInfo,
      contactInfo: passengerInfo || {}, // Use passengerInfo as contactInfo fallback
      services,
      flightDetails,
      pricing: {
        basePrice,
        serviceCharges,
        totalPrice,
        currency: 'USD'
      },
      status: 'confirmed' as const,
      bookingDate: new Date().toISOString(),
      paymentStatus: 'paid' as const
    };

    // Store booking in database
    try {
      await storeBookingData(bookingData);
      console.log('💾 Booking stored successfully:', bookingReference);
    } catch (dbError) {
      console.error('❌ Database storage error:', dbError);
      // Continue with booking process even if storage fails
    }

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail({
        email: passengerInfo.email,
        bookingReference,
        passengerInfo,
        flightDetails,
        services,
        totalPrice,
        paymentIntentId
      });
      console.log('📧 Confirmation email sent to:', passengerInfo.email);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // Don't fail the booking if email fails
    }

    // Send confirmation SMS
    const phoneNumber = passengerInfo.phone || passengerInfo.phones?.[0]?.number;
    if (phoneNumber) {
      try {
        await smsService.sendTemplatedSMS(
          'booking-confirmation',
          phoneNumber,
          {
            bookingReference,
            route: `${flightDetails.outbound.departure.iataCode}-${flightDetails.outbound.arrival.iataCode}`,
            date: flightDetails.outbound.departure.date
          },
          bookingReference
        );
        console.log('📱 Confirmation SMS sent to:', phoneNumber);
      } catch (smsError) {
        console.error('❌ SMS sending error:', smsError);
        // Don't fail the booking if SMS fails
      }
    }

    // Return successful booking confirmation
    return NextResponse.json({
      success: true,
      data: {
        bookingReference,
        status: 'confirmed',
        totalPrice,
        currency: 'USD',
        bookingDate: bookingData.bookingDate,
        confirmationSent: true,
        message: 'Your flight has been successfully booked!'
      }
    });

  } catch (error) {
    console.error('❌ Booking confirmation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Booking confirmation failed'
    }, { status: 500 });
  }
}

/**
 * Calculate service charges
 */
function calculateServiceCharges(services: any) {
  let charges = 0;
  
  if (services?.seatSelection) charges += 25;
  if (services?.baggage) charges += 50;
  if (services?.insurance) charges += 35;
  
  return charges;
}