/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry for the browser/client-side.
 * It will be automatically imported by Next.js via the Sentry webpack plugin.
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry for client-side error tracking
 */
Sentry.init({
  // DSN (Data Source Name) - Get this from your Sentry project settings
  dsn: SENTRY_DSN,

  // Environment name
  environment: SENTRY_ENVIRONMENT,

  // Tracing
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Session Replay
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Debug mode (logs to console)
  debug: SENTRY_ENVIRONMENT === 'development',

  // Control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/fly2any\.com/,
    /^https:\/\/.*\.fly2any\.com/,
  ],

  // Integrations
  integrations: [
    // Session Replay integration
    Sentry.replayIntegration({
      // Additional SDK configuration goes in here
      maskAllText: true,
      blockAllMedia: true,
    }),
    // Browser Tracing integration
    Sentry.browserTracingIntegration(),
  ],

  // Before send hook - filter or modify events before sending to Sentry
  beforeSend(event, hint) {
    // Filter out errors in development if needed
    if (SENTRY_ENVIRONMENT === 'development') {
      console.log('[Sentry] Event captured:', event);
    }

    // Don't send events if no DSN is configured
    if (!SENTRY_DSN) {
      return null;
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Random network errors
    'NetworkError',
    'Network request failed',
    // CORS errors
    'Cross-Origin Request Blocked',
    // ResizeObserver errors (benign)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],

  // Deny URLs - don't capture errors from these scripts
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    // Social media widgets
    /connect\.facebook\.net/i,
    /platform\.twitter\.com/i,
  ],
});
