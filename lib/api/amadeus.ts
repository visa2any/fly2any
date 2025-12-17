// Amadeus API Integration for Flight Search
import axios from 'axios';
import { showStartupBanner } from './startup-banner';

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
  private isValidCredentials: boolean = false;

  constructor() {
    this.apiKey = process.env.AMADEUS_API_KEY || '';
    this.apiSecret = process.env.AMADEUS_API_SECRET || '';

    // Check if credentials are actually configured (not placeholders)
    this.isValidCredentials = this.hasValidCredentials();

    // Smart environment detection:
    // 1. Explicit AMADEUS_ENVIRONMENT takes priority
    // 2. If valid production credentials exist, default to production
    // 3. If in Vercel/production NODE_ENV, default to production
    // 4. Otherwise default to test (for safety with test keys)
    const explicitEnv = process.env.AMADEUS_ENVIRONMENT;
    const isVercelProduction = process.env.NODE_ENV === 'production';

    let detectionMethod = '';
    if (explicitEnv) {
      this.environment = explicitEnv;
      detectionMethod = `AMADEUS_ENVIRONMENT=${explicitEnv}`;
    } else if (this.isValidCredentials) {
      // Default to production when valid credentials are configured
      // Users with real API keys want real prices
      this.environment = 'production';
      detectionMethod = 'Valid credentials detected (auto-production)';
    } else if (isVercelProduction) {
      this.environment = 'production';
      detectionMethod = 'NODE_ENV=production (auto)';
    } else {
      this.environment = 'test';
      detectionMethod = 'Default (test - no valid credentials)';
    }

    this.baseUrl = this.environment === 'production'
      ? 'https://api.amadeus.com'
      : 'https://test.api.amadeus.com';

    // Show startup banner (only once)
    showStartupBanner();

    // Log API configuration with environment details
    console.log('\n🔌 ========== AMADEUS API CONFIGURATION ==========');
    console.log(`   Environment: ${this.environment.toUpperCase()}`);
    console.log(`   Base URL: ${this.baseUrl}`);
    console.log(`   Credentials configured: ${this.isValidCredentials ? '✅ YES' : '❌ NO'}`);
    if (this.isValidCredentials) {
      console.log(`   API Key: ${this.apiKey.substring(0, 8)}...${this.apiKey.slice(-4)}`);
    }
    console.log(`   Detection method: ${detectionMethod}`);

    if (!this.isValidCredentials) {
      console.warn('   ⚠️  WARNING: Amadeus API not properly configured');
      console.warn('   📖 See: SETUP_REAL_APIS.md for setup instructions');
    } else if (this.environment === 'production') {
      console.log('   ✅ PRODUCTION MODE - Real prices enabled');
    }
    console.log('🔌 ================================================\n');
  }

  /**
   * Check if API credentials are actually configured (not placeholders)
   */
  private hasValidCredentials(): boolean {
    if (!this.apiKey || !this.apiSecret) {
      return false;
    }

    // Check for placeholder values
    const placeholders = ['your_', 'placeholder', 'REPLACE_', 'xxx', 'KEY_HERE', 'SECRET_HERE'];
    const keyLower = this.apiKey.toLowerCase();
    const secretLower = this.apiSecret.toLowerCase();

    for (const placeholder of placeholders) {
      if (keyLower.includes(placeholder.toLowerCase()) || secretLower.includes(placeholder.toLowerCase())) {
        return false;
      }
    }

    // Valid credentials must be at least 10 characters (Amadeus test keys can be shorter)
    if (this.apiKey.length < 10 || this.apiSecret.length < 10) {
      return false;
    }

    return true;
  }

  /**
   * Check if Amadeus API is in production mode
   * Returns false if in test mode (which returns synthetic/fake prices)
   */
  isProductionMode(): boolean {
    return this.environment === 'production';
  }

  /**
   * Check if Amadeus API is in test mode (returns fake prices)
   */
  isTestMode(): boolean {
    return this.environment !== 'production';
  }

  /**
   * Get the current environment
   */
  getEnvironment(): string {
    return this.environment;
  }

  /**
   * Helper: Format error for clean logging (avoid dumping huge objects)
   */
  private formatError(error: any): any {
    return {
      message: error?.message || 'Unknown error',
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      code: error?.code,
      type: error?.name || error?.constructor?.name,
      details: error?.response?.data?.errors?.[0]?.detail || error?.response?.data?.error_description
    };
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
    // Check if credentials are configured FIRST (before any network calls)
    if (!this.isValidCredentials) {
      throw new Error('AMADEUS_NOT_CONFIGURED');
    }

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
    } catch (error: any) {
      // Only log auth errors ONCE per server restart (not on every API call)
      // Use a static flag to prevent spam
      if (process.env.NODE_ENV === 'development' && !AmadeusAPI.authErrorLogged) {
        console.error('❌ Amadeus authentication failed:', this.formatError(error));
        console.error('   📖 See: SETUP_REAL_APIS.md for setup instructions');
        AmadeusAPI.authErrorLogged = true;
      }

      // Provide helpful error messages
      if (error?.response?.status === 401) {
        throw new Error('Invalid Amadeus API credentials. Please check AMADEUS_API_KEY and AMADEUS_API_SECRET in .env.local');
      } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Amadeus API. Please check your internet connection.');
      }

      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  // Static flag to prevent repeated auth error logging
  private static authErrorLogged = false;

  /**
   * Search for flight offers
   */
  async searchFlights(params: FlightSearchParams) {
    // If credentials not configured, throw special error code
    if (!this.isValidCredentials) {
      throw new Error('AMADEUS_NOT_CONFIGURED');
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

      // Tag all flights with source attribution
      const data = response.data;
      if (data.data && Array.isArray(data.data)) {
        // Debug: Log COMPLETE first flight data to analyze tax structure
        if (data.data.length > 0) {
          const firstFlight = data.data[0];

          console.log('\n🔍 ========== AMADEUS RAW API RESPONSE - DETAILED TAX ANALYSIS ==========');
          console.log('\n📋 Main Price Object:');
          console.log(JSON.stringify(firstFlight.price, null, 2));

          console.log('\n👥 Traveler Pricings (Fee Details):');
          if (firstFlight.travelerPricings && firstFlight.travelerPricings.length > 0) {
            firstFlight.travelerPricings.forEach((traveler: any, idx: number) => {
              console.log(`\n   Traveler ${idx + 1} (${traveler.travelerType}):`);
              console.log('   Price:', JSON.stringify(traveler.price, null, 2));

              if (traveler.price?.fees && Array.isArray(traveler.price.fees)) {
                console.log(`   ✅ Found ${traveler.price.fees.length} fees:`);
                traveler.price.fees.forEach((fee: any, feeIdx: number) => {
                  console.log(`      Fee ${feeIdx + 1}: ${fee.type || 'UNKNOWN'} = ${fee.amount} ${traveler.price.currency}`);
                });
              } else {
                console.log('   ⚠️  NO fees array found in travelerPricings');
              }
            });
          } else {
            console.log('   ⚠️  NO travelerPricings found');
          }

          console.log('\n📊 Summary:');
          console.log(`   Total Price: ${firstFlight.price?.total} ${firstFlight.price?.currency}`);
          console.log(`   Base Price: ${firstFlight.price?.base} ${firstFlight.price?.currency}`);
          console.log(`   Difference (Taxes+Fees): ${firstFlight.price?.total && firstFlight.price?.base ? (parseFloat(firstFlight.price.total) - parseFloat(firstFlight.price.base)).toFixed(2) : 'N/A'} ${firstFlight.price?.currency}`);
          console.log(`   Percentage: ${firstFlight.price?.total && firstFlight.price?.base ? (((parseFloat(firstFlight.price.total) - parseFloat(firstFlight.price.base)) / parseFloat(firstFlight.price.total)) * 100).toFixed(1) : 'N/A'}%`);
          console.log('\n🔍 ===================================================================\n');
        }

        data.data = data.data.map((flight: any) => {
          // Extract detailed fees from travelerPricings if available
          let detailedFees: Array<{ amount: string; type: string }> = [];

          if (flight.travelerPricings && Array.isArray(flight.travelerPricings)) {
            flight.travelerPricings.forEach((traveler: any) => {
              if (traveler.price?.fees && Array.isArray(traveler.price.fees)) {
                traveler.price.fees.forEach((fee: any) => {
                  detailedFees.push({
                    amount: fee.amount,
                    type: fee.type || 'TAX'
                  });
                });
              }
            });
          }

          // Add detailed fees to main price object if we found any
          // IMPORTANT: Use 'GDS' as source for Amadeus flights (required for upselling API)
          return {
            ...flight,
            source: 'GDS',
            price: {
              ...flight.price,
              fees: detailedFees.length > 0 ? detailedFees : flight.price?.fees
            }
          };
        });
      }

      return data;
    } catch (error: any) {
      console.error('❌ Error searching flights:', this.formatError(error));

      // NO MORE MOCK DATA FALLBACK - Throw the actual error
      throw new Error(`Amadeus API flight search failed: ${error.response?.data?.errors?.[0]?.detail || error.message}`);
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

      // Build fareDetailsBySegment for ALL segments (outbound + return)
      const fareDetailsBySegment = [];

      // Add fare details for outbound segments
      for (let segIdx = 0; segIdx < stops + 1; segIdx++) {
        fareDetailsBySegment.push({
          segmentId: `${i + 1}_${segIdx + 1}`,
          cabin: params.travelClass || 'ECONOMY',
          fareBasis: 'K0ASAVER',
          brandedFare: segIdx === 0 && Math.random() > 0.7 ? 'BASIC_ECONOMY' : 'ECONOMY',
          class: 'K',
          includedCheckedBags: {
            quantity: segIdx === 0 && Math.random() > 0.7 ? 0 : (stops === 0 ? 2 : 1),
            weight: 23,
            weightUnit: 'KG'
          },
        });
      }

      // Add fare details for return segments (if round-trip)
      if (params.returnDate && itineraries.length > 1) {
        const returnSegments = itineraries[1].segments;
        for (let segIdx = 0; segIdx < returnSegments.length; segIdx++) {
          fareDetailsBySegment.push({
            segmentId: `${i + 1}_return_${segIdx + 1}`,
            cabin: params.travelClass || 'ECONOMY',
            fareBasis: 'K0ASAVER',
            brandedFare: segIdx === 0 && Math.random() > 0.7 ? 'BASIC_ECONOMY' : 'ECONOMY',
            class: 'K',
            includedCheckedBags: {
              quantity: segIdx === 0 && Math.random() > 0.7 ? 0 : (stops === 0 ? 2 : 1),
              weight: 23,
              weightUnit: 'KG'
            },
          });
        }
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
            fareDetailsBySegment: fareDetailsBySegment,
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
   * Flight Offers Upselling - Get all fare families for a flight
   * This returns ALL available fare types from cheapest to most expensive
   * (Basic Economy → Standard → Flex → Business → First)
   *
   * Use this to show users upgrade options after initial search
   */
  async getUpsellingFares(flightOffer: any) {
    try {
      console.log('🎫 Fetching all fare families for flight...');
      console.log(`   Flight ID: ${flightOffer.id}`);
      console.log(`   Source: ${flightOffer.source}`);
      console.log(`   Price: ${flightOffer.price?.total} ${flightOffer.price?.currency}`);

      // Clean the flight offer - remove custom fields that Amadeus won't accept
      const cleanedOffer = this.cleanFlightOfferForAPI(flightOffer);

      // Handle Duffel flights - NO synthetic fare families (real data only)
      // Duffel API doesn't have upselling, so we return the original offer only
      if (flightOffer.source === 'Duffel') {
        console.log('🎫 Duffel flight detected - returning original fare (no synthetic data)');
        console.log('   ℹ️  Duffel API does not support fare family upselling');
        console.log('   ℹ️  Competitors show multiple fares by having direct airline integrations');
        // Return original offer only - DO NOT generate fake fare options
        return {
          data: [flightOffer],
          meta: { count: 1, note: 'Duffel API does not support fare family upselling' }
        };
      }

      // Normalize source detection - Amadeus flights can have source 'GDS' or 'Amadeus'
      const source = flightOffer.source?.toLowerCase() || 'unknown';
      const isAmadeusGDS = source === 'gds' || source === 'amadeus' || source === 'unknown';

      // Only Amadeus/GDS flights support upselling API
      if (!isAmadeusGDS) {
        console.log('⚠️  Non-GDS flight (source: ' + flightOffer.source + ') - upselling not available, returning original fare');
        return {
          data: [flightOffer],
          meta: { count: 1 }
        };
      }

      // Check if Amadeus is in test mode - upselling may be limited
      if (this.isTestMode()) {
        console.log('⚠️  Amadeus TEST mode - upselling API may return limited/fake data');
        console.log('   💡 For real fare families, set AMADEUS_ENVIRONMENT=production');
      }

      // Get auth token - this validates credentials are configured
      const token = await this.getAccessToken();

      console.log(`🎫 Amadeus/GDS flight (source: ${flightOffer.source}) - calling upselling API...`);
      console.log(`   API URL: ${this.baseUrl}/v1/shopping/flight-offers/upselling`);

      const response = await axios.post(
        `${this.baseUrl}/v1/shopping/flight-offers/upselling`,
        {
          data: {
            type: 'flight-offers-upselling',
            flightOffers: [cleanedOffer],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const fareCount = response.data.data?.length || 0;
      console.log(`✅ Found ${fareCount} fare families from Amadeus upselling API`);

      if (fareCount <= 1) {
        console.log('   ℹ️  Only 1 fare returned - this airline/route may not offer multiple fare families');
        console.log('   ℹ️  Common for low-cost carriers or specific routes');
      } else {
        // Log each fare family found
        response.data.data?.forEach((fare: any, idx: number) => {
          const brandedFare = fare.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFare || 'UNKNOWN';
          const price = fare.price?.total;
          console.log(`   ${idx + 1}. ${brandedFare}: ${fare.price?.currency} ${price}`);
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting upselling fares:', this.formatError(error));

      // Log more details for debugging
      if (error.response?.data?.errors) {
        console.error('   Amadeus API errors:', JSON.stringify(error.response.data.errors, null, 2));
      }

      // If upselling not available, return original offer as single option
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log('⚠️  Upselling not available for this flight, returning original fare');
        console.log('   This is normal for some airlines/routes that don\'t support branded fares');
        return {
          data: [flightOffer],
          meta: { count: 1, reason: 'Upselling API returned ' + error.response?.status }
        };
      }

      // For other errors (timeout, auth, etc.), still return original fare
      // Don't break the booking flow due to upselling failure
      console.log('⚠️  Upselling API error - returning original fare as fallback');
      return {
        data: [flightOffer],
        meta: { count: 1, error: error.message }
      };
    }
  }

  /**
   * Generate synthetic fare families for Duffel flights
   * Since Duffel doesn't have an upselling API, we create reasonable fare options
   */
  private generateDuffelFareFamilies(baseOffer: any) {
    const basePrice = parseFloat(String(baseOffer.price?.total || '0'));
    const currency = baseOffer.price?.currency || 'USD';

    // Get airline code to determine fare naming
    const airlineCode = baseOffer.validatingAirlineCodes?.[0] ||
                        baseOffer.itineraries?.[0]?.segments?.[0]?.carrierCode ||
                        'XX';

    // Generate 3-4 fare families with typical pricing
    const fareMultipliers = [
      { name: 'BASIC', multiplier: 1.0, baggage: 0, changeFee: true },
      { name: 'STANDARD', multiplier: 1.15, baggage: 1, changeFee: true },
      { name: 'FLEX', multiplier: 1.35, baggage: 2, changeFee: false },
      { name: 'FLEX_PLUS', multiplier: 1.55, baggage: 2, changeFee: false },
    ];

    const fareOffers = fareMultipliers.map((fare, index) => {
      const farePrice = basePrice * fare.multiplier;

      return {
        ...baseOffer,
        id: `${baseOffer.id}_${fare.name.toLowerCase()}`,
        price: {
          ...baseOffer.price,
          total: farePrice.toFixed(2),
          base: (farePrice * 0.85).toFixed(2), // Approximate base fare
          currency: currency,
          grandTotal: farePrice.toFixed(2),
        },
        travelerPricings: [{
          ...baseOffer.travelerPricings?.[0],
          price: {
            total: farePrice.toFixed(2),
            base: (farePrice * 0.85).toFixed(2),
            currency: currency,
          },
          fareDetailsBySegment: baseOffer.itineraries?.[0]?.segments?.map(() => ({
            fareBasis: `${fare.name}_${airlineCode}`,
            brandedFare: fare.name,
            cabin: baseOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
            includedCheckedBags: {
              quantity: fare.baggage,
              weight: fare.baggage > 0 ? 23 : 0,
              weightUnit: 'KG',
            },
          })),
        }],
        // Add metadata to identify this as a synthetic fare
        _synthetic: true,
        _baseFare: fare.name,
      };
    });

    console.log(`✅ Generated ${fareOffers.length} synthetic fare families for Duffel flight`);

    return {
      data: fareOffers,
      meta: {
        count: fareOffers.length,
        synthetic: true,
        source: 'Duffel',
      },
    };
  }

  /**
   * Clean flight offer by removing custom fields before sending to Amadeus API
   */
  private cleanFlightOfferForAPI(offer: any): any {
    const cleaned = { ...offer };

    // Remove custom fields we added that Amadeus won't accept
    // IMPORTANT: Do NOT delete 'source' - Amadeus requires it for upselling and other APIs
    delete cleaned.score;
    delete cleaned.badges;
    delete cleaned.metadata;
    delete cleaned.duffelMetadata;
    delete cleaned.isUpsellOffer;
    delete cleaned.dealScore;
    delete cleaned.dealTier;
    delete cleaned.dealLabel;
    delete cleaned._synthetic;
    delete cleaned._baseFare;

    return cleaned;
  }

  /**
   * Seat Maps - Get aircraft seat map
   * Requires the complete flight offer object with all segments
   */
  async getSeatMap(flightOffer: any) {
    const token = await this.getAccessToken();

    try {
      // Clean the flight offer before sending to API
      const cleanedOffer = this.cleanFlightOfferForAPI(flightOffer);

      console.log('🪑 Fetching seat map from Amadeus...');
      console.log(`   Flight ID: ${flightOffer.id}`);
      console.log(`   Source: ${flightOffer.source}`);

      const response = await axios.post(
        `${this.baseUrl}/v1/shopping/seatmaps`,
        {
          data: [cleanedOffer],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 second timeout
        }
      );

      // Validate response has actual seat data
      const seatMapData = response.data?.data;
      if (!seatMapData || seatMapData.length === 0) {
        console.log('⚠️  Amadeus returned empty seat map data');
        throw new Error('Seat maps not available for this flight');
      }

      // Check if decks have actual rows
      const hasRows = seatMapData.some((sm: any) =>
        sm.decks?.some((d: any) => d.seatRows?.length > 0)
      );

      if (!hasRows) {
        console.log('⚠️  Seat map has no seat rows');
        throw new Error('Seat maps not available for this flight');
      }

      console.log('✅ Amadeus seat map fetched successfully');
      console.log(`   Decks: ${seatMapData[0]?.decks?.length || 0}`);
      console.log(`   Rows: ${seatMapData[0]?.decks?.[0]?.seatRows?.length || 0}`);

      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting seat map:', error.response?.data || error.message);

      // Provide specific error messages based on API response
      if (error.response?.status === 400) {
        const apiError = error.response.data?.errors?.[0];
        if (apiError?.detail?.includes('not supported') || apiError?.title?.includes('NOT SUPPORTED')) {
          throw new Error('Seat maps not available for this flight');
        }
        throw new Error('Seat maps not available for this flight');
      }

      if (error.response?.status === 404) {
        throw new Error('Seat maps not available for this flight');
      }

      if (error.message?.includes('not available')) {
        throw error; // Re-throw our own specific errors
      }

      // Generic fallback
      throw new Error('Seat maps not available for this flight');
    }
  }

  /**
   * Flight Choice Prediction - ML-based flight ranking
   *
   * IMPORTANT: The Amadeus API expects the flight offers array DIRECTLY in the data field,
   * NOT wrapped in a "flightOffers" property. The API will reject requests with:
   * "json: cannot unmarshal object into Go struct field FlightOffersSearchReply.data of type []*generated.FlightOffer"
   *
   * Correct format: { data: [...flight offers] }
   * Wrong format: { data: { type: '...', flightOffers: [...] } }
   */
  async predictFlightChoice(flightOffers: any[]) {
    const token = await this.getAccessToken();

    try {
      // Use retry with backoff to handle rate limiting (429 errors)
      const response = await this.retryWithBackoff(async () => {
        return await axios.post(
          `${this.baseUrl}/v2/shopping/flight-offers/prediction`,
          {
            // Send flight offers directly as array - this matches the exact format
            // returned by the Flight Offers Search API
            data: flightOffers,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      });

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
    // Check credentials before attempting API call
    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️  Amadeus API credentials not configured, returning empty hotel results');
      return { data: [] };
    }

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
   * Transfer Search - Airport/City transfers using Amadeus Transfer Search API
   * Supports: PRIVATE, SHARED, TAXI, HOURLY, AIRPORT_EXPRESS, AIRPORT_BUS, HELICOPTER, PRIVATE_JET
   */
  async searchTransfers(params: {
    startLocationCode?: string;        // IATA airport code (e.g., "CDG", "JFK")
    startGeoCode?: { latitude: number; longitude: number };
    startAddressLine?: string;
    endLocationCode?: string;          // IATA airport code for dropoff
    endAddressLine?: string;           // Street address
    endCityName?: string;
    endCountryCode?: string;
    endGeoCode?: { latitude: number; longitude: number };
    transferType?: 'PRIVATE' | 'SHARED' | 'TAXI' | 'HOURLY' | 'AIRPORT_EXPRESS' | 'AIRPORT_BUS' | 'HELICOPTER' | 'PRIVATE_JET';
    startDateTime: string;             // ISO 8601 format
    passengers: number;
    providerCodes?: string[];          // Optional: filter by provider
  }) {
    // Check credentials before attempting API call
    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️  Amadeus API credentials not configured, returning empty transfer results');
      return { data: [] };
    }

    const token = await this.getAccessToken();

    try {
      // Build request body for POST
      const requestBody: any = {
        startDateTime: params.startDateTime,
        passengers: params.passengers,
      };

      // Set start location (airport code or coordinates)
      if (params.startLocationCode) {
        requestBody.startLocationCode = params.startLocationCode;
      } else if (params.startGeoCode) {
        requestBody.startGeoCode = params.startGeoCode;
      } else if (params.startAddressLine) {
        requestBody.startAddressLine = params.startAddressLine;
      }

      // Set end location (address, coordinates, or airport code)
      if (params.endLocationCode) {
        requestBody.endLocationCode = params.endLocationCode;
      } else if (params.endGeoCode) {
        requestBody.endGeoCode = params.endGeoCode;
      } else if (params.endAddressLine) {
        requestBody.endAddressLine = params.endAddressLine;
        if (params.endCityName) requestBody.endCityName = params.endCityName;
        if (params.endCountryCode) requestBody.endCountryCode = params.endCountryCode;
      }

      // Optional filters
      if (params.transferType) {
        requestBody.transferType = params.transferType;
      }
      if (params.providerCodes && params.providerCodes.length > 0) {
        requestBody.providerCodes = params.providerCodes;
      }

      console.log(`🚗 Searching Amadeus transfers from ${params.startLocationCode || 'coordinates'} to ${params.endAddressLine || params.endLocationCode || 'coordinates'}...`);

      const response = await axios.post(
        `${this.baseUrl}/v1/shopping/transfer-offers`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Amadeus returned ${response.data?.data?.length || 0} transfer offers`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching Amadeus transfers:', error.response?.data || error.message);
      // Return empty array instead of throwing to allow fallback
      return { data: [] };
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
    // Check credentials FIRST before attempting any API calls
    if (!this.isValidCredentials) {
      // Return empty results silently - calling code will use demo fallback
      return { data: [] };
    }

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
      // Handle 404 gracefully - endpoint may not be available in test mode
      if (error.response?.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`ℹ️  Car rentals not available for ${params.pickupLocationCode} (404) - using fallback data`);
        }
        return { data: [] }; // Return empty data - caller will use demo fallback
      }

      // Log other errors only in development with minimal details
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️  Amadeus car rental error for ${params.pickupLocationCode}:`, {
          status: error.response?.status,
          message: error.response?.data?.errors?.[0]?.title || error.message,
        });
      }
      return { data: [] }; // Return empty instead of throwing - graceful degradation
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
    // Check credentials before attempting API call
    if (!this.apiKey || !this.apiSecret) {
      console.warn('⚠️  Amadeus API credentials not configured, returning empty activity results');
      return { data: [] };
    }

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

  /**
   * Flight Create Orders - Create a flight booking
   *
   * CRITICAL: This is the ONLY API that generates revenue!
   *
   * Workflow:
   * 1. Flight Offers Search -> Get available flights
   * 2. Flight Offers Price -> Confirm price & availability (REQUIRED before booking)
   * 3. Flight Create Orders -> Complete the booking (THIS METHOD)
   *
   * Required Data:
   * - Confirmed flight offer from Flight Offers Price API
   * - Traveler information (name, DOB, passport, contact)
   * - Payment details (handled separately via Stripe/payment gateway)
   *
   * Returns:
   * - PNR (Passenger Name Record) - the booking confirmation number
   * - Flight order details
   * - Ticketing information
   *
   * Important Notes:
   * - ALWAYS call Flight Offers Price API before this to ensure current pricing
   * - The flight offer can change between search and booking (sold out, price change)
   * - Payment is processed separately - this API only creates the reservation
   * - Amadeus uses "fulfillment" for payment status (CONFIRMED, PENDING, etc.)
   */
  async createFlightOrder(payload: {
    flightOffers: any[];
    travelers: any[];
    remarks?: {
      general?: Array<{ subType: string; text: string }>;
    };
    ticketingAgreement?: {
      option: 'CONFIRM' | 'DELAY';
      delay?: string;
    };
    contacts?: any[];
  }) {
    // Validate that we have credentials (avoid calling API without auth)
    if (!this.isValidCredentials) {
      console.error('❌ Amadeus API credentials not configured - CANNOT create booking');

      // CRITICAL: In production, NEVER create mock bookings
      // Customers would think they have real reservations!
      if (process.env.NODE_ENV === 'production') {
        throw new Error('API_ERROR: Flight booking system unavailable. Please try again or contact support.');
      }

      // Only in development: Return mock booking for testing
      console.warn('⚠️  Development mode: Using mock booking data');
      return this.getMockFlightOrder(payload);
    }

    const token = await this.getAccessToken();

    try {
      console.log('📝 Creating flight order with Amadeus API...');
      console.log(`   Flight Offers: ${payload.flightOffers.length}`);
      console.log(`   Travelers: ${payload.travelers.length}`);

      const response = await axios.post(
        `${this.baseUrl}/v1/booking/flight-orders`,
        {
          data: {
            type: 'flight-order',
            flightOffers: payload.flightOffers,
            travelers: payload.travelers,
            remarks: payload.remarks,
            ticketingAgreement: payload.ticketingAgreement || {
              option: 'CONFIRM', // Immediate ticketing
            },
            contacts: payload.contacts || [
              {
                addresseeName: {
                  firstName: payload.travelers[0]?.name?.firstName || 'PASSENGER',
                  lastName: payload.travelers[0]?.name?.lastName || 'NAME',
                },
                companyName: 'FLY2ANY',
                purpose: 'STANDARD',
                phones: [
                  {
                    deviceType: 'MOBILE',
                    countryCallingCode: '1',
                    number: payload.travelers[0]?.contact?.phones?.[0]?.number || '1234567890',
                  },
                ],
                emailAddress: payload.travelers[0]?.contact?.emailAddress || 'booking@fly2any.com',
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout for booking
        }
      );

      console.log('✅ Flight order created successfully!');
      console.log(`   PNR: ${response.data.data?.associatedRecords?.[0]?.reference || 'N/A'}`);
      console.log(`   Order ID: ${response.data.data?.id || 'N/A'}`);

      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating flight order:', error.response?.data || error.message);

      // Provide detailed error information
      if (error.response?.data?.errors) {
        console.error('Amadeus API errors:', JSON.stringify(error.response.data.errors, null, 2));
      }

      // Handle specific booking errors
      if (error.response?.status === 400) {
        const errors = error.response.data?.errors || [];
        const soldOutError = errors.find((e: any) =>
          e.code === 'SEGMENT SOLD OUT' ||
          e.title?.includes('sold out') ||
          e.detail?.includes('sold out')
        );

        if (soldOutError) {
          throw new Error('SOLD_OUT: This flight is no longer available. Please search for alternative flights.');
        }

        const priceChangeError = errors.find((e: any) =>
          e.code === 'PRICE DISCREPANCY' ||
          e.title?.includes('price') ||
          e.detail?.includes('price')
        );

        if (priceChangeError) {
          throw new Error('PRICE_CHANGED: The price for this flight has changed. Please review the new price.');
        }

        const invalidDataError = errors.find((e: any) =>
          e.code === 'INVALID FORMAT' ||
          e.title?.includes('invalid') ||
          e.detail?.includes('invalid')
        );

        if (invalidDataError) {
          throw new Error(`INVALID_DATA: ${invalidDataError.detail || 'Invalid passenger or flight information'}`);
        }
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('AUTHENTICATION_ERROR: Unable to authenticate with booking system. Please contact support.');
      }

      if (error.response?.status === 500) {
        throw new Error('API_ERROR: The booking system is experiencing issues. Please try again in a few moments.');
      }

      // CRITICAL: In production, NEVER fall back to mock data
      // This would create fake bookings that customers think are real!
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`API_ERROR: Failed to create booking - ${error.message || 'Unknown error'}. Please try again or contact support.`);
      }

      // Only in development: Fallback to mock data for testing
      console.log('🧪 Development mode: Falling back to mock flight order');
      return this.getMockFlightOrder(payload);
    }
  }

  /**
   * Generate mock flight order for development/testing
   */
  private getMockFlightOrder(payload: {
    flightOffers: any[];
    travelers: any[];
    remarks?: any;
  }) {
    const flightOffer = payload.flightOffers[0];
    const mainTraveler = payload.travelers[0];

    // Generate realistic PNR (6-character alphanumeric)
    const generatePNR = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let pnr = '';
      for (let i = 0; i < 6; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pnr;
    };

    const pnr = generatePNR();
    const orderId = `MOCK_ORDER_${Date.now()}`;

    return {
      data: {
        type: 'flight-order',
        id: orderId,
        queuingOfficeId: 'NCE4D31SB',
        associatedRecords: [
          {
            reference: pnr,
            creationDate: new Date().toISOString(),
            originSystemCode: 'GDS',
            flightOfferId: flightOffer.id,
          },
        ],
        flightOffers: payload.flightOffers,
        travelers: payload.travelers.map((traveler: any, index: number) => ({
          ...traveler,
          id: (index + 1).toString(),
        })),
        remarks: payload.remarks,
        ticketingAgreement: {
          option: 'CONFIRM',
          delay: null,
        },
        contacts: [
          {
            addresseeName: {
              firstName: mainTraveler?.name?.firstName || 'PASSENGER',
              lastName: mainTraveler?.name?.lastName || 'NAME',
            },
            companyName: 'FLY2ANY',
            purpose: 'STANDARD',
            phones: [
              {
                deviceType: 'MOBILE',
                countryCallingCode: '1',
                number: mainTraveler?.contact?.phones?.[0]?.number || '1234567890',
              },
            ],
            emailAddress: mainTraveler?.contact?.emailAddress || 'booking@fly2any.com',
          },
        ],
      },
      meta: {
        mockData: true,
        warning: 'This is mock data for development. Real bookings require Amadeus API credentials.',
      },
    };
  }
}

export const amadeusAPI = new AmadeusAPI();
export { amadeusAPI as amadeus };
