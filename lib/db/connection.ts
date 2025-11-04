import { neon, neonConfig, NeonQueryFunction } from '@neondatabase/serverless';

// Configure Neon for edge runtime
neonConfig.fetchConnectionCache = true;

// Check if POSTGRES_URL is configured
const isPostgresConfigured = !!process.env.POSTGRES_URL;

// Only create Neon connection if POSTGRES_URL is configured
// Export null if not configured to prevent import-time errors
const sql: NeonQueryFunction<false, false> | null = isPostgresConfigured
  ? neon(process.env.POSTGRES_URL!)
  : null;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return isPostgresConfigured && sql !== null;
}

// Log warning in development if not configured
if (!isPostgresConfigured && process.env.NODE_ENV === 'development') {
  console.warn(
    '⚠️  POSTGRES_URL not configured. Neon database connection not initialized. TripMatch features will be unavailable.'
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
