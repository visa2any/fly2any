/**
 * Pluggable Learning Store Abstraction
 *
 * MIGRATION NOTE (2024-12-24):
 * - Redis is now the default production store
 * - InMemory retained for tests and local dev
 * - Time-bucketed keys: learn:metrics:{bucket}:{timestamp}
 * - NO PII stored (metrics are pre-sanitized)
 * - Blocked domains enforced at recommendation layer
 *
 * Supports: InMemory → Redis → Database
 * Features: Time-bucketed aggregation, no per-user tracking
 */

import type { InteractionMetric, InteractionOutcome, ResponsePattern } from './interaction-tracker';
import type { ConversationStage } from '../reasoning-layer';

// Lazy Redis import to avoid Jest ESM issues
let redisModule: typeof import('../../cache/redis') | null = null;

async function getRedisModule() {
  if (!redisModule && typeof window === 'undefined') {
    try {
      redisModule = await import('../../cache/redis');
    } catch {
      redisModule = null;
    }
  }
  return redisModule;
}

function getRedisModuleSync() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../../cache/redis');
  } catch {
    return null;
  }
}

// ============================================================================
// TYPES
// ============================================================================

export type TimeBucket = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface AggregatedMetrics {
  bucket: string;
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
  redisPrefix?: string;
}

export interface StoreHealth {
  connected: boolean;
  type: string;
  latencyMs?: number;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

export interface ILearningStore {
  add(metric: InteractionMetric): Promise<void>;
  getAll(): Promise<InteractionMetric[]>;
  getByTimeRange(start: number, end: number): Promise<InteractionMetric[]>;
  clear(): Promise<void>;
  getAggregated(bucket: TimeBucket, limit?: number): Promise<AggregatedMetrics[]>;
  getStageDropOff(): Promise<Record<string, number>>;
  getPatternPerformance(): Promise<Record<ResponsePattern, { success: number; total: number }>>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<StoreHealth>;
}

// ============================================================================
// REDIS KEYS (Time-bucketed, NO PII)
// ============================================================================

const REDIS_KEYS = {
  metrics: (bucket: string) => `learn:metrics:${bucket}`,
  aggregation: (bucket: string) => `learn:agg:${bucket}`,
  dropOff: 'learn:dropoff',
  patterns: 'learn:patterns',
  health: 'learn:health',
};

// ============================================================================
// REDIS STORE (Production)
// ============================================================================

export class RedisLearningStore implements ILearningStore {
  private readonly maxMetrics: number;
  private readonly retentionDays: number;
  private connected = false;

  constructor(config?: Partial<StoreConfig>) {
    this.maxMetrics = config?.maxMetrics || 10000;
    this.retentionDays = config?.retentionDays || 30;
  }

  private async getRedis() {
    const mod = await getRedisModule();
    return mod?.getRedisClient?.() || null;
  }

  private async checkHealth() {
    const mod = await getRedisModule();
    return mod?.checkRedisHealth?.() || false;
  }

  async connect(): Promise<void> {
    const healthy = await this.checkHealth();
    this.connected = healthy;
    if (healthy) {
      console.log('[REDIS-STORE] Connected successfully');
    } else {
      console.warn('[REDIS-STORE] Connection failed, operations will fail gracefully');
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async healthCheck(): Promise<StoreHealth> {
    const start = Date.now();
    const connected = await this.checkHealth();
    return {
      connected,
      type: 'redis',
      latencyMs: Date.now() - start,
    };
  }

  async add(metric: InteractionMetric): Promise<void> {
    const redis = await this.getRedis();
    if (!redis) return;

    try {
      const bucket = this.getBucketKey(metric.timestamp, 'daily');
      const key = REDIS_KEYS.metrics(bucket);

      // Store metric (NO PII - metric is pre-sanitized)
      await redis.lpush(key, JSON.stringify(metric));
      await redis.ltrim(key, 0, this.maxMetrics - 1);

      // Set TTL for auto-cleanup
      const ttlSeconds = this.retentionDays * 24 * 60 * 60;
      await redis.expire(key, ttlSeconds);

      // Update aggregations
      await this.updateAggregation(metric);
    } catch (error) {
      console.error('[REDIS-STORE] Add failed:', error);
    }
  }

  async getAll(): Promise<InteractionMetric[]> {
    const redis = await this.getRedis();
    if (!redis) return [];

    try {
      const buckets = this.getRecentBuckets(7, 'daily');
      const allMetrics: InteractionMetric[] = [];

      for (const bucket of buckets) {
        const key = REDIS_KEYS.metrics(bucket);
        const data = await redis.lrange(key, 0, -1);
        if (data) {
          const metrics = data.map((d: string | object) => typeof d === 'string' ? JSON.parse(d) : d);
          allMetrics.push(...metrics);
        }
      }

      return allMetrics;
    } catch (error) {
      console.error('[REDIS-STORE] GetAll failed:', error);
      return [];
    }
  }

  async getByTimeRange(start: number, end: number): Promise<InteractionMetric[]> {
    const all = await this.getAll();
    return all.filter(m => m.timestamp >= start && m.timestamp <= end);
  }

  async clear(): Promise<void> {
    const redis = await this.getRedis();
    if (!redis) return;

    try {
      const buckets = this.getRecentBuckets(this.retentionDays, 'daily');
      for (const bucket of buckets) {
        await redis.del(REDIS_KEYS.metrics(bucket));
        await redis.del(REDIS_KEYS.aggregation(bucket));
      }
      await redis.del(REDIS_KEYS.dropOff);
      await redis.del(REDIS_KEYS.patterns);
    } catch (error) {
      console.error('[REDIS-STORE] Clear failed:', error);
    }
  }

  async getAggregated(bucket: TimeBucket, limit = 30): Promise<AggregatedMetrics[]> {
    const redis = await this.getRedis();
    if (!redis) return [];

    try {
      const buckets = this.getRecentBuckets(limit, bucket);
      const results: AggregatedMetrics[] = [];

      for (const b of buckets) {
        const key = REDIS_KEYS.aggregation(b);
        const data = await redis.get(key);
        if (data) {
          results.push(typeof data === 'string' ? JSON.parse(data) : data);
        }
      }

      return results.sort((a, b) => b.bucket.localeCompare(a.bucket));
    } catch (error) {
      console.error('[REDIS-STORE] GetAggregated failed:', error);
      return [];
    }
  }

  async getStageDropOff(): Promise<Record<string, number>> {
    const redis = await this.getRedis();
    if (!redis) return {};

    try {
      const data = await redis.get(REDIS_KEYS.dropOff);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : {};
    } catch {
      return {};
    }
  }

  async getPatternPerformance(): Promise<Record<ResponsePattern, { success: number; total: number }>> {
    const redis = await this.getRedis();
    if (!redis) return {} as Record<ResponsePattern, { success: number; total: number }>;

    try {
      const data = await redis.get(REDIS_KEYS.patterns);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : {};
    } catch {
      return {} as Record<ResponsePattern, { success: number; total: number }>;
    }
  }

  private async updateAggregation(metric: InteractionMetric): Promise<void> {
    const redis = await this.getRedis();
    if (!redis) return;

    const bucket = this.getBucketKey(metric.timestamp, 'daily');
    const key = REDIS_KEYS.aggregation(bucket);

    try {
      let agg = await redis.get(key);
      let aggData: AggregatedMetrics = agg
        ? (typeof agg === 'string' ? JSON.parse(agg) : agg)
        : this.createEmptyAggregation(bucket, 'daily');

      // Update aggregation
      aggData.totalInteractions++;
      aggData.outcomes[metric.outcome] = (aggData.outcomes[metric.outcome] || 0) + 1;
      aggData.stages[metric.conversationStage] = (aggData.stages[metric.conversationStage] || 0) + 1;
      if (metric.primaryAgent) {
        aggData.agents[metric.primaryAgent] = (aggData.agents[metric.primaryAgent] || 0) + 1;
      }
      aggData.patterns[metric.responsePattern] = (aggData.patterns[metric.responsePattern] || 0) + 1;

      const total = aggData.totalInteractions;
      aggData.avgSuccessScore = ((aggData.avgSuccessScore * (total - 1)) + metric.successScore) / total;
      aggData.dropOffRate = Math.round((aggData.outcomes.abandoned || 0) / total * 100);
      aggData.conversionRate = Math.round((aggData.outcomes.converted || 0) / total * 100);

      await redis.set(key, JSON.stringify(aggData));
      await redis.expire(key, this.retentionDays * 24 * 60 * 60);

      // Update global drop-off and patterns
      await this.updateGlobalStats(metric);
    } catch (error) {
      console.error('[REDIS-STORE] UpdateAggregation failed:', error);
    }
  }

  private async updateGlobalStats(metric: InteractionMetric): Promise<void> {
    const redis = await this.getRedis();
    if (!redis) return;

    // Update pattern performance
    const patterns = await this.getPatternPerformance();
    if (!patterns[metric.responsePattern]) {
      patterns[metric.responsePattern] = { success: 0, total: 0 };
    }
    patterns[metric.responsePattern].total++;
    if (metric.outcome === 'resolved' || metric.outcome === 'converted') {
      patterns[metric.responsePattern].success++;
    }
    await redis.set(REDIS_KEYS.patterns, JSON.stringify(patterns));
  }

  private getBucketKey(timestamp: number, bucket: TimeBucket): string {
    const date = new Date(timestamp);
    switch (bucket) {
      case 'hourly': return date.toISOString().slice(0, 13).replace('T', '-');
      case 'daily': return date.toISOString().slice(0, 10);
      case 'weekly': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `W${weekStart.toISOString().slice(0, 10)}`;
      }
      case 'monthly': return date.toISOString().slice(0, 7);
    }
  }

  private getRecentBuckets(count: number, bucket: TimeBucket): string[] {
    const buckets: string[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const date = new Date(now);
      switch (bucket) {
        case 'hourly':
          date.setHours(date.getHours() - i);
          break;
        case 'daily':
          date.setDate(date.getDate() - i);
          break;
        case 'weekly':
          date.setDate(date.getDate() - (i * 7));
          break;
        case 'monthly':
          date.setMonth(date.getMonth() - i);
          break;
      }
      buckets.push(this.getBucketKey(date.getTime(), bucket));
    }

    return buckets;
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
// IN-MEMORY STORE (Tests & Local Dev)
// ============================================================================

export class InMemoryLearningStore implements ILearningStore {
  private metrics: InteractionMetric[] = [];
  private aggregations: Map<string, AggregatedMetrics> = new Map();
  private patternPerf: Record<string, { success: number; total: number }> = {};
  private readonly maxMetrics: number;

  constructor(config?: Partial<StoreConfig>) {
    this.maxMetrics = config?.maxMetrics || 10000;
  }

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}

  async healthCheck(): Promise<StoreHealth> {
    return { connected: true, type: 'memory', latencyMs: 0 };
  }

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
    this.patternPerf = {};
  }

  async getAggregated(bucket: TimeBucket, limit = 30): Promise<AggregatedMetrics[]> {
    return Array.from(this.aggregations.values())
      .filter(a => a.bucketType === bucket)
      .sort((a, b) => b.bucket.localeCompare(a.bucket))
      .slice(0, limit);
  }

  async getStageDropOff(): Promise<Record<string, number>> {
    const stageCounts: Record<string, { entered: number; exited: number }> = {};
    const stages: ConversationStage[] = ['DISCOVERY', 'NARROWING', 'READY_TO_SEARCH', 'READY_TO_BOOK', 'POST_BOOKING'];
    stages.forEach(s => { stageCounts[s] = { entered: 0, exited: 0 }; });

    this.metrics.forEach(m => {
      stageCounts[m.conversationStage].entered++;
      if (m.outcome !== 'abandoned') stageCounts[m.conversationStage].exited++;
    });

    const dropOff: Record<string, number> = {};
    stages.forEach(s => {
      const { entered, exited } = stageCounts[s];
      dropOff[s] = entered > 0 ? Math.round(((entered - exited) / entered) * 100) : 0;
    });
    return dropOff;
  }

  async getPatternPerformance(): Promise<Record<ResponsePattern, { success: number; total: number }>> {
    return this.patternPerf as Record<ResponsePattern, { success: number; total: number }>;
  }

  private updateAggregation(metric: InteractionMetric): void {
    const bucket = this.getBucketKey(metric.timestamp, 'daily');
    let agg = this.aggregations.get(bucket) || this.createEmptyAggregation(bucket, 'daily');

    agg.totalInteractions++;
    agg.outcomes[metric.outcome] = (agg.outcomes[metric.outcome] || 0) + 1;
    agg.stages[metric.conversationStage] = (agg.stages[metric.conversationStage] || 0) + 1;
    if (metric.primaryAgent) agg.agents[metric.primaryAgent] = (agg.agents[metric.primaryAgent] || 0) + 1;
    agg.patterns[metric.responsePattern] = (agg.patterns[metric.responsePattern] || 0) + 1;

    const total = agg.totalInteractions;
    agg.avgSuccessScore = ((agg.avgSuccessScore * (total - 1)) + metric.successScore) / total;
    agg.dropOffRate = Math.round((agg.outcomes.abandoned || 0) / total * 100);
    agg.conversionRate = Math.round((agg.outcomes.converted || 0) / total * 100);

    this.aggregations.set(bucket, agg);

    // Update pattern performance
    if (!this.patternPerf[metric.responsePattern]) {
      this.patternPerf[metric.responsePattern] = { success: 0, total: 0 };
    }
    this.patternPerf[metric.responsePattern].total++;
    if (metric.outcome === 'resolved' || metric.outcome === 'converted') {
      this.patternPerf[metric.responsePattern].success++;
    }
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
      bucket, bucketType, totalInteractions: 0,
      outcomes: {} as Record<InteractionOutcome, number>,
      stages: {} as Record<ConversationStage, number>,
      agents: {}, patterns: {} as Record<ResponsePattern, number>,
      avgSuccessScore: 0, dropOffRate: 0, conversionRate: 0,
    };
  }
}

// ============================================================================
// STORE FACTORY
// ============================================================================

let activeStore: ILearningStore | null = null;

export function createLearningStore(config: StoreConfig): ILearningStore {
  switch (config.type) {
    case 'redis':
      // Check if Redis is available synchronously for factory
      const redisMod = getRedisModuleSync();
      if (redisMod?.isRedisEnabled?.()) {
        console.log('[STORE] Using Redis store (production)');
        return new RedisLearningStore(config);
      }
      console.log('[STORE] Redis unavailable, falling back to memory');
      return new InMemoryLearningStore(config);
    case 'memory':
      return new InMemoryLearningStore(config);
    case 'database':
      console.log('[STORE] Database not implemented, using memory');
      return new InMemoryLearningStore(config);
    default:
      return new InMemoryLearningStore(config);
  }
}

export function getActiveStore(): ILearningStore {
  if (!activeStore) {
    // Default to Redis in production, memory in dev
    const storeType = process.env.NODE_ENV === 'production' ? 'redis' : 'memory';
    activeStore = createLearningStore({ type: storeType });
  }
  return activeStore;
}

export function setActiveStore(store: ILearningStore): void {
  activeStore = store;
}

export async function checkStoreHealth(): Promise<StoreHealth> {
  return getActiveStore().healthCheck();
}
