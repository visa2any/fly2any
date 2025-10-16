-- Fly2Any Travel Platform Database Schema
-- PostgreSQL (Neon) Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  country_code VARCHAR(3),
  language VARCHAR(5) DEFAULT 'en',
  profile_image_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- User sessions (for authentication)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (all types: flights, hotels, etc.)
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(255) PRIMARY KEY, -- Application-generated ID (e.g., booking_1234567890_abc123)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_type VARCHAR(20) DEFAULT 'flight', -- 'flight', 'hotel', 'car', 'tour', 'insurance'
  booking_reference VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'pending', 'confirmed', 'cancelled', 'completed'

  -- Contact information (JSONB for structured data)
  contact_info JSONB NOT NULL, -- {email, phone, alternatePhone, emergencyContact}

  -- Guest information (legacy support - can be derived from contact_info)
  guest_email VARCHAR(255),
  guest_first_name VARCHAR(100),
  guest_last_name VARCHAR(100),
  guest_phone VARCHAR(20),

  -- Booking details (JSONB for flexibility)
  booking_details JSONB,

  -- Flight-specific data (stored as JSONB for denormalized storage)
  flight JSONB, -- Complete flight data: {id, type, segments[], price{total, base, taxes, fees, currency}, validatingAirlineCodes[]}
  passengers JSONB, -- Array of passenger objects
  seats JSONB, -- Array of seat selection objects

  -- Financial information
  total_amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  commission_amount DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'failed'
  payment_method VARCHAR(50),
  payment_intent_id VARCHAR(255),

  -- Payment details (JSONB for complete payment tracking)
  payment JSONB, -- {method, status, transactionId, amount, currency, cardLast4, cardBrand, paidAt, refundedAt, refundAmount}

  -- Provider information
  provider VARCHAR(50), -- 'amadeus', 'liteapi', etc.
  provider_booking_id VARCHAR(255),
  provider_confirmation_code VARCHAR(100),

  -- Additional booking metadata
  special_requests JSONB, -- Array of special request strings (stored as JSON for consistency)
  notes TEXT,
  cancellation_reason TEXT,
  refund_policy JSONB, -- {refundable, refundDeadline, cancellationFee}

  -- Timestamps
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  travel_date_from DATE,
  travel_date_to DATE,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'))
);

-- Flight bookings (detailed flight information)
CREATE TABLE IF NOT EXISTS flight_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,

  -- Flight details
  origin_airport VARCHAR(10) NOT NULL,
  destination_airport VARCHAR(10) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,

  -- Passenger details
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,

  -- Flight class
  travel_class VARCHAR(20), -- 'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'

  -- Detailed flight offer (JSONB)
  flight_offer JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotel bookings (detailed hotel information)
CREATE TABLE IF NOT EXISTS hotel_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,

  -- Hotel details
  hotel_id VARCHAR(100) NOT NULL,
  hotel_name VARCHAR(255) NOT NULL,
  hotel_address TEXT,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,

  -- Booking dates
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,

  -- Guest details
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER DEFAULT 0,

  -- Room details (JSONB for flexibility)
  room_details JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passengers table (normalized passenger data for bookings)
CREATE TABLE IF NOT EXISTS passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Passenger identity
  passenger_type VARCHAR(10) NOT NULL, -- 'adult', 'child', 'infant'
  title VARCHAR(5) NOT NULL, -- 'Mr', 'Ms', 'Mrs', 'Dr'
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(3) NOT NULL, -- ISO country code

  -- Travel documents
  passport_number VARCHAR(50),
  passport_expiry DATE,

  -- Contact information (optional for individual passengers)
  email VARCHAR(255),
  phone VARCHAR(20),

  -- Additional information
  special_requests TEXT[], -- Array of special request strings
  frequent_flyer_number VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_passenger_type CHECK (passenger_type IN ('adult', 'child', 'infant')),
  CONSTRAINT valid_title CHECK (title IN ('Mr', 'Ms', 'Mrs', 'Dr'))
);

-- Flight segments table (normalized flight segment data)
CREATE TABLE IF NOT EXISTS flight_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Segment identifier (for matching with seat selections)
  segment_id VARCHAR(50) NOT NULL, -- Application-level segment identifier
  sequence_number INTEGER NOT NULL, -- Order of segments (1, 2, 3...)

  -- Departure information
  departure_iata_code VARCHAR(3) NOT NULL,
  departure_terminal VARCHAR(10),
  departure_at TIMESTAMP NOT NULL,

  -- Arrival information
  arrival_iata_code VARCHAR(3) NOT NULL,
  arrival_terminal VARCHAR(10),
  arrival_at TIMESTAMP NOT NULL,

  -- Flight information
  carrier_code VARCHAR(3) NOT NULL,
  flight_number VARCHAR(10) NOT NULL,
  aircraft VARCHAR(50),
  duration VARCHAR(20), -- ISO 8601 duration format (e.g., 'PT2H30M')

  -- Class information
  seat_class VARCHAR(20) NOT NULL, -- 'economy', 'premium_economy', 'business', 'first'

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_seat_class CHECK (seat_class IN ('economy', 'premium_economy', 'business', 'first')),
  CONSTRAINT valid_sequence CHECK (sequence_number > 0),

  -- Composite unique constraint for segment ordering
  UNIQUE(booking_id, sequence_number)
);

-- Seat selections table (normalized seat assignment data)
CREATE TABLE IF NOT EXISTS seat_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
  flight_segment_id UUID NOT NULL REFERENCES flight_segments(id) ON DELETE CASCADE,

  -- Seat information
  seat_number VARCHAR(10) NOT NULL, -- e.g., '12A', '23F'
  seat_class VARCHAR(20) NOT NULL, -- 'economy', 'premium_economy', 'business', 'first'
  seat_price DECIMAL(10, 2), -- Additional price for seat selection

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_seat_class_selection CHECK (seat_class IN ('economy', 'premium_economy', 'business', 'first')),

  -- Unique constraint: one seat per passenger per segment
  UNIQUE(passenger_id, flight_segment_id)
);

-- Search history (for analytics and personalization)
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  search_type VARCHAR(20) NOT NULL, -- 'flight', 'hotel', 'car', etc.
  search_params JSONB NOT NULL,
  results_count INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price alerts (user-created price monitoring)
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL, -- 'flight', 'hotel'
  route_or_destination VARCHAR(255) NOT NULL,
  search_params JSONB NOT NULL,
  target_price DECIMAL(10, 2),
  current_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  last_checked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Support ticket messages
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  attachments JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email notifications log
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'price_alert', 'reminder', etc.
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events (for tracking user behavior)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'search', 'click', 'booking_started', etc.
  event_data JSONB,
  page_url TEXT,
  referrer_url TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals and affiliate tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  reward_amount DECIMAL(10, 2),
  reward_given_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_dates ON bookings(travel_date_from, travel_date_to);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_email_status ON bookings(guest_email, status);

-- JSONB indexes for contact info email lookups
CREATE INDEX IF NOT EXISTS idx_bookings_contact_email ON bookings USING gin ((contact_info -> 'email'));

-- Flight booking indexes
CREATE INDEX IF NOT EXISTS idx_flight_bookings_booking_id ON flight_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_routes ON flight_bookings(origin_airport, destination_airport);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_departure_date ON flight_bookings(departure_date);

-- Hotel booking indexes
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_booking_id ON hotel_bookings(booking_id);

-- Passenger indexes
CREATE INDEX IF NOT EXISTS idx_passengers_booking_id ON passengers(booking_id);
CREATE INDEX IF NOT EXISTS idx_passengers_name ON passengers(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_passengers_passport ON passengers(passport_number) WHERE passport_number IS NOT NULL;

-- Flight segment indexes
CREATE INDEX IF NOT EXISTS idx_flight_segments_booking_id ON flight_segments(booking_id);
CREATE INDEX IF NOT EXISTS idx_flight_segments_departure ON flight_segments(departure_at);
CREATE INDEX IF NOT EXISTS idx_flight_segments_route ON flight_segments(departure_iata_code, arrival_iata_code);
CREATE INDEX IF NOT EXISTS idx_flight_segments_sequence ON flight_segments(booking_id, sequence_number);

-- Seat selection indexes
CREATE INDEX IF NOT EXISTS idx_seat_selections_booking_id ON seat_selections(booking_id);
CREATE INDEX IF NOT EXISTS idx_seat_selections_passenger_id ON seat_selections(passenger_id);
CREATE INDEX IF NOT EXISTS idx_seat_selections_segment_id ON seat_selections(flight_segment_id);

-- Other table indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_bookings_updated_at BEFORE UPDATE ON flight_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_bookings_updated_at BEFORE UPDATE ON hotel_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passengers_updated_at BEFORE UPDATE ON passengers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_segments_updated_at BEFORE UPDATE ON flight_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seat_selections_updated_at BEFORE UPDATE ON seat_selections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

-- Table comments
COMMENT ON TABLE bookings IS 'Main bookings table for all booking types (flights, hotels, etc.). Contains booking metadata, payment info, and contact details.';
COMMENT ON TABLE passengers IS 'Normalized passenger information for flight bookings. Each passenger is linked to a booking and can have multiple seat selections.';
COMMENT ON TABLE flight_segments IS 'Individual flight segments for multi-leg journeys. Each segment represents one flight from origin to destination.';
COMMENT ON TABLE seat_selections IS 'Seat assignments linking passengers to specific seats on flight segments.';

-- Column comments for important fields
COMMENT ON COLUMN bookings.booking_reference IS 'Unique booking reference code (e.g., FLY2A-ABC123) used for customer lookup';
COMMENT ON COLUMN bookings.contact_info IS 'JSONB field containing: {email, phone, alternatePhone, emergencyContact{name, phone, relationship}}';
COMMENT ON COLUMN bookings.payment_info IS 'JSONB field containing: {method, status, transactionId, amount, currency, cardLast4, cardBrand, paidAt, refundedAt, refundAmount}';
COMMENT ON COLUMN bookings.refund_policy IS 'JSONB field containing: {refundable, refundDeadline, cancellationFee}';
COMMENT ON COLUMN passengers.special_requests IS 'Array of special requests (e.g., wheelchair assistance, meal preferences)';
COMMENT ON COLUMN flight_segments.segment_id IS 'Application-level identifier for matching segments with seat selections';
COMMENT ON COLUMN flight_segments.duration IS 'Flight duration in ISO 8601 format (e.g., PT2H30M for 2 hours 30 minutes)';

-- =====================================================
-- SAMPLE QUERIES AND USAGE EXAMPLES
-- =====================================================

-- Query to get a complete booking with all related data:
-- SELECT
--   b.*,
--   json_agg(DISTINCT p.*) FILTER (WHERE p.id IS NOT NULL) as passengers,
--   json_agg(DISTINCT fs.*) FILTER (WHERE fs.id IS NOT NULL) as flight_segments,
--   json_agg(DISTINCT ss.*) FILTER (WHERE ss.id IS NOT NULL) as seat_selections
-- FROM bookings b
-- LEFT JOIN passengers p ON p.booking_id = b.id
-- LEFT JOIN flight_segments fs ON fs.booking_id = b.id
-- LEFT JOIN seat_selections ss ON ss.booking_id = b.id
-- WHERE b.booking_reference = 'FLY2A-ABC123'
-- GROUP BY b.id;

-- Query to find bookings by email (checks both guest_email and contact_info JSON):
-- SELECT * FROM bookings
-- WHERE guest_email = 'user@example.com'
--    OR contact_info->>'email' = 'user@example.com';

-- Query to find bookings for a specific route and date range:
-- SELECT DISTINCT b.*
-- FROM bookings b
-- JOIN flight_segments fs ON fs.booking_id = b.id
-- WHERE fs.departure_iata_code = 'JFK'
--   AND fs.arrival_iata_code = 'LAX'
--   AND fs.departure_at BETWEEN '2025-01-01' AND '2025-12-31'
--   AND b.status = 'confirmed';

-- Query to get passenger seat assignments for a booking:
-- SELECT
--   p.first_name,
--   p.last_name,
--   fs.departure_iata_code || '-' || fs.arrival_iata_code as route,
--   fs.flight_number,
--   ss.seat_number,
--   ss.seat_class
-- FROM passengers p
-- JOIN seat_selections ss ON ss.passenger_id = p.id
-- JOIN flight_segments fs ON fs.id = ss.flight_segment_id
-- WHERE p.booking_id = 'BOOKING_UUID'
-- ORDER BY fs.sequence_number, p.last_name;
