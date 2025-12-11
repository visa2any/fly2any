import { NextRequest, NextResponse } from 'next/server';
import { airlineKnowledgeBase } from '@/lib/airlines/airline-knowledge-base';
import { requireAdmin } from '@/lib/admin/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/airlines/knowledge - Search airline knowledge base
 *
 * Query Parameters:
 * - query: Search term
 * - airline: Get knowledge for specific airline (IATA code)
 * - limit: Max results (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const airline = searchParams.get('airline');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (airline) {
      const knowledge = await airlineKnowledgeBase.getByAirline(airline);
      return NextResponse.json({
        success: true,
        airline,
        entries: knowledge,
      });
    }

    if (query) {
      const results = await airlineKnowledgeBase.search(query, limit);
      return NextResponse.json({
        success: true,
        query,
        results,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide query or airline parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error searching knowledge:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/airlines/knowledge - Generate knowledge base entries
 *
 * Body:
 * - action: 'generate_all'
 */
export async function POST(request: NextRequest) {
  // Admin only
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'generate_all') {
      const result = await airlineKnowledgeBase.generateAll();
      return NextResponse.json({
        success: true,
        action: 'generate_all',
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in knowledge POST:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    );
  }
}
