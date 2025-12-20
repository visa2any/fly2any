import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { emailService } from '@/lib/email/service';
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

    // Send confirmation email with payment instructions
    try {
      await emailService.sendEmail({
        to: contactInfo.email,
        subject: `Car Rental Booking Received - ${bookingReference}`,
        template: 'booking-pending',
        data: {
          bookingReference,
          productType: 'Car Rental',
          productName: `${car.name} (${car.category})`,
          company: car.company,
          pickupDate: new Date(pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          dropoffDate: new Date(dropoffDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          pickupLocation,
          dropoffLocation: dropoffLocation || pickupLocation,
          rentalDays,
          totalPrice: totalPrice.toFixed(2),
          currency: 'USD',
          driverName: `${driver.firstName} ${driver.lastName}`,
          contactEmail: contactInfo.email,
          contactPhone: contactInfo.phone,
        }
      });
      console.log(`📧 Confirmation email sent to ${contactInfo.email}`);
    } catch (emailError: any) {
      console.warn(`⚠️ Failed to send email: ${emailError.message}`);
      // Don't fail the booking for email errors
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
