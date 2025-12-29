import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development
// to prevent exhausting your database connection limit.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if database is configured (Supabase, Neon, or other Postgres)
// Use PRISMA_URL for PgBouncer compatibility
const isDatabaseConfigured = !!(process.env.SUPABASE_POSTGRES_PRISMA_URL || process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL);

/**
 * Get the database URL with proper connection pooling settings for serverless
 * Neon/Vercel PostgreSQL require specific connection settings
 */
function getDatabaseUrl(): string | undefined {
  const baseUrl = process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!baseUrl) return undefined;

  // Parse and enhance the URL with pooling settings if not already present
  try {
    const url = new URL(baseUrl);

    // Add connection pooling parameters for Neon serverless
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '10');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '30');
    }
    // Prevent idle connections from being closed prematurely
    if (!url.searchParams.has('idle_in_transaction_session_timeout')) {
      url.searchParams.set('idle_in_transaction_session_timeout', '60000');
    }
    // Keep connections alive
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', '30');
    }

    return url.toString();
  } catch {
    // If URL parsing fails, return original
    return baseUrl;
  }
}

// Only create PrismaClient if database is configured
// Use direct URL from env - Supabase already handles pooling
export const prisma = isDatabaseConfigured
  ? (globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      // Optimize for serverless environments (Vercel/Neon)
      __internal: {
        engine: {
          // @ts-ignore - Internal Prisma optimization
          binaryTargets: ['native'],
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
