#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE ATIVAÇÃO COMPLETA DO SISTEMA WHATSAPP → LEADS
 * 
 * Este script:
 * 1. Verifica todas as dependências
 * 2. Inicializa o sistema completo
 * 3. Executa testes de funcionamento
 * 4. Ativa monitoramento
 * 5. Fornece relatório final
 */

const https = require('https');
const fs = require('fs');

// Configurações
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const N8N_URL = 'https://n8n-production-81b6.up.railway.app';

console.log('🚀 ATIVAÇÃO DO SISTEMA WHATSAPP → LEADS');
console.log('=' .repeat(60));

/**
 * Faz requisição HTTP
 */
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp-System-Activator/1.0'
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : require('http')).request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * 1️⃣ Verificar pré-requisitos
 */
async function checkPrerequisites() {
  console.log('\n1️⃣ VERIFICANDO PRÉ-REQUISITOS...');
  
  const issues = [];
  
  // Verificar variáveis de ambiente essenciais
  const requiredEnvs = [
    'POSTGRES_URL',
    'NEXT_PUBLIC_APP_URL',
    'N8N_WEBHOOK_WHATSAPP'
  ];
  
  for (const envVar of requiredEnvs) {
    if (!process.env[envVar]) {
      issues.push(`❌ Variável ${envVar} não configurada`);
    } else {
      console.log(`✅ ${envVar}: ${process.env[envVar].substring(0, 30)}...`);
    }
  }
  
  // Verificar arquivos essenciais
  const requiredFiles = [
    'src/lib/whatsapp-lead-extractor.ts',
    'src/lib/whatsapp-follow-up.ts',
    'src/lib/whatsapp-system-init.ts',
    'src/app/api/whatsapp/webhook/route.ts',
    'n8n-workflows/whatsapp-automation-complete.json'
  ];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      issues.push(`❌ Arquivo ${file} não encontrado`);
    }
  }
  
  if (issues.length > 0) {
    console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
    issues.forEach(issue => console.log(`   ${issue}`));
    return false;
  }
  
  console.log('✅ Todos os pré-requisitos estão OK');
  return true;
}

/**
 * 2️⃣ Inicializar sistema
 */
async function initializeSystem() {
  console.log('\n2️⃣ INICIALIZANDO SISTEMA...');
  
  try {
    console.log('🔧 Chamando inicialização completa...');
    const response = await makeRequest(`${BASE_URL}/api/whatsapp/system`, 'POST', {
      action: 'initialize'
    });
    
    if (response.status === 200 && response.data.success) {
      const status = response.data.data;
      
      console.log('📊 Status dos componentes:');
      console.log(`   Banco: ${status.database.connected ? '✅' : '❌'}`);
      console.log(`   APIs: ${status.apis.leadsWorking ? '✅' : '❌'}`);
      console.log(`   N8N: ${status.n8n.webhookAccessible ? '✅' : '❌'}`);
      console.log(`   WhatsApp: ${status.whatsapp.connected ? '✅' : '⚠️'}`);
      
      if (status.overall.ready) {
        console.log('✅ Sistema inicializado com sucesso');
        return status;
      } else {
        console.log('⚠️ Sistema inicializado com problemas:');
        status.overall.issues.forEach(issue => console.log(`   ${issue}`));
        return status;
      }
    } else {
      console.log(`❌ Falha na inicialização: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erro na inicialização: ${error.message}`);
    return null;
  }
}

/**
 * 3️⃣ Testar N8N Railway
 */
async function testN8NIntegration() {
  console.log('\n3️⃣ TESTANDO INTEGRAÇÃO N8N...');
  
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_WHATSAPP || `${N8N_URL}/webhook/whatsapp`;
    
    console.log(`🤖 Testando webhook: ${webhookUrl}`);
    
    const testPayload = {
      event: 'system_activation_test',
      data: {
        from: '+5511999999999',
        message: 'Teste de ativação do sistema',
        timestamp: new Date().toISOString(),
        isTest: true
      }
    };
    
    const response = await makeRequest(webhookUrl, 'POST', testPayload);
    
    if (response.status === 200) {
      console.log('✅ N8N webhook respondendo corretamente');
      return true;
    } else {
      console.log(`⚠️ N8N webhook retornou: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro no teste N8N: ${error.message}`);
    return false;
  }
}

/**
 * 4️⃣ Testar fluxo de leads
 */
async function testLeadFlow() {
  console.log('\n4️⃣ TESTANDO FLUXO DE LEADS...');
  
  try {
    console.log('📱 Simulando mensagem WhatsApp...');
    
    const testMessage = {
      event: 'whatsapp_message_received',
      data: {
        from: '+5511987654321',
        text: 'Oi, preciso de um voo de Miami para São Paulo para 2 pessoas em agosto',
        contactName: 'Teste Sistema',
        timestamp: new Date().toISOString(),
        messageId: `test_${Date.now()}`,
        isNewConversation: true
      }
    };
    
    const response = await makeRequest(`${BASE_URL}/api/whatsapp/webhook`, 'POST', testMessage);
    
    if (response.status === 200) {
      console.log('✅ Webhook processou mensagem');
      
      // Aguardar processamento
      console.log('⏳ Aguardando processamento do lead...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se lead foi criado
      const leadsResponse = await makeRequest(`${BASE_URL}/api/leads?limit=5`);
      
      if (leadsResponse.status === 200 && leadsResponse.data.success) {
        const leads = leadsResponse.data.data.leads || [];
        const testLead = leads.find(lead => 
          lead.whatsapp?.includes('987654321') || 
          lead.telefone?.includes('987654321')
        );
        
        if (testLead) {
          console.log('✅ Lead criado com sucesso:', {
            id: testLead.id,
            origem: testLead.origem,
            destino: testLead.destino,
            source: testLead.source
          });
          return true;
        } else {
          console.log('⚠️ Lead não encontrado - pode ter baixa confiança');
          return false;
        }
      } else {
        console.log('❌ Erro ao verificar leads');
        return false;
      }
    } else {
      console.log(`❌ Webhook falhou: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro no teste de leads: ${error.message}`);
    return false;
  }
}

/**
 * 5️⃣ Ativar monitoramento
 */
async function activateMonitoring() {
  console.log('\n5️⃣ ATIVANDO MONITORAMENTO...');
  
  try {
    // Testar cron job
    console.log('⏰ Testando cron job de follow-up...');
    const cronResponse = await makeRequest(`${BASE_URL}/api/cron/whatsapp-followup`, 'POST', {
      manual: true
    });
    
    if (cronResponse.status === 200) {
      console.log('✅ Cron job funcionando');
    } else {
      console.log('⚠️ Cron job com problemas');
    }
    
    // Verificar estatísticas
    const statsResponse = await makeRequest(`${BASE_URL}/api/whatsapp/follow-up?action=stats`);
    
    if (statsResponse.status === 200) {
      console.log('✅ Sistema de estatísticas funcionando');
    } else {
      console.log('⚠️ Sistema de estatísticas com problemas');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erro na ativação do monitoramento: ${error.message}`);
    return false;
  }
}

/**
 * 6️⃣ Relatório final
 */
async function generateFinalReport(results) {
  console.log('\n6️⃣ RELATÓRIO FINAL');
  console.log('=' .repeat(60));
  
  const { prerequisites, system, n8n, leadFlow, monitoring } = results;
  
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`   Pré-requisitos: ${prerequisites ? '✅' : '❌'}`);
  console.log(`   Sistema: ${system?.overall?.ready ? '✅' : '❌'}`);
  console.log(`   N8N Integration: ${n8n ? '✅' : '❌'}`);
  console.log(`   Fluxo de Leads: ${leadFlow ? '✅' : '❌'}`);
  console.log(`   Monitoramento: ${monitoring ? '✅' : '❌'}`);
  
  const score = [prerequisites, system?.overall?.ready, n8n, leadFlow, monitoring]
    .filter(Boolean).length;
  
  const percentage = Math.round((score / 5) * 100);
  
  console.log(`\n🎯 SCORE GERAL: ${score}/5 (${percentage}%)`);
  
  if (percentage >= 80) {
    console.log('\n🎉 SISTEMA ATIVADO COM SUCESSO!');
    console.log('📱 WhatsApp → 🧠 IA → 📊 Leads → 👨‍💼 Admin FUNCIONANDO');
    console.log('\n🔗 LINKS ÚTEIS:');
    console.log(`   Dashboard: ${BASE_URL}/admin/leads`);
    console.log(`   Sistema: ${BASE_URL}/api/whatsapp/system?action=health`);
    console.log(`   N8N: ${N8N_URL}`);
  } else {
    console.log('\n⚠️ SISTEMA PARCIALMENTE FUNCIONAL');
    console.log('Alguns componentes precisam de atenção. Verifique os logs acima.');
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    score: { value: score, total: 5, percentage },
    results,
    recommendations: generateRecommendations(results)
  };
  
  fs.writeFileSync('whatsapp-system-activation-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório salvo: whatsapp-system-activation-report.json');
  
  return percentage >= 80;
}

/**
 * Gerar recomendações baseadas nos resultados
 */
function generateRecommendations(results) {
  const recommendations = [];
  
  if (!results.prerequisites) {
    recommendations.push('Configure todas as variáveis de ambiente necessárias');
  }
  
  if (!results.system?.overall?.ready) {
    recommendations.push('Resolva problemas na inicialização do sistema');
  }
  
  if (!results.n8n) {
    recommendations.push('Verifique configuração do N8N no Railway');
  }
  
  if (!results.leadFlow) {
    recommendations.push('Teste manualmente o fluxo de criação de leads');
  }
  
  if (!results.monitoring) {
    recommendations.push('Configure adequadamente o sistema de monitoramento');
  }
  
  return recommendations;
}

/**
 * 🚀 Função principal
 */
async function main() {
  console.log(`🌐 URL Base: ${BASE_URL}`);
  console.log(`🤖 N8N URL: ${N8N_URL}\n`);
  
  const results = {};
  
  try {
    // Executar todos os testes
    results.prerequisites = await checkPrerequisites();
    if (!results.prerequisites) {
      console.log('\n🛑 Pré-requisitos não atendidos. Abortando...');
      process.exit(1);
    }
    
    results.system = await initializeSystem();
    results.n8n = await testN8NIntegration();
    results.leadFlow = await testLeadFlow();
    results.monitoring = await activateMonitoring();
    
    // Relatório final
    const success = await generateFinalReport(results);
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('\n💥 ERRO FATAL:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, checkPrerequisites, initializeSystem };