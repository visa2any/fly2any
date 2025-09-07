#!/usr/bin/env node

/**
 * Script de teste para validar o fluxo completo de autenticação admin
 * Este script testa cada etapa do processo de login
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ADMIN_CREDENTIALS = {
  email: 'admin@fly2any.com',
  password: 'fly2any2024!'
};

// Helper para fazer requisições HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const lib = options.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          cookies: res.headers['set-cookie'] || []
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testAuthFlow() {
  console.log('🚀 Iniciando teste do fluxo de autenticação admin\n');

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log('1️⃣ Testando se o servidor está ativo...');
    const healthCheck = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    });
    console.log(`✅ Servidor respondendo: ${healthCheck.statusCode}\n`);

    // Teste 2: Tentar acessar /admin sem autenticação
    console.log('2️⃣ Testando acesso ao /admin sem autenticação...');
    const adminAccess = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/admin',
      method: 'GET',
      timeout: 10000
    });
    
    if (adminAccess.statusCode === 302 || adminAccess.statusCode === 307) {
      const location = adminAccess.headers.location;
      console.log(`✅ Redirecionamento funcionando: ${adminAccess.statusCode} → ${location}\n`);
    } else {
      console.log(`⚠️ Resposta inesperada: ${adminAccess.statusCode}\n`);
    }

    // Teste 3: Verificar se a página de login está acessível
    console.log('3️⃣ Testando acesso à página de login...');
    const loginPage = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/admin/login',
      method: 'GET',
      timeout: 15000
    });
    console.log(`✅ Página de login: ${loginPage.statusCode}\n`);

    // Teste 4: Obter CSRF token para login
    console.log('4️⃣ Obtendo CSRF token...');
    const csrfResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/csrf',
      method: 'GET',
      timeout: 10000
    });
    
    let csrfToken = null;
    if (csrfResponse.statusCode === 200) {
      try {
        const csrfData = JSON.parse(csrfResponse.body);
        csrfToken = csrfData.csrfToken;
        console.log(`✅ CSRF token obtido: ${csrfToken.substring(0, 10)}...\n`);
      } catch (e) {
        console.log('⚠️ Erro ao parsear CSRF token\n');
      }
    }

    // Teste 5: Tentar fazer login com credenciais admin
    console.log('5️⃣ Tentando login com credenciais admin...');
    const loginData = new URLSearchParams({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      csrfToken: csrfToken || '',
      callbackUrl: '/admin',
      json: 'true'
    }).toString();

    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(loginData)
      },
      timeout: 20000
    }, loginData);

    console.log(`📊 Login result: ${loginResult.statusCode}`);
    console.log(`📊 Response length: ${loginResult.body.length} chars`);
    
    if (loginResult.cookies.length > 0) {
      console.log(`🍪 Cookies definidos: ${loginResult.cookies.length}`);
      loginResult.cookies.forEach((cookie, i) => {
        console.log(`   ${i + 1}. ${cookie.split(';')[0]}`);
      });
    }

    // Teste 6: Verificar sessão
    console.log('\n6️⃣ Verificando sessão...');
    const sessionCookies = loginResult.cookies
      .filter(cookie => cookie.includes('next-auth'))
      .join('; ');

    if (sessionCookies) {
      const sessionCheck = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/session',
        method: 'GET',
        headers: {
          'Cookie': sessionCookies
        },
        timeout: 10000
      });

      console.log(`📊 Session check: ${sessionCheck.statusCode}`);
      if (sessionCheck.statusCode === 200) {
        try {
          const sessionData = JSON.parse(sessionCheck.body);
          if (sessionData.user) {
            console.log(`✅ Usuário logado: ${sessionData.user.email || sessionData.user.name}`);
          } else {
            console.log('⚠️ Sem dados de usuário na sessão');
          }
        } catch (e) {
          console.log('⚠️ Erro ao parsear dados da sessão');
        }
      }

      // Teste 7: Tentar acessar /admin com sessão
      console.log('\n7️⃣ Testando acesso ao /admin com sessão...');
      const adminWithAuth = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/admin',
        method: 'GET',
        headers: {
          'Cookie': sessionCookies
        },
        timeout: 15000
      });
      
      console.log(`📊 Admin com auth: ${adminWithAuth.statusCode}`);
      if (adminWithAuth.statusCode === 200) {
        console.log('✅ SUCESSO! Usuário conseguiu acessar /admin após login');
      } else if (adminWithAuth.statusCode === 302 || adminWithAuth.statusCode === 307) {
        console.log(`⚠️ Ainda sendo redirecionado: ${adminWithAuth.headers.location}`);
      }
    } else {
      console.log('⚠️ Nenhum cookie de sessão encontrado');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }

  console.log('\n🏁 Teste concluído!');
}

// Executar o teste
if (require.main === module) {
  testAuthFlow();
}

module.exports = { testAuthFlow };