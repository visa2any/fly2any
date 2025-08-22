#!/usr/bin/env node

import nodemailer from 'nodemailer';
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

async function testEmailDirect() {
  loadEnv();
  
  console.log('🧪 Direct Gmail Test\n');
  console.log('📧 Email:', process.env.GMAIL_EMAIL);
  console.log('🔑 Password:', process.env.GMAIL_APP_PASSWORD ? '✅ Found' : '❌ Missing');
  
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.error('\n❌ Gmail credentials missing!');
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
    console.log('\n🔄 Connecting to Gmail...');
    await transporter.verify();
    console.log('✅ Connected successfully!');

    // Send test email
    console.log('\n📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Fly2Any" <${process.env.GMAIL_EMAIL}>`,
      to: process.env.GMAIL_EMAIL,
      subject: '✅ Fly2Any Lead System - Email Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">✅ Email System Working!</h2>
          <p>Great news! Your lead notification system is configured correctly.</p>
          <hr>
          <h3>What this means:</h3>
          <ul>
            <li>✅ You will receive notifications for new leads</li>
            <li>✅ Customers will receive confirmation emails</li>
            <li>✅ Gmail SMTP is properly configured</li>
          </ul>
          <p style="color: #666;">Test performed at: ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: 'Email system working! Your lead notifications are configured correctly.'
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('\n📬 Check your inbox at:', process.env.GMAIL_EMAIL);
    console.log('✨ Lead notification system is ready!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication issue. Please check:');
      console.log('1. Is 2-factor authentication enabled on Gmail?');
      console.log('2. Is the app password correct?');
      console.log('3. Try generating a new app password at:');
      console.log('   https://myaccount.google.com/apppasswords');
    }
  }
}

testEmailDirect().catch(console.error);