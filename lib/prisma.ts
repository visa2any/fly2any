import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development
// to prevent exhausting your database connection limit.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL or POSTGRES_URL is configured before creating Prisma client
const isDatabaseConfigured = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);

// Only create PrismaClient if DATABASE_URL is configured
export const prisma = isDatabaseConfigured
  ? (globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
        },
      },
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
// Returns a safe stub during build time to prevent build failures
// At runtime (when handlers are actually called), will throw if database is not configured
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    // During build, Next.js imports API routes but doesn't execute handlers
    // Return a stub that will pass type checking but never gets called
    // At runtime, if this stub is actually used, it will fail with clear errors
    const stub = new Proxy({} as PrismaClient, {
      get(_target, prop) {
        // If any method is actually called (at runtime), throw a clear error
        throw new Error(
          `Database not configured. Cannot call Prisma method '${String(prop)}'. ` +
          'Please set DATABASE_URL environment variable.'
        );
      }
    });
    return stub;
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
