import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface CreateTicketRequest {
  sessionId?: string;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  messages?: any[];
  source: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  department: string;
  subject?: string;
  message?: string;
  name?: string;
  email?: string;
  phone?: string;
}

async function initializeSupportTables() {
  try {
    // Support tickets table
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100),
        source VARCHAR(50) NOT NULL,
        user_name VARCHAR(100),
        user_email VARCHAR(100),
        user_phone VARCHAR(50),
        subject VARCHAR(200),
        message TEXT,
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'open',
        department VARCHAR(50) DEFAULT 'sales',
        assigned_to VARCHAR(100),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Ticket messages/responses table
    await sql`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER REFERENCES support_tickets(id),
        sender_type VARCHAR(20) NOT NULL, -- 'customer', 'agent', 'system'
        sender_name VARCHAR(100),
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        attachments JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipient_type VARCHAR(20) NOT NULL, -- 'agent', 'manager', 'customer'
        recipient_id VARCHAR(100),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'unread',
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_department ON support_tickets(department);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at);
      CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, recipient_id);
    `;

    console.log('✅ Support tables initialized');

  } catch (error) {
    console.error('Error initializing support tables:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeSupportTables();
    
    const body: CreateTicketRequest = await request.json();
    
    // Extract data from request
    const {
      sessionId,
      userInfo,
      messages,
      source,
      priority = 'normal',
      department = 'sales',
      subject,
      message,
      name,
      email,
      phone
    } = body;

    // Use userInfo or direct fields
    const ticketName = name || userInfo?.name || 'Cliente';
    const ticketEmail = email || userInfo?.email || '';
    const ticketPhone = phone || userInfo?.phone || '';
    const ticketSubject = subject || `${source} - ${new Date().toLocaleDateString('pt-BR')}`;
    const ticketMessage = message || (messages && messages.length > 0 ? 
      messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n\n') : 
      'Novo ticket de suporte');

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
        department,
        metadata
      ) VALUES (
        ${sessionId || null},
        ${source},
        ${ticketName},
        ${ticketEmail},
        ${ticketPhone},
        ${ticketSubject},
        ${ticketMessage},
        ${priority},
        'open',
        ${department},
        ${JSON.stringify({ userInfo, originalMessages: messages })}
      ) RETURNING id
    `;

    const ticketId = ticketResult.rows[0].id;

    // Add initial message if provided
    if (ticketMessage) {
      await sql`
        INSERT INTO ticket_messages (ticket_id, sender_type, sender_name, message)
        VALUES (${ticketId}, 'customer', ${ticketName}, ${ticketMessage})
      `;
    }

    // Add chat history if provided
    if (messages && messages.length > 0) {
      for (const msg of messages.slice(-10)) { // Last 10 messages
        await sql`
          INSERT INTO ticket_messages (
            ticket_id, 
            sender_type, 
            sender_name, 
            message,
            created_at
          ) VALUES (
            ${ticketId}, 
            ${msg.sender === 'user' ? 'customer' : 'agent'}, 
            ${msg.sender === 'user' ? ticketName : 'Ana (AI)'}, 
            ${msg.content},
            ${msg.timestamp}
          )
        `;
      }
    }

    // Create notifications based on priority
    await createTicketNotifications(ticketId, priority, department, {
      name: ticketName,
      email: ticketEmail,
      phone: ticketPhone,
      subject: ticketSubject,
      source
    });

    // Send to N8N for automation
    await triggerN8NWorkflows(ticketId, {
      source,
      priority,
      department,
      userInfo: { name: ticketName, email: ticketEmail, phone: ticketPhone },
      subject: ticketSubject,
      message: ticketMessage
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Support ticket created successfully'
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeSupportTables();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const priority = searchParams.get('priority');
    const department = searchParams.get('department');
    const limit = parseInt(searchParams.get('limit') || '50');

    let tickets;
    if (priority && department) {
      tickets = await sql`
        SELECT 
          st.*,
          COUNT(tm.id) as message_count,
          MAX(tm.created_at) as last_message_at
        FROM support_tickets st
        LEFT JOIN ticket_messages tm ON st.id = tm.ticket_id
        WHERE st.status = ${status}
          AND st.priority = ${priority}
          AND st.department = ${department}
        GROUP BY st.id
        ORDER BY 
          CASE st.priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'low' THEN 4 
          END,
          st.created_at DESC
        LIMIT ${limit}
      `;
    } else if (priority) {
      tickets = await sql`
        SELECT 
          st.*,
          COUNT(tm.id) as message_count,
          MAX(tm.created_at) as last_message_at
        FROM support_tickets st
        LEFT JOIN ticket_messages tm ON st.id = tm.ticket_id
        WHERE st.status = ${status}
          AND st.priority = ${priority}
        GROUP BY st.id
        ORDER BY 
          CASE st.priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'low' THEN 4 
          END,
          st.created_at DESC
        LIMIT ${limit}
      `;
    } else if (department) {
      tickets = await sql`
        SELECT 
          st.*,
          COUNT(tm.id) as message_count,
          MAX(tm.created_at) as last_message_at
        FROM support_tickets st
        LEFT JOIN ticket_messages tm ON st.id = tm.ticket_id
        WHERE st.status = ${status}
          AND st.department = ${department}
        GROUP BY st.id
        ORDER BY 
          CASE st.priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'low' THEN 4 
          END,
          st.created_at DESC
        LIMIT ${limit}
      `;
    } else {
      tickets = await sql`
        SELECT 
          st.*,
          COUNT(tm.id) as message_count,
          MAX(tm.created_at) as last_message_at
        FROM support_tickets st
        LEFT JOIN ticket_messages tm ON st.id = tm.ticket_id
        WHERE st.status = ${status}
        GROUP BY st.id
        ORDER BY 
          CASE st.priority 
            WHEN 'urgent' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'normal' THEN 3 
            WHEN 'low' THEN 4 
          END,
          st.created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({
      success: true,
      tickets: tickets.rows,
      count: tickets.rows.length
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

async function createTicketNotifications(ticketId: number, priority: string, department: string, ticketInfo: any) {
  try {
    const notificationTitle = `Novo Ticket #${ticketId} - ${priority.toUpperCase()}`;
    const notificationMessage = `${ticketInfo.name} (${ticketInfo.source}) - ${ticketInfo.subject}`;

    // Notify agents in the department
    await sql`
      INSERT INTO notifications (
        type,
        recipient_type,
        title,
        message,
        priority,
        metadata
      ) VALUES (
        'new_ticket',
        'agent',
        ${notificationTitle},
        ${notificationMessage},
        ${priority},
        ${JSON.stringify({ ticketId, department, ...ticketInfo })}
      )
    `;

    // Notify managers if high priority
    if (priority === 'high' || priority === 'urgent') {
      await sql`
        INSERT INTO notifications (
          type,
          recipient_type,
          title,
          message,
          priority,
          metadata
        ) VALUES (
          'urgent_ticket',
          'manager',
          ${`🚨 ${notificationTitle}`},
          ${`URGENTE: ${notificationMessage}`},
          ${priority},
          ${JSON.stringify({ ticketId, department, ...ticketInfo })}
        )
      `;
    }

  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}

async function triggerN8NWorkflows(ticketId: number, ticketData: any) {
  try {
    const workflows = [
      {
        webhook: process.env.N8N_WEBHOOK_NEW_TICKET,
        event: 'new_ticket_created'
      },
      {
        webhook: process.env.N8N_WEBHOOK_AGENT_ASSIGNMENT,
        event: 'assign_agent'
      }
    ];

    // Add priority-specific workflows
    if (ticketData.priority === 'urgent' || ticketData.priority === 'high') {
      workflows.push({
        webhook: process.env.N8N_WEBHOOK_URGENT_TICKET,
        event: 'urgent_ticket_created'
      });
    }

    // Add source-specific workflows
    if (ticketData.source === 'chat_transfer') {
      workflows.push({
        webhook: process.env.N8N_WEBHOOK_CHAT_TRANSFER,
        event: 'chat_transfer_created'
      });
    }

    // Execute all workflows
    for (const workflow of workflows) {
      if (workflow.webhook) {
        await fetch(workflow.webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: workflow.event,
            data: {
              ticketId,
              ...ticketData,
              timestamp: new Date().toISOString()
            }
          })
        });
      }
    }

    console.log(`🔗 Triggered ${workflows.length} N8N workflows for ticket #${ticketId}`);

  } catch (error) {
    console.warn('N8N workflow trigger failed:', error);
  }
}
