/**
 * Aviation Intelligence Stats API
 * GET /api/aviation/stats
 *
 * Returns comprehensive statistics about the aviation knowledge base.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAviationStats } from '@/lib/aviation/aviation-intelligence-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const stats = await getAviationStats();

    if (!stats) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      stats,
      message: 'Aviation Intelligence System',
      description: 'Every flight search automatically captures and stores aviation data.',
    });
  } catch (error: any) {
    console.error('Aviation stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aviation stats', details: error.message },
      { status: 500 }
    );
  }
}
