-- =============================================
-- FLIGHT SEARCH ANALYTICS & CALENDAR CACHE
-- =============================================
-- Purpose: Track flight searches to power zero-cost calendar
-- Strategy: Crowdsource price data from actual user searches
-- Cost: $0 (no partner API calls needed)
-- =============================================

-- Table: flight_search_logs
-- Tracks every flight search for analytics and ML
CREATE TABLE IF NOT EXISTS flight_search_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Search parameters
  origin VARCHAR(10) NOT NULL,
  destination VARCHAR(10) NOT NULL,
  route VARCHAR(20) NOT NULL GENERATED ALWAYS AS (origin || '-' || destination) STORED,
  departure_date DATE NOT NULL,
  return_date DATE,
  is_round_trip BOOLEAN DEFAULT TRUE,

  -- Passenger details
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL DEFAULT 0,
  infants INTEGER NOT NULL DEFAULT 0,

  -- Preferences
  cabin_class VARCHAR(20), -- ECONOMY, BUSINESS, FIRST
  non_stop BOOLEAN DEFAULT FALSE,

  -- Results metadata
  results_count INTEGER,
  lowest_price INTEGER, -- In cents
  highest_price INTEGER, -- In cents
  avg_price INTEGER, -- In cents
  currency VARCHAR(3) DEFAULT 'USD',

  -- API source tracking
  amadeus_results INTEGER DEFAULT 0,
  duffel_results INTEGER DEFAULT 0,
  api_response_time_ms INTEGER, -- Total API response time
  cache_hit BOOLEAN DEFAULT FALSE,

  -- User context (anonymous + logged in)
  user_id UUID, -- References users table (if logged in)
  session_id VARCHAR(100),
  ip_hash VARCHAR(64), -- SHA-256 hashed IP for privacy
  browser_fingerprint VARCHAR(100), -- Anonymized browser fingerprint
  user_agent TEXT,
  referer TEXT,

  -- Geo context
  country_code VARCHAR(2),
  region VARCHAR(50),
  timezone VARCHAR(50),

  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE, -- Did user book?
  booked_flight_id VARCHAR(100), -- Which offer was booked
  booking_id UUID, -- References bookings table
  time_to_book_seconds INTEGER, -- Seconds from search to booking

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT check_passengers CHECK (adults > 0),
  CONSTRAINT check_dates CHECK (return_date IS NULL OR return_date > departure_date)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_flight_search_route ON flight_search_logs(route);
CREATE INDEX IF NOT EXISTS idx_flight_search_origin ON flight_search_logs(origin);
CREATE INDEX IF NOT EXISTS idx_flight_search_destination ON flight_search_logs(destination);
CREATE INDEX IF NOT EXISTS idx_flight_search_departure_date ON flight_search_logs(departure_date);
CREATE INDEX IF NOT EXISTS idx_flight_search_created_at ON flight_search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_flight_search_user_id ON flight_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_search_ip_hash ON flight_search_logs(ip_hash);
CREATE INDEX IF NOT EXISTS idx_flight_search_converted ON flight_search_logs(converted);
CREATE INDEX IF NOT EXISTS idx_flight_search_cache_hit ON flight_search_logs(cache_hit);

-- Composite index for route analytics
CREATE INDEX IF NOT EXISTS idx_flight_search_route_date
  ON flight_search_logs(route, departure_date);

-- Index for popular routes (searches last 30 days)
-- Note: Removed WHERE clause to avoid IMMUTABLE function requirement
CREATE INDEX IF NOT EXISTS idx_flight_search_popular_routes
  ON flight_search_logs(route, created_at DESC);


-- =============================================
-- ROUTE POPULARITY & CACHE PRIORITY
-- =============================================
-- Table: route_statistics
-- Aggregated stats to determine cache priorities
CREATE TABLE IF NOT EXISTS route_statistics (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Route identifier
  route VARCHAR(20) NOT NULL UNIQUE, -- e.g., "JFK-MIA"
  origin VARCHAR(10) NOT NULL,
  destination VARCHAR(10) NOT NULL,

  -- Search volume (last 30 days)
  searches_30d INTEGER DEFAULT 0,
  searches_7d INTEGER DEFAULT 0,
  searches_24h INTEGER DEFAULT 0,

  -- Conversion metrics
  bookings_30d INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage

  -- Pricing insights
  avg_price INTEGER, -- In cents
  min_price INTEGER,
  max_price INTEGER,
  price_volatility DECIMAL(5, 2), -- Std deviation as percentage

  -- Seasonality flags
  is_business_route BOOLEAN DEFAULT FALSE, -- Mon-Thu searches
  is_leisure_route BOOLEAN DEFAULT FALSE, -- Fri-Sun searches
  peak_season_months INTEGER[], -- Array of months (1-12)

  -- Cache strategy
  cache_priority INTEGER DEFAULT 0, -- 0-100, higher = keep longer
  recommended_ttl_seconds INTEGER DEFAULT 900, -- Smart TTL

  -- Last search timestamp
  last_searched_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_route_stats_route ON route_statistics(route);
CREATE INDEX IF NOT EXISTS idx_route_stats_priority ON route_statistics(cache_priority DESC);
CREATE INDEX IF NOT EXISTS idx_route_stats_searches ON route_statistics(searches_30d DESC);


-- =============================================
-- CACHE COVERAGE TRACKING
-- =============================================
-- Table: calendar_cache_coverage
-- Track which routes have cached prices for which dates
CREATE TABLE IF NOT EXISTS calendar_cache_coverage (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Route & date
  route VARCHAR(20) NOT NULL,
  date DATE NOT NULL,

  -- Cache metadata
  has_cache BOOLEAN DEFAULT FALSE,
  cache_source VARCHAR(50), -- 'user-search', 'pre-warm', 'demo'
  cached_price INTEGER, -- In cents
  currency VARCHAR(3) DEFAULT 'USD',

  -- Cache freshness
  cached_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  ttl_seconds INTEGER,

  -- Search volume for this date
  searches_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(route, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cache_coverage_route_date ON calendar_cache_coverage(route, date);
CREATE INDEX IF NOT EXISTS idx_cache_coverage_expires ON calendar_cache_coverage(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_coverage_has_cache ON calendar_cache_coverage(has_cache);


-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function: Update route statistics
CREATE OR REPLACE FUNCTION update_route_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update route stats on new search
  INSERT INTO route_statistics (
    route, origin, destination,
    searches_30d, searches_7d, searches_24h,
    last_searched_at
  )
  VALUES (
    NEW.route,
    NEW.origin,
    NEW.destination,
    1, 1, 1,
    NEW.created_at
  )
  ON CONFLICT (route) DO UPDATE SET
    searches_30d = (
      SELECT COUNT(*)
      FROM flight_search_logs
      WHERE route = NEW.route
        AND created_at >= NOW() - INTERVAL '30 days'
    ),
    searches_7d = (
      SELECT COUNT(*)
      FROM flight_search_logs
      WHERE route = NEW.route
        AND created_at >= NOW() - INTERVAL '7 days'
    ),
    searches_24h = (
      SELECT COUNT(*)
      FROM flight_search_logs
      WHERE route = NEW.route
        AND created_at >= NOW() - INTERVAL '24 hours'
    ),
    last_searched_at = NEW.created_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update route stats on new search
CREATE TRIGGER trigger_update_route_stats
  AFTER INSERT ON flight_search_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_route_statistics();


-- =============================================
-- ANALYTICS VIEWS
-- =============================================

-- View: Popular routes with cache coverage
CREATE OR REPLACE VIEW v_popular_routes_cache_coverage AS
SELECT
  rs.route,
  rs.origin,
  rs.destination,
  rs.searches_30d,
  rs.conversion_rate,
  rs.cache_priority,
  COUNT(ccc.id) FILTER (WHERE ccc.has_cache = TRUE) AS cached_dates,
  COUNT(ccc.id) AS total_tracked_dates,
  ROUND(
    100.0 * COUNT(ccc.id) FILTER (WHERE ccc.has_cache = TRUE) /
    NULLIF(COUNT(ccc.id), 0),
    2
  ) AS cache_coverage_pct
FROM route_statistics rs
LEFT JOIN calendar_cache_coverage ccc ON rs.route = ccc.route
GROUP BY rs.route, rs.origin, rs.destination, rs.searches_30d, rs.conversion_rate, rs.cache_priority
ORDER BY rs.searches_30d DESC;


-- View: Cache gaps (popular routes with low coverage)
CREATE OR REPLACE VIEW v_cache_gaps AS
SELECT
  route,
  origin,
  destination,
  searches_30d,
  cached_dates,
  total_tracked_dates,
  cache_coverage_pct,
  CASE
    WHEN searches_30d > 100 AND cache_coverage_pct < 50 THEN 'CRITICAL'
    WHEN searches_30d > 50 AND cache_coverage_pct < 70 THEN 'HIGH'
    WHEN searches_30d > 20 AND cache_coverage_pct < 80 THEN 'MEDIUM'
    ELSE 'LOW'
  END AS priority
FROM v_popular_routes_cache_coverage
WHERE cache_coverage_pct < 80
ORDER BY searches_30d DESC;


-- =============================================
-- SAMPLE QUERIES
-- =============================================

/*
-- Top 20 routes by search volume (last 30 days)
SELECT
  route,
  origin,
  destination,
  searches_30d,
  bookings_30d,
  conversion_rate,
  cache_priority
FROM route_statistics
ORDER BY searches_30d DESC
LIMIT 20;

-- Cache coverage for a specific route
SELECT
  date,
  has_cache,
  cached_price / 100.0 AS price,
  cache_source,
  expires_at
FROM calendar_cache_coverage
WHERE route = 'JFK-MIA'
  AND date >= CURRENT_DATE
  AND date < CURRENT_DATE + INTERVAL '90 days'
ORDER BY date;

-- Search-to-booking funnel
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS total_searches,
  COUNT(*) FILTER (WHERE cache_hit = TRUE) AS cache_hits,
  COUNT(*) FILTER (WHERE converted = TRUE) AS bookings,
  ROUND(100.0 * COUNT(*) FILTER (WHERE cache_hit = TRUE) / COUNT(*), 2) AS cache_hit_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE converted = TRUE) / COUNT(*), 2) AS conversion_rate
FROM flight_search_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
*/
