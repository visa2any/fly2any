# Configuração do Banco PostgreSQL

## Opção 1: Vercel PostgreSQL (Gratuito)
1. Acesse: https://vercel.com/dashboard
2. Vá para seu projeto fly2any
3. Storage → Create Database → PostgreSQL
4. Escolha o plano gratuito
5. Copie a URL de conexão

## Opção 2: Neon PostgreSQL (Gratuito)
1. Acesse: https://neon.tech
2. Criar conta gratuita
3. Criar novo projeto
4. Copiar connection string

## Opção 3: Railway PostgreSQL (Gratuito)
1. Acesse: https://railway.app
2. Criar conta gratuita  
3. New Project → PostgreSQL
4. Copiar connection string

## Configuração no Vercel
Depois de ter a connection string:
```bash
npx vercel env add POSTGRES_URL
npx vercel env add POSTGRES_PRISMA_URL  
npx vercel env add POSTGRES_URL_NON_POOLING
```

## Opção Rápida: Configurar agora
Execute os comandos abaixo: