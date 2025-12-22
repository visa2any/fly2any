/**
 * Social Distribution Cron - Fly2Any Marketing OS
 * Processes queued social media posts on schedule
 *
 * Runs every 15 minutes via Vercel Cron
 * @route GET /api/cron/social-distribute
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentQueueManager } from '@/lib/social/content-queue-manager';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Retry helper for database operations
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const isDbError = error instanceof Error &&
        (error.message.includes('database') ||
         error.message.includes('P1001') ||
         error.message.includes('connection'));

      if (!isDbError || i === maxRetries - 1) throw error;

      const delay = delayMs * Math.pow(2, i);
      console.log(`[Retry] Attempt ${i + 1}/${maxRetries} failed, retrying in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError;
}

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const startTime = Date.now();

    // Verify cron authentication
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const token = authHeader?.replace('Bearer ', '');
    const isManualAuth = cronSecret && token === cronSecret;

    if (!isVercelCron && !isManualAuth) {
      console.error('[Social Cron] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Social Cron] Starting social distribution job');

    // Process queued content with retry
    const result = await withRetry(() => contentQueueManager.processQueue(10));

    // Get queue stats with retry
    const stats = await withRetry(() => contentQueueManager.getStats());

    const duration = Date.now() - startTime;

    console.log(`[Social Cron] Completed in ${duration}ms`, {
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
    });

    return NextResponse.json({
      success: true,
      duration,
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      queueStats: stats,
      results: result.results,
    });

  }, { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.HIGH });
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
