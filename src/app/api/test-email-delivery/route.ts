import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/email-service';
import { mailgunService } from '@/lib/mailgun-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, action = 'send_test', provider = 'auto' } = body;

    // Email is required for most actions except check_status
    if (!to && action !== 'check_status') {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      }, { status: 400 });
    }

    // Validate email format (only if email is provided)
    if (to) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email format'
        }, { status: 400 });
      }
    }

    switch (action) {
      case 'send_test':
        return await handleSendTest(to, provider);
      
      case 'add_authorized':
        return await handleAddAuthorized(to);
      
      case 'check_status':
        return await handleCheckStatus();
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Test email API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Send test email using the email service (with automatic fallback)
async function handleSendTest(to: string, provider: string) {
  try {
    const testEmailData = {
      to,
      subject: '🧪 Email Delivery Test - Fly2Any System',
      htmlContent: generateTestEmailHTML(to),
      textContent: generateTestEmailText(to),
      template: 'test-email'
    };

    const result = await emailService.sendEmail(testEmailData);

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Test email sent successfully via ${result.provider}` 
        : 'Failed to send test email',
      provider: result.provider,
      messageId: result.messageId,
      error: result.error,
      recipient: to,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recipient: to
    }, { status: 500 });
  }
}

// Add email as authorized recipient for Mailgun
async function handleAddAuthorized(to: string) {
  try {
    const result = await mailgunService.addAuthorizedRecipient(to);
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      recipient: to,
      timestamp: new Date().toISOString(),
      note: 'Check the console output for detailed instructions'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      recipient: to
    }, { status: 500 });
  }
}

// Check email service status
async function handleCheckStatus() {
  try {
    // Check environment variables
    const envStatus = {
      gmail: {
        configured: !!(process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD),
        email: process.env.GMAIL_EMAIL || null
      },
      mailgun: {
        configured: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN),
        domain: process.env.MAILGUN_DOMAIN || null
      },
      sendgrid: {
        configured: !!process.env.SENDGRID_API_KEY
      },
      smtp: {
        configured: !!process.env.SMTP_HOST
      }
    };

    // Test Mailgun connection and domain status
    let mailgunStatus = null;
    if (envStatus.mailgun.configured) {
      try {
        const connectionTest = await mailgunService.testConnection();
        const domainStatus = await mailgunService.getDomainVerificationStatus();
        
        mailgunStatus = {
          connection: connectionTest,
          domain: domainStatus
        };
      } catch (error) {
        mailgunStatus = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envStatus,
      mailgun: mailgunStatus,
      recommendations: generateRecommendations(envStatus, mailgunStatus)
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateTestEmailHTML(to: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Email Delivery Test</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 24px;">✅ Email System Working!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Fly2Any Email Delivery Test</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; margin: 20px 0; border-radius: 8px;">
            <h2 style="color: #28a745; margin-top: 0;">🎉 Successful Delivery</h2>
            <p><strong>Recipient:</strong> ${to}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>System:</strong> Fly2Any Multi-Provider Email Service</p>
        </div>

        <div style="padding: 20px; border-left: 4px solid #17a2b8;">
            <h3 style="color: #17a2b8; margin-top: 0;">✅ What this means:</h3>
            <ul style="padding-left: 20px;">
                <li>✅ Email delivery is working correctly</li>
                <li>✅ You can receive notifications and confirmations</li>
                <li>✅ Email service is configured properly</li>
                <li>✅ Multi-provider fallback is active</li>
            </ul>
        </div>

        <div style="padding: 20px; background: #e8f5e8; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">🚀 Next Steps:</h3>
            <p>Your email system is ready! You can now:</p>
            <ul>
                <li>Send customer notifications</li>
                <li>Receive booking confirmations</li>
                <li>Run email marketing campaigns</li>
            </ul>
        </div>

        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <div style="text-align: center; color: #6c757d; font-size: 12px;">
            <p>This is an automated test email from Fly2Any</p>
            <p>Generated at: ${new Date().toLocaleString()}</p>
        </div>
    </body>
    </html>
  `;
}

function generateTestEmailText(to: string): string {
  return `
✅ EMAIL SYSTEM WORKING!

Fly2Any Email Delivery Test

🎉 Successful Delivery
Recipient: ${to}
Timestamp: ${new Date().toISOString()}
System: Fly2Any Multi-Provider Email Service

✅ What this means:
- Email delivery is working correctly
- You can receive notifications and confirmations
- Email service is configured properly
- Multi-provider fallback is active

🚀 Next Steps:
Your email system is ready! You can now:
- Send customer notifications
- Receive booking confirmations  
- Run email marketing campaigns

This is an automated test email from Fly2Any
Generated at: ${new Date().toLocaleString()}
  `;
}

function generateRecommendations(envStatus: any, mailgunStatus: any): string[] {
  const recommendations: string[] = [];

  if (!envStatus.gmail.configured) {
    recommendations.push('Configure Gmail service (GMAIL_EMAIL and GMAIL_APP_PASSWORD) for guaranteed email delivery');
  }

  if (!envStatus.mailgun.configured) {
    recommendations.push('Configure Mailgun service (MAILGUN_API_KEY and MAILGUN_DOMAIN) for professional email sending');
  } else if (mailgunStatus?.domain?.status === 'unverified') {
    recommendations.push('Verify Mailgun domain by adding DNS records to enable unrestricted sending');
    recommendations.push('Add recipient emails as authorized recipients for testing with unverified domain');
  }

  if (!envStatus.sendgrid.configured) {
    recommendations.push('Consider adding SendGrid as backup provider (SENDGRID_API_KEY)');
  }

  if (recommendations.length === 0) {
    recommendations.push('All email providers are configured correctly!');
  }

  return recommendations;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Email delivery test endpoint is ready',
    endpoints: {
      'POST /api/test-email-delivery': 'Send test emails and manage email delivery',
      'body.action': 'send_test | add_authorized | check_status',
      'body.to': 'recipient email address',
      'body.provider': 'auto | gmail | mailgun | sendgrid | smtp (for send_test)'
    },
    examples: {
      send_test: { action: 'send_test', to: 'user@example.com' },
      add_authorized: { action: 'add_authorized', to: 'user@example.com' },
      check_status: { action: 'check_status' }
    }
  });
}