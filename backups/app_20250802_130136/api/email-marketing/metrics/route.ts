import { NextRequest, NextResponse } from 'next/server';
import { EmailTrackingSystem } from '@/lib/email-tracking';

/**
 * API para métricas de email marketing em tempo real
 * GET /api/email-marketing/metrics?campaign_id=xxx&action=realtime|detailed|events
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');
    const action = searchParams.get('action') || 'realtime';

    if (!campaignId) {
      return NextResponse.json({ 
        success: false, 
        error: 'campaign_id é obrigatório' 
      }, { status: 400 });
    }

    switch (action) {
      case 'realtime': {
        // Métricas em tempo real
        const metrics = await EmailTrackingSystem.getCampaignMetrics(campaignId);
        
        return NextResponse.json({
          success: true,
          data: {
            ...metrics,
            summary: {
              totalEmails: metrics.totalSent,
              successRate: metrics.totalSent > 0 ? ((metrics.delivered / metrics.totalSent) * 100).toFixed(1) : '0.0',
              engagementRate: metrics.delivered > 0 ? (((metrics.opened + metrics.clicked) / metrics.delivered) * 100).toFixed(1) : '0.0',
              status: metrics.bounceRate > 50 ? 'problematic' : metrics.openRate > 20 ? 'excellent' : 'good'
            }
          }
        });
      }

      case 'detailed': {
        // Estatísticas detalhadas por hora
        const hours = parseInt(searchParams.get('hours') || '24');
        const detailed = await EmailTrackingSystem.getDetailedStats(campaignId, hours);
        
        return NextResponse.json({
          success: true,
          data: {
            hourlyStats: detailed,
            period: `${hours} hours`,
            generatedAt: new Date().toISOString()
          }
        });
      }

      case 'events': {
        // Eventos recentes em tempo real
        const limit = parseInt(searchParams.get('limit') || '50');
        const events = await EmailTrackingSystem.getRealtimeEvents(campaignId, limit);
        
        return NextResponse.json({
          success: true,
          data: {
            events,
            count: events.length,
            lastUpdate: new Date().toISOString()
          }
        });
      }

      case 'stream': {
        // Para implementar Server-Sent Events (SSE) no futuro
        return NextResponse.json({
          success: false,
          error: 'SSE streaming não implementado ainda'
        });
      }

      default:
        return NextResponse.json({ 
          success: false, 
          error: `Ação '${action}' não reconhecida. Use: realtime, detailed, events` 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro na API de métricas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno na obtenção de métricas' 
    }, { status: 500 });
  }
}

/**
 * POST para webhook callbacks de provedores de email (futuro)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, campaign_id, send_id, email, data } = body;

    if (!event_type || !campaign_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'event_type e campaign_id são obrigatórios' 
      }, { status: 400 });
    }

    // Registrar evento via webhook
    await EmailTrackingSystem.trackEvent({
      send_id: send_id || 'webhook',
      campaign_id,
      contact_email: email || 'unknown',
      event_type: event_type,
      event_data: data || {},
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'webhook',
      user_agent: 'webhook'
    });

    console.log(`📡 Evento webhook processado: ${event_type} para ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Evento processado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro no webhook de métricas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno no processamento do webhook' 
    }, { status: 500 });
  }
}