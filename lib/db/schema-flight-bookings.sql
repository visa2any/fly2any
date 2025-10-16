-- ============================================
-- FLIGHT BOOKINGS TABLE SCHEMA
-- Production-ready schema for tracking flight booking counts
-- ============================================

-- Create flight_bookings table
CREATE TABLE IF NOT EXISTS flight_bookings (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Flight identification
  flight_id VARCHAR(255) NOT NULL,
  route_key VARCHAR(100) NOT NULL, -- Format: "ORIGIN-DESTINATION" (e.g., "JFK-LAX")
  carrier_code VARCHAR(3) NOT NULL, -- IATA airline code
  flight_number VARCHAR(10),

  -- Booking metadata
  booking_reference VARCHAR(100) UNIQUE,
  passenger_count INTEGER DEFAULT 1,
  travel_class VARCHAR(20) DEFAULT 'ECONOMY',

  -- Pricing
  total_amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Temporal data
  booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  travel_date DATE, -- Departure date

  -- Status
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- Critical indexes for fast queries
-- ============================================

-- Composite index for booking count queries (most important)
CREATE INDEX IF NOT EXISTS idx_flight_bookings_id_date
  ON flight_bookings(flight_id, booking_date DESC);

-- Index for route-based queries
CREATE INDEX IF NOT EXISTS idx_flight_bookings_route_date
  ON flight_bookings(route_key, booking_date DESC);

-- Index for carrier-based analytics
CREATE INDEX IF NOT EXISTS idx_flight_bookings_carrier_date
  ON flight_bookings(carrier_code, booking_date DESC);

-- Index for travel date queries
CREATE INDEX IF NOT EXISTS idx_flight_bookings_travel_date
  ON flight_bookings(travel_date);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_flight_bookings_status
  ON flight_bookings(status);

-- Composite index for popular flights query
CREATE INDEX IF NOT EXISTS idx_flight_bookings_date_status
  ON flight_bookings(booking_date DESC, status)
  WHERE status = 'confirmed';

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_flight_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_flight_bookings_updated_at_trigger ON flight_bookings;

CREATE TRIGGER update_flight_bookings_updated_at_trigger
  BEFORE UPDATE ON flight_bookings
  FOR EACH ROW EXECUTE FUNCTION update_flight_bookings_updated_at();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for today's bookings by flight
CREATE OR REPLACE VIEW flight_bookings_today AS
SELECT
  flight_id,
  route_key,
  carrier_code,
  COUNT(*) as bookings_count,
  SUM(passenger_count) as passengers_count,
  AVG(total_amount) as avg_price
FROM flight_bookings
WHERE booking_date >= CURRENT_DATE
  AND status = 'confirmed'
GROUP BY flight_id, route_key, carrier_code;

-- View for popular routes
CREATE OR REPLACE VIEW popular_routes_today AS
SELECT
  route_key,
  COUNT(*) as bookings_count,
  SUM(passenger_count) as passengers_count,
  AVG(total_amount) as avg_price,
  COUNT(DISTINCT flight_id) as unique_flights
FROM flight_bookings
WHERE booking_date >= CURRENT_DATE
  AND status = 'confirmed'
GROUP BY route_key
ORDER BY bookings_count DESC;

-- ============================================
-- SEED DATA (Optional - for testing/demo)
-- ============================================

-- Function to generate realistic seed data
CREATE OR REPLACE FUNCTION seed_flight_bookings(num_records INTEGER DEFAULT 1000)
RETURNS void AS $$
DECLARE
  i INTEGER;
  popular_routes TEXT[] := ARRAY['JFK-LAX', 'LHR-JFK', 'DXB-LHR', 'SIN-HKG', 'SYD-LAX'];
  carriers TEXT[] := ARRAY['AA', 'DL', 'UA', 'BA', 'EK', 'SQ', 'QF'];
  classes TEXT[] := ARRAY['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
  route TEXT;
  carrier TEXT;
  class TEXT;
  days_ago INTEGER;
  hours_ago INTEGER;
BEGIN
  FOR i IN 1..num_records LOOP
    -- Random route and carrier
    route := popular_routes[1 + floor(random() * array_length(popular_routes, 1))];
    carrier := carriers[1 + floor(random() * array_length(carriers, 1))];
    class := classes[1 + floor(random() * array_length(classes, 1))];

    -- Random time in last 7 days (weighted towards recent)
    days_ago := floor(random() * 7);
    hours_ago := floor(random() * 24);

    INSERT INTO flight_bookings (
      flight_id,
      route_key,
      carrier_code,
      flight_number,
      booking_reference,
      passenger_count,
      travel_class,
      total_amount,
      currency,
      booking_date,
      travel_date,
      status
    ) VALUES (
      'flight_' || gen_random_uuid(),
      route,
      carrier,
      carrier || '-' || (100 + floor(random() * 900))::TEXT,
      'FLY2A-' || upper(substring(md5(random()::text) from 1 for 6)),
      1 + floor(random() * 4), -- 1-4 passengers
      class,
      (200 + random() * 1800)::DECIMAL(10,2), -- $200-$2000
      'USD',
      CURRENT_TIMESTAMP - (days_ago || ' days')::INTERVAL - (hours_ago || ' hours')::INTERVAL,
      CURRENT_DATE + (floor(random() * 90) || ' days')::INTERVAL, -- Travel within next 90 days
      CASE
        WHEN random() < 0.92 THEN 'confirmed'
        WHEN random() < 0.05 THEN 'pending'
        ELSE 'cancelled'
      END
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE flight_bookings IS 'Tracks all flight bookings for analytics and booking count queries';
COMMENT ON COLUMN flight_bookings.flight_id IS 'Unique identifier for the flight offer (from search results)';
COMMENT ON COLUMN flight_bookings.route_key IS 'Origin-Destination pair for route-level analytics';
COMMENT ON COLUMN flight_bookings.booking_date IS 'When the booking was created (for counting daily bookings)';
COMMENT ON COLUMN flight_bookings.travel_date IS 'When the passenger will travel (departure date)';
COMMENT ON INDEX idx_flight_bookings_id_date IS 'Primary index for fast booking count queries by flight_id and date';
