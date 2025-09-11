/**
 * Database Connection Checker
 * 
 * Verifica se o banco de dados está configurado e conectado.
 * Fornece orientações para configuração.
 */

export interface DatabaseStatus {
  connected: boolean;
  configured: boolean;
  error?: string;
  instructions?: string;
  environment: 'local' | 'vercel' | 'railway' | 'unknown';
}

export class DatabaseChecker {
  
  /**
   * Verifica o status da conexão do banco
   */
  static async checkConnection(): Promise<DatabaseStatus> {
    console.log('[DB-CHECKER] Verificando conexão do banco...');
    
    // Verificar se variáveis estão configuradas
    const dbUrl = process.env.POSTGRES_URL;
    const configured = !!(dbUrl && dbUrl !== 'postgresql://username:password@host:5432/database');
    
    if (!configured) {
      return {
        connected: false,
        configured: false,
        environment: 'unknown',
        instructions: this.getSetupInstructions()
      };
    }
    
    // Detectar ambiente
    const environment = this.detectEnvironment(dbUrl);
    
    // Testar conexão
    try {
      // Lazy load @vercel/postgres to prevent build-time execution
      const { sql } = await import('@vercel/postgres');
      await sql`SELECT 1 as test`;
      console.log('[DB-CHECKER] ✅ Banco conectado com sucesso!');
      
      return {
        connected: true,
        configured: true,
        environment
      };
    } catch (error) {
      console.error('[DB-CHECKER] ❌ Erro de conexão:', error);
      
      return {
        connected: false,
        configured: true,
        environment,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        instructions: this.getConnectionErrorInstructions(environment)
      };
    }
  }
  
  /**
   * Detecta o ambiente do banco baseado na URL
   */
  private static detectEnvironment(dbUrl: string): 'local' | 'vercel' | 'railway' | 'unknown' {
    if (dbUrl.includes('vercel-storage')) return 'vercel';
    if (dbUrl.includes('railway.app')) return 'railway';
    if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) return 'local';
    return 'unknown';
  }
  
  /**
   * Instruções de configuração inicial
   */
  private static getSetupInstructions(): string {
    return `
🔧 CONFIGURAÇÃO DO BANCO DE DADOS NECESSÁRIA

Para usar o sistema com persistência real, configure um dos bancos:

📘 OPÇÃO 1: VERCEL POSTGRES (Recomendado - Gratuito)
1. Acesse https://vercel.com/dashboard
2. Vá em Storage > Create Database > Postgres
3. Copie as variáveis de ambiente geradas
4. Cole no arquivo .env

📗 OPÇÃO 2: RAILWAY POSTGRES
1. Acesse https://railway.app/dashboard  
2. New Project > Deploy PostgreSQL
3. Vá em Variables e copie as credenciais
4. Configure no .env

📙 OPÇÃO 3: BANCO LOCAL (Desenvolvimento)
1. Instale PostgreSQL localmente
2. Crie database: fly2any_db
3. Configure credenciais no .env

Após configurar, reinicie o servidor: npm run dev
`;
  }
  
  /**
   * Instruções para erro de conexão
   */
  private static getConnectionErrorInstructions(environment: string): string {
    switch (environment) {
      case 'vercel':
        return `
❌ ERRO CONEXÃO VERCEL POSTGRES

1. Verifique se o database ainda existe em https://vercel.com/dashboard
2. Confirme as variáveis de ambiente no .env
3. O Vercel Postgres tem limite de 60 horas/mês na versão gratuita
4. Verifique se não excedeu o limite

Reinicie após corrigir: npm run dev
`;
      
      case 'railway':
        return `
❌ ERRO CONEXÃO RAILWAY POSTGRES

1. Verifique se o serviço está rodando em https://railway.app/dashboard
2. Confirme as credenciais no .env
3. Railway pode hibernar serviços inativos
4. Aguarde alguns segundos e tente novamente

Reinicie após corrigir: npm run dev
`;
      
      case 'local':
        return `
❌ ERRO CONEXÃO BANCO LOCAL

1. Verifique se PostgreSQL está rodando
2. Confirme se o database 'fly2any_db' existe
3. Teste credenciais: psql -h localhost -U username -d database
4. Verifique firewall/porta 5432

Reinicie após corrigir: npm run dev
`;
      
      default:
        return `
❌ ERRO CONEXÃO BANCO

Verifique:
1. URL do banco está correta
2. Credenciais são válidas  
3. Banco está rodando e acessível
4. Firewall não está bloqueando

Reinicie após corrigir: npm run dev
`;
    }
  }
  
  /**
   * Inicializar tabelas se conectado
   */
  static async initializeTables(): Promise<boolean> {
    try {
      console.log('[DB-CHECKER] Inicializando tabelas...');
      
      // Lazy load @vercel/postgres to prevent build-time execution
      const { sql } = await import('@vercel/postgres');
      
      // Criar tabela de leads
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          email TEXT NOT NULL,
          whatsapp TEXT,
          telefone TEXT,
          origem TEXT,
          destino TEXT,
          data_partida TEXT,
          data_retorno TEXT,
          numero_passageiros INTEGER DEFAULT 1,
          selected_services JSONB DEFAULT '[]',
          status TEXT DEFAULT 'novo',
          source TEXT DEFAULT 'website',
          orcamento_total TEXT,
          observacoes TEXT,
          full_data JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      
      // Criar índices (separadamente para Neon PostgreSQL)
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)`;
      
      console.log('[DB-CHECKER] ✅ Tabelas inicializadas!');
      return true;
    } catch (error) {
      console.error('[DB-CHECKER] ❌ Erro ao criar tabelas:', error);
      return false;
    }
  }
  
  /**
   * Método para log de status no console
   */
  static async logStatus(): Promise<void> {
    const status = await this.checkConnection();
    
    console.log('\n' + '='.repeat(60));
    console.log('🗄️  STATUS DO BANCO DE DADOS');
    console.log('='.repeat(60));
    
    if (status.connected) {
      console.log('✅ Status: CONECTADO');
      console.log(`🌍 Ambiente: ${status.environment.toUpperCase()}`);
      console.log('📊 Sistema de persistência: ATIVO');
    } else if (status.configured) {
      console.log('❌ Status: CONFIGURADO MAS NÃO CONECTA');
      console.log(`🌍 Ambiente: ${status.environment.toUpperCase()}`);
      console.log(`🔧 Erro: ${status.error}`);
      if (status.instructions) {
        console.log(status.instructions);
      }
    } else {
      console.log('⚠️  Status: NÃO CONFIGURADO');
      console.log('📝 Usando cache em memória (dados temporários)');
      if (status.instructions) {
        console.log(status.instructions);
      }
    }
    
    console.log('='.repeat(60) + '\n');
  }
}