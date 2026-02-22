import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables before other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verifyEmail() {
  console.log('🔍 Starting Email Provider Verification...');
  console.log('-------------------------------------------');

  // Dynamically import unifiedClient after dotenv has configured process.env
  const { unifiedClient } = await import('../lib/email/unified-client');

  const config = {
    resendKey: process.env.RESEND_API_KEY ? '✅ Present' : '❌ Missing',
    adminEmail: process.env.ADMIN_EMAIL || 'fly2any.travel@gmail.com',
  };

  console.log('Environment Configuration:');
  console.table(config);

  const testRecipients = [
    config.adminEmail,
    'visa2any@gmail.com'
  ].filter(Boolean);

  for (const to of testRecipients) {
    console.log(`\n📧 Sending test email to: ${to}...`);
    
    try {
      const result = await unifiedClient.send({
        to,
        subject: `🧪 Unified Email Test - ${new Date().toISOString()}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3b82f6;">Unified Email Client Test</h2>
            <p>This is a test email sent from the <strong>Fly2Any</strong> unified email system.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              <p>Check logs for the provider used.</p>
            </div>
            <p style="color: #6b7280; font-size: 12px;">If you received this, the unified email system is working correctly.</p>
          </div>
        `,
        text: `Unified Email Client Test\n\nEnvironment: ${process.env.NODE_ENV}\nTimestamp: ${new Date().toLocaleString()}\nCheck logs for provider.`,
        forceSend: true, // Bypass dev simulation
        tags: ['test', 'verification']
      });

      if (result.success) {
        console.log(`✅ SUCCESS! Sent via ${result.provider.toUpperCase()}`);
        console.log(`   Message ID: ${result.messageId}`);
      } else {
        console.error(`❌ FAILED: ${result.error}`);
      }
    } catch (error: any) {
      console.error(`❌ EXCEPTION: ${error.message}`);
    }
  }

  console.log('\n-------------------------------------------');
  console.log('🏁 Verification Complete');
}

verifyEmail().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
