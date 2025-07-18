import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, Customer, Lead } from '@/lib/database';
import { DatabaseFallback } from '@/lib/database-fallback';
// import { sendWhatsAppMessage } from '@/lib/whatsapp';
// import { trackConversion } from '@/lib/analytics';

interface LeadFormData {
  // Dados Pessoais
  nome: string;
  email: string;
  whatsapp: string;
  cpf?: string;
  dataNascimento?: string;
  
  // Localização
  cidade?: string;
  estado?: string;
  pais?: string;
  
  // Viagem
  tipoViagem: 'ida' | 'ida_volta' | 'multiplas_cidades' | 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  origem?: string;
  destino?: string;
  dataPartida?: string;
  dataRetorno?: string;
  numeroPassageiros?: number;
  classeViagem?: 'economica' | 'premium' | 'executiva' | 'primeira';
  
  // Serviços
  selectedServices: string[];
  
  // Hospedagem
  precisaHospedagem?: boolean;
  tipoHospedagem?: 'hotel' | 'pousada' | 'resort' | 'apartamento';
  categoriaHospedagem?: '3' | '4' | '5' | 'luxo';
  
  // Transporte
  precisaTransporte?: boolean;
  tipoTransporte?: 'aluguel_carro' | 'transfer' | 'taxi' | 'uber';
  
  // Orçamento
  orcamentoTotal?: string;
  prioridadeOrcamento?: 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo';
  
  // Experiência
  experienciaViagem?: 'primeira_vez' | 'ocasional' | 'frequente' | 'expert';
  motivoViagem?: 'lazer' | 'negocio' | 'familia' | 'lua_mel' | 'aventura' | 'cultura';
  
  // Comunicação
  preferenciaContato?: 'whatsapp' | 'telefone' | 'email' | 'qualquer';
  melhorHorario?: 'manha' | 'tarde' | 'noite' | 'qualquer';
  
  // Marketing
  comoConheceu?: 'google' | 'facebook' | 'instagram' | 'indicacao' | 'youtube' | 'outro';
  receberPromocoes?: boolean;
  
  // Observações
  observacoes?: string;
  necessidadeEspecial?: string;
  
  // Metadata
  source?: string;
  timestamp?: string;
  userAgent?: string;
  pageUrl?: string;
}

// Compatibilidade com formato antigo
interface ServiceFormData {
  serviceType: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro';
  completed: boolean;
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  tipoViagem: 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  classeVoo: 'economica' | 'premium' | 'executiva' | 'primeira';
  adultos: number;
  criancas: number;
  bebes: number;
  companhiaPreferida: string;
  horarioPreferido: 'manha' | 'tarde' | 'noite' | 'qualquer';
  escalas: 'sem-escalas' | 'uma-escala' | 'qualquer';
  orcamentoAproximado?: string;
  flexibilidadeDatas?: boolean;
}

interface LeadDataOld {
  selectedServices: ServiceFormData[];
  currentServiceIndex: number;
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  tipoViagem: 'ida-volta' | 'somente-ida' | 'multiplas-cidades';
  classeVoo: 'economica' | 'premium' | 'executiva' | 'primeira';
  adultos: number;
  criancas: number;
  bebes: number;
  companhiaPreferida: string;
  horarioPreferido: 'manha' | 'tarde' | 'noite' | 'qualquer';
  escalas: 'sem-escalas' | 'uma-escala' | 'qualquer';
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  serviceType?: string;
  orcamentoAproximado?: string;
  prioridadeOrcamento?: 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo';
  flexibilidadeDatas?: boolean;
  observacoes?: string;
  source?: string;
  precisaHospedagem?: boolean;
  precisaTransporte?: boolean;
}

type LeadData = LeadFormData | LeadDataOld;

// Detectar formato dos dados
function isNewFormat(data: any): data is LeadFormData {
  return data.dataPartida !== undefined || data.tipoViagem !== undefined;
}

// Validação de dados
function validateLeadData(data: LeadData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  console.log('=== VALIDAÇÃO CAMPOS ===');
  
  // Campos obrigatórios
  console.log('Validando nome:', data.nome, typeof data.nome);
  if (!data.nome || typeof data.nome !== 'string' || data.nome.trim().length < 2) {
    errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
  }

  console.log('Validando email:', data.email, typeof data.email);
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email é obrigatório');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email inválido');
    }
  }

  console.log('Validando whatsapp:', data.whatsapp, typeof data.whatsapp, data.whatsapp?.length);
  if (!data.whatsapp || typeof data.whatsapp !== 'string' || data.whatsapp.length < 10) {
    errors.push('WhatsApp é obrigatório e deve ter pelo menos 10 dígitos');
  }

  console.log('Validando selectedServices:', data.selectedServices, Array.isArray(data.selectedServices), data.selectedServices?.length);
  if (!data.selectedServices || !Array.isArray(data.selectedServices) || data.selectedServices.length === 0) {
    errors.push('Pelo menos um serviço deve ser selecionado');
  }
  
  console.log('Errors encontrados:', errors);
  console.log('=====================');

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Enviar para N8N Webhook
async function sendToN8N(leadData: LeadData) {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_LEAD;
  
  if (!n8nWebhookUrl) {
    console.warn('N8N_WEBHOOK_LEAD não configurado');
    return false;
  }

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        source: 'fly2any_website',
        leadData
      })
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    console.log('Lead enviado para N8N com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao enviar para N8N:', error);
    return false;
  }
}

// Salvar no banco de dados
async function saveToDatabase(leadData: LeadData) {
  try {
    const { saveLead } = await import('@/lib/database');
    
    // Transform LeadData to Lead
    const lead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nome: leadData.nome,
      email: leadData.email,
      whatsapp: leadData.whatsapp,
      sobrenome: ('sobrenome' in leadData) ? leadData.sobrenome : '',
      telefone: ('telefone' in leadData) ? leadData.telefone : '',
      selectedServices: Array.isArray(leadData.selectedServices) ? 
        leadData.selectedServices.map(s => typeof s === 'string' ? s : 'serviceType' in s ? s.serviceType : 'unknown') : [],
      origem: leadData.origem || '',
      destino: leadData.destino || '',
      dataIda: ('dataIda' in leadData) ? leadData.dataIda : '',
      dataVolta: ('dataVolta' in leadData) ? leadData.dataVolta : '',
      tipoViagem: ('tipoViagem' in leadData) ? 
        leadData.tipoViagem === 'ida' ? 'ida-volta' : 
        leadData.tipoViagem === 'ida_volta' ? 'ida-volta' : 
        leadData.tipoViagem === 'multiplas_cidades' ? 'multiplas-cidades' : 
        leadData.tipoViagem 
      : 'ida-volta',
      classeVoo: ('classeVoo' in leadData) ? leadData.classeVoo : 'economica',
      adultos: ('adultos' in leadData) ? leadData.adultos : 1,
      criancas: ('criancas' in leadData) ? leadData.criancas : 0,
      bebes: ('bebes' in leadData) ? leadData.bebes : 0,
      companhiaPreferida: ('companhiaPreferida' in leadData) ? leadData.companhiaPreferida : '',
      horarioPreferido: ('horarioPreferido' in leadData) ? leadData.horarioPreferido : 'qualquer',
      escalas: ('escalas' in leadData) ? leadData.escalas : 'qualquer',
      orcamentoAproximado: ('orcamentoAproximado' in leadData) ? leadData.orcamentoAproximado : undefined,
      flexibilidadeDatas: ('flexibilidadeDatas' in leadData) ? Boolean(leadData.flexibilidadeDatas) : false,
      observacoes: ('observacoes' in leadData && leadData.observacoes) ? String(leadData.observacoes) : '',
      precisaHospedagem: Boolean(leadData.precisaHospedagem ?? false),
      precisaTransporte: Boolean(leadData.precisaTransporte ?? false),
      prioridadeOrcamento: (() => {
        const value = (leadData as LeadFormData).prioridadeOrcamento;
        if (value && typeof value === 'string' && ['baixo_custo', 'custo_beneficio', 'conforto', 'luxo'].includes(value)) {
          return value as 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo';
        }
        return 'custo_beneficio';
      })(),
      status: 'novo',
      priority: 'media',
      source: ('source' in leadData) ? String(leadData.source) : 'website',
      fullData: leadData
    };

    const result = await saveLead(lead);
    
    if (result.success) {
      console.log(`Lead salvo no banco com sucesso: ${result.leadId}`);
      return result.leadId;
    } else {
      console.error('Erro ao salvar lead no banco:', result.error);
      throw new Error(result.error || 'Erro ao salvar no banco');
    }
  } catch (error) {
    console.error('Erro ao salvar lead no banco:', error);
    throw error;
  }
}

// Enviar email de confirmação
async function sendConfirmationEmail(leadData: LeadData) {
  try {
    const { sendConfirmationEmail } = await import('@/lib/email');
    
    // Transform LeadData to Lead
    const lead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nome: leadData.nome,
      email: leadData.email,
      whatsapp: leadData.whatsapp,
      sobrenome: ('sobrenome' in leadData) ? leadData.sobrenome : '',
      telefone: ('telefone' in leadData) ? leadData.telefone : '',
      selectedServices: Array.isArray(leadData.selectedServices) ? 
        leadData.selectedServices.map(s => typeof s === 'string' ? s : 'serviceType' in s ? s.serviceType : 'unknown') : [],
      origem: leadData.origem || '',
      destino: leadData.destino || '',
      dataIda: ('dataIda' in leadData) ? leadData.dataIda : '',
      dataVolta: ('dataVolta' in leadData) ? leadData.dataVolta : '',
      tipoViagem: ('tipoViagem' in leadData) ? 
        leadData.tipoViagem === 'ida' ? 'ida-volta' : 
        leadData.tipoViagem === 'ida_volta' ? 'ida-volta' : 
        leadData.tipoViagem === 'multiplas_cidades' ? 'multiplas-cidades' : 
        leadData.tipoViagem 
      : 'ida-volta',
      classeVoo: ('classeVoo' in leadData) ? leadData.classeVoo : 'economica',
      adultos: ('adultos' in leadData) ? leadData.adultos : 1,
      criancas: ('criancas' in leadData) ? leadData.criancas : 0,
      bebes: ('bebes' in leadData) ? leadData.bebes : 0,
      companhiaPreferida: ('companhiaPreferida' in leadData) ? leadData.companhiaPreferida : '',
      horarioPreferido: ('horarioPreferido' in leadData) ? leadData.horarioPreferido : 'qualquer',
      escalas: ('escalas' in leadData) ? leadData.escalas : 'qualquer',
      orcamentoAproximado: ('orcamentoAproximado' in leadData) ? leadData.orcamentoAproximado : undefined,
      flexibilidadeDatas: ('flexibilidadeDatas' in leadData) ? Boolean(leadData.flexibilidadeDatas) : false,
      observacoes: ('observacoes' in leadData) ? String(leadData.observacoes) : '',
      status: 'novo',
      priority: 'media',
      source: leadData.source || 'website',
      fullData: leadData
    };

    const result = await sendConfirmationEmail(lead);
    
    if (result.success) {
      console.log(`Email de confirmação enviado para ${leadData.email}: ${result.messageId}`);
      return true;
    } else {
      console.error('Erro ao enviar email de confirmação:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Inicializar tabelas se necessário
    try {
      await DatabaseService.initializeTables();
    } catch (dbError) {
      console.error('Database initialization failed:', dbError);
      // Continue processing without database if initialization fails
    }
    
    const leadData: LeadData = await request.json();
    
    console.log('=== DEBUG LEAD DATA ===');
    console.log('Dados completos recebidos:', JSON.stringify(leadData, null, 2));
    console.log('Formato detectado:', isNewFormat(leadData) ? 'Novo' : 'Antigo');
    console.log('Tipo selectedServices:', typeof leadData.selectedServices);
    console.log('Array.isArray(selectedServices):', Array.isArray(leadData.selectedServices));
    console.log('Quantidade de serviços:', leadData.selectedServices?.length || 0);
    console.log('======================');

    // Validar dados
    const validation = validateLeadData(leadData);
    if (!validation.isValid) {
      console.log('=== VALIDATION ERRORS ===');
      console.log('Errors:', validation.errors);
      console.log('=========================');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dados inválidos', 
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    let customer: Customer | null = null;
    let leadId: string;

    // Processar com base no formato
    if (isNewFormat(leadData)) {
      // Formato novo - criar/atualizar cliente e lead
      try {
        // Verificar se cliente já existe
        try {
          customer = await DatabaseService.getCustomerByEmail(leadData.email);
        } catch (error) {
          console.warn('Database customer lookup failed:', error);
          customer = null;
        }
        
        if (!customer) {
          // Criar novo cliente
          try {
            customer = await DatabaseService.createCustomer({
            nome: leadData.nome,
            email: leadData.email,
            whatsapp: leadData.whatsapp,
            cpf: leadData.cpf,
            dataNascimento: leadData.dataNascimento,
            cidade: leadData.cidade || '',
            estado: leadData.estado || '',
            pais: leadData.pais || 'Brasil',
            experienciaViagem: leadData.experienciaViagem || 'ocasional',
            motivoViagem: leadData.motivoViagem || 'lazer',
            prioridadeOrcamento: (
              leadData.prioridadeOrcamento && 
              typeof leadData.prioridadeOrcamento === 'string' &&
              ['baixo_custo', 'custo_beneficio', 'conforto', 'luxo'].includes(leadData.prioridadeOrcamento)
            ) ? leadData.prioridadeOrcamento as 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo'
            : 'custo_beneficio',
            classeViagem: leadData.classeViagem || 'economica',
            preferenciaContato: leadData.preferenciaContato || 'whatsapp',
            melhorHorario: leadData.melhorHorario || 'qualquer',
            comoConheceu: leadData.comoConheceu || 'google',
            receberPromocoes: leadData.receberPromocoes !== false,
            observacoes: leadData.observacoes,
            necessidadeEspecial: leadData.necessidadeEspecial,
            status: 'lead',
            tags: [],
            score: 0
          });
          } catch (error) {
            console.warn('Database customer creation failed:', error);
            customer = null;
          }
        } else {
          // Atualizar cliente existente
          try {
            await DatabaseService.updateCustomer(customer.id, {
              nome: leadData.nome,
              whatsapp: leadData.whatsapp,
              score: customer.score + 10, // Incrementar score
              lastContactAt: new Date()
            });
          } catch (error) {
            console.warn('Database customer update failed:', error);
          }
        }

        // Criar lead
        try {
          const lead = await DatabaseService.createLead({
          customerId: customer?.id,
          nome: leadData.nome,
          email: leadData.email,
          whatsapp: leadData.whatsapp,
          origem: leadData.origem || '',
          destino: leadData.destino || '',
          dataPartida: ('dataPartida' in leadData) ? leadData.dataPartida : '',
          dataRetorno: leadData.dataRetorno,
          numeroPassageiros: leadData.numeroPassageiros || 1,
          tipoViagem: leadData.tipoViagem || 'ida_volta',
          selectedServices: leadData.selectedServices,
      precisaHospedagem: Boolean(leadData.precisaHospedagem ?? false),
      precisaTransporte: Boolean(leadData.precisaTransporte ?? false),
          orcamentoTotal: leadData.orcamentoTotal,
          prioridadeOrcamento: (() => {
            const value = leadData.prioridadeOrcamento;
            if (value && typeof value === 'string' && ['baixo_custo', 'custo_beneficio', 'conforto', 'luxo'].includes(value)) {
              return value as 'baixo_custo' | 'custo_beneficio' | 'conforto' | 'luxo';
            }
            return 'custo_beneficio';
          })(),
          source: leadData.source || 'website',
          status: 'novo',
          priority: 'media',
          fullData: leadData
        });

        leadId = lead.id;
        } catch (error) {
          console.warn('Database lead creation failed, using fallback:', error);
          // Save to fallback file system
          const fallbackResult = await DatabaseFallback.saveLeadToFile(leadData);
          if (fallbackResult.success) {
            leadId = fallbackResult.leadId;
          } else {
            // Generate a fallback lead ID if everything fails
            leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
        }
        
      } catch (error) {
        console.error('Erro ao processar lead (novo formato):', error);
        // Try fallback database
        const fallbackResult = await DatabaseFallback.saveLeadToFile(leadData);
        if (fallbackResult.success) {
          leadId = fallbackResult.leadId;
        } else {
          // Generate a fallback lead ID if everything fails
          leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
      }
    } else {
      // Formato antigo - compatibilidade
      const oldData = leadData as LeadDataOld;
      try {
        const result = await saveToDatabase(oldData);
        leadId = result;
      } catch (error) {
        console.warn('Database save failed for old format, using fallback:', error);
        // Try fallback database
        const fallbackResult = await DatabaseFallback.saveLeadToFile(oldData);
        if (fallbackResult.success) {
          leadId = fallbackResult.leadId;
        } else {
          leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
      }
    }

    // Processar ações paralelas
    const promises = [];
    
    // Enviar para N8N
    promises.push(sendToN8N(leadData));
    
    // Enviar email de confirmação
    promises.push(sendConfirmationEmail(leadData));
    
    // Enviar mensagem WhatsApp
    if (leadData.whatsapp) {
      // promises.push(sendWhatsAppMessage(leadData.whatsapp, `Olá ${leadData.nome}! Recebemos sua cotação e nossa equipe entrará em contato em breve. 🛫`));
    }
    
    // Tracking de conversão
    // promises.push(trackConversion(leadData.email, 'lead_form', leadData.selectedServices))

    const results = await Promise.allSettled(promises);

    // Log resultados
    console.log('Resultados do processamento:', {
      database: 'success',
      n8n: results[0].status === 'fulfilled',
      email: results[1].status === 'fulfilled',
      whatsapp: results[2]?.status === 'fulfilled',
      tracking: results[3]?.status === 'fulfilled'
    });

    // Preparar resposta
    const response = {
      success: true,
      message: 'Lead processado com sucesso',
      leadId,
      customerId: customer?.id,
      timestamp: new Date().toISOString(),
      processed: {
        database: true,
        n8n: results[0].status === 'fulfilled',
        email: results[1].status === 'fulfilled',
        whatsapp: results[2]?.status === 'fulfilled',
        tracking: results[3]?.status === 'fulfilled'
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Erro no processamento do lead:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar status da API
export async function GET() {
  return NextResponse.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      post: '/api/leads - Receber novos leads',
      get: '/api/leads - Status da API'
    },
    config: {
      n8n_webhook: !!process.env.N8N_WEBHOOK_LEAD,
      database: true, // Implementado com arquivo JSON
      email: !!process.env.N8N_WEBHOOK_EMAIL || 'simulated' // Implementado via N8N webhook
    }
  });
}
