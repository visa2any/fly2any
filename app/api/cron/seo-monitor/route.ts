/**
 * SEO Monitor Cron Job
 *
 * Runs daily to:
 * - Detect anomalies
 * - Generate suggestions
 * - Send alerts for critical issues
 * - Track KPI trends
 *
 * Schedule: Daily at 6 AM UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSEOEngine, getSEOKPIs } from '@/lib/seo/ai-seo-engine';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🔍 Running AI SEO Monitor...');

    // Full analysis
    const analysis = await aiSEOEngine.analyze();
    const kpis = await getSEOKPIs();

    // Critical alerts
    const criticalAnomalies = analysis.anomalies.filter(a => a.severity === 'critical');

    if (criticalAnomalies.length > 0) {
      console.log(`⚠️ ${criticalAnomalies.length} critical SEO issues detected!`);
      // TODO: Send Telegram/Email alert
      // await sendSEOAlert(criticalAnomalies);
    }

    // Log summary
    const summary = {
      timestamp: new Date().toISOString(),
      score: analysis.score,
      anomalies: analysis.anomalies.length,
      criticalIssues: criticalAnomalies.length,
      suggestions: analysis.suggestions.length,
      quickWins: analysis.quickWins.length,
      kpis: {
        organicTraffic: kpis.organicTraffic.value,
        avgCTR: kpis.avgCTR.value,
        top10Keywords: kpis.top10Keywords.value,
      },
    };

    console.log('📊 SEO Monitor Summary:', JSON.stringify(summary, null, 2));

    return NextResponse.json({
      success: true,
      summary,
      topPrioritySuggestions: analysis.suggestions.slice(0, 3),
    });
  } catch (error) {
    console.error('SEO Monitor Cron Error:', error);
    return NextResponse.json(
      { error: 'SEO monitoring failed', details: String(error) },
      { status: 500 }
    );
  }
}
