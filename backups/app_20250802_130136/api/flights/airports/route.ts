/**
 * Airport Search API Route
 * Handles airport search requests using Amadeus API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/flights/amadeus-client';
import { validateAirportSearchQuery, cleanAirportSearchQuery } from '@/lib/flights/validators';

/**
 * GET /api/flights/airports?keyword=SAO
 * Search for airports by keyword
 */
export async function GET(request: NextRequest) {
  console.log('🏭 Airport search API called');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    
    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetro keyword é obrigatório'
      }, { status: 400 });
    }

    const cleanedKeyword = cleanAirportSearchQuery(keyword);
    
    if (!validateAirportSearchQuery(cleanedKeyword)) {
      return NextResponse.json({
        success: false,
        error: 'Keyword deve ter entre 2 e 50 caracteres'
      }, { status: 400 });
    }

    console.log(`🔍 Searching airports with keyword: "${cleanedKeyword}"`);

    try {
      // Attempt real API call first
      const amadeusClient = getAmadeusClient();
      const response = await amadeusClient.searchAirports(cleanedKeyword);
      
      if (!response.data || response.data.length === 0) {
        console.log('📭 No airports found from Amadeus API');
        
        // Return fallback data if no results from API
        const fallbackData = getFallbackAirportData(cleanedKeyword);
        
        return NextResponse.json({
          success: true,
          data: fallbackData,
          meta: {
            total: fallbackData.length,
            keyword: cleanedKeyword,
            isFallbackData: true
          }
        });
      }

      // Process Amadeus response
      const processedData = response.data.map((airport: any) => ({
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
        timeZoneOffset: airport.timeZoneOffset
      }));

      console.log(`✅ Found ${processedData.length} airports from Amadeus API`);

      return NextResponse.json({
        success: true,
        data: processedData,
        meta: {
          total: processedData.length,
          keyword: cleanedKeyword,
          isRealData: true
        }
      });

    } catch (amadeusError) {
      console.warn('⚠️ Amadeus API temporarily unavailable, using fallback data:', (amadeusError as any)?.message);
      
      // Fallback to demo data
      const fallbackData = getFallbackAirportData(cleanedKeyword);
      
      console.log(`🔄 Serving ${fallbackData.length} airports (local demo data)`);
      
      return NextResponse.json({
        success: true,
        data: fallbackData,
        meta: {
          total: fallbackData.length,
          keyword: cleanedKeyword,
          isFallbackData: true,
          amadeusError: (amadeusError as any)?.message || 'API temporarily unavailable'
        }
      });
    }

  } catch (error) {
    console.error('❌ Airport search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Get fallback airport data for demo purposes
 */
function getFallbackAirportData(keyword: string): any[] {
  const allAirports = [
    // Brazil - Major airports
    {
      iataCode: 'GRU',
      name: 'São Paulo/Guarulhos International Airport',
      detailedName: 'São Paulo/Guarulhos International Airport, São Paulo, Brazil',
      city: 'São Paulo',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -23.4356, longitude: -46.4731 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'CGH',
      name: 'São Paulo/Congonhas Airport',
      detailedName: 'São Paulo/Congonhas Airport, São Paulo, Brazil',
      city: 'São Paulo',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -23.6266, longitude: -46.6556 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'VCP',
      name: 'Viracopos International Airport',
      detailedName: 'Viracopos International Airport, Campinas, Brazil',
      city: 'Campinas',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -23.0074, longitude: -47.1344 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'GIG',
      name: 'Rio de Janeiro/Galeão International Airport',
      detailedName: 'Rio de Janeiro/Galeão International Airport, Rio de Janeiro, Brazil',
      city: 'Rio de Janeiro',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -22.8089, longitude: -43.2436 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'SDU',
      name: 'Santos Dumont Airport',
      detailedName: 'Santos Dumont Airport, Rio de Janeiro, Brazil',
      city: 'Rio de Janeiro',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -22.9105, longitude: -43.1631 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'BSB',
      name: 'Brasília International Airport',
      detailedName: 'Brasília International Airport, Brasília, Brazil',
      city: 'Brasília',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -15.8697, longitude: -47.9208 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'SSA',
      name: 'Salvador International Airport',
      detailedName: 'Salvador International Airport, Salvador, Brazil',
      city: 'Salvador',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -12.9086, longitude: -38.3225 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'REC',
      name: 'Recife International Airport',
      detailedName: 'Recife International Airport, Recife, Brazil',
      city: 'Recife',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -8.1263, longitude: -34.9236 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'FOR',
      name: 'Fortaleza International Airport',
      detailedName: 'Fortaleza International Airport, Fortaleza, Brazil',
      city: 'Fortaleza',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -3.7761, longitude: -38.5326 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'BEL',
      name: 'Belém International Airport',
      detailedName: 'Belém International Airport, Belém, Brazil',
      city: 'Belém',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -1.3792, longitude: -48.4761 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'MAO',
      name: 'Manaus International Airport',
      detailedName: 'Manaus International Airport, Manaus, Brazil',
      city: 'Manaus',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -3.0386, longitude: -60.0497 },
      timeZoneOffset: '-04:00'
    },
    {
      iataCode: 'CWB',
      name: 'Curitiba International Airport',
      detailedName: 'Curitiba International Airport, Curitiba, Brazil',
      city: 'Curitiba',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -25.5284, longitude: -49.1759 },
      timeZoneOffset: '-03:00'
    },
    {
      iataCode: 'POA',
      name: 'Porto Alegre International Airport',
      detailedName: 'Porto Alegre International Airport, Porto Alegre, Brazil',
      city: 'Porto Alegre',
      country: 'Brazil',
      countryCode: 'BR',
      type: 'AIRPORT',
      coordinates: { latitude: -29.9944, longitude: -51.1714 },
      timeZoneOffset: '-03:00'
    },
    
    // USA - Major airports
    {
      iataCode: 'JFK',
      name: 'John F. Kennedy International Airport',
      detailedName: 'John F. Kennedy International Airport, New York, United States',
      city: 'New York',
      country: 'United States',
      countryCode: 'US',
      type: 'AIRPORT',
      coordinates: { latitude: 40.6413, longitude: -73.7781 },
      timeZoneOffset: '-05:00'
    },
    {
      iataCode: 'LAX',
      name: 'Los Angeles International Airport',
      detailedName: 'Los Angeles International Airport, Los Angeles, United States',
      city: 'Los Angeles',
      country: 'United States',
      countryCode: 'US',
      type: 'AIRPORT',
      coordinates: { latitude: 33.9425, longitude: -118.4081 },
      timeZoneOffset: '-08:00'
    },
    {
      iataCode: 'MIA',
      name: 'Miami International Airport',
      detailedName: 'Miami International Airport, Miami, United States',
      city: 'Miami',
      country: 'United States',
      countryCode: 'US',
      type: 'AIRPORT',
      coordinates: { latitude: 25.7959, longitude: -80.2870 },
      timeZoneOffset: '-05:00'
    },
    {
      iataCode: 'ORD',
      name: 'O\'Hare International Airport',
      detailedName: 'O\'Hare International Airport, Chicago, United States',
      city: 'Chicago',
      country: 'United States',
      countryCode: 'US',
      type: 'AIRPORT',
      coordinates: { latitude: 41.9742, longitude: -87.9073 },
      timeZoneOffset: '-06:00'
    },
    
    // Europe - Major airports
    {
      iataCode: 'LHR',
      name: 'London Heathrow Airport',
      detailedName: 'London Heathrow Airport, London, United Kingdom',
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      type: 'AIRPORT',
      coordinates: { latitude: 51.4700, longitude: -0.4543 },
      timeZoneOffset: '+00:00'
    },
    {
      iataCode: 'CDG',
      name: 'Paris Charles de Gaulle Airport',
      detailedName: 'Paris Charles de Gaulle Airport, Paris, France',
      city: 'Paris',
      country: 'France',
      countryCode: 'FR',
      type: 'AIRPORT',
      coordinates: { latitude: 49.0097, longitude: 2.5479 },
      timeZoneOffset: '+01:00'
    },
    {
      iataCode: 'FRA',
      name: 'Frankfurt Airport',
      detailedName: 'Frankfurt Airport, Frankfurt, Germany',
      city: 'Frankfurt',
      country: 'Germany',
      countryCode: 'DE',
      type: 'AIRPORT',
      coordinates: { latitude: 50.0379, longitude: 8.5622 },
      timeZoneOffset: '+01:00'
    },
    {
      iataCode: 'LIS',
      name: 'Lisbon Airport',
      detailedName: 'Lisbon Airport, Lisbon, Portugal',
      city: 'Lisbon',
      country: 'Portugal',
      countryCode: 'PT',
      type: 'AIRPORT',
      coordinates: { latitude: 38.7756, longitude: -9.1354 },
      timeZoneOffset: '+00:00'
    }
  ];

  // Filter airports based on keyword
  const lowerKeyword = keyword.toLowerCase();
  
  return allAirports.filter(airport => 
    airport.iataCode.toLowerCase().includes(lowerKeyword) ||
    airport.name.toLowerCase().includes(lowerKeyword) ||
    airport.city.toLowerCase().includes(lowerKeyword) ||
    airport.country.toLowerCase().includes(lowerKeyword)
  ).slice(0, 10); // Limit to top 10 results
}