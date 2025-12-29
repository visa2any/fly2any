#!/usr/bin/env node
// Set DATABASE_URL from Supabase vars before prisma generate
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.SUPABASE_POSTGRES_PRISMA_URL ||
    process.env.SUPABASE_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://placeholder:placeholder@localhost:5432/placeholder';
}

require('child_process').execSync('npx prisma generate', {
  stdio: 'inherit',
  env: process.env
});
