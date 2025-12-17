import { NextRequest, NextResponse } from 'next/server';

// POST /api/analytics/missing-city
// Logs when a user searches for a city not found in database
export async function POST(request: NextRequest) {
  try {
    const { query, source, timestamp } = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const logEntry = {
      query: query.trim(),
      source: source || 'hotel-search',
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      country: request.headers.get('x-vercel-ip-country') || 'unknown',
    };

    // Log to Vercel (appears in function logs)
    console.log('[MISSING_CITY]', JSON.stringify(logEntry));

    // Optional: Send to webhook (Slack, Discord, etc.)
    const webhookUrl = process.env.MISSING_CITY_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🏨 Missing City Search: "${query}" from ${logEntry.country}`,
          ...logEntry,
        }),
      }).catch(() => {}); // Fire and forget
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
