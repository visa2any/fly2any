import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...\n');

    // Try to query each table
    const tables = [
      { name: 'users', query: () => prisma.user.count() },
      { name: 'notifications', query: () => prisma.notification.count() },
      { name: 'ai_conversations', query: () => prisma.aIConversation.count() },
      { name: 'wishlist_items', query: () => prisma.wishlistItem.count() },
      { name: 'push_subscriptions', query: () => prisma.pushSubscription.count() },
    ];

    for (const table of tables) {
      try {
        const count = await table.query();
        console.log(`✅ Table "${table.name}" exists (${count} records)`);
      } catch (error: any) {
        console.log(`❌ Table "${table.name}" MISSING or ERROR:`);
        console.log(`   ${error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
