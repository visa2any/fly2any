#!/usr/bin/env node

/**
 * Fix Customer Linking for Email Marketing V2
 * 
 * This script fixes the customer linking in the V2 system where
 * contacts exist but aren't properly linked to customer records.
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔧 Fixing Customer Linking in Email Marketing V2...');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('📊 Analyzing current state...');
    
    // Check contacts without customer linking
    const unlinkedContactsResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM email_contacts 
      WHERE customer_id IS NULL OR customer_id NOT IN (SELECT id FROM customers)
    `);
    
    const unlinkedCount = parseInt(unlinkedContactsResult.rows[0].count);
    console.log(`   📧 Contacts without valid customer link: ${unlinkedCount}`);
    
    // Check total customers
    const customersResult = await pool.query('SELECT COUNT(*) as count FROM customers');
    const customerCount = parseInt(customersResult.rows[0].count);
    console.log(`   👥 Total customers: ${customerCount}`);
    
    if (unlinkedCount === 0) {
      console.log('✅ All contacts are properly linked to customers!');
      return;
    }
    
    console.log('🔄 Creating customer records for unlinked contacts...');
    
    // Get all contacts that need customer records
    const unlinkedContacts = await pool.query(`
      SELECT id, email, first_name, created_at, custom_fields
      FROM email_contacts 
      WHERE customer_id IS NULL OR customer_id NOT IN (SELECT id FROM customers)
      ORDER BY created_at
      LIMIT 5000
    `);
    
    console.log(`   📋 Processing ${unlinkedContacts.rows.length} contacts...`);
    
    let createdCustomers = 0;
    let linkedContacts = 0;
    
    for (let i = 0; i < unlinkedContacts.rows.length; i++) {
      const contact = unlinkedContacts.rows[i];
      
      try {
        // Check if customer already exists by email
        const existingCustomer = await pool.query(
          'SELECT id FROM customers WHERE LOWER(email) = LOWER($1) LIMIT 1',
          [contact.email]
        );
        
        let customerId;
        
        if (existingCustomer.rows.length > 0) {
          customerId = existingCustomer.rows[0].id;
        } else {
          // Create new customer
          customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Parse custom fields for additional data
          let customFields = {};
          try {
            customFields = JSON.parse(contact.custom_fields || '{}');
          } catch (e) {
            customFields = {};
          }
          
          await pool.query(`
            INSERT INTO customers (
              id, email, nome, telefone, status, receber_promocoes,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            customerId,
            contact.email,
            contact.first_name || 'Cliente',
            customFields.telefone || null,
            customFields.segmento || 'geral',
            true,
            contact.created_at,
            new Date().toISOString()
          ]);
          
          createdCustomers++;
        }
        
        // Link contact to customer
        await pool.query(
          'UPDATE email_contacts SET customer_id = $1, updated_at = $2 WHERE id = $3',
          [customerId, new Date().toISOString(), contact.id]
        );
        
        linkedContacts++;
        
        if (linkedContacts % 100 === 0) {
          console.log(`   📈 Progress: ${linkedContacts}/${unlinkedContacts.rows.length} contacts linked...`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing contact ${contact.email}: ${error.message}`);
      }
    }
    
    console.log('✅ Customer linking completed!');
    console.log(`   👥 Created ${createdCustomers} new customer records`);
    console.log(`   🔗 Linked ${linkedContacts} contacts to customers`);
    
    // Verify the fix
    console.log('🔍 Verifying fix...');
    
    const finalUnlinkedResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM email_contacts 
      WHERE customer_id IS NULL OR customer_id NOT IN (SELECT id FROM customers)
    `);
    
    const finalUnlinkedCount = parseInt(finalUnlinkedResult.rows[0].count);
    console.log(`   📧 Remaining unlinked contacts: ${finalUnlinkedCount}`);
    
    const finalCustomerCount = await pool.query('SELECT COUNT(*) as count FROM customers');
    const finalCustomerTotal = parseInt(finalCustomerCount.rows[0].count);
    console.log(`   👥 Total customers now: ${finalCustomerTotal}`);
    
    if (finalUnlinkedCount === 0) {
      console.log('🎉 All contacts are now properly linked to customers!');
    } else {
      console.log('⚠️  Some contacts still need linking - may need manual review');
    }
    
  } catch (error) {
    console.error('💥 Fix failed:', error);
  } finally {
    await pool.end();
  }
}

main();