/**
 * Initialize bookings-specific database tables
 * Focused initialization for booking system
 */

import { getSql } from './connection';

export async function initBookingsTables() {
  const sql = getSql();

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
        CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'VERIFICATION_PENDING')),
        CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed', 'authorized'))
      )
    `;

    // Add deleted_at column if it doesn't exist (for existing tables)
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;

    // CRITICAL: Add core columns that may be missing from Supabase
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id UUID`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status VARCHAR(20)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_info JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS flight JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passengers JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS seats JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_policy JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP`;

    // Add guest columns for existing tables (Supabase migration fix)
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_first_name VARCHAR(100)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_last_name VARCHAR(100)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_details JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD'`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10, 2)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending'`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider VARCHAR(50)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_booking_id VARCHAR(255)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_confirmation_code VARCHAR(100)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;

    // Add booking_type for car rentals, hotels, etc (CRITICAL for multi-product)
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'flight'`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_date_from DATE`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_date_to DATE`;

    // Add admin pricing columns for profit tracking (CRITICAL for business)
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source_api VARCHAR(20)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duffel_order_id VARCHAR(255)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duffel_booking_reference VARCHAR(100)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amadeus_booking_id VARCHAR(255)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS airline_record_locator VARCHAR(100)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ticketing_status VARCHAR(50)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS net_price DECIMAL(10, 2)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_price DECIMAL(10, 2)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS markup_amount DECIMAL(10, 2)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duffel_cost DECIMAL(10, 2)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS consolidator_cost DECIMAL(10, 2)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS net_profit DECIMAL(10, 2)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS routing_channel VARCHAR(50)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS routing_reason VARCHAR(100)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_hold BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMP`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fare_upgrade JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bundle JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS add_ons JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_code JSONB`;

    // ==================== ENHANCED BOOKING SYNC COLUMNS ====================
    // E-Tickets & Documents - [{passenger_id, ticket_number, issued_at}]
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS e_tickets JSONB`;
    // Full Duffel documents array
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS documents JSONB`;

    // Provider Sync Tracking (sync_status: pending, synced, error)
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'pending'`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS sync_error TEXT`;
    // provider_status: Airline's actual status
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_status VARCHAR(50)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS provider_last_update TIMESTAMP`;

    // Cross-Provider Separate Tickets Support (outbound_provider: 'Duffel' or 'Amadeus')
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_separate_tickets BOOLEAN DEFAULT FALSE`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS outbound_provider VARCHAR(20)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS outbound_order_id VARCHAR(255)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS outbound_pnr VARCHAR(50)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_provider VARCHAR(20)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_order_id VARCHAR(255)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_pnr VARCHAR(50)`;

    // Full API Response Storage (for debugging & audit)
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duffel_order_raw JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amadeus_order_raw JSONB`;

    // Conditions & Policies from Duffel: {allowed, penalty_amount, deadline}
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_policy JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS change_policy JSONB`;

    // Services & Add-ons (post-booking): [{type, segment_id, quantity, price}]
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS services JSONB`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS available_services JSONB`;

    // Payment Tracking (Duffel) - duffel_payment_status: awaiting_payment, paid
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duffel_payment_status VARCHAR(30)`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duffel_balance_due DECIMAL(10,2)`;

    // Update constraints for existing tables (drop and recreate)
    console.log('Updating constraints...');
    try {
      await sql`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS valid_status`;
      await sql`ALTER TABLE bookings ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'VERIFICATION_PENDING'))`;
    } catch (e) {
      console.log('Status constraint update skipped (may already be correct)');
    }
    try {
      await sql`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS valid_payment_status`;
      await sql`ALTER TABLE bookings ADD CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed', 'authorized'))`;
    } catch (e) {
      console.log('Payment status constraint update skipped (may already be correct)');
    }

    console.log('Creating indexes...');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_contact_email ON bookings USING gin ((contact_info -> 'email'))`;
    // Enhanced sync indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_duffel_order ON bookings(duffel_order_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_sync_status ON bookings(sync_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_last_synced ON bookings(last_synced_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_source_api ON bookings(source_api)`;

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
  const sql = getSql();

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
