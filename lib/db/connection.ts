import postgres from 'postgres';

// Use PRISMA URL which has ?pgbouncer=true for connection pooling
const dbUrl = process.env.SUPABASE_POSTGRES_PRISMA_URL ||
              process.env.SUPABASE_POSTGRES_URL ||
              process.env.POSTGRES_URL ||
              process.env.DATABASE_URL;

const isPostgresConfigured = !!(
  dbUrl && !dbUrl.includes('placeholder') && !dbUrl.includes('localhost')
);

const sql = isPostgresConfigured
  ? postgres(dbUrl!, {
      ssl: 'require',
      max: 1,
      idle_timeout: 0,
      connect_timeout: 30,    // Increased for cold starts
      prepare: false,         // Required for PgBouncer
      fetch_types: false,
      transform: {
        undefined: null,      // Handle undefined values
      },
    })
  : null;

export function isDatabaseAvailable(): boolean {
  return isPostgresConfigured;
}

export { sql };
