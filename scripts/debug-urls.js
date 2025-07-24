#!/usr/bin/env node

/**
 * Script para debugar problemas de URL no NextAuth
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debug de URLs - NextAuth\n');

console.log('📋 Variáveis de Ambiente:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`);
console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);

console.log('\n🌐 Como o NextAuth detecta URLs:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Simulate NextAuth URL detection
function getNextAuthUrl() {
  // NextAuth's logic for determining base URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
}

const detectedUrl = getNextAuthUrl();
console.log(`NextAuth URL detectada: ${detectedUrl}`);

console.log('\n🔧 Teste de redirect callback:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const testUrls = [
  'https://www.fly2any.com/admin/customers',
  '/admin/customers',
  'http://localhost:3000/admin/customers'
];

testUrls.forEach(url => {
  console.log(`\nTesting URL: ${url}`);
  
  if (url.startsWith('/')) {
    console.log(`  ✅ Relative URL - would redirect to: ${detectedUrl}${url}`);
  } else if (url.includes('fly2any.com')) {
    try {
      const urlObj = new URL(url);
      console.log(`  ⚠️  Production URL - path: ${urlObj.pathname}`);
      console.log(`  ✅ Should redirect to: ${detectedUrl}${urlObj.pathname}`);
    } catch (e) {
      console.log(`  ❌ Invalid URL: ${e.message}`);
    }
  } else {
    console.log(`  ✅ Valid URL - would use as-is`);
  }
});

console.log('\n💡 Possíveis problemas:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const issues = [];

if (process.env.VERCEL_URL) {
  issues.push('⚠️  VERCEL_URL está definida, pode sobrescrever NEXTAUTH_URL');
}

if (!process.env.NEXTAUTH_URL) {
  issues.push('❌ NEXTAUTH_URL não está definida');
}

if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.includes('fly2any.com')) {
  issues.push('⚠️  NEXT_PUBLIC_APP_URL aponta para produção');
}

if (issues.length === 0) {
  console.log('✅ Configuração parece correta!');
} else {
  issues.forEach(issue => console.log(`  ${issue}`));
}

console.log('\n🚀 Recomendações:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Reinicie o servidor após mudanças nas variáveis');
console.log('2. Limpe o cache do navegador (Ctrl+Shift+R)');
console.log('3. Verifique se não há outras instâncias rodando');
console.log('4. Teste em modo incógnito');