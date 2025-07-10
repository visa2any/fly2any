import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Webhook endpoint for N8N automations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔗 N8N New Ticket Webhook received:', JSON.stringify(body, null, 2));

    // Process different types of ticket events
    const result = await processTicketEvent(body);

    // Send to N8N for further automation
    await forwardToN8N(body);

    return NextResponse.json({
      success: true,
      message: 'Ticket event processed',
      result
    });

  } catch (error) {
    console.error('N8N new ticket webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function processTicketEvent(eventData: any) {
  const { type, sessionId, userInfo, transferReason, timestamp } = eventData;

  switch (type) {
    case 'human_transfer':
      return await handleHumanTransfer(sessionId, userInfo, transferReason);
    
    case 'new_lead':
      return await handleNewLead(userInfo, eventData.leadData);
    
    case 'high_priority':
      return await handleHighPriority(eventData);
    
    case 'whatsapp_new_conversation':
      return await handleWhatsAppNewConversation(eventData);
    
    default:
      console.log(`Unknown ticket event type: ${type}`);
      return null;
  }
}

async function handleHumanTransfer(sessionId: string, userInfo: any, transferReason?: string) {
  try {
    // Create support ticket
    const ticketResult = await sql`
      INSERT INTO support_tickets (
        session_id,
        source,
        user_name,
        user_email,
        user_phone,
        subject,
        message,
        priority,
        status,
        department
      ) VALUES (
        ${sessionId},
        'chat_transfer',
        ${userInfo?.name || 'Cliente via Chat'},
        ${userInfo?.email || ''},
        ${userInfo?.phone || ''},
        'Transferência do Chat para Humano',
        ${transferReason || 'Cliente solicitou falar com um especialista humano'},
        'high',
        'open',
        'sales'
      ) RETURNING id
    `;

    const ticketId = ticketResult.rows[0].id;

    // Create notification for agents
    await notifyAgents({
      type: 'human_transfer',
      ticketId,
      sessionId,
      userInfo,
      priority: 'high',
      message: `Cliente no chat solicitou transferência para humano. ${transferReason || ''}`
    });

    return { ticketId, action: 'human_transfer_created' };

  } catch (error) {
    console.error('Error handling human transfer:', error);
    return null;
  }
}

async function handleNewLead(userInfo: any, leadData: any) {
  try {
    // Create high priority ticket for new leads
    const ticketResult = await sql`
      INSERT INTO support_tickets (
        source,
        user_name,
        user_email,
        user_phone,
        subject,
        message,
        priority,
        status,
        department,
        metadata
      ) VALUES (
        'lead_form',
        ${userInfo?.name || 'Novo Lead'},
        ${userInfo?.email || ''},
        ${userInfo?.phone || ''},
        ${`Nova cotação: ${leadData?.serviceType || 'Serviço'}`},
        ${JSON.stringify(leadData)},
        'high',
        'open',
        'sales',
        ${JSON.stringify({ leadData, userInfo })}
      ) RETURNING id
    `;

    const ticketId = ticketResult.rows[0].id;

    // Trigger automation workflows
    await triggerLeadAutomation(ticketId, userInfo, leadData);

    return { ticketId, action: 'lead_ticket_created' };

  } catch (error) {
    console.error('Error handling new lead:', error);
    return null;
  }
}

async function handleHighPriority(eventData: any) {
  try {
    // Handle high priority events (VIP customers, urgent requests, etc.)
    const ticketResult = await sql`
      INSERT INTO support_tickets (
        source,
        user_name,
        user_email,
        user_phone,
        subject,
        message,
        priority,
        status,
        department
      ) VALUES (
        ${eventData.source || 'high_priority'},
        ${eventData.userInfo?.name || 'Cliente Prioritário'},
        ${eventData.userInfo?.email || ''},
        ${eventData.userInfo?.phone || ''},
        'Atendimento Prioritário',
        ${eventData.message || 'Solicitação de atendimento prioritário'},
        'urgent',
        'open',
        'sales'
      ) RETURNING id
    `;

    const ticketId = ticketResult.rows[0].id;

    // Immediate notification to managers
    await notifyManagers({
      type: 'urgent_ticket',
      ticketId,
      userInfo: eventData.userInfo,
      message: eventData.message
    });

    return { ticketId, action: 'urgent_ticket_created' };

  } catch (error) {
    console.error('Error handling high priority:', error);
    return null;
  }
}

async function handleWhatsAppNewConversation(eventData: any) {
  try {
    const { phone, message, contactName } = eventData.data;

    // Create ticket for new WhatsApp conversation
    const ticketResult = await sql`
      INSERT INTO support_tickets (
        source,
        user_name,
        user_phone,
        subject,
        message,
        priority,
        status,
        department
      ) VALUES (
        'whatsapp',
        ${contactName || 'Cliente WhatsApp'},
        ${phone},
        'Nova conversa WhatsApp',
        ${message},
        'normal',
        'open',
        'sales'
      ) RETURNING id
    `;

    const ticketId = ticketResult.rows[0].id;

    return { ticketId, action: 'whatsapp_ticket_created' };

  } catch (error) {
    console.error('Error handling WhatsApp conversation:', error);
    return null;
  }
}

async function notifyAgents(notification: any) {
  try {
    // Send to N8N agent notification workflow
    await fetch(process.env.N8N_WEBHOOK_AGENT_NOTIFICATION || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'agent_notification',
        data: notification,
        timestamp: new Date().toISOString()
      })
    });

    // Also save notification in database
    await sql`
      INSERT INTO notifications (
        type,
        recipient_type,
        title,
        message,
        priority,
        metadata
      ) VALUES (
        'ticket_assignment',
        'agent',
        'Novo Ticket - Ação Necessária',
        ${notification.message},
        ${notification.priority},
        ${JSON.stringify(notification)}
      )
    `;

  } catch (error) {
    console.error('Error notifying agents:', error);
  }
}

async function notifyManagers(notification: any) {
  try {
    // Send to N8N manager notification workflow
    await fetch(process.env.N8N_WEBHOOK_MANAGER_NOTIFICATION || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'manager_notification',
        data: notification,
        timestamp: new Date().toISOString()
      })
    });

  } catch (error) {
    console.error('Error notifying managers:', error);
  }
}

async function triggerLeadAutomation(ticketId: number, userInfo: any, leadData: any) {
  try {
    // Trigger multiple automation workflows
    const automations = [
      {
        webhook: process.env.N8N_WEBHOOK_LEAD_AUTOMATION,
        event: 'new_lead_automation',
        data: { ticketId, userInfo, leadData }
      },
      {
        webhook: process.env.N8N_WEBHOOK_EMAIL_AUTOMATION,
        event: 'send_welcome_email',
        data: { userInfo, leadData }
      },
      {
        webhook: process.env.N8N_WEBHOOK_CRM_SYNC,
        event: 'sync_to_crm',
        data: { ticketId, userInfo, leadData }
      }
    ];

    for (const automation of automations) {
      if (automation.webhook) {
        await fetch(automation.webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: automation.event,
            data: automation.data,
            timestamp: new Date().toISOString()
          })
        });
      }
    }

  } catch (error) {
    console.error('Error triggering lead automation:', error);
  }
}

async function forwardToN8N(eventData: any) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_TICKETS;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'ticket_event',
        data: eventData,
        timestamp: new Date().toISOString(),
        source: 'fly2any_system'
      })
    });

  } catch (error) {
    console.warn('N8N forward failed:', error);
  }
}