#!/usr/bin/env node

// 🧪 Teste Gmail SMTP Simplificado
require('dotenv').config({ path: '.env.local' });

async function testGmail() {
  console.log('🧪 Testando Gmail SMTP...\n');
  
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  console.log(`📧 Email: ${process.env.GMAIL_EMAIL}`);
  console.log(`🔐 Senha: ${process.env.GMAIL_APP_PASSWORD ? 'Configurada' : 'Não configurada'}\n`);

  try {
    // Verificar conexão
    console.log('🔄 Verificando conexão SMTP...');
    await transporter.verify();
    console.log('✅ Conexão Gmail funcionando!\n');

    // Enviar email de teste
    console.log('🚀 Enviando email de teste...');
    const result = await transporter.sendMail({
      from: `"Fly2Any" <${process.env.GMAIL_EMAIL}>`,
      to: 'teste@exemplo.com',
      subject: '✅ Gmail SMTP Funcionando - Fly2Any',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>🎉 Gmail SMTP Ativo!</h1>
          </div>
          <div style="padding: 20px;">
            <h2>✅ Sistema de Email Configurado</h2>
            <p><strong>500 emails/dia grátis via Gmail SMTP</strong></p>
            <p>📧 De: ${process.env.GMAIL_EMAIL}</p>
            <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
            
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>🎯 Capacidade:</h3>
              <ul>
                <li>✅ 500 emails/dia</li>
                <li>✅ 15.000 emails/mês</li>
                <li>✅ Alta entregabilidade</li>
                <li>✅ Sem custo adicional</li>
              </ul>
            </div>
          </div>
        </div>`
    });

    console.log('✅ Email enviado com sucesso!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   De: ${process.env.GMAIL_EMAIL}`);
    console.log(`   Para: teste@exemplo.com`);
    console.log('\n🎉 Gmail SMTP está funcionando perfeitamente!');

  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Possíveis soluções:');
      console.log('   1. Verificar se 2FA está ativo');
      console.log('   2. Regenerar senha de app');
      console.log('   3. Verificar email correto');
    }
  }
}

testGmail().catch(console.error);