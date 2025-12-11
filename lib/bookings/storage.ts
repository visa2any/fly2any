/**
 * PostgreSQL Booking Storage
 * Production implementation using Neon PostgreSQL
 */

import { Booking, BookingSearchParams, BookingSummary } from './types';
import { sql } from '../db/connection';

// PostgreSQL storage implementation
class BookingStorage {
  /**
   * Initialize storage (no-op for PostgreSQL - connection managed by Neon)
   */
  constructor() {
    // Connection is managed by Neon serverless
  }

  /**
   * Generate a unique booking reference
   * Format: FLY2A-XXXXXX (where X is alphanumeric)
   */
  async generateBookingReference(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar-looking chars
    let reference = 'FLY2A-';

    for (let i = 0; i < 6; i++) {
      reference += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure uniqueness by checking database
    const existing = await this.findByReferenceAsync(reference);
    if (existing) {
      return this.generateBookingReference(); // Recursively try again
    }

    return reference;
  }

  /**
   * Generate a unique booking ID
   */
  generateBookingId(): string {
    return `booking_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Create a new booking
   * @param booking - Booking data without id/timestamps
   * @param preGeneratedRef - Optional pre-generated booking reference (for payment intent matching)
   */
  async create(
    booking: Omit<Booking, 'id' | 'bookingReference' | 'createdAt' | 'updatedAt'>,
    preGeneratedRef?: string
  ): Promise<Booking> {
    if (!sql) {
      throw new Error('Database not configured');
    }

    try {
      const now = new Date().toISOString();
      const id = this.generateBookingId();
      // Use pre-generated reference if provided, otherwise generate new one
      const bookingReference = preGeneratedRef || await this.generateBookingReference();

      const newBooking: Booking = {
        ...booking,
        id,
        bookingReference,
        createdAt: now,
        updatedAt: now,
      };

      // Insert booking into database
      await sql`
        INSERT INTO bookings (
          id,
          booking_reference,
          status,
          user_id,
          contact_info,
          flight,
          passengers,
          seats,
          payment,
          special_requests,
          notes,
          cancellation_reason,
          refund_policy,
          created_at,
          updated_at,
          cancelled_at
        ) VALUES (
          ${newBooking.id},
          ${newBooking.bookingReference},
          ${newBooking.status},
          ${newBooking.userId || null},
          ${JSON.stringify(newBooking.contactInfo)},
          ${JSON.stringify(newBooking.flight)},
          ${JSON.stringify(newBooking.passengers)},
          ${JSON.stringify(newBooking.seats)},
          ${JSON.stringify(newBooking.payment)},
          ${JSON.stringify(newBooking.specialRequests || null)},
          ${newBooking.notes || null},
          ${newBooking.cancellationReason || null},
          ${JSON.stringify(newBooking.refundPolicy || null)},
          ${newBooking.createdAt},
          ${newBooking.updatedAt},
          ${newBooking.cancelledAt || null}
        )
      `;

      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  /**
   * Find booking by ID
   * Note: Excludes soft-deleted bookings by default
   */
  async findById(id: string, includeDeleted: boolean = false): Promise<Booking | null> {
    if (!sql) {
      console.warn('Database not configured');
      return null;
    }

    try {
      const result = includeDeleted
        ? await sql`SELECT * FROM bookings WHERE id = ${id}`
        : await sql`SELECT * FROM bookings WHERE id = ${id} AND deleted_at IS NULL`;

      if (result.length === 0) {
        return null;
      }

      return this.deserializeBooking(result[0]);
    } catch (error) {
      console.error('Error finding booking by ID:', error);
      throw new Error('Failed to find booking');
    }
  }

  /**
   * Find booking by reference
   * @deprecated Use findByReferenceAsync instead
   */
  findByReference(reference: string): Booking | null {
    // This method is now deprecated but kept for backward compatibility
    // It will throw an error since we can't make synchronous DB calls
    throw new Error('findByReference is deprecated. Use findByReferenceAsync instead.');
  }

  /**
   * Find booking by reference (async version)
   * Note: Excludes soft-deleted bookings by default
   */
  async findByReferenceAsync(reference: string, includeDeleted: boolean = false): Promise<Booking | null> {
    if (!sql) {
      console.warn('Database not configured');
      return null;
    }

    try {
      const result = includeDeleted
        ? await sql`SELECT * FROM bookings WHERE booking_reference = ${reference}`
        : await sql`SELECT * FROM bookings WHERE booking_reference = ${reference} AND deleted_at IS NULL`;

      if (result.length === 0) {
        return null;
      }

      return this.deserializeBooking(result[0]);
    } catch (error) {
      console.error('Error finding booking by reference:', error);
      throw new Error('Failed to find booking');
    }
  }

  /**
   * Search bookings with filters
   */
  async search(params: BookingSearchParams): Promise<Booking[]> {
    if (!sql) {
      console.warn('Database not configured');
      return [];
    }

    try {
      const conditions: string[] = [];
      const values: any[] = [];

      // Build WHERE clause dynamically
      if (params.email) {
        conditions.push(`LOWER(contact_info->>'email') = LOWER($${values.length + 1})`);
        values.push(params.email);
      }

      if (params.userId) {
        conditions.push(`user_id = $${values.length + 1}`);
        values.push(params.userId);
      }

      if (params.bookingReference) {
        conditions.push(`LOWER(booking_reference) = LOWER($${values.length + 1})`);
        values.push(params.bookingReference);
      }

      if (params.status) {
        conditions.push(`status = $${values.length + 1}`);
        values.push(params.status);
      }

      if (params.dateFrom) {
        conditions.push(`created_at >= $${values.length + 1}`);
        values.push(params.dateFrom);
      }

      if (params.dateTo) {
        conditions.push(`created_at <= $${values.length + 1}`);
        values.push(params.dateTo);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const offset = params.offset || 0;
      const limit = params.limit || 50;

      // Build and execute query using Neon's interpolation
      // Note: We can't use dynamic WHERE with Neon's tagged templates easily,
      // so we'll build the query string and use the sql function
      let query = `SELECT * FROM bookings ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      // Execute with proper parameter substitution
      const result = await this.executeSearchQuery(params);

      return result.map(row => this.deserializeBooking(row));
    } catch (error) {
      console.error('Error searching bookings:', error);
      throw new Error('Failed to search bookings');
    }
  }

  /**
   * Helper method to execute search query with dynamic parameters
   * Note: Excludes soft-deleted bookings by default
   */
  private async executeSearchQuery(params: BookingSearchParams): Promise<any[]> {
    if (!sql) {
      return [];
    }

    const offset = params.offset || 0;
    const limit = params.limit || 50;

    // Build query based on provided parameters
    if (params.email) {
      const email = params.email.toLowerCase();
      if (params.status) {
        return await sql`
          SELECT * FROM bookings
          WHERE LOWER(contact_info->>'email') = ${email}
          AND status = ${params.status}
          AND deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }
      return await sql`
        SELECT * FROM bookings
        WHERE LOWER(contact_info->>'email') = ${email}
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    if (params.userId) {
      if (params.status) {
        return await sql`
          SELECT * FROM bookings
          WHERE user_id = ${params.userId}
          AND status = ${params.status}
          AND deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }
      return await sql`
        SELECT * FROM bookings
        WHERE user_id = ${params.userId}
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    if (params.bookingReference) {
      return await sql`
        SELECT * FROM bookings
        WHERE LOWER(booking_reference) = ${params.bookingReference.toLowerCase()}
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    if (params.status) {
      if (params.dateFrom && params.dateTo) {
        return await sql`
          SELECT * FROM bookings
          WHERE status = ${params.status}
          AND created_at >= ${params.dateFrom}
          AND created_at <= ${params.dateTo}
          AND deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }
      return await sql`
        SELECT * FROM bookings
        WHERE status = ${params.status}
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    if (params.dateFrom && params.dateTo) {
      return await sql`
        SELECT * FROM bookings
        WHERE created_at >= ${params.dateFrom}
        AND created_at <= ${params.dateTo}
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // No filters - return all with pagination (excluding soft-deleted)
    return await sql`
      SELECT * FROM bookings
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  /**
   * Get booking summaries (lighter version for list views)
   */
  async getSummaries(params: BookingSearchParams): Promise<BookingSummary[]> {
    const bookings = await this.search(params);

    return bookings.map(b => ({
      id: b.id,
      bookingReference: b.bookingReference,
      status: b.status,
      passengerCount: b.passengers.length,
      departureDate: b.flight.segments[0].departure.at,
      origin: b.flight.segments[0].departure.iataCode,
      destination: b.flight.segments[b.flight.segments.length - 1].arrival.iataCode,
      totalAmount: b.payment.amount,
      currency: b.payment.currency,
      createdAt: b.createdAt,
    }));
  }

  /**
   * Update an existing booking
   */
  async update(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    if (!sql) {
      console.warn('Database not configured');
      return null;
    }

    try {
      const booking = await this.findById(id);

      if (!booking) {
        return null;
      }

      const updatedBooking: Booking = {
        ...booking,
        ...updates,
        id: booking.id, // Prevent ID change
        bookingReference: booking.bookingReference, // Prevent reference change
        createdAt: booking.createdAt, // Prevent creation date change
        updatedAt: new Date().toISOString(),
      };

      await sql`
        UPDATE bookings SET
          status = ${updatedBooking.status},
          user_id = ${updatedBooking.userId || null},
          contact_info = ${JSON.stringify(updatedBooking.contactInfo)},
          flight = ${JSON.stringify(updatedBooking.flight)},
          passengers = ${JSON.stringify(updatedBooking.passengers)},
          seats = ${JSON.stringify(updatedBooking.seats)},
          payment = ${JSON.stringify(updatedBooking.payment)},
          special_requests = ${JSON.stringify(updatedBooking.specialRequests || null)},
          notes = ${updatedBooking.notes || null},
          cancellation_reason = ${updatedBooking.cancellationReason || null},
          refund_policy = ${JSON.stringify(updatedBooking.refundPolicy || null)},
          updated_at = ${updatedBooking.updatedAt},
          cancelled_at = ${updatedBooking.cancelledAt || null}
        WHERE id = ${id}
      `;

      return updatedBooking;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  }

  /**
   * Cancel a booking (soft delete)
   */
  async cancel(id: string, reason?: string): Promise<Booking | null> {
    if (!sql) {
      console.warn('Database not configured');
      return null;
    }

    try {
      const booking = await this.findById(id);

      if (!booking) {
        return null;
      }

      const now = new Date().toISOString();

      const cancelledBooking: Booking = {
        ...booking,
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: now,
        updatedAt: now,
      };

      await sql`
        UPDATE bookings SET
          status = 'cancelled',
          cancellation_reason = ${reason || null},
          cancelled_at = ${now},
          updated_at = ${now}
        WHERE id = ${id}
      `;

      return cancelledBooking;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  /**
   * Hard delete a booking (for admin/testing purposes)
   */
  async delete(id: string): Promise<boolean> {
    if (!sql) {
      console.warn('Database not configured');
      return false;
    }

    try {
      const result = await sql`
        DELETE FROM bookings WHERE id = ${id}
      `;

      // Neon returns the number of affected rows
      return result.length > 0 || (result as any).count > 0;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw new Error('Failed to delete booking');
    }
  }

  /**
   * Get total count of bookings
   * Note: Excludes soft-deleted bookings by default
   */
  async count(params?: BookingSearchParams): Promise<number> {
    if (!sql) {
      console.warn('Database not configured');
      return 0;
    }

    try {
      if (!params || Object.keys(params).length === 0) {
        const result = await sql`
          SELECT COUNT(*) as count FROM bookings
          WHERE deleted_at IS NULL
        `;
        return parseInt(result[0].count);
      }

      // Count with filters
      if (params.email) {
        const email = params.email.toLowerCase();
        const result = await sql`
          SELECT COUNT(*) as count FROM bookings
          WHERE LOWER(contact_info->>'email') = ${email}
          AND deleted_at IS NULL
        `;
        return parseInt(result[0].count);
      }

      if (params.userId) {
        const result = await sql`
          SELECT COUNT(*) as count FROM bookings
          WHERE user_id = ${params.userId}
          AND deleted_at IS NULL
        `;
        return parseInt(result[0].count);
      }

      if (params.status) {
        const result = await sql`
          SELECT COUNT(*) as count FROM bookings
          WHERE status = ${params.status}
          AND deleted_at IS NULL
        `;
        return parseInt(result[0].count);
      }

      // For complex queries, use search and return length
      const results = await this.search(params);
      return results.length;
    } catch (error) {
      console.error('Error counting bookings:', error);
      throw new Error('Failed to count bookings');
    }
  }

  /**
   * Clear all bookings (for testing purposes)
   */
  async clearAll(): Promise<void> {
    if (!sql) {
      throw new Error('Database not configured');
    }

    try {
      await sql`TRUNCATE TABLE bookings`;
    } catch (error) {
      console.error('Error clearing bookings:', error);
      throw new Error('Failed to clear bookings');
    }
  }

  /**
   * Get all bookings (for admin purposes)
   * Note: Excludes soft-deleted bookings by default
   */
  async getAll(includeDeleted: boolean = false): Promise<Booking[]> {
    if (!sql) {
      console.warn('Database not configured');
      return [];
    }

    try {
      const result = includeDeleted
        ? await sql`SELECT * FROM bookings ORDER BY created_at DESC`
        : await sql`SELECT * FROM bookings WHERE deleted_at IS NULL ORDER BY created_at DESC`;

      return result.map(row => this.deserializeBooking(row));
    } catch (error) {
      console.error('Error getting all bookings:', error);
      throw new Error('Failed to get bookings');
    }
  }

  /**
   * Helper method to safely parse JSON with error handling
   */
  private safeJsonParse<T>(value: any, fieldName: string, defaultValue: T): T {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (typeof value !== 'string') {
      return value as T;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error parsing ${fieldName} JSON:`, error);
      console.error(`Raw value:`, value?.substring?.(0, 100));
      return defaultValue;
    }
  }

  /**
   * Helper method to deserialize booking from database row
   * Converts JSON columns back to TypeScript objects
   * FIXED: Added error handling for corrupted JSON
   */
  private deserializeBooking(row: any): Booking {
    return {
      id: row.id,
      bookingReference: row.booking_reference,
      status: row.status,
      userId: row.user_id,
      contactInfo: this.safeJsonParse(row.contact_info, 'contact_info', { email: '', phone: '' }),
      flight: this.safeJsonParse(row.flight, 'flight', { id: '', type: 'one-way', segments: [], price: { currency: 'USD', total: 0, base: 0, taxes: 0, fees: 0 } }),
      passengers: this.safeJsonParse(row.passengers, 'passengers', []),
      seats: this.safeJsonParse(row.seats, 'seats', []),
      payment: this.safeJsonParse(row.payment, 'payment', { method: 'credit_card', status: 'pending', amount: 0, currency: 'USD' }),
      specialRequests: row.special_requests
        ? this.safeJsonParse(row.special_requests, 'special_requests', undefined)
        : undefined,
      notes: row.notes || undefined,
      cancellationReason: row.cancellation_reason || undefined,
      refundPolicy: row.refund_policy
        ? this.safeJsonParse(row.refund_policy, 'refund_policy', undefined)
        : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      cancelledAt: row.cancelled_at || undefined,
    };
  }
}

// Singleton instance
export const bookingStorage = new BookingStorage();

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefund(booking: Booking): { refundAmount: number; cancellationFee: number } {
  const { payment, refundPolicy, flight } = booking;

  // If not refundable, no refund
  if (!refundPolicy?.refundable) {
    return {
      refundAmount: 0,
      cancellationFee: payment.amount,
    };
  }

  // Check if past refund deadline
  if (refundPolicy.refundDeadline) {
    const deadline = new Date(refundPolicy.refundDeadline);
    const now = new Date();

    if (now > deadline) {
      return {
        refundAmount: 0,
        cancellationFee: payment.amount,
      };
    }
  }

  // Calculate cancellation fee
  const cancellationFee = refundPolicy.cancellationFee || 0;
  const refundAmount = Math.max(0, payment.amount - cancellationFee);

  return {
    refundAmount,
    cancellationFee,
  };
}

/**
 * Validate booking dates (ensure flight hasn't departed)
 */
export function canModifyBooking(booking: Booking): { allowed: boolean; reason?: string } {
  // Can't modify cancelled bookings
  if (booking.status === 'cancelled') {
    return {
      allowed: false,
      reason: 'Cannot modify a cancelled booking',
    };
  }

  // Check if flight has already departed
  const firstSegment = booking.flight.segments[0];
  const departureTime = new Date(firstSegment.departure.at);
  const now = new Date();

  if (now > departureTime) {
    return {
      allowed: false,
      reason: 'Cannot modify a booking after the flight has departed',
    };
  }

  return { allowed: true };
}
