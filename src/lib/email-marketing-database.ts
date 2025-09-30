import { sql } from '@vercel/postgres';

// Production Email Marketing Database Schema
// Integrates with existing customers/leads tables

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: 'newsletter' | 'promotional' | 'welcome' | 'follow_up' | 'custom';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  
  // Targeting
  segment_id?: string;
  target_criteria?: string; // JSON of targeting rules
  
  // Sending details
  from_email: string;
  from_name: string;
  reply_to?: string;
  send_time?: Date;
  timezone: string;
  
  // Stats
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_unsubscribed: number;
  total_bounced: number;
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  sent_at?: Date;
  
  // MailGun integration
  mailgun_campaign_id?: string;
  mailgun_message_id?: string;
}

export interface EmailContact {
  id: string;
  customer_id: string; // Links to existing customers table
  email: string;
  first_name?: string;
  last_name?: string;
  
  // Email-specific status
  email_status: 'active' | 'unsubscribed' | 'bounced' | 'complained' | 'invalid';
  subscription_date: Date;
  unsubscribe_date?: Date;
  
  // Segmentation
  tags: string[];
  custom_fields: Record<string, any>;
  
  // Engagement tracking
  total_emails_sent: number;
  total_emails_opened: number;
  total_emails_clicked: number;
  last_email_opened_at?: Date;
  last_email_clicked_at?: Date;
  engagement_score: number;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface EmailEvent {
  id: string;
  contact_id: string;
  campaign_id?: string;
  
  // Event details
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained';
  event_data: Record<string, any>; // JSON with additional data
  
  // Tracking
  ip_address?: string;
  user_agent?: string;
  link_url?: string; // For click events
  
  // MailGun integration
  mailgun_event_id?: string;
  mailgun_message_id?: string;
  
  // Metadata
  created_at: Date;
}

export interface EmailSegment {
  id: string;
  name: string;
  description?: string;
  
  // Segment criteria (JSON)
  criteria: {
    customer_status?: string[];
    tags?: string[];
    engagement_score_min?: number;
    engagement_score_max?: number;
    location?: {
      cities?: string[];
      states?: string[];
      countries?: string[];
    };
    travel_preferences?: {
      experience?: string[];
      motivation?: string[];
      budget?: string[];
    };
    date_filters?: {
      created_after?: Date;
      created_before?: Date;
      last_contact_after?: Date;
      last_contact_before?: Date;
    };
    email_engagement?: {
      opened_last_n_days?: number;
      clicked_last_n_days?: number;
      min_open_rate?: number;
      min_click_rate?: number;
    };
  };
  
  // Cached data
  contact_count: number;
  last_calculated_at: Date;
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'welcome' | 'newsletter' | 'promotional' | 'follow_up' | 'custom';
  
  // Template content
  subject: string;
  html_content: string;
  text_content?: string;
  
  // Variables and personalization
  variables: string[]; // Available template variables
  preview_text?: string;
  
  // Usage stats
  usage_count: number;
  last_used_at?: Date;
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  
  // Trigger conditions
  trigger_type: 'customer_created' | 'lead_created' | 'date_based' | 'engagement_based' | 'tag_added' | 'segment_entered';
  trigger_config: Record<string, any>; // JSON config for trigger
  
  // Workflow steps
  steps: Array<{
    id: string;
    type: 'email' | 'wait' | 'condition' | 'action';
    config: Record<string, any>;
    order: number;
  }>;
  
  // Statistics
  total_triggered: number;
  total_completed: number;
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export class EmailMarketingDatabase {
  private static _isInitialized = false;
  private static _initPromise: Promise<void> | null = null;
  
  // Retry helper for database operations
  private static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Error && (
          error.message.includes('permission denied') ||
          error.message.includes('authentication failed') ||
          error.message.includes('invalid credentials')
        )) {
          throw error;
        }
        
        console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Database operation failed after ${maxRetries} attempts: ${lastError!.message}`);
  }
  
  // Initialize all email marketing tables (singleton pattern)
  static async initializeEmailTables(): Promise<void> {
    // Return existing initialization promise if already in progress
    if (this._initPromise) {
      return this._initPromise;
    }
    
    // Return immediately if already initialized
    if (this._isInitialized) {
      return Promise.resolve();
    }
    
    // Start initialization and store the promise
    this._initPromise = this._performInitialization();
    
    try {
      await this._initPromise;
      this._isInitialized = true;
    } catch (error) {
      this._initPromise = null; // Reset on failure
      throw error;
    }
  }
  
  private static async _performInitialization(): Promise<void> {
    try {

      // Email Campaigns
      await sql`
        CREATE TABLE IF NOT EXISTS email_campaigns (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          subject TEXT NOT NULL,
          content TEXT NOT NULL,
          template_type TEXT DEFAULT 'custom',
          status TEXT DEFAULT 'draft',
          segment_id TEXT,
          target_criteria TEXT,
          from_email TEXT NOT NULL,
          from_name TEXT NOT NULL,
          reply_to TEXT,
          send_time TIMESTAMP,
          timezone TEXT DEFAULT 'America/Sao_Paulo',
          total_recipients INTEGER DEFAULT 0,
          total_sent INTEGER DEFAULT 0,
          total_delivered INTEGER DEFAULT 0,
          total_opened INTEGER DEFAULT 0,
          total_clicked INTEGER DEFAULT 0,
          total_unsubscribed INTEGER DEFAULT 0,
          total_bounced INTEGER DEFAULT 0,
          created_by TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          sent_at TIMESTAMP,
          mailgun_campaign_id TEXT,
          mailgun_message_id TEXT
        )
      `;

      // Add missing columns to existing email_campaigns table if they don't exist
      try {
        await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP`;
        await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS mailgun_campaign_id TEXT`;
        await sql`ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS mailgun_message_id TEXT`;
      } catch (error) {
        // Ignore errors for columns that already exist
        console.log('⚠️  Some email_campaigns columns may already exist');
      }

      // Email Contacts (linked to existing customers)
      await sql`
        CREATE TABLE IF NOT EXISTS email_contacts (
          id TEXT PRIMARY KEY,
          customer_id TEXT NOT NULL,
          email TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          email_status TEXT DEFAULT 'active',
          subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          unsubscribe_date TIMESTAMP,
          tags TEXT DEFAULT '[]',
          custom_fields TEXT DEFAULT '{}',
          total_emails_sent INTEGER DEFAULT 0,
          total_emails_opened INTEGER DEFAULT 0,
          total_emails_clicked INTEGER DEFAULT 0,
          last_email_opened_at TIMESTAMP,
          last_email_clicked_at TIMESTAMP,
          engagement_score INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
        )
      `;

      // Add missing columns to existing email_contacts table if they don't exist
      try {
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS customer_id TEXT`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS first_name TEXT`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS last_name TEXT`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS unsubscribe_date TIMESTAMP`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]'`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS custom_fields TEXT DEFAULT '{}'`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS total_emails_sent INTEGER DEFAULT 0`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS total_emails_opened INTEGER DEFAULT 0`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS total_emails_clicked INTEGER DEFAULT 0`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS last_email_opened_at TIMESTAMP`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS last_email_clicked_at TIMESTAMP`;
        await sql`ALTER TABLE email_contacts ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'active'`;
      } catch (error) {
        // Ignore errors for columns that already exist
        console.log('⚠️  Some email_contacts columns may already exist');
      }

      // Email Events Tracking
      await sql`
        CREATE TABLE IF NOT EXISTS email_events (
          id TEXT PRIMARY KEY,
          contact_id TEXT NOT NULL,
          campaign_id TEXT,
          event_type TEXT NOT NULL,
          event_data TEXT DEFAULT '{}',
          ip_address TEXT,
          user_agent TEXT,
          link_url TEXT,
          mailgun_event_id TEXT,
          mailgun_message_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (contact_id) REFERENCES email_contacts (id) ON DELETE CASCADE,
          FOREIGN KEY (campaign_id) REFERENCES email_campaigns (id) ON DELETE SET NULL
        )
      `;

      // Email Segments
      await sql`
        CREATE TABLE IF NOT EXISTS email_segments (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          criteria TEXT NOT NULL,
          contact_count INTEGER DEFAULT 0,
          last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        )
      `;

      // Email Templates
      await sql`
        CREATE TABLE IF NOT EXISTS email_templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT DEFAULT 'custom',
          subject TEXT NOT NULL,
          html_content TEXT NOT NULL,
          text_content TEXT,
          variables TEXT DEFAULT '[]',
          preview_text TEXT,
          usage_count INTEGER DEFAULT 0,
          last_used_at TIMESTAMP,
          created_by TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        )
      `;

      // Email Automations
      await sql`
        CREATE TABLE IF NOT EXISTS email_automations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'draft',
          trigger_type TEXT NOT NULL,
          trigger_config TEXT DEFAULT '{}',
          steps TEXT DEFAULT '[]',
          total_triggered INTEGER DEFAULT 0,
          total_completed INTEGER DEFAULT 0,
          created_by TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Indexes for performance (wrapped in try-catch to handle any issues gracefully)
      try {
        await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON email_contacts(email_status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_email_events_contact_id ON email_events(contact_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_email_events_campaign_id ON email_events(campaign_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_email_segments_active ON email_segments(is_active)`;
        
        // Create customer_id index only if the column exists
        try {
          await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_customer_id ON email_contacts(customer_id)`;
        } catch (customerIdIndexError) {
          console.warn('⚠️  customer_id index not created (column may not exist)');
        }
      } catch (indexError) {
        console.warn('⚠️  Some indexes could not be created:', indexError);
      }
      
      console.log('✅ Email Marketing database tables initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing email marketing tables:', error);
      throw error;
    }
  }
  
  // Reset initialization state (for testing purposes)
  static resetInitialization(): void {
    this._isInitialized = false;
    this._initPromise = null;
  }

  // Sync existing customers to email contacts
  static async syncCustomersToEmailContacts(): Promise<number> {
    try {
      // First check if email_contacts table has the required columns
      const columnsCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'email_contacts'
        AND column_name IN ('customer_id', 'first_name', 'engagement_score')
      `;
      
      if (columnsCheck.rows.length < 3) {
        console.log('⚠️  Email contacts table structure is incomplete, skipping sync');
        return 0;
      }
      
      const result = await sql`
        INSERT INTO email_contacts (
          id, customer_id, email, first_name, email_status, 
          subscription_date, tags, engagement_score, created_at, updated_at
        )
        SELECT 
          'contact_' || c.id,
          c.id,
          c.email,
          c.name,
          'active',
          COALESCE(c.created_at, CURRENT_TIMESTAMP),
          '[]'::jsonb,
          0,
          COALESCE(c.created_at, CURRENT_TIMESTAMP),
          COALESCE(c.updated_at, CURRENT_TIMESTAMP)
        FROM customers c
        WHERE c.email IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM email_contacts ec WHERE ec.customer_id = c.id
        )
      `;
      
      console.log(`✅ Synced ${result.rowCount || 0} customers to email contacts`);
      return result.rowCount || 0;
    } catch (error) {
      console.error('❌ Error syncing customers to email contacts:', error);
      // Don't throw error, just log it and return 0
      return 0;
    }
  }

  // Initialize default email templates
  static async initializeDefaultTemplates(): Promise<number> {
    try {
      const defaultTemplates = [
        {
          id: 'template_welcome_001',
          name: 'Boas-vindas - Fly2Any',
          description: 'Template de boas-vindas para novos clientes',
          category: 'welcome',
          subject: 'Bem-vindo à Fly2Any! ✈️',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Bem-vindo à Fly2Any!</h1>
              <p>Olá {{first_name}},</p>
              <p>É um prazer ter você conosco! Somos especialistas em tornar suas viagens inesquecíveis.</p>
              <p>Nossa equipe está sempre pronta para ajudar você a encontrar as melhores opções de voo, hospedagem e experiências.</p>
              <p>Em breve, você receberá ofertas exclusivas e dicas de viagem personalizadas.</p>
              <p>Boa viagem!</p>
              <p><strong>Equipe Fly2Any</strong></p>
            </div>
          `,
          text_content: 'Bem-vindo à Fly2Any! É um prazer ter você conosco.',
          variables: ['first_name'],
          created_by: 'system',
          is_active: true
        },
        {
          id: 'template_newsletter_001',
          name: 'Newsletter - Ofertas da Semana',
          description: 'Newsletter semanal com ofertas especiais',
          category: 'newsletter',
          subject: 'Ofertas Imperdíveis da Semana! ✈️',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Ofertas da Semana</h1>
              <p>Olá {{first_name}},</p>
              <p>Não perca essas oportunidades incríveis de viagem!</p>
              <h2>Destinos em Promoção:</h2>
              <ul>
                <li>Paris - A partir de R$ 2.500</li>
                <li>Nova York - A partir de R$ 3.200</li>
                <li>Lisboa - A partir de R$ 2.800</li>
              </ul>
              <p>Entre em contato conosco para mais detalhes!</p>
              <p><strong>Equipe Fly2Any</strong></p>
            </div>
          `,
          text_content: 'Ofertas da semana: Paris R$ 2.500, Nova York R$ 3.200, Lisboa R$ 2.800',
          variables: ['first_name'],
          created_by: 'system',
          is_active: true
        },
        {
          id: 'template_followup_001',
          name: 'Follow-up - Cotação',
          description: 'Follow-up para clientes que solicitaram cotação',
          category: 'follow_up',
          subject: 'Sua cotação de viagem está pronta!',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Sua Cotação Fly2Any</h1>
              <p>Olá {{first_name}},</p>
              <p>Preparamos uma cotação especial para sua viagem!</p>
              <p>Nossa equipe analisou suas preferências e encontrou as melhores opções para você.</p>
              <p>Entre em contato conosco para ver todos os detalhes da sua cotação personalizada.</p>
              <p>Estamos ansiosos para tornar sua viagem realidade!</p>
              <p><strong>Equipe Fly2Any</strong></p>
            </div>
          `,
          text_content: 'Sua cotação está pronta! Entre em contato para ver os detalhes.',
          variables: ['first_name'],
          created_by: 'system',
          is_active: true
        }
      ];

      let insertedCount = 0;
      
      for (const template of defaultTemplates) {
        try {
          // Check if template already exists
          const existingTemplate = await sql`
            SELECT id FROM email_templates WHERE id = ${template.id}
          `;
          
          if (existingTemplate.rows.length === 0) {
            await sql`
              INSERT INTO email_templates (
                id, name, description, category, subject, html_content, text_content,
                variables, usage_count, created_by, created_at, updated_at, is_active
              ) VALUES (
                ${template.id}, ${template.name}, ${template.description}, ${template.category},
                ${template.subject}, ${template.html_content}, ${template.text_content},
                ${JSON.stringify(template.variables)}, 0, ${template.created_by},
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${template.is_active}
              )
            `;
            insertedCount++;
          }
        } catch (templateError) {
          console.warn(`⚠️  Could not insert template ${template.id}:`, templateError);
        }
      }
      
      console.log(`✅ Initialized ${insertedCount} default email templates`);
      return insertedCount;
    } catch (error) {
      console.error('❌ Error initializing default templates:', error);
      return 0;
    }
  }

  // Get real email marketing stats from database
  static async getEmailMarketingStats(timeRange: string = '7d'): Promise<{
    totalContacts: number;
    segmentStats: Record<string, number>;
    campaignsSent: number;
    avgOpenRate: string;
    avgClickRate: string;
  }> {
    try {
      // Calculate date range
      const now = new Date();
      let fromDate = new Date();
      
      switch (timeRange) {
        case '24h':
          fromDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          fromDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          fromDate.setDate(now.getDate() - 30);
          break;
        default:
          fromDate.setDate(now.getDate() - 7);
      }

      // Get total active contacts (not_sent, sent, opened are all usable)
      const contactsResult = await sql`
        SELECT COUNT(*) as total 
        FROM email_contacts 
        WHERE email_status NOT IN ('failed', 'bounced', 'unsubscribed', 'complained')
      `;
      
      // Get campaigns sent in time range
      const campaignsResult = await sql`
        SELECT COUNT(*) as total 
        FROM email_campaigns 
        WHERE status IN ('sent', 'completed')
        AND (sent_at >= ${fromDate.toISOString()} OR updated_at >= ${fromDate.toISOString()})
      `;

      // Get segment stats (joining with customers table to get segmento)
      const segmentResult = await sql`
        SELECT 
          COALESCE(ec.email_status, 'Ativos') as segment,
          COUNT(*) as count
        FROM email_contacts ec
        WHERE ec.email_status NOT IN ('failed', 'bounced', 'unsubscribed', 'complained')
        GROUP BY ec.email_status
        ORDER BY count DESC
        LIMIT 5
      `;

      // Get email performance stats
      const performanceResult = await sql`
        SELECT 
          SUM(total_sent) as total_sent,
          SUM(total_opened) as total_opened,
          SUM(total_clicked) as total_clicked
        FROM email_campaigns
        WHERE status IN ('sent', 'completed')
        AND (sent_at >= ${fromDate.toISOString()} OR updated_at >= ${fromDate.toISOString()})
      `;

      const totalContacts = parseInt(contactsResult.rows[0]?.total || '0');
      const campaignsSent = parseInt(campaignsResult.rows[0]?.total || '0');
      
      const totalSent = parseInt(performanceResult.rows[0]?.total_sent || '0');
      const totalOpened = parseInt(performanceResult.rows[0]?.total_opened || '0');
      const totalClicked = parseInt(performanceResult.rows[0]?.total_clicked || '0');
      
      const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
      const avgClickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';

      // Build segment stats
      const segmentStats: Record<string, number> = {};
      segmentResult.rows.forEach(row => {
        segmentStats[row.segment] = parseInt(row.count);
      });

      return {
        totalContacts,
        segmentStats,
        campaignsSent,
        avgOpenRate: `${avgOpenRate}%`,
        avgClickRate: `${avgClickRate}%`
      };
    } catch (error) {
      console.error('Error getting email marketing stats:', error);
      // Return fallback stats if database query fails
      return {
        totalContacts: 0,
        segmentStats: { 'Sem Dados': 0 },
        campaignsSent: 0,
        avgOpenRate: '0.0%',
        avgClickRate: '0.0%'
      };
    }
  }

  // Get real contacts from database
  static async getEmailContacts(filters?: {
    status?: string;
    segment?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ contacts: EmailContact[]; total: number; }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.status) {
        if (filters.status === 'active') {
          // Treat 'active' as all usable contacts
          whereClause += ` AND ec.email_status NOT IN ('failed', 'bounced', 'unsubscribed', 'complained')`;
        } else {
          whereClause += ` AND ec.email_status = $${paramIndex}`;
          params.push(filters.status);
          paramIndex++;
        }
      } else {
        // By default, show only usable contacts
        whereClause += ` AND ec.email_status NOT IN ('failed', 'bounced', 'unsubscribed', 'complained')`;
      }

      if (filters?.segment && filters.segment !== 'all') {
        whereClause += ` AND c.status = $${paramIndex}`;
        params.push(filters.segment);
        paramIndex++;
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM email_contacts ec
        LEFT JOIN customers c ON ec.customer_id::text = c.id::text
        ${whereClause}
      `;
      const countResult = await sql.query(countQuery, params);
      const total = parseInt(countResult.rows[0]?.total || '0');

      // Get contacts with pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      
      const contactsQuery = `
        SELECT 
          ec.*,
          c.name,
          c.email as customer_email,
          'active' as segmento,
          '[]' as tags
        FROM email_contacts ec
        LEFT JOIN customers c ON ec.customer_id::text = c.id::text
        ${whereClause}
        ORDER BY ec.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const contactsResult = await sql.query(contactsQuery, [...params, limit, offset]);
      
      const contacts: EmailContact[] = contactsResult.rows.map(row => ({
        id: row.id,
        customer_id: row.customer_id || row.id,
        email: row.email || row.customer_email,
        first_name: row.first_name || row.nome,
        last_name: row.last_name,
        email_status: row.email_status,
        subscription_date: new Date(row.subscription_date || row.created_at),
        unsubscribe_date: row.unsubscribe_date ? new Date(row.unsubscribe_date) : undefined,
        tags: JSON.parse(row.tags || '[]'),
        custom_fields: JSON.parse(row.custom_fields || '{}'),
        total_emails_sent: row.total_emails_sent || 0,
        total_emails_opened: row.total_emails_opened || 0,
        total_emails_clicked: row.total_emails_clicked || 0,
        last_email_opened_at: row.last_email_opened_at ? new Date(row.last_email_opened_at) : undefined,
        last_email_clicked_at: row.last_email_clicked_at ? new Date(row.last_email_clicked_at) : undefined,
        engagement_score: row.engagement_score || 0,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }));

      return { contacts, total };
    } catch (error) {
      console.error('Error getting email contacts:', error);
      return { contacts: [], total: 0 };
    }
  }

  // Get real campaigns from database
  static async getEmailCampaigns(limit: number = 50): Promise<EmailCampaign[]> {
    try {
      const result = await sql`
        SELECT * FROM email_campaigns
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        template_type: row.template_type,
        status: row.status,
        segment_id: row.segment_id,
        target_criteria: row.target_criteria,
        from_email: row.from_email,
        from_name: row.from_name,
        reply_to: row.reply_to,
        send_time: row.send_time ? new Date(row.send_time) : undefined,
        timezone: row.timezone,
        total_recipients: row.total_recipients || 0,
        total_sent: row.total_sent || 0,
        total_delivered: row.total_delivered || 0,
        total_opened: row.total_opened || 0,
        total_clicked: row.total_clicked || 0,
        total_unsubscribed: row.total_unsubscribed || 0,
        total_bounced: row.total_bounced || 0,
        created_by: row.created_by,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
        sent_at: row.sent_at ? new Date(row.sent_at) : undefined,
        mailgun_campaign_id: row.mailgun_campaign_id,
        mailgun_message_id: row.mailgun_message_id
      }));
    } catch (error) {
      console.error('Error getting email campaigns:', error);
      return [];
    }
  }

  // Create new campaign
  static async createCampaign(campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<EmailCampaign> {
    return this.retryOperation(async () => {
      const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      await sql`
        INSERT INTO email_campaigns (
          id, name, subject, content, template_type, status,
          segment_id, target_criteria, from_email, from_name,
          reply_to, send_time, timezone, total_recipients,
          created_by, created_at, updated_at
        ) VALUES (
          ${id}, ${campaignData.name}, ${campaignData.subject},
          ${campaignData.content}, ${campaignData.template_type},
          ${campaignData.status}, ${campaignData.segment_id || null},
          ${campaignData.target_criteria || null}, ${campaignData.from_email},
          ${campaignData.from_name}, ${campaignData.reply_to || null},
          ${campaignData.send_time?.toISOString() || null},
          ${campaignData.timezone}, ${campaignData.total_recipients},
          ${campaignData.created_by}, ${now.toISOString()}, ${now.toISOString()}
        )
      `;

      return {
        ...campaignData,
        id,
        created_at: now,
        updated_at: now
      };
    }, 3, 1000);
  }

  // Track email events
  static async recordEmailEvent(eventData: Omit<EmailEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      await sql`
        INSERT INTO email_events (
          id, contact_id, campaign_id, event_type, event_data,
          ip_address, user_agent, link_url, mailgun_event_id,
          mailgun_message_id, created_at
        ) VALUES (
          ${id}, ${eventData.contact_id}, ${eventData.campaign_id || null},
          ${eventData.event_type}, ${JSON.stringify(eventData.event_data)},
          ${eventData.ip_address || null}, ${eventData.user_agent || null},
          ${eventData.link_url || null}, ${eventData.mailgun_event_id || null},
          ${eventData.mailgun_message_id || null}, ${now.toISOString()}
        )
      `;

      // Update contact engagement stats
      if (eventData.event_type === 'opened') {
        await sql`
          UPDATE email_contacts 
          SET 
            total_emails_opened = total_emails_opened + 1,
            last_email_opened_at = ${now.toISOString()},
            engagement_score = engagement_score + 5,
            updated_at = ${now.toISOString()}
          WHERE id = ${eventData.contact_id}
        `;
      } else if (eventData.event_type === 'clicked') {
        await sql`
          UPDATE email_contacts 
          SET 
            total_emails_clicked = total_emails_clicked + 1,
            last_email_clicked_at = ${now.toISOString()},
            engagement_score = engagement_score + 10,
            updated_at = ${now.toISOString()}
          WHERE id = ${eventData.contact_id}
        `;
      }

      // Update campaign stats
      if (eventData.campaign_id) {
        const updateField = eventData.event_type === 'sent' ? 'total_sent' :
                          eventData.event_type === 'delivered' ? 'total_delivered' :
                          eventData.event_type === 'opened' ? 'total_opened' :
                          eventData.event_type === 'clicked' ? 'total_clicked' :
                          eventData.event_type === 'bounced' ? 'total_bounced' :
                          eventData.event_type === 'unsubscribed' ? 'total_unsubscribed' : null;

        if (updateField) {
          await sql.query(
            `UPDATE email_campaigns SET ${updateField} = ${updateField} + 1, updated_at = $1 WHERE id = $2`,
            [now.toISOString(), eventData.campaign_id]
          );
        }
      }
    } catch (error) {
      console.error('Error recording email event:', error);
      throw error;
    }
  }

  // Get recent email events for activity feed
  static async getRecentEvents(filters?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    eventType?: string;
    contactId?: string;
    campaignId?: string;
  }): Promise<EmailEvent[]> {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        sortBy = 'created_at', 
        sortOrder = 'DESC',
        eventType,
        contactId,
        campaignId
      } = filters || {};

      let query = `
        SELECT 
          e.*, 
          c.email as contact_email,
          c.first_name as contact_first_name,
          camp.name as campaign_name
        FROM email_events e
        LEFT JOIN email_contacts c ON e.contact_id = c.id
        LEFT JOIN email_campaigns camp ON e.campaign_id = camp.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (eventType) {
        query += ` AND e.event_type = $${paramIndex}`;
        params.push(eventType);
        paramIndex++;
      }

      if (contactId) {
        query += ` AND e.contact_id = $${paramIndex}`;
        params.push(contactId);
        paramIndex++;
      }

      if (campaignId) {
        query += ` AND e.campaign_id = $${paramIndex}`;
        params.push(campaignId);
        paramIndex++;
      }

      query += ` ORDER BY e.${sortBy} ${sortOrder}`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await sql.query(query, params);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        contact_id: row.contact_id,
        campaign_id: row.campaign_id,
        event_type: row.event_type,
        event_data: row.event_data ? JSON.parse(row.event_data) : {},
        ip_address: row.ip_address,
        user_agent: row.user_agent,
        link_url: row.link_url,
        mailgun_event_id: row.mailgun_event_id,
        mailgun_message_id: row.mailgun_message_id,
        created_at: row.created_at,
        // Additional fields for UI display
        contact_email: row.contact_email,
        contact_first_name: row.contact_first_name,
        campaign_name: row.campaign_name
      }));
    } catch (error) {
      console.error('Error fetching recent events:', error);
      throw error;
    }
  }

  // Add email contact
  static async addEmailContact(contactData: {
    email: string;
    first_name?: string;
    last_name?: string;
    customer_id?: string;
  }): Promise<EmailContact> {
    try {
      const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();

      // Create customer_id if not provided
      const customer_id = contactData.customer_id || id;

      await sql`
        INSERT INTO email_contacts (
          id, customer_id, email, first_name, last_name,
          email_status, subscription_date, tags, custom_fields,
          total_emails_sent, total_emails_opened, total_emails_clicked,
          engagement_score, created_at, updated_at
        ) VALUES (
          ${id}, ${customer_id}, ${contactData.email},
          ${contactData.first_name || ''}, ${contactData.last_name || ''},
          'active', ${now.toISOString()}, '[]', '{}',
          0, 0, 0, 0, ${now.toISOString()}, ${now.toISOString()}
        )
      `;

      return {
        id,
        customer_id,
        email: contactData.email,
        first_name: contactData.first_name,
        last_name: contactData.last_name,
        email_status: 'active',
        subscription_date: now,
        tags: [],
        custom_fields: {},
        total_emails_sent: 0,
        total_emails_opened: 0,
        total_emails_clicked: 0,
        engagement_score: 0,
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      console.error('Error adding email contact:', error);
      throw error;
    }
  }

  // Get email templates
  static async getTemplates(filters?: {
    category?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: any[], categories: string[] }> {
    try {
      const { category, isActive = true, limit = 50, offset = 0 } = filters || {};

      let query = `
        SELECT * FROM email_templates
        WHERE is_active = $1
      `;
      const params: any[] = [isActive];
      let paramIndex = 2;

      if (category && category !== 'All') {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      query += ` ORDER BY usage_count DESC, created_at DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const templates = await sql.query(query, params);

      // Get distinct categories
      const categoriesResult = await sql`
        SELECT DISTINCT category 
        FROM email_templates 
        WHERE is_active = true
        ORDER BY category
      `;
      const categories = categoriesResult.rows.map((row: any) => row.category);

      return {
        templates: templates.rows.map((template: any) => ({
          id: template.id,
          name: template.name,
          category: template.category,
          description: template.description,
          thumbnail: template.thumbnail_url,
          html: template.html_content,
          text: template.text_content,
          subject: template.subject,
          variables: (() => {
            try {
              // Handle all possible variable formats safely
              if (!template.variables) return [];
              
              if (typeof template.variables === 'string') {
                // Handle JSON string format
                if (template.variables.startsWith('[') || template.variables.startsWith('{')) {
                  const parsed = JSON.parse(template.variables);
                  return Array.isArray(parsed) ? parsed.filter(v => v && typeof v === 'string') : [];
                }
                // Handle comma-separated string format
                return template.variables.split(',').map((v: string) => v.trim()).filter((v: string) => v);
              }
              
              if (Array.isArray(template.variables)) {
                // Already an array, filter for valid strings
                return template.variables.filter((v: unknown): v is string => Boolean(v) && typeof v === 'string');
              }
              
              return [];
            } catch (error) {
              console.warn(`Template ${template.id}: Failed to parse variables`, error);
              return [];
            }
          })(),
          industry: template.industry,
          usageCount: template.usage_count,
          createdAt: template.created_at,
          updatedAt: template.updated_at
        })),
        categories
      };
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }
}