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

async function activateMailgun() {
  loadEnv();
  
  console.log('🔧 Mailgun Domain Activation Helper\n');
  
  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) {
    console.error('❌ No Mailgun API key found');
    return;
  }

  try {
    // Get account info
    console.log('🔍 Checking Mailgun account status...');
    const authHeader = Buffer.from(`api:${apiKey}`).toString('base64');
    
    // Check domains
    const domainsResponse = await fetch('https://api.mailgun.net/v3/domains', {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });
    
    if (!domainsResponse.ok) {
      const error = await domainsResponse.text();
      console.error('❌ Cannot access Mailgun API:', error);
      console.log('\n🔧 Solutions:');
      console.log('1. Verify your account at https://app.mailgun.com');
      console.log('2. Add a payment method (free tier available)');
      console.log('3. Check if API key is correct');
      return;
    }

    const domains = await domainsResponse.json();
    console.log('✅ Mailgun API access working');
    
    // List available domains
    console.log('\n📋 Available domains:');
    domains.items.forEach((domain, index) => {
      console.log(`${index + 1}. ${domain.name}`);
      console.log(`   Status: ${domain.state}`);
      console.log(`   Type: ${domain.type}`);
      console.log(`   Created: ${domain.created_at}`);
      
      if (domain.state !== 'active') {
        console.log(`   ⚠️  Issue: ${domain.state}`);
      }
      console.log('');
    });

    // Find an active domain or suggest creating one
    const activeDomain = domains.items.find(d => d.state === 'active');
    
    if (activeDomain) {
      console.log(`🎯 Found active domain: ${activeDomain.name}`);
      console.log('\n📝 Update your .env file:');
      console.log(`MAILGUN_DOMAIN="${activeDomain.name}"`);
      
      // Test sending with active domain
      console.log('\n🧪 Testing email with active domain...');
      await testEmail(activeDomain.name, apiKey);
      
    } else {
      console.log('❌ No active domains found');
      console.log('\n🔧 Next steps:');
      console.log('1. Go to https://app.mailgun.com/mg/dashboard');
      console.log('2. Complete account verification');
      console.log('3. Add a custom domain: mail.fly2any.com');
      console.log('4. Follow DNS setup instructions');
      console.log('5. Wait for domain verification');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testEmail(domain, apiKey) {
  try {
    const formData = new FormData();
    formData.append('from', 'Fly2Any <info@fly2any.com>');
    formData.append('to', 'fly2any.travel@gmail.com');
    formData.append('subject', '✅ Mailgun Activated - Email Marketing Ready!');
    formData.append('html', `
      <h2>🎉 Mailgun Successfully Activated!</h2>
      <p>Your email marketing system is now ready to send campaigns.</p>
      <p>Domain: ${domain}</p>
      <p>Time: ${new Date().toLocaleString()}</p>
    `);

    const authHeader = Buffer.from(`api:${apiKey}`).toString('base64');
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${authHeader}` },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Message ID: ${result.id}`);
      console.log('📬 Check inbox: fly2any.travel@gmail.com');
    } else {
      const error = await response.text();
      console.log('❌ Test email failed:', error);
    }
  } catch (error) {
    console.log('❌ Test email error:', error.message);
  }
}

activateMailgun().catch(console.error);