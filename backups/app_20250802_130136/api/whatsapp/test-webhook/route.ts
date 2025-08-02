import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify WhatsApp-N8N webhook integration
export async function POST(request: NextRequest) {
  try {
    const { testMessage = 'oi' } = await request.json();
    
    const webhookUrl = process.env.N8N_WEBHOOK_WHATSAPP;
    
    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'N8N_WEBHOOK_WHATSAPP environment variable not configured',
        expected: 'https://n8n-production-81b6.up.railway.app/webhook/whatsapp'
      }, { status: 500 });
    }

    console.log('🧪 Testing WhatsApp-N8N webhook integration...');
    console.log(`📡 Webhook URL: ${webhookUrl}`);
    console.log(`📤 Test Message: ${testMessage}`);

    // Simulate a WhatsApp message payload
    const testPayload = {
      event: 'whatsapp_message_received',
      data: {
        from: '5511999999999@s.whatsapp.net',
        message: testMessage,
        text: testMessage,
        contactName: 'Test User',
        timestamp: new Date().toISOString(),
        messageId: `test_${Date.now()}`,
        isNewConversation: true,
        phone: '5511999999999'
      },
      timestamp: new Date().toISOString(),
      source: 'baileys_test',
      // Add data directly to root for N8N compatibility
      from: '5511999999999@s.whatsapp.net',
      message: testMessage,
      text: testMessage,
      contactName: 'Test User',
      messageId: `test_${Date.now()}`,
      isNewConversation: true,
      phone: '5511999999999',
      // Ensure required fields for N8N workflow
      body: {
        event: 'whatsapp_message_received',
        data: {
          from: '5511999999999@s.whatsapp.net',
          message: testMessage,
          text: testMessage,
          contactName: 'Test User',
          timestamp: new Date().toISOString(),
          messageId: `test_${Date.now()}`,
          isNewConversation: true,
          phone: '5511999999999'
        }
      }
    };

    console.log('📦 Test Payload:', JSON.stringify(testPayload, null, 2));

    const startTime = Date.now();
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fly2Any-WhatsApp-Test/1.0'
      },
      body: JSON.stringify(testPayload)
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const responseText = await response.text();
    
    console.log(`📥 N8N Response (${response.status}):`, responseText);
    console.log(`⏱️ Response Time: ${responseTime}ms`);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `N8N webhook failed: ${response.status} ${response.statusText}`,
        webhookUrl,
        responseText,
        responseTime,
        testPayload
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp-N8N webhook test successful',
      webhookUrl,
      responseStatus: response.status,
      responseText,
      responseTime,
      testPayload: {
        event: testPayload.event,
        messagePreview: testMessage,
        from: testPayload.from,
        contactName: testPayload.contactName
      }
    });

  } catch (error) {
    console.error('❌ WhatsApp webhook test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      webhookUrl: process.env.N8N_WEBHOOK_WHATSAPP
    }, { status: 500 });
  }
}

// GET endpoint to check webhook configuration
export async function GET(request: NextRequest) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_WHATSAPP;
    
    return NextResponse.json({
      configured: !!webhookUrl,
      webhookUrl: webhookUrl || 'Not configured',
      expectedUrl: 'https://n8n-production-81b6.up.railway.app/webhook/whatsapp',
      testEndpoint: '/api/whatsapp/test-webhook',
      instructions: {
        1: 'POST to this endpoint with {"testMessage": "oi"} to test webhook',
        2: 'Check N8N workflow at https://n8n-production-81b6.up.railway.app/workflow/eQpghVw94fXVR5O3m',
        3: 'Monitor logs in browser console and server logs'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}