#!/usr/bin/env node

/**
 * Email Marketing V2 Migration Status Checker
 * 
 * This script checks the current state of both legacy and V2 systems
 * to understand what needs to be migrated.
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Checking Email Marketing Migration Status...');
console.log('');

async function checkLegacySystem() {
  console.log('📊 LEGACY SYSTEM (pg Pool) STATUS:');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    // Check if legacy tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('email_contacts', 'email_campaigns', 'email_sends')
      ORDER BY table_name
    `);
    
    console.log(`   Tables found: ${tablesResult.rows.map(r => r.table_name).join(', ')}`);
    
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  No legacy email marketing tables found');
      return { contacts: 0, campaigns: 0, sends: 0, hasData: false };
    }
    
    let contactCount = 0, campaignCount = 0, sendCount = 0;
    
    // Count contacts
    if (tablesResult.rows.some(r => r.table_name === 'email_contacts')) {
      try {
        const contactsResult = await pool.query('SELECT COUNT(*) as count FROM email_contacts');
        contactCount = parseInt(contactsResult.rows[0].count);
        console.log(`   📧 Contacts: ${contactCount}`);
        
        // Show sample contact data
        if (contactCount > 0) {
          const sampleResult = await pool.query('SELECT email, status, created_at FROM email_contacts LIMIT 3');
          console.log('   📋 Sample contacts:');
          sampleResult.rows.forEach(contact => {
            console.log(`      - ${contact.email} (${contact.status}) - ${contact.created_at}`);
          });
        }
      } catch (err) {
        console.log(`   ❌ Error counting contacts: ${err.message}`);
      }
    }
    
    // Count campaigns
    if (tablesResult.rows.some(r => r.table_name === 'email_campaigns')) {
      try {
        const campaignsResult = await pool.query('SELECT COUNT(*) as count FROM email_campaigns');
        campaignCount = parseInt(campaignsResult.rows[0].count);
        console.log(`   📮 Campaigns: ${campaignCount}`);
        
        // Show sample campaign data
        if (campaignCount > 0) {
          const sampleResult = await pool.query('SELECT name, status, created_at FROM email_campaigns LIMIT 3');
          console.log('   📋 Sample campaigns:');
          sampleResult.rows.forEach(campaign => {
            console.log(`      - ${campaign.name} (${campaign.status}) - ${campaign.created_at}`);
          });
        }
      } catch (err) {
        console.log(`   ❌ Error counting campaigns: ${err.message}`);
      }
    }
    
    // Count sends
    if (tablesResult.rows.some(r => r.table_name === 'email_sends')) {
      try {
        const sendsResult = await pool.query('SELECT COUNT(*) as count FROM email_sends');
        sendCount = parseInt(sendsResult.rows[0].count);
        console.log(`   📤 Sends: ${sendCount}`);
      } catch (err) {
        console.log(`   ❌ Error counting sends: ${err.message}`);
      }
    }
    
    await pool.end();
    
    return { 
      contacts: contactCount, 
      campaigns: campaignCount, 
      sends: sendCount, 
      hasData: contactCount > 0 || campaignCount > 0 || sendCount > 0 
    };
    
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    return { contacts: 0, campaigns: 0, sends: 0, hasData: false };
  }
}

async function checkV2System() {
  console.log('');
  console.log('📊 EMAIL MARKETING V2 (@vercel/postgres) STATUS:');
  
  try {
    // Check if POSTGRES_URL is available
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      console.log('   ⚠️  No POSTGRES_URL or DATABASE_URL found in environment');
      return { contacts: 0, campaigns: 0, events: 0, hasData: false };
    }
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    
    // Check if V2 tables exist
    const tablesResult = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('email_contacts', 'email_campaigns', 'email_events', 'customers')
      ORDER BY table_name
    `);
    
    console.log(`   Tables found: ${tablesResult.rows.map(r => `${r.table_name}(${r.column_count} cols)`).join(', ')}`);
    
    let contactCount = 0, campaignCount = 0, eventCount = 0, customerCount = 0;
    
    // Count customers (needed for linking)
    if (tablesResult.rows.some(r => r.table_name === 'customers')) {
      try {
        const customersResult = await pool.query('SELECT COUNT(*) as count FROM customers');
        customerCount = parseInt(customersResult.rows[0].count);
        console.log(`   👥 Customers (for linking): ${customerCount}`);
      } catch (err) {
        console.log(`   ❌ Error counting customers: ${err.message}`);
      }
    }
    
    // Check V2 email_contacts structure
    if (tablesResult.rows.some(r => r.table_name === 'email_contacts')) {
      try {
        // Check if it has V2 structure (customer_id column)
        const structureResult = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'email_contacts' AND table_schema = 'public'
          AND column_name IN ('customer_id', 'email_status', 'engagement_score', 'subscription_date')
          ORDER BY column_name
        `);
        
        const v2Columns = structureResult.rows.map(r => r.column_name);
        const isV2Structure = v2Columns.includes('customer_id');
        
        console.log(`   📧 Email Contacts: V2 structure = ${isV2Structure}`);
        console.log(`   📋 V2 Columns present: ${v2Columns.join(', ')}`);
        
        const contactsResult = await pool.query('SELECT COUNT(*) as count FROM email_contacts');
        contactCount = parseInt(contactsResult.rows[0].count);
        console.log(`   📧 Contacts in V2: ${contactCount}`);
        
        if (contactCount > 0) {
          const sampleResult = await pool.query('SELECT email, email_status, created_at FROM email_contacts LIMIT 3');
          console.log('   📋 Sample V2 contacts:');
          sampleResult.rows.forEach(contact => {
            console.log(`      - ${contact.email} (${contact.email_status || 'no status'}) - ${contact.created_at}`);
          });
        }
        
      } catch (err) {
        console.log(`   ❌ Error checking V2 contacts: ${err.message}`);
      }
    }
    
    // Count V2 campaigns
    if (tablesResult.rows.some(r => r.table_name === 'email_campaigns')) {
      try {
        const campaignsResult = await pool.query('SELECT COUNT(*) as count FROM email_campaigns');
        campaignCount = parseInt(campaignsResult.rows[0].count);
        console.log(`   📮 Campaigns in V2: ${campaignCount}`);
      } catch (err) {
        console.log(`   ❌ Error counting V2 campaigns: ${err.message}`);
      }
    }
    
    // Count V2 events
    if (tablesResult.rows.some(r => r.table_name === 'email_events')) {
      try {
        const eventsResult = await pool.query('SELECT COUNT(*) as count FROM email_events');
        eventCount = parseInt(eventsResult.rows[0].count);
        console.log(`   📊 Events in V2: ${eventCount}`);
      } catch (err) {
        console.log(`   ❌ Error counting V2 events: ${err.message}`);
      }
    }
    
    await pool.end();
    
    return { 
      contacts: contactCount, 
      campaigns: campaignCount, 
      events: eventCount,
      customers: customerCount,
      hasData: contactCount > 0 || campaignCount > 0 || eventCount > 0 
    };
    
  } catch (error) {
    console.log(`   ❌ V2 Connection failed: ${error.message}`);
    return { contacts: 0, campaigns: 0, events: 0, customers: 0, hasData: false };
  }
}

async function main() {
  const legacyStatus = await checkLegacySystem();
  const v2Status = await checkV2System();
  
  console.log('');
  console.log('🎯 MIGRATION ANALYSIS:');
  console.log('='.repeat(50));
  
  if (!legacyStatus.hasData && !v2Status.hasData) {
    console.log('   🆕 No data found in either system - ready for fresh start');
    console.log('   ✅ Recommendation: Use Email Marketing V2 for all new imports');
  } else if (!legacyStatus.hasData && v2Status.hasData) {
    console.log('   ✅ Migration already completed or V2 system in use');
    console.log(`   📊 V2 System has: ${v2Status.contacts} contacts, ${v2Status.campaigns} campaigns`);
    console.log('   🎉 No migration needed - system is ready!');
  } else if (legacyStatus.hasData && !v2Status.hasData) {
    console.log('   🚀 Migration needed from Legacy to V2');
    console.log(`   📊 Legacy data: ${legacyStatus.contacts} contacts, ${legacyStatus.campaigns} campaigns`);
    console.log('   💡 Run migration script to move data to V2 system');
  } else {
    console.log('   🔄 Both systems have data - need to analyze overlap');
    console.log(`   📊 Legacy: ${legacyStatus.contacts} contacts, ${legacyStatus.campaigns} campaigns`);
    console.log(`   📊 V2: ${v2Status.contacts} contacts, ${v2Status.campaigns} campaigns`);
    console.log('   ⚠️  Careful migration needed to avoid duplicates');
  }
  
  console.log('');
  console.log('🔧 SYSTEM STATUS:');
  console.log(`   Database Connection: ${process.env.DATABASE_URL ? '✅ Available' : '❌ Missing'}`);
  console.log(`   Postgres URL: ${process.env.POSTGRES_URL ? '✅ Available' : '❌ Missing'}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log('');
  console.log('✅ Status check complete!');
}

main().catch(error => {
  console.error('💥 Status check failed:', error);
  process.exit(1);
});