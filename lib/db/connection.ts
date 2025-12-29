import postgres from 'postgres';

// Get database URL (Supabase or legacy Neon)
const dbUrl = process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Check if database is configured (and not a placeholder)
const isPostgresConfigured = !!(
  dbUrl &&
  !dbUrl.includes('placeholder') &&
  !dbUrl.includes('localhost')
);

// Create connection with serverless-optimized settings
// Connection is created lazily by postgres package on first query
const sql = isPostgresConfigured
  ? postgres(dbUrl!, {
      ssl: 'require',
      max: 3,              // Reduced for serverless (Vercel limit)
      idle_timeout: 10,    // Close idle faster
      connect_timeout: 10, // 10s timeout (was 30s)
      max_lifetime: 60,    // Recycle after 1 min
      prepare: false,      // Disable prepared statements (PgBouncer compat)
    })
  : null;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return isPostgresConfigured && sql !== null;
}

// Log warning in development if not configured
if (!isPostgresConfigured && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Database URL not configured.');
}

export { sql };
