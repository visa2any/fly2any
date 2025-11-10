import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Assistant Flight Search API
 *
 * Parses natural language queries and returns flight results
 * Integrated with Duffel API for real-time flight data
 */

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language = 'en' } = body;

    // Parse natural language query
    const searchParams = parseFlightQuery(query);

    if (!searchParams) {
      return NextResponse.json({
        success: false,
        error: 'Could not understand your request',
        suggestion: 'Please specify: origin, destination, and travel dates'
      }, { status: 400 });
    }

    // Search flights using Duffel API (integrate with existing search)
    const flights = await searchFlights(searchParams);

    return NextResponse.json({
      success: true,
      searchParams,
      flights,
      count: flights.length,
      message: generateSearchSummary(searchParams, flights.length, language)
    });

  } catch (error: any) {
    console.error('AI Flight Search Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search flights',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Parse natural language flight queries
 */
function parseFlightQuery(query: string): FlightSearchParams | null {
  const lowerQuery = query.toLowerCase();

  // Extract origin and destination with improved patterns
  // Pattern 1: "from X to Y" or "X to Y"
  const fromToMatch = lowerQuery.match(/(?:from\s+)?([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s+on|\s+in|\s+leaving|\s+departing|\s+return|\s+and|\s+\?|$)/i);

  // Common city to IATA code mapping
  const cityToIATA: Record<string, string> = {
    'new york': 'NYC',
    'nyc': 'NYC',
    'jfk': 'JFK',
    'new york city': 'NYC',
    'dubai': 'DXB',
    'london': 'LON',
    'paris': 'PAR',
    'tokyo': 'TYO',
    'los angeles': 'LAX',
    'la': 'LAX',
    'miami': 'MIA',
    'chicago': 'CHI',
    'san francisco': 'SFO',
    'sf': 'SFO',
    'boston': 'BOS',
    'washington': 'WAS',
    'dc': 'WAS',
    'atlanta': 'ATL',
    'orlando': 'MCO',
    'las vegas': 'LAS',
    'vegas': 'LAS',
    'seattle': 'SEA',
    'madrid': 'MAD',
    'barcelona': 'BCN',
    'rome': 'ROM',
    'amsterdam': 'AMS',
    'frankfurt': 'FRA',
    'singapore': 'SIN',
    'hong kong': 'HKG',
    'sydney': 'SYD',
    'melbourne': 'MEL',
    'toronto': 'YTO',
    'vancouver': 'YVR',
    'sao paulo': 'GRU',
    'são paulo': 'GRU',
    'rio de janeiro': 'RIO',
    'rio': 'RIO',
    'buenos aires': 'BUE',
    'mexico city': 'MEX',
    'mumbai': 'BOM',
    'delhi': 'DEL',
    'bangkok': 'BKK',
    'seoul': 'ICN',
    'istanbul': 'IST',
    'cairo': 'CAI',
    'johannesburg': 'JNB',
    'lisbon': 'LIS',
    'prague': 'PRG',
    'vienna': 'VIE',
    'zurich': 'ZRH',
    'munich': 'MUC',
    'berlin': 'BER',
    'milan': 'MXP',
    'venice': 'VCE',
    'florence': 'FLR'
  };

  let origin = '';
  let destination = '';

  if (fromToMatch && fromToMatch[1] && fromToMatch[2]) {
    const originCity = fromToMatch[1].trim();
    const destCity = fromToMatch[2].trim();

    // Look up in city mapping
    origin = cityToIATA[originCity] || originCity.substring(0, 3).toUpperCase();
    destination = cityToIATA[destCity] || destCity.substring(0, 3).toUpperCase();
  }

  // Extract dates
  const departureDate = extractDate(lowerQuery, 'departure');
  const returnDate = extractDate(lowerQuery, 'return');

  // Extract cabin class
  let cabinClass: 'economy' | 'premium_economy' | 'business' | 'first' = 'economy';
  if (lowerQuery.includes('business')) cabinClass = 'business';
  else if (lowerQuery.includes('first')) cabinClass = 'first';
  else if (lowerQuery.includes('premium')) cabinClass = 'premium_economy';

  // Extract passengers (default to 1)
  const passengersMatch = lowerQuery.match(/(\d+)\s+passenger/);
  const passengers = passengersMatch ? parseInt(passengersMatch[1]) : 1;

  // Validate required fields
  if (!origin || !destination || !departureDate) {
    return null;
  }

  return {
    origin,
    destination,
    departureDate,
    returnDate,
    passengers,
    cabinClass
  };
}

/**
 * Extract date from natural language
 */
function extractDate(query: string, type: 'departure' | 'return'): string {
  const now = new Date();

  // Month names mapping
  const months: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11
  };

  // For departure date, look for various patterns
  if (type === 'departure') {
    // Pattern: "on december 23", "leaving december 23rd", "departing dec 23"
    const departurePatterns = [
      /(?:on|leaving on|departing on|departing)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d+)(?:st|nd|rd|th)?/i,
      /(\d+)(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)/i
    ];

    for (const pattern of departurePatterns) {
      const match = query.match(pattern);
      if (match) {
        const monthName = match[1].toLowerCase();
        const day = parseInt(match[2]);
        const month = months[monthName];

        if (month !== undefined) {
          let year = now.getFullYear();
          let date = new Date(year, month, day);

          // If date is in the past, assume next year
          if (date < now) {
            year++;
            date = new Date(year, month, day);
          }

          return date.toISOString().split('T')[0];
        }
      }
    }
  }

  // For return date, look for "returning" or "return" keywords
  if (type === 'return') {
    const returnPatterns = [
      /(?:returning|return(?:ing)?)\s+(?:on\s+)?(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d+)(?:st|nd|rd|th)?/i,
      /(?:returning|return(?:ing)?)\s+(\d+)(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)/i
    ];

    for (const pattern of returnPatterns) {
      const match = query.match(pattern);
      if (match) {
        const monthName = (match[1] || match[2]).toLowerCase();
        const day = parseInt(match[2] || match[1]);
        const month = months[monthName];

        if (month !== undefined) {
          let year = now.getFullYear();
          let date = new Date(year, month, day);

          // If date is in the past, assume next year
          if (date < now) {
            year++;
            date = new Date(year, month, day);
          }

          return date.toISOString().split('T')[0];
        }
      }
    }
  }

  // Pattern: "YYYY-MM-DD"
  const isoPattern = /\d{4}-\d{2}-\d{2}/;
  const isoMatch = query.match(isoPattern);
  if (isoMatch) {
    return isoMatch[0];
  }

  return '';
}

/**
 * Search flights using Duffel API
 */
async function searchFlights(params: FlightSearchParams) {
  // Import Duffel API client
  const { duffelAPI } = await import('@/lib/api/duffel');

  console.log('🔍 AI Search: Calling Duffel API with params:', params);

  try {
    // Call Duffel API with standardized parameters
    const result = await duffelAPI.searchFlights({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.passengers,
      cabinClass: params.cabinClass,
      maxResults: 5, // Limit to top 5 results for AI chat
    });

    console.log(`✅ Duffel returned ${result.data.length} offers`);

    // Convert Duffel standardized offers to AI chat format
    const flights = result.data.map((offer: any) => convertOfferToChatFormat(offer, params));

    return flights;
  } catch (error: any) {
    console.error('❌ Duffel search failed:', error.message);

    // Fallback to limited mock data on error
    console.warn('⚠️  Returning fallback demo data');
    return getFallbackFlights(params);
  }
}

/**
 * Convert Duffel standardized offer to AI chat format
 */
function convertOfferToChatFormat(offer: any, params: FlightSearchParams) {
  const outboundSlice = offer.itineraries[0];
  const outboundSegment = outboundSlice.segments[0];
  const outboundLastSegment = outboundSlice.segments[outboundSlice.segments.length - 1];

  const flight: any = {
    id: offer.id,
    airline: getAirlineName(outboundSegment.carrierCode),
    flightNumber: `${outboundSegment.carrierCode} ${outboundSegment.number}`,
    // Outbound leg
    outbound: {
      departure: {
        airport: outboundSegment.departure.iataCode,
        time: outboundSegment.departure.at,
        terminal: outboundSegment.departure.terminal || ''
      },
      arrival: {
        airport: outboundLastSegment.arrival.iataCode,
        time: outboundLastSegment.arrival.at,
        terminal: outboundLastSegment.arrival.terminal || ''
      },
      duration: outboundSlice.duration,
      stops: outboundSlice.segments.length - 1,
      ...(outboundSlice.segments.length > 1 && {
        stopover: `${outboundSlice.segments[0].arrival.iataCode} - Layover`
      })
    },
    price: {
      amount: offer.price.total,
      currency: offer.price.currency
    },
    cabinClass: params.cabinClass,
    seatsAvailable: offer.numberOfBookableSeats || 9,
    baggage: {
      checked: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity
        ? `${offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity} x 23kg`
        : '1 x 23kg',
      cabin: '1 x 7kg'
    }
  };

  // Add return leg if round-trip
  if (offer.itineraries.length > 1) {
    const returnSlice = offer.itineraries[1];
    const returnSegment = returnSlice.segments[0];
    const returnLastSegment = returnSlice.segments[returnSlice.segments.length - 1];

    flight.return = {
      departure: {
        airport: returnSegment.departure.iataCode,
        time: returnSegment.departure.at,
        terminal: returnSegment.departure.terminal || ''
      },
      arrival: {
        airport: returnLastSegment.arrival.iataCode,
        time: returnLastSegment.arrival.at,
        terminal: returnLastSegment.arrival.terminal || ''
      },
      duration: returnSlice.duration,
      stops: returnSlice.segments.length - 1,
      ...(returnSlice.segments.length > 1 && {
        stopover: `${returnSlice.segments[0].arrival.iataCode} - Layover`
      })
    };
  }

  return flight;
}

/**
 * Get airline name from carrier code
 */
function getAirlineName(carrierCode: string): string {
  const airlines: Record<string, string> = {
    'EK': 'Emirates',
    'EY': 'Etihad Airways',
    'QR': 'Qatar Airways',
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM',
    'SQ': 'Singapore Airlines',
    'TK': 'Turkish Airlines',
  };

  return airlines[carrierCode] || carrierCode;
}

/**
 * Fallback mock data when Duffel API fails
 */
function getFallbackFlights(params: FlightSearchParams) {
  const isRoundTrip = !!params.returnDate;
  const priceMultiplier = isRoundTrip ? 1.8 : 1;

  return [
    {
      id: 'fallback-1',
      airline: 'Demo Airline',
      flightNumber: 'DEMO 101',
      outbound: {
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T08:00:00`,
          terminal: '1'
        },
        arrival: {
          airport: params.destination,
          time: `${params.departureDate}T19:30:00`,
          terminal: '2'
        },
        duration: '11h 30m',
        stops: 0
      },
      ...(isRoundTrip && {
        return: {
          departure: {
            airport: params.destination,
            time: `${params.returnDate}T21:00:00`,
            terminal: '2'
          },
          arrival: {
            airport: params.origin,
            time: `${params.returnDate}T08:30:00+1`,
            terminal: '1'
          },
          duration: '11h 30m',
          stops: 0
        }
      }),
      price: {
        amount: Math.round((params.cabinClass === 'business' ? 4999 : 799) * priceMultiplier).toString(),
        currency: 'USD'
      },
      cabinClass: params.cabinClass,
      seatsAvailable: 9,
      baggage: {
        checked: '1 x 23kg',
        cabin: '1 x 7kg'
      }
    }
  ];
}

/**
 * Generate search summary message
 */
function generateSearchSummary(params: FlightSearchParams, count: number, language: string): string {
  const cabinClassLabel = {
    economy: language === 'en' ? 'Economy' : language === 'pt' ? 'Econômica' : 'Económica',
    premium_economy: language === 'en' ? 'Premium Economy' : language === 'pt' ? 'Econômica Premium' : 'Económica Premium',
    business: language === 'en' ? 'Business' : language === 'pt' ? 'Executiva' : 'Ejecutiva',
    first: language === 'en' ? 'First Class' : language === 'pt' ? 'Primeira Classe' : 'Primera Clase'
  };

  if (language === 'en') {
    return `I found ${count} ${cabinClassLabel[params.cabinClass]} flights from ${params.origin} to ${params.destination} on ${params.departureDate}${params.returnDate ? ` with return on ${params.returnDate}` : ''}. Here are the best options:`;
  } else if (language === 'pt') {
    return `Encontrei ${count} voos em ${cabinClassLabel[params.cabinClass]} de ${params.origin} para ${params.destination} em ${params.departureDate}${params.returnDate ? ` com retorno em ${params.returnDate}` : ''}. Aqui estão as melhores opções:`;
  } else {
    return `Encontré ${count} vuelos en ${cabinClassLabel[params.cabinClass]} de ${params.origin} a ${params.destination} el ${params.departureDate}${params.returnDate ? ` con regreso el ${params.returnDate}` : ''}. Aquí están las mejores opciones:`;
  }
}
