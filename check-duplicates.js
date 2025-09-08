require('dotenv').config();
const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function checkDuplicates() {
  console.log('🔍 CHECKING HOW MANY CONTACTS ARE ALREADY IN DATABASE...\n');
  
  try {
    // Read our CSV file
    const content = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-only.csv', 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    let stats = {
      total: lines.length - 1,
      alreadyExists: 0,
      newContacts: 0,
      invalid: 0
    };
    
    console.log(`📋 Checking ${stats.total} contacts from CSV...`);
    
    // Helper function to validate email
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && 
             !email.includes('2222') && 
             !email.match(/^[A-Z\s]+$/) && 
             email.length < 60 && 
             !email.includes(' ');
    }
    
    let newEmails = [];
    let duplicateEmails = [];
    
    // Check each email in batches for better performance
    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split(',');
      if (fields.length >= 2) {
        const email = fields[1].replace(/"/g, '').trim();
        
        if (!email || !isValidEmail(email)) {
          stats.invalid++;
          continue;
        }
        
        // Check if exists in database
        const existing = await sql`SELECT id FROM email_contacts WHERE email = ${email.toLowerCase()}`;
        
        if (existing.rows.length > 0) {
          stats.alreadyExists++;
          duplicateEmails.push(email);
        } else {
          stats.newContacts++;
          if (newEmails.length < 10) {
            newEmails.push(email);
          }
        }
        
        // Progress indicator
        if (i % 100 === 0) {
          console.log(`   Progress: ${i}/${stats.total} (${((i/stats.total)*100).toFixed(1)}%)`);
        }
      }
    }
    
    console.log('\n📊 RESULTS:');
    console.log(`✅ Total contacts analyzed: ${stats.total}`);
    console.log(`🔄 Already in database: ${stats.alreadyExists} (${(stats.alreadyExists/stats.total*100).toFixed(1)}%)`);
    console.log(`🆕 New contacts: ${stats.newContacts} (${(stats.newContacts/stats.total*100).toFixed(1)}%)`);
    console.log(`❌ Invalid emails: ${stats.invalid} (${(stats.invalid/stats.total*100).toFixed(1)}%)`);
    
    if (newEmails.length > 0) {
      console.log('\n🆕 SAMPLE NEW EMAILS:');
      newEmails.forEach(email => console.log(`   ${email}`));
    }
    
    if (duplicateEmails.length > 0 && stats.newContacts === 0) {
      console.log('\n🎉 GREAT NEWS: ALL YOUR CONTACTS ARE ALREADY IMPORTED!');
      console.log('   Your email marketing database is ready to use.');
    } else if (stats.newContacts > 0) {
      console.log(`\n🚀 READY TO IMPORT ${stats.newContacts} NEW CONTACTS!`);
    }
    
    // Check total in database
    const totalInDb = await sql`SELECT COUNT(*) as total FROM email_contacts`;
    console.log(`\n📊 Total contacts currently in database: ${totalInDb.rows[0].total.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error checking duplicates:', error.message);
  }
}

checkDuplicates();