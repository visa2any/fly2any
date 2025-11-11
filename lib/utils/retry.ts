/**
 * Retry utility with exponential backoff
 * Implements automatic retry logic for failed API calls with progressive delays
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Retry a function with exponential backoff
 *
 * @example
 * ```typescript
 * const data = await retryWithExponentialBackoff(
 *   () => fetch('/api/flights'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw new RetryError(
          `Failed after ${maxRetries} attempts: ${lastError.message}`,
          maxRetries,
          lastError
        );
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(
        initialDelay * Math.pow(factor, attempt),
        maxDelay
      );

      // Add random jitter (0-20% of delay) to prevent thundering herd
      const jitter = Math.random() * exponentialDelay * 0.2;
      const delay = exponentialDelay + jitter;

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed:`,
        lastError.message,
        `Retrying in ${Math.round(delay)}ms...`
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // TypeScript safety: this should never be reached due to throw above
  throw new RetryError(
    `Failed after ${maxRetries} attempts`,
    maxRetries,
    lastError!
  );
}

/**
 * Retry a function with a custom condition
 * Only retries if the condition function returns true
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw new RetryError(
          `Failed after ${maxRetries} attempts: ${lastError.message}`,
          maxRetries,
          lastError
        );
      }

      // Calculate delay
      const exponentialDelay = Math.min(
        initialDelay * Math.pow(factor, attempt),
        maxDelay
      );
      const jitter = Math.random() * exponentialDelay * 0.2;
      const delay = exponentialDelay + jitter;

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed:`,
        lastError.message,
        `Retrying in ${Math.round(delay)}ms...`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new RetryError(
    `Failed after ${maxRetries} attempts`,
    maxRetries,
    lastError!
  );
}

/**
 * Common retry conditions
 */
export const retryConditions = {
  /** Retry on network errors */
  networkError: (error: Error) => {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ETIMEDOUT')
    );
  },

  /** Retry on 5xx server errors */
  serverError: (error: any) => {
    return error.status >= 500 && error.status < 600;
  },

  /** Retry on timeout errors */
  timeoutError: (error: Error) => {
    return (
      error.message.includes('timeout') ||
      error.message.includes('timed out')
    );
  },

  /** Retry on rate limit errors (429) */
  rateLimitError: (error: any) => {
    return error.status === 429;
  },

  /** Combined condition for common retryable errors */
  retryable: (error: any) => {
    return (
      retryConditions.networkError(error) ||
      retryConditions.serverError(error) ||
      retryConditions.timeoutError(error) ||
      retryConditions.rateLimitError(error)
    );
  },
};

/**
 * Fetch with automatic retry
 * Wraps fetch() with retry logic
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return retryWithCondition(
    async () => {
      const response = await fetch(input, init);

      // Throw on non-ok responses so they can be retried
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as any;
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return response;
    },
    (error: any, attempt) => {
      // Retry on retryable errors
      return retryConditions.retryable(error);
    },
    retryOptions
  );
}
