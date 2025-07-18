// Central de Comunicação Omnichannel - API
// Gerenciamento unificado de conversas, clientes e mensagens

import { sql } from '@vercel/postgres';

// Interfaces TypeScript para o sistema omnichannel
export interface Customer {
  id: number;
  phone?: string;
  email?: string;
  name?: string;
  whatsapp_id?: string;
  location?: string;
  timezone: string;
  language: string;
  customer_type: 'prospect' | 'customer' | 'vip';
  created_at: Date;
  updated_at: Date;
  last_contact_at?: Date;
}

export interface Conversation {
  id: number;
  customer_id: number;
  channel: 'whatsapp' | 'email' | 'webchat' | 'phone' | 'instagram' | 'facebook';
  channel_conversation_id?: string;
  subject?: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_agent_id?: number;
  department: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  closed_at?: Date;
}

export interface Message {
  id: number;
  conversation_id: number;
  customer_id: number;
  channel: string;
  direction: 'inbound' | 'outbound';
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'template';
  sender_name?: string;
  sender_id?: string;
  agent_id?: number;
  is_automated: boolean;
  template_id?: string;
  metadata?: Record<string, unknown>;
  channel_message_id?: string;
  created_at: Date;
  read_at?: Date;
  delivered_at?: Date;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: 'agent' | 'supervisor' | 'admin';
  skills?: string[];
  languages: string[];
  is_active: boolean;
  max_concurrent_conversations: number;
  current_conversations: number;
  status: 'online' | 'offline' | 'away' | 'busy';
  created_at: Date;
  updated_at: Date;
  last_activity_at?: Date;
}

export interface ConversationWithDetails extends Conversation {
  customer: Customer;
  agent?: Agent;
  messages: Message[];
  last_message?: Message;
  unread_count: number;
}

export class OmnichannelAPI {
  // ==================== CLIENTES ====================
  
  static async createOrUpdateCustomer(data: Partial<Customer>): Promise<Customer> {
    try {
      const { phone, email, name, whatsapp_id, location, timezone = 'America/New_York', language = 'pt-BR', customer_type = 'prospect' } = data;
      
      // Verificar se cliente já existe
      let existingCustomer = null;
      if (phone) {
        const result = await sql`
          SELECT * FROM customers WHERE phone = ${phone} LIMIT 1
        `;
        existingCustomer = result.rows[0];
      } else if (email) {
        const result = await sql`
          SELECT * FROM customers WHERE email = ${email} LIMIT 1
        `;
        existingCustomer = result.rows[0];
      } else if (whatsapp_id) {
        const result = await sql`
          SELECT * FROM customers WHERE whatsapp_id = ${whatsapp_id} LIMIT 1
        `;
        existingCustomer = result.rows[0];
      }
      
      if (existingCustomer) {
        // Atualizar cliente existente
        const result = await sql`
          UPDATE customers 
          SET name = COALESCE(${name}, name),
              phone = COALESCE(${phone}, phone),
              email = COALESCE(${email}, email),
              whatsapp_id = COALESCE(${whatsapp_id}, whatsapp_id),
              location = COALESCE(${location}, location),
              timezone = COALESCE(${timezone}, timezone),
              language = COALESCE(${language}, language),
              customer_type = COALESCE(${customer_type}, customer_type),
              updated_at = CURRENT_TIMESTAMP,
              last_contact_at = CURRENT_TIMESTAMP
          WHERE id = ${existingCustomer.id}
          RETURNING *
        `;
        return result.rows[0] as Customer;
      } else {
        // Criar novo cliente
        const result = await sql`
          INSERT INTO customers (phone, email, name, whatsapp_id, location, timezone, language, customer_type)
          VALUES (${phone}, ${email}, ${name}, ${whatsapp_id}, ${location}, ${timezone}, ${language}, ${customer_type})
          RETURNING *
        `;
        return result.rows[0] as Customer;
      }
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      throw error;
    }
  }

  static async getCustomerById(id: number): Promise<Customer | null> {
    try {
      const result = await sql`
        SELECT * FROM customers WHERE id = ${id} LIMIT 1
      `;
      return result.rows[0] as Customer || null;
    } catch (error) {
      console.error('Error getting customer by ID:', error);
      throw error;
    }
  }

  static async getCustomerByIdentifier(identifier: string): Promise<Customer | null> {
    try {
      const result = await sql`
        SELECT * FROM customers 
        WHERE phone = ${identifier} OR email = ${identifier} OR whatsapp_id = ${identifier}
        LIMIT 1
      `;
      return result.rows[0] as Customer || null;
    } catch (error) {
      console.error('Error getting customer by identifier:', error);
      throw error;
    }
  }

  // ==================== CONVERSAS ====================

  static async createConversation(data: Partial<Conversation>): Promise<Conversation> {
    try {
      const { 
        customer_id, 
        channel, 
        channel_conversation_id,
        subject, 
        status = 'open',
        priority = 'normal',
        assigned_agent_id,
        department = 'sales',
        tags = [],
        metadata = {}
      } = data;

      const result = await sql`
        INSERT INTO conversations (
          customer_id, channel, channel_conversation_id, subject, status, 
          priority, assigned_agent_id, department, tags, metadata
        )
        VALUES (
          ${customer_id}, ${channel}, ${channel_conversation_id}, ${subject}, ${status},
          ${priority}, ${assigned_agent_id}, ${department}, ${JSON.stringify(tags)}, ${JSON.stringify(metadata)}
        )
        RETURNING *
      `;
      
      return result.rows[0] as Conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async getConversationByChannelId(channel: string, channelConversationId: string): Promise<Conversation | null> {
    try {
      const result = await sql`
        SELECT * FROM conversations 
        WHERE channel = ${channel} AND channel_conversation_id = ${channelConversationId}
        LIMIT 1
      `;
      return result.rows[0] as Conversation || null;
    } catch (error) {
      console.error('Error getting conversation by channel ID:', error);
      throw error;
    }
  }

  static async getConversationWithDetails(id: number): Promise<ConversationWithDetails | null> {
    try {
      const [conversationResult, messagesResult] = await Promise.all([
        sql`
          SELECT 
            c.*,
            cust.name as customer_name,
            cust.phone as customer_phone,
            cust.email as customer_email,
            cust.whatsapp_id as customer_whatsapp_id,
            cust.location as customer_location,
            cust.timezone as customer_timezone,
            cust.language as customer_language,
            cust.customer_type,
            a.name as agent_name,
            a.email as agent_email,
            a.status as agent_status
          FROM conversations c
          LEFT JOIN customers cust ON c.customer_id = cust.id
          LEFT JOIN agents a ON c.assigned_agent_id = a.id
          WHERE c.id = ${id}
        `,
        sql`
          SELECT * FROM messages 
          WHERE conversation_id = ${id}
          ORDER BY created_at ASC
        `
      ]);

      if (!conversationResult.rows[0]) return null;

      const row = conversationResult.rows[0];
      const conversation: ConversationWithDetails = {
        id: row.id,
        customer_id: row.customer_id,
        channel: row.channel,
        channel_conversation_id: row.channel_conversation_id,
        subject: row.subject,
        status: row.status,
        priority: row.priority,
        assigned_agent_id: row.assigned_agent_id,
        department: row.department,
        tags: row.tags || [],
        metadata: row.metadata || {},
        created_at: row.created_at,
        updated_at: row.updated_at,
        closed_at: row.closed_at,
        customer: {
          id: row.customer_id,
          name: row.customer_name,
          phone: row.customer_phone,
          email: row.customer_email,
          whatsapp_id: row.customer_whatsapp_id,
          location: row.customer_location,
          timezone: row.customer_timezone || 'America/New_York',
          language: row.customer_language || 'pt-BR',
          customer_type: row.customer_type || 'prospect',
          created_at: row.created_at,
          updated_at: row.updated_at
        },
        agent: row.agent_name ? {
          id: row.assigned_agent_id,
          name: row.agent_name,
          email: row.agent_email,
          role: 'agent',
          skills: [],
          languages: ['pt-BR', 'en-US'],
          is_active: true,
          max_concurrent_conversations: 10,
          current_conversations: 0,
          status: row.agent_status || 'offline',
          created_at: new Date(),
          updated_at: new Date()
        } : undefined,
        messages: messagesResult.rows as Message[],
        last_message: messagesResult.rows[messagesResult.rows.length - 1] as Message || undefined,
        unread_count: messagesResult.rows.filter(m => !m.read_at && m.direction === 'inbound').length
      };

      return conversation;
    } catch (error) {
      console.error('Error getting conversation with details:', error);
      throw error;
    }
  }

  static async getActiveConversations(agentId?: number, limit: number = 50): Promise<ConversationWithDetails[]> {
    try {
      const baseQuery = `
        SELECT 
          c.*,
          cust.name as customer_name,
          cust.phone as customer_phone,
          cust.email as customer_email,
          cust.whatsapp_id as customer_whatsapp_id,
          cust.location as customer_location,
          cust.timezone as customer_timezone,
          cust.language as customer_language,
          cust.customer_type,
          a.name as agent_name,
          a.email as agent_email,
          a.status as agent_status,
          (
            SELECT COUNT(*) FROM messages m 
            WHERE m.conversation_id = c.id 
            AND m.direction = 'inbound' 
            AND m.read_at IS NULL
          ) as unread_count,
          (
            SELECT m.content 
            FROM messages m 
            WHERE m.conversation_id = c.id 
            ORDER BY m.created_at DESC 
            LIMIT 1
          ) as last_message_content,
          (
            SELECT m.created_at 
            FROM messages m 
            WHERE m.conversation_id = c.id 
            ORDER BY m.created_at DESC 
            LIMIT 1
          ) as last_message_at
        FROM conversations c
        LEFT JOIN customers cust ON c.customer_id = cust.id
        LEFT JOIN agents a ON c.assigned_agent_id = a.id
        WHERE c.status IN ('open', 'pending')
        ${agentId ? `AND c.assigned_agent_id = ${agentId}` : ''}
        ORDER BY c.updated_at DESC
        LIMIT ${limit}
      `;

      const result = await sql.query(baseQuery);
      
      const conversations = result.rows.map(row => ({
        id: row.id,
        customer_id: row.customer_id,
        channel: row.channel,
        channel_conversation_id: row.channel_conversation_id,
        subject: row.subject,
        status: row.status,
        priority: row.priority,
        assigned_agent_id: row.assigned_agent_id,
        department: row.department,
        tags: row.tags || [],
        metadata: row.metadata || {},
        created_at: row.created_at,
        updated_at: row.updated_at,
        closed_at: row.closed_at,
        customer: {
          id: row.customer_id,
          name: row.customer_name,
          phone: row.customer_phone,
          email: row.customer_email,
          whatsapp_id: row.customer_whatsapp_id,
          location: row.customer_location,
          timezone: row.customer_timezone || 'America/New_York',
          language: row.customer_language || 'pt-BR',
          customer_type: row.customer_type || 'prospect',
          created_at: row.created_at,
          updated_at: row.updated_at
        },
        agent: row.agent_name ? {
          id: row.assigned_agent_id,
          name: row.agent_name,
          email: row.agent_email,
          role: 'agent' as const,
          skills: [],
          languages: ['pt-BR', 'en-US'],
          is_active: true,
          max_concurrent_conversations: 10,
          current_conversations: 0,
          status: row.agent_status || 'offline' as const,
          created_at: new Date(),
          updated_at: new Date()
        } : undefined,
        messages: [],
        last_message: row.last_message_content ? {
          id: 0,
          conversation_id: row.id,
          customer_id: row.customer_id,
          channel: row.channel,
          direction: 'inbound' as const,
          content: row.last_message_content,
          message_type: 'text' as const,
          is_automated: false,
          created_at: row.last_message_at
        } : undefined,
        unread_count: parseInt(row.unread_count) || 0
      }));

      return conversations;
    } catch (error) {
      console.error('Error getting active conversations:', error);
      throw error;
    }
  }

  static async updateConversationStatus(id: number, status: Conversation['status'], agentId?: number): Promise<Conversation> {
    try {
      const updateData: { status: string; updated_at: Date; closed_at?: Date } = { status, updated_at: new Date() };
      if (status === 'closed') {
        updateData.closed_at = new Date();
      }

      const result = await sql`
        UPDATE conversations 
        SET status = ${status}, 
            updated_at = CURRENT_TIMESTAMP
            ${status === 'closed' ? ', closed_at = CURRENT_TIMESTAMP' : ''}
        WHERE id = ${id}
        RETURNING *
      `;

      // Log da atividade
      if (agentId) {
        await this.logActivity(id, agentId, 'status_changed', `Status alterado para ${status}`);
      }

      return result.rows[0] as Conversation;
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  }

  // ==================== MENSAGENS ====================

  static async createMessage(data: Partial<Message>): Promise<Message> {
    try {
      const {
        conversation_id,
        customer_id,
        channel,
        direction,
        content,
        message_type = 'text',
        sender_name,
        sender_id,
        agent_id,
        is_automated = false,
        template_id,
        metadata = {},
        channel_message_id
      } = data;

      const result = await sql`
        INSERT INTO messages (
          conversation_id, customer_id, channel, direction, content, message_type,
          sender_name, sender_id, agent_id, is_automated, template_id, metadata, channel_message_id
        )
        VALUES (
          ${conversation_id}, ${customer_id}, ${channel}, ${direction}, ${content}, ${message_type},
          ${sender_name}, ${sender_id}, ${agent_id}, ${is_automated}, ${template_id}, 
          ${JSON.stringify(metadata)}, ${channel_message_id}
        )
        RETURNING *
      `;

      // Atualizar timestamp da conversa
      await sql`
        UPDATE conversations 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${conversation_id}
      `;

      return result.rows[0] as Message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  static async markMessageAsRead(messageId: number): Promise<void> {
    try {
      await sql`
        UPDATE messages 
        SET read_at = CURRENT_TIMESTAMP 
        WHERE id = ${messageId}
      `;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  static async getConversationMessages(conversationId: number, limit: number = 100): Promise<Message[]> {
    try {
      const result = await sql`
        SELECT * FROM messages 
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
        LIMIT ${limit}
      `;
      return result.rows as Message[];
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  // ==================== INTEGRAÇÃO COM CANAIS ====================

  static async processIncomingMessage(
    channel: string,
    channelMessageId: string,
    customerIdentifier: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<{ conversation: Conversation; message: Message; customer: Customer }> {
    try {
      // 1. Criar ou atualizar cliente
      const customer = await this.createOrUpdateCustomer({
        [channel === 'whatsapp' ? 'whatsapp_id' : channel === 'email' ? 'email' : 'phone']: customerIdentifier,
        name: (metadata.sender_name as string) || 'Cliente'
      });

      // 2. Buscar ou criar conversa
      let conversation = await this.getConversationByChannelId(channel, customerIdentifier);
      
      if (!conversation) {
        conversation = await this.createConversation({
          customer_id: customer.id,
          channel: channel as any,
          channel_conversation_id: customerIdentifier,
          subject: `Conversa via ${channel}`,
          status: 'open'
        });
      }

      // 3. Criar mensagem
      const message = await this.createMessage({
        conversation_id: conversation.id,
        customer_id: customer.id,
        channel,
        direction: 'inbound',
        content,
        sender_name: (metadata.sender_name as string) || customer.name,
        sender_id: customerIdentifier,
        channel_message_id: channelMessageId,
        metadata
      });

      return { conversation, message, customer };
    } catch (error) {
      console.error('Error processing incoming message:', error);
      throw error;
    }
  }

  // ==================== ATIVIDADES ====================

  static async logActivity(
    conversationId: number,
    agentId: number,
    action: string,
    description: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO activity_log (conversation_id, agent_id, action, description, metadata)
        VALUES (${conversationId}, ${agentId}, ${action}, ${description}, ${JSON.stringify(metadata)})
      `;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  // ==================== DASHBOARD E ESTATÍSTICAS ====================

  static async getDashboardStats(): Promise<{
    totalConversations: number;
    activeConversations: number;
    pendingConversations: number;
    avgResponseTime: number;
    customerSatisfaction: number;
    channelBreakdown: Record<string, number>;
  }> {
    try {
      const [totalResult, activeResult, pendingResult, channelResult] = await Promise.all([
        sql`SELECT COUNT(*) as total FROM conversations`,
        sql`SELECT COUNT(*) as active FROM conversations WHERE status = 'open'`,
        sql`SELECT COUNT(*) as pending FROM conversations WHERE status = 'pending'`,
        sql`
          SELECT channel, COUNT(*) as count 
          FROM conversations 
          WHERE created_at > NOW() - INTERVAL '7 days'
          GROUP BY channel
        `
      ]);

      const channelBreakdown: Record<string, number> = {};
      channelResult.rows.forEach(row => {
        channelBreakdown[row.channel] = parseInt(row.count);
      });

      return {
        totalConversations: parseInt(totalResult.rows[0].total),
        activeConversations: parseInt(activeResult.rows[0].active),
        pendingConversations: parseInt(pendingResult.rows[0].pending),
        avgResponseTime: 0, // Implementar cálculo real
        customerSatisfaction: 0, // Implementar cálculo real
        channelBreakdown
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
}

// Classe para integração com WhatsApp
export class WhatsAppOmnichannel {
  static async processWhatsAppMessage(
    from: string,
    message: string,
    messageId: string,
    metadata: Record<string, unknown> = {}
  ): Promise<{ shouldAutoRespond: boolean; conversation: Conversation }> {
    try {
      const result = await OmnichannelAPI.processIncomingMessage(
        'whatsapp',
        messageId,
        from,
        message,
        metadata
      );

      // Verificar se deve responder automaticamente
      const shouldAutoRespond = await this.shouldAutoRespond(result.conversation);

      return {
        shouldAutoRespond,
        conversation: result.conversation
      };
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
      throw error;
    }
  }

  private static async shouldAutoRespond(conversation: Conversation): Promise<boolean> {
    // Lógica para determinar se deve responder automaticamente
    // baseada em horário comercial, configurações, etc.
    return true; // Simplificado para o exemplo
  }
}

export default OmnichannelAPI;