# 📊 Sistema de Logs Detalhados para Email Marketing

## 🎯 Visão Geral

Sistema completo de monitoramento e logs estruturados para campanhas de email marketing, fornecendo observabilidade total das operações, métricas em tempo real e alertas inteligentes.

## 🏗️ Arquitetura do Sistema

### 📋 Componentes Principais

```
src/lib/
├── email-marketing-logger.ts      # Serviço centralizado de logs
├── email-marketing-alerts.ts      # Sistema de alertas inteligentes
└── email-marketing-db.ts          # Integração com banco de dados

src/app/api/email-marketing/
├── route.ts                       # API principal com logging integrado
├── logs/route.ts                  # Dashboard de monitoramento
└── alerts/route.ts                # Gerenciamento de alertas

src/app/admin/email-marketing/
└── monitoring/page.tsx            # Interface de monitoramento

logs/email-marketing/              # Arquivos de log rotativos
├── email-marketing-2024-01-15.jsonl
├── email-marketing-2024-01-16.jsonl
└── ...
```

## 🔧 Funcionalidades Implementadas

### ✅ 1. Logger Centralizado (EmailMarketingLogger)

**Características:**
- ✨ Logs estruturados em formato JSON Lines
- 📁 Rotação automática de arquivos (diária/semanal/mensal)
- 🎚️ 5 níveis de log: DEBUG, INFO, WARN, ERROR, CRITICAL
- 💾 Saída simultânea para console e arquivo
- 🧹 Limpeza automática de logs antigos
- 📊 Métricas de performance integradas

**Eventos Monitorados:**
- `CAMPAIGN_CREATED` - Criação de campanhas
- `CAMPAIGN_STARTED` - Início de processamento
- `CAMPAIGN_COMPLETED` - Finalização bem-sucedida
- `CAMPAIGN_FAILED` - Falhas de campanha
- `BATCH_STARTED/COMPLETED` - Processamento em lotes
- `EMAIL_SENT/FAILED` - Status de envios individuais
- `RETRY_SCHEDULED/ATTEMPTED` - Sistema de retry
- `RATE_LIMITED` - Controle de taxa de envio
- `HEARTBEAT` - Monitoramento de saúde
- `SYSTEM_ERROR` - Erros do sistema

### ✅ 2. Sistema de Alertas Inteligentes

**Regras de Alerta Padrão:**
- 🚨 **Taxa de Falha Alta** - >20% em 15 minutos
- ⏰ **Campanha Travada** - Sem heartbeat por 10 minutos
- 🔴 **Erros Críticos** - Qualquer erro CRITICAL
- ⚡ **Rate Limit Excessivo** - >5 ocorrências em 30 minutos
- 📧 **Bounces em Massa** - >10% bounce rate em 60 minutos
- 🔑 **Falha de Credenciais** - Erro de autenticação

**Ações Automáticas:**
- 🔔 Notificações em tempo real
- ⏸️ Pausar campanhas problemáticas
- 📧 Envio de alertas via email
- 🪝 Webhooks para integração externa

### ✅ 3. Dashboard de Monitoramento

**Métricas em Tempo Real:**
- 📈 Visão geral do sistema
- 🚨 Alertas ativos e histórico
- 📊 Logs em tempo real
- 🎯 Performance por campanha
- 💻 Métricas de sistema (CPU, memória)

**Funcionalidades do Dashboard:**
- 🔄 Auto-refresh configurável
- 📅 Filtros por período de tempo
- 📥 Exportação de logs (CSV/JSON)
- ✅ Gerenciamento de alertas
- 📱 Interface responsiva

## 📡 APIs Disponíveis

### 🔍 Logs API (`/api/email-marketing/logs`)

**GET Endpoints:**
```javascript
// Dashboard principal
GET /api/email-marketing/logs?action=dashboard&hours=24

// Logs em tempo real
GET /api/email-marketing/logs?action=realtime

// Logs específicos de campanha
GET /api/email-marketing/logs?action=campaigns&campaignId=xyz&hours=24

// Alertas do sistema
GET /api/email-marketing/logs?action=alerts&level=error&hours=1

// Métricas de performance
GET /api/email-marketing/logs?action=performance&hours=24

// Exportar logs
GET /api/email-marketing/logs?action=export&format=csv&hours=24

// Limpeza de logs antigos
GET /api/email-marketing/logs?action=cleanup
```

**POST Endpoints:**
```javascript
// Criar log de teste
POST /api/email-marketing/logs
{
  "action": "test_log",
  "level": "info",
  "event": "test_event",
  "message": "Test message",
  "campaignId": "test-campaign"
}

// Forçar limpeza
POST /api/email-marketing/logs
{
  "action": "force_cleanup"
}
```

### 🚨 Alerts API (`/api/email-marketing/alerts`)

**GET Endpoints:**
```javascript
// Listar alertas
GET /api/email-marketing/alerts?action=list&level=error&hours=24

// Estatísticas de alertas
GET /api/email-marketing/alerts?action=statistics&hours=24

// Regras de alerta
GET /api/email-marketing/alerts?action=rules

// Alertas ativos
GET /api/email-marketing/alerts?action=active

// Dashboard de alertas
GET /api/email-marketing/alerts?action=dashboard
```

**POST Endpoints:**
```javascript
// Reconhecer alerta
POST /api/email-marketing/alerts
{
  "action": "acknowledge",
  "alertId": "alert-123"
}

// Resolver alerta
POST /api/email-marketing/alerts
{
  "action": "resolve",
  "alertId": "alert-123"
}

// Criar regra personalizada
POST /api/email-marketing/alerts
{
  "action": "create_rule",
  "name": "Custom Rule",
  "description": "Custom alert rule",
  "enabled": true,
  "conditions": {
    "event": "EMAIL_FAILED",
    "threshold": 0.15,
    "timeWindow": 30
  },
  "actions": {
    "notify": true,
    "pauseCampaign": true
  }
}
```

## 🚀 Como Usar

### 1. Integração Básica

```typescript
import { emailMarketingLogger, EmailEvent } from '@/lib/email-marketing-logger';

// Log de sucesso
emailMarketingLogger.logEmailSuccess(
  campaignId, 
  contactId, 
  email, 
  { messageId, processingTime: 1200 }
);

// Log de falha
emailMarketingLogger.logEmailFailure(
  campaignId, 
  contactId, 
  email, 
  error, 
  { retryCount: 2, willRetry: true }
);

// Log de métricas de campanha
emailMarketingLogger.logCampaignMetrics(campaignId, {
  totalEmails: 1000,
  successCount: 950,
  failureCount: 50,
  successRate: 95,
  duration: 180000
});
```

### 2. Configuração de Alertas

```typescript
import { emailMarketingAlerts } from '@/lib/email-marketing-alerts';

// Subscrever alertas
const unsubscribe = emailMarketingAlerts.subscribe((alert) => {
  console.log('New alert:', alert);
  // Enviar notificação, webhook, etc.
});

// Criar regra personalizada
const ruleId = emailMarketingAlerts.addRule({
  name: 'High Bounce Rate',
  description: 'Alert when bounce rate exceeds 15%',
  enabled: true,
  conditions: {
    event: EmailEvent.EMAIL_BOUNCED,
    threshold: 0.15,
    timeWindow: 60
  },
  actions: {
    notify: true,
    pauseCampaign: true,
    webhook: 'https://hooks.slack.com/...'
  }
});
```

### 3. Monitoramento via Dashboard

1. Acesse: `/admin/email-marketing/monitoring`
2. Configure auto-refresh e período de tempo
3. Monitore métricas em tempo real
4. Gerencie alertas ativos
5. Exporte logs para análise

## 📊 Estrutura dos Logs

### Formato JSON Lines

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": 1,
  "levelName": "INFO",
  "campaignId": "campaign_1705315845_abc123",
  "contactId": "contact_1705315845_xyz789",
  "email": "user@example.com",
  "event": "EMAIL_SENT",
  "message": "Email sent successfully",
  "metadata": {
    "messageId": "abc123@gmail.com",
    "retryCount": 0,
    "timestamp": "2024-01-15T10:30:45.123Z"
  },
  "duration": 1200,
  "performance": {
    "memoryUsage": {
      "heapUsed": 45678912,
      "heapTotal": 67108864
    },
    "processingTime": 1200
  }
}
```

### Campos Principais

- **timestamp**: ISO timestamp do evento
- **level**: Nível numérico (0=DEBUG, 4=CRITICAL)
- **levelName**: Nome do nível (DEBUG, INFO, WARN, ERROR, CRITICAL)
- **event**: Tipo de evento (enum EmailEvent)
- **message**: Descrição legível do evento
- **campaignId**: ID da campanha (se aplicável)
- **contactId**: ID do contato (se aplicável)
- **email**: Endereço de email (se aplicável)
- **metadata**: Dados adicionais específicos do evento
- **duration**: Tempo de processamento em ms
- **error**: Detalhes do erro (se aplicável)
- **performance**: Métricas de performance do sistema

## ⚡ Performance e Otimização

### Configurações Recomendadas

```typescript
// Logger de produção
const logger = new EmailMarketingLogger({
  logDir: '/var/log/email-marketing',
  maxFileSize: 100, // 100MB
  maxFiles: 30,     // 30 dias
  enableConsole: false,
  enableFile: true,
  logLevel: LogLevel.INFO,
  rotationInterval: 'daily'
});

// Logger de desenvolvimento
const logger = new EmailMarketingLogger({
  logLevel: LogLevel.DEBUG,
  enableConsole: true,
  rotationInterval: 'daily'
});
```

### Otimizações Implementadas

- ✅ **Escrita assíncrona** - Não bloqueia processamento
- ✅ **Compressão automática** - Logs antigos comprimidos
- ✅ **Rate limiting inteligente** - Evita spam de logs
- ✅ **Cleanup automático** - Remove logs antigos
- ✅ **Buffering eficiente** - Agrupa escritas para performance

## 🛡️ Monitoramento de Produção

### Métricas Críticas

1. **Taxa de Erro** - Manter < 5%
2. **Tempo de Resposta** - Média < 2 segundos
3. **Memory Usage** - Manter < 80% da heap
4. **Heartbeat** - Sem falhas > 5 minutos
5. **Rate Limiting** - Ocorrências < 10/hora

### Alertas Críticos

- 🔥 **Sistema Down** - Sem heartbeat por 10+ minutos
- 🚨 **Taxa de Falha** - >20% em 15 minutos
- 💥 **Memory Leak** - Crescimento constante por 1+ hora
- ⚡ **Rate Limit** - >5 ocorrências em 30 minutos

### Ações de Emergência

```bash
# Verificar logs críticos
curl "https://fly2any.com/api/email-marketing/logs?action=alerts&level=critical&hours=1"

# Pausar todas as campanhas
curl -X POST "https://fly2any.com/api/email-marketing" \
  -H "Content-Type: application/json" \
  -d '{"action": "pause_all_campaigns"}'

# Exportar logs para análise
curl "https://fly2any.com/api/email-marketing/logs?action=export&format=csv&hours=24" > emergency-logs.csv

# Reiniciar sistema de alertas
curl -X POST "https://fly2any.com/api/email-marketing/alerts" \
  -d '{"action": "restart_alert_system"}'
```

## 🔮 Análises Avançadas

### Consultas Úteis

```javascript
// Taxa de sucesso por período
const successRate = await fetch('/api/email-marketing/logs?action=performance&hours=24')
  .then(r => r.json())
  .then(data => data.data.overview.successRate);

// Campanhas com problemas
const problemCampaigns = await fetch('/api/email-marketing/logs?action=campaigns&hours=24')
  .then(r => r.json())
  .then(data => data.data.filter(c => c.errorRate > 0.1));

// Tendência de alertas
const alertTrend = await fetch('/api/email-marketing/alerts?action=statistics&hours=168')
  .then(r => r.json())
  .then(data => data.data.statistics.byLevel);
```

### Relatórios Automatizados

```javascript
// Relatório diário via cron
// 0 9 * * * curl "https://fly2any.com/api/email-marketing/logs?action=daily_report"

// Relatório semanal
// 0 9 * * 1 curl "https://fly2any.com/api/email-marketing/logs?action=weekly_report"
```

## 🎉 Benefícios Alcançados

### ✅ Observabilidade Total
- 👁️ Visibilidade completa de todas as operações
- 📊 Métricas detalhadas por campanha e contato
- 🔍 Rastreamento de falhas e sucessos
- ⏱️ Medição precisa de performance

### ✅ Alertas Inteligentes
- 🚨 Detecção proativa de problemas
- 🤖 Ações automáticas de mitigação
- 📱 Notificações em tempo real
- 📈 Redução de downtime

### ✅ Análise Avançada
- 📊 Dashboards interativos
- 📈 Tendências históricas
- 🎯 Otimização baseada em dados
- 📋 Relatórios automatizados

### ✅ Confiabilidade
- 🛡️ Monitoramento 24/7
- 🔄 Auto-recovery de campanhas
- 📝 Auditoria completa
- 🚀 Alta disponibilidade

---

## 📞 Suporte

Para dúvidas ou problemas:

1. **Dashboard**: `/admin/email-marketing/monitoring`
2. **Logs em Tempo Real**: Aba "Live Logs"
3. **Alertas Ativos**: Aba "Alerts"
4. **Documentação**: Este arquivo

---

**🎯 Sistema de Logs Implementado com Sucesso!**

✅ Logging estruturado e rotativo  
✅ Alertas inteligentes e automáticos  
✅ Dashboard de monitoramento em tempo real  
✅ APIs completas para integração  
✅ Performance otimizada para produção  

*Monitoramento profissional para campanhas de email marketing de alta performance!* 🚀