/**
 * API Error Handler Utility
 *
 * Handles common API errors with:
 * - User-friendly error messages
 * - Automatic retry logic for transient failures
 * - Logging support
 * - Type-safe error handling
 */

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  retryable: boolean;
  retryAfter?: number; // seconds
  devMessage?: string;
}

export class ApiError extends Error {
  statusCode: number;
  retryable: boolean;
  retryAfter?: number;
  originalError?: any;

  constructor(
    message: string,
    statusCode: number,
    retryable: boolean = false,
    retryAfter?: number,
    originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.retryAfter = retryAfter;
    this.originalError = originalError;
  }
}

/**
 * Maps HTTP status codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<number, { user: string; developer: string }> = {
  // 400 - Bad Request
  400: {
    user: 'Invalid request. Please check your search criteria and try again.',
    developer: 'Bad Request: Invalid parameters sent to API',
  },
  // 401 - Unauthorized
  401: {
    user: 'You need to sign in to access this feature.',
    developer: 'Unauthorized: Missing or invalid authentication token',
  },
  // 403 - Forbidden
  403: {
    user: 'You don\'t have permission to access this feature.',
    developer: 'Forbidden: Insufficient permissions for this operation',
  },
  // 404 - Not Found
  404: {
    user: 'The requested information could not be found.',
    developer: 'Not Found: Resource does not exist',
  },
  // 408 - Request Timeout
  408: {
    user: 'The request took too long. Please try again.',
    developer: 'Request Timeout: Server did not receive complete request in time',
  },
  // 429 - Rate Limit
  429: {
    user: 'Too many requests. Please wait a moment and try again.',
    developer: 'Rate Limit Exceeded: Too many requests in given timeframe',
  },
  // 500 - Internal Server Error
  500: {
    user: 'We\'re experiencing technical difficulties. Please try again later.',
    developer: 'Internal Server Error: Unexpected server error',
  },
  // 502 - Bad Gateway
  502: {
    user: 'Service temporarily unavailable. Please try again in a moment.',
    developer: 'Bad Gateway: Upstream server returned invalid response',
  },
  // 503 - Service Unavailable
  503: {
    user: 'Service is temporarily down for maintenance. Please try again shortly.',
    developer: 'Service Unavailable: Server temporarily cannot handle requests',
  },
  // 504 - Gateway Timeout
  504: {
    user: 'Connection timed out. Please check your internet and try again.',
    developer: 'Gateway Timeout: Upstream server did not respond in time',
  },
};

/**
 * Determines if an error is retryable based on status code
 */
function isRetryable(statusCode: number): boolean {
  // Retry on: 408 (timeout), 429 (rate limit), 500+ (server errors)
  return statusCode === 408 || statusCode === 429 || statusCode >= 500;
}

/**
 * Parse retry-after header (seconds or HTTP date)
 */
function parseRetryAfter(retryAfterHeader?: string): number | undefined {
  if (!retryAfterHeader) return undefined;

  // If it's a number, it's seconds
  const seconds = parseInt(retryAfterHeader, 10);
  if (!isNaN(seconds)) {
    return seconds;
  }

  // If it's a date, calculate seconds from now
  const retryDate = new Date(retryAfterHeader);
  if (!isNaN(retryDate.getTime())) {
    const now = Date.now();
    const diff = retryDate.getTime() - now;
    return Math.max(0, Math.floor(diff / 1000));
  }

  return undefined;
}

/**
 * Handles API errors and returns a standardized error response
 */
export function handleApiError(error: any): ApiErrorResponse {
  // Handle network errors
  if (error.message?.includes('fetch') || error.message?.includes('NetworkError')) {
    return {
      error: 'NetworkError',
      message: 'Unable to connect. Please check your internet connection.',
      statusCode: 0,
      retryable: true,
      devMessage: 'Network error: Failed to fetch',
    };
  }

  // Handle timeout errors
  if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
    return {
      error: 'TimeoutError',
      message: 'Request timed out. Please try again.',
      statusCode: 408,
      retryable: true,
      devMessage: 'Request timeout',
    };
  }

  // Handle Response errors
  if (error.response) {
    const statusCode = error.response.status;
    const retryAfterHeader = error.response.headers?.get?.('retry-after');
    const retryAfter = parseRetryAfter(retryAfterHeader);

    const messages = ERROR_MESSAGES[statusCode] || {
      user: 'An unexpected error occurred. Please try again.',
      developer: `HTTP Error ${statusCode}`,
    };

    return {
      error: `HttpError${statusCode}`,
      message: messages.user,
      statusCode,
      retryable: isRetryable(statusCode),
      retryAfter,
      devMessage: messages.developer,
    };
  }

  // Handle unknown errors
  return {
    error: 'UnknownError',
    message: 'An unexpected error occurred. Please try again.',
    statusCode: 500,
    retryable: false,
    devMessage: error.message || 'Unknown error',
  };
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number; // ms
  maxDelay?: number; // ms
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: ApiErrorResponse) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  onRetry: () => {},
};

/**
 * Calculate delay for retry with exponential backoff
 */
function calculateDelay(attempt: number, config: Required<RetryConfig>, retryAfter?: number): number {
  // If server specified retry-after, use that
  if (retryAfter !== undefined) {
    return retryAfter * 1000;
  }

  // Exponential backoff: initialDelay * (backoffMultiplier ^ attempt)
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  );

  // Add jitter (±25%) to prevent thundering herd
  const jitter = delay * 0.25 * (Math.random() - 0.5);
  return Math.floor(delay + jitter);
}

/**
 * Executes an API call with automatic retry logic
 *
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @returns Promise with result or throws ApiError
 *
 * @example
 * const data = await withRetry(
 *   () => fetch('/api/flights').then(r => r.json()),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: ApiErrorResponse | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // Execute function
      return await fn();
    } catch (error: any) {
      // Handle error
      const apiError = handleApiError(error);
      lastError = apiError;

      // Check if we should retry
      const isLastAttempt = attempt === retryConfig.maxRetries;
      if (!apiError.retryable || isLastAttempt) {
        // Throw ApiError with details
        throw new ApiError(
          apiError.message,
          apiError.statusCode,
          apiError.retryable,
          apiError.retryAfter,
          error
        );
      }

      // Calculate delay and notify
      const delay = calculateDelay(attempt, retryConfig, apiError.retryAfter);
      retryConfig.onRetry(attempt + 1, apiError);

      // Log retry attempt (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Retry attempt ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms`,
          apiError
        );
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new ApiError(
    lastError?.message || 'Unknown error',
    lastError?.statusCode || 500,
    false
  );
}

/**
 * Logs API errors to console (development) or error tracking service (production)
 */
export function logApiError(error: ApiError | ApiErrorResponse, context?: Record<string, any>) {
  const logData = {
    error: error instanceof ApiError ? error.message : error.message,
    statusCode: error.statusCode,
    retryable: error.retryable,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', logData);
  } else {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // Sentry.captureException(error, { extra: logData });
  }
}

/**
 * Checks if API credentials are configured
 */
export function checkApiCredentials(): {
  configured: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required API keys
  if (!process.env.NEXT_PUBLIC_AMADEUS_API_KEY && !process.env.AMADEUS_API_KEY) {
    missing.push('AMADEUS_API_KEY');
  }

  if (!process.env.NEXT_PUBLIC_AMADEUS_API_SECRET && !process.env.AMADEUS_API_SECRET) {
    missing.push('AMADEUS_API_SECRET');
  }

  // Check optional but recommended keys
  if (!process.env.DATABASE_URL) {
    warnings.push('DATABASE_URL (account features will be unavailable)');
  }

  if (!process.env.NEXTAUTH_SECRET) {
    warnings.push('NEXTAUTH_SECRET (authentication will be disabled)');
  }

  return {
    configured: missing.length === 0,
    missing,
    warnings,
  };
}
