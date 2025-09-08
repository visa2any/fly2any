/**
 * Email Marketing Database - V2 Compatible Version
 * Database operations for email marketing system
 */

import { Pool } from 'pg';

// Database connection
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

// Types
export interface EmailContact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  tags?: string[];
  metadata?: Record<string, any>;
  subscribedAt?: string;
  unsubscribedAt?: string;
  unsubscribeToken?: string;
  lastActivity?: string;
  engagementScore?: number;
}

export interface EmailCampaign {
  id?: string;
  name: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'completed';
  templateType?: string;
  segmentId?: string;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  totalSent?: number;
  totalRecipients?: number;
  totalDelivered?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalBounced?: number;
  totalUnsubscribed?: number;
  sendRate?: number;
  metadata?: Record<string, any>;
}

export interface EmailSend {
  id?: string;
  contactId: string;
  campaignId: string;
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'bounced' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  failureReason?: string;
  retryCount?: number;
  maxRetries?: number;
  metadata?: Record<string, any>;
}

// Utility function to generate unsubscribe token
export function generateUnsubscribeToken(): string {
  return Buffer.from(Math.random().toString(36) + Date.now().toString(36)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}

// Email Contacts Database Operations
export class EmailContactsDB {
  static async create(contact: EmailContact): Promise<EmailContact> {
    const pool = getPool();
    const unsubscribeToken = contact.unsubscribeToken || generateUnsubscribeToken();
    
    const query = `
      INSERT INTO email_contacts 
      (email, first_name, last_name, status, tags, metadata, subscribed_at, unsubscribe_token, engagement_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      contact.email,
      contact.firstName || null,
      contact.lastName || null,
      contact.status || 'active',
      JSON.stringify(contact.tags || []),
      JSON.stringify(contact.metadata || {}),
      contact.subscribedAt || new Date().toISOString(),
      unsubscribeToken,
      contact.engagementScore || 0
    ];

    try {
      const result = await pool.query(query, values);
      return this.formatContact(result.rows[0]);
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact');
    }
  }

  static async getAll(limit = 100, offset = 0): Promise<EmailContact[]> {
    const pool = getPool();
    
    const query = `
      SELECT * FROM email_contacts 
      ORDER BY subscribed_at DESC 
      LIMIT $1 OFFSET $2
    `;

    try {
      const result = await pool.query(query, [limit, offset]);
      return result.rows.map(this.formatContact);
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  static async getById(id: string): Promise<EmailContact | null> {
    const pool = getPool();
    
    const query = 'SELECT * FROM email_contacts WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.formatContact(result.rows[0]) : null;
    } catch (error) {
      console.error('Error getting contact:', error);
      return null;
    }
  }

  static async getByEmail(email: string): Promise<EmailContact | null> {
    const pool = getPool();
    
    const query = 'SELECT * FROM email_contacts WHERE email = $1';

    try {
      const result = await pool.query(query, [email]);
      return result.rows.length > 0 ? this.formatContact(result.rows[0]) : null;
    } catch (error) {
      console.error('Error getting contact by email:', error);
      return null;
    }
  }

  static async update(id: string, updates: Partial<EmailContact>): Promise<EmailContact | null> {
    const pool = getPool();
    
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.firstName !== undefined) {
      setClause.push(`first_name = $${paramCount++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      setClause.push(`last_name = $${paramCount++}`);
      values.push(updates.lastName);
    }
    if (updates.status !== undefined) {
      setClause.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.tags !== undefined) {
      setClause.push(`tags = $${paramCount++}`);
      values.push(JSON.stringify(updates.tags));
    }
    if (updates.metadata !== undefined) {
      setClause.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(updates.metadata));
    }
    if (updates.engagementScore !== undefined) {
      setClause.push(`engagement_score = $${paramCount++}`);
      values.push(updates.engagementScore);
    }

    if (setClause.length === 0) return null;

    setClause.push(`updated_at = $${paramCount++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const query = `
      UPDATE email_contacts 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? this.formatContact(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating contact:', error);
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    const pool = getPool();
    
    const query = 'DELETE FROM email_contacts WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  }

  static async getByStatus(status: string): Promise<EmailContact[]> {
    const pool = getPool();
    
    const query = 'SELECT * FROM email_contacts WHERE status = $1 ORDER BY subscribed_at DESC';

    try {
      const result = await pool.query(query, [status]);
      return result.rows.map(this.formatContact);
    } catch (error) {
      console.error('Error getting contacts by status:', error);
      return [];
    }
  }

  static async bulkCreate(contacts: EmailContact[]): Promise<{ inserted: EmailContact[]; duplicates: EmailContact[]; errors: string[] }> {
    const pool = getPool();
    const client = await pool.connect();
    const inserted: EmailContact[] = [];
    const duplicates: EmailContact[] = [];
    const errors: string[] = [];

    try {
      await client.query('BEGIN');

      for (const contact of contacts) {
        try {
          const unsubscribeToken = contact.unsubscribeToken || generateUnsubscribeToken();
          
          // First check if exists
          const existsQuery = 'SELECT * FROM email_contacts WHERE email = $1';
          const existsResult = await client.query(existsQuery, [contact.email]);
          
          if (existsResult.rows.length > 0) {
            duplicates.push(this.formatContact(existsResult.rows[0]));
            continue;
          }
          
          const query = `
            INSERT INTO email_contacts 
            (email, first_name, last_name, status, tags, metadata, subscribed_at, unsubscribe_token, engagement_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
          `;
          
          const values = [
            contact.email,
            contact.firstName || null,
            contact.lastName || null,
            contact.status || 'active',
            JSON.stringify(contact.tags || []),
            JSON.stringify(contact.metadata || {}),
            contact.subscribedAt || new Date().toISOString(),
            unsubscribeToken,
            contact.engagementScore || 0
          ];

          const result = await client.query(query, values);
          inserted.push(this.formatContact(result.rows[0]));
        } catch (error) {
          errors.push(`Error with contact ${contact.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await client.query('COMMIT');
      return { inserted, duplicates, errors };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error bulk creating contacts:', error);
      return { inserted: [], duplicates: [], errors: [error instanceof Error ? error.message : 'Unknown error'] };
    } finally {
      client.release();
    }
  }

  // Additional methods needed by API routes
  static async findById(id: string): Promise<EmailContact | null> {
    return this.getById(id);
  }

  // Overloaded signatures
  static async findAll(limit?: number, offset?: number): Promise<EmailContact[]>;
  static async findAll(filters: {
    status?: string;
    email_status?: string;
    segmento?: string;
    limit?: number;
    offset?: number;
  }): Promise<EmailContact[]>;
  static async findAll(limitOrFilters: number | {
    status?: string;
    email_status?: string;
    segmento?: string;
    limit?: number;
    offset?: number;
  } = 100, offset = 0): Promise<EmailContact[]> {
    if (typeof limitOrFilters === 'object' && limitOrFilters !== null) {
      // Handle filter object
      const filters = limitOrFilters;
      const pool = getPool();
      
      const whereClauses: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (filters.status) {
        whereClauses.push(`status = $${paramCount++}`);
        values.push(filters.status);
      }
      
      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      
      const query = `
        SELECT * FROM email_contacts 
        ${whereClause}
        ORDER BY subscribed_at DESC 
        LIMIT $${paramCount++} OFFSET $${paramCount}
      `;
      
      values.push(limit, offset);
      
      try {
        const result = await pool.query(query, values);
        return result.rows.map(this.formatContact);
      } catch (error) {
        console.error('Error finding contacts with filters:', error);
        return [];
      }
    } else {
      // Handle simple limit/offset parameters
      return this.getAll(limitOrFilters || 100, offset);
    }
  }

  static async deleteById(id: string): Promise<boolean> {
    return this.delete(id);
  }

  static async updateEmailStatus(id: string, status: string): Promise<boolean> {
    try {
      const result = await this.update(id, { status: status as any });
      return result !== null;
    } catch (error) {
      return false;
    }
  }

  static async getStats(): Promise<any> {
    const pool = getPool();
    
    try {
      const query = `
        SELECT 
          status,
          COUNT(*) as count
        FROM email_contacts
        GROUP BY status
      `;
      
      const result = await pool.query(query);
      const stats: Record<string, number> = { total: 0, active: 0, unsubscribed: 0, bounced: 0 };
      
      for (const row of result.rows) {
        stats[row.status] = parseInt(row.count);
        stats.total += parseInt(row.count);
      }
      
      return stats;
    } catch (error) {
      return { total: 0, active: 0, unsubscribed: 0, bounced: 0 };
    }
  }

  private static formatContact(row: any): EmailContact {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      status: row.status,
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
      metadata: typeof row.metadata === 'object' ? row.metadata : JSON.parse(row.metadata || '{}'),
      subscribedAt: row.subscribed_at,
      unsubscribedAt: row.unsubscribed_at,
      unsubscribeToken: row.unsubscribe_token,
      lastActivity: row.last_activity,
      engagementScore: row.engagement_score || 0
    };
  }
}

// Email Campaigns Database Operations  
export class EmailCampaignsDB {
  static async create(campaign: EmailCampaign): Promise<EmailCampaign> {
    const pool = getPool();
    
    const query = `
      INSERT INTO email_campaigns 
      (name, subject, html_content, text_content, status, template_type, segment_id, scheduled_at, metadata, send_rate)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      campaign.name,
      campaign.subject || null,
      campaign.htmlContent || null,
      campaign.textContent || null,
      campaign.status || 'draft',
      campaign.templateType || null,
      campaign.segmentId || null,
      campaign.scheduledAt || null,
      JSON.stringify(campaign.metadata || {}),
      campaign.sendRate || 50
    ];

    try {
      const result = await pool.query(query, values);
      return this.formatCampaign(result.rows[0]);
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }

  static async getAll(): Promise<EmailCampaign[]> {
    const pool = getPool();
    
    const query = 'SELECT * FROM email_campaigns ORDER BY created_at DESC';

    try {
      const result = await pool.query(query);
      return result.rows.map(this.formatCampaign);
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return [];
    }
  }

  static async getById(id: string): Promise<EmailCampaign | null> {
    const pool = getPool();
    
    const query = 'SELECT * FROM email_campaigns WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.formatCampaign(result.rows[0]) : null;
    } catch (error) {
      console.error('Error getting campaign:', error);
      return null;
    }
  }

  static async updateStatus(id: string, status: string): Promise<EmailCampaign | null> {
    const pool = getPool();
    
    const query = `
      UPDATE email_campaigns 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, id]);
      return result.rows.length > 0 ? this.formatCampaign(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating campaign status:', error);
      return null;
    }
  }

  static async updateStats(id: string, stats: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    const pool = getPool();
    
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (stats.totalSent !== undefined) {
      setClause.push(`total_sent = $${paramCount++}`);
      values.push(stats.totalSent);
    }
    if (stats.totalDelivered !== undefined) {
      setClause.push(`total_delivered = $${paramCount++}`);
      values.push(stats.totalDelivered);
    }
    if (stats.totalOpened !== undefined) {
      setClause.push(`total_opened = $${paramCount++}`);
      values.push(stats.totalOpened);
    }
    if (stats.totalClicked !== undefined) {
      setClause.push(`total_clicked = $${paramCount++}`);
      values.push(stats.totalClicked);
    }
    if (stats.totalBounced !== undefined) {
      setClause.push(`total_bounced = $${paramCount++}`);
      values.push(stats.totalBounced);
    }
    if (stats.totalUnsubscribed !== undefined) {
      setClause.push(`total_unsubscribed = $${paramCount++}`);
      values.push(stats.totalUnsubscribed);
    }

    if (setClause.length === 0) return null;

    setClause.push(`updated_at = $${paramCount++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const query = `
      UPDATE email_campaigns 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? this.formatCampaign(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating campaign stats:', error);
      return null;
    }
  }

  static async getByStatus(status: string): Promise<EmailCampaign[]> {
    const pool = getPool();
    
    const query = 'SELECT * FROM email_campaigns WHERE status = $1 ORDER BY created_at DESC';

    try {
      const result = await pool.query(query, [status]);
      return result.rows.map(this.formatCampaign);
    } catch (error) {
      console.error('Error getting campaigns by status:', error);
      return [];
    }
  }

  // Additional methods needed by API routes
  static async findById(id: string): Promise<EmailCampaign | null> {
    return this.getById(id);
  }

  static async findAll(): Promise<EmailCampaign[]> {
    return this.getAll();
  }

  static async incrementOpened(id: string): Promise<boolean> {
    const pool = getPool();
    
    try {
      const query = `
        UPDATE email_campaigns 
        SET total_opened = total_opened + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      return false;
    }
  }

  static async getMetrics(): Promise<any> {
    const pool = getPool();
    
    try {
      const query = `
        SELECT 
          status,
          COUNT(*) as count,
          AVG(total_sent) as avg_sent,
          SUM(total_opened) as total_opens,
          SUM(total_clicked) as total_clicks
        FROM email_campaigns
        GROUP BY status
      `;
      
      const result = await pool.query(query);
      const metrics: Record<string, any> = {
        total: 0,
        draft: 0,
        sent: 0,
        completed: 0,
        totalOpens: 0,
        totalClicks: 0,
        avgSent: 0
      };
      
      for (const row of result.rows) {
        metrics[row.status] = parseInt(row.count);
        metrics.total += parseInt(row.count);
        metrics.totalOpens += parseInt(row.total_opens || 0);
        metrics.totalClicks += parseInt(row.total_clicks || 0);
        metrics.avgSent += parseFloat(row.avg_sent || 0);
      }
      
      if (result.rows.length > 0) {
        metrics.avgSent = metrics.avgSent / result.rows.length;
      }
      
      return metrics;
    } catch (error) {
      return {
        total: 0,
        draft: 0,
        sent: 0,
        completed: 0,
        totalOpens: 0,
        totalClicks: 0,
        avgSent: 0
      };
    }
  }

  static async incrementClicked(id: string): Promise<boolean> {
    const pool = getPool();
    
    try {
      const query = `
        UPDATE email_campaigns 
        SET total_clicked = total_clicked + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      return false;
    }
  }

  static async deleteById(id: string): Promise<boolean> {
    const pool = getPool();
    
    try {
      const query = 'DELETE FROM email_campaigns WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      return false;
    }
  }

  static async updateTimestamp(id: string): Promise<boolean> {
    const pool = getPool();
    
    try {
      const query = `
        UPDATE email_campaigns 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      return false;
    }
  }

  private static formatCampaign(row: any): EmailCampaign {
    return {
      id: row.id,
      name: row.name,
      subject: row.subject,
      htmlContent: row.html_content,
      textContent: row.text_content,
      status: row.status,
      templateType: row.template_type,
      segmentId: row.segment_id,
      scheduledAt: row.scheduled_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      totalSent: row.total_sent || 0,
      totalDelivered: row.total_delivered || 0,
      totalOpened: row.total_opened || 0,
      totalClicked: row.total_clicked || 0,
      totalBounced: row.total_bounced || 0,
      totalUnsubscribed: row.total_unsubscribed || 0,
      sendRate: row.send_rate || 50,
      metadata: typeof row.metadata === 'object' ? row.metadata : JSON.parse(row.metadata || '{}')
    };
  }
}

// Email Sends Database Operations
export class EmailSendsDB {
  static async create(send: EmailSend): Promise<EmailSend> {
    const pool = getPool();
    
    const query = `
      INSERT INTO email_sends 
      (contact_id, campaign_id, status, retry_count, max_retries, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      send.contactId,
      send.campaignId,
      send.status || 'pending',
      send.retryCount || 0,
      send.maxRetries || 3,
      JSON.stringify(send.metadata || {})
    ];

    try {
      const result = await pool.query(query, values);
      return this.formatSend(result.rows[0]);
    } catch (error) {
      console.error('Error creating send:', error);
      throw new Error('Failed to create send');
    }
  }

  static async getByCampaign(campaignId: string): Promise<EmailSend[]> {
    const pool = getPool();
    
    const query = 'SELECT * FROM email_sends WHERE campaign_id = $1 ORDER BY created_at DESC';

    try {
      const result = await pool.query(query, [campaignId]);
      return result.rows.map(this.formatSend);
    } catch (error) {
      console.error('Error getting sends by campaign:', error);
      return [];
    }
  }

  static async updateStatus(id: string, status: string, metadata?: Record<string, any>): Promise<EmailSend | null> {
    const pool = getPool();
    
    const statusFields: Record<string, string> = {
      'sent': 'sent_at',
      'delivered': 'delivered_at', 
      'opened': 'opened_at',
      'clicked': 'clicked_at',
      'bounced': 'bounced_at'
    };

    const setClause = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];
    let paramCount = 2;

    if (statusFields[status]) {
      setClause.push(`${statusFields[status]} = $${paramCount++}`);
      values.push(new Date().toISOString());
    }

    if (metadata) {
      setClause.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(metadata));
    }

    values.push(id);

    const query = `
      UPDATE email_sends 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? this.formatSend(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating send status:', error);
      return null;
    }
  }

  static async getByStatus(status: string): Promise<EmailSend[]> {
    const pool = getPool();
    
    const query = 'SELECT * FROM email_sends WHERE status = $1 ORDER BY created_at ASC';

    try {
      const result = await pool.query(query, [status]);
      return result.rows.map(this.formatSend);
    } catch (error) {
      console.error('Error getting sends by status:', error);
      return [];
    }
  }

  static async incrementRetry(id: string): Promise<EmailSend | null> {
    const pool = getPool();
    
    const query = `
      UPDATE email_sends 
      SET retry_count = retry_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.formatSend(result.rows[0]) : null;
    } catch (error) {
      console.error('Error incrementing retry:', error);
      return null;
    }
  }

  static isRetryableError(error: string): boolean {
    // Determine if an error is retryable (rate limits, temporary failures, etc.)
    const retryablePatterns = [
      /rate limit/i,
      /temporary/i,
      /timeout/i,
      /connection/i,
      /server error/i,
      /502/,
      /503/,
      /504/
    ];
    
    return retryablePatterns.some(pattern => pattern.test(error));
  }

  static async scheduleRetry(id: string, retryAfter: number = 300): Promise<boolean> {
    // In a real implementation, this would schedule the retry
    // For now, just increment the retry count
    try {
      await this.incrementRetry(id);
      return true;
    } catch (error) {
      console.error('Error scheduling retry:', error);
      return false;
    }
  }

  static async findByCampaign(campaignId: string): Promise<EmailSend[]> {
    return this.getByCampaign(campaignId);
  }

  static async getCampaignStats(campaignId: string): Promise<any> {
    const pool = getPool();
    
    try {
      const query = `
        SELECT 
          status,
          COUNT(*) as count
        FROM email_sends
        WHERE campaign_id = $1
        GROUP BY status
      `;
      
      const result = await pool.query(query, [campaignId]);
      const stats: Record<string, number> = {
        total: 0,
        pending: 0,
        sent: 0,
        delivered: 0,
        bounced: 0,
        failed: 0
      };
      
      for (const row of result.rows) {
        stats[row.status] = parseInt(row.count);
        stats.total += parseInt(row.count);
      }
      
      return stats;
    } catch (error) {
      return {
        total: 0,
        pending: 0,
        sent: 0,
        delivered: 0,
        bounced: 0,
        failed: 0
      };
    }
  }

  static async findFailedForRetry(maxHoursOld = 24): Promise<EmailSend[]> {
    const pool = getPool();
    
    try {
      const query = `
        SELECT * FROM email_sends 
        WHERE status = 'failed' 
        AND retry_count < max_retries
        AND created_at > NOW() - INTERVAL '${maxHoursOld} hours'
        ORDER BY created_at ASC
        LIMIT 100
      `;
      
      const result = await pool.query(query);
      return result.rows.map(this.formatSend);
    } catch (error) {
      console.error('Error finding failed sends for retry:', error);
      return [];
    }
  }

  private static formatSend(row: any): EmailSend {
    return {
      id: row.id,
      contactId: row.contact_id,
      campaignId: row.campaign_id,
      status: row.status,
      sentAt: row.sent_at,
      deliveredAt: row.delivered_at,
      openedAt: row.opened_at,
      clickedAt: row.clicked_at,
      bouncedAt: row.bounced_at,
      failureReason: row.failure_reason,
      retryCount: row.retry_count || 0,
      maxRetries: row.max_retries || 3,
      metadata: typeof row.metadata === 'object' ? row.metadata : JSON.parse(row.metadata || '{}')
    };
  }
}

// Additional methods for EmailContactsDB
export class EmailContactsDBExtended extends EmailContactsDB {
  static async updateEmailStatus(id: string, status: string): Promise<boolean> {
    try {
      const result = await this.update(id, { status: status as any });
      return result !== null;
    } catch (error) {
      console.error('Error updating email status:', error);
      return false;
    }
  }

  static async getStats(): Promise<any> {
    const pool = getPool();
    
    try {
      const query = `
        SELECT 
          status,
          COUNT(*) as count
        FROM email_contacts
        GROUP BY status
      `;
      
      const result = await pool.query(query);
      const stats: Record<string, number> = {};
      
      for (const row of result.rows) {
        stats[row.status] = parseInt(row.count);
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting contact stats:', error);
      return {};
    }
  }

}

// Additional methods for EmailCampaignsDB
export class EmailCampaignsDBExtended extends EmailCampaignsDB {
  static async findAll(): Promise<EmailCampaign[]> {
    return this.getAll();
  }

  static async findById(id: string): Promise<EmailCampaign | null> {
    return this.getById(id);
  }
}

// Additional exports needed by the API routes
export async function initEmailMarketingTables(): Promise<boolean> {
  try {
    const pool = getPool();
    
    // Create tables if they don't exist (basic schema)
    const createTablesQueries = [
      `
      CREATE TABLE IF NOT EXISTS email_contacts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        tags JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at TIMESTAMP,
        unsubscribe_token VARCHAR(64) UNIQUE,
        last_activity TIMESTAMP,
        engagement_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500),
        html_content TEXT,
        text_content TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        template_type VARCHAR(50),
        segment_id UUID,
        scheduled_at TIMESTAMP,
        total_sent INTEGER DEFAULT 0,
        total_delivered INTEGER DEFAULT 0,
        total_opened INTEGER DEFAULT 0,
        total_clicked INTEGER DEFAULT 0,
        total_bounced INTEGER DEFAULT 0,
        total_unsubscribed INTEGER DEFAULT 0,
        send_rate INTEGER DEFAULT 50,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS email_sends (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        sent_at TIMESTAMP,
        delivered_at TIMESTAMP,
        opened_at TIMESTAMP,
        clicked_at TIMESTAMP,
        bounced_at TIMESTAMP,
        failure_reason TEXT,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `
    ];

    for (const query of createTablesQueries) {
      await pool.query(query);
    }

    console.log('Email marketing tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize email marketing tables:', error);
    return false;
  }
}

export async function processEmailRetries(): Promise<any> {
  try {
    const pool = getPool();
    
    // Get failed sends that can be retried
    const query = `
      SELECT es.*, ec.email, ec.first_name, ec.last_name, c.name as campaign_name
      FROM email_sends es
      JOIN email_contacts ec ON es.contact_id = ec.id
      JOIN email_campaigns c ON es.campaign_id = c.id
      WHERE es.status = 'failed' 
      AND es.retry_count < es.max_retries
      AND es.created_at > NOW() - INTERVAL '7 days'
      ORDER BY es.created_at ASC
      LIMIT 100
    `;

    const result = await pool.query(query);
    const retries = result.rows;

    let processedCount = 0;
    for (const retry of retries) {
      // In a real implementation, this would attempt to resend the email
      await EmailSendsDB.incrementRetry(retry.id);
      processedCount++;
    }

    return {
      success: true,
      processed: processedCount,
      total: retries.length
    };
  } catch (error) {
    console.error('Error processing email retries:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}