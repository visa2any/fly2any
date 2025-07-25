#!/usr/bin/env node

/**
 * 🔍 N8N SETUP VERIFICATION SCRIPT
 * 
 * Run this after manual import to verify everything is working
 */

const https = require('https');

const N8N_BASE_URL = 'https://n8n-production-81b6.up.railway.app';

function makeRequest(url, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'N8N-Verification-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function verifySetup() {
  console.log('🔍 N8N SETUP VERIFICATION');
  console.log('=' .repeat(50));
  
  const tests = [
    {
      name: 'WhatsApp Webhook',
      url: `${N8N_BASE_URL}/webhook/whatsapp`,
      data: {
        test: true,
        from: '+1234567890',
        message: 'Test message',
        timestamp: new Date().toISOString()
      },
      expectedCodes: [200, 202] // Success codes
    },
    {
      name: 'Email Marketing Webhook',
      url: `${N8N_BASE_URL}/webhook/email-marketing-final`,
      data: {
        test: true,
        subject: 'Test Campaign',
        htmlContent: '<h1>Test Email</h1>',
        contacts: [
          { email: 'test@example.com', name: 'Test User' }
        ]
      },
      expectedCodes: [200, 202] // Success codes
    }
  ];

  let allPassed = true;

  for (const test of tests) {
    console.log(`\n🧪 Testing ${test.name}...`);
    console.log(`   URL: ${test.url}`);
    
    try {
      const response = await makeRequest(test.url, 'POST', test.data);
      console.log(`   Status: HTTP ${response.statusCode}`);
      
      if (response.statusCode === 404) {
        console.log('   ❌ WEBHOOK NOT FOUND');
        console.log('   → Workflow not imported or not active');
        console.log('   → Check N8N web interface and activate workflow');
        allPassed = false;
      } else if (test.expectedCodes.includes(response.statusCode)) {
        console.log('   ✅ WEBHOOK ACTIVE AND RESPONDING');
        if (response.data && typeof response.data === 'object') {
          console.log(`   → Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        }
      } else if (response.statusCode === 400) {
        console.log('   ⚠️  WEBHOOK ACTIVE BUT VALIDATION ERROR');
        console.log('   → This is normal for test data');
        console.log('   → Workflow is imported and active');
      } else if (response.statusCode === 500) {
        console.log('   ❌ SERVER ERROR');
        console.log('   → Check workflow configuration');
        console.log('   → Verify credentials are set up correctly');
        if (response.data) {
          console.log(`   → Error: ${JSON.stringify(response.data).substring(0, 200)}...`);
        }
        allPassed = false;
      } else {
        console.log(`   ⚠️  UNEXPECTED RESPONSE: ${response.statusCode}`);
        if (response.data) {
          console.log(`   → Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ CONNECTION ERROR: ${error.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + '=' .repeat(50));
  
  if (allPassed) {
    console.log('🎉 VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('\n✅ Next steps:');
    console.log('   1. Test with real data');
    console.log('   2. Monitor N8N executions tab');
    console.log('   3. Check logs for any issues');
  } else {
    console.log('⚠️  VERIFICATION FOUND ISSUES');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Login to N8N web interface');
    console.log('   2. Import workflows if missing');
    console.log('   3. Activate workflows (toggle in top-right)');
    console.log('   4. Configure all required credentials');
    console.log('   5. Check workflow executions for errors');
  }

  console.log('\n📋 Manual verification checklist:');
  console.log('   □ N8N web interface accessible');
  console.log('   □ WhatsApp workflow imported and active');
  console.log('   □ Email Marketing workflow imported and active');
  console.log('   □ All credentials configured');
  console.log('   □ Database connections working');
  console.log('   □ Email sending tested with real Gmail');
  console.log('\n🌐 N8N Interface: ' + N8N_BASE_URL);
}

// Run verification
if (require.main === module) {
  verifySetup().catch(console.error);
}

module.exports = { verifySetup };