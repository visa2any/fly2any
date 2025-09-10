// Simple Mailgun test using SDK directly
require('dotenv').config({ path: '.env.local' });
const Mailgun = require('mailgun.js');
const formData = require('form-data');

async function testMailgunDirect() {
  console.log('🚀 Testing Mailgun configuration directly...\n');
  
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const fromEmail = process.env.MAILGUN_FROM_EMAIL;
  
  console.log('📝 Configuration:');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
  console.log('Domain:', domain || 'NOT SET');
  console.log('From Email:', fromEmail || 'NOT SET');
  console.log('');
  
  if (!apiKey || !domain) {
    console.log('❌ Missing required environment variables!');
    return;
  }
  
  try {
    // Initialize Mailgun
    const mg = new Mailgun(formData);
    const mailgun = mg.client({
      username: 'api',
      key: apiKey
    });
    
    console.log('1️⃣ Testing API connection...');
    
    // Test 1: Try to get domain info
    try {
      const domainInfo = await mailgun.domains.get(domain);
      console.log('✅ Domain found:', domain);
      console.log('Domain state:', domainInfo.state || 'unknown');
      console.log('Domain type:', domainInfo.type || 'unknown');
    } catch (domainError) {
      console.log('⚠️ Domain check failed:', domainError.message);
      
      // Try to list domains to verify API key
      try {
        const domains = await mailgun.domains.list({ limit: 5 });
        console.log('✅ API key is valid!');
        console.log('Available domains:', domains.items?.map(d => d.name) || 'none');
        
        if (!domains.items?.find(d => d.name === domain)) {
          console.log(`❌ Domain '${domain}' not found in your Mailgun account!`);
          console.log('Please add this domain to your Mailgun account first.');
          return;
        }
      } catch (apiError) {
        console.log('❌ API key authentication failed:', apiError.message);
        return;
      }
    }
    
    console.log('\n2️⃣ Attempting to send test email...');
    
    // Test 2: Send test email
    const emailData = {
      from: `Fly2Any Test <${fromEmail}>`,
      to: 'fly2any.travel@gmail.com',
      subject: '🧪 [DIRECT TEST] Mailgun Connection Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 20px; text-align: center;">
            <h1>🧪 Direct Mailgun Test</h1>
            <h2>Testing Connection & Authentication</h2>
          </div>
          <div style="padding: 20px; background: #F3F4F6;">
            <h3>✅ Test Results:</h3>
            <ul>
              <li><strong>API Key:</strong> Valid ✅</li>
              <li><strong>Domain:</strong> ${domain} ✅</li>
              <li><strong>Email Sending:</strong> Working ✅</li>
            </ul>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p style="color: #6B7280; font-size: 12px;">
              This is a direct test of the Mailgun SDK bypassing the Next.js API layer.
            </p>
          </div>
        </div>
      `,
      text: `Direct Mailgun test - ${new Date().toISOString()}`
    };
    
    const response = await mailgun.messages.create(domain, emailData);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', response.id);
    console.log('Status:', response.status || 'sent');
    console.log('\n🎉 All tests passed! Mailgun is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.status === 401) {
      console.log('\n🔍 401 Error Analysis:');
      console.log('- Check that MAILGUN_API_KEY is correct');
      console.log('- Verify the API key has the correct format (key-xxxxxx...)');
      console.log('- Ensure the API key belongs to the same account as the domain');
    } else if (error.status === 400) {
      console.log('\n🔍 400 Error Analysis:');
      console.log('- Domain might not be verified');
      console.log('- Recipient might not be in authorized recipients list');
      console.log('- Check domain DNS configuration');
    }
  }
}

testMailgunDirect().catch(console.error);