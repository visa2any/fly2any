require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function checkCampaignsTable() {
  console.log('🔍 Checking email_campaigns table structure...\n');
  
  try {
    // Get table structure
    const structure = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'email_campaigns'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 email_campaigns Table structure:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    
    // Count existing campaigns
    const count = await sql`SELECT COUNT(*) as total FROM email_campaigns`;
    console.log(`\n📊 Total campaigns: ${count.rows[0].total}`);
    
    // Sample campaign
    const sample = await sql`SELECT * FROM email_campaigns LIMIT 1`;
    if (sample.rows.length > 0) {
      console.log('\n📝 Sample campaign:');
      console.log(JSON.stringify(sample.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  }
}

checkCampaignsTable();