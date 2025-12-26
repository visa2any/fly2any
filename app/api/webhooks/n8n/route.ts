/**
 * N8N Webhook Callback Endpoint
 *
 * Receives automation results from N8N workflows:
 * - Auto-ticketing results
 * - Consolidator booking confirmations
 * - Supplier integrations
 * - Payment processing callbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { bookingStorage } from '@/lib/bookings/storage';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

// Webhook secret for validation
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || '';

interface N8NWebhookPayload {
  type: 'auto_ticket' | 'booking_confirm' | 'supplier_update' | 'payment_callback';
  bookingId: string;
  success: boolean;
  data?: {
    pnr?: string;
    eticketNumbers?: string[];
    consolidatorPrice?: number;
    consolidatorReference?: string;
    ticketedAt?: string;
    supplierStatus?: string;
    paymentStatus?: string;
  };
  error?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    // Validate webhook secret
    const authHeader = request.headers.get('x-n8n-secret') || request.headers.get('authorization');
    if (N8N_WEBHOOK_SECRET && authHeader !== N8N_WEBHOOK_SECRET && authHeader !== `Bearer ${N8N_WEBHOOK_SECRET}`) {
      console.warn('[N8N Webhook] Invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: N8NWebhookPayload = await request.json();
    console.log('[N8N Webhook] Received:', payload.type, payload.bookingId);

    switch (payload.type) {
      case 'auto_ticket':
        return handleAutoTicketCallback(payload);

      case 'booking_confirm':
        return handleBookingConfirmCallback(payload);

      case 'supplier_update':
        return handleSupplierUpdateCallback(payload);

      case 'payment_callback':
        return handlePaymentCallback(payload);

      default:
        return NextResponse.json({ error: 'Unknown webhook type' }, { status: 400 });
    }
  }, {
    category: ErrorCategory.EXTERNAL_API,
    severity: ErrorSeverity.HIGH
  });
}

async function handleAutoTicketCallback(payload: N8NWebhookPayload) {
  const { bookingId, success, data, error } = payload;

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }

  const booking = await bookingStorage.findById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (success && data?.pnr) {
    // Success: Update booking with PNR
    const customerPaid = booking.totalPrice || booking.price || 0;
    const profit = customerPaid - (data.consolidatorPrice || 0);

    await bookingStorage.update(bookingId, {
      status: 'confirmed',
      ticketingStatus: 'ticketed',
      airlineRecordLocator: data.pnr,
      eticketNumbers: data.eticketNumbers,
      consolidatorPrice: data.consolidatorPrice,
      consolidatorReference: data.consolidatorReference,
      consolidatorName: 'TheBestAgent.PRO',
      customerPrice: customerPaid,
      markup: profit,
      netProfit: profit,
      ticketedAt: data.ticketedAt || new Date().toISOString(),
      ticketingNotes: `Auto-ticketed via N8N automation`,
    });

    // Send confirmation notification
    try {
      const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
      await notifyTelegramAdmins(`
✅ *N8N AUTO-TICKET SUCCESS*

📋 *Booking:* \`${booking.bookingReference}\`
🎫 *PNR:* \`${data.pnr}\`
💰 *Consolidator:* $${data.consolidatorPrice}
💵 *Customer Paid:* $${customerPaid}
📈 *Profit:* $${profit.toFixed(2)}
      `.trim());
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Booking updated with ticketing info',
      pnr: data.pnr
    });
  } else {
    // Failed: Update status and notify
    await bookingStorage.update(bookingId, {
      ticketingStatus: 'failed',
      ticketingNotes: `N8N automation failed: ${error || 'Unknown error'}`,
    });

    try {
      const { notifyTelegramAdmins } = await import('@/lib/notifications/notification-service');
      await notifyTelegramAdmins(`
❌ *N8N AUTO-TICKET FAILED*

📋 *Booking:* \`${booking.bookingReference}\`
⚠️ *Error:* ${error || 'Unknown error'}

Please ticket manually.
      `.trim());
    } catch {}

    return NextResponse.json({
      success: false,
      error: error || 'Ticketing failed'
    });
  }
}

async function handleBookingConfirmCallback(payload: N8NWebhookPayload) {
  const { bookingId, success, data, error } = payload;

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }

  if (success) {
    await bookingStorage.update(bookingId, {
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      consolidatorReference: data?.consolidatorReference,
    });
  }

  return NextResponse.json({ success, processed: true });
}

async function handleSupplierUpdateCallback(payload: N8NWebhookPayload) {
  const { bookingId, data } = payload;

  if (bookingId && data?.supplierStatus) {
    await bookingStorage.update(bookingId, {
      supplierStatus: data.supplierStatus,
      lastSupplierUpdate: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true, processed: true });
}

async function handlePaymentCallback(payload: N8NWebhookPayload) {
  const { bookingId, success, data, error } = payload;

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }

  await bookingStorage.update(bookingId, {
    paymentStatus: success ? 'completed' : 'failed',
    paymentError: error,
    paymentProcessedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, processed: true });
}

// GET - Health check for N8N
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'fly2any-n8n-webhook',
    timestamp: new Date().toISOString(),
    webhookTypes: ['auto_ticket', 'booking_confirm', 'supplier_update', 'payment_callback'],
  });
}
