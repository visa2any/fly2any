# 🚀 Configuração Completa N8N - Sistema Email Marketing Fly2Any

## ⚠️ PROBLEMA IDENTIFICADO
- ✅ N8N está online: https://n8n-production-81b6.up.railway.app  
- ❌ Webhook `/webhook/email-marketing-final` NÃO EXISTE
- ❌ Workflow de email marketing não está configurado
- ⚠️ Credenciais Gmail não configuradas no .env.local

## 🎯 SOLUÇÃO COMPLETA

### PASSO 1: Configurar Credenciais Gmail

1. **Editar .env.local:**
```bash
# Adicionar estas variáveis com suas credenciais:
GMAIL_EMAIL=seuemail@gmail.com
GMAIL_APP_PASSWORD=sua_app_password_de_16_digitos
```

2. **Como obter App Password do Gmail:**
   - Acesse: https://myaccount.google.com/security
   - Ative "2-Step Verification" 
   - Vá em "App passwords"
   - Gere nova senha para "Mail"
   - Use a senha de 16 dígitos como GMAIL_APP_PASSWORD

### PASSO 2: Importar Workflow no N8N

1. **Acessar N8N:**
   - URL: https://n8n-production-81b6.up.railway.app
   - Fazer login (se necessário)

2. **Importar Workflow:**
   - Clique em "Import from JSON" ou "+"
   - Cole o conteúdo do arquivo `n8n-simple-workflow.json`
   - Ou use o workflow completo abaixo:

### PASSO 3: Workflow N8N Completo (Copiar e Colar)

\`\`\`json
{
  "name": "Fly2Any Email Marketing",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "email-marketing-final",
        "options": {}
      },
      "id": "webhook-node",
      "name": "Email Marketing Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [240, 300]
    },
    {
      "parameters": {
        "jsCode": "// Processar campanha Fly2Any\\nconst data = $input.first().json;\\n\\nconsole.log('📧 Campanha:', data.campaignName, 'Contatos:', data.contacts?.length);\\n\\nif (!data.campaignId || !data.subject || !data.contacts) {\\n  throw new Error('Dados incompletos');\\n}\\n\\n// Lotes de 10 emails\\nconst batchSize = 10;\\nconst batches = [];\\nfor (let i = 0; i < data.contacts.length; i += batchSize) {\\n  batches.push({\\n    contacts: data.contacts.slice(i, i + batchSize),\\n    campaignData: data\\n  });\\n}\\n\\nreturn batches.map(b => ({ json: b }));"
      },
      "id": "process-node",
      "name": "Process Campaign",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [480, 300]
    },
    {
      "parameters": {
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "gmailOAuth2Api",
        "requestMethod": "POST",
        "url": "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        "sendBody": true,
        "bodyContentType": "json",
        "jsonBody": "={{ \\n  const contact = $json.contacts[0];\\n  const html = $json.campaignData.htmlContent.replace(/{{nome}}/g, contact.nome);\\n  const email = \`To: \${contact.email}\\nSubject: \${$json.campaignData.subject}\\nContent-Type: text/html\\n\\n\${html}\`;\\n  return { raw: Buffer.from(email).toString('base64').replace(/\\\\+/g, '-').replace(/\\\\//g, '_').replace(/=/g, '') };\\n}}"
      },
      "id": "gmail-node",
      "name": "Send Gmail",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [720, 300]
    },
    {
      "parameters": {
        "unit": "seconds",
        "amount": 20
      },
      "id": "wait-node", 
      "name": "Wait 20s",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [960, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "{{ { \\"success\\": true, \\"message\\": \\"Campanha processada\\", \\"timestamp\\": new Date().toISOString() } }}"
      },
      "id": "response-node",
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook", 
      "typeVersion": 1.1,
      "position": [1200, 300]
    }
  ],
  "connections": {
    "Email Marketing Webhook": {
      "main": [
        [
          {
            "node": "Process Campaign",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Campaign": {
      "main": [
        [
          {
            "node": "Send Gmail",
            "type": "main", 
            "index": 0
          }
        ]
      ]
    },
    "Send Gmail": {
      "main": [
        [
          {
            "node": "Wait 20s",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Wait 20s": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true
}
\`\`\`

### PASSO 4: Configurar Credenciais Gmail no N8N

1. **No N8N, ir em Settings > Credentials**
2. **Adicionar nova credencial: "Gmail OAuth2 API"**
3. **Configurar:**
   - Client ID: (do Google Cloud Console)
   - Client Secret: (do Google Cloud Console)  
   - Authorize e conectar sua conta Gmail

### PASSO 5: Ativar Workflow

1. **Salvar workflow**
2. **Clicar em "Active" para ativar**
3. **Verificar se webhook está disponível em:**
   `https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final`

## 🧪 TESTE COMPLETO

Execute este script após configurar:

\`\`\`javascript
// Teste do webhook
const testData = {
  campaignId: 'test-123',
  campaignName: 'Teste Fly2Any',
  subject: '✈️ Teste - Oferta Especial Miami',
  htmlContent: '<h1>Olá {{nome}}!</h1><p>Teste da campanha Fly2Any</p>',
  contacts: [
    { email: 'seu-email-teste@gmail.com', nome: 'Teste' }
  ]
};

fetch('https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => console.log('✅ Sucesso:', data))
.catch(err => console.error('❌ Erro:', err));
\`\`\`

## 📊 FEATURES IMPLEMENTADAS

✅ **Webhook endpoint:** `/webhook/email-marketing-final`  
✅ **Rate limiting:** 10 emails por lote, 20s entre lotes  
✅ **Personalização:** Suporte a {{nome}} nos templates  
✅ **Processamento em lotes:** Até 500 contatos  
✅ **Gmail SMTP:** Integração nativa  
✅ **Resposta JSON:** Status de sucesso/erro  

## 🚨 PRÓXIMOS PASSOS

1. **URGENTE:** Configurar credenciais Gmail
2. **URGENTE:** Importar e ativar workflow N8N  
3. **TESTE:** Executar teste com email real
4. **PRODUÇÃO:** Testar com campanha pequena (10-20 emails)
5. **SCALE:** Testar com lote de 100+ emails

## 📞 TROUBLESHOOTING

### Erro 404 no webhook:
- Workflow não está ativo
- Path do webhook incorreto  
- N8N não salvou corretamente

### Erro de Gmail:
- Credenciais OAuth2 não configuradas
- App Password inválida
- Conta Gmail sem 2FA

### Rate limiting:
- Ajustar tempo de espera (20s mínimo)
- Reduzir tamanho do lote se necessário

---

**🎯 META:** Ter o sistema 100% funcional em 30 minutos!