
export const dynamic = 'force-dynamic';

/**
 * AI Hub Real-Time Stream (SSE)
 * 
 * Streams live dashboard updates to connected admin clients.
 * Updates frequency: 1 second (High Frequency for Live Activity)
 */

import { NextRequest } from 'next/server';
import { getSystemHealth, getDashboardMetrics, getLiveConversations } from '@/lib/ai/realtime-observability';
import { getAggregateStats } from '@/lib/ai/admin-observer';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a streaming response
  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`));

      // Loop to send updates
      const interval = setInterval(() => {
        try {
          // 1. Fetch Real-Time Data (Fast, In-Memory)
          const health = getSystemHealth();
          const liveConversations = getLiveConversations();
          const metrics = getDashboardMetrics();
          
          // 2. Prepare Payload
          const payload = {
            type: 'update',
            timestamp: Date.now(),
            data: {
              active_now: health.active_conversations,
              live_activity: liveConversations.slice(0, 10), // Top 10 most recent
              metrics: metrics,
              agents_online: health.agents_online,
              status: health.status
            }
          };

          // 3. Send Event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (error) {
          console.error('[SSE Stream] Error sending update:', error);
          controller.error(error);
          clearInterval(interval);
        }
      }, 1000); // 1 second update rate

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
