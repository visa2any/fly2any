#!/usr/bin/env node

/**
 * Script para criar/verificar usuário administrador
 * Uso: node scripts/create-admin.js [email] [password]
 */

const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const DEFAULT_ADMIN_EMAIL = 'admin@fly2any.com';
const DEFAULT_ADMIN_PASSWORD = 'fly2any2024!';

async function createAdmin(email, password) {
  try {
    console.log('🔐 Fly2Any - Configuração do Usuário Admin\n');
    
    const adminEmail = email || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    const adminPassword = password || process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    
    // Hash da senha
    const hashedPassword = bcrypt.hashSync(adminPassword, 12);
    
    console.log('✅ Usuário Administrador Configurado:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Senha: ${adminPassword}`);
    console.log(`🔒 Hash: ${hashedPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🚀 Como usar:');
    console.log('1. Acesse: http://localhost:3000/admin/login');
    console.log(`2. Email: ${adminEmail}`);
    console.log(`3. Senha: ${adminPassword}\n`);
    
    console.log('📝 Variáveis de Ambiente (.env.local):');
    console.log(`ADMIN_EMAIL=${adminEmail}`);
    console.log(`ADMIN_PASSWORD=${adminPassword}`);
    console.log(`NEXTAUTH_SECRET=fly2any-super-secret-key-2024`);
    console.log(`NEXTAUTH_URL=http://localhost:3000\n`);
    
    console.log('⚠️  Importante:');
    console.log('- Para produção, use uma senha mais segura');
    console.log('- Configure NEXTAUTH_SECRET com uma chave única');
    console.log('- Atualize NEXTAUTH_URL para seu domínio em produção\n');
    
    return {
      email: adminEmail,
      password: adminPassword,
      hashedPassword
    };
    
  } catch (error) {
    console.error('❌ Erro ao configurar admin:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const [,, email, password] = process.argv;
  createAdmin(email, password);
}

module.exports = { createAdmin };