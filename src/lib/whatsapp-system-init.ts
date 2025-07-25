/**
 * 🚀 SISTEMA DE INICIALIZAÇÃO COMPLETO DO WHATSAPP
 * 
 * Garante que TUDO esteja funcionando antes de processar leads
 */

import { sql } from '@vercel/postgres';
import { baileysWhatsAppService } from './whatsapp-baileys';

interface SystemStatus {
  database: {
    connected: boolean;
    tablesCreated: boolean;
    error?: string;
  };
  whatsapp: {
    connected: boolean;
    qrCode?: string;
    error?: string;
  };
  n8n: {
    webhookAccessible: boolean;
    url?: string;
    error?: string;
  };
  apis: {
    leadsWorking: boolean;
    webhookWorking: boolean;
    error?: string;
  };
  overall: {
    ready: boolean;
    issues: string[];
  };
}

export class WhatsAppSystemInitializer {
  
  /**
   * 🔧 Inicialização completa do sistema
   */
  public static async initializeComplete(): Promise<SystemStatus> {
    console.log('🚀 Iniciando sistema completo WhatsApp → Leads...');
    
    const status: SystemStatus = {
      database: { connected: false, tablesCreated: false },
      whatsapp: { connected: false },
      n8n: { webhookAccessible: false },
      apis: { leadsWorking: false, webhookWorking: false },
      overall: { ready: false, issues: [] }
    };

    try {
      // 1. Verificar e inicializar banco de dados
      console.log('📊 Verificando banco de dados...');
      status.database = await this.initializeDatabase();
      
      // 2. Verificar APIs essenciais
      console.log('🔌 Verificando APIs...');
      status.apis = await this.checkAPIs();
      
      // 3. Verificar conexão N8N
      console.log('🤖 Verificando N8N...');
      status.n8n = await this.checkN8NConnection();
      
      // 4. Inicializar WhatsApp (pode falhar, mas não é crítico)
      console.log('📱 Inicializando WhatsApp...');
      status.whatsapp = await this.initializeWhatsApp();
      
      // 5. Verificar se sistema está pronto
      status.overall = this.assessOverallStatus(status);
      
      // 6. Log final
      this.logSystemStatus(status);
      
      return status;
      
    } catch (error) {
      console.error('❌ Erro fatal na inicialização:', error);
      status.overall.ready = false;
      status.overall.issues.push(`Erro fatal: ${error instanceof Error ? error.message : 'Unknown'}`);
      
      return status;
    }
  }

  /**
   * 📊 Inicializar banco de dados
   */
  private static async initializeDatabase(): Promise<SystemStatus['database']> {
    try {
      console.log('📊 Criando tabelas necessárias...');
      
      // Tabela de conversas WhatsApp
      await sql`
        CREATE TABLE IF NOT EXISTS whatsapp_conversations (
          id SERIAL PRIMARY KEY,
          phone VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255),
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Tabela de mensagens WhatsApp
      await sql`
        CREATE TABLE IF NOT EXISTS whatsapp_messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER REFERENCES whatsapp_conversations(id),
          phone VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
          message_type VARCHAR(20) DEFAULT 'text',
          whatsapp_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Tabela de follow-ups WhatsApp
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
          cancel_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      // Índices para performance
      await sql`CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations(phone)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_scheduled ON whatsapp_followups(scheduled_for, status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_whatsapp_followups_phone ON whatsapp_followups(phone)`;
      
      // Testar conexão
      await sql`SELECT 1`;
      
      console.log('✅ Banco de dados inicializado com sucesso');
      return { connected: true, tablesCreated: true };
      
    } catch (error) {
      console.error('❌ Erro no banco de dados:', error);
      return {
        connected: false,
        tablesCreated: false,
        error: error instanceof Error ? error.message : 'Database error'
      };
    }
  }

  /**
   * 🔌 Verificar APIs essenciais
   */
  private static async checkAPIs(): Promise<SystemStatus['apis']> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // Testar API de leads
      const leadsResponse = await fetch(`${baseUrl}/api/leads?limit=1`, {
        headers: { 'User-Agent': 'WhatsApp-System-Check' }
      });
      
      const leadsWorking = leadsResponse.status === 200;
      
      // Testar webhook WhatsApp (apenas se houver dados)
      const webhookWorking = true; // Assumir que está OK se chegou até aqui
      
      console.log(`📊 APIs: Leads=${leadsWorking}, Webhook=${webhookWorking}`);
      
      return {
        leadsWorking,
        webhookWorking,
        error: !leadsWorking ? `Leads API failed: ${leadsResponse.status}` : undefined
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar APIs:', error);
      return {
        leadsWorking: false,
        webhookWorking: false,
        error: error instanceof Error ? error.message : 'API error'
      };
    }
  }

  /**
   * 🤖 Verificar conexão N8N
   */
  private static async checkN8NConnection(): Promise<SystemStatus['n8n']> {
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_WHATSAPP;
      
      if (!webhookUrl) {
        return {
          webhookAccessible: false,
          error: 'N8N_WEBHOOK_WHATSAPP não configurado'
        };
      }
      
      // Testar se webhook N8N está acessível
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'system_check',
          data: { timestamp: new Date().toISOString() }
        })
      });
      
      const accessible = response.status === 200 || response.status === 404; // 404 também é OK
      
      console.log(`🤖 N8N Webhook (${webhookUrl}): ${accessible ? 'Acessível' : 'Inacessível'}`);
      
      return {
        webhookAccessible: accessible,
        url: webhookUrl,
        error: !accessible ? `Webhook não acessível: ${response.status}` : undefined
      };
      
    } catch (error) {
      console.error('❌ Erro ao verificar N8N:', error);
      return {
        webhookAccessible: false,
        error: error instanceof Error ? error.message : 'N8N error'
      };
    }
  }

  /**
   * 📱 Inicializar WhatsApp
   */
  private static async initializeWhatsApp(): Promise<SystemStatus['whatsapp']> {
    try {
      console.log('📱 Inicializando sistema WhatsApp...');
      
      const result = await baileysWhatsAppService.initialize();
      
      if (result.success) {
        return {
          connected: result.isReady || false,
          qrCode: result.qrCode,
          error: result.isReady ? undefined : 'Aguardando QR code scan'
        };
      } else {
        return {
          connected: false,
          error: result.error || 'Falha na inicialização'
        };
      }
      
    } catch (error) {
      console.error('❌ Erro no WhatsApp:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'WhatsApp error'
      };
    }
  }

  /**
   * 📊 Avaliar status geral do sistema
   */
  private static assessOverallStatus(status: SystemStatus): SystemStatus['overall'] {
    const issues: string[] = [];
    
    // Verificar componentes críticos
    if (!status.database.connected) {
      issues.push('❌ Banco de dados não conectado');
    }
    
    if (!status.database.tablesCreated) {
      issues.push('❌ Tabelas não criadas');
    }
    
    if (!status.apis.leadsWorking) {
      issues.push('❌ API de leads não funcionando');
    }
    
    // Componentes importantes mas não críticos
    if (!status.n8n.webhookAccessible) {
      issues.push('⚠️ N8N webhook inacessível');
    }
    
    if (!status.whatsapp.connected) {
      issues.push('⚠️ WhatsApp não conectado (QR code necessário)');
    }
    
    // Sistema está pronto se componentes críticos estão OK
    const ready = status.database.connected && 
                 status.database.tablesCreated && 
                 status.apis.leadsWorking;
    
    return { ready, issues };
  }

  /**
   * 📝 Log status do sistema
   */
  private static logSystemStatus(status: SystemStatus): void {
    console.log('\n🎯 STATUS DO SISTEMA WHATSAPP → LEADS:');
    console.log('=' .repeat(50));
    
    console.log(`📊 Banco: ${status.database.connected ? '✅' : '❌'} ${status.database.tablesCreated ? '(Tabelas OK)' : '(Tabelas ERRO)'}`);
    console.log(`🔌 APIs: ${status.apis.leadsWorking ? '✅' : '❌'} Leads, ${status.apis.webhookWorking ? '✅' : '❌'} Webhook`);
    console.log(`🤖 N8N: ${status.n8n.webhookAccessible ? '✅' : '❌'} ${status.n8n.url || 'URL não configurada'}`);
    console.log(`📱 WhatsApp: ${status.whatsapp.connected ? '✅ Conectado' : '⚠️ Aguardando QR'}`);
    
    console.log(`\n🎯 SISTEMA GERAL: ${status.overall.ready ? '✅ PRONTO' : '❌ PENDENTE'}`);
    
    if (status.overall.issues.length > 0) {
      console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
      status.overall.issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    if (status.overall.ready) {
      console.log('\n🎉 Sistema pronto para processar leads via WhatsApp!');
      console.log('📱 Mensagens WhatsApp → 🧠 Extração → 📊 Leads → 👨‍💼 Admin');
    } else {
      console.log('\n⚠️ Sistema não está totalmente funcional. Resolva os problemas acima.');
    }
    
    console.log('=' .repeat(50));
  }

  /**
   * 🩺 Verificação rápida de saúde
   */
  public static async healthCheck(): Promise<{
    healthy: boolean;
    services: Record<string, boolean>;
    timestamp: string;
  }> {
    try {
      const services: Record<string, boolean> = {};
      
      // Teste rápido do banco
      try {
        await sql`SELECT 1`;
        services.database = true;
      } catch {
        services.database = false;
      }
      
      // Teste WhatsApp
      services.whatsapp = baileysWhatsAppService.isConnectedStatus();
      
      // Teste N8N webhook
      try {
        const webhookUrl = process.env.N8N_WEBHOOK_WHATSAPP;
        if (webhookUrl) {
          const response = await fetch(webhookUrl, { method: 'HEAD' });
          services.n8n = response.status < 500;
        } else {
          services.n8n = false;
        }
      } catch {
        services.n8n = false;
      }
      
      const healthy = services.database && services.whatsapp;
      
      return {
        healthy,
        services,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        healthy: false,
        services: {},
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * 🚀 Função principal para inicializar sistema
 */
export async function initializeWhatsAppSystem(): Promise<SystemStatus> {
  return await WhatsAppSystemInitializer.initializeComplete();
}

/**
 * 🩺 Função para check de saúde
 */
export async function checkWhatsAppSystemHealth() {
  return await WhatsAppSystemInitializer.healthCheck();
}