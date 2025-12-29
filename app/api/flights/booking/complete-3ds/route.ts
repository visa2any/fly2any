export const dynamic = 'force-dynamic';

/**
 * Complete 3D Secure Challenge and Create Order
 *
 * POST /api/flights/booking/complete-3ds
 *
 * Called after frontend completes 3DS challenge to finalize the booking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { bookingStorage } from '@/lib/bookings/storage';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    const body = await request.json();

    const {
      threeDSecureSessionId,
      offerId,
      passengers,
      contactInfo,
      flightOffer,
    } = body;

    if (!threeDSecureSessionId || !offerId || !passengers || !flightOffer) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: threeDSecureSessionId, offerId, passengers, flightOffer',
      }, { status: 400 });
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('🔐 COMPLETING 3DS CHALLENGE');
    console.log(`   3DS Session: ${threeDSecureSessionId}`);
    console.log(`   Offer: ${offerId}`);
    console.log('═══════════════════════════════════════════════════');

    try {
      // Complete 3DS and create order
      const order = await duffelAPI.complete3DSAndCreateOrder(
        flightOffer,
        passengers,
        threeDSecureSessionId
      );

      // Extract booking details
      const bookingId = duffelAPI.extractOrderId(order);
      const pnr = duffelAPI.extractBookingReference(order);

      console.log('✅ 3DS Complete - Order created!');
      console.log(`   Order ID: ${bookingId}`);
      console.log(`   PNR: ${pnr}`);

      // Generate booking reference
      const bookingRef = `F2A-${Date.now().toString(36).toUpperCase()}`;

      // Save to database
      const savedBooking = await bookingStorage.create({
        bookingReference: bookingRef,
        status: 'confirmed',
        paymentStatus: 'paid',
        sourceApi: 'Duffel',
        duffelOrderId: bookingId,
        duffelBookingReference: pnr,
        airlineRecordLocator: pnr,
        customerEmail: contactInfo?.email || passengers[0]?.email,
        customerName: `${passengers[0]?.firstName} ${passengers[0]?.lastName}`,
        customerPhone: contactInfo?.phone,
        passengers: JSON.stringify(passengers),
        flightDetails: JSON.stringify(flightOffer),
        totalAmount: parseFloat(flightOffer.price?.total || '0'),
        currency: flightOffer.price?.currency || 'USD',
      }, bookingRef);

      // Notify admin
      try {
        const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
        await notifyTelegramAdmins(`
✅ *NEW BOOKING (3DS Complete)*

📋 *Ref:* \`${bookingRef}\`
🎫 *PNR:* \`${pnr}\`
💳 *Payment:* Card charged via Duffel
✈️ *Route:* ${flightOffer.itineraries?.[0]?.segments?.[0]?.departure?.iataCode} → ${flightOffer.itineraries?.[0]?.segments?.slice(-1)?.[0]?.arrival?.iataCode}
💰 *Amount:* ${flightOffer.price?.currency} ${flightOffer.price?.total}
        `.trim());
      } catch {}

      return NextResponse.json({
        success: true,
        booking: {
          id: savedBooking.id,
          bookingReference: bookingRef,
          pnr,
          status: 'confirmed',
          paymentStatus: 'paid',
        },
        message: `Booking confirmed! Your reference is ${bookingRef}`,
      });

    } catch (error: any) {
      console.error('❌ 3DS completion failed:', error.message);

      return NextResponse.json({
        success: false,
        error: error.message || '3DS completion failed',
      }, { status: 500 });
    }
  }, {
    category: ErrorCategory.PAYMENT,
    severity: ErrorSeverity.CRITICAL,
  });
}
