#!/usr/bin/env node

/**
 * Omnichannel Database Initialization Script
 * Run this script to create all required database tables for the Communication Center
 */

const { sql } = require('@vercel/postgres');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function createTables() {
  log('\n📝 Creating omnichannel tables...', 'blue');

  try {
    // 1. Customers table
    log('Creating customers table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20),
        email VARCHAR(255),
        name VARCHAR(255),
        whatsapp_id VARCHAR(255),
        location VARCHAR(255),
        timezone VARCHAR(50) DEFAULT 'America/New_York',
        language VARCHAR(5) DEFAULT 'pt-BR',
        customer_type VARCHAR(50) DEFAULT 'prospect',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_contact_at TIMESTAMP
      )
    `;

    // 2. Conversations table
    log('Creating conversations table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        channel VARCHAR(50) NOT NULL,
        channel_conversation_id VARCHAR(255),
        subject VARCHAR(500),
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'normal',
        assigned_agent_id INTEGER,
        department VARCHAR(100) DEFAULT 'sales',
        tags TEXT[],
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP
      )
    `;

    // 3. Messages table
    log('Creating messages table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id),
        customer_id INTEGER REFERENCES customers(id),
        channel VARCHAR(50) NOT NULL,
        direction VARCHAR(10) NOT NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        sender_name VARCHAR(255),
        sender_id VARCHAR(255),
        agent_id INTEGER,
        is_automated BOOLEAN DEFAULT FALSE,
        template_id VARCHAR(100),
        metadata JSONB,
        channel_message_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP,
        delivered_at TIMESTAMP
      )
    `;

    // 4. Agents table
    log('Creating agents table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(100),
        role VARCHAR(50) DEFAULT 'agent',
        skills TEXT[],
        languages TEXT[] DEFAULT '{pt-BR,en-US}',
        is_active BOOLEAN DEFAULT TRUE,
        max_concurrent_conversations INTEGER DEFAULT 10,
        current_conversations INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'offline',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity_at TIMESTAMP
      )
    `;

    // 5. Other tables...
    log('Creating conversation_assignments table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_assignments (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id),
        agent_id INTEGER REFERENCES agents(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER REFERENCES agents(id),
        unassigned_at TIMESTAMP,
        reason VARCHAR(255)
      )
    `;

    log('Creating automation_templates table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS automation_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        channel VARCHAR(50) NOT NULL,
        trigger_type VARCHAR(100),
        trigger_conditions JSONB,
        template_content TEXT NOT NULL,
        variables JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    log('Creating activity_log table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id),
        customer_id INTEGER REFERENCES customers(id),
        agent_id INTEGER REFERENCES agents(id),
        action VARCHAR(100) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    log('Creating performance_metrics table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        metric_type VARCHAR(100) NOT NULL,
        conversation_id INTEGER REFERENCES conversations(id),
        agent_id INTEGER REFERENCES agents(id),
        channel VARCHAR(50),
        value DECIMAL(10,2),
        unit VARCHAR(20),
        date_recorded DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    log('Creating system_settings table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER REFERENCES agents(id)
      )
    `;

    log('Creating channel_integrations table...', 'cyan');
    await sql`
      CREATE TABLE IF NOT EXISTS channel_integrations (
        id SERIAL PRIMARY KEY,
        channel VARCHAR(50) NOT NULL,
        integration_name VARCHAR(100) NOT NULL,
        config JSONB NOT NULL,
        webhook_url VARCHAR(500),
        api_credentials JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        last_sync_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    log('✅ All tables created successfully!', 'green');
  } catch (error) {
    log(`❌ Error creating tables: ${error.message}`, 'red');
    throw error;
  }
}

async function createIndices() {
  log('\n🔧 Creating database indices...', 'blue');

  try {
    // Conversations indices
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_conversations ON conversations(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_channel_conversations ON conversations(channel)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_status_conversations ON conversations(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_created_conversations ON conversations(created_at DESC)`;

    // Messages indices
    await sql`CREATE INDEX IF NOT EXISTS idx_conversation_messages ON messages(conversation_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_messages ON messages(customer_id, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_channel_messages ON messages(channel, created_at DESC)`;

    // Other indices...
    await sql`CREATE INDEX IF NOT EXISTS idx_agent_assignments ON conversation_assignments(agent_id, assigned_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversation_assignments ON conversation_assignments(conversation_id)`;

    log('✅ All indices created successfully!', 'green');
  } catch (error) {
    log(`⚠️ Warning creating indices: ${error.message}`, 'yellow');
  }
}

async function insertDefaultData() {
  log('\n📊 Inserting default system data...', 'blue');

  try {
    // System settings
    log('Inserting system settings...', 'cyan');
    await sql`
      INSERT INTO system_settings (key, value, description, category) VALUES
      ('business_hours_start', '09:00', 'Horário de início do atendimento (EST)', 'schedule'),
      ('business_hours_end', '18:00', 'Horário de fim do atendimento (EST)', 'schedule'),
      ('business_days', '1,2,3,4,5', 'Dias da semana de atendimento (1=segunda)', 'schedule'),
      ('auto_response_enabled', 'true', 'Ativar respostas automáticas', 'automation'),
      ('max_response_time', '300', 'Tempo máximo de resposta em segundos', 'performance'),
      ('customer_satisfaction_enabled', 'true', 'Ativar pesquisa de satisfação', 'feedback'),
      ('omnichannel_enabled', 'true', 'Ativar central omnichannel', 'system')
      ON CONFLICT (key) DO NOTHING
    `;

    // System agent
    log('Creating system agent...', 'cyan');
    await sql`
      INSERT INTO agents (name, email, department, role, skills, languages) VALUES
      ('Sistema Fly2Any', 'system@fly2any.com', 'support', 'system', 
       '{automation,whatsapp,email,chat}', '{pt-BR,en-US}')
      ON CONFLICT (email) DO NOTHING
    `;

    // Default templates
    log('Creating default templates...', 'cyan');
    await sql`
      INSERT INTO automation_templates (name, channel, trigger_type, template_content, variables) VALUES
      ('Saudação WhatsApp', 'whatsapp', 'greeting', 
       '🛫 Olá {{customer_name}}! Bem-vindo à Fly2Any! Como posso ajudar com sua viagem EUA-Brasil hoje?', 
       '{"customer_name": "string"}'),
      ('Fora de Horário', 'whatsapp', 'off_hours', 
       '🕐 Estamos fora do horário comercial. Um especialista retornará sua mensagem pela manhã!\n\n⏰ Horário: Seg-Sex 9h-18h (EST)', 
       '{}'),
      ('Cotação Solicitada', 'whatsapp', 'keyword', 
       '✈️ Perfeito! Para uma cotação de voos, preciso saber:\n\n📍 Origem e destino\n📅 Datas\n👥 Passageiros\n\n🎯 Cotação gratuita em 2h!', 
       '{}')
    `;

    log('✅ Default data inserted successfully!', 'green');
  } catch (error) {
    log(`⚠️ Warning inserting default data: ${error.message}`, 'yellow');
  }
}

async function verifyTables() {
  log('\n🔍 Verifying table creation...', 'blue');

  const expectedTables = [
    'customers',
    'conversations', 
    'messages',
    'agents',
    'conversation_assignments',
    'automation_templates',
    'activity_log',
    'performance_metrics',
    'system_settings',
    'channel_integrations'
  ];

  const existing = [];
  const missing = [];

  for (const table of expectedTables) {
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${table}
        )
      `;
      
      if (result.rows[0].exists) {
        existing.push(table);
        log(`✅ ${table}`, 'green');
      } else {
        missing.push(table);
        log(`❌ ${table} - MISSING`, 'red');
      }
    } catch (error) {
      log(`⚠️ ${table} - ERROR: ${error.message}`, 'yellow');
    }
  }

  log(`\n📊 Summary: ${existing.length}/${expectedTables.length} tables created`, existing.length === expectedTables.length ? 'green' : 'yellow');
  
  return { existing, missing };
}

async function getTableCounts() {
  log('\n📈 Getting table row counts...', 'blue');
  
  const tables = ['customers', 'conversations', 'messages', 'agents', 'automation_templates'];
  
  for (const table of tables) {
    try {
      const result = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
      log(`${table}: ${result.rows[0].count} rows`, 'cyan');
    } catch (error) {
      log(`${table}: Error - ${error.message}`, 'red');
    }
  }
}

async function main() {
  log('🚀 Starting Omnichannel Database Initialization', 'bright');
  log('=' .repeat(60), 'blue');

  try {
    await createTables();
    await createIndices();
    await insertDefaultData();
    
    const verification = await verifyTables();
    await getTableCounts();

    if (verification.missing.length === 0) {
      log('\n🎉 Omnichannel database initialization completed successfully!', 'green');
      log('The Communication Center is now ready to use.', 'bright');
    } else {
      log('\n⚠️ Database initialization completed with warnings.', 'yellow');
      log(`Missing tables: ${verification.missing.join(', ')}`, 'red');
    }

  } catch (error) {
    log('\n💥 Database initialization failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('Omnichannel Database Initialization Script', 'bright');
  log('');
  log('Usage: node init-omnichannel-db.js [options]', 'cyan');
  log('');
  log('Options:');
  log('  --help, -h     Show this help message');
  log('  --verify       Only verify existing tables');
  log('  --force        Force recreate all tables (DANGER: destroys data)');
  process.exit(0);
}

if (args.includes('--verify')) {
  log('🔍 Verification Mode', 'bright');
  verifyTables().then(() => {
    getTableCounts();
  }).catch(error => {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  });
} else if (args.includes('--force')) {
  log('⚠️ DANGER: Force recreate mode - all data will be lost!', 'red');
  log('Press Ctrl+C to cancel, or wait 5 seconds...', 'yellow');
  
  setTimeout(() => {
    main();
  }, 5000);
} else {
  main();
}