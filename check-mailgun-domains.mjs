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

async function checkMailgunDomains() {
  loadEnv();
  
  console.log('🔍 Checking Mailgun Domains...\n');
  
  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) {
    console.error('❌ No API key found');
    return;
  }

  try {
    // Check available domains
    const authHeader = Buffer.from(`api:${apiKey}`).toString('base64');
    const response = await fetch('https://api.mailgun.net/v3/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`
      }
    });

    if (!response.ok) {
      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Response:', text);
      return;
    }

    const result = await response.json();
    console.log('✅ Available domains:');
    
    if (result.items && result.items.length > 0) {
      result.items.forEach((domain, index) => {
        console.log(`${index + 1}. ${domain.name} (${domain.state})`);
        console.log(`   Type: ${domain.type || 'standard'}`);
        console.log(`   Created: ${domain.created_at}`);
        console.log('');
      });
      
      // Use the first active domain
      const activeDomain = result.items.find(d => d.state === 'active') || result.items[0];
      if (activeDomain) {
        console.log(`🎯 Recommended domain: ${activeDomain.name}`);
        console.log('\n📝 Update your .env file:');
        console.log(`MAILGUN_DOMAIN="${activeDomain.name}"`);
      }
    } else {
      console.log('❌ No domains found. Please add a domain in Mailgun dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMailgunDomains().catch(console.error);