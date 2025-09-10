#!/usr/bin/env node

/**
 * Fix Schema Mismatch and Customer Linking
 * 
 * This script fixes the data type mismatch between customers.id (integer) 
 * and email_contacts.customer_id (text), then properly links all contacts.
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔧 Fixing Schema Mismatch and Customer Linking...');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('📊 Analyzing schema mismatch...');
    
    // Check current schema
    const contactsSchema = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'email_contacts' AND column_name = 'customer_id'
    `);
    
    const customersSchema = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers' AND column_name = 'id'
    `);
    
    console.log(`   📋 email_contacts.customer_id: ${contactsSchema.rows[0]?.data_type || 'not found'}`);
    console.log(`   📋 customers.id: ${customersSchema.rows[0]?.data_type || 'not found'}`);
    
    // Count current state
    const totalContacts = await pool.query('SELECT COUNT(*) as count FROM email_contacts');
    const totalCustomers = await pool.query('SELECT COUNT(*) as count FROM customers');
    const linkedContacts = await pool.query(`
      SELECT COUNT(*) as count FROM email_contacts 
      WHERE customer_id IS NOT NULL AND customer_id != ''
    `);
    
    console.log(`   📧 Total contacts: ${totalContacts.rows[0].count}`);
    console.log(`   👥 Total customers: ${totalCustomers.rows[0].count}`);
    console.log(`   🔗 Linked contacts: ${linkedContacts.rows[0].count}`);
    
    console.log('🔄 Step 1: Creating customer records from email contacts...');
    
    // Get all contacts that need customer records
    const unlinkedContacts = await pool.query(`
      SELECT id, email, first_name, last_name, created_at, custom_fields
      FROM email_contacts 
      WHERE customer_id IS NULL OR customer_id = ''
      ORDER BY created_at
    `);
    
    console.log(`   📋 Processing ${unlinkedContacts.rows.length} unlinked contacts...`);
    
    let createdCustomers = 0;
    let linkedContacts_new = 0;
    let duplicatesFound = 0;
    
    for (let i = 0; i < unlinkedContacts.rows.length; i++) {
      const contact = unlinkedContacts.rows[i];
      
      try {
        // Check if customer already exists by email (case insensitive)
        const existingCustomer = await pool.query(
          'SELECT id FROM customers WHERE LOWER(email) = LOWER($1) LIMIT 1',
          [contact.email]
        );
        
        let customerId;
        
        if (existingCustomer.rows.length > 0) {
          // Use existing customer ID (convert integer to string)
          customerId = existingCustomer.rows[0].id.toString();
          duplicatesFound++;
        } else {
          // Parse custom fields for additional data
          let customFields = {};
          try {
            customFields = JSON.parse(contact.custom_fields || '{}');
          } catch (e) {
            customFields = {};
          }
          
          // Create new customer record
          const newCustomerResult = await pool.query(`
            INSERT INTO customers (
              email, nome, telefone, status, receber_promocoes,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
          `, [
            contact.email,
            contact.first_name || contact.last_name || 'Cliente',
            customFields.telefone || null,
            customFields.segmento || 'geral', 
            true,
            contact.created_at || new Date().toISOString(),
            new Date().toISOString()
          ]);
          
          customerId = newCustomerResult.rows[0].id.toString();
          createdCustomers++;
        }
        
        // Link contact to customer (using string ID)
        await pool.query(
          'UPDATE email_contacts SET customer_id = $1, updated_at = $2 WHERE id = $3',
          [customerId, new Date().toISOString(), contact.id]
        );
        
        linkedContacts_new++;
        
        if (linkedContacts_new % 100 === 0) {
          console.log(`   📈 Progress: ${linkedContacts_new}/${unlinkedContacts.rows.length} contacts processed...`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing contact ${contact.email}: ${error.message}`);
      }
    }
    
    console.log('✅ Customer creation and linking completed!');
    console.log(`   👥 Created ${createdCustomers} new customer records`);
    console.log(`   🔄 Found ${duplicatesFound} existing customers`);
    console.log(`   🔗 Linked ${linkedContacts_new} contacts to customers`);
    
    // Step 2: Verify the fix
    console.log('🔍 Verifying the fix...');
    
    const finalStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM email_contacts) as total_contacts,
        (SELECT COUNT(*) FROM customers) as total_customers,
        (SELECT COUNT(*) FROM email_contacts WHERE customer_id IS NOT NULL AND customer_id != '') as linked_contacts,
        (SELECT COUNT(*) FROM email_contacts WHERE customer_id IS NULL OR customer_id = '') as unlinked_contacts
    `);
    
    const stats = finalStats.rows[0];
    console.log(`   📧 Total contacts: ${stats.total_contacts}`);
    console.log(`   👥 Total customers: ${stats.total_customers}`);
    console.log(`   🔗 Linked contacts: ${stats.linked_contacts}`);
    console.log(`   ❌ Unlinked contacts: ${stats.unlinked_contacts}`);
    
    // Verify data integrity
    const integrityCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM email_contacts ec
      LEFT JOIN customers c ON ec.customer_id::integer = c.id
      WHERE ec.customer_id IS NOT NULL AND ec.customer_id != '' AND c.id IS NULL
    `);
    
    const brokenLinks = parseInt(integrityCheck.rows[0].count);
    console.log(`   🔍 Broken links (customer_id points to non-existent customer): ${brokenLinks}`);
    
    if (stats.unlinked_contacts == 0 && brokenLinks == 0) {
      console.log('🎉 SUCCESS: All contacts are properly linked to valid customers!');
      
      // Show sample linked data
      const sampleResult = await pool.query(`
        SELECT ec.email, ec.customer_id, c.nome as customer_name
        FROM email_contacts ec
        JOIN customers c ON ec.customer_id::integer = c.id
        LIMIT 5
      `);
      
      console.log('📋 Sample linked records:');
      sampleResult.rows.forEach(record => {
        console.log(`   - ${record.email} → Customer ${record.customer_id} (${record.customer_name})`);
      });
      
    } else {
      console.log('⚠️  Some issues remain - may need manual review');
    }
    
  } catch (error) {
    console.error('💥 Fix failed:', error);
  } finally {
    await pool.end();
  }
}

main();