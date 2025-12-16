import { Duffel } from '@duffel/api';
import axios from 'axios';
import { applyMarkup } from '@/lib/config/ancillary-markup';
import { extractAllAviationData } from '@/lib/aviation/aviation-intelligence-service';

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
  nonStop?: boolean; // If true, only return nonstop/direct flights
}

class DuffelAPI {
  private client: Duffel;
  private isInitialized: boolean = false;
  private static initWarningLogged = false;

  constructor() {
    // IMPORTANT: Trim token to remove any newlines/whitespace that break HTTP headers
    const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();

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

      // Create offer request with Duffel SDK
      // Note: Using type assertion to work around Duffel SDK type definitions
      const offerRequestParams: any = {
        slices,
        passengers,
        cabin_class: cabinClassMap[params.cabinClass || 'economy'],
        return_offers: true,
      };

      // Add max_connections filter for nonstop flights
      // max_connections: 0 means only nonstop/direct flights
      if (params.nonStop === true) {
        offerRequestParams.max_connections = 0;
        console.log('✈️  Duffel: Filtering for nonstop flights only (max_connections: 0)');
      }

      const offerRequest = await this.client.offerRequests.create(offerRequestParams);

      console.log(`✅ Duffel offer request created: ${offerRequest.data.id}`);

      // Wait for offers to be ready (Duffel processes asynchronously)
      let offers = (offerRequest.data as any).offers || [];
      let attempts = 0;
      const maxAttempts = 5;

      while (offers.length === 0 && attempts < maxAttempts) {
        console.log(`⏳ Waiting for Duffel offers... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch the offer request again
        const updated = await this.client.offerRequests.get(offerRequest.data.id);

        offers = (updated.data as any).offers || [];
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

        // ⚠️ PRICE SANITY CHECK: Flag unusually low international prices
        const isInternational = firstOffer.slices?.length === 2 ||
          (firstOffer.slices?.[0]?.origin?.iata_country_code !== firstOffer.slices?.[0]?.destination?.iata_country_code);
        if (isInternational && totalAmount < 300 && firstOffer.total_currency === 'USD') {
          console.log('\n⚠️  PRICE WARNING: International roundtrip price seems unusually low!');
          console.log(`   Expected: $500-2000+ for international roundtrip`);
          console.log(`   Actual: $${totalAmount.toFixed(2)}`);
          console.log(`   This may be: Test mode pricing, Basic economy, or Special promotion`);
          console.log(`   Token type: ${process.env.DUFFEL_ACCESS_TOKEN?.substring(0, 12)}...`);
        }

        console.log(`\n🔐 Duffel Mode: ${firstOffer.live_mode ? 'LIVE (Real Prices)' : 'TEST (Demo Prices)'}`);
        console.log('\n💼 ===================================================================\n');
      }

      // ⚠️ CRITICAL: Check if Duffel is returning TEST mode data
      const isTestMode = offers.length > 0 && offers[0].live_mode === false;
      if (isTestMode) {
        console.warn('\n⚠️ ========================================');
        console.warn('⚠️  DUFFEL IS RETURNING TEST MODE DATA!');
        console.warn('⚠️  Prices are NOT real market prices!');
        console.warn('⚠️  live_mode: false in API response');
        console.warn('⚠️ ========================================\n');
      }

      // Convert Duffel offers to our standard format
      const standardizedOffers = offers.map((offer: any) => this.convertDuffelOffer(offer));

      // Extract and store ALL aviation data (non-blocking)
      // Captures: Airlines, Aircraft, Airports, Routes, Flights, Fare Classes, Price Trends
      this.extractAllAviationIntelligence(offers).catch((err) => {
        console.warn('Aviation intelligence extraction error:', err.message);
      });

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
          isTestMode: isTestMode,
          liveMode: !isTestMode,
        },
      };
    } catch (error: any) {
      // Enhanced error logging for debugging Duffel API issues
      const errorDetails = {
        message: error.message || 'Unknown error',
        name: error.name,
        code: error.code,
        status: error.status || error.response?.status,
        statusCode: error.statusCode,
        type: error.type,
        // Duffel SDK specific error properties
        errors: error.errors || error.response?.data?.errors,
        meta: error.meta,
      };

      console.error('❌ Duffel API error:', errorDetails.message);
      console.error('   Error type:', errorDetails.name);

      // Check for specific Duffel error types
      if (error.errors && Array.isArray(error.errors)) {
        console.error('   Duffel errors:');
        error.errors.forEach((e: any, i: number) => {
          console.error(`     [${i + 1}] ${e.code || 'N/A'}: ${e.title || e.message || 'No details'}`);
          if (e.documentation_url) {
            console.error(`         Docs: ${e.documentation_url}`);
          }
        });
      }

      // Check for rate limiting
      if (error.status === 429 || error.statusCode === 429) {
        console.error('   ⚠️  Rate limited! Consider adding retry logic.');
      }

      // Check for authentication issues
      if (error.status === 401 || error.statusCode === 401) {
        console.error('   ⚠️  Authentication failed. Check DUFFEL_ACCESS_TOKEN.');
      }

      // Check for network issues
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        console.error('   ⚠️  Network error. Check internet connection.');
      }

      console.error('   Request params:', {
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
      });

      // Return empty results on error
      return {
        data: [],
        meta: {
          count: 0,
          error: errorDetails.message,
          errorCode: errorDetails.code || errorDetails.status,
          errorType: errorDetails.name,
        },
      };
    }
  }

  /**
   * Convert Duffel offer format to our standardized format
   */
  private convertDuffelOffer(duffelOffer: any) {
    // ENHANCED: Extract ALL available baggage data from Duffel API
    const extractedBaggage = this.extractFullBaggageDetails(duffelOffer);

    // ENHANCED: Extract fare conditions (refund/change policies)
    const conditions = this.extractConditions(duffelOffer);

    // ENHANCED: Extract branded fare label from passengers
    const brandedFareLabel = this.extractBrandedFareLabel(duffelOffer);

    return {
      id: duffelOffer.id,
      source: 'Duffel',
      type: 'flight-offer',
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: duffelOffer.slices.length === 1,
      lastTicketingDate: duffelOffer.expires_at?.split('T')[0],
      lastTicketingDateTime: duffelOffer.expires_at,
      // NOTE: Duffel doesn't provide exact bookable seat count in offer response
      // Default to 9 (full availability) - actual availability checked at booking time
      numberOfBookableSeats: 9,

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

      // ENHANCED: Traveler pricings with FULL baggage details from API
      // CRITICAL FIX: Calculate PER-PERSON price, not total price
      travelerPricings: duffelOffer.passengers?.map((passenger: any) => {
        const passengerCount = duffelOffer.passengers?.length || 1;
        const perPersonTotal = (parseFloat(duffelOffer.total_amount) / passengerCount).toFixed(2);
        const perPersonBase = duffelOffer.base_amount
          ? (parseFloat(duffelOffer.base_amount) / passengerCount).toFixed(2)
          : perPersonTotal;

        return {
          travelerId: passenger.id,
          fareOption: brandedFareLabel || 'STANDARD',
          travelerType: passenger.type.toUpperCase(),
          price: {
            currency: duffelOffer.total_currency,
            total: perPersonTotal,
            base: perPersonBase,
          },
        fareDetailsBySegment: duffelOffer.slices.flatMap((slice: any, sliceIndex: number) =>
          slice.segments.map((segment: any) => {
            // Get passenger data for this segment
            const passengerData = segment.passengers?.[0];
            const cabinClassName = passengerData?.cabin_class_marketing_name || '';

            return {
              segmentId: segment.id,
              cabin: this.mapDuffelCabin(cabinClassName),
              fareBasis: passengerData?.fare_basis_code || 'ECONOMY',
              brandedFare: passengerData?.cabin_class || undefined,
              // CRITICAL: Use real branded fare label for accurate baggage display
              brandedFareLabel: cabinClassName || brandedFareLabel || undefined,
              class: passengerData?.cabin_class?.[0] || 'Y',
              // ENHANCED: Full baggage details from Duffel API
              includedCheckedBags: extractedBaggage.checked,
              includedCabinBags: extractedBaggage.cabin,
              // ENHANCED: Amenities from conditions
              amenities: conditions.amenities,
            };
          })
        ),
        };
      }) || [],

      // ENHANCED: Fare conditions (refundability, changes)
      conditions: {
        refundable: conditions.refundable,
        changeable: conditions.changeable,
        refundPenalty: conditions.refundPenalty,
        changePenalty: conditions.changePenalty,
      },

      // Duffel-specific metadata
      duffelMetadata: {
        expires_at: duffelOffer.expires_at,
        live_mode: duffelOffer.live_mode,
        owner: duffelOffer.owner,
        // Store raw baggage for debugging
        raw_passengers: duffelOffer.passengers,
        raw_services: duffelOffer.available_services,
      },
    };
  }

  /**
   * Extract FULL baggage details from Duffel offer
   * Duffel provides baggage in multiple places - extract ALL
   */
  private extractFullBaggageDetails(duffelOffer: any): {
    checked: { quantity: number; weight?: number; weightUnit?: string };
    cabin: { quantity: number; weight?: number; weightUnit?: string };
  } {
    let checkedBags = 0;
    let checkedWeight: number | undefined;
    let cabinBags = 0;
    let cabinWeight: number | undefined;

    // Method 1: Check passengers' included baggage (most reliable)
    const passengers = duffelOffer.passengers || [];
    for (const passenger of passengers) {
      // Checked bags
      const baggages = passenger.baggages || [];
      for (const bag of baggages) {
        if (bag.type === 'checked') {
          checkedBags = Math.max(checkedBags, bag.quantity || 1);
          checkedWeight = bag.weight_kg;
        } else if (bag.type === 'carry_on') {
          cabinBags = Math.max(cabinBags, bag.quantity || 1);
          cabinWeight = bag.weight_kg;
        }
      }

      // Also check cabin_baggage and checked_baggage fields
      if (passenger.cabin_baggage) {
        cabinBags = Math.max(cabinBags, passenger.cabin_baggage.quantity || 1);
        cabinWeight = passenger.cabin_baggage.weight_kg;
      }
      if (passenger.checked_baggage) {
        checkedBags = Math.max(checkedBags, passenger.checked_baggage.quantity || 1);
        checkedWeight = passenger.checked_baggage.weight_kg;
      }
    }

    // Method 2: Check slices for included baggage
    const slices = duffelOffer.slices || [];
    for (const slice of slices) {
      for (const segment of slice.segments || []) {
        for (const passengerData of segment.passengers || []) {
          if (passengerData.baggages) {
            for (const bag of passengerData.baggages) {
              if (bag.type === 'checked') {
                checkedBags = Math.max(checkedBags, bag.quantity || 1);
              } else if (bag.type === 'carry_on') {
                cabinBags = Math.max(cabinBags, bag.quantity || 1);
              }
            }
          }
        }
      }
    }

    // Method 3: Check available_services for included bags (less common)
    const services = duffelOffer.available_services || [];
    const includedBagServices = services.filter((s: any) =>
      s.type === 'baggage' && s.total_amount === '0' // Free = included
    );
    if (includedBagServices.length > 0) {
      for (const service of includedBagServices) {
        if (service.metadata?.type === 'checked') {
          checkedBags = Math.max(checkedBags, 1);
        } else if (service.metadata?.type === 'carry_on') {
          cabinBags = Math.max(cabinBags, 1);
        }
      }
    }

    // Debug only when needed (removed from production for performance)
    // console.log(`🧳 Duffel baggage extraction: checked=${checkedBags}, cabin=${cabinBags}`);

    return {
      checked: {
        quantity: checkedBags,
        weight: checkedWeight,
        weightUnit: checkedWeight ? 'kg' : undefined,
      },
      cabin: {
        quantity: cabinBags, // Return EXACT API value - 0 if not specified
        weight: cabinWeight,
        weightUnit: cabinWeight ? 'kg' : undefined,
      },
    };
  }

  /**
   * Extract fare conditions (refund/change policies) from Duffel offer
   */
  private extractConditions(duffelOffer: any): {
    refundable: boolean;
    changeable: boolean;
    refundPenalty?: string;
    changePenalty?: string;
    amenities: any[];
  } {
    const conditions = duffelOffer.conditions || {};

    // Check refund before departure
    const refundBefore = conditions.refund_before_departure;
    const refundable = refundBefore?.allowed === true;
    const refundPenalty = refundBefore?.penalty_amount
      ? `${refundBefore.penalty_currency} ${refundBefore.penalty_amount}`
      : undefined;

    // Check change before departure
    const changeBefore = conditions.change_before_departure;
    const changeable = changeBefore?.allowed === true;
    const changePenalty = changeBefore?.penalty_amount
      ? `${changeBefore.penalty_currency} ${changeBefore.penalty_amount}`
      : undefined;

    // Build amenities array based on conditions
    const amenities: any[] = [];
    if (refundable) {
      amenities.push({
        description: refundPenalty ? `Refundable (${refundPenalty} fee)` : 'Fully Refundable',
        amenityType: 'REFUND',
        isChargeable: !!refundPenalty,
      });
    }
    if (changeable) {
      amenities.push({
        description: changePenalty ? `Changes allowed (${changePenalty} fee)` : 'Free Changes',
        amenityType: 'CHANGE',
        isChargeable: !!changePenalty,
      });
    }

    return {
      refundable,
      changeable,
      refundPenalty,
      changePenalty,
      amenities,
    };
  }

  /**
   * Extract branded fare label from Duffel offer
   */
  private extractBrandedFareLabel(duffelOffer: any): string | undefined {
    // Try to get from first segment's first passenger
    const firstSlice = duffelOffer.slices?.[0];
    const firstSegment = firstSlice?.segments?.[0];
    const firstPassenger = firstSegment?.passengers?.[0];

    if (firstPassenger?.cabin_class_marketing_name) {
      return firstPassenger.cabin_class_marketing_name;
    }

    // Fallback to fare_brand_name if available
    if (firstPassenger?.fare_brand_name) {
      return firstPassenger.fare_brand_name;
    }

    return undefined;
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

    // IMPORTANT: Trim token to remove any newlines/whitespace that break HTTP headers
    const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
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
      console.log(`   💰 Seat pricing: REAL from airline API + 25% markup`);
      console.log(`   🪑 Seat availability: REAL-TIME from airline`);
      console.log('🪑 ========================================');

      return {
        data: standardizedSeatMaps,
        meta: {
          hasRealData: true,
          source: 'Duffel',
          count: standardizedSeatMaps.length,
          markupApplied: true,
          markupPercentage: 25,
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
    const cabins = (duffelSeatMap.cabins || []).map((cabin: any, cabinIndex: number) => {
      // Group seats by row
      const rowMap = new Map<number, any[]>();

      console.log(`🪑 Processing cabin ${cabinIndex}: ${cabin.cabin_class || 'unknown'}, rows: ${cabin.rows?.length || 0}`);

      (cabin.rows || []).forEach((row: any, rowIndex: number) => {
        // Extract row number - try row.row_number first, then from first seat designator
        let rowNumber = row.row_number;

        // If row_number is not set, try to get it from the first seat designator
        if (rowNumber === undefined || rowNumber === null) {
          const firstSeat = row.sections?.[0]?.elements?.find((el: any) => el.type === 'seat');
          if (firstSeat?.designator) {
            const match = firstSeat.designator.match(/^(\d+)/);
            rowNumber = match ? parseInt(match[1], 10) : rowIndex + 1;
          } else {
            rowNumber = rowIndex + 1; // Fallback to index + 1
          }
        }

        // Ensure rowNumber is a valid positive integer
        rowNumber = typeof rowNumber === 'number' ? rowNumber : parseInt(rowNumber, 10);
        if (isNaN(rowNumber) || rowNumber < 1) {
          rowNumber = rowIndex + 1;
        }

        (row.sections || []).forEach((section: any, sectionIndex: number) => {
          (section.elements || []).forEach((element: any) => {
            if (element.type === 'seat') {
              // Extract row number from designator as backup validation
              const designatorMatch = element.designator?.match(/^(\d+)([A-Z]+)$/);
              const seatRowFromDesignator = designatorMatch ? parseInt(designatorMatch[1], 10) : rowNumber;
              const finalRowNumber = seatRowFromDesignator || rowNumber;

              if (!rowMap.has(finalRowNumber)) {
                rowMap.set(finalRowNumber, []);
              }

              // Check availability - seat is available if it has available_services with pricing
              const hasAvailableServices = Array.isArray(element.available_services) && element.available_services.length > 0;

              // Convert Duffel seat to Amadeus-like format
              // Apply 25% markup to seat prices
              const seat = {
                number: element.designator, // e.g., "12A"
                column: element.designator?.match(/[A-Z]+$/)?.[0] || String.fromCharCode(65 + sectionIndex),
                travelerPricing: hasAvailableServices
                  ? element.available_services.map((service: any) => {
                      // Apply 25% markup to seat prices
                      if (service.total_amount) {
                        const netPrice = parseFloat(service.total_amount);
                        const markup = applyMarkup(netPrice, 'seats');
                        return {
                          seatAvailabilityStatus: 'AVAILABLE',
                          price: {
                            total: markup.customerPrice.toFixed(2),
                            currency: service.total_currency || 'USD',
                            netPrice: markup.netPrice,
                            markupApplied: true,
                            markupPercentage: markup.markupPercentage,
                          },
                        };
                      }
                      return {
                        seatAvailabilityStatus: 'AVAILABLE',
                        price: null,
                      };
                    })
                  : [{
                      seatAvailabilityStatus: 'BLOCKED',
                      price: null,
                    }],
                characteristicsCodes: this.extractDuffelSeatCharacteristics(element),
                coordinates: {
                  x: element.designator?.match(/[A-Z]+$/)?.[0] || '',
                  y: finalRowNumber.toString(),
                },
                // Additional metadata for debugging
                _duffelData: {
                  hasServices: hasAvailableServices,
                  serviceCount: element.available_services?.length || 0,
                },
              };

              rowMap.get(finalRowNumber)!.push(seat);
            }
          });
        });
      });

      // Convert row map to array format - filter out invalid rows
      const seatRows = Array.from(rowMap.entries())
        .filter(([rowNum]) => rowNum > 0) // Only valid row numbers
        .sort(([a], [b]) => a - b)
        .map(([rowNumber, seats]) => ({
          rowNumber: rowNumber.toString(),
          seats: seats.sort((a, b) => {
            // Sort by column letter
            const colA = a.column || '';
            const colB = b.column || '';
            return colA.localeCompare(colB);
          }),
          hasExitRow: seats.some((s: any) =>
            s.characteristicsCodes?.includes('E') ||
            s.characteristicsCodes?.includes('L')
          ),
        }));

      console.log(`🪑 Cabin ${cabinIndex} processed: ${seatRows.length} rows, sample row seats: ${seatRows[0]?.seats?.length || 0}`);

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
   * SAFETY: This method is disabled by default. Set DUFFEL_ENABLE_ORDERS=true to enable.
   *
   * @param offerRequest - The Duffel offer to book
   * @param passengers - Array of passenger details
   * @param payments - Payment information
   * @returns Order object with booking confirmation
   */
  async createOrder(offerRequest: any, passengers: any[], payments?: any[]) {
    // SAFETY GUARD: Prevent accidental order creation in read-only mode
    if (process.env.DUFFEL_ENABLE_ORDERS !== 'true') {
      throw new Error('ORDER_CREATION_DISABLED: Order creation is disabled. Set DUFFEL_ENABLE_ORDERS=true to enable bookings.');
    }

    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log('🎫 Creating Duffel order...');
      console.log(`   Offer ID: ${offerRequest.id}`);
      console.log(`   Passengers: ${passengers.length}`);

      // Transform passengers to Duffel format
      const duffelPassengers = this.transformPassengersToDuffel(passengers);

      // DIAGNOSTIC: Log transformed passengers
      console.log('📋 DUFFEL DIAGNOSTIC - Transformed passengers:');
      duffelPassengers.forEach((p: any, idx: number) => {
        console.log(`   Passenger ${idx + 1}:`);
        console.log(`     - id: ${p.id}`);
        console.log(`     - given_name: ${p.given_name}`);
        console.log(`     - family_name: ${p.family_name}`);
        console.log(`     - born_on: ${p.born_on}`);
        console.log(`     - email: ${p.email}`);
        console.log(`     - phone_number: ${p.phone_number}`);
        console.log(`     - gender: ${p.gender}`);
        console.log(`     - title: ${p.title}`);
      });

      // Calculate payment amounts
      // NET = original Duffel offer price (what we pay), stored in _netPrice or total_amount
      // Customer = marked-up price (what customer pays), stored in price.total
      const currency = offerRequest.total_currency || offerRequest.price?.currency || 'USD';

      // CRITICAL: Use _netPrice first (set during search with markup), then total_amount, then fallback
      const netAmount = parseFloat(
        offerRequest.price?._netPrice ||
        offerRequest.total_amount ||
        offerRequest.price?.total || '0'
      );

      const customerAmount = parseFloat(offerRequest.price?.total || netAmount.toString());
      const markupAmount = customerAmount - netAmount;

      console.log('💰 DUFFEL PAYMENT - Markup Calculation:');
      console.log(`   NET Amount (to airline): ${currency} ${netAmount.toFixed(2)}`);
      console.log(`   Customer Amount (with markup): ${currency} ${customerAmount.toFixed(2)}`);
      console.log(`   Markup (your profit): ${currency} ${markupAmount.toFixed(2)}`);

      // Create order payload
      const orderPayload: any = {
        selected_offers: [offerRequest.id],
        passengers: duffelPassengers,
        type: 'instant', // instant booking (not hold)
      };

      // Add payments - CRITICAL: Balance payment must match offer total_amount exactly
      // Duffel charges NET amount from balance, markup is tracked separately
      if (payments && payments.length > 0) {
        orderPayload.payments = payments;
      } else if (netAmount > 0) {
        // Payment amount MUST match offer's total_amount (NET price)
        orderPayload.payments = [{
          type: 'balance',
          amount: netAmount.toFixed(2),
          currency: currency,
        }];
        console.log(`   ✅ Payment: ${currency} ${netAmount.toFixed(2)} (NET to Duffel)`);
        console.log(`   💰 Markup tracked: ${currency} ${markupAmount.toFixed(2)} (collected via our system)`);
      }

      // DIAGNOSTIC: Log full payload being sent
      console.log('📋 DUFFEL DIAGNOSTIC - Order payload:');
      console.log(JSON.stringify(orderPayload, null, 2));

      // Create the order
      console.log('🚀 Sending order request to Duffel API...');
      const order = await this.client.orders.create(orderPayload);

      console.log('✅ Duffel order created successfully!');
      console.log(`   Order ID: ${order.data.id}`);
      console.log(`   Booking Reference: ${order.data.booking_reference}`);
      console.log(`   Live Mode: ${order.data.live_mode}`);

      return order;
    } catch (error: any) {
      console.error('❌ Duffel order creation error:', error);

      // CRITICAL: Log full error structure for debugging
      console.error('   Error type:', error.constructor?.name);
      console.error('   Error message:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error status:', error.status || error.statusCode);

      // Duffel SDK puts errors in error.errors (not error.response.data.errors)
      const duffelErrors = error.errors || error.response?.data?.errors || [];

      if (duffelErrors.length > 0) {
        console.error('   Duffel API errors:');
        duffelErrors.forEach((e: any, i: number) => {
          console.error(`     [${i + 1}] Code: ${e.code || 'N/A'}`);
          console.error(`         Title: ${e.title || 'N/A'}`);
          console.error(`         Message: ${e.message || 'N/A'}`);
          console.error(`         Source: ${JSON.stringify(e.source) || 'N/A'}`);
        });
      } else {
        console.error('   No structured Duffel errors found');
        console.error('   Raw error keys:', Object.keys(error));
        if (error.meta) console.error('   Error meta:', JSON.stringify(error.meta));
      }

      // Handle specific Duffel errors
      if (duffelErrors.length > 0) {
        // Check for sold out errors
        const soldOutError = duffelErrors.find((e: any) =>
          e.code === 'offer_no_longer_available' ||
          e.title?.toLowerCase().includes('no longer available') ||
          e.title?.toLowerCase().includes('sold out')
        );

        if (soldOutError) {
          throw new Error('SOLD_OUT: This flight is no longer available. Please search for alternative flights.');
        }

        // Check for price change errors
        const priceChangeError = duffelErrors.find((e: any) =>
          e.code === 'offer_price_changed' ||
          e.title?.toLowerCase().includes('price changed')
        );

        if (priceChangeError) {
          throw new Error('PRICE_CHANGED: The price for this flight has changed. Please review the new price.');
        }

        // Check for expired/not found offer (FIX: Handle "Linked record(s) not found")
        const notFoundError = duffelErrors.find((e: any) =>
          e.code === 'not_found' ||
          e.title?.toLowerCase().includes('not found') ||
          e.message?.toLowerCase().includes('linked record') ||
          e.message?.toLowerCase().includes('not found')
        );

        if (notFoundError) {
          throw new Error('OFFER_EXPIRED: This flight offer has expired. Offers are only valid for 30 minutes. Please search again for current prices.');
        }

        // Check for invalid passenger data
        const invalidDataError = duffelErrors.find((e: any) =>
          e.code === 'validation_error' ||
          e.title?.toLowerCase().includes('invalid')
        );

        if (invalidDataError) {
          throw new Error(`INVALID_DATA: ${invalidDataError.message || 'Invalid passenger information'}`);
        }

        // Build detailed error message from all Duffel errors
        const errorMessages = duffelErrors.map((e: any) =>
          `${e.code || 'ERROR'}: ${e.title || e.message || 'Unknown'}`
        ).join('; ');

        // Create enhanced error with structured data attached
        const enhancedError = new Error(`Duffel order creation failed: ${errorMessages}`) as any;
        enhancedError.duffelErrors = duffelErrors;
        enhancedError.code = duffelErrors[0]?.code || 'DUFFEL_API_ERROR';
        throw enhancedError;
      }

      // Extract meaningful error message
      const errorMsg = error.message ||
                       error.meta?.message ||
                       (error.status ? `HTTP ${error.status}` : 'Unknown error');

      // Create enhanced error preserving original error data
      const enhancedError = new Error(`Duffel order creation failed: ${errorMsg}`) as any;
      enhancedError.originalError = error;
      enhancedError.duffelErrors = error.errors || [];
      enhancedError.code = error.code || 'DUFFEL_ERROR';
      throw enhancedError;
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
   * SAFETY: This method is disabled by default. Set DUFFEL_ENABLE_ORDERS=true to enable.
   *
   * @param offerRequest - The Duffel offer to hold
   * @param passengers - Array of passenger details
   * @param holdDurationHours - How long to hold (0-72 hours)
   * @returns Order object with hold confirmation and pricing
   */
  async createHoldOrder(offerRequest: any, passengers: any[], holdDurationHours?: number) {
    // SAFETY GUARD: Prevent accidental hold creation in read-only mode
    if (process.env.DUFFEL_ENABLE_ORDERS !== 'true') {
      throw new Error('ORDER_CREATION_DISABLED: Hold creation is disabled. Set DUFFEL_ENABLE_ORDERS=true to enable bookings.');
    }

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
   * Pay For Hold Order - Complete payment for a previously held order
   *
   * This method is used to finalize payment for orders created with type='pay_later'.
   * The payment must be made before the `payment_required_by` deadline.
   *
   * IMPORTANT: Before calling this method:
   * 1. Retrieve the latest order to get current price (prices may change)
   * 2. Verify the order hasn't expired (check payment_required_by)
   * 3. Ensure customer has paid via Stripe first
   *
   * @see https://duffel.com/docs/api/payments/create-payment
   *
   * @param orderId - The Duffel order ID (ord_xxxxx)
   * @param amount - The payment amount (must match order total)
   * @param currency - The currency code (must match order currency)
   * @returns Payment confirmation object
   */
  async payForHoldOrder(
    orderId: string,
    amount: string,
    currency: string
  ): Promise<{
    success: boolean;
    paymentId: string;
    status: 'succeeded' | 'failed' | 'pending';
    orderId: string;
    amount: string;
    currency: string;
    error?: string;
  }> {
    // SAFETY GUARD: Prevent accidental payments in read-only mode
    if (process.env.DUFFEL_ENABLE_ORDERS !== 'true') {
      console.error('❌ SAFETY: Duffel payments disabled. Set DUFFEL_ENABLE_ORDERS=true to enable.');
      throw new Error('SAFETY_ERROR: Duffel payments are disabled in configuration');
    }

    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log('💳 Processing Duffel hold order payment...');
      console.log(`   Order ID: ${orderId}`);
      console.log(`   Amount: ${currency} ${amount}`);

      // STEP 1: Verify order exists and check current price
      console.log('📋 Step 1: Verifying order status and price...');
      const order = await this.client.orders.get(orderId);
      const orderData = order.data as any;

      // Check if order is already paid
      if (orderData.payment_status?.awaiting_payment === false) {
        console.log('⚠️  Order appears to already be paid');
        return {
          success: true,
          paymentId: 'already_paid',
          status: 'succeeded',
          orderId,
          amount,
          currency,
        };
      }

      // Check if payment deadline has passed
      const paymentDeadline = orderData.payment_required_by;
      if (paymentDeadline) {
        const deadlineDate = new Date(paymentDeadline);
        const now = new Date();

        if (now > deadlineDate) {
          console.error('❌ Payment deadline has passed');
          throw new Error('PAYMENT_EXPIRED: The hold order has expired. Please create a new booking.');
        }

        const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        console.log(`   ⏰ Payment deadline: ${paymentDeadline} (${hoursRemaining.toFixed(1)}h remaining)`);
      }

      // Verify price hasn't changed significantly
      const currentTotal = orderData.total_amount;
      const currentCurrency = orderData.total_currency;

      if (currentCurrency !== currency) {
        console.error(`❌ Currency mismatch: expected ${currentCurrency}, got ${currency}`);
        throw new Error(`CURRENCY_MISMATCH: Order currency is ${currentCurrency}, not ${currency}`);
      }

      // Allow small price differences (rounding)
      const priceDiff = Math.abs(parseFloat(currentTotal) - parseFloat(amount));
      if (priceDiff > 1.00) { // More than $1 difference
        console.warn(`⚠️  Price changed: ${currentTotal} vs ${amount}`);
        // For now, use the current price from Duffel
        console.log(`   Using current Duffel price: ${currentTotal}`);
      }

      // STEP 2: Create payment via Duffel Payments API
      console.log('💰 Step 2: Creating Duffel payment...');

      const payment = await this.client.payments.create({
        order_id: orderId,
        payment: {
          type: 'balance', // Use Duffel balance (pre-funded)
          amount: currentTotal, // Use current order total
          currency: currentCurrency,
        },
      });

      const paymentData = payment.data as any;

      console.log('✅ Duffel payment created successfully!');
      console.log(`   Payment ID: ${paymentData.id}`);
      console.log(`   Status: ${paymentData.status}`);
      console.log(`   Amount: ${paymentData.currency} ${paymentData.amount}`);

      // Check payment status
      if (paymentData.status === 'failed') {
        console.error('❌ Payment failed:', paymentData.failure_reason);
        throw new Error(`PAYMENT_FAILED: ${paymentData.failure_reason || 'Payment processing failed'}`);
      }

      return {
        success: paymentData.status === 'succeeded',
        paymentId: paymentData.id,
        status: paymentData.status,
        orderId: paymentData.order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
      };
    } catch (error: any) {
      console.error('❌ Duffel payment error:', error);

      // Parse Duffel API error
      if (error.errors && Array.isArray(error.errors)) {
        const duffelError = error.errors[0];
        const errorCode = duffelError.code || 'unknown';
        const errorMessage = duffelError.message || 'Payment failed';

        // Handle specific error codes
        if (errorCode === 'already_paid') {
          return {
            success: true,
            paymentId: 'already_paid',
            status: 'succeeded',
            orderId,
            amount,
            currency,
          };
        }

        if (errorCode === 'already_cancelled') {
          throw new Error('ORDER_CANCELLED: This order has been cancelled');
        }

        if (errorCode === 'past_payment_required_by_date') {
          throw new Error('PAYMENT_EXPIRED: The hold order has expired');
        }

        if (errorCode === 'price_changed') {
          throw new Error(`PRICE_CHANGED: The price has changed. Please refresh and try again.`);
        }

        throw new Error(`DUFFEL_ERROR: ${errorCode} - ${errorMessage}`);
      }

      // Re-throw safety errors
      if (error.message?.startsWith('SAFETY_ERROR:') ||
          error.message?.startsWith('PAYMENT_EXPIRED:') ||
          error.message?.startsWith('CURRENCY_MISMATCH:') ||
          error.message?.startsWith('PAYMENT_FAILED:')) {
        throw error;
      }

      throw new Error(`Duffel payment failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Verify Hold Order Status - Check if hold order is still valid
   *
   * Use this before attempting payment to ensure the order hasn't expired
   * or been cancelled.
   *
   * @param orderId - The Duffel order ID
   * @returns Object with validity status and details
   */
  async verifyHoldOrderStatus(orderId: string): Promise<{
    valid: boolean;
    expired: boolean;
    alreadyPaid: boolean;
    cancelled: boolean;
    paymentDeadline?: string;
    hoursRemaining?: number;
    currentPrice: string;
    currency: string;
    reason?: string;
  }> {
    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized');
    }

    try {
      const order = await this.client.orders.get(orderId);
      const orderData = order.data as any;

      const paymentDeadline = orderData.payment_required_by;
      const now = new Date();
      let expired = false;
      let hoursRemaining: number | undefined;

      if (paymentDeadline) {
        const deadlineDate = new Date(paymentDeadline);
        expired = now > deadlineDate;
        hoursRemaining = expired ? 0 : (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      }

      // Check payment status
      const awaitingPayment = orderData.payment_status?.awaiting_payment !== false;
      const alreadyPaid = !awaitingPayment;

      // Check if cancelled (would have no slices or different status)
      const cancelled = orderData.cancelled_at != null;

      const valid = !expired && !cancelled && !alreadyPaid;

      return {
        valid,
        expired,
        alreadyPaid,
        cancelled,
        paymentDeadline,
        hoursRemaining: hoursRemaining ? Math.floor(hoursRemaining * 10) / 10 : undefined,
        currentPrice: orderData.total_amount,
        currency: orderData.total_currency,
        reason: !valid
          ? (expired ? 'Hold has expired' : cancelled ? 'Order was cancelled' : alreadyPaid ? 'Already paid' : 'Unknown')
          : undefined,
      };
    } catch (error: any) {
      console.error('Error verifying hold order:', error);
      throw new Error(`Failed to verify order: ${error.message}`);
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
   * Get ALL Available Services from Duffel Offer
   *
   * PRODUCTION-READY: Uses direct HTTP with return_available_services=true
   * to fetch ALL real services from Duffel (baggage, seats, CFAR).
   *
   * @param offerId - The Duffel offer ID
   * @returns All available services with proper categorization
   */
  async getAllAvailableServices(offerId: string) {
    if (!this.isInitialized) {
      console.warn('Duffel API not initialized - returning empty services');
      return {
        success: false,
        data: { baggage: [], cfar: [], seats: [] },
        error: 'Duffel API not initialized',
      };
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
    if (!token) {
      return {
        success: false,
        data: { baggage: [], cfar: [], seats: [] },
        error: 'DUFFEL_ACCESS_TOKEN not configured',
      };
    }

    try {
      console.log('🎁 ========================================');
      console.log(`🎁 FETCHING ALL AVAILABLE SERVICES (Production)`);
      console.log(`🎁 Offer ID: ${offerId}`);
      console.log(`🎁 Using: return_available_services=true`);

      // CRITICAL: Use direct HTTP with return_available_services=true
      // The SDK's offers.get() does NOT include available_services by default!
      const response = await axios.get(
        `https://api.duffel.com/air/offers/${offerId}`,
        {
          params: { return_available_services: true },
          headers: {
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      const offer = response.data?.data;
      if (!offer) {
        throw new Error('Offer not found in response');
      }

      const availableServices = offer.available_services || [];
      console.log(`✅ Found ${availableServices.length} total available services`);

      // Categorize services by type
      const baggage: any[] = [];
      const cfar: any[] = [];
      const seats: any[] = [];

      for (const service of availableServices) {
        if (service.type === 'baggage') {
          const metadata = service.metadata || {};
          const weight = metadata.maximum_weight_kg || metadata.weight_kg || 23;

          baggage.push({
            id: service.id,
            type: metadata.type || 'checked',
            name: metadata.title || `Checked Bag (${weight}kg)`,
            description: metadata.description || `Baggage up to ${weight}kg`,
            weight: { value: weight, unit: 'kg' },
            price: {
              amount: service.total_amount,
              currency: service.total_currency,
            },
            quantity: {
              min: metadata.minimum_quantity || 0,
              max: metadata.maximum_quantity || 5,
            },
            segmentIds: service.segment_ids || [],
            passengerIds: service.passenger_ids || [],
            isReal: true,
            metadata: {
              duffelServiceId: service.id,
              maximumLength: metadata.maximum_length_cm,
              maximumWidth: metadata.maximum_width_cm,
              maximumHeight: metadata.maximum_height_cm,
            },
          });
        } else if (service.type === 'cancel_for_any_reason') {
          // CFAR - Cancel For Any Reason protection
          const metadata = service.metadata || {};
          cfar.push({
            id: service.id,
            type: 'cancel_for_any_reason',
            name: 'Cancel For Any Reason',
            description: metadata.description || 'Cancel your flight for any reason and receive a partial refund (typically 75-80%)',
            price: {
              amount: service.total_amount,
              currency: service.total_currency,
            },
            refundPercentage: metadata.refund_percentage || 80,
            terms: metadata.terms || 'Refund available up to 24 hours before departure',
            segmentIds: service.segment_ids || [],
            passengerIds: service.passenger_ids || [],
            isReal: true,
            metadata: {
              duffelServiceId: service.id,
              ...metadata,
            },
          });
        } else if (service.type === 'seat') {
          // Seat services (basic info - full seat maps from /seat_maps endpoint)
          seats.push({
            id: service.id,
            type: 'seat',
            designator: service.metadata?.designator,
            name: service.metadata?.name || 'Seat Selection',
            price: {
              amount: service.total_amount,
              currency: service.total_currency,
            },
            segmentIds: service.segment_ids || [],
            passengerIds: service.passenger_ids || [],
            isReal: true,
          });
        }
      }

      console.log(`   🧳 Baggage services: ${baggage.length}`);
      console.log(`   🛡️  CFAR services: ${cfar.length}`);
      console.log(`   💺 Seat services: ${seats.length}`);
      console.log('🎁 ========================================');

      return {
        success: true,
        data: {
          baggage,
          cfar,
          seats,
        },
        meta: {
          offerId,
          totalServices: availableServices.length,
          hasBaggage: baggage.length > 0,
          hasCFAR: cfar.length > 0,
          hasSeats: seats.length > 0,
          currency: offer.total_currency,
          isRealData: true,
        },
      };
    } catch (error: any) {
      console.error('❌ Error fetching Duffel available services:', error.message);

      if (axios.isAxiosError(error)) {
        console.error('   HTTP Status:', error.response?.status);
        console.error('   Response:', error.response?.data);
      }

      return {
        success: false,
        data: { baggage: [], cfar: [], seats: [] },
        error: error.message || 'Failed to fetch available services',
      };
    }
  }

  /**
   * Get Baggage Options from Duffel Offer
   *
   * PRODUCTION-READY: Uses getAllAvailableServices with return_available_services=true
   *
   * @param offerId - The Duffel offer ID
   * @returns Standardized baggage options with REAL pricing
   */
  async getBaggageOptions(offerId: string) {
    const result = await this.getAllAvailableServices(offerId);

    if (!result.success) {
      return {
        success: false,
        data: [],
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data.baggage,
      meta: {
        offerId,
        totalServices: result.data.baggage.length,
        currency: result.meta?.currency || 'USD',
        isRealData: true,
      },
    };
  }

  /**
   * Get Cancel For Any Reason (CFAR) Options
   *
   * CFAR allows customers to cancel for ANY reason and get partial refund (75-80%)
   * This is a high-value upsell that Duffel provides for some airlines.
   *
   * @param offerId - The Duffel offer ID
   * @returns CFAR options with pricing
   */
  async getCFAROptions(offerId: string) {
    const result = await this.getAllAvailableServices(offerId);

    if (!result.success) {
      return {
        success: false,
        data: [],
        available: false,
        error: result.error,
      };
    }

    const hasCFAR = result.data.cfar.length > 0;

    return {
      success: true,
      data: result.data.cfar,
      available: hasCFAR,
      meta: {
        offerId,
        message: hasCFAR
          ? 'Cancel For Any Reason protection is available for this flight'
          : 'CFAR not available for this airline/route',
        isRealData: true,
      },
    };
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

  // ============================================================================
  // POST-BOOKING SERVICES - Add bags/seats to EXISTING orders
  // ============================================================================

  /**
   * Get Available Services for an Existing Order
   *
   * Retrieves baggage, seats, and other services that can be added
   * to an order AFTER it has been created.
   *
   * @param orderId - The Duffel order ID
   * @returns Available services with pricing
   */
  async getOrderAvailableServices(orderId: string): Promise<{
    success: boolean;
    data: {
      baggage: any[];
      seats: any[];
      other: any[];
    };
    meta?: any;
    error?: string;
  }> {
    if (!this.isInitialized) {
      return {
        success: false,
        data: { baggage: [], seats: [], other: [] },
        error: 'Duffel API not initialized',
      };
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
    if (!token) {
      return {
        success: false,
        data: { baggage: [], seats: [], other: [] },
        error: 'DUFFEL_ACCESS_TOKEN not configured',
      };
    }

    try {
      console.log('🎒 ========================================');
      console.log(`🎒 FETCHING POST-BOOKING SERVICES`);
      console.log(`🎒 Order ID: ${orderId}`);

      const response = await axios.get(
        `https://api.duffel.com/air/orders/${orderId}/available_services`,
        {
          headers: {
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      const services = response.data?.data || [];
      console.log(`✅ Found ${services.length} available post-booking services`);

      // Categorize services
      const baggage: any[] = [];
      const seats: any[] = [];
      const other: any[] = [];

      for (const service of services) {
        const baseService = {
          id: service.id,
          type: service.type,
          totalAmount: service.total_amount,
          totalCurrency: service.total_currency,
          segmentIds: service.segment_ids || [],
          passengerIds: service.passenger_ids || [],
          metadata: service.metadata || {},
        };

        if (service.type === 'baggage') {
          baggage.push({
            ...baseService,
            name: service.metadata?.title || `Checked Bag (${service.metadata?.maximum_weight_kg || 23}kg)`,
            weight: {
              value: service.metadata?.maximum_weight_kg || 23,
              unit: 'kg',
            },
            dimensions: service.metadata?.maximum_length_cm ? {
              length: service.metadata.maximum_length_cm,
              width: service.metadata.maximum_width_cm,
              height: service.metadata.maximum_height_cm,
            } : undefined,
            maxQuantity: service.maximum_quantity || 5,
          });
        } else if (service.type === 'seat') {
          seats.push({
            ...baseService,
            designator: service.metadata?.designator,
            disclosures: service.metadata?.disclosures || [],
          });
        } else {
          other.push(baseService);
        }
      }

      console.log(`   🧳 Baggage options: ${baggage.length}`);
      console.log(`   💺 Seat options: ${seats.length}`);
      console.log(`   📦 Other services: ${other.length}`);
      console.log('🎒 ========================================');

      return {
        success: true,
        data: { baggage, seats, other },
        meta: {
          orderId,
          totalServices: services.length,
          currency: services[0]?.total_currency || 'USD',
        },
      };
    } catch (error: any) {
      console.error('❌ Error fetching post-booking services:', error.message);

      if (axios.isAxiosError(error)) {
        console.error('   HTTP Status:', error.response?.status);
        console.error('   Response:', error.response?.data);
      }

      return {
        success: false,
        data: { baggage: [], seats: [], other: [] },
        error: error.message || 'Failed to fetch post-booking services',
      };
    }
  }

  /**
   * Add Services to an Existing Order (Post-Booking)
   *
   * Allows adding bags, seats, or other services to an order
   * that has already been created.
   *
   * @param orderId - The Duffel order ID
   * @param services - Array of services to add { id, quantity }
   * @param paymentAmount - Total payment amount
   * @param paymentCurrency - Payment currency
   * @returns Order with added services
   */
  async addServicesToOrder(
    orderId: string,
    services: Array<{ id: string; quantity: number }>,
    paymentAmount: string,
    paymentCurrency: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    // SAFETY GUARD
    if (process.env.DUFFEL_ENABLE_ORDERS !== 'true') {
      return {
        success: false,
        error: 'ORDER_CREATION_DISABLED: Adding services is disabled. Set DUFFEL_ENABLE_ORDERS=true',
      };
    }

    if (!this.isInitialized) {
      return { success: false, error: 'Duffel API not initialized' };
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
    if (!token) {
      return { success: false, error: 'DUFFEL_ACCESS_TOKEN not configured' };
    }

    try {
      console.log('➕ ========================================');
      console.log(`➕ ADDING SERVICES TO ORDER`);
      console.log(`➕ Order ID: ${orderId}`);
      console.log(`➕ Services: ${services.length}`);
      console.log(`➕ Payment: ${paymentCurrency} ${paymentAmount}`);

      const response = await axios.post(
        `https://api.duffel.com/air/orders/${orderId}/services`,
        {
          data: {
            payment: {
              type: 'balance',
              currency: paymentCurrency,
              amount: paymentAmount,
            },
            add_services: services.map(s => ({
              id: s.id,
              quantity: s.quantity,
            })),
          },
        },
        {
          headers: {
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 60000,
        }
      );

      console.log('✅ Services added successfully!');
      console.log(`   Order ID: ${response.data?.data?.id || orderId}`);
      console.log('➕ ========================================');

      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error: any) {
      console.error('❌ Error adding services to order:', error.message);

      if (axios.isAxiosError(error)) {
        console.error('   HTTP Status:', error.response?.status);
        console.error('   Response:', error.response?.data);

        // Parse specific errors
        const duffelErrors = error.response?.data?.errors || [];
        if (duffelErrors.length > 0) {
          const firstError = duffelErrors[0];
          return {
            success: false,
            error: `DUFFEL_ERROR: ${firstError.code || 'unknown'} - ${firstError.message || firstError.title || 'Unknown error'}`,
          };
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to add services',
      };
    }
  }

  // ============================================================================
  // LOYALTY PROGRAMME ACCOUNTS - Frequent Flyer Integration
  // ============================================================================

  /**
   * Update Offer Passenger with Loyalty Programme
   *
   * Adds frequent flyer information to a passenger in an offer.
   * This can unlock discounted fares and additional benefits.
   *
   * IMPORTANT: After updating, re-fetch the offer to see price changes.
   *
   * @param offerId - The Duffel offer ID
   * @param passengerId - The passenger ID within the offer
   * @param loyaltyAccounts - Array of loyalty programme accounts
   * @returns Updated passenger data
   */
  async updateOfferPassengerLoyalty(
    offerId: string,
    passengerId: string,
    loyaltyAccounts: Array<{
      airline_iata_code: string;
      account_number: string;
    }>
  ): Promise<{
    success: boolean;
    data?: any;
    priceChanged?: boolean;
    error?: string;
  }> {
    if (!this.isInitialized) {
      return { success: false, error: 'Duffel API not initialized' };
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
    if (!token) {
      return { success: false, error: 'DUFFEL_ACCESS_TOKEN not configured' };
    }

    try {
      console.log('🎖️  ========================================');
      console.log(`🎖️  UPDATING LOYALTY PROGRAMME`);
      console.log(`🎖️  Offer ID: ${offerId}`);
      console.log(`🎖️  Passenger ID: ${passengerId}`);
      console.log(`🎖️  Loyalty Accounts: ${loyaltyAccounts.length}`);

      // Get current offer price for comparison
      const beforeOffer = await axios.get(
        `https://api.duffel.com/air/offers/${offerId}`,
        {
          headers: {
            'Accept': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const priceBefore = parseFloat(beforeOffer.data?.data?.total_amount || '0');

      // Update passenger with loyalty accounts
      const response = await axios.patch(
        `https://api.duffel.com/air/offers/${offerId}/passengers/${passengerId}`,
        {
          data: {
            loyalty_programme_accounts: loyaltyAccounts,
          },
        },
        {
          headers: {
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      // Get updated offer to check for price changes
      const afterOffer = await axios.get(
        `https://api.duffel.com/air/offers/${offerId}`,
        {
          headers: {
            'Accept': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const priceAfter = parseFloat(afterOffer.data?.data?.total_amount || '0');
      const priceChanged = Math.abs(priceAfter - priceBefore) > 0.01;

      console.log('✅ Loyalty programme updated!');
      if (priceChanged) {
        const discount = priceBefore - priceAfter;
        console.log(`   💰 DISCOUNT APPLIED: ${discount > 0 ? '-' : '+'}$${Math.abs(discount).toFixed(2)}`);
        console.log(`   📊 Price: $${priceBefore.toFixed(2)} → $${priceAfter.toFixed(2)}`);
      } else {
        console.log(`   ℹ️  No price change (loyalty points will be accrued)`);
      }
      console.log('🎖️  ========================================');

      return {
        success: true,
        data: {
          passenger: response.data?.data,
          updatedOffer: afterOffer.data?.data,
          priceBefore,
          priceAfter,
          discount: priceBefore - priceAfter,
        },
        priceChanged,
      };
    } catch (error: any) {
      console.error('❌ Error updating loyalty programme:', error.message);

      if (axios.isAxiosError(error)) {
        console.error('   HTTP Status:', error.response?.status);
        console.error('   Response:', error.response?.data);
      }

      return {
        success: false,
        error: error.message || 'Failed to update loyalty programme',
      };
    }
  }

  /**
   * Get Supported Loyalty Programmes for an Offer
   *
   * Returns which airlines support loyalty programmes for this offer.
   *
   * @param offerId - The Duffel offer ID
   * @returns List of supported airline loyalty programmes
   */
  async getSupportedLoyaltyProgrammes(offerId: string): Promise<{
    success: boolean;
    data: string[]; // Array of airline IATA codes
    error?: string;
  }> {
    if (!this.isInitialized) {
      return { success: false, data: [], error: 'Duffel API not initialized' };
    }

    const token = process.env.DUFFEL_ACCESS_TOKEN?.trim();
    if (!token) {
      return { success: false, data: [], error: 'DUFFEL_ACCESS_TOKEN not configured' };
    }

    try {
      const response = await axios.get(
        `https://api.duffel.com/air/offers/${offerId}`,
        {
          headers: {
            'Accept': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const offer = response.data?.data;
      const supportedProgrammes = offer?.supported_loyalty_programmes || [];

      return {
        success: true,
        data: supportedProgrammes,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to get supported loyalty programmes',
      };
    }
  }

  // ============================================================================
  // CO2 EMISSIONS - Environmental Impact Data
  // ============================================================================

  /**
   * Extract CO2 Emissions from Offer
   *
   * Duffel provides carbon footprint data for flights.
   * This method extracts and formats it for display.
   *
   * @param offer - Duffel offer object (raw or converted)
   * @returns CO2 emissions data
   */
  extractCO2Emissions(offer: any): {
    available: boolean;
    totalKg?: number;
    perPassenger?: number;
    comparison?: string;
    carbonClass?: 'low' | 'medium' | 'high';
  } {
    // Try multiple locations where emissions might be stored
    const totalEmissions =
      offer.total_emissions_kg ||
      offer.duffelMetadata?.total_emissions_kg ||
      offer._raw?.total_emissions_kg;

    if (!totalEmissions) {
      return { available: false };
    }

    const totalKg = parseFloat(totalEmissions);
    const passengerCount = offer.travelerPricings?.length || offer.passengers?.length || 1;
    const perPassenger = totalKg / passengerCount;

    // Determine carbon class based on per-passenger emissions
    // Average flight produces ~100-200kg CO2 per passenger
    let carbonClass: 'low' | 'medium' | 'high' = 'medium';
    let comparison = '';

    if (perPassenger < 100) {
      carbonClass = 'low';
      comparison = 'Lower than average flight emissions';
    } else if (perPassenger < 200) {
      carbonClass = 'medium';
      comparison = 'Average flight emissions';
    } else {
      carbonClass = 'high';
      comparison = 'Higher than average flight emissions';
    }

    // Fun comparisons
    const treeDays = Math.round(totalKg / 0.06); // A tree absorbs ~22kg CO2/year = 0.06kg/day
    const carKm = Math.round(totalKg / 0.12); // Average car emits ~120g CO2/km

    return {
      available: true,
      totalKg,
      perPassenger: Math.round(perPassenger * 10) / 10,
      comparison: `${comparison}. Equivalent to driving ${carKm}km or ${treeDays} tree-days of absorption.`,
      carbonClass,
    };
  }

  // ============================================================================
  // BOOK WITH SERVICES - Create order with seats/bags in single call
  // ============================================================================

  /**
   * Create Order with Services
   *
   * Creates a booking with seats and bags included in a single API call.
   * More efficient than adding services post-booking.
   *
   * @param offerId - The Duffel offer ID
   * @param passengers - Passenger details
   * @param services - Services to book { id, quantity }
   * @param loyaltyAccounts - Optional loyalty accounts per passenger
   * @returns Created order with all services
   */
  async createOrderWithServices(
    offerId: string,
    passengers: any[],
    services: Array<{ id: string; quantity: number }>,
    loyaltyAccounts?: Map<string, Array<{ airline_iata_code: string; account_number: string }>>
  ) {
    // SAFETY GUARD
    if (process.env.DUFFEL_ENABLE_ORDERS !== 'true') {
      throw new Error('ORDER_CREATION_DISABLED: Set DUFFEL_ENABLE_ORDERS=true to enable bookings.');
    }

    if (!this.isInitialized) {
      throw new Error('Duffel API not initialized - check DUFFEL_ACCESS_TOKEN');
    }

    try {
      console.log('🎫 ========================================');
      console.log(`🎫 CREATING ORDER WITH SERVICES`);
      console.log(`🎫 Offer ID: ${offerId}`);
      console.log(`🎫 Passengers: ${passengers.length}`);
      console.log(`🎫 Services: ${services.length}`);

      // Transform passengers to Duffel format
      const duffelPassengers = this.transformPassengersToDuffel(passengers);

      // Add loyalty accounts if provided
      if (loyaltyAccounts) {
        duffelPassengers.forEach((passenger: any, index: number) => {
          const passengerLoyalty = loyaltyAccounts.get(`passenger_${index}`);
          if (passengerLoyalty && passengerLoyalty.length > 0) {
            passenger.loyalty_programme_accounts = passengerLoyalty;
          }
        });
      }

      // Build order payload
      const orderPayload: any = {
        selected_offers: [offerId],
        passengers: duffelPassengers,
        type: 'instant',
      };

      // Add services if any
      if (services.length > 0) {
        orderPayload.services = services;
        console.log(`   📦 Including ${services.length} service(s) in order`);
      }

      // Create the order
      const order = await this.client.orders.create(orderPayload);

      console.log('✅ Order with services created successfully!');
      console.log(`   Order ID: ${order.data.id}`);
      console.log(`   Booking Reference: ${order.data.booking_reference}`);
      console.log(`   Services Booked: ${(order.data as any).services?.length || 0}`);
      console.log('🎫 ========================================');

      return order;
    } catch (error: any) {
      console.error('❌ Error creating order with services:', error);
      throw new Error(`Failed to create order with services: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Extract ALL aviation intelligence from Duffel offers
   * Captures: Airlines, Aircraft, Airports, Routes, Flights, Fare Classes, Price Trends
   * Runs in background (non-blocking) to avoid slowing down search response
   */
  private async extractAllAviationIntelligence(offers: any[]): Promise<void> {
    if (!offers || offers.length === 0) return;

    try {
      const result = await extractAllAviationData(offers);

      // Log summary
      const total =
        result.airlines.created + result.airlines.updated +
        result.aircraft.created + result.aircraft.updated +
        result.airports.created + result.airports.updated +
        result.routes.created + result.routes.updated +
        result.flights.created +
        result.fareClasses.created + result.fareClasses.updated +
        result.priceTrends.created;

      if (total > 0) {
        console.log(`🧠 Aviation Intelligence: +${total} records (${result.duration}ms)`);
        console.log(`   Airlines: ${result.airlines.created}/${result.airlines.updated} | Aircraft: ${result.aircraft.created}/${result.aircraft.updated}`);
        console.log(`   Airports: ${result.airports.created}/${result.airports.updated} | Routes: ${result.routes.created}/${result.routes.updated}`);
        console.log(`   Flights: ${result.flights.created} | Fares: ${result.fareClasses.created} | Prices: ${result.priceTrends.created}`);
      }
    } catch (error: any) {
      // Non-critical - don't throw, just log
      console.warn('Aviation intelligence extraction warning:', error.message);
    }
  }
}

// Export singleton instance
export const duffelAPI = new DuffelAPI();

// Export types
export type { DuffelSearchParams };
