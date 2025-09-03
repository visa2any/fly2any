// Test MailerSend Integration
const testMailerSend = async () => {
  try {
    console.log('🚀 Testing MailerSend integration...\n');
    
    // Test 1: Simple test email
    console.log('1️⃣ Sending test email...');
    const testResponse = await fetch('http://localhost:3000/api/test-mailersend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        to: 'fly2any.travel@gmail.com' // Your email
      })
    });
    
    const testResult = await testResponse.json();
    console.log('Test email result:', testResult);
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Lead notification
    console.log('\n2️⃣ Sending lead notification...');
    const leadResponse = await fetch('http://localhost:3000/api/test-mailersend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'lead',
        data: {
          name: 'Test Customer',
          email: 'customer@example.com',
          phone: '+1 555-987-6543'
        }
      })
    });
    
    const leadResult = await leadResponse.json();
    console.log('Lead notification result:', leadResult);
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Welcome email
    console.log('\n3️⃣ Sending welcome email...');
    const welcomeResponse = await fetch('http://localhost:3000/api/test-mailersend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: 'fly2any.travel@gmail.com', // Your email
        data: {
          name: 'New Customer'
        }
      })
    });
    
    const welcomeResult = await welcomeResponse.json();
    console.log('Welcome email result:', welcomeResult);
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Quote ready email
    console.log('\n4️⃣ Sending quote ready email...');
    const quoteResponse = await fetch('http://localhost:3000/api/test-mailersend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'quote',
        to: 'fly2any.travel@gmail.com', // Your email
        data: {
          name: 'Customer Name'
        }
      })
    });
    
    const quoteResult = await quoteResponse.json();
    console.log('Quote email result:', quoteResult);
    
    console.log('\n✅ All tests completed! Check your inbox for the emails.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testMailerSend();