/**
 * Initialize bookings-specific database tables
 * Focused initialization for booking system
 */

import { sql } from './connection';

export async function initBookingsTables() {
  if (!sql) {
    throw new Error('Database not configured');
  }

  try {
    console.log('Creating bookings table...');

    // Create bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(255) PRIMARY KEY,
        user_id UUID,
        booking_type VARCHAR(20) DEFAULT 'flight',
        booking_reference VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL,
        contact_info JSONB NOT NULL,
        guest_email VARCHAR(255),
        guest_first_name VARCHAR(100),
        guest_last_name VARCHAR(100),
        guest_phone VARCHAR(20),
        booking_details JSONB,
        flight JSONB,
        passengers JSONB,
        seats JSONB,
        total_amount DECIMAL(10, 2),
        currency VARCHAR(3) DEFAULT 'USD',
        commission_amount DECIMAL(10, 2),
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_intent_id VARCHAR(255),
        payment JSONB,
        provider VARCHAR(50),
        provider_booking_id VARCHAR(255),
        provider_confirmation_code VARCHAR(100),
        special_requests JSONB,
        notes TEXT,
        cancellation_reason TEXT,
        refund_policy JSONB,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        travel_date_from DATE,
        travel_date_to DATE,
        cancelled_at TIMESTAMP,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'))
      )
    `;

    // Add deleted_at column if it doesn't exist (for existing tables)
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;

    console.log('Creating indexes...');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_contact_email ON bookings USING gin ((contact_info -> 'email'))`;

    console.log('Creating updated_at trigger...');

    // Create update trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_bookings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    // Create trigger
    await sql`
      DROP TRIGGER IF EXISTS update_bookings_updated_at_trigger ON bookings
    `;

    await sql`
      CREATE TRIGGER update_bookings_updated_at_trigger
      BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION update_bookings_updated_at()
    `;

    console.log('✅ Bookings tables initialized successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error initializing bookings tables:', error);
    throw error;
  }
}

export async function checkBookingsTable() {
  if (!sql) {
    return {
      success: false,
      tableExists: false,
      recordCount: 0
    };
  }

  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM bookings
    `;

    return {
      success: true,
      tableExists: true,
      recordCount: parseInt(result[0].count)
    };
  } catch (error: any) {
    if (error.message?.includes('does not exist')) {
      return {
        success: false,
        tableExists: false,
        recordCount: 0
      };
    }
    throw error;
  }
}
