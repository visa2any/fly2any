# 🤖 Guia Completo de Automação N8N - Fly2Any

## 📋 **ÍNDICE**
1. [Configuração Inicial do N8N](#configuração-inicial)
2. [Workflows Principais](#workflows-principais)
3. [Integrações Recomendadas](#integrações)
4. [Templates de Email](#templates)
5. [Monitoramento e Analytics](#monitoramento)

---

## 🔧 **CONFIGURAÇÃO INICIAL**

### **1. Instalação do N8N**
```bash
# Via Docker (Recomendado)
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Via NPM
npm install n8n -g
n8n start
```

### **2. Configuração de Webhooks**
- Acesse: `http://localhost:5678`
- Criar conta/login
- Configurar webhooks para receber dados do site

---

## 🚀 **WORKFLOWS PRINCIPAIS**

### **WORKFLOW 1: Processamento de Leads**

#### **Trigger:** Webhook Lead
```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com", 
  "telefone": "+1-555-123-4567",
  "serviceType": "voos",
  "origem": "MIA",
  "destino": "GRU",
  "dataIda": "2024-02-15",
  "dataVolta": "2024-02-28",
  "adultos": 2,
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "website",
  "utm_campaign": "google_ads"
}
```

#### **Fluxo do Workflow:**
1. **Webhook** → Recebe dados do formulário
2. **Validação** → Verifica dados obrigatórios
3. **Enriquecimento** → Adiciona dados extras (IP, geolocalização)
4. **CRM** → Salva no HubSpot/Pipedrive
5. **Email** → Envia confirmação para cliente
6. **Notificação** → Alerta equipe no Slack/Discord
7. **WhatsApp** → Mensagem automática (opcional)

### **WORKFLOW 2: Email Marketing Sequencial**

#### **Sequência de Emails (7 dias):**
- **Imediato:** Confirmação de recebimento
- **15 min:** Primeiras opções de voo
- **1 hora:** Oferta especial com desconto
- **1 dia:** Depoimentos de clientes
- **3 dias:** Urgência - promoção limitada
- **5 dias:** FAQ e esclarecimentos
- **7 dias:** Última chance + contato direto

### **WORKFLOW 3: Integração WhatsApp Business**

#### **Mensagens Automáticas:**
```
🛫 Olá {nome}! Recebemos sua solicitação de {serviceType}.

✅ Dados confirmados:
📍 {origem} → {destino}
📅 {dataIda} - {dataVolta}
👥 {adultos} adulto(s)

⏰ Nossa equipe está preparando sua cotação personalizada. Em até 2 horas você receberá as melhores opções!

❓ Dúvidas? Responda esta mensagem.
```

---

## 🔗 **INTEGRAÇÕES RECOMENDADAS**

### **CRM/Sales**
- **HubSpot** (Recomendado)
- **Pipedrive**
- **Salesforce**
- **Notion Database**

### **Email Marketing**
- **Mailchimp**
- **SendGrid**
- **ConvertKit**
- **ActiveCampaign**

### **Comunicação**
- **WhatsApp Business API**
- **Slack** (notificações internas)
- **Discord** (equipe)
- **Telegram**

### **Analytics**
- **Google Sheets** (relatórios)
- **Google Analytics** (eventos)
- **Facebook Conversions API**
- **Mixpanel**

---

## 📧 **TEMPLATES DE EMAIL**

### **Template 1: Confirmação**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cotação Recebida - Fly2Any</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #a21caf); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✈️ Fly2Any</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0;">Sua cotação está sendo preparada!</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Olá {{nome}}! 👋</h2>
            
            <p>Recebemos sua solicitação de <strong>{{serviceType}}</strong> e nossa equipe já está trabalhando na sua cotação personalizada.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">📋 Resumo da Solicitação:</h3>
                <p><strong>Serviço:</strong> {{serviceType}}</p>
                <p><strong>Rota:</strong> {{origem}} → {{destino}}</p>
                <p><strong>Data ida:</strong> {{dataIda}}</p>
                <p><strong>Passageiros:</strong> {{adultos}} adulto(s)</p>
            </div>
            
            <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>⏰ Prazo:</strong> Você receberá sua cotação em até <strong>2 horas</strong>!</p>
            </div>
            
            <p>Enquanto isso, você pode:</p>
            <ul>
                <li>📱 Nos seguir no <a href="https://instagram.com/fly2any">Instagram</a></li>
                <li>💬 Entrar no nosso <a href="https://wa.me/15551234567">WhatsApp</a></li>
                <li>❓ Ler nosso <a href="https://fly2any.com/faq">FAQ</a></li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://wa.me/15551234567" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">💬 Falar no WhatsApp</a>
            </div>
            
            <p>Atenciosamente,<br>
            <strong>Equipe Fly2Any</strong><br>
            <em>Conectando você ao Brasil desde 2014</em></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© 2024 Fly2Any. Todos os direitos reservados.</p>
            <p>Você está recebendo este email porque solicitou uma cotação em nosso site.</p>
        </div>
    </div>
</body>
</html>
```

### **Template 2: Cotação Pronta**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sua Cotação Está Pronta! - Fly2Any</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Cotação Pronta!</h1>
            <p style="color: #dcfce7; margin: 10px 0 0 0;">Encontramos ótimas opções para você</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Olá {{nome}}! ✈️</h2>
            
            <p>Boa notícia! Encontramos excelentes opções para sua viagem <strong>{{origem}} → {{destino}}</strong>.</p>
            
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #92400e;">💰 Melhor Oferta</h3>
                <p style="font-size: 28px; font-weight: bold; color: #92400e; margin: 0;">A partir de R$ {{melhorPreco}}</p>
                <p style="margin: 5px 0 0 0; color: #a16207;">*Taxas inclusas • Parcelamento disponível</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">📋 Opções Encontradas:</h3>
                
                <!-- Opção 1 -->
                <div style="border: 1px solid #d1d5db; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="margin: 0; font-weight: bold;">{{companhia1}} - {{tipo1}}</p>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">{{horario1}} • {{duracao1}}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; font-size: 20px; font-weight: bold; color: #059669;">R$ {{preco1}}</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">{{parcelas1}}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Mais opções... -->
            </div>
            
            <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #166534;">🎁 Oferta Especial!</h4>
                <p style="margin: 0; color: #166534;">Reserve hoje e ganhe <strong>5% de desconto extra</strong> + parcelamento em até 12x sem juros!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://wa.me/15551234567?text=Olá! Vi minha cotação e gostaria de reservar." style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-right: 10px;">✅ Reservar Agora</a>
                
                <a href="tel:+15551234567" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">📞 Ligar</a>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #dc2626;">⏰ Atenção!</h4>
                <p style="margin: 0; color: #dc2626; font-size: 14px;">Estes preços são válidos por <strong>24 horas</strong> e sujeitos à disponibilidade. Reserve o quanto antes!</p>
            </div>
            
            <p>Atenciosamente,<br>
            <strong>{{consultor}} - Equipe Fly2Any</strong><br>
            <em>WhatsApp: {{consultorWhatsApp}}</em></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© 2024 Fly2Any. Todos os direitos reservados.</p>
            <p><a href="{{unsubscribe_link}}">Cancelar emails</a></p>
        </div>
    </div>
</body>
</html>
```

---

## 📊 **MONITORAMENTO E ANALYTICS**

### **Métricas Principais para Acompanhar:**

1. **Conversão de Leads:**
   - Taxa de preenchimento do formulário
   - Qualidade dos leads (informações completas)
   - Fonte dos leads (orgânico, pago, social, etc.)

2. **Engajamento Email:**
   - Taxa de abertura (meta: >25%)
   - Taxa de clique (meta: >5%)
   - Taxa de conversão email→venda (meta: >10%)

3. **WhatsApp:**
   - Taxa de resposta
   - Tempo médio de resposta
   - Conversão WhatsApp→venda

4. **Performance Geral:**
   - Custo por lead (CPL)
   - Lifetime Value (LTV)
   - ROI de marketing

### **Dashboard N8N Recomendado:**
```
┌─ Leads Hoje: 47 ────────────────────────┐
│ ↗ +23% vs ontem                        │
├─ Email Aberto: 68% ────────────────────┤
│ ↗ +5% vs média                         │
├─ WhatsApp Ativo: 89% ──────────────────┤
│ ↗ +12% vs semana passada               │
├─ Conversões: 12 ───────────────────────┤
│ ↗ Taxa 25.5% (Meta: 20%)              │
└─────────────────────────────────────────┘
```

---

## 🔥 **WORKFLOWS AVANÇADOS**

### **WORKFLOW 4: Remarketing Inteligente**
- Identifica leads "frios" (sem resposta em 3 dias)
- Envia offer especial com urgência
- Integra com Facebook/Google Ads para remarketing
- Segmenta por comportamento no site

### **WORKFLOW 5: Upsell Automático**
- Cliente confirma voo → oferece hotel
- Cliente confirma hotel → oferece carro
- Cliente confirma pacote → oferece seguro viagem
- Baseado em dados de booking anterior

### **WORKFLOW 6: Feedback e Avaliações**
- Pós-viagem: solicita avaliação automaticamente
- NPS tracking
- Incentiva reviews no Google/TripAdvisor
- Programa de indicação para clientes satisfeitos

---

## 🚀 **IMPLEMENTAÇÃO RÁPIDA**

### **Passo 1:** Configurar N8N
```bash
# Clone templates prontos
git clone https://github.com/fly2any/n8n-workflows
cd n8n-workflows
npm install
```

### **Passo 2:** Importar Workflows
1. Abrir N8N interface
2. Import → workflows/lead-processing.json
3. Import → workflows/email-sequence.json
4. Import → workflows/whatsapp-automation.json

### **Passo 3:** Configurar Integrações
1. HubSpot API key
2. SendGrid/Mailchimp credentials
3. WhatsApp Business API
4. Google Sheets para relatórios

### **Passo 4:** Testar & Deploy
1. Teste com dados fake
2. Valide todos os triggers
3. Ative workflows em produção
4. Monitore primeiras 24h

---

## 📞 **SUPORTE**

Precisa de ajuda com a implementação?
- **Email:** tech@fly2any.com
- **WhatsApp:** +1-555-TECH-SUPPORT
- **Documentação:** https://docs.fly2any.com/n8n

---

**🎯 Meta:** 300% aumento em conversões nos primeiros 90 dias!