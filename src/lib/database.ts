import { sql } from '@vercel/postgres';
import { DatabaseFallback } from './database-fallback';

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  price?: number;
  category: string;
  metadata?: any;
}

export interface Customer {
  id: string;
  // Dados Pessoais
  nome: string;
  email: string;
  whatsapp: string;
  cpf?: string;
  dataNascimento?: string;
  
  // Localização
  cidade: string;
  estado: string;
  pais: string;
  
  // Preferências de Viagem
  experienciaViagem: 'primeira_vez' | 'ocasional' | 'frequente' | 'expert';
  motivoViagem: 'lazer' | 'negocio' | 'familia' | 'lua_mel' | 'aventura' | 'cultura';
  prioridadeOrcamento?: 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo';
  classeViagem: 'economica' | 'premium' | 'executiva' | 'primeira';
  
  // Comunicação
  preferenciaContato: 'whatsapp' | 'telefone' | 'email' | 'qualquer';
  melhorHorario: 'manha' | 'tarde' | 'noite' | 'qualquer';
  
  // Marketing
  comoConheceu: 'google' | 'facebook' | 'instagram' | 'indicacao' | 'youtube' | 'outro';
  receberPromocoes: boolean;
  
  // Observações
  observacoes?: string;
  necessidadeEspecial?: string;
  
  // Metadata
  status: 'lead' | 'prospect' | 'cliente' | 'inativo';
  tags: string[];
  score: number; // Score de engajamento
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
}

export interface Lead {
  id: string;
  customerId?: string;
  
  // Dados básicos
  nome: string;
  email: string;
  whatsapp: string;
  telefone?: string;
  sobrenome?: string;
  
  // Campos de compatibilidade para formulários
  dataIda?: string;
  dataVolta?: string;
  adultos?: number;
  criancas?: number;
  bebes?: number;
  classeVoo?: string;
  companhiaPreferida?: string;
  horarioPreferido?: string;
  escalas?: string;
  orcamentoAproximado?: string;
  flexibilidadeDatas?: boolean;
  observacoes?: string;
  
  // Detalhes da viagem
  origem: string;
  destino: string;
  dataPartida?: string;
  dataRetorno?: string;
  numeroPassageiros?: number;
  tipoViagem: 'ida' | 'ida_volta' | 'multiplas_cidades' | 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  
  // Serviços
  selectedServices: string[];
  precisaHospedagem?: boolean;
  precisaTransporte?: boolean;
  
  // Orçamento
  orcamentoTotal?: string;
  prioridadeOrcamento?: 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo';
  
  // Metadata
  source: string;
  status: 'novo' | 'contatado' | 'cotacao_enviada' | 'negociacao' | 'fechado' | 'perdido' | 'em_analise' | 'cotado' | 'proposta_enviada' | 'follow_up';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  assignedTo?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Dados completos (JSON)
  fullData: any;
}

export interface ChatConversation {
  id: string;
  customerId?: string;
  leadId?: string;
  
  // Conversa
  sessionId: string;
  status: 'active' | 'waiting' | 'closed';
  channel: 'website' | 'whatsapp' | 'telegram' | 'email';
  
  // Atendimento
  isHumanAssisted: boolean;
  agentId?: string;
  transferReason?: string;
  
  // Metadata
  userAgent: string;
  ip: string;
  pageUrl: string;
  
  // Timestamps
  startedAt: Date;
  lastMessageAt: Date;
  closedAt?: Date;
  
  // Dados da conversa
  messages: ChatMessage[];
  metadata: any;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  
  // Mensagem
  content: string;
  sender: 'user' | 'agent' | 'system';
  type: 'text' | 'image' | 'file' | 'quick_reply' | 'form' | 'transfer';
  
  // Metadata
  metadata?: any;
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
}

export interface SupportTicket {
  id: string;
  customerId?: string;
  leadId?: string;
  conversationId?: string;
  
  // Ticket
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Atendimento
  assignedTo?: string;
  department: 'sales' | 'support' | 'billing' | 'technical';
  
  // Metadata
  source: 'chat' | 'email' | 'phone' | 'form';
  tags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Dados adicionais
  customFields: any;
}

export class DatabaseService {
  // Customers
  static async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const id = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const customer: Customer = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    await sql`
      INSERT INTO customers (
        id, nome, email, whatsapp, cpf, data_nascimento,
        cidade, estado, pais, experiencia_viagem, motivo_viagem,
        prioridade_orcamento, classe_viagem, preferencia_contato,
        melhor_horario, como_conheceu, receber_promocoes,
        observacoes, necessidade_especial, status, tags,
        score, created_at, updated_at
      ) VALUES (
        ${id}, ${data.nome}, ${data.email}, ${data.whatsapp},
        ${data.cpf || null}, ${data.dataNascimento || null},
        ${data.cidade}, ${data.estado}, ${data.pais},
        ${data.experienciaViagem}, ${data.motivoViagem},
        ${data.prioridadeOrcamento}, ${data.classeViagem},
        ${data.preferenciaContato}, ${data.melhorHorario},
        ${data.comoConheceu}, ${data.receberPromocoes},
        ${data.observacoes || null}, ${data.necessidadeEspecial || null},
        ${data.status}, ${JSON.stringify(data.tags)},
        ${data.score}, ${now.toISOString()}, ${now.toISOString()}
      )
    `;

    return customer;
  }

  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    const result = await sql`
      SELECT * FROM customers WHERE email = ${email} LIMIT 1
    `;
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      whatsapp: row.whatsapp,
      cpf: row.cpf,
      dataNascimento: row.data_nascimento,
      cidade: row.cidade,
      estado: row.estado,
      pais: row.pais,
      experienciaViagem: row.experiencia_viagem,
      motivoViagem: row.motivo_viagem,
      prioridadeOrcamento: row.prioridade_orcamento,
      classeViagem: row.classe_viagem,
      preferenciaContato: row.preferencia_contato,
      melhorHorario: row.melhor_horario,
      comoConheceu: row.como_conheceu,
      receberPromocoes: row.receber_promocoes,
      observacoes: row.observacoes,
      necessidadeEspecial: row.necessidade_especial,
      status: row.status,
      tags: JSON.parse(row.tags || '[]'),
      score: row.score,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastContactAt: row.last_contact_at ? new Date(row.last_contact_at) : undefined
    };
  }

  static async updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
    const updateFields = [];
    const values = [];
    
    if (data.nome) {
      updateFields.push('nome = $' + (values.length + 1));
      values.push(data.nome);
    }
    
    if (data.email) {
      updateFields.push('email = $' + (values.length + 1));
      values.push(data.email);
    }
    
    if (data.whatsapp) {
      updateFields.push('whatsapp = $' + (values.length + 1));
      values.push(data.whatsapp);
    }
    
    if (data.status) {
      updateFields.push('status = $' + (values.length + 1));
      values.push(data.status);
    }
    
    if (data.score !== undefined) {
      updateFields.push('score = $' + (values.length + 1));
      values.push(data.score);
    }
    
    if (data.tags) {
      updateFields.push('tags = $' + (values.length + 1));
      values.push(JSON.stringify(data.tags));
    }

    updateFields.push('updated_at = $' + (values.length + 1));
    values.push(new Date().toISOString());

    if (updateFields.length === 1) return; // Apenas updated_at

    values.push(id);
    const query = `
      UPDATE customers 
      SET ${updateFields.join(', ')} 
      WHERE id = $${values.length}
    `;

    await sql.query(query, values);
  }

  // Leads
  static async createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const lead: Lead = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    await sql`
      INSERT INTO leads (
        id, customer_id, nome, email, whatsapp,
        origem, destino, data_partida, data_retorno,
        numero_passageiros, tipo_viagem, selected_services,
        precisa_hospedagem, precisa_transporte, orcamento_total,
        prioridade_orcamento, source, status, priority,
        assigned_to, created_at, updated_at, full_data
      ) VALUES (
        ${id}, ${data.customerId || null}, ${data.nome}, ${data.email}, ${data.whatsapp},
        ${data.origem}, ${data.destino}, ${data.dataPartida}, ${data.dataRetorno || null},
        ${data.numeroPassageiros}, ${data.tipoViagem}, ${JSON.stringify(data.selectedServices)},
        ${data.precisaHospedagem}, ${data.precisaTransporte}, ${data.orcamentoTotal || null},
        ${data.prioridadeOrcamento}, ${data.source}, ${data.status}, ${data.priority},
        ${data.assignedTo || null}, ${now.toISOString()}, ${now.toISOString()}, ${JSON.stringify(data.fullData)}
      )
    `;

    return lead;
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    const result = await sql`
      SELECT * FROM leads WHERE id = ${id} LIMIT 1
    `;
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      customerId: row.customer_id,
      nome: row.nome,
      email: row.email,
      whatsapp: row.whatsapp,
      origem: row.origem,
      destino: row.destino,
      dataPartida: row.data_partida,
      dataRetorno: row.data_retorno,
      numeroPassageiros: row.numero_passageiros,
      tipoViagem: row.tipo_viagem,
      selectedServices: JSON.parse(row.selected_services || '[]'),
      precisaHospedagem: row.precisa_hospedagem,
      precisaTransporte: row.precisa_transporte,
      orcamentoTotal: row.orcamento_total,
      prioridadeOrcamento: row.prioridade_orcamento,
      source: row.source,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      fullData: JSON.parse(row.full_data || '{}')
    };
  }

  static async getLeadsByCustomer(customerId: string): Promise<Lead[]> {
    const result = await sql`
      SELECT * FROM leads 
      WHERE customer_id = ${customerId} 
      ORDER BY created_at DESC
    `;
    
    return result.rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      nome: row.nome,
      email: row.email,
      whatsapp: row.whatsapp,
      origem: row.origem,
      destino: row.destino,
      dataPartida: row.data_partida,
      dataRetorno: row.data_retorno,
      numeroPassageiros: row.numero_passageiros,
      tipoViagem: row.tipo_viagem,
      selectedServices: JSON.parse(row.selected_services || '[]'),
      precisaHospedagem: row.precisa_hospedagem,
      precisaTransporte: row.precisa_transporte,
      orcamentoTotal: row.orcamento_total,
      prioridadeOrcamento: row.prioridade_orcamento,
      source: row.source,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      fullData: JSON.parse(row.full_data || '{}')
    }));
  }

  static async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    const updateFields = [];
    const values = [];
    
    if (data.status) {
      updateFields.push('status = $' + (values.length + 1));
      values.push(data.status);
    }
    
    if (data.priority) {
      updateFields.push('priority = $' + (values.length + 1));
      values.push(data.priority);
    }
    
    if (data.assignedTo) {
      updateFields.push('assigned_to = $' + (values.length + 1));
      values.push(data.assignedTo);
    }

    updateFields.push('updated_at = $' + (values.length + 1));
    values.push(new Date().toISOString());

    if (updateFields.length === 1) return; // Apenas updated_at

    values.push(id);
    const query = `
      UPDATE leads 
      SET ${updateFields.join(', ')} 
      WHERE id = $${values.length}
    `;

    await sql.query(query, values);
  }

  // Conversas
  static async createConversation(data: Omit<ChatConversation, 'id' | 'startedAt' | 'lastMessageAt'>): Promise<ChatConversation> {
    const id = `conversation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const conversation: ChatConversation = {
      id,
      ...data,
      startedAt: now,
      lastMessageAt: now
    };

    await sql`
      INSERT INTO chat_conversations (
        id, customer_id, lead_id, session_id, status, channel,
        is_human_assisted, agent_id, transfer_reason,
        user_agent, ip, page_url, started_at, last_message_at,
        closed_at, metadata
      ) VALUES (
        ${id}, ${data.customerId || null}, ${data.leadId || null},
        ${data.sessionId}, ${data.status}, ${data.channel},
        ${data.isHumanAssisted}, ${data.agentId || null}, ${data.transferReason || null},
        ${data.userAgent}, ${data.ip}, ${data.pageUrl},
        ${now.toISOString()}, ${now.toISOString()}, ${data.closedAt?.toISOString() || null},
        ${JSON.stringify(data.metadata || {})}
      )
    `;

    return conversation;
  }

  static async addMessage(conversationId: string, message: Omit<ChatMessage, 'id' | 'conversationId' | 'createdAt'>): Promise<ChatMessage> {
    const id = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const chatMessage: ChatMessage = {
      id,
      conversationId,
      ...message,
      createdAt: now
    };

    await sql`
      INSERT INTO chat_messages (
        id, conversation_id, content, sender, type, metadata, created_at, read_at
      ) VALUES (
        ${id}, ${conversationId}, ${message.content}, ${message.sender},
        ${message.type}, ${JSON.stringify(message.metadata || {})},
        ${now.toISOString()}, ${message.readAt?.toISOString() || null}
      )
    `;

    // Atualizar last_message_at da conversa
    await sql`
      UPDATE chat_conversations 
      SET last_message_at = ${now.toISOString()}
      WHERE id = ${conversationId}
    `;

    return chatMessage;
  }

  // Tickets
  static async createTicket(data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    const id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const ticket: SupportTicket = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };

    await sql`
      INSERT INTO support_tickets (
        id, customer_id, lead_id, conversation_id, subject, description,
        status, priority, assigned_to, department, source, tags,
        created_at, updated_at, resolved_at, custom_fields
      ) VALUES (
        ${id}, ${data.customerId || null}, ${data.leadId || null},
        ${data.conversationId || null}, ${data.subject}, ${data.description},
        ${data.status}, ${data.priority}, ${data.assignedTo || null},
        ${data.department}, ${data.source}, ${JSON.stringify(data.tags)},
        ${now.toISOString()}, ${now.toISOString()}, ${data.resolvedAt?.toISOString() || null},
        ${JSON.stringify(data.customFields || {})}
      )
    `;

    return ticket;
  }

  // Inicializar tabelas
  static async initializeTables(): Promise<void> {
    try {
      // Customers
      await sql`
        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          whatsapp TEXT NOT NULL,
          cpf TEXT,
          data_nascimento TEXT,
          cidade TEXT,
          estado TEXT,
          pais TEXT,
          experiencia_viagem TEXT,
          motivo_viagem TEXT,
          prioridade_orcamento TEXT,
          classe_viagem TEXT,
          preferencia_contato TEXT,
          melhor_horario TEXT,
          como_conheceu TEXT,
          receber_promocoes BOOLEAN DEFAULT true,
          observacoes TEXT,
          necessidade_especial TEXT,
          status TEXT DEFAULT 'lead',
          tags TEXT DEFAULT '[]',
          score INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_contact_at TIMESTAMP
        )
      `;

      // Leads
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          customer_id TEXT,
          nome TEXT NOT NULL,
          email TEXT NOT NULL,
          whatsapp TEXT NOT NULL,
          origem TEXT,
          destino TEXT,
          data_partida TEXT,
          data_retorno TEXT,
          numero_passageiros INTEGER,
          tipo_viagem TEXT,
          selected_services TEXT DEFAULT '[]',
          precisa_hospedagem BOOLEAN DEFAULT false,
          precisa_transporte BOOLEAN DEFAULT false,
          orcamento_total TEXT,
          prioridade_orcamento TEXT,
          source TEXT,
          status TEXT DEFAULT 'novo',
          priority TEXT DEFAULT 'media',
          assigned_to TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          full_data TEXT DEFAULT '{}'
        )
      `;

      // Chat Conversations
      await sql`
        CREATE TABLE IF NOT EXISTS chat_conversations (
          id TEXT PRIMARY KEY,
          customer_id TEXT,
          lead_id TEXT,
          session_id TEXT NOT NULL,
          status TEXT DEFAULT 'active',
          channel TEXT DEFAULT 'website',
          is_human_assisted BOOLEAN DEFAULT false,
          agent_id TEXT,
          transfer_reason TEXT,
          user_agent TEXT,
          ip TEXT,
          page_url TEXT,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          closed_at TIMESTAMP,
          metadata TEXT DEFAULT '{}'
        )
      `;

      // Chat Messages
      await sql`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          content TEXT NOT NULL,
          sender TEXT NOT NULL,
          type TEXT DEFAULT 'text',
          metadata TEXT DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP
        )
      `;

      // Support Tickets
      await sql`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id TEXT PRIMARY KEY,
          customer_id TEXT,
          lead_id TEXT,
          conversation_id TEXT,
          subject TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'open',
          priority TEXT DEFAULT 'normal',
          assigned_to TEXT,
          department TEXT DEFAULT 'sales',
          source TEXT DEFAULT 'chat',
          tags TEXT DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP,
          custom_fields TEXT DEFAULT '{}'
        )
      `;

      // Índices
      await sql`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON chat_conversations(session_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON chat_messages(conversation_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON support_tickets(customer_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status)`;
      
      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  // Compatibilidade com sistema antigo
  static async getAllLeads(page: number = 1, limit: number = 50): Promise<{
    leads: Lead[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      
      const result = await sql`
        SELECT * FROM leads 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const countResult = await sql`SELECT COUNT(*) as total FROM leads`;
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      
      const leads = result.rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        nome: row.nome,
        email: row.email,
        whatsapp: row.whatsapp,
        origem: row.origem,
        destino: row.destino,
        dataPartida: row.data_partida,
        dataRetorno: row.data_retorno,
        numeroPassageiros: row.numero_passageiros,
        tipoViagem: row.tipo_viagem,
        selectedServices: JSON.parse(row.selected_services || '[]'),
        precisaHospedagem: row.precisa_hospedagem,
        precisaTransporte: row.precisa_transporte,
        orcamentoTotal: row.orcamento_total,
        prioridadeOrcamento: row.prioridade_orcamento,
        source: row.source,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assigned_to,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        fullData: JSON.parse(row.full_data || '{}')
      }));

      return {
        leads,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.warn('Database query failed, using fallback data:', error);
      // Fallback para dados do arquivo
      const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
      
      // Converter formato do fallback para o formato esperado
      const convertedLeads = fallbackLeads.map((lead: any) => ({
        id: lead.id,
        customerId: lead.customerId || null,
        nome: lead.nome,
        email: lead.email,
        whatsapp: lead.whatsapp,
        telefone: lead.telefone || '',
        sobrenome: lead.sobrenome || '',
        origem: lead.origem || '',
        destino: lead.destino || '',
        dataPartida: lead.dataPartida || '',
        dataRetorno: lead.dataRetorno || '',
        numeroPassageiros: lead.numeroPassageiros || 1,
        tipoViagem: lead.tipoViagem || 'ida_volta',
        selectedServices: Array.isArray(lead.selectedServices) ? lead.selectedServices : 
                          lead.serviceType ? [lead.serviceType] : ['voos'],
        precisaHospedagem: Boolean(lead.precisaHospedagem),
        precisaTransporte: Boolean(lead.precisaTransporte),
        orcamentoTotal: lead.orcamentoTotal || lead.orcamentoAproximado,
        prioridadeOrcamento: lead.prioridadeOrcamento || 'custo_beneficio',
        source: lead.source || 'website',
        status: lead.status || 'novo',
        priority: lead.priority || 'media',
        assignedTo: lead.assignedTo,
        createdAt: new Date(lead.createdAt),
        updatedAt: new Date(lead.updatedAt || lead.createdAt),
        fullData: lead.fullData || lead
      }));
      
      // Aplicar paginação
      const total = convertedLeads.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedLeads = convertedLeads.slice(offset, offset + limit);
      
      return {
        leads: paginatedLeads,
        total,
        page,
        totalPages
      };
    }
  }

  static async getLeadStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byService: Record<string, number>;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - today.getDay());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalResult = await sql`SELECT COUNT(*) as total FROM leads`;
      const todayResult = await sql`SELECT COUNT(*) as today FROM leads WHERE created_at >= ${today.toISOString()}`;
      const weekResult = await sql`SELECT COUNT(*) as week FROM leads WHERE created_at >= ${thisWeek.toISOString()}`;
      const monthResult = await sql`SELECT COUNT(*) as month FROM leads WHERE created_at >= ${thisMonth.toISOString()}`;

      const servicesResult = await sql`SELECT selected_services FROM leads WHERE selected_services IS NOT NULL`;
      const byService: Record<string, number> = {};
      
      servicesResult.rows.forEach(row => {
        const services = JSON.parse(row.selected_services || '[]');
        services.forEach((service: string) => {
          byService[service] = (byService[service] || 0) + 1;
        });
      });

      return {
        total: parseInt(totalResult.rows[0].total),
        today: parseInt(todayResult.rows[0].today),
        thisWeek: parseInt(weekResult.rows[0].week),
        thisMonth: parseInt(monthResult.rows[0].month),
        byService
      };
    } catch (error) {
      console.warn('Database stats query failed, using fallback data:', error);
      // Fallback para dados do arquivo
      const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - today.getDay());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const total = fallbackLeads.length;
      const todayCount = fallbackLeads.filter((lead: any) => 
        new Date(lead.createdAt) >= today
      ).length;
      const weekCount = fallbackLeads.filter((lead: any) => 
        new Date(lead.createdAt) >= thisWeek
      ).length;
      const monthCount = fallbackLeads.filter((lead: any) => 
        new Date(lead.createdAt) >= thisMonth
      ).length;
      
      const byService: Record<string, number> = {};
      fallbackLeads.forEach((lead: any) => {
        const services = Array.isArray(lead.selectedServices) ? lead.selectedServices : 
                        lead.serviceType ? [lead.serviceType] : ['voos'];
        services.forEach((service: string) => {
          byService[service] = (byService[service] || 0) + 1;
        });
      });
      
      return {
        total,
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
        byService
      };
    }
  }

  // New CRUD methods for modern leads management

  // Update existing lead by ID  
  static async updateLeadById(leadId: string, updateData: any): Promise<boolean> {
    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Define updateable fields
      const allowedFields = [
        'nome', 'email', 'whatsapp', 'telefone', 'origem', 'destino',
        'data_partida', 'data_retorno', 'numero_passageiros', 'status',
        'priority', 'assigned_to', 'notes', 'orcamento_total', 'updated_at'
      ];

      allowedFields.forEach(field => {
        const jsField = field.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        if (updateData[jsField] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(updateData[jsField]);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return false;
      }

      // Add leadId as the last parameter
      values.push(leadId);
      
      const query = `
        UPDATE leads 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await sql.query(query, values);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  // Delete lead by ID
  static async deleteLeadById(leadId: string): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM leads WHERE id = ${leadId}
      `;
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Bulk update leads
  static async bulkUpdateLeads(leadIds: string[], updateData: any): Promise<number> {
    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const allowedFields = [
        'status', 'priority', 'assigned_to', 'updated_at'
      ];

      allowedFields.forEach(field => {
        const jsField = field.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        if (updateData[jsField] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(updateData[jsField]);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return 0;
      }

      // Use a proper IN clause instead of ANY
      const placeholders = leadIds.map((_, i) => `$${paramIndex + i}`).join(',');
      values.push(...leadIds);
      
      const query = `
        UPDATE leads 
        SET ${updateFields.join(', ')}
        WHERE id IN (${placeholders})
      `;

      const result = await sql.query(query, values);
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      throw error;
    }
  }

  // Bulk delete leads
  static async bulkDeleteLeads(leadIds: string[]): Promise<number> {
    try {
      const placeholders = leadIds.map((_, i) => `$${i + 1}`).join(',');
      const query = `DELETE FROM leads WHERE id IN (${placeholders})`;
      
      const result = await sql.query(query, leadIds);
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      throw error;
    }
  }
}

// Utility functions for backward compatibility
export async function saveLead(leadData: any) {
  // Converter formato antigo para novo
  const newLeadData = {
    customerId: undefined,
    nome: leadData.nome,
    email: leadData.email,
    whatsapp: leadData.whatsapp,
    origem: leadData.origem || '',
    destino: leadData.destino || '',
    dataPartida: leadData.dataIda || '',
    dataRetorno: leadData.dataVolta || '',
    numeroPassageiros: leadData.adultos || 1,
    tipoViagem: (leadData.tipoViagem === 'ida-volta' ? 'ida_volta' : 
                leadData.tipoViagem === 'somente-ida' ? 'ida' :
                leadData.tipoViagem === 'multiplas-cidades' ? 'multiplas_cidades' :
                'ida_volta') as 'ida' | 'ida_volta' | 'multiplas_cidades' | 'ida-volta' | 'somente-ida' | 'multiplas-cidades',
    selectedServices: leadData.selectedServices?.map((s: any) => s.serviceType) || [],
    precisaHospedagem: Boolean(leadData.precisaHospedagem),
    precisaTransporte: Boolean(leadData.precisaTransporte),
    orcamentoTotal: leadData.orcamentoAproximado,
    prioridadeOrcamento: (
      leadData.prioridadeOrcamento && 
      typeof leadData.prioridadeOrcamento === 'string' &&
      ['baixo_custo', 'custo_beneficio', 'conforto', 'luxo'].includes(leadData.prioridadeOrcamento)
    ) ? leadData.prioridadeOrcamento as 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo'
    : undefined,
    source: 'form',
    status: 'novo' as const,
    priority: 'media' as const,
    fullData: leadData
  };

  try {
    const lead = await DatabaseService.createLead(newLeadData);
    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error('Error saving lead:', error);
    return { 
      success: false, 
      leadId: '', 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getLeadById(id: string) {
  return DatabaseService.getLeadById(id);
}

export async function getLeadsByEmail(email: string) {
  return DatabaseService.getLeadsByCustomer(email);
}

export async function getAllLeads(page?: number, limit?: number) {
  return DatabaseService.getAllLeads(page, limit);
}

export async function getLeadStats() {
  return DatabaseService.getLeadStats();
}
