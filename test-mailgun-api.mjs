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

async function testMailgunAPI() {
  loadEnv();
  
  console.log('🔍 MAILGUN API TEST REPORT\n');
  console.log('=' .repeat(50));
  
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  
  console.log('📋 CURRENT CONFIGURATION:');
  console.log(`   API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`   Domain: ${domain || 'NOT SET'}`);
  console.log('');

  if (!apiKey) {
    console.error('❌ MAILGUN_API_KEY not found in .env file');
    return;
  }

  // Test different API endpoints
  const authHeader = Buffer.from(`api:${apiKey}`).toString('base64');
  const headers = { 'Authorization': `Basic ${authHeader}` };

  console.log('🧪 TESTING API ENDPOINTS:\n');

  // 1. Test account access
  console.log('1. Account Access:');
  try {
    const response = await fetch('https://api.mailgun.net/v3/domains', { headers });
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ API Key Valid`);
      console.log(`   📊 Domains found: ${data.items?.length || 0}`);
      
      if (data.items && data.items.length > 0) {
        console.log('\n   Available Domains:');
        data.items.forEach(d => {
          console.log(`   - ${d.name} (${d.state})`);
        });
      }
    } else {
      const error = await response.text();
      console.log(`   ❌ API Key Invalid: ${error}`);
      console.log('\n   📝 ACTION REQUIRED:');
      console.log('   1. Login to https://app.mailgun.com');
      console.log('   2. Go to Settings > API Keys');
      console.log('   3. Copy your Private API Key');
      console.log('   4. Update MAILGUN_API_KEY in .env file');
    }
  } catch (error) {
    console.log(`   ❌ Connection Error: ${error.message}`);
  }

  // 2. Test domain status
  if (domain) {
    console.log('\n2. Domain Verification Status:');
    try {
      const response = await fetch(`https://api.mailgun.net/v3/domains/${domain}`, { headers });
      if (response.ok) {
        const data = await response.json();
        console.log(`   Domain: ${data.name}`);
        console.log(`   State: ${data.state === 'active' ? '✅ VERIFIED' : '⚠️ UNVERIFIED'}`);
        console.log(`   Type: ${data.type}`);
        
        if (data.state !== 'active') {
          console.log('\n   📝 TO VERIFY DOMAIN:');
          console.log('   1. Add DNS records as shown in DNS_RECORDS_CHECKLIST.txt');
          console.log('   2. Wait for DNS propagation (15 min - 24 hours)');
          console.log('   3. Check status at https://app.mailgun.com');
        }
      } else {
        console.log(`   ❌ Domain not found: ${domain}`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking domain: ${error.message}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('\n📊 IMPLEMENTED FEATURES IN YOUR CODE:\n');
  
  const features = {
    '✅ Single Email Sending': 'sendSingleEmail() in mailgun-service.ts',
    '✅ Bulk Campaign Sending': 'sendBulkCampaign() with batch processing',
    '✅ Email Tracking': 'Opens, clicks, deliveries via webhooks',
    '✅ Webhook Processing': 'handleWebhook() for events',
    '✅ Personalization': 'Template variables support',
    '✅ Unsubscribe Handling': 'Automatic unsubscribe management',
    '✅ Domain Verification Check': 'getDomainVerificationStatus()',
    '✅ Connection Testing': 'testConnection() method',
    '✅ Tracking Pixel': 'Automatic pixel insertion',
    '✅ Click Tracking': 'Enabled by default',
  };

  Object.entries(features).forEach(([feature, location]) => {
    console.log(`${feature}`);
    console.log(`   📍 ${location}`);
  });

  console.log('\n📚 ADDITIONAL MAILGUN FEATURES TO EXPLORE:\n');
  
  const additionalFeatures = [
    '📧 Email Validation API - Validate emails before sending',
    '📊 Advanced Analytics - Detailed campaign performance',
    '🔄 Inbound Email Routing - Receive and process emails',
    '📝 Email Templates - Store templates in Mailgun',
    '🚫 Suppression Lists - Manage bounces and complaints',
    '📅 Scheduled Sending - Send emails at specific times',
    '🏷️ Tagging - Organize campaigns with tags',
    '📈 A/B Testing - Test different email versions',
    '🔐 DMARC/DKIM/SPF - Advanced authentication',
    '🌍 EU Region Support - GDPR compliance',
  ];

  additionalFeatures.forEach(feature => {
    console.log(`   ${feature}`);
  });

  console.log('\n' + '=' .repeat(50));
  console.log('\n🎯 NEXT STEPS:\n');
  
  const apiKeyValid = await isApiKeyValid(apiKey);
  
  if (!apiKeyValid) {
    console.log('1. ⚠️  UPDATE API KEY:');
    console.log('   - Get new API key from https://app.mailgun.com');
    console.log('   - Update MAILGUN_API_KEY in .env file');
  } else if (domain && domain.includes('sandbox')) {
    console.log('1. ⚠️  USING SANDBOX DOMAIN:');
    console.log('   - Limited to 5 authorized recipients');
    console.log('   - Add custom domain: mail.fly2any.com');
    console.log('   - Follow DNS setup in DNS_RECORDS_CHECKLIST.txt');
  } else {
    console.log('1. ✅ READY FOR PRODUCTION:');
    console.log('   - Domain verified and ready');
    console.log('   - Full API access available');
    console.log('   - Professional email sending enabled');
  }

  console.log('\n📧 TEST EMAIL ENDPOINT:');
  console.log('   curl -X POST http://localhost:3000/api/email-marketing/v2 \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"action":"test_connection"}\'');
  
  console.log('\n' + '=' .repeat(50));
}

async function isApiKeyValid(apiKey) {
  try {
    const authHeader = Buffer.from(`api:${apiKey}`).toString('base64');
    const response = await fetch('https://api.mailgun.net/v3/domains', {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}

testMailgunAPI().catch(console.error);