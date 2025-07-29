#!/bin/bash

echo "🔍 MONITORAMENTO SSL - fly2any.com"
echo "=================================="

# Função para checar DNS
check_dns() {
    echo "📡 Verificando DNS..."
    dig fly2any.com +short
    echo ""
}

# Função para checar SSL
check_ssl() {
    echo "🔒 Testando SSL..."
    curl -I https://fly2any.com 2>/dev/null | head -1
    echo ""
}

# Função para testar redirect
check_redirect() {
    echo "🔄 Testando redirect..."
    curl -I https://fly2any.com 2>/dev/null | grep -i location
    echo ""
}

# Loop de monitoramento
echo "🚀 Iniciando monitoramento..."
echo "Pressione Ctrl+C para parar"
echo ""

while true; do
    echo "$(date): Verificando..."
    check_dns
    check_ssl
    check_redirect
    echo "---"
    sleep 30
done