/**
 * Quote Operation Observability & Logging
 * Structured logging with correlation tracking
 */

import { generateCorrelationId, computePayloadHash } from "@/lib/errors/QuoteApiErrors";
import prisma from "@/lib/prisma";

/**
 * Quote operation log entry
 */
export interface QuoteOperationLog {
  correlationId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SEND';
  quoteId?: string;
  agentId: string;
  clientId: string;
  payloadHash: string;
  duration: number;
  success: boolean;
  error?: {
    code: string;
    message: string;
    severity: string;
    stack?: string;
  };
  metadata: Record<string, unknown>;
  environment: string;
  timestamp: number;
}

/**
 * Quote operation performance metrics
 */
export interface QuoteMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  p95Duration: number;
  p99Duration: number;
  errorByCode: Record<string, number>;
}

/**
 * Metrics storage (in-memory for now, could be Redis in production)
 */
class MetricsStore {
  private operations: QuoteOperationLog[] = [];
  private maxOperations = 1000;

  add(log: QuoteOperationLog): void {
    this.operations.push(log);
    if (this.operations.length > this.maxOperations) {
      this.operations.shift();
    }
  }

  getMetrics(timeRange: number = 3600000): QuoteMetrics {
    const cutoff = Date.now() - timeRange;
    const recentOps = this.operations.filter(op => op.timestamp > cutoff);

    if (recentOps.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        errorByCode: {},
      };
    }

    const durations = recentOps.map(op => op.duration).sort((a, b) => a - b);
    const successfulOps = recentOps.filter(op => op.success);
    const failedOps = recentOps.filter(op => !op.success);
    const errorByCode: Record<string, number> = {};

    failedOps.forEach(op => {
      const code = op.error?.code || 'UNKNOWN';
      errorByCode[code] = (errorByCode[code] || 0) + 1;
    });

    const sum = durations.reduce((a, b) => a + b, 0);
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    return {
      totalOperations: recentOps.length,
      successfulOperations: successfulOps.length,
      failedOperations: failedOps.length,
      averageDuration: sum / durations.length,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      errorByCode,
    };
  }

  clear(): void {
    this.operations = [];
  }
}

const metricsStore = new MetricsStore();

/**
 * Track quote operation with performance metrics
 */
export class QuoteOperationTracker {
  private correlationId: string;
  private operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SEND';
  private startTime: number;
  private agentId: string;
  private clientId: string;
  private payloadHash: string;
  private metadata: Record<string, unknown>;

  constructor(
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SEND',
    agentId: string,
    clientId: string,
    payload: unknown,
    metadata: Record<string, unknown> = {}
  ) {
    this.correlationId = generateCorrelationId();
    this.operation = operation;
    this.startTime = Date.now();
    this.agentId = agentId;
    this.clientId = clientId;
    this.payloadHash = computePayloadHash(payload);
    this.metadata = metadata;

    // Log operation start
    this.logStart();
  }

  private logStart(): void {
    console.log(JSON.stringify({
      level: 'INFO',
      event: 'quote_operation_start',
      correlationId: this.correlationId,
      operation: this.operation,
      agentId: this.agentId,
      clientId: this.clientId,
      payloadHash: this.payloadHash,
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Mark operation as successful
   */
  success(quoteId?: string): void {
    const duration = Date.now() - this.startTime;

    this.logOperation({
      quoteId,
      duration,
      success: true,
    });
  }

  /**
   * Mark operation as failed
   */
  failure(error: {
    code: string;
    message: string;
    severity: string;
    stack?: string;
  }): void {
    const duration = Date.now() - this.startTime;

    this.logOperation({
      duration,
      success: false,
      error,
    });
  }

  private logOperation(data: {
    quoteId?: string;
    duration: number;
    success: boolean;
    error?: {
      code: string;
      message: string;
      severity: string;
      stack?: string;
    };
  }): void {
    const log: QuoteOperationLog = {
      correlationId: this.correlationId,
      operation: this.operation,
      quoteId: data.quoteId,
      agentId: this.agentId,
      clientId: this.clientId,
      payloadHash: this.payloadHash,
      duration: data.duration,
      success: data.success,
      error: data.error,
      metadata: this.metadata,
      environment: process.env.NODE_ENV || 'development',
      timestamp: Date.now(),
    };

    // Log to console (structured JSON)
    console.log(JSON.stringify({
      ...log,
      level: data.success ? 'INFO' : 'ERROR',
      event: 'quote_operation_complete',
      timestampIso: new Date().toISOString(),
    }));

    // Store in database (non-blocking)
    this.persistLog(log);
  }

  private async persistLog(log: QuoteOperationLog): Promise<void> {
    try {
      await prisma!.agentActivityLog.create({
        data: {
          agentId: log.agentId,
          activityType: `quote_${log.operation.toLowerCase()}`,
          entityType: 'quote',
          entityId: log.quoteId,
          description: `Quote ${log.operation.toLowerCase()} ${log.success ? 'success' : 'failed'}`,
          metadata: {
            correlationId: log.correlationId,
            payloadHash: log.payloadHash,
            duration: log.duration,
            success: log.success,
            error: log.error,
          },
        },
      });
    } catch (error) {
      // Never let logging failures break the flow
      console.error('[LOGGING_PERSIST_ERROR]', {
        correlationId: log.correlationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private addToMetrics(data: {
    quoteId?: string;
    duration: number;
    success: boolean;
    error?: {
      code: string;
      message: string;
      severity: string;
    };
  }): void {
    const log: QuoteOperationLog = {
      correlationId: this.correlationId,
      operation: this.operation,
      quoteId: data.quoteId,
      agentId: this.agentId,
      clientId: this.clientId,
      payloadHash: this.payloadHash,
      duration: data.duration,
      success: data.success,
      error: data.error,
      metadata: this.metadata,
      environment: process.env.NODE_ENV || 'development',
      timestamp: Date.now(),
    };

    metricsStore.add(log);
  }

  getCorrelationId(): string {
    return this.correlationId;
  }

  /**
   * Add operation to metrics store
   */
  private addToMetrics(data: {
    quoteId?: string;
    duration: number;
    success: boolean;
    error?: {
      code: string;
      message: string;
      severity: string;
    };
  }): void {
    const log: QuoteOperationLog = {
      correlationId: this.correlationId,
      operation: this.operation,
      quoteId: data.quoteId,
      agentId: this.agentId,
      clientId: this.clientId,
      payloadHash: this.payloadHash,
      duration: data.duration,
      success: data.success,
      error: data.error,
      metadata: this.metadata,
      environment: process.env.NODE_ENV || 'development',
      timestamp: Date.now(),
    };

    metricsStore.add(log);
  }
}

/**
 * Get current metrics
 */
export function getQuoteMetrics(timeRange?: number): QuoteMetrics {
  return metricsStore.getMetrics(timeRange);
}

/**
 * Clear metrics
 */
export function clearQuoteMetrics(): void {
  metricsStore.clear();
}

/**
 * Log error with correlation context
 */
export function logErrorWithContext(
  error: {
    code: string;
    message: string;
    severity: string;
    stack?: string;
  },
  context: Record<string, unknown>
): void {
  console.error(JSON.stringify({
    level: 'ERROR',
    event: 'quote_error',
    correlationId: context.correlationId,
    error,
    context,
    timestamp: new Date().toISOString(),
  }));
}