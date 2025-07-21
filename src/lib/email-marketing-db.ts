import { sql } from '@vercel/postgres';

// Interfaces para tipagem
export interface EmailContact {
  id: string;
  email: string;
  nome: string;
  sobrenome?: string;
  telefone?: string;
  segmento?: string;
  tags: string[];
  status: 'ativo' | 'active' | 'unsubscribed' | 'bounced';
  email_status: 'not_sent' | 'sent' | 'opened' | 'clicked' | 'failed' | 'bounced';
  last_email_sent?: Date;
  unsubscribe_token: string;
  created_at: Date;
  updated_at: Date;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_type: 'promotional' | 'newsletter' | 'reactivation';
  html_content?: string;
  text_content?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'completed';
  scheduled_at?: Date;
  sent_at?: Date;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  created_at: Date;
  updated_at: Date;
}

export interface EmailSend {
  id: string;
  campaign_id: string;
  contact_id: string;
  email: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced' | 'unsubscribed';
  sent_at?: Date;
  delivered_at?: Date;
  opened_at?: Date;
  clicked_at?: Date;
  failed_reason?: string;
  message_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Função para inicializar as tabelas
export async function initEmailMarketingTables(): Promise<void> {
  try {
    console.log('🚀 Iniciando criação das tabelas de email marketing...');

    // 1. Tabela de contatos de email marketing
    await sql`
      CREATE TABLE IF NOT EXISTS email_contacts (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        sobrenome VARCHAR(255),
        telefone VARCHAR(50),
        segmento VARCHAR(100) DEFAULT 'geral',
        tags JSONB DEFAULT '[]',
        status VARCHAR(50) DEFAULT 'ativo',
        email_status VARCHAR(50) DEFAULT 'not_sent',
        last_email_sent TIMESTAMP,
        unsubscribe_token VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Tabela de campanhas de email
    await sql`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        template_type VARCHAR(20) DEFAULT 'promotional' CHECK (template_type IN ('promotional', 'newsletter', 'reactivation')),
        html_content TEXT,
        text_content TEXT,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'completed')),
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        total_recipients INTEGER DEFAULT 0,
        total_sent INTEGER DEFAULT 0,
        total_delivered INTEGER DEFAULT 0,
        total_opened INTEGER DEFAULT 0,
        total_clicked INTEGER DEFAULT 0,
        total_bounced INTEGER DEFAULT 0,
        total_unsubscribed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Tabela de envios (tracking individual)
    await sql`
      CREATE TABLE IF NOT EXISTS email_sends (
        id VARCHAR(255) PRIMARY KEY,
        campaign_id VARCHAR(255) REFERENCES email_campaigns(id) ON DELETE CASCADE,
        contact_id VARCHAR(255) REFERENCES email_contacts(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced', 'unsubscribed')),
        sent_at TIMESTAMP,
        delivered_at TIMESTAMP,
        opened_at TIMESTAMP,
        clicked_at TIMESTAMP,
        failed_reason TEXT,
        message_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Índices para performance
    await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON email_contacts(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_email_status ON email_contacts(email_status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_contacts_segmento ON email_contacts(segmento);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_sends_campaign_id ON email_sends(campaign_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_sends_contact_id ON email_sends(contact_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);`;

    console.log('✅ Tabelas de email marketing criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas de email marketing:', error);
    throw error;
  }
}

// CRUD Functions para Email Contacts
export class EmailContactsDB {
  
  static async create(contact: Omit<EmailContact, 'id' | 'created_at' | 'updated_at'>): Promise<EmailContact> {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await sql`
      INSERT INTO email_contacts (
        id, email, nome, sobrenome, telefone, segmento, tags, status, email_status, unsubscribe_token
      ) VALUES (
        ${id}, ${contact.email}, ${contact.nome}, ${contact.sobrenome || null}, 
        ${contact.telefone || null}, ${contact.segmento || 'geral'}, ${JSON.stringify(contact.tags || [])}, 
        ${contact.status}, ${contact.email_status}, ${contact.unsubscribe_token}
      ) RETURNING *;
    `;
    
    return result.rows[0] as EmailContact;
  }

  static async bulkCreate(contacts: Omit<EmailContact, 'id' | 'created_at' | 'updated_at'>[]): Promise<{inserted: number, duplicates: number, errors: string[]}> {
    let inserted = 0;
    let duplicates = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        // Verificar se email já existe
        const existing = await sql`SELECT id FROM email_contacts WHERE email = ${contact.email}`;
        
        if (existing.rows.length > 0) {
          duplicates++;
          continue;
        }

        await this.create(contact);
        inserted++;
      } catch (error) {
        errors.push(`Erro ao inserir ${contact.email}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return { inserted, duplicates, errors };
  }

  static async findAll(filters?: {
    status?: string;
    email_status?: string;
    segmento?: string;
    limit?: number;
    offset?: number;
  }): Promise<EmailContact[]> {
    let query = `SELECT * FROM email_contacts WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.email_status) {
      query += ` AND email_status = $${paramIndex}`;
      params.push(filters.email_status);
      paramIndex++;
    }

    if (filters?.segmento) {
      query += ` AND segmento = $${paramIndex}`;
      params.push(filters.segmento);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await sql.query(query, params);
    return result.rows as EmailContact[];
  }

  static async findById(id: string): Promise<EmailContact | null> {
    const result = await sql`SELECT * FROM email_contacts WHERE id = ${id}`;
    return result.rows[0] as EmailContact || null;
  }

  static async findByEmail(email: string): Promise<EmailContact | null> {
    const result = await sql`SELECT * FROM email_contacts WHERE email = ${email}`;
    return result.rows[0] as EmailContact || null;
  }

  static async updateEmailStatus(contactId: string, emailStatus: EmailContact['email_status'], lastEmailSent?: Date): Promise<void> {
    await sql`
      UPDATE email_contacts 
      SET email_status = ${emailStatus}, 
          last_email_sent = ${lastEmailSent?.toISOString() || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${contactId}
    `;
  }

  static async getStats(): Promise<{
    totalContacts: number;
    byStatus: Record<string, number>;
    byEmailStatus: Record<string, number>;
    bySegmento: Record<string, number>;
  }> {
    const [total, byStatus, byEmailStatus, bySegmento] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM email_contacts`,
      sql`SELECT status, COUNT(*) as count FROM email_contacts GROUP BY status`,
      sql`SELECT email_status, COUNT(*) as count FROM email_contacts GROUP BY email_status`,
      sql`SELECT segmento, COUNT(*) as count FROM email_contacts GROUP BY segmento`
    ]);

    return {
      totalContacts: parseInt(total.rows[0].count),
      byStatus: Object.fromEntries(byStatus.rows.map(row => [row.status, parseInt(row.count)])),
      byEmailStatus: Object.fromEntries(byEmailStatus.rows.map(row => [row.email_status, parseInt(row.count)])),
      bySegmento: Object.fromEntries(bySegmento.rows.map(row => [row.segmento, parseInt(row.count)]))
    };
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await sql`DELETE FROM email_contacts WHERE id = ${id}`;
    return (result.rowCount ?? 0) > 0;
  }

  static async unsubscribe(token: string): Promise<boolean> {
    const result = await sql`
      UPDATE email_contacts 
      SET status = 'unsubscribed', updated_at = CURRENT_TIMESTAMP
      WHERE unsubscribe_token = ${token}
    `;
    return (result.rowCount ?? 0) > 0;
  }
}

// CRUD Functions para Email Campaigns
export class EmailCampaignsDB {
  
  static async create(campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<EmailCampaign> {
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await sql`
      INSERT INTO email_campaigns (
        id, name, subject, template_type, html_content, text_content, status
      ) VALUES (
        ${id}, ${campaign.name}, ${campaign.subject}, ${campaign.template_type}, 
        ${campaign.html_content || null}, ${campaign.text_content || null}, ${campaign.status}
      ) RETURNING *;
    `;
    
    return result.rows[0] as EmailCampaign;
  }

  static async findAll(): Promise<EmailCampaign[]> {
    const result = await sql`SELECT * FROM email_campaigns ORDER BY created_at DESC`;
    return result.rows as EmailCampaign[];
  }

  static async findById(id: string): Promise<EmailCampaign | null> {
    const result = await sql`SELECT * FROM email_campaigns WHERE id = ${id}`;
    return result.rows[0] as EmailCampaign || null;
  }

  static async updateStatus(id: string, status: EmailCampaign['status']): Promise<void> {
    await sql`
      UPDATE email_campaigns 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  }

  static async updateStats(id: string, stats: Partial<Pick<EmailCampaign, 'total_recipients' | 'total_sent' | 'total_delivered' | 'total_opened' | 'total_clicked' | 'total_bounced'>>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(stats).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updates.length === 0) return;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE email_campaigns SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
    await sql.query(query, values);
  }
}

// CRUD Functions para Email Sends
export class EmailSendsDB {
  
  static async create(send: Omit<EmailSend, 'id' | 'created_at' | 'updated_at'>): Promise<EmailSend> {
    const id = `send_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await sql`
      INSERT INTO email_sends (
        id, campaign_id, contact_id, email, status, message_id
      ) VALUES (
        ${id}, ${send.campaign_id}, ${send.contact_id}, ${send.email}, ${send.status}, ${send.message_id || null}
      ) RETURNING *;
    `;
    
    return result.rows[0] as EmailSend;
  }

  static async updateStatus(id: string, status: EmailSend['status'], additionalData?: {
    sent_at?: Date;
    delivered_at?: Date;
    opened_at?: Date;
    clicked_at?: Date;
    failed_reason?: string;
    message_id?: string;
  }): Promise<void> {
    await sql`
      UPDATE email_sends 
      SET status = ${status}, 
          sent_at = ${additionalData?.sent_at?.toISOString() || null},
          delivered_at = ${additionalData?.delivered_at?.toISOString() || null},
          opened_at = ${additionalData?.opened_at?.toISOString() || null},
          clicked_at = ${additionalData?.clicked_at?.toISOString() || null},
          failed_reason = ${additionalData?.failed_reason || null},
          message_id = ${additionalData?.message_id || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
  }

  static async findByCampaign(campaignId: string): Promise<EmailSend[]> {
    const result = await sql`SELECT * FROM email_sends WHERE campaign_id = ${campaignId} ORDER BY created_at DESC`;
    return result.rows as EmailSend[];
  }

  static async getCampaignStats(campaignId: string): Promise<Record<string, number>> {
    const result = await sql`
      SELECT status, COUNT(*) as count 
      FROM email_sends 
      WHERE campaign_id = ${campaignId} 
      GROUP BY status
    `;
    
    return Object.fromEntries(result.rows.map(row => [row.status, parseInt(row.count)]));
  }
}

// Utility function para gerar token de unsubscribe
export function generateUnsubscribeToken(): string {
  return `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}