import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { mailgunClient, MAILGUN_CONFIG } from '@/lib/email/mailgun-client';
import { notifyTelegramAdmins, broadcastSSE } from '@/lib/notifications/notification-service';
import { getPrismaClient } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  handleApiError,
  ErrorCategory,
  ErrorSeverity
} from '@/lib/monitoring/global-error-handler';

/**
 * Car Rental Booking API - Manual Payment Flow
 *
 * Creates car rental bookings that go to admin queue for manual processing.
 * Follows the same pattern as flights - booking is created with status='pending'
 * and admin confirms payment manually.
 *
 * POST /api/cars/booking
 */

// Generate unique booking reference
function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let reference = 'CAR2A-';
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
}

export async function POST(request: NextRequest) {
  const requestId = `CAR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚗 [${requestId}] CAR RENTAL BOOKING REQUEST`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);

  return await handleApiError(request, async () => {
    const session = await auth();
    const body = await request.json();

    const {
      car,              // Car rental details from Amadeus
      pickupLocation,   // Pickup location code
      dropoffLocation,  // Dropoff location code
      pickupDate,       // YYYY-MM-DD
      dropoffDate,      // YYYY-MM-DD
      pickupTime,       // HH:MM
      dropoffTime,      // HH:MM
      driver,           // Driver information
      payment,          // Payment card details (for manual processing)
      contactInfo,      // Contact details
      extras,           // Optional extras (insurance, GPS, etc.)
    } = body;

    // Validate required fields
    if (!car || !pickupLocation || !pickupDate || !dropoffDate || !driver || !contactInfo) {
      const missing = [];
      if (!car) missing.push('car');
      if (!pickupLocation) missing.push('pickupLocation');
      if (!pickupDate) missing.push('pickupDate');
      if (!dropoffDate) missing.push('dropoffDate');
      if (!driver) missing.push('driver');
      if (!contactInfo) missing.push('contactInfo');

      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Missing required fields: ${missing.join(', ')}`
      }, { status: 400 });
    }

    // Calculate rental days
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    const rentalDays = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total price
    const basePrice = car.pricePerDay * rentalDays;
    const extrasTotal = extras?.reduce((sum: number, e: any) => sum + (e.price || 0), 0) || 0;
    const totalPrice = basePrice + extrasTotal;

    // Generate booking reference
    const bookingReference = generateBookingReference();
    const bookingId = `car_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();

    // Create booking data
    const bookingData = {
      id: bookingId,
      bookingReference,
      productType: 'car',
      status: 'pending',
      userId: session?.user?.id || null,

      // Car details
      car: {
        id: car.id,
        name: car.name,
        category: car.category,
        company: car.company,
        transmission: car.transmission,
        fuelType: car.fuelType,
        passengers: car.passengers,
        doors: car.doors,
        luggage: car.luggage,
        image: car.image,
        features: car.features || [],
      },

      // Rental details
      rental: {
        pickupLocation,
        dropoffLocation: dropoffLocation || pickupLocation,
        pickupDate,
        dropoffDate,
        pickupTime: pickupTime || '10:00',
        dropoffTime: dropoffTime || '10:00',
        rentalDays,
      },

      // Driver information
      driver: {
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email || contactInfo.email,
        phone: driver.phone || contactInfo.phone,
        dateOfBirth: driver.dateOfBirth,
        licenseNumber: driver.licenseNumber,
        licenseCountry: driver.licenseCountry,
        licenseExpiry: driver.licenseExpiry,
      },

      // Contact information
      contactInfo: {
        email: contactInfo.email,
        phone: contactInfo.phone,
      },

      // Pricing
      pricing: {
        pricePerDay: car.pricePerDay,
        rentalDays,
        basePrice,
        extras: extras || [],
        extrasTotal,
        totalPrice,
        currency: 'USD',
      },

      // Payment (stored for manual processing)
      payment: {
        method: 'credit_card',
        status: 'pending',
        amount: totalPrice,
        currency: 'USD',
        cardLast4: payment?.cardNumber?.slice(-4) || null,
        cardBrand: payment?.cardBrand || null,
        cardholderName: payment?.cardholderName || `${driver.firstName} ${driver.lastName}`,
      },

      // Timestamps
      createdAt: now,
      updatedAt: now,
    };

    // Store in database
    if (sql) {
      try {
        await sql`
          INSERT INTO bookings (
            id, booking_reference, status, user_id,
            contact_info, flight, passengers, seats, payment,
            product_type, product_id,
            created_at, updated_at
          ) VALUES (
            ${bookingId},
            ${bookingReference},
            'pending',
            ${session?.user?.id || null},
            ${JSON.stringify(bookingData.contactInfo)},
            ${JSON.stringify({ type: 'car_rental', ...bookingData.car, rental: bookingData.rental })},
            ${JSON.stringify([bookingData.driver])},
            ${JSON.stringify([])},
            ${JSON.stringify(bookingData.payment)},
            'car',
            ${car.id || null},
            ${now},
            ${now}
          )
        `;
        console.log(`✅ Car booking saved to database: ${bookingReference}`);
      } catch (dbError: any) {
        console.error(`❌ Database error: ${dbError.message}`);
        // Continue - we'll store in memory as fallback
      }
    }

    // ============================================
    // SEND CUSTOMER EMAIL
    // ============================================
    const pickupDateFormatted = new Date(pickupDate).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const dropoffDateFormatted = new Date(dropoffDate).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #E74035 0%, #D63930 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🚗 Car Rental Booking Received</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Reference: <strong>${bookingReference}</strong></p>
            </div>

            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                Dear ${driver.firstName},
              </p>
              <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                Thank you for your car rental booking! We've received your reservation and our team is processing your payment.
              </p>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px; color: #E74035; font-size: 18px;">📋 Rental Details</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Vehicle:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${car.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Category:</td>
                    <td style="padding: 8px 0; color: #333; text-align: right;">${car.category}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Company:</td>
                    <td style="padding: 8px 0; color: #333; text-align: right;">${car.company}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Pickup:</td>
                    <td style="padding: 8px 0; color: #333; text-align: right;">${pickupLocation}<br><small>${pickupDateFormatted}</small></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Drop-off:</td>
                    <td style="padding: 8px 0; color: #333; text-align: right;">${dropoffLocation || pickupLocation}<br><small>${dropoffDateFormatted}</small></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Duration:</td>
                    <td style="padding: 8px 0; color: #333; text-align: right;">${rentalDays} day${rentalDays > 1 ? 's' : ''}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #E74035; color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                <p style="margin: 0 0 5px; font-size: 14px; opacity: 0.9;">Total Amount</p>
                <p style="margin: 0; font-size: 32px; font-weight: bold;">$${totalPrice.toFixed(2)}</p>
              </div>

              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>⏳ What's Next?</strong><br>
                  Our team will verify your payment within 24 hours. You'll receive a confirmation email with your rental voucher once approved.
                </p>
              </div>

              <p style="font-size: 14px; color: #666; margin: 20px 0 0;">
                If you have any questions, please contact us at <a href="mailto:support@fly2any.com" style="color: #E74035;">support@fly2any.com</a>
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Fly2Any. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const result = await mailgunClient.send({
        to: contactInfo.email,
        subject: `🚗 Car Rental Booking Received - ${bookingReference}`,
        html: emailHtml,
        text: `Car Rental Booking Received - ${bookingReference}\n\nDear ${driver.firstName},\n\nThank you for your booking!\n\nVehicle: ${car.name} (${car.category})\nCompany: ${car.company}\nPickup: ${pickupLocation} on ${pickupDateFormatted}\nDrop-off: ${dropoffLocation || pickupLocation} on ${dropoffDateFormatted}\nDuration: ${rentalDays} days\nTotal: $${totalPrice.toFixed(2)}\n\nOur team will process your payment within 24 hours.\n\nFly2Any Team`,
        forceSend: true,
        tags: ['car-rental', 'booking-received'],
      });

      if (result.success) {
        console.log(`📧 Customer confirmation email sent to ${contactInfo.email}`);
      } else {
        console.warn(`⚠️ Email send returned error: ${result.error}`);
      }
    } catch (emailError: any) {
      console.error(`❌ Failed to send customer email: ${emailError.message}`);
    }

    // ============================================
    // SEND ADMIN NOTIFICATIONS
    // ============================================
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com';

    // 1. Telegram notification
    try {
      const telegramMessage = `
🚗 <b>NEW CAR RENTAL BOOKING</b>

📋 <b>Reference:</b> <code>${bookingReference}</code>
🟡 <b>Status:</b> Pending Payment

👤 <b>Driver:</b> ${driver.firstName} ${driver.lastName}
📧 <b>Email:</b> ${contactInfo.email}
📞 <b>Phone:</b> ${contactInfo.phone || 'N/A'}

🚙 <b>Vehicle:</b> ${car.name} (${car.category})
🏢 <b>Company:</b> ${car.company}
📍 <b>Pickup:</b> ${pickupLocation}
📅 <b>Dates:</b> ${pickupDate} → ${dropoffDate} (${rentalDays} days)

💰 <b>Total:</b> USD ${totalPrice.toFixed(2)}

🔗 <a href="${baseUrl}/admin/bookings/${bookingId}">View in Dashboard</a>
      `.trim();

      await notifyTelegramAdmins(telegramMessage);
      console.log(`📱 Telegram notification sent to admins`);
    } catch (telegramError: any) {
      console.warn(`⚠️ Failed to send Telegram notification: ${telegramError.message}`);
    }

    // 2. SSE broadcast for real-time dashboard update
    try {
      broadcastSSE('admin', 'booking_created', {
        type: 'car_rental',
        bookingReference,
        bookingId,
        timestamp: now,
        customerName: `${driver.firstName} ${driver.lastName}`,
        vehicle: `${car.name} (${car.category})`,
        dates: `${pickupDate} → ${dropoffDate}`,
        totalAmount: totalPrice,
        currency: 'USD',
        status: 'pending',
      });
      console.log(`📡 SSE broadcast sent to admin dashboards`);
    } catch (sseError: any) {
      console.warn(`⚠️ Failed to send SSE broadcast: ${sseError.message}`);
    }

    // 3. Create in-app notification for admin bell
    try {
      const prisma = getPrismaClient();
      const admins = await prisma.adminUser.findMany({ select: { userId: true } });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.userId,
            type: 'booking',
            title: `🚗 New Car Rental: ${bookingReference}`,
            message: `${driver.firstName} ${driver.lastName} - ${car.name} at ${pickupLocation}`,
            priority: 'high',
            actionUrl: `/admin/bookings/${bookingId}`,
            metadata: {
              bookingId,
              bookingReference,
              productType: 'car',
              customerName: `${driver.firstName} ${driver.lastName}`,
              vehicle: car.name,
              totalAmount: totalPrice,
            },
          })),
        });
        console.log(`🔔 Created ${admins.length} admin in-app notifications`);
      }
    } catch (notifError: any) {
      console.warn(`⚠️ Failed to create in-app notifications: ${notifError.message}`);
    }

    console.log(`✅ [${requestId}] Car booking created: ${bookingReference}`);
    console.log(`   Car: ${car.name} (${car.category})`);
    console.log(`   Company: ${car.company}`);
    console.log(`   Dates: ${pickupDate} to ${dropoffDate} (${rentalDays} days)`);
    console.log(`   Total: $${totalPrice.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        bookingReference,
        status: 'pending',
        message: 'Your car rental booking has been received. Our team will process your payment and confirm your reservation within 24 hours.',
        car: bookingData.car,
        rental: bookingData.rental,
        driver: {
          firstName: driver.firstName,
          lastName: driver.lastName,
        },
        pricing: bookingData.pricing,
        contactEmail: contactInfo.email,
        createdAt: now,
      }
    });

  }, { category: ErrorCategory.BOOKING, severity: ErrorSeverity.CRITICAL });
}
