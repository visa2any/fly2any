#!/usr/bin/env node

/**
 * Script para debugar problemas específicos de produção
 */

console.log('🔍 Debug Produção - NextAuth Issues\n');

console.log('📋 Configurações Críticas de Produção:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const productionIssues = [];

// Check environment
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
if (process.env.NODE_ENV !== 'production') {
  productionIssues.push('⚠️  NODE_ENV não está definido como "production"');
}

// Check NEXTAUTH_URL
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'undefined'}`);
if (!process.env.NEXTAUTH_URL) {
  productionIssues.push('❌ NEXTAUTH_URL não definido');
} else if (!process.env.NEXTAUTH_URL.startsWith('https://')) {
  productionIssues.push('❌ NEXTAUTH_URL deve usar HTTPS em produção');
}

// Check NEXTAUTH_SECRET
console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ DEFINIDO' : '❌ NÃO DEFINIDO'}`);
if (!process.env.NEXTAUTH_SECRET) {
  productionIssues.push('❌ NEXTAUTH_SECRET não definido (CRÍTICO)');
}

// Check admin credentials
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'undefined'}`);
console.log(`ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? '✅ DEFINIDO' : '❌ NÃO DEFINIDO'}`);

console.log('\n🍪 Configurações de Cookies:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('• Secure cookies: ✅ Habilitado em produção');
console.log('• HttpOnly: ✅ Habilitado');
console.log('• SameSite: lax');
console.log('• Domain: .fly2any.com');
console.log('• Cookie names: __Secure-* prefixes');

console.log('\n🔧 Possíveis Problemas em Produção:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const commonIssues = [
  '1. NEXTAUTH_URL não coincide com domínio real',
  '2. NEXTAUTH_SECRET diferente entre deployments',
  '3. Cookies não sendo salvos por problemas de domínio',
  '4. Middleware criando loops de redirect',
  '5. Session não persistindo por problemas de JWT',
  '6. Problemas de HTTPS/certificado SSL',
  '7. Timezone/expiração de token incorretos'
];

commonIssues.forEach(issue => console.log(`  ${issue}`));

if (productionIssues.length > 0) {
  console.log('\n❌ PROBLEMAS ENCONTRADOS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  productionIssues.forEach(issue => console.log(`  ${issue}`));
} else {
  console.log('\n✅ Configurações básicas parecem corretas');
}

console.log('\n🚀 Variáveis de Ambiente Necessárias (.env.production):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('NODE_ENV=production');
console.log('NEXTAUTH_URL=https://www.fly2any.com');
console.log('NEXTAUTH_SECRET=sua-chave-secreta-super-forte-256-bits');
console.log('ADMIN_EMAIL=admin@fly2any.com'); 
console.log('ADMIN_PASSWORD=sua-senha-forte');

console.log('\n🔍 Para debugar:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Abra DevTools (F12) > Application > Cookies');
console.log('2. Verifique se cookies __Secure-next-auth.* existem');
console.log('3. Verifique logs do servidor para middleware');
console.log('4. Teste em modo incógnito');
console.log('5. Verifique se JWT não está expirado');