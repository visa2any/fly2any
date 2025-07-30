/**
 * Flight Search API Route
 * Handles flight search requests using Amadeus API
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
      currencyCode: searchParams.get('currencyCode') || AMADEUS_CONFIG.DEFAULTS.CURRENCY
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
    
    try {
      // Attempt real API call first
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
            currency: flightSearchParams.currencyCode || 'BRL',
            filters: {}
          }
        });
      }

      // Process and format flight offers
      const processedOffers: ProcessedFlightOffer[] = response.data.map(offer => 
        formatFlightOffer(offer, response.dictionaries)
      );

      console.log(`✅ Found ${processedOffers.length} flights from Amadeus API`);

      return NextResponse.json({
        success: true,
        data: processedOffers,
        meta: {
          total: processedOffers.length,
          searchId: `amadeus-${Date.now()}`,
          currency: flightSearchParams.currencyCode || 'BRL',
          originalResponse: {
            hasData: !!response.data,
            dataLength: response.data?.length || 0,
            hasDictionaries: !!response.dictionaries
          }
        }
      });

    } catch (amadeusError) {
      console.warn('⚠️ Amadeus API temporarily unavailable, using fallback data:', (amadeusError as any)?.message);
      console.log('💡 Para usar dados 100% reais, verifique: 1) Conexão com internet, 2) Status da Amadeus API, 3) Chaves de API válidas');
      
      // Fallback to demo data based on Amadeus structure
      const fallbackData = generateFallbackFlightData(flightSearchParams);
      
      console.log(`🔄 Serving ${fallbackData.length} realistic flights (local demo data structured like Amadeus)`);
      
      return NextResponse.json({
        success: true,
        data: fallbackData,
        meta: {
          total: fallbackData.length,
          searchId: `demo-${Date.now()}`,
          currency: flightSearchParams.currencyCode || 'BRL',
          isDemoData: true,
          amadeusError: (amadeusError as any)?.message || 'API temporarily unavailable'
        }
      });
    }

  } catch (error) {
    console.error('❌ Flight search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Generate fallback flight data for demo purposes
 */
function generateFallbackFlightData(params: FlightSearchParams): ProcessedFlightOffer[] {
  const { originLocationCode, destinationLocationCode, departureDate, returnDate } = params;
  
  // Generate realistic flight offers based on route
  const offers: ProcessedFlightOffer[] = [
    {
      id: 'demo-flight-1',
      totalPrice: 'R$ 1.280,50',
      currency: 'BRL',
      outbound: {
        departure: {
          iataCode: originLocationCode,
          airportName: getAirportName(originLocationCode),
          cityName: getCityName(originLocationCode),
          countryName: 'Brasil',
          dateTime: `${departureDate}T08:30:00`,
          date: new Date(departureDate).toLocaleDateString('pt-BR'),
          time: '08:30',
          timeZone: 'America/Sao_Paulo'
        },
        arrival: {
          iataCode: destinationLocationCode,
          airportName: getAirportName(destinationLocationCode),
          cityName: getCityName(destinationLocationCode),
          countryName: getCountryName(destinationLocationCode),
          dateTime: `${departureDate}T${getArrivalTime('08:30', 135)}`,
          date: new Date(departureDate).toLocaleDateString('pt-BR'),
          time: getArrivalTime('08:30', 135),
          timeZone: 'America/Sao_Paulo'
        },
        duration: '2h 15min',
        durationMinutes: 135,
        stops: 0,
        segments: [{
          id: 'segment-1',
          departure: {
            iataCode: originLocationCode,
            airportName: getAirportName(originLocationCode),
            dateTime: `${departureDate}T08:30:00`,
            date: new Date(departureDate).toLocaleDateString('pt-BR'),
            time: '08:30'
          },
          arrival: {
            iataCode: destinationLocationCode,
            airportName: getAirportName(destinationLocationCode),
            dateTime: `${departureDate}T${getArrivalTime('08:30', 135)}`,
            date: new Date(departureDate).toLocaleDateString('pt-BR'),
            time: getArrivalTime('08:30', 135)
          },
          duration: '2h 15min',
          durationMinutes: 135,
          airline: {
            code: 'LA',
            name: 'LATAM Airlines',
            logo: 'https://images.kiwi.com/airlines/64/LA.png'
          },
          flightNumber: 'LA3502',
          aircraft: {
            code: '320',
            name: 'Airbus A320'
          },
          cabin: 'ECONOMY'
        }]
      },
      inbound: returnDate ? {
        departure: {
          iataCode: destinationLocationCode,
          airportName: getAirportName(destinationLocationCode),
          cityName: getCityName(destinationLocationCode),
          countryName: getCountryName(destinationLocationCode),
          dateTime: `${returnDate}T14:20:00`,
          date: new Date(returnDate).toLocaleDateString('pt-BR'),
          time: '14:20',
          timeZone: 'America/Sao_Paulo'
        },
        arrival: {
          iataCode: originLocationCode,
          airportName: getAirportName(originLocationCode),
          cityName: getCityName(originLocationCode),
          countryName: 'Brasil',
          dateTime: `${returnDate}T${getArrivalTime('14:20', 135)}`,
          date: new Date(returnDate).toLocaleDateString('pt-BR'),
          time: getArrivalTime('14:20', 135),
          timeZone: 'America/Sao_Paulo'
        },
        duration: '2h 15min',
        durationMinutes: 135,
        stops: 0,
        segments: [{
          id: 'segment-2',
          departure: {
            iataCode: destinationLocationCode,
            airportName: getAirportName(destinationLocationCode),
            dateTime: `${returnDate}T14:20:00`,
            date: new Date(returnDate).toLocaleDateString('pt-BR'),
            time: '14:20'
          },
          arrival: {
            iataCode: originLocationCode,
            airportName: getAirportName(originLocationCode),
            dateTime: `${returnDate}T${getArrivalTime('14:20', 135)}`,
            date: new Date(returnDate).toLocaleDateString('pt-BR'),
            time: getArrivalTime('14:20', 135)
          },
          duration: '2h 15min',
          durationMinutes: 135,
          airline: {
            code: 'LA',
            name: 'LATAM Airlines',
            logo: 'https://images.kiwi.com/airlines/64/LA.png'
          },
          flightNumber: 'LA3503',
          aircraft: {
            code: '320',
            name: 'Airbus A320'
          },
          cabin: 'ECONOMY'
        }]
      } : undefined,
      numberOfBookableSeats: 7,
      validatingAirlines: ['LATAM Airlines'],
      lastTicketingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      instantTicketingRequired: false,
      rawOffer: {} as any
    },
    {
      id: 'demo-flight-2',
      totalPrice: 'R$ 980,00',
      currency: 'BRL',
      outbound: {
        departure: {
          iataCode: originLocationCode,
          airportName: getAirportName(originLocationCode),
          cityName: getCityName(originLocationCode),
          countryName: 'Brasil',
          dateTime: `${departureDate}T15:45:00`,
          date: new Date(departureDate).toLocaleDateString('pt-BR'),
          time: '15:45',
          timeZone: 'America/Sao_Paulo'
        },
        arrival: {
          iataCode: destinationLocationCode,
          airportName: getAirportName(destinationLocationCode),
          cityName: getCityName(destinationLocationCode),
          countryName: getCountryName(destinationLocationCode),
          dateTime: `${departureDate}T${getArrivalTime('15:45', 140)}`,
          date: new Date(departureDate).toLocaleDateString('pt-BR'),
          time: getArrivalTime('15:45', 140),
          timeZone: 'America/Sao_Paulo'
        },
        duration: '2h 20min',
        durationMinutes: 140,
        stops: 0,
        segments: [{
          id: 'segment-3',
          departure: {
            iataCode: originLocationCode,
            airportName: getAirportName(originLocationCode),
            dateTime: `${departureDate}T15:45:00`,
            date: new Date(departureDate).toLocaleDateString('pt-BR'),
            time: '15:45'
          },
          arrival: {
            iataCode: destinationLocationCode,
            airportName: getAirportName(destinationLocationCode),
            dateTime: `${departureDate}T${getArrivalTime('15:45', 140)}`,
            date: new Date(departureDate).toLocaleDateString('pt-BR'),
            time: getArrivalTime('15:45', 140)
          },
          duration: '2h 20min',
          durationMinutes: 140,
          airline: {
            code: 'G3',
            name: 'GOL Linhas Aéreas',
            logo: 'https://images.kiwi.com/airlines/64/G3.png'
          },
          flightNumber: 'G31847',
          aircraft: {
            code: '737',
            name: 'Boeing 737-800'
          },
          cabin: 'ECONOMY'
        }]
      },
      inbound: returnDate ? {
        departure: {
          iataCode: destinationLocationCode,
          airportName: getAirportName(destinationLocationCode),
          cityName: getCityName(destinationLocationCode),
          countryName: getCountryName(destinationLocationCode),
          dateTime: `${returnDate}T19:30:00`,
          date: new Date(returnDate).toLocaleDateString('pt-BR'),
          time: '19:30',
          timeZone: 'America/Sao_Paulo'
        },
        arrival: {
          iataCode: originLocationCode,
          airportName: getAirportName(originLocationCode),
          cityName: getCityName(originLocationCode),
          countryName: 'Brasil',
          dateTime: `${returnDate}T${getArrivalTime('19:30', 140)}`,
          date: new Date(returnDate).toLocaleDateString('pt-BR'),
          time: getArrivalTime('19:30', 140),
          timeZone: 'America/Sao_Paulo'
        },
        duration: '2h 20min',
        durationMinutes: 140,
        stops: 0,
        segments: [{
          id: 'segment-4',
          departure: {
            iataCode: destinationLocationCode,
            airportName: getAirportName(destinationLocationCode),
            dateTime: `${returnDate}T19:30:00`,
            date: new Date(returnDate).toLocaleDateString('pt-BR'),
            time: '19:30'
          },
          arrival: {
            iataCode: originLocationCode,
            airportName: getAirportName(originLocationCode),
            dateTime: `${returnDate}T${getArrivalTime('19:30', 140)}`,
            date: new Date(returnDate).toLocaleDateString('pt-BR'),
            time: getArrivalTime('19:30', 140)
          },
          duration: '2h 20min',
          durationMinutes: 140,
          airline: {
            code: 'G3',
            name: 'GOL Linhas Aéreas',
            logo: 'https://images.kiwi.com/airlines/64/G3.png'
          },
          flightNumber: 'G31848',
          aircraft: {
            code: '737',
            name: 'Boeing 737-800'
          },
          cabin: 'ECONOMY'
        }]
      } : undefined,
      numberOfBookableSeats: 12,
      validatingAirlines: ['GOL Linhas Aéreas'],
      lastTicketingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      instantTicketingRequired: true,
      rawOffer: {} as any
    }
  ];

  return offers;
}

// Helper functions for fallback data
function getAirportName(iataCode: string): string {
  const airports: Record<string, string> = {
    'GRU': 'Aeroporto Internacional de São Paulo/Guarulhos',
    'CGH': 'Aeroporto de São Paulo/Congonhas',
    'GIG': 'Aeroporto Internacional do Rio de Janeiro/Galeão',
    'SDU': 'Aeroporto Santos Dumont',
    'BSB': 'Aeroporto Internacional de Brasília',
    'SSA': 'Aeroporto Internacional de Salvador',
    'REC': 'Aeroporto Internacional do Recife',
    'FOR': 'Aeroporto Internacional de Fortaleza'
  };
  return airports[iataCode] || `Aeroporto ${iataCode}`;
}

function getCityName(iataCode: string): string {
  const cities: Record<string, string> = {
    'GRU': 'São Paulo',
    'CGH': 'São Paulo',
    'GIG': 'Rio de Janeiro',
    'SDU': 'Rio de Janeiro',
    'BSB': 'Brasília',
    'SSA': 'Salvador',
    'REC': 'Recife',
    'FOR': 'Fortaleza'
  };
  return cities[iataCode] || iataCode;
}

function getCountryName(iataCode: string): string {
  // For demo purposes, assume all are Brazil
  return 'Brasil';
}

function getArrivalTime(departureTime: string, durationMinutes: number): string {
  const [hours, minutes] = departureTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const arrivalHours = Math.floor(totalMinutes / 60) % 24;
  const arrivalMinutes = totalMinutes % 60;
  return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}:00`;
}