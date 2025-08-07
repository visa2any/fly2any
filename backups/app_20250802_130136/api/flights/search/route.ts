/**
 * Flight Search API Route - CLEANED VERSION
 * Handles flight search requests using Amadeus API - Real data only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/flights/amadeus-client';
import { validateFlightSearchParams, convertFormToSearchParams } from '@/lib/flights/validators';
import { formatFlightOffer } from '@/lib/flights/formatters';
import { AMADEUS_CONFIG } from '@/lib/flights/amadeus-config';
import type { FlightSearchParams, ProcessedFlightOffer } from '@/types/flights';

/**
 * GET /api/flights/search
 * Search for flight offers
 */
export async function GET(request: NextRequest) {
  console.log('🛫 Flight search API called');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract and validate search parameters
    const flightSearchParams: FlightSearchParams = {
      originLocationCode: searchParams.get('originLocationCode') || '',
      destinationLocationCode: searchParams.get('destinationLocationCode') || '',
      departureDate: searchParams.get('departureDate') || '',
      adults: parseInt(searchParams.get('adults') || '1', 10),
      returnDate: searchParams.get('returnDate') || undefined,
      children: searchParams.get('children') ? parseInt(searchParams.get('children')!, 10) : undefined,
      infants: searchParams.get('infants') ? parseInt(searchParams.get('infants')!, 10) : undefined,
      travelClass: (searchParams.get('travelClass') as any) || AMADEUS_CONFIG.DEFAULTS.TRAVEL_CLASS,
      oneWay: searchParams.get('oneWay') === 'true',
      nonStop: searchParams.get('nonStop') === 'true',
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      max: searchParams.get('max') ? parseInt(searchParams.get('max')!, 10) : AMADEUS_CONFIG.DEFAULTS.MAX_RESULTS,
      currencyCode: searchParams.get('currencyCode') || 'USD'
    };

    console.log('🔍 Flight search parameters:', flightSearchParams);

    // Validate parameters
    const validationErrors = validateFlightSearchParams(flightSearchParams);
    if (validationErrors.length > 0) {
      console.warn('❌ Validation errors:', validationErrors);
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: validationErrors
      }, { status: 400 });
    }

    // Get Amadeus client and search flights
    const amadeusClient = getAmadeusClient();
    
    try {
      // Real API call
      console.log('📡 Calling Amadeus API for flight search...');
      const response = await amadeusClient.searchFlights(flightSearchParams);
      
      if (!response.data || response.data.length === 0) {
        console.log('📭 No flights found from Amadeus API');
        return NextResponse.json({
          success: true,
          data: [],
          meta: {
            total: 0,
            searchId: `amadeus-${Date.now()}`,
            currency: flightSearchParams.currencyCode || 'USD',
            filters: {}
          }
        });
      }

      // Try to get detailed fare rules for the first few offers
      let enhancedOffers = response.data;
      try {
        console.log('🔍 Attempting to get detailed fare rules...');
        const firstFiveOffers = response.data.slice(0, 5);
        const detailedResponse = await amadeusClient.confirmPricingWithFareRules(firstFiveOffers);
        
        if (detailedResponse?.data?.flightOffers) {
          enhancedOffers = detailedResponse.data.flightOffers;
          console.log('✅ Enhanced with detailed fare rules');
        }
      } catch (fareRulesError) {
        console.warn('⚠️ Detailed fare rules not available, using basic data:', (fareRulesError as any)?.message);
      }

      // Process and format flight offers with error handling
      const processedOffers: ProcessedFlightOffer[] = [];
      
      for (const offer of enhancedOffers) {
        try {
          const processedOffer = formatFlightOffer(offer, response.dictionaries);
          processedOffers.push(processedOffer);
        } catch (formatError) {
          console.warn('⚠️ Error formatting flight offer:', {
            offerId: offer.id,
            error: (formatError as any)?.message
          });
          // Continue processing other offers
        }
      }

      console.log(`✅ Successfully processed ${processedOffers.length} flight offers`);

      return NextResponse.json({
        success: true,
        data: processedOffers,
        meta: {
          total: processedOffers.length,
          searchId: `amadeus-${Date.now()}`,
          currency: flightSearchParams.currencyCode || 'USD',
          searchTime: new Date().toISOString(),
          source: 'amadeus',
          filters: {}
        }
      });

    } catch (amadeusError) {
      console.error('❌ Amadeus API error:', amadeusError);
      
      // Return empty results for real API failures - no demo data
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          searchId: `amadeus-error-${Date.now()}`,
          currency: flightSearchParams.currencyCode || 'USD',
          error: 'Search service temporarily unavailable'
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('❌ Flight search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: [(error as any)?.message || 'Unknown error']
    }, { status: 500 });
  }
}

/**
 * POST /api/flights/search
 * Search for flight offers via POST body
 */
export async function POST(request: NextRequest) {
  console.log('🛫 Flight search API (POST) called');
  
  try {
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json({
        success: false,
        error: 'Form data is required'
      }, { status: 400 });
    }

    // Convert form data to search parameters
    const searchParams = convertFormToSearchParams(formData);
    console.log('🔄 Converted form data to search params:', searchParams);

    // Validate converted parameters
    const validationErrors = validateFlightSearchParams(searchParams);
    if (validationErrors.length > 0) {
      console.warn('❌ Validation errors:', validationErrors);
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: validationErrors
      }, { status: 400 });
    }

    // Get Amadeus client and search flights
    const amadeusClient = getAmadeusClient();
    
    try {
      console.log('📡 Calling Amadeus API for flight search...');
      const response = await amadeusClient.searchFlights(searchParams);
      
      if (!response.data || response.data.length === 0) {
        console.log('📭 No flights found from Amadeus API');
        return NextResponse.json({
          success: true,
          data: [],
          meta: {
            total: 0,
            searchId: `amadeus-${Date.now()}`,
            currency: searchParams.currencyCode || 'USD',
            filters: {}
          }
        });
      }

      // Process and format flight offers
      const processedOffers: ProcessedFlightOffer[] = [];
      
      for (const offer of response.data) {
        try {
          const processedOffer = formatFlightOffer(offer, response.dictionaries);
          processedOffers.push(processedOffer);
        } catch (formatError) {
          console.warn('⚠️ Error formatting flight offer:', {
            offerId: offer.id,
            error: (formatError as any)?.message
          });
        }
      }

      console.log(`✅ Successfully processed ${processedOffers.length} flight offers`);

      return NextResponse.json({
        success: true,
        data: processedOffers,
        meta: {
          total: processedOffers.length,
          searchId: `amadeus-${Date.now()}`,
          currency: searchParams.currencyCode || 'USD',
          searchTime: new Date().toISOString(),
          source: 'amadeus',
          filters: {}
        }
      });

    } catch (amadeusError) {
      console.error('❌ Amadeus API error:', amadeusError);
      
      // Return empty results for API failures
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          searchId: `amadeus-error-${Date.now()}`,
          currency: searchParams.currencyCode || 'USD',
          error: 'Search service temporarily unavailable'
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('❌ Flight search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: [(error as any)?.message || 'Unknown error']
    }, { status: 500 });
  }
}