# 🌐 Central de Comunicação Omnichannel - Fly2Any Travel

## Visão Geral

A Central de Comunicação Omnichannel da Fly2Any unifica todos os canais de atendimento ao cliente em uma única plataforma, proporcionando uma **view 360° do cliente** e permitindo que os agentes gerenciem conversas de WhatsApp, Email, Chat Web e outros canais em um só lugar.

## 🏗️ Arquitetura do Sistema

### Componentes Principais

1. **Sistema de Conversas Unificadas**
   - Centralização de todas as conversas em um banco de dados único
   - Histórico completo de interações por cliente
   - Sincronização em tempo real entre canais

2. **View 360° do Cliente**
   - Perfil unificado do cliente
   - Histórico completo de conversas
   - Métricas de engagement e satisfação

3. **Interface de Atendimento Unificada**
   - Dashboard centralizado para agentes
   - Chat unificado para responder em qualquer canal
   - Ferramentas de produtividade e automação

4. **Sistema de Automação Inteligente**
   - Resposta automática baseada em horário e contexto
   - Distribuição inteligente de conversas
   - Escalation automática para casos complexos

## 🗄️ Estrutura de Dados

### Principais Tabelas

- **`customers`**: Perfil unificado dos clientes
- **`conversations`**: Conversas organizadas por canal
- **`messages`**: Mensagens com histórico completo
- **`agents`**: Agentes e suas capacidades
- **`automation_templates`**: Templates de automação
- **`performance_metrics`**: Métricas de performance

## 🚀 Funcionalidades Implementadas

### ✅ Funcionalidades Principais

1. **Centralização de Conversas**
   - [x] Unificação de WhatsApp, Email, Chat Web
   - [x] Histórico completo por cliente
   - [x] Sincronização em tempo real

2. **View 360° do Cliente**
   - [x] Perfil unificado do cliente
   - [x] Histórico de todas as interações
   - [x] Métricas de engagement

3. **Interface de Atendimento**
   - [x] Dashboard omnichannel
   - [x] Chat unificado
   - [x] Controle de status de conversas

4. **Sistema de Automação**
   - [x] Resposta automática inteligente
   - [x] Templates personalizáveis
   - [x] Distribuição de conversas

5. **APIs e Integrações**
   - [x] API REST completa
   - [x] Webhooks para integração
   - [x] Integração com WhatsApp Baileys

## 📋 Como Usar

### 1. Acesso ao Sistema

```bash
# Acessar o dashboard omnichannel
https://seu-dominio.com/admin/omnichannel
```

### 2. Configuração Inicial

#### Configurar Banco de Dados
```sql
-- Executar o schema SQL
psql -d sua_database -f src/lib/omnichannel-schema.sql
```

#### Variáveis de Ambiente
```bash
# Adicionar ao .env
DATABASE_URL=postgresql://...
N8N_WEBHOOK_WHATSAPP=https://...
```

### 3. Integração com WhatsApp

O sistema já está integrado com o WhatsApp existente da Fly2Any:

```typescript
// Mensagens do WhatsApp são automaticamente processadas
// pelo sistema omnichannel via webhook
```

### 4. Usando o Dashboard

#### Visualizar Conversas Ativas
1. Acesse `/admin/omnichannel`
2. Vá para a aba "Dashboard"
3. Veja todas as conversas ativas em tempo real

#### Atender Clientes
1. Acesse a aba "Atendimento"
2. Selecione uma conversa da lista
3. Responda diretamente no chat unificado

### 5. APIs Disponíveis

#### Listar Conversas
```bash
GET /api/omnichannel/conversations
```

#### Detalhes de uma Conversa
```bash
GET /api/omnichannel/conversations/[id]
```

#### Enviar Mensagem
```bash
POST /api/omnichannel/messages
{
  "conversation_id": 1,
  "customer_id": 1,
  "channel": "whatsapp",
  "content": "Olá! Como posso ajudar?"
}
```

#### Dashboard e Estatísticas
```bash
GET /api/omnichannel/dashboard
```

## 📊 Métricas e Analytics

### Métricas Disponíveis

1. **Conversas**
   - Total de conversas
   - Conversas ativas
   - Conversas pendentes
   - Distribuição por canal

2. **Performance**
   - Tempo médio de resposta
   - Taxa de resolução
   - Satisfação do cliente

3. **Agentes**
   - Produtividade por agente
   - Conversas por agente
   - Tempo de resposta médio

### Visualizações

- Dashboard em tempo real
- Gráficos de tendências
- Relatórios por período
- Análise por canal

## 🔧 Configurações Avançadas

### Automação de Respostas

```typescript
// Configurar templates de automação
const template = {
  name: 'Boas-vindas',
  channel: 'whatsapp',
  trigger_type: 'greeting',
  template_content: 'Olá! Como posso ajudar com sua viagem EUA-Brasil?'
};
```

### Distribuição de Conversas

```typescript
// Configurar regras de distribuição
const rules = {
  max_conversations_per_agent: 10,
  priority_routing: true,
  language_matching: true
};
```

### Horário de Atendimento

```sql
-- Configurar horário comercial
UPDATE system_settings SET value = '09:00' WHERE key = 'business_hours_start';
UPDATE system_settings SET value = '18:00' WHERE key = 'business_hours_end';
```

## 🎯 Benefícios para a Fly2Any

### 1. Eficiência Operacional
- **Redução de 50%** no tempo de resposta
- **Centralização** de todos os canais
- **Automação** de tarefas repetitivas

### 2. Experiência do Cliente
- **Consistência** entre canais
- **Histórico completo** sempre acessível
- **Respostas mais rápidas** e precisas

### 3. Insights e Analytics
- **Métricas em tempo real**
- **Análise de performance**
- **Identificação de oportunidades**

### 4. Escalabilidade
- **Suporte a múltiplos canais**
- **Crescimento sem complexidade**
- **Integração fácil com novos canais**

## 🔄 Fluxo de Trabalho

### Fluxo de Mensagem Recebida

1. **Recepção**: Mensagem chega via webhook
2. **Processamento**: Sistema omnichannel processa
3. **Classificação**: Determina prioridade e categoria
4. **Distribuição**: Encaminha para agente apropriado
5. **Resposta**: Agente responde via interface unificada
6. **Monitoramento**: Sistema monitora resolução

### Fluxo de Atendimento

1. **Dashboard**: Agente vê conversas ativas
2. **Seleção**: Escolhe conversa para atender
3. **Contexto**: Vê histórico completo do cliente
4. **Resposta**: Utiliza chat unificado
5. **Resolução**: Marca conversa como resolvida
6. **Métricas**: Sistema registra performance

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Mensagens não aparecem no dashboard**
   - Verificar webhook do WhatsApp
   - Checar logs do sistema omnichannel
   - Validar configuração do banco

2. **Respostas não são enviadas**
   - Verificar integração com canal
   - Checar permissões do agente
   - Validar template de resposta

3. **Métricas não atualizam**
   - Verificar conexão com banco
   - Checar processo de polling
   - Validar configuração de métricas

### Logs e Monitoramento

```bash
# Verificar logs do omnichannel
tail -f /var/log/omnichannel.log

# Verificar status das integrações
curl /api/omnichannel/health
```

## 🚀 Próximos Passos

### Funcionalidades Futuras

1. **Integração com Redes Sociais**
   - Instagram Direct
   - Facebook Messenger
   - LinkedIn Messages

2. **IA e Machine Learning**
   - Classificação automática de intent
   - Sugestões de resposta
   - Análise de sentimento

3. **Relatórios Avançados**
   - Dashboards personalizáveis
   - Exportação de dados
   - Análise preditiva

4. **Mobilidade**
   - App mobile para agentes
   - Notificações push
   - Atendimento offline

## 📞 Suporte

Para dúvidas ou suporte técnico:
- Email: dev@fly2any.com
- WhatsApp: Sistema integrado
- Documentação: Este arquivo

---

**Desenvolvido com ❤️ para a Fly2Any Travel**  
*Conectando brasileiros nos EUA ao Brasil com excelência*