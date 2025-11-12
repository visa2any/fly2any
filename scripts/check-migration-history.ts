import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMigrationHistory() {
  try {
    console.log('📜 Checking migration history in database...\n');

    // Query the _prisma_migrations table
    const migrations = await prisma.$queryRaw<Array<{
      id: string;
      checksum: string;
      finished_at: Date | null;
      migration_name: string;
      logs: string | null;
      rolled_back_at: Date | null;
      started_at: Date;
      applied_steps_count: number;
    }>>`SELECT * FROM "_prisma_migrations" ORDER BY "started_at" DESC`;

    if (migrations.length === 0) {
      console.log('⚠️  No migrations found in _prisma_migrations table!');
      console.log('   This suggests migrations have never been applied.\n');
    } else {
      console.log(`Found ${migrations.length} migration(s):\n`);

      migrations.forEach((migration, index) => {
        const status = migration.finished_at
          ? '✅ Completed'
          : migration.rolled_back_at
            ? '🔄 Rolled back'
            : '❌ Failed/Incomplete';

        console.log(`${index + 1}. ${migration.migration_name}`);
        console.log(`   Status: ${status}`);
        console.log(`   Started: ${migration.started_at}`);
        if (migration.finished_at) {
          console.log(`   Finished: ${migration.finished_at}`);
        }
        console.log(`   Applied steps: ${migration.applied_steps_count}`);
        if (migration.logs) {
          console.log(`   Logs: ${migration.logs}`);
        }
        console.log('');
      });
    }

  } catch (error: any) {
    console.error('❌ Error checking migration history:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrationHistory();
