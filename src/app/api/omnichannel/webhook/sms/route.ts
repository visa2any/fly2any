import { NextRequest, NextResponse } from 'next/server';
import { OmnichannelAPI } from '@/lib/omnichannel-api';

// POST /api/omnichannel/webhook/sms - Processar mensagens SMS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📱 Omnichannel SMS webhook received:', JSON.stringify(body, null, 2));

    // Suporte para múltiplos provedores SMS
    const { from, to, message, text, messageId, provider = 'twilio' } = body;

    // Normalizar dados baseado no provedor
    let normalizedData;
    
    switch (provider) {
      case 'twilio':
        normalizedData = {
          from: body.From || from,
          message: body.Body || message || text,
          messageId: body.MessageSid || messageId || `sms_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        break;
      
      case 'vonage':
        normalizedData = {
          from: body.msisdn || from,
          message: body.text || message,
          messageId: body['message-id'] || messageId || `sms_${Date.now()}`,
          timestamp: body['message-timestamp'] || new Date().toISOString()
        };
        break;
      
      case 'aws_sns':
        normalizedData = {
          from: body.originationNumber || from,
          message: body.messageBody || message || text,
          messageId: body.messageId || `sms_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        break;
      
      default:
        normalizedData = {
          from: from,
          message: message || text,
          messageId: messageId || `sms_${Date.now()}`,
          timestamp: new Date().toISOString()
        };
    }

    if (!normalizedData.from || !normalizedData.message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: from, message'
      }, { status: 400 });
    }

    const metadata = {
      provider,
      timestamp: normalizedData.timestamp,
      original_message_id: normalizedData.messageId,
      webhook_data: body,
      channel_specific: {
        to_number: to || body.To || body.destinationNumber,
        country_code: extractCountryCode(normalizedData.from)
      }
    };

    // Processar mensagem no sistema omnichannel
    const result = await OmnichannelAPI.processIncomingMessage(
      'phone', // Canal SMS usa 'phone'
      normalizedData.messageId,
      normalizedData.from,
      normalizedData.message,
      metadata
    );

    console.log('✅ SMS processed in omnichannel:', {
      conversationId: result.conversation.id,
      customerId: result.customer.id,
      provider
    });

    // Verificar se deve responder automaticamente
    const shouldAutoRespond = await shouldAutoRespondSMS(result.conversation, normalizedData.message);

    if (shouldAutoRespond) {
      await sendAutoResponseSMS(result.conversation, normalizedData.from);
    } else {
      // Notificar agentes sobre nova mensagem SMS
      await notifyAgentsSMS(result.conversation, normalizedData.message);
    }

    return NextResponse.json({
      success: true,
      conversation_id: result.conversation.id,
      customer_id: result.customer.id,
      auto_response_sent: shouldAutoRespond,
      provider
    });

  } catch (error) {
    console.error('Error processing SMS message in omnichannel:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/omnichannel/webhook/sms - Webhook verification para alguns provedores
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Twilio webhook verification
  if (searchParams.has('hub.challenge')) {
    const challenge = searchParams.get('hub.challenge');
    return new Response(challenge);
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'SMS webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}

// Função auxiliar para extrair código do país
function extractCountryCode(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Detectar códigos de país comuns
  if (cleaned.startsWith('1')) return 'US'; // +1 (US/Canada)
  if (cleaned.startsWith('55')) return 'BR'; // +55 (Brasil)
  if (cleaned.startsWith('44')) return 'GB'; // +44 (UK)
  if (cleaned.startsWith('49')) return 'DE'; // +49 (Germany)
  
  return 'UNKNOWN';
}

// Função para determinar resposta automática
async function shouldAutoRespondSMS(conversation: any, message: string): Promise<boolean> {
  const now = new Date();
  const hour = now.getHours();
  
  // Fora do horário comercial (9h-18h EST)
  if (hour < 9 || hour >= 18) {
    return true;
  }
  
  // Palavras-chave que triggerem resposta automática
  const autoTriggers = [
    'oi', 'olá', 'hello', 'hi',
    'cotação', 'preço', 'quote', 'price',
    'voo', 'flight', 'passagem', 'ticket',
    'ajuda', 'help', 'informação', 'info'
  ];
  
  const messageWords = message.toLowerCase().split(/\s+/);
  const hasTrigger = autoTriggers.some(trigger => 
    messageWords.some(word => word.includes(trigger))
  );
  
  return hasTrigger;
}

// Função para enviar resposta automática SMS
async function sendAutoResponseSMS(conversation: any, phoneNumber: string) {
  try {
    const now = new Date();
    const hour = now.getHours();
    
    let autoMessage = '';
    
    if (hour < 9 || hour >= 18) {
      // Fora do horário comercial
      autoMessage = `🛫 Fly2Any - Recebemos sua mensagem!

🕐 Estamos fora do horário comercial
⏰ Seg-Sex: 9h-18h (EST)

Um especialista retornará pela manhã.
Para emergências: WhatsApp (555) 123-4567`;
    } else {
      // Horário comercial - saudação
      autoMessage = `🛫 Olá! Bem-vindo à Fly2Any!

✈️ Especialistas em voos EUA-Brasil
🎯 Cotação gratuita em até 2h
📱 Como posso ajudar hoje?

Para mais agilidade:
WhatsApp: (555) 123-4567`;
    }

    // Registrar mensagem automática no sistema
    await OmnichannelAPI.createMessage({
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: 'phone',
      direction: 'outbound',
      content: autoMessage,
      is_automated: true,
      template_id: hour < 9 || hour >= 18 ? 'sms_off_hours' : 'sms_greeting',
      metadata: {
        auto_response: true,
        trigger_time: new Date().toISOString(),
        phone_number: phoneNumber
      }
    });

    // Aqui você integraria com seu provedor SMS real
    console.log('📱 Auto-response SMS scheduled:', {
      to: phoneNumber,
      message: autoMessage,
      conversation_id: conversation.id
    });

    // Exemplo de integração com Twilio (descomentear quando configurado)
    /*
    await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneNumber,
        message: autoMessage
      })
    });
    */

  } catch (error) {
    console.error('Error sending auto-response SMS:', error);
  }
}

// Função para notificar agentes sobre nova mensagem SMS
async function notifyAgentsSMS(conversation: any, messageContent: string) {
  try {
    console.log(`🔔 Notifying agents about new SMS in conversation ${conversation.id}`);
    
    const notificationData = {
      type: 'new_sms_message',
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: 'phone',
      message: messageContent,
      timestamp: new Date().toISOString(),
      priority: 'normal',
      metadata: {
        phone_number: conversation.channel_conversation_id,
        requires_response: true
      }
    };

    // Implementar notificação real-time (WebSocket, SSE, etc.)
    // Por enquanto, apenas log
    console.log('📱 SMS notification data:', notificationData);
    
    // Aqui você pode implementar:
    // - WebSocket para notificação em tempo real
    // - Push notification para agentes
    // - Integração com Slack/Teams
    // - Email para supervisores
    
  } catch (error) {
    console.error('Error notifying agents about SMS:', error);
  }
}