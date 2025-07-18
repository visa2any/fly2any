# 🔌 API Documentation - Sistema Omnichannel

## 📋 Índice
1. [Visão Geral](#-visão-geral)
2. [Autenticação](#-autenticação)
3. [Endpoints](#-endpoints)
4. [Modelos de Dados](#-modelos-de-dados)
5. [Códigos de Resposta](#-códigos-de-resposta)
6. [Exemplos de Uso](#-exemplos-de-uso)
7. [Rate Limiting](#-rate-limiting)
8. [Webhooks](#-webhooks)

---

## 🎯 Visão Geral

A API do Sistema Omnichannel Fly2Any fornece acesso programático a todas as funcionalidades do sistema de atendimento ao cliente. Baseada em REST, utiliza JSON para comunicação e segue padrões modernos de desenvolvimento.

**Base URL**: `https://fly2any.com/api`
**Versão**: v1.0.0
**Formato**: JSON
**Protocolo**: HTTPS

---

## 🔐 Autenticação

### Bearer Token
```http
Authorization: Bearer <your-token>
```

### Headers Obrigatórios
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
```

---

## 🛠️ Endpoints

### 1. Clientes

#### GET /api/customers
Lista todos os clientes

**Parâmetros de Query**:
- `page` (optional): Página (default: 1)
- `limit` (optional): Limite por página (default: 20)
- `search` (optional): Busca por nome/email
- `status` (optional): Filtro por status

**Resposta**:
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": 1,
        "name": "Maria Silva",
        "email": "maria@email.com",
        "phone": "+55 11 99999-1234",
        "status": "customer",
        "totalInteractions": 15,
        "totalBookings": 3,
        "totalSpent": 5450.00,
        "createdAt": "2023-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:15:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### GET /api/customers/{id}
Obtém detalhes de um cliente específico

**Parâmetros**:
- `id`: ID do cliente

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@email.com",
    "phone": "+55 11 99999-1234",
    "status": "customer",
    "totalInteractions": 15,
    "totalBookings": 3,
    "totalSpent": 5450.00,
    "firstContact": "2023-01-15T10:30:00.000Z",
    "lastContact": "2024-01-20T14:15:00.000Z",
    "conversationCount": 5,
    "averageResponseTime": 2.5,
    "customerSatisfaction": 4.8,
    "preferredChannels": ["whatsapp", "email"],
    "createdAt": "2023-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:15:00.000Z"
  }
}
```

#### GET /api/customers/{id}/360
Obtém visão 360° do cliente com histórico completo

**Parâmetros**:
- `id`: ID do cliente

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Maria Silva",
    "email": "maria@email.com",
    "phone": "+55 11 99999-1234",
    "status": "customer",
    "totalInteractions": 15,
    "totalBookings": 3,
    "totalSpent": 5450.00,
    "firstContact": "2023-01-15T10:30:00.000Z",
    "lastContact": "2024-01-20T14:15:00.000Z",
    "conversationCount": 5,
    "averageResponseTime": 2.5,
    "customerSatisfaction": 4.8,
    "preferredChannels": ["whatsapp", "email"],
    "timeline": [
      {
        "id": "msg_1",
        "type": "message",
        "title": "Primeira mensagem via WhatsApp",
        "description": "Cliente iniciou conversa perguntando sobre pacotes",
        "timestamp": "2024-01-20T10:30:00.000Z",
        "channel": "whatsapp",
        "agent": "Sistema",
        "metadata": {
          "direction": "inbound",
          "messageType": "text",
          "automated": false
        }
      },
      {
        "id": "book_1",
        "type": "booking",
        "title": "Reserva confirmada",
        "description": "Voo São Paulo → Rio de Janeiro, 2 passageiros",
        "timestamp": "2024-01-20T14:15:00.000Z",
        "value": 1200.00,
        "metadata": {
          "destination": "Rio de Janeiro",
          "passengers": 2,
          "bookingId": "FLY001"
        }
      }
    ]
  }
}
```

#### POST /api/customers
Cria um novo cliente

**Body**:
```json
{
  "name": "João Santos",
  "email": "joao@email.com",
  "phone": "+55 11 88888-5678",
  "status": "prospect"
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "João Santos",
    "email": "joao@email.com",
    "phone": "+55 11 88888-5678",
    "status": "prospect",
    "createdAt": "2024-01-20T15:30:00.000Z"
  }
}
```

#### PUT /api/customers/{id}
Atualiza dados de um cliente

**Parâmetros**:
- `id`: ID do cliente

**Body**:
```json
{
  "name": "João Santos Silva",
  "email": "joao.santos@email.com",
  "status": "customer"
}
```

### 2. Conversas

#### GET /api/conversations
Lista todas as conversas

**Parâmetros de Query**:
- `page` (optional): Página (default: 1)
- `limit` (optional): Limite por página (default: 20)
- `channel` (optional): Filtro por canal
- `status` (optional): Filtro por status
- `priority` (optional): Filtro por prioridade
- `agent` (optional): Filtro por agente

**Resposta**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "customer": {
          "id": 1,
          "name": "Maria Silva",
          "email": "maria@email.com",
          "phone": "+55 11 99999-1234"
        },
        "channel": "whatsapp",
        "status": "open",
        "priority": "high",
        "lastMessage": "Gostaria de saber sobre os voos para São Paulo...",
        "timestamp": "2024-01-20T10:30:00.000Z",
        "unreadCount": 3,
        "agent": "João",
        "createdAt": "2024-01-20T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:15:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

#### GET /api/conversations/{id}
Obtém detalhes de uma conversa específica

**Parâmetros**:
- `id`: ID da conversa

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer": {
      "id": 1,
      "name": "Maria Silva",
      "email": "maria@email.com",
      "phone": "+55 11 99999-1234"
    },
    "channel": "whatsapp",
    "status": "open",
    "priority": "high",
    "agent": "João",
    "messages": [
      {
        "id": 1,
        "content": "Gostaria de saber sobre os voos para São Paulo...",
        "direction": "inbound",
        "timestamp": "2024-01-20T10:30:00.000Z",
        "messageType": "text",
        "isAutomated": false
      },
      {
        "id": 2,
        "content": "Olá! Vou verificar as opções disponíveis para você.",
        "direction": "outbound",
        "timestamp": "2024-01-20T10:32:00.000Z",
        "messageType": "text",
        "isAutomated": false,
        "agent": "João"
      }
    ],
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:15:00.000Z"
  }
}
```

#### POST /api/conversations
Cria uma nova conversa

**Body**:
```json
{
  "customerId": 1,
  "channel": "whatsapp",
  "priority": "normal",
  "initialMessage": "Cliente iniciou conversa"
}
```

#### PUT /api/conversations/{id}/status
Atualiza status da conversa

**Parâmetros**:
- `id`: ID da conversa

**Body**:
```json
{
  "status": "resolved",
  "note": "Problema resolvido com sucesso"
}
```

### 3. Mensagens

#### GET /api/conversations/{id}/messages
Lista mensagens de uma conversa

**Parâmetros**:
- `id`: ID da conversa
- `page` (optional): Página
- `limit` (optional): Limite por página

**Resposta**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "conversationId": 1,
        "customerId": 1,
        "content": "Olá, preciso de ajuda com minha reserva",
        "direction": "inbound",
        "messageType": "text",
        "isAutomated": false,
        "timestamp": "2024-01-20T10:30:00.000Z",
        "agent": null
      },
      {
        "id": 2,
        "conversationId": 1,
        "customerId": 1,
        "content": "Claro! Vou ajudá-lo. Qual é o número da sua reserva?",
        "direction": "outbound",
        "messageType": "text",
        "isAutomated": false,
        "timestamp": "2024-01-20T10:32:00.000Z",
        "agent": "João"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15,
      "pages": 1
    }
  }
}
```

#### POST /api/conversations/{id}/messages
Envia uma nova mensagem

**Parâmetros**:
- `id`: ID da conversa

**Body**:
```json
{
  "content": "Obrigado pelo contato! Vou verificar isso para você.",
  "messageType": "text",
  "agentId": 1
}
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 15,
    "conversationId": 1,
    "content": "Obrigado pelo contato! Vou verificar isso para você.",
    "direction": "outbound",
    "messageType": "text",
    "isAutomated": false,
    "timestamp": "2024-01-20T15:45:00.000Z",
    "agent": "João"
  }
}
```

### 4. Templates

#### GET /api/templates
Lista todos os templates

**Parâmetros de Query**:
- `category` (optional): Filtro por categoria
- `channel` (optional): Filtro por canal

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "greet_morning",
      "category": "greetings",
      "name": "Bom dia",
      "content": "Bom dia! Como posso ajudá-lo hoje?",
      "variables": [],
      "channel": "all",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z"
    },
    {
      "id": "travel_booking",
      "category": "travel",
      "name": "Consulta voos",
      "content": "Vou verificar as opções de voos disponíveis para suas datas. Aguarde um momento.",
      "variables": ["destination", "date"],
      "channel": "all",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/templates
Cria um novo template

**Body**:
```json
{
  "category": "support",
  "name": "Aguardar",
  "content": "Peço que aguarde um momento enquanto verifico essas informações para você.",
  "variables": [],
  "channel": "all"
}
```

#### PUT /api/templates/{id}
Atualiza um template

**Parâmetros**:
- `id`: ID do template

**Body**:
```json
{
  "content": "Peço que aguarde alguns minutos enquanto verifico essas informações para você.",
  "variables": ["waitTime"]
}
```

### 5. Métricas

#### GET /api/metrics/dashboard
Obtém métricas do dashboard

**Parâmetros de Query**:
- `period` (optional): Período (today, week, month, year)
- `agent` (optional): Filtro por agente

**Resposta**:
```json
{
  "success": true,
  "data": {
    "conversations": {
      "total": 150,
      "active": 25,
      "pending": 8,
      "resolved": 117
    },
    "channels": {
      "whatsapp": { "active": 15, "total": 80 },
      "email": { "active": 5, "total": 40 },
      "webchat": { "active": 3, "total": 20 },
      "phone": { "active": 2, "total": 10 }
    },
    "performance": {
      "averageResponseTime": 2.5,
      "customerSatisfaction": 4.8,
      "resolutionRate": 0.78
    },
    "agents": {
      "online": 5,
      "busy": 2,
      "away": 1
    }
  }
}
```

#### GET /api/metrics/customer/{id}
Obtém métricas específicas de um cliente

**Parâmetros**:
- `id`: ID do cliente

**Resposta**:
```json
{
  "success": true,
  "data": {
    "customerId": 1,
    "totalInteractions": 15,
    "totalBookings": 3,
    "totalSpent": 5450.00,
    "averageResponseTime": 2.5,
    "customerSatisfaction": 4.8,
    "preferredChannels": ["whatsapp", "email"],
    "interactionsByChannel": {
      "whatsapp": 12,
      "email": 2,
      "webchat": 1
    },
    "monthlyActivity": [
      { "month": "2024-01", "interactions": 8, "bookings": 1, "spent": 2200.00 },
      { "month": "2024-02", "interactions": 4, "bookings": 1, "spent": 1800.00 },
      { "month": "2024-03", "interactions": 3, "bookings": 1, "spent": 1450.00 }
    ]
  }
}
```

### 6. Notificações

#### GET /api/notifications
Lista notificações do agente

**Parâmetros de Query**:
- `agentId`: ID do agente
- `unread` (optional): Apenas não lidas (true/false)
- `priority` (optional): Filtro por prioridade

**Resposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "agentId": 1,
      "type": "new_message",
      "title": "Nova mensagem de Maria Silva",
      "message": "Cliente enviou uma nova mensagem",
      "priority": "high",
      "conversationId": 1,
      "isRead": false,
      "createdAt": "2024-01-20T15:30:00.000Z"
    },
    {
      "id": 2,
      "agentId": 1,
      "type": "status_change",
      "title": "Conversa escalada",
      "message": "Conversa #123 foi escalada para supervisor",
      "priority": "medium",
      "conversationId": 123,
      "isRead": true,
      "createdAt": "2024-01-20T14:45:00.000Z"
    }
  ]
}
```

#### PUT /api/notifications/{id}/read
Marca notificação como lida

**Parâmetros**:
- `id`: ID da notificação

**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isRead": true,
    "readAt": "2024-01-20T15:45:00.000Z"
  }
}
```

---

## 📊 Modelos de Dados

### Customer
```typescript
interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'prospect' | 'customer' | 'vip' | 'premium';
  totalInteractions: number;
  totalBookings: number;
  totalSpent: number;
  firstContact: string; // ISO date
  lastContact: string; // ISO date
  conversationCount: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  preferredChannels: string[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### Conversation
```typescript
interface Conversation {
  id: number;
  customer: Customer;
  channel: 'whatsapp' | 'email' | 'webchat' | 'phone';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lastMessage: string;
  timestamp: string; // ISO date
  unreadCount: number;
  agent?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### Message
```typescript
interface Message {
  id: number;
  conversationId: number;
  customerId: number;
  content: string;
  direction: 'inbound' | 'outbound';
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video';
  isAutomated: boolean;
  timestamp: string; // ISO date
  agent?: string;
  metadata?: Record<string, any>;
}
```

### Template
```typescript
interface Template {
  id: string;
  category: 'greetings' | 'travel' | 'support';
  name: string;
  content: string;
  variables: string[];
  channel: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### Notification
```typescript
interface Notification {
  id: number;
  agentId: number;
  type: 'new_message' | 'status_change' | 'escalation' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  conversationId?: number;
  isRead: boolean;
  readAt?: string; // ISO date
  createdAt: string; // ISO date
}
```

---

## 🔢 Códigos de Resposta

### Códigos de Sucesso
- `200 OK`: Requisição processada com sucesso
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Recurso deletado com sucesso

### Códigos de Erro
- `400 Bad Request`: Dados inválidos na requisição
- `401 Unauthorized`: Token de autenticação inválido
- `403 Forbidden`: Sem permissão para acessar recurso
- `404 Not Found`: Recurso não encontrado
- `422 Unprocessable Entity`: Dados não processáveis
- `429 Too Many Requests`: Limite de requisições excedido
- `500 Internal Server Error`: Erro interno do servidor

### Formato de Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório"
      }
    ]
  }
}
```

---

## 💡 Exemplos de Uso

### Autenticação
```javascript
const token = 'your-auth-token';
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Buscar Conversas Ativas
```javascript
const response = await fetch('/api/conversations?status=open&limit=10', {
  headers
});
const data = await response.json();
```

### Enviar Mensagem
```javascript
const response = await fetch('/api/conversations/1/messages', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    content: 'Obrigado pelo contato!',
    messageType: 'text',
    agentId: 1
  })
});
```

### Obter Visão 360°
```javascript
const response = await fetch('/api/customers/1/360', {
  headers
});
const customerData = await response.json();
```

### Atualizar Status da Conversa
```javascript
const response = await fetch('/api/conversations/1/status', {
  method: 'PUT',
  headers,
  body: JSON.stringify({
    status: 'resolved',
    note: 'Problema resolvido'
  })
});
```

---

## ⚡ Rate Limiting

### Limites por Endpoint
- **GET**: 100 requisições/minuto
- **POST**: 60 requisições/minuto
- **PUT**: 60 requisições/minuto
- **DELETE**: 30 requisições/minuto

### Headers de Rate Limit
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Resposta de Rate Limit
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de requisições excedido",
    "retryAfter": 60
  }
}
```

---

## 🔔 Webhooks

### Configuração
```javascript
// Endpoint do webhook
POST /api/webhooks/configure
{
  "url": "https://your-app.com/webhook",
  "events": ["message.received", "conversation.status_changed"],
  "secret": "your-webhook-secret"
}
```

### Eventos Disponíveis
- `message.received`: Nova mensagem recebida
- `message.sent`: Mensagem enviada
- `conversation.created`: Nova conversa criada
- `conversation.status_changed`: Status da conversa alterado
- `customer.created`: Novo cliente criado
- `customer.updated`: Cliente atualizado

### Payload do Webhook
```json
{
  "event": "message.received",
  "timestamp": "2024-01-20T15:30:00.000Z",
  "data": {
    "messageId": 123,
    "conversationId": 1,
    "customerId": 1,
    "content": "Olá, preciso de ajuda",
    "channel": "whatsapp",
    "direction": "inbound"
  }
}
```

### Verificação de Assinatura
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return signature === `sha256=${digest}`;
}
```

---

*Documentação da API - Última atualização: 2024-01-20*