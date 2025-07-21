# 📧 Guia Completo: Email Marketing para os Primeiros 500 Clientes

## 🎯 Funcionalidades Implementadas

### ✅ Controle Automático dos 500 Clientes
- **Seleção inteligente**: Automaticamente seleciona os primeiros 500 contatos que ainda não receberam email
- **Status tracking**: Cada contato tem status: `not_sent`, `sent`, `failed`, `bounced`
- **Respeitando limites Gmail**: Lotes de 50 emails com intervalo de 30s entre lotes

### ✅ Sistema de Lotes (Batching)
- **50 emails por lote** (limite seguro do Gmail)
- **30 segundos entre lotes** (respeitando rate limits)
- **1 segundo entre emails** (evita spam filters)
- **Processamento assíncrono** (não trava a interface)

### ✅ Controle Completo de Status
- **Não enviado**: `not_sent` (padrão para novos contatos)
- **Enviado**: `sent` (marcado automaticamente após sucesso)
- **Falha**: `failed` (erro no envio)
- **Data do último envio**: Timestamp registrado

## 🚀 Como Usar

### 1. Importar Lista de Clientes

```bash
# POST /api/email-marketing
curl -X POST https://fly2any.com/api/email-marketing \
  -H "Content-Type: application/json" \
  -d '{
    "action": "import_contacts",
    "contactsData": [
      {
        "email": "cliente1@email.com",
        "nome": "João",
        "sobrenome": "Silva",
        "telefone": "+5511999999999",
        "segmento": "brasileiros-eua"
      },
      {
        "email": "cliente2@email.com", 
        "nome": "Maria",
        "sobrenome": "Santos",
        "segmento": "familias"
      }
    ]
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "imported": 2,
    "totalContacts": 2,
    "message": "2 contatos importados com sucesso!"
  }
}
```

### 2. Criar Campanha

```bash
# POST /api/email-marketing
curl -X POST https://fly2any.com/api/email-marketing \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_campaign",
    "name": "Promoção Miami 2024",
    "templateType": "promotional"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "campaign_1703123456789",
    "name": "Promoção Miami 2024",
    "subject": "⚡ ÚLTIMAS 24H: Pacote COMPLETO Miami por $1.299",
    "templateType": "promotional",
    "status": "draft"
  }
}
```

### 3. Simular Envio (Dry Run)

```bash
# POST /api/email-marketing
curl -X POST https://fly2any.com/api/email-marketing \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_to_first_500",
    "campaignId": "campaign_1703123456789",
    "dryRun": true
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "message": "Simulação - nenhum email foi enviado",
    "selectedContacts": 2,
    "totalAvailable": 2,
    "contacts": [
      {
        "id": "contact_1703123456789_0",
        "email": "cliente1@email.com",
        "nome": "João",
        "emailStatus": "not_sent"
      }
    ]
  }
}
```

### 4. Enviar para os Primeiros 500

```bash
# POST /api/email-marketing
curl -X POST https://fly2any.com/api/email-marketing \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_to_first_500",
    "campaignId": "campaign_1703123456789",
    "dryRun": false
  }'
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "message": "Iniciando envio para 2 contatos",
    "batches": 1,
    "batchSize": 50,
    "selectedContacts": 2,
    "estimatedTime": "1 minutos"
  }
}
```

### 5. Verificar Status dos Contatos

```bash
# GET /api/email-marketing?action=contacts&sent=false&limit=500
curl "https://fly2any.com/api/email-marketing?action=contacts&sent=false&limit=500"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_1703123456789_0",
        "email": "cliente1@email.com",
        "nome": "João",
        "emailStatus": "not_sent",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "total": 1,
    "stats": {
      "sent": 1,
      "notSent": 1,
      "failed": 0,
      "unsubscribed": 0
    }
  }
}
```

### 6. Ver Estatísticas Gerais

```bash
# GET /api/email-marketing?action=stats
curl "https://fly2any.com/api/email-marketing?action=stats"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalContacts": 2,
    "emailStats": {
      "sent": 1,
      "notSent": 1,
      "failed": 0,
      "unsubscribed": 0
    },
    "campaignsSent": 1,
    "activeBatches": 0
  }
}
```

## 🎨 Templates Disponíveis

### 1. **Promotional** 
- **Subject**: "⚡ ÚLTIMAS 24H: Pacote COMPLETO Miami por $1.299 - Passagem+Hotel+Carro"
- **Uso**: Ofertas com urgência, promoções especiais
- **Conversão**: Alta (call-to-action forte)

### 2. **Newsletter**
- **Subject**: "🧳 21 ANOS de segredos: Como montar sua viagem COMPLETA economizando $1.500+"
- **Uso**: Conteúdo de valor, dicas, relacionamento
- **Conversão**: Média (educacional)

### 3. **Reactivation**
- **Subject**: "💔 Sentimos sua falta... PACOTE COMPLETO com 30% OFF só para você!"
- **Uso**: Reconquistar clientes inativos
- **Conversão**: Alta (oferta exclusiva)

## ⚙️ Configuração Técnica

### Limites Respeitados
- **Gmail SMTP**: 500 emails/dia (conta gratuita)
- **Rate Limit**: 50 emails/lote, 30s entre lotes
- **Anti-spam**: 1s entre emails individuais

### Variáveis de Ambiente Necessárias
```bash
GMAIL_EMAIL=fly2any.travel@gmail.com
GMAIL_APP_PASSWORD=sua_app_password_aqui
```

### Personalização nos Templates
- `{{nome}}` → Nome do cliente
- `{{email}}` → Email do cliente
- `{{segmento}}` → Segmento do cliente

## 📊 Controle de Qualidade

### Estados dos Contatos
1. **`not_sent`**: Ainda não recebeu email
2. **`sent`**: Email enviado com sucesso  
3. **`failed`**: Falha no envio
4. **`bounced`**: Email retornou (inválido)
5. **`unsubscribed`**: Cancelou inscrição

### Filtros Disponíveis
- **Por status**: `?sent=true|false`
- **Por limite**: `?limit=500`
- **Por segmento**: Implementar filtro por `segmento`

## 🚨 Importante

### Limites do Gmail
- **500 emails/dia** para conta gratuita
- **2000 emails/dia** para Google Workspace
- **Rate limits** rigorosamente respeitados

### Boas Práticas
1. **Sempre fazer dry run primeiro**
2. **Verificar credenciais Gmail**
3. **Monitorar logs de envio**
4. **Respeitar unsubscribe**
5. **Segmentar audiência**

## 🔧 Scripts de Exemplo

### Importar CSV
```javascript
// Exemplo de como importar CSV
const fs = require('fs');
const csv = require('csv-parser');

const contacts = [];
fs.createReadStream('clientes.csv')
  .pipe(csv())
  .on('data', (row) => {
    contacts.push({
      email: row.email,
      nome: row.nome,
      telefone: row.telefone,
      segmento: 'brasileiros-eua'
    });
  })
  .on('end', async () => {
    // Importar via API
    const response = await fetch('/api/email-marketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'import_contacts',
        contactsData: contacts
      })
    });
    
    console.log('Importação concluída:', await response.json());
  });
```

### Envio Automático
```javascript
// Script completo para envio automático
async function enviarCampanha() {
  // 1. Criar campanha
  const campaign = await fetch('/api/email-marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create_campaign',
      name: 'Promoção Black Friday',
      templateType: 'promotional'
    })
  }).then(r => r.json());
  
  // 2. Dry run
  const dryRun = await fetch('/api/email-marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'send_to_first_500',
      campaignId: campaign.data.id,
      dryRun: true
    })
  }).then(r => r.json());
  
  console.log('Simulação:', dryRun);
  
  // 3. Confirmar e enviar
  if (confirm(`Enviar para ${dryRun.data.selectedContacts} contatos?`)) {
    const envio = await fetch('/api/email-marketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_to_first_500',
        campaignId: campaign.data.id,
        dryRun: false
      })
    }).then(r => r.json());
    
    console.log('Envio iniciado:', envio);
  }
}
```

## ✅ Próximos Passos

1. **Importe sua lista de clientes** usando `import_contacts`
2. **Teste com dry run** usando `send_to_first_500` com `dryRun: true`
3. **Execute o envio real** para os primeiros 500
4. **Monitore o progresso** via `stats` e `contacts`
5. **Ajuste templates** conforme performance

---

**🎯 Resultado esperado**: Sistema completo para envio controlado de email marketing respeitando limites do Gmail, com tracking completo de status e processamento em lotes otimizado para máxima entregabilidade.