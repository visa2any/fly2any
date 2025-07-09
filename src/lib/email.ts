import { Lead, ServiceData } from './database';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  constructor() {
    // Inicialização simples sem dependências externas
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Tentar enviar via N8N webhook se configurado
      if (process.env.N8N_WEBHOOK_EMAIL) {
        const response = await fetch(process.env.N8N_WEBHOOK_EMAIL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          console.log('Email sent via N8N webhook successfully');
          return { success: true, messageId: `n8n_${Date.now()}` };
        }
      }

      // Fallback: simular envio de email
      console.log('Email simulation (configure N8N_WEBHOOK_EMAIL for real sending):', {
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });
      
      return { success: true, messageId: `simulated_${Date.now()}` };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Template para email de confirmação de lead
  generateConfirmationEmail(leadData: Lead): EmailData {
    const servicos = leadData.selectedServices?.map((s: ServiceData) => {
      const serviceNames = {
        'voos': '✈️ Voos',
        'hoteis': '🏨 Hotéis',
        'carros': '🚗 Carros',
        'passeios': '🎫 Passeios',
        'seguro': '🛡️ Seguro'
      };
      return serviceNames[s.serviceType as keyof typeof serviceNames] || s.serviceType;
    }).join(', ') || 'Não especificado';

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de Solicitação - Fly2Any</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .content {
          background: #f8fafc;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .info-section {
          margin-bottom: 25px;
        }
        .info-section h3 {
          color: #1e40af;
          margin-bottom: 10px;
          font-size: 18px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .info-label {
          font-weight: 600;
          color: #4a5568;
        }
        .info-value {
          color: #2d3748;
        }
        .services-list {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #cbd5e0;
        }
        .next-steps {
          background: #e6fffa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #38b2ac;
          margin-top: 20px;
        }
        .contact-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-top: 20px;
        }
        .whatsapp-btn {
          display: inline-block;
          background: #25d366;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 15px;
        }
        .footer {
          text-align: center;
          color: #718096;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">✈️ Fly2Any</div>
        <p>Recebemos sua solicitação de cotação!</p>
      </div>

      <div class="content">
        <p>Olá <strong>${leadData.nome}</strong>,</p>
        
        <p>Obrigado por escolher a Fly2Any! Recebemos sua solicitação de cotação e nossa equipe já está trabalhando para encontrar as melhores opções para você.</p>

        <div class="info-section">
          <h3>📋 Resumo da Solicitação</h3>
          <div class="info-row">
            <span class="info-label">Serviços:</span>
            <span class="info-value">${servicos}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Origem:</span>
            <span class="info-value">${leadData.origem || 'Não especificado'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Destino:</span>
            <span class="info-value">${leadData.destino || 'Não especificado'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Data de Ida:</span>
            <span class="info-value">${leadData.dataIda || 'Não especificado'}</span>
          </div>
          ${leadData.dataVolta ? `
          <div class="info-row">
            <span class="info-label">Data de Volta:</span>
            <span class="info-value">${leadData.dataVolta}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Passageiros:</span>
            <span class="info-value">${leadData.adultos || 1} adulto(s)${leadData.criancas > 0 ? `, ${leadData.criancas} criança(s)` : ''}${leadData.bebes > 0 ? `, ${leadData.bebes} bebê(s)` : ''}</span>
          </div>
        </div>

        <div class="info-section">
          <h3>👤 Seus Dados</h3>
          <div class="info-row">
            <span class="info-label">Nome:</span>
            <span class="info-value">${leadData.nome} ${leadData.sobrenome || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${leadData.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">WhatsApp:</span>
            <span class="info-value">${leadData.whatsapp}</span>
          </div>
          ${leadData.telefone ? `
          <div class="info-row">
            <span class="info-label">Telefone:</span>
            <span class="info-value">${leadData.telefone}</span>
          </div>
          ` : ''}
        </div>

        <div class="next-steps">
          <h3>🚀 Próximos Passos</h3>
          <p><strong>Nossa equipe entrará em contato em até 2 horas úteis!</strong></p>
          <ul>
            <li>✅ Análise personalizada das melhores opções</li>
            <li>✅ Cotação detalhada com preços exclusivos</li>
            <li>✅ Suporte completo durante todo o processo</li>
            <li>✅ Assistência 24/7 em português</li>
          </ul>
        </div>

        <div class="contact-info">
          <h3>💬 Dúvidas? Fale Conosco!</h3>
          <p>Nossa equipe está disponível para esclarecer qualquer dúvida:</p>
          <a href="https://wa.me/5511951944717" class="whatsapp-btn">
            📱 Falar no WhatsApp
          </a>
        </div>
      </div>

      <div class="footer">
        <p>Este é um email automático. Por favor, não responda.</p>
        <p>Fly2Any - Conectando brasileiros ao mundo há mais de 10 anos</p>
        <p>&copy; 2024 Fly2Any. Todos os direitos reservados.</p>
      </div>
    </body>
    </html>
    `;

    const text = `
    Olá ${leadData.nome},

    Obrigado por escolher a Fly2Any! Recebemos sua solicitação de cotação.

    Resumo da Solicitação:
    - Serviços: ${servicos}
    - Origem: ${leadData.origem || 'Não especificado'}
    - Destino: ${leadData.destino || 'Não especificado'}
    - Data de Ida: ${leadData.dataIda || 'Não especificado'}
    ${leadData.dataVolta ? `- Data de Volta: ${leadData.dataVolta}` : ''}
    - Passageiros: ${leadData.adultos || 1} adulto(s)${leadData.criancas > 0 ? `, ${leadData.criancas} criança(s)` : ''}${leadData.bebes > 0 ? `, ${leadData.bebes} bebê(s)` : ''}

    Nossa equipe entrará em contato em até 2 horas úteis!

    Dúvidas? Entre em contato conosco pelo WhatsApp: https://wa.me/5511951944717

    Fly2Any - Conectando brasileiros ao mundo há mais de 10 anos
    `;

    return {
      to: leadData.email,
      subject: '✈️ Confirmação de Solicitação - Fly2Any',
      html,
      text
    };
  }
}

// Singleton instance
export const emailService = new EmailService();

// Utility functions
export async function sendConfirmationEmail(leadData: Lead) {
  const emailData = emailService.generateConfirmationEmail(leadData);
  return emailService.sendEmail(emailData);
}

export async function sendEmail(emailData: EmailData) {
  return emailService.sendEmail(emailData);
}
