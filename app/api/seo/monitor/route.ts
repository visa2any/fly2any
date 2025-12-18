/**
 * SEO Monitor API Endpoint
 * GET: Run health check
 * POST: Compare sitemap vs live
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateHealthReport,
  compareSitemapVsLive,
  dispatchAlert,
} from '@/lib/seo/agent/monitor';

const SITE_URL = 'https://www.fly2any.com';

// Sample URLs for quick check
const CRITICAL_URLS = [
  '/',
  '/flights',
  '/hotels',
  '/deals',
  '/tours',
  '/activities',
  '/transfers',
  '/world-cup-2026',
  '/flights/jfk-to-lax',
  '/flights/lax-to-jfk',
  '/flights/ord-to-mia',
];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // Simple auth check
  if (authHeader !== `Bearer ${process.env.SEO_MONITOR_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const urls = CRITICAL_URLS.map(path => `${SITE_URL}${path}`);
    const report = await generateHealthReport(urls);

    // Alert on critical issues
    if (report.metrics.errorRate > 5) {
      await dispatchAlert('critical', `High error rate: ${report.metrics.errorRate.toFixed(1)}%`, {
        totalUrls: report.totalUrls,
        errors: report.errors.length,
        topErrors: report.errors.slice(0, 5).map(e => e.url),
      });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.SEO_MONITOR_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const comparison = await compareSitemapVsLive();

    if (comparison.mismatches.length > 0) {
      await dispatchAlert('high', `Sitemap mismatches found: ${comparison.mismatches.length}`, {
        mismatches: comparison.mismatches.slice(0, 10),
      });
    }

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
