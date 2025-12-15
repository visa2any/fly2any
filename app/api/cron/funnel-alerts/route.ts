import { NextRequest, NextResponse } from 'next/server';
import { checkFunnelAlerts, getFunnelSummary } from '@/lib/analytics/funnel-alerts';

export const runtime = 'nodejs';

// Cron endpoint to check funnel drop-offs
// Configure in Vercel: every 30 minutes
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronHeader = request.headers.get('x-vercel-cron');

  if (!cronHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await checkFunnelAlerts();
    const summary = await getFunnelSummary();

    return NextResponse.json({
      success: true,
      hasAnomalies: result.hasAnomalies,
      anomalyCount: result.anomalies.length,
      summary: {
        searches: summary.totalSearches,
        bookings: summary.totalBookings,
        conversionRate: `${(summary.overallConversion * 100).toFixed(2)}%`,
      },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[FUNNEL_ALERTS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check funnel alerts' },
      { status: 500 }
    );
  }
}
