# 🚀 Guia Prático: Configuração de Contas de Anúncios

## ⚡ **SETUP RÁPIDO (Execute Este Script)**

```bash
# 1. Execute o configurador automático
node setup-ads.js

# 2. Siga as instruções e insira os IDs
# 3. Arquivo .env.local será criado automaticamente
# 4. Deploy e teste!
```

---

## 📋 **PASSO A PASSO DETALHADO**

### **🔵 GOOGLE ADS (Prioridade 1)**

#### **Criar Conta (5 min)**
1. **Acesse**: https://ads.google.com
2. **Clique**: "Começar agora" 
3. **Escolha**: "Sou um profissional de marketing experiente"
4. **Pule**: A criação de campanha (vamos configurar depois)

#### **Configurar Conversões (10 min)**
1. **Navegue**: Tools & Settings > Conversions
2. **Clique**: + (New conversion)

**CONVERSÃO 1 - FORMULÁRIO:**
```
Nome: Cotação de Voos - Formulário
Categoria: Submit lead form  
Valor: $30
Contagem: One (recommended)
Janela conversão: 30 days
Janela view-through: 1 day
Enhanced conversions: ✅ Enable
```

**CONVERSÃO 2 - TELEFONE:**
```
Nome: Clique no Telefone
Categoria: Phone calls from ads
Valor: $35
Contagem: One (recommended)
```

**CONVERSÃO 3 - WHATSAPP:**
```
Nome: Clique WhatsApp  
Categoria: Contact
Valor: $30
Contagem: One (recommended)
```

#### **Obter IDs (2 min)**
```bash
# Copie estes valores:
Google Ads ID: AW-XXXXXXXXXX (no header da conta)
Conversion ID: XXXXXXXXXX (de cada conversão)
Form Label: XXXXXXXXX/AbCdE
Phone Label: XXXXXXXXX/FgHiJ  
WhatsApp Label: XXXXXXXXX/KlMnO
```

---

### **🔵 META BUSINESS MANAGER (Prioridade 2)**

#### **Criar Business Manager (5 min)**
1. **Acesse**: https://business.facebook.com
2. **Criar conta business**: 
   - Nome: "Fly2Any Travel Agency"
   - País: Estados Unidos
   - Categoria: Travel Agency

#### **Configurar Pixel (8 min)**
1. **Navegue**: Events Manager > Data Sources
2. **Clique**: + Connect Data Source > Web > Meta Pixel
3. **Nome**: "Fly2Any Pixel"
4. **Website**: https://fly2any.com

**EVENTOS CUSTOMIZADOS:**
```javascript
// Serão criados automaticamente pelo sistema
Lead - Valor: $30 (Formulário)
Contact - Valor: $35 (Telefone)  
Contact - Valor: $30 (WhatsApp)
PageView - Automático
```

#### **Obter Pixel ID (1 min)**
```bash
# Copie este valor:
Facebook Pixel ID: XXXXXXXXXXXXXXX
```

---

### **🟠 MICROSOFT ADVERTISING (Prioridade 3)**

#### **Criar Conta Bing (3 min)**
1. **Acesse**: https://ads.microsoft.com
2. **Import from Google Ads**: Use a ferramenta de importação
3. **Configure billing**: Adicionar cartão
4. **Timezone**: Eastern Time (para compatibilidade EUA/Brasil)

#### **Configurar UET Tag (5 min)**
1. **Navegue**: Tools > UET Tags
2. **Create UET Tag**: 
   - Nome: "Fly2Any UET"
   - Website: https://fly2any.com

#### **Criar Conversion Goals (5 min)**
**GOAL 1 - FORMULÁRIO:**
```
Nome: Formulário Enviado
Tipo: Event
Revenue Value: $30
```

**GOAL 2 - TELEFONE:**
```
Nome: Telefone Clicado  
Tipo: Event
Revenue Value: $35
```

**GOAL 3 - WHATSAPP:**
```
Nome: WhatsApp Clicado
Tipo: Event  
Revenue Value: $30
```

#### **Obter IDs (1 min)**
```bash
# Copie estes valores:
Bing UET ID: XXXXXXXX
Form Goal ID: XXXXXXXX
Phone Goal ID: XXXXXXXX  
WhatsApp Goal ID: XXXXXXXX
```

---

## ⚙️ **CONFIGURAÇÃO AUTOMÁTICA**

### **Execute o Script Configurador**
```bash
# Na pasta do projeto:
node setup-ads.js

# Siga as instruções e insira os IDs copiados acima
# O arquivo .env.local será criado automaticamente
```

### **Exemplo de .env.local Gerado**
```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google Ads  
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-123456789
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=123456789
NEXT_PUBLIC_GOOGLE_FORM_CONVERSION_LABEL=AbCdEfGhIj/1234567890
NEXT_PUBLIC_GOOGLE_PHONE_CONVERSION_LABEL=KlMnOpQrSt/0987654321
NEXT_PUBLIC_GOOGLE_WHATSAPP_CONVERSION_LABEL=UvWxYzAbCd/1122334455

# Meta/Facebook
NEXT_PUBLIC_FB_PIXEL_ID=123456789012345

# Microsoft Bing
NEXT_PUBLIC_BING_UET_ID=12345678
NEXT_PUBLIC_BING_FORM_GOAL_ID=12345678
NEXT_PUBLIC_BING_PHONE_GOAL_ID=87654321
NEXT_PUBLIC_BING_WHATSAPP_GOAL_ID=11223344
```

---

## 🧪 **TESTE E VERIFICAÇÃO**

### **Testar Tracking (5 min)**
```bash
# 1. Build e start local
npm run build
npm run start

# 2. Abra: http://localhost:3000
# 3. Preencha formulário de cotação
# 4. Verifique dashboard: /admin/campanhas
# 5. Execute script de verificação no console
```

### **Script de Verificação no Browser**
```javascript
// Cole no console do Chrome/Firefox:
console.log('🔍 VERIFICANDO TRACKING...');

// Check Google Analytics
if (typeof gtag !== 'undefined') {
  console.log('✅ Google Analytics OK');
  gtag('event', 'test_conversion', { test: true });
} else console.log('❌ Google Analytics ERRO');

// Check Meta Pixel  
if (typeof fbq !== 'undefined') {
  console.log('✅ Meta Pixel OK');
  fbq('track', 'Lead', { value: 30, currency: 'USD' });
} else console.log('❌ Meta Pixel ERRO');

// Check Bing UET
if (typeof uetq !== 'undefined') {
  console.log('✅ Bing UET OK');
  uetq.push('event', 'test', {});
} else console.log('❌ Bing UET ERRO');

console.log('🎯 Verificação concluída!');
```

---

## 🚀 **PRIMEIRAS CAMPANHAS**

### **Google Ads - Campanha Inicial**
```javascript
Nome: "Fly2Any - Search - Voos Brasil EUA"
Tipo: Search
Budget: $5/dia
Keywords: 
- [voos miami sao paulo]
- [passagens brasil eua baratas]
- [agencia viagem brasileiros]
Locations: Miami, Orlando, New York
Match Type: Exact + Phrase
```

### **Meta Ads - Campanha Inicial**  
```javascript
Nome: "Fly2Any - Traffic - Brasileiros EUA"
Objetivo: Traffic
Budget: $1.65/dia
Audience:
- Location: United States
- Demographics: Brasileiros 25-55 anos
- Interests: Brazil, Travel, Family
- Behavior: Frequent Travelers
```

### **Bing Ads - Campanha Inicial**
```javascript  
Nome: "Fly2Any - Search - Long Tail"
Tipo: Search
Budget: $1.65/dia
Keywords:
- "agencia viagem brasileiros miami"
- "passagens aereas brasileiros estados unidos"
- "como comprar passagem brasil eua"
Match Type: Modified Broad
```

---

## 📊 **MONITORAMENTO**

### **Dashboards Essenciais**
- **Fly2Any**: https://fly2any.com/admin/campanhas
- **Google Ads**: https://ads.google.com
- **Meta Ads**: https://business.facebook.com/adsmanager
- **Bing Ads**: https://ads.microsoft.com

### **KPIs para Monitorar**
```
🎯 METAS SEMANAIS:
- Conversões: 8-12 leads
- CPA: $8-15
- Taxa Conversão: 2-4%
- ROAS: 3:1 mínimo

⚠️ ALERTAS AUTOMÁTICOS:
- CPA > $20: Pausar palavras caras
- Taxa < 1%: Revisar anúncios  
- 0 conversões em 6h: Verificar tracking
```

---

## 🆘 **TROUBLESHOOTING**

### **Problemas Comuns**
```bash
❌ "Conversões não aparecem"
✅ Solução: Verificar IDs no .env.local

❌ "Dashboard vazio"  
✅ Solução: Testar formulário + aguardar 24h

❌ "CPA muito alto"
✅ Solução: Pausar keywords genéricas

❌ "Pouco tráfego"
✅ Solução: Aumentar budget ou adicionar keywords
```

### **Contatos de Suporte**
- **Google Ads**: 0800-000-0000
- **Meta Business**: https://business.facebook.com/help
- **Bing Ads**: https://help.ads.microsoft.com

---

## ✅ **CHECKLIST FINAL**

```bash
□ Google Ads configurado (IDs copiados)
□ Meta Pixel configurado (ID copiado)  
□ Bing UET configurado (IDs copiados)
□ Script setup-ads.js executado
□ Arquivo .env.local criado
□ Teste de tracking realizado
□ Dashboard funcionando (/admin/campanhas)
□ Primeira campanha criada
□ Monitoramento configurado
□ Budget definido ($400/mês)
```

**✅ Sistema 100% pronto para campanhas pagas!** 🚀

---

*Execute o script `setup-ads.js` e em 30 minutos estará tudo configurado automaticamente!*