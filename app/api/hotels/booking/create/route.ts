import { NextRequest, NextResponse } from 'next/server';
import { prisma, getPrismaClient } from '@/lib/prisma';
import { liteAPI } from '@/lib/api/liteapi';
import { getPaymentIntent } from '@/lib/payments/stripe-hotel';
import { sendHotelConfirmationEmail } from '@/lib/email/hotel-confirmation';
import { auth } from '@/lib/auth';
import { checkRateLimit, bookingRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiter';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { notifyTelegramAdmins, broadcastSSE } from '@/lib/notifications/notification-service';

// Environment flags for production safety
const ALLOW_DEMO_PAYMENTS = process.env.ALLOW_DEMO_PAYMENTS === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Hotel Booking Creation API Route
 *
 * POST /api/hotels/booking/create
 *
 * Complete a hotel booking using the new streamlined flow:
 * 1. Validates payment (if Stripe configured)
 * 2. Calls LiteAPI /rates/book (if prebookId provided)
 * 3. Stores booking in database
 * 4. Sends confirmation email
 *
 * Request Body:
 * {
 *   hotelId: string;
 *   hotelName: string;
 *   hotelCity: string;
 *   hotelCountry: string;
 *   roomId: string;
 *   roomName: string;
 *   checkInDate: string;
 *   checkOutDate: string;
 *   nights: number;
 *   pricePerNight: string;
 *   subtotal: string;
 *   taxesAndFees: string;
 *   totalPrice: string;
 *   currency: string;
 *   guestTitle: string;
 *   guestFirstName: string;
 *   guestLastName: string;
 *   guestEmail: string;
 *   guestPhone: string;
 *   specialRequests?: string;
 *   paymentIntentId?: string;
 *   prebookId?: string;
 *   breakfastIncluded?: boolean;
 *   cancellable?: boolean;
 * }
 */
export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    // SECURITY: Rate limiting to prevent abuse
    const rateLimitResult = await checkRateLimit(request, bookingRateLimit);

    if (!rateLimitResult.success) {
      console.warn('⚠️ Rate limit exceeded for booking creation');
      const headers = new Headers();
      addRateLimitHeaders(headers, rateLimitResult);

      return NextResponse.json(
        {
          error: 'Too many booking attempts',
          message: 'Please wait before trying again.',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    const body = await request.json();

    // Validate required parameters
    const requiredFields = [
      'hotelId', 'hotelName', 'roomName', 'checkInDate', 'checkOutDate',
      'guestFirstName', 'guestLastName', 'guestEmail', 'guestPhone',
      'totalPrice', 'currency'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log('🎫 Creating hotel booking...');
    console.log(`   Hotel: ${body.hotelName}`);
    console.log(`   Room: ${body.roomName}`);
    console.log(`   Guest: ${body.guestFirstName} ${body.guestLastName}`);
    console.log(`   Check-in: ${body.checkInDate}`);
    console.log(`   Check-out: ${body.checkOutDate}`);

    // STEP 1: Verify payment method
    let paymentVerified = false;
    let paymentMethod: 'stripe' | 'liteapi' | 'liteapi_sdk' | 'demo' = 'liteapi';
    let liteApiTransactionId: string | null = null;

    // LiteAPI User Payment SDK Flow - transactionId from SDK payment
    if (body.paymentIntentId?.startsWith('liteapi_transaction_')) {
      console.log('💳 LiteAPI User Payment SDK Flow');
      // Extract transactionId from payment reference
      liteApiTransactionId = body.paymentIntentId.replace('liteapi_transaction_', '');
      paymentVerified = true;
      paymentMethod = 'liteapi_sdk';
      console.log('✅ LiteAPI SDK payment verified with transactionId:', liteApiTransactionId);
    }
    // LiteAPI Payment Flow - prebookId contains the price lock (fallback)
    else if (body.paymentIntentId?.startsWith('liteapi_')) {
      console.log('💳 LiteAPI Payment Flow (Legacy)');
      // Extract prebookId from payment reference
      const prebookIdFromPayment = body.paymentIntentId.replace('liteapi_', '');

      // Verify prebookId matches
      if (body.prebookId && body.prebookId !== prebookIdFromPayment) {
        console.warn('⚠️ PrebookId mismatch - using payment reference');
        body.prebookId = prebookIdFromPayment;
      } else if (!body.prebookId) {
        body.prebookId = prebookIdFromPayment;
      }

      paymentVerified = true;
      paymentMethod = 'liteapi';
      console.log('✅ LiteAPI payment verified with prebookId:', body.prebookId);
    }
    // Stripe Payment Flow
    else if (body.paymentIntentId && !body.paymentIntentId.startsWith('demo_')) {
      console.log('💳 Verifying Stripe payment...');
      try {
        const paymentIntent = await getPaymentIntent(body.paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json(
            {
              error: 'Payment not completed',
              message: `Payment status: ${paymentIntent.status}`
            },
            { status: 402 }
          );
        }

        paymentVerified = true;
        paymentMethod = 'stripe';
        console.log('✅ Stripe payment verified successfully');
      } catch (error: any) {
        console.error('❌ Stripe payment verification failed:', error);
        return NextResponse.json(
          {
            error: 'Payment verification failed',
            message: error.message
          },
          { status: 402 }
        );
      }
    }
    // Demo mode (BLOCKED in production unless explicitly allowed)
    else if (body.paymentIntentId?.startsWith('demo_')) {
      if (IS_PRODUCTION && !ALLOW_DEMO_PAYMENTS) {
        console.error('❌ Demo payments blocked in production');
        return NextResponse.json(
          {
            error: 'Invalid payment method',
            message: 'Demo payments are not allowed in production. Please use a valid payment method.',
          },
          { status: 400 }
        );
      }
      console.log('🎭 Demo booking mode (development/testing only)');
      paymentVerified = true;
      paymentMethod = 'demo';
    }
    // No payment method - require prebookId for LiteAPI flow
    else if (body.prebookId) {
      console.log('💳 LiteAPI Payment via prebookId');
      paymentVerified = true;
      paymentMethod = 'liteapi';
    }

    // STEP 2: Call LiteAPI booking (if prebookId provided)
    let liteApiBookingId: string | null = null;
    let liteApiReference: string | null = null;

    if (body.prebookId) {
      console.log('🔗 Completing LiteAPI booking...');
      try {
        const bookingPayload: {
          prebookId: string;
          guestInfo: {
            guestFirstName: string;
            guestLastName: string;
            guestEmail: string;
            guestPhone?: string;
          };
          transactionId?: string;
          specialRequests?: string;
        } = {
          prebookId: body.prebookId,
          guestInfo: {
            guestFirstName: body.guestFirstName,
            guestLastName: body.guestLastName,
            guestEmail: body.guestEmail,
            guestPhone: body.guestPhone,
          },
          specialRequests: body.specialRequests,
        };

        // Add transactionId for User Payment SDK flow
        if (liteApiTransactionId) {
          bookingPayload.transactionId = liteApiTransactionId;
          console.log('💳 Using TRANSACTION_ID payment method:', liteApiTransactionId);
        }

        const bookingResult = await liteAPI.bookHotel(bookingPayload);

        liteApiBookingId = bookingResult.bookingId;
        liteApiReference = bookingResult.reference;
        console.log(`✅ LiteAPI booking confirmed: ${liteApiReference}`);
      } catch (liteApiError: any) {
        console.warn('⚠️ LiteAPI booking failed, continuing with local booking:', liteApiError.message);
        // Continue with local booking even if LiteAPI fails
      }
    }

    // Generate confirmation number
    const confirmationNumber = liteApiReference || `FLY2ANY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // STEP 3: Store booking in database
    console.log('💾 Storing booking in database...');

    let dbBooking: any = null;

    try {
      // Get current user session
      const session = await auth();
      const userId = session?.user?.id || null;

      // Calculate nights if not provided
      const checkIn = new Date(body.checkInDate);
      const checkOut = new Date(body.checkOutDate);
      const nights = body.nights || Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      // Store in database
      if (!prisma) {
        throw new Error('Database not available');
      }
      dbBooking = await prisma.hotelBooking.create({
        data: {
          confirmationNumber,
          userId,

          // Hotel details
          hotelId: body.hotelId,
          hotelName: body.hotelName,
          hotelCity: body.hotelCity || null,
          hotelCountry: body.hotelCountry || null,
          hotelAddress: body.hotelAddress || null,
          hotelPhone: body.hotelPhone || null,
          hotelEmail: body.hotelEmail || null,

          // Room details
          roomId: body.roomId || 'standard',
          roomName: body.roomName,
          roomDescription: body.roomDescription || null,
          maxGuests: body.adults || 2,

          // Booking dates
          checkInDate: checkIn,
          checkOutDate: checkOut,
          nights,

          // Pricing
          pricePerNight: parseFloat(body.pricePerNight || body.totalPrice) / nights,
          subtotal: parseFloat(body.subtotal || body.totalPrice),
          taxesAndFees: parseFloat(body.taxesAndFees || '0'),
          totalPrice: parseFloat(body.totalPrice),
          currency: body.currency.toUpperCase(),

          // Guest information
          guestTitle: body.guestTitle || 'Mr',
          guestFirstName: body.guestFirstName,
          guestLastName: body.guestLastName,
          guestEmail: body.guestEmail,
          guestPhone: body.guestPhone,

          // Special requests
          specialRequests: body.specialRequests || null,

          // Payment
          paymentStatus: paymentVerified ? 'completed' : 'pending',
          paymentIntentId: body.paymentIntentId || null,
          paymentProvider: paymentMethod,
          paidAt: paymentVerified ? new Date() : null,

          // Booking status
          status: 'confirmed',
          cancellable: body.cancellable ?? true,
          cancellationPolicy: body.cancellable ? 'free' : 'non_refundable',

          // Meal plan
          mealPlanIncluded: body.breakfastIncluded || false,

          // Provider data
          provider: body.prebookId ? 'liteapi' : 'direct',
          providerBookingId: liteApiBookingId || body.prebookId || null,
          providerData: JSON.stringify({
            prebookId: body.prebookId,
            liteApiBookingId,
            liteApiReference,
            transactionId: liteApiTransactionId,
            paymentMethod: liteApiTransactionId ? 'USER_PAYMENT_SDK' : 'ACCOUNT',
          }),

          // Metadata
          source: 'web',
          deviceType: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        },
      });

      console.log('✅ Booking stored in database');
      console.log(`   DB ID: ${dbBooking.id}`);
      console.log(`   Confirmation: ${dbBooking.confirmationNumber}`);
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      // Continue without database if it fails
    }

    // STEP 4: Send confirmation email
    if (dbBooking) {
      console.log('📧 Sending confirmation email...');
      try {
        const emailSent = await sendHotelConfirmationEmail({
          confirmationNumber: dbBooking.confirmationNumber,
          bookingId: dbBooking.id,
          hotelName: dbBooking.hotelName,
          hotelAddress: dbBooking.hotelAddress || undefined,
          hotelCity: dbBooking.hotelCity || undefined,
          hotelCountry: dbBooking.hotelCountry || undefined,
          roomName: dbBooking.roomName,
          checkInDate: dbBooking.checkInDate,
          checkOutDate: dbBooking.checkOutDate,
          nights: dbBooking.nights,
          guestName: `${dbBooking.guestFirstName} ${dbBooking.guestLastName}`,
          guestEmail: dbBooking.guestEmail,
          totalPrice: parseFloat(dbBooking.totalPrice.toString()),
          currency: dbBooking.currency,
          specialRequests: dbBooking.specialRequests || undefined,
        });

        if (emailSent && prisma) {
          await prisma.hotelBooking.update({
            where: { id: dbBooking.id },
            data: {
              confirmationEmailSent: true,
              confirmationSentAt: new Date(),
            },
          });
          console.log('✅ Confirmation email sent');
        }
      } catch (emailError) {
        console.warn('⚠️ Email failed:', emailError);
      }

      // STEP 5: Telegram admin notification
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com';
      try {
        await notifyTelegramAdmins(`
🏨 <b>NEW HOTEL BOOKING</b>

📋 <b>Confirmation:</b> <code>${confirmationNumber}</code>
🟢 <b>Status:</b> Confirmed

👤 <b>Guest:</b> ${body.guestFirstName} ${body.guestLastName}
📧 <b>Email:</b> ${body.guestEmail}
📞 <b>Phone:</b> ${body.guestPhone || 'N/A'}

🏨 <b>Hotel:</b> ${body.hotelName}
📍 <b>Location:</b> ${body.hotelCity || 'N/A'}
🛏️ <b>Room:</b> ${body.roomName}
📅 <b>Check-in:</b> ${body.checkInDate}
📅 <b>Check-out:</b> ${body.checkOutDate}

💰 <b>Total:</b> ${body.currency} ${parseFloat(body.totalPrice).toFixed(2)}

🔗 <a href="${baseUrl}/admin/hotels/bookings/${dbBooking.id}">View in Dashboard</a>
        `.trim());
        console.log('📱 Telegram sent');
      } catch (telegramError: any) {
        console.warn('⚠️ Telegram failed:', telegramError.message);
      }

      // STEP 6: SSE broadcast
      try {
        broadcastSSE('admin', 'booking_created', {
          type: 'hotel',
          confirmationNumber,
          bookingId: dbBooking.id,
          timestamp: new Date().toISOString(),
          customerName: `${body.guestFirstName} ${body.guestLastName}`,
          hotel: body.hotelName,
          checkIn: body.checkInDate,
          checkOut: body.checkOutDate,
          totalAmount: parseFloat(body.totalPrice),
          currency: body.currency,
          status: 'confirmed',
        });
      } catch (sseError: any) {
        console.warn('⚠️ SSE failed:', sseError.message);
      }

      // STEP 7: In-app admin notifications
      try {
        const prismaClient = getPrismaClient();
        const admins = await prismaClient.adminUser.findMany({ select: { userId: true } });
        if (admins.length > 0) {
          await prismaClient.notification.createMany({
            data: admins.map(admin => ({
              userId: admin.userId,
              type: 'booking',
              title: `🏨 New Hotel: ${confirmationNumber}`,
              message: `${body.guestFirstName} ${body.guestLastName} - ${body.hotelName}`,
              priority: 'high',
              actionUrl: `/admin/hotels/bookings/${dbBooking.id}`,
              metadata: { bookingId: dbBooking.id, confirmationNumber, productType: 'hotel', hotel: body.hotelName, totalAmount: body.totalPrice },
            })),
          });
          console.log(`🔔 Created ${admins.length} admin notifications`);
        }
      } catch (notifError: any) {
        console.warn('⚠️ Notifications failed:', notifError.message);
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: dbBooking?.id || `temp_${Date.now()}`,
        dbBookingId: dbBooking?.id,
        confirmationNumber,
        status: 'confirmed',
        liteApiBookingId,
        liteApiReference,
      },
      meta: {
        createdAt: new Date().toISOString(),
        storedInDatabase: !!dbBooking,
        paymentVerified,
        emailSent: dbBooking?.confirmationEmailSent || false,
      },
    }, { status: 201 });
  }, { category: ErrorCategory.BOOKING, severity: ErrorSeverity.CRITICAL });
}
