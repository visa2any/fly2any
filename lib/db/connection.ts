import postgres from 'postgres';

// Build the correct URL with serverless parameters
function buildConnectionUrl(): string | undefined {
  const baseUrl = process.env.SUPABASE_POSTGRES_PRISMA_URL ||
                  process.env.SUPABASE_POSTGRES_URL ||
                  process.env.POSTGRES_URL ||
                  process.env.DATABASE_URL;

  if (!baseUrl || baseUrl.includes('placeholder') || baseUrl.includes('localhost')) {
    return undefined;
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connection_limit', '1');
    return url.toString();
  } catch {
    return baseUrl;
  }
}

const dbUrl = buildConnectionUrl();
const isPostgresConfigured = !!dbUrl;

const sql = isPostgresConfigured
  ? postgres(dbUrl!, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 30,
      prepare: false,  // Required for PgBouncer
    })
  : null;

export function isDatabaseAvailable(): boolean {
  return isPostgresConfigured;
}

export { sql };
