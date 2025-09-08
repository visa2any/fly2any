require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function debugStats() {
  console.log('🔍 Debugging Dashboard Stats...\n');
  
  try {
    // Test the exact queries used in getEmailMarketingStats
    console.log('1️⃣ Testing total contacts query...');
    const contactsResult = await sql`
      SELECT COUNT(*) as total 
      FROM email_contacts 
      WHERE email_status = 'active'
    `;
    console.log(`   Total active contacts: ${contactsResult.rows[0].total}`);
    
    console.log('\n2️⃣ Testing segment stats query...');
    const segmentResult = await sql`
      SELECT 
        COALESCE(segmento, 'Sem Segmento') as segment,
        COUNT(*) as count
      FROM email_contacts 
      WHERE email_status = 'active'
      GROUP BY segmento
      ORDER BY count DESC
      LIMIT 5
    `;
    console.log('   Segments found:', segmentResult.rows.length);
    segmentResult.rows.forEach(row => {
      console.log(`     ${row.segment}: ${row.count} contacts`);
    });
    
    console.log('\n3️⃣ Testing all email_contacts...');
    const allContacts = await sql`SELECT COUNT(*) as total FROM email_contacts`;
    console.log(`   All contacts (any status): ${allContacts.rows[0].total}`);
    
    console.log('\n4️⃣ Testing email statuses...');
    const statusBreakdown = await sql`
      SELECT email_status, COUNT(*) as count
      FROM email_contacts 
      GROUP BY email_status
      ORDER BY count DESC
    `;
    console.log('   Status breakdown:');
    statusBreakdown.rows.forEach(row => {
      console.log(`     ${row.email_status}: ${row.count}`);
    });
    
    console.log('\n5️⃣ Sample contacts...');
    const sampleContacts = await sql`
      SELECT email, nome, sobrenome, email_status, segmento 
      FROM email_contacts 
      LIMIT 3
    `;
    console.log('   Sample data:');
    sampleContacts.rows.forEach(row => {
      console.log(`     ${row.nome} ${row.sobrenome} - ${row.email} (${row.email_status}, ${row.segmento})`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugStats();