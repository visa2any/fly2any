/**
 * Feedback API — Micro-feedback collection endpoint
 */
import { NextResponse } from 'next/server';
import { recordFeedback, captureBehavioralSignal } from '@/lib/ai/ux-intelligence';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page, component, rating, comment, trigger } = body;

    // Generate session ID from headers or use anonymous
    const sessionId = request.headers.get('x-session-id') || `anon_${Date.now()}`;

    // Record feedback
    const entry = recordFeedback(
      sessionId,
      page || 'unknown',
      rating,
      trigger || 'manual',
      component,
      comment
    );

    // Also capture as behavioral signal if negative
    if (rating === 1) {
      captureBehavioralSignal(sessionId, page, { type: 'drop_off', element: component });
    }

    return NextResponse.json({ success: true, feedback_id: entry.feedback_id });
  } catch (error) {
    console.error('[Feedback API]', error);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}
