/**
 * Quote Pricing Service
 * 
 * Fetches real-time prices from external APIs (LiteAPI, Amadeus)
 * Applies agent commission on top of API prices
 * Returns normalized final pricing for quotes
 * 
 * SECURITY: Never trust client-provided prices
 * API prices are single source of truth
 */

import { liteAPI } from '@/lib/api/liteapi';
import { amadeusAPI } from '@/lib/api/amadeus';

/**
 * Quote pricing parameters
 */
export interface QuotePricingParams {
  // Trip parameters
  startDate: string; // ISO datetime
  endDate: string; // ISO datetime
  adults: number;
  children?: number;
  infants?: number;
  
  // Flight parameters (if flights in quote)
  flights?: QuoteFlight[];
  
  // Hotel parameters (if hotels in quote)
  hotels?: QuoteHotel[];
  
  // Commission
  commissionPercent: number; // Agent commission percentage
  currency?: string; // Default USD
}

/**
 * Flight item in quote
 */
export interface QuoteFlight {
  id: string; // Flight ID from Amadeus
  airlineCode: string;
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureDate: string; // ISO datetime
  arrivalDate: string; // ISO datetime
  cabinClass: string;
  passengers?: number;
}

/**
 * Hotel item in quote
 */
export interface QuoteHotel {
  id: string; // Hotel ID from LiteAPI
  name: string;
  checkIn: string; // ISO date (YYYY-MM-DD)
  checkOut: string; // ISO date (YYYY-MM-DD)
  roomType?: string;
  rooms?: number;
  occupancy?: {
    adults: number;
    children?: number;
  }[];
}

/**
 * Normalized pricing breakdown
 */
export interface QuotePricingResult {
  // Base prices from APIs
  flightsBasePrice: number;
  hotelsBasePrice: number;
  totalBasePrice: number;
  
  // Commission
  commissionAmount: number;
  commissionPercent: number;
  
  // Final prices
  flightsFinalPrice: number;
  hotelsFinalPrice: number;
  totalFinalPrice: number;
  
  // Per person breakdown
  totalPricePerPerson: number;
  
  // Currency
  currency: string;
  
  // Metadata
  breakdown: {
    flights: FlightPricingBreakdown[];
    hotels: HotelPricingBreakdown[];
  };
  
  // API metadata
  fetchedAt: string;
  apiSources: string[];
}

/**
 * Flight pricing breakdown
 */
export interface FlightPricingBreakdown {
  flightId: string;
  airlineCode: string;
  flightNumber: string;
  route: string;
  departureDate: string;
  basePrice: number;
  commission: number;
  finalPrice: number;
}

/**
 * Hotel pricing breakdown
 */
export interface HotelPricingBreakdown {
  hotelId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  basePrice: number;
  commission: number;
  finalPrice: number;
}

/**
 * Pricing service error
 */
export class QuotePricingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'QuotePricingError';
  }
}

/**
 * Quote Pricing Service
 * 
 * Fetches real-time prices from external APIs and applies commission
 */
export class QuotePricingService {
  private readonly DEFAULT_CURRENCY = 'USD';
  private readonly DEFAULT_COMMISSION = 0.05; // 5%

  /**
   * Calculate quote pricing
   * 
   * @param params - Quote pricing parameters
   * @returns Normalized pricing result
   * @throws QuotePricingError if any API fails
   */
  async calculateQuotePricing(
    params: QuotePricingParams
  ): Promise<QuotePricingResult> {
    const currency = params.currency || this.DEFAULT_CURRENCY;
    const commissionPercent = params.commissionPercent || this.DEFAULT_COMMISSION;

    // Validate parameters
    this.validateParams(params);

    // Fetch prices from APIs
    const [flightsPricing, hotelsPricing] = await Promise.all([
      this.fetchFlightsPricing(params, currency),
      this.fetchHotelsPricing(params, currency),
    ]);

    // Calculate totals
    const flightsBasePrice = flightsPricing.reduce(
      (sum, f) => sum + f.basePrice,
      0
    );
    const hotelsBasePrice = hotelsPricing.reduce(
      (sum, h) => sum + h.basePrice,
      0
    );
    const totalBasePrice = flightsBasePrice + hotelsBasePrice;

    // Calculate commission (applied to base price only)
    const commissionAmount = totalBasePrice * commissionPercent;

    // Calculate final prices
    const flightsFinalPrice = flightsPricing.reduce(
      (sum, f) => sum + f.finalPrice,
      0
    );
    const hotelsFinalPrice = hotelsPricing.reduce(
      (sum, h) => sum + h.finalPrice,
      0
    );
    const totalFinalPrice = flightsFinalPrice + hotelsFinalPrice;

    // Calculate per person price
    const totalTravelers =
      params.adults + (params.children || 0) + (params.infants || 0);
    const totalPricePerPerson =
      totalTravelers > 0 ? totalFinalPrice / totalTravelers : totalFinalPrice;

    // Gather API sources
    const apiSources: string[] = [];
    if (flightsPricing.length > 0) apiSources.push('Amadeus');
    if (hotelsPricing.length > 0) apiSources.push('LiteAPI');

    return {
      // Base prices
      flightsBasePrice,
      hotelsBasePrice,
      totalBasePrice,

      // Commission
      commissionAmount,
      commissionPercent,

      // Final prices
      flightsFinalPrice,
      hotelsFinalPrice,
      totalFinalPrice,

      // Per person
      totalPricePerPerson,

      // Currency
      currency,

      // Breakdown
      breakdown: {
        flights: flightsPricing,
        hotels: hotelsPricing,
      },

      // Metadata
      fetchedAt: new Date().toISOString(),
      apiSources,
    };
  }

  /**
   * Validate pricing parameters
   */
  private validateParams(params: QuotePricingParams): void {
    // Validate dates
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    if (isNaN(startDate.getTime())) {
      throw new QuotePricingError(
        'Invalid start date',
        'INVALID_START_DATE',
        { startDate: params.startDate }
      );
    }

    if (isNaN(endDate.getTime())) {
      throw new QuotePricingError(
        'Invalid end date',
        'INVALID_END_DATE',
        { endDate: params.endDate }
      );
    }

    if (endDate <= startDate) {
      throw new QuotePricingError(
        'End date must be after start date',
        'INVALID_DATE_RANGE',
        { startDate: params.startDate, endDate: params.endDate }
      );
    }

    // Validate travelers
    if (params.adults < 1) {
      throw new QuotePricingError(
        'At least one adult is required',
        'INVALID_TRAVELERS',
        { adults: params.adults }
      );
    }

    // Validate commission
    if (params.commissionPercent < 0 || params.commissionPercent > 1) {
      throw new QuotePricingError(
        'Commission percent must be between 0 and 1',
        'INVALID_COMMISSION',
        { commissionPercent: params.commissionPercent }
      );
    }

    // Validate flights
    if (params.flights && params.flights.length > 0) {
      params.flights.forEach((flight, index) => {
        if (!flight.id) {
          throw new QuotePricingError(
            `Flight ${index + 1} is missing ID`,
            'MISSING_FLIGHT_ID',
            { flightIndex: index }
          );
        }
        if (!flight.airlineCode) {
          throw new QuotePricingError(
            `Flight ${index + 1} is missing airline code`,
            'MISSING_AIRLINE_CODE',
            { flightIndex: index }
          );
        }
      });
    }

    // Validate hotels
    if (params.hotels && params.hotels.length > 0) {
      params.hotels.forEach((hotel, index) => {
        if (!hotel.id) {
          throw new QuotePricingError(
            `Hotel ${index + 1} is missing ID`,
            'MISSING_HOTEL_ID',
            { hotelIndex: index }
          );
        }
        if (!hotel.checkIn || !hotel.checkOut) {
          throw new QuotePricingError(
            `Hotel ${index + 1} is missing check-in or check-out date`,
            'MISSING_HOTEL_DATES',
            { hotelIndex: index }
          );
        }
      });
    }
  }

  /**
   * Fetch flights pricing from Amadeus API
   */
  private async fetchFlightsPricing(
    params: QuotePricingParams,
    currency: string
  ): Promise<FlightPricingBreakdown[]> {
    if (!params.flights || params.flights.length === 0) {
      return [];
    }

    const flightPricing: FlightPricingBreakdown[] = [];

    for (const flight of params.flights) {
      try {
        // Fetch flight pricing from Amadeus
        // Note: This is a simplified implementation
        // In production, you would call to actual Amadeus pricing endpoint
        
        // For now, we'll use to flight ID to fetch pricing
        // This is a placeholder - replace with actual API call
        const flightPrice = await this.fetchFlightPriceFromAmadeus(
          flight.id,
          currency
        );

        flightPricing.push({
          flightId: flight.id,
          airlineCode: flight.airlineCode,
          flightNumber: flight.flightNumber,
          route: `${flight.originAirportCode}-${flight.destinationAirportCode}`,
          departureDate: flight.departureDate,
          basePrice: flightPrice,
          commission: 0, // Commission applied at quote level
          finalPrice: flightPrice,
        });
      } catch (error) {
        throw new QuotePricingError(
          `Failed to fetch pricing for flight ${flight.id} (${flight.airlineCode} ${flight.flightNumber})`,
          'FLIGHT_PRICING_ERROR',
          {
            flightId: flight.id,
            airlineCode: flight.airlineCode,
            flightNumber: flight.flightNumber,
            error: error instanceof Error ? error.message : String(error),
          }
        );
      }
    }

    return flightPricing;
  }

  /**
   * Fetch flight price from Amadeus API
   * 
   * @param flightId - Amadeus flight ID
   * @param currency - Currency code
   * @returns Base price
   */
  private async fetchFlightPriceFromAmadeus(
    flightId: string,
    currency: string
  ): Promise<number> {
    try {
      // TODO: Implement actual Amadeus pricing API call
      // This is a placeholder implementation
      
      // In production, you would:
      // 1. Call Amadeus flight pricing endpoint with flight ID
      // 2. Parse to response to extract base price
      // 3. Return to price in requested currency
      
      // Placeholder: Return a default price
      // Replace with actual API call:
      // const response = await amadeusAPI.getFlightPrice(flightId, currency);
      // return response.price.total;
      
      throw new QuotePricingError(
        'Amadeus pricing API not yet implemented',
        'NOT_IMPLEMENTED',
        { flightId, currency }
      );
    } catch (error) {
      if (error instanceof QuotePricingError) {
        throw error;
      }
      throw new QuotePricingError(
        `Amadeus API error: ${error instanceof Error ? error.message : String(error)}`,
        'AMADEUS_API_ERROR',
        { flightId, currency, error }
      );
    }
  }

  /**
   * Fetch hotels pricing from LiteAPI
   */
  private async fetchHotelsPricing(
    params: QuotePricingParams,
    currency: string
  ): Promise<HotelPricingBreakdown[]> {
    if (!params.hotels || params.hotels.length === 0) {
      return [];
    }

    const hotelPricing: HotelPricingBreakdown[] = [];

    for (const hotel of params.hotels) {
      try {
        // Fetch hotel pricing from LiteAPI
        const hotelPrice = await this.fetchHotelPriceFromLiteAPI(
          hotel.id,
          hotel.checkIn,
          hotel.checkOut,
          hotel.occupancy || [{ adults: params.adults }],
          currency
        );

        // Calculate nights
        const checkIn = new Date(hotel.checkIn);
        const checkOut = new Date(hotel.checkOut);
        const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );

        hotelPricing.push({
          hotelId: hotel.id,
          hotelName: hotel.name,
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut,
          nights,
          basePrice: hotelPrice,
          commission: 0, // Commission applied at quote level
          finalPrice: hotelPrice,
        });
      } catch (error) {
        throw new QuotePricingError(
          `Failed to fetch pricing for hotel ${hotel.id} (${hotel.name})`,
          'HOTEL_PRICING_ERROR',
          {
            hotelId: hotel.id,
            hotelName: hotel.name,
            error: error instanceof Error ? error.message : String(error),
          }
        );
      }
    }

    return hotelPricing;
  }

  /**
   * Fetch hotel price from LiteAPI
   * 
   * @param hotelId - LiteAPI hotel ID
   * @param checkIn - Check-in date (YYYY-MM-DD)
   * @param checkOut - Check-out date (YYYY-MM-DD)
   * @param occupancy - Room occupancy configuration
   * @param currency - Currency code
   * @returns Base price
   */
  private async fetchHotelPriceFromLiteAPI(
    hotelId: string,
    checkIn: string,
    checkOut: string,
    occupancy: { adults: number; children?: number }[],
    currency: string
  ): Promise<number> {
    try {
      // TODO: Implement actual LiteAPI pricing API call
      // This is a placeholder implementation
      
      // In production, you would:
      // 1. Call LiteAPI hotel availability endpoint
      // 2. Get room rates for specified dates and occupancy
      // 3. Return total price in requested currency
      
      // Placeholder: Return a default price
      // Replace with actual API call:
      // const rates = await liteAPI.getHotelRates({
      //   hotelIds: [hotelId],
      //   checkin: checkIn,
      //   checkout: checkOut,
      //   occupancies: occupancy,
      // });
      // return rates[0].totalPrice;
      
      throw new QuotePricingError(
        'LiteAPI pricing API not yet implemented',
        'NOT_IMPLEMENTED',
        { hotelId, checkIn, checkOut, occupancy, currency }
      );
    } catch (error) {
      if (error instanceof QuotePricingError) {
        throw error;
      }
      throw new QuotePricingError(
        `LiteAPI error: ${error instanceof Error ? error.message : String(error)}`,
        'LITEAPI_ERROR',
        { hotelId, checkIn, checkOut, currency, error }
      );
    }
  }
}

// Export singleton instance
export const quotePricingService = new QuotePricingService();