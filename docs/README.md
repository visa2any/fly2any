# 🌐 Sistema Omnichannel Fly2Any

**Sistema completo de atendimento ao cliente com múltiplos canais integrados**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)

## 📋 Visão Geral

O Sistema Omnichannel Fly2Any é uma solução completa de atendimento ao cliente que integra múltiplos canais de comunicação (WhatsApp, Email, Chat Web, Telefone) em uma única interface moderna e intuitiva.

### 🎯 Principais Funcionalidades

- **🌐 Atendimento Unificado**: Todos os canais em uma interface
- **📊 Dashboard Completo**: Métricas e analytics em tempo real
- **💬 Chat Avançado**: Interface de conversa com recursos completos
- **📝 Templates Inteligentes**: Respostas categorizadas e personalizáveis
- **👤 Visão 360° do Cliente**: Histórico completo de interações
- **🔔 Notificações**: Sistema de alertas em tempo real
- **📱 Layout Responsivo**: Otimizado para desktop e mobile

## 🚀 Demo

**Acesse o sistema**: [https://fly2any.com/admin/omnichannel-test](https://fly2any.com/admin/omnichannel-test)

## 🛠️ Tecnologias

### Frontend
- **Next.js 15.3.5** - Framework React com App Router
- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4.0** - Framework CSS
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - Endpoints REST
- **PostgreSQL** - Banco de dados principal
- **Vercel Postgres** - Hospedagem do banco

### Integrações
- **WhatsApp Business API** - Baileys
- **Email Services** - AWS SES, Resend
- **Real-time** - Server-Sent Events

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta Vercel (para deploy)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/visa2any/fly2any.git
cd fly2any
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

4. **Configure o banco de dados**
```bash
npm run db:migrate
npm run db:seed
```

5. **Inicie o servidor**
```bash
npm run dev
```

6. **Acesse o sistema**
```
http://localhost:3000/admin/omnichannel-test
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/fly2any
POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/fly2any

# WhatsApp
WHATSAPP_SESSION_PATH=./whatsapp-session

# Email
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1

# Resend
RESEND_API_KEY=your-resend-key
```

### Configuração do Banco

Execute o script SQL para criar as tabelas:

```sql
-- Clientes
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  customer_type VARCHAR(50) DEFAULT 'prospect',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversas
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  channel VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mensagens
CREATE TABLE messages (
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

## 🏗️ Arquitetura

### Estrutura do Projeto

```
src/
├── app/
│   ├── admin/
│   │   └── omnichannel-test/
│   │       └── page.tsx           # Página principal
│   └── api/
│       └── customers/
│           └── [id]/
│               └── 360/
│                   └── route.ts    # API dados 360°
├── components/
│   ├── ui/                        # Componentes base
│   ├── omnichannel/              # Componentes específicos
│   └── customers/                # Componentes de cliente
├── lib/
│   ├── omnichannel-api.ts        # APIs do sistema
│   └── escalation-engine.ts      # Motor de escalação
└── docs/                         # Documentação
    ├── OMNICHANNEL_SYSTEM.md
    ├── API_DOCUMENTATION.md
    └── USER_GUIDE.md
```

### Componentes Principais

#### OmnichannelTestPage
- **Função**: Componente principal da aplicação
- **Estados**: Gerencia conversas, filtros, views
- **Views**: Dashboard, Chat, Templates, Cliente 360°

#### Dashboard
- **Métricas**: Conversas ativas, pendentes, satisfação
- **Filtros**: Por canal, status, busca
- **Ações**: Responder, resolver, ver 360°

#### Chat
- **Interface**: Mensagens em tempo real
- **Status**: Controle de estados da conversa
- **Templates**: Integração com respostas rápidas

#### Visão 360°
- **Timeline**: Histórico completo do cliente
- **Métricas**: Gastos, reservas, satisfação
- **Canais**: Análise de preferências

## 📱 Funcionalidades Detalhadas

### 1. Dashboard Principal
- **Sidebar Esquerda**: Métricas rápidas, status dos canais, ações
- **Área Principal**: Lista de conversas com filtros
- **Cards de Métricas**: Estatísticas em tempo real
- **Filtros Avançados**: Busca, canal, status

### 2. Sistema de Chat
- **Mensagens**: Histórico completo da conversa
- **Status**: Alterar estado (aberto, pendente, resolvido, fechado)
- **Detalhes**: Sidebar com informações do cliente
- **Templates**: Modal para seleção rápida

### 3. Templates de Resposta
- **Categorias**: Saudações, Viagens, Suporte
- **Copiar**: Função para área de transferência
- **Organização**: Layout em grid responsivo

### 4. Cliente 360°
- **Timeline**: Eventos cronológicos
- **Métricas**: Gastos, reservas, interações
- **Análise**: Canais preferenciais
- **Histórico**: Mensagens, pagamentos, reservas

### 5. Notificações
- **Tempo Real**: Alertas instantâneos
- **Tipos**: Mensagens, mudanças, escalações
- **Ações**: Resposta direta das notificações

## 🎨 Design System

### Cores Principais
- **Primária**: `#3b82f6` (Azul)
- **Secundária**: `#10b981` (Verde)
- **Aviso**: `#f59e0b` (Amarelo)
- **Erro**: `#ef4444` (Vermelho)
- **Neutra**: `#6b7280` (Cinza)

### Componentes UI
- **Cards**: Containers com sombra e bordas arredondadas
- **Botões**: Estilo consistente com estados hover
- **Badges**: Status coloridos e categorizados
- **Modais**: Overlays com backdrop blur

### Layout
- **Grid**: Sistema baseado em CSS Grid
- **Responsivo**: Breakpoints mobile, tablet, desktop
- **Spacing**: Escala consistente (4px, 8px, 12px, 16px, 20px, 24px)

## 🔌 API Reference

### Endpoints Principais

#### Clientes
- `GET /api/customers` - Lista clientes
- `GET /api/customers/{id}` - Detalhes do cliente
- `GET /api/customers/{id}/360` - Visão 360°
- `POST /api/customers` - Criar cliente
- `PUT /api/customers/{id}` - Atualizar cliente

#### Conversas
- `GET /api/conversations` - Lista conversas
- `GET /api/conversations/{id}` - Detalhes da conversa
- `POST /api/conversations` - Criar conversa
- `PUT /api/conversations/{id}/status` - Atualizar status

#### Mensagens
- `GET /api/conversations/{id}/messages` - Lista mensagens
- `POST /api/conversations/{id}/messages` - Enviar mensagem

#### Templates
- `GET /api/templates` - Lista templates
- `POST /api/templates` - Criar template
- `PUT /api/templates/{id}` - Atualizar template

### Exemplos de Uso

```javascript
// Buscar conversas ativas
const response = await fetch('/api/conversations?status=open');
const data = await response.json();

// Enviar mensagem
const response = await fetch('/api/conversations/1/messages', {
  method: 'POST',
  body: JSON.stringify({
    content: 'Olá! Como posso ajudar?',
    agentId: 1
  })
});

// Obter dados 360°
const response = await fetch('/api/customers/1/360');
const customerData = await response.json();
```

## 🧪 Testes

### Executar Testes
```bash
# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Testes e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

### Estrutura de Testes
```
tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── user-flows/
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Variáveis de Ambiente no Vercel
Configure no dashboard da Vercel:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `WHATSAPP_SESSION_PATH`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `RESEND_API_KEY`

### Build Manual
```bash
# Build de produção
npm run build

# Iniciar servidor
npm start
```

## 📊 Monitoramento

### Métricas Disponíveis
- **Performance**: Tempo de resposta, uptime
- **Uso**: Conversas ativas, mensagens enviadas
- **Satisfação**: Ratings de clientes
- **Canais**: Distribuição por canal

### Logs
- **Aplicação**: Console do Next.js
- **Banco**: PostgreSQL logs
- **Integrações**: WhatsApp, Email logs

## 🔒 Segurança

### Implementações
- **Autenticação**: Bearer tokens
- **Autorização**: Role-based access
- **Validação**: Input sanitization
- **Rate Limiting**: API throttling
- **HTTPS**: SSL/TLS encryption

### Boas Práticas
- Senhas seguras
- Tokens com expiração
- Logs de auditoria
- Backup regular

## 🤝 Contribuindo

### Como Contribuir
1. Fork do projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código
- **ESLint**: Configuração do Next.js
- **Prettier**: Formatação automática
- **TypeScript**: Tipagem obrigatória
- **Commits**: Conventional commits

### Estrutura de Commit
```
feat: adiciona nova funcionalidade
fix: corrige bug específico
docs: atualiza documentação
style: mudanças de estilo
refactor: refatoração de código
test: adiciona testes
chore: tarefas de build/manutenção
```

## 📚 Documentação

### Documentos Disponíveis
- **[Sistema Completo](./docs/OMNICHANNEL_SYSTEM.md)** - Documentação técnica completa
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Referência da API
- **[User Guide](./docs/USER_GUIDE.md)** - Guia do usuário
- **[README](./docs/README.md)** - Este documento

### Recursos Adicionais
- **Changelog**: Histórico de versões
- **Roadmap**: Funcionalidades futuras
- **FAQ**: Perguntas frequentes
- **Troubleshooting**: Solução de problemas

## 📈 Roadmap

### v1.1.0 (Próxima Release)
- [ ] Integração Instagram/Facebook
- [ ] Chatbot com IA
- [ ] Relatórios avançados
- [ ] Escalação automática melhorada

### v1.2.0 (Futuro)
- [ ] App mobile
- [ ] Chamadas de vídeo
- [ ] CRM integrado
- [ ] Analytics avançados

### v2.0.0 (Longo Prazo)
- [ ] Multi-tenancy
- [ ] Marketplace de plugins
- [ ] White-label
- [ ] API pública

## 🐛 Problemas Conhecidos

### Limitações Atuais
- **WhatsApp**: Limitado a uma conta por instância
- **Email**: Suporte básico a anexos
- **Mobile**: Interface otimizada mas não nativa
- **Offline**: Sem suporte a modo offline

### Workarounds
- Múltiplas instâncias para múltiplas contas WhatsApp
- Processamento de anexos via webhook
- PWA para experiência mobile aprimorada

## 📞 Suporte

### Canais de Contato
- **Email**: suporte@fly2any.com
- **GitHub Issues**: [Issues](https://github.com/visa2any/fly2any/issues)
- **WhatsApp**: +55 11 99999-9999
- **Documentação**: Este repositório

### Horários de Suporte
- **Segunda a Sexta**: 8h às 18h (GMT-3)
- **Sábado**: 8h às 12h (GMT-3)
- **Emergências**: 24/7 para clientes enterprise

## 📄 Licença

Este projeto é licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

### Desenvolvimento
- **Claude AI** (Anthropic) - Desenvolvimento completo
- **Fly2Any Team** - Especificações e requisitos

### Contribuidores
- Contributions welcome! Veja [CONTRIBUTING.md](CONTRIBUTING.md)

## 🙏 Agradecimentos

- **Next.js Team** - Framework incrível
- **Vercel** - Hospedagem e deploy
- **Tailwind CSS** - Sistema de design
- **Baileys** - WhatsApp integration
- **PostgreSQL** - Banco de dados confiável
- **Community** - Feedback e suporte

---

**Desenvolvido com ❤️ pela equipe Fly2Any**

*Última atualização: 2024-01-20*
*Versão: 1.0.0*