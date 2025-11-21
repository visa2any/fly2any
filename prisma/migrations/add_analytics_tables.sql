-- Add missing analytics tables for flight search logging and cache optimization
-- These tables are required by the search-logger.ts module

-- 1. Flight Search Logs Table
CREATE TABLE IF NOT EXISTS flight_search_logs (
  id SERIAL PRIMARY KEY,

  -- Search parameters
  origin VARCHAR(3) NOT NULL,
  destination VARCHAR(3) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  is_round_trip BOOLEAN DEFAULT false,

  -- Passengers
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  infants INT DEFAULT 0,

  -- Preferences
  cabin_class VARCHAR(20),
  non_stop BOOLEAN DEFAULT false,

  -- Results
  results_count INT DEFAULT 0,
  lowest_price INT, -- In cents
  highest_price INT,
  avg_price INT,
  currency VARCHAR(3) DEFAULT 'USD',

  -- API metadata
  amadeus_results INT DEFAULT 0,
  duffel_results INT DEFAULT 0,
  api_response_time_ms INT,
  cache_hit BOOLEAN DEFAULT false,

  -- User context
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  ip_hash VARCHAR(64), -- Hashed for privacy
  browser_fingerprint VARCHAR(32),
  user_agent TEXT,
  referer TEXT,

  -- Geolocation
  country_code VARCHAR(2),
  region VARCHAR(100),
  timezone VARCHAR(50),

  -- Conversion tracking
  converted BOOLEAN DEFAULT false,
  booked_flight_id VARCHAR(255),
  booking_id VARCHAR(255),
  time_to_book_seconds INT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for flight_search_logs
CREATE INDEX IF NOT EXISTS idx_flight_search_logs_route ON flight_search_logs(origin, destination);
CREATE INDEX IF NOT EXISTS idx_flight_search_logs_departure ON flight_search_logs(departure_date);
CREATE INDEX IF NOT EXISTS idx_flight_search_logs_user ON flight_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_search_logs_session ON flight_search_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_flight_search_logs_created ON flight_search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_flight_search_logs_converted ON flight_search_logs(converted);

-- 2. Route Statistics Table (Aggregated from search logs)
CREATE TABLE IF NOT EXISTS route_statistics (
  id SERIAL PRIMARY KEY,
  route VARCHAR(10) UNIQUE NOT NULL, -- Format: "JFK-LAX"
  origin VARCHAR(3) NOT NULL,
  destination VARCHAR(3) NOT NULL,

  -- Search volume metrics
  searches_30d INT DEFAULT 0,
  searches_7d INT DEFAULT 0,
  searches_24h INT DEFAULT 0,

  -- Price metrics
  avg_price INT DEFAULT 0, -- In cents
  min_price INT,
  max_price INT,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Conversion metrics
  conversions_30d INT DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0.0000, -- 0.0000 to 1.0000

  -- Cache optimization
  cache_priority INT DEFAULT 0, -- 0-100 score
  recommended_ttl_seconds INT DEFAULT 900, -- 15 minutes default
  volatility_score DECIMAL(3,2) DEFAULT 1.00, -- 0.00 to 1.00

  -- Timestamps
  last_searched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for route_statistics
CREATE INDEX IF NOT EXISTS idx_route_statistics_route ON route_statistics(route);
CREATE INDEX IF NOT EXISTS idx_route_statistics_origin ON route_statistics(origin);
CREATE INDEX IF NOT EXISTS idx_route_statistics_destination ON route_statistics(destination);
CREATE INDEX IF NOT EXISTS idx_route_statistics_searches_7d ON route_statistics(searches_7d DESC);
CREATE INDEX IF NOT EXISTS idx_route_statistics_priority ON route_statistics(cache_priority DESC);

-- 3. Calendar Cache Coverage Table
CREATE TABLE IF NOT EXISTS calendar_cache_coverage (
  id SERIAL PRIMARY KEY,
  route VARCHAR(10) NOT NULL, -- Format: "JFK-LAX"
  date DATE NOT NULL,

  -- Cache status
  has_cache BOOLEAN DEFAULT false,
  cache_source VARCHAR(20) DEFAULT 'user-search', -- user-search, pre-warm, demo

  -- Cached data
  cached_price INT, -- In cents
  cached_at TIMESTAMP,
  expires_at TIMESTAMP,
  ttl_seconds INT,

  -- Usage tracking
  searches_count INT DEFAULT 0,
  last_accessed_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(route, date)
);

-- Indexes for calendar_cache_coverage
CREATE INDEX IF NOT EXISTS idx_calendar_cache_route ON calendar_cache_coverage(route);
CREATE INDEX IF NOT EXISTS idx_calendar_cache_date ON calendar_cache_coverage(date);
CREATE INDEX IF NOT EXISTS idx_calendar_cache_route_date ON calendar_cache_coverage(route, date);
CREATE INDEX IF NOT EXISTS idx_calendar_cache_has_cache ON calendar_cache_coverage(has_cache);
CREATE INDEX IF NOT EXISTS idx_calendar_cache_expires ON calendar_cache_coverage(expires_at);

-- Comments for documentation
COMMENT ON TABLE flight_search_logs IS 'Logs every flight search for analytics, ML, and cache optimization';
COMMENT ON TABLE route_statistics IS 'Aggregated statistics per route for cache priority and optimization';
COMMENT ON TABLE calendar_cache_coverage IS 'Tracks which dates have cached prices for calendar view';

-- Grant permissions (if needed)
-- GRANT ALL ON flight_search_logs TO your_user;
-- GRANT ALL ON route_statistics TO your_user;
-- GRANT ALL ON calendar_cache_coverage TO your_user;
