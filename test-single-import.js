require('dotenv').config();
const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function testSingleImport() {
  console.log('🧪 Testing single contact import...');
  
  try {
    // Read one line from the CSV
    const content = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-only.csv', 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Get the first contact (skip header)
    const fields = lines[1].split(',');
    const email = fields[1].replace(/"/g, '').trim();
    const rawName = fields[0].replace(/"/g, '').trim();
    const phone = fields[2] ? fields[2].replace(/"/g, '').trim() : '';
    const segment = fields[3] ? fields[3].replace(/"/g, '').trim() : 'brasileiros-eua';
    
    console.log('📧 Test contact:');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${rawName}`);
    console.log(`   Phone: ${phone}`);
    console.log(`   Segment: ${segment}`);
    
    // Check if it already exists
    console.log('\n🔍 Checking for duplicates...');
    const existing = await sql`SELECT id, email FROM email_contacts WHERE email = ${email}`;
    
    if (existing.rows.length > 0) {
      console.log(`❌ Contact already exists with ID: ${existing.rows[0].id}`);
      return;
    }
    
    console.log('✅ Contact is new, attempting import...');
    
    // Prepare contact data
    const firstName = rawName.split(' ')[0] || '';
    const lastName = rawName.split(' ').slice(1).join(' ') || '';
    const contactId = `contact_${Date.now()}_test`;
    const tags = JSON.stringify([segment, 'imported', 'test']);
    
    // Insert contact
    const result = await sql`
      INSERT INTO email_contacts (
        id, email, nome, sobrenome, telefone,
        segmento, email_status, tags, status,
        created_at, updated_at
      ) VALUES (
        ${contactId},
        ${email.toLowerCase()},
        ${firstName},
        ${lastName},
        ${phone},
        ${segment},
        'active',
        ${tags},
        'active',
        ${new Date().toISOString()},
        ${new Date().toISOString()}
      )
      RETURNING id, email
    `;
    
    console.log('✅ Contact imported successfully!');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Email: ${result.rows[0].email}`);
    
    // Verify it exists
    const verify = await sql`SELECT COUNT(*) as total FROM email_contacts WHERE email = ${email}`;
    console.log(`\n📊 Verification: ${verify.rows[0].total} contact(s) with this email`);
    
  } catch (error) {
    console.error('❌ Error during test import:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testSingleImport();