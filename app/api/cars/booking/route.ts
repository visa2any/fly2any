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

    // Calculate total price with markup: $30 or 20%, whichever is higher
    const supplierPrice = car.pricePerDay * rentalDays;
    const extrasTotal = extras?.reduce((sum: number, e: any) => sum + (e.price || 0), 0) || 0;
    const baseAmount = supplierPrice + extrasTotal;
    const percentMarkup = baseAmount * 0.20;
    const markup = Math.max(30, percentMarkup);
    const totalPrice = baseAmount + markup;
    const markupPercent = (markup / baseAmount) * 100;

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
        basePrice: supplierPrice,
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
        // Profit tracking (admin visibility)
        baseAmount: baseAmount,
        markup: markup,
        markupPercent: Math.round(markupPercent * 10) / 10,
        profit: markup,
        cardLast4: payment?.cardNumber?.slice(-4) || null,
        cardBrand: payment?.cardBrand || null,
        cardholderName: payment?.cardholderName || `${driver.firstName} ${driver.lastName}`,
      },

      // Timestamps
      createdAt: now,
      updatedAt: now,
    };

    // Store in database - CRITICAL: Must succeed for booking to be valid
    if (!sql) {
      console.error('❌ Database not configured');
      return NextResponse.json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Database connection not available'
      }, { status: 500 });
    }

    try {
      // Validate user_id is UUID format, otherwise set null (CUID from NextAuth is not UUID)
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
          'car',
          ${JSON.stringify(bookingData.contactInfo)},
          ${JSON.stringify({ type: 'car_rental', ...bookingData.car, rental: bookingData.rental })},
          ${JSON.stringify([bookingData.driver])},
          ${JSON.stringify([])},
          ${JSON.stringify(bookingData.payment)},
          ${pickupDate},
          ${dropoffDate},
          ${now},
          ${now}
        )
      `;
      console.log(`✅ Car booking saved to database: ${bookingReference}`);
    } catch (dbError: any) {
      console.error(`❌ Database error saving car booking: ${dbError.message}`);
      console.error('Full error:', dbError);
      // THROW error with full context for global error handler
      const errorContext = {
        type: 'CAR_BOOKING_DB_ERROR',
        customer: {
          email: bookingData.contactInfo?.email,
          name: `${bookingData.driver?.firstName} ${bookingData.driver?.lastName}`,
          phone: bookingData.contactInfo?.phone
        },
        product: {
          car: car.name || car.model,
          category: car.category,
          vendor: car.vendorName || car.supplier,
          pickup: bookingData.pickupLocation,
          dates: `${pickupDate} - ${dropoffDate}`
        },
        payment: {
          total: bookingData.payment?.total,
          currency: bookingData.payment?.currency
        },
        bookingRef: bookingReference
      };
      throw new Error(`DATABASE_ERROR: ${dbError.message} | Context: ${JSON.stringify(errorContext)}`);
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
      // Build vehicle specs display
      const vehicleSpecs = [
        car.transmission && `${car.transmission}`,
        car.passengers && `${car.passengers} seats`,
        car.doors && `${car.doors} doors`,
        car.luggage && `${car.luggage} bags`,
        car.fuelType && `${car.fuelType}`,
      ].filter(Boolean).join(' • ');

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Car Rental Confirmation - ${bookingReference}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7; -webkit-font-smoothing: antialiased;">
          <!-- Wrapper -->
          <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">

            <!-- Logo Header -->
            <div style="text-align: center; padding: 24px 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #E74035; letter-spacing: -0.5px;">Fly2Any</h1>
              <p style="margin: 4px 0 0; font-size: 13px; color: #86868b; font-weight: 500;">Car Rental Services</p>
            </div>

            <!-- Main Card -->
            <div style="background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">

              <!-- Status Header -->
              <div style="background: linear-gradient(135deg, #34C759 0%, #30B350 100%); padding: 28px 24px; text-align: center;">
                <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 28px;">✓</span>
                </div>
                <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 600;">Booking Received</h2>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">We're processing your reservation</p>
              </div>

              <!-- Booking Reference -->
              <div style="padding: 24px; background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: center;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Number</p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1d1d1f; letter-spacing: 2px; font-family: 'SF Mono', Monaco, monospace;">${bookingReference}</p>
              </div>

              <!-- Content -->
              <div style="padding: 24px;">

                <!-- Greeting -->
                <p style="font-size: 17px; color: #1d1d1f; margin: 0 0 20px; line-height: 1.5;">
                  Hello <strong>${driver.firstName}</strong>,<br>
                  Thank you for choosing Fly2Any for your car rental.
                </p>

                <!-- Vehicle Card -->
                <div style="background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f5 100%); border-radius: 16px; padding: 20px; margin: 20px 0;">
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="flex: 1;">
                      <p style="margin: 0 0 4px; font-size: 11px; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px;">${car.category}</p>
                      <h3 style="margin: 0 0 6px; font-size: 20px; font-weight: 600; color: #1d1d1f;">${car.name}</h3>
                      <p style="margin: 0 0 8px; font-size: 13px; color: #515154; font-weight: 500;">${car.company}</p>
                      <p style="margin: 0; font-size: 12px; color: #86868b;">${vehicleSpecs}</p>
                    </div>
                  </div>
                </div>

                <!-- Rental Details -->
                <div style="margin: 24px 0;">
                  <h4 style="margin: 0 0 16px; font-size: 13px; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Rental Details</h4>

                  <!-- Pickup -->
                  <div style="display: flex; align-items: flex-start; margin-bottom: 16px; padding: 16px; background: #f5fff5; border-radius: 12px; border-left: 3px solid #34C759;">
                    <div style="flex: 1;">
                      <p style="margin: 0 0 2px; font-size: 11px; color: #34C759; text-transform: uppercase; font-weight: 600;">Pick-up</p>
                      <p style="margin: 0 0 4px; font-size: 15px; color: #1d1d1f; font-weight: 600;">${pickupDateFormatted}</p>
                      <p style="margin: 0; font-size: 13px; color: #515154;">${pickupTime || '10:00 AM'} • ${pickupLocation}</p>
                    </div>
                  </div>

                  <!-- Dropoff -->
                  <div style="display: flex; align-items: flex-start; padding: 16px; background: #fff5f5; border-radius: 12px; border-left: 3px solid #E74035;">
                    <div style="flex: 1;">
                      <p style="margin: 0 0 2px; font-size: 11px; color: #E74035; text-transform: uppercase; font-weight: 600;">Drop-off</p>
                      <p style="margin: 0 0 4px; font-size: 15px; color: #1d1d1f; font-weight: 600;">${dropoffDateFormatted}</p>
                      <p style="margin: 0; font-size: 13px; color: #515154;">${dropoffTime || '10:00 AM'} • ${dropoffLocation || pickupLocation}</p>
                    </div>
                  </div>
                </div>

                <!-- Duration & Price Summary -->
                <div style="background: #1d1d1f; border-radius: 16px; padding: 20px; margin: 24px 0; text-align: center;">
                  <div style="display: flex; justify-content: space-around; text-align: center;">
                    <div>
                      <p style="margin: 0 0 4px; font-size: 12px; color: #86868b;">Duration</p>
                      <p style="margin: 0; font-size: 20px; font-weight: 700; color: white;">${rentalDays} Day${rentalDays > 1 ? 's' : ''}</p>
                    </div>
                    <div style="width: 1px; background: #3a3a3c;"></div>
                    <div>
                      <p style="margin: 0 0 4px; font-size: 12px; color: #86868b;">Total</p>
                      <p style="margin: 0; font-size: 20px; font-weight: 700; color: #34C759;">$${totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <!-- Driver Info -->
                <div style="margin: 24px 0;">
                  <h4 style="margin: 0 0 16px; font-size: 13px; color: #86868b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Driver Information</h4>
                  <table style="width: 100%; font-size: 14px; color: #1d1d1f;">
                    <tr>
                      <td style="padding: 8px 0; color: #86868b; width: 40%;">Name</td>
                      <td style="padding: 8px 0; font-weight: 500; text-align: right;">${driver.firstName} ${driver.lastName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #86868b;">Email</td>
                      <td style="padding: 8px 0; font-weight: 500; text-align: right;">${contactInfo.email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #86868b;">Phone</td>
                      <td style="padding: 8px 0; font-weight: 500; text-align: right;">${contactInfo.phone || 'Not provided'}</td>
                    </tr>
                  </table>
                </div>

                <!-- What to Bring Section -->
                <div style="background: #fffbeb; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #fef3c7;">
                  <h4 style="margin: 0 0 12px; font-size: 14px; color: #92400e; font-weight: 600;">What to Bring at Pick-up</h4>
                  <ul style="margin: 0; padding: 0 0 0 20px; font-size: 13px; color: #78350f; line-height: 1.8;">
                    <li>Valid driver's license (held for at least 1 year)</li>
                    <li>Credit card in driver's name for security deposit</li>
                    <li>Government-issued ID or passport</li>
                    <li>Printed or digital booking confirmation</li>
                  </ul>
                </div>

                <!-- Status Message -->
                <div style="background: #f0f9ff; border-radius: 12px; padding: 16px; margin: 24px 0; border: 1px solid #bae6fd;">
                  <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 20px;">⏳</span>
                    <div>
                      <h4 style="margin: 0 0 6px; font-size: 14px; color: #0369a1; font-weight: 600;">Payment Processing</h4>
                      <p style="margin: 0; font-size: 13px; color: #0c4a6e; line-height: 1.5;">
                        Our team is verifying your payment. You'll receive a confirmation email with your rental voucher within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 24px 16px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #86868b;">Need help? Contact our support team</p>
              <a href="mailto:support@fly2any.com" style="color: #E74035; font-size: 14px; font-weight: 600; text-decoration: none;">support@fly2any.com</a>
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0; font-size: 12px; color: #86868b;">© ${new Date().getFullYear()} Fly2Any. All rights reserved.</p>
                <p style="margin: 8px 0 0; font-size: 11px; color: #aeaeb2;">Your trusted travel partner</p>
              </div>
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
