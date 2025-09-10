import { sql } from '@vercel/postgres';

/**
 * Initialize all omnichannel database tables
 * Creates the complete omnichannel communication center schema
 */
export class OmnichannelDatabaseInit {
  
  static async initializeAll(): Promise<void> {
    console.log('🔄 Starting omnichannel database initialization...');
    
    try {
      await this.createTables();
      await this.createIndices();
      await this.insertDefaultData();
      
      console.log('✅ Omnichannel database initialization completed successfully');
    } catch (error) {
      console.error('❌ Error initializing omnichannel database:', error);
      throw error;
    }
  }

  /**
   * Create all omnichannel tables with proper PostgreSQL syntax
   */
  private static async createTables(): Promise<void> {
    console.log('📝 Creating omnichannel tables...');

    // 1. Customers table
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
        last_contact_at TIMESTAMP,
        
        -- Constraints
        UNIQUE(phone),
        UNIQUE(email),
        UNIQUE(whatsapp_id)
      )
    `;

    // 2. Conversations table
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

    // 5. Conversation assignments table
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

    // 6. Automation templates table
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

    // 7. Activity log table
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

    // 8. Performance metrics table
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

    // 9. System settings table
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

    // 10. Channel integrations table
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

    console.log('✅ All omnichannel tables created successfully');
  }

  /**
   * Create performance indices
   */
  private static async createIndices(): Promise<void> {
    console.log('🔧 Creating database indices...');

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

      // Assignments indices
      await sql`CREATE INDEX IF NOT EXISTS idx_agent_assignments ON conversation_assignments(agent_id, assigned_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_conversation_assignments ON conversation_assignments(conversation_id)`;

      // Activity log indices
      await sql`CREATE INDEX IF NOT EXISTS idx_conversation_activity ON activity_log(conversation_id, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_customer_activity ON activity_log(customer_id, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_agent_activity ON activity_log(agent_id, created_at DESC)`;

      // Performance metrics indices
      await sql`CREATE INDEX IF NOT EXISTS idx_metrics_type ON performance_metrics(metric_type, date_recorded DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_metrics_agent ON performance_metrics(agent_id, date_recorded DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_metrics_channel ON performance_metrics(channel, date_recorded DESC)`;

      console.log('✅ All indices created successfully');
    } catch (error) {
      console.warn('⚠️ Some indices may already exist:', error);
    }
  }

  /**
   * Insert default system data
   */
  private static async insertDefaultData(): Promise<void> {
    console.log('📊 Inserting default system data...');

    try {
      // Insert default system settings (only if they don't exist)
      await sql`
        INSERT INTO system_settings (key, value, description, category) 
        SELECT * FROM (VALUES
          ('business_hours_start', '09:00', 'Horário de início do atendimento (EST)', 'schedule'),
          ('business_hours_end', '18:00', 'Horário de fim do atendimento (EST)', 'schedule'),
          ('business_days', '1,2,3,4,5', 'Dias da semana de atendimento (1=segunda)', 'schedule'),
          ('auto_response_enabled', 'true', 'Ativar respostas automáticas', 'automation'),
          ('max_response_time', '300', 'Tempo máximo de resposta em segundos', 'performance'),
          ('customer_satisfaction_enabled', 'true', 'Ativar pesquisa de satisfação', 'feedback'),
          ('omnichannel_enabled', 'true', 'Ativar central omnichannel', 'system')
        ) AS v(key, value, description, category)
        WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE system_settings.key = v.key)
      `;

      // Insert default system agent (only if doesn't exist)
      await sql`
        INSERT INTO agents (name, email, department, role, skills, languages)
        SELECT 'Sistema Fly2Any', 'system@fly2any.com', 'support', 'system', 
               '{automation,whatsapp,email,chat}', '{pt-BR,en-US}'
        WHERE NOT EXISTS (SELECT 1 FROM agents WHERE email = 'system@fly2any.com')
      `;

      // Insert default templates (only if they don't exist)
      await sql`
        INSERT INTO automation_templates (name, channel, trigger_type, template_content, variables)
        SELECT * FROM (VALUES
          ('Saudação WhatsApp', 'whatsapp', 'greeting', 
           '🛫 Olá {{customer_name}}! Bem-vindo à Fly2Any! Como posso ajudar com sua viagem EUA-Brasil hoje?', 
           '{"customer_name": "string"}'),
          ('Fora de Horário', 'whatsapp', 'off_hours', 
           '🕐 Estamos fora do horário comercial. Um especialista retornará sua mensagem pela manhã!\n\n⏰ Horário: Seg-Sex 9h-18h (EST)', 
           '{}'),
          ('Cotação Solicitada', 'whatsapp', 'keyword', 
           '✈️ Perfeito! Para uma cotação de voos, preciso saber:\n\n📍 Origem e destino\n📅 Datas\n👥 Passageiros\n\n🎯 Cotação gratuita em 2h!', 
           '{}')
        ) AS v(name, channel, trigger_type, template_content, variables)
        WHERE NOT EXISTS (
          SELECT 1 FROM automation_templates 
          WHERE automation_templates.name = v.name 
          AND automation_templates.channel = v.channel
        )
      `;

      console.log('✅ Default data inserted successfully');
    } catch (error) {
      console.warn('⚠️ Some default data may already exist:', error);
    }
  }

  /**
   * Verify all tables exist and are accessible
   */
  static async verifyTables(): Promise<{
    success: boolean;
    tables: string[];
    missing: string[];
    errors: string[];
  }> {
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

    const existing: string[] = [];
    const missing: string[] = [];
    const errors: string[] = [];

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
        } else {
          missing.push(table);
        }
      } catch (error) {
        errors.push(`${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: missing.length === 0 && errors.length === 0,
      tables: existing,
      missing,
      errors
    };
  }

  /**
   * Get basic table statistics
   */
  static async getTableStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    const tables = [
      'customers',
      'conversations',
      'messages', 
      'agents',
      'conversation_assignments',
      'automation_templates'
    ];

    for (const table of tables) {
      try {
        const result = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = parseInt(result.rows[0].count);
      } catch (error) {
        stats[table] = -1; // Indicates table doesn't exist or error
      }
    }

    return stats;
  }

  /**
   * Force recreate all tables (DANGER: This will delete all data)
   */
  static async recreateAllTables(): Promise<void> {
    console.log('⚠️ DANGER: Recreating all omnichannel tables (all data will be lost)');
    
    const tables = [
      'channel_integrations',
      'system_settings', 
      'performance_metrics',
      'activity_log',
      'automation_templates',
      'conversation_assignments',
      'messages',
      'conversations',
      'agents',
      'customers'
    ];

    // Drop tables in reverse dependency order
    for (const table of tables) {
      try {
        await sql.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`🗑️ Dropped table: ${table}`);
      } catch (error) {
        console.warn(`Warning dropping ${table}:`, error);
      }
    }

    // Recreate all tables
    await this.initializeAll();
  }
}

export default OmnichannelDatabaseInit;