import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { applyMarkup, ANCILLARY_MARKUP, getMarkupSummary } from '@/lib/config/ancillary-markup';

/**
 * POST /api/flights/ancillaries
 *
 * PRODUCTION-READY: Returns ONLY real ancillary services from Duffel API
 * WITH MARKUP APPLIED:
 * - Baggage: 25% markup
 * - CFAR: 29% markup
 * - Seats: 25% markup
 *
 * Available services via Duffel NDC:
 * - Baggage: Real airline pricing + markup ✅
 * - Seats: Via separate seat map API + markup ✅
 * - CFAR (Cancel For Any Reason): When available + markup ✅
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightOffer, passengerCount = 1 } = body;

    if (!flightOffer) {
      return NextResponse.json(
        { error: 'Missing required parameter: flightOffer' },
        { status: 400 }
      );
    }

    console.log('🎁 ========================================');
    console.log('🎁 FETCHING REAL ANCILLARIES (Production Mode)');
    console.log(`🎁 Flight ID: ${flightOffer.id}`);
    console.log(`🎁 Flight Source: ${flightOffer.source || 'Unknown'}`);
    console.log(`🎁 Flight Price: ${flightOffer.price?.currency} ${flightOffer.price?.total}`);
    console.log(`🎁 Markup Config: Baggage ${ANCILLARY_MARKUP.baggage.percentage * 100}%, CFAR ${ANCILLARY_MARKUP.cfar.percentage * 100}%, Seats ${ANCILLARY_MARKUP.seats.percentage * 100}%`);
    console.log('🎁 ========================================');

    // Initialize response structure with ONLY real services
    const response: any = {
      success: true,
      data: {
        baggage: { hasRealData: false, options: [] },
        cfar: { hasRealData: false, available: false, options: [] },
        seats: {
          hasRealData: false,
          note: 'Use /api/flights/seat-map for interactive seat selection with real pricing',
          options: []
        },
      },
      meta: {
        source: flightOffer.source || 'Unknown',
        offerId: flightOffer.id,
        isProduction: true,
        realDataOnly: true,
        markupApplied: true,
        markupRates: getMarkupSummary(),
        note: 'Real airline data with markup applied.',
      },
    };

    // Track total profit potential
    let totalProfitPotential = 0;

    // For Duffel flights - fetch ALL real services
    if (flightOffer.source === 'Duffel' && duffelAPI.isAvailable() && flightOffer.id) {
      console.log('✈️  Duffel flight detected - fetching real services...');

      try {
        // Use the new production-ready method that uses return_available_services=true
        const servicesResult = await duffelAPI.getAllAvailableServices(flightOffer.id);

        if (servicesResult.success) {
          // Baggage with 25% markup
          if (servicesResult.data.baggage.length > 0) {
            response.data.baggage = {
              hasRealData: true,
              options: servicesResult.data.baggage.map((bag: any) => {
                const netPrice = parseFloat(bag.price.amount);
                const markup = applyMarkup(netPrice, 'baggage');
                totalProfitPotential += markup.markupAmount;

                return {
                  id: bag.id,
                  name: bag.name,
                  description: bag.description,
                  price: markup.customerPrice, // Customer sees this (with markup)
                  netPrice: markup.netPrice,   // For internal tracking
                  currency: bag.price.currency,
                  weight: bag.weight,
                  quantity: bag.quantity,
                  isReal: true,
                  segmentIds: bag.segmentIds,
                  passengerIds: bag.passengerIds,
                  metadata: {
                    type: bag.type,
                    duffelServiceId: bag.id,
                    isReal: true,
                    perPassenger: true,
                    markupApplied: true,
                    markupPercentage: markup.markupPercentage,
                  },
                };
              }),
            };
            console.log(`✅ Baggage: ${servicesResult.data.baggage.length} options (+25% markup)`);
          } else {
            console.log('ℹ️  Baggage: Not available for this airline/route');
          }

          // CFAR (Cancel For Any Reason) with 29% markup
          if (servicesResult.data.cfar.length > 0) {
            response.data.cfar = {
              hasRealData: true,
              available: true,
              options: servicesResult.data.cfar.map((cfar: any) => {
                const netPrice = parseFloat(cfar.price.amount);
                const markup = applyMarkup(netPrice, 'cfar');
                totalProfitPotential += markup.markupAmount;

                return {
                  id: cfar.id,
                  name: cfar.name,
                  description: cfar.description,
                  price: markup.customerPrice, // Customer sees this (with markup)
                  netPrice: markup.netPrice,   // For internal tracking
                  currency: cfar.price.currency,
                  refundPercentage: cfar.refundPercentage,
                  terms: cfar.terms,
                  isReal: true,
                  segmentIds: cfar.segmentIds,
                  passengerIds: cfar.passengerIds,
                  metadata: {
                    type: 'cancel_for_any_reason',
                    duffelServiceId: cfar.id,
                    isReal: true,
                    markupApplied: true,
                    markupPercentage: markup.markupPercentage,
                  },
                };
              }),
            };
            console.log(`✅ CFAR: ${servicesResult.data.cfar.length} options (+29% markup)`);
          } else {
            console.log('ℹ️  CFAR: Not available for this airline/route');
          }

          // Seats info with 25% markup (basic - full seat maps via separate endpoint)
          if (servicesResult.data.seats.length > 0) {
            response.data.seats = {
              hasRealData: true,
              note: 'Use /api/flights/seat-map for full interactive seat selection',
              options: servicesResult.data.seats.map((seat: any) => {
                const netPrice = parseFloat(seat.price?.amount || '0');
                const markup = applyMarkup(netPrice, 'seats');

                return {
                  ...seat,
                  price: markup.customerPrice,
                  netPrice: markup.netPrice,
                  metadata: {
                    ...seat.metadata,
                    markupApplied: true,
                    markupPercentage: markup.markupPercentage,
                  },
                };
              }),
            };
            console.log(`✅ Seats: ${servicesResult.data.seats.length} options (+25% markup via seat-map API)`);
          }

          response.meta.servicesFound = {
            baggage: servicesResult.data.baggage.length,
            cfar: servicesResult.data.cfar.length,
            seats: servicesResult.data.seats.length,
          };
        } else {
          console.warn('⚠️  Failed to fetch Duffel services:', servicesResult.error);
          response.meta.error = servicesResult.error;
        }
      } catch (error: any) {
        console.error('❌ Error fetching Duffel services:', error.message);
        response.meta.error = error.message;
      }
    } else if (flightOffer.source !== 'Duffel') {
      // Non-Duffel flights (Amadeus) - waiting for production API
      console.log('ℹ️  Non-Duffel flight - ancillary services require Amadeus production API');
      response.meta.note = 'Amadeus ancillary services require production API access. Currently only Duffel flights have real ancillary data.';

      // Try to extract included baggage from fare details
      const fareDetails = flightOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
      const includedBags = fareDetails?.includedCheckedBags?.quantity || 0;

      if (includedBags > 0) {
        response.meta.includedBaggage = {
          quantity: includedBags,
          note: `${includedBags} checked bag(s) included in fare`,
        };
      }
    } else {
      console.log('⚠️  Duffel API not available');
      response.meta.note = 'Duffel API not configured. Set DUFFEL_ACCESS_TOKEN to enable real ancillary services.';
    }

    // Calculate totals
    const totalBaggageOptions = response.data.baggage.options?.length || 0;
    const totalCFAROptions = response.data.cfar.options?.length || 0;
    const totalSeatOptions = response.data.seats.options?.length || 0;

    response.meta.totalRealServices = totalBaggageOptions + totalCFAROptions + totalSeatOptions;
    response.meta.potentialProfit = Math.round(totalProfitPotential * 100) / 100;
    response.meta.availability = {
      baggage: totalBaggageOptions > 0 ? 'real_with_markup' : 'not_available',
      cfar: totalCFAROptions > 0 ? 'real_with_markup' : 'not_available',
      seats: 'via_seat_map_api_with_markup',
      meals: 'not_available_via_ndc',
      wifi: 'not_available_via_ndc',
      insurance: 'requires_third_party',
      lounge: 'requires_separate_integration',
      priority: 'not_available_via_ndc',
    };

    console.log('✅ ========================================');
    console.log('✅ ANCILLARY RESPONSE (Production + Markup)');
    console.log(`✅ Total Real Services: ${response.meta.totalRealServices}`);
    console.log(`✅ Baggage: ${totalBaggageOptions} options (+25%)`);
    console.log(`✅ CFAR: ${totalCFAROptions > 0 ? 'Available (+29%)' : 'Not available'}`);
    console.log(`✅ Seats: Via seat map API (+25%)`);
    console.log(`💰 Potential Profit: $${response.meta.potentialProfit}`);
    console.log('✅ ========================================');

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('❌ Error in ancillaries API:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch ancillaries',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
