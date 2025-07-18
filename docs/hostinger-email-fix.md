# 🔧 Guia: Resolver Problema de Email Hostinger

## 📧 Problema: Não está recebendo emails no info@fly2any.com

### ⚡ **Verificação Rápida**

#### 1. **Verificar MX Records Atuais**
Acesse um destes sites para verificar os MX records do fly2any.com:
- https://mxtoolbox.com/ (recomendado)
- https://dnschecker.org/mx-lookup.php
- https://www.nslookup.io/mx-lookup/

Digite: `fly2any.com` e clique em "MX Lookup"

#### 2. **MX Records Corretos do Hostinger**
Os MX records devem ser:
```
Priority 10: mx1.hostinger.com
Priority 20: mx2.hostinger.com
```

### 🛠️ **Soluções Passo-a-Passo**

#### **Opção 1: Painel Hostinger hPanel**

1. **Login no Hostinger**
   - Acesse: https://hpanel.hostinger.com/
   - Faça login com suas credenciais

2. **Ir para Emails**
   - Dashboard → Emails
   - Selecionar domínio: fly2any.com

3. **Verificar Conta de Email**
   - Procurar por: info@fly2any.com
   - Status deve estar "Ativo"
   - Se não existir, criar nova conta

4. **Configurar/Recriar Email**
   ```
   Email: info@fly2any.com
   Senha: [sua senha forte]
   Quota: 1GB (ou conforme necessário)
   ```

#### **Opção 2: DNS Zone Editor**

1. **Acessar DNS Zone**
   - hPanel → Domínios → fly2any.com
   - DNS Zone Editor

2. **Verificar MX Records**
   Devem existir:
   ```
   Type: MX
   Name: @
   Value: mx1.hostinger.com
   Priority: 10
   TTL: 3600

   Type: MX  
   Name: @
   Value: mx2.hostinger.com
   Priority: 20
   TTL: 3600
   ```

3. **Se MX Records estão errados:**
   - Deletar MX records existentes
   - Adicionar os corretos acima
   - Aguardar 24h para propagação

#### **Opção 3: Problemas Comuns**

**A. Email criado mas não recebe:**
1. Verificar caixa de spam
2. Testar com diferentes remetentes
3. Verificar quota de armazenamento

**B. MX Records conflitantes:**
1. Deletar MX records do Resend/outros
2. Manter apenas MX do Hostinger
3. Um domínio = um provedor de email

**C. DNS não propagou:**
1. Aguardar até 24-48h
2. Limpar cache DNS local:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac/Linux  
   sudo dscacheutil -flushcache
   ```

### 🧪 **Teste de Funcionamento**

#### **Teste 1: MX Records**
1. Ir para: https://mxtoolbox.com/
2. Digite: fly2any.com
3. Resultado esperado:
   ```
   mx1.hostinger.com (Priority: 10)
   mx2.hostinger.com (Priority: 20)
   ```

#### **Teste 2: Envio de Teste**
1. Usar Gmail/outro email
2. Enviar para: info@fly2any.com
3. Assunto: "Teste Recebimento"
4. Aguardar 5-15 minutos

#### **Teste 3: Webmail**
1. Acessar: https://webmail.hostinger.com/
2. Login: info@fly2any.com
3. Verificar se email chegou

### ⚠️ **Configurações que Podem Causar Problema**

#### **A. Conflito com Resend**
Se configurou domínio no Resend para recebimento:
1. Ir para: https://resend.com/domains
2. Remover configurações de recebimento
3. Manter apenas envio

#### **B. Cloudflare Proxy**
Se usa Cloudflare:
1. MX records devem estar "DNS only" (cinza)
2. Não usar proxy (laranja) em MX records

#### **C. Subdomain Issues**
1. Email deve estar no domínio principal: fly2any.com
2. Não em subdomínio: mail.fly2any.com

### 📞 **Se Nada Funcionar**

#### **Contato Hostinger**
1. **Chat Live**: hPanel → Support → Live Chat
2. **Ticket**: hPanel → Support → Submit Ticket
3. **Informações para dar:**
   - Domínio: fly2any.com
   - Email: info@fly2any.com
   - Problema: "Não recebendo emails"
   - MX records atuais (do teste acima)

#### **Alternativa Temporária**
Usar Gmail temporariamente:
1. Gmail → Configurações → Contas
2. Adicionar: info@fly2any.com
3. Configurar SMTP Hostinger:
   ```
   SMTP: smtp.hostinger.com
   Port: 587 (TLS) ou 465 (SSL)
   Username: info@fly2any.com
   Password: [sua senha]
   ```

### ✅ **Checklist Final**

- [ ] MX records corretos no DNS
- [ ] Conta info@fly2any.com existe e ativa
- [ ] Sem conflitos com outros provedores
- [ ] DNS propagado (24h)
- [ ] Teste de envio funcionando
- [ ] Webmail acessível

### 🔍 **Status de Verificação**

**Data da última verificação:** [DATA]

**MX Records atuais:**
```
[RESULTADO DO TESTE]
```

**Status da conta:** [ATIVO/INATIVO]

**Último email recebido:** [DATA/HORA]

---

💡 **Dica:** Mantenha este documento atualizado sempre que fizer alterações na configuração de email.