/**
 * Flight Pricing Confirmation API Route
 * Confirms latest prices and availability for flight offers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/flights/amadeus-client';
import { validateFlightOffer } from '@/lib/flights/validators';

/**
 * POST /api/flights/pricing
 * Confirm flight offer pricing and availability
 */
export async function POST(request: NextRequest) {
  console.log('💰 Flight pricing confirmation API called');
  
  try {
    const body = await request.json();
    const { flightOffers } = body;
    
    if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Flight offers array é obrigatório'
      }, { status: 400 });
    }

    // Validate flight offers structure
    const invalidOffers = flightOffers.filter(offer => !validateFlightOffer(offer));
    if (invalidOffers.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Estrutura de flight offer inválida',
        details: `${invalidOffers.length} offers inválidos`
      }, { status: 400 });
    }

    console.log(`💰 Confirming pricing for ${flightOffers.length} flight offers`);

    try {
      // Attempt real API call first
      const amadeusClient = getAmadeusClient();
      const response = await amadeusClient.confirmPricing(flightOffers);
      
      if (!response.data) {
        console.log('📭 No pricing data returned from Amadeus API');
        return NextResponse.json({
          success: false,
          error: 'Não foi possível confirmar os preços no momento'
        }, { status: 404 });
      }

      console.log('✅ Pricing confirmed successfully from Amadeus API');

      return NextResponse.json({
        success: true,
        data: response.data,
        meta: {
          confirmedAt: new Date().toISOString(),
          source: 'amadeus-api',
          offersCount: Array.isArray(response.data.flightOffers) ? response.data.flightOffers.length : 0
        }
      });

    } catch (amadeusError) {
      console.warn('⚠️ Amadeus pricing API temporarily unavailable:', (amadeusError as any)?.message);
      
      // For demo purposes, return the original offers with minor price adjustments
      const confirmedOffers = generateConfirmedPricing(flightOffers);
      
      console.log('🔄 Serving confirmed pricing (local demo simulation)');
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'flight-offers-pricing',
          flightOffers: confirmedOffers,
          bookingRequirements: {
            invoiceAddressRequired: false,
            mailingAddressRequired: false,
            emailAddressRequired: true,
            phoneCountryCodeRequired: true,
            mobilePhoneNumberRequired: true,
            phoneNumberRequired: true,
            postalCodeRequired: false,
            travelerRequirements: [{
              travelerId: '1',
              genderRequired: true,
              documentRequired: true,
              documentIssuanceCityRequired: false,
              dateOfBirthRequired: true,
              redressRequiredIfAny: false,
              airFranceDiscountTravelRequiredIfAny: false,
              spanishResidentDiscountRequired: false
            }]
          }
        },
        meta: {
          confirmedAt: new Date().toISOString(),
          source: 'demo-simulation',
          offersCount: confirmedOffers.length,
          amadeusError: (amadeusError as any)?.message || 'API temporarily unavailable'
        }
      });
    }

  } catch (error) {
    console.error('❌ Flight pricing confirmation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Generate confirmed pricing simulation for demo purposes
 */
function generateConfirmedPricing(originalOffers: any[]): any[] {
  return originalOffers.map((offer, index) => {
    // Simulate price variations (±5%)
    const priceVariation = (Math.random() - 0.5) * 0.1; // -5% to +5%
    const originalPrice = parseFloat(offer.price?.total || '1000');
    const newPrice = Math.max(originalPrice * (1 + priceVariation), 100);
    
    // Simulate availability changes
    const availabilityChange = Math.random() > 0.8; // 20% chance of change
    const newAvailability = availabilityChange 
      ? Math.max(1, Math.floor(Math.random() * 9))
      : offer.numberOfBookableSeats || 5;

    return {
      ...offer,
      id: offer.id || `confirmed-${index + 1}`,
      source: 'GDS',
      instantTicketingRequired: offer.instantTicketingRequired || false,
      nonHomogeneous: false,
      oneWay: offer.oneWay || false,
      lastTicketingDate: offer.lastTicketingDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      numberOfBookableSeats: newAvailability,
      price: {
        ...offer.price,
        currency: offer.price?.currency || 'BRL',
        total: newPrice.toFixed(2),
        base: (newPrice * 0.85).toFixed(2),
        fees: [{
          amount: (newPrice * 0.15).toFixed(2),
          type: 'SUPPLIER'
        }],
        grandTotal: newPrice.toFixed(2),
        additionalServices: []
      },
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: true
      },
      validatingAirlineCodes: offer.validatingAirlineCodes || ['LA'],
      travelerPricings: offer.travelerPricings || [{
        travelerId: '1',
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: offer.price?.currency || 'BRL',
          total: newPrice.toFixed(2),
          base: (newPrice * 0.85).toFixed(2)
        },
        fareDetailsBySegment: offer.itineraries?.[0]?.segments?.map((segment: any, segIndex: number) => ({
          segmentId: segment.id || `${segIndex + 1}`,
          cabin: 'ECONOMY',
          fareBasis: 'OOWBR',
          brandedFare: 'BASIC',
          class: 'O',
          includedCheckedBags: {
            quantity: 1,
            weight: 23,
            weightUnit: 'KG'
          }
        })) || []
      }],
      fareRules: {
        rules: [{
          category: 'EXCHANGE',
          maxPenaltyAmount: '150.00'
        }, {
          category: 'REFUND',
          maxPenaltyAmount: '200.00'
        }]
      }
    };
  });
}