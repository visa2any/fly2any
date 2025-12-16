/**
 * Human Takeover Protocol — Fly2Any
 * AI + Human = One flawless experience.
 */

import { generateEventId, type DecisionEvent } from './data-schema';
import { triggerAlert } from './realtime-observability';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type TakeoverReason =
  | 'frustration'
  | 'low_confidence'
  | 'payment_failure'
  | 'vip_customer'
  | 'high_value_booking'
  | 'legal_visa'
  | 'crisis'
  | 'explicit_request'
  | 'complex_itinerary';

export type TakeoverStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'escalated';

export interface TakeoverContext {
  takeover_id: string;
  conversation_id: string;
  user_id: string;
  reason: TakeoverReason;
  priority: 'urgent' | 'high' | 'normal';
  status: TakeoverStatus;
  created_at: number;
  assigned_to?: string;
  assigned_at?: number;
  resolved_at?: number;

  // Context package for human agent
  context: {
    user_name?: string;
    user_email?: string;
    user_tier?: 'vip' | 'frequent' | 'standard';
    conversation_history: ConversationMessage[];
    detected_intent: string;
    emotional_state: string;
    previous_ai_decisions: AIDecisionSummary[];
    recommended_actions: string[];
    booking_value?: number;
    special_requirements?: string[];
  };

  // Post-handoff
  outcome?: {
    resolved: boolean;
    resolution_notes?: string;
    time_to_resolution_ms?: number;
    sentiment_delta?: number;
    follow_up_required?: boolean;
  };
}

export interface ConversationMessage {
  sender: 'user' | 'agent';
  content: string;
  timestamp: number;
  agent_id?: string;
}

export interface AIDecisionSummary {
  decision: string;
  reason: string;
  confidence: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════
const THRESHOLDS = {
  confidence_min: 0.6,
  payment_failures_max: 2,
  high_value_usd: 2000,
  vip_always_human: true,
  frustration_emotions: ['FRUSTRATED', 'ANGRY', 'PANICKED'],
  crisis_keywords: ['emergency', 'stranded', 'urgent', 'help', 'crisis', 'stuck'],
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  activeTakeovers: new Map<string, TakeoverContext>(),
  queue: [] as TakeoverContext[],
  analytics: {
    total_takeovers: 0,
    avg_resolution_time_ms: 0,
    avg_sentiment_delta: 0,
    by_reason: new Map<TakeoverReason, number>(),
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGER DETECTION
// ═══════════════════════════════════════════════════════════════════════════

export interface TriggerCheck {
  emotion?: string;
  confidence?: number;
  payment_failures?: number;
  booking_value?: number;
  user_tier?: string;
  message?: string;
  is_legal_visa?: boolean;
}

/**
 * Check if human takeover should be triggered
 */
export function shouldTriggerTakeover(check: TriggerCheck): { trigger: boolean; reason?: TakeoverReason; priority?: TakeoverContext['priority'] } {
  // Emotion-based
  if (check.emotion && THRESHOLDS.frustration_emotions.includes(check.emotion)) {
    return { trigger: true, reason: 'frustration', priority: 'high' };
  }

  // Low confidence
  if (check.confidence !== undefined && check.confidence < THRESHOLDS.confidence_min) {
    return { trigger: true, reason: 'low_confidence', priority: 'normal' };
  }

  // Payment failures
  if (check.payment_failures && check.payment_failures >= THRESHOLDS.payment_failures_max) {
    return { trigger: true, reason: 'payment_failure', priority: 'high' };
  }

  // VIP customer
  if (check.user_tier === 'vip' && THRESHOLDS.vip_always_human) {
    return { trigger: true, reason: 'vip_customer', priority: 'high' };
  }

  // High value booking
  if (check.booking_value && check.booking_value >= THRESHOLDS.high_value_usd) {
    return { trigger: true, reason: 'high_value_booking', priority: 'high' };
  }

  // Legal/Visa
  if (check.is_legal_visa) {
    return { trigger: true, reason: 'legal_visa', priority: 'urgent' };
  }

  // Crisis keywords
  if (check.message) {
    const lower = check.message.toLowerCase();
    if (THRESHOLDS.crisis_keywords.some(k => lower.includes(k))) {
      return { trigger: true, reason: 'crisis', priority: 'urgent' };
    }
  }

  return { trigger: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// TAKEOVER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initiate human takeover
 */
export function initiateTakeover(
  conversationId: string,
  userId: string,
  reason: TakeoverReason,
  context: TakeoverContext['context'],
  priority: TakeoverContext['priority'] = 'normal'
): TakeoverContext {
  const takeover: TakeoverContext = {
    takeover_id: generateEventId(),
    conversation_id: conversationId,
    user_id: userId,
    reason,
    priority,
    status: 'pending',
    created_at: Date.now(),
    context,
  };

  state.activeTakeovers.set(conversationId, takeover);
  state.queue.push(takeover);
  state.analytics.total_takeovers++;
  state.analytics.by_reason.set(reason, (state.analytics.by_reason.get(reason) || 0) + 1);

  // Sort queue by priority
  state.queue.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Trigger alert
  triggerAlert(
    priority === 'urgent' ? 'critical' : 'warning',
    'escalation_spike',
    `Human takeover: ${reason}`,
    `Conversation ${conversationId.slice(0, 12)}... requires human agent`,
    { conversation_id: conversationId }
  );

  return takeover;
}

/**
 * Get transition message (Apple-Class premium language)
 */
export function getTransitionMessage(reason: TakeoverReason, userName?: string): string {
  const name = userName ? `, ${userName}` : '';

  const messages: Record<TakeoverReason, string> = {
    frustration: `I understand this has been challenging${name}. I'm connecting you with a travel specialist who can assist you personally.`,
    low_confidence: `To ensure you receive the best possible assistance${name}, I'm bringing in a travel specialist to help with your request.`,
    payment_failure: `I want to make sure your booking is handled perfectly${name}. A specialist is joining to assist with your payment.`,
    vip_customer: `Thank you for being a valued member${name}. A dedicated specialist is ready to assist you personally.`,
    high_value_booking: `For your premium booking${name}, I'm connecting you with a specialist who can ensure every detail is perfect.`,
    legal_visa: `Given the nature of your question${name}, I'm bringing in a specialist who can provide accurate guidance.`,
    crisis: `I'm prioritizing your request${name}. A specialist is joining immediately to assist you.`,
    explicit_request: `Absolutely${name}. I'm connecting you with a travel specialist right now.`,
    complex_itinerary: `For your multi-destination journey${name}, I'm bringing in a specialist who can optimize every leg of your trip.`,
  };

  return messages[reason];
}

/**
 * Assign takeover to human agent
 */
export function assignTakeover(conversationId: string, agentId: string): boolean {
  const takeover = state.activeTakeovers.get(conversationId);
  if (!takeover) return false;

  takeover.status = 'assigned';
  takeover.assigned_to = agentId;
  takeover.assigned_at = Date.now();

  // Remove from queue
  state.queue = state.queue.filter(t => t.conversation_id !== conversationId);

  return true;
}

/**
 * Mark takeover as in progress
 */
export function startTakeover(conversationId: string): boolean {
  const takeover = state.activeTakeovers.get(conversationId);
  if (!takeover || takeover.status !== 'assigned') return false;

  takeover.status = 'in_progress';
  return true;
}

/**
 * Resolve takeover
 */
export function resolveTakeover(
  conversationId: string,
  resolved: boolean,
  notes?: string,
  sentimentDelta?: number
): boolean {
  const takeover = state.activeTakeovers.get(conversationId);
  if (!takeover) return false;

  const now = Date.now();
  takeover.status = 'resolved';
  takeover.resolved_at = now;
  takeover.outcome = {
    resolved,
    resolution_notes: notes,
    time_to_resolution_ms: now - takeover.created_at,
    sentiment_delta: sentimentDelta,
    follow_up_required: !resolved,
  };

  // Update analytics
  const total = state.analytics.total_takeovers;
  const avgTime = state.analytics.avg_resolution_time_ms;
  state.analytics.avg_resolution_time_ms =
    (avgTime * (total - 1) + takeover.outcome.time_to_resolution_ms!) / total;

  if (sentimentDelta !== undefined) {
    const avgSentiment = state.analytics.avg_sentiment_delta;
    state.analytics.avg_sentiment_delta = (avgSentiment * (total - 1) + sentimentDelta) / total;
  }

  // Remove from active
  state.activeTakeovers.delete(conversationId);

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export function getQueue(): TakeoverContext[] {
  return [...state.queue];
}

export function getActiveTakeover(conversationId: string): TakeoverContext | undefined {
  return state.activeTakeovers.get(conversationId);
}

export function getQueueStats(): {
  total: number;
  urgent: number;
  high: number;
  normal: number;
  avg_wait_time_ms: number;
} {
  const now = Date.now();
  const waitTimes = state.queue.map(t => now - t.created_at);

  return {
    total: state.queue.length,
    urgent: state.queue.filter(t => t.priority === 'urgent').length,
    high: state.queue.filter(t => t.priority === 'high').length,
    normal: state.queue.filter(t => t.priority === 'normal').length,
    avg_wait_time_ms: waitTimes.length > 0 ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

export function getTakeoverAnalytics() {
  return {
    total_takeovers: state.analytics.total_takeovers,
    avg_resolution_time_ms: state.analytics.avg_resolution_time_ms,
    avg_resolution_time_minutes: Math.round(state.analytics.avg_resolution_time_ms / 60000),
    avg_sentiment_delta: state.analytics.avg_sentiment_delta,
    by_reason: Object.fromEntries(state.analytics.by_reason),
    queue_stats: getQueueStats(),
  };
}

/**
 * Get human greeting for agent
 */
export function getHumanAgentGreeting(takeover: TakeoverContext): string {
  const name = takeover.context.user_name || 'there';
  const intent = takeover.context.detected_intent;

  return `Hi ${name}! I've reviewed your conversation and I'm here to help you with ${intent}. Let me take care of this for you.`;
}
