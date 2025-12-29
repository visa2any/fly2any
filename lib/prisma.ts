import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Build the correct DATABASE_URL with serverless parameters
function buildDatabaseUrl(): string | undefined {
  // Priority: Supabase via Vercel > legacy
  const baseUrl = process.env.SUPABASE_POSTGRES_PRISMA_URL ||
                  process.env.SUPABASE_POSTGRES_URL ||
                  process.env.POSTGRES_URL ||
                  process.env.DATABASE_URL;

  if (!baseUrl) return undefined;

  try {
    const url = new URL(baseUrl);
    // Required for serverless + PgBouncer
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connection_limit', '1');
    url.searchParams.set('pool_timeout', '30');
    return url.toString();
  } catch {
    return baseUrl;
  }
}

const databaseUrl = buildDatabaseUrl();
const isDatabaseConfigured = !!databaseUrl;

// Create Prisma client with runtime URL
// Note: PrismaClient uses lazy connections internally - it doesn't actually
// connect to the database until a query is made
export const prisma = isDatabaseConfigured
  ? (globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasourceUrl: databaseUrl,
    }))
  : null;

if (isDatabaseConfigured && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as PrismaClient;
}

export function isPrismaAvailable(): boolean {
  return isDatabaseConfigured && prisma !== null;
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
