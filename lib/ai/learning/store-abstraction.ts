/**
 * Pluggable Learning Store Abstraction
 *
 * Supports: InMemory → Redis → Database
 * Features: Time-bucketed aggregation, no per-user tracking
 */

import type { InteractionMetric, InteractionOutcome, ResponsePattern } from './interaction-tracker';
import type { ConversationStage } from '../reasoning-layer';
import type { TeamType } from '../consultant-handoff';

// ============================================================================
// TYPES
// ============================================================================

export type TimeBucket = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface AggregatedMetrics {
  bucket: string;  // e.g., "2024-12-23" for daily
  bucketType: TimeBucket;
  totalInteractions: number;
  outcomes: Record<InteractionOutcome, number>;
  stages: Record<ConversationStage, number>;
  agents: Record<string, number>;
  patterns: Record<ResponsePattern, number>;
  avgSuccessScore: number;
  dropOffRate: number;
  conversionRate: number;
}

export interface StoreConfig {
  type: 'memory' | 'redis' | 'database';
  maxMetrics?: number;
  aggregationInterval?: TimeBucket;
  retentionDays?: number;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

export interface ILearningStore {
  // Core operations
  add(metric: InteractionMetric): Promise<void>;
  getAll(): Promise<InteractionMetric[]>;
  getByTimeRange(start: number, end: number): Promise<InteractionMetric[]>;
  clear(): Promise<void>;

  // Aggregations
  getAggregated(bucket: TimeBucket, limit?: number): Promise<AggregatedMetrics[]>;
  getStageDropOff(): Promise<Record<string, number>>;
  getPatternPerformance(): Promise<Record<ResponsePattern, { success: number; total: number }>>;

  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

// ============================================================================
// IN-MEMORY STORE (Default)
// ============================================================================

export class InMemoryLearningStore implements ILearningStore {
  private metrics: InteractionMetric[] = [];
  private aggregations: Map<string, AggregatedMetrics> = new Map();
  private readonly maxMetrics: number;

  constructor(config?: Partial<StoreConfig>) {
    this.maxMetrics = config?.maxMetrics || 10000;
  }

  async connect(): Promise<void> { /* No-op for memory */ }
  async disconnect(): Promise<void> { /* No-op for memory */ }

  async add(metric: InteractionMetric): Promise<void> {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    this.updateAggregation(metric);
  }

  async getAll(): Promise<InteractionMetric[]> {
    return [...this.metrics];
  }

  async getByTimeRange(start: number, end: number): Promise<InteractionMetric[]> {
    return this.metrics.filter(m => m.timestamp >= start && m.timestamp <= end);
  }

  async clear(): Promise<void> {
    this.metrics = [];
    this.aggregations.clear();
  }

  async getAggregated(bucket: TimeBucket, limit = 30): Promise<AggregatedMetrics[]> {
    const filtered = Array.from(this.aggregations.values())
      .filter(a => a.bucketType === bucket)
      .sort((a, b) => b.bucket.localeCompare(a.bucket));
    return filtered.slice(0, limit);
  }

  async getStageDropOff(): Promise<Record<string, number>> {
    const stageCounts: Record<string, { entered: number; exited: number }> = {};
    const stages: ConversationStage[] = ['DISCOVERY', 'NARROWING', 'READY_TO_SEARCH', 'READY_TO_BOOK', 'POST_BOOKING'];

    stages.forEach(s => { stageCounts[s] = { entered: 0, exited: 0 }; });

    this.metrics.forEach(m => {
      stageCounts[m.conversationStage].entered++;
      if (m.outcome !== 'abandoned') {
        stageCounts[m.conversationStage].exited++;
      }
    });

    const dropOff: Record<string, number> = {};
    stages.forEach(s => {
      const { entered, exited } = stageCounts[s];
      dropOff[s] = entered > 0 ? Math.round(((entered - exited) / entered) * 100) : 0;
    });

    return dropOff;
  }

  async getPatternPerformance(): Promise<Record<ResponsePattern, { success: number; total: number }>> {
    const perf: Record<string, { success: number; total: number }> = {};

    this.metrics.forEach(m => {
      if (!perf[m.responsePattern]) {
        perf[m.responsePattern] = { success: 0, total: 0 };
      }
      perf[m.responsePattern].total++;
      if (m.outcome === 'resolved' || m.outcome === 'converted') {
        perf[m.responsePattern].success++;
      }
    });

    return perf as Record<ResponsePattern, { success: number; total: number }>;
  }

  private updateAggregation(metric: InteractionMetric): void {
    const bucketKey = this.getBucketKey(metric.timestamp, 'daily');
    let agg = this.aggregations.get(bucketKey);

    if (!agg) {
      agg = this.createEmptyAggregation(bucketKey, 'daily');
      this.aggregations.set(bucketKey, agg);
    }

    agg.totalInteractions++;
    agg.outcomes[metric.outcome] = (agg.outcomes[metric.outcome] || 0) + 1;
    agg.stages[metric.conversationStage] = (agg.stages[metric.conversationStage] || 0) + 1;
    if (metric.primaryAgent) {
      agg.agents[metric.primaryAgent] = (agg.agents[metric.primaryAgent] || 0) + 1;
    }
    agg.patterns[metric.responsePattern] = (agg.patterns[metric.responsePattern] || 0) + 1;

    // Update rates
    const total = agg.totalInteractions;
    agg.avgSuccessScore = ((agg.avgSuccessScore * (total - 1)) + metric.successScore) / total;
    agg.dropOffRate = Math.round((agg.outcomes.abandoned || 0) / total * 100);
    agg.conversionRate = Math.round((agg.outcomes.converted || 0) / total * 100);
  }

  private getBucketKey(timestamp: number, bucket: TimeBucket): string {
    const date = new Date(timestamp);
    switch (bucket) {
      case 'hourly': return `${date.toISOString().slice(0, 13)}:00`;
      case 'daily': return date.toISOString().slice(0, 10);
      case 'weekly': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `W${weekStart.toISOString().slice(0, 10)}`;
      }
      case 'monthly': return date.toISOString().slice(0, 7);
    }
  }

  private createEmptyAggregation(bucket: string, bucketType: TimeBucket): AggregatedMetrics {
    return {
      bucket,
      bucketType,
      totalInteractions: 0,
      outcomes: {} as Record<InteractionOutcome, number>,
      stages: {} as Record<ConversationStage, number>,
      agents: {},
      patterns: {} as Record<ResponsePattern, number>,
      avgSuccessScore: 0,
      dropOffRate: 0,
      conversionRate: 0,
    };
  }
}

// ============================================================================
// STORE FACTORY
// ============================================================================

let activeStore: ILearningStore | null = null;

export function createLearningStore(config: StoreConfig): ILearningStore {
  switch (config.type) {
    case 'memory':
      return new InMemoryLearningStore(config);
    case 'redis':
      // Future: return new RedisLearningStore(config);
      console.log('[STORE] Redis not implemented, using memory');
      return new InMemoryLearningStore(config);
    case 'database':
      // Future: return new DatabaseLearningStore(config);
      console.log('[STORE] Database not implemented, using memory');
      return new InMemoryLearningStore(config);
    default:
      return new InMemoryLearningStore(config);
  }
}

export function getActiveStore(): ILearningStore {
  if (!activeStore) {
    activeStore = createLearningStore({ type: 'memory' });
  }
  return activeStore;
}

export function setActiveStore(store: ILearningStore): void {
  activeStore = store;
}
