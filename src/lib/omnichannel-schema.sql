-- Central de Comunicação Omnichannel - Fly2Any Travel
-- Schema de banco de dados para centralizar todos os canais de atendimento

-- Tabela de clientes centralizados
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20),
    email VARCHAR(255),
    name VARCHAR(255),
    whatsapp_id VARCHAR(255),
    location VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    language VARCHAR(5) DEFAULT 'pt-BR',
    customer_type VARCHAR(50) DEFAULT 'prospect', -- prospect, customer, vip
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_contact_at TIMESTAMP,
    
    -- Índices para performance
    UNIQUE(phone),
    UNIQUE(email),
    UNIQUE(whatsapp_id)
);

-- Tabela de conversas unificadas
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    channel VARCHAR(50) NOT NULL, -- whatsapp, email, webchat, phone, instagram, facebook
    channel_conversation_id VARCHAR(255), -- ID específico do canal
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'open', -- open, pending, resolved, closed
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    assigned_agent_id INTEGER,
    department VARCHAR(100) DEFAULT 'sales', -- sales, support, billing
    tags TEXT[], -- Array de tags para categorização
    metadata JSONB, -- Dados específicos do canal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_customer_conversations (customer_id),
    INDEX idx_channel_conversations (channel),
    INDEX idx_status_conversations (status),
    INDEX idx_created_conversations (created_at DESC)
);

-- Tabela de mensagens unificadas
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id),
    customer_id INTEGER REFERENCES customers(id),
    channel VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- inbound, outbound
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, document, audio, video, template
    sender_name VARCHAR(255),
    sender_id VARCHAR(255), -- ID do remetente no canal específico
    agent_id INTEGER, -- ID do agente se foi enviado por agente
    is_automated BOOLEAN DEFAULT FALSE,
    template_id VARCHAR(100), -- Se foi enviado via template
    metadata JSONB, -- Dados específicos da mensagem (anexos, etc.)
    channel_message_id VARCHAR(255), -- ID da mensagem no canal original
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_conversation_messages (conversation_id, created_at DESC),
    INDEX idx_customer_messages (customer_id, created_at DESC),
    INDEX idx_channel_messages (channel, created_at DESC)
);

-- Tabela de agentes/atendentes
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    role VARCHAR(50) DEFAULT 'agent', -- agent, supervisor, admin
    skills TEXT[], -- Array de habilidades/especializações
    languages TEXT[] DEFAULT '{pt-BR,en-US}',
    is_active BOOLEAN DEFAULT TRUE,
    max_concurrent_conversations INTEGER DEFAULT 10,
    current_conversations INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'offline', -- online, offline, away, busy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP
);

-- Tabela de atribuição de conversas
CREATE TABLE IF NOT EXISTS conversation_assignments (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id),
    agent_id INTEGER REFERENCES agents(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER REFERENCES agents(id),
    unassigned_at TIMESTAMP,
    reason VARCHAR(255),
    
    -- Índices para performance
    INDEX idx_agent_assignments (agent_id, assigned_at DESC),
    INDEX idx_conversation_assignments (conversation_id)
);

-- Tabela de automações e templates
CREATE TABLE IF NOT EXISTS automation_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    trigger_type VARCHAR(100), -- greeting, follow_up, off_hours, keyword, intent
    trigger_conditions JSONB, -- Condições específicas para disparar
    template_content TEXT NOT NULL,
    variables JSONB, -- Variáveis disponíveis no template
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de atividades
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id),
    customer_id INTEGER REFERENCES customers(id),
    agent_id INTEGER REFERENCES agents(id),
    action VARCHAR(100) NOT NULL, -- message_sent, status_changed, assigned, closed, etc.
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_conversation_activity (conversation_id, created_at DESC),
    INDEX idx_customer_activity (customer_id, created_at DESC),
    INDEX idx_agent_activity (agent_id, created_at DESC)
);

-- Tabela de métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(100) NOT NULL, -- response_time, resolution_time, satisfaction, etc.
    conversation_id INTEGER REFERENCES conversations(id),
    agent_id INTEGER REFERENCES agents(id),
    channel VARCHAR(50),
    value DECIMAL(10,2),
    unit VARCHAR(20), -- seconds, minutes, hours, percentage
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_metrics_type (metric_type, date_recorded DESC),
    INDEX idx_metrics_agent (agent_id, date_recorded DESC),
    INDEX idx_metrics_channel (channel, date_recorded DESC)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES agents(id)
);

-- Tabela de integração com canais
CREATE TABLE IF NOT EXISTS channel_integrations (
    id SERIAL PRIMARY KEY,
    channel VARCHAR(50) NOT NULL,
    integration_name VARCHAR(100) NOT NULL,
    config JSONB NOT NULL, -- Configurações específicas do canal
    webhook_url VARCHAR(500),
    api_credentials JSONB, -- Credenciais criptografadas
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO system_settings (key, value, description, category) VALUES
('business_hours_start', '09:00', 'Horário de início do atendimento (EST)', 'schedule'),
('business_hours_end', '18:00', 'Horário de fim do atendimento (EST)', 'schedule'),
('business_days', '1,2,3,4,5', 'Dias da semana de atendimento (1=segunda)', 'schedule'),
('auto_response_enabled', 'true', 'Ativar respostas automáticas', 'automation'),
('max_response_time', '300', 'Tempo máximo de resposta em segundos', 'performance'),
('customer_satisfaction_enabled', 'true', 'Ativar pesquisa de satisfação', 'feedback'),
('omnichannel_enabled', 'true', 'Ativar central omnichannel', 'system');

-- Inserir agente padrão
INSERT INTO agents (name, email, department, role, skills, languages) VALUES
('Sistema Fly2Any', 'system@fly2any.com', 'support', 'system', 
 '{automation,whatsapp,email,chat}', '{pt-BR,en-US}');

-- Inserir templates padrão
INSERT INTO automation_templates (name, channel, trigger_type, template_content, variables) VALUES
('Saudação WhatsApp', 'whatsapp', 'greeting', 
 '🛫 Olá {{customer_name}}! Bem-vindo à Fly2Any! Como posso ajudar com sua viagem EUA-Brasil hoje?', 
 '{"customer_name": "string"}'),
('Fora de Horário', 'whatsapp', 'off_hours', 
 '🕐 Estamos fora do horário comercial. Um especialista retornará sua mensagem pela manhã!\n\n⏰ Horário: Seg-Sex 9h-18h (EST)', 
 '{}'),
('Cotação Solicitada', 'whatsapp', 'keyword', 
 '✈️ Perfeito! Para uma cotação de voos, preciso saber:\n\n📍 Origem e destino\n📅 Datas\n👥 Passageiros\n\n🎯 Cotação gratuita em 2h!', 
 '{}');