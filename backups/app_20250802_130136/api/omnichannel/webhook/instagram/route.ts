import { NextRequest, NextResponse } from 'next/server';
import { OmnichannelAPI } from '@/lib/omnichannel-api';

// POST /api/omnichannel/webhook/instagram - Processar mensagens do Instagram Direct
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📸 Instagram webhook received:', JSON.stringify(body, null, 2));

    // Verificar se é uma mensagem de DM
    if (body.object === 'instagram' && body.entry) {
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            await processInstagramMessage(messagingEvent);
          }
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Instagram webhook:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/omnichannel/webhook/instagram - Verificação do webhook (Meta requirement)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verificar token (usar variável de ambiente)
  const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'fly2any_instagram_verify';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Instagram webhook verified');
    return new Response(challenge);
  } else {
    console.log('❌ Instagram webhook verification failed');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

// Processar mensagem individual do Instagram
async function processInstagramMessage(messagingEvent: any) {
  try {
    const { sender, recipient, message, timestamp } = messagingEvent;

    if (!message || !sender?.id) {
      console.log('Skipping Instagram event - not a message');
      return;
    }

    const senderId = sender.id;
    const messageText = message.text || '';
    const messageId = message.mid || `ig_${timestamp}`;

    // Buscar informações do usuário do Instagram
    const senderInfo = await getInstagramUserInfo(senderId);

    const metadata = {
      platform: 'instagram',
      sender_info: senderInfo,
      message_id: messageId,
      timestamp: new Date(timestamp).toISOString(),
      recipient_id: recipient?.id,
      message_type: message.attachments ? 'media' : 'text',
      attachments: message.attachments || [],
      webhook_data: messagingEvent
    };

    // Processar no sistema omnichannel
    const result = await OmnichannelAPI.processIncomingMessage(
      'instagram',
      messageId,
      senderId,
      messageText || '[Mídia recebida]',
      metadata
    );

    console.log('✅ Instagram message processed:', {
      conversationId: result.conversation.id,
      customerId: result.customer.id,
      messageType: metadata.message_type
    });

    // Verificar se deve responder automaticamente
    const shouldAutoRespond = await shouldAutoRespondInstagram(result.conversation, messageText);

    if (shouldAutoRespond) {
      await sendInstagramAutoResponse(senderId, result.conversation);
    } else {
      // Notificar agentes sobre nova mensagem
      await notifyAgentsInstagram(result.conversation, messageText, senderInfo);
    }

  } catch (error) {
    console.error('Error processing Instagram message:', error);
  }
}

// Buscar informações do usuário do Instagram
async function getInstagramUserInfo(userId: string) {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('Instagram access token not configured');
      return { id: userId, name: 'Usuário Instagram' };
    }

    const response = await fetch(
      `https://graph.instagram.com/${userId}?fields=id,username,name&access_token=${accessToken}`
    );

    if (response.ok) {
      const userInfo = await response.json();
      return {
        id: userId,
        username: userInfo.username || 'usuário',
        name: userInfo.name || userInfo.username || 'Usuário Instagram',
        platform: 'instagram'
      };
    } else {
      console.log('Failed to fetch Instagram user info:', response.status);
    }
  } catch (error) {
    console.error('Error fetching Instagram user info:', error);
  }

  return {
    id: userId,
    name: 'Usuário Instagram',
    platform: 'instagram'
  };
}

// Determinar se deve responder automaticamente
async function shouldAutoRespondInstagram(conversation: any, message: string): Promise<boolean> {
  const now = new Date();
  const hour = now.getHours();
  
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
    'oi', 'olá', 'hello', 'hi',
    'informação', 'info', 'ajuda', 'help',
    'voo', 'flight', 'passagem', 'ticket',
    'preço', 'price', 'cotação', 'quote'
  ];
  
  const messageWords = message.toLowerCase().split(/\s+/);
  const hasTrigger = autoTriggers.some(trigger => 
    messageWords.some(word => word.includes(trigger))
  );
  
  return hasTrigger;
}

// Enviar resposta automática no Instagram
async function sendInstagramAutoResponse(recipientId: string, conversation: any) {
  try {
    const now = new Date();
    const hour = now.getHours();
    
    let autoMessage = '';
    
    if (hour < 9 || hour >= 18) {
      // Fora do horário comercial
      autoMessage = `🛫 Olá! Obrigado por entrar em contato com a Fly2Any!

🕐 Estamos fora do horário comercial
⏰ Atendimento: Seg-Sex 9h-18h (EST)

📱 Para atendimento imediato:
• WhatsApp: (555) 123-4567
• Site: www.fly2any.com

✈️ Retornaremos sua mensagem pela manhã!`;
    } else {
      // Horário comercial
      autoMessage = `🛫 Olá! Bem-vindo à Fly2Any! 

✈️ Especialistas em voos EUA ↔ Brasil
🎯 Como podemos ajudar hoje?

🚀 Serviços principais:
• Cotações personalizadas
• Melhores preços garantidos
• Suporte em português

📱 Continue aqui ou:
• WhatsApp: (555) 123-4567
• Site: www.fly2any.com`;
    }

    // Registrar mensagem automática no sistema
    await OmnichannelAPI.createMessage({
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: 'instagram',
      direction: 'outbound',
      content: autoMessage,
      is_automated: true,
      template_id: hour < 9 || hour >= 18 ? 'instagram_off_hours' : 'instagram_greeting',
      metadata: {
        auto_response: true,
        trigger_time: new Date().toISOString(),
        recipient_id: recipientId,
        platform: 'instagram'
      }
    });

    // Enviar via API do Instagram (se configurado)
    await sendInstagramMessage(recipientId, autoMessage);

    console.log('📸 Instagram auto-response sent:', {
      recipient: recipientId,
      conversation_id: conversation.id
    });

  } catch (error) {
    console.error('Error sending Instagram auto-response:', error);
  }
}

// Enviar mensagem via API do Instagram
async function sendInstagramMessage(recipientId: string, message: string) {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.log('Instagram access token not configured - message not sent');
      return;
    }

    const response = await fetch(
      `https://graph.instagram.com/v17.0/me/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message }
        })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Instagram message sent successfully:', result.message_id);
    } else {
      const error = await response.text();
      console.error('❌ Failed to send Instagram message:', error);
    }

  } catch (error) {
    console.error('Error sending Instagram message via API:', error);
  }
}

// Notificar agentes sobre nova mensagem do Instagram
async function notifyAgentsInstagram(conversation: any, messageContent: string, senderInfo: any) {
  try {
    console.log(`🔔 Notifying agents about new Instagram message in conversation ${conversation.id}`);
    
    const notificationData = {
      type: 'new_message',
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: 'instagram',
      message: messageContent,
      timestamp: new Date().toISOString(),
      priority: 'normal',
      metadata: {
        platform: 'instagram',
        sender: senderInfo,
        requires_response: true,
        is_dm: true
      }
    };

    // Enviar notificação em tempo real
    await fetch('/api/omnichannel/ws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });

    console.log('📸 Instagram notification sent to agents');
    
  } catch (error) {
    console.error('Error notifying agents about Instagram message:', error);
  }
}