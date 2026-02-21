/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry for the browser/client-side using the new instrumentation hook.
 */

import * as Sentry from '@sentry/nextjs';

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry for client-side error tracking
 */
Sentry.init({
  // DSN (Data Source Name)
  dsn: SENTRY_DSN,

  // Environment name
  environment: SENTRY_ENVIRONMENT,

  // Tracing
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Debug mode
  debug: SENTRY_ENVIRONMENT === 'development',

  // Control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/fly2any\.com/,
    /^https:\/\/.*\.fly2any\.com/,
  ],

  // Enable structured logging
  _experiments: {
    enableLogs: true,
  },

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ['error', 'warn'] }),
  ],

  // Before send hook
  beforeSend(event, hint) {
    if (SENTRY_ENVIRONMENT === 'development') {
      console.log('[Sentry Client] Event captured:', event);
    }

    if (!SENTRY_DSN) {
      return null;
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    'NetworkError',
    'Network request failed',
    'Cross-Origin Request Blocked',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  // Deny URLs
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    /connect\.facebook\.net/i,
    /platform\.twitter\.com/i,
  ],
});
