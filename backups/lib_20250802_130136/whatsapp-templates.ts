// WhatsApp Templates para Fly2Any
// Templates personalizados para diferentes cenários de atendimento

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables?: string[];
  category: 'greeting' | 'quote' | 'info' | 'emergency' | 'follow_up';
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  // Saudações e Boas-vindas
  {
    id: 'welcome',
    name: 'Boas-vindas',
    content: `🛫 *Olá! Bem-vindo à Fly2Any!*

Somos especialistas em viagens EUA-Brasil há mais de 10 anos.

✅ Voos com melhores preços
✅ Cotação gratuita em 2h  
✅ Atendimento 24h em português

Como posso te ajudar hoje?`,
    category: 'greeting'
  },
  
  {
    id: 'greeting_returning',
    name: 'Cliente Retornando',
    content: `😊 *Olá {{name}}!*

Que bom te ver novamente! 

Sua última viagem foi para {{destination}} em {{date}}.

Como posso ajudar hoje? Talvez outra viagem incrível? ✈️`,
    variables: ['name', 'destination', 'date'],
    category: 'greeting'
  },

  // Cotações
  {
    id: 'quote_ready',
    name: 'Cotação Pronta',
    content: `🎯 *Sua cotação está pronta!*

✈️ **Rota:** {{origin}} ↔ {{destination}}
💰 **Valor:** {{price}}
📅 **Válida até:** {{valid_until}}
🏢 **Companhia:** {{airline}}

Para confirmar ou tirar dúvidas, responda esta mensagem.

*Fly2Any - Sua ponte para o Brasil* ✈️`,
    variables: ['origin', 'destination', 'price', 'valid_until', 'airline'],
    category: 'quote'
  },

  {
    id: 'quote_multiple',
    name: 'Múltiplas Opções',
    content: `🎯 *Encontramos {{count}} opções para você!*

✈️ **{{origin}} ↔ {{destination}}**
📅 **{{dates}}**

**Opção 1:** {{airline1}} - {{price1}}
**Opção 2:** {{airline2}} - {{price2}}
**Opção 3:** {{airline3}} - {{price3}}

🎯 Cotação gratuita válida por 48h
📞 Quer mais detalhes? Responda aqui!`,
    variables: ['count', 'origin', 'destination', 'dates', 'airline1', 'price1', 'airline2', 'price2', 'airline3', 'price3'],
    category: 'quote'
  },

  // Informações Detalhadas
  {
    id: 'flight_info_detailed',
    name: 'Informações Detalhadas Voo',
    content: `✈️ *Detalhes do Voo Selecionado*

📍 **Rota:** {{origin}} ↔ {{destination}}
📅 **Data Ida:** {{departure_date}} às {{departure_time}}
📅 **Data Volta:** {{return_date}} às {{return_time}}
🏢 **Companhia:** {{airline}}
⏱️ **Duração:** {{duration}}
🔄 **Conexões:** {{connections}}

💰 **Preço Total:** {{total_price}}
💳 **Parcelamento:** até {{installments}}x no cartão

*Confirmar reserva?* 🎫`,
    variables: ['origin', 'destination', 'departure_date', 'departure_time', 'return_date', 'return_time', 'airline', 'duration', 'connections', 'total_price', 'installments'],
    category: 'info'
  },

  {
    id: 'documentation_complete',
    name: 'Documentação Completa',
    content: `📋 *Documentação Necessária: {{destination}}*

✅ **OBRIGATÓRIOS:**
• Passaporte brasileiro (válido 6+ meses)
• Visto americano válido
• Comprovante vacinação COVID-19
• Seguro saúde internacional

✅ **RECOMENDADOS:**
• CNH Internacional (se for dirigir)
• Comprovante hospedagem
• Comprovante financeiro

❌ **LEMBRE-SE:**
• Verificar validade do visto
• Passaporte deve ter páginas em branco
• Vacinas em dia

*Precisa de ajuda com algum documento?* 🛂`,
    variables: ['destination'],
    category: 'info'
  },

  {
    id: 'baggage_complete',
    name: 'Bagagem Completa',
    content: `🧳 *Guia Completo de Bagagem*

✅ **PERMITIDO LEVAR:**
• Produtos industrializados lacrados
• Chocolates, café, doces
• Roupas e objetos pessoais
• Medicamentos com receita
• Produtos de higiene pessoal

❌ **PROIBIDO:**
• Frutas, verduras, plantas
• Carnes e derivados
• Queijos e laticínios
• Mel e produtos apícolas
• Sementes e mudas

📏 **LIMITES:**
• Mão: 10kg + dimensões IATA
• Despachada: 23kg (econômica) | 32kg (executiva)
• Excesso: $100-200 por bagagem

*Dúvidas sobre algum item específico?* 📦`,
    category: 'info'
  },

  // Follow-up
  {
    id: 'follow_up_quote',
    name: 'Follow-up Cotação',
    content: `😊 *Oi {{name}}!*

Vimos que você se interessou pela nossa cotação de {{origin}} para {{destination}}.

Tem alguma dúvida sobre:
• ✈️ Detalhes do voo
• 🏨 Hotéis no Brasil  
• 🚗 Aluguel de carros
• 🛡️ Seguro viagem

*Nossa cotação é válida até {{valid_until}}*

Estamos aqui para ajudar! 👨‍💼`,
    variables: ['name', 'origin', 'destination', 'valid_until'],
    category: 'follow_up'
  },

  {
    id: 'follow_up_abandoned',
    name: 'Carrinho Abandonado',
    content: `🤔 *Olá {{name}}!*

Vimos que você estava interessado em:
{{service_details}}

*Oferta especial para você:*
💸 **Desconto de {{discount}}%**
⏰ **Válido até {{expiry}}**

*Não perca essa oportunidade!*

Quer finalizar sua reserva? 🎫`,
    variables: ['name', 'service_details', 'discount', 'expiry'],
    category: 'follow_up'
  },

  // Emergências
  {
    id: 'emergency_support',
    name: 'Suporte Emergencial',
    content: `🚨 *SUPORTE EMERGENCIAL ATIVADO*

Olá {{name}}, entendemos que é urgente.

*Problema reportado:* {{issue}}

⚡ **AÇÃO IMEDIATA:**
• Especialista será designado em 5 minutos
• Suporte 24h ativado
• Prioridade ALTA

📞 **CONTATO DIRETO:**
• WhatsApp: Respondemos agora
• Telefone: {{phone}}
• Email: {{email}}

*Vamos resolver isso juntos!* 💪`,
    variables: ['name', 'issue', 'phone', 'email'],
    category: 'emergency'
  },

  {
    id: 'booking_confirmed',
    name: 'Reserva Confirmada',
    content: `✅ *RESERVA CONFIRMADA!*

🎉 Parabéns {{name}}! Sua viagem está confirmada.

✈️ **Detalhes da Reserva:**
• Código: {{booking_code}}
• Rota: {{route}}
• Data: {{date}}
• Passageiros: {{passengers}}

📧 **Próximos Passos:**
• Recebimento dos bilhetes por email
• Check-in online 24h antes
• Chegada no aeroporto 3h antes

*Boa viagem!* 🌟`,
    variables: ['name', 'booking_code', 'route', 'date', 'passengers'],
    category: 'info'
  },

  // Promoções
  {
    id: 'promotion_flash',
    name: 'Promoção Flash',
    content: `⚡ *PROMOÇÃO RELÂMPAGO!*

🔥 **{{discount}}% OFF** em voos EUA-Brasil!

✈️ **Exemplos:**
• Miami ↔ São Paulo: A partir de {{miami_price}}
• NY ↔ Rio de Janeiro: A partir de {{ny_price}}
• Orlando ↔ São Paulo: A partir de {{orlando_price}}

⏰ **Válido apenas até {{expiry}}**

*Corra! Vagas limitadas!* 🏃‍♂️`,
    variables: ['discount', 'miami_price', 'ny_price', 'orlando_price', 'expiry'],
    category: 'quote'
  }
];

export class WhatsAppTemplateManager {
  static getTemplate(templateId: string): WhatsAppTemplate | undefined {
    return WHATSAPP_TEMPLATES.find(template => template.id === templateId);
  }

  static renderTemplate(templateId: string, variables: Record<string, string> = {}): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let content = template.content;
    
    // Replace variables in the format {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    });

    return content;
  }

  static getTemplatesByCategory(category: WhatsAppTemplate['category']): WhatsAppTemplate[] {
    return WHATSAPP_TEMPLATES.filter(template => template.category === category);
  }

  static getPersonalizedGreeting(customerName?: string, isReturning: boolean = false): string {
    if (isReturning && customerName) {
      return this.renderTemplate('greeting_returning', { 
        name: customerName,
        destination: 'São Paulo', // This would come from customer history
        date: 'março de 2024' // This would come from customer history
      });
    }

    return this.renderTemplate('welcome');
  }

  static getQuoteTemplate(quoteData: any): string {
    if (quoteData.options && quoteData.options.length > 1) {
      return this.renderTemplate('quote_multiple', quoteData);
    }

    return this.renderTemplate('quote_ready', quoteData);
  }
}

// Class is already exported at declaration
