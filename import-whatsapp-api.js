const fs = require('fs');
const https = require('https');

const N8N_BASE_URL = 'https://n8n-production-81b6.up.railway.app';

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    
    req.end();
  });
}

async function importWhatsAppWorkflow() {
  console.log('🚀 Starting WhatsApp Workflow Import via API...');
  console.log('🌐 N8N Instance:', N8N_BASE_URL);
  console.log('🎯 Target webhook: /webhook/whatsapp');
  
  try {
    // Step 1: Test N8N connectivity
    console.log('\n🔍 Step 1: Testing N8N connectivity...');
    
    const healthCheck = await makeRequest({
      hostname: 'n8n-production-81b6.up.railway.app',
      port: 443,
      path: '/healthz',
      method: 'GET'
    });
    
    console.log(`Health check: ${healthCheck.statusCode} ${healthCheck.statusMessage}`);
    
    if (healthCheck.statusCode === 200) {
      console.log('✅ N8N instance is online');
    } else {
      console.log('⚠️ N8N instance health check returned:', healthCheck.statusCode);
    }
    
    // Step 2: Test webhook endpoint (this will fail if workflow doesn't exist)
    console.log('\n🔍 Step 2: Testing current webhook endpoint...');
    
    const webhookTest = await makeRequest({
      hostname: 'n8n-production-81b6.up.railway.app',
      port: 443,
      path: '/webhook/whatsapp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({ test: true }));
    
    console.log(`Webhook test: ${webhookTest.statusCode} ${webhookTest.statusMessage}`);
    
    if (webhookTest.statusCode === 404) {
      console.log('❌ WhatsApp webhook does not exist yet - needs to be imported');
    } else if (webhookTest.statusCode === 200) {
      console.log('✅ WhatsApp webhook already exists and is working');
      return;
    } else {
      console.log('ℹ️ Webhook returned:', webhookTest.statusCode);
    }
    
    // Step 3: Try to access N8N API (likely requires auth)
    console.log('\n🔍 Step 3: Testing N8N API access...');
    
    const apiTest = await makeRequest({
      hostname: 'n8n-production-81b6.up.railway.app',
      port: 443,
      path: '/api/v1/workflows',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`API test: ${apiTest.statusCode} ${apiTest.statusMessage}`);
    
    if (apiTest.statusCode === 401) {
      console.log('🔒 N8N API requires authentication');
      console.log('📋 Manual import required through web interface');
    } else if (apiTest.statusCode === 200) {
      console.log('✅ N8N API is accessible');
      
      // If API is accessible, try to import workflow
      console.log('\n🔍 Step 4: Attempting workflow import via API...');
      
      const workflowPath = '/mnt/d/Users/vilma/fly2any/n8n-workflows/whatsapp-automation-complete.json';
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      const workflowData = JSON.parse(workflowContent);
      
      console.log(`📄 Loaded workflow: ${workflowData.name}`);
      
      const importResult = await makeRequest({
        hostname: 'n8n-production-81b6.up.railway.app',
        port: 443,
        path: '/api/v1/workflows',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, workflowData);
      
      console.log(`Import result: ${importResult.statusCode} ${importResult.statusMessage}`);
      
      if (importResult.statusCode === 201 || importResult.statusCode === 200) {
        console.log('✅ Workflow imported successfully via API');
        
        // Try to activate the workflow
        const importedWorkflow = JSON.parse(importResult.body);
        if (importedWorkflow.id) {
          console.log('\n🔍 Step 5: Attempting to activate workflow...');
          
          const activateResult = await makeRequest({
            hostname: 'n8n-production-81b6.up.railway.app',
            port: 443,
            path: `/api/v1/workflows/${importedWorkflow.id}/activate`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`Activation result: ${activateResult.statusCode} ${activateResult.statusMessage}`);
          
          if (activateResult.statusCode === 200) {
            console.log('✅ Workflow activated successfully');
          } else {
            console.log('⚠️ Could not activate workflow automatically');
          }
        }
        
      } else {
        console.log('❌ Could not import workflow via API');
        console.log('Response:', importResult.body);
      }
    }
    
    // Step 4: Final webhook test
    console.log('\n🔍 Final: Testing webhook after import attempt...');
    
    const finalTest = await makeRequest({
      hostname: 'n8n-production-81b6.up.railway.app',
      port: 443,
      path: '/webhook/whatsapp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({
      event: 'whatsapp_message_received',
      data: {
        from: '+1234567890',
        text: 'Test message',
        contactName: 'Test User',
        timestamp: new Date().toISOString(),
        messageId: 'test_123',
        isNewConversation: true
      }
    }));
    
    console.log(`Final webhook test: ${finalTest.statusCode} ${finalTest.statusMessage}`);
    
    if (finalTest.statusCode === 200) {
      console.log('🎉 SUCCESS! WhatsApp webhook is working');
      console.log('📋 Response:', finalTest.body);
    } else if (finalTest.statusCode === 404) {
      console.log('❌ Webhook still not found - manual import required');
    } else {
      console.log('ℹ️ Webhook response:', finalTest.statusCode, finalTest.body);
    }
    
  } catch (error) {
    console.error('❌ Error during import process:', error.message);
  }
  
  // Print summary and instructions
  console.log('\n' + '='.repeat(60));
  console.log('📋 WHATSAPP WORKFLOW IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log('🌐 N8N Instance: https://n8n-production-81b6.up.railway.app');
  console.log('🎯 Target Webhook: https://n8n-production-81b6.up.railway.app/webhook/whatsapp');
  console.log('📄 Workflow File: n8n-workflows/whatsapp-automation-complete.json');
  
  console.log('\n🚀 WORKFLOW FEATURES:');
  console.log('✅ WhatsApp message processing');
  console.log('✅ Intent detection and routing');
  console.log('✅ Lead creation event handling');
  console.log('✅ Auto-response generation');
  console.log('✅ Support ticket creation');
  console.log('✅ Email notifications via Resend');
  console.log('✅ Business hours awareness');
  console.log('✅ Priority-based message handling');
  
  console.log('\n📋 MANUAL IMPORT STEPS (if API import failed):');
  console.log('1. Open: https://n8n-production-81b6.up.railway.app');
  console.log('2. Login to N8N interface');
  console.log('3. Click "Import from JSON" or create new workflow');
  console.log('4. Paste content from: n8n-workflows/whatsapp-automation-complete.json');
  console.log('5. Click "Import" and then "Save"');
  console.log('6. Toggle workflow to "Active" state');
  console.log('7. Test webhook at: /webhook/whatsapp');
  
  console.log('\n🧪 TEST COMMAND:');
  console.log('curl -X POST https://n8n-production-81b6.up.railway.app/webhook/whatsapp \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"event":"whatsapp_message_received","data":{"from":"+1234567890","text":"Test","contactName":"Test","timestamp":"' + new Date().toISOString() + '","messageId":"test_123","isNewConversation":true}}\'');
  
  console.log('\n📖 Full manual guide: manual-whatsapp-import-guide.md');
  console.log('🤖 Automation script: import-whatsapp-workflow.js (requires GUI environment)');
}

// Check if workflow file exists
const workflowPath = '/mnt/d/Users/vilma/fly2any/n8n-workflows/whatsapp-automation-complete.json';
if (!fs.existsSync(workflowPath)) {
  console.error('❌ Workflow file not found:', workflowPath);
  process.exit(1);
}

importWhatsAppWorkflow();