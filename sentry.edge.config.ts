/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for the Edge runtime (middleware, edge functions).
 * It will be automatically imported by Next.js via the Sentry webpack plugin.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry for Edge runtime error tracking
 */
Sentry.init({
  // DSN (Data Source Name) - Get this from your Sentry project settings
  dsn: SENTRY_DSN,

  // Environment name
  environment: SENTRY_ENVIRONMENT,

  // Tracing
  // Edge runtime should have lower sample rates to avoid high costs
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.05 : 0.5,

  // Debug mode (logs to console)
  debug: SENTRY_ENVIRONMENT === 'development',

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

    // Don't send events if no DSN is configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Log in development
    if (SENTRY_ENVIRONMENT === 'development') {
      console.log('[Sentry Edge] Event captured:', event);
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Network errors
    'NetworkError',
    'Network request failed',
    // Middleware common errors
    'NEXT_REDIRECT',
    'NEXT_NOT_FOUND',
  ],
});
