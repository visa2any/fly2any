/**
 * 🗄️ PRISMA DATABASE CLIENT
 * Centralized database client with connection pooling
 */

import { PrismaClient } from '@prisma/client';
import { MockPrismaModels } from './mock-models';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create base Prisma client
const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Extend Prisma client with mock models for missing schema definitions
export const prisma = Object.assign(basePrisma, {
  // Add mock implementations for missing models
  systemAlert: MockPrismaModels.systemAlert,
  campaign: MockPrismaModels.campaign,
  campaignEmail: MockPrismaModels.campaignEmail,
  webhookEvent: MockPrismaModels.webhookEvent,
  webhookLog: MockPrismaModels.webhookLog,
  emailAnalyticsEvent: MockPrismaModels.emailAnalyticsEvent,
  domainReputation: MockPrismaModels.domainReputation,
  emailReport: MockPrismaModels.emailReport,
  reportConfig: MockPrismaModels.reportConfig,
  lead: MockPrismaModels.lead,
});

// Store in global for development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = basePrisma;
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;