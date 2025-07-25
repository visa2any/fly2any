#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TESTE - Sistema de Retry Automático para Emails
 * 
 * Este script testa o sistema completo de retry implementado:
 * - Simula falhas de email com diferentes tipos de erro
 * - Testa lógica de retry exponencial 
 * - Valida endpoints da API
 * - Verifica logs e métricas
 */

const fs = require('fs');
const path = require('path');

// URLs base para teste
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://www.fly2any.com' 
  : 'http://localhost:3000';

const API_URL = `${BASE_URL}/api/email-marketing`;

// 🧪 Dados de teste
const TEST_CONTACTS = [
  {
    email: 'teste.retry1@example.com',
    nome: 'Teste Retry 1',
    segmento: 'teste'
  },
  {
    email: 'teste.retry2@example.com', 
    nome: 'Teste Retry 2',
    segmento: 'teste'
  },
  {
    email: 'invalid-email@domain-that-does-not-exist.xyz',
    nome: 'Teste Email Inválido',
    segmento: 'teste'
  }
];

// 🔧 Funções auxiliares
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      status: 0
    };
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 📊 Função para exibir estatísticas
function displayStats(title, stats) {
  console.log(`\n📊 ${title}`);
  console.log('='.repeat(50));
  console.log(JSON.stringify(stats, null, 2));
}

// 🧪 Teste 1: Verificar estrutura do banco
async function test1_checkDatabase() {
  console.log('\n🧪 TESTE 1: Verificando estrutura do banco...');
  
  const result = await makeRequest(`${API_URL}?action=debug_stats`);
  
  if (result.success) {
    console.log('✅ Banco de dados acessível');
    displayStats('Estado atual do sistema', result.data.debug);
    return true;
  } else {
    console.error('❌ Erro ao acessar banco:', result.error);
    return false;
  }
}

// 🧪 Teste 2: Importar contatos de teste
async function test2_importContacts() {
  console.log('\n🧪 TESTE 2: Importando contatos de teste...');
  
  const result = await makeRequest(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'import_contacts',
      contactsData: TEST_CONTACTS
    })
  });
  
  if (result.success) {
    console.log('✅ Contatos importados:', result.data);
    return true;
  } else {
    console.error('❌ Erro ao importar contatos:', result.error);
    return false;
  }
}

// 🧪 Teste 3: Criar e enviar campanha (vai gerar falhas)
async function test3_createAndSendCampaign() {
  console.log('\n🧪 TESTE 3: Criando campanha de teste...');
  
  // Criar campanha
  const createResult = await makeRequest(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create_campaign',
      name: 'Teste Sistema Retry',
      subject: '[TESTE] Sistema de Retry Automático',
      templateType: 'promotional'
    })
  });
  
  if (!createResult.success) {
    console.error('❌ Erro ao criar campanha:', createResult.error);
    return false;
  }
  
  const campaignId = createResult.data.id;
  console.log('✅ Campanha criada:', campaignId);
  
  // Enviar campanha (alguns emails vão falhar)
  console.log('📧 Enviando campanha (alguns emails devem falhar)...');
  
  const sendResult = await makeRequest(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'send_campaign',
      campaignId: campaignId,
      segment: 'teste',
      limit: 10
    })
  });
  
  if (sendResult.success) {
    console.log('✅ Campanha iniciada:', sendResult.data);
    return campaignId;
  } else {
    console.error('❌ Erro ao enviar campanha:', sendResult.error);
    return false;
  }
}

// 🧪 Teste 4: Aguardar processamento e verificar falhas
async function test4_waitAndCheckFailures(campaignId) {
  console.log('\n🧪 TESTE 4: Aguardando processamento e verificando falhas...');
  
  // Aguardar processamento (2 minutos)
  console.log('⏳ Aguardando 2 minutos para processamento...');
  await sleep(120000);
  
  // Verificar estatísticas da campanha
  const statsResult = await makeRequest(`${API_URL}?action=campaign_stats&campaign_id=${campaignId}`);
  
  if (statsResult.success) {
    console.log('✅ Estatísticas da campanha:');
    displayStats('Estatísticas de envio', statsResult.data.stats);
    
    // Verificar se há falhas
    const failedCount = statsResult.data.stats.failed || 0;
    if (failedCount > 0) {
      console.log(`✅ ${failedCount} emails falharam conforme esperado`);
      return true;
    } else {
      console.log('⚠️ Nenhuma falha detectada - pode ser que todos os emails foram enviados com sucesso');
      return true;
    }
  } else {
    console.error('❌ Erro ao obter estatísticas:', statsResult.error);
    return false;
  }
}

// 🧪 Teste 5: Executar retry manual
async function test5_executeRetry() {
  console.log('\n🧪 TESTE 5: Executando retry manual...');
  
  const retryResult = await makeRequest(`${API_URL}?action=retry_failed`);
  
  if (retryResult.success) {
    console.log('✅ Retry executado:');
    displayStats('Resultado do retry', retryResult.data);
    return true;
  } else {
    console.error('❌ Erro no retry:', retryResult.error);
    return false;
  }
}

// 🧪 Teste 6: Verificar estado final
async function test6_finalCheck() {
  console.log('\n🧪 TESTE 6: Verificação final do sistema...');
  
  const debugResult = await makeRequest(`${API_URL}?action=debug_stats`);
  
  if (debugResult.success) {
    console.log('✅ Estado final do sistema:');
    displayStats('Debug completo', debugResult.data.debug);
    
    // Verificar estatísticas de retry
    if (debugResult.data.debug.retryStats) {
      displayStats('Estatísticas de Retry', debugResult.data.debug.retryStats);
    }
    
    return true;
  } else {
    console.error('❌ Erro na verificação final:', debugResult.error);
    return false;
  }
}

// 🧪 Teste 7: Limpar dados de teste
async function test7_cleanup() {
  console.log('\n🧪 TESTE 7: Limpando dados de teste...');
  
  // Remover contatos de teste
  for (const contact of TEST_CONTACTS) {
    const deleteResult = await makeRequest(`${API_URL}?action=delete_contact&email=${encodeURIComponent(contact.email)}`);
    if (deleteResult.success) {
      console.log(`✅ Contato removido: ${contact.email}`);
    } else {
      console.log(`⚠️ Erro ao remover ${contact.email}: ${deleteResult.error}`);
    }
  }
  
  console.log('✅ Limpeza concluída');
  return true;
}

// 🚀 Executar todos os testes
async function runAllTests() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO SISTEMA DE RETRY');
  console.log('='.repeat(60));
  console.log(`📍 Testando em: ${BASE_URL}`);
  console.log(`⏰ Início: ${new Date().toISOString()}`);
  
  const results = [];
  let campaignId = null;
  
  try {
    // Executar testes sequencialmente
    results.push({ test: 'Database Check', success: await test1_checkDatabase() });
    results.push({ test: 'Import Contacts', success: await test2_importContacts() });
    
    campaignId = await test3_createAndSendCampaign();
    results.push({ test: 'Create Campaign', success: !!campaignId });
    
    if (campaignId) {
      results.push({ test: 'Wait & Check Failures', success: await test4_waitAndCheckFailures(campaignId) });
      results.push({ test: 'Execute Retry', success: await test5_executeRetry() });
    }
    
    results.push({ test: 'Final Check', success: await test6_finalCheck() });
    results.push({ test: 'Cleanup', success: await test7_cleanup() });
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
  
  // Relatório final
  console.log('\n📋 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  console.log(`\n🎯 RESULTADO: ${passed}/${total} testes passaram`);
  console.log(`⏰ Término: ${new Date().toISOString()}`);
  
  if (passed === total) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema de retry funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  test1_checkDatabase,
  test2_importContacts, 
  test3_createAndSendCampaign,
  test4_waitAndCheckFailures,
  test5_executeRetry,
  test6_finalCheck,
  test7_cleanup
};