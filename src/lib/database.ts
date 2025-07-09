import { promises as fs } from 'fs';
import path from 'path';

// Verificar se está no ambiente correto
const isServerSide = typeof window === 'undefined';

export interface ServiceData {
  serviceType: string;
  origem?: string;
  destino?: string;
  dataIda?: string;
  dataVolta?: string;
  adultos?: number;
  criancas?: number;
  classeVoo?: string;
}

export interface Lead {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  selectedServices: ServiceData[];
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  tipoViagem: string;
  classeVoo: string;
  adultos: number;
  criancas: number;
  bebes: number;
  companhiaPreferida: string;
  horarioPreferido: string;
  escalas: string;
  orcamentoAproximado?: string;
  flexibilidadeDatas?: boolean;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

// Remove the conflicting type alias and replace all LeadData references with Lead

class DatabaseManager {
  private dataDir: string;
  private leadsFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.leadsFile = path.join(this.dataDir, 'leads.json');
  }

  // Inicializar diretório de dados
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  // Ler leads existentes
  private async readLeads(): Promise<Lead[]> {
    if (!isServerSide) {
      console.warn('Database operations only available on server side');
      return [];
    }
    
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(this.leadsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Se arquivo não existe, retorna array vazio
      return [];
    }
  }

  // Escrever leads
  private async writeLeads(leads: Lead[]): Promise<void> {
    if (!isServerSide) {
      console.warn('Database operations only available on server side');
      return;
    }
    
    await this.ensureDataDirectory();
    await fs.writeFile(this.leadsFile, JSON.stringify(leads, null, 2));
  }

  // Salvar novo lead
  async saveLead(leadData: Lead): Promise<{ success: boolean; leadId: string; error?: string }> {
    try {
      const leads = await this.readLeads();
      
      const newLead: Lead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nome: leadData.nome,
        sobrenome: leadData.sobrenome || '',
        email: leadData.email,
        telefone: leadData.telefone || '',
        whatsapp: leadData.whatsapp,
        selectedServices: leadData.selectedServices || [],
        origem: leadData.origem || '',
        destino: leadData.destino || '',
        dataIda: leadData.dataIda || '',
        dataVolta: leadData.dataVolta || '',
        tipoViagem: leadData.tipoViagem || 'ida-volta',
        classeVoo: leadData.classeVoo || 'economica',
        adultos: leadData.adultos || 1,
        criancas: leadData.criancas || 0,
        bebes: leadData.bebes || 0,
        companhiaPreferida: leadData.companhiaPreferida || '',
        horarioPreferido: leadData.horarioPreferido || 'qualquer',
        escalas: leadData.escalas || 'qualquer',
        orcamentoAproximado: leadData.orcamentoAproximado,
        flexibilidadeDatas: leadData.flexibilidadeDatas || false,
        observacoes: leadData.observacoes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      leads.push(newLead);
      await this.writeLeads(leads);

      console.log(`Lead salvo com sucesso: ${newLead.id}`);
      return { success: true, leadId: newLead.id };
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      return { 
        success: false, 
        leadId: '', 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Buscar lead por ID
  async getLeadById(id: string): Promise<Lead | null> {
    try {
      const leads = await this.readLeads();
      return leads.find(lead => lead.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      return null;
    }
  }

  // Buscar leads por email
  async getLeadsByEmail(email: string): Promise<Lead[]> {
    try {
      const leads = await this.readLeads();
      return leads.filter(lead => lead.email === email);
    } catch (error) {
      console.error('Erro ao buscar leads por email:', error);
      return [];
    }
  }

  // Listar todos os leads (com paginação)
  async getAllLeads(page: number = 1, limit: number = 50): Promise<{
    leads: Lead[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const allLeads = await this.readLeads();
      const total = allLeads.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const leads = allLeads
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(startIndex, endIndex);

      return {
        leads,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Erro ao listar leads:', error);
      return {
        leads: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  }

  // Estatísticas básicas
  async getLeadStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byService: Record<string, number>;
  }> {
    try {
      const leads = await this.readLeads();
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const today = leads.filter(lead => new Date(lead.createdAt) >= startOfDay).length;
      const thisWeek = leads.filter(lead => new Date(lead.createdAt) >= startOfWeek).length;
      const thisMonth = leads.filter(lead => new Date(lead.createdAt) >= startOfMonth).length;

      const byService: Record<string, number> = {};
      leads.forEach(lead => {
        lead.selectedServices.forEach(service => {
          byService[service.serviceType] = (byService[service.serviceType] || 0) + 1;
        });
      });

      return {
        total: leads.length,
        today,
        thisWeek,
        thisMonth,
        byService
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byService: {}
      };
    }
  }
}

// Singleton instance
export const database = new DatabaseManager();

// Utility functions
export async function saveLead(leadData: Lead) {
  return database.saveLead(leadData);
}

export async function getLeadById(id: string) {
  return database.getLeadById(id);
}

export async function getLeadsByEmail(email: string) {
  return database.getLeadsByEmail(email);
}

export async function getAllLeads(page?: number, limit?: number) {
  return database.getAllLeads(page, limit);
}

export async function getLeadStats() {
  return database.getLeadStats();
}
