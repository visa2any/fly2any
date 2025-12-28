import { neon, neonConfig, NeonQueryFunction } from '@neondatabase/serverless';

// Configure Neon for edge runtime
neonConfig.fetchConnectionCache = true;

// Get database URL (Supabase or legacy Neon)
const dbUrl = process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Check if database is configured (and not a placeholder)
const isPostgresConfigured = !!(
  dbUrl &&
  !dbUrl.includes('placeholder') &&
  !dbUrl.includes('localhost')
);

// Only create Neon connection if database is configured
// Works with both Neon and Supabase (compatible Postgres)
const sql: NeonQueryFunction<false, false> | null = isPostgresConfigured
  ? neon(dbUrl!)
  : null;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return isPostgresConfigured && sql !== null;
}

// Log warning in development if not configured
if (!isPostgresConfigured && process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  Database URL not configured (SUPABASE_POSTGRES_URL/POSTGRES_URL). Database features will use demo data.'
  );
}

export { sql };

// Note: Neon serverless uses tagged template literals
// Usage: await sql`SELECT * FROM users WHERE id = ${userId}`
// Not: await sql('SELECT * FROM users WHERE id = $1', [userId])
//
// IMPORTANT: Always check isDatabaseAvailable() before using sql!
// Example:
//   if (!isDatabaseAvailable() || !sql) {
//     return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
//   }
//   const result = await sql`SELECT * FROM trips`;
