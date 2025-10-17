// Amadeus API Integration for Flight Search
import axios from 'axios';

interface AmadeusTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  currencyCode?: string;
  max?: number;
}

class AmadeusAPI {
  private apiKey: string;
  private apiSecret: string;
  private environment: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.apiKey = process.env.AMADEUS_API_KEY || '';
    this.apiSecret = process.env.AMADEUS_API_SECRET || '';
    this.environment = process.env.AMADEUS_ENVIRONMENT || 'test';
    this.baseUrl = this.environment === 'production'
      ? 'https://api.amadeus.com'
      : 'https://test.api.amadeus.com';
  }

  /**
   * Helper: Retry function with exponential backoff for rate limiting
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error (429)
        if (error.response?.status === 429) {
          // If we've exhausted retries, throw the error
          if (attempt === maxRetries) {
            console.error(`❌ Rate limit exceeded after ${maxRetries} retries`);
            throw error;
          }

          // Calculate delay with exponential backoff
          const delay = initialDelay * Math.pow(2, attempt);
          const jitter = Math.random() * 200; // Add 0-200ms jitter
          const totalDelay = delay + jitter;

          console.log(`⏳ Rate limited (429). Retrying in ${Math.round(totalDelay)}ms (attempt ${attempt + 1}/${maxRetries})...`);

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, totalDelay));
          continue;
        }

        // For non-429 errors, throw immediately
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<AmadeusTokenResponse>(
        `${this.baseUrl}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Amadeus access token:', error);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  /**
   * Search for flight offers
   */
  async searchFlights(params: FlightSearchParams) {
    // If no API credentials, return mock data
    if (!this.apiKey || !this.apiSecret) {
      console.log('🧪 Using mock flight data (no Amadeus credentials)');
      return this.getMockFlightData(params);
    }

    try {
      const token = await this.getAccessToken();

      const searchParams = new URLSearchParams({
        originLocationCode: params.origin,
        destinationLocationCode: params.destination,
        departureDate: params.departureDate,
        adults: params.adults.toString(),
        max: (params.max || 50).toString(),
        currencyCode: params.currencyCode || 'USD',
      });

      if (params.returnDate) {
        searchParams.append('returnDate', params.returnDate);
      }
      if (params.children) {
        searchParams.append('children', params.children.toString());
      }
      if (params.infants) {
        searchParams.append('infants', params.infants.toString());
      }
      if (params.travelClass) {
        searchParams.append('travelClass', params.travelClass);
      }
      if (params.nonStop !== undefined) {
        searchParams.append('nonStop', params.nonStop.toString());
      }

      // Use retry logic with exponential backoff for rate limiting
      const response = await this.retryWithBackoff(
        () => axios.get(
          `${this.baseUrl}/v2/shopping/flight-offers`,
          {
            params: searchParams,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000, // 10 second timeout
          }
        ),
        3, // max retries
        1000 // initial delay: 1s, then 2s, then 4s
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error searching flights:', error.response?.data || error.message);
      console.error('Full error:', error);

      // Fallback to mock data on any error
      console.log('🧪 Falling back to mock flight data due to API error');
      return this.getMockFlightData(params);
    }
  }

  /**
   * Generate mock flight data for testing
   */
  private getMockFlightData(params: FlightSearchParams) {
    const airlines = ['AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'EK', 'QR', 'SQ'];
    const mockFlights = [];

    for (let i = 0; i < 10; i++) {
      const airline = airlines[i % airlines.length];
      const basePrice = 300 + Math.random() * 1200;
      const duration = 120 + Math.random() * 600; // 2-12 hours
      const stops = Math.random() > 0.6 ? 0 : Math.random() > 0.5 ? 1 : 2;

      // Build itineraries array - include return flight if round-trip
      const itineraries = [
        // Outbound flight
        {
          duration: `PT${Math.floor(duration / 60)}H${Math.floor(duration % 60)}M`,
          segments: Array.from({ length: stops + 1 }, (_, segIdx) => ({
            departure: {
              iataCode: segIdx === 0 ? params.origin : `${params.origin}${segIdx}`,
              terminal: '1',
              at: `${params.departureDate}T${String(8 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
            },
            arrival: {
              iataCode: segIdx === stops ? params.destination : `${params.destination}${segIdx}`,
              terminal: '2',
              at: `${params.departureDate}T${String(10 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
            },
            carrierCode: airline,
            number: String(100 + Math.floor(Math.random() * 900)),
            aircraft: { code: '738' },
            operating: { carrierCode: airline },
            duration: `PT${Math.floor(duration / (stops + 1) / 60)}H${Math.floor((duration / (stops + 1)) % 60)}M`,
            id: `${i + 1}_${segIdx + 1}`,
            numberOfStops: 0,
            blacklistedInEU: false,
          })),
        },
      ];

      // Add return flight if round-trip
      if (params.returnDate) {
        const returnDuration = 120 + Math.random() * 600;
        const returnStops = Math.random() > 0.6 ? 0 : Math.random() > 0.5 ? 1 : 2;

        itineraries.push({
          duration: `PT${Math.floor(returnDuration / 60)}H${Math.floor(returnDuration % 60)}M`,
          segments: Array.from({ length: returnStops + 1 }, (_, segIdx) => ({
            departure: {
              iataCode: segIdx === 0 ? params.destination : `${params.destination}${segIdx}`,
              terminal: '1',
              at: `${params.returnDate}T${String(8 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
            },
            arrival: {
              iataCode: segIdx === returnStops ? params.origin : `${params.origin}${segIdx}`,
              terminal: '2',
              at: `${params.returnDate}T${String(10 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
            },
            carrierCode: airline,
            number: String(100 + Math.floor(Math.random() * 900)),
            aircraft: { code: '738' },
            operating: { carrierCode: airline },
            duration: `PT${Math.floor(returnDuration / (returnStops + 1) / 60)}H${Math.floor((returnDuration / (returnStops + 1)) % 60)}M`,
            id: `${i + 1}_return_${segIdx + 1}`,
            numberOfStops: 0,
            blacklistedInEU: false,
          })),
        });
      }

      mockFlights.push({
        type: 'flight-offer',
        id: `MOCK_${i + 1}`,
        source: 'GDS',
        instantTicketingRequired: false,
        nonHomogeneous: false,
        oneWay: !params.returnDate,
        lastTicketingDate: params.departureDate,
        numberOfBookableSeats: Math.floor(Math.random() * 9) + 1,
        itineraries,
        price: {
          currency: params.currencyCode || 'USD',
          total: basePrice.toFixed(2),
          base: (basePrice * 0.85).toFixed(2),
          fees: [{ amount: (basePrice * 0.15).toFixed(2), type: 'TICKETING' }],
          grandTotal: basePrice.toFixed(2),
        },
        pricingOptions: {
          fareType: ['PUBLISHED'],
          includedCheckedBagsOnly: true,
        },
        validatingAirlineCodes: [airline],
        travelerPricings: [
          {
            travelerId: '1',
            fareOption: 'STANDARD',
            travelerType: 'ADULT',
            price: {
              currency: params.currencyCode || 'USD',
              total: basePrice.toFixed(2),
              base: (basePrice * 0.85).toFixed(2),
            },
            fareDetailsBySegment: [
              {
                segmentId: `${i + 1}_1`,
                cabin: params.travelClass || 'ECONOMY',
                fareBasis: 'K0ASAVER',
                brandedFare: 'ECONOMY',
                class: 'K',
                includedCheckedBags: { quantity: stops === 0 ? 2 : 1 },
              },
            ],
          },
        ],
      });
    }

    return {
      data: mockFlights,
      dictionaries: {
        carriers: {
          AA: 'American Airlines',
          DL: 'Delta Air Lines',
          UA: 'United Airlines',
          BA: 'British Airways',
          LH: 'Lufthansa',
          AF: 'Air France',
          EK: 'Emirates',
          QR: 'Qatar Airways',
          SQ: 'Singapore Airlines',
        },
        aircraft: {
          '738': 'Boeing 737-800',
        },
      },
      meta: {
        count: mockFlights.length,
      },
    };
  }

  /**
   * Get flight offer pricing (for verification before booking)
   */
  async confirmFlightPrice(flightOffers: any[]) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/shopping/flight-offers/pricing`,
        {
          data: {
            type: 'flight-offers-pricing',
            flightOffers,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error confirming flight price:', error.response?.data || error);
      throw new Error('Failed to confirm flight price');
    }
  }

  /**
   * Get Detailed Fare Rules - Refund policies, change fees, penalties
   * CRITICAL for legal compliance (DOT requirements)
   *
   * Returns fare rules categories:
   * - VR (Voluntary Refunds): Is it refundable?
   * - PE (Penalties): How much to cancel/change?
   * - VC (Voluntary Changes): Can I change my flight?
   * - MN (Minimum Stay), MX (Maximum Stay), etc.
   */
  async getDetailedFareRules(flightOffers: any[]) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/shopping/flight-offers/pricing?include=detailed-fare-rules`,
        {
          data: {
            type: 'flight-offers-pricing',
            flightOffers,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Fetched detailed fare rules successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error getting detailed fare rules:', error.response?.data || error);

      // Return mock fare rules for development/fallback
      console.log('🧪 Using mock fare rules data');
      return this.getMockFareRules(flightOffers);
    }
  }

  /**
   * Generate mock fare rules for testing/fallback
   */
  private getMockFareRules(flightOffers: any[]) {
    return {
      data: {
        ...flightOffers[0],
        fareRules: {
          rules: [
            {
              category: 'REFUNDS',
              maxPenaltyAmount: '0.00',
              rules: [
                {
                  notApplicable: false,
                  maxPenaltyAmount: '0.00',
                  descriptions: {
                    descriptionType: 'refund',
                    text: 'NON-REFUNDABLE TICKET. Tickets are non-refundable after the 24-hour grace period. No refund will be provided for cancellations.',
                  },
                },
              ],
            },
            {
              category: 'EXCHANGE',
              maxPenaltyAmount: '0.00',
              rules: [
                {
                  notApplicable: true,
                  descriptions: {
                    descriptionType: 'change',
                    text: 'CHANGES NOT PERMITTED. This fare does not allow any changes. Ticket must be cancelled and rebought at current price.',
                  },
                },
              ],
            },
            {
              category: 'REVALIDATION',
              rules: [
                {
                  notApplicable: true,
                  descriptions: {
                    descriptionType: 'revalidation',
                    text: 'REVALIDATION NOT PERMITTED.',
                  },
                },
              ],
            },
          ],
        },
      },
    };
  }

  /**
   * Search for airports by city or keyword
   */
  async searchAirports(keyword: string) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/reference-data/locations`,
        {
          params: {
            subType: 'AIRPORT,CITY',
            keyword,
            'page[limit]': 10,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error searching airports:', error.response?.data || error);
      throw new Error('Failed to search airports');
    }
  }

  /**
   * Get flight status by flight number and date
   */
  async getFlightStatus(flightNumber: string, date: string) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v2/schedule/flights`,
        {
          params: {
            flightNumber,
            scheduledDepartureDate: date,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting flight status:', error.response?.data || error);
      throw new Error('Failed to get flight status');
    }
  }

  /**
   * Flight Inspiration - Discover destinations from origin
   */
  async getFlightInspiration(params: {
    origin: string;
    maxPrice?: number;
    departureDate?: string;
    oneWay?: boolean;
    duration?: string;
    nonStop?: boolean;
    viewBy?: 'DATE' | 'DESTINATION' | 'DURATION' | 'WEEK' | 'COUNTRY';
  }) {
    const token = await this.getAccessToken();

    try {
      const searchParams: any = {
        origin: params.origin,
      };

      if (params.maxPrice) searchParams.maxPrice = params.maxPrice;
      if (params.departureDate) searchParams.departureDate = params.departureDate;
      if (params.oneWay !== undefined) searchParams.oneWay = params.oneWay;
      if (params.duration) searchParams.duration = params.duration;
      if (params.nonStop !== undefined) searchParams.nonStop = params.nonStop;
      if (params.viewBy) searchParams.viewBy = params.viewBy;

      const response = await axios.get(
        `${this.baseUrl}/v1/shopping/flight-destinations`,
        {
          params: searchParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting flight inspiration:', error.response?.data || error);
      throw new Error('Failed to get flight inspiration');
    }
  }

  /**
   * Flight Cheapest Dates - Find cheapest dates for a route
   */
  async getCheapestDates(params: {
    origin: string;
    destination: string;
    departureDate?: string;
    oneWay?: boolean;
    duration?: string;
    nonStop?: boolean;
    maxPrice?: number;
    viewBy?: 'DATE' | 'DURATION' | 'WEEK';
  }) {
    const token = await this.getAccessToken();

    try {
      const searchParams: any = {
        origin: params.origin,
        destination: params.destination,
      };

      if (params.departureDate) searchParams.departureDate = params.departureDate;
      if (params.oneWay !== undefined) searchParams.oneWay = params.oneWay;
      if (params.duration) searchParams.duration = params.duration;
      if (params.nonStop !== undefined) searchParams.nonStop = params.nonStop;
      if (params.maxPrice) searchParams.maxPrice = params.maxPrice;
      if (params.viewBy) searchParams.viewBy = params.viewBy;

      const response = await axios.get(
        `${this.baseUrl}/v1/shopping/flight-dates`,
        {
          params: searchParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting cheapest dates:', error.response?.data || error);
      // Preserve the original error so route handlers can access error.response
      throw error;
    }
  }

  /**
   * Branded Fares - Get available fare families
   */
  async getBrandedFares(flightOfferId: string) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/shopping/flight-offers/${flightOfferId}/branded-fares`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting branded fares:', error.response?.data || error);
      throw new Error('Failed to get branded fares');
    }
  }

  /**
   * Seat Maps - Get aircraft seat map
   */
  async getSeatMap(flightOfferId: string) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/shopping/seatmaps`,
        {
          data: [
            {
              type: 'flight-offer',
              id: flightOfferId,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting seat map:', error.response?.data || error);
      throw new Error('Failed to get seat map');
    }
  }

  /**
   * Flight Choice Prediction - ML-based flight ranking
   */
  async predictFlightChoice(flightOffers: any[]) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v2/shopping/flight-offers/prediction`,
        {
          data: {
            type: 'flight-offers-prediction',
            flightOffers,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error predicting flight choice:', error.response?.data || error);

      // Provide detailed error information for debugging
      if (error.response?.data?.errors) {
        console.error('Amadeus API errors:', JSON.stringify(error.response.data.errors, null, 2));
      }

      // Throw the original error so the route handler can access error.response
      throw error;
    }
  }

  /**
   * Trip Purpose Prediction - Detect business vs leisure
   */
  async predictTripPurpose(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate: string;
  }) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/travel/predictions/trip-purpose`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error predicting trip purpose:', error.response?.data || error);
      throw new Error('Failed to predict trip purpose');
    }
  }

  /**
   * Points of Interest - Get destination attractions
   */
  async getPointsOfInterest(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    categories?: string[];
  }) {
    const token = await this.getAccessToken();

    try {
      const searchParams: any = {
        latitude: params.latitude,
        longitude: params.longitude,
      };

      if (params.radius) searchParams.radius = params.radius;
      if (params.categories) searchParams.categories = params.categories.join(',');

      const response = await axios.get(
        `${this.baseUrl}/v1/reference-data/locations/pois`,
        {
          params: searchParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting points of interest:', error.response?.data || error);
      throw new Error('Failed to get points of interest');
    }
  }

  /**
   * Get Hotels by City - Step 1 of hotel search workflow
   * Returns list of hotel IDs for a given city
   */
  async getHotelsByCity(params: {
    cityCode: string;
    radius?: number;
    radiusUnit?: 'KM' | 'MILE';
    ratings?: number[];
    chainCodes?: string[];
  }) {
    const token = await this.getAccessToken();

    try {
      const searchParams: any = {
        cityCode: params.cityCode,
      };

      if (params.radius) searchParams.radius = params.radius;
      if (params.radiusUnit) searchParams.radiusUnit = params.radiusUnit;
      if (params.ratings && params.ratings.length > 0) {
        searchParams.ratings = params.ratings.join(',');
      }
      if (params.chainCodes && params.chainCodes.length > 0) {
        searchParams.chainCodes = params.chainCodes.join(',');
      }

      const response = await axios.get(
        `${this.baseUrl}/v1/reference-data/locations/hotels/by-city`,
        {
          params: searchParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting hotels by city:', error.response?.data || error);
      throw new Error('Failed to get hotels by city');
    }
  }

  /**
   * Hotel Search - 2-Step Workflow (Correct Implementation)
   * Step 1: Get hotel IDs from city code
   * Step 2: Get hotel offers with availability and pricing
   */
  async searchHotels(params: {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    roomQuantity?: number;
    radius?: number;
    radiusUnit?: 'KM' | 'MILE';
    ratings?: number[];
    hotelName?: string;
  }) {
    const token = await this.getAccessToken();

    try {
      // Step 1: Get hotel IDs from the city
      console.log(`🏨 Step 1: Getting hotels in city ${params.cityCode}...`);
      const hotelListResponse = await this.getHotelsByCity({
        cityCode: params.cityCode,
        radius: params.radius || 5, // Default 5 KM radius
        radiusUnit: params.radiusUnit || 'KM',
        ratings: params.ratings,
      });

      if (!hotelListResponse.data || hotelListResponse.data.length === 0) {
        console.log('⚠️ No hotels found in this city');
        return { data: [] };
      }

      // Extract hotel IDs (limit to first 50 for performance)
      const hotelIds = hotelListResponse.data
        .slice(0, 50)
        .map((hotel: any) => hotel.hotelId);

      console.log(`✅ Found ${hotelIds.length} hotels, searching availability...`);

      // Step 2: Get hotel offers with availability and pricing
      const offersParams: any = {
        hotelIds: hotelIds.join(','),
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults,
      };

      if (params.roomQuantity) offersParams.roomQuantity = params.roomQuantity;

      const offersResponse = await axios.get(
        `${this.baseUrl}/v3/shopping/hotel-offers`,
        {
          params: offersParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`✅ Found ${offersResponse.data.data?.length || 0} available hotels with pricing`);
      return offersResponse.data;
    } catch (error: any) {
      console.error('Error searching hotels:', error.response?.data || error);
      throw new Error('Failed to search hotels');
    }
  }

  /**
   * Transfer Search - Airport transfers
   */
  async searchTransfers(params: {
    startLocationCode: string;
    endAddressLine: string;
    transferType: 'PRIVATE' | 'SHARED' | 'TAXI';
    startDateTime: string;
    passengers: number;
  }) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/shopping/transfer-offers`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error searching transfers:', error.response?.data || error);
      throw new Error('Failed to search transfers');
    }
  }

  /**
   * Car Rental Search - Find available rental cars
   */
  async searchCarRentals(params: {
    pickupLocationCode: string;
    dropoffLocationCode?: string;
    pickupDate: string; // YYYY-MM-DD
    dropoffDate: string; // YYYY-MM-DD
    pickupTime?: string; // HH:MM:SS
    dropoffTime?: string; // HH:MM:SS
    driverAge?: number;
    currency?: string;
  }) {
    const token = await this.getAccessToken();

    try {
      const searchParams: any = {
        pickUpLocation: params.pickupLocationCode,
        pickUpDate: params.pickupDate,
        dropOffDate: params.dropoffDate,
      };

      if (params.dropoffLocationCode) {
        searchParams.dropOffLocation = params.dropoffLocationCode;
      } else {
        searchParams.dropOffLocation = params.pickupLocationCode;
      }

      if (params.pickupTime) searchParams.pickUpTime = params.pickupTime;
      if (params.dropoffTime) searchParams.dropOffTime = params.dropoffTime;
      if (params.driverAge) searchParams.driverAge = params.driverAge;
      if (params.currency) searchParams.currency = params.currency;

      console.log(`🚗 Searching car rentals at ${params.pickupLocationCode}...`);

      const response = await axios.get(
        `${this.baseUrl}/v1/shopping/car-rentals`,
        {
          params: searchParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`✅ Found ${response.data.data?.length || 0} car rental options`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching car rentals:', error.response?.data || error);
      throw new Error('Failed to search car rentals');
    }
  }

  /**
   * Activities/Tours Search - Find activities and tours by location
   */
  async searchActivities(params: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers (default 1km, max 20km)
  }) {
    const token = await this.getAccessToken();

    try {
      const searchParams: any = {
        latitude: params.latitude,
        longitude: params.longitude,
      };

      if (params.radius) searchParams.radius = params.radius;

      console.log(`🎭 Searching activities at coordinates ${params.latitude}, ${params.longitude}...`);

      const response = await axios.get(
        `${this.baseUrl}/v1/shopping/activities`,
        {
          params: searchParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`✅ Found ${response.data.data?.length || 0} activities`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching activities:', error.response?.data || error);
      throw new Error('Failed to search activities');
    }
  }

  /**
   * Price Analytics - Market insights for route
   */
  async getPriceAnalytics(params: {
    originIataCode: string;
    destinationIataCode: string;
    departureDate: string;
    currencyCode?: string;
  }) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/analytics/itinerary-price-metrics`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting price analytics:', error.response?.data || error);
      throw new Error('Failed to get price analytics');
    }
  }

  /**
   * Busiest Period - Travel demand insights
   */
  async getBusiestPeriod(params: {
    cityCode: string;
    period: string; // YYYY-MM
    direction: 'ARRIVING' | 'DEPARTING';
  }) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/travel/analytics/air-traffic/busiest-period`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting busiest period:', error.response?.data || error);
      throw new Error('Failed to get busiest period');
    }
  }

  /**
   * Most Traveled Destinations - Popular routes from origin
   */
  async getMostTraveledDestinations(params: {
    originCityCode: string;
    period: string; // YYYY-MM
    max?: number;
  }) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/travel/analytics/air-traffic/traveled`,
        {
          params: {
            originCityCode: params.originCityCode,
            period: params.period,
            max: params.max || 10,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting most traveled destinations:', error.response?.data || error);
      throw new Error('Failed to get most traveled destinations');
    }
  }

  /**
   * CO2 Emissions - Flight carbon footprint
   */
  async getCO2Emissions(flightOffers: any[]) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/travel/predictions/flight-emissions`,
        {
          data: {
            type: 'flight-emissions-prediction',
            flightOffers,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error getting CO2 emissions:', error.response?.data || error);
      throw new Error('Failed to get CO2 emissions');
    }
  }
}

export const amadeusAPI = new AmadeusAPI();
