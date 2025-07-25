#!/usr/bin/env node

/**
 * Script to import Email Marketing Workflow into N8N Railway Instance
 * This script imports the n8n-workflows/email-marketing-final.json workflow
 */

const fs = require('fs');
const path = require('path');

// N8N Configuration
const N8N_BASE_URL = 'https://n8n-production-81b6.up.railway.app';
const WORKFLOW_FILE = './n8n-workflows/email-marketing-final.json';

// Import fetch for Node.js
let fetch;
(async () => {
  if (!globalThis.fetch) {
    const { default: fetchModule } = await import('node-fetch');
    fetch = fetchModule;
  } else {
    fetch = globalThis.fetch;
  }
})();

/**
 * Test N8N connection and import workflow
 */
async function importEmailMarketingWorkflow() {
  try {
    console.log('🚀 Starting Email Marketing Workflow Import...\n');
    
    // 1. Test N8N Connection
    console.log('1️⃣ Testing N8N Connection...');
    await testN8NConnection();
    
    // 2. Load Workflow File
    console.log('\n2️⃣ Loading Workflow File...');
    const workflowData = await loadWorkflowFile();
    
    // 3. Import Workflow
    console.log('\n3️⃣ Importing Workflow...');
    await importWorkflow(workflowData);
    
    // 4. Test Webhook Endpoint
    console.log('\n4️⃣ Testing Webhook Endpoint...');
    await testWebhookEndpoint();
    
    console.log('\n✅ Email Marketing Workflow Import Complete!');
    console.log(`🌐 Webhook URL: ${N8N_BASE_URL}/webhook/email-marketing-final`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test N8N connection and health
 */
async function testN8NConnection() {
  try {
    // Import fetch dynamically
    if (!fetch) {
      const { default: fetchModule } = await import('node-fetch');
      fetch = fetchModule;
    }
    
    console.log(`   Testing: ${N8N_BASE_URL}/healthz`);
    const response = await fetch(`${N8N_BASE_URL}/healthz`);
    
    if (response.status === 200) {
      console.log('   ✅ N8N is online and healthy');
    } else {
      console.log(`   ⚠️ N8N responded with status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('   ❌ Connection failed:', error.message);
    throw new Error('N8N connection failed');
  }
}

/**
 * Load workflow from JSON file
 */
async function loadWorkflowFile() {
  try {
    const workflowPath = path.resolve(WORKFLOW_FILE);
    console.log(`   Loading: ${workflowPath}`);
    
    if (!fs.existsSync(workflowPath)) {
      throw new Error(`Workflow file not found: ${workflowPath}`);
    }
    
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    const workflowData = JSON.parse(workflowContent);
    
    console.log(`   ✅ Workflow loaded: "${workflowData.name}"`);
    console.log(`   📊 Nodes: ${workflowData.nodes.length}`);
    console.log(`   🔗 Connections: ${Object.keys(workflowData.connections).length}`);
    
    // Find webhook node details
    const webhookNode = workflowData.nodes.find(node => node.type === 'n8n-nodes-base.webhook');
    if (webhookNode) {
      console.log(`   🎯 Webhook path: /${webhookNode.parameters.path}`);
    }
    
    return workflowData;
  } catch (error) {
    console.error('   ❌ Failed to load workflow:', error.message);
    throw error;
  }
}

/**
 * Import workflow using N8N API
 */
async function importWorkflow(workflowData) {
  try {
    // Import fetch dynamically
    if (!fetch) {
      const { default: fetchModule } = await import('node-fetch');
      fetch = fetchModule;
    }
    
    console.log('   Attempting to import via N8N API...');
    
    // Try different API endpoints for importing workflows
    const endpoints = [
      '/api/v1/workflows',
      '/rest/workflows',
      '/api/workflows'
    ];
    
    let importSuccess = false;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Trying endpoint: ${endpoint}`);
        
        const response = await fetch(`${N8N_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(workflowData)
        });
        
        console.log(`   Response status: ${response.status}`);
        
        if (response.status === 200 || response.status === 201) {
          const result = await response.json();
          console.log('   ✅ Workflow imported successfully!');
          console.log(`   📝 Workflow ID: ${result.id || 'Unknown'}`);
          importSuccess = true;
          break;
        } else if (response.status === 401) {
          console.log('   🔒 Authentication required');
        } else if (response.status === 404) {
          console.log('   ❌ Endpoint not found');
        } else {
          const errorText = await response.text();
          console.log(`   ⚠️ Import failed: ${errorText}`);
        }
        
      } catch (endpointError) {
        console.log(`   ❌ Endpoint ${endpoint} failed: ${endpointError.message}`);
      }
    }
    
    if (!importSuccess) {
      console.log('\n   📋 Manual Import Instructions:');
      console.log('   1. Access N8N at: https://n8n-production-81b6.up.railway.app');
      console.log('   2. Go to Workflows → Import');
      console.log('   3. Upload the file: n8n-workflows/email-marketing-final.json');
      console.log('   4. Activate the workflow');
      console.log('   5. Test the webhook endpoint');
      
      // Save import-ready JSON
      const importFile = './email-marketing-workflow-import.json';
      fs.writeFileSync(importFile, JSON.stringify(workflowData, null, 2));
      console.log(`   💾 Import-ready file saved: ${importFile}`);
    }
    
  } catch (error) {
    console.error('   ❌ Import process failed:', error.message);
    throw error;
  }
}

/**
 * Test the webhook endpoint
 */
async function testWebhookEndpoint() {
  try {
    // Import fetch dynamically
    if (!fetch) {
      const { default: fetchModule } = await import('node-fetch');
      fetch = fetchModule;
    }
    
    const webhookUrl = `${N8N_BASE_URL}/webhook/email-marketing-final`;
    console.log(`   Testing: ${webhookUrl}`);
    
    const testPayload = {
      campaignId: 'test-campaign-' + Date.now(),
      campaignName: 'Test Campaign Import',
      subject: 'Test Email Subject',
      htmlContent: '<h1>Test Email</h1><p>This is a test email from the imported workflow.</p>',
      contacts: [
        { email: 'test@example.com', nome: 'Test User' }
      ]
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`   Response status: ${response.status}`);
    
    if (response.status === 200) {
      const result = await response.json();
      console.log('   ✅ Webhook is working!');
      console.log('   📊 Response:', JSON.stringify(result, null, 2));
    } else if (response.status === 404) {
      console.log('   ❌ Webhook not found - workflow may not be active');
    } else {
      const errorText = await response.text();
      console.log(`   ⚠️ Webhook test failed: ${errorText}`);
    }
    
  } catch (error) {
    console.error('   ❌ Webhook test failed:', error.message);
  }
}

/**
 * Display workflow summary
 */
function displayWorkflowSummary() {
  console.log('\n📋 Email Marketing Workflow Summary:');
  console.log('   ✉️ Email campaign processing');
  console.log('   📧 Gmail SMTP integration');
  console.log('   📦 Batch processing (10 emails per batch)');
  console.log('   ⏱️ Rate limiting (2 seconds between batches)');
  console.log('   📊 Campaign tracking');
  console.log('   👥 Contact management');
  console.log('   🎯 Webhook endpoint: /webhook/email-marketing-final');
  console.log('\n🔧 Required Configuration:');
  console.log('   • Gmail credentials for SMTP');
  console.log('   • Workflow activation');
  console.log('   • Rate limiting verification');
}

// Main execution
if (require.main === module) {
  displayWorkflowSummary();
  importEmailMarketingWorkflow();
}

module.exports = {
  importEmailMarketingWorkflow,
  testN8NConnection,
  testWebhookEndpoint
};