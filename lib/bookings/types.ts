/**
 * Booking Types and Interfaces
 * Comprehensive type definitions for the booking system
 */

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
export type PassengerType = 'adult' | 'child' | 'infant';
export type SeatClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface Passenger {
  id: string;
  type: PassengerType;
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr';
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string; // ISO country code
  passportNumber?: string;
  passportExpiry?: string; // YYYY-MM-DD
  email?: string;
  phone?: string;
  specialRequests?: string[];
  frequentFlyerNumber?: string;
}

export interface SeatSelection {
  passengerId: string;
  segmentId: string; // Flight segment identifier
  seatNumber: string; // e.g., "12A"
  seatClass: SeatClass;
  price?: number;
}

export interface FlightSegment {
  id: string;
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  carrierCode: string;
  flightNumber: string;
  aircraft?: string;
  duration: string; // ISO 8601 duration format
  class: SeatClass;
}

export interface FlightData {
  id: string;
  type: 'one-way' | 'round-trip';
  segments: FlightSegment[];
  price: {
    total: number;
    base: number;
    taxes: number;
    fees: number;
    currency: string;
  };
  validatingAirlineCodes?: string[];
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  amount: number;
  currency: string;
  cardLast4?: string;
  cardBrand?: string;
  paidAt?: string; // ISO datetime
  refundedAt?: string; // ISO datetime
  refundAmount?: number;
}

export interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g., FLY2A-ABC123
  status: BookingStatus;
  userId?: string; // Optional user ID for authenticated users
  contactInfo: ContactInfo;
  flight: FlightData;
  passengers: Passenger[];
  seats: SeatSelection[];
  payment: PaymentInfo;
  specialRequests?: string[];
  notes?: string;
  cancellationReason?: string;
  refundPolicy?: {
    refundable: boolean;
    refundDeadline?: string; // ISO datetime
    cancellationFee?: number;
  };
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  cancelledAt?: string; // ISO datetime
}

export interface BookingSearchParams {
  email?: string;
  userId?: string;
  bookingReference?: string;
  status?: BookingStatus;
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  limit?: number;
  offset?: number;
}

export interface BookingSummary {
  id: string;
  bookingReference: string;
  status: BookingStatus;
  passengerCount: number;
  departureDate: string;
  origin: string;
  destination: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export interface BookingConfirmation {
  success: boolean;
  booking: Booking;
  message: string;
  confirmationEmail?: string;
}

export interface CancellationResult {
  success: boolean;
  bookingReference: string;
  refundAmount: number;
  refundStatus: PaymentStatus;
  message: string;
  cancellationFee?: number;
}

export interface BookingUpdateRequest {
  passengers?: Partial<Passenger>[];
  seats?: SeatSelection[];
  specialRequests?: string[];
  contactInfo?: Partial<ContactInfo>;
  notes?: string;
}

export interface BookingValidationError {
  field: string;
  message: string;
  code: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: BookingValidationError[];
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}
