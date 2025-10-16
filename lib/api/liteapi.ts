// LiteAPI Integration for Hotel Search
import axios from 'axios';

interface HotelSearchParams {
  cityCode: string;
  checkinDate: string;
  checkoutDate: string;
  adults: number;
  children?: number;
  currency?: string;
  guestNationality?: string;
}

interface HotelDetailsParams {
  hotelId: string;
  currency?: string;
}

class LiteAPI {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private isSandbox: boolean;

  constructor() {
    this.isSandbox = process.env.LITEAPI_ENVIRONMENT !== 'production';
    this.apiKey = this.isSandbox
      ? process.env.LITEAPI_SANDBOX_PUBLIC_KEY || ''
      : process.env.LITEAPI_PUBLIC_KEY || '';
    this.apiSecret = this.isSandbox
      ? process.env.LITEAPI_SANDBOX_PRIVATE_KEY || ''
      : process.env.LITEAPI_PRIVATE_KEY || '';
    this.baseUrl = 'https://api.liteapi.travel/v3.0';
  }

  /**
   * Get authentication headers
   */
  private getHeaders() {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Search hotels by city
   */
  async searchHotels(params: HotelSearchParams) {
    try {
      const response = await axios.get(`${this.baseUrl}/hotels`, {
        params: {
          cityCode: params.cityCode,
          checkin: params.checkinDate,
          checkout: params.checkoutDate,
          adults: params.adults,
          children: params.children || 0,
          currency: params.currency || 'USD',
          guestNationality: params.guestNationality || 'US',
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Error searching hotels:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to search hotels');
    }
  }

  /**
   * Get hotel details including rates and rooms
   */
  async getHotelDetails(params: HotelDetailsParams) {
    try {
      const response = await axios.get(`${this.baseUrl}/hotels/${params.hotelId}`, {
        params: {
          currency: params.currency || 'USD',
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Error getting hotel details:', error.response?.data || error);
      throw new Error('Failed to get hotel details');
    }
  }

  /**
   * Get hotel rates for specific dates
   */
  async getHotelRates(hotelId: string, checkinDate: string, checkoutDate: string, adults: number, children: number = 0) {
    try {
      const response = await axios.get(`${this.baseUrl}/hotels/${hotelId}/rates`, {
        params: {
          checkin: checkinDate,
          checkout: checkoutDate,
          adults,
          children,
          currency: 'USD',
          guestNationality: 'US',
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Error getting hotel rates:', error.response?.data || error);
      throw new Error('Failed to get hotel rates');
    }
  }

  /**
   * Search cities by name
   */
  async searchCities(query: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/data/cities`, {
        params: {
          search: query,
        },
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Error searching cities:', error.response?.data || error);
      throw new Error('Failed to search cities');
    }
  }

  /**
   * Pre-book hotel (verify availability and pricing before final booking)
   */
  async preBookHotel(rateId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/bookings/prebook`,
        { rateId },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error pre-booking hotel:', error.response?.data || error);
      throw new Error('Failed to pre-book hotel');
    }
  }

  /**
   * Book hotel (final booking confirmation)
   */
  async bookHotel(bookingData: any) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/bookings/book`,
        bookingData,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error booking hotel:', error.response?.data || error);
      throw new Error('Failed to book hotel');
    }
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/bookings/${bookingId}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Error getting booking:', error.response?.data || error);
      throw new Error('Failed to get booking');
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string) {
    try {
      const response = await axios.delete(`${this.baseUrl}/bookings/${bookingId}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Error canceling booking:', error.response?.data || error);
      throw new Error('Failed to cancel booking');
    }
  }
}

export const liteAPI = new LiteAPI();
