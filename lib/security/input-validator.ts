/**
 * Input Validation and Sanitization
 *
 * Comprehensive validation utilities to prevent injection attacks and ensure data integrity.
 * Uses Zod for schema validation with custom sanitizers.
 */

import { z } from 'zod';

/**
 * Sanitize string input to prevent XSS
 * Removes dangerous HTML tags and JavaScript
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Validate and sanitize email address
 */
export function validateEmail(email: string): { valid: boolean; email?: string; error?: string } {
  const schema = z.string().email();
  const result = schema.safeParse(email.toLowerCase().trim());

  if (!result.success) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, email: result.data };
}

/**
 * Validate airport code (IATA 3-letter code)
 */
export function validateAirportCode(code: string): { valid: boolean; code?: string; error?: string } {
  const schema = z.string().regex(/^[A-Z]{3}$/, 'Invalid airport code format');
  const result = schema.safeParse(code.toUpperCase().trim());

  if (!result.success) {
    return { valid: false, error: 'Airport code must be 3 uppercase letters' };
  }

  return { valid: true, code: result.data };
}

/**
 * Validate date string (YYYY-MM-DD format)
 */
export function validateDateString(dateStr: string): { valid: boolean; date?: Date; error?: string } {
  const schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
  const result = schema.safeParse(dateStr.trim());

  if (!result.success) {
    return { valid: false, error: 'Invalid date format (expected YYYY-MM-DD)' };
  }

  const date = new Date(result.data);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date value' };
  }

  return { valid: true, date };
}

/**
 * Validate passenger count
 */
export function validatePassengerCount(count: number, min = 1, max = 9): { valid: boolean; count?: number; error?: string } {
  const schema = z.number().int().min(min).max(max);
  const result = schema.safeParse(count);

  if (!result.success) {
    return { valid: false, error: `Passenger count must be between ${min} and ${max}` };
  }

  return { valid: true, count: result.data };
}

/**
 * Validate price amount (positive number with max 2 decimal places)
 */
export function validatePrice(price: number): { valid: boolean; price?: number; error?: string } {
  const schema = z.number().positive().finite();
  const result = schema.safeParse(price);

  if (!result.success) {
    return { valid: false, error: 'Price must be a positive number' };
  }

  // Check decimal places
  const decimalPlaces = (result.data.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { valid: false, error: 'Price cannot have more than 2 decimal places' };
  }

  return { valid: true, price: result.data };
}

/**
 * Validate currency code (ISO 4217 - 3 letter code)
 */
export function validateCurrencyCode(code: string): { valid: boolean; code?: string; error?: string } {
  const schema = z.string().regex(/^[A-Z]{3}$/, 'Invalid currency code format');
  const result = schema.safeParse(code.toUpperCase().trim());

  if (!result.success) {
    return { valid: false, error: 'Currency code must be 3 uppercase letters' };
  }

  return { valid: true, code: result.data };
}

/**
 * Sanitize and validate phone number
 */
export function validatePhoneNumber(phone: string): { valid: boolean; phone?: string; error?: string } {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Must start with + and have 10-15 digits
  const schema = z.string().regex(/^\+\d{10,15}$/, 'Phone number must start with + and contain 10-15 digits');
  const result = schema.safeParse(cleaned);

  if (!result.success) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true, phone: result.data };
}

/**
 * Validate passenger name (no special characters, no numbers)
 */
export function validatePassengerName(name: string): { valid: boolean; name?: string; error?: string } {
  const sanitized = sanitizeString(name).trim();

  // Allow letters, spaces, hyphens, apostrophes
  const schema = z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[A-Za-z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

  const result = schema.safeParse(sanitized);

  if (!result.success) {
    return { valid: false, error: result.error.issues[0].message };
  }

  return { valid: true, name: result.data };
}

/**
 * Validate API key format (prevent injection in headers)
 */
export function validateApiKey(key: string): { valid: boolean; key?: string; error?: string } {
  // API keys should be alphanumeric with possible hyphens/underscores
  const schema = z.string()
    .min(20, 'API key too short')
    .max(200, 'API key too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Invalid API key format');

  const result = schema.safeParse(key.trim());

  if (!result.success) {
    return { valid: false, error: 'Invalid API key format' };
  }

  return { valid: true, key: result.data };
}

/**
 * Flight search parameters schema
 */
export const FlightSearchSchema = z.object({
  origin: z.string().regex(/^[A-Z]{3}(,[A-Z]{3})*$/, 'Invalid origin airport code(s)'),
  destination: z.string().regex(/^[A-Z]{3}(,[A-Z]{3})*$/, 'Invalid destination airport code(s)'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(,\d{4}-\d{2}-\d{2})*$/, 'Invalid departure date format'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(,\d{4}-\d{2}-\d{2})*$/, 'Invalid return date format').optional(),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(8).optional(),
  infants: z.number().int().min(0).max(2).optional(),
  travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).optional(),
  nonStop: z.boolean().optional(),
  currencyCode: z.string().regex(/^[A-Z]{3}$/).default('USD'),
  max: z.number().int().min(1).max(250).default(50),
});

/**
 * Hotel search parameters schema
 */
export const HotelSearchSchema = z.object({
  location: z.union([
    z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
    z.object({
      query: z.string().min(2).max(100),
    }),
  ]),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.object({
    adults: z.number().int().min(1).max(20),
    children: z.array(z.number().int().min(0).max(17)).optional(),
  }),
  radius: z.number().min(1).max(50).optional(),
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Booking creation schema
 */
export const BookingSchema = z.object({
  offerId: z.string().min(1),
  passengers: z.array(
    z.object({
      type: z.enum(['adult', 'child', 'infant']),
      title: z.enum(['Mr', 'Mrs', 'Ms', 'Miss', 'Dr']),
      firstName: z.string().min(2).max(50).regex(/^[A-Za-z\s'-]+$/),
      lastName: z.string().min(2).max(50).regex(/^[A-Za-z\s'-]+$/),
      dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      email: z.string().email().optional(),
      phone: z.string().regex(/^\+\d{10,15}$/).optional(),
    })
  ).min(1),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().regex(/^\+\d{10,15}$/),
  }),
});

/**
 * Payment intent schema
 */
export const PaymentIntentSchema = z.object({
  amount: z.number().positive().int(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  bookingId: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Validate and sanitize request body
 */
export function validateRequestBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): { valid: boolean; data?: T; errors?: string[] } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
    return { valid: false, errors };
  }

  return { valid: true, data: result.data };
}

/**
 * SQL Injection prevention - escape special characters
 * Note: Use parameterized queries instead when possible
 */
export function escapeSQLString(str: string): string {
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Prevent path traversal attacks
 */
export function sanitizeFilePath(path: string): string {
  return path
    .replace(/\.\./g, '')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .trim();
}

/**
 * Rate limit key sanitization
 */
export function sanitizeRateLimitKey(key: string): string {
  return key
    .replace(/[^a-zA-Z0-9_:-]/g, '')
    .substring(0, 200);
}
