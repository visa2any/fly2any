import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppOmnichannel } from '@/lib/omnichannel-api';

// POST /api/omnichannel/webhook/whatsapp - Processar mensagens do WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📱 Omnichannel WhatsApp webhook received:', JSON.stringify(body, null, 2));

    const { from, message, text, contactName, timestamp, messageId } = body;

    if (!from || (!message && !text)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: from, message/text'
      }, { status: 400 });
    }

    const messageContent = message || text;
    const metadata = {
      sender_name: contactName,
      timestamp,
      original_message_id: messageId,
      webhook_data: body
    };

    // Processar mensagem no sistema omnichannel
    const result = await WhatsAppOmnichannel.processWhatsAppMessage(
      from,
      messageContent,
      messageId || `wa_${Date.now()}`,
      metadata
    );

    console.log('✅ Message processed in omnichannel:', {
      conversationId: result.conversation.id,
      shouldAutoRespond: result.shouldAutoRespond
    });

    // Se não deve responder automaticamente, notificar agentes
    if (!result.shouldAutoRespond) {
      await notifyAgents(result.conversation, messageContent);
    }

    return NextResponse.json({
      success: true,
      conversation_id: result.conversation.id,
      auto_response_sent: result.shouldAutoRespond
    });

  } catch (error) {
    console.error('Error processing WhatsApp message in omnichannel:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Função auxiliar para notificar agentes
async function notifyAgents(conversation: { id: number; customer_id: number; channel: string }, messageContent: string) {
  try {
    // Implementar notificação em tempo real para agentes
    // Pode ser via WebSocket, Server-Sent Events, ou webhook
    console.log(`🔔 Notifying agents about new message in conversation ${conversation.id}`);
    
    // Exemplo de notificação via webhook interno
    const notificationData = {
      type: 'new_message',
      conversation_id: conversation.id,
      customer_id: conversation.customer_id,
      channel: conversation.channel,
      message: messageContent,
      timestamp: new Date().toISOString()
    };

    // Aqui você pode implementar:
    // - WebSocket para notificação em tempo real
    // - Envio para sistema de notificações
    // - Webhook para sistema externo (Slack, Teams, etc.)
    
  } catch (error) {
    console.error('Error notifying agents:', error);
  }
}