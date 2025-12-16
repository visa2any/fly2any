/**
 * Self-Learning Product Brain — Fly2Any
 * Every day slightly smarter than yesterday.
 */

import { generateEventId } from './data-schema';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type LearningCategory = 'routing' | 'conversion' | 'personalization' | 'pricing' | 'ux' | 'support';
export type PatternConfidence = 'hypothesis' | 'emerging' | 'validated' | 'established';

export interface LearningInsight {
  insight_id: string;
  category: LearningCategory;
  pattern: string;
  confidence: PatternConfidence;
  evidence_count: number;
  impact_score: number; // 0-100
  first_observed: number;
  last_validated: number;
  applications: string[]; // How this insight is used
  source_signals: string[];
}

export interface BehaviorObservation {
  observation_id: string;
  timestamp: number;
  context: string;
  outcome: 'success' | 'failure' | 'neutral';
  metrics: Record<string, number>;
  signals: string[];
}

export interface DecisionFeedback {
  decision_type: string;
  was_correct: boolean;
  actual_outcome: string;
  expected_outcome: string;
  context: Record<string, unknown>;
}

export interface LearningPrinciple {
  principle_id: string;
  category: LearningCategory;
  statement: string;
  derived_from: string[];
  confidence: number;
  created_at: number;
  applications_count: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE (In-memory knowledge base)
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  insights: new Map<string, LearningInsight>(),
  principles: [] as LearningPrinciple[],
  observations: [] as BehaviorObservation[],
  patternCounts: new Map<string, number>(),
  dailyLearnings: [] as { date: string; learnings: number; improvements: string[] }[],
  metrics: {
    total_observations: 0,
    patterns_detected: 0,
    insights_validated: 0,
    principles_derived: 0,
    decisions_improved: 0,
  },
};

// Pre-seed with core principles
const CORE_PRINCIPLES: Omit<LearningPrinciple, 'principle_id' | 'created_at' | 'applications_count'>[] = [
  { category: 'routing', statement: 'High-value bookings benefit from specialist agents', derived_from: ['initial'], confidence: 0.9 },
  { category: 'conversion', statement: 'Price transparency increases trust and conversion', derived_from: ['initial'], confidence: 0.95 },
  { category: 'personalization', statement: 'Returning users prefer familiar patterns', derived_from: ['initial'], confidence: 0.85 },
  { category: 'ux', statement: 'Fewer steps = higher completion', derived_from: ['initial'], confidence: 0.9 },
  { category: 'support', statement: 'Early frustration detection prevents escalations', derived_from: ['initial'], confidence: 0.8 },
  { category: 'pricing', statement: 'Value framing outperforms discount framing for quality users', derived_from: ['initial'], confidence: 0.75 },
];

// Initialize principles
CORE_PRINCIPLES.forEach(p => {
  state.principles.push({
    ...p,
    principle_id: generateEventId(),
    created_at: Date.now(),
    applications_count: 0,
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. OBSERVATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record behavior observation (no PII)
 */
export function observe(context: string, outcome: BehaviorObservation['outcome'], metrics: Record<string, number>, signals: string[]): void {
  const observation: BehaviorObservation = {
    observation_id: generateEventId(),
    timestamp: Date.now(),
    context,
    outcome,
    metrics,
    signals,
  };

  state.observations.unshift(observation);
  if (state.observations.length > 1000) state.observations = state.observations.slice(0, 1000);
  state.metrics.total_observations++;

  // Trigger pattern detection
  detectPatterns(observation);
}

/**
 * Record decision feedback
 */
export function recordDecisionFeedback(feedback: DecisionFeedback): void {
  const pattern = `${feedback.decision_type}:${feedback.was_correct ? 'correct' : 'incorrect'}`;
  incrementPattern(pattern);

  if (!feedback.was_correct) {
    // Learn from mistakes
    const insight = findOrCreateInsight(
      categorizeDecision(feedback.decision_type),
      `${feedback.decision_type} decision often incorrect when ${summarizeContext(feedback.context)}`
    );
    insight.evidence_count++;
    insight.source_signals.push(feedback.actual_outcome);
    validateInsight(insight);
  }
}

/**
 * Record experiment outcome for learning
 */
export function learnFromExperiment(experimentName: string, winner: 'a' | 'b' | 'none', lift: number, context: string): void {
  if (winner === 'none') return;

  const insight = findOrCreateInsight(
    'conversion',
    `${context}: Variant ${winner} wins with ${lift.toFixed(1)}% lift`
  );
  insight.evidence_count++;
  insight.impact_score = Math.max(insight.impact_score, Math.abs(lift));
  insight.applications.push(`experiment:${experimentName}`);
  validateInsight(insight);
}

/**
 * Record funnel conversion for learning
 */
export function learnFromFunnel(step: string, converted: boolean, segment: string): void {
  const pattern = `funnel:${step}:${segment}:${converted ? 'converted' : 'dropped'}`;
  incrementPattern(pattern);

  // Detect drop-off patterns
  if (!converted) {
    const count = state.patternCounts.get(pattern) || 0;
    if (count > 10) {
      const insight = findOrCreateInsight('conversion', `${segment} users frequently drop at ${step}`);
      insight.evidence_count = count;
      validateInsight(insight);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. PATTERN DETECTION
// ═══════════════════════════════════════════════════════════════════════════

function detectPatterns(observation: BehaviorObservation): void {
  // Pattern 1: Repeated failures in context
  if (observation.outcome === 'failure') {
    const failurePattern = `failure:${observation.context}`;
    const count = incrementPattern(failurePattern);

    if (count >= 5) {
      const insight = findOrCreateInsight(
        categorizeContext(observation.context),
        `Repeated failures in ${observation.context}`
      );
      insight.evidence_count = count;
      insight.source_signals.push(...observation.signals);
      validateInsight(insight);
    }
  }

  // Pattern 2: Metric correlations
  const metricKeys = Object.keys(observation.metrics);
  metricKeys.forEach(key => {
    const value = observation.metrics[key];
    if (observation.outcome === 'success' && value > 80) {
      const successPattern = `high_${key}:success`;
      incrementPattern(successPattern);
    }
  });

  // Pattern 3: Signal combinations
  if (observation.signals.length >= 2) {
    const signalKey = observation.signals.sort().join('+');
    const pattern = `signals:${signalKey}:${observation.outcome}`;
    incrementPattern(pattern);
  }

  state.metrics.patterns_detected = state.patternCounts.size;
}

function incrementPattern(pattern: string): number {
  const count = (state.patternCounts.get(pattern) || 0) + 1;
  state.patternCounts.set(pattern, count);
  return count;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. INSIGHT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function findOrCreateInsight(category: LearningCategory, pattern: string): LearningInsight {
  // Check existing
  const key = `${category}:${pattern.slice(0, 50)}`;
  let insight = state.insights.get(key);

  if (!insight) {
    insight = {
      insight_id: generateEventId(),
      category,
      pattern,
      confidence: 'hypothesis',
      evidence_count: 0,
      impact_score: 0,
      first_observed: Date.now(),
      last_validated: Date.now(),
      applications: [],
      source_signals: [],
    };
    state.insights.set(key, insight);
  }

  return insight;
}

function validateInsight(insight: LearningInsight): void {
  insight.last_validated = Date.now();

  // Update confidence based on evidence
  if (insight.evidence_count >= 3 && insight.confidence === 'hypothesis') {
    insight.confidence = 'emerging';
  }
  if (insight.evidence_count >= 10 && insight.confidence === 'emerging') {
    insight.confidence = 'validated';
    state.metrics.insights_validated++;

    // Consider deriving principle
    maybeDerivePrinciple(insight);
  }
  if (insight.evidence_count >= 50 && insight.confidence === 'validated') {
    insight.confidence = 'established';
  }
}

function maybeDerivePrinciple(insight: LearningInsight): void {
  // Only derive from high-impact validated insights
  if (insight.impact_score < 5 || insight.confidence !== 'validated') return;

  // Check if similar principle exists
  const exists = state.principles.some(p =>
    p.category === insight.category &&
    p.statement.toLowerCase().includes(insight.pattern.slice(0, 20).toLowerCase())
  );

  if (!exists) {
    const principle: LearningPrinciple = {
      principle_id: generateEventId(),
      category: insight.category,
      statement: abstractToprinciple(insight),
      derived_from: [insight.insight_id],
      confidence: 0.7,
      created_at: Date.now(),
      applications_count: 0,
    };
    state.principles.push(principle);
    state.metrics.principles_derived++;
  }
}

function abstractToprinciple(insight: LearningInsight): string {
  // Abstract specific insight into general principle
  const templates: Record<LearningCategory, (p: string) => string> = {
    routing: p => `Route to specialist when ${p.replace(/specific|user|session/gi, 'context').slice(0, 50)}`,
    conversion: p => `Conversion improves when ${p.replace(/dropped|failed/gi, 'addressed').slice(0, 50)}`,
    personalization: p => `Users respond better to ${p.replace(/variant|test/gi, 'approach').slice(0, 50)}`,
    pricing: p => `Pricing perception affected by ${p.slice(0, 50)}`,
    ux: p => `UX friction reduced by addressing ${p.slice(0, 50)}`,
    support: p => `Support quality improves when ${p.slice(0, 50)}`,
  };

  return templates[insight.category](insight.pattern);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. APPLY LEARNINGS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get routing recommendation based on learnings
 */
export function getRoutingRecommendation(context: { intent: string; value: number; emotion: string }): {
  agent: string;
  confidence: number;
  reason: string;
} {
  // Find relevant principles
  const routingPrinciples = state.principles.filter(p => p.category === 'routing');

  // High-value → specialist
  if (context.value > 1000) {
    const principle = routingPrinciples.find(p => p.statement.includes('specialist'));
    if (principle) {
      principle.applications_count++;
      state.metrics.decisions_improved++;
      return { agent: 'booking_specialist', confidence: 0.9, reason: principle.statement };
    }
  }

  // Frustrated → empathetic handling
  if (context.emotion === 'FRUSTRATED') {
    return { agent: 'support_specialist', confidence: 0.85, reason: 'Early frustration detection prevents escalations' };
  }

  return { agent: 'general', confidence: 0.7, reason: 'Default routing' };
}

/**
 * Get personalization recommendation
 */
export function getPersonalizationRecommendation(context: { isReturning: boolean; segment: string }): {
  approach: string;
  confidence: number;
  reason: string;
} {
  const principles = state.principles.filter(p => p.category === 'personalization');

  if (context.isReturning) {
    const principle = principles.find(p => p.statement.includes('familiar'));
    if (principle) {
      principle.applications_count++;
      return { approach: 'maintain_familiarity', confidence: 0.85, reason: principle.statement };
    }
  }

  // Check learnings for segment
  const segmentInsights = Array.from(state.insights.values())
    .filter(i => i.category === 'personalization' && i.pattern.includes(context.segment));

  if (segmentInsights.length > 0) {
    const best = segmentInsights.sort((a, b) => b.impact_score - a.impact_score)[0];
    return { approach: 'learned_preference', confidence: 0.75, reason: best.pattern };
  }

  return { approach: 'default', confidence: 0.6, reason: 'No specific learning for segment' };
}

/**
 * Get experiment suggestion based on learnings
 */
export function suggestExperiment(): { hypothesis: string; variant: string; expected_lift: number } | null {
  // Find patterns with high count but not yet validated
  const emergingPatterns = Array.from(state.insights.values())
    .filter(i => i.confidence === 'emerging' && i.evidence_count >= 5);

  if (emergingPatterns.length === 0) return null;

  const candidate = emergingPatterns.sort((a, b) => b.impact_score - a.impact_score)[0];

  return {
    hypothesis: `Testing: ${candidate.pattern}`,
    variant: `Address ${candidate.category} pattern`,
    expected_lift: Math.min(candidate.impact_score / 10, 5),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function categorizeDecision(type: string): LearningCategory {
  if (type.includes('route') || type.includes('agent')) return 'routing';
  if (type.includes('price') || type.includes('discount')) return 'pricing';
  if (type.includes('personal')) return 'personalization';
  if (type.includes('support') || type.includes('escalat')) return 'support';
  return 'ux';
}

function categorizeContext(context: string): LearningCategory {
  if (context.includes('checkout') || context.includes('payment')) return 'conversion';
  if (context.includes('search') || context.includes('result')) return 'ux';
  if (context.includes('support') || context.includes('help')) return 'support';
  return 'ux';
}

function summarizeContext(ctx: Record<string, unknown>): string {
  const keys = Object.keys(ctx).slice(0, 3);
  return keys.map(k => `${k}=${String(ctx[k]).slice(0, 10)}`).join(', ');
}

// ═══════════════════════════════════════════════════════════════════════════
// RETRIEVAL & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

export function getInsights(category?: LearningCategory, minConfidence?: PatternConfidence): LearningInsight[] {
  let insights = Array.from(state.insights.values());

  if (category) insights = insights.filter(i => i.category === category);

  if (minConfidence) {
    const order: PatternConfidence[] = ['hypothesis', 'emerging', 'validated', 'established'];
    const minIndex = order.indexOf(minConfidence);
    insights = insights.filter(i => order.indexOf(i.confidence) >= minIndex);
  }

  return insights.sort((a, b) => b.impact_score - a.impact_score);
}

export function getPrinciples(category?: LearningCategory): LearningPrinciple[] {
  let principles = [...state.principles];
  if (category) principles = principles.filter(p => p.category === category);
  return principles.sort((a, b) => b.confidence - a.confidence);
}

export function getLearningMetrics(): typeof state.metrics & {
  insights_by_category: Record<LearningCategory, number>;
  top_patterns: Array<{ pattern: string; count: number }>;
} {
  const byCategory: Record<LearningCategory, number> = {
    routing: 0, conversion: 0, personalization: 0, pricing: 0, ux: 0, support: 0,
  };

  state.insights.forEach(i => byCategory[i.category]++);

  const topPatterns = Array.from(state.patternCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pattern, count]) => ({ pattern, count }));

  return { ...state.metrics, insights_by_category: byCategory, top_patterns: topPatterns };
}

export function getDailyLearningReport(): { date: string; new_insights: number; validated: number; principles_applied: number } {
  const today = new Date().toISOString().split('T')[0];
  const dayStart = new Date(today).getTime();

  const newInsights = Array.from(state.insights.values()).filter(i => i.first_observed >= dayStart).length;
  const validated = Array.from(state.insights.values()).filter(i => i.last_validated >= dayStart && i.confidence === 'validated').length;
  const applied = state.principles.reduce((sum, p) => sum + p.applications_count, 0);

  return { date: today, new_insights: newInsights, validated, principles_applied: applied };
}

/**
 * Export learnings for persistence (no PII)
 */
export function exportLearnings(): { principles: LearningPrinciple[]; insights: LearningInsight[]; metrics: typeof state.metrics } {
  return {
    principles: state.principles,
    insights: Array.from(state.insights.values()),
    metrics: state.metrics,
  };
}

/**
 * Import previously saved learnings
 */
export function importLearnings(data: { principles?: LearningPrinciple[]; insights?: LearningInsight[] }): void {
  if (data.principles) {
    data.principles.forEach(p => {
      if (!state.principles.find(existing => existing.statement === p.statement)) {
        state.principles.push(p);
      }
    });
  }

  if (data.insights) {
    data.insights.forEach(i => {
      const key = `${i.category}:${i.pattern.slice(0, 50)}`;
      if (!state.insights.has(key)) {
        state.insights.set(key, i);
      }
    });
  }
}
