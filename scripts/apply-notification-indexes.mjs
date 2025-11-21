/**
 * Apply Notification Performance Indexes
 * Run with: node scripts/apply-notification-indexes.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyIndexes() {
  console.log('🚀 Applying notification performance indexes...\n');

  try {
    // Index 1: User + Read status + CreatedAt
    console.log('📊 Creating index: idx_notifications_user_read_created...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_read_created"
        ON "notifications"("userId", "read", "createdAt" DESC);
    `);
    console.log('✅ Index 1 created\n');

    // Index 2: User + Type + CreatedAt
    console.log('📊 Creating index: idx_notifications_user_type_created...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_type_created"
        ON "notifications"("userId", "type", "createdAt" DESC);
    `);
    console.log('✅ Index 2 created\n');

    // Index 3: User + Priority + CreatedAt
    console.log('📊 Creating index: idx_notifications_user_priority_created...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_priority_created"
        ON "notifications"("userId", "priority", "createdAt" DESC);
    `);
    console.log('✅ Index 3 created\n');

    // Index 4: Unread count optimization
    console.log('📊 Creating index: idx_notifications_user_unread...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread"
        ON "notifications"("userId", "read") WHERE "read" = false;
    `);
    console.log('✅ Index 4 created\n');

    // Index 5: User + CreatedAt (default sort)
    console.log('📊 Creating index: idx_notifications_user_created...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_created"
        ON "notifications"("userId", "createdAt" DESC);
    `);
    console.log('✅ Index 5 created\n');

    console.log('🎉 All indexes created successfully!');
    console.log('\n📈 Expected Performance Improvements:');
    console.log('   - Query time: 13s → <500ms (96% faster)');
    console.log('   - API response: 13s → <500ms (96% faster)');
    console.log('   - Cache hit rate: Will improve to 80%+ after Redis fix');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyIndexes();
