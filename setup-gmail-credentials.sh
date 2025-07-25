#!/bin/bash
# Script para configurar credenciais Gmail para email marketing Fly2Any

echo "🚀 Configurando credenciais Gmail para Email Marketing"
echo "=================================================="

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ Arquivo .env.local não encontrado!"
    echo "   Crie o arquivo .env.local primeiro"
    exit 1
fi

echo "📧 Configuração do Gmail para Email Marketing"
echo ""
echo "⚠️  IMPORTANTE: Você precisa de um App Password do Gmail"
echo "📋 Como obter:"
echo "   1. Acesse: https://myaccount.google.com/security"
echo "   2. Ative '2-Step Verification' se não estiver ativo"
echo "   3. Vá em 'App passwords'"
echo "   4. Gere nova senha para 'Mail'"
echo "   5. Use a senha de 16 dígitos abaixo"
echo ""

# Solicitar credenciais
read -p "📧 Digite seu email Gmail completo: " GMAIL_EMAIL
echo ""
read -s -p "🔑 Digite sua App Password (16 dígitos): " GMAIL_APP_PASSWORD
echo ""

# Validar formato do email
if [[ ! "$GMAIL_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@gmail\.com$ ]]; then
    echo "❌ Email inválido. Use um email @gmail.com válido"
    exit 1
fi

# Validar App Password (formato básico)
if [[ ! "$GMAIL_APP_PASSWORD" =~ ^[a-zA-Z0-9]{16}$ ]]; then
    echo "⚠️  App Password parece ter formato incorreto"
    echo "   Deveria ter 16 caracteres alfanuméricos"
    read -p "   Continuar mesmo assim? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "❌ Cancelado pelo usuário"
        exit 1
    fi
fi

echo ""
echo "💾 Salvando credenciais no .env.local..."

# Backup do arquivo original
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
echo "📁 Backup criado: .env.local.backup.$(date +%Y%m%d_%H%M%S)"

# Remover linhas antigas se existirem
sed -i '/^GMAIL_EMAIL=/d' .env.local
sed -i '/^GMAIL_APP_PASSWORD=/d' .env.local

# Adicionar novas credenciais
echo "" >> .env.local
echo "# Gmail Configuration for Email Marketing - Fly2Any" >> .env.local
echo "GMAIL_EMAIL=$GMAIL_EMAIL" >> .env.local
echo "GMAIL_APP_PASSWORD=$GMAIL_APP_PASSWORD" >> .env.local

echo "✅ Credenciais Gmail configuradas com sucesso!"
echo ""
echo "🧪 Testando configuração..."

# Criar script de teste Node.js
cat > test-gmail-config.js << 'EOF'
const nodemailer = require('nodemailer');

async function testGmailConfig() {
  const gmail_email = process.env.GMAIL_EMAIL;
  const gmail_password = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmail_email || !gmail_password) {
    console.log('❌ Credenciais não encontradas no .env.local');
    return false;
  }
  
  console.log('📧 Email configurado:', gmail_email);
  console.log('🔑 App Password configurada:', gmail_password.substring(0, 4) + '****' + gmail_password.substring(12));
  
  // Criar transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: gmail_email,
      pass: gmail_password
    }
  });
  
  try {
    // Verificar conexão
    await transporter.verify();
    console.log('✅ Conexão Gmail OK!');
    
    // Enviar email de teste
    const info = await transporter.sendMail({
      from: gmail_email,
      to: gmail_email, // Enviar para si mesmo
      subject: '✅ Teste Fly2Any - Configuração Gmail',
      html: `
        <h2>🎉 Configuração Gmail Funcionando!</h2>
        <p>Este email confirma que o sistema de email marketing da Fly2Any está configurado corretamente.</p>
        <ul>
          <li>📧 Email: ${gmail_email}</li>
          <li>🕒 Testado em: ${new Date().toLocaleString('pt-BR')}</li>
          <li>⚡ Sistema: N8N + Gmail SMTP</li>
        </ul>
        <p><strong>Próximo passo:</strong> Configurar o workflow N8N</p>
      `
    });
    
    console.log('📨 Email de teste enviado!');
    console.log('📬 Verifique sua caixa de entrada:', gmail_email);
    return true;
    
  } catch (error) {
    console.log('❌ Erro ao testar Gmail:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('🔐 Erro de autenticação:');
      console.log('   - Verifique se o App Password está correto');
      console.log('   - Confirme se 2FA está ativado na conta Gmail');
    }
    
    return false;
  }
}

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });
testGmailConfig();
EOF

# Verificar se nodemailer está instalado
if ! npm list nodemailer &> /dev/null; then
    echo "📦 Instalando nodemailer para teste..."
    npm install nodemailer --save-dev
fi

# Executar teste
echo "🧪 Executando teste de configuração..."
node test-gmail-config.js

# Limpar arquivo de teste
rm test-gmail-config.js

echo ""
echo "=================================================="
echo "✅ Configuração Gmail Concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acesse: https://n8n-production-81b6.up.railway.app"
echo "   2. Importe o workflow: n8n-smtp-workflow.json"
echo "   3. Configure credencial SMTP no N8N:"
echo "      - Host: smtp.gmail.com"
echo "      - Port: 587"
echo "      - User: $GMAIL_EMAIL"
echo "      - Password: [sua app password]"
echo "   4. Ative o workflow"
echo "   5. Teste com: node test-email-marketing.js"
echo ""
echo "🔗 Webhook será: https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final"
echo "=================================================="