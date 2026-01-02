-- ============================================
-- Quote Workspace Tables - Production Grade
-- Version: 1.0.0
-- Created: 2026-01-02
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- QUOTES TABLE - Main quote storage
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Agent relationship (user who created the quote)
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Client relationship (optional - linked client)
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Quote status lifecycle
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'expired', 'declined', 'archived')),

  -- Trip details
  trip_name VARCHAR(255),
  destination VARCHAR(255),
  start_date DATE,
  end_date DATE,

  -- Travelers breakdown (JSONB for flexibility)
  travelers JSONB NOT NULL DEFAULT '{"adults": 1, "children": 0, "infants": 0, "total": 1}',

  -- Quote items (flights, hotels, activities, etc.)
  items JSONB NOT NULL DEFAULT '[]',

  -- Pricing structure
  pricing JSONB NOT NULL DEFAULT '{
    "subtotal": 0,
    "markupPercent": 15,
    "markupAmount": 0,
    "taxes": 0,
    "fees": 0,
    "discount": 0,
    "total": 0,
    "perPerson": 0,
    "currency": "USD"
  }',

  -- Client data snapshot (denormalized for quote PDF generation)
  client_data JSONB,

  -- Versioning for optimistic locking
  version INTEGER NOT NULL DEFAULT 1,

  -- Audit trail timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Soft delete support
  deleted_at TIMESTAMPTZ,

  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(trip_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(destination, '')), 'B')
  ) STORED
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Agent lookup (most common query)
CREATE INDEX IF NOT EXISTS idx_quotes_agent_id ON quotes(agent_id);
CREATE INDEX IF NOT EXISTS idx_quotes_agent_status ON quotes(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_agent_updated ON quotes(agent_id, updated_at DESC);

-- Client lookup
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id) WHERE client_id IS NOT NULL;

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_quotes_dates ON quotes(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_quotes_search ON quotes USING GIN(search_vector);

-- Soft delete filtering
CREATE INDEX IF NOT EXISTS idx_quotes_active ON quotes(agent_id, status) WHERE deleted_at IS NULL;

-- ============================================
-- QUOTE HISTORY TABLE - Audit Trail
-- ============================================
CREATE TABLE IF NOT EXISTS quote_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES auth.users(id),

  -- What changed
  action VARCHAR(50) NOT NULL,  -- 'created', 'updated', 'status_changed', 'sent', 'viewed', 'accepted', 'declined'

  -- Before/after snapshots
  previous_data JSONB,
  new_data JSONB,

  -- Change details
  changed_fields TEXT[],

  -- Metadata
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_history_quote_id ON quote_history(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_history_created ON quote_history(created_at DESC);

-- ============================================
-- QUOTE TEMPLATES TABLE - Reusable Templates
-- ============================================
CREATE TABLE IF NOT EXISTS quote_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Template content (partial quote data)
  template_data JSONB NOT NULL DEFAULT '{}',

  -- Categorization
  category VARCHAR(100),
  tags TEXT[],

  -- Usage tracking
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_templates_agent ON quote_templates(agent_id);
CREATE INDEX IF NOT EXISTS idx_quote_templates_category ON quote_templates(agent_id, category);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;

-- Quotes: Agents can only access their own quotes
CREATE POLICY "Agents can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert own quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update own quotes" ON quotes
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete own quotes" ON quotes
  FOR DELETE USING (auth.uid() = agent_id);

-- Quote History: Agents can view history of their quotes
CREATE POLICY "Agents can view own quote history" ON quote_history
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "System can insert quote history" ON quote_history
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- Quote Templates: Agents can manage their templates
CREATE POLICY "Agents can manage own templates" ON quote_templates
  FOR ALL USING (auth.uid() = agent_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER quote_templates_updated_at
  BEFORE UPDATE ON quote_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-increment version on update
CREATE OR REPLACE FUNCTION increment_quote_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_version_increment
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION increment_quote_version();

-- Auto-create history entry on quote changes
CREATE OR REPLACE FUNCTION log_quote_change()
RETURNS TRIGGER AS $$
DECLARE
  changed TEXT[] := '{}';
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    INSERT INTO quote_history (quote_id, agent_id, action, new_data, changed_fields)
    VALUES (NEW.id, NEW.agent_id, 'created', to_jsonb(NEW), ARRAY['all']);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Track changed fields
    IF OLD.status != NEW.status THEN changed := array_append(changed, 'status'); END IF;
    IF OLD.trip_name != NEW.trip_name THEN changed := array_append(changed, 'trip_name'); END IF;
    IF OLD.destination != NEW.destination THEN changed := array_append(changed, 'destination'); END IF;
    IF OLD.items::text != NEW.items::text THEN changed := array_append(changed, 'items'); END IF;
    IF OLD.pricing::text != NEW.pricing::text THEN changed := array_append(changed, 'pricing'); END IF;
    IF OLD.client_id != NEW.client_id THEN changed := array_append(changed, 'client_id'); END IF;

    -- Only log if something meaningful changed
    IF array_length(changed, 1) > 0 THEN
      INSERT INTO quote_history (quote_id, agent_id, action, previous_data, new_data, changed_fields)
      VALUES (
        NEW.id,
        NEW.agent_id,
        CASE
          WHEN 'status' = ANY(changed) THEN 'status_changed'
          ELSE 'updated'
        END,
        to_jsonb(OLD),
        to_jsonb(NEW),
        changed
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_audit_log
  AFTER INSERT OR UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION log_quote_change();

-- ============================================
-- COMMENTS for Documentation
-- ============================================
COMMENT ON TABLE quotes IS 'Main quotes table storing travel quote data for agents';
COMMENT ON TABLE quote_history IS 'Audit trail for all quote changes - compliance ready';
COMMENT ON TABLE quote_templates IS 'Reusable quote templates created by agents';
COMMENT ON COLUMN quotes.version IS 'Optimistic locking version number';
COMMENT ON COLUMN quotes.items IS 'JSONB array of quote items (flights, hotels, etc.)';
COMMENT ON COLUMN quotes.pricing IS 'JSONB pricing breakdown including markup';
