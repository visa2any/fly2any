/**
 * NEXT.JS INSTRUMENTATION
 *
 * This file is automatically loaded by Next.js before the server starts.
 * It's the perfect place to initialize global error handlers and monitoring.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Initializing server-side error handlers...');

    // Initialize process-level error handlers
    const { initProcessErrorHandlers } = await import('./lib/monitoring/process-error-handler');
    initProcessErrorHandlers();

    console.log('✅ [Instrumentation] Server-side error handlers initialized successfully');
  }

  // Edge runtime (optional - for edge functions)
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('[Instrumentation] Running in Edge runtime - skipping process handlers');
  }
}
