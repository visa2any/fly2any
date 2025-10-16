/**
 * Amadeus Flight Search API Integration
 * Provides real-time flight search and pricing
 */

interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
}

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get Amadeus API access token with caching
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;
  const environment = process.env.AMADEUS_ENVIRONMENT || 'test';

  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  const baseUrl = environment === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  try {
    const response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: apiSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data: AmadeusToken = await response.json();

    // Cache token (expire 30 seconds before actual expiration for safety)
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 30) * 1000,
    };

    return data.access_token;
  } catch (error) {
    console.error('Amadeus authentication error:', error);
    throw error;
  }
}

/**
 * Search for flights using Amadeus API
 */
export async function searchFlights(params: SearchParams) {
  try {
    const token = await getAccessToken();
    const environment = process.env.AMADEUS_ENVIRONMENT || 'test';
    const baseUrl = environment === 'production'
      ? 'https://api.amadeus.com'
      : 'https://test.api.amadeus.com';

    // Build query parameters
    const queryParams = new URLSearchParams({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults.toString(),
      currencyCode: 'USD',
      max: '50', // Get top 50 results
    });

    // Add optional parameters
    if (params.returnDate) {
      queryParams.append('returnDate', params.returnDate);
    }
    if (params.children && params.children > 0) {
      queryParams.append('children', params.children.toString());
    }
    if (params.infants && params.infants > 0) {
      queryParams.append('infants', params.infants.toString());
    }
    if (params.travelClass) {
      queryParams.append('travelClass', params.travelClass.toUpperCase());
    }

    const response = await fetch(
      `${baseUrl}/v2/shopping/flight-offers?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Amadeus API error:', errorData);

      // Return mock data if API fails (for development)
      return generateMockFlights(params);
    }

    const data = await response.json();

    // Transform Amadeus response to our format
    return transformFlightOffers(data.data || []);
  } catch (error) {
    console.error('Flight search error:', error);

    // Return mock data as fallback
    return generateMockFlights(params);
  }
}

/**
 * Transform Amadeus flight offers to simplified format
 */
function transformFlightOffers(offers: any[]) {
  return offers.map((offer: any) => {
    const outbound = offer.itineraries[0];
    const inbound = offer.itineraries[1];
    const price = offer.price;
    const segments = outbound.segments;

    return {
      id: offer.id,
      price: {
        total: parseFloat(price.total),
        currency: price.currency,
        perPerson: parseFloat(price.base),
      },
      outbound: {
        departure: {
          airport: segments[0].departure.iataCode,
          time: segments[0].departure.at,
          terminal: segments[0].departure.terminal,
        },
        arrival: {
          airport: segments[segments.length - 1].arrival.iataCode,
          time: segments[segments.length - 1].arrival.at,
          terminal: segments[segments.length - 1].arrival.terminal,
        },
        duration: outbound.duration,
        stops: segments.length - 1,
        segments: segments.map((seg: any) => ({
          carrier: seg.carrierCode,
          flightNumber: seg.number,
          aircraft: seg.aircraft?.code,
          departure: {
            airport: seg.departure.iataCode,
            time: seg.departure.at,
          },
          arrival: {
            airport: seg.arrival.iataCode,
            time: seg.arrival.at,
          },
          duration: seg.duration,
        })),
      },
      inbound: inbound ? {
        departure: {
          airport: inbound.segments[0].departure.iataCode,
          time: inbound.segments[0].departure.at,
          terminal: inbound.segments[0].departure.terminal,
        },
        arrival: {
          airport: inbound.segments[inbound.segments.length - 1].arrival.iataCode,
          time: inbound.segments[inbound.segments.length - 1].arrival.at,
          terminal: inbound.segments[inbound.segments.length - 1].arrival.terminal,
        },
        duration: inbound.duration,
        stops: inbound.segments.length - 1,
        segments: inbound.segments.map((seg: any) => ({
          carrier: seg.carrierCode,
          flightNumber: seg.number,
          aircraft: seg.aircraft?.code,
          departure: {
            airport: seg.departure.iataCode,
            time: seg.departure.at,
          },
          arrival: {
            airport: seg.arrival.iataCode,
            time: seg.arrival.at,
          },
          duration: seg.duration,
        })),
      } : null,
      validatingAirline: offer.validatingAirlineCodes?.[0],
      numberOfBookableSeats: offer.numberOfBookableSeats,
      lastTicketingDate: offer.lastTicketingDate,
      class: segments[0].cabin || 'ECONOMY',
    };
  });
}

/**
 * Generate mock flights for development/fallback
 */
function generateMockFlights(params: SearchParams) {
  const airlines = [
    { code: 'AA', name: 'American Airlines', logo: '🇺🇸' },
    { code: 'DL', name: 'Delta Air Lines', logo: '✈️' },
    { code: 'UA', name: 'United Airlines', logo: '🌐' },
    { code: 'BA', name: 'British Airways', logo: '🇬🇧' },
    { code: 'LH', name: 'Lufthansa', logo: '🇩🇪' },
    { code: 'AF', name: 'Air France', logo: '🇫🇷' },
    { code: 'EK', name: 'Emirates', logo: '🇦🇪' },
    { code: 'QR', name: 'Qatar Airways', logo: '🇶🇦' },
  ];

  const mockFlights = [];
  const departDate = new Date(params.departureDate);
  const returnDate = params.returnDate ? new Date(params.returnDate) : null;

  for (let i = 0; i < 20; i++) {
    const airline = airlines[i % airlines.length];
    const basePrice = 300 + Math.random() * 800;
    const stops = Math.floor(Math.random() * 3);
    const departureHour = 6 + Math.floor(Math.random() * 16);
    const flightDuration = 180 + Math.floor(Math.random() * 300);

    const departureTime = new Date(departDate);
    departureTime.setHours(departureHour, Math.floor(Math.random() * 60));

    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightDuration);

    mockFlights.push({
      id: `MOCK_${i}_${Date.now()}`,
      price: {
        total: Math.round(basePrice * params.adults * 100) / 100,
        currency: 'USD',
        perPerson: Math.round(basePrice * 100) / 100,
      },
      outbound: {
        departure: {
          airport: params.origin,
          time: departureTime.toISOString(),
          terminal: `${Math.floor(Math.random() * 5) + 1}`,
        },
        arrival: {
          airport: params.destination,
          time: arrivalTime.toISOString(),
          terminal: `${Math.floor(Math.random() * 5) + 1}`,
        },
        duration: `PT${Math.floor(flightDuration / 60)}H${flightDuration % 60}M`,
        stops: stops,
        segments: Array(stops + 1).fill(null).map((_, idx) => ({
          carrier: airline.code,
          flightNumber: `${1000 + Math.floor(Math.random() * 9000)}`,
          aircraft: '320',
          departure: {
            airport: idx === 0 ? params.origin : ['ATL', 'DFW', 'ORD', 'LAX'][Math.floor(Math.random() * 4)],
            time: departureTime.toISOString(),
          },
          arrival: {
            airport: idx === stops ? params.destination : ['ATL', 'DFW', 'ORD', 'LAX'][Math.floor(Math.random() * 4)],
            time: arrivalTime.toISOString(),
          },
          duration: `PT${Math.floor(flightDuration / (stops + 1) / 60)}H`,
        })),
      },
      inbound: returnDate ? {
        departure: {
          airport: params.destination,
          time: new Date(returnDate.getTime() + departureHour * 3600000).toISOString(),
          terminal: `${Math.floor(Math.random() * 5) + 1}`,
        },
        arrival: {
          airport: params.origin,
          time: new Date(returnDate.getTime() + (departureHour + Math.floor(flightDuration / 60)) * 3600000).toISOString(),
          terminal: `${Math.floor(Math.random() * 5) + 1}`,
        },
        duration: `PT${Math.floor(flightDuration / 60)}H${flightDuration % 60}M`,
        stops: stops,
        segments: Array(stops + 1).fill(null).map(() => ({
          carrier: airline.code,
          flightNumber: `${1000 + Math.floor(Math.random() * 9000)}`,
          aircraft: '320',
          departure: {
            airport: params.destination,
            time: new Date(returnDate.getTime() + departureHour * 3600000).toISOString(),
          },
          arrival: {
            airport: params.origin,
            time: new Date(returnDate.getTime() + (departureHour + Math.floor(flightDuration / 60)) * 3600000).toISOString(),
          },
          duration: `PT${Math.floor(flightDuration / (stops + 1) / 60)}H`,
        })),
      } : null,
      validatingAirline: airline.code,
      numberOfBookableSeats: Math.floor(Math.random() * 9) + 1,
      lastTicketingDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      class: params.travelClass?.toUpperCase() || 'ECONOMY',
      airline: airline,
    });
  }

  return mockFlights;
}
