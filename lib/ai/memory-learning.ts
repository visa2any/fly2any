/**
 * Memory & Learning Loop — Fly2Any AI Ecosystem
 *
 * Continuously learns from interactions to improve all agents.
 * No PII storage. GDPR/CCPA compliant.
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export interface ConversationOutcome {
  conversation_id: string;
  primary_intent: string;
  agents_involved: string[];
  resolution_status: 'resolved' | 'escalated' | 'abandoned';
  resolution_time_ms: number;
  handoff_count: number;
  emotional_journey: string[]; // CALM -> FRUSTRATED -> CALM
  converted: boolean;
  user_satisfaction?: 'positive' | 'neutral' | 'negative';
}

export interface LearningInsight {
  type: 'pattern' | 'optimization' | 'warning';
  category: string;
  insight: string;
  evidence_count: number;
  confidence: number;
  created_at: string;
}

export interface AgentPerformance {
  agent_id: string;
  total_interactions: number;
  resolution_rate: number;
  avg_resolution_time_ms: number;
  hallucination_incidents: number;
  escalation_rate: number;
  conversion_rate: number;
  satisfaction_score: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// REDIS KEYS
// ═══════════════════════════════════════════════════════════════════════════
const KEYS = {
  INSIGHTS: 'fly2any:memory:insights',
  AGENT_STATS: 'fly2any:memory:agent_stats',
  PATTERNS: 'fly2any:memory:patterns',
  METRICS: 'fly2any:memory:metrics',
};

// ═══════════════════════════════════════════════════════════════════════════
// IN-MEMORY FALLBACK (for environments without Redis)
// ═══════════════════════════════════════════════════════════════════════════
const memoryStore = {
  insights: [] as LearningInsight[],
  agentStats: new Map<string, AgentPerformance>(),
  patterns: new Map<string, number>(),
  metrics: {
    total_conversations: 0,
    resolved_count: 0,
    escalated_count: 0,
    abandoned_count: 0,
    conversion_count: 0,
    avg_resolution_time: 0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record conversation outcome for learning
 */
export async function recordOutcome(outcome: ConversationOutcome): Promise<void> {
  // Update metrics
  memoryStore.metrics.total_conversations++;

  if (outcome.resolution_status === 'resolved') {
    memoryStore.metrics.resolved_count++;
    if (outcome.converted) memoryStore.metrics.conversion_count++;
  } else if (outcome.resolution_status === 'escalated') {
    memoryStore.metrics.escalated_count++;
  } else {
    memoryStore.metrics.abandoned_count++;
  }

  // Update agent stats
  for (const agent of outcome.agents_involved) {
    updateAgentStats(agent, outcome);
  }

  // Detect patterns
  await detectPatterns(outcome);

  // Persist to Redis if available
  await persistToRedis();
}

/**
 * Update agent performance stats
 */
function updateAgentStats(agentId: string, outcome: ConversationOutcome): void {
  const existing = memoryStore.agentStats.get(agentId) || {
    agent_id: agentId,
    total_interactions: 0,
    resolution_rate: 0,
    avg_resolution_time_ms: 0,
    hallucination_incidents: 0,
    escalation_rate: 0,
    conversion_rate: 0,
    satisfaction_score: 0,
  };

  existing.total_interactions++;

  // Recalculate rates
  const resolved = outcome.resolution_status === 'resolved' ? 1 : 0;
  existing.resolution_rate =
    (existing.resolution_rate * (existing.total_interactions - 1) + resolved) / existing.total_interactions;

  const escalated = outcome.resolution_status === 'escalated' ? 1 : 0;
  existing.escalation_rate =
    (existing.escalation_rate * (existing.total_interactions - 1) + escalated) / existing.total_interactions;

  const converted = outcome.converted ? 1 : 0;
  existing.conversion_rate =
    (existing.conversion_rate * (existing.total_interactions - 1) + converted) / existing.total_interactions;

  // Update avg resolution time
  existing.avg_resolution_time_ms =
    (existing.avg_resolution_time_ms * (existing.total_interactions - 1) + outcome.resolution_time_ms) / existing.total_interactions;

  memoryStore.agentStats.set(agentId, existing);
}

/**
 * Detect patterns from conversation outcome
 */
async function detectPatterns(outcome: ConversationOutcome): Promise<void> {
  // Pattern: Emotional recovery
  if (outcome.emotional_journey.includes('FRUSTRATED') &&
      outcome.emotional_journey[outcome.emotional_journey.length - 1] === 'CALM' &&
      outcome.resolution_status === 'resolved') {
    incrementPattern('emotional_recovery_success');
  }

  // Pattern: Multiple handoffs lead to abandonment
  if (outcome.handoff_count > 2 && outcome.resolution_status === 'abandoned') {
    incrementPattern('excessive_handoff_abandonment');
  }

  // Pattern: Quick resolution converts
  if (outcome.resolution_time_ms < 60000 && outcome.converted) {
    incrementPattern('fast_resolution_conversion');
  }

  // Generate insights when patterns reach threshold
  await generateInsights();
}

/**
 * Increment pattern counter
 */
function incrementPattern(patternKey: string): void {
  const count = memoryStore.patterns.get(patternKey) || 0;
  memoryStore.patterns.set(patternKey, count + 1);
}

/**
 * Generate insights from patterns
 */
async function generateInsights(): Promise<void> {
  const THRESHOLD = 10;

  // Check emotional recovery pattern
  const emotionalRecovery = memoryStore.patterns.get('emotional_recovery_success') || 0;
  if (emotionalRecovery >= THRESHOLD && !hasInsight('emotional_recovery')) {
    addInsight({
      type: 'pattern',
      category: 'emotional_recovery',
      insight: 'Users who recover from frustration have high resolution rates. Prioritize empathetic tone when frustration detected.',
      evidence_count: emotionalRecovery,
      confidence: 0.85,
      created_at: new Date().toISOString(),
    });
  }

  // Check excessive handoff pattern
  const handoffAbandonment = memoryStore.patterns.get('excessive_handoff_abandonment') || 0;
  if (handoffAbandonment >= THRESHOLD && !hasInsight('handoff_limit')) {
    addInsight({
      type: 'warning',
      category: 'handoff_limit',
      insight: 'Users abandon after 2+ handoffs. Enforce max 2 handoffs per session.',
      evidence_count: handoffAbandonment,
      confidence: 0.9,
      created_at: new Date().toISOString(),
    });
  }

  // Check fast resolution pattern
  const fastConversion = memoryStore.patterns.get('fast_resolution_conversion') || 0;
  if (fastConversion >= THRESHOLD && !hasInsight('fast_resolution')) {
    addInsight({
      type: 'optimization',
      category: 'fast_resolution',
      insight: 'Resolutions under 60s have higher conversion. Optimize agent response time.',
      evidence_count: fastConversion,
      confidence: 0.8,
      created_at: new Date().toISOString(),
    });
  }
}

function hasInsight(category: string): boolean {
  return memoryStore.insights.some(i => i.category === category);
}

function addInsight(insight: LearningInsight): void {
  memoryStore.insights.push(insight);
}

/**
 * Persist to Redis
 */
async function persistToRedis(): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  try {
    await redis.set(KEYS.METRICS, JSON.stringify(memoryStore.metrics));
    await redis.set(KEYS.INSIGHTS, JSON.stringify(memoryStore.insights));
  } catch (e) {
    console.warn('[Memory] Redis persist failed');
  }
}

/**
 * Get learning insights
 */
export function getInsights(): LearningInsight[] {
  return memoryStore.insights;
}

/**
 * Get agent performance
 */
export function getAgentPerformance(agentId: string): AgentPerformance | undefined {
  return memoryStore.agentStats.get(agentId);
}

/**
 * Get all agent performances
 */
export function getAllAgentPerformances(): AgentPerformance[] {
  return Array.from(memoryStore.agentStats.values());
}

/**
 * Get system metrics
 */
export function getSystemMetrics() {
  return { ...memoryStore.metrics };
}
