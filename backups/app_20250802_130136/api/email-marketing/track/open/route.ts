import { NextRequest, NextResponse } from 'next/server';
import { EmailTrackingSystem } from '@/lib/email-tracking';

/**
 * Endpoint para rastrear abertura de emails via pixel tracking
 * GET /api/email-marketing/track/open?send_id=xxx&campaign_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sendId = searchParams.get('send_id');
    const campaignId = searchParams.get('campaign_id');

    if (!sendId || !campaignId) {
      // Retorna pixel transparente mesmo com erro para não quebrar email
      return new NextResponse(
        Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
        {
          status: 200,
          headers: {
            'Content-Type': 'image/gif',
            'Content-Length': '43',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Extrair informações do request
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Registrar evento de abertura
    await EmailTrackingSystem.trackEvent({
      send_id: sendId,
      campaign_id: campaignId,
      contact_email: '', // Será preenchido via lookup do send_id
      event_type: 'opened',
      event_data: {
        timestamp: new Date().toISOString(),
        first_open: true // TODO: verificar se é primeira abertura
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    console.log(`👁️ Email abertura rastreada: send_id=${sendId}, campaign_id=${campaignId}, ip=${ipAddress}`);

    // Retornar pixel de tracking (GIF transparente 1x1)
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Content-Length': '43',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('❌ Erro no tracking de abertura:', error);
    
    // Sempre retornar pixel mesmo com erro
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        status: 200,
        headers: {
          'Content-Type': 'image/gif',
          'Content-Length': '43'
        }
      }
    );
  }
}