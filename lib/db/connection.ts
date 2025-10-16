import { neon, neonConfig, NeonQueryFunction } from '@neondatabase/serverless';

// Configure Neon for edge runtime
neonConfig.fetchConnectionCache = true;

const sql: NeonQueryFunction<false, false> = neon(process.env.POSTGRES_URL!);

export { sql };

// Note: Neon serverless uses tagged template literals
// Usage: await sql`SELECT * FROM users WHERE id = ${userId}`
// Not: await sql('SELECT * FROM users WHERE id = $1', [userId])
