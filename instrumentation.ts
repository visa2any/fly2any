import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

/**
 * Next.js Instrumentation Hook
 * 
 * Runs once on server startup. Perfect for:
 * - Setting up global error handlers
 * - Initializing monitoring services
 * - Database connection monitoring
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      debug: SENTRY_ENVIRONMENT === 'development',
      _experiments: {
        enableLogs: true,
      },
      integrations: [
        Sentry.httpIntegration(),
        Sentry.consoleLoggingIntegration({ levels: ['error', 'warn'] }),
      ],
      beforeSend(event, hint) {
        if (event.request?.headers) {
          const sanitizedHeaders: Record<string, string> = {};
          for (const [key, value] of Object.entries(event.request.headers)) {
            const lowerKey = key.toLowerCase();
            if (
              lowerKey.includes('authorization') ||
              lowerKey.includes('cookie') ||
              lowerKey.includes('token') ||
              lowerKey.includes('api-key') ||
              lowerKey.includes('secret')
            ) {
              sanitizedHeaders[key] = '[REDACTED]';
            } else {
              sanitizedHeaders[key] = String(value);
            }
          }
          event.request.headers = sanitizedHeaders;
        }

        if (event.request?.data) {
          const sensitiveFields = [
            'password', 'token', 'apiKey', 'secret',
            'creditCard', 'cardNumber', 'cvv', 'ssn', 'pin',
          ];
          const data = event.request.data;
          if (typeof data === 'object' && data !== null) {
            const dataRecord = data as Record<string, unknown>;
            for (const field of sensitiveFields) {
              if (field in dataRecord) {
                dataRecord[field] = '[REDACTED]';
              }
            }
          }
        }

        if (!SENTRY_DSN) return null;

        if (SENTRY_ENVIRONMENT === 'development') {
          console.log('[Sentry Server] Event captured:', event);
        }

        return event;
      },
      ignoreErrors: [
        'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT',
        'Module not found', 'Cannot find module',
      ],
    });

    // Global unhandled error handler for Node.js
    process.on('uncaughtException', (error) => {
      console.error('[UNCAUGHT EXCEPTION]', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      Sentry.captureException(error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[UNHANDLED REJECTION]', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      Sentry.captureException(reason);
    });

    console.log('[Instrumentation] Server-side Sentry & error handlers registered');
  }

  // Edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.05 : 0.5,
      debug: SENTRY_ENVIRONMENT === 'development',
      beforeSend(event, hint) {
        if (event.request?.headers) {
          const sanitizedHeaders: Record<string, string> = {};
          for (const [key, value] of Object.entries(event.request.headers)) {
            const lowerKey = key.toLowerCase();
            if (
              lowerKey.includes('authorization') ||
              lowerKey.includes('cookie') ||
              lowerKey.includes('token') ||
              lowerKey.includes('api-key') ||
              lowerKey.includes('secret')
            ) {
              sanitizedHeaders[key] = '[REDACTED]';
            } else {
              sanitizedHeaders[key] = String(value);
            }
          }
          event.request.headers = sanitizedHeaders;
        }

        if (!SENTRY_DSN) return null;

        if (SENTRY_ENVIRONMENT === 'development') {
          console.log('[Sentry Edge] Event captured:', event);
        }

        return event;
      },
      ignoreErrors: [
        'NetworkError', 'Network request failed',
        'NEXT_REDIRECT', 'NEXT_NOT_FOUND',
      ],
    });
    console.log('[Instrumentation] Edge runtime Sentry initialized');
  }
}
