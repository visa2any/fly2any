/**
 * Growth Brain Admin API
 * GET /api/admin/growth-brain?userId=xxx
 * POST /api/admin/growth-brain/batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/middleware';
import { growthBrain, evaluateUser } from '@/lib/growth/ai-growth-brain';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const decision = await evaluateUser(userId);
    return NextResponse.json({ success: true, data: decision });
  } catch (error) {
    console.error('[Growth Brain] Error:', error);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { userIds, action } = await request.json();

    if (action === 'batch' && Array.isArray(userIds)) {
      const decisions = await growthBrain.batchEvaluate(userIds);
      return NextResponse.json({ success: true, data: decisions });
    }

    if (action === 'invalidate' && userIds) {
      for (const id of userIds) {
        growthBrain.invalidateCache(id);
      }
      return NextResponse.json({ success: true, message: 'Cache invalidated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Growth Brain] Error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
