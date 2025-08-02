/**
 * 🤖 Sistema Inteligente de Follow-up WhatsApp
 * 
 * Automatiza follow-ups baseados no comportamento e intenção do lead:
 * - Follow-up para leads com dados incompletos
 * - Lembretes para cotações não respondidas
 * - Nurturing para leads frios
 * - Campanhas de reativação
 */

import { sql } from '@vercel/postgres';
import { whatsappService } from './whatsapp';

interface FollowUpRule {
  id: string;
  name: string;
  trigger: {
    condition: string;
    timeframe: string; // '1h', '24h', '3d', '1w'
    priority: 'low' | 'medium' | 'high';
  };
  message: {
    template: string;
    variables?: Record<string, string>;
  };
  schedule: {
    delay: string; // Tempo para enviar após trigger
    maxAttempts: number;
    intervalBetweenAttempts: string;
  };
}

export class WhatsAppFollowUpSystem {
  
  // Regras de follow-up predefinidas
  private static readonly FOLLOW_UP_RULES: FollowUpRule[] = [
    {
      id: 'incomplete_lead_info',
      name: 'Dados Incompletos - Solicitar Mais Informações',
      trigger: {
        condition: 'lead_created_with_low_confidence',
        timeframe: '30m',
        priority: 'high'
      },
      message: {
        template: `🧳 Oi {{nome}}! Vi que você tem interesse em viajar!

Para preparar uma cotação personalizada, ainda preciso de algumas informações:

{{missing_info}}

Pode me ajudar com esses detalhes? Assim consigo encontrar as melhores opções para você! ✈️`,
        variables: {
          nome: 'Cliente',
          missing_info: 'informações sobre a viagem'
        }
      },
      schedule: {
        delay: '30m',
        maxAttempts: 2,
        intervalBetweenAttempts: '2h'
      }
    },
    
    {
      id: 'quote_follow_up',
      name: 'Follow-up de Cotação Enviada',
      trigger: {
        condition: 'quote_sent_no_response',
        timeframe: '4h',
        priority: 'medium'
      },
      message: {
        template: `💰 Oi {{nome}}! Enviei uma cotação para sua viagem {{origem}} → {{destino}}.

Teve chance de analisar? Posso esclarecer alguma dúvida ou ajustar algo?

🎯 Lembre-se: nossos preços são válidos por tempo limitado!

Quer falar comigo agora? 😊`
      },
      schedule: {
        delay: '4h',
        maxAttempts: 3,
        intervalBetweenAttempts: '24h'
      }
    },
    
    {
      id: 'cold_lead_reactivation',
      name: 'Reativação de Lead Frio',
      trigger: {
        condition: 'no_interaction_3_days',
        timeframe: '3d',
        priority: 'low'
      },
      message: {
        template: `🌟 Oi {{nome}}! Tudo bem?

Vi que você teve interesse em viajar para {{destino}}. Que tal retomar esse plano?

✨ **Novidades para você:**
• 🎯 Promoções especiais Brasil-EUA
• ✈️ Novas rotas disponíveis  
• 💰 Parcelamento facilitado

Quer uma nova cotação atualizada? 🚀`
      },
      schedule: {
        delay: '3d',
        maxAttempts: 2,
        intervalBetweenAttempts: '1w'
      }
    },
    
    {
      id: 'booking_abandonment',
      name: 'Abandono no Processo de Reserva',
      trigger: {
        condition: 'booking_started_not_completed',
        timeframe: '1h',
        priority: 'high'
      },
      message: {
        template: `⏰ Oi {{nome}}! Notei que você começou uma reserva mas não finalizou.

Aconteceu algum problema? Posso te ajudar a completar:

✅ **Sua reserva:**
📍 {{origem}} → {{destino}}
📅 {{data_partida}}
👥 {{passageiros}} passageiro(s)

🔒 **Seus dados estão salvos** - é só finalizar!

Precisa de ajuda? Estou aqui! 💬`
      },
      schedule: {
        delay: '1h',
        maxAttempts: 2,
        intervalBetweenAttempts: '6h'
      }
    },
    
    {
      id: 'travel_date_reminder',
      name: 'Lembrete Próximo à Data de Viagem',
      trigger: {
        condition: 'travel_date_approaching',
        timeframe: '7d',
        priority: 'high'
      },
      message: {
        template: `📅 Oi {{nome}}! Sua viagem para {{destino}} está chegando!

🗓️ **Data:** {{data_partida}} (em {{days_until}} dias)

Ainda não reservou? ⚠️ **ATENÇÃO:**
• Preços sobem próximo à data
• Disponibilidade limitada
• Documentação pode demorar

🚨 **Ação recomendada:** Reserve HOJE para garantir seu lugar!

Posso ajudar agora? 🛫`
      },
      schedule: {
        delay: '7d',
        maxAttempts: 3,
        intervalBetweenAttempts: '2d'
      }
    },
    
    {
      id: 'seasonal_campaign',
      name: 'Campanha Sazonal Personalizada',
      trigger: {
        condition: 'seasonal_interest_match',
        timeframe: '1d',
        priority: 'medium'
      },
      message: {
        template: `🎉 {{nome}}, temos uma SUPER PROMOÇÃO para {{destino}}!

🔥 **OFERTA ESPECIAL {{season}}:**
✈️ {{origem}} → {{destino}}
💰 A partir de {{price_from}}
🗓️ Válida até {{offer_deadline}}

{{season_benefits}}

⚡ **ÚLTIMAS VAGAS** - Garante já!

Quer saber mais? 🎯`
      },
      schedule: {
        delay: '1d',
        maxAttempts: 1,
        intervalBetweenAttempts: '0'
      }
    }
  ];

  /**
   * Processa follow-ups pendentes
   */
  public static async processScheduledFollowUps(): Promise<{
    processed: number;
    sent: number;
    failed: number;
    details: any[];
  }> {
    try {
      console.log('🤖 Iniciando processamento de follow-ups WhatsApp...');
      
      // Buscar follow-ups agendados e vencidos
      const pendingFollowUps = await this.getPendingFollowUps();
      console.log(`📋 Encontrados ${pendingFollowUps.length} follow-ups pendentes`);
      
      let sent = 0;
      let failed = 0;
      const details = [];
      
      for (const followUp of pendingFollowUps) {
        try {
          const success = await this.sendFollowUpMessage(followUp);
          
          if (success) {
            sent++;
            await this.markFollowUpAsSent(followUp.id);
            console.log(`✅ Follow-up enviado: ${followUp.rule_id} para ${followUp.phone}`);
          } else {
            failed++;
            await this.markFollowUpAsFailed(followUp.id);
            console.log(`❌ Falha no follow-up: ${followUp.rule_id} para ${followUp.phone}`);
          }
          
          details.push({
            id: followUp.id,
            rule: followUp.rule_id,
            phone: followUp.phone,
            success,
            sentAt: new Date().toISOString()
          });
          
        } catch (error) {
          failed++;
          console.error(`❌ Erro no follow-up ${followUp.id}:`, error);
          
          details.push({
            id: followUp.id,
            rule: followUp.rule_id,
            phone: followUp.phone,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        // Pequena pausa entre envios
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`📊 Follow-ups processados: ${sent} enviados, ${failed} falharam`);
      
      return {
        processed: pendingFollowUps.length,
        sent,
        failed,
        details
      };
      
    } catch (error) {
      console.error('❌ Erro no processamento de follow-ups:', error);
      throw error;
    }
  }

  /**
   * Agenda um novo follow-up
   */
  public static async scheduleFollowUp(
    ruleId: string,
    phone: string,
    leadData: any,
    triggerData?: any
  ): Promise<boolean> {
    try {
      const rule = this.FOLLOW_UP_RULES.find(r => r.id === ruleId);
      if (!rule) {
        console.error(`❌ Regra de follow-up não encontrada: ${ruleId}`);
        return false;
      }
      
      // Calcular quando enviar
      const scheduledFor = this.calculateScheduledTime(rule.schedule.delay);
      
      // Salvar no banco
      await sql`
        INSERT INTO whatsapp_followups (
          rule_id, phone, lead_data, trigger_data, 
          scheduled_for, max_attempts, status
        ) VALUES (
          ${ruleId}, ${phone}, ${JSON.stringify(leadData)}, 
          ${JSON.stringify(triggerData || {})}, ${scheduledFor.toISOString()}, 
          ${rule.schedule.maxAttempts}, 'pending'
        )
      `;
      
      console.log(`📅 Follow-up agendado: ${ruleId} para ${phone} em ${scheduledFor.toISOString()}`);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao agendar follow-up:', error);
      return false;
    }
  }

  /**
   * Busca follow-ups pendentes para envio
   */
  private static async getPendingFollowUps(): Promise<any[]> {
    try {
      const result = await sql`
        SELECT * FROM whatsapp_followups 
        WHERE status = 'pending' 
          AND scheduled_for <= CURRENT_TIMESTAMP
          AND attempts < max_attempts
        ORDER BY scheduled_for ASC
        LIMIT 50
      `;
      
      return result.rows;
    } catch (error) {
      // Se tabela não existe, criar
      await this.createFollowUpTable();
      return [];
    }
  }

  /**
   * Envia mensagem de follow-up
   */
  private static async sendFollowUpMessage(followUp: any): Promise<boolean> {
    try {
      const rule = this.FOLLOW_UP_RULES.find(r => r.id === followUp.rule_id);
      if (!rule) return false;
      
      const leadData = JSON.parse(followUp.lead_data || '{}');
      const triggerData = JSON.parse(followUp.trigger_data || '{}');
      
      // Personalizar mensagem
      const message = this.personalizeMessage(rule.message.template, {
        ...leadData,
        ...triggerData,
        ...rule.message.variables
      });
      
      // Enviar via WhatsApp
      const success = await whatsappService.sendMessage(followUp.phone, message);
      
      if (success) {
        // Atualizar contador de tentativas
        await sql`
          UPDATE whatsapp_followups 
          SET attempts = attempts + 1, last_sent_at = CURRENT_TIMESTAMP
          WHERE id = ${followUp.id}
        `;
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Erro ao enviar follow-up:', error);
      return false;
    }
  }

  /**
   * Personaliza mensagem com variáveis
   */
  private static personalizeMessage(template: string, variables: Record<string, any>): string {
    let message = template;
    
    // Substituir variáveis {{variavel}}
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      message = message.replace(placeholder, String(value || ''));
    });
    
    // Gerar informações dinâmicas
    message = message.replace(/\\{\\{missing_info\\}\\}/g, () => {
      const missing = [];
      if (!variables.origem) missing.push('📍 Cidade de origem');
      if (!variables.destino) missing.push('🎯 Cidade de destino');
      if (!variables.dataPartida) missing.push('📅 Data da viagem');
      if (!variables.numeroPassageiros) missing.push('👥 Número de passageiros');
      
      return missing.length > 0 ? missing.join('\\n') : 'mais detalhes sobre sua viagem';
    });
    
    message = message.replace(/\\{\\{days_until\\}\\}/g, () => {
      if (variables.dataPartida) {
        const travelDate = new Date(variables.dataPartida);
        const today = new Date();
        const diffTime = travelDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return String(Math.max(0, diffDays));
      }
      return '?';
    });
    
    return message;
  }

  /**
   * Marca follow-up como enviado
   */
  private static async markFollowUpAsSent(followUpId: string): Promise<void> {
    await sql`
      UPDATE whatsapp_followups 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP
      WHERE id = ${followUpId}
    `;
  }

  /**
   * Marca follow-up como falhou
   */
  private static async markFollowUpAsFailed(followUpId: string): Promise<void> {
    await sql`
      UPDATE whatsapp_followups 
      SET status = 'failed', failed_at = CURRENT_TIMESTAMP
      WHERE id = ${followUpId}
    `;
  }

  /**
   * Calcula quando agendar baseado no delay
   */
  private static calculateScheduledTime(delay: string): Date {
    const now = new Date();
    const match = delay.match(/^(\d+)([mhdw])$/);
    
    if (!match) return now;
    
    const [, amount, unit] = match;
    const numAmount = parseInt(amount);
    
    switch (unit) {
      case 'm': // minutos
        return new Date(now.getTime() + numAmount * 60 * 1000);
      case 'h': // horas
        return new Date(now.getTime() + numAmount * 60 * 60 * 1000);
      case 'd': // dias
        return new Date(now.getTime() + numAmount * 24 * 60 * 60 * 1000);
      case 'w': // semanas
        return new Date(now.getTime() + numAmount * 7 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  /**
   * Cria tabela de follow-ups se não existir
   */
  private static async createFollowUpTable(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS whatsapp_followups (
          id SERIAL PRIMARY KEY,
          rule_id VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          lead_data JSONB,
          trigger_data JSONB,
          scheduled_for TIMESTAMP NOT NULL,
          max_attempts INTEGER DEFAULT 1,
          attempts INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'pending',
          sent_at TIMESTAMP,
          failed_at TIMESTAMP,
          last_sent_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Índices para performance
      await sql`CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_scheduled ON whatsapp_followups(scheduled_for, status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_phone ON whatsapp_followups(phone)`;
      
      console.log('✅ Tabela whatsapp_followups criada');
    } catch (error) {
      console.error('❌ Erro ao criar tabela de follow-ups:', error);
    }
  }

  /**
   * Cancela follow-ups para um telefone
   */
  public static async cancelFollowUps(phone: string, reason?: string): Promise<void> {
    await sql`
      UPDATE whatsapp_followups 
      SET status = 'cancelled', 
          updated_at = CURRENT_TIMESTAMP,
          cancel_reason = ${reason || 'Manual cancellation'}
      WHERE phone = ${phone} 
        AND status = 'pending'
    `;
    
    console.log(`🚫 Follow-ups cancelados para ${phone}: ${reason || 'Manual'}`);
  }

  /**
   * Estatísticas de follow-up
   */
  public static async getFollowUpStats(): Promise<any> {
    try {
      const stats = await sql`
        SELECT 
          rule_id,
          status,
          COUNT(*) as count,
          AVG(attempts) as avg_attempts
        FROM whatsapp_followups 
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY rule_id, status
        ORDER BY rule_id, status
      `;
      
      return {
        byRule: stats.rows,
        summary: {
          total: stats.rows.reduce((acc, row) => acc + parseInt(row.count), 0),
          sent: stats.rows.filter(r => r.status === 'sent').reduce((acc, row) => acc + parseInt(row.count), 0),
          pending: stats.rows.filter(r => r.status === 'pending').reduce((acc, row) => acc + parseInt(row.count), 0),
          failed: stats.rows.filter(r => r.status === 'failed').reduce((acc, row) => acc + parseInt(row.count), 0)
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return { byRule: [], summary: { total: 0, sent: 0, pending: 0, failed: 0 } };
    }
  }
}

/**
 * Função utilitária para agendar follow-up após criação de lead
 */
export async function scheduleLeadFollowUp(leadData: any, confidence: number): Promise<void> {
  try {
    const phone = leadData.whatsapp || leadData.telefone;
    if (!phone) return;
    
    // Follow-up para dados incompletos
    if (confidence < 60) {
      await WhatsAppFollowUpSystem.scheduleFollowUp(
        'incomplete_lead_info',
        phone,
        leadData,
        { confidence, triggeredBy: 'low_confidence_lead' }
      );
    }
    
    // Follow-up de cotação se dados completos
    if (confidence >= 60) {
      await WhatsAppFollowUpSystem.scheduleFollowUp(
        'quote_follow_up',
        phone,
        leadData,
        { confidence, triggeredBy: 'complete_lead_data' }
      );
    }
    
  } catch (error) {
    console.error('❌ Erro ao agendar follow-up do lead:', error);
  }
}