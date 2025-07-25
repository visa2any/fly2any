#!/usr/bin/env node

/**
 * Script para debuggar problemas no sistema de templates de email
 * Diagnostica contatos, campanhas e processo de envio
 */

const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

console.log('🔍 DIAGNÓSTICO DO SISTEMA DE EMAIL TEMPLATES\n');

async function testAPI(endpoint, description) {
  try {
    console.log(`🧪 ${description}...`);
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${description} - OK`);
      return data;
    } else {
      console.log(`❌ ${description} - FALHA:`, data.error);
      return null;
    }
  } catch (error) {
    console.log(`💥 ${description} - ERRO:`, error.message);
    return null;
  }
}

async function runDiagnosis() {
  console.log(`📡 Base URL: ${baseUrl}\n`);

  // 1. Testar contatos gerais
  const contactsResult = await testAPI('/api/email-marketing?action=contacts&limit=5', 'Carregando contatos');
  if (contactsResult?.data?.contacts) {
    console.log(`   📊 Total de contatos: ${contactsResult.data.total || contactsResult.data.contacts.length}`);
    console.log(`   📧 Contatos ativos: ${contactsResult.data.contacts.filter(c => c.status === 'ativo').length}`);
  }

  // 2. Testar contatos por segmento
  console.log('\n🎯 Testando segmentos:');
  const segments = ['brasileiros-eua', 'familias', 'casais', 'aventureiros', 'executivos'];
  
  for (const segment of segments) {
    const segmentResult = await testAPI(`/api/email-marketing?action=contacts&segmento=${segment}&status=ativo`, `Segmento: ${segment}`);
    if (segmentResult?.data?.contacts) {
      console.log(`   📊 ${segment}: ${segmentResult.data.contacts.length} contatos`);
    }
  }

  // 3. Testar criação de campanha
  console.log('\n📝 Testando criação de campanha de teste...');
  try {
    const createResponse = await fetch(`${baseUrl}/api/email-marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_campaign',
        name: `[DEBUG] Teste Template - ${new Date().toLocaleString()}`,
        subject: '🧪 Email de Teste - Debug Template System',
        templateType: 'promotional',
        htmlContent: '<h1>Teste de Debug</h1><p>Este é um email de teste para debug do sistema.</p>',
        textContent: 'Teste de Debug - Este é um email de teste para debug do sistema.'
      })
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Campanha criada com sucesso');
      console.log(`   🆔 ID: ${createResult.data.id}`);
      
      // 4. Testar envio da campanha (apenas algumas pessoas para teste)
      console.log('\n📤 Testando envio da campanha...');
      const sendResponse = await fetch(`${baseUrl}/api/email-marketing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_campaign',
          campaignId: createResult.data.id,
          limit: 3 // Apenas 3 emails para teste
        })
      });
      
      const sendResult = await sendResponse.json();
      
      if (sendResult.success) {
        console.log('✅ Envio iniciado com sucesso');
        console.log(`   📊 Detalhes:`, sendResult.data);
      } else {
        console.log('❌ Erro no envio:', sendResult.error);
      }
      
    } else {
      console.log('❌ Erro ao criar campanha:', createResult.error);
    }
    
  } catch (error) {
    console.log('💥 Erro no teste de campanha:', error.message);
  }

  // 5. Verificar credenciais Gmail
  console.log('\n🔐 Verificando configuração Gmail...');
  if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
    console.log('✅ Variáveis GMAIL_EMAIL e GMAIL_APP_PASSWORD estão definidas');
    console.log(`   📧 Email: ${process.env.GMAIL_EMAIL}`);
    console.log(`   🔑 Senha: ${'*'.repeat(process.env.GMAIL_APP_PASSWORD.length)}`);
  } else {
    console.log('❌ Credenciais Gmail não encontradas nas variáveis de ambiente');
  }

  // 6. Listar campanhas recentes
  console.log('\n📋 Campanhas recentes:');
  const campaignsResult = await testAPI('/api/email-marketing?action=campaigns', 'Carregando campanhas');
  if (campaignsResult?.data?.campaigns) {
    const recent = campaignsResult.data.campaigns.slice(0, 3);
    recent.forEach(campaign => {
      console.log(`   📧 ${campaign.name} - Status: ${campaign.status} - ${new Date(campaign.created_at).toLocaleString()}`);
    });
  }

  console.log('\n🎯 DIAGNÓSTICO CONCLUÍDO!');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Verificar se existem contatos ativos no banco de dados');
  console.log('2. Testar templates no admin /admin/email-templates');
  console.log('3. Verificar logs do console do navegador durante o teste');
  console.log('4. Confirmar se emails chegaram na caixa de entrada do Gmail');
}

// Executar diagnóstico
runDiagnosis().catch(console.error);