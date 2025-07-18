import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/omnichannel/analytics - Analytics avançado do sistema omnichannel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d
    const agentId = searchParams.get('agent_id');
    const channel = searchParams.get('channel');
    const department = searchParams.get('department');

    // Calcular período de tempo
    const periodDays = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[period] || 7;

    // Executar todas as consultas em paralelo
    const [
      conversationStats,
      messageStats,
      responseTimeStats,
      channelBreakdown,
      agentPerformance,
      hourlyDistribution,
      satisfactionStats,
      conversionStats
    ] = await Promise.all([
      getConversationStats(periodDays, agentId, channel, department),
      getMessageStats(periodDays, agentId, channel, department),
      getResponseTimeStats(periodDays, agentId, channel, department),
      getChannelBreakdown(periodDays, department),
      getAgentPerformance(periodDays, department),
      getHourlyDistribution(periodDays, channel, department),
      getSatisfactionStats(periodDays, agentId, department),
      getConversionStats(periodDays, channel, department)
    ]);

    const analytics = {
      period,
      generated_at: new Date().toISOString(),
      filters: {
        agent_id: agentId,
        channel,
        department
      },
      overview: {
        conversations: conversationStats,
        messages: messageStats,
        response_time: responseTimeStats,
        satisfaction: satisfactionStats,
        conversion: conversionStats
      },
      breakdowns: {
        by_channel: channelBreakdown,
        by_agent: agentPerformance,
        by_hour: hourlyDistribution
      },
      trends: await getTrends(periodDays, agentId, channel, department)
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching omnichannel analytics:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Estatísticas de conversas
async function getConversationStats(days: number, agentId?: string | null, channel?: string | null, department?: string | null) {
  const filters = buildFilters({ agentId, channel, department });
  
  const result = await sql`
    SELECT 
      COUNT(*) as total_conversations,
      COUNT(CASE WHEN status = 'open' THEN 1 END) as open_conversations,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_conversations,
      COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_conversations,
      COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_conversations,
      AVG(EXTRACT(EPOCH FROM (COALESCE(closed_at, updated_at) - created_at))/3600) as avg_conversation_duration_hours,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as conversations_last_24h
    FROM conversations 
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
  `;

  return {
    total: parseInt(result.rows[0].total_conversations) || 0,
    open: parseInt(result.rows[0].open_conversations) || 0,
    pending: parseInt(result.rows[0].pending_conversations) || 0,
    resolved: parseInt(result.rows[0].resolved_conversations) || 0,
    closed: parseInt(result.rows[0].closed_conversations) || 0,
    avg_duration_hours: parseFloat(result.rows[0].avg_conversation_duration_hours) || 0,
    last_24h: parseInt(result.rows[0].conversations_last_24h) || 0
  };
}

// Estatísticas de mensagens
async function getMessageStats(days: number, agentId?: string | null, channel?: string | null, department?: string | null) {
  const filters = buildFilters({ agentId, channel, department });
  
  const result = await sql`
    SELECT 
      COUNT(*) as total_messages,
      COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as inbound_messages,
      COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as outbound_messages,
      COUNT(CASE WHEN is_automated = true THEN 1 END) as automated_messages,
      AVG(LENGTH(content)) as avg_message_length,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as messages_last_24h
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE m.created_at >= NOW() - INTERVAL '${days} days'
    ${filters.length > 0 ? 'AND ' + filters.map(f => f.replace('conversations.', 'c.')).join(' AND ') : ''}
  `;

  return {
    total: parseInt(result.rows[0].total_messages) || 0,
    inbound: parseInt(result.rows[0].inbound_messages) || 0,
    outbound: parseInt(result.rows[0].outbound_messages) || 0,
    automated: parseInt(result.rows[0].automated_messages) || 0,
    avg_length: parseFloat(result.rows[0].avg_message_length) || 0,
    last_24h: parseInt(result.rows[0].messages_last_24h) || 0
  };
}

// Estatísticas de tempo de resposta
async function getResponseTimeStats(days: number, agentId?: string | null, channel?: string | null, department?: string | null) {
  const filters = buildFilters({ agentId, channel, department });
  
  const result = await sql`
    WITH response_times AS (
      SELECT 
        c.id as conversation_id,
        m1.created_at as customer_message_time,
        MIN(m2.created_at) as agent_response_time,
        EXTRACT(EPOCH FROM (MIN(m2.created_at) - m1.created_at))/60 as response_time_minutes
      FROM conversations c
      JOIN messages m1 ON c.id = m1.conversation_id AND m1.direction = 'inbound'
      JOIN messages m2 ON c.id = m2.conversation_id AND m2.direction = 'outbound' 
        AND m2.created_at > m1.created_at AND m2.is_automated = false
      WHERE c.created_at >= NOW() - INTERVAL '${days} days'
      ${filters.length > 0 ? 'AND ' + filters.map(f => f.replace('conversations.', 'c.')).join(' AND ') : ''}
      GROUP BY c.id, m1.id, m1.created_at
    )
    SELECT 
      AVG(response_time_minutes) as avg_response_time,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_minutes) as median_response_time,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_minutes) as p95_response_time,
      COUNT(CASE WHEN response_time_minutes <= 5 THEN 1 END) as responses_under_5min,
      COUNT(CASE WHEN response_time_minutes <= 15 THEN 1 END) as responses_under_15min,
      COUNT(*) as total_responses
    FROM response_times
  `;

  const row = result.rows[0];
  const total = parseInt(row.total_responses) || 0;

  return {
    avg_minutes: parseFloat(row.avg_response_time) || 0,
    median_minutes: parseFloat(row.median_response_time) || 0,
    p95_minutes: parseFloat(row.p95_response_time) || 0,
    under_5min_percentage: total > 0 ? (parseInt(row.responses_under_5min) / total) * 100 : 0,
    under_15min_percentage: total > 0 ? (parseInt(row.responses_under_15min) / total) * 100 : 0,
    total_responses: total
  };
}

// Breakdown por canal
async function getChannelBreakdown(days: number, department?: string | null) {
  const departmentFilter = department ? `AND department = '${department}'` : '';
  
  const result = await sql`
    SELECT 
      channel,
      COUNT(*) as conversation_count,
      COUNT(CASE WHEN status = 'resolved' OR status = 'closed' THEN 1 END) as resolved_count,
      AVG(EXTRACT(EPOCH FROM (COALESCE(closed_at, updated_at) - created_at))/3600) as avg_duration_hours,
      COUNT(DISTINCT customer_id) as unique_customers
    FROM conversations 
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    ${departmentFilter}
    GROUP BY channel
    ORDER BY conversation_count DESC
  `;

  return result.rows.map(row => ({
    channel: row.channel,
    conversations: parseInt(row.conversation_count),
    resolved: parseInt(row.resolved_count),
    resolution_rate: row.conversation_count > 0 ? 
      (parseInt(row.resolved_count) / parseInt(row.conversation_count)) * 100 : 0,
    avg_duration_hours: parseFloat(row.avg_duration_hours) || 0,
    unique_customers: parseInt(row.unique_customers)
  }));
}

// Performance dos agentes
async function getAgentPerformance(days: number, department?: string | null) {
  const departmentFilter = department ? `AND c.department = '${department}'` : '';
  
  const result = await sql`
    SELECT 
      a.id as agent_id,
      a.name as agent_name,
      a.department,
      COUNT(DISTINCT c.id) as total_conversations,
      COUNT(CASE WHEN c.status IN ('resolved', 'closed') THEN 1 END) as resolved_conversations,
      COUNT(DISTINCT m.id) as total_messages,
      AVG(EXTRACT(EPOCH FROM (COALESCE(c.closed_at, c.updated_at) - c.created_at))/3600) as avg_conversation_duration,
      a.current_conversations,
      a.max_concurrent_conversations
    FROM agents a
    LEFT JOIN conversations c ON a.id = c.assigned_agent_id 
      AND c.created_at >= NOW() - INTERVAL '${days} days'
    LEFT JOIN messages m ON c.id = m.conversation_id AND m.agent_id = a.id
    WHERE a.is_active = true
    ${departmentFilter}
    GROUP BY a.id, a.name, a.department, a.current_conversations, a.max_concurrent_conversations
    ORDER BY total_conversations DESC
  `;

  return result.rows.map(row => ({
    agent_id: row.agent_id,
    name: row.agent_name,
    department: row.department,
    conversations: parseInt(row.total_conversations) || 0,
    resolved: parseInt(row.resolved_conversations) || 0,
    resolution_rate: row.total_conversations > 0 ? 
      (parseInt(row.resolved_conversations) / parseInt(row.total_conversations)) * 100 : 0,
    messages: parseInt(row.total_messages) || 0,
    avg_duration_hours: parseFloat(row.avg_conversation_duration) || 0,
    current_load: parseInt(row.current_conversations) || 0,
    max_capacity: parseInt(row.max_concurrent_conversations) || 0,
    capacity_utilization: row.max_concurrent_conversations > 0 ? 
      (parseInt(row.current_conversations) / parseInt(row.max_concurrent_conversations)) * 100 : 0
  }));
}

// Distribuição por hora
async function getHourlyDistribution(days: number, channel?: string | null, department?: string | null) {
  const filters = buildFilters({ channel, department });
  
  const result = await sql`
    SELECT 
      EXTRACT(HOUR FROM created_at) as hour,
      COUNT(*) as conversation_count,
      COUNT(DISTINCT customer_id) as unique_customers
    FROM conversations 
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
    GROUP BY EXTRACT(HOUR FROM created_at)
    ORDER BY hour
  `;

  // Preencher todas as 24 horas
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const data = result.rows.find(row => parseInt(row.hour) === hour);
    return {
      hour,
      conversations: data ? parseInt(data.conversation_count) : 0,
      unique_customers: data ? parseInt(data.unique_customers) : 0
    };
  });

  return hourlyData;
}

// Estatísticas de satisfação
async function getSatisfactionStats(days: number, agentId?: string | null, department?: string | null) {
  // Implementar quando houver sistema de feedback
  return {
    average_rating: 0,
    total_ratings: 0,
    rating_distribution: {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    },
    nps_score: 0
  };
}

// Estatísticas de conversão
async function getConversionStats(days: number, channel?: string | null, department?: string | null) {
  const filters = buildFilters({ channel, department });
  
  const result = await sql`
    SELECT 
      COUNT(*) as total_conversations,
      COUNT(CASE WHEN tags @> '["quote_requested"]' THEN 1 END) as quote_requests,
      COUNT(CASE WHEN tags @> '["booking_completed"]' THEN 1 END) as bookings_completed,
      COUNT(CASE WHEN tags @> '["lead_qualified"]' THEN 1 END) as qualified_leads
    FROM conversations 
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
  `;

  const row = result.rows[0];
  const total = parseInt(row.total_conversations) || 0;

  return {
    total_conversations: total,
    quote_requests: parseInt(row.quote_requests) || 0,
    bookings_completed: parseInt(row.bookings_completed) || 0,
    qualified_leads: parseInt(row.qualified_leads) || 0,
    quote_conversion_rate: total > 0 ? (parseInt(row.quote_requests) / total) * 100 : 0,
    booking_conversion_rate: total > 0 ? (parseInt(row.bookings_completed) / total) * 100 : 0,
    lead_qualification_rate: total > 0 ? (parseInt(row.qualified_leads) / total) * 100 : 0
  };
}

// Tendências comparativas
async function getTrends(days: number, agentId?: string | null, channel?: string | null, department?: string | null) {
  const filters = buildFilters({ agentId, channel, department });
  
  // Comparar com período anterior
  const result = await sql`
    SELECT 
      -- Período atual
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${days} days' THEN 1 END) as current_conversations,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${days} days' AND status IN ('resolved', 'closed') THEN 1 END) as current_resolved,
      
      -- Período anterior
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${days * 2} days' AND created_at < NOW() - INTERVAL '${days} days' THEN 1 END) as previous_conversations,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${days * 2} days' AND created_at < NOW() - INTERVAL '${days} days' AND status IN ('resolved', 'closed') THEN 1 END) as previous_resolved
    FROM conversations 
    WHERE created_at >= NOW() - INTERVAL '${days * 2} days'
    ${filters.length > 0 ? 'AND ' + filters.join(' AND ') : ''}
  `;

  const row = result.rows[0];
  
  const currentConversations = parseInt(row.current_conversations) || 0;
  const previousConversations = parseInt(row.previous_conversations) || 0;
  const currentResolved = parseInt(row.current_resolved) || 0;
  const previousResolved = parseInt(row.previous_resolved) || 0;

  return {
    conversations: {
      current: currentConversations,
      previous: previousConversations,
      change_percentage: previousConversations > 0 ? 
        ((currentConversations - previousConversations) / previousConversations) * 100 : 0
    },
    resolution_rate: {
      current: currentConversations > 0 ? (currentResolved / currentConversations) * 100 : 0,
      previous: previousConversations > 0 ? (previousResolved / previousConversations) * 100 : 0,
      change_percentage: 0 // Calcular diferença entre taxas
    }
  };
}

// Função auxiliar para construir filtros
function buildFilters(params: { agentId?: string | null, channel?: string | null, department?: string | null }) {
  const filters = [];
  
  if (params.agentId) {
    filters.push(`assigned_agent_id = ${params.agentId}`);
  }
  
  if (params.channel) {
    filters.push(`channel = '${params.channel}'`);
  }
  
  if (params.department) {
    filters.push(`department = '${params.department}'`);
  }
  
  return filters;
}