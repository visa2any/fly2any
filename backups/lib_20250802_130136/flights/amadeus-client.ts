/**
 * Amadeus Flight API Client
 * Handles OAuth2 authentication and API requests
 */

import { AmadeusConfig, AmadeusTokenResponse, FlightSearchParams, FlightOffersResponse } from '@/types/flights';

export class AmadeusClient {
  private config: AmadeusConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    const environment = process.env.AMADEUS_ENVIRONMENT || 'test';
    
    this.config = {
      environment: environment as 'test' | 'production',
      apiKey: process.env.AMADEUS_API_KEY!,
      apiSecret: process.env.AMADEUS_API_SECRET!,
      baseUrl: environment === 'production' 
        ? 'https://api.amadeus.com' 
        : 'https://test.api.amadeus.com',
      tokenUrl: environment === 'production'
        ? 'https://api.amadeus.com/v1/security/oauth2/token'
        : 'https://test.api.amadeus.com/v1/security/oauth2/token'
    };

    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Amadeus API credentials not found in environment variables');
    }
  }

  /**
   * Get access token, refreshing if necessary
   */
  private async getValidToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    // If we're already refreshing, wait for that to complete
    if (this.isRefreshing && this.refreshPromise) {
      await this.refreshPromise;
      return this.accessToken!;
    }

    // Start refreshing
    this.isRefreshing = true;
    this.refreshPromise = this.refreshToken();
    
    try {
      await this.refreshPromise;
      return this.accessToken!;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Refresh the access token using OAuth2 client credentials flow
   */
  private async refreshToken(): Promise<void> {
    try {
      console.log('🔄 Refreshing Amadeus access token...');
      
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.apiKey,
        client_secret: this.config.apiSecret
      });

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData: AmadeusTokenResponse = await response.json();
      
      this.accessToken = tokenData.access_token;
      // Set expiry to 5 minutes before actual expiry to ensure buffer
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 300) * 1000);
      
      console.log('✅ Amadeus access token refreshed successfully');
      console.log(`🕐 Token expires at: ${this.tokenExpiry.toISOString()}`);
    } catch (error) {
      console.error('❌ Failed to refresh Amadeus access token:', error);
      this.accessToken = null;
      this.tokenExpiry = null;
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  protected async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getValidToken();
    
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    console.log(`📡 Making Amadeus API request: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          console.warn('⚠️ Amadeus API rate limit hit, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.makeRequest<T>(endpoint, options);
        }
        
        // Handle token expiry
        if (response.status === 401) {
          console.warn('🔄 Token expired, refreshing and retrying...');
          this.accessToken = null;
          this.tokenExpiry = null;
          const newToken = await this.getValidToken();
          
          const retryOptions = {
            ...requestOptions,
            headers: {
              ...requestOptions.headers,
              'Authorization': `Bearer ${newToken}`
            }
          };
          
          const retryResponse = await fetch(url, retryOptions);
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            throw new Error(`API request failed after token refresh: ${retryResponse.status} ${retryResponse.statusText} - ${errorText}`);
          }
          
          return retryResponse.json();
        }
        
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Amadeus API request successful');
      return data;
    } catch (error) {
      console.error('❌ Amadeus API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for flight offers
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightOffersResponse> {
    const searchParams = new URLSearchParams();
    
    // Required parameters
    searchParams.set('originLocationCode', params.originLocationCode);
    searchParams.set('destinationLocationCode', params.destinationLocationCode);
    searchParams.set('departureDate', params.departureDate);
    searchParams.set('adults', params.adults.toString());
    
    // Optional parameters
    if (params.returnDate) {
      searchParams.set('returnDate', params.returnDate);
    }
    if (params.children && params.children > 0) {
      searchParams.set('children', params.children.toString());
    }
    if (params.infants && params.infants > 0) {
      searchParams.set('infants', params.infants.toString());
    }
    if (params.travelClass) {
      searchParams.set('travelClass', params.travelClass);
    }
    if (params.nonStop !== undefined) {
      searchParams.set('nonStop', params.nonStop.toString());
    }
    if (params.maxPrice) {
      searchParams.set('maxPrice', params.maxPrice.toString());
    }
    if (params.max && params.max !== 250) {
      searchParams.set('max', params.max.toString());
    }
    if (params.currencyCode) {
      searchParams.set('currencyCode', params.currencyCode);
    }

    const endpoint = `/v2/shopping/flight-offers?${searchParams.toString()}`;
    
    try {
      console.log('🔍 Searching flights with params:', params);
      const response = await this.makeRequest<FlightOffersResponse>(endpoint);
      
      console.log(`✈️ Found ${response.data?.length || 0} flight offers`);
      return response;
    } catch (error) {
      console.error('❌ Flight search failed:', error);
      throw new Error(`Flight search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Confirm flight offer pricing
   */
  async confirmPricing(flightOffers: any[]): Promise<any> {
    const endpoint = '/v1/shopping/flight-offers/pricing';
    
    const requestBody = {
      data: {
        type: 'flight-offers-pricing',
        flightOffers: flightOffers
      }
    };

    try {
      console.log('💰 Confirming flight pricing...');
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      console.log('✅ Flight pricing confirmed');
      return response;
    } catch (error) {
      console.error('❌ Flight pricing confirmation failed:', error);
      throw new Error(`Flight pricing confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Confirm flight offer pricing with detailed fare rules
   */
  async confirmPricingWithFareRules(flightOffers: any[]): Promise<any> {
    const endpoint = '/v1/shopping/flight-offers/pricing?include=detailed-fare-rules';
    
    const requestBody = {
      data: {
        type: 'flight-offers-pricing',
        flightOffers: flightOffers
      }
    };

    try {
      console.log('💰 Confirming flight pricing with detailed fare rules...');
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'X-HTTP-Method-Override': 'POST'
        }
      });
      
      console.log('✅ Flight pricing with fare rules confirmed');
      return response;
    } catch (error) {
      console.error('❌ Flight pricing with fare rules confirmation failed:', error);
      throw new Error(`Flight pricing with fare rules confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get branded fare upsell options
   */
  async getBrandedFareUpsell(flightOffers: any[]): Promise<any> {
    const endpoint = '/v1/shopping/flight-offers/upselling';
    
    const requestBody = {
      data: {
        type: 'flight-offers-upselling',
        flightOffers: flightOffers
      }
    };

    try {
      console.log('🎯 Getting branded fare upsell options...');
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'X-HTTP-Method-Override': 'POST'
        }
      });
      
      console.log('✅ Branded fare upsell options retrieved');
      return response;
    } catch (error) {
      console.error('❌ Branded fare upsell failed:', error);
      throw new Error(`Branded fare upsell failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get baggage options for flight offers
   */
  async getBaggageOptions(flightOffers: any[]): Promise<any> {
    const endpoint = '/v1/shopping/flight-offers/pricing?include=bags';
    
    const requestBody = {
      data: {
        type: 'flight-offers-pricing',
        flightOffers: flightOffers
      }
    };

    try {
      console.log('🎒 Getting baggage options...');
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'X-HTTP-Method-Override': 'POST'
        }
      });
      
      console.log('✅ Baggage options retrieved');
      return response;
    } catch (error) {
      console.error('❌ Baggage options failed:', error);
      throw new Error(`Baggage options failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get seat maps for flight offers
   */
  async getSeatMaps(flightOffers: any[]): Promise<any> {
    const endpoint = '/v1/shopping/seatmaps';
    
    const requestBody = {
      data: flightOffers
    };

    try {
      console.log('🪑 Getting seat maps...');
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      console.log('✅ Seat maps retrieved');
      return response;
    } catch (error) {
      console.error('❌ Seat maps failed:', error);
      throw new Error(`Seat maps failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get airport information by IATA code
   */
  async getAirport(iataCode: string): Promise<any> {
    const endpoint = `/v1/reference-data/locations?subType=AIRPORT&keyword=${iataCode}`;
    
    try {
      console.log(`🏭 Getting airport info for: ${iataCode}`);
      const response = await this.makeRequest(endpoint);
      console.log('✅ Airport info retrieved');
      return response;
    } catch (error) {
      console.error('❌ Airport info retrieval failed:', error);
      throw new Error(`Airport info retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search for airports by keyword
   */
  async searchAirports(keyword: string): Promise<any> {
    const endpoint = `/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(keyword)}&page%5Blimit%5D=10`;
    
    try {
      console.log(`🔍 Searching airports with keyword: ${keyword}`);
      const response = await this.makeRequest(endpoint);
      console.log(`✅ Found ${(response as any)?.data?.length || 0} airports`);
      return response;
    } catch (error) {
      console.error('❌ Airport search failed:', error);
      throw new Error(`Airport search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get health check status
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getValidToken();
      console.log('✅ Amadeus API client is healthy');
      return true;
    } catch (error) {
      console.error('❌ Amadeus API client health check failed:', error);
      return false;
    }
  }

  /**
   * Get current configuration info (without secrets)
   */
  getConfig() {
    return {
      environment: this.config.environment,
      baseUrl: this.config.baseUrl,
      hasToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry?.toISOString()
    };
  }
}

// Singleton instance
let amadeusClient: AmadeusClient | null = null;

/**
 * Get shared Amadeus client instance
 */
export function getAmadeusClient(): AmadeusClient {
  if (!amadeusClient) {
    amadeusClient = new AmadeusClient();
  }
  return amadeusClient;
}

export default AmadeusClient;