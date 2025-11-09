#!/usr/bin/env node

/**
 * Smart Prisma Client Generator
 *
 * This script ensures Prisma Client generation succeeds even if POSTGRES_URL
 * is not set (e.g., during build time). Prisma generate doesn't actually
 * connect to the database - it just needs a valid URL format.
 */

const { execSync } = require('child_process');

// Check if POSTGRES_URL is set
if (!process.env.POSTGRES_URL) {
  console.log('⚠️  POSTGRES_URL not found in environment');
  console.log('📝 Using placeholder URL for Prisma Client generation');
  console.log('💡 This is safe - prisma generate does not connect to the database\n');

  // Set a placeholder URL for schema parsing
  process.env.POSTGRES_URL = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
}

// Run prisma generate
try {
  console.log('🔄 Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('✅ Prisma Client generated successfully!\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to generate Prisma Client');
  console.error(error.message);
  process.exit(1);
}
