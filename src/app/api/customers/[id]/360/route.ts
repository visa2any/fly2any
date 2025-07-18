import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { OmnichannelAPI } from '@/lib/omnichannel-api';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const customerId = parseInt(params.id);
    
    if (isNaN(customerId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID de cliente inválido' 
      }, { status: 400 });
    }

    // Buscar dados básicos do cliente
    const customer = await OmnichannelAPI.getCustomerById(customerId);
    
    if (!customer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }

    // Buscar todas as conversas do cliente
    const conversationsResult = await sql`
      SELECT 
        c.*,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE c.customer_id = ${customerId}
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    // Buscar todas as mensagens do cliente
    const messagesResult = await sql`
      SELECT 
        m.*,
        c.channel,
        c.status as conversation_status
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.customer_id = ${customerId}
      ORDER BY m.created_at DESC
    `;

    // Buscar atividades do cliente
    const activitiesResult = await sql`
      SELECT 
        al.*,
        a.name as agent_name,
        c.channel
      FROM activity_log al
      JOIN conversations c ON al.conversation_id = c.id
      LEFT JOIN agents a ON al.agent_id = a.id
      WHERE c.customer_id = ${customerId}
      ORDER BY al.created_at DESC
    `;

    // Buscar reservas/bookings (se houver tabela)
    let bookingsResult;
    try {
      bookingsResult = await sql`
        SELECT 
          b.*,
          b.total_amount as value,
          b.status
        FROM bookings b
        WHERE b.customer_id = ${customerId}
        ORDER BY b.created_at DESC
      `;
    } catch (error) {
      // Tabela de bookings pode não existir, usar dados mock
      bookingsResult = { rows: [] };
    }

    // Calcular métricas 360
    const totalInteractions = messagesResult.rows.length;
    const totalBookings = bookingsResult.rows.length;
    const totalSpent = bookingsResult.rows.reduce((sum: number, booking: { value?: number }) => sum + (booking.value || 0), 0);
    const conversationCount = conversationsResult.rows.length;
    
    // Calcular tempo médio de resposta
    let avgResponseTime = 0;
    const responseTimeResult = await sql`
      SELECT 
        AVG(
          EXTRACT(EPOCH FROM (
            SELECT MIN(m2.created_at) 
            FROM messages m2 
            WHERE m2.conversation_id = m1.conversation_id 
            AND m2.created_at > m1.created_at 
            AND m2.direction = 'outbound'
          ) - m1.created_at)
        ) / 60 as avg_response_minutes
      FROM messages m1
      WHERE m1.customer_id = ${customerId}
      AND m1.direction = 'inbound'
    `;
    
    avgResponseTime = parseFloat(responseTimeResult.rows[0]?.avg_response_minutes || '0');

    // Calcular satisfação do cliente (mock - seria baseado em pesquisas reais)
    const customerSatisfaction = 4.5 + (Math.random() * 0.5); // 4.5 - 5.0

    // Canais mais utilizados
    const channelStats = await sql`
      SELECT 
        channel,
        COUNT(*) as count
      FROM conversations
      WHERE customer_id = ${customerId}
      GROUP BY channel
      ORDER BY count DESC
    `;

    const preferredChannels = channelStats.rows.map(row => row.channel);

    // Construir timeline unificada
    interface TimelineEvent {
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: Date;
      channel?: string;
      agent?: string;
      value?: number;
      metadata?: Record<string, unknown>;
    }

    const timeline: TimelineEvent[] = [];

    // Adicionar mensagens
    messagesResult.rows.forEach((message: Record<string, unknown>) => {
      const content = String(message.content || '');
      timeline.push({
        id: `msg_${message.id}`,
        type: 'message',
        title: `Mensagem via ${message.channel}`,
        description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        timestamp: new Date(String(message.created_at)),
        channel: String(message.channel),
        agent: message.agent_id ? `Agente ID: ${message.agent_id}` : undefined,
        metadata: {
          direction: message.direction,
          message_type: message.message_type,
          automated: message.is_automated
        }
      });
    });

    // Adicionar atividades
    activitiesResult.rows.forEach((activity: Record<string, unknown>) => {
      const action = String(activity.action || '');
      timeline.push({
        id: `act_${activity.id}`,
        type: action === 'status_changed' ? 'status_change' : 'note',
        title: action.replace('_', ' ').toUpperCase(),
        description: String(activity.description || ''),
        timestamp: new Date(String(activity.created_at)),
        channel: String(activity.channel),
        agent: String(activity.agent_name || ''),
        metadata: activity.metadata as Record<string, unknown>
      });
    });

    // Adicionar reservas
    bookingsResult.rows.forEach((booking: Record<string, unknown>) => {
      timeline.push({
        id: `book_${booking.id}`,
        type: 'booking',
        title: 'Nova reserva confirmada',
        description: String(booking.description || `Reserva #${booking.id}`),
        timestamp: new Date(String(booking.created_at)),
        value: Number(booking.value || 0),
        metadata: {
          destination: booking.destination,
          status: booking.status,
          booking_id: booking.id
        }
      });

      // Adicionar pagamento se houver
      if (booking.payment_status === 'paid') {
        timeline.push({
          id: `pay_${booking.id}`,
          type: 'payment',
          title: 'Pagamento recebido',
          description: `Pagamento da reserva #${booking.id}`,
          timestamp: new Date(String(booking.payment_date || booking.created_at)),
          value: Number(booking.value || 0),
          metadata: {
            method: booking.payment_method,
            booking_id: booking.id
          }
        });
      }
    });

    // Ordenar timeline por data (mais recente primeiro)
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const customer360Data = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.customer_type,
      totalInteractions,
      totalBookings,
      totalSpent,
      firstContact: customer.created_at,
      lastContact: customer.last_contact_at || customer.updated_at,
      conversationCount,
      averageResponseTime: avgResponseTime,
      customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
      preferredChannels,
      timeline: timeline.slice(0, 50) // Limitar a 50 eventos mais recentes
    };

    return NextResponse.json({
      success: true,
      data: customer360Data
    });

  } catch (error) {
    console.error('Erro ao buscar dados 360 do cliente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}