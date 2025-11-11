/**
 * Database Migration Runner
 * Applies all pending migrations to the Neon PostgreSQL database
 *
 * Usage:
 *   npx tsx scripts/run-database-migrations.ts
 *
 * Or add to package.json:
 *   "db:migrate": "tsx scripts/run-database-migrations.ts"
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface Migration {
  name: string;
  file: string;
  description: string;
}

const migrations: Migration[] = [
  {
    name: '003_add_database_constraints',
    file: '003_add_database_constraints.sql',
    description: 'Add data validation constraints (email, DOB, passenger count, seat uniqueness)',
  },
  {
    name: '004_audit_log',
    file: '004_audit_log.sql',
    description: 'Add booking audit log system with automatic tracking',
  },
  {
    name: '005_soft_delete',
    file: '005_soft_delete.sql',
    description: 'Add soft delete support with restore functionality',
  },
];

async function runMigrations() {
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   FLY2ANY DATABASE MIGRATION RUNNER${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  // Check for database URL
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(`${colors.red}✖ Error: Database URL not configured${colors.reset}`);
    console.error(`${colors.yellow}Please set POSTGRES_URL or DATABASE_URL in your environment${colors.reset}\n`);
    process.exit(1);
  }

  if (databaseUrl.includes('placeholder') || databaseUrl.includes('localhost')) {
    console.error(`${colors.red}✖ Error: Database URL is a placeholder${colors.reset}`);
    console.error(`${colors.yellow}Please configure a real Neon PostgreSQL connection string${colors.reset}`);
    console.error(`${colors.yellow}See DATABASE_SETUP.md for instructions${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.blue}→ Connecting to database...${colors.reset}`);
  const sql = neon(databaseUrl);

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log(`${colors.green}✓ Database connection successful${colors.reset}\n`);
  } catch (error: any) {
    console.error(`${colors.red}✖ Database connection failed:${colors.reset}`, error.message);
    process.exit(1);
  }

  // Create migration tracking table if it doesn't exist
  console.log(`${colors.blue}→ Checking migration tracking table...${colors.reset}`);
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        execution_time_ms INTEGER,
        status VARCHAR(20) DEFAULT 'success'
      )
    `;
    console.log(`${colors.green}✓ Migration tracking table ready${colors.reset}\n`);
  } catch (error: any) {
    console.error(`${colors.red}✖ Failed to create migration tracking table:${colors.reset}`, error.message);
    process.exit(1);
  }

  // Get list of already applied migrations
  const appliedMigrations = await sql`
    SELECT migration_name FROM schema_migrations WHERE status = 'success'
  `;
  const appliedNames = new Set(appliedMigrations.map((m: any) => m.migration_name));

  console.log(`${colors.cyan}Migrations Status:${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);

  let pendingCount = 0;
  let appliedCount = 0;
  let failedCount = 0;

  // Run each migration
  for (const migration of migrations) {
    const isApplied = appliedNames.has(migration.name);

    if (isApplied) {
      console.log(`${colors.green}✓${colors.reset} ${migration.name}`);
      console.log(`  ${colors.green}Already applied${colors.reset} - ${migration.description}\n`);
      appliedCount++;
      continue;
    }

    console.log(`${colors.yellow}→${colors.reset} ${migration.name}`);
    console.log(`  ${migration.description}`);

    const migrationPath = join(process.cwd(), 'lib', 'db', 'migrations', migration.file);

    try {
      const migrationSql = readFileSync(migrationPath, 'utf-8');
      const startTime = Date.now();

      // Execute migration
      await sql.unsafe(migrationSql);

      const executionTime = Date.now() - startTime;

      // Record successful migration
      await sql`
        INSERT INTO schema_migrations (migration_name, execution_time_ms, status)
        VALUES (${migration.name}, ${executionTime}, 'success')
      `;

      console.log(`  ${colors.green}✓ Applied successfully${colors.reset} (${executionTime}ms)\n`);
      pendingCount++;
    } catch (error: any) {
      console.error(`  ${colors.red}✖ Failed:${colors.reset}`, error.message);

      // Record failed migration
      try {
        await sql`
          INSERT INTO schema_migrations (migration_name, status)
          VALUES (${migration.name}, 'failed')
        `;
      } catch (e) {
        // Ignore error recording failure
      }

      console.log('');
      failedCount++;
    }
  }

  // Summary
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   MIGRATION SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✓ Already Applied: ${appliedCount}${colors.reset}`);
  console.log(`${colors.yellow}→ Newly Applied:   ${pendingCount}${colors.reset}`);
  console.log(`${colors.red}✖ Failed:          ${failedCount}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

  if (failedCount > 0) {
    console.error(`${colors.red}⚠ Some migrations failed. Please check the errors above.${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.green}✓ All migrations completed successfully!${colors.reset}\n`);

  // Show next steps
  console.log(`${colors.cyan}Next Steps:${colors.reset}`);
  console.log(`  1. Verify migrations: SELECT * FROM schema_migrations;`);
  console.log(`  2. Test constraints: See DATABASE_SETUP.md for examples`);
  console.log(`  3. Review audit log: SELECT * FROM booking_audit_log LIMIT 10;`);
  console.log(`  4. Check soft delete: SELECT * FROM v_active_bookings;\n`);
}

// Run migrations
runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`${colors.red}✖ Unexpected error:${colors.reset}`, error);
    process.exit(1);
  });
