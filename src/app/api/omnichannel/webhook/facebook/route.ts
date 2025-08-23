import { NextRequest, NextResponse } from 'next/server';
import { OmnichannelAPI } from '@/lib/omnichannel-api';

// POST /api/omnichannel/webhook/facebook - Processar mensagens do Facebook Messenger
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('👥 Facebook webhook received:', JSON.stringify(body, null, 2));

    // Verificar se é uma mensagem do Messenger
    if (body.object === 'page' && body.entry) {
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            await processFacebookMessage(messagingEvent);
          }
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Facebook webhook:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/omnichannel/webhook/facebook - Verificação do webhook (Meta requirement)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verificar token (usar variável de ambiente)
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Facebook webhook verified');
    return new Response(challenge);
  } else {
    console.log('❌ Facebook webhook verification failed');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

// Processar mensagem individual do Facebook
async function processFacebookMessage(messagingEvent: any) {
  try {
    const { sender, recipient, message, timestamp } = messagingEvent;

    if (!message || !sender?.id) {
      console.log('Skipping Facebook event - not a message');
      return;
    }

    // Ignorar ecos (mensagens enviadas pela própria página)
    if (message.is_echo) {
      console.log('Skipping Facebook echo message');
      return;
    }

    const senderId = sender.id;
    const messageText = message.text || '';
    const messageId = message.mid || `fb_${timestamp}`;

    // Buscar informações do usuário do Facebook
    const senderInfo = await getFacebookUserInfo(senderId);

    const metadata = {
      platform: 'facebook',
      sender_info: senderInfo,
      message_id: messageId,
      timestamp: new Date(parseInt(timestamp)).toISOString(),
      recipient_id: recipient?.id,
      message_type: getMessageType(message),
      attachments: message.attachments || [],
      quick_reply: message.quick_reply,
      webhook_data: messagingEvent
    };

    // Processar no sistema omnichannel
    const result = await OmnichannelAPI.processIncomingMessage(
      'facebook',
      messageId,
      senderId,
      messageText || getAttachmentDescription(message),
      metadata
    );

    console.log('✅ Facebook message processed:', {
      conversationId: result.conversation.id,
      customerId: result.customer.id,
      messageType: metadata.message_type
    });

    // Verificar se deve responder automaticamente
    const shouldAutoRespond = await shouldAutoRespondFacebook(result.conversation, messageText, message);

    if (shouldAutoRespond) {
      await sendFacebookAutoResponse(senderId, result.conversation, message);
    } else {
      // Notificar agentes sobre nova mensagem
      await notifyAgentsFacebook(result.conversation, messageText, senderInfo);
    }

  } catch (error) {
    console.error('Error processing Facebook message:', error);
  }
}

// Buscar informações do usuário do Facebook
async function getFacebookUserInfo(userId: string) {
  try {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('Facebook access token not configured');
      return { id: userId, name: 'Usuário Facebook' };
    }

    const response = await fetch(
      `https://graph.facebook.com/${userId}?fields=first_name,last_name,profile_pic&access_token=${accessToken}`
    );

    if (response.ok) {
      const userInfo = await response.json();
      return {
        id: userId,
        first_name: userInfo.first_name || '',
        last_name: userInfo.last_name || '',
        name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || 'Usuário Facebook',
        profile_pic: userInfo.profile_pic,
        platform: 'facebook'
      };
    } else {
      console.log('Failed to fetch Facebook user info:', response.status);
    }
  } catch (error) {
    console.error('Error fetching Facebook user info:', error);
  }

  return {
    id: userId,
    name: 'Usuário Facebook',
    platform: 'facebook'
  };
}

// Determinar tipo da mensagem
function getMessageType(message: any): string {
  if (message.text) return 'text';
  if (message.attachments) {
    const attachment = message.attachments[0];
    return attachment.type || 'attachment';
  }
  if (message.quick_reply) return 'quick_reply';
  return 'unknown';
}

// Obter descrição de anexo
function getAttachmentDescription(message: any): string {
  if (message.text) return message.text;
  
  if (message.attachments && message.attachments.length > 0) {
    const attachment = message.attachments[0];
    switch (attachment.type) {
      case 'image':
        return '[Imagem enviada]';
      case 'video':
        return '[Vídeo enviado]';
      case 'audio':
        return '[Áudio enviado]';
      case 'file':
        return '[Arquivo enviado]';
      default:
        return '[Mídia enviada]';
    }
  }
  
  if (message.quick_reply) {
    return `Quick Reply: ${message.quick_reply.payload}`;
  }
  
  return '[Mensagem sem texto]';
}

// Determinar se deve responder automaticamente
async function shouldAutoRespondFacebook(conversation: any, message: string, messageObj: any): Promise<boolean> {
  const now = new Date();
  const hour = now.getHours();
  
  // Não responder a quick replies automáticos
  if (messageObj.quick_reply) {
    return false;
  }
  
  // Fora do horário comercial (9h-18h EST)
  if (hour < 9 || hour >= 18) {
    return true;
  }
  
  // Primeira mensagem do cliente
  const messageCount = conversation.messages?.length || 0;
  if (messageCount <= 1) {
    return true;
  }
  
  // Palavras-chave que triggerem resposta automática
  const autoTriggers = [
    'oi', 'olá', 'hello', 'hi', 'ola',
    'informação', 'info', 'ajuda', 'help',
    'voo', 'flight', 'passagem', 'ticket',
    'preço', 'price', 'cotação', 'quote',
    'reserva', 'booking', 'comprar', 'buy'
  ];
  
  const messageWords = message.toLowerCase().split(/\s+/);
  const hasTrigger = autoTriggers.some(trigger => 
    messageWords.some(word => word.includes(trigger))
  );
  
  return hasTrigger;
}

// Enviar resposta automática no Facebook
async function sendFacebookAutoResponse(recipientId: string, conversation: any, originalMessage: any) {
  try {
    const now = new Date();
    const hour = now.getHours();
    
    let response;
    
    if (hour < 9 || hour >= 18) {
      // Fora do horário comercial
      response = {
        text: `🛫 Olá! Obrigado por entrar em contato com a Fly2Any!

🕐 Estamos fora do horário comercial
⏰ Atendimento: Seg-Sex 9h-18h (EST)

📱 Para atendimento imediato:
• WhatsApp: (555) 123-4567
• Site: www.fly2any.com

✈️ Retornaremos sua mensagem pela manhã!`
      };
    } else {
      // Horário comercial com quick replies
      response = {
        text: `🛫 Olá! Bem-vindo à Fly2Any!

✈️ Especialistas em voos EUA ↔ Brasil
🎯 Como podemos ajudar hoje?`,
        quick_replies: [
          {
            content_type: 'text',
            title: '✈️ Cotação de Voo',
            payload: 'QUOTE_REQUEST'
          },
          {
            content_type: 'text',
            title: '📞 Falar com Agente',
            payload: 'TALK_TO_AGENT'
          },
          {
            content_type: 'text',
            title: '🔄 Alterar Reserva',
            payload: 'MODIFY_BOOKING'
          },
          {
            content_type: 'text',
            title: 'ℹ️ Informações',
            payload: 'INFO_REQUEST'
          }
        ]
      };
    }

    // Registrar mensagem automática no sistema
    await OmnichannelAPI.createMessage({
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: 'facebook',
      direction: 'outbound',
      content: response.text,
      is_automated: true,
      template_id: hour < 9 || hour >= 18 ? 'facebook_off_hours' : 'facebook_greeting',
      metadata: {
        auto_response: true,
        trigger_time: new Date().toISOString(),
        recipient_id: recipientId,
        platform: 'facebook',
        quick_replies: response.quick_replies || [],
        original_message_type: getMessageType(originalMessage)
      }
    });

    // Enviar via API do Facebook
    await sendFacebookMessage(recipientId, response);

    console.log('👥 Facebook auto-response sent:', {
      recipient: recipientId,
      conversation_id: conversation.id,
      has_quick_replies: !!response.quick_replies
    });

  } catch (error) {
    console.error('Error sending Facebook auto-response:', error);
  }
}

// Enviar mensagem via API do Facebook
async function sendFacebookMessage(recipientId: string, messageData: any) {
  try {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('Facebook access token not configured - message not sent');
      return;
    }

    const response = await fetch(
      `https://graph.facebook.com/v17.0/me/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: messageData,
          messaging_type: 'RESPONSE'
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Facebook message sent successfully:', result.message_id);
    } else {
      const error = await response.text();
      console.error('❌ Failed to send Facebook message:', error);
    }

  } catch (error) {
    console.error('Error sending Facebook message via API:', error);
  }
}

// Notificar agentes sobre nova mensagem do Facebook
async function notifyAgentsFacebook(conversation: any, messageContent: string, senderInfo: any) {
  try {
    console.log(`🔔 Notifying agents about new Facebook message in conversation ${conversation.id}`);
    
    const notificationData = {
      type: 'new_message',
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: 'facebook',
      message: messageContent,
      timestamp: new Date().toISOString(),
      priority: 'normal',
      metadata: {
        platform: 'facebook',
        sender: senderInfo,
        requires_response: true,
        is_messenger: true
      }
    };

    // Enviar notificação em tempo real
    await fetch('/api/omnichannel/ws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    console.log('👥 Facebook notification sent to agents');
    
  } catch (error) {
    console.error('Error notifying agents about Facebook message:', error);
  }
}