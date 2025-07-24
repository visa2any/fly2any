#!/usr/bin/env node

/**
 * Script para testar a configuração de autenticação
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Teste de Configuração de Autenticação\n');

console.log('📋 Variáveis de Ambiente:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || '❌ NÃO DEFINIDO'}`);
console.log(`ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '✅ DEFINIDO (' + process.env.ADMIN_PASSWORD + ')' : '❌ NÃO DEFINIDO'}`);
console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ DEFINIDO' : '❌ NÃO DEFINIDO'}`);
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ NÃO DEFINIDO'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

console.log('\n🌐 URLs de Teste:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Login: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/login`);
console.log(`API Auth: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/providers`);
console.log(`Admin Panel: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin`);

console.log('\n🔐 Credenciais para Teste:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Email: ${process.env.ADMIN_EMAIL || 'admin@fly2any.com'}`);
console.log(`Senha: ${process.env.ADMIN_PASSWORD || 'fly2any2024!'}`);

console.log('\n⚠️ Verificações:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const issues = [];

if (!process.env.ADMIN_EMAIL) {
  issues.push('❌ ADMIN_EMAIL não está definido');
}

if (!process.env.ADMIN_PASSWORD) {
  issues.push('❌ ADMIN_PASSWORD não está definido');
}

if (!process.env.NEXTAUTH_SECRET) {
  issues.push('❌ NEXTAUTH_SECRET não está definido');
}

if (!process.env.NEXTAUTH_URL) {
  issues.push('⚠️ NEXTAUTH_URL não está definido (usando padrão)');
}

if (issues.length === 0) {
  console.log('✅ Todas as configurações estão corretas!');
} else {
  console.log('Problemas encontrados:');
  issues.forEach(issue => console.log(`  ${issue}`));
}

console.log('\n🚀 Para testar:');
console.log('1. Execute: npm run dev');
console.log('2. Acesse: http://localhost:3000/admin/login');
console.log('3. Use as credenciais acima');
console.log('4. Verifique o console do navegador (F12)');