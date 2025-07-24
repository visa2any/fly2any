import { NextRequest, NextResponse } from 'next/server';

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
    
    // Fazer chamada para a API de auto-restart
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://www.fly2any.com';
    
    const response = await fetch(`${baseUrl}/api/email-marketing/auto-restart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fly2Any-Cron-AutoRestart/1.0'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ CRON: Auto-restart executado com sucesso', result.details);
      
      return NextResponse.json({
        success: true,
        message: '✅ Verificação automática de campanhas executada via CRON',
        timestamp: new Date().toISOString(),
        details: result.details,
        nextRun: 'Em 5 minutos (recomendado)'
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

  1. 🔗 URL para agendar: https://www.fly2any.com/api/cron/email-auto-restart
  2. 📅 Frequência recomendada: A cada 5 minutos
  3. 🔧 Método HTTP: GET ou POST
  4. 📊 Monitoramento: Verificar logs para status de sucesso

  EXEMPLOS DE CONFIGURAÇÃO:

  📌 GitHub Actions (.github/workflows/email-auto-restart.yml):
  ```yaml
  name: Email Auto-Restart
  on:
    schedule:
      - cron: '*/5 * * * *'  # A cada 5 minutos
  jobs:
    restart:
      runs-on: ubuntu-latest
      steps:
        - name: Trigger Email Auto-Restart
          run: curl -X GET https://www.fly2any.com/api/cron/email-auto-restart
  ```

  📌 cron-job.org:
  - URL: https://www.fly2any.com/api/cron/email-auto-restart
  - Intervalo: */5 * * * * (a cada 5 minutos)
  - Método: GET

  📌 Vercel Cron (vercel.json):
  ```json
  {
    "crons": [{
      "path": "/api/cron/email-auto-restart",
      "schedule": "*/5 * * * *"
    }]
  }
  ```

  📌 Comando curl local para teste:
  curl -X GET https://www.fly2any.com/api/cron/email-auto-restart

  🎯 BENEFÍCIOS DO SISTEMA:
  - ✅ Campanhas nunca ficam travadas por mais de 5 minutos
  - 🔄 Reinício automático sem intervenção manual
  - 📊 Logs detalhados para monitoramento
  - 🚀 Melhoria na taxa de entrega de emails
  - 💪 Sistema robusto e confiável

*/