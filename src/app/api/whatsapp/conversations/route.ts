import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Get WhatsApp conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50');

    const conversations = await sql`
      SELECT 
        wc.*,
        COUNT(wm.id) as message_count,
        MAX(wm.created_at) as last_message_at,
        (
          SELECT content 
          FROM whatsapp_messages 
          WHERE conversation_id = wc.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as recent_message
      FROM whatsapp_conversations wc
      LEFT JOIN whatsapp_messages wm ON wc.id = wm.conversation_id
      WHERE wc.status = ${status}
      GROUP BY wc.id
      ORDER BY wc.updated_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      conversations: conversations.rows,
      count: conversations.rows.length
    });

  } catch (error) {
    console.error('Get WhatsApp conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// Create or update WhatsApp conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, status = 'active' } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingResult = await sql`
      SELECT id FROM whatsapp_conversations WHERE phone = ${phone}
    `;

    let conversationId;

    if (existingResult.rows.length > 0) {
      // Update existing conversation
      const updateResult = await sql`
        UPDATE whatsapp_conversations 
        SET 
          name = COALESCE(${name}, name),
          status = ${status},
          updated_at = CURRENT_TIMESTAMP
        WHERE phone = ${phone}
        RETURNING id
      `;
      conversationId = updateResult.rows[0].id;
    } else {
      // Create new conversation
      const createResult = await sql`
        INSERT INTO whatsapp_conversations (phone, name, status)
        VALUES (${phone}, ${name}, ${status})
        RETURNING id
      `;
      conversationId = createResult.rows[0].id;
    }

    return NextResponse.json({
      success: true,
      conversationId,
      message: 'Conversation created/updated successfully'
    });

  } catch (error) {
    console.error('Create/update WhatsApp conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to create/update conversation' },
      { status: 500 }
    );
  }
}