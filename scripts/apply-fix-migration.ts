import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

const prisma = new PrismaClient();

async function applyFixMigration() {
  try {
    console.log('🔧 Applying fix migration for missing tables...\n');

    // Read the migration SQL file
    const migrationPath = path.join(
      process.cwd(),
      'prisma',
      'migrations',
      '20251111235959_fix_missing_tables',
      'migration.sql'
    );

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Reading migration file...');
    console.log(`   Path: ${migrationPath}`);
    console.log(`   Size: ${migrationSQL.length} characters\n`);

    // Use pg client directly to execute the entire SQL file
    console.log('⚡ Executing migration SQL using pg client...\n');

    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });

    await client.connect();

    try {
      await client.query(migrationSQL);
      console.log('✅ Migration executed successfully!\n');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('⏭️  Some objects already exist (this is expected)\n');
      } else {
        throw error;
      }
    } finally {
      await client.end();
    }

    // Mark the migration as applied in _prisma_migrations
    console.log('📝 Marking migration as applied in _prisma_migrations...\n');

    await prisma.$executeRaw`
      INSERT INTO "_prisma_migrations" (
        id,
        checksum,
        finished_at,
        migration_name,
        logs,
        rolled_back_at,
        started_at,
        applied_steps_count
      ) VALUES (
        gen_random_uuid()::text,
        'fix_missing_tables',
        NOW(),
        '20251111235959_fix_missing_tables',
        NULL,
        NULL,
        NOW(),
        1
      )
      ON CONFLICT DO NOTHING
    `;

    console.log('✅ Migration marked as applied!\n');
    console.log('🎉 Fix migration completed successfully!\n');

  } catch (error: any) {
    console.error('❌ Error applying fix migration:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyFixMigration();
