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
    // Global unhandled error handler for Node.js
    process.on('uncaughtException', (error) => {
      console.error('[UNCAUGHT EXCEPTION]', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      // In production: send to Sentry/monitoring service
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[UNHANDLED REJECTION]', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      // In production: send to Sentry/monitoring service
    });

    console.log('[Instrumentation] Server-side error handlers registered');
  }

  // Edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('[Instrumentation] Edge runtime initialized');
  }
}
