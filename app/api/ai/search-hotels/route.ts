import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Assistant Hotel Search API
 *
 * Parses natural language queries and returns hotel results
 * Example: "i need a hotel in Orlando from Nov 20 to 25th for 2"
 */

interface HotelSearchParams {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language = 'en' } = body;

    // Parse natural language query
    const searchParams = parseHotelQuery(query);

    if (!searchParams) {
      return NextResponse.json({
        success: false,
        error: 'Could not understand your hotel request',
        suggestion: 'Please specify: city, check-in date, check-out date, and number of guests'
      }, { status: 400 });
    }

    // Search hotels using existing API
    const hotels = await searchHotels(searchParams);

    return NextResponse.json({
      success: true,
      searchParams,
      hotels,
      count: hotels.length,
      message: generateHotelSearchSummary(searchParams, hotels.length, language)
    });

  } catch (error: any) {
    console.error('AI Hotel Search Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search hotels',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Parse natural language hotel queries
 * Examples:
 * - "i need a hotel in Orlando from Nov 20 to 25th for 2"
 * - "hotel in Miami for 3 people, checking in Dec 15, checking out Dec 20"
 * - "find me accommodation in New York from January 10 to January 15 for 2 guests"
 */
function parseHotelQuery(query: string): HotelSearchParams | null {
  const lowerQuery = query.toLowerCase();

  // Extract city name
  // Patterns: "hotel in X", "accommodation in X", "stay in X", "in X from"
  const cityPatterns = [
    /(?:hotel|accommodation|room|stay|place)(?:\s+in)?\s+([a-z\s]+?)(?:\s+from|\s+for|\s+check)/i,
    /in\s+([a-z\s]+?)(?:\s+from|\s+for|\s+check)/i
  ];

  let city = '';
  for (const pattern of cityPatterns) {
    const match = lowerQuery.match(pattern);
    if (match && match[1]) {
      city = match[1].trim();
      break;
    }
  }

  // Extract check-in and check-out dates
  const checkIn = extractDate(lowerQuery, 'checkin');
  const checkOut = extractDate(lowerQuery, 'checkout');

  // Extract number of guests
  // Patterns: "for 2", "2 people", "2 guests", "2 adults"
  const guestPatterns = [
    /for\s+(\d+)(?:\s+(?:people|guests|adults|persons?))?/i,
    /(\d+)\s+(?:people|guests|adults|persons)/i
  ];

  let guests = 1;
  for (const pattern of guestPatterns) {
    const match = lowerQuery.match(pattern);
    if (match && match[1]) {
      guests = parseInt(match[1]);
      break;
    }
  }

  // Extract rooms if specified
  const roomsMatch = lowerQuery.match(/(\d+)\s+rooms?/i);
  const rooms = roomsMatch ? parseInt(roomsMatch[1]) : Math.ceil(guests / 2);

  // Validate required fields
  if (!city || !checkIn || !checkOut) {
    return null;
  }

  return {
    city,
    checkIn,
    checkOut,
    guests,
    rooms
  };
}

/**
 * Extract date from natural language for hotels
 * Handles: "from Nov 20", "checking in December 15", "to Jan 5", "checkout Jan 10"
 */
function extractDate(query: string, type: 'checkin' | 'checkout'): string {
  const now = new Date();

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

  if (type === 'checkin') {
    // Patterns: "from Nov 20", "checking in Dec 15", "check in December 15th"
    const checkinPatterns = [
      /(?:from|checking in|check.?in)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d+)(?:st|nd|rd|th)?/i,
      /(\d+)(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)/i
    ];

    for (const pattern of checkinPatterns) {
      const match = query.match(pattern);
      if (match) {
        let monthName, day;

        if (months[match[1]?.toLowerCase()] !== undefined) {
          monthName = match[1].toLowerCase();
          day = parseInt(match[2]);
        } else {
          monthName = match[2]?.toLowerCase();
          day = parseInt(match[1]);
        }

        const month = months[monthName];
        if (month !== undefined) {
          let year = now.getFullYear();
          let date = new Date(year, month, day);

          if (date < now) {
            year++;
            date = new Date(year, month, day);
          }

          return date.toISOString().split('T')[0];
        }
      }
    }
  }

  if (type === 'checkout') {
    // Patterns: "to Nov 25", "checking out Dec 20", "check out January 5th", "until Dec 31"
    const checkoutPatterns = [
      /(?:to|checking out|check.?out|until)\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\s+(\d+)(?:st|nd|rd|th)?/i,
      /(?:to|until)\s+(\d+)(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)/i
    ];

    for (const pattern of checkoutPatterns) {
      const match = query.match(pattern);
      if (match) {
        let monthName, day;

        if (months[match[1]?.toLowerCase()] !== undefined) {
          monthName = match[1].toLowerCase();
          day = parseInt(match[2]);
        } else {
          monthName = match[2]?.toLowerCase();
          day = parseInt(match[1]);
        }

        const month = months[monthName];
        if (month !== undefined) {
          let year = now.getFullYear();
          let date = new Date(year, month, day);

          if (date < now) {
            year++;
            date = new Date(year, month, day);
          }

          return date.toISOString().split('T')[0];
        }
      }
    }
  }

  return '';
}

/**
 * Search hotels (mock implementation - replace with actual API call)
 */
async function searchHotels(params: HotelSearchParams) {
  // TODO: Integrate with actual hotel API
  // For now, return mock data

  const nightsCount = Math.ceil(
    (new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  const pricePerNight = params.city.toLowerCase().includes('orlando') ? 120 :
                        params.city.toLowerCase().includes('miami') ? 180 :
                        params.city.toLowerCase().includes('new york') ? 250 : 150;

  const hotels = [
    {
      id: 'hotel-1',
      name: `Hilton ${params.city}`,
      rating: 4.5,
      address: `Downtown ${params.city}`,
      pricePerNight: pricePerNight,
      totalPrice: pricePerNight * nightsCount * (params.rooms || 1),
      currency: 'USD',
      amenities: ['Free WiFi', 'Pool', 'Gym', 'Restaurant', 'Parking'],
      distance: '0.5 miles from center',
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: params.guests,
      rooms: params.rooms || 1,
      availability: 'Available'
    },
    {
      id: 'hotel-2',
      name: `Marriott ${params.city}`,
      rating: 4.3,
      address: `${params.city} City Center`,
      pricePerNight: pricePerNight - 20,
      totalPrice: (pricePerNight - 20) * nightsCount * (params.rooms || 1),
      currency: 'USD',
      amenities: ['Free WiFi', 'Pool', 'Business Center'],
      distance: '0.8 miles from center',
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: params.guests,
      rooms: params.rooms || 1,
      availability: 'Available'
    },
    {
      id: 'hotel-3',
      name: `Hyatt Place ${params.city}`,
      rating: 4.2,
      address: `${params.city} Airport Area`,
      pricePerNight: pricePerNight - 40,
      totalPrice: (pricePerNight - 40) * nightsCount * (params.rooms || 1),
      currency: 'USD',
      amenities: ['Free WiFi', 'Breakfast', 'Airport Shuttle'],
      distance: '5 miles from center',
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: params.guests,
      rooms: params.rooms || 1,
      availability: 'Available'
    }
  ];

  return hotels;
}

/**
 * Generate search summary message
 */
function generateHotelSearchSummary(
  params: HotelSearchParams,
  count: number,
  language: string
): string {
  const nights = Math.ceil(
    (new Date(params.checkOut).getTime() - new Date(params.checkIn).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  if (language === 'en') {
    return `I found ${count} hotels in ${params.city} for ${params.guests} guest${params.guests > 1 ? 's' : ''} ` +
           `(${nights} night${nights > 1 ? 's' : ''}) from ${params.checkIn} to ${params.checkOut}. ` +
           `Here are the best options:`;
  } else if (language === 'pt') {
    return `Encontrei ${count} hotéis em ${params.city} para ${params.guests} hóspede${params.guests > 1 ? 's' : ''} ` +
           `(${nights} noite${nights > 1 ? 's' : ''}) de ${params.checkIn} até ${params.checkOut}. ` +
           `Aqui estão as melhores opções:`;
  } else {
    return `Encontré ${count} hoteles en ${params.city} para ${params.guests} huésped${params.guests > 1 ? 'es' : ''} ` +
           `(${nights} noche${nights > 1 ? 's' : ''}) del ${params.checkIn} al ${params.checkOut}. ` +
           `Aquí están las mejores opciones:`;
  }
}
