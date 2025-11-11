-- =============================================
-- SOFT DELETE SUPPORT FOR BOOKINGS
-- =============================================
-- Migration: 005_soft_delete.sql
-- Purpose: Add soft delete capability to preserve booking history
-- Author: Database Architect Team
-- Date: 2025-11-10
-- =============================================

-- =============================================
-- 1. ADD SOFT DELETE COLUMNS
-- =============================================
-- Add columns to track soft deletions

-- Add deleted_at column to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings'
    AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
    RAISE NOTICE 'Added deleted_at column to bookings table';
  ELSE
    RAISE NOTICE 'deleted_at column already exists on bookings table';
  END IF;
END $$;

-- Add deletion_reason column to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings'
    AND column_name = 'deletion_reason'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN deletion_reason TEXT DEFAULT NULL;
    RAISE NOTICE 'Added deletion_reason column to bookings table';
  ELSE
    RAISE NOTICE 'deletion_reason column already exists on bookings table';
  END IF;
END $$;

-- Add deleted_by column to track who deleted the booking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings'
    AND column_name = 'deleted_by'
  ) THEN
    ALTER TABLE bookings
    ADD COLUMN deleted_by VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Added deleted_by column to bookings table';
  ELSE
    RAISE NOTICE 'deleted_by column already exists on bookings table';
  END IF;
END $$;

-- =============================================
-- 2. ADD INDEXES FOR SOFT DELETE
-- =============================================

-- Index for filtering out soft-deleted records (most common query)
CREATE INDEX IF NOT EXISTS idx_bookings_not_deleted
ON bookings(deleted_at)
WHERE deleted_at IS NULL;

-- Index for finding soft-deleted records (admin/audit queries)
CREATE INDEX IF NOT EXISTS idx_bookings_deleted
ON bookings(deleted_at)
WHERE deleted_at IS NOT NULL;

-- Composite index for user + not deleted queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_not_deleted
ON bookings(user_id, deleted_at)
WHERE deleted_at IS NULL;

-- Composite index for guest email + not deleted queries
CREATE INDEX IF NOT EXISTS idx_bookings_email_not_deleted
ON bookings(guest_email, deleted_at)
WHERE deleted_at IS NULL;

-- Index for recently deleted bookings
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_recent
ON bookings(deleted_at DESC)
WHERE deleted_at IS NOT NULL;

-- =============================================
-- 3. SOFT DELETE FUNCTION
-- =============================================

-- Function to soft delete a booking
CREATE OR REPLACE FUNCTION soft_delete_booking(
  p_booking_id VARCHAR(255),
  p_deletion_reason TEXT DEFAULT NULL,
  p_deleted_by VARCHAR(255) DEFAULT 'system'
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  deleted_booking_id VARCHAR(255)
) AS $$
DECLARE
  v_existing_deleted_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if booking exists and get current deletion status
  SELECT deleted_at INTO v_existing_deleted_at
  FROM bookings
  WHERE id = p_booking_id;

  -- If booking doesn't exist
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Booking not found'::TEXT, NULL::VARCHAR(255);
    RETURN;
  END IF;

  -- If already soft deleted
  IF v_existing_deleted_at IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'Booking already deleted'::TEXT, p_booking_id;
    RETURN;
  END IF;

  -- Perform soft delete
  UPDATE bookings
  SET
    deleted_at = NOW(),
    deletion_reason = p_deletion_reason,
    deleted_by = p_deleted_by,
    updated_at = NOW()
  WHERE id = p_booking_id
  AND deleted_at IS NULL; -- Extra safety check

  -- Return success
  RETURN QUERY SELECT TRUE, 'Booking soft deleted successfully'::TEXT, p_booking_id;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 4. RESTORE FUNCTION
-- =============================================

-- Function to restore a soft-deleted booking
CREATE OR REPLACE FUNCTION restore_booking(
  p_booking_id VARCHAR(255),
  p_restored_by VARCHAR(255) DEFAULT 'system'
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  restored_booking_id VARCHAR(255)
) AS $$
DECLARE
  v_existing_deleted_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if booking exists and get current deletion status
  SELECT deleted_at INTO v_existing_deleted_at
  FROM bookings
  WHERE id = p_booking_id;

  -- If booking doesn't exist
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Booking not found'::TEXT, NULL::VARCHAR(255);
    RETURN;
  END IF;

  -- If not soft deleted
  IF v_existing_deleted_at IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Booking is not deleted'::TEXT, p_booking_id;
    RETURN;
  END IF;

  -- Perform restore
  UPDATE bookings
  SET
    deleted_at = NULL,
    deletion_reason = NULL,
    deleted_by = NULL,
    updated_at = NOW()
  WHERE id = p_booking_id
  AND deleted_at IS NOT NULL; -- Extra safety check

  -- Return success
  RETURN QUERY SELECT TRUE, 'Booking restored successfully'::TEXT, p_booking_id;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 5. PERMANENT DELETE FUNCTION
-- =============================================

-- Function to permanently delete soft-deleted bookings
-- (Should only be used for data cleanup/GDPR compliance)
CREATE OR REPLACE FUNCTION permanently_delete_booking(
  p_booking_id VARCHAR(255),
  p_confirmation_code VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_booking_reference VARCHAR(100);
  v_deleted_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get booking details
  SELECT booking_reference, deleted_at
  INTO v_booking_reference, v_deleted_at
  FROM bookings
  WHERE id = p_booking_id;

  -- If booking doesn't exist
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Booking not found'::TEXT;
    RETURN;
  END IF;

  -- Safety check: booking must be soft-deleted first
  IF v_deleted_at IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Booking must be soft-deleted before permanent deletion'::TEXT;
    RETURN;
  END IF;

  -- Safety check: booking must be deleted for at least 30 days
  IF v_deleted_at > NOW() - INTERVAL '30 days' THEN
    RETURN QUERY SELECT FALSE, 'Booking must be soft-deleted for at least 30 days before permanent deletion'::TEXT;
    RETURN;
  END IF;

  -- Safety check: require confirmation code (last 5 chars of booking_reference)
  IF p_confirmation_code IS NULL OR p_confirmation_code != RIGHT(v_booking_reference, 5) THEN
    RETURN QUERY SELECT FALSE, 'Invalid confirmation code. Provide last 5 characters of booking reference.'::TEXT;
    RETURN;
  END IF;

  -- Permanently delete the booking
  -- Note: Related records in other tables will be cascade deleted
  DELETE FROM bookings WHERE id = p_booking_id;

  -- Return success
  RETURN QUERY SELECT TRUE, 'Booking permanently deleted'::TEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. SOFT DELETE TRIGGER FOR AUDIT LOG
-- =============================================

-- Trigger function to log soft deletes to audit log
CREATE OR REPLACE FUNCTION log_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if deleted_at changed from NULL to a value
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    INSERT INTO booking_audit_log (
      booking_id,
      action,
      changed_fields,
      old_data,
      new_data,
      changed_by,
      change_reason
    ) VALUES (
      NEW.id,
      'SOFT_DELETE',
      jsonb_build_object(
        'deleted_at', jsonb_build_object('old', NULL, 'new', NEW.deleted_at),
        'deletion_reason', jsonb_build_object('old', NULL, 'new', NEW.deletion_reason)
      ),
      row_to_json(OLD)::JSONB,
      row_to_json(NEW)::JSONB,
      COALESCE(NEW.deleted_by, 'system'),
      NEW.deletion_reason
    );
  -- Log restore if deleted_at changed from value to NULL
  ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    INSERT INTO booking_audit_log (
      booking_id,
      action,
      changed_fields,
      old_data,
      new_data,
      changed_by,
      change_reason
    ) VALUES (
      NEW.id,
      'RESTORE',
      jsonb_build_object(
        'deleted_at', jsonb_build_object('old', OLD.deleted_at, 'new', NULL),
        'deletion_reason', jsonb_build_object('old', OLD.deletion_reason, 'new', NULL)
      ),
      row_to_json(OLD)::JSONB,
      row_to_json(NEW)::JSONB,
      COALESCE(current_setting('app.current_user', TRUE), 'system'),
      'Booking restored'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to bookings table
DROP TRIGGER IF EXISTS trigger_log_soft_delete ON bookings;

CREATE TRIGGER trigger_log_soft_delete
  AFTER UPDATE ON bookings
  FOR EACH ROW
  WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
  EXECUTE FUNCTION log_soft_delete();

-- =============================================
-- 7. VIEWS FOR ACTIVE AND DELETED BOOKINGS
-- =============================================

-- View: Active bookings (not soft-deleted)
CREATE OR REPLACE VIEW v_active_bookings AS
SELECT *
FROM bookings
WHERE deleted_at IS NULL;

-- View: Deleted bookings (soft-deleted)
CREATE OR REPLACE VIEW v_deleted_bookings AS
SELECT
  id,
  booking_reference,
  booking_type,
  status,
  guest_email,
  guest_first_name,
  guest_last_name,
  total_amount,
  currency,
  deleted_at,
  deletion_reason,
  deleted_by,
  created_at
FROM bookings
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- View: Bookings eligible for permanent deletion (soft-deleted > 30 days)
CREATE OR REPLACE VIEW v_bookings_eligible_for_permanent_deletion AS
SELECT
  id,
  booking_reference,
  booking_type,
  guest_email,
  deleted_at,
  deletion_reason,
  deleted_by,
  NOW() - deleted_at AS deleted_duration
FROM bookings
WHERE deleted_at IS NOT NULL
  AND deleted_at <= NOW() - INTERVAL '30 days'
ORDER BY deleted_at ASC;

-- =============================================
-- 8. HELPER FUNCTIONS
-- =============================================

-- Function: Get soft delete statistics
CREATE OR REPLACE FUNCTION get_soft_delete_statistics()
RETURNS TABLE (
  total_bookings BIGINT,
  active_bookings BIGINT,
  deleted_bookings BIGINT,
  deletion_rate NUMERIC(5, 2),
  eligible_for_permanent_deletion BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_bookings,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) AS active_bookings,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS deleted_bookings,
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) / NULLIF(COUNT(*), 0),
      2
    ) AS deletion_rate,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL AND deleted_at <= NOW() - INTERVAL '30 days') AS eligible_for_permanent_deletion
  FROM bookings;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Bulk soft delete old cancelled bookings
CREATE OR REPLACE FUNCTION bulk_soft_delete_old_cancelled_bookings(
  p_days_old INTEGER DEFAULT 365,
  p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
  affected_count INTEGER,
  sample_booking_ids TEXT[]
) AS $$
DECLARE
  v_booking_ids VARCHAR(255)[];
  v_count INTEGER;
BEGIN
  -- Find cancelled bookings older than specified days
  SELECT ARRAY_AGG(id)
  INTO v_booking_ids
  FROM bookings
  WHERE status = 'cancelled'
    AND cancelled_at IS NOT NULL
    AND cancelled_at <= NOW() - (p_days_old || ' days')::INTERVAL
    AND deleted_at IS NULL;

  v_count := COALESCE(array_length(v_booking_ids, 1), 0);

  IF NOT p_dry_run AND v_count > 0 THEN
    -- Actually perform soft delete
    UPDATE bookings
    SET
      deleted_at = NOW(),
      deletion_reason = 'Automated cleanup: Cancelled booking older than ' || p_days_old || ' days',
      deleted_by = 'system:cleanup'
    WHERE id = ANY(v_booking_ids);
  END IF;

  -- Return results
  RETURN QUERY
  SELECT
    v_count,
    v_booking_ids[1:LEAST(10, v_count)]; -- Return first 10 IDs as sample
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. COLUMN COMMENTS
-- =============================================

COMMENT ON COLUMN bookings.deleted_at IS
'Timestamp when booking was soft deleted. NULL means active, non-NULL means deleted.';

COMMENT ON COLUMN bookings.deletion_reason IS
'Human-readable reason for deletion (e.g., "Customer request", "Duplicate booking", "GDPR compliance")';

COMMENT ON COLUMN bookings.deleted_by IS
'Identifier of who deleted the booking: user:[id], admin:[email], or system:[reason]';

COMMENT ON VIEW v_active_bookings IS
'View of all active (non-deleted) bookings. Use this instead of raw bookings table in queries.';

COMMENT ON VIEW v_deleted_bookings IS
'View of all soft-deleted bookings for admin/audit purposes.';

COMMENT ON VIEW v_bookings_eligible_for_permanent_deletion IS
'Bookings that have been soft-deleted for 30+ days and can be permanently removed.';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Soft delete system is now active
--
-- Usage examples:
--   -- Soft delete a booking
--   SELECT * FROM soft_delete_booking('booking_1234567890_abc123', 'Customer requested deletion', 'admin:john@example.com');
--
--   -- Restore a booking
--   SELECT * FROM restore_booking('booking_1234567890_abc123', 'admin:john@example.com');
--
--   -- Query active bookings only (recommended)
--   SELECT * FROM v_active_bookings WHERE guest_email = 'user@example.com';
--
--   -- OR add WHERE clause to filter deleted
--   SELECT * FROM bookings WHERE guest_email = 'user@example.com' AND deleted_at IS NULL;
--
--   -- View deleted bookings
--   SELECT * FROM v_deleted_bookings ORDER BY deleted_at DESC;
--
--   -- Check deletion statistics
--   SELECT * FROM get_soft_delete_statistics();
--
--   -- Bulk cleanup (dry run first)
--   SELECT * FROM bulk_soft_delete_old_cancelled_bookings(365, TRUE);
--
--   -- Permanently delete (CAUTION!)
--   SELECT * FROM permanently_delete_booking('booking_1234567890_abc123', 'ABC123');
