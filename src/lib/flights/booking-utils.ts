/**
 * 🎫 FLIGHT BOOKING UTILITIES
 * Utility functions for flight booking operations
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique booking reference
 */
export function generateBookingReference(): string {
  const prefix = 'FLY';
  const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  
  return `${prefix}${suffix}${timestamp}`;
}

/**
 * Validate passenger information
 */
export function validatePassengerInfo(passengerInfo: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!passengerInfo.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!passengerInfo.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (!passengerInfo.email?.trim()) {
    errors.push('Email address is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerInfo.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!passengerInfo.phone?.trim()) {
    errors.push('Phone number is required');
  }

  if (!passengerInfo.dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    const birthDate = new Date(passengerInfo.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 0 || age > 120) {
      errors.push('Please enter a valid date of birth');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate credit card information
 */
export function validateCreditCard(cardInfo: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!cardInfo.cardNumber?.replace(/\s/g, '')) {
    errors.push('Card number is required');
  } else {
    const cardNumber = cardInfo.cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumber)) {
      errors.push('Please enter a valid card number');
    } else if (!luhnCheck(cardNumber)) {
      errors.push('Please enter a valid card number');
    }
  }

  if (!cardInfo.expiryDate) {
    errors.push('Expiry date is required');
  } else {
    const [month, year] = cardInfo.expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    if (expiry < now) {
      errors.push('Card has expired');
    }
  }

  if (!cardInfo.cvv) {
    errors.push('CVV is required');
  } else if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
    errors.push('Please enter a valid CVV');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Get card type from card number
 */
export function getCardType(cardNumber: string): string {
  const number = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  if (/^6/.test(number)) return 'discover';
  
  return 'unknown';
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(cardNumber: string): string {
  const number = cardNumber.replace(/\s/g, '');
  const match = number.match(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/);
  
  if (!match) return cardNumber;
  
  return [match[1], match[2], match[3], match[4]]
    .filter(Boolean)
    .join(' ');
}

/**
 * Calculate total booking price including services
 */
export function calculateTotalPrice(basePrice: number, services: any): number {
  let total = basePrice;
  
  if (services.seatSelection) total += 25;
  if (services.baggage) total += 50;
  if (services.insurance) total += 35;
  // Meals are free
  
  return total;
}

/**
 * Get cancellation policy based on booking date and flight date
 */
export function getCancellationPolicy(bookingDate: Date, flightDate: Date): {
  canCancel: boolean;
  refundPercentage: number;
  cancellationFee: number;
  policy: string;
} {
  const daysDiff = Math.floor((flightDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff >= 7) {
    return {
      canCancel: true,
      refundPercentage: 80,
      cancellationFee: 50,
      policy: 'Free cancellation within 24 hours. 80% refund for cancellations 7+ days before departure.'
    };
  } else if (daysDiff >= 3) {
    return {
      canCancel: true,
      refundPercentage: 50,
      cancellationFee: 100,
      policy: '50% refund for cancellations 3-6 days before departure.'
    };
  } else if (daysDiff >= 1) {
    return {
      canCancel: true,
      refundPercentage: 25,
      cancellationFee: 150,
      policy: '25% refund for cancellations 1-2 days before departure.'
    };
  } else {
    return {
      canCancel: false,
      refundPercentage: 0,
      cancellationFee: 0,
      policy: 'No refund for same-day cancellations.'
    };
  }
}

/**
 * Generate PDF ticket using the professional ticket generator
 */
export async function generatePDFTicket(bookingData: any): Promise<Buffer | null> {
  try {
    console.log('📄 PDF ticket generation requested for:', bookingData.bookingReference);
    
    const { generateTicketFromBooking } = await import('@/lib/pdf/ticket-generator');
    const pdfBuffer = await generateTicketFromBooking(bookingData);
    
    console.log('✅ PDF ticket generated successfully');
    return pdfBuffer;
  } catch (error) {
    console.error('❌ PDF ticket generation error:', error);
    return null;
  }
}

/**
 * Generate calendar event (.ics file)
 */
export function generateCalendarEvent(flightDetails: any, bookingReference: string): string {
  const startDate = new Date(flightDetails.outbound.departure.at);
  const endDate = new Date(flightDetails.outbound.arrival.at);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fly2Any//Flight Booking//EN',
    'BEGIN:VEVENT',
    `UID:${bookingReference}@fly2any.com`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:Flight ${flightDetails.outbound.departure.iataCode} → ${flightDetails.outbound.arrival.iataCode}`,
    `DESCRIPTION:Flight booking ${bookingReference}\\nDeparture: ${flightDetails.outbound.departure.iataCode} at ${flightDetails.outbound.departure.time}\\nArrival: ${flightDetails.outbound.arrival.iataCode} at ${flightDetails.outbound.arrival.time}`,
    `LOCATION:${flightDetails.outbound.departure.iataCode} Airport`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Flight departure in 2 hours',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}