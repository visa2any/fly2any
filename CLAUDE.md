# 🤖 Claude Code MCP Automation Guide

## 🎯 MCPs Instalados e Configurados

### Core MCPs Ativos:
- **Context7** → Documentação atualizada (`use context7`)
- **Puppeteer** → Automação web e scraping  
- **Playwright** → Automação web avançada e testes E2E 🆕
- **GitHub** → Operações Git/GitHub completas
- **FileSystem** → Manipulação segura de arquivos
- **Fetch/HTTP** → Testes de API e requisições
- **Sequential Thinking** → Planejamento estruturado
- **Serena** → Análise semântica de código e edição avançada

### Dicas de Uso de MCPs:
- use os mcps para ajudar na tarefa
- use mcp to help with tasks

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
**Palavras-chave:** `scrape`, `screenshot`, `browser`, `automation`, `test`, `e2e`
**MCPs ativados:** Playwright + Puppeteer + Fetch  
```bash
# Exemplos de uso:
- "fazer scraping do site"
- "capturar screenshot"
- "automatizar testes E2E"
- "testar interface do usuário"
- "simular cliques e navegação"
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

#### 🧠 **Semantic Code Analysis**
**Palavras-chave:** `semantic analysis`, `code structure`, `symbol search`, `refactor code`
**MCPs ativados:** Serena + FileSystem + Sequential
```bash
# Exemplos de uso:
- "analisar estrutura do código"
- "encontrar definição da função"
- "refatorar componente semanticamente"
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
- `@web` → Ativa Playwright + Puppeteer + Fetch
- `@docs` → Ativa Context7 + FileSystem + GitHub
- `@plan` → Ativa Sequential + FileSystem + GitHub
- `@serena` → Ativa Serena + FileSystem + Sequential
- `@playwright` → Ativa Playwright + FileSystem + Sequential 🆕
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

# Playwright - Automação Web
npx @playwright/mcp --version           # Verificar versão
npx @playwright/mcp --help             # Ver opções disponíveis
npx playwright install chromium        # Instalar navegadores
```

## 🎭 Playwright MCP - Recursos Disponíveis

### 🔧 Funcionalidades:
- **Screenshot** → Captura de tela de páginas web
- **Navigation** → Navegação automatizada entre páginas
- **Form Filling** → Preenchimento automático de formulários
- **Element Interaction** → Cliques, digitação, seleção
- **Content Extraction** → Extração de dados de páginas
- **Network Monitoring** → Monitoramento de requisições
- **Mobile Emulation** → Simulação de dispositivos móveis
- **Visual Testing** → Comparação visual de interfaces

### 🎯 Casos de Uso:
- Testes E2E automatizados
- Validação de interfaces responsivas
- Extração de dados de sites
- Automação de fluxos de usuário
- Monitoramento de performance web
- Captura de evidências visuais

## 🎉 Benefícios

- **Automação 100%** → Sem configuração manual
- **Contexto Inteligente** → MCPs certos para cada tarefa  
- **Performance** → Apenas os MCPs necessários ativos
- **Flexibilidade** → Aliases para controle manual

---
*Sistema configurado automaticamente para máxima produtividade!* 🚀