// Script para verificar status detalhado das campanhas
const https = require('https');

async function checkCampaignStatus() {
  console.log('🔍 Verificando status detalhado das campanhas...\n');
  
  try {
    // 1. Verificar campanhas
    console.log('📋 1. Status das campanhas:');
    const campaignsResponse = await makeRequest('https://www.fly2any.com/api/email-marketing?action=campaigns');
    
    if (campaignsResponse.success && campaignsResponse.data.campaigns) {
      const campaigns = campaignsResponse.data.campaigns;
      console.log(`   Total: ${campaigns.length} campanhas\n`);
      
      campaigns.forEach((campaign, index) => {
        console.log(`   ${index + 1}. ${campaign.name}`);
        console.log(`      Status: ${campaign.status}`);
        console.log(`      Criada: ${new Date(campaign.created_at).toLocaleString('pt-BR')}`);
        console.log(`      Destinatários: ${campaign.total_recipients || 0}`);
        console.log(`      Enviados: ${campaign.total_sent || 0}`);
        console.log(`      Template: ${campaign.template_type}`);
        console.log('');
      });
      
      // 2. Verificar stats de cada campanha ativa
      const activeCampaigns = campaigns.filter(c => c.status === 'sending' || c.status === 'completed');
      if (activeCampaigns.length > 0) {
        console.log('📊 2. Detalhes dos envios:');
        for (const campaign of activeCampaigns) {
          try {
            const statsResponse = await makeRequest(`https://www.fly2any.com/api/email-marketing?action=campaign_stats&campaign_id=${campaign.id}`);
            if (statsResponse.success && statsResponse.data.stats) {
              const stats = statsResponse.data.stats;
              console.log(`\n   📧 ${campaign.name}:`);
              console.log(`      Pendentes: ${stats.pending || 0}`);
              console.log(`      Enviados: ${stats.sent || 0}`);
              console.log(`      Entregues: ${stats.delivered || 0}`);
              console.log(`      Falharam: ${stats.failed || 0}`);
              console.log(`      Abertos: ${stats.opened || 0}`);
              console.log(`      Clicados: ${stats.clicked || 0}`);
            }
          } catch (error) {
            console.log(`   ❌ Erro ao obter stats de ${campaign.name}: ${error.message}`);
          }
        }
      }
      
    } else {
      console.log('   ❌ Erro ao carregar campanhas');
    }
    
    // 3. Stats gerais
    console.log('\n📈 3. Estatísticas gerais:');
    const statsResponse = await makeRequest('https://www.fly2any.com/api/email-marketing?action=stats');
    if (statsResponse.success && statsResponse.data) {
      const data = statsResponse.data;
      console.log(`   Total contatos: ${data.totalContacts}`);
      console.log(`   Campanhas enviadas: ${data.campaignsSent}`);
      console.log(`   Taxa abertura média: ${data.avgOpenRate}`);
      console.log(`   Taxa clique média: ${data.avgClickRate}`);
    }
    
    // 4. Debug detalhado
    console.log('\n🔧 4. Debug detalhado:');
    const debugResponse = await makeRequest('https://www.fly2any.com/api/email-marketing?action=debug_stats');
    if (debugResponse.success && debugResponse.debug) {
      const debug = debugResponse.debug;
      console.log(`   Campanhas totais: ${debug.totalCampaigns}`);
      console.log(`   Campanhas completadas: ${debug.completedCampaigns}`);
      
      if (debug.campaigns && debug.campaigns.length > 0) {
        console.log('\n   📋 Detalhes por campanha:');
        debug.campaigns.forEach(campaign => {
          console.log(`     • ${campaign.name} (${campaign.status})`);
          console.log(`       Envios registrados: ${campaign.sends}`);
          if (campaign.sendStats) {
            console.log(`       Stats: ${JSON.stringify(campaign.sendStats)}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  console.log('\n✅ Verificação concluída!');
  
  // Dar dicas baseadas no que encontramos
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('   1. Se há campanhas "sending": aguarde o processamento (1 min entre lotes)');
  console.log('   2. Se há envios "pending": execute retry_campaign novamente');
  console.log('   3. Se não há campanhas ativas: crie uma nova campanha');
  console.log('   4. Monitor logs do servidor para ver atividade em tempo real');
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

// Executar verificação
checkCampaignStatus().catch(console.error);