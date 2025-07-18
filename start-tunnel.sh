#!/bin/bash

# Configurar PATH
export PATH="$HOME/.local/bin:$PATH"

# Configurar Claude Code
echo "🚀 Configurando Claude Code..."
claude auth login

# Iniciar tunnel
echo "🔗 Iniciando VS Code Tunnel..."
code tunnel --accept-server-license-terms --name fly2any-project

echo "✅ Tunnel ativo! Acesse: https://vscode.dev/tunnel/fly2any-project"