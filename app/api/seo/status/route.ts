/**
 * SEO Agent Status API
 * GET: Retrieve agent memory state and stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadMemory, getStats, getOpenIssues } from '@/lib/seo/agent/memory';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.SEO_MONITOR_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [stats, openIssues, allEntries] = await Promise.all([
      getStats(),
      getOpenIssues(),
      loadMemory(),
    ]);

    const criticalIssues = openIssues.filter(e => e.priority === 'critical');
    const highIssues = openIssues.filter(e => e.priority === 'high');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      healthScore: Math.max(0, 100 - (stats.critical * 20) - (stats.high * 5)),
      summary: {
        critical: criticalIssues.length,
        high: highIssues.length,
        totalOpen: stats.open,
        totalFixed: stats.fixed,
      },
      criticalIssues: criticalIssues.slice(0, 10),
      recentIssues: allEntries
        .sort((a, b) => new Date(b.lastChecked).getTime() - new Date(a.lastChecked).getTime())
        .slice(0, 20),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
