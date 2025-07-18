# 🧠 Claude Memory System

Sistema de memória inteligente para o Claude Code MCP que mantém contexto entre sessões.

## 🚀 Funcionalidades

### ✅ Já Implementado:
- **Auto-Save**: Salvamento automático a cada 30 segundos
- **Gestão de Sessões**: Salvar/restaurar contexto completo
- **Histórico**: Manter últimas 50 sessões
- **Busca**: Encontrar sessões por conteúdo
- **Snapshots**: Marcos importantes do projeto
- **Cleanup**: Limpeza automática de arquivos antigos

### 🔧 Componentes:

#### 1. **session-manager.js**
Sistema base de gerenciamento de memória:
```bash
node session-manager.js status    # Ver status
node session-manager.js restore   # Restaurar sessão
node session-manager.js clear     # Limpar memória
node session-manager.js search "termo" # Buscar
```

#### 2. **auto-save.js**
Sistema de salvamento automático:
```bash
node auto-save.js start          # Iniciar auto-save
node auto-save.js restore        # Restaurar com contexto
node auto-save.js snapshot "desc" # Criar snapshot
node auto-save.js cleanup [dias] # Limpar antigos
```

#### 3. **hooks/memory-hook.js**
Hook integrado para uso com Claude:
```bash
node memory-hook.js init         # Inicializar hook
node memory-hook.js add-task "desc" # Adicionar tarefa
node memory-hook.js snapshot "desc" # Criar marco
node memory-hook.js summary      # Ver resumo
```

## 📁 Estrutura de Dados

### Sessão:
```json
{
  "timestamp": "2025-07-17T08:00:00.000Z",
  "id": "session-unique-id",
  "tasks": [],
  "context": "contexto atual",
  "files_modified": [],
  "current_goal": "objetivo atual",
  "progress": {}
}
```

### Tarefa:
```json
{
  "id": 1642434000000,
  "task": "Implementar sistema de memória",
  "status": "completed",
  "created": "2025-07-17T08:00:00.000Z",
  "updated": "2025-07-17T08:30:00.000Z"
}
```

## 🔄 Integração com Claude

### Configuração Automática:
O sistema é ativado automaticamente quando MCPs de memória são detectados.

### Comandos Disponíveis:
- `@memory status` - Ver status da memória
- `@memory restore` - Restaurar última sessão
- `@memory snapshot "descrição"` - Criar marco
- `@memory search "termo"` - Buscar sessões

## 📊 Monitoramento

### Status da Memória:
```bash
node session-manager.js status
```

Retorna:
- `hasCurrentSession`: Se há sessão ativa
- `hasHistory`: Se há histórico
- `hasContext`: Se há contexto salvo
- `memorySize`: Tamanho da memória em bytes
- `sessionCount`: Número de sessões
- `lastSession`: Data da última sessão

## 🧹 Manutenção

### Cleanup Automático:
- Snapshots antigos (>30 dias) removidos automaticamente
- Histórico limitado a 50 sessões
- Contexto com 10 entradas por tipo

### Limpeza Manual:
```bash
node auto-save.js cleanup 7  # Limpar arquivos de 7+ dias
node session-manager.js clear # Limpar toda memória
```

## 🚀 Uso Prático

### Inicialização:
```bash
# Iniciar sistema de memória
node .claude-memory/hooks/memory-hook.js init

# Restaurar sessão anterior
node .claude-memory/auto-save.js restore
```

### Durante Desenvolvimento:
```bash
# Adicionar tarefa
node .claude-memory/hooks/memory-hook.js add-task "Implementar nova feature"

# Criar marco importante
node .claude-memory/hooks/memory-hook.js snapshot "MVP completo"

# Ver resumo
node .claude-memory/hooks/memory-hook.js summary
```

## 🔧 Configuração

### Intervalo de Auto-Save:
Modificar em `auto-save.js`:
```javascript
this.startAutoSave(30000); // 30 segundos
```

### Limite de Histórico:
Modificar em `session-manager.js`:
```javascript
if (history.length > 50) {
    history = history.slice(0, 50);
}
```

## 📈 Benefícios

1. **Continuidade**: Nunca perder contexto entre sessões
2. **Eficiência**: Não repetir trabalho já feito
3. **Rastreamento**: Histórico completo de modificações
4. **Backup**: Snapshots automáticos de marcos importantes
5. **Busca**: Encontrar informações de sessões antigas

---

*Sistema de memória Claude completamente funcional!* 🧠✨