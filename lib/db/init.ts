import { sql } from './connection';
import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

/**
 * Initialize database schema
 * This function reads the schema.sql file and executes it
 */
export async function initDatabase() {
  try {
    const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    for (const statement of statements) {
      try {
        // Use sql.query for raw SQL statements (Neon v3+ syntax)
        await (sql as any).query(statement);
      } catch (err: any) {
        // Skip errors for already existing objects
        if (!err.message?.includes('already exists')) {
          console.warn('SQL statement warning:', err.message);
        }
      }
    }

    console.log('Database schema initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Check if database is properly initialized
 */
export async function checkDatabase() {
  if (!sql) {
    throw new Error('Database not configured');
  }

  try {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    return {
      success: true,
      tables: result.map((r: any) => r.table_name),
    };
  } catch (error) {
    console.error('Error checking database:', error);
    throw error;
  }
}
