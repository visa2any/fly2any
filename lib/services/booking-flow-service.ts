/**
 * Booking Flow Service - Real Duffel API Integration
 *
 * Connects E2E booking widgets to actual Duffel APIs
 * Transforms Duffel responses to match booking flow types
 */

import { duffelAPI } from '@/lib/api/duffel';
import {
  FlightOption,
  FareOption,
  SeatOption,
  BaggageOption,
  BookingState,
} from '@/types/booking-flow';

// ============================================================================
// FLIGHT SEARCH
// ============================================================================

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
}

/**
 * Search flights using real Duffel API
 */
export async function searchFlights(params: FlightSearchParams): Promise<FlightOption[]> {
  try {
    console.log('🔍 Searching flights via Duffel:', params);

    const offers = await duffelAPI.searchFlights({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.passengers || 1,
      cabinClass: params.cabinClass || 'economy',
      maxResults: 10,
    });

    if (!offers?.data || offers.data.length === 0) {
      console.warn('⚠️  No flights found from Duffel');
      return [];
    }

    console.log(`✅ Found ${offers.data.length} flights from Duffel`);

    // Transform Duffel offers to FlightOption format
    return offers.data.slice(0, 6).map((offer: any) => {
      const outbound = offer.slices[0];
      const segments = outbound.segments || [];
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      // Calculate stops
      const stops = segments.length - 1;
      let stopDetails = 'Non-stop';
      if (stops === 1) {
        stopDetails = `1 stop in ${segments[0].destination.city_name}`;
      } else if (stops > 1) {
        stopDetails = `${stops} stops`;
      }

      // Calculate duration
      const duration = outbound.duration || 'N/A';

      return {
        id: offer.id,
        offerId: offer.id,
        airline: firstSegment.marketing_carrier.name,
        airlineLogo: firstSegment.marketing_carrier.logo_symbol_url || '',
        flightNumber: `${firstSegment.marketing_carrier.iata_code} ${firstSegment.marketing_carrier_flight_number}`,
        departure: {
          airport: firstSegment.origin.name,
          airportCode: firstSegment.origin.iata_code,
          time: new Date(firstSegment.departing_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          terminal: firstSegment.origin_terminal,
        },
        arrival: {
          airport: lastSegment.destination.name,
          airportCode: lastSegment.destination.iata_code,
          time: new Date(lastSegment.arriving_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          terminal: lastSegment.destination_terminal,
        },
        duration,
        stops,
        stopDetails,
        price: parseFloat(offer.total_amount),
        currency: offer.total_currency,
        cabinClass: offer.cabin_class || 'economy',
        availableSeats: offer.available_services?.length > 0 ? 15 : 8, // Estimate
        dealScore: calculateDealScore(offer),
        co2Emissions: segments.reduce((sum: number, seg: any) => sum + (seg.co2_emissions_kg || 0), 0),
      };
    });
  } catch (error) {
    console.error('❌ Error searching flights:', error);
    throw new Error('Failed to search flights. Please try again.');
  }
}

/**
 * Calculate deal score (0-100) based on various factors
 */
function calculateDealScore(offer: any): number {
  let score = 70; // Base score

  // Bonus for non-stop
  if (offer.slices[0].segments.length === 1) {
    score += 15;
  }

  // Bonus for good price (heuristic)
  const price = parseFloat(offer.total_amount);
  if (price < 700) score += 10;
  else if (price < 900) score += 5;

  // Bonus for available services (seats, bags)
  if (offer.available_services && offer.available_services.length > 5) {
    score += 5;
  }

  return Math.min(score, 100);
}

// ============================================================================
// FARE CLASSES
// ============================================================================

/**
 * Generate fare options from Duffel offer
 * Simulates branded fares (Basic/Standard/Premium)
 */
export async function getFareOptions(offerId: string): Promise<FareOption[]> {
  try {
    // In real implementation, you'd query Duffel for branded fares
    // For now, generate based on base offer
    const offer = await duffelAPI.getOffer(offerId);

    if (!offer?.data) {
      throw new Error('Offer not found');
    }

    const basePrice = parseFloat(offer.data.total_amount);
    const currency = offer.data.total_currency;

    // Generate 3 fare tiers
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: Math.round(basePrice * 0.85),
        currency,
        features: [
          'Carry-on bag included',
          'Seat assignment at check-in',
          'Standard boarding',
        ],
        restrictions: [
          'No changes allowed',
          'No seat selection',
          'No checked baggage included',
        ],
        recommended: false,
      },
      {
        id: 'standard',
        name: 'Standard',
        price: basePrice,
        currency,
        features: [
          'Carry-on bag included',
          '1 checked bag (23kg)',
          'Advance seat selection',
          'Priority boarding',
          'Changes allowed (fee applies)',
        ],
        restrictions: ['Change fee: $75', 'Cancellation fee: $150'],
        recommended: true,
        popularityPercent: 68,
      },
      {
        id: 'premium',
        name: 'Premium',
        price: Math.round(basePrice * 1.25),
        currency,
        features: [
          'Carry-on bag included',
          '2 checked bags (23kg each)',
          'Extra legroom seat included',
          'Priority boarding',
          'Free changes',
          'Refundable up to 24h before departure',
        ],
        restrictions: [],
        recommended: false,
        popularityPercent: 15,
      },
    ];
  } catch (error) {
    console.error('❌ Error getting fare options:', error);
    throw new Error('Failed to load fare options.');
  }
}

// ============================================================================
// SEAT MAP
// ============================================================================

/**
 * Get seat map from Duffel API
 */
export async function getSeatMap(offerId: string): Promise<SeatOption[]> {
  try {
    console.log('🪑 Fetching seat map from Duffel:', offerId);

    const response = await duffelAPI.getSeatMaps(offerId);

    // Handle Duffel API response format: { data: [...], meta: {...} }
    const seatMaps = Array.isArray(response) ? response : (response?.data || []);

    if (!seatMaps || seatMaps.length === 0) {
      console.warn('⚠️  No seat maps available');
      return [];
    }

    const seats: SeatOption[] = [];

    // Transform Duffel seat map to SeatOption format
    seatMaps.forEach((seatMap: any) => {
      const cabins = seatMap.cabins || [];

      cabins.forEach((cabin: any) => {
        const rows = cabin.rows || [];

        rows.forEach((row: any) => {
          const sections = row.sections || [];
          let columnIndex = 0;

          sections.forEach((section: any) => {
            const elements = section.elements || [];

            elements.forEach((element: any) => {
              if (element.type === 'seat') {
                const column = String.fromCharCode(65 + columnIndex); // A, B, C, etc.

                // Determine seat type
                let type: 'window' | 'middle' | 'aisle' = 'middle';
                if (element.designator && element.designator.match(/[A|F]/)) {
                  type = 'window';
                } else if (element.designator && element.designator.match(/[C|D]/)) {
                  type = 'aisle';
                }

                seats.push({
                  number: element.designator || `${row.number}${column}`,
                  type,
                  class: cabin.cabin_class || 'economy',
                  available: element.available_services && element.available_services.length > 0,
                  price: element.available_services?.[0]
                    ? parseFloat(element.available_services[0].total_amount)
                    : 0,
                  row: parseInt(row.number) || 0,
                  column,
                  features: getSeatFeatures(element),
                });

                columnIndex++;
              }
            });
          });
        });
      });
    });

    console.log(`✅ Loaded ${seats.length} seats from Duffel`);
    return seats;
  } catch (error) {
    console.error('❌ Error getting seat map:', error);
    // Return empty array instead of throwing - seat selection is optional
    return [];
  }
}

function getSeatFeatures(element: any): string[] {
  const features: string[] = [];

  if (element.disclosures) {
    element.disclosures.forEach((disclosure: string) => {
      if (disclosure.includes('extra legroom')) features.push('Extra legroom');
      if (disclosure.includes('window')) features.push('Window view');
      if (disclosure.includes('exit')) features.push('Exit row');
    });
  }

  return features;
}

// ============================================================================
// BAGGAGE OPTIONS
// ============================================================================

/**
 * Get available baggage options from Duffel
 */
export async function getBaggageOptions(offerId: string): Promise<BaggageOption[]> {
  try {
    const offer = await duffelAPI.getOffer(offerId);

    if (!offer?.data?.available_services) {
      console.warn('⚠️  No baggage services available');
      return getDefaultBaggageOptions();
    }

    // Filter for baggage services
    const baggageServices = offer.data.available_services.filter((service: any) =>
      service.type === 'baggage'
    );

    if (baggageServices.length === 0) {
      return getDefaultBaggageOptions();
    }

    // Transform to BaggageOption format
    const options: BaggageOption[] = [
      {
        id: 'no-bags',
        quantity: 0,
        weight: 'Carry-on only',
        price: 0,
        currency: offer.data.total_currency,
        description: 'Personal item + carry-on bag',
      },
    ];

    baggageServices.slice(0, 3).forEach((service: any, index: number) => {
      options.push({
        id: service.id,
        quantity: index + 1,
        weight: service.maximum_weight_kg ? `${service.maximum_weight_kg}kg` : '23kg',
        price: parseFloat(service.total_amount),
        currency: service.total_currency,
        description: service.metadata?.title || `${index + 1} checked bag(s)`,
      });
    });

    return options;
  } catch (error) {
    console.error('❌ Error getting baggage options:', error);
    return getDefaultBaggageOptions();
  }
}

function getDefaultBaggageOptions(): BaggageOption[] {
  return [
    {
      id: 'no-bags',
      quantity: 0,
      weight: 'Carry-on only',
      price: 0,
      currency: 'USD',
      description: 'Personal item + carry-on bag',
    },
    {
      id: 'one-bag',
      quantity: 1,
      weight: '23kg',
      price: 35,
      currency: 'USD',
      description: '1 checked bag',
    },
    {
      id: 'two-bags',
      quantity: 2,
      weight: '46kg total',
      price: 60,
      currency: 'USD',
      description: '2 checked bags',
    },
  ];
}

// ============================================================================
// BOOKING CREATION
// ============================================================================

/**
 * Create booking via Duffel API
 */
export async function createBooking(
  bookingState: BookingState,
  passengerDetails: any[],
  paymentMethod: any
): Promise<{ bookingReference: string; confirmationEmail: string }> {
  try {
    console.log('🎫 Creating booking via Duffel...');

    if (!bookingState.selectedFlight) {
      throw new Error('No flight selected');
    }

    // Create order via Duffel
    const order = await duffelAPI.createOrder(
      { id: bookingState.selectedFlight.offerId },
      passengerDetails,
      [paymentMethod]
    );

    if (!order?.data) {
      throw new Error('Failed to create order');
    }

    console.log('✅ Booking created:', order.data.booking_reference);

    return {
      bookingReference: order.data.booking_reference,
      confirmationEmail: passengerDetails[0].email || '',
    };
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    throw new Error('Failed to create booking. Please try again.');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const bookingFlowService = {
  searchFlights,
  getFareOptions,
  getSeatMap,
  getBaggageOptions,
  createBooking,
};
