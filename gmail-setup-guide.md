# 📧 Guia Configuração Gmail SMTP - Fly2Any

## 🎯 **Por que Gmail SMTP?**
- ✅ **500 emails/dia grátis** (vs 100 do Resend)
- ✅ **15.000 emails/mês**
- ✅ Alta entregabilidade
- ✅ Sem custo adicional

## 🛠️ **Passo a Passo - Configuração Gmail**

### **1. Ativar Verificação em Duas Etapas**
1. Acesse: https://myaccount.google.com/security
2. Clique em **"Verificação em duas etapas"**
3. Clique **"Começar"** e siga os passos
4. ✅ Confirme que está ativada

### **2. Gerar Senha de App**
1. Na mesma página de segurança
2. Procure por **"Senhas de app"** (aparece só depois do 2FA ativo)
3. Clique em **"Senhas de app"**
4. **Selecionar app:** "Email"
5. **Selecionar dispositivo:** "Outro (nome personalizado)"
6. **Digite:** "Fly2Any SMTP"
7. Clique **"Gerar"**
8. **📋 COPIE a senha de 16 caracteres** (tipo: abcd efgh ijkl mnop)

### **3. Configurar .env.local**
Substitua as credenciais no arquivo `.env.local`:

```bash
# Gmail SMTP Configuration (500 emails/day free)
GMAIL_EMAIL="seuemail@gmail.com"  # ← SEU EMAIL REAL
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"  # ← SENHA DE APP GERADA
```

### **4. Testar Configuração**
```bash
# Executar teste
node test-email-smtp.js
```

**Resultado esperado:**
```
✅ Gmail App Password: Conexão funcionando!
✅ Email enviado com sucesso!
```

## 🚀 **Benefícios Após Configuração:**

### **Emails Ilimitados (até 500/dia):**
- ✅ Campanhas de marketing
- ✅ Newsletters  
- ✅ Notificações automáticas
- ✅ Recuperação de senha
- ✅ Confirmações de compra

### **APIs Prontas:**
- `POST /api/email-ses` → Gmail SMTP
- `POST /api/email-marketing` → Resend (backup)

## ⚠️ **Troubleshooting:**

### **Erro: "Authentication failed"**
- ❌ Senha de app incorreta
- ❌ 2FA não ativado
- ✅ Regenerar senha de app

### **Erro: "Connection timeout"**
- ❌ Firewall bloqueando porta 587
- ✅ Testar em rede diferente

### **Erro: "Daily limit exceeded"**
- ❌ Mais de 500 emails no dia
- ✅ Esperar até meia-noite (reset diário)

## 🎯 **Próximo Passo: AWS SES**

Depois que Gmail estiver funcionando, configure AWS SES para:
- ✅ **62.000 emails/mês grátis**
- ✅ $0.10 por 1.000 emails depois
- ✅ Volume empresarial

---

**Status:** 🔄 Aguardando configuração das credenciais Gmail
**Teste:** `node test-email-smtp.js`