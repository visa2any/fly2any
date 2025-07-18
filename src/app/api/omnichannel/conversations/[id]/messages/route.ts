import { NextRequest, NextResponse } from 'next/server';
import OmnichannelAPI from '@/lib/omnichannel-api';

// GET /api/omnichannel/conversations/[id]/messages - Buscar mensagens de uma conversa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    
    if (isNaN(conversationId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid conversation ID'
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const order = searchParams.get('order') || 'asc'; // asc ou desc

    console.log(`📨 Fetching messages for conversation ${conversationId}`);

    // Verificar se a conversa existe
    const conversation = await OmnichannelAPI.getConversationWithDetails(conversationId);
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 });
    }

    // Buscar mensagens da conversa
    const messages = await OmnichannelAPI.getConversationMessages(
      conversationId, 
      limit
    );

    // Marcar mensagens como lidas se necessário (para cada mensagem)
    for (const message of messages) {
      if (message.direction === 'inbound' && !message.read_at) {
        try {
          await OmnichannelAPI.markMessageAsRead(message.id);
        } catch (error) {
          console.warn(`Could not mark message ${message.id} as read:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      messages,
      conversation_id: conversationId,
      total: messages.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/omnichannel/conversations/[id]/messages - Enviar nova mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    
    if (isNaN(conversationId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid conversation ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { 
      content, 
      sender_type = 'agent', 
      sender_name = 'Agent',
      channel,
      metadata 
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message content is required'
      }, { status: 400 });
    }

    console.log(`📨 Sending message to conversation ${conversationId}:`, {
      content: content.substring(0, 50) + '...',
      sender_type,
      channel
    });

    // Verificar se a conversa existe
    const conversation = await OmnichannelAPI.getConversationWithDetails(conversationId);
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: 'Conversation not found'
      }, { status: 404 });
    }

    // Criar a mensagem na base de dados
    const message = await OmnichannelAPI.createMessage({
      conversation_id: conversationId,
      customer_id: conversation.customer_id,
      content: content.trim(),
      direction: sender_type === 'agent' ? 'outbound' : 'inbound',
      message_type: 'text',
      sender_name,
      channel: channel || conversation.channel,
      is_automated: sender_type === 'system',
      metadata: metadata || {},
      created_at: new Date()
    });

    // Enviar a mensagem via canal apropriado
    if (sender_type === 'agent') {
      await sendMessageViaChannel(conversation, content.trim(), metadata);
    }

    // Reabrir a conversa se estava fechada (usando método disponível)
    if (conversation.status === 'closed' || conversation.status === 'resolved') {
      await OmnichannelAPI.updateConversationStatus(conversationId, 'open');
    }

    // Enviar notificação em tempo real
    await sendRealtimeNotification(conversationId, message, conversation);

    return NextResponse.json({
      success: true,
      message,
      conversation_updated: true
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Função para enviar mensagem via canal específico
async function sendMessageViaChannel(
  conversation: any, 
  content: string, 
  metadata?: any
): Promise<void> {
  try {
    const channel = conversation.channel;
    const customer = conversation.customer;

    console.log(`📤 Sending via ${channel} to customer ${customer?.id || 'unknown'}`);

    switch (channel) {
      case 'whatsapp':
        await sendWhatsAppMessage(customer, content, metadata);
        break;
        
      case 'email':
        await sendEmailMessage(customer, content, metadata);
        break;
        
      case 'sms':
        await sendSMSMessage(customer, content, metadata);
        break;
        
      case 'telegram':
        await sendTelegramMessage(customer, content, metadata);
        break;
        
      case 'instagram':
        await sendInstagramMessage(customer, content, metadata);
        break;
        
      case 'facebook':
        await sendFacebookMessage(customer, content, metadata);
        break;
        
      case 'webchat':
        // Web chat é gerenciado via WebSocket, não precisa envio externo
        console.log('💬 Web chat message - no external send needed');
        break;
        
      default:
        console.warn(`❓ Unsupported channel for sending: ${channel}`);
    }

  } catch (error) {
    console.error(`❌ Error sending message via ${conversation.channel}:`, error);
    // Não falhar a criação da mensagem se o envio via canal falhar
  }
}

// Funções específicas de envio por canal
async function sendWhatsAppMessage(customer: any, content: string, metadata?: any) {
  const response = await fetch('/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customer.phone || customer.whatsapp_number,
      message: content,
      type: 'reply',
      metadata
    })
  });

  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${response.status}`);
  }
}

async function sendEmailMessage(customer: any, content: string, metadata?: any) {
  const response = await fetch('/api/email-marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customer.email,
      subject: metadata?.subject || 'Resposta Fly2Any',
      message: content,
      type: 'reply',
      metadata
    })
  });

  if (!response.ok) {
    throw new Error(`Email send failed: ${response.status}`);
  }
}

async function sendSMSMessage(customer: any, content: string, metadata?: any) {
  const response = await fetch('/api/omnichannel/webhook/sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customer.phone,
      message: content,
      type: 'reply',
      metadata
    })
  });

  if (!response.ok) {
    throw new Error(`SMS send failed: ${response.status}`);
  }
}

async function sendTelegramMessage(customer: any, content: string, metadata?: any) {
  const response = await fetch('/api/omnichannel/webhook/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: customer.telegram_chat_id || customer.external_id,
      text: content,
      type: 'reply',
      metadata
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram send failed: ${response.status}`);
  }
}

async function sendInstagramMessage(customer: any, content: string, metadata?: any) {
  const response = await fetch('/api/omnichannel/webhook/instagram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: customer.instagram_id || customer.external_id },
      message: { text: content },
      type: 'reply',
      metadata
    })
  });

  if (!response.ok) {
    throw new Error(`Instagram send failed: ${response.status}`);
  }
}

async function sendFacebookMessage(customer: any, content: string, metadata?: any) {
  const response = await fetch('/api/omnichannel/webhook/facebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: customer.facebook_id || customer.external_id },
      message: { text: content },
      type: 'reply',
      metadata
    })
  });

  if (!response.ok) {
    throw new Error(`Facebook send failed: ${response.status}`);
  }
}

// Função para enviar notificação em tempo real
async function sendRealtimeNotification(
  conversationId: number, 
  message: any, 
  conversation: any
): Promise<void> {
  try {
    const response = await fetch('/api/omnichannel/ws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_message',
        conversationId,
        customerId: conversation.customer?.id,
        agentId: conversation.agent_id,
        channel: conversation.channel,
        content: message.content,
        priority: conversation.priority || 'normal',
        metadata: {
          messageId: message.id,
          sender: message.sender_name,
          timestamp: message.created_at
        }
      })
    });

    if (response.ok) {
      console.log('📡 Real-time notification sent successfully');
    } else {
      console.warn('⚠️ Failed to send real-time notification:', response.status);
    }
  } catch (error) {
    console.error('❌ Error sending real-time notification:', error);
  }
}