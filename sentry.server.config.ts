/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry for the Node.js server-side.
 * It will be automatically imported by Next.js via the Sentry webpack plugin.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry for server-side error tracking
 */
Sentry.init({
  // DSN (Data Source Name) - Get this from your Sentry project settings
  dsn: SENTRY_DSN,

  // Environment name
  environment: SENTRY_ENVIRONMENT,

  // Tracing
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Debug mode (logs to console)
  debug: SENTRY_ENVIRONMENT === 'development',

  // Enable structured logging
  _experiments: {
    enableLogs: true,
  },

  // Integrations
  integrations: [
    // HTTP integration for tracing HTTP requests
    Sentry.httpIntegration(),
    // Console logging integration - capture server errors/warnings
    Sentry.consoleLoggingIntegration({ levels: ['error', 'warn'] }),
  ],

  // Before send hook - filter or modify events before sending to Sentry
  beforeSend(event, hint) {
    // Filter sensitive data from request headers
    if (event.request?.headers) {
      const sanitizedHeaders: Record<string, string> = {};

      for (const [key, value] of Object.entries(event.request.headers)) {
        const lowerKey = key.toLowerCase();

        // Redact sensitive headers
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

    // Filter sensitive data from request body
    if (event.request?.data) {
      const sensitiveFields = [
        'password',
        'token',
        'apiKey',
        'secret',
        'creditCard',
        'cardNumber',
        'cvv',
        'ssn',
        'pin',
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

    // Don't send events if no DSN is configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Log in development
    if (SENTRY_ENVIRONMENT === 'development') {
      console.log('[Sentry Server] Event captured:', event);
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Connection errors
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Next.js specific
    'Module not found',
    'Cannot find module',
  ],
});
