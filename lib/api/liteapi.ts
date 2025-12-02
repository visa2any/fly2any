// LiteAPI Integration for Hotel Search
// Two-step flow: 1) Get hotel list with static data, 2) Get rates for those hotels
import axios, { AxiosError } from 'axios';
import { HotelSearchParams } from '@/lib/hotels/types';
import {
  Guest,
  CreateGuestParams,
  GuestBooking,
  LoyaltyConfig,
  GuestLoyaltyPoints,
  RedeemPointsParams,
  PointsTransaction,
  Voucher,
  CreateVoucherParams,
  ValidateVoucherParams,
  VoucherValidationResult,
  VoucherRedemption,
  WeeklyAnalytics,
  HotelRankings,
  MarketData,
} from './liteapi-types';

interface HotelDetailsParams {
  hotelId: string;
  currency?: string;
}

interface Occupancy {
  adults: number;
  children?: number[];
}

interface LiteAPIHotel {
  id: string;
  name: string;
  hotelDescription?: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  stars: number;
  rating: number;
  reviewCount: number;
  main_photo?: string;
  thumbnail?: string;
  chain?: string;
  currency?: string;
  facilityIds?: number[];
  deletedAt?: string | null;
}

interface LiteAPIRoomRate {
  rateId: string;
  name: string;
  maxOccupancy: number;
  adultCount: number;
  childCount: number;
  boardType: string;
  boardName: string;
  priceType: string;
  retailRate: {
    total: { amount: number; currency: string }[];
    suggestedSellingPrice?: { amount: number; currency: string }[];
  };
  cancellationPolicies: {
    refundableTag: 'RFN' | 'NRFN';
    cancelPolicyInfos?: Array<{
      cancelTime: string;
      amount: number;
      currency: string;
    }>;
  };
}

interface LiteAPIRoomType {
  roomTypeId: string;
  offerId: string;
  rates: LiteAPIRoomRate[];
  offerRetailRate: { amount: number; currency: string };
  suggestedSellingPrice?: { amount: number; currency: string };
}

// ============================================================================
// ENHANCED TYPES FOR NEW FEATURES
// ============================================================================

interface HotelDetailedInfo {
  id: string;
  name: string;
  hotelDescription?: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  stars: number;
  rating: number;
  reviewCount: number;
  main_photo?: string;
  thumbnail?: string;
  chain?: string;
  currency?: string;

  // Hotel Photos - Full gallery from /data/hotel endpoint
  hotelPhotos?: Array<{
    url: string;
    caption?: string;
    category?: string;
  }>;

  // Enhanced details
  checkinCheckoutTimes?: {
    checkin: string;
    checkout: string;
  };
  hotelImportantInformation?: string[];
  hotelFacilities?: string[];
  facilities?: Array<{
    id: number;
    name: string;
    category?: string;
  }>;
}

interface ReviewSentiment {
  overallScore: number;
  totalReviews: number;
  categories: {
    cleanliness?: { score: number; mentions: number };
    service?: { score: number; mentions: number };
    location?: { score: number; mentions: number };
    roomQuality?: { score: number; mentions: number };
    amenities?: { score: number; mentions: number };
    valueForMoney?: { score: number; mentions: number };
    foodAndBeverage?: { score: number; mentions: number };
    overallExperience?: { score: number; mentions: number };
  };
  pros?: string[];
  cons?: string[];
}

interface HotelReview {
  id: string;
  hotelId: string;
  rating: number;
  title?: string;
  comment: string;
  author: {
    name?: string;
    countryCode?: string;
  };
  date: string;
  helpfulCount?: number;
}

interface PlaceSearchResult {
  textForSearch: string;
  placeId: string;
  type: 'city' | 'country' | 'landmark' | 'neighborhood' | 'poi';
  countryCode: string;
  countryName: string;
  cityName?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
}

interface PrebookResponse {
  prebookId: string;
  hotelId: string;
  offerId: string;
  status: 'confirmed' | 'pending' | 'failed';
  price: {
    amount: number;
    currency: string;
  };
  expiresAt: string;
  hotelConfirmationCode?: string;
  // User Payment SDK fields (only present when usePaymentSdk: true)
  secretKey?: string;
  transactionId?: string;
}

interface PrebookOptions {
  /** Enable User Payment SDK flow (customer pays directly via LiteAPI) */
  usePaymentSdk?: boolean;
}

interface BookingResponse {
  bookingId: string;
  reference: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  hotelId: string;
  hotelName: string;

  checkIn: string;
  checkOut: string;

  guest: {
    firstName: string;
    lastName: string;
    email: string;
  };

  price: {
    amount: number;
    currency: string;
    breakdown?: {
      baseAmount: number;
      taxesAmount: number;
      feesAmount?: number;
    };
  };

  cancellationPolicy?: {
    refundable: boolean;
    deadlines?: Array<{
      date: string;
      time: string;
      penaltyAmount: number;
    }>;
  };

  confirmationCode?: string;
  hotelConfirmationCode?: string;
  createdAt: string;
}

interface BookingDetailsResponse {
  booking: BookingResponse;
  hotel: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    phone?: string;
    email?: string;
  };
  room: {
    type: string;
    name: string;
    description?: string;
  };
}

interface CancellationResponse {
  bookingId: string;
  status: 'cancelled';
  cancelledAt: string;
  refundAmount?: number;
  refundCurrency?: string;
  refundStatus?: 'pending' | 'processed' | 'denied';
  cancellationFee?: number;
}

interface NormalizedHotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  stars: number;
  rating: number; // Star rating (1-5 stars)
  reviewScore: number; // Review score (0-10 scale)
  reviewCount: number;
  image: string;
  thumbnail: string;
  images?: Array<{ url: string; alt: string }>; // Full gallery images from /data/hotel endpoint
  amenities?: string[]; // Hotel amenities/facilities
  chain?: string;
  currency: string;
  lowestPrice?: number; // TOTAL price for entire stay
  // Cancellation & board info from best rate
  refundable?: boolean; // true = free cancellation available on cheapest rate
  hasRefundableRate?: boolean; // true = hotel has ANY refundable room option
  lowestRefundablePrice?: number | null; // Lowest refundable rate total price
  refundableCancellationDeadline?: string | null; // Cancellation deadline for refundable rate
  boardType?: string; // BB, RO, HB, FB, AI, etc.
  cancellationDeadline?: string; // ISO date for cancellation deadline
  lowestPricePerNight?: number; // Per-night price
  rooms?: NormalizedRoom[];
  source: 'liteapi';
}

interface NormalizedRoom {
  id: string;
  offerId: string;
  name: string;
  maxOccupancy: number;
  boardType: string;
  boardName: string;
  price: number;
  currency: string;
  refundable: boolean;
  cancellationPolicy?: string;
  rateId: string;
}

class LiteAPI {
  private apiKey: string;
  private baseUrl: string;
  private isSandbox: boolean;

  constructor() {
    this.isSandbox = process.env.LITEAPI_ENVIRONMENT !== 'production';
    this.apiKey = this.isSandbox
      ? process.env.LITEAPI_SANDBOX_PUBLIC_KEY || ''
      : process.env.LITEAPI_PUBLIC_KEY || '';
    this.baseUrl = 'https://api.liteapi.travel/v3.0';

    if (!this.apiKey) {
      console.warn('⚠️ LiteAPI: No API key configured');
    }
  }

  private getHeaders() {
    const masked = this.apiKey ? `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(this.apiKey.length - 4)}` : 'NONE';
    console.log(`🔑 LiteAPI: Using API key: ${masked} (sandbox: ${this.isSandbox})`);

    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Step 1: Get hotel static data by location
   * Supports: latitude/longitude, countryCode, or iataCode
   */
  async getHotelsByLocation(params: {
    latitude?: number;
    longitude?: number;
    countryCode?: string;
    cityName?: string;
    iataCode?: string;
    limit?: number;
    radius?: number;
  }): Promise<{ hotels: LiteAPIHotel[]; hotelIds: string[] }> {
    try {
      const queryParams: Record<string, string | number> = {};

      if (params.latitude !== undefined && params.longitude !== undefined) {
        queryParams.latitude = params.latitude;
        queryParams.longitude = params.longitude;
        // CRITICAL: Add radius for better hotel coverage (minimum 1000 meters per LiteAPI docs)
        // Default to 25km (25000 meters) for major city coverage
        queryParams.radius = params.radius || 25000;
      } else if (params.countryCode) {
        queryParams.countryCode = params.countryCode;
        if (params.cityName) {
          queryParams.cityName = params.cityName;
        }
      } else if (params.iataCode) {
        queryParams.iataCode = params.iataCode;
      }

      if (params.limit) {
        queryParams.limit = params.limit;
      }

      console.log('🔍 LiteAPI: Getting hotels by location', queryParams);

      const response = await axios.get(`${this.baseUrl}/data/hotels`, {
        params: queryParams,
        headers: this.getHeaders(),
        timeout: 30000,
      });

      const hotels = response.data.data || [];
      const hotelIds = response.data.hotelIds || hotels.map((h: LiteAPIHotel) => h.id);

      console.log(`✅ LiteAPI: Found ${hotels.length} hotels`);

      return { hotels, hotelIds };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string }; message?: string }>;
      console.error('❌ LiteAPI: Error getting hotels');
      console.error('Status:', axiosError.response?.status);
      console.error('Response data:', JSON.stringify(axiosError.response?.data, null, 2));
      console.error('Request headers:', JSON.stringify(axiosError.config?.headers, null, 2));
      console.error('Request URL:', axiosError.config?.url);
      console.error('Error message:', axiosError.message);

      const errorMessage = axiosError.response?.data?.error?.message
        || axiosError.response?.data?.message
        || axiosError.message
        || 'Failed to get hotels';

      throw new Error(errorMessage);
    }
  }

  /**
   * Step 2: Get rates for specific hotel IDs
   */
  async getHotelRates(params: {
    hotelIds: string[];
    checkin: string;
    checkout: string;
    occupancies: Occupancy[];
    currency?: string;
    guestNationality?: string;
  }): Promise<Array<{ hotelId: string; roomTypes: LiteAPIRoomType[] }>> {
    try {
      const requestBody = {
        hotelIds: params.hotelIds,
        checkin: params.checkin,
        checkout: params.checkout,
        occupancies: params.occupancies,
        currency: params.currency || 'USD',
        guestNationality: params.guestNationality || 'US',
      };

      console.log('🔍 LiteAPI: Getting rates for', params.hotelIds.length, 'hotels');

      const response = await axios.post(`${this.baseUrl}/hotels/rates`, requestBody, {
        headers: this.getHeaders(),
        timeout: 60000, // Rates endpoint can be slow
      });

      const data = response.data.data || [];
      console.log(`✅ LiteAPI: Got rates for ${data.length} hotels`);

      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting rates:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to get hotel rates');
    }
  }

  /**
   * Get rates for hotels with simplified minimum rate extraction
   * Uses the standard /hotels/rates endpoint and extracts minimum rates
   * This is the CORRECT approach - no separate min-rates endpoint exists in v3.0
   *
   * OPTIMIZATION: Implements batching to prevent timeouts and improve success rate
   */
  async getHotelMinimumRates(params: {
    hotelIds: string[];
    checkin: string;
    checkout: string;
    occupancies: Occupancy[];
    currency?: string;
    guestNationality?: string;
  }): Promise<Array<{ hotelId: string; minimumRate: { amount: number; currency: string }; available: boolean }>> {
    try {
      const BATCH_SIZE = 20; // Process 20 hotels at a time for optimal performance
      const allMinimumRates: Array<{ hotelId: string; minimumRate: { amount: number; currency: string }; available: boolean }> = [];

      console.log(`⚡ LiteAPI: Getting rates for ${params.hotelIds.length} hotels (batched in groups of ${BATCH_SIZE})`);

      // Split hotel IDs into batches
      for (let i = 0; i < params.hotelIds.length; i += BATCH_SIZE) {
        const batchIds = params.hotelIds.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(params.hotelIds.length / BATCH_SIZE);

        console.log(`📦 LiteAPI: Processing batch ${batchNumber}/${totalBatches} (${batchIds.length} hotels)`);

        try {
          const requestBody = {
            hotelIds: batchIds,
            checkin: params.checkin,
            checkout: params.checkout,
            occupancies: params.occupancies,
            currency: params.currency || 'USD',
            guestNationality: params.guestNationality || 'US',
            // CRITICAL PARAMETERS from official Postman collection:
            timeout: 5,        // 5 seconds - allows API more time to find availability
            roomMapping: true, // Enable room mapping for better availability
          };

          // DEBUG: Log first batch request to understand what we're sending
          if (batchNumber === 1) {
            console.log('🔍 DEBUG: First batch request body:', JSON.stringify(requestBody, null, 2));
          }

          // Use the CORRECT endpoint: /hotels/rates (not /hotels/min-rates which doesn't exist)
          const response = await axios.post(`${this.baseUrl}/hotels/rates`, requestBody, {
            headers: this.getHeaders(),
            timeout: 15000, // 15 second timeout per batch
          });

          // DEBUG: Log first batch response
          if (batchNumber === 1) {
            console.log('🔍 DEBUG: First batch response:', JSON.stringify(response.data, null, 2));
          }

          // Check for API error responses
          if (response.data.error) {
            console.warn(`⚠️ LiteAPI: Batch ${batchNumber} error:`, response.data.error);
            if (response.data.error.code === 2001) {
              console.log(`ℹ️ LiteAPI: Batch ${batchNumber} - No availability found`);
              // Add unavailable entries for this batch
              batchIds.forEach(hotelId => {
                allMinimumRates.push({
                  hotelId,
                  minimumRate: { amount: 0, currency: params.currency || 'USD' },
                  available: false
                });
              });
              continue;
            }
            // Continue to next batch on error
            continue;
          }

          const data = response.data.data || [];
          console.log(`✅ LiteAPI: Batch ${batchNumber} returned ${data.length} rates`);

          // Extract minimum rates from this batch
          const batchMinimumRates = data.map((hotelData: any) => {
            const hotelId = hotelData.hotelId;
            const roomTypes = hotelData.roomTypes || [];

            if (roomTypes.length === 0) {
              return { hotelId, minimumRate: { amount: 0, currency: params.currency || 'USD' }, available: false };
            }

            // Find the minimum price across all room types and extract refundable/boardType info
            // Also track if ANY rate is refundable and the lowest refundable price
            let minPrice = Infinity;
            let minRefundablePrice = Infinity;
            let currency = params.currency || 'USD';
            let refundable = false; // Is the CHEAPEST rate refundable?
            let hasRefundableRate = false; // Does this hotel have ANY refundable rate?
            let boardType = 'RO'; // Default to Room Only
            let cancellationDeadline: string | undefined;
            let refundableCancellationDeadline: string | undefined;

            for (const roomType of roomTypes) {
              // Check all rates in this room type
              const rates = roomType.rates || [];
              for (const rate of rates) {
                const price = rate.retailRate?.total?.[0]?.amount || roomType.offerRetailRate?.amount;
                const rateCurrency = rate.retailRate?.total?.[0]?.currency || roomType.offerRetailRate?.currency || currency;
                const refundableTag = rate.cancellationPolicies?.refundableTag;
                const isRateRefundable = refundableTag === 'RFN';
                const rateBoardType = rate.boardType || rate.boardName || 'RO';
                const rateCancelDeadline = rate.cancellationPolicies?.cancelPolicyInfos?.[0]?.cancelTime;

                // Track if ANY rate is refundable
                if (isRateRefundable) {
                  hasRefundableRate = true;
                  // Track lowest refundable price
                  if (price && price < minRefundablePrice) {
                    minRefundablePrice = price;
                    refundableCancellationDeadline = rateCancelDeadline;
                  }
                }

                // Track absolute lowest price (regardless of refundability)
                if (price && price < minPrice) {
                  minPrice = price;
                  currency = rateCurrency;
                  refundable = isRateRefundable;
                  boardType = rateBoardType;
                  cancellationDeadline = rateCancelDeadline;
                }
              }
              // Fallback: check offerRetailRate directly on roomType
              const directPrice = roomType.offerRetailRate?.amount;
              if (directPrice && directPrice < minPrice) {
                minPrice = directPrice;
                currency = roomType.offerRetailRate?.currency || currency;
              }
            }

            return {
              hotelId,
              minimumRate: { amount: minPrice === Infinity ? 0 : minPrice, currency },
              available: minPrice !== Infinity,
              refundable, // Is cheapest rate refundable?
              hasRefundableRate, // Does hotel have ANY refundable option?
              lowestRefundablePrice: minRefundablePrice === Infinity ? null : minRefundablePrice,
              refundableCancellationDeadline,
              boardType,
              cancellationDeadline
            };
          });

          allMinimumRates.push(...batchMinimumRates);

          // Add small delay between batches to avoid rate limiting
          if (i + BATCH_SIZE < params.hotelIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

        } catch (batchError) {
          const axiosError = batchError as AxiosError<{ error?: { message?: string } }>;
          console.error(`❌ LiteAPI: Batch ${batchNumber} failed:`, axiosError.message);
          // Continue to next batch instead of failing completely
          continue;
        }
      }

      const availableCount = allMinimumRates.filter(r => r.available).length;
      console.log(`✅ LiteAPI: Extracted minimum rates for ${availableCount}/${allMinimumRates.length} hotels with availability`);

      if (availableCount === 0 && params.hotelIds.length > 0) {
        console.warn('⚠️ LiteAPI: No rates returned for any hotels. This may indicate low availability for the selected dates.');
      }

      return allMinimumRates;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting rates:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to get hotel rates');
    }
  }

  /**
   * Combined search: Get hotels with rates (two-step flow)
   */
  async searchHotelsWithRates(params: HotelSearchParams): Promise<{
    hotels: NormalizedHotel[];
    meta: { count: number; source: string };
  }> {
    try {
      // Handle parameter variations
      const checkIn = params.checkIn || params.checkinDate;
      const checkOut = params.checkOut || params.checkoutDate;
      const adults = params.adults || params.guests?.adults || 2;
      const children = params.children || (Array.isArray(params.guests?.children) ? params.guests.children.length : 0);

      if (!checkIn || !checkOut) {
        throw new Error('Check-in and check-out dates are required');
      }

      // Step 1: Get hotel static data
      const locationParams: Parameters<typeof this.getHotelsByLocation>[0] = {
        limit: params.limit || 30,
      };

      if (params.latitude !== undefined && params.longitude !== undefined) {
        locationParams.latitude = params.latitude;
        locationParams.longitude = params.longitude;
      } else if (params.countryCode) {
        locationParams.countryCode = params.countryCode;
        if (params.cityName) {
          locationParams.cityName = params.cityName;
        }
      }

      const { hotels, hotelIds } = await this.getHotelsByLocation(locationParams);

      if (hotelIds.length === 0) {
        return {
          hotels: [],
          meta: { count: 0, source: 'LiteAPI' },
        };
      }

      // Filter out deleted hotels
      const activeHotelIds = hotels
        .filter(h => !h.deletedAt)
        .map(h => h.id)
        .slice(0, 50); // LiteAPI has a limit of ~50 hotel IDs per request

      if (activeHotelIds.length === 0) {
        return {
          hotels: [],
          meta: { count: 0, source: 'LiteAPI' },
        };
      }

      // Step 2: Get rates for those hotels
      const ratesData = await this.getHotelRates({
        hotelIds: activeHotelIds,
        checkin: checkIn,
        checkout: checkOut,
        occupancies: [{ adults, children: children ? [children] : undefined }],
        currency: params.currency || 'USD',
        guestNationality: params.guestNationality || 'US',
      });

      // Step 3: Merge hotel data with rates
      const hotelsMap = new Map(hotels.map(h => [h.id, h]));
      const normalizedHotels: NormalizedHotel[] = [];

      for (const rateData of ratesData) {
        const hotelInfo = hotelsMap.get(rateData.hotelId);
        if (!hotelInfo || !rateData.roomTypes?.length) continue;

        // Find lowest price across all room types
        let lowestPrice = Infinity;
        const rooms: NormalizedRoom[] = [];

        for (const roomType of rateData.roomTypes) {
          for (const rate of roomType.rates || []) {
            const price = rate.retailRate?.total?.[0]?.amount;
            if (price && price < lowestPrice) {
              lowestPrice = price;
            }

            rooms.push({
              id: roomType.roomTypeId,
              offerId: roomType.offerId,
              name: rate.name,
              maxOccupancy: rate.maxOccupancy,
              boardType: rate.boardType,
              boardName: rate.boardName,
              price: price || 0,
              currency: rate.retailRate?.total?.[0]?.currency || 'USD',
              refundable: rate.cancellationPolicies?.refundableTag === 'RFN',
              rateId: rate.rateId,
            });
          }
        }

        normalizedHotels.push({
          id: hotelInfo.id,
          name: hotelInfo.name,
          description: this.stripHtml(hotelInfo.hotelDescription || ''),
          address: hotelInfo.address,
          city: hotelInfo.city,
          country: hotelInfo.country,
          latitude: hotelInfo.latitude,
          longitude: hotelInfo.longitude,
          stars: hotelInfo.stars || 0,
          rating: hotelInfo.stars || 0, // Star rating (same as stars)
          reviewScore: hotelInfo.rating || 0, // Review score (0-10 scale)
          reviewCount: hotelInfo.reviewCount || 0,
          image: hotelInfo.main_photo || '',
          thumbnail: hotelInfo.thumbnail || hotelInfo.main_photo || '',
          chain: hotelInfo.chain,
          currency: params.currency || 'USD',
          lowestPrice: lowestPrice === Infinity ? undefined : lowestPrice,
          rooms,
          source: 'liteapi',
        });
      }

      // Sort by lowest price
      normalizedHotels.sort((a, b) => (a.lowestPrice || Infinity) - (b.lowestPrice || Infinity));

      return {
        hotels: normalizedHotels,
        meta: { count: normalizedHotels.length, source: 'LiteAPI' },
      };
    } catch (error) {
      console.error('❌ LiteAPI: Combined search failed:', error);
      throw error;
    }
  }

  /**
   * FAST search: Get hotels with MINIMUM rates only (5x faster than full rates)
   * Perfect for search results pages where you only need the lowest price
   * Use searchHotelsWithRates for detail pages where you need all room options
   */
  async searchHotelsWithMinRates(params: HotelSearchParams): Promise<{
    hotels: NormalizedHotel[];
    meta: { count: number; source: string; usedMinRates: boolean };
  }> {
    try {
      // Calculate number of nights from check-in/check-out dates
      const checkIn = params.checkIn || params.checkinDate;
      const checkOut = params.checkOut || params.checkoutDate;

      if (!checkIn || !checkOut) {
        throw new Error('Check-in and check-out dates are required');
      }

      const checkinDate = new Date(checkIn);
      const checkoutDate = new Date(checkOut);
      const nights = Math.max(1, Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)));

      console.log(`📅 LiteAPI: Calculated ${nights} nights (${checkIn} to ${checkOut})`);

      // Step 1: Get hotel static data
      // INCREASED LIMIT: Get up to 200 hotels to maximize availability options
      const locationParams: Parameters<typeof this.getHotelsByLocation>[0] = {
        limit: params.limit || 200, // LiteAPI supports up to 200 hotels per request
      };

      if (params.latitude !== undefined && params.longitude !== undefined) {
        locationParams.latitude = params.latitude;
        locationParams.longitude = params.longitude;
      } else if (params.countryCode) {
        locationParams.countryCode = params.countryCode;
        if (params.cityName) {
          locationParams.cityName = params.cityName;
        }
      }

      const { hotels, hotelIds } = await this.getHotelsByLocation(locationParams);

      if (hotelIds.length === 0) {
        return {
          hotels: [],
          meta: { count: 0, source: 'LiteAPI', usedMinRates: true },
        };
      }

      // Filter out deleted hotels
      // REMOVED .slice(0, 100) limit - batching handles all hotels efficiently
      const activeHotelIds = hotels
        .filter(h => !h.deletedAt)
        .map(h => h.id);

      if (activeHotelIds.length === 0) {
        return {
          hotels: [],
          meta: { count: 0, source: 'LiteAPI', usedMinRates: true },
        };
      }

      // Step 2: Get MINIMUM rates (fast!)
      const adults = params.adults || params.guests?.adults || 2; // Default to 2 adults
      const children = params.children || (Array.isArray(params.guests?.children) ? params.guests.children.length : 0);

      const minRatesData = await this.getHotelMinimumRates({
        hotelIds: activeHotelIds,
        checkin: checkIn,
        checkout: checkOut,
        occupancies: [{
          adults,
          // CRITICAL FIX: LiteAPI expects children as array of ages, not count
          // If children count is provided but no ages, use default age of 10 for all
          ...(children > 0 && { children: Array(children).fill(10) })
        }],
        currency: params.currency || 'USD',
        guestNationality: params.guestNationality || 'US',
      });

      // Step 3: Load facilities for amenity mapping (cached)
      let facilitiesMap = new Map<number, string>();
      try {
        const facilitiesData = await this.getFacilities();
        console.log('🔍 DEBUG: First facility:', facilitiesData.data[0]);
        facilitiesMap = new Map(facilitiesData.data.map(f => [f.facility_id, f.facility]));
        console.log(`✅ Loaded ${facilitiesMap.size} facilities for amenity mapping`);
        console.log('🔍 DEBUG: First 3 from map:', Array.from(facilitiesMap.entries()).slice(0, 3));
      } catch (error) {
        console.warn('⚠️ Could not load facilities, hotels will have no amenities');
      }

      // Step 4: Merge hotel data with minimum rates
      const hotelsMap = new Map(hotels.map(h => [h.id, h]));
      const normalizedHotels: NormalizedHotel[] = [];

      for (const minRateData of minRatesData) {
        const hotelInfo = hotelsMap.get(minRateData.hotelId);
        if (!hotelInfo || !minRateData.available) continue;

        const totalPrice = minRateData.minimumRate?.amount;
        if (!totalPrice) continue;

        // CRITICAL FIX: LiteAPI returns TOTAL price for entire stay, not per-night
        const perNightPrice = totalPrice / nights;

        console.log(`💰 ${hotelInfo.name}: Total $${totalPrice.toFixed(2)} ÷ ${nights} nights = $${perNightPrice.toFixed(2)}/night`);

        // Map facility IDs to amenity names
        if (normalizedHotels.length === 0) {
          console.log(`🔍 DEBUG: First hotel "${hotelInfo.name}" facilityIds:`, hotelInfo.facilityIds?.slice(0, 5));
        }
        const amenities = (hotelInfo.facilityIds || [])
          .map(id => facilitiesMap.get(id))
          .filter((name): name is string => !!name)
          .slice(0, 10); // Limit to top 10 amenities for performance
        if (normalizedHotels.length === 0) {
          console.log(`🔍 DEBUG: Mapped amenities for first hotel:`, amenities);
        }

        // Build images array from available sources
        const hotelImages: Array<{ url: string; alt: string }> = [];

        // Add main photo
        if (hotelInfo.main_photo) {
          hotelImages.push({ url: hotelInfo.main_photo, alt: hotelInfo.name });
        }

        // Add thumbnail if different from main photo
        if (hotelInfo.thumbnail && hotelInfo.thumbnail !== hotelInfo.main_photo) {
          hotelImages.push({ url: hotelInfo.thumbnail, alt: `${hotelInfo.name} thumbnail` });
        }

        // Add any additional images from hotelInfo.images array if available
        if ((hotelInfo as any).images && Array.isArray((hotelInfo as any).images)) {
          for (const img of (hotelInfo as any).images) {
            if (img && typeof img === 'string' && !hotelImages.find(h => h.url === img)) {
              hotelImages.push({ url: img, alt: hotelInfo.name });
            } else if (img && img.url && !hotelImages.find(h => h.url === img.url)) {
              hotelImages.push({ url: img.url, alt: img.alt || hotelInfo.name });
            }
          }
        }

        normalizedHotels.push({
          id: hotelInfo.id,
          name: hotelInfo.name,
          description: this.stripHtml(hotelInfo.hotelDescription || ''),
          address: hotelInfo.address,
          city: hotelInfo.city,
          country: hotelInfo.country,
          latitude: hotelInfo.latitude,
          longitude: hotelInfo.longitude,
          stars: hotelInfo.stars || 0,
          rating: hotelInfo.stars || 0, // Star rating (same as stars)
          reviewScore: hotelInfo.rating || 0, // Review score (0-10 scale)
          reviewCount: hotelInfo.reviewCount || 0,
          image: hotelInfo.main_photo || '',
          thumbnail: hotelInfo.thumbnail || hotelInfo.main_photo || '',
          images: hotelImages, // ✅ ADDED: Array of all available images
          amenities, // ✅ ADDED: Map facility IDs to amenity names
          chain: hotelInfo.chain,
          currency: minRateData.minimumRate.currency,
          lowestPrice: totalPrice, // TOTAL price for entire stay
          lowestPricePerNight: perNightPrice, // Per-night price
          // ✅ ADDED: Cancellation & board info from best rate
          refundable: (minRateData as any).refundable || false,
          hasRefundableRate: (minRateData as any).hasRefundableRate || false, // Does hotel have ANY refundable option?
          lowestRefundablePrice: (minRateData as any).lowestRefundablePrice || null,
          refundableCancellationDeadline: (minRateData as any).refundableCancellationDeadline || null,
          boardType: (minRateData as any).boardType || 'RO',
          cancellationDeadline: (minRateData as any).cancellationDeadline,
          rooms: [], // No room details in min rates mode
          source: 'liteapi',
        });
      }

      // Note: Fallback removed - getHotelMinimumRates now uses correct /hotels/rates endpoint
      // Note: Full image galleries are fetched on-demand via /api/hotels/[id]/images endpoint
      // to avoid slowing down search results. HotelCard will lazy-load images.

      // Sort by lowest per-night price
      normalizedHotels.sort((a, b) => (a.lowestPricePerNight || Infinity) - (b.lowestPricePerNight || Infinity));

      console.log(`✅ Normalized ${normalizedHotels.length} hotels with correct per-night pricing`);

      return {
        hotels: normalizedHotels,
        meta: { count: normalizedHotels.length, source: 'LiteAPI', usedMinRates: true },
      };
    } catch (error) {
      console.error('❌ LiteAPI: Fast search with min rates failed:', error);
      throw error;
    }
  }

  /**
   * Legacy method: Search hotels (delegates to searchHotelsWithRates)
   */
  async searchHotels(params: {
    cityCode?: string;
    checkinDate: string;
    checkoutDate: string;
    adults: number;
    children?: number;
    currency?: string;
    guestNationality?: string;
    latitude?: number;
    longitude?: number;
  }) {
    // Map legacy cityCode to countryCode/cityName if needed
    const searchParams: HotelSearchParams = {
      checkinDate: params.checkinDate,
      checkoutDate: params.checkoutDate,
      adults: params.adults,
      children: params.children,
      currency: params.currency,
      guestNationality: params.guestNationality,
      latitude: params.latitude,
      longitude: params.longitude,
    };

    // Try to use city code as country code (for backwards compatibility)
    if (params.cityCode && params.cityCode.length === 2) {
      searchParams.countryCode = params.cityCode;
    }

    return this.searchHotelsWithRates(searchParams);
  }

  /**
   * Get hotel details by ID (Legacy method)
   */
  async getHotelDetails(params: HotelDetailsParams) {
    try {
      const response = await axios.get(`${this.baseUrl}/data/hotels`, {
        params: {
          hotelIds: params.hotelId,
        },
        headers: this.getHeaders(),
        timeout: 15000,
      });

      return response.data.data?.[0] || null;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting hotel details:', axiosError.response?.data || axiosError.message);
      throw new Error('Failed to get hotel details');
    }
  }

  /**
   * Get all images for a hotel from the detailed endpoint
   * The /data/hotel endpoint returns full hotelImages array (30+ images)
   */
  async getHotelImages(hotelId: string): Promise<Array<{ url: string; alt: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/data/hotel`, {
        params: { hotelId },
        headers: this.getHeaders(),
        timeout: 10000,
      });

      const hotelData = response.data.data;
      if (!hotelData?.hotelImages) {
        return [];
      }

      // Map hotelImages to our format
      return hotelData.hotelImages.map((img: any) => ({
        url: img.url || img.urlHd || '',
        alt: img.caption || hotelData.name || 'Hotel image',
      })).filter((img: { url: string }) => img.url);
    } catch (error) {
      console.warn(`⚠️ Could not fetch images for hotel ${hotelId}`);
      return [];
    }
  }

  /**
   * Batch fetch images for multiple hotels in parallel
   * Optimized with concurrency limit to avoid rate limiting
   */
  async getHotelImagesBatch(hotelIds: string[]): Promise<Map<string, Array<{ url: string; alt: string }>>> {
    const BATCH_SIZE = 10; // Process 10 hotels at a time
    const imagesMap = new Map<string, Array<{ url: string; alt: string }>>();

    console.log(`📸 Fetching images for ${hotelIds.length} hotels in batches of ${BATCH_SIZE}`);

    for (let i = 0; i < hotelIds.length; i += BATCH_SIZE) {
      const batchIds = hotelIds.slice(i, i + BATCH_SIZE);

      // Fetch images for this batch in parallel
      const batchPromises = batchIds.map(async (hotelId) => {
        const images = await this.getHotelImages(hotelId);
        return { hotelId, images };
      });

      const results = await Promise.all(batchPromises);

      for (const { hotelId, images } of results) {
        if (images.length > 0) {
          imagesMap.set(hotelId, images);
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < hotelIds.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log(`✅ Fetched images for ${imagesMap.size}/${hotelIds.length} hotels`);
    return imagesMap;
  }

  /**
   * Get enhanced hotel details with check-in/out times, facilities, and policies
   * Uses the /data/hotel endpoint for comprehensive information
   */
  async getEnhancedHotelDetails(hotelId: string): Promise<HotelDetailedInfo | null> {
    try {
      console.log(`🔍 LiteAPI: Getting enhanced details for hotel ${hotelId}`);

      const response = await axios.get(`${this.baseUrl}/data/hotel`, {
        params: { hotelId },
        headers: this.getHeaders(),
        timeout: 15000,
      });

      const hotelData = response.data.data;

      if (!hotelData) {
        console.warn(`⚠️ LiteAPI: No data found for hotel ${hotelId}`);
        return null;
      }

      console.log(`✅ LiteAPI: Got enhanced details for ${hotelData.name}`);

      // Parse hotel photos - LiteAPI returns hotelImages array with {url, caption, order, defaultImage}
      const hotelPhotos: Array<{ url: string; caption?: string; category?: string; order?: number }> = [];

      // PRIORITY 1: Use hotelImages from LiteAPI (official field name per docs)
      if (hotelData.hotelImages && Array.isArray(hotelData.hotelImages) && hotelData.hotelImages.length > 0) {
        // Sort by order if available, put defaultImage first
        const sortedImages = [...hotelData.hotelImages].sort((a: any, b: any) => {
          if (a.defaultImage && !b.defaultImage) return -1;
          if (!a.defaultImage && b.defaultImage) return 1;
          return (a.order || 0) - (b.order || 0);
        });

        sortedImages.forEach((photo: any) => {
          const imageUrl = photo.url || photo.image || photo.large || photo.medium;
          if (imageUrl) {
            hotelPhotos.push({
              url: imageUrl,
              caption: photo.caption || photo.imageCaption || undefined,
              category: photo.category || undefined,
              order: photo.order,
            });
          }
        });
        console.log(`📸 LiteAPI: Found ${hotelPhotos.length} photos from hotelImages for hotel ${hotelId}`);
      }
      // PRIORITY 2: Try hotelPhotos (alternate field name)
      else if (hotelData.hotelPhotos && Array.isArray(hotelData.hotelPhotos) && hotelData.hotelPhotos.length > 0) {
        hotelData.hotelPhotos.forEach((photo: any) => {
          const imageUrl = photo.image || photo.url || photo.large || photo.medium;
          if (imageUrl) {
            hotelPhotos.push({
              url: imageUrl,
              caption: photo.imageCaption || photo.caption || undefined,
              category: photo.category || undefined,
            });
          }
        });
        console.log(`📸 LiteAPI: Found ${hotelPhotos.length} photos from hotelPhotos for hotel ${hotelId}`);
      }
      // PRIORITY 3: Try images array
      else if (hotelData.images && Array.isArray(hotelData.images) && hotelData.images.length > 0) {
        hotelData.images.forEach((img: any, index: number) => {
          const imageUrl = typeof img === 'string' ? img : (img.url || img.image || img.large || img.medium);
          if (imageUrl) {
            hotelPhotos.push({
              url: imageUrl,
              caption: img.caption || `${hotelData.name} - Photo ${index + 1}`,
            });
          }
        });
        console.log(`📸 LiteAPI: Found ${hotelPhotos.length} photos from images for hotel ${hotelId}`);
      }
      // PRIORITY 4: Fallback to main_photo and thumbnail
      else {
        if (hotelData.main_photo) {
          hotelPhotos.push({ url: hotelData.main_photo, caption: `${hotelData.name} - Main Photo` });
        }
        if (hotelData.thumbnail && hotelData.thumbnail !== hotelData.main_photo) {
          hotelPhotos.push({ url: hotelData.thumbnail, caption: `${hotelData.name}` });
        }
        console.log(`📸 LiteAPI: Using fallback ${hotelPhotos.length} photos for hotel ${hotelId}`);
      }

      return {
        id: hotelData.id,
        name: hotelData.name,
        hotelDescription: hotelData.hotelDescription,
        address: hotelData.address,
        city: hotelData.city,
        country: hotelData.country,
        latitude: hotelData.latitude,
        longitude: hotelData.longitude,
        stars: hotelData.stars || 0,
        rating: hotelData.rating || 0,
        reviewCount: hotelData.reviewCount || 0,
        main_photo: hotelData.main_photo,
        thumbnail: hotelData.thumbnail,
        chain: hotelData.chain,
        currency: hotelData.currency,
        hotelPhotos: hotelPhotos,
        checkinCheckoutTimes: hotelData.checkinCheckoutTimes,
        hotelImportantInformation: hotelData.hotelImportantInformation,
        hotelFacilities: hotelData.hotelFacilities,
        facilities: hotelData.facilities,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting enhanced hotel details:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to get enhanced hotel details');
    }
  }

  /**
   * Get hotel reviews with AI sentiment analysis
   * @param hotelId - The hotel ID
   * @param limit - Max number of reviews to fetch (default: 10)
   * @param getSentiment - Enable AI sentiment analysis (default: true)
   */
  async getHotelReviews(
    hotelId: string,
    options: {
      limit?: number;
      getSentiment?: boolean;
    } = {}
  ): Promise<{
    reviews: HotelReview[];
    sentiment?: ReviewSentiment;
  }> {
    try {
      const { limit = 10, getSentiment = true } = options;

      console.log(`🔍 LiteAPI: Getting reviews for hotel ${hotelId} (sentiment: ${getSentiment})`);

      const params: Record<string, string | number | boolean> = {
        hotelId,
        limit,
      };

      if (getSentiment) {
        params.getSentiment = true;
      }

      const response = await axios.get(`${this.baseUrl}/data/reviews`, {
        params,
        headers: this.getHeaders(),
        timeout: 20000,
      });

      const reviewsData = response.data.data?.reviews || [];
      const sentimentData = response.data.data?.sentiment;

      // Normalize reviews
      const reviews: HotelReview[] = reviewsData.map((review: any) => ({
        id: review.id || review.reviewId,
        hotelId: hotelId,
        rating: review.rating || 0,
        title: review.title,
        comment: review.comment || review.text || '',
        author: {
          name: review.author?.name || review.authorName,
          countryCode: review.author?.countryCode || review.countryCode,
        },
        date: review.date || review.createdAt,
        helpfulCount: review.helpfulCount || review.helpful,
      }));

      let sentiment: ReviewSentiment | undefined;

      // Parse sentiment analysis if available
      if (getSentiment && sentimentData) {
        sentiment = {
          overallScore: sentimentData.overallScore || 0,
          totalReviews: sentimentData.totalReviews || reviews.length,
          categories: {
            cleanliness: sentimentData.categories?.cleanliness,
            service: sentimentData.categories?.service,
            location: sentimentData.categories?.location,
            roomQuality: sentimentData.categories?.roomQuality || sentimentData.categories?.room,
            amenities: sentimentData.categories?.amenities,
            valueForMoney: sentimentData.categories?.valueForMoney || sentimentData.categories?.value,
            foodAndBeverage: sentimentData.categories?.foodAndBeverage || sentimentData.categories?.food,
            overallExperience: sentimentData.categories?.overallExperience || sentimentData.categories?.overall,
          },
          pros: sentimentData.pros || [],
          cons: sentimentData.cons || [],
        };

        console.log(`✅ LiteAPI: Got ${reviews.length} reviews with sentiment analysis`);
        console.log(`   Overall Score: ${sentiment.overallScore}/10`);
        if (sentiment.pros?.length) {
          console.log(`   Top Pros: ${sentiment.pros.slice(0, 3).join(', ')}`);
        }
        if (sentiment.cons?.length) {
          console.log(`   Top Cons: ${sentiment.cons.slice(0, 3).join(', ')}`);
        }
      } else {
        console.log(`✅ LiteAPI: Got ${reviews.length} reviews`);
      }

      return { reviews, sentiment };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting reviews:', axiosError.response?.data || axiosError.message);
      // Return empty instead of throwing to allow graceful degradation
      return { reviews: [] };
    }
  }

  /**
   * Search cities by query
   */
  async searchCities(query: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/data/cities`, {
        params: { countryCode: 'US', limit: 20 }, // LiteAPI doesn't support text search
        headers: this.getHeaders(),
        timeout: 10000,
      });

      // Filter cities by query (client-side since LiteAPI doesn't support search)
      const cities = response.data.data || [];
      const filtered = cities.filter((c: { city: string }) =>
        c.city.toLowerCase().includes(query.toLowerCase())
      );

      return { data: filtered };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error searching cities:', axiosError.response?.data || axiosError.message);
      throw new Error('Failed to search cities');
    }
  }

  /**
   * Pre-book hotel (verify availability before final booking)
   * Creates a checkout session and locks in the price for a limited time
   *
   * @param offerId - The offer ID from hotel rates search
   * @param options - Optional settings including usePaymentSdk for User Payment flow
   * @returns Prebook response with prebookId (and secretKey/transactionId if usePaymentSdk)
   */
  async preBookHotel(offerId: string, options?: PrebookOptions): Promise<PrebookResponse> {
    try {
      const usePaymentSdk = options?.usePaymentSdk ?? true; // Default to SDK mode
      console.log(`🔍 LiteAPI: Pre-booking offer ${offerId} (usePaymentSdk: ${usePaymentSdk})`);

      const response = await axios.post(
        `${this.baseUrl}/rates/prebook`,
        {
          offerId,
          usePaymentSdk, // Enable User Payment SDK flow
        },
        { headers: this.getHeaders(), timeout: 30000 }
      );

      const data = response.data.data;

      console.log(`✅ LiteAPI: Pre-book successful (ID: ${data.prebookId})`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Price: ${data.price?.amount} ${data.price?.currency}`);
      console.log(`   Expires: ${data.expiresAt}`);
      if (data.secretKey) {
        console.log(`   Payment SDK: Enabled (secretKey received)`);
        console.log(`   Transaction ID: ${data.transactionId}`);
      }

      return {
        prebookId: data.prebookId,
        hotelId: data.hotelId,
        offerId: data.offerId,
        status: data.status,
        price: {
          amount: data.price?.amount || 0,
          currency: data.price?.currency || 'USD',
        },
        expiresAt: data.expiresAt,
        hotelConfirmationCode: data.hotelConfirmationCode,
        // User Payment SDK fields
        secretKey: data.secretKey,
        transactionId: data.transactionId,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error pre-booking:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to pre-book hotel');
    }
  }

  /**
   * Complete hotel booking after prebook
   *
   * @param bookingData - Guest and payment information
   * @returns Confirmed booking details
   */
  async bookHotel(bookingData: {
    prebookId: string;
    guestInfo: {
      guestFirstName: string;
      guestLastName: string;
      guestEmail: string;
      guestPhone?: string;
    };
    paymentMethod?: string;
    transactionId?: string; // From User Payment SDK
    holderName?: string;
    specialRequests?: string;
  }): Promise<BookingResponse> {
    try {
      console.log(`🔍 LiteAPI: Completing booking for prebook ${bookingData.prebookId}`);

      // Build the request payload according to LiteAPI specification
      const payload: Record<string, any> = {
        prebookId: bookingData.prebookId,
        holder: {
          firstName: bookingData.guestInfo.guestFirstName,
          lastName: bookingData.guestInfo.guestLastName,
          email: bookingData.guestInfo.guestEmail,
        },
        guests: [{
          firstName: bookingData.guestInfo.guestFirstName,
          lastName: bookingData.guestInfo.guestLastName,
        }],
      };

      // Add payment info for User Payment SDK flow
      if (bookingData.transactionId) {
        payload.payment = {
          method: 'TRANSACTION_ID',
          transactionId: bookingData.transactionId,
        };
        console.log(`   Using TRANSACTION_ID payment: ${bookingData.transactionId}`);
      }

      // Add special requests if any
      if (bookingData.specialRequests) {
        payload.remarks = { specialRequest: bookingData.specialRequests };
      }

      const response = await axios.post(
        `${this.baseUrl}/rates/book`,
        payload,
        { headers: this.getHeaders(), timeout: 60000 }
      );

      const data = response.data.data;

      console.log(`✅ LiteAPI: Booking confirmed!`);
      console.log(`   Booking ID: ${data.bookingId}`);
      console.log(`   Reference: ${data.reference}`);
      console.log(`   Status: ${data.status}`);

      return {
        bookingId: data.bookingId,
        reference: data.reference,
        status: data.status,
        hotelId: data.hotelId,
        hotelName: data.hotelName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guest: {
          firstName: data.guest?.firstName || bookingData.guestInfo.guestFirstName,
          lastName: data.guest?.lastName || bookingData.guestInfo.guestLastName,
          email: data.guest?.email || bookingData.guestInfo.guestEmail,
        },
        price: {
          amount: data.price?.amount || 0,
          currency: data.price?.currency || 'USD',
          breakdown: data.price?.breakdown,
        },
        cancellationPolicy: data.cancellationPolicy,
        confirmationCode: data.confirmationCode,
        hotelConfirmationCode: data.hotelConfirmationCode,
        createdAt: data.createdAt,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error booking:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to book hotel');
    }
  }

  /**
   * Get booking details by booking ID
   * Retrieves comprehensive information about a booking including hotel and room details
   *
   * @param bookingId - The booking ID
   * @returns Detailed booking information
   */
  async getBooking(bookingId: string): Promise<BookingDetailsResponse> {
    try {
      console.log(`🔍 LiteAPI: Getting booking details for ${bookingId}`);

      const response = await axios.get(`${this.baseUrl}/bookings/${bookingId}`, {
        headers: this.getHeaders(),
        timeout: 15000,
      });

      const data = response.data.data;

      console.log(`✅ LiteAPI: Got booking details`);
      console.log(`   Reference: ${data.booking?.reference}`);
      console.log(`   Status: ${data.booking?.status}`);
      console.log(`   Hotel: ${data.hotel?.name}`);

      return {
        booking: {
          bookingId: data.booking?.bookingId || bookingId,
          reference: data.booking?.reference,
          status: data.booking?.status,
          hotelId: data.booking?.hotelId,
          hotelName: data.hotel?.name || data.booking?.hotelName,
          checkIn: data.booking?.checkIn,
          checkOut: data.booking?.checkOut,
          guest: data.booking?.guest,
          price: data.booking?.price,
          cancellationPolicy: data.booking?.cancellationPolicy,
          confirmationCode: data.booking?.confirmationCode,
          hotelConfirmationCode: data.booking?.hotelConfirmationCode,
          createdAt: data.booking?.createdAt,
        },
        hotel: data.hotel,
        room: data.room,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting booking:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to get booking');
    }
  }

  /**
   * Cancel a booking
   *
   * @param bookingId - The booking ID to cancel
   * @returns Cancellation confirmation with refund details
   */
  async cancelBooking(bookingId: string): Promise<CancellationResponse> {
    try {
      console.log(`🔍 LiteAPI: Cancelling booking ${bookingId}`);

      const response = await axios.put(
        `${this.baseUrl}/bookings/${bookingId}`,
        {},
        { headers: this.getHeaders(), timeout: 30000 }
      );

      const data = response.data.data;

      console.log(`✅ LiteAPI: Booking cancelled`);
      console.log(`   Status: ${data.status}`);
      if (data.refundAmount) {
        console.log(`   Refund: ${data.refundAmount} ${data.refundCurrency}`);
      }
      if (data.cancellationFee) {
        console.log(`   Cancellation Fee: ${data.cancellationFee} ${data.refundCurrency}`);
      }

      return {
        bookingId: data.bookingId || bookingId,
        status: 'cancelled',
        cancelledAt: data.cancelledAt || new Date().toISOString(),
        refundAmount: data.refundAmount,
        refundCurrency: data.refundCurrency,
        refundStatus: data.refundStatus,
        cancellationFee: data.cancellationFee,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error canceling booking:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to cancel booking');
    }
  }

  /**
   * Get list of all bookings
   * @param params - Optional filters for booking list
   * @returns List of bookings with summary information
   */
  async getBookings(params?: {
    guestId?: string;
    status?: 'confirmed' | 'cancelled' | 'pending';
    limit?: number;
    offset?: number;
  }): Promise<{
    data: Array<{
      bookingId: string;
      hotelId: string;
      hotelName: string;
      status: string;
      checkIn: string;
      checkOut: string;
      guestName: string;
      totalAmount: number;
      currency: string;
      createdAt: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      console.log('🔍 LiteAPI: Fetching bookings list');

      const response = await axios.get(`${this.baseUrl}/bookings`, {
        params,
        headers: this.getHeaders(),
        timeout: 15000,
      });

      const bookings = response.data.data || [];
      console.log(`✅ LiteAPI: Found ${bookings.length} bookings`);

      return {
        data: bookings,
        total: response.data.total || bookings.length,
        limit: params?.limit || 50,
        offset: params?.offset || 0,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error fetching bookings:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to fetch bookings');
    }
  }

  /**
   * Get prebook session status and details
   * @param prebookId - The prebook session ID
   * @returns Prebook session details including expiry status
   */
  async getPrebookStatus(prebookId: string): Promise<{
    prebookId: string;
    status: 'active' | 'expired' | 'completed';
    offerId: string;
    hotelId: string;
    price: {
      amount: number;
      currency: string;
    };
    expiresAt: string;
    timeRemaining: number;
    expired: boolean;
  }> {
    try {
      console.log(`🔍 LiteAPI: Checking prebook status for ${prebookId}`);

      const response = await axios.get(`${this.baseUrl}/prebooks/${prebookId}`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });

      const data = response.data.data;
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      const expired = timeRemaining === 0;

      console.log(`✅ LiteAPI: Prebook ${expired ? 'expired' : 'active'}, ${timeRemaining}s remaining`);

      return {
        prebookId: data.prebookId || prebookId,
        status: expired ? 'expired' : data.status === 'completed' ? 'completed' : 'active',
        offerId: data.offerId,
        hotelId: data.hotelId,
        price: {
          amount: data.price?.amount || 0,
          currency: data.price?.currency || 'USD',
        },
        expiresAt: data.expiresAt,
        timeRemaining,
        expired,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error fetching prebook status:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to fetch prebook status');
    }
  }

  /**
   * Amend booking guest information
   * @param bookingId - The booking ID to amend
   * @param params - Guest information to update
   * @returns Updated booking confirmation
   */
  async amendBooking(
    bookingId: string,
    params: {
      guestFirstName?: string;
      guestLastName?: string;
      guestEmail?: string;
    }
  ): Promise<{
    bookingId: string;
    status: string;
    amendedAt: string;
    updatedFields: string[];
  }> {
    try {
      console.log(`🔍 LiteAPI: Amending booking ${bookingId}`);

      const response = await axios.put(
        `${this.baseUrl}/bookings/${bookingId}/amend`,
        params,
        { headers: this.getHeaders(), timeout: 15000 }
      );

      const data = response.data.data;
      const updatedFields = Object.keys(params);

      console.log(`✅ LiteAPI: Booking amended successfully`);
      console.log(`   Updated fields: ${updatedFields.join(', ')}`);

      return {
        bookingId: data.bookingId || bookingId,
        status: data.status || 'confirmed',
        amendedAt: data.amendedAt || new Date().toISOString(),
        updatedFields,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error amending booking:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to amend booking');
    }
  }

  /**
   * Enhanced places search for autocomplete suggestions
   * Supports cities, countries, IATA codes, landmarks, and points of interest
   * Returns results suitable for location autocomplete dropdowns
   *
   * @param query - Search query (city name, country, airport code, etc.)
   * @param options - Search options
   * @returns Array of place suggestions with coordinates
   */
  async searchPlaces(
    query: string,
    options: {
      limit?: number;
      types?: Array<'city' | 'country' | 'landmark' | 'neighborhood' | 'poi'>;
    } = {}
  ): Promise<{ data: PlaceSearchResult[] }> {
    try {
      const { limit = 15, types } = options;

      console.log(`🔍 LiteAPI: Searching places for "${query}"`);

      const response = await axios.get(`${this.baseUrl}/data/places`, {
        params: {
          textQuery: query,
          limit,
        },
        headers: this.getHeaders(),
        timeout: 10000,
      });

      let places: PlaceSearchResult[] = (response.data.data || []).map((place: any) => ({
        textForSearch: place.textForSearch || place.name,
        placeId: place.placeId || place.id,
        type: place.type || 'city',
        countryCode: place.countryCode,
        countryName: place.countryName,
        cityName: place.cityName,
        stateCode: place.stateCode,
        latitude: place.latitude,
        longitude: place.longitude,
      }));

      // Filter by types if specified
      if (types && types.length > 0) {
        places = places.filter(place => types.includes(place.type as any));
      }

      console.log(`✅ LiteAPI: Found ${places.length} places for "${query}"`);

      return { data: places };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error searching places:', axiosError.response?.data || axiosError.message);
      // Return empty on error rather than throwing to allow fallback
      return { data: [] };
    }
  }

  /**
   * Get IATA codes for airport lookups
   */
  async getIataCodes(query: string): Promise<{
    data: Array<{
      iataCode: string;
      city: string;
      country: string;
      countryCode: string;
      latitude?: number;
      longitude?: number;
    }>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/data/iatacodes`, {
        params: {
          keyword: query,
          limit: 10,
        },
        headers: this.getHeaders(),
        timeout: 8000,
      });

      return { data: response.data.data || [] };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting IATA codes:', axiosError.response?.data || axiosError.message);
      return { data: [] };
    }
  }

  /**
   * Get all cities for a country (for building local cache)
   */
  async getCitiesByCountry(countryCode: string, limit = 100): Promise<{
    data: Array<{
      city: string;
      cityCode?: string;
      countryCode: string;
      latitude?: number;
      longitude?: number;
    }>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/data/cities`, {
        params: {
          countryCode,
          limit,
        },
        headers: this.getHeaders(),
        timeout: 15000,
      });

      return { data: response.data.data || [] };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting cities:', axiosError.response?.data || axiosError.message);
      return { data: [] };
    }
  }

  /**
   * Get all countries
   */
  async getCountries(): Promise<{
    data: Array<{
      countryCode: string;
      countryName: string;
    }>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/data/countries`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });

      return { data: response.data.data || [] };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting countries:', axiosError.response?.data || axiosError.message);
      return { data: [] };
    }
  }

  /**
   * Get hotel chains (for filtering by brand like Marriott, Hilton)
   * NEW: Enable filtering by hotel brand/chain
   */
  async getHotelChains(): Promise<Array<{ chainId: number; name: string; code?: string }>> {
    try {
      console.log('🔍 LiteAPI: Getting hotel chains');
      const response = await axios.get(`${this.baseUrl}/data/chains`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      const chains = response.data.data || [];
      console.log(`✅ LiteAPI: Got ${chains.length} hotel chains`);
      return chains;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting hotel chains:', axiosError.response?.data || axiosError.message);
      return []; // Return empty array on error
    }
  }

  /**
   * Get hotel types (Resort, Boutique, Business Hotel, etc.)
   * NEW: Enable filtering by property type
   */
  async getHotelTypes(): Promise<Array<{ typeId: number; name: string }>> {
    try {
      console.log('🔍 LiteAPI: Getting hotel types');
      const response = await axios.get(`${this.baseUrl}/data/hotelTypes`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      const types = response.data.data || [];
      console.log(`✅ LiteAPI: Got ${types.length} hotel types`);
      return types;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting hotel types:', axiosError.response?.data || axiosError.message);
      return []; // Return empty array on error
    }
  }

  /**
   * Get list of supported currencies
   * NEW: Enable multi-currency pricing display
   */
  async getCurrencies(): Promise<Array<{ code: string; name: string; symbol?: string }>> {
    try {
      console.log('🔍 LiteAPI: Getting currencies');
      const response = await axios.get(`${this.baseUrl}/data/currencies`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });
      const currencies = response.data.data || [];
      console.log(`✅ LiteAPI: Got ${currencies.length} currencies`);
      return currencies;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting currencies:', axiosError.response?.data || axiosError.message);
      return []; // Return empty array on error
    }
  }

  /**
   * AI-powered semantic search
   * NEW: Search hotels by natural language (e.g., "Romantic beachfront resort")
   */
  async searchHotelsSemanticQuery(query: string, limit = 20): Promise<Array<{
    hotelId: string;
    name: string;
    city: string;
    country: string;
    relevanceScore?: number;
    semanticTags?: string[];
  }>> {
    try {
      console.log(`🤖 LiteAPI: Semantic search for "${query}"`);
      const response = await axios.get(`${this.baseUrl}/data/hotels/semantic-search`, {
        params: { query, limit },
        headers: this.getHeaders(),
        timeout: 15000,
      });
      const hotels = response.data.data || [];
      console.log(`✅ LiteAPI: Found ${hotels.length} hotels via semantic search`);
      return hotels;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Semantic search error:', axiosError.response?.data || axiosError.message);
      return []; // Return empty array on error
    }
  }

  /**
   * Hotel Q&A - AI answers questions about a specific hotel
   * NEW: Reduce customer support load with AI-powered Q&A
   */
  async askHotelQuestion(hotelId: string, question: string, allowWebSearch = true): Promise<string> {
    try {
      console.log(`🤖 LiteAPI: Asking question about hotel ${hotelId}: "${question}"`);
      const response = await axios.get(`${this.baseUrl}/data/hotel/ask`, {
        params: { hotelId, question, allowWebSearch },
        headers: this.getHeaders(),
        timeout: 20000,
      });
      const answer = response.data.data?.answer || 'No answer available';
      console.log(`✅ LiteAPI: Got answer for hotel question`);
      return answer;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Hotel Q&A error:', axiosError.response?.data || axiosError.message);
      return 'Unable to answer this question at the moment. Please contact our support team.';
    }
  }

  /**
   * Get list of all available facilities
   * Useful for displaying facility filters and mapping facility IDs to names
   *
   * @returns List of all facilities with IDs and names
   */
  async getFacilities(): Promise<{
    data: Array<{
      facility_id: number;
      facility: string;
      sort?: number;
    }>;
  }> {
    try {
      console.log('🔍 LiteAPI: Getting facilities list');

      const response = await axios.get(`${this.baseUrl}/data/facilities`, {
        headers: this.getHeaders(),
        timeout: 10000,
      });

      const facilities = response.data.data || [];
      console.log(`✅ LiteAPI: Got ${facilities.length} facilities`);
      console.log('🔍 DEBUG: First 3 facilities:', JSON.stringify(facilities.slice(0, 3), null, 2));

      return { data: facilities };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting facilities:', axiosError.response?.data || axiosError.message);
      return { data: [] };
    }
  }

  /**
   * Get full booking list with optional filters
   * Useful for admin dashboards and booking management
   *
   * @param options - Filter options
   * @returns List of bookings
   */
  async listBookings(options: {
    status?: 'confirmed' | 'pending' | 'cancelled';
    guestEmail?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    data: BookingResponse[];
    meta: {
      total: number;
      limit: number;
      offset: number;
    };
  }> {
    try {
      console.log('🔍 LiteAPI: Listing bookings');

      const params: Record<string, any> = {};
      if (options.status) params.status = options.status;
      if (options.guestEmail) params.guestEmail = options.guestEmail;
      if (options.startDate) params.startDate = options.startDate;
      if (options.endDate) params.endDate = options.endDate;
      if (options.limit) params.limit = options.limit;
      if (options.offset) params.offset = options.offset;

      const response = await axios.get(`${this.baseUrl}/bookings`, {
        params,
        headers: this.getHeaders(),
        timeout: 15000,
      });

      const bookings = response.data.data || [];
      const meta = response.data.meta || {
        total: bookings.length,
        limit: options.limit || 20,
        offset: options.offset || 0,
      };

      console.log(`✅ LiteAPI: Found ${bookings.length} bookings`);

      return { data: bookings, meta };
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error listing bookings:', axiosError.response?.data || axiosError.message);
      return {
        data: [],
        meta: { total: 0, limit: options.limit || 20, offset: options.offset || 0 },
      };
    }
  }

  /**
   * Get minimum stay requirements for a hotel
   * Some hotels have minimum stay requirements for certain dates
   */
  async getMinimumStay(hotelId: string, checkIn: string): Promise<{
    minimumStay: number;
    restrictions?: string[];
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/data/hotel`, {
        params: { hotelId },
        headers: this.getHeaders(),
        timeout: 10000,
      });

      const hotelData = response.data.data;
      const minimumStay = hotelData?.minimumStay || 1;
      const restrictions = hotelData?.stayRestrictions || [];

      return { minimumStay, restrictions };
    } catch (error) {
      console.warn('⚠️ LiteAPI: Could not get minimum stay, defaulting to 1 night');
      return { minimumStay: 1 };
    }
  }

  /**
   * Validate booking before submission
   * Checks dates, guest counts, and special requirements
   */
  validateBookingData(bookingData: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children?: number;
    rooms?: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate dates
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      errors.push('Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      errors.push('Check-out date must be after check-in date');
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights > 30) {
      errors.push('Maximum stay is 30 nights');
    }

    // Validate guests
    if (bookingData.adults < 1) {
      errors.push('At least one adult is required');
    }

    if (bookingData.adults > 8) {
      errors.push('Maximum 8 adults per room');
    }

    if (bookingData.children && bookingData.children > 6) {
      errors.push('Maximum 6 children per room');
    }

    if (bookingData.rooms && bookingData.rooms > 10) {
      errors.push('Maximum 10 rooms per booking');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate nights between two dates
   */
  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, nights);
  }

  /**
   * Format price with currency symbol
   */
  formatPrice(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'CA$',
      AUD: 'A$',
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Check if API is configured and ready
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Get API environment info
   */
  getEnvironmentInfo(): {
    isSandbox: boolean;
    baseUrl: string;
    hasApiKey: boolean;
  } {
    return {
      isSandbox: this.isSandbox,
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
    };
  }

  /**
   * Strip HTML tags from description
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ============================================
  // GUEST MANAGEMENT METHODS
  // ============================================

  /**
   * Create a new guest profile
   */
  async createGuest(params: CreateGuestParams): Promise<Guest> {
    try {
      console.log('🔍 LiteAPI: Creating guest profile');

      const response = await axios.post(
        `${this.baseUrl}/guests`,
        params,
        { headers: this.getHeaders(), timeout: 15000 }
      );

      const guest = response.data.data;
      console.log(`✅ LiteAPI: Guest created - ${guest.email}`);

      return guest;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error creating guest:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to create guest');
    }
  }

  /**
   * Get guest profile by ID
   */
  async getGuest(guestId: string): Promise<Guest> {
    try {
      console.log(`🔍 LiteAPI: Getting guest ${guestId}`);

      const response = await axios.get(
        `${this.baseUrl}/guests/${guestId}`,
        { headers: this.getHeaders(), timeout: 10000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting guest:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get guest');
    }
  }

  /**
   * Update guest profile
   */
  async updateGuest(guestId: string, updates: Partial<CreateGuestParams>): Promise<Guest> {
    try {
      console.log(`🔍 LiteAPI: Updating guest ${guestId}`);

      const response = await axios.put(
        `${this.baseUrl}/guests/${guestId}`,
        updates,
        { headers: this.getHeaders(), timeout: 15000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error updating guest:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to update guest');
    }
  }

  /**
   * Get guest booking history
   */
  async getGuestBookings(guestId: string, params?: {
    status?: 'confirmed' | 'cancelled' | 'completed';
    limit?: number;
  }): Promise<{ data: GuestBooking[]; total: number }> {
    try {
      console.log(`🔍 LiteAPI: Getting bookings for guest ${guestId}`);

      const response = await axios.get(
        `${this.baseUrl}/guests/${guestId}/bookings`,
        {
          params,
          headers: this.getHeaders(),
          timeout: 15000,
        }
      );

      const bookings = response.data.data || [];
      console.log(`✅ LiteAPI: Found ${bookings.length} bookings`);

      return {
        data: bookings,
        total: response.data.total || bookings.length,
      };
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting guest bookings:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get guest bookings');
    }
  }

  // ============================================
  // LOYALTY PROGRAM METHODS
  // ============================================

  /**
   * Get loyalty program configuration
   */
  async getLoyaltyConfig(): Promise<LoyaltyConfig> {
    try {
      console.log('🔍 LiteAPI: Getting loyalty program configuration');

      const response = await axios.get(
        `${this.baseUrl}/loyalties`,
        { headers: this.getHeaders(), timeout: 10000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting loyalty config:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get loyalty config');
    }
  }

  /**
   * Get guest loyalty points balance
   */
  async getGuestLoyaltyPoints(guestId: string): Promise<GuestLoyaltyPoints> {
    try {
      console.log(`🔍 LiteAPI: Getting loyalty points for guest ${guestId}`);

      const response = await axios.get(
        `${this.baseUrl}/guests/${guestId}/loyalty-points`,
        { headers: this.getHeaders(), timeout: 10000 }
      );

      const points = response.data.data;
      console.log(`✅ LiteAPI: Guest has ${points.currentPoints} points`);

      return points;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting loyalty points:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get loyalty points');
    }
  }

  /**
   * Redeem loyalty points
   */
  async redeemLoyaltyPoints(params: RedeemPointsParams): Promise<{
    success: boolean;
    redemptionId: string;
    pointsRedeemed: number;
    valueReceived: number;
    newBalance: number;
  }> {
    try {
      console.log(`🔍 LiteAPI: Redeeming ${params.points} points for guest ${params.guestId}`);

      const response = await axios.post(
        `${this.baseUrl}/guests/${params.guestId}/loyalty-points/redeem`,
        {
          points: params.points,
          redemptionType: params.redemptionType,
          bookingId: params.bookingId,
        },
        { headers: this.getHeaders(), timeout: 15000 }
      );

      const result = response.data.data;
      console.log(`✅ LiteAPI: Redeemed ${result.pointsRedeemed} points`);

      return result;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error redeeming points:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to redeem points');
    }
  }

  /**
   * Get loyalty points transaction history
   */
  async getLoyaltyHistory(guestId: string, limit = 50): Promise<PointsTransaction[]> {
    try {
      console.log(`🔍 LiteAPI: Getting loyalty history for guest ${guestId}`);

      const response = await axios.get(
        `${this.baseUrl}/guests/${guestId}/loyalty-points/history`,
        {
          params: { limit },
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting loyalty history:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get loyalty history');
    }
  }

  // ============================================
  // VOUCHER SYSTEM METHODS
  // ============================================

  /**
   * Create a new promotional voucher
   */
  async createVoucher(params: CreateVoucherParams): Promise<Voucher> {
    try {
      console.log(`🔍 LiteAPI: Creating voucher ${params.code}`);

      const response = await axios.post(
        `${this.baseUrl}/vouchers`,
        params,
        { headers: this.getHeaders(), timeout: 15000 }
      );

      const voucher = response.data.data;
      console.log(`✅ LiteAPI: Voucher created - ${voucher.code}`);

      return voucher;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error creating voucher:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to create voucher');
    }
  }

  /**
   * Get all vouchers
   */
  async getVouchers(params?: {
    status?: 'active' | 'inactive' | 'expired';
    limit?: number;
    offset?: number;
  }): Promise<{ data: Voucher[]; total: number }> {
    try {
      console.log('🔍 LiteAPI: Getting vouchers');

      const response = await axios.get(
        `${this.baseUrl}/vouchers`,
        {
          params,
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      const vouchers = response.data.data || [];
      console.log(`✅ LiteAPI: Found ${vouchers.length} vouchers`);

      return {
        data: vouchers,
        total: response.data.total || vouchers.length,
      };
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting vouchers:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get vouchers');
    }
  }

  /**
   * Get voucher by ID
   */
  async getVoucher(voucherId: string): Promise<Voucher> {
    try {
      console.log(`🔍 LiteAPI: Getting voucher ${voucherId}`);

      const response = await axios.get(
        `${this.baseUrl}/vouchers/${voucherId}`,
        { headers: this.getHeaders(), timeout: 10000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting voucher:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get voucher');
    }
  }

  /**
   * Update voucher
   */
  async updateVoucher(voucherId: string, updates: Partial<CreateVoucherParams>): Promise<Voucher> {
    try {
      console.log(`🔍 LiteAPI: Updating voucher ${voucherId}`);

      const response = await axios.put(
        `${this.baseUrl}/vouchers/${voucherId}`,
        updates,
        { headers: this.getHeaders(), timeout: 15000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error updating voucher:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to update voucher');
    }
  }

  /**
   * Update voucher status
   */
  async updateVoucherStatus(voucherId: string, status: 'active' | 'inactive'): Promise<Voucher> {
    try {
      console.log(`🔍 LiteAPI: Updating voucher ${voucherId} status to ${status}`);

      const response = await axios.put(
        `${this.baseUrl}/vouchers/${voucherId}/status`,
        { status },
        { headers: this.getHeaders(), timeout: 10000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error updating voucher status:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to update voucher status');
    }
  }

  /**
   * Delete voucher
   */
  async deleteVoucher(voucherId: string): Promise<{ success: boolean }> {
    try {
      console.log(`🔍 LiteAPI: Deleting voucher ${voucherId}`);

      await axios.delete(
        `${this.baseUrl}/vouchers/${voucherId}`,
        { headers: this.getHeaders(), timeout: 10000 }
      );

      console.log(`✅ LiteAPI: Voucher deleted`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ LiteAPI: Error deleting voucher:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to delete voucher');
    }
  }

  /**
   * Validate voucher code and calculate discount
   */
  async validateVoucher(params: ValidateVoucherParams): Promise<VoucherValidationResult> {
    try {
      console.log(`🔍 LiteAPI: Validating voucher ${params.code}`);

      const response = await axios.post(
        `${this.baseUrl}/vouchers/validate`,
        params,
        { headers: this.getHeaders(), timeout: 10000 }
      );

      const result = response.data.data;

      if (result.valid) {
        console.log(`✅ LiteAPI: Voucher valid - Discount: ${result.discountAmount}`);
      } else {
        console.log(`❌ LiteAPI: Voucher invalid - ${result.reason}`);
      }

      return result;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error validating voucher:', error.message);
      return {
        valid: false,
        error: error.response?.data?.error?.message || 'Failed to validate voucher',
      };
    }
  }

  /**
   * Get voucher redemption history
   */
  async getVoucherHistory(params?: {
    voucherId?: string;
    guestId?: string;
    limit?: number;
  }): Promise<VoucherRedemption[]> {
    try {
      console.log('🔍 LiteAPI: Getting voucher redemption history');

      const response = await axios.get(
        `${this.baseUrl}/vouchers/history`,
        {
          params,
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );

      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting voucher history:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get voucher history');
    }
  }

  // ============================================
  // ANALYTICS METHODS
  // ============================================

  /**
   * Get weekly analytics report
   */
  async getWeeklyAnalytics(weekStartDate?: string): Promise<WeeklyAnalytics> {
    try {
      console.log('🔍 LiteAPI: Getting weekly analytics');

      const response = await axios.post(
        `${this.baseUrl}/analytics/weekly`,
        { weekStartDate },
        { headers: this.getHeaders(), timeout: 20000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting weekly analytics:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get analytics');
    }
  }

  /**
   * Get detailed analytics report
   */
  async getAnalyticsReport(params: {
    startDate: string;
    endDate: string;
    metrics?: string[];
  }): Promise<any> {
    try {
      console.log('🔍 LiteAPI: Getting analytics report');

      const response = await axios.post(
        `${this.baseUrl}/analytics/report`,
        params,
        { headers: this.getHeaders(), timeout: 30000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting analytics report:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get analytics report');
    }
  }

  /**
   * Get most-booked hotels rankings
   */
  async getHotelRankings(period: 'week' | 'month' | 'year' = 'month'): Promise<HotelRankings> {
    try {
      console.log(`🔍 LiteAPI: Getting hotel rankings for ${period}`);

      const response = await axios.post(
        `${this.baseUrl}/analytics/hotels`,
        { period },
        { headers: this.getHeaders(), timeout: 20000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting hotel rankings:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get hotel rankings');
    }
  }

  /**
   * Get market-specific data
   */
  async getMarketData(marketId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<MarketData> {
    try {
      console.log(`🔍 LiteAPI: Getting market data for ${marketId}`);

      const response = await axios.post(
        `${this.baseUrl}/analytics/markets`,
        { marketId, ...params },
        { headers: this.getHeaders(), timeout: 20000 }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('❌ LiteAPI: Error getting market data:', error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get market data');
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const liteAPI = new LiteAPI();

// Export all types for use in other modules
export type {
  // Core types
  HotelSearchParams,
  HotelDetailsParams,
  Occupancy,
  LiteAPIHotel,
  LiteAPIRoomRate,
  LiteAPIRoomType,
  NormalizedHotel,
  NormalizedRoom,
  // Enhanced types
  HotelDetailedInfo,
  ReviewSentiment,
  HotelReview,
  PlaceSearchResult,
  PrebookResponse,
  BookingResponse,
  BookingDetailsResponse,
  CancellationResponse,
};
