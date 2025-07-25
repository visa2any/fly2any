const https = require('https');

const N8N_WEBHOOK_URL = 'https://n8n-production-81b6.up.railway.app/webhook/whatsapp';

// Function to make HTTP requests
function makeRequest(url, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp-Test-Client/1.0'
      }
    };

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
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testWhatsAppWorkflow() {
  console.log('🧪 Testing WhatsApp Workflow Integration');
  console.log('🌐 Webhook URL:', N8N_WEBHOOK_URL);
  console.log('=' * 50);
  
  const testCases = [
    {
      name: '📱 Regular WhatsApp Message',
      description: 'Testing standard message processing',
      data: {
        event: 'whatsapp_message_received',
        data: {
          from: '+5511999887766',
          text: 'Olá! Preciso de uma cotação para voos de Miami para São Paulo',
          contactName: 'João Silva',
          timestamp: new Date().toISOString(),
          messageId: `msg_${Date.now()}`,
          isNewConversation: true
        }
      }
    },
    {
      name: '🎯 Lead Creation Event',
      description: 'Testing lead event processing',
      data: {
        event: 'whatsapp_lead_created',
        data: {
          phone: '+5511999887766',
          leadData: {
            origem: 'Miami',
            destino: 'São Paulo',
            dataPartida: '2025-08-15',
            numeroPassageiros: 2,
            intent: 'flight_booking',
            selectedServices: ['voos', 'hoteis']
          },
          confidence: 85,
          timestamp: new Date().toISOString()
        }
      }
    },
    {
      name: '🚨 Urgent Message',
      description: 'Testing urgent message handling',
      data: {
        event: 'whatsapp_message_received',
        data: {
          from: '+5511999887766',
          text: 'URGENTE! Meu voo foi cancelado e preciso de ajuda imediata!',
          contactName: 'Maria Emergência',
          timestamp: new Date().toISOString(),
          messageId: `urgent_${Date.now()}`,
          isNewConversation: false
        }
      }
    },
    {
      name: '💰 Pricing Inquiry',
      description: 'Testing pricing request handling',
      data: {
        event: 'whatsapp_message_received',
        data: {
          from: '+5511999887766',
          text: 'Qual o preço de passagens para Orlando saindo de Brasília?',
          contactName: 'Carlos Viagem',
          timestamp: new Date().toISOString(),
          messageId: `price_${Date.now()}`,
          isNewConversation: true
        }
      }
    },
    {
      name: '👋 Greeting Message',
      description: 'Testing greeting auto-response',
      data: {
        event: 'whatsapp_message_received',
        data: {
          from: '+5511999887766',
          text: 'Oi! Bom dia!',
          contactName: 'Ana Saudação',
          timestamp: new Date().toISOString(),
          messageId: `greeting_${Date.now()}`,
          isNewConversation: true
        }
      }
    },
    {
      name: '🏨 Hotel Inquiry',
      description: 'Testing hotel inquiry processing',
      data: {
        event: 'whatsapp_message_received',
        data: {
          from: '+5511999887766', 
          text: 'Preciso de hotel em São Paulo para 3 noites, região Paulista',
          contactName: 'Roberto Hotel',
          timestamp: new Date().toISOString(),
          messageId: `hotel_${Date.now()}`,
          isNewConversation: false
        }
      }
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${i + 1}. ${testCase.name}`);
    console.log(`   ${testCase.description}`);
    console.log('   ⏳ Sending request...');
    
    try {
      const result = await makeRequest(N8N_WEBHOOK_URL, testCase.data);
      
      console.log(`   📊 Status: ${result.statusCode} ${result.statusMessage}`);
      
      if (result.statusCode === 200) {
        console.log('   ✅ SUCCESS - Webhook processed the request');
        
        // Try to parse response
        try {
          const responseData = JSON.parse(result.body);
          console.log('   📋 Response:', JSON.stringify(responseData, null, 2));
        } catch (e) {
          console.log('   📋 Response (text):', result.body.substring(0, 200));
        }
        
      } else if (result.statusCode === 404) {
        console.log('   ❌ FAILED - Webhook not found (workflow not imported/activated)');
        
      } else if (result.statusCode === 500) {
        console.log('   ⚠️ ERROR - Workflow error (check N8N logs)');
        console.log('   📋 Error details:', result.body.substring(0, 300));
        
      } else {
        console.log('   ⚠️ UNEXPECTED - Status:', result.statusCode);
        console.log('   📋 Response:', result.body.substring(0, 200));
      }
      
    } catch (error) {
      console.log('   ❌ REQUEST FAILED:', error.message);
    }
    
    // Add delay between requests
    if (i < testCases.length - 1) {
      console.log('   ⏱️ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('🌐 Webhook URL:', N8N_WEBHOOK_URL);
  console.log('📊 Total Tests:', testCases.length);
  
  console.log('\n📋 EXPECTED WORKFLOW BEHAVIOR:');
  console.log('✅ Regular messages → Intent detection → Auto-response/Ticket');
  console.log('🎯 Lead events → Lead processing → Sales notification');
  console.log('🚨 Urgent messages → High priority ticket → Immediate notification'); 
  console.log('💰 Pricing requests → Auto-response + Human notification');
  console.log('👋 Greetings → Auto-response during business hours');
  console.log('🏨 Hotel inquiries → Contextualized response');
  
  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('• 404 Error → Workflow not imported or not active');
  console.log('• 500 Error → Check N8N workflow execution logs');
  console.log('• Timeout → Check N8N instance status');
  console.log('• No response → Verify webhook endpoint configuration');
  
  console.log('\n📖 Next Steps:');
  console.log('1. Import workflow: Use manual-whatsapp-import-guide.md');
  console.log('2. Check N8N logs: Access N8N admin interface');
  console.log('3. Verify activation: Ensure workflow toggle is "Active"');
  console.log('4. Test individual nodes: Use N8N test execution');
}

console.log('🚀 WhatsApp Workflow Test Suite');
console.log('⏰ Starting in 3 seconds...\n');

setTimeout(() => {
  testWhatsAppWorkflow().catch(error => {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  });
}, 3000);