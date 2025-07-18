import { sql } from '@vercel/postgres';

export interface PhoneContact {
  id: string;
  phone: string;
  formatted_phone: string;
  name: string;
  
  // Localização
  state: string;
  area_code: string;
  city?: string;
  timezone?: string;
  
  // Validação
  is_validated: boolean;
  validation_result?: any;
  is_active: boolean;
  carrier?: string;
  line_type?: 'mobile' | 'landline' | 'voip';
  
  // Segmentação
  segment: string;
  tags: string[];
  customer_profile?: any;
  notes?: string;
  
  // Compliance
  opted_out: boolean;
  opt_out_date?: Date;
  consent_date?: Date;
  last_contact_date?: Date;
  
  // Performance
  total_campaigns: number;
  response_rate: number;
  conversion_rate: number;
  lead_score: number;
  
  created_at: Date;
  updated_at: Date;
}

export interface PhoneList {
  id: string;
  name: string;
  description?: string;
  color?: string;
  total_contacts: number;
  created_by: string;
  is_smart: boolean;
  smart_criteria?: any;
  created_at: Date;
  updated_at: Date;
}

export interface PhoneListContact {
  id: string;
  list_id: string;
  contact_id: string;
  added_at: Date;
}

export interface PhoneCampaign {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp' | 'call';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  
  message_template?: string;
  target_segments: string[];
  target_states: string[];
  schedule_config?: any;
  
  total_sent: number;
  total_delivered: number;
  total_responses: number;
  total_conversions: number;
  total_opt_outs: number;
  
  cost_per_message?: number;
  total_budget?: number;
  total_spent?: number;
  
  created_by: string;
  created_at: Date;
  completed_at?: Date;
}

export interface PhoneCommunication {
  id: string;
  phone_contact_id: string;
  campaign_id?: string;
  
  type: 'sms' | 'whatsapp' | 'call';
  direction: 'outbound' | 'inbound';
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  
  message?: string;
  response?: string;
  response_time?: string;
  
  cost?: number;
  provider_response?: any;
  
  sent_at: Date;
  delivered_at?: Date;
  read_at?: Date;
  replied_at?: Date;
}

export class PhoneDatabaseService {
  
  // Inicializar todas as tabelas
  static async initializeTables(): Promise<void> {
    try {
      // Tabela principal de contatos telefônicos
      await sql`
        CREATE TABLE IF NOT EXISTS phone_contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          phone VARCHAR(20) UNIQUE NOT NULL,
          formatted_phone VARCHAR(25),
          name VARCHAR(255) NOT NULL,
          
          -- Localização
          state VARCHAR(50) NOT NULL,
          area_code VARCHAR(3) NOT NULL,
          city VARCHAR(100),
          timezone VARCHAR(50),
          
          -- Validação
          is_validated BOOLEAN DEFAULT FALSE,
          validation_result JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          carrier VARCHAR(100),
          line_type VARCHAR(50),
          
          -- Segmentação
          segment VARCHAR(100) DEFAULT 'geral',
          tags JSONB DEFAULT '[]',
          customer_profile JSONB,
          notes TEXT,
          
          -- Compliance
          opted_out BOOLEAN DEFAULT FALSE,
          opt_out_date TIMESTAMP,
          consent_date TIMESTAMP,
          last_contact_date TIMESTAMP,
          
          -- Performance
          total_campaigns INTEGER DEFAULT 0,
          response_rate DECIMAL(5,2) DEFAULT 0,
          conversion_rate DECIMAL(5,2) DEFAULT 0,
          lead_score INTEGER DEFAULT 0,
          
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;

      // Índices para performance
      await sql`
        CREATE INDEX IF NOT EXISTS idx_phone_contacts_phone ON phone_contacts(phone);
        CREATE INDEX IF NOT EXISTS idx_phone_contacts_state ON phone_contacts(state);
        CREATE INDEX IF NOT EXISTS idx_phone_contacts_area_code ON phone_contacts(area_code);
        CREATE INDEX IF NOT EXISTS idx_phone_contacts_segment ON phone_contacts(segment);
        CREATE INDEX IF NOT EXISTS idx_phone_contacts_active ON phone_contacts(is_active);
        CREATE INDEX IF NOT EXISTS idx_phone_contacts_opted_out ON phone_contacts(opted_out);
      `;

      // Tabela de listas
      await sql`
        CREATE TABLE IF NOT EXISTS phone_lists (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          color VARCHAR(7),
          total_contacts INTEGER DEFAULT 0,
          created_by VARCHAR(255),
          is_smart BOOLEAN DEFAULT FALSE,
          smart_criteria JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;

      // Relacionamento lista-contato (muitos para muitos)
      await sql`
        CREATE TABLE IF NOT EXISTS phone_list_contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          list_id UUID REFERENCES phone_lists(id) ON DELETE CASCADE,
          contact_id UUID REFERENCES phone_contacts(id) ON DELETE CASCADE,
          added_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(list_id, contact_id)
        );
      `;

      // Tabela de campanhas
      await sql`
        CREATE TABLE IF NOT EXISTS phone_campaigns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'draft',
          
          message_template TEXT,
          target_segments JSONB DEFAULT '[]',
          target_states JSONB DEFAULT '[]',
          schedule_config JSONB,
          
          total_sent INTEGER DEFAULT 0,
          total_delivered INTEGER DEFAULT 0,
          total_responses INTEGER DEFAULT 0,
          total_conversions INTEGER DEFAULT 0,
          total_opt_outs INTEGER DEFAULT 0,
          
          cost_per_message DECIMAL(8,4),
          total_budget DECIMAL(10,2),
          total_spent DECIMAL(10,2),
          
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP
        );
      `;

      // Tabela de comunicações
      await sql`
        CREATE TABLE IF NOT EXISTS phone_communications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          phone_contact_id UUID REFERENCES phone_contacts(id),
          campaign_id UUID REFERENCES phone_campaigns(id),
          
          type VARCHAR(50) NOT NULL,
          direction VARCHAR(10) NOT NULL,
          status VARCHAR(50) NOT NULL,
          
          message TEXT,
          response TEXT,
          response_time INTERVAL,
          
          cost DECIMAL(8,4),
          provider_response JSONB,
          
          sent_at TIMESTAMP DEFAULT NOW(),
          delivered_at TIMESTAMP,
          read_at TIMESTAMP,
          replied_at TIMESTAMP
        );
      `;

      console.log('✅ Phone management tables initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing phone tables:', error);
      throw error;
    }
  }

  // CRUD para contatos
  static async createContact(contact: Omit<PhoneContact, 'id' | 'created_at' | 'updated_at'>): Promise<PhoneContact> {
    try {
      const result = await sql`
        INSERT INTO phone_contacts (
          phone, formatted_phone, name, state, area_code, city, timezone,
          is_validated, validation_result, is_active, carrier, line_type,
          segment, tags, customer_profile, notes,
          opted_out, consent_date, total_campaigns, response_rate,
          conversion_rate, lead_score
        ) VALUES (
          ${contact.phone}, ${contact.formatted_phone}, ${contact.name}, 
          ${contact.state}, ${contact.area_code}, ${contact.city}, ${contact.timezone},
          ${contact.is_validated}, ${JSON.stringify(contact.validation_result)}, 
          ${contact.is_active}, ${contact.carrier}, ${contact.line_type},
          ${contact.segment}, ${JSON.stringify(contact.tags)}, 
          ${JSON.stringify(contact.customer_profile)}, ${contact.notes},
          ${contact.opted_out}, ${contact.consent_date?.toISOString()}, ${contact.total_campaigns},
          ${contact.response_rate}, ${contact.conversion_rate}, ${contact.lead_score}
        )
        RETURNING *
      `;
      
      return result.rows[0] as PhoneContact;
    } catch (error) {
      console.error('Error creating phone contact:', error);
      throw error;
    }
  }

  static async getContacts(filters?: {
    state?: string;
    segment?: string;
    is_active?: boolean;
    opted_out?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ contacts: PhoneContact[]; total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.state) {
        whereClause += ` AND state = $${paramIndex}`;
        params.push(filters.state);
        paramIndex++;
      }

      if (filters?.segment) {
        whereClause += ` AND segment = $${paramIndex}`;
        params.push(filters.segment);
        paramIndex++;
      }

      if (filters?.is_active !== undefined) {
        whereClause += ` AND is_active = $${paramIndex}`;
        params.push(filters.is_active);
        paramIndex++;
      }

      if (filters?.opted_out !== undefined) {
        whereClause += ` AND opted_out = $${paramIndex}`;
        params.push(filters.opted_out);
        paramIndex++;
      }

      if (filters?.search) {
        whereClause += ` AND (name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      // Count total
      const countResult = await sql.query(
        `SELECT COUNT(*) as total FROM phone_contacts ${whereClause}`,
        params
      );

      // Get contacts with pagination
      let query = `SELECT * FROM phone_contacts ${whereClause} ORDER BY created_at DESC`;
      
      if (filters?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      if (filters?.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
        paramIndex++;
      }

      const contactsResult = await sql.query(query, params);

      return {
        contacts: contactsResult.rows as PhoneContact[],
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting phone contacts:', error);
      throw error;
    }
  }

  static async updateContact(id: string, updates: Partial<PhoneContact>): Promise<PhoneContact> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && value !== undefined) {
          if (typeof value === 'object' && value !== null) {
            if (value instanceof Date) {
              setClauses.push(`${key} = $${paramIndex}`);
              params.push(value.toISOString());
            } else {
              setClauses.push(`${key} = $${paramIndex}`);
              params.push(JSON.stringify(value));
            }
          } else {
            setClauses.push(`${key} = $${paramIndex}`);
            params.push(value);
          }
          paramIndex++;
        }
      });

      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      const result = await sql.query(
        `UPDATE phone_contacts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        params
      );

      return result.rows[0] as PhoneContact;
    } catch (error) {
      console.error('Error updating phone contact:', error);
      throw error;
    }
  }

  static async deleteContact(id: string): Promise<void> {
    try {
      await sql`DELETE FROM phone_contacts WHERE id = ${id}`;
    } catch (error) {
      console.error('Error deleting phone contact:', error);
      throw error;
    }
  }

  static async deleteMultipleContacts(ids: string[]): Promise<void> {
    try {
      await sql.query(
        `DELETE FROM phone_contacts WHERE id = ANY($1)`,
        [ids]
      );
    } catch (error) {
      console.error('Error deleting multiple contacts:', error);
      throw error;
    }
  }

  // CRUD para listas
  static async createList(list: Omit<PhoneList, 'id' | 'created_at' | 'updated_at'>): Promise<PhoneList> {
    try {
      const result = await sql`
        INSERT INTO phone_lists (name, description, color, total_contacts, created_by, is_smart, smart_criteria)
        VALUES (${list.name}, ${list.description}, ${list.color}, ${list.total_contacts}, 
                ${list.created_by}, ${list.is_smart}, ${JSON.stringify(list.smart_criteria)})
        RETURNING *
      `;
      
      return result.rows[0] as PhoneList;
    } catch (error) {
      console.error('Error creating phone list:', error);
      throw error;
    }
  }

  static async getLists(): Promise<PhoneList[]> {
    try {
      const result = await sql`SELECT * FROM phone_lists ORDER BY created_at DESC`;
      return result.rows as PhoneList[];
    } catch (error) {
      console.error('Error getting phone lists:', error);
      throw error;
    }
  }

  static async addContactsToList(listId: string, contactIds: string[]): Promise<void> {
    try {
      for (const contactId of contactIds) {
        await sql`
          INSERT INTO phone_list_contacts (list_id, contact_id)
          VALUES (${listId}, ${contactId})
          ON CONFLICT (list_id, contact_id) DO NOTHING
        `;
      }

      // Update contact count
      await sql`
        UPDATE phone_lists 
        SET total_contacts = (
          SELECT COUNT(*) FROM phone_list_contacts WHERE list_id = ${listId}
        )
        WHERE id = ${listId}
      `;
    } catch (error) {
      console.error('Error adding contacts to list:', error);
      throw error;
    }
  }

  static async removeContactsFromList(listId: string, contactIds: string[]): Promise<void> {
    try {
      await sql.query(
        `DELETE FROM phone_list_contacts WHERE list_id = $1 AND contact_id = ANY($2)`,
        [listId, contactIds]
      );

      // Update contact count
      await sql`
        UPDATE phone_lists 
        SET total_contacts = (
          SELECT COUNT(*) FROM phone_list_contacts WHERE list_id = ${listId}
        )
        WHERE id = ${listId}
      `;
    } catch (error) {
      console.error('Error removing contacts from list:', error);
      throw error;
    }
  }

  // Estatísticas por estado
  static async getStateStats(): Promise<Array<{
    state: string;
    total: number;
    validated: number;
    active: number;
    opted_out: number;
  }>> {
    try {
      const result = await sql`
        SELECT 
          state,
          COUNT(*) as total,
          SUM(CASE WHEN is_validated THEN 1 ELSE 0 END) as validated,
          SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN opted_out THEN 1 ELSE 0 END) as opted_out
        FROM phone_contacts
        GROUP BY state
        ORDER BY total DESC
      `;
      
      return result.rows.map(row => ({
        state: row.state,
        total: parseInt(row.total),
        validated: parseInt(row.validated),
        active: parseInt(row.active),
        opted_out: parseInt(row.opted_out)
      }));
    } catch (error) {
      console.error('Error getting state stats:', error);
      throw error;
    }
  }

  // Estatísticas gerais
  static async getOverallStats(): Promise<{
    totalContacts: number;
    validatedContacts: number;
    activeContacts: number;
    optedOutContacts: number;
    totalLists: number;
    activeCampaigns: number;
  }> {
    try {
      const contactStats = await sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_validated THEN 1 ELSE 0 END) as validated,
          SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN opted_out THEN 1 ELSE 0 END) as opted_out
        FROM phone_contacts
      `;

      const listStats = await sql`SELECT COUNT(*) as total FROM phone_lists`;
      
      const campaignStats = await sql`
        SELECT COUNT(*) as total FROM phone_campaigns WHERE status IN ('running', 'scheduled')
      `;

      const contact = contactStats.rows[0];
      
      return {
        totalContacts: parseInt(contact.total),
        validatedContacts: parseInt(contact.validated),
        activeContacts: parseInt(contact.active),
        optedOutContacts: parseInt(contact.opted_out),
        totalLists: parseInt(listStats.rows[0].total),
        activeCampaigns: parseInt(campaignStats.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting overall stats:', error);
      throw error;
    }
  }
}

export default PhoneDatabaseService;