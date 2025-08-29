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
    
    // Simple HTML template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .info-block { background: #f8fafc; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
        .info-row { margin: 8px 0; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .cta { text-align: center; margin: 30px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🎯 Novo Lead Recebido!</h2>
            <p>Um cliente solicitou orçamento</p>
        </div>
        
        <div class="content">
            <div class="info-block">
                <h3>👤 Informações do Cliente</h3>
                <div class="info-row">
                    <span class="label">Nome:</span> <span class="value">${leadData.nome}</span>
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
            </div>
            
            <div class="info-block">
                <h3>✈️ Detalhes da Viagem</h3>
                <div class="info-row">
                    <span class="label">Origem:</span> <span class="value">${leadData.origem || 'A definir'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Destino:</span> <span class="value">${leadData.destino || 'A definir'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Data Ida:</span> <span class="value">${formatDate(leadData.dataPartida)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Data Volta:</span> <span class="value">${formatDate(leadData.dataRetorno)}</span>
                </div>
                <div class="info-row">
                    <span class="label">Serviços:</span> <span class="value">${leadData.selectedServices?.join(', ') || 'Voo'}</span>
                </div>
            </div>
            
            ${leadData.observacoes ? `
            <div class="info-block">
                <h3>📝 Observações</h3>
                <p>${leadData.observacoes}</p>
            </div>
            ` : ''}
            
            <div class="cta">
                <a href="https://fly2any.com/admin" class="button">Acessar Painel Admin</a>
            </div>
            
            <div class="info-block" style="background: #fff3cd; border-color: #ffc107;">
                <strong>⚡ Ação Necessária:</strong> Entre em contato com o cliente o mais rápido possível!
            </div>
        </div>
        
        <div class="footer">
            <p>Lead ID: ${leadData.id}</p>
            <p>Recebido em: ${new Date().toLocaleString('pt-BR')}</p>
            <p>© 2025 Fly2Any - Sistema de Leads</p>
        </div>
    </div>
</body>
</html>`;
    
    // Plain text fallback
    const textContent = `
NOVO LEAD RECEBIDO!

INFORMAÇÕES DO CLIENTE:
Nome: ${leadData.nome}
Email: ${leadData.email}
WhatsApp: ${leadData.whatsapp || 'Não informado'}
Telefone: ${leadData.telefone || 'Não informado'}

DETALHES DA VIAGEM:
Origem: ${leadData.origem || 'A definir'}
Destino: ${leadData.destino || 'A definir'}
Data Ida: ${formatDate(leadData.dataPartida)}
Data Volta: ${formatDate(leadData.dataRetorno)}
Serviços: ${leadData.selectedServices?.join(', ') || 'Voo'}

${leadData.observacoes ? `OBSERVAÇÕES:\n${leadData.observacoes}\n` : ''}

Lead ID: ${leadData.id}
Recebido em: ${new Date().toLocaleString('pt-BR')}

Acesse o painel admin: https://fly2any.com/admin
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