/**
 * Prisma Client Singleton
 * Ensures single instance across hot-reloads during development
 */

import { PrismaClient } from '@prisma/client';

// Check if POSTGRES_URL is configured
const isPostgresConfigured = !!(
  process.env.POSTGRES_URL &&
  !process.env.POSTGRES_URL.includes('placeholder') &&
  !process.env.POSTGRES_URL.includes('localhost')
);

// Log warning if database not configured
if (!isPostgresConfigured && process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  POSTGRES_URL not configured. AI conversation persistence will use localStorage only.'
  );
}

// Declare global prisma to avoid multiple instances
declare global {
  var prisma: PrismaClient | undefined | null;
}

// Create Prisma client only if database is configured
export const prisma = isPostgresConfigured
  ? (global.prisma ||
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      }))
  : null;

// In development, store on global to avoid creating new instances on hot-reload
if (process.env.NODE_ENV !== 'production' && isPostgresConfigured) {
  global.prisma = prisma as PrismaClient;
}

/**
 * Helper to check if Prisma is available
 */
export function isPrismaAvailable(): boolean {
  return prisma !== null;
}

export default prisma;
