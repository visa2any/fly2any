/**
 * Semantic Quote API Error Taxonomy
 * Mission-critical error system for quote save operations
 * NEVER return generic errors - ALWAYS use semantic error codes
 */

export type ErrorCode = 
  | 'QUOTE_VALIDATION_FAILED'
  | 'QUOTE_STATE_INVALID'
  | 'QUOTE_CONFLICT_VERSION'
  | 'QUOTE_ALREADY_SENT'
  | 'QUOTE_PERSISTENCE_FAILED'
  | 'DATABASE_TIMEOUT'
  | 'DATABASE_TRANSACTION_ABORTED'
  | 'AUTHENTICATION_FAILED'
  | 'AUTHORIZATION_FAILED'
  | 'CLIENT_NOT_FOUND'
  | 'AGENT_NOT_FOUND'
  | 'PRICING_VALIDATION_FAILED'
  | 'CURRENCY_INVALID'
  | 'ITEMS_INCONSISTENT'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

export type ErrorSeverity = 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';

export interface QuoteApiError {
  success: false;
  errorCode: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  retryable: boolean;
  correlationId: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Create a structured API error response
 */
export function createQuoteApiError(
  errorCode: ErrorCode,
  message: string,
  severity: ErrorSeverity,
  retryable: boolean,
  correlationId: string,
  details?: Record<string, unknown>
): QuoteApiError {
  return {
    success: false,
    errorCode,
    message,
    severity,
    retryable,
    correlationId,
    details,
    timestamp: Date.now(),
  };
}

/**
 * Predefined error constructors with semantic meaning
 */
export class QuoteErrorFactory {
  static validationFailed(
    message: string,
    correlationId: string,
    details?: Record<string, unknown>
  ): QuoteApiError {
    return createQuoteApiError(
      'QUOTE_VALIDATION_FAILED',
      message,
      'HIGH',
      false,
      correlationId,
      details
    );
  }

  static stateInvalid(
    currentState: string,
    requiredState: string,
    correlationId: string
  ): QuoteApiError {
    return createQuoteApiError(
      'QUOTE_STATE_INVALID',
      `Quote is ${currentState} but must be ${requiredState}`,
      'HIGH',
      false,
      correlationId,
      { currentState, requiredState }
    );
  }

  static conflictVersion(
    quoteId: string,
    expectedVersion: number,
    actualVersion: number,
    correlationId: string
  ): QuoteApiError {
    return createQuoteApiError(
      'QUOTE_CONFLICT_VERSION',
      `Quote was modified by another agent. Please reload and try again.`,
      'HIGH',
      true,
      correlationId,
      { quoteId, expectedVersion, actualVersion }
    );
  }

  static alreadySent(
    quoteId: string,
    correlationId: string
  ): QuoteApiError {
    return createQuoteApiError(
      'QUOTE_ALREADY_SENT',
      'Quote has already been sent to client and cannot be modified',
      'CRITICAL',
      false,
      correlationId,
      { quoteId }
    );
  }

  static persistenceFailed(
    correlationId: string,
    details?: Record<string, unknown>
  ): QuoteApiError {
    return createQuoteApiError(
      'QUOTE_PERSISTENCE_FAILED',
      'Failed to save quote to database',
      'CRITICAL',
      true,
      correlationId,
      details
    );
  }

  static databaseTimeout(
    correlationId: string,
    details?: Record<string, unknown>
  ): QuoteApiError {
    return createQuoteApiError(
      'DATABASE_TIMEOUT',
      'Database operation timed out',
      'HIGH',
      true,
      correlationId,
      details
    );
  }

  static transactionAborted(
    correlationId: string,
    reason: string
  ): QuoteApiError {
    return createQuoteApiError(
      'DATABASE_TRANSACTION_ABORTED',
      `Database transaction aborted: ${reason}`,
      'CRITICAL',
      true,
      correlationId,
      { reason }
    );
  }

  static pricingValidationFailed(
    correlationId: string,
    errors: string[]
  ): QuoteApiError {
    return createQuoteApiError(
      'PRICING_VALIDATION_FAILED',
      'Quote pricing validation failed',
      'HIGH',
      false,
      correlationId,
      { errors }
    );
  }

  static itemsInconsistent(
    correlationId: string,
    details: {
      expectedTotal: number;
      calculatedTotal: number;
    }
  ): QuoteApiError {
    return createQuoteApiError(
      'ITEMS_INCONSISTENT',
      'Quote total does not match sum of items',
      'CRITICAL',
      false,
      correlationId,
      details
    );
  }

  static clientNotFound(
    clientId: string,
    correlationId: string
  ): QuoteApiError {
    return createQuoteApiError(
      'CLIENT_NOT_FOUND',
      'Client not found or does not belong to this agent',
      'HIGH',
      false,
      correlationId,
      { clientId }
    );
  }

  static agentNotFound(
    correlationId: string
  ): QuoteApiError {
    return createQuoteApiError(
      'AGENT_NOT_FOUND',
      'Agent profile not found',
      'HIGH',
      false,
      correlationId
    );
  }

  static internalError(
    correlationId: string,
    details?: Record<string, unknown>
  ): QuoteApiError {
    return createQuoteApiError(
      'INTERNAL_ERROR',
      'An internal server error occurred',
      'CRITICAL',
      false,
      correlationId,
      details
    );
  }
}

/**
 * Generate correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `REQ-${timestamp}-${random}`.toUpperCase();
}

/**
 * Compute payload hash for observability (without sensitive data)
 */
export function computePayloadHash(payload: unknown): string {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Success response type
 */
export interface QuoteSuccessResponse {
  success: true;
  quoteId: string;
  version: number;
  savedAt: string;
  quote?: unknown;
}

/**
 * Create success response
 */
export function createQuoteSuccess(
  quoteId: string,
  version: number,
  savedAt: Date,
  quote?: unknown
): QuoteSuccessResponse {
  return {
    success: true,
    quoteId,
    version,
    savedAt: savedAt.toISOString(),
    quote,
  };
}