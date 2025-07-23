// Script para testar a API de email marketing em produção
const https = require('https');

async function testProductionAPI() {
  console.log('🔍 Testando API de produção...');
  
  // Teste 1: Verificar se o endpoint stats está funcionando
  try {
    console.log('\n📊 Teste 1: Verificando endpoint stats...');
    const statsResponse = await makeRequest('https://www.fly2any.com/api/email-marketing?action=stats');
    console.log('✅ Stats funcionando:', statsResponse.success ? 'SIM' : 'NÃO');
    if (statsResponse.data) {
      console.log('   Total contatos:', statsResponse.data.totalContacts);
      console.log('   Campanhas enviadas:', statsResponse.data.campaignsSent);
    }
  } catch (error) {
    console.error('❌ Erro no stats:', error.message);
  }
  
  // Teste 2: Enviar email de teste via API
  try {
    console.log('\n📧 Teste 2: Enviando email de teste...');
    const testData = {
      action: 'send_test',
      email: 'fly2any.travel@gmail.com',
      campaignType: 'promotional'
    };
    
    const testResponse = await makePostRequest('https://www.fly2any.com/api/email-marketing', testData);
    console.log('✅ Email teste enviado:', testResponse.success ? 'SIM' : 'NÃO');
    if (testResponse.messageId) {
      console.log('   Message ID:', testResponse.messageId);
    }
    if (!testResponse.success && testResponse.error) {
      console.log('   Erro:', testResponse.error);
    }
  } catch (error) {
    console.error('❌ Erro no teste de email:', error.message);
  }
  
  // Teste 3: Verificar campanhas existentes
  try {
    console.log('\n📋 Teste 3: Verificando campanhas...');
    const campaignsResponse = await makeRequest('https://www.fly2any.com/api/email-marketing?action=campaigns');
    console.log('✅ Campanhas carregadas:', campaignsResponse.success ? 'SIM' : 'NÃO');
    if (campaignsResponse.data && campaignsResponse.data.campaigns) {
      console.log('   Total campanhas:', campaignsResponse.data.campaigns.length);
      const pendingCampaigns = campaignsResponse.data.campaigns.filter(c => c.status === 'sending');
      console.log('   Campanhas pendentes:', pendingCampaigns.length);
      
      if (pendingCampaigns.length > 0) {
        console.log('\n🔄 Teste 4: Tentando retry da campanha pendente...');
        const retryData = {
          action: 'retry_campaign',
          campaignId: pendingCampaigns[0].id
        };
        
        const retryResponse = await makePostRequest('https://www.fly2any.com/api/email-marketing', retryData);
        console.log('✅ Retry executado:', retryResponse.success ? 'SIM' : 'NÃO');
        if (!retryResponse.success && retryResponse.error) {
          console.log('   Erro retry:', retryResponse.error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro nas campanhas:', error.message);
  }
  
  console.log('\n✅ Testes concluídos!');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Erro ao parsear JSON: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          reject(new Error(`Erro ao parsear JSON: ${responseData.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Executar teste
testProductionAPI().catch(console.error);