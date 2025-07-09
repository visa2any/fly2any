import { NextRequest, NextResponse } from 'next/server';

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

interface LeadData {
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
  flexibilidadeDatas?: boolean;
  observacoes?: string;
}

// Validação de dados
function validateLeadData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!data.nome || typeof data.nome !== 'string' || data.nome.trim().length < 2) {
    errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email é obrigatório');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email inválido');
    }
  }

  if (!data.whatsapp || typeof data.whatsapp !== 'string' || data.whatsapp.length < 10) {
    errors.push('WhatsApp é obrigatório e deve ter pelo menos 10 dígitos');
  }

  if (!data.selectedServices || !Array.isArray(data.selectedServices) || data.selectedServices.length === 0) {
    errors.push('Pelo menos um serviço deve ser selecionado');
  }

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
    const result = await saveLead(leadData);
    
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
    const result = await sendConfirmationEmail(leadData);
    
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
    const leadData: LeadData = await request.json();
    
    console.log('Recebido lead:', {
      nome: leadData.nome,
      email: leadData.email,
      whatsapp: leadData.whatsapp,
      servicos: leadData.selectedServices?.length || 0
    });

    // Validar dados
    const validation = validateLeadData(leadData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dados inválidos', 
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Processar lead em paralelo
    const promises = [
      saveToDatabase(leadData),
      sendToN8N(leadData),
      sendConfirmationEmail(leadData)
    ];

    const [dbResult, n8nResult, emailResult] = await Promise.allSettled(promises);

    // Log resultados
    console.log('Resultados do processamento:', {
      database: dbResult.status === 'fulfilled' ? 'success' : 'failed',
      n8n: n8nResult.status === 'fulfilled' ? 'success' : 'failed',
      email: emailResult.status === 'fulfilled' ? 'success' : 'failed'
    });

    // Preparar resposta
    const leadId = dbResult.status === 'fulfilled' ? dbResult.value : `lead_${Date.now()}`;
    const response = {
      success: true,
      message: 'Lead processado com sucesso',
      leadId,
      timestamp: new Date().toISOString(),
      processed: {
        database: dbResult.status === 'fulfilled',
        n8n: n8nResult.status === 'fulfilled',
        email: emailResult.status === 'fulfilled'
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Erro no processamento do lead:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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