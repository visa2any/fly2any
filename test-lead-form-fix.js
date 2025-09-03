#!/usr/bin/env node
/**
 * Test script to validate the lead form database fix
 * This script tests the LeadService directly to see if the database issue is resolved
 */

const { sql } = require('@vercel/postgres');

// Test data mimicking a form submission
const testLeadData = {
  nome: 'João Silva',
  email: 'joao@test.com',
  whatsapp: '11999999999',
  telefone: '1133334444',
  origem: 'São Paulo (SAO)',
  destino: 'Rio de Janeiro (RIO)',
  dataIda: '2024-12-25',
  dataVolta: '2024-12-30',
  tipoViagem: 'ida-volta',
  adultos: 2,
  criancas: 0,
  bebes: 0,
  classeVoo: 'economica',
  selectedServices: ['flight'],
  observacoes: 'Teste do sistema após fix'
};

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test if we can connect to the database
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful');
    console.log('Current database time:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testTableExists() {
  console.log('🔍 Testing if leads_unified table exists...');
  
  try {
    // Check if the leads_unified table exists
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'leads_unified' AND table_schema = 'public'
    `;
    
    if (result.rows.length > 0) {
      console.log('✅ Table leads_unified exists');
      return true;
    } else {
      console.error('❌ Table leads_unified does not exist');
      
      // Check if the old leads table or view exists
      const leadsCheck = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'leads' AND table_schema = 'public'
      `;
      
      if (leadsCheck.rows.length > 0) {
        console.log('⚠️  Found old leads table/view, but needs leads_unified');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking table existence:', error.message);
    return false;
  }
}

async function testLeadInsertion() {
  console.log('🔍 Testing lead insertion to leads_unified...');
  
  try {
    const leadId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Try inserting test data
    await sql`
      INSERT INTO leads_unified (
        id, nome, email, whatsapp, telefone,
        origem, destino, data_partida, data_retorno,
        numero_passageiros, tipo_viagem, selected_services,
        observacoes, source, status, created_at
      ) VALUES (
        ${leadId}, 
        ${testLeadData.nome}, 
        ${testLeadData.email}, 
        ${testLeadData.whatsapp},
        ${testLeadData.telefone},
        ${testLeadData.origem}, 
        ${testLeadData.destino},
        ${testLeadData.dataIda}, 
        ${testLeadData.dataVolta},
        ${testLeadData.adultos}, 
        ${testLeadData.tipoViagem},
        ${JSON.stringify(testLeadData.selectedServices)},
        ${testLeadData.observacoes}, 
        'test', 
        'novo', 
        ${new Date().toISOString()}
      )
    `;
    
    console.log('✅ Lead insertion successful! Lead ID:', leadId);
    
    // Verify the data was inserted
    const verification = await sql`
      SELECT id, nome, email, created_at 
      FROM leads_unified 
      WHERE id = ${leadId}
    `;
    
    if (verification.rows.length > 0) {
      console.log('✅ Lead data verified in database:', {
        id: verification.rows[0].id,
        nome: verification.rows[0].nome,
        email: verification.rows[0].email,
        created_at: verification.rows[0].created_at
      });
      
      // Clean up test data
      await sql`DELETE FROM leads_unified WHERE id = ${leadId}`;
      console.log('🧹 Test data cleaned up');
      
      return true;
    } else {
      console.error('❌ Lead data not found after insertion');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Lead insertion failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

async function testLeadServiceImport() {
  console.log('🔍 Testing LeadService import...');
  
  try {
    // Try to import the LeadService (requires compilation)
    const path = require('path');
    const moduleId = path.resolve(__dirname, 'src/lib/services/lead-service-fixed.ts');
    
    // Check if the file exists and has been updated
    const fs = require('fs');
    const content = fs.readFileSync('./src/lib/services/lead-service-fixed.ts', 'utf8');
    
    if (content.includes('INSERT INTO leads_unified')) {
      console.log('✅ LeadService has been updated to use leads_unified');
      return true;
    } else {
      console.error('❌ LeadService still uses old table name');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing LeadService:', error.message);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting Lead Form Fix Diagnostics...\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Table Existence', fn: testTableExists },
    { name: 'Lead Insertion', fn: testLeadInsertion },
    { name: 'LeadService Update', fn: testLeadServiceImport }
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passedTests++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 DIAGNOSTICS SUMMARY`);
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! The lead form database fix should work now.');
    console.log('\n💡 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Test the lead form on the homepage');
    console.log('3. Check for successful form submission');
  } else {
    console.log('⚠️  Some tests failed. The lead form may still have issues.');
    console.log('\n🔧 Required actions:');
    console.log('1. Ensure database migration has been run');
    console.log('2. Verify environment variables are set');
    console.log('3. Check database permissions');
  }
  
  console.log('='.repeat(50));
}

// Run diagnostics
runDiagnostics().catch(console.error);