// Script para forçar o processamento das campanhas pendentes
const https = require('https');

async function forceProcessCampaigns() {
  console.log('🚀 Forçando processamento das campanhas pendentes...\n');
  
  try {
    // 1. Buscar campanhas com status "sending"
    console.log('📋 1. Buscando campanhas pendentes...');
    const campaignsResponse = await makeRequest('https://www.fly2any.com/api/email-marketing?action=campaigns');
    
    if (!campaignsResponse.success) {
      throw new Error('Erro ao buscar campanhas');
    }
    
    const sendingCampaigns = campaignsResponse.data.campaigns.filter(c => c.status === 'sending');
    console.log(`   Encontradas ${sendingCampaigns.length} campanhas pendentes\n`);
    
    if (sendingCampaigns.length === 0) {
      console.log('✅ Nenhuma campanha pendente encontrada!');
      return;
    }
    
    // 2. Executar retry para cada campanha
    for (let i = 0; i < sendingCampaigns.length; i++) {
      const campaign = sendingCampaigns[i];
      console.log(`📧 ${i + 1}. Processando "${campaign.name}"...`);
      
      try {
        // Forçar retry da campanha
        const retryData = {
          action: 'retry_campaign',
          campaignId: campaign.id
        };
        
        const retryResponse = await makePostRequest('https://www.fly2any.com/api/email-marketing', retryData);
        
        if (retryResponse.success) {
          console.log(`   ✅ Retry executado: ${retryResponse.data.message}`);
        } else {
          console.log(`   ❌ Erro no retry: ${retryResponse.error}`);
        }
        
        // Aguardar 2 segundos entre campanhas
        if (i < sendingCampaigns.length - 1) {
          console.log('   ⏸️ Aguardando 2s...\n');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.log(`   ❌ Erro ao processar campanha: ${error.message}`);
      }
    }
    
    console.log('\n⏳ 3. Aguardando 30 segundos para verificar progresso...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // 3. Verificar status após processamento
    console.log('\n📊 4. Verificando progresso...');
    for (const campaign of sendingCampaigns) {
      try {
        const statsResponse = await makeRequest(`https://www.fly2any.com/api/email-marketing?action=campaign_stats&campaign_id=${campaign.id}`);
        if (statsResponse.success && statsResponse.data.stats) {
          const stats = statsResponse.data.stats;
          console.log(`   📧 ${campaign.name}:`);
          console.log(`      Pendentes: ${stats.pending || 0} → Enviados: ${stats.sent || 0}`);
          if (stats.sent > 0) {
            console.log(`      ✅ Progresso detectado!`);
          } else {
            console.log(`      ⚠️ Ainda sem progresso`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Erro ao verificar stats: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  console.log('\n✅ Processamento concluído!');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('   1. Execute este script novamente em 5-10 min para verificar progresso');
  console.log('   2. Se ainda sem progresso, pode haver problema com Vercel serverless');
  console.log('   3. Considere implementar webhook ou cron job para processamento contínuo');
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

// Executar processamento
forceProcessCampaigns().catch(console.error);