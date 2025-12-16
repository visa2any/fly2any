/**
 * Real-Time Observability Engine — Fly2Any AI Ecosystem
 *
 * Live visibility, alerts, and control over AI operations.
 * Control tower and early-warning system.
 */

import {
  type AlertEvent,
  type Conversation,
  type AgentPerformanceRecord,
  createAlertEvent,
} from './data-schema';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  api_health: Record<string, 'up' | 'down' | 'slow'>;
  active_conversations: number;
  agents_online: number;
  avg_latency_ms: number;
  error_rate_1h: number;
  last_updated: number;
}

export interface LiveConversation {
  conversation_id: string;
  user_id: string;
  current_agent: string;
  intent: string;
  emotion: string;
  urgency: string;
  start_time: number;
  message_count: number;
  is_escalated: boolean;
  is_at_risk: boolean;
  country?: string;
}

export interface AlertThresholds {
  confidence_min: number;
  frustration_trigger: boolean;
  conversion_drop_pct: number;
  cost_spike_pct: number;
  latency_max_ms: number;
  error_rate_max: number;
}

export interface AdminAction {
  action: 'pause_agent' | 'resume_agent' | 'force_takeover' | 'reroute' | 'disable_campaign';
  target_id: string;
  reason: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  liveConversations: new Map<string, LiveConversation>(),
  alerts: [] as AlertEvent[],
  pausedAgents: new Set<string>(),
  systemHealth: {
    status: 'healthy' as SystemHealth['status'],
    api_health: {
      groq: 'up' as const,
      openai: 'up' as const,
      duffel: 'up' as const,
      stripe: 'up' as const,
    },
    active_conversations: 0,
    agents_online: 12,
    avg_latency_ms: 450,
    error_rate_1h: 0.02,
    last_updated: Date.now(),
  },
  thresholds: {
    confidence_min: 0.6,
    frustration_trigger: true,
    conversion_drop_pct: 15,
    cost_spike_pct: 50,
    latency_max_ms: 3000,
    error_rate_max: 0.05,
  } as AlertThresholds,
  metrics: {
    conversations_today: 0,
    conversions_today: 0,
    cost_today: 0,
    avg_resolution_time: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LIVE MONITORING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Track a new conversation
 */
export function trackConversation(conv: LiveConversation): void {
  state.liveConversations.set(conv.conversation_id, conv);
  state.systemHealth.active_conversations = state.liveConversations.size;
  state.metrics.conversations_today++;

  // Check for at-risk indicators
  if (conv.emotion === 'FRUSTRATED' || conv.emotion === 'PANICKED') {
    conv.is_at_risk = true;
    if (state.thresholds.frustration_trigger) {
      triggerAlert('warning', 'user_frustration', 'User frustration detected',
        `Conversation ${conv.conversation_id.slice(0, 12)}... shows ${conv.emotion} emotion`,
        { conversation_id: conv.conversation_id, agent_id: conv.current_agent }
      );
    }
  }
}

/**
 * Update conversation state
 */
export function updateConversation(
  conversationId: string,
  updates: Partial<LiveConversation>
): void {
  const conv = state.liveConversations.get(conversationId);
  if (!conv) return;

  Object.assign(conv, updates);

  // Check for escalation
  if (updates.is_escalated && !conv.is_escalated) {
    triggerAlert('info', 'escalation_spike', 'Conversation escalated',
      `${conversationId.slice(0, 12)}... escalated to ${updates.current_agent}`,
      { conversation_id: conversationId }
    );
  }

  // Check emotion change
  if (updates.emotion && ['FRUSTRATED', 'PANICKED'].includes(updates.emotion)) {
    conv.is_at_risk = true;
  }
}

/**
 * End conversation tracking
 */
export function endConversation(conversationId: string, converted: boolean): void {
  const conv = state.liveConversations.get(conversationId);
  if (conv && converted) {
    state.metrics.conversions_today++;
  }
  state.liveConversations.delete(conversationId);
  state.systemHealth.active_conversations = state.liveConversations.size;
}

/**
 * Get live conversations
 */
export function getLiveConversations(): LiveConversation[] {
  return Array.from(state.liveConversations.values());
}

/**
 * Get at-risk conversations
 */
export function getAtRiskConversations(): LiveConversation[] {
  return Array.from(state.liveConversations.values()).filter(c => c.is_at_risk);
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trigger an alert
 */
export function triggerAlert(
  severity: AlertEvent['severity'],
  alertType: AlertEvent['alert_type'],
  title: string,
  description: string,
  options: { conversation_id?: string; agent_id?: string } = {}
): AlertEvent {
  const alert = createAlertEvent(severity, alertType, title, description, options);
  state.alerts.unshift(alert);

  // Keep only last 100 alerts
  if (state.alerts.length > 100) {
    state.alerts = state.alerts.slice(0, 100);
  }

  // Update system health if critical
  if (severity === 'critical') {
    state.systemHealth.status = 'critical';
  } else if (severity === 'warning' && state.systemHealth.status === 'healthy') {
    state.systemHealth.status = 'degraded';
  }

  return alert;
}

/**
 * Check thresholds and trigger alerts
 */
export function checkThresholds(data: {
  confidence?: number;
  latency_ms?: number;
  error_rate?: number;
  cost_increase_pct?: number;
  conversation_id?: string;
  agent_id?: string;
}): void {
  const { thresholds } = state;

  // Low confidence
  if (data.confidence !== undefined && data.confidence < thresholds.confidence_min) {
    triggerAlert('warning', 'low_confidence', 'Low confidence score',
      `Confidence ${(data.confidence * 100).toFixed(0)}% below threshold`,
      { conversation_id: data.conversation_id, agent_id: data.agent_id }
    );
  }

  // High latency
  if (data.latency_ms !== undefined && data.latency_ms > thresholds.latency_max_ms) {
    triggerAlert('warning', 'api_failure', 'High latency detected',
      `Response time ${data.latency_ms}ms exceeds ${thresholds.latency_max_ms}ms limit`
    );
  }

  // Cost spike
  if (data.cost_increase_pct !== undefined && data.cost_increase_pct > thresholds.cost_spike_pct) {
    triggerAlert('critical', 'cost_spike', 'Cost spike detected',
      `Costs increased ${data.cost_increase_pct.toFixed(0)}% in last hour`
    );
  }

  // Error rate
  if (data.error_rate !== undefined && data.error_rate > thresholds.error_rate_max) {
    triggerAlert('critical', 'api_failure', 'High error rate',
      `Error rate ${(data.error_rate * 100).toFixed(1)}% exceeds threshold`
    );
    state.systemHealth.status = 'critical';
  }
}

/**
 * Resolve alert
 */
export function resolveAlert(alertId: string, resolvedBy: string, actionsTaken: string[]): boolean {
  const alert = state.alerts.find(a => a.alert_id === alertId);
  if (!alert) return false;

  alert.resolved = true;
  alert.resolved_at = Date.now();
  alert.resolved_by = resolvedBy;
  alert.actions_taken = actionsTaken;

  // Re-evaluate system health
  const unresolvedCritical = state.alerts.some(a => !a.resolved && a.severity === 'critical');
  const unresolvedWarning = state.alerts.some(a => !a.resolved && a.severity === 'warning');

  if (!unresolvedCritical && !unresolvedWarning) {
    state.systemHealth.status = 'healthy';
  } else if (!unresolvedCritical) {
    state.systemHealth.status = 'degraded';
  }

  return true;
}

/**
 * Get active alerts
 */
export function getActiveAlerts(): AlertEvent[] {
  return state.alerts.filter(a => !a.resolved);
}

/**
 * Get all alerts
 */
export function getAllAlerts(limit: number = 50): AlertEvent[] {
  return state.alerts.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pause an agent
 */
export function pauseAgent(agentId: string): boolean {
  state.pausedAgents.add(agentId);
  state.systemHealth.agents_online = 12 - state.pausedAgents.size;
  return true;
}

/**
 * Resume an agent
 */
export function resumeAgent(agentId: string): boolean {
  state.pausedAgents.delete(agentId);
  state.systemHealth.agents_online = 12 - state.pausedAgents.size;
  return true;
}

/**
 * Check if agent is paused
 */
export function isAgentPaused(agentId: string): boolean {
  return state.pausedAgents.has(agentId);
}

/**
 * Get paused agents
 */
export function getPausedAgents(): string[] {
  return Array.from(state.pausedAgents);
}

/**
 * Force human takeover
 */
export function forceHumanTakeover(conversationId: string): boolean {
  const conv = state.liveConversations.get(conversationId);
  if (!conv) return false;

  conv.current_agent = 'human_operator';
  conv.is_escalated = true;

  triggerAlert('info', 'escalation_spike', 'Human takeover initiated',
    `Admin forced human takeover for ${conversationId.slice(0, 12)}...`,
    { conversation_id: conversationId }
  );

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM HEALTH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update API health
 */
export function updateApiHealth(api: string, status: 'up' | 'down' | 'slow'): void {
  state.systemHealth.api_health[api] = status;

  if (status === 'down') {
    triggerAlert('critical', 'api_failure', `${api} API down`,
      `${api} API is not responding`);
    state.systemHealth.status = 'critical';
  } else if (status === 'slow') {
    triggerAlert('warning', 'api_failure', `${api} API slow`,
      `${api} API experiencing high latency`);
  }

  state.systemHealth.last_updated = Date.now();
}

/**
 * Get system health
 */
export function getSystemHealth(): SystemHealth {
  return { ...state.systemHealth, last_updated: Date.now() };
}

/**
 * Get dashboard metrics
 */
export function getDashboardMetrics(): {
  conversations_today: number;
  conversions_today: number;
  conversion_rate: number;
  cost_today: number;
  active_now: number;
  at_risk: number;
  alerts_active: number;
} {
  const atRisk = Array.from(state.liveConversations.values()).filter(c => c.is_at_risk).length;
  const alertsActive = state.alerts.filter(a => !a.resolved).length;

  return {
    conversations_today: state.metrics.conversations_today,
    conversions_today: state.metrics.conversions_today,
    conversion_rate: state.metrics.conversations_today > 0
      ? (state.metrics.conversions_today / state.metrics.conversations_today) * 100
      : 0,
    cost_today: state.metrics.cost_today,
    active_now: state.liveConversations.size,
    at_risk: atRisk,
    alerts_active: alertsActive,
  };
}

/**
 * Update cost metrics
 */
export function recordCost(cost: number): void {
  state.metrics.cost_today += cost;
}

/**
 * Update thresholds
 */
export function updateThresholds(newThresholds: Partial<AlertThresholds>): void {
  Object.assign(state.thresholds, newThresholds);
}

/**
 * Get current thresholds
 */
export function getThresholds(): AlertThresholds {
  return { ...state.thresholds };
}

/**
 * Reset daily metrics (call at midnight)
 */
export function resetDailyMetrics(): void {
  state.metrics = {
    conversations_today: 0,
    conversions_today: 0,
    cost_today: 0,
    avg_resolution_time: 0,
  };
}
