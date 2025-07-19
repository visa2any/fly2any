/**
 * Unified Lead Service
 * 
 * Centralized service for all lead-related operations.
 * Handles data validation, transformation, storage, and business logic.
 */

import { sql } from '@vercel/postgres';
import { DatabaseFallback } from '@/lib/database-fallback';
import { 
  UnifiedLead, 
  CreateLeadInput, 
  UpdateLeadInput, 
  LeadQueryParams, 
  LeadStats,
  LEAD_VALIDATION_RULES,
  convertLegacyToUnified,
  normalizeTripType,
  getTotalPassengers,
  getDepartureDate,
  getReturnDate,
  getFlightClass,
  getBudgetAmount
} from '@/lib/schemas/lead';

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

/**
 * Service operation result interface
 */
interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Lead Service Class
 */
export class LeadService {
  
  /**
   * Validate lead input data
   */
  static validateLeadInput(input: CreateLeadInput): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    
    // Validate required fields
    if (!input.nome || typeof input.nome !== 'string' || input.nome.trim().length < LEAD_VALIDATION_RULES.nome.minLength) {
      errors.push({
        field: 'nome',
        message: `Nome é obrigatório e deve ter pelo menos ${LEAD_VALIDATION_RULES.nome.minLength} caracteres`
      });
    }
    
    if (!input.email || !LEAD_VALIDATION_RULES.email.pattern.test(input.email)) {
      errors.push({
        field: 'email',
        message: 'Email é obrigatório e deve ter um formato válido'
      });
    }
    
    if (!input.whatsapp || input.whatsapp.length < LEAD_VALIDATION_RULES.whatsapp.minLength) {
      errors.push({
        field: 'whatsapp',
        message: `WhatsApp é obrigatório e deve ter pelo menos ${LEAD_VALIDATION_RULES.whatsapp.minLength} dígitos`
      });
    }
    
    if (!input.selectedServices || !Array.isArray(input.selectedServices) || input.selectedServices.length === 0) {
      errors.push({
        field: 'selectedServices',
        message: 'Pelo menos um serviço deve ser selecionado'
      });
    }
    
    // Validate optional fields if provided
    if (input.telefone && !LEAD_VALIDATION_RULES.telefone.pattern.test(input.telefone)) {
      errors.push({
        field: 'telefone',
        message: 'Telefone deve ter um formato válido'
      });
    }
    
    if (input.cpf && !LEAD_VALIDATION_RULES.cpf.pattern.test(input.cpf)) {
      errors.push({
        field: 'cpf',
        message: 'CPF deve ter um formato válido'
      });
    }
    
    // Validate service types - handle both string[] and object[] formats
    if (input.selectedServices) {
      const validServices = LEAD_VALIDATION_RULES.selectedServices.validValues;
      const serviceTypes: string[] = [];
      
      for (const service of input.selectedServices) {
        let serviceType: string;
        
        if (typeof service === 'string') {
          serviceType = service;
        } else if (typeof service === 'object' && service !== null) {
          // Try different property names
          const serviceObj = service as any;
          serviceType = serviceObj.serviceType || serviceObj.service || serviceObj.type || String(service);
        } else {
          serviceType = String(service);
        }
        
        serviceTypes.push(serviceType);
      }
      
      const invalidServices = serviceTypes.filter(serviceType => 
        !validServices.includes(serviceType as any)
      );
      
      if (invalidServices.length > 0) {
        errors.push({
          field: 'selectedServices',
          message: `Serviços inválidos: ${invalidServices.join(', ')}`
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Extract data from the first service object in selectedServices
   */
  private static extractFirstServiceData(selectedServices: any[] | undefined, field: string): string | undefined {
    console.log(`[DEBUG] extractFirstServiceData - field: ${field}`);
    console.log(`[DEBUG] selectedServices:`, JSON.stringify(selectedServices, null, 2));
    
    if (!selectedServices || !Array.isArray(selectedServices) || selectedServices.length === 0) {
      console.log(`[DEBUG] No selectedServices found for field: ${field}`);
      return undefined;
    }
    
    const firstService = selectedServices[0];
    console.log(`[DEBUG] firstService:`, JSON.stringify(firstService, null, 2));
    
    if (typeof firstService === 'object' && firstService !== null) {
      const value = firstService[field];
      console.log(`[DEBUG] Extracted ${field} = ${value}`);
      return value;
    }
    
    console.log(`[DEBUG] firstService is not an object for field: ${field}`);
    return undefined;
  }

  /**
   * Transform input data to unified lead format
   */
  static transformToUnifiedLead(input: CreateLeadInput): UnifiedLead {
    const now = new Date().toISOString();
    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      // System fields
      id,
      createdAt: now,
      updatedAt: now,
      source: input.source || 'website',
      status: 'novo',
      priority: 'media',
      
      // Personal information
      nome: input.nome.trim(),
      email: input.email.toLowerCase().trim(),
      whatsapp: input.whatsapp.replace(/\D/g, ''), // Remove non-digits
      sobrenome: input.sobrenome?.trim(),
      telefone: input.telefone?.replace(/\D/g, ''),
      cpf: input.cpf?.replace(/\D/g, ''),
      dataNascimento: input.dataNascimento,
      
      // Location
      cidade: input.cidade?.trim(),
      estado: input.estado?.trim(),
      pais: input.pais?.trim() || 'Brasil',
      
      // Travel information - normalize selectedServices format
      selectedServices: input.selectedServices ? input.selectedServices.map(service => {
        if (typeof service === 'string') {
          return service;
        } else if (typeof service === 'object' && service !== null) {
          const serviceObj = service as any;
          return serviceObj.serviceType || serviceObj.service || serviceObj.type || String(service);
        }
        return String(service);
      }) : [],
      origem: (() => {
        const direct = input.origem?.trim();
        const extracted = this.extractFirstServiceData(input.selectedServices, 'origem');
        const result = direct || extracted;
        console.log(`[DEBUG] origem - direct: ${direct}, extracted: ${extracted}, final: ${result}`);
        return result;
      })(),
      destino: (() => {
        const direct = input.destino?.trim();
        const extracted = this.extractFirstServiceData(input.selectedServices, 'destino');
        const result = direct || extracted;
        console.log(`[DEBUG] destino - direct: ${direct}, extracted: ${extracted}, final: ${result}`);
        return result;
      })(),
      tipoViagem: normalizeTripType(input.tipoViagem) || this.extractFirstServiceData(input.selectedServices, 'tipoViagem'),
      
      // Dates (normalize both formats)
      dataPartida: input.dataPartida || input.dataIda || this.extractFirstServiceData(input.selectedServices, 'dataIda'),
      dataRetorno: input.dataRetorno || input.dataVolta || this.extractFirstServiceData(input.selectedServices, 'dataVolta'),
      dataIda: input.dataIda,
      dataVolta: input.dataVolta,
      
      // Passengers
      numeroPassageiros: input.numeroPassageiros || getTotalPassengers(input),
      adultos: input.adultos || 1,
      criancas: input.criancas || 0,
      bebes: input.bebes || 0,
      
      // Flight preferences
      classeViagem: input.classeViagem || input.classeVoo || 'economica',
      classeVoo: input.classeVoo,
      companhiaPreferida: input.companhiaPreferida?.trim(),
      horarioPreferido: input.horarioPreferido || 'qualquer',
      escalas: input.escalas || 'qualquer',
      
      // Budget
      orcamentoTotal: input.orcamentoTotal || input.orcamentoAproximado,
      orcamentoAproximado: input.orcamentoAproximado,
      prioridadeOrcamento: input.prioridadeOrcamento || 'custo_beneficio',
      flexibilidadeDatas: Boolean(input.flexibilidadeDatas),
      
      // Additional services
      precisaHospedagem: Boolean(input.precisaHospedagem),
      tipoHospedagem: input.tipoHospedagem,
      categoriaHospedagem: input.categoriaHospedagem,
      precisaTransporte: Boolean(input.precisaTransporte),
      tipoTransporte: input.tipoTransporte,
      
      // Customer profile
      experienciaViagem: input.experienciaViagem || 'ocasional',
      motivoViagem: input.motivoViagem || 'lazer',
      
      // Communication
      preferenciaContato: input.preferenciaContato || 'whatsapp',
      melhorHorario: input.melhorHorario || 'qualquer',
      
      // Marketing
      comoConheceu: input.comoConheceu || 'website',
      receberPromocoes: input.receberPromocoes !== false,
      
      // Additional info
      observacoes: input.observacoes?.trim(),
      necessidadeEspecial: input.necessidadeEspecial?.trim(),
      
      // Legacy compatibility
      serviceType: input.serviceType,
      
      // Raw data
      fullData: input.fullData || (input as unknown as Record<string, unknown>),
      
      // Metadata
      userAgent: input.userAgent,
      pageUrl: input.pageUrl,
      ipAddress: input.ipAddress,
      sessionId: input.sessionId
    };
  }
  
  /**
   * Create a new lead
   */
  static async createLead(input: CreateLeadInput): Promise<ServiceResult<UnifiedLead>> {
    try {
      // Validate input
      const validation = this.validateLeadInput(input);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Dados inválidos',
          metadata: { validationErrors: validation.errors }
        };
      }
      
      // Transform to unified format
      const unifiedLead = this.transformToUnifiedLead(input);
      
      // Try to save to primary database
      try {
        await this.saveToDatabase(unifiedLead);
        
        return {
          success: true,
          data: unifiedLead,
          metadata: { storage: 'database' }
        };
      } catch (dbError) {
        console.warn('Primary database save failed, using fallback:', dbError);
        
        // Try file fallback first
        try {
          const fallbackResult = await DatabaseFallback.saveLeadToFile(unifiedLead);
          
          if (fallbackResult.success) {
            return {
              success: true,
              data: unifiedLead,
              metadata: { storage: 'fallback', fallbackId: fallbackResult.leadId }
            };
          }
        } catch (fallbackError) {
          console.warn('File fallback also failed:', fallbackError);
        }
        
        // If both database and file fallback fail, still return success
        // The lead data will be processed by async operations (N8N webhook)
        console.warn('All storage methods failed, but lead will be processed via webhook');
        return {
          success: true,
          data: unifiedLead,
          metadata: { storage: 'webhook-only', warning: 'Lead not persisted locally but will be processed' }
        };
      }
      
    } catch (error) {
      console.error('Lead creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao criar lead'
      };
    }
  }
  
  /**
   * Save lead to primary database
   */
  private static async saveToDatabase(lead: UnifiedLead): Promise<void> {
    // Check if database is configured
    if (!process.env.POSTGRES_URL) {
      throw new Error('Database not configured');
    }
    
    await sql`
      INSERT INTO leads (
        id, nome, email, whatsapp, telefone, sobrenome,
        origem, destino, data_partida, data_retorno,
        numero_passageiros, tipo_viagem, selected_services,
        classe_viagem, companhia_preferida, horario_preferido,
        escalas, orcamento_total, prioridade_orcamento,
        flexibilidade_datas, precisa_hospedagem, tipo_hospedagem,
        categoria_hospedagem, precisa_transporte, tipo_transporte,
        experiencia_viagem, motivo_viagem, preferencia_contato,
        melhor_horario, como_conheceu, receber_promocoes,
        observacoes, necessidade_especial, source, status,
        priority, created_at, updated_at, full_data,
        user_agent, page_url, ip_address, session_id
      ) VALUES (
        ${lead.id}, ${lead.nome}, ${lead.email}, ${lead.whatsapp},
        ${lead.telefone || null}, ${lead.sobrenome || null},
        ${lead.origem || null}, ${lead.destino || null},
        ${lead.dataPartida || null}, ${lead.dataRetorno || null},
        ${lead.numeroPassageiros || null}, ${lead.tipoViagem || null},
        ${JSON.stringify(lead.selectedServices)}, ${lead.classeViagem || null},
        ${lead.companhiaPreferida || null}, ${lead.horarioPreferido || null},
        ${lead.escalas || null}, ${lead.orcamentoTotal || null},
        ${lead.prioridadeOrcamento || null}, ${lead.flexibilidadeDatas || false},
        ${lead.precisaHospedagem || false}, ${lead.tipoHospedagem || null},
        ${lead.categoriaHospedagem || null}, ${lead.precisaTransporte || false},
        ${lead.tipoTransporte || null}, ${lead.experienciaViagem || null},
        ${lead.motivoViagem || null}, ${lead.preferenciaContato || null},
        ${lead.melhorHorario || null}, ${lead.comoConheceu || null},
        ${lead.receberPromocoes || false}, ${lead.observacoes || null},
        ${lead.necessidadeEspecial || null}, ${lead.source}, ${lead.status},
        ${lead.priority}, ${lead.createdAt}, ${lead.updatedAt},
        ${JSON.stringify(lead.fullData || {})}, ${lead.userAgent || null},
        ${lead.pageUrl || null}, ${lead.ipAddress || null}, ${lead.sessionId || null}
      )
    `;
  }
  
  /**
   * Get lead by ID
   */
  static async getLeadById(id: string): Promise<ServiceResult<UnifiedLead>> {
    try {
      // Try primary database first
      try {
        const result = await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1`;
        
        if (result.rows.length > 0) {
          const lead = this.mapDatabaseRowToUnifiedLead(result.rows[0]);
          return {
            success: true,
            data: lead,
            metadata: { storage: 'database' }
          };
        }
      } catch (dbError) {
        console.warn('Database query failed, trying fallback:', dbError);
      }
      
      // Try fallback storage
      const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
      const fallbackLead = fallbackLeads.find((lead: any) => lead.id === id);
      
      if (fallbackLead) {
        const unifiedLead = convertLegacyToUnified(fallbackLead);
        return {
          success: true,
          data: unifiedLead as UnifiedLead,
          metadata: { storage: 'fallback' }
        };
      }
      
      return {
        success: false,
        error: 'Lead não encontrado'
      };
      
    } catch (error) {
      console.error('Error retrieving lead:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar lead'
      };
    }
  }
  
  /**
   * Get leads with filtering and pagination
   */
  static async getLeads(params: LeadQueryParams = {}): Promise<ServiceResult<{
    leads: UnifiedLead[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        priority,
        source,
        assignedTo,
        createdAfter,
        createdBefore,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;
      
      // Try primary database first
      try {
        const whereConditions: string[] = [];
        const queryParams: any[] = [];
        let paramIndex = 1;
        
        // Build WHERE conditions
        if (status) {
          if (Array.isArray(status)) {
            whereConditions.push(`status = ANY($${paramIndex})`);
            queryParams.push(status);
          } else {
            whereConditions.push(`status = $${paramIndex}`);
            queryParams.push(status);
          }
          paramIndex++;
        }
        
        if (priority) {
          if (Array.isArray(priority)) {
            whereConditions.push(`priority = ANY($${paramIndex})`);
            queryParams.push(priority);
          } else {
            whereConditions.push(`priority = $${paramIndex}`);
            queryParams.push(priority);
          }
          paramIndex++;
        }
        
        if (source) {
          if (Array.isArray(source)) {
            whereConditions.push(`source = ANY($${paramIndex})`);
            queryParams.push(source);
          } else {
            whereConditions.push(`source = $${paramIndex}`);
            queryParams.push(source);
          }
          paramIndex++;
        }
        
        if (assignedTo) {
          whereConditions.push(`assigned_to = $${paramIndex}`);
          queryParams.push(assignedTo);
          paramIndex++;
        }
        
        if (createdAfter) {
          whereConditions.push(`created_at >= $${paramIndex}`);
          queryParams.push(createdAfter);
          paramIndex++;
        }
        
        if (createdBefore) {
          whereConditions.push(`created_at <= $${paramIndex}`);
          queryParams.push(createdBefore);
          paramIndex++;
        }
        
        if (search) {
          whereConditions.push(`(nome ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR whatsapp ILIKE $${paramIndex})`);
          queryParams.push(`%${search}%`);
          paramIndex++;
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        const limitClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        
        queryParams.push(limit, (page - 1) * limit);
        
        const query = `SELECT * FROM leads ${whereClause} ${orderClause} ${limitClause}`;
        const countQuery = `SELECT COUNT(*) as total FROM leads ${whereClause}`;
        
        const [leadsResult, countResult] = await Promise.all([
          sql.query(query, queryParams.slice(0, -2).concat([limit, (page - 1) * limit])),
          sql.query(countQuery, queryParams.slice(0, -2))
        ]);
        
        const leads = leadsResult.rows.map(row => this.mapDatabaseRowToUnifiedLead(row));
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        
        return {
          success: true,
          data: {
            leads,
            total,
            page,
            totalPages
          },
          metadata: { storage: 'database' }
        };
        
      } catch (dbError) {
        console.warn('Database query failed, using fallback:', dbError);
        
        // Fallback to file storage
        const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
        let filteredLeads = fallbackLeads.map((lead: any) => convertLegacyToUnified(lead)) as UnifiedLead[];
        
        // Apply filters
        if (status) {
          const statusArray = Array.isArray(status) ? status : [status];
          filteredLeads = filteredLeads.filter(lead => statusArray.includes(lead.status));
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredLeads = filteredLeads.filter(lead => 
            lead.nome.toLowerCase().includes(searchLower) ||
            lead.email.toLowerCase().includes(searchLower) ||
            lead.whatsapp.includes(search)
          );
        }
        
        // Apply sorting
        filteredLeads.sort((a, b) => {
          const aValue = a[sortBy as keyof UnifiedLead] || '';
          const bValue = b[sortBy as keyof UnifiedLead] || '';
          
          if (sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
        
        // Apply pagination
        const total = filteredLeads.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedLeads = filteredLeads.slice(startIndex, startIndex + limit);
        
        return {
          success: true,
          data: {
            leads: paginatedLeads,
            total,
            page,
            totalPages
          },
          metadata: { storage: 'fallback' }
        };
      }
      
    } catch (error) {
      console.error('Error retrieving leads:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar leads'
      };
    }
  }
  
  /**
   * Update lead
   */
  static async updateLead(input: UpdateLeadInput): Promise<ServiceResult<UnifiedLead>> {
    try {
      const { id, ...updateData } = input;
      
      // Get current lead
      const currentResult = await this.getLeadById(id);
      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: 'Lead não encontrado'
        };
      }
      
      // Merge updates
      const updatedLead: UnifiedLead = {
        ...currentResult.data,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Try to update in primary database
      try {
        await sql`
          UPDATE leads SET
            status = ${updatedLead.status},
            priority = ${updatedLead.priority},
            assigned_to = ${updatedLead.assignedTo || null},
            observacoes = ${updatedLead.observacoes || null},
            updated_at = ${updatedLead.updatedAt}
          WHERE id = ${id}
        `;
        
        return {
          success: true,
          data: updatedLead,
          metadata: { storage: 'database' }
        };
      } catch (dbError) {
        console.warn('Database update failed:', dbError);
        
        // For fallback storage, we'd need to implement file update logic
        return {
          success: false,
          error: 'Atualização não suportada no armazenamento de fallback'
        };
      }
      
    } catch (error) {
      console.error('Error updating lead:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar lead'
      };
    }
  }
  
  /**
   * Get lead statistics
   */
  static async getLeadStats(): Promise<ServiceResult<LeadStats>> {
    try {
      // Implementation would include complex aggregations
      // For now, return basic stats
      const leadsResult = await this.getLeads({ limit: 10000 }); // Get all leads for stats
      
      if (!leadsResult.success || !leadsResult.data) {
        return {
          success: false,
          error: 'Erro ao buscar dados para estatísticas'
        };
      }
      
      const { leads } = leadsResult.data;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - 7);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const stats: LeadStats = {
        total: leads.length,
        today: leads.filter(lead => new Date(lead.createdAt) >= today).length,
        thisWeek: leads.filter(lead => new Date(lead.createdAt) >= thisWeek).length,
        thisMonth: leads.filter(lead => new Date(lead.createdAt) >= thisMonth).length,
        byStatus: {} as any,
        byPriority: {} as any,
        bySource: {},
        byService: {} as any,
        conversionRate: {
          overall: 0,
          bySource: {},
          byService: {} as any
        },
        averageResponseTime: 0,
        topDestinations: [],
        topOrigins: []
      };
      
      // Calculate stats (simplified implementation)
      // In production, these calculations should be optimized and cached
      
      return {
        success: true,
        data: stats,
        metadata: { calculatedAt: new Date().toISOString() }
      };
      
    } catch (error) {
      console.error('Error calculating lead stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao calcular estatísticas'
      };
    }
  }
  
  /**
   * Map database row to unified lead format
   */
  private static mapDatabaseRowToUnifiedLead(row: any): UnifiedLead {
    return {
      id: row.id,
      customerId: row.customer_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      source: row.source,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to,
      nome: row.nome,
      email: row.email,
      whatsapp: row.whatsapp,
      sobrenome: row.sobrenome,
      telefone: row.telefone,
      cpf: row.cpf,
      dataNascimento: row.data_nascimento,
      cidade: row.cidade,
      estado: row.estado,
      pais: row.pais,
      selectedServices: JSON.parse(row.selected_services || '[]'),
      origem: row.origem,
      destino: row.destino,
      tipoViagem: row.tipo_viagem,
      dataPartida: row.data_partida,
      dataRetorno: row.data_retorno,
      numeroPassageiros: row.numero_passageiros,
      adultos: row.adultos,
      criancas: row.criancas,
      bebes: row.bebes,
      classeViagem: row.classe_viagem,
      classeVoo: row.classe_voo,
      companhiaPreferida: row.companhia_preferida,
      horarioPreferido: row.horario_preferido,
      escalas: row.escalas,
      orcamentoTotal: row.orcamento_total,
      orcamentoAproximado: row.orcamento_aproximado,
      prioridadeOrcamento: row.prioridade_orcamento,
      flexibilidadeDatas: row.flexibilidade_datas,
      precisaHospedagem: row.precisa_hospedagem,
      tipoHospedagem: row.tipo_hospedagem,
      categoriaHospedagem: row.categoria_hospedagem,
      precisaTransporte: row.precisa_transporte,
      tipoTransporte: row.tipo_transporte,
      experienciaViagem: row.experiencia_viagem,
      motivoViagem: row.motivo_viagem,
      preferenciaContato: row.preferencia_contato,
      melhorHorario: row.melhor_horario,
      comoConheceu: row.como_conheceu,
      receberPromocoes: row.receber_promocoes,
      observacoes: row.observacoes,
      necessidadeEspecial: row.necessidade_especial,
      fullData: JSON.parse(row.full_data || '{}'),
      userAgent: row.user_agent,
      pageUrl: row.page_url,
      ipAddress: row.ip_address,
      sessionId: row.session_id
    };
  }
}

/**
 * Convenience functions for backward compatibility
 */

export async function createLead(input: CreateLeadInput) {
  return LeadService.createLead(input);
}

export async function getLeadById(id: string) {
  return LeadService.getLeadById(id);
}

export async function getLeads(params?: LeadQueryParams) {
  return LeadService.getLeads(params);
}

export async function updateLead(input: UpdateLeadInput) {
  return LeadService.updateLead(input);
}

export async function getLeadStats() {
  return LeadService.getLeadStats();
}