import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Get messages for a specific ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ticketId = parseInt(resolvedParams.id);
    
    const messages = await sql`
      SELECT 
        id,
        ticket_id,
        sender_type,
        sender_name,
        message,
        message_type,
        attachments,
        created_at
      FROM ticket_messages 
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      success: true,
      messages: messages.rows
    });

  } catch (error) {
    console.error('Get ticket messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket messages' },
      { status: 500 }
    );
  }
}

// Add message to a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ticketId = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const {
      message,
      sender_type = 'agent',
      sender_name = 'Agente',
      message_type = 'text',
      attachments
    } = body;

    // Add message
    await sql`
      INSERT INTO ticket_messages (
        ticket_id,
        sender_type,
        sender_name,
        message,
        message_type,
        attachments
      ) VALUES (
        ${ticketId},
        ${sender_type},
        ${sender_name},
        ${message},
        ${message_type},
        ${JSON.stringify(attachments || null)}
      )
    `;

    // Update ticket status if it was closed
    await sql`
      UPDATE support_tickets 
      SET 
        status = CASE 
          WHEN status = 'closed' AND ${sender_type} = 'customer' THEN 'open'
          WHEN status = 'open' AND ${sender_type} = 'agent' THEN 'in_progress'
          ELSE status 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${ticketId}
    `;

    // Send notification if message is from agent
    if (sender_type === 'agent') {
      await notifyCustomer(ticketId, message);
    }

    // Send to N8N for automation
    await notifyN8N({
      event: 'ticket_message_added',
      data: {
        ticketId,
        message,
        senderType: sender_type,
        senderName: sender_name,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Message added successfully'
    });

  } catch (error) {
    console.error('Add ticket message error:', error);
    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

async function notifyCustomer(ticketId: number, message: string) {
  try {
    // Get ticket info for notification
    const ticketResult = await sql`
      SELECT user_email, user_phone, user_name, subject, source
      FROM support_tickets 
      WHERE id = ${ticketId}
    `;

    if (ticketResult.rows.length === 0) return;

    const ticket = ticketResult.rows[0];

    // Send email notification if email available
    if (ticket.user_email) {
      await fetch(process.env.N8N_WEBHOOK_EMAIL_NOTIFICATION || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ticket_response',
          data: {
            to: ticket.user_email,
            subject: `Resposta do seu ticket #${ticketId} - ${ticket.subject}`,
            message: `Olá ${ticket.user_name},\n\nRecebemos uma nova resposta para seu ticket:\n\n"${message}"\n\nVocê pode acompanhar o andamento em nosso site.\n\nFly2Any - Equipe de Suporte`,
            ticketId,
            customerName: ticket.user_name
          }
        })
      });
    }

    // Send WhatsApp notification if phone available and source is WhatsApp
    if (ticket.user_phone && ticket.source === 'whatsapp') {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: ticket.user_phone,
          message: `📩 *Resposta do Ticket #${ticketId}*\n\n${message}\n\n_Fly2Any - Equipe de Suporte_`
        })
      });
    }

  } catch (error) {
    console.error('Error notifying customer:', error);
  }
}

async function notifyN8N(data: any) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_TICKET_UPDATES;
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