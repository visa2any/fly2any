import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '@/lib/whatsapp';
import { sql } from '@vercel/postgres';

interface SendMessageRequest {
  to: string;
  message: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateParams?: string[];
}

async function initializeWhatsAppTables() {
  try {
    // WhatsApp conversations table
    await sql`
      CREATE TABLE IF NOT EXISTS whatsapp_conversations (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(50) NOT NULL,
        name VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // WhatsApp messages table
    await sql`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES whatsapp_conversations(id),
        phone VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        direction VARCHAR(10) NOT NULL, -- 'inbound' or 'outbound'
        message_type VARCHAR(20) DEFAULT 'text',
        status VARCHAR(20) DEFAULT 'sent',
        whatsapp_id VARCHAR(100),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations(phone);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at);
    `;

  } catch (error) {
    console.error('Error initializing WhatsApp tables:', error);
  }
}

async function saveMessage(phone: string, content: string, direction: 'inbound' | 'outbound', messageType: string = 'text', whatsappId?: string) {
  try {
    // Get or create conversation
    let conversationResult = await sql`
      SELECT id FROM whatsapp_conversations WHERE phone = ${phone}
    `;

    if (conversationResult.rows.length === 0) {
      conversationResult = await sql`
        INSERT INTO whatsapp_conversations (phone, status)
        VALUES (${phone}, 'active')
        RETURNING id
      `;
    }

    const conversationId = conversationResult.rows[0].id;

    // Save message
    await sql`
      INSERT INTO whatsapp_messages (conversation_id, phone, content, direction, message_type, whatsapp_id)
      VALUES (${conversationId}, ${phone}, ${content}, ${direction}, ${messageType}, ${whatsappId || null})
    `;

    // Update conversation timestamp
    await sql`
      UPDATE whatsapp_conversations 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${conversationId}
    `;

  } catch (error) {
    console.error('Error saving WhatsApp message:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeWhatsAppTables();
    
    const body: SendMessageRequest = await request.json();
    const { to, message, type = 'text', templateName, templateParams } = body;

    // Validate input
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Initialize WhatsApp service if not already done
    if (!whatsappService.isConnectedStatus()) {
      await whatsappService.initialize();
    }

    let success = false;
    
    if (type === 'template' && templateName) {
      success = await whatsappService.sendTemplate(to, templateName, templateParams || []);
    } else {
      success = await whatsappService.sendMessage(to, message);
    }

    if (success) {
      // Save message to database
      await saveMessage(to, message, 'outbound', type);
      
      // Send to N8N for tracking
      try {
        await fetch(process.env.N8N_WEBHOOK_WHATSAPP || '', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'message_sent',
            data: {
              to,
              message,
              type,
              templateName,
              timestamp: new Date().toISOString()
            }
          })
        });
      } catch (webhookError) {
        console.warn('N8N webhook failed:', webhookError);
      }

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('WhatsApp send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    await initializeWhatsAppTables();

    const messages = await sql`
      SELECT 
        wm.*,
        wc.name as contact_name
      FROM whatsapp_messages wm
      JOIN whatsapp_conversations wc ON wm.conversation_id = wc.id
      WHERE wm.phone = ${phone}
      ORDER BY wm.created_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      messages: messages.rows.reverse(), // Show oldest first
      count: messages.rows.length
    });

  } catch (error) {
    console.error('WhatsApp history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation history' },
      { status: 500 }
    );
  }
}