import { NextRequest, NextResponse } from 'next/server';
import { EmailTrackingSystem } from '@/lib/email-tracking';

/**
 * Endpoint para rastrear cliques em links de emails
 * GET /api/email-marketing/track/click?send_id=xxx&campaign_id=xxx&url=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sendId = searchParams.get('send_id');
    const campaignId = searchParams.get('campaign_id');
    const originalUrl = searchParams.get('url');

    if (!sendId || !campaignId || !originalUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetros obrigatórios: send_id, campaign_id, url' 
      }, { status: 400 });
    }

    // Extrair informações do request
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Registrar evento de clique
    await EmailTrackingSystem.trackEvent({
      send_id: sendId,
      campaign_id: campaignId,
      contact_email: '', // Será preenchido via lookup do send_id
      event_type: 'clicked',
      event_data: {
        clicked_url: originalUrl,
        timestamp: new Date().toISOString(),
        referrer: request.headers.get('referer') || 'email'
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    console.log(`🖱️ Clique rastreado: send_id=${sendId}, campaign_id=${campaignId}, url=${originalUrl}`);

    // Redirecionar para URL original
    return NextResponse.redirect(decodeURIComponent(originalUrl));

  } catch (error) {
    console.error('❌ Erro no tracking de clique:', error);
    
    // Em caso de erro, redirecionar para URL mesmo assim
    const originalUrl = new URL(request.url).searchParams.get('url');
    if (originalUrl) {
      return NextResponse.redirect(decodeURIComponent(originalUrl));
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno no tracking' 
    }, { status: 500 });
  }
}