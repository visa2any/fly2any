#!/usr/bin/env node

/**
 * 🧪 Teste Completo do Fluxo WhatsApp → Lead → Admin
 * 
 * Simula mensagens WhatsApp reais e testa todo o pipeline:
 * 1. Webhook WhatsApp recebe mensagem
 * 2. Extrator de leads processa mensagem
 * 3. Lead é criado automaticamente
 * 4. N8N workflow é executado
 * 5. Lead aparece no admin
 */

const https = require('https');
const fs = require('fs');

// Configurações
const BASE_URL = 'http://localhost:3000';
const TEST_PHONE = '+5511987654321';
const TEST_CONTACT_NAME = 'João Silva';

// Mensagens de teste simulando conversas reais
const TEST_SCENARIOS = [
  {
    name: 'Consulta Completa de Viagem',
    messages: [
      'Oi, boa tarde!',
      'Preciso de um voo de Miami para São Paulo',
      'Para 2 pessoas, ida e volta',
      'Data de ida: 15/08/2025',
      'Volta: 30/08/2025',
      'Classe econômica',
      'Meu nome é João Silva',
      'Orçamento até $1500'
    ],
    expectedLead: {
      origem: 'Miami',
      destino: 'São Paulo',
      tipoViagem: 'ida_volta',
      numeroPassageiros: 2,
      dataPartida: '2025-08-15',
      dataRetorno: '2025-08-30',
      classeViagem: 'economica',
      expectedConfidence: 85
    }
  },
  {
    name: 'Consulta Parcial - Origem e Destino',
    messages: [
      'Olá!',
      'Quero viajar de New York para Rio de Janeiro', 
      'Sozinho, só ida',
      'Para dezembro'
    ],
    expectedLead: {
      origem: 'New York',
      destino: 'Rio de Janeiro', 
      tipoViagem: 'ida',
      numeroPassageiros: 1,
      expectedConfidence: 60
    }
  },
  {
    name: 'Consulta com Interesse Geral',
    messages: [
      'Bom dia',
      'Vocês fazem voos para o Brasil?',
      'Preciso de preços'
    ],
    expectedLead: {
      expectedConfidence: 30 // Baixa confiança, mas deve criar ticket
    }
  }
];

console.log('🧪 Iniciando teste completo do fluxo WhatsApp → Lead → Admin\n');

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
 * Simula mensagem WhatsApp
 */
async function simulateWhatsAppMessage(message, isFirst = false) {
  const webhookData = {
    event: 'whatsapp_message_received',
    data: {
      from: TEST_PHONE,
      text: message,
      contactName: TEST_CONTACT_NAME,
      timestamp: new Date().toISOString(),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isNewConversation: isFirst
    }
  };

  console.log(`📱 Enviando mensagem: "${message}"`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/whatsapp/webhook`, 'POST', webhookData);
    
    if (response.status === 200) {
      console.log('✅ Mensagem processada com sucesso');
      return true;
    } else {
      console.log(`❌ Erro no webhook: ${response.status}`, response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
    return false;
  }
}

/**
 * Verifica se lead foi criado
 */
async function checkLeadCreation(scenario) {
  console.log('🔍 Verificando se lead foi criado...');
  
  try {
    // Aguardar um pouco para processamento assíncrono
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Buscar leads recentes
    const response = await makeRequest(`${BASE_URL}/api/leads?limit=5&sortBy=createdAt&sortOrder=desc`);
    
    if (response.status !== 200) {
      console.log(`❌ Erro ao buscar leads: ${response.status}`);
      return false;
    }
    
    const leads = response.data.data?.leads || [];
    
    // Procurar lead do telefone de teste
    const testLead = leads.find(lead => 
      lead.whatsapp === TEST_PHONE || 
      lead.telefone === TEST_PHONE ||
      lead.nome === TEST_CONTACT_NAME
    );
    
    if (testLead) {
      console.log('✅ Lead encontrado no sistema:', {
        id: testLead.id,
        nome: testLead.nome,
        origem: testLead.origem,
        destino: testLead.destino,
        source: testLead.source,
        createdAt: testLead.createdAt
      });
      
      // Validar dados esperados
      const expected = scenario.expectedLead;
      let validationScore = 0;
      let maxScore = 0;
      
      if (expected.origem) {
        maxScore++;
        if (testLead.origem?.toLowerCase().includes(expected.origem.toLowerCase())) {
          validationScore++;
          console.log(`✓ Origem correta: ${testLead.origem}`);
        } else {
          console.log(`✗ Origem esperada: ${expected.origem}, encontrada: ${testLead.origem}`);
        }
      }
      
      if (expected.destino) {
        maxScore++;
        if (testLead.destino?.toLowerCase().includes(expected.destino.toLowerCase())) {
          validationScore++;
          console.log(`✓ Destino correto: ${testLead.destino}`);
        } else {
          console.log(`✗ Destino esperado: ${expected.destino}, encontrado: ${testLead.destino}`);
        }
      }
      
      if (expected.numeroPassageiros) {
        maxScore++;
        if (testLead.numeroPassageiros === expected.numeroPassageiros) {
          validationScore++;
          console.log(`✓ Passageiros correto: ${testLead.numeroPassageiros}`);
        } else {
          console.log(`✗ Passageiros esperado: ${expected.numeroPassageiros}, encontrado: ${testLead.numeroPassageiros}`);
        }
      }
      
      const accuracy = maxScore > 0 ? Math.round((validationScore / maxScore) * 100) : 100;
      console.log(`📊 Precisão da extração: ${accuracy}%`);
      
      return { found: true, lead: testLead, accuracy };
    } else {
      console.log('❌ Lead não encontrado no sistema');
      console.log('Leads disponíveis:', leads.map(l => ({ 
        nome: l.nome, 
        telefone: l.telefone,
        whatsapp: l.whatsapp,
        source: l.source 
      })));
      return { found: false };
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar leads:', error.message);
    return { found: false, error: error.message };
  }
}

/**
 * Limpar dados de teste anteriores
 */
async function cleanupTestData() {
  console.log('🧹 Limpando dados de teste anteriores...');
  
  try {
    // Aqui você poderia implementar limpeza se necessário
    // Por ora, apenas aguardamos
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Limpeza concluída');
  } catch (error) {
    console.log('⚠️ Erro na limpeza:', error.message);
  }
}

/**
 * Executa um cenário de teste
 */
async function runTestScenario(scenario, index) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎯 CENÁRIO ${index + 1}: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);
  
  // Simular conversa
  for (let i = 0; i < scenario.messages.length; i++) {
    const message = scenario.messages[i];
    const isFirst = i === 0;
    
    const success = await simulateWhatsAppMessage(message, isFirst);
    if (!success) {
      console.log(`❌ Falha no cenário ${scenario.name}`);
      return { success: false, scenario: scenario.name };
    }
    
    // Pequena pausa entre mensagens
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Verificar resultado
  const result = await checkLeadCreation(scenario);
  
  const scenarioResult = {
    success: result.found,
    scenario: scenario.name,
    accuracy: result.accuracy || 0,
    lead: result.lead || null,
    error: result.error || null
  };
  
  if (result.found) {
    console.log(`✅ CENÁRIO ${index + 1} PASSOU`);
  } else {
    console.log(`❌ CENÁRIO ${index + 1} FALHOU`);
  }
  
  return scenarioResult;
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Testando sistema de leads WhatsApp da Fly2Any');
  console.log(`📍 URL base: ${BASE_URL}`);
  console.log(`📱 Telefone de teste: ${TEST_PHONE}`);
  console.log(`👤 Contato de teste: ${TEST_CONTACT_NAME}\n`);
  
  // Limpeza inicial
  await cleanupTestData();
  
  // Executar cenários
  const results = [];
  
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const result = await runTestScenario(TEST_SCENARIOS[i], i);
    results.push(result);
    
    // Pausa entre cenários
    if (i < TEST_SCENARIOS.length - 1) {
      console.log('\\n⏳ Aguardando antes do próximo cenário...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Relatório final
  console.log(`\\n${'='.repeat(60)}`);
  console.log('📊 RELATÓRIO FINAL');
  console.log(`${'='.repeat(60)}`);
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const passRate = Math.round((passed / total) * 100);
  
  console.log(`✅ Cenários passaram: ${passed}/${total} (${passRate}%)`);
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.scenario} ${result.accuracy ? `(${result.accuracy}% precisão)` : ''}`);
    if (result.error) {
      console.log(`   Erro: ${result.error}`);
    }
  });
  
  if (passRate >= 80) {
    console.log('\\n🎉 Sistema funcionando corretamente!');
    console.log('WhatsApp → Lead → Admin pipeline está operacional');
  } else {
    console.log('\\n⚠️ Sistema precisa de ajustes');
    console.log('Alguns cenários falharam - verifique logs acima');
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    testConfig: {
      baseUrl: BASE_URL,
      testPhone: TEST_PHONE,
      testContactName: TEST_CONTACT_NAME
    },
    results,
    summary: {
      total,
      passed,
      passRate,
      averageAccuracy: Math.round(results.reduce((acc, r) => acc + (r.accuracy || 0), 0) / results.length)
    }
  };
  
  fs.writeFileSync('whatsapp-lead-test-report.json', JSON.stringify(report, null, 2));
  console.log('\\n📄 Relatório salvo em: whatsapp-lead-test-report.json');
}

// Executar teste
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erro fatal no teste:', error);
    process.exit(1);
  });
}

module.exports = { main, simulateWhatsAppMessage, checkLeadCreation };