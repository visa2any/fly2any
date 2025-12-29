#!/usr/bin/env node

// TripMatch Database Migration Script
// Run with: node migrate-db.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting TripMatch database migration...\n');

  // Check for database URL (Supabase, Neon, or legacy Vercel Postgres)
  const DATABASE_URL = process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('❌ Database URL not found!');
    console.error('   Make sure you have a .env.local file with one of these set:');
    console.error('   - SUPABASE_POSTGRES_URL (Supabase via Vercel)');
    console.error('   - POSTGRES_URL (Neon/Vercel Postgres)');
    console.error('   - DATABASE_URL (legacy)');
    process.exit(1);
  }

  console.log('📡 Connecting to database...');
  const sql = neon(DATABASE_URL);

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'lib', 'db', 'migrations', '001_tripmatch_schema.sql');
    console.log('📖 Reading schema file...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the entire schema as one transaction
    // This preserves the correct order and handles dependencies automatically
    console.log(`📝 Executing schema...  \n`);

    try {
      // Create array-like object for tagged template literal
      const sqlTemplate = [schema];
      sqlTemplate.raw = sqlTemplate;
      await sql(sqlTemplate);
      console.log('✅ Schema executed successfully');
    } catch (error) {
      console.error(`\n❌ Error executing schema:`, error.message);
      // If bulk execution fails, try statement by statement for better error reporting
      console.log('\n🔄 Retrying with individual statements for better error reporting...\n');

      // Parse statements while handling dollar-quoted strings (PostgreSQL functions)
      const rawStatements = [];
      let currentStmt = '';
      let inDollarQuote = false;

      for (const part of schema.split(';')) {
        currentStmt += part;

        // Check if we're entering/exiting a dollar-quoted string ($$)
        const dollarCount = (currentStmt.match(/\$\$/g) || []).length;
        inDollarQuote = dollarCount % 2 !== 0;

        if (!inDollarQuote) {
          rawStatements.push(currentStmt);
          currentStmt = '';
        } else {
          currentStmt += ';'; // Add back the semicolon we split on
        }
      }

      const statements = rawStatements
        .map(s => {
          // Remove comment lines but keep the SQL
          return s.split('\n')
            .filter(line => {
              const trimmed = line.trim();
              return trimmed.length > 0 && !trimmed.startsWith('--');
            })
            .join('\n')
            .trim();
        })
        .filter(s => s.length > 5);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];

        const tableMatch = statement.match(/CREATE TABLE.*IF NOT EXISTS\s+(\w+)/i);
        const indexMatch = statement.match(/CREATE INDEX.*\s+(\w+)\s+ON/i);

        let logMsg = `[${i + 1}/${statements.length}]`;
        if (tableMatch) {
          logMsg += ` Creating table: ${tableMatch[1]}`;
        } else if (indexMatch) {
          logMsg += ` Creating index: ${indexMatch[1]}`;
        } else {
          logMsg += ` Executing statement`;
        }

        console.log(logMsg);

        try {
          const sqlTemplate = [statement + ';'];
          sqlTemplate.raw = sqlTemplate;
          await sql(sqlTemplate);
        } catch (err) {
          // Skip "already exists" errors (indexes, tables with IF NOT EXISTS)
          if (err.message.includes('already exists')) {
            console.log('   ⚠️  Already exists, skipping...');
            continue;
          }
          console.error(`\n❌ Failed at statement ${i + 1}:`, err.message);
          console.error('Statement:', statement.substring(0, 200) + '...');
          throw err;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('🎉 All TripMatch database tables are now ready.\n');
    console.log('You can now:');
    console.log('  - Browse trips at /home-new');
    console.log('  - View trip details without 500 errors');
    console.log('  - Use all TripMatch features\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check DATABASE_URL is correct in .env.local');
    console.error('  2. Verify database user has CREATE TABLE permissions');
    console.error('  3. Try running the SQL manually in Neon Console\n');
    process.exit(1);
  }
}

runMigration();
