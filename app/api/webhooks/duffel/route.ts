/**
 * Duffel Webhooks API Route
 * Handles real-time webhook events from Duffel
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sql } from '@/lib/db/connection';
import { handleWebhookEvent, type DuffelWebhookEvent } from '@/lib/webhooks/event-handlers';

/**
 * Rate limiting storage (in-memory, use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 requests per minute per IP

/**
 * Verify webhook signature from Duffel
 * This ensures the webhook is genuinely from Duffel
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    console.warn('[Webhook] No signature provided');
    return false;
  }

  try {
    // Duffel uses HMAC SHA256 for webhook signatures
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('[Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  limit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - limit.count };
}

/**
 * Log webhook event to database
 */
async function logWebhookEvent(
  event: DuffelWebhookEvent,
  status: 'received' | 'processing' | 'processed' | 'failed',
  error?: string
): Promise<void> {
  try {
    if (!sql) {
      console.warn('Database not configured - skipping webhook event logging');
      return;
    }

    await sql`
      INSERT INTO webhook_events (
        id,
        event_type,
        event_data,
        status,
        error_message,
        received_at,
        processed_at
      ) VALUES (
        ${event.id},
        ${event.type},
        ${JSON.stringify(event)},
        ${status},
        ${error || null},
        ${event.occurred_at},
        ${status === 'processed' || status === 'failed' ? new Date().toISOString() : null}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        status = ${status},
        error_message = ${error || null},
        processed_at = ${status === 'processed' || status === 'failed' ? new Date().toISOString() : null}
    `;
  } catch (error) {
    console.error('[Webhook] Error logging event to database:', error);
    // Don't throw - logging failure shouldn't stop webhook processing
  }
}

/**
 * Check if event has already been processed (idempotency)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    if (!sql) {
      console.warn('Database not configured');
      return false;
    }

    const result = await sql`
      SELECT status FROM webhook_events WHERE id = ${eventId}
    `;

    if (result.length > 0) {
      const status = result[0].status;
      // If already processed successfully, skip
      return status === 'processed';
    }

    return false;
  } catch (error) {
    console.error('[Webhook] Error checking event status:', error);
    return false; // If we can't check, allow processing
  }
}

/**
 * POST handler for Duffel webhooks
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Get IP address for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      console.warn(`[Webhook] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60),
          },
        }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature (security)
    const webhookSecret = process.env.DUFFEL_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers.get('x-duffel-signature');
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

      if (!isValid) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      console.warn('[Webhook] DUFFEL_WEBHOOK_SECRET not configured - skipping signature verification');
    }

    // Parse event data
    let event: DuffelWebhookEvent;
    try {
      event = JSON.parse(rawBody);
    } catch (error) {
      console.error('[Webhook] Invalid JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate event structure
    if (!event.id || !event.type || !event.data) {
      console.error('[Webhook] Invalid event structure:', event);
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Received event: ${event.type} (ID: ${event.id})`);

    // Check idempotency - skip if already processed
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`[Webhook] Event ${event.id} already processed - skipping`);
      return NextResponse.json({
        received: true,
        message: 'Event already processed',
        eventId: event.id,
      });
    }

    // Log event as received
    await logWebhookEvent(event, 'received');

    // Process event asynchronously (don't block webhook response)
    // In production, consider using a queue system like Bull or AWS SQS
    processEventAsync(event);

    // Return 200 immediately to acknowledge receipt
    const processingTime = Date.now() - startTime;
    return NextResponse.json(
      {
        received: true,
        eventId: event.id,
        eventType: event.type,
        processingTime,
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        },
      }
    );

  } catch (error) {
    console.error('[Webhook] Error handling webhook:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Process event asynchronously
 * This allows us to return 200 to Duffel quickly
 */
async function processEventAsync(event: DuffelWebhookEvent): Promise<void> {
  try {
    // Update status to processing
    await logWebhookEvent(event, 'processing');

    // Handle the event
    await handleWebhookEvent(event);

    // Update status to processed
    await logWebhookEvent(event, 'processed');

    console.log(`[Webhook] Successfully processed event: ${event.id}`);

  } catch (error) {
    console.error(`[Webhook] Error processing event ${event.id}:`, error);

    // Log error to database
    await logWebhookEvent(
      event,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * GET handler - webhook health check
 */
export async function GET(req: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          service: 'duffel-webhooks',
          error: 'Database not configured',
        },
        { status: 503 }
      );
    }

    // Check database connection
    const dbCheck = await sql`SELECT 1 as health`;

    return NextResponse.json({
      status: 'healthy',
      service: 'duffel-webhooks',
      timestamp: new Date().toISOString(),
      database: dbCheck.length > 0 ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'duffel-webhooks',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

/**
 * OPTIONS handler - CORS preflight
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Duffel-Signature',
    },
  });
}
