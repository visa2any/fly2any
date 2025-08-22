/**
 * Enterprise Email Notification Service
 * High-level service for managing all email notifications with templates,
 * tracking, analytics, and comprehensive error handling
 */

import { emailQueue, EmailJob } from './email-queue';
import { LeadNotificationData } from '../lead-notifications';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'lead_admin' | 'lead_customer' | 'marketing' | 'system';
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  requiredFields: string[];
  defaultData?: Record<string, any>;
  priority: EmailJob['priority'];
  tags: string[];
}

interface NotificationResult {
  success: boolean;
  jobId?: string;
  messageId?: string;
  error?: string;
  tracking?: {
    id: string;
    recipient: string;
    template: string;
    sentAt: Date;
    status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';
  };
}

interface NotificationOptions {
  priority?: EmailJob['priority'];
  delay?: number; // seconds
  provider?: 'gmail' | 'sendgrid' | 'n8n' | 'resend';
  tracking?: boolean;
  maxAttempts?: number;
  tags?: string[];
}

interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number;
  bounceRate: number;
  avgDeliveryTime: number;
  byTemplate: Record<string, {
    sent: number;
    delivered: number;
    bounced: number;
    failed: number;
  }>;
  byProvider: Record<string, {
    sent: number;
    delivered: number;
    performance: number; // success rate
  }>;
  recentErrors: Array<{
    timestamp: Date;
    error: string;
    template: string;
    recipient: string;
  }>;
}

class NotificationService {
  private templates: Map<string, NotificationTemplate> = new Map();
  private tracking: Map<string, NotificationResult['tracking']> = new Map();
  private analytics: NotificationAnalytics = {
    totalSent: 0,
    totalDelivered: 0,
    totalBounced: 0,
    totalFailed: 0,
    deliveryRate: 0,
    bounceRate: 0,
    avgDeliveryTime: 0,
    byTemplate: {},
    byProvider: {},
    recentErrors: []
  };

  constructor() {
    this.initializeTemplates();
    this.startAnalyticsUpdater();
  }

  /**
   * Send lead notification to admin
   */
  async sendLeadNotificationToAdmin(
    leadData: LeadNotificationData,
    options?: NotificationOptions
  ): Promise<NotificationResult> {
    const adminEmails = [
      'info@fly2any.com',
      'fly2any.travel@gmail.com'
    ];

    try {
      const results = await Promise.allSettled(
        adminEmails.map(email => 
          this.sendNotification('lead_admin_notification', email, leadData, {
            ...options,
            priority: 'high',
            tracking: true,
            tags: ['lead', 'admin', 'notification']
          })
        )
      );

      const successes = results.filter(r => r.status === 'fulfilled').length;
      const failures = results.filter(r => r.status === 'rejected').length;

      return {
        success: successes > 0,
        jobId: results[0]?.status === 'fulfilled' ? results[0].value.jobId : undefined,
        tracking: results[0]?.status === 'fulfilled' ? results[0].value.tracking : undefined,
        error: failures > 0 ? `${failures} admin emails failed` : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send customer confirmation email
   */
  async sendCustomerConfirmationEmail(
    leadData: LeadNotificationData,
    options?: NotificationOptions
  ): Promise<NotificationResult> {
    return this.sendNotification('lead_customer_confirmation', leadData.email, leadData, {
      ...options,
      priority: 'normal',
      tracking: true,
      tags: ['lead', 'customer', 'confirmation']
    });
  }

  /**
   * Send complete lead notification (admin + customer)
   */
  async sendCompleteLeadNotification(
    leadData: LeadNotificationData,
    options?: NotificationOptions
  ): Promise<{
    success: boolean;
    adminResult: NotificationResult;
    customerResult: NotificationResult;
  }> {
    const [adminResult, customerResult] = await Promise.allSettled([
      this.sendLeadNotificationToAdmin(leadData, options),
      this.sendCustomerConfirmationEmail(leadData, options)
    ]);

    return {
      success: (adminResult.status === 'fulfilled' && adminResult.value.success) ||
               (customerResult.status === 'fulfilled' && customerResult.value.success),
      adminResult: adminResult.status === 'fulfilled' ? adminResult.value : { success: false, error: 'Admin notification failed' },
      customerResult: customerResult.status === 'fulfilled' ? customerResult.value : { success: false, error: 'Customer notification failed' }
    };
  }

  /**
   * Generic notification sender
   */
  async sendNotification(
    templateId: string,
    recipient: string | string[],
    templateData: Record<string, any>,
    options?: NotificationOptions
  ): Promise<NotificationResult> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template '${templateId}' not found`);
      }

      // Validate required fields
      const missingFields = template.requiredFields.filter(field => !(field in templateData));
      if (missingFields.length > 0) {
        throw new Error(`Missing required template fields: ${missingFields.join(', ')}`);
      }

      // Generate tracking ID
      const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare email data
      const emailData = {
        to: recipient,
        subject: this.renderSubject(template.subject, templateData),
        template: templateId,
        templateData: {
          ...template.defaultData,
          ...templateData,
          _trackingId: trackingId
        },
        provider: options?.provider,
        tags: [...(template.tags || []), ...(options?.tags || [])]
      };

      // Add to queue
      const jobId = await emailQueue.addJob(emailData, {
        priority: options?.priority || template.priority,
        delay: options?.delay,
        maxAttempts: options?.maxAttempts || 3
      });

      // Create tracking record
      const trackingRecord = {
        id: trackingId,
        recipient: Array.isArray(recipient) ? recipient.join(', ') : recipient,
        template: templateId,
        sentAt: new Date(),
        status: 'queued' as const
      };

      if (options?.tracking !== false) {
        this.tracking.set(trackingId, trackingRecord);
      }

      // Update analytics
      this.updateAnalytics('sent', templateId, 'queued');

      console.log(`📧 [NOTIFICATION] ${templateId} notification queued`, {
        jobId,
        trackingId,
        recipient: Array.isArray(recipient) ? `${recipient.length} recipients` : recipient,
        priority: options?.priority || template.priority
      });

      return {
        success: true,
        jobId,
        tracking: trackingRecord
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ [NOTIFICATION] Failed to send ${templateId}:`, errorMessage);
      
      // Track error in analytics
      this.analytics.recentErrors.push({
        timestamp: new Date(),
        error: errorMessage,
        template: templateId,
        recipient: Array.isArray(recipient) ? recipient.join(', ') : recipient
      });

      // Keep only last 100 errors
      if (this.analytics.recentErrors.length > 100) {
        this.analytics.recentErrors = this.analytics.recentErrors.slice(-100);
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get notification status by tracking ID
   */
  getNotificationStatus(trackingId: string): NotificationResult['tracking'] | null {
    return this.tracking.get(trackingId) || null;
  }

  /**
   * Get email queue statistics
   */
  getQueueStats() {
    return emailQueue.getStats();
  }

  /**
   * Get notification analytics
   */
  getAnalytics(): NotificationAnalytics {
    return { ...this.analytics };
  }

  /**
   * Register custom template
   */
  registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    console.log(`📧 [NOTIFICATION] Template '${template.id}' registered`);
  }

  /**
   * Get all available templates
   */
  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Retry failed notification
   */
  async retryNotification(trackingId: string): Promise<boolean> {
    const tracking = this.tracking.get(trackingId);
    if (!tracking) {
      return false;
    }

    // Find the associated job and retry it
    // This would need to be implemented based on how we store job IDs
    console.log(`🔄 [NOTIFICATION] Retrying notification ${trackingId}`);
    return true;
  }

  /**
   * Initialize built-in templates
   */
  private initializeTemplates(): void {
    // Lead Admin Notification Template
    this.registerTemplate({
      id: 'lead_admin_notification',
      name: 'Lead Admin Notification',
      type: 'lead_admin',
      subject: '🚨 Novo Lead Recebido - {{nome}}',
      htmlTemplate: this.getLeadAdminHtmlTemplate(),
      textTemplate: this.getLeadAdminTextTemplate(),
      requiredFields: ['nome', 'email', 'whatsapp', 'origem', 'destino', 'selectedServices'],
      defaultData: {
        adminUrl: 'https://fly2any.com/admin/leads',
        companyName: 'Fly2Any'
      },
      priority: 'high',
      tags: ['lead', 'admin', 'notification']
    });

    // Lead Customer Confirmation Template
    this.registerTemplate({
      id: 'lead_customer_confirmation',
      name: 'Lead Customer Confirmation',
      type: 'lead_customer',
      subject: '✈️ Bem-vindo à Fly2Any, {{nome}}! Suas ofertas de viagem chegaram',
      htmlTemplate: this.getCustomerConfirmationHtmlTemplate(),
      textTemplate: this.getCustomerConfirmationTextTemplate(),
      requiredFields: ['nome', 'email'],
      defaultData: {
        companyName: 'Fly2Any',
        supportPhone: '+1 (551) 364-6029',
        supportWhatsApp: '+15513646029',
        website: 'https://www.fly2any.com'
      },
      priority: 'normal',
      tags: ['lead', 'customer', 'confirmation']
    });

    console.log(`📧 [NOTIFICATION] ${this.templates.size} templates initialized`);
  }

  /**
   * Start analytics updater
   */
  private startAnalyticsUpdater(): void {
    setInterval(() => {
      this.updateAnalyticsFromQueue();
    }, 30000); // Update every 30 seconds
  }

  /**
   * Update analytics from queue data
   */
  private updateAnalyticsFromQueue(): void {
    const queueStats = emailQueue.getStats();
    
    // Update basic stats
    this.analytics.totalSent = queueStats.completed + queueStats.failed;
    this.analytics.totalDelivered = queueStats.completed;
    this.analytics.totalFailed = queueStats.failed;
    
    // Calculate rates
    if (this.analytics.totalSent > 0) {
      this.analytics.deliveryRate = (this.analytics.totalDelivered / this.analytics.totalSent) * 100;
      this.analytics.bounceRate = (this.analytics.totalFailed / this.analytics.totalSent) * 100;
    }
    
    this.analytics.avgDeliveryTime = queueStats.avgProcessingTime;
  }

  /**
   * Update analytics for specific events
   */
  private updateAnalytics(
    event: 'sent' | 'delivered' | 'bounced' | 'failed',
    template: string,
    provider?: string
  ): void {
    // Update by template
    if (!this.analytics.byTemplate[template]) {
      this.analytics.byTemplate[template] = {
        sent: 0,
        delivered: 0,
        bounced: 0,
        failed: 0
      };
    }
    this.analytics.byTemplate[template][event]++;

    // Update by provider
    if (provider) {
      if (!this.analytics.byProvider[provider]) {
        this.analytics.byProvider[provider] = {
          sent: 0,
          delivered: 0,
          performance: 0
        };
      }
      
      if (event === 'sent') this.analytics.byProvider[provider].sent++;
      if (event === 'delivered') this.analytics.byProvider[provider].delivered++;
      
      // Calculate performance
      const providerStats = this.analytics.byProvider[provider];
      if (providerStats.sent > 0) {
        providerStats.performance = (providerStats.delivered / providerStats.sent) * 100;
      }
    }
  }

  /**
   * Render subject line with template variables
   */
  private renderSubject(subject: string, data: Record<string, any>): string {
    return subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * Get lead admin HTML template
   */
  private getLeadAdminHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Lead - {{nome}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center; }
        .header h1 { font-size: 24px; margin: 0 0 8px 0; font-weight: 700; }
        .header p { font-size: 16px; opacity: 0.9; margin: 0; }
        .content { padding: 24px; }
        .lead-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #667eea; }
        .lead-info h3 { font-size: 18px; margin-bottom: 16px; color: #1a202c; font-weight: 600; }
        .field { margin: 12px 0; }
        .label { font-weight: 600; color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
        .value { color: #1a202c; font-size: 16px; font-weight: 500; padding: 8px 12px; background: white; border-radius: 6px; border: 1px solid #e2e8f0; }
        .services { background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #bbdefb; }
        .services h3 { color: #1565c0; margin-bottom: 12px; font-size: 18px; }
        .services ul { list-style: none; padding: 0; margin: 0; }
        .services li { background: white; padding: 8px 12px; margin: 6px 0; border-radius: 6px; border-left: 3px solid #2196f3; font-weight: 500; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 16px 8px 16px 0; font-weight: 600; text-align: center; }
        .btn-whatsapp { background: #25d366; }
        .footer { text-align: center; margin-top: 24px; padding: 20px; color: #666; font-size: 13px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        @media screen and (max-width: 600px) {
            body { padding: 10px; }
            .container { border-radius: 0; }
            .header { padding: 20px 16px; }
            .content { padding: 16px; }
            .btn { display: block; margin: 12px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛫 Novo Lead Recebido</h1>
            <p>Um novo cliente potencial se interessou pelos nossos serviços!</p>
        </div>
        
        <div class="content">
            <div class="lead-info">
                <h3>👤 Informações do Cliente</h3>
                <div class="field">
                    <span class="label">Nome:</span>
                    <div class="value">{{nome}}</div>
                </div>
                <div class="field">
                    <span class="label">Email:</span>
                    <div class="value">{{email}}</div>
                </div>
                <div class="field">
                    <span class="label">WhatsApp:</span>
                    <div class="value">{{whatsapp}}</div>
                </div>
                {{#telefone}}
                <div class="field">
                    <span class="label">Telefone:</span>
                    <div class="value">{{telefone}}</div>
                </div>
                {{/telefone}}
            </div>

            <div class="lead-info">
                <h3>✈️ Detalhes da Viagem</h3>
                <div class="field">
                    <span class="label">Origem:</span>
                    <div class="value">{{origem}}</div>
                </div>
                <div class="field">
                    <span class="label">Destino:</span>
                    <div class="value">{{destino}}</div>
                </div>
                {{#dataPartida}}
                <div class="field">
                    <span class="label">Data de Partida:</span>
                    <div class="value">{{dataPartida}}</div>
                </div>
                {{/dataPartida}}
                {{#dataRetorno}}
                <div class="field">
                    <span class="label">Data de Retorno:</span>
                    <div class="value">{{dataRetorno}}</div>
                </div>
                {{/dataRetorno}}
                {{#numeroPassageiros}}
                <div class="field">
                    <span class="label">Passageiros:</span>
                    <div class="value">{{numeroPassageiros}}</div>
                </div>
                {{/numeroPassageiros}}
                {{#orcamentoTotal}}
                <div class="field">
                    <span class="label">Orçamento:</span>
                    <div class="value">{{orcamentoTotal}}</div>
                </div>
                {{/orcamentoTotal}}
            </div>

            <div class="services">
                <h3>🎯 Serviços Solicitados</h3>
                <ul>
                    {{#selectedServices}}
                    <li>{{.}}</li>
                    {{/selectedServices}}
                </ul>
            </div>

            {{#observacoes}}
            <div class="lead-info">
                <h3>📝 Observações</h3>
                <div class="value">{{observacoes}}</div>
            </div>
            {{/observacoes}}

            <div class="lead-info">
                <h3>📊 Informações Técnicas</h3>
                <div class="field">
                    <span class="label">ID do Lead:</span>
                    <div class="value">{{id}}</div>
                </div>
                <div class="field">
                    <span class="label">Origem:</span>
                    <div class="value">{{source}}</div>
                </div>
                <div class="field">
                    <span class="label">Data/Hora:</span>
                    <div class="value">{{createdAt}}</div>
                </div>
            </div>

            <div style="text-align: center; margin: 24px 0;">
                <a href="{{adminUrl}}" class="btn">🔗 Ver no Painel Admin</a>
                <a href="https://wa.me/{{whatsapp}}" class="btn btn-whatsapp">💬 Contatar via WhatsApp</a>
            </div>
        </div>

        <div class="footer">
            <p>📧 Esta é uma notificação automática do sistema {{companyName}}</p>
            <p>Para mais informações, acesse o painel administrativo</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Get lead admin text template
   */
  private getLeadAdminTextTemplate(): string {
    return `🛫 NOVO LEAD RECEBIDO - {{companyName}}

👤 Cliente: {{nome}}
📧 Email: {{email}}
📱 WhatsApp: {{whatsapp}}
{{#telefone}}☎️ Telefone: {{telefone}}{{/telefone}}

✈️ Viagem:
- Origem: {{origem}}
- Destino: {{destino}}
{{#dataPartida}}- Data Partida: {{dataPartida}}{{/dataPartida}}
{{#dataRetorno}}- Data Retorno: {{dataRetorno}}{{/dataRetorno}}
{{#numeroPassageiros}}- Passageiros: {{numeroPassageiros}}{{/numeroPassageiros}}
{{#orcamentoTotal}}- Orçamento: {{orcamentoTotal}}{{/orcamentoTotal}}

🎯 Serviços: {{#selectedServices}}{{.}}, {{/selectedServices}}

{{#observacoes}}📝 Observações: {{observacoes}}{{/observacoes}}

📊 Detalhes:
- ID: {{id}}
- Fonte: {{source}}
- Data: {{createdAt}}

🔗 Painel Admin: {{adminUrl}}
💬 WhatsApp: https://wa.me/{{whatsapp}}`;
  }

  /**
   * Get customer confirmation HTML template
   */
  private getCustomerConfirmationHtmlTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo à {{companyName}}!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%); color: white; padding: 30px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 18px; opacity: 0.9; }
        .content { padding: 30px; background: #f8fafc; }
        .welcome { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af; }
        .welcome h2 { color: #1e40af; margin-top: 0; }
        .urgency { background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; text-align: center; }
        .urgency h3 { color: #d97706; margin-top: 0; }
        .offers { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981; }
        .offers h3 { color: #059669; margin-top: 0; text-align: center; }
        .offer-item { display: flex; align-items: center; margin: 12px 0; font-size: 16px; }
        .check { color: #10b981; font-weight: bold; margin-right: 10px; font-size: 18px; }
        .contact-info { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0; }
        .contact-info h3 { color: #1e40af; margin-top: 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #1e40af, #a21caf); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; margin: 15px 10px; }
        .btn-whatsapp { background: #25d366; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 14px; }
        @media screen and (max-width: 600px) {
            body { padding: 10px; }
            .container { border-radius: 0; }
            .header { padding: 20px 16px; }
            .content { padding: 16px; }
            .cta-button { display: block; margin: 12px 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✈️ {{companyName}}</div>
            <div class="subtitle">Conectando brasileiros ao mundo desde 2014</div>
        </div>
        
        <div class="content">
            <div class="welcome">
                <h2>Olá, {{nome}}! 🌟</h2>
                <p style="font-size: 18px; margin-bottom: 15px;">
                    <strong>Obrigado por escolher a {{companyName}}!</strong>
                </p>
                <p>
                    Somos especialistas em viagens para brasileiros nos EUA e temos 
                    <strong>mais de 10 anos de experiência</strong> criando experiências 
                    inesquecíveis. Sua solicitação foi recebida e nossa equipe já está 
                    preparando as melhores ofertas para você!
                </p>
            </div>

            <div class="urgency">
                <h3>🔥 OFERTA LIMITADA - APENAS HOJE!</h3>
                <p style="font-size: 18px; margin: 0;">
                    <strong>Economize até $2,500</strong> em passagens + hotel
                </p>
            </div>

            <div class="offers">
                <h3>🎯 O que oferecemos exclusivamente:</h3>
                <div class="offer-item">
                    <span class="check">✈️</span>
                    <span><strong>Passagens aéreas</strong> com até 60% de desconto</span>
                </div>
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
                <h3>🚀 Nossa equipe entrará em contato em até 30 minutos!</h3>
                <p style="margin-bottom: 20px;">
                    Precisa falar conosco agora? Clique abaixo:
                </p>
                <a href="https://wa.me/{{supportWhatsApp}}" class="cta-button btn-whatsapp">
                    📱 WhatsApp Direto EUA
                </a>
                <a href="tel:{{supportPhone}}" class="cta-button">
                    📞 Ligar Agora: {{supportPhone}}
                </a>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{website}}" class="cta-button">
                    🌎 Ver Mais Ofertas no Site
                </a>
            </div>

            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af;">
                    <strong>💡 Por que escolher a {{companyName}}?</strong><br>
                    • Empresa brasileira estabelecida nos EUA<br>
                    • Mais de 50.000 clientes satisfeitos<br>
                    • Preços exclusivos não encontrados em outros lugares
                </p>
            </div>
        </div>

        <div class="footer">
            <p><strong>{{companyName}} Travel Inc.</strong></p>
            <p>📍 Miami, FL - Estados Unidos | 📧 contato@fly2any.com</p>
            <p style="font-size: 12px; color: #9ca3af;">
                Você está recebendo este email porque solicitou informações em nosso site.<br>
                © 2024 {{companyName}}. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Get customer confirmation text template
   */
  private getCustomerConfirmationTextTemplate(): string {
    return `✈️ BEM-VINDO À {{companyName}}, {{nome}}!

Obrigado por escolher a {{companyName}}! Somos especialistas em viagens para brasileiros nos EUA com mais de 10 anos de experiência.

🔥 OFERTA LIMITADA - APENAS HOJE!
Economize até $2,500 em passagens + hotel

🎯 O que oferecemos exclusivamente:
✈️ Passagens aéreas com até 60% de desconto
🏨 Hotéis premium com tarifas especiais  
🚗 Aluguel de carros sem taxas ocultas
🎫 Ingressos Disney/Universal com desconto
🛡️ Seguro viagem completo incluso
📞 Suporte 24/7 em português nos EUA

🚀 Nossa equipe entrará em contato em até 30 minutos!

Precisa falar conosco agora?
📱 WhatsApp: https://wa.me/{{supportWhatsApp}}
📞 Telefone: {{supportPhone}}

💡 Por que escolher a {{companyName}}?
• Empresa brasileira estabelecida nos EUA
• Mais de 50.000 clientes satisfeitos  
• Preços exclusivos não encontrados em outros lugares

🌎 Ver mais ofertas: {{website}}

{{companyName}} Travel Inc.
📍 Miami, FL - Estados Unidos
📧 contato@fly2any.com`;
  }
}

// Singleton instance
export const notificationService = new NotificationService();

export type { 
  NotificationTemplate, 
  NotificationResult, 
  NotificationOptions, 
  NotificationAnalytics 
};