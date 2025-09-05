/**
 * FIXED Lead Notification System
 * Robust email notifications with multiple fallbacks
 */

import { sendEmail } from './email';

export interface LeadNotificationData {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
  telefone?: string;
  origem?: string;
  destino?: string;
  selectedServices?: string[];
  source?: string;
  createdAt?: string;
  orcamentoTotal?: string;
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
  fullData?: any;
}

/**
 * Send lead notification with robust error handling
 */
export async function sendLeadNotification(leadData: LeadNotificationData) {
  console.log('[Notification] Preparing to send lead notification...');
  
  try {
    // Admin emails
    const adminEmails = [
      'fly2any.travel@gmail.com',
      'info@fly2any.com'
    ];
    
    // Format dates for better readability
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return 'Não informado';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
      } catch {
        return dateStr;
      }
    };
    
    const subject = `🚨 Novo Lead - ${leadData.nome} - ${leadData.origem || 'Origem'} → ${leadData.destino || 'Destino'}`;
    
    // Enhanced HTML template with complete lead information
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; text-align: center; }
        .priority-high { background: linear-gradient(135deg, #ff6b35, #f7931e); }
        .content { padding: 25px; }
        .info-block { background: #f8fafc; padding: 18px; margin: 18px 0; border-left: 4px solid #667eea; border-radius: 6px; }
        .info-block-travel { border-left-color: #10b981; }
        .info-block-passengers { border-left-color: #8b5cf6; }
        .info-block-budget { border-left-color: #f59e0b; }
        .info-block-preferences { border-left-color: #3b82f6; }
        .info-row { margin: 10px 0; display: flex; justify-content: space-between; align-items: center; }
        .label { font-weight: 600; color: #4b5563; min-width: 140px; }
        .value { color: #1f2937; font-weight: 500; flex: 1; text-align: right; }
        .value-highlight { background: #eff6ff; padding: 4px 8px; border-radius: 4px; color: #1d4ed8; }
        .service-tag { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 12px; margin: 2px; font-size: 12px; }
        .cta { text-align: center; margin: 30px 0; }
        .button { display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 13px; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .whatsapp-btn { background: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header ${
          (leadData.orcamentoTotal && parseFloat(leadData.orcamentoTotal.replace(/[^0-9.-]/g, '')) > 5000) || 
          leadData.numeroPassageiros && leadData.numeroPassageiros > 4 
            ? 'priority-high' : ''
        }">
            <h2>🎯 Novo Lead de Alta Prioridade!</h2>
            <p>Cliente ${leadData.nome} solicitou orçamento</p>
            <p><strong>🌍 ${leadData.origem || 'Origem'} → ${leadData.destino || 'Destino'}</strong></p>
        </div>
        
        <div class="content">
            <div class="info-block">
                <h3>👤 Informações do Cliente</h3>
                <div class="info-row">
                    <span class="label">Nome Completo:</span> <span class="value value-highlight">${leadData.nome}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span> <span class="value">${leadData.email}</span>
                </div>
                <div class="info-row">
                    <span class="label">WhatsApp:</span> <span class="value">${leadData.whatsapp || 'Não informado'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Telefone:</span> <span class="value">${leadData.telefone || 'Não informado'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Fonte:</span> <span class="value">${leadData.source || 'Website'}</span>
                </div>
            </div>
            
            <div class="info-block info-block-travel">
                <h3>✈️ Detalhes da Viagem</h3>
                <div class="info-row">
                    <span class="label">Origem:</span> <span class="value">${leadData.origem || 'A definir'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Destino:</span> <span class="value">${leadData.destino || 'A definir'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Tipo de Viagem:</span> <span class="value">${leadData.tipoViagem || 'Ida e volta'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Data Partida:</span> <span class="value">${formatDate(leadData.dataPartida)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Data Retorno:</span> <span class="value">${formatDate(leadData.dataRetorno)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Serviços:</span> 
                    <span class="value">
                        ${leadData.selectedServices?.map(service => `<span class="service-tag">${service}</span>`).join('') || '<span class="service-tag">voos</span>'}
                    </span>
                </div>
            </div>
            
            <div class="info-block info-block-passengers">
                <h3>👥 Informações dos Passageiros</h3>
                <div class="info-row">
                    <span class="label">Total Passageiros:</span> <span class="value value-highlight">${leadData.numeroPassageiros || 1}</span>
                </div>
                <div class="info-row">
                    <span class="label">Adultos:</span> <span class="value">${leadData.adultos || 1}</span>
                </div>
                <div class="info-row">
                    <span class="label">Crianças:</span> <span class="value">${leadData.criancas || 0}</span>
                </div>
                <div class="info-row">
                    <span class="label">Bebês:</span> <span class="value">${leadData.bebes || 0}</span>
                </div>
            </div>
            
            ${leadData.classeViagem || leadData.orcamentoTotal || leadData.prioridadeOrcamento ? `
            <div class="info-block info-block-preferences">
                <h3>🎯 Preferências e Orçamento</h3>
                ${leadData.classeViagem ? `
                <div class="info-row">
                    <span class="label">Classe de Voo:</span> <span class="value">${leadData.classeViagem}</span>
                </div>
                ` : ''}
                ${leadData.orcamentoTotal ? `
                <div class="info-row">
                    <span class="label">Orçamento:</span> <span class="value value-highlight">US$ ${leadData.orcamentoTotal}</span>
                </div>
                ` : ''}
                ${leadData.prioridadeOrcamento ? `
                <div class="info-row">
                    <span class="label">Prioridade:</span> <span class="value">${leadData.prioridadeOrcamento}</span>
                </div>
                ` : ''}
                ${leadData.precisaHospedagem ? `
                <div class="info-row">
                    <span class="label">Hospedagem:</span> <span class="value">✅ Precisa</span>
                </div>
                ` : ''}
                ${leadData.precisaTransporte ? `
                <div class="info-row">
                    <span class="label">Transporte:</span> <span class="value">✅ Precisa</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            ${leadData.observacoes ? `
            <div class="info-block">
                <h3>📝 Observações do Cliente</h3>
                <p style="background: white; padding: 12px; border-radius: 4px; font-style: italic;">${leadData.observacoes}</p>
            </div>
            ` : ''}
            
            <div class="alert">
                <strong>⚡ AÇÃO URGENTE:</strong> Cliente esperando resposta! Entre em contato nas próximas 2 horas para maximizar conversão.
            </div>
            
            <div class="cta">
                ${leadData.whatsapp ? `
                <a href="https://wa.me/${leadData.whatsapp.replace(/[^0-9]/g, '')}?text=Olá ${leadData.nome}! Recebemos seu pedido de orçamento para ${leadData.origem} → ${leadData.destino}. Vamos preparar a melhor proposta para você!" class="whatsapp-btn">📱 WhatsApp</a>
                ` : ''}
                <a href="https://fly2any.com/admin/leads/modern" class="button">📊 Painel Admin</a>
                <a href="mailto:${leadData.email}?subject=Re: Orçamento ${leadData.origem} → ${leadData.destino}&body=Olá ${leadData.nome}!%0A%0ARecebemos seu pedido de orçamento e nossa equipe está preparando a melhor proposta para sua viagem." class="button" style="background: #059669;">✉️ Responder Email</a>
            </div>
            
            <div class="info-block" style="background: #dcfce7; border-left-color: #16a34a;">
                <h3>📈 Análise Rápida do Lead</h3>
                <div class="info-row">
                    <span class="label">Score de Conversão:</span> 
                    <span class="value">${
                      (() => {
                        let score = 50; // base score
                        if (leadData.whatsapp) score += 20; // has whatsapp
                        if (leadData.orcamentoTotal) score += 15; // has budget
                        if (leadData.dataPartida) score += 10; // has specific dates
                        if (leadData.numeroPassageiros && leadData.numeroPassageiros > 2) score += 10; // group travel
                        const finalScore = Math.min(score, 95); // cap at 95%
                        const statusLabel = finalScore >= 80 ? '🟢 ALTO' : finalScore >= 60 ? '🟡 MÉDIO' : '🔴 BAIXO';
                        return `${finalScore}% ${statusLabel}`;
                      })()
                    }</span>
                </div>
                <div class="info-row">
                    <span class="label">Valor Estimado:</span> 
                    <span class="value">${
                      leadData.orcamentoTotal 
                        ? `US$ ${leadData.orcamentoTotal}` 
                        : `US$ ${(leadData.numeroPassageiros || 1) * 800}-${(leadData.numeroPassageiros || 1) * 2500} (estimativa)`
                    }</span>
                </div>
                <div class="info-row">
                    <span class="label">Urgência:</span> 
                    <span class="value">${
                      leadData.dataPartida 
                        ? (() => {
                            const days = Math.ceil((new Date(leadData.dataPartida).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return days < 30 ? '🔥 ALTA (menos de 30 dias)' : days < 90 ? '⚡ MÉDIA (30-90 dias)' : '📅 BAIXA (mais de 90 dias)';
                          })()
                        : '❓ A definir'
                    }</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Lead ID:</strong> ${leadData.id}</p>
            <p><strong>Recebido em:</strong> ${new Date().toLocaleString('pt-BR', { 
              timeZone: 'America/Sao_Paulo',
              year: 'numeric',
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>© 2025 Fly2Any - Sistema Inteligente de Leads</p>
            <p style="font-size: 11px; color: #9ca3af;">Este é um email automático. Para suporte técnico, entre em contato conosco.</p>
        </div>
    </div>
</body>
</html>`;
    
    // Enhanced plain text fallback with complete information
    const textContent = `
🎯 NOVO LEAD DE ALTA PRIORIDADE!
${'='.repeat(50)}

👤 INFORMAÇÕES DO CLIENTE:
Nome: ${leadData.nome}
Email: ${leadData.email}
WhatsApp: ${leadData.whatsapp || 'Não informado'}
Telefone: ${leadData.telefone || 'Não informado'}
Fonte: ${leadData.source || 'Website'}

✈️ DETALHES DA VIAGEM:
Origem: ${leadData.origem || 'A definir'}
Destino: ${leadData.destino || 'A definir'}
Tipo: ${leadData.tipoViagem || 'Ida e volta'}
Data Partida: ${formatDate(leadData.dataPartida)}
Data Retorno: ${formatDate(leadData.dataRetorno)}
Serviços: ${leadData.selectedServices?.join(', ') || 'voos'}

👥 PASSAGEIROS:
Total: ${leadData.numeroPassageiros || 1}
Adultos: ${leadData.adultos || 1}
Crianças: ${leadData.criancas || 0}
Bebês: ${leadData.bebes || 0}

🎯 PREFERÊNCIAS:
${leadData.classeViagem ? `Classe: ${leadData.classeViagem}\n` : ''}${leadData.orcamentoTotal ? `Orçamento: US$ ${leadData.orcamentoTotal}\n` : ''}${leadData.prioridadeOrcamento ? `Prioridade: ${leadData.prioridadeOrcamento}\n` : ''}${leadData.precisaHospedagem ? 'Hospedagem: ✅ Precisa\n' : ''}${leadData.precisaTransporte ? 'Transporte: ✅ Precisa\n' : ''}

${leadData.observacoes ? `📝 OBSERVAÇÕES:\n${leadData.observacoes}\n\n` : ''}
⚡ AÇÃO URGENTE: Entre em contato nas próximas 2 horas!

${leadData.whatsapp ? `WhatsApp: https://wa.me/${leadData.whatsapp.replace(/[^0-9]/g, '')}\n` : ''}Painel Admin: https://fly2any.com/admin/leads/modern
Email Cliente: mailto:${leadData.email}

Lead ID: ${leadData.id}
Recebido: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}

© 2025 Fly2Any - Sistema Inteligente de Leads
`;
    
    // Try to send email to each admin
    const results = [];
    
    for (const adminEmail of adminEmails) {
      try {
        console.log(`[Notification] Sending to ${adminEmail}...`);
        
        const result = await sendEmail({
          to: adminEmail,
          subject,
          html: htmlContent,
          text: textContent
        });
        
        if (result.success) {
          console.log(`[Notification] ✅ Sent to ${adminEmail}`);
          results.push({ email: adminEmail, success: true });
        } else {
          console.warn(`[Notification] ⚠️ Failed to send to ${adminEmail}:`, result.error);
          results.push({ email: adminEmail, success: false, error: result.error });
        }
      } catch (error) {
        console.error(`[Notification] ❌ Error sending to ${adminEmail}:`, error);
        results.push({ email: adminEmail, success: false, error: error });
      }
    }
    
    // Also send confirmation to customer
    try {
      console.log(`[Notification] Sending confirmation to customer: ${leadData.email}`);
      
      const customerSubject = '✅ Recebemos seu pedido de orçamento - Fly2Any';
      const customerHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Obrigado pelo seu contato!</h1>
        </div>
        <div class="content">
            <p>Olá ${leadData.nome},</p>
            <p>Recebemos sua solicitação de orçamento e em breve um de nossos consultores entrará em contato.</p>
            
            <h3>Resumo da sua solicitação:</h3>
            <ul>
                <li>Origem: ${leadData.origem || 'A definir'}</li>
                <li>Destino: ${leadData.destino || 'A definir'}</li>
                <li>Data de ida: ${formatDate(leadData.dataPartida)}</li>
                <li>Data de volta: ${formatDate(leadData.dataRetorno)}</li>
            </ul>
            
            <p><strong>Próximos passos:</strong></p>
            <ol>
                <li>Nossa equipe analisará sua solicitação</li>
                <li>Prepararemos as melhores opções para sua viagem</li>
                <li>Entraremos em contato em até 24 horas úteis</li>
            </ol>
            
            <p>Se tiver alguma dúvida urgente, entre em contato:</p>
            <p>📧 Email: info@fly2any.com<br>
            📱 WhatsApp: (11) 99999-9999</p>
        </div>
        <div class="footer">
            <p>© 2025 Fly2Any - Sua viagem dos sonhos começa aqui</p>
        </div>
    </div>
</body>
</html>`;
      
      await sendEmail({
        to: leadData.email,
        subject: customerSubject,
        html: customerHtml
      });
      
      console.log('[Notification] ✅ Customer confirmation sent');
    } catch (customerError) {
      console.warn('[Notification] ⚠️ Failed to send customer confirmation:', customerError);
    }
    
    // Check if at least one admin notification was sent
    const successCount = results.filter(r => r.success).length;
    
    if (successCount > 0) {
      console.log(`[Notification] ✅ Successfully sent to ${successCount} admin(s)`);
      return { success: true, results };
    } else {
      console.error('[Notification] ❌ Failed to send to any admin');
      
      // Try webhook fallback
      if (process.env.N8N_WEBHOOK_LEAD) {
        try {
          console.log('[Notification] Trying N8N webhook fallback...');
          const webhookResponse = await fetch(process.env.N8N_WEBHOOK_LEAD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'lead_notification_fallback',
              leadData,
              timestamp: new Date().toISOString()
            })
          });
          
          if (webhookResponse.ok) {
            console.log('[Notification] ✅ Webhook fallback successful');
          }
        } catch (webhookError) {
          console.error('[Notification] ❌ Webhook fallback failed:', webhookError);
        }
      }
      
      return { success: false, error: 'Failed to send notifications', results };
    }
    
  } catch (error) {
    console.error('[Notification] ❌ Critical error in notification system:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for backward compatibility
export { sendLeadNotification as sendLeadNotificationToAdmin };