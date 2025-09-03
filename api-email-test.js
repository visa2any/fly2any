const fetch = require('node-fetch');

async function testEmailAPI() {
  console.log('📧 Testing Gmail API Endpoint...');
  
  try {
    // Test GET endpoint first
    console.log('🔍 Testing GET /api/email-gmail');
    const getResponse = await fetch('http://localhost:3000/api/email-gmail', {
      method: 'GET',
      timeout: 5000
    });
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET Response:', JSON.stringify(getData, null, 2));
    } else {
      console.log('❌ GET Failed:', getResponse.status, getResponse.statusText);
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Server not running on localhost:3000');
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
  
  try {
    // Test POST endpoint
    console.log('📮 Testing POST /api/email-gmail');
    const testEmailData = {
      email: 'test@example.com',
      subject: 'Test Lead Notification',
      html: '<h1>Test Email</h1><p>This is a test email from the lead management system.</p>',
      text: 'Test Email - This is a test email from the lead management system.'
    };
    
    const postResponse = await fetch('http://localhost:3000/api/email-gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEmailData),
      timeout: 10000
    });
    
    const postData = await postResponse.json();
    
    if (postResponse.ok) {
      console.log('✅ POST Response:', JSON.stringify(postData, null, 2));
    } else {
      console.log('⚠️  POST Error Response:', JSON.stringify(postData, null, 2));
      
      // Check for common configuration issues
      if (postData.error && postData.error.includes('Credenciais Gmail não configuradas')) {
        console.log('🔧 Issue: Gmail environment variables not configured');
        console.log('   Required: GMAIL_EMAIL and GMAIL_APP_PASSWORD');
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Server not running on localhost:3000');
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

async function checkServerStatus() {
  console.log('🔍 Checking server status...');
  
  try {
    const response = await fetch('http://localhost:3000/', {
      method: 'GET',
      timeout: 3000
    });
    
    if (response.ok) {
      console.log('✅ Server is running on localhost:3000');
      return true;
    } else {
      console.log('⚠️  Server responded with:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running on localhost:3000');
    } else {
      console.log('❌ Server check failed:', error.message);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Starting API Email Test...\n');
  
  const serverRunning = await checkServerStatus();
  console.log('');
  
  if (serverRunning) {
    await testEmailAPI();
  } else {
    console.log('⚠️  Cannot test email API without running server');
    console.log('   To start server: npm run dev');
  }
  
  console.log('\n📊 Test Complete!');
}

main().catch(console.error);