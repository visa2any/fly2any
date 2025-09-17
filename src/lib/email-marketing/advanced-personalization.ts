import { EmailContact } from '@/lib/email-marketing-database';

// Advanced email personalization engine for enterprise unlimited sending
export interface PersonalizationData {
  contact: EmailContact;
  campaign: {
    id: string;
    name: string;
    type: string;
  };
  customData?: Record<string, any>;
}

export interface PersonalizationRule {
  id: string;
  name: string;
  condition: (data: PersonalizationData) => boolean;
  content: {
    subject?: string;
    htmlContent?: string;
    textContent?: string;
  };
  priority: number;
}

export class AdvancedPersonalizationEngine {
  private static rules: PersonalizationRule[] = [];

  // Add personalization rule
  static addRule(rule: PersonalizationRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority); // Sort by priority
  }

  // Remove personalization rule
  static removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  // Get all rules
  static getRules(): PersonalizationRule[] {
    return [...this.rules];
  }

  // Personalize email content based on contact data
  static personalizeContent(
    originalContent: string,
    data: PersonalizationData,
    contentType: 'subject' | 'html' | 'text' = 'html'
  ): string {
    let content = originalContent;

    // Apply personalization rules in priority order
    for (const rule of this.rules) {
      if (rule.condition(data)) {
        const ruleContent = contentType === 'subject' ? rule.content.subject :
                           contentType === 'html' ? rule.content.htmlContent :
                           rule.content.textContent;
        
        if (ruleContent) {
          content = ruleContent;
          break; // Use first matching rule
        }
      }
    }

    // Apply variable replacements
    content = this.replaceVariables(content, data);

    return content;
  }

  // Replace template variables with actual data
  private static replaceVariables(content: string, data: PersonalizationData): string {
    const { contact, campaign, customData = {} } = data;

    // Standard contact variables
    const variables: Record<string, string> = {
      first_name: contact.first_name || 'Cliente',
      last_name: contact.last_name || '',
      email: contact.email,
      full_name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Cliente',
      engagement_score: contact.engagement_score?.toString() || '0',
      total_emails_opened: contact.total_emails_opened?.toString() || '0',
      total_emails_clicked: contact.total_emails_clicked?.toString() || '0',
      subscription_date: contact.subscription_date?.toLocaleDateString() || '',
      
      // Campaign variables
      campaign_name: campaign.name,
      campaign_id: campaign.id,
      campaign_type: campaign.type,
      
      // Dynamic variables
      current_date: new Date().toLocaleDateString('pt-BR'),
      current_time: new Date().toLocaleTimeString('pt-BR'),
      current_year: new Date().getFullYear().toString(),
      
      // Custom data
      ...customData
    };

    // Replace all variables in format {{variable_name}}
    let personalizedContent = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      personalizedContent = personalizedContent.replace(regex, value);
    }

    // Handle conditional content blocks
    personalizedContent = this.processConditionalContent(personalizedContent, data);

    return personalizedContent;
  }

  // Process conditional content blocks like {{#if condition}}...{{/if}}
  private static processConditionalContent(content: string, data: PersonalizationData): string {
    const { contact } = data;

    // High engagement condition
    const isHighEngagement = (contact.engagement_score || 0) > 50;
    content = this.replaceConditionalBlock(content, 'high_engagement', isHighEngagement);

    // New subscriber condition (less than 30 days)
    const isNewSubscriber = contact.subscription_date && 
      (Date.now() - contact.subscription_date.getTime()) < (30 * 24 * 60 * 60 * 1000);
    content = this.replaceConditionalBlock(content, 'new_subscriber', isNewSubscriber);

    // VIP customer condition (high engagement + multiple clicks)
    const isVIP = (contact.engagement_score || 0) > 70 && (contact.total_emails_clicked || 0) > 5;
    content = this.replaceConditionalBlock(content, 'vip_customer', isVIP);

    return content;
  }

  // Replace conditional block
  private static replaceConditionalBlock(content: string, condition: string, show: boolean): string {
    const regex = new RegExp(`{{#if\\s+${condition}}}([\\s\\S]*?){{/if}}`, 'g');
    return content.replace(regex, show ? '$1' : '');
  }

  // Generate subject line variations for A/B testing
  static generateSubjectVariations(baseSubject: string, data: PersonalizationData): string[] {
    const variations: string[] = [baseSubject];

    // Add personalized variations
    if (data.contact.first_name) {
      variations.push(`${data.contact.first_name}, ${baseSubject.toLowerCase()}`);
      variations.push(`Olá ${data.contact.first_name}! ${baseSubject}`);
    }

    // Add urgency variations
    variations.push(`⏰ ${baseSubject}`);
    variations.push(`🚨 Urgente: ${baseSubject}`);

    // Add benefit-focused variations
    variations.push(`✅ ${baseSubject} - Aprovado!`);
    variations.push(`🎯 Exclusivo: ${baseSubject}`);

    return [...new Set(variations)]; // Remove duplicates
  }

  // Analyze content performance for optimization
  static analyzeContentPerformance(campaignId: string): Promise<{
    openRate: number;
    clickRate: number;
    topPerformingSubjects: string[];
    recommendations: string[];
  }> {
    // This would typically analyze database records
    // For now, return optimized recommendations
    return Promise.resolve({
      openRate: 85.2,
      clickRate: 12.8,
      topPerformingSubjects: [
        'Exclusivo para você: Ofertas imperdíveis',
        '🎯 Oferta especial - Só hoje!',
        'Olá {{first_name}}! Sua oferta personalizada'
      ],
      recommendations: [
        '✅ Personalize subject lines com o nome do cliente',
        '🎯 Use emojis para chamar atenção',
        '⏰ Crie senso de urgência com tempo limitado',
        '🎁 Destaque benefícios exclusivos',
        '📈 Teste diferentes abordagens de CTA'
      ]
    });
  }
}

// Default personalization rules for enterprise email marketing
export const enterprisePersonalizationRules: PersonalizationRule[] = [
  {
    id: 'vip-customer',
    name: 'VIP Customer Treatment',
    condition: (data) => (data.contact.engagement_score || 0) > 70,
    content: {
      subject: '🌟 Oferta VIP Exclusiva: {{campaign_name}}',
      htmlContent: `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 20px;">
          <h2>🌟 Oferta VIP Exclusiva</h2>
          <p>Olá {{first_name}}, como cliente VIP você tem acesso antecipado!</p>
        </div>
      `
    },
    priority: 100
  },
  {
    id: 'high-engagement',
    name: 'High Engagement Personalization',
    condition: (data) => (data.contact.engagement_score || 0) > 50,
    content: {
      subject: '🎯 {{first_name}}, oferta especial para você!',
      htmlContent: `
        <div style="background-color: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px;">
          <p><strong>Olá {{first_name}}!</strong> Notamos seu interesse em nossas ofertas. Esta é especial para você:</p>
        </div>
      `
    },
    priority: 80
  },
  {
    id: 'new-subscriber',
    name: 'New Subscriber Welcome',
    condition: (data) => {
      if (!data.contact.subscription_date) return false;
      const daysSinceSubscription = (Date.now() - data.contact.subscription_date.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSubscription <= 7;
    },
    content: {
      subject: '🎉 Bem-vindo(a) {{first_name}}! Oferta especial de boas-vindas',
      htmlContent: `
        <div style="background-color: #fff3e0; border: 2px solid #ff9800; padding: 20px; text-align: center; border-radius: 10px; margin-bottom: 20px;">
          <h2>🎉 Bem-vindo(a) à Fly2Any!</h2>
          <p>Olá {{first_name}}, que bom ter você conosco! Como novo cliente, você tem 15% de desconto na primeira compra.</p>
        </div>
      `
    },
    priority: 90
  }
];

// Initialize default rules
enterprisePersonalizationRules.forEach(rule => {
  AdvancedPersonalizationEngine.addRule(rule);
});