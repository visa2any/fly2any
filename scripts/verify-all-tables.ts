import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAllTables() {
  const expectedTables = [
    // Phase 7 tables
    'users', 'accounts', 'sessions', 'verification_tokens',
    'user_preferences', 'saved_searches', 'price_alerts', 'recent_searches',
    'user_activities', 'ai_conversations', 'ai_messages',
    'user_sessions', 'login_history', 'price_history', 'price_monitor_logs',
    'wishlist_items', 'push_subscriptions', 'notifications',
    // Phase 8 tables
    'analytics_events', 'metric_snapshots', 'price_predictions', 'ml_models',
    'feature_flags', 'experiment_participations', 'performance_metrics',
    'error_logs', 'conversion_funnels', 'user_cohorts',
    // Phase 9 tables
    'admin_users', 'audit_logs', 'deals', 'destinations',
    'email_templates', 'health_checks', 'search_suggestions'
  ];

  console.log('🔍 Verifying all expected database tables...\n');

  const missingTables: string[] = [];
  const existingTables: string[] = [];

  for (const tableName of expectedTables) {
    try {
      // Query the information_schema to check if table exists
      const result = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
        )`
      );

      if (result[0].exists) {
        existingTables.push(tableName);
      } else {
        missingTables.push(tableName);
      }
    } catch (error: any) {
      console.error(`Error checking table ${tableName}:`, error.message);
      missingTables.push(tableName);
    }
  }

  console.log(`\n✅ Found ${existingTables.length} existing tables:`);
  existingTables.forEach(table => console.log(`   - ${table}`));

  if (missingTables.length > 0) {
    console.log(`\n❌ Missing ${missingTables.length} tables:`);
    missingTables.forEach(table => console.log(`   - ${table}`));
  } else {
    console.log('\n🎉 All tables exist!');
  }

  await prisma.$disconnect();
  return { existingTables, missingTables };
}

verifyAllTables();
