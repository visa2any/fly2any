/**
 * SEO MONITOR AGENT
 * Automated health monitoring for 100K+ URLs
 */

import { unstable_cache } from 'next/cache';

const SITE_URL = 'https://www.fly2any.com';

export interface URLCheckResult {
  url: string;
  status: number;
  responseTime: number;
  canonical: string | null;
  hasSchema: boolean;
  error?: string;
}

export interface SEOHealthReport {
  timestamp: Date;
  totalUrls: number;
  healthy: number;
  errors: URLCheckResult[];
  warnings: URLCheckResult[];
  metrics: {
    avgResponseTime: number;
    errorRate: number;
    schemacoverage: number;
  };
}

// Check single URL
async function checkUrl(url: string): Promise<URLCheckResult> {
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Fly2Any-SEO-Monitor/1.0' },
      redirect: 'manual',
    });

    // Get full page for schema check if 200
    let hasSchema = false;
    let canonical: string | null = null;

    if (res.status === 200) {
      const html = await fetch(url).then(r => r.text());
      hasSchema = html.includes('application/ld+json');
      const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
      canonical = canonicalMatch?.[1] || null;
    }

    return {
      url,
      status: res.status,
      responseTime: Date.now() - start,
      canonical,
      hasSchema,
    };
  } catch (error: any) {
    return {
      url,
      status: 0,
      responseTime: Date.now() - start,
      canonical: null,
      hasSchema: false,
      error: error.message,
    };
  }
}

// Batch check with concurrency control
export async function batchCheckUrls(
  urls: string[],
  concurrency = 10
): Promise<URLCheckResult[]> {
  const results: URLCheckResult[] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(checkUrl));
    results.push(...batchResults);

    // Rate limit
    await new Promise(r => setTimeout(r, 100));
  }

  return results;
}

// Generate health report
export async function generateHealthReport(urls: string[]): Promise<SEOHealthReport> {
  const results = await batchCheckUrls(urls);

  const errors = results.filter(r => r.status >= 400 || r.status === 0);
  const warnings = results.filter(r => r.status >= 300 && r.status < 400);
  const healthy = results.filter(r => r.status === 200);

  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const schemaCount = results.filter(r => r.hasSchema).length;

  return {
    timestamp: new Date(),
    totalUrls: urls.length,
    healthy: healthy.length,
    errors,
    warnings,
    metrics: {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: (errors.length / urls.length) * 100,
      schemacoverage: (schemaCount / healthy.length) * 100,
    },
  };
}

// Compare sitemap vs live
export async function compareSitemapVsLive(): Promise<{
  inSitemapOnly: string[];
  liveOnly: string[];
  mismatches: { url: string; sitemapStatus: string; liveStatus: number }[];
}> {
  // Fetch sitemap
  const sitemapRes = await fetch(`${SITE_URL}/sitemap.xml`);
  const sitemapXml = await sitemapRes.text();

  // Extract URLs
  const urlMatches = sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g);
  const sitemapUrls = Array.from(urlMatches, m => m[1]);

  // Check sample (full check would be scheduled)
  const sampleUrls = sitemapUrls.slice(0, 100);
  const results = await batchCheckUrls(sampleUrls);

  const mismatches = results
    .filter(r => r.status !== 200)
    .map(r => ({
      url: r.url,
      sitemapStatus: 'listed',
      liveStatus: r.status,
    }));

  return {
    inSitemapOnly: [],
    liveOnly: [],
    mismatches,
  };
}

// Alert dispatcher
export async function dispatchAlert(
  severity: 'critical' | 'high' | 'medium' | 'low',
  message: string,
  details: object
) {
  const alert = {
    severity,
    message,
    details,
    timestamp: new Date().toISOString(),
  };

  // Slack webhook
  if (process.env.SLACK_WEBHOOK_URL && (severity === 'critical' || severity === 'high')) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 SEO Alert [${severity.toUpperCase()}]: ${message}`,
        attachments: [{
          color: severity === 'critical' ? '#ff0000' : '#ffcc00',
          fields: Object.entries(details).map(([k, v]) => ({
            title: k,
            value: String(v),
            short: true,
          })),
        }],
      }),
    });
  }

  // Log to DB (implement with your DB)
  console.log('[SEO-ALERT]', JSON.stringify(alert));

  return alert;
}
