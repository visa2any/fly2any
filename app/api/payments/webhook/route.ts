import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/payment-service';
import { headers } from 'next/headers';

/**
 * Stripe Webhook Handler
 *
 * Handles webhook events from Stripe for payment updates
 * This endpoint must be registered in your Stripe dashboard
 *
 * POST /api/payments/webhook
 *
 * Webhook Events Handled:
 * - payment_intent.succeeded: Payment completed successfully
 * - payment_intent.payment_failed: Payment failed
 * - payment_intent.requires_action: Payment requires 3D Secure
 * - payment_intent.canceled: Payment was canceled
 * - charge.refunded: Refund processed
 * - charge.dispute.created: Chargeback initiated
 * - charge.dispute.closed: Dispute resolved
 *
 * IMPORTANT: This endpoint must be publicly accessible (no authentication)
 * Security is handled through Stripe webhook signature verification
 */

// CRITICAL FIX: Idempotency cache to prevent duplicate event processing
// Note: In production, use Redis or database for persistence across instances
const processedEvents = new Map<string, number>();
const MAX_CACHE_SIZE = 1000;
const EVENT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function isEventProcessed(eventId: string): boolean {
  const timestamp = processedEvents.get(eventId);
  if (timestamp && Date.now() - timestamp < EVENT_EXPIRY_MS) {
    return true;
  }
  return false;
}

function markEventProcessed(eventId: string): void {
  // Clean up old entries if cache is too large
  if (processedEvents.size >= MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [id, ts] of processedEvents.entries()) {
      if (now - ts > EVENT_EXPIRY_MS) {
        processedEvents.delete(id);
      }
    }
  }
  processedEvents.set(eventId, Date.now());
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body as text for signature verification
    const body = await request.text();

    // Get Stripe signature from headers
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found in headers');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    console.log('📨 Received webhook event');
    console.log(`   Signature: ${signature.substring(0, 20)}...`);

    // Verify webhook signature and construct event
    let event;
    try {
      event = paymentService.verifyWebhookSignature(body, signature);
      console.log('✅ Webhook signature verified');
      console.log(`   Event Type: ${event.type}`);
      console.log(`   Event ID: ${event.id}`);
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // CRITICAL FIX: Idempotency check - prevent duplicate processing
    if (isEventProcessed(event.id)) {
      console.log(`⏭️ Event ${event.id} already processed, skipping`);
      return NextResponse.json(
        { received: true, skipped: true, reason: 'Already processed' },
        { status: 200 }
      );
    }

    // Handle the webhook event
    try {
      await paymentService.handleWebhookEvent(event);
      markEventProcessed(event.id); // Mark as processed after success
      console.log('✅ Webhook event processed successfully');
    } catch (err: any) {
      console.error('❌ Error handling webhook event:', err);
      // Still return 200 so Stripe doesn't retry
      // Log the error for investigation
      return NextResponse.json(
        {
          received: true,
          error: 'Event processing failed',
          message: err.message,
        },
        { status: 200 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        received: true,
        eventId: event.id,
        eventType: event.type,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error);

    // Return 500 for unexpected errors
    return NextResponse.json(
      {
        error: 'WEBHOOK_HANDLER_ERROR',
        message: error.message || 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS (Stripe may send preflight requests)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  });
}
