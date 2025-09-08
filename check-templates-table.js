require('dotenv').config();
const { sql } = require('@vercel/postgres');

async function checkTemplatesTable() {
  console.log('📋 CHECKING EMAIL_TEMPLATES TABLE\n');
  
  try {
    // Check table structure
    console.log('🏗️ Table Structure:');
    const structure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'email_templates'
      ORDER BY ordinal_position
    `;
    
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Count templates
    const count = await sql`SELECT COUNT(*) as total FROM email_templates`;
    console.log(`\n📊 Total Templates: ${count.rows[0].total}`);
    
    // Show all templates if any exist
    const templates = await sql`SELECT * FROM email_templates ORDER BY created_at DESC`;
    
    if (templates.rows.length > 0) {
      console.log('\n🎨 Templates in Database:');
      templates.rows.forEach(template => {
        console.log(`\n📄 ${template.name || 'Unnamed Template'}`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Category: ${template.category || 'N/A'}`);
        console.log(`   Description: ${template.description || 'N/A'}`);
        console.log(`   Industry: ${template.industry || 'N/A'}`);
        console.log(`   Rating: ${template.rating || 'N/A'}`);
        console.log(`   Downloads: ${template.downloads || 0}`);
        console.log(`   HTML Length: ${template.html_content ? template.html_content.length : 0} chars`);
        console.log(`   Variables: ${template.template_variables || 'N/A'}`);
        console.log(`   Created: ${template.created_at ? new Date(template.created_at).toLocaleDateString() : 'N/A'}`);
      });
    } else {
      console.log('\n📝 No templates found in database');
      console.log('   The table exists but is empty');
      console.log('   This means we can populate it with the default templates from the code');
    }
    
  } catch (error) {
    console.error('❌ Error checking templates table:', error.message);
  }
}

checkTemplatesTable();