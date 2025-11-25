import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { duffelAPI } from '@/lib/api/duffel';
import { bookingStorage } from '@/lib/bookings/storage';
import { emailService } from '@/lib/email/service';
import { paymentService } from '@/lib/payments/payment-service';
import { getPrismaClient } from '@/lib/prisma';
import type { Booking, FlightData, Passenger, SeatSelection, PaymentInfo, ContactInfo } from '@/lib/bookings/types';

/**
 * Flight Create Orders API - Complete Flight Booking
 *
 * CRITICAL: This is the ONLY route that creates real bookings and generates revenue!
 *
 * Workflow:
 * 1. Client confirms flight selection on booking page
 * 2. Client collects passenger information + payment
 * 3. Client calls this API to create the booking
 * 4. This API:
 *    a) Confirms current price with Flight Offers Price API
 *    b) Processes payment (via Stripe or payment gateway)
 *    c) Creates booking with Amadeus Flight Create Orders API
 *    d) Returns PNR (booking confirmation number)
 *
 * POST /api/flights/booking/create
 *
 * Request Body:
 * {
 *   flightOffer: {...},        // From Flight Offers Search/Price
 *   passengers: [...],         // Passenger details from booking form
 *   payment: {...},            // Payment information
 *   contactInfo: {...}         // Contact details
 * }
 *
 * Response:
 * {
 *   success: true,
 *   booking: {
 *     id: "...",              // Flight order ID
 *     pnr: "ABC123",          // Booking reference number
 *     status: "CONFIRMED",
 *     ...
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      flightOffer,
      passengers,
      payment,
      contactInfo,
      fareUpgrade,      // NEW: Fare tier selection (Basic, Standard, Flex, Business)
      bundle,           // NEW: Smart bundle selection
      addOns,           // NEW: All selected add-ons
      seats,            // NEW: Selected seats
      isHold,           // NEW: Whether to hold the booking (pay later)
      holdDuration      // NEW: Hold duration in hours
    } = body;

    // Validation
    if (!flightOffer) {
      return NextResponse.json(
        { error: 'Flight offer is required' },
        { status: 400 }
      );
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        { error: 'Passenger information is required' },
        { status: 400 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment information is required' },
        { status: 400 }
      );
    }

    console.log('📝 Processing flight booking...');
    console.log(`   Flight: ${flightOffer.id}`);
    console.log(`   Passengers: ${passengers.length}`);
    console.log(`   Total Price: ${flightOffer.price?.total} ${flightOffer.price?.currency}`);
    if (fareUpgrade) console.log(`   Fare Upgrade: ${fareUpgrade.fareName} (+${fareUpgrade.upgradePrice})`);
    if (bundle) console.log(`   Bundle: ${bundle.bundleName} (+${bundle.price})`);
    if (addOns && addOns.length > 0) console.log(`   Add-ons: ${addOns.length} selected`);

    // STEP 1: Confirm current price and availability
    // This is REQUIRED before booking to ensure the price hasn't changed
    console.log('💰 Confirming current price...');

    let confirmedOffer: any;
    const flightSource = flightOffer.source || 'GDS';

    // Only Amadeus/GDS flights support price confirmation API
    // Duffel offers are already live-priced at search time
    if (flightSource === 'Duffel') {
      console.log('🎫 Duffel flight - using offer directly (already live-priced)');
      confirmedOffer = flightOffer;
    } else {
      // Amadeus price confirmation
      try {
        const priceConfirmation = await amadeusAPI.confirmFlightPrice([flightOffer]);

        if (!priceConfirmation?.data || priceConfirmation.data.length === 0) {
          return NextResponse.json(
            {
              error: 'PRICE_CHECK_FAILED',
              message: 'Unable to confirm flight availability. Please search again.',
            },
            { status: 400 }
          );
        }

        confirmedOffer = priceConfirmation.data[0];

        // Check if price has changed
        const originalPrice = parseFloat(flightOffer.price.total);
        const currentPrice = parseFloat(confirmedOffer.price.total);

        if (Math.abs(currentPrice - originalPrice) > 0.01) {
          console.log(`⚠️  Price changed: ${originalPrice} -> ${currentPrice}`);
          return NextResponse.json(
            {
              error: 'PRICE_CHANGED',
              message: 'The price for this flight has changed. Please review the new price.',
              originalPrice,
              currentPrice,
              newOffer: confirmedOffer,
            },
            { status: 409 }
          );
        }

        console.log('✅ Price confirmed, proceeding with booking...');
      } catch (error: any) {
        console.error('Price confirmation error:', error);

        // If price confirmation fails, use original offer but warn user
        console.log('⚠️  Price confirmation unavailable, using original offer');
        confirmedOffer = flightOffer;
      }
    }

    // STEP 2: Format passenger data for Amadeus API
    // Amadeus requires specific format for traveler data
    const travelers = passengers.map((passenger: any, index: number) => {
      // Calculate date of birth for age verification
      const dateOfBirth = passenger.dateOfBirth || '1990-01-01';

      // Prepare loyalty program data if provided
      const loyaltyPrograms = [];
      if (passenger.frequentFlyerAirline && passenger.frequentFlyerNumber) {
        loyaltyPrograms.push({
          programOwner: passenger.frequentFlyerAirline,
          id: passenger.frequentFlyerNumber,
        });
      }

      return {
        id: (index + 1).toString(),
        dateOfBirth,
        name: {
          firstName: passenger.firstName?.toUpperCase(),
          lastName: passenger.lastName?.toUpperCase(),
        },
        gender: passenger.gender?.toUpperCase() === 'MALE' ? 'MALE' : 'FEMALE',
        contact: {
          emailAddress: passenger.email || contactInfo?.email,
          phones: [
            {
              deviceType: 'MOBILE',
              countryCallingCode: '1',
              number: passenger.phone?.replace(/\D/g, '') || contactInfo?.phone?.replace(/\D/g, '') || '0000000000',
            },
          ],
        },
        // Include loyalty programs in traveler data
        ...(loyaltyPrograms.length > 0 && { loyaltyPrograms }),
        documents: passenger.passportNumber ? [
          {
            documentType: 'PASSPORT',
            birthPlace: passenger.nationality || 'US',
            issuanceLocation: passenger.nationality || 'US',
            issuanceDate: passenger.passportIssueDate || '2020-01-01',
            number: passenger.passportNumber.toUpperCase(),
            expiryDate: passenger.passportExpiryDate || '2030-12-31',
            issuanceCountry: passenger.nationality || 'US',
            validityCountry: passenger.nationality || 'US',
            nationality: passenger.nationality || 'US',
            holder: true,
          },
        ] : undefined, // Only include documents if passport number is provided
      };
    });

    // STEP 3: Process payment or create hold order
    let paymentIntent: any = null;
    let holdPricing: any = null;
    let bookingStatus: 'confirmed' | 'pending' = 'pending';
    let paymentStatus: 'pending' | 'paid' = 'pending';

    if (isHold) {
      // HOLD BOOKING: Reserve without immediate payment
      console.log('⏸️  Creating hold booking (pay later)...');
      console.log(`   Hold Duration: ${holdDuration || 24} hours`);

      // Calculate hold pricing
      holdPricing = isHold && flightSource === 'Duffel'
        ? duffelAPI.calculateHoldPricing(holdDuration || 24)
        : paymentService.calculateHoldPricing(holdDuration || 24);

      console.log(`   Hold Price: ${holdPricing.price} ${holdPricing.currency}`);
      console.log(`   Expires At: ${holdPricing.expiresAt.toISOString()}`);

      // For holds, we don't process payment yet, just reserve the seats
      bookingStatus = 'pending';
      paymentStatus = 'pending';
      console.log('✅ Hold booking setup complete');
    } else {
      // INSTANT BOOKING: Process payment immediately
      console.log('💳 Processing payment...');

      try {
        // Calculate total amount (flight + upgrades + bundles + add-ons + hold fee)
        const baseAmount = parseFloat(confirmedOffer.price.total);
        const upgradeAmount = fareUpgrade?.upgradePrice || 0;
        const bundleAmount = bundle?.price || 0;
        const addOnsAmount = addOns?.reduce((sum: number, addon: any) => sum + (addon.price * (addon.quantity || 1)), 0) || 0;
        const totalAmount = baseAmount + upgradeAmount + bundleAmount + addOnsAmount;

        console.log(`   Base Amount: ${baseAmount}`);
        console.log(`   Upgrades: ${upgradeAmount}`);
        console.log(`   Bundle: ${bundleAmount}`);
        console.log(`   Add-ons: ${addOnsAmount}`);
        console.log(`   Total: ${totalAmount} ${confirmedOffer.price.currency}`);

        // Create payment intent with Stripe
        paymentIntent = await paymentService.createPaymentIntent({
          amount: totalAmount,
          currency: confirmedOffer.price.currency,
          bookingReference: `TEMP-${Date.now()}`, // Temporary, will be updated
          customerEmail: contactInfo?.email || passengers[0]?.email,
          customerName: `${passengers[0]?.firstName} ${passengers[0]?.lastName}`,
          description: `Flight booking: ${flightOffer.itineraries[0].segments[0].departure.iataCode} → ${flightOffer.itineraries[0].segments[flightOffer.itineraries[0].segments.length - 1].arrival.iataCode}`,
          metadata: {
            flightOfferId: confirmedOffer.id,
            passengerCount: passengers.length.toString(),
            source: flightSource,
          },
        });

        console.log('✅ Payment intent created successfully');
        console.log(`   Payment Intent ID: ${paymentIntent.paymentIntentId}`);

        // For now, booking stays pending until payment is confirmed by client
        bookingStatus = 'pending';
        paymentStatus = 'pending';
      } catch (error: any) {
        console.error('❌ Payment processing error:', error);
        return NextResponse.json(
          {
            error: 'PAYMENT_FAILED',
            message: 'Failed to create payment intent. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: 402 }
        );
      }
    }

    // STEP 4: Detect source and create booking with appropriate API
    // Use the flightSource already detected during price confirmation
    console.log(`✈️  Creating booking with detected source: ${flightSource}`);

    let flightOrder: any;
    let bookingId: string;
    let pnr: string;
    let isMockBooking: boolean = false;
    let duffelOrderId: string | undefined;
    let sourceApi: 'Amadeus' | 'Duffel';

    if (flightSource === 'Duffel') {
      // ========== DUFFEL BOOKING ==========
      console.log('🎫 Creating flight order with Duffel...');
      sourceApi = 'Duffel';

      try {
        let duffelOrder: any;

        if (isHold) {
          // Create hold order (pay later)
          duffelOrder = await duffelAPI.createHoldOrder(
            confirmedOffer,
            passengers,
            holdDuration
          );
        } else {
          // Create instant order (pay now)
          duffelOrder = await duffelAPI.createOrder(
            confirmedOffer,
            passengers,
            // payments can be added here for live mode
          );
        }

        // Extract booking details from Duffel response
        duffelOrderId = duffelAPI.extractOrderId(duffelOrder);
        pnr = duffelAPI.extractBookingReference(duffelOrder);
        bookingId = duffelOrderId;
        isMockBooking = !duffelOrder.data?.live_mode;

        // Store the complete Duffel order for reference
        flightOrder = duffelOrder;

        // If hold order, extract hold pricing
        if (isHold && duffelOrder.holdPricing) {
          holdPricing = duffelOrder.holdPricing;
        }

        console.log('✅ Duffel order created successfully!');
        console.log(`   Order ID: ${duffelOrderId}`);
        console.log(`   PNR: ${pnr}`);
        console.log(`   Type: ${isHold ? 'Hold (Pay Later)' : 'Instant (Paid)'}`);
        console.log(`   Live Mode: ${duffelOrder.data?.live_mode ? 'Yes (real booking)' : 'No (test mode)'}`);
      } catch (error: any) {
        console.error('❌ Duffel booking failed:', error);
        throw error; // Re-throw to be caught by outer error handler
      }
    } else {
      // ========== AMADEUS BOOKING ==========
      console.log('✈️  Creating flight order with Amadeus...');
      sourceApi = 'Amadeus';

      // Ensure flight offer has valid source for Amadeus API
      // Amadeus requires source to be 'GDS' for booking
      const bookingOffer = {
        ...confirmedOffer,
        source: 'GDS', // Override source to valid Amadeus value
      };

      flightOrder = await amadeusAPI.createFlightOrder({
        flightOffers: [bookingOffer],
        travelers,
        remarks: {
          general: [
            {
              subType: 'GENERAL_MISCELLANEOUS',
              text: 'Booked via FLY2ANY',
            },
          ],
        },
        contacts: [
          {
            addresseeName: {
              firstName: travelers[0].name.firstName,
              lastName: travelers[0].name.lastName,
            },
            companyName: 'FLY2ANY',
            purpose: 'STANDARD',
            phones: [
              {
                deviceType: 'MOBILE',
                countryCallingCode: '1',
                number: travelers[0].contact.phones[0].number,
              },
            ],
            emailAddress: travelers[0].contact.emailAddress,
            address: {
              lines: ['123 Main Street'], // Mock address line for Amadeus requirement
              postalCode: '10001',
              cityName: 'New York',
              countryCode: travelers[0].documents?.[0]?.nationality || 'US',
            },
          },
        ],
      });

      // Extract booking details
      bookingId = flightOrder.data?.id;
      pnr = flightOrder.data?.associatedRecords?.[0]?.reference;
      isMockBooking = flightOrder.meta?.mockData || false;

      console.log('✅ Amadeus order created successfully!');
      console.log(`   Booking ID: ${bookingId}`);
      console.log(`   PNR: ${pnr}`);
      console.log(`   Mock Booking: ${isMockBooking ? 'Yes (development mode)' : 'No (real booking)'}`);
    }

    if (!bookingId) {
      console.error('❌ No booking ID returned from API');
      return NextResponse.json(
        {
          error: 'BOOKING_FAILED',
          message: 'Failed to create booking. Please try again or contact support.',
        },
        { status: 500 }
      );
    }

    // STEP 5: Store booking in database
    console.log('💾 Saving booking to database...');

    try {
      // Transform Amadeus data to Booking format
      const flightData: FlightData = {
        id: confirmedOffer.id,
        type: confirmedOffer.oneWay ? 'one-way' : 'round-trip',
        segments: confirmedOffer.itineraries.flatMap((itinerary: any) =>
          itinerary.segments.map((seg: any) => ({
            id: seg.id || `${seg.carrierCode}${seg.number}`,
            departure: {
              iataCode: seg.departure.iataCode,
              terminal: seg.departure.terminal,
              at: seg.departure.at,
            },
            arrival: {
              iataCode: seg.arrival.iataCode,
              terminal: seg.arrival.terminal,
              at: seg.arrival.at,
            },
            carrierCode: seg.carrierCode,
            flightNumber: seg.number,
            aircraft: seg.aircraft?.code,
            duration: seg.duration,
            class: (seg.cabin?.toLowerCase() || 'economy') as any,
          }))
        ),
        price: {
          total: parseFloat(confirmedOffer.price.total),
          base: parseFloat(confirmedOffer.price.base),
          taxes: parseFloat(confirmedOffer.price.total) - parseFloat(confirmedOffer.price.base),
          fees: 0,
          currency: confirmedOffer.price.currency,
        },
        validatingAirlineCodes: confirmedOffer.validatingAirlineCodes,
      };

      // Transform passengers
      const bookingPassengers: Passenger[] = passengers.map((p: any, idx: number) => ({
        id: `passenger_${idx + 1}`,
        type: p.type || 'adult',
        title: p.title || 'Mr',
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth || '1990-01-01',
        nationality: p.nationality || 'US',
        passportNumber: p.passportNumber,
        passportExpiry: p.passportExpiryDate,
        email: p.email || contactInfo?.email,
        phone: p.phone || contactInfo?.phone,
        specialRequests: p.specialRequests || [],
        // Loyalty Program Integration
        frequentFlyerAirline: p.frequentFlyerAirline,
        frequentFlyerNumber: p.frequentFlyerNumber,
        tsaPreCheck: p.tsaPreCheck,
      }));

      // Prepare contact info
      const bookingContactInfo: ContactInfo = {
        email: contactInfo?.email || travelers[0].contact.emailAddress,
        phone: contactInfo?.phone || travelers[0].contact.phones[0].number,
        alternatePhone: contactInfo?.alternatePhone,
        emergencyContact: contactInfo?.emergencyContact,
      };

      // Prepare payment info with Stripe details
      const baseAmount = parseFloat(confirmedOffer.price.total);
      const upgradeAmount = fareUpgrade?.upgradePrice || 0;
      const bundleAmount = bundle?.price || 0;
      const addOnsAmount = addOns?.reduce((sum: number, addon: any) => sum + (addon.price * (addon.quantity || 1)), 0) || 0;
      const holdFee = isHold && holdPricing ? holdPricing.price : 0;
      const totalAmount = baseAmount + upgradeAmount + bundleAmount + addOnsAmount + holdFee;

      const paymentInfo: PaymentInfo = {
        method: payment.method === 'card' ? 'credit_card' : 'bank_transfer',
        status: paymentStatus,
        amount: totalAmount,
        currency: confirmedOffer.price.currency,
        paymentIntentId: paymentIntent?.paymentIntentId,
        clientSecret: paymentIntent?.clientSecret,
        cardLast4: payment.cardNumber?.slice(-4),
        cardBrand: payment.cardBrand || 'unknown',
      };

      // Create booking in database
      const savedBooking = await bookingStorage.create({
        status: bookingStatus,
        contactInfo: bookingContactInfo,
        flight: flightData,
        passengers: bookingPassengers,
        seats: seats || [], // Include selected seats from booking flow
        payment: paymentInfo,
        fareUpgrade: fareUpgrade || undefined, // Include fare upgrade if selected
        bundle: bundle || undefined, // Include bundle if selected
        addOns: addOns || [], // Include all selected add-ons
        specialRequests: passengers.flatMap((p: any) => p.specialRequests || []),
        refundPolicy: {
          refundable: fareUpgrade?.fareName !== 'Basic', // Basic fares non-refundable
          cancellationFee: fareUpgrade?.fareName === 'Flex' ? 0 : 50,
        },
        // Hold Booking Information
        isHold: isHold || false,
        holdDuration: holdPricing?.duration,
        holdPrice: holdPricing?.price,
        holdExpiresAt: holdPricing?.expiresAt?.toISOString(),
        holdTier: holdPricing?.tier,
        // API Source Tracking
        sourceApi,
        amadeusBookingId: sourceApi === 'Amadeus' ? bookingId : undefined,
        duffelOrderId: sourceApi === 'Duffel' ? duffelOrderId : undefined,
        duffelBookingReference: sourceApi === 'Duffel' ? pnr : undefined,
      });

      console.log('✅ Booking saved to database!');
      console.log(`   Database ID: ${savedBooking.id}`);
      console.log(`   Booking Reference: ${savedBooking.bookingReference}`);

      // STEP 6: Save card authorization if provided
      if (payment.signatureName && payment.authorizationAccepted) {
        console.log('🔐 Saving card authorization...');
        try {
          const prisma = getPrismaClient();

          // Detect card brand from number
          const detectCardBrand = (cardNum: string): string => {
            const num = cardNum?.replace(/\s/g, '') || '';
            if (/^4/.test(num)) return 'visa';
            if (/^5[1-5]/.test(num)) return 'mastercard';
            if (/^3[47]/.test(num)) return 'amex';
            if (/^6(?:011|5)/.test(num)) return 'discover';
            return 'unknown';
          };

          // Calculate risk score
          const calculateRiskScore = (): { score: number; factors: string[] } => {
            let score = 0;
            const factors: string[] = [];

            const amount = totalAmount;
            if (amount > 2000) { score += 15; factors.push('High-value transaction (>$2000)'); }
            if (amount > 5000) { score += 20; factors.push('Very high-value transaction (>$5000)'); }

            if (!payment.documents?.cardFront) { score += 10; factors.push('Card front image not provided'); }
            if (!payment.documents?.cardBack) { score += 5; factors.push('Card back image not provided'); }
            if (!payment.documents?.photoId) { score += 15; factors.push('ID document not provided'); }

            // Check for international billing
            if (payment.billingCountry && payment.billingCountry !== 'US') {
              score += 10;
              factors.push('International billing address');
            }

            return { score: Math.min(score, 100), factors };
          };

          const { score: riskScore, factors: riskFactors } = calculateRiskScore();

          await prisma.cardAuthorization.create({
            data: {
              bookingReference: savedBooking.bookingReference,
              cardholderName: payment.cardName || payment.signatureName,
              cardLast4: payment.cardNumber?.replace(/\s/g, '').slice(-4) || '0000',
              cardBrand: detectCardBrand(payment.cardNumber || ''),
              expiryMonth: parseInt(payment.expiryMonth || '1'),
              expiryYear: parseInt(payment.expiryYear || '25') + 2000,
              billingStreet: payment.billingAddress || 'Same as contact',
              billingCity: payment.billingCity || '',
              billingState: '',
              billingZip: payment.billingZip || '',
              billingCountry: payment.billingCountry || 'US',
              email: bookingContactInfo.email,
              phone: bookingContactInfo.phone || '',
              amount: totalAmount,
              currency: confirmedOffer.price.currency,
              cardFrontImage: payment.documents?.cardFront || null,
              cardBackImage: payment.documents?.cardBack || null,
              idDocumentImage: payment.documents?.photoId || null,
              signatureTyped: payment.signatureName,
              ackAuthorize: payment.authorizationAccepted,
              ackCardholder: payment.authorizationAccepted,
              ackNonRefundable: true,
              ackPassengerInfo: payment.authorizationAccepted,
              ackTerms: true,
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              userAgent: request.headers.get('user-agent') || undefined,
              status: 'PENDING',
              riskScore,
              riskFactors: riskFactors,
            },
          });

          console.log('✅ Card authorization saved');
          console.log(`   Risk Score: ${riskScore}/100`);
          if (riskFactors.length > 0) {
            console.log(`   Risk Factors: ${riskFactors.join(', ')}`);
          }

          // Send notification if high risk
          if (riskScore >= 50) {
            try {
              const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
              await notifyTelegramAdmins(`
⚠️ *High-Risk Authorization*

📋 *Booking:* ${savedBooking.bookingReference}
💰 *Amount:* ${confirmedOffer.price.currency} ${totalAmount.toLocaleString()}
🔴 *Risk Score:* ${riskScore}/100

❗ *Factors:*
${riskFactors.map(f => `• ${f}`).join('\n')}

Requires manual review.
              `.trim());
            } catch (notifyError) {
              console.error('⚠️ Failed to send risk notification:', notifyError);
            }
          }
        } catch (authError) {
          console.error('⚠️ Failed to save card authorization:', authError);
          // Don't fail the booking if authorization save fails
        }
      }

      // STEP 7: Send payment instructions email
      console.log('📧 Sending payment instructions email...');
      try {
        await emailService.sendPaymentInstructions(savedBooking);
        console.log('✅ Payment instructions email sent');
      } catch (emailError) {
        console.error('⚠️  Failed to send email, but booking was created:', emailError);
        // Don't fail the booking if email fails
      }

      // Return successful booking response
      return NextResponse.json(
        {
          success: true,
          booking: {
            id: savedBooking.id,
            bookingReference: savedBooking.bookingReference,
            sourceApi,
            amadeusBookingId: sourceApi === 'Amadeus' ? bookingId : undefined,
            duffelOrderId: sourceApi === 'Duffel' ? duffelOrderId : undefined,
            pnr,
            status: isHold ? 'HOLD' : 'PENDING_PAYMENT',
            isMockBooking,
            flightDetails: confirmedOffer,
            travelers,
            createdAt: savedBooking.createdAt,
            totalPrice: totalAmount,
            currency: confirmedOffer.price.currency,
            // Payment Intent (for immediate payment)
            paymentIntentId: paymentIntent?.paymentIntentId,
            clientSecret: paymentIntent?.clientSecret,
            // Hold Information (for hold bookings)
            isHold: isHold || false,
            holdDuration: holdPricing?.duration,
            holdPrice: holdPricing?.price,
            holdExpiresAt: holdPricing?.expiresAt?.toISOString(),
            holdTier: holdPricing?.tier,
          },
          message: isHold
            ? `Hold booking created via ${sourceApi}! Your booking is reserved for ${holdPricing?.duration} hours. Reference: ${savedBooking.bookingReference}`
            : `Booking created via ${sourceApi}! Please complete payment. Your booking reference is ${savedBooking.bookingReference}`,
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      // Even if database save fails, the booking was created with the API
      // Return success but note the database issue
      return NextResponse.json(
        {
          success: true,
          booking: {
            id: bookingId,
            sourceApi,
            amadeusBookingId: sourceApi === 'Amadeus' ? bookingId : undefined,
            duffelOrderId: sourceApi === 'Duffel' ? duffelOrderId : undefined,
            pnr,
            status: 'CONFIRMED',
            isMockBooking,
            flightDetails: confirmedOffer,
            travelers,
            createdAt: new Date().toISOString(),
            totalPrice: confirmedOffer.price.total,
            currency: confirmedOffer.price.currency,
          },
          warning: 'Booking created but database save failed. Please contact support.',
          message: isMockBooking
            ? `Mock booking created for development via ${sourceApi} (no real reservation made)`
            : `Booking confirmed via ${sourceApi}! Your PNR is ${pnr}`,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('❌ Booking error:', error);

    // Parse error messages from API (Amadeus or Duffel)
    const errorMessage = error.message || 'An unexpected error occurred';

    // Handle specific error types
    if (errorMessage.startsWith('SOLD_OUT:')) {
      return NextResponse.json(
        {
          error: 'SOLD_OUT',
          message: errorMessage.replace('SOLD_OUT:', '').trim(),
        },
        { status: 410 }
      );
    }

    if (errorMessage.startsWith('PRICE_CHANGED:')) {
      return NextResponse.json(
        {
          error: 'PRICE_CHANGED',
          message: errorMessage.replace('PRICE_CHANGED:', '').trim(),
        },
        { status: 409 }
      );
    }

    if (errorMessage.startsWith('INVALID_DATA:')) {
      return NextResponse.json(
        {
          error: 'INVALID_DATA',
          message: errorMessage.replace('INVALID_DATA:', '').trim(),
        },
        { status: 400 }
      );
    }

    if (errorMessage.startsWith('AUTHENTICATION_ERROR:')) {
      return NextResponse.json(
        {
          error: 'AUTHENTICATION_ERROR',
          message: 'Unable to process booking. Please contact support.',
        },
        { status: 500 }
      );
    }

    if (errorMessage.startsWith('API_ERROR:')) {
      return NextResponse.json(
        {
          error: 'API_ERROR',
          message: errorMessage.replace('API_ERROR:', '').trim(),
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'BOOKING_FAILED',
        message: 'Failed to create booking. Please try again or contact support.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
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
