import { Duffel } from '@duffel/api';
import axios from 'axios';

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
  maxStops?: number; // For non-stop/direct flight filtering
  maxResults?: number;
}

class DuffelAPI {
  private client: Duffel;
  private isInitialized: boolean = false;
  private static initWarningLogged = false;

  constructor() {
    const token = process.env.DUFFEL_ACCESS_TOKEN;

    // Check if token is actually configured (not placeholder)
    this.isInitialized = this.hasValidCredentials(token);

    if (!this.isInitialized) {
      if (process.env.NODE_ENV === 'development' && !DuffelAPI.initWarningLogged) {
        console.warn('⚠️  Duffel API not configured - will use demo data');
        console.warn('   📖 See: SETUP_REAL_APIS.md for setup instructions');
        DuffelAPI.initWarningLogged = true;
      }
      // Create a dummy client to prevent crashes
      this.client = new Duffel({ token: 'dummy' });
    } else {
      this.client = new Duffel({ token: token! });
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Duffel API configured');
      }
    }
  }

  /**
   * Check if Duffel token is actually configured (not placeholder)
   */
  private hasValidCredentials(token: string | undefined): boolean {
    if (!token) {
      return false;
    }

    // Check for placeholder values
    const placeholders = ['your_', 'placeholder', 'REPLACE_', 'xxx', 'TOKEN_HERE'];
    const tokenLower = token.toLowerCase();

    for (const placeholder of placeholders) {
      if (tokenLower.includes(placeholder.toLowerCase())) {
        return false;
      }
    }

    // Valid Duffel tokens start with "duffel_test_" or "duffel_live_"
    if (!token.startsWith('duffel_')) {
      return false;
    }

    // Valid tokens must be at least 30 characters
    if (token.length < 30) {
      return false;
    }

    return true;
  }

  /**
   * Search for flights using Duffel API
   */
  async searchFlights(params: DuffelSearchParams) {
    // Silently return empty results if not configured
    if (!this.isInitialized) {
      return { data: [], meta: { count: 0 } };
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Searching Duffel API:', params);
      }

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
      const cabinClassMap: Record<string, 'first' | 'economy' | 'premium_economy' | 'business'> = {
        economy: 'economy',
        premium_economy: 'premium_economy',
        business: 'business',
        first: 'first',
      };

      // Create offer request
      // Duffel API only accepts 0, 1, or 2 for max_connections
      let maxConnections: 0 | 1 | 2 = 2; // Default to 2 connections
      if (params.maxStops !== undefined) {
        maxConnections = Math.min(Math.max(params.maxStops, 0), 2) as 0 | 1 | 2;
      }

      const offerRequest = await this.client.offerRequests.create({
        slices,
        passengers,
        cabin_class: cabinClassMap[params.cabinClass || 'economy'],
        return_offers: true,
        max_connections: maxConnections,
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
        const updated = await this.client.offerRequests.get(offerRequest.data.id);

        offers = updated.data.offers || [];
        attempts++;
      }

      console.log(`📋 Duffel returned ${offers.length} offers`);

      // Debug: Log COMPLETE first offer to analyze tax structure
      if (offers.length > 0) {
        const firstOffer = offers[0] as any; // Cast to any for debug logging

        console.log('\n💼 ========== DUFFEL RAW API RESPONSE - DETAILED TAX ANALYSIS ==========');
        console.log('\n💰 Price Fields:');
        console.log(`   total_amount: ${firstOffer.total_amount} ${firstOffer.total_currency}`);
        console.log(`   base_amount: ${firstOffer.base_amount} ${firstOffer.base_currency || firstOffer.total_currency}`);
        console.log(`   tax_amount: ${firstOffer.tax_amount || 'NOT PROVIDED'} ${firstOffer.tax_currency || firstOffer.total_currency}`);

        console.log('\n📦 Available Services (Baggage/Extras):');
        if (firstOffer.available_services && firstOffer.available_services.length > 0) {
          console.log(`   Found ${firstOffer.available_services.length} services`);
          firstOffer.available_services.forEach((service: any, idx: number) => {
            console.log(`   Service ${idx + 1}: ${service.type} - ${service.total_amount} ${service.total_currency}`);
          });
        } else {
          console.log('   ⚠️  No available services found');
        }

        console.log('\n👥 Passengers:');
        if (firstOffer.passengers && firstOffer.passengers.length > 0) {
          console.log(`   ${firstOffer.passengers.length} passengers`);
          firstOffer.passengers.forEach((passenger: any, idx: number) => {
            console.log(`   Passenger ${idx + 1}: ${passenger.type || 'Unknown type'}`);
          });
        } else {
          console.log('   ⚠️  No passenger data');
        }

        console.log('\n🛫 Slices & Segments:');
        if (firstOffer.slices && firstOffer.slices.length > 0) {
          firstOffer.slices.forEach((slice: any, sliceIdx: number) => {
            console.log(`   Slice ${sliceIdx + 1}: ${slice.origin.iata_code} → ${slice.destination.iata_code}`);
            console.log(`     Duration: ${slice.duration}`);
            console.log(`     Segments: ${slice.segments.length}`);

            if (slice.segments && slice.segments.length > 0) {
              slice.segments.forEach((segment: any, segIdx: number) => {
                console.log(`       Segment ${segIdx + 1}: ${segment.origin.iata_code} → ${segment.destination.iata_code}`);
                console.log(`         Carrier: ${segment.marketing_carrier?.iata_code || 'Unknown'} ${segment.marketing_carrier_flight_number || ''}`);

                // Check if segments have individual pricing
                if (segment.passengers && segment.passengers.length > 0) {
                  console.log(`         Passenger cabin data available: ${segment.passengers.length} passengers`);
                  segment.passengers.forEach((segPassenger: any, pIdx: number) => {
                    if (segPassenger.fare_basis_code) {
                      console.log(`           Passenger ${pIdx + 1} fare basis: ${segPassenger.fare_basis_code}`);
                    }
                  });
                }
              });
            }
          });
        }

        console.log('\n📊 Summary:');
        const baseAmount = parseFloat(firstOffer.base_amount || '0');
        const taxAmount = firstOffer.tax_amount ? parseFloat(firstOffer.tax_amount) : 0;
        const totalAmount = parseFloat(firstOffer.total_amount);
        const calculatedTax = totalAmount - baseAmount;

        console.log(`   Total: ${totalAmount.toFixed(2)} ${firstOffer.total_currency}`);
        console.log(`   Base: ${baseAmount.toFixed(2)} ${firstOffer.total_currency}`);
        console.log(`   Tax (from API): ${taxAmount > 0 ? taxAmount.toFixed(2) : 'NOT PROVIDED'} ${firstOffer.total_currency}`);
        console.log(`   Tax (calculated): ${calculatedTax.toFixed(2)} ${firstOffer.total_currency}`);
        console.log(`   Tax Percentage: ${totalAmount > 0 ? ((calculatedTax / totalAmount) * 100).toFixed(1) : 'N/A'}%`);
        console.log('\n💼 ===================================================================\n');
      }

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

      // Price - use tax_amount if available, otherwise compute from total - base
      price: {
        currency: duffelOffer.total_currency,
        total: duffelOffer.total_amount,
        base: duffelOffer.base_amount,
        fees: duffelOffer.tax_amount ? [{
          amount: duffelOffer.tax_amount,
          type: 'TAXES_AND_FEES',
        }] : duffelOffer.base_amount ? [{
          amount: (parseFloat(duffelOffer.total_amount) - parseFloat(duffelOffer.base_amount)).toString(),
          type: 'TAXES_AND_FEES',
        }] : undefined,
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

  /**
   * Get Seat Maps for a Duffel Offer
   *
   * Fetches available seat maps from Duffel API for the given offer.
   * Returns seat layout, availability, and pricing information.
   *
   * @param offerId - The Duffel offer ID
   * @returns Seat map data in standardized format
   */
  async getSeatMaps(offerId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN;
    if (!token) {
      throw new Error('DUFFEL_ACCESS_TOKEN not configured');
    }

    try {
      console.log('🪑 ========================================');
      console.log(`🪑 FETCHING DUFFEL SEAT MAPS (Direct HTTP API)`);
      console.log(`🪑 Offer ID: ${offerId}`);
      console.log(`🪑 API Endpoint: GET https://api.duffel.com/air/seat_maps?offer_id=${offerId}`);

      // Make direct HTTP request to Duffel API
      // SDK methods (create/list/get) were all failing, so using direct HTTP request
      console.log('🪑 Making direct HTTP request to Duffel API...');

      const response = await axios.get('https://api.duffel.com/air/seat_maps', {
        params: {
          offer_id: offerId,
        },
        headers: {
          'Accept-Encoding': 'gzip',
          'Accept': 'application/json',
          'Duffel-Version': 'v2',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 30000, // 30 second timeout
      });

      console.log(`✅ Duffel API response received (HTTP ${response.status})`);
      console.log(`   Response data structure:`, {
        hasData: !!response.data,
        dataIsArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        hasDataProperty: !!response.data?.data,
        dataPropertyLength: response.data?.data?.length || 0,
      });

      // Duffel API returns { data: [...] } structure
      const seatMapsArray = response.data?.data || [];

      console.log(`   Seat maps returned: ${seatMapsArray.length}`);

      // Check if seat maps are available
      if (!seatMapsArray || seatMapsArray.length === 0) {
        console.warn('⚠️  No seat maps available for this offer');
        console.warn('   Possible reasons:');
        console.warn('   1. Airline does not provide seat maps through API');
        console.warn('   2. Offer has expired (offers expire after ~30 minutes)');
        console.warn('   3. Seat selection not available for this fare class');
        console.warn('   4. This is a test environment with limited data');
        console.log('🪑 ========================================');
        return {
          data: [],
          meta: {
            hasRealData: false,
            source: 'Duffel',
            reason: 'No seat maps available for this offer',
          },
        };
      }

      // Log first seat map structure for debugging
      if (seatMapsArray.length > 0) {
        console.log(`🪑 First seat map structure:`, {
          id: seatMapsArray[0].id,
          segment_id: seatMapsArray[0].segment_id,
          slice_id: seatMapsArray[0].slice_id,
          cabinsCount: seatMapsArray[0].cabins?.length || 0,
        });
      }

      // Validate seat map structure
      const validSeatMaps = seatMapsArray.filter((sm: any) => sm.cabins && sm.cabins.length > 0);

      if (validSeatMaps.length === 0) {
        console.warn('⚠️  Seat maps returned but no valid cabin data found');
        console.log('🪑 ========================================');
        return {
          data: [],
          meta: {
            hasRealData: false,
            source: 'Duffel',
            reason: 'Seat maps have no cabin data',
          },
        };
      }

      // Parse and standardize the seat map data
      console.log(`🪑 Parsing ${validSeatMaps.length} valid seat map(s)...`);
      const standardizedSeatMaps = validSeatMaps.map((seatMap: any) => {
        console.log(`   ✓ Parsing seat map: ${seatMap.id} (${seatMap.cabins.length} cabin(s))`);
        return this.convertDuffelSeatMap(seatMap);
      });

      console.log(`✅ SUCCESS: Parsed ${standardizedSeatMaps.length} seat map(s) with REAL airline data`);
      console.log(`   💰 Seat pricing: REAL from airline API`);
      console.log(`   🪑 Seat availability: REAL-TIME from airline`);
      console.log('🪑 ========================================');

      return {
        data: standardizedSeatMaps,
        meta: {
          hasRealData: true,
          source: 'Duffel',
          count: standardizedSeatMaps.length,
        },
      };
    } catch (error: any) {
      console.error('❌ Duffel seat map error:', error);

      if (axios.isAxiosError(error)) {
        console.error('   HTTP Status:', error.response?.status);
        console.error('   HTTP Response:', error.response?.data);
        console.error('   Request URL:', error.config?.url);
        console.error('   Request params:', error.config?.params);
      } else {
        console.error('   Error details:', error.message);
      }

      console.log('🪑 ========================================');

      // Return empty result instead of throwing
      return {
        data: [],
        meta: {
          hasRealData: false,
          source: 'Duffel',
          error: error.message,
          errorDetails: error.response?.data,
        },
      };
    }
  }

  /**
   * Convert Duffel seat map to standardized format
   * Transforms Duffel's seat map structure to match Amadeus format
   */
  private convertDuffelSeatMap(duffelSeatMap: any) {
    const cabins = (duffelSeatMap.cabins || []).map((cabin: any) => {
      // Group seats by row
      const rowMap = new Map<number, any[]>();

      (cabin.rows || []).forEach((row: any) => {
        const rowNumber = row.row_number || 0;

        (row.sections || []).forEach((section: any) => {
          (section.elements || []).forEach((element: any) => {
            if (element.type === 'seat') {
              if (!rowMap.has(rowNumber)) {
                rowMap.set(rowNumber, []);
              }

              // Convert Duffel seat to Amadeus-like format
              const seat = {
                number: element.designator, // e.g., "12A"
                column: element.designator?.match(/[A-Z]+/)?.[0] || '',
                travelerPricing: element.available_services?.map((service: any) => ({
                  seatAvailabilityStatus: element.available_services.length > 0 ? 'AVAILABLE' : 'BLOCKED',
                  price: service.total_amount ? {
                    total: service.total_amount,
                    currency: service.total_currency,
                  } : null,
                })) || [{
                  seatAvailabilityStatus: 'BLOCKED',
                  price: null,
                }],
                characteristicsCodes: this.extractDuffelSeatCharacteristics(element),
                coordinates: {
                  x: element.designator?.match(/[A-Z]+/)?.[0] || '',
                  y: rowNumber.toString(),
                },
              };

              rowMap.get(rowNumber)!.push(seat);
            }
          });
        });
      });

      // Convert row map to array format
      const seatRows = Array.from(rowMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([rowNumber, seats]) => ({
          rowNumber: rowNumber.toString(),
          seats: seats.sort((a, b) => a.column.localeCompare(b.column)),
        }));

      return {
        cabin: cabin.cabin_class || 'economy',
        seatRows,
      };
    });

    return {
      segmentId: duffelSeatMap.segment_id || duffelSeatMap.id,
      aircraftCabinAmenities: {
        seat: {
          aircraftCabinCode: duffelSeatMap.slice_id || '',
        },
      },
      decks: cabins.map((cabin: any) => ({
        deckConfiguration: {
          deckName: 'MAIN',
          width: this.calculateSeatLayout(cabin.seatRows),
        },
        seatRows: cabin.seatRows,
      })),
    };
  }

  /**
   * Extract seat characteristics from Duffel seat element
   */
  private extractDuffelSeatCharacteristics(element: any): string[] {
    const characteristics: string[] = [];
    const disclosures = element.disclosures || [];

    // Map Duffel disclosures to characteristic codes
    disclosures.forEach((disclosure: string) => {
      const lower = disclosure.toLowerCase();

      if (lower.includes('window')) characteristics.push('W');
      if (lower.includes('aisle')) characteristics.push('A');
      if (lower.includes('extra legroom') || lower.includes('exit row')) {
        characteristics.push('L');
        characteristics.push('E');
      }
      if (lower.includes('power') || lower.includes('outlet')) characteristics.push('Q');
    });

    return characteristics;
  }

  /**
   * Calculate seat layout pattern (e.g., "3-3", "2-4-2")
   */
  private calculateSeatLayout(seatRows: any[]): string {
    if (!seatRows || seatRows.length === 0) return '3-3';

    // Find the row with the most seats
    const maxSeatsRow = seatRows.reduce((max, row) =>
      row.seats.length > max.seats.length ? row : max
    , seatRows[0]);

    const seatCount = maxSeatsRow.seats.length;

    // Common layouts
    if (seatCount === 6) return '3-3';
    if (seatCount === 8) return '2-4-2';
    if (seatCount === 9) return '3-3-3';
    if (seatCount === 10) return '3-4-3';

    // Default fallback
    return `${Math.floor(seatCount / 2)}-${Math.ceil(seatCount / 2)}`;
  }

  /**
   * Create Order - Complete instant flight booking
   *
   * This creates a confirmed booking with Duffel and returns the order details.
   * Payment is processed separately via your payment gateway.
   *
   * @param offerRequest - The Duffel offer to book
   * @param passengers - Array of passenger details
   * @param payments - Payment information
   * @returns Order object with booking confirmation
   */
  async createOrder(offerRequest: any, passengers: any[], payments?: any[]) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log('🎫 Creating Duffel order...');
      console.log(`   Offer ID: ${offerRequest.id}`);
      console.log(`   Passengers: ${passengers.length}`);

      // Transform passengers to Duffel format
      const duffelPassengers = this.transformPassengersToDuffel(passengers);

      // Create order payload
      const orderPayload: any = {
        selected_offers: [offerRequest.id],
        passengers: duffelPassengers,
        type: 'instant', // instant booking (not hold)
      };

      // Add payments if provided (for live mode)
      if (payments && payments.length > 0) {
        orderPayload.payments = payments;
      }

      // Create the order
      const order = await this.client.orders.create(orderPayload);

      console.log('✅ Duffel order created successfully!');
      console.log(`   Order ID: ${order.data.id}`);
      console.log(`   Booking Reference: ${order.data.booking_reference}`);
      console.log(`   Live Mode: ${order.data.live_mode}`);

      return order;
    } catch (error: any) {
      console.error('❌ Duffel order creation error:', error);

      // Handle specific Duffel errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        console.error('Duffel API errors:', JSON.stringify(errors, null, 2));

        // Check for sold out errors
        const soldOutError = errors.find((e: any) =>
          e.code === 'offer_no_longer_available' ||
          e.title?.toLowerCase().includes('no longer available') ||
          e.title?.toLowerCase().includes('sold out')
        );

        if (soldOutError) {
          throw new Error('SOLD_OUT: This flight is no longer available. Please search for alternative flights.');
        }

        // Check for price change errors
        const priceChangeError = errors.find((e: any) =>
          e.code === 'offer_price_changed' ||
          e.title?.toLowerCase().includes('price changed')
        );

        if (priceChangeError) {
          throw new Error('PRICE_CHANGED: The price for this flight has changed. Please review the new price.');
        }

        // Check for invalid passenger data
        const invalidDataError = errors.find((e: any) =>
          e.code === 'validation_error' ||
          e.title?.toLowerCase().includes('invalid')
        );

        if (invalidDataError) {
          throw new Error(`INVALID_DATA: ${invalidDataError.message || 'Invalid passenger information'}`);
        }
      }

      // Generic error
      throw new Error(`Duffel order creation failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Validate Hold Eligibility - Pre-flight safety checks
   *
   * CRITICAL SAFETY: Validates that a hold booking request is safe and feasible
   * Prevents charging customers for holds that can't be fulfilled
   *
   * @param offer - The flight offer to validate
   * @param requestedHoldHours - Requested hold duration
   * @param departureDate - Flight departure date/time
   * @returns Validation result with allowed status and warnings
   */
  validateHoldEligibility(offer: any, requestedHoldHours: number, departureDate: string): {
    allowed: boolean;
    reason?: string;
    warning?: string;
    maxHoldHours?: number;
    priceGuaranteed?: boolean;
  } {
    const departure = new Date(departureDate);
    const now = new Date();
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / 3600000;

    // SAFETY CHECK 1: Minimum 24 hours before departure
    if (hoursUntilDeparture < 24) {
      return {
        allowed: false,
        reason: 'Cannot create holds for flights departing within 24 hours. Please book immediately or select a later flight.',
      };
    }

    // SAFETY CHECK 2: Hold duration must not exceed departure time
    const holdExpiry = new Date(now.getTime() + requestedHoldHours * 3600000);
    if (holdExpiry >= departure) {
      return {
        allowed: false,
        reason: `Hold duration (${requestedHoldHours}h) exceeds time until departure (${Math.floor(hoursUntilDeparture)}h). Maximum hold: ${Math.floor(hoursUntilDeparture * 0.8)}h`,
      };
    }

    // SAFETY CHECK 3: Hold should be max 80% of time until departure
    const maxSafeHold = Math.floor(hoursUntilDeparture * 0.8);
    if (requestedHoldHours > maxSafeHold) {
      return {
        allowed: false,
        reason: `Requested hold (${requestedHoldHours}h) too close to departure. Maximum safe hold: ${maxSafeHold}h`,
        maxHoldHours: maxSafeHold,
      };
    }

    // SAFETY CHECK 4: Verify price guarantee
    const priceGuaranteed = !!(offer.duffelMetadata?.price_guarantee_expires_at || offer.expires_at);

    if (!priceGuaranteed) {
      return {
        allowed: true,
        warning: '⚠️  No price guarantee - final price may differ at payment time. Customer will be repriced before payment.',
        priceGuaranteed: false,
      };
    }

    // SAFETY CHECK 5: Verify offer hasn't expired
    const offerExpiry = new Date(offer.expires_at || offer.lastTicketingDateTime);
    if (offerExpiry < holdExpiry) {
      return {
        allowed: false,
        reason: `Offer expires (${offerExpiry.toISOString()}) before requested hold ends (${holdExpiry.toISOString()})`,
      };
    }

    return {
      allowed: true,
      priceGuaranteed: true,
    };
  }

  /**
   * Calculate Maximum Allowed Hold Duration
   *
   * Dynamically calculates the maximum safe hold duration based on departure date
   * to prevent creating holds that exceed the flight departure time
   *
   * @param departureDate - Flight departure date/time
   * @returns Maximum hold hours allowed (capped at 72h)
   */
  calculateMaxAllowedHold(departureDate: string): number {
    const departure = new Date(departureDate);
    const now = new Date();
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / 3600000;

    // Return 0 if departure is less than 24 hours away
    if (hoursUntilDeparture < 24) {
      return 0;
    }

    // Maximum 72 hours OR 80% of time until departure, whichever is less
    return Math.min(72, Math.floor(hoursUntilDeparture * 0.8));
  }

  /**
   * Create Hold Order - Reserve flight without immediate payment
   *
   * Creates a hold order that reserves seats without immediate payment.
   * The hold typically expires after 24-48 hours depending on the airline.
   *
   * SAFETY: Now includes pre-validation and post-creation verification
   *
   * @param offerRequest - The Duffel offer to hold
   * @param passengers - Array of passenger details
   * @param holdDurationHours - How long to hold (0-72 hours)
   * @returns Order object with hold confirmation and pricing
   */
  async createHoldOrder(offerRequest: any, passengers: any[], holdDurationHours?: number) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      const requestedHoldHours = holdDurationHours || 24;

      console.log('⏸️  Creating Duffel hold order...');
      console.log(`   Offer ID: ${offerRequest.id}`);
      console.log(`   Passengers: ${passengers.length}`);
      console.log(`   Requested Hold: ${requestedHoldHours} hours`);

      // SAFETY: Get departure date from offer
      const departureDate = offerRequest.itineraries[0]?.segments[0]?.departure?.at;
      if (!departureDate) {
        throw new Error('SAFETY_ERROR: Cannot determine departure date from offer');
      }

      // SAFETY CHECK 1: Validate hold eligibility BEFORE creating order
      console.log('🔒 Running pre-flight safety validations...');
      const validation = this.validateHoldEligibility(offerRequest, requestedHoldHours, departureDate);

      if (!validation.allowed) {
        console.error(`❌ Hold validation failed: ${validation.reason}`);
        throw new Error(`HOLD_REJECTED: ${validation.reason}`);
      }

      if (validation.warning) {
        console.warn(`⚠️  ${validation.warning}`);
      }

      // Calculate hold pricing
      const holdPricing = this.calculateHoldPricing(requestedHoldHours);
      console.log(`   Hold Duration: ${holdPricing.duration} hours`);
      console.log(`   Hold Price: ${holdPricing.price} ${holdPricing.currency}`);
      console.log(`   Customer Expires At: ${holdPricing.expiresAt.toISOString()}`);

      // Transform passengers to Duffel format
      const duffelPassengers = this.transformPassengersToDuffel(passengers);

      // Create hold order (pay_later type in Duffel API)
      const order = await this.client.orders.create({
        selected_offers: [offerRequest.id],
        passengers: duffelPassengers,
        type: 'pay_later', // hold order (pay later, not instant)
      });

      console.log('✅ Duffel hold order created successfully!');
      console.log(`   Order ID: ${order.data.id}`);
      console.log(`   Booking Reference: ${order.data.booking_reference}`);

      // SAFETY CHECK 2: Verify airline's actual expiration matches our promise
      const airlinePaymentDeadline = (order.data as any).payment_required_by;

      if (airlinePaymentDeadline) {
        const airlineExpiration = new Date(airlinePaymentDeadline);
        const actualHoldHours = (airlineExpiration.getTime() - Date.now()) / 3600000;

        console.log(`   Airline Expires At: ${airlineExpiration.toISOString()}`);
        console.log(`   Actual Hold Duration: ${Math.floor(actualHoldHours)} hours`);

        // Verify airline allows at least 80% of requested hold
        if (actualHoldHours < requestedHoldHours * 0.8) {
          console.error(`❌ CRITICAL: Airline only allows ${Math.floor(actualHoldHours)}h hold, but customer paid for ${requestedHoldHours}h`);
          throw new Error(
            `HOLD_MISMATCH: Airline only allows ${Math.floor(actualHoldHours)} hour hold, ` +
            `but ${requestedHoldHours} hours was requested. Cannot fulfill this hold.`
          );
        }

        // Warn if actual hold is shorter than requested
        if (actualHoldHours < requestedHoldHours) {
          console.warn(`⚠️  Airline hold (${Math.floor(actualHoldHours)}h) is shorter than requested (${requestedHoldHours}h)`);
        }
      } else {
        console.warn('⚠️  No payment_required_by from airline - cannot verify hold duration');
      }

      // Add enriched hold information to response
      return {
        ...order,
        holdPricing: {
          ...holdPricing,
          airlineExpiresAt: airlinePaymentDeadline ? new Date(airlinePaymentDeadline) : undefined,
          priceGuaranteed: validation.priceGuaranteed,
          warning: validation.warning,
        },
        validation: {
          priceGuaranteed: validation.priceGuaranteed,
          warning: validation.warning,
        },
      };
    } catch (error: any) {
      console.error('❌ Duffel hold order creation error:', error);

      // Pass through safety errors with original message
      if (error.message?.startsWith('HOLD_REJECTED:') || error.message?.startsWith('HOLD_MISMATCH:') || error.message?.startsWith('SAFETY_ERROR:')) {
        throw error;
      }

      throw new Error(`Duffel hold order creation failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Calculate Hold Pricing
   *
   * Determines the cost to hold a booking based on hold duration:
   * - 0-6 hours: $19.99
   * - 6-24 hours: $39.99
   * - 24-48 hours: $59.99
   * - 48-72 hours: $89.99 (maximum hold duration)
   *
   * @param holdDurationHours - Desired hold duration in hours
   * @returns Hold pricing details
   */
  calculateHoldPricing(holdDurationHours: number): {
    duration: number;
    price: number;
    currency: string;
    expiresAt: Date;
    tier: 'free' | 'short' | 'medium' | 'long';
  } {
    let price = 0;
    let actualDuration = holdDurationHours;
    let tier: 'free' | 'short' | 'medium' | 'long' = 'free';

    // Cap at 72 hours (3 days)
    if (holdDurationHours > 72) {
      actualDuration = 72;
    }

    // Apply tiered pricing
    if (holdDurationHours <= 6) {
      price = 19.99;
      tier = 'free';
    } else if (holdDurationHours <= 24) {
      price = 39.99;
      tier = 'short';
    } else if (holdDurationHours <= 48) {
      price = 59.99;
      tier = 'medium';
    } else {
      price = 89.99;
      tier = 'long';
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + actualDuration);

    return {
      duration: actualDuration,
      price,
      currency: 'USD',
      expiresAt,
      tier,
    };
  }

  /**
   * Get Available Hold Durations
   *
   * Returns all available hold duration tiers with pricing
   */
  getHoldDurationTiers(): Array<{
    label: string;
    hours: number;
    price: number;
    currency: string;
    description: string;
    tier: 'free' | 'short' | 'medium' | 'long';
  }> {
    return [
      {
        label: '6 Hours',
        hours: 6,
        price: 0,
        currency: 'USD',
        description: 'Quick decision - Free hold',
        tier: 'free',
      },
      {
        label: '24 Hours',
        hours: 24,
        price: 15,
        currency: 'USD',
        description: 'Standard hold - $15',
        tier: 'short',
      },
      {
        label: '48 Hours',
        hours: 48,
        price: 25,
        currency: 'USD',
        description: 'Extended hold - $25',
        tier: 'medium',
      },
      {
        label: '72 Hours',
        hours: 72,
        price: 50,
        currency: 'USD',
        description: 'Maximum hold - $50',
        tier: 'long',
      },
    ];
  }

  /**
   * Get Order - Retrieve order details by ID
   *
   * @param orderId - The Duffel order ID
   * @returns Order object with current status
   */
  async getOrder(orderId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`🔍 Retrieving Duffel order: ${orderId}`);

      const order = await this.client.orders.get(orderId);

      console.log('✅ Order retrieved successfully');
      console.log(`   Status: ${order.data.booking_reference}`);
      console.log(`   Live Mode: ${order.data.live_mode}`);

      return order;
    } catch (error: any) {
      console.error('❌ Error retrieving Duffel order:', error);
      throw new Error(`Failed to retrieve order: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Transform passenger data from our format to Duffel format
   *
   * Duffel requires specific passenger data structure:
   * - given_name, family_name (not firstName, lastName)
   * - born_on (YYYY-MM-DD format)
   * - phone_number (E.164 format: +1234567890)
   * - email
   * - gender (m/f)
   * - title (mr/ms/mrs/miss/dr)
   *
   * @param passengers - Array of passengers in our format
   * @returns Array of passengers in Duffel format
   */
  private transformPassengersToDuffel(passengers: any[]): any[] {
    return passengers.map((passenger: any, index: number) => {
      // Build base passenger object
      const duffelPassenger: any = {
        id: `passenger_${index}`, // Unique ID for this request
        given_name: passenger.firstName?.toUpperCase() || passenger.name?.firstName?.toUpperCase() || 'PASSENGER',
        family_name: passenger.lastName?.toUpperCase() || passenger.name?.lastName?.toUpperCase() || 'NAME',
        born_on: passenger.dateOfBirth || '1990-01-01',
        email: passenger.email || passenger.contact?.emailAddress || 'booking@fly2any.com',
        phone_number: this.formatPhoneNumber(
          passenger.phone || passenger.contact?.phones?.[0]?.number || '1234567890'
        ),
        gender: this.mapGender(passenger.gender),
        title: this.mapTitle(passenger.title),
      };

      // Add passport/identity document if provided
      if (passenger.passportNumber) {
        duffelPassenger.identity_documents = [
          {
            unique_identifier: passenger.passportNumber.toUpperCase(),
            expires_on: passenger.passportExpiryDate || passenger.passportExpiry || '2030-12-31',
            issuing_country_code: passenger.nationality || 'US',
          },
        ];
      }

      // Add infant details if applicable
      if (passenger.type === 'infant' && passenger.dateOfBirth) {
        duffelPassenger.infant_passenger_id = null; // Duffel specific field
      }

      return duffelPassenger;
    });
  }

  /**
   * Format phone number to E.164 format required by Duffel
   * E.164 format: +[country code][number] (e.g., +12025551234)
   *
   * @param phone - Phone number in any format
   * @returns Phone number in E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // If it already starts with country code, add +
    if (digitsOnly.length >= 10) {
      // Default to US country code if not provided
      if (digitsOnly.length === 10) {
        return `+1${digitsOnly}`;
      }
      return `+${digitsOnly}`;
    }

    // Fallback to mock number
    return '+11234567890';
  }

  /**
   * Map gender to Duffel format (m/f)
   *
   * @param gender - Gender in our format (MALE/FEMALE/male/female)
   * @returns Gender in Duffel format (m/f)
   */
  private mapGender(gender?: string): 'm' | 'f' {
    if (!gender) return 'm';

    const normalized = gender.toLowerCase();
    if (normalized === 'female' || normalized === 'f') return 'f';
    return 'm';
  }

  /**
   * Map title to Duffel format
   *
   * @param title - Title in our format (Mr/Ms/Mrs/Dr)
   * @returns Title in Duffel format (mr/ms/mrs/miss/dr)
   */
  private mapTitle(title?: string): 'mr' | 'ms' | 'mrs' | 'miss' | 'dr' {
    if (!title) return 'mr';

    const normalized = title.toLowerCase();
    if (normalized === 'ms') return 'ms';
    if (normalized === 'mrs') return 'mrs';
    if (normalized === 'miss') return 'miss';
    if (normalized === 'dr') return 'dr';
    return 'mr';
  }

  /**
   * Extract PNR (booking reference) from Duffel order
   *
   * @param order - Duffel order object
   * @returns Booking reference string
   */
  extractBookingReference(order: any): string {
    return order.data?.booking_reference || order.booking_reference || 'N/A';
  }

  /**
   * Extract order ID from Duffel order
   *
   * @param order - Duffel order object
   * @returns Order ID string
   */
  extractOrderId(order: any): string {
    return order.data?.id || order.id || 'N/A';
  }

  /**
   * Get Baggage Options from Duffel Offer
   *
   * Extracts available baggage services from a Duffel offer's available_services.
   * Returns standardized baggage options with pricing per segment and per passenger.
   *
   * @param offerId - The Duffel offer ID
   * @returns Standardized baggage options with pricing
   */
  async getBaggageOptions(offerId: string) {
    if (!this.isInitialized) {
      console.warn('Duffel API not initialized - returning empty baggage options');
      return {
        success: false,
        data: [],
        error: 'Duffel API not initialized',
      };
    }

    try {
      console.log(`Fetching baggage options for Duffel offer: ${offerId}`);

      // Fetch the offer details
      const offer = await this.client.offers.get(offerId);

      if (!offer.data) {
        throw new Error('Offer not found');
      }

      const availableServices = offer.data.available_services || [];

      // Filter for baggage services
      const baggageServices = availableServices.filter(
        (service: any) => service.type === 'baggage'
      );

      console.log(`Found ${baggageServices.length} baggage services`);

      // Transform to standardized format
      const baggageOptions = baggageServices.map((service: any) => {
        const metadata = service.metadata || {};
        const weight = metadata.maximum_weight_kg || metadata.weight_kg || 23;
        const type = metadata.type || 'checked'; // 'checked' or 'carry_on'

        return {
          id: service.id,
          type: type, // 'checked' or 'carry_on'
          name: metadata.title || `Checked Bag (${weight}kg)`,
          description: metadata.description || `Baggage up to ${weight}kg`,
          weight: {
            value: weight,
            unit: 'kg',
          },
          price: {
            amount: service.total_amount,
            currency: service.total_currency,
          },
          quantity: {
            min: metadata.minimum_quantity || 0,
            max: metadata.maximum_quantity || 5,
          },
          segmentIds: service.segment_ids || [], // Which segments this applies to
          passengerIds: service.passenger_ids || [], // Which passengers this applies to
          metadata: {
            duffelServiceId: service.id,
            maximumLength: metadata.maximum_length_cm,
            maximumWidth: metadata.maximum_width_cm,
            maximumHeight: metadata.maximum_height_cm,
          },
        };
      });

      return {
        success: true,
        data: baggageOptions,
        meta: {
          offerId: offerId,
          totalServices: baggageOptions.length,
          currency: baggageOptions[0]?.price.currency || 'USD',
        },
      };
    } catch (error: any) {
      console.error('Error fetching Duffel baggage options:', error.message);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to fetch baggage options',
      };
    }
  }

  /**
   * Get Offer Details by ID
   *
   * Fetches a specific offer from Duffel by its ID.
   * Useful for retrieving up-to-date offer information including available services.
   *
   * @param offerId - The Duffel offer ID
   * @returns Offer details including available services
   */
  async getOffer(offerId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`Retrieving Duffel offer: ${offerId}`);

      const offer = await this.client.offers.get(offerId);

      console.log('Offer retrieved successfully');
      console.log(`  Available services: ${offer.data.available_services?.length || 0}`);

      return offer;
    } catch (error: any) {
      console.error('Error retrieving Duffel offer:', error);
      throw new Error(`Failed to retrieve offer: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get Order Cancellation Quote
   * Returns cancellation details including refund amount and fees
   *
   * @param orderId - Duffel order ID
   * @returns Cancellation quote with refund information
   */
  async getOrderCancellationQuote(orderId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`💰 Getting cancellation quote for order: ${orderId}`);

      // Get the order first to check current status
      const order = await this.client.orders.get(orderId);

      // Check if order can be cancelled
      if (order.data.cancelled_at) {
        throw new Error('ORDER_ALREADY_CANCELLED: This order has already been cancelled');
      }

      // Get cancellation quote from Duffel
      const cancellation = await this.client.orderCancellations.create({
        order_id: orderId,
      });

      console.log('✅ Cancellation quote retrieved');
      console.log(`   Refund Amount: ${cancellation.data.refund_amount} ${cancellation.data.refund_currency}`);

      return {
        data: cancellation.data,
        order: order.data,
      };
    } catch (error: any) {
      console.error('❌ Error getting cancellation quote:', error);
      throw new Error(`Failed to get cancellation quote: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Cancel Order
   * Confirms the cancellation and processes the refund
   *
   * @param orderId - Duffel order ID
   * @returns Cancellation confirmation
   */
  async cancelOrder(orderId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`🚫 Cancelling order: ${orderId}`);

      // Create cancellation
      const cancellation = await this.client.orderCancellations.create({
        order_id: orderId,
      });

      // Confirm the cancellation if it needs confirmation
      // SDK types may be incomplete - using type assertion for confirm_by and confirmed_at
      const cancellationData = cancellation.data as any;
      if (cancellationData.confirm_by && !cancellationData.confirmed_at) {
        console.log('⏳ Confirming cancellation...');
        const confirmed = await this.client.orderCancellations.confirm(cancellation.data.id);

        console.log('✅ Order cancelled and confirmed');
        console.log(`   Cancellation ID: ${confirmed.data.id}`);
        console.log(`   Refund Amount: ${confirmed.data.refund_amount} ${confirmed.data.refund_currency}`);

        return confirmed;
      }

      console.log('✅ Order cancelled');
      console.log(`   Cancellation ID: ${cancellation.data.id}`);

      return cancellation;
    } catch (error: any) {
      console.error('❌ Error cancelling order:', error);

      // Handle specific Duffel errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const alreadyCancelledError = errors.find((e: any) =>
          e.code === 'order_already_cancelled' ||
          e.title?.toLowerCase().includes('already cancelled')
        );

        if (alreadyCancelledError) {
          throw new Error('ORDER_ALREADY_CANCELLED: This order has already been cancelled');
        }

        const notCancellableError = errors.find((e: any) =>
          e.code === 'not_cancellable' ||
          e.title?.toLowerCase().includes('cannot be cancelled')
        );

        if (notCancellableError) {
          throw new Error('NOT_CANCELLABLE: This order cannot be cancelled. Please contact support.');
        }
      }

      throw new Error(`Failed to cancel order: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Create Order Change Request
   * Initiates a request to modify the booking
   *
   * @param orderId - Duffel order ID
   * @param changes - Requested changes to the order
   * @returns Change request ID
   */
  async createOrderChangeRequest(orderId: string, changes: any) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`📝 Creating change request for order: ${orderId}`);

      // Create order change request
      const changeRequest = await this.client.orderChangeRequests.create({
        order_id: orderId,
        slices: changes.slices, // New flight segments
      });

      console.log('✅ Change request created');
      console.log(`   Change Request ID: ${changeRequest.data.id}`);

      return changeRequest;
    } catch (error: any) {
      console.error('❌ Error creating change request:', error);
      throw new Error(`Failed to create change request: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get Order Change Offers
   * Retrieves available change options with pricing
   *
   * @param changeRequestId - Duffel order change request ID
   * @returns Available change offers
   */
  async getOrderChangeOffers(changeRequestId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`🔍 Getting change offers for request: ${changeRequestId}`);

      // Get the change request to check offers
      const changeRequest = await this.client.orderChangeRequests.get(changeRequestId);

      // Check if offers are available
      if (!changeRequest.data.order_change_offers || changeRequest.data.order_change_offers.length === 0) {
        console.log('⚠️  No change offers available');
        return {
          data: [],
          meta: { count: 0 },
        };
      }

      console.log(`✅ Found ${changeRequest.data.order_change_offers.length} change offers`);

      return {
        data: changeRequest.data.order_change_offers,
        meta: {
          count: changeRequest.data.order_change_offers.length,
          changeRequestId: changeRequestId,
        },
      };
    } catch (error: any) {
      console.error('❌ Error getting change offers:', error);
      throw new Error(`Failed to get change offers: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Confirm Order Change
   * Accepts a change offer and updates the booking
   *
   * @param changeOfferId - Duffel order change offer ID
   * @returns Change confirmation
   */
  async confirmOrderChange(changeOfferId: string) {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log(`✔️  Confirming change offer: ${changeOfferId}`);

      // Create order change (confirms the change)
      const orderChange = await this.client.orderChanges.create({
        selected_order_change_offer: changeOfferId,
      });

      console.log('✅ Order change confirmed');
      console.log(`   Change ID: ${orderChange.data.id}`);
      // SDK types may be incomplete - using type assertion for order_id
      console.log(`   New Order ID: ${(orderChange.data as any).order_id}`);

      return orderChange;
    } catch (error: any) {
      console.error('❌ Error confirming order change:', error);

      // Handle specific errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        const offerExpiredError = errors.find((e: any) =>
          e.code === 'offer_expired' ||
          e.title?.toLowerCase().includes('expired')
        );

        if (offerExpiredError) {
          throw new Error('OFFER_EXPIRED: This change offer has expired. Please request a new change.');
        }

        const priceChangeError = errors.find((e: any) =>
          e.code === 'price_changed' ||
          e.title?.toLowerCase().includes('price changed')
        );

        if (priceChangeError) {
          throw new Error('PRICE_CHANGED: The price for this change has changed. Please review the new price.');
        }
      }

      throw new Error(`Failed to confirm order change: ${error.message || 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const duffelAPI = new DuffelAPI();

// Export types
export type { DuffelSearchParams };
