// Sistema de Automação Inteligente - Detecção de Intent e Respostas Contextuais
// IA para classificação automática de mensagens e roteamento inteligente

export interface Intent {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  patterns: RegExp[];
  confidence_threshold: number;
  category: 'sales' | 'support' | 'billing' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  auto_response?: string;
  routing_rules?: {
    department?: string;
    agent_skills?: string[];
    escalate_after?: number; // minutes
  };
}

export interface IntentDetectionResult {
  intent: Intent | null;
  confidence: number;
  extracted_entities: Record<string, string>;
  suggested_response?: string;
  routing_recommendation?: {
    department: string;
    agent_skills: string[];
    priority: string;
  };
}

export interface CustomerContext {
  id: number;
  type: 'prospect' | 'customer' | 'vip';
  previous_purchases: boolean;
  last_interaction_date?: Date;
  preferred_language: string;
  timezone: string;
  conversation_history: Array<{
    channel: string;
    last_message: string;
    resolved: boolean;
    satisfaction?: number;
  }>;
}

// Base de conhecimento de intents
const INTENT_DATABASE: Intent[] = [
  // VENDAS / COTAÇÕES
  {
    id: 'flight_quote_request',
    name: 'Solicitação de Cotação de Voo',
    description: 'Cliente solicitando cotação para voos',
    keywords: ['cotação', 'preço', 'valor', 'quanto custa', 'passagem', 'voo', 'bilhete', 'ticket'],
    patterns: [
      /quero.*cota[çc][ãa]o/i,
      /quanto.*custa.*voo/i,
      /pre[çc]o.*passagem/i,
      /bilhete.*para/i,
      /voo.*de.*para/i
    ],
    confidence_threshold: 0.7,
    category: 'sales',
    priority: 'high',
    auto_response: `✈️ Perfeito! Para uma cotação personalizada, preciso de:

📍 Origem e destino
📅 Datas de ida e volta  
👥 Número de passageiros
🎫 Classe preferida (econômica/executiva)

🚀 Cotação gratuita em até 2h!
💬 Continue aqui ou WhatsApp: (555) 123-4567`,
    routing_rules: {
      department: 'sales',
      agent_skills: ['sales', 'booking', 'pricing']
    }
  },

  {
    id: 'destination_inquiry',
    name: 'Consulta sobre Destinos',
    description: 'Cliente perguntando sobre destinos disponíveis',
    keywords: ['destinos', 'onde voam', 'cidades', 'rotas', 'lugares'],
    patterns: [
      /quais.*destinos/i,
      /voam.*para.*onde/i,
      /cidades.*atendem/i,
      /rotas.*dispon[íi]veis/i
    ],
    confidence_threshold: 0.6,
    category: 'sales',
    priority: 'normal',
    auto_response: `🌎 Voamos para principais destinos EUA-Brasil:

🇺🇸 Estados Unidos:
• Miami, Orlando, New York
• Los Angeles, Chicago, Dallas

🇧🇷 Brasil:  
• São Paulo, Rio de Janeiro
• Brasília, Salvador, Recife

✈️ Quer uma cotação específica?
📱 Continue aqui ou WhatsApp: (555) 123-4567`,
    routing_rules: {
      department: 'sales',
      agent_skills: ['sales', 'destinations']
    }
  },

  // SUPORTE TÉCNICO
  {
    id: 'booking_modification',
    name: 'Alteração de Reserva',
    description: 'Cliente quer alterar/cancelar reserva existente',
    keywords: ['alterar', 'cancelar', 'remarcar', 'trocar data', 'mudar voo', 'modificar'],
    patterns: [
      /alterar.*reserva/i,
      /cancelar.*voo/i,
      /remarcar.*passagem/i,
      /trocar.*data/i,
      /modificar.*bilhete/i
    ],
    confidence_threshold: 0.8,
    category: 'support',
    priority: 'high',
    auto_response: `🔄 Entendi que precisa alterar sua reserva.

Para agilizar, tenha em mãos:
🎫 Número da reserva/localizador
📧 Email usado na compra
📅 Nova data desejada

⚠️ Alterações podem ter taxas
💬 Um especialista te ajudará agora!`,
    routing_rules: {
      department: 'support',
      agent_skills: ['booking_changes', 'customer_service'],
      escalate_after: 5
    }
  },

  {
    id: 'flight_status',
    name: 'Status do Voo',
    description: 'Cliente consultando status/horário do voo',
    keywords: ['status', 'horário', 'atraso', 'cancelado', 'confirmado', 'portão'],
    patterns: [
      /status.*voo/i,
      /hor[áa]rio.*voo/i,
      /voo.*atrasado/i,
      /foi.*cancelado/i,
      /confirmado.*voo/i
    ],
    confidence_threshold: 0.7,
    category: 'support',
    priority: 'urgent',
    auto_response: `✈️ Vou verificar o status do seu voo!

Por favor, informe:
🎫 Número do voo (ex: FLY123)
📅 Data do voo
🛫 Origem → Destino

📱 Também pode consultar em: flycompany.com/status
⚡ Status em tempo real!`,
    routing_rules: {
      department: 'support',
      agent_skills: ['flight_ops', 'real_time_support']
    }
  },

  // FINANCEIRO / PAGAMENTO
  {
    id: 'payment_issue',
    name: 'Problema com Pagamento',
    description: 'Cliente com dificuldades no pagamento',
    keywords: ['pagamento', 'cartão', 'recusado', 'erro', 'cobrança', 'fatura'],
    patterns: [
      /problema.*pagamento/i,
      /cart[ãa]o.*recusado/i,
      /erro.*pagamento/i,
      /cobran[çc]a.*errada/i,
      /n[ãa]o.*consegui.*pagar/i
    ],
    confidence_threshold: 0.8,
    category: 'billing',
    priority: 'high',
    auto_response: `💳 Entendo sua dificuldade com o pagamento.

Nosso especialista financeiro vai ajudar com:
✅ Validação de cartão
✅ Parcelamento disponível  
✅ Métodos alternativos
✅ Resolução de cobranças

🔒 Atendimento seguro e confidencial
💬 Conectando com especialista...`,
    routing_rules: {
      department: 'billing',
      agent_skills: ['payments', 'billing', 'finance'],
      escalate_after: 3
    }
  },

  {
    id: 'refund_request',
    name: 'Solicitação de Reembolso',
    description: 'Cliente solicitando reembolso',
    keywords: ['reembolso', 'estorno', 'devolução', 'cancelamento', 'dinheiro de volta'],
    patterns: [
      /quero.*reembolso/i,
      /estorno.*cart[ãa]o/i,
      /devolu[çc][ãa]o.*dinheiro/i,
      /cancelar.*e.*reembolsar/i
    ],
    confidence_threshold: 0.9,
    category: 'billing',
    priority: 'high',
    auto_response: `💰 Solicitação de reembolso recebida.

Para processar, preciso de:
🎫 Número da reserva
📧 Email da compra
📅 Motivo do cancelamento
💳 Dados do cartão (últimos 4 dígitos)

⏱️ Prazo: 7-10 dias úteis
📋 Sujeito às políticas da tarifa`,
    routing_rules: {
      department: 'billing',
      agent_skills: ['refunds', 'billing', 'policy'],
      escalate_after: 2
    }
  },

  // GERAL / INFORMAÇÕES
  {
    id: 'general_greeting',
    name: 'Saudação Geral',
    description: 'Mensagens de saudação e primeiro contato',
    keywords: ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi'],
    patterns: [
      /^(oi|ol[áa]|bom\s+dia|boa\s+tarde|boa\s+noite)$/i,
      /^(hello|hi|hey)$/i
    ],
    confidence_threshold: 0.5,
    category: 'general',
    priority: 'normal',
    auto_response: `🛫 Olá! Bem-vindo à Fly2Any!

✈️ Especialistas em voos EUA ↔ Brasil
🎯 Como posso ajudar hoje?

🚀 Principais serviços:
• Cotações personalizadas
• Alterações de reserva  
• Suporte 24/7
• Check-in online

💬 Continue aqui ou WhatsApp: (555) 123-4567`,
    routing_rules: {
      department: 'sales',
      agent_skills: ['customer_service', 'general']
    }
  },

  {
    id: 'company_info',
    name: 'Informações da Empresa',
    description: 'Cliente perguntando sobre a empresa',
    keywords: ['empresa', 'quem são', 'confiável', 'seguro', 'licença', 'sobre'],
    patterns: [
      /sobre.*empresa/i,
      /quem.*s[ãa]o.*voc[êe]s/i,
      /empresa.*confi[áa]vel/i,
      /[ée].*seguro/i
    ],
    confidence_threshold: 0.6,
    category: 'general',
    priority: 'normal',
    auto_response: `🏢 Sobre a Fly2Any:

✅ +10 anos no mercado
✅ Licenciada IATA 
✅ +50.000 clientes satisfeitos
✅ Especialistas EUA-Brasil
✅ Suporte 24/7 em português

🏆 Prêmios:
• Melhor Agência Online 2023
• Excelência em Atendimento

🔒 100% Seguro - Pagamento protegido
📞 SAC: (555) 123-4567`,
    routing_rules: {
      department: 'sales',
      agent_skills: ['company_info', 'sales']
    }
  }
];

// Classe principal para detecção de intent
export class SmartAutomationEngine {
  
  // Detectar intent da mensagem
  static detectIntent(message: string, customerContext?: CustomerContext): IntentDetectionResult {
    const normalizedMessage = this.normalizeMessage(message);
    let bestMatch: { intent: Intent; confidence: number } | null = null;
    
    // Avaliar cada intent
    for (const intent of INTENT_DATABASE) {
      const confidence = this.calculateIntentConfidence(normalizedMessage, intent, customerContext);
      
      if (confidence >= intent.confidence_threshold) {
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence };
        }
      }
    }
    
    if (!bestMatch) {
      return {
        intent: null,
        confidence: 0,
        extracted_entities: {},
        suggested_response: this.getGenericResponse(customerContext),
        routing_recommendation: {
          department: 'sales',
          agent_skills: ['general'],
          priority: 'normal'
        }
      };
    }
    
    const entities = this.extractEntities(normalizedMessage, bestMatch.intent);
    const suggestedResponse = this.generateContextualResponse(bestMatch.intent, entities, customerContext);
    
    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      extracted_entities: entities,
      suggested_response: suggestedResponse,
      routing_recommendation: bestMatch.intent.routing_rules ? {
        department: bestMatch.intent.routing_rules.department || 'sales',
        agent_skills: bestMatch.intent.routing_rules.agent_skills || ['general'],
        priority: bestMatch.intent.priority
      } : undefined
    };
  }
  
  // Normalizar mensagem para análise
  private static normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }
  
  // Calcular confiança do intent
  private static calculateIntentConfidence(message: string, intent: Intent, context?: CustomerContext): number {
    let confidence = 0;
    
    // Pontuação por palavras-chave
    const keywordMatches = intent.keywords.filter(keyword => 
      message.includes(keyword.toLowerCase())
    ).length;
    
    const keywordScore = (keywordMatches / intent.keywords.length) * 0.6;
    confidence += keywordScore;
    
    // Pontuação por padrões regex
    const patternMatches = intent.patterns.filter(pattern => 
      pattern.test(message)
    ).length;
    
    const patternScore = (patternMatches / intent.patterns.length) * 0.3;
    confidence += patternScore;
    
    // Boost baseado no contexto do cliente
    if (context) {
      confidence += this.getContextualBoost(intent, context);
    }
    
    return Math.min(confidence, 1.0);
  }
  
  // Boost contextual baseado no perfil do cliente
  private static getContextualBoost(intent: Intent, context: CustomerContext): number {
    let boost = 0;
    
    // Cliente VIP tem prioridade
    if (context.type === 'vip' && intent.priority === 'high') {
      boost += 0.1;
    }
    
    // Histórico de compras influencia intents de vendas
    if (context.previous_purchases && intent.category === 'sales') {
      boost += 0.05;
    }
    
    // Interações recentes influenciam intent de suporte
    if (context.last_interaction_date) {
      const daysSinceLastInteraction = Math.floor(
        (Date.now() - context.last_interaction_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastInteraction <= 7 && intent.category === 'support') {
        boost += 0.05;
      }
    }
    
    // Histórico de problemas não resolvidos
    const unresolvedIssues = context.conversation_history.filter(h => !h.resolved).length;
    if (unresolvedIssues > 0 && intent.category === 'support') {
      boost += 0.1;
    }
    
    return boost;
  }
  
  // Extrair entidades da mensagem
  private static extractEntities(message: string, intent: Intent): Record<string, string> {
    const entities: Record<string, string> = {};
    
    // Extrair datas
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g, // DD/MM/YYYY
      /(próxim[ao])\s+(segunda|terça|quarta|quinta|sexta|sábado|domingo)/gi,
      /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/gi
    ];
    
    datePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.date = matches[0];
      }
    });
    
    // Extrair cidades/destinos
    const cityPatterns = [
      /(são paulo|sp|rio de janeiro|rj|brasília|bsb|salvador|recife|fortaleza)/gi,
      /(miami|orlando|new york|nyc|los angeles|la|chicago|dallas)/gi
    ];
    
    cityPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        entities.destination = matches[0];
      }
    });
    
    // Extrair números (passageiros, valores, etc.)
    const numberPattern = /(\d+)\s*(passageiros?|pessoas?|adultos?)/gi;
    const numberMatch = message.match(numberPattern);
    if (numberMatch) {
      entities.passengers = numberMatch[0];
    }
    
    // Extrair localizador de reserva
    const locatorPattern = /[A-Z0-9]{6}/g;
    const locatorMatch = message.match(locatorPattern);
    if (locatorMatch && intent.category === 'support') {
      entities.booking_reference = locatorMatch[0];
    }
    
    return entities;
  }
  
  // Gerar resposta contextual
  private static generateContextualResponse(intent: Intent, entities: Record<string, string>, context?: CustomerContext): string {
    let response = intent.auto_response || '';
    
    // Personalizar por tipo de cliente
    if (context) {
      if (context.type === 'vip') {
        response = `👑 ${context.type.toUpperCase()} CLIENT\n\n` + response;
      }
      
      // Adicionar saudação personalizada baseada no horário/timezone
      const greeting = this.getTimeBasedGreeting(context.timezone, context.preferred_language);
      if (intent.id === 'general_greeting') {
        response = greeting + '\n\n' + response;
      }
    }
    
    // Substituir placeholders com entidades extraídas
    Object.entries(entities).forEach(([key, value]) => {
      response = response.replace(`{{${key}}}`, value);
    });
    
    return response;
  }
  
  // Resposta genérica quando não há intent detectado
  private static getGenericResponse(context?: CustomerContext): string {
    const baseResponse = `🤖 Olá! Não entendi perfeitamente sua solicitação.

📞 Para melhor atendimento:
• WhatsApp: (555) 123-4567
• Email: support@fly2any.com
• Chat ao vivo: disponível agora

🔍 Ou tente perguntar sobre:
• Cotação de voos
• Alteração de reserva
• Status do voo
• Informações gerais`;

    if (context?.type === 'vip') {
      return `👑 CLIENTE VIP\n\n` + baseResponse + `\n\n⚡ Prioridade máxima no atendimento!`;
    }
    
    return baseResponse;
  }
  
  // Saudação baseada no horário
  private static getTimeBasedGreeting(timezone: string, language: string): string {
    const now = new Date();
    const hour = parseInt(now.toLocaleString('en-US', { 
      timeZone: timezone, 
      hour12: false, 
      hour: 'numeric' 
    }));
    
    if (language === 'pt-BR') {
      if (hour >= 5 && hour < 12) return '🌅 Bom dia';
      if (hour >= 12 && hour < 18) return '☀️ Boa tarde';
      return '🌙 Boa noite';
    } else {
      if (hour >= 5 && hour < 12) return '🌅 Good morning';
      if (hour >= 12 && hour < 18) return '☀️ Good afternoon';
      return '🌙 Good evening';
    }
  }
  
  // Verificar se deve escalar para agente humano
  static shouldEscalateToHuman(intent: Intent, confidence: number, context?: CustomerContext): boolean {
    // Sempre escalar para VIPs com problemas
    if (context?.type === 'vip' && intent.category === 'support') {
      return true;
    }
    
    // Escalar intents de alta prioridade
    if (intent.priority === 'urgent') {
      return true;
    }
    
    // Escalar se confiança for baixa
    if (confidence < 0.6) {
      return true;
    }
    
    // Escalar problemas financeiros/reembolsos
    if (intent.category === 'billing') {
      return true;
    }
    
    // Escalar se cliente tem histórico de problemas não resolvidos
    if (context?.conversation_history) {
      const unresolvedIssues = context.conversation_history.filter(h => !h.resolved).length;
      if (unresolvedIssues >= 2) {
        return true;
      }
    }
    
    return false;
  }
  
  // Obter lista de todos os intents disponíveis
  static getAllIntents(): Intent[] {
    return [...INTENT_DATABASE];
  }
  
  // Buscar intents por categoria
  static getIntentsByCategory(category: Intent['category']): Intent[] {
    return INTENT_DATABASE.filter(intent => intent.category === category);
  }
  
  // Treinar/adicionar novo intent (para futuro machine learning)
  static addIntent(intent: Intent): void {
    INTENT_DATABASE.push(intent);
  }
  
  // Atualizar intent existente
  static updateIntent(intentId: string, updates: Partial<Intent>): boolean {
    const index = INTENT_DATABASE.findIndex(intent => intent.id === intentId);
    if (index === -1) return false;
    
    INTENT_DATABASE[index] = { ...INTENT_DATABASE[index], ...updates };
    return true;
  }
}

export default SmartAutomationEngine;