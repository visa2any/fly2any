/**
 * Safe Interaction Tracking System
 *
 * GOVERNANCE RULES (IMMUTABLE):
 * - NO PII stored
 * - NO raw conversation text
 * - NO training on user messages
 * - All suggestions require manual approval
 */

import type { ConversationStage, ChaosClassification, ConfidenceLevel } from '../reasoning-layer';
import type { TeamType } from '../consultant-handoff';

// ============================================================================
// TYPES - ML-SAFE (NO PII)
// ============================================================================

export type InteractionOutcome =
  | 'resolved'      // User got what they needed
  | 'clarified'     // Required follow-up questions
  | 'abandoned'     // User left conversation
  | 'escalated'     // Transferred to human
  | 'converted';    // Led to booking

export type ResponsePattern =
  | 'inspirational'     // Discovery stage
  | 'consultative'      // Narrowing stage
  | 'search_results'    // Ready to search
  | 'booking_confirm'   // Booking stage
  | 'support_assist'    // Post-booking
  | 'clarifying_question'
  | 'error_recovery'
  | 'dead_end_prevented';

export interface InteractionMetric {
  // Identity (NO PII)
  sessionHash: string;        // Hashed session ID, not traceable
  timestamp: number;

  // Intent data (safe)
  intentType: string;
  chaosClassification: ChaosClassification;
  conversationStage: ConversationStage;
  confidenceLevel: ConfidenceLevel;

  // Agent data
  primaryAgent: TeamType | null;
  secondaryAgent: TeamType | null;

  // Response data (safe)
  responsePattern: ResponsePattern;
  wasAutoCorrect: boolean;
  complianceViolations: string[];

  // Outcome
  outcome: InteractionOutcome;
  successScore: number;  // 0-100

  // Context (safe, no content)
  language: string;
  missingContextCount: number;
  clarifyingQuestionsAsked: number;
}

// ============================================================================
// IN-MEMORY METRICS STORE (Production: use Redis/DB)
// ============================================================================

class MetricsStore {
  private metrics: InteractionMetric[] = [];
  private readonly MAX_METRICS = 10000;  // Rolling window

  add(metric: InteractionMetric): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  getAll(): InteractionMetric[] {
    return [...this.metrics];
  }

  getByAgent(agent: TeamType): InteractionMetric[] {
    return this.metrics.filter(m => m.primaryAgent === agent);
  }

  getByOutcome(outcome: InteractionOutcome): InteractionMetric[] {
    return this.metrics.filter(m => m.outcome === outcome);
  }

  getByIntent(intent: string): InteractionMetric[] {
    return this.metrics.filter(m => m.intentType === intent);
  }

  clear(): void {
    this.metrics = [];
  }
}

export const metricsStore = new MetricsStore();

// ============================================================================
// INTERACTION TRACKER
// ============================================================================

/**
 * Hash session ID to prevent PII leakage
 */
function hashSessionId(sessionId: string): string {
  // Simple hash - in production use crypto
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `s_${Math.abs(hash).toString(16)}`;
}

/**
 * Determine response pattern from context
 */
function determineResponsePattern(
  stage: ConversationStage,
  wasAutoCorrect: boolean,
  violations: string[]
): ResponsePattern {
  if (violations.length > 0 && wasAutoCorrect) {
    return 'dead_end_prevented';
  }
  if (wasAutoCorrect) {
    return 'error_recovery';
  }

  switch (stage) {
    case 'DISCOVERY': return 'inspirational';
    case 'NARROWING': return 'consultative';
    case 'READY_TO_SEARCH': return 'search_results';
    case 'READY_TO_BOOK': return 'booking_confirm';
    case 'POST_BOOKING': return 'support_assist';
    default: return 'clarifying_question';
  }
}

/**
 * Calculate success score (0-100)
 */
function calculateSuccessScore(
  outcome: InteractionOutcome,
  confidenceLevel: ConfidenceLevel,
  wasAutoCorrect: boolean,
  violationsCount: number
): number {
  let score = 50;  // Base score

  // Outcome weight
  switch (outcome) {
    case 'converted': score += 40; break;
    case 'resolved': score += 30; break;
    case 'clarified': score += 10; break;
    case 'escalated': score -= 10; break;
    case 'abandoned': score -= 30; break;
  }

  // Confidence weight
  switch (confidenceLevel) {
    case 'high': score += 10; break;
    case 'medium': score += 0; break;
    case 'low': score -= 10; break;
  }

  // Auto-correct penalty
  if (wasAutoCorrect) score -= 5;

  // Violations penalty
  score -= (violationsCount * 5);

  return Math.max(0, Math.min(100, score));
}

/**
 * Track an interaction (ML-SAFE - NO PII)
 */
export function trackInteraction(params: {
  sessionId: string;
  intentType: string;
  chaosClassification: ChaosClassification;
  conversationStage: ConversationStage;
  confidenceLevel: ConfidenceLevel;
  primaryAgent: TeamType | null;
  secondaryAgent: TeamType | null;
  wasAutoCorrect: boolean;
  complianceViolations: string[];
  outcome: InteractionOutcome;
  language: string;
  missingContextCount: number;
  clarifyingQuestionsAsked: number;
}): InteractionMetric {
  const responsePattern = determineResponsePattern(
    params.conversationStage,
    params.wasAutoCorrect,
    params.complianceViolations
  );

  const successScore = calculateSuccessScore(
    params.outcome,
    params.confidenceLevel,
    params.wasAutoCorrect,
    params.complianceViolations.length
  );

  const metric: InteractionMetric = {
    sessionHash: hashSessionId(params.sessionId),
    timestamp: Date.now(),
    intentType: params.intentType,
    chaosClassification: params.chaosClassification,
    conversationStage: params.conversationStage,
    confidenceLevel: params.confidenceLevel,
    primaryAgent: params.primaryAgent,
    secondaryAgent: params.secondaryAgent,
    responsePattern,
    wasAutoCorrect: params.wasAutoCorrect,
    complianceViolations: params.complianceViolations,
    outcome: params.outcome,
    successScore,
    language: params.language,
    missingContextCount: params.missingContextCount,
    clarifyingQuestionsAsked: params.clarifyingQuestionsAsked,
  };

  metricsStore.add(metric);

  // Log for monitoring (safe data only)
  console.log('[AI-METRICS]', JSON.stringify({
    intent: metric.intentType,
    agent: metric.primaryAgent,
    pattern: metric.responsePattern,
    outcome: metric.outcome,
    score: metric.successScore,
  }));

  return metric;
}

// ============================================================================
// ANALYTICS (Dashboard Logs)
// ============================================================================

export interface AgentPerformance {
  agent: TeamType;
  totalInteractions: number;
  avgSuccessScore: number;
  resolvedRate: number;
  abandonedRate: number;
  escalatedRate: number;
  convertedRate: number;
}

export interface IntentAnalysis {
  intent: string;
  totalCount: number;
  avgSuccessScore: number;
  topAgent: TeamType | null;
  failureRate: number;
  commonChaos: ChaosClassification | null;
}

/**
 * Get agent performance metrics
 */
export function getAgentPerformance(): AgentPerformance[] {
  const metrics = metricsStore.getAll();
  const agents: TeamType[] = ['flights', 'hotels', 'payments', 'support', 'general'];

  return agents.map(agent => {
    const agentMetrics = metrics.filter(m => m.primaryAgent === agent);
    const total = agentMetrics.length;

    if (total === 0) {
      return {
        agent,
        totalInteractions: 0,
        avgSuccessScore: 0,
        resolvedRate: 0,
        abandonedRate: 0,
        escalatedRate: 0,
        convertedRate: 0,
      };
    }

    const resolved = agentMetrics.filter(m => m.outcome === 'resolved').length;
    const abandoned = agentMetrics.filter(m => m.outcome === 'abandoned').length;
    const escalated = agentMetrics.filter(m => m.outcome === 'escalated').length;
    const converted = agentMetrics.filter(m => m.outcome === 'converted').length;
    const avgScore = agentMetrics.reduce((sum, m) => sum + m.successScore, 0) / total;

    return {
      agent,
      totalInteractions: total,
      avgSuccessScore: Math.round(avgScore),
      resolvedRate: Math.round((resolved / total) * 100),
      abandonedRate: Math.round((abandoned / total) * 100),
      escalatedRate: Math.round((escalated / total) * 100),
      convertedRate: Math.round((converted / total) * 100),
    };
  });
}

/**
 * Get most failed intents (for improvement)
 */
export function getMostFailedIntents(limit = 10): IntentAnalysis[] {
  const metrics = metricsStore.getAll();
  const intentMap = new Map<string, InteractionMetric[]>();

  metrics.forEach(m => {
    const existing = intentMap.get(m.intentType) || [];
    existing.push(m);
    intentMap.set(m.intentType, existing);
  });

  const analyses: IntentAnalysis[] = [];

  intentMap.forEach((intentMetrics, intent) => {
    const total = intentMetrics.length;
    const failed = intentMetrics.filter(m =>
      m.outcome === 'abandoned' || m.outcome === 'escalated'
    ).length;
    const avgScore = intentMetrics.reduce((sum, m) => sum + m.successScore, 0) / total;

    // Find most common agent
    const agentCounts = new Map<TeamType, number>();
    intentMetrics.forEach(m => {
      if (m.primaryAgent) {
        agentCounts.set(m.primaryAgent, (agentCounts.get(m.primaryAgent) || 0) + 1);
      }
    });
    let topAgent: TeamType | null = null;
    let maxCount = 0;
    agentCounts.forEach((count, agent) => {
      if (count > maxCount) {
        maxCount = count;
        topAgent = agent;
      }
    });

    // Find most common chaos
    const chaosCounts = new Map<ChaosClassification, number>();
    intentMetrics.forEach(m => {
      chaosCounts.set(m.chaosClassification, (chaosCounts.get(m.chaosClassification) || 0) + 1);
    });
    let commonChaos: ChaosClassification | null = null;
    maxCount = 0;
    chaosCounts.forEach((count, chaos) => {
      if (count > maxCount) {
        maxCount = count;
        commonChaos = chaos;
      }
    });

    analyses.push({
      intent,
      totalCount: total,
      avgSuccessScore: Math.round(avgScore),
      topAgent,
      failureRate: Math.round((failed / total) * 100),
      commonChaos,
    });
  });

  // Sort by failure rate (descending)
  return analyses
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, limit);
}

/**
 * Get most successful agent flows
 */
export function getMostSuccessfulFlows(limit = 10): Array<{
  stage: ConversationStage;
  pattern: ResponsePattern;
  agent: TeamType | null;
  avgScore: number;
  count: number;
}> {
  const metrics = metricsStore.getAll();
  const flowMap = new Map<string, InteractionMetric[]>();

  metrics.forEach(m => {
    const key = `${m.conversationStage}|${m.responsePattern}|${m.primaryAgent}`;
    const existing = flowMap.get(key) || [];
    existing.push(m);
    flowMap.set(key, existing);
  });

  const flows: Array<{
    stage: ConversationStage;
    pattern: ResponsePattern;
    agent: TeamType | null;
    avgScore: number;
    count: number;
  }> = [];

  flowMap.forEach((flowMetrics, key) => {
    const [stage, pattern, agent] = key.split('|');
    const avgScore = flowMetrics.reduce((sum, m) => sum + m.successScore, 0) / flowMetrics.length;

    flows.push({
      stage: stage as ConversationStage,
      pattern: pattern as ResponsePattern,
      agent: (agent === 'null' ? null : agent) as TeamType | null,
      avgScore: Math.round(avgScore),
      count: flowMetrics.length,
    });
  });

  return flows
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, limit);
}

/**
 * Log dashboard summary (safe for logs)
 */
export function logDashboardSummary(): void {
  console.log('\n========== AI LEARNING DASHBOARD ==========');

  console.log('\n--- Agent Performance ---');
  const agentPerf = getAgentPerformance();
  agentPerf.forEach(p => {
    if (p.totalInteractions > 0) {
      console.log(`[${p.agent}] Score: ${p.avgSuccessScore} | Resolved: ${p.resolvedRate}% | Abandoned: ${p.abandonedRate}%`);
    }
  });

  console.log('\n--- Most Failed Intents ---');
  const failed = getMostFailedIntents(5);
  failed.forEach(f => {
    console.log(`[${f.intent}] Failure: ${f.failureRate}% | Chaos: ${f.commonChaos} | Agent: ${f.topAgent}`);
  });

  console.log('\n--- Top Successful Flows ---');
  const flows = getMostSuccessfulFlows(5);
  flows.forEach(f => {
    console.log(`[${f.stage} → ${f.pattern}] Score: ${f.avgScore} | Count: ${f.count}`);
  });

  console.log('\n============================================\n');
}
