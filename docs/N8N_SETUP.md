# 🚀 N8N Setup - Email Marketing Fly2Any

## 📦 Instalação

### 1. Instalar N8N
```bash
# Opção 1: NPX (recomendado para teste)
npx n8n

# Opção 2: Instalação global
npm install -g n8n
n8n

# Opção 3: Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### 2. Acessar Interface
- URL: http://localhost:5678
- Criar conta de administrador

## ⚙️ Configuração do Workflow

### 1. Importar Workflow
1. Na interface N8N, ir em **Templates** → **Import**
2. Copiar conteúdo de `n8n-workflows/email-marketing-workflow.json`
3. Colar no campo de importação
4. Salvar workflow

### 2. Configurar Credenciais Gmail

#### 2.1 Criar Projeto Google Cloud
1. Ir para [Google Cloud Console](https://console.cloud.google.com)
2. Criar novo projeto: "Fly2Any Email Marketing"
3. Ativar Gmail API:
   - APIs & Services → Library
   - Buscar "Gmail API"
   - Clicar em "Enable"

#### 2.2 Configurar OAuth2
1. APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Configure consent screen:
   - User Type: External
   - App name: "Fly2Any Email Marketing"
   - User support email: admin@fly2any.com
   - Developer email: admin@fly2any.com
4. Create OAuth Client:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5678/rest/oauth2-credential/callback`

#### 2.3 Configurar no N8N
1. No workflow, clicar no nó "Send Email via Gmail"
2. Credentials → Create New
3. Preencher:
   - **Client ID**: Do Google Cloud Console
   - **Client Secret**: Do Google Cloud Console
   - **Scope**: `https://www.googleapis.com/auth/gmail.send`
4. Conectar conta Gmail
5. Salvar credenciais

### 3. Ativar Webhook

#### 3.1 URL do Webhook
Após importar o workflow, copiar a URL do webhook:
```
http://localhost:5678/webhook/email-campaign
```

#### 3.2 Configurar no Fly2Any
Adicionar no arquivo `.env.local`:
```env
N8N_WEBHOOK_EMAIL_MARKETING=http://localhost:5678/webhook/email-campaign
```

## 🧪 Teste do Sistema

### 1. Testar Workflow Manualmente
1. No N8N, abrir workflow "Fly2Any Email Marketing"
2. Clicar em "Execute Workflow"
3. Enviar payload de teste:

```json
{
  "campaignId": "test_001",
  "campaignName": "Teste Campanha",
  "subject": "✈️ Teste Email Marketing",
  "htmlContent": "<h1>Olá {{nome}}!</h1><p>Este é um teste do sistema de email marketing.</p>",
  "textContent": "Olá {{nome}}! Este é um teste do sistema de email marketing.",
  "contacts": [
    {
      "email": "seu-email@gmail.com",
      "nome": "Seu Nome",
      "segmento": "teste"
    }
  ]
}
```

### 2. Testar via Fly2Any
1. Acessar `/admin/email-marketing`
2. Importar CSV de teste
3. Enviar campanha promocional
4. Verificar logs no N8N

## 📊 Monitoramento

### 1. Logs N8N
- Executions → Ver histórico de execuções
- Verificar erros e sucessos

### 2. Gmail Limits
- **Gratuito**: 500 emails/dia por conta
- **Google Workspace**: 2000 emails/dia
- **Rate Limit**: 250 quotas/usuário/100 segundos

### 3. Configurações de Produção

#### 3.1 Usar Multiple Gmail Accounts
```javascript
// No workflow, adicionar rotação de contas
const accounts = [
  'email1@gmail.com',
  'email2@gmail.com', 
  'email3@gmail.com'
];
const accountIndex = Math.floor(Math.random() * accounts.length);
```

#### 3.2 Deploy N8N (Produção)
```bash
# Docker Compose
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password
    volumes:
      - ~/.n8n:/home/node/.n8n
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Gmail API Quota Exceeded**
   - Aguardar reset (24h)
   - Usar múltiplas contas Gmail
   - Implementar queue system

2. **Webhook não responde**
   - Verificar se N8N está rodando
   - Confirmar URL no .env
   - Verificar firewall/proxy

3. **Emails não personalizados**
   - Verificar template placeholders: `{{nome}}`, `{{email}}`
   - Confirmar dados dos contatos

### Logs Úteis

```bash
# N8N logs (se instalado via NPM)
~/.n8n/logs/

# Docker logs
docker logs n8n-container

# Verificar webhook
curl -X POST http://localhost:5678/webhook/email-campaign \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🚀 Próximos Passos

1. **Produção**: Deploy N8N em servidor
2. **Escalabilidade**: Multiple Gmail accounts
3. **Analytics**: Tracking de opens/clicks
4. **Templates**: Editor visual de emails
5. **A/B Testing**: Múltiplas versões

---

💡 **Dica**: Para desenvolvimento, mantenha N8N rodando em background:
```bash
npx n8n &
```

🔗 **Links Úteis**:
- [N8N Documentation](https://docs.n8n.io)
- [Gmail API Reference](https://developers.google.com/gmail/api)
- [OAuth2 Setup Guide](https://developers.google.com/identity/protocols/oauth2)