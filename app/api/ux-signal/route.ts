/**
 * UX Signal API — Captures behavioral signals from client
 */
import { NextResponse } from 'next/server';
import {
  captureBehavioralSignal,
  captureTechnicalError,
  captureEmotionalSignal,
} from '@/lib/ai/ux-intelligence';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, page, type, data } = body;

    if (!session_id || !page || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    switch (type) {
      case 'rage_click':
      case 'hesitation':
      case 'form_loop':
      case 'scroll_stall':
        captureBehavioralSignal(session_id, page, {
          type: type === 'form_loop' ? 'form_correction_loop' : type,
          element: data?.element,
          click_count: data?.click_count,
          duration_ms: data?.duration_ms,
          corrections: data?.corrections,
        });
        break;

      case 'drop_off':
        captureBehavioralSignal(session_id, page, {
          type: 'drop_off',
          element: data?.step,
          duration_ms: data?.time_on_page_ms,
        });
        break;

      case 'error':
        captureTechnicalError(session_id, page, {
          type: data?.type === 'unhandled_promise' ? 'js_error' : 'js_error',
          message: data?.message || 'Unknown error',
          stack: data?.stack,
        });
        break;

      default:
        captureEmotionalSignal(session_id, page, 'frustration', `Unknown signal: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[UX Signal API]', error);
    return NextResponse.json({ error: 'Failed to process signal' }, { status: 500 });
  }
}
