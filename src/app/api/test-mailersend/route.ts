import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendLeadNotification, sendWelcomeEmail, sendQuoteReadyEmail } from '@/lib/email-mailersend';

export async function POST(request: NextRequest) {
  try {
    const { type = 'test', to, data } = await request.json();

    let result;
    
    switch (type) {
      case 'test':
        // Send a simple test email
        result = await sendEmail({
          to: to || process.env.NOTIFICATION_EMAIL || 'admin@fly2any.com',
          subject: 'MailerSend Test Email - Fly2Any',
          html: `
            <h2>MailerSend Integration Test</h2>
            <p>This is a test email from your Fly2Any application.</p>
            <p>If you're receiving this, your MailerSend integration is working correctly!</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          `,
          text: `MailerSend Integration Test\n\nThis is a test email from your Fly2Any application.\nIf you're receiving this, your MailerSend integration is working correctly!\n\nTimestamp: ${new Date().toISOString()}`,
          tags: ['test', 'integration']
        });
        break;
        
      case 'lead':
        // Test lead notification
        result = await sendLeadNotification({
          name: data?.name || 'John Doe',
          email: data?.email || 'john@example.com',
          phone: data?.phone || '+1 555-123-4567',
          serviceType: 'Flight Quote',
          origin: 'New York (JFK)',
          destination: 'São Paulo (GRU)',
          departureDate: new Date().toISOString(),
          returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          message: 'Looking for the best prices for a family trip.'
        });
        break;
        
      case 'welcome':
        // Test welcome email
        result = await sendWelcomeEmail({
          name: data?.name || 'John Doe',
          email: to || 'john@example.com'
        });
        break;
        
      case 'quote':
        // Test quote ready email
        result = await sendQuoteReadyEmail({
          customer: {
            name: data?.name || 'John Doe',
            email: to || 'john@example.com'
          },
          quote: {
            price: '$875',
            route: 'New York → São Paulo',
            departureDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            quoteId: 'QT-' + Math.random().toString(36).substr(2, 9).toUpperCase()
          }
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: test, lead, welcome, or quote' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully!`
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to send email' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Test MailerSend error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MailerSend Test Endpoint',
    usage: 'POST to this endpoint with JSON body',
    examples: [
      {
        type: 'test',
        to: 'recipient@example.com'
      },
      {
        type: 'lead',
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 555-123-4567'
        }
      },
      {
        type: 'welcome',
        to: 'customer@example.com',
        data: {
          name: 'John Doe'
        }
      },
      {
        type: 'quote',
        to: 'customer@example.com',
        data: {
          name: 'John Doe'
        }
      }
    ]
  });
}