/**
 * QuoteSaveError - Structured Error for Quote Persistence Failures
 *
 * This error type captures all quote save failures with full context
 * for debugging, logging, and admin alerting.
 */

export interface QuoteSaveErrorMetadata {
  quoteId?: string;
  agentId?: string;
  workspaceId?: string;
  clientId?: string;
  environment: 'production' | 'staging' | 'development';
  timestamp: number;
  url: string;
  userAgent: string;
  failureMode: 'network' | 'http' | 'validation' | 'timeout' | 'unknown';
  httpStatus?: number;
  backendError?: string;
  payloadSize?: number;
  retryAttempt?: number;
  [key: string]: unknown; // Index signature for compatibility with Record<string, unknown>
}

export class QuoteSaveError extends Error {
  public readonly name = 'QuoteSaveError';
  public readonly metadata: QuoteSaveErrorMetadata;
  public readonly severity: 'CRITICAL';
  public readonly category: 'QUOTE_PERSISTENCE';

  constructor(
    message: string,
    metadata: Partial<QuoteSaveErrorMetadata> & {
      environment: 'production' | 'staging' | 'development';
      failureMode: QuoteSaveErrorMetadata['failureMode'];
    }
  ) {
    super(message);
    Object.setPrototypeOf(this, QuoteSaveError.prototype);

    this.severity = 'CRITICAL';
    this.category = 'QUOTE_PERSISTENCE';
    
    this.metadata = {
      quoteId: metadata.quoteId,
      agentId: metadata.agentId,
      workspaceId: metadata.workspaceId,
      clientId: metadata.clientId,
      environment: metadata.environment,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      failureMode: metadata.failureMode,
      httpStatus: metadata.httpStatus,
      backendError: metadata.backendError,
      payloadSize: metadata.payloadSize,
      retryAttempt: metadata.retryAttempt,
    };

    // Maintain proper stack trace (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QuoteSaveError);
    }
  }

  /**
   * Get human-readable summary for admin alerts
   */
  getSummary(): string {
    const { failureMode, httpStatus, backendError, quoteId } = this.metadata;
    
    let summary = `Quote Save Failed [${failureMode.toUpperCase()}]`;
    if (httpStatus) summary += ` - HTTP ${httpStatus}`;
    if (quoteId) summary += ` - Quote: ${quoteId}`;
    if (backendError) summary += ` - ${backendError}`;
    
    return summary;
  }

  /**
   * Check if this error should trigger admin escalation
   */
  shouldEscalate(): boolean {
    // All QuoteSaveErrors are CRITICAL and should escalate
    return true;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      severity: this.severity,
      category: this.category,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}

/**
 * Factory function to create QuoteSaveError from different failure modes
 */
export function createQuoteSaveError(
  message: string,
  failureMode: QuoteSaveErrorMetadata['failureMode'],
  context: Partial<Omit<QuoteSaveErrorMetadata, 'environment' | 'failureMode' | 'timestamp' | 'url' | 'userAgent'>>,
  environment: 'production' | 'staging' | 'development' = 'development'
): QuoteSaveError {
  return new QuoteSaveError(message, {
    ...context,
    failureMode,
    environment,
  });
}