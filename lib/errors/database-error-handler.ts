/**
 * Database Error Handler Utility
 *
 * Handles Prisma and database errors with:
 * - User-friendly error messages
 * - Fallback data strategies
 * - Connection retry logic
 * - Type-safe error handling
 */

export interface DatabaseErrorResponse {
  error: string;
  message: string;
  userMessage: string;
  code?: string;
  retryable: boolean;
  devMessage?: string;
}

export class DatabaseError extends Error {
  code?: string;
  retryable: boolean;
  originalError?: any;

  constructor(
    message: string,
    code?: string,
    retryable: boolean = false,
    originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.retryable = retryable;
    this.originalError = originalError;
  }
}

/**
 * Common Prisma error codes
 * https://www.prisma.io/docs/reference/api-reference/error-reference
 */
const PRISMA_ERROR_CODES: Record<string, { user: string; developer: string; retryable: boolean }> = {
  // Connection errors (retryable)
  P1001: {
    user: 'Unable to connect to the database. Please try again in a moment.',
    developer: 'Can\'t reach database server',
    retryable: true,
  },
  P1002: {
    user: 'Database connection timed out. Please try again.',
    developer: 'Database server connection timed out',
    retryable: true,
  },
  P1008: {
    user: 'Database operation timed out. Please try again.',
    developer: 'Operations timed out',
    retryable: true,
  },
  P1017: {
    user: 'Database connection was lost. Please try again.',
    developer: 'Server has closed the connection',
    retryable: true,
  },

  // Query errors (not retryable)
  P2002: {
    user: 'This information already exists. Please use a different value.',
    developer: 'Unique constraint violation',
    retryable: false,
  },
  P2003: {
    user: 'Related information not found. Please check your data.',
    developer: 'Foreign key constraint violation',
    retryable: false,
  },
  P2025: {
    user: 'The requested information could not be found.',
    developer: 'Record not found',
    retryable: false,
  },

  // Validation errors (not retryable)
  P2000: {
    user: 'Input value is too long. Please use a shorter value.',
    developer: 'Value too long for column',
    retryable: false,
  },
  P2001: {
    user: 'Required information is missing. Please check your input.',
    developer: 'Record required but not found',
    retryable: false,
  },
};

/**
 * Checks if error is a Prisma error
 */
function isPrismaError(error: any): boolean {
  return (
    error?.name === 'PrismaClientKnownRequestError' ||
    error?.name === 'PrismaClientInitializationError' ||
    error?.name === 'PrismaClientUnknownRequestError' ||
    error?.name === 'PrismaClientRustPanicError' ||
    error?.name === 'PrismaClientValidationError' ||
    error?.code?.startsWith('P')
  );
}

/**
 * Checks if DATABASE_URL is configured
 */
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

/**
 * Handles database errors and returns standardized error response
 */
export function handleDatabaseError(error: any): DatabaseErrorResponse {
  // Check if database is configured
  if (!isDatabaseConfigured()) {
    return {
      error: 'DatabaseNotConfigured',
      message: 'Database is not configured',
      userMessage: 'Account features are currently unavailable. You can still search for flights without signing in.',
      retryable: false,
      devMessage: 'DATABASE_URL environment variable is not set. Add it to .env.local',
    };
  }

  // Handle Prisma-specific errors
  if (isPrismaError(error)) {
    const code = error.code || 'UNKNOWN';
    const errorConfig = PRISMA_ERROR_CODES[code];

    if (errorConfig) {
      return {
        error: `PrismaError_${code}`,
        message: errorConfig.developer,
        userMessage: errorConfig.user,
        code,
        retryable: errorConfig.retryable,
        devMessage: error.message,
      };
    }

    // Unknown Prisma error
    return {
      error: 'PrismaError_Unknown',
      message: 'Unknown database error',
      userMessage: 'We\'re having trouble accessing your account data. Please try again later.',
      code,
      retryable: false,
      devMessage: error.message,
    };
  }

  // Handle connection errors
  if (
    error.message?.includes('ECONNREFUSED') ||
    error.message?.includes('ETIMEDOUT') ||
    error.message?.includes('connect') ||
    error.code === 'ECONNREFUSED'
  ) {
    return {
      error: 'DatabaseConnectionError',
      message: 'Cannot connect to database',
      userMessage: 'Unable to connect to the database. Please try again in a moment.',
      retryable: true,
      devMessage: error.message,
    };
  }

  // Handle timeout errors
  if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
    return {
      error: 'DatabaseTimeoutError',
      message: 'Database operation timed out',
      userMessage: 'The operation took too long. Please try again.',
      retryable: true,
      devMessage: error.message,
    };
  }

  // Unknown database error
  return {
    error: 'DatabaseError',
    message: 'Database operation failed',
    userMessage: 'We\'re experiencing database issues. Please try again later.',
    retryable: false,
    devMessage: error.message,
  };
}

/**
 * Executes a database operation with retry logic
 */
export async function withDatabaseRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: DatabaseErrorResponse | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const dbError = handleDatabaseError(error);
      lastError = dbError;

      // Check if we should retry
      const isLastAttempt = attempt === maxRetries;
      if (!dbError.retryable || isLastAttempt) {
        throw new DatabaseError(
          dbError.userMessage,
          dbError.code,
          dbError.retryable,
          error
        );
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), 10000);

      // Log retry attempt (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Database retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
          dbError
        );
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new DatabaseError(
    lastError?.userMessage || 'Database error',
    lastError?.code,
    false
  );
}

/**
 * Provides fallback data when database is unavailable
 */
export function getFallbackData<T>(
  type: 'user' | 'bookings' | 'searches' | 'favorites',
  defaultValue: T
): T {
  // Try to get data from localStorage as fallback
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`fallback_${type}`);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      console.error('Failed to get fallback data from localStorage:', error);
    }
  }

  return defaultValue;
}

/**
 * Saves fallback data to localStorage
 */
export function saveFallbackData<T>(
  type: 'user' | 'bookings' | 'searches' | 'favorites',
  data: T
): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`fallback_${type}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save fallback data to localStorage:', error);
    }
  }
}

/**
 * Checks database health
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  latency?: number;
}> {
  if (!isDatabaseConfigured()) {
    return {
      healthy: false,
      message: 'Database not configured',
    };
  }

  try {
    const startTime = Date.now();

    // Try to import and ping database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    const latency = Date.now() - startTime;

    return {
      healthy: true,
      message: 'Database is healthy',
      latency,
    };
  } catch (error: any) {
    const dbError = handleDatabaseError(error);
    return {
      healthy: false,
      message: dbError.message,
    };
  }
}

/**
 * Logs database errors
 */
export function logDatabaseError(
  error: DatabaseError | DatabaseErrorResponse,
  context?: Record<string, any>
) {
  const logData = {
    error: error instanceof DatabaseError ? error.message : error.message,
    code: error.code,
    retryable: error.retryable,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Database Error:', logData);
  } else {
    // TODO: Send to error tracking service
    // Sentry.captureException(error, { extra: logData });
  }
}
