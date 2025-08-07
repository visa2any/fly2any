/**
 * Flight Search API Route
 * Handles flight search requests using Amadeus API
 * Real API integration only - no fallback data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/flights/amadeus-client';
import { validateFlightSearchParams, convertFormToSearchParams } from '@/lib/flights/validators';
import { formatFlightOffer } from '@/lib/flights/formatters';
import { AMADEUS_CONFIG } from '@/lib/flights/amadeus-config';
import type { FlightSearchParams, ProcessedFlightOffer, TravelerType, CabinClass } from '@/types/flights';

/**
 * Parse ISO date string safely avoiding timezone issues
 * Input: "2025-09-02" -> Output: Date object for September 2, 2025 in local timezone  
 */
function parseISODateSafe(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Format date consistently avoiding timezone issues
 * Input: "2025-08-20" -> Output: "Aug 20"
 */
function formatDateConsistent(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${monthNames[month - 1]} ${day}`;
}

/**
 * GET /api/flights/search
 * Search for flight offers using real Amadeus API only
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
        error: 'Parâmetros de busca inválidos',
        details: validationErrors
      }, { status: 400 });
    }

    // Get Amadeus client and search flights
    const amadeusClient = getAmadeusClient();
    
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

    // 🎯 OPTIMIZED: Enhanced fare rules extraction with API optimization
    let enhancedOffers = response.data;
    
    try {
      console.log('🔍 Attempting optimized data enhancement...');
      const firstFiveOffers = response.data.slice(0, 5); // Limit to first 5 to avoid API limits
      
      // Try optimized single API call first
      try {
        const optimizedResult = await amadeusClient.confirmPricingWithAllIncludes(
          firstFiveOffers,
          'detailed-fare-rules,bags'
        );
        
        if (optimizedResult?.data?.flightOffers) {
          enhancedOffers = optimizedResult.data.flightOffers;
          console.log('✅ Enhanced with optimized single API call (2-in-1 savings)');
        } else {
          throw new Error('Optimized call returned no data');
        }
        
      } catch (optimizedError) {
        const errorMsg = (optimizedError as any)?.message || 'Unknown error';
        if (errorMsg.includes('No fare applicable')) {
          console.log('ℹ️ Enhanced pricing not available for these offers (normal in test environment), using basic pricing');
        } else {
          console.warn('⚠️ Optimized call failed, falling back to individual calls:', errorMsg);
        }
        
        // Fallback to individual calls (existing behavior)
        const enhancementAttempts = [
          amadeusClient.confirmPricingWithFareRules(firstFiveOffers)
            .then(result => ({ type: 'detailed-fare-rules', data: result }))
            .catch(error => ({ type: 'detailed-fare-rules', error })),
          
          amadeusClient.getBaggageOptions(firstFiveOffers)
            .then((result: any) => ({ type: 'baggage', data: result }))
            .catch((error: any) => ({ type: 'baggage', error }))
        ];
        
        const results = await Promise.allSettled(enhancementAttempts);
        
        // Merge data from successful attempts
        for (const result of results) {
          if (result.status === 'fulfilled') {
            const resultValue = result.value as { type: string; data?: any; error?: any };
            
            if (resultValue.data?.data?.flightOffers) {
              const enhancedData = resultValue.data.data.flightOffers;
              console.log(`✅ Enhanced with ${resultValue.type} data (fallback)`);
              
              // Merge enhanced data with original offers
              enhancedData.forEach((enhancedOffer: any, index: number) => {
                if (enhancedOffers[index]) {
                  enhancedOffers[index] = {
                    ...enhancedOffers[index],
                    ...enhancedOffer,
                    // Preserve original data and add enhanced data
                    enhancedWith: [...(enhancedOffers[index].enhancedWith || []), resultValue.type]
                  };
                }
              });
            } else if (resultValue.error) {
              const errorMsg = resultValue.error.message || 'Unknown error';
              if (errorMsg.includes('No fare applicable')) {
                console.log(`ℹ️ ${resultValue.type} data not available (normal in test environment)`);
              } else {
                console.warn(`⚠️ ${resultValue.type} enhancement failed:`, errorMsg);
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.warn('⚠️ All enhancement attempts failed, using basic data:', (error as any)?.message);
      // Continue with basic data
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
          error: (formatError as any)?.message,
          offer: JSON.stringify(offer, null, 2).slice(0, 500) + '...'
        });
        // Skip this offer but continue with others
        continue;
      }
    }

    // Success summary
    const enhancedCount = processedOffers.filter(offer => offer.enhanced && Object.keys(offer.enhanced).length > 0).length;
    console.log(`✅ Flight search completed successfully!`);
    console.log(`📊 Results: ${processedOffers.length} flights found, ${enhancedCount} with enhanced data`);
    
    if (enhancedCount < processedOffers.length) {
      console.log(`ℹ️ Note: Some enhancement APIs unavailable in test environment, but all flights have complete booking data`);
    }

    // If no offers were successfully processed, return empty result
    if (processedOffers.length === 0) {
      console.log('📭 No flights could be processed successfully');
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          searchId: `amadeus-${Date.now()}`,
          currency: flightSearchParams.currencyCode || 'USD',
          note: 'No flights could be processed successfully'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: processedOffers,
      meta: {
        total: processedOffers.length,
        searchId: `amadeus-${Date.now()}`,
        currency: flightSearchParams.currencyCode || 'USD',
        originalResponse: {
          hasData: !!response.data,
          dataLength: response.data?.length || 0,
          hasDictionaries: !!response.dictionaries,
          hasDetailedFareRules: enhancedOffers !== response.data
        }
      }
    });

  } catch (error) {
    console.error('❌ Flight search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}