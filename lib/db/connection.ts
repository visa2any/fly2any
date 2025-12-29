import postgres, { type Sql } from 'postgres';

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

// LAZY CONNECTION: Don't connect at module load time
// This prevents blocking cold starts for API routes that import this module
// but don't actually use the database (like flight search)
let _sql: Sql | null = null;
let _connectionAttempted = false;

/**
 * Get the database connection (lazy initialization)
 * Connection is only established on first call, not at module import
 */
export function getSql(): Sql | null {
  if (_connectionAttempted) {
    return _sql;
  }

  _connectionAttempted = true;
  const dbUrl = buildConnectionUrl();

  if (!dbUrl) {
    return null;
  }

  _sql = postgres(dbUrl, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30,
    prepare: false,  // Required for PgBouncer
  });

  return _sql;
}

// Legacy export - kept for backwards compatibility
// NOTE: This is null at import time but getSql() provides the actual connection
// Files that need DB access should use getSql() for lazy loading
export const sql: Sql | null = null;

export function isDatabaseAvailable(): boolean {
  const dbUrl = buildConnectionUrl();
  return !!dbUrl;
}
