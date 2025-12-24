/**
 * Stage Analytics
 *
 * Track stage-level metrics for conversion optimization.
 * NO PII, only aggregate stage data.
 */

import type { ConversationStage } from '../reasoning-layer';

// ============================================================================
// TYPES
// ============================================================================

export interface StageMetric {
  sessionHash: string;
  stage: ConversationStage;
  enteredAt: number;
  exitedAt?: number;
  exitedTo?: ConversationStage;
  timeSpentMs?: number;
  wasDropOff: boolean;
  hadConsent: boolean;
}

export interface StageAnalytics {
  stage: ConversationStage;
  totalEntered: number;
  totalExited: number;
  totalDropOff: number;
  avgTimeSpentMs: number;
  conversionRate: number;  // % that moved to next stage
  dropOffRate: number;     // % that abandoned
}

export interface FunnelMetrics {
  stages: StageAnalytics[];
  overallConversionRate: number;  // DISCOVERY → READY_TO_BOOK
  avgTotalTimeMs: number;
  bottleneckStage: ConversationStage | null;
}

// ============================================================================
// ANALYTICS STORE (Production: Redis/TimescaleDB)
// ============================================================================

class StageMetricsStore {
  private metrics: StageMetric[] = [];
  private activeStages: Map<string, StageMetric> = new Map();

  /**
   * Hash session ID for privacy
   */
  private hashSession(sessionId: string): string {
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      const char = sessionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `sa_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Record stage entry
   */
  enterStage(sessionId: string, stage: ConversationStage, hadConsent: boolean = false): void {
    const sessionHash = this.hashSession(sessionId);

    // Close previous stage if exists
    const previous = this.activeStages.get(sessionHash);
    if (previous && !previous.exitedAt) {
      previous.exitedAt = Date.now();
      previous.exitedTo = stage;
      previous.timeSpentMs = previous.exitedAt - previous.enteredAt;
      previous.wasDropOff = false;
      this.metrics.push(previous);
    }

    // Start new stage
    const metric: StageMetric = {
      sessionHash,
      stage,
      enteredAt: Date.now(),
      wasDropOff: false,
      hadConsent,
    };
    this.activeStages.set(sessionHash, metric);
  }

  /**
   * Record stage exit (transition to next stage)
   */
  exitStage(sessionId: string, toStage: ConversationStage): void {
    const sessionHash = this.hashSession(sessionId);
    const current = this.activeStages.get(sessionHash);

    if (current && !current.exitedAt) {
      current.exitedAt = Date.now();
      current.exitedTo = toStage;
      current.timeSpentMs = current.exitedAt - current.enteredAt;
      current.wasDropOff = false;
      this.metrics.push(current);

      // Start tracking new stage
      this.enterStage(sessionId, toStage);
    }
  }

  /**
   * Record drop-off (user abandoned)
   */
  recordDropOff(sessionId: string): void {
    const sessionHash = this.hashSession(sessionId);
    const current = this.activeStages.get(sessionHash);

    if (current && !current.exitedAt) {
      current.exitedAt = Date.now();
      current.timeSpentMs = current.exitedAt - current.enteredAt;
      current.wasDropOff = true;
      this.metrics.push(current);
      this.activeStages.delete(sessionHash);
    }
  }

  /**
   * Get all metrics
   */
  getAll(): StageMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear store (for testing)
   */
  clear(): void {
    this.metrics = [];
    this.activeStages.clear();
  }
}

export const stageMetricsStore = new StageMetricsStore();

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Get analytics for a specific stage
 */
export function getStageAnalytics(stage: ConversationStage): StageAnalytics {
  const metrics = stageMetricsStore.getAll().filter(m => m.stage === stage);

  if (metrics.length === 0) {
    return {
      stage,
      totalEntered: 0,
      totalExited: 0,
      totalDropOff: 0,
      avgTimeSpentMs: 0,
      conversionRate: 0,
      dropOffRate: 0,
    };
  }

  const totalEntered = metrics.length;
  const exited = metrics.filter(m => m.exitedTo && !m.wasDropOff);
  const totalExited = exited.length;
  const dropOffs = metrics.filter(m => m.wasDropOff);
  const totalDropOff = dropOffs.length;

  const timesSpent = metrics
    .filter(m => m.timeSpentMs !== undefined)
    .map(m => m.timeSpentMs!);
  const avgTimeSpentMs = timesSpent.length > 0
    ? timesSpent.reduce((a, b) => a + b, 0) / timesSpent.length
    : 0;

  return {
    stage,
    totalEntered,
    totalExited,
    totalDropOff,
    avgTimeSpentMs: Math.round(avgTimeSpentMs),
    conversionRate: totalEntered > 0 ? Math.round((totalExited / totalEntered) * 100) : 0,
    dropOffRate: totalEntered > 0 ? Math.round((totalDropOff / totalEntered) * 100) : 0,
  };
}

/**
 * Get full funnel metrics
 */
export function getFunnelMetrics(): FunnelMetrics {
  const stages: ConversationStage[] = [
    'DISCOVERY',
    'NARROWING',
    'READY_TO_SEARCH',
    'READY_TO_BOOK',
    'POST_BOOKING',
  ];

  const stageAnalytics = stages.map(getStageAnalytics);

  // Calculate overall conversion (DISCOVERY → READY_TO_BOOK)
  const discoveryEntered = stageAnalytics.find(s => s.stage === 'DISCOVERY')?.totalEntered || 0;
  const bookingReached = stageAnalytics.find(s => s.stage === 'READY_TO_BOOK')?.totalEntered || 0;
  const overallConversionRate = discoveryEntered > 0
    ? Math.round((bookingReached / discoveryEntered) * 100)
    : 0;

  // Calculate average total time
  const allMetrics = stageMetricsStore.getAll();
  const sessionTimes = new Map<string, number>();
  allMetrics.forEach(m => {
    if (m.timeSpentMs) {
      const current = sessionTimes.get(m.sessionHash) || 0;
      sessionTimes.set(m.sessionHash, current + m.timeSpentMs);
    }
  });
  const times = Array.from(sessionTimes.values());
  const avgTotalTimeMs = times.length > 0
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : 0;

  // Find bottleneck (highest drop-off rate)
  let bottleneckStage: ConversationStage | null = null;
  let maxDropOff = 0;
  stageAnalytics.forEach(s => {
    if (s.dropOffRate > maxDropOff && s.totalEntered >= 10) {
      maxDropOff = s.dropOffRate;
      bottleneckStage = s.stage;
    }
  });

  return {
    stages: stageAnalytics,
    overallConversionRate,
    avgTotalTimeMs,
    bottleneckStage,
  };
}

/**
 * Get stage-to-stage conversion rates
 */
export function getStageTransitionRates(): Record<string, number> {
  const metrics = stageMetricsStore.getAll();
  const transitions = new Map<string, { converted: number; total: number }>();

  metrics.forEach(m => {
    if (m.exitedTo) {
      const key = `${m.stage}_to_${m.exitedTo}`;
      const current = transitions.get(key) || { converted: 0, total: 0 };
      current.total++;
      if (!m.wasDropOff) current.converted++;
      transitions.set(key, current);
    }
  });

  const rates: Record<string, number> = {};
  transitions.forEach((value, key) => {
    rates[key] = value.total > 0
      ? Math.round((value.converted / value.total) * 100)
      : 0;
  });

  return rates;
}

/**
 * Log funnel summary (for admin dashboard)
 */
export function logFunnelSummary(): void {
  const funnel = getFunnelMetrics();

  console.log('\n========== CONVERSION FUNNEL ==========');
  console.log(`Overall Conversion: ${funnel.overallConversionRate}%`);
  console.log(`Avg Session Time: ${Math.round(funnel.avgTotalTimeMs / 1000)}s`);
  if (funnel.bottleneckStage) {
    console.log(`Bottleneck Stage: ${funnel.bottleneckStage}`);
  }
  console.log('\nBy Stage:');
  funnel.stages.forEach(s => {
    console.log(`  ${s.stage}: ${s.conversionRate}% conv, ${s.dropOffRate}% drop, ${Math.round(s.avgTimeSpentMs / 1000)}s avg`);
  });
  console.log('========================================\n');
}

// ============================================================================
// TRACKING HOOKS
// ============================================================================

/**
 * Hook: Track stage transition (call from stage engine)
 */
export function trackStageTransition(
  sessionId: string,
  fromStage: ConversationStage,
  toStage: ConversationStage,
  hadConsent: boolean
): void {
  stageMetricsStore.exitStage(sessionId, toStage);

  // Log for monitoring
  console.log(`[STAGE-ANALYTICS] ${sessionId.substring(0, 8)}... ${fromStage} → ${toStage} (consent: ${hadConsent})`);
}

/**
 * Hook: Track new session start
 */
export function trackSessionStart(sessionId: string): void {
  stageMetricsStore.enterStage(sessionId, 'DISCOVERY', false);
}

/**
 * Hook: Track session drop-off
 */
export function trackSessionDropOff(sessionId: string): void {
  stageMetricsStore.recordDropOff(sessionId);
  console.log(`[STAGE-ANALYTICS] ${sessionId.substring(0, 8)}... dropped off`);
}
