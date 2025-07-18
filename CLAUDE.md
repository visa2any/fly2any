# 🤖 Claude Code MCP Automation Guide

## 🎯 MCPs Instalados e Configurados

### Core MCPs Ativos:
- **Context7** → Documentação atualizada (`use context7`)
- **Puppeteer** → Automação web e scraping  
- **GitHub** → Operações Git/GitHub completas
- **FileSystem** → Manipulação segura de arquivos
- **Fetch/HTTP** → Testes de API e requisições
- **Sequential Thinking** → Planejamento estruturado

## 🚀 Automação Inteligente

### Detecção Automática por Contexto:

#### 🔧 **Git/GitHub Operations**
**Palavras-chave:** `git`, `commit`, `push`, `pull`, `branch`, `pr`, `issue`
**MCPs ativados:** GitHub + FileSystem
```bash
# Exemplos de uso:
- "criar um commit"
- "analisar pull requests" 
- "verificar git status"
```

#### 🌐 **API Development** 
**Palavras-chave:** `api`, `endpoint`, `http`, `rest`, `test api`
**MCPs ativados:** Fetch + Context7 + Sequential
```bash
# Exemplos de uso:
- "testar API do sistema"
- "validar endpoints REST"
- "chamar API externa"
```

#### 🤖 **Web Automation**
**Palavras-chave:** `scrape`, `screenshot`, `browser`, `automation`
**MCPs ativados:** Puppeteer + Fetch  
```bash
# Exemplos de uso:
- "fazer scraping do site"
- "capturar screenshot"
- "automatizar testes E2E"
```

#### 📚 **Documentation**
**Palavras-chave:** `docs`, `documentation`, `use context7`
**MCPs ativados:** Context7 + FileSystem + GitHub
```bash
# Exemplos de uso:
- "buscar docs do React"
- "use context7 para Next.js"
- "criar documentação"
```

#### 📁 **File Operations**
**Palavras-chave:** `file`, `edit`, `refactor`, `rename`, `move`
**MCPs ativados:** FileSystem + Sequential
```bash
# Exemplos de uso:
- "refatorar componente"
- "reorganizar arquivos"
- "criar nova estrutura"
```

#### 🎯 **Complex Planning**
**Palavras-chave:** `plan`, `architecture`, `design`, `structure`
**MCPs ativados:** Sequential + FileSystem + GitHub
```bash
# Exemplos de uso:
- "planejar nova feature"
- "arquitetar sistema"
- "definir estrutura"
```

#### 🚀 **Full Development**
**Palavras-chave:** `implement`, `build app`, `full stack`, `deploy`
**MCPs ativados:** TODOS os MCPs
```bash
# Exemplos de uso:
- "implementar sistema completo"
- "build full stack app"
- "deploy em produção"
```

## ⚡ Aliases Rápidos

- `@git` → Ativa GitHub + FileSystem
- `@api` → Ativa Fetch + Context7 + Sequential  
- `@web` → Ativa Puppeteer + Fetch
- `@docs` → Ativa Context7 + FileSystem + GitHub
- `@plan` → Ativa Sequential + FileSystem + GitHub
- `@all` → Ativa TODOS os MCPs

## 🔄 Como Funciona

1. **Detecção Automática:** O sistema analisa suas palavras e detecta o tipo de tarefa
2. **Ativação Inteligente:** Os MCPs mais relevantes são sugeridos/ativados
3. **Execução Otimizada:** Cada MCP trabalha em sua especialidade
4. **Feedback Contínuo:** O sistema aprende seus padrões de uso

## 📋 Comandos Úteis

```bash
# Verificar MCPs ativos
claude mcp list

# Testar automação  
./.claude-hooks.sh "criar um commit"

# Verificar configuração
cat .claude-automation.json
```

## 🎉 Benefícios

- **Automação 100%** → Sem configuração manual
- **Contexto Inteligente** → MCPs certos para cada tarefa  
- **Performance** → Apenas os MCPs necessários ativos
- **Flexibilidade** → Aliases para controle manual

---
*Sistema configurado automaticamente para máxima produtividade!* 🚀