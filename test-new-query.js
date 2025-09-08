require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function testNewQuery() {
  console.log('🧪 Testing Fixed Query...\n');
  
  try {
    // Test the new query
    console.log('1️⃣ Testing new total contacts query...');
    const contactsResult = await sql`
      SELECT COUNT(*) as total 
      FROM email_contacts 
      WHERE email_status NOT IN ('failed', 'bounced', 'unsubscribed', 'complained')
    `;
    console.log(`   Total usable contacts: ${contactsResult.rows[0].total}`);
    
    console.log('\n2️⃣ Testing new segment query...');
    const segmentResult = await sql`
      SELECT 
        COALESCE(segmento, 'Sem Segmento') as segment,
        COUNT(*) as count
      FROM email_contacts 
      WHERE email_status NOT IN ('failed', 'bounced', 'unsubscribed', 'complained')
      GROUP BY segmento
      ORDER BY count DESC
      LIMIT 5
    `;
    console.log(`   Segments found: ${segmentResult.rows.length}`);
    segmentResult.rows.forEach(row => {
      console.log(`     ${row.segment}: ${row.count} contacts`);
    });
    
    console.log('\n✅ Query test complete!');
    
  } catch (error) {
    console.error('❌ Query test failed:', error.message);
  }
}

testNewQuery();