#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
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

async function testMailgun() {
  loadEnv();
  
  console.log('🧪 Testing Mailgun Email Service\n');
  console.log('📧 Domain:', process.env.MAILGUN_DOMAIN);
  console.log('🔑 API Key:', process.env.MAILGUN_API_KEY ? '✅ Found' : '❌ Missing');
  console.log('📬 From:', process.env.MAILGUN_FROM_EMAIL);
  
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.error('\n❌ Mailgun credentials missing!');
    return;
  }

  try {
    // Test direct Mailgun API
    console.log('\n🔄 Testing direct Mailgun API...');
    
    const formData = new FormData();
    formData.append('from', `Fly2Any <${process.env.MAILGUN_FROM_EMAIL}>`);
    formData.append('to', 'fly2any.travel@gmail.com'); // Send to admin email
    formData.append('subject', '✅ Mailgun Test - Lead Notification System');
    formData.append('html', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">✅ Mailgun Working!</h2>
        <p>Great news! Your Mailgun email service is configured correctly.</p>
        <hr>
        <h3>Lead Notification System Status:</h3>
        <ul>
          <li>✅ Mailgun API: Working</li>
          <li>✅ Email notifications: Ready</li>
          <li>✅ Better deliverability than Gmail SMTP</li>
          <li>✅ Production-ready</li>
        </ul>
        <p><strong>What this means:</strong></p>
        <ul>
          <li>You'll receive instant notifications for new leads</li>
          <li>Customers will get professional confirmation emails</li>
          <li>Better email delivery rates</li>
          <li>More reliable than Gmail SMTP</li>
        </ul>
        <p style="color: #666;">Test performed at: ${new Date().toLocaleString()}</p>
      </div>
    `);
    formData.append('text', 'Mailgun is working! Lead notification system is ready.');

    const authHeader = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64');
    const response = await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`
      },
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email sent successfully via Mailgun!');
      console.log('📧 Message ID:', result.id);
      console.log('📬 Check inbox at: fly2any.travel@gmail.com');
      console.log('\n🎉 Lead notification system is ready with Mailgun!');
      
      console.log('\n📊 Email Service Priority:');
      console.log('1. 🥇 Mailgun (Primary) - Production ready');
      console.log('2. 🥈 Gmail SMTP (Backup) - Already working');
      console.log('3. 🥉 N8N Webhook (Optional) - If configured');
      
    } else {
      console.error('❌ Mailgun Error:', result);
      console.log('\n🔧 Possible issues:');
      console.log('1. Domain not verified in Mailgun');
      console.log('2. API key invalid');
      console.log('3. Sending limits reached');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n🔧 Authentication error:');
      console.log('1. Check if API key is correct');
      console.log('2. Verify domain in Mailgun dashboard');
    }
  }
}

testMailgun().catch(console.error);