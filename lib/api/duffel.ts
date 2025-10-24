import { Duffel } from '@duffel/api';

/**
 * Duffel API Client
 *
 * Provides access to 300+ airlines including ULCC carriers (Frontier, Spirit, etc.)
 * via GDS (Travelport) and NDC connections.
 *
 * Pricing: $3/order + 1% order value + $2/ancillary
 * Search Limit: 1500:1 search-to-book ratio free, then $0.005/search
 */

interface DuffelSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  maxResults?: number;
}

class DuffelAPI {
  private client: Duffel;
  private isInitialized: boolean = false;

  constructor() {
    const token = process.env.DUFFEL_ACCESS_TOKEN;

    if (!token) {
      console.warn('⚠️  DUFFEL_ACCESS_TOKEN not set - Duffel API will not be available');
      this.isInitialized = false;
      // Create a dummy client to prevent crashes
      this.client = new Duffel({ token: 'dummy' });
    } else {
      this.client = new Duffel({ token });
      this.isInitialized = true;
      console.log('✅ Duffel API initialized');
    }
  }

  /**
   * Search for flights using Duffel API
   */
  async searchFlights(params: DuffelSearchParams) {
    if (!this.isInitialized) {
      console.warn('⚠️  Duffel API not initialized - skipping');
      return { data: [], meta: { count: 0 } };
    }

    try {
      console.log('🔍 Searching Duffel API:', params);

      // Build passengers array
      const passengers: any[] = [];

      // Add adults
      for (let i = 0; i < (params.adults || 1); i++) {
        passengers.push({ type: 'adult' });
      }

      // Add children (ages 2-17)
      for (let i = 0; i < (params.children || 0); i++) {
        passengers.push({ age: 12 }); // Default to 12 for children
      }

      // Add infants (under 2)
      for (let i = 0; i < (params.infants || 0); i++) {
        passengers.push({ age: 1 });
      }

      // Build slices (flight segments)
      const slices: any[] = [
        {
          origin: params.origin,
          destination: params.destination,
          departure_date: params.departureDate,
        },
      ];

      // Add return slice if round-trip
      if (params.returnDate) {
        slices.push({
          origin: params.destination,
          destination: params.origin,
          departure_date: params.returnDate,
        });
      }

      // Map cabin class to Duffel format
      const cabinClassMap: Record<string, string> = {
        economy: 'economy',
        premium_economy: 'premium_economy',
        business: 'business',
        first: 'first',
      };

      // Create offer request
      const offerRequest = await this.client.offerRequests.create({
        slices,
        passengers,
        cabin_class: cabinClassMap[params.cabinClass || 'economy'],
        return_offers: true,
        max_connections: 2, // Allow up to 2 connections
      });

      console.log(`✅ Duffel returned offer request ID: ${offerRequest.data.id}`);

      // Wait for offers to be ready (Duffel processes asynchronously)
      let offers = offerRequest.data.offers || [];
      let attempts = 0;
      const maxAttempts = 5;

      while (offers.length === 0 && attempts < maxAttempts) {
        console.log(`⏳ Waiting for Duffel offers... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch the offer request again
        const updated = await this.client.offerRequests.get(offerRequest.data.id, {
          return_offers: true,
        });

        offers = updated.data.offers || [];
        attempts++;
      }

      console.log(`📋 Duffel returned ${offers.length} offers`);

      // Convert Duffel offers to our standard format
      const standardizedOffers = offers.map((offer: any) => this.convertDuffelOffer(offer));

      // Apply max results limit
      const limitedOffers = params.maxResults
        ? standardizedOffers.slice(0, params.maxResults)
        : standardizedOffers;

      return {
        data: limitedOffers,
        meta: {
          count: limitedOffers.length,
          source: 'Duffel',
          offerRequestId: offerRequest.data.id,
        },
      };
    } catch (error: any) {
      console.error('❌ Duffel API error:', error.message);

      // Return empty results on error
      return {
        data: [],
        meta: {
          count: 0,
          error: error.message,
        },
      };
    }
  }

  /**
   * Convert Duffel offer format to our standardized format
   */
  private convertDuffelOffer(duffelOffer: any) {
    return {
      id: duffelOffer.id,
      source: 'Duffel',
      type: 'flight-offer',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: duffelOffer.slices.length === 1,
      lastTicketingDate: duffelOffer.expires_at?.split('T')[0],
      lastTicketingDateTime: duffelOffer.expires_at,
      numberOfBookableSeats: duffelOffer.available_services?.length || 9,

      // Itineraries
      itineraries: duffelOffer.slices.map((slice: any) => ({
        duration: slice.duration,
        segments: slice.segments.map((segment: any) => ({
          departure: {
            iataCode: segment.origin.iata_code,
            terminal: segment.origin.terminal,
            at: segment.departing_at,
          },
          arrival: {
            iataCode: segment.destination.iata_code,
            terminal: segment.destination.terminal,
            at: segment.arriving_at,
          },
          carrierCode: segment.marketing_carrier.iata_code,
          number: segment.marketing_carrier_flight_number,
          aircraft: {
            code: segment.aircraft?.iata_code || 'Unknown',
          },
          operating: segment.operating_carrier
            ? {
                carrierCode: segment.operating_carrier.iata_code,
              }
            : undefined,
          duration: segment.duration,
          id: segment.id,
          numberOfStops: 0,
          blacklistedInEU: false,
        })),
      })),

      // Price
      price: {
        currency: duffelOffer.total_currency,
        total: duffelOffer.total_amount,
        base: duffelOffer.base_amount || duffelOffer.total_amount,
        fees: [{
          amount: (parseFloat(duffelOffer.total_amount) - parseFloat(duffelOffer.base_amount || duffelOffer.total_amount)).toString(),
          type: 'TICKETING',
        }],
        grandTotal: duffelOffer.total_amount,
      },

      // Pricing options
      pricingOptions: {
        fareType: ['PUBLISHED'],
        includedCheckedBagsOnly: true,
      },

      // Validating airline codes
      validatingAirlineCodes: [
        duffelOffer.owner?.iata_code || duffelOffer.slices[0].segments[0].marketing_carrier.iata_code,
      ],

      // Traveler pricings
      travelerPricings: duffelOffer.passengers?.map((passenger: any) => ({
        travelerId: passenger.id,
        fareOption: 'STANDARD',
        travelerType: passenger.type.toUpperCase(),
        price: {
          currency: duffelOffer.total_currency,
          total: duffelOffer.total_amount,
          base: duffelOffer.base_amount,
        },
        fareDetailsBySegment: duffelOffer.slices.flatMap((slice: any) =>
          slice.segments.map((segment: any) => ({
            segmentId: segment.id,
            cabin: this.mapDuffelCabin(segment.passengers?.[0]?.cabin_class_marketing_name),
            fareBasis: segment.passengers?.[0]?.fare_basis_code || 'ECONOMY',
            brandedFare: segment.passengers?.[0]?.cabin_class || undefined,
            class: segment.passengers?.[0]?.cabin_class?.[0] || 'Y',
            includedCheckedBags: {
              quantity: this.extractBaggageQuantity(duffelOffer.available_services),
            },
          }))
        ),
      })) || [],

      // Duffel-specific metadata
      duffelMetadata: {
        expires_at: duffelOffer.expires_at,
        live_mode: duffelOffer.live_mode,
        owner: duffelOffer.owner,
      },
    };
  }

  /**
   * Map Duffel cabin class to Amadeus format
   */
  private mapDuffelCabin(duffelCabin?: string): string {
    if (!duffelCabin) return 'ECONOMY';

    const cabin = duffelCabin.toLowerCase();
    if (cabin.includes('first')) return 'FIRST';
    if (cabin.includes('business')) return 'BUSINESS';
    if (cabin.includes('premium')) return 'PREMIUM_ECONOMY';
    return 'ECONOMY';
  }

  /**
   * Extract baggage quantity from Duffel services
   */
  private extractBaggageQuantity(services: any[]): number {
    if (!services || services.length === 0) return 0;

    const baggageServices = services.filter((s: any) =>
      s.type === 'baggage' && s.metadata?.type === 'checked'
    );

    return baggageServices.length > 0 ? 1 : 0;
  }

  /**
   * Check if Duffel API is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const duffelAPI = new DuffelAPI();

// Export types
export type { DuffelSearchParams };
