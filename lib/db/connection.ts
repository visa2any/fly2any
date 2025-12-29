import postgres from 'postgres';

// Get database URL (Supabase or legacy)
const dbUrl = process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Check if database is configured
const isPostgresConfigured = !!(
  dbUrl &&
  !dbUrl.includes('placeholder') &&
  !dbUrl.includes('localhost')
);

// Supabase-optimized connection for serverless
// Using connection per request (no pooling on our side - Supabase handles it via PgBouncer)
const sql = isPostgresConfigured
  ? postgres(dbUrl!, {
      ssl: { rejectUnauthorized: false },
      max: 1,                // Single connection per function instance
      idle_timeout: 0,       // Don't keep idle connections
      connect_timeout: 15,   // 15s to connect
      prepare: false,        // Required for PgBouncer/Supabase
      connection: {
        application_name: 'fly2any-serverless',
      },
    })
  : null;

export function isDatabaseAvailable(): boolean {
  return isPostgresConfigured && sql !== null;
}

if (!isPostgresConfigured && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Database URL not configured.');
}

export { sql };
