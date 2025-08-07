/**
 * 🛡️ ERROR HANDLING MIDDLEWARE
 * Centralized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { logAPIError } from '@/lib/logging/error-logger';

export interface APIError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class APIErrorHandler {
  /**
   * Wrap API route handler with error handling
   */
  static wrap(handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        return await handler(request);
      } catch (error) {
        return await APIErrorHandler.handleError(error, request);
      }
    };
  }

  /**
   * Handle API errors with comprehensive logging
   */
  static async handleError(error: unknown, request: NextRequest): Promise<NextResponse> {
    const apiError = APIErrorHandler.normalizeError(error);
    
    // Log the error
    await logAPIError(apiError, request, {
      additionalData: {
        statusCode: apiError.statusCode,
        code: apiError.code,
        details: apiError.details
      }
    });

    // Determine response based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const errorResponse = {
      success: false,
      error: apiError.message,
      code: apiError.code,
      ...(isDevelopment && {
        stack: apiError.stack,
        details: apiError.details
      }),
      timestamp: new Date().toISOString(),
      requestId: APIErrorHandler.generateRequestId()
    };

    return NextResponse.json(errorResponse, { 
      status: apiError.statusCode || 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': errorResponse.requestId
      }
    });
  }

  /**
   * Normalize different error types
   */
  private static normalizeError(error: unknown): APIError {
    if (error instanceof Error && 'statusCode' in error) {
      return error as APIError;
    }

    if (error instanceof Error) {
      const apiError = error as APIError;
      apiError.statusCode = apiError.statusCode || 500;
      apiError.code = apiError.code || 'INTERNAL_SERVER_ERROR';
      return apiError;
    }

    // Handle non-Error objects
    return {
      name: 'UnknownError',
      message: typeof error === 'string' ? error : 'An unknown error occurred',
      statusCode: 500,
      code: 'UNKNOWN_ERROR',
      stack: undefined
    };
  }

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create specific API error types
 */
export class ValidationError extends Error implements APIError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error implements APIError {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error implements APIError {
  statusCode = 401;
  code = 'UNAUTHORIZED';

  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class PaymentError extends Error implements APIError {
  statusCode = 402;
  code = 'PAYMENT_ERROR';
  details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'PaymentError';
    this.details = details;
  }
}

export class ExternalAPIError extends Error implements APIError {
  statusCode = 502;
  code = 'EXTERNAL_API_ERROR';
  details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ExternalAPIError';
    this.details = details;
  }
}

export class RateLimitError extends Error implements APIError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';

  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Convenience function to create API route handlers with error handling
 */
export function createAPIHandler(handler: (request: NextRequest) => Promise<NextResponse>) {
  return APIErrorHandler.wrap(handler);
}

/**
 * Middleware for handling async errors
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Re-throw with additional context
      if (error instanceof Error) {
        error.stack = `${error.stack}\n\nOriginated from: ${fn.name}`;
      }
      throw error;
    }
  };
}