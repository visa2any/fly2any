import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development
// to prevent exhausting your database connection limit.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is configured before creating Prisma client
const isDatabaseConfigured = !!process.env.DATABASE_URL;

// Only create PrismaClient if DATABASE_URL is configured
export const prisma = isDatabaseConfigured
  ? (globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    }))
  : null;

// Only attach to global if database is configured
if (isDatabaseConfigured && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as PrismaClient;
}

// Helper function to check if Prisma is available
export function isPrismaAvailable(): boolean {
  return isDatabaseConfigured && prisma !== null;
}

// Helper function to get Prisma client or throw error
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not configured. Please set DATABASE_URL environment variable.');
  }
  return prisma;
}

// Helper to log warning when database is not configured
if (!isDatabaseConfigured && process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  DATABASE_URL not configured. Prisma client not initialized. Database features will be unavailable.'
  );
}

export default prisma;
