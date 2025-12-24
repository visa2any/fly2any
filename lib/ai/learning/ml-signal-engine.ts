/**
 * ML Signal Engine
 *
 * GOVERNANCE (IMMUTABLE):
 * - ADVISORY ONLY - No auto-actions
 * - NEVER generates responses
 * - NEVER touches pricing/payments
 * - ALL outputs require human approval
 * - Full audit logging
 * - No PII processed
 */

import type { ConversationStage, ChaosClassification, ConfidenceLevel } from '../reasoning-layer';
import type { TeamType } from '../consultant-handoff';
import type { InteractionMetric, ResponsePattern } from './interaction-tracker';
import { getActiveStore } from './store-abstraction';
import { isBlockedDomain, recommendationStore } from './recommendation-engine';

// ============================================================================
// TYPES
// ============================================================================

export type MLModelType =
  | 'intent_confidence'    // Predict intent classification accuracy
  | 'stage_dropoff'        // Predict stage abandonment risk
  | 'agent_routing';       // Optimize agent selection

export type MLSignalStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface MLSignal {
  id: string;
  createdAt: number;
  modelType: MLModelType;
  status: MLSignalStatus;

  // Prediction
  prediction: number;        // 0-100 confidence/probability
  explanation: string;       // Human-readable reason
  features: string[];        // Input features used (NO PII)

  // Governance
  isAdvisoryOnly: true;      // Constant - never auto-execute
  requiresApproval: true;    // Constant - always needs human
  blockedReason?: string;
  approvedBy?: string;
  approvedAt?: number;
}

export interface IntentConfidenceSignal extends MLSignal {
  modelType: 'intent_confidence';
  intentType: string;
  chaosLevel: ChaosClassification;
  suggestedConfidence: ConfidenceLevel;
}

export interface StageDropoffSignal extends MLSignal {
  modelType: 'stage_dropoff';
  stage: ConversationStage;
  dropoffRisk: 'low' | 'medium' | 'high';
  suggestedIntervention: string;
}

export interface AgentRoutingSignal extends MLSignal {
  modelType: 'agent_routing';
  currentAgent: TeamType | null;
  suggestedAgent: TeamType;
  efficiencyGain: number;  // Expected % improvement
}

// ============================================================================
// FORBIDDEN DOMAINS (IMMUTABLE)
// ============================================================================

const FORBIDDEN_DOMAINS = [
  'payment', 'pricing', 'billing', 'refund', 'compensation',
  'legal', 'terms', 'policy', 'response_generation', 'auto_action',
];

function isForbiddenDomain(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_DOMAINS.some(d => lower.includes(d));
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

interface AuditEntry {
  timestamp: number;
  action: string;
  signalId: string;
  modelType: MLModelType;
  actor: string;
  details?: Record<string, unknown>;
}

class MLAuditLog {
  private entries: AuditEntry[] = [];
  private readonly MAX_ENTRIES = 10000;

  log(action: string, signalId: string, modelType: MLModelType, actor: string, details?: Record<string, unknown>): void {
    this.entries.push({
      timestamp: Date.now(),
      action,
      signalId,
      modelType,
      actor,
      details,
    });

    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES);
    }

    // Also console log for observability
    console.log(`[ML-AUDIT] ${action} | ${modelType} | ${signalId} | ${actor}`);
  }

  getAll(): AuditEntry[] {
    return [...this.entries];
  }

  getByModel(modelType: MLModelType): AuditEntry[] {
    return this.entries.filter(e => e.modelType === modelType);
  }

  clear(): void {
    this.entries = [];
  }
}

export const mlAuditLog = new MLAuditLog();

// ============================================================================
// ML SIGNAL STORE
// ============================================================================

class MLSignalStore {
  private signals: MLSignal[] = [];

  add(signal: MLSignal): MLSignal {
    // Block forbidden domains
    const text = `${signal.explanation} ${signal.features.join(' ')}`;
    if (isForbiddenDomain(text) || isBlockedDomain(text)) {
      signal.status = 'blocked';
      signal.blockedReason = 'Touches forbidden domain (pricing/payment/legal/response)';
    }

    this.signals.push(signal);
    mlAuditLog.log('signal_created', signal.id, signal.modelType, 'system');
    return signal;
  }

  approve(id: string, approver: string): boolean {
    const signal = this.signals.find(s => s.id === id);
    if (!signal || signal.status === 'blocked') return false;

    signal.status = 'approved';
    signal.approvedBy = approver;
    signal.approvedAt = Date.now();
    mlAuditLog.log('signal_approved', id, signal.modelType, approver);
    return true;
  }

  reject(id: string, rejector: string): boolean {
    const signal = this.signals.find(s => s.id === id);
    if (!signal) return false;

    signal.status = 'rejected';
    mlAuditLog.log('signal_rejected', id, signal.modelType, rejector);
    return true;
  }

  getPending(): MLSignal[] {
    return this.signals.filter(s => s.status === 'pending');
  }

  getApproved(): MLSignal[] {
    return this.signals.filter(s => s.status === 'approved');
  }

  getByModel(modelType: MLModelType): MLSignal[] {
    return this.signals.filter(s => s.modelType === modelType);
  }

  clear(): void {
    this.signals = [];
  }
}

export const mlSignalStore = new MLSignalStore();

// ============================================================================
// ML MODELS (Lightweight Statistical)
// ============================================================================

function genId(): string {
  return `ml_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Intent Confidence Model
 *
 * Predicts confidence level based on chaos classification and historical accuracy
 */
export async function predictIntentConfidence(
  intentType: string,
  chaosLevel: ChaosClassification
): Promise<IntentConfidenceSignal> {
  const store = getActiveStore();
  const metrics = await store.getAll();

  // Filter relevant metrics
  const relevant = metrics.filter(m =>
    m.intentType === intentType && m.chaosClassification === chaosLevel
  );

  // Calculate historical accuracy
  const successful = relevant.filter(m =>
    m.outcome === 'resolved' || m.outcome === 'converted'
  ).length;
  const accuracy = relevant.length > 0 ? Math.round((successful / relevant.length) * 100) : 50;

  // Determine suggested confidence
  let suggestedConfidence: ConfidenceLevel = 'medium';
  if (accuracy >= 80) suggestedConfidence = 'high';
  else if (accuracy < 50) suggestedConfidence = 'low';

  const signal: IntentConfidenceSignal = {
    id: genId(),
    createdAt: Date.now(),
    modelType: 'intent_confidence',
    status: 'pending',
    prediction: accuracy,
    explanation: `Intent "${intentType}" with ${chaosLevel} has ${accuracy}% historical success`,
    features: ['intentType', 'chaosLevel', 'historicalOutcome'],
    isAdvisoryOnly: true,
    requiresApproval: true,
    intentType,
    chaosLevel,
    suggestedConfidence,
  };

  return mlSignalStore.add(signal) as IntentConfidenceSignal;
}

/**
 * Stage Dropoff Model
 *
 * Predicts abandonment risk at each conversation stage
 */
export async function predictStageDropoff(
  stage: ConversationStage
): Promise<StageDropoffSignal> {
  const store = getActiveStore();
  const dropoff = await store.getStageDropOff();

  const rate = dropoff[stage] || 0;

  // Determine risk level
  let dropoffRisk: 'low' | 'medium' | 'high' = 'low';
  if (rate >= 40) dropoffRisk = 'high';
  else if (rate >= 20) dropoffRisk = 'medium';

  // Suggest intervention
  let suggestedIntervention = 'No intervention needed';
  if (dropoffRisk === 'high') {
    suggestedIntervention = 'Add engagement prompt or reduce friction';
  } else if (dropoffRisk === 'medium') {
    suggestedIntervention = 'Consider progress indicator or encouragement';
  }

  const signal: StageDropoffSignal = {
    id: genId(),
    createdAt: Date.now(),
    modelType: 'stage_dropoff',
    status: 'pending',
    prediction: rate,
    explanation: `Stage "${stage}" has ${rate}% dropoff rate`,
    features: ['stage', 'historicalDropoff', 'outcomeDistribution'],
    isAdvisoryOnly: true,
    requiresApproval: true,
    stage,
    dropoffRisk,
    suggestedIntervention,
  };

  return mlSignalStore.add(signal) as StageDropoffSignal;
}

/**
 * Agent Routing Model
 *
 * Suggests optimal agent based on intent and historical performance
 */
export async function predictOptimalAgent(
  intentType: string,
  currentAgent: TeamType | null
): Promise<AgentRoutingSignal> {
  const store = getActiveStore();
  const metrics = await store.getAll();

  // Filter by intent
  const intentMetrics = metrics.filter(m => m.intentType === intentType);

  // Calculate success rate per agent
  const agentScores: Record<string, { success: number; total: number }> = {};
  intentMetrics.forEach(m => {
    const agent = m.primaryAgent || 'general';
    if (!agentScores[agent]) agentScores[agent] = { success: 0, total: 0 };
    agentScores[agent].total++;
    if (m.outcome === 'resolved' || m.outcome === 'converted') {
      agentScores[agent].success++;
    }
  });

  // Find best agent
  let bestAgent: TeamType = 'general';
  let bestRate = 0;
  let currentRate = 0;

  Object.entries(agentScores).forEach(([agent, stats]) => {
    if (stats.total >= 5) {
      const rate = Math.round((stats.success / stats.total) * 100);
      if (rate > bestRate) {
        bestRate = rate;
        bestAgent = agent as TeamType;
      }
      if (agent === currentAgent) {
        currentRate = rate;
      }
    }
  });

  const efficiencyGain = bestRate - currentRate;

  const signal: AgentRoutingSignal = {
    id: genId(),
    createdAt: Date.now(),
    modelType: 'agent_routing',
    status: 'pending',
    prediction: bestRate,
    explanation: `Agent "${bestAgent}" has ${bestRate}% success for "${intentType}" (current: ${currentRate}%)`,
    features: ['intentType', 'agentPerformance', 'outcomeRate'],
    isAdvisoryOnly: true,
    requiresApproval: true,
    currentAgent,
    suggestedAgent: bestAgent,
    efficiencyGain,
  };

  return mlSignalStore.add(signal) as AgentRoutingSignal;
}

// ============================================================================
// BATCH ANALYSIS
// ============================================================================

export interface MLAnalysisReport {
  generatedAt: number;
  totalSignals: number;
  pendingApproval: number;

  intentConfidence: IntentConfidenceSignal[];
  stageDropoff: StageDropoffSignal[];
  agentRouting: AgentRoutingSignal[];

  blockedCount: number;
  auditEntries: number;
}

/**
 * Run full ML analysis (batch)
 *
 * GOVERNANCE: All signals are advisory only
 */
export async function runMLAnalysis(): Promise<MLAnalysisReport> {
  mlAuditLog.log('analysis_started', 'batch', 'intent_confidence', 'system');

  const store = getActiveStore();
  const metrics = await store.getAll();

  if (metrics.length < 50) {
    mlAuditLog.log('analysis_skipped', 'batch', 'intent_confidence', 'system', {
      reason: 'Insufficient data',
      count: metrics.length,
    });
    return {
      generatedAt: Date.now(),
      totalSignals: 0,
      pendingApproval: 0,
      intentConfidence: [],
      stageDropoff: [],
      agentRouting: [],
      blockedCount: 0,
      auditEntries: mlAuditLog.getAll().length,
    };
  }

  // Collect unique intents and stages
  const intents = new Set<string>();
  const chaosLevels = new Set<ChaosClassification>();
  const stages = new Set<ConversationStage>();

  metrics.forEach(m => {
    intents.add(m.intentType);
    chaosLevels.add(m.chaosClassification);
    stages.add(m.conversationStage);
  });

  // Generate signals
  const intentSignals: IntentConfidenceSignal[] = [];
  const stageSignals: StageDropoffSignal[] = [];
  const agentSignals: AgentRoutingSignal[] = [];

  // Intent confidence for top intents
  for (const intent of Array.from(intents).slice(0, 5)) {
    for (const chaos of chaosLevels) {
      const signal = await predictIntentConfidence(intent, chaos);
      intentSignals.push(signal);
    }
  }

  // Stage dropoff for all stages
  for (const stage of stages) {
    const signal = await predictStageDropoff(stage);
    stageSignals.push(signal);
  }

  // Agent routing for top intents
  for (const intent of Array.from(intents).slice(0, 5)) {
    const signal = await predictOptimalAgent(intent, null);
    agentSignals.push(signal);
  }

  const allSignals = [...intentSignals, ...stageSignals, ...agentSignals];
  const blocked = allSignals.filter(s => s.status === 'blocked').length;

  mlAuditLog.log('analysis_completed', 'batch', 'intent_confidence', 'system', {
    totalSignals: allSignals.length,
    blocked,
  });

  return {
    generatedAt: Date.now(),
    totalSignals: allSignals.length,
    pendingApproval: allSignals.filter(s => s.status === 'pending').length,
    intentConfidence: intentSignals,
    stageDropoff: stageSignals,
    agentRouting: agentSignals,
    blockedCount: blocked,
    auditEntries: mlAuditLog.getAll().length,
  };
}

/**
 * Get approved signals for a model type
 */
export function getApprovedSignals(modelType: MLModelType): MLSignal[] {
  return mlSignalStore.getApproved().filter(s => s.modelType === modelType);
}

/**
 * Check if ML is safe to apply (never for forbidden domains)
 */
export function isMLSafeForDomain(domain: string): boolean {
  return !isForbiddenDomain(domain) && !isBlockedDomain(domain);
}
