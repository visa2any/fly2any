#!/bin/bash

echo "🚀 Iniciando N8N para Fly2Any Email Marketing..."

# Verificar se porta 5678 está livre
if lsof -Pi :5678 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Porta 5678 já está em uso!"
    echo "🔍 Processo usando a porta:"
    lsof -Pi :5678 -sTCP:LISTEN 2>/dev/null || echo "Não foi possível identificar o processo"
    read -p "🤔 Deseja finalizar o processo? (y/n): " kill_process
    if [ "$kill_process" = "y" ]; then
        pkill -f n8n 2>/dev/null || kill $(lsof -t -i:5678 2>/dev/null) 2>/dev/null || echo "Processo não encontrado"
        echo "✅ Tentativa de finalização concluída"
        sleep 2
    fi
fi

# Verificar se N8N está instalado
if ! command -v n8n &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ N8N não encontrado!"
    echo "📦 Execute primeiro: npm install -g n8n"
    echo "📖 Ou veja: docs/N8N_SETUP.md"
    exit 1
fi

# Iniciar N8N
echo "▶️  Iniciando N8N..."
echo "🌐 Acesse: http://localhost:5678"
echo "📖 Documentação: docs/N8N_SETUP.md"
echo "📋 Workflow: n8n-workflows/email-marketing-workflow.json"
echo ""
echo "⏹️  Para parar: Ctrl+C"
echo ""

# Tentar com N8N instalado globalmente, senão usar NPX
if command -v n8n &> /dev/null; then
    n8n start
else
    echo "📦 Usando NPX (primeira execução pode demorar)..."
    npx n8n
fi