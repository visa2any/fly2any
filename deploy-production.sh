#!/bin/bash

echo "🚀 Deploy Fly2Any Email Marketing - Produção"
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "📋 Checklist de Deploy:"
echo ""

# 1. N8N Cloud Setup
echo "1️⃣  N8N Cloud Setup:"
echo "   ▶️  Acesse: https://n8n.cloud"
echo "   ▶️  Crie conta gratuita"
echo "   ▶️  Importe: n8n-workflows/email-marketing-workflow.json"
echo "   ▶️  Configure Gmail OAuth2"
echo "   ▶️  Copie webhook URL"
echo ""

read -p "🤔 N8N Cloud está configurado? (y/n): " n8n_ready
if [ "$n8n_ready" != "y" ]; then
    echo "❌ Configure N8N Cloud primeiro!"
    echo "📖 Guia: docs/PRODUCTION_DEPLOY.md"
    exit 1
fi

# 2. Webhook URL
echo ""
echo "2️⃣  Configure Webhook URL:"
read -p "🔗 Cole a webhook URL do N8N Cloud: " webhook_url

if [ -z "$webhook_url" ]; then
    echo "❌ Webhook URL é obrigatória!"
    exit 1
fi

# 3. Configurar Vercel env
echo ""
echo "3️⃣  Configurando Vercel..."

# Verificar se já está logado no Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Fazendo login no Vercel..."
    vercel login
fi

# Adicionar env var
echo "📝 Adicionando variável de ambiente..."
echo "$webhook_url" | vercel env add N8N_WEBHOOK_EMAIL_MARKETING production

# 4. Deploy
echo ""
echo "4️⃣  Fazendo deploy..."
vercel --prod

# 5. Teste
echo ""
echo "5️⃣  Testando sistema..."
echo "⏳ Aguardando deploy..."
sleep 10

# Obter URL do deploy
DEPLOY_URL=$(vercel ls --scope=$(vercel whoami) 2>/dev/null | grep "fly2any" | head -1 | awk '{print $2}' || echo "fly2any.vercel.app")

echo "🧪 Testando API..."
curl -s "https://$DEPLOY_URL/api/email-marketing?action=stats" || echo "❌ Erro no teste"

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 URL: https://$DEPLOY_URL"
echo "📧 Email Marketing: https://$DEPLOY_URL/admin/email-marketing"
echo "📊 Campanhas: https://$DEPLOY_URL/admin/campaigns"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse o admin panel"
echo "2. Importe lista de emails (CSV)"
echo "3. Teste envio de campanha"
echo "4. Configure Google Analytics (opcional)"
echo ""
echo "📖 Documentação: docs/PRODUCTION_DEPLOY.md"
echo "🎉 Sistema pronto para produção!"