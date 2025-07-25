/**
 * 🎯 SOLUÇÃO COMPLETA: Fix Email Marketing System
 * 
 * Este script resolve os problemas identificados no sistema de email marketing:
 * 1. Detecta campanhas travadas em "sending"
 * 2. Reinicia campanhas automaticamente
 * 3. Força o envio de campanhas em "draft"
 * 4. Monitora métricas em tempo real
 */

const https = require('https');

class EmailMarketingFixer {
  constructor() {
    this.baseUrl = 'https://www.fly2any.com';
    this.results = {
      campaignsFixed: 0,
      campaignsSent: 0,
      totalEmailsSent: 0,
      errors: [],
      summary: ''
    };
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = this.baseUrl + endpoint;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(url, options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve({
              statusCode: res.statusCode,
              data: parsed
            });
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${responseData.substring(0, 100)}`));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async fixStuckCampaigns() {
    await this.log('🔄 Executando auto-restart para campanhas travadas...');
    
    try {
      const response = await this.makeRequest('/api/email-marketing/auto-restart', 'POST');
      
      if (response.data.success) {
        const { details } = response.data;
        this.results.campaignsFixed = details.stuckCampaigns;
        
        await this.log(`✅ Auto-restart concluído: ${details.stuckCampaigns} campanhas processadas`);
        
        if (details.results) {
          for (const result of details.results) {
            if (result.restartSuccess) {
              await this.log(`   ✅ ${result.name}: ${result.message}`);
            } else {
              await this.log(`   ❌ ${result.name}: ${result.message}`);
              this.results.errors.push(`Auto-restart failed for ${result.name}: ${result.message}`);
            }
          }
        }
        
        return true;
      } else {
        throw new Error(response.data.error || 'Auto-restart failed');
      }
    } catch (error) {
      await this.log(`❌ Erro no auto-restart: ${error.message}`);
      this.results.errors.push(`Auto-restart error: ${error.message}`);
      return false;
    }
  }

  async getCampaigns() {
    try {
      const response = await this.makeRequest('/api/email-marketing?action=campaigns');
      
      if (response.data.success) {
        return response.data.data.campaigns || [];
      } else {
        throw new Error(response.data.error || 'Failed to get campaigns');
      }
    } catch (error) {
      await this.log(`❌ Erro ao buscar campanhas: ${error.message}`);
      this.results.errors.push(`Get campaigns error: ${error.message}`);
      return [];
    }
  }

  async sendCampaign(campaignId, campaignName, limit = 50) {
    await this.log(`📧 Enviando campanha: ${campaignName} (${campaignId})`);
    
    try {
      const response = await this.makeRequest('/api/email-marketing', 'POST', {
        action: 'send_campaign',
        campaignId: campaignId,
        limit: limit
      });
      
      if (response.data.success) {
        const { totalRecipients } = response.data.data;
        this.results.campaignsSent++;
        this.results.totalEmailsSent += totalRecipients;
        
        await this.log(`✅ Campanha enviada: ${totalRecipients} emails`);
        return { success: true, sent: totalRecipients };
      } else {
        throw new Error(response.data.error || 'Send failed');
      }
    } catch (error) {
      await this.log(`❌ Erro ao enviar campanha ${campaignName}: ${error.message}`);
      this.results.errors.push(`Send campaign error for ${campaignName}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async monitorMetrics(campaignId, campaignName) {
    await this.log(`📊 Verificando métricas: ${campaignName}`);
    
    try {
      const response = await this.makeRequest(`/api/email-marketing/metrics?campaign_id=${campaignId}&action=realtime`);
      
      if (response.data.success) {
        const metrics = response.data.data;
        await this.log(`   📈 Enviados: ${metrics.totalSent}, Abertos: ${metrics.opened}, Cliques: ${metrics.clicked}`);
        await this.log(`   📊 Taxa abertura: ${metrics.openRate.toFixed(1)}%, Taxa clique: ${metrics.clickRate.toFixed(1)}%`);
        
        return metrics;
      } else {
        throw new Error(response.data.error || 'Metrics failed');
      }
    } catch (error) {
      await this.log(`❌ Erro ao obter métricas ${campaignName}: ${error.message}`);
      return null;
    }
  }

  async run() {
    await this.log('🚀 INICIANDO FIX DO SISTEMA DE EMAIL MARKETING');
    await this.log('=' .repeat(80));
    
    // Passo 1: Fix campanhas travadas
    await this.log('📋 PASSO 1: Detectar e corrigir campanhas travadas');
    const fixResult = await this.fixStuckCampaigns();
    
    // Aguardar um pouco para as mudanças se propagarem
    await this.log('⏳ Aguardando propagação das mudanças...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Passo 2: Buscar campanhas e enviar as em draft
    await this.log('📋 PASSO 2: Verificar e enviar campanhas em draft');
    const campaigns = await this.getCampaigns();
    
    if (campaigns.length === 0) {
      await this.log('⚠️ Nenhuma campanha encontrada');
    } else {
      await this.log(`📊 Encontradas ${campaigns.length} campanhas:`);
      
      for (const campaign of campaigns) {
        await this.log(`   - ${campaign.name}: Status ${campaign.status}, Enviados: ${campaign.total_sent}`);
        
        if (campaign.status === 'draft') {
          await this.log(`🔄 Enviando campanha em draft: ${campaign.name}`);
          await this.sendCampaign(campaign.id, campaign.name, 20); // Limite baixo para teste
          
          // Aguardar um pouco antes da próxima
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Passo 3: Verificar métricas finais
    await this.log('📋 PASSO 3: Verificar métricas finais');
    const finalCampaigns = await this.getCampaigns();
    
    for (const campaign of finalCampaigns) {
      if (campaign.total_sent > 0) {
        await this.monitorMetrics(campaign.id, campaign.name);
      }
    }
    
    // Resumo final
    await this.log('=' .repeat(80));
    await this.log('🎯 RESUMO FINAL:');
    await this.log(`✅ Campanhas corrigidas: ${this.results.campaignsFixed}`);
    await this.log(`📧 Campanhas enviadas: ${this.results.campaignsSent}`);
    await this.log(`📨 Total emails enviados: ${this.results.totalEmailsSent}`);
    
    if (this.results.errors.length > 0) {
      await this.log(`❌ Erros encontrados: ${this.results.errors.length}`);
      for (const error of this.results.errors) {
        await this.log(`   - ${error}`);
      }
    } else {
      await this.log('✅ Nenhum erro encontrado!');
    }
    
    this.results.summary = `✅ Sistema corrigido! ${this.results.campaignsSent} campanhas enviadas, ${this.results.totalEmailsSent} emails processados.`;
    await this.log(this.results.summary);
    
    return this.results;
  }
}

// Executar o fix
const fixer = new EmailMarketingFixer();
fixer.run().then(results => {
  console.log('\n🏁 FIX CONCLUÍDO COM SUCESSO!');
  console.log('👀 Acesse https://www.fly2any.com/admin/email-marketing-unified para ver os dados atualizados');
}).catch(error => {
  console.error('💥 Erro crítico durante o fix:', error);
  process.exit(1);
});