/**
 * Simple Gmail Test
 */

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

async function testEmail() {
  loadEnv();
  
  console.log('🧪 Testing Email System...\n');
  console.log('📧 Gmail:', process.env.GMAIL_EMAIL);
  console.log('🔑 Password:', process.env.GMAIL_APP_PASSWORD ? '✅ Configured' : '❌ Not found');
  
  try {
    const response = await fetch('http://localhost:3000/api/email-gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: process.env.GMAIL_EMAIL || 'fly2any.travel@gmail.com',
        subject: '🧪 Test - Fly2Any Lead System Working',
        html: '<h2>✅ Email System is Working!</h2><p>Lead notifications are configured correctly.</p>',
        text: 'Email system is working!'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ SUCCESS! Email sent!');
      console.log('📬 Check inbox at:', process.env.GMAIL_EMAIL);
    } else {
      console.error('\n❌ Failed:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔧 Make sure dev server is running: npm run dev');
  }
}

testEmail();
