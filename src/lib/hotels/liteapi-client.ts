/**
 * LiteAPI Client for Hotel Booking System
 * Handles all interactions with LiteAPI v3.0
 */

import { z } from 'zod';

// Configuration
const config = {
  baseUrl: 'https://api.liteapi.travel/v3.0',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  
  // Environment-based keys
  getKeys: () => {
    const environment = process.env.LITEAPI_ENVIRONMENT || 'sandbox';
    
    if (environment === 'production') {
      const publicKey = process.env.LITEAPI_PRODUCTION_PUBLIC_KEY;
      const privateKey = process.env.LITEAPI_PRODUCTION_PRIVATE_KEY;
      
      if (!publicKey || !privateKey) {
        console.error('❌ Production LiteAPI keys not found in environment variables');
        throw new Error('Production LiteAPI keys not configured. Please add LITEAPI_PRODUCTION_PUBLIC_KEY and LITEAPI_PRODUCTION_PRIVATE_KEY to your environment variables.');
      }
      
      return { publicKey, privateKey };
    }
    
    // Sandbox environment
    const publicKey = process.env.LITEAPI_SANDBOX_PUBLIC_KEY || '21945f22-d6e3-459a-abd8-a7aaa4d043b0';
    const privateKey = process.env.LITEAPI_SANDBOX_PRIVATE_KEY || 'sand_eea53275-64a5-4601-a13a-1fd74aef6515';
    
    console.log('🧪 Using LiteAPI Sandbox environment');
    return { publicKey, privateKey };
  }
};

// Types
export interface LiteAPISearchParams {
  destination: string;
  destinationType: 'city' | 'hotel' | 'airport' | 'coordinates';
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children?: number;
  childrenAges?: number[];
  rooms: number;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number[];
  amenities?: string[];
  guestRating?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'stars';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface LiteAPIError {
  error: string;
  message: string;
  code?: string;
  details?: any;
}

export interface LiteAPIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  metadata?: {
    totalResults: number;
    currentPage: number;
    totalPages: number;
    searchId: string;
    currency: string;
    timestamp: string;
  };
}

// HTTP Client with retry logic
class LiteAPIClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
  }

  private getHeaders(usePrivateKey = false): Record<string, string> {
    const keys = config.getKeys();
    const apiKey = usePrivateKey ? keys.privateKey : keys.publicKey;
    
    return {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'User-Agent': 'Fly2Any-Hotel-System/1.0',
      'Accept': 'application/json'
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    usePrivateKey = false,
    attempt = 1
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.getHeaders(usePrivateKey),
      ...options.headers
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.timeout)
    };

    try {
      console.log(`[LiteAPI] ${options.method || 'GET'} ${endpoint} (attempt ${attempt})`);
      
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData: LiteAPIError;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            error: `HTTP ${response.status}`,
            message: errorText || response.statusText
          };
        }

        // Check if we should retry
        if (this.shouldRetry(response.status) && attempt < this.retryAttempts) {
          console.log(`[LiteAPI] Retrying request (${attempt}/${this.retryAttempts}) after ${this.retryDelay}ms`);
          await this.sleep(this.retryDelay * attempt); // Exponential backoff
          return this.makeRequest<T>(endpoint, options, usePrivateKey, attempt + 1);
        }

        throw new Error(`LiteAPI Error: ${errorData.message || errorData.error || JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log(`[LiteAPI] Success: ${endpoint}`);
      
      return data;

    } catch (error: any) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        if (attempt < this.retryAttempts) {
          console.log(`[LiteAPI] Timeout, retrying (${attempt}/${this.retryAttempts})`);
          await this.sleep(this.retryDelay * attempt);
          return this.makeRequest<T>(endpoint, options, usePrivateKey, attempt + 1);
        }
        throw new Error('LiteAPI request timeout');
      }

      if (attempt < this.retryAttempts && this.isRetryableError(error)) {
        console.log(`[LiteAPI] Error, retrying (${attempt}/${this.retryAttempts}): ${error?.message || 'Unknown error'}`);
        await this.sleep(this.retryDelay * attempt);
        return this.makeRequest<T>(endpoint, options, usePrivateKey, attempt + 1);
      }

      throw error;
    }
  }

  private shouldRetry(status: number): boolean {
    return status >= 500 || status === 429 || status === 408;
  }

  private isRetryableError(error: any): boolean {
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
  }

  // Public API methods

  /**
   * Search for hotels
   */
  async searchHotels(params: LiteAPISearchParams): Promise<LiteAPIResponse<any>> {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    queryParams.append('destination', params.destination);
    queryParams.append('destination_type', params.destinationType);
    queryParams.append('checkin', params.checkIn);
    queryParams.append('checkout', params.checkOut);
    queryParams.append('adults', params.adults.toString());
    queryParams.append('rooms', params.rooms.toString());
    
    // Optional parameters
    if (params.children) queryParams.append('children', params.children.toString());
    if (params.childrenAges?.length) queryParams.append('children_ages', params.childrenAges.join(','));
    if (params.currency) queryParams.append('currency', params.currency);
    if (params.minPrice) queryParams.append('min_price', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('max_price', params.maxPrice.toString());
    if (params.starRating?.length) queryParams.append('star_rating', params.starRating.join(','));
    if (params.guestRating) queryParams.append('guest_rating', params.guestRating.toString());
    if (params.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params.sortOrder) queryParams.append('sort_order', params.sortOrder);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    return this.makeRequest<LiteAPIResponse<any>>(`/hotels/rates?${queryParams}`);
  }

  /**
   * Get hotel details
   */
  async getHotelDetails(hotelId: string, params?: {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    rooms?: number;
    currency?: string;
  }): Promise<LiteAPIResponse<any>> {
    let endpoint = `/hotels/${hotelId}`;
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.checkIn) queryParams.append('checkin', params.checkIn);
      if (params.checkOut) queryParams.append('checkout', params.checkOut);
      if (params.adults) queryParams.append('adults', params.adults.toString());
      if (params.children) queryParams.append('children', params.children.toString());
      if (params.rooms) queryParams.append('rooms', params.rooms.toString());
      if (params.currency) queryParams.append('currency', params.currency);
      
      const query = queryParams.toString();
      if (query) endpoint += `?${query}`;
    }

    return this.makeRequest<LiteAPIResponse<any>>(endpoint);
  }

  /**
   * Get hotel rates
   */
  async getHotelRates(hotelId: string, params: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children?: number;
    rooms: number;
    currency?: string;
  }): Promise<LiteAPIResponse<any>> {
    const queryParams = new URLSearchParams({
      hotel_id: hotelId,
      checkin: params.checkIn,
      checkout: params.checkOut,
      adults: params.adults.toString(),
      rooms: params.rooms.toString()
    });

    if (params.children) queryParams.append('children', params.children.toString());
    if (params.currency) queryParams.append('currency', params.currency);

    return this.makeRequest<LiteAPIResponse<any>>(`/hotels/rates?${queryParams}`);
  }

  /**
   * Pre-book a hotel (get booking token)
   */
  async prebookHotel(rateId: string): Promise<LiteAPIResponse<any>> {
    return this.makeRequest<LiteAPIResponse<any>>(
      `/hotels/book/prebook`,
      {
        method: 'POST',
        body: JSON.stringify({ rate_id: rateId })
      },
      true // Use private key
    );
  }

  /**
   * Confirm hotel booking
   */
  async confirmBooking(prebookId: string, bookingData: {
    guests: Array<{
      title: string;
      firstName: string;
      lastName: string;
      isMainGuest?: boolean;
    }>;
    contact: {
      email: string;
      phone: string;
    };
    specialRequests?: string;
  }): Promise<LiteAPIResponse<any>> {
    return this.makeRequest<LiteAPIResponse<any>>(
      `/hotels/book/confirm`,
      {
        method: 'POST',
        body: JSON.stringify({
          prebook_id: prebookId,
          guests: bookingData.guests,
          contact: bookingData.contact,
          special_requests: bookingData.specialRequests
        })
      },
      true // Use private key
    );
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string): Promise<LiteAPIResponse<any>> {
    return this.makeRequest<LiteAPIResponse<any>>(
      `/bookings/${bookingId}`,
      {},
      true // Use private key
    );
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<LiteAPIResponse<any>> {
    return this.makeRequest<LiteAPIResponse<any>>(
      `/bookings/${bookingId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ reason })
      },
      true // Use private key
    );
  }

  /**
   * Get popular destinations
   */
  async getPopularDestinations(country?: string): Promise<LiteAPIResponse<any>> {
    const queryParams = new URLSearchParams();
    if (country) queryParams.append('country', country);

    return this.makeRequest<LiteAPIResponse<any>>(`/destinations/popular?${queryParams}`);
  }

  /**
   * Search destinations
   */
  async searchDestinations(query: string): Promise<LiteAPIResponse<any>> {
    const queryParams = new URLSearchParams({
      q: query,
      limit: '10'
    });

    return this.makeRequest<LiteAPIResponse<any>>(`/destinations/search?${queryParams}`);
  }

  /**
   * Get static hotel content
   */
  async getHotelContent(hotelId: string): Promise<LiteAPIResponse<any>> {
    return this.makeRequest<LiteAPIResponse<any>>(`/hotels/${hotelId}/content`);
  }

  /**
   * Get hotel reviews
   */
  async getHotelReviews(hotelId: string, limit = 10): Promise<LiteAPIResponse<any>> {
    const queryParams = new URLSearchParams({
      limit: limit.toString()
    });

    return this.makeRequest<LiteAPIResponse<any>>(`/hotels/${hotelId}/reviews?${queryParams}`);
  }

  /**
   * Get hotel facilities
   */
  async getHotelFacilities(): Promise<LiteAPIResponse<any>> {
    return this.makeRequest<LiteAPIResponse<any>>('/data/facilities');
  }

  /**
   * Get hotel chains
   */
  async getHotelChains(): Promise<LiteAPIResponse<any>> {
    return this.makeRequest<LiteAPIResponse<any>>('/data/chains');
  }

  /**
   * Get hotel types
   */
  async getHotelTypes(): Promise<LiteAPIResponse<any>> {
    return this.makeRequest<LiteAPIResponse<any>>('/data/types');
  }

  /**
   * Search hotels semantically by text
   */
  async searchHotelsSemantics(query: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<LiteAPIResponse<any>> {
    const queryParams = new URLSearchParams({
      q: query
    });
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.makeRequest<LiteAPIResponse<any>>(`/data/hotels/search?${queryParams}`);
  }

  /**
   * Get minimum rates for hotels
   */
  async getMinimumRates(params: {
    hotelIds: string[];
    checkIn: string;
    checkOut: string;
    adults: number;
    children?: number;
    currency?: string;
  }): Promise<LiteAPIResponse<any>> {
    const queryParams = new URLSearchParams({
      hotel_ids: params.hotelIds.join(','),
      checkin: params.checkIn,
      checkout: params.checkOut,
      adults: params.adults.toString()
    });

    if (params.children) queryParams.append('children', params.children.toString());
    if (params.currency) queryParams.append('currency', params.currency);

    return this.makeRequest<LiteAPIResponse<any>>(`/hotels/rates/minimum?${queryParams}`);
  }
}

// Singleton instance
export const liteApiClient = new LiteAPIClient();

// Cache for static data
const staticDataCache = new Map<string, { data: any; timestamp: number }>();
const STATIC_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Helper function to get cached static data
export async function getCachedStaticData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = staticDataCache.get(key);
  if (cached && Date.now() - cached.timestamp < STATIC_CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  staticDataCache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Validation schemas
export const searchParamsSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  destinationType: z.enum(['city', 'hotel', 'airport', 'coordinates']).default('city'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid check-in date format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid check-out date format'),
  adults: z.number().min(1, 'At least 1 adult required').max(8, 'Maximum 8 adults'),
  children: z.number().min(0).max(8).optional(),
  childrenAges: z.array(z.number().min(0).max(17)).optional(),
  rooms: z.number().min(1, 'At least 1 room required').max(5, 'Maximum 5 rooms'),
  currency: z.string().length(3).default('USD'),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  starRating: z.array(z.number().min(1).max(5)).optional(),
  guestRating: z.number().min(1).max(10).optional(),
  sortBy: z.enum(['price', 'rating', 'distance', 'stars']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
}).refine(data => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut']
}).refine(data => {
  const checkIn = new Date(data.checkIn);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkIn >= today;
}, {
  message: 'Check-in date must be today or later',
  path: ['checkIn']
});

// Helper function to validate search params
export function validateSearchParams(params: any): LiteAPISearchParams {
  return searchParamsSchema.parse(params);
}

export default liteApiClient;