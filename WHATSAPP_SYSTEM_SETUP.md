# 🚀 CONFIGURAÇÃO COMPLETA DO SISTEMA WHATSAPP → LEADS

## 📋 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

### 🔐 **Essenciais (Sistema não funciona sem):**
```env
# Banco de dados
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# App URL
NEXT_PUBLIC_APP_URL="https://www.fly2any.com"

# N8N Webhooks (Railway)
N8N_WEBHOOK_WHATSAPP="https://n8n-production-81b6.up.railway.app/webhook/whatsapp"
N8N_WEBHOOK_EMAIL_MARKETING="https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final"
N8N_WEBHOOK_LEAD="https://n8n-production-81b6.up.railway.app/webhook/lead"
```

### 🔧 **Opcionais (Melhoram funcionalidade):**
```env
# WhatsApp
WHATSAPP_VERIFY_TOKEN="seu-token-verificacao"

# Cron Jobs
CRON_SECRET="seu-secret-para-cron"

# Gmail (para notificações)
GMAIL_USER="your-email@gmail.com"
GMAIL_PASS="your-app-password"
```

## 🗄️ TABELAS DO BANCO CRIADAS AUTOMATICAMENTE

O sistema cria estas tabelas automaticamente:

1. **`whatsapp_conversations`** - Conversas do WhatsApp
2. **`whatsapp_messages`** - Mensagens individuais
3. **`whatsapp_followups`** - Follow-ups agendados
4. **`email_contacts`** - Contatos para email marketing (já existe)
5. **`email_campaigns`** - Campanhas de email (já existe)

## 🎯 FLUXO COMPLETO IMPLEMENTADO

```
📱 WhatsApp Message
    ↓
🧠 AI Lead Extractor (NOVO)
    ↓ (se dados suficientes)
📊 Create Lead via API
    ↓
🎯 N8N Workflow (Railway)
    ↓
📧 Admin Notification
    ↓
🤖 Schedule Follow-up (NOVO)
    ↓
⏰ Cron Job (15min intervals)
    ↓
💬 Automated Follow-up Message
```

## 🔧 ARQUIVOS IMPLEMENTADOS

### 📁 **Core System:**
- `src/lib/whatsapp-lead-extractor.ts` - IA para extrair dados de viagem
- `src/lib/whatsapp-follow-up.ts` - Sistema de follow-up automático
- `src/lib/whatsapp-system-init.ts` - Inicialização completa

### 🔌 **APIs:**
- `src/app/api/whatsapp/webhook/route.ts` - **MODIFICADO** para criar leads
- `src/app/api/whatsapp/follow-up/route.ts` - Gerenciar follow-ups
- `src/app/api/whatsapp/system/route.ts` - Status do sistema
- `src/app/api/cron/whatsapp-followup/route.ts` - Cron job automático

### 🎯 **N8N:**
- `n8n-workflows/whatsapp-automation-complete.json` - **ATUALIZADO** para leads

### 🧪 **Testes:**
- `test-whatsapp-lead-flow.js` - Teste completo do fluxo

## 🚀 PASSOS PARA ATIVAR

### 1️⃣ **Deploy no Vercel**
```bash
git add .
git commit -m "🤖 Sistema completo WhatsApp → Leads implementado"
git push origin main
```

### 2️⃣ **Configurar N8N no Railway**
1. Acesse Railway N8N: `https://n8n-production-81b6.up.railway.app`
2. Importe workflow: `n8n-workflows/whatsapp-automation-complete.json`
3. Ative o workflow

### 3️⃣ **Verificar Sistema**
```bash
# Teste local
npm run dev

# Verificar APIs
curl http://localhost:3000/api/whatsapp/system?action=status

# Teste completo
node test-whatsapp-lead-flow.js
```

### 4️⃣ **Inicializar WhatsApp (Produção)**
```bash
# Via API
curl -X POST https://www.fly2any.com/api/whatsapp/system \
  -H "Content-Type: application/json" \
  -d '{"action":"initialize"}'

# Verificar status
curl https://www.fly2any.com/api/whatsapp/system?action=health
```

## 🧪 CENÁRIOS DE TESTE

### **Cenário 1: Lead Completo** ✅
```
User: "Oi, preciso de um voo de Miami para São Paulo"
User: "Para 2 pessoas, ida e volta"
User: "Data de ida: 15/08/2025, volta: 30/08/2025"
User: "Classe econômica, orçamento até $1500"

Expected: Lead criado automaticamente no admin
```

### **Cenário 2: Lead Parcial** ⚠️
```
User: "Quero viajar para o Brasil"
User: "Sozinho, só ida"

Expected: Follow-up solicitando mais dados
```

### **Cenário 3: Interesse Geral** 📝
```
User: "Vocês fazem voos para o Brasil?"

Expected: Ticket de suporte + follow-up educacional
```

## 🎛️ DASHBOARDS DE MONITORAMENTO

### **Admin Leads:** `/admin/leads`
- Ver leads criados via WhatsApp
- Status: `source: "whatsapp"`
- Confiança da extração nos metadados

### **Sistema WhatsApp:** `/api/whatsapp/system?action=status`
```json
{
  "database": { "connected": true, "tablesCreated": true },
  "whatsapp": { "connected": true },
  "n8n": { "webhookAccessible": true },
  "apis": { "leadsWorking": true },
  "overall": { "ready": true, "issues": [] }
}
```

### **Follow-ups:** `/api/whatsapp/follow-up?action=stats`
```json
{
  "summary": {
    "total": 15,
    "sent": 12,
    "pending": 2,
    "failed": 1
  }
}
```

## 🚨 TROUBLESHOOTING

### **WhatsApp não conecta:**
1. Verificar QR code: `/api/whatsapp/status`
2. Logs no console do Vercel
3. Reinicializar: `POST /api/whatsapp/system {"action":"initialize"}`

### **Leads não são criados:**
1. Verificar API: `GET /api/leads?limit=1`
2. Logs do webhook: `/api/whatsapp/webhook`
3. Testar extrator manualmente

### **N8N não recebe:**
1. Verificar URL: `N8N_WEBHOOK_WHATSAPP`
2. Testar webhook: `curl POST https://n8n-url/webhook/whatsapp`
3. Logs no Railway

### **Follow-ups não enviam:**
1. Verificar cron: `GET /api/cron/whatsapp-followup`
2. Processar manual: `POST /api/whatsapp/follow-up {"action":"process_pending"}`
3. Verificar tabela `whatsapp_followups`

## 🎉 RESULTADOS ESPERADOS

✅ **Mensagens WhatsApp são automaticamente convertidas em leads**  
✅ **Leads aparecem no dashboard admin**  
✅ **Follow-ups inteligentes são enviados automaticamente**  
✅ **Sistema funciona 24/7 com monitoramento**  
✅ **Integração completa com N8N no Railway**  

---

**🎯 STATUS: SISTEMA COMPLETO IMPLEMENTADO**  
**🚀 PRONTO PARA PRODUÇÃO**