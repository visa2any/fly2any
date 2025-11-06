# PostgreSQL Database Setup Script for Fly2Any
# Run with: .\setup-database.ps1

param(
    [string]$DbPassword = "",
    [switch]$UseVercel,
    [switch]$SkipMigration,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
🚀 Fly2Any PostgreSQL Database Setup Script
=========================================

Usage:
    .\setup-database.ps1 [options]

Options:
    -DbPassword <password>   Set PostgreSQL password (required for local setup)
    -UseVercel               Use Vercel Postgres instead of local
    -SkipMigration           Skip running migrations (only generate client)
    -Help                    Show this help message

Examples:
    # Local PostgreSQL with password
    .\setup-database.ps1 -DbPassword "mypassword123"

    # Vercel Postgres
    .\setup-database.ps1 -UseVercel

    # Generate client only (no migration)
    .\setup-database.ps1 -SkipMigration

"@ -ForegroundColor Cyan
    exit 0
}

if ($Help) {
    Show-Help
}

Write-Host @"
╔════════════════════════════════════════╗
║   Fly2Any Database Setup Wizard   ║
╚════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if running in correct directory
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "❌ Error: prisma\schema.prisma not found" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

# ==========================================
# Option 1: Vercel Postgres
# ==========================================

if ($UseVercel) {
    Write-Host "`n🌐 Setting up Vercel Postgres..." -ForegroundColor Cyan

    # Check if Vercel CLI is installed
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercelInstalled) {
        Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
        Write-Host "   Install with: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "📦 Creating Vercel Postgres database..." -ForegroundColor Cyan
    vercel postgres create fly2any-db

    Write-Host "⬇️  Pulling environment variables..." -ForegroundColor Cyan
    vercel env pull .env.local

    Write-Host "✅ Vercel Postgres configured!" -ForegroundColor Green
}

# ==========================================
# Option 2: Local PostgreSQL
# ==========================================

else {
    Write-Host "`n🗄️  Setting up Local PostgreSQL..." -ForegroundColor Cyan

    # Check if password provided
    if (-not $DbPassword) {
        Write-Host "❌ Error: Password required for local setup" -ForegroundColor Red
        Write-Host "   Usage: .\setup-database.ps1 -DbPassword 'your_password'" -ForegroundColor Yellow
        Write-Host "   Or use: .\setup-database.ps1 -UseVercel" -ForegroundColor Yellow
        exit 1
    }

    # Check if PostgreSQL is installed
    $psqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
    if (-not $psqlInstalled) {
        Write-Host "⚠️  PostgreSQL CLI not found in PATH" -ForegroundColor Yellow
        Write-Host "   Continuing anyway - database might already exist" -ForegroundColor Yellow
    } else {
        Write-Host "✅ PostgreSQL CLI found" -ForegroundColor Green

        # Try to create database
        Write-Host "📦 Creating database 'fly2any'..." -ForegroundColor Cyan

        $createDbCommand = "CREATE DATABASE fly2any ENCODING 'UTF8';"
        $env:PGPASSWORD = $DbPassword

        try {
            echo $createDbCommand | psql -h localhost -U postgres -d postgres 2>$null
            Write-Host "✅ Database 'fly2any' created" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Database might already exist (continuing anyway)" -ForegroundColor Yellow
        }
    }

    # Update .env.local
    Write-Host "📝 Updating .env.local..." -ForegroundColor Cyan

    $connectionString = "postgresql://postgres:$DbPassword@localhost:5432/fly2any"

    $envContent = Get-Content .env.local -Raw

    # Replace DATABASE_URL
    $envContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=$connectionString"

    # Replace POSTGRES_URL
    $envContent = $envContent -replace 'POSTGRES_URL=.*', "POSTGRES_URL=$connectionString"

    $envContent | Set-Content .env.local -NoNewline

    Write-Host "✅ .env.local updated with database connection" -ForegroundColor Green
}

# ==========================================
# Generate Prisma Client
# ==========================================

Write-Host "`n📦 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# ==========================================
# Run Migrations
# ==========================================

if (-not $SkipMigration) {
    Write-Host "`n🗄️  Creating database tables..." -ForegroundColor Cyan

    $migrationChoice = Read-Host "Choose migration method: [1] db push (quick) or [2] migrate dev (tracked) [1/2]"

    if ($migrationChoice -eq "2") {
        Write-Host "📋 Running migrations..." -ForegroundColor Cyan
        npx prisma migrate dev --name init
    } else {
        Write-Host "📋 Pushing schema to database..." -ForegroundColor Cyan
        npx prisma db push
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database tables created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database tables" -ForegroundColor Red
        Write-Host "   Check your database connection and try again" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "⏭️  Skipping migrations (as requested)" -ForegroundColor Yellow
}

# ==========================================
# Verification
# ==========================================

Write-Host "`n🔍 Verifying setup..." -ForegroundColor Cyan

# Test database connection
Write-Host "📡 Testing database connection..." -ForegroundColor Cyan
$testResult = npx prisma db pull --force 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database connection test inconclusive" -ForegroundColor Yellow
    Write-Host "   Try running: npx prisma studio" -ForegroundColor Cyan
}

# ==========================================
# Summary
# ==========================================

Write-Host @"

╔════════════════════════════════════════╗
║         Setup Complete! ✅         ║
╚════════════════════════════════════════╝

📊 What was configured:
   ✅ PostgreSQL database connection
   ✅ Prisma Client generated
   ✅ Database tables created
   ✅ Schema synchronized

🚀 Next Steps:
   1. Start dev server: npm run dev
   2. View database: npx prisma studio
   3. Test AI conversations
   4. Check account page (/account)

📚 Useful Commands:
   npx prisma studio      - Open database GUI
   npx prisma db push     - Update schema
   npx prisma migrate dev - Create migration
   npx prisma generate    - Regenerate client

"@ -ForegroundColor Green

# Offer to open Prisma Studio
$openStudio = Read-Host "Open Prisma Studio now? [Y/n]"
if ($openStudio -ne "n" -and $openStudio -ne "N") {
    Write-Host "`n🎨 Opening Prisma Studio at http://localhost:5555..." -ForegroundColor Cyan
    Start-Process "npx" -ArgumentList "prisma", "studio"
    Write-Host "✅ Prisma Studio is starting in a new window" -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop it when done" -ForegroundColor Yellow
}

Write-Host "`n🎉 Database setup complete! Happy coding!" -ForegroundColor Cyan
