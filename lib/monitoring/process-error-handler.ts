/**
 * PROCESS-LEVEL ERROR HANDLER - LAST LINE OF DEFENSE
 *
 * Catches ALL unhandled errors in the Node.js process:
 * - Uncaught exceptions
 * - Unhandled promise rejections
 * - Worker thread errors
 *
 * This is the ABSOLUTE LAST safety net for server-side errors!
 *
 * @version 1.0.0 - Production ready
 */

import { alertCustomerError } from './customer-error-alerts';
import { ErrorCategory, ErrorSeverity } from './global-error-handler';

let isShuttingDown = false;

/**
 * Initialize process-level error handlers
 *
 * Call this ONCE at application startup (e.g., in server.ts or instrumentation.ts)
 */
export function initProcessErrorHandlers() {
  if (typeof process === 'undefined') {
    console.warn('[Process Error Handler] Not running in Node.js environment');
    return;
  }

  console.log('[Process Error Handler] Initializing process-level error handlers...');

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error: Error, origin: string) => {
    console.error('🚨 [CRITICAL] UNCAUGHT EXCEPTION:', error);
    console.error('   Origin:', origin);
    console.error('   Stack:', error.stack);

    // Send CRITICAL alert
    try {
      await alertCustomerError({
        errorMessage: `UNCAUGHT EXCEPTION: ${error.message}`,
        errorCode: 'UNCAUGHT_EXCEPTION',
        errorStack: error.stack,
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.CRITICAL,
        endpoint: 'PROCESS_UNCAUGHT_EXCEPTION',
      }, {
        priority: ErrorSeverity.CRITICAL,
        sendTelegram: true,
        sendEmail: true,
        sendSentry: true,
      });
    } catch (alertError) {
      console.error('Failed to send uncaught exception alert:', alertError);
    }

    // In production, gracefully shutdown
    // In development, just log and continue
    if (process.env.NODE_ENV === 'production' && !isShuttingDown) {
      console.error('🚨 [CRITICAL] Initiating graceful shutdown...');
      isShuttingDown = true;

      // Give alerts time to send (5 seconds)
      setTimeout(() => {
        console.error('🚨 [CRITICAL] Shutdown timeout reached - forcing exit');
        process.exit(1);
      }, 5000);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason: any, promise: Promise<any>) => {
    console.error('🚨 [CRITICAL] UNHANDLED PROMISE REJECTION:', reason);
    console.error('   Promise:', promise);

    const error = reason instanceof Error ? reason : new Error(String(reason));

    // Send CRITICAL alert
    try {
      await alertCustomerError({
        errorMessage: `UNHANDLED REJECTION: ${error.message}`,
        errorCode: 'UNHANDLED_REJECTION',
        errorStack: error.stack,
        category: ErrorCategory.UNKNOWN,
        severity: ErrorSeverity.CRITICAL,
        endpoint: 'PROCESS_UNHANDLED_REJECTION',
      }, {
        priority: ErrorSeverity.CRITICAL,
        sendTelegram: true,
        sendEmail: true,
        sendSentry: true,
      });
    } catch (alertError) {
      console.error('Failed to send unhandled rejection alert:', alertError);
    }

    // In production, consider this critical but don't shutdown
    // (Node.js 15+ doesn't terminate on unhandled rejections by default)
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 [CRITICAL] Unhandled promise rejection detected - process continues but this should be fixed!');
    }
  });

  // Handle warning events
  process.on('warning', (warning: Error) => {
    console.warn('[Process Warning]', warning.name, warning.message);
    console.warn('   Stack:', warning.stack);

    // Log warnings but don't send alerts (too noisy)
    // You can enable this if you want to track warnings
    /*
    alertCustomerError({
      errorMessage: `Process Warning: ${warning.message}`,
      errorCode: 'PROCESS_WARNING',
      errorStack: warning.stack,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.LOW,
      endpoint: 'PROCESS_WARNING',
    }, {
      priority: ErrorSeverity.LOW,
      sendTelegram: false,
      sendEmail: false,
      sendSentry: true,
    }).catch(() => {});
    */
  });

  // Handle process exit
  process.on('exit', (code: number) => {
    console.log(`[Process] Exiting with code: ${code}`);

    // Don't send alerts on graceful shutdown (code 0)
    if (code !== 0 && !isShuttingDown) {
      console.error(`🚨 [CRITICAL] Process exiting with non-zero code: ${code}`);
    }
  });

  // Handle SIGTERM (graceful shutdown signal)
  process.on('SIGTERM', async () => {
    console.log('[Process] SIGTERM received - initiating graceful shutdown');
    isShuttingDown = true;

    // Don't send alert for intentional shutdown
    // Just clean up and exit
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', async () => {
    console.log('[Process] SIGINT received - initiating graceful shutdown');
    isShuttingDown = true;

    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });

  console.log('✅ [Process Error Handler] All handlers initialized successfully');
}

/**
 * Manually report a critical error
 *
 * Use this when you detect a critical condition that requires immediate attention
 */
export async function reportCriticalError(
  message: string,
  error?: Error,
  context?: Record<string, any>
) {
  console.error('🚨 [CRITICAL ERROR REPORTED]', message);
  if (error) {
    console.error('   Error:', error);
  }
  if (context) {
    console.error('   Context:', context);
  }

  await alertCustomerError({
    errorMessage: message,
    errorCode: 'MANUAL_CRITICAL_ERROR',
    errorStack: error?.stack,
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.CRITICAL,
    endpoint: 'MANUAL_ERROR_REPORT',
    ...context,
  }, {
    priority: ErrorSeverity.CRITICAL,
    sendTelegram: true,
    sendEmail: true,
    sendSentry: true,
  });
}
