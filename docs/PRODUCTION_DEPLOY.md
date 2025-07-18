# 🚀 Deploy Produção - N8N + Email Marketing

## 🏗️ Arquitetura Produção

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   N8N Cloud     │    │   Gmail API     │
│   (fly2any.com) │───▶│   (n8n.cloud)   │───▶│   (Google)      │
│                 │    │                 │    │                 │
│ Email Marketing │    │ Workflows       │    │ 5k emails/dia   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Opções de Deploy N8N

### Opção 1: N8N Cloud (Recomendado) ⭐
```bash
# 1. Criar conta em n8n.cloud
# 2. Importar workflow
# 3. Conectar Gmail
# 4. Copiar webhook URL para Vercel
```

**Vantagens:**
- ✅ Zero configuração servidor
- ✅ SSL automático  
- ✅ Backup automático
- ✅ Escalabilidade

**Custo:**
- 🆓 Free: 5k execuções/mês
- 💰 Pro: $20/mês (execuções ilimitadas)

### Opção 2: Railway/Render
```bash
# Deploy via Railway
git clone https://github.com/n8nio/n8n-railway-template
# Configurar env vars
# Deploy automático
```

### Opção 3: VPS próprio
```bash
# Docker Compose em VPS
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://your-domain.com
    volumes:
      - n8n_data:/home/node/.n8n
```

## ⚙️ Configuração Vercel

### 1. Variáveis de Ambiente
```bash
# Em vercel.com dashboard
N8N_WEBHOOK_EMAIL_MARKETING=https://your-n8n.cloud/webhook/email-campaign

# Ou N8N Cloud
N8N_WEBHOOK_EMAIL_MARKETING=https://yourapp.app.n8n.cloud/webhook/email-campaign
```

### 2. Arquivo vercel.json
```json
{
  "env": {
    "N8N_WEBHOOK_EMAIL_MARKETING": "https://yourapp.app.n8n.cloud/webhook/email-campaign"
  }
}
```

## 🔧 Setup Passo a Passo

### 1. N8N Cloud Setup
1. **Criar conta**: https://n8n.cloud
2. **Importar workflow**: Copiar `n8n-workflows/email-marketing-workflow.json`
3. **Configurar Gmail OAuth2**:
   - Google Cloud Console
   - Criar OAuth credentials
   - Scope: `https://www.googleapis.com/auth/gmail.send`
4. **Ativar workflow**
5. **Copiar webhook URL**

### 2. Vercel Deploy
```bash
# No projeto Fly2Any
vercel env add N8N_WEBHOOK_EMAIL_MARKETING
# Colar: https://yourapp.app.n8n.cloud/webhook/email-campaign

vercel --prod
```

### 3. Teste Produção
```bash
# Testar webhook
curl -X POST https://fly2any.com/api/email-marketing \
  -H "Content-Type: application/json" \
  -d '{"action": "send_promotional"}'
```

## 🔄 Desenvolvimento vs Produção

### Desenvolvimento
```bash
# Local
N8N_WEBHOOK_EMAIL_MARKETING=http://localhost:5678/webhook/email-campaign
./start-n8n.sh
```

### Produção
```bash
# Vercel
N8N_WEBHOOK_EMAIL_MARKETING=https://yourapp.app.n8n.cloud/webhook/email-campaign
```

## 💰 Custos Estimados

### Gratuito (até 5k emails/mês)
- ✅ Vercel: $0 (Hobby plan)
- ✅ N8N Cloud: $0 (Free tier)
- ✅ Gmail API: $0 (até 500/dia por conta)

### Escala (50k+ emails/mês)
- 💰 Vercel Pro: $20/mês
- 💰 N8N Cloud Pro: $20/mês
- 💰 Google Workspace: $6/usuário/mês (2k emails/dia)
- 📧 **Total**: ~$66/mês para 50k emails

## 🚨 Configuração de Produção

### 1. Múltiplas Contas Gmail
```javascript
// No workflow N8N
const accounts = [
  'marketing1@fly2any.com',
  'marketing2@fly2any.com', 
  'marketing3@fly2any.com'
];

// Rotação automática
const accountIndex = {{ $runIndex }} % accounts.length;
```

### 2. Rate Limiting
```javascript
// Configuração no workflow
{
  "batchSize": 10,           // 10 emails por vez
  "delayBetweenBatches": 30, // 30 segundos entre lotes
  "maxEmailsPerHour": 100    // Limite por hora
}
```

### 3. Monitoramento
```bash
# Logs N8N Cloud
# Webhook analytics
# Gmail quota monitoring
```

## 🔧 Script de Deploy Automatizado

Criar `deploy-production.sh`:
```bash
#!/bin/bash
echo "🚀 Deploy Fly2Any + N8N Produção"

# 1. Deploy Vercel
vercel --prod

# 2. Configurar N8N Cloud webhook
echo "📋 Configure N8N webhook URL:"
echo "https://fly2any.com/api/email-marketing"

# 3. Testar sistema
curl -X GET https://fly2any.com/api/email-marketing?action=stats

echo "✅ Deploy concluído!"
```

## 📊 Monitoramento

### 1. Métricas N8N
- Execuções/dia
- Taxa de erro
- Tempo de resposta

### 2. Gmail Quotas
- Emails enviados/dia
- Bounces
- Spam rate

### 3. Vercel Analytics
- API calls
- Response time
- Error rate

---

💡 **Recomendação**: Começar com N8N Cloud (gratuito) + Vercel para validar o sistema, depois escalar conforme necessário.