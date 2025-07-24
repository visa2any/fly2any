#!/usr/bin/env node

/**
 * Script para testar a API de autenticação
 */

const fetch = require('cross-fetch');

async function testAPI() {
  console.log('🔍 Testando API de Autenticação\n');

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check if NextAuth API is working
    console.log('1️⃣ Testando rota de providers...');
    const providerResponse = await fetch(`${baseUrl}/api/auth/providers`);
    
    if (providerResponse.ok) {
      const providers = await providerResponse.json();
      console.log('✅ API NextAuth funcionando');
      console.log('   Providers disponíveis:', Object.keys(providers));
    } else {
      console.log('❌ API NextAuth não está respondendo');
      console.log('   Status:', providerResponse.status);
    }

    // Test 2: Check if we can make a signin request
    console.log('\n2️⃣ Testando requisição de signin...');
    const signinResponse = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'email': 'admin@fly2any.com',
        'password': 'fly2any2024!',
        'redirect': 'false'
      })
    });

    console.log('   Status da resposta:', signinResponse.status);
    console.log('   Headers:', [...signinResponse.headers.entries()]);

  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    console.log('\n💡 Possíveis causas:');
    console.log('   - Servidor não está rodando (npm run dev)');
    console.log('   - Porta 3000 não está disponível');
    console.log('   - Problema na configuração do NextAuth');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok || response.status === 404; // Both are fine
  } catch {
    return false;
  }
}

async function main() {
  const isServerRunning = await checkServer();
  
  if (!isServerRunning) {
    console.log('❌ Servidor não está rodando!');
    console.log('\n🚀 Para testar:');
    console.log('1. Execute: npm run dev');
    console.log('2. Aguarde o servidor inicializar');
    console.log('3. Execute: node scripts/test-api-auth.js');
    return;
  }

  await testAPI();
}

main().catch(console.error);