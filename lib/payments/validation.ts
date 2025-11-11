/**
 * Payment Validation Module
 *
 * Provides validation functions for payment processing:
 * - Amount validation against booking totals
 * - Duplicate payment detection
 * - Payment method eligibility checks
 * - Currency validation
 */

import { Booking } from '@/lib/bookings/types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: any;
}

/**
 * Validate payment amount matches booking total
 *
 * Ensures the payment amount matches the booking total within a small tolerance
 * to account for floating point precision issues.
 *
 * @param amount - Payment amount to validate
 * @param booking - Booking to validate against
 * @returns Validation result with error message if invalid
 */
export function validatePaymentAmount(
  amount: number,
  booking: Booking
): ValidationResult {
  const expectedAmount = booking.payment.amount;
  const tolerance = 0.01; // 1 cent tolerance for floating point precision

  // Check if amounts match within tolerance
  const difference = Math.abs(amount - expectedAmount);

  if (difference > tolerance) {
    return {
      valid: false,
      error: `Payment amount mismatch. Expected ${expectedAmount.toFixed(2)} ${booking.payment.currency}, got ${amount.toFixed(2)}`,
      details: {
        providedAmount: amount,
        expectedAmount,
        difference,
        currency: booking.payment.currency,
      },
    };
  }

  return {
    valid: true,
  };
}

/**
 * Check for duplicate payments
 *
 * Prevents double-charging by checking if payment already exists
 * for the booking.
 *
 * @param booking - Booking to check
 * @returns Validation result indicating if payment already exists
 */
export async function checkDuplicatePayment(
  booking: Booking
): Promise<ValidationResult> {
  // Check if booking is already paid
  if (booking.payment.status === 'paid') {
    return {
      valid: false,
      error: 'Payment already completed for this booking',
      details: {
        bookingReference: booking.bookingReference,
        paymentStatus: booking.payment.status,
        paidAt: booking.payment.paidAt,
        transactionId: booking.payment.transactionId,
      },
    };
  }

  // Check if payment intent already exists and is processing
  if (booking.payment.paymentIntentId && booking.payment.status === 'pending') {
    // Allow retry if payment is pending but warn about it
    console.warn(
      `WARNING: Payment intent already exists for booking ${booking.bookingReference}: ${booking.payment.paymentIntentId}`
    );

    // This is not an error - allow creating a new payment intent
    // The old one may have expired or failed
  }

  return {
    valid: true,
  };
}

/**
 * Verify payment method eligibility
 *
 * Checks if the payment method is allowed for the booking's
 * amount and destination.
 *
 * @param paymentMethod - Payment method to validate
 * @param booking - Booking context
 * @returns Validation result
 */
export function verifyPaymentMethodEligibility(
  paymentMethod: string,
  booking: Booking
): ValidationResult {
  // List of supported payment methods
  const supportedMethods = [
    'credit_card',
    'debit_card',
    'paypal',
    'bank_transfer',
  ];

  if (!supportedMethods.includes(paymentMethod)) {
    return {
      valid: false,
      error: `Payment method '${paymentMethod}' is not supported`,
      details: {
        providedMethod: paymentMethod,
        supportedMethods,
      },
    };
  }

  // Check minimum amount for certain payment methods
  const minAmounts: Record<string, number> = {
    bank_transfer: 100, // Bank transfers typically have minimum amounts
  };

  const minAmount = minAmounts[paymentMethod];
  if (minAmount && booking.payment.amount < minAmount) {
    return {
      valid: false,
      error: `Payment method '${paymentMethod}' requires a minimum amount of ${minAmount} ${booking.payment.currency}`,
      details: {
        paymentMethod,
        minimumAmount: minAmount,
        bookingAmount: booking.payment.amount,
        currency: booking.payment.currency,
      },
    };
  }

  // Check if payment method is restricted for certain routes/destinations
  // (e.g., some countries may not support certain payment methods)
  const destinationIATA =
    booking.flight.segments[booking.flight.segments.length - 1].arrival.iataCode;

  // Example: PayPal may not be available for certain countries
  // This is a placeholder - you would implement actual restrictions based on your business rules
  const restrictedMethodsByCountry: Record<string, string[]> = {
    // Example: 'CN': ['paypal'],  // PayPal restricted in China
  };

  const countryCode = destinationIATA.substring(0, 2); // Rough approximation
  const restrictedMethods = restrictedMethodsByCountry[countryCode] || [];

  if (restrictedMethods.includes(paymentMethod)) {
    return {
      valid: false,
      error: `Payment method '${paymentMethod}' is not available for flights to ${destinationIATA}`,
      details: {
        paymentMethod,
        destination: destinationIATA,
        restrictedMethods,
      },
    };
  }

  return {
    valid: true,
  };
}

/**
 * Validate currency code
 *
 * Ensures the currency is supported and matches expected format.
 *
 * @param currency - Currency code to validate (e.g., "USD", "EUR")
 * @returns Validation result
 */
export function validateCurrency(currency: string): ValidationResult {
  // List of supported currencies (ISO 4217 codes)
  const supportedCurrencies = [
    'USD', // US Dollar
    'EUR', // Euro
    'GBP', // British Pound
    'CAD', // Canadian Dollar
    'AUD', // Australian Dollar
    'JPY', // Japanese Yen
    'CNY', // Chinese Yuan
    'INR', // Indian Rupee
    'BRL', // Brazilian Real
    'MXN', // Mexican Peso
    'CHF', // Swiss Franc
    'SEK', // Swedish Krona
    'NZD', // New Zealand Dollar
    'SGD', // Singapore Dollar
    'HKD', // Hong Kong Dollar
  ];

  // Normalize to uppercase
  const normalizedCurrency = currency.toUpperCase();

  // Check format (must be 3 letters)
  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
    return {
      valid: false,
      error: `Invalid currency format. Must be a 3-letter ISO 4217 code.`,
      details: {
        providedCurrency: currency,
      },
    };
  }

  // Check if supported
  if (!supportedCurrencies.includes(normalizedCurrency)) {
    return {
      valid: false,
      error: `Currency '${normalizedCurrency}' is not currently supported`,
      details: {
        providedCurrency: normalizedCurrency,
        supportedCurrencies,
      },
    };
  }

  return {
    valid: true,
  };
}

/**
 * Validate booking is eligible for payment
 *
 * Comprehensive validation that checks:
 * - Booking exists and is not cancelled
 * - Booking has not already been paid
 * - Flight has not already departed
 * - Booking is not expired (for hold bookings)
 *
 * @param booking - Booking to validate
 * @returns Validation result
 */
export function validateBookingEligibility(
  booking: Booking
): ValidationResult {
  // Check if booking is cancelled
  if (booking.status === 'cancelled') {
    return {
      valid: false,
      error: 'Cannot process payment for cancelled booking',
      details: {
        bookingReference: booking.bookingReference,
        status: booking.status,
        cancelledAt: booking.cancelledAt,
      },
    };
  }

  // Check if already paid
  if (booking.payment.status === 'paid') {
    return {
      valid: false,
      error: 'Booking has already been paid',
      details: {
        bookingReference: booking.bookingReference,
        paidAt: booking.payment.paidAt,
        transactionId: booking.payment.transactionId,
      },
    };
  }

  // Check if flight has already departed
  const firstSegment = booking.flight.segments[0];
  const departureTime = new Date(firstSegment.departure.at);
  const now = new Date();

  if (now > departureTime) {
    return {
      valid: false,
      error: 'Cannot process payment for flights that have already departed',
      details: {
        bookingReference: booking.bookingReference,
        departureTime: departureTime.toISOString(),
        currentTime: now.toISOString(),
      },
    };
  }

  // Check if hold booking has expired
  if (booking.isHold && booking.holdExpiresAt) {
    const holdExpiryTime = new Date(booking.holdExpiresAt);

    if (now > holdExpiryTime) {
      return {
        valid: false,
        error: 'Hold booking has expired',
        details: {
          bookingReference: booking.bookingReference,
          holdExpiresAt: booking.holdExpiresAt,
          currentTime: now.toISOString(),
        },
      };
    }
  }

  return {
    valid: true,
  };
}

/**
 * Validate all payment requirements
 *
 * Runs all validation checks in sequence and returns the first error found,
 * or success if all validations pass.
 *
 * @param amount - Payment amount
 * @param currency - Currency code
 * @param paymentMethod - Payment method
 * @param booking - Booking to validate against
 * @returns Validation result
 */
export async function validatePaymentRequest(
  amount: number,
  currency: string,
  paymentMethod: string,
  booking: Booking
): Promise<ValidationResult> {
  // Validate booking eligibility
  const bookingCheck = validateBookingEligibility(booking);
  if (!bookingCheck.valid) {
    return bookingCheck;
  }

  // Validate currency
  const currencyCheck = validateCurrency(currency);
  if (!currencyCheck.valid) {
    return currencyCheck;
  }

  // Validate amount
  const amountCheck = validatePaymentAmount(amount, booking);
  if (!amountCheck.valid) {
    return amountCheck;
  }

  // Check for duplicates
  const duplicateCheck = await checkDuplicatePayment(booking);
  if (!duplicateCheck.valid) {
    return duplicateCheck;
  }

  // Validate payment method
  const methodCheck = verifyPaymentMethodEligibility(paymentMethod, booking);
  if (!methodCheck.valid) {
    return methodCheck;
  }

  return {
    valid: true,
  };
}
