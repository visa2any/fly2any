#!/usr/bin/env node
/**
 * Run the leads_unified table migration
 */

const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Running leads_unified table migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'src/lib/migrations/001-unified-leads-schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded:', migrationPath);
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await sql.query(statement);
          console.log(`✅ Statement ${i + 1} completed`);
        } catch (error) {
          // Some statements might fail safely (like CREATE IF NOT EXISTS)
          if (error.code === '42P07' || error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
          }
        }
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the table exists
    console.log('🔍 Verifying table creation...');
    const verification = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'leads_unified' AND table_schema = 'public'
    `;
    
    if (verification.rows.length > 0) {
      console.log('✅ Table leads_unified verified successfully');
      
      // Show table structure
      const tableInfo = await sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'leads_unified' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      console.log('📋 Table structure:');
      tableInfo.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      
    } else {
      console.error('❌ Table leads_unified was not created');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});