/**
 * SSE (Server-Sent Events) Endpoint for Real-Time Notifications
 *
 * FREE real-time notification system using browser-native SSE.
 *
 * Usage:
 * - Admin Dashboard: EventSource('/api/notifications/sse?type=admin')
 * - Customer Chat: EventSource('/api/notifications/sse?type=customer&booking=FLY2A-XXXXXX')
 *
 * Events:
 * - booking_created: New booking (admin only)
 * - booking_ticketed: Ticket issued (customer + admin)
 * - booking_status_changed: Status update (all)
 * - heartbeat: Keep-alive ping (every 30s)
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import {
  registerSSEClient,
  unregisterSSEClient,
  getSSEStats,
} from '@/lib/notifications/notification-service';

const prisma = getPrismaClient();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Heartbeat interval (30 seconds)
const HEARTBEAT_INTERVAL = 30000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientType = searchParams.get('type') as 'admin' | 'customer' || 'customer';
  const bookingReference = searchParams.get('booking') || undefined;

  // Generate unique client ID
  const clientId = `sse_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Get user session for authentication
  let userId: string | undefined;
  let isAdmin = false;

  try {
    const session = await auth();
    userId = session?.user?.id;

    // SECURITY: Verify admin status from database - fail closed
    if (clientType === 'admin' && userId && prisma) {
      const adminUser = await prisma.adminUser.findUnique({
        where: { userId },
      });
      isAdmin = !!adminUser;

      // Block non-admin users from admin SSE connections
      if (!isAdmin) {
        console.warn(`[SSE] Non-admin user ${userId} attempted admin connection`);
      }
    }
  } catch (error) {
    // Continue without auth for customer connections
    // Admin connections will fail closed (isAdmin stays false)
  }

  // SECURITY: Reject admin SSE connections from non-admin users
  if (clientType === 'admin' && !isAdmin) {
    return new Response(
      JSON.stringify({ error: 'Admin access required for admin SSE connections' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Register this client
      registerSSEClient(clientId, clientType, controller, userId, bookingReference);

      // Send initial connection event
      const connectEvent = `id: ${clientId}\nevent: connected\ndata: ${JSON.stringify({
        clientId,
        type: clientType,
        bookingReference,
        timestamp: new Date().toISOString(),
        message: 'Connected to real-time notification stream',
      })}\n\n`;
      controller.enqueue(encoder.encode(connectEvent));

      // Send current stats (admin only)
      if (clientType === 'admin') {
        const stats = getSSEStats();
        const statsEvent = `event: stats\ndata: ${JSON.stringify({
          connectedClients: stats,
          timestamp: new Date().toISOString(),
        })}\n\n`;
        controller.enqueue(encoder.encode(statsEvent));
      }

      // Set up heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({
            timestamp: new Date().toISOString(),
            clientId,
          })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch (error) {
          // Connection is dead, clean up
          clearInterval(heartbeatInterval);
          unregisterSSEClient(clientId);
        }
      }, HEARTBEAT_INTERVAL);

      // Handle client disconnect (cleanup)
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unregisterSSEClient(clientId);
      });
    },

    cancel() {
      // Called when client disconnects
      unregisterSSEClient(clientId);
    },
  });

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
