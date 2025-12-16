/**
 * AI Admin Observer — Fly2Any AI Ecosystem
 *
 * Black box recorder for all AI operations.
 * Immutable, audit-ready logging.
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface ConversationEvent {
  event_type: 'start' | 'message' | 'decision' | 'handoff' | 'api_call' | 'error' | 'end';
  timestamp: number;
  data: Record<string, unknown>;
}

export interface ConversationLog {
  id: string;
  timestamp: number;
  user_anonymous_id: string;
  agents_involved: string[];
  intents: string[];
  emotions: string[];
  decisions: DecisionLog[];
  events: ConversationEvent[];
  outcome: 'resolved' | 'converted' | 'abandoned' | 'escalated' | 'ongoing';
  conversion: boolean;
  cost: number;
  duration_ms: number;
  llm_calls: LLMCallLog[];
}

export interface DecisionLog {
  timestamp: number;
  decision_type: string;
  agent_id: string;
  decision_reason: string;
  confidence_score: number;
  fallback_or_escalation: boolean;
  alternatives_considered: string[];
}

export interface LLMCallLog {
  timestamp: number;
  provider: 'groq' | 'openai';
  model: string;
  tier: 'high' | 'mid' | 'low';
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  cost_estimate: number;
  success: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════════════
const REDIS_KEY = 'fly2any:observer:logs';
const MAX_LOGS = 1000;

// In-memory store
const conversationStore = new Map<string, ConversationLog>();
const recentLogs: ConversationLog[] = [];

// ═══════════════════════════════════════════════════════════════════════════
// CORE OBSERVER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Start observing a conversation
 */
export function startConversation(
  conversationId: string,
  userAnonymousId: string
): void {
  const log: ConversationLog = {
    id: conversationId,
    timestamp: Date.now(),
    user_anonymous_id: userAnonymousId,
    agents_involved: [],
    intents: [],
    emotions: [],
    decisions: [],
    events: [],
    outcome: 'ongoing',
    conversion: false,
    cost: 0,
    duration_ms: 0,
    llm_calls: [],
  };

  conversationStore.set(conversationId, log);
  logEvent(conversationId, 'start', { user_anonymous_id: userAnonymousId });
}

/**
 * Log an event
 */
export function logEvent(
  conversationId: string,
  eventType: ConversationEvent['event_type'],
  data: Record<string, unknown>
): void {
  const log = conversationStore.get(conversationId);
  if (!log) return;

  log.events.push({
    event_type: eventType,
    timestamp: Date.now(),
    data,
  });
}

/**
 * Log a message
 */
export function logMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata: {
    agent_id?: string;
    intent?: string;
    emotion?: string;
    confidence?: number;
  }
): void {
  const log = conversationStore.get(conversationId);
  if (!log) return;

  if (metadata.agent_id && !log.agents_involved.includes(metadata.agent_id)) {
    log.agents_involved.push(metadata.agent_id);
  }

  if (metadata.intent && !log.intents.includes(metadata.intent)) {
    log.intents.push(metadata.intent);
  }

  if (metadata.emotion && !log.emotions.includes(metadata.emotion)) {
    log.emotions.push(metadata.emotion);
  }

  logEvent(conversationId, 'message', {
    role,
    content_length: content.length,
    ...metadata,
  });
}

/**
 * Log a decision
 */
export function logDecision(
  conversationId: string,
  decision: Omit<DecisionLog, 'timestamp'>
): void {
  const log = conversationStore.get(conversationId);
  if (!log) return;

  log.decisions.push({
    ...decision,
    timestamp: Date.now(),
  });

  logEvent(conversationId, 'decision', decision);
}

/**
 * Log agent handoff
 */
export function logHandoff(
  conversationId: string,
  fromAgent: string,
  toAgent: string,
  reason: string
): void {
  const log = conversationStore.get(conversationId);
  if (!log) return;

  if (!log.agents_involved.includes(toAgent)) {
    log.agents_involved.push(toAgent);
  }

  logEvent(conversationId, 'handoff', {
    from_agent: fromAgent,
    to_agent: toAgent,
    reason,
  });
}

/**
 * Log LLM call
 */
export function logLLMCall(
  conversationId: string,
  call: Omit<LLMCallLog, 'timestamp'>
): void {
  const log = conversationStore.get(conversationId);
  if (!log) return;

  const llmCall: LLMCallLog = {
    ...call,
    timestamp: Date.now(),
  };

  log.llm_calls.push(llmCall);
  log.cost += call.cost_estimate;

  logEvent(conversationId, 'api_call', {
    provider: call.provider,
    model: call.model,
    tokens: call.tokens_in + call.tokens_out,
    latency_ms: call.latency_ms,
    cost: call.cost_estimate,
  });
}

/**
 * Log error
 */
export function logError(
  conversationId: string,
  error: string,
  context: Record<string, unknown>
): void {
  logEvent(conversationId, 'error', { error, ...context });
}

/**
 * End conversation
 */
export async function endConversation(
  conversationId: string,
  outcome: ConversationLog['outcome'],
  converted: boolean
): Promise<ConversationLog | undefined> {
  const log = conversationStore.get(conversationId);
  if (!log) return undefined;

  log.outcome = outcome;
  log.conversion = converted;
  log.duration_ms = Date.now() - log.timestamp;

  logEvent(conversationId, 'end', { outcome, converted, duration_ms: log.duration_ms });

  // Store completed log
  recentLogs.unshift(log);
  if (recentLogs.length > MAX_LOGS) recentLogs.pop();

  // Persist to Redis
  await persistLog(log);

  // Remove from active store
  conversationStore.delete(conversationId);

  return log;
}

/**
 * Persist log to Redis
 */
async function persistLog(log: ConversationLog): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  try {
    await redis.lpush(REDIS_KEY, JSON.stringify(log));
    await redis.ltrim(REDIS_KEY, 0, MAX_LOGS - 1);
  } catch (e) {
    console.warn('[Observer] Redis persist failed');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get active conversation
 */
export function getActiveConversation(conversationId: string): ConversationLog | undefined {
  return conversationStore.get(conversationId);
}

/**
 * Get recent logs
 */
export function getRecentLogs(limit: number = 50): ConversationLog[] {
  return recentLogs.slice(0, limit);
}

/**
 * Get logs by outcome
 */
export function getLogsByOutcome(outcome: ConversationLog['outcome']): ConversationLog[] {
  return recentLogs.filter(l => l.outcome === outcome);
}

/**
 * Get aggregate stats
 */
export function getAggregateStats(): {
  total: number;
  by_outcome: Record<string, number>;
  avg_duration_ms: number;
  total_cost: number;
  conversion_rate: number;
  avg_agents_per_conversation: number;
} {
  const total = recentLogs.length;
  if (total === 0) {
    return {
      total: 0,
      by_outcome: {},
      avg_duration_ms: 0,
      total_cost: 0,
      conversion_rate: 0,
      avg_agents_per_conversation: 0,
    };
  }

  const by_outcome: Record<string, number> = {};
  let total_duration = 0;
  let total_cost = 0;
  let conversions = 0;
  let total_agents = 0;

  for (const log of recentLogs) {
    by_outcome[log.outcome] = (by_outcome[log.outcome] || 0) + 1;
    total_duration += log.duration_ms;
    total_cost += log.cost;
    if (log.conversion) conversions++;
    total_agents += log.agents_involved.length;
  }

  return {
    total,
    by_outcome,
    avg_duration_ms: Math.round(total_duration / total),
    total_cost: parseFloat(total_cost.toFixed(4)),
    conversion_rate: parseFloat((conversions / total * 100).toFixed(1)),
    avg_agents_per_conversation: parseFloat((total_agents / total).toFixed(1)),
  };
}
