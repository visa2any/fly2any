-- =============================================
-- BOOKING AUDIT LOG SYSTEM
-- =============================================
-- Migration: 004_audit_log.sql
-- Purpose: Track all changes to bookings for compliance and debugging
-- Author: Database Architect Team
-- Date: 2025-11-10
-- =============================================

-- =============================================
-- 1. AUDIT LOG TABLE
-- =============================================
-- Tracks all changes to booking records
-- Stores: who changed what, when, and what the changes were

CREATE TABLE IF NOT EXISTS booking_audit_log (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reference to the booking
  booking_id VARCHAR(255) NOT NULL,
  -- Note: Not using REFERENCES bookings(id) to preserve audit trail even if booking is deleted

  -- Action type
  action VARCHAR(20) NOT NULL,
  -- Possible values: 'INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PAYMENT_UPDATE', 'CANCELLATION'

  -- What changed
  changed_fields JSONB,
  -- Format: {"field_name": {"old": "value", "new": "value"}}
  -- Example: {"status": {"old": "pending", "new": "confirmed"}, "payment_status": {"old": "pending", "new": "paid"}}

  -- Old and new complete row data (for full audit trail)
  old_data JSONB,
  new_data JSONB,

  -- Who made the change
  changed_by VARCHAR(255),
  -- Format: "user:[user_id]" or "system:api" or "admin:[admin_email]"

  -- Additional context
  change_reason TEXT,
  -- Optional: reason for the change (e.g., "Customer request", "Payment failed", "System auto-cancellation")

  ip_address VARCHAR(45),
  -- IP address of the user/system that made the change

  user_agent TEXT,
  -- Browser/client information

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_audit_action CHECK (
    action IN ('INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PAYMENT_UPDATE', 'CANCELLATION', 'SOFT_DELETE', 'RESTORE')
  )
);

-- =============================================
-- 2. INDEXES FOR AUDIT LOG
-- =============================================

-- Index for looking up all changes to a specific booking
CREATE INDEX IF NOT EXISTS idx_audit_log_booking_id
ON booking_audit_log(booking_id);

-- Index for filtering by action type
CREATE INDEX IF NOT EXISTS idx_audit_log_action
ON booking_audit_log(action);

-- Index for time-based queries (most recent changes)
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
ON booking_audit_log(created_at DESC);

-- Index for user activity tracking
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by
ON booking_audit_log(changed_by);

-- Composite index for booking + time queries
CREATE INDEX IF NOT EXISTS idx_audit_log_booking_time
ON booking_audit_log(booking_id, created_at DESC);

-- JSONB GIN index for searching within changed_fields
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_fields
ON booking_audit_log USING gin(changed_fields);

-- =============================================
-- 3. AUDIT TRIGGER FUNCTION
-- =============================================
-- Automatically logs all changes to the bookings table

CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields_json JSONB := '{}'::JSONB;
  field_name TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  -- Determine action type
  IF (TG_OP = 'INSERT') THEN
    -- Log new booking creation
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
      'INSERT',
      NULL, -- No changed fields for INSERT
      NULL, -- No old data
      row_to_json(NEW)::JSONB,
      COALESCE(NEW.user_id::TEXT, 'guest'),
      'New booking created'
    );
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    -- Build changed_fields JSON by comparing OLD and NEW
    -- Check critical fields for changes

    -- Status change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      changed_fields_json := changed_fields_json || jsonb_build_object(
        'status',
        jsonb_build_object('old', OLD.status, 'new', NEW.status)
      );
    END IF;

    -- Payment status change
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
      changed_fields_json := changed_fields_json || jsonb_build_object(
        'payment_status',
        jsonb_build_object('old', OLD.payment_status, 'new', NEW.payment_status)
      );
    END IF;

    -- Total amount change
    IF OLD.total_amount IS DISTINCT FROM NEW.total_amount THEN
      changed_fields_json := changed_fields_json || jsonb_build_object(
        'total_amount',
        jsonb_build_object('old', OLD.total_amount, 'new', NEW.total_amount)
      );
    END IF;

    -- Guest email change
    IF OLD.guest_email IS DISTINCT FROM NEW.guest_email THEN
      changed_fields_json := changed_fields_json || jsonb_build_object(
        'guest_email',
        jsonb_build_object('old', OLD.guest_email, 'new', NEW.guest_email)
      );
    END IF;

    -- Booking reference change
    IF OLD.booking_reference IS DISTINCT FROM NEW.booking_reference THEN
      changed_fields_json := changed_fields_json || jsonb_build_object(
        'booking_reference',
        jsonb_build_object('old', OLD.booking_reference, 'new', NEW.booking_reference)
      );
    END IF;

    -- Provider booking ID change
    IF OLD.provider_booking_id IS DISTINCT FROM NEW.provider_booking_id THEN
      changed_fields_json := changed_fields_json || jsonb_build_object(
        'provider_booking_id',
        jsonb_build_object('old', OLD.provider_booking_id, 'new', NEW.provider_booking_id)
      );
    END IF;

    -- Cancellation
    IF OLD.cancelled_at IS NULL AND NEW.cancelled_at IS NOT NULL THEN
      changed_fields_json := changed_fields_json || jsonb_build_object(
        'cancelled_at',
        jsonb_build_object('old', NULL, 'new', NEW.cancelled_at),
        'cancellation_reason',
        jsonb_build_object('old', NULL, 'new', NEW.cancellation_reason)
      );
    END IF;

    -- Determine specific action type
    DECLARE
      action_type VARCHAR(20) := 'UPDATE';
    BEGIN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        action_type := 'STATUS_CHANGE';
      ELSIF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        action_type := 'PAYMENT_UPDATE';
      ELSIF OLD.cancelled_at IS NULL AND NEW.cancelled_at IS NOT NULL THEN
        action_type := 'CANCELLATION';
      END IF;

      -- Log the update
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
        action_type,
        CASE WHEN changed_fields_json = '{}'::JSONB THEN NULL ELSE changed_fields_json END,
        row_to_json(OLD)::JSONB,
        row_to_json(NEW)::JSONB,
        COALESCE(NEW.user_id::TEXT, 'system'),
        CASE
          WHEN action_type = 'CANCELLATION' THEN NEW.cancellation_reason
          ELSE NULL
        END
      );
    END;

    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    -- Log deletion
    INSERT INTO booking_audit_log (
      booking_id,
      action,
      changed_fields,
      old_data,
      new_data,
      changed_by,
      change_reason
    ) VALUES (
      OLD.id,
      'DELETE',
      NULL,
      row_to_json(OLD)::JSONB,
      NULL,
      COALESCE(OLD.user_id::TEXT, 'system'),
      'Booking permanently deleted'
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. ATTACH TRIGGER TO BOOKINGS TABLE
-- =============================================

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_log_booking_changes ON bookings;

-- Create trigger for INSERT, UPDATE, and DELETE operations
CREATE TRIGGER trigger_log_booking_changes
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION log_booking_changes();

-- =============================================
-- 5. HELPER FUNCTIONS FOR AUDIT LOG
-- =============================================

-- Function: Get audit history for a booking
CREATE OR REPLACE FUNCTION get_booking_audit_history(p_booking_id VARCHAR(255))
RETURNS TABLE (
  id UUID,
  action VARCHAR(20),
  changed_fields JSONB,
  changed_by VARCHAR(255),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bal.id,
    bal.action,
    bal.changed_fields,
    bal.changed_by,
    bal.change_reason,
    bal.created_at
  FROM booking_audit_log bal
  WHERE bal.booking_id = p_booking_id
  ORDER BY bal.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get recent changes by user
CREATE OR REPLACE FUNCTION get_user_audit_activity(
  p_user_identifier VARCHAR(255),
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  booking_id VARCHAR(255),
  action VARCHAR(20),
  changed_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bal.booking_id,
    bal.action,
    bal.changed_fields,
    bal.created_at
  FROM booking_audit_log bal
  WHERE bal.changed_by = p_user_identifier
  ORDER BY bal.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get statistics for audit log
CREATE OR REPLACE FUNCTION get_audit_statistics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  action VARCHAR(20),
  count BIGINT,
  unique_bookings BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bal.action,
    COUNT(*) AS count,
    COUNT(DISTINCT bal.booking_id) AS unique_bookings,
    COUNT(DISTINCT bal.changed_by) AS unique_users
  FROM booking_audit_log bal
  WHERE bal.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY bal.action
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- 6. VIEWS FOR COMMON AUDIT QUERIES
-- =============================================

-- View: Recent booking changes (last 24 hours)
CREATE OR REPLACE VIEW v_recent_booking_changes AS
SELECT
  bal.booking_id,
  b.booking_reference,
  bal.action,
  bal.changed_fields,
  bal.changed_by,
  bal.created_at
FROM booking_audit_log bal
LEFT JOIN bookings b ON b.id = bal.booking_id
WHERE bal.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY bal.created_at DESC;

-- View: Booking lifecycle summary
CREATE OR REPLACE VIEW v_booking_lifecycle AS
SELECT
  bal.booking_id,
  MIN(CASE WHEN bal.action = 'INSERT' THEN bal.created_at END) AS created_at,
  MAX(CASE WHEN bal.action = 'STATUS_CHANGE' AND bal.changed_fields->>'status' LIKE '%"new":"confirmed"%' THEN bal.created_at END) AS confirmed_at,
  MAX(CASE WHEN bal.action = 'PAYMENT_UPDATE' AND bal.changed_fields->>'payment_status' LIKE '%"new":"paid"%' THEN bal.created_at END) AS paid_at,
  MAX(CASE WHEN bal.action = 'CANCELLATION' THEN bal.created_at END) AS cancelled_at,
  COUNT(*) AS total_changes
FROM booking_audit_log bal
GROUP BY bal.booking_id;

-- =============================================
-- 7. TABLE AND COLUMN COMMENTS
-- =============================================

COMMENT ON TABLE booking_audit_log IS
'Audit trail for all changes to bookings. Automatically populated by trigger on bookings table.';

COMMENT ON COLUMN booking_audit_log.booking_id IS
'Reference to booking ID. Not a foreign key to preserve audit trail even after booking deletion.';

COMMENT ON COLUMN booking_audit_log.action IS
'Type of change: INSERT, UPDATE, DELETE, STATUS_CHANGE, PAYMENT_UPDATE, CANCELLATION, SOFT_DELETE, RESTORE';

COMMENT ON COLUMN booking_audit_log.changed_fields IS
'JSONB object showing what changed: {"field": {"old": "val1", "new": "val2"}}';

COMMENT ON COLUMN booking_audit_log.old_data IS
'Complete snapshot of booking data before change (JSONB)';

COMMENT ON COLUMN booking_audit_log.new_data IS
'Complete snapshot of booking data after change (JSONB)';

COMMENT ON COLUMN booking_audit_log.changed_by IS
'Identifier of who made the change: user:[id], admin:[email], or system:api';

COMMENT ON COLUMN booking_audit_log.change_reason IS
'Optional human-readable reason for the change';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Audit log system is now active
-- All booking changes will be automatically logged
--
-- Usage examples:
--   SELECT * FROM get_booking_audit_history('booking_1234567890_abc123');
--   SELECT * FROM get_user_audit_activity('user:550e8400-e29b-41d4-a716-446655440000');
--   SELECT * FROM get_audit_statistics();
--   SELECT * FROM v_recent_booking_changes LIMIT 20;
