/**
 * AI Hub Admin API
 *
 * Real-time data for AI Intelligence Hub dashboard.
 */

import { NextResponse } from 'next/server';
import {
  getSystemHealth,
  getDashboardMetrics,
  getLiveConversations,
  getAtRiskConversations,
  getActiveAlerts,
  getAllAlerts,
  pauseAgent,
  resumeAgent,
  forceHumanTakeover,
  resolveAlert,
  getPausedAgents,
} from '@/lib/ai/realtime-observability';
import { getAggregateStats, getRecentLogs } from '@/lib/ai/admin-observer';
import { getCostAnalytics } from '@/lib/ai/llm-load-balancer';
import { getAllAgentPerformances, getInsights } from '@/lib/ai/memory-learning';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'dashboard';

  try {
    switch (action) {
      case 'dashboard': {
        const health = getSystemHealth();
        const metrics = getDashboardMetrics();
        const stats = getAggregateStats();
        const costAnalytics = getCostAnalytics();

        return NextResponse.json({
          health,
          metrics,
          stats,
          cost: costAnalytics,
          timestamp: Date.now(),
        });
      }

      case 'live': {
        const conversations = getLiveConversations();
        const atRisk = getAtRiskConversations();

        return NextResponse.json({
          conversations,
          at_risk: atRisk,
          count: conversations.length,
        });
      }

      case 'alerts': {
        const active = searchParams.get('active') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');
        const alerts = active ? getActiveAlerts() : getAllAlerts(limit);

        return NextResponse.json({ alerts, count: alerts.length });
      }

      case 'agents': {
        const performances = getAllAgentPerformances();
        const paused = getPausedAgents();

        return NextResponse.json({
          performances,
          paused_agents: paused,
          total_agents: 12,
          online: 12 - paused.length,
        });
      }

      case 'conversations': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const logs = getRecentLogs(limit);

        return NextResponse.json({ conversations: logs, count: logs.length });
      }

      case 'insights': {
        const insights = getInsights();

        return NextResponse.json({ insights });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[AI Hub API]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const body = await request.json();

    switch (action) {
      case 'pause_agent': {
        const { agent_id } = body;
        if (!agent_id) return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
        const success = pauseAgent(agent_id);
        return NextResponse.json({ success, agent_id, action: 'paused' });
      }

      case 'resume_agent': {
        const { agent_id } = body;
        if (!agent_id) return NextResponse.json({ error: 'agent_id required' }, { status: 400 });
        const success = resumeAgent(agent_id);
        return NextResponse.json({ success, agent_id, action: 'resumed' });
      }

      case 'force_takeover': {
        const { conversation_id } = body;
        if (!conversation_id) return NextResponse.json({ error: 'conversation_id required' }, { status: 400 });
        const success = forceHumanTakeover(conversation_id);
        return NextResponse.json({ success, conversation_id, action: 'human_takeover' });
      }

      case 'resolve_alert': {
        const { alert_id, resolved_by, actions_taken } = body;
        if (!alert_id) return NextResponse.json({ error: 'alert_id required' }, { status: 400 });
        const success = resolveAlert(alert_id, resolved_by || 'admin', actions_taken || []);
        return NextResponse.json({ success, alert_id, action: 'resolved' });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[AI Hub API]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
