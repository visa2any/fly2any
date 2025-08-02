#!/bin/bash

# 🛡️ Sistema de Backup e Recuperação - Fly2Any
# Protege contra problemas durante desenvolvimento

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Função para criar backup completo
create_backup() {
    echo "🔄 Criando backup completo..."
    
    # Backup dos arquivos críticos
    cp -r src/components $BACKUP_DIR/components_$TIMESTAMP
    cp -r src/app $BACKUP_DIR/app_$TIMESTAMP
    cp -r src/lib $BACKUP_DIR/lib_$TIMESTAMP
    cp src/app/globals.css $BACKUP_DIR/globals_css_$TIMESTAMP
    cp package.json $BACKUP_DIR/package_json_$TIMESTAMP
    cp next.config.ts $BACKUP_DIR/next_config_$TIMESTAMP 2>/dev/null || true
    
    echo "✅ Backup criado: $TIMESTAMP"
    echo "📂 Localização: $BACKUP_DIR/"
}

# Função para listar backups
list_backups() {
    echo "📋 Backups disponíveis:"
    ls -la $BACKUP_DIR/ | grep -E "(components_|app_|lib_)" | sort -r
}

# Função para restaurar backup
restore_backup() {
    if [ -z "$1" ]; then
        echo "❌ Uso: ./backup-system.sh restore TIMESTAMP"
        echo "📋 Use './backup-system.sh list' para ver backups disponíveis"
        exit 1
    fi
    
    RESTORE_TIME=$1
    echo "🔄 Restaurando backup de $RESTORE_TIME..."
    
    # Criar backup atual antes de restaurar
    echo "💾 Criando backup de segurança atual..."
    create_backup
    
    # Restaurar arquivos
    if [ -d "$BACKUP_DIR/components_$RESTORE_TIME" ]; then
        rm -rf src/components
        cp -r $BACKUP_DIR/components_$RESTORE_TIME src/components
        echo "✅ Componentes restaurados"
    fi
    
    if [ -d "$BACKUP_DIR/app_$RESTORE_TIME" ]; then
        rm -rf src/app
        cp -r $BACKUP_DIR/app_$RESTORE_TIME src/app
        echo "✅ App restaurado"
    fi
    
    if [ -d "$BACKUP_DIR/lib_$RESTORE_TIME" ]; then
        rm -rf src/lib
        cp -r $BACKUP_DIR/lib_$RESTORE_TIME src/lib
        echo "✅ Lib restaurada"
    fi
    
    echo "🎉 Restauração completa! Reinicie o servidor com 'npm run dev'"
}

# Função para backup rápido (apenas arquivos críticos)
quick_backup() {
    echo "⚡ Criando backup rápido..."
    cp src/components/Icons.tsx $BACKUP_DIR/Icons_tsx_$TIMESTAMP
    cp src/app/globals.css $BACKUP_DIR/globals_css_quick_$TIMESTAMP
    echo "✅ Backup rápido criado: Icons e CSS salvos"
}

# Menu principal
case "$1" in
    "backup"|"b")
        create_backup
        ;;
    "quick"|"q")
        quick_backup
        ;;
    "list"|"l")
        list_backups
        ;;
    "restore"|"r")
        restore_backup $2
        ;;
    *)
        echo "🛡️ Sistema de Backup - Fly2Any"
        echo ""
        echo "Comandos disponíveis:"
        echo "  backup|b        - Criar backup completo"
        echo "  quick|q         - Backup rápido (Icons + CSS)"
        echo "  list|l          - Listar backups disponíveis"
        echo "  restore|r TIME  - Restaurar backup específico"
        echo ""
        echo "Exemplos:"
        echo "  ./backup-system.sh backup"
        echo "  ./backup-system.sh restore 20250802_155900"
        ;;
esac