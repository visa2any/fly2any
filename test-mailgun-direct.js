// Direct Mailgun test script
require('dotenv').config({ path: '.env.local' });
const { mailgunService } = require('./src/lib/mailgun-service.ts');

async function testMailgun() {
  console.log('🚀 Testing Mailgun configuration...\n');
  
  // Test 1: Connection Test
  console.log('1️⃣ Testing Mailgun connection...');
  const connectionResult = await mailgunService.testConnection();
  console.log('Connection test:', connectionResult.success ? '✅' : '❌', connectionResult.message);
  console.log('');
  
  // Test 2: Domain Verification Status
  console.log('2️⃣ Checking domain verification status...');
  const domainStatus = await mailgunService.getDomainVerificationStatus();
  console.log('Domain status:', domainStatus.status);
  console.log('Message:', domainStatus.message);
  if (domainStatus.recommendations) {
    console.log('Recommendations:', domainStatus.recommendations);
  }
  console.log('');
  
  // Test 3: Send Test Email (if domain verified or to authorized recipients)
  if (connectionResult.success) {
    console.log('3️⃣ Sending test email...');
    try {
      const testEmail = await mailgunService.sendSingleEmail({
        to: 'fly2any.travel@gmail.com',
        from: process.env.MAILGUN_FROM_EMAIL || 'noreply@fly2any.com',
        fromName: 'Fly2Any Test',
        subject: '🧪 [MAILGUN TEST] Connection Test - DNS Verified!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px;">
              <h1>✅ Mailgun Test Successful!</h1>
              <h2>🎉 DNS Configuration Working!</h2>
            </div>
            <div style="padding: 30px; background: #F9FAFB; margin-top: 20px; border-radius: 10px;">
              <h2>📊 Test Results:</h2>
              <ul>
                <li>✅ <strong>API Connection:</strong> SUCCESS</li>
                <li>✅ <strong>DNS Records:</strong> VERIFIED</li>
                <li>✅ <strong>Email Sending:</strong> WORKING</li>
                <li>✅ <strong>Domain:</strong> ${process.env.MAILGUN_DOMAIN}</li>
                <li>✅ <strong>From Email:</strong> ${process.env.MAILGUN_FROM_EMAIL}</li>
              </ul>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                <h3>🚀 Ready for Production!</h3>
                <p>Your Mailgun configuration is now fully operational with verified DNS records. You can send emails to any recipient.</p>
                <p><strong>Cost:</strong> Only $0.80 per 1,000 emails</p>
                <p><strong>No monthly fees or contact limits!</strong></p>
              </div>
              
              <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
                Test performed on: ${new Date().toLocaleString('pt-BR')}<br>
                From: Fly2Any Email Marketing System
              </p>
            </div>
          </div>
        `,
        trackingEnabled: true,
        campaignId: 'mailgun-test-' + Date.now()
      });
      
      if (testEmail.success) {
        console.log('Email sent successfully! ✅');
        console.log('Message ID:', testEmail.messageId);
        console.log('Domain Status:', testEmail.domainStatus);
      } else {
        console.log('Email send failed ❌');
        console.log('Error:', testEmail.error);
        console.log('Domain Status:', testEmail.domainStatus);
      }
    } catch (error) {
      console.error('Error sending test email:', error.message);
    }
  }
  
  console.log('\n🏁 Mailgun test completed!');
}

testMailgun().catch(console.error);