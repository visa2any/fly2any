/**
 * Journey API Service
 * Unified interface for flight and hotel search in Journey system
 * Fly2Any Travel Operating System
 */

import { Journey, JourneyFlight, JourneyHotel } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface JourneyFlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  maxResults?: number;
  nonStop?: boolean;
}

export interface JourneyHotelSearchParams {
  destination: string; // City name or airport code
  latitude?: number;
  longitude?: number;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  rooms?: number;
  currency?: string;
  maxResults?: number;
  minRating?: number;
}

export interface FlightSearchResult {
  id: string;
  airline: {
    code: string;
    name: string;
    logo?: string;
  };
  outbound: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    stops: number;
    flightNumber: string;
    aircraft?: string;
  };
  inbound?: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    stops: number;
    flightNumber: string;
    aircraft?: string;
  };
  cabinClass: string;
  price: {
    amount: number;
    currency: string;
    perPerson: number;
  };
  baggageIncluded: boolean;
  refundable: boolean;
  seatsAvailable?: number;
}

export interface HotelSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  stars: number;
  rating: number;
  reviewCount: number;
  thumbnail?: string;
  images: string[];
  amenities: string[];
  checkIn: string;
  checkOut: string;
  price: {
    amount: number;
    currency: string;
    perNight: number;
  };
  refundable: boolean;
  breakfastIncluded: boolean;
  distance?: number;
  roomType?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

class JourneyAPIClient {
  private baseUrl = '/api';

  /**
   * Search flights for journey
   */
  async searchFlights(params: JourneyFlightSearchParams): Promise<{
    results: FlightSearchResult[];
    meta: { count: number; source: string };
  }> {
    try {
      const searchParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        adults: String(params.travelers.adults),
        children: String(params.travelers.children),
        infants: String(params.travelers.infants),
        cabinClass: params.cabinClass || 'economy',
      });

      if (params.returnDate) {
        searchParams.set('returnDate', params.returnDate);
      }

      if (params.nonStop) {
        searchParams.set('nonStop', 'true');
      }

      if (params.maxResults) {
        searchParams.set('limit', String(params.maxResults));
      }

      const response = await fetch(`${this.baseUrl}/flights/search?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Flight search failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform Duffel response to JourneyFlight format
      const results = this.transformFlightResults(data.offers || data.data || []);

      return {
        results,
        meta: {
          count: results.length,
          source: 'duffel',
        },
      };
    } catch (error) {
      console.error('Flight search error:', error);
      return {
        results: [],
        meta: { count: 0, source: 'error' },
      };
    }
  }

  /**
   * Search hotels for journey
   * Uses GET endpoint: /api/hotels/search?query=&checkIn=&checkOut=&adults=
   */
  async searchHotels(params: JourneyHotelSearchParams): Promise<{
    results: HotelSearchResult[];
    meta: { count: number; source: string };
  }> {
    try {
      const searchParams = new URLSearchParams({
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        adults: String(params.guests.adults),
      });

      // Location: prefer lat/lng, fallback to query string
      if (params.latitude && params.longitude) {
        searchParams.set('lat', String(params.latitude));
        searchParams.set('lng', String(params.longitude));
      } else if (params.destination) {
        searchParams.set('query', params.destination);
      }

      if (params.guests.children > 0) {
        searchParams.set('children', String(params.guests.children));
      }

      if (params.rooms) {
        searchParams.set('rooms', String(params.rooms));
      }

      if (params.maxResults) {
        searchParams.set('limit', String(params.maxResults));
      }

      if (params.currency) {
        searchParams.set('currency', params.currency);
      }

      const response = await fetch(`${this.baseUrl}/hotels/search?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Hotel search failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform LiteAPI response to JourneyHotel format
      const results = this.transformHotelResults(data.hotels || data.data || [], params);

      return {
        results,
        meta: {
          count: results.length,
          source: 'liteapi',
        },
      };
    } catch (error) {
      console.error('Hotel search error:', error);
      return {
        results: [],
        meta: { count: 0, source: 'error' },
      };
    }
  }

  /**
   * Transform API flight response to JourneyFlight format
   */
  private transformFlightResults(offers: any[]): FlightSearchResult[] {
    return offers.slice(0, 20).map((offer, index) => {
      const outboundSlice = offer.slices?.[0];
      const inboundSlice = offer.slices?.[1];
      const outboundSegment = outboundSlice?.segments?.[0];
      const inboundSegment = inboundSlice?.segments?.[0];

      const airline = outboundSegment?.operating_carrier || outboundSegment?.marketing_carrier;
      const totalAmount = parseFloat(offer.total_amount || offer.base_amount || '0');
      const passengers = offer.passengers?.length || 1;

      return {
        id: offer.id || `flight-${index}`,
        airline: {
          code: airline?.iata_code || 'XX',
          name: airline?.name || 'Unknown Airline',
          logo: airline?.logo_lockup_url || undefined,
        },
        outbound: {
          departure: outboundSegment?.origin?.iata_code || '',
          arrival: outboundSegment?.destination?.iata_code || '',
          departureTime: outboundSegment?.departing_at || '',
          arrivalTime: outboundSegment?.arriving_at || '',
          duration: this.calculateDuration(
            outboundSegment?.departing_at,
            outboundSegment?.arriving_at
          ),
          stops: (outboundSlice?.segments?.length || 1) - 1,
          flightNumber: `${airline?.iata_code || 'XX'}${outboundSegment?.operating_carrier_flight_number || '000'}`,
          aircraft: outboundSegment?.aircraft?.name,
        },
        inbound: inboundSegment ? {
          departure: inboundSegment?.origin?.iata_code || '',
          arrival: inboundSegment?.destination?.iata_code || '',
          departureTime: inboundSegment?.departing_at || '',
          arrivalTime: inboundSegment?.arriving_at || '',
          duration: this.calculateDuration(
            inboundSegment?.departing_at,
            inboundSegment?.arriving_at
          ),
          stops: (inboundSlice?.segments?.length || 1) - 1,
          flightNumber: `${inboundSegment?.marketing_carrier?.iata_code || 'XX'}${inboundSegment?.operating_carrier_flight_number || '000'}`,
          aircraft: inboundSegment?.aircraft?.name,
        } : undefined,
        cabinClass: outboundSegment?.passengers?.[0]?.cabin_class || 'economy',
        price: {
          amount: totalAmount,
          currency: offer.total_currency || 'USD',
          perPerson: totalAmount / passengers,
        },
        baggageIncluded: outboundSegment?.passengers?.[0]?.baggages?.some(
          (b: any) => b.type === 'checked' && b.quantity > 0
        ) || false,
        refundable: offer.payment_requirements?.refundable_at !== null,
        seatsAvailable: offer.available_services?.length || undefined,
      };
    });
  }

  /**
   * Transform API hotel response to JourneyHotel format
   * Handles LiteAPI/Hotelbeds response format
   */
  private transformHotelResults(
    hotels: any[],
    params: JourneyHotelSearchParams
  ): HotelSearchResult[] {
    return hotels.slice(0, 20).map((hotel, index) => {
      const nights = this.calculateNights(params.checkIn, params.checkOut);

      // Handle various price formats from different APIs
      const priceTotal = hotel.lowestPrice || hotel.minRate?.amount ||
                         hotel.price?.amount || hotel.rates?.[0]?.totalPrice?.amount || 0;
      const perNight = hotel.lowestPricePerNight ||
                       (nights > 0 ? priceTotal / nights : priceTotal);

      // Handle images from different API formats
      let images: string[] = [];
      if (Array.isArray(hotel.images)) {
        images = hotel.images.map((img: any) =>
          typeof img === 'string' ? img : (img.url || img.src || '')
        ).filter(Boolean);
      } else if (hotel.hotelPhotos) {
        images = hotel.hotelPhotos.map((p: any) => p.url).filter(Boolean);
      }

      const thumbnail = hotel.main_photo || hotel.thumbnail || images[0] || '';

      // Handle address
      const address = typeof hotel.address === 'object'
        ? `${hotel.address.street || ''}, ${hotel.address.city || ''}`.trim().replace(/^,\s*/, '')
        : (hotel.address || hotel.location?.address || '');

      return {
        id: hotel.id || hotel.hotelId || `hotel-${index}`,
        name: hotel.name || 'Unknown Hotel',
        address,
        city: hotel.city || hotel.address?.city || hotel.location?.city || params.destination,
        country: hotel.country || hotel.address?.country || hotel.location?.country || '',
        stars: hotel.stars || hotel.starRating || hotel.star_rating || 3,
        rating: hotel.rating || hotel.reviewScore || hotel.review_score || 0,
        reviewCount: hotel.reviewCount || hotel.review_count || 0,
        thumbnail,
        images,
        amenities: hotel.amenities || hotel.facilities || [],
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        price: {
          amount: Number(priceTotal) || 0,
          currency: hotel.currency || params.currency || 'USD',
          perNight: Number(perNight) || 0,
        },
        refundable: hotel.refundable !== false,
        breakfastIncluded: hotel.boardType === 'BB' || hotel.breakfast_included ||
                           hotel.mealPlan === 'breakfast' || false,
        distance: hotel.distanceKm || hotel.distance,
        roomType: hotel.roomType || hotel.room_name || hotel.rates?.[0]?.roomType,
      };
    });
  }

  /**
   * Calculate flight duration in minutes
   */
  private calculateDuration(departure: string, arrival: string): number {
    if (!departure || !arrival) return 0;
    const depTime = new Date(departure).getTime();
    const arrTime = new Date(arrival).getTime();
    return Math.round((arrTime - depTime) / (1000 * 60));
  }

  /**
   * Calculate number of nights
   */
  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }

  /**
   * Convert FlightSearchResult to JourneyFlight
   */
  toJourneyFlight(result: FlightSearchResult, isReturn: boolean = false): JourneyFlight {
    const segment = isReturn && result.inbound ? result.inbound : result.outbound;

    return {
      id: result.id,
      type: isReturn ? 'return' : 'outbound',
      airline: result.airline,
      flightNumber: segment.flightNumber,
      departure: {
        airport: segment.departure,
        time: segment.departureTime,
      },
      arrival: {
        airport: segment.arrival,
        time: segment.arrivalTime,
      },
      duration: segment.duration,
      stops: segment.stops,
      cabinClass: result.cabinClass,
      price: result.price,
      status: 'selected',
      baggageIncluded: result.baggageIncluded,
      aircraft: segment.aircraft,
    };
  }

  /**
   * Convert HotelSearchResult to JourneyHotel
   */
  toJourneyHotel(result: HotelSearchResult): JourneyHotel {
    return {
      id: result.id,
      name: result.name,
      address: result.address,
      stars: result.stars,
      rating: result.rating,
      reviewCount: result.reviewCount,
      thumbnail: result.thumbnail,
      images: result.images,
      amenities: result.amenities,
      checkIn: result.checkIn,
      checkOut: result.checkOut,
      roomType: result.roomType || 'Standard Room',
      price: result.price,
      status: 'selected',
      refundable: result.refundable,
      breakfastIncluded: result.breakfastIncluded,
    };
  }
}

// Export singleton instance
export const JourneyAPI = new JourneyAPIClient();
export default JourneyAPI;
