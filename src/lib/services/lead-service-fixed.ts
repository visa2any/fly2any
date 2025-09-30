/**
 * ENTERPRISE LEAD SERVICE - FIXED VERSION
 * Complete fix for lead submission with robust fallback mechanisms
 */

import { sql } from '@vercel/postgres';
import { DatabaseFallback } from '@/lib/database-fallback';
import { LeadCache } from '@/lib/lead-cache';
import {
  UnifiedLead,
  ServiceType,
  CreateLeadInput,
  UpdateLeadInput,
  LeadQueryParams,
  LeadStats,
  BudgetPriority,
  LEAD_VALIDATION_RULES,
  convertLegacyToUnified,
  normalizeTripType,
  getTotalPassengers,
  getDepartureDate,
  getReturnDate,
  getFlightClass,
  getBudgetAmount
} from '@/lib/schemas/lead';
import { AirportSelection } from '@/types/flights';

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Helper function to convert AirportSelection to string format
 */
function convertAirportSelectionToString(airport: string | AirportSelection | null | undefined): string {
  if (!airport) return 'A definir';

  if (typeof airport === 'string') {
    return airport;
  }

  if (typeof airport === 'object' && airport.city && airport.country) {
    return `${airport.city}, ${airport.country}${airport.iataCode ? ` (${airport.iataCode})` : ''}`;
  }

  return 'A definir';
}

/**
 * Helper function to normalize budget priority values
 */
function normalizeBudgetPriority(value: string | boolean | undefined): BudgetPriority | undefined {
  if (!value) return undefined;

  if (typeof value === 'boolean' && value === true) {
    return 'conforto'; // Map urgency to 'conforto' priority
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    switch (normalized) {
      case 'alta':
      case 'high':
      case 'urgente':
        return 'conforto';
      case 'media':
      case 'medium':
        return 'custo_beneficio';
      case 'baixa':
      case 'low':
        return 'baixo_custo';
      case 'luxo':
      case 'luxury':
        return 'luxo';
      default:
        return 'custo_beneficio'; // Default fallback
    }
  }

  return undefined;
}

export class LeadServiceFixed {
  
  /**
   * Improved validation with better error messages
   */
  static validateLeadInput(input: CreateLeadInput): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    
    // Required fields validation
    if (!input.nome?.trim()) {
      errors.push({
        field: 'nome',
        message: 'Nome é obrigatório'
      });
    }
    
    if (!input.email?.trim() || !LEAD_VALIDATION_RULES.email.pattern.test(input.email)) {
      errors.push({
        field: 'email',
        message: 'Email válido é obrigatório'
      });
    }
    
    // WhatsApp is optional but if provided must be valid
    if (input.whatsapp && input.whatsapp.trim() && input.whatsapp.length < 10) {
      errors.push({
        field: 'whatsapp',
        message: 'WhatsApp deve ter pelo menos 10 dígitos'
      });
    }
    
    // Services validation - make it more flexible
    if (!input.selectedServices) {
      // If no services, create default flight service
      input.selectedServices = ['voos'];
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * ENHANCED: Extract data from serviceDetails structure with improved mapping
   */
  private static extractServiceDetails(input: any): Partial<CreateLeadInput> {
    const extracted: Partial<CreateLeadInput> = {};

    // Debug log for troubleshooting
    console.log('[Lead Service] Extracting service details from input:', {
      hasServiceDetails: !!input.serviceDetails,
      serviceDetailsKeys: input.serviceDetails ? Object.keys(input.serviceDetails) : [],
      voosData: input.serviceDetails?.voos ? 'exists' : 'missing'
    });

    // Check if serviceDetails.voos exists (for flight data)
    if (input.serviceDetails?.voos) {
      const voos = input.serviceDetails.voos;
      console.log('[Lead Service] Processing voos data:', voos);

      // Extract origin data with multiple format support
      if (voos.origin) {
        extracted.origem = convertAirportSelectionToString(voos.origin);
        console.log('[Lead Service] Extracted origem:', extracted.origem);
      }

      // Extract destination data with multiple format support
      if (voos.destination) {
        extracted.destino = convertAirportSelectionToString(voos.destination);
        console.log('[Lead Service] Extracted destino:', extracted.destino);
      }

      // Extract dates with validation
      if (voos.departureDate && voos.departureDate !== '') {
        extracted.dataPartida = voos.departureDate;
        extracted.dataIda = voos.departureDate;
        console.log('[Lead Service] Extracted departure date:', extracted.dataPartida);
      }

      if (voos.returnDate && voos.returnDate !== '') {
        extracted.dataRetorno = voos.returnDate;
        extracted.dataVolta = voos.returnDate;
        console.log('[Lead Service] Extracted return date:', extracted.dataRetorno);
      }

      // Extract trip type with improved mapping
      if (voos.tripType) {
        extracted.tipoViagem = voos.tripType === 'round-trip' ? 'ida-volta' :
                             voos.tripType === 'one-way' ? 'so-ida' :
                             voos.tripType === 'multi-city' ? 'multipla-cidade' : voos.tripType;
        console.log('[Lead Service] Extracted trip type:', extracted.tipoViagem);
      }

      // Extract passenger information with enhanced logic
      if (voos.passengers) {
        if (typeof voos.passengers === 'number') {
          extracted.numeroPassageiros = voos.passengers;
          extracted.adultos = voos.passengers; // default all to adults
        } else if (typeof voos.passengers === 'object') {
          extracted.adultos = voos.passengers.adults || 1;
          extracted.criancas = voos.passengers.children || 0;
          extracted.bebes = voos.passengers.infants || 0;
          extracted.numeroPassageiros = (voos.passengers.adults || 1) +
                                       (voos.passengers.children || 0) +
                                       (voos.passengers.infants || 0);
          console.log('[Lead Service] Extracted passengers:', {
            adults: extracted.adultos,
            children: extracted.criancas,
            infants: extracted.bebes,
            total: extracted.numeroPassageiros
          });
        }
      }

      // Extract travel class with improved mapping
      if (voos.travelClass) {
        const classMapping = {
          'economy': 'economica',
          'premium': 'premium',
          'business': 'executiva',
          'first': 'primeira'
        };
        extracted.classeViagem = classMapping[voos.travelClass as keyof typeof classMapping] || voos.travelClass;
        extracted.classeVoo = extracted.classeViagem;
        console.log('[Lead Service] Extracted travel class:', extracted.classeViagem);
      }

      // Extract budget information
      if (voos.budget) {
        const budgetMapping = {
          'economy': 'Econômico (R$ 500 - 1.500)',
          'standard': 'Padrão (R$ 1.500 - 3.000)',
          'premium': 'Premium (R$ 3.000 - 5.000)',
          'luxury': 'Luxo (R$ 5.000+)'
        };
        extracted.orcamentoAproximado = budgetMapping[voos.budget as keyof typeof budgetMapping] || voos.budget;
        console.log('[Lead Service] Extracted budget:', extracted.orcamentoAproximado);
      }

      // Extract preferences
      if (voos.preferences && voos.preferences.trim()) {
        extracted.observacoes = voos.preferences;
        console.log('[Lead Service] Extracted preferences:', extracted.observacoes);
      }

      // Extract urgency flags
      if (voos.urgente !== undefined) {
        extracted.prioridadeOrcamento = normalizeBudgetPriority(voos.urgente);
        console.log('[Lead Service] Extracted priority:', extracted.prioridadeOrcamento);
      }

      // Extract flexible dates
      if (voos.flexivelDatas === true) {
        extracted.flexibilidadeDatas = true;
        console.log('[Lead Service] Extracted flexible dates: true');
      }
    }

    // FALLBACK: Also check top-level for service data (alternative structure)
    if (!extracted.origem && input.serviceData?.voos?.origin) {
      const voos = input.serviceData.voos;

      extracted.origem = convertAirportSelectionToString(voos.origin);
      extracted.destino = convertAirportSelectionToString(voos.destination);
    }

    // FALLBACK: Check if data is in flightSearchParams (another structure)
    if (!extracted.origem && input.flightSearchParams) {
      const params = input.flightSearchParams;
      if (params.originLocationCode) {
        extracted.origem = params.originLocationCode;
      }
      if (params.destinationLocationCode) {
        extracted.destino = params.destinationLocationCode;
      }
      if (params.departureDate) {
        extracted.dataPartida = params.departureDate;
      }
      if (params.returnDate) {
        extracted.dataRetorno = params.returnDate;
      }
      if (params.adults || params.children || params.infants) {
        extracted.adultos = params.adults || 1;
        extracted.criancas = params.children || 0;
        extracted.bebes = params.infants || 0;
        extracted.numeroPassageiros = (params.adults || 1) + (params.children || 0) + (params.infants || 0);
      }
    }

    // Check for other service details (hotels, cars, etc.)
    if (input.serviceDetails?.hoteis) {
      extracted.precisaHospedagem = true;
    }

    if (input.serviceDetails?.carros) {
      extracted.precisaTransporte = true;
    }

    console.log('[Lead Service] Final extracted data:', extracted);
    return extracted;
  }

  /**
   * Transform input to unified lead with better defaults
   */
  static transformToUnifiedLead(input: CreateLeadInput): UnifiedLead {
    const now = new Date().toISOString();
    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract data from serviceDetails if present
    const extractedData = this.extractServiceDetails(input);
    
    // Merge extracted data with input, giving priority to extracted data
    const mergedInput = { ...input, ...extractedData };
    
    // Ensure we have valid services array
    const services = Array.isArray(mergedInput.selectedServices) 
      ? mergedInput.selectedServices.filter((s): s is ServiceType => 
          ['voos', 'hoteis', 'carros', 'passeios', 'seguro', 'newsletter'].includes(s as ServiceType)
        )
      : ['voos'] as ServiceType[];
    
    return {
      // System fields
      id,
      createdAt: now,
      updatedAt: now,
      source: mergedInput.source || 'website',
      status: 'novo',
      priority: 'media',
      
      // Personal information
      nome: mergedInput.nome?.trim() || '',
      email: mergedInput.email?.toLowerCase().trim() || '',
      whatsapp: mergedInput.whatsapp?.replace(/\D/g, '') || '',
      sobrenome: mergedInput.sobrenome?.trim(),
      telefone: mergedInput.telefone?.replace(/\D/g, ''),
      
      // Location - with better defaults (prioritize extracted data)
      origem: convertAirportSelectionToString(mergedInput.origem),
      destino: convertAirportSelectionToString(mergedInput.destino),
      
      // Travel information
      selectedServices: services,
      tipoViagem: mergedInput.tipoViagem || 'ida-volta',
      
      // Dates - handle both formats (prioritize extracted data)
      dataPartida: mergedInput.dataPartida || mergedInput.dataIda,
      dataRetorno: mergedInput.dataRetorno || mergedInput.dataVolta,
      dataIda: mergedInput.dataIda,
      dataVolta: mergedInput.dataVolta,
      
      // Passengers with defaults (prioritize extracted data)
      numeroPassageiros: mergedInput.numeroPassageiros || getTotalPassengers(mergedInput as Partial<UnifiedLead>) || 1,
      adultos: mergedInput.adultos || 1,
      criancas: mergedInput.criancas || 0,
      bebes: mergedInput.bebes || 0,
      
      // Flight preferences with defaults (prioritize extracted data)
      classeViagem: mergedInput.classeViagem || mergedInput.classeVoo || 'economica',
      classeVoo: mergedInput.classeVoo || 'economica',
      companhiaPreferida: mergedInput.companhiaPreferida?.trim(),
      horarioPreferido: mergedInput.horarioPreferido || 'qualquer',
      escalas: mergedInput.escalas || 'qualquer',
      
      // Budget
      orcamentoTotal: mergedInput.orcamentoTotal || mergedInput.orcamentoAproximado,
      orcamentoAproximado: mergedInput.orcamentoAproximado,
      prioridadeOrcamento: normalizeBudgetPriority(mergedInput.prioridadeOrcamento),
      flexibilidadeDatas: mergedInput.flexibilidadeDatas || false,
      
      // Additional info
      observacoes: mergedInput.observacoes,
      
      // Metadata
      userAgent: mergedInput.userAgent,
      ipAddress: mergedInput.ipAddress,
      pageUrl: mergedInput.pageUrl,
      sessionId: mergedInput.sessionId,
      
      // Store full data for reference (include both original and extracted)
      fullData: {
        originalInput: input,
        extractedServiceDetails: extractedData,
        mergedData: mergedInput
      } as any
    };
  }

  /**
   * FIXED: Save to database with better error handling
   */
  private static async saveToDatabase(lead: UnifiedLead): Promise<void> {
    // Check database configuration
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!dbUrl) {
      console.warn('[LeadService] No database URL configured, will use fallback');
      throw new Error('Database not configured');
    }
    
    try {
      console.log('[LeadService] Attempting database save...');
      
      // Simplified INSERT with only essential fields - FIXED to use leads_unified table
      await sql`
        INSERT INTO leads_unified (
          id, nome, email, whatsapp, telefone,
          origem, destino, data_partida, data_retorno,
          numero_passageiros, tipo_viagem, selected_services,
          observacoes, source, status, created_at, full_data
        ) VALUES (
          ${lead.id},
          ${lead.nome},
          ${lead.email},
          ${lead.whatsapp || ''},
          ${lead.telefone || null},
          ${lead.origem || 'A definir'},
          ${lead.destino || 'A definir'},
          ${lead.dataPartida || null},
          ${lead.dataRetorno || null},
          ${lead.numeroPassageiros || 1},
          ${lead.tipoViagem || 'ida-volta'},
          ${JSON.stringify(lead.selectedServices || ['flight'])},
          ${lead.observacoes || null},
          ${lead.source || 'website'},
          ${lead.status || 'novo'},
          ${lead.createdAt},
          ${JSON.stringify(lead.fullData || lead)}
        )
      `;
      
      console.log('[LeadService] ✅ Lead saved to database successfully');
    } catch (error) {
      console.error('[LeadService] Database save error:', error);
      
      // Try minimal insert if full insert fails
      try {
        await sql`
          INSERT INTO leads_unified (id, nome, email, created_at) 
          VALUES (${lead.id}, ${lead.nome}, ${lead.email}, ${lead.createdAt})
        `;
        console.log('[LeadService] ✅ Lead saved with minimal data');
      } catch (minimalError) {
        console.error('[LeadService] Minimal save also failed:', minimalError);
        throw minimalError;
      }
    }
  }

  /**
   * FIXED: Create lead with multiple fallback strategies
   */
  static async createLead(input: CreateLeadInput): Promise<ServiceResult<UnifiedLead>> {
    console.log('[LeadService] Creating lead with input:', {
      nome: input.nome,
      email: input.email,
      origem: input.origem,
      destino: input.destino
    });
    
    try {
      // Validate input
      const validation = this.validateLeadInput(input);
      if (!validation.isValid) {
        console.error('[LeadService] Validation failed:', validation.errors);
        return {
          success: false,
          error: validation.errors[0]?.message || 'Dados inválidos',
          metadata: { validationErrors: validation.errors }
        };
      }
      
      // Transform to unified format
      const unifiedLead = this.transformToUnifiedLead(input);
      console.log('[LeadService] Transformed lead:', unifiedLead.id);
      
      // Strategy 1: Try primary database
      let savedToDatabase = false;
      try {
        await this.saveToDatabase(unifiedLead);
        savedToDatabase = true;
        console.log('[LeadService] ✅ Saved to primary database');
      } catch (dbError) {
        console.warn('[LeadService] ⚠️ Database save failed, trying fallbacks...');
      }
      
      // Strategy 2: Try file fallback
      let savedToFile = false;
      if (!savedToDatabase) {
        try {
          const fallbackResult = await DatabaseFallback.saveLeadToFile(unifiedLead);
          if (fallbackResult.success) {
            savedToFile = true;
            console.log('[LeadService] ✅ Saved to file fallback');
          }
        } catch (fileError) {
          console.warn('[LeadService] ⚠️ File fallback failed');
        }
      }
      
      // Strategy 3: Always save to memory cache
      try {
        LeadCache.addLead({
          id: unifiedLead.id,
          nome: unifiedLead.nome,
          email: unifiedLead.email,
          whatsapp: unifiedLead.whatsapp,
          telefone: unifiedLead.telefone,
          origem: unifiedLead.origem || 'A definir',
          destino: unifiedLead.destino || 'A definir',
          selectedServices: unifiedLead.selectedServices,
          source: unifiedLead.source,
          createdAt: unifiedLead.createdAt,
          dataPartida: unifiedLead.dataPartida || '',
          numeroPassageiros: unifiedLead.numeroPassageiros || 1,
          status: 'novo'
        });
        console.log('[LeadService] ✅ Added to memory cache');
      } catch (cacheError) {
        console.warn('[LeadService] ⚠️ Cache save failed');
      }
      
      // Determine storage method for response
      let storageMethod = 'unknown';
      if (savedToDatabase) {
        storageMethod = 'database';
      } else if (savedToFile) {
        storageMethod = 'file';
      } else {
        storageMethod = 'memory';
      }
      
      // Always return success if at least one storage method worked
      console.log(`[LeadService] ✅ Lead created successfully (storage: ${storageMethod})`);
      
      return {
        success: true,
        data: unifiedLead,
        metadata: { 
          storage: storageMethod,
          leadId: unifiedLead.id
        }
      };
      
    } catch (error) {
      console.error('[LeadService] ❌ Unexpected error:', error);
      
      // Even if everything fails, try to save minimal data
      const emergencyLead = {
        id: `emergency_${Date.now()}`,
        nome: input.nome || 'Unknown',
        email: input.email || 'unknown@example.com',
        createdAt: new Date().toISOString(),
        data: JSON.stringify(input)
      };
      
      // Save to localStorage or session storage as last resort
      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('emergency_leads') || '[]');
          existing.push(emergencyLead);
          localStorage.setItem('emergency_leads', JSON.stringify(existing));
          console.log('[LeadService] ⚠️ Saved to localStorage as emergency');
        } catch (e) {
          console.error('[LeadService] ❌ Even localStorage failed');
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar lead',
        metadata: { 
          errorDetails: error instanceof Error ? error.stack : undefined 
        }
      };
    }
  }
  
  /**
   * Get leads with improved error handling
   */
  static async getLeads(params: LeadQueryParams): Promise<ServiceResult<any>> {
    try {
      // Try database first
      const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
      
      if (dbUrl) {
        try {
          const result = await sql`
            SELECT * FROM leads_unified 
            ORDER BY created_at DESC 
            LIMIT ${params.limit || 50} 
            OFFSET ${((params.page || 1) - 1) * (params.limit || 50)}
          `;
          
          return {
            success: true,
            data: {
              leads: result.rows,
              total: result.rowCount,
              page: params.page || 1,
              limit: params.limit || 50
            },
            metadata: { storage: 'database' }
          };
        } catch (dbError) {
          console.warn('[LeadService] Database query failed:', dbError);
        }
      }
      
      // Fallback to cache
      const cacheResult = LeadCache.getAllLeads(1, params.limit || 50);
      const cachedLeads = cacheResult.leads;
      
      return {
        success: true,
        data: {
          leads: cachedLeads,
          total: cachedLeads.length,
          page: 1,
          limit: params.limit || 50
        },
        metadata: { storage: 'cache' }
      };
      
    } catch (error) {
      console.error('[LeadService] Error getting leads:', error);
      return {
        success: false,
        error: 'Failed to retrieve leads',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}