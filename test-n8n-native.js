// Teste de API N8N usando fetch nativo (Node.js 18+)
const N8N_BASE_URL = 'https://n8n-production-81b6.up.railway.app';

async function testN8NConnection() {
  try {
    console.log('🔍 Testando conexão com N8N...');
    
    // Testar endpoint de health/status
    try {
      const healthResponse = await fetch(`${N8N_BASE_URL}/healthz`);
      console.log('Health Status:', healthResponse.status);
      
      if (healthResponse.status === 200) {
        console.log('✅ N8N está online!');
      }
    } catch (e) {
      console.log('⚠️ Endpoint /healthz não disponível');
    }
    
    // Testar endpoint de workflows (pode necessitar auth)
    try {
      const workflowsResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Workflows API Status:', workflowsResponse.status);
      
      if (workflowsResponse.status === 200) {
        const workflows = await workflowsResponse.json();
        console.log('📋 Workflows existentes:', workflows);
      } else if (workflowsResponse.status === 401) {
        console.log('🔒 API requer autenticação');
      }
      
    } catch (apiError) {
      console.log('⚠️ API não acessível:', apiError.message);
    }
    
    // Testar o webhook de email marketing atual
    console.log('🧪 Testando webhook de email marketing...');
    try {
      const emailWebhookTest = await fetch(`${N8N_BASE_URL}/webhook/email-marketing-final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: 'test',
          campaignName: 'Test Campaign',
          subject: 'Test Subject',
          htmlContent: '<p>Test</p>',
          contacts: [{ email: 'test@test.com', nome: 'Test' }]
        })
      });
      
      console.log('Email Marketing Webhook Status:', emailWebhookTest.status);
      
      if (emailWebhookTest.status === 404) {
        console.log('❌ Webhook de email marketing não existe - precisa ser criado!');
      } else if (emailWebhookTest.status === 200) {
        console.log('✅ Webhook de email marketing está funcionando!');
        const response = await emailWebhookTest.text();
        console.log('Response:', response);
      } else {
        console.log('📄 Response text:', await emailWebhookTest.text());
      }
    } catch (webhookError) {
      console.log('❌ Erro ao testar webhook:', webhookError.message);
    }
    
    // Testar outros endpoints comuns
    console.log('🔍 Testando outros endpoints...');
    const endpoints = [
      '/webhook/email-campaign',
      '/webhook/test',
      '/api/v1/health'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${N8N_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`${endpoint}: ${response.status}`);
      } catch (e) {
        console.log(`${endpoint}: ERROR`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testN8NConnection();