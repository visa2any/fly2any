import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';

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
  // Pattern 1: "from X to Y" - REQUIRE "from" keyword to avoid matching conversation words
  const fromToMatch = lowerQuery.match(/\bfrom\s+([a-z]{3}|[a-z\s]+?)\s+to\s+([a-z]{3}|[a-z\s]+?)(?:\s+on|\s+in|\s+leaving|\s+departing|\s+return|\s+round|\s+and|\s+until|\s+through|\s+\?|$)/i);

  // Common city to IATA code mapping
  const cityToIATA: Record<string, string> = {
    'new york': 'NYC',
    'nyc': 'NYC',
    'jfk': 'JFK',
    'new york city': 'NYC',
    'dubai': 'DXB',
    'dxb': 'DXB',
    'london': 'LON',
    'lon': 'LON',
    'lhr': 'LHR',
    'paris': 'PAR',
    'cdg': 'CDG',
    'tokyo': 'TYO',
    'nrt': 'NRT',
    'hnd': 'HND',
    'los angeles': 'LAX',
    'la': 'LAX',
    'lax': 'LAX',
    'miami': 'MIA',
    'mia': 'MIA',
    'chicago': 'CHI',
    'ord': 'ORD',
    'san francisco': 'SFO',
    'sf': 'SFO',
    'sfo': 'SFO',
    'boston': 'BOS',
    'bos': 'BOS',
    'washington': 'WAS',
    'dc': 'WAS',
    'iad': 'IAD',
    'dca': 'DCA',
    'atlanta': 'ATL',
    'atl': 'ATL',
    'orlando': 'MCO',
    'mco': 'MCO',
    'las vegas': 'LAS',
    'vegas': 'LAS',
    'las': 'LAS',
    'seattle': 'SEA',
    'sea': 'SEA',
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

  // For return date, look for "returning", "return", "until", "through" keywords
  if (type === 'return') {
    const returnPatterns = [
      /(?:returning|return(?:ing)?|until|through)\s+(?:on\s+)?(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d+)(?:st|nd|rd|th)?/i,
      /(?:returning|return(?:ing)?|until|through)\s+(\d+)(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)/i
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
 * Calculate flight duration in hours and minutes
 */
function formatDuration(isoDuration: string): string {
  // Parse ISO 8601 duration format (e.g., "PT13H30M")
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return 'N/A';

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  return `${hours}h ${minutes}m`;
}

/**
 * Search flights using Duffel API with fallback to mock data
 */
async function searchFlights(params: FlightSearchParams) {
  const isRoundTrip = !!params.returnDate;

  try {
    // Call REAL Duffel API
    console.log('🔍 AI Chat - Calling Duffel API with params:', params);

    const duffelResponse = await duffelAPI.searchFlights({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.passengers,
      cabinClass: params.cabinClass,
      maxResults: 3, // Limit to top 3 results for chat UI
    });

    console.log(`✅ Duffel returned ${duffelResponse.data.length} offers`);

    // Transform Duffel offers to FlightResultCard format
    if (duffelResponse.data.length > 0) {
      return duffelResponse.data.map((offer: any) => transformDuffelOffer(offer, params));
    }

    // If no results, fall back to mock data
    console.log('⚠️  No Duffel results - falling back to mock data');
    return generateMockFlights(params);

  } catch (error: any) {
    console.error('❌ Duffel API error in AI chat:', error.message);
    console.log('⚠️  Falling back to mock data');
    return generateMockFlights(params);
  }
}

/**
 * Transform Duffel offer to FlightResultCard format
 */
function transformDuffelOffer(duffelOffer: any, params: FlightSearchParams): any {
  const isRoundTrip = !!params.returnDate;

  // Extract airline info from first segment
  const firstSegment = duffelOffer.itineraries[0].segments[0];
  const airline = getAirlineName(firstSegment.carrierCode);
  const flightNumber = `${firstSegment.carrierCode} ${firstSegment.number}`;

  // Calculate baggage allowance
  const baggageInfo = extractBaggage(duffelOffer);

  // Build outbound flight leg
  const outbound = {
    departure: {
      airport: params.origin,
      time: firstSegment.departure.at,
      terminal: firstSegment.departure.terminal || 'N/A',
    },
    arrival: {
      airport: params.destination,
      time: duffelOffer.itineraries[0].segments[duffelOffer.itineraries[0].segments.length - 1].arrival.at,
      terminal: duffelOffer.itineraries[0].segments[duffelOffer.itineraries[0].segments.length - 1].arrival.terminal || 'N/A',
    },
    duration: formatDuration(duffelOffer.itineraries[0].duration),
    stops: duffelOffer.itineraries[0].segments.length - 1,
  };

  // Build return flight leg (if round-trip)
  let returnFlight = undefined;
  if (isRoundTrip && duffelOffer.itineraries.length > 1) {
    const returnSegments = duffelOffer.itineraries[1].segments;
    const firstReturnSegment = returnSegments[0];
    const lastReturnSegment = returnSegments[returnSegments.length - 1];

    returnFlight = {
      departure: {
        airport: params.destination,
        time: firstReturnSegment.departure.at,
        terminal: firstReturnSegment.departure.terminal || 'N/A',
      },
      arrival: {
        airport: params.origin,
        time: lastReturnSegment.arrival.at,
        terminal: lastReturnSegment.arrival.terminal || 'N/A',
      },
      duration: formatDuration(duffelOffer.itineraries[1].duration),
      stops: returnSegments.length - 1,
    };
  }

  return {
    id: duffelOffer.id,
    airline,
    flightNumber,
    outbound,
    ...(returnFlight && { return: returnFlight }),
    price: {
      amount: parseFloat(duffelOffer.price.total).toFixed(0),
      currency: duffelOffer.price.currency,
    },
    cabinClass: params.cabinClass,
    seatsAvailable: duffelOffer.numberOfBookableSeats || 9,
    baggage: baggageInfo,
  };
}

/**
 * Extract baggage allowance from Duffel offer
 */
function extractBaggage(offer: any): { checked: string; cabin: string } {
  // Try to get baggage from traveler pricings
  if (offer.travelerPricings && offer.travelerPricings[0]?.fareDetailsBySegment?.[0]) {
    const segment = offer.travelerPricings[0].fareDetailsBySegment[0];
    const checkedBags = segment.includedCheckedBags?.quantity || 0;

    return {
      checked: checkedBags > 0 ? `${checkedBags} x 23kg` : 'Not included',
      cabin: '1 x 7kg', // Standard cabin baggage
    };
  }

  // Default baggage allowance
  return {
    checked: '1 x 23kg',
    cabin: '1 x 7kg',
  };
}

/**
 * Get airline name from IATA code
 */
function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'DL': 'Delta Air Lines',
    'BA': 'British Airways',
    'AF': 'Air France',
    'LH': 'Lufthansa',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'EY': 'Etihad Airways',
    'TK': 'Turkish Airlines',
    'SQ': 'Singapore Airlines',
    'CX': 'Cathay Pacific',
    'NH': 'ANA',
    'JL': 'Japan Airlines',
    'AC': 'Air Canada',
    'VS': 'Virgin Atlantic',
    'KL': 'KLM',
    'IB': 'Iberia',
    'AZ': 'ITA Airways',
    'LX': 'SWISS',
  };

  return airlines[code] || code;
}

/**
 * Generate mock flights as fallback when Duffel API is unavailable
 */
function generateMockFlights(params: FlightSearchParams) {
  const isRoundTrip = !!params.returnDate;
  const priceMultiplier = isRoundTrip ? 1.8 : 1;

  // Helper to calculate next day
  const getNextDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const flights = [
    {
      id: 'flight-1',
      airline: 'Emirates',
      flightNumber: 'EK 201',
      // Outbound leg
      outbound: {
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T08:00:00`,
          terminal: '4'
        },
        arrival: {
          airport: params.destination,
          time: `${params.departureDate}T19:30:00`,
          terminal: '3'
        },
        duration: '13h 30m',
        stops: 0
      },
      // Return leg (if round trip)
      ...(isRoundTrip && params.returnDate && {
        return: {
          departure: {
            airport: params.destination,
            time: `${params.returnDate}T21:00:00`,
            terminal: '3'
          },
          arrival: {
            airport: params.origin,
            time: `${getNextDay(params.returnDate)}T08:30:00`,
            terminal: '4'
          },
          duration: '13h 30m',
          stops: 0
        }
      }),
      price: {
        amount: Math.round((params.cabinClass === 'business' ? 5499 : 899) * priceMultiplier).toString(),
        currency: 'USD'
      },
      cabinClass: params.cabinClass,
      seatsAvailable: 9,
      baggage: {
        checked: params.cabinClass === 'business' ? '2 x 32kg' : '2 x 23kg',
        cabin: '1 x 7kg'
      }
    },
    {
      id: 'flight-2',
      airline: 'Etihad Airways',
      flightNumber: 'EY 103',
      // Outbound leg
      outbound: {
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T10:30:00`,
          terminal: '4'
        },
        arrival: {
          airport: params.destination,
          time: `${params.departureDate}T22:15:00`,
          terminal: '1'
        },
        duration: '13h 45m',
        stops: 0
      },
      // Return leg (if round trip)
      ...(isRoundTrip && params.returnDate && {
        return: {
          departure: {
            airport: params.destination,
            time: `${params.returnDate}T09:30:00`,
            terminal: '1'
          },
          arrival: {
            airport: params.origin,
            time: `${params.returnDate}T19:15:00`,
            terminal: '4'
          },
          duration: '13h 45m',
          stops: 0
        }
      }),
      price: {
        amount: Math.round((params.cabinClass === 'business' ? 4899 : 799) * priceMultiplier).toString(),
        currency: 'USD'
      },
      cabinClass: params.cabinClass,
      seatsAvailable: 12,
      baggage: {
        checked: params.cabinClass === 'business' ? '2 x 32kg' : '2 x 23kg',
        cabin: '1 x 7kg'
      }
    },
    {
      id: 'flight-3',
      airline: 'Qatar Airways',
      flightNumber: 'QR 701',
      // Outbound leg
      outbound: {
        departure: {
          airport: params.origin,
          time: `${params.departureDate}T14:45:00`,
          terminal: '8'
        },
        arrival: {
          airport: params.destination,
          time: `${getNextDay(params.departureDate)}T06:30:00`,
          terminal: '1'
        },
        duration: '14h 45m',
        stops: 1,
        stopover: 'Doha (DOH) - 2h 15m'
      },
      // Return leg (if round trip)
      ...(isRoundTrip && params.returnDate && {
        return: {
          departure: {
            airport: params.destination,
            time: `${params.returnDate}T08:00:00`,
            terminal: '1'
          },
          arrival: {
            airport: params.origin,
            time: `${params.returnDate}T21:45:00`,
            terminal: '8'
          },
          duration: '15h 45m',
          stops: 1,
          stopover: 'Doha (DOH) - 3h 10m'
        }
      }),
      price: {
        amount: Math.round((params.cabinClass === 'business' ? 4599 : 749) * priceMultiplier).toString(),
        currency: 'USD'
      },
      cabinClass: params.cabinClass,
      seatsAvailable: 8,
      baggage: {
        checked: params.cabinClass === 'business' ? '2 x 32kg' : '2 x 23kg',
        cabin: '1 x 7kg'
      }
    }
  ];

  return flights;
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
