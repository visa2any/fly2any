# PostgreSQL Database Setup Guide

**Date**: 2025-11-05
**Status**: Ready for Configuration
**Prisma Schema**: ✅ Complete

---

## 🎯 Quick Overview

Your Fly2Any platform has a complete Prisma schema with:
- ✅ NextAuth authentication models
- ✅ User preferences & personalization
- ✅ Saved searches & price alerts
- ✅ AI conversation persistence
- ✅ Analytics & tracking

**What's needed**: Configure PostgreSQL database connection

---

## 📋 Option 1: Local PostgreSQL (Recommended for Development)

### Prerequisites
- PostgreSQL 14+ installed on Windows
- pgAdmin (optional, for GUI management)

### Step 1: Install PostgreSQL (if not installed)

Download and install from: https://www.postgresql.org/download/windows/

**During installation**:
- Set password for `postgres` user (remember this!)
- Default port: `5432`
- Default database: `postgres`

### Step 2: Create Database

**Option A: Using pgAdmin**:
1. Open pgAdmin
2. Connect to PostgreSQL server (localhost)
3. Right-click "Databases" → Create → Database
4. Name: `fly2any`
5. Owner: `postgres`
6. Save

**Option B: Using Command Line**:
```powershell
# Open PowerShell as Administrator
psql -U postgres

# In psql prompt:
CREATE DATABASE fly2any;
\q
```

**Option C: Using SQL**:
```sql
CREATE DATABASE fly2any
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;
```

### Step 3: Configure Environment Variables

Edit `.env.local` in your project root:

```bash
# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fly2any"
POSTGRES_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/fly2any"

# Replace YOUR_PASSWORD with your actual PostgreSQL password
```

**Connection String Format**:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Example**:
```
postgresql://postgres:mypassword123@localhost:5432/fly2any
```

### Step 4: Run Prisma Migrations

```powershell
# Navigate to project directory
cd C:\Users\Power\fly2any-fresh

# Generate Prisma Client
npx prisma generate

# Create database tables (first time)
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate dev --name init

# Verify setup
npx prisma studio
```

This will:
1. Generate TypeScript types from your schema
2. Create all tables in PostgreSQL
3. Open Prisma Studio (database GUI) at http://localhost:5555

---

## 📋 Option 2: Vercel Postgres (Recommended for Production)

### Step 1: Create Vercel Postgres Database

```powershell
# Login to Vercel
vercel login

# Link your project
vercel link

# Create Postgres database
vercel postgres create fly2any-db

# This creates a database and automatically sets environment variables:
# - POSTGRES_URL
# - POSTGRES_PRISMA_URL
# - POSTGRES_URL_NON_POOLING
```

### Step 2: Pull Environment Variables

```powershell
# Pull environment variables to .env.local
vercel env pull .env.local
```

This automatically populates:
- `POSTGRES_URL`
- `DATABASE_URL`
- Other Vercel-managed variables

### Step 3: Run Migrations

```powershell
# Generate Prisma Client
npx prisma generate

# Push schema to Vercel Postgres
npx prisma db push

# Or use migrations
npx prisma migrate deploy
```

---

## 📋 Option 3: Docker PostgreSQL (Alternative)

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: fly2any-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: fly2any_dev_password
      POSTGRES_DB: fly2any
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: fly2any-pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@fly2any.local
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Start Docker Database

```powershell
# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres
```

### Connection String for Docker

```bash
DATABASE_URL="postgresql://postgres:fly2any_dev_password@localhost:5432/fly2any"
POSTGRES_URL="postgresql://postgres:fly2any_dev_password@localhost:5432/fly2any"
```

---

## 🔧 Prisma Commands Reference

### Database Operations

```powershell
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create a migration
npx prisma migrate dev --name add_feature_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Debugging

```powershell
# Validate schema
npx prisma validate

# Format schema
npx prisma format

# Check connection
npx prisma db pull

# View introspected schema
npx prisma db pull --print
```

---

## 📊 Database Models Overview

### Authentication (NextAuth)
- **User** - User accounts with OAuth support
- **Account** - OAuth provider accounts
- **Session** - Active user sessions
- **VerificationToken** - Email verification tokens

### Personalization
- **UserPreferences** - Travel preferences, UI settings, notifications
- **SavedSearch** - User's saved flight/hotel searches
- **PriceAlert** - Price tracking and notifications
- **RecentSearch** - Recently viewed destinations

### AI Conversations
- **AIConversation** - Conversation sessions
- **AIMessage** - Individual messages with consultant info

### Analytics
- **UserActivity** - Event tracking and analytics

---

## 🚀 Quick Start Script

Save this as `setup-database.ps1`:

```powershell
# PostgreSQL Database Setup Script for Fly2Any
# Run with: .\setup-database.ps1

Write-Host "🚀 Setting up Fly2Any PostgreSQL Database..." -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local not found. Copying from template..." -ForegroundColor Yellow
    Copy-Item ".env.local.template" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env.local and add your database credentials" -ForegroundColor Yellow
    exit 1
}

# Check if POSTGRES_URL is set
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "POSTGRES_URL=postgresql://") {
    Write-Host "✅ Database URL found in .env.local" -ForegroundColor Green
} else {
    Write-Host "❌ POSTGRES_URL not configured in .env.local" -ForegroundColor Red
    exit 1
}

# Generate Prisma Client
Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Push database schema
Write-Host "🗄️  Creating database tables..." -ForegroundColor Cyan
npx prisma db push

# Open Prisma Studio
Write-Host "🎨 Opening Prisma Studio..." -ForegroundColor Cyan
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host "🌐 Prisma Studio: http://localhost:5555" -ForegroundColor Cyan

npx prisma studio
```

Run with:
```powershell
.\setup-database.ps1
```

---

## ✅ Verification Checklist

After setup, verify everything works:

### 1. Check Environment Variables
```powershell
# In PowerShell
$env:POSTGRES_URL
# Should output: postgresql://postgres:password@localhost:5432/fly2any
```

### 2. Test Database Connection
```powershell
npx prisma db pull
# Should complete without errors
```

### 3. Check Tables
```powershell
npx prisma studio
# Opens GUI at http://localhost:5555
# You should see all models (users, ai_conversations, etc.)
```

### 4. Restart Dev Server
```powershell
npm run dev
# Check console - should NOT see database warnings
```

### 5. Test AI Conversations
1. Go to http://localhost:3000
2. Open AI assistant
3. Send a message
4. Check Prisma Studio - should see new conversation and messages

---

## 🔒 Security Best Practices

### Development
```bash
# .env.local (NOT committed to Git)
POSTGRES_URL="postgresql://postgres:dev_password_123@localhost:5432/fly2any"
```

### Production (Vercel)
1. Use Vercel Postgres (automatically secured)
2. Enable SSL connections
3. Use connection pooling
4. Set strong passwords
5. Enable row-level security (RLS)

### Connection Pooling

For production, use Prisma connection pooling:

```typescript
// lib/db/connection.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.POSTGRES_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solution 1**: Check PostgreSQL is running
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Start if stopped
Start-Service postgresql-x64-16  # Adjust version number
```

**Solution 2**: Verify connection string
```powershell
# Test connection with psql
psql -h localhost -U postgres -d fly2any
```

**Solution 3**: Check firewall
```powershell
# Allow PostgreSQL through Windows Firewall
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow
```

### Error: "Database 'fly2any' does not exist"

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE fly2any;"
```

### Error: "password authentication failed"

```bash
# Reset in .env.local with correct password
POSTGRES_URL="postgresql://postgres:CORRECT_PASSWORD@localhost:5432/fly2any"
```

### Error: "Migration failed"

```powershell
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## 📈 Performance Optimization

### Indexes

Your schema already includes optimized indexes:
```sql
@@index([userId])
@@index([userId, createdAt])
@@index([conversationId, timestamp])
```

### Connection Pooling

For high traffic, use PgBouncer:

```ini
# pgbouncer.ini
[databases]
fly2any = host=localhost port=5432 dbname=fly2any

[pgbouncer]
listen_port = 6432
listen_addr = localhost
auth_type = md5
auth_file = userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

### Query Optimization

```typescript
// Use select to limit returned fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// Use include for relations
const conversations = await prisma.aIConversation.findMany({
  include: {
    messages: {
      orderBy: { timestamp: 'asc' },
      take: 50,
    },
  },
});
```

---

## 📚 Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **NextAuth Adapter**: https://next-auth.js.org/adapters/prisma
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres

---

## ✅ Next Steps After Setup

1. ✅ Database configured and running
2. ✅ Tables created via Prisma migrations
3. ⏳ Test AI conversation persistence
4. ⏳ Verify multi-device sync works
5. ⏳ Set up automated backups
6. ⏳ Configure monitoring (Sentry, Datadog)
7. ⏳ Enable Redis caching for performance

---

*Generated by Senior Full Stack Dev Team*
*Last Updated: 2025-11-05*
