/**
 * Duffel Stays API Client
 *
 * Complete integration for Duffel Stays - hotel booking service
 * 1.5M+ properties worldwide with commission-based pricing
 *
 * Revenue Model:
 * - Commission-based: Earn on every booking
 * - No upfront costs
 * - Average $150 per hotel booking
 *
 * Documentation: https://duffel.com/docs/api/stays
 */

import { Duffel } from '@duffel/api';

export interface HotelSearchLocation {
  lat: number;
  lng: number;
}

export interface HotelSearchLocationQuery {
  query: string;
}

export interface HotelGuestInfo {
  adults: number;
  children?: number[];
}

export interface HotelSearchParams {
  location: HotelSearchLocation | HotelSearchLocationQuery;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: HotelGuestInfo;
  radius?: number; // km (default: 5km, max: 50km)
  limit?: number; // max results (default: 20, max: 100)
  // Filters
  minRating?: number; // 1-5 stars
  maxRating?: number;
  minPrice?: number;
  maxPrice?: number;
  currency?: string; // USD, EUR, GBP, etc.
  amenities?: string[]; // wifi, pool, parking, gym, spa, restaurant, etc.
  propertyTypes?: string[]; // hotel, apartment, hostel, resort, villa
}

export interface AccommodationSuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'city' | 'hotel' | 'landmark' | 'airport';
}

// Popular city coordinates for hotel searches
// Used as fallback when Duffel SDK suggestions endpoint is unavailable
const POPULAR_CITIES: Record<string, AccommodationSuggestion> = {
  'times square': { id: 'nyc-times-square', name: 'Times Square', city: 'New York', country: 'United States', location: { lat: 40.7580, lng: -73.9855 }, type: 'landmark' },
  'new york': { id: 'nyc', name: 'New York', city: 'New York', country: 'United States', location: { lat: 40.7128, lng: -74.0060 }, type: 'city' },
  'manhattan': { id: 'nyc-manhattan', name: 'Manhattan', city: 'New York', country: 'United States', location: { lat: 40.7831, lng: -73.9712 }, type: 'city' },
  'south beach': { id: 'mia-south-beach', name: 'South Beach', city: 'Miami', country: 'United States', location: { lat: 25.7907, lng: -80.1300 }, type: 'landmark' },
  'miami': { id: 'mia', name: 'Miami', city: 'Miami', country: 'United States', location: { lat: 25.7617, lng: -80.1918 }, type: 'city' },
  'downtown la': { id: 'lax-downtown', name: 'Downtown LA', city: 'Los Angeles', country: 'United States', location: { lat: 34.0522, lng: -118.2437 }, type: 'landmark' },
  'los angeles': { id: 'lax', name: 'Los Angeles', city: 'Los Angeles', country: 'United States', location: { lat: 34.0522, lng: -118.2437 }, type: 'city' },
  'toronto': { id: 'yyz', name: 'Toronto', city: 'Toronto', country: 'Canada', location: { lat: 43.6532, lng: -79.3832 }, type: 'city' },
  'cancun': { id: 'cun', name: 'Cancún', city: 'Cancún', country: 'Mexico', location: { lat: 21.1619, lng: -86.8515 }, type: 'city' },
  'paris': { id: 'par', name: 'Paris', city: 'Paris', country: 'France', location: { lat: 48.8566, lng: 2.3522 }, type: 'city' },
  'rome': { id: 'rom', name: 'Rome', city: 'Rome', country: 'Italy', location: { lat: 41.9028, lng: 12.4964 }, type: 'city' },
  'barcelona': { id: 'bcn', name: 'Barcelona', city: 'Barcelona', country: 'Spain', location: { lat: 41.3851, lng: 2.1734 }, type: 'city' },
  'london': { id: 'lon', name: 'London', city: 'London', country: 'United Kingdom', location: { lat: 51.5074, lng: -0.1278 }, type: 'city' },
  'madrid': { id: 'mad', name: 'Madrid', city: 'Madrid', country: 'Spain', location: { lat: 40.4168, lng: -3.7038 }, type: 'city' },
  'amsterdam': { id: 'ams', name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', location: { lat: 52.3676, lng: 4.9041 }, type: 'city' },
  'tokyo': { id: 'tyo', name: 'Tokyo', city: 'Tokyo', country: 'Japan', location: { lat: 35.6762, lng: 139.6503 }, type: 'city' },
  'singapore': { id: 'sin', name: 'Singapore', city: 'Singapore', country: 'Singapore', location: { lat: 1.3521, lng: 103.8198 }, type: 'city' },
  'dubai': { id: 'dxb', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', location: { lat: 25.2048, lng: 55.2708 }, type: 'city' },
  'sydney': { id: 'syd', name: 'Sydney', city: 'Sydney', country: 'Australia', location: { lat: -33.8688, lng: 151.2093 }, type: 'city' },
};

export interface RoomGuest {
  title?: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr';
  givenName: string;
  familyName: string;
  bornOn?: string; // YYYY-MM-DD (required for children)
  type: 'adult' | 'child';
}

export interface CreateQuoteParams {
  rateId: string;
  guests: RoomGuest[];
}

export interface BookingPayment {
  type: 'balance' | 'card';
  currency: string;
  amount: string;
  // For card payments
  card?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    holderName: string;
  };
}

export interface CreateBookingParams {
  quoteId: string;
  payment: BookingPayment;
  guests: RoomGuest[];
  email: string;
  phoneNumber: string;
}

class DuffelStaysAPI {
  private client: Duffel;
  private isInitialized: boolean = false;

  constructor() {
    const token = process.env.DUFFEL_ACCESS_TOKEN;

    if (!token) {
      console.warn('⚠️  DUFFEL_ACCESS_TOKEN not set - Duffel Stays API will not be available');
      this.isInitialized = false;
      // Create dummy client to prevent crashes
      this.client = new Duffel({ token: 'dummy' });
    } else {
      this.client = new Duffel({ token });
      this.isInitialized = true;
      console.log('✅ Duffel Stays API initialized');
    }
  }

  /**
   * Check if Duffel Stays API is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Search Accommodations
   *
   * Search for hotels by location (coordinates or query), check-in/out dates, and guests.
   * Returns list of available accommodations with rates and amenities.
   *
   * @param params - Search parameters
   * @returns Array of accommodations with availability and pricing
   */
  async searchAccommodations(params: HotelSearchParams) {
    if (!this.isInitialized) {
      console.warn('⚠️  Duffel Stays API not initialized - skipping');
      return { data: [], meta: { count: 0 } };
    }

    try {
      console.log('🏨 Searching Duffel Stays API:', params);

      // Build location parameter
      let location: any;
      if ('lat' in params.location && 'lng' in params.location) {
        location = {
          geographic_coordinates: {
            latitude: params.location.lat,
            longitude: params.location.lng,
          },
          radius: params.radius || 5, // Default 5km
        };
      } else if ('query' in params.location) {
        // For query-based search, we need to use suggestions first
        const suggestions = await this.getAccommodationSuggestions(params.location.query);

        if (!suggestions.data || suggestions.data.length === 0) {
          console.log('⚠️  No location found for query:', params.location.query);
          return { data: [], meta: { count: 0, error: 'Location not found' } };
        }

        // Use first suggestion's coordinates
        const firstSuggestion = suggestions.data[0];
        location = {
          geographic_coordinates: {
            latitude: firstSuggestion.location.lat,
            longitude: firstSuggestion.location.lng,
          },
          radius: params.radius || 5,
        };
      }

      // Build guests array according to Duffel API spec
      // API expects: [{ type: "adult" }, { type: "adult" }, { type: "child", age: 5 }]
      const guests: any[] = [];

      // Add adults
      for (let i = 0; i < params.guests.adults; i++) {
        guests.push({ type: 'adult' });
      }

      // Add children with ages if provided
      if (params.guests.children && params.guests.children.length > 0) {
        params.guests.children.forEach((childAge: number) => {
          guests.push({ type: 'child', age: childAge });
        });
      }

      // Number of rooms (simplified - using 1 room for now)
      const roomsCount = 1;

      console.log(`   Guests: ${guests.length} (${params.guests.adults} adults, ${params.guests.children?.length || 0} children)`);

      // Prepare search payload
      const searchPayload = {
        location,
        check_in_date: params.checkIn,
        check_out_date: params.checkOut,
        rooms: roomsCount,
        guests,
      };

      // Log the EXACT payload we're sending to Duffel SDK
      console.log('📤 Duffel SDK Request Payload:', JSON.stringify(searchPayload, null, 2));

      // Create accommodation search request with CORRECT parameter format
      const searchRequest = await this.client.stays.search(searchPayload as any);

      // SDK types are incomplete - actual API returns array in data
      const searchData = (searchRequest as any).data as any[];

      console.log(`✅ Duffel Stays returned ${searchData.length} accommodations`);

      // Apply filters if provided
      let filteredResults = searchData;

      // Filter by star rating
      if (params.minRating !== undefined || params.maxRating !== undefined) {
        filteredResults = filteredResults.filter((acc: any) => {
          const rating = acc.star_rating || 0;
          const meetsMin = params.minRating === undefined || rating >= params.minRating;
          const meetsMax = params.maxRating === undefined || rating <= params.maxRating;
          return meetsMin && meetsMax;
        });
      }

      // Filter by price
      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        filteredResults = filteredResults.filter((acc: any) => {
          // Get lowest rate price
          const lowestRate = acc.rates?.reduce((min: any, rate: any) => {
            const ratePrice = parseFloat(rate.total_amount);
            const minPrice = min ? parseFloat(min.total_amount) : Infinity;
            return ratePrice < minPrice ? rate : min;
          }, null);

          if (!lowestRate) return false;

          const price = parseFloat(lowestRate.total_amount);
          const meetsMin = params.minPrice === undefined || price >= params.minPrice;
          const meetsMax = params.maxPrice === undefined || price <= params.maxPrice;
          return meetsMin && meetsMax;
        });
      }

      // Filter by amenities
      if (params.amenities && params.amenities.length > 0) {
        filteredResults = filteredResults.filter((acc: any) => {
          const accAmenities = (acc.amenities || []).map((a: any) => a.toLowerCase());
          return params.amenities!.every(amenity =>
            accAmenities.some((a: string) => a.includes(amenity.toLowerCase()))
          );
        });
      }

      // Filter by property type
      if (params.propertyTypes && params.propertyTypes.length > 0) {
        filteredResults = filteredResults.filter((acc: any) => {
          const propertyType = (acc.property_type || '').toLowerCase();
          return params.propertyTypes!.some(type =>
            propertyType.includes(type.toLowerCase())
          );
        });
      }

      console.log(`📋 After filtering: ${filteredResults.length} accommodations`);

      return {
        data: filteredResults,
        meta: {
          count: filteredResults.length,
          source: 'Duffel Stays',
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
      console.error('❌ Duffel Stays API error:');
      console.error('   Error type:', error.constructor.name);
      console.error('   Error message:', error.message || 'No message');

      // Extract HTTP status and response if available
      if (error.meta) {
        console.error('   HTTP Status:', error.meta.status);
        console.error('   Request ID:', error.meta.request_id);
      }

      if (error.errors && Array.isArray(error.errors)) {
        console.error('   API Errors:', JSON.stringify(error.errors, null, 2));
      }

      // Log headers to check rate limits
      if (error.headers) {
        const headers = error.headers;
        const headerObj: any = {};
        if (typeof headers.get === 'function') {
          headerObj['ratelimit-remaining'] = headers.get('ratelimit-remaining');
          headerObj['ratelimit-reset'] = headers.get('ratelimit-reset');
          headerObj['content-type'] = headers.get('content-type');
        }
        console.error('   Headers:', headerObj);
      }

      console.error('   Full error object:', JSON.stringify({
        name: error.name,
        message: error.message,
        meta: error.meta,
        errors: error.errors,
      }, null, 2));

      // Return empty results on error
      return {
        data: [],
        meta: {
          count: 0,
          error: error.message || error.toString() || 'Unknown Duffel API error',
        },
      };
    }
  }

  /**
   * Get Single Accommodation Details
   *
   * Fetch detailed information about a specific accommodation including
   * all available rooms, rates, amenities, photos, and reviews.
   *
   * @param accommodationId - Duffel accommodation ID
   * @returns Detailed accommodation information
   */
  async getAccommodation(accommodationId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel Stays API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`🏨 Fetching accommodation details: ${accommodationId}`);

      // SDK uses 'accommodation' (singular) not 'accommodations'
      const accommodation = await (this.client.stays as any).accommodation.get(accommodationId);

      console.log('✅ Accommodation details retrieved');
      console.log(`   Name: ${accommodation.data.name}`);
      console.log(`   Rating: ${accommodation.data.star_rating || 'N/A'} stars`);
      console.log(`   Available Rates: ${accommodation.data.rates?.length || 0}`);

      return accommodation;
    } catch (error: any) {
      console.error('❌ Error fetching accommodation:', error.message);
      throw new Error(`Failed to fetch accommodation: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get Accommodation Suggestions (Autocomplete)
   *
   * Search for locations, cities, hotels, landmarks, or airports.
   * Used for autocomplete when users type a destination.
   *
   * NOTE: Duffel SDK doesn't expose suggestions endpoint, so we use hardcoded popular cities
   *
   * @param query - Search query (e.g., "Paris", "Hilton London", "CDG Airport")
   * @param radius - Search radius in km (optional)
   * @returns Array of location suggestions
   */
  async getAccommodationSuggestions(query: string, radius?: number): Promise<{
    data: AccommodationSuggestion[];
    meta: { count: number };
  }> {
    if (!this.isInitialized) {
      console.warn('⚠️  Duffel Stays API not initialized - skipping');
      return { data: [], meta: { count: 0 } };
    }

    try {
      console.log(`🔍 Searching location suggestions: "${query}"`);

      // Use hardcoded popular cities mapping (SDK doesn't expose suggestions endpoint)
      const queryLower = query.toLowerCase().trim();

      // Direct match
      if (POPULAR_CITIES[queryLower]) {
        console.log(`✅ Found direct match for "${query}"`);
        return {
          data: [POPULAR_CITIES[queryLower]],
          meta: { count: 1 },
        };
      }

      // Fuzzy match - find cities where the query contains the key OR city name
      const matches = Object.entries(POPULAR_CITIES)
        .filter(([key, city]) =>
          queryLower.includes(key) ||
          queryLower.includes(city.name.toLowerCase()) ||
          queryLower.includes(city.city.toLowerCase()) ||
          city.name.toLowerCase().includes(queryLower) ||
          city.city.toLowerCase().includes(queryLower)
        )
        .map(([_, city]) => city);

      if (matches.length > 0) {
        console.log(`✅ Found ${matches.length} fuzzy matches for "${query}"`);
        return {
          data: matches,
          meta: { count: matches.length },
        };
      }

      // No match - return empty
      console.log(`⚠️  No location found for query: "${query}"`);
      return {
        data: [],
        meta: { count: 0 },
      };
    } catch (error: any) {
      console.error('❌ Error fetching suggestions:', error.message);
      return {
        data: [],
        meta: {
          count: 0,
        },
      };
    }
  }

  /**
   * Create Booking Quote
   *
   * Create a quote for a specific rate. This locks in the price
   * for a limited time (typically 15-30 minutes) before booking.
   *
   * IMPORTANT: Always create a quote before booking to ensure:
   * - Current pricing
   * - Availability confirmation
   * - Terms and conditions
   *
   * @param params - Quote parameters (rate ID + guest details)
   * @returns Quote with locked-in price and expiry
   */
  async createQuote(params: CreateQuoteParams) {
    if (!this.isInitialized) {
      throw new Error('Duffel Stays API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log('💰 Creating Duffel Stays quote...');
      console.log(`   Rate ID: ${params.rateId}`);
      console.log(`   Guests: ${params.guests.length}`);

      // Transform guests to Duffel format
      const duffelGuests = params.guests.map((guest, index) => ({
        id: `guest_${index}`,
        title: guest.title || 'mr',
        given_name: guest.givenName.toUpperCase(),
        family_name: guest.familyName.toUpperCase(),
        born_on: guest.bornOn,
        type: guest.type,
      }));

      // SDK types may be incomplete - using type assertion
      const quote = await (this.client.stays.quotes as any).create({
        rate_id: params.rateId,
        guests: duffelGuests,
      });

      const quoteData = (quote as any).data;
      console.log('✅ Quote created successfully!');
      console.log(`   Quote ID: ${quoteData.id}`);
      console.log(`   Total: ${quoteData.total_amount} ${quoteData.total_currency}`);
      console.log(`   Expires: ${quoteData.expires_at || 'N/A'}`);

      return quote;
    } catch (error: any) {
      console.error('❌ Error creating quote:', error.message);

      // Handle specific errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        const notAvailableError = errors.find((e: any) =>
          e.code === 'rate_not_available' ||
          e.title?.toLowerCase().includes('not available')
        );

        if (notAvailableError) {
          throw new Error('RATE_NOT_AVAILABLE: This rate is no longer available. Please search again.');
        }

        const priceChangeError = errors.find((e: any) =>
          e.code === 'price_changed' ||
          e.title?.toLowerCase().includes('price changed')
        );

        if (priceChangeError) {
          throw new Error('PRICE_CHANGED: The price has changed. Please review the new price.');
        }
      }

      throw new Error(`Failed to create quote: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create Booking
   *
   * Complete the hotel booking using a quote ID.
   * This charges the payment method and confirms the reservation.
   *
   * CRITICAL: Revenue-generating endpoint
   * - Commission earned on every booking
   * - Average revenue: $150 per booking
   *
   * Workflow:
   * 1. Search accommodations
   * 2. Create quote (locks price)
   * 3. Create booking (this method)
   *
   * @param params - Booking parameters (quote ID, payment, guests)
   * @returns Booking confirmation with reservation details
   */
  async createBooking(params: CreateBookingParams) {
    if (!this.isInitialized) {
      throw new Error('Duffel Stays API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log('🎫 Creating Duffel Stays booking...');
      console.log(`   Quote ID: ${params.quoteId}`);
      console.log(`   Guests: ${params.guests.length}`);
      console.log(`   Email: ${params.email}`);

      // Transform guests to Duffel format
      const duffelGuests = params.guests.map((guest, index) => ({
        id: `guest_${index}`,
        title: guest.title || 'mr',
        given_name: guest.givenName.toUpperCase(),
        family_name: guest.familyName.toUpperCase(),
        born_on: guest.bornOn,
        type: guest.type,
      }));

      // Build payment object
      let payment: any = {
        type: params.payment.type,
        currency: params.payment.currency,
        amount: params.payment.amount,
      };

      // Add card details if card payment
      if (params.payment.type === 'card' && params.payment.card) {
        payment.card = {
          number: params.payment.card.number,
          expiry_month: params.payment.card.expiryMonth,
          expiry_year: params.payment.card.expiryYear,
          cvc: params.payment.card.cvc,
          holder_name: params.payment.card.holderName,
        };
      }

      const booking = await this.client.stays.bookings.create({
        quote_id: params.quoteId,
        guests: duffelGuests,
        email: params.email,
        phone_number: params.phoneNumber,
        payment,
      });

      console.log('✅ Booking created successfully!');
      console.log(`   Booking ID: ${booking.data.id}`);
      console.log(`   Confirmation: ${booking.data.reference}`);
      console.log(`   Status: ${booking.data.status}`);

      return booking;
    } catch (error: any) {
      console.error('❌ Error creating booking:', error.message);

      // Handle specific errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        const quoteExpiredError = errors.find((e: any) =>
          e.code === 'quote_expired' ||
          e.title?.toLowerCase().includes('expired')
        );

        if (quoteExpiredError) {
          throw new Error('QUOTE_EXPIRED: The quote has expired. Please create a new quote.');
        }

        const paymentFailedError = errors.find((e: any) =>
          e.code === 'payment_failed' ||
          e.title?.toLowerCase().includes('payment')
        );

        if (paymentFailedError) {
          throw new Error('PAYMENT_FAILED: Payment was declined. Please check your payment details.');
        }

        const notAvailableError = errors.find((e: any) =>
          e.code === 'not_available' ||
          e.title?.toLowerCase().includes('not available')
        );

        if (notAvailableError) {
          throw new Error('NOT_AVAILABLE: This accommodation is no longer available.');
        }
      }

      throw new Error(`Failed to create booking: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get Booking Details
   *
   * Retrieve booking information by ID.
   * Includes reservation details, guest info, and current status.
   *
   * @param bookingId - Duffel booking ID
   * @returns Booking details
   */
  async getBooking(bookingId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel Stays API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`🔍 Retrieving booking: ${bookingId}`);

      const booking = await this.client.stays.bookings.get(bookingId);

      console.log('✅ Booking retrieved successfully');
      console.log(`   Status: ${booking.data.status}`);
      console.log(`   Reference: ${booking.data.reference}`);

      return booking;
    } catch (error: any) {
      console.error('❌ Error retrieving booking:', error.message);
      throw new Error(`Failed to retrieve booking: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Cancel Booking
   *
   * Request cancellation of a hotel booking.
   * Returns cancellation details including refund amount.
   *
   * Note: Cancellation policies vary by property and rate.
   * Some bookings may be non-refundable.
   *
   * @param bookingId - Duffel booking ID
   * @returns Cancellation confirmation with refund details
   */
  async cancelBooking(bookingId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel Stays API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`🚫 Cancelling booking: ${bookingId}`);

      // Get booking first to check status
      const booking = await this.client.stays.bookings.get(bookingId);

      if (booking.data.status === 'cancelled') {
        throw new Error('ALREADY_CANCELLED: This booking has already been cancelled');
      }

      // Request cancellation - SDK types may be incomplete
      const cancellation = await (this.client.stays as any).cancellations.create({
        booking_id: bookingId,
      });

      console.log('✅ Booking cancelled successfully');
      console.log(`   Cancellation ID: ${cancellation.data.id}`);
      console.log(`   Refund: ${cancellation.data.refund_amount} ${cancellation.data.refund_currency}`);

      return cancellation;
    } catch (error: any) {
      console.error('❌ Error cancelling booking:', error.message);

      // Handle specific errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        const notCancellableError = errors.find((e: any) =>
          e.code === 'not_cancellable' ||
          e.title?.toLowerCase().includes('cannot be cancelled')
        );

        if (notCancellableError) {
          throw new Error('NOT_CANCELLABLE: This booking cannot be cancelled. It may be non-refundable.');
        }

        const alreadyCancelledError = errors.find((e: any) =>
          e.code === 'already_cancelled' ||
          e.title?.toLowerCase().includes('already cancelled')
        );

        if (alreadyCancelledError) {
          throw new Error('ALREADY_CANCELLED: This booking has already been cancelled');
        }
      }

      throw new Error(`Failed to cancel booking: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Helper: Format phone number to E.164 format
   * Required by Duffel API
   *
   * @param phone - Phone number in any format
   * @returns Phone number in E.164 format (+1234567890)
   */
  private formatPhoneNumber(phone: string): string {
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length >= 10) {
      if (digitsOnly.length === 10) {
        return `+1${digitsOnly}`;
      }
      return `+${digitsOnly}`;
    }

    return '+11234567890'; // Fallback
  }
}

// Export singleton instance
export const duffelStaysAPI = new DuffelStaysAPI();

// Export class for testing
export { DuffelStaysAPI };
