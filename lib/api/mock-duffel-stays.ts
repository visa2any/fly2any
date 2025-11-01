/**
 * MOCK DUFFEL STAYS API
 * Perfect simulation of Duffel Stays API for development without API access
 *
 * Features:
 * - Identical interface to real DuffelStaysAPI
 * - Realistic delays (simulate network)
 * - Complete filtering and search logic
 * - Easy swap with real API via feature flags
 */

import { MOCK_HOTELS, getMockHotelsByLocation, getMockHotelsByCity, getMockHotelById, type MockHotel } from '@/lib/mock-data/hotels';
import type {
  HotelSearchParams,
  AccommodationSuggestion,
  CreateQuoteParams,
  CreateBookingParams,
  RoomGuest,
} from '@/lib/api/duffel-stays';

/**
 * Simulate network delay for realistic UX testing
 */
const simulateDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class MockDuffelStaysAPI {
  private isInitialized: boolean = true; // Always available

  /**
   * Check if Mock API is available (always true)
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Search Accommodations (Mock Implementation)
   */
  async searchAccommodations(params: HotelSearchParams) {
    console.log('🏨 [MOCK] Searching hotels:', params);

    // Simulate API delay (realistic UX)
    await simulateDelay(800);

    try {
      let results: MockHotel[] = [];

      // Determine search location
      if ('lat' in params.location && 'lng' in params.location) {
        // Location-based search
        const radius = params.radius || 10;
        results = getMockHotelsByLocation(
          params.location.lat,
          params.location.lng,
          radius
        );
      } else if ('query' in params.location) {
        // Query-based search
        results = getMockHotelsByCity(params.location.query);
      }

      // Apply filters
      let filteredResults = results;

      // Filter by star rating
      if (params.minRating !== undefined || params.maxRating !== undefined) {
        filteredResults = filteredResults.filter((hotel) => {
          const rating = hotel.star_rating || 0;
          const meetsMin = params.minRating === undefined || rating >= params.minRating;
          const meetsMax = params.maxRating === undefined || rating <= params.maxRating;
          return meetsMin && meetsMax;
        });
      }

      // Filter by price
      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        filteredResults = filteredResults.filter((hotel) => {
          // Get lowest rate price
          const lowestRate = hotel.rates?.reduce((min, rate) => {
            const ratePrice = parseFloat(rate.total_amount);
            const minPrice = min ? parseFloat(min.total_amount) : Infinity;
            return ratePrice < minPrice ? rate : min;
          }, hotel.rates[0]);

          if (!lowestRate) return false;

          const price = parseFloat(lowestRate.total_amount);
          const meetsMin = params.minPrice === undefined || price >= params.minPrice;
          const meetsMax = params.maxPrice === undefined || price <= params.maxPrice;
          return meetsMin && meetsMax;
        });
      }

      // Filter by amenities
      if (params.amenities && params.amenities.length > 0) {
        filteredResults = filteredResults.filter((hotel) => {
          const hotelAmenities = (hotel.amenities || []).map((a) => a.toLowerCase());
          return params.amenities!.every((amenity) =>
            hotelAmenities.some((a) => a.includes(amenity.toLowerCase()))
          );
        });
      }

      // Filter by property type
      if (params.propertyTypes && params.propertyTypes.length > 0) {
        filteredResults = filteredResults.filter((hotel) => {
          const propertyType = (hotel.property_type || '').toLowerCase();
          return params.propertyTypes!.some((type) =>
            propertyType.includes(type.toLowerCase())
          );
        });
      }

      // Limit results
      filteredResults = filteredResults.slice(0, params.limit || 20);

      console.log(`✅ [MOCK] Found ${filteredResults.length} hotels`);

      return {
        data: filteredResults,
        meta: {
          count: filteredResults.length,
          source: 'Mock Data (Duffel Stays simulation)',
          filters: {
            minRating: params.minRating,
            maxRating: params.maxRating,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            amenities: params.amenities,
            propertyTypes: params.propertyTypes,
          },
        },
      };
    } catch (error: any) {
      console.error('❌ [MOCK] Error searching hotels:', error);
      return {
        data: [],
        meta: {
          count: 0,
          error: error.message || 'Mock API error',
        },
      };
    }
  }

  /**
   * Get Single Accommodation Details (Mock)
   */
  async getAccommodation(accommodationId: string) {
    console.log(`🏨 [MOCK] Fetching hotel: ${accommodationId}`);

    await simulateDelay(400);

    const hotel = getMockHotelById(accommodationId);

    if (!hotel) {
      throw new Error(`Hotel not found: ${accommodationId}`);
    }

    console.log(`✅ [MOCK] Hotel retrieved: ${hotel.name}`);

    return {
      data: hotel,
    };
  }

  /**
   * Get Accommodation Suggestions (Mock Autocomplete)
   */
  async getAccommodationSuggestions(
    query: string,
    radius?: number
  ): Promise<{
    data: AccommodationSuggestion[];
    meta: { count: number };
  }> {
    console.log(`🔍 [MOCK] Searching location suggestions: "${query}"`);

    await simulateDelay(200);

    const queryLower = query.toLowerCase().trim();

    // Popular cities mapping
    const POPULAR_CITIES: Record<string, AccommodationSuggestion> = {
      'miami': { id: 'mia', name: 'Miami', city: 'Miami', country: 'United States', location: { lat: 25.7617, lng: -80.1918 }, type: 'city' },
      'new york': { id: 'nyc', name: 'New York', city: 'New York', country: 'United States', location: { lat: 40.7128, lng: -74.0060 }, type: 'city' },
      'los angeles': { id: 'lax', name: 'Los Angeles', city: 'Los Angeles', country: 'United States', location: { lat: 34.0522, lng: -118.2437 }, type: 'city' },
      'paris': { id: 'par', name: 'Paris', city: 'Paris', country: 'France', location: { lat: 48.8566, lng: 2.3522 }, type: 'city' },
      'london': { id: 'lon', name: 'London', city: 'London', country: 'United Kingdom', location: { lat: 51.5074, lng: -0.1278 }, type: 'city' },
      'dubai': { id: 'dxb', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', location: { lat: 25.2048, lng: 55.2708 }, type: 'city' },
      'tokyo': { id: 'tyo', name: 'Tokyo', city: 'Tokyo', country: 'Japan', location: { lat: 35.6762, lng: 139.6503 }, type: 'city' },
      'barcelona': { id: 'bcn', name: 'Barcelona', city: 'Barcelona', country: 'Spain', location: { lat: 41.3851, lng: 2.1734 }, type: 'city' },
    };

    // Direct match
    if (POPULAR_CITIES[queryLower]) {
      return {
        data: [POPULAR_CITIES[queryLower]],
        meta: { count: 1 },
      };
    }

    // Fuzzy match
    const matches = Object.entries(POPULAR_CITIES)
      .filter(([key, city]) =>
        queryLower.includes(key) ||
        queryLower.includes(city.name.toLowerCase()) ||
        city.name.toLowerCase().includes(queryLower)
      )
      .map(([_, city]) => city);

    console.log(`✅ [MOCK] Found ${matches.length} location suggestions`);

    return {
      data: matches,
      meta: { count: matches.length },
    };
  }

  /**
   * Create Booking Quote (Mock)
   */
  async createQuote(params: CreateQuoteParams) {
    console.log('💰 [MOCK] Creating quote...');
    console.log(`   Rate ID: ${params.rateId}`);
    console.log(`   Guests: ${params.guests.length}`);

    await simulateDelay(600);

    // Find the rate in mock data
    const hotel = MOCK_HOTELS.find(h =>
      h.rates.some(r => r.id === params.rateId)
    );

    if (!hotel) {
      throw new Error('RATE_NOT_AVAILABLE: Rate not found');
    }

    const rate = hotel.rates.find(r => r.id === params.rateId)!;

    const quote = {
      data: {
        id: `quote_mock_${Date.now()}`,
        rate_id: params.rateId,
        total_amount: rate.total_amount,
        total_currency: rate.currency,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        guests: params.guests,
        created_at: new Date().toISOString(),
      },
    };

    console.log('✅ [MOCK] Quote created successfully!');
    console.log(`   Quote ID: ${quote.data.id}`);
    console.log(`   Total: ${quote.data.total_amount} ${quote.data.total_currency}`);

    return quote;
  }

  /**
   * Create Booking (Mock)
   */
  async createBooking(params: CreateBookingParams) {
    console.log('🎫 [MOCK] Creating booking...');
    console.log(`   Quote ID: ${params.quoteId}`);

    await simulateDelay(1000);

    const booking = {
      data: {
        id: `booking_mock_${Date.now()}`,
        reference: `FLY2ANY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'confirmed',
        quote_id: params.quoteId,
        guests: params.guests,
        email: params.email,
        phone_number: params.phoneNumber,
        created_at: new Date().toISOString(),
        payment: params.payment,
      },
    };

    console.log('✅ [MOCK] Booking created successfully!');
    console.log(`   Booking ID: ${booking.data.id}`);
    console.log(`   Reference: ${booking.data.reference}`);

    return booking;
  }

  /**
   * Get Booking Details (Mock)
   */
  async getBooking(bookingId: string) {
    console.log(`🔍 [MOCK] Retrieving booking: ${bookingId}`);

    await simulateDelay(400);

    const booking = {
      data: {
        id: bookingId,
        reference: `FLY2ANY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      },
    };

    console.log('✅ [MOCK] Booking retrieved');
    return booking;
  }

  /**
   * Cancel Booking (Mock)
   */
  async cancelBooking(bookingId: string) {
    console.log(`🚫 [MOCK] Cancelling booking: ${bookingId}`);

    await simulateDelay(500);

    const cancellation = {
      data: {
        id: `cancellation_mock_${Date.now()}`,
        booking_id: bookingId,
        refund_amount: '150.00',
        refund_currency: 'USD',
        status: 'confirmed',
        created_at: new Date().toISOString(),
      },
    };

    console.log('✅ [MOCK] Booking cancelled successfully');
    console.log(`   Refund: ${cancellation.data.refund_amount} ${cancellation.data.refund_currency}`);

    return cancellation;
  }
}

// Export singleton instance
export const mockDuffelStaysAPI = new MockDuffelStaysAPI();

// Export class for testing
export { MockDuffelStaysAPI as default };
