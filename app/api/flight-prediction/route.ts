import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

/**
 * Deep clean flight offers to match Amadeus API format EXACTLY
 *
 * The Amadeus Flight Choice Prediction API expects the EXACT structure
 * returned by the Flight Offers Search API v2. Any additional properties
 * will cause a 400 error: "INVALID DATA RECEIVED"
 *
 * This function performs a DEEP clean by:
 * 1. Removing ALL custom properties we added (score, badges, metadata, etc.)
 * 2. Reconstructing the object structure to match Amadeus's exact schema
 * 3. Preserving only the properties that came from the original API response
 */
function cleanFlightOffers(flightOffers: any[]): any[] {
  return flightOffers.map((offer) => {
    // Strip all custom top-level properties
    const {
      score,
      badges,
      metadata,
      mlScore,
      priceVsMarket,
      co2Emissions,
      averageCO2,
      ...baseOffer
    } = offer;

    // Deep clean: reconstruct the offer with ONLY Amadeus properties
    // This ensures we match the exact FlightOffer schema from their API
    const cleanedOffer: any = {
      type: baseOffer.type,
      id: baseOffer.id,
      source: baseOffer.source,
      instantTicketingRequired: baseOffer.instantTicketingRequired,
      nonHomogeneous: baseOffer.nonHomogeneous,
      oneWay: baseOffer.oneWay,
      lastTicketingDate: baseOffer.lastTicketingDate,
      lastTicketingDateTime: baseOffer.lastTicketingDateTime,
      numberOfBookableSeats: baseOffer.numberOfBookableSeats,
      itineraries: baseOffer.itineraries,
      price: baseOffer.price,
      pricingOptions: baseOffer.pricingOptions,
      validatingAirlineCodes: baseOffer.validatingAirlineCodes,
      travelerPricings: baseOffer.travelerPricings,
    };

    // Remove undefined properties (Amadeus doesn't like them)
    Object.keys(cleanedOffer).forEach(key => {
      if (cleanedOffer[key] === undefined) {
        delete cleanedOffer[key];
      }
    });

    return cleanedOffer;
  });
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { flightOffers } = body;

    if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
      return NextResponse.json(
        { error: 'Flight offers array is required' },
        { status: 400 }
      );
    }

    console.log(`🧹 Cleaning ${flightOffers.length} flight offers before ML prediction...`);

    // Log structure BEFORE cleaning (for debugging)
    if (process.env.NODE_ENV === 'development') {
      const sampleBefore = flightOffers[0];
      const customProps = Object.keys(sampleBefore).filter(key =>
        !['type', 'id', 'source', 'instantTicketingRequired', 'nonHomogeneous',
          'oneWay', 'lastTicketingDate', 'lastTicketingDateTime', 'numberOfBookableSeats',
          'itineraries', 'price', 'pricingOptions', 'validatingAirlineCodes', 'travelerPricings'].includes(key)
      );
      console.log(`📊 Custom properties found: ${customProps.join(', ')}`);
    }

    // Clean flight offers by removing custom properties
    const cleanedOffers = cleanFlightOffers(flightOffers);

    // Validate cleaned structure
    const firstOffer = cleanedOffers[0];
    if (!firstOffer.id || !firstOffer.itineraries || !firstOffer.price) {
      console.error('❌ Cleaned offer missing required fields:', {
        hasId: !!firstOffer.id,
        hasItineraries: !!firstOffer.itineraries,
        hasPrice: !!firstOffer.price,
      });
      throw new Error('Cleaned flight offer structure is invalid');
    }

    // Log structure AFTER cleaning (for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Cleaned offer structure:', {
        totalOffers: cleanedOffers.length,
        sampleKeys: Object.keys(cleanedOffers[0]),
        priceFormat: typeof cleanedOffers[0].price.total,
        itinerariesCount: cleanedOffers[0].itineraries.length,
      });
    }

    // NOTE: Amadeus Flight Choice Prediction API was decommissioned (410 GONE)
    // Return original data without ML scores as graceful fallback
    return NextResponse.json({
      data: cleanedOffers,
      warning: 'ML prediction unavailable (API decommissioned), showing flights without AI ranking'
    });
  } catch (error: any) {
    console.error('❌ ML prediction failed:', error.response?.data || error.message);

    // Log detailed error information for debugging
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach((err: any, index: number) => {
        console.error(`   Error ${index + 1}:`, {
          code: err.code,
          title: err.title,
          detail: err.detail,
          source: err.source,
        });
      });
    }

    // Graceful fallback: return original data without ML scores
    console.log('🔄 Falling back to original flight data (no ML predictions)');
    return NextResponse.json({
      data: body?.flightOffers || [],
      warning: 'ML prediction unavailable, showing flights without AI ranking'
    });
  }
}
