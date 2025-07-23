import { Lead, ServiceData } from './database';
import { Resend } from 'resend';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private resend: Resend | null = null;

  constructor() {
    // Inicializar Resend se API key estiver disponível
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Prioridade 1: Gmail via API email-ses
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fly2any.com'}/api/email-ses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'send_test',
            email: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.messageId) {
            console.log('📧 Email sent via Gmail successfully');
            return { success: true, messageId: result.messageId };
          }
        }
      } catch (gmailError) {
        console.warn('Gmail sending failed:', gmailError);
      }

      // Prioridade 2: N8N webhook se configurado
      if (process.env.N8N_WEBHOOK_EMAIL) {
        try {
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
            console.log('📧 Email sent via N8N webhook successfully');
            return { success: true, messageId: `n8n_${Date.now()}` };
          }
        } catch (n8nError) {
          console.warn('N8N webhook failed:', n8nError);
        }
      }

      // Fallback: log para debug
      console.log('⚠️ Email não pôde ser enviado - verificar configurações Gmail/N8N:', {
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });
      
      return { 
        success: false, 
        error: 'Nenhum provedor de email disponível (Gmail SMTP ou N8N webhook)' 
      };
    } catch (error) {
      console.error('❌ Email sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Template para email de confirmação de lead
  generateConfirmationEmail(leadData: Lead): EmailData {
    const servicos = leadData.selectedServices?.map((serviceName: string) => {
      const serviceNames = {
        'voos': '✈️ Voos',
        'hoteis': '🏨 Hotéis', 
        'carros': '🚗 Carros',
        'passeios': '🎫 Passeios',
        'seguro': '🛡️ Seguro',
        'newsletter': '📧 Newsletter'
      };
      return serviceNames[serviceName as keyof typeof serviceNames] || serviceName;
    }).join(', ') || 'Newsletter';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%); 
              color: white; 
              padding: 30px; 
              border-radius: 12px 12px 0 0; 
              text-align: center;
            }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 18px; opacity: 0.9; }
            .content { 
              background: #f8fafc; 
              padding: 30px; 
              border-radius: 0 0 12px 12px; 
              border: 1px solid #e2e8f0;
            }
            .welcome { 
              background: white; 
              padding: 25px; 
              border-radius: 8px; 
              margin: 20px 0; 
              border-left: 4px solid #1e40af;
            }
            .offers { 
              background: #ecfdf5; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0;
              border: 2px solid #10b981;
            }
            .offer-item { 
              display: flex; 
              align-items: center; 
              margin: 12px 0; 
              font-size: 16px;
            }
            .check { color: #10b981; font-weight: bold; margin-right: 10px; font-size: 18px; }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #1e40af, #a21caf); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold; 
              text-align: center;
              margin: 15px 10px;
            }
            .whatsapp-btn {
              background: #25d366;
            }
            .urgency { 
              background: #fef3c7; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e2e8f0; 
              color: #666; 
              font-size: 14px; 
            }
            .contact-info {
              background: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              border: 1px solid #e2e8f0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">✈️ Fly2Any</div>
                <div class="subtitle">Conectando brasileiros ao mundo desde 2014</div>
            </div>
            
            <div class="content">
                <div class="welcome">
                    <h2 style="color: #1e40af; margin-top: 0;">Olá, ${leadData.nome}! 🌟</h2>
                    <p style="font-size: 18px; margin-bottom: 15px;">
                        <strong>Obrigado por escolher a Fly2Any!</strong>
                    </p>
                    <p>
                        Somos especialistas em viagens para brasileiros nos EUA e temos 
                        <strong>mais de 10 anos de experiência</strong> criando experiências 
                        inesquecíveis. Sua solicitação foi recebida e nossa equipe já está 
                        preparando as melhores ofertas para você!
                    </p>
                </div>

                <div class="urgency">
                    <h3 style="color: #d97706; margin-top: 0; text-align: center;">
                        🔥 OFERTA LIMITADA - APENAS HOJE!
                    </h3>
                    <p style="text-align: center; font-size: 18px; margin: 0;">
                        <strong>Economize até $2,500</strong> em passagens + hotel
                    </p>
                </div>

                <div class="offers">
                    <h3 style="color: #059669; margin-top: 0; text-align: center;">
                        🔥 Ofertas Especiais Brasil ↔ EUA:
                    </h3>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin: 15px 0; border: 2px solid #dc2626;">
                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: center; color: #dc2626;">
                            ✈️ Miami para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span><br>
                            ✈️ New York para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span><br>
                            ✈️ Newark para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span><br>
                            ✈️ Boston para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span><br>
                            ✈️ Orlando para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span>
                        </div>
                        
                        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 14px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-weight: bold; color: #059669;">
                                💰 <strong>Preço Normal:</strong> $ 990 • <strong style="color: #dc2626;">Economia: $ 300!</strong>
                            </p>
                            <p style="margin: 0 0 8px 0; color: #374151;">
                                🔄 <strong>Ida e Volta</strong> 1 stop<br>
                                🧳 <strong>Inclui:</strong> 1 mala despachada de 50lb + 1 de mão de 10 lbs<br>
                                ✅ <strong>Cancelamento grátis</strong> até 24 hrs após a compra
                            </p>
                        </div>
                    </div>
                    
                    <h3 style="color: #059669; margin-top: 20px; text-align: center;">
                        🎯 O que mais oferecemos:
                    </h3>
                    <div class="offer-item">
                        <span class="check">🏨</span>
                        <span><strong>Hotéis premium</strong> com tarifas especiais</span>
                    </div>
                    <div class="offer-item">
                        <span class="check">🚗</span>
                        <span><strong>Aluguel de carros</strong> sem taxas ocultas</span>
                    </div>
                    <div class="offer-item">
                        <span class="check">🎫</span>
                        <span><strong>Ingressos Disney/Universal</strong> com desconto</span>
                    </div>
                    <div class="offer-item">
                        <span class="check">🛡️</span>
                        <span><strong>Seguro viagem</strong> completo incluso</span>
                    </div>
                    <div class="offer-item">
                        <span class="check">📞</span>
                        <span><strong>Suporte 24/7</strong> em português nos EUA</span>
                    </div>
                </div>

                <div class="contact-info">
                    <h3 style="color: #1e40af; margin-top: 0;">
                        🚀 Nossa equipe entrará em contato em até 30 minutos!
                    </h3>
                    <p style="margin-bottom: 20px;">
                        Precisa falar conosco agora? Clique abaixo:
                    </p>
                    <a href="https://wa.me/+15513646029" class="cta-button whatsapp-btn">
                        📱 WhatsApp Direto EUA
                    </a>
                    <a href="tel:+15513646029" class="cta-button">
                        📞 Ligar Agora: +1 (551) 364-6029
                    </a>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://www.fly2any.com" class="cta-button">
                        🌎 Ver Mais Ofertas no Site
                    </a>
                </div>

                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; color: #1e40af;">
                        <strong>💡 Por que escolher a Fly2Any?</strong><br>
                        • Empresa brasileira estabelecida nos EUA<br>
                        • Mais de 50.000 clientes satisfeitos<br>
                        • Preços exclusivos não encontrados em outros lugares
                    </p>
                </div>
            </div>

            <div class="footer">
                <p><strong>Fly2Any Travel Inc.</strong></p>
                <p>📍 Miami, FL - Estados Unidos | 📧 contato@fly2any.com</p>
                <p style="font-size: 12px; color: #9ca3af;">
                    Você está recebendo este email porque solicitou informações em nosso site.<br>
                    © 2024 Fly2Any. Todos os direitos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>`;

    const text = `
✈️ BEM-VINDO À FLY2ANY, ${leadData.nome.toUpperCase()}!

Obrigado por escolher a Fly2Any! Somos especialistas em viagens para brasileiros nos EUA com mais de 10 anos de experiência.

🔥 OFERTA LIMITADA - APENAS HOJE!
Economize até $2,500 em passagens + hotel

🔥 Ofertas Especiais Brasil ↔ EUA:
✈️ Miami para Belo Horizonte $699
✈️ New York para Belo Horizonte $699
✈️ Newark para Belo Horizonte $699
✈️ Boston para Belo Horizonte $699
✈️ Orlando para Belo Horizonte $699

💰 Preço Normal: $ 990 • Economia: $ 300!
🔄 Ida e Volta 1 stop
🧳 Inclui: 1 mala despachada de 50lb + 1 de mão de 10 lbs
✅ Cancelamento grátis até 24 hrs após a compra

🎯 O que mais oferecemos:
🏨 Hotéis premium com tarifas especiais  
🚗 Aluguel de carros sem taxas ocultas
🎫 Ingressos Disney/Universal com desconto
🛡️ Seguro viagem completo incluso
📞 Suporte 24/7 em português nos EUA

🚀 Nossa equipe entrará em contato em até 30 minutos!

Precisa falar conosco agora?
📱 WhatsApp: https://wa.me/+15513646029
📞 Telefone: +1 (551) 364-6029

💡 Por que escolher a Fly2Any?
• Empresa brasileira estabelecida nos EUA
• Mais de 50.000 clientes satisfeitos  
• Preços exclusivos não encontrados em outros lugares

🌎 Ver mais ofertas: https://www.fly2any.com

Fly2Any Travel Inc.
📍 Miami, FL - Estados Unidos
📧 contato@fly2any.com
    `;

    return {
      to: leadData.email,
      subject: '✈️ Bem-vindo à Fly2Any! Suas ofertas de viagem chegaram',
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
