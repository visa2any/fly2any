// Sistema de Escalação Automática para Central de Comunicação
// Identifica e escala conversas baseado em regras inteligentes

import { OmnichannelAPI, Conversation, Message, Customer } from './omnichannel-api';
import { sql } from '@vercel/postgres';

interface EscalationRule {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  enabled: boolean;
  created_at: Date;
  trigger_count: number;
}

interface EscalationCondition {
  type: 'response_time' | 'message_count' | 'keywords' | 'customer_type' | 'channel' | 'sentiment';
  operator: '>' | '<' | '=' | 'contains' | 'not_contains';
  value: string | number;
  unit?: 'minutes' | 'hours' | 'days';
}

interface EscalationAction {
  type: 'assign_agent' | 'change_priority' | 'send_notification' | 'create_ticket' | 'auto_response';
  target?: string;
  message?: string;
  priority?: string;
}

interface EscalationEvent {
  id: string;
  conversation_id: number;
  rule_id: string;
  triggered_at: Date;
  resolved_at?: Date;
  status: 'pending' | 'in_progress' | 'resolved' | 'cancelled';
  metadata: Record<string, any>;
}

export class EscalationEngine {
  private static rules: EscalationRule[] = [
    {
      id: 'response_time_exceeded',
      name: 'Tempo de resposta excedido',
      priority: 'high',
      conditions: [
        { type: 'response_time', operator: '>', value: 30, unit: 'minutes' }
      ],
      actions: [
        { type: 'change_priority', priority: 'high' },
        { type: 'send_notification', target: 'supervisor', message: 'Conversa sem resposta por mais de 30 minutos' }
      ],
      enabled: true,
      created_at: new Date(),
      trigger_count: 0
    },
    {
      id: 'vip_customer_immediate',
      name: 'Cliente VIP - Atendimento Imediato',
      priority: 'critical',
      conditions: [
        { type: 'customer_type', operator: '=', value: 'vip' },
        { type: 'response_time', operator: '>', value: 5, unit: 'minutes' }
      ],
      actions: [
        { type: 'change_priority', priority: 'urgent' },
        { type: 'assign_agent', target: 'senior_agent' },
        { type: 'send_notification', target: 'manager', message: 'Cliente VIP aguardando atendimento' }
      ],
      enabled: true,
      created_at: new Date(),
      trigger_count: 0
    },
    {
      id: 'negative_sentiment',
      name: 'Sentimento Negativo Detectado',
      priority: 'high',
      conditions: [
        { type: 'keywords', operator: 'contains', value: 'cancelar|reclamação|insatisfeito|problema|ruim|péssimo' },
        { type: 'sentiment', operator: '<', value: 0.3 }
      ],
      actions: [
        { type: 'change_priority', priority: 'high' },
        { type: 'assign_agent', target: 'support_specialist' },
        { type: 'auto_response', message: 'Entendo sua preocupação. Um especialista entrará em contato em breve.' }
      ],
      enabled: true,
      created_at: new Date(),
      trigger_count: 0
    },
    {
      id: 'emergency_keywords',
      name: 'Palavras-chave de Emergência',
      priority: 'critical',
      conditions: [
        { type: 'keywords', operator: 'contains', value: 'emergência|urgente|ajuda|voo cancelado|perdido|acidente' }
      ],
      actions: [
        { type: 'change_priority', priority: 'urgent' },
        { type: 'assign_agent', target: 'emergency_team' },
        { type: 'send_notification', target: 'emergency_manager', message: 'Situação de emergência detectada' },
        { type: 'create_ticket', target: 'emergency_system' }
      ],
      enabled: true,
      created_at: new Date(),
      trigger_count: 0
    },
    {
      id: 'multiple_attempts',
      name: 'Múltiplas Tentativas de Contato',
      priority: 'medium',
      conditions: [
        { type: 'message_count', operator: '>', value: 5 },
        { type: 'response_time', operator: '>', value: 60, unit: 'minutes' }
      ],
      actions: [
        { type: 'change_priority', priority: 'high' },
        { type: 'send_notification', target: 'supervisor', message: 'Cliente com múltiplas tentativas sem resposta' }
      ],
      enabled: true,
      created_at: new Date(),
      trigger_count: 0
    }
  ];

  static async evaluateConversation(conversationId: number): Promise<EscalationEvent[]> {
    try {
      const conversation = await OmnichannelAPI.getConversationWithDetails(conversationId);
      if (!conversation) return [];

      const events: EscalationEvent[] = [];

      for (const rule of this.rules) {
        if (!rule.enabled) continue;

        const shouldEscalate = await this.evaluateRule(rule, conversation);
        if (shouldEscalate) {
          const event = await this.createEscalationEvent(rule, conversation);
          events.push(event);
          
          // Executar ações
          await this.executeActions(rule.actions, conversation, event);
        }
      }

      return events;
    } catch (error) {
      console.error('Error evaluating conversation for escalation:', error);
      return [];
    }
  }

  private static async evaluateRule(rule: EscalationRule, conversation: any): Promise<boolean> {
    try {
      for (const condition of rule.conditions) {
        const result = await this.evaluateCondition(condition, conversation);
        if (!result) return false; // Todas as condições devem ser verdadeiras
      }
      return true;
    } catch (error) {
      console.error('Error evaluating rule:', rule.id, error);
      return false;
    }
  }

  private static async evaluateCondition(condition: EscalationCondition, conversation: any): Promise<boolean> {
    try {
      switch (condition.type) {
        case 'response_time':
          return this.evaluateResponseTime(condition, conversation);
        
        case 'message_count':
          return this.evaluateMessageCount(condition, conversation);
        
        case 'keywords':
          return this.evaluateKeywords(condition, conversation);
        
        case 'customer_type':
          return this.evaluateCustomerType(condition, conversation);
        
        case 'channel':
          return this.evaluateChannel(condition, conversation);
        
        case 'sentiment':
          return this.evaluateSentiment(condition, conversation);
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Error evaluating condition:', condition, error);
      return false;
    }
  }

  private static evaluateResponseTime(condition: EscalationCondition, conversation: any): boolean {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage || lastMessage.direction !== 'inbound') return false;

    const now = new Date();
    const lastMessageTime = new Date(lastMessage.created_at);
    const diffMinutes = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60);

    let diffInUnit = diffMinutes;
    if (condition.unit === 'hours') {
      diffInUnit = diffMinutes / 60;
    } else if (condition.unit === 'days') {
      diffInUnit = diffMinutes / (60 * 24);
    }

    switch (condition.operator) {
      case '>':
        return diffInUnit > (condition.value as number);
      case '<':
        return diffInUnit < (condition.value as number);
      case '=':
        return Math.abs(diffInUnit - (condition.value as number)) < 0.1;
      default:
        return false;
    }
  }

  private static evaluateMessageCount(condition: EscalationCondition, conversation: any): boolean {
    const messageCount = conversation.messages.length;
    
    switch (condition.operator) {
      case '>':
        return messageCount > (condition.value as number);
      case '<':
        return messageCount < (condition.value as number);
      case '=':
        return messageCount === (condition.value as number);
      default:
        return false;
    }
  }

  private static evaluateKeywords(condition: EscalationCondition, conversation: any): boolean {
    const keywords = (condition.value as string).toLowerCase().split('|');
    const messages = conversation.messages;
    
    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      for (const keyword of keywords) {
        const found = content.includes(keyword.trim());
        
        if (condition.operator === 'contains' && found) {
          return true;
        } else if (condition.operator === 'not_contains' && found) {
          return false;
        }
      }
    }
    
    return condition.operator === 'not_contains';
  }

  private static evaluateCustomerType(condition: EscalationCondition, conversation: any): boolean {
    const customerType = conversation.customer.customer_type;
    
    switch (condition.operator) {
      case '=':
        return customerType === condition.value;
      default:
        return false;
    }
  }

  private static evaluateChannel(condition: EscalationCondition, conversation: any): boolean {
    const channel = conversation.channel;
    
    switch (condition.operator) {
      case '=':
        return channel === condition.value;
      default:
        return false;
    }
  }

  private static evaluateSentiment(condition: EscalationCondition, conversation: any): boolean {
    // Análise de sentimento simplificada
    const messages = conversation.messages.filter((m: any) => m.direction === 'inbound');
    const negativeWords = ['ruim', 'péssimo', 'horrível', 'cancelar', 'reclamação', 'insatisfeito', 'problema'];
    const positiveWords = ['bom', 'ótimo', 'excelente', 'obrigado', 'gostei', 'perfeito'];
    
    let sentiment = 0.5; // Neutro
    
    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      for (const word of negativeWords) {
        if (content.includes(word)) sentiment -= 0.1;
      }
      
      for (const word of positiveWords) {
        if (content.includes(word)) sentiment += 0.1;
      }
    }
    
    sentiment = Math.max(0, Math.min(1, sentiment));
    
    switch (condition.operator) {
      case '>':
        return sentiment > (condition.value as number);
      case '<':
        return sentiment < (condition.value as number);
      case '=':
        return Math.abs(sentiment - (condition.value as number)) < 0.1;
      default:
        return false;
    }
  }

  private static async createEscalationEvent(rule: EscalationRule, conversation: any): Promise<EscalationEvent> {
    const event: EscalationEvent = {
      id: `escalation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversation_id: conversation.id,
      rule_id: rule.id,
      triggered_at: new Date(),
      status: 'pending',
      metadata: {
        customer_id: conversation.customer.id,
        customer_type: conversation.customer.customer_type,
        channel: conversation.channel,
        original_priority: conversation.priority,
        message_count: conversation.messages.length
      }
    };

    // Salvar evento no banco de dados
    try {
      await sql`
        INSERT INTO escalation_events (id, conversation_id, rule_id, triggered_at, status, metadata)
        VALUES (${event.id}, ${event.conversation_id}, ${event.rule_id}, ${event.triggered_at.toISOString()}, ${event.status}, ${JSON.stringify(event.metadata)})
      `;
    } catch (dbError) {
      console.error('Error saving escalation event:', dbError);
    }

    // Incrementar contador da regra
    rule.trigger_count++;

    return event;
  }

  private static async executeActions(actions: EscalationAction[], conversation: any, event: EscalationEvent): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action, conversation, event);
      } catch (error) {
        console.error('Error executing action:', action, error);
      }
    }
  }

  private static async executeAction(action: EscalationAction, conversation: any, event: EscalationEvent): Promise<void> {
    switch (action.type) {
      case 'change_priority':
        await this.changePriority(conversation, action.priority!);
        break;
      
      case 'assign_agent':
        await this.assignAgent(conversation, action.target!);
        break;
      
      case 'send_notification':
        await this.sendNotification(action.target!, action.message!, conversation, event);
        break;
      
      case 'create_ticket':
        await this.createTicket(conversation, event);
        break;
      
      case 'auto_response':
        await this.sendAutoResponse(conversation, action.message!);
        break;
    }
  }

  private static async changePriority(conversation: any, priority: string): Promise<void> {
    try {
      await sql`
        UPDATE conversations 
        SET priority = ${priority}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${conversation.id}
      `;
      
      // Log da atividade
      await OmnichannelAPI.logActivity(
        conversation.id,
        0, // Sistema
        'escalation_priority_changed',
        `Prioridade alterada para ${priority} por escalação automática`
      );
    } catch (error) {
      console.error('Error changing priority:', error);
    }
  }

  private static async assignAgent(conversation: any, agentType: string): Promise<void> {
    try {
      // Buscar agente disponível do tipo especificado
      const agentResult = await sql`
        SELECT id FROM agents 
        WHERE role = ${agentType} 
        AND status = 'online' 
        AND current_conversations < max_concurrent_conversations
        ORDER BY current_conversations ASC
        LIMIT 1
      `;

      if (agentResult.rows.length > 0) {
        const agentId = agentResult.rows[0].id;
        
        await sql`
          UPDATE conversations 
          SET assigned_agent_id = ${agentId}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${conversation.id}
        `;
        
        // Log da atividade
        await OmnichannelAPI.logActivity(
          conversation.id,
          agentId,
          'escalation_agent_assigned',
          `Agente ${agentType} atribuído por escalação automática`
        );
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
    }
  }

  private static async sendNotification(target: string, message: string, conversation: any, event: EscalationEvent): Promise<void> {
    // Implementar sistema de notificações (email, slack, etc.)
    console.log(`NOTIFICATION [${target}]: ${message}`, {
      conversation_id: conversation.id,
      customer: conversation.customer.name,
      channel: conversation.channel,
      event_id: event.id
    });
  }

  private static async createTicket(conversation: any, event: EscalationEvent): Promise<void> {
    try {
      await sql`
        INSERT INTO support_tickets (conversation_id, escalation_event_id, priority, status, created_at)
        VALUES (${conversation.id}, ${event.id}, 'high', 'open', CURRENT_TIMESTAMP)
      `;
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  }

  private static async sendAutoResponse(conversation: any, message: string): Promise<void> {
    try {
      await OmnichannelAPI.createMessage({
        conversation_id: conversation.id,
        customer_id: conversation.customer.id,
        channel: conversation.channel,
        direction: 'outbound',
        content: message,
        is_automated: true,
        template_id: 'escalation_auto_response'
      });
    } catch (error) {
      console.error('Error sending auto response:', error);
    }
  }

  // Método para executar avaliações em lote
  static async runEscalationCheck(): Promise<void> {
    try {
      console.log('Running escalation check...');
      
      // Buscar conversas ativas
      const activeConversations = await OmnichannelAPI.getActiveConversations();
      
      for (const conversation of activeConversations) {
        await this.evaluateConversation(conversation.id);
      }
      
      console.log(`Escalation check completed for ${activeConversations.length} conversations`);
    } catch (error) {
      console.error('Error running escalation check:', error);
    }
  }

  // Método para obter estatísticas de escalação
  static async getEscalationStats(): Promise<{
    totalEvents: number;
    pendingEvents: number;
    resolvedEvents: number;
    ruleStats: Record<string, number>;
  }> {
    try {
      const [totalResult, pendingResult, resolvedResult] = await Promise.all([
        sql`SELECT COUNT(*) as total FROM escalation_events`,
        sql`SELECT COUNT(*) as pending FROM escalation_events WHERE status = 'pending'`,
        sql`SELECT COUNT(*) as resolved FROM escalation_events WHERE status = 'resolved'`
      ]);

      const ruleStatsResult = await sql`
        SELECT rule_id, COUNT(*) as count 
        FROM escalation_events 
        GROUP BY rule_id
      `;

      const ruleStats: Record<string, number> = {};
      ruleStatsResult.rows.forEach(row => {
        ruleStats[row.rule_id] = parseInt(row.count);
      });

      return {
        totalEvents: parseInt(totalResult.rows[0].total),
        pendingEvents: parseInt(pendingResult.rows[0].pending),
        resolvedEvents: parseInt(resolvedResult.rows[0].resolved),
        ruleStats
      };
    } catch (error) {
      console.error('Error getting escalation stats:', error);
      return {
        totalEvents: 0,
        pendingEvents: 0,
        resolvedEvents: 0,
        ruleStats: {}
      };
    }
  }
}

// Exportar para uso em cron jobs ou webhooks
export default EscalationEngine;