import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';

/**
 * POST /api/flights/ancillaries
 * Get all available ancillary services for a flight
 *
 * This endpoint returns:
 * - Real-time baggage pricing from Duffel API (for Duffel flights)
 * - Baggage allowances from fare details (for Amadeus flights)
 * - Mock data for other services (simplified for stability)
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
    console.log(`🎁 FETCHING ANCILLARIES FOR FLIGHT: ${flightOffer.id}`);
    console.log(`🎁 Flight Source: ${flightOffer.source || 'GDS'}`);
    console.log(`🎁 Flight Price: ${flightOffer.price.currency} ${flightOffer.price.total}`);
    console.log('🎁 ========================================');

    // Fetch baggage options (real or mock)
    const baggageOptions = await fetchBaggageOptions(flightOffer);
    const hasRealBaggage = baggageOptions.some((opt: any) => opt.isReal || opt.metadata?.isReal);

    console.log('📊 ANCILLARY DATA SOURCES:');
    console.log(`   🧳 Baggage: ${hasRealBaggage ? '✅ REAL AIRLINE DATA' : '⚠️  MOCK/ESTIMATED DATA'}`);
    console.log(`   💺 Seats: ⚠️  MOCK DATA (Interactive seat maps available separately)`);
    console.log(`   🍽️  Meals: ⚠️  MOCK DATA (requires airline API integration)`);
    console.log(`   📡 WiFi: ⚠️  MOCK DATA (not available in test APIs)`);
    console.log(`   🛡️  Insurance: ⚠️  MOCK DATA (requires 3rd party integration)`);
    console.log(`   🎯 Lounge: ⚠️  MOCK DATA (requires airport API integration)`);
    console.log(`   ⚡ Priority: ⚠️  MOCK DATA (requires airline API integration)`);

    // Simplified response - using mock data structure
    const response = {
      success: true,
      data: {
        // Seat selection (mock data for now)
        seats: {
          hasRealData: false,
          options: [
            {
              id: 'aisle',
              name: 'Aisle Seat',
              description: 'Easy access',
              price: 15,
              currency: flightOffer.price.currency,
              isReal: false,
            },
            {
              id: 'window',
              name: 'Window Seat',
              description: 'Great views',
              price: 15,
              currency: flightOffer.price.currency,
              isReal: false,
            },
            {
              id: 'extra-legroom',
              name: 'Extra Legroom',
              description: '35" pitch',
              price: 45,
              currency: flightOffer.price.currency,
              isReal: false,
            },
          ],
          priceRange: { min: 15, max: 45 },
        },

        // Baggage (fetch real data from Duffel if available, otherwise use extracted/mock data)
        baggage: {
          hasRealData: hasRealBaggage,
          options: baggageOptions,
        },

        // Meals (mock - not available in Amadeus test API)
        meals: {
          hasRealData: false,
          options: getMockMeals(flightOffer),
        },

        // WiFi (mock - not available in Amadeus test API)
        wifi: {
          hasRealData: false,
          options: getMockWifi(flightOffer),
        },

        // Travel Insurance (mock - requires 3rd party integration)
        insurance: {
          hasRealData: false,
          options: getMockInsurance(flightOffer),
        },

        // Lounge Access (mock)
        lounge: {
          hasRealData: false,
          options: getMockLounge(flightOffer),
        },

        // Priority Services (mock)
        priority: {
          hasRealData: false,
          options: getMockPriority(flightOffer),
        },
      },
      meta: {
        totalServices: 12,
        availability: {
          seats: 'mock',
          baggage: hasRealBaggage ? 'real' : 'mock',
          meals: 'mock',
          wifi: 'mock',
          lounge: 'mock',
          insurance: 'mock',
          priority: 'mock',
        },
        note: hasRealBaggage
          ? 'Real-time baggage pricing from Duffel API. Other services using mock data.'
          : 'Using mock data for stability. Real data integration coming soon.',
      },
    };

    console.log('✅ ========================================');
    console.log('✅ ANCILLARY SERVICES RESPONSE READY');
    console.log(`✅ Total Services: ${response.meta.totalServices}`);
    console.log(`✅ Baggage Options: ${baggageOptions.length} (${hasRealBaggage ? 'Real airline data' : 'Mock/estimated'})`);
    console.log(`✅ Seat Options: ${response.data.seats.options.length} (Mock - use seat map for real data)`);
    console.log(`✅ Meal Options: ${response.data.meals.options.length} (Mock)`);
    console.log(`✅ WiFi Options: ${response.data.wifi.options.length} (Mock)`);
    console.log(`✅ Insurance Options: ${response.data.insurance.options.length} (Mock)`);
    console.log(`✅ Lounge Options: ${response.data.lounge.options.length} (Mock)`);
    console.log(`✅ Priority Options: ${response.data.priority.options.length} (Mock)`);
    console.log('✅ ========================================');

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching ancillaries:', error);

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

/**
 * Fetch baggage options - Real data from Duffel API if available, otherwise extracted/mock
 */
async function fetchBaggageOptions(flightOffer: any) {
  // Try fetching real baggage data from Duffel API for Duffel flights
  if (flightOffer.source === 'Duffel' && duffelAPI.isAvailable() && flightOffer.id) {
    try {
      console.log('🧳 ========================================');
      console.log('🧳 FETCHING REAL BAGGAGE FROM DUFFEL API');
      console.log(`🧳 Offer ID: ${flightOffer.id}`);
      const baggageResult = await duffelAPI.getBaggageOptions(flightOffer.id);

      if (baggageResult.success && baggageResult.data && baggageResult.data.length > 0) {
        console.log(`✅ SUCCESS: Found ${baggageResult.data.length} real baggage options from Duffel`);
        baggageResult.data.forEach((bag: any, idx: number) => {
          console.log(`   ${idx + 1}. ${bag.name} - ${bag.price.currency} ${bag.price.amount} (${bag.type})`);
        });
        console.log('🧳 ========================================');

        // Transform to UI format
        return baggageResult.data.map((baggage: any) => ({
          id: baggage.id,
          name: baggage.name,
          description: baggage.description,
          price: parseFloat(baggage.price.amount),
          currency: baggage.price.currency,
          isReal: true,
          weight: baggage.weight,
          quantity: baggage.quantity,
          metadata: {
            type: baggage.type,
            isReal: true,
            duffelServiceId: baggage.id,
            perPassenger: true,
            perSegment: baggage.segmentIds && baggage.segmentIds.length > 0,
          },
        }));
      } else {
        console.warn('⚠️  Duffel API returned no baggage data');
        console.log('🧳 ========================================');
      }
    } catch (error: any) {
      console.warn('⚠️  FAILED to fetch Duffel baggage, falling back to extracted/mock data');
      console.warn(`   Error: ${error.message}`);
      console.log('🧳 ========================================');
    }
  }

  // Fallback to extracted baggage from fare details or mock data
  console.log('🧳 Falling back to Amadeus fare details extraction...');
  return extractBaggageOptions(flightOffer);
}

/**
 * Extract baggage options from fare details with REAL pricing when available
 */
function extractBaggageOptions(flightOffer: any) {
  const fareDetails = flightOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
  const includedBags = fareDetails?.includedCheckedBags?.quantity || 0;

  // Find baggage amenities with real pricing
  const baggageAmenities = fareDetails?.amenities?.filter(
    (a: any) => a.amenityType === 'BAGGAGE' && a.isChargeable
  ) || [];

  console.log('🧳 ========================================');
  console.log('🧳 EXTRACTING BAGGAGE FROM AMADEUS FARE DETAILS');
  console.log(`🧳 Included checked bags: ${includedBags}`);
  console.log(`🧳 Baggage amenities found in fare details: ${baggageAmenities.length}`);

  const options = [];
  const currency = flightOffer.price.currency;

  // REAL DATA: Extract from amenities with actual prices
  if (baggageAmenities.length > 0) {
    console.log('✅ FOUND REAL BAGGAGE AMENITIES IN FARE:');
    baggageAmenities.forEach((amenity: any, index: number) => {
      const description = amenity.description || 'Checked baggage';
      const price = amenity.price ? parseFloat(amenity.price) : (35 + index * 10);

      console.log(`   ${index + 1}. ${description} - ${currency} ${price} ${amenity.price ? '✅ (Real price)' : '⚠️  (Estimated)'}`);

      options.push({
        id: `bag${index + 1}`,
        name: `Checked Bag ${index + 1}`,
        description: `${description} ✅`,
        price: price,
        currency: currency,
        isReal: !!amenity.price,
        metadata: {
          type: 'checked',
          isReal: !!amenity.price,
          source: 'amadeus_amenities',
        },
      });
    });
    console.log(`✅ Extracted ${options.length} baggage options from Amadeus amenities`);
    console.log('🧳 ========================================');
  }

  // FALLBACK: If no amenities, add standard options
  if (options.length === 0) {
    console.log('⚠️  NO BAGGAGE AMENITIES FOUND IN FARE DETAILS');
    console.log('⚠️  Using standard estimated pricing:');

    // Add first checked bag if not included
    if (includedBags === 0) {
      console.log(`   - Checked Bag 1: ${currency} 35 (Estimated)`);
      options.push({
        id: 'bag1',
        name: 'Checked Bag 1',
        description: 'Up to 23kg',
        price: 35,
        currency: currency,
        isReal: false,
        metadata: {
          type: 'checked',
          isReal: false,
          source: 'estimated',
        },
      });
    }

    // Add second checked bag
    console.log(`   - Checked Bag 2: ${currency} 45 (Estimated)`);
    options.push({
      id: 'bag2',
      name: 'Checked Bag 2',
      description: 'Up to 23kg',
      price: 45,
      currency: currency,
      isReal: false,
      metadata: {
        type: 'checked',
        isReal: false,
        source: 'estimated',
      },
    });

    // Add extra bag
    console.log(`   - Extra Bag: ${currency} 65 (Estimated)`);
    options.push({
      id: 'bag3',
      name: 'Extra Bag',
      description: 'Up to 23kg',
      price: 65,
      currency: currency,
      isReal: false,
      metadata: {
        type: 'checked',
        isReal: false,
        source: 'estimated',
      },
    });

    console.log(`⚠️  Generated ${options.length} estimated baggage options`);
    console.log('🧳 ========================================');
  }

  return options;
}

/**
 * Mock meals (not available in test API)
 */
function getMockMeals(flightOffer: any) {
  return [
    {
      id: 'standard-meal',
      name: 'Standard Meal',
      description: 'Hot meal + beverage',
      price: 12,
      currency: flightOffer.price.currency,
      isReal: false,
    },
    {
      id: 'premium-meal',
      name: 'Premium Meal',
      description: 'Upgraded dining',
      price: 18,
      currency: flightOffer.price.currency,
      isReal: false,
    },
  ];
}

/**
 * Mock WiFi (not available in test API)
 */
function getMockWifi(flightOffer: any) {
  return [
    {
      id: 'wifi-basic',
      name: 'In-flight WiFi',
      description: 'Stay connected',
      price: 12,
      currency: flightOffer.price.currency,
      isReal: false,
    },
  ];
}

/**
 * Mock insurance (requires 3rd party integration)
 */
function getMockInsurance(flightOffer: any) {
  const basePrice = parseFloat(flightOffer.price.total);

  return [
    {
      id: 'basic-ins',
      name: 'Basic Protection',
      description: 'Trip cancellation + medical',
      price: Math.round(basePrice * 0.05),
      currency: flightOffer.price.currency,
      isReal: false,
    },
    {
      id: 'standard-ins',
      name: 'Standard Coverage',
      description: 'Cancel for any reason + medical ($50k) + baggage',
      price: Math.round(basePrice * 0.08),
      currency: flightOffer.price.currency,
      isReal: false,
    },
    {
      id: 'premium-ins',
      name: 'Premium Coverage',
      description: 'All benefits + emergency evacuation',
      price: Math.round(basePrice * 0.12),
      currency: flightOffer.price.currency,
      isReal: false,
    },
  ];
}

/**
 * Mock lounge access
 */
function getMockLounge(flightOffer: any) {
  // Extract airport codes from itinerary
  const departureAirport =
    flightOffer.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || 'Airport';

  return [
    {
      id: 'lounge',
      name: `Airport Lounge (${departureAirport})`,
      description: 'Relax before your flight',
      price: 45,
      currency: flightOffer.price.currency,
      isReal: false,
    },
  ];
}

/**
 * Mock priority services
 */
function getMockPriority(flightOffer: any) {
  return [
    {
      id: 'priority',
      name: 'Priority Boarding',
      description: 'Board first',
      price: 15,
      currency: flightOffer.price.currency,
      isReal: false,
    },
    {
      id: 'fast-track',
      name: 'Fast Track Security',
      description: 'Skip the line',
      price: 25,
      currency: flightOffer.price.currency,
      isReal: false,
    },
  ];
}

export const runtime = 'nodejs';
