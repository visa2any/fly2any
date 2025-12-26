/**
 * Cost-Aware LLM Load Balancer — Fly2Any AI Ecosystem
 *
 * Dynamically selects optimal LLM based on task complexity,
 * risk level, urgency, and cost efficiency.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type ModelTier = 'high' | 'mid' | 'low';

export interface ModelConfig {
  tier: ModelTier;
  provider: 'groq' | 'openai';
  model: string;
  cost_per_1k_tokens: number;
  max_tokens: number;
  latency_ms: number;
}

export interface TaskContext {
  intent: string;
  domain: string;
  urgency_level: string;
  emotional_state: string;
  has_uncertainty: boolean;
  hallucination_risk: boolean;
  is_escalated: boolean;
  is_repetitive: boolean;
  cached_available: boolean;
}

export interface ModelSelection {
  tier: ModelTier;
  model: string;
  provider: string;
  reason: string;
  estimated_cost: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODEL CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════
const MODELS: Record<ModelTier, ModelConfig> = {
  high: {
    tier: 'high',
    provider: 'openai',
    model: 'gpt-4o',
    cost_per_1k_tokens: 0.005,
    max_tokens: 4096,
    latency_ms: 2000,
  },
  mid: {
    tier: 'mid',
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    cost_per_1k_tokens: 0.0007,
    max_tokens: 2048,
    latency_ms: 500,
  },
  low: {
    tier: 'low',
    provider: 'openai',
    model: 'gpt-4o-mini',
    cost_per_1k_tokens: 0.00015,
    max_tokens: 1024,
    latency_ms: 300,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN → TIER MAPPING
// ═══════════════════════════════════════════════════════════════════════════
const HIGH_INTELLIGENCE_DOMAINS = [
  'LEGAL', 'PAYMENT', 'REFUND', 'CRISIS', 'EMERGENCY', 'INSURANCE',
];

const MID_TIER_DOMAINS = [
  'FLIGHT_SEARCH', 'HOTEL_SEARCH', 'BOOKING', 'PLANNING', 'RETENTION',
];

const LOW_COST_DOMAINS = [
  'FAQ', 'STATUS', 'CONFIRMATION', 'GREETING', 'GENERAL_TRAVEL_INFO',
];

// ═══════════════════════════════════════════════════════════════════════════
// CORE SELECTION LOGIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Select optimal model for task
 */
export function selectModel(context: TaskContext): ModelSelection {
  let tier: ModelTier = 'mid'; // Default
  let reason = 'Default mid-tier selection';

  // ─────────────────────────────────────────────────────────────────────────
  // UPGRADE CONDITIONS (force higher tier)
  // ─────────────────────────────────────────────────────────────────────────

  // High-risk domains always use HIGH
  if (HIGH_INTELLIGENCE_DOMAINS.some(d => context.domain.includes(d) || context.intent.includes(d))) {
    tier = 'high';
    reason = 'High-risk domain requires maximum intelligence';
  }

  // CRITICAL urgency
  if (context.urgency_level === 'CRITICAL') {
    tier = 'high';
    reason = 'CRITICAL urgency requires high intelligence';
  }

  // Hallucination risk
  if (context.hallucination_risk) {
    tier = 'high';
    reason = 'Hallucination risk detected - using safer model';
  }

  // Escalated conversation
  if (context.is_escalated) {
    tier = Math.max(tier === 'low' ? 1 : tier === 'mid' ? 2 : 3, 2) === 2 ? 'mid' : 'high';
    reason = 'Escalated conversation - upgrading model';
  }

  // High emotional state
  if (['FRUSTRATED', 'PANICKED', 'ANXIOUS'].includes(context.emotional_state)) {
    if (tier === 'low') {
      tier = 'mid';
      reason = 'Elevated emotional state - upgrading from low';
    }
  }

  // Uncertainty detected
  if (context.has_uncertainty && tier === 'low') {
    tier = 'mid';
    reason = 'Uncertainty detected - upgrading model';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DOWNGRADE CONDITIONS (cost optimization)
  // ─────────────────────────────────────────────────────────────────────────

  // Low-cost domains can use LOW tier
  if (LOW_COST_DOMAINS.some(d => context.domain.includes(d) || context.intent.includes(d))) {
    if (tier === 'mid' && context.emotional_state === 'CALM' && !context.has_uncertainty) {
      tier = 'low';
      reason = 'Simple task with calm user - using cost-efficient model';
    }
  }

  // Cached response available
  if (context.cached_available) {
    tier = 'low';
    reason = 'Cached response available - minimal processing needed';
  }

  // Repetitive task
  if (context.is_repetitive && tier !== 'high') {
    tier = 'low';
    reason = 'Repetitive task - using fast, low-cost model';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BUILD SELECTION RESULT
  // ─────────────────────────────────────────────────────────────────────────
  const config = MODELS[tier];

  return {
    tier,
    model: config.model,
    provider: config.provider,
    reason,
    estimated_cost: config.cost_per_1k_tokens * 2, // Estimate 2k tokens avg
  };
}

/**
 * Get model config by tier
 */
export function getModelConfig(tier: ModelTier): ModelConfig {
  return MODELS[tier];
}

/**
 * Estimate cost for conversation
 */
export function estimateCost(
  tier: ModelTier,
  estimated_tokens: number = 2000
): number {
  const config = MODELS[tier];
  return (estimated_tokens / 1000) * config.cost_per_1k_tokens;
}

// ═══════════════════════════════════════════════════════════════════════════
// COST TRACKING
// ═══════════════════════════════════════════════════════════════════════════
const costTracker = {
  total_cost: 0,
  calls_by_tier: { high: 0, mid: 0, low: 0 },
  cost_by_tier: { high: 0, mid: 0, low: 0 },
};

/**
 * Record API call for cost tracking
 */
export function recordAPICall(tier: ModelTier, tokens_used: number): void {
  const cost = estimateCost(tier, tokens_used);
  costTracker.total_cost += cost;
  costTracker.calls_by_tier[tier]++;
  costTracker.cost_by_tier[tier] += cost;
}

/**
 * Get cost analytics
 */
export function getCostAnalytics() {
  const total_calls = costTracker.calls_by_tier.high +
                     costTracker.calls_by_tier.mid +
                     costTracker.calls_by_tier.low;

  return {
    total_cost: costTracker.total_cost.toFixed(4),
    total_calls,
    avg_cost_per_call: total_calls > 0 ? (costTracker.total_cost / total_calls).toFixed(6) : '0',
    calls_by_tier: costTracker.calls_by_tier,
    cost_by_tier: {
      high: costTracker.cost_by_tier.high.toFixed(4),
      mid: costTracker.cost_by_tier.mid.toFixed(4),
      low: costTracker.cost_by_tier.low.toFixed(4),
    },
    efficiency_score: total_calls > 0
      ? ((costTracker.calls_by_tier.low * 3 + costTracker.calls_by_tier.mid * 2 + costTracker.calls_by_tier.high) / total_calls).toFixed(2)
      : '0',
  };
}

/**
 * Reset cost tracker (for testing/daily reset)
 */
export function resetCostTracker(): void {
  costTracker.total_cost = 0;
  costTracker.calls_by_tier = { high: 0, mid: 0, low: 0 };
  costTracker.cost_by_tier = { high: 0, mid: 0, low: 0 };
}
