import postgres from 'postgres';

// Get database URL (Supabase or legacy)
const dbUrl = process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

const isPostgresConfigured = !!(
  dbUrl && !dbUrl.includes('placeholder') && !dbUrl.includes('localhost')
);

// Create connection immediately but postgres package connects lazily on first query
const sql = isPostgresConfigured
  ? postgres(dbUrl!, {
      ssl: { rejectUnauthorized: false },
      max: 1,
      idle_timeout: 0,
      connect_timeout: 10,
      prepare: false,
      fetch_types: false, // Skip type fetching on connect (faster cold start)
    })
  : null;

export function isDatabaseAvailable(): boolean {
  return isPostgresConfigured;
}

export { sql };
