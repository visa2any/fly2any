#!/usr/bin/env node

/**
 * 🤖 SCRIPT DE SETUP COMPLETO DOS WORKFLOWS N8N
 * 
 * Este script:
 * 1. Verifica se N8N Railway está online
 * 2. Testa se workflows estão ativos
 * 3. Fornece instruções para importação manual
 * 4. Valida webhooks após importação
 * 5. Executa testes completos
 */

const https = require('https');
const fs = require('fs');

const N8N_BASE_URL = 'https://n8n-production-81b6.up.railway.app';

console.log('🤖 SETUP DOS WORKFLOWS N8N NO RAILWAY');
console.log('=' .repeat(60));

/**
 * Faz requisição HTTP
 */
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'N8N-Setup-Tool/1.0'
      }
    };

    const req = https.request(options, (res) => {
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
 * 1️⃣ Verificar status do N8N Railway
 */
async function checkN8NStatus() {
  console.log('\\n1️⃣ VERIFICANDO N8N RAILWAY...');
  
  try {
    console.log(`🔍 Conectando: ${N8N_BASE_URL}`);
    
    // Verificar health endpoint
    const healthResponse = await makeRequest(`${N8N_BASE_URL}/healthz`);
    
    if (healthResponse.status === 200) {
      console.log('✅ N8N Railway está online e saudável');
      return { online: true, healthy: true };
    } else {
      console.log(`⚠️ N8N Railway responde mas com status: ${healthResponse.status}`);
      return { online: true, healthy: false };
    }
  } catch (error) {
    console.log(`❌ N8N Railway inacessível: ${error.message}`);
    return { online: false, healthy: false };
  }
}

/**
 * 2️⃣ Verificar workflows ativos
 */
async function checkWorkflows() {
  console.log('\\n2️⃣ VERIFICANDO WORKFLOWS...');
  
  const workflows = [
    { name: 'WhatsApp Automation', path: '/webhook/whatsapp' },
    { name: 'Email Marketing', path: '/webhook/email-marketing-final' },
    { name: 'Lead Processing', path: '/webhook/lead' }
  ];
  
  const results = [];
  
  for (const workflow of workflows) {
    try {
      console.log(`🔍 Testando: ${workflow.name} (${workflow.path})`);
      
      const response = await makeRequest(`${N8N_BASE_URL}${workflow.path}`, 'POST', {
        test: true,
        source: 'setup-script'
      });
      
      if (response.status === 200) {
        console.log(`✅ ${workflow.name}: ATIVO`);
        results.push({ ...workflow, active: true, status: response.status });
      } else if (response.status === 404) {
        console.log(`❌ ${workflow.name}: NÃO IMPORTADO (404)`);
        results.push({ ...workflow, active: false, status: 404 });
      } else {
        console.log(`⚠️ ${workflow.name}: Resposta inesperada (${response.status})`);
        results.push({ ...workflow, active: false, status: response.status });
      }
    } catch (error) {
      console.log(`❌ ${workflow.name}: ERRO (${error.message})`);
      results.push({ ...workflow, active: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * 3️⃣ Instruções para importação manual
 */
function showImportInstructions(workflowResults) {
  console.log('\\n3️⃣ INSTRUÇÕES DE IMPORTAÇÃO...');
  
  const inactiveWorkflows = workflowResults.filter(w => !w.active);
  
  if (inactiveWorkflows.length === 0) {
    console.log('✅ Todos os workflows estão ativos! Nenhuma importação necessária.');
    return false;
  }
  
  console.log(`❌ ${inactiveWorkflows.length} workflow(s) precisam ser importados:`);
  
  inactiveWorkflows.forEach(workflow => {
    console.log(`   • ${workflow.name} (${workflow.path})`);
  });
  
  console.log('\\n📋 PASSOS PARA IMPORTAÇÃO MANUAL:');
  console.log(`\\n1. Acesse o N8N: ${N8N_BASE_URL}`);
  console.log('2. Faça login no dashboard');
  console.log('3. Clique em "+ Add workflow" ou "Import"');
  console.log('4. Para cada workflow inativo, importe os arquivos:');
  
  if (inactiveWorkflows.find(w => w.name === 'WhatsApp Automation')) {
    console.log('   📱 WhatsApp: n8n-workflows/whatsapp-automation-complete.json');
  }
  
  if (inactiveWorkflows.find(w => w.name === 'Email Marketing')) {
    console.log('   📧 Email: n8n-workflows/email-marketing-final.json');
  }
  
  console.log('\\n5. Para cada workflow importado:');
  console.log('   - Clique em "Save" para salvar');
  console.log('   - Clique no toggle para "ATIVAR" o workflow');
  console.log('   - Verifique se aparece "Active" na lista');
  
  console.log('\\n6. Após importar TODOS os workflows, execute novamente:');
  console.log('   node setup-n8n-workflows.js');
  
  return true;
}

/**
 * 4️⃣ Testar workflows após importação
 */
async function testWorkflowFunctionality(workflowResults) {
  console.log('\\n4️⃣ TESTANDO FUNCIONALIDADE...');
  
  const activeWorkflows = workflowResults.filter(w => w.active);
  
  if (activeWorkflows.length === 0) {
    console.log('❌ Nenhum workflow ativo para testar');
    return false;
  }
  
  console.log(`✅ Testando ${activeWorkflows.length} workflow(s) ativo(s)...`);
  
  // Teste WhatsApp
  const whatsappWorkflow = activeWorkflows.find(w => w.name === 'WhatsApp Automation');
  if (whatsappWorkflow) {
    try {
      console.log('📱 Testando WhatsApp workflow...');
      
      const testMessage = {
        event: 'whatsapp_message_received',
        data: {
          from: '+5511999888777',
          text: 'Teste de setup do workflow N8N',
          contactName: 'Teste Setup',
          timestamp: new Date().toISOString(),
          messageId: `setup_test_${Date.now()}`,
          isNewConversation: true
        }
      };
      
      const response = await makeRequest(`${N8N_BASE_URL}/webhook/whatsapp`, 'POST', testMessage);
      
      if (response.status === 200) {
        console.log('✅ WhatsApp workflow processou teste com sucesso');
      } else {
        console.log(`⚠️ WhatsApp workflow retornou: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro no teste WhatsApp: ${error.message}`);
    }
  }
  
  // Teste Email Marketing
  const emailWorkflow = activeWorkflows.find(w => w.name === 'Email Marketing');
  if (emailWorkflow) {
    try {
      console.log('📧 Testando Email Marketing workflow...');
      
      const testCampaign = {
        action: 'test_workflow',
        campaignData: {
          name: 'Teste Setup N8N',
          subject: 'Teste de Workflow',
          contacts: [{ email: 'teste@fly2any.com', nome: 'Teste' }]
        }
      };
      
      const response = await makeRequest(`${N8N_BASE_URL}/webhook/email-marketing-final`, 'POST', testCampaign);
      
      if (response.status === 200) {
        console.log('✅ Email Marketing workflow processou teste com sucesso');
      } else {
        console.log(`⚠️ Email Marketing workflow retornou: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Erro no teste Email Marketing: ${error.message}`);
    }
  }
  
  return true;
}

/**
 * 5️⃣ Relatório final
 */
function generateReport(n8nStatus, workflowResults, needsImport) {
  console.log('\\n5️⃣ RELATÓRIO FINAL');
  console.log('=' .repeat(60));
  
  // Status geral
  console.log('📊 STATUS GERAL:');
  console.log(`   N8N Railway: ${n8nStatus.online ? '✅ Online' : '❌ Offline'}`);
  console.log(`   Health Check: ${n8nStatus.healthy ? '✅ Saudável' : '❌ Problemas'}`);
  
  // Status dos workflows
  const activeCount = workflowResults.filter(w => w.active).length;
  const totalCount = workflowResults.length;
  
  console.log(`   Workflows: ${activeCount}/${totalCount} ativos`);
  
  workflowResults.forEach(workflow => {
    const status = workflow.active ? '✅' : '❌';
    console.log(`     ${status} ${workflow.name}`);
  });
  
  // Ações necessárias
  console.log('\\n🎯 AÇÕES NECESSÁRIAS:');
  
  if (!n8nStatus.online) {
    console.log('❌ N8N Railway está offline - verifique o deploy');
    return false;
  }
  
  if (needsImport) {
    console.log('📋 Importação manual necessária - siga as instruções acima');
    console.log('🔄 Execute novamente após importar os workflows');
    return false;
  }
  
  if (activeCount === totalCount) {
    console.log('🎉 TODOS OS WORKFLOWS ESTÃO ATIVOS!');
    console.log('✅ Sistema N8N completamente funcional');
    console.log('🚀 Integração WhatsApp → Leads pronta para produção');
    
    console.log('\\n🔗 LINKS ÚTEIS:');
    console.log(`   Dashboard N8N: ${N8N_BASE_URL}`);
    console.log('   WhatsApp Webhook: /webhook/whatsapp');
    console.log('   Email Webhook: /webhook/email-marketing-final');
    
    return true;
  } else {
    console.log('⚠️ Alguns workflows ainda não estão funcionando');
    return false;
  }
}

/**
 * 🚀 Função principal
 */
async function main() {
  console.log(`🌐 N8N Railway: ${N8N_BASE_URL}\\n`);
  
  try {
    // 1. Verificar N8N
    const n8nStatus = await checkN8NStatus();
    if (!n8nStatus.online) {
      console.log('\\n🛑 N8N Railway não está acessível. Verifique o deploy no Railway.');
      process.exit(1);
    }
    
    // 2. Verificar workflows
    const workflowResults = await checkWorkflows();
    
    // 3. Instruções de importação
    const needsImport = showImportInstructions(workflowResults);
    
    // 4. Testes (se aplicável)
    if (!needsImport) {
      await testWorkflowFunctionality(workflowResults);
    }
    
    // 5. Relatório final
    const success = generateReport(n8nStatus, workflowResults, needsImport);
    
    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      n8nStatus,
      workflowResults,
      needsImport,
      success
    };
    
    fs.writeFileSync('n8n-workflow-setup-report.json', JSON.stringify(report, null, 2));
    console.log('\\n📄 Relatório salvo: n8n-workflow-setup-report.json');
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('\\n💥 ERRO FATAL:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, checkN8NStatus, checkWorkflows };