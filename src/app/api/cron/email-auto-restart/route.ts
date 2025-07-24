import { NextRequest, NextResponse } from 'next/server';
import { executeAutoRestart } from '../../email-marketing/route';

// 🔄 CRON JOB para reinício automático de campanhas
// Este endpoint pode ser chamado por serviços externos como:
// - GitHub Actions (scheduled workflows)
// - Vercel Cron Jobs
// - cron-job.org
// - Zapier/Make.com
// - Qualquer serviço de agendamento

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 CRON: Executando verificação automática de campanhas...');
    
    // Chamar diretamente a função de auto-restart (sem HTTP fetch)
    const result = await executeAutoRestart();
    
    if (result.success) {
      console.log('✅ CRON: Auto-restart executado com sucesso', result.data);
      
      return NextResponse.json({
        success: true,
        message: '✅ Verificação automática de campanhas executada via CRON',
        timestamp: new Date().toISOString(),
        details: result.data,
        summary: result.data?.message || 'Processo concluído',
        nextRun: 'Em 5-10 minutos (recomendado)'
      });
    } else {
      console.error('❌ CRON: Erro no auto-restart:', result.error);
      
      return NextResponse.json({
        success: false,
        message: '❌ Erro na verificação automática via CRON',
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ CRON: Erro crítico no sistema de auto-restart:', error);
    
    return NextResponse.json({
      success: false,
      message: '❌ Erro crítico no sistema de auto-restart via CRON',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST também suportado para flexibilidade
export async function POST(request: NextRequest) {
  return GET(request);
}

// 📋 INSTRUÇÕES DE USO:
/*
  CONFIGURAÇÃO DE CRON JOBS EXTERNOS:

  1. URL para agendar: https://www.fly2any.com/api/cron/email-auto-restart
  2. Frequência recomendada: A cada 5 minutos
  3. Método HTTP: GET ou POST
  4. Monitoramento: Verificar logs para status de sucesso

  EXEMPLOS DE CONFIGURAÇÃO:

  GitHub Actions (.github/workflows/email-auto-restart.yml):
  - Criar workflow com schedule: cron '* /5 * * * *' (sem espaço após *)
  - Job: curl -X GET https://www.fly2any.com/api/cron/email-auto-restart

  cron-job.org:
  - URL: https://www.fly2any.com/api/cron/email-auto-restart
  - Intervalo: * /5 * * * * (a cada 5 minutos, sem espaço após *)
  - Método: GET

  Vercel Cron (vercel.json):
  - Adicionar crons array com path e schedule
  - Path: "/api/cron/email-auto-restart"
  - Schedule: "* /5 * * * *" (sem espaço após *)

  Comando curl local para teste:
  curl -X GET https://www.fly2any.com/api/cron/email-auto-restart

  BENEFÍCIOS DO SISTEMA:
  - Campanhas nunca ficam travadas por mais de 5 minutos
  - Reinício automático sem intervenção manual
  - Logs detalhados para monitoramento
  - Melhoria na taxa de entrega de emails
  - Sistema robusto e confiável
*/