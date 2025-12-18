/**
 * SEO Monitor Cron Job
 *
 * Runs every 6 hours to:
 * - Check URL health (404s, 5xx)
 * - Verify flight route pages are live
 * - Monitor Core Web Vitals
 * - Detect sitemap mismatches
 * - Send alerts for critical issues
 *
 * Schedule: Every 6 hours (see vercel.json)
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateHealthReport, dispatchAlert } from '@/lib/seo/agent/monitor';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SITE_URL = 'https://www.fly2any.com';

// Critical URLs to always check
const CRITICAL_URLS = [
  '/',
  '/flights',
  '/hotels',
  '/deals',
  '/tours',
  '/activities',
  '/transfers',
  '/world-cup-2026',
];

// Top flight routes (the programmatic SEO pages)
const TOP_ROUTES = [
  'jfk-to-lax', 'lax-to-jfk', 'ord-to-mia', 'atl-to-las', 'dfw-to-sfo',
  'jfk-to-lhr', 'lax-to-nrt', 'sfo-to-jfk', 'mia-to-jfk', 'bos-to-lax',
  'den-to-lax', 'sea-to-lax', 'phx-to-lax', 'ewr-to-lax', 'iah-to-lax',
];

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    console.log('🔍 Running SEO Health Monitor...');

    // Build URL list
    const allUrls = [
      ...CRITICAL_URLS.map(p => `${SITE_URL}${p}`),
      ...TOP_ROUTES.map(r => `${SITE_URL}/flights/${r}`),
    ];

    // Run health check
    const report = await generateHealthReport(allUrls);

    // Check for critical issues
    const is404 = report.errors.filter(e => e.status === 404);
    const is5xx = report.errors.filter(e => e.status >= 500);
    const isRedirect = report.warnings.filter(e => e.status >= 300 && e.status < 400);

    // Alert on 404s (especially flight routes)
    if (is404.length > 0) {
      const routePages404 = is404.filter(e => e.url.includes('/flights/'));
      if (routePages404.length > 0) {
        await dispatchAlert('critical', `Flight route pages returning 404: ${routePages404.length}`, {
          urls: routePages404.map(e => e.url),
          action: 'Check next.config.mjs redirects and dynamicParams',
        });
      }
    }

    // Alert on server errors
    if (is5xx.length > 0) {
      await dispatchAlert('critical', `Server errors detected: ${is5xx.length} URLs`, {
        urls: is5xx.map(e => e.url),
      });
    }

    // Alert on slow responses
    if (report.metrics.avgResponseTime > 2000) {
      await dispatchAlert('high', `Slow response times: ${report.metrics.avgResponseTime}ms avg`, {
        threshold: '2000ms',
        current: `${report.metrics.avgResponseTime}ms`,
      });
    }

    // Summary
    const summary = {
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`,
      urlsChecked: allUrls.length,
      healthy: report.healthy,
      errors: report.errors.length,
      warnings: report.warnings.length,
      metrics: report.metrics,
      breakdown: {
        '404s': is404.length,
        '5xx': is5xx.length,
        'redirects': isRedirect.length,
      },
    };

    console.log('📊 SEO Health Summary:', JSON.stringify(summary, null, 2));

    return NextResponse.json({
      success: true,
      summary,
      errors: report.errors.slice(0, 10),
    });
  } catch (error) {
    console.error('SEO Monitor Cron Error:', error);
    await dispatchAlert('critical', `SEO Monitor failed: ${String(error)}`, {});
    return NextResponse.json(
      { error: 'SEO monitoring failed', details: String(error) },
      { status: 500 }
    );
  }
}
