/**
 * Booking Types and Interfaces
 * Comprehensive type definitions for the booking system
 */

export type BookingStatus = 'confirmed' | 'pending' | 'pending_ticketing' | 'ticketed' | 'cancelled' | 'completed';
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
  // Loyalty Program Integration
  frequentFlyerAirline?: string; // Airline code (e.g., 'UA', 'AA')
  frequentFlyerNumber?: string; // Loyalty program membership number
  tsaPreCheck?: string; // TSA PreCheck / Known Traveler Number
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
  paymentIntentId?: string; // Stripe payment intent ID
  clientSecret?: string; // Stripe client secret for payment confirmation
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

export interface FareUpgrade {
  fareId: string;
  fareName: string; // e.g., "Basic", "Standard", "Flex", "Business"
  basePrice: number;
  upgradePrice: number; // Additional cost over base fare
  benefits: string[]; // e.g., ["Free cancellation", "Priority boarding"]
}

export interface Bundle {
  bundleId: string;
  bundleName: string; // e.g., "Business Traveler", "Vacation Plus"
  price: number;
  description?: string;
  includes: string[]; // e.g., ["Extra baggage", "Lounge access"]
}

export interface AddOn {
  addOnId: string;
  category: string; // e.g., "baggage", "meal", "seat", "insurance"
  name: string; // e.g., "Extra Checked Bag (23kg)"
  price: number;
  quantity?: number;
  details?: string;
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
  fareUpgrade?: FareUpgrade; // Selected fare tier (Basic, Standard, Flex, etc.)
  bundle?: Bundle; // Selected smart bundle
  addOns?: AddOn[]; // All selected add-ons
  specialRequests?: string[];
  notes?: string;
  cancellationReason?: string;
  refundPolicy?: {
    refundable: boolean;
    refundDeadline?: string; // ISO datetime
    cancellationFee?: number;
  };
  // Hold Booking Information
  isHold?: boolean; // Whether this is a hold booking (pay later)
  holdDuration?: number; // Hold duration in hours
  holdPrice?: number; // Cost to hold the booking
  holdExpiresAt?: string; // ISO datetime - when the hold expires
  holdTier?: 'free' | 'short' | 'medium' | 'long'; // Hold pricing tier
  // API Source Tracking
  sourceApi?: 'Amadeus' | 'Duffel'; // Which API was used to create this booking
  amadeusBookingId?: string; // Amadeus-specific order ID
  duffelOrderId?: string; // Duffel-specific order ID
  duffelBookingReference?: string; // Duffel-specific booking reference (may differ from main reference)

  // Manual Ticketing / Consolidator Fields
  ticketingStatus?: 'pending_ticketing' | 'ticketed' | 'failed' | 'voided'; // Manual ticketing workflow status
  eticketNumbers?: string[]; // Array of e-ticket numbers (one per passenger)
  airlineRecordLocator?: string; // Airline PNR / Confirmation Code (e.g., "ABC123")
  consolidatorReference?: string; // Your consolidator's reference number
  consolidatorName?: string; // Name of consolidator used (e.g., "SkyBird", "Mondee")
  ticketedAt?: string; // ISO datetime - when ticket was issued
  ticketedBy?: string; // Admin user who ticketed it
  ticketingNotes?: string; // Internal notes about ticketing

  // Pricing for Manual Workflow
  consolidatorPrice?: number; // What you paid the consolidator (net cost)
  customerPrice?: number; // What customer paid you
  markup?: number; // Your profit margin

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

// Order Cancellation Types
export interface OrderCancellationQuote {
  orderId: string;
  bookingReference: string;
  refundable: boolean;
  refundAmount: number;
  cancellationFee: number;
  currency: string;
  refundMethod: 'original_payment' | 'voucher' | 'not_refundable';
  processingTime: string; // e.g., "7-10 business days"
  deadline?: string; // ISO datetime - last moment to cancel
  penalties?: {
    description: string;
    amount: number;
  }[];
  warnings?: string[];
}

export interface OrderCancellationConfirmation {
  success: boolean;
  orderId: string;
  bookingReference: string;
  cancellationId: string;
  status: 'cancelled' | 'pending_cancellation';
  refundAmount: number;
  refundStatus: 'processing' | 'completed' | 'not_applicable';
  refundReference?: string;
  cancellationFee: number;
  currency: string;
  cancelledAt: string; // ISO datetime
  refundProcessingTime?: string;
  message: string;
}

// Order Modification Types
export interface OrderChangeRequest {
  orderId: string;
  bookingReference: string;
  changeType: 'date' | 'route' | 'passenger' | 'class';
  requestedChanges: {
    // Date changes
    newDepartureDate?: string;
    newReturnDate?: string;
    // Route changes
    newOrigin?: string;
    newDestination?: string;
    // Passenger changes
    passengerUpdates?: Partial<Passenger>[];
    // Class upgrade
    newClass?: SeatClass;
  };
  reason?: string;
}

export interface OrderChangeOffer {
  changeRequestId: string;
  offerId: string;
  changeFee: number;
  priceDifference: number; // positive = pay more, negative = refund
  totalCost: number; // changeFee + priceDifference
  currency: string;
  newFlight?: FlightData;
  expiresAt: string; // ISO datetime
  restrictions?: string[];
  penalties?: {
    description: string;
    amount: number;
  }[];
}

export interface OrderChangeConfirmation {
  success: boolean;
  orderId: string;
  originalBookingReference: string;
  newBookingReference: string;
  changeId: string;
  status: 'confirmed' | 'pending' | 'failed';
  changeFee: number;
  priceDifference: number;
  totalCharged: number;
  currency: string;
  newFlight?: FlightData;
  changedAt: string; // ISO datetime
  paymentReference?: string;
  message: string;
}
