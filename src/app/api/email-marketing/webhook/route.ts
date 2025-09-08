import { NextRequest, NextResponse } from 'next/server';
import { mailgunService } from '@/lib/mailgun-service';

// MailGun Webhook Endpoint for Email Event Tracking
// URL: https://yourdomain.com/api/email-marketing/webhook
// Configure this URL in your MailGun dashboard

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature for verification
    const signature = request.headers.get('x-mailgun-signature');
    const timestamp = request.headers.get('x-mailgun-timestamp');
    const token = request.headers.get('x-mailgun-token');
    
    console.log('📥 Received MailGun webhook');
    
    // Verify webhook authenticity if signature is provided
    if (signature && timestamp && token) {
      const isValid = mailgunService.verifyWebhookSignature(timestamp, token, signature);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    // Parse webhook data
    const webhookData = await request.json();
    
    // Process the webhook event
    await mailgunService.handleWebhook(webhookData);
    
    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle GET requests (for webhook URL verification)
export async function GET() {
  return NextResponse.json({
    message: 'MailGun Webhook Endpoint',
    status: 'active',
    configure_in_mailgun: 'https://yourdomain.com/api/email-marketing/webhook',
    supported_events: [
      'delivered',
      'opened', 
      'clicked',
      'bounced',
      'unsubscribed',
      'complained'
    ]
  });
}