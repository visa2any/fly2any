/**
 * Mailgun Stats API
 *
 * Fetches real-time stats from Mailgun API
 * GET - Get aggregate stats and recent events
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.fly2any.com';

interface MailgunStats {
  accepted: { incoming: number; outgoing: number; total: number };
  delivered: { smtp: number; http: number; optimized: number; total: number };
  failed: { permanent: { total: number }; temporary: { total: number } };
  opened: { total: number };
  clicked: { total: number };
  complained: { total: number };
  unsubscribed: { total: number };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!MAILGUN_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'MAILGUN_API_KEY not configured',
        stats: null,
      });
    }

    const { searchParams } = new URL(request.url);
    const duration = searchParams.get('duration') || '7d'; // 1d, 7d, 30d
    const resolution = searchParams.get('resolution') || 'day'; // hour, day, month

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (duration) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Fetch aggregate stats
    const statsUrl = new URL(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/stats/total`);
    statsUrl.searchParams.set('event', 'accepted,delivered,failed,opened,clicked,complained,unsubscribed');
    statsUrl.searchParams.set('start', startDate.toISOString().split('T')[0]);
    statsUrl.searchParams.set('end', now.toISOString().split('T')[0]);
    statsUrl.searchParams.set('resolution', resolution);

    const statsRes = await fetch(statsUrl.toString(), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
      },
    });

    if (!statsRes.ok) {
      const errorText = await statsRes.text();
      console.error('[MAILGUN_STATS] API Error:', errorText);
      return NextResponse.json({
        success: false,
        error: `Mailgun API error: ${statsRes.status}`,
        details: errorText,
      });
    }

    const statsData = await statsRes.json();

    // Aggregate totals from stats array
    const totals = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
    };

    if (statsData.stats) {
      for (const stat of statsData.stats) {
        if (stat.accepted) totals.sent += stat.accepted.outgoing || 0;
        if (stat.delivered) totals.delivered += stat.delivered.total || 0;
        if (stat.opened) totals.opened += stat.opened.total || 0;
        if (stat.clicked) totals.clicked += stat.clicked.total || 0;
        if (stat.failed) totals.bounced += (stat.failed.permanent?.total || 0) + (stat.failed.temporary?.total || 0);
        if (stat.complained) totals.complained += stat.complained.total || 0;
        if (stat.unsubscribed) totals.unsubscribed += stat.unsubscribed.total || 0;
      }
    }

    // Calculate rates
    const openRate = totals.delivered > 0 ? ((totals.opened / totals.delivered) * 100).toFixed(1) : '0.0';
    const clickRate = totals.opened > 0 ? ((totals.clicked / totals.opened) * 100).toFixed(1) : '0.0';
    const bounceRate = totals.sent > 0 ? ((totals.bounced / totals.sent) * 100).toFixed(1) : '0.0';

    // Fetch recent events for activity feed
    const eventsUrl = new URL(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/events`);
    eventsUrl.searchParams.set('limit', '25');
    eventsUrl.searchParams.set('ascending', 'no');

    const eventsRes = await fetch(eventsUrl.toString(), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
      },
    });

    let recentEvents: any[] = [];
    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      recentEvents = (eventsData.items || []).map((item: any) => ({
        event: item.event,
        recipient: item.recipient,
        timestamp: item.timestamp,
        subject: item.message?.headers?.subject,
      }));
    }

    // Fetch domain info
    const domainRes = await fetch(`https://api.mailgun.net/v3/domains/${MAILGUN_DOMAIN}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
      },
    });

    let domainInfo = null;
    if (domainRes.ok) {
      const domainData = await domainRes.json();
      domainInfo = {
        domain: domainData.domain?.name,
        state: domainData.domain?.state,
        type: domainData.domain?.type,
        isVerified: domainData.domain?.state === 'active',
      };
    }

    return NextResponse.json({
      success: true,
      stats: {
        totals,
        rates: {
          openRate,
          clickRate,
          bounceRate,
        },
        period: {
          start: startDate.toISOString(),
          end: now.toISOString(),
          duration,
        },
        raw: statsData.stats || [],
      },
      recentEvents,
      domain: domainInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[MAILGUN_STATS] Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
