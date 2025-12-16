/**
 * AI SEO Engine API
 *
 * Endpoints for SEO analysis, anomaly detection, and auto-optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSEOEngine, getSEOKPIs, prioritizeSEOTasks } from '@/lib/seo/ai-seo-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'analyze';

    switch (action) {
      case 'analyze': {
        const result = await aiSEOEngine.analyze();
        result.suggestions = prioritizeSEOTasks(result.suggestions);
        return NextResponse.json(result);
      }

      case 'kpis': {
        const kpis = await getSEOKPIs();
        return NextResponse.json(kpis);
      }

      case 'quick-wins': {
        const quickWins = await aiSEOEngine.findQuickWins();
        return NextResponse.json({ quickWins });
      }

      case 'competitor': {
        const query = searchParams.get('query') || 'cheap flights';
        const insights = await aiSEOEngine.analyzeCompetitor(query);
        return NextResponse.json({ insights });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI SEO Engine error:', error);
    return NextResponse.json(
      { error: 'SEO analysis failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, pageUrl } = body;

    if (action === 'auto-optimize' && pageUrl) {
      const result = await aiSEOEngine.autoOptimize(pageUrl);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('AI SEO Engine POST error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
