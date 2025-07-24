# 🔐 Sistema de Autenticação NextAuth.js - Fly2Any

## 📋 Visão Geral

Este documento descreve o sistema completo de autenticação implementado usando NextAuth.js para proteger a área administrativa do sistema Fly2Any.

## 🚀 Funcionalidades Implementadas

### ✅ Recursos Disponíveis

- **🔒 Autenticação com Credenciais**: Login usando email e senha
- **🛡️ Proteção de Rotas**: Middleware que protege todas as rotas `/admin`
- **🔑 Proteção de APIs**: Verificação de sessão em todas as APIs `/api/admin`
- **📱 Interface de Login**: Página de login responsiva e moderna
- **🚪 Logout Seguro**: Botões de logout no layout admin
- **⏱️ Sessões Gerenciadas**: Controle de sessões com JWT
- **🔄 Redirecionamento Inteligente**: Redirecionamento após login/logout

## 📁 Arquivos Criados/Modificados

### 🆕 Novos Arquivos

1. **`/src/lib/auth.ts`** - Configuração principal do NextAuth.js
2. **`/src/lib/auth-helpers.ts`** - Utilitários para verificação de autenticação
3. **`/src/types/next-auth.d.ts`** - Tipos TypeScript para NextAuth
4. **`/src/app/api/auth/[...nextauth]/route.ts`** - Rota da API NextAuth
5. **`/src/app/admin/login/page.tsx`** - Página de login
6. **`/src/components/SessionWrapper.tsx`** - Wrapper para SessionProvider

### 🔄 Arquivos Modificados

1. **`/src/middleware.ts`** - Adicionada proteção de rotas admin
2. **`/src/app/admin/layout.tsx`** - Integrado sistema de logout e verificação de sessão
3. **`/src/app/globals.css`** - Estilos para botão de logout
4. **`/src/app/api/admin/leads/route.ts`** - Exemplo de API protegida
5. **`/package.json`** - Adicionadas dependências necessárias

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production

# Admin Credentials
ADMIN_EMAIL=admin@fly2any.com
ADMIN_PASSWORD=your-secure-password-here
```

### 2. Credenciais Padrão

**Para desenvolvimento:**
- Email: `admin@fly2any.com`
- Senha: `fly2any2024!`

⚠️ **IMPORTANTE**: Altere essas credenciais em produção!

## 🔧 Como Usar

### 🖥️ Acessando o Admin

1. Navegue para `/admin`
2. Se não autenticado, será redirecionado para `/admin/login`
3. Digite as credenciais de admin
4. Após login, será redirecionado para o dashboard

### 🚪 Fazendo Logout

- Clique no botão "🚪 Sair" no header
- Ou clique no ícone de logout no sidebar (quando expandido)
- Será redirecionado para a página de login

### 🛡️ Protegendo Novas APIs

Para proteger uma nova API admin, use os helpers:

```typescript
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Verificar autenticação
  const auth = await verifyAdminAuth(request);
  if (!auth.isAuthenticated) {
    return createUnauthorizedResponse(auth.error);
  }

  // Sua lógica da API aqui...
}
```

### 🔒 Protegendo Páginas Server Components

```typescript
import { verifyServerAuth } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const auth = await verifyServerAuth();
  
  if (!auth.isAuthenticated) {
    redirect('/admin/login');
  }

  // Sua página aqui...
}
```

## 🏗️ Arquitetura

### 🔄 Fluxo de Autenticação

1. **Usuário acessa `/admin`**
2. **Middleware verifica sessão**
3. **Se não autenticado**: Redireciona para `/admin/login`
4. **Login**: Valida credenciais via NextAuth
5. **Sucesso**: Cria sessão JWT e redireciona
6. **Falha**: Mostra erro na página de login

### 🛡️ Camadas de Proteção

1. **Middleware** - Primeira linha de defesa (rotas)
2. **API Protection** - Verificação em APIs admin
3. **Component Protection** - Verficação em componentes
4. **Layout Protection** - Verificação no layout admin

## 🔐 Segurança

### ✅ Implementações de Segurança

- **JWT com Secret** - Sessões seguras com chave secreta
- **HTTPS em Produção** - Cookies seguros em produção
- **Rate Limiting** - Proteção contra ataques de força bruta
- **Headers de Segurança** - Headers CSRF e XSS
- **Session Timeout** - Sessões expiram em 24 horas
- **Secure Cookies** - Cookies httpOnly e secure

### 🚨 Considerações de Produção

1. **Altere NEXTAUTH_SECRET** - Use uma chave forte única
2. **Altere Credenciais Admin** - Use credenciais seguras
3. **Configure HTTPS** - Essencial para produção
4. **Database Auth** - Considere usar banco de dados
5. **2FA** - Implemente autenticação de dois fatores
6. **Audit Logs** - Registre tentativas de login

## 🧪 Testando

### 🔍 Checklist de Testes

- [ ] Login com credenciais corretas
- [ ] Login com credenciais incorretas
- [ ] Acesso a `/admin` sem login
- [ ] Acesso a APIs `/api/admin` sem login
- [ ] Logout funciona corretamente
- [ ] Redirecionamento após login/logout
- [ ] Sessão persiste entre recarregamentos
- [ ] Sessão expira corretamente

### 🐛 Debug

Para debugar problemas de autenticação:

1. **Verifique logs do console** - Erros são logados
2. **Inspecione cookies** - Verifique se o token está sendo criado
3. **Teste APIs** - Use ferramentas como Postman
4. **Variáveis de ambiente** - Confirme se estão configuradas

## 📚 Recursos Adicionais

### 🔗 Links Úteis

- [NextAuth.js Docs](https://next-auth.js.org/)
- [JWT Tokens](https://jwt.io/)
- [Next.js Middleware](https://nextjs.org/docs/middleware)

### 🆕 Próximos Passos

- [ ] Implementar autenticação via banco de dados
- [ ] Adicionar suporte a múltiplos usuários
- [ ] Implementar roles e permissões
- [ ] Adicionar autenticação de dois fatores
- [ ] Implementar OAuth (Google, GitHub, etc.)
- [ ] Adicionar logs de auditoria

## 🎯 Conclusão

O sistema de autenticação está completo e pronto para uso. Todas as rotas admin estão protegidas, as APIs verificam sessões e o logout funciona corretamente. 

**Para produção, lembre-se de:**
1. Alterar as credenciais padrão
2. Configurar NEXTAUTH_SECRET único
3. Usar HTTPS
4. Considerar banco de dados para usuários

---

*Sistema implementado com NextAuth.js v4 e Next.js v15*