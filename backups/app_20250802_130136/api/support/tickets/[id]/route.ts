import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Get specific ticket details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ticketId = parseInt(resolvedParams.id);
    
    const ticketResult = await sql`
      SELECT 
        st.*,
        COUNT(tm.id) as message_count,
        MAX(tm.created_at) as last_message_at
      FROM support_tickets st
      LEFT JOIN ticket_messages tm ON st.id = tm.ticket_id
      WHERE st.id = ${ticketId}
      GROUP BY st.id
    `;

    if (ticketResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: ticketResult.rows[0]
    });

  } catch (error) {
    console.error('Get ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// Update ticket (status, assignment, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ticketId = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const {
      status,
      priority,
      assigned_to,
      department
    } = body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }
    
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(assigned_to);
    }
    
    if (department !== undefined) {
      updates.push(`department = $${paramIndex++}`);
      values.push(department);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add closed_at timestamp if status is being set to closed
    if (status === 'closed') {
      updates.push(`closed_at = CURRENT_TIMESTAMP`);
    } else if (status && status !== 'closed') {
      updates.push(`closed_at = NULL`);
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Execute update
    const updateQuery = `
      UPDATE support_tickets 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    values.push(ticketId);
    
    const result = await sql.query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const updatedTicket = result.rows[0];

    // Add system message about the update
    if (status) {
      const statusMessages = {
        'open': 'Ticket reaberto',
        'in_progress': 'Ticket em andamento',
        'closed': 'Ticket fechado'
      };

      await sql`
        INSERT INTO ticket_messages (
          ticket_id,
          sender_type,
          sender_name,
          message,
          message_type
        ) VALUES (
          ${ticketId},
          'system',
          'Sistema',
          ${statusMessages[status as keyof typeof statusMessages] || `Status alterado para: ${status}`},
          'system'
        )
      `;
    }

    // Send to N8N for automation
    await notifyN8N({
      event: 'ticket_updated',
      data: {
        ticketId,
        changes: { status, priority, assigned_to, department },
        ticket: updatedTicket,
        timestamp: new Date().toISOString()
      }
    });

    // Send notifications based on changes
    if (status === 'closed') {
      await notifyTicketClosure(ticketId, updatedTicket);
    } else if (assigned_to) {
      await notifyAgentAssignment(ticketId, assigned_to, updatedTicket);
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      message: 'Ticket updated successfully'
    });

  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// Delete ticket (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const ticketId = parseInt(resolvedParams.id);
    
    // Soft delete by setting status to 'deleted'
    const result = await sql`
      UPDATE support_tickets 
      SET 
        status = 'deleted',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${ticketId}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully'
    });

  } catch (error) {
    console.error('Delete ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}

async function notifyTicketClosure(ticketId: number, ticket: any) {
  try {
    // Notify customer about closure
    if (ticket.user_email) {
      await fetch(process.env.N8N_WEBHOOK_EMAIL_NOTIFICATION || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'ticket_closed',
          data: {
            to: ticket.user_email,
            subject: `Ticket #${ticketId} foi resolvido - ${ticket.subject}`,
            message: `Olá ${ticket.user_name},\n\nSeu ticket #${ticketId} foi marcado como resolvido.\n\nSe você ainda tiver dúvidas, pode responder este email ou entrar em contato conosco.\n\nObrigado por escolher a Fly2Any!\n\nEquipe de Suporte`,
            ticketId,
            customerName: ticket.user_name
          }
        })
      });
    }

    // Send WhatsApp notification if applicable
    if (ticket.user_phone && ticket.source === 'whatsapp') {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: ticket.user_phone,
          message: `✅ *Ticket #${ticketId} Resolvido*\n\nSua solicitação foi finalizada com sucesso!\n\nSe precisar de mais alguma coisa, é só enviar uma mensagem.\n\n_Fly2Any - Obrigado pela preferência! 😊_`
        })
      });
    }

  } catch (error) {
    console.error('Error notifying ticket closure:', error);
  }
}

async function notifyAgentAssignment(ticketId: number, agentId: string, ticket: any) {
  try {
    // Notify agent about assignment
    await fetch(process.env.N8N_WEBHOOK_AGENT_NOTIFICATION || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'ticket_assigned',
        data: {
          agentId,
          ticketId,
          ticket,
          message: `Ticket #${ticketId} foi atribuído a você - ${ticket.subject}`,
          priority: ticket.priority,
          customerName: ticket.user_name,
          source: ticket.source
        }
      })
    });

  } catch (error) {
    console.error('Error notifying agent assignment:', error);
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