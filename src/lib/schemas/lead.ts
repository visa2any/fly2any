/**
 * Unified Lead Schema for Fly2Any
 * 
 * This schema unifies all lead data formats and provides type safety
 * across the entire application. It supports both legacy and new formats
 * while maintaining backward compatibility.
 */

import { AirportSelection } from '@/types/flights';

// Base types for reusability
export type TripType = 'ida' | 'ida_volta' | 'multiplas_cidades' | 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
export type FlightClass = 'economica' | 'premium' | 'executiva' | 'primeira';
export type ContactPreference = 'whatsapp' | 'telefone' | 'email' | 'qualquer';
export type TimePreference = 'manha' | 'tarde' | 'noite' | 'qualquer';
export type ServiceType = 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro' | 'newsletter';
export type LeadStatus = 'novo' | 'contatado' | 'cotacao_enviada' | 'negociacao' | 'fechado' | 'perdido' | 'em_analise' | 'cotado' | 'proposta_enviada' | 'follow_up';
export type LeadPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type BudgetPriority = 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo';
export type TravelExperience = 'primeira_vez' | 'ocasional' | 'frequente' | 'expert';
export type TravelMotivation = 'lazer' | 'negocio' | 'familia' | 'lua_mel' | 'aventura' | 'cultura';
export type DiscoverySource = 'google' | 'facebook' | 'instagram' | 'indicacao' | 'youtube' | 'outro' | 'website';

/**
 * Unified Lead Interface
 * 
 * This interface encompasses all possible lead fields while maintaining
 * flexibility for different form types and data sources.
 */
export interface UnifiedLead {
  // System fields
  id: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: string;
  
  // Personal Information (required)
  nome: string;
  email: string;
  whatsapp: string;
  
  // Personal Information (optional)
  sobrenome?: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: string;
  
  // Location Information
  cidade?: string;
  estado?: string;
  pais?: string;
  
  // Travel Information - Core
  selectedServices: ServiceType[];
  origem?: string;
  destino?: string;
  tipoViagem?: TripType;
  
  // Travel Information - Dates (supporting both formats)
  dataPartida?: string;  // New format
  dataRetorno?: string;  // New format
  dataIda?: string;      // Legacy format
  dataVolta?: string;    // Legacy format
  
  // Passenger Information
  numeroPassageiros?: number; // New format
  adultos?: number;           // Legacy format
  criancas?: number;          // Legacy format  
  bebes?: number;             // Legacy format
  
  // Flight Preferences
  classeViagem?: FlightClass; // New format
  classeVoo?: FlightClass;    // Legacy format
  companhiaPreferida?: string;
  horarioPreferido?: TimePreference;
  escalas?: 'sem-escalas' | 'uma-escala' | 'qualquer';
  
  // Budget Information
  orcamentoTotal?: string;       // New format
  orcamentoAproximado?: string;  // Legacy format
  prioridadeOrcamento?: BudgetPriority;
  flexibilidadeDatas?: boolean;
  
  // Additional Services
  precisaHospedagem?: boolean;
  tipoHospedagem?: 'hotel' | 'pousada' | 'resort' | 'apartamento';
  categoriaHospedagem?: '3' | '4' | '5' | 'luxo';
  
  precisaTransporte?: boolean;
  tipoTransporte?: 'aluguel_carro' | 'transfer' | 'taxi' | 'uber';
  
  // Customer Profile
  experienciaViagem?: TravelExperience;
  motivoViagem?: TravelMotivation;
  
  // Communication Preferences
  preferenciaContato?: ContactPreference;
  melhorHorario?: TimePreference;
  
  // Marketing Information
  comoConheceu?: DiscoverySource;
  receberPromocoes?: boolean;
  
  // Additional Information
  observacoes?: string;
  necessidadeEspecial?: string;
  
  // Legacy compatibility fields
  serviceType?: ServiceType; // For backward compatibility
  
  // Raw data storage
  fullData?: Record<string, unknown>; // Complete original data for audit/debugging
  
  // Metadata
  userAgent?: string;
  pageUrl?: string;
  ipAddress?: string;
  sessionId?: string;
}

/**
 * Lead Creation Input
 * 
 * Interface for creating new leads with required fields only
 */
export interface CreateLeadInput {
  // Required fields
  nome: string;
  email: string;
  whatsapp: string;
  selectedServices: ServiceType[];
  
  // Optional fields (all others from UnifiedLead except system fields)
  sobrenome?: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  origem?: string | AirportSelection | null;
  destino?: string | AirportSelection | null;
  tipoViagem?: TripType;
  dataPartida?: string;
  dataRetorno?: string;
  dataIda?: string;
  dataVolta?: string;
  numeroPassageiros?: number;
  adultos?: number;
  criancas?: number;
  bebes?: number;
  classeViagem?: FlightClass;
  classeVoo?: FlightClass;
  companhiaPreferida?: string;
  horarioPreferido?: TimePreference;
  escalas?: 'sem-escalas' | 'uma-escala' | 'qualquer';
  orcamentoTotal?: string;
  orcamentoAproximado?: string;
  prioridadeOrcamento?: BudgetPriority;
  flexibilidadeDatas?: boolean;
  precisaHospedagem?: boolean;
  tipoHospedagem?: 'hotel' | 'pousada' | 'resort' | 'apartamento';
  categoriaHospedagem?: '3' | '4' | '5' | 'luxo';
  precisaTransporte?: boolean;
  tipoTransporte?: 'aluguel_carro' | 'transfer' | 'taxi' | 'uber';
  experienciaViagem?: TravelExperience;
  motivoViagem?: TravelMotivation;
  preferenciaContato?: ContactPreference;
  melhorHorario?: TimePreference;
  comoConheceu?: DiscoverySource;
  receberPromocoes?: boolean;
  observacoes?: string;
  necessidadeEspecial?: string;
  serviceType?: ServiceType;
  source?: string;
  fullData?: Record<string, unknown>;
  userAgent?: string;
  pageUrl?: string;
  ipAddress?: string;
  sessionId?: string;
}

/**
 * Lead Update Input
 * 
 * Interface for updating existing leads (all fields optional except id)
 */
export interface UpdateLeadInput {
  id: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedTo?: string;
  observacoes?: string;
  // Any other field from UnifiedLead can be updated
  [key: string]: unknown;
}

/**
 * Lead Query Parameters
 * 
 * Interface for filtering and searching leads
 */
export interface LeadQueryParams {
  page?: number;
  limit?: number;
  status?: LeadStatus | LeadStatus[];
  priority?: LeadPriority | LeadPriority[];
  source?: string | string[];
  assignedTo?: string;
  createdAfter?: string;
  createdBefore?: string;
  search?: string; // Search in name, email, or phone
  sortBy?: 'createdAt' | 'updatedAt' | 'nome' | 'status' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Lead Statistics
 * 
 * Interface for lead metrics and analytics
 */
export interface LeadStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<LeadStatus, number>;
  byPriority: Record<LeadPriority, number>;
  bySource: Record<string, number>;
  byService: Record<ServiceType, number>;
  conversionRate: {
    overall: number;
    bySource: Record<string, number>;
    byService: Record<ServiceType, number>;
  };
  averageResponseTime: number; // in hours
  topDestinations: Array<{ destination: string; count: number }>;
  topOrigins: Array<{ origin: string; count: number }>;
}

/**
 * Validation Rules
 * 
 * Validation configuration for lead fields
 */
export const LEAD_VALIDATION_RULES = {
  nome: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  whatsapp: {
    required: false,
    minLength: 10,
    maxLength: 25,
    pattern: /^\+?[1-9][\d\s\-\(\)]{8,20}$/
  },
  telefone: {
    required: false,
    minLength: 10,
    maxLength: 20,
    pattern: /^\+?[1-9]\d{1,14}$/
  },
  selectedServices: {
    required: true,
    minItems: 1,
    validValues: ['voos', 'hoteis', 'carros', 'passeios', 'seguro', 'newsletter']
  },
  cpf: {
    required: false,
    pattern: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/
  }
} as const;

/**
 * Service Type Mappings
 * 
 * Human-readable labels for service types
 */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  voos: 'Voos',
  hoteis: 'Hotéis',
  carros: 'Aluguel de Carros',
  passeios: 'Passeios e Tours',
  seguro: 'Seguro Viagem',
  newsletter: 'Newsletter'
} as const;

/**
 * Status Labels and Colors
 * 
 * UI configuration for lead statuses
 */
export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; priority: number }> = {
  novo: { label: 'Novo', color: '#3b82f6', priority: 1 },
  contatado: { label: 'Contatado', color: '#f59e0b', priority: 2 },
  em_analise: { label: 'Em Análise', color: '#8b5cf6', priority: 3 },
  cotado: { label: 'Cotado', color: '#06b6d4', priority: 4 },
  cotacao_enviada: { label: 'Cotação Enviada', color: '#06b6d4', priority: 5 },
  proposta_enviada: { label: 'Proposta Enviada', color: '#14b8a6', priority: 6 },
  negociacao: { label: 'Em Negociação', color: '#f97316', priority: 7 },
  follow_up: { label: 'Follow-up', color: '#84cc16', priority: 8 },
  fechado: { label: 'Fechado', color: '#10b981', priority: 9 },
  perdido: { label: 'Perdido', color: '#ef4444', priority: 10 }
} as const;

/**
 * Utility Functions
 */

/**
 * Normalize trip type to standard format
 */
export function normalizeTripType(tripType?: string): TripType {
  if (!tripType) return 'ida_volta';
  
  const normalized = tripType.toLowerCase();
  switch (normalized) {
    case 'ida-volta':
    case 'ida_volta':
      return 'ida_volta';
    case 'somente-ida':
    case 'ida':
      return 'ida';
    case 'multiplas-cidades':
    case 'multiplas_cidades':
      return 'multiplas_cidades';
    default:
      return 'ida_volta';
  }
}

/**
 * Get total passenger count from lead data
 */
export function getTotalPassengers(lead: Partial<UnifiedLead>): number {
  if (lead.numeroPassageiros) {
    return lead.numeroPassageiros;
  }
  
  const adultos = lead.adultos || 0;
  const criancas = lead.criancas || 0;
  const bebes = lead.bebes || 0;
  
  return adultos + criancas + bebes;
}

/**
 * Get departure date from lead data (handles both formats)
 */
export function getDepartureDate(lead: Partial<UnifiedLead>): string | undefined {
  return lead.dataPartida || lead.dataIda;
}

/**
 * Get return date from lead data (handles both formats)
 */
export function getReturnDate(lead: Partial<UnifiedLead>): string | undefined {
  return lead.dataRetorno || lead.dataVolta;
}

/**
 * Get flight class from lead data (handles both formats)
 */
export function getFlightClass(lead: Partial<UnifiedLead>): FlightClass | undefined {
  return lead.classeViagem || lead.classeVoo;
}

/**
 * Get budget amount from lead data (handles both formats)
 */
export function getBudgetAmount(lead: Partial<UnifiedLead>): string | undefined {
  return lead.orcamentoTotal || lead.orcamentoAproximado;
}

/**
 * Convert legacy lead format to unified format
 */
export function convertLegacyToUnified(legacyLead: any): Partial<UnifiedLead> {
  return {
    // System fields
    id: legacyLead.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: legacyLead.createdAt || new Date().toISOString(),
    updatedAt: legacyLead.updatedAt || new Date().toISOString(),
    source: legacyLead.source || 'website',
    status: legacyLead.status || 'novo',
    priority: legacyLead.priority || 'media',
    
    // Personal information
    nome: legacyLead.nome,
    email: legacyLead.email,
    whatsapp: legacyLead.whatsapp,
    sobrenome: legacyLead.sobrenome,
    telefone: legacyLead.telefone,
    
    // Travel information
    selectedServices: Array.isArray(legacyLead.selectedServices) 
      ? legacyLead.selectedServices.map((s: any) => typeof s === 'string' ? s : s.serviceType)
      : legacyLead.serviceType ? [legacyLead.serviceType] : ['voos'],
    origem: legacyLead.origem,
    destino: legacyLead.destino,
    tipoViagem: normalizeTripType(legacyLead.tipoViagem),
    
    // Dates (prefer new format, fallback to legacy)
    dataPartida: legacyLead.dataPartida || legacyLead.dataIda,
    dataRetorno: legacyLead.dataRetorno || legacyLead.dataVolta,
    dataIda: legacyLead.dataIda,
    dataVolta: legacyLead.dataVolta,
    
    // Passengers
    numeroPassageiros: legacyLead.numeroPassageiros || getTotalPassengers(legacyLead),
    adultos: legacyLead.adultos,
    criancas: legacyLead.criancas,
    bebes: legacyLead.bebes,
    
    // Flight preferences
    classeViagem: legacyLead.classeViagem || legacyLead.classeVoo,
    classeVoo: legacyLead.classeVoo,
    companhiaPreferida: legacyLead.companhiaPreferida,
    horarioPreferido: legacyLead.horarioPreferido,
    escalas: legacyLead.escalas,
    
    // Budget
    orcamentoTotal: legacyLead.orcamentoTotal || legacyLead.orcamentoAproximado,
    orcamentoAproximado: legacyLead.orcamentoAproximado,
    prioridadeOrcamento: legacyLead.prioridadeOrcamento,
    flexibilidadeDatas: legacyLead.flexibilidadeDatas,
    
    // Additional services
    precisaHospedagem: legacyLead.precisaHospedagem,
    precisaTransporte: legacyLead.precisaTransporte,
    
    // Other fields
    observacoes: legacyLead.observacoes,
    fullData: legacyLead
  };
}