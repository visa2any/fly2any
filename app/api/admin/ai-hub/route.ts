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
import { getExecutiveSummary, getBoardDashboard } from '@/lib/ai/kpi-intelligence';
import { getRecentSuites, getFailureTrends, generateTestReport } from '@/lib/ai/qa-playwright-engine';
import { getQueue, getTakeoverAnalytics, assignTakeover, resolveTakeover } from '@/lib/ai/human-takeover';
import { getPersonalizationStats, getRecentDecisions as getPersonalizationDecisions } from '@/lib/ai/personalization-engine';
import { getRevenueMetrics, getRecentDecisions as getRevenueDecisions } from '@/lib/ai/revenue-optimization';
import { getUXDashboard, getRecentSignals, getPrioritizedIssues } from '@/lib/ai/ux-intelligence';
import { getRecommendations, getPRRecommendations, autoGenerateFixes, updateFixStatus } from '@/lib/ai/ux-fix-agent';
import { getExperiments, getExperiment, getExperimentStats, getLearnings } from '@/lib/ai/ab-experimentation';
import { generateDailyDigest, getLatestDigest, getDigestHistory, generateEmailDigest, generateTextSummary } from '@/lib/ai/executive-digest';
import { getInsights as getBrainInsights, getPrinciples, getLearningMetrics, getDailyLearningReport, suggestExperiment, exportLearnings } from '@/lib/ai/self-learning-brain';

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

      case 'kpi': {
        const summary = getExecutiveSummary();
        return NextResponse.json(summary);
      }

      case 'board': {
        const dashboard = getBoardDashboard();
        return NextResponse.json(dashboard);
      }

      case 'qa': {
        const suites = getRecentSuites(10);
        const trends = getFailureTrends();
        const latestReport = suites[0] ? generateTestReport(suites[0]) : null;
        return NextResponse.json({ suites, trends, latest_report: latestReport });
      }

      case 'takeover_queue': {
        const queue = getQueue();
        const analytics = getTakeoverAnalytics();
        return NextResponse.json({ queue, analytics });
      }

      case 'personalization': {
        const stats = getPersonalizationStats();
        const decisions = getPersonalizationDecisions(20);
        return NextResponse.json({ stats, recent_decisions: decisions });
      }

      case 'revenue': {
        const metrics = getRevenueMetrics();
        const decisions = getRevenueDecisions(20);
        return NextResponse.json({ metrics, recent_decisions: decisions });
      }

      case 'ux': {
        const dashboard = getUXDashboard();
        return NextResponse.json(dashboard);
      }

      case 'ux_issues': {
        const limit = parseInt(searchParams.get('limit') || '20');
        const issues = getPrioritizedIssues(limit);
        return NextResponse.json({ issues, count: issues.length });
      }

      case 'ux_signals': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const signals = getRecentSignals(limit);
        return NextResponse.json({ signals, count: signals.length });
      }

      case 'fixes': {
        const status = searchParams.get('status') as any;
        const fixes = getRecommendations(status || undefined, 20);
        const prs = getPRRecommendations(10);
        return NextResponse.json({ fixes, prs });
      }

      case 'auto_fixes': {
        const limit = parseInt(searchParams.get('limit') || '5');
        const fixes = autoGenerateFixes(limit);
        return NextResponse.json({ fixes, count: fixes.length });
      }

      case 'experiments': {
        const status = searchParams.get('status') as any;
        const experiments = getExperiments(status || undefined);
        const stats = getExperimentStats();
        const learnings = getLearnings(10);
        return NextResponse.json({ experiments, stats, learnings });
      }

      case 'digest': {
        const format = searchParams.get('format') || 'json';
        let digest = getLatestDigest();
        if (!digest) digest = generateDailyDigest();

        if (format === 'html') {
          return new Response(generateEmailDigest(digest), {
            headers: { 'Content-Type': 'text/html' },
          });
        }
        if (format === 'text') {
          return new Response(generateTextSummary(digest), {
            headers: { 'Content-Type': 'text/plain' },
          });
        }
        return NextResponse.json(digest);
      }

      case 'digest_history': {
        const days = parseInt(searchParams.get('days') || '7');
        const history = getDigestHistory(days);
        return NextResponse.json({ digests: history, count: history.length });
      }

      case 'brain': {
        const category = searchParams.get('category') as any;
        const insights = getBrainInsights(category || undefined, 'emerging');
        const principles = getPrinciples(category || undefined);
        const metrics = getLearningMetrics();
        const daily = getDailyLearningReport();
        const suggestion = suggestExperiment();
        return NextResponse.json({ insights, principles, metrics, daily_report: daily, experiment_suggestion: suggestion });
      }

      case 'brain_export': {
        const data = exportLearnings();
        return NextResponse.json(data);
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

      case 'assign_takeover': {
        const { conversation_id, agent_id } = body;
        if (!conversation_id || !agent_id) {
          return NextResponse.json({ error: 'conversation_id and agent_id required' }, { status: 400 });
        }
        const success = assignTakeover(conversation_id, agent_id);
        return NextResponse.json({ success, conversation_id, agent_id, action: 'assigned' });
      }

      case 'resolve_takeover': {
        const { conversation_id, resolved, notes, sentiment_delta } = body;
        if (!conversation_id) return NextResponse.json({ error: 'conversation_id required' }, { status: 400 });
        const success = resolveTakeover(conversation_id, resolved ?? true, notes, sentiment_delta);
        return NextResponse.json({ success, conversation_id, action: 'takeover_resolved' });
      }

      case 'update_fix_status': {
        const { fix_id, status } = body;
        if (!fix_id || !status) return NextResponse.json({ error: 'fix_id and status required' }, { status: 400 });
        const success = updateFixStatus(fix_id, status);
        return NextResponse.json({ success, fix_id, status });
      }

      case 'generate_digest': {
        const digest = generateDailyDigest();
        return NextResponse.json({ success: true, digest });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[AI Hub API]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
