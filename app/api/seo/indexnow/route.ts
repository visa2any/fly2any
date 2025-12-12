/**
 * IndexNow API Endpoint
 * POST /api/seo/indexnow - Submit URLs for instant indexing
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitUrl, submitUrls, onContentPublished } from '@/lib/seo/indexnow';

// Simple admin check (enhance with proper auth)
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY;
  return authHeader === `Bearer ${adminKey}`;
}

export async function POST(request: NextRequest) {
  // Auth check
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, url, urls, type, slug } = body;

    switch (action) {
      case 'submit-url':
        if (!url) {
          return NextResponse.json({ error: 'URL required' }, { status: 400 });
        }
        const singleResult = await submitUrl(url);
        return NextResponse.json({ success: true, results: singleResult });

      case 'submit-urls':
        if (!urls || !Array.isArray(urls)) {
          return NextResponse.json({ error: 'URLs array required' }, { status: 400 });
        }
        const batchResult = await submitUrls(urls);
        return NextResponse.json({ success: true, ...batchResult });

      case 'content-published':
        if (!type || !slug) {
          return NextResponse.json({ error: 'Type and slug required' }, { status: 400 });
        }
        const contentResult = await onContentPublished(type, slug);
        return NextResponse.json(contentResult);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[IndexNow API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'IndexNow',
    endpoints: ['Bing', 'Yandex', 'IndexNow.org'],
  });
}
