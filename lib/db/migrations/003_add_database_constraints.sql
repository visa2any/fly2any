-- =============================================
-- CRITICAL DATABASE CONSTRAINTS
-- =============================================
-- Migration: 003_add_database_constraints.sql
-- Purpose: Add data validation and integrity constraints
-- Author: Database Architect Team
-- Date: 2025-11-10
-- =============================================

-- =============================================
-- 1. EMAIL VALIDATION CONSTRAINT
-- =============================================
-- Ensures all email addresses follow proper format
-- Pattern: local-part@domain.tld
-- Allows: letters, numbers, dots, underscores, hyphens, plus signs
-- Requires: @ symbol and valid domain with 2+ character TLD

-- Add email validation to bookings table (guest_email column)
DO $$
BEGIN
  -- Check if constraint already exists before adding
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_guest_email'
    AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT valid_guest_email
    CHECK (
      guest_email IS NULL OR
      guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    );
    RAISE NOTICE 'Added valid_guest_email constraint to bookings table';
  ELSE
    RAISE NOTICE 'valid_guest_email constraint already exists on bookings table';
  END IF;
END $$;

-- Add email validation to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_user_email'
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT valid_user_email
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
    RAISE NOTICE 'Added valid_user_email constraint to users table';
  ELSE
    RAISE NOTICE 'valid_user_email constraint already exists on users table';
  END IF;
END $$;

-- Add email validation to passengers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_passenger_email'
    AND conrelid = 'passengers'::regclass
  ) THEN
    ALTER TABLE passengers
    ADD CONSTRAINT valid_passenger_email
    CHECK (
      email IS NULL OR
      email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    );
    RAISE NOTICE 'Added valid_passenger_email constraint to passengers table';
  ELSE
    RAISE NOTICE 'valid_passenger_email constraint already exists on passengers table';
  END IF;
END $$;

-- Add email validation to email_notifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_recipient_email'
    AND conrelid = 'email_notifications'::regclass
  ) THEN
    ALTER TABLE email_notifications
    ADD CONSTRAINT valid_recipient_email
    CHECK (recipient_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
    RAISE NOTICE 'Added valid_recipient_email constraint to email_notifications table';
  ELSE
    RAISE NOTICE 'valid_recipient_email constraint already exists on email_notifications table';
  END IF;
END $$;

-- =============================================
-- 2. UNIQUE SEAT ASSIGNMENTS
-- =============================================
-- Ensures no two passengers are assigned the same seat on the same flight segment
-- This prevents double-booking of seats

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_seat_per_segment'
    AND conrelid = 'seat_selections'::regclass
  ) THEN
    ALTER TABLE seat_selections
    ADD CONSTRAINT unique_seat_per_segment
    UNIQUE(flight_segment_id, seat_number);
    RAISE NOTICE 'Added unique_seat_per_segment constraint to seat_selections table';
  ELSE
    RAISE NOTICE 'unique_seat_per_segment constraint already exists on seat_selections table';
  END IF;
END $$;

-- Create index for better query performance on seat lookups
CREATE INDEX IF NOT EXISTS idx_seat_selections_segment_seat
ON seat_selections(flight_segment_id, seat_number);

-- =============================================
-- 3. VALID DATE OF BIRTH
-- =============================================
-- Ensures passenger date of birth is not in the future
-- Also adds reasonable minimum age check (not before 1900)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_passenger_dob'
    AND conrelid = 'passengers'::regclass
  ) THEN
    ALTER TABLE passengers
    ADD CONSTRAINT valid_passenger_dob
    CHECK (
      date_of_birth <= CURRENT_DATE AND
      date_of_birth >= '1900-01-01'::DATE
    );
    RAISE NOTICE 'Added valid_passenger_dob constraint to passengers table';
  ELSE
    RAISE NOTICE 'valid_passenger_dob constraint already exists on passengers table';
  END IF;
END $$;

-- Add constraint for passport expiry (must be in the future for travel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_passport_expiry'
    AND conrelid = 'passengers'::regclass
  ) THEN
    ALTER TABLE passengers
    ADD CONSTRAINT valid_passport_expiry
    CHECK (
      passport_expiry IS NULL OR
      passport_expiry > CURRENT_DATE
    );
    RAISE NOTICE 'Added valid_passport_expiry constraint to passengers table';
  ELSE
    RAISE NOTICE 'valid_passport_expiry constraint already exists on passengers table';
  END IF;
END $$;

-- =============================================
-- 4. PASSENGER COUNT VALIDATION
-- =============================================
-- Ensures valid passenger counts for flight bookings
-- Business rules:
--   - At least 1 adult required
--   - Maximum 9 adults (airline standard)
--   - Maximum 9 children
--   - Maximum 9 infants (though typically limited to number of adults)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_passenger_count'
    AND conrelid = 'flight_bookings'::regclass
  ) THEN
    ALTER TABLE flight_bookings
    ADD CONSTRAINT valid_passenger_count
    CHECK (
      adults >= 1 AND adults <= 9 AND
      children >= 0 AND children <= 9 AND
      infants >= 0 AND infants <= adults
    );
    RAISE NOTICE 'Added valid_passenger_count constraint to flight_bookings table';
  ELSE
    RAISE NOTICE 'valid_passenger_count constraint already exists on flight_bookings table';
  END IF;
END $$;

-- Add similar validation for hotel bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_hotel_guest_count'
    AND conrelid = 'hotel_bookings'::regclass
  ) THEN
    ALTER TABLE hotel_bookings
    ADD CONSTRAINT valid_hotel_guest_count
    CHECK (
      adults >= 1 AND adults <= 20 AND
      children >= 0 AND children <= 20
    );
    RAISE NOTICE 'Added valid_hotel_guest_count constraint to hotel_bookings table';
  ELSE
    RAISE NOTICE 'valid_hotel_guest_count constraint already exists on hotel_bookings table';
  END IF;
END $$;

-- =============================================
-- 5. ADDITIONAL DATA INTEGRITY CONSTRAINTS
-- =============================================

-- Ensure booking dates are logical (travel_date_from <= travel_date_to)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_booking_dates'
    AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT valid_booking_dates
    CHECK (
      travel_date_to IS NULL OR
      travel_date_from IS NULL OR
      travel_date_to >= travel_date_from
    );
    RAISE NOTICE 'Added valid_booking_dates constraint to bookings table';
  ELSE
    RAISE NOTICE 'valid_booking_dates constraint already exists on bookings table';
  END IF;
END $$;

-- Ensure flight dates are logical (return_date > departure_date for round trips)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_flight_dates'
    AND conrelid = 'flight_bookings'::regclass
  ) THEN
    ALTER TABLE flight_bookings
    ADD CONSTRAINT valid_flight_dates
    CHECK (
      return_date IS NULL OR
      return_date > departure_date
    );
    RAISE NOTICE 'Added valid_flight_dates constraint to flight_bookings table';
  ELSE
    RAISE NOTICE 'valid_flight_dates constraint already exists on flight_bookings table';
  END IF;
END $$;

-- Ensure hotel dates are logical (checkout_date > checkin_date)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_hotel_dates'
    AND conrelid = 'hotel_bookings'::regclass
  ) THEN
    ALTER TABLE hotel_bookings
    ADD CONSTRAINT valid_hotel_dates
    CHECK (checkout_date > checkin_date);
    RAISE NOTICE 'Added valid_hotel_dates constraint to hotel_bookings table';
  ELSE
    RAISE NOTICE 'valid_hotel_dates constraint already exists on hotel_bookings table';
  END IF;
END $$;

-- Ensure price alerts have valid target prices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_target_price'
    AND conrelid = 'price_alerts'::regclass
  ) THEN
    ALTER TABLE price_alerts
    ADD CONSTRAINT valid_target_price
    CHECK (
      target_price IS NULL OR
      target_price > 0
    );
    RAISE NOTICE 'Added valid_target_price constraint to price_alerts table';
  ELSE
    RAISE NOTICE 'valid_target_price constraint already exists on price_alerts table';
  END IF;
END $$;

-- Ensure flight segment sequence numbers are positive
-- (This constraint already exists in schema.sql but adding for completeness)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_segment_sequence'
    AND conrelid = 'flight_segments'::regclass
  ) THEN
    ALTER TABLE flight_segments
    ADD CONSTRAINT valid_segment_sequence
    CHECK (sequence_number > 0);
    RAISE NOTICE 'Added valid_segment_sequence constraint to flight_segments table';
  ELSE
    RAISE NOTICE 'valid_segment_sequence constraint already exists on flight_segments table';
  END IF;
END $$;

-- Ensure review ratings are within valid range (1-5 stars)
-- (This constraint already exists in schema.sql but adding for completeness)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_review_rating'
    AND conrelid = 'reviews'::regclass
  ) THEN
    ALTER TABLE reviews
    ADD CONSTRAINT valid_review_rating
    CHECK (rating >= 1 AND rating <= 5);
    RAISE NOTICE 'Added valid_review_rating constraint to reviews table';
  ELSE
    RAISE NOTICE 'valid_review_rating constraint already exists on reviews table';
  END IF;
END $$;

-- =============================================
-- 6. CONSTRAINT COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON CONSTRAINT valid_guest_email ON bookings IS
'Validates guest email format using regex pattern for standard email addresses';

COMMENT ON CONSTRAINT valid_user_email ON users IS
'Validates user email format using regex pattern for standard email addresses';

COMMENT ON CONSTRAINT valid_passenger_email ON passengers IS
'Validates passenger email format using regex pattern for standard email addresses';

COMMENT ON CONSTRAINT unique_seat_per_segment ON seat_selections IS
'Ensures no two passengers are assigned the same seat on the same flight segment';

COMMENT ON CONSTRAINT valid_passenger_dob ON passengers IS
'Ensures passenger date of birth is not in the future and not before 1900';

COMMENT ON CONSTRAINT valid_passenger_count ON flight_bookings IS
'Validates passenger counts: 1-9 adults required, 0-9 children, 0-adults infants';

COMMENT ON CONSTRAINT valid_hotel_guest_count ON hotel_bookings IS
'Validates hotel guest counts: 1-20 adults, 0-20 children';

COMMENT ON CONSTRAINT valid_booking_dates ON bookings IS
'Ensures travel_date_to is not before travel_date_from';

COMMENT ON CONSTRAINT valid_flight_dates ON flight_bookings IS
'Ensures return_date is after departure_date for round trip flights';

COMMENT ON CONSTRAINT valid_hotel_dates ON hotel_bookings IS
'Ensures checkout_date is after checkin_date';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- All constraints have been successfully added
-- Run validation queries to test:
--   SELECT conname, contype, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conrelid = 'bookings'::regclass;
