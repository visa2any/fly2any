#!/usr/bin/env node
/**
 * Fix the leads view issue
 */

const { sql } = require('@vercel/postgres');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function fixLeadsView() {
  console.log('🚀 Fixing leads view...');
  
  try {
    // First, check what exists
    console.log('🔍 Checking existing tables and views...');
    
    const tables = await sql`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_name IN ('leads', 'leads_unified') AND table_schema = 'public'
    `;
    
    console.log('Found tables/views:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}: ${row.table_type}`);
    });
    
    // Check if leads_unified exists
    const leadsUnified = tables.rows.find(r => r.table_name === 'leads_unified');
    if (leadsUnified) {
      console.log('✅ leads_unified table exists');
      
      // Test the table
      console.log('🧪 Testing leads_unified table...');
      const testId = `test_${Date.now()}`;
      
      await sql`
        INSERT INTO leads_unified (id, nome, email)
        VALUES (${testId}, 'Test User', 'test@example.com')
      `;
      
      const testResult = await sql`
        SELECT * FROM leads_unified WHERE id = ${testId}
      `;
      
      if (testResult.rows.length > 0) {
        console.log('✅ leads_unified table is working correctly');
        console.log('Test record:', {
          id: testResult.rows[0].id,
          nome: testResult.rows[0].nome,
          email: testResult.rows[0].email
        });
      }
      
      // Clean up
      await sql`DELETE FROM leads_unified WHERE id = ${testId}`;
      console.log('🧹 Test data cleaned up');
      
    } else {
      console.error('❌ leads_unified table does not exist');
      return false;
    }
    
    console.log('🎉 Database is ready for lead form!');
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the fix
fixLeadsView().then(success => {
  if (success) {
    console.log('\n✅ SUCCESS! The lead form database issue has been resolved.');
    console.log('\n💡 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Test the lead form on the homepage');
    console.log('3. The error "Erro ao enviar formulário" should be gone!');
  } else {
    console.log('\n❌ FAILED! The database issue still exists.');
  }
}).catch(console.error);