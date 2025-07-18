import { NextRequest, NextResponse } from 'next/server';
import OmnichannelAPI from '@/lib/omnichannel-api';

// GET /api/omnichannel/messages - Lista mensagens de uma conversa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: 'conversation_id is required'
      }, { status: 400 });
    }

    const messages = await OmnichannelAPI.getConversationMessages(
      parseInt(conversationId),
      limit
    );

    return NextResponse.json({
      success: true,
      messages,
      total: messages.length
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/omnichannel/messages - Enviar nova mensagem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversation_id,
      customer_id,
      channel,
      content,
      message_type = 'text',
      agent_id,
      template_id,
      metadata = {}
    } = body;

    if (!conversation_id || !customer_id || !channel || !content) {
      return NextResponse.json({
        success: false,
        error: 'conversation_id, customer_id, channel, and content are required'
      }, { status: 400 });
    }

    // Criar mensagem no banco
    const message = await OmnichannelAPI.createMessage({
      conversation_id,
      customer_id,
      channel,
      direction: 'outbound',
      content,
      message_type,
      agent_id,
      template_id,
      metadata
    });

    // Enviar mensagem através do canal apropriado
    let messageSent = false;
    
    if (channel === 'whatsapp') {
      // Usar o serviço WhatsApp existente
      const { whatsappService } = await import('@/lib/whatsapp');
      const customer = await OmnichannelAPI.getCustomerById(customer_id);
      
      if (customer?.whatsapp_id) {
        messageSent = await whatsappService.sendMessage(customer.whatsapp_id, content);
      }
    } else if (channel === 'email') {
      // Implementar envio de email
      // messageSent = await sendEmail(customer.email, content);
    }

    return NextResponse.json({
      success: true,
      message,
      sent: messageSent
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}