/**
 * Mock Data for E2E Booking Flow Testing
 *
 * Use this data to test the conversational commerce flow
 * without needing real API connections
 */

import { FareOption, BaggageOption, SeatOption, FlightOption } from '@/types/booking-flow';

// ============================================================================
// MOCK FLIGHT OPTIONS
// ============================================================================

export const MOCK_FLIGHTS: FlightOption[] = [
  {
    id: 'flight-1',
    offerId: 'off_emirates_001',
    airline: 'Emirates',
    airlineLogo: '/airlines/emirates.png',
    flightNumber: 'EK 202',
    departure: {
      airport: 'John F. Kennedy International',
      airportCode: 'JFK',
      time: '11:00 PM',
      terminal: '4',
    },
    arrival: {
      airport: 'Dubai International',
      airportCode: 'DXB',
      time: '7:30 PM +1',
      terminal: '3',
    },
    duration: '12h 30m',
    stops: 0,
    stopDetails: 'Non-stop',
    price: 892,
    currency: 'USD',
    cabinClass: 'Economy',
    availableSeats: 8,
    dealScore: 95,
    co2Emissions: 1250,
  },
  {
    id: 'flight-2',
    offerId: 'off_qatar_001',
    airline: 'Qatar Airways',
    airlineLogo: '/airlines/qatar.png',
    flightNumber: 'QR 701',
    departure: {
      airport: 'John F. Kennedy International',
      airportCode: 'JFK',
      time: '8:45 PM',
      terminal: '8',
    },
    arrival: {
      airport: 'Dubai International',
      airportCode: 'DXB',
      time: '9:15 PM +1',
      terminal: '1',
    },
    duration: '14h 30m',
    stops: 1,
    stopDetails: '1 stop in Doha (2h layover)',
    price: 745,
    currency: 'USD',
    cabinClass: 'Economy',
    availableSeats: 15,
    dealScore: 88,
    co2Emissions: 1180,
  },
  {
    id: 'flight-3',
    offerId: 'off_turkish_001',
    airline: 'Turkish Airlines',
    airlineLogo: '/airlines/turkish.png',
    flightNumber: 'TK 3',
    departure: {
      airport: 'John F. Kennedy International',
      airportCode: 'JFK',
      time: '1:15 PM',
      terminal: '1',
    },
    arrival: {
      airport: 'Dubai International',
      airportCode: 'DXB',
      time: '5:45 PM +1',
      terminal: '1',
    },
    duration: '16h 30m',
    stops: 1,
    stopDetails: '1 stop in Istanbul (3h layover)',
    price: 678,
    currency: 'USD',
    cabinClass: 'Economy',
    availableSeats: 22,
    dealScore: 82,
    co2Emissions: 1100,
  },
];

// ============================================================================
// MOCK FARE OPTIONS
// ============================================================================

export const MOCK_FARES: FareOption[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 745,
    currency: 'USD',
    features: [
      'Carry-on bag included',
      'Seat assignment at check-in',
      'Standard boarding',
    ],
    restrictions: [
      'No changes or cancellations',
      'No seat selection',
      'No checked baggage',
    ],
    recommended: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 892,
    currency: 'USD',
    features: [
      'Carry-on bag included',
      '1 checked bag (23kg)',
      'Advance seat selection',
      'Priority boarding',
      'Changes allowed (fee applies)',
    ],
    restrictions: [
      'Change fee: $75',
      'Cancellation fee: $150',
    ],
    recommended: true,
    popularityPercent: 68,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1150,
    currency: 'USD',
    features: [
      'Carry-on bag included',
      '2 checked bags (23kg each)',
      'Extra legroom seat',
      'Priority boarding',
      'Free changes',
      'Free cancellation up to 24h',
      'Lounge access',
      'Premium meals',
    ],
    restrictions: [],
    recommended: false,
    popularityPercent: 15,
  },
];

// ============================================================================
// MOCK BAGGAGE OPTIONS
// ============================================================================

export const MOCK_BAGGAGE: BaggageOption[] = [
  {
    id: 'no-bags',
    quantity: 0,
    weight: 'Carry-on only (10kg)',
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
    description: '1 checked bag up to 23kg',
  },
  {
    id: 'two-bags',
    quantity: 2,
    weight: '46kg total',
    price: 60,
    currency: 'USD',
    description: '2 checked bags, 23kg each',
  },
  {
    id: 'three-bags',
    quantity: 3,
    weight: '69kg total',
    price: 85,
    currency: 'USD',
    description: '3 checked bags, 23kg each',
  },
];

// ============================================================================
// MOCK SEAT MAP
// ============================================================================

export const MOCK_SEATS: SeatOption[] = [
  // Row 10
  { number: '10A', type: 'window', class: 'economy', available: true, price: 20, row: 10, column: 'A', features: ['Window view'] },
  { number: '10B', type: 'middle', class: 'economy', available: false, price: 0, row: 10, column: 'B' },
  { number: '10C', type: 'aisle', class: 'economy', available: true, price: 15, row: 10, column: 'C' },
  { number: '10D', type: 'aisle', class: 'economy', available: true, price: 15, row: 10, column: 'D' },
  { number: '10E', type: 'middle', class: 'economy', available: true, price: 0, row: 10, column: 'E' },
  { number: '10F', type: 'window', class: 'economy', available: false, price: 20, row: 10, column: 'F' },

  // Row 11
  { number: '11A', type: 'window', class: 'economy', available: true, price: 20, row: 11, column: 'A', features: ['Window view'] },
  { number: '11B', type: 'middle', class: 'economy', available: true, price: 0, row: 11, column: 'B' },
  { number: '11C', type: 'aisle', class: 'economy', available: false, price: 15, row: 11, column: 'C' },
  { number: '11D', type: 'aisle', class: 'economy', available: true, price: 15, row: 11, column: 'D' },
  { number: '11E', type: 'middle', class: 'economy', available: false, price: 0, row: 11, column: 'E' },
  { number: '11F', type: 'window', class: 'economy', available: true, price: 20, row: 11, column: 'F', features: ['Window view'] },

  // Row 12
  { number: '12A', type: 'window', class: 'economy', available: false, price: 20, row: 12, column: 'A' },
  { number: '12B', type: 'middle', class: 'economy', available: true, price: 0, row: 12, column: 'B' },
  { number: '12C', type: 'aisle', class: 'economy', available: true, price: 15, row: 12, column: 'C' },
  { number: '12D', type: 'aisle', class: 'economy', available: true, price: 15, row: 12, column: 'D' },
  { number: '12E', type: 'middle', class: 'economy', available: true, price: 0, row: 12, column: 'E' },
  { number: '12F', type: 'window', class: 'economy', available: true, price: 20, row: 12, column: 'F', features: ['Window view'] },

  // Row 13
  { number: '13A', type: 'window', class: 'economy', available: true, price: 20, row: 13, column: 'A', features: ['Window view'] },
  { number: '13B', type: 'middle', class: 'economy', available: false, price: 0, row: 13, column: 'B' },
  { number: '13C', type: 'aisle', class: 'economy', available: true, price: 15, row: 13, column: 'C' },
  { number: '13D', type: 'aisle', class: 'economy', available: false, price: 15, row: 13, column: 'D' },
  { number: '13E', type: 'middle', class: 'economy', available: true, price: 0, row: 13, column: 'E' },
  { number: '13F', type: 'window', class: 'economy', available: true, price: 20, row: 13, column: 'F', features: ['Window view'] },

  // Row 14 - Premium (extra legroom)
  { number: '14A', type: 'window', class: 'economy', available: true, price: 35, row: 14, column: 'A', features: ['Window view', 'Extra legroom'] },
  { number: '14B', type: 'middle', class: 'economy', available: true, price: 25, row: 14, column: 'B', features: ['Extra legroom'] },
  { number: '14C', type: 'aisle', class: 'economy', available: true, price: 30, row: 14, column: 'C', features: ['Extra legroom'] },
  { number: '14D', type: 'aisle', class: 'economy', available: true, price: 30, row: 14, column: 'D', features: ['Extra legroom'] },
  { number: '14E', type: 'middle', class: 'economy', available: false, price: 25, row: 14, column: 'E' },
  { number: '14F', type: 'window', class: 'economy', available: true, price: 35, row: 14, column: 'F', features: ['Window view', 'Extra legroom'] },

  // Row 15
  { number: '15A', type: 'window', class: 'economy', available: true, price: 20, row: 15, column: 'A', features: ['Window view'] },
  { number: '15B', type: 'middle', class: 'economy', available: true, price: 0, row: 15, column: 'B' },
  { number: '15C', type: 'aisle', class: 'economy', available: true, price: 15, row: 15, column: 'C' },
  { number: '15D', type: 'aisle', class: 'economy', available: true, price: 15, row: 15, column: 'D' },
  { number: '15E', type: 'middle', class: 'economy', available: true, price: 0, row: 15, column: 'E' },
  { number: '15F', type: 'window', class: 'economy', available: false, price: 20, row: 15, column: 'F' },

  // Row 16
  { number: '16A', type: 'window', class: 'economy', available: false, price: 20, row: 16, column: 'A' },
  { number: '16B', type: 'middle', class: 'economy', available: false, price: 0, row: 16, column: 'B' },
  { number: '16C', type: 'aisle', class: 'economy', available: true, price: 15, row: 16, column: 'C' },
  { number: '16D', type: 'aisle', class: 'economy', available: true, price: 15, row: 16, column: 'D' },
  { number: '16E', type: 'middle', class: 'economy', available: true, price: 0, row: 16, column: 'E' },
  { number: '16F', type: 'window', class: 'economy', available: true, price: 20, row: 16, column: 'F', features: ['Window view'] },

  // Row 17
  { number: '17A', type: 'window', class: 'economy', available: true, price: 20, row: 17, column: 'A', features: ['Window view'] },
  { number: '17B', type: 'middle', class: 'economy', available: true, price: 0, row: 17, column: 'B' },
  { number: '17C', type: 'aisle', class: 'economy', available: true, price: 15, row: 17, column: 'C' },
  { number: '17D', type: 'aisle', class: 'economy', available: true, price: 15, row: 17, column: 'D' },
  { number: '17E', type: 'middle', class: 'economy', available: true, price: 0, row: 17, column: 'E' },
  { number: '17F', type: 'window', class: 'economy', available: true, price: 20, row: 17, column: 'F', features: ['Window view'] },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get mock flight by ID
 */
export function getMockFlight(flightId: string): FlightOption | undefined {
  return MOCK_FLIGHTS.find(f => f.id === flightId);
}

/**
 * Get mock fare by ID
 */
export function getMockFare(fareId: string): FareOption | undefined {
  return MOCK_FARES.find(f => f.id === fareId);
}

/**
 * Get mock seat by number
 */
export function getMockSeat(seatNumber: string): SeatOption | undefined {
  return MOCK_SEATS.find(s => s.number === seatNumber);
}

/**
 * Get mock baggage by quantity
 */
export function getMockBaggage(quantity: number): BaggageOption | undefined {
  return MOCK_BAGGAGE.find(b => b.quantity === quantity);
}

/**
 * Calculate total booking price
 */
export function calculateTotalPrice(params: {
  farePrice: number;
  seatPrice?: number;
  baggagePrice?: number;
}): {
  baseFare: number;
  taxes: number;
  seatFees: number;
  baggageFees: number;
  total: number;
} {
  const baseFare = params.farePrice - 50; // Assume $50 in base taxes
  const taxes = 50;
  const seatFees = params.seatPrice || 0;
  const baggageFees = params.baggagePrice || 0;

  return {
    baseFare,
    taxes,
    seatFees,
    baggageFees,
    total: baseFare + taxes + seatFees + baggageFees,
  };
}
