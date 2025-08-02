-- Migration: 001 - Unified Leads Schema
-- Description: Create unified leads table with comprehensive schema
-- Author: Claude Code Assistant
-- Date: 2025-01-19

-- Drop existing leads table if it exists (BE CAREFUL IN PRODUCTION!)
-- DROP TABLE IF EXISTS leads CASCADE;

-- Create unified leads table
CREATE TABLE IF NOT EXISTS leads_unified (
  -- System fields
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'novo',
  priority TEXT NOT NULL DEFAULT 'media',
  assigned_to TEXT,
  
  -- Personal Information (required)
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  
  -- Personal Information (optional)
  sobrenome TEXT,
  telefone TEXT,
  cpf TEXT,
  data_nascimento DATE,
  
  -- Location Information
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  
  -- Travel Information - Core
  selected_services JSONB NOT NULL DEFAULT '[]',
  origem TEXT,
  destino TEXT,
  tipo_viagem TEXT,
  
  -- Travel Information - Dates (supporting both formats)
  data_partida DATE,
  data_retorno DATE,
  data_ida DATE,  -- Legacy support
  data_volta DATE, -- Legacy support
  
  -- Passenger Information
  numero_passageiros INTEGER,
  adultos INTEGER DEFAULT 1,
  criancas INTEGER DEFAULT 0,
  bebes INTEGER DEFAULT 0,
  
  -- Flight Preferences
  classe_viagem TEXT DEFAULT 'economica',
  classe_voo TEXT, -- Legacy support
  companhia_preferida TEXT,
  horario_preferido TEXT DEFAULT 'qualquer',
  escalas TEXT DEFAULT 'qualquer',
  
  -- Budget Information
  orcamento_total TEXT,
  orcamento_aproximado TEXT, -- Legacy support
  prioridade_orcamento TEXT DEFAULT 'custo_beneficio',
  flexibilidade_datas BOOLEAN DEFAULT false,
  
  -- Additional Services
  precisa_hospedagem BOOLEAN DEFAULT false,
  tipo_hospedagem TEXT,
  categoria_hospedagem TEXT,
  precisa_transporte BOOLEAN DEFAULT false,
  tipo_transporte TEXT,
  
  -- Customer Profile
  experiencia_viagem TEXT DEFAULT 'ocasional',
  motivo_viagem TEXT DEFAULT 'lazer',
  
  -- Communication Preferences
  preferencia_contato TEXT DEFAULT 'whatsapp',
  melhor_horario TEXT DEFAULT 'qualquer',
  
  -- Marketing Information
  como_conheceu TEXT DEFAULT 'website',
  receber_promocoes BOOLEAN DEFAULT true,
  
  -- Additional Information
  observacoes TEXT,
  necessidade_especial TEXT,
  
  -- Legacy Compatibility
  service_type TEXT, -- For backward compatibility
  
  -- Raw Data Storage
  full_data JSONB DEFAULT '{}',
  
  -- Metadata
  user_agent TEXT,
  page_url TEXT,
  ip_address INET,
  session_id TEXT,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('novo', 'contatado', 'cotacao_enviada', 'negociacao', 'fechado', 'perdido', 'em_analise', 'cotado', 'proposta_enviada', 'follow_up')),
  CONSTRAINT valid_priority CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  CONSTRAINT valid_trip_type CHECK (tipo_viagem IS NULL OR tipo_viagem IN ('ida', 'ida_volta', 'multiplas_cidades', 'ida-volta', 'somente-ida', 'multiplas-cidades')),
  CONSTRAINT valid_flight_class CHECK (classe_viagem IS NULL OR classe_viagem IN ('economica', 'premium', 'executiva', 'primeira')),
  CONSTRAINT valid_budget_priority CHECK (prioridade_orcamento IS NULL OR prioridade_orcamento IN ('baixo_custo', 'custo_beneficio', 'conforto', 'luxo')),
  CONSTRAINT valid_experience CHECK (experiencia_viagem IS NULL OR experiencia_viagem IN ('primeira_vez', 'ocasional', 'frequente', 'expert')),
  CONSTRAINT valid_motivation CHECK (motivo_viagem IS NULL OR motivo_viagem IN ('lazer', 'negocio', 'familia', 'lua_mel', 'aventura', 'cultura')),
  CONSTRAINT valid_contact_preference CHECK (preferencia_contato IS NULL OR preferencia_contato IN ('whatsapp', 'telefone', 'email', 'qualquer')),
  CONSTRAINT valid_time_preference CHECK (melhor_horario IS NULL OR melhor_horario IN ('manha', 'tarde', 'noite', 'qualquer')),
  CONSTRAINT valid_discovery_source CHECK (como_conheceu IS NULL OR como_conheceu IN ('google', 'facebook', 'instagram', 'indicacao', 'youtube', 'outro', 'website')),
  CONSTRAINT valid_passengers CHECK (numero_passageiros IS NULL OR numero_passageiros > 0),
  CONSTRAINT valid_adults CHECK (adultos IS NULL OR adultos >= 0),
  CONSTRAINT valid_children CHECK (criancas IS NULL OR criancas >= 0),
  CONSTRAINT valid_babies CHECK (bebes IS NULL OR bebes >= 0),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_unified_email ON leads_unified(email);
CREATE INDEX IF NOT EXISTS idx_leads_unified_status ON leads_unified(status);
CREATE INDEX IF NOT EXISTS idx_leads_unified_priority ON leads_unified(priority);
CREATE INDEX IF NOT EXISTS idx_leads_unified_source ON leads_unified(source);
CREATE INDEX IF NOT EXISTS idx_leads_unified_created_at ON leads_unified(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_unified_updated_at ON leads_unified(updated_at);
CREATE INDEX IF NOT EXISTS idx_leads_unified_customer_id ON leads_unified(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_unified_assigned_to ON leads_unified(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_unified_whatsapp ON leads_unified(whatsapp);
CREATE INDEX IF NOT EXISTS idx_leads_unified_nome ON leads_unified(nome);
CREATE INDEX IF NOT EXISTS idx_leads_unified_origem_destino ON leads_unified(origem, destino);
CREATE INDEX IF NOT EXISTS idx_leads_unified_selected_services ON leads_unified USING GIN(selected_services);
CREATE INDEX IF NOT EXISTS idx_leads_unified_full_data ON leads_unified USING GIN(full_data);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_unified_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS trigger_update_leads_unified_updated_at ON leads_unified;
CREATE TRIGGER trigger_update_leads_unified_updated_at
  BEFORE UPDATE ON leads_unified
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_unified_updated_at();

-- Migration function to copy data from old leads table (if it exists)
DO $$
BEGIN
  -- Check if old leads table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads' AND table_schema = 'public') THEN
    -- Copy data from old table to new unified table
    INSERT INTO leads_unified (
      id, customer_id, created_at, updated_at, source, status, priority,
      nome, email, whatsapp, telefone, sobrenome,
      origem, destino, data_partida, data_retorno,
      numero_passageiros, tipo_viagem, selected_services,
      classe_viagem, companhia_preferida, horario_preferido, escalas,
      orcamento_total, prioridade_orcamento, flexibilidade_datas,
      precisa_hospedagem, precisa_transporte, observacoes,
      full_data, service_type
    )
    SELECT 
      COALESCE(id, 'lead_' || extract(epoch from CURRENT_TIMESTAMP) || '_' || substring(md5(random()::text), 1, 9)),
      customer_id,
      COALESCE(created_at, CURRENT_TIMESTAMP),
      COALESCE(updated_at, CURRENT_TIMESTAMP),
      COALESCE(source, 'website'),
      COALESCE(status, 'novo'),
      COALESCE(priority, 'media'),
      nome,
      email,
      whatsapp,
      telefone,
      sobrenome,
      origem,
      destino,
      data_partida,
      data_retorno,
      numero_passageiros,
      tipo_viagem,
      COALESCE(selected_services::jsonb, '[]'::jsonb),
      classe_viagem,
      companhia_preferida,
      horario_preferido,
      escalas,
      orcamento_total,
      prioridade_orcamento,
      COALESCE(flexibilidade_datas, false),
      COALESCE(precisa_hospedagem, false),
      COALESCE(precisa_transporte, false),
      observacoes,
      COALESCE(full_data::jsonb, '{}'::jsonb),
      service_type
    FROM leads
    ON CONFLICT (id) DO NOTHING; -- Skip duplicates
    
    RAISE NOTICE 'Data migration completed from leads to leads_unified';
  END IF;
END $$;

-- Create view for backward compatibility
CREATE OR REPLACE VIEW leads AS
SELECT 
  id,
  customer_id,
  nome,
  email,
  whatsapp,
  telefone,
  sobrenome,
  origem,
  destino,
  data_partida,
  data_retorno,
  numero_passageiros,
  tipo_viagem,
  selected_services,
  classe_viagem,
  companhia_preferida,
  horario_preferido,
  escalas,
  orcamento_total,
  prioridade_orcamento,
  flexibilidade_datas,
  precisa_hospedagem,
  precisa_transporte,
  observacoes,
  source,
  status,
  priority,
  created_at,
  updated_at,
  full_data
FROM leads_unified;

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON leads_unified TO your_app_user;
-- GRANT SELECT ON leads TO your_app_user;

-- Add helpful comments
COMMENT ON TABLE leads_unified IS 'Unified leads table with comprehensive schema for all lead types and formats';
COMMENT ON COLUMN leads_unified.selected_services IS 'JSON array of selected services (voos, hoteis, carros, passeios, seguro)';
COMMENT ON COLUMN leads_unified.full_data IS 'Complete raw lead data for audit and debugging purposes';
COMMENT ON COLUMN leads_unified.ip_address IS 'Client IP address for analytics and security';
COMMENT ON VIEW leads IS 'Backward compatibility view for existing code';

-- Migration completion notice
DO $$
BEGIN
  RAISE NOTICE 'Migration 001 - Unified Leads Schema completed successfully';
  RAISE NOTICE 'Table created: leads_unified';
  RAISE NOTICE 'Indexes created: 12 indexes for performance optimization';
  RAISE NOTICE 'Triggers created: automatic updated_at timestamp';
  RAISE NOTICE 'View created: leads (backward compatibility)';
END $$;