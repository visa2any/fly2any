# 🔐 Configuração do Sistema Admin - Fly2Any

## 📋 Resumo

O sistema admin do Fly2Any está configurado com NextAuth.js para autenticação segura. Este documento explica como configurar e usar o usuário administrador.

## 🚀 Credenciais do Admin

### **Padrão (Desenvolvimento)**
- **Email:** `admin@fly2any.com`
- **Senha:** `fly2any2024!`
- **URL de Login:** `http://localhost:3000/admin/login`

## ⚙️ Configuração

### 1. Variáveis de Ambiente (.env.local)

```bash
# Admin User Configuration
ADMIN_EMAIL=admin@fly2any.com
ADMIN_PASSWORD=fly2any2024!

# NextAuth Configuration
NEXTAUTH_SECRET=fly2any-super-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
```

### 2. Executar Script de Configuração

```bash
# Usar credenciais padrão
node scripts/create-admin.js

# Ou definir credenciais personalizadas
node scripts/create-admin.js seu@email.com suaSenhaSegura123
```

## 🔒 Como Funciona

### Sistema de Autenticação
- **Provedor:** NextAuth.js Credentials Provider
- **Estratégia:** JWT (JSON Web Tokens)
- **Sessão:** 24 horas
- **Segurança:** Senhas podem ser hasheadas com bcrypt

### Fluxo de Login
1. Usuário acessa `/admin/login`
2. Insere email e senha
3. Sistema valida credenciais
4. JWT é criado e salvo como cookie seguro
5. Usuário é redirecionado para `/admin`

## 📁 Arquivos Importantes

### `/src/lib/auth.ts`
- Configuração principal do NextAuth
- Definição do provider de credenciais
- Callbacks de JWT e sessão
- Configurações de segurança

### `/src/app/admin/login/page.tsx`  
- Interface de login
- Validação de formulário
- Estados de loading e erro
- Redirecionamento automático

### `/src/middleware.ts`
- Proteção de rotas admin
- Verificação de autenticação
- Redirecionamento de usuários não autenticados

## 🛡️ Segurança

### Desenvolvimento
- Senha em texto plano (facilita desenvolvimento)
- Cookies não seguros (HTTP ok)
- Debug ativado

### Produção (Recomendações)
```bash
# Use senhas fortes e hasheadas
ADMIN_PASSWORD=$2b$12$hashedPasswordHere

# Secret único e seguro
NEXTAUTH_SECRET=your-super-secret-256-bit-key

# URL de produção
NEXTAUTH_URL=https://yourdomain.com

# Habilitar cookies seguros
NODE_ENV=production
```

## 🎯 Funcionalidades Admin

Após o login, o admin tem acesso a:

- **Dashboard:** Estatísticas e métricas
- **Leads:** Gerenciamento de leads capturados
- **Campanhas:** Email marketing
- **WhatsApp:** Configuração de bot
- **Configurações:** Sistema geral

## 🚨 Troubleshooting

### Erro: "Credenciais inválidas"
1. Verifique se `.env.local` existe
2. Confirme se `ADMIN_EMAIL` e `ADMIN_PASSWORD` estão corretos
3. Reinicie o servidor: `npm run dev`

### Erro: "Session não encontrada"
1. Limpe cookies do navegador
2. Verifique se `NEXTAUTH_SECRET` está definido
3. Confirme se `NEXTAUTH_URL` está correto

### Problemas de Redirecionamento
1. Verifique middleware em `/src/middleware.ts`
2. Confirme configuração de pages em `auth.ts`
3. Teste com modo incógnito

## 🔧 Comandos Úteis

```bash
# Verificar configuração admin
node scripts/create-admin.js

# Iniciar servidor de desenvolvimento
npm run dev

# Buildar para produção
npm run build

# Verificar variáveis de ambiente
cat .env.local | grep ADMIN
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique este documento
2. Confira logs do console (`F12` no navegador)
3. Teste com modo incógnito
4. Reinicie o servidor de desenvolvimento

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0  
**Sistema:** Fly2Any Admin Panel