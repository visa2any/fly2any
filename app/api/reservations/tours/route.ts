import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/connection';
import { mailgunClient } from '@/lib/email/mailgun-client';
import { notifyTelegramAdmins, broadcastSSE } from '@/lib/notifications/notification-service';
import { getPrismaClient } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

/**
 * Tours Booking API - Manual Ticketing Flow
 *
 * Creates tour reservations that go to admin queue for manual booking.
 * Pattern matches flights/cars - booking created pending, admin confirms via external provider.
 */

function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let reference = 'TUR2A-';
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
}

export async function POST(request: NextRequest) {
  const requestId = `TUR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🗺️ [${requestId}] TOUR BOOKING REQUEST`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);

  return await handleApiError(request, async () => {
    const session = await auth();
    const body = await request.json();

    const {
      tourId,
      tourName,
      pricePerPerson,
      totalPrice,
      bookingLink,
      firstName,
      lastName,
      email,
      phone,
      date,
      travelers,
      notes,
    } = body;

    // Validate required fields
    if (!tourName || !email || !firstName || !date) {
      const missing = [];
      if (!tourName) missing.push('tourName');
      if (!email) missing.push('email');
      if (!firstName) missing.push('firstName');
      if (!date) missing.push('date');

      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Missing required fields: ${missing.join(', ')}`
      }, { status: 400 });
    }

    const bookingReference = generateBookingReference();
    const bookingId = `tour_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    // Booking data structure
    const bookingData = {
      id: bookingId,
      bookingReference,
      productType: 'tour',
      status: 'pending',
      userId: session?.user?.id || null,

      tour: {
        id: tourId,
        name: tourName,
        bookingLink,
        date,
        travelers: travelers || 1,
      },

      contactInfo: {
        email,
        phone: phone || '',
      },

      pricing: {
        pricePerPerson: pricePerPerson || totalPrice,
        totalPrice: totalPrice || pricePerPerson,
        currency: 'USD',
      },

      payment: {
        method: 'credit_card',
        status: 'pending',
        amount: totalPrice || pricePerPerson,
        currency: 'USD',
      },

      createdAt: now,
      updatedAt: now,
    };

    // Save to database
    const sql = getSql();

    if (!sql) {
      console.error('❌ Database not configured');
      return NextResponse.json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Database connection not available'
      }, { status: 500 });
    }

    try {
      const userId = session?.user?.id;
      const isValidUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

      await sql`
        INSERT INTO bookings (
          id, booking_reference, status, user_id,
          booking_type, contact_info, flight, passengers, seats, payment,
          travel_date_from, travel_date_to,
          created_at, updated_at
        ) VALUES (
          ${bookingId},
          ${bookingReference},
          'pending',
          ${isValidUuid ? userId : null},
          'tour',
          ${JSON.stringify(bookingData.contactInfo)},
          ${JSON.stringify({ type: 'tour', ...bookingData.tour })},
          ${JSON.stringify([{ firstName, lastName, email, phone }])},
          ${JSON.stringify([])},
          ${JSON.stringify(bookingData.payment)},
          ${date},
          ${date},
          ${now},
          ${now}
        )
      `;
      console.log(`✅ Tour booking saved: ${bookingReference}`);
    } catch (dbError: any) {
      console.error(`❌ Database error: ${dbError.message}`);
      throw new Error(`DATABASE_ERROR: ${dbError.message}`);
    }

    // Send customer email
    const dateFormatted = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
          <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
            <div style="text-align: center; padding: 24px 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #E74035;">Fly2Any</h1>
              <p style="margin: 4px 0 0; font-size: 13px; color: #86868b;">Tours & Excursions</p>
            </div>
            <div style="background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); padding: 28px 24px; text-align: center;">
                <h2 style="color: white; margin: 0; font-size: 22px;">Tour Booking Received</h2>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Adventure awaits!</p>
              </div>
              <div style="padding: 24px; background: #fafafa; text-align: center;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #86868b; text-transform: uppercase;">Confirmation Number</p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1d1d1f; letter-spacing: 2px;">${bookingReference}</p>
              </div>
              <div style="padding: 24px;">
                <p style="font-size: 17px; color: #1d1d1f; margin: 0 0 20px;">Hello <strong>${firstName}</strong>,<br>Thank you for booking with Fly2Any!</p>
                <div style="background: #f8f9fa; border-radius: 12px; padding: 16px; margin: 16px 0;">
                  <h3 style="margin: 0 0 12px; font-size: 16px; color: #1d1d1f;">🗺️ ${tourName}</h3>
                  <p style="margin: 0; font-size: 14px; color: #515154;">📅 ${dateFormatted}</p>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #515154;">👥 ${travelers || 1} traveler${(travelers || 1) > 1 ? 's' : ''}</p>
                  <p style="margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #7C3AED;">$${(totalPrice || pricePerPerson || 0).toFixed(2)}</p>
                </div>
                <div style="background: #f0f9ff; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #bae6fd;">
                  <h4 style="margin: 0 0 6px; font-size: 14px; color: #0369a1;">⏳ What's Next?</h4>
                  <p style="margin: 0; font-size: 13px; color: #0c4a6e;">Our team will confirm your tour and send your voucher within 24 hours.</p>
                </div>
              </div>
            </div>
            <div style="text-align: center; padding: 24px 16px;">
              <p style="margin: 0; font-size: 13px; color: #86868b;">Questions? <a href="mailto:support@fly2any.com" style="color: #E74035;">support@fly2any.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      await mailgunClient.send({
        to: email,
        subject: `🗺️ Tour Booking Received - ${bookingReference}`,
        html: emailHtml,
        text: `Tour Booking Received - ${bookingReference}\n\nDear ${firstName},\n\nThank you for booking!\n\nTour: ${tourName}\nDate: ${dateFormatted}\nTravelers: ${travelers || 1}\nTotal: $${(totalPrice || pricePerPerson || 0).toFixed(2)}\n\nOur team will confirm your tour within 24 hours.\n\nFly2Any Team`,
        forceSend: true,
        tags: ['tour', 'booking-received'],
      });
      console.log(`📧 Confirmation email sent to ${email}`);
    } catch (emailError: any) {
      console.warn(`⚠️ Email failed: ${emailError.message}`);
    }

    // Telegram notification
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com';
    try {
      await notifyTelegramAdmins(`
🗺️ <b>NEW TOUR BOOKING</b>

📋 <b>Reference:</b> <code>${bookingReference}</code>
🟡 <b>Status:</b> Pending

👤 <b>Customer:</b> ${firstName} ${lastName}
📧 <b>Email:</b> ${email}
📞 <b>Phone:</b> ${phone || 'N/A'}

🎯 <b>Tour:</b> ${tourName}
📅 <b>Date:</b> ${date}
👥 <b>Travelers:</b> ${travelers || 1}

💰 <b>Total:</b> USD ${(totalPrice || pricePerPerson || 0).toFixed(2)}

🔗 <a href="${baseUrl}/admin/bookings/${bookingId}">View in Dashboard</a>
      `.trim());
      console.log(`📱 Telegram sent`);
    } catch (telegramError: any) {
      console.warn(`⚠️ Telegram failed: ${telegramError.message}`);
    }

    // SSE broadcast
    try {
      broadcastSSE('admin', 'booking_created', {
        type: 'tour',
        bookingReference,
        bookingId,
        timestamp: now,
        customerName: `${firstName} ${lastName}`,
        tour: tourName,
        date,
        totalAmount: totalPrice || pricePerPerson,
        currency: 'USD',
        status: 'pending',
      });
    } catch (sseError: any) {
      console.warn(`⚠️ SSE failed: ${sseError.message}`);
    }

    // In-app notifications
    try {
      const prisma = getPrismaClient();
      const admins = await prisma.adminUser.findMany({ select: { userId: true } });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.userId,
            type: 'booking',
            title: `🗺️ New Tour: ${bookingReference}`,
            message: `${firstName} ${lastName} - ${tourName}`,
            priority: 'high',
            actionUrl: `/admin/bookings/${bookingId}`,
            metadata: { bookingId, bookingReference, productType: 'tour', customerName: `${firstName} ${lastName}`, tour: tourName, totalAmount: totalPrice },
          })),
        });
        console.log(`🔔 Created ${admins.length} admin notifications`);
      }
    } catch (notifError: any) {
      console.warn(`⚠️ Notifications failed: ${notifError.message}`);
    }

    console.log(`✅ [${requestId}] Tour booking created: ${bookingReference}`);

    return NextResponse.json({
      success: true,
      id: bookingReference,
      booking: {
        id: bookingId,
        bookingReference,
        status: 'pending',
        message: 'Your tour booking has been received. Our team will confirm your reservation within 24 hours.',
      }
    });

  }, { category: ErrorCategory.BOOKING, severity: ErrorSeverity.CRITICAL });
}
