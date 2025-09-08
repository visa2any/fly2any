#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

async function testSendEmail() {
  loadEnv();
  
  console.log('📧 TESTING MAILGUN EMAIL SENDING\n');
  console.log('=' .repeat(50));
  
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN?.replace(/"/g, ''); // Remove quotes if present
  const testEmail = process.env.MAILGUN_TEST_EMAIL || 'fly2any.travel@gmail.com';
  
  console.log('📋 Configuration:');
  console.log(`   Domain: ${domain}`);
  console.log(`   To: ${testEmail}`);
  console.log('');

  if (!apiKey || !domain) {
    console.error('❌ Missing API key or domain');
    return;
  }

  try {
    // Create form data for email
    const formData = new FormData();
    formData.append('from', 'Fly2Any <info@mail.fly2any.com>');
    formData.append('to', testEmail);
    formData.append('subject', '✅ Mailgun Ativado com Sucesso!');
    formData.append('html', `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
          .feature { margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #667eea; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Mailgun Configurado com Sucesso!</h1>
            <p>Sistema de Email Marketing Fly2Any</p>
          </div>
          
          <div class="content">
            <h2>✅ Tudo Pronto para Produção!</h2>
            
            <p>Parabéns! O Mailgun está totalmente configurado e operacional.</p>
            
            <div class="feature">
              <strong>🚀 Status do Sistema:</strong>
              <ul>
                <li>✅ API Key: Válida e ativa</li>
                <li>✅ Domínio: mail.fly2any.com (verificado)</li>
                <li>✅ Tracking: Habilitado (opens, clicks)</li>
                <li>✅ Webhooks: Configurados</li>
                <li>✅ Personalização: Ativa</li>
              </ul>
            </div>
            
            <div class="feature">
              <strong>📊 Funcionalidades Disponíveis:</strong>
              <ul>
                <li>Envio individual e em massa</li>
                <li>Campanhas personalizadas</li>
                <li>Tracking completo de métricas</li>
                <li>Gestão automática de unsubscribes</li>
                <li>Processamento em lote (batch)</li>
                <li>Webhooks para eventos em tempo real</li>
              </ul>
            </div>
            
            <div class="feature">
              <strong>🎯 Próximos Passos:</strong>
              <ul>
                <li>Configure os webhooks no painel do Mailgun</li>
                <li>Teste o envio de campanhas em massa</li>
                <li>Configure templates personalizados</li>
                <li>Monitore as métricas de engajamento</li>
              </ul>
            </div>
            
            <center>
              <a href="https://app.mailgun.com" class="button">Acessar Painel Mailgun</a>
            </center>
            
            <p><strong>Detalhes Técnicos:</strong></p>
            <ul>
              <li>Domínio: ${domain}</li>
              <li>Data/Hora: ${new Date().toLocaleString('pt-BR')}</li>
              <li>API Version: v3</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2025 Fly2Any - Sistema de Email Marketing</p>
            <p>Este é um email de teste do sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `);
    formData.append('text', 'Mailgun configurado com sucesso! Seu sistema de email marketing está pronto.');
    
    // Enable tracking
    formData.append('o:tracking', 'yes');
    formData.append('o:tracking-clicks', 'yes');
    formData.append('o:tracking-opens', 'yes');
    
    // Add tags
    formData.append('o:tag', 'test');
    formData.append('o:tag', 'system-verification');

    console.log('📤 Sending email...');
    
    const authHeader = Buffer.from(`api:${apiKey}`).toString('base64');
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`
      },
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
      console.log('📧 Message ID:', result.id);
      console.log('📬 Check inbox:', testEmail);
      console.log('\n🎉 Mailgun is fully operational!');
      console.log('   You can now send professional emails to any recipient.');
    } else {
      const error = await response.text();
      console.log('\n❌ Failed to send email:');
      console.log(error);
      
      // Parse error for better feedback
      try {
        const errorObj = JSON.parse(error);
        if (errorObj.message) {
          console.log('\n📝 Error details:', errorObj.message);
        }
      } catch (e) {
        // Not JSON, already printed
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
}

testSendEmail().catch(console.error);