# Flyy2Any - Agência de Viagens

Site completo para agência de viagens especializada em brasileiros nos EUA viajando para o Brasil.

## 🚀 Funcionalidades Implementadas

### ✅ Landing Page Persuasiva
- Design responsivo e moderno
- Seções otimizadas para conversão
- Depoimentos de clientes
- Call-to-actions estratégicos
- Elementos de confiança

### ✅ Formulários de Cotação Completos
1. **Voos** (`/cotacao/voos`)
   - Multi-step form (3 passos)
   - Seleção de origem/destino
   - Datas flexíveis
   - Número de passageiros
   - Classes de viagem

2. **Hotéis** (`/cotacao/hoteis`)
   - Destinos no Brasil
   - Check-in/Check-out
   - Preferências de categoria
   - Serviços desejados
   - Orçamento

3. **Aluguel de Carros** (`/cotacao/carros`)
   - Locais de retirada
   - Categorias de veículos
   - Datas de locação

4. **Passeios** (`/cotacao/passeios`)
   - Tipos de experiências
   - Destinos turísticos
   - Personalização

5. **Seguro Viagem** (`/cotacao/seguro`)
   - Tipos de cobertura
   - Faixas etárias
   - Múltiplas viagens

### ✅ Painel Administrativo
- Login protegido (senha: `admin123`)
- Dashboard com estatísticas
- Gestão de leads com status
- Visualização de detalhes
- Sistema de acompanhamento

### ✅ Páginas Institucionais
- Página Sobre (`/sobre`)
- Página Contato (`/contato`)
- Design consistente

## 🎨 Design e UX

- **Cores**: Gradientes azul/roxo para credibilidade
- **Tipografia**: Clara e legível
- **Responsivo**: Funciona em todos os dispositivos
- **Acessibilidade**: Foco e navegação por teclado
- **Performance**: Otimizado para velocidade

## 📱 Responsividade

O site é 100% responsivo e funciona perfeitamente em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🔧 Tecnologias Utilizadas

- **Framework**: Next.js 15 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: React 19
- **Build**: Turbopack

## 🚀 Como Rodar o Projeto

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```
   Site estará disponível em `http://localhost:3000`

3. **Build para produção:**
   ```bash
   npm run build
   ```

4. **Iniciar produção:**
   ```bash
   npm run start
   ```

## 📊 Painel Administrativo

Acesse `/admin` com a senha `admin123` para:

- Ver estatísticas de leads
- Gerenciar cotações recebidas
- Atualizar status dos clientes
- Acompanhar pipeline de vendas

### Status dos Leads:
- **Novo**: Lead recém recebido
- **Em Análise**: Cotação sendo preparada
- **Cotado**: Cotação enviada ao cliente
- **Fechado**: Venda confirmada
- **Perdido**: Lead não convertido

## 🎯 Estratégias de Conversão Implementadas

1. **Urgência**: Promessas de resposta rápida (2 horas)
2. **Confiança**: Depoimentos e números de clientes
3. **Facilidade**: Formulários intuitivos multi-step
4. **Personalização**: Foco no público brasileiro nos EUA
5. **Credibilidade**: Design profissional e informações completas

## 📈 Próximos Passos Recomendados

1. **Integração com APIs reais** de companhias aéreas
2. **Sistema de pagamento** (Stripe/PayPal)
3. **Banco de dados real** (PostgreSQL/MongoDB)
4. **Sistema de emails** automatizados
5. **Analytics** e tracking de conversões
6. **Chat ao vivo** para suporte
7. **Blog** para SEO e conteúdo

## 🛡️ Segurança

- Validação de formulários
- Sanitização de inputs
- Proteção contra XSS
- Senha administrativa básica (upgrade recomendado)

## 📱 SEO e Marketing

- Meta tags otimizadas
- URLs amigáveis
- Estrutura semântica
- Performance otimizada
- Responsive design

## 💼 Público-Alvo Atendido

- Brasileiros residentes nos EUA
- Famílias visitando o Brasil
- Profissionais em viagem de negócios
- Estudantes em intercâmbio
- Aposentados visitando parentes

O site está pronto para receber leads reais e pode ser facilmente adaptado com integrações de APIs e banco de dados conforme necessário.