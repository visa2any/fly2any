const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Função para obter credenciais Gmail (cópia da API)
function getGmailCredentials() {
  let email = process.env.GMAIL_EMAIL;
  let password = process.env.GMAIL_APP_PASSWORD;
  
  if (!email || !password) {
    const envFiles = ['.env.local', '.env', '.env.production.local'];
    
    for (const fileName of envFiles) {
      const envPath = path.join(process.cwd(), fileName);
      try {
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const lines = envContent.split('\n');
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
              const equalIndex = trimmedLine.indexOf('=');
              if (equalIndex > 0) {
                const key = trimmedLine.substring(0, equalIndex).trim();
                const value = trimmedLine.substring(equalIndex + 1).trim().replace(/["']/g, '');
                
                if (key === 'GMAIL_EMAIL' && !email) email = value;
                if (key === 'GMAIL_APP_PASSWORD' && !password) password = value;
              }
            }
          }
          
          if (email && password) {
            console.log(`✅ Credenciais Gmail carregadas de: ${fileName}`);
            break;
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao carregar ${fileName}:`, error);
      }
    }
  } else {
    console.log('✅ Credenciais Gmail carregadas de variáveis de ambiente');
  }
  
  return { email, password };
}

async function testEmailSending() {
  console.log('🔍 Testando envio de email...');
  
  try {
    // Obter credenciais
    const credentials = getGmailCredentials();
    console.log('📧 Email configurado:', credentials.email);
    console.log('🔑 Password configurado:', credentials.password ? 'SIM' : 'NÃO');
    
    if (!credentials.email || !credentials.password) {
      throw new Error('Credenciais Gmail não encontradas');
    }
    
    // Configurar transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: credentials.email,
        pass: credentials.password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    console.log('⚙️ Transporter criado, testando conexão...');
    
    // Testar conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso!');
    
    // Enviar email de teste
    const testEmail = {
      from: `"Fly2Any Test" <${credentials.email}>`,
      to: credentials.email, // Enviar para o próprio email
      subject: '[TESTE] Verificação do sistema de email',
      html: `
        <h2>✅ Sistema de email funcionando!</h2>
        <p>Este é um teste do sistema de email marketing da Fly2Any.</p>
        <p>Enviado em: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Status: <strong>FUNCIONANDO</strong></p>
      `
    };
    
    console.log('📤 Enviando email de teste...');
    const result = await transporter.sendMail(testEmail);
    
    console.log('✅ Email enviado com sucesso!');
    console.log('📝 Message ID:', result.messageId);
    console.log('📍 Response:', result.response);
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Erro no teste de email:', error);
    return { success: false, error: error.message };
  }
}

// Executar teste
testEmailSending().then(result => {
  if (result.success) {
    console.log('\n🎉 TESTE CONCLUÍDO: Sistema de email está funcionando!');
  } else {
    console.log('\n💥 TESTE FALHOU:', result.error);
  }
  process.exit(result.success ? 0 : 1);
});