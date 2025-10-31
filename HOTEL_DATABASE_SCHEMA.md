# Hotel Bookings Database Schema

Complete database schema for hotel booking management with Duffel Stays API integration.

## Overview

This schema supports:
- Hotel booking storage and management
- Commission tracking for revenue reporting
- Flight+Hotel bundle packages
- Booking history and analytics
- User preferences and wishlist

## Table: `hotel_bookings`

Primary table for storing hotel reservations.

```sql
CREATE TABLE hotel_bookings (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Booking reference
  reference VARCHAR(50) NOT NULL UNIQUE, -- Confirmation number from Duffel
  duffel_booking_id VARCHAR(100) UNIQUE, -- Duffel Stays booking ID

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Options: pending, confirmed, cancelled, completed, no_show

  -- Hotel details (denormalized for performance)
  hotel_id VARCHAR(100) NOT NULL,
  hotel_name VARCHAR(255) NOT NULL,
  hotel_address TEXT,
  hotel_city VARCHAR(100) NOT NULL,
  hotel_state VARCHAR(100),
  hotel_country VARCHAR(100) NOT NULL,
  hotel_postal_code VARCHAR(20),
  hotel_latitude DECIMAL(10, 8),
  hotel_longitude DECIMAL(11, 8),
  hotel_star_rating INTEGER,
  hotel_property_type VARCHAR(50),

  -- Room & rate details
  rate_id VARCHAR(100) NOT NULL,
  room_type VARCHAR(255) NOT NULL,
  room_description TEXT,
  bed_type VARCHAR(100),
  bed_count INTEGER,

  -- Stay details
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  rooms INTEGER NOT NULL DEFAULT 1,

  -- Guest information (JSON arrays)
  guests JSONB NOT NULL, -- Array of guest objects
  primary_guest_name VARCHAR(255) NOT NULL,
  primary_guest_email VARCHAR(255) NOT NULL,
  primary_guest_phone VARCHAR(50) NOT NULL,

  -- Pricing (in cents to avoid floating point issues)
  base_amount INTEGER NOT NULL, -- Base price in cents
  taxes_amount INTEGER NOT NULL, -- Taxes in cents
  total_amount INTEGER NOT NULL, -- Total price in cents
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Commission tracking
  commission_amount INTEGER, -- Our commission in cents
  commission_percentage DECIMAL(5, 2), -- Commission rate (e.g., 15.00 for 15%)

  -- Payment
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Options: pending, processing, succeeded, failed, refunded, partially_refunded
  payment_method VARCHAR(50),
  paid_amount INTEGER,
  payment_intent_id VARCHAR(255), -- Stripe payment intent ID

  -- Cancellation
  cancellation_policy JSONB, -- Cancellation policy details
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  refund_amount INTEGER, -- Refund amount in cents
  duffel_cancellation_id VARCHAR(100),

  -- Special requests
  special_requests TEXT,
  arrival_time VARCHAR(10), -- Estimated arrival time (HH:MM)

  -- Flight bundle (optional)
  flight_booking_id UUID REFERENCES bookings(id), -- Link to flight booking
  bundle_discount INTEGER, -- Bundle discount in cents
  is_bundle BOOLEAN DEFAULT FALSE,

  -- Metadata
  source VARCHAR(50) NOT NULL DEFAULT 'Duffel Stays',
  live_mode BOOLEAN DEFAULT FALSE,
  user_id UUID, -- References users table (if implementing auth)

  -- Quote information
  quote_id VARCHAR(100), -- Duffel quote ID used for booking
  quote_expires_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,

  -- Indexes for common queries
  CONSTRAINT check_dates CHECK (check_out > check_in),
  CONSTRAINT check_nights CHECK (nights > 0),
  CONSTRAINT check_rooms CHECK (rooms > 0),
  CONSTRAINT check_amounts CHECK (
    base_amount >= 0 AND
    taxes_amount >= 0 AND
    total_amount >= 0 AND
    total_amount = base_amount + taxes_amount
  )
);

-- Indexes for performance
CREATE INDEX idx_hotel_bookings_reference ON hotel_bookings(reference);
CREATE INDEX idx_hotel_bookings_status ON hotel_bookings(status);
CREATE INDEX idx_hotel_bookings_check_in ON hotel_bookings(check_in);
CREATE INDEX idx_hotel_bookings_check_out ON hotel_bookings(check_out);
CREATE INDEX idx_hotel_bookings_user_id ON hotel_bookings(user_id);
CREATE INDEX idx_hotel_bookings_email ON hotel_bookings(primary_guest_email);
CREATE INDEX idx_hotel_bookings_created_at ON hotel_bookings(created_at);
CREATE INDEX idx_hotel_bookings_hotel_city ON hotel_bookings(hotel_city);
CREATE INDEX idx_hotel_bookings_flight_bundle ON hotel_bookings(flight_booking_id) WHERE is_bundle = TRUE;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_hotel_bookings_updated_at
  BEFORE UPDATE ON hotel_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Table: `hotel_commission_records`

Track commission earnings from hotel bookings.

```sql
CREATE TABLE hotel_commission_records (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Booking reference
  booking_id UUID NOT NULL REFERENCES hotel_bookings(id) ON DELETE CASCADE,
  booking_reference VARCHAR(50) NOT NULL,

  -- Commission details
  commission_amount INTEGER NOT NULL, -- Commission in cents
  commission_percentage DECIMAL(5, 2) NOT NULL, -- Commission rate
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Booking details (denormalized for reporting)
  booking_total INTEGER NOT NULL, -- Total booking amount in cents
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  hotel_name VARCHAR(255),
  hotel_city VARCHAR(100),
  hotel_country VARCHAR(100),

  -- Commission status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Options: pending, earned, paid, disputed
  earned_at TIMESTAMP WITH TIME ZONE, -- When guest checked in
  paid_at TIMESTAMP WITH TIME ZONE, -- When we received payment from Duffel

  -- Payment reference
  payout_id VARCHAR(100), -- Duffel payout ID
  payout_batch_id VARCHAR(100), -- Batch payout reference

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_commission_booking_id ON hotel_commission_records(booking_id);
CREATE INDEX idx_commission_status ON hotel_commission_records(status);
CREATE INDEX idx_commission_earned_at ON hotel_commission_records(earned_at);
CREATE INDEX idx_commission_check_in ON hotel_commission_records(check_in);

-- Trigger to update updated_at
CREATE TRIGGER update_commission_updated_at
  BEFORE UPDATE ON hotel_commission_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Table: `hotel_search_logs`

Track hotel searches for analytics and ML optimization.

```sql
CREATE TABLE hotel_search_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Search parameters
  location_query TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL DEFAULT 0,
  rooms INTEGER NOT NULL DEFAULT 1,

  -- Filters applied
  min_rating INTEGER,
  max_rating INTEGER,
  min_price INTEGER, -- In cents
  max_price INTEGER, -- In cents
  currency VARCHAR(3) DEFAULT 'USD',
  amenities JSONB, -- Array of amenity filters
  property_types JSONB, -- Array of property type filters

  -- Results
  results_count INTEGER,
  results_source VARCHAR(50), -- 'Duffel Stays', 'LiteAPI', etc.

  -- User context
  user_id UUID, -- References users table
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,

  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE, -- Did user book?
  booked_hotel_id VARCHAR(100), -- Which hotel was booked
  booking_id UUID REFERENCES hotel_bookings(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_search_logs_check_in ON hotel_search_logs(check_in);
CREATE INDEX idx_search_logs_location ON hotel_search_logs(location_lat, location_lng);
CREATE INDEX idx_search_logs_user_id ON hotel_search_logs(user_id);
CREATE INDEX idx_search_logs_converted ON hotel_search_logs(converted);
CREATE INDEX idx_search_logs_created_at ON hotel_search_logs(created_at);
```

## Table: `hotel_wishlist`

Save hotels for later viewing (requires user authentication).

```sql
CREATE TABLE hotel_wishlist (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference
  user_id UUID NOT NULL, -- References users table

  -- Hotel details
  hotel_id VARCHAR(100) NOT NULL,
  hotel_name VARCHAR(255) NOT NULL,
  hotel_city VARCHAR(100),
  hotel_country VARCHAR(100),
  hotel_star_rating INTEGER,
  hotel_image_url TEXT,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one entry per user per hotel
  UNIQUE(user_id, hotel_id)
);

-- Indexes
CREATE INDEX idx_wishlist_user_id ON hotel_wishlist(user_id);
CREATE INDEX idx_wishlist_hotel_id ON hotel_wishlist(hotel_id);
```

## Helper Function: Update Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Sample Queries

### Get all bookings for a user
```sql
SELECT
  id,
  reference,
  status,
  hotel_name,
  hotel_city,
  check_in,
  check_out,
  nights,
  total_amount / 100.0 AS total_price,
  currency,
  created_at
FROM hotel_bookings
WHERE user_id = $1
  AND status != 'cancelled'
ORDER BY check_in DESC;
```

### Get upcoming reservations
```sql
SELECT *
FROM hotel_bookings
WHERE check_in >= CURRENT_DATE
  AND status IN ('confirmed', 'pending')
ORDER BY check_in ASC;
```

### Calculate total commission earned
```sql
SELECT
  COUNT(*) AS total_bookings,
  SUM(commission_amount) / 100.0 AS total_commission,
  currency
FROM hotel_commission_records
WHERE status = 'paid'
  AND earned_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY currency;
```

### Top destinations by bookings
```sql
SELECT
  hotel_city,
  hotel_country,
  COUNT(*) AS bookings,
  SUM(total_amount) / 100.0 AS total_revenue,
  AVG(total_amount) / 100.0 AS avg_booking_value
FROM hotel_bookings
WHERE status IN ('confirmed', 'completed')
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY hotel_city, hotel_country
ORDER BY bookings DESC
LIMIT 10;
```

### Search-to-booking conversion rate
```sql
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS total_searches,
  COUNT(*) FILTER (WHERE converted = TRUE) AS bookings,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE converted = TRUE) / COUNT(*),
    2
  ) AS conversion_rate
FROM hotel_search_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

## Migration Notes

1. **Initial Setup**: Run table creation scripts in order:
   - Helper function first
   - Main tables (hotel_bookings, hotel_commission_records)
   - Analytics tables (hotel_search_logs)
   - Optional tables (hotel_wishlist)

2. **Data Types**:
   - Monetary values stored as INTEGER (cents) to avoid floating-point precision issues
   - Dates stored as DATE type for easy date arithmetic
   - JSON columns for flexible nested data (guests, amenities, cancellation policies)

3. **Performance Considerations**:
   - Indexes on frequently queried columns
   - Denormalized hotel details to reduce joins
   - Partitioning recommended for hotel_search_logs if high volume

4. **Future Enhancements**:
   - Add full-text search on hotel_name, hotel_city
   - Implement soft deletes (deleted_at column)
   - Add hotel_reviews table for user reviews
   - Add hotel_price_alerts table for price drop notifications

## Integration with Existing Flight Bookings

The `flight_booking_id` field allows linking hotel bookings to flight bookings for package deals:

```sql
-- Get flight+hotel bundles for a user
SELECT
  fb.id AS flight_booking_id,
  fb.pnr AS flight_confirmation,
  hb.reference AS hotel_confirmation,
  hb.hotel_name,
  hb.bundle_discount / 100.0 AS discount,
  (fb.total_amount + hb.total_amount - hb.bundle_discount) / 100.0 AS total_package_price
FROM bookings fb
INNER JOIN hotel_bookings hb ON fb.id = hb.flight_booking_id
WHERE fb.user_email = $1
  AND hb.is_bundle = TRUE;
```
