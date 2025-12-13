/**
 * REAL EMAIL TEST - Using Production Email Service
 *
 * This uses the ACTUAL email code from your application
 */

require('dotenv').config({ path: '.env.local' });

// Force production mode to send real emails
process.env.NODE_ENV = 'production';

async function sendRealTestEmail() {
  console.log('\n📧 ========================================');
  console.log('📧 SENDING REAL TEST EMAIL');
  console.log('📧 ========================================\n');

  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const adminEmail = process.env.ADMIN_EMAIL || 'support@fly2any.com';
  const emailFrom = process.env.EMAIL_FROM || `Fly2Any <noreply@${domain}>`;

  console.log('📋 Configuration:');
  console.log('   API Key:', apiKey ? '✅ SET' : '❌ MISSING');
  console.log('   Domain:', domain);
  console.log('   From:', emailFrom);
  console.log('   To:', adminEmail);
  console.log('   Mode:', process.env.NODE_ENV);
  console.log('');

  if (!apiKey || !domain) {
    console.error('❌ Missing Mailgun credentials!');
    process.exit(1);
  }

  console.log('⏳ Sending email via Mailgun API...\n');

  try {
    // Use URLSearchParams (standard form encoding)
    const params = new URLSearchParams();
    params.append('from', emailFrom);
    params.append('to', adminEmail);
    params.append('subject', '🧪 TEST: Fly2Any Error Alert System');
    params.append('text', `TEST ALERT - Fly2Any Notification System

This is a REAL test email sent from your error monitoring system.

If you're reading this, your email alerts are working correctly!

System Details:
- Sent at: ${new Date().toLocaleString()}
- Environment: ${process.env.NODE_ENV}
- Domain: ${domain}
- From: ${emailFrom}

What happens next?
✅ When customers encounter errors, you'll receive emails like this
✅ Emails include full error details, user info, and context
✅ Critical errors are sent immediately

Test Status: SUCCESS
`);

    params.append('html', `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #E74035 0%, #F7C928 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✈️ Fly2Any</h1>
  </div>

  <div class="content">
    <h2 style="color: #10b981;">🧪 Test Alert - System Operational</h2>

    <div class="success-box">
      <p style="margin: 0; color: #065f46;"><strong>✅ Email Alert System Working!</strong></p>
      <p style="margin: 10px 0 0 0; color: #047857;">If you're reading this, your notification system is configured correctly.</p>
    </div>

    <p>This is a <strong>real test email</strong> sent from your Fly2Any error monitoring system.</p>

    <div class="info-box">
      <h3 style="margin-top: 0;">📊 System Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;"><strong>Sent At:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Environment:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${process.env.NODE_ENV}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Domain:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${domain}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>From Address:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-size: 12px;">${emailFrom}</td>
        </tr>
      </table>
    </div>

    <h3>🎯 What Happens Next?</h3>
    <ul style="color: #1f2937;">
      <li>When customers encounter errors, you'll receive emails like this</li>
      <li>Emails include full error details, user info, and context</li>
      <li>Critical errors are sent immediately</li>
      <li>You also get instant Telegram notifications</li>
    </ul>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #10b981; font-size: 18px; font-weight: bold;">✅ Test Status: SUCCESS</p>
    </div>

    <p class="footer">
      This email was sent by Fly2Any Error Monitoring System<br>
      ${new Date().toLocaleDateString()}
    </p>
  </div>
</body>
</html>
    `);

    const response = await fetch(
      `https://api.mailgun.net/v3/${domain}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`api:${apiKey}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ ========================================');
      console.log('✅ EMAIL SENT SUCCESSFULLY!');
      console.log('✅ ========================================\n');
      console.log('📬 Message ID:', result.id);
      console.log('📧 Sent to:', adminEmail);
      console.log('📨 From:', emailFrom);
      console.log('\n🎉 CHECK YOUR EMAIL INBOX NOW!');
      console.log('   Subject: 🧪 TEST: Fly2Any Error Alert System\n');
      console.log('⏱️  Email should arrive within 1-2 minutes.');
      console.log('📂 Check spam folder if not in inbox.\n');
      return true;
    } else {
      console.error('❌ ========================================');
      console.error('❌ MAILGUN API ERROR');
      console.error('❌ ========================================\n');
      console.error('Status:', response.status);
      console.error('Error:', result.message || JSON.stringify(result, null, 2));
      console.error('\n💡 This might be a configuration issue.');
      console.error('   Check that your Mailgun domain is verified.\n');
      return false;
    }
  } catch (error) {
    console.error('❌ ========================================');
    console.error('❌ SEND ERROR');
    console.error('❌ ========================================\n');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    return false;
  }
}

sendRealTestEmail().then(success => {
  if (success) {
    console.log('✅ Test completed successfully.');
    console.log('✅ Your email notification system is operational!\n');
    process.exit(0);
  } else {
    console.log('❌ Test failed.');
    console.log('❌ Please check the error messages above.\n');
    process.exit(1);
  }
});
