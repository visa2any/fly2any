/**
 * Safe Recommendation Engine
 *
 * GOVERNANCE: NO auto-action, reports only, manual approval required
 * BLOCKED domains: payments, legal, pricing
 */

import type { ResponsePattern, InteractionOutcome } from './interaction-tracker';
import type { ConversationStage, ChaosClassification } from '../reasoning-layer';
import { getActiveStore } from './store-abstraction';

// ============================================================================
// TYPES
// ============================================================================

export type RecommendationType =
  | 'pattern_improvement'
  | 'stage_optimization'
  | 'agent_reallocation'
  | 'flow_enhancement';

export type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface Recommendation {
  id: string;
  createdAt: number;
  type: RecommendationType;
  status: RecommendationStatus;

  // Context
  targetPattern?: ResponsePattern;
  targetStage?: ConversationStage;
  targetChaos?: ChaosClassification;

  // Insight
  finding: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number; // 0-100

  // Evidence
  sampleSize: number;
  successDelta: number; // % improvement expected

  // Governance
  blockedReason?: string;
  approvedBy?: string;
  approvedAt?: number;
}

export interface DashboardReport {
  generatedAt: number;
  period: string;

  // Top metrics
  topFailedIntents: Array<{ intent: string; failureRate: number; count: number }>;
  topSuccessfulFlows: Array<{ agent: string; stage: string; successRate: number }>;
  stageDropOffHeatmap: Record<string, number>;
  avgTurnsPerResolved: number;

  // Patterns
  weakPatterns: Array<{ pattern: ResponsePattern; successRate: number }>;
  strongPatterns: Array<{ pattern: ResponsePattern; successRate: number }>;

  // Recommendations
  pendingRecommendations: Recommendation[];
}

// ============================================================================
// GOVERNANCE GUARDRAILS
// ============================================================================

const BLOCKED_DOMAINS = ['payment', 'billing', 'legal', 'pricing', 'refund', 'compensation'];
const GOVERNANCE_ENABLED = true;

export function isBlockedDomain(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_DOMAINS.some(d => lower.includes(d));
}

function blockIfSensitive(rec: Recommendation): Recommendation {
  const text = `${rec.finding} ${rec.suggestion}`.toLowerCase();
  if (isBlockedDomain(text)) {
    return {
      ...rec,
      status: 'blocked',
      blockedReason: 'Touches sensitive domain (payment/legal/pricing). Manual review required.',
    };
  }
  return rec;
}

// ============================================================================
// RECOMMENDATION STORE
// ============================================================================

class RecommendationStore {
  private recommendations: Recommendation[] = [];
  private auditLog: Array<{ action: string; recId: string; by: string; at: number }> = [];

  add(rec: Recommendation): void {
    const checked = blockIfSensitive(rec);
    this.recommendations.push(checked);
    this.log('created', rec.id, 'system');
  }

  approve(id: string, approver: string): boolean {
    const rec = this.recommendations.find(r => r.id === id);
    if (!rec || rec.status === 'blocked') return false;

    rec.status = 'approved';
    rec.approvedBy = approver;
    rec.approvedAt = Date.now();
    this.log('approved', id, approver);
    return true;
  }

  reject(id: string, rejector: string): boolean {
    const rec = this.recommendations.find(r => r.id === id);
    if (!rec) return false;

    rec.status = 'rejected';
    this.log('rejected', id, rejector);
    return true;
  }

  getPending(): Recommendation[] {
    return this.recommendations.filter(r => r.status === 'pending');
  }

  getAll(): Recommendation[] {
    return [...this.recommendations];
  }

  getAuditLog(): typeof this.auditLog {
    return [...this.auditLog];
  }

  private log(action: string, recId: string, by: string): void {
    this.auditLog.push({ action, recId, by, at: Date.now() });
  }

  clear(): void {
    this.recommendations = [];
  }
}

export const recommendationStore = new RecommendationStore();

// ============================================================================
// RECOMMENDATION GENERATOR
// ============================================================================

function genId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function generateRecommendations(): Promise<Recommendation[]> {
  if (!GOVERNANCE_ENABLED) {
    console.log('[REC-ENGINE] Governance disabled, skipping');
    return [];
  }

  const store = getActiveStore();
  const metrics = await store.getAll();
  if (metrics.length < 50) return []; // Need minimum data

  const recs: Recommendation[] = [];
  const patternPerf = await store.getPatternPerformance();
  const dropOff = await store.getStageDropOff();

  // 1. Detect weak patterns
  Object.entries(patternPerf).forEach(([pattern, stats]) => {
    if (stats.total >= 20) {
      const rate = Math.round((stats.success / stats.total) * 100);
      if (rate < 40) {
        recs.push({
          id: genId(),
          createdAt: Date.now(),
          type: 'pattern_improvement',
          status: 'pending',
          targetPattern: pattern as ResponsePattern,
          finding: `Pattern "${pattern}" has ${rate}% success rate`,
          suggestion: `Consider replacing with consultative or inspirational approach`,
          impact: rate < 25 ? 'high' : 'medium',
          confidence: Math.min(95, 50 + stats.total),
          sampleSize: stats.total,
          successDelta: 15,
        });
      }
    }
  });

  // 2. Detect high drop-off stages
  Object.entries(dropOff).forEach(([stage, rate]) => {
    if (rate > 30) {
      recs.push({
        id: genId(),
        createdAt: Date.now(),
        type: 'stage_optimization',
        status: 'pending',
        targetStage: stage as ConversationStage,
        finding: `Stage "${stage}" has ${rate}% drop-off rate`,
        suggestion: `Add more engagement or reduce friction in transition`,
        impact: rate > 50 ? 'high' : 'medium',
        confidence: 75,
        sampleSize: metrics.filter(m => m.conversationStage === stage).length,
        successDelta: 10,
      });
    }
  });

  // 3. Detect chaos-pattern mismatches
  const chaosCounts: Record<string, Record<string, { success: number; total: number }>> = {};
  metrics.forEach(m => {
    const chaos = m.chaosClassification;
    const pattern = m.responsePattern;
    if (!chaosCounts[chaos]) chaosCounts[chaos] = {};
    if (!chaosCounts[chaos][pattern]) chaosCounts[chaos][pattern] = { success: 0, total: 0 };
    chaosCounts[chaos][pattern].total++;
    if (m.outcome === 'resolved' || m.outcome === 'converted') {
      chaosCounts[chaos][pattern].success++;
    }
  });

  Object.entries(chaosCounts).forEach(([chaos, patterns]) => {
    const sorted = Object.entries(patterns)
      .filter(([_, s]) => s.total >= 10)
      .map(([p, s]) => ({ pattern: p, rate: Math.round((s.success / s.total) * 100), total: s.total }))
      .sort((a, b) => b.rate - a.rate);

    if (sorted.length >= 2 && sorted[0].rate - sorted[sorted.length - 1].rate > 20) {
      recs.push({
        id: genId(),
        createdAt: Date.now(),
        type: 'pattern_improvement',
        status: 'pending',
        targetChaos: chaos as ChaosClassification,
        targetPattern: sorted[sorted.length - 1].pattern as ResponsePattern,
        finding: `For ${chaos}: "${sorted[0].pattern}" outperforms "${sorted[sorted.length - 1].pattern}" by ${sorted[0].rate - sorted[sorted.length - 1].rate}%`,
        suggestion: `Use "${sorted[0].pattern}" pattern for ${chaos} scenarios`,
        impact: 'medium',
        confidence: 80,
        sampleSize: sorted[0].total + sorted[sorted.length - 1].total,
        successDelta: sorted[0].rate - sorted[sorted.length - 1].rate,
      });
    }
  });

  // Store and return
  recs.forEach(r => recommendationStore.add(r));
  return recs;
}

// ============================================================================
// DASHBOARD GENERATOR
// ============================================================================

export async function generateDashboard(periodDays = 7): Promise<DashboardReport> {
  const store = getActiveStore();
  const now = Date.now();
  const start = now - (periodDays * 24 * 60 * 60 * 1000);
  const metrics = await store.getByTimeRange(start, now);

  // Top failed intents
  const intentStats: Record<string, { failed: number; total: number }> = {};
  metrics.forEach(m => {
    if (!intentStats[m.intentType]) intentStats[m.intentType] = { failed: 0, total: 0 };
    intentStats[m.intentType].total++;
    if (m.outcome === 'abandoned' || m.outcome === 'escalated') {
      intentStats[m.intentType].failed++;
    }
  });
  const topFailedIntents = Object.entries(intentStats)
    .map(([intent, s]) => ({ intent, failureRate: Math.round((s.failed / s.total) * 100), count: s.total }))
    .filter(i => i.count >= 5)
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, 5);

  // Top successful flows
  const flowStats: Record<string, { success: number; total: number }> = {};
  metrics.forEach(m => {
    const key = `${m.primaryAgent || 'unknown'}|${m.conversationStage}`;
    if (!flowStats[key]) flowStats[key] = { success: 0, total: 0 };
    flowStats[key].total++;
    if (m.outcome === 'resolved' || m.outcome === 'converted') {
      flowStats[key].success++;
    }
  });
  const topSuccessfulFlows = Object.entries(flowStats)
    .map(([key, s]) => {
      const [agent, stage] = key.split('|');
      return { agent, stage, successRate: Math.round((s.success / s.total) * 100) };
    })
    .filter(f => flowStats[`${f.agent}|${f.stage}`].total >= 5)
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5);

  // Stage drop-off
  const stageDropOffHeatmap = await store.getStageDropOff();

  // Avg turns per resolved
  const resolved = metrics.filter(m => m.outcome === 'resolved' || m.outcome === 'converted');
  const avgTurnsPerResolved = resolved.length > 0
    ? Math.round(resolved.reduce((sum, m) => sum + m.clarifyingQuestionsAsked + 1, 0) / resolved.length * 10) / 10
    : 0;

  // Pattern analysis
  const patternPerf = await store.getPatternPerformance();
  const patternList = Object.entries(patternPerf)
    .filter(([_, s]) => s.total >= 5)
    .map(([p, s]) => ({ pattern: p as ResponsePattern, successRate: Math.round((s.success / s.total) * 100) }));

  const weakPatterns = patternList.filter(p => p.successRate < 50).sort((a, b) => a.successRate - b.successRate);
  const strongPatterns = patternList.filter(p => p.successRate >= 70).sort((a, b) => b.successRate - a.successRate);

  return {
    generatedAt: now,
    period: `Last ${periodDays} days`,
    topFailedIntents,
    topSuccessfulFlows,
    stageDropOffHeatmap,
    avgTurnsPerResolved,
    weakPatterns,
    strongPatterns,
    pendingRecommendations: recommendationStore.getPending(),
  };
}

export function logDashboard(report: DashboardReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('LEARNING DASHBOARD - ' + report.period);
  console.log('='.repeat(60));

  console.log('\n📉 TOP FAILED INTENTS:');
  report.topFailedIntents.forEach(i => console.log(`  ${i.intent}: ${i.failureRate}% fail (n=${i.count})`));

  console.log('\n📈 TOP SUCCESSFUL FLOWS:');
  report.topSuccessfulFlows.forEach(f => console.log(`  ${f.agent} @ ${f.stage}: ${f.successRate}%`));

  console.log('\n🔥 STAGE DROP-OFF HEATMAP:');
  Object.entries(report.stageDropOffHeatmap).forEach(([s, r]) => {
    const bar = '█'.repeat(Math.round(r / 5));
    console.log(`  ${s}: ${bar} ${r}%`);
  });

  console.log(`\n💬 AVG TURNS PER RESOLVED: ${report.avgTurnsPerResolved}`);

  if (report.weakPatterns.length) {
    console.log('\n⚠️ WEAK PATTERNS:');
    report.weakPatterns.forEach(p => console.log(`  ${p.pattern}: ${p.successRate}%`));
  }

  if (report.pendingRecommendations.length) {
    console.log('\n📋 PENDING RECOMMENDATIONS:');
    report.pendingRecommendations.forEach(r => console.log(`  [${r.id}] ${r.finding}`));
  }

  console.log('\n' + '='.repeat(60) + '\n');
}
