#!/usr/bin/env node

/**
 * 🚀 COMPREHENSIVE N8N WORKFLOW IMPORT SYSTEM
 * 
 * Attempts API import first, then provides detailed manual instructions
 * Handles both WhatsApp and Email Marketing workflows
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const N8N_BASE_URL = 'https://n8n-production-81b6.up.railway.app';
const WORKFLOWS_DIR = './n8n-workflows';

// Available API tokens to try (from project files)
const API_TOKENS = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZDdlODRhOC1iYWY1LTRhNmQtYjY0OC1kODlmYzg5ODI1Y2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzNDc4MDI0fQ.7vs_cgz0CbNq_URBbZIBcoL_xHxH0sTUbFJOxC_-o48'
];

console.log('🚀 N8N COMPREHENSIVE WORKFLOW IMPORT');
console.log('=' .repeat(60));

/**
 * Make authenticated request to N8N API
 */
function makeN8NRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${N8N_BASE_URL}${path}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'N8N-Import-Script/1.0'
      }
    };

    // Try different authentication methods
    if (token) {
      // Try both common header formats
      options.headers['Authorization'] = `Bearer ${token}`;
      options.headers['X-N8N-API-KEY'] = token;
    }

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

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

/**
 * Test N8N API connectivity and authentication
 */
async function testN8NConnection() {
  console.log('\n🔍 TESTING N8N API CONNECTIVITY...\n');
  
  // Test basic connectivity
  try {
    const basicTest = await makeN8NRequest('/rest/workflows');
    console.log(`📡 Basic connectivity: HTTP ${basicTest.statusCode}`);
    
    if (basicTest.statusCode === 401) {
      console.log('🔒 Authentication required (as expected)');
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }

  // Test authentication with available tokens
  for (let i = 0; i < API_TOKENS.length; i++) {
    const token = API_TOKENS[i];
    console.log(`\n🔑 Testing token ${i + 1}/${API_TOKENS.length}...`);
    
    try {
      const authTest = await makeN8NRequest('/rest/workflows', 'GET', null, token);
      console.log(`   Status: HTTP ${authTest.statusCode}`);
      
      if (authTest.statusCode === 200) {
        console.log('✅ Authentication successful!');
        console.log(`   Found ${authTest.data.length || 0} existing workflows`);
        return token;
      } else if (authTest.statusCode === 401) {
        console.log('❌ Token expired or invalid');
      } else {
        console.log(`   Response: ${JSON.stringify(authTest.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  return false;
}

/**
 * List existing workflows
 */
async function listWorkflows(token) {
  console.log('\n📋 LISTING EXISTING WORKFLOWS...\n');
  
  try {
    const response = await makeN8NRequest('/rest/workflows', 'GET', null, token);
    
    if (response.statusCode === 200 && response.data.length) {
      console.log(`Found ${response.data.length} existing workflows:`);
      response.data.forEach((workflow, index) => {
        console.log(`  ${index + 1}. ${workflow.name} (ID: ${workflow.id}, Active: ${workflow.active})`);
      });
      return response.data;
    } else {
      console.log('No workflows found or access denied');
      return [];
    }
  } catch (error) {
    console.log('❌ Failed to list workflows:', error.message);
    return [];
  }
}

/**
 * Import a workflow
 */
async function importWorkflow(workflowPath, token) {
  console.log(`\n📤 IMPORTING WORKFLOW: ${path.basename(workflowPath)}`);
  
  try {
    if (!fs.existsSync(workflowPath)) {
      console.log(`❌ Workflow file not found: ${workflowPath}`);
      return false;
    }

    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    console.log(`   Workflow name: ${workflowData.name}`);
    console.log(`   Nodes: ${workflowData.nodes ? workflowData.nodes.length : 0}`);

    const response = await makeN8NRequest('/rest/workflows', 'POST', workflowData, token);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Workflow imported successfully!');
      console.log(`   ID: ${response.data.id}`);
      return response.data;
    } else {
      console.log(`❌ Import failed: HTTP ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Import error: ${error.message}`);
    return false;
  }
}

/**
 * Activate a workflow
 */
async function activateWorkflow(workflowId, token) {
  console.log(`\n⚡ ACTIVATING WORKFLOW: ${workflowId}`);
  
  try {
    const response = await makeN8NRequest(`/rest/workflows/${workflowId}/activate`, 'POST', {}, token);
    
    if (response.statusCode === 200) {
      console.log('✅ Workflow activated successfully!');
      return true;
    } else {
      console.log(`❌ Activation failed: HTTP ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Activation error: ${error.message}`);
    return false;
  }
}

/**
 * Test webhook endpoints
 */
async function testWebhooks() {
  console.log('\n🔗 TESTING WEBHOOK ENDPOINTS...\n');
  
  const webhooks = [
    { name: 'WhatsApp', path: '/webhook/whatsapp' },
    { name: 'Email Marketing', path: '/webhook/email-marketing-final' }
  ];

  for (const webhook of webhooks) {
    console.log(`Testing ${webhook.name} webhook...`);
    
    try {
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'import-script'
      };

      const response = await makeN8NRequest(webhook.path, 'POST', testData);
      console.log(`   ${webhook.name}: HTTP ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log(`   ✅ ${webhook.name} webhook is active and responding`);
      } else if (response.statusCode === 404) {
        console.log(`   ❌ ${webhook.name} webhook not found - workflow may not be active`);
      } else {
        console.log(`   ⚠️  ${webhook.name} webhook responded with status ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ ${webhook.name} webhook test failed: ${error.message}`);
    }
  }
}

/**
 * Generate manual import instructions
 */
function generateManualInstructions() {
  console.log('\n📖 MANUAL IMPORT INSTRUCTIONS');
  console.log('=' .repeat(60));
  
  const instructions = `
🌐 N8N WEB INTERFACE ACCESS:
   URL: ${N8N_BASE_URL}
   
🔐 AUTHENTICATION METHODS:
   1. Default admin credentials (if first setup)
   2. OAuth login (Google, GitHub, etc.)
   3. Email/password combination
   4. Environment-based authentication

📋 STEP-BY-STEP IMPORT PROCESS:

1. 🌐 OPEN N8N WEB INTERFACE
   - Navigate to: ${N8N_BASE_URL}
   - Log in using available credentials

2. 📤 IMPORT WHATSAPP WORKFLOW
   - Click "+ New Workflow" or "Import from JSON"
   - Navigate to: n8n-workflows/whatsapp-automation-complete.json
   - Copy the entire JSON content
   - Paste into N8N import dialog
   - Click "Import"
   - Save the workflow

3. 📧 IMPORT EMAIL MARKETING WORKFLOW  
   - Repeat process for: n8n-workflows/email-marketing-final.json
   - Copy JSON content
   - Import and save

4. ⚙️ CONFIGURE CREDENTIALS
   WhatsApp Workflow:
   - Set up WhatsApp Business API credentials
   - Configure webhook URLs
   - Set authentication tokens
   
   Email Marketing Workflow:
   - Configure Gmail SMTP settings:
     * Email: your-email@gmail.com
     * App Password: 16-digit Gmail app password
   - Set up database connections if needed

5. ⚡ ACTIVATE WORKFLOWS
   - Open each imported workflow
   - Click the "Active" toggle in top-right corner
   - Ensure status shows "Active"

6. 🧪 TEST WEBHOOK ENDPOINTS
   - WhatsApp: ${N8N_BASE_URL}/webhook/whatsapp
   - Email Marketing: ${N8N_BASE_URL}/webhook/email-marketing-final
   
   Use tools like Postman or curl to send test requests:
   
   curl -X POST ${N8N_BASE_URL}/webhook/whatsapp \\
     -H "Content-Type: application/json" \\
     -d '{"test": true, "message": "Hello World"}'

7. 🔍 VERIFY EXECUTION
   - Check N8N executions tab
   - Monitor logs for any errors
   - Test with real data

📊 WORKFLOW SUMMARY:

WhatsApp Automation (whatsapp-automation-complete.json):
- Webhook endpoint: /webhook/whatsapp
- Processes incoming WhatsApp messages
- Lead detection and qualification
- Automated responses based on business hours
- Integration with CRM/database

Email Marketing (email-marketing-final.json):  
- Webhook endpoint: /webhook/email-marketing-final
- Batch email sending via Gmail
- Contact list processing
- HTML email support
- Delivery tracking

🚨 TROUBLESHOOTING:

Common Issues:
1. 401 Unauthorized → Check authentication
2. 404 Not Found → Verify workflow is active and saved
3. 500 Server Error → Check credentials and configurations
4. Timeout → Verify N8N instance is running

Credential Requirements:
- Gmail: App Password (not regular password)
- WhatsApp: Business API token and webhook verification
- Database: Connection string and credentials

🔗 HELPFUL LINKS:
- N8N Documentation: https://docs.n8n.io/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
`;

  console.log(instructions);
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Test connectivity and authentication
    const validToken = await testN8NConnection();
    
    if (validToken) {
      console.log('\n🎉 API ACCESS AVAILABLE - PROCEEDING WITH AUTOMATED IMPORT\n');
      
      // List existing workflows
      const existingWorkflows = await listWorkflows(validToken);
      
      // Import workflows
      const workflowsToImport = [
        path.join(WORKFLOWS_DIR, 'whatsapp-automation-complete.json'),
        path.join(WORKFLOWS_DIR, 'email-marketing-final.json')
      ];
      
      const importedWorkflows = [];
      
      for (const workflowPath of workflowsToImport) {
        const imported = await importWorkflow(workflowPath, validToken);
        if (imported) {
          importedWorkflows.push(imported);
        }
      }
      
      // Activate imported workflows
      for (const workflow of importedWorkflows) {
        await activateWorkflow(workflow.id, validToken);
      }
      
      // Test webhooks
      await testWebhooks();
      
      console.log('\n✅ AUTOMATED IMPORT COMPLETED!');
      
    } else {
      console.log('\n⚠️  API ACCESS NOT AVAILABLE - PROVIDING MANUAL INSTRUCTIONS\n');
    }
    
    // Always provide manual instructions as backup
    generateManualInstructions();
    
  } catch (error) {
    console.error('\n❌ SCRIPT ERROR:', error.message);
    console.log('\nFalling back to manual instructions...');
    generateManualInstructions();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  testN8NConnection,
  listWorkflows,
  importWorkflow,
  activateWorkflow,
  testWebhooks
};