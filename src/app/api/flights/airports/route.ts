/**
 * 🇺🇸 US AIRPORT SEARCH API ROUTE
 * Handles airport search requests with comprehensive US airport database fallback
 * Optimized for US market with instant results
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/flights/amadeus-client';
import { validateAirportSearchQuery, cleanAirportSearchQuery } from '@/lib/flights/validators';
import { getUSAirportSearch } from '@/lib/airports/us-airport-search';

/**
 * GET /api/flights/airports?keyword=LAX
 * Search for airports by keyword with US airport database priority
 */
export async function GET(request: NextRequest) {
  console.log('🇺🇸 US Airport search API called');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeInternational = searchParams.get('includeInternational') !== 'false';
    const includeRegional = searchParams.get('includeRegional') !== 'false';
    
    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: 'Keyword parameter is required'
      }, { status: 400 });
    }

    const cleanedKeyword = cleanAirportSearchQuery(keyword);
    
    if (!validateAirportSearchQuery(cleanedKeyword)) {
      return NextResponse.json({
        success: false,
        error: 'Keyword must be between 2 and 50 characters'
      }, { status: 400 });
    }

    console.log(`🔍 Searching airports with keyword: "${cleanedKeyword}"`);

    // STRATEGY: US airports first, then API fallback
    let usAirports: any[] = [];
    let apiAirports: any[] = [];
    let combinedResults: any[] = [];

    try {
      // 1. Search US airports database (instant results)
      const usResults = await getUSAirportSearch().searchAirports(cleanedKeyword, {
        limit: Math.min(limit, 15),
        includeInternational,
        includeRegional,
        sortBy: 'relevance'
      });

      usAirports = usResults.map(airport => ({
        iataCode: airport.iataCode,
        name: airport.name,
        detailedName: `${airport.name}, ${airport.city}, ${airport.country}`,
        city: airport.city,
        country: airport.country,
        countryCode: airport.stateCode, // For US airports, use state code
        state: airport.state,
        region: airport.region,
        type: 'AIRPORT',
        coordinates: {
          latitude: (airport as any).coordinates?.latitude || 0,
          longitude: (airport as any).coordinates?.longitude || 0
        },
        timezone: airport.timezone,
        category: airport.category,
        isInternational: airport.isInternational,
        passengerCount: airport.passengerCount,
        relevanceScore: airport.relevanceScore,
        matchType: airport.matchType,
        displayName: airport.displayName,
        description: airport.description,
        popularRoutes: airport.popularRoutes,
        isUSAirport: true
      }));

      console.log(`🇺🇸 Found ${usAirports.length} US airports`);

      // 2. If we have good US results, prioritize them
      if (usAirports.length >= 3) {
        combinedResults = usAirports.slice(0, limit);
      } else {
        // 3. Supplement with Amadeus API results
        try {
          const amadeusClient = getAmadeusClient();
          const response = await amadeusClient.searchAirports(cleanedKeyword);
          
          if (response.data && response.data.length > 0) {
            apiAirports = response.data.map((airport: any) => ({
              iataCode: airport.iataCode,
              name: airport.name,
              detailedName: airport.detailedName,
              city: airport.address?.cityName || '',
              country: airport.address?.countryName || '',
              countryCode: airport.address?.countryCode || '',
              type: airport.subType,
              coordinates: airport.geoCode ? {
                latitude: airport.geoCode.latitude,
                longitude: airport.geoCode.longitude
              } : null,
              timeZoneOffset: airport.timeZoneOffset,
              isUSAirport: false
            }));

            console.log(`🌍 Found ${apiAirports.length} international airports from Amadeus`);
          }
        } catch (amadeusError) {
          console.warn('⚠️ Amadeus API temporarily unavailable:', (amadeusError as any)?.message);
        }

        // 4. Combine results: US airports first, then international
        const uniqueResults = new Map();
        
        // Add US airports first (higher priority)
        usAirports.forEach(airport => {
          uniqueResults.set(airport.iataCode, airport);
        });
        
        // Add API airports if not already present
        apiAirports.forEach(airport => {
          if (!uniqueResults.has(airport.iataCode)) {
            uniqueResults.set(airport.iataCode, airport);
          }
        });
        
        combinedResults = Array.from(uniqueResults.values()).slice(0, limit);
      }

      console.log(`✅ Returning ${combinedResults.length} total airports (${usAirports.length} US, ${apiAirports.length} international)`);

      return NextResponse.json({
        success: true,
        data: combinedResults,
        meta: {
          total: combinedResults.length,
          keyword: cleanedKeyword,
          breakdown: {
            usAirports: usAirports.length,
            internationalAirports: apiAirports.length
          },
          searchStrategy: 'us_priority_with_api_fallback'
        }
      });

    } catch (searchError) {
      console.error('❌ Airport search processing error:', searchError);
      
      // Final fallback to basic US airports
      const fallbackResults = await getUSAirportSearch().searchAirports(cleanedKeyword, { limit: 5 });
      
      return NextResponse.json({
        success: true,
        data: fallbackResults.map(airport => ({
          iataCode: airport.iataCode,
          name: airport.name,
          detailedName: `${airport.name}, ${airport.city}, ${airport.country}`,
          city: airport.city,
          country: airport.country,
          countryCode: airport.stateCode,
          type: 'AIRPORT',
          displayName: airport.displayName,
          description: airport.description,
          isUSAirport: true
        })),
        meta: {
          total: fallbackResults.length,
          keyword: cleanedKeyword,
          isFallbackData: true,
          searchStrategy: 'us_fallback_only'
        }
      });
    }

  } catch (error) {
    console.error('❌ Airport search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * 🇺🇸 US AIRPORTS API - Complete implementation with comprehensive database
 * Features:
 * - 20+ major US airports pre-configured
 * - Instant search results for US market
 * - Smart fallback when Amadeus API is unavailable
 * - Geographic and timezone intelligence
 * - Popular routes suggestions
 * - Typo tolerance and fuzzy matching
 */