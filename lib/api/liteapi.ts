// LiteAPI Integration for Hotel Search
// Two-step flow: 1) Get hotel list with static data, 2) Get rates for those hotels
import axios, { AxiosError } from 'axios';

interface HotelSearchParams {
  latitude?: number;
  longitude?: number;
  countryCode?: string;
  cityName?: string;
  checkinDate: string;
  checkoutDate: string;
  adults: number;
  children?: number;
  currency?: string;
  guestNationality?: string;
  limit?: number;
}

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
  chain?: string;
  currency: string;
  lowestPrice?: number; // TOTAL price for entire stay
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
  }): Promise<{ hotels: LiteAPIHotel[]; hotelIds: string[] }> {
    try {
      const queryParams: Record<string, string | number> = {};

      if (params.latitude !== undefined && params.longitude !== undefined) {
        queryParams.latitude = params.latitude;
        queryParams.longitude = params.longitude;
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
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting hotels:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to get hotels');
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
          };

          // Use the CORRECT endpoint: /hotels/rates (not /hotels/min-rates which doesn't exist)
          const response = await axios.post(`${this.baseUrl}/hotels/rates`, requestBody, {
            headers: this.getHeaders(),
            timeout: 15000, // 15 second timeout per batch
          });

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

            // Find the minimum price across all room types
            let minPrice = Infinity;
            let currency = params.currency || 'USD';

            for (const roomType of roomTypes) {
              const price = roomType.offerRetailRate?.amount;
              if (price && price < minPrice) {
                minPrice = price;
                currency = roomType.offerRetailRate?.currency || currency;
              }
            }

            return {
              hotelId,
              minimumRate: { amount: minPrice === Infinity ? 0 : minPrice, currency },
              available: minPrice !== Infinity
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
        checkin: params.checkinDate,
        checkout: params.checkoutDate,
        occupancies: [{ adults: params.adults, children: params.children ? [params.children] : undefined }],
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
      const checkinDate = new Date(params.checkIn);
      const checkoutDate = new Date(params.checkOut);
      const nights = Math.max(1, Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)));

      console.log(`📅 LiteAPI: Calculated ${nights} nights (${params.checkIn} to ${params.checkOut})`);

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
        checkin: params.checkIn,
        checkout: params.checkOut,
        occupancies: [{ adults, children: children ? [children] : undefined }],
        currency: params.currency || 'USD',
        guestNationality: params.guestNationality || 'US',
      });

      // Step 3: Merge hotel data with minimum rates
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
          currency: minRateData.minimumRate.currency,
          lowestPrice: totalPrice, // TOTAL price for entire stay
          lowestPricePerNight: perNightPrice, // Per-night price
          rooms: [], // No room details in min rates mode
          source: 'liteapi',
        });
      }

      // Note: Fallback removed - getHotelMinimumRates now uses correct /hotels/rates endpoint

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
   * @returns Prebook response with prebookId for completing the booking
   */
  async preBookHotel(offerId: string): Promise<PrebookResponse> {
    try {
      console.log(`🔍 LiteAPI: Pre-booking offer ${offerId}`);

      const response = await axios.post(
        `${this.baseUrl}/rates/prebook`,
        { offerId },
        { headers: this.getHeaders(), timeout: 30000 }
      );

      const data = response.data.data;

      console.log(`✅ LiteAPI: Pre-book successful (ID: ${data.prebookId})`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Price: ${data.price?.amount} ${data.price?.currency}`);
      console.log(`   Expires: ${data.expiresAt}`);

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
    holderName?: string;
    specialRequests?: string;
  }): Promise<BookingResponse> {
    try {
      console.log(`🔍 LiteAPI: Completing booking for prebook ${bookingData.prebookId}`);

      const response = await axios.post(
        `${this.baseUrl}/rates/book`,
        bookingData,
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
      id: number;
      name: string;
      category?: string;
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
