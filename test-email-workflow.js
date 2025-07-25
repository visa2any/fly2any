#!/usr/bin/env node

/**
 * Test script for the imported Email Marketing Workflow
 * Tests the webhook endpoint: /webhook/email-marketing-final
 */

// Import fetch for Node.js
let fetch;

async function testEmailWorkflow() {
  try {
    // Import fetch dynamically
    if (!fetch) {
      const { default: fetchModule } = await import('node-fetch');
      fetch = fetchModule;
    }

    const webhookUrl = 'https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final';
    
    console.log('🧪 Testing Email Marketing Workflow...\n');
    console.log(`📡 Webhook URL: ${webhookUrl}`);
    
    // Test payload with sample data
    const campaignId = `test-campaign-${Date.now()}`;
    const testPayload = {
      campaignId: campaignId,
      campaignName: 'Test Campaign - Import Verification',
      subject: '🎉 Email Marketing Workflow Test',
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">🎉 Workflow Test Successful!</h1>
            <p>Hello <strong>{{nome}}</strong>,</p>
            <p>This is a test email from your newly imported Email Marketing Workflow.</p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>✅ Workflow Features Verified:</h3>
              <ul>
                <li>✉️ Email campaign processing</li>
                <li>📧 Gmail SMTP integration</li>
                <li>📦 Batch processing (10 emails per batch)</li>
                <li>⏱️ Rate limiting (2 seconds between batches)</li>
                <li>📊 Campaign tracking</li>
                <li>👥 Contact management</li>
              </ul>
            </div>
            <p>Campaign ID: <code>${campaignId}</code></p>
            <p>Timestamp: <code>${new Date().toISOString()}</code></p>
            <hr>
            <p style="color: #6b7280; font-size: 14px;">
              This email was sent via N8N Railway instance for testing purposes.
            </p>
          </body>
        </html>
      `,
      contacts: [
        {
          email: 'test1@example.com',
          nome: 'Test User One'
        },
        {
          email: 'test2@example.com',
          nome: 'Test User Two'
        },
        {
          email: 'admin@fly2any.com',
          nome: 'Fly2Any Admin'
        }
      ]
    };
    
    console.log('📦 Test Payload:');
    console.log(`   Campaign ID: ${testPayload.campaignId}`);
    console.log(`   Subject: ${testPayload.subject}`);
    console.log(`   Contacts: ${testPayload.contacts.length}`);
    console.log(`   HTML Content: ${testPayload.htmlContent.length} chars`);
    
    console.log('\n🚀 Sending request...');
    
    const startTime = Date.now();
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Fly2Any-EmailWorkflow-Test/1.0'
      },
      body: JSON.stringify(testPayload)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`⏱️ Response Time: ${responseTime}ms`);
    
    if (response.status === 200) {
      console.log('✅ SUCCESS: Workflow is working!');
      
      try {
        const result = await response.json();
        console.log('\n📋 Response Data:');
        console.log(JSON.stringify(result, null, 2));
        
        // Validate response structure
        if (result.success && result.campaignId && result.totalContacts) {
          console.log('\n🎯 Response Validation:');
          console.log(`   ✅ Success: ${result.success}`);
          console.log(`   ✅ Campaign ID: ${result.campaignId}`);
          console.log(`   ✅ Total Contacts: ${result.totalContacts}`);
          console.log(`   ✅ Timestamp: ${result.timestamp}`);
          console.log(`   ✅ Message: ${result.message}`);
        }
        
      } catch (jsonError) {
        console.log('⚠️ Response is not JSON:', await response.text());
      }
      
    } else if (response.status === 404) {
      console.log('❌ ERROR: Webhook not found');
      console.log('   Possible causes:');
      console.log('   • Workflow not imported yet');
      console.log('   • Workflow not activated');
      console.log('   • Incorrect webhook path');
      console.log('\n📋 Next Steps:');
      console.log('   1. Import the workflow manually');
      console.log('   2. Activate the workflow');
      console.log('   3. Verify webhook path: /webhook/email-marketing-final');
      
    } else if (response.status === 500) {
      console.log('❌ ERROR: Internal server error');
      console.log('   Possible causes:');
      console.log('   • Gmail credentials not configured');
      console.log('   • Workflow configuration error');
      console.log('   • Node connection issues');
      
      try {
        const errorText = await response.text();
        console.log(`   Error details: ${errorText}`);
      } catch (e) {
        console.log('   Could not read error details');
      }
      
    } else {
      console.log(`❌ ERROR: Unexpected status ${response.status}`);
      try {
        const errorText = await response.text();
        console.log(`   Response: ${errorText}`);
      } catch (e) {
        console.log('   Could not read response');
      }
    }
    
    console.log('\n🎯 Test Summary:');
    console.log(`   Status: ${response.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Response Time: ${responseTime}ms`);
    console.log(`   Webhook URL: ${webhookUrl}`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check internet connection');
    console.log('   • Verify N8N instance is running');
    console.log('   • Confirm webhook URL is correct');
  }
}

// Additional test function for multiple campaigns
async function testMultipleCampaigns() {
  console.log('\n🔄 Testing Multiple Campaigns...\n');
  
  const campaigns = [
    {
      name: 'Welcome Series',
      subject: 'Welcome to Fly2Any! 🎉',
      contacts: 2
    },
    {
      name: 'Newsletter',
      subject: 'Weekly Newsletter - Travel Deals',
      contacts: 5
    },
    {
      name: 'Promotional',
      subject: '🔥 Hot Travel Deals This Week!',
      contacts: 3
    }
  ];
  
  for (let i = 0; i < campaigns.length; i++) {
    const campaign = campaigns[i];
    console.log(`📧 Testing Campaign ${i + 1}: ${campaign.name}`);
    
    // Generate test contacts
    const contacts = [];
    for (let j = 0; j < campaign.contacts; j++) {
      contacts.push({
        email: `test${i}${j}@example.com`,
        nome: `Test User ${i}-${j}`
      });
    }
    
    // Add delay between campaigns
    if (i > 0) {
      console.log('   ⏱️ Waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // This would call the same test function with different data
    console.log(`   ✅ Campaign prepared with ${contacts.length} contacts`);
  }
  
  console.log('\n🎯 Multiple campaign test simulation complete');
}

// Main execution
if (require.main === module) {
  console.log('🎯 Email Marketing Workflow Test Suite\n');
  
  testEmailWorkflow()
    .then(() => {
      console.log('\n🏁 Test completed!');
    })
    .catch(error => {
      console.error('💥 Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  testEmailWorkflow,
  testMultipleCampaigns
};