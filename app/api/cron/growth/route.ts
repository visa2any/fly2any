/**
 * Growth Cron Job API
 *
 * Runs automated growth tasks:
 * - Daily content generation
 * - Price alert checks
 * - SEO audits
 * - Social posting
 *
 * Call via Vercel Cron or external scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDailyContentJob } from '@/lib/agents/content-agent';
import { runSEOAudit, generateSEOReport } from '@/lib/agents/seo-auditor';

// Verify cron secret
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Auth check
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const task = request.nextUrl.searchParams.get('task') || 'all';

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    task,
  };

  try {
    switch (task) {
      case 'content':
        results.content = await runDailyContentJob();
        break;

      case 'seo':
        results.seo = await runSEOAudit();
        break;

      case 'seo-report':
        results.report = await generateSEOReport();
        break;

      case 'all':
        results.content = await runDailyContentJob();
        results.seo = await runSEOAudit();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown task: ${task}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('[Cron Growth Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { task, data } = body;

  // Handle specific triggered tasks
  switch (task) {
    case 'price-drop':
      // Handle price drop content generation
      const { generateOnDemand } = await import('@/lib/agents/content-agent');
      const job = await generateOnDemand('price_drop', data);
      return NextResponse.json({ success: true, job });

    default:
      return NextResponse.json({ error: 'Unknown task' }, { status: 400 });
  }
}
