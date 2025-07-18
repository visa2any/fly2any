# 🌐 Sistema Omnichannel Fly2Any - Documentação Completa

## 📋 Índice
1. [Visão Geral](#-visão-geral)
2. [Funcionalidades](#-funcionalidades)
3. [Arquitetura](#-arquitetura)
4. [Componentes](#-componentes)
5. [Guia de Uso](#-guia-de-uso)
6. [APIs e Integrações](#-apis-e-integrações)
7. [Estrutura de Dados](#-estrutura-de-dados)
8. [Instalação e Configuração](#-instalação-e-configuração)
9. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

O Sistema Omnichannel Fly2Any é uma solução completa de atendimento ao cliente que integra múltiplos canais de comunicação em uma interface unificada. Desenvolvido com Next.js 15.3.5 e React 19, oferece uma experiência moderna e eficiente para agentes de atendimento.

### Características Principais
- **Interface Unificada**: Todos os canais em um só lugar
- **Visão 360° do Cliente**: Histórico completo de interações
- **Templates Inteligentes**: Respostas pré-definidas por categoria
- **Métricas em Tempo Real**: Dashboard com indicadores de performance
- **Layout Responsivo**: Otimizado para diferentes tamanhos de tela

---

## ✨ Funcionalidades

### 1. Dashboard Principal
- **Métricas Rápidas**: Conversas ativas, pendentes, tempo médio de resposta
- **Status dos Canais**: Monitoramento em tempo real de WhatsApp, Email, Chat, Telefone
- **Ações Rápidas**: Broadcast, gerenciamento de agentes, configuração de bot
- **Lista de Conversas**: Filtros por canal, status, busca por nome/mensagem
- **Estatísticas**: Cards com total de conversas, ativas, pendentes, satisfação

### 2. Chat Completo
- **Interface de Mensagens**: Visualização de conversas em tempo real
- **Mudança de Status**: Botões para alterar status das conversas
- **Detalhes do Cliente**: Sidebar com informações completas
- **Campo de Mensagem**: Entrada de texto com suporte a templates
- **Ações Contextuais**: Acesso rápido a perfil, 360°, ligação, email

### 3. Sistema de Templates
- **Categorias Organizadas**: Saudações, Viagens, Suporte
- **Templates Prontos**: 9 modelos pré-configurados
- **Função Copiar**: Botão para copiar templates para área de transferência
- **Layout Grid**: Organização visual em cards responsivos

### 4. Visão 360° do Cliente
- **Timeline Completa**: Histórico cronológico de todas as interações
- **Métricas Detalhadas**: Gasto total, reservas, interações, satisfação
- **Análise de Canais**: Distribuição de interações por canal
- **Eventos Categorizados**: Mensagens, reservas, pagamentos, emails

### 5. Notificações
- **Sistema Integrado**: Notificações em tempo real
- **Priorização**: Diferentes níveis de importância
- **Ações Rápidas**: Resposta direta das notificações

---

## 🏗️ Arquitetura

### Estrutura do Projeto
```
src/
├── app/
│   └── admin/
│       └── omnichannel-test/
│           └── page.tsx                    # Componente principal
├── components/
│   ├── ui/                                 # Componentes base
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── textarea.tsx
│   ├── omnichannel/                        # Componentes específicos
│   │   ├── ResponseTemplates.tsx
│   │   └── NotificationSystem.tsx
│   └── customers/
│       └── Timeline360.tsx
├── lib/
│   ├── omnichannel-api.ts                  # APIs do sistema
│   └── escalation-engine.ts                # Engine de escalação
└── app/api/
    └── customers/
        └── [id]/
            └── 360/
                └── route.ts                # API dados 360°
```

### Tecnologias Utilizadas
- **Frontend**: Next.js 15.3.5, React 19, TypeScript
- **Styling**: Tailwind CSS 4.0, CSS-in-JS inline
- **Database**: PostgreSQL com Vercel Postgres
- **WhatsApp**: Baileys para integração
- **Email**: AWS SES, Resend
- **Deploy**: Vercel

---

## 🧩 Componentes

### OmnichannelTestPage (Principal)
```typescript
interface MockConversation {
  id: number;
  customer: { name: string; phone: string; email: string; };
  channel: 'whatsapp' | 'email' | 'webchat' | 'phone';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  agent?: string;
}
```

### Estados Gerenciados
- **conversations**: Lista de conversas
- **selectedConversation**: Conversa selecionada
- **view**: Vista atual ('dashboard' | 'chat' | 'templates' | 'customer360')
- **searchTerm**: Termo de busca
- **selectedChannel**: Canal filtrado
- **selectedStatus**: Status filtrado
- **newMessage**: Mensagem sendo digitada
- **showTemplates**: Modal de templates

### Funções Principais
- **handleConversationClick**: Seleciona e navega para conversa
- **updateConversationStatus**: Atualiza status da conversa
- **sendMessage**: Envia mensagem
- **handleTemplateSelect**: Seleciona template
- **filteredConversations**: Aplica filtros às conversas

---

## 📖 Guia de Uso

### Acesso ao Sistema
1. Navegue para `/admin/omnichannel-test`
2. O dashboard principal será carregado automaticamente

### Navegação Principal
- **Dashboard**: Visão geral com métricas e lista de conversas
- **Chat**: Interface de conversa com cliente selecionado
- **Templates**: Biblioteca de respostas pré-definidas
- **Cliente 360°**: Histórico completo do cliente

### Usando o Dashboard
1. **Métricas Rápidas**: Visualize conversas ativas, pendentes e tempo médio
2. **Status dos Canais**: Monitore a saúde dos canais de comunicação
3. **Filtros**: Use busca, canal e status para encontrar conversas
4. **Ações**: Clique em "Responder" para abrir o chat ou "360°" para ver histórico

### Gerenciando Conversas
1. **Mudança de Status**: Use os botões coloridos para alterar status
2. **Priorização**: Visualize e organize por prioridade
3. **Busca**: Digite nome do cliente ou conteúdo da mensagem
4. **Filtros**: Selecione canal específico ou status

### Usando Templates
1. **Navegue para Templates**: Clique no botão "📝 Templates"
2. **Selecione Categoria**: Saudações, Viagens ou Suporte
3. **Copie Template**: Clique em "📋 Copiar" para usar
4. **Personalização**: Edite conforme necessário

### Visão 360° do Cliente
1. **Acesso**: Clique em "👤 360°" em qualquer conversa
2. **Timeline**: Veja histórico cronológico completo
3. **Métricas**: Analise gasto total, reservas, satisfação
4. **Canais**: Entenda preferências de comunicação

---

## 🔌 APIs e Integrações

### API Cliente 360°
```typescript
GET /api/customers/[id]/360
```
**Resposta**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Cliente Nome",
    "email": "cliente@email.com",
    "phone": "+55 11 99999-9999",
    "status": "customer",
    "totalInteractions": 15,
    "totalBookings": 3,
    "totalSpent": 5450.00,
    "firstContact": "2023-01-15T00:00:00.000Z",
    "lastContact": "2024-01-20T00:00:00.000Z",
    "conversationCount": 5,
    "averageResponseTime": 2.5,
    "customerSatisfaction": 4.8,
    "preferredChannels": ["whatsapp", "email"],
    "timeline": [...]
  }
}
```

### Integração WhatsApp (Baileys)
```typescript
// Configuração básica
import { makeWASocket } from '@whiskeysockets/baileys';

const socket = makeWASocket({
  auth: authState,
  printQRInTerminal: true
});
```

### Integração Email (AWS SES)
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const client = new SESClient({ region: 'us-east-1' });
```

### Banco de Dados (PostgreSQL)
```sql
-- Tabelas principais
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER,
  channel VARCHAR(50),
  status VARCHAR(20),
  priority VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER,
  content TEXT,
  direction VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 Estrutura de Dados

### Conversação
```typescript
interface Conversation {
  id: number;
  customer: Customer;
  channel: 'whatsapp' | 'email' | 'webchat' | 'phone';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  agent?: string;
}
```

### Cliente
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
  firstContact: Date;
  lastContact: Date;
  customerSatisfaction: number;
}
```

### Evento Timeline
```typescript
interface TimelineEvent {
  id: string;
  type: 'message' | 'booking' | 'payment' | 'call' | 'email' | 'note';
  title: string;
  description: string;
  timestamp: Date;
  channel?: string;
  agent?: string;
  value?: number;
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
  variables?: string[];
  channel?: string;
}
```

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta AWS (para SES)
- Conta Vercel (para deploy)

### Instalação
```bash
# Clone o repositório
git clone https://github.com/visa2any/fly2any.git
cd fly2any

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local

# Execute migrações
npm run db:migrate

# Inicie o servidor
npm run dev
```

### Variáveis de Ambiente
```env
# Database
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-session

# Email
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Resend
RESEND_API_KEY=...
```

### Configuração do Banco
```sql
-- Criar tabelas necessárias
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  customer_type VARCHAR(50) DEFAULT 'prospect',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  customer_id INTEGER REFERENCES customers(id),
  content TEXT NOT NULL,
  direction VARCHAR(20) NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_automated BOOLEAN DEFAULT false,
  agent_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Build Failures
**Erro**: TypeScript compilation errors
**Solução**: 
```bash
npm run build
# Verifique erros de tipo
npx tsc --noEmit
```

#### 2. Database Connection
**Erro**: Cannot connect to PostgreSQL
**Solução**:
- Verifique `POSTGRES_URL` no `.env.local`
- Teste conexão: `psql $POSTGRES_URL`
- Verifique se tabelas existem

#### 3. WhatsApp Integration
**Erro**: WhatsApp connection failed
**Solução**:
- Limpe session: `rm -rf ./whatsapp-session`
- Escaneie QR code novamente
- Verifique logs do console

#### 4. Email não enviando
**Erro**: AWS SES authentication failed
**Solução**:
- Verifique credenciais AWS
- Confirme região correta
- Verifique se domínio está verificado

#### 5. Performance Issues
**Sintomas**: Interface lenta, travamentos
**Solução**:
- Verifique memory usage
- Otimize queries do banco
- Implemente paginação nas conversas

### Logs e Monitoramento
```bash
# Logs do Next.js
npm run dev

# Logs do banco
tail -f /var/log/postgresql/postgresql.log

# Logs do WhatsApp
console.log em lib/whatsapp-handler.ts
```

### Desenvolvimento
```bash
# Modo desenvolvimento
npm run dev

# Testes
npm run test

# Linting
npm run lint

# Build de produção
npm run build
npm start
```

---

## 📝 Notas de Versão

### v1.0.0 (Atual)
- ✅ Dashboard completo com métricas
- ✅ Chat funcional com múltiplos canais
- ✅ Sistema de templates organizados
- ✅ Visão 360° do cliente
- ✅ Notificações em tempo real
- ✅ Layout responsivo full-width
- ✅ Integração com WhatsApp, Email
- ✅ APIs REST completas

### Roadmap Futuro
- 🔄 Integração com Instagram/Facebook
- 🔄 Chatbot com IA
- 🔄 Relatórios avançados
- 🔄 Integração com CRM
- 🔄 App mobile
- 🔄 Chamadas de vídeo
- 🔄 Escalação automática
- 🔄 Analytics avançados

---

## 👥 Equipe e Contribuições

### Desenvolvido por
- **Claude AI** (Anthropic) - Desenvolvimento completo
- **Fly2Any Team** - Especificações e requisitos

### Contribuições
Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

### Suporte
- **Documentação**: Esta documentação
- **Issues**: GitHub Issues
- **Email**: suporte@fly2any.com

---

*Documentação gerada automaticamente - Última atualização: 2024-01-20*