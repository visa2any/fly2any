import postgres from 'postgres';

// Get database URL (Supabase or legacy Neon)
const dbUrl = process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Check if database is configured (and not a placeholder)
const isPostgresConfigured = !!(
  dbUrl &&
  !dbUrl.includes('placeholder') &&
  !dbUrl.includes('localhost')
);

// Create postgres connection with Supabase-compatible settings
const sql = isPostgresConfigured
  ? postgres(dbUrl!, {
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 30,
    })
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

// Note: postgres package uses tagged template literals
// Usage: await sql`SELECT * FROM users WHERE id = ${userId}`
//
// IMPORTANT: Always check isDatabaseAvailable() before using sql!
// Example:
//   if (!isDatabaseAvailable() || !sql) {
//     return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
//   }
//   const result = await sql`SELECT * FROM trips`;
