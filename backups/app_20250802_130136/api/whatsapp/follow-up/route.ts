import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppFollowUpSystem } from '@/lib/whatsapp-follow-up';

/**
 * API para gerenciar follow-ups WhatsApp
 * GET - Estatísticas de follow-up
 * POST - Processar follow-ups pendentes
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await WhatsAppFollowUpSystem.getFollowUpStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Action not specified. Use ?action=stats'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro na API de follow-up:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'process_pending':
        console.log('🤖 Processando follow-ups pendentes...');
        const result = await WhatsAppFollowUpSystem.processScheduledFollowUps();
        
        return NextResponse.json({
          success: true,
          data: result,
          message: `Processados: ${result.processed}, Enviados: ${result.sent}, Falharam: ${result.failed}`
        });

      case 'schedule':
        const { ruleId, phone, leadData, triggerData } = params;
        
        if (!ruleId || !phone || !leadData) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: ruleId, phone, leadData'
          }, { status: 400 });
        }

        const scheduled = await WhatsAppFollowUpSystem.scheduleFollowUp(
          ruleId, 
          phone, 
          leadData, 
          triggerData
        );

        return NextResponse.json({
          success: scheduled,
          message: scheduled ? 'Follow-up agendado com sucesso' : 'Falha ao agendar follow-up'
        });

      case 'cancel':
        const { phone: cancelPhone, reason } = params;
        
        if (!cancelPhone) {
          return NextResponse.json({
            success: false,
            error: 'Phone number required'
          }, { status: 400 });
        }

        await WhatsAppFollowUpSystem.cancelFollowUps(cancelPhone, reason);
        
        return NextResponse.json({
          success: true,
          message: 'Follow-ups cancelados com sucesso'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: process_pending, schedule, cancel'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro no processamento de follow-up:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Configuração da API
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';