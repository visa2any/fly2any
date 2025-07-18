#!/bin/bash

# 🤖 Claude Code MCP Automation Hooks
# Sistema inteligente de detecção e ativação automática de MCPs

set -e

# Configuração
AUTOMATION_CONFIG=".claude-automation.json"
LOG_FILE=".claude-automation.log"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Detectar contexto do comando
detect_context() {
    local input="$1"
    local context=""
    
    # Converter para lowercase para análise
    local input_lower=$(echo "$input" | tr '[:upper:]' '[:lower:]')
    
    # Git Operations
    if echo "$input_lower" | grep -qE "(git|commit|push|pull|branch|pr|issue|merge)"; then
        context="git_operations"
    # API Development  
    elif echo "$input_lower" | grep -qE "(api|endpoint|http|rest|test api|webhook)"; then
        context="api_development"
    # Web Automation
    elif echo "$input_lower" | grep -qE "(scrape|screenshot|browser|automation|e2e)"; then
        context="web_automation"
    # Documentation
    elif echo "$input_lower" | grep -qE "(docs|documentation|use context7|readme)"; then
        context="documentation"
    # File Operations
    elif echo "$input_lower" | grep -qE "(file|edit|refactor|rename|move)"; then
        context="file_operations"
    # Complex Planning
    elif echo "$input_lower" | grep -qE "(plan|architecture|design|structure)"; then
        context="complex_planning"
    # Full Development
    elif echo "$input_lower" | grep -qE "(implement|build app|full stack|deploy)"; then
        context="full_development"
    fi
    
    echo "$context"
}

# Sugerir MCPs baseado no contexto
suggest_mcps() {
    local context="$1"
    local mcps=""
    
    case "$context" in
        "git_operations")
            mcps="github filesystem"
            ;;
        "api_development")  
            mcps="fetch context7 sequential"
            ;;
        "web_automation")
            mcps="puppeteer fetch"
            ;;
        "documentation")
            mcps="context7 filesystem github"
            ;;
        "file_operations")
            mcps="filesystem sequential"
            ;;
        "complex_planning")
            mcps="sequential filesystem github"
            ;;
        "full_development")
            mcps="context7 puppeteer github filesystem fetch sequential"
            ;;
        *)
            mcps="filesystem sequential"  # Default
            ;;
    esac
    
    echo "$mcps"
}

# Verificar MCPs disponíveis
check_available_mcps() {
    claude mcp list 2>/dev/null || echo "Nenhum MCP configurado"
}

# Função principal
main() {
    local user_input="$1"
    
    if [ -z "$user_input" ]; then
        echo "Usage: $0 \"<user command>\""
        exit 1
    fi
    
    log "🔍 Analisando comando: $user_input"
    
    # Detectar contexto
    local context=$(detect_context "$user_input")
    
    if [ -n "$context" ]; then
        log "✅ Contexto detectado: $context"
        
        # Sugerir MCPs
        local suggested_mcps=$(suggest_mcps "$context")
        log "🎯 MCPs sugeridos: $suggested_mcps"
        
        # Mostrar MCPs disponíveis
        log "📋 MCPs configurados:"
        check_available_mcps
        
        echo ""
        echo "🤖 Automação MCP Detectada:"
        echo "   Contexto: $context"
        echo "   MCPs recomendados: $suggested_mcps"
        echo ""
        echo "💡 Para ativar, use: claude --mcp-config <mcp_names>"
        
    else
        log "ℹ️  Nenhum contexto específico detectado, usando MCPs padrão"
        echo "🔧 Usando configuração padrão: filesystem + sequential"
    fi
}

# Executar se chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi