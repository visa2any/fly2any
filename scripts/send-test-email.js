// Test email sender using Mailgun
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const fs = require('fs');
const path = require('path');

// Load env
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mail.fly2any.com';
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'Fly2Any <noreply@mail.fly2any.com>';
const TO_EMAIL = process.argv[2] || 'support@fly2any.com';

async function sendTestEmail() {
  console.log('📧 Sending Welcome Back test email...');
  console.log(`   From: ${FROM_EMAIL}`);
  console.log(`   To: ${TO_EMAIL}`);
  console.log(`   Domain: ${MAILGUN_DOMAIN}`);

  // Read HTML template
  const templatePath = path.join(__dirname, '..', 'emails', 'templates', 'welcome-back.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Replace merge tags with test values
  htmlContent = htmlContent.replace(/\{\{firstName\}\}/g, 'Traveler');
  htmlContent = htmlContent.replace(/\{\{unsubscribe\}\}/g, 'https://fly2any.com/unsubscribe?test=true');

  // Initialize Mailgun
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: 'api',
    key: MAILGUN_API_KEY,
  });

  try {
    const result = await mg.messages.create(MAILGUN_DOMAIN, {
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: 'Welcome Back! ✨ Your next adventure awaits + Exclusive Deals Inside',
      html: htmlContent,
      'o:tag': ['welcome-back', 'test'],
      'o:tracking': true,
      'o:tracking-clicks': false,  // DISABLED - prevents broken redirect links
      'o:tracking-opens': true,
    });

    console.log('\n✅ Email sent successfully!');
    console.log(`   Message ID: ${result.id}`);
    console.log(`   Status: ${result.status || result.message}`);
  } catch (error) {
    console.error('\n❌ Failed to send email:', error.message);
    if (error.details) console.error('   Details:', error.details);
    process.exit(1);
  }
}

sendTestEmail();
