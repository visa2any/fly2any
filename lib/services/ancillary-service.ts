/**
 * Hybrid Ancillary Service Layer
 *
 * Combines Amadeus and Duffel APIs to provide comprehensive ancillary services:
 * - Duffel: Meals, WiFi, lounge access, insurance (better NDC coverage)
 * - Amadeus: Seat maps, fare families (proven GDS implementation)
 *
 * Provides unified interface with consistent pricing, error handling, and graceful degradation.
 */

import { amadeusAPI } from '@/lib/api/amadeus';
import { duffelAPI } from '@/lib/api/duffel';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Unified ancillary service categories
 */
export type AncillaryCategory =
  | 'seat'
  | 'baggage'
  | 'meal'
  | 'wifi'
  | 'lounge'
  | 'insurance'
  | 'priority_boarding'
  | 'fast_track'
  | 'extra_legroom';

/**
 * Service availability status
 */
export type ServiceAvailability = 'available' | 'unavailable' | 'unknown';

/**
 * API source for traceability
 */
export type ServiceSource = 'amadeus' | 'duffel' | 'none';

/**
 * Unified price structure
 */
export interface AncillaryPrice {
  amount: string; // Decimal string for precision
  currency: string;
  formattedAmount?: string; // e.g., "$29.99"
  perPassenger?: boolean;
  perSegment?: boolean;
}

/**
 * Unified ancillary service
 */
export interface AncillaryServiceItem {
  id: string;
  category: AncillaryCategory;
  name: string;
  description?: string;
  price: AncillaryPrice;
  availability: ServiceAvailability;
  source: ServiceSource;
  metadata?: Record<string, any>;
  segmentIds?: string[]; // Which flight segments this applies to
  passengerTypes?: string[]; // e.g., ["adult", "child"]
}

/**
 * Seat with unified structure
 */
export interface SeatInfo {
  id: string;
  number: string; // e.g., "12A"
  characteristics: string[]; // e.g., ["window", "extra_legroom"]
  available: boolean;
  price?: AncillaryPrice;
  deck?: string; // "upper" or "main"
  row: number;
  column: string;
  section?: string; // e.g., "economy", "business"
}

/**
 * Seat map for a flight segment
 */
export interface SeatMap {
  segmentId: string;
  aircraftCode?: string;
  cabins: Array<{
    cabin: string; // "economy", "business", "first"
    rows: Array<{
      rowNumber: number;
      seats: SeatInfo[];
    }>;
  }>;
  source: ServiceSource;
}

/**
 * Flight offer (unified between Amadeus and Duffel)
 */
export interface FlightOffer {
  id: string;
  source: 'Amadeus' | 'Duffel';
  itineraries: any[];
  price: any;
  [key: string]: any;
}

/**
 * Ancillary service request parameters
 */
export interface AncillaryRequest {
  flightOffer: FlightOffer;
  categories?: AncillaryCategory[]; // Filter by categories
  passengerCount?: number;
  passengerTypes?: Array<'adult' | 'child' | 'infant'>;
}

/**
 * Ancillary service response
 */
export interface AncillaryResponse {
  services: AncillaryServiceItem[];
  seatMaps?: SeatMap[];
  totalServices: number;
  availability: {
    seats: ServiceAvailability;
    baggage: ServiceAvailability;
    meals: ServiceAvailability;
    wifi: ServiceAvailability;
    lounge: ServiceAvailability;
    insurance: ServiceAvailability;
  };
  source: {
    primary: ServiceSource;
    fallback?: ServiceSource;
  };
  metadata?: {
    requestId?: string;
    timestamp: string;
    errors?: Array<{ category: AncillaryCategory; message: string }>;
  };
}

// ============================================================================
// ANCILLARY SERVICE CLASS
// ============================================================================

export class AncillaryService {
  /**
   * Get all available ancillary services for a flight offer
   */
  async getAncillaries(request: AncillaryRequest): Promise<AncillaryResponse> {
    const startTime = Date.now();
    const { flightOffer, categories, passengerCount = 1 } = request;

    console.log(`🛍️  Fetching ancillaries for ${flightOffer.source} flight ${flightOffer.id}`);

    // Initialize response
    const response: AncillaryResponse = {
      services: [],
      seatMaps: [],
      totalServices: 0,
      availability: {
        seats: 'unknown',
        baggage: 'unknown',
        meals: 'unknown',
        wifi: 'unknown',
        lounge: 'unknown',
        insurance: 'unknown',
      },
      source: {
        primary: flightOffer.source === 'Duffel' ? 'duffel' : 'amadeus',
      },
      metadata: {
        timestamp: new Date().toISOString(),
        errors: [],
      },
    };

    // Parallel fetch strategy for performance
    const tasks: Promise<void>[] = [];

    // ========== DUFFEL ANCILLARIES ==========
    if (flightOffer.source === 'Duffel') {
      tasks.push(this.fetchDuffelAncillaries(flightOffer, response, categories));
    } else if (duffelAPI.isAvailable()) {
      tasks.push(this.tryDuffelFallback(flightOffer, response, categories));
    }

    // ========== AMADEUS ANCILLARIES ==========
    if (flightOffer.source === 'Amadeus') {
      if (!categories || categories.includes('seat')) {
        tasks.push(this.fetchAmadeusSeatMaps(flightOffer, response));
      }
    }

    // Execute all tasks in parallel
    await Promise.allSettled(tasks);

    // Calculate totals
    response.totalServices = response.services.length;

    const duration = Date.now() - startTime;
    console.log(`✅ Fetched ${response.totalServices} ancillary services in ${duration}ms`);

    return response;
  }

  /**
   * Fetch ancillaries from Duffel API
   */
  private async fetchDuffelAncillaries(
    flightOffer: FlightOffer,
    response: AncillaryResponse,
    categories?: AncillaryCategory[]
  ): Promise<void> {
    try {
      const availableServices = flightOffer.availableServices ||
                                 (flightOffer as any).available_services ||
                                 [];

      if (!availableServices || availableServices.length === 0) {
        console.log('   ℹ️  No available services in offer, attempting to fetch from Duffel API');

        // Try fetching directly from Duffel API if services aren't in the offer
        if (duffelAPI.isAvailable() && flightOffer.id) {
          await this.fetchDuffelBaggageFromAPI(flightOffer.id, response, categories);
        }
        return;
      }

      // Process available services from offer
      for (const service of availableServices) {
        const category = this.mapDuffelServiceCategory(service.type);

        if (categories && !categories.includes(category)) {
          continue;
        }

        const ancillaryService: AncillaryServiceItem = {
          id: service.id,
          category,
          name: service.metadata?.title || this.formatServiceName(service.type),
          description: service.metadata?.description,
          price: {
            amount: service.total_amount,
            currency: service.total_currency,
            formattedAmount: this.formatPrice(service.total_amount, service.total_currency),
            perPassenger: service.metadata?.maximum_quantity === 1,
            perSegment: service.segment_ids && service.segment_ids.length > 0,
          },
          availability: 'available',
          source: 'duffel',
          segmentIds: service.segment_ids || [],
          passengerTypes: service.passenger_ids || [],
          metadata: {
            ...service.metadata,
            duffelServiceId: service.id,
            type: service.type,
            weight: service.metadata?.maximum_weight_kg || service.metadata?.weight_kg,
          },
        };

        response.services.push(ancillaryService);
        this.updateAvailability(response, category, 'available');
      }

      console.log(`   ✅ Processed ${response.services.length} services from Duffel offer`);

      // Fetch Duffel seat maps if seats category is requested
      if (!categories || categories.includes('seat')) {
        await this.fetchDuffelSeatMaps(flightOffer, response);
      }
    } catch (error: any) {
      console.error('   ❌ Error fetching Duffel ancillaries:', error.message);
    }
  }

  /**
   * Fetch baggage options directly from Duffel API
   */
  private async fetchDuffelBaggageFromAPI(
    offerId: string,
    response: AncillaryResponse,
    categories?: AncillaryCategory[]
  ): Promise<void> {
    try {
      // Skip if not requesting baggage
      if (categories && !categories.includes('baggage')) {
        return;
      }

      console.log('   🧳 Fetching real-time baggage from Duffel API...');

      const baggageResult = await duffelAPI.getBaggageOptions(offerId);

      if (!baggageResult.success || !baggageResult.data || baggageResult.data.length === 0) {
        console.warn('   ⚠️  No baggage options available from Duffel API');
        response.availability.baggage = 'unavailable';
        return;
      }

      // Transform Duffel baggage to ancillary service items
      for (const baggage of baggageResult.data) {
        const ancillaryService: AncillaryServiceItem = {
          id: baggage.id,
          category: 'baggage',
          name: baggage.name,
          description: baggage.description + ` (${baggage.weight.value}${baggage.weight.unit})`,
          price: {
            amount: baggage.price.amount,
            currency: baggage.price.currency,
            formattedAmount: this.formatPrice(baggage.price.amount, baggage.price.currency),
            perPassenger: true,
            perSegment: baggage.segmentIds && baggage.segmentIds.length > 0,
          },
          availability: 'available',
          source: 'duffel',
          segmentIds: baggage.segmentIds || [],
          passengerTypes: baggage.passengerIds || [],
          metadata: {
            duffelServiceId: baggage.id,
            type: baggage.type,
            weight: baggage.weight,
            quantity: baggage.quantity,
            dimensions: {
              length: baggage.metadata?.maximumLength,
              width: baggage.metadata?.maximumWidth,
              height: baggage.metadata?.maximumHeight,
            },
          },
        };

        response.services.push(ancillaryService);
      }

      response.availability.baggage = 'available';
      console.log(`   ✅ Added ${baggageResult.data.length} real baggage options from Duffel`);
    } catch (error: any) {
      console.error('   ❌ Error fetching Duffel baggage from API:', error.message);
      response.availability.baggage = 'unavailable';

      if (response.metadata?.errors) {
        response.metadata.errors.push({
          category: 'baggage',
          message: error.message,
        });
      }
    }
  }

  /**
   * Try Duffel as fallback for Amadeus flights
   */
  private async tryDuffelFallback(
    flightOffer: FlightOffer,
    response: AncillaryResponse,
    categories?: AncillaryCategory[]
  ): Promise<void> {
    try {
      console.log('   🔄 Trying Duffel fallback (limited)...');
      response.source.fallback = 'duffel';
    } catch (error: any) {
      console.error('   ❌ Duffel fallback failed:', error.message);
    }
  }

  /**
   * Fetch seat maps from Amadeus API
   */
  private async fetchAmadeusSeatMaps(
    flightOffer: FlightOffer,
    response: AncillaryResponse
  ): Promise<void> {
    try {
      console.log('   🪑 Fetching Amadeus seat maps...');

      const seatMapResponse = await amadeusAPI.getSeatMap(flightOffer.id);

      if (!seatMapResponse.data || seatMapResponse.data.length === 0) {
        response.availability.seats = 'unavailable';
        return;
      }

      for (const amaSeatMap of seatMapResponse.data) {
        const seatMap = this.convertAmadeusSeatMap(amaSeatMap);
        response.seatMaps?.push(seatMap);

        // Extract individual seat services with pricing
        for (const cabin of seatMap.cabins) {
          for (const row of cabin.rows) {
            for (const seat of row.seats) {
              if (seat.price && seat.available) {
                const seatService: AncillaryServiceItem = {
                  id: `seat-${seatMap.segmentId}-${seat.number}`,
                  category: seat.characteristics.includes('extra_legroom')
                    ? 'extra_legroom'
                    : 'seat',
                  name: `Seat ${seat.number}`,
                  description: seat.characteristics.join(', '),
                  price: seat.price,
                  availability: 'available',
                  source: 'amadeus',
                  segmentIds: [seatMap.segmentId],
                  metadata: {
                    seatNumber: seat.number,
                    row: seat.row,
                    column: seat.column,
                    characteristics: seat.characteristics,
                    deck: seat.deck,
                  },
                };

                response.services.push(seatService);
              }
            }
          }
        }
      }

      response.availability.seats = 'available';
    } catch (error: any) {
      console.error('   ❌ Error fetching Amadeus seat maps:', error.message);
      response.availability.seats = 'unavailable';
    }
  }

  /**
   * Convert Amadeus seat map to unified format
   */
  private convertAmadeusSeatMap(amaSeatMap: any): SeatMap {
    return {
      segmentId: amaSeatMap.segmentId || amaSeatMap.id,
      aircraftCode: amaSeatMap.aircraft?.code,
      cabins: (amaSeatMap.decks || []).flatMap((deck: any) =>
        (deck.seats || []).map((amaSection: any) => ({
          cabin: amaSection.cabin || 'economy',
          rows: this.groupSeatsByRow(amaSection.seats || [], deck.deckType),
        }))
      ),
      source: 'amadeus',
    };
  }

  /**
   * Group seats by row number
   */
  private groupSeatsByRow(seats: any[], deckType?: string): Array<{ rowNumber: number; seats: SeatInfo[] }> {
    const rowMap = new Map<number, SeatInfo[]>();

    for (const seat of seats) {
      const row = parseInt(seat.number?.match(/\d+/)?.[0] || '0', 10);
      const column = seat.number?.match(/[A-Z]+/)?.[0] || '';

      const seatInfo: SeatInfo = {
        id: seat.number,
        number: seat.number,
        characteristics: this.extractSeatCharacteristics(seat),
        available: seat.travelerPricing?.[0]?.seatAvailabilityStatus === 'AVAILABLE',
        price: seat.travelerPricing?.[0]?.price
          ? {
              amount: seat.travelerPricing[0].price.total,
              currency: seat.travelerPricing[0].price.currency,
              formattedAmount: this.formatPrice(
                seat.travelerPricing[0].price.total,
                seat.travelerPricing[0].price.currency
              ),
              perPassenger: true,
              perSegment: true,
            }
          : undefined,
        deck: deckType,
        row,
        column,
      };

      if (!rowMap.has(row)) {
        rowMap.set(row, []);
      }
      rowMap.get(row)!.push(seatInfo);
    }

    return Array.from(rowMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNumber, seats]) => ({
        rowNumber,
        seats: seats.sort((a, b) => a.column.localeCompare(b.column)),
      }));
  }

  /**
   * Extract seat characteristics
   */
  private extractSeatCharacteristics(seat: any): string[] {
    if (seat.travelerPricing?.[0]?.seatAvailabilityStatus !== 'AVAILABLE') {
      return ['occupied'];
    }

    const characteristics: string[] = [];
    const coords = seat.coordinates;

    if (coords) {
      if (['A', 'F', 'K'].includes(coords.x)) {
        characteristics.push('window');
      } else if (['C', 'D'].includes(coords.x)) {
        characteristics.push('aisle');
      } else {
        characteristics.push('middle');
      }
    }

    const charCode = seat.characteristicsCodes || [];
    if (charCode.includes('XL') || charCode.includes('E')) {
      characteristics.push('extra_legroom');
    }

    return characteristics.length > 0 ? characteristics : ['standard'];
  }

  /**
   * Fetch seat maps from Duffel API
   */
  private async fetchDuffelSeatMaps(
    flightOffer: FlightOffer,
    response: AncillaryResponse
  ): Promise<void> {
    try {
      console.log('   🪑 Fetching Duffel seat maps...');

      const seatMapResponse = await duffelAPI.getSeatMaps(flightOffer.id);

      if (!seatMapResponse.meta.hasRealData || !seatMapResponse.data || seatMapResponse.data.length === 0) {
        console.log('   ⚠️  No Duffel seat maps available');
        return; // Don't mark as unavailable, might have seat services in available_services
      }

      console.log(`   ✅ Got ${seatMapResponse.data.length} seat map(s) from Duffel`);

      for (const duffelSeatMap of seatMapResponse.data) {
        const seatMap = this.convertDuffelSeatMapToUnified(duffelSeatMap);
        response.seatMaps?.push(seatMap);

        // Extract individual seat services with pricing
        for (const cabin of seatMap.cabins) {
          for (const row of cabin.rows) {
            for (const seat of row.seats) {
              if (seat.price && seat.available) {
                const seatService: AncillaryServiceItem = {
                  id: `seat-${seatMap.segmentId}-${seat.number}`,
                  category: seat.characteristics.includes('extra_legroom')
                    ? 'extra_legroom'
                    : 'seat',
                  name: `Seat ${seat.number}`,
                  description: seat.characteristics.join(', '),
                  price: seat.price,
                  availability: 'available',
                  source: 'duffel',
                  segmentIds: [seatMap.segmentId],
                  metadata: {
                    seatNumber: seat.number,
                    row: seat.row,
                    column: seat.column,
                    characteristics: seat.characteristics,
                    deck: seat.deck,
                  },
                };

                response.services.push(seatService);
              }
            }
          }
        }
      }

      if (response.seatMaps && response.seatMaps.length > 0) {
        response.availability.seats = 'available';
        console.log(`   ✅ Added ${response.seatMaps.length} Duffel seat maps`);
      }
    } catch (error: any) {
      console.error('   ❌ Error fetching Duffel seat maps:', error.message);
      response.metadata?.errors?.push({
        category: 'seat',
        message: error.message,
      });
    }
  }

  /**
   * Convert Duffel seat map to unified format
   * (Duffel seat maps are already in Amadeus-like format from duffelAPI.convertDuffelSeatMap)
   */
  private convertDuffelSeatMapToUnified(duffelSeatMap: any): SeatMap {
    return {
      segmentId: duffelSeatMap.segmentId || duffelSeatMap.id,
      aircraftCode: duffelSeatMap.aircraftCabinAmenities?.seat?.aircraftCabinCode,
      cabins: (duffelSeatMap.decks || []).flatMap((deck: any) => {
        const rowMap = new Map<number, SeatInfo[]>();

        // Collect all seats and group by row
        (deck.seatRows || []).forEach((seatRow: any) => {
          const rowNumber = parseInt(seatRow.rowNumber || '0', 10);
          const seats = this.convertDuffelSeats(seatRow.seats || [], deck.deckConfiguration?.deckName);

          if (!rowMap.has(rowNumber)) {
            rowMap.set(rowNumber, []);
          }
          rowMap.get(rowNumber)!.push(...seats);
        });

        // Convert to cabin format with rows
        return [
          {
            cabin: 'economy', // Default to economy, can be enhanced with cabin detection
            rows: Array.from(rowMap.entries())
              .sort(([a], [b]) => a - b)
              .map(([rowNumber, seats]) => ({
                rowNumber,
                seats: seats.sort((a, b) => a.column.localeCompare(b.column)),
              })),
          },
        ];
      }),
      source: 'duffel',
    };
  }

  /**
   * Convert Duffel seats to unified SeatInfo format
   */
  private convertDuffelSeats(seats: any[], deckType?: string): SeatInfo[] {
    return seats.map((seat: any) => {
      const row = parseInt(seat.number?.match(/\d+/)?.[0] || '0', 10);
      const column = seat.number?.match(/[A-Z]+/)?.[0] || seat.column || '';

      return {
        id: seat.number,
        number: seat.number,
        characteristics: this.extractSeatCharacteristics(seat),
        available: seat.travelerPricing?.[0]?.seatAvailabilityStatus === 'AVAILABLE',
        price: seat.travelerPricing?.[0]?.price
          ? {
              amount: seat.travelerPricing[0].price.total,
              currency: seat.travelerPricing[0].price.currency,
              formattedAmount: this.formatPrice(
                seat.travelerPricing[0].price.total,
                seat.travelerPricing[0].price.currency
              ),
              perPassenger: true,
              perSegment: true,
            }
          : undefined,
        deck: deckType,
        row,
        column,
      };
    });
  }

  /**
   * Map Duffel service type to unified category
   */
  private mapDuffelServiceCategory(duffelType: string): AncillaryCategory {
    const typeMap: Record<string, AncillaryCategory> = {
      baggage: 'baggage',
      seat: 'seat',
      meal: 'meal',
      wifi: 'wifi',
      lounge: 'lounge',
      insurance: 'insurance',
      priority_boarding: 'priority_boarding',
      fast_track: 'fast_track',
      extra_legroom: 'extra_legroom',
    };
    return typeMap[duffelType.toLowerCase()] || 'baggage';
  }

  /**
   * Format service name
   */
  private formatServiceName(type: string): string {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format price with currency symbol
   */
  private formatPrice(amount: string, currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
    };

    const symbol = symbols[currency] || currency + ' ';
    const numAmount = parseFloat(amount);
    return `${symbol}${numAmount.toFixed(2)}`;
  }

  /**
   * Update availability tracking
   */
  private updateAvailability(
    response: AncillaryResponse,
    category: AncillaryCategory,
    status: ServiceAvailability
  ): void {
    switch (category) {
      case 'seat':
      case 'extra_legroom':
        if (response.availability.seats === 'unknown') {
          response.availability.seats = status;
        }
        break;
      case 'baggage':
        if (response.availability.baggage === 'unknown') {
          response.availability.baggage = status;
        }
        break;
      case 'meal':
        if (response.availability.meals === 'unknown') {
          response.availability.meals = status;
        }
        break;
      case 'wifi':
        if (response.availability.wifi === 'unknown') {
          response.availability.wifi = status;
        }
        break;
      case 'lounge':
        if (response.availability.lounge === 'unknown') {
          response.availability.lounge = status;
        }
        break;
      case 'insurance':
        if (response.availability.insurance === 'unknown') {
          response.availability.insurance = status;
        }
        break;
    }
  }

  /**
   * Get seat maps only
   */
  async getSeatMaps(flightOffer: FlightOffer): Promise<SeatMap[]> {
    const response = await this.getAncillaries({
      flightOffer,
      categories: ['seat'],
    });
    return response.seatMaps || [];
  }
}

// Singleton export
export const ancillaryService = new AncillaryService();

// Utility functions
export function calculateAncillaryCost(
  services: AncillaryServiceItem[],
  passengerCount: number = 1
): { amount: number; currency: string } {
  if (services.length === 0) {
    return { amount: 0, currency: 'USD' };
  }

  const currency = services[0].price.currency;
  let total = 0;

  for (const service of services) {
    const serviceAmount = parseFloat(service.price.amount);
    const multiplier = service.price.perPassenger ? passengerCount : 1;
    total += serviceAmount * multiplier;
  }

  return { amount: total, currency };
}
