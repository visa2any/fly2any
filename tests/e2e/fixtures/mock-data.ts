/**
 * Mock Data for Testing
 * Realistic test data for various scenarios
 */

export const mockPassengerData = {
  adult1: {
    title: 'Mr',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-15',
    email: 'john.doe@test.com',
    phone: '+15551234567',
    passport: 'AB1234567',
    nationality: 'US',
  },
  adult2: {
    title: 'Mrs',
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: '1992-05-20',
    email: 'jane.doe@test.com',
    phone: '+15551234568',
    passport: 'AB7654321',
    nationality: 'US',
  },
  child1: {
    title: 'Miss',
    firstName: 'Emily',
    lastName: 'Doe',
    dateOfBirth: '2015-08-10',
    passport: 'AB9876543',
    nationality: 'US',
  },
  infant1: {
    title: 'Master',
    firstName: 'Baby',
    lastName: 'Doe',
    dateOfBirth: '2024-03-15',
    passport: 'AB1111111',
    nationality: 'US',
  },
};

export const mockPaymentData = {
  validCard: {
    cardNumber: '4242424242424242', // Stripe test card
    expiry: '12/25',
    cvc: '123',
    nameOnCard: 'John Doe',
    billingAddress: '123 Test Street',
    billingCity: 'New York',
    billingPostal: '10001',
    billingCountry: 'US',
  },
  declinedCard: {
    cardNumber: '4000000000000002', // Stripe test declined card
    expiry: '12/25',
    cvc: '123',
    nameOnCard: 'Declined Card',
    billingAddress: '123 Test Street',
    billingCity: 'New York',
    billingPostal: '10001',
    billingCountry: 'US',
  },
  invalidCard: {
    cardNumber: '1234567890123456',
    expiry: '13/20', // Invalid expiry
    cvc: '99',
    nameOnCard: 'Invalid Card',
    billingAddress: '123 Test Street',
    billingCity: 'New York',
    billingPostal: '10001',
    billingCountry: 'US',
  },
};

export const mockFlightResults = [
  {
    id: 'flight-001',
    airline: 'American Airlines',
    flightNumber: 'AA123',
    price: 299.99,
    currency: 'USD',
    duration: '5h 30m',
    stops: 0,
    departure: {
      airport: 'JFK',
      time: '08:00',
      date: '2025-12-15',
    },
    arrival: {
      airport: 'LAX',
      time: '10:30',
      date: '2025-12-15',
    },
    cabinClass: 'economy',
    baggage: {
      carry: '1 piece',
      checked: '1 piece (23kg)',
    },
  },
  {
    id: 'flight-002',
    airline: 'Delta',
    flightNumber: 'DL456',
    price: 349.99,
    currency: 'USD',
    duration: '6h 15m',
    stops: 1,
    departure: {
      airport: 'JFK',
      time: '10:00',
      date: '2025-12-15',
    },
    arrival: {
      airport: 'LAX',
      time: '13:15',
      date: '2025-12-15',
    },
    cabinClass: 'economy',
    baggage: {
      carry: '1 piece',
      checked: '2 pieces (23kg each)',
    },
  },
  {
    id: 'flight-003',
    airline: 'United',
    flightNumber: 'UA789',
    price: 899.99,
    currency: 'USD',
    duration: '5h 45m',
    stops: 0,
    departure: {
      airport: 'JFK',
      time: '14:00',
      date: '2025-12-15',
    },
    arrival: {
      airport: 'LAX',
      time: '16:45',
      date: '2025-12-15',
    },
    cabinClass: 'business',
    baggage: {
      carry: '2 pieces',
      checked: '3 pieces (32kg each)',
    },
  },
];

export const mockSeatMap = {
  economy: [
    // Row 10
    { row: 10, seat: 'A', available: true, price: 0, type: 'window' },
    { row: 10, seat: 'B', available: true, price: 0, type: 'middle' },
    { row: 10, seat: 'C', available: true, price: 0, type: 'aisle' },
    { row: 10, seat: 'D', available: false, price: 0, type: 'aisle' },
    { row: 10, seat: 'E', available: true, price: 0, type: 'middle' },
    { row: 10, seat: 'F', available: true, price: 0, type: 'window' },
    // Row 11 - Exit row
    { row: 11, seat: 'A', available: true, price: 29, type: 'window', exitRow: true },
    { row: 11, seat: 'B', available: true, price: 29, type: 'middle', exitRow: true },
    { row: 11, seat: 'C', available: true, price: 29, type: 'aisle', exitRow: true },
    { row: 11, seat: 'D', available: true, price: 29, type: 'aisle', exitRow: true },
    { row: 11, seat: 'E', available: true, price: 29, type: 'middle', exitRow: true },
    { row: 11, seat: 'F', available: false, price: 29, type: 'window', exitRow: true },
    // Row 12
    { row: 12, seat: 'A', available: true, price: 15, type: 'window' },
    { row: 12, seat: 'B', available: true, price: 15, type: 'middle' },
    { row: 12, seat: 'C', available: false, price: 15, type: 'aisle' },
    { row: 12, seat: 'D', available: true, price: 15, type: 'aisle' },
    { row: 12, seat: 'E', available: true, price: 15, type: 'middle' },
    { row: 12, seat: 'F', available: true, price: 15, type: 'window' },
  ],
  business: [
    // Row 1
    { row: 1, seat: 'A', available: true, price: 0, type: 'window' },
    { row: 1, seat: 'C', available: true, price: 0, type: 'aisle' },
    { row: 1, seat: 'D', available: false, price: 0, type: 'aisle' },
    { row: 1, seat: 'F', available: true, price: 0, type: 'window' },
    // Row 2
    { row: 2, seat: 'A', available: true, price: 0, type: 'window' },
    { row: 2, seat: 'C', available: true, price: 0, type: 'aisle' },
    { row: 2, seat: 'D', available: true, price: 0, type: 'aisle' },
    { row: 2, seat: 'F', available: false, price: 0, type: 'window' },
  ],
};

export const mockBookingResponse = {
  success: true,
  bookingId: 'booking-test-12345',
  reference: 'FLY2ANYTEST123',
  status: 'confirmed',
  totalPrice: 299.99,
  currency: 'USD',
  passengers: [mockPassengerData.adult1],
  flights: [mockFlightResults[0]],
  paymentStatus: 'succeeded',
  confirmationEmailSent: true,
  createdAt: new Date().toISOString(),
};

export const mockErrorResponses = {
  invalidSearch: {
    error: 'Invalid search parameters',
    message: 'Origin and destination cannot be the same',
    code: 'INVALID_SEARCH',
  },
  noFlights: {
    error: 'No flights found',
    message: 'No flights available for the selected route and dates',
    code: 'NO_RESULTS',
  },
  paymentFailed: {
    error: 'Payment failed',
    message: 'Your card was declined. Please try a different payment method.',
    code: 'PAYMENT_DECLINED',
  },
  sessionExpired: {
    error: 'Session expired',
    message: 'Your booking session has expired. Please start a new search.',
    code: 'SESSION_EXPIRED',
  },
  serverError: {
    error: 'Internal server error',
    message: 'Something went wrong. Please try again later.',
    code: 'SERVER_ERROR',
  },
};

export const mockAPIResponses = {
  flightSearch: {
    status: 200,
    data: {
      flights: mockFlightResults,
      totalResults: mockFlightResults.length,
      searchId: 'search-' + Date.now(),
    },
  },
  seatMap: {
    status: 200,
    data: {
      economy: mockSeatMap.economy,
      business: mockSeatMap.business,
    },
  },
  createBooking: {
    status: 200,
    data: mockBookingResponse,
  },
  paymentIntent: {
    status: 200,
    data: {
      clientSecret: 'pi_test_secret_' + Date.now(),
      paymentIntentId: 'pi_test_' + Date.now(),
    },
  },
  confirmPayment: {
    status: 200,
    data: {
      success: true,
      paymentStatus: 'succeeded',
      bookingReference: 'FLY2ANYTEST123',
    },
  },
};

/**
 * Generate random booking reference
 */
export function generateBookingReference(): string {
  return 'FLY2ANY' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

/**
 * Generate future date for testing
 */
export function generateFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}
