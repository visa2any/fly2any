-- Webhook Events Table
-- Stores all webhook events received from Duffel for audit and retry purposes

CREATE TABLE IF NOT EXISTS webhook_events (
  id VARCHAR(255) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'received',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  received_at TIMESTAMP NOT NULL,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying by event type
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- Index for querying by received date
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at DESC);

-- Index for querying failed events that need retry
CREATE INDEX IF NOT EXISTS idx_webhook_events_failed ON webhook_events(status, retry_count) WHERE status = 'failed';

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_webhook_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_events_updated_at
  BEFORE UPDATE ON webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_events_updated_at();

-- Comments for documentation
COMMENT ON TABLE webhook_events IS 'Stores all webhook events received from Duffel API';
COMMENT ON COLUMN webhook_events.id IS 'Unique event ID from Duffel';
COMMENT ON COLUMN webhook_events.event_type IS 'Type of webhook event (e.g., order.created, payment.succeeded)';
COMMENT ON COLUMN webhook_events.event_data IS 'Full event payload from Duffel';
COMMENT ON COLUMN webhook_events.status IS 'Processing status: received, processing, processed, failed';
COMMENT ON COLUMN webhook_events.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN webhook_events.retry_count IS 'Number of times this event has been retried';
COMMENT ON COLUMN webhook_events.received_at IS 'When the event occurred (from Duffel)';
COMMENT ON COLUMN webhook_events.processed_at IS 'When the event was successfully processed';
