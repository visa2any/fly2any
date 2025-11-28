/**
 * Hotelbeds APItude Hotel Booking API Integration
 *
 * Documentation: https://developer.hotelbeds.com/documentation/hotels/booking-api/
 *
 * Authentication: SHA256 signature (API Key + Secret + Timestamp)
 * Workflow: Search Hotels → Check Rates (if RECHECK) → Book
 */

import crypto from 'crypto';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Get Hotelbeds credentials from environment
 */
function getCredentials() {
  const apiKey = process.env.HOTELBEDS_API_KEY;
  const secret = process.env.HOTELBEDS_SECRET;
  const baseUrl = process.env.HOTELBEDS_BASE_URL || 'https://api.test.hotelbeds.com';

  if (!apiKey || !secret) {
    throw new Error('Hotelbeds API credentials not configured. Set HOTELBEDS_API_KEY and HOTELBEDS_SECRET in environment.');
  }

  return { apiKey, secret, baseUrl };
}

/**
 * Generate X-Signature for Hotelbeds authentication
 * Formula: SHA256(apiKey + secret + timestamp)
 */
function generateSignature(apiKey: string, secret: string): { signature: string; timestamp: number } {
  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
  const signatureString = `${apiKey}${secret}${timestamp}`;
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

  return { signature, timestamp };
}

/**
 * Create authenticated Hotelbeds API client
 */
function createHotelbedsClient(): AxiosInstance {
  const { apiKey, secret, baseUrl } = getCredentials();

  const client = axios.create({
    baseURL: `${baseUrl}/hotel-api/1.0`,
    timeout: 30000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Add authentication headers to every request
  client.interceptors.request.use((config) => {
    const { signature, timestamp } = generateSignature(apiKey, secret);

    config.headers['Api-key'] = apiKey;
    config.headers['X-Signature'] = signature;

    console.log(`🔐 Hotelbeds Auth - Timestamp: ${timestamp}, Signature: ${signature.substring(0, 16)}...`);

    return config;
  });

  return client;
}

// Types based on Hotelbeds API documentation
export interface HotelbedsSearchParams {
  stay: {
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
  };
  occupancies: Array<{
    rooms: number;
    adults: number;
    children: number;
    paxes?: Array<{ type: 'AD' | 'CH'; age?: number }>;
  }>;
  hotels?: {
    hotel?: number[];
  };
  destination?: {
    code: string; // Destination code
  };
  geolocation?: {
    latitude: number;
    longitude: number;
    radius: number; // In kilometers
    unit: 'km' | 'mi';
  };
  filter?: {
    minRate?: number;
    maxRate?: number;
    minCategory?: number;
    maxCategory?: number;
  };
  boards?: {
    board?: string[];
  };
  rooms?: {
    room?: string[];
  };
  dailyRate?: boolean;
  language?: string;
}

export interface HotelbedsRate {
  rateKey: string;
  rateClass: string;
  rateType: 'BOOKABLE' | 'RECHECK';
  net: number;
  sellingRate?: number;
  hotelMandatory?: boolean;
  allotment?: number;
  paymentType: string;
  packaging?: boolean;
  boardCode: string;
  boardName: string;
  cancellationPolicies?: Array<{
    amount: number;
    from: string;
  }>;
  rooms: number;
  adults: number;
  children: number;
}

export interface HotelbedsHotel {
  code: number;
  name: string;
  categoryCode: string;
  categoryName: string;
  destinationCode: string;
  destinationName: string;
  zoneCode?: number;
  zoneName?: string;
  latitude: string;
  longitude: string;
  rooms: Array<{
    code: string;
    name: string;
    rates: HotelbedsRate[];
  }>;
  minRate?: number;
  maxRate?: number;
  currency: string;
}

export interface HotelbedsSearchResponse {
  hotels: {
    hotels: HotelbedsHotel[];
    total: number;
    checkIn: string;
    checkOut: string;
  };
  auditData: {
    processTime: string;
    timestamp: string;
    requestHost: string;
    serverId: string;
    environment: string;
    release: string;
    token: string;
  };
}

export interface HotelbedsError {
  code: string;
  message: string;
}

/**
 * Search for available hotels
 *
 * @param params Search parameters
 * @returns Hotel availability results
 */
export async function searchHotels(params: HotelbedsSearchParams): Promise<HotelbedsSearchResponse> {
  try {
    const client = createHotelbedsClient();

    console.log('🏨 Hotelbeds Search Request:', JSON.stringify(params, null, 2));

    const response = await client.post<HotelbedsSearchResponse>('/hotels', params);

    const { data } = response;

    console.log(`✅ Hotelbeds returned ${data.hotels?.hotels?.length || 0} hotels`);
    console.log(`⏱️ Process time: ${data.auditData?.processTime}ms`);

    return data;

  } catch (error: any) {
    console.error('❌ Hotelbeds API Error:', error.response?.data || error.message);

    if (error.response?.data?.error) {
      const apiError = error.response.data.error as HotelbedsError;
      throw new Error(`Hotelbeds API Error [${apiError.code}]: ${apiError.message}`);
    }

    throw error;
  }
}

/**
 * Check/validate rates for RECHECK type rates
 *
 * @param rateKeys Array of rate keys to validate
 * @returns Updated rate information
 */
export async function checkRates(rateKeys: string[]): Promise<any> {
  try {
    const client = createHotelbedsClient();

    const response = await client.post('/checkrates', {
      rooms: rateKeys.map(key => ({ rateKey: key }))
    });

    return response.data;

  } catch (error: any) {
    console.error('❌ Hotelbeds CheckRates Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a hotel booking
 *
 * @param bookingData Booking information
 * @returns Booking confirmation
 */
export async function createBooking(bookingData: any): Promise<any> {
  try {
    const client = createHotelbedsClient();

    const response = await client.post('/bookings', bookingData);

    return response.data;

  } catch (error: any) {
    console.error('❌ Hotelbeds Booking Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get booking details
 *
 * @param bookingId Booking reference
 * @returns Booking details
 */
export async function getBooking(bookingId: string): Promise<any> {
  try {
    const client = createHotelbedsClient();

    const response = await client.get(`/bookings/${bookingId}`);

    return response.data;

  } catch (error: any) {
    console.error('❌ Hotelbeds Get Booking Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Cancel a booking
 *
 * @param bookingId Booking reference
 * @returns Cancellation confirmation
 */
export async function cancelBooking(bookingId: string): Promise<any> {
  try {
    const client = createHotelbedsClient();

    const response = await client.delete(`/bookings/${bookingId}`);

    return response.data;

  } catch (error: any) {
    console.error('❌ Hotelbeds Cancel Booking Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Convert Hotelbeds hotel to normalized format
 */
export function normalizeHotelbedsHotel(hotel: HotelbedsHotel, checkin: string, checkout: string): any {
  // Calculate nights
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));

  // Find best rate
  let bestRate: HotelbedsRate | null = null;
  let minPrice = Infinity;

  hotel.rooms.forEach(room => {
    room.rates.forEach(rate => {
      if (rate.net < minPrice) {
        minPrice = rate.net;
        bestRate = rate;
      }
    });
  });

  return {
    id: `hotelbeds-${hotel.code}`,
    provider: 'hotelbeds',
    providerHotelId: hotel.code.toString(),
    name: hotel.name,
    rating: parseInt(hotel.categoryCode) || 0,
    reviewScore: 0, // Hotelbeds doesn't provide reviews in availability
    reviewCount: 0,
    location: {
      address: hotel.destinationName,
      city: hotel.destinationName,
      country: '',
      latitude: parseFloat(hotel.latitude),
      longitude: parseFloat(hotel.longitude),
      zone: hotel.zoneName,
    },
    images: [], // Would need Content API for images
    amenities: [], // Would need Content API for amenities
    price: {
      total: minPrice,
      perNight: minPrice / nights,
      currency: hotel.currency,
      breakdown: [],
    },
    lowestPricePerNight: minPrice / nights,
    rooms: hotel.rooms.map(room => ({
      id: room.code,
      name: room.name,
      rates: room.rates.map(rate => ({
        rateKey: rate.rateKey,
        roomType: room.name,
        boardType: rate.boardCode,
        boardName: rate.boardName,
        totalPrice: rate.net,
        pricePerNight: rate.net / nights,
        currency: hotel.currency,
        refundable: rate.cancellationPolicies && rate.cancellationPolicies.length > 0,
        cancellationPolicies: rate.cancellationPolicies,
        maxOccupancy: rate.adults + rate.children,
        paymentType: rate.paymentType,
        rateType: rate.rateType,
        allotment: rate.allotment,
      }))
    })),
  };
}

export default {
  searchHotels,
  checkRates,
  createBooking,
  getBooking,
  cancelBooking,
  normalizeHotelbedsHotel,
};
