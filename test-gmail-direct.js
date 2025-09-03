/**
 * Direct Gmail Test
 * Tests Gmail configuration directly
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmailDirect() {
  console.log('🧪 Testing Gmail Configuration...\n');
  
  console.log('📧 Gmail Email:', process.env.GMAIL_EMAIL);
  console.log('🔑 App Password:', process.env.GMAIL_APP_PASSWORD ? '***configured***' : 'NOT CONFIGURED');
  
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail credentials not found in environment variables!');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Verify connection
    console.log('\n🔄 Verifying Gmail connection...');
    await transporter.verify();
    console.log('✅ Gmail connection successful!');

    // Send test email
    console.log('\n📤 Sending test email...');
    const result = await transporter.sendMail({
      from: `"Fly2Any Test" <${process.env.GMAIL_EMAIL}>`,
      to: process.env.GMAIL_EMAIL, // Send to self
      subject: '🧪 Test Email - Fly2Any Lead System',
      html: `
        <h2>✅ Gmail is working!</h2>
        <p>This is a test email from the Fly2Any lead notification system.</p>
        <p>Time: ${new Date().toISOString()}</p>
        <hr>
        <p>If you received this email, your Gmail configuration is correct!</p>
      `,
      text: 'Gmail is working! This is a test email from Fly2Any.'
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📬 Check your inbox at:', process.env.GMAIL_EMAIL);
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Fix: Check your app password:');
      console.log('1. Go to https://myaccount.google.com/apppasswords');
      console.log('2. Generate a new app password');
      console.log('3. Update GMAIL_APP_PASSWORD in .env');
    }
  }
}

// Run test
testGmailDirect().then(() => {
  console.log('\n✨ Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});