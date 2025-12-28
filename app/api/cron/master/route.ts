/**
 * Master Cron Controller - Fly2Any
 * Single endpoint that orchestrates all cron jobs
 * Called by N8N every 1 hour - handles different schedules internally
 *
 * @route GET /api/cron/master
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

interface CronJob {
  name: string;
  path: string;
  schedule: 'hourly' | '4h' | '6h' | '12h' | 'daily-2am' | 'daily-3am';
  enabled: boolean;
}

const CRON_JOBS: CronJob[] = [
  // Hourly jobs
  { name: 'Commission Lifecycle', path: '/api/cron/process-commission-lifecycle', schedule: 'hourly', enabled: true },

  // Every 4 hours
  { name: 'Social Distribute', path: '/api/cron/social-distribute', schedule: '4h', enabled: true },
  { name: 'ML Prefetch', path: '/api/ml/prefetch', schedule: '4h', enabled: true },
  { name: 'Price Alerts', path: '/api/cron/check-price-alerts', schedule: '4h', enabled: true },
  { name: 'Price Monitor', path: '/api/cron/price-monitor', schedule: '4h', enabled: true },

  // Every 6 hours
  { name: 'SEO Monitor', path: '/api/cron/seo-monitor', schedule: '6h', enabled: true },
  { name: 'Precompute Routes', path: '/api/cron/precompute-routes', schedule: '6h', enabled: true },

  // Every 12 hours (6am, 6pm)
  { name: 'Content Generate', path: '/api/cron/content-generate', schedule: '12h', enabled: true },

  // Daily at 2am UTC
  { name: 'SEO Generate', path: '/api/cron/seo-generate', schedule: 'daily-2am', enabled: true },

  // Daily at 3am UTC
  { name: 'Affiliate Commissions', path: '/api/cron/process-affiliate-commissions', schedule: 'daily-3am', enabled: true },
  { name: 'Scheduled Tasks', path: '/api/cron/scheduled-tasks', schedule: 'daily-3am', enabled: true },
];

function shouldRun(schedule: CronJob['schedule'], hour: number): boolean {
  switch (schedule) {
    case 'hourly':
      return true;
    case '4h':
      return hour % 4 === 0;
    case '6h':
      return hour % 6 === 0;
    case '12h':
      return hour === 6 || hour === 18;
    case 'daily-2am':
      return hour === 2;
    case 'daily-3am':
      return hour === 3;
    default:
      return false;
  }
}

async function executeCron(job: CronJob, baseUrl: string, authHeader: string): Promise<{
  name: string;
  success: boolean;
  duration: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl}${job.path}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(60000), // 60s timeout per job
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      return { name: job.name, success: false, duration, error: `HTTP ${response.status}` };
    }

    return { name: job.name, success: true, duration };
  } catch (error) {
    return {
      name: job.name,
      success: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const startTime = Date.now();

    // Auth check
    const authHeader = request.headers.get('authorization') || '';
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const isManualAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !isManualAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current hour in UTC
    const now = new Date();
    const hour = now.getUTCHours();

    // Filter jobs that should run this hour
    const jobsToRun = CRON_JOBS.filter(job => job.enabled && shouldRun(job.schedule, hour));

    if (jobsToRun.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No jobs scheduled for this hour',
        hour,
        duration: Date.now() - startTime,
      });
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

    console.log(`[Master Cron] Running ${jobsToRun.length} jobs at hour ${hour}`);

    // Execute jobs sequentially to avoid overwhelming the DB
    const results: Awaited<ReturnType<typeof executeCron>>[] = [];

    for (const job of jobsToRun) {
      console.log(`[Master Cron] Starting: ${job.name}`);
      const result = await executeCron(job, baseUrl, authHeader);
      results.push(result);
      console.log(`[Master Cron] ${job.name}: ${result.success ? 'OK' : 'FAILED'} (${result.duration}ms)`);

      // Small delay between jobs to prevent DB overload
      if (jobsToRun.indexOf(job) < jobsToRun.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`[Master Cron] Complete: ${succeeded} succeeded, ${failed} failed`);

    return NextResponse.json({
      success: failed === 0,
      hour,
      totalDuration: Date.now() - startTime,
      summary: { total: results.length, succeeded, failed },
      results,
    });

  }, { category: ErrorCategory.EXTERNAL_API, severity: ErrorSeverity.HIGH });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
