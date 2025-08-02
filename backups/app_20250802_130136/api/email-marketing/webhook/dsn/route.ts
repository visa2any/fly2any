import { NextRequest, NextResponse } from 'next/server';
import { EmailTrackingSystem } from '@/lib/email-tracking';

/**
 * Webhook para receber notificações DSN (Delivery Status Notifications)
 * POST /api/email-marketing/webhook/dsn
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Parse do body baseado no tipo de conteúdo
    let dsnData: any = {};
    
    if (contentType.includes('application/json')) {
      dsnData = await request.json();
    } else if (contentType.includes('text/plain')) {
      // Parse de DSN em formato texto (RFC 3464)
      const textBody = await request.text();
      dsnData = parseDSNText(textBody);
    } else {
      console.warn('⚠️ Tipo de conteúdo DSN não suportado:', contentType);
      return NextResponse.json({ success: false, error: 'Content-Type não suportado' }, { status: 400 });
    }

    console.log('📨 DSN recebido:', JSON.stringify(dsnData, null, 2));

    // Extrair informações relevantes
    const { action, status, recipient, messageId, diagnosticCode, sendId } = dsnData;

    if (!recipient) {
      return NextResponse.json({ success: false, error: 'Recipient obrigatório' }, { status: 400 });
    }

    // Determinar tipo de evento baseado no status DSN
    let eventType: string = 'unknown';
    
    if (action === 'delivered' || status?.startsWith('2.')) {
      eventType = 'delivered';
    } else if (action === 'failed' || status?.startsWith('5.')) {
      eventType = 'bounced';
    } else if (action === 'delayed' || status?.startsWith('4.')) {
      eventType = 'delayed';
    }

    // Tentar extrair sendId do messageId se não fornecido
    let extractedSendId = sendId;
    if (!extractedSendId && messageId) {
      // Formato esperado: bounce+{sendId}@fly2any.com
      const match = messageId.match(/bounce\+([^@]+)@/);
      if (match) {
        extractedSendId = match[1];
      }
    }

    if (extractedSendId) {
      // Registrar evento no sistema de tracking
      await EmailTrackingSystem.trackEvent({
        send_id: extractedSendId,
        campaign_id: dsnData.campaignId || 'webhook',
        contact_email: recipient,
        event_type: eventType as any,
        event_data: {
          dsn_action: action,
          dsn_status: status,
          diagnostic_code: diagnosticCode,
          message_id: messageId,
          timestamp: new Date().toISOString(),
          webhook_source: 'dsn'
        },
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'webhook',
        user_agent: 'DSN-Webhook'
      });

      console.log(`✅ Evento DSN processado: ${eventType} para ${recipient}`);
    } else {
      console.warn('⚠️ Não foi possível extrair sendId do DSN');
    }

    return NextResponse.json({
      success: true,
      message: 'DSN processado com sucesso',
      eventType,
      recipient
    });

  } catch (error) {
    console.error('❌ Erro no webhook DSN:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno no processamento DSN' 
    }, { status: 500 });
  }
}

/**
 * Parse básico de DSN em formato texto (RFC 3464)
 */
function parseDSNText(dsnText: string): any {
  const lines = dsnText.split('\n');
  const parsed: any = {};

  for (const line of lines) {
    if (line.startsWith('Action:')) {
      parsed.action = line.replace('Action:', '').trim();
    } else if (line.startsWith('Status:')) {
      parsed.status = line.replace('Status:', '').trim();
    } else if (line.startsWith('Final-Recipient:')) {
      const recipient = line.replace('Final-Recipient:', '').trim();
      // Formato: rfc822;email@domain.com
      parsed.recipient = recipient.includes(';') ? recipient.split(';')[1] : recipient;
    } else if (line.startsWith('Diagnostic-Code:')) {
      parsed.diagnosticCode = line.replace('Diagnostic-Code:', '').trim();
    } else if (line.startsWith('Original-Envelope-Id:')) {
      parsed.sendId = line.replace('Original-Envelope-Id:', '').trim();
    }
  }

  return parsed;
}

/**
 * GET para verificação de saúde do webhook
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook DSN ativo',
    timestamp: new Date().toISOString()
  });
}