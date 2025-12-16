/**
 * AI Admin Data Schema — Fly2Any AI Ecosystem
 *
 * Unified event-driven schema for all AI operations.
 * Immutable, replayable, time-ordered.
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. CONVERSATION ENTITY
// ═══════════════════════════════════════════════════════════════════════════
export interface Conversation {
  conversation_id: string;
  user_id: string; // Anonymous or registered
  session_id: string;
  platform: 'web' | 'mobile' | 'app' | 'api';
  language: string;
  start_time: number;
  end_time: number | null;
  final_outcome: 'converted' | 'resolved' | 'abandoned' | 'escalated' | 'ongoing';
  metadata: {
    user_agent?: string;
    ip_country?: string;
    referrer?: string;
    entry_page?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. MESSAGE EVENT
// ═══════════════════════════════════════════════════════════════════════════
export interface MessageEvent {
  event_id: string;
  conversation_id: string;
  timestamp: number;
  sender: 'user' | 'agent' | 'system';
  agent_id: string | null;
  message_type: 'text' | 'action' | 'decision' | 'system';
  content: string;
  content_length: number;
  detected_intent: string | 'unknown';
  detected_emotion: 'CALM' | 'CONFUSED' | 'FRUSTRATED' | 'ANXIOUS' | 'URGENT' | 'PANICKED' | 'unknown';
  confidence_score: number;
  metadata: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. DECISION EVENT
// ═══════════════════════════════════════════════════════════════════════════
export interface DecisionEvent {
  decision_id: string;
  conversation_id: string;
  timestamp: number;
  agent_id: string;
  decision_type:
    | 'route_to_agent'
    | 'send_email'
    | 'price_alert'
    | 'escalate'
    | 'handoff'
    | 'model_upgrade'
    | 'booking_action'
    | 'fallback';
  decision_reason: string;
  data_sources_used: string[];
  alternatives_considered: string[];
  constraints_applied: string[];
  confidence_score: number;
  outcome: 'success' | 'failure' | 'pending' | 'unknown';
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. AGENT PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════
export interface AgentPerformanceRecord {
  agent_id: string;
  agent_name: string;
  period_start: number;
  period_end: number;
  total_interactions: number;
  avg_response_time_ms: number;
  success_rate: number;
  escalation_rate: number;
  hallucination_count: number;
  user_sentiment_delta: number; // -1 to +1
  conversion_assists: number;
  total_cost: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. COST & MODEL USAGE
// ═══════════════════════════════════════════════════════════════════════════
export interface ModelUsageEvent {
  event_id: string;
  conversation_id: string;
  timestamp: number;
  model_provider: 'groq' | 'openai' | 'anthropic';
  model_name: string;
  model_tier: 'high' | 'mid' | 'low';
  token_input: number;
  token_output: number;
  estimated_cost_usd: number;
  latency_ms: number;
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. ALERT EVENT
// ═══════════════════════════════════════════════════════════════════════════
export interface AlertEvent {
  alert_id: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  alert_type:
    | 'low_confidence'
    | 'user_frustration'
    | 'conversion_drop'
    | 'cost_spike'
    | 'api_failure'
    | 'hallucination'
    | 'escalation_spike';
  title: string;
  description: string;
  conversation_id?: string;
  agent_id?: string;
  resolved: boolean;
  resolved_at?: number;
  resolved_by?: string;
  actions_taken?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. ADMIN ACTION EVENT
// ═══════════════════════════════════════════════════════════════════════════
export interface AdminActionEvent {
  action_id: string;
  timestamp: number;
  admin_user_id: string;
  action_type:
    | 'pause_agent'
    | 'resume_agent'
    | 'force_takeover'
    | 'reroute_conversation'
    | 'disable_campaign'
    | 'acknowledge_alert'
    | 'override_decision';
  target_id: string; // agent_id, conversation_id, or campaign_id
  reason: string;
  metadata: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// UUID GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateDecisionId(): string {
  return `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT FACTORY
// ═══════════════════════════════════════════════════════════════════════════
export function createMessageEvent(
  conversationId: string,
  sender: MessageEvent['sender'],
  content: string,
  options: Partial<MessageEvent> = {}
): MessageEvent {
  return {
    event_id: generateEventId(),
    conversation_id: conversationId,
    timestamp: Date.now(),
    sender,
    agent_id: options.agent_id || null,
    message_type: options.message_type || 'text',
    content,
    content_length: content.length,
    detected_intent: options.detected_intent || 'unknown',
    detected_emotion: options.detected_emotion || 'unknown',
    confidence_score: options.confidence_score || 0,
    metadata: options.metadata || {},
  };
}

export function createDecisionEvent(
  conversationId: string,
  agentId: string,
  decisionType: DecisionEvent['decision_type'],
  reason: string,
  options: Partial<DecisionEvent> = {}
): DecisionEvent {
  return {
    decision_id: generateDecisionId(),
    conversation_id: conversationId,
    timestamp: Date.now(),
    agent_id: agentId,
    decision_type: decisionType,
    decision_reason: reason,
    data_sources_used: options.data_sources_used || [],
    alternatives_considered: options.alternatives_considered || [],
    constraints_applied: options.constraints_applied || [],
    confidence_score: options.confidence_score || 0,
    outcome: options.outcome || 'pending',
  };
}

export function createAlertEvent(
  severity: AlertEvent['severity'],
  alertType: AlertEvent['alert_type'],
  title: string,
  description: string,
  options: Partial<AlertEvent> = {}
): AlertEvent {
  return {
    alert_id: generateAlertId(),
    timestamp: Date.now(),
    severity,
    alert_type: alertType,
    title,
    description,
    conversation_id: options.conversation_id,
    agent_id: options.agent_id,
    resolved: false,
    actions_taken: [],
  };
}
