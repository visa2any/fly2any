#!/usr/bin/env node

// 🧪 Teste de Email SMTP - Fly2Any
// Simula o comportamento do endpoint /api/email-ses

const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

async function testEmailSMTP() {
  console.log('🧪 Iniciando teste de Email SMTP...\n');
  
  const testEmail = 'teste@exemplo.com'; // Email de teste
  
  // Configurações SMTP em ordem de prioridade
  const smtpConfigs = [
    // 1. Gmail com OAuth2 (mais seguro)
    {
      name: 'Gmail OAuth2',
      config: {
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_EMAIL,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN
        }
      }
    },
    // 2. Gmail com senha de app
    {
      name: 'Gmail App Password',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      }
    },
    // 3. SMTP direto Gmail
    {
      name: 'Gmail SMTP Direct',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    },
    // 4. Outlook/Hotmail
    {
      name: 'Outlook SMTP',
      config: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.OUTLOOK_EMAIL,
          pass: process.env.OUTLOOK_PASSWORD
        }
      }
    }
  ];

  let transporter = null;
  let usedConfig = null;

  console.log('📋 Verificando configurações disponíveis:');
  console.log(`   GMAIL_EMAIL: ${process.env.GMAIL_EMAIL ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   OUTLOOK_EMAIL: ${process.env.OUTLOOK_EMAIL ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ Não configurado'}\n`);

  // Tentar cada configuração até uma funcionar
  for (const smtpConfig of smtpConfigs) {
    try {
      if (!smtpConfig.config.auth.user) {
        console.log(`⏭️  ${smtpConfig.name}: Pulando - sem credenciais`);
        continue;
      }
      
      console.log(`🔄 Testando ${smtpConfig.name}...`);
      transporter = nodemailer.createTransporter(smtpConfig.config);
      
      // Verificar conexão
      await transporter.verify();
      console.log(`✅ ${smtpConfig.name}: Conexão funcionando!`);
      usedConfig = smtpConfig.name;
      break;
      
    } catch (error) {
      console.log(`❌ ${smtpConfig.name}: ${error.message}`);
      continue;
    }
  }

  if (!transporter) {
    console.log('\n🔄 Todos os SMTPs falharam, testando Resend como fallback...');
    
    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY não configurado!');
      return;
    }
    
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      console.log('🔄 Enviando email de teste via Resend...');
      const result = await resend.emails.send({
        from: 'Fly2Any <onboarding@resend.dev>',
        to: [testEmail],
        subject: '📧 [TESTE] Fallback Resend funcionando!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
              <h1>✅ Email Teste Resend</h1>
            </div>
            <div style="padding: 20px;">
              <p><strong>SMTP falharam, Resend funcionando!</strong></p>
              <p>📧 Sistema de fallback ativo</p>
              <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>`
      });
      
      console.log('✅ Email enviado via Resend!');
      console.log(`   Message ID: ${result.data?.id}`);
      console.log(`   Para: ${testEmail}`);
      
    } catch (error) {
      console.log(`❌ Resend falhou: ${error.message}`);
    }
    
    return;
  }

  // Se SMTP funcionou, enviar email de teste
  try {
    console.log(`\n🚀 Enviando email de teste via ${usedConfig}...`);
    
    const mailOptions = {
      from: `"Fly2Any" <${process.env.GMAIL_EMAIL || process.env.OUTLOOK_EMAIL}>`,
      to: testEmail,
      subject: `✅ [TESTE] Email via ${usedConfig}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1>✅ SMTP Funcionando!</h1>
          </div>
          <div style="padding: 20px;">
            <p><strong>Email enviado via ${usedConfig}</strong></p>
            <p>🎯 Configuração SMTP ativa e funcionando</p>
            <p>📧 Para: ${testEmail}</p>
            <p>📅 ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>`
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado com sucesso!');
    console.log(`   Provider: ${usedConfig}`);
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Para: ${testEmail}`);
    
  } catch (error) {
    console.log(`❌ Erro ao enviar email: ${error.message}`);
  }
}

// Executar teste
testEmailSMTP().catch(console.error);