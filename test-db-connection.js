require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
  
  try {
    // Test basic connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    
    // Check if email_contacts table exists
    const tableCheck = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'email_contacts'
    `;
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ email_contacts table exists');
      
      // Get table structure
      const structure = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'email_contacts'
        ORDER BY ordinal_position
      `;
      
      console.log('\n📋 Table structure:');
      structure.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type}`);
      });
      
      // Count existing contacts
      const count = await sql`SELECT COUNT(*) as total FROM email_contacts`;
      console.log(`\n📊 Existing contacts: ${count.rows[0].total}`);
      
    } else {
      console.log('❌ email_contacts table does NOT exist');
      
      // Let's see what tables exist
      const allTables = await sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      console.log('\n📋 Available tables:');
      allTables.rows.forEach(table => {
        console.log(`   ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

testConnection();