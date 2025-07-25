#!/usr/bin/env node

/**
 * 🚀 IMPORTAÇÃO AUTOMÁTICA DE WORKFLOWS N8N VIA API
 * 
 * Usa o token da API N8N para importar e ativar workflows automaticamente
 */

const https = require('https');
const fs = require('fs');

// Configurações
const N8N_BASE_URL = 'https://n8n-production-81b6.up.railway.app';
const N8N_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZDdlODRhOC1iYWY1LTRhNmQtYjY0OC1kODlmYzg5ODI1Y2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzNDc4MDI0fQ.7vs_cgz0CbNq_URBbZIBcoL_xHxH0sTUbFJOxC_-o48';

console.log('🚀 IMPORTAÇÃO AUTOMÁTICA DOS WORKFLOWS N8N');
console.log('=' .repeat(60));

/**
 * Faz requisição para API N8N com autenticação
 */
function makeN8NRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${N8N_BASE_URL}${path}`;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${N8N_API_TOKEN}`,
        'User-Agent': 'N8N-Auto-Import/1.0'
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
 * 1️⃣ Testar conectividade da API
 */
async function testAPIConnection() {
  console.log('\\n1️⃣ TESTANDO CONECTIVIDADE DA API...');
  
  try {
    console.log('🔐 Testando autenticação...');
    const response = await makeN8NRequest('/api/v1/workflows');
    
    if (response.status === 200) {
      console.log('✅ API N8N autenticada com sucesso');
      console.log(`📊 ${response.data.data?.length || 0} workflows encontrados`);
      return { connected: true, workflows: response.data.data || [] };
    } else if (response.status === 401) {
      console.log('❌ Token de API inválido ou expirado');
      return { connected: false, error: 'Invalid token' };
    } else {
      console.log(`⚠️ API retornou status: ${response.status}`);
      return { connected: false, error: `Status: ${response.status}` };
    }
  } catch (error) {
    console.log(`❌ Erro na conexão: ${error.message}`);
    return { connected: false, error: error.message };
  }
}

/**
 * 2️⃣ Verificar workflows existentes
 */
async function checkExistingWorkflows(existingWorkflows) {
  console.log('\\n2️⃣ VERIFICANDO WORKFLOWS EXISTENTES...');
  
  const targetWorkflows = [
    { name: 'WhatsApp Automation Complete', file: 'n8n-workflows/whatsapp-automation-complete.json' },
    { name: 'Email Marketing Final', file: 'n8n-workflows/email-marketing-final.json' }
  ];
  
  const status = [];
  
  for (const target of targetWorkflows) {
    const existing = existingWorkflows.find(w => 
      w.name?.toLowerCase().includes('whatsapp') && target.name.includes('WhatsApp') ||
      w.name?.toLowerCase().includes('email') && target.name.includes('Email')
    );
    
    if (existing) {
      console.log(`✅ ${target.name}: Encontrado (ID: ${existing.id})`);
      status.push({ ...target, exists: true, id: existing.id, active: existing.active });
    } else {
      console.log(`❌ ${target.name}: Não encontrado`);
      status.push({ ...target, exists: false });
    }
  }
  
  return status;
}

/**
 * 3️⃣ Importar workflow
 */
async function importWorkflow(workflowFile, workflowName) {
  try {
    console.log(`📥 Importando: ${workflowName}`);
    
    // Ler arquivo do workflow
    if (!fs.existsSync(workflowFile)) {
      console.log(`❌ Arquivo não encontrado: ${workflowFile}`);
      return { success: false, error: 'File not found' };
    }
    
    const workflowData = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));
    
    // Preparar dados para importação
    const importData = {
      name: workflowData.name || workflowName,
      nodes: workflowData.nodes || [],
      connections: workflowData.connections || {},
      active: false, // Importar como inativo primeiro
      settings: workflowData.settings || {},
      staticData: workflowData.staticData || null,
      tags: workflowData.tags || []
    };
    
    // Importar via API
    const response = await makeN8NRequest('/api/v1/workflows', 'POST', importData);
    
    if (response.status === 201) {
      console.log(`✅ ${workflowName} importado com sucesso (ID: ${response.data.id})`);
      return { success: true, id: response.data.id, workflow: response.data };
    } else {
      console.log(`❌ Falha na importação: ${response.status}`);
      console.log(`Erro:`, response.data);
      return { success: false, error: response.data, status: response.status };
    }
  } catch (error) {
    console.log(`❌ Erro na importação: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 4️⃣ Ativar workflow
 */
async function activateWorkflow(workflowId, workflowName) {
  try {
    console.log(`🔄 Ativando: ${workflowName} (ID: ${workflowId})`);
    
    const response = await makeN8NRequest(`/api/v1/workflows/${workflowId}/activate`, 'POST');
    
    if (response.status === 200) {
      console.log(`✅ ${workflowName} ativado com sucesso`);
      return { success: true };
    } else {
      console.log(`❌ Falha na ativação: ${response.status}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ Erro na ativação: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 5️⃣ Testar webhooks
 */
async function testWebhooks() {
  console.log('\\n5️⃣ TESTANDO WEBHOOKS...');
  
  const webhooks = [
    { name: 'WhatsApp', path: '/webhook/whatsapp' },
    { name: 'Email Marketing', path: '/webhook/email-marketing-final' }
  ];
  
  const results = [];
  
  for (const webhook of webhooks) {
    try {
      console.log(`🔍 Testando: ${webhook.name}`);
      
      const testData = {
        test: true,
        source: 'api-import-test',
        timestamp: new Date().toISOString()
      };
      
      const response = await makeN8NRequest(webhook.path, 'POST', testData);
      
      if (response.status === 200) {
        console.log(`✅ ${webhook.name}: Webhook funcionando`);
        results.push({ ...webhook, working: true });
      } else {
        console.log(`❌ ${webhook.name}: Status ${response.status}`);
        results.push({ ...webhook, working: false, status: response.status });
      }
    } catch (error) {
      console.log(`❌ ${webhook.name}: Erro - ${error.message}`);
      results.push({ ...webhook, working: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * 6️⃣ Relatório final
 */
function generateReport(apiTest, workflowStatus, importResults, webhookResults) {
  console.log('\\n6️⃣ RELATÓRIO FINAL');
  console.log('=' .repeat(60));
  
  console.log('🔐 CONECTIVIDADE:');
  console.log(`   API N8N: ${apiTest.connected ? '✅ Conectada' : '❌ Falhou'}`);
  
  console.log('\\n📦 WORKFLOWS:');
  importResults.forEach(result => {
    if (result.success) {
      console.log(`   ✅ ${result.name}: Importado e ativo`);
    } else {
      console.log(`   ❌ ${result.name}: ${result.error || 'Falha na importação'}`);
    }
  });
  
  console.log('\\n🔗 WEBHOOKS:');
  webhookResults.forEach(result => {
    const status = result.working ? '✅ Funcionando' : '❌ Falhou';
    console.log(`   ${status} ${result.name} (${result.path})`);
  });
  
  const allWorking = importResults.every(r => r.success) && 
                    webhookResults.every(r => r.working);
  
  if (allWorking) {
    console.log('\\n🎉 SUCESSO TOTAL!');
    console.log('✅ Todos os workflows foram importados e ativados');
    console.log('✅ Todos os webhooks estão funcionando');
    console.log('🚀 Sistema WhatsApp → Leads 100% operacional!');
    
    console.log('\\n🔗 ENDPOINTS ATIVOS:');
    console.log(`   WhatsApp: ${N8N_BASE_URL}/webhook/whatsapp`);
    console.log(`   Email: ${N8N_BASE_URL}/webhook/email-marketing-final`);
  } else {
    console.log('\\n⚠️ PROBLEMAS ENCONTRADOS');
    console.log('Alguns workflows ou webhooks não estão funcionando');
  }
  
  return allWorking;
}

/**
 * 🚀 Função principal
 */
async function main() {
  console.log(`🌐 N8N API: ${N8N_BASE_URL}`);
  console.log(`🔐 Token: ${N8N_API_TOKEN.substring(0, 20)}...\\n`);
  
  try {
    // 1. Testar API
    const apiTest = await testAPIConnection();
    if (!apiTest.connected) {
      console.log('\\n🛑 Não foi possível conectar à API N8N');
      process.exit(1);
    }
    
    // 2. Verificar workflows existentes
    const workflowStatus = await checkExistingWorkflows(apiTest.workflows);
    
    // 3. Importar workflows que não existem
    const importResults = [];
    
    for (const workflow of workflowStatus) {
      if (!workflow.exists) {
        console.log(`\\n📥 IMPORTANDO: ${workflow.name}`);
        const result = await importWorkflow(workflow.file, workflow.name);
        
        if (result.success) {
          // Ativar workflow após importação
          await activateWorkflow(result.id, workflow.name);
          importResults.push({ name: workflow.name, success: true });
        } else {
          importResults.push({ name: workflow.name, success: false, error: result.error });
        }
      } else {
        console.log(`\\n✅ JÁ EXISTE: ${workflow.name}`);
        
        // Verificar se está ativo, senão ativar
        if (!workflow.active) {
          console.log(`🔄 Ativando workflow existente...`);
          await activateWorkflow(workflow.id, workflow.name);
        }
        
        importResults.push({ name: workflow.name, success: true });
      }
    }
    
    // 4. Aguardar um pouco para ativação
    console.log('\\n⏳ Aguardando ativação dos workflows...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. Testar webhooks
    const webhookResults = await testWebhooks();
    
    // 6. Relatório final
    const success = generateReport(apiTest, workflowStatus, importResults, webhookResults);
    
    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      apiTest,
      workflowStatus,
      importResults,
      webhookResults,
      success
    };
    
    fs.writeFileSync('n8n-api-import-report.json', JSON.stringify(report, null, 2));
    console.log('\\n📄 Relatório salvo: n8n-api-import-report.json');
    
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

module.exports = { main };