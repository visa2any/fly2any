-- =====================================================
-- AI Analytics & Conversion Tracking Schema
-- =====================================================
--
-- This schema supports comprehensive tracking of AI assistant
-- interactions, conversions, and user engagement metrics.
--
-- Features:
-- - Privacy-compliant (no PII)
-- - Optimized indexes for fast queries
-- - Support for all event types
-- - Flexible metadata storage
--
-- Run this script in your PostgreSQL database:
-- psql $POSTGRES_URL -f docs/ai_analytics_schema.sql
--

-- =====================================================
-- Main Analytics Events Table
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_analytics_events (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event identification
  event_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User context (privacy-compliant - no PII)
  user_id UUID,
  is_authenticated BOOLEAN NOT NULL DEFAULT false,
  user_fingerprint VARCHAR(32), -- MD5 hash of user agent + accept headers

  -- Message tracking
  message_role VARCHAR(20), -- 'user' or 'assistant'
  message_length INTEGER,
  consultant_team VARCHAR(50),
  consultant_name VARCHAR(100),

  -- Flight search tracking
  flight_search_query TEXT,
  origin VARCHAR(10), -- Airport code
  destination VARCHAR(10), -- Airport code
  results_count INTEGER,
  search_duration INTEGER, -- milliseconds

  -- Auth prompt tracking
  auth_prompt_stage VARCHAR(50), -- 'first_interaction', 'search_performed', etc.
  auth_prompt_action VARCHAR(20), -- 'signup', 'login', 'dismiss'

  -- Conversion tracking
  conversion_type VARCHAR(20), -- 'signup', 'login', 'booking'
  conversion_value DECIMAL(10, 2), -- USD value of conversion

  -- Session engagement
  session_duration INTEGER, -- seconds
  message_count INTEGER,
  engagement_score DECIMAL(3, 1), -- 0-10 score

  -- Flight selection
  flight_id VARCHAR(100),
  flight_price DECIMAL(10, 2),

  -- Geo context (aggregate only - no precise location)
  country VARCHAR(2), -- ISO country code
  timezone VARCHAR(50) -- IANA timezone
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Event type filtering (most common query)
CREATE INDEX IF NOT EXISTS idx_ai_analytics_event_type
  ON ai_analytics_events(event_type);

-- Session-based queries
CREATE INDEX IF NOT EXISTS idx_ai_analytics_session_id
  ON ai_analytics_events(session_id);

-- Time-based filtering (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_ai_analytics_timestamp
  ON ai_analytics_events(timestamp DESC);

-- Consultant performance queries
CREATE INDEX IF NOT EXISTS idx_ai_analytics_consultant
  ON ai_analytics_events(consultant_team, consultant_name)
  WHERE consultant_team IS NOT NULL;

-- Conversion tracking queries
CREATE INDEX IF NOT EXISTS idx_ai_analytics_conversion
  ON ai_analytics_events(conversion_type, timestamp)
  WHERE conversion_type IS NOT NULL;

-- Flight search queries
CREATE INDEX IF NOT EXISTS idx_ai_analytics_flight_search
  ON ai_analytics_events(origin, destination, timestamp)
  WHERE origin IS NOT NULL AND destination IS NOT NULL;

-- User queries (if tracking authenticated users)
CREATE INDEX IF NOT EXISTS idx_ai_analytics_user_id
  ON ai_analytics_events(user_id, timestamp)
  WHERE user_id IS NOT NULL;

-- Composite index for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_ai_analytics_dashboard
  ON ai_analytics_events(event_type, timestamp DESC);

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE ai_analytics_events IS
  'AI Assistant analytics events for tracking interactions, conversions, and engagement';

COMMENT ON COLUMN ai_analytics_events.event_type IS
  'Type of event: chat_opened, chat_closed, message_sent, consultant_routed, flight_search_performed, auth_prompt_shown, auth_prompt_clicked, conversion_signup, conversion_login, conversion_booking, session_engaged, flight_selected';

COMMENT ON COLUMN ai_analytics_events.session_id IS
  'Anonymized session identifier (does not contain PII)';

COMMENT ON COLUMN ai_analytics_events.user_fingerprint IS
  'MD5 hash of browser characteristics (user agent + accept headers) for deduplication';

COMMENT ON COLUMN ai_analytics_events.engagement_score IS
  'Calculated engagement score (0-10) based on messages, duration, and interaction intensity';

-- =====================================================
-- Sample Queries
-- =====================================================

-- Get total conversations in last 7 days
-- SELECT
--   COUNT(DISTINCT session_id) as total_conversations
-- FROM ai_analytics_events
-- WHERE timestamp >= NOW() - INTERVAL '7 days';

-- Get consultant performance
-- SELECT
--   consultant_team,
--   consultant_name,
--   COUNT(*) as message_count,
--   ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
-- FROM ai_analytics_events
-- WHERE event_type = 'consultant_routed'
--   AND timestamp >= NOW() - INTERVAL '7 days'
-- GROUP BY consultant_team, consultant_name
-- ORDER BY message_count DESC;

-- Get auth prompt effectiveness
-- SELECT
--   auth_prompt_stage,
--   COUNT(*) FILTER (WHERE event_type = 'auth_prompt_shown') as shown,
--   COUNT(*) FILTER (WHERE event_type = 'auth_prompt_clicked') as clicked,
--   ROUND(
--     COUNT(*) FILTER (WHERE event_type = 'auth_prompt_clicked') * 100.0 /
--     NULLIF(COUNT(*) FILTER (WHERE event_type = 'auth_prompt_shown'), 0),
--     1
--   ) as ctr
-- FROM ai_analytics_events
-- WHERE timestamp >= NOW() - INTERVAL '7 days'
--   AND auth_prompt_stage IS NOT NULL
-- GROUP BY auth_prompt_stage;

-- Get popular routes
-- SELECT
--   CONCAT(origin, '-', destination) as route,
--   COUNT(*) as searches
-- FROM ai_analytics_events
-- WHERE event_type = 'flight_search_performed'
--   AND timestamp >= NOW() - INTERVAL '7 days'
--   AND origin IS NOT NULL
--   AND destination IS NOT NULL
-- GROUP BY origin, destination
-- ORDER BY searches DESC
-- LIMIT 10;

-- =====================================================
-- Data Retention Policy (Optional)
-- =====================================================

-- Automatically delete events older than 90 days
-- Uncomment and schedule as a cron job or use pg_cron extension

-- CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- SELECT cron.schedule(
--   'cleanup-old-ai-analytics',
--   '0 2 * * *', -- Run at 2 AM daily
--   $$DELETE FROM ai_analytics_events WHERE timestamp < NOW() - INTERVAL '90 days'$$
-- );

-- =====================================================
-- Materialized View for Dashboard (Optional)
-- =====================================================
-- For high-traffic sites, create a materialized view
-- that pre-aggregates common metrics

-- CREATE MATERIALIZED VIEW IF NOT EXISTS ai_analytics_daily_summary AS
-- SELECT
--   DATE(timestamp) as date,
--   COUNT(DISTINCT session_id) as total_conversations,
--   COUNT(*) FILTER (WHERE event_type = 'message_sent') as total_messages,
--   COUNT(*) FILTER (WHERE event_type = 'flight_search_performed') as total_searches,
--   COUNT(*) FILTER (WHERE event_type = 'conversion_signup') as total_signups,
--   COUNT(*) FILTER (WHERE event_type = 'conversion_login') as total_logins,
--   COUNT(*) FILTER (WHERE event_type = 'conversion_booking') as total_bookings,
--   AVG(engagement_score) FILTER (WHERE engagement_score IS NOT NULL) as avg_engagement_score
-- FROM ai_analytics_events
-- GROUP BY DATE(timestamp)
-- ORDER BY date DESC;
--
-- CREATE UNIQUE INDEX ON ai_analytics_daily_summary(date);
--
-- -- Refresh daily at 1 AM
-- SELECT cron.schedule(
--   'refresh-ai-analytics-summary',
--   '0 1 * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY ai_analytics_daily_summary'
-- );

-- =====================================================
-- Privacy Compliance
-- =====================================================

-- Function to export user data (GDPR compliance)
-- CREATE OR REPLACE FUNCTION export_user_analytics(p_user_id UUID)
-- RETURNS TABLE (
--   event_timestamp TIMESTAMPTZ,
--   event_type VARCHAR,
--   session_id VARCHAR
-- ) AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT timestamp, event_type, session_id
--   FROM ai_analytics_events
--   WHERE user_id = p_user_id
--   ORDER BY timestamp DESC;
-- END;
-- $$ LANGUAGE plpgsql;

-- Function to delete user data (GDPR right to erasure)
-- CREATE OR REPLACE FUNCTION delete_user_analytics(p_user_id UUID)
-- RETURNS INTEGER AS $$
-- DECLARE
--   deleted_count INTEGER;
-- BEGIN
--   DELETE FROM ai_analytics_events
--   WHERE user_id = p_user_id;
--
--   GET DIAGNOSTICS deleted_count = ROW_COUNT;
--   RETURN deleted_count;
-- END;
-- $$ LANGUAGE plpgsql;

-- =====================================================
-- Verify Installation
-- =====================================================

-- Run this to verify the schema was created successfully:
-- SELECT
--   table_name,
--   (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ai_analytics_events') as column_count,
--   (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'ai_analytics_events') as index_count
-- FROM information_schema.tables
-- WHERE table_name = 'ai_analytics_events';

-- Expected output:
-- table_name            | column_count | index_count
-- ---------------------+--------------+-------------
-- ai_analytics_events  |     25       |     8

-- =====================================================
-- Success!
-- =====================================================
-- Schema creation complete.
-- Next steps:
-- 1. Verify installation with query above
-- 2. Configure data retention policy
-- 3. Test with sample events
-- 4. Access dashboard at /admin/ai-analytics
-- =====================================================
