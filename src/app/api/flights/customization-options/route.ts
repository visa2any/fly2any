/**
 * 🎯 Flight Customization Options API Route
 * Server-side route for safe Amadeus API calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/flights/amadeus-client';
import { ApiOptimizationManager } from '@/lib/flights/api-optimization-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightOffer, includes = [] } = body;

    if (!flightOffer) {
      return NextResponse.json(
        { success: false, error: 'Flight offer is required' },
        { status: 400 }
      );
    }

    // 🛡️ Server-side only - this ensures we never run in browser
    if (typeof window !== 'undefined') {
      return NextResponse.json(
        { success: false, error: 'This endpoint must run server-side only' },
        { status: 500 }
      );
    }

    console.log('🎯 Processing customization options request for flight offer:', flightOffer.id);

    try {
      // Use API optimization manager for efficient calls
      const apiManager = ApiOptimizationManager.getInstance();
      
      const requiredData = {
        fareRules: includes.includes('fare-rules'),
        baggage: includes.includes('baggage'),
        brandedFares: includes.includes('branded-fares'),
        seatMaps: includes.includes('seat-maps'),
        otherServices: includes.includes('other-services')
      };

      const result = await apiManager.getOptimizedAncillaryData([flightOffer], requiredData);

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data,
          metadata: {
            apiCallsMade: result.apiCallsMade,
            source: result.source,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // Return partial data with errors
        return NextResponse.json({
          success: false,
          data: result.data,
          error: result.errors?.join(', ') || 'Failed to fetch customization data',
          metadata: {
            apiCallsMade: result.apiCallsMade,
            source: result.source,
            timestamp: new Date().toISOString()
          }
        });
      }

    } catch (apiError) {
      console.error('API optimization failed:', apiError);
      
      // Fallback to basic estimates
      return NextResponse.json({
        success: false,
        error: apiError instanceof Error ? apiError.message : 'API request failed',
        data: generateBasicCustomizationData(flightOffer),
        metadata: {
          apiCallsMade: 0,
          source: 'fallback',
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('❌ Customization options API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        metadata: {
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Generate basic customization data as fallback
 */
function generateBasicCustomizationData(flightOffer: any) {
  const basePrice = parseFloat(flightOffer.price?.total || '0');
  
  return {
    pricingWithFareRules: {
      data: {
        flightOffers: [{
          ...flightOffer,
          detailedFareRules: [{
            category: 'REFUND',
            rules: [{ text: 'Refundable with conditions - contact airline for details' }]
          }, {
            category: 'EXCHANGE',
            rules: [{ text: 'Changes allowed with fees - contact airline for details' }]
          }]
        }]
      }
    },
    pricingWithBaggage: {
      data: {
        flightOffers: [{
          ...flightOffer,
          travelerPricings: [{
            travelerType: 'ADULT',
            fareDetailsBySegment: [{
              additionalServices: {
                chargeableCheckedBags: [{
                  quantity: 1,
                  weight: 23,
                  weightUnit: 'kg',
                  price: { amount: '35', currency: flightOffer.price?.currency || 'USD' }
                }]
              }
            }]
          }]
        }]
      }
    },
    otherServices: {
      data: {
        services: [{
          type: 'SEATS',
          description: 'Seat selection',
          price: { amount: '15', currency: flightOffer.price?.currency || 'USD' }
        }]
      }
    },
    timestamp: Date.now(),
    offerId: flightOffer.id || 'unknown'
  };
}