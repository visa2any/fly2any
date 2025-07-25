// Teste de API N8N para criar workflow de email marketing
const fetch = require('node-fetch');

const N8N_BASE_URL = 'https://n8n-production-81b6.up.railway.app';

async function testN8NConnection() {
  try {
    console.log('🔍 Testando conexão com N8N...');
    
    // Testar endpoint de health/status
    const healthResponse = await fetch(`${N8N_BASE_URL}/healthz`);
    console.log('Health Status:', healthResponse.status);
    
    if (healthResponse.status === 200) {
      console.log('✅ N8N está online!');
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
    
    // Tentar acessar endpoint de webhook diretamente
    console.log('🧪 Testando webhook endpoints...');
    
    const webhookTest = await fetch(`${N8N_BASE_URL}/webhook/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    console.log('Webhook test status:', webhookTest.status);
    
    // Testar o webhook de email marketing atual
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
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar N8N:', error.message);
  }
}

testN8NConnection();