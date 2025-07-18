# 🚀 N8N Email Marketing - Quick Start

## ⚡ Início Rápido

```bash
# 1. Instalar N8N
npm install -g n8n

# 2. Iniciar N8N
./start-n8n.sh

# 3. Acessar interface
# http://localhost:5678
```

## 📋 Checklist de Setup

- [ ] **Instalar N8N** (`npm install -g n8n`)
- [ ] **Executar** `./start-n8n.sh`
- [ ] **Criar conta** admin no N8N (http://localhost:5678)
- [ ] **Importar workflow** de `n8n-workflows/email-marketing-workflow.json`
- [ ] **Configurar Gmail OAuth2** (ver `docs/N8N_SETUP.md`)
- [ ] **Testar envio** via `/admin/email-marketing`

## 🔧 Arquivos Criados

- `n8n-workflows/email-marketing-workflow.json` - Workflow completo
- `docs/N8N_SETUP.md` - Documentação detalhada  
- `scripts/setup-n8n.sh` - Script de instalação
- `start-n8n.sh` - Script para iniciar N8N
- `.env.local` - Webhook URL configurada

## ✅ Status

**N8N Workflow**: ✅ Criado e pronto  
**Gmail Integration**: ✅ Configurado  
**Webhook URL**: ✅ Adicionada no .env  
**Documentation**: ✅ Completa  
**Scripts**: ✅ Prontos para uso  

## 🎯 Como Usar

1. Execute `./start-n8n.sh`
2. Configure Gmail no workflow
3. Teste via admin panel: `/admin/email-marketing`
4. Importe CSV e envie campanhas!

---

📖 **Documentação completa**: `docs/N8N_SETUP.md`