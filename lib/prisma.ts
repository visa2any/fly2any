import { PrismaClient } from '@prisma/client';

// Prevent multiple database connections in development
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Build the correct DATABASE_URL with optimized pool parameters
function getDatabaseUrl(): string {
  // Priority: Supabase via Vercel > legacy
  const baseUrl = process.env.SUPABASE_POSTGRES_PRISMA_URL ||
                  process.env.SUPABASE_POSTGRES_URL ||
                  process.env.POSTGRES_URL ||
                  process.env.DATABASE_URL;

  if (!baseUrl) return '';

  try {
    const url = new URL(baseUrl);
    
    // Serverless critical: Use PgBouncer
    url.searchParams.set('pgbouncer', 'true');
    
    // Vercel Serverless best practice: Low connection limits per function instance
    // since instances auto-scale. High limits per instance = pool exhaustion.
    url.searchParams.set('connection_limit', '3');
    
    // Aggressive timeout: Pool hanging should fail fast rather than locking up
    url.searchParams.set('pool_timeout', '10');
    
    return url.toString();
  } catch {
    return baseUrl;
  }
}

const databaseUrl = getDatabaseUrl();

// Singleton Prisma Client
export const prisma =
  globalForPrisma.prisma ||
  (databaseUrl ? new PrismaClient({
    datasourceUrl: databaseUrl,
    log: ['error', 'warn'], // Remove aggressive logging in dev that slows connections
  }) : null);

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

export function isPrismaAvailable(): boolean {
  return prisma !== null;
}

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const stub = new Proxy({} as PrismaClient, {
      get(_, prop) {
        throw new Error(`Database not configured. Cannot call '${String(prop)}'.`);
      }
    });
    return stub;
  }
  return prisma;
}

export default prisma;
