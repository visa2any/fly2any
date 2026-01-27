import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Tawk.to Webhook Handler
 * 
 * Receives chat events from Tawk.to and stores them in Supabase
 * Endpoint: POST /api/webhooks/tawk
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Optional: Verify webhook signature (recommended for production)
    // const signature = request.headers.get('x-tawk-signature');
    // const webhookSecret = process.env.TAWK_WEBHOOK_SECRET;
    // if (webhookSecret && !verifySignature(payload, signature, webhookSecret)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const {
      event,
      chatId,
      time,
      visitor,
      message,
      requester,
      property,
    } = payload;

    console.log(`[Tawk Webhook] Event: ${event}, ChatID: ${chatId}`);

    // Handle chat:end event (stores full transcript)
    if (event === 'chat:end' && chatId) {
      // Extract visitor information
      const visitorName = visitor?.name || 'Anonymous';
      const visitorEmail = visitor?.email || null;
      const userId = visitor?.userId || null; // From custom attributes

      // Extract messages (if available in payload)
      const messages = payload.messages || [];

      await prisma.$executeRawUnsafe(`
        INSERT INTO chat_transcripts (
          chat_id,
          user_id,
          visitor_name,
          visitor_email,
          messages,
          started_at,
          ended_at
        ) VALUES (
          $1, $2, $3, $4, $5::jsonb, $6, $7
        )
        ON CONFLICT (chat_id) DO UPDATE SET
          ended_at = EXCLUDED.ended_at,
          messages = EXCLUDED.messages
      `,
      chatId,
      userId,
      visitorName,
      visitorEmail,
      JSON.stringify(messages),
      new Date(time?.start || Date.now()),
      new Date(time?.end || Date.now())
    );

      console.log(`[Tawk Webhook] Saved chat transcript: ${chatId}`);
    }

    // Handle ticket:create event (optional)
    if (event === 'ticket:create') {
      console.log(`[Tawk Webhook] New ticket created: ${payload.ticketId}`);
      // You can add ticket handling logic here if needed
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('[Tawk Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Optional: Signature verification helper
// function verifySignature(payload: any, signature: string | null, secret: string): boolean {
//   if (!signature) return false;
//   const crypto = require('crypto');
//   const computedSignature = crypto
//     .createHmac('sha256', secret)
//     .update(JSON.stringify(payload))
//     .digest('hex');
//   return signature === computedSignature;
// }
