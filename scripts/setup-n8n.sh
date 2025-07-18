#!/bin/bash

# 🚀 Script de Setup Automático N8N - Fly2Any Email Marketing

echo "🚀 Iniciando setup do N8N para Fly2Any..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro!"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se NPM está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não encontrado!"
    exit 1
fi

echo "✅ NPM encontrado: $(npm --version)"

# Instalar N8N globalmente
echo "📦 Instalando N8N..."
npm install -g n8n

# Verificar instalação
if ! command -v n8n &> /dev/null; then
    echo "❌ Falha na instalação do N8N!"
    exit 1
fi

echo "✅ N8N instalado com sucesso: $(n8n --version)"

# Criar diretório de configuração
mkdir -p ~/.n8n/workflows

# Copiar workflow para diretório N8N
echo "📋 Copiando workflow do email marketing..."
cp ./n8n-workflows/email-marketing-workflow.json ~/.n8n/workflows/

# Criar arquivo de configuração básica
echo "⚙️ Configurando N8N..."
cat > ~/.n8n/config.json << EOF
{
  "database": {
    "type": "sqlite",
    "database": "database.sqlite"
  },
  "credentials": {
    "overwrite": {
      "data": "ask"
    }
  },
  "nodes": {
    "exclude": []
  },
  "logs": {
    "level": "info",
    "output": "console"
  }
}
EOF

# Verificar se arquivo .env.local existe
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    touch .env.local
fi

# Adicionar webhook URL no .env se não existir
if ! grep -q "N8N_WEBHOOK_EMAIL_MARKETING" .env.local; then
    echo "" >> .env.local
    echo "# N8N Email Marketing Webhook" >> .env.local
    echo "N8N_WEBHOOK_EMAIL_MARKETING=http://localhost:5678/webhook/email-campaign" >> .env.local
    echo "✅ Webhook URL adicionada ao .env.local"
fi

# Criar script de inicialização
echo "📜 Criando script de inicialização..."
cat > start-n8n.sh << 'EOF'
#!/bin/bash

echo "🚀 Iniciando N8N para Fly2Any Email Marketing..."

# Verificar se porta 5678 está livre
if lsof -Pi :5678 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Porta 5678 já está em uso!"
    echo "🔍 Processo usando a porta:"
    lsof -Pi :5678 -sTCP:LISTEN
    read -p "🤔 Deseja finalizar o processo? (y/n): " kill_process
    if [ "$kill_process" = "y" ]; then
        kill $(lsof -t -i:5678)
        echo "✅ Processo finalizado"
    else
        echo "❌ Cancelando inicialização"
        exit 1
    fi
fi

# Iniciar N8N
echo "▶️  Iniciando N8N..."
echo "🌐 Acesse: http://localhost:5678"
echo "📖 Documentação: ./docs/N8N_SETUP.md"
echo ""
echo "⏹️  Para parar: Ctrl+C"
echo ""

n8n start --tunnel
EOF

chmod +x start-n8n.sh

echo ""
echo "🎉 Setup do N8N concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. 🚀 Executar: ./start-n8n.sh"
echo "2. 🌐 Acessar: http://localhost:5678"
echo "3. 👤 Criar conta de administrador"
echo "4. 📥 Importar workflow de: n8n-workflows/email-marketing-workflow.json"
echo "5. 🔑 Configurar credenciais Gmail (ver docs/N8N_SETUP.md)"
echo ""
echo "📖 Documentação completa: docs/N8N_SETUP.md"
echo ""
echo "✨ Email Marketing está pronto para uso!"