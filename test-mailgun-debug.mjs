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

async function debugMailgun() {
  loadEnv();
  
  console.log('🔍 Debugging Mailgun Configuration\n');
  console.log('API Key:', process.env.MAILGUN_API_KEY);
  console.log('Domain:', process.env.MAILGUN_DOMAIN);
  console.log('From Email:', process.env.MAILGUN_FROM_EMAIL);

  try {
    const formData = new FormData();
    formData.append('from', `Fly2Any <${process.env.MAILGUN_FROM_EMAIL}>`);
    formData.append('to', 'fly2any.travel@gmail.com');
    formData.append('subject', 'Test Email');
    formData.append('text', 'This is a test email.');

    const authHeader = Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64');
    console.log('\nAuth Header:', authHeader.substring(0, 20) + '...');
    
    const url = `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;
    console.log('URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`
      },
      body: formData
    });

    console.log('\nResponse Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('\nResponse Text:', text);
    
    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('\nParsed JSON:', json);
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    }
    
  } catch (error) {
    console.error('\nError:', error.message);
  }
}

debugMailgun().catch(console.error);