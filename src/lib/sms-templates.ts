// SMS Templates - Central de Comunicação Omnichannel
// Templates automáticos para diferentes cenários SMS

export interface SMSTemplate {
  id: string;
  name: string;
  trigger: string;
  content: string;
  variables: string[];
  maxLength: number;
  category: 'greeting' | 'off_hours' | 'quote' | 'follow_up' | 'confirmation' | 'support';
}

export const SMS_TEMPLATES: Record<string, SMSTemplate> = {
  // SAUDAÇÕES E PRIMEIRO CONTATO
  greeting_business_hours: {
    id: 'sms_greeting_business',
    name: 'Saudação Horário Comercial',
    trigger: 'first_contact_business_hours',
    content: `🛫 Olá! Bem-vindo à Fly2Any!

✈️ Especialistas em voos EUA-Brasil
🎯 Cotação gratuita em até 2h
📱 Como posso ajudar hoje?

Para mais agilidade:
WhatsApp: (555) 123-4567`,
    variables: [],
    maxLength: 160,
    category: 'greeting'
  },

  greeting_off_hours: {
    id: 'sms_greeting_off_hours',
    name: 'Saudação Fora do Horário',
    trigger: 'first_contact_off_hours',
    content: `🛫 Fly2Any - Recebemos sua mensagem!

🕐 Estamos fora do horário comercial
⏰ Seg-Sex: 9h-18h (EST)

Um especialista retornará pela manhã.
Para emergências: WhatsApp (555) 123-4567`,
    variables: [],
    maxLength: 160,
    category: 'off_hours'
  },

  // COTAÇÕES E VENDAS
  quote_request: {
    id: 'sms_quote_request',
    name: 'Solicitação de Cotação',
    trigger: 'keywords: cotação, preço, voo, passagem',
    content: `✈️ Perfeito! Para cotação de voos preciso:

📍 Origem e destino
📅 Datas (ida/volta)
👥 Número de passageiros
🎫 Classe preferida

🚀 Resposta em até 2h!
💬 WhatsApp: (555) 123-4567`,
    variables: [],
    maxLength: 160,
    category: 'quote'
  },

  quote_follow_up: {
    id: 'sms_quote_followup',
    name: 'Follow-up Cotação',
    trigger: 'quote_sent_24h_ago',
    content: `🛫 Fly2Any aqui!

✈️ Viu nossa cotação de voos?
💰 Preços especiais válidos até {{expiry_date}}

❓ Dúvidas? Responda este SMS
📞 Ou ligue: (555) 123-4567

🎯 Garantimos o melhor preço!`,
    variables: ['expiry_date'],
    maxLength: 160,
    category: 'follow_up'
  },

  // CONFIRMAÇÕES E RESERVAS
  booking_confirmation: {
    id: 'sms_booking_confirmation',
    name: 'Confirmação de Reserva',
    trigger: 'booking_completed',
    content: `🎉 RESERVA CONFIRMADA!

✈️ Voo: {{flight_details}}
📅 Data: {{departure_date}}
🎫 Localizador: {{booking_reference}}

📧 Detalhes enviados por email
📱 Dúvidas: (555) 123-4567

✅ Boa viagem!`,
    variables: ['flight_details', 'departure_date', 'booking_reference'],
    maxLength: 160,
    category: 'confirmation'
  },

  payment_reminder: {
    id: 'sms_payment_reminder',
    name: 'Lembrete de Pagamento',
    trigger: 'payment_pending_24h',
    content: `⏰ LEMBRETE - Fly2Any

💳 Pagamento pendente para:
✈️ {{flight_route}}
📅 Vencimento: {{due_date}}

💰 Valor: {{amount}}
🔗 Link: {{payment_link}}

📞 Ajuda: (555) 123-4567`,
    variables: ['flight_route', 'due_date', 'amount', 'payment_link'],
    maxLength: 160,
    category: 'confirmation'
  },

  // SUPORTE E ATENDIMENTO
  support_general: {
    id: 'sms_support_general',
    name: 'Suporte Geral',
    trigger: 'keywords: ajuda, problema, suporte',
    content: `🆘 Fly2Any Suporte

📱 Como podemos ajudar?
1️⃣ Alteração de voo
2️⃣ Cancelamento
3️⃣ Reembolso
4️⃣ Check-in

Responda o número ou:
📞 (555) 123-4567`,
    variables: [],
    maxLength: 160,
    category: 'support'
  },

  flight_delay: {
    id: 'sms_flight_delay',
    name: 'Atraso de Voo',
    trigger: 'flight_status_delayed',
    content: `⚠️ ATUALIZAÇÃO DE VOO

✈️ Voo {{flight_number}}
📅 {{original_time}} → {{new_time}}
⏱️ Atraso: {{delay_duration}}

📧 Detalhes no email
🔄 Não é necessária nova reserva
📞 Dúvidas: (555) 123-4567`,
    variables: ['flight_number', 'original_time', 'new_time', 'delay_duration'],
    maxLength: 160,
    category: 'support'
  },

  // PROMOÇÕES E MARKETING
  promotion_flash_sale: {
    id: 'sms_flash_sale',
    name: 'Promoção Flash',
    trigger: 'marketing_campaign',
    content: `🔥 FLASH SALE - 24H APENAS!

✈️ Voos EUA-Brasil
💰 ATÉ 40% OFF
🎫 A partir de $\${starting_price}

🚨 Últimas vagas!
🔗 Reserve: {{booking_link}}
📞 (555) 123-4567`,
    variables: ['starting_price', 'booking_link'],
    maxLength: 160,
    category: 'follow_up'
  },

  birthday_special: {
    id: 'sms_birthday',
    name: 'Oferta Aniversário',
    trigger: 'customer_birthday',
    content: `🎂 FELIZ ANIVERSÁRIO, {{customer_name}}!

🎁 Presente especial da Fly2Any:
✈️ 25% OFF em qualquer voo
🗓️ Válido até {{expiry_date}}

🔗 Código: ANIVER25
📱 Use em: {{website_link}}

🎉 Boa viagem!`,
    variables: ['customer_name', 'expiry_date', 'website_link'],
    maxLength: 160,
    category: 'follow_up'
  }
};

// Classe para gerenciar templates SMS
export class SMSTemplateManager {
  
  // Obter template por ID
  static getTemplate(templateId: string): SMSTemplate | null {
    return SMS_TEMPLATES[templateId] || null;
  }

  // Obter templates por categoria
  static getTemplatesByCategory(category: SMSTemplate['category']): SMSTemplate[] {
    return Object.values(SMS_TEMPLATES).filter(template => template.category === category);
  }

  // Processar template com variáveis
  static processTemplate(templateId: string, variables: Record<string, string> = {}): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let content = template.content;
    
    // Substituir variáveis
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`;
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    return content;
  }

  // Validar comprimento da mensagem
  static validateLength(content: string, maxLength: number = 160): boolean {
    return content.length <= maxLength;
  }

  // Obter template baseado em trigger/contexto
  static getTemplateByTrigger(trigger: string, context: any = {}): SMSTemplate | null {
    const now = new Date();
    const hour = now.getHours();
    const isBusinessHours = hour >= 9 && hour < 18;

    // Primeira mensagem do cliente
    if (trigger === 'first_contact') {
      return isBusinessHours ? 
        this.getTemplate('greeting_business_hours') : 
        this.getTemplate('greeting_off_hours');
    }

    // Palavras-chave de cotação
    if (trigger.includes('cotação') || trigger.includes('preço') || trigger.includes('voo')) {
      return this.getTemplate('quote_request');
    }

    // Palavras-chave de suporte
    if (trigger.includes('ajuda') || trigger.includes('problema') || trigger.includes('suporte')) {
      return this.getTemplate('support_general');
    }

    // Follow-up de cotação
    if (trigger === 'quote_followup') {
      return this.getTemplate('quote_follow_up');
    }

    // Confirmações
    if (trigger === 'booking_confirmed') {
      return this.getTemplate('booking_confirmation');
    }

    // Aniversário
    if (trigger === 'birthday' && context.customer_name) {
      return this.getTemplate('birthday_special');
    }

    return null;
  }

  // Listar todos os templates
  static getAllTemplates(): SMSTemplate[] {
    return Object.values(SMS_TEMPLATES);
  }

  // Buscar templates por texto
  static searchTemplates(query: string): SMSTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(SMS_TEMPLATES).filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.content.toLowerCase().includes(lowercaseQuery) ||
      template.trigger.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Utilitários para SMS
export class SMSUtils {
  
  // Limpar e validar número de telefone
  static cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  // Validar número de telefone brasileiro
  static validateBrazilianPhone(phone: string): boolean {
    const cleaned = this.cleanPhoneNumber(phone);
    return /^55\d{10,11}$/.test(cleaned);
  }

  // Validar número de telefone americano
  static validateUSPhone(phone: string): boolean {
    const cleaned = this.cleanPhoneNumber(phone);
    return /^1\d{10}$/.test(cleaned);
  }

  // Formatar número para exibição
  static formatPhoneForDisplay(phone: string): string {
    const cleaned = this.cleanPhoneNumber(phone);
    
    if (cleaned.startsWith('55')) {
      // Formato brasileiro: +55 (11) 99999-9999
      return `+55 (${cleaned.substring(2, 4)}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    } else if (cleaned.startsWith('1')) {
      // Formato americano: +1 (555) 123-4567
      return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    
    return `+${cleaned}`;
  }

  // Detectar horário comercial baseado no timezone
  static isBusinessHours(timezone: string = 'America/New_York'): boolean {
    const now = new Date();
    const hour = parseInt(now.toLocaleString('en-US', { 
      timeZone: timezone, 
      hour12: false, 
      hour: 'numeric' 
    }));
    
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Segunda a sexta, 9h às 18h
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  }
}

export default SMSTemplateManager;