/**
 * Booking Validation Schemas
 * Comprehensive Zod schemas for request validation
 */

import { z } from 'zod';

// Base schemas
const PassengerTypeSchema = z.enum(['adult', 'child', 'infant']);
const BookingStatusSchema = z.enum(['confirmed', 'pending', 'cancelled', 'completed']);
const PaymentStatusSchema = z.enum(['pending', 'paid', 'refunded', 'failed']);
const PaymentMethodSchema = z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer']);
const SeatClassSchema = z.enum(['economy', 'premium_economy', 'business', 'first']);
const TitleSchema = z.enum(['Mr', 'Ms', 'Mrs', 'Dr']);

// Date validation helpers
const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Expected YYYY-MM-DD');
const isoDateTimeSchema = z.string().datetime({ message: 'Invalid ISO datetime format' });

// Passenger schema
export const PassengerSchema = z.object({
  id: z.string().optional(),
  type: PassengerTypeSchema,
  title: TitleSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: dateStringSchema,
  nationality: z.string().length(2, 'Nationality must be a 2-letter ISO country code'),
  passportNumber: z.string().optional(),
  passportExpiry: dateStringSchema.optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  specialRequests: z.array(z.string()).optional(),
  frequentFlyerNumber: z.string().optional(),
}).refine(
  (data) => {
    // If passport number is provided, expiry should also be provided
    if (data.passportNumber && !data.passportExpiry) {
      return false;
    }
    return true;
  },
  {
    message: 'Passport expiry date is required when passport number is provided',
    path: ['passportExpiry'],
  }
);

// Seat selection schema
export const SeatSelectionSchema = z.object({
  passengerId: z.string().min(1, 'Passenger ID is required'),
  segmentId: z.string().min(1, 'Segment ID is required'),
  seatNumber: z.string().regex(/^\d{1,2}[A-K]$/, 'Invalid seat number format (e.g., 12A)'),
  seatClass: SeatClassSchema,
  price: z.number().min(0).optional(),
});

// Flight segment schema
export const FlightSegmentSchema = z.object({
  id: z.string().min(1, 'Segment ID is required'),
  departure: z.object({
    iataCode: z.string().length(3, 'IATA code must be 3 characters'),
    terminal: z.string().optional(),
    at: isoDateTimeSchema,
  }),
  arrival: z.object({
    iataCode: z.string().length(3, 'IATA code must be 3 characters'),
    terminal: z.string().optional(),
    at: isoDateTimeSchema,
  }),
  carrierCode: z.string().length(2, 'Carrier code must be 2 characters'),
  flightNumber: z.string().min(1, 'Flight number is required'),
  aircraft: z.string().optional(),
  duration: z.string().regex(/^PT\d+H\d+M$/, 'Invalid ISO 8601 duration format'),
  class: SeatClassSchema,
});

// Flight data schema
export const FlightDataSchema = z.object({
  id: z.string().min(1, 'Flight ID is required'),
  type: z.enum(['one-way', 'round-trip']),
  segments: z.array(FlightSegmentSchema).min(1, 'At least one flight segment is required'),
  price: z.object({
    total: z.number().positive('Total price must be positive'),
    base: z.number().min(0),
    taxes: z.number().min(0),
    fees: z.number().min(0),
    currency: z.string().length(3, 'Currency must be a 3-letter ISO code'),
  }),
  validatingAirlineCodes: z.array(z.string()).optional(),
});

// Payment info schema
export const PaymentInfoSchema = z.object({
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  transactionId: z.string().optional(),
  amount: z.number().positive('Payment amount must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code'),
  cardLast4: z.string().length(4, 'Card last 4 digits must be exactly 4 characters').optional(),
  cardBrand: z.string().optional(),
  paidAt: isoDateTimeSchema.optional(),
  refundedAt: isoDateTimeSchema.optional(),
  refundAmount: z.number().min(0).optional(),
});

// Contact info schema
export const ContactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternatePhone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    relationship: z.string().min(1, 'Relationship is required'),
  }).optional(),
});

// Create booking request schema
export const CreateBookingSchema = z.object({
  userId: z.string().optional(),
  contactInfo: ContactInfoSchema,
  flight: FlightDataSchema,
  passengers: z.array(PassengerSchema).min(1, 'At least one passenger is required').max(9, 'Maximum 9 passengers allowed'),
  seats: z.array(SeatSelectionSchema).optional(),
  payment: PaymentInfoSchema,
  specialRequests: z.array(z.string()).optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
}).refine(
  (data) => {
    // Validate that payment amount matches flight total
    if (Math.abs(data.payment.amount - data.flight.price.total) > 0.01) {
      return false;
    }
    return true;
  },
  {
    message: 'Payment amount must match flight total price',
    path: ['payment', 'amount'],
  }
).refine(
  (data) => {
    // Validate that payment currency matches flight currency
    if (data.payment.currency !== data.flight.price.currency) {
      return false;
    }
    return true;
  },
  {
    message: 'Payment currency must match flight currency',
    path: ['payment', 'currency'],
  }
);

// Update booking request schema
export const UpdateBookingSchema = z.object({
  passengers: z.array(PassengerSchema.partial()).optional(),
  seats: z.array(SeatSelectionSchema).optional(),
  specialRequests: z.array(z.string()).optional(),
  contactInfo: ContactInfoSchema.partial().optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
});

// Search bookings query schema
export const SearchBookingsSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  userId: z.string().optional(),
  bookingReference: z.string().optional(),
  status: BookingStatusSchema.optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
}).refine(
  (data) => {
    // At least one search criteria must be provided
    return data.email || data.userId || data.bookingReference || data.status || data.dateFrom;
  },
  {
    message: 'At least one search criterion must be provided (email, userId, bookingReference, status, or dateFrom)',
  }
);

// Cancellation request schema
export const CancelBookingSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500, 'Reason must not exceed 500 characters'),
  requestRefund: z.boolean().optional(),
});

// Export types inferred from schemas
export type CreateBookingRequest = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingRequest = z.infer<typeof UpdateBookingSchema>;
export type SearchBookingsQuery = z.infer<typeof SearchBookingsSchema>;
export type CancelBookingRequest = z.infer<typeof CancelBookingSchema>;
