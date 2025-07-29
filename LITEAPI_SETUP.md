# 🏨 Configuração da LiteAPI - Guia Completo

## 📋 Passos para Configurar a LiteAPI

### 1. 📝 Criar Conta na LiteAPI

1. Acesse [https://dashboard.liteapi.travel/](https://dashboard.liteapi.travel/)
2. Clique em "Sign Up" para criar uma nova conta
3. Preencha as informações básicas:
   - Nome completo
   - Email válido
   - Senha segura
4. Confirme sua conta através do email recebido

### 2. 🔧 Obter Chaves do Ambiente Sandbox

1. Faça login no [dashboard da LiteAPI](https://dashboard.liteapi.travel/)
2. Navegue até **Profile Settings** no menu
3. Localize a seção **Sandbox Key**
4. Copie as chaves:
   - **Public Key** (usado para consultas públicas)
   - **Private Key** (usado para operações privadas como booking)

### 3. ⚙️ Configurar Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env.local`:

```env
# LiteAPI Configuration for Hotel Booking
LITEAPI_ENVIRONMENT=sandbox

# Chaves Sandbox (para desenvolvimento e testes)
LITEAPI_SANDBOX_PUBLIC_KEY=sua-chave-publica-sandbox
LITEAPI_SANDBOX_PRIVATE_KEY=sua-chave-privada-sandbox
```

### 4. 🧪 Testar Integração no Ambiente Sandbox

1. Inicie seu servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a página de hotéis: `http://localhost:3000/hoteis`

3. Faça uma busca de teste para verificar se a API está funcionando

4. Verifique os logs no console para confirmar:
   ```
   🧪 Using LiteAPI Sandbox environment
   📡 Fazendo requisição para: /api/hotels/search?...
   ✅ Hotéis encontrados via API: X
   ```

### 5. 💳 Migrar para Produção (Opcional)

⚠️ **Importante**: Só faça isso quando estiver pronto para usar dados reais e processar transações.

1. **Adicionar Cartão de Crédito**:
   - No dashboard, vá em **Payment Methods**
   - Adicione um cartão de crédito válido
   - Confirme e verifique as informações

2. **Obter Chaves de Produção**:
   - Após verificação do cartão, acesse **Profile Settings**
   - Localize a seção **Production Key**
   - Copie as chaves de produção

3. **Configurar Ambiente de Produção**:
   ```env
   # Alterar para produção
   LITEAPI_ENVIRONMENT=production
   
   # Chaves Production
   LITEAPI_PRODUCTION_PUBLIC_KEY=sua-chave-publica-producao
   LITEAPI_PRODUCTION_PRIVATE_KEY=sua-chave-privada-producao
   ```

## 🔍 Status Atual da Configuração

### ✅ Configurações Implementadas

- [x] Cliente LiteAPI configurado (`src/lib/hotels/liteapi-client.ts`)
- [x] API Route implementada (`src/app/api/hotels/search/route.ts`)
- [x] Tipos TypeScript completos (`src/types/hotels.ts`)
- [x] Sistema de fallback para quando API está indisponível
- [x] Variáveis de ambiente configuradas
- [x] Validação de parâmetros de busca
- [x] Cache de requisições (5 minutos TTL)
- [x] Retry automático em caso de falha
- [x] Logs detalhados para debug

### 🏗️ Funcionalidades Disponíveis

- **Busca de Hotéis**: Pesquisa por destino, datas, hóspedes
- **Filtros Avançados**: Preço, estrelas, amenidades, tipos de pensão
- **Detalhes do Hotel**: Informações completas, imagens, comodidades
- **Tarifas e Quartos**: Diferentes tipos de quarto e preços
- **Sistema de Reserva**: Pré-booking e confirmação (em desenvolvimento)

### 🚀 Próximos Passos

1. **Testar com Chaves Reais**: Substituir as chaves de exemplo pelas suas
2. **Implementar Booking**: Completar o fluxo de reserva
3. **Otimizar Performance**: Implementar paginação e otimizações
4. **Monitoramento**: Adicionar logs e métricas de uso

## 🔧 Troubleshooting

### Erro 503 - Service Unavailable
- **Causa**: API da LiteAPI temporariamente indisponível
- **Solução**: O sistema usa dados mock automaticamente
- **Logs**: `⚠️ API indisponível, usando dados de demonstração`

### Erro de Chaves Inválidas
- **Causa**: Chaves incorretas ou não configuradas
- **Solução**: Verificar se as chaves estão corretas no `.env.local`
- **Logs**: `❌ Production LiteAPI keys not found`

### Sem Resultados de Busca
- **Causa**: Destino não encontrado ou sem disponibilidade
- **Soluções**: 
  - Usar destinos populares: "Rio de Janeiro", "São Paulo", "Paris"
  - Verificar datas (devem ser futuras)
  - Tentar diferentes combinações de filtros

## 📞 Suporte

- **Dashboard LiteAPI**: [https://dashboard.liteapi.travel/](https://dashboard.liteapi.travel/)
- **Documentação**: [https://docs.liteapi.travel/](https://docs.liteapi.travel/)
- **Logs do Sistema**: Verificar console do navegador e servidor

---
*Atualizado em: Julho 2025*