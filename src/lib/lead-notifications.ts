import { sendEmail } from './email';

export interface LeadNotificationData {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  telefone?: string;
  origem: string;
  destino: string;
  selectedServices: string[];
  source: string;
  createdAt: string;
  orcamentoTotal?: string;
  // Campos adicionais de viagem
  dataPartida?: string;
  dataRetorno?: string;
  tipoViagem?: string;
  numeroPassageiros?: number;
  adultos?: number;
  criancas?: number;
  bebes?: number;
  classeViagem?: string;
  prioridadeOrcamento?: string;
  precisaHospedagem?: boolean;
  precisaTransporte?: boolean;
  observacoes?: string;
  // Dados completos para fallback
  fullData?: any;
}

/**
 * Envia notificação por email quando um novo lead é criado
 */
export async function sendLeadNotificationToAdmin(leadData: LeadNotificationData) {
  try {
    const adminEmails = [
      'contato@fly2any.com',
      'fly2any.travel@gmail.com'
    ];

    const subject = `🚨 Novo Lead Recebido - ${leadData.nome}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .lead-info { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #667eea; }
        .field { margin: 8px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .services { background: #e3f2fd; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .urgent { background: #fff3cd; border-left-color: #ffc107; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .btn { 
            display: inline-block; 
            background: #667eea; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🛫 Fly2Any - Novo Lead Recebido</h2>
            <p>Um novo cliente potencial se interessou pelos nossos serviços!</p>
        </div>
        
        <div class="content">
            <div class="lead-info ${leadData.orcamentoTotal ? 'urgent' : ''}">
                <h3>👤 Informações do Cliente</h3>
                <div class="field">
                    <span class="label">Nome:</span> 
                    <span class="value">${leadData.nome}</span>
                </div>
                <div class="field">
                    <span class="label">Email:</span> 
                    <span class="value">${leadData.email}</span>
                </div>
                <div class="field">
                    <span class="label">WhatsApp:</span> 
                    <span class="value">${leadData.whatsapp}</span>
                </div>
            </div>

            <div class="lead-info">
                <h3>✈️ Detalhes da Viagem</h3>
                <div class="field">
                    <span class="label">Origem:</span> 
                    <span class="value">${leadData.origem || 'Não informado'}</span>
                </div>
                <div class="field">
                    <span class="label">Destino:</span> 
                    <span class="value">${leadData.destino || 'Não informado'}</span>
                </div>
                ${leadData.dataPartida ? `
                <div class="field">
                    <span class="label">Data de Partida:</span> 
                    <span class="value">${new Date(leadData.dataPartida).toLocaleDateString('pt-BR')}</span>
                </div>
                ` : ''}
                ${leadData.dataRetorno ? `
                <div class="field">
                    <span class="label">Data de Retorno:</span> 
                    <span class="value">${new Date(leadData.dataRetorno).toLocaleDateString('pt-BR')}</span>
                </div>
                ` : ''}
                ${leadData.tipoViagem ? `
                <div class="field">
                    <span class="label">Tipo de Viagem:</span> 
                    <span class="value">${leadData.tipoViagem === 'ida_volta' ? 'Ida e Volta' : 
                                      leadData.tipoViagem === 'ida-volta' ? 'Ida e Volta' :
                                      leadData.tipoViagem === 'somente-ida' ? 'Somente Ida' :
                                      leadData.tipoViagem === 'ida' ? 'Somente Ida' :
                                      leadData.tipoViagem === 'multiplas-cidades' ? 'Múltiplas Cidades' :
                                      leadData.tipoViagem === 'multiplas_cidades' ? 'Múltiplas Cidades' :
                                      leadData.tipoViagem}</span>
                </div>
                ` : ''}
                <div class="field">
                    <span class="label">Passageiros:</span> 
                    <span class="value">
                        ${leadData.numeroPassageiros ? `${leadData.numeroPassageiros} passageiros` :
                          (leadData.adultos || leadData.criancas || leadData.bebes) ? 
                          `${leadData.adultos || 0} adultos${leadData.criancas ? `, ${leadData.criancas} crianças` : ''}${leadData.bebes ? `, ${leadData.bebes} bebês` : ''}` :
                          'Não informado'}
                    </span>
                </div>
                ${leadData.classeViagem ? `
                <div class="field">
                    <span class="label">Classe:</span> 
                    <span class="value">${leadData.classeViagem === 'economica' ? 'Econômica' :
                                      leadData.classeViagem === 'premium' ? 'Premium' :
                                      leadData.classeViagem === 'executiva' ? 'Executiva' :
                                      leadData.classeViagem === 'primeira' ? 'Primeira Classe' :
                                      leadData.classeViagem}</span>
                </div>
                ` : ''}
                ${leadData.prioridadeOrcamento ? `
                <div class="field">
                    <span class="label">Prioridade Orçamento:</span> 
                    <span class="value">${leadData.prioridadeOrcamento === 'baixo_custo' ? 'Baixo Custo' :
                                      leadData.prioridadeOrcamento === 'custo_beneficio' ? 'Custo-Benefício' :
                                      leadData.prioridadeOrcamento === 'conforto' ? 'Conforto' :
                                      leadData.prioridadeOrcamento === 'luxo' ? 'Luxo' :
                                      leadData.prioridadeOrcamento}</span>
                </div>
                ` : ''}
                ${leadData.orcamentoTotal ? `
                <div class="field">
                    <span class="label">Orçamento:</span> 
                    <span class="value">${leadData.orcamentoTotal}</span>
                </div>
                ` : ''}
            </div>

            ${(leadData.precisaHospedagem || leadData.precisaTransporte) ? `
            <div class="lead-info">
                <h3>🏨 Serviços Adicionais</h3>
                ${leadData.precisaHospedagem ? `
                <div class="field">
                    <span class="label">Hospedagem:</span> 
                    <span class="value">✅ Necessária</span>
                </div>
                ` : ''}
                ${leadData.precisaTransporte ? `
                <div class="field">
                    <span class="label">Transporte:</span> 
                    <span class="value">✅ Necessário</span>
                </div>
                ` : ''}
            </div>
            ` : ''}

            ${leadData.observacoes ? `
            <div class="lead-info">
                <h3>📝 Observações</h3>
                <div class="field">
                    <span class="value">${leadData.observacoes}</span>
                </div>
            </div>
            ` : ''}

            <div class="services">
                <h3>🎯 Serviços Solicitados</h3>
                <ul>
                    ${leadData.selectedServices.map(service => `<li>${service}</li>`).join('')}
                </ul>
            </div>

            <div class="lead-info">
                <h3>📊 Informações Técnicas</h3>
                <div class="field">
                    <span class="label">ID do Lead:</span> 
                    <span class="value">${leadData.id}</span>
                </div>
                <div class="field">
                    <span class="label">Origem:</span> 
                    <span class="value">${leadData.source}</span>
                </div>
                <div class="field">
                    <span class="label">Data/Hora:</span> 
                    <span class="value">${new Date(leadData.createdAt).toLocaleString('pt-BR')}</span>
                </div>
            </div>

            <div style="text-align: center; margin: 20px 0;">
                <a href="https://fly2any.com/admin/leads" class="btn">
                    🔗 Ver no Painel Admin
                </a>
                <br>
                <a href="https://wa.me/${leadData.whatsapp.replace(/\D/g, '')}" class="btn" style="background: #25d366;">
                    💬 Contatar via WhatsApp
                </a>
            </div>

            <div class="footer">
                <p>📧 Esta é uma notificação automática do sistema Fly2Any</p>
                <p>Para mais informações, acesse o painel administrativo</p>
            </div>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
🛫 NOVO LEAD RECEBIDO - FLY2ANY

👤 Cliente: ${leadData.nome}
📧 Email: ${leadData.email}
📱 WhatsApp: ${leadData.whatsapp}${leadData.telefone ? `\n☎️ Telefone: ${leadData.telefone}` : ''}

✈️ Viagem:
- Origem: ${leadData.origem || 'Não informado'}
- Destino: ${leadData.destino || 'Não informado'}${leadData.dataPartida ? `\n- Data Partida: ${new Date(leadData.dataPartida).toLocaleDateString('pt-BR')}` : ''}${leadData.dataRetorno ? `\n- Data Retorno: ${new Date(leadData.dataRetorno).toLocaleDateString('pt-BR')}` : ''}${leadData.tipoViagem ? `\n- Tipo: ${leadData.tipoViagem === 'ida_volta' ? 'Ida e Volta' : 
      leadData.tipoViagem === 'ida-volta' ? 'Ida e Volta' :
      leadData.tipoViagem === 'somente-ida' ? 'Somente Ida' :
      leadData.tipoViagem === 'ida' ? 'Somente Ida' :
      leadData.tipoViagem === 'multiplas-cidades' ? 'Múltiplas Cidades' :
      leadData.tipoViagem === 'multiplas_cidades' ? 'Múltiplas Cidades' :
      leadData.tipoViagem}` : ''}
- Passageiros: ${leadData.numeroPassageiros ? `${leadData.numeroPassageiros} passageiros` :
    (leadData.adultos || leadData.criancas || leadData.bebes) ? 
    `${leadData.adultos || 0} adultos${leadData.criancas ? `, ${leadData.criancas} crianças` : ''}${leadData.bebes ? `, ${leadData.bebes} bebês` : ''}` :
    'Não informado'}${leadData.classeViagem ? `\n- Classe: ${leadData.classeViagem === 'economica' ? 'Econômica' :
      leadData.classeViagem === 'premium' ? 'Premium' :
      leadData.classeViagem === 'executiva' ? 'Executiva' :
      leadData.classeViagem === 'primeira' ? 'Primeira Classe' :
      leadData.classeViagem}` : ''}${leadData.prioridadeOrcamento ? `\n- Prioridade: ${leadData.prioridadeOrcamento === 'baixo_custo' ? 'Baixo Custo' :
      leadData.prioridadeOrcamento === 'custo_beneficio' ? 'Custo-Benefício' :
      leadData.prioridadeOrcamento === 'conforto' ? 'Conforto' :
      leadData.prioridadeOrcamento === 'luxo' ? 'Luxo' :
      leadData.prioridadeOrcamento}` : ''}
${leadData.orcamentoTotal ? `- Orçamento: ${leadData.orcamentoTotal}` : ''}

🎯 Serviços: ${leadData.selectedServices.join(', ')}

${(leadData.precisaHospedagem || leadData.precisaTransporte) ? `🏨 Serviços Adicionais:${leadData.precisaHospedagem ? '\n- Hospedagem: Necessária' : ''}${leadData.precisaTransporte ? '\n- Transporte: Necessário' : ''}\n\n` : ''}${leadData.observacoes ? `📝 Observações: ${leadData.observacoes}\n\n` : ''}📊 Detalhes:
- ID: ${leadData.id}
- Fonte: ${leadData.source}
- Data: ${new Date(leadData.createdAt).toLocaleString('pt-BR')}

🔗 Painel Admin: https://fly2any.com/admin/leads
💬 WhatsApp: https://wa.me/${leadData.whatsapp.replace(/\D/g, '')}
`;

    // Enviar para todos os emails administrativos
    const results = await Promise.allSettled(
      adminEmails.map(adminEmail =>
        sendEmail({
          to: adminEmail,
          subject,
          html: htmlContent,
          text: textContent
        })
      )
    );

    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;

    console.log(`📧 Notificações enviadas: ${successes} sucessos, ${failures} falhas`);

    return {
      success: successes > 0,
      sent: successes,
      failed: failures,
      details: results
    };

  } catch (error) {
    console.error('Erro ao enviar notificação de lead:', error);
    return {
      success: false,
      sent: 0,
      failed: 1,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Envia notificação via webhook N8N (alternativa ou complementar ao email)
 */
export async function sendLeadNotificationToN8N(leadData: LeadNotificationData) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_EMAIL;
    
    if (!webhookUrl) {
      console.warn('N8N_WEBHOOK_EMAIL não configurado');
      return { success: false, error: 'Webhook não configurado' };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'new_lead_notification',
        timestamp: new Date().toISOString(),
        leadData,
        adminEmails: ['contato@fly2any.com', 'fly2any.travel@gmail.com']
      })
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    console.log('📨 Notificação enviada via N8N webhook');
    return { success: true };

  } catch (error) {
    console.error('Erro ao enviar notificação via N8N:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Função principal que tenta enviar por múltiplos canais
 */
export async function sendLeadNotification(leadData: LeadNotificationData) {
  try {
    // Tentar enviar via email direto
    const emailResult = await sendLeadNotificationToAdmin(leadData);
    
    // Tentar enviar via N8N webhook como backup
    const webhookResult = await sendLeadNotificationToN8N(leadData);

    return {
      success: emailResult.success || webhookResult.success,
      email: emailResult,
      webhook: webhookResult
    };

  } catch (error) {
    console.error('Erro geral no sistema de notificações:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}