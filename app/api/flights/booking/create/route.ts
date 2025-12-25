import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { duffelAPI } from '@/lib/api/duffel';
import { bookingStorage } from '@/lib/bookings/storage';
import { emailService } from '@/lib/email/service';
import { paymentService } from '@/lib/payments/payment-service';
import { getPrismaClient } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { Booking, FlightData, Passenger, SeatSelection, PaymentInfo, ContactInfo } from '@/lib/bookings/types';
import { checkRateLimit, addRateLimitHeaders } from '@/lib/security/rate-limiter';
import { BOOKING_RATE_LIMITS } from '@/lib/security/rate-limit-config';

// CRITICAL: Import flight markup to ensure customer is charged correct amount
import { applyFlightMarkup, determineRoutingChannel, ROUTING_THRESHOLD } from '@/lib/config/flight-markup';

// CRITICAL: Import offer freshness to prevent OFFER_EXPIRED errors
import { getOfferStatus, buildSearchUrl } from '@/lib/flights/offer-freshness';

// CRITICAL: Import error alerting system to notify admins of customer errors
import { alertApiError } from '@/lib/monitoring/customer-error-alerts';
import {
  handleApiError,
  safeBookingOperation,
  safePaymentOperation,
  safeApiCall,
  safeDbOperation,
  ErrorCategory,
  ErrorSeverity
} from '@/lib/monitoring/global-error-handler';

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
  // ULTRA-DIAGNOSTIC: Catch absolutely everything including module load errors
  try {
    // CRITICAL: Generate unique request ID for tracking through entire flow
    const requestId = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🚀 [${requestId}] BOOKING CREATE REQUEST RECEIVED`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`   URL: ${request.url}`);
    console.log(`   Method: ${request.method}`);

    // GLOBAL ERROR HANDLER - Catches ALL errors and sends alerts
    return await handleApiError(request, async () => {
    console.log(`\n📋 STEP 0: Request validation (ID: ${requestId})`);

    // Rate limiting check - strict limit for booking creation
    const rateLimitResult = await checkRateLimit(request, BOOKING_RATE_LIMITS.create);
    if (!rateLimitResult.success) {
      console.error(`❌ RATE LIMIT EXCEEDED (ID: ${requestId})`);
      const response = NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many booking attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
      return addRateLimitHeaders(response, rateLimitResult);
    }

    // Get session for tracking user ID (optional - bookings don't require auth)
    const session = await auth();

    console.log(`📝 Parsing request body (ID: ${requestId})...`);
    let body: any;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error(`❌ FAILED TO PARSE JSON (ID: ${requestId}):`, parseError.message);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    console.log(`✅ Body received with keys: ${Object.keys(body).join(', ')}`);

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
      holdDuration,     // NEW: Hold duration in hours
      promoCode,        // NEW: Promo code discount
    } = body;

    console.log(`\n📦 REQUEST DATA (ID: ${requestId}):`);
    console.log(`   - flightOffer: ${flightOffer?.id ? '✅ Present' : '❌ MISSING'}`);
    console.log(`   - passengers: ${passengers?.length || 0} passenger(s)`);
    console.log(`   - payment: ${payment ? '✅ Present' : '❌ MISSING'}`);
    console.log(`   - contactInfo: ${contactInfo?.email ? '✅ Present' : '❌ MISSING'}`);
    console.log(`   - isHold: ${isHold}`);

    // Validate critical fields
    if (!flightOffer || !passengers || !contactInfo) {
      const missing = [];
      if (!flightOffer) missing.push('flightOffer');
      if (!passengers) missing.push('passengers');
      if (!contactInfo) missing.push('contactInfo');
      console.error(`❌ VALIDATION ERROR - Missing fields: ${missing.join(', ')}`);
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OFFER EXPIRATION PRE-CHECK (Duffel offers expire after 30 minutes)
    // ═══════════════════════════════════════════════════════════════════════
    const isDuffelOffer = flightOffer.source === 'Duffel' || flightOffer.id?.startsWith('off_');
    if (isDuffelOffer) {
      // Pass full flightOffer to extract expires_at timestamp from Duffel
      const offerStatus = getOfferStatus(flightOffer.id, flightOffer);
      console.log(`⏱️  OFFER VALIDITY CHECK: ${flightOffer.id}`);
      console.log(`   ✓ Expires At: ${flightOffer.expires_at || flightOffer.duffelMetadata?.expires_at || flightOffer.lastTicketingDateTime || 'MISSING!'}`);
      console.log(`   ✓ Created At: ${flightOffer.created_at || flightOffer.createdAt || 'not provided'}`);
      console.log(`   ✓ Valid: ${offerStatus.isValid}, Remaining: ${offerStatus.remainingMinutes}min ${offerStatus.remainingSeconds % 60}sec`);
      console.log(`   ✓ Warning: ${offerStatus.isWarning}, ShouldRefresh: ${offerStatus.shouldRefresh}`);

      if (!offerStatus.isValid) {
        console.error(`❌ OFFER EXPIRED: ${flightOffer.id}`);

        // Build re-search URL from offer data
        const origin = flightOffer.itineraries?.[0]?.segments?.[0]?.departure?.iataCode;
        const destination = flightOffer.itineraries?.[0]?.segments?.[flightOffer.itineraries[0]?.segments?.length - 1]?.arrival?.iataCode;
        const departureDate = flightOffer.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')[0];
        const returnDate = flightOffer.itineraries?.[1]?.segments?.[0]?.departure?.at?.split('T')[0];

        const searchUrl = buildSearchUrl({
          origin: origin || '',
          destination: destination || '',
          departureDate: departureDate || '',
          returnDate,
          passengers: passengers.length,
        });

        // Alert admin
        await alertApiError(request, new Error('OFFER_EXPIRED before booking attempt'), {
          errorCode: 'OFFER_EXPIRED_PREFLIGHT',
          endpoint: '/api/flights/booking/create',
          userEmail: contactInfo?.email,
          customerName: `${passengers[0]?.firstName || ''} ${passengers[0]?.lastName || ''}`.trim(),
          customerPhone: contactInfo?.phone,
          offerId: flightOffer.id,
          flightRoute: `${origin} → ${destination}`,
          departureDate,
          amount: parseFloat(flightOffer.price?.total || '0'),
          currency: flightOffer.price?.currency || 'USD',
        }, { priority: 'normal' }).catch(() => {});

        return NextResponse.json({
          success: false,
          error: 'OFFER_EXPIRED',
          message: 'This flight offer has expired. Flight prices are only guaranteed for 30 minutes. Please search again for current prices.',
          searchUrl,
          offerAge: `${30 - offerStatus.remainingMinutes} minutes old`,
        }, { status: 410 });
      }

      // Warn if close to expiring
      if (offerStatus.isWarning) {
        console.warn(`⚠️  Offer expiring soon: ${offerStatus.remainingMinutes}min remaining`);
      }
    }

    // Declare payment and booking status variables early to avoid TDZ issues
    let paymentIntent: any = null;
    let paymentStatus: 'pending' | 'paid' = 'pending';
    let bookingStatus: 'confirmed' | 'pending' = 'pending';

    // Validation - with error alerting
    if (!flightOffer) {
      // CRITICAL: Alert admin about validation failure
      await alertApiError(request, new Error('Flight offer is required'), {
        errorCode: 'VALIDATION_ERROR',
        endpoint: '/api/flights/booking/create',
        userEmail: contactInfo?.email || passengers?.[0]?.email,
      }, {
        priority: 'normal',
      }).catch(err => console.error('Failed to send alert:', err));

      return NextResponse.json(
        { error: 'Flight offer is required' },
        { status: 400 }
      );
    }

    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      // CRITICAL: Alert admin about validation failure
      await alertApiError(request, new Error('Passenger information is required'), {
        errorCode: 'VALIDATION_ERROR',
        endpoint: '/api/flights/booking/create',
        userEmail: contactInfo?.email,
      }, {
        priority: 'normal',
      }).catch(err => console.error('Failed to send alert:', err));

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

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 BOOKING FLOW STARTED - COMPLETE TRACKABLE PROCESS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 Processing flight booking...');
    console.log(`   Flight Offer ID: ${flightOffer.id}`);
    console.log(`   Passengers: ${passengers.length}`);
    console.log(`   Total Price: ${flightOffer.price?.total} ${flightOffer.price?.currency}`);
    console.log(`   Booking Reference (Pre-generated): ${preGeneratedBookingRef || 'PENDING'}`);
    if (fareUpgrade) console.log(`   Fare Upgrade: ${fareUpgrade.fareName} (+${fareUpgrade.upgradePrice})`);
    if (bundle) console.log(`   Bundle: ${bundle.bundleName} (+${bundle.price})`);
    if (addOns && addOns.length > 0) console.log(`   Add-ons: ${addOns.length} selected`);

    // STEP 1: Confirm current price and availability
    // This is REQUIRED before booking to ensure the price hasn't changed
    console.log('💰 Confirming current price...');

    let confirmedOffer: any;
    let flightSource = flightOffer.source || 'GDS';

    // Extract NET price (before markup) from the offer - this is what we pay the API
    const totalFare = parseFloat(flightOffer.price?.total || '0');

    // ROUTING LOGIC: Determine channel based on price threshold
    // Rule 1: Under $500 → Always Duffel (auto-ticket, ancillary opportunity)
    // Rule 2: $500+ → Check if Duffel available, else Consolidator (manual ticket)
    const hasCommission = false; // TODO: Check airline commission table
    const routing = determineRoutingChannel(totalFare, hasCommission);

    console.log(`🔀 ROUTING DECISION:`);
    console.log(`   Total Fare: $${totalFare.toFixed(2)}`);
    console.log(`   Threshold: $${ROUTING_THRESHOLD.priceThreshold}`);
    console.log(`   Original Source: ${flightSource}`);
    console.log(`   Routing Channel: ${routing.channel}`);
    console.log(`   Reason: ${routing.reason}`);

    // Apply routing override: If under $500 and source is GDS, check if Duffel offer exists
    if (routing.channel === 'DUFFEL' && flightSource === 'GDS') {
      // Under $500 but source is GDS - keep as GDS (no Duffel offer available)
      // This flight will go to manual ticketing
      console.log(`   ⚠️ Under $${ROUTING_THRESHOLD.priceThreshold} but no Duffel offer - proceeding with GDS/Manual`);
    } else if (routing.channel === 'CONSOLIDATOR' && flightSource === 'Duffel') {
      // Over $500 with Duffel source - keep as Duffel (still profitable)
      console.log(`   ✅ Over $${ROUTING_THRESHOLD.priceThreshold} with Duffel - auto-ticketing enabled`);
    }

    // Extract NET price (before markup) from the offer - this is what we pay the API
    // The frontend sends the marked-up price in price.total, but we stored _netPrice
    const originalNetPrice = parseFloat(flightOffer.price?._netPrice || flightOffer.price?.total || '0');
    const originalCustomerPrice = parseFloat(flightOffer.price?.total || '0');

    console.log(`   Original NET price: $${originalNetPrice.toFixed(2)}`);
    console.log(`   Original Customer price: $${originalCustomerPrice.toFixed(2)}`);

    // Only Amadeus/GDS flights support price confirmation API
    // Duffel offers are already live-priced at search time
    if (flightSource === 'Duffel') {
      console.log('🎫 Duffel flight - using offer directly (already live-priced)');

      // CRITICAL: Ensure Duffel offer has markup applied
      // If _netPrice exists, markup was applied in search; if not, apply it now
      const hasMarkupApplied = !!flightOffer.price?._netPrice;

      if (hasMarkupApplied) {
        console.log(`   Markup already applied: NET $${flightOffer.price._netPrice} → Customer $${flightOffer.price.total}`);
        confirmedOffer = flightOffer;
      } else {
        // Apply markup now (fallback for old cached offers or direct API calls)
        console.log('   ⚠️ No markup found - applying markup to Duffel offer');
        const duffelNetPrice = parseFloat(flightOffer.price.total);
        const duffelMarkup = applyFlightMarkup(duffelNetPrice);

        confirmedOffer = {
          ...flightOffer,
          price: {
            ...flightOffer.price,
            total: duffelMarkup.customerPrice.toString(),
            grandTotal: duffelMarkup.customerPrice.toString(),
            _netPrice: duffelNetPrice.toString(),
            _markupAmount: duffelMarkup.markupAmount.toString(),
            _markupPercentage: duffelMarkup.markupPercentage,
          },
        };
        console.log(`   Applied markup: NET $${duffelNetPrice.toFixed(2)} → Customer $${duffelMarkup.customerPrice.toFixed(2)}`);
      }
    } else {
      // Amadeus price confirmation
      try {
        const priceConfirmation = await safeApiCall(
          () => amadeusAPI.confirmFlightPrice([flightOffer]),
          'Amadeus Price Confirmation',
          {
            userEmail: contactInfo?.email || passengers?.[0]?.email,
            endpoint: '/api/flights/booking/create',
            flightRoute: `${flightOffer.itineraries[0]?.segments[0]?.departure?.iataCode} → ${flightOffer.itineraries[0]?.segments[flightOffer.itineraries[0]?.segments.length - 1]?.arrival?.iataCode}`,
          }
        );

        if (!priceConfirmation?.data || priceConfirmation.data.length === 0) {
          return NextResponse.json(
            {
              error: 'PRICE_CHECK_FAILED',
              message: 'Unable to confirm flight availability. Please search again.',
            },
            { status: 400 }
          );
        }

        const confirmedNetOffer = priceConfirmation.data[0];
        const confirmedNetPrice = parseFloat(confirmedNetOffer.price.total);

        // Check if NET price has changed (compare API prices, not marked-up prices)
        if (Math.abs(confirmedNetPrice - originalNetPrice) > 1.00) { // $1 tolerance
          console.log(`⚠️  NET Price changed: $${originalNetPrice.toFixed(2)} -> $${confirmedNetPrice.toFixed(2)}`);

          // Apply markup to the NEW net price for customer display
          const newMarkup = applyFlightMarkup(confirmedNetPrice);
          const newCustomerPrice = newMarkup.customerPrice;

          return NextResponse.json(
            {
              error: 'PRICE_CHANGED',
              message: 'The price for this flight has changed. Please review the new price.',
              originalPrice: originalCustomerPrice,
              currentPrice: newCustomerPrice, // Show customer the new marked-up price
              newOffer: {
                ...confirmedNetOffer,
                price: {
                  ...confirmedNetOffer.price,
                  total: newCustomerPrice.toString(),
                  grandTotal: newCustomerPrice.toString(),
                  _netPrice: confirmedNetPrice.toString(),
                },
              },
            },
            { status: 409 }
          );
        }

        // CRITICAL: Apply markup to the confirmed NET price
        // The API returns NET price, but we charge customer the marked-up price
        const confirmedMarkup = applyFlightMarkup(confirmedNetPrice);

        confirmedOffer = {
          ...confirmedNetOffer,
          price: {
            ...confirmedNetOffer.price,
            // Customer-facing price (with markup)
            total: confirmedMarkup.customerPrice.toString(),
            grandTotal: confirmedMarkup.customerPrice.toString(),
            // Internal tracking (NET price for margin calculation)
            _netPrice: confirmedNetPrice.toString(),
            _markupAmount: confirmedMarkup.markupAmount.toString(),
            _markupPercentage: confirmedMarkup.markupPercentage,
          },
        };

        console.log(`✅ Price confirmed with markup:`);
        console.log(`   NET (API): $${confirmedNetPrice.toFixed(2)}`);
        console.log(`   Customer: $${confirmedMarkup.customerPrice.toFixed(2)} (+$${confirmedMarkup.markupAmount.toFixed(2)} markup)`);
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

      // CRITICAL FIX: Amadeus requires valid email for all travelers
      // Fallback: use contactInfo email, or construct a placeholder if missing
      // (placeholder should never be used in production - this is a safety net)
      const travelerEmail = passenger.email || contactInfo?.email || `traveler${index + 1}@booking.fly2any.com`;
      const travelerPhone = passenger.phone?.replace(/\D/g, '') || contactInfo?.phone?.replace(/\D/g, '') || '0000000000';

      if (!passenger.email && !contactInfo?.email) {
        console.warn(`⚠️ Missing email for traveler ${index + 1}: ${passenger.firstName} ${passenger.lastName}`);
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
          emailAddress: travelerEmail,
          phones: [
            {
              deviceType: 'MOBILE',
              countryCallingCode: '1',
              number: travelerPhone,
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

    // STEP 3: PRE-GENERATE booking reference (before any API calls)
    // This ensures the webhook can find the booking after payment succeeds
    console.log('📋 STEP 3: Pre-generating booking reference...');

    const preGeneratedBookingRef = await safeDbOperation(
      () => bookingStorage.generateBookingReference(),
      'Generate Booking Reference',
      {
        userEmail: contactInfo?.email || passengers[0]?.email,
        endpoint: '/api/flights/booking/create',
      }
    );
    console.log(`   ✅ Booking reference generated: ${preGeneratedBookingRef}`);

    // STEP 4: Create airline booking FIRST (before payment)
    // This is the most likely step to fail, so we do it before charging the customer
    // Use the flightSource already detected during price confirmation
    console.log(`✈️  STEP 4: Creating booking with detected source: ${flightSource}`);

    let flightOrder: any;
    let bookingId: string;
    let pnr: string;
    let isMockBooking: boolean = false;
    let duffelOrderId: string | undefined;
    let sourceApi: 'Amadeus' | 'Duffel';
    let holdPricing: any = null;

    // Check for SEPARATE TICKET flights (mixed carrier combinations)
    const isSeparateTickets = flightOffer.isSeparateTickets === true;
    const separateTicketDetails = flightOffer.separateTicketDetails;

    if (isSeparateTickets && separateTicketDetails) {
      // ========== SEPARATE TICKETS BOOKING (2 BOOKINGS - CROSS-PROVIDER SUPPORTED) ==========
      console.log('🎫 Creating SEPARATE TICKET bookings (mixed carrier)...');

      const outboundOffer = separateTicketDetails.outboundFlight;
      const returnOffer = separateTicketDetails.returnFlight;

      // Detect source for each flight
      const getFlightSource = (offer: any): 'Duffel' | 'Amadeus' => {
        if (offer.source === 'Duffel' || offer.id?.startsWith('off_')) return 'Duffel';
        return 'Amadeus';
      };

      const outboundSource = getFlightSource(outboundOffer);
      const returnSource = getFlightSource(returnOffer);
      const isCrossProvider = outboundSource !== returnSource;

      console.log(`   📊 Provider Detection:`);
      console.log(`      Outbound: ${outboundSource} (ID: ${outboundOffer.id})`);
      console.log(`      Return: ${returnSource} (ID: ${returnOffer.id})`);
      console.log(`      Cross-Provider: ${isCrossProvider ? 'YES' : 'NO'}`);

      // Validate IDs based on their source
      const validateOfferId = (id: string, source: 'Duffel' | 'Amadeus'): boolean => {
        if (!id) return false;
        if (source === 'Duffel') return id.startsWith('off_') || id.length > 20;
        // Amadeus uses numeric string IDs like "1", "2", etc.
        return id.length > 0;
      };

      if (!validateOfferId(outboundOffer?.id, outboundSource) || !validateOfferId(returnOffer?.id, returnSource)) {
        console.error(`❌ Invalid offer IDs: outbound=${outboundOffer?.id}(${outboundSource}), return=${returnOffer?.id}(${returnSource})`);
        return NextResponse.json({
          success: false,
          error: 'INVALID_OFFER_DATA',
          message: 'Flight offer data is invalid. Please search again.',
          details: { outboundId: outboundOffer?.id, returnId: returnOffer?.id }
        }, { status: 400 });
      }

      sourceApi = isCrossProvider ? 'Duffel' : outboundSource; // Primary source for logging

      try {
        console.log('🎫 Creating SEPARATE TICKET bookings...');
        console.log(`   Outbound: ${outboundOffer.id} via ${outboundSource} ($${outboundOffer.price.total})`);
        console.log(`   Return: ${returnOffer.id} via ${returnSource} ($${returnOffer.price.total})`);

        // Book function based on source
        const bookFlight = async (offer: any, source: 'Duffel' | 'Amadeus', label: string) => {
          if (source === 'Duffel') {
            return await safeBookingOperation(
              () => duffelAPI.createOrder(offer, passengers),
              `Create ${label} Duffel Order`,
              { userEmail: contactInfo?.email, endpoint: '/api/flights/booking/create' }
            );
          } else {
            // Amadeus flights route to MANUAL TICKETING (no API call)
            // Return a mock response for consolidator workflow
            console.log(`🎫 ${label}: Amadeus flight routed to MANUAL TICKETING`);
            const manualRef = `AMX-${Date.now().toString(36).toUpperCase()}`;
            return {
              data: {
                id: manualRef,
                type: 'manual_ticketing',
                status: 'pending_ticketing',
                associatedRecords: [{ reference: manualRef, origin: 'CONSOLIDATOR' }],
              },
              isManualTicketing: true,
              offer, // Keep original offer for storage
            };
          }
        };

        // Book both flights in parallel (each to its correct provider)
        const [outboundOrder, returnOrder] = await Promise.all([
          bookFlight(outboundOffer, outboundSource, 'Outbound'),
          bookFlight(returnOffer, returnSource, 'Return'),
        ]);

        // Extract PNR based on provider
        const extractPnr = (order: any, source: 'Duffel' | 'Amadeus'): string => {
          if (source === 'Duffel') {
            return duffelAPI.extractBookingReference(order);
          } else {
            // Amadeus format: order.data.associatedRecords[0].reference
            return order?.data?.associatedRecords?.[0]?.reference ||
                   order?.data?.id ||
                   order?.associatedRecords?.[0]?.reference ||
                   'N/A';
          }
        };

        const extractOrderId = (order: any, source: 'Duffel' | 'Amadeus'): string => {
          if (source === 'Duffel') {
            return duffelAPI.extractOrderId(order);
          } else {
            return order?.data?.id || order?.id || 'N/A';
          }
        };

        console.log('📦 Extracting booking references...');
        const outboundPnr = extractPnr(outboundOrder, outboundSource);
        const returnPnr = extractPnr(returnOrder, returnSource);
        const outboundOrderId = extractOrderId(outboundOrder, outboundSource);
        const returnOrderId = extractOrderId(returnOrder, returnSource);

        pnr = `${outboundPnr}/${returnPnr}`; // Combined PNR display
        bookingId = outboundOrderId;
        duffelOrderId = outboundSource === 'Duffel' ? outboundOrderId : (returnSource === 'Duffel' ? returnOrderId : undefined);
        isMockBooking = outboundSource === 'Duffel' ? !outboundOrder.data?.live_mode : false;

        console.log(`   Outbound: ${outboundSource} PNR=${outboundPnr} ID=${outboundOrderId}`);
        console.log(`   Return: ${returnSource} PNR=${returnPnr} ID=${returnOrderId}`);

        // Validate extraction
        if (!outboundPnr || outboundPnr === 'N/A' || !returnPnr || returnPnr === 'N/A') {
          console.error('❌ Failed to extract PNRs from separate ticket orders');
          throw new Error(`Booking failed: Invalid response. Outbound: ${outboundPnr}, Return: ${returnPnr}`);
        }

        flightOrder = {
          outboundOrder,
          returnOrder,
          isSeparateTickets: true,
          providers: { outbound: outboundSource, return: returnSource, isCrossProvider },
        };

        console.log('✅ Separate ticket bookings created!');
        console.log(`   Combined PNR: ${pnr}`);
      } catch (error: any) {
        console.error('❌ Separate ticket booking failed');
        console.error('   Error:', error.message);
        if (error.response) {
          console.error('   HTTP Status:', error.response.status);
        }

        let userFriendlyError = 'Failed to create booking. One or both flights may no longer be available.';
        let errorCode = 'SEPARATE_TICKET_FAILED';
        let statusCode = 500;

        // Check errors from both APIs
        const apiErrors = error.response?.data?.errors || error.response?.data?.error?.errors || [];
        const errorMsg = error.message?.toLowerCase() || '';

        // Sold out check
        if (apiErrors.some((e: any) =>
          e.code === 'offer_no_longer_available' ||
          e.title?.toLowerCase().includes('no longer available') ||
          e.detail?.toLowerCase().includes('sold out')
        ) || errorMsg.includes('sold out') || errorMsg.includes('no longer available')) {
          userFriendlyError = 'One or both flights are no longer available. Please search again.';
          errorCode = 'SOLD_OUT';
          statusCode = 410;
        }

        // Price change check
        if (apiErrors.some((e: any) =>
          e.code === 'offer_price_changed' ||
          e.title?.toLowerCase().includes('price changed')
        ) || errorMsg.includes('price changed')) {
          userFriendlyError = 'The price has changed. Please review and try again.';
          errorCode = 'PRICE_CHANGED';
          statusCode = 409;
        }

        // Alert admin
        await alertApiError(request, error, {
          errorCode,
          endpoint: '/api/flights/booking/create',
          userEmail: contactInfo?.email,
          amount: parseFloat(outboundOffer.price.total) + parseFloat(returnOffer.price.total),
          currency: outboundOffer.price.currency,
          bookingType: 'SEPARATE_TICKETS_CROSS_PROVIDER',
          outboundSource,
          returnSource,
          isCrossProvider,
        }, { priority: statusCode >= 500 ? 'critical' : 'high' }).catch(() => {});

        return NextResponse.json({
          success: false,
          error: errorCode,
          message: userFriendlyError,
        }, { status: statusCode });
      }
    } else if (flightSource === 'Duffel') {
      // ========== DUFFEL BOOKING ==========
      console.log('🎫 Creating flight order with Duffel...');
      sourceApi = 'Duffel';

      try {
        let duffelOrder: any;
        let startTime = Date.now();

        if (isHold) {
          // Create hold order (pay later)
          console.log('⏸️  Creating hold booking (pay later)...');
          console.log(`   Hold Duration: ${holdDuration || 24} hours`);
          console.log(`   Offer ID: ${confirmedOffer.id}`);
          console.log(`   Passengers: ${passengers.length}`);
          console.log(`   Calling: duffelAPI.createHoldOrder()`);

          startTime = Date.now();
          duffelOrder = await safeBookingOperation(
            () => duffelAPI.createHoldOrder(
              confirmedOffer,
              passengers,
              holdDuration
            ),
            'Create Duffel Hold Order',
            {
              userEmail: contactInfo?.email || passengers[0]?.email,
              endpoint: '/api/flights/booking/create',
              amount: parseFloat(confirmedOffer.price.total),
              currency: confirmedOffer.price.currency,
              flightRoute: `${confirmedOffer.itineraries[0]?.segments[0]?.departure?.iataCode} → ${confirmedOffer.itineraries[0]?.segments[confirmedOffer.itineraries[0]?.segments.length - 1]?.arrival?.iataCode}`,
            }
          );

          // Extract hold pricing
          holdPricing = duffelAPI.calculateHoldPricing(holdDuration || 24);
          console.log(`   Hold Price: ${holdPricing.price} ${holdPricing.currency}`);
          console.log(`   Expires At: ${holdPricing.expiresAt.toISOString()}`);
        } else {
          // Create instant order (pay now)
          console.log('📝 Request details:');
          console.log(`   Offer ID: ${confirmedOffer.id}`);
          console.log(`   Offer Price: $${confirmedOffer.price.total} ${confirmedOffer.price.currency}`);
          console.log(`   Passengers count: ${passengers.length}`);
          console.log(`   First passenger: ${passengers[0]?.firstName} ${passengers[0]?.lastName}`);

          // DIAGNOSTIC: Log full passenger data being sent
          console.log('📋 DIAGNOSTIC - Passenger data:');
          passengers.forEach((p: any, idx: number) => {
            console.log(`   Passenger ${idx + 1}:`);
            console.log(`     - Name: ${p.firstName} ${p.lastName}`);
            console.log(`     - DOB: ${p.dateOfBirth}`);
            console.log(`     - Email: ${p.email}`);
            console.log(`     - Phone: ${p.phone}`);
            console.log(`     - Gender: ${p.gender}`);
          });

          // DIAGNOSTIC: Log offer structure
          console.log('📋 DIAGNOSTIC - Offer structure:');
          console.log(`   - id: ${confirmedOffer.id}`);
          console.log(`   - source: ${confirmedOffer.source}`);
          console.log(`   - itineraries: ${confirmedOffer.itineraries?.length}`);
          console.log(`   - price.total: ${confirmedOffer.price?.total}`);

          console.log(`   Calling: duffelAPI.createOrder()`);

          const startTime = Date.now();
          duffelOrder = await safeBookingOperation(
            () => duffelAPI.createOrder(
              confirmedOffer,
              passengers,
              // payments can be added here for live mode
            ),
            'Create Duffel Instant Order',
            {
              userEmail: contactInfo?.email || passengers[0]?.email,
              endpoint: '/api/flights/booking/create',
              amount: parseFloat(confirmedOffer.price.total),
              currency: confirmedOffer.price.currency,
              flightRoute: `${confirmedOffer.itineraries[0]?.segments[0]?.departure?.iataCode} → ${confirmedOffer.itineraries[0]?.segments[confirmedOffer.itineraries[0]?.segments.length - 1]?.arrival?.iataCode}`,
            }
          );
        }

        // Extract booking details from Duffel response
        const responseTime = Date.now() - startTime;
        console.log('📦 Duffel response received:');
        console.log(`   Response time: ${responseTime}ms`);
        console.log(`   Response type: ${typeof duffelOrder}`);
        console.log(`   Is null: ${duffelOrder === null}`);
        console.log(`   Is undefined: ${duffelOrder === undefined}`);
        console.log(`   Has data property: ${!!duffelOrder?.data}`);
        console.log(`   Has id property: ${!!duffelOrder?.id}`);
        console.log(`   Has booking_reference: ${!!duffelOrder?.booking_reference}`);
        console.log(`   data.id: ${duffelOrder?.data?.id}`);
        console.log(`   data.booking_reference: ${duffelOrder?.data?.booking_reference}`);
        console.log(`   Full response (first 800 chars):`, JSON.stringify(duffelOrder).substring(0, 800));

        duffelOrderId = duffelAPI.extractOrderId(duffelOrder);
        pnr = duffelAPI.extractBookingReference(duffelOrder);
        bookingId = duffelOrderId;
        isMockBooking = !duffelOrder.data?.live_mode;

        console.log(`   Extracted Order ID: ${duffelOrderId}`);
        console.log(`   Extracted PNR: ${pnr}`);
        console.log(`   Is valid ID: ${duffelOrderId && duffelOrderId !== 'N/A'}`);
        console.log(`   Live Mode: ${duffelOrder.data?.live_mode}`);

        // CRITICAL: Validate that extraction succeeded
        if (!duffelOrderId || duffelOrderId === 'N/A' || !pnr || pnr === 'N/A') {
          console.error('❌ CRITICAL: Failed to extract order ID or PNR from Duffel response');
          console.error(`   duffelOrderId: ${duffelOrderId}`);
          console.error(`   pnr: ${pnr}`);
          console.error(`   order.data.id: ${duffelOrder?.data?.id}`);
          console.error(`   order.id: ${duffelOrder?.id}`);
          console.error(`   order.booking_reference: ${duffelOrder?.booking_reference}`);
          console.error(`   order.data.booking_reference: ${duffelOrder?.data?.booking_reference}`);
          console.error(`   Full order keys: ${Object.keys(duffelOrder || {}).join(', ')}`);
          console.error(`   Full order.data keys: ${Object.keys(duffelOrder?.data || {}).join(', ')}`);

          // Log complete response for diagnosis
          console.error('📋 FULL DUFFEL RESPONSE:');
          console.error(JSON.stringify(duffelOrder, null, 2));

          throw new Error(`Duffel order creation failed: Invalid response structure. OrderID: ${duffelOrderId}, PNR: ${pnr}`);
        }

        // Store the complete Duffel order for reference
        flightOrder = duffelOrder;

        console.log('✅ Duffel order created successfully!');
        console.log(`   Order ID: ${duffelOrderId}`);
        console.log(`   PNR: ${pnr}`);
        console.log(`   Type: ${isHold ? 'Hold (Pay Later)' : 'Instant (Paid)'}`);
        console.log(`   Live Mode: ${duffelOrder.data?.live_mode ? 'Yes (real booking)' : 'No (test mode)'}`);
      } catch (error: any) {
        console.error('❌ Duffel booking failed at step: Duffel API call');
        console.error('   Error type:', error.constructor?.name || 'Unknown');
        console.error('   Error message:', error.message || 'No message');
        console.error('   Error code:', error.code || 'No code');
        console.error('   Error keys:', Object.keys(error || {}));

        // Check all possible error locations
        console.error('   error.errors:', error.errors ? JSON.stringify(error.errors) : 'undefined');
        console.error('   error.duffelErrors:', error.duffelErrors ? JSON.stringify(error.duffelErrors) : 'undefined');
        console.error('   error.meta:', error.meta ? JSON.stringify(error.meta) : 'undefined');

        if (error.response) {
          console.error('   HTTP Status:', error.response.status);
          console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.originalError) {
          console.error('   Original error message:', error.originalError.message);
          console.error('   Original error keys:', Object.keys(error.originalError || {}));
        }
        console.error('   Full error stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2).substring(0, 1500));

        // Extract specific error details for better user feedback
        let userFriendlyError = 'Failed to create booking. Please try again.';
        let errorCode = 'BOOKING_FAILED';
        let statusCode = 500;

        // Check for configuration errors (ORDER_CREATION_DISABLED)
        if (error.message?.includes('ORDER_CREATION_DISABLED')) {
          userFriendlyError = 'Flight booking is currently unavailable. Please contact support.';
          errorCode = 'SERVICE_UNAVAILABLE';
          statusCode = 503;
          console.error('⚠️ CONFIGURATION ERROR: DUFFEL_ENABLE_ORDERS not set to true');

          // CRITICAL: Alert admin immediately about configuration error
          await alertApiError(request, error, {
            errorCode: 'CONFIG_ERROR',
            endpoint: '/api/flights/booking/create',
            userEmail: contactInfo?.email || passengers[0]?.email,
            // ENHANCED: Include customer name and phone for admin follow-up
            customerName: `${passengers[0]?.firstName || ''} ${passengers[0]?.lastName || ''}`.trim(),
            customerPhone: contactInfo?.phone || passengers[0]?.phone,
            amount: parseFloat(confirmedOffer.price.total),
            currency: confirmedOffer.price.currency,
            flightRoute: `${confirmedOffer.itineraries[0]?.segments[0]?.departure?.iataCode} → ${confirmedOffer.itineraries[0]?.segments[confirmedOffer.itineraries[0]?.segments.length - 1]?.arrival?.iataCode}`,
            passengerCount: passengers.length,
          }, {
            priority: 'critical',
          }).catch(alertErr => console.error('Failed to send alert:', alertErr));
        }
        // Check for Duffel API errors (check multiple locations)
        const apiErrors = error.duffelErrors || error.errors || error.response?.data?.errors || [];
        if (apiErrors.length > 0) {
          // Check for sold out errors
          const soldOutError = apiErrors.find((e: any) =>
            e.code === 'offer_no_longer_available' ||
            e.title?.toLowerCase().includes('no longer available') ||
            e.title?.toLowerCase().includes('sold out')
          );
          if (soldOutError) {
            userFriendlyError = 'This flight is no longer available. Please search for alternative flights.';
            errorCode = 'SOLD_OUT';
            statusCode = 410;
          }

          // Check for price change errors
          const priceChangeError = apiErrors.find((e: any) =>
            e.code === 'offer_price_changed' ||
            e.title?.toLowerCase().includes('price changed')
          );
          if (priceChangeError) {
            userFriendlyError = 'The price for this flight has changed. Please review the new price and try again.';
            errorCode = 'PRICE_CHANGED';
            statusCode = 409;
          }

          // Check for invalid passenger data
          const invalidDataError = apiErrors.find((e: any) =>
            e.code === 'validation_error' ||
            e.title?.toLowerCase().includes('invalid')
          );
          if (invalidDataError) {
            userFriendlyError = `Passenger information error: ${invalidDataError.message || 'Invalid data provided'}`;
            errorCode = 'INVALID_DATA';
            statusCode = 400;
          }

          // Check for offer expired
          const expiredError = apiErrors.find((e: any) =>
            e.code === 'offer_expired' ||
            e.title?.toLowerCase().includes('expired')
          );
          if (expiredError) {
            userFriendlyError = 'This flight offer has expired. Please search again for current prices.';
            errorCode = 'OFFER_EXPIRED';
            statusCode = 410;
          }
        }

        // CRITICAL: Alert admin about booking failure with full details
        // Check multiple locations for Duffel errors (SDK vs axios vs enhanced)
        const duffelErrors = error.duffelErrors || error.errors || error.response?.data?.errors || [];
        const errorDetails = duffelErrors.length > 0
          ? duffelErrors.map((e: any) => `${e.code || 'ERR'}: ${e.title || ''} - ${e.message || 'Unknown'}`).join(' | ')
          : error.message || 'No error details available';

        await alertApiError(request, error, {
          errorCode,
          endpoint: '/api/flights/booking/create',
          userEmail: contactInfo?.email || passengers[0]?.email,
          // ENHANCED: Include customer name and phone for admin follow-up
          customerName: `${passengers[0]?.firstName || ''} ${passengers[0]?.lastName || ''}`.trim(),
          customerFirstName: passengers[0]?.firstName,
          customerLastName: passengers[0]?.lastName,
          customerPhone: contactInfo?.phone || passengers[0]?.phone,
          amount: parseFloat(confirmedOffer.price.total),
          currency: confirmedOffer.price.currency,
          sourceApi: 'Duffel',
          flightRoute: `${confirmedOffer.itineraries[0]?.segments[0]?.departure?.iataCode} → ${confirmedOffer.itineraries[0]?.segments[confirmedOffer.itineraries[0]?.segments.length - 1]?.arrival?.iataCode}`,
          departureDate: confirmedOffer.itineraries[0]?.segments[0]?.departure?.at?.split('T')[0],
          offerId: confirmedOffer.id,
          passengerCount: passengers.length,
          errorDetail: errorDetails,
          duffelErrorsRaw: JSON.stringify(duffelErrors),
        }, {
          priority: statusCode >= 500 ? 'critical' : 'high',
        }).catch(alertErr => console.error('Failed to send alert:', alertErr));

        // Return specific error BEFORE creating payment
        // CRITICAL: Customer is NOT charged yet!
        return NextResponse.json(
          {
            success: false,
            error: errorCode,
            message: userFriendlyError,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
          { status: statusCode }
        );
      }
    } else {
      // ========== AMADEUS/GDS RESERVATION (MANUAL TICKETING WORKFLOW) ==========
      // Amadeus flights are NOT booked through the API
      // Instead, we create a RESERVATION in our system for manual ticketing via consolidator
      console.log('✈️  Creating RESERVATION for Amadeus/GDS flight (manual ticketing)...');
      sourceApi = 'Amadeus';

      // Generate a unique reservation ID for tracking
      // NOTE: This is NOT an actual airline booking yet - it's our internal reference
      const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Store flight offer details for manual ticketing
      flightOrder = {
        data: {
          type: 'reservation-pending-ticketing',
          id: reservationId,
          flightOffer: confirmedOffer,
          travelers: travelers,
          // No PNR yet - will be assigned after manual ticketing
          associatedRecords: [{
            reference: 'PENDING', // Will be updated after manual issuance
            creationDate: new Date().toISOString(),
            originSystemCode: 'FLY2ANY',
            status: 'pending_ticketing',
          }],
        },
        meta: {
          isReservation: true,
          requiresManualTicketing: true,
          message: 'This reservation requires manual ticketing through your consolidator.',
        },
      };

      bookingId = reservationId;
      pnr = 'PENDING'; // Will be updated after consolidator issues the ticket
      isMockBooking = false; // This is a real reservation (pending ticketing)

      // Set booking status to pending_ticketing for Amadeus flights
      bookingStatus = 'pending';

      console.log('✅ Amadeus/GDS RESERVATION created!');
      console.log(`   Reservation ID: ${reservationId}`);
      console.log(`   Status: PENDING TICKETING`);
      console.log(`   ⚠️  Action Required: Manual ticket issuance via consolidator`);
      console.log(`   Flight: ${confirmedOffer.itineraries[0]?.segments[0]?.departure?.iataCode} → ${confirmedOffer.itineraries[0]?.segments[confirmedOffer.itineraries[0]?.segments.length - 1]?.arrival?.iataCode}`);
      console.log(`   Price: ${confirmedOffer.price?.total} ${confirmedOffer.price?.currency}`);

      // Notify admin about new reservation requiring manual ticketing
      try {
        const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
        const flightSource = sourceApi === 'Amadeus' ? '🔵 GDS/Amadeus' : sourceApi === 'Duffel' ? '🟢 Duffel NDC' : sourceApi;
        await notifyTelegramAdmins(`
🎫 *NEW RESERVATION - Manual Ticketing Required*

📋 *Reservation:* \`${reservationId}\`
🔗 *Source:* ${flightSource}
✈️ *Route:* ${confirmedOffer.itineraries[0]?.segments[0]?.departure?.iataCode} → ${confirmedOffer.itineraries[0]?.segments[confirmedOffer.itineraries[0]?.segments.length - 1]?.arrival?.iataCode}
📅 *Date:* ${confirmedOffer.itineraries[0]?.segments[0]?.departure?.at?.split('T')[0]}
💰 *Price:* ${confirmedOffer.price?.currency} ${confirmedOffer.price?.total}
✈️ *Airline:* ${confirmedOffer.validatingAirlineCodes?.[0] || 'N/A'}
👤 *Passengers:* ${passengers.length}
📧 *Contact:* ${contactInfo?.email || travelers[0]?.contact?.emailAddress}
🆔 *Offer ID:* \`${confirmedOffer.id?.substring(0, 20)}...\`

⏰ *Action:* Issue ticket via consolidator within 24h
        `.trim());
      } catch (notifyError) {
        console.error('⚠️ Failed to send admin notification:', notifyError);
      }
    }

    if (!bookingId || bookingId === 'N/A') {
      console.error('❌ CRITICAL: Invalid booking ID returned from API');
      console.error('   bookingId:', bookingId);
      console.error('   sourceApi:', sourceApi);
      console.error('   duffelOrderId:', duffelOrderId);
      console.error('   pnr:', pnr);
      console.error('   flightOrder present:', !!flightOrder);
      console.error('   confirmedOffer:', confirmedOffer?.id);

      // Throw error to be caught by handlers for detailed alerts
      throw new Error(`Booking ID extraction failed: bookingId=${bookingId}, sourceApi=${sourceApi}, duffelOrderId=${duffelOrderId}, pnr=${pnr}`);
    }

    // STEP 5: Process payment (only for instant bookings, NOT holds, NOT manual ticketing)
    const requiresManualTicketing = sourceApi === 'Amadeus';
    console.log(`\n💳 STEP 5: Payment processing (ID: ${requestId}, isHold: ${isHold}, manualTicketing: ${requiresManualTicketing})`);

    if (!isHold && !requiresManualTicketing) {
      // INSTANT BOOKING (Duffel only): Create payment intent AFTER airline booking succeeds
      console.log(`   [${requestId}] Creating payment intent...`);

      try {
        // Calculate total amount (flight + upgrades + bundles + add-ons)
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

        // Create payment intent with Stripe AFTER airline booking succeeds
        // CRITICAL: This ensures the webhook can match payment to booking!
        paymentIntent = await safePaymentOperation(
          () => paymentService.createPaymentIntent({
            amount: totalAmount,
            currency: confirmedOffer.price.currency,
            bookingReference: preGeneratedBookingRef, // Use pre-generated reference
            customerEmail: contactInfo?.email || passengers[0]?.email,
            customerName: `${passengers[0]?.firstName} ${passengers[0]?.lastName}`,
            description: `Flight booking: ${flightOffer.itineraries[0].segments[0].departure.iataCode} → ${flightOffer.itineraries[0].segments[flightOffer.itineraries[0].segments.length - 1].arrival.iataCode}`,
            metadata: {
              flightOfferId: confirmedOffer.id,
              passengerCount: passengers.length.toString(),
              source: flightSource,
              bookingReference: preGeneratedBookingRef, // Also in metadata for redundancy
              duffelOrderId: duffelOrderId, // Link to airline booking
            },
          }),
          'Create Payment Intent',
          {
            userEmail: contactInfo?.email || passengers[0]?.email,
            endpoint: '/api/flights/booking/create',
            amount: totalAmount,
            currency: confirmedOffer.price.currency,
            bookingReference: preGeneratedBookingRef,
          }
        );

        console.log(`✅ [${requestId}] Payment intent created successfully!`);
        console.log(`   Payment Intent ID: ${paymentIntent.paymentIntentId}`);
        console.log(`   Amount Charged: ${totalAmount} ${confirmedOffer.price.currency}`);

        // For now, booking stays pending until payment is confirmed by client
        bookingStatus = 'pending';
        paymentStatus = 'pending';
      } catch (paymentError: any) {
        console.error('❌ Payment processing failed at step: Create Payment Intent');
        console.error('   Error type:', paymentError.constructor.name);
        console.error('   Error message:', paymentError.message);
        if (paymentError.response) {
          console.error('   HTTP Status:', paymentError.response.status);
          console.error('   Response data:', JSON.stringify(paymentError.response.data, null, 2));
        }
        console.error('   Full error:', paymentError);

        // Payment failed, but airline booking exists
        // Send alert to admin - booking exists but payment creation failed
        try {
          const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
          await notifyTelegramAdmins(`
⚠️ *Payment Creation Failed*

Airline booking was successfully created, but payment intent creation failed!

📋 *Booking Details:*
• Booking Ref: \`${preGeneratedBookingRef}\`
• PNR: \`${pnr}\`
• API: ${sourceApi}
• Amount: ${confirmedOffer.price.currency} ${parseFloat(confirmedOffer.price.total)}
• Customer: ${contactInfo?.email || passengers[0]?.email}

⚠️ *Action Required:*
The booking exists with ${sourceApi} but payment failed in our system.
Customer needs to complete payment to finalize booking.

*Error:* ${paymentError.message}
          `.trim());
        } catch (notifyError) {
          console.error('Failed to send payment error notification:', notifyError);
        }

        // CRITICAL FIX: Don't return early - continue to save booking to database
        // so admins can see it and manually process payment
        console.log('⚠️  Payment failed but continuing to save booking to database...');
        bookingStatus = 'pending';
        paymentStatus = 'pending';
        // paymentIntent stays null - will be handled manually
        // Set flag to indicate payment setup failed (for response message)
        (global as any).__paymentSetupFailed = true;
        (global as any).__paymentSetupError = paymentError.message;
      }
    } else if (requiresManualTicketing) {
      // MANUAL TICKETING (Amadeus/GDS): Payment handled offline via consolidator
      console.log('🎫 Manual ticketing - payment handled offline');
      bookingStatus = 'pending';
      paymentStatus = 'pending';
    } else {
      // HOLD BOOKING: No payment yet, will be charged later
      console.log('⏸️  Hold booking - payment will be captured later');
      bookingStatus = 'pending';
      paymentStatus = 'pending';
    }

    // STEP 6: Store booking in database (with retry logic)
    console.log(`\n💾 STEP 6: Saving booking to database (ID: ${requestId})...`);
    console.log(`   Booking ID: ${bookingId}`);
    console.log(`   PNR: ${pnr}`);
    console.log(`   Booking Status: ${bookingStatus}`);
    console.log(`   Payment Status: ${paymentStatus}`);

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
        firstName: p.firstName?.toUpperCase(), // Always UPPERCASE for airline compatibility
        lastName: p.lastName?.toUpperCase(),   // Always UPPERCASE for airline compatibility
        dateOfBirth: p.dateOfBirth || '1990-01-01',
        nationality: p.nationality?.toUpperCase() || 'US',
        passportNumber: p.passportNumber?.toUpperCase(),
        passportExpiry: p.passportExpiryDate,
        email: (p.email || contactInfo?.email)?.toLowerCase(), // Always lowercase
        phone: p.phone || contactInfo?.phone,
        specialRequests: p.specialRequests || [],
        // Loyalty Program Integration
        frequentFlyerAirline: p.frequentFlyerAirline,
        frequentFlyerNumber: p.frequentFlyerNumber,
        tsaPreCheck: p.tsaPreCheck,
      }));

      // Prepare contact info (email always lowercase)
      const bookingContactInfo: ContactInfo = {
        email: (contactInfo?.email || travelers[0].contact.emailAddress)?.toLowerCase(),
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

      // Determine ticketing status based on source
      // - Duffel: May auto-issue or require manual (depends on airline)
      // - Amadeus/GDS: ALWAYS requires manual ticketing via consolidator
      // - Cross-provider with Amadeus: Also requires manual ticketing for the Amadeus leg
      const hasAmadeusLeg = sourceApi === 'Amadeus' ||
        (flightOrder?.providers?.outbound === 'Amadeus') ||
        (flightOrder?.providers?.return === 'Amadeus');
      const ticketingStatusForBooking = hasAmadeusLeg ? 'pending_ticketing' : undefined;

      // Create booking in database WITH PRE-GENERATED REFERENCE
      // CRITICAL: Use preGeneratedBookingRef so webhook can find booking after payment
      // CRITICAL: Add retry logic to prevent orphaned bookings
      let savedBooking: any = null;
      let dbSaveError: any = null;
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`💾 Database save attempt ${attempt + 1}/${maxRetries}...`);

          savedBooking = await safeDbOperation(
            () => bookingStorage.create({
        status: bookingStatus,
        contactInfo: bookingContactInfo,
        flight: flightData,
        passengers: bookingPassengers,
        seats: seats || [], // Include selected seats from booking flow
        payment: paymentInfo,
        fareUpgrade: fareUpgrade || undefined, // Include fare upgrade if selected
        bundle: bundle || undefined, // Include bundle if selected
        addOns: addOns || [], // Include all selected add-ons
        promoCode: promoCode || undefined, // Include promo code discount if applied
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
        // Manual Ticketing Workflow (Amadeus/GDS flights)
        ticketingStatus: ticketingStatusForBooking,
        airlineRecordLocator: sourceApi === 'Amadeus' ? 'PENDING' : pnr,
        // Store customer vs consolidator pricing for margin tracking
        customerPrice: totalAmount,
        // Admin Price Details (for profit tracking)
        // CRITICAL: Use _netPrice from confirmedOffer (set after markup applied)
        netPrice: parseFloat(confirmedOffer.price?._netPrice || originalNetPrice.toString()),
        markupAmount: parseFloat(confirmedOffer.price?._markupAmount || '0') ||
          (totalAmount - parseFloat(confirmedOffer.price?._netPrice || originalNetPrice.toString())),
        routingChannel: routing.channel,
        routingReason: routing.reason,
        // Calculate Duffel cost if applicable
        ...(sourceApi === 'Duffel' && {
          duffelCost: 3, // Only $3 per order fee
          netProfit: parseFloat(confirmedOffer.price?._markupAmount || '0') - 3 ||
            (totalAmount - parseFloat(confirmedOffer.price?._netPrice || originalNetPrice.toString())) - 3,
        }),
        // Consolidator cost placeholder (updated after manual ticketing)
        ...(sourceApi === 'Amadeus' && {
          consolidatorCost: 0, // Will be updated after manual ticketing
          netProfit: parseFloat(confirmedOffer.price?._markupAmount || '0') ||
            (totalAmount - parseFloat(confirmedOffer.price?._netPrice || originalNetPrice.toString())),
        }),
          }, preGeneratedBookingRef), // Pass pre-generated reference for webhook matching
            `Save Booking to Database (Attempt ${attempt + 1})`,
            {
              userEmail: contactInfo?.email || passengers[0]?.email,
              endpoint: '/api/flights/booking/create',
              amount: totalAmount,
              currency: confirmedOffer.price.currency,
              bookingReference: preGeneratedBookingRef,
            }
          );

          console.log(`✅ [${requestId}] Booking saved to database successfully!`);
          console.log(`   Database ID: ${savedBooking.id}`);
          console.log(`   Booking Reference: ${savedBooking.bookingReference}`);
          console.log(`   Saved passengers: ${bookingPassengers.length}`);

          // Track promo code usage if applied
          if (promoCode?.code) {
            try {
              const prisma = getPrismaClient();

              // Increment usage count on promo code
              await prisma.promoCode.update({
                where: { code: promoCode.code.toUpperCase() },
                data: { usageCount: { increment: 1 } },
              });

              // Create voucher redemption record
              await prisma.voucherRedemption.create({
                data: {
                  voucherCode: promoCode.code.toUpperCase(),
                  userId: session?.user?.id || null,
                  guestEmail: bookingContactInfo.email,
                  bookingReference: savedBooking.bookingReference,
                  productType: 'flight',
                  discountType: promoCode.type,
                  discountValue: promoCode.value,
                  discountAmount: promoCode.discountAmount,
                  totalAmount: totalAmount,
                  currency: confirmedOffer.price.currency,
                },
              });

              console.log(`📝 Promo code usage tracked: ${promoCode.code} - ${promoCode.discountAmount} discount`);
            } catch (promoError) {
              console.error('⚠️ Failed to track promo code usage (non-blocking):', promoError);
              // Don't fail the booking if promo tracking fails
            }
          }

          // Success! Break out of retry loop
          break;
        } catch (error: any) {
          dbSaveError = error;
          console.error(`⚠️ Database save failed (attempt ${attempt + 1}/${maxRetries}):`, error.message);

          // If not last attempt, wait before retrying
          if (attempt < maxRetries - 1) {
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
            console.log(`   Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      // Check if all retries failed
      if (!savedBooking) {
        console.error('❌ CRITICAL DATABASE ERROR - All retries failed - ORPHANED BOOKING:', dbSaveError);
        console.error(`   API Booking ID: ${bookingId}`);
        console.error(`   PNR: ${pnr}`);
        console.error(`   Source: ${sourceApi}`);
        console.error(`   Payment Intent: ${paymentIntent?.paymentIntentId}`);

        // Notify admins immediately about orphaned booking
        try {
          const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
          await notifyTelegramAdmins(`
🚨 *CRITICAL: ORPHANED BOOKING*

A booking was created with ${sourceApi} AND payment was charged, but FAILED to save to database after 3 retries!

📋 *Details:*
• Booking Ref: \`${preGeneratedBookingRef}\`
• PNR: \`${pnr}\`
• API: ${sourceApi}
• Amount: ${confirmedOffer.price.currency} ${confirmedOffer.price.total}
• Customer: ${contactInfo?.email || passengers[0]?.email}
• Payment Intent: \`${paymentIntent?.paymentIntentId}\`

⚠️ *Action Required - URGENT:*
This booking EXISTS in:
✅ ${sourceApi} system (Order/Reservation: \`${bookingId}\`)
✅ Stripe payment system (Payment Intent: \`${paymentIntent?.paymentIntentId}\`)
❌ Our database (NOT FOUND)

Manual intervention required to:
1. Add booking to database manually
2. Contact customer with confirmation
3. Ensure payment is captured and booking is trackable

*Error:* ${dbSaveError?.message}
          `.trim());
        } catch (notifyError) {
          console.error('Failed to send orphaned booking notification:', notifyError);
        }

        // RETURN ERROR - This is NOT a success!
        // Customer needs to know there's a problem and contact support
        return NextResponse.json(
          {
            success: false,
            error: 'DATABASE_SAVE_FAILED',
            message: 'Your booking was created and payment was charged, but we encountered an error saving it to our system. Please contact support immediately with your confirmation number.',
            // Include critical info so customer can reference it
            booking: {
              bookingReference: preGeneratedBookingRef,
              pnr,
              sourceApi,
              apiBookingId: bookingId,
              paymentIntentId: paymentIntent?.paymentIntentId,
              totalPrice: confirmedOffer.price.total,
              currency: confirmedOffer.price.currency,
            },
            supportInfo: {
              email: 'support@fly2any.com',
              urgency: 'Contact support within 24 hours to ensure your booking is properly recorded.',
            },
          },
          { status: 500 }
        );
      }

      // STEP 7: Save card authorization if provided
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

          await safeDbOperation(
            () => prisma.cardAuthorization.create({
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
            }),
            'Save Card Authorization',
            {
              userEmail: bookingContactInfo.email,
              endpoint: '/api/flights/booking/create',
              bookingReference: savedBooking.bookingReference,
            }
          );

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

      // STEP 7: Send appropriate email based on booking type
      // - Card payment (not hold) → Card Payment Processing email
      // - Hold booking → Payment Instructions email
      // - Auto-ticketed (Duffel) → Booking Confirmation email
      const hasCardPayment = savedBooking.payment?.cardLast4 && !isHold;
      const isAutoTicketed = !requiresManualTicketing && !isHold;

      let emailType: string;
      let emailResult: boolean;

      console.log('📧 STEP 7: Sending booking email...');
      console.log(`   To: ${bookingContactInfo.email}`);
      console.log(`   Booking Ref: ${savedBooking.bookingReference}`);
      console.log(`   isHold: ${isHold}, hasCardPayment: ${hasCardPayment}, isAutoTicketed: ${isAutoTicketed}`);

      try {
        if (isAutoTicketed) {
          // Duffel auto-ticketed booking - send confirmation
          emailType = 'Booking Confirmation';
          emailResult = await emailService.sendBookingConfirmation(savedBooking);
        } else if (hasCardPayment) {
          // Card captured, pending manual processing - clean card email
          emailType = 'Card Payment Processing';
          emailResult = await emailService.sendCardPaymentProcessing(savedBooking);
        } else {
          // Hold or other - send payment instructions
          emailType = 'Payment Instructions';
          emailResult = await emailService.sendPaymentInstructions(savedBooking);
        }

        console.log(`✅ ${emailType} email sent successfully`);
      } catch (emailError: any) {
        console.error(`❌ ${emailType || 'Email'} sending failed (but booking still created):`, emailError.message);

        // Alert admin about email failure
        try {
          const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
          await notifyTelegramAdmins(`
⚠️ *Email Sending Failed*

Booking created but ${emailType} email failed!

📋 *Details:*
• Ref: \`${savedBooking.bookingReference}\`
• Email: ${bookingContactInfo.email}
• Amount: ${totalAmount} ${confirmedOffer.price.currency}

*Error:* ${emailError.message}
          `.trim());
        } catch (notifyErr) {
          console.error('Failed to send email failure notification:', notifyErr);
        }
      }

      // Determine booking status for response (requiresManualTicketing already defined above)
      const responseStatus = isHold ? 'HOLD' : (requiresManualTicketing ? 'PENDING_TICKETING' : 'PENDING_PAYMENT');

      // STEP 8: Create admin in-app notification
      console.log('🔔 STEP 8: Creating admin in-app notification...');
      try {
        const { createNotification } = await import('@/lib/services/notifications');
        const prisma = getPrismaClient();

        // Find admin users to notify (AdminUser table links to User)
        const adminUsers = await prisma?.adminUser.findMany({
          where: { role: { in: ['admin', 'super_admin'] } },
          select: { userId: true },
        });
        console.log(`   Found ${adminUsers?.length || 0} admin user(s) to notify`);

        if (adminUsers && adminUsers.length > 0) {
          const route = `${confirmedOffer.segments[0]?.departure?.iataCode || 'N/A'} → ${confirmedOffer.segments[confirmedOffer.segments.length - 1]?.arrival?.iataCode || 'N/A'}`;

          // Create notification for each admin
          await Promise.all(adminUsers.map(admin =>
            createNotification({
              userId: admin.userId,
              type: 'booking_confirmed',
              title: `New Booking: ${savedBooking.bookingReference}`,
              message: `${bookingPassengers[0]?.firstName || 'Customer'} booked ${route} for ${confirmedOffer.price.currency} ${totalAmount.toFixed(2)}`,
              priority: 'high',
              actionUrl: `/admin/bookings/${savedBooking.id}`,
              metadata: {
                bookingId: savedBooking.id,
                bookingReference: savedBooking.bookingReference,
                customerEmail: bookingContactInfo.email,
                route,
                amount: totalAmount,
                currency: confirmedOffer.price.currency,
              },
            })
          ));
          console.log(`✅ Admin notifications created for ${adminUsers.length} admin(s)`);
        }
      } catch (notifError) {
        console.error('⚠️ Failed to create admin notification (non-critical):', notifError);
        // Don't fail the booking if notification fails
      }

      // COMPLETION SUMMARY - END OF BOOKING FLOW
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`✅ [${requestId}] BOOKING FLOW COMPLETED SUCCESSFULLY`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📊 Final Booking Summary:');
      console.log(`   Request ID: ${requestId}`);
      console.log(`   Status: ${responseStatus}`);
      console.log(`   Booking ID (DB): ${savedBooking.id}`);
      console.log(`   Booking Ref: ${savedBooking.bookingReference}`);
      console.log(`   API Source: ${sourceApi}`);
      if (sourceApi === 'Duffel') console.log(`   Duffel Order ID: ${duffelOrderId}`);
      if (sourceApi === 'Amadeus') console.log(`   Amadeus Reservation ID: ${bookingId}`);
      console.log(`   PNR: ${pnr}`);
      console.log(`   Total Price: ${totalAmount} ${confirmedOffer.price.currency}`);
      console.log(`   Passengers: ${bookingPassengers.length}`);
      console.log(`   Payment Status: ${paymentStatus}`);
      if (paymentIntent) console.log(`   Payment Intent: ${paymentIntent.paymentIntentId}`);
      console.log(`   Created: ${savedBooking.createdAt}`);
      console.log('═══════════════════════════════════════════════════════════');

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
            status: responseStatus,
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
            // Manual Ticketing Workflow (Amadeus/GDS)
            requiresManualTicketing,
            ticketingStatus: requiresManualTicketing ? 'pending_ticketing' : 'auto',
          },
          message: isHold
            ? `Hold booking created via ${sourceApi}! Your booking is reserved for ${holdPricing?.duration} hours. Reference: ${savedBooking.bookingReference}`
            : requiresManualTicketing
              ? `Reservation created! Your booking reference is ${savedBooking.bookingReference}. Your confirmation and e-ticket will be sent within 24 hours.`
              : `Booking created via ${sourceApi}! Please complete payment. Your booking reference is ${savedBooking.bookingReference}`,
          // Additional info for manual ticketing
          ...(requiresManualTicketing && {
            ticketingInfo: {
              estimatedTicketingTime: '24 hours',
              note: 'Our team will issue your ticket and send confirmation to your email.',
            },
          }),
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      // CRITICAL: Database save failed - booking exists in airline system but NOT in our DB!
      // This is a CRITICAL error - we cannot manage/track/cancel this booking
      console.error('❌ CRITICAL DATABASE ERROR - ORPHANED BOOKING:', dbError);
      console.error(`   API Booking ID: ${bookingId}`);
      console.error(`   PNR: ${pnr}`);
      console.error(`   Source: ${sourceApi}`);

      // Notify admins immediately about orphaned booking
      try {
        const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
        await notifyTelegramAdmins(`
🚨 *CRITICAL: ORPHANED BOOKING*

A booking was created with ${sourceApi} but FAILED to save to database!

📋 *Details:*
• PNR: \`${pnr}\`
• Order ID: \`${bookingId}\`
• API: ${sourceApi}
• Amount: ${confirmedOffer.price.currency} ${confirmedOffer.price.total}
• Customer: ${contactInfo?.email || passengers[0]?.email}

⚠️ *Action Required:*
This booking EXISTS in the airline system but is NOT in our database.
Manual intervention required to:
1. Add booking to database manually
2. Contact customer with confirmation
3. Ensure payment is captured

*Error:* ${dbError.message}
        `.trim());
      } catch (notifyError) {
        console.error('Failed to send orphaned booking notification:', notifyError);
      }

      // RETURN ERROR - This is NOT a success!
      // Customer needs to know there's a problem and contact support
      return NextResponse.json(
        {
          success: false,
          error: 'DATABASE_SAVE_FAILED',
          message: 'Your booking was created but we encountered an error saving it. Please contact support immediately with your confirmation number.',
          // Include critical info so customer can reference it
          booking: {
            pnr,
            sourceApi,
            apiBookingId: bookingId,
            totalPrice: confirmedOffer.price.total,
            currency: confirmedOffer.price.currency,
          },
          supportInfo: {
            email: 'support@fly2any.com',
            urgency: 'Please contact us within 24 hours to ensure your booking is properly recorded.',
          },
        },
        { status: 500 }
      );
    }
    });
  } catch (outerError: any) {
    // ULTRA-DIAGNOSTIC: This catches ANY error including module load failures
    console.error('🔥 CRITICAL OUTER ERROR:', outerError);
    return NextResponse.json(
      {
        success: false,
        error: 'CRITICAL_SYSTEM_ERROR',
        message: 'System error occurred. Our team has been notified.',
        debug: {
          errorType: outerError?.constructor?.name || 'Unknown',
          errorMessage: outerError?.message || 'No message',
          timestamp: new Date().toISOString(),
        },
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
