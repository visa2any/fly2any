/**
 * API Error Standardization Middleware
 * 
 * Provides consistent error handling for all API routes with:
 * - Standardized error response format
 * - Automatic error categorization
 * - Request validation
 * - Rate limiting integration
 * - Performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  handleApiError, 
  ErrorCategory, 
  ErrorSeverity,
  createAppError,
  safeExecute 
} from '@/lib/monitoring/global-error-handler';
import { monitoringMiddleware, rateLimiter } from '@/lib/monitoring/middleware';

/**
 * Standardized API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    category: string;
    timestamp: string;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * API handler options
 */
export interface ApiHandlerOptions {
  requireAuth?: boolean;
  allowedMethods?: string[];
  validateRequest?: (request: NextRequest) => Promise<{
    isValid: boolean;
    errors?: Record<string, string>;
  }>;
  rateLimit?: {
    identifier: string;
    window: 'minute' | 'hour' | 'day';
    maxRequests: number;
  };
  enableMonitoring?: boolean;
  operationName?: string;
}

/**
 * Create a standardized API handler wrapper
 */
export function createApiHandler<T = any>(
  handler: (
    request: NextRequest,
    context: {
      userId?: string;
      session?: any;
      params: Record<string, string>;
    }
  ) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return async function apiHandlerWrapper(
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> {
    const startTime = performance.now();
    const requestId = crypto.randomUUID();

    // Apply monitoring middleware if enabled
    if (options.enableMonitoring !== false) {
      const monitoringResponse = await monitoringMiddleware(request);
      if (monitoringResponse.status >= 400) {
        return monitoringResponse;
      }
    }

    // Validate HTTP method
    if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
      return handleApiError(request, async () => {
        throw createAppError(`Method ${request.method} not allowed`, {
          code: 'METHOD_NOT_ALLOWED',
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.NORMAL,
          statusCode: 405,
          userMessage: 'This HTTP method is not supported for this endpoint.',
        });
      }, {
        endpoint: request.nextUrl.pathname,
        category: ErrorCategory.VALIDATION,
      });
    }

    // Apply rate limiting
    if (options.rateLimit) {
      const { identifier, window, maxRequests } = options.rateLimit;
      const limitKey = `${identifier}:${window}`;
      const rateLimitResult = rateLimiter.isRateLimited(limitKey);

      if (rateLimitResult.limited) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`,
              category: ErrorCategory.VALIDATION,
              timestamp: new Date().toISOString(),
            },
          },
          {
            status: 429,
            headers: {
              'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Window': window,
            },
          }
        );
      }
    }

    // Validate request if validator provided
    if (options.validateRequest) {
      const validation = await options.validateRequest(request);
      if (!validation.isValid) {
        return handleApiError(request, async () => {
          throw createAppError('Request validation failed', {
            code: 'VALIDATION_ERROR',
            category: ErrorCategory.VALIDATION,
            severity: ErrorSeverity.NORMAL,
            statusCode: 400,
            userMessage: 'Please check your input and try again.',
            details: validation.errors,
          });
        }, {
          endpoint: request.nextUrl.pathname,
          category: ErrorCategory.VALIDATION,
        });
      }
    }

    // Authentication check
    let userId: string | undefined;
    let session: any;

    if (options.requireAuth) {
      // TODO: Integrate with your auth system
      // const session = await getSession();
      // if (!session) {
      //   return NextResponse.json(
      //     {
      //       success: false,
      //       error: {
      //         code: 'UNAUTHORIZED',
      //         message: 'Authentication required',
      //         category: ErrorCategory.AUTHENTICATION,
      //         timestamp: new Date().toISOString(),
      //       },
      //     },
      //     { status: 401 }
      //   );
      // }
      // userId = session.user.id;
      // session = session;
    }

    // Execute the handler with error handling
    return handleApiError(
      request,
      async () => {
        const response = await handler(request, {
          userId,
          session,
          params: context.params,
        });

        // Add standard headers
        response.headers.set('X-Request-ID', requestId);
        response.headers.set('X-API-Version', '1.0.0');

        // Calculate processing time
        const processingTime = performance.now() - startTime;
        response.headers.set('X-Processing-Time', `${processingTime.toFixed(2)}ms`);

        // If response is JSON, we can wrap it in our standard format
        if (response.headers.get('content-type')?.includes('application/json')) {
          try {
            const data = await response.clone().json();
            const wrappedResponse: ApiResponse = {
              success: response.status < 400,
              data: response.status < 400 ? data : undefined,
              error: response.status >= 400 ? {
                code: data.error || 'UNKNOWN_ERROR',
                message: data.message || 'An error occurred',
                details: data.details,
                category: data.category || ErrorCategory.UNKNOWN,
                timestamp: new Date().toISOString(),
              } : undefined,
              metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                processingTime,
              },
            };

            return NextResponse.json(wrappedResponse, {
              status: response.status,
              headers: response.headers,
            });
          } catch {
            // If we can't parse as JSON, return original response
            return response;
          }
        }

        return response;
      },
      {
        endpoint: request.nextUrl.pathname,
        operationName: options.operationName || handler.name || 'API Handler',
        userId,
      }
    );
  };
}

/**
 * Helper to create GET handler
 */
export function createGetHandler<T = any>(
  handler: (
    request: NextRequest,
    context: {
      userId?: string;
      session?: any;
      params: Record<string, string>;
    }
  ) => Promise<NextResponse>,
  options: Omit<ApiHandlerOptions, 'allowedMethods'> = {}
) {
  return createApiHandler<T>(handler, {
    ...options,
    allowedMethods: ['GET'],
  });
}

/**
 * Helper to create POST handler
 */
export function createPostHandler<T = any>(
  handler: (
    request: NextRequest,
    context: {
      userId?: string;
      session?: any;
      params: Record<string, string>;
    }
  ) => Promise<NextResponse>,
  options: Omit<ApiHandlerOptions, 'allowedMethods'> = {}
) {
  return createApiHandler<T>(handler, {
    ...options,
    allowedMethods: ['POST'],
  });
}

/**
 * Helper to create PUT handler
 */
export function createPutHandler<T = any>(
  handler: (
    request: NextRequest,
    context: {
      userId?: string;
      session?: any;
      params: Record<string, string>;
    }
  ) => Promise<NextResponse>,
  options: Omit<ApiHandlerOptions, 'allowedMethods'> = {}
) {
  return createApiHandler<T>(handler, {
    ...options,
    allowedMethods: ['PUT'],
  });
}

/**
 * Helper to create DELETE handler
 */
export function createDeleteHandler<T = any>(
  handler: (
    request: NextRequest,
    context: {
      userId?: string;
      session?: any;
      params: Record<string, string>;
    }
  ) => Promise<NextResponse>,
  options: Omit<ApiHandlerOptions, 'allowedMethods'> = {}
) {
  return createApiHandler<T>(handler, {
    ...options,
    allowedMethods: ['DELETE'],
  });
}

/**
 * Validation helpers
 */
export const validators = {
  jsonBody: async (request: NextRequest) => {
    try {
      await request.json();
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        errors: { body: 'Invalid JSON body' },
      };
    }
  },

  requiredFields: (fields: string[]) => async (request: NextRequest) => {
    try {
      const body = await request.json();
      const errors: Record<string, string> = {};

      for (const field of fields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
          errors[field] = `${field} is required`;
        }
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      };
    } catch {
      return {
        isValid: false,
        errors: { body: 'Invalid JSON body' },
      };
    }
  },

  queryParams: (params: string[]) => async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const errors: Record<string, string> = {};

    for (const param of params) {
      if (!searchParams.has(param)) {
        errors[param] = `${param} query parameter is required`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  },
};

/**
 * Example usage:
 * 
 * ```typescript
 * // app/api/users/route.ts
 * import { createGetHandler, validators } from '@/lib/api/error-middleware';
 * 
 * export const GET = createGetHandler(
 *   async (request, context) => {
 *     const users = await db.user.findMany();
 *     return NextResponse.json({ users });
 *   },
 *   {
 *     requireAuth: true,
 *     rateLimit: {
 *       identifier: 'users-list',
 *       window: 'minute',
 *       maxRequests: 60,
 *     },
 *     validateRequest: validators.queryParams(['page', 'limit']),
 *     operationName: 'Get Users',
 *   }
 * );
 * ```
 */

export default createApiHandler;
