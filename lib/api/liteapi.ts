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
  rating: number;
  reviewCount: number;
  image: string;
  thumbnail: string;
  chain?: string;
  currency: string;
  lowestPrice?: number;
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
          rating: hotelInfo.rating || 0,
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
   * Get hotel details by ID
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
   */
  async preBookHotel(offerId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rates/prebook`,
        { offerId },
        { headers: this.getHeaders(), timeout: 30000 }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error pre-booking:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to pre-book hotel');
    }
  }

  /**
   * Complete hotel booking
   */
  async bookHotel(bookingData: {
    prebookId: string;
    guestInfo: {
      guestFirstName: string;
      guestLastName: string;
      guestEmail: string;
    };
    paymentMethod?: string;
    holderName?: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rates/book`,
        bookingData,
        { headers: this.getHeaders(), timeout: 60000 }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error booking:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error?.message || 'Failed to book hotel');
    }
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/bookings/${bookingId}`, {
        headers: this.getHeaders(),
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error getting booking:', axiosError.response?.data || axiosError.message);
      throw new Error('Failed to get booking');
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/bookings/${bookingId}`,
        {},
        { headers: this.getHeaders(), timeout: 30000 }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      console.error('❌ LiteAPI: Error canceling booking:', axiosError.response?.data || axiosError.message);
      throw new Error('Failed to cancel booking');
    }
  }

  /**
   * Search places for autocomplete suggestions
   * Returns cities, neighborhoods, landmarks, and points of interest
   */
  async searchPlaces(query: string): Promise<{
    data: Array<{
      textForSearch: string;
      placeId: string;
      type: string;
      countryCode: string;
      countryName: string;
      cityName?: string;
      stateCode?: string;
      latitude?: number;
      longitude?: number;
    }>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/data/places`, {
        params: {
          textForSearch: query,
          limit: 15,
        },
        headers: this.getHeaders(),
        timeout: 10000,
      });

      console.log(`✅ LiteAPI: Found ${response.data.data?.length || 0} places for "${query}"`);
      return { data: response.data.data || [] };
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
   * Strip HTML tags from description
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const liteAPI = new LiteAPI();
