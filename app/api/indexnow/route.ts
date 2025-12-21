/**
 * IndexNow API - Instant URL Reindexing
 *
 * Supports: Bing, Yandex, Seznam, Naver, IndexNow consortium
 * @see https://www.indexnow.org/
 */

import { NextRequest, NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'fly2any-indexnow-2025';

// IndexNow endpoints - submit to one, all consortium members receive
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; results: Record<string, unknown>[] }> {
  const payload: IndexNowPayload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10000), // IndexNow limit
  };

  const results = await Promise.allSettled(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { endpoint, status: response.status, ok: response.ok };
    })
  );

  return {
    success: results.some((r) => r.status === 'fulfilled' && r.value.ok),
    results: results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason })),
  };
}

// GET: Submit priority URLs for reindexing
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.ADMIN_API_KEY || 'fly2any-admin-2025'}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Priority URLs to reindex (high-value SEO pages)
  const priorityUrls = [
    // Core pages
    SITE_URL,
    `${SITE_URL}/flights`,
    `${SITE_URL}/hotels`,
    `${SITE_URL}/deals`,
    `${SITE_URL}/travel-planning`,
    `${SITE_URL}/solo-travel`,
    `${SITE_URL}/travel-insurance`,

    // Airlines (high impression)
    `${SITE_URL}/airlines/delta`,
    `${SITE_URL}/airlines/united`,
    `${SITE_URL}/airlines/american`,
    `${SITE_URL}/airlines/emirates`,
    `${SITE_URL}/airlines/spirit`,
    `${SITE_URL}/airlines/alaska`,
    `${SITE_URL}/airlines/frontier`,

    // Destinations (high impression)
    `${SITE_URL}/flights/to/oslo`,
    `${SITE_URL}/flights/to/berlin`,
    `${SITE_URL}/flights/to/munich`,
    `${SITE_URL}/flights/to/hawaii`,
    `${SITE_URL}/flights/to/las-vegas`,

    // World Cup 2026
    `${SITE_URL}/world-cup-2026`,
    `${SITE_URL}/world-cup-2026/packages`,
  ];

  try {
    const result = await submitToIndexNow(priorityUrls);
    return NextResponse.json({
      success: result.success,
      submitted: priorityUrls.length,
      timestamp: new Date().toISOString(),
      results: result.results,
    });
  } catch (error) {
    return NextResponse.json({ error: 'IndexNow submission failed', details: String(error) }, { status: 500 });
  }
}

// POST: Submit custom URLs for reindexing
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.ADMIN_API_KEY || 'fly2any-admin-2025'}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const urls: string[] = body.urls || [];

    if (!urls.length) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    // Validate URLs belong to our domain
    const validUrls = urls.filter((url) => url.startsWith(SITE_URL));

    if (!validUrls.length) {
      return NextResponse.json({ error: 'No valid URLs for this domain' }, { status: 400 });
    }

    const result = await submitToIndexNow(validUrls);
    return NextResponse.json({
      success: result.success,
      submitted: validUrls.length,
      timestamp: new Date().toISOString(),
      results: result.results,
    });
  } catch (error) {
    return NextResponse.json({ error: 'IndexNow submission failed', details: String(error) }, { status: 500 });
  }
}
