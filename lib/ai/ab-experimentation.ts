/**
 * A/B Auto-Experimentation Engine — Fly2Any
 * Test, learn, ship — quietly and intelligently.
 */

import { generateEventId } from './data-schema';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'concluded';
export type ExperimentDecision = 'ship_b' | 'keep_a' | 'iterate' | 'inconclusive';

export interface Experiment {
  experiment_id: string;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  variants: {
    a: { name: string; description: string };
    b: { name: string; description: string };
  };
  metrics: {
    primary: string;
    secondary: string[];
  };
  targeting: {
    traffic_pct: number; // 10, 25, 50, 100
    segments?: string[];
  };
  thresholds: {
    min_sample_size: number;
    max_duration_days: number;
    confidence_level: number; // 0.95
  };
  results?: ExperimentResults;
  decision?: ExperimentDecision;
  created_at: number;
  started_at?: number;
  ended_at?: number;
}

export interface ExperimentResults {
  variant_a: VariantMetrics;
  variant_b: VariantMetrics;
  winner: 'a' | 'b' | 'none';
  confidence: number;
  lift_pct: number;
  side_effects: string[];
  is_significant: boolean;
}

export interface VariantMetrics {
  sample_size: number;
  conversion_rate: number;
  avg_value: number;
  secondary_metrics: Record<string, number>;
}

export interface ExperimentTrigger {
  type: 'conversion_drop' | 'ux_friction' | 'new_feature' | 'pricing' | 'copy_test' | 'manual';
  context: string;
  suggested_hypothesis?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  experiments: new Map<string, Experiment>(),
  assignments: new Map<string, Map<string, 'a' | 'b'>>(), // experiment -> user -> variant
  learnings: [] as { experiment_id: string; insight: string; timestamp: number }[],
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPERIMENT LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create experiment from trigger
 */
export function createExperiment(trigger: ExperimentTrigger, name: string, config: {
  hypothesis: string;
  variant_a: { name: string; description: string };
  variant_b: { name: string; description: string };
  primary_metric: string;
  secondary_metrics?: string[];
  traffic_pct?: number;
  min_sample?: number;
  max_days?: number;
}): Experiment {
  const experiment: Experiment = {
    experiment_id: generateEventId(),
    name,
    hypothesis: config.hypothesis,
    status: 'draft',
    variants: { a: config.variant_a, b: config.variant_b },
    metrics: {
      primary: config.primary_metric,
      secondary: config.secondary_metrics || [],
    },
    targeting: { traffic_pct: config.traffic_pct || 10 },
    thresholds: {
      min_sample_size: config.min_sample || 1000,
      max_duration_days: config.max_days || 14,
      confidence_level: 0.95,
    },
    created_at: Date.now(),
  };

  state.experiments.set(experiment.experiment_id, experiment);
  return experiment;
}

/**
 * Start experiment with gradual rollout
 */
export function startExperiment(experimentId: string): boolean {
  const exp = state.experiments.get(experimentId);
  if (!exp || exp.status !== 'draft') return false;

  exp.status = 'running';
  exp.started_at = Date.now();
  state.assignments.set(experimentId, new Map());

  return true;
}

/**
 * Pause experiment
 */
export function pauseExperiment(experimentId: string): boolean {
  const exp = state.experiments.get(experimentId);
  if (!exp || exp.status !== 'running') return false;
  exp.status = 'paused';
  return true;
}

/**
 * Get variant assignment for user
 */
export function getVariant(experimentId: string, userId: string): 'a' | 'b' | null {
  const exp = state.experiments.get(experimentId);
  if (!exp || exp.status !== 'running') return null;

  const assignments = state.assignments.get(experimentId);
  if (!assignments) return null;

  // Check existing assignment
  if (assignments.has(userId)) {
    return assignments.get(userId)!;
  }

  // Check if user should be in experiment
  const hash = simpleHash(userId + experimentId);
  if ((hash % 100) >= exp.targeting.traffic_pct) {
    return null; // Not in experiment
  }

  // Assign variant (50/50)
  const variant: 'a' | 'b' = hash % 2 === 0 ? 'a' : 'b';
  assignments.set(userId, variant);
  return variant;
}

/**
 * Record conversion for experiment
 */
export function recordConversion(experimentId: string, userId: string, value = 1): void {
  const variant = state.assignments.get(experimentId)?.get(userId);
  if (!variant) return;

  // In real impl, store in analytics DB
  // Here we track in memory for demo
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSIS & DECISION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze experiment results
 */
export function analyzeExperiment(experimentId: string, data: {
  a_conversions: number;
  a_total: number;
  b_conversions: number;
  b_total: number;
  a_secondary?: Record<string, number>;
  b_secondary?: Record<string, number>;
}): ExperimentResults {
  const exp = state.experiments.get(experimentId);
  if (!exp) throw new Error('Experiment not found');

  const a_rate = data.a_total > 0 ? data.a_conversions / data.a_total : 0;
  const b_rate = data.b_total > 0 ? data.b_conversions / data.b_total : 0;
  const lift = a_rate > 0 ? ((b_rate - a_rate) / a_rate) * 100 : 0;

  // Calculate statistical significance (simplified z-test)
  const pooled = (data.a_conversions + data.b_conversions) / (data.a_total + data.b_total);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / data.a_total + 1 / data.b_total));
  const z = se > 0 ? Math.abs(b_rate - a_rate) / se : 0;
  const confidence = 1 - 2 * (1 - normalCDF(z));

  const isSignificant = confidence >= exp.thresholds.confidence_level &&
    data.a_total + data.b_total >= exp.thresholds.min_sample_size;

  const sideEffects: string[] = [];
  if (data.a_secondary && data.b_secondary) {
    Object.keys(data.a_secondary).forEach(metric => {
      const aDelta = data.a_secondary![metric];
      const bDelta = data.b_secondary![metric];
      if (bDelta < aDelta * 0.9) {
        sideEffects.push(`${metric} decreased by ${((1 - bDelta / aDelta) * 100).toFixed(0)}%`);
      }
    });
  }

  const results: ExperimentResults = {
    variant_a: {
      sample_size: data.a_total,
      conversion_rate: a_rate,
      avg_value: 0,
      secondary_metrics: data.a_secondary || {},
    },
    variant_b: {
      sample_size: data.b_total,
      conversion_rate: b_rate,
      avg_value: 0,
      secondary_metrics: data.b_secondary || {},
    },
    winner: isSignificant ? (lift > 0 ? 'b' : 'a') : 'none',
    confidence,
    lift_pct: lift,
    side_effects: sideEffects,
    is_significant: isSignificant,
  };

  exp.results = results;
  return results;
}

/**
 * Conclude experiment with decision
 */
export function concludeExperiment(experimentId: string): { decision: ExperimentDecision; reason: string } {
  const exp = state.experiments.get(experimentId);
  if (!exp || !exp.results) throw new Error('No results to conclude');

  const { results } = exp;
  let decision: ExperimentDecision;
  let reason: string;

  if (!results.is_significant) {
    decision = 'inconclusive';
    reason = 'Not enough data or no significant difference';
  } else if (results.side_effects.length > 0) {
    decision = 'iterate';
    reason = `Winner has side effects: ${results.side_effects.join(', ')}`;
  } else if (results.winner === 'b' && results.lift_pct > 0) {
    decision = 'ship_b';
    reason = `Variant B wins with ${results.lift_pct.toFixed(1)}% lift at ${(results.confidence * 100).toFixed(0)}% confidence`;
  } else {
    decision = 'keep_a';
    reason = 'Control performs better or equal';
  }

  exp.status = 'concluded';
  exp.ended_at = Date.now();
  exp.decision = decision;

  // Record learning
  state.learnings.push({
    experiment_id: experimentId,
    insight: `${exp.name}: ${reason}`,
    timestamp: Date.now(),
  });

  return { decision, reason };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

// ═══════════════════════════════════════════════════════════════════════════
// RETRIEVAL
// ═══════════════════════════════════════════════════════════════════════════

export function getExperiments(status?: ExperimentStatus): Experiment[] {
  const all = Array.from(state.experiments.values());
  return status ? all.filter(e => e.status === status) : all;
}

export function getExperiment(experimentId: string): Experiment | undefined {
  return state.experiments.get(experimentId);
}

export function getLearnings(limit = 20): typeof state.learnings {
  return state.learnings.slice(0, limit);
}

export function getExperimentStats(): {
  total: number;
  running: number;
  concluded: number;
  avg_lift: number;
  win_rate: number;
} {
  const all = Array.from(state.experiments.values());
  const concluded = all.filter(e => e.status === 'concluded');
  const wins = concluded.filter(e => e.decision === 'ship_b');
  const lifts = concluded.filter(e => e.results?.lift_pct).map(e => e.results!.lift_pct);

  return {
    total: all.length,
    running: all.filter(e => e.status === 'running').length,
    concluded: concluded.length,
    avg_lift: lifts.length > 0 ? lifts.reduce((a, b) => a + b, 0) / lifts.length : 0,
    win_rate: concluded.length > 0 ? wins.length / concluded.length : 0,
  };
}
