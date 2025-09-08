require('dotenv').config();
const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function fastDuplicateCheck() {
  console.log('⚡ FAST DUPLICATE CHECK - BATCH PROCESSING\n');
  
  try {
    // Step 1: Get ALL existing emails from database
    console.log('📊 Loading all existing emails from database...');
    const existingEmails = await sql`SELECT email FROM email_contacts`;
    const existingEmailSet = new Set(existingEmails.rows.map(row => row.email.toLowerCase()));
    
    console.log(`✅ Loaded ${existingEmailSet.size.toLocaleString()} existing emails`);
    
    // Step 2: Read our CSV file
    console.log('\n📋 Reading CSV file...');
    const content = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-only.csv', 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Step 3: Process all CSV emails
    console.log(`📧 Processing ${lines.length - 1} CSV contacts...\n`);
    
    let stats = {
      total: lines.length - 1,
      alreadyExists: 0,
      newContacts: 0,
      invalid: 0
    };
    
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
    
    // Process each line
    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split(',');
      if (fields.length >= 2) {
        const email = fields[1].replace(/"/g, '').trim().toLowerCase();
        
        if (!email || !isValidEmail(email)) {
          stats.invalid++;
          continue;
        }
        
        // Check if exists (super fast in-memory lookup)
        if (existingEmailSet.has(email)) {
          stats.alreadyExists++;
        } else {
          stats.newContacts++;
          if (newEmails.length < 10) {
            newEmails.push(email);
          }
        }
      }
    }
    
    // Results
    console.log('📊 FINAL RESULTS:');
    console.log(`✅ Total contacts analyzed: ${stats.total.toLocaleString()}`);
    console.log(`🔄 Already in database: ${stats.alreadyExists.toLocaleString()} (${(stats.alreadyExists/stats.total*100).toFixed(1)}%)`);
    console.log(`🆕 New contacts: ${stats.newContacts.toLocaleString()} (${(stats.newContacts/stats.total*100).toFixed(1)}%)`);
    console.log(`❌ Invalid emails: ${stats.invalid.toLocaleString()} (${(stats.invalid/stats.total*100).toFixed(1)}%)`);
    
    if (stats.newContacts === 0) {
      console.log('\n🎉 EXCELLENT NEWS: ALL YOUR CONTACTS ARE ALREADY IMPORTED!');
      console.log('✅ Your email marketing database is 100% ready to use.');
      console.log(`📊 Total usable contacts: ${stats.alreadyExists.toLocaleString()} emails`);
    } else if (stats.newContacts > 0) {
      console.log(`\n🚀 READY TO IMPORT ${stats.newContacts.toLocaleString()} NEW CONTACTS!`);
      console.log('\n🆕 SAMPLE NEW EMAILS:');
      newEmails.forEach(email => console.log(`   ${email}`));
    }
    
    // Final database count
    const totalInDb = await sql`SELECT COUNT(*) as total FROM email_contacts`;
    console.log(`\n📊 Total contacts currently in database: ${totalInDb.rows[0].total.toLocaleString()}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 CONCLUSION: YOUR EMAIL MARKETING SYSTEM IS READY!');
    if (stats.newContacts === 0) {
      console.log('   ✅ No import needed - all contacts already in database');
      console.log('   🚀 You can start creating email campaigns immediately!');
    }
    
  } catch (error) {
    console.error('❌ Error in fast duplicate check:', error.message);
  }
}

fastDuplicateCheck();