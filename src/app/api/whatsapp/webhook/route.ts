import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp';
import { WhatsAppOmnichannel } from '@/lib/omnichannel-api';
import { sql } from '@vercel/postgres';

// Webhook to receive incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Handle different types of webhooks
    if (body.entry && body.entry[0] && body.entry[0].changes) {
      // WhatsApp Business API format
      const changes = body.entry[0].changes[0];
      if (changes.field === 'messages' && changes.value.messages) {
        for (const message of changes.value.messages) {
          await handleIncomingMessage(message, changes.value.contacts);
        }
      }
    } else if (body.messages) {
      // Baileys format (more likely for our use case)
      for (const message of body.messages) {
        await whatsappService.handleIncomingMessage(message);
      }
    } else if (body.key && body.message) {
      // Single message format
      await whatsappService.handleIncomingMessage(body);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleIncomingMessage(message: any, contacts?: any[]) {
  try {
    const from = message.from;
    const text = message.text?.body || message.text || '';
    const timestamp = new Date(parseInt(message.timestamp) * 1000);

    // Get contact name if available
    const contact = contacts?.find(c => c.wa_id === from);
    const contactName = contact?.profile?.name || '';

    console.log(`📱 Incoming WhatsApp from ${from} (${contactName}): ${text}`);

    // Save to database
    await saveIncomingMessage(from, text, contactName, message.id);

    // Process with Omnichannel system
    try {
      const omnichannelResult = await WhatsAppOmnichannel.processWhatsAppMessage(
        from,
        text,
        message.id || `wa_${Date.now()}`,
        {
          sender_name: contactName,
          timestamp: timestamp.toISOString(),
          contact_data: contact
        }
      );

      console.log('✅ Message processed in omnichannel system:', {
        conversationId: omnichannelResult.conversation.id,
        shouldAutoRespond: omnichannelResult.shouldAutoRespond
      });

      // If omnichannel says not to auto-respond, skip auto-response
      if (!omnichannelResult.shouldAutoRespond) {
        console.log('🔇 Auto-response skipped by omnichannel system');
        return;
      }
    } catch (omnichannelError) {
      console.error('❌ Omnichannel processing failed:', omnichannelError);
      // Continue with fallback processing
    }

    // Create support ticket if this is a new conversation (fallback)
    const isNewConversation = await checkIfNewConversation(from);
    if (isNewConversation) {
      await createSupportTicket(from, text, contactName);
    }

    // Send to N8N for processing
    await notifyN8N({
      event: 'whatsapp_message_received',
      data: {
        from,
        text,
        contactName,
        timestamp: timestamp.toISOString(),
        messageId: message.id,
        isNewConversation
      }
    });

    // Auto-respond if outside business hours or based on intent
    await processAutoResponse(from, text);

  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
}

async function saveIncomingMessage(phone: string, content: string, contactName: string, whatsappId?: string) {
  try {
    // Get or create conversation
    let conversationResult = await sql`
      SELECT id FROM whatsapp_conversations WHERE phone = ${phone}
    `;

    if (conversationResult.rows.length === 0) {
      conversationResult = await sql`
        INSERT INTO whatsapp_conversations (phone, name, status)
        VALUES (${phone}, ${contactName}, 'active')
        RETURNING id
      `;
    } else if (contactName) {
      // Update contact name if we have it
      await sql`
        UPDATE whatsapp_conversations 
        SET name = ${contactName}, updated_at = CURRENT_TIMESTAMP
        WHERE phone = ${phone}
      `;
    }

    const conversationId = conversationResult.rows[0].id;

    // Save message
    await sql`
      INSERT INTO whatsapp_messages (conversation_id, phone, content, direction, whatsapp_id)
      VALUES (${conversationId}, ${phone}, ${content}, 'inbound', ${whatsappId || null})
    `;

  } catch (error) {
    console.error('Error saving incoming message:', error);
  }
}

async function checkIfNewConversation(phone: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT COUNT(*) as message_count
      FROM whatsapp_messages 
      WHERE phone = ${phone}
      AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    `;

    return parseInt(result.rows[0].message_count) <= 1; // First message in 24h
  } catch (error) {
    console.error('Error checking conversation:', error);
    return false;
  }
}

async function createSupportTicket(phone: string, firstMessage: string, contactName: string) {
  try {
    // Create support ticket for new WhatsApp conversations
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'whatsapp',
        phone,
        name: contactName,
        subject: 'Nova conversa WhatsApp',
        message: firstMessage,
        priority: 'normal',
        department: 'sales'
      })
    });

    console.log(`🎫 Created support ticket for WhatsApp conversation: ${phone}`);
  } catch (error) {
    console.error('Error creating support ticket:', error);
  }
}

async function processAutoResponse(phone: string, message: string) {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Check if it's business hours
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const hour = easternTime.getHours();
    const day = easternTime.getDay();
    
    const isBusinessHours = (day >= 1 && day <= 5 && hour >= 9 && hour < 18) || 
                           (day === 6 && hour >= 9 && hour < 14);

    // Auto-responses based on keywords
    if (lowerMessage.includes('preço') || lowerMessage.includes('cotação') || lowerMessage.includes('valor')) {
      await whatsappService.sendTemplate(phone, 'quote_ready', [
        'Voo personalizado',
        'A partir de $650',
        '48 horas'
      ]);
    } else if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('bom dia')) {
      await whatsappService.sendTemplate(phone, 'welcome', []);
    } else if (!isBusinessHours) {
      await whatsappService.sendMessage(phone, `🕐 Obrigado por entrar em contato!

Estamos fora do horário comercial, mas sua mensagem foi recebida e um especialista retornará pela manhã.

⏰ **Horário de Atendimento:**
Seg-Sex: 9h-18h (EST)
Sáb: 9h-14h (EST)

🚨 **Emergências:** Respondemos 24h via WhatsApp

Tenha uma ótima ${hour < 12 ? 'madrugada' : hour < 18 ? 'tarde' : 'noite'}! 😊`);
    } else {
      // During business hours, just acknowledge
      await whatsappService.sendMessage(phone, `👋 Olá! Recebemos sua mensagem e um de nossos especialistas responderá em instantes.

💬 Enquanto isso, pode nos contar mais detalhes sobre sua viagem EUA-Brasil que te ajudaremos melhor!`);
    }

  } catch (error) {
    console.error('Error processing auto-response:', error);
  }
}

async function notifyN8N(data: any) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_WHATSAPP;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.warn('N8N notification failed:', error);
  }
}

// Verification endpoint for WhatsApp webhook setup
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook with WhatsApp
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    return new NextResponse(challenge);
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}