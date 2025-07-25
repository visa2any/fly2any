const https = require('https');

async function testEmailMarketingAPI() {
  console.log('🔍 Testando APIs de Email Marketing...\n');

  const baseUrl = 'https://www.fly2any.com';
  const endpoints = [
    '/api/email-marketing?action=campaigns',
    '/api/email-marketing?action=contacts&limit=5',
    '/api/email-templates?action=list'
  ];

  for (const endpoint of endpoints) {
    console.log(`📡 Testando: ${endpoint}`);
    
    try {
      const response = await makeRequest(baseUrl + endpoint);
      console.log(`✅ Status: ${response.statusCode}`);
      
      if (response.data) {
        const parsed = JSON.parse(response.data);
        console.log(`📊 Dados recebidos:`, JSON.stringify(parsed, null, 2).substring(0, 500));
        
        // Análise específica
        if (endpoint.includes('campaigns')) {
          analyzeCariaigns(parsed);
        } else if (endpoint.includes('contacts')) {
          analyzeContacts(parsed);
        }
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    console.log('─'.repeat(80));
  }
}

function analyzeCariaigns(data) {
  if (data.success && data.data && data.data.campaigns) {
    const campaigns = data.data.campaigns;
    console.log(`📈 Total campanhas: ${campaigns.length}`);
    
    campaigns.forEach((c, i) => {
      console.log(`${i+1}. ${c.name} - Status: ${c.status}`);
      console.log(`   📧 Sent: ${c.total_sent}, Opened: ${c.total_opened}, Clicked: ${c.total_clicked}`);
    });
    
    const hasRealData = campaigns.some(c => c.total_sent > 0 || c.total_opened > 0);
    console.log(`🎯 Há dados reais? ${hasRealData ? 'SIM' : 'NÃO - TUDO ZERADO!'}`);
  }
}

function analyzeContacts(data) {
  if (data.success && data.data) {
    console.log(`👥 Total contatos: ${data.data.total || 0}`);
    console.log(`📧 Contatos ativos: ${data.data.stats?.byStatus?.ativo || 0}`);
    
    if (data.data.contacts && data.data.contacts.length > 0) {
      console.log(`📋 Primeiros contatos:`);
      data.data.contacts.slice(0, 3).forEach((c, i) => {
        console.log(`   ${i+1}. ${c.email} - Status: ${c.status}`);
      });
    } else {
      console.log(`⚠️ Nenhum contato retornado!`);
    }
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
  });
}

// Executar teste
testEmailMarketingAPI().then(() => {
  console.log('\n🏁 Teste concluído!');
}).catch(error => {
  console.error('💥 Erro geral:', error);
});