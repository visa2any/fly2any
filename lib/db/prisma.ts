/**
 * Prisma Client Singleton - CONSOLIDATED
 * Re-exports from @/lib/prisma to ensure single instance across entire app
 * This prevents connection pool exhaustion from multiple Prisma clients
 */

// Re-export everything from the main prisma client
export { prisma, isPrismaAvailable, getPrismaClient, default } from '@/lib/prisma';
