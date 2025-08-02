import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppFollowUpSystem } from '@/lib/whatsapp-follow-up';

/**
 * 🕒 Cron Job para processar follow-ups WhatsApp automaticamente
 * 
 * Este endpoint deve ser chamado periodicamente (ex: a cada 15 minutos)
 * via Vercel Cron ou sistema externo como GitHub Actions
 * 
 * Configuração no vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/whatsapp-followup",
 *       "schedule": "0,15,30,45 * * * *"
 *     }
 *   ]
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Verificar autorização (opcional - usar token secreto)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    console.log('⏰ Cron job iniciado: WhatsApp Follow-up System');
    const startTime = Date.now();

    // Processar follow-ups pendentes
    const result = await WhatsAppFollowUpSystem.processScheduledFollowUps();
    
    const processingTime = Date.now() - startTime;
    
    // Log resultado
    console.log('📊 Cron job concluído:', {
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString()
    });

    // Retornar resultado
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        processingTimeMs: processingTime,
        cronTriggeredAt: new Date().toISOString()
      },
      message: `Follow-up cron executado: ${result.sent} enviados, ${result.failed} falharam`
    });

  } catch (error) {
    console.error('❌ Erro no cron job de follow-up:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST endpoint para trigger manual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { manual = false } = body;

    console.log(`🔄 Follow-up processamento ${manual ? 'manual' : 'automático'} iniciado`);
    
    const result = await WhatsAppFollowUpSystem.processScheduledFollowUps();
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Processamento ${manual ? 'manual' : 'automático'} concluído`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no processamento manual:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Manual processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Configuração
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';