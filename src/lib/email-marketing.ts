import { emailService } from './email';

interface EmailContact {
  email: string;
  nome: string;
  sobrenome?: string;
  telefone?: string;
  segmento?: 'brasileiros-eua' | 'familias' | 'casais' | 'aventureiros' | 'executivos';
  tags?: string[];
  lastEmailSent?: Date;
  unsubscribed?: boolean;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  segmentFilter?: string;
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  stats?: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

class EmailMarketingService {
  private contacts: EmailContact[] = [];
  private campaigns: EmailCampaign[] = [];

  // Carregar contatos da base de dados
  async loadContacts(): Promise<void> {
    try {
      // Aqui você carregaria seus 5k emails do banco ou CSV
      // Por enquanto, exemplo de estrutura
      console.log('Loading contacts from database...');
      
      // Exemplo de como estruturar seus dados
      this.contacts = [
        {
          email: "exemplo@email.com",
          nome: "João",
          sobrenome: "Silva", 
          segmento: "brasileiros-eua",
          tags: ["miami", "interessado-voos"]
        }
        // ... seus 5k contatos aqui
      ];
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }

  // Segmentar contatos
  segmentContacts(segment: string): EmailContact[] {
    return this.contacts.filter(contact => {
      if (!contact.unsubscribed) {
        switch (segment) {
          case 'brasileiros-eua':
            return contact.segmento === 'brasileiros-eua' || 
                   contact.tags?.includes('miami') || 
                   contact.tags?.includes('eua');
          case 'familias':
            return contact.segmento === 'familias' || 
                   contact.tags?.includes('familia') ||
                   contact.tags?.includes('criancas');
          case 'casais':
            return contact.segmento === 'casais' || 
                   contact.tags?.includes('lua-de-mel') ||
                   contact.tags?.includes('romantico');
          default:
            return true;
        }
      }
      return false;
    });
  }

  // Criar campanha de email marketing
  createCampaign(campaign: Omit<EmailCampaign, 'id' | 'status' | 'stats'>): EmailCampaign {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: `camp_${Date.now()}`,
      status: 'draft',
      stats: { sent: 0, opened: 0, clicked: 0, bounced: 0 }
    };
    
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  // Enviar campanha via N8N webhook (gratuito)
  async sendCampaignViaWebhook(campaignId: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campanha não encontrada');

    const targetContacts = campaign.segmentFilter 
      ? this.segmentContacts(campaign.segmentFilter)
      : this.contacts.filter(c => !c.unsubscribed);

    console.log(`Enviando campanha "${campaign.name}" para ${targetContacts.length} contatos`);

    // Dividir em lotes de 50 emails (otimizado para Gmail SMTP)
    const batchSize = 50;
    for (let i = 0; i < targetContacts.length; i += batchSize) {
      const batch = targetContacts.slice(i, i + batchSize);
      
      await this.sendBatchViaWebhook(campaign, batch);
      
      // Aguardar 1 segundo entre lotes para otimizar velocidade (Gmail permite até 500/dia)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    campaign.status = 'sent';
    campaign.stats!.sent = targetContacts.length;
  }

  // Enviar email de teste para um email específico
  async sendTestEmail(campaignId: string, testEmail: string): Promise<void> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campanha não encontrada');

    // Criar contato de teste
    const testContact: EmailContact = {
      email: testEmail,
      nome: 'Teste',
      sobrenome: 'Usuario',
      segmento: 'brasileiros-eua'
    };

    console.log(`Enviando email teste "${campaign.name}" para ${testEmail}`);

    try {
      if (process.env.N8N_WEBHOOK_EMAIL_MARKETING) {
        const response = await fetch(process.env.N8N_WEBHOOK_EMAIL_MARKETING, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            campaignName: campaign.name,
            subject: campaign.subject,
            htmlContent: campaign.htmlContent,
            textContent: campaign.textContent,
            contacts: [testContact],
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`);
        }

        console.log(`Email teste enviado via N8N para ${testEmail}`);
      } else {
        // Fallback: usar serviço de email interno
        await emailService.sendEmail({
          to: testEmail,
          subject: campaign.subject,
          html: this.personalizeContent(campaign.htmlContent, testContact),
          text: this.personalizeContent(campaign.textContent, testContact)
        });
      }
    } catch (error) {
      console.error('Erro ao enviar email teste:', error);
      throw error;
    }
  }

  // Enviar lote via N8N webhook
  private async sendBatchViaWebhook(campaign: EmailCampaign, contacts: EmailContact[]): Promise<void> {
    try {
      if (process.env.N8N_WEBHOOK_EMAIL_MARKETING) {
        const response = await fetch(process.env.N8N_WEBHOOK_EMAIL_MARKETING, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            campaignName: campaign.name,
            subject: campaign.subject,
            htmlContent: campaign.htmlContent,
            textContent: campaign.textContent,
            contacts: contacts,
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`);
        }

        console.log(`Lote de ${contacts.length} emails enviado via N8N`);
      } else {
        // Fallback: usar serviço de email interno
        for (const contact of contacts) {
          await emailService.sendEmail({
            to: contact.email,
            subject: campaign.subject,
            html: this.personalizeContent(campaign.htmlContent, contact),
            text: this.personalizeContent(campaign.textContent, contact)
          });
        }
      }
    } catch (error) {
      console.error('Erro ao enviar lote:', error);
    }
  }

  // Personalizar conteúdo do email
  private personalizeContent(content: string, contact: EmailContact): string {
    return content
      .replace('{{nome}}', contact.nome)
      .replace('{{email}}', contact.email)
      .replace('{{segmento}}', contact.segmento || 'cliente');
  }

  // Templates prontos para email marketing
  // Gerar footer com link de unsubscribe
  private getUnsubscribeFooter(email: string): string {
    const unsubscribeUrl = `https://fly2any.com/unsubscribe?email=${encodeURIComponent(email)}`;
    return `
          <div style="background: #f1f5f9; padding: 20px; margin-top: 30px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">
              © 2024 Fly2Any - Turismo Internacional<br>
              Você está recebendo este email porque se cadastrou em nossa lista.
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">
                Cancelar inscrição
              </a> | 
              <a href="https://fly2any.com" style="color: #64748b; text-decoration: underline;">
                Visitar nosso site
              </a>
            </p>
          </div>`;
  }

  getTemplate(type: 'promocional' | 'newsletter' | 'reativacao', email: string = '{{email}}'): { subject: string; html: string; text: string } {
    const templates = {
      promocional: {
        subject: '✈️ Exclusive Offer: Miami from $1,299!',
        html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af, #a21caf); color: white; padding: 30px; text-align: center;">
            <h1>✈️ Fly2Any</h1>
            <h2>Oferta Especial para {{nome}}!</h2>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e40af;">🎯 Miami for only $1,299</h2>
            <p>Olá {{nome}},</p>
            <p>Temos uma oferta EXCLUSIVA para brasileiros nos EUA!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🔥 Ofertas Especiais Brasil ↔ EUA:</h3>
              <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981;">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                  ✈️ Miami para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span><br>
                  ✈️ New York para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span><br>
                  ✈️ Newark para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span><br>
                  ✈️ Boston para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span><br>
                  ✈️ Orlando para Belo Horizonte <span style="color: #dc2626; font-size: 24px;">$699</span>
                </div>
                
                <div style="background: #fef2f2; padding: 12px; border-radius: 6px; margin-top: 15px; font-size: 14px;">
                  💰 <strong>Preço Normal:</strong> $990 • <strong style="color: #059669;">Economia: $300!</strong><br>
                  🔄 <strong>Ida e Volta</strong> 1 stop<br>
                  🧳 <strong>Inclui:</strong> 1 mala despachada de 50lb + 1 de mão de 10 lbs<br>
                  ✅ <strong>Cancelamento grátis</strong> até 24 hrs após a compra
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://fly2any.com/cotacao/voos?utm_source=email&utm_campaign=promo-miami" 
                 style="background: #25d366; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;">
                🚀 QUERO ESSA OFERTA!
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px;">
              Oferta válida até 31/12/2024. Sujeito à disponibilidade.
            </p>
          </div>
          ${this.getUnsubscribeFooter(email)}
        </body>
        </html>`,
        text: `Hello {{nome}}! Miami for only $1,299 - Exclusive Fly2Any offer. Visit: https://fly2any.com/cotacao/voos`
      },
      
      newsletter: {
        subject: '📰 Dicas de Viagem + Ofertas da Semana',
        html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
            <h1>✈️ Newsletter Fly2Any</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Olá {{nome}}! 👋</h2>
            
            <h3>🎯 Dica da Semana</h3>
            <p>Como economizar até 40% em passagens:</p>
            <ul>
              <li>✅ Reserve com 3 meses de antecedência</li>
              <li>✅ Viaje em dias de semana</li>
              <li>✅ Use nosso sistema de alertas de preço</li>
            </ul>
            
            <h3>🔥 Ofertas da Semana</h3>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px;">
              <p><strong>Miami:</strong> $1,299 ✈️</p>
              <p><strong>Orlando:</strong> $1,399 🎢</p>
              <p><strong>New York:</strong> $1,599 🗽</p>
            </div>
            
            <p style="margin-top: 20px;">
              <a href="https://fly2any.com" style="color: #1e40af;">Ver todas as ofertas →</a>
            </p>
          </div>
          ${this.getUnsubscribeFooter(email)}
        </body>
        </html>`,
        text: `Newsletter Fly2Any - Dicas + Ofertas da semana para {{nome}}`
      },
      
      reativacao: {
        subject: '💔 Sentimos sua falta! Oferta especial de volta',
        html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
            <h1>💔 Sentimos sua falta!</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2>{{nome}}, você nos fez falta!</h2>
            <p>Notamos que faz tempo que você não viaja conosco...</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🎁 Oferta Especial de Volta:</h3>
              <p><strong>15% OFF</strong> na sua próxima viagem!</p>
              <p>Código: <strong>VOLTEI15</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://fly2any.com/cotacao/voos?cupom=VOLTEI15" 
                 style="background: #dc2626; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;">
                💝 USAR MEU DESCONTO
              </a>
            </div>
          </div>
          ${this.getUnsubscribeFooter(email)}
        </body>
        </html>`,
        text: `{{nome}}, sentimos sua falta! 15% OFF com código VOLTEI15 - Fly2Any`
      }
    };

    return templates[type];
  }

  // Agendar envio automático
  async scheduleWeeklyCampaign(): Promise<void> {
    // Criar sequência de 4 emails semanais
    const templates = ['promocional', 'newsletter', 'promocional', 'reativacao'] as const;
    
    templates.forEach((template, index) => {
      const templateData = this.getTemplate(template); // Email será substituído na personalização
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (index * 7)); // Cada 7 dias
      
      this.createCampaign({
        name: `Campanha Semanal ${index + 1} - ${template}`,
        subject: templateData.subject,
        htmlContent: templateData.html,
        textContent: templateData.text,
        segmentFilter: index % 2 === 0 ? 'brasileiros-eua' : undefined, // Alternar segmentos
        scheduledDate
      });
    });
    
    console.log('Campanhas semanais agendadas!');
  }
}

// Singleton instance
export const emailMarketingService = new EmailMarketingService();

// Funções utilitárias
export async function sendPromotionalCampaign(segment?: string) {
  const template = emailMarketingService.getTemplate('promocional');
  const campaign = emailMarketingService.createCampaign({
    name: 'Campanha Promocional Miami',
    subject: template.subject,
    htmlContent: template.html,
    textContent: template.text,
    segmentFilter: segment
  });
  
  await emailMarketingService.sendCampaignViaWebhook(campaign.id);
  return campaign;
}

export async function setupWeeklyNewsletter() {
  await emailMarketingService.scheduleWeeklyCampaign();
}